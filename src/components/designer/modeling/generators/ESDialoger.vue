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
                <v-card-actions v-if="done" class="auto-modeling-btn-box">
                    <v-btn :disabled="isSummarizeStarted || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('ESDialoger.tryAgain') }}</v-btn>
                    <v-btn :disabled="isSummarizeStarted || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" color="primary" @click="generateDevideBoundedContext()">{{ $t('ESDialoger.createBoundedContext') }}</v-btn>
                </v-card-actions>
                <div v-if="isSummarizeStarted" style="margin-left: 2%; margin-bottom: 1%;">
                    <span>{{ $t('ESDialoger.summarizing') }}</span>
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                </div>
            </v-card>

            <v-card v-if="showDevideBoundedContextDialog" class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                <DevideBoundedContextDialog
                    :resultDevideBoundedContext="resultDevideBoundedContext"
                    :isStartMapping="isStartMapping"
                    :processingRate="processingRate"
                    :currentProcessingBoundedContext="currentProcessingBoundedContext"
                    @createModel="generateAggregateDrafts"
                    @closeDialog="showDevideBoundedContextDialog = false"
                    @stop="stop"
                    @reGenerate="reGenerate"
                    @reGenerateAspect="reGenerateAspect"
                    @mappingRequirements="mappingRequirements"
                ></DevideBoundedContextDialog>
            </v-card>

            <v-card v-if="modelDraftDialogWithXAIDto.isShow" class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                <ModelDraftDialogWithXAI
                    :draftOptions="modelDraftDialogWithXAIDto.draftOptions"
                    :draftUIInfos="modelDraftDialogWithXAIDto.draftUIInfos"
                    :isGeneratorButtonEnabled="modelDraftDialogWithXAIDto.isGeneratorButtonEnabled"
                    @generateFromDraft="generateFromDraftWithXAI"
                    @onClose="modelDraftDialogWithXAIDto.isShow = false; modelDraftDialogWithXAIDto.actions.stop()"
                    @onRetry="modelDraftDialogWithXAIDto.actions.retry()"
                ></ModelDraftDialogWithXAI>
            </v-card>
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

        <!-- <v-dialog
                v-model="showDevideBoundedContextDialog"
                persistent
                max-width="1200"
                max-height="800"
          >
            <DevideBoundedContextDialog
                :resultDevideBoundedContext="resultDevideBoundedContext"
                @createModel="jump"
                @closeDialog="showDevideBoundedContextDialog = false"
                @stop="stop"
                @reGenerate="reGenerate"
            ></DevideBoundedContextDialog>
        </v-dialog> -->
    </div>

</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import Generator from './UserStoryGenerator.js'
    import DevideBoundedContextGenerator from './DevideBoundedContextGenerator.js'
    import DevideBoundedContextDialog from './DevideBoundedContextDialog.vue'
    //import UserStoryGenerator from './UserStoryGenerator.js'
    // import StorageBase from "../StorageBase";
    import StorageBase from '../../../CommonStorageBase.vue';
    import getParent from '../../../../utils/getParent'
    import Usage from '../../../../utils/Usage'
    import ESDialogerTestTerminal from './testTerminals/ESDialogerTestTerminal.vue';

    // Requirements Summarizer
    import RequirementsSummarizer from './RequirementsSummarizer.js';
    import TextChunker from './TextChunker.js';

    import ModelDraftDialogWithXAI from '../../context-mapping-modeling/dialogs/ModelDraftDialogWithXAI.vue'
    import { 
        PreProcessingFunctionsGenerator,
        DraftGeneratorByFunctions 
    } from '../../modeling/generators/es-generators';

    import RecursiveRequirementsSummarizer from './RecursiveRequirementsSummarizer.js';
    import RequirementsMappingGenerator from './RequirementsMappingGenerator.js';
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
            ModelDraftDialogWithXAI
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
                    this.modelDraftDialogWithXAIDto = {
                        ...this.modelDraftDialogWithXAIDto,
                        isShow: true,
                        draftUIInfos: {
                            leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                            directMessage: "",
                            progress: 0
                        },
                        isGeneratorButtonEnabled: true,
                        actions: {
                            stop: () => {
                                returnObj.actions.stopGeneration()
                            },
                            retry: () => {
                                this.generators.PreProcessingFunctionsGenerator.initInputs()
                                this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist()
                            }
                        }
                    }
                },

                onModelCreated: (returnObj) => {
                    this.modelDraftDialogWithXAIDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.modelDraftDialogWithXAIDto.draftUIInfos.progress = returnObj.progress
                },

                onGenerationSucceeded: (returnObj) => {
                    this.modelDraftDialogWithXAIDto = {
                        ...this.modelDraftDialogWithXAIDto,
                        draftUIInfos: {
                            leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                            directMessage: returnObj.directMessage,
                            progress: 100
                        }
                    }

                    this.generators.DraftGeneratorByFunctions.generate(JSON.stringify(returnObj.modelValue.output), returnObj.inputParams.boundedContext)
                },

                onRetry: (returnObj) => {
                    alert(`[!] An error occurred while analysing your requirements, please try again..\n* Error log \n${returnObj.errorMessage}`)
                    this.modelDraftDialogWithXAIDto.isShow = false
                },

                onStopped: () => {
                    this.modelDraftDialogWithXAIDto.isShow = false
                }
            })
            this.generators.PreProcessingFunctionsGenerator.buildInitialInputs = (selectedStructureOption) => {
                const passedGeneratorInputs = selectedStructureOption.boundedContexts.map(bc => ({
                    boundedContext: {
                        name: bc.name,
                        alias: bc.alias,
                        displayName: bc.alias,
                        description: bc.requirements,
                        aggregates: bc.aggregates
                    },
                    description: JSON.stringify(bc.requirements)
                }))

                this.generators.PreProcessingFunctionsGenerator.initialInputs = structuredClone(passedGeneratorInputs)

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
                this.generators.DraftGeneratorByFunctions.initialAccumulatedDrafts = accumulatedDrafts;
            }
            this.generators.PreProcessingFunctionsGenerator.initInputs = () => {
                this.modelDraftDialogWithXAIDto.draftOptions = []

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
                    this.modelDraftDialogWithXAIDto = {
                        ...this.modelDraftDialogWithXAIDto,
                        isShow: true,
                        draftUIInfos: {
                            leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                            directMessage: "",
                            progress: 0
                        },
                        isGeneratorButtonEnabled: true,
                        actions: {
                            ...this.modelDraftDialogWithXAIDto.actions,
                            stop: () => {
                                returnObj.actions.stopGeneration()
                            }
                        }
                    }
                },

                onModelCreated: (returnObj) => {
                    this.modelDraftDialogWithXAIDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.modelDraftDialogWithXAIDto.draftUIInfos.progress = returnObj.progress
                },

                onGenerationSucceeded: (returnObj) => {
                    const getXAIDtoDraftOptions = (output, targetBoundedContext, description) => {
                        return {
                            boundedContext: targetBoundedContext.name,
                            boundedContextAlias: targetBoundedContext.displayName,
                            description: description,
                            options: output.options.map(option => ({
                                ...option,
                                boundedContext: targetBoundedContext,
                                description: description
                            })),
                            conclusions: output.conclusions,
                            defaultOptionIndex: output.defaultOptionIndex
                        }
                    }

                    this.modelDraftDialogWithXAIDto = {
                        ...this.modelDraftDialogWithXAIDto,
                        draftOptions: [
                            ...this.modelDraftDialogWithXAIDto.draftOptions,
                            getXAIDtoDraftOptions(
                                returnObj.modelValue.output,
                                returnObj.inputParams.boundedContext,
                                returnObj.inputParams.description
                            )
                        ],
                        draftUIInfos: {
                            leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length,
                            directMessage: returnObj.directMessage,
                            progress: 100
                        }
                    }

                    this.generators.DraftGeneratorByFunctions.updateAccumulatedDrafts(returnObj.modelValue.output, returnObj.inputParams.boundedContext)
                    if(!this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist())
                        return
                },

                onRetry: (returnObj) => {
                    alert(`[!] There was an error creating your draft, please try again.\n* Error log \n${returnObj.errorMessage}`)
                    this.modelDraftDialogWithXAIDto.isShow = false
                },

                onStopped: () => {
                    this.modelDraftDialogWithXAIDto.isShow = false
                }
            })
            this.generators.DraftGeneratorByFunctions.generate = (structuredDescription, boundedContext) => {
                // 해당 초안은 새롭게 생성시킬 대상이기 때문에 초가화된 상태로 전달함
                this.generators.DraftGeneratorByFunctions.accumulatedDrafts[boundedContext.name] = []

                this.generators.DraftGeneratorByFunctions.generator.client.input = {
                    description: structuredDescription,
                    boundedContext: boundedContext,
                    accumulatedDrafts: this.generators.DraftGeneratorByFunctions.accumulatedDrafts
                }
                this.generators.DraftGeneratorByFunctions.generator.generate()
            }
            this.generators.DraftGeneratorByFunctions.updateAccumulatedDrafts = (output, targetBoundedContext) => {
                this.generators.DraftGeneratorByFunctions.accumulatedDrafts = {
                    ...this.generators.DraftGeneratorByFunctions.accumulatedDrafts,
                    ...DraftGeneratorByFunctions.outputToAccumulatedDrafts(output, targetBoundedContext)
                }
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
            },
            "showDevideBoundedContextDialog": {
                handler: function(newVal, oldVal) {
                    if(newVal){
                        if(newVal){
                            this.state.generator = "DevideBoundedContextGenerator";
                        }else{
                            this.state.generator = "EventOnlyESGenerator";
                        }
                    }
                }
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
                showDevideBoundedContextDialog: false,
                resultDevideBoundedContext: {},
                devisionAspect: [
                    this.$t('DevideBoundedContextDialog.domainAspect'),
                    this.$t('DevideBoundedContextDialog.organizationalAspect'),
                    this.$t('DevideBoundedContextDialog.personaAspect'),
                    this.$t('DevideBoundedContextDialog.transactionPerformanceAspect'),
                    this.$t('DevideBoundedContextDialog.infrastructureAspect')
                ],
                devisionAspectIndex: 0,

                activeTab: null,
                generatorInputTabs: ['UserStory', 'DDL'],
                inputDDL: '',
                pendingBCGeneration: false,

                textChunker: null,
                chunks: [],
                currentChunkIndex: 0,
                summarizedChunks: [],
                summarizedResult: "",
                summarizedResult: "",
                isSummarizeStarted: false,
                userStoryChunks: [],
                userStoryChunksIndex: 0,
                bcInAspectIndex: 0,
                isStartMapping: false,
                processingRate: 0,
                currentProcessingBoundedContext: "",
                isGeneratingBoundedContext: false,
                
                modelDraftDialogWithXAIDto: {
                    isShow: false,
                    draftOptions: [],
                    draftUIInfos: {
                        leftBoundedContextCount: 0
                    },
                    isGeneratorButtonEnabled: true,
                    actions: {
                        stop: () => {},
                        retry: () => {}
                    }
                },

                generators: {
                    PreProcessingFunctionsGenerator: {
                        generator: null,
                        initialInputs: [],
                        inputs: [],
                        buildInitialInputs: (selectedStructureOption) => {},
                        initInputs: () => {},
                        generateIfInputsExist: () => {}
                    },

                    DraftGeneratorByFunctions: {
                        generator: null,
                        initialAccumulatedDrafts: {},
                        accumulatedDrafts: {},
                        generate: (structuredDescription, boundedContext) => {},
                        updateAccumulatedDrafts: (output, targetBoundedContext) => {}
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
                    if(me.devisionAspectIndex < me.devisionAspect.length - 1) {
                        if(!me.generator) me.generator = new DevideBoundedContextGenerator(me);
                        me.generator.generate();
                        me.devisionAspectIndex++;
                    }else{
                        me.devisionAspectIndex = 0;
                        me.isGeneratingBoundedContext = false;
                        me.generator = new Generator(me);
                        me.state.generator = "EventOnlyESGenerator";
                        me.generatorName = "EventOnlyESGenerator";
                    }

                    me.input['devisionAspect'] = me.devisionAspect[me.devisionAspectIndex];
                    me.$set(me.resultDevideBoundedContext, model.devisionAspect, model)
                    me.showDevideBoundedContextDialog = true
                    console.log("output: ", model)

                    // 요약 결과가 있으면 요약 결과를 기반으로 매핑 진행
                    if(me.summarizedResult.length > 0 && me.userStoryChunks.length > 0 && me.devisionAspectIndex == 0){
                        me.mappingRequirements();
                        return;
                    }
                }

                if(me.state.generator === "RequirementsMappingGenerator"){
                    console.log("currentChunk: ", me.userStoryChunksIndex+1, "/", me.userStoryChunks.length);
                    console.log("Aspect: ", me.devisionAspect[me.devisionAspectIndex]);
                    console.log("BoundedContext: ", me.resultDevideBoundedContext[me.devisionAspect[me.devisionAspectIndex]].boundedContexts[me.bcInAspectIndex]);
                    console.log("Requirements: ", model.requirements);

                    me.processingRate = Math.round((me.userStoryChunksIndex+1) / me.userStoryChunks.length * 100);
                    me.currentProcessingBoundedContext = me.resultDevideBoundedContext[me.devisionAspect[me.devisionAspectIndex]].boundedContexts[me.bcInAspectIndex].alias;

                    me.resultDevideBoundedContext[me.devisionAspect[me.devisionAspectIndex]]
                    .boundedContexts[me.bcInAspectIndex].requirements = [
                        ...(me.resultDevideBoundedContext[me.devisionAspect[me.devisionAspectIndex]]
                            .boundedContexts[me.bcInAspectIndex].requirements || []),
                        ...model.requirements.filter(req => req.type != undefined)
                    ];
                    if(me.userStoryChunksIndex < me.userStoryChunks.length - 1){
                        me.userStoryChunksIndex++;
                    }else{
                        if(me.bcInAspectIndex == me.resultDevideBoundedContext[me.devisionAspect[me.devisionAspectIndex]].boundedContexts.length-1){
                            me.bcInAspectIndex = 0;
                            me.userStoryChunksIndex = 0;
                            me.processingRate = 0;
                            me.currentProcessingBoundedContext = "";
                            this.isStartMapping = false;
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

            reGenerateAspect(aspect, feedback){
                Object.keys(this.resultDevideBoundedContext).forEach(key => {
                    this.resultDevideBoundedContext[key].boundedContexts.forEach(bc => {
                        bc.requirements = [];
                    });
                });
                this.generateDevideBoundedContext(aspect, feedback);
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
                this.generator = new RequirementsMappingGenerator(this);
                this.state.generator = "RequirementsMappingGenerator";
                this.generatorName = "RequirementsMappingGenerator";

                if(aspect){
                    this.devisionAspectIndex = this.devisionAspect.findIndex(x => x == aspect);
                    this.currentProcessingBoundedContext = this.resultDevideBoundedContext[this.devisionAspect[this.devisionAspectIndex]].boundedContexts[this.bcInAspectIndex].alias;
                }
                this.input['boundedContext'] = this.resultDevideBoundedContext[this.devisionAspect[this.devisionAspectIndex]].boundedContexts[this.bcInAspectIndex];
                this.input['requirementChunk'] = this.userStoryChunks[this.userStoryChunksIndex];
                this.generator.generate();
            },

            generateDevideBoundedContext(aspect, feedback){
                // 현재 요약본이 너무 길면 먼저 요약 진행
                if (this.value.userStory.length > 6000 || this.summarizedResult.length > 6000) {
                    this.pendingBCGeneration = true;
                    this.summarizeRequirements();
                    return;
                }
                
                this.generator = new DevideBoundedContextGenerator(this);
                this.state.generator = "DevideBoundedContextGenerator";
                this.generatorName = "DevideBoundedContextGenerator";
                
                if(!aspect){
                    this.resultDevideBoundedContext = {};
                    this.devisionAspectIndex = 0;
                    this.input['devisionAspect'] = this.devisionAspect[this.devisionAspectIndex];
                }else{
                    this.input['previousAspectModel'] = this.resultDevideBoundedContext[aspect];
                    this.resultDevideBoundedContext[aspect] = {};
                    this.devisionAspectIndex = 5;
                    this.input['devisionAspect'] = aspect;
                    this.input['feedback'] = feedback;
                }
                
                this.input['requirements'] = {
                    userStory: this.value.userStory,
                    summarizedResult: this.summarizedResult,
                    ddl: this.inputDDL
                };

                this.generator.generate();
                this.isGeneratingBoundedContext = true;
                this.showDevideBoundedContextDialog = true;
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
                console.log("[*] 선택된 BC 구성 옵션을 기반으로 생성이 시도됨", {selectedStructureOption})

                this.generators.PreProcessingFunctionsGenerator.buildInitialInputs(selectedStructureOption)
                this.generators.PreProcessingFunctionsGenerator.initInputs()
                this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist()
            },

            generateFromDraftWithXAI(draftOptions){
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
            }
        }
    }
</script>
<style>
</style>


