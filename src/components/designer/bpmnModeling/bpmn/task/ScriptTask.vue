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
            <geometry-rect
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.2,
                        fill: '#FFFFFF',
                        'fill-opacity': 0,
                        r: '10'
                    }"
            ></geometry-rect>

            <sub-elements>
                <image-element
                        v-bind:image="script_image"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-top="'5px'"
                        :sub-left="'5px'"
                ></image-element>
                <bpmn-loop-type :loopType="loopType"></bpmn-loop-type>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
            </sub-elements>
            
            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="value.elementView.height"></multi-user-status-indicator>
            </sub-elements>
            
            <bpmn-sub-controller :type="type"></bpmn-sub-controller>
        </geometry-element>

        <bpmn-task-panel
                v-if="drawer"
                v-model="value"
                @close="closePanel"
        ></bpmn-task-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel from './TaskPanel'
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"

    export default {
        mixins: [IBpmn],
        name: 'bpmn-script-task',
        props: {},
        components: {
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'bpmn-task-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {}
            },
            type(){
                return 'Task'
            },
            className(){
                return 'org.uengine.kernel.ScriptActivity'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    out: {
                        name: ''
                    },
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
                    },
                }
            }
        },
        data: function () {
            return {
                links: null,
                script_image: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? 
                    '' : '/') + 'static/image/symbol/Script.png'
            };
        },
        created: function(){
            if(!this.value.role) {
                this.value.role = { name:'' };
            }
        },
        mounted: function () {
        }
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">
</style>
