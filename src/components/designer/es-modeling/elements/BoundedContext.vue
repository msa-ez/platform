<template>
<!--    <div v-if="visible">-->
    <div>
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
                        :_style="getMovingGeometryRectStyle"
                ></geometry-rect>
                <geometry-rect
                        v-else
                        :_style="getGeometryRectStyle"
                ></geometry-rect>
                
                <!-- UI BoundedContext에 이미지 오버레이 추가 -->
                <image-element
                        v-if="shouldShowSiteMapImage"
                        :image="siteMapImageSrc"
                        :x="0"
                        :y="0"
                        :width="elementCoordinate.width"
                        :height="elementCoordinate.height"
                        :_style="{
                            'z-index': 1
                        }"
                ></image-element>
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
                @generateWithDescription="boundedContextPanelDto.actions.generateWithDescription"
                @onClickStopGenerateWithDescription="boundedContextPanelDto.actions.onClickStopGenerateWithDescription"
                :genAIDto="boundedContextPanelDto.genAIDto"
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
    import {
        PreProcessingFunctionsGenerator,
        DraftGeneratorByFunctions
    } from '../../modeling/generators/es-generators';

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
            },
            shouldShowSiteMapImage() {
                return this.value.name === 'ui';
            },
            siteMapImageSrc() {
                return '/static/image/symbol/site_map_bc.png';
            },
            getGeometryRectStyle() {
                const baseStyle = {
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
                };
                
                // name이 'ui'일 때는 기본 스타일만 사용 (이미지는 image-element로 처리)
                
                return baseStyle;
            },
            getMovingGeometryRectStyle() {
                const baseStyle = {
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
                };
                
                // name이 'ui'일 때는 기본 스타일만 사용 (이미지는 image-element로 처리)
                
                return baseStyle;
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

                boundedContextPanelDto: {
                    genAIDto: {
                        isGenerateWithDescriptionDone: true
                    },
                    generateDone: true,
                    actions: {
                        generateWithDescription: (boundedContext) => {
                        },
                        onClickStopGenerateWithDescription: () => {
                        }
                    }
                },
                thinkingUpdateInterval: undefined
            };
        },

        created: function () {
            this.boundedContextPanelDto.actions.generateWithDescription = (boundedContext) => {
                this.generateWithPreProcessingFunctionsGenerator(boundedContext)
            }
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
        methods: {
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
            },


            generateWithPreProcessingFunctionsGenerator(boundedContext){
                const generator = new PreProcessingFunctionsGenerator({
                    input: {
                        description: boundedContext.generateDescription,
                        boundedContext: boundedContext
                    },
                    
                    onSend: (input, stopCallback) => {
                        this.closePanel()
                        this.canvas.AggregateDraftDialogDto.isShow = true
                        this.canvas.AggregateDraftDialogDto.draftUIInfos = {
                            leftBoundedContextCount: 1,
                            directMessage: "",
                            progress: null
                        }
                        this.canvas.AggregateDraftDialogDto.actions.stop = stopCallback
                        this._createThinkingUpdateInterval(0, input.subjectText)
                    },

                    onFirstResponse: (returnObj) => {
                        this._clearThinkingUpdateInterval()

                        this.boundedContextPanelDto.genAIDto.isGenerateWithDescriptionDone = false
                        this.boundedContextPanelDto.onClickStopGenerateWithDescription = () => {
                            returnObj.actions.stopGeneration()
                        }

                        this.canvas.AggregateDraftDialogDto.isShow = true
                        this.canvas.AggregateDraftDialogDto.draftOptions = []
                        this.canvas.AggregateDraftDialogDto.draftUIInfos = {
                            leftBoundedContextCount: 1,
                            directMessage: "Preprocessing for generating aggregate actions...",
                            progress: 0
                        }
                        this.canvas.AggregateDraftDialogDto.isGeneratorButtonEnabled = true
                        this.canvas.AggregateDraftDialogDto.actions.stop = () => {
                            returnObj.actions.stopGeneration()
                        }
                        this.canvas.AggregateDraftDialogDto.actions.retry = () => {
                            returnObj.actions.retryGeneration()
                        }
                    },

                    onModelCreated: (returnObj) => {
                        this._clearThinkingUpdateInterval()
                        const getXAIDtoDraftOptions = (analysisResult, targetBoundedContext, description) => {
                            return {
                                boundedContext: targetBoundedContext.name,
                                boundedContextAlias: targetBoundedContext.displayName,
                                description: description,
                                options: [],
                                conclusions: "",
                                defaultOptionIndex: null,
                                analysisResult: analysisResult
                            }
                        }

                        this.canvas.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                        this.canvas.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress
                        this.canvas.AggregateDraftDialogDto.draftOptions = [
                            getXAIDtoDraftOptions(
                                returnObj.modelValue.analysisResult,
                                returnObj.inputParams.boundedContext,
                                returnObj.inputParams.description
                            )
                        ]
                    },

                    onGenerationSucceeded: (returnObj) => {
                        this._clearThinkingUpdateInterval()
                        this.canvas.AggregateDraftDialogDto.draftUIInfos = {
                            leftBoundedContextCount: 1,
                            directMessage: returnObj.directMessage,
                            progress: 100
                        }

                        this.generateWithDraftGeneratorByFunctions(boundedContext, JSON.stringify(returnObj.modelValue.output), returnObj.modelValue.analysisResult)
                    },

                    onRetry: (returnObj) => {
                        this._clearThinkingUpdateInterval()
                        console.warn(`[!] An error occurred while analysing your requirements, please try again..\n* Error log \n${returnObj.errorMessage}`)
                        this.boundedContextPanelDto.genAIDto.isGenerateWithDescriptionDone = true
                        this.canvas.AggregateDraftDialogDto.isShow = false
                    },

                    onStopped: () => {
                        this._clearThinkingUpdateInterval()
                        this.boundedContextPanelDto.genAIDto.isGenerateWithDescriptionDone = true
                        this.canvas.AggregateDraftDialogDto.isShow = false
                    }
                })
                generator.generate()
            },

            generateWithDraftGeneratorByFunctions(boundedContext, structuredDescription, analysisResult){
                const generator = new DraftGeneratorByFunctions({
                    input: {
                        description: structuredDescription,
                        boundedContext: boundedContext,
                        accumulatedDrafts: DraftGeneratorByFunctions.esValueToAccumulatedDrafts(
                            this.canvas.value,
                            boundedContext
                        ),
                        analysisResult: analysisResult
                    },

                    onSend: (input, stopCallback) => {
                        this.canvas.AggregateDraftDialogDto.isShow = true
                        this.canvas.AggregateDraftDialogDto.draftUIInfos = {
                            leftBoundedContextCount: 1,
                            directMessage: "",
                            progress: null

                        }
                        this.canvas.AggregateDraftDialogDto.actions.stop = stopCallback
                        this._createThinkingUpdateInterval(0, input.subjectText)
                    },

                    onFirstResponse: (returnObj) => {
                        this._clearThinkingUpdateInterval()

                        this.boundedContextPanelDto.genAIDto.isGenerateWithDescriptionDone = false
                        this.boundedContextPanelDto.onClickStopGenerateWithDescription = () => {
                            returnObj.actions.stopGeneration()
                        }

                        this.canvas.AggregateDraftDialogDto.isShow = true
                        this.canvas.AggregateDraftDialogDto.draftUIInfos = {
                            leftBoundedContextCount: 1,
                            directMessage: "",
                            progress: 0
                        }
                        this.canvas.AggregateDraftDialogDto.isGeneratorButtonEnabled = true
                        this.canvas.AggregateDraftDialogDto.actions.stop = () => {
                            returnObj.actions.stopGeneration()
                        }
                        this.canvas.AggregateDraftDialogDto.actions.retry = () => {
                            returnObj.actions.retryGeneration()
                        }
                        this.canvas.AggregateDraftDialogDto.actions.feedbackFromDraft = (boundedContextInfo, feedback, draftOptions) => {
                            console.log(`[*] Feedback from draft`, {boundedContextInfo, feedback, draftOptions})

                            const passedAnalysisResult = draftOptions.find(option => option.boundedContext === boundedContextInfo.boundedContext).analysisResult
                            const targetBoundedContext = boundedContextInfo.options[0].boundedContext
                            
                            generator.client.input = {
                                description: boundedContextInfo.description,
                                boundedContext: targetBoundedContext,
                                accumulatedDrafts: DraftGeneratorByFunctions.esValueToAccumulatedDrafts(
                                    this.canvas.value,
                                    targetBoundedContext
                                ),
                                feedback: {
                                    previousDraftOutput: {
                                        options: boundedContextInfo.options.map(option => option.structure)
                                    },
                                    feedbacks: [
                                        feedback
                                    ]
                                },
                                analysisResult: passedAnalysisResult
                            }
                            generator.generate()
                        }
                    },

                    onModelCreated: (returnObj) => {
                        this._clearThinkingUpdateInterval()
                        const getXAIDtoDraftOptions = (output, targetBoundedContext, description, analysisResult, inference) => {
                            return {
                                boundedContext: targetBoundedContext.name,
                                boundedContextAlias: targetBoundedContext.displayName,
                                description: description,
                                options: (output.options) ? output.options.map(option => ({
                                    ...option,
                                    boundedContext: targetBoundedContext,
                                    description: description
                                })) : [],
                                conclusions: output.conclusions,
                                defaultOptionIndex: output.defaultOptionIndex,
                                analysisResult: analysisResult,
                                inference: inference
                            }
                        }



                        this.canvas.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                        this.canvas.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress
                        if(!returnObj.modelValue.output) return

                        this.canvas.AggregateDraftDialogDto.draftOptions = [
                            getXAIDtoDraftOptions(
                                returnObj.modelValue.output,
                                returnObj.inputParams.boundedContext,
                                returnObj.inputParams.description,
                                returnObj.inputParams.analysisResult,
                                returnObj.modelValue.inference
                            )
                        ]
                    },

                    onGenerationSucceeded: (returnObj) => {
                        this._clearThinkingUpdateInterval()
                        this.canvas.AggregateDraftDialogDto.draftUIInfos = {
                                leftBoundedContextCount: 0,
                                directMessage: returnObj.directMessage,
                                progress: 100
                            }
                        this.boundedContextPanelDto.genAIDto.isGenerateWithDescriptionDone = true
                    },

                    onRetry: (returnObj) => {
                        this._clearThinkingUpdateInterval()
                        alert(`[!] There was an error creating your draft, please try again.\n* Error log \n${returnObj.errorMessage}`)
                        this.boundedContextPanelDto.genAIDto.isGenerateWithDescriptionDone = true
                        this.canvas.AggregateDraftDialogDto.isShow = false
                    },

                    onStopped: () => {
                        this._clearThinkingUpdateInterval()
                        this.boundedContextPanelDto.genAIDto.isGenerateWithDescriptionDone = true
                        this.canvas.AggregateDraftDialogDto.isShow = false
                    }
                })
                generator.generate()
            },

            _createThinkingUpdateInterval(elapsedSeconds=0, subjectText) {
                this._clearThinkingUpdateInterval()

                const updateMessage = (elapsedSeconds, subjectText) => {
                    this.canvas.AggregateDraftDialogDto.draftUIInfos.directMessage = `Thinking for ${elapsedSeconds} second${elapsedSeconds > 1 ? 's' : ''}... (Subject: ${subjectText})`
                }

                updateMessage(elapsedSeconds, subjectText)
                this.thinkingUpdateInterval = setInterval(() => {
                    elapsedSeconds += 1
                    updateMessage(elapsedSeconds, subjectText)
                }, 1000)
            },

            _clearThinkingUpdateInterval() {
                if(this.thinkingUpdateInterval) {
                    clearInterval(this.thinkingUpdateInterval)
                    this.thinkingUpdateInterval = undefined
                }
            }
        }
    }
</script>

<style scoped lang="scss" rel="stylesheet/scss">

</style>
