<template>
    <v-app style="position:fixed;  height: 100%; width: 100%">
        <div style="height: 100%;">
            <div v-if="loaded" style="height: 100%;">
                <v-progress-circular indeterminate color="white" size="25"
                                     v-if="!codeStatus"
                                     style="clear:both; position: absolute; top: 3px;right: 0; margin-right: 355px"
                ></v-progress-circular>
<!--                <v-menu-->
<!--                        v-model="menu"-->
<!--                        :close-on-content-click="false"-->
<!--                        :nudge-width="200"-->
<!--                        offset-x-->
<!--                >-->
<!--                    <template v-slot:activator="{ on, attrs }">-->
<!--                        <v-btn-->
<!--                                style="clear:both; position: absolute; top: 3px;right: 0;margin-right: 265px;"-->
<!--                                small-->
<!--                                text-->
<!--                                dark-->
<!--                                v-bind="attrs"-->
<!--                                v-on="on"-->
<!--                        >-->
<!--                            Diff Mode-->
<!--                        </v-btn>-->
<!--                    </template>-->

<!--                    <v-card>-->
<!--                        <v-list>-->
<!--                            <v-list-item>-->
<!--                                <v-list-item-action>-->
<!--                                    <v-switch-->
<!--                                            v-model="liveSync"-->
<!--                                            color="green"-->
<!--                                    ></v-switch>-->
<!--                                </v-list-item-action>-->
<!--                                <v-list-item-title>Auto Sync</v-list-item-title>-->
<!--                            </v-list-item>-->

<!--                            <v-list-item>-->
<!--                                <v-list-item-action>-->
<!--                                    <v-switch-->
<!--                                            v-model="demarcation"-->
<!--                                            color="green"-->
<!--                                    ></v-switch>-->
<!--                                </v-list-item-action>-->
<!--                                <v-list-item-title>Diff Demarcation</v-list-item-title>-->
<!--                            </v-list-item>-->
<!--                        </v-list>-->
<!--                    </v-card>-->
<!--                </v-menu>-->

                <div v-if="savedToolTime <= 0 && !isOnPrem" style="clear:both;">
                    <v-card max-width="515px"
                            style="position: absolute; top: 30%;right: 30%; width:100%; height: 50%;">
                        <PaymentToolTime @close="closePaymentTool"></PaymentToolTime>
                    </v-card>
                </div>

                <div v-else style="height: 100%; background-color: #1e1e1e; ">
                    <div v-if="detectedMoving" style="height: 100%;">
                        <vue-friendly-iframe
                                @load="onLoad"
                                :src="location"
                                style="height: 100%; width: 100%"
                                frameborder="0" gesture="media" allow="encrypted-media"
                        >
                        </vue-friendly-iframe>
                        <billing-counter v-if="startCounting && isOnPrem" :hashName="$route.query.param"
                                         :project-name="$route.query.projectName"
                                         :propsUserInfo="userInfo"
                                         class="counter"
                                         style="top:5px;"></billing-counter>
                    </div>
                    <div v-else style="position: absolute; top: 45%; right: 45%;text-align: -webkit-center;">
                        <v-icon x-large dark @click="setLocked(false)"> mdi-lock-outline</v-icon>
                        <div style="color: white;">
                            잠금을 해제 하려면 자물쇠
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <a
                                            @click="setLocked(false)"
                                            v-on="on"
                                    >
                                        '클릭'
                                    </a>
                                </template>
                                <span> 해제 </span>
                            </v-tooltip>
                            하세요
                        </div>
                        <div style="color: white;">
                            자동 잠금
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <a
                                            @click="setAutoLock()"
                                            v-on="on"
                                    >
                                        '변경'
                                    </a>
                                </template>
                                <span> 클릭  </span>
                            </v-tooltip>
                            ({{autoSettingTime}})
                        </div>
                    </div>

                </div>

            </div>
            <div v-else style="height: 100%; text-align: center; background-color: #1e1e1e;">
                <v-progress-circular
                        style="margin-top: 25%; color: #1976d2 !important;  "
                        :size="130"
                        color="primary"
                        indeterminate
                >
                    {{checkTime}}초 진행중...
                </v-progress-circular>
            </div>
        </div>

        <v-dialog
                v-model="ideResourceDialog"
                @click:outside="closeIdeResourceDialog()"
                max-width="550"
        >
            <div style="text-align: -webkit-center;">
                <IDEResourceDialog :ide="false" @submit="closeIdeResourceDialog"></IDEResourceDialog>
            </div>
        </v-dialog>
    </v-app>
</template>

<script>
    import BillingCounter from "./BillingCounter"
    import PaymentToolTime from "./payment/PaymentToolTime";
    import CommonStorageBase from "./CommonStorageBase";
    import IDEMixins from "./labs/tools/IDEMixins";
    import IDEResourceDialog from "./IDEResourceDialog";

    export default {
        name: "IdeLoadingPage",
        components: {BillingCounter, PaymentToolTime, IDEResourceDialog},
        mixins: [CommonStorageBase, IDEMixins],
        props: {
            hashName: String,
            projectName: String
        },
        data() {
            return {
                demarcation: false,
                intervalVariable: '',
                timeOutVariable: '',
                locationInterval: '',
                checkTime: 0,
                location: "",
                loaded: false,
                eventInfo: {},
                startCounting: false,
                detectedSetTimeout: null,
                detectedMoving: true,
                detectedTime: 5 * 60 * 1000, //5분
                ideResourceDialog: false,
                codeStatus: true,
                menu: false,
            }
        },
        async created() {
            await this.loginUser()

            this.$EventBus.$emit('openPaymentTime', true)

            if (localStorage.getItem('autoLock')) {
                var getLock = localStorage.getItem('autoLock')
                this.detectedTime = Number(getLock)
            }

        },
        computed: {
            isOnPrem() {
                if (window.MODE == 'onprem')
                    return true;
                else
                    return false
            },
            counterWidth() {
                var div = document.querySelector(".counter");
                return $(div).width();
            },
            showResourceDialog() {
                var me = this
                if (me.isForeign) {
                    return false
                } else if (!me.detectedMoving) {
                    return false
                } else if (me.savedToolTime <= 0 && !isOnPrem) {
                    return false
                }
                return true
            },
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
            autoSettingTime() {
                var time = this.detectedTime / 60 / 1000
                if (time < 1) {
                    return `${this.detectedTime / 1000} 초`
                }
                return `${time} 분`
            },
            savedToolTime() {
                if (this.userInfo.savedToolTime) {
                    return this.userInfo.savedToolTime
                }
                return 0

            },
        },
        beforeDestroy() {
            // var me = this
            // // window.onmessage = null
            // window.removeEventListener('message', me.messageProcessing);
        },
        mounted() {
            var me = this
            me.intervalVariable = setInterval(() => me.checkStatus(), 5000);
            me.checkTimeVariable = setInterval(() => me.checkTime = me.checkTime + 1, 1000);

            window.addEventListener('message', me.messageProcessing);
        },
        watch: {
            codeStatus: {
                handler: _.debounce(function (newVal) {
                    var me = this;
                    if(newVal == false) {
                        me.codeStatus = true;
                    }
                }, 5000)
            },
            location(newVal) {
                var me = this
                me.loaded = true
                // me.IdeInterval(newVal)
            },
            liveSync(newVal) {
                if (newVal) {
                    if (window.opener)
                        window.opener.postMessage({message: "changedMode"}, "*");
                }
            }
        },

        methods: {
            // changedSyncMode() {
            //     if (this.liveSync)
            //         this.liveSync = !this.liveSync;
            //     else if (!this.liveSync)
            //         this.liveSync = !this.liveSync;
            // },
            // changedDemarcationMode() {
            //     if (this.demarcation)
            //         this.demarcation = !this.demarcation;
            //     else if (!this.demarcation)
            //         this.demarcation = !this.demarcation;
            // },

            openIdeResourceDialog() {
                var me = this
                me.ideResourceDialog = true
            },
            async closeIdeResourceDialog(ide, tool) {
                var me = this;
                try {
                    if (ide) {
                        //setting user
                        // me.$route.query.param = hashName;
                        var hashName;
                        if (me.userInfo.email && me.hashName) {
                            hashName = me.hashName;
                        } else if (me.userInfo.email && me.$route.query.param) {
                            hashName = me.$route.query.param;
                        } else {
                            alert('재 로그인 후에 진행 해주세요.');
                            return;
                        }

                        var convertEmail = me.userInfo.email.replace(/\./gi, '_')

                        //setting ide
                        var setUsageType = 'ide-4m2c'
                        setUsageType = ide.resourceType

                        //setting tool
                        var setSpec = {
                            "kind": "ResourceQuota",
                            "apiVersion": "v1",
                            "metadata": {
                                "name": "resource-quota",
                                "namespace": hashName,
                                "annotations": {
                                    "meta.helm.sh/release-name": hashName,
                                    "meta.helm.sh/release-namespace": "default"
                                }
                            },
                            "spec": {
                                "hard": {
                                    "limits.cpu": tool.resourceQuota.cpu, //4
                                    "limits.memory": tool.resourceQuota.memory,  //'8Gi'
                                    "requests.cpu": tool.resourceQuota.cpu, //4
                                    "requests.memory": tool.resourceQuota.memory  //'8Gi'
                                }
                            }
                        }

                        // resource quotas setting
                        await me.$http.put(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/${hashName}/resourcequotas/resource-quota`, setSpec)

                        if (tool.resourceType) {
                            setUsageType = `${setUsageType}@${tool.resourceType}`
                        }

                        //usage setting
                        var setResourceType = {
                            resourceType: setUsageType
                        }

                        //firebase setting
                        await me.putObject(`db://enrolledUsers/${convertEmail}/usage/${hashName}`, setResourceType)
                    }
                } catch (e) {
                    console.log(e)
                    alert(`${e} (Resource Setting)`)
                } finally {
                    me.ideResourceDialog = false
                }

            },
            setAutoLock() {
                if (this.detectedTime) {
                    if (this.detectedTime == 1 * 60 * 1000) {
                        this.detectedTime = 5 * 60 * 1000
                    } else if (this.detectedTime == 5 * 60 * 1000) {
                        this.detectedTime = 10 * 60 * 1000
                    } else if (this.detectedTime == 10 * 60 * 1000) {
                        this.detectedTime = 30 * 60 * 1000
                    } else if (this.detectedTime == 30 * 60 * 1000) {
                        this.detectedTime = 1 * 60 * 1000
                    } else {
                        this.detectedTime = 5 * 60 * 1000
                    }
                } else {
                    this.detectedTime = 5 * 60 * 1000
                }
                localStorage.setItem('autoLock', this.detectedTime)
            },
            setLocked(newVal) {
                this.detectedMoving = !newVal
            },
            startLockedCount() {
                this.detectedSetTimeout = setTimeout(() => {
                    this.setLocked(true)
                }, this.detectedTime)
            },
            stopLockedCount() {
                clearTimeout(this.detectedSetTimeout)
                this.setLocked(false)
            },
            checkStatus() {
                var me = this
                var hashName;
                var projectName;
                if (me.hashName) {
                    hashName = me.hashName
                    projectName = me.projectName;
                } else {
                    hashName = me.$route.query.param
                    projectName = me.$route.query.projectName;
                }
                var tenant = window.MODE == "onprem" ? me.getTenantId() : 'kuberez.io';
                this.$http.get(`${me.getProtocol()}//api.${me.getTenantId()}/api/v1/namespaces/default/pods/${hashName}/status`).then(function (result) {
                    if (result.data.status.conditions) {
                        if (result.data.status.containerStatuses[1].state.running) {
                            clearInterval(me.intervalVariable);
                            var params = "";
                            if (me.$route.query.labId) {
                                params = params.concat("labId=" + me.$route.query.labId)
                            }
                            if(me.$route.query.giturl) {
                                if(params.length > 0) {
                                    params = params.concat("&")
                                }
                                params = params.concat("giturl=" + me.$route.query.giturl)
                            }
                            var redirectUrl = `${me.getProtocol()}//` + hashName + `.${tenant}/?${params}`+ `#/home/project/${projectName}`;
                            clearInterval(me.checkTimeVariable);
                            me.location = redirectUrl;
                        }

                    }
                }).catch(function (e) {
                })
            },
            onLoad() {
                if (window.MODE != "onprem")
                    this.startCounting = true
            },
            closePaymentTool(force) {
                if (force) {
                    this.close_window()
                }
            },
            close_window() {
                if (confirm("시간 구매하셔야 이용이 가능합니다. 종료하시겠습니까?")) {
                    close();
                }
            },


            // IdeInterval(domain) {
            //     var me = this
            //     me.locationInterval = setInterval(function () {
            //         me.$http.get(domain).then(function () {
            //             me.loaded = true;
            //         }).catch(function (error) {
            //             alert(error)
            //         })
            //     }, 2000)
            //
            // }
        }
    }
</script>

<style scoped>

</style>