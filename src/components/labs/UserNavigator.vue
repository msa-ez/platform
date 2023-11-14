<template>
    <v-navigation-drawer
            v-model="value.drawer"
            clipped
            app
            stateless
            width="400"
    >
        <div align="right" style="margin-top: 5px; margin-right: 5px; margin-bottom: 5px">
            <v-icon text @click="closeNavi()">mdi-close</v-icon>
        </div>
        <v-divider></v-divider>
        <v-icon x-large
                v-bind:style="{ color: value.userInfo.color }">
            mdi-account-circle
        </v-icon>
        {{value.userInfo.name}} - {{value.userInfo.email}}
        <v-list dense>
            <v-subheader>
                CheckPoint
            </v-subheader>
            <v-list-item v-for="(item,idx) in value.userInfo.labsData.checkPoints" :key="idx">
                <v-list-item-content>
                    <v-list-item-title>{{idx + 1}}. {{item.text}}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                    <v-checkbox
                            v-if="renderComponent && (item.javascript || item.regExp)"
                            v-model="item.status"
                            success
                            readonly
                    ></v-checkbox>
                    <v-checkbox
                            v-else-if="renderComponent"
                            v-model="item.status"
                            success
                    ></v-checkbox>
                </v-list-item-action>
            </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list dense v-if="value.userInfo.logs">
            <v-subheader>
                Logs
            </v-subheader>
            <log-viewer v-model="value.userInfo.logs"></log-viewer>
        </v-list>
        <v-list dense v-else align="center">
            <v-subheader>
                Logs
            </v-subheader>
            로그 없음.
        </v-list>
        <v-divider></v-divider>
        <v-btn primary v-if="isAdmin || value.userInfo.email == email"
               @click="startLab(value.userInfo.labsData,value.userInfo.email)">Start
        </v-btn>
    </v-navigation-drawer>
</template>

<script>
    import LogViewer from './LogViewer'

    var Minio = require('minio');
    export default {
        name: "UserNavigator",
        components: {
            LogViewer
        },
        props: {
            value: Object,
        },
        data() {
            return {
                renderComponent: true,
                email: ''
            }
        },
        mounted() {
            this.email = localStorage.getItem('email')
        },
        computed: {
            isAdmin() {
                if (this.email.includes('uengine.org')) {
                    return true
                } else {
                    return false
                }
            }
        },

        watch: {
            "value.userInfo.labsData.checkPoints": {
                immediate: true,
                deep: true,
                handler() {
                    var me = this
                    me.forceRerender();
                }
            },
            "value.userInfo.logs": {
                immediate: true,
                handler(newVal) {
                    var me = this
                    if(me.value.userInfo.tool == 'theia') {
                        if (newVal) {
                            this.value.userInfo.labsData.checkPoints.forEach(function (val, idx) {
                                var checkPointResult = me.checkingCheckPoint(val, newVal);
                                val["status"] = checkPointResult;
                                me.forceRerender();
                            })
                        } else {
                            this.value.userInfo.labsData.checkPoints.forEach(function (val) {
                                val["status"] = false
                            })
                        }
                    }
                }
            }
        },
        methods: {
            closeNavi() {
                this.value.drawer = false
                this.$emit('update:value', this.value)
            },
            checkingCheckPoint(checkPoint, log) {
                var testLog = log.replace(/[\n\r]/g, '')
                testLog = testLog.replace(/'/gi, "\\'");
                testLog = testLog.replace(/"/gi, '\\"');
                return eval(checkPoint.regExp + '.test("' + testLog + '")');
                // return eval(checkPoint.regExp + '.test("' + log + '")')
            },
            forceRerender() {
                // Remove my-component from the DOM
                this.renderComponent = false;

                this.$nextTick(() => {
                    // Add the component back in
                    this.renderComponent = true;
                });
            },
            getInstruction(labs) {
                var me = this
                return new Promise(function (resolve) {
                    var path = `${me.$route.params.course}/planed/${labs}/instruction.md`
                    me.$minioClient.getObject('labs', path, function (err, dataStream) {
                        dataStream.on('data', function (chunk) {
                            var string = new TextDecoder("utf-8").decode(chunk);
                            resolve(string)
                        })
                    })
                })
            },
            async startLab(lab, index) {
                var me = this
                var key = me.$route.params.labName
                if (lab.tool == 'theia') {
                    // theia start
                    me.startIDE(lab, key, lab.templateFlie, index)
                } else if (lab.tool == 'event-storming') {
                    // eventstorming start
                    var instruction = await me.getInstruction(key);
                    var emitData = {
                        "labName": lab.labName,
                        "instruction": instruction,
                        "checkPoints": lab.checkPoints,
                        "hints": lab.hints,
                        "lab": key,
                        "email": index
                    }

                    me.$EventBus.$emit('storming-start', emitData)
                    me.$router.push(`/courses/${this.$route.params.course}/${this.$route.params.clazzName}/${key}/eventstorming`)
                    me.$nextTick(function () {
                        me.$EventBus.$emit('progressValue', false)
                    })
                } else if (lab.tool == 'kubernetes') {
                    // Todo: Kubernetes
                }
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
            async startIDE(labs, templateFlie, idx) {
                var me = this
                // me.overlay = true
                if (typeof window == 'undefined') {
                    var email = localStorage.getItem('email')
                }else{
                    var email = window.localStorage.getItem('email')
                }
                var lab = this.$route.params.labName.replace(/\s/g, '_');
                console.log(lab)
                var course = me.$route.params.course;
                var clazz = me.$route.params.clazzName
                var filePath = course + '/classes/' + clazz + '/' + lab + '/' + email;
                var hashName = "labs-" + me.hashCode(filePath);
                var ideExistChecked = await this.ideExistCheck(hashName);
                console.log(`/home/project/${filePath}/${templateFlie}`);
                if (ideExistChecked) {
                    // me.labsList[idx].overlay = false;
                    // Object.keys(me.labsList).forEach(function (key) {
                    //     console.log("key: ", key, "labs: ", labs)
                    //     if (key != labs) {
                    //         console.log("clearInterval");
                    //         clearInterval(me.labsList[key].logInterval)
                    //     }
                    // })
                    var key = me.$route.params.labName
                    var instruction = await me.getInstruction(key);
                    var emitData = {
                        "labData": labs,
                        "ideURL": `http://${hashName}.es2cd.io`,
                        "instruction": instruction,
                        "checkPoints": labs.checkPoints,
                        "hints": labs.hints,
                        "email": email
                    }

                    // me.$EventBus.$on('clearInterval', function (intervalLab) {
                    //     console.log("clearInterVal", me.labsList[intervalLab])
                    //     clearInterval(me.labsList[intervalLab].logInterval)
                    // })
                    me.$EventBus.$emit('ide-open', emitData)
                }
                // console.log("unzip", "-n", `/home/project/${course}/${labs}/${templateFlie}.zip`, "-d", `/home/project/${filePath}`);
                me.$http.post(`http://api.${me.getTenantId()}/api/v1/namespaces/default/pods`, {
                    "apiVersion": "v1",
                    "kind": "Pod",
                    "metadata": {
                        "name": `${hashName}`,
                        "labels": {
                            "environment": "labs",
                            "app": `${hashName}`
                        }
                    },
                    "spec": {
                        "initContainers": [
                            {
                                "name": "mkdir",
                                "image": "busybox",
                                "command": ["mkdir", "-p", `/home/project/${filePath}/${labs.templateFlie}`],
                                "volumeMounts": [
                                    {
                                        "mountPath": "/home/project",
                                        "name": "test-storage",
                                        "subPath": "labs"
                                    }
                                ]
                            },
                            {
                                "name": "unzip",
                                "image": "busybox",
                                "command": ["unzip", "-n", `/home/project/${course}/planed/${lab}/${labs.templateFlie}`, "-d", `/home/project/${filePath}/${labs.templateFlie}`],
                                "volumeMounts": [
                                    {
                                        "mountPath": "/home/project",
                                        "name": "test-storage",
                                        "subPath": "labs"
                                    }
                                ]
                            }
                        ],
                        "containers": [
                            {
                                "name": `${hashName}`,
                                "image": "sanghoon01/theia-kafka",
                                "securityContext": {
                                    "privileged": true
                                },
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
                                        "value": `${email}`
                                    },

                                ],
                                "resources": {
                                    "requests": {
                                        "memory": "2Gi"
                                    }
                                },
                                "volumeMounts": [
                                    {
                                        "mountPath": "/var/run/docker.sock",
                                        "name": "dockersock"
                                    },
                                    {
                                        "mountPath": "/home/project",
                                        "name": "test-storage",
                                        "subPath": `labs/${filePath}/${labs.templateFlie}`
                                    }
                                ],
                            }
                        ],
                        "volumes": [
                            {
                                "name": "dockersock",
                                "hostPath": {
                                    "path": "/var/run/docker.sock",
                                    "type": "File"
                                }
                            },
                            {
                                "name": "test-storage",
                                "persistentVolumeClaim": {
                                    "claimName": "nfs"
                                }
                            }
                        ]
                    }
                }).then(function () {
                    me.$http.post(`http://api.${me.getTenantId()}/api/v1/namespaces/default/services`, {
                        "apiVersion": "v1",
                        "kind": "Service",
                        "metadata": {
                            "labels": {
                                "environment": "labs",
                                "app": `${hashName}`
                            },
                            "name": `${hashName}`,
                            "namespace": "default"
                        },
                        "spec": {
                            "ports": [
                                {
                                    "port": 3000,
                                    "protocol": "TCP",
                                    "targetPort": 3000
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
                    }).then(
                        function () {
                            setTimeout(async function () {
                                // me.labsList[idx].overlay = false;
                                // Object.keys(me.labsList).forEach(function (key) {
                                //     if (key != labs) {
                                //         clearInterval(me.labsList[key].logInterval)
                                //     }
                                // })
                                var key = me.$route.params.labName
                                var instruction = await me.getInstruction(key);
                                var emitData = {
                                    "labData": labs,
                                    "ideURL": `http://${hashName}.es2cd.io`,
                                    "instruction": instruction,
                                    "checkPoints": labs.checkPoints,
                                    "hints": labs.hints,
                                    "email": email
                                }
                                me.$EventBus.$emit('ide-open', emitData)
                                // window.open(`http://${hashName}.msaez.io`, '_blank')
                            }, 30000)
                            // me.$EventBus.$on('clearInterval', function (intervalLab) {
                            //     clearInterval(me.labsList[intervalLab].logInterval)
                            // })
                            var metaData = {
                                email: email,
                                status: "start",
                                startTime: new Date(),
                                result: false
                            }
                            me.$minioClient.putObject('labs', `${filePath}/User_Lab_Metadata.json`, JSON.stringify(metaData))
                        }
                    )
                })
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
        }

    }
</script>

<style scoped>

</style>