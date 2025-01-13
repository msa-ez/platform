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
                    <v-btn :disabled="isSummarizeStarted" class="auto-modeling-btn" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('ESDialoger.tryAgain') }}</v-btn>
                    <v-btn :disabled="isSummarizeStarted" class="auto-modeling-btn" color="primary" @click="generateDevideBoundedContext()">{{ $t('ESDialoger.createBoundedContext') }}</v-btn>
                </v-card-actions>
            </v-card>

            <v-card v-if="showDevideBoundedContextDialog" class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                <DevideBoundedContextDialog
                    :resultDevideBoundedContext="resultDevideBoundedContext"
                    :isStartMapping="isStartMapping"
                    :processingRate="processingRate"
                    :currentProcessingBoundedContext="currentProcessingBoundedContext"
                    @createModel="jump"
                    @closeDialog="showDevideBoundedContextDialog = false"
                    @stop="stop"
                    @reGenerate="reGenerate"
                    @reGenerateAspect="reGenerateAspect"
                    @mappingRequirements="mappingRequirements"
                ></DevideBoundedContextDialog>
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
            DevideBoundedContextDialog
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

                summarizedResult: "",
                isSummarizeStarted: false,
                userStoryChunks: [],
                userStoryChunksIndex: 0,
                bcInAspectIndex: 0,
                isStartMapping: false,
                processingRate: 0,
                currentProcessingBoundedContext: ""
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
                if (this.summarizedResult.length == 0 || this.summarizedResult.length > 6000) {
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
                this.showDevideBoundedContextDialog = true;
            },

            jump(selectedStructureOption){
                if(!selectedStructureOption) return

                console.log("[*] 선택된 BC 구성 옵션을 기반으로 생성이 시도됨", {selectedStructureOption})
                var me = this

                try {

                    if(me.isServerProject) me.state.associatedProject = me.modelIds.projectId

                    // 새탭 생성시에 해당 BC 정보를 이용해서 자동으로 생성
                    let generatorInputs = selectedStructureOption.boundedContexts.map(bc => ({
                        boundedContext: {
                            name: bc.name,
                            alias: bc.alias,
                            displayName: bc.alias,
                            description: bc.requirements,
                            aggregates: bc.aggregates
                        },
                        description: bc.requirements
                    }))
                    const passedGeneratorInputs = JSON.parse(JSON.stringify(generatorInputs))
                    const currentGeneratorInput = generatorInputs.shift()

                    me.state = {
                        ...me.state,
                        userStory: me.value.userStory,
                        ...currentGeneratorInput,
                        leftGeneratorInputs: generatorInputs,
                        passedGeneratorInputs: passedGeneratorInputs,
                        generator: "PreProcessingFunctionsGenerator"
                    }
                    console.log("[*] 생성 준비를 위한 입력값 구축 완료", {state: me.state})

                } catch(e) {

                    console.error("[*] 생성 준비를 위한 입력값 구축과정에서 에러 발생", {error: e, selectedStructureOption})
                    alert("[!] There was an error building inputs for event storm generation, please try again.")
                    return

                }


                try{
                   
                    if(!me.value.modelList){
                        me.value.modelList = []
                    }

                    me.$emit("input", me.value);
                    me.$emit("change", 'eventStorming');

                    // GeneratorUI.createGenerator() 함수에서 해당 값을 받아서 자동 처리 수행
                    localStorage["gen-state"] = JSON.stringify(me.state);;
                    window.open(`/#/storming/${me.modelIds.ESDefinitionId}`, "_blank")
                    me.isCreatedModel = true;

                }catch(e){

                    console.log("[*] 생성 준비를 위한 입력값 구축과정에서 에러 발생", {error: e, state: me.state, selectedStructureOption})
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

                    }

                    this.jump();

                }
            },

            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },


        }
    }
</script>
<style>
</style>


