<template>
    <div style="margin: 10px;">
        <div v-if="provider =='gitlab'">
            <login-by-gitlab></login-by-gitlab>
            <br/> OR
        </div>
        <v-text-field
                :append-icon="showToken ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showToken ? 'text' : 'password'"
                @click:append="showToken = !showToken"
                v-model="gitToken"
                :readonly="isGitLogin"
                :error="githubTokenError"
                :rules="[gitInfoRules.required, !githubTokenError || 'Make sure your github token is correct']"
                label="token"
        >
            <template v-slot:label>
                Access Token
                <v-icon @click="openGuide()" style="vertical-align: middle; margin-top: -3px;">
                    mdi-help-circle-outline
                </v-icon>
            </template>
        </v-text-field>
        <v-btn @click="saveToken()">SAVE</v-btn>
        <v-btn
            color="red"
            text
            @click="$emit('close')"
        >
            CANCEL
        </v-btn>
    </div>
</template>
<script>
import StorageBase from '../CommonStorageBase.vue';
import GitAPI from "../../utils/GitAPI";
import Github from '../../utils/Github';
import Gitlab from '../../utils/Gitlab';
import LoginByGitlab from './LoginByGitlab';
export default {
    name: 'GitInfo',
    mixins: [StorageBase],
    components: {
        LoginByGitlab
    },
    data () {
        return {
            showToken: false,
            gitInfoRules: {
                required: value => !!value || 'Required.'
            },
            gitUserName: "",
            gitToken: "",
            git: null
        }
    },
    props: {
        isGitLogin: Boolean,
        githubTokenError: Boolean,
    },
    computed: {
        provider() {
            return window.PROVIDER
        }
    },
    watch: {

    },
    created: async function () {
        let me = this
        me.gitToken = localStorage.getItem("gitToken")
        let git;
        // localStorage.getItem("provider")

        this.git = new GitAPI();
        if(me.gitToken != null) {
            me.getUserInfo();
        }
    },
    methods: {
        async getUserInfo() {
            let me = this
            let userInfo = await me.git.getUserInfo()
            .then((res) => {
                let username = res.username ? res.username : res.login
                localStorage.setItem("gitUserName", username);
                localStorage.setItem("gitOrgName", username)
                me.$emit("input-token")
            })
            .catch(e => alert("Invalid Tokens"))
        },
        saveToken(){
            var me = this
            // localStorage.removeItem("gitOrgName");
            // localStorage.setItem("gitUserName", me.gitUserName);
            localStorage.setItem("gitToken", me.gitToken);
            me.getUserInfo();
            // localStorage.removeItem("loginType");
            // let obj = {
            //     gitUserName: me.gitUserName,
            //     gitToken: me.gitToken
            // }
            // let uid = localStorage.getItem("uid")
        },
        isGitLoginComplete() {
            let me = this
            me.$emit('isGitLogin')
        },
        openGuide(){
            window.open(`https://github.com/TheOpenCloudEngine/msaschool/wiki/Github-Personal-Access-Token-%EB%B0%9C%ED%96%89-%EB%B0%A9%EB%B2%95`, '_blank');
        }
    },
}
</script>