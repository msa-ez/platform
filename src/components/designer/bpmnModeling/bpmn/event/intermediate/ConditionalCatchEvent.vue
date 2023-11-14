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
                :definition="definition"
                v-model="value"
                :isComplexCondition.sync="complexCondition"
                @close="closePanel"
        ></bpmn-intermediate-event-panel>
    </div>
</template>

<script>
    import IBpmn from '../../IBpmn'
    import BpmnPropertyPanel from './IntermediateEventPanel'

    export default {
        mixins: [IBpmn],
        name: 'bpmn-conditional-intermediate-catch-event',
        props: {},
        component: {
            'bpmn-intermediate-event-panel': BpmnPropertyPanel
        },
        computed: {
            defaultStyle(){
                return {
                    'label-position': 'bottom',
                    'label-width': 120,
                    'stroke-width': 1.5
                }
            },
            type(){
                return 'IntermediateEvent'
            },
            className(){
                return 'org.uengine.kernel.bpmn.ConditionalCatchEvent'
            },
            createNew(newTracingTag, x, y, width, height, elementId){
                return {
                    _type: this.className(),
                    name: '',
                    tracingTag: newTracingTag,
                    selected: false,
                    pollingIntervalInSecond: 5,
                    condition: {
                        _type: 'org.uengine.kernel.Evaluate',
                        pv: {
                            _type: 'org.uengine.kernel.ProcessVariable',
                            name: ''
                        },
                        condition: '==',
                        val: ''
                        //conditionExpression: 'arg2=="call"'
                    },
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
            return {
                complexCondition: false
            };
        },
        watch: {
            complexCondition: function(val){
                if(val) {
                    if(this.value.condition && (this.value.condition._type.indexOf("Or") > -1 || this.value.condition._type.indexOf("And") > -1)) {
                        return;
                    }
                    var existingCondition = this.value.condition;
                    this.value.condition.conditionsVt = [];
                    this.value.condition._type="org.uengine.kernel.Or";
                } else {
                    if(this.value.condition && (this.value.condition._type.indexOf("Or") > -1 || this.value.condition._type.indexOf("And") > -1)) {
                        this.complexCondition = true; //not changeable to simple condition.
                    }
                }
            }
        },
        created: function(){
            if(this.value.condition && (this.value.condition._type.indexOf('Or') > -1 || this.value.condition._type.indexOf('And') > -1)){
                this.complexCondition = true;
            }
        },
        mounted: function () {
        },
        methods: {}
    }
</script>


<style scoped lang="scss" rel="stylesheet/scss">

</style>

