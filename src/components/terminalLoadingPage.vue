<template>
    <div v-if="terminal">
        <div v-if="terminalUrl">
            <v-btn color="error" @click="terminalOff"
                   style="position: fixed; height: 5%; top: 65%; right: 5px;">
                <v-icon>mdi-close</v-icon>
            </v-btn>
            <iframe
                    id="terminalPage"
                    :src="terminalUrl"
                    @load="onLoad"
                    :style="{width: terminalWidth + 'px'}"
                    style="height:30%; right: 0; bottom: 0; display: block; position: fixed"
            ></iframe>
            <billing-counter v-if="startCounting && hashName" :hashName="hashName" style="top:5px;"></billing-counter>
        </div>

        <div v-else style="position: fixed; width: 100%;height: 40%;top: 70%;">
            <v-skeleton-loader
                    v-bind="attrs"
                    type=" actions,image"
            ></v-skeleton-loader>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'terminalLoadingPage',
        data() {
            return {
                terminalWidth: "100%",
                terminalUrl: '',
                startCounting: false,
                attrs: {
                    class: 'mb-3',
                    boilerplate: true,
                    elevation: 2,
                },
            }
        },
        props: {
            terminal: Boolean,
            userInfo: {
                type: Object,
                default: function () {
                    return null;
                }
            },
        },
        computed: {
            hashName() {
                var me = this
                if (me.userInfo && me.userInfo.email) {
                    var userName = me.userInfo.email.split('@')[0].toLowerCase();
                    var userGroup = me.userInfo.email.split('@')[1].split('.')[0].toLowerCase();
                    return `ide-${me.hashCode(userGroup + "-" + userName)}`
                }
                return null
            },
            isForeign() {
                if (window.countryCode == 'ko') {
                    return false
                }
                return true
            },
        },
        beforeDestroy() {
            this.terminalOff();
        },
        mounted() {
            var me = this
            //<<<<< new terminal
            // me.$EventBus.$on('terminalOn', function (data) {
            //     // me.getTerminalToken();
            //     try {
            //         me.$EventBus.$emit('loadTerminal');
            //         me.terminalWidth = $('.canvas-panel').width()
            //         me.getTerminalConfig(data);
            //     } catch (e) {
            //         console.log(e)
            //     }
            //
            // })
            // me.$EventBus.$on('terminalOff', function () {
            //     try {
            //         me.terminalOff()
            //     } catch (e) {
            //         console.log(e)
            //     }
            // })
            // me.$EventBus.$on('terminalFrameOn', function () {
            //     me.terminalWidth = $('.canvas-panel').width()
            // })
            // me.$EventBus.$on('sendCode', function (val) {
            //     if (me.terminal) {
            //         $('iframe').get(0).contentWindow.wt.term.term.send(val)
            //     } else {
            //         me.sendSnackbar(true,"Open the terminal before clicking on the command.")
            //     }
            // })
            // new terminal >>>>>>
        },
        methods: {
            hashCode(s) {
                return s.split("").reduce(function (a, b) {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a
                }, 0);
            },
            sendSnackbar(on, text) {
                this.$emit('snackbar', on, text)
            },
            terminalOn() {
                var me = this;
                me.startCounting = true
                me.$emit('terminalOn')
            },
            terminalOff() {
                var me = this;
                me.terminalUrl = ''
                me.startCounting = false
                me.$emit('terminalOff')
            },
            onLoad() {
                this.iframeLoading = false;
            },
            getTerminalConfig(data) {
                var me = this
                var item = {
                    "type": "Token",
                    "name": data.name,
                    // "apiServer": localStorage.getItem('clusterAddress'),
                    "kubeConfig": data.config
                }

                me.$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
                me.$http.post("api/kube-config", item).then(function (response) {
                    me.terminalUrl = "terminal/?token=" + response.data.token;
                    me.terminalOn()
                }).catch(function (err) {
                    me.sendSnackbar(true, "To use Shell Terminal, A Cluster must be selected using Cluster Managing Menu.")
                })
            },
        }


    }
</script>