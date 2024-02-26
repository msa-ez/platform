<template>
    <div v-if="modelCreationCompleted">
        <v-row style="position:absolute; right:30px; top:75px;">
            <v-card style="text-align: center; z-index: 2;" width="auto">
                <v-card-text :style="(isExpanded && generationStopped) ? { width: '75px' } : isExpanded ? { width: '170px' } : { width: '450px' }" 
                    style="padding: 0px; ">
                    <v-progress-linear  :indeterminate="generationStopped" v-if="generationStopped"
                        style="margin-top: 10px; pointer-events: none;"
                    ></v-progress-linear>

                    <div v-if="generationStopped" style="text-align: right; position: absolute; right: 30px; top: 25px;">
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
                    <div v-else style="text-align: right; position: absolute; right: 20px; top: 10px;">
                        <!-- <v-tooltip  bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn @click="generate(test)"
                                    icon small
                                    v-bind="attrs"
                                    v-on="on"
                                    style="margin-right: 10px; z-index:2"
                                >
                                    <v-icon style="margin-right: 5px;">mdi-refresh</v-icon>
                                </v-btn>
                            </template>
                            <span>reCreate model use to json</span>
                        </v-tooltip> -->
                        <v-tooltip  bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn @click="reGenerate(input['userStory'])"
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
                        <!-- <v-tooltip  bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn @click="continueGenerator()"
                                    icon small
                                    v-bind="attrs"
                                    v-on="on"
                                    style="margin-right: 10px; z-index:2"
                                >
                                    <v-icon style="margin-right: 5px;">mdi-refresh</v-icon>
                                </v-btn>
                            </template>
                            <span>Continue</span>
                        </v-tooltip> -->
                        <v-tooltip bottom v-if="isAutoGen || generationCompleted">
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

                        <slot name="buttons"></slot>
                    </div>

                    <v-tabs v-model="userPanel">
                        <v-tab :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;" @click="switchGenerator()">Input</v-tab>
                        <v-tab :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;" @click="switchGenerator()">Output</v-tab>
                        <v-tab :disabled="selectedElement.length===0" :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;" @click="switchGenerator('chat')">Chat</v-tab>
                        <!-- <v-tab :style="isExpanded ? { display: 'none' } : { }" style="z-index:3;">TEST</v-tab> -->
                    </v-tabs>

                    <v-expansion-panels v-model="autoModelDialog">
                        <v-expansion-panel style="padding:0px;">
                            <v-expansion-panel-header disable-icon-rotate style="position:absolute;">
                                <template v-slot:actions>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn @click="isExpanded = !isExpanded"
                                                icon small
                                                class="cp-panel-folding"
                                                v-bind="attrs"
                                                v-on="on"
                                                style="position:absolute; top:-38px; right:0px; z-index:2"
                                            >
                                                <v-icon>mdi-unfold-more-horizontal</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Panel folding/unfolding</span>
                                    </v-tooltip>
                                </template>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content class="auto-modeling-dialog" >
                                <v-tabs-items v-model="userPanel">
                                    <v-tab-item>
                                        <v-card flat>
                                            <v-textarea v-if="input"
                                                v-model="input.userStory"
                                                class="auto-modeling-dialog-textarea"
                                                style="font-size: small; padding-top:0px; height: 100%;"
                                            >
                                            </v-textarea>
                                        </v-card>
                                    </v-tab-item>

                                    <v-tab-item>
                                        <v-card flat>
                                            <v-textarea
                                                v-model="displayResult"
                                                @scroll="handleScroll" id="scroll-text"
                                                class="auto-modeling-dialog-textarea"
                                                style="font-size: small; padding-top:0px; height: 100%;"
                                            >
                                            </v-textarea>
                                        </v-card>
                                    </v-tab-item>

                                    <v-tab-item>
                                        <v-card flat>
                                            <v-card-text id="scroll_messageList" style="height: 100%; max-height: 75vh; overflow-y: scroll;">
                                                <v-col cols="12">
                                                    <div v-for="message in chatList" :key="message">
                                                        <v-row v-if="message.type == 'prompt'" style="justify-content: right; margin-bottom: 20px;">
                                                            <v-card style="display:inline-block; width: 350px; text-align: left;">
                                                                <v-card-text class="auto-modeling-message">
                                                                    {{ message.text }}
                                                                </v-card-text>
                                                            </v-card>
                                                        </v-row>
                                                        <v-row v-else-if="message.type == 'response'" style="margin-bottom: 20px;">
                                                            <v-card style="display:inline-block; background-color: #DAF5FF; width: 400px; max-height: 500px; overflow-x: scroll; text-align: left;">
                                                                <v-card-text class="auto-modeling-message">
                                                                    <pre style="font-size: small;">{{ message.text }}</pre>
                                                                </v-card-text>
                                                            </v-card>
                                                        </v-row>
                                                        <!-- <v-textarea
                                                            v-else-if="message.type == 'response'"
                                                            v-model="message.text"
                                                            solo
                                                            class="auto-modeling-dialog-textarea"
                                                            style="font-size: small; padding-top:0px; width: 350px;"
                                                        >
                                                        </v-textarea> -->
                                                    </div>                                    
                                                </v-col>
                                                <div>
                                                    <!-- <v-btn v-if="generationStopped"
                                                        @click="validateDuplicateChatPrompt(promptList[promptList.length -1], 'retry')"
                                                        style="z-index:999; margin-top: 15px; color: black;" text>
                                                            <v-icon>mdi-refresh</v-icon>Regenerate Response
                                                    </v-btn>
                                                    <v-btn v-else @click="stopExplainCode()" style="z-index:999; margin-top: 15px; color: black;" text>
                                                        <v-icon>mdi-stop-circle-outline</v-icon>Stop generating
                                                    </v-btn> -->
                                                </div>
                                            </v-card-text>
                                            <v-card style="text-align: -webkit-center; height: 65px;">
                                                <v-text-field
                                                    v-model="chatMessage"
                                                    class="prompt_field"
                                                    style="width: 492px; background-color: #FFFFFF; color: white;"
                                                    outlined
                                                    autofocus
                                                    append-icon="mdi-send"
                                                    :disabled="selectedElement.length === 0"
                                                    @click:append="generate()"
                                                    @keypress.enter="generate()"
                                                >
                                                </v-text-field>                                     
                                            </v-card>
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
    import Usage from '../../../../utils/Usage'
    
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
        },

        created(){
            if(this.createGenerator()){
                if(this.isAutoGen){
                    this.generate();
                } else {
                    this.generationStopped = false
                    this.input = this.defaultInputData
                    this.input.userStory = this.generatorComponent.createPrompt();
                    this.input.selectedElement = {}
                    this.input.modificationMessage = ""
                    this.autoModelDialog = null
                    this.isExpanded = true
                    this.chatMessage = ""
                }
            }
        },
        watch: {
            result() {
                this.$nextTick(() => {
                    if (this.autoScroll) {
                        this.scrollToBottom();
                    }
                });
            }
        },

        data() {
            return {
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
                dummyMessage: {
                    text: "What do you want to create?",
                    type: 'response'
                },
                openAiMessageList: [],
                chatList: [],
                selectedElement: [],
                chatMessage: "",
                
            }
        },
        computed: {
            displayResult() {
                return (this.savedResult != '' && !this.generationStopped) ? this.savedResult : this.result;
            }
        },
        mounted: async function () { 
            var me = this
            me.$EventBus.$on('selectedElementObj', function (selectedObj) {
                var id = selectedObj.id

                if (selectedObj['selected']) {
                    me.selectedElement.push(selectedObj)
                    me.input.selectedElement = me.modelValue.elements[me.selectedElement[0].id];
                } else {
                    var fidx = me.selectedElement.findIndex(obj => obj.id == id)
                    if (fidx != -1) {
                        me.selectedElement.splice(fidx, 1);
                    }
                    me.input.selectedElement = {}
                }

            });
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
                        this.userPanel = 0
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
                
                if(this.generatorName === "ModelModificationGenerator"){
                    this.input.modificationMessage = this.chatMessage
                    if(this.input.modificationMessage=="") return;
                    var message = {
                        text: this.input.modificationMessage,
                        type: "prompt"
                    }
                    this.chatList.push(message);
                    this.chatMessage = ""
                    this.generatorComponent.generate();
                }else{
                    this.$emit("clearModelValue")

                    if(!this.isAutoGen || this.generatorStep === 'aggregate'){
                        let generateOption = {
                            "messages": [],
                            "action": "skipCreatePrompt"
                        }
                        if(this.generatorStep === 'aggregate'){
                            const removalStrings = [
                                "Please create an event storming model in json for following service: ",
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
                }

                this.generationStopped = true;
                if(this.generatorName == 'EventOnlyESGenerator'){
                    this.$emit("showContinueBtn")
                    this.showGenerateBtn = false
                }
            },
            switchGenerator(mode){
                if(mode){
                    if(mode=='chat'){
                        this.chatList = []
                        this.openAiMessageList = []
                        this.chatList.push(this.dummyMessage)
                        this.input.modificationMessage = ""
                        this.chatMessage = ""

                        this.generatorComponent = new ModelModificationGenerator(this);
                        this.generatorName = "ModelModificationGenerator"
                    }
                }else{
                    this.createGenerator();
                }
            },

            async reGenerate(userStory){
                let reGeneratePrompt = {
                    action: "reGenerate",
                    messages: userStory
                }

                this.result = '';
                this.$emit("clearModelValue")
                this.generatorComponent.generate(reGeneratePrompt);
                this.generationStopped = true;
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
                if(this.generatorName === "ModelModificationGenerator"){
                    this.$emit("modificateModel", model)
                } else{
                    this.$emit("createModel", model)
                }
            },

            onGenerationFinished(model){
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
                    this.input['userStory'] = this.generatorComponent.previousMessages[0].content
                    this.userPanel = 1
                }

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
.expanded {
  width: 200px;
}

.collapsed {
  width: 450px; /* 원하는 가로 길이로 조정 */
}
</style>


