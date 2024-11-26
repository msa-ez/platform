<template>
<!--    <div v-if="visible">-->
    <div>
        <v-row v-if="!generateDone" style="position:absolute; top:75px; right:35px; z-index:999;">
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
            <div style="margin:5px 0px 0px 5px;">Creating {{ value.name }}... <v-btn @click="stop" text>stop</v-btn></div>
        </v-row>
        <group-element
                :selectable="selectable"
                :movable="movable"
                :resizable="resizable"
                :deletable="deletable"
                :id.sync="value.elementView.id"
                :x.sync="elementCoordinate.x"
                :y.sync="elementCoordinate.y"
                :width.sync="elementCoordinate.width"
                :height.sync="elementCoordinate.height"
                :customMoveActionExist="canvas.isCustomMoveExist"
                v-on:customMoveAction="delayedMove"
                v-on:moveShape="onMoveShape"
                v-on:removeShape="onRemoveShape"
                v-on:selectShape="selectedActivity"
                v-on:deSelectShape="deSelectedActivity"
                v-on:dblclick="openPanel"
                v-on:addToGroup="onAddToGroup"
                :label.sync="getNamePanel"
                :_style="{
                'vertical-align': 'top',
                'font-weight': 'bold',
                'font-size': '16'
                }"
        >
            <sub-elements v-if="canvas.isHexagonal">
                <geometry-element
                        :selectable="selectable"
                        :movable="!canvas.isReadOnlyModel && !movingElement"
                        :resizable="!canvas.isReadOnlyModel && !movingElement"
                        :deletable="!canvas.isReadOnlyModel && isEditElement"
                        :id.sync="elementCoordinate.id"
                        :x.sync="elementCoordinate.x"
                        :y.sync="elementCoordinate.y"
                        :width.sync="elementCoordinate.width"
                        :height.sync="elementCoordinate.height"
                        :customMoveActionExist="canvas.isCustomMoveExist"
                        v-on:customMoveAction="delayedMove"
                        v-on:moveShape="onMoveShape"
                        v-on:removeShape="onRemoveShape"
                        v-on:selectShape="selectedActivity"
                        v-on:deSelectShape="deSelectedActivity"
                        v-on:dblclick="openPanel"
                        v-on:addToGroup="onAddToGroup"
                        :_style="{
                        'vertical-align': 'top',
                        'font-weight': 'bold',
                        'font-size': '16'
                        }"
                >
                        <sub-elements>
                            <geometry-polygon
                                    :vertices="[ [25,0], [75,0], [100,50], [75,100], [25,100], [0,50], [25,0] ]"
                                    :_style="{
                                        'fill-r': 1,
                                        'fill-cx': .1,
                                        'fill-cy': .1,
                                        'stroke-width': 1.4,
                                        'stroke': '#000000',
                                        'fill': '#92D050',
                                        'fill-opacity': 1,
                                        'r': '1',
                                        'z-index': -1
                                    }"
                            ></geometry-polygon>
                            <geometry-polygon
                                    :vertices="[ [35,20], [65,20], [80,50], [65,80], [35,80], [20,50], [35,20] ]"
                                    :_style="{
                                        'fill-r': 1,
                                        'fill-cx': .1,
                                        'fill-cy': .1,
                                        'stroke-width': 1.4,
                                        'stroke': '#000000',
                                        'stroke-dasharray': '- ',
                                        'fill': '#FFFF00',
                                        'fill-opacity': 1,
                                        'r': '1',
                                        'z-index': -1
                                    }"
                            ></geometry-polygon>
                        </sub-elements>
                </geometry-element>
            </sub-elements>

            <sub-elements v-else>
                <geometry-rect
                        v-if="movingElement"
                        :_style="{
                            'fill-r': 1,
                            'fill-cx': .1,
                            'fill-cy': .1,
                            'stroke-width': 1.4,
                            'stroke': '#000000',
                            'fill': '#e3e1e1',
                            'fill-opacity': .5,
                            'vertical-align': 'top',
                            'font-weight': 'bold',
                            'font-size': '16',
                            'r': '1'
                        }"
                ></geometry-rect>
                <geometry-rect
                        v-else
                        :_style="{
                            'fill-r': 1,
                            'fill-cx': .1,
                            'fill-cy': .1,
                            'stroke-width': 1.4,
                            'stroke': '#000000',
                            'fill-opacity': 1,
                            'vertical-align': 'top',
                            'font-weight': 'bold',
                            'font-size': '16',
                            'r': '1'
                        }"
                ></geometry-rect>
            </sub-elements>

            <storming-sub-controller
                    :type="value._type"
                    :value="value" 
                    :isReadOnly="!isEditElement && !isMembers"
                    :isHexagonal="canvas.isHexagonal"
            ></storming-sub-controller>
            
            <!-- <sub-controller
                    v-if="!canvas.isHexagonal"
                    :image="'class.png'"
                    @click.prevent.stop="openClassDiagram"
            ></sub-controller> -->

            <!-- <sub-controller
                    v-if="!isHexagonal"
                    :image="'class.png'"
                    @click.prevent.stop="openClassDiagram('java-parse')"
            ></sub-controller> -->

            <sub-elements v-if="!canvas.isHexagonal">
                <multi-user-status-indicator :images="newEditUserImg" :element-height="elementCoordinate.height"></multi-user-status-indicator>
            </sub-elements>

        </group-element>


        <bounded-context-panel
                v-if="propertyPanel"
                v-model="value"
                :isReadOnly="!isEditElement"
                :newEditUserImg="newEditUserImg"
                :image="image"
                :validationLists="filteredElementValidationResults"
                @close="closePanel"
                @changedPanelValue="changedPanelValue"
                @updateBCName="updateBCName()"
                :generateDone.sync="generateDone"
                :generator="generator"
        ></bounded-context-panel>

    </div>
</template>

<script>
    import Element from './EventStormingModelElement'
    import GroupElement from "../../../opengraph/shape/GroupElement";
    import ImageElement from "../../../opengraph/shape/ImageElement";
    import SubElements from "../../../opengraph/shape/SubElements";
    import BoundedContextPanel from "../panels/BoundedContextPanel";
    import StormingSubController from "../../modeling/StormingSubController";
    import MultiUserStatusIndicator from "@/components/designer/modeling/MultiUserStatusIndicator.vue"
    import isAttached from '../../../../utils/isAttached';
    import Generator from "../../modeling/generators/es-ddl-generators/DraftGeneratorByFunctions";

    var _ = require('lodash')
    export default {
        components: {
            SubElements,
            ImageElement,
            GroupElement,
            BoundedContextPanel,
            'multi-user-status-indicator': MultiUserStatusIndicator,
            'storming-sub-controller' : StormingSubController
        },
        mixins: [Element],
        name: 'bounded-context-definition',
        props: {},
        computed: {
            defaultStyle() {
                return {}
            },
            className() {
                return 'org.uengine.modeling.model.BoundedContext'
            },
            createNew(canvas, elementId, x, y, width, height, description, label) {
                return {
                    _type: 'org.uengine.modeling.model.BoundedContext',
                    id: elementId,
                    name: 'BoundedContext' + x,
                    oldName: '',
                    displayName: '',
                    description: null,
                    author: null,
                    aggregates: [],
                    policies: [],
                    members: [],
                    views: [],
                    gitURL: null,
                    elementView: {
                        '_type': 'org.uengine.modeling.model.BoundedContext',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 350,
                        'height': 350,
                        'style': JSON.stringify({})
                    },
                    hexagonalView:{
                        '_type': 'org.uengine.modeling.model.BoundedContextHexagonal',
                        'id': elementId,
                        'x': x,
                        'y': y,
                        'width': 350,
                        'height': 350,
                        'style': JSON.stringify({})
                    },
                    portGenerated: 0,
                    tempId: '',
                    templatePerElements: {},
                    preferredPlatform: 'spring-boot',
                    preferredPlatformConf: {},
                }
            },

            input(){
                return{ 
                    description: this.value.description,
                    boundedContext: this.value,
                }
            }
        },
        data: function () {
            return {
                itemH: 20,
                titleH: (this.value.classReference ? 60 : 30),
                reference: this.value.classReference != null,
                referenceClassName: this.value.classReference,

                // UML Class Diagram
                aggregateRoots: [],
                generateDone: true,
                generator: null,
                originModel: null,
            };
        },
        created: function () {
            this.init() // generator
        },
        watch: {
            "value.members": {
                deep: true,
                handler() {
                    this.isMembers
                }
            },
            "filteredElementValidationResults": _.debounce(function () {
                this.refreshImg()
            }, 200),
        },
        mounted: function () {
            var me = this
            // var webSocket = new WebSocket();

            if(me.value.elementView.id){
                var $tr = $('#' + me.value.elementView.id);
                $tr.parent().children().first().before($tr)
            }

        },
        beforeUnmount: function(){
            this.stop()
        },
        methods: {
            init(){
                this.generator = new Generator(this);
                if(this.generateDone) {
                    this.originModel = JSON.parse(JSON.stringify(this.canvas.value));
                }
            },
            onModelCreated(model){
                this.closePanel()
                this.$EventBus.$emit('createModelInBoundedContext', {eventBy: "onModelCreated", ...model}, this.originModel);
            },
            async onGenerationFinished(model){
                this.generateDone = true;
                this.$emit('update:generateDone', true);
                this.$EventBus.$emit('createModelInBoundedContext', {eventBy: "onGenerationFinished", ...model}, this.originModel);
                this.canvas.setIsPauseQueue(false);
            },  
            generate(){
                this.generator.generate();
                this.generateDone = false;    
            },
            stop(){
                this.generator.stop()
                this.generateDone = true
            },
            async selectMain(){
                var me = this
                // if( me.canvas.viewId ){
                //     if(me.canvas.isLogin ){
                //         await me.canvas.setString(`db://definitions/${me.canvas.projectId}/viewLists/${me.canvas.viewId}/mainBoundedContext`, me.value.id);
                //     } else {
                //         // login alter.
                //     }
                // }
            },
            onMoveShape: function () {
                var me = this;
                if(me.canvas.isHexagonal && !me.canvas.isServerModel) {
                    me.refreshImg()
                }
            },
            openClassDiagram(mode) {
                var me = this
                var aggregateId = ''
                var elements = me.canvas.value.elements
                me.aggregateRoots = []
                
                Object.values(elements).forEach((element, index) => {
                    if (element && element.elementView && !element._type.endsWith("BoundedContext")) {
                        if (isAttached(me.value, element, me)) {
                            if (element._type.endsWith('Aggregate')) {
                                me.aggregateRoots.push(element)
                                aggregateId = element.elementView.id
                            }
                        }
                    }
                })

                var umlValue = {
                    type: 'Domain Class Modeling',
                    aggId: aggregateId,
                    aggList: me.aggregateRoots
                }
                // if(mode == 'java-parse'){
                //     me.canvas.openEmbeddedCanvas(umlValue, 'java-parse');
                // } else {
                    me.canvas.overlayText = 'Loading';
                    me.canvas.openEmbeddedCanvas(umlValue);
                // }
            },
            close(){
                this.closePanel()
            },
            onMoveAction(executeRecursion){
                var me = this
                let id = me.value.id;
                if( me.canvas.isReplay ) return;
                if( me.value.mirrorElement ) return;

                let attachedAggregate = me.canvas.getAllAttachedAggregate(me.value);
                if(attachedAggregate && attachedAggregate.length > 0) {
                    let filteredAggregateId = attachedAggregate.map(element => element = {id: element.elementView.id});
                    if( JSON.stringify(filteredAggregateId) !== JSON.stringify( me.value.aggregates ) ) {
                        me.value.aggregates = filteredAggregateId
                        if(me.canvas.initLoad && !me.canvas.isRendering) {
                            // me.canvas.changedByMe = true;
                            me.canvas.changedTemplateCode = true
                        }
                    }
                } else {
                    me.value.aggregates = []
                    if(me.canvas.initLoad && !me.canvas.isRendering) {
                        // me.canvas.changedByMe = true;
                        me.canvas.changedTemplateCode = true
                    }
                }
                
                let elements = me.canvas.value.elements;
                let attachedElements = Array.isArray(elements)  ? elements.filter(x => x !== null && isAttached(x, me.value)) : Object.values(elements).filter(x => x !== null).filter(x => isAttached(x, me.value));
                let attachedElement = []
                
                attachedElements = attachedElements.map(element => {
                    if (element._type !== "org.uengine.modeling.model.BoundedContext") {
                        element.boundedContext = { id: me.value.id };
                        // me.canvas.changedByUndoRedo = true
                        attachedElement.push(element);
                    }
                });
                if (me.canvas && me.canvas.value && me.canvas.value.elements){
                    Object.values(me.canvas.value.elements).forEach(element => {
                        if(element && element.id){
                            attachedElement.forEach(attached => {
                                if (attached && attached.id && element.id === attached.id) {
                                    Object.assign(element, attached);
                                }
                            });
                        }
                    });
                }
                var component = me.canvas.$refs[`${id}`] ? me.canvas.$refs[`${id}`][0] : null
                if (component && !executeRecursion) component.onMoveAction(true)
            },
            validate(executeRelateToValidate, panelValue){
                var me = this
                if( me.canvas.isReplay ) return;
                var executeValidate = executeRelateToValidate == false ? false :true
                var validateValue = me.propertyPanel && panelValue ? panelValue : me.value

                // Common
                // this.$super(Element).validate()

                // execute Relate Validate ex) 자신의 element 에서 다른 element의 validate 실행여부.
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
            },
            updateBCName(){
                this.value.name = this.value.name.replace(/[-._]/g, '');
                this.value.name = this.value.name.toLowerCase();
            }
        }
    }
</script>




