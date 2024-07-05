<template>
    <div v-if="modelCreationCompleted">
        <!-- 모델링 관련 AI Chat 버튼  -->
        <v-btn class="generator-ui-btn"
            v-if="!openGeneratorUI"
            fab
            primary
            fixed
            @click="openGeneratorUI=!openGeneratorUI"
        >
            <v-icon>mdi-auto-fix</v-icon>
            <!-- <Icon icon="arcticons:openai-chatgpt" width="35" height="35" /> -->
        </v-btn>
        <v-row v-if="openGeneratorUI" style="position:absolute; right:30px; top:75px;">
            <v-card style="text-align: center; z-index: 2;" width="auto">
                <v-card-text :style="(isExpanded && generationStopped) ? { width: '75px' } : isExpanded ? { width: '170px' } : { width: '450px' }" 
                    style="padding: 0px; ">
                    <v-progress-linear  :indeterminate="generationStopped" v-if="generationStopped"
                        style="margin-top: 10px; pointer-events: none;"
                    ></v-progress-linear>

                    <div v-if="showStopBtn && generationStopped" style="text-align: right; position: absolute; right: 15px; top: 65px;">
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn @click="stop()"
                                    icon small
                                    v-bind="attrs"
                                    v-on="on"
                                    style="z-index:2"
                                >
                                    <v-icon style="margin-right: 5px;">mdi-stop-circle-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>Stop</span>
                        </v-tooltip>
                    </div>
                    <div v-else style="text-align: right; position: absolute; right: 10px; top: 55px;">
                    <template v-if="isShowRegenerateBtn && (!SelectChatTab) && (prevUsedGeneratorTabIndex !== null)">
                        <v-tooltip  bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn @click="reGenerate(input['userStory'])"
                                    v-if="!hasElements && generatorName==='BMGenerator' "
                                    icon small
                                    v-bind="attrs"
                                    v-on="on"
                                    style="margin-right: 5px; z-index:2"
                                    class="gs-es-auto-modling-btn"
                                >
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                                <v-btn @click="reGenerate(input['userStory'])"
                                    v-else
                                    icon small
                                    v-bind="attrs"
                                    v-on="on"
                                    style="margin-right: 5px; z-index:2"
                                    class="gs-es-auto-modling-btn"
                                >
                                    <v-icon>mdi-refresh</v-icon>
                                </v-btn>
                            </template>
                            <span>Try again</span>
                        </v-tooltip>
                    </template>
                        
                    <v-tooltip bottom v-if="showContinueBtn && (isAutoGen || generationCompleted)">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn v-if="generatorStep === 'aggregate' || generatorName === 'CJMGenerator' || generatorName === 'BMGenerator' || generatorName === 'UserStoryMapGenerator'"
                                    @click="finishModelCreation()"
                                    small
                                    v-bind="attrs"
                                    v-on="on"
                                    class="gs-es-auto-modling-btn"
                                    style="padding:0px 5px; margin-right:10px;"
                                    color="primary"
                                >
                                    <div v-if="generatorName === 'CJMGenerator' || generatorName === 'BMGenerator' || generatorName === 'UserStoryMapGenerator'">
                                        <span><Icon style="float:left; margin-right:3px;" icon="ri:check-fill" width="16" height="16"/>complete</span>
                                    </div>
                                    <div v-else>
                                        <span>CONTINUE<v-icon>mdi-arrow-right</v-icon></span>
                                    </div>
                                </v-btn>
                            </template>
                            <span>Auto modeling completed</span>
                        </v-tooltip>
                        <v-tooltip bottom v-else-if="showGenerateBtn">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    v-if="!hasElements"
                                    @click="generate()"
                                    small
                                    v-bind="attrs"
                                    v-on="on"
                                    class="gs-es-auto-modling-btn"
                                    style="padding:0px 5px; margin-right:10px;"
                                    color="primary"
                                >
                                    <div>
                                        <span>Generate<v-icon>mdi-arrow-right</v-icon></span>
                                    </div>
                                </v-btn>
                            </template>
                            <span>Click to generate model</span>
                        </v-tooltip>

                        <slot v-if="showContinueBtn" name="buttons"></slot>
                    </div>

                    <v-tabs v-model="userPanel">
                        <v-tab v-for="tab in tabs" :key="tab.component" :disabled="hasElements&&(!tab.isAlwaysActivated)" :style="(isExpanded|isGenerated) ? { display: 'none' } : { }" style="z-index:3;" 
                               @click="switchGenerator('tab', tab.isShowGenerateBtn, tab.isShowContinueBtn, tab.isShowStopBtn, tab.isShowRegenerateBtn)">{{tab.name}}</v-tab>
                        <v-tab :disabled="hasElements && !showGenerateBtn" :style="(isExpanded|isGenerated) ? { display: 'none' } : { }" style="z-index:3;" @click="switchGenerator('input', true, true, true, true)">Input</v-tab>
                        <v-tab :disabled="hasElements && !showGenerateBtn" :style="(isExpanded|isGenerated) ? { display: 'none' } : { }" style="z-index:3;" @click="switchGenerator('output', false, true, true, true)">Output</v-tab>
                        <v-tab :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;" @click="switchGenerator('chat', false, false, false, false)">Chat</v-tab>
                    </v-tabs>

                    <v-expansion-panels v-model="autoModelDialog">
                        <v-expansion-panel style="padding:0px;">
                            <v-expansion-panel-header disable-icon-rotate style="position:absolute;">
                                <template v-slot:actions>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn @click="openGeneratorUI = !openGeneratorUI"
                                                icon small
                                                class="cp-panel-folding"
                                                v-bind="attrs"
                                                v-on="on"
                                                style="position:absolute; top:-38px; right:0px; z-index:2"
                                            >
                                                <v-icon>mdi-close</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>close Auto Generator</span>
                                    </v-tooltip>
                                </template>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content class="auto-modeling-dialog pa-0" >
                                <v-tabs-items v-model="userPanel">
                                    <v-tab-item v-for="tab in tabs" :key="tab.component" :disabled="hasElements">
                                        <component :is="tab.component" :ref="tab.component" @generate="generate()" :initValue="tab.initValue"></component>
                                    </v-tab-item>

                                    <v-tab-item :disabled="hasElements">
                                        <v-card flat>
                                            <v-textarea v-if="input"
                                                v-model="input.userStory"
                                                class="auto-modeling-dialog-textarea"
                                                style="font-size: small; padding-top:40px; height: 100%;"
                                            >
                                            </v-textarea>
                                        </v-card>
                                    </v-tab-item>

                                    <v-tab-item :disabled="hasElements">
                                        <v-card flat>
                                            <v-textarea
                                                v-model="displayResult"
                                                @scroll="handleScroll" id="scroll-text"
                                                class="auto-modeling-dialog-textarea"
                                                style="font-size: small; padding-top:40px; height: 100%;"
                                            >
                                            </v-textarea>
                                        </v-card>
                                    </v-tab-item>

                                    <v-tab-item>
                                        <v-card flat>
                                            <div id="scroll_messageList"
                                                style="height: 100%; max-height: 75vh;
                                                overflow: auto; padding:10px;
                                                border-bottom: solid 2px rgba(0, 0, 0, 0.2);"
                                            >
                                                <v-alert
                                                    dense
                                                    color="blue"
                                                    outlined
                                                    type="info"
                                                    style="text-align: left;"
                                                >Please select any deployment model to modify settings
                                                </v-alert>
                                                <v-col cols="12" class="pa-0">
                                                    <div v-for="message in chatList" :key="message">
                                                        <!-- 내가 입력한 텍스트  -->
                                                        <div v-if="message.type == 'prompt'"
                                                            class="d-flex justify-end"
                                                            style="margin-bottom:20px;"
                                                        >
                                                            <v-sheet class="pa-2"
                                                                style="background-color:#E5F3FB;
                                                                    border-radius: 6px;"
                                                            >{{ message.text }}
                                                            </v-sheet>
                                                        </div>
                                                        <!-- 답변을 받는 텍스트 -->
                                                        <v-sheet v-else-if="message.type == 'response'"
                                                            class="grey lighten-3 pa-2"
                                                            style="display:inline-block;
                                                                width: 415px;
                                                                overflow: auto;
                                                                text-align: left; 
                                                                margin-bottom:20px;
                                                                border-radius: 6px;"
                                                        >
                                                            <pre style="font-size: small; text-align: left;">{{ message.text }}</pre>
                                                        </v-sheet>
                                                    </div>                                    
                                                </v-col>
                                            </div>
                                            <v-text-field
                                                v-model="chatMessage"
                                                class="prompt_field generator-ui-text-field"
                                                solo
                                                autofocus
                                                append-icon="mdi-send"
                                                :disabled="selectedElement.length === 0"
                                                @click:append="generate()"
                                                @keypress.enter="generate()"
                                            >
                                            </v-text-field>                                     
                                        </v-card>
                                    </v-tab-item>
                                </v-tabs-items>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </v-card-text>
            </v-card>
        </v-row>
    </div>
</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import ESGenerator from './ESGenerator.js'
    import BigPictureESGenerator from './BigPictureESGenerator.js'
    import EventOnlyESGenerator from './EventOnlyESGenerator.js'
    import CJMGenerator from './CJMGenerator.js'
    import UMLGenerator from './UMLGenerator.js'
    import BMGenerator from './BMGenerator.js'
    import UserStoryMapGenerator from './UserStoryMapGenerator.js'
    import ModelModificationGenerator from './ModelModificationGenerator.js'
    import AggregateMemberGenerator from './AggregateMemberGenerator.js'
    import KubernetesGenerator from './KubernetesGenerator.js'
    import KubernetesModificationGenerator from './KubernetesModificationGenerator.js'
    import Usage from '../../../../utils/Usage'
    import DebeziumLogsTab from "./generatorTabs/DebeziumLogsTab.vue"
    
    //import UserStoryGenerator from './UserStoryGenerator.js'

    export default {
        name: 'generator-ui',
        props: {
            projectId: {
                type: String,
                default:function(){
                    return null;
                }
            },
            generator: String,
            generatorParameter: Object,
            modelerValue: Object,
            generatorStep: String,
            defaultInputData: Object,
            modelValue: Object,
            tabs: {
                type: Array,
                default: function(){
                    return [];
                }
            },
            isGenerated: {
                type: Boolean,
                default: false
            },
            chatGenerators: {
                type: Array,
                default: function(){
                    return [];
                }
            }
        },
        components: {
            DebeziumLogsTab
        },

        created(){
            if(this.createGenerator()){
                if(this.isAutoGen){
                    this.openGeneratorUI = true
                    this.generate();
                } else {
                    this.generationStopped = false
                    this.input = this.defaultInputData
                    this.input.userStory = this.generatorComponent.createPrompt();
                    this.input.selectedElement = {}
                    this.input.modificationMessage = ""
                    this.chatMessage = ""
                }
            }

            if(this.isGenerated){
                this.userPanel = 2 + this.tabs.length;
                this.switchGenerator('chat')
            }
        },
        watch: {
            result() {
                this.$nextTick(() => {
                    if (this.autoScroll) {
                        this.scrollToBottom();
                    }
                });
            },
            modelValue: {
                deep: true,
                handler(newValue, oldValue) {
                    if (newValue && newValue.elements) {
                        const elements = newValue.elements;
                        const keys = Object.keys(elements);
                        this.hasElements = false;
    
                        for (const key of keys) {
                            if (elements[key] !== null) {
                                this.hasElements = true;
                                break;
                            }
                        }
                    }
                }
            },
        },

        data() {
            return {
                SelectChatTab: false,
                showGenerateBtn: true,
                isAutoGen: true,
                generationCompleted: false,
                test: "",
                input: null,
                result: '',
                generatorName: null,
                generatorComponent: null,
                generatorUIComponent: null,
                autoModelDialog: 0,
                generationStopped:true,
                autoScroll: true,
                userPanel: 1,
                isExpanded: false,
                modelCreationCompleted: true,
                associatedProject: null,
                openAiMessageList: [],
                chatList: [],
                selectedElement: [],
                chatMessage: "",
                hasElements: false,
                openGeneratorUI: false,
                focusedTabComponent: null,
                tabUserProps: {},
                prevUsedGeneratorTabIndex: null,
                showContinueBtn: true,
                showStopBtn: true,
                isShowRegenerateBtn: true
            }
        },
        computed: {
            displayResult() {
                return (this.savedResult != '' && !this.generationStopped) ? this.savedResult : this.result;
            }
        },
        mounted: async function () { 
            var me = this
            me.$EventBus.$on('selectedElement', function (selectedObj) {
                var id = selectedObj.id

                if (selectedObj['selected']) {
                    me.selectedElement.push(selectedObj)
                    if(me.modelValue){
                        me.input.selectedElement = JSON.parse(JSON.stringify(selectedObj.value));
                    }
                } else {
                    var fidx = me.selectedElement.findIndex(obj => obj.id == id)
                    if (fidx != -1) {
                        me.selectedElement.splice(fidx, 1);
                    }
                    me.input.selectedElement = {}
                }

            });

            if(me.$attrs.embedded) {
                this.hasElements = true;
                this.switchGenerator('chat');
                this.userPanel = 2 + this.tabs.length;
            }
        },
        updated() {
            this.$nextTick(() => {
                const scrollText = document.getElementById('scroll-text');
                if (scrollText && this.autoScroll) {
                    this.scrollToBottom();
                }
            });
        },
        methods: {
            createGenerator(){
                if(!this.generator){
                    let prevStateJson = localStorage["gen-state"];

                    if(prevStateJson && prevStateJson != "null"){
                        let prevState = JSON.parse(prevStateJson);

                        if(!prevState.generator) throw new Error("No generator information inside localstroage.gen-state");
                        
                        this.input = prevState;
                        this.generatorName = prevState.generator;
                       
                        localStorage["gen-state"] = null;
                    } else {
                        this.isAutoGen = false
                        this.userPanel = 0 + this.tabs.length
                        this.generatorName = this.defaultInputData.generator
                    }
                } else {
                    this.generatorName = this.generator;
                    this.input = this.generatorParameter;
                }

                try{
                    //this.generator = eval("new " + prevState.generator + "(this)");

                    switch(this.generatorName){
                        case "ESGenerator": this.generatorComponent = new ESGenerator(this); break;
                        case "BigPictureESGenerator": this.generatorComponent = new BigPictureESGenerator(this); break;
                        case "EventOnlyESGenerator": this.generatorComponent = new EventOnlyESGenerator(this); break;
                        case "CJMGenerator": this.generatorComponent = new CJMGenerator(this); break;
                        case "UMLGenerator": this.generatorComponent = new UMLGenerator(this); break;
                        case "BMGenerator": this.generatorComponent = new BMGenerator(this); break;
                        case "UserStoryMapGenerator": this.generatorComponent = new UserStoryMapGenerator(this); break;
                        case "AggregateMemberGenerator": this.generatorComponent = new AggregateMemberGenerator(this); break;
                        case "KubernetesGenerator": this.generatorComponent = new KubernetesGenerator(this); break;

                    }

                    return this.generatorComponent;

                }catch(e){
                    console.log(e);

                    throw new Error("No proper generator for " + prevState.generator);
                }
            
            },
            finishModelCreation() {
                this.$EventBus.$emit('modelCreationFinished', this.generatorStep);

                this.generationStopped = false;
                this.modelCreationCompleted = false;
            },
            scrollToBottom() {
                const scrollText = document.getElementById('scroll-text');
                if (scrollText) {
                    scrollText.scrollTop = scrollText.scrollHeight;
                }
            },
            handleScroll() {
                const scrollText = document.getElementById('scroll-text');
                if (scrollText) {
                    const isScrolledToBottom = scrollText.scrollHeight - scrollText.scrollTop <= scrollText.clientHeight;
                    this.autoScroll = isScrolledToBottom;
                }
            },
            onReceived(content){
                this.result = content;
            },
            // onGenerationFinished(){
                // console.log("Finished")
                // this.generator.onGenerationFinished();
            // }, 

            async generate(changedInput){
                let issuedTimeStamp = Date.now()
                let usage = new Usage({
                    serviceType: `${this.generatorComponent.generateType}_AIGeneration`,
                    issuedTimeStamp: issuedTimeStamp,
                    expiredTimeStamp: Date.now(),
                    metadata: {
                        projectId: this.input.associatedProject ? this.input.associatedProject : null,
                        modelId: this.projectId
                    }
                });
                if(!await usage.use()){
                    this.stop()
                    return false;
                }

                if(changedInput)
                    this.input = changedInput;

                this.result = '';
                this.prevUsedGeneratorTabIndex = this.userPanel
                
                if(this.generatorName === "ModelModificationGenerator"){
                    this.input.modificationMessage = this.chatMessage
                    if(this.input.modificationMessage=="") return;

                    if(this.chatGenerators.length > 0) {
                        for(let chatGenerator of this.chatGenerators) {
                            const chatGeneratorModule = await import(`./chatPlugins/${chatGenerator}.js`)
                            const generatorInstance = new chatGeneratorModule.default(this)
                            
                            if(generatorInstance.isMatchedGenerator(this.input.modificationMessage)) {
                                var message = {
                                    text: this.input.modificationMessage,
                                    type: "prompt"
                                }
                                this.chatList.push(message);
                                this.chatMessage = ""
                                generatorInstance.generate();
                                return
                            }
                        }
                    }

                    var message = {
                        text: this.input.modificationMessage,
                        type: "prompt"
                    }
                    this.chatList.push(message);
                    this.chatMessage = ""
                    this.generatorComponent.generate();
                }else{
                    this.focusedTabComponent = (this.userPanel < this.tabs.length) ? this.$refs[this.tabs[this.userPanel].component][0] : null
                    if (this.focusedTabComponent) {
                        if(this.tabs[this.userPanel].isClearModelValue)
                            this.$emit("clearModelValue")

                        //#region 추가 탭 선택시에 관련 메세지 유효성 검증 & 입력된 값을 통한 프롬프트 초기화 및 생성
                        if(this.focusedTabComponent.getValidErrorMsg) {
                            const msg = this.focusedTabComponent.getValidErrorMsg()
                            if(msg) {
                                alert(msg)
                                return;
                            }
                        }

                        this.generatorComponent = this.focusedTabComponent.getGenerater(this)
                        this.tabUserProps = this.focusedTabComponent.getUserProps ? this.focusedTabComponent.getUserProps() : {}
                        const userPrompt = this.generatorComponent.createPrompt(this.tabUserProps)
                        let generateOption = {
                            "messages": [{
                                role: 'user',
                                content: userPrompt
                            }],
                            "action": "skipCreatePrompt"
                        }
                        this.generatorComponent.generate(generateOption);
                        //#endregion

                        
                        this.generationStopped = true;
                        if(!(this.tabs[this.userPanel].isNotMoveToOutput))
                            this.userPanel = 1 + this.tabs.length
                        return
                    } else if(!this.isAutoGen || this.generatorStep === 'aggregate') {
                        this.$emit("clearModelValue")

                        let generateOption = {
                            "messages": [],
                            "action": "skipCreatePrompt"
                        }
                        if(this.generatorStep === 'aggregate'){
                            const removalStrings = [
                                "Please create an event storming model in json for following service: 4",
                                "The result must be in JSON format and the name of events must be in \"Adjectivalized Object\" that means In this structure, the object, which is used in verb form, is transformed into an adjective and comes first, followed by the past tense verb.\n        for example, \"OrderPlaced\", \"PaymentCompleted\", \"JobDone\". not \"Placed Order\", \"Complete Payment\", \"Do Job\".\n        Event Names must be less than 3 words.\n        : \n        \n        {\n            \"serviceName\": \"Service Name\",\n            \"actors\": [\"Actor Name\"],\n            \"events\": [\n\n                {\n                    \"actor\": \"Actor Name\",\n                    \"name\": \"Event Name\", // must be in Past tense. i.e. Order Placed (p.p.).  Less than 3 words.\n                    \"undefinedName\": \"name in undefined\", // must be in Past tense. i.e. 택시 호출됨. (p.p.).\n                }\n            ]\n        \n        }\n "
                            ];
    
                            removalStrings.forEach(str => {
                                this.input.userStory = this.input.userStory.replace(str, '');
                            });
                            this.input.userStory = this.generatorComponent.createPrompt();
                        }
                        generateOption.messages.push({
                            role: 'user',
                            content: this.input.userStory
                        })
    
                        this.generatorComponent.generate(generateOption);
                    } else {
                        this.generatorComponent.generate();
                    }
                    this.userPanel = 1 + this.tabs.length
                }

                this.generationStopped = true;
                if(this.generatorName == 'EventOnlyESGenerator'){
                    this.$emit("showContinueBtn")
                    this.showGenerateBtn = false
                }
            },
            switchGenerator(mode, isShowGenerateBtn, isShowContinueBtn, isShowStopBtn, isShowRegenerateBtn){
                // CHAT 탭엔 경우에는 GENERATE 버튼이 보여지지 않게 만듬
                this.showGenerateBtn = isShowGenerateBtn ? isShowGenerateBtn : false
                this.showContinueBtn = isShowContinueBtn ? isShowContinueBtn : false
                this.showStopBtn = isShowStopBtn ? isShowStopBtn : false
                this.isShowRegenerateBtn = isShowRegenerateBtn ? isShowRegenerateBtn : false
                this.SelectChatTab = false

                if(mode && mode=='chat'){
                        this.chatList = []
                        this.openAiMessageList = []
                        this.input.modificationMessage = ""
                        this.chatMessage = ""
                        this.SelectChatTab = true

                        switch(this.generatorName){
                            case "KubernetesGenerator": this.generatorComponent = new KubernetesModificationGenerator(this); break;
                            default: this.generatorComponent = new ModelModificationGenerator(this); break;
                        }

                        this.generatorName = "ModelModificationGenerator"
                }
                else
                    this.createGenerator();
            },

            async reGenerate(userStory){
                this.result = '';
                this.$emit("clearModelValue")

                // OUTPUT탭을 활성화한채로 재생성 버튼을 눌렀을 경우, 이전에 생성하는데 사용한 생성기를 사용하고,
                // OUTPUT탭이 아닌 곳에서 재생성 버튼을 눌렀을 경우, 활성화된 탭의 생성기를 활용함
                let checkTabIndex = null
                if(this.userPanel === 1 + this.tabs.length) 
                    checkTabIndex = (this.prevUsedGeneratorTabIndex !== null) ? this.prevUsedGeneratorTabIndex : this.userPanel
                else
                    checkTabIndex = this.userPanel

                this.focusedTabComponent = (checkTabIndex < this.tabs.length) ? this.$refs[this.tabs[checkTabIndex].component][0] : null
                if (this.focusedTabComponent) {
                    const msg = this.focusedTabComponent.getValidErrorMsg()
                    if(msg) {
                        alert(msg)
                        return;
                    }

                    this.generatorComponent = this.focusedTabComponent.getGenerater(this)
                    this.tabUserProps = this.focusedTabComponent.getUserProps ? this.focusedTabComponent.getUserProps() : {}
                    const userPrompt = this.generatorComponent.createPrompt(this.tabUserProps)
                    let generateOption = {
                        action: "reGenerate",
                        messages: userPrompt
                    }
                    this.generatorComponent.generate(generateOption);
                } else {
                    this.switchGenerator()
                    let reGeneratePrompt = {
                        action: "reGenerate",
                        messages: userStory
                    }
                    this.generatorComponent.generate(reGeneratePrompt);
                }

                this.generationStopped = true;
                this.userPanel = 1 + this.tabs.length
            },

            continueGenerator(){
                // this.generator.continue();
            },

            stop(){
                this.generatorComponent.stop();
                this.savedResult = this.result;
                this.generationStopped = false;
            },

            onModelCreated(model){
                const callbackModelValueToTabComponent = () => {
                    this.focusedTabComponent = (this.prevUsedGeneratorTabIndex < this.tabs.length) ? this.$refs[this.tabs[this.prevUsedGeneratorTabIndex].component][0] : null
                    if (this.focusedTabComponent) {
                        this.focusedTabComponent.onModelCreated(model)
                    }
                }

                if(this.generatorName === "ModelModificationGenerator"){
                    this.$emit("modificateModel", model)
                } else{
                    this.$emit("createModel", model)
                }
                callbackModelValueToTabComponent()
            },

            onGenerationFinished(model){
                const callbackModelValueToTabComponent = () => {
                    this.focusedTabComponent = (this.prevUsedGeneratorTabIndex < this.tabs.length) ? this.$refs[this.tabs[this.prevUsedGeneratorTabIndex].component][0] : null
                    if (this.focusedTabComponent) {
                        this.focusedTabComponent.onGenerationFinished(model)
                    }
                }
                
                this.generationStopped = false;
                this.$emit("onGenerationFinished")
                this.publishModelChanges(model)
                
                // JSON Modification finished
                if(this.generatorName === "ModelModificationGenerator"){
                    var response = {
                        text: this.result,
                        type: 'response'
                    }
                    this.chatList.push(response);
                }else{
                    this.savedResult = this.result;

                    if(!this.focusedTabComponent)
                        this.input['userStory'] = this.generatorComponent.previousMessages[0].content

                    if(this.prevUsedGeneratorTabIndex < this.tabs.length) {
                        if(!(this.tabs[this.prevUsedGeneratorTabIndex].isNotMoveToOutput))
                            this.userPanel = 1 + this.tabs.length
                    }
                    else
                        this.userPanel = 1 + this.tabs.length
                }

                callbackModelValueToTabComponent()
                this.generationCompleted = true
            },

            publishModelChanges(model){
                const channel = new BroadcastChannel('ai-generator');

                channel.postMessage({
                    generator: this.generatorName,
                    model: model
                });
            }
        }
    }
</script>
<style>
.generator-ui-btn {
    bottom:20px;
    right:20px;
}
.expanded {
  width: 200px;
}

.collapsed {
  width: 450px; /* 원하는 가로 길이로 조정 */
}
@media only screen and (max-width: 1093px) {
    .generator-ui-btn {
        bottom:20px;
        right:85px;
    }
}
@media only screen and (max-width: 600px) {
    .generator-ui-btn {
        bottom:110px;
        right:60px;
        width:40px !important;
        height:40px !important;
    }
}
</style>


