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
                        'stroke-width': 1
                    }"
            ></geometry-circle>

            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>

                <geometry-polygon
                    :vertices="[[68,35],[68,65],[48,50]]"
                    :_style="{
                        'stroke-width': 0.8,
                        'fill': '#000000',
                        'fill-opacity': 1
                    }"
                ></geometry-polygon>

                <geometry-polygon
                    :vertices="[[48,35],[48,65],[28,50]]"
                    :_style="{
                        'stroke-width': 0.8,
                        'fill': '#000000',
                        'fill-opacity': 1
                    }"
                ></geometry-polygon>
            </sub-elements>

            <sub-elements v-for="(index) in newEditUserImg.length" :key="index">
                <image-element
                        v-bind:image="newEditUserImg[index-1].picture"
                        :sub-width="'24px'"
                        :sub-height="'24px'"
                        :sub-right="(10*(index-1))+'px'"
                        :sub-bottom="value.elementView.height"
                ></image-element>
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

    export default {
        mixins: [IBpmn],
        name: 'bpmn-compensation-intermediate-throw-event',
        props: {},
        component: {
            'bpmn-intermediate-event-panel': BpmnPropertyPanel
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
                return 'org.uengine.kernel.bpmn.CompensationIntermediateThrowEvent'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    role: {
                        name: ''
                    },
                    outputMapping: [],
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

