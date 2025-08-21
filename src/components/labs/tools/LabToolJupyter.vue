<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div style="height: 100%; width: 100%" align="center" v-if="!small">
        <v-progress-circular
                v-if="!ideUrl"
                style="margin-top: 25%; color: #1976d2 !important"
                :size="130"
                color="primary"
                indeterminate
        >
            <a>별도의 탭에 jupyter가 실행됩니다. (2분 가량 소요)</a>
        </v-progress-circular>
        <vue-friendly-iframe
                v-else
                :src="ideUrl"
                style="height: 100%; width: 100%"
                frameborder="0" gesture="media" allow="encrypted-media"></vue-friendly-iframe>
    </div>
    <div v-else>
        <v-subheader>
            Notebook
        </v-subheader>
        <div class="py-3" style="transform: scale(0.7) translate(5%,-21%);" v-html="notebook"></div>

        <v-divider></v-divider>
    </div>

</template>

<script>

    import LabBase from "../LabStorageBase"
    // import LabBase from "../LabBase"
    import LogViewer from '../LogViewer'
    import json2yaml from 'json2yaml'
    //import nb from "notebookjs";

    export default {
        name: 'lab-tool-jupyter', 
        components: {
            LogViewer
        },
        mixins: [LabBase],
        props: {
            value: Object,
            labInfo: Object,
            small: Boolean
        },

        data() {
            return {
                ideInterval: '',
                ideUrl: null, //refactor reason #NIM, #VIFWN
                interval: null, //refactor reason #NIM, #VIFWN
                userId: this.$route.params.userId,
                oldResult: null,
            }
        },

        computed:{
            notebook(){
                var ipynb = JSON.parse(this.value.result);
                var notebook = nb.parse(ipynb);
                return notebook.render().outerHTML;
                //return "notebook"
            }
        },

        created: async function () {

            var me = this;
            me.userId = me.$route.params.userId;

            if (!me.small) {
                var hashName = await me.startIDE();
                this.ideInterval = setInterval(function () {
                    me.ideRunningCheck(hashName);
                    //me.loading = false  // refactor reason #NIM, #VIFWN
                }, 3000)
            }
            //TODO: 아래 API 가 안먹히니 천상 polling 을 직접 처리해야 할듯..
            me.interval = setInterval(async function () {
                try {
                    var log = await me.getString(me.getClassPath(`storage://labs-msaez.io/running/labs/${me.labId}/${me.userId}/Untitled1.ipynb`))
                    me.onResultChange(log)
                } catch (e) {

                }
            }, 3000)
        },

        mounted: function () {

        },
        beforeDestroy() {
            clearInterval(this.interval)
        },
        methods: {
            onResultChange(change) {
                if (this.oldResult != change) {
                    this.value.result = change;
                    this.oldResult = change;
                    this.$emit('input', this.value);
                    this.$emit('change', this.value);
                }

            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            ideRunningCheck(hashName) {
                var me = this
                me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}/status`).then(function (result) {
                    if (result.data.status.conditions) {
                        result.data.status.conditions.forEach(function (status) {
                            if (status.type == "Ready" && status.status == "True") {
                                window.open(`${me.getProtocol()}//${hashName}.bzdvops.io`, "_blank")
                                clearInterval(me.ideInterval);
                            }
                        })
                    }
                }).catch(function (e) {
                })
            },
            ideExistCheck(hashName) {
                var me = this
                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}/status`).then(function (result) {

                        resolve(true)
                    }).catch(function (e) {
                        resolve(false)
                    })
                })
            },
            startIDE() {
                var me = this
                return new Promise(async function (resolve) {
                    var course = me.courseId;
                    var clazz = me.classId;
                    var lab = me.labId;
                    var userEmail = me.userId;
                    var filePath =  me.getClassPath('labs/' + lab + '/' + userEmail);
                    var configPath = me.getClassPath('userConfig/' + userEmail);
                    var hashName = "jpt-" + me.hashCode(filePath);
                    var templateFile = me.labInfo.templateFile;
                    var templateFileUrl = ""
                    var ideExistChecked = await me.ideExistCheck(hashName);
                    if (ideExistChecked) {
                        resolve(hashName)

                        return;
                    }


                    var podSpec = 
                        {
                            "apiVersion": "v1",
                            "kind": "Pod",
                            "metadata": {
                                "name": `${hashName}`,
                                "labels": {
                                    "environment": "jpt",
                                    "userId": me.userId.replace('@', '_'),
                                    "app": `${hashName}`
                                }
                            },
                            "spec": {
                                "containers": [
                                    {
                                        "name": `${hashName}`,
                                        "image": "jupyter/minimal-notebook:latest",
                                    
                                        "ports": [
                                            {"containerPort": 8888}
                                        ],
                                        "command": [
                                            "start-notebook.sh"
                                        ],
                                        "args": ["--NotebookApp.token=''", "--LabApp.allow_remote_access='True'", "--LabApp.allow_origin='*'"],
                                        "env": [
                                            {
                                                "name": "COURSE",
                                                "value": `${course}`
                                            },
                                            {
                                                "name": "LABS",
                                                "value": `${lab}`
                                            },
                                            {
                                                "name": "CLAZZ",
                                                "value": `${clazz}`
                                            },
                                            {
                                                "name": "EMAIL",
                                                "value": `${userEmail}`
                                            },

                                        ],
                                        "resources": {
                                            "requests": {
                                                "memory": "2Gi"
                                            }
                                        },
                                        "volumeMounts": [
                                            {
                                                "mountPath": "/home/jovyan/work",
                                                "name": "test-storage",
                                                "subPath": `labs/${filePath}`
                                            }
                                        ]
                                    }
                                ],
                                "volumes": [
                                    {
                                        "name": "test-storage",
                                        "persistentVolumeClaim": {
                                            "claimName": "nfs"
                                        }
                                    }
                                ]
                            }
                        };

                    var svcSpec =    
                        {
                            "apiVersion": "v1",
                            "kind": "Service",
                            "metadata": {
                                "labels": {
                                    "environment": "labs",
                                    "app": `${hashName}`,
                                    "userId": me.userId.replace('@', '_')
                                },
                                "name": `${hashName}`,
                                "namespace": "default"
                            },
                            "spec": {
                                "ports": [
                                    {
                                        "port": 8888,
                                        "protocol": "TCP",
                                        "targetPort": 8888
                                    }
                                ],
                                "selector": {
                                    "app": `${hashName}`
                                },
                                "sessionAffinity": "None",
                                "type": "ClusterIP"
                            },
                            "status": {
                                "loadBalancer": {}
                            }
                        };
                    
                    
                    if (false && me.labInfo.templateFile) {
                        podSpec.spec.initContainers = 
                        [
                            {
                                "name": "mkdir",
                                "image": "yauritux/busybox-curl",
                                "volumeMounts": [
                                    {
                                        "mountPath": "/home/jovyan/work",
                                        "name": "test-storage",
                                        "subPath": `labs`
                                    }
                                ],
                                "command": ["mkdir", "-p", `/home/jovyan/work/${filePath}`],
                            },
                            {
                                "name": "downloadtemplate",
                                "image": "yauritux/busybox-curl",
                                "volumeMounts": [
                                    {
                                        "mountPath": "/home/jovyan/work",
                                        "name": "test-storage",
                                        "subPath": `labs/${filePath}`
                                    }
                                ],
                                "command": ["curl", "-L", templateFileUrl, '--create-dirs', '-o', '/home/jovyan/work/' + templateFile]
                            }
                        ];

                    }

                    try{
                        await me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods`, podSpec);

                        await me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/services`, svcSpec);

                        var metaData = {
                            email: userEmail,
                            status: "start",
                            startTime: new Date(),
                            result: false
                        }

                        me.putObject('storage://labs-msaez.io/running/labs', `${filePath}/User_Lab_Metadata.json`, JSON.stringify(metaData))

                        resolve(hashName)
                    }catch(e){
                        alert(e.message);
                        console.log(new Error("failed to create Pod or Svc for jupyter", e))
                        
                    }
                })
            }
        },

    }
</script>




