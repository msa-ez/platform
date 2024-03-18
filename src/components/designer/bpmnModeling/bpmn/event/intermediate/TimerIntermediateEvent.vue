<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                connectable
                deletable
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
            ></geometry-circle>
            
            <geometry-circle
                    :center="[50,50]"
                    :radius="40"
                    :_style="{
                        'stroke-width': 1.1
                    }"
            ></geometry-circle>

            <geometry-circle
                    :center="[50,50]"
                    :radius="28"
                    :_style="{
                        'stroke-width': 0.5,
                        fill: '#FFFF00'
                    }"
            ></geometry-circle>

            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
                <geometry-line
                        :from="[58,28]"
                        :to="[48,52]"
                ></geometry-line>
                <geometry-line
                        :from="[68.1,53]"
                        :to="[48,52]"
                ></geometry-line>
            </sub-elements>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <bpmn-sub-controller :type="type"></bpmn-sub-controller>
        </geometry-element>

        <bpmn-intermediate-event-panel
                v-if="drawer"
                v-model="value"
                @close="closePanel"
        ></bpmn-intermediate-event-panel>
    </div>
</template>

<script>
  import IBpmn from '../../IBpmn'
  import BpmnPropertyPanel from './IntermediateEventPanel.vue'
  import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"


    export default {
        mixins: [IBpmn],
        name: 'bpmn-timer-intermediate-event',
        props: {},
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            defaultStyle(){
                return {
                    'label-position': 'bottom',
                    'stroke-width': 1.5
                }
            },
            type(){
                return 'IntermediateEvent'
            },
            className(){
                return 'org.uengine.kernel.bpmn.TimerIntermediateEvent'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    tracingTag: newTracingTag,
                    selected: false,
                    scheduleType: "sec",
                    expression: "10",
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

