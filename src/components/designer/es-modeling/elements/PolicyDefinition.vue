<template>
    <div>
        <geometry-element
                :selectable="selectable"
                :movable="movable"
                :resizable="resizable"
                :deletable="deletable"
                connectable
                :id.sync="value.elementView.id"
                :x.sync="elementCoordinate.x"
                :y.sync="elementCoordinate.y"
                :width.sync="elementCoordinate.width"
                :height.sync="elementCoordinate.height"
                :angle.sync="elementCoordinate.angle"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:addedToGroup="onAddedToGroup"
                :label="canvas.isHexagonal ? '' : getNamePanel"
                :_style="{
                    'label-angle': canvas.isHexagonal ? 0 : value.elementView.angle,
                    'font-weight': 'bold','font-size': '16'
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-circle
                    v-if="canvas.isHexagonal"
                    :center="[50,50]"
                    :radius="50"
                    :_style="{
                        'stroke-width': 20,
                        'stroke': '#BB94BF',
                        'fill': '#BB94BF',
                        'fill-opacity': 1,
                        'r': '1',
                        'z-index': '998'
                    }"
            ></geometry-circle>
            <sub-elements v-if="canvas.isHexagonal">
                <text-element
                        :sub-top="'-20px'"
                        :sub-left="'100%'"
                        :sub-width="150"
                        :text="getNamePanel"
                        :subStyle="{
                            'font-color': '#BB94BF',
                            'font-weight': 'bold',
                            'font-size': '16',
                            'text-anchor': 'start',
                            'z-index': '998'
                        }"
                ></text-element>
            </sub-elements>

            <geometry-rect
                    v-if="movingElement && !canvas.isHexagonal"
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#BB94BF',
                        fill: '#BB94BF',
                        'fill-opacity': .5,
                        r: '1', 'z-index': '998'
                    }"
            ></geometry-rect>
            <geometry-rect
                    v-if="!movingElement && !canvas.isHexagonal"
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#BB94BF',
                        fill: '#BB94BF',
                        'fill-opacity': 1,
                        r: '1', 'z-index': '998'
                    }"
            ></geometry-rect>

            <sub-elements v-if="!canvas.isHexagonal">
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <geometry-point
                        :coordinate="[95,5]"
                        :_style="statusCompleteStyle">
                </geometry-point>

                <!--title-->
                <image-element
                        v-if="showValidation"
                        v-bind:image="showValidationImg"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'5px'"
                        :sub-bottom="'5px'"
                >
                </image-element>

                <text-element
                        v-if="!canvas.isHexagonal"
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="value.classReference ? value.classReference : '<< Policy >>'">
                </text-element>

                <storming-sub-controller
                        v-if="!isPBCModel"
                        :type="value._type" 
                        :value="value"
                        :isReadOnly="!isEditElement"
                        :isHexagonal="canvas.isHexagonal"
                ></storming-sub-controller>

            </sub-elements>
        </geometry-element>

        <rectangle-element
                v-if="canvas.isHexagonal"
                connectable
                :selectable="!movingElement && canvas.isHexagonal"
                :x="canvas.isHexagonal ? elementCoordinate.x+elementCoordinate.subWidth*0.5 : elementCoordinate.x"
                :y="elementCoordinate.y"
                :width="canvas.isHexagonal ? elementCoordinate.subWidth : 0"
                :height="canvas.isHexagonal ? 10 : 0"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                :_style="{
                    'stroke': '#BB94BF',
                    'fill': '#BB94BF',
                    'fill-opacity': 1,
                    'z-index': '998',
                }"
        ></rectangle-element>

        <policy-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></policy-definition-panel>

    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import PolicyDefinitionPanel from "../panels/PolicyDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    export default {
        mixins: [Element],
        name: 'policy-definition',
        components:{
            PolicyDefinitionPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'storming-sub-controller': StormingSubController
        },
        computed: {
            namePascalCase() {
                var me = this
                return me.name.charAt(0).toUpperCase() + me.name.slice(1)
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.Policy'
            },
            createNew(canvas, elementId, x, y, width, height, description, label, hexagonalX, hexagonalY) {
                return {
                    _type: 'org.uengine.modeling.model.Policy',
                    id: elementId,
                    name: '',
                    fieldDescriptors: [],
                    oldName: '',
                    displayName: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    namePlural: '',
                    description: null,
                    author: null,
                    boundedContext: {},
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Policy',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    hexagonalView: {
                        '_type': 'org.uengine.modeling.model.PolicyHexagonal',
                        'id': elementId,
                        'x': hexagonalX,
                        'y': hexagonalY,
                        'subWidth': 100,
                        'width': 20,
                        'height': 20,
                        'style': JSON.stringify({}),
                    },
                    isSaga: false
                }
            },

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
            "value.hexagonalView":function () {
                this.validate()
            },
        },
        mounted: function () {
        },
        methods: {
            onMoveAction(){
                this.$super(Element).onMoveAction()
            },
            validate(executeRelateToValidate, panelValue) {
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                if(me.isPBCModel){
                    return;
                }

                // Common
                this.$super(Element).validate()

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




