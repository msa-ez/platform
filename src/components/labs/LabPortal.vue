<template>
    <div>
        <v-runtime-template v-if="portalHtml" :template="`<div> ${portalHtml} </div> `"></v-runtime-template>
    </div>
</template>


<script>
    import LabBase from './LabStorageBase';
    import Customization from "./Customization";

    export default {
        name: 'lab-portal',
        mixins: [LabBase],
        components:{
            'customization': Customization,
        },
        props: {},
        data() {
            return {
                portalHtml: null //"hello, this is tenant1's home. <br><class-list/>"
            }
        },

        watch: {
        },
        beforeDestroy(){
            this.$EventBus.$emit('showNewButton', false)
        },
        created: async function () {
            var me = this;
            me.$EventBus.$emit('showNewButton', true)

            if (this.$isElectron) {
                // Electron-specific code
                me.portalHtml = "<project-list></project-list>"
            } else if (!window.location.href.includes('localhost') && !(window.MODE == "onprem" || window.MODE == "dev")){
                let data = await me.getString("storage://labs-msaez.io/index.html")
                me.portalHtml = data
            }
            if ( !me.portalHtml ) {
                console.log("project-list")
                me.portalHtml = "<project-list></project-list>"
            }


            // me.portalHtml.__ob__.dep.notify();
        },
        methods: {

        }
    }
</script>


