<template>

</template>

<script>
    import BpmnVueFinder from './BpmnVueFinder'
    import BpmnComponentFinder from './BpmnComponentFinder'
    import ModelPanel from "../../modeling/ModelPanel"

    var jsondiffpatch = require('jsondiffpatch').create({
        objectHash: function (obj, index) {
            return '$$index:' + index;
        },
    });

    export default {
        mixins: [BpmnVueFinder, BpmnComponentFinder, ModelPanel],
        name: 'bpmn-property-panel',
        props: {
            widthStyle: {
                type: String,
                default: function () {
                    return 'width: 500px;'
                }
            },
        },
        computed: {},
        data() {
            return {
                namePanel: '',
            }
        },
        created: function () {},
        beforeDestroy() { },
        watch: {
            //모델러에 의해 tracingTag 가 변경되었을 경우.
            "value.tracingTag": function (value) {
                var me = this;
                //이미 있음.
                if (me.canvas.checkExistTracingTag(value)) {
                    console.log('TracingTag aleardy exist.');
                }
                //트레이싱 태그 값이 바뀜.
                else if (value && value.length > 0) {
                    var oldTracingTag = me.value.tracingTag;

                    //해당 액티비티 업데이트.
                    me.value.tracingTag = value;
                    me.$emit('update:item', me.value);

                    //해당 트레이싱 태그를 사용중인 릴레이션의 source,target 을 변경한다.
                    // var sequenceFlows = me.canvas.data.definition.sequenceFlows;
                    // if (sequenceFlows && sequenceFlows.length) {
                    //     $.each(sequenceFlows, function (i, relation) {
                    //         if (relation.sourceRef == oldTracingTag) {
                    //             relation.sourceRef = value;
                    //         }
                    //         if (relation.targetRef == oldTracingTag) {
                    //             relation.targetRef = value;
                    //         }
                    //     });
                    // }
                }
            },
        },
        methods: {
            setElementCanvas(){
                var me = this
                me.canvas = me.$parent.getComponent('bpmn-modeling-canvas')
            },
            closePanel() {
                this.navigationDrawer = false;
                this.$emit('close');
            },
            executeBeforeDestroy() {
                var me = this
                me.$app.try({
                    context: me,
                    async action(me){
                        /*
                            _value : 기존 값.
                            value  : Panel 사용되는 값,
                        */
                        // console.log(me._value)
                        // console.log(me.value)
                        if(!me.value) return;
                        
                        var diff = jsondiffpatch.diff(me._value, me.value)
                        if (diff && Object.keys(diff).length > 0) {
                            console.log('Panel - executeBeforeDestroy')
                            if (!me.readOnly) {
                                me.canvas.changedByMe = true

                                // part sync
                                me._value.oldName = JSON.parse(JSON.stringify(me._value.name))

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
                        me.closePanelAction()
                    }
                })
            }
        }
    }
</script>


<style lang="scss" rel="stylesheet/scss">
    .md-sidenav.md-right .md-sidenav-content {
        width: 600px;
    }

</style>

