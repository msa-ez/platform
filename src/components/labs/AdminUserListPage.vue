<template>
    <v-container fluid>
        <!--        <modal name="code-modal" :height='"auto"' scrollable>-->
        <!--            -->
        <!--        </modal>-->
        <div v-if="!isAdmin"> 권한 없음.</div>
        <v-row v-else>
            <v-col v-if="renderComponent" v-for="(user, key, idx) in sortedUserList" :key="idx">
                <v-card v-if="Object.keys(user).length === 0" style="width: 400px" v-bind:class="{ success: user.checkPoints.every(checkCheckPointStatus) }">
                    <v-card-title>
                        {{key}}
                    </v-card-title>
                    <v-card-text>
                        상태 : 시작하지 않았습니다.
                    </v-card-text>
                    <!--                    <v-card-actions>-->
                    <!--                        <v-spacer></v-spacer>-->
                    <!--                        <v-btn @click="startIDE(lab.labName,lab.templateFlie)">시작</v-btn>-->
                    <!--                    </v-card-actions>-->
                </v-card>
                <v-card v-else style="max-width: 600px">
                    <v-card-title>
                        {{key}}
                    </v-card-title>
                    <v-card-text>
                        상태 : {{user.status}} <br>
                        결과 : {{user.result}} <br>
                        IDE 상태 : {{user.ideStatus}} <br>
                    </v-card-text>
                    <v-card-text v-if="user.logs">
                        <log-viewer
                                v-model="user.logs"></log-viewer>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn v-if="user.ideStatus == 'Running'" @click="startIDE(key)">IDE</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import LogViewer from './LogViewer'

    var _ = require('lodash');
    export default {
        name: "ClazzListPage",
        components: {
            LogViewer
        },

        data: () => ({
            userList: {},
            labsData: {},
            overlay: false,

            isAdmin: false,
            renderComponent: true
        }),
        computed: {
            sortedUserList() {
                var me = this
                var o = me.userList
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
            sortedUserList: {
                deep: true,
                handler() {
                    var me = this
                    me.forceRerender();
                }

            },
            userList(newVal) {
                var me = this
                var userNameList = Object.keys(newVal);
                userNameList.forEach(function (userEmail) {
                    clearInterval(userEmail)
                    setInterval(function () {
                        me.getLog(userEmail)
                    }, 5000)
                })
                var path = this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/' + this.$route.params.labName + '/'
            }
        },
        mounted() {
            var me = this
            this.getLabsList();
            this.getAdminUserList();
            if (window.localStorage.getItem('authorized') == 'admin') {
                me.isAdmin = true
            }
        },
        methods: {
            getLabsList() {
                var me = this
                // kubernetes1/runningClass/sk1st/
                var labsPath = `${this.$route.params.course}/runningClass/${this.$route.params.clazzName}/`
            },
            getAdminUserList() {
                var me = this
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            getIDEStatus(userId) {
                var me = this
                var path = this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/' + this.$route.params.labName + '/' + userId
                var hashUrl = 'labs-' + me.hashCode(path);
                /*
                 /api/v1/namespaces/$NAMESPACE/pods/$NAME/status HTTP/1.1
                 Authorization: Bearer $TOKEN
                 Accept: application/json
                 Connection: close
                 */
                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashUrl}/status`).then(function (result) {
                        resolve(result.data.status.phase)
                    })
                })

            },
            getLog(userId) {
                var me = this
            },
            checkingCheckPoint(checkPoint, log) {
                var testLog = log.replace(/[\n\r]/g, '')

                var reg = new RegExp(checkPoint.regExp);
                testLog = testLog.replace(/'/gi, "\\'");
                testLog = testLog.replace(/"/gi, '\\"');
                return eval(checkPoint.regExp + '.test("' + testLog + '")');
            },
            async startIDE(userId) {
                var me = this
                var path = this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/' + this.$route.params.labName + '/' + userId
                var hashUrl = 'labs-' + me.hashCode(path);
                var instruction = await me.getInstruction(labs);
                var emitData = {
                    "labName": this.$route.params.labName,
                    "ideURL": `${me.getProtocol()}//${hashUrl}.msaez.io`,
                    "instruction": me.labsList[this.$route.params.labName].instruction,
                    "checkPoints": me.labsList[this.$route.params.labName].checkPoints,
                    "hints": me.labsList[this.$route.params.labName].hints,
                }
                me.$EventBus.$on('clearInterval', function (intervalLab) {
                    clearInterval(me.labsList[intervalLab].logInterval)
                })
                me.$EventBus.$emit('ide-open', emitData)
                // window.open(`http://${hashUrl}.msaez.io`, '_blank')
            },
            checkCheckPointStatus(lab) {
                var me = this
                console.log(lab)
                return lab.status
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
            },
        }
    };
</script>
