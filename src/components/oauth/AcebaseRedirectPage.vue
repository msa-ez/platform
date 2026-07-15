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
            // v1.0.30 — 게이트웨이가 base64(JSON) 으로 result 를 전달.
            // AceBase SDK(finishAuthProviderSignIn) 없이 직접 디코드한다.
            Promise.resolve(JSON.parse(atob(decodeURIComponent(callbackResult))))
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

                    // 토큰을 먼저 박아둬야 git.getHeader() 가 localStorage.gitToken 으로
                    // Authorization 헤더를 만들 수 있음.
                    window.localStorage.setItem("gitToken", result.provider.access_token);
                    window.localStorage.setItem("gitAccessToken", result.provider.access_token);
                    window.localStorage.setItem("uid", result.user.uid);
                    window.localStorage.setItem("accessToken", result.accessToken);
                    window.localStorage.setItem("loginType", "gitea");

                    // 라이브 Gitea API 응답을 단일 진실원으로 사용. 실패 시에만 result.user 의
                    // (acebase 가 캐시한, 종종 stale 한) 값으로 fallback.
                    // 기존 구현은 result.user 로 phase1 setItem 한 뒤 .then() 에서 일부 키만
                    // 갱신해서 phase1/phase2 분열이 발생, gitAuthor 만 다른 값이 되는 사례가 있었음.
                    var apiData = {};
                    try {
                        var res = await git.getUserInfo();
                        apiData = (res && res.data) ? res.data : (res || {});
                        console.log('Gitea getUserInfo response:', apiData);
                    } catch (e) {
                        console.log('Gitea getUserInfo failed, will use result.user fallback:', e);
                    }

                    var userName = apiData.username
                        || apiData.login
                        || (result.user.settings && result.user.settings.gitea_preferred_username)
                        || result.user.displayName
                        || result.user.username
                        || 'gitea_user';
                    var userEmail = apiData.email || result.user.email || '';
                    var userProfile = apiData.avatar_url || result.user.picture || '';
                    var providerUid = apiData.id ? String(apiData.id)
                        : ((result.user.settings && result.user.settings.gitea_sub) || result.user.uid);

                    // 모든 키를 일관된 값 세트로 한 번에 동기 갱신
                    window.localStorage.setItem("gitAuthor", userEmail);
                    window.localStorage.setItem("gitEmail", userEmail);
                    window.localStorage.setItem("gitUserName", userName);
                    window.localStorage.setItem("gitOrgName", userName);
                    window.localStorage.setItem("author", userEmail);
                    window.localStorage.setItem("email", userEmail);
                    window.localStorage.setItem("userName", userName);
                    window.localStorage.setItem("picture", userProfile);
                    window.localStorage.setItem("providerUid", providerUid);
                    window.localStorage.setItem(
                        "authorized",
                        result.user.authorized || ((userEmail && userEmail.includes('@uengine.org')) ? 'admin' : 'student')
                    );
                    window.localStorage.setItem("approvalStatus", result.user.status || 'approved');

                    // DB 쓰기 완료 후 redirect — fire-and-forget putObject 가 window.location.replace
                    // 의 socket close 에 잘려 enrolledUsers 가 누락되는 race 를 방지.
                    try {
                        await me.writeUserData(result.user.uid, userName, userEmail, userProfile, 'gitea')
                    } catch (e) {
                        console.log('Gitea writeUserData failed:', e)
                    }

                    me.$EventBus.$emit('login', result.accessToken)
                    me.$emit('login')
                    me.$emit('isGitLogin')
                    me.$emit('close')
                    window.location.replace(window.location.origin)
                } else if (result.provider.name == 'posco') {
                    // POSCO SWP SSO — git 토큰 없음. 코드생성용 Gitea 접근은 서비스 PAT
                    // (window.GITEA_TOKEN)가 담당하므로 gitToken 은 세팅하지 않는다.
                    // 신원(email/이름)은 게이트웨이가 SWP isValidSSO 로 확정한 result.user 를 단일 진실원으로 사용.
                    var pEmail = result.user.email || '';
                    var pName = result.user.displayName || result.user.username || 'posco_user';
                    var pPic = result.user.picture || '';
                    var pProviderUid = (result.user.settings && result.user.settings.posco_id)
                        || result.user.uid;

                    window.localStorage.setItem("uid", result.user.uid);
                    window.localStorage.setItem("accessToken", result.accessToken);
                    window.localStorage.setItem("loginType", "posco");
                    // Gitea util 은 getOrg()="posco" 고정 + getHeader()가 GITEA_TOKEN 우선이라
                    // gitToken 없이도 코드생성이 동작한다. gitOrgName 만 일관되게 채워둔다.
                    window.localStorage.setItem("gitOrgName", "posco");
                    window.localStorage.setItem("gitAuthor", pEmail);
                    window.localStorage.setItem("gitEmail", pEmail);
                    window.localStorage.setItem("gitUserName", pName);
                    window.localStorage.setItem("author", pEmail);
                    window.localStorage.setItem("email", pEmail);
                    window.localStorage.setItem("userName", pName);
                    window.localStorage.setItem("picture", pPic);
                    window.localStorage.setItem("providerUid", pProviderUid);
                    // 권한/승인상태는 게이트웨이(ADMIN_EMAILS·가입승인) 판정을 단일 진실원으로 사용.
                    window.localStorage.setItem(
                        "authorized",
                        result.user.authorized || ((pEmail && pEmail.includes('@uengine.org')) ? 'admin' : 'student')
                    );
                    window.localStorage.setItem("approvalStatus", result.user.status || 'approved');

                    try {
                        await me.writeUserData(result.user.uid, pName, pEmail, pPic, 'posco')
                    } catch (e) {
                        console.log('POSCO writeUserData failed:', e)
                    }

                    me.$EventBus.$emit('login', result.accessToken)
                    me.$emit('login')
                    me.$emit('close')
                    window.location.replace(window.location.origin)
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
            async writeUserData(userId, name, email, imageUrl, provider) {
                // ★ authorized/status 는 게이트웨이(ADMIN_EMAILS·가입승인)가 단일 진실원이다.
                // 여기서 authorized 를 쓰면(putObject=merge) 게이트웨이가 부여한 admin 을
                // @uengine.org 아닌 이메일(예: POSCO)에서 'student' 로 덮어써 admin 지정이 풀린다.
                // 따라서 users 레코드에는 authorized/status 를 절대 쓰지 않는다.
                var obj = {
                    username: name,
                    email: email,
                    profile_picture: imageUrl,
                    state: 'signIn',
                    provider: provider,
                    loginDate: Date.now()
                }
                var eObj = {
                    uid: userId,
                    userName: name,
                    profile_picture: imageUrl,
                    email: email,
                }

                // await 로 묶어 redirect 전에 양쪽 write 가 모두 완료되도록 보장.
                // 기존 구현은 fire-and-forget 이라 window.location.replace 의 socket close 에
                // 두 번째 putObject(enrolledUsers) 가 잘리는 race 가 있었음.
                await this.putObject(`db://users/${userId}`, obj)
                if (email) {
                    var convertEmail = email.replace(/\./gi, '_')
                    await this.putObject(`db://enrolledUsers/${convertEmail}`, eObj)
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