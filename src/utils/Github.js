const Git =  require("./Git")
const axios =  require("axios")
class Github extends Git {
    gitRepoUrl(org, repo, tag) {
        return `https://github.com/${org}/${repo}${tag}`
    }

    getType() {
        return "GitHub"
    }

    getCloneCommand(org, repo, tag) {
        return `git clone https://github.com/${org}/${repo}.git`
    }
    getGitpodUrl(org, repo, releaseTagPath) {
        return `https://gitpod.io/#https://github.com/${org}/${repo}${releaseTagPath}`
    }
    getHeader() {
        return {
            Authorization: 'token ' + localStorage.getItem('gitToken'),
            Accept: 'application/vnd.github+json'
        }
    }
    getUserInfo() {
        let me = this
        return new Promise(async function (resolve, reject) {
            let patchMainResult = await axios.get(`https://api.github.com/user`, { headers: me.getHeader() })
            .then((res) => {
                resolve(res.data)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getBranch(org, repo, forkedTag) {
        let me = this
        return new Promise(async function (resolve, reject) {
            await axios.get(`https://api.github.com/repos/${org}/${repo}/branches/branch-${forkedTag}`, { headers: me.getHeader() })
            .then(function (res) {
                if(res){
                    resolve(true);
                }
            }).catch(function (error) {
                reject(error)
            })
        })
        
    }
    getRef(org, repo, branch) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            await axios.get(`https://api.github.com/repos/${org}/${repo}/git/refs/heads/${branch}`, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch(error => {
                reject(error)
            })
        })
    }
    getTags(org, repo, forkedTag) {
        let me = this
        return new Promise(async function (resolve, reject) {
            const result = await axios.get(`https://api.github.com/repos/${org}/${repo}/tags`, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch(function (error) {
                reject(error)
            })
            
        })
    }
    createBranch(org, repo, templateBranchData) {
        let me = this
        return new Promise(async function(resolve, reject) {
            const result = await axios.post(`https://api.github.com/repos/${org}/${repo}/git/refs`, templateBranchData, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch(function (error) {
                reject(error)
            })
        })
    }
    getReleasedTag(org, repo, tag) {
        let me = this
        return new Promise(async function(resolve, reject) {
            await axios.get(`https://api.github.com/repos/${org}/${repo}/releases/tags/${tag}`, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch(function (error) {
                reject(error)
            })
        })
    }
    createTree() {
        let me = this
        return new Promise(function (resolve, reject) {

        })
    }
    getMainRepo(org, repo) {
        let me = this
        return new Promise(async function (resolve,reject) {
            let result = await axios.get(`https://api.github.com/repos/${org}/${repo}/git/trees/main`, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch(function (error) {
                reject(error)
            })
            
        })
    }
    
    createRepo(org, repo, userName) {
        let me = this;
        let createRepoUrl;
        let options = {
            name: repo,
            auto_init: true
        }
        if(org == userName){
            createRepoUrl = `https://api.github.com/user/repos`
        } else {
            createRepoUrl = `https://api.github.com/orgs/${org}/repos`
        }
        return new Promise(async function (resolve, reject) {
            let result = await axios.post(createRepoUrl, options, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch((e)=>{
                reject(e)
            })
            
        })
    }
    getTemplateBranch(org, repo, branch) {
        let me = this;

        return new Promise(async function (resolve, reject) {
            let result = await axios.get(`https://api.github.com/repos/${org}/${repo}/git/trees/${branch}`, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch((e)=>{
                reject(e)
            })
        })
    }
    getRepo(org, repo) {
        let me = this;
        return new Promise(async function(resolve, reject) {
            let result = await axios.get(`https://api.github.com/repos/${org}/${repo}`, { headers: me.getHeader() })
            .then(function (res) {
                resolve(res)
            })
            .catch((e)=> {
                reject(e)
            })
        })
    }
    getOrgList() {
        var me = this;
        return new Promise(async function (resolve, reject) {
            const result = await axios.get(`https://api.github.com/user/orgs`, { headers: me.getHeader() })
            .then(async (res) => {
                let result = {
                    gitlabGroupIdList : [],
                    gitOrganizations: []
                }
                let gitOrganizations = []
                if(res && res.data.length > 0){
                    await Promise.all(res.data.map(function (orgInfo) {
                        result.gitOrganizations.push(orgInfo.name)
                    }))
                    resolve(gitOrganizations)
                }
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    recursiveTree(element) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let result = [];
            if(element.type == 'blob') {
                result.concat(element)
                resolve(element)
            } else if (element.type == 'tree') {
                let gitData = await axios.get(element.url, {headers: me.getHeader()})
                .then((res) => {
                    res.data.tree.map((elem) => {
                        elem.path = element.path + "/" + elem.path;
                        if(elem.type == 'blob') {
                            result.concat(elem)
                            resolve(elem)
                        } else if (elem.type == 'tree') {
                            let recursive = me.recursiveTree(elem);
                            result.concat(recursive)
                            resolve(result)
                        }
                    })
                })
                .catch((e) => {
                    reject(e)
                })
            }
        })
    }
    getTemplateURL(repo) {
        let me = this;
        return new Promise((resolve, reject) => {
            let result = "https://github.com/msa-ez/" + repo
            resolve(result)
        })
    }
    getToppingURL(repo) {
        let me = this;
        return new Promise((resolve, reject) => {
            let result = "https://github.com/msa-ez/topping-" + repo
            resolve(result)
        })
    }
    loadHandleBarHelper(handler){
        try{
            if( !handler ){
                return;
            }
            (new Function(handler))();
        }catch(e){
            console.log(`Error] Load HandleBar Helper.js: ${e} `)
        }
    }
    getFolder(org, repo, path) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let results = []
            try {
                let url = `https://api.github.com/repos/${org}/${repo}/contents/${path}`
                let file = await axios.get(url, { headers: me.getHeader() })
                    .then(res => {
                        resolve(res)
                    })
                    .catch(e => reject(e))
            } catch(e) {
                reject(e)
            }
        })
    }
    getFile(org, repo, filePath) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let results = []
            try {
                let url = `https://api.github.com/repos/${org}/${repo}/contents/${filePath}`
                let file = await axios.get(url, { headers: me.getHeader() })
                .then(res => {
                    let result = {
                        data: decodeURIComponent(escape(atob(res.data.content))),
                        url: url
                    }
                    resolve(result)
                })
                .catch(e => reject(e))
            } catch(e) {
                reject(e)
            }
        })
    }
    getFiles(options) {
        let me = this;
        return new Promise(async function (resolve, reject) {
            let results = []
            try {
                options.tree.map(async (ele) => {
                    let data = await me.recursiveTree(ele)
                    .then((result) => {
                        results.concat(result)
                    })
                    .catch((e) => {
                        reject(e)
                    })
                })
                resolve(results)
            } catch(e) {
                reject(e)
            }
            
        })
    }
    pushFile(org, repo, data) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let result = await axios.post(`https://api.github.com/repos/${org}/${repo}/git/blobs`, data, { headers: me.getHeader() })
            .then((res) => {
                resolve(res)
            })
            .catch((error) => {
                reject(error)
            })
        })
    }
    setPushList(options) {
        var me = this
        return new Promise(async function(resolve, reject) {
            try {
                let removeTree = []
                var isChanged = false
                let pushTree = []                
                var allCnt = 0
                var exceptCnt = 0

                if(options.gitTree.length > 0){
                    options.gitTree.forEach(function (elData) {
                        if(!options.generateCodeLists.find(element => element.fullPath == elData.path)) {
                            isChanged = true
                            let pushData = {
                                path: elData.path.startsWith('/') ? elData.path.substring(1) : elData.path,
                                mode:"100644",
                                type:"blob",
                                sha: null
                            }
                            removeTree.push(pushData)
                        }
                    })
                }

                options.generateCodeLists.map(async function (elData) {
                    if(options.gitTree.length == 1 || !options.gitTree.find(element => element.path == elData.fullPath) || ((options.changedCodeLists && options.changedCodeLists.find(element => element.replace("for-model/","") == elData.fullPath)) || options.pushType != "Push")) {
                        var pushValid = false
                        if(options.isOne){
                            if(options.onlyOneBcId == elData.bcId && !elData.templatePath.includes('for-model/')){
                                elData.fullPath = elData.fullPath.replace(elData.boundedContext + '/',"")
                                pushValid = true
                            } else {
                                exceptCnt++;
                            }
                        } else {
                            pushValid = true
                        }
                        if(pushValid){
                            isChanged = true
                            var code
                            if(elData.code){
                                code = elData.code
                            }

                            if(!code){
                                code = 'undefined'
                            }

                            // if(elData.fullPath.includes("Test.java") && options.testFile){
                            //     if(!elData.fullPath.includes(options.testFile.name)){
                            //         code = "//ignore this file."
                            //     }else{
                            //         if(code.includes("//ignore this file.")){
                            //             code = options.testFile.code
                            //         }
                            //     }
                            // }

                            let data = {
                                content: code,
                                encoding: 'utf-8',
                            };
                            
                            await me.pushFile(options.org, options.repo, data)
                            .then(function (blob){ 
                                allCnt++;
                                let pushData = {
                                    path: elData.fullPath.startsWith('/') ? elData.fullPath.substring(1) : elData.fullPath,
                                    mode:"100644",
                                    type:"blob",
                                    sha: blob.data.sha
                                }
                                pushTree.push(pushData)
                            })
                            .catch((error) => {
                                if (error.response && error.response.headers && error.response.headers["retry-after"] && error.response.headers["retry-after"] === '60') {
                                    setTimeout(async () => {
                                        try {
                                            let blobs = await me.pushFile(options.org, options.repo, data);
                                            let pushData = {
                                                path: elData.fullPath.startsWith('/') ? elData.fullPath.substring(1) : elData.fullPath,
                                                mode: "100644",
                                                type: "blob",
                                                sha: blobs.data.sha
                                            };
                                            pushTree.push(pushData);
                                        } catch (retryError) {
                                            reject(retryError);
                                        } finally {
                                            allCnt++;
                                            if(options.generateCodeLists.length == allCnt + exceptCnt) {
                                                let result = pushTree.concat(removeTree);
                                                resolve(result);
                                            }
                                        }
                                    }, 60000);
                                } else {
                                    allCnt++;
                                    reject(error);
                                }
                            })

                        }
                    }
                    if(!isChanged) {
                        resolve(false)
                    }
                    if(options.generateCodeLists.length == allCnt + exceptCnt) {
                        let result = pushTree.concat(removeTree)
                        resolve(result)
                    }
                })
            } catch(error) {
                reject(error)
            }
        })
    }
    getTree(org, repo, sha) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let tree = await axios.get(`https://api.github.com/repos/` + org + '/' + repo + `/git/trees/` + sha, { headers: me.getHeader() })
            .then((res) => {
                resolve(res.data)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    postTree(org, repo, treeList, treesha) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let postTreeData = {
                owner: org,
                repo: repo,
                tree: treeList,
                base_tree: treesha
            }
            let tree = await axios.post(`https://api.github.com/repos/${org}/${repo}/git/trees`, postTreeData, { headers: me.getHeader() })
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
            let isToppingSetting = false
            if(element.url.includes("topping-")){
                isToppingSetting = true
            }
            let toppingName = ""
            if(isToppingSetting){
                toppingName = repository
            }
            let gitTemplateContents = {};
            let manifestsPerTemplate = {}
            manifestsPerTemplate[gitRepoUrl] = []
            let templateFrameWorkList = {}
            let manifestsPerToppings = {}
            manifestsPerToppings[gitRepoUrl] = []
            let gitToppingList = {}
            // let result = null;
            
            let result = await axios.get(element.url + '?recursive=1', { headers: me.getHeader() })
            .then(function(res) {
                if( res && res.data && res.data.tree.length > 0 ) {
                    let callCnt = 0;
                    res.data.tree.forEach(async function (ele, idx) {
                        if(isToppingSetting){
                            try{
                                if (ele.type != 'tree') {
                                    //var elePath = ele.path.replace(`${toppingName}/`, '')
                                    var elePath = ele.path
                                    manifestsPerToppings[gitRepoUrl].push(elePath)
    
                                    if(!gitToppingList[gitRepoUrl]){
                                        gitToppingList[gitRepoUrl] = {}
                                    }
                                    if(!gitToppingList[gitRepoUrl][elePath]){
                                        gitToppingList[gitRepoUrl][elePath] = {}
                                    }
                                    gitToppingList[gitRepoUrl][elePath].requestUrl = ele.url
    
                                    var gitSha = await axios.get(ele.url, { headers: me.getHeader() })
                                    if(!gitTemplateContents[elePath]) gitTemplateContents[elePath] = null
                                    gitTemplateContents[elePath] = Base64.decode(gitSha.data.content);
                                }
                            }catch(e){
                                console.log(`Error] Set ToppingLists: ${e}`)
                            }finally {
                                callCnt ++ ;
                                if(res.data.tree.length == callCnt) {
                                    Object.keys(gitTemplateContents).forEach(function (fileName) {
                                        if(!gitToppingList[gitRepoUrl][fileName]){
                                            gitToppingList[gitRepoUrl][fileName] = {}
                                        }
                                        gitToppingList[gitRepoUrl][fileName].content = gitTemplateContents[fileName]
                                    });
                                    console.log(`>>> Generate Code] Topping(${gitRepoUrl}) DONE`)
                                    let result = {
                                        gitToppingList: gitToppingList,
                                        manifestsPerToppings: manifestsPerToppings,
                                        gitTemplateContents: gitTemplateContents
                                    }
                                    resolve(result);
                                }
    
                                var gitSha = await axios.get(ele.url, { headers: me.getHeader() });
                                if(!gitTemplateContents[ele.path]) gitTemplateContents[ele.path] = null
                                gitTemplateContents[ele.path] = Base64.decode(gitSha.data.content);
                                if(ele.path.includes("helper.js")){
                                    me.loadHandleBarHelper(Base64.decode(gitSha.data.content));
                                }
                            }
                        } else {
                            try {
                                if (ele.type != 'tree') {
                                    if(gitRepoUrl){
                                        manifestsPerTemplate[gitRepoUrl].push('./' + ele.path)
                                    }
    
                                    if(!templateFrameWorkList[gitRepoUrl]){
                                        templateFrameWorkList[gitRepoUrl] = {}
                                    }
                                    if(!templateFrameWorkList[gitRepoUrl][ele.path]){
                                        templateFrameWorkList[gitRepoUrl][ele.path] = {}
                                    }
                                    templateFrameWorkList[gitRepoUrl][ele.path].requestUrl = ele.url
    
                                    var gitSha = await axios.get(ele.url, { headers: me.getHeader() });
                                    if(!gitTemplateContents[ele.path]) gitTemplateContents[ele.path] = null
                                    gitTemplateContents[ele.path] = Base64.decode(gitSha.data.content);
                                }
                            } catch (e) {
                                console.log(`Error] Set GitLists: ${e}`)
                            } finally {
                                let manifestsPerBaseTemplate = {}
                                callCnt ++;
                                if(res.data.tree.length == callCnt) {
                                    manifestsPerBaseTemplate[gitRepoUrl] = manifestsPerTemplate[gitRepoUrl];
                                    Object.keys(gitTemplateContents).forEach(function (fileName) {
                                        if(!templateFrameWorkList[gitRepoUrl][fileName]){
                                            templateFrameWorkList[gitRepoUrl][fileName] = {}
                                        }
                                        templateFrameWorkList[gitRepoUrl][fileName].content = gitTemplateContents[fileName]
                                    });
                                    console.log(`>>> Generate Code] Template(${gitRepoUrl}) DONE`);
                                    let result = {
                                        manifestsPerBaseTemplate: manifestsPerBaseTemplate,
                                        templateFrameWorkList: templateFrameWorkList,
                                        manifestsPerTemplate: manifestsPerTemplate,
                                    }
                                    resolve(result);
                                }
                            }
                        }
                    });
                } else {
                    resolve();
                }
            })
            .catch(e => (reject(e)))
        })
    }
    getCommit(org, repo, branch) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let commitRes = await axios.get(`https://api.github.com/repos/${org}/${repo}/commits/${branch}`, { headers: me.getHeader() })
            .then((res) => {
                resolve(res.data.sha)
            })
            .catch(e => {
                reject(e)
            })
        })
    }
    postCommit(org, repo, options) {
        var me = this;
        return new Promise(async function (resolve, reject) {
            let postCommitResult = await axios.post(`https://api.github.com/repos/${org}/${repo}/git/commits`, options, { headers: me.getHeader() })
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    commit(org, repo, branch, treeList, init, commitMessage) {
        let me = this;
        return new Promise(async function (resolve, reject) { 
            let treesha = null;
            let parentsCommitSha = null;
            let getRepo = await me.getMainRepo(org, repo)
            .then(async (res) => {
                treesha = res.data.sha;
                let postTreeResult = await me.postTree(org, repo, treeList, treesha)
                .then(async (result) => {
                    treesha = result.data.sha
                    let commits = await me.getCommit(org, repo, branch)
                    .then(async function (commit) {
                        parentsCommitSha = commit
                        let postCommitData = {}
                        let commitMsg = commitMessage ? commitMessage : "commit"
                        if(init) {
                            postCommitData = {
                                tree: result.data.sha,
                                message: commitMsg
                            }
                        } else {
                            postCommitData = {
                                tree: result.data.sha,
                                message: commitMsg,
                                parents: [
                                    parentsCommitSha
                                ]
                            }
                        }
                        let commitResult = await me.postCommit(org, repo, postCommitData)
                        .then(function (commitResults) {
                            resolve(commitResults)
                        })
                        .catch((commitError) => {
                            reject(commitError)
                        })
                    })
                    .catch(e => reject(e))
                })
                .catch((err) => {
                    reject(err)
                })
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    getUrl(org, repo) {
        return `https://github.com/${org}/${repo}`
    }
    push(options) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let patchData = {
                sha: options.commitData.data.sha,
                force: true
            }
            let branch;
            // if(options.init) {
            //     branch = "main"
            // } else {
            //     branch = "template"
            // }
            let patch = await me.patch(options.org, options.repo, options.branch, patchData)
            .then(async (res) => {
                let templateBranch = await me.getRef(options.org, options.repo, "template")
                .then(() => {
                    resolve(res)
                })
                .catch(async error => {
                    if (error.response.status === 404) {
                        let templateBranchData = {
                            ref: "refs/heads/template",
                            sha: res.data.object.sha
                        }
                        let createBranch = await me.createBranch(options.org, options.repo, templateBranchData)
                        .then((result) => {
                            resolve(result)
                        })
                        .catch(e => reject(e))
                    }
                })
            })
            .catch((e)=> {
                reject(e)
            })
        })
        
    }
    createRelease(obj) {
        let me = this;
        return new Promise(async function (resolve,reject) {
            // var obj ={
            //     owner: me.scmOrg,
            //     repo: me.scmRepo,
            //     tag_name: me.scmTag,
            //     body: storageCondition && storageCondition.comment ? storageCondition.comment : '',
            // }
            await axios.post(`https://api.github.com/repos/${obj.owner}/${obj.repo}/releases`, obj, { headers: me.getHeader() }).then(function(){
                resolve()
            })
            .catch(function (error) {
                if(error.response.status === 401){
                    me.alertReLogin()
                }
                alert(error)
            })
        })
        
    }
    patch(org, repo, branch, options) {
        let me = this
        return new Promise(async function (resolve, reject) {
            // console.log(branch)
            let patchMainResult = await axios.patch(`https://api.github.com/repos/${org}/${repo}/git/refs/heads/${branch}`, options, { headers: me.getHeader() })
            .then((res) => {
                resolve(res)
            })
            .catch((e) => {
                reject(e)
            })
        })
    }
    // setPushTemplateList() {

    // }
    getActionId(org, repo) {
        let me = this
        return new Promise(async function (resolve, reject) {
            let run_id
            await axios.get(`https://api.github.com/repos/${org}/${repo}/actions/runs?status='queued'`, { headers: me.getHeader() })
            .then(async (res) => {
                if(res.data.workflow_runs.length == 0){
                    await axios.get(`https://api.github.com/repos/${org}/${repo}/actions/runs?status='in_progress'`, { headers: me.getHeader() })
                    .then((res) => {
                        if(res.data.workflow_runs.length > 0){
                            run_id = res.data.workflow_runs[0].id
                        } else {
                            setTimeout(async () => {
                                let obj = await me.getActionId(org, repo)
                                resolve(obj)
                            }, 1000)
                        }
                    }).catch(e => {
                        reject(e)
                    })
                } else {
                    run_id = res.data.workflow_runs[0].id
                }
                if(run_id){
                    await axios.get(`https://api.github.com/repos/${org}/${repo}/actions/runs/${run_id}/jobs`, { headers: me.getHeader() })
                    .then(async (res) => {
                        let obj = {
                            run_id: run_id,
                            job_id: res.data.jobs[0].id
                        }
                        resolve(obj)
                    }).catch(e => {
                        reject(e)
                    })
                }
            }).catch(e => {
                reject(e)
            })
        })
    }
    
    getActionLogs(org, repo, id) {
        let me = this
        return new Promise(async function (resolve, reject) {
            await axios.get(`https://api.github.com/repos/${org}/${repo}/actions/runs/${id.run_id}`, { headers: me.getHeader() })
            .then(async (run) => {
                if(run.data.status == "completed"){
                    let logInfo
                    let log
                    await axios.get(`https://api.github.com/repos/${org}/${repo}/actions/jobs/${id.job_id}/logs`, { headers: me.getHeader() })
                    .then((logs) => {
                        if(run.data.conclusion == "success"){
                            logInfo = {
                                state: 'success',
                                log: null
                            }
                        } else {
                            logInfo = {
                                state: 'fail',
                                log: null
                            }
                        }
                        
                        if(logs.data.includes("[INFO] Results:")){
                            log = logs.data.split("[INFO] Results:")
                        } else if(logs.data.includes("[INFO] BUILD FAILURE")){
                            log = logs.data.split("[INFO] BUILD FAILURE")
                        } else if(logs.data.includes("COMPILATION ERROR :")) {
                            log = logs.data.split("COMPILATION ERROR :")
                        }
    
                        if(!log){
                            logInfo.log = logs.data
                        } else if(log.length > 1 && log[1]){
                            logInfo.log = log[1]
                        } else {
                            logInfo.log = log[0]
                        }
    
                        resolve(logInfo)
    
                    }).catch(e => {
                        reject(e)
                    })
                } else {
                    setTimeout(async () => {
                        let logs = await me.getActionLogs(org, repo, id)
                        resolve(logs)
                    }, 1000)
                }
            })
            .catch(e => {
                reject(e)
            })
        })
    }
    // startCommit() {
    //     return new Promise(async function (resolve, reject) {
    //         // 1. Repo 정보 불러오기 (Template Branch)
    //         // 2-1. TreeList 구성 (있을때)
    //         // 3-1. Main Branch Repo 불러오기
    //         // 3-2. Main Branch Repo에 Push?
    //         // 3-3. Main Repository도 없을때 -> 생성
    //         // 4. 계정 정보 없을때 401
    //         let gitRepoInfo = await me.getTemplateBranch(me.gitOrgName, me.gitRepoName)
    //         .then((result) => {
    //             if(!me.firstCommit && result){
    //                 me.commitStepText = 'Get Git Repo'
    //                 me.treesha = result.data.sha
    //                 if(result.data.tree){
    //                     result.data.tree.forEach(function (element) {
    //                         if(element.type == 'blob'){
    //                             me.gitTreeList.push(element)
    //                         } else if(element.type == 'tree'){
    //                             me.getMoreTreeListWithGitHub(element)
    //                         }
    //                     })
    //                 }
    //             }
    //         }).catch(e => {
    //             reject(e)
    //         })
    //         // 2. 
    //     })
    //     .catch((error) => {
    //         if (error.response) {
    //             if(error.response.data.message == "Not Found" || error.response.status == 404) {
    //                 me.isFirstCommit = true
    //                 me.firstCommit = true
    //                 // let gitRepoMainInfo = await axios.get(`https://api.github.com/repos/${me.gitOrgName}/${me.gitRepoName}/git/trees/main`, { headers: me.gitHeaders })
    //                 let gitRepoMainInfo = me.git.getMainRepo(me.gitOrgName, me.gitRepoName)
    //                 .then((result) => {
    //                     var blob = {
    //                         path: "README.md"
    //                     }
    //                     me.gitTreeList.push(blob)
    //                     setTimeout(function () {
    //                         me.setPushListWithGitHub()
    //                     }, 1000)
    //                 })
    //                 .catch(async (error) => {
    //                     if (error.response) {
    //                         if(error.response.data.message == "Not Found" || error.response.status == 404) {
    //                             me.commitStepText = 'Create New Repo'
    //                             let newRepoData = {
    //                                 name: me.gitRepoName,
    //                                 auto_init: true
    //                             }
    //                             var createRepoUrl
    //                             if(me.gitOrgName == me.gitUserName){
    //                                 createRepoUrl = `https://api.github.com/user/repos`
    //                             } else {
    //                                 createRepoUrl = `https://api.github.com/orgs/${me.gitOrgName}/repos`
    //                             }
    //                             // let addNewRepo = await axios.post(createRepoUrl, newRepoData, { headers: me.gitHeaders })
    //                             let addNewRepo = await me.git.createRepo(me.gitOrgName, me.gitUserName, newRepoData)
    //                             .then((result) => {
    //                                 if(me.bcCnt != 1){
    //                                     var blob = {
    //                                         path: "README.md"
    //                                     }
    //                                     me.gitTreeList.push(blob)
    //                                 }
    //                                 setTimeout(function () {
    //                                     me.setPushListWithGitHub()
    //                                 }, 3000)
    //                             })
    //                             .catch((error) => {
    //                                 if(error.response.status === 401){
    //                                     me.alertReLogin()
    //                                 }
    //                                 if(error.response && error.response.data && error.response.data.message){
    //                                     var errText = error.response.data.message
    //                                     if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
    //                                         errText = errText + ', ' + error.response.data.errors[0].message
    //                                     }
    //                                     me.showErrSnackBar(errText)
    //                                 } else {
    //                                     me.showErrSnackBar(error.message)
    //                                 }
    //                             })
    //                         } else {
    //                             if(error.response.status === 401){
    //                                 me.alertReLogin()
    //                             }
    //                             if(error.response && error.response.data && error.response.data.message){
    //                                 var errText = error.response.data.message
    //                                 if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
    //                                     errText = errText + ', ' + error.response.data.errors[0].message
    //                                 }
    //                                 me.showErrSnackBar(errText)
    //                             } else {
    //                                 me.showErrSnackBar(error.message)
    //                             }
    //                         }
    //                     }
    //                 })
    //             } else {
    //                 if(error.response.status === 401) {
    //                     me.alertReLogin()
    //                 }
    //                 if(error.response && error.response.data && error.response.data.message){
    //                     var errText = error.response.data.message
    //                     if(error.response.data.errors && error.response.data.errors[0] && error.response.data.errors[0].message){
    //                         errText = errText + ', ' + error.response.data.errors[0].message
    //                     }
    //                     me.showErrSnackBar(errText)
    //                 } else {
    //                     me.showErrSnackBar(error.message)
    //                 }
    //             }
    //         }
    //     })
    // }
}

module.exports = Github