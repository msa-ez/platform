<template>
    
</template>

<script>
    // import jwt_decode from "jwt-decode";
    import Git from "../../utils/GitAPI"
    import Gitlab from "../../utils/Gitlab"
    export default {
        name: "GitlabRedirectPage",
        mounted: async function() {
            var me = this;
            // console.log("GitlabRedirectPage");
            let git = new Git(new Gitlab())
            const callbackResult = window.location.search.match(/[?&]result=(.*?)(?:&|$)/)[1]; // Or some other way you'd get the ?result from the url
            window.$acebase.auth.finishAuthProviderSignIn(callbackResult)
            .then(async result => {
                console.log(result)
                console.log(`User ${result.user.email} signed in with ${result.provider.name}`);
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
                // me.writeUserData(result.user.uid, result.user.displayName, result.user.email, result.user.picture)
                let origin = window.GITLAB ? window.GITLAB : window.location.hostname.replace("www.", "");
                var getUsers = await git.getUserInfo(`https://gitlab.${origin}/api/v4/user`)
                .then(function (res) {
                    console.log(res)
                    me.$EventBus.$emit('login', result.accessToken)
                    me.$emit('close')
                    window.location.replace(window.location.origin)
                })
                .catch(e => console.log(e));
                
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
            }
        }
        // mounted() {
        //     window.href = window.location.host
        // }
    }
</script>

<style scoped>

</style>