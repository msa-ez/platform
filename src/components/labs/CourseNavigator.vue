<template>
    <v-navigation-drawer
            v-model="value.drawer"
            app
            clipped
            stateless
    >
        <v-list dense>
            <v-subheader>
                Instruction
            </v-subheader>
            <div v-html="compiledMarkdown"></div>
        </v-list>
        <v-divider></v-divider>
        <v-list dense>
            <v-subheader>
                checkPoints
            </v-subheader>
            <v-list-item v-for="(item,idx) in value.checkPoints" :key="idx">
                <v-list-item-content>
                    <v-list-item-title>{{idx + 1}}. {{item.text}}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                    <v-checkbox
                            v-if="renderComponent && isAdmin"
                            v-model="item.status"
                            success
                    ></v-checkbox>
                    <v-checkbox
                            v-if="renderComponent && (item.javascript || item.regExp) && !isAdmin"
                            v-model="item.status"
                            success
                            readonly
                    ></v-checkbox>
                </v-list-item-action>
            </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list dense shaped>
            <v-subheader>
                hints
            </v-subheader>
            <v-list-item v-for="(hint, idx) in value.hints" three-line>
                <v-list-item-content>
                    <v-list-item-title>{{idx + 1}}. {{hint.text}}</v-list-item-title>
                </v-list-item-content>
                <v-list-item-action>
                    <v-checkbox
                            v-if="renderComponent"
                            v-model="hint.status"
                            error
                            readonly
                    ></v-checkbox>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
    var Minio = require('minio');
    import marked from 'marked'
    
    export default {
        name: "CourseNavigator",
        props: {
            value: Object
        },
        data() {
            return {
                renderComponent: true,
                eventstorming: {},
                isAdmin: false
            }
        },
        mounted() {
            var me = this
            // me.$EventBus.$on('lab-definition', function (data) {
            //     me.eventstorming = data;
            // })
            if (localStorage.getItem('authorized') == 'admin') {
                me.isAdmin = true
            }
        },
        computed: {
            compiledMarkdown: function () {
                return marked(this.value.instruction, {sanitize: true})
            }
        },
        watch: {
            "value.logs": {
                immediate: true,
                deep: true,
                handler(newVal) {
                    let me = this
                    this.value.checkPoints.forEach(function (val, idx) {
                        me.checkPointDivision(val, newVal)
                    })
                }
            },
            "value.checkPoints": {
                deep: true,
                immediate: true,
                handler() {
                    var me = this
                    var userMetadataPath = `${this.$route.params.course}/classes/${this.$route.params.clazzName}/${this.$route.params.labName}/${me.value.email}/Labs_Metadata.json`
                    me.$minioClient.putObject('labs', userMetadataPath, JSON.stringify(me.value.checkPoints))
                }
            },
            "eventstorming": {
                immediate: true,
                deep: true,
                handler(newVal) {
                    let me = this
                    this.value.checkPoints.forEach(function (val, idx) {
                        me.checkPointDivision(val, newVal)
                    })

                }
            }
        },
        methods: {
            checkingCheckPoint(checkPoint, log) {
                var testLog = log.replace(/[\n\r]/g, '')
                testLog = testLog.replace(/'/gi, "\\'");
                testLog = testLog.replace(/"/gi, '\\"');
                return eval(checkPoint.regExp + '.test("' + testLog + '")');
                // return eval(checkPoint.regExp + '.test("' + log + '")')
            },
            forceRerender() {
                this.renderComponent = false;

                this.$nextTick(() => {
                    this.renderComponent = true;
                });
            },
            checkPointDivision(val, newVal) {
                var me = this
                if (typeof newVal == 'object') {
                    // eventstorming && K8s
                    if (val.javascript) {
                        if (val.javascript.includes('.js')) {
                            var jsPath = `${me.$route.params.course}/labs/${me.value.lab}/${val.javascript}`
                            var stream = me.$minioClient.getObject('labs', `${me.$route.params.course}/labs/${me.value.lab}/${val.javascript}`, function (err, dataStream) {
                                dataStream.on('data', function (chunk) {
                                    var string = new TextDecoder("utf-8").decode(chunk);
                                    var result = me.eventstorming.definition;
                                    var returnValue;

                                    function returnValue(value) {
                                        returnValue = value
                                    }

                                    eval(string);
                                    val.status = returnValue
                                    me.forceRerender();
                                })
                            })
                        } else {

                        }
                    }
                } else if (val.regExp) {
                    //log는 스트링
                    var checkPointResult = me.checkingCheckPoint(val, newVal);
                    val["status"] = checkPointResult;
                    me.$emit('update:value', me.value)
                    me.forceRerender();
                }
            }
        },

    }
</script>

<style scoped>

</style>