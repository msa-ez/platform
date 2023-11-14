<template>
    <div>
        <group-element
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
                        'stroke-width': 1.2,
                        'r': 6,
                        fill: '#FFFFFF',
                        'fill-opacity': 0.7,
                        'vertical-align': 'top',
                        'text-anchor': 'start'
                    }"
            ></geometry-rect>
            
            <sub-elements>
                <bpmn-state-animation :status="status" :type="type"></bpmn-state-animation>
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
        </group-element>

        <!-- <div v-if="bpmnVue && value.elements" 
                v-for="(childElement, idx) in Object.values(value.elements)" 
                :key="'childElement'+idx">
            <component v-if="childElement != null" 
                    :is="bpmnVue.getComponentByClassName(childElement._type)"
                    :value="childElement"
                    :definition="definition"
            ></component>
        </div>

        <div v-if="bpmnVue && value.relations" 
                v-for="(childRelation, idx) in Obejct.values(value.relations)" 
                :key="'childRelation'+idx">
            <bpmn-relation v-if="childRelation != null" 
                    :value="childRelation"
            ></bpmn-relation>
        </div> -->

        <bpmn-subprocess-panel
                v-if="drawer"
                v-model="value"
                @close="closePanel"
        ></bpmn-subprocess-panel>
    </div>
</template>

<script>
    import IBpmn from '../IBpmn'
    import BpmnPropertyPanel from './SubProcessPanel'

    export default {
        mixins: [IBpmn],
        name: 'bpmn-subprocess',
        props: {},
        component: {
          'bpmn-subprocess-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {}
            },
            type(){
                return 'SubProcess'
            },
            className(){
                return 'org.uengine.kernel.bpmn.SubProcess'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    tracingTag: newTracingTag,
                    selected: false,
                    elements: {},
                    relations: {},
                    variableBindings: [
                        "java.util.ArrayList",
                    ],
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

