<!-- <template>
    <v-card class="elevation-12"
            v-if="standard"
            style="background: #FFFFFF;
                    min-width:300px;
                    max-width:300px;
                    height:130px;
                    position:absolute;
                    display:block;
                    left:50%;
                    top:50%;
                    margin:-175px 0 0 -150px;"
    >
    <v-btn block small height="80px" @click="signInAcebase()">
            <img id="git-hover"
                width="30px"
                
                alt="Github sign-in"
                src="/static/image/gitlab-logo-500.png"/>
            <div style="">sign in with github</div>
        </v-btn>
        <div style="width:290px; margin-left:5px; text-align:center; font-size: small; color:#BDBDBD; margin-top:5px;">
            Please ensure 3rd party cookies are enabled if<br> login fails.
        </div>
    </v-card>
</template>

<script>
    import CommonStorageBase from "../CommonStorageBase";
    export default {
        components: {},
        props: {
            loginMsg: {
                type: String,
                default: function () {
                    return null
                }
            }
        },
        mixins: [CommonStorageBase],
        data: () => ({
            tab: 'main',
            tenantLogo: null,
            drawer: null,
            guest: false,
            standard: false,
            onlyConnectionKey: false,
            guestUserInfo: {
                name: '',
                email: ''
            },
            connectionKey: '',
            userImage: null,
            isConnectionkey: false,
            authorized: null,
            rules: {
                required: value => !!value || 'Required.',
                min: v => v.length >= 8 || 'Min 8 characters',
                emailMatch: v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
                emailRequired: v => !!v || 'E-mail is required',
            },
            passwordShow: false,
            userInfo: {
                email: "",
                password: "",
                username: ""
            },
            loginText: '',
        }),
        watch: {
            "userImage": {
                handler(newVal) {
                    console.log(newVal)
                    var me = this
                    localStorage.setItem("picture", me.userIcon(newVal))
                }
            }
        },
        async created() {
            var me = this
            if (localStorage.getItem('authorized')) {
                me.authorized = true
            } else {
                me.authorized = false
            }
        },
        methods: {
            async signIn() {
                var me = this
                try {
                    var result = await me.signIn('db://login', me.userInfo);
                    if(result){
                        window.localStorage.setItem("author", result.user.email)
                        window.localStorage.setItem("userName", result.user.username)
                        window.localStorage.setItem("email", result.user.email)
                        window.localStorage.setItem("picture", result.user.picture)
                        window.localStorage.setItem("accessToken", result.accessToken)
                        window.localStorage.setItem("uid", result.user.uid)
                        if (result.user.email && result.user.email.includes('@uengine.org')) {
                            window.localStorage.setItem("authorized", 'admin');
                        } else {
                            window.localStorage.setItem("authorized", 'student');
                        }
                        me.writeUserData(result.user.uid, result.user.username, result.user.email, result.user.picture)
                        me.$EventBus.$emit('login', result.accessToken)
                        me.$emit('login')
                        me.$emit('close')
                    }
                } catch (e) {
                    if(e.code == 'not_found'){
                        me.loginText = `로그인 실패: 존재하지 않은 계정입니다. ${e}`
                    }else{
                        me.loginText = `로그인 실패: 로그인 정보를 확인해주세요. ${e}`
                    }
                }
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            async signUpAcebase() {
                var me = this
                try {
                    // var app = this.getComponent('App')
                    if(me.userInfo.email && me.userInfo.password && me.userInfo.username){
                        var result = await me.signUp('db://login', me.userInfo);
                        // alert("SignUp Success !")
                        if(result){
                            window.localStorage.setItem("author", result.user.email)
                            window.localStorage.setItem("userName", result.user.username)
                            window.localStorage.setItem("email", result.user.email)
                            window.localStorage.setItem("picture", result.user.picture)
                            window.localStorage.setItem("accessToken", result.accessToken)
                            window.localStorage.setItem("uid", result.user.uid)
                            if (result.user.email && result.user.email.includes('@uengine.org')) {
                                window.localStorage.setItem("authorized", 'admin');
                            } else {
                                window.localStorage.setItem("authorized", 'student');
                            }
                            me.writeUserData(result.user.uid, result.user.username, result.user.email, result.user.picture)

                            me.$EventBus.$emit('login', result.accessToken)
                            me.$emit('login')
                            me.$emit('close')
                        }
                    }else{
                        me.loginText = '가입 실패: 가입 정보를 확인해주세요.'
                    }
                    // app.loginDialog = false
                } catch (e) {
                    if(e.code == "invalid_details") {
                        me.loginText = `가입 실패: 가입 정보를 확인해주세요. ${e}`
                    }else{
                        me.loginText = `가입 실패: 가입 정보를 확인해주세요. ${e}`
                    }
                    console.log(e)
                }
            },
            writeUserData(userId, name, email, imageUrl) {
                // var database = firebase.database();
                var authorized = 'student';


                var obj = {
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    authorized: authorized,
                    loginDate: Date.now()
                }
                var eObj = {
                    uid: userId,
                    userName: name,
                    profile_picture: imageUrl,
                    email: email,
                }

                this.putObject(`db://users/${userId}`, obj)
                //새로운 로그인 유저
                if (email) {
                    var convertEmail = email.replace(/\./gi, '_')
                    this.putObject(`db://enrolledUsers/${convertEmail}`, eObj)
                }

            },
        },

    }
</script>

<style>
    .loginDialog {
        position: relative;
        bottom: 5px;
        height: 30px;
        line-height: 30px;
        font-weight: 700;
        font-size: 20px;
        margin-top: -15px;
        margin-left: -200px;
        color: #424242;
    }

    .or-line, #or-text {
        float: left;
    }

    .or-line {
        margin-top: 12px;
    }

    .or-box {
        margin-top: -8px;
        margin-bottom: -10px;
    }

    .login-row {
        float: left;
    }

    .clearfix::after {
        content: "";
        display: block;
        clear: both;
    }
</style>


 -->
