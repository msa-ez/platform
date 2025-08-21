<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                connectable
                deletable
                :enableFrom="false"
                :id.sync="value.tracingTag"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :_style.sync="style"
                :parentId.sync="value.elementView.parent"
                :label.sync="namePanel"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:dblclick="showProperty"
                v-on:selectShape="closeComponentChanger(); selectedActivity();"
                v-on:deSelectShape="closeComponentChanger(); deSelectedActivity();"
                v-on:removeShape="onRemoveShape"
                v-on:redrawShape="closeComponentChanger"
                v-on:addedToGroup="onAddedToGroup"
        >
            <geometry-circle
                    :center="[50,50]"
                    :radius="50"
                    :_style="{
                        'stroke-width': 3
                    }"
            ></geometry-circle>
            <geometry-polygon
                    :vertices="[[20, 80],[50, 20],[80, 80],[50, 50]]"
                    :_style="{
                        'fill': 'black',
                        'fill-opacity': 1
                    }"
            ></geometry-polygon>
            
            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
            </sub-elements>
            
            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
            
            <bpmn-sub-controller :type="type"></bpmn-sub-controller>
        </geometry-element>

        <bpmn-end-event-panel
                v-if="drawer"
                v-model="value"
                @close="closePanel"
        ></bpmn-end-event-panel>
    </div>
</template>

<script>
    import IBpmn from '../../IBpmn'
    import BpmnPropertyPanel from './EndEventPanel'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    export default {
        mixins: [IBpmn],
        name: 'bpmn-escalation-end-event',
        props: {},
        components: {
            'bpmn-end-event-panel': BpmnPropertyPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            defaultStyle(){
                return {
                    'label-position': 'bottom'
                }
            },
            type(){
                return 'EndEvent'
            },
            className(){
                return 'org.uengine.kernel.bpmn.EscalationEndEvent'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    tracingTag: newTracingTag,
                    selected: false,
                    elementView: {
                        '_type': 'org.uengine.kernel.view.DefaultActivityView',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    }
                }
            }
        },
        data: function () {
            return {};
        },
        watch: {},
        mounted: function () {
        },
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

