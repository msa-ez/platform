<template></template>

<script>
    import ModelPanel from '../modeling/ModelPanel'
    // import StorageBase from "../modeling/ModelStorageBase";
    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [ModelPanel],
        // mixins: [StorageBase],
        name: 'uml-property-panel',
        props: {
            // value: Object,
            img: String,
            entities: Object,
            readOnly: Boolean,
        },
        data: function () {
            return {
                parentCanvas: null,
            }
        },
        computed: {
        },
        beforeDestroy() {
        },
        created: function () {
            var me = this
            if(!me.canvas.embedded) {
                me.panelInit()
            } else {
                me.parentCanvas = me.getComponent('event-storming-model-canvas')
            }
        },
        methods:{
            setElementCanvas(){
                var me = this;
                me.canvas = me.getComponent('uml-class-model-canvas')
            },
            closePanel(){
                this.$emit('close')
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
                    me.panelOpenAction()
                }
            },
            executeBeforeDestroy() {
                var me = this
                try {
                    /*
                        _value : 기존 값.
                        value  : Panel 사용되는 값,
                    */
                    var diff = jsondiffpatch.diff(me._value, me.value)
                    if (diff) {
                        console.log('Panel - executeBeforeDestroy')
                        if (!me.readOnly) {
                            // all sync
                            Object.keys(me.value).forEach(function (itemKey) {
                                if(!(itemKey == 'elementView' || itemKey == 'relationView')){
                                    // Exception: 위치정보
                                    me._value[itemKey] = JSON.parse(JSON.stringify(me.value[itemKey]))
                                }
                            })
                            // re setting 값을 emit
                            me.$emit('_value-change', me._value)
                        }
                    }
                } catch (e) {
                    alert('[Error] UMLClassPanel Sync: ', e)
                }
            },
        },
    }
</script>
