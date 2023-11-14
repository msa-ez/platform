<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div v-if="!small" style="height: 100%; width: 100%; padding: 0px" align="center">
        <div v-if="classInfo.status == 'completed' && !classInfo.reuse">
            <v-card outlined max-width="550" min-width="500" style="margin-top:18%;">
                <h2 style="color: #C62828; padding-top:20px; margin-bottom: 10px; font-size:30px;"
                    class="text-center "
                > 종료된 강의 입니다.</h2>
                <v-card flat>
                    <v-card-text>
                        <div>
                            <div style="text-align: start; margin:15px; word-break: keep-all; font-size:20px; text-align:center; line-height:36px;">
                                종료된 강의의 실습환경을 계속 사용하시려면 MSAEz가 별도로 제공하는 클러스터를 사용하셔야 합니다.<br/>사용시 비용(코인)이 소모됩니다.
                            </div>
                        </div>
                    </v-card-text>
                    <v-card-actions style="margin-left:100px;">
                        <v-spacer></v-spacer>
                        <v-btn large v-if="(!classInfo.ideUrl || classInfo.ideUrl == '') || labInfo.templateFile" color="primary" @click="downloadFiles()" style="font-size: 20px;">파일 다운로드</v-btn>
                        <v-btn large color="primary" @click="confirmReuse()" style="font-size: 20px;">사용하기</v-btn>
                    </v-card-actions>
                </v-card>
            </v-card>
        </div>
        <div v-else-if="!ideUrl" style="margin-top:20px; height:100%;">
            <v-skeleton-loader type="article,image,image,image"></v-skeleton-loader>
            <div class="gs-info-bg">
                <div class="gs-info-title">{{$t('loading.main-title')}}<br>({{$t('loading.main-detail')}})</div>
                <div class="gs-info-sub-bg">
                    <div class="gs-info-sub-title">
                        {{$t('loading.sub-title')}}<br>
                        {{$t('loading.sub-title-1')}}
                    </div>
                    <div class="gs-info-description">
                        {{$t('loading.sub-detail')}}<br>
                        {{$t('loading.sub-detail-1')}}<br>
                        {{$t('loading.sub-detail-2')}}<br>
                        {{$t('loading.sub-detail-3')}}<br>
                    </div>
                </div>
            </div>
        </div>
        <div v-else style="height: 100%; width: 100%; background-color: #1e1e1e;">
            <div v-if="detectedMoving" style="height: 100%;">
                <vue-friendly-iframe
                        @load="onLoad"
                        :src="ideUrl"
                        style="height: 104%; width: 100%; margin-top:-1.2%;"
                        frameborder="0" gesture="media" allow="encrypted-media"
                        name="ideFrame"
                >
                </vue-friendly-iframe>
                <billing-counter v-if="hashName"
                                 :lab-info="labInfo"
                                 :class-info="classInfo"
                                 :props-user-info="userInfo"
                                 :hash-name="hashName"
                                 @terminate="terminate"
                                 style="top: 15px"></billing-counter>
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
    <div v-else>
        <v-subheader>
            Logs
        </v-subheader>
        <log-viewer v-model="value.result"></log-viewer>
        <v-divider></v-divider>
    </div>
</template>

<script>
    import LabBase from "../LabStorageBase.vue"
    import LogViewer from '../LogViewer'
    import json2yaml from 'json2yaml'
    import IDEMixins from "./IDEMixins";
    import BillingCounter from "../../BillingCounter";

    var JSZip = require('jszip')

    export default {
        name: 'lab-tool-ide',
        components: {
            LogViewer,
            BillingCounter
        },
        mixins: [LabBase, IDEMixins],
        props: {
            value: Object,
            labInfo: Object,
            small: Boolean,
            classInfo: Object
        },
        data() {
            return {
                activeFlag: false,
                ideInterval: '',
                ideUrl: null, //refactor reason #NIM, #VIFWN
                interval: null, //refactor reason #NIM, #VIFWN
                userId: this.$route.params.userId,
                oldResult: null,
                serverURL: null,
                serverToken: null,
                redisInterval: null,
                hashName: null,
                startCounting: false,
                detectedSetTimeout: null,
                detectedMoving: true,
                detectedTime: 5 * 60 * 1000,
                activeFlag: false,
                watchUserActivity: false,
            }
        },
        created: async function () {
            var me = this;

            if (localStorage.getItem('autoLock')) {
                var getLock = localStorage.getItem('autoLock')
                this.detectedTime = Number(getLock)
            }

            me.userId = me.$route.params.userId;
            if (!me.userId) me.userId = localStorage.getItem('email')
            if (me.classInfo)
                if (me.classInfo.status != "completed") {
                    if (!me.small) {
                        me.createdIDE()
                    }
                    //TODO: 아래 API 가 안먹히니 천상 polling 을 직접 처리해야 할듯..
                    me.interval = setInterval(async function () {
                        try {
                            var log = await me.getString('storage://labs-msaez.io/' + me.getClassPath(`labs/${me.labId}/${me.userId}/result.log`))
                            me.onResultChange(log)
                        } catch (e) {

                        }
                    }, 3000)
                } else {
                    me.checkReusedLab()
                }


        },
        watch: {},
        computed: {
            autoSettingTime() {
                var time = this.detectedTime / 60 / 1000
                if (time < 1) {
                    return `${this.detectedTime / 1000} 초`
                }
                return `${time} 분`
            },
        },
        mounted: function () {
            var me = this
            me.$EventBus.$emit("setLabInfo", me.labInfo)
            window.addEventListener('message', me.messageProcessing);

            me.watch('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath('watchUserActivity/'), function (value){
                me.watchUserActivity = value
            })
        },
        beforeDestroy() {
            var me = this
            // window.onmessage = null
            window.removeEventListener('message', me.messageProcessing);
            clearInterval(this.interval)
            clearInterval(this.redisInterval)
            window.ipcRenderer.send("closeView");
        },
        methods: {
            Handler() {
                alert('works');
            },
            async messageProcessing(e) {
                var me = this
                if (e.data.message === 'onMoveIDE') {
                    me.stopLockedCount()
                    me.startLockedCount()
                    // User Activity
                    if (me.activeFlag) {
                        clearTimeout(me.timer);
                        me.timer = setTimeout(function () {
                            me.activeFlag = false
                            me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                        }, 3000);

                        console.log("clear timer : " + me.activeFlag)
                    } else {
                        me.activeFlag = true
                        me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "true")

                        me.timer = setTimeout(function () {
                            me.activeFlag = false
                            me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                        }, 3000);

                    }
                } else if (e.data.message === 'inputTerminalName') {
                    var terminalName = window.prompt('Input Terminal Name');
                    var ideHost = "";
                    if (me.classInfo.ideUrl) {
                        ideHost = me.classInfo.ideUrl
                    } else {
                        ideHost = "kuberez.io";
                    }
                    $('iframe').get().forEach(function (iframe, idx) {
                        if (iframe.getAttribute("iframe-src")) {
                            if (iframe.getAttribute("iframe-src").includes(ideHost)) {
                                var body = $('iframe').get(idx);
                                body.contentWindow.postMessage({
                                    message: 'newTerminal',
                                    terminalName: terminalName
                                }, "*")
                            }
                        }
                    })
                } else if (e.data.message === 'resetConfig') {
                    await me.deleteConfig()
                    await me.makeConfig(me.myId);
                } else if(e.data.message === 'keyDown'){
                    if(me.watchUserActivity == "true"){
                        if(me.activeFlag){    
                            clearTimeout(me.timer);
                            me.timer = setTimeout(function(){
                                me.activeFlag = false
                                me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                            }, 1000);
                        }else{
                            me.activeFlag = true
                            me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "true")
                            
                            me.timer = setTimeout(function(){
                                me.activeFlag = false
                                me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                            }, 1000);
                            
                        }
                    }
                } else if(e.data.message === 'click'){
                    if(me.watchUserActivity == "true"){
                        if(me.activeFlag){    
                            clearTimeout(me.timer);
                            me.timer = setTimeout(function(){
                                me.activeFlag = false
                                me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                            }, 1000);
                        }else{
                            me.activeFlag = true
                            me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "true")
                            
                            me.timer = setTimeout(function(){
                                me.activeFlag = false
                                me.setString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userActive/${me.myId.replace(/\./gi, '_')}`), "false")
                            }, 1000);
                            
                        }
                    }
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
            terminate(newVal) {
                this.$emit('terminate', newVal)
            }
            ,
            async confirmReuse() {
                var me = this
                try {
                    var userEmail = localStorage.getItem('email')
                    if (userEmail) {
                        var convertEmail = userEmail.replace(/\./gi, '_')
                        var itemId = `${me.courseId}@${me.classId}@${me.labId}`
                        me.classInfo.reuse = true
                        me.$emit('update:classInfo', me.classInfo)

                        var obj = {
                            reuse: true
                        }

                        await me.putString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${itemId}`, obj)

                        me.createdIDE()
                    } else {
                        me.$EventBus.$emit('showLoginDialog')
                    }
                } catch (e) {
                    alert('confirmReuse Error', e.message)
                }
            }
            ,
            async checkReusedLab() {
                var me = this
                try {
                    var userEmail = localStorage.getItem('email')
                    if (userEmail) {
                        var convertEmail = userEmail.replace(/\./gi, '_')
                        var itemId = `${me.courseId}@${me.classId}@${me.labId}`
                        var item = await me.getString(`db://enrolledUsers/${convertEmail}/purchaseItemSnapshots/${itemId}`)
                        var itemReused = false
                        if (item && item.reuse) {
                            itemReused = item.reuse
                        }
                        me.classInfo.reuse = itemReused
                        me.$emit('update:classInfo', me.classInfo)

                        if (me.classInfo.reuse) {
                            me.createdIDE()
                        }
                    } else {
                        me.$EventBus.$emit('showLoginDialog')
                    }
                } catch (e) {
                    alert('checkReusedLab Error', e)
                }

            }
            ,
            async createdIDE() {
                var me = this
                if (this.labInfo.independent) {
                    // 랩 별 IDE 실행
                    var hashName = await me.startIDE(me.userId);
                    me.hashName = hashName
                    me.ideInterval = setInterval(function () {
                        me.ideRunningCheck(hashName);
                        //me.loading = false  // refactor reason #NIM, #VIFWN
                    }, 3000)
                } else {
                    // 클래스 별로 IDE 실행
                    var hashName = await me.startIDE(me.userId);
                    me.hashName = hashName
                    me.ideInterval = setInterval(function () {
                        me.ideRunningCheck(hashName);
                        //me.loading = false  // refactor reason #NIM, #VIFWN
                    }, 3000)
                }
            }
            ,
            onResultChange(change) {
                if (this.oldResult != change) {
                    this.value.result = change;
                    this.oldResult = change;
                    this.$emit('input', this.value);
                    this.$emit('change', this.value);
                }
            }
            ,
            getPrevLab() {

            },
            onLoad(evt) {
                this.startCounting = true
            },
            async downloadFiles() {
                var me = this
                if(!me.classInfo.ideUrl || me.classInfo.ideUrl == ""){
                    var path = "labs-" + this.getTenantId() + "/" + me.getClassPath(`labs/${me.userId}`)
                    // var url = await this.getURL(`standalone://${path}/${me.labInfo.labId}`)
                    //
                    // console.log(url)
                    // window.open(url, '_blank');
                   
                    me.$http.get(`${me.getProtocol()}//file.kuberez.io/api/getLabFiles?filePath=${path.replace(/\//gi, "%2F")}&lab=${me.labInfo.labId}`, {responseType: 'blob'})
                        .then((response) => {
                            const url = window.URL.createObjectURL(new Blob([response.data]));
                            console.log(url)
                            const link = document.createElement('a');
                            link.href = url;
                            console.log(link)
                            link.setAttribute('download', 'test.zip');
                            document.body.appendChild(link);
                            link.click();
                        });
                } else if(me.labInfo.templateFile){
                    var zipUrl = await me.getURL(`storage://labs-msaez.io/running/${me.courseId}/labs/${me.labId}/${me.labInfo.templateFile}`);
                    window.open(zipUrl, '_blank');
                }

            }
        },

    }
</script>
<style>
    iframe {
        height: 100%;
        width: 100%;
    }
</style>

