<template>

</template>

<script>
    import TenantAware from "../TenantAware";
    import LabBaseSelected from "../../designer/modeling/StorageBaseComposition"

    export default {
        name: "IDE",
        mixins: [TenantAware, LabBaseSelected],
        data () {
            return {
                mode: "newLogic",
                liveSync: false
            }
        },
        computed: {
            // isOnPrem() {
            //   if(window.MODE == "onprem") {
            //       return true
            //   } else {
            //       return false
            //   }
            // },
            fileServerUrl() {
                var me = this
                var apiUrl = window.MODE == "onprem" ? me.getTenantId() : "kuberez.io";
                if (me.classInfo.ideUrl)
                    return `${me.getProtocol()}//${me.classInfo.ideUrl}-file-server.${apiUrl}`;
                else
                    return `${me.getProtocol()}//file.${apiUrl}`;
            }
        },
        mounted() {
            var me = this
            // window.onmessage = null
            window.addEventListener('message', me.messageProcessing);
        },
        beforeDestroy() {
             var me = this
            // window.onmessage = null
            window.removeEventListener('message', me.messageProcessing);
        },
        methods: {
            existServiceAccountCheck(hashName) {
                var me = this
                var serverToken = me.classInfo.token;
                var serverUrl = me.classInfo.serverUrl;

                // if (me.classInfo.reuse) {
                //     serverUrl = 'https://104.198.88.86';
                //     serverToken = undefined
                // }

                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/serviceaccounts/${hashName}?serverUrl=${serverUrl}&token=${serverToken}`).then(function (result) {
                        resolve(result)
                    }).catch(function (e) {
                        resolve(false)
                    })
                })
            },
            checkIdeOperator(hashName) {
                var me = this
                var serverToken = me.classInfo.token;
                var serverUrl = me.classInfo.serverUrl;

                // if (me.classInfo.reuse) {
                //     serverUrl = 'https://104.198.88.86';
                //     serverToken = undefined
                // }

                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides/${hashName}/status?serverUrl=${serverUrl}&token=${serverToken}`).then(function (result) {
                        console.log(result.data.status.conditions)
                        result.data.status.conditions.forEach(function (item) {
                            if (item.reason == "InstallSuccessful" && item.type == "Deployed") {
                                resolve(true)
                            }
                        })
                    }).catch(function (e) {
                        resolve(false)
                    })
                })
            },
            getSecret(hashName, secretName) {
                console.log(secretName)
                var me = this
                var serverToken = me.classInfo.token;
                var serverUrl = me.classInfo.serverUrl;

                // if (me.classInfo.reuse) {
                //     serverUrl = 'https://104.198.88.86';
                //     serverToken = undefined
                // }

                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/secrets/${secretName}?serverUrl=${serverUrl}&token=${serverToken}`).then(function (result) {
                        resolve(result.data.data.token)
                    }).catch(function (e) {
                        resolve(false)
                    })
                })
            },
            endedCodeUpdate: _.debounce(function () {
                var me = this
                me.codeStatus = true;
            }, 1000),
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            ideRunningCheck(hashName) {
                var me = this
                var serverToken = me.classInfo.token;
                var serverUrl = me.classInfo.serverUrl;

                // if (me.classInfo.reuse) {
                //     serverUrl = 'https://104.198.88.86';
                //     serverToken = undefined
                // }

                me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}/status?serverUrl=${serverUrl}&token=${serverToken}`).then(function (result) {
                    if (result.data.status.conditions) {
                        result.data.status.conditions.forEach(function (status) {
                            if (status.type == "Ready" && status.status == "True") {
                                var ideUrl;
                                // Todo: Host 변경
                                // if (me.classInfo.ideUrl) {
                                //     ideUrl = me.classInfo.ideUrl;
                                // }

                                if (me.classInfo.ideUrl) {
                                    ideUrl = me.classInfo.ideUrl;
                                } else {
                                    ideUrl = "kuberez.io"
                                }

                                if (me.labInfo.independent) {
                                    me.ideUrl = me.classInfo.ideUrl ? `${me.getProtocol()}//${ideUrl}-${hashName}.kuberez.io` : `${me.getProtocol()}//${hashName}.kuberez.io`;
                                    me.$EventBus.$emit("endProgressing");
                                    clearInterval(me.ideInterval);
                                } else if (!me.labInfo.templateFile) {
                                    // Todo: IDE URL 조건문 추가
                                    if(!me.labInfo.addWorkSpace){
                                        me.ideUrl = me.classInfo.ideUrl ? `${me.getProtocol()}//${ideUrl}-${hashName}.kuberez.io` : `${me.getProtocol()}//${hashName}.kuberez.io`
                                    } else {
                                        me.ideUrl = me.classInfo.ideUrl ? `${me.getProtocol()}//${ideUrl}-${hashName}.kuberez.io?labId=${me.labId}#/home/project/${me.labId}` : `${me.getProtocol()}//${hashName}.kuberez.io/?labId=${me.labId}#/home/project/${me.labId}`;
                                    }
                                    me.$EventBus.$emit("endProgressing");
                                    clearInterval(me.ideInterval);
                                } else {
                                    //Todo: Host 변경
                                    me.ideUrl = me.classInfo.ideUrl ? `${me.getProtocol()}//${ideUrl}-${hashName}.kuberez.io?labId=${me.labId}#/home/project/${me.labId}` : `${me.getProtocol()}//${hashName}.kuberez.io/?labId=${me.labId}#/home/project/${me.labId}`;
                                    me.$EventBus.$emit("endProgressing");
                                    clearInterval(me.ideInterval);
                                }
                            }
                        })
                    }
                }).catch(function (e) {
                })
            },
            ideExistCheck(userEmail) {
                var me = this
                var serverToken = me.classInfo.token;
                var serverUrl = me.classInfo.serverUrl;
                var lab = me.labId;

                // if (me.classInfo.reuse) {
                //     serverUrl = 'https://104.198.88.86';
                //     serverToken = undefined
                // }

                if (me.labInfo.independent) {
                    var hashPath = me.getClassPath('labs/' + lab + '/' + userEmail);
                } else {
                    var hashPath = me.getClassPath(userEmail);
                }
                var hashName = "labs-" + me.hashCode(hashPath);
                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides/${hashName}/status?serverUrl=${serverUrl}&token=${serverToken}`).then(function (result) {
                        console.log(result)
                        resolve(result)
                    }).catch(function (e) {
                        resolve(false)
                    })
                })
            },
            makeConfig(userId) {
                var me = this
                if (me.classInfo.archive) {
                    var archivePath = 'archive'
                } else {
                    var archivePath = 'running'
                }
                return new Promise(async function (resolve, reject) {
                    var course = me.courseId;
                    var lab = me.labId;
                    var userEmail = userId;

                    var serverUrl = me.classInfo.serverUrl;

                    if (!me.classInfo.serverUrl || me.classInfo.reuse) {
                        serverUrl = window.MODE == "onprem" ? window.CLUSTER_ADDRESS : 'https://218.236.22.12:6443';
                    }
                    if (me.labInfo.independent) {
                        // lab 별로
                        var hashPath = me.getClassPath('labs/' + lab + '/' + userEmail);
                        var filePath = hashPath
                    } else {
                        // 클래스 단위로
                        var hashPath = me.getClassPath(userEmail);
                        var filePath = me.getClassPath('labs/' + userEmail);
                    }
                    var list = window.location.hostname.split('.');
                    var configPath = me.getClassPath('userConfig/' + userEmail);
                    var hashName = "labs-" + me.hashCode(hashPath);
                    var host = "";
                    list.forEach(function (item, idx) {
                        if (idx == 0) {
                            return;
                        }
                        if (idx == 1) {
                            host += item
                        } else {
                            host += "." + item
                        }
                    })

                    var ideUrl;
                    if (me.classInfo.ideUrl) {
                        ideUrl = me.classInfo.ideUrl;
                    } else {
                        ideUrl = window.MODE == "onprem" ? me.getTenantId() : "kuberez.io";
                    }
                    var serviceAccount = await me.existServiceAccountCheck(hashName);

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms))
                    }

                    while (!serviceAccount) {
                        serviceAccount = await me.existServiceAccountCheck(hashName);
                        await sleep(3000)
                    }

                    var secretName = serviceAccount.data.secrets[0].name
                    var secret = await me.getSecret(hashName, secretName);

                    while (!secret) {
                        secret = await me.getSecret(hashName, secretName)
                        await sleep(3000)
                    }

                    var decodedToken = atob(secret);

                    // 6. upload Config
                    // 클러스터명, 서버ip 바꿔줄 것!

                    var configJson = {
                        "apiVersion": "v1",
                        "clusters": [
                            {
                                "cluster": {
                                    "insecure-skip-tls-verify": true,
                                    "server": serverUrl
                                },
                                "name": "kcb-test2.k8s.local"
                            }
                        ],
                        "contexts": [
                            {
                                "context": {
                                    "cluster": "kcb-test2.k8s.local",
                                    "namespace": hashName,
                                    "user": hashName
                                },
                                "name": "kcb-test2.k8s.local"
                            }
                        ],
                        "current-context": "kcb-test2.k8s.local",
                        "kind": "Config",
                        "preferences": {},
                        "users": [
                            {
                                "name": hashName,
                                "user": {
                                    "token": decodedToken
                                }
                            }
                        ]
                    }

                    var clazz = me.classId;
                    var clazzName = clazz
                    var fileServerUrl;
                    if (ideUrl == 'kuberez.io') {
                        fileServerUrl = "kuberez.io";
                    } else {
                        fileServerUrl = ideUrl
                    }

                    // Todo: Host 변경
                    me.$http.post(`${me.fileServerUrl}/api/uploadConfig`, {
                        // me.$http.post(`${me.getProtocol()}//file.${fileServerUrl}/api/uploadConfig`, {
                        "config": JSON.stringify(configJson),
                        "tenant": me.getTenantId(),
                        "course": me.courseId,
                        "clazz": clazzName,
                        "userId": userEmail.replace("@", "_"),
                        "status": archivePath,
                        "hashName": hashName
                    }, {
                        headers: {
                            "Content-Type": "application/json; charset=UTF-8"
                        }
                    }).then(function () {
                        me.$EventBus.$emit("nextStep")
                        resolve()
                    }).catch(error => alert(error))
                    // await me.putObject('storage://labs-msaez.io/' + archivePath + '/' + configPath + '/config', configJson)
                    // resolve()
                })
            },
            messageProcessing(e) {
                var me = this
                try {
                    if (e.data.message === 'code') {
                        console.log("code!!!!!")
                        if (me.liveSync) {
                            if (e.data.start) {
                                me.codeStatus = false
                            }
                            me.totalCount = e.data.count;

                            var ideHost = window.MODE == "onprem" ? me.getTenantId() : "kuberez.io";
                            $('iframe').get().forEach(function (iframe, idx) {
                                if (iframe.getAttribute("iframe-src")) {
                                    if (iframe.getAttribute("iframe-src").includes(ideHost)) {
                                        var body = $('iframe').get(idx);
                                        // var message = JSON.parse(JSON.stringify(e.data));

                                        console.log("labId: " + me.labId);
                                        var split = e.data.path.split("/");

                                        var result = "";
                                        var beforeResult = "";
                                        if(me.labId) {
                                            split.forEach(function(path, idx){
                                                if(idx == 0) {
                                                    result += me.labId + "/"
                                                } else if(idx == split.length-1) {
                                                    result += path
                                                } else {
                                                    result += path + "/"
                                                }
                                            })
                                        }
                                        var message = {
                                            "type": e.data.type,
                                            "path": "home/project/" + (result.length == 0 ? e.data.path.replace(/\/\//gi, '\/') : result),
                                            "content": e.data.content
                                        }
                                        if (e.data.beforePath != undefined) {
                                            var beforeSplit = e.data.beforePath.split("/");
                                            if(me.labId) {
                                                beforeSplit.forEach(function(path, idx){
                                                    if(idx == 0) {
                                                        beforeResult += me.labId + "/"
                                                    } else if(idx == split.length-1) {
                                                        beforeResult += path
                                                    } else {
                                                        beforeResult += path + "/"
                                                    }
                                                })
                                            }
                                            message.beforePath = "home/project/" + (beforeResult.length == 0 ? e.data.path.replace(/\/\//gi, '\/') : beforeResult)
                                        }
                                        if(e.data.mergeType != undefined) {
                                            message.mergeType = e.data.mergeType
                                        }
                                        message.mode = me.mode;
                                        message.demarcation = me.demarcation;
                                        body.contentWindow.postMessage(message, "*")

                                    }
                                }
                            })
                        }} else if (e.data.message === 'onMoveIDE'){
                        // me.stopLockedCount()
                        // me.startLockedCount()
                    } else if (e.data.message === 'urlOpen') {
                        window.open(e.data.value, "_blank")
                    } else if (e.data.message === 'openResourceSize') {
                        // me.openIdeResourceDialog()
                    } else if (e.data.message === 'inputTerminalName') {
                        var terminalName = window.prompt('Input Terminal Name');
                        var ideHost = "kuberez.io";
                        $('iframe').get().forEach(function (iframe, idx) {
                            if (iframe.getAttribute("iframe-src")) {
                                if (iframe.getAttribute("iframe-src").includes(ideHost)) {
                                    var body = $('iframe').get(idx);
                                    body.contentWindow.postMessage({
                                        message: 'newTerminal',
                                        terminalName: terminalName
                                    }, "*")
                                }
                            }
                        })
                    } else if (e.data.message === "endCode"){
                        me.endedCodeUpdate();
                    }
                } catch (error) {
                    console.log(error)
                }

            },
            deleteConfig() {
                var me = this
                if (me.classInfo.archive) {
                    var archivePath = 'archive'
                } else {
                    var archivePath = 'running'
                }
                return new Promise(function (resolve, reject) {
                    var course = me.$route.params.courseId;
                    var ideUrl, clazzName, userId
                    if (me.$route.params.classId) {
                        clazzName = me.$route.params.classId
                        userId = localStorage.getItem("email")
                    } else {
                        clazzName = "kubernetes"
                        userId = localStorage.getItem("email")
                    }
                    // var apiUrl = "kuberez.io";
                    // var fileServerUrl
                    // if (me.classInfo.ideUrl)
                    //     fileServerUrl = `${me.getProtocol()}//${me.classInfo.ideUrl}-file.${apiUrl}`;
                    // else
                    //     fileServerUrl = `${me.getProtocol()}//file.${apiUrl}`;
                    // "/home/minio/labs-" + param.get("tenant") + "/" + param.get("status") + "/" + param.get("course") + "/classes/" + param.get("clazz") + "/userConfig/" + param.get("userId").toString().replace("_", "@") + "/config";

                    // Todo: Host 변경
                    var lab = me.labId;
                    if (me.labInfo.independent) {
                        // lab 별로
                        var hashPath = me.getClassPath('labs/' + lab + '/' + userId);
                        var filePath = hashPath
                    } else {
                        // 클래스 단위로
                        var hashPath = me.getClassPath(userId);
                        var filePath = me.getClassPath('labs/' + userId);
                    }
                    var hashName = "labs-" + me.hashCode(hashPath);
                    me.$http.delete(`${me.fileServerUrl}/api/deleteConfig`, {
                        // me.$http.delete(`${me.getProtocol()}//file.${ideUrl}/api/deleteConfig`, {
                        data: {
                            "tenant": me.getTenantId(),
                            "course": course,
                            "clazz": clazzName,
                            "userId": userId.replace("@", "_"),
                            "status": archivePath,
                            "hashName": hashName
                        },
                        headers: {'Content-Type': 'application/json'}
                    }).then(() => resolve());
                })
            },
            getConfigFile(userId) {
                var me = this
                return new Promise(function (resolve, reject) {
                    var ideUrl;
                    if (me.classInfo.ideUrl) {
                        ideUrl = me.classInfo.ideUrl;
                    } else {
                        ideUrl = "kuberez.io";
                    }
                    var clazz = me.classId;
                    var clazzName = clazz
                    var course = me.courseId;
                    var lab = me.labId;
                    if (me.labInfo.independent) {
                        // lab 별로
                        var hashPath = me.getClassPath('labs/' + lab + '/' + userId);
                        var filePath = hashPath
                    } else {
                        // 클래스 단위로
                        var hashPath = me.getClassPath(userId);
                        var filePath = me.getClassPath('labs/' + userId);
                    }
                    var hashName = "labs-" + me.hashCode(hashPath);
                    //Todo: Host 변경
                    me.$http.post(`${me.fileServerUrl}/api/getConfig`, {
                        // me.$http.post(`${me.getProtocol()}//file.${ideUrl}/api/getConfig`, {
                        "tenant": me.getTenantId(),
                        "course": course,
                        "clazz": clazzName,
                        "userId": userId.replace("@", "_"),
                        "hashName": hashName
                    }).then(function (result) {
                        resolve(result)
                    }).catch(error => resolve(false))
                })
            },
            startIDE(userId) {
                var me = this
                if (me.classInfo.archive) {
                    var archivePath = 'archive'
                } else {
                    var archivePath = 'running'
                }
                // me.$EventBus.$emit("nextStep");
                return new Promise(async function (resolve) {
                        me.$EventBus.$emit("progressing", {
                            progressing: true,
                            type: 'Lab'
                        })
                        var course = me.courseId;
                        var clazz = me.classId;
                        var clazzName = clazz;
                        var lab = me.labId;
                        var userEmail = userId;
                        var serverToken = me.classInfo.token;
                        var serverUrl = me.classInfo.serverUrl;
                        // if(!serverToken || !serverUrl) {
                        //     alert("클래스의 서버 토큰이나 주소가 없습니다. 강사님에게 문의하여주세요.")
                        // }

                        // if (!me.classInfo.serverUrl || me.classInfo.reuse) {
                        //     serverUrl = 'https://104.198.88.86';
                        //     serverToken = undefined
                        // }

                        if (me.labInfo.independent) {
                            // lab 별로
                            var hashPath = me.getClassPath('labs/' + lab + '/' + userEmail);
                            var filePath = hashPath
                        } else {
                            // 클래스 단위로
                            var hashPath = me.getClassPath(userEmail);
                            var filePath = me.getClassPath('labs/' + userEmail);
                        }

                        var configPath = me.getClassPath('userConfig/' + userEmail);
                        var OldConfigPath = me.getOldClassPath('userConfig/' + userEmail);
                        var hashName = "labs-" + me.hashCode(hashPath);
                        me.$EventBus.$emit("hashName", {
                            hashName: hashName,
                        })
                        var image = "";
                        if (me.labInfo.customImage) {
                            image = me.labInfo.customImage
                        } else {
                            image = 'msa-repository.kubeflow.kr/msaez/theia-full-test:v9'
                        }
                        var templateFile = me.labInfo.templateFile;
                        if (templateFile) {
                            var zipPath = `/home/project/storage://labs-msaez.io/${archivePath}/${course}/labs/${lab}/${templateFile}`.replace('/home/project/', '')
                        } else {
                            var zipPath = `/home/project/storage://labs-msaez.io/${archivePath}/${course}/labs/${lab}`.replace('/home/project/', '')
                        }

                        var zipUrl = await me.getURL(zipPath);
                        // var configUrl = await me.getURL('storage://labs-msaez.io/' + archivePath + '/' + configPath + '/config'.replace('/home/project/', ''));
                        // var configUrl = await me.getURL('storage://labs-msaez.io/' + OldConfigPath + '/config'.replace('/home/project/', ''));
                        // console.log(configUrl)
                        // // Config 파일 확인
                        // var checkConfigFile;
                        // try {
                        //     checkConfigFile = await me.getString('storage://labs-msaez.io/' + archivePath + '/' + configPath + '/config');
                        // } catch (e) {
                        //     checkConfigFile = null
                        // }

                        var ideExistChecked = await me.ideExistCheck(userEmail);

                        try {
                            me.$EventBus.$emit("nextStep");
                            if (ideExistChecked) {
                                if (templateFile) {
                                    me.$EventBus.$emit("nextStep");
                                    await me.makeConfig(userId);
                                    /*
                                    * 부하 테스트 필요
                                    * */
                                    var list = window.location.hostname.split('.');
                                    var host = "";
                                    list.forEach(function (item, idx) {
                                        if (idx == 0) {
                                            return;
                                        }
                                        if (idx == 1) {
                                            host += item
                                        } else {
                                            host += "." + item
                                        }
                                    });

                                    var ideUrl;
                                    if (me.classInfo.ideUrl) {
                                        ideUrl = me.classInfo.ideUrl;
                                    } else {
                                        ideUrl = "kuberez.io";
                                    }
                                    var fileServerUrl;
                                    if (ideUrl == 'kuberez.io') {
                                        fileServerUrl = "kuberez.io";
                                    } else {
                                        fileServerUrl = ideUrl
                                    }

                                    me.$EventBus.$emit("nextStep");

                                    var params = new URLSearchParams();
                                    params.append('zipUrl', zipUrl);
                                    params.append('zipPath', `labs-${me.getTenantId()}/${archivePath}/${course}/labs/${lab}/${userEmail}/${templateFile}`);
                                    params.append('filePath', `labs-${me.getTenantId()}/${archivePath}/${filePath}`);
                                    params.append('lab', `${lab}`);
                                    params.append('hashName', hashName)
                                    //Todo: Host 변경
                                    me.$http.post(`${me.fileServerUrl}/api/upload`, params);
                                    // me.$http.post(`${me.getProtocol()}//file.${fileServerUrl}/api/upload`, params);
                                    me.$EventBus.$emit("nextStep");
                                    resolve(hashName)
                                } else {
                                    me.$EventBus.$emit("nextStep");
                                    var config = await me.getConfigFile(userId);
                                    me.$EventBus.$emit("nextStep");
                                    if (!config)
                                        await me.makeConfig(userId);
                                    // var params = new URLSearchParams();
                                    // params.append('zipUrl', zipUrl);
                                    // params.append('zipPath', `labs-${me.getTenantId()}/${archivePath}/${course}/labs/${lab}/${userEmail}/${templateFile}`);
                                    // params.append('filePath', `labs-${me.getTenantId()}/${archivePath}/${filePath}`);
                                    // params.append('lab', `${lab}`);
                                    // params.append('hashName', hashName)
                                    // Todo: Make Directory
                                    me.$http.post(`${me.fileServerUrl}/api/makeDir`, {
                                        "hashName": hashName,
                                        "path": `labs-${me.getTenantId()}/${archivePath}/${filePath}/${lab}`
                                    });
                                    me.$EventBus.$emit("nextStep");
                                    resolve(hashName)
                                }
                            }


                            var spec = {
                                "apiVersion": "uengine.org/v1alpha1",
                                "kind": "Ide",
                                "metadata": {
                                    "name": hashName
                                },
                                "spec": {
                                    "hashName": hashName,
                                    "userId": userEmail.replace("@", "_"),
                                    "templateFile": templateFile,
                                    "image": image,
                                    "tenant": me.getTenantId(),
                                    "course": course,
                                    "lab": lab,
                                    "clazz": clazzName,
                                    "zipUrl": zipUrl,
                                    "status": archivePath
                                }
                            }
                            // IDE Request CPU, Memory Setting
                            if (me.labInfo.request) {
                                spec["request"] = me.labInfo.request;
                            }
                            await me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/apis/uengine.org/v1alpha1/namespaces/default/ides?serverUrl=${serverUrl}&token=${serverToken}`, spec);
                            me.$EventBus.$emit("nextStep");
                            // await me.$http.post(`${me.getProtocol()}api.${me.getTenantId()}/api/v1/namespaces/default/services?serverUrl=${serverUrl}&token=${serverToken}`, svcSpec);

                            var operatorCheck = await me.checkIdeOperator(hashName);

                            function sleep(ms) {
                                return new Promise(resolve => setTimeout(resolve, ms))
                            }

                            while (!operatorCheck) {
                                operatorCheck = await me.checkIdeOperator(hashName);
                                await sleep(3000)
                            }
                            // 기존 Config를 삭제 처리함.
                            await me.deleteConfig();
                            // 새로 Config 생성.
                            await me.makeConfig(userId);

                            var metaData = {
                                email: userEmail,
                                status: "start",
                                startTime: new Date(),
                                result: false
                            }
                            me.$minioClient.putObject(`labs-${me.getTenantId()}`, `${archivePath}/${filePath}/User_Lab_Metadata.json`, JSON.stringify(metaData))
                            resolve(hashName)
                        } catch
                            (e) {
                            console.error(e)
                        }
                    }
                )
            }
        }
    }
</script>

<style scoped>

</style>