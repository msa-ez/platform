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
                :label="getFieldDescriptors || getQueryParameterDescriptors ? '': getNamePanel"
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
                        'stroke': '#5FC08B',
                        fill: '#5FC08B',
                        'fill-opacity': .5,
                        r: '1'
                    }"
            ></geometry-rect>

            <geometry-rect
                    v-else
                    :_style="{
                        'fill-r': 1,
                        'fill-cx': .1,
                        'fill-cy': .1,
                        'stroke-width': 1.4,
                        'stroke': '#5FC08B',
                        fill: '#5FC08B',
                        'fill-opacity': 1,
                        r: '1'
                    }"
            ></geometry-rect>

            <sub-elements>
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>

            <sub-elements>
                <geometry-point
                        :coordinate="[95,5]"
                        :_style="statusCompleteStyle"
                ></geometry-point>

                <!--title-->
                <text-element
                        :sub-width="'100%'"
                        :sub-height="titleH"
                        :sub-top="0"
                        :sub-left="0"
                        :text="value.classReference ? value.classReference : '<< ReadModel >>'">
                </text-element>

                <text-element
                        v-if="value.dataProjection == 'query-for-aggregate' && getQueryParameterDescriptors && !value.queryOption.useDefaultUri && value.queryOption.apiPath"
                        :sub-width="'100%'"
                        :sub-height="subjectHeight"
                        :sub-top="subjectTop"
                        :sub-left="0"
                        :subStyle="{'font-size': '16px', 'font-weight': 'bold'}"
                        :text="value.queryOption.apiPath"
                ></text-element>

                <text-element
                        v-else-if="value.dataProjection == 'query-for-aggregate' && getQueryParameterDescriptors && !value.queryOption.useDefaultUri && !value.queryOption.apiPath"
                        :sub-width="'100%'"
                        :sub-height="subjectHeight"
                        :sub-top="subjectTop"
                        :sub-left="0"
                        :subStyle="{'font-size': '16px', 'font-weight': 'bold'}"
                        :text="getNamePanel"
                ></text-element>

                <text-element
                        v-else-if="value.dataProjection == 'query-for-aggregate' && getQueryParameterDescriptors && value.queryOption.useDefaultUri"
                        :sub-width="'100%'"
                        :sub-height="subjectHeight"
                        :sub-top="subjectTop"
                        :sub-left="0"
                        :subStyle="{'font-size': '16px', 'font-weight': 'bold'}"
                        :text="getNamePanel"
                ></text-element>

                <text-element
                        v-else-if="(value.dataProjection == 'cqrs' || value.dataProjection == 'query-for-multiple-aggregate') && getFieldDescriptors"
                        :sub-width="'100%'"
                        :sub-height="subjectHeight"
                        :sub-top="subjectTop"
                        :sub-left="0"
                        :subStyle="{'font-size': '16px', 'font-weight': 'bold'}"
                        :text="getNamePanel"
                ></text-element>

                <text-element
                        class="discStyle"
                        v-if="getFieldDescriptors && (value.dataProjection == 'cqrs' || value.dataProjection == 'query-for-multiple-aggregate')"
                        :sub-width="'120%'"
                        :sub-height="detailHeight"
                        :sub-top="detailTop"
                        :sub-left="detailLeft"
                        :subStyle="{'font-size': '12px', 'text-anchor':'start'}"
                        :text="getFieldDescriptors"
                ></text-element>

                <text-element
                        class="discStyle"
                        v-if="getFieldDescriptors && value.dataProjection == 'query-for-multiple-aggregate'"
                        :sub-width="'120%'"
                        :sub-height="detailHeight"
                        :sub-top="detailTop"
                        :sub-left="detailLeft"
                        :subStyle="{'font-size': '12px', 'text-anchor':'start'}"
                        :text="getFieldDescriptors"
                ></text-element>

                <text-element
                        class="discStyle"
                        v-if="getQueryParameterDescriptors && value.dataProjection == 'query-for-aggregate'"
                        :sub-width="'120%'"
                        :sub-height="detailHeight"
                        :sub-top="detailTop"
                        :sub-left="detailLeft"
                        :subStyle="{'font-size': '12px', 'text-anchor':'start'}"
                        :text="getQueryParameterDescriptors"
                ></text-element>

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

        <view-definition-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
                :generateDone.sync="generateDone"
                :generator="generator"
                :isPBCModel="isPBCModel"
        ></view-definition-panel>

    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import ViewDefinitionPanel from "../panels/ViewDefinitionPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import Generator from "../../modeling/generators/ReadModelGenerator";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    
    export default {
        mixins: [Element],
        name: 'view-definition',
        components:{
            ViewDefinitionPanel,
            'storming-sub-controller' : StormingSubController,
            'multi-user-status-indicator': MultiUserStatusIndicator,
        },
        computed: {
            subjectTop() {
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
                var width = this.value.elementView.width * 0.1
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
            getQueryParameterDescriptors() {
                if (this.value.queryParameters) {
                    if (this.value.queryParameters.length == 1
                        && this.value.queryParameters[0].name == 'id') {
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
                    this.viewfieldDescriptorsCount = y
                    if(this.value.queryParameters.length > y){
                        for(var i = 0; i <= y; i++){
                            if(i == y) text = text + 'ㆍ ' + this.value.queryParameters[i].name + '  ...'
                            else text = text + 'ㆍ ' + this.value.queryParameters[i].name + '\n'
                        }
                    } else {
                        this.value.queryParameters.forEach(function (field) {
                            text = text + 'ㆍ ' + field.name + '\n'
                        })
                    }
                    return text

                }
                return null
            },
            // showError() {
            //     var me = this
            //     if (me.value.name == '' && !me.attachedBoundedContext) {
            //         return 'Element must be in a Bounded Context and Must have a name.'
            //     } else if (me.value.name == '') {
            //         return 'Must have a name.'
            //     } else if (!me.attachedBoundedContext) {
            //         return 'Element must be in a Bounded Context.'
            //     }
            //     return null
            // },
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.View'
            },
            createNew(canvas, elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.View',
                    id: elementId,
                    visibility : 'public',
                    name: '',
                    oldName: '',
                    displayName: '',
                    namePascalCase: '',
                    namePlural: '',
                    aggregate: {},
                    description: null,
                    author: null,
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
                    queryParameters:[],
                    queryOption:{
                        apiPath: "",
                        useDefaultUri: true,
                        multipleResult: false
                    },
                    controllerInfo: {url:""},
                    elementView: {
                        '_type': 'org.uengine.modeling.model.View',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': width,
                        'height': height,
                        'style': JSON.stringify({})
                    },
                    editingView: false,
                    dataProjection: 'cqrs',
                    createRules: [
                        {
                            _type: 'viewStoreRule',
                            operation: 'CREATE',
                            when: null,
                            fieldMapping: [{"viewField": null, "eventField": null}],
                            where: [{"viewField": null, "eventField": null}],
                        }
                    ],
                    updateRules: [
                        {
                            _type: 'viewStoreRule',
                            operation: 'UPDATE',
                            when: null,
                            fieldMapping: [{"viewField": null, "eventField": null}],
                            where: [{"viewField": null, "eventField": null}],
                        }
                    ],
                    deleteRules: [
                        {
                            _type: 'viewStoreRule',
                            operation: 'DELETE',
                            when: null,
                            fieldMapping: [{"viewField": null, "eventField": null}],
                            where: [{"viewField": null, "eventField": null}],
                        }
                    ],
                }
            },
            input(){
                let parent = this.$parent;
                while(parent.$vnode.tag.indexOf('event-storming-model-canvas') == -1) parent = parent.$parent;

                let model = Object.assign([], parent.value)

                return{
                    description: this.value.description,
                    value: this.value,
                    model: model,
                }
            },
        },
        data: function () {
            return {
                fieldHeight: 17,
                availableFieldCount: 0,
                viewfieldDescriptorsCount: 0,
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,
                generateDone: true,
                generator: null,
            };
        },
        created: function () {
            var me = this;
            // this.image = `${window.location.protocol + "//" + window.location.host}/static/image/event/view.png`
            me.init(); // generator
        },
        watch: {
            "value.fieldDescriptors": {
                deep: true,
                handler: _.debounce(function (newVal, oldVal) {
                    var me = this
                    me.validate(false, null)
                    me.refreshImg()
                }, 200)
            },
        },
        mounted: function () {
        },
        methods: {
            init(){
                this.generator = new Generator(this);
            },
            onModelCreated(model){
                this.$EventBus.$emit('onModelCreated', model);
            },
            async onGenerationFinished(model){
                this.generateDone = true;
                this.$emit('update:generateDone', true);
            },
            generate(){
                this.generator.generate();
                this.generateDone = false;
            },
            stop(){
                this.generator.stop()
                this.generateDone = true
            },
            // close(){
            //     this.closePanel()
            // },
            onMoveAction(){
                var me = this
                if(me.value.mirrorElement ) return;
                if(me.isPBCModel) return;

                this.$super(Element).onMoveAction()

                let attachedAggregate = me.canvas.getAttachedAggregate(me.value);
                if(attachedAggregate){
                    var newId = attachedAggregate.elementView.id

                    // 움직일때 AGG 변화 파악.
                    if( !me.value.aggregate || !me.value.aggregate.id || (me.value.aggregate.id != newId)){
                        // 서로 들다른 agg
                        me.value.aggregate = { id: newId }
                        if(me.canvas.initLoad && !me.canvas.isRendering) {
                            // me.canvas.changedByMe = true;
                            me.canvas.changedTemplateCode = true
                        }
                    }

                }else if(!me.value.aggregate || me.value.aggregate.id){
                    me.value.aggregate = {};
                    // if(me.canvas.initLoad && !me.canvas.isRendering) {
                    //     me.canvas.changedByMe = true;
                    // }
                }
            },
            validate(executeRelateToValidate, panelValue) {
                var me = this
                var notPK = false
                var duplicateField = false
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

                if(validateValue && validateValue.fieldDescriptors){
                    notPK =  validateValue.fieldDescriptors.findIndex(fieldDescriptor => ( fieldDescriptor.isKey == true) ) == -1
                    var filteredArray = validateValue.fieldDescriptors.filter(function(fieldDescriptor,index){
                        const fRules = (element,idx) => element.name.toLowerCase() == fieldDescriptor.name.toLowerCase()
                            && element.className == fieldDescriptor.className
                            && idx != index ;
                        return validateValue.fieldDescriptors.findIndex(fRules) == -1 ? false: true
                    })

                    if(filteredArray.length != 0 ){
                        duplicateField = true
                    }
                }

                // compare queryparameter, aggregate field
                // var field = me.canvas.value.elements[me.value.aggregate.id].aggregateRoot.fieldDescriptors
                // var query = me.value.queryParameters
                
                // for( var i = 0; i < query.length; i++){
                //     var isExist = field.find(x => x.className != query[i].className || x.className != query[i].name)
                //     if(isExist){
                //         me.validationFromCode(me.ESE_MIS_MATCH)
                //     }
                // }

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
                    }
                }else{
                    var validationResultIndex = me.elementValidationResults.findIndex(x=> (x.code == me.ESE_DUPLICATE_FIELD))
                    if( validationResultIndex != -1 ){
                        me.elementValidationResults.splice(validationResultIndex,1)
                    }
                }
            }
        }
    }
</script>




<style scoped lang="scss" rel="stylesheet/scss">
    .cqrs-add-btn {
        color: #757575;
    }
</style>