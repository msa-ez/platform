<template>
    
</template>

<script>
    // import jwt_decode from "jwt-decode";
    import Git from "../../utils/GitAPI"
    import Gitlab from "../../utils/Gitlab"
    import Github from "../../utils/Github"
    import CommonStorageBase from "../CommonStorageBase"

    export default {
        name: "GitlabRedirectPage",
        mixins: [CommonStorageBase],
        mounted: async function() {
            var me = this;
            // console.log("GitlabRedirectPage");
            const callbackResult = window.location.search.match(/[?&]result=(.*?)(?:&|$)/)[1]; // Or some other way you'd get the ?result from the url
            window.$acebase.auth.finishAuthProviderSignIn(callbackResult)
            .then(async result => {
                console.log(`Signed in with ${result.provider.name}`);
                let git;
                
                if(result.provider.name == 'github') {
                    git = new Git(new Github())
                    window.localStorage.setItem(
                            "gitToken",
                            result.provider.access_token
                        );
                    // let origin = window.GITLAB ? window.GITLAB : window.location.hostname.replace("www.", "");
                    var getUsers = await git.getUserInfo()
                    .then(function (res) {
                        console.log(result)
                        let email = res.email ? res.email : res.login
                        window.localStorage.setItem("gitAuthor",email);
                        window.localStorage.setItem("gitUserName", res.login);
                        window.localStorage.setItem("gitEmail",email);
                        window.localStorage.setItem("author",email)
                        window.localStorage.setItem("userName", res.login)
                        window.localStorage.setItem("email",email)
                        window.localStorage.setItem("picture", res.avatar_url)
                        window.localStorage.setItem("accessToken", result.accessToken)
                        window.localStorage.setItem("uid", result.user.uid)
                        window.localStorage.setItem("providerUid", res.id)
                        if (result.user.email && result.user.email.includes('@uengine.org')) {
                            window.localStorage.setItem("authorized", 'admin');
                        } else {
                            window.localStorage.setItem("authorized", 'student');
                        }
                        me.writeUserData(result.user.uid, res.login, email, res.avatar_url)
                        me.$EventBus.$emit('login', result.accessToken)
                        me.$emit('close')
                        window.location.replace(window.location.origin)
                    })
                    .catch(e => console.log(e));
                } else if (result.provider.name == 'gitlab') {
                    git = new Git(new Gitlab())
                    window.localStorage.setItem("gitAuthor", result.user.email);
                    window.localStorage.setItem("gitUserName", result.user.displayName);
                    window.localStorage.setItem("gitEmail", result.user.email);
                    window.localStorage.setItem(
                        "gitToken",
                        result.provider.access_token
                    );
                    
                    window.localStorage.setItem("author", result.user.email)
                    window.localStorage.setItem("userName", result.user.displayName)
                    window.localStorage.setItem("email", result.user.email)
                    window.localStorage.setItem("picture", result.user.picture)
                    window.localStorage.setItem("accessToken", result.accessToken)
                    window.localStorage.setItem("uid", result.user.uid)
                    if (result.user.email && result.user.email.includes('@uengine.org')) {
                        window.localStorage.setItem("authorized", 'admin');
                    } else {
                        window.localStorage.setItem("authorized", 'student');
                    }
                    me.writeUserData(result.user.uid, result.user.displayName, result.user.email, result.user.picture)
                    let origin = window.GITLAB ? window.GITLAB : window.location.hostname.replace("www.", "");
                    var getUsers = await git.getUserInfo()
                    .then(function (res) {
                        console.log(res)
                        me.$EventBus.$emit('login', result.accessToken)
                        me.$emit('close')
                        window.location.replace(window.location.origin)
                    })
                    .catch(e => console.log(e));
                }
            })
        },
        methods: {
            async postMessage(getUsers) {
                return new Promise(function (resolve) {
                    window.localStorage.setItem("gitAuthor", getUsers.data.email);
                    window.localStorage.setItem(
                        "gitUserName",
                        getUsers.data.username
                    );
                    window.localStorage.setItem("gitEmail", getUsers.data.email);
                    window.localStorage.setItem(
                        "gitToken",
                        getUsers.data.accessToken
                    );
                    window.opener.postMessage({message: "gitlab-login", data: JSON.parse(JSON.stringify(getUsers))},"*");
                    resolve();
                })
            },
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
        // mounted() {
        //     window.href = window.location.host
        // }
    }
</script>

<style scoped>

</style>