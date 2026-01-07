<template>
    
</template>

<script>
    // import jwt_decode from "jwt-decode";
    import Git from "../../utils/GitAPI"
    import Gitlab from "../../utils/Gitlab"
    import Github from "../../utils/Github"
    import CommonStorageBase from "../CommonStorageBase"
    import Gitea from "../../utils/Gitea";

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
                    // let origin = window.GITLAB ? window.GITLAB : window.location.hostname.replace("www.", "");
                    var getUsers = await git.getUserInfo()
                    .then(function (res) {
                        console.log(res)
                        me.$EventBus.$emit('login', result.accessToken)
                        me.$emit('close')
                        window.location.replace(window.location.origin)
                    })
                    .catch(e => console.log(e));
                } else if (result.provider.name == 'gitea') {
                    git = new Git(new Gitea())
                    console.log(result)
                    
                    // ★ 안전하게 필드 추출 (존재하지 않을 수 있음)
                    var userName = (result.user.settings && result.user.settings.gitea_preferred_username)
                        || result.user.displayName 
                        || result.user.username 
                        || 'gitea_user';
                    var userEmail = result.user.email || '';
                    var userProfile = result.user.picture || '';
                    var providerUid = (result.user.settings && result.user.settings.gitea_sub) || result.user.uid;
                    
                    // 기본 정보 저장
                    window.localStorage.setItem("gitAuthor", userEmail);
                    window.localStorage.setItem("gitUserName", userName);
                    window.localStorage.setItem("gitEmail", userEmail);
                    window.localStorage.setItem("gitToken", result.provider.access_token);
                    window.localStorage.setItem("gitAccessToken", result.provider.access_token); // ★ 추가
                    
                    window.localStorage.setItem("author", userEmail)
                    window.localStorage.setItem("userName", userName)
                    window.localStorage.setItem("email", userEmail)
                    window.localStorage.setItem("picture", userProfile)
                    window.localStorage.setItem("accessToken", result.accessToken)
                    window.localStorage.setItem("uid", result.user.uid)
                    window.localStorage.setItem("providerUid", providerUid) // ★ 추가
                    window.localStorage.setItem("loginType", "gitea") // ★ 추가
                    window.localStorage.setItem("gitOrgName", userName) // ★ 추가
                    
                    if (userEmail && userEmail.includes('@uengine.org')) {
                        window.localStorage.setItem("authorized", 'admin');
                    } else {
                        window.localStorage.setItem("authorized", 'student');
                    }
                    
                    // ★ git.getUserInfo() 호출하여 최신 정보로 업데이트 (Firebase GitHub 패턴과 동일)
                    try {
                        var getUsers = await git.getUserInfo()
                        .then(function (res) {
                            console.log('Gitea getUserInfo response:', res)
                            
                            // Gitea API 응답 구조에 맞게 필드 추출
                            // Gitea API: { id, login/username, email, avatar_url, full_name, ... }
                            // ★ Gitea는 username 필드를 사용할 수 있음 (GitInfo.vue 참고)
                            var apiData = res.data || res;
                            
                            // username 또는 login 필드 확인 (Gitea는 username, GitHub는 login)
                            if (apiData.username || apiData.login) {
                                userName = apiData.username || apiData.login;
                                window.localStorage.setItem("gitUserName", userName);
                                window.localStorage.setItem("userName", userName);
                                window.localStorage.setItem("gitOrgName", userName);
                            }
                            if (apiData.email) {
                                userEmail = apiData.email;
                                window.localStorage.setItem("email", userEmail);
                                window.localStorage.setItem("author", userEmail);
                                window.localStorage.setItem("gitEmail", userEmail);
                            }
                            if (apiData.avatar_url) {
                                userProfile = apiData.avatar_url;
                                window.localStorage.setItem("picture", userProfile);
                            }
                            if (apiData.id) {
                                providerUid = apiData.id.toString();
                                window.localStorage.setItem("providerUid", providerUid);
                            }
                            
                            // ★ provider 인자 전달 (Firebase와 동일)
                            me.writeUserData(result.user.uid, userName, userEmail, userProfile, 'gitea')
                            
                            me.$EventBus.$emit('login', result.accessToken)
                            me.$emit('login')
                            me.$emit('isGitLogin') // ★ 추가 (Firebase와 동일)
                            me.$emit('close')
                            window.location.replace(window.location.origin)
                        })
                        .catch(e => {
                            console.log('Gitea getUserInfo error:', e)
                            // ★ 에러 발생 시에도 기본 정보로 writeUserData 호출
                            me.writeUserData(result.user.uid, userName, userEmail, userProfile, 'gitea')
                            me.$EventBus.$emit('login', result.accessToken)
                            me.$emit('login')
                            me.$emit('isGitLogin')
                            me.$emit('close')
                            window.location.replace(window.location.origin)
                        });
                    } catch (e) {
                        console.log('Gitea login error:', e)
                        // 최종 안전장치: 에러 발생 시에도 기본 정보 저장
                        me.writeUserData(result.user.uid, userName, userEmail, userProfile, 'gitea')
                        me.$EventBus.$emit('login', result.accessToken)
                        me.$emit('login')
                        me.$emit('isGitLogin')
                        me.$emit('close')
                        window.location.replace(window.location.origin)
                    }
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