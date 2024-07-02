<template>
    <div>
        <geometry-element
                selectable
                movable
                resizable
                connectable
                deletable
                :enableTo="false"
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
            
            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>

                <!-- 위 선 -->
                <geometry-line
                        :from="[30,20]"
                        :to="[70,20]"
                ></geometry-line>
                <!-- 오른쪽 선 -->
                <geometry-line
                        :from="[70,20]"
                        :to="[70,80]"
                ></geometry-line>
              
                <!-- 아래 선-->
                <geometry-line
                        :from="[30,80]"
                        :to="[70,80]"
                ></geometry-line>
                
                <!-- 왼쪽 선-->
                <geometry-line
                        :from="[30,20]"
                        :to="[30,80]"
                ></geometry-line>
                
                <!-- 위 -->
                <geometry-line
                        :from="[33,32]"
                        :to="[67,32]"
                ></geometry-line>
                <geometry-line
                        :from="[33,44]"
                        :to="[67,44]"
                ></geometry-line>
                <geometry-line
                        :from="[33,56]"
                        :to="[67,56]"
                ></geometry-line>
                <geometry-line
                        :from="[33,68]"
                        :to="[67,68]"
                ></geometry-line>
            </sub-elements>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>

            <bpmn-sub-controller :type="type"></bpmn-sub-controller>
        </geometry-element>

        <bpmn-start-event-panel
                v-if="drawer"
                v-model="value"
                @close="closePanel"
        ></bpmn-start-event-panel>
    </div>
</template>

<script>
    import IBpmn from '../../IBpmn'
    import BpmnPropertyPanel from './StartEventPanel'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [IBpmn],
        name: 'bpmn-conditional-start-event',
        props: {},
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'bpmn-start-event-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {
                    'label-position': 'bottom',
                    'stroke-width': 1.5
                }
            },
            type(){
                return 'StartEvent'
            },
            className(){
                return 'org.uengine.kernel.bpmn.ConditionalStartEvent'
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

