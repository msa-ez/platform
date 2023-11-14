<template>
    <v-container fluid>
        <v-row>
            <v-col align="center" v-if="renderComponent" v-for="(group, groupIdx) in groupList" :key="groupIdx">
                <v-card width="350px" height="350px">
                    <v-card-title>
                        {{group.groupName}}
                    </v-card-title>
                    <v-card-text center>
                        <v-row align="center">
                            <v-col v-for="(user,userIdx) in group.users">
                                <v-icon v-if="user.labsData" x-large @click="userNaviOpen(user,groupIdx, userIdx)"
                                        v-bind:class="{ 'green--text': user.labsData.checkPoints.every(checkCheckPointStatus) }">
                                    mdi-account-circle
                                </v-icon>
                                <br>
                                {{user.name}}
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col>
                <UserNavigator
                        v-if="naviObject.drawer"
                        :value.sync="naviObject"
                ></UserNavigator>
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
    import LogViewer from './LogViewer'
    import UserNavigator from "./UserNavigator";


    var _ = require('lodash');
    export default {
        name: "UserGroupPage",
        components: {
            LogViewer,
            UserNavigator
        },
        data: () => ({
            groupList: [],
            naviObject: {},
            labsData: {},
            overlay: false,
            interval: '',
            isAdmin: false,
            renderComponent: true
        }),

        created() {
            var me = this
            if (window.localStorage.getItem('authorized') == 'admin') {
                me.isAdmin = true
            }
        },
        computed: {},
        watch: {
            labsData() {
                var me = this
                me.setLabDataAll();
            }
        },
        mounted() {
            var me = this
            this.getLabsList();
            this.getAdminGroupList();
            me.interval = setInterval(function () {
                me.getLogAll()
            }, 1000)
            me.$EventBus.$on('clearLogInterval', function () {
                clearInterval(me.interval)
            })
        },
        beforeDestroy() {
            clearInterval(this.interval)
        },
        methods: {
            getLogAll() {
                var me = this
                this.groupList.forEach(function (group, groupIdx) {
                    group.users.forEach(function (user, userIdx) {
                        me.getLog(user.email, groupIdx, userIdx)
                    })
                })
            },
            setLabDataAll() {
                var me = this
                this.groupList.forEach(function (group, groupIdx) {
                    group.users.forEach(function (user, userIdx) {
                        me.setLabData(groupIdx, userIdx)
                    })
                })
            },
            setLabData(groupIdx, userIdx) {
                var me = this
                // analysis/runningClass/first/

                var userMetadataPath = `${this.$route.params.course}/runningClass/${this.$route.params.clazzName}/${this.$route.params.labName}/${me.groupList[groupIdx]["users"][userIdx].email}/Labs_Metadata.json`

                me.$minioClient.getObject('labs', userMetadataPath, function (err, dataStream) {
                    if (err) {
                        me.$set(me.groupList[groupIdx]["users"][userIdx], "labsData", JSON.parse(JSON.stringify(me.labsData)))
                        me.$minioClient.putObject('labs', userMetadataPath, JSON.stringify(me.labsData.checkPoints))
                    }
                    dataStream.on('data', function (chunk) {
                        console.log(userMetadataPath)
                        var string = new TextDecoder("utf-8").decode(chunk);
                        var json = JSON.parse(string)
                        console.log(json)
                        me.$set(me.groupList[groupIdx]["users"][userIdx], "labsData", JSON.parse(JSON.stringify(me.labsData)))
                        me.$set(me.groupList[groupIdx]["users"][userIdx]["labsData"], "checkPoints", json)
                        me.$nextTick(function(){
                            console.log(me.groupList[groupIdx]["users"][userIdx]["labsData"])
                        })
                    })
                })
            },
            userNaviOpen(user, groupIdx, userIdx) {
                var me = this
                // setInterval(function () {
                //     me.getLog(user.email, groupIdx, userIdx)
                // }, 5000)
                console.log(user)
                // me.getLog(user.email, groupIdx, userIdx)
                me.$set(me.naviObject, "userInfo", user)
                console.log(user)
                me.$set(me.naviObject, 'drawer', true)
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
                                console.log(labsPath)

                                // planed metadata 가지고 오는 부분
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
                                                    me.$set(me, 'labsData', json)
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
            getAdminGroupList() {
                var me = this
                var stream = this.$minioClient.listObjects('labs', this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/', false);
                stream.on('data', function (obj) {
                    if (obj.name) {
                        if (obj.name.includes('Metadata')) {
                            me.$minioClient.getObject('labs', obj.name, function (err, dataStream) {
                                if (err) {
                                    return console.log(err)
                                }
                                dataStream.on('data', function (chunk) {
                                    var string = new TextDecoder("utf-8").decode(chunk);
                                    var json = JSON.parse(string)
                                    json["labData"] = me.labsData;
                                    me.groupList = json.groupedUsers;
                                })
                            })
                        }
                    }
                })
            },
            getIDEStatus(userId) {
                var me = this
                var path = this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/' + this.$route.params.labName + '/' + userId
                var hashUrl = 'labs-' + me.hashCode(path);

                return new Promise(function (resolve) {
                    me.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashUrl}/status`).then(function (result) {
                        resolve(result.data.status.phase)
                    })
                })

            },
            getLog(userId, groupIdx, userIdx) {
                var me = this
                var stream = this.$minioClient.listObjects('labs', this.$route.params.course + '/runningClass/' + this.$route.params.clazzName + '/' + this.$route.params.labName + '/' + userId + '/', false);
                stream.on('data', function (data) {
                    if (data.name) {
                        if (data.name.includes('result.log')) {
                            me.$minioClient.getObject('labs', data.name, function (err, dataStream) {
                                if (err) {
                                    // alert(err)
                                }
                                dataStream.on('data', function (chunk) {
                                    var string = new TextDecoder("utf-8").decode(chunk);
                                    me.$set(me.groupList[groupIdx]["users"][userIdx], "logs", string)

                                    me.groupList[groupIdx]["users"][userIdx]["labsData"]["checkPoints"].forEach(function (checkPoint, checkIdx) {
                                        me.groupList[groupIdx]["users"][userIdx]["labsData"]["checkPoints"][checkIdx]["status"] = me.checkingCheckPoint(checkPoint, string)
                                    })
                                })
                            })
                        }
                    }
                })
            },
            checkingCheckPoint(checkPoint, log) {
                var testLog = log.replace(/[\n\r]/g, '')

                var reg = new RegExp(checkPoint.regExp);
                testLog = testLog.replace(/'/gi, "\\'");
                testLog = testLog.replace(/"/gi, '\\"');
                return eval(checkPoint.regExp + '.test("' + testLog + '")');
                // return eval(checkPoint.regExp + ".test('" + testLog + "')");


                // return eval(checkPoint.regExp + '.test("' + log + '")')
            },

            checkCheckPointStatus(lab) {
                var me = this
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

        }
    };
</script>
