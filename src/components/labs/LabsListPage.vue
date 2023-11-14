<template>
    <v-container fluid>
        <v-row>
            <!--            <v-col v-if="loadingStatus" align="center" justify="center">-->

            <!--            </v-col>-->
            <v-col v-for="(lab, key, index) in sortedLabList" :key="index" md="3">
                <v-card style="width: 400px;" v-bind:class="{ success: lab.checkPoints.every(checkCheckPointStatus) }">
                    <v-overlay
                            :absolute="true"
                            :opacity="0.5"
                            :value="lab.overlay"
                    >
                        <v-progress-circular
                                :size="50"
                                color="primary"
                                indeterminate
                        ></v-progress-circular>
                    </v-overlay>

                    <v-card-title>
                        {{lab.labName}}
                    </v-card-title>
                    <v-card-text>
                        시나리오 : {{lab.labScenario}} <br>
                        제한시간 : {{lab.labTime}}분
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <!-- <v-btn @click="lab.overlay = true && startLab(lab, key, index)">
                            시작
                        </v-btn> -->

                        <v-btn :to="'/courses/running/'+courseId+'/'+classId+'/'+labId + '/class-room'">>
                            시작
                        </v-btn>

                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    var Minio = require('minio');
    import LogViewer from './LogViewer'

    export default {
        name: "ClazzListPage",
        components: {
            LogViewer
        },
        data: () => ({
            userName: "sanghoon",
            userGroup: "gmail",
            clazz: 'uengine',
            labsList: {},
            overlay: false,

        }),
        computed: {
            sortedLabList() {
                var me = this
                var o = me.labsList
                var sorted = {},
                    key, a = [];
                // 키이름을 추출하여 배열에 집어넣음
                for (key in o) {
                    if (o.hasOwnProperty(key)) a.push(key);
                }
                // 키이름 배열을 정렬
                a.sort();
                // 정렬된 키이름 배열을 이용하여 object 재구성
                for (key = 0; key < a.length; key++) {
                    sorted[a[key]] = o[a[key]];
                }
                return sorted;

            }
        },
        watch: {
            labsList: {
                immediate: true,
                handler(newVal) {
                    var me = this

                }
            }
        },
        beforeDestroy() {
            var me = this
            Object.keys(me.labsList).forEach(function (lab) {
                if (me.labsList[lab].logInterval) {
                    clearInterval(me.labsList[lab].logInterval);
                }
            })
        },
        mounted() {
            var me = this
            this.getLabsList();
        },
        methods: {
            checkingCheckPoint(checkPoint, log) {
                var testLog = log.replace(/[\n\r]/g, '')

                var reg = new RegExp(checkPoint.regExp);
                testLog = testLog.replace(/'/gi, "\\'");
                testLog = testLog.replace(/"/gi, '\\"');
                return eval(checkPoint.regExp + '.test("' + testLog + '")');
                // return eval(checkPoint.regExp + ".test('" + testLog + "')");


                // return eval(checkPoint.regExp + '.test("' + log + '")')
            },
            getLog(labName) {
                var me = this
                var stream = this.$minioClient.listObjects('labs', this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/' + labName + '/' + window.localStorage.getItem('email') + '/', false);
                stream.on('data', function (data) {
                    if (data.name) {
                        if (data.name.includes('result.log')) {
                            me.$minioClient.getObject('labs', data.name, function (err, dataStream) {
                                if (err) {
                                    clearInterval(labName)
                                    return console.log(err)
                                }
                                dataStream.on('data', function (chunk) {
                                    var string = new TextDecoder("utf-8").decode(chunk);
                                    var testLog = string.replace(/[\n\r]/g, '')
                                    me.labsList[labName].checkPoints.forEach(function (item, idx) {
                                        me.labsList[labName].checkPoints[idx]["status"] = me.checkingCheckPoint(item, string)
                                    })
                                    me.$set(me.labsList[labName], 'logs', string);
                                    me.$EventBus.$emit('updateLog', string)
                                })
                            })
                        }
                    }
                })
            },
            async startLab(lab, key, index) {
                var me = this
                if (lab.tool == 'theia' || lab.tool == 'ide') {
                    // theia start
                    me.startIDE(lab.tool, key, lab.templateFlie, index)
                } else if (lab.tool == 'event-storming') {
                    // eventstorming start
                    var instruction = await me.getInstruction(key);
                    var emitData = {
                        "labName": lab.labName,
                        "instruction": instruction,
                        "checkPoints": me.labsList[key].checkPoints,
                        "hints": me.labsList[key].hints,
                        "lab": key
                    }

                    me.$EventBus.$emit('storming-start', emitData)
                    me.$router.push(`/courses/student/${this.$route.params.course}/${this.$route.params.clazzName}/eventstorming`)
                    me.$nextTick(function () {
                        me.$EventBus.$emit('progressValue', false)
                    })
                } else if (lab.tool == 'kubernetes') {
                    // Todo: Kubernetes
                }
            },
            getLabsList() {
                var me = this
                // kubernetes1/runningClass/sk1st/
                var labsPath = `${this.$route.params.course}/runningClass/${this.$route.params.clazzName}/`
                var stream = this.$minioClient.listObjects('labs', labsPath, true)
                stream.on('data', function (obj) {
                    if (obj.name.includes('Class_Metadata'))
                        me.$minioClient.getObject('labs', obj.name, function (err, dataStream) {
                            if (err) {
                                return console.log(err)
                            }
                            dataStream.on('data', function (chunk) {
                                var string = new TextDecoder("utf-8").decode(chunk);
                                var json = JSON.parse(string)
                                var tmpArray = labsPath.split('/');
                                var path = tmpArray[0] + '/planed/'
                                json.labsList.forEach(function (lab) {
                                    var labStream = me.$minioClient.listObjects('labs', path + lab, true)
                                    labStream.on('data', function (obj) {
                                        if (obj.name.includes('Lab_Metadata.json')) {
                                            me.$minioClient.getObject('labs', obj.name, function (err, labDataStream) {
                                                if (err) {
                                                    return console.log(err)
                                                }
                                                labDataStream.on('data', function (labChunk) {
                                                    var string = new TextDecoder("utf-8").decode(labChunk);
                                                    var json = JSON.parse(string)
                                                    json["overlay"] = false;
                                                    // me.labsList.push(json)
                                                    me.$set(me.labsList, lab, json)
                                                })
                                            })
                                        }
                                    })
                                })

                            })
                        })
                })
                stream.on('error', function (err) {
                    console.log(err)
                })
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
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
                var email = window.localStorage.getItem('email')
                var lab = labs.replace(/\s/g, '_');

                var course = me.$route.params.course;
                var clazz = me.$route.params.clazzName
                var filePath = course + '/runningClass/' + clazz + '/' + lab + '/' + email;
                var hashName = "labs-" + me.hashCode(filePath);
                var ideExistChecked = await this.ideExistCheck(hashName);
                if (ideExistChecked) {
                    me.labsList[idx].overlay = false;
                    Object.keys(me.labsList).forEach(function (key) {
                        if (key != labs) {
                            clearInterval(me.labsList[key].logInterval)
                        }
                    })
                    var instruction = await me.getInstruction(labs);
                    var emitData = {
                        "labName": labs,
                        "ideURL": `${me.getProtocol()}//${hashName}.msaez.io`,
                        "instruction": instruction,
                        "checkPoints": me.labsList[idx].checkPoints,
                        "hints": me.labsList[idx].hints,
                    }

                    me.$EventBus.$on('clearInterval', function (intervalLab) {
                        console.log("clearInterVal", me.labsList[intervalLab])
                        clearInterval(me.labsList[intervalLab].logInterval)
                    })
                    me.$EventBus.$emit('ide-open', emitData)
                }
                // console.log("unzip", "-n", `/home/project/${course}/${labs}/${templateFlie}.zip`, "-d", `/home/project/${filePath}`);
                me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods`, {
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
                                "command": ["mkdir", "-p", `/home/project/${filePath}/${templateFlie}`],
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
                                "command": ["unzip", "-n", `/home/project/${course}/planed/${labs}/${templateFlie}`, "-d", `/home/project/${filePath}/${templateFlie}`],
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
                                    "privileged": true,
                                    "runAsUser": 0
                                },
                                "env": [
                                    {
                                        "name": "COURSE",
                                        "value": `${course}`
                                    },
                                    {
                                        "name": "LABS",
                                        "value": `${labs}`
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
                                        "subPath": `labs/${filePath}/${templateFlie}`
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
                    me.$http.post(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/services`, {
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
                                me.labsList[idx].overlay = false;
                                Object.keys(me.labsList).forEach(function (key) {
                                    if (key != labs) {
                                        clearInterval(me.labsList[key].logInterval)
                                    }
                                })
                                var instruction = await me.getInstruction(labs);
                                var emitData = {
                                    "labName": labs,
                                    "ideURL": `http://${hashName}.msaez.io`,
                                    "instruction": instruction,
                                    "checkPoints": me.labsList[idx].checkPoints,
                                    "hints": me.labsList[idx].hints,
                                }
                                me.$EventBus.$emit('ide-open', emitData)
                                // window.open(`http://${hashName}.msaez.io`, '_blank')
                            }, 30000)
                            me.$EventBus.$on('clearInterval', function (intervalLab) {
                                clearInterval(me.labsList[intervalLab].logInterval)
                            })
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
            getInstruction(labs) {
                var me = this
                return new Promise(function (resolve) {
                    var path = `${me.$route.params.course}/planed/${labs}/instruction.md`
                    console.log(path)

                    me.$minioClient.getObject('labs', path, function (err, dataStream) {
                        dataStream.on('data', function (chunk) {
                            var string = new TextDecoder("utf-8").decode(chunk);

                            resolve(string)
                        })
                    })
                })
            },
            checkCheckPointStatus(lab) {
                var me = this
                return lab.status
            }
        }
    };
</script>
