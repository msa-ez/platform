<template>
    <v-container
            style="height: 523px"
    >
        <codemirror
                v-if="value"
                ref="codemirror"
                :value="value"
                :options="cmOption"
                @ready="onCmReady"
                @Focus="onCmFocus"
                @input="onCmCodeChange"
        >
        </codemirror>
    </v-container>
</template>
<script>
    import 'codemirror/mode/yaml/yaml'
    import 'codemirror/mode/dockerfile/dockerfile'
    import 'codemirror/mode/markdown/markdown'
    import 'codemirror/mode/properties/properties'
    import 'codemirror/mode/shell/shell'
    import 'codemirror/mode/xml/xml'
    import 'codemirror/mode/python/python'

    import 'codemirror/lib/codemirror.css'
    import 'codemirror/theme/darcula.css'
    import 'codemirror/mode/clike/clike'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/theme/darcula.css'

    import 'codemirror/addon/edit/matchbrackets.js'
    import 'codemirror/addon/comment/comment.js'
    import 'codemirror/addon/dialog/dialog.js'
    import 'codemirror/addon/dialog/dialog.css'
    import 'codemirror/addon/search/searchcursor.js'
    import 'codemirror/addon/search/search.js'
    import 'codemirror/keymap/sublime.js'
    import 'codemirror/addon/scroll/annotatescrollbar.js'
    import 'codemirror/addon/search/matchesonscrollbar.js'
    import 'codemirror/addon/search/searchcursor.js'
    import 'codemirror/addon/search/match-highlighter.js'

    export default {
        props: {
            value: String
        },
        data() {
            return {
                // code: '',
                // offsetTop: 0,
            }
        },
        computed: {
            cmOption() {
                if (this.value.length > 0) {
                    var type = {
                        autoCloseBrackets: true,
                        tabSize: 4,
                        lineNumbers: true,
                        styleActiveLine: true,
                        line: true,
                        mode: 'text/shell',
                        theme: 'darcula',
                        lineWrapping: true,
                        matchBrackets: true,
                        // keyMap: "sublime",
                        scroll: true,
                        showCursorWhenSelecting: true,
                        readOnly: true,
                        lineWiseCopyCut: true,
                    }
                    return type
                }
            },
        },
        watch: {
            // value(newVal) {
            //     // // console.log()
            //     this.code = ''
            //
            //     this.code = newVal[0][0].code


            // // console.log(newVal)
            // let fileName = newVal[0].name[0];
            // let list=newVal[1].value;
            // this.definitionList=list
            // }
        },
        methods: {
            onScroll(e) {
                // this.offsetTop = e.target.scrollTop
            },
            onCmReady(cm) {
                this.$nextTick(function () {
                    cm.scrollIntoView({line: cm.doc.size -1, char:0}, 200);
                })

            },
            onCmFocus(cm) {
            },
            onCmCodeChange(newCode) {
            },
        },
        mounted() {
        },
        beforeDestroy() {
        }
    }
</script>
<style lang="scss">

    .CodeMirror {
        border: 1px solid #eee;
        height: 500px;
        max-height: 500px;
        font-size: 12px;
    }

    .CodeMirror-scroll {
        height: auto;
        max-height: 470px;
    }

</style>
