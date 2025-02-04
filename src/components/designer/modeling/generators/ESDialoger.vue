<template>
    <div style="margin-top: 10px;">
        <div>
            <v-col class="auto-modeling-message-box">
                <v-card class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js
                                :strings="[$t('autoModeling.selectMessage1')]"
                                :typeSpeed="10"
                                :showCursor="false"
                                @onComplete="state.firstMessageIsTyping = false"
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col class="auto-modeling-message-box">
                <v-card v-if="!state.firstMessageIsTyping" class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js
                                :strings="[$t('autoModeling.selectMessage2')]"
                                :typeSpeed="5"
                                :showCursor="false"
                                @onComplete="state.secondMessageIsTyping = false"
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
        </div>
        <v-tabs v-model="activeTab">
            <v-tab 
                v-for="input in generatorInputTabs" 
                :key="input"
            >
                {{ input }}
            </v-tab>
        </v-tabs>
        <div style="display: flex; flex-direction: column;">
            <v-card v-if="!state.secondMessageIsTyping" class="auto-modeling-user-story-card">
                <v-tabs-items v-model="activeTab">
                    <!-- UserStory -->
                    <v-tab-item>
                        <v-card-subtitle>{{$t('autoModeling.explanation.userStory')}}</v-card-subtitle>
                        <v-card-text class="auto-modling-textarea">
                            <v-textarea 
                                    v-model="value.userStory"
                                    flat
                                    class="elevation-0"
                                    dense
                                    auto-grow
                                    rows="2"
                                    solo
                            >
                            </v-textarea>
                            <!--                <div-->
                            <!--                    v-for="modelId in value.modelList"-->
                            <!--                    :key="modelId"-->
                            <!--                >-->
                            <!--                    <v-btn x-small @click="jumpToModel(modelId)">{{ modelId }}</v-btn>    -->
                            <!--                </div>-->
                        </v-card-text>
                    </v-tab-item>

                    <!-- DDL -->
                    <v-tab-item>
                        <v-card-subtitle>{{$t('autoModeling.explanation.ddl')}}</v-card-subtitle>
                        <v-card-text class="auto-modling-textarea">
                            <v-textarea 
                                    v-model="inputDDL"
                                    flat
                                    class="elevation-0"
                                    dense
                                    auto-grow
                                    rows="2"
                                    solo
                            >
                            </v-textarea>
                        </v-card-text>
                    </v-tab-item>
                </v-tabs-items>
                <v-btn v-if="!done" @click="stop()" style="position: absolute; right:10px; top:10px;"><v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>Stop generating</v-btn>
                <v-row v-if="done" class="ma-0 pa-4">
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isSummarizeStarted || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('ESDialoger.tryAgain') }}</v-btn>
                    <v-btn :disabled="isSummarizeStarted || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" color="primary" @click="showBCGenerationOption = !showBCGenerationOption">{{ $t('ESDialoger.createBoundedContext') }}</v-btn>
                </v-row>
                <div v-if="isSummarizeStarted" style="margin-left: 2%; margin-bottom: 1%;">
                    <span>{{ $t('ESDialoger.summarizing') }}</span>
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </div>
            </v-card>

            <v-card v-if="showBCGenerationOption" class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                <BCGenerationOption
                    :isSummarizeStarted="isSummarizeStarted"
                    :isGeneratingBoundedContext="isGeneratingBoundedContext"
                    :isStartMapping="isStartMapping"
                    @setGenerateOption="setGenerateOption"
                ></BCGenerationOption>
            </v-card>

            <ESDialogerMessages 
                :messages="messages"
                @generateFromAggregateDrafts="generateFromAggregateDrafts"
                @feedbackFromAggregateDrafts="feedbackFromAggregateDrafts"
                @createModel="generateAggregateDrafts"
                @stop="stop"
                @reGenerate="reGenerate"
                @reGenerateWithFeedback="reGenerateWithFeedback"
                @mappingRequirements="mappingRequirements"
            ></ESDialogerMessages>
        </div>
        <div
             class="auto-modeling-message-card"
             style="margin-top:25px; height: 100%; width: 20%;">
            <v-col v-if="value && value.modelList && value.modelList.length > 0"
                   style="height: 100%; align-items: center; margin: 2px; width: 100%;"
            >
                <div v-for="id in value.modelList" :key="id">
                    <jump-to-model-lists-card :id="id" path="storming" @deleteModel="deleteModel" ></jump-to-model-lists-card>
                </div>
            </v-col>
        </div>
    </div>

</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import Generator from './UserStoryGenerator.js'
    import DevideBoundedContextGenerator from './DevideBoundedContextGenerator.js'
    import DevideBoundedContextDialog from './DevideBoundedContextDialog.vue'
    import BCGenerationOption from './BCGenerationOption.vue'
    //import UserStoryGenerator from './UserStoryGenerator.js'
    // import StorageBase from "../StorageBase";
    import StorageBase from '../../../CommonStorageBase.vue';
    import getParent from '../../../../utils/getParent'
    import Usage from '../../../../utils/Usage'

    // Requirements Summarizer
    import RequirementsSummarizer from './RequirementsSummarizer.js';
    import TextChunker from './TextChunker.js';

    import { 
        PreProcessingFunctionsGenerator,
        DraftGeneratorByFunctions 
    } from '../../modeling/generators/es-generators';

    import RecursiveRequirementsSummarizer from './RecursiveRequirementsSummarizer.js';
    import RequirementsMappingGenerator from './RequirementsMappingGenerator.js';

    import { 
        ESDialogerMessages,
        ESDialogerTestTerminal,
        MessageFactory,
    } from './features/ESDialoger';

    export default {
        name: 'es-dialoger',
        mixins:[
            StorageBase,
            ESDialogerTestTerminal
        ],
        props: {
            value: Object,
            prompt: String,
            uiStyle: Object,
            cachedModels: Object,
            projectId: String,
            modelIds: Object,
            isServerProject: Boolean
        },
        components: {
            VueTypedJs,
            DevideBoundedContextDialog,
            BCGenerationOption,
            ESDialogerMessages
        },
        computed: {
            isForeign() {
                try {
                    let lang = this.$i18n.locale;
                    return lang !== 'ko';
                } catch (error) {
                    console.error('Error determining locale:', error);
                    // 기본값으로 false 반환
                    return false;
                }
            },
        },
        async created(){
            await this.setUserInfo()
            this.autoModel = getParent(this.$parent, 'auto-modeling-dialog');

            this.textChunker = new TextChunker({
                chunkSize: 2000,  // GPT-4 컨텍스트 크기를 고려한 설정
                overlapSize: 100  // 문맥 유지를 위한 오버랩
            });


            this.generators.PreProcessingFunctionsGenerator.generator = new PreProcessingFunctionsGenerator({
                onFirstResponse: (returnObj) => {
                    const messageUniqueId = this.workingMessages.AggregateDraftDialogDto.uniqueId

                    this.workingMessages.AggregateDraftDialogDto.isShow = true
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                        directMessage: "Preprocessing for generating aggregate actions...",
                        progress: 0
                    }
                    this.workingMessages.AggregateDraftDialogDto.isGeneratorButtonEnabled = true
                    this.workingMessages.AggregateDraftDialogDto.actions = {
                        stop: () => {
                            returnObj.actions.stopGeneration()
                        },
                        retry: () => {
                            this.workingMessages.AggregateDraftDialogDto = this.messages.find(message => message.uniqueId === messageUniqueId)
                            this.workingMessages.AggregateDraftDialogDto.draftOptions = []
                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                                leftBoundedContextCount: this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs.length + 1,
                                directMessage: "Preprocessing for generating aggregate actions...",
                                progress: 0
                            }

                            this.generators.PreProcessingFunctionsGenerator.inputs = structuredClone(
                                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs
                            )
                            this.generators.DraftGeneratorByFunctions.accumulatedDrafts = structuredClone(
                                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialAccumulatedDrafts
                            )

                            this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist()
                        }
                    }

                    // 실시간 업데이트를 위해서 이전 전체 정보를 보존
                    this.generators.PreProcessingFunctionsGenerator.preservedDraftOptions = structuredClone(
                        this.workingMessages.AggregateDraftDialogDto.draftOptions.filter(
                            option => option.boundedContext !== returnObj.inputParams.boundedContext.name
                        )
                    )
                },

                onModelCreated: (returnObj) => {
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

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress

                    this.workingMessages.AggregateDraftDialogDto.draftOptions = [
                        ...this.generators.PreProcessingFunctionsGenerator.preservedDraftOptions,
                        getXAIDtoDraftOptions(
                            returnObj.modelValue.analysisResult,
                            returnObj.inputParams.boundedContext,
                            returnObj.inputParams.description
                        )
                    ]
                },

                onGenerationSucceeded: (returnObj) => {
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                        directMessage: returnObj.directMessage,
                        progress: 100
                    }

                    this.generators.DraftGeneratorByFunctions.generate(JSON.stringify(returnObj.modelValue.output), returnObj.inputParams.boundedContext, returnObj.modelValue.analysisResult)
                },

                onRetry: (returnObj) => {
                    alert(`[!] An error occurred while analysing your requirements, please try again..\n* Error log \n${returnObj.errorMessage}`)
                }
            })
            this.generators.PreProcessingFunctionsGenerator.buildInitialInputs = (selectedStructureOption) => {
                const passedGeneratorInputs = selectedStructureOption.boundedContexts.map(bc => ({
                    boundedContext: {
                        name: bc.name,
                        alias: bc.alias,
                        displayName: bc.alias,
                        description: JSON.stringify(bc.requirements),
                        aggregates: bc.aggregates
                    },
                    description: JSON.stringify(bc.requirements)
                }))

                this.generators.PreProcessingFunctionsGenerator.initialInputs = structuredClone(passedGeneratorInputs)
                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs = structuredClone(passedGeneratorInputs)

                // 제공된 정보를 기반으로 아직 생성되지는 않았으나, 참조할 수 있는 초안 정보를 미리 생성함
                // 이 정보는 추후에 AI가 초안을 실제 생성한 경우, AI의 디폴트 선택 옵션의 내용으로 순차적으로 업데이트됨
                const accumulatedDrafts = {};
                passedGeneratorInputs.forEach(item => {
                    const boundedContext = item.boundedContext;
                    if (boundedContext && boundedContext.aggregates && boundedContext.aggregates.length > 0) {
                        const aggregates = boundedContext.aggregates.map(aggregate => ({
                            aggregate: {
                                name: aggregate.name,
                                alias: aggregate.alias
                            },
                            entities: [],
                            valueObjects: [] 
                        }));
                        accumulatedDrafts[boundedContext.name] = aggregates;
                    }
                });
                this.generators.DraftGeneratorByFunctions.initialAccumulatedDrafts = structuredClone(accumulatedDrafts);
                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialAccumulatedDrafts = structuredClone(accumulatedDrafts);
            }
            this.generators.PreProcessingFunctionsGenerator.initInputs = () => {
                this.workingMessages.AggregateDraftDialogDto.draftOptions = []

                this.generators.PreProcessingFunctionsGenerator.inputs = structuredClone(
                    this.generators.PreProcessingFunctionsGenerator.initialInputs
                )

                this.generators.DraftGeneratorByFunctions.accumulatedDrafts = structuredClone(
                    this.generators.DraftGeneratorByFunctions.initialAccumulatedDrafts
                )
            }
            this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist = () => {
                if(this.generators.PreProcessingFunctionsGenerator.inputs.length > 0) {
                    this.generators.PreProcessingFunctionsGenerator.generator.client.input = this.generators.PreProcessingFunctionsGenerator.inputs.shift()
                    this.generators.PreProcessingFunctionsGenerator.generator.generate()
                    return true
                }
                return false
            }


            this.generators.DraftGeneratorByFunctions.generator = new DraftGeneratorByFunctions({
                input: null,

                onFirstResponse: (returnObj) => {
                    this.workingMessages.AggregateDraftDialogDto.isShow = true
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                        directMessage: "",
                        progress: 0
                    }
                    this.workingMessages.AggregateDraftDialogDto.isGeneratorButtonEnabled = true
                    this.workingMessages.AggregateDraftDialogDto.actions.stop = () => {
                        returnObj.actions.stopGeneration()
                    }

                    // 실시간 업데이트를 위해서 이전 전체 정보를 보존
                    this.generators.DraftGeneratorByFunctions.preservedDraftOptions = structuredClone(
                        this.workingMessages.AggregateDraftDialogDto.draftOptions.filter(
                            option => option.boundedContext !== returnObj.inputParams.boundedContext.name
                        )
                    )
                },

                onModelCreated: (returnObj) => {
                    const getXAIDtoDraftOptions = (output, targetBoundedContext, description, analysisResult) => {
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
                            analysisResult: analysisResult
                        }
                    }

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress
                    if(!returnObj.modelValue.output) return

                    if(returnObj.isFeedbackBased) {
                        const draftOptions = structuredClone(this.generators.DraftGeneratorByFunctions.preservedDraftOptionsForFeedback)

                        const replaceIndex = draftOptions.findIndex(draftOption => draftOption.boundedContext === returnObj.inputParams.boundedContext.name)
                        draftOptions.splice(replaceIndex, 1, getXAIDtoDraftOptions(
                            returnObj.modelValue.output,
                            returnObj.inputParams.boundedContext,
                            returnObj.inputParams.description,
                            returnObj.inputParams.analysisResult
                        ))

                        this.workingMessages.AggregateDraftDialogDto.draftOptions = draftOptions
                        return
                    }

                    this.workingMessages.AggregateDraftDialogDto.draftOptions = [
                        ...this.generators.DraftGeneratorByFunctions.preservedDraftOptions,
                        getXAIDtoDraftOptions(
                            returnObj.modelValue.output,
                            returnObj.inputParams.boundedContext,
                            returnObj.inputParams.description,
                            returnObj.inputParams.analysisResult
                        )
                    ]
                },

                onGenerationSucceeded: (returnObj) => {
                    if(returnObj.isFeedbackBased) {
                        this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                            leftBoundedContextCount: 0,
                            directMessage: returnObj.directMessage,
                            progress: 100
                        }
                        return
                    }

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length,
                        directMessage: returnObj.directMessage,
                        progress: 100
                    }

                    this.generators.DraftGeneratorByFunctions.updateAccumulatedDrafts(returnObj.modelValue.output, returnObj.inputParams.boundedContext)
                    if(!this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist())
                        return
                },

                onRetry: (returnObj) => {
                    alert(`[!] There was an error creating your draft, please try again.\n* Error log \n${returnObj.errorMessage}`)
                }
            })
            this.generators.DraftGeneratorByFunctions.generate = (structuredDescription, boundedContext, analysisResult) => {
                // 해당 초안은 새롭게 생성시킬 대상이기 때문에 초가화된 상태로 전달함
                this.generators.DraftGeneratorByFunctions.accumulatedDrafts[boundedContext.name] = []

                this.generators.DraftGeneratorByFunctions.generator.client.input = {
                    description: structuredDescription,
                    boundedContext: boundedContext,
                    accumulatedDrafts: this.generators.DraftGeneratorByFunctions.accumulatedDrafts,
                    analysisResult: analysisResult
                }
                this.generators.DraftGeneratorByFunctions.generator.generate()
            }
            this.generators.DraftGeneratorByFunctions.updateAccumulatedDrafts = (output, targetBoundedContext) => {
                this.generators.DraftGeneratorByFunctions.accumulatedDrafts = {
                    ...this.generators.DraftGeneratorByFunctions.accumulatedDrafts,
                    ...DraftGeneratorByFunctions.outputToAccumulatedDrafts(output, targetBoundedContext)
                }
            }
            this.generators.DraftGeneratorByFunctions.generateWithFeedback = (boundedContextInfo, feedback, draftOptions) => {
                this.generators.DraftGeneratorByFunctions.preservedDraftOptionsForFeedback = draftOptions

                const accumulatedDrafts = {}
                draftOptions.forEach(draftOption => {
                    accumulatedDrafts[draftOption.boundedContext] = draftOption.options[draftOption.defaultOptionIndex].structure
                })
                accumulatedDrafts[boundedContextInfo.boundedContext] = []

                const passedAnalysisResult = draftOptions.find(option => option.boundedContext === boundedContextInfo.boundedContext).analysisResult
                this.generators.DraftGeneratorByFunctions.generator.client.input = {
                    description: boundedContextInfo.description,
                    boundedContext: {
                        name: boundedContextInfo.boundedContext,
                        alias: boundedContextInfo.boundedContextAlias,
                        displayName: boundedContextInfo.boundedContextAlias,
                        description: boundedContextInfo.description,
                        aggregates: []
                    },
                    accumulatedDrafts: accumulatedDrafts,
                    feedback: {
                        previousDraftOutput: {options: boundedContextInfo.options.map(option => option.structure)},
                        feedbacks: [
                            feedback
                        ]
                    },
                    analysisResult: passedAnalysisResult
                }
                this.generators.DraftGeneratorByFunctions.generator.generate()
            }
        },
        watch: {
            "prompt": {
                deep:true,
                handler:  _.debounce(function(newVal, oldVal)  {
                    if(this.isCreatedModel){
                        this.modelIds.ESDefinitionId = this.uuid()
                        this.isCreatedModel = false
                    }
                },1000)
            }
        },
        mounted(){
            var me = this;
            me.setUIStyle(me.uiStyle);
            me.init();
        },
        data() {
            return {
                isCreatedModel: false,
                autoModel: null,
                state:{
                    generator: "EventOnlyESGenerator", // EventOnlyESGenerator
                    firstMessageIsTyping: true,
                    secondMessageIsTyping: true,
                    userStory: '',
                    communicationStyle: 'Choreography', // 'Orchestration'
                    aggregateDetail: false,
                    uiStyle: this.uiStyle
                },
                input:{
                    title: this.prompt,
                    separationPrinciple:  "Conway's Principle.", // "Business Capability" // "Infra Diversity" // "Per Persona",
                    businessModel: this.cachedModels["BMGenerator"],
                    painpointAnalysis: this.cachedModels["CJMGenerator"],
                    userStoryMapModel: this.cachedModels["UserStoryMapGenerator"],
                    personas: this.cachedModels["Personas"]
                },
                done: false,
                generator: null,
                generatorName: null,
                showBCGenerationOption: false,
                resultDevideBoundedContext: {},
                selectedAspect: "",

                activeTab: null,
                generatorInputTabs: ['UserStory', 'DDL'],
                inputDDL: '',
                pendingBCGeneration: false,

                textChunker: null,
                chunks: [],
                currentChunkIndex: 0,
                summarizedChunks: [],
                summarizedResult: "",
                isSummarizeStarted: false,
                userStoryChunks: [],
                userStoryChunksIndex: 0,
                bcInAspectIndex: 0,
                isStartMapping: false,
                processingRate: 0,
                currentProcessingBoundedContext: "",
                reGenerateMessageId: null,
                isGeneratingBoundedContext: false,

                bcGenerationOption: {},
                
                messages: [
                ],

                workingMessages: {
                    AggregateDraftDialog: null
                },

                generators: {
                    PreProcessingFunctionsGenerator: {
                        generator: null,
                        initialInputs: [],
                        inputs: [],
                        preservedDraftOptions: [],
                        buildInitialInputs: (selectedStructureOption) => {},
                        initInputs: () => {},
                        generateIfInputsExist: () => {}
                    },

                    DraftGeneratorByFunctions: {
                        generator: null,
                        initialAccumulatedDrafts: {},
                        accumulatedDrafts: {},
                        preservedDraftOptionsForFeedback: [],
                        preservedDraftOptions: [],
                        generate: (structuredDescription, boundedContext) => {},
                        updateAccumulatedDrafts: (output, targetBoundedContext) => {},
                        generateWithFeedback: (boundedContextInfo, feedback, draftOptions) => {}
                    }
                },
            }
        },
        methods: {
            deleteModel(id){
                var me = this
                var index = me.value.modelList.findIndex(x => x == id)
                me.value.modelList.splice(index, 1)
                
                this.$emit("input", this.value);
                this.$emit("change", 'eventStorming');
            },
            setUIStyle(uiStyle){
                this.uiStyle = uiStyle;
            },
            init(){
                var me = this 
                if(!me.modelIds.ESDefinitionId) me.modelIds.ESDefinitionId = me.uuid();
                if(!me.value){
                    me.value = {
                        userStory: ''
                    }
                    me.generate();
                } else {
                    me.done = true;
                }
            },

            onReceived(content){
                if(this.state.generator === "EventOnlyESGenerator"){
                    if(!this.value){
                        this.value = {
                            userStory: ''
                        }
                    }
                    this.value.userStory = content;
                }
            },

            onModelCreated(model){
            },

            async onGenerationFinished(model){
                var me = this;
                me.done = true;

                if (me.state.generator === "RecursiveRequirementsSummarizer") {
                    me.generator.handleGenerationFinished(model);
                    return;
                }

                if(this.state.generator === "DevideBoundedContextGenerator"){
                    me.devisionAspectIndex = 0;
                    me.isGeneratingBoundedContext = false;
                    me.updateMessageState(me.messages[me.messages.length-1].uniqueId, {
                        isGeneratingBoundedContext: me.isGeneratingBoundedContext
                    });
                    me.generator = new Generator(me);
                    me.state.generator = "EventOnlyESGenerator";
                    me.generatorName = "EventOnlyESGenerator";

                    me.input['devisionAspect'] = me.selectedAspect;
                    // 현재 메시지의 result를 깊은 복사로 가져옴
                    const currentMessage = me.messages[me.messages.length-1];
                    const newResult = JSON.parse(JSON.stringify(currentMessage.result || {}));
                    
                    // 새로운 모델을 해당 aspect에 할당
                    newResult[model.devisionAspect] = JSON.parse(JSON.stringify(model));
                    
                    // 메시지 업데이트 시 새로운 객체로 교체
                    me.updateMessageState(currentMessage.uniqueId, {
                        result: JSON.parse(JSON.stringify(newResult))
                    });

                    // resultDevideBoundedContext도 독립적으로 업데이트
                    me.resultDevideBoundedContext = JSON.parse(JSON.stringify(newResult));
                    console.log("output: ", model)
                }

                if(me.state.generator === "RequirementsMappingGenerator"){
                    console.log("currentChunk: ", me.userStoryChunksIndex+1, "/", me.userStoryChunks.length);
                    console.log("Aspect: ", me.selectedAspect);
                    console.log("BoundedContext: ", me.resultDevideBoundedContext[me.selectedAspect].boundedContexts[me.bcInAspectIndex]);
                    console.log("Requirements: ", model.requirements);

                    me.processingRate = Math.round((me.userStoryChunksIndex+1) / me.userStoryChunks.length * 100);
                    me.currentProcessingBoundedContext = me.resultDevideBoundedContext[me.selectedAspect].boundedContexts[me.bcInAspectIndex].alias;

                    // 현재 메시지의 result를 깊은 복사로 가져옴
                    const currentMessage = me.messages[me.messages.length-1];
                    me.updateMessageState(currentMessage.uniqueId, {
                        result: JSON.parse(JSON.stringify(me.resultDevideBoundedContext)),
                        processingRate: me.processingRate,
                        currentProcessingBoundedContext: me.currentProcessingBoundedContext
                    });
                    
                    me.resultDevideBoundedContext[me.selectedAspect]
                    .boundedContexts[me.bcInAspectIndex].requirements = [
                        ...(me.resultDevideBoundedContext[me.selectedAspect]
                            .boundedContexts[me.bcInAspectIndex].requirements || []),
                        ...model.requirements.filter(req => req.type != undefined)
                    ];
                    if(me.userStoryChunksIndex < me.userStoryChunks.length - 1){
                        me.userStoryChunksIndex++;
                    }else{
                        if(me.bcInAspectIndex == me.resultDevideBoundedContext[me.selectedAspect].boundedContexts.length-1){
                            me.bcInAspectIndex = 0;
                            me.userStoryChunksIndex = 0;
                            me.processingRate = 0;
                            me.currentProcessingBoundedContext = "";
                            me.isStartMapping = false;
                            me.updateMessageState(me.messages[me.messages.length-1].uniqueId, {
                                isStartMapping: me.isStartMapping
                            });

                            me.generateAggregateDrafts(me.resultDevideBoundedContext[me.selectedAspect]);
                            return;
                        }
                        me.userStoryChunksIndex = 0;
                        me.bcInAspectIndex++;
                    }
                    me.mappingRequirements();
                }

                me.$emit("input", me.value);
                me.$emit("change", 'eventStorming');
                
            },  

            async generate(){
                let issuedTimeStamp = Date.now()
                this.value.userStory = '';
                this.input.businessModel = this.cachedModels["BMGenerator"]
                this.input.painpointAnalysis = this.cachedModels["CJMGenerator"]
                this.generator = new Generator(this);

                let usage = new Usage({
                    serviceType: `ES_AIGeneration`,
                    issuedTimeStamp: issuedTimeStamp,
                    expiredTimeStamp: Date.now(),
                    metadata: {
                        projectId: this.modelIds.projectId, 
                        modelId: this.modelIds.ESDefinitionId
                    }
                });
                if(!await usage.use()) {
                    this.stop()
                    return false;
                }

                this.generator.generate();
                this.state.startTemplateGenerate = true
                this.done = false;            
            },

            stop(){
                if(this.state.generator === "DevideBoundedContextGenerator"){
                    this.resultDevideBoundedContext = {};
                }
                
                this.generator.stop();
                this.state.startTemplateGenerate = false
                this.done = true;
            },

            reGenerate(){
                this.generateDevideBoundedContext();
            },

            reGenerateWithFeedback(payload) {
                const { feedback, messageId } = payload;

                this.reGenerateMessageId = messageId;
                
                const targetMessageIndex = this.messages.findIndex(msg => msg.uniqueId === messageId);
                if (targetMessageIndex === -1) return;
                
                const originalMessage = this.messages[targetMessageIndex];
                
                // 새 메시지를 기존 메시지 다음에 추가
                this.messages.splice(targetMessageIndex + 1, 0, this.generateMessage("userMessage", {}, feedback));
                this.messages.splice(targetMessageIndex + 2, 0, this.generateMessage("boundedContextResult", {}, feedback));
                
                // Generator 실행
                this.input['devisionAspect'] = this.selectedAspect;
                this.input['previousAspectModel'] = {
                    boundedContexts: this.resultDevideBoundedContext[this.selectedAspect].boundedContexts,
                    relations: this.resultDevideBoundedContext[this.selectedAspect].relations
                };
                this.input['feedback'] = feedback;
                this.generator = new DevideBoundedContextGenerator(this);
                this.state.generator = "DevideBoundedContextGenerator";
                this.generatorName = "DevideBoundedContextGenerator";
                this.generator.generate();
            },

            setGenerateOption(option){
                this.selectedAspect = option.selectedAspects.join('+');
                this.bcGenerationOption = option;
                this.generateDevideBoundedContext();
            },

            async summarizeRequirements() {
                this.generator = new RecursiveRequirementsSummarizer(this);
                this.state.generator = "RecursiveRequirementsSummarizer";
                this.generatorName = "RecursiveRequirementsSummarizer";

                this.isSummarizeStarted = true;

                try {
                    const summarizedText = await this.generator.summarizeRecursively(this.value.userStory);
                    // 요약 결과 저장
                    this.userStoryChunks = this.generator.currentChunks;
                    this.userStoryChunksIndex = 0;
                    this.summarizedResult = summarizedText;
                    console.log("최종 요약 결과: ", this.summarizedResult);

                    this.isSummarizeStarted = false;

                    // BC 생성이 대기 중이었다면 진행
                    if (this.pendingBCGeneration) {
                        this.generateDevideBoundedContext();
                    }
                } catch (error) {
                    console.error('Summarization failed:', error);
                }
            },

            mappingRequirements(aspect){
                // 요약 > 생성된 bc의 requirements 매핑
                this.isStartMapping = true;
                this.updateMessageState(this.messages[this.messages.length-1].uniqueId, {
                    isStartMapping: this.isStartMapping
                });

                this.generator = new RequirementsMappingGenerator(this);
                this.state.generator = "RequirementsMappingGenerator";
                this.generatorName = "RequirementsMappingGenerator";

                this.input['boundedContext'] = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts[this.bcInAspectIndex];
                this.input['requirementChunk'] = this.userStoryChunks[this.userStoryChunksIndex];
                this.generator.generate();
            },

            generateDevideBoundedContext(feedback){
                // 현재 요약본이 너무 길면 먼저 요약 진행
                if (this.value.userStory.length > 6000 && this.summarizedResult.length == 0) {
                    this.pendingBCGeneration = true;
                    this.summarizeRequirements();
                    return;
                }
                
                this.generator = new DevideBoundedContextGenerator(this);
                this.state.generator = "DevideBoundedContextGenerator";
                this.generatorName = "DevideBoundedContextGenerator";

                this.devisionAspectIndex = 0;
                this.input['devisionAspect'] = this.selectedAspect;
                this.messages.push(this.generateMessage("boundedContextResult", {}))
                
                this.input['generateOption'] = this.bcGenerationOption;
                
                this.input['requirements'] = {
                    userStory: this.value.userStory,
                    summarizedResult: this.summarizedResult,
                    ddl: this.inputDDL
                };

                this.generator.generate();
                this.isGeneratingBoundedContext = true;
                this.updateMessageState(this.messages[this.messages.length-1].uniqueId, {
                    isGeneratingBoundedContext: this.isGeneratingBoundedContext
                });
            },

            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },


            generateAggregateDrafts(selectedStructureOption){
                if(!selectedStructureOption) return

                // 요약 결과가 있으면, BC별 원본 매핑 우선 진행
                if(this.summarizedResult.length > 0){
                    let aspect = selectedStructureOption.devisionAspect
                    let boundedContexts = this.resultDevideBoundedContext[aspect].boundedContexts

                    // 모든 BC의 requirements가 비어있으면 원본 매핑 진행
                    let allRequirementsEmpty = boundedContexts.every(bc => 
                        !bc.requirements || bc.requirements.length === 0
                    )

                    if(allRequirementsEmpty) {
                        this.mappingRequirements(aspect);
                        return;
                    }
                }

                console.log("[*] 선택된 BC 구성 옵션을 기반으로 생성이 시도됨", {selectedStructureOption})

                this.workingMessages.AggregateDraftDialogDto = MessageFactory.createAggregateDraftDialogDtoMessage()
                this.messages.push(this.workingMessages.AggregateDraftDialogDto)

                this.generators.PreProcessingFunctionsGenerator.buildInitialInputs(selectedStructureOption)
                this.generators.PreProcessingFunctionsGenerator.initInputs()
                this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist()
            },

            generateFromAggregateDrafts(draftOptions){
                if(this.isServerProject) this.state.associatedProject = this.modelIds.projectId

                this.state = {
                    ...this.state,
                    userStory: this.value.userStory,
                    draftOptions: draftOptions,
                    generator: "CreateAggregateActionsByFunctions"
                }
                console.log("[*] 생성 준비를 위한 입력값 구축 완료", {state: this.state})

                try {

                    if(!this.value.modelList){
                        this.value.modelList = []
                    }

                    this.$emit("input", this.value);
                    this.$emit("change", 'eventStorming');

                    // GeneratorUI.createGenerator() 함수에서 해당 값을 받아서 자동 처리 수행
                    localStorage["gen-state"] = JSON.stringify(this.state);;
                    window.open(`/#/storming/${this.modelIds.ESDefinitionId}`, "_blank")
                    this.isCreatedModel = true;

                }
                catch(e) {

                    console.log("[*] 생성 준비를 위한 입력값 구축과정에서 에러 발생", {error: e, state: this.state, selectedStructureOption})

                    if(e.name=="QuotaExceededError"){
                        var keys = Object.keys(localStorage);
                        var values = keys.map(function(key) {
                            return localStorage.getItem(key);
                        });

                        for (var i = 0; i < keys.length; i++) {
                            var key = keys[i];
                            var value = values[i];

                            if(value.includes('elements') && value.includes('relations')){
                                localStorage.removeItem(key);
                            }
                        }

                        this.generateFromDraftWithXAI(draftOptions)
                    }

                }
            },

            feedbackFromAggregateDrafts(boundedContextInfo, feedback, draftOptions, messageUniqueId){
                console.log("[*] 주어진 피드백을 기반으로 새로운 Aggregate 초안 생성", {boundedContextInfo, feedback, draftOptions, messageUniqueId})


                this.workingMessages.AggregateDraftDialogDto = MessageFactory.createAggregateDraftDialogDtoMessage()

                const relatedMessage = (messageUniqueId) ? this.messages.find(message => message.uniqueId === messageUniqueId) : null
                if(relatedMessage){
                    this.workingMessages.AggregateDraftDialogDto.retryInputs = structuredClone(relatedMessage.retryInputs)

                    const messageUniqueId = this.workingMessages.AggregateDraftDialogDto.uniqueId
                    this.workingMessages.AggregateDraftDialogDto.actions.retry = () => {
                            this.workingMessages.AggregateDraftDialogDto = this.messages.find(message => message.uniqueId === messageUniqueId)
                            this.workingMessages.AggregateDraftDialogDto.draftOptions = []
                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                                leftBoundedContextCount: this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs.length + 1,
                                directMessage: "Preprocessing for generating aggregate actions...",
                                progress: 0
                            }

                            this.generators.PreProcessingFunctionsGenerator.inputs = structuredClone(
                                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs
                            )
                            this.generators.DraftGeneratorByFunctions.accumulatedDrafts = structuredClone(
                                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialAccumulatedDrafts
                            )

                            this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist()
                        }
                }
                else {
                    this.workingMessages.AggregateDraftDialogDto.actions.retry = () => {
                        alert("[!] Currently retry is not supported")
                    }
                }


                this.messages.push(
                    MessageFactory.createUserMessage(
                        feedback,
                        "aggregateDraftDialogDtoUserFeedback",
                        {targetBoundedContextName: boundedContextInfo.name}
                    )
                )
                this.messages.push(this.workingMessages.AggregateDraftDialogDto)


                const previousFeedbacks = this.messages.filter(message => message.type === "userMessage" && message.subType === "aggregateDraftDialogDtoUserFeedback" && message.metadatas.targetBoundedContextName === boundedContextInfo.name).map(message => message.message)
                this.generators.DraftGeneratorByFunctions.generateWithFeedback(boundedContextInfo, previousFeedbacks, draftOptions)
            },

            generateMessage(type, result, feedback) {
                if(type === "boundedContextResult"){
                    return {
                        uniqueId: this.uuid(),
                        type: type,
                        result: result,
                        isStartMapping: this.isStartMapping,
                        isGeneratingBoundedContext: this.isGeneratingBoundedContext,
                        processingRate: this.processingRate,
                        currentProcessingBoundedContext: this.currentProcessingBoundedContext,
                        selectedAspect: this.selectedAspect,
                        summarizedResult: this.summarizedResult,
                        timestamp: new Date()
                    };
                }else if(type === "userMessage"){
                    return {
                        uniqueId: this.uuid(),
                        type: type,
                        message: feedback,
                        timestamp: new Date()
                    };
                }
            },

            updateMessageState(messageId, updates) {
                const messageIndex = this.messages.findIndex(msg => msg.uniqueId === messageId);
                if (messageIndex !== -1) {
                    this.$set(this.messages, messageIndex, {
                        ...this.messages[messageIndex],
                        ...updates
                    });
                }
            },
        }
    }
</script>

<style scoped>
</style>
