<template>
    <!--    <div>-->
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
                :customMoveActionExist="canvas.isCustomMoveExist && !isPBCModel"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                :label="getFieldDescriptors || canvas.isHexagonal ? '': getNamePanel"
                :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold','font-size': '16'
                }"
        >
            <geometry-circle
                    v-if="canvas.isHexagonal"
                    :center="[50,50]"
                    :radius="50"
                    :_style="{
                        'stroke-width': 20,
                        'stroke': '#5099F7',
                        'fill': '#5099F7',
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
                            'font-color': '#5099F7',
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
                        'stroke': '#5099F7',
                        fill: '#5099F7',
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
                        'stroke': '#5099F7',
                        fill: '#5099F7',
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
                <image-element
                        v-if="value.mirrorElement"
                        v-bind:image="isProjectConnecting ? link_image : link_off_image"
                        :sub-width="'10px'"
                        :sub-height="'10px'"
                        :sub-left="'3px'"
                        :sub-top="'3px'"
                >
                </image-element>

                <text-element
                        v-if="!canvas.isHexagonal"
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="value.classReference ? value.classReference : '<< Command >>'">
                </text-element>

                <text-element
                        class="discStyle"
                        v-if="getFieldDescriptors && !canvas.isHexagonal"
                        :sub-width="'120%'"
                        :sub-height="detailHeight"
                        :sub-top="detailTop"
                        :sub-left="detailLeft"
                        :subStyle="{'font-size': '12px', 'text-anchor':'start'}"
                        :text="getFieldDescriptors">
                </text-element>

                <text-element
                        v-if="getFieldDescriptors && !canvas.isHexagonal"
                        :sub-width="'100%'"
                        :sub-height="subjectHeight"
                        :sub-top="subjectTop"
                        :sub-left="0"
                        :subStyle="{'font-size': '16px', 'font-weight': 'bold'}"
                        :text="getNamePanel">
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
                :selectable="!movingElement"
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
                    'stroke': '#5099F7',
                    'fill': '#5099F7',
                    'fill-opacity': 1,
                    'z-index': '998',
                }"
        ></rectangle-element>

        <command-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                :entities="entities"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
                :isPBCModel="isPBCModel"
        ></command-definition-panel>
    </div>
</template>

<script>
    import Element from "./EventStormingModelElement";
    import SubElements from "../../../opengraph/shape/SubElements";
    import CommandDefinitionPanel from "../panels/CommandDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import isAttached from '../../../../utils/isAttached';
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    var _ = require('lodash')
    export default {
        mixins: [Element],
        name: 'command-definition',
        components:{
            SubElements,
            CommandDefinitionPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'storming-sub-controller' : StormingSubController
        },
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.Command'
            },
            // elementPrefix(){
            //     var me = this
            //     if(me.copyValue.isRestRepository){
            //         return null
            //     }else{
            //         if(me.copyValue && me.copyValue.aggregate.name){
            //             var aggName = me.copyValue.aggregate.name
            //             return `/${pluralize(changeCase.camelCase(aggName))}/{id}/`;
            //         }else{
            //             return '/{ Aggregate }/{id}/'
            //         }
            //     }
            // },
            subjectTop() {
                if(this.canvas.isHexagonal) {
                    return 13
                }
                return 30
            },
            subjectHeight() {
                return 8
            },
            detailHeight() {
                var count = null
                if(this.value.elementView.height <= 270){
                    count = this.commandfieldDescriptorsCount
                } else if(this.value.elementView.height > 270){
                    count = this.value.fieldDescriptors.length
                }
                return this.subjectHeight + (count * 5)
            },
            detailLeft() {
                var width = this.value.elementView.width * 0.1
                return width
            },
            detailTop() {
                return this.subjectTop + this.detailHeight
            },
            getFieldDescriptors() {

                if (this.value.fieldDescriptors) {
                    if (this.value.fieldDescriptors.length == 1
                        && this.value.fieldDescriptors[0].name == 'id') {
                        return false
                    }

                    var text = ''
                    var value = 0
                    if(this.value.elementView.height <= 100){
                        value = 42
                    } else if(this.value.elementView.height <= 150){
                        value = 30
                    } else if(this.value.elementView.height <= 270){
                        value = 23
                    } else if(this.value.elementView.height > 270){
                        value = 17
                    }
                    var y = Math.ceil(this.value.elementView.height/value)
                    this.commandfieldDescriptorsCount = y
                    if(this.value.fieldDescriptors.length > y){
                        for(var i = 0; i <= y; i++){
                            if(i == y) text = text + 'ㆍ ' + this.value.fieldDescriptors[i].name + '  ...'
                            else text = text + 'ㆍ ' + this.value.fieldDescriptors[i].name + '\n'
                        }
                    } else {
                        this.value.fieldDescriptors.forEach(function (field) {
                            text = text + 'ㆍ ' + field.name + '\n'
                        })
                    }
                    return text

                }
                return null
            },
            createNew(canvas, elementId, x, y, width, height, description, label, hexagonalX, hexagonalY) {
                return {
                    _type: 'org.uengine.modeling.model.Command',
                    id: elementId,
                    name: '',
                    oldName: '',
                    namePlural: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    description: null,
                    author: null,
                    aggregate: {},
                    boundedContext: {},
                    mirrorElement: null,
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Command',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({}),
                        'z-index': 999
                    },
                    hexagonalView:{
                        '_type': 'org.uengine.modeling.model.CommandHexagonal',
                        'id': elementId,
                        'x': hexagonalX,
                        'y': hexagonalY,
                        'subWidth': 100,
                        'width': 20,
                        'height': 20,
                        'style': JSON.stringify({})
                    },
                    //new pannel
                    isRestRepository: true,
                    controllerInfo: {
                        apiPath: '',
                        method: 'PUT'
                    },
                    restRepositoryInfo: {
                        method: 'POST'
                    },
                    relationEventInfo: [],
                    relationCommandInfo: [],
                    trigger: '@PostPersist',
                    fieldDescriptors: [],
                    visibility : 'public'
                }
            }
        },
        data: function () {
            return {
                commandfieldDescriptorsCount: 0,
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,

                entities: {},
            };
        },
        watch: {
            "value.restRepositoryInfo.method": function (newVal) {
                // Command 가 POST 면 PrePersist, DELETE 면  PreRemove, PATCH 면 PreUpdate
                if (newVal == "POST") {
                    this.value.trigger = "@PrePersist"
                } else if (newVal == "DELETE") {
                    this.value.trigger = "@PreRemove"
                } else if (newVal == "PATCH") {
                    this.value.trigger = "@PreUpdate"
                }
                this.validate()
            },
            "value.controllerInfo.apiPath":function () {
                this.validate()
            },
            "value.hexagonalView":function () {
                this.validate()
            },
            "value.fieldDescriptors": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate()
                    me.refreshImg()
                }, 200)
            },
        },
        methods: {
            onChangedElementName(newVal, oldVal){
                this.setMirrorElementId();
            },
            setMirrorElementId(){
                var me = this
                // already connected.
                if(me.value.mirrorElement ) return;
                if(!me.value.name) return;

                let connected = Object.values(me.canvas.mirrorValue.elements)
                    .find(ele =>
                        ele
                        && me.canvas.validateElementFormat(ele)
                        && ele._type == me.value._type  // equals type.
                        && ele.id != me.value.elementView.id // myself x
                        && ele.mirrorElement == me.value.elementView.id // connected element before
                    )

                if( connected ) return;

                let equalsElements = Object.values(me.canvas.mirrorValue.elements)
                    .filter(ele =>
                        ele
                        && ele._type == me.value._type  // equals type.
                        && ele.name
                        && ele.name.toLowerCase() == me.value.name.toLowerCase() // equals name
                        && ele.elementView.id != me.value.elementView.id // myself x
                        && !ele.mirrorElement // connected element x
                        && !me.canvas.value.elements[ele.elementView.id] // mine project
                    )

                if( equalsElements.length == 0 ) return;

                if( equalsElements.length == 1 ) {
                    me.value.mirrorElement = equalsElements[0].elementView.id;
                } else {
                    me.canvas.openSelectionMirrorElement(me, equalsElements);
                }
            },
            onMoveAction(executeRecursion){
                var me = this
                if(me.value.mirrorElement ) return;
                if(me.isPBCModel) return;


                me.$super(Element).onMoveAction()

                let attachedAggregate = me.canvas.getAttachedAggregate(me.value);
                if(attachedAggregate){
                    var newId = attachedAggregate.elementView.id

                    // 움직일때 AGG 변화 파악.
                    if( me.value.aggregate.id != newId ){
                        // 서로 들다른 agg
                        me.value.aggregate = { id: newId }
                        if(me.canvas.initLoad) {
                            me.canvas.changedByMe = true;
                            me.canvas.changedTemplateCode = true
                        }
                    }

                }else if(!me.value.aggregate || me.value.aggregate.id){
                    me.value.aggregate = {};
                    if(me.canvas.initLoad) me.canvas.changedByMe = true;
                }

            },
            validate(executeRecursionValidate, panelValue){
                var me = this
                let recursionValidate = executeRecursionValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                if(me.isPBCModel) return;


                // Common
                this.$super(Element).validate()

                // Element
                let attachedAggregate = me.canvas.getAttachedAggregate(me.value);
                if(attachedAggregate){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_AGG))
                    var isExistValidationResult = validationResultIndex == -1 ? false: true
                    if( isExistValidationResult ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }else{
                    // validationResults
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_AGG) )
                    var isExistValidationResult = validationResultIndex == -1 ? false: true
                    if( !isExistValidationResult ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_AGG))
                    }
                }


                // // execute Relate Validate ex) 자신의 element에서 다른 element의 validate 실행여부.
                if(recursionValidate) {
                    // related to Aggregate
                    var componentRefs = me.value.aggregate.id ? me.canvas.$refs[me.value.aggregate.id] : null
                    if (componentRefs && componentRefs[0]) {
                        componentRefs[0].validate()
                    }
                }

                if(me.canvas.attachedLists && me.canvas.attachedLists.commandLists){
                    let sameAggregate = Object.values(me.canvas.attachedLists.commandLists).find(function(command) {
                        if(attachedAggregate && command.elementView.id != validateValue.elementView.id && isAttached(attachedAggregate, command)){
                            if(command.isRestRepository && validateValue.isRestRepository && (command.restRepositoryInfo.method == validateValue.restRepositoryInfo.method)){
                                return true;
                            }
                        }
                    });

                    if(sameAggregate){
                        var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_DUPLICATE_METHOD) )
                        var isExistValidationResult = validationResultIndex == -1 ? false: true
                        if( !isExistValidationResult ){
                            let codeObj = me.validationFromCode(me.ESE_DUPLICATE_METHOD);
                            codeObj.msg = `There should be only one "${validateValue.restRepositoryInfo.method}" of default methods.`;
                            me.elementValidationResults.push(codeObj)
                        }
                    } else  {
                        var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_DUPLICATE_METHOD))
                        var isExistValidationResult = validationResultIndex == -1 ? false: true
                        if( isExistValidationResult ){
                            me.elementValidationResults.splice(validationResultIndex,1)
                        }
                    }
                }

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


                if( !validateValue.isRestRepository && validateValue.controllerInfo.apiPath ){
                    // ESE_NOT_API_SPACING
                    var pattern = /\s/g;   // 공백 체크 정규표현식 - 탭, 스페이스
                    var specialPattern = /[`~!@#$%^&*|\\\'\";:?]/gi; // 특수 문제 체크 정규표현식
                    if( validateValue.controllerInfo.apiPath.match(pattern) ||  specialPattern.test(validateValue.controllerInfo.apiPath)){
                        var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_API_PATH_ERROR) )
                        if( validationResultIndex == -1 ){
                            me.elementValidationResults.push(me.validationFromCode(me.ESE_API_PATH_ERROR))
                        }
                    }else{
                        var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_API_PATH_ERROR))
                        if( validationResultIndex != -1 ){
                            me.elementValidationResults.splice(validationResultIndex,1)
                        }
                    }
                }else if(validateValue.isRestRepository){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_API_PATH_ERROR))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }

            }
        }
    }
</script>




<style scoped lang="scss" rel="stylesheet/scss">
    .panel-title {
        font-size: 25px;
        color: #757575;
    }
</style>