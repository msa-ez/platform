<template>
    <div>
        <geometry-element
                :selectable="selectable"
                :movable="movable"
                :resizable="resizable"
                :deletable="deletable"
                connectable
                :id.sync="value.elementView.id"
                :x.sync="value.elementView.x"
                :y.sync="value.elementView.y"
                :width.sync="value.elementView.width"
                :height.sync="value.elementView.height"
                :angle.sync="value.elementView.angle"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                :label.sync="namePanel"
                :_style="{
                    'label-angle':value.elementView.angle,
                    'font-weight': 'bold',
                    'font-size': '16',
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    v-if="movingElement"
                    :_style="{
                      'fill-r': 1,
                      'fill-cx': .1,
                      'fill-cy': .1,
                      'stroke-width': 1,
                      'stroke': '#212121',
                      'fill': '#EEEEEE',
                      'fill-opacity': .5,
                      r: '1'
                    }"
            >
            </geometry-rect>
            <geometry-rect
                    v-else
                    :_style="{
                      'fill-r': 1,
                      'fill-cx': .1,
                      'fill-cy': .1,
                      'stroke-width': 1,
                      'stroke': '#212121',
                      'fill': '#FFFFFF',
                      'fill-opacity': 1,
                      r: '1'
                    }"
            >
            </geometry-rect>
            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>
            <sub-elements>
                <geometry-point
                        :coordinate="[95,5]"
                        :_style="statusCompleteStyle">
                </geometry-point>
                
                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="value.classReference ? value.classReference : '<< UI >>'">
                </text-element>

                <image-element
                        v-if="showValidation"
                        v-bind:image="showValidationImg"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'5px'"
                        :sub-bottom="'5px'"
                ></image-element>

                <storming-sub-controller
                        :type="value._type"
                        :value="value"
                        :isReadOnly="!isEditElement"
                ></storming-sub-controller>
            </sub-elements>
        </geometry-element>
        
        <ui-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></ui-definition-panel>
    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import UIDefinitionPanel from "../panels/UIDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    export default {
        mixins: [Element],
        name: 'ui-definition',
        components:{
            UIDefinitionPanel,
            StormingSubController,
            'multi-user-status-indicator': MultiUserStatusIndicator
        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.UI'
            },
            createNew(canvas, elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.UI',
                    id: elementId,
                    name: '',
                    oldName: '',
                    displayName: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    namePlural: '',
                    description: null,
                    author: null,
                    boundedContext: {},
                    elementView: {
                        '_type': 'org.uengine.modeling.model.UI',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    uiType: "Chart",
                    chart: {
                        type: "",
                        fieldMapping: {
                            category: [],
                            data: [],
                        }
                    },
                    grid: {
                        columns: []
                    },
                    card: {
                        title: "",
                        subtitle: "",
                        text: ""
                    }
                }
            }
        },
        data: function () {
            return {
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
            };
        },
        created: function () {
        },
        watch: {
        },
        mounted: function () {
        },
        methods: {
            openAutoModeling(){
                this.canvas.openAutoModeling(this.value.name);
            },
            onMoveAction(){
                this.$super(Element).onMoveAction()
            },
            validate(executeRelateToValidate, panelValue) {
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value
                // Common
                if(executeValidate){
                    this.$super(Element).validate()
                }
                // execute Relate Validate ex) 자신의 element에서 다른 element의 validate 실행여부.
                if(executeValidate) {
                }
                // Element
                if(validateValue.name){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME))
                    var isExistValidationResult = validationResultIndex == -1 ? false: true
                    if( isExistValidationResult ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME) )
                    var isExistValidationResult = validationResultIndex == -1 ? false: true
                    if( !isExistValidationResult ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_NAME))
                    }
                }
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
</style>