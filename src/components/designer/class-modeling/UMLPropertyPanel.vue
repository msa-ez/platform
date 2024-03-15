<template></template>

<script>
    import ModelPanel from '../modeling/ModelPanel'

    export default {
        mixins: [ModelPanel],
        name: 'uml-property-panel',
        props: {
            // value: Object,
            img: String,
            entities: Object,
        },
        data: function () {
            return {

            }
        },
        computed: {
        },
        beforeDestroy() {
        },
        created: function () { },
        methods:{
            setElementCanvas(){
                var me = this;
                me.canvas = me.getComponent('uml-class-model-canvas')
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
            panelInit(){
                var me = this
                // Element

                // Common
                if ( !me.canvas.embedded ) {
                    me.openPanelAction()
                }
            },
        },
    }
</script>
