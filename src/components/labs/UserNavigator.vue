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