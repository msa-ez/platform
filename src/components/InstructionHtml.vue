<template>
    <div>
        <v-runtime-template v-if="sourceHtml" :template=" '<div slot=default>' + sourceHtml + '</div>' "/>
    </div>
</template>

<script>
    import VRuntimeTemplate from "v-runtime-template";
    import VueMarkdown from 'vue-markdown';

    export default {
        name: 'instruction-html',
        mixins: [],
        components: {
            VRuntimeTemplate
        },
        props: {
            source: String

        },
        data() {
            return {
                sourceHtml: null,
            }
        },
        created() {
            var me = this
            Vue.component('mark-down', VueMarkdown)

            me.source = me.source.replaceAll("<mark-down>","<mark-down source='")
            me.source = me.source.replaceAll("</mark-down>", "\'> </mark-down>")
            me.sourceHtml = me.source
        },
        computed: {},
        mounted() {
        },
        methods: {},
    }
</script>