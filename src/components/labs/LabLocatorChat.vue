<template>
    <v-container style="overflow-y:hidden;">
        <transition name="fade">
            <v-card v-if="chatStatus" v-bind:class="{ classRoom: initUser, labs: !initUser }"
                    style="z-index: 999; border: solid 1px;"
                    outlined
                    align="left"
                    :width="selectedUser ? '100%':'28%'" min-height="440px" min-width="380px"
            >
                <div align="right" style="float: right; margin-top: 10px; margin-right: 5px; margin-bottom: 5px">
                    <v-icon v-if="!selectedUser" text @click="closeChat">mdi-close</v-icon>
                </div>
                <v-tabs
                        v-model="chatRoom"
                        center-active
                        centered
                        style="display: block; width:100%; text-align: center; border-bottom: 1px solid;"
                        @change="changeRoom"
                        hide-slider
                >
                    <v-tab
                            v-for="n in chatRoomList"
                            :key="n"
                    >
                        <v-avatar
                                v-if="unReadMessage(n) > 0"
                                style="position: absolute; right: 1px; top: 1px;"
                                color="green"
                                size="22"
                        >
                            {{unReadMessage(n)}}
                        </v-avatar>
                        {{ n }}
                    </v-tab>
                    <div>
                    </div>
                </v-tabs><!-- :style="{height: windowHeight < 900 ? '72%' : '75%'}" -->
                <v-card-text style="overflow: auto; height:630px; overflow-x:hidden;"
                             :style="selectedUser ? 'max-height: 630px;':'max-height: 74.5%;' "
                             class="chatBlock">
                             <div style="text-align:center">
                                 <v-btn v-if="loadChatAll[chatRoom] && !loadChat" text @click="getmoreChat()">더보기</v-btn>
                                 <v-progress-circular v-if="loadChat" 
                                    indeterminate
                                    color="primary"
                                >
                                </v-progress-circular>
                             </div>
                    <div v-for="(item,idx) in filteredChat" v-if="item.userId"
                         @contextmenu.prevent="contextOpen($event,item,idx)">
                        <div v-if="item.userId == connectUserId"
                             style="width: 100%;
                                        display: block;
                                        text-align: right;
                                        float: right;"
                             :class="item.id"
                        >
                        <span v-if="item.divider && item.today">
                            <b>{{item.today.Year}}년 {{item.today.Month}}월 {{item.today.Day}}일</b>
                            <v-divider /> 
                        </span>
                        <span class="caption"
                              :style="selectedUser ? 'margin-left: 84%' : 'margin-left: 84%'"
                              style="display: inline-block;
                                        width:60px;
                                        height:20px;
                                        margin-bottom:-15px;
                                        margin-top:15px;
                                        text-align:center;">
                                    {{item.timeStamp}}</span>
                            <v-card v-if="item.image"
                                :style="item.replyClass ? 'height:162px':''"
                                style="width: 80%; margin-left:21%; margin-bottom:10px; padding:5px;
                                        background-color:#ADE6B3;"
                            >
                                <v-img  style="background-color: white;"
                                        @click="chatImg(item.image)"
                                        :src="item.image"
                                        >
                            <!-- @load="scrollToEnd" -->
                                        </v-img>
                            </v-card>
                            <transition>
                                <div v-if="item.message && !item.replyUserEmail"
                                     @dblclick="beforeReply(item)"
                                     style="white-space:pre-wrap; display: inline-block; text-align: left; margin-top: 0px; margin-bottom:35px;"
                                     class="balloon_03"
                                >
                                    <div style="text-align: left;" v-html="item.message"></div>
                                </div>
                                <div v-else-if="item.message && item.replyMessage && !item.replyImage"
                                     @dblclick="beforeReply(item)"
                                     class="balloon_03"
                                     style="white-space:pre-wrap;
                                            display: inline-block;
                                             text-align: left;"
                                >
                                    <div style="border-bottom:1px solid black; padding-bottom:5px;"
                                         @click="viewMessage(item.replyClass)"><span
                                            class="caption reusername"
                                    >{{item.replyUserName}}(님) 에게 답장</span>{{item.replyMessage}}</div>
                                    <div style="text-align: left;
                                                padding-top:5px;"
                                         v-html="item.message">
                                    </div>
                                </div>
                                <div v-else-if="item.message && item.replyImage"
                                     @dblclick="beforeReply(item)"
                                     class="balloon_03"
                                     style="white-space:pre-wrap;
                                            display: inline-block;
                                             text-align: left;
                                             margin-top:0;"
                                >
                                    <div style="border-bottom:1px solid black; padding-bottom:5px;"
                                         @click="viewMessage(item.replyClass)"><span
                                            class="caption reusername"
                                    >{{item.replyUserName}}(님) 에게 답장</span>{{item.replyMessage}}
                                        <v-img
                                            :style="item.replyMessage ? 'margin-top: -20px;' : 'margin-top: -30px;'"
                                            style="background-color: white;"
                                            @click="chatImg(item.replyImage)"
                                            width= "100"
                                            :src="item.replyImage"
                                        ></v-img>
                                    </div>
                                    <div style="text-align: left;
                                                padding-top:5px;"
                                         v-html="item.message">
                                    </div>
                                </div>
                                <div v-else-if="item.classroomMessage && item.replyMessage"
                                     @dblclick="beforeReply(item)"
                                     class="balloon_03"
                                     style="white-space:pre-wrap;
                                            display: inline-block;
                                            text-align: left;"
                                >
                                    <div style="border-bottom:1px solid black; padding-bottom:5px;"
                                         @click="viewMessage(item.replyClass)"><span
                                            class="caption reusername"
                                    >{{item.replyUserName}}(님) 에게 답장</span>{{item.replyMessage}}</div>
                                    <div style="text-align: left;
                                                padding-top:5px;"
                                         v-html="item.classroomMessage"></div>
                                </div>
                                <div v-else-if="item.replyUserEmail && item.classroomMessage"
                                     style="white-space:pre-wrap; display: inline-block; text-align: left; margin-top:0px;"
                                     class="balloon_03"
                                >
                                    <div>
                                    <span class="caption reusername"
                                          style="margin-bottom:10px;
                                                    display:block;"
                                    >{{item.replyUserName}}(님) 에게 답장</span>
                                    </div>{{item.classroomMessage}}</div>
                            </transition>

                        </div>
                        <div v-else @contextmenu.prevent="contextOpen($event,item,idx)" class="clearfix">
                            <span v-if="item.divider && item.today">
                                <b>{{item.today.Year}}년 {{item.today.Month}}월 {{item.today.Day}}일</b>
                                <v-divider /> 
                            </span>
                            <span class="caption"
                                :style="selectedUser ? 'margin-left: 50px' : 'margin-left:45px'"
                                style="display: block;
                                            width:200px;
                                            height:15px;
                                            margin-top:20px;
                                            margin-bottom:-15px;
                                            text-align:left;"
                            >{{item.userName}} - {{item.timeStamp}}
                            </span>
                            <div v-for="user in enrolledUserPhotodata">
                                <div v-if="user.email == item.userId">
                                    <div v-if="user.photoURL">
                                        <v-avatar
                                                size="37"
                                                style="margin-right:3px;"
                                                id="test">
                                            <img
                                                    alt="Avatar"
                                                    :src="user.photoURL"
                                                    @click.stop="chatImg(item.image)"
                                                    @dblclick="beforeReply(item)">
                                        </v-avatar>
                                    </div>
                                    <div v-else>
                                        <v-icon x-large id="test"
                                                style="width:40px;
                                            height:40px;
                                            margin:12px;
                                            margin:0 auto;
                                            ">
                                            mdi-account-circle
                                        </v-icon>
                                    </div>
                                </div>
                            </div>
                             <!-- <v-card v-if="item.image"
                                style="width: auto; display: inline-block;
                                        position: relative; left:auto;
                                        border-radius: 20px;
                                        margin-bottom:auto;"> -->
                                <!-- :style="item.replyClass ? 'height:162px':''"
                                style="width: auto; display: inline-block;
                                        margin-bottom:25px; position:relative; left:-40px;
                                        top:40px;width:80%; background-color:#dfe6e9;
                                        padding:5px; margin-bottom:30px;"> -->
                                    <!-- <v-img
                                       style="background-color: white;"
                                       @click.stop="chatImg(item.image)"
                                       @dblclick="beforeReply(item)"
                                       :src="item.image">
                                    </v-img> -->
                               
                            <!-- </v-card> -->
                            <div v-if="item.image">
                                       <v-avatar
                                            size="37"
                                            style="margin-right:3px; margin-bottom: -60px; top: -30px;"
                                            id="Help">
                                        <img
                                                alt="Avatar"
                                                :src="item.image"
                                                @click.stop="chatImg(item.image)"
                                                @dblclick="beforeReply(item)">
                                    </v-avatar>
                            </div>
                            <div v-if="item.isTyping" style="white-space:pre-wrap; display: inline-block; text-align: left;" class="balloon_04">
                                <vue-typed-js :strings="[item.message]"
                                            :typeSpeed="40"
                                            :showCursor="false"
                                            @onComplete="item.isTyping = false">
                                            <span class="typing"></span>
                                            
                                </vue-typed-js>
                            </div>
                           
                            <transition class="clearfix" v-else>
                                
                                <div v-if="item.message && !item.replyUserEmail"
                                     @dblclick="beforeReply(item)"
                                     style="white-space:pre-wrap; display: inline-block; text-align: left;"
                                     class="balloon_04"
                                >
                                    <div style="text-align: left;" v-html="item.message"></div>
                                </div>
                                <div v-else-if="item.message && item.replyMessage && !item.replyImage"
                                     @dblclick="beforeReply(item)"
                                     style=" white-space:pre-wrap; display: inline-block; text-align: left; "
                                     class="balloon_04"
                                >
                                    <div style="border-bottom:1px solid black; padding-bottom:5px;"
                                         @click="viewMessage(item.replyClass)"><span
                                            class="caption reusername"
                                    >{{item.replyUserName}}(님) 에게 답장</span>{{item.replyMessage}}</div>
                                    <div v-html="item.message" style="padding-top:5px;"></div>
                                </div>

                                <div v-else-if="item.message && item.replyImage"
                                     @dblclick="beforeReply(item)"
                                     class="balloon_04"
                                     style="white-space:pre-wrap;
                                            display: inline-block;
                                             text-align: left;"
                                >
                                    <div style="border-bottom:1px solid black; padding-bottom:5px;"
                                         @click="viewMessage(item.replyClass)"><span
                                            class="caption reusername"
                                    >{{item.replyUserName}}(님) 에게 답장</span>{{item.replyMessage}}
                                    <v-img
                                        :style="item.replyMessage ? 'margin-top: -20px;' : 'margin-top: -30px;'"  
                                        style="background-color: white;"
                                        @click="chatImg(item.replyImage)"
                                        width= "100"
                                        :src="item.replyImage"
                                    ></v-img></div> 
                                    <div style="text-align: left;
                                                padding-top:5px;"
                                         v-html="item.message">
                                    </div>
                                </div>

                                <div v-else-if="item.classroomMessage && item.replyMessage"
                                     @dblclick="beforeReply(item)"
                                     style=" white-space:pre-wrap; display: inline-block; text-align: left; "
                                     class="balloon_04"
                                >
                                    <div style="border-bottom:1px solid black; padding-bottom:5px; "
                                         @click="viewMessage(item.replyClass)">
                                    <span class="caption reusername"
                                    >{{item.replyUserName}}(님) 에게 답장</span
                                    >{{item.replyMessage}}</div>
                                    <div v-html="item.classroomMessage" style="padding-top:5px;"></div>
                                </div>
                                <div v-else-if="item.replyUserEmail && item.classroomMessage"
                                     style="white-space:pre-wrap; display: inline-block; text-align: left;"
                                     class="balloon_04"
                                >
                                    <div>
                                    <span class="caption reusername"
                                          style="margin-bottom:10px;
                                                    display:block;">{{item.replyUserName}}(님) 에게 답장</span>
                                    </div
                                    >{{item.classroomMessage}}</div>
                            </transition>
                        </div>
                    </div>
                    <vue-context ref="menu" @open="onOpen">
                        <li>
                            <a @click.prevent="onClick($event.target.innerText)">답장</a>
                        </li>
                        <li>
                            <a @click.prevent="onClick($event.target.innerText)">랩실 보기</a>
                        </li>
                        <li>
                            <a @click.prevent="onClick($event.target.innerText)">복사</a>
                        </li>
                        <li class="v-context__sub" v-if="answerList && isAdmin">
                            <a>답</a>
                            <ul class="v-context">
                                <li>
                                    <a v-for="answer in answerMenuList" @click="clickAnswer(answer.route)">{{answer.errName}}:
                                        {{answer.route}}</a>
                                </li>
                            </ul>
                        </li>
                    </vue-context>
                </v-card-text>
                <div v-if="reply">
                    <v-card :style="selectedUser ? 'margin-bottom:-40px;':'margin-top:-50px;'"
                            style="margin-left: 5px; margin-right: 5px;
                                    background-color:#dfe6e9;
                                    position:relative;
                                    display:block; padding-bottom:8px;"
                                    
                    >
                        <v-icon text @click="reply = null" style="display: block; float: right;">mdi-close</v-icon>
                        <em style="color:#0984e3; margin-left:10px;">{{reply.userName}}</em> (님) 에게 답장 <br>
                        <span style="margin-left: 12px;" :style="reply.image ? 'margin-left:70px;':''" v-if="reply.message.length > 19">{{reply.message.substring(0,19)}}...</span>
                        <span style="margin-left: 12px;" v-else v-html="reply.message"></span>
                        <v-img style=" margin-top:-20px; margin-left:10px; border:solid 1px; background-color: white;" v-if="reply.image" @click="chatImg(reply.image)" width= "50" :src="reply.image"></v-img>
                    </v-card>
                </div>
                <div style="height: 20%">
                    <v-card-actions style="height: 105px;
                                            display:block;
                                            width:100%;
                                            position:relative;"
                                    :style="selectedUser ? 'bottom:-35px;':'bottom:5px;'">
                        <v-icon small v-if="reply" style="position:absolute; top:25px;">mdi-subdirectory-arrow-right
                        </v-icon>
                        <!-- <v-icon>mdi-bell-ring</v-icon>  -->
                        <v-textarea
                                v-if="chatRoom == 0 && isAdmin"
                                style="overflow: auto;"
                                v-model="message"
                                outlined
                                rows="1"
                                row-height="25"
                                no-resize
                                clearable
                                append-icon="mdi-camera"
                                :prepend-icon="chatBellOff ? 'mdi-bell-off':'mdi-bell'"
                                @click:prepend="chatBellOff = !chatBellOff"
                                @click:append="screenCapture()"
                                @keypress.alt.enter="lineBreak()"
                                @keyup.enter.exact="postChatMessage()"
                        ></v-textarea>
                        <div
                                v-else-if="chatRoom == 0 && !isAdmin"
                        ></div>
                        <v-textarea
                                v-else
                                style="overflow: auto;"
                                v-model="message"
                                outlined
                                rows="1"
                                row-height="25"
                                no-resize
                                append-icon="mdi-camera"
                                :prepend-icon="chatBellOff ? 'mdi-bell-off':'mdi-bell'"
                                @click:prepend="chatBellOff = !chatBellOff"
                                @click:append="screenCapture()"
                                @keypress.alt.enter="lineBreak()"
                                @keyup.enter.exact="postChatMessage()"
                        ></v-textarea>
                    </v-card-actions>
                </div>
            </v-card>
        </transition>
        <transition name="fade">
            <v-card v-if="chatStatus && capturing"
                    color="primary"
                    style=" z-index:1000; position:absolute; display:block; bottom:100px;"
                    width="24%" min-width="345px">
                
                <div v-if="!isCapture" align="right" style="float: right; margin-top: 5px; margin-right: 5px; margin-bottom: 5px;">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon bind="attrs" v-on="on" style="margin-right:10px;" color="white" text @click="postChatMessage()" depressed>
                                mdi-file-send
                            </v-icon>
                        </template>
                        <span>이미지 전송</span>
                    </v-tooltip>
                    <v-icon color="white" text @click="tmpImage = null, capturing = false">mdi-close</v-icon>
                </div>
                <v-card-title style="position:relative;
                                    font-size:20px;
                                    height:30px;
                                    line-height:0;
                                    color:white;"
                >Preview
                </v-card-title>
                <div style="margin-bottom: 30px; margin-left: 20px;" v-if="isCapture">
                    <v-progress-circular
                            indeterminate
                            color="white"
                    ></v-progress-circular>
                </div>
                <v-card-text v-if="!isCapture"
                             style="width:365px; height:195px; margin-left:-10px; margin-right:-100px; padding: 30px; margin-bottom:40px; margin-top: -20px;">
                    <v-img style = "height:180px; background-color: white;" @click.native="tmpImgDialog = true"
                           :src="tmpImage">
                            <!-- @load="scrollToEnd" -->
                    </v-img>
                </v-card-text>
            </v-card>


        </transition>
        <transition name="fade">
            <v-btn v-if="!chatStatus"
                   fab
                   large
                   primary
                   bottom
                   left
                   absolute
                   style="bottom: 10px;"
                   @click="chatManager()"
            >
                <v-icon color="primary">mdi-chat</v-icon>
                <v-avatar
                        class="newMessage"
                        v-if="newMessage"
                        :style="newMessageCnt < 99 ? 'position: absolute; right: -4px; top: -17px;':'position: absolute; right: -7px; top: -25px;'"
                        color="red"
                        :size="newMessageCnt < 99 ? '22':'32'"
                >
                   {{ newMessageCnt }}
                </v-avatar>
            </v-btn>

        </transition>
        <v-dialog
                v-model="tmpImgDialog"
                width="1000"
        >
            <v-img style="background-color: white;" :src="tmpImage"></v-img>
        </v-dialog>
        <v-dialog
                v-model="chatImgDialog"
                width="1000"
                @click:outside="removeChatImg()"
        >
            <v-img @click="chatImgDialog = false" style="background-color: white;" :src="chatImage"></v-img>
        </v-dialog>

        <!-- <v-dialog
            v-model="openMongo"
            width="1000"
        >
            <v-card>
                <div v-for="msg in mongoMessage">
                    from: {{ msg.fullDocument.from }}<br />
                    message: {{ msg.fullDocument.message }}<br />
                    ---
                </div>
            </v-card>
        </v-dialog> -->

        <v-snackbar
                v-if="!chatBellOff"
                :timeout="3000"
                v-model="snackBar.show"
                style="z-index:999; margin-left: -7px;"  
                :style="chatStatus ? 'margin-bottom: 67px; margin-left: 3px; display: block; height: 65px; max-width: 370px;':'margin-top:-80px;'"
                :color="chatStatus ? '#747d8c':'primary'"
        >
        <div style="display: block; max-width: 330px; margin-left: -10px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; width: 100%; -webkit-line-clamp: 1;">
            <!-- {{"(" + snackBar.ChatRoom + ") "}}<b>{{snackBar.UserName}}</b><br> {{snackBar.Message}} -->
            {{snackBar.Message}}
        </div>    
            <!-- mdi-comment-text-outline -->
            <v-icon v-if="!chatStatus" style="z-index:999; float: right;" @click="openChatRoom()">mdi-import</v-icon>
            <v-icon v-if="chatStatus" style="z-index:999; float: right; position: absolute; left: 330px; bottom: 2px;"  @click="showMessage()">mdi-arrow-down</v-icon>
            <div v-if="snackBar.Img">
                
                <br>
                <img :src="snackBar.Img" style="width: 80%; background-color: white;">
            </div>
        </v-snackbar>
    </v-container>
</template>

<script>
    import ChatBase from './ChatBase'
    import Typed from 'typed.js';
    import { VueTypedJs } from 'vue-typed-js'
 
    export default {
        name: "Chat",
        props: {
            labInfo: Object,
            initUser: String,
            selectedUser: Object,
        },
        mixins: [ChatBase],
        components: {
            VueTypedJs
        },
        data() {
            return {
                // openMongo: false,
                chatStatus: false,
                showResultBtn: false,
                labResult: null,
            }
        },
        watch: {},
        async created() {},
        async mounted() {
            var me = this
            // this.watch('firebase//labs/' + me.getBucketByTenantId() + '/' + me.getClassPath(`labs/${me.labId}/labResult/${me.myId.replace(/\./gi, '_')}`), function(data){
            //     if(data){
            //         me.showResultBtn = true
            //     }
            // })
        },

        methods: {
            openChatRoom(){
                this.snackBar.show = false
                this.chatManager();
            },
            chatManager() {
                this.chatStatus = true
                this.newMessage = false
                this.newMessageCnt = 0
                sessionStorage.setItem("chatStatus", 'true')
                this.$EventBus.$emit("newMessageCnt", this.newMessageCnt)
            },
            closeChat() {
                this.chatStatus = false
                this.capturing = false
                this.newMessage = false
                this.newMessageCnt = 0
                sessionStorage.setItem("chatStatus", 'false')
                this.$EventBus.$emit("newMessageCnt", this.newMessageCnt)
            },
        },
            
        computed: {
            
        }
    }
</script>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity .5s
    }

    .fade-enter,
    .fade-leave-to {
        opacity: 0
    }

    .newMessage {
        font-size: small;
        color: white;
    }

    .chatBubble {
        display: inline-flex;
        width: auto;
        word-break: break-word !important;
        border-radius: 20px;
        font-size: 15px;
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 12px;
        padding-right: 12px
    }

    .labs {
        position: absolute;
        right: 16px;
        bottom: 10px;
        height: 60%
    }

    .classRoom {
        height: 100%;
        width: 100%;
    }

    .balloon_03 {
        position: relative;
        margin: 12px;
        margin-left: 50px;
        left: 10px;
        background: #ADE6B3;
        border-radius: 5px;
        float: right;
        padding: 10px;
        font-size: 15px;
        max-width: 70%;
        margin-bottom: 15px;
    }

    .balloon_03:after {
        border-top: 10px solid #ADE6B3;
        border-left: 0px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 0px solid transparent;
        content: "";
        position: absolute;
        top: 5px;
        left: 99.5%;
        border-top-right-radius: 5px;
    }

    .balloon_04 {
        position: relative;
        margin: 15px;
        margin-left: 2%;
        margin-bottom: 20px;
        top: 5px;
        background: #dfe6e9;
        border-radius: 5px;
        padding: 10px;
        max-width: 70%;
        font-size: 15px;
    }

    .balloon_04:after {
        border-top: 10px solid #dfe6e9;
        border-left: 10px solid transparent;
        border-right: 0px solid transparent;
        border-bottom: 0px solid transparent;
        content: "";
        position: absolute;
        top: 5px;
        border-top-left-radius: 5px;
        left: -9px;
    }

    .reusername {
        display: block;
        font-weight: 900;
        width: auto;
        height: 10px;
        margin-bottom:10px;
    }

    .balloon_04:after, #test {
        float: left;
    }

    .clearfix::after {
        content: "";
        display: block;
        clear: both;
    }

</style>