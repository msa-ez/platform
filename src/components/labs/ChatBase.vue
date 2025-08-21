<template>
    <v-dialog v-model="showLoginCard"><Login :onlyGitLogin="true" @login="showLoginCard = false" /></v-dialog>
</template>

<script>
    import html2canvas from 'html2canvas'
    import LabBase from "./LabStorageBase"
    import VueContext from 'vue-context';
    import 'vue-context/src/sass/vue-context.scss';
    import {functions} from 'firebase';
    import Login from "../oauth/Login";
    const axios = require('axios');
    export default {
        name: "ChatBase",
        props: {
            labInfo: Object,
            initUser: String,
            selectedUser: Object,
        },
        mixins: [LabBase],
        components: {
            VueContext,
            Login
        },
        data() {
            return {
                showLoginCard: false,
                autoReplyList: null,
                screenCaptureRetryCnt: 0,
                lastIdInSnapshot: null,
                loadEnded: false,
                chatRoom: 1,
                message: "",
                chat: {},
                chatRoomList: ["Notice", "Class", "Group"],
                tmpImage: null,
                chatImage: null,
                autoReply: null,
                classChatData: [],
                noticeChatData: [],
                groupChatData: [],
                classTmpChatData: [],
                groupTmpChatData: [],
                noticeTmpChatData: [],
                enrolledUserPhotodata: [],
                tmpImgDialog: false,
                chatImgDialog: false,
                classInfo: null,
                reply: null,
                tmpItem: null,
                windowHeight: window.innerHeight,
                answerList: null,
                newMessage: false,
                newMessageCnt: 0,
                newImageCnt: 0,
                lastMessageTimeStamp : null,
                snackBar: {
                    Message: '',
                    show: false,
                    UserName: '',
                    ChatRoom: '',
                    Img: '',
                    ChatRoomNumber: null,
                },
                isCapture: false,
                capturing: false,
                //new
                // test1: false,
                // test2: false,
                classChatLastKey: null,
                noticeChatLastKey: null,
                groupChatLastKey: null,
                loadChatAll: {},
                loadChat: false,
                lastChatData: {},
                openUserList: false,
                userList: null,
                showImage: false,
                chatBellOff: false,
                hideIpcRender: false,
                firstLoadUrl: false,
            }
        },
        watch: {
            openUserList(){
                if(this.openUserList){
                    this.hideIpcRender = true
                } else this.hideIpcRender = false
            },
            chatImgDialog() {
                if(this.chatImgDialog){
                    this.hideIpcRender = true
                } else this.hideIpcRender = false
            },
            hideIpcRender() {
                if (window.ipcRenderer) {
                    if (this.hideIpcRender) {
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
            
            
            chatRoom() {
                var me = this;
                this.$nextTick(function () {
                    me.scrollToEnd();
                })
            },
            chatStatus() {
                var me = this;
                this.$nextTick(function () {
                    me.scrollToEnd();
                })
            },
            selectedUser() {
                var me = this;
                this.$nextTick(function () {
                    me.scrollToEnd();
                })
            },
            loadEnded(newVal) {
                var me = this
                // console.log("loadEnded!!")
                // if (newVal) {
                //     if (me.noticeTmpChatData.length > 1) {
                //         var reverseNoticeTmpChatData = me.noticeTmpChatData.reverse();
                //
                //         reverseNoticeTmpChatData.forEach(function (item) {
                //             if(item.url && (item.lab == me.labInfo.labId)) {
                //                 me.openView(item.url)
                //                 return;
                //             }
                //         })
                //     } else if (me.noticeChatData.length > 1) {
                //         var reverseNoticeChatData = me.noticeChatData.reverse();
                //         reverseNoticeChatData.forEach(function (item) {
                //             if(item.url && (item.lab == me.labInfo.labId)) {
                //                 me.openView(item.url)
                //                 return;
                //             }
                //         })
                //     }
                // }
            }
        },
        async created() {
            var me = this
            if (this.selectedUser) {
                me.chatStatus = true;
            }


        },
        async mounted() {
            var me = this 
            // var socket = new WebSocket("ws://admin:secret@127.0.0.1:8080/messages/_streams/all")
            // socket.onopen = () => {
            //     socket.onmessage = ({data}) => {
            //         console.log(data)
            //     }
            // } 
            // var websocket = new WebSocket("ws://admin:secret@127.0.0.1:8080/messages/_streams/all");
            // websocket.onopen = () => {
            //     websocket.onmessage = ({data}) => {
            //         var msg = JSON.parse(data);
            //         this.mongoMessage.push(msg)
            //         console.log(this.mongoMessage)
            //     }
            // }
            window.addEventListener('message', function (e) {
                if (e.data.message === 'screenShot') {
                    me.tmpImage = e.data.screenShot;
                }
            });
            this.$nextTick(() => {
                window.addEventListener('resize', this.onResize);
            })
            await this.init();
            if(window.ipcRenderer){
                var setClassId = me.classId.replace('running@', '')
                if(me.connectUserId){
                    var userId = me.connectUserId.replace('.','_')
                }
                var getMyURL = await this.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/' + userId + '/myURL')
                if(!getMyURL){
                    var getMyURL = await this.getString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/running/' + setClassId + '/labs/' + me.labInfo.labId + '/' + userId + '/myURL')
                }
                if(me.labInfo && me.labInfo.URL || getMyURL){
                    if(getMyURL){
                        me.openView(getMyURL)
                    } else {
                        if(me.labInfo.URL == 'https://'){
                            me.closeView(me.labInfo.URL)
                        } else {
                            me.openView(me.labInfo.URL)
                        }
                    }
                    me.firstLoadUrl = true
                }
            }
            me.$EventBus.$on("urlUpdateForStudent", function (url) {
                if(url){
                    if(url == 'https://'){
                        me.closeView(url);
                    } else {
                        me.openView(url)
                    }
                }
            })
            var setClassId = me.classId.replace('running@', '')

            if(window && window.ipcRenderer){
                if(me.isLogin){
                    var userId = me.connectUserId.replace('.','_');
                    window.ipcRenderer.on("newURL", function (event, url) {
                        if(url){
                            me.setString('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/' + userId + '/myURL', url)
                            me.$EventBus.$emit("urlUpdate", url)
                        }
                    })
                }
            }
            if(window.ipcRenderer){
                this.watch('db://labs/' + me.getBucketByTenantId() + '/' + me.courseId + '/classes/' + setClassId + '/labs/' + me.labInfo.labId + '/URL', function(url){
                    if(url && !me.firstLoadUrl) {
                        if(url == 'https://'){
                            me.closeView(url);
                        } else {
                            me.openView(url)
                        }
                    }
                })
            }
            
            this.getfirstChat();
            me.userList = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers/`))
            if(!me.userList){
                me.userList = await me.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`enrolledUsers/`))
            }
            
            me.firstLoadUrl = false
            if(localStorage.getItem('gitAccessToken') || localStorage.getItem('gitToken')){
                var gitAccessToken = localStorage.getItem('gitAccessToken') ? localStorage.getItem('gitAccessToken') : localStorage.getItem('gitToken')
                var githubHeaders = {
                    Authorization: 'token ' + gitAccessToken,
                    Accept: 'application/vnd.github+json'
                }
                // TODO: 해당 부분은 Github에서 코드를 받아오는 부분
                var replyList = await axios.get(`https://api.github.com/repos/msa-ez/msa-ez.github.io/contents/autoReply.json`, { headers: githubHeaders })
                .catch(function (error) {
                    if(error.response.status === 401){
                        me.alertReLogin()
                    }
                    alert(error)
                })
                if(replyList && replyList.data.content) {
                    me.autoReplyList = JSON.parse(decodeURIComponent(escape(atob(replyList.data.content))))
                }
            } else {
                me.autoReplyList = {
                    "1" : "1. 서비스를 실행하려는 위치에 porm.xml 파일이 있는지 확인하세요. \n 2. mvn spring-boot:run 명령어를 정확하게 입력하였는지 확인하세요.",
                    "2" : "1. 서비스가 실행중인 터미널을 닫으세요. \n 2. 서비스가 실행중인 터미널에 Ctrl + C를 입력하세요. \n 3. 터미널에 (fuser-k 8081/tcp)를 입력하세요. \n 앞선 3가지의 방법 이후 다시 명령어(mvn spring-boot:run)를 입력하면 서비스를 다시 실행할 수 있습니다.",
                    "3" : "pip install httpie 명령어를 입력하여 httpie를 설치해주세요.",
                    "4" : "터미널에 cd kafka 를 입력하여 카프카로 이동한 뒤, docker-compose up 명령어를 입력해주세요.",
                    "5" : "터미널에 aws configure를 입력해주세요. \n 이후 안내에 따라 제공받은 엑세스 키, 시크릿 키, 배정받은 리전, json을 입력해주세요. \n 정상 접속이 되었는지는 명령어 aws iam list-account-aliases를 통해 확인 가능합니다.",
                    "6" : "aws configure를 통해 접속한 후, eksctl create cluster --name [mycluster-userid] --version 1.2x --spot --with-oidc --managed --node-type t3.medium --nodes 3 --nodes-min 1 --node-volume-type gp3 --nodes-max 3 --asg-access --full-ecr-access 를 입력해주세요.",
                    "7" : "터미널에 ./init.sh 명령어를 입력한다면 초기 설정값을 불러올 수 있습니다.",
                    "8" : "<서비스 실행> \n 1. 서비스를 실행하려는 위치에 porm.xml 파일이 있는지 확인하세요. \n 2. mvn spring-boot:run 명령어를 정확하게 입력하였는지 확인하세요. \n \n <서비스 종료> \n 1. 서비스가 실행중인 터미널을 닫으세요. \n 2. 서비스가 실행중인 터미널에 Ctrl + C를 입력하세요. \n 3. 터미널에 (fuser-k 8081/tcp)를 입력하세요." 
                }
            }
        },

        methods: {
            getToken() {
                var me = this
                return new Promise(async function (resolve, reject) {
                    await me.getString(`db://tokens/openai`)
                    .then((token) => {
                        resolve(atob(token))
                    })
                    .catch(e => {
                        reject(e)
                    })
                })
            },
            alertReLogin(){
                alert(this.$t('alertMessage.sessionExpired'));
                this.showLoginCard = true
            },
            showMessage(){
                this.scrollToEnd();
                this.snackBar.show = false
            },
            getfirstChat(){
                var me = this
                try {
                    var beforeLoadClassChatCnt = 0;
                    var afterLoadClassChatCnt = 0;
                    var beforeLoadGroupChatCnt = 0;
                    var afterLoadGroupChatCnt = 0;
                    var beforeLoadNoticeChatCnt = 0;
                    var afterLoadNoticeChatCnt = 0;
                    var isMounted = false
                    var option = {
                        sort: "desc",
                        orderBy: null,
                        size: 15,
                        startAt: null,
                        endAt: null,
                    }
                    var dateForClassChat = 0
                    me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat`), option, function (data, key) {
                        if(data.timeStamp == me.lastMessageTimeStamp){
                            data.isTyping = true
                        }
                        if (me.chatRoomList[1] == "Class") {
                            me.classChatData.push(data)
                            var copyClassChatData = me.classChatData
                        } else {
                            me.classTmpChatData.push(data)
                        }
                        if(data.today){
                            if(dateForClassChat != data.today.Day){
                                data.divider = true
                                if(dateForClassChat == 0)
                                    me.lastChatData[1] = data
                            }
                            dateForClassChat = data.today.Day
                        }

                        if(me.classChatLastKey == null)
                            me.classChatLastKey = data.key
                        if(me.classChatLastKey >= data.key){
                            beforeLoadClassChatCnt ++;
                            if(option.size == beforeLoadClassChatCnt)
                                me.loadChatAll[1] = true
                        }
                        if(me.classChatLastKey < data.key){
                            afterLoadClassChatCnt++;
                            if(afterLoadClassChatCnt > 6){
                                copyClassChatData.splice(0,1)
                                me.loadChatAll[1] = true
                                me.classChatData = copyClassChatData

                            }
                        }
                        if (data.userId != localStorage.getItem('email') && (me.classChatLastKey < data.key)) {
                                me.newMessage = true
                                me.newMessageCnt ++;
                                me.$EventBus.$emit("newMessageCnt", [me.newMessageCnt, me.chatBellOff])
                                // if(data.image) {
                                //     me.newImage = true
                                //     me.newImageCnt ++;
                                //     Object.keys(me.userList).some(function(key){
                                //         if(data.userId == me.userList[key].email){
                                //             if(!me.userList[key].cnt) me.userList[key].cnt = 1
                                //             else me.userList[key].cnt ++;
                                //             me.userList[key].img = data.image
                                //         }
                                //     })
                                // }
                                me.snackBar.UserName = data.userName
                                me.snackBar.ChatRoom = "Class"
                                me.snackBar.show = true
                                if (data.image) {
                                    me.snackBar.Message = data.message;
                                    me.snackBar.Img = ''
                                } else {
                                    me.snackBar.Message = ''
                                    me.snackBar.Img = data.image
                                }
                        }
                    })
                    var dateForGroupChat = 0
                    me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`chat/${me.myGroup}`), option, function (data, key) {
                        if (me.chatRoomList[2] == "Group") {
                            me.groupChatData.push(data)
                            var copyGroupChatData = me.groupChatData
                        } else {
                            me.groupTmpChatData.push(data)
                        }
                        if(data.today){
                            if(dateForGroupChat != data.today.Day){
                                data.divider = true
                                if(dateForGroupChat == 0)
                                    me.lastChatData[2] = data
                            }
                            dateForGroupChat = data.today.Day
                        }
                        
                        if(me.groupChatLastKey == null)
                            me.groupChatLastKey = data.key
                        if(me.groupChatLastKey >= data.key){
                            beforeLoadGroupChatCnt ++;
                            if(option.size == beforeLoadGroupChatCnt)
                                me.loadChatAll[2] = true
                            }
                        if(me.groupChatLastKey < data.key){
                            afterLoadGroupChatCnt++;
                            if(afterLoadGroupChatCnt > 6){
                                copyGroupChatData.splice(0,1)
                                me.loadChatAll[2] = true
                                me.groupChatData = copyGroupChatData

                            }
                        }
                        if (data.userId != localStorage.getItem('email') && (me.groupChatLastKey < data.key)) {
                            me.newMessage = true
                            me.newMessageCnt ++;
                            me.$EventBus.$emit("newMessageCnt", [me.newMessageCnt, me.chatBellOff])
                            me.snackBar.UserName = data.userName
                            me.snackBar.ChatRoom = "Group"
                            me.snackBar.show = true
                            if (data.image) {
                                me.snackBar.Message = ''
                                me.snackBar.Img = data.image
                            } else {
                                me.snackBar.Message = data.message;
                                me.snackBar.Img = ''
                            }
                        }
                    })
                    var dateForNoticeChat = 0
                    me.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/notice', option, function (data, key) {
                        if(data.message){
                            if (me.chatRoomList[0] == "Notice") {
                                me.noticeChatData.push(data)
                                var copyNoticeChatData = me.noticeChatData
                            } else {
                                me.noticeTmpChatData.push(data)
                            }
                            if(data.today){
                                if(dateForNoticeChat != data.today.Day){
                                    data.divider = true
                                    if(dateForNoticeChat == 0)
                                        me.lastChatData[0] = data
                                }
                                dateForNoticeChat = data.today.Day
                            }
                            
                            if(me.noticeChatLastKey == null)
                                me.noticeChatLastKey = data.key
                            if(me.noticeChatLastKey >= data.key){
                                beforeLoadNoticeChatCnt ++;
                                if(option.size == beforeLoadNoticeChatCnt)
                                    me.loadChatAll[0] = true
                                }
                            if(me.noticeChatLastKey < data.key){
                                afterLoadNoticeChatCnt++;
                                if(afterLoadNoticeChatCnt > 6){
                                    copyNoticeChatData.splice(0,1)
                                    me.loadChatAll[0] = true
                                    me.noticeChatData = copyNoticeChatData

                                }
                            }
                            if (data.userId != localStorage.getItem('email') && (me.noticeChatLastKey < data.key)) {
                                me.newMessage = true
                                me.newMessageCnt ++;
                                me.$EventBus.$emit("newMessageCnt", [me.newMessageCnt, me.chatBellOff])
                                me.snackBar.UserName = data.userName
                                me.snackBar.ChatRoom = "Notice"
                                me.snackBar.show = true
                                if (data.image) {
                                    me.snackBar.Message = ''
                                    me.snackBar.Img = data.image
                                } else {
                                    me.snackBar.Message = data.message;
                                    me.snackBar.Img = ''
                                }
                            }
                        }
                        // if (data.instruction || data.url) {
                        //     if (data.key == me.lastIdInSnapshot) {
                        //         me.loadEnded = true;
                        //     }
                        //     if (me.loadEnded) {
                        //         if (data.url && (data.lab == me.labInfo.labId)) {
                        //             console.log("After load")
                        //             me.openView(data.url)
                        //             return;
                        //         }
                        //     }
                        //     return;
                        // }
                        
                    })
                } catch(e){
                    alert(e.message)
                }
            },
            async getmoreChat(){
                var me = this
                try {
                    me.loadChat = true
                    if(me.chatRoom == 0)
                        var standardKey = me.noticeChatData[0].key
                    if(me.chatRoom == 1)
                        var standardKey = me.classChatData[0].key
                    if(me.chatRoom == 2)
                        var standardKey = me.groupChatData[0].key
                    var option = {
                        sort: "desc",
                        orderBy: null,
                        size: 8,
                        startAt: null,
                        endAt: standardKey,
                    }
                    var loadChatCnt = 0;
                
                    if(me.chatRoom == 0) {
                        var result = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/notice', option)
                    }
                    if(me.chatRoom == 1){
                        var result = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat`), option)
                        if(!result){
                            var result = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`classChat`), option)
                        }
                    }   
                    if(me.chatRoom == 2){
                        var result = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`chat/${me.myGroup}`), option)
                        if(!result){
                            var result = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`chat/${me.myGroup}`), option)
                        }
                    }
                    result.forEach(function(value, index){
                        var obj = value
                        if(obj && index != 0){
                            if(obj.today && me.lastChatData[me.chatRoom]){
                                if(obj.today.Day == me.lastChatData[me.chatRoom].today.Day){
                                    me.lastChatData[me.chatRoom].divider = false
                                }
                                    
                                obj.divider = true
                                me.lastChatData[me.chatRoom] = obj
                            }
                            
                            loadChatCnt ++;
                            // obj.key = key
                            if(me.chatRoom == 0){
                                me.noticeChatData.splice(0,0,obj)
                            }
                            if(me.chatRoom == 1){
                                me.classChatData.splice(0,0,obj)
                            }
                            if(me.chatRoom == 2){
                                me.groupChatData.splice(0,0,obj)
                            }
                        }

                    })                   
                    if(option.size - 1 > loadChatCnt){
                        me.loadChatAll[me.chatRoom] = false
                        if(me.chatRoom == 0)   
                            me.noticeChatData[0].divider = true
                        if(me.chatRoom == 1)
                            me.classChatData[0].divider = true
                        if(me.chatRoom == 2)
                            me.groupChatData[0].divider = true
                    }                
                } catch (e) {
                    console.log(e.message)
                } finally {
                    me.loadChat = false
                }
            },
            async init() {
                var me = this
                // 전체 채팅 목록 가지고 옴.
                try {
                    var clazz = me.classId;
                    var clazzName = clazz.split('@')[1];

                    var classChatdata = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat`));
                    if(!classChatdata){
                        var classChatdata = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`classChat`));
                    }
                    if (classChatdata) {
                        var classKeys = Object.keys(classChatdata);
                        // me.classChatdata = Object.keys(classChatdata).map((key) => classChatdata[key]);

                        classKeys.forEach(function (key) {
                            var classItem = classChatdata[key]
                            me.classChatLastKey = key
                        })

                    }
                    this.chat = eval("this." + this.chatRoomList[this.chatRoom].toLowerCase() + "ChatData")
                    // this.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat`), function (data, key) {
                        // if (me.chatRoomList[me.chatRoom] == "Class") {
                        //     me.classChatData.push(data)
                        // } else {
                        //     me.classTmpChatData.push(data)
                        // }
                        // if (data.userId != localStorage.getItem('email') && (!me.classChatLastKey || me.classChatLastKey < key)) {
                        //         me.newMessage = true
                        //         me.snackBar.UserName = data.userName
                        //         me.snackBar.ChatRoom = "Class"
                        //         me.snackBar.show = true
                        //         if (data.image) {
                        //             me.snackBar.Message = ''
                        //             me.snackBar.Img = data.image
                        //         } else {
                        //             me.snackBar.Message = data.message;
                        //             me.snackBar.Img = ''
                        //         }
                        // }
                    // })
                    this.classInfo = await this.getClassInfo();

                    var enrolledUserList = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers`))
                    if(!enrolledUserList){
                        enrolledUserList = await me.list('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`enrolledUsers`))
                    }
                    me.enrolledUserPhotodata = enrolledUserList
                    // openClass의 경우에는 Firebase에서만
                    var groupedUsers = {}
                    // 조 파악
                    Object.keys(enrolledUserList).forEach(function (key) {
                        if (!enrolledUserList[key].email) {
                            if (enrolledUserList[key].users) {
                                enrolledUserList[key].users.forEach(function (user) {
                                    var hashName = me.hashCode(user)
                                    enrolledUserList[hashName] = user
                                })
                            }
                        } else {
                            if (!enrolledUserList[key].group) {
                                enrolledUserList[key].group = '미배정'
                            }
                            if (Object.keys(groupedUsers).indexOf(enrolledUserList[key].group) == -1) {
                                groupedUsers[enrolledUserList[key].group] = {
                                    users: []
                                }
                            }
                            groupedUsers[enrolledUserList[key].group].users.push(enrolledUserList[key])
                        }
                    })
                    this.classInfo["groupedUsers"] = groupedUsers
                    this.classInfo["enrolledUsersList"] = enrolledUserList

                    await me.putObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`enrolledUsers`), enrolledUserList)


                    var group = me.myGroup;
                    var groupChatData = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`chat/${me.myGroup}`));
                    if(!groupChatData){
                        var groupChatData = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getOldClassPath(`chat/${me.myGroup}`));
                    }
                    if (groupChatData) {
                        var groupKeys = Object.keys(groupChatData);
                        // me.groupChatData = Object.keys(groupChatData).map((key) => groupChatData[key]);

                        groupKeys.forEach(function (key) {
                            var groupItem = groupChatData[key]
                            me.groupChatLastKey = key
                        })
                    } 
                    // this.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`chat/${me.myGroup}`), function (data, key) {
                    //     data.message = data.message.replaceAll("\n", "<br>")
                    //     if (me.chatRoomList[me.chatRoom] == "Group") {
                    //         me.groupChatData.push(data)
                    //     } else {
                    //         me.groupTmpChatData.push(data)
                    //     }
                    //     if (data.userId != localStorage.getItem('email') && (!me.groupChatLastKey || me.groupChatLastKey < key)) {
                    //         if (me.chatStatus == false) {
                    //             me.newMessage = true
                    //             me.snackBar.UserName = data.userName
                    //             me.snackBar.ChatRoom = "Group"
                    //             me.snackBar.show = true
                    //             if (data.image) {
                    //                 me.snackBar.Message = ''
                    //                 me.snackBar.Img = data.image
                    //             } else {
                    //                 me.snackBar.Message = data.message;
                    //                 me.snackBar.Img = ''
                    //             }
                    //         }
                    //     }
                    // })
                        
                    var noticeChatData = await this.getObject('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/notice');
                    if (noticeChatData) {
                        var noticeKeys = Object.keys(noticeChatData);
                        me.lastIdInSnapshot = noticeKeys[noticeKeys.length - 1];
                        noticeKeys.forEach(function (key) {
                            var noticeItem = noticeChatData[key]
                            me.noticeChatLastKey = key
                            
                        })

                    }
                    // this.watch_added('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/notice', function (data, key) {
                    //     if (me.chatRoomList[me.chatRoom] == "Notice") {
                    //         me.noticeChatData.push(data)
                    //     } else {
                    //         me.noticeTmpChatData.push(data)
                    //     }

                    //     if (data.userId != localStorage.getItem('email') && (!me.noticeChatLastKey || me.noticeChatLastKey < key)) {
                    //         if (me.chatStatus == false) {
                    //             me.newMessage = true
                    //             me.snackBar.UserName = data.userName
                    //             me.snackBar.ChatRoom = "Notice"
                    //             me.snackBar.show = true
                    //             if (data.image) {
                    //                 me.snackBar.Message = ''
                    //                 me.snackBar.Img = data.image
                    //             } else {
                    //                 me.snackBar.Message = data.message;
                    //                 me.snackBar.Img = ''
                    //             }
                    //         }

                    //     }
                    //     if (data.instruction || data.url) {
                    //         if (key == me.lastIdInSnapshot) {
                    //             me.loadEnded = true;
                    //         }
                    //         if (me.loadEnded) {
                    //             if (data.url && (data.lab == me.labInfo.labId)) {
                    //                 console.log("After load")
                    //                 me.openView(data.url)
                    //                 return;
                    //             }
                    //         }
                    //         return;
                    //     }

                    // })
                    me.$http.get("https://raw.githubusercontent.com/wiki/theopencloudengine/msaschool/List.md").then(function (result) {
                        me.answerList = result.data
                    })
                } catch(e){
                    alert(e.message)
                }
            },
            closeView(url) {
                window.ipcRenderer.send("closeView");
                this.$EventBus.$emit("urlUpdate", url)
            },
            openView(url) {
                var me = this
                try {
                    this.$EventBus.$emit("urlUpdate", url)
                    if(window.ipcRenderer){
                        window.ipcRenderer.send("closeView");
                        var width = $(".v-navigation-drawer") ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                        var height = $(".v-main").height()
                        window.ipcRenderer.send("view", {
                            "url": url,
                            "authorized": me.classInfo.teacherId == me.myId ? "admin" : "student",
                            x: $(".v-navigation-drawer") ? $(".v-navigation-drawer").width() : 0,
                            y: $(".v-toolbar").height(),
                            width: width,
                            height: height
                        })
                        var width = $(".v-navigation-drawer--is-mobile").width() ? $(".v-main").width() - $(".v-navigation-drawer").width() : $(".v-main").width()
                        var height = $(".v-main").height()
                        window.ipcRenderer.send("resizeView", {
                            x: $(".v-navigation-drawer").width(),
                            y: $(".v-toolbar").height(),
                            width: width,
                            height: height
                        })
                    }
                } catch(e){
                    console.log(e.message)
                }
            },
            async postChatMessage(auto, autoMessage) {
                var me = this
                try {
                    const today = new Date();
                    const day = today.getDate();
                    const year = today.getFullYear();
                    const month = today.getMonth() + 1;

                    var date = new Date();
                    var id = me.makeChatID();

                    if (auto) {
                        var message = {
                            userId: "help@uengine.org",
                            userName: "Help",
                            message: me.autoReplyList[autoMessage],
                            replyClass: me.autoReply.class,
                            replyMessage: me.autoReply.message,
                            replyUserName: me.autoReply.userName,
                            replyUserEmail: me.autoReply.userId,
                            image: "https://user-images.githubusercontent.com/110078419/226229949-f89a201d-502d-4abf-b83e-1d20b8ae27e6.jpg",
                            timeStamp: date.toTimeString().split(" ")[0],
                            isTyping: false,
                            id: id,
                            today: {
                                Day: day,
                                Year: year,
                                Month: month
                            }, 
                        }
                        me.lastMessageTimeStamp = message.timeStamp
                        me.pushString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat`), message);
                        me.autoReply = null;
                    } else {
                        var textMessage = this.message;
                        textMessage = this.replaceLast("\n", "", textMessage);
                        if (textMessage) {
                            // console.log(textMessage.replace(/\n|\r/gi, "").length);//행바꿈제거
                            if (textMessage.replace(/\n|\r/gi, "").length == 0) {
                                this.message = "";
                                return;
                            }
                        }
                        if (this.chatRoom == 0) {
                            if (textMessage.length >= 1 || this.tmpImage) {
                                if (me.reply)
                                    var message = {
                                        userId: me.connectUserId,
                                        userName: me.connectUserName,
                                        message: textMessage,
                                        // replyClass: me.reply.class,
                                        replyMessage: me.reply.message,
                                        replyUserName: me.reply.userName,
                                        replyUserEmail: me.reply.userId,
                                        image: this.tmpImage,
                                        timeStamp: date.toTimeString().split(" ")[0],
                                        id: id,
                                        today: {
                                            Day: day,
                                            Year: year,
                                            Month: month
                                        },
                                    }
                                else
                                    var message = {
                                        userId: me.connectUserId,
                                        userName: me.connectUserName,
                                        message: textMessage,
                                        image: this.tmpImage,
                                        timeStamp: date.toTimeString().split(" ")[0],
                                        id: id,
                                        today: {
                                            Day: day,
                                            Year: year,
                                            Month: month
                                        }, 
                                    }
                                this.pushString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.courseId + '/notice', message);
                                this.message = "";
                                this.reply = null
                                this.message = this.message.replace("\n");
                            }
                        } else {
                            if (textMessage.length >= 1 || this.tmpImage) {
                                var date = new Date();
                                if (me.reply){
                                    if(!me.reply.image)
                                        me.reply.image = null
                                    var message = {
                                        userId: me.connectUserId,
                                        userName: me.connectUserName,
                                        message: textMessage,
                                        // replyClass: me.reply.class,
                                        replyMessage: me.reply.message,
                                        replyUserName: me.reply.userName,
                                        replyUserEmail: me.reply.userId,
                                        replyImage: me.reply.image,
                                        timeStamp: date.toTimeString().split(" ")[0],
                                        id: me.makeChatID(),
                                        today: {
                                            Day: day,
                                            Year: year,
                                            Month: month
                                        },
                                    }
                                }
                                else if (me.selectedUser)
                                    var message = {
                                        userId: me.connectUserId,
                                        userName: me.connectUserName,
                                        message: textMessage,
                                        classroomMessage: textMessage,
                                        replyUserEmail: me.selectedUser.email,
                                        replyUserName: me.selectedUser.userName,
                                        timeStamp: date.toTimeString().split(" ")[0],
                                        today: {
                                            Day: day,
                                            Year: year,
                                            Month: month
                                        },

                                    }
                                else
                                    var message = {
                                        userId: me.connectUserId,
                                        userName: me.connectUserName,
                                        message: textMessage,
                                        image: this.tmpImage,
                                        timeStamp: date.toTimeString().split(" ")[0],
                                        id: me.makeChatID(),
                                        today: {
                                            Day: day,
                                            Year: year,
                                            Month: month
                                        },
                                    }
                                if (me.chatRoomList[me.chatRoom] == "Class") {
                                    this.pushString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`classChat`), message);
                                } else if (me.chatRoomList[me.chatRoom] == "Group") {
                                    this.pushString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`chat/${me.myGroup}`), message);
                                }

                                me.$http.post(`${window.location.origin}/inference`, {"errors": textMessage}, {
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                                }).then(function (result) {
                                    if (result.data != -1) {
                                        // console.log(result.data, me.answerMenuList)
                                        me.answerMenuList.forEach(function (answer) {
                                            if (result.data == answer.errName) {
                                                me.autoAnswer(answer.route, message)
                                            }
                                        })
                                    }
                                });
                                if (me.chatRoomList[me.chatRoom] == "Class"){
                                    const data = {
                                        model: 'davinci:ft-personal-2023-03-24-07-35-47',
                                        prompt: me.message+'.'+' \n\n###\n\n',
                                        logprobs: 3,
                                        temperature: 0,
                                        max_tokens: 1,
                                        n: 1,
                                        stop: ['.', '#', ')', ',']
                                    };  
    
                                    
                                    const token = await me.getToken();
                                    const headers = {
                                        "Content-Type": "application/json",
                                        "Authorization": 'Bearer ' + token
                                    };
    
    
                                    axios.post("https://api.openai.com/v1/completions", data, { headers })                      
                                        .then((response) => {
                                            // console.log(response.data.choices[0].text);
                                            if(response && response.data.choices[0].text) {
                                                this.beforeAutoReply(message);
                                                me.postChatMessage(true, response.data.choices[0].text)
                                            }                                           
                                        })
                                        .catch(error =>{
                                    });
                                }

                                if (this.tmpImage) {
                                    var classRoomMessage = {
                                        email: me.connectUserId,
                                        message: "picture",
                                        id: me.makeChatID()
                                    }
                                    this.delete('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/clear`))
                                    setTimeout(() => {
                                        this.putString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/${me.connectUserId.replace(/\./gi, '_')}`), classRoomMessage);
                                    }, 500);
                                } else {
                                    var classRoomMessage = {
                                        email: me.connectUserId,
                                        message: "chat",
                                        id: me.makeChatID()
                                    }
                                    this.delete('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/clear`))
                                    setTimeout(() => {
                                        this.putString('db://labs/' + me.getTenantId().split('.')[0] + '/' + me.getClassPath(`messages/${me.connectUserId.replace(/\./gi, '_')}`), classRoomMessage);
                                    }, 500);
                                }
                                this.tmpImage = null;
                                this.capturing = false
                                this.reply = null;
                            }
                        }
                        // this.message = null;
                        this.message = "";
                        /** test logic
                         * Chat inference Post
                         * **/
                    }
                    this.$nextTick(function () {
                        me.scrollToEnd();
                        this.message = this.message.replace(/\n|\r/g, "");//행바꿈제거
                    })

                } catch(e){
                    alert(e.message)
                }
            },
            async screenCapture() {
                var me = this
                await me.$EventBus.$emit("closeClassroom", true)
                sessionStorage.setItem("wideScreenMode", 'false')
                me.$EventBus.$emit('wideScreenMode')
                me.$EventBus.$emit('unselectUser')
                me.isCapture = true
                me.capturing = true
                try {
                    if (this.labInfo.tool == 'ide') {
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
                                    me.tmpImage = 'ide'
                                    body.contentWindow.postMessage({
                                        message: 'captured'
                                    }, "*")
                                }
                            }
                        })
                    } else if (this.labInfo.tool == 'event-storming' || this.labInfo.tool == 'kuber-ez' || this.labInfo.tool == 'business-model-canvas') {
                        await html2canvas(document.querySelector(".canvas-panel")).then(function (canvas) {
                            var data = canvas.toDataURL();
                            me.tmpImage = data
                        });
                    } else if (window.ipcRenderer) {
                        await window.ipcRenderer.on("capture", function (event, img) {
                            if(img.diff){
                                me.tmpImage = img.diff;
                            } else me.tmpImage = img;
                        })
                        await window.ipcRenderer.send("capture")
                    }
                    if(!me.tmpImage || me.tmpImage == 'data:,'){
                        if(me.screenCaptureRetryCnt < 2){
                            me.screenCaptureRetryCnt++;
                            me.screenCapture()
                            return false;
                        } else {
                            me.screenCaptureRetryCnt = 0
                            alert('이미지 캡처에 실패하였습니다. 잠시후 다시 시도하세요.');
                        }
                    }
                } catch (e) {
                    console.log(e.message)
                } finally {
                    me.isCapture = false
                }


            },
            onResize() {
                this.windowHeight = window.innerHeight
            },
            chatImg(imgSrc) {
                this.chatImage = imgSrc;
                this.chatImgDialog = true;
                // window.ipcRenderer.send("hideView");
            },
            removeChatImg() {
                this.chatImage = null
            },
            async changeRoom() {
                var me = this
                try {
                    // if (me.postNotice) {
                    //     me.checkNoticeStatus()
                    // }
                    if (eval("me." + me.chatRoomList[me.chatRoom].toLowerCase() + "ChatData.length") >= 1) {
                        var tmp = eval("JSON.parse(JSON.stringify(me." + me.chatRoomList[me.chatRoom].toLowerCase() + "ChatData)).concat(me." + me.chatRoomList[me.chatRoom].toLowerCase() + "TmpChatData)");
                        eval("me." + me.chatRoomList[me.chatRoom].toLowerCase() + "ChatData = tmp");
                        eval("me." + me.chatRoomList[me.chatRoom].toLowerCase() + "TmpChatData = []");
                    } else {
                        var tmp = eval("me." + me.chatRoomList[me.chatRoom].toLowerCase() + "TmpChatData")
                        eval("me." + me.chatRoomList[me.chatRoom].toLowerCase() + "ChatData = tmp");
                        eval("me." + me.chatRoomList[me.chatRoom].toLowerCase() + "TmpChatData = []")
                    }
                    var tmp;
                    this.chat = tmp
                    this.$nextTick(function () {
                        me.scrollToEnd();
                    })
                } catch(e){
                    alert(e.message)
                }
                
            },
            unReadMessage(n) {
                return eval("this." + n.toLowerCase() + "TmpChatData.length")
            },
            scrollToEnd: function () {
                var container = this.$el.querySelector(".chatBlock");
                setTimeout(() => {
                    container.scrollTop = container.scrollHeight;
                }, 300);
            },
            beforeAutoReply(item) {
                this.autoReply = {class: item.id, message: item.message, userName: item.userName, userId: item.userId}
            },
            beforeReply(item) {
                this.reply = {class: item.id, message: item.message, userName: item.userName, userId: item.userId, image: item.image}

            },
            replaceLast(find, replace, string) {

                var lastIndex = string.lastIndexOf(find);

                if (lastIndex === -1) {
                    return string;
                }

                var beginString = string.substring(0, lastIndex);
                var endString = string.substring(lastIndex + find.length);

                return beginString + replace + endString;
            },
            makeChatID() {
                return 'chat' + Math.random().toString(36).substr(2, 9);
            },
            lineBreak() {
                this.message = this.message + '\n'
            },
            viewMessage(replyClass) {
                // Get the first element with the given class name
                let el = this.$el.querySelector("." + replyClass)
                // Get the bounding rectangle so we can get the element position position
                let rect = el.getBoundingClientRect()
                // Scroll to the element (using x and y axis)
                var container = this.$el.querySelector(".chatBlock");
                container.scrollTo(rect.left, el.offsetTop - 50);
            },
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            contextOpen(event, item) {
                this.$refs.menu.open(event);
                this.tmpItem = item;
            },
            onOpen(event, data, top, left) {
                // console.log('The context menu was opened');
                // console.log(event, data, top, left);
            },
            onClick(text) {
                var me = this
                if (text == "답장") {
                    me.beforeReply(me.tmpItem)
                } else if (text == "랩실 보기") {
                    me.openLab(me.tmpItem)
                } else if (text == "복사") {
                    me.copytext(me.tmpItem)
                }
            },
            // copytext(item){
            //     document.execCommand('copy', item.classroomMessage)
            // },
            copytext(item) {
                let testingCodeToCopy = document.querySelector('#testing-code')
                testingCodeToCopy.setAttribute('type', 'text')
                testingCodeToCopy.select()
                try {
                    var successful = document.execCommand('copy');
                    var msg = successful ? 'successful' : 'unsuccessful';
                    alert('Testing code was copied ' + msg);
                } catch (err) {
                    alert('Oops, unable to copy');
                }
                testingCodeToCopy.setAttribute('type', 'hidden')
                window.getSelection().removeAllRanges()
            },
            openLab(item) {
                window.open('/#/courses/' + this.courseId + '/' + this.classId + '/' + this.labId + '/' + item.userId, "_blank");
            },
            windowHeight() {
                return window.innerHeight
            },
            clickAnswer(route) {
                var me = this;
                // https://raw.githubusercontent.com/wiki/theopencloudengine/msaschool/Home.md
                this.beforeReply(me.tmpItem);
                var link = `https://github.com/TheOpenCloudEngine/msaschool/wiki/${route.replace(/ /gi, "-")}`

                this.message = `해당 오류는 <a href="${link}" target="_blank">${link}</a> 로 접속하여 가이드 확인 부탁드립니다.`
                this.postChatMessage();
            },
            autoAnswer(route, tmpItem) {
                var me = this;
                // https://raw.githubusercontent.com/wiki/theopencloudengine/msaschool/Home.md
                this.beforeAutoReply(tmpItem);
                var link = `https://github.com/TheOpenCloudEngine/msaschool/wiki/${route.replace(/ /gi, "-")}`

                var message = `해당 오류는 <a href="${link}" target="_blank">${link}</a> 로 접속하여 가이드 확인 부탁드립니다.`

                this.postChatMessage(true, message);
            },
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onResize);
        },
        computed: {
            filteredChat() {
                var me = this
                try {
                    if(!this.loadEnded){
                        this.chat = eval("this." + this.chatRoomList[this.chatRoom].toLowerCase() + "ChatData")
                        // console.log(this.chat, this.loadEnded)
                    }
                    return me.chat.filter((element) => {
                        if (me.selectedUser && me.chatRoomList[me.chatRoom] == "Class") {
                            if (me.selectedUser.email == element.userId)
                                return element
                            else if (me.selectedUser.email == element.replyUserEmail)
                                return element
                        } else
                            return element
                    });
                } catch(e){
                    alert(e.message)
                }
                
            },
            connectUserName() {
                return localStorage.getItem("userName");
            },
            answerMenuList() {
                var result = [];
                var me = this;

                var answerList = me.answerList.split("\n---\n");
                answerList.forEach(function (answer) {
                    var tmpAnswer = {};
                    var answerSplit = answer.split("\n");

                    answerSplit.forEach(function (item) {
                        var splitItem = item.split(": ");
                        var key = splitItem[0];
                        var value = splitItem[1];
                        tmpAnswer[key] = value;
                    })
                    result.push(tmpAnswer);
                })

                return result
            },
            connectUserId() {
                return localStorage.getItem("email");
            },
            myGroup() {
                var me = this
                var result;
                Object.keys(me.classInfo.enrolledUsersList).forEach(function (id) {
                    if (me.classInfo.enrolledUsersList[id].email == localStorage.getItem('email')) {
                        result = me.classInfo.enrolledUsersList[id].group
                    }
                })
                return result
            },
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