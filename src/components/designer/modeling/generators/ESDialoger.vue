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
                    <v-btn class="auto-modeling-btn" @click="summarizeRequirements()">TEST Summarize</v-btn>
                    <v-btn class="auto-modeling-btn" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('ESDialoger.tryAgain') }}</v-btn>
                    <v-btn class="auto-modeling-btn" color="primary" @click="generateDevideBoundedContext()">{{ $t('ESDialoger.createBoundedContext') }}</v-btn>
                </v-card-actions>
            </v-card>

            <v-card v-if="showDevideBoundedContextDialog" class="auto-modeling-user-story-card" style="margin-top: 30px !important;">
                <DevideBoundedContextDialog
                    :resultDevideBoundedContext="resultDevideBoundedContext"
                    @createModel="jump"
                    @closeDialog="showDevideBoundedContextDialog = false"
                    @stop="stop"
                    @reGenerate="reGenerate"
                    @reGenerateAspect="reGenerateAspect"
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
    import RequirementsSummarizer from './RequirementsSummarizer.js';
    import TextChunker from './TextChunker.js';

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

            this.textChunker = new TextChunker({
                chunkSize: 2000,  // GPT-4 컨텍스트 크기를 고려한 설정
                overlapSize: 100  // 문맥 유지를 위한 오버랩
            });
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

                textChunker: null,
                chunks: [],
                currentChunkIndex: 0,
                summarizedChunks: [],
                summarizedResult: ""
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
                this.done = true;

                if (this.state.generator === "RequirementsSummarizer") {
                    if (!model.summarizedRequirements.isFinalSummary) {
                        this.summarizedChunks.push(model.summarizedRequirements);
                        this.currentChunkIndex++;
                        
                        if (this.currentChunkIndex < this.chunks.length) {
                            this.processNextChunk();
                            return;
                        } else if (this.summarizedChunks.length > 1) {
                            this.processNextChunk();
                            return;
                        }
                    }
                    // 최종 요약 완료 또는 단일 청크 처리 완료
                    console.log("Final summarization complete");
                    this.state.generator = "EventOnlyESGenerator";
                    this.generatorName = "EventOnlyESGenerator";
                    return;
                }

                if(this.state.generator === "DevideBoundedContextGenerator"){
                    if(this.devisionAspectIndex < this.devisionAspect.length - 1) {
                        if(!this.generator)
                        this.generator = new DevideBoundedContextGenerator(this);
                        this.generator.generate();
                    }else{
                        this.devisionAspectIndex = 0;
                        
                        this.generator = new Generator(this);
                        this.state.generator = "EventOnlyESGenerator";
                        this.generatorName = "EventOnlyESGenerator";
                    }
                
                    this.devisionAspectIndex++;
                    this.input['devisionAspect'] = this.devisionAspect[this.devisionAspectIndex];
                    this.$set(this.resultDevideBoundedContext, model.devisionAspect, model)
                    this.showDevideBoundedContextDialog = true
                    console.log("output: ", model)
                    return;
                }

                this.$emit("input", this.value);
                this.$emit("change", 'eventStorming');
                
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

            summarizeRequirements() {
                // 텍스트를 청크로 분할
                this.chunks = this.textChunker.splitIntoChunks(this.value.userStory);
                this.currentChunkIndex = 0;
                this.summarizedChunks = [];

                // 디버깅을 위한 청크 통계 출력
                console.log('Chunk statistics:', this.textChunker.getChunkStats(this.chunks));
                
                // 첫 번째 청크 처리 시작
                this.processNextChunk();

            },    

            processNextChunk() {
                this.generator = new RequirementsSummarizer(this);
                this.state.generator = "RequirementsSummarizer";
                this.generatorName = "RequirementsSummarizer";

                if (this.currentChunkIndex >= this.chunks.length) {
                    // 모든 청크 처리 완료, 최종 요약 생성
                    this.summarizedResult = this.summarizedChunks.join('\n\n');

                    console.log("Before summarize: ", this.value.userStory.length)
                    console.log("After summarize: ", this.summarizedResult.length)
                } else {
                    // 개별 청크 처리
                    this.input['requirements'] = {
                        userStory: this.chunks[this.currentChunkIndex],
                        currentChunk: this.currentChunkIndex + 1,
                        totalChunks: this.chunks.length,
                        isFinalSummary: false
                    };
                    this.generator.generate();
                }

            },

            generateDevideBoundedContext(aspect, feedback){
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


