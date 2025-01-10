<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div style="height: 100%; width: 100%;" v-if="!small">
        <!-- esCode -->
        <div v-if="!inSideElectron"
            style = "position:absolute;
                width:600px;
                left:50%;
                top:10%;
                margin-left:-200px;">

            <div style="margin:50px 0 50px 0;">
                <h2 style="margin-bottom:10px;">Electron을 사용하여 진행되는 랩입니다.</h2>
                <div style = "margin-bottom:10px; font-size:13px; opacity:0.7;">
                    만약 자동으로 랩이 열리지 않을때는 해당 Lab id<br>
                    (class id 를 확장하여 바로 Lab 이 열릴 수 있도록 id 를 확장) 을 입력하세요.<br>
                </div>
                <v-btn v-if="!inSideElectron" :href="setDirectURL"
                        color="green"
                        style="height:45px;
                                width:130px;"
                        depressed 
                >
                    <span style="color: white;">
                        <v-row>
                            <v-icon large style="margin-right:5px">mdi-atom</v-icon>
                            <div style="text-align:left; margin-top:2px;">Start<br>Electron</div>
                        </v-row>
                    </span>
                </v-btn>
            </div>
            <v-divider style ="position:relative; min-width:600px; margin-left:-20%; margin-bottom:50px;"></v-divider>
            <div style = "margin-bottom:10px;">
                <h2 style = "margin-bottom:10px;">Download Electron</h2>
                <div style = "margin-bottom:10px; font-size:13px; opacity:0.7;">아래의 버튼을 클릭하여 다운로드 하세요.</div>
            </div>
            <v-btn href="https://github.com/msa-ez/msa-ez.github.io/releases/download/v2.0/MSAEasy-0.1.0.dmg"
                    style="margin-right: 30px;
                        height:45px;
                        width:130px;"
                    depressed download 
                    color="primary"
            >
                <span style="color: white;">
                    <v-row>
                        <v-icon large style="margin:0 5px 0 -15px;">mdi-apple</v-icon>
                        <div style= "line-height:45px;">For Mac</div>
                    </v-row>
                </span>
            </v-btn>

            <v-btn href="https://github.com/msa-ez/msa-ez.github.io/releases/download/v2.0/MSAEasy.Setup.0.1.0.exe"
                    style="margin-right: 30px;
                        height:45px;
                        width:130px;"
                    depressed download 
                    color="primary"
            >
                <span style="color: white;">
                    <v-row>
                        <Icons :icon="'windows'" :size="30" style="margin-right:5px; margin-top:2px;" />
                        <div style="text-align:left; margin-top:2px;">For<br>Windows</div>
                    </v-row>
                </span>
            </v-btn>
        </div>
        <!-- electron -->
        <div v-else>
            <v-progress-circular
                    v-if="!ideUrl && loadUrl"
                    style="margin-top: 25%; color: #1976d2 !important"
                    :size="130"
                    color="primary"
                    indeterminate
            >
            </v-progress-circular>

            <div v-if="!ideUrl">
                <!-- <div v-if="showTextField && !loadUrl" style="display: inline-flex; background-color: lightgray; margin-top: 300px; width: 600px; height: 100px; border-radius: 30px;">
                    <v-text-field solo 
                        :readonly="!isAdmin"
                        label=" Input Url"
                        style="width: auto; padding-top: 25px; padding-left: 30px;" 
                        v-model="urlText"
                        @keydown.enter="sendUrl(urlText)"></v-text-field>
                    <v-icon style="margin-left: 10px; margin-right: 13px;" @click="sendUrl(urlText)">mdi-send</v-icon>
                </div> -->
            </div>
            <vue-friendly-iframe
                    v-else
                    :src="ideUrl"
                    style="height: 100%; width: 100%;"
                    frameborder="0" gesture="media" allow="encrypted-media">
            </vue-friendly-iframe>
        </div>
    </div>
    <!--    <div v-else>-->
    <!--        <v-subheader>-->
    <!--            Notebook-->
    <!--        </v-subheader>-->
    <!--        <div class="py-3" style="transform: scale(0.7) translate(5%,-21%);" v-html="notebook"></div>-->

    <!--        <v-divider></v-divider>-->
    <!--    </div>-->

</template>

<script>

    // import LabBase from "../LabBase"
    import LabBase from "../LabStorageBase"
    import LogViewer from '../LogViewer'
    import json2yaml from 'json2yaml'
    //import nb from "notebookjs";
    import DiffMatchPatch from "diff-match-patch";
    import {Icon} from '@iconify/vue2';
    import { watch } from 'fs';

    const diffPatcher = new DiffMatchPatch();
    const Diff = require('diff');

    export default {
        name: 'lab-tool-url',
        components: {
            LogViewer,
            Icon
        },
        mixins: [LabBase],
        props: {
            value: Object,
            labInfo: Object,
            small: Boolean
        },

        data() {
            return {
                // htmlRules: value => {
                //     const pattern = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
                //     return pattern.test(value) || 'Invalid URL'
                // },
                ideInterval: '',
                ideUrl: null, //refactor reason #NIM, #VIFWN
                interval: null, //refactor reason #NIM, #VIFWN
                userId: this.$route.params.userId,
                oldResult: null,
                index: null,
                snapshot: null,
                urlText: 'https://',
                showTextField: true,
                loadUrl: true,
                watchUserScreen: 'false',
            }
        },
        watch: {
            // index(newVal) {
            //     var me = this
            //     if (me.userId == localStorage.getItem("email"))
            //         if (me.snapshot && me.snapshot.length > 0 && me.watchUserScreen) {
            //             me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/snapshot`), {
            //                 index: newVal,
            //                 img: me.snapshot
            //             })
            //         }
            // }
        },
        computed: {
            inSideElectron() {
                return window.ipcRenderer
            },
            setDirectURL(){
                console.log(window.location.href)
               return 'msaeasy://' + window.location.href
            }
            // notebook() {
            //     var ipynb = JSON.parse(this.value.result);
            //     var notebook = nb.parse(ipynb);
            //     return notebook.render().outerHTML;
            //     //return "notebook"
            // }
        },
        created: async function () {

            var me = this;
            window.addEventListener("resize", this.resizeHandler);
            me.userId = localStorage.getItem("email")
            // var playingLists = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/${me.userId.replace(/\./gi, '_')}/playing`));
            // if (playingLists)
            //     var keys = Object.keys(playingLists);
            // var snapshot = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/snapshot`));

            // if (snapshot) {
            //     if (snapshot.index < playingLists.length) {
            //         me.snapshot = snapshot.img;
            //         keys.forEach(function (dif, idx) {
            //             if (idx >= snapshot.index) {
            //                 var diffSnapshot = diffPatcher.patch_apply(playingLists[dif].diff, me.snapshot);
            //                 me.snapshot = diffSnapshot[0];
            //             }
            //         })
            //     } else if (snapshot.index == playingLists.length) {
            //         me.snapshot = snapshot.img
            //     }
            // }


            // if (playingLists)
            //     me.index = Object.keys(playingLists).length - 1;

            if (window.ipcRenderer) {
                if (me.isTeacher) { //isTeacher 
                    window.ipcRenderer.on("capture", function (event, img) {
                        me.pushString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/playingTmp`), img);
                    })
                } else {
                    window.ipcRenderer.on("capture", function (event, img) {
                        if(me.snapshot && me.snapshot.length > 0) {

                            // var diff = diffPatcher.patch_make(me.snapshot, img.diff);
                            // console.log(diff)
                            // var diff2 = Diff.diffChars(me.snapshot, img.diff);
                            // console.log(diff2)
                            // var tmp = {diff: diff}



                            // var dif
                            // if (me.snapshot) {
                            //     diff = diffPatcher.patch_apply(img.diff, me.snapshot);
                            // } else {
                            //     diff = diffPatcher.patch_apply(img.diff, "");
                            // }


                            me.snapshot = img
                            // if(tmp.diff.length > 0){
                            // me.pushString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${me.labId}/${me.userId.replace(/\./gi, '_')}/playing`), img);
                            // }
                        } else {
                            me.snapshot = img
                            // me.pushString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${me.labId}/${me.userId.replace(/\./gi, '_')}/playing`), img);
                        }
                        if (me.index == null)
                            me.index = 0;
                        else
                            me.index = me.index + 1


                        if (me.snapshot && me.snapshot.length > 0 && me.watchUserScreen == 'true') {
                            me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.userId.replace(/\./gi, '_')}/snapshot`), {
                                index: me.index,
                                img: me.snapshot
                            })
                        }
            
                    })
                }

                // window.ipcRenderer.send("open", {
                //     "url": "http://gitpod.io/#https://github.com/event-storming/monolith",
                //     "authorized": localStorage.getItem("authorized")
                // })
            } else {
                //.....///....///...../...///....
                // 전용브라우저 설치 안내 혹은 기존 tool ..연결. 
            }

            if (me.labInfo && me.labInfo.URL || !me.labInfo.URL) {
                me.loadUrl = false
            }

        },

        mounted: function () {
            var me = this
            me.$EventBus.$emit("setLabInfo", me.labInfo)
            // this.$EventBus.$on("urlUpdate", function (data) {
            //     me.urlText = data
            //     me.loadUrl = false
            //     if(data == 'https://' || data == ''){
            //         me.showTextField = true
            //     } else {
            //         me.showTextField = false
            //     }
            // })
            // setInterval(async function () {
            //     if(window.ipcRenderer){
            //         window.ipcRenderer.send("getURL");
            //     }
            // }, 3000)
            me.watch('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/watchUserScreen`), function(data){
                me.watchUserScreen = data
            })
        },
        beforeDestroy() {
            window.removeEventListener("resize", this.resizeHandler);
            clearInterval(this.interval)
            this.$EventBus.$emit("setLabInfo", null)
        },
        methods: {
            test(){
                if(window.ipcRenderer){
                    window.ipcRenderer.send("clickForLoading");
                }
            },
            onResultChange(change) {
                if (this.oldResult != change) {
                    this.value.result = change;
                    this.oldResult = change;
                    this.$emit('input', this.value);
                    this.$emit('change', this.value);
                }
            },
            resizeHandler(e) {
                this.$nextTick(function () {
                    var width = $(".v-main").width()
                    var height = $(".v-main").height()
                    // var browserZoomLevel = Math.round(window.devicePixelRatio * 50);

                    window.ipcRenderer.send("resizeView", {
                        x: $(".v-navigation-drawer--is-mobile").width() ? 0 : $(".v-navigation-drawer").width() * (window.devicePixelRatio / 2),
                        y: $(".v-toolbar").height() * (window.devicePixelRatio / 2),
                        width: width * (window.devicePixelRatio / 2),
                        height: height * (window.devicePixelRatio / 2)
                    })
                })

            }
            //     sendUrl(text) {
            //         var me = this
            //         if(text != 'https://' && text != '') {
            //             me.loadUrl = true
            //         }
            //         var setUrl = null
            //         if(text.includes('https://') || text.includes('http://')){
            //             setUrl = text
            //         } else {
            //             setUrl = 'https://' + text
            //         }
            //         var copyLabInfo = JSON.parse(JSON.stringify(this.labInfo))
            //         copyLabInfo.URL = setUrl
            //         me.putObject(`storage://labs-msaez.io/${me.courseId}/labs/${me.labId}/Lab_Metadata.json`, copyLabInfo)
            //         var setClassId = me.classId.replace('running@', '')
            //         me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/running/' + setClassId + '/labs/' + me.labInfo.labId + '/URL', setUrl);
            //     },

        },

    }
</script>






