
const Gitlab =  require("./Gitlab")
const Github =  require("./Github")
const Gitea =  require("./Gitea")
class GitAPI {
    constructor() {
        
        if(window.PROVIDER == "gitlab") {
            this._git = new Gitlab();
        } else if (window.PROVIDER == "gitea") {
            this._git = new Gitea(window.GIT);
        } else {
            this._git = new Github();
        }
        
        // this._git = new Gitea();
    }

    getType() {
        return this._git.getType()
    }
    getCloneCommand(org, repo, tag) {
        return this._git.getCloneCommand(org, repo, tag)
    }
    gitRepoUrl(org, repo, tag) {
        return this._git.gitRepoUrl(org, repo, tag)
    }
    getGitpodUrl(org, repo, releaseTagPath) {
        return this._git.getGitpodUrl(org, repo, releaseTagPath)
    }
    getCommit(org, repo, branch) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getCommit(org, repo, branch)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })   
        })
    }
    getBranch(org, repo, forkedTag) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getBranch(org, repo, forkedTag)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })   
        })
    }
    
    setGitList(element, repository, gitRepoUrl) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.setGitList(element, repository, gitRepoUrl)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })   
        })
    }
    getTemplateURL(repo) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getTemplateURL(repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })   
        })
    }
    getToppingURL(repo) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getToppingURL(repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })   
        })
    }
    getTags(org, repo) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getTags(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    createRelease(options) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.createRelease(options)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    createBranch(org, repo) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.createBranch(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getReleasedTag(org, repo, tag) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.getReleasedTag(org, repo, tag)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getMainRepo(org, repo) {
        let me = this;
        return new Promise(async function(resolve, reject) {
            const result = await me._git.getMainRepo(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    createRepo(org, repo, userName) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.createRepo(org, repo, userName)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getTemplateBranch(org, repo, branch) {
        let me = this;
        return new Promise(async function(resolve, reject) {
            const result = await me._git.getTemplateBranch(org, repo, branch)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getRepo(org, repo) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getRepo(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getOrgList() {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getOrgList()
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    startCommit() {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.startCommit()
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getFile(org, repo, filePath) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getFile(org, repo, filePath)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getFiles(options) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getFiles(options)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getFolder(org, repo, path) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.getFolder(org, repo, path)
                .then((res) => {
                    resolve(res)
                })
                .catch((e) => {
                    reject(e)
                })
        })
    }
    /**
     * 
     * @param { gitTree: Array<>, generateCodeLists: Array<>, copyChangedPathLists: Array<>, pushType: string, bcCnt: number, onlyOneBcId: string } options 
     * @returns 
     */
    setPushList(options) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            const result = await me._git.setPushList(options)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getUrl(org, repo) {
        return this._git.getUrl(org, repo)
    }
    commit(org, repo, branch, list, init, commitMessage) {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.commit(org, repo, branch, list, init, commitMessage)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
getUserInfo() {
        let me = this;
        return new Promise(async function(resolve,reject) {
            const result = await me._git.getUserInfo()
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    async push(org, repo, list, init) {
        let me = this;
        return await me._git.push(org, repo, list, init)
    }
    getTree(org, repo, sha) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let tree = await me._git.getTree(org, repo, sha)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    postTree(org, repo, treeList, treesha) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let tree = await me._git.postTree(org, repo, treeList, treesha)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    pushFile(org, repo, data) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            await me._git.pushFile(org, repo, data)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }

    startCommitTemplate() {
        
    }

    getActionId(org, repo) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            await me._git.getActionId(org, repo)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getActionLogs(org, repo, id) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            await me._git.getActionLogs(org, repo, id)
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }

}
module.exports = GitAPI