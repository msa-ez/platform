<template></template>
<script>
    import firebase from 'firebase'
    import CommonStorageBase from '../CommonStorageBase.vue'
    require('firebase/auth')
    export default {
        mixins: [CommonStorageBase],
        async created() {
            var me = this;

            const provider = new firebase.auth.OAuthProvider("oidc.dpg");
            let user = undefined;
            const redirectResult = await firebase.auth().getRedirectResult().then(function(result) {
                if(result.user == null) {
                    firebase.auth().signInWithRedirect(provider);
                }
                var token = result.credential.accessToken;
                var uid = result.user.uid;
                var userName = result.additionalUserInfo.username
                var userEmail = result.user.providerData[0].email
                var userProfile = result.additionalUserInfo.profile.avatar_url;
                var state = result.operationType;

                window.localStorage.setItem("author", userEmail)
                window.localStorage.setItem("userName", userName)
                window.localStorage.setItem("email", userEmail)
                window.localStorage.setItem("picture", userProfile)
                window.localStorage.setItem("accessToken", token)
                window.localStorage.setItem("gitAccessToken", token)
                window.localStorage.setItem("gitToken", token)
                window.localStorage.setItem("uid", uid)
                window.localStorage.setItem("loginType", "dpg")
                window.localStorage.setItem("gitUserName", userName)
                window.localStorage.setItem("gitOrgName", userName)
                if (userEmail && userEmail.includes('@uengine.org')) {
                    window.localStorage.setItem("authorized", 'admin');
                } else {
                    window.localStorage.setItem("authorized", 'student');
                }

                app.loginDialog = false
                me.$EventBus.$emit('login', token)
                // me.$emit('login')
                // me.$emit('isGitLogin')
                //firebase DB input
                me.writeUserData(uid, userName, userEmail, userProfile, 'dpg')
                me.$router.push("/")
                if(me.$gtag){
                    me.$gtag.event('login', {method: 'dpg'})
                }
            })
        },
        methods: {
            writeUserData(userId, name, email, imageUrl, provider) {
                // var database = firebase.database();
                var authorized = 'admin';
                if (email.includes('@uengine.org')) {
                    authorized = 'admin'
                } else {
                    authorized = 'student'
                }

                var obj = {
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    provider: provider,
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
        }
    };
</script>
