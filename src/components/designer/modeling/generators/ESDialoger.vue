<template>
    <div style="margin-top: 10px;">
        <div class="auto-modeling-message-border">
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
        <div style="display: flex; flex-direction: column;">
            <v-card v-if="!state.secondMessageIsTyping" class="auto-modeling-user-story-card">
                <v-card-subtitle>{{$t('autoModeling.explanation')}}</v-card-subtitle>
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
                <v-btn v-if="!done" @click="stop()" style="position: absolute; right:10px; top:10px;"><v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>Stop generating</v-btn>
                <v-card-actions v-if="done" class="auto-modeling-btn-box">
                    <v-btn class="auto-modeling-btn" @click="generate()"><v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>Try again</v-btn>
                    <v-btn class="auto-modeling-btn" color="primary" @click="generateDevideBoundedContext()">Create Bounded Context</v-btn>
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
                showDevideBoundedContextDialog: false,
                resultDevideBoundedContext: {},
                devisionAspect: ["Domain", "Organizational", "Persona", "Transaction/Performance", "Infrastructure"],
                devisionAspectIndex: 0
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
                if(this.state.generator === "DevideBoundedContextGenerator"){
                    return;
                }

                if(!this.value){
                    this.value = {
                        userStory: ''
                    }
                }
                this.value.userStory = content;
            },

            onModelCreated(model){
            },

            async onGenerationFinished(model){
                this.done = true;

                if(this.state.generator === "DevideBoundedContextGenerator"){
                    if(this.devisionAspectIndex < this.devisionAspect.length - 1) {
                        if(!this.generator)
                        this.generator = new DevideBoundedContextGenerator(this);
                        this.generator.generate();
                    }else{
                        this.devisionAspectIndex = 0;
                        
                        this.generator = new Generator(this);
                        this.state.generator = "EventOnlyESGenerator";
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

            generateDevideBoundedContext(aspect, feedback){
                this.generator = new DevideBoundedContextGenerator(this);
                this.state.generator = "DevideBoundedContextGenerator";
                
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
                
                this.input['userStory'] = this.value.userStory;
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


