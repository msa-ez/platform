<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <v-runtime-template v-if="myPageLocator" :template=" `<div slot=default style ='text-align: -webkit-center'>` + myPageLocator + '</div>' "/>
    </div>
</template>


<script>
    import VRuntimeTemplate from "v-runtime-template";
    import StorageBase from "../../utils/StorageBase";
    import AdminPage from './AdminPage.vue'
    import PersonalPage from './PersonalPage.vue'
    

    export default {
        name: 'my-page',
        mixins: [],
        components: {
            VRuntimeTemplate,
            AdminPage,
            PersonalPage
        },
        props: {},
        data() {
            return {
                myPageLocator: null //"hello, this is tenant1's home. <br><class-list/>"
            }
        },
        async created() {
            var me = this
            let storage = StorageBase.getStorage('firebase')
            let userInfo = await storage.getCurrentUser();

            if(!userInfo) {
                me.$EventBus.$emit('showLoginDialog')
                return;
            }
            if(userInfo.authorized == 'admin'){
                me.myPageLocator = "<AdminPage></AdminPage>"
            } else {
                me.myPageLocator = "<PersonalPage></PersonalPage>"
            }    
        },
    }
</script>


