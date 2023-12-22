<template></template>
<script>
    import firebase from 'firebase'
    import CommonStorageBase from '../CommonStorageBase.vue'
    require('firebase/auth')
    export default {
        mixins: [CommonStorageBase],
        async created() {
            var me = this;

            const provider = new firebase.auth.OAuthProvider("oidc.aifrica");
            // let id = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMamlpeERrU25qb2FGX2Q2N2FOR2txLTRFQnYtU3ZuU2FBaXI2Z04zLU9BIn0.eyJleHAiOjE2OTM4MTcyODksImlhdCI6MTY5MzgxNzIyOSwiYXV0aF90aW1lIjoxNjkzODExNjA0LCJqdGkiOiIwNjBlZjZhZC02MTA2LTQ1ZGEtOTFjNy1lNGI0YzBkMjVkZDQiLCJpc3MiOiJodHRwczovLzkwOTAtc2Vvbmd3b255YW4ta2V5Y2xvYWttdWwtNTlidG1zMW9tNTYud3MtdXMxMDQuZ2l0cG9kLmlvL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsiMTJzdG1hbGwiLCJtc2FleiJdLCJzdWIiOiIwZTRlYzZhNy1jMWYzLTRmNGMtOGYzYS1kZGE5M2FmZWY5M2EiLCJ0eXAiOiJJRCIsImF6cCI6IjEyc3RtYWxsIiwibm9uY2UiOiJiNzY5MmRmYS0zMjQ1LTQzNjYtYTZiNi1mZjMyZDZiNTg4N2IiLCJzZXNzaW9uX3N0YXRlIjoiMzk1MzBkNzctN2E0ZC00ZWRkLWFlN2YtY2IyZTY5MTZjYTM0IiwiYXRfaGFzaCI6IjgzdXZKN1lTa0xvcGR5a08tQUZiZ0EiLCJhY3IiOiIwIiwic2lkIjoiMzk1MzBkNzctN2E0ZC00ZWRkLWFlN2YtY2IyZTY5MTZjYTM0IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhZG1pbiJ9.e6Ksl_6adfTIR-DePeVKnEsQx2LmChK_kAKxbN7O0-6HYfm4sQ7eERqELm4oWRoKCUumLnhv3Xg1aWg2TVFL50oCos-i7mnjhBJSgt21WouKtp-Bz_PWtlSaYiqSAVUh7LLlAKJMFxoLrPtlxuMQTK2Keq0BdHz5wQFGG-T6qXfDLOQsc_3LMngOMQ7HKW-HFmRo9dX9afrrpgpRZh6w2mRENUSes2z9znJEbRIQZJxvxl-JIhogqdCFbb-x7wALg-UkDd6i2d4Y62wTrQS5w3VU1VlMJUJK31xjegRoPeNWJOQO3lIzLBxTk2q2HJYqNA2VPcTvaa8s4RpMypj0dA"
            // let access = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMamlpeERrU25qb2FGX2Q2N2FOR2txLTRFQnYtU3ZuU2FBaXI2Z04zLU9BIn0.eyJleHAiOjE2OTM4MTY2NzIsImlhdCI6MTY5MzgxNjYxMiwiYXV0aF90aW1lIjoxNjkzODExNjA0LCJqdGkiOiI1MjExNDMwZi05YzMyLTQzZWYtYmQ0NC1jMzVhOWUxODkzYTgiLCJpc3MiOiJodHRwczovLzkwOTAtc2Vvbmd3b255YW4ta2V5Y2xvYWttdWwtNTlidG1zMW9tNTYud3MtdXMxMDQuZ2l0cG9kLmlvL3JlYWxtcy9tYXN0ZXIiLCJhdWQiOlsibXNhZXoiLCJtYXN0ZXItcmVhbG0iLCJhY2NvdW50Il0sInN1YiI6IjBlNGVjNmE3LWMxZjMtNGY0Yy04ZjNhLWRkYTkzYWZlZjkzYSIsInR5cCI6IkJlYXJlciIsImF6cCI6IjEyc3RtYWxsIiwibm9uY2UiOiI4Zjg5MWVhNi1lMjg2LTQzNDgtOWUzOS1kM2RhOTFmZDAyZWUiLCJzZXNzaW9uX3N0YXRlIjoiMzk1MzBkNzctN2E0ZC00ZWRkLWFlN2YtY2IyZTY5MTZjYTM0IiwiYWNyIjoiMCIsImFsbG93ZWQtb3JpZ2lucyI6WyIqIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJjcmVhdGUtcmVhbG0iLCJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwiYWRtaW4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7Im1hc3Rlci1yZWFsbSI6eyJyb2xlcyI6WyJ2aWV3LWlkZW50aXR5LXByb3ZpZGVycyIsInZpZXctcmVhbG0iLCJtYW5hZ2UtaWRlbnRpdHktcHJvdmlkZXJzIiwiaW1wZXJzb25hdGlvbiIsImNyZWF0ZS1jbGllbnQiLCJtYW5hZ2UtdXNlcnMiLCJxdWVyeS1yZWFsbXMiLCJ2aWV3LWF1dGhvcml6YXRpb24iLCJxdWVyeS1jbGllbnRzIiwicXVlcnktdXNlcnMiLCJtYW5hZ2UtZXZlbnRzIiwibWFuYWdlLXJlYWxtIiwidmlldy1ldmVudHMiLCJ2aWV3LXVzZXJzIiwidmlldy1jbGllbnRzIiwibWFuYWdlLWF1dGhvcml6YXRpb24iLCJtYW5hZ2UtY2xpZW50cyIsInF1ZXJ5LWdyb3VwcyJdfSwiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCIsInNpZCI6IjM5NTMwZDc3LTdhNGQtNGVkZC1hZTdmLWNiMmU2OTE2Y2EzNCIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.ozac1MYr8Qb41I4DZd-3GvGi8AbAQgr-xyUTd98toMwNhqzOkiEIBaiOTPUEbJWlvK7htFXOoc32ZS0rmbqrnqFu1XabHkl35cgi2cM2DBgP_45FDePrnW2J79De2Tn3ObrIMyMPNXNBbC8nNgLb2VIRh04JcvIwksnXSDt_Udm55sRY62lbnmeCd9p53ckgayyDU6uXeJQHEPQb5D0T1mjz2VJQk8gpeyxjQi79Wy1v-bWzj-E4baZkz7ZYGT7RcL5FbUNSeVWATp_3hcLMQkxYFUaQpJWGlYKfdo4Nl7hSbTVsfuTkWA-JzDqIoMbOdVrqV_7Konvb9J0Q-EXr1Q"
            // var decoded = jwt_decode(id);
            // let nonce = crypto.randomBytes(16).toString('base64');
            // const hashedNonceHex = crypto.createHash('sha256').update(decoded.nonce).digest().toString('hex');
            // const credential = provider.credential({idToken: id, rawNonce: hashedNonceHex});
            // console.log(decoded)
            // console.log(provider)
            // console.log(provider.providerId)
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
                me.$gtag.event('login', {method: 'dpg'})
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
