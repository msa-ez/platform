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
            },
            getInstruction(labs) {
                var me = this
                return new Promise(function (resolve) {
                    var path = `${me.$route.params.course}/planed/${labs}/instruction.md`
                    console.log(path)
                })
            },
            checkCheckPointStatus(lab) {
                var me = this
                return lab.status
            }
        }
    };
</script>
