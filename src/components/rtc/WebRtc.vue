<template>
    <div>
        <hsc-window-style-metal>
            <hsc-window title="User Camera"
                        :closeButton="true"
                        :isOpen.sync="webRtcDialog"
                        :resizable="true"
                        :isScrollable="true"
                        :minWidth="400"
                        :minHeight="110"
                        :maxWidth="800"
                        :maxHeight="110"
                        positionHint="5 / -10"
                        style="
                        color: rgb(0, 0, 0);
                        box-shadow: rgba(0, 0, 0, 0.5) 0px 4pt 8pt;
                        background: linear-gradient(rgb(255, 255, 255), rgb(255, 255, 255));
                        z-index: 0;
                        overflow: visible;
                        width: 404px;
                        height: 154.2px;"
            >
                <v-layout>
                    <v-col>
                        <v-row style="margin-left: 2px; margin-bottom: 2px">
                            <vue-webrtc ref="webrtc"
                                        width="100%"
                                        height="160px"
                                        cameraHeight="50px"
                                        enableAudio
                                        class="video-list"
                                        :roomId="rtcRoomId"
                                        @error="onError"/>

                        </v-row>
                    </v-col>
                </v-layout>
            </hsc-window>
        </hsc-window-style-metal>
    </div>
</template>

<script>
    import WebRtcBase from "./WebRtcBase";

    export default {
        name: 'web-rtc',
        props: {},
        mixins: [WebRtcBase],
        components: {},
        created() {

        },
        data() {
            return {}
        },
        beforeDestroy() {
        },
        mounted() {
        },
        computed: {},
        watch: {},
        methods: {},
    }
</script>
