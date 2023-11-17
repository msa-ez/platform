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
            },
            getAdminGroupList() {
                var me = this
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
