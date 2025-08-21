<template>
    <div>

    </div>
</template>

<script>
    export default {
        name: 'web-rtc-base',
        props: {},
        components: {},
        created() {

        },
        data() {
            return {
                webRtcDialog: false
            }
        },
        beforeDestroy() {
        },
        mounted() {
        },
        computed: {},
        watch: {},
        methods: {
            openWebRtcDialog() {
                this.webRtcDialog = true
            },
            closeWebRtcDialog() {
                this.webRtcDialog = false
            }
        },
    }
</script>
