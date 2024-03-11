<template>
</template>

<script>
    import ModelPanel from "../modeling/ModelPanel";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [ModelPanel],
        name: 'kubernetes-panel',
        props: {
            readOnly: Boolean,
            // value: Object,
            img: String,
            validationLists:{
                type: Array,
                default: function () {
                    return []
                }
            },
        },
        data: function () {
            return {
                openValidationLists:false,
                validationLevelIcon:
                    {
                      'error' : {icon: 'mdi-close-circle-outline', color:'#E53935'},
                      'warning' : {icon: 'mdi-alert-outline', color:'#FFA726'},
                      'info' : {icon: 'mdi-information-outline', color:'#29B6F6'},
                    },
            }
        },
        created: function () { },
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = me.getComponent('kubernetes-model-canvas')
            },
            desDocOpen() {
            },
            panelInit() {
                try {
                    var me = this
                
                    if ( !me.canvas.embedded ) {
                        me.openPanelAction()
                    }
                } catch (e) {
                    console.log('[Error] Kubernetes Panel Init: ', e)
                }

            },
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss"></style>
