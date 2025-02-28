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
                'label-angle':elementCoordinate.angle,
                'font-weight': 'bold', 'font-size': '16',
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->
            <geometry-circle
                    v-if="canvas.isHexagonal"
                    :center="[50,50]"
                    :radius="50"
                    :_style="{
                        'stroke-width': 20,
                        'stroke': '#F1A746',
                        'fill': '#F1A746',
                        'fill-opacity': 1,
                        'r': '1',
                        'z-index': '998'
                    }"
            ></geometry-circle>
            <sub-elements v-if="canvas.isHexagonal">
                <text-element
                        :sub-top="'-20px'"
                        :sub-right="'100%'"
                        :sub-width="150"
                        :text="getNamePanel"
                        :subStyle="{
                            'font-color': '#F1A746',
                            'font-weight': 'bold',
                            'font-size': '16',
                            'text-anchor': 'end',
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
                    'stroke-width': 0,
                    'stroke': '#F1A746',
                    'fill': '#F1A746',
                    'fill-opacity': .5,
                    'r': '1',
                    'z-index': '998'
                }"
            ></geometry-rect>
            <geometry-rect
                    v-if="!movingElement && !canvas.isHexagonal"
                    :_style="{
                    'fill-r': 1,
                    'fill-cx': .1,
                    'fill-cy': .1,
                    'stroke-width': isProgress ? 5 : 1.4,
                    'stroke': isProgress ? progressColor : '#F1A746',
                    'fill': '#F1A746',
                    'fill-opacity': 1,
                    'r': '1',
                    'z-index': '998'
                }"
            ></geometry-rect>

            <sub-elements v-if="!canvas.isHexagonal">
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <rectangle-element
                    v-if="isProgress"
                    :sub-width="25"
                    :sub-height="25"
                    :sub-top="0"
                    :sub-left="0"
                    :sub-style="{
                        'font-size': '15', 
                        'font-weight': 'bold',
                        'font-color': '#ffffff',
                        'stroke': progressColor,
                        'fill': progressColor,
                        'fill-opacity': 1
                    }"
                    :label.sync="progressEventSequence"
                ></rectangle-element>

                <image-element
                        v-if="isProgress && isFailedEvent"
                        v-bind:image="alert_image"
                        :sub-width="25"
                        :sub-height="25"
                        :sub-bottom="0"
                        :sub-right="0"
                ></image-element>

                <geometry-point
                        :coordinate="[95,5]"
                        :_style="statusCompleteStyle">
                </geometry-point>

                <text-element
                        v-if="!canvas.isHexagonal"
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="value.classReference ? value.classReference : '<< Event >>'">
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

                <!--                <geometry-line :from="getLineFromTo.from" :to="getLineFromTo.to"></geometry-line>-->

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
                :selectable="selectable"
                :x.sync="elementCoordinate.x-elementCoordinate.subWidth*0.5"
                :y.sync="elementCoordinate.y"
                :width="elementCoordinate.subWidth"
                :height="10"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                :_style="{
                    'stroke': '#F1A746',
                    'fill': '#F1A746',
                    'fill-opacity': 1,
                    'z-index': '998',
                }"
        ></rectangle-element>

        <domain-event-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
                :isPBCModel="isPBCModel"
                :useMonitoring="useMonitoring"
        ></domain-event-definition-panel>

    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import DomainEventDefinitionPanel from "../panels/DomainEventDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    var _ = require('lodash')
    export default {
        mixins: [Element],
        name: 'domain-event-definition',
        components: {
            DomainEventDefinitionPanel,
            'storming-sub-controller' : StormingSubController,
            'multi-user-status-indicator': MultiUserStatusIndicator
        },
        computed: {
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
                let detailCnt = 0
                if(this.value.elementView.height <= 270){
                    detailCnt = this.availableFieldCount
                } else if(this.value.elementView.height > 270){
                    detailCnt = this.value.fieldDescriptors.length
                }
                return detailCnt;

                // return this.subjectHeight + (detailCnt * 5)
            },
            detailLeft() {
                var width = this.elementCoordinate.width * 0.1
                return width
            },
            detailTop() {
                let baseTop = 7;
                let centerPoint = (this.value.elementView.height / 2);
                let innerHeight = (this.value.elementView.height - (this.subjectTop + this.subjectHeight)) / 2 
                let fieldHalfHeight = this.fieldHeight * this.detailHeight / 2 
                let centerAndInnerMargin = centerPoint - innerHeight
                let centerAndFieldMargin = centerPoint - fieldHalfHeight

                if( centerAndInnerMargin * 2 < centerAndFieldMargin && centerAndFieldMargin > 0 ){
                    // return baseTop + centerPoint - centerAndFieldMargin
                    let calH = baseTop + centerPoint - centerAndFieldMargin;
                    let baseH = fieldHalfHeight + this.subjectTop+ this.subjectHeight
                    return baseH > calH ? baseH : calH
                } 
                return baseTop + centerPoint

                // return this.subjectTop + this.detailHeight
            },
            getFieldDescriptors() {
                if (this.value.fieldDescriptors) {
                    if (this.value.fieldDescriptors.length == 1
                        && this.value.fieldDescriptors[0].name == 'id') {
                        return false
                    }
                    const prefix = 'ㆍ '
                    let text = ''

                    if(this.value.elementView.height <= 100){
                        this.fieldHeight = 42
                    } else if(this.value.elementView.height <= 150){
                        this.fieldHeight = 30
                    } else if(this.value.elementView.height <= 270){
                        this.fieldHeight = 23
                    } else if(this.value.elementView.height > 270){
                        this.fieldHeight = 17
                    }
                    
                    this.availableFieldCount = Math.ceil(this.value.elementView.height/this.fieldHeight) - 2 ;
                    if(this.value.fieldDescriptors.length > this.availableFieldCount){
                        for(var i = 0; i <= this.availableFieldCount; i++){
                            let fd = this.value.fieldDescriptors[i];
                            if(i == this.availableFieldCount) text = `${text}${prefix} ${fd.name} ...`
                            else text = `${text}${prefix} ${fd.name}` + '\n'
                        }
                    } else {
                        this.value.fieldDescriptors.forEach(function (fd) {
                            text = `${text}${prefix} ${fd.name}` + '\n'
                        })
                    }
                    return text

                }
                return null
            },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.Event'
            },
            createNew(canvas, elementId, x, y, width, height, description, label, hexagonalX, hexagonalY) {
                return {
                    _type: 'org.uengine.modeling.model.Event',
                    id: elementId,
                    visibility : 'public',
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
                    fieldDescriptors: [
                        {
                            _type: "org.uengine.model.FieldDescriptor",
                            name: "id",
                            className: "Long",
                            nameCamelCase: 'id',
                            namePascalCase: 'Id',
                            isKey: true
                        }
                    ],
                    mirrorElement: null,
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Event',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 100,
                        'height': 100,
                        'style': JSON.stringify({}),
                        'angle': 0,
                    },
                    hexagonalView:{
                        '_type': 'org.uengine.modeling.model.EventHexagonal',
                        'id': elementId,
                        'x': hexagonalX,
                        'y': hexagonalY,
                        'subWidth': 100,
                        'width': 20,
                        'height': 20,
                        'style': JSON.stringify({})
                    },
                    alertURL: location.pathname + ((location.pathname == '/' || location.pathname.lastIndexOf('/') > 0) ? '' : '/') + 'static/image/symbol/alert-icon.png',
                    checkAlert: true,
                    relationPolicyInfo: [],
                    relationCommandInfo: [],
                    trigger: '@PostPersist',
                }
            },

        },
        data: function () {
            return {
                fieldHeight: 17,
                availableFieldCount: 0,
                eventfieldDescriptorsCount: 0,
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
                useMonitoring: false
            };
        },
        watch: {
            "value.fieldDescriptors": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false)
                    me.refreshImg()
                }, 200)
            },
            "value.hexagonalView":function (newVal) {
                this.validate()
            },
        },
        mounted() {
            this.setMirrorElementId()
            this.useMonitoring = this.canvas.useMonitoring
        },
        methods: {
            openPanel() {
                this.useMonitoring = this.canvas.useMonitoring
                if(this.propertyPanel) {
                    this.propertyPanel = false
                }
                this.propertyPanel = true
                this.staySelected = false
                this.validate();
            },
            onChangedElementName(newVal, oldVal){
                this.setMirrorElementId();
            },
            onMoveAction(executeRecursion){
                var me = this
                if( me.canvas.isReplay ) return;
                if( me.value.mirrorElement ) return;

                // Common
                me.$super(Element).onMoveAction()

                let attachedAggregate = me.canvas.getAttachedAggregate(me.value);
                if(attachedAggregate){
                    var newId = attachedAggregate.elementView.id

                    // 움직일때 AGG 변화 파악.
                    if(!me.value.aggregate || !me.value.aggregate.id || (me.value.aggregate.id != newId)){
                        // 서로 들다른 agg
                        me.value.aggregate = { id: newId };

                        if(me.canvas.initLoad && !me.canvas.isRendering) {
                            // me.canvas.changedByMe = true;
                            me.canvas.changedTemplateCode = true
                        }
                    }
                } else if(me.value.aggregate && me.value.aggregate.id){
                    me.value.aggregate = {};
                    if(me.canvas.initLoad && !me.canvas.isRendering) {
                        // me.canvas.changedByMe = true;
                        me.canvas.changedTemplateCode = true
                    }
                }
            },
            validate(executeRecursionValidate, panelValue){
                var me = this
                if( me.canvas.isReplay ) return;
                var notPK = false
                var duplicateField = false
                let recursionValidate = executeRecursionValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value
                var notCorrelationKey = false;

                if(me.isPBCModel){
                    return;
                }

                // Common
                this.$super(Element).validate()

                // execute Relate Validate ex) 자신의 element 에서 다른 element의 validate 실행여부.
                if(recursionValidate) {

                }

                // Element
                let attachedAggregate = me.canvas.getAttachedAggregate(me.value);
                if(attachedAggregate){
                    // validationResults
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

                // name Validation
                if(validateValue.name){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_NAME) )
                    if( validationResultIndex == -1 ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_NAME))
                    }
                }

                if(validateValue && validateValue.fieldDescriptors){
                    notPK =  validateValue.fieldDescriptors.findIndex(fieldDescriptor => ( fieldDescriptor.isKey == true) ) == -1
                    var filteredArray = validateValue.fieldDescriptors.filter(function(fieldDescriptor,index){
                        const fRules = (element,idx) =>element.name &&  fieldDescriptor.name && element.name.toLowerCase() == fieldDescriptor.name.toLowerCase()
                            && idx != index ;
                        return validateValue.fieldDescriptors.findIndex(fRules) == -1 ? false: true
                    })

                    if (me.useMonitoring) {
                        notCorrelationKey = validateValue.fieldDescriptors.findIndex(fieldDescriptor => ( fieldDescriptor.isCorrelationKey == true) ) == -1
                        if (notCorrelationKey) {
                            var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_CORRELATION_KEY) )
                            if( validationResultIndex == -1 ) {
                                me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_CORRELATION_KEY))
                            }
                        } else {
                            var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_CORRELATION_KEY) )
                            if( validationResultIndex != -1 ){
                                me.elementValidationResults.splice(validationResultIndex,1)
                            }
                        }
                    }
                    

                    if(filteredArray.length != 0 ){
                        duplicateField = true
                    }
                }


                if(duplicateField){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_DUPLICATE_FIELD) )
                    if( validationResultIndex == -1 ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_DUPLICATE_FIELD))
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_DUPLICATE_FIELD))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }

            },

        }
    }
</script>




