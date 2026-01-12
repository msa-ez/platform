const Git = require("./Git");
const axios = require("axios");

class Gitea extends Git {
    constructor() {
        super();
        this.client = axios.create({
            baseURL: this.getBaseUrl()
        });
    }

    gitRepoUrl(org, repo, tag) {
        return `${this.client.defaults.baseURL}/${org}/${repo}${tag}`;
    }

    getType() {
        return "Gitea";
    }

    getCloneCommand(org, repo, tag) {
        return `git clone ${this.client.defaults.baseURL}/${org}/${repo}.git`;
    }

    getGitpodUrl(org, repo, releaseTagPath) {
        return `https://gitpod.io/#${this.client.defaults.baseURL}/${org}/${repo}${releaseTagPath}`;
    }

    getBaseUrl() {
        return window.GIT_URL
      ? window.GIT_URL
      : "http://localhost:3000";
    }

    getHeader() {
        // if(!localStorage.getItem('giteaToken')) {
        //     localStorage.setItem('giteaToken', '');
        // }
        return {
            Authorization: 'token ' + localStorage.getItem('gitToken')
        };
    }

    async getUserInfo() {
        return this.client.get(`/api/v1/user`, { headers: this.getHeader() });
    }

    async getBranch(org, repo, forkedTag) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/branches/branch-${forkedTag}`, { headers: this.getHeader() });
    }

    async getRef(org, repo, branch) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/git/refs/heads/${branch}`, { headers: this.getHeader() });
    }

    async getTags(org, repo, forkedTag) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/tags`, { headers: this.getHeader() });
    }

    async createBranch(org, repo, templateBranchData) {
        return this.client.post(`/api/v1/repos/${org}/${repo}/git/refs`, templateBranchData, { headers: this.getHeader() });
    }

    async getReleasedTag(org, repo, tag) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/releases/tags/${tag}`, { headers: this.getHeader() });
    }

    async getMainRepo(org, repo) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/branches/main`, { headers: this.getHeader() });
    }

    async createRepo(org, repo, userName) {
        const createRepoUrl = org === userName ? `/api/v1/user/repos` : `/api/v1/orgs/${org}/repos`;
        const options = { name: repo, auto_init: true };
        return this.client.post(createRepoUrl, options, { headers: this.getHeader() });
    }

    async getTemplateBranch(org, repo, branch) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/branches/${branch}`, { headers: this.getHeader() });
    }

    async getRepo(org, repo) {
        return this.client.get(`/api/v1/repos/${org}/${repo}`, { headers: this.getHeader() });
    }

    async getOrgList() {
        return this.client.get(`/api/v1/user/orgs`, { headers: this.getHeader() });
    }

    async recursiveTree(element) {
        // Gitea API에 맞는 구현 필요
    }

    async getTemplateURL(repo) {
        const baseUrl = this.getBaseUrl();
        // 조직명 우선, 없으면 사용자명 사용 (Gitea API에서 가져올 수도 있음)
        const orgName = localStorage.getItem("gitOrgName") || localStorage.getItem("gitUserName");
        if (orgName) {
            return `${baseUrl}/${orgName}/${repo}`;
        }
        // 기본값은 GitHub (하위 호환성)
        return `https://github.com/msa-ez/${repo}`;
    }

    async getToppingURL(repo) {
        const baseUrl = this.getBaseUrl();
        // 조직명 우선, 없으면 사용자명 사용
        const orgName = localStorage.getItem("gitOrgName") || localStorage.getItem("gitUserName");
        if (orgName) {
            return `${baseUrl}/${orgName}/topping-${repo}`;
        }
        // 기본값은 GitHub (하위 호환성)
        return `https://github.com/msa-ez/topping-${repo}`;
    }

    loadHandleBarHelper(handler) {
        try {
            if (!handler) {
                return;
            }
            (new Function(handler))();
        } catch (e) {
            console.log(`Error] Load HandleBar Helper.js: ${e} `);
        }
    }

    async getFolder(org, repo, path) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/contents/${path}`, { headers: this.getHeader() });
    }

    async getFile(org, repo, filePath) {
        const res = await this.client.get(`/api/v1/repos/${org}/${repo}/contents/${filePath}`, { headers: this.getHeader() });
        return {
            data: decodeURIComponent(escape(atob(res.data.content))),
            url: res.config.url
        };
    }

    async getFiles(options) {
        const me = this;
        const files = [];
    
        try {
            const latestCommitSha = options.sha;
    
            const treeInfo = await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/git/trees/${latestCommitSha}?recursive=1`, { headers: me.getHeader() });
            const treeItems = treeInfo.data.tree;
    
            for (const item of treeItems) {
                if (item.type === 'blob') {
                    const fileContent = await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/contents/${item.path}?ref=${options.branch}`, { headers: me.getHeader() });
                    files.push({
                        path: item.path,
                        content: Buffer.from(fileContent.data.content, 'base64').toString('utf-8')
                    });
                }
            }
    
            return files;
        } catch (error) {
            console.error("Error fetching files:", error);
            throw error;
        }
    }

    async getFileSha(org, repo, path) {
        const response = await this.client.get(`/api/v1/repos/${org}/${repo}/contents/${path}`, { headers: this.getHeader() });
        return response.data.sha;
    }

    async pushFile(org, repo, path, data) {
        try {
            // Check if the file already exists
            const sha = await this.getFileSha(org, repo, path);
            // If it exists, update the file using PUT
            const payload = {
                content: Buffer.from(data.content).toString('base64'),
                message: "Update file",
                sha: sha,
                encoding: 'base64'
            };
            return this.client.put(`/api/v1/repos/${org}/${repo}/contents/${path}`, payload, { headers: this.getHeader() });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // If the file does not exist, create it using POST
                const payload = {
                    content: Buffer.from(data.content).toString('base64'),
                    message: "Create new file",
                    encoding: 'base64'
                };
                return this.client.post(`/api/v1/repos/${org}/${repo}/contents/${path}`, payload, { headers: this.getHeader() });
            } else {
                throw error;
            }
        }
    }

    async setPushList(options) {
        var me = this;
        return new Promise(async function(resolve, reject) {
            try {
                let filesToCommit = [];
                let targetBranch = "main";

                if(options.branch) {
                    targetBranch = options.branch;  
                } else {
                    try {
                        await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/branches/template`, { headers: me.getHeader() });
                        targetBranch = "template";
                    } catch (error) {
                        targetBranch = "main";
                    }
                }
    
                if (options.gitTree.length > 0) {
                    options.gitTree.forEach(function(elData) {
                        if (!options.generateCodeLists.find(element => element.path == elData.path)) {
                            filesToCommit.push({
                                path: elData.path.startsWith('/') ? elData.path.substring(1) : elData.path,
                                operation: "delete"
                            });
                        }
                    });
                }
    
                for (const file of options.generateCodeLists) {
                    let content = file.code || "undefined";
                    let path = file.fullPath.startsWith('/') ? file.fullPath.substring(1) : file.fullPath;
                    let operation = "create";

                    if(options.gitTree.length == 0 || targetBranch === "main") {
                        try {
                            await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/contents/${path}?ref=${targetBranch}`, { headers: me.getHeader() });
                            operation = "update"; 
                        } catch (error) {
                            operation = "create";
                        }
                    } else {
                        const existingFile = options.gitTree.find(elData => elData.path === path);
                        operation = existingFile ? "update" : "create";
                    }


                    filesToCommit.push({
                        path: path,
                        content: Buffer.from(content).toString('base64'),
                        operation: operation
                    });
                }

                if (filesToCommit.length > 0) {
                    const commitData = {
                        branch: targetBranch,
                        files: filesToCommit,
                        message: options.commitMessage || "Batch commit"
                    };

                    await me.client.post(`/api/v1/repos/${options.org}/${options.repo}/contents`, commitData, { headers: me.getHeader() });

                    if(targetBranch === "main") {
                        await me.client.post(`/api/v1/repos/${options.org}/${options.repo}/branches`, {
                            new_branch_name: "template",
                            old_branch_name: "main"
                        }, { headers: me.getHeader() });
                    }

                    resolve(filesToCommit);
                } else {
                    resolve(false);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async getTree(org, repo, sha) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/git/trees/${sha}`, { headers: this.getHeader() });
    }

    async postTree(org, repo, treeList, treesha) {
        const postTreeData = {
            owner: org,
            repo: repo,
            tree: treeList,
            base_tree: treesha
        };
        return this.client.post(`/api/v1/repos/${org}/${repo}/git/trees`, postTreeData, { headers: this.getHeader() });
    }

    async setGitList(element, repository, gitRepoUrl) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let isToppingSetting = false;
            if (element.data.url.includes("topping-")) {
                isToppingSetting = true;
            }
            let toppingName = "";
            if (isToppingSetting) {
                toppingName = repository;
            }
            let gitTemplateContents = {};
            let manifestsPerTemplate = {};
            manifestsPerTemplate[gitRepoUrl] = [];
            let templateFrameWorkList = {};
            let manifestsPerToppings = {};
            manifestsPerToppings[gitRepoUrl] = [];
            let gitToppingList = {};
    
            try {
                let result = await me.client.get(`${element.data.url}?recursive=1`, { headers: me.getHeader() });
                if (result && result.data && result.data.tree.length > 0) {
                    let callCnt = 0;
                    for (const ele of result.data.tree) {
                        if (isToppingSetting) {
                            try {
                                if (ele.type !== 'tree') {
                                    let elePath = ele.path;
                                    manifestsPerToppings[gitRepoUrl].push(elePath);
    
                                    if (!gitToppingList[gitRepoUrl]) {
                                        gitToppingList[gitRepoUrl] = {};
                                    }
                                    if (!gitToppingList[gitRepoUrl][elePath]) {
                                        gitToppingList[gitRepoUrl][elePath] = {};
                                    }
                                    gitToppingList[gitRepoUrl][elePath].requestUrl = ele.url;
    
                                    let gitSha = await me.client.get(ele.url, { headers: me.getHeader() });
                                    if (!gitTemplateContents[elePath]) gitTemplateContents[elePath] = null;
                                    gitTemplateContents[elePath] = atob(gitSha.data.content);
                                }
                            } catch (e) {
                                console.log(`Error] Set ToppingLists: ${e}`);
                            } finally {
                                callCnt++;
                                if (result.data.tree.length === callCnt) {
                                    Object.keys(gitTemplateContents).forEach(function (fileName) {
                                        if (!gitToppingList[gitRepoUrl][fileName]) {
                                            gitToppingList[gitRepoUrl][fileName] = {};
                                        }
                                        gitToppingList[gitRepoUrl][fileName].content = gitTemplateContents[fileName];
                                    });
                                    console.log(`>>> Generate Code] Topping(${gitRepoUrl}) DONE`);
                                    let result = {
                                        gitToppingList: gitToppingList,
                                        manifestsPerToppings: manifestsPerToppings,
                                        gitTemplateContents: gitTemplateContents
                                    };
                                    resolve(result);
                                }
                            }
                        } else {
                            try {
                                if (ele.type !== 'tree') {
                                    if (gitRepoUrl) {
                                        manifestsPerTemplate[gitRepoUrl].push('./' + ele.path);
                                    }
    
                                    if (!templateFrameWorkList[gitRepoUrl]) {
                                        templateFrameWorkList[gitRepoUrl] = {};
                                    }
                                    if (!templateFrameWorkList[gitRepoUrl][ele.path]) {
                                        templateFrameWorkList[gitRepoUrl][ele.path] = {};
                                    }
                                    templateFrameWorkList[gitRepoUrl][ele.path].requestUrl = ele.url;
    
                                    let gitSha = await me.client.get(ele.url, { headers: me.getHeader() });
                                    if (!gitTemplateContents[ele.path]) gitTemplateContents[ele.path] = null;
                                    gitTemplateContents[ele.path] = atob(gitSha.data.content);
                                }
                            } catch (e) {
                                console.log(`Error] Set GitLists: ${e}`);
                            } finally {
                                let manifestsPerBaseTemplate = {};
                                callCnt++;
                                if (result.data.tree.length === callCnt) {
                                    manifestsPerBaseTemplate[gitRepoUrl] = manifestsPerTemplate[gitRepoUrl];
                                    Object.keys(gitTemplateContents).forEach(function (fileName) {
                                        if (!templateFrameWorkList[gitRepoUrl][fileName]) {
                                            templateFrameWorkList[gitRepoUrl][fileName] = {};
                                        }
                                        templateFrameWorkList[gitRepoUrl][fileName].content = gitTemplateContents[fileName];
                                    });
                                    console.log(`>>> Generate Code] Template(${gitRepoUrl}) DONE`);
                                    let result = {
                                        manifestsPerBaseTemplate: manifestsPerBaseTemplate,
                                        templateFrameWorkList: templateFrameWorkList,
                                        manifestsPerTemplate: manifestsPerTemplate,
                                    };
                                    resolve(result);
                                }
                            }
                        }
                    }
                } else {
                    resolve();
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    async getCommit(org, repo, branch) {
        const res = await this.client.get(`/api/v1/repos/${org}/${repo}/branches/${branch}`, { headers: this.getHeader() });
        return res.data.commit.id;
    }

    async postCommit(org, repo, options) {
        return this.client.post(`/api/v1/repos/${org}/${repo}/git/commits`, options, { headers: this.getHeader() });
    }

    async commit(org, repo, branch, treeList, init, commitMessage) {
        const res = await this.client.get(`/api/v1/repos/${org}/${repo}/branches/${branch}`, { headers: this.getHeader() });
        return res;
    }

    getUrl(org, repo) {
        return `${this.client.defaults.baseURL}/${org}/${repo}`;
    }

    async push(options) {
        return true;
    }

    async createRelease(obj) {
        return this.client.post(`/api/v1/repos/${obj.owner}/${obj.repo}/releases`, obj, { headers: this.getHeader() });
    }

    async patch(org, repo, branch, options) {
        return this.client.patch(`/api/v1/repos/${org}/${repo}/git/refs/heads/${branch}`, options, { headers: this.getHeader() });
    }

    async getActionId(org, repo) {
        // Gitea API에 맞는 구현 필요
    }

    async getActionLogs(org, repo, id) {
        // Gitea API에 맞는 구현 필요
    }
}

module.exports = Gitea;
