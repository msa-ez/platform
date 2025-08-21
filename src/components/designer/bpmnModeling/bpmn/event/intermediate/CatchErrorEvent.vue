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
                    :radius="44"
            ></geometry-circle>
            
            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
            
                <!-- 오른쪽 짧은 선 -->
                <geometry-line
                        :from="[76,30]"
                        :to="[61,63]"
                ></geometry-line>

                <!-- 오른쪽 긴 선 -->
                <geometry-line
                        :from="[76,30]"
                        :to="[61,81]"
                ></geometry-line>

                <!-- 왼쪽 잛은 선-->
                <geometry-line
                        :from="[24,70]"
                        :to="[39,37]"
                ></geometry-line>

                <!-- 왼쪽 긴 선-->
                <geometry-line
                        :from="[24,70]"
                        :to="[39,19]"
                ></geometry-line>

                <!-- 위 -->
                <geometry-line
                        :from="[39,19]"
                        :to="[61,63]"
                ></geometry-line>
                
                <!-- 아래 -->
                <geometry-line
                        :from="[61,81]"
                        :to="[39,37]"
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
    import BpmnPropertyPanel from './IntermediateEventPanel'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [IBpmn],
        name: 'bpmn-error-catch-event',
        props: {},
        components: {
            'bpmn-intermediate-event-panel': BpmnPropertyPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator
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
                return 'org.uengine.kernel.bpmn.CatchingErrorEvent'
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
        mounted() {
        },
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

