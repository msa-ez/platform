<template>
    <div>
        <v-row v-if="!generateDone" style="position:absolute; top:75px; right:35px; z-index:999;">
            <v-progress-circular
                    indeterminate
                    color="primary"
            ></v-progress-circular>
            <div style="margin:5px 0px 0px 5px;">Creating Aggregate... <v-btn @click="stop" text>stop</v-btn></div>
        </v-row>
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
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:dblclick="openPanel"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:rotateShape="onRotateShape"
                v-on:addedToGroup="onAddedToGroup"
                :label="getFieldDescriptors && !canvas.isHexagonal ? '': getNamePanel"
                :_style="{
                'label-angle':value.elementView.angle,
                'font-weight': 'bold', 'font-size': '16',
                }"
        >
            <!--v-on:dblclick="$refs['dialog'].open()"-->

            <sub-elements v-if="canvas.isHexagonal">
                <geometry-rect
                        :_style="{
                            'fill-r': 1,
                            'fill-cx': .1,
                            'fill-cy': .1,
                            'stroke-width': 1.4,
                            'stroke': '#000000',
                            'fill': '#FFFF00',
                            'fill-opacity': 1,
                            r: '1',
                            'z-index': '998'
                        }"
                ></geometry-rect>
            </sub-elements>

            <sub-elements v-else>
                <geometry-rect
                        v-if="movingElement"
                        :_style="{
                            'fill-r': 1,
                            'fill-cx': .1,
                            'fill-cy': .1,
                            'stroke-width': 1.4,
                            'stroke': '#F8D454',
                            fill: '#F8D454',
                            'fill-opacity': .3,
                            r: '1',
                        }"
                ></geometry-rect>

                <geometry-rect
                        v-else
                        :_style="{
                            'fill-r': 1,
                            'fill-cx': .1,
                            'fill-cy': .1,
                            'stroke-width': 1.4,
                            'stroke': '#F8D454',
                            fill: '#F8D454',
                            'fill-opacity': .5,
                            r: '1',
                        }"
                ></geometry-rect>
            </sub-elements>

            <sub-elements v-if="!canvas.isHexagonal" v-for="(index) in newEditUserImg.length">
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <geometry-point
                        :coordinate="[95,5]"
                        :_style="statusCompleteStyle">
                </geometry-point>

                <!--title-->
                <text-element
                        v-if="!canvas.isHexagonal"
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="value.classReference ? value.classReference : '<< Aggregate >>'">
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
                        :type="value._type"
                        :value="value"
                        :isReadOnly="!isEditElement"
                        :isHexagonal="canvas.isHexagonal"
                ></storming-sub-controller>

                <sub-controller
                        v-if="!canvas.isHexagonal"
                        :image="'layout_align.png'"
                        @click="autoLayout"
                ></sub-controller>

                <sub-controller
                        v-if="!canvas.isHexagonal"
                        :image="'modeling-view.png'"
                        @click.prevent.stop="openClassDiagram"
                ></sub-controller>

            </sub-elements>
        </geometry-element>


        <aggregate-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                :duplicatedFieldList="duplicatedFieldList"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
                @generateAggregate="generate"
                :generateDone.sync="generateDone"
                :generator="generator"
                :isPBCModel="isPBCModel"
        ></aggregate-definition-panel>

    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import AggregateDefinitionPanel from "../panels/AggregateDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import Generator from "../../modeling/generators/AggregateGenerator";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    import isAttached from "../../../../utils/isAttached";

    var changeCase = require('change-case');
    var _ = require('lodash')
    export default {
        mixins: [Element],
        name: 'aggregate-definition',
        props: {},
        components: {
            AggregateDefinitionPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'storming-sub-controller' : StormingSubController
        },
        watch: {
            "value.aggregateRoot": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false)
                    me.refreshImg()
                }, 200)
            },
        },
        computed: {
            subjectTop() {
                return 30
            },
            subjectHeight() {
                return 8
            },
            detailHeight() {
                var count = null
                if(this.value.elementView.height <= 270){
                    count = this.aggfieldDescriptorsCount
                } else if(this.value.elementView.height > 270){
                    count = this.value.aggregateRoot.fieldDescriptors.length
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
                if(this.canvas.isHexagonal){
                    return ' '
                }

                if (this.value.aggregateRoot.fieldDescriptors) {

                    if (this.value.aggregateRoot.fieldDescriptors.length == 1
                        && this.value.aggregateRoot.fieldDescriptors[0].name == 'id') {
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
                    this.aggfieldDescriptorsCount = y
                    if(this.value.aggregateRoot.fieldDescriptors.length > y){
                        for(var i = 0; i <= y; i++){
                            let fd = this.value.aggregateRoot.fieldDescriptors[i];
                            if(i == y) text = text + 'ㆍ ' + (fd.displayName ? fd.displayName : fd.name) + '  ...'
                            else text = text + 'ㆍ ' + (fd.displayName ? fd.displayName : fd.name) + '\n'
                        }
                    } else {
                        this.value.aggregateRoot.fieldDescriptors.forEach(function (field) {
                            text = text + 'ㆍ ' + (field.displayName ? field.displayName : field.name) + '\n'
                        })
                    }
                    return text
                }
                return null


            },
            className() {
                return 'org.uengine.modeling.model.Aggregate'
            },
            createNew(canvas, elementId, x, y, width, height, description, label, hexagonalX, hexagonalY) {
                return {
                    _type: 'org.uengine.modeling.model.Aggregate',
                    id: elementId,
                    name: '',
                    oldName: '',
                    namePlural: '',
                    namePascalCase: '',
                    nameCamelCase: '',
                    author: null,
                    description: null,
                    mirrorElement: null,
                    elementView: {
                        '_type': 'org.uengine.modeling.model.Aggregate',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 100,
                        'height': 100,
                        'style': JSON.stringify({})
                    },
                    hexagonalView:{
                        '_type': 'org.uengine.modeling.model.AggregateHexagonal',
                        'id': elementId,
                        'x': hexagonalX,
                        'y': hexagonalY,
                        'width': 150,
                        'height': 50,
                        'style': JSON.stringify({})
                    },
                    boundedContext: {},
                    aggregateRoot: {
                        _type: "org.uengine.modeling.model.AggregateRoot",
                        fieldDescriptors:[
                            {
                                _type: "org.uengine.model.FieldDescriptor",
                                name: "id",
                                className: "Long",
                                nameCamelCase: 'id',
                                namePascalCase: 'Id',
                                isKey: true
                            }
                        ],
                        entities: { 'elements': {}, 'relations': {} },
                        operations: [],
                    },
                    events: [],
                    commands: [],
                    visibility : 'public'
                }

            },

        },
        data: function () {
            return {
                aggfieldDescriptorsCount: 0,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
                // umlCanvas: null,
                generateDone: true,
                generator: null,
                originModel: null,
                duplicatedFieldList: [],
                input: {
                    description: '',
                    aggregate: {},
                    boundedContext: {},
                    model: {},
                },
            };
        },
        created: function () {
            var me = this

            me.init(); // generator

            if(me.value.aggregateRoot.fieldDescriptors == undefined) {
                me.value.aggregateRoot.fieldDescriptors = [
                    {
                        _type: "org.uengine.model.FieldDescriptor",
                        name: "id",
                        className: "Long",
                        nameCamelCase: 'id',
                        namePascalCase: 'Id',
                        isKey: true
                    }
                ]
            }

            if(me.value.aggregateRoot.entities == undefined) {
                me.value.aggregateRoot.entities =  { 'elements': {}, 'relations': {} }
            } else {
                if(me.value.aggregateRoot.entities.elements && Object.values(me.value.aggregateRoot.entities.elements).length > 0) {
                    Object.values(me.value.aggregateRoot.entities.elements).forEach(function(item) {
                        if(item) {
                            if(item.isVO) {
                                item._type = 'org.uengine.uml.model.vo.Class';
                            }
                        }
                    })
                }
            }
            if(me.value.aggregateRoot.operations) {
                me.value.aggregateRoot.operations.forEach(function(item) {
                    if(item.returnType == "") {
                        item.returnType = "void"
                    }
                })
            } else {
                me.value.aggregateRoot.operations = []
            }
        },
        mounted: function () {
            var me = this

            if(me.value.aggregateRoot.entities.elements) {
                Object.values(me.canvas.value.elements).forEach(function(el) {
                    if(me.canvas.validateElementFormat(el)) {
                        if(el._type.endsWith("Aggregate")
                            && el.boundedContext
                            && el.boundedContext.id == me.value.boundedContext.id
                            && Object.keys(me.value.aggregateRoot.entities.elements).length < 1) {
                            me.value.aggregateRoot.entities = el.aggregateRoot.entities;
                        }
                    }
                })
            }

            me.$EventBus.$on(`${me.value.elementView.id}`, function (obj) {
                // add relation
                if(obj.action == 'addRelation' &&
                    obj.element.relationView &&
                    obj.element.sourceElement &&
                    (obj.element.sourceElement.id == me.value.id ||
                        obj.element.sourceElement.elementView.id == me.value.elementView.id)
                ) {
                    var fieldDescriptors = Object.values(me.value.aggregateRoot.fieldDescriptors)
                    var isIncluded = fieldDescriptors.some((el) =>
                        el &&
                        el.isVO &&
                        el.namePascalCase == obj.element.targetElement.name + "Id"
                    )
                    if(!isIncluded) {
                        me.addAggRelation(obj.element)
                    } else {
                        var idx = fieldDescriptors.findIndex((attr) => attr.namePascalCase == obj.element.targetElement.name + "Id")

                        var keyField = fieldDescriptors.find((attr) => attr.isKey)
                        var compareKeyField = obj.element.targetElement.aggregateRoot.fieldDescriptors.find((attr) => attr.isKey)

                        if (keyField.name == compareKeyField.name) {
                            me.value.aggregateRoot.fieldDescriptors[idx].isOverrideField = true
                        } else {
                            me.value.aggregateRoot.fieldDescriptors[idx].isOverrideField = false
                        }
                    }

                }

                // delete relation
                if(obj.action == 'deleteRelation'
                    && obj.element.relationView
                    && obj.element.sourceElement
                    && obj.element.sourceElement.elementView.id == me.value.elementView.id
                ) {
                    me.deleteAggRelation(obj.element)
                }
            })

            this.setMirrorElementId()
        },
        methods: {
            init(){
                this.generator = new Generator(this);
                if(this.generateDone) {
                    this.originModel = JSON.parse(JSON.stringify(this.canvas.value));
                }
            },
            onModelCreated(model){
                if(model=="No setting boundedContext."){
                    this.generator.stop();
                }
                this.$EventBus.$emit('createAggregate', model, this.value);
            },
            async onGenerationFinished(model){
                this.generateDone = true;
                this.$emit('update:generateDone', true);
                this.$EventBus.$emit('createAggregate', model, this.value, this.originModel);
            },
            generate(){
                var me = this

                let parent = me.$parent;
                while(parent.$vnode.tag.indexOf('event-storming-model-canvas') == -1) parent = parent.$parent;

                let model = Object.assign([], parent.value)
                let boundedContext = null
                if(me.value && me.value.boundedContext){
                    boundedContext = model.elements[me.value.boundedContext.id]
                }

                me.input.aggregate = me.value
                me.input.boundedContext = boundedContext
                me.input.model = model
                me.input.description = me.value.description

                me.generator.generate();
                me.generateDone = false;
            },
            stop(){
                this.generator.stop()
                this.generateDone = true
            },
            onChangedElementName(newVal, oldVal){
                this.setMirrorElementId();
            },
            onMoveShape: function () {
                var me = this;
                if(me.canvas.isHexagonal && !me.canvas.isServerModel) {
                    me.refreshImg()
                }
            },
            addAggRelation(element) {
                var me = this;
                var toName = element.targetElement.name;

                var hasClassId = me.value.aggregateRoot.fieldDescriptors.some((field) =>
                    field.className.includes(changeCase.pascalCase(toName))
                );

                if(hasClassId){
                    return
                }

                var attr = {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "name": changeCase.camelCase(toName) + "Id",
                    "className": changeCase.pascalCase(toName) + "Id",
                    "isKey": false,
                    "namePascalCase": changeCase.pascalCase(toName) + "Id",
                    "nameCamelCase": changeCase.camelCase(toName) + "Id",
                    "isVO": true,
                    "label": "- "+ changeCase.camelCase(toName) + "Id: " + changeCase.pascalCase(toName) + "Id",
                    "referenceClass": changeCase.pascalCase(toName),
                    "isOverrideField": false,
                }
                var keyField = me.value.aggregateRoot.fieldDescriptors.find((attr) => attr.isKey)
                var compareKeyField = element.targetElement.aggregateRoot.fieldDescriptors.find((attr) => attr.isKey)

                if (keyField.name == compareKeyField.name) {
                    attr.isOverrideField = true
                }

                var isIncluded = me.value.aggregateRoot.fieldDescriptors.some((field) =>
                    field.className.includes(attr.className)
                );

                if(Object.values(me.value.aggregateRoot.entities).length == 0){
                    me.value.aggregateRoot.entities = {elements: {}, relation: {}}
                }

                if (Object.values(me.value.aggregateRoot.entities.elements).length > 0) {
                    isIncluded = Object.values(me.value.aggregateRoot.entities.elements).some((el) =>
                        el != null &&
                        el.referenceClass &&
                        el.referenceClass === changeCase.pascalCase(toName)
                    );
                }

                if(!isIncluded) {
                    me.value.aggregateRoot.fieldDescriptors.push(attr);
                }
            },
            deleteAggRelation(relation) {
                var me = this
                var aggField = relation.targetElement.name + "Id"

                var elementId;
                Object.values(me.value.aggregateRoot.entities.elements).forEach(function(el) {
                    if(el) {
                        if((el.isAggregateRoot || el.isVO) && aggField.includes(el.name)) {
                            elementId = el.elementView.id;
                        }
                    }
                })
                if(elementId
                    && me.value.aggregateRoot.entities.elements[elementId]
                    && !me.value.aggregateRoot.entities.elements[elementId].isAggregateRoot
                ) {
                    me.value.aggregateRoot.entities.elements[elementId] = null;
                }

                var relationId;
                Object.values(me.value.aggregateRoot.entities.relations).forEach(function(item) {
                    if(item) {
                        if(item.sourceElement.name == relation.sourceElement.name
                            && (item.targetElement.name == aggField
                                || item.targetElement.name == relation.targetElement.name)
                        ) {
                            relationId = item.relationView.id
                        }
                    }
                })
                if(relationId) {
                    me.value.aggregateRoot.entities.relations[relationId] = null;
                }

                var idx = -1;
                me.value.aggregateRoot.fieldDescriptors.forEach(function(attr, _idx) {
                    if(attr.className.includes(relation.targetElement.name)) {
                        idx = _idx
                    }
                })
                if(idx != -1) {
                    me.value.aggregateRoot.fieldDescriptors.splice(idx, 1);
                }
            },
            executeElementBeforeDestroy(){
                this.onMoveAction()
            },
            onMoveAction(executeRecursion){
                var me = this
                if( me.value.mirrorElement ) return;

                me.$super(Element).onMoveAction()

                //Attached Event
                if (me.canvas.attachedLists && me.canvas.attachedLists.eventLists) {
                    Object.values(me.canvas.attachedLists.eventLists).forEach(event => {
                        var eventComponent = me.canvas.$refs[`${event.elementView.id}`] ? me.canvas.$refs[`${event.elementView.id}`][0] : null
                        if (eventComponent) {
                            eventComponent.onMoveAction(true)
                        }
                    })
                }
                //Attached Command
                if (me.canvas.attachedLists && me.canvas.attachedLists.commandLists) {
                    Object.values(me.canvas.attachedLists.commandLists).forEach(command => {
                        var commandComponent = me.canvas.$refs[`${command.elementView.id}`] ? me.canvas.$refs[`${command.elementView.id}`][0] : null
                        if (commandComponent) {
                            commandComponent.onMoveAction(true)
                        }
                    });
                }

                if (me.canvas.attachedLists && me.canvas.attachedLists.boundedContextLists) {
                    Object.values(me.canvas.attachedLists.boundedContextLists).forEach(bc => {
                        var commandComponent = me.canvas.$refs[`${bc.elementView.id}`] ? me.canvas.$refs[`${bc.elementView.id}`][0] : null
                        if (commandComponent && !executeRecursion) {
                            commandComponent.onMoveAction(true)
                        }
                    });
                }
            },
            validate(executeRecursionValidate, panelValue){
                var me = this
                var notPK = false
                var duplicateField = false
                let recursionValidate = executeRecursionValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                this.$super(Element).validate()

                // execute Relate Validate ex) 자신의 element에서 다른 element의 validate 실행여부.
                if(recursionValidate) {
                    //Attached Event
                    if (me.canvas.attachedLists && me.canvas.attachedLists.eventLists) {
                        Object.values(me.canvas.attachedLists.eventLists).forEach(event => {
                            var eventComponent = me.canvas.$refs[`${event.elementView.id}`] ? me.canvas.$refs[`${event.elementView.id}`][0] : null
                            if (eventComponent) {
                                eventComponent.validate(false)
                            }
                        })
                    }
                    //Attached Command
                    if (me.canvas.attachedLists && me.canvas.attachedLists.commandLists) {
                        Object.values(me.canvas.attachedLists.commandLists).forEach(command => {
                            var commandComponent = me.canvas.$refs[`${command.elementView.id}`] ? me.canvas.$refs[`${command.elementView.id}`][0] : null
                            if (commandComponent) {
                                commandComponent.validate(false)
                            }
                        });
                    }
                }

                //Element
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


                notPK = validateValue.aggregateRoot.fieldDescriptors.findIndex(fieldDescriptor => ( fieldDescriptor.isKey == true) ) == -1

                let uniqueArray = _.uniqBy(validateValue.aggregateRoot.fieldDescriptors, 'name').map((attrA, index) => {
                    const originalElement = validateValue.aggregateRoot.fieldDescriptors.find(attrB => attrA.name && attrB.name && attrB.name.toLowerCase() == attrA.name.toLowerCase());
                    return originalElement;
                });

                if( uniqueArray.length != validateValue.aggregateRoot.fieldDescriptors.length ) {
                    duplicateField = true;
                }

                if(notPK){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_PK) )
                    if( validationResultIndex == -1 ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_NOT_PK))
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_NOT_PK))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }

                if(duplicateField){
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_DUPLICATE_FIELD) )
                    if( validationResultIndex == -1 ){
                        me.elementValidationResults.push(me.validationFromCode(me.ESE_DUPLICATE_FIELD))
                        me.duplicatedFieldList = me.getDuplicatedField(validateValue.aggregateRoot.fieldDescriptors);
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_DUPLICATE_FIELD))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                        me.duplicatedFieldList = me.getDuplicatedField(validateValue.aggregateRoot.fieldDescriptors);
                    }
                }

                me.canvas.changedTemplateCode = true
            },
            autoLayout() {
                var me = this;
                var cmdList = [];

                Object.values(me.canvas.value.elements).forEach(function(element) {
                    if(me.canvas.validateElementFormat(element)) {
                        if(element._type.endsWith("Command")) {

                            if (isAttached(me.value, element)) {
                                var isConnect = false
                                Object.values(me.canvas.value.relations).forEach(function(relation) {
                                    if(relation) {

                                        if(relation.sourceElement.elementView.id == element.elementView.id
                                            && relation.targetElement._type.endsWith("Event")
                                            && isAttached(me.value, relation.targetElement)
                                        ) {
                                            isConnect = true
                                            cmdList.push({
                                                "elId": element.elementView.id,
                                                "relationId": relation.relationView.id
                                            })
                                        }
                                    }
                                })
                                if(!isConnect) {
                                    cmdList.push({
                                        "elId": element.elementView.id,
                                    })
                                }
                            }
                        }
                    }
                })

                var aggEl = me.value.elementView;
                var aggY = aggEl.y+aggEl.height/2
                var cmdY = aggEl.y-aggEl.height/2+(cmdList.length-1)*90-40
                var distance = aggY > cmdY ? 90 : 80-((cmdY-aggY)/cmdList.length)
                cmdList.forEach(function(item, index) {
                    if(me.canvas.value.elements[item.elId]) {
                        me.canvas.value.elements[item.elId].elementView.x = aggEl.x - (aggEl.width - aggEl.width/10)
                        me.canvas.value.elements[item.elId].elementView.y = aggEl.y - aggEl.height / 2 + (index * distance)
                        me.canvas.value.elements[item.elId].elementView.width = 120
                        me.canvas.value.elements[item.elId].elementView.height = 80

                        if(item.relationId) {
                            var eventId = me.canvas.value.relations[item.relationId].targetElement.elementView.id
                            me.canvas.value.elements[eventId].elementView.x = aggEl.x + (aggEl.width - aggEl.width/10)
                            me.canvas.value.elements[eventId].elementView.y = me.canvas.value.elements[item.elId].elementView.y
                            me.canvas.value.elements[eventId].elementView.width = 120
                            me.canvas.value.elements[eventId].elementView.height = 80
                        }
                    }
                })
            },
            openClassDiagram() {
                var me = this;
                if (me.value.aggregateRoot.entities == undefined) {
                    me.value.aggregateRoot['entities'] = {'elements': {}, 'relations': {}}
                }
                
                me.setRootMethods();

                var umlValue = {
                    type: 'Domain Class Modeling',
                    aggId: me.value.elementView.id,
                    aggList: [JSON.parse(JSON.stringify(me.value))]
                };

                me.canvas.overlayText = 'Loading';
                me.canvas.openEmbeddedCanvas(umlValue);
            },
            setRootMethods() {
                var me = this;
                me.value.aggregateRoot.operations = [];
                
                Object.values(me.canvas.value.elements).forEach((element) => {
                    if (me.canvas.validateElementFormat(element) && element._type.endsWith("Command")) {

                        if (isAttached(me.value, element)) {
                            if(!element.isRestRepository && element.name) {
                                var method = {
                                    "name": element.name,
                                    "class": me.value.name,
                                    "returnType": "void",
                                    "parameters": [],
                                    "label": '+ ' + element.name + "(): void",
                                    "isOverride": false,
                                    "isRootMethod": false,
                                }
                                if(me.value.aggregateRoot.operations.length > 0) {
                                    me.value.aggregateRoot.operations.forEach(function(item, idx) {
                                        if(item.name == method.name) {
                                            item.isRootMethod = true
                                            method.isRootMethod = true
                                        }
                                    })
                                    if(!method.isRootMethod) {
                                        method.isRootMethod = true
                                        me.value.aggregateRoot.operations.push(method)
                                    }
                                } else {
                                    me.value.aggregateRoot.operations.push(method)
                                }
                            }
                        }
                    }
                })
                // me.copyValue = me.value;
            },
            getComponent(componentName) {
                let component = null
                let parent = this.$parent
                while (parent && !component) {
                    if (parent.$options.name === componentName) {
                        component = parent
                    }
                    parent = parent.$parent
                }
                return component
            },
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">
    .discStyle {
        list-style-type: disc;
    }
</style>

