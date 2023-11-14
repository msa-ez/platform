<template>
    <div>
        <div v-if="selectedUser">
            <v-img v-if="imgUrl" contain max-width="600px" :src="imgUrl" @click="replayDialog=true"></v-img>
            <v-img v-else contain><v-icon x-large> mdi-cast-off</v-icon></v-img>
            <v-slider
                    v-if="diffList.length > 1"
                    :max="maxlength"
                    v-model="nowIndex"
                    min="0"
            ></v-slider>
        </div>
        <div v-else style="margin: 15px; position: relative">
            <div style="position: relative">
                <div style="position: absolute; z-index: 999;"
                     v-bind:style="{ left: clickX + '%', top: clickY + '%'}">
                    <div v-if="clickPointer"
                         style="width: 30px; height: 30px; border-radius: 50%; background: #ff0000; opacity: 0.5;"
                    ></div>
                </div>
                <v-img contain v-if="imgUrl" :src="imgUrl" @click="replayListDialog = true">
                    <resize-observer @notify="handleResize"/>
                </v-img>
            </div>
            <v-slider
                    v-if="maxlength > 1"
                    :max="maxlength"
                    v-model="nowIndex"
                    min="0"
            ></v-slider>
            <v-row>
                <div style = "margin:0 10px 0 10px;"
                    :style="imgUrl ? 'display:block;':'display:none'"
                >
                    <v-btn v-if="playIcon" @click="startPlay()">
                        <v-icon large>mdi-play</v-icon>
                    </v-btn>
                    <v-btn v-if="!playIcon" @click="stopPlay()">
                        <v-icon large>mdi-stop</v-icon>
                    </v-btn>
                </div>
            </v-row>
        </div>

        <!--        <div v-if="!selectedUser">-->

        <!--            <v-btn @click="replayListDialog=true">참고 영상</v-btn>-->
        <!--        </div>-->
        <v-dialog
                v-model="replayDialog"
                :persistent="playing"
                max-width="800px"
                width="60%"
                height="70%"
        >
            <v-card>
                <v-img v-if="imgUrl" :src="imgUrl" @click="dialog=true"></v-img>
                <v-slider
                        v-if="maxlength > 1"
                        :max="maxlength"
                        v-model="nowIndex"
                        min="0"
                ></v-slider>
                <v-text-field v-if="!selectedUser" type="text" v-model="replayName"></v-text-field>
                <!-- <v-progress-circular
                    v-if="!LoadPlayList"
                    style="margin: 10px;"
                    indeterminate
                    color="primary"
                ></v-progress-circular>
                <div v-if="LoadPlayList">
                    <v-btn v-if="!playing" @click="startPlay()">
                        <v-icon>mdi-play</v-icon>
                    </v-btn>
                    <v-btn v-if="playing" @click="stopPlay()">
                        <v-icon>mdi-pause</v-icon>
                    </v-btn>
                    <v-btn @click="saveReplay()">저장</v-btn>
                </div> -->
            </v-card>
        </v-dialog>
        <v-dialog
                v-model="replayListDialog"
                max-width="1000px"
        >
            <v-card>
                <v-card-text style="position: relative">
                    <!--                    <div -->
                    <!--                         v-bind:style="{height: imageHeight + 'px', width: imageWidth + 'px'}">-->
                    <!--                    </div>-->
                    <div style="position: relative">
                        <div style="position: absolute; z-index: 999;"
                             v-bind:style="{ left: clickX + '%', top: clickY + '%'}">
                            <div v-if="clickPointer"
                                 style="width: 30px; height: 30px; border-radius: 50%; background: #ff0000; opacity: 0.5;"
                                 v-bind:style="{ }"></div>
                        </div>
                        <v-img contain v-if="imgUrl" :src="imgUrl">
                            <resize-observer @notify="handleResize"/>
                        </v-img>
                    </div>
                    <v-slider
                            v-if="maxlength > 1"
                            :max="maxlength"
                            v-model="nowIndex"
                            min="0"
                    ></v-slider>
                    <!--                <v-text-field v-if="!selectedUser" type="text" v-model="replayName"></v-text-field>-->
                    <v-btn @click="startPlay()">Play</v-btn>
                    <v-btn @click="stopPlay()">Stop</v-btn>
                    <v-btn @click="saveReplay()">저장</v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    // import LabBase from "./LabBase";
    import LabBase from "./LabStorageBase";
    import DiffMatchPatch from "diff-match-patch";
    import {Icon} from '@iconify/vue2';
 
    const diffPatcher = new DiffMatchPatch();
    export default {
        name: "ReplayPlayer",
        mixins: [LabBase],
        props: {
            selectedUser: Object
        },
        components:{
            Icon,
        },
        data() {
            return {
                saveReplayLists: null,
                clickX: 0,
                clickY: 0,
                diffList: [],
                imgUrl: null,
                keyLists: [],
                nowIndex: null,
                playInterval: null,
                recordStatus: false,
                maxlength: 0,
                replayDialog: false,
                replayListDialog: false,
                replayName: "",
                snapshotCount: 0,
                imageWidth: 0,
                imageHeight: 0,
                clickPointer: false,
                LoadPlayList: false,
                playing: false,
                playIcon:true,
                classInfo:null,
            }
        },
        async created() {
            this.classInfo = await this.getClassInfo();
        },
        computed: {
            diffLength() {
                if (this.diffList)
                    return Object.keys(this.diffList).length
            }
        },
        async mounted() {
            var me = this
            if (me.selectedUser) {
                me.watch('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.selectedUser.email.replace(/\./gi, '_')}/snapshot`), function (data) {
                    if(data){
                        if(window.ipcRenderer){
                            me.imgUrl = data.img
                            me.nowIndex = data.index
                        }
                    }
                })
                // this.watch('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/loadStepforUserImage`), async function (data) {
                //     if(data == 'loadUserScreen'){
                //         me.imgUrl = await me.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.selectedUser.email.replace(/\./gi, '_')}/userScreen`))
                //         me.$EventBus.$emit("finishLoadUserScreen")
                //     }
                // })
                // var tmp = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${me.labId}/userInfo/${me.selectedUser.email.replace(/\./gi, '_')}/snapshot`))
                // if (tmp)
                //     me.imgUrl = tmp.img;
            } else {
                // userId가 없을때는 클래스에 저장된 이미지 받아옴.
                var tmp = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/playingTmp`));
                if(!tmp){
                    var tmp = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`labs/${me.labId}/playingTmp`));
                }
                if (tmp) {
                    me.diffList = tmp;
                    me.keyLists = Object.keys(me.diffList);
                    me.maxlength = me.keyLists.length - 1;
                    me.nowIndex = 0;
                    if (me.diffList[me.keyLists[0]].length != 0) {
                        if (me.diffList[me.keyLists[0]].includes("data:image/png;base64"))
                            me.imgUrl = me.diffList[me.keyLists[0]];
                        else {
                            var patchResult = diffPatcher.patch_apply(me.diffList[me.keyLists[0]], "")
                            me.imgUrl = patchResult[0];
                        }
                    }

                    // if (JSON.parse(me.diffList[me.keyLists[0]]).x) {
                    //     me.clickX = JSON.parse(me.diffList[me.keyLists[0]]).x;
                    //     me.clickY = JSON.parse(me.diffList[me.keyLists[0]]).y;
                    // }
                }
            }
            if (!me.isTeacher) {
                // isTeacher 아닐때는 무조건 녹화를 시작함.
                if (window.ipcRenderer)
                    this.startRecord();
            }

            this.$nextTick(function () {
                try {
                    if (!me.selectedUser) {
                        if (window.ipcRenderer && me.isAdmin) {
                            window.ipcRenderer.on("startRecord", function (event, img) {
                                me.recordStatus = true
                                me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/playingTmp`), null , async function (data) {
                                    me.keyLists.push(data.key);
                                    me.diffList[data.key] = data.value;
                                    if (!me.nowIndex)
                                        me.nowIndex = 0;
                                    me.maxlength = me.keyLists.length;
                                    me.snapshotCount = me.keyLists.length - 1;
                                })
                            })
                            window.ipcRenderer.on("stopRecord", function (event, img) {
                                me.recordStatus = false
                                // me.nowIndex = 0;
                                // me.replayListDialog = true;
                            })
                        } else {
                            me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/playingTmp`), null, async function (data) {
                                me.keyLists.push(data.key);
                                me.diffList[data.key] = data.value;
                                if (!me.nowIndex)
                                    me.nowIndex = 0;
                                me.maxlength = me.keyLists.length;
                                me.snapshotCount = me.keyLists.length - 1;
                            })
                        }
                    } else {
                        // me.recordStatus = true
                        me.watch_changed('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/userInfo/${me.selectedUser.email.replace(/\./gi, '_')}/snapshot`), function (data, key) {
                            if (key == "img") {
                                me.imgUrl = data
                            } else if (key == "index") {
                                me.nowIndex = data
                            }
                        })
                    }
                } catch(e){
                    console.log(e.message)
                }
            })

        },
        // beforeDestroy(){
        //     this.watch_off('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${me.labId}/userInfo/${me.selectedUser.email.replace(/\./gi, '_')}/snapshot`))
        // },
        watch: {
            clickX() {
                var me = this
                this.clickPointer = false
                this.$nextTick(function () {
                    me.clickPointer = true
                })
            },
            async replayDialog(newVal) {
                var me = this
                if (newVal == true && me.selectedUser) {
                    me.diffList = [];
                    me.keyLists = [];
                    // 유저 아이디가 있을때는 해당 유저의 Img받아옴.
                    // me.diffList = await this.getString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${me.labId}/${me.selectedUser.email.replace(/\./gi, '_')}/playing`));
                    // me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/${me.selectedUser.email.replace(/\./gi, '_')}/playing`), function(data){
                    //     me.diffList[data.key] = data.value
                    //     // console.log(data)
                    //     if (me.diffList) {
                    //         me.keyLists = Object.keys(me.diffList)
                    //         me.maxlength = me.keyLists.length - 1;
                    //         // me.nowIndex = 0;
                    //         me.nowIndex = me.maxlength;
                    //         if(me.maxlength > 0){
                    //             me.LoadPlayList = true
                    //         }
                    //         // for (var i = 0; i < me.maxlength; i++) {
                    //         //     if (this.keyLists[i]) {
                    //         //         // var diff = JSON.parse(me.diffList[me.keyLists[i]]);
                    //         //         // if (JSON.parse(me.diffList[me.keyLists[i]]).diff.includes("data:image/png;base64") && diff.length == 1)
                    //         //         //     var patchResult = diffPatcher.patch_apply(JSON.parse(me.diffList[me.keyLists[i]]).diff, "")
                    //         //         // else
                    //         //         //     var patchResult = diffPatcher.patch_apply(JSON.parse(me.diffList[me.keyLists[i]]).diff, me.imgUrl)
                    //         //         //
                    //         //         // me.imgUrl = patchResult[0];
                    //         //         // me.nowIndex = i;
                    //         //     }
                    //         // }
                    //     }
                    // });
                    // console.log(me.diffList)
                } else if (newVal == false) {
                    me.diffList = [];
                    me.keyLists = [];
                    me.maxlength = 0;
                }
            },
            replayListDialog(newVal) {
                if (window.ipcRenderer) {
                    if (newVal) {
                        window.ipcRenderer.send("hideView");
                    } else {
                        var width = $(".v-navigation-drawer--is-mobile").width() ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                        var height = $(".v-main").height()
                        window.ipcRenderer.send("resizeView", {
                            x: $(".v-navigation-drawer").width(),
                            y: $(".v-toolbar").height(),
                            width: width,
                            height: height
                        })
                    }
                }

            },
            nowIndex(newVal, oldVal) {
                var me = this;
                if (oldVal > newVal) {
                    for (var i = 0; i < newVal + 1; i++) {
                        var imgUrl;
                        if (i == 0) {
                            imgUrl = ""
                        } else {
                            imgUrl = me.imgUrl;
                        }
                        if (me.diffList.length != 0 && me.diffList[me.keyLists[i]].length != 0) {
                            if (me.diffList[me.keyLists[i]].includes("data:image/png;base64"))
                                me.imgUrl = me.diffList[me.keyLists[newVal]];
                            else {
                                var patchResult = diffPatcher.patch_apply(me.diffList[me.keyLists[i]], imgUrl)
                                me.imgUrl = patchResult[0];
                            }
                        }

                        // if (JSON.parse(me.diffList[me.keyLists[i]]).x) {
                        //     me.clickX = JSON.parse(me.diffList[me.keyLists[i]]).x;
                        //     me.clickY = JSON.parse(me.diffList[me.keyLists[i]]).y;
                        // }
                    }
                } else if (!oldVal && newVal == 0) {
                    var patchResult = diffPatcher.patch_apply(this.diffList[this.keyLists[0]], "");
                    me.imgUrl = patchResult[0];

                } else {
                    for (var i = oldVal + 1; i < newVal + 1; i++) {
                        if (me.diffList.length != 0 && me.diffList[me.keyLists[i]].length != 0) {
                            if (me.diffList[me.keyLists[i]].includes("data:image/png;base64"))
                                me.imgUrl = me.diffList[me.keyLists[i]];
                            else {
                                var patchResult = diffPatcher.patch_apply(me.diffList[me.keyLists[i]], me.imgUrl)
                                me.imgUrl = patchResult[0];
                            }
                        }

                        // if (JSON.parse(me.diffList[me.keyLists[i]]).x) {
                        //     me.clickX = JSON.parse(me.diffList[me.keyLists[i]]).x;
                        //     me.clickY = JSON.parse(me.diffList[me.keyLists[i]]).y;
                        // }
                    }
                }
            }
        }
        ,
        methods: {
            // init() {
            //     var me = this
            //
            //
            // },
            openReplay() {

            },
            startPlay() {
                var me = this
                me.playing = true
                me.playIcon = false
                me.playInterval = setInterval(function () {
                    if (me.nowIndex == me.maxlength) {
                        me.stopPlay();
                    } else {
                        me.nowIndex++
                    }
                }, 1000)
            }
            ,
            stopPlay() {
                clearInterval(this.playInterval);
                this.playing = false
                this.playIcon = true
            }
            ,
            startRecord() {
                var me = this
                me.recordStatus = true
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("startRecord");

                    // this.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`${me.labId}/playingTmp`), function (data) {
                    //     console.log(data)
                    // })
                }


            },
            stopRecord() {
                var me = this
                me.recordStatus = false
                if (window.ipcRenderer) {
                    window.ipcRenderer.send("stopRecord")
                }
            },
            async saveReplay() {
                var me = this

                var lists = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/playingTmp`))
                if(!lists){
                    var lists = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`labs/${me.labId}/playingTmp`))
                }
                var obj = {
                    name: me.replayName,
                    lists: lists
                }
                await this.pushObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/playlists`), obj);
                await this.delete('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`labs/${me.labId}/playingTmp`));
                this.replayDialog = false;
            },
            handleResize({width, height}) {
                var me = this
                // me.clickPointer = false;
                me.imageWidth = width;
                me.imageHeight = height
                // me.$nextTick(function () {
                //     me.clickPointer = tre
                // })
                // var width = newVal ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                // var height = $(".v-main").height()
                // if (window.ipcRenderer)
                //     window.ipcRenderer.send("resizeView", {
                //         x: me.guideOpened ? $(".v-navigation-drawer").width() : 0,
                //         y: $(".v-toolbar").height(),
                //         width: width,
                //         height: height
                //     })
            },
        }
    }
</script>

<style scoped>

</style>