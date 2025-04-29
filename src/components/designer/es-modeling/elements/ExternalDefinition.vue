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
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                :label.sync="namePanel"
                :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold','font-size': '16'
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-rect
                    v-if="movingElement"
                    :_style="{
                      'fill-r': 1,
                      'fill-cx': .1,
                      'fill-cy': .1,
                      'stroke-width': 1.4,
                      'stroke': '#ED73B6',
                      fill: '#ED73B6',
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
                      'stroke-width': 1.4,
                      'stroke': '#ED73B6',
                      fill: '#ED73B6',
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
                        :text="value.classReference ? value.classReference : '<< System >>'">
                </text-element>
                <image-element
                        v-if="showValidation"
                        v-bind:image="showValidationImg"
                        :sub-width="'20px'"
                        :sub-height="'20px'"
                        :sub-right="'5px'"
                        :sub-bottom="'5px'"
                >
                </image-element>
                <storming-sub-controller 
                    :type="value._type" 
                    :value="value"
                    :isReadOnly="!isEditElement">
                </storming-sub-controller>

                <sub-controller
                    :image="'chatgpt.png'"
                    @click="openAutoModeling"
                ></sub-controller>
            </sub-elements>
        </geometry-element>
        <external-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
        ></external-definition-panel>
    </div>
</template>
<script>
    import Element from './EventStormingModelElement'
    import ExternalDefinitionPanel from "../panels/ExternalDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    export default {
        mixins: [Element],
        name: 'external-definition',
        components:{
            ExternalDefinitionPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'storming-sub-controller' : StormingSubController
        },
        computed: {
            // showError() {
            //     var me = this
            //     if (me.value.name == '') {
            //         return 'Must have a name.'
            //     }
            //     return null
            // },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.External'
            },
            createNew(canvas, elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.External',
                    id: elementId,
                    name: '',
                    oldName: '',
                    displayName: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    namePlural: '',
                    description: null,
                    author: null,
                    aggregate: {},
                    boundedContext: {},
                    elementView: {
                        '_type': 'org.uengine.modeling.model.External',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 100,
                        'height': 100,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    controllerInfo: {
                        apiPath: '',
                        method: 'GET'
                    },
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
            // this.image = `${window.location.protocol + "//" + window.location.host}/static/image/event/external.png`
            if (!this.value.controllerInfo) {
                this.value.controllerInfo = {
                    apiPath: '',
                    method: 'GET'
                }
            }
        },
        watch: {
        },
        mounted: function () {
        },
        methods: {
            openAutoModeling(){
                let state = true
                this.$EventBus.$emit('state', state)
                this.canvas.openAutoModeling(this.value.name);
                
            },  
            // close(){
            //     this.closePanel()
            // },
            onMoveAction(){
                this.$super(Element).onMoveAction()
            },
            validate(executeRelateToValidate, panelValue) {
                var me = this
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value
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
