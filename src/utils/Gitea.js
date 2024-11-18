const Git = require("./Git");
const axios = require("axios");

class Gitea extends Git {
    constructor(baseURL, token) {
        super();
        this.client = axios.create({
            baseURL,
            headers: { 'Authorization': `token ${token}` }
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

    getHeader() {
        // return {
            // Authorization: 'token ' + localStorage.getItem('gitToken'),
            // Accept: 'application/vnd.github+json'
        // };
    }

    async getUserInfo() {
        return this.client.get(`/api/v1/user`);
    }

    async getBranch(org, repo, forkedTag) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/branches/branch-${forkedTag}`);
    }

    async getRef(org, repo, branch) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/git/refs/heads/${branch}`);
    }

    async getTags(org, repo, forkedTag) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/tags`);
    }

    async createBranch(org, repo, templateBranchData) {
        return this.client.post(`/api/v1/repos/${org}/${repo}/git/refs`, templateBranchData);
    }

    async getReleasedTag(org, repo, tag) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/releases/tags/${tag}`);
    }

    async getMainRepo(org, repo) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/branches/main`);
    }

    async createRepo(org, repo, userName) {
        const createRepoUrl = org === userName ? `/api/v1/user/repos` : `/api/v1/orgs/${org}/repos`;
        const options = { name: repo, auto_init: true };
        return this.client.post(createRepoUrl, options);
    }

    async getTemplateBranch(org, repo, branch) {
        return this.client.get(`/api/v1/repos/${org}/${repo}/branches/${branch}`);
    }

    async getRepo(org, repo) {
        return this.client.get(`/api/v1/repos/${org}/${repo}`);
    }

    async getOrgList() {
        return this.client.get(`/api/v1/user/orgs`);
    }

    async recursiveTree(element) {
        // Gitea API에 맞는 구현 필요
    }

    async getTemplateURL(repo) {
        return `https://github.com/msa-ez/${repo}`;
    }

    async getToppingURL(repo) {
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
        return this.client.get(`/api/v1/repos/${org}/${repo}/contents/${path}`);
    }

    async getFile(org, repo, filePath) {
        const res = await this.client.get(`/api/v1/repos/${org}/${repo}/contents/${filePath}`);
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
    
            const treeInfo = await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/git/trees/${latestCommitSha}?recursive=1`);
            const treeItems = treeInfo.data.tree;
    
            for (const item of treeItems) {
                if (item.type === 'blob') {
                    const fileContent = await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/contents/${item.path}?ref=${options.branch}`);
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
        const response = await this.client.get(`/api/v1/repos/${org}/${repo}/contents/${path}`);
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
            return this.client.put(`/api/v1/repos/${org}/${repo}/contents/${path}`, payload);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // If the file does not exist, create it using POST
                const payload = {
                    content: Buffer.from(data.content).toString('base64'),
                    message: "Create new file",
                    encoding: 'base64'
                };
                return this.client.post(`/api/v1/repos/${org}/${repo}/contents/${path}`, payload);
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
                try {
                    await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/branches/template`);
                    targetBranch = "template";
                } catch (error) {
                    targetBranch = "main";
                }
    
                if (options.gitTree.length > 0) {
                    options.gitTree.forEach(function(elData) {
                        if (!options.generateCodeLists.find(element => element.fullPath == elData.path)) {
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

                    try {
                        await me.client.get(`/api/v1/repos/${options.org}/${options.repo}/contents/${path}?ref=${targetBranch}`);
                        operation = "update"; 
                    } catch (error) {
                        operation = "create";
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

                    await me.client.post(`/api/v1/repos/${options.org}/${options.repo}/contents`, commitData);

                    if(targetBranch === "main") {
                        await me.client.post(`/api/v1/repos/${options.org}/${options.repo}/branches`, {
                            new_branch_name: "template",
                            old_branch_name: "main"
                        });
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
        return this.client.get(`/api/v1/repos/${org}/${repo}/git/trees/${sha}`);
    }

    async postTree(org, repo, treeList, treesha) {
        const postTreeData = {
            owner: org,
            repo: repo,
            tree: treeList,
            base_tree: treesha
        };
        return this.client.post(`/api/v1/repos/${org}/${repo}/git/trees`, postTreeData);
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
                let result = await me.client.get(`${element.data.url}?recursive=1`);
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
    
                                    let gitSha = await me.client.get(ele.url);
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
    
                                    let gitSha = await me.client.get(ele.url);
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
        const res = await this.client.get(`/api/v1/repos/${org}/${repo}/branches/${branch}`);
        return res.data.commit.id;
    }

    async postCommit(org, repo, options) {
        return this.client.post(`/api/v1/repos/${org}/${repo}/git/commits`, options);
    }

    async commit(org, repo, branch, treeList, init, commitMessage) {
        const res = await this.client.get(`/api/v1/repos/${org}/${repo}/branches/${branch}`);
        return res;
    }

    getUrl(org, repo) {
        return `${this.client.defaults.baseURL}/${org}/${repo}`;
    }

    async push(options) {
        return true;
    }

    async createRelease(obj) {
        return this.client.post(`/api/v1/repos/${obj.owner}/${obj.repo}/releases`, obj);
    }

    async patch(org, repo, branch, options) {
        return this.client.patch(`/api/v1/repos/${org}/${repo}/git/refs/heads/${branch}`, options);
    }

    async getActionId(org, repo) {
        // Gitea API에 맞는 구현 필요
    }

    async getActionLogs(org, repo, id) {
        // Gitea API에 맞는 구현 필요
    }
}

module.exports = Gitea;