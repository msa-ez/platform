<template>
    <div :class="!isRootUrl ? 'is-mobile-logo' : ''" :style="tenantLogoStyle" text style="width: 100px; height: 60px; margin-top: 9px; cursor: pointer;" @click="goHmoe()">
        <v-img v-if="tenantLogo" contain max-height=90% max-width=90% :src="tenantLogo"></v-img>
    </div>
</template>
<script>
import StorageBase from '../designer/modeling/StorageBase.vue'
export default {
    name: 'LogoView',
    mixins: [StorageBase],
    data () {
        return {
            tenantLogo: null,
        }
    },
    computed: {
        tenantLogoStyle(){
            if(window.location.host.includes('teachez')){
                return 'margin-left:-40px;'
            }
        },
        isRootUrl() {
            return this.$route.path === '/';
        }
    },
    created: async function () {
        var me = this
        try {
            if(window.MODE == "onprem" || window.MODE == 'dev' || this.$isElectron) {
                me.tenantLogo = "/static/image/logo.png";
            }
            else if ( !window.location.host.includes('localhost') )
                me.tenantLogo = await me.getString("storage://labs-msaez.io/logo.png");

        } catch (e) {
            console.log(e);
            console.log('created')
        }
    },
    methods: {
        goHmoe(){
            this.$EventBus.$emit("setLabInfo", null)
            if(window.ipcRenderer && window.location.host.includes('teachez')){
                this.$router.push('/start-Electron');
            } else {
                if(window.location.hash != "#/"){
                    this.$router.push('/');
                    //     window.location = "/"
                }
            }
            console.log(this.tabId)
        },
    },
}
</script>
<style>
@media only screen and (max-width:700px) {
    .is-mobile-logo {
        display:none !important;
    }
}
</style>