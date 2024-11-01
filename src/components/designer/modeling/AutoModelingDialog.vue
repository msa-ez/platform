<template>
    <div v-if="showChat">
        <v-card v-if="autoModelingInput"
            class="mx-auto"
            style="max-width: 70%; background-color: aliceblue;"
        >
            <v-row class="justify-start main-auto-modeling-chip-row">
                <v-col class="text-left" style="padding:0px;">
                    <v-chip class="main-auto-modeling-chip"
                        v-for="(inputAutoModelingChip, index) in setAutoModelingTextChips"
                        :key="index"
                        @click="setAutoModelingText($t(inputAutoModelingChip))"
                        outlined
                    >{{ $t(inputAutoModelingChip) }}
                    </v-chip>
                </v-col>
            </v-row>
            <v-card-text style="font-weight: 500;">
                <v-text-field
                    class="auto-modeling-text"
                    style="margin-bottom: -30px;"
                    v-model="projectInfo.prompt"
                    solo
                    :placeholder="$t('autoModeling.mainClick')"
                    :label="$t('autoModeling.main1')"
                    :append-icon="startTemplateGenerate ? 'mdi-spin mdi-loading':'mdi-auto-fix'"
                    @click:append="openProjectDialog()"
                    @keydown.enter="openProjectDialog()"
                ></v-text-field>
            </v-card-text>
        </v-card>

        <v-col class="shrink" :style="openChatUI ? 'height:10000px;':''">
            <v-expand-x-transition>
                <v-card
                    v-show="openChatUI"
                    style="height: 100%; position: absolute; width: 100%; background-color: aliceblue; left: 0px; top: 0px; z-index:201;"
                    class="mx-auto bg-secondary"
                >   
                   
                        <v-card-text>
                            <v-row style="justify-content: space-between;">
                                <v-icon style="margin-bottom: 10px;" @click="cancelCreateModel()">mdi-arrow-left</v-icon>
                                <div>
                                    <v-icon v-if="!isServer" @click="openStorageDialog()">mdi-content-save</v-icon>
                                    <!-- PowerPoint Generate -->
                                    <v-icon v-if="isServer" @click="generatePowerPoint()">mdi-file-powerpoint-box-outline</v-icon>
                                </div>
                            </v-row>

                            <!-- autofocus -->
                            <v-text-field
                                v-model="projectInfo.prompt"
                                style="margin-bottom: -30px; padding: 10px; width: 80%; float: right; margin-top: 10px;"
                                :style="!openAiResult && openAiResult == '' ? 'margin-top: 15px;':''"
                                solo
                                :hint="$t('autoModeling.mainClick')"
                                persistent-hint
                                :label="$t('autoModeling.main2')"
                                :append-icon="startTemplateGenerate ? 'mdi-spin mdi-loading':'mdi-auto-fix'"
                                @click:append="startGen(genType)"
                                @keydown.enter="startGen(genType)"
                            ></v-text-field>
                            <div v-if="openChatUI" style="margin-left: 10px; margin-top: 100px;">
                                <v-col style="padding:0px;">
                                    <v-card style="display:inline-block; background-color: #DAF5FF;">
                                        <v-card-text class="auto-modeling-message">
                                            <vue-typed-js 
                                                :strings="[$t('autoModeling.selectOptions')]"
                                                :typeSpeed="5"
                                                :showCursor="false"
                                            >
                                                <span class="typing"></span>
                                            </vue-typed-js>
                                        </v-card-text>
                                    </v-card>
                                </v-col>
                                
                                <v-card style="margin-top: 10px; display: inline-block; background-color: #DAF5FF;">
                                    <v-row 
                                        lg="3" md="3" sm="6" cols="12"
                                        style="padding:10px;"
                                    >
                                        <v-col
                                            v-for="(item, index) in cardItems"
                                            :key="index"
                                            style="text-align: center;"
                                        >
                                            <v-card :style="genType == item.type ? 'border: solid darkturquoise;' : 'background-color: white;'" :class="item.class">
                                                <v-chip :style="item.chipText == 'Stable' ? 'color: white;' : ''"
                                                    x-small
                                                    :outlined="item.chipOutlined"
                                                    :color="item.chipColor"
                                                    style="position: absolute; right: 5px; top: 5px; z-index: 1;"
                                                >{{ item.chipText }}</v-chip>
                                                <div @click="checkLogin(item.type)" style="cursor: pointer;">
                                                    <v-avatar class="ma-3" size="125" rounded="0">
                                                        <v-img :src="item.imgSrc"></v-img>
                                                    </v-avatar>
                                                    <v-card-text style="justify-content: center; margin-top: -10px;">
                                                        <div :style="genType == item.type ? 'background-color: #DAF5FF;' : ''" style="font-weight: 500; font-size: 12px; margin-left: -5px; border-radius: 10px; margin-right: -10px;">
                                                            <v-icon v-if="genType == item.type" small color="success">mdi-check</v-icon>
                                                            {{ $t(item.textKey) }}
                                                        </div>
                                                    </v-card-text>
                                                </div>
                                            </v-card>
                                        </v-col>
                                    </v-row>
                                </v-card>
                                <div v-if="startCrateModel && genType == 'BM'" style="margin-top: 10px; margin-left: 5px;">
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                    ></v-progress-circular>
                                </div>
                            </div>
                            <div :key="reGenKey">
                                <ESDialoger v-if="genType == 'ES2'"     ref="esDialoger"    v-model="projectInfo.eventStorming"      :isServerProject="isServer" :projectId="projectId" :modelIds="modelIds" :prompt="projectInfo.prompt" :cachedModels="cachedModels" @change="backupProject" :uiStyle="uiStyle"   ></ESDialoger>
                                <CJMDialoger v-if="genType == 'CJM'"    ref="cjMDialoger"   v-model="projectInfo.customerJourneyMap" :isServerProject="isServer" :projectId="projectId" :modelIds="modelIds" :prompt="projectInfo.prompt" :cachedModels="cachedModels" @change="backupProject" @setPersonas="setPersonas" ></CJMDialoger>
                                <BMDialoger v-if="genType == 'BM2'"     ref="bmDialoger"    v-model="projectInfo.businessModel"      :isServerProject="isServer" :projectId="projectId" :modelIds="modelIds" :prompt="projectInfo.prompt" :cachedModels="cachedModels" @change="backupProject"></BMDialoger>
                                <USMDialoger v-if="genType == 'USM'"    ref="usmDialoger"   v-model="projectInfo.userStoryMap"       :isServerProject="isServer" :projectId="projectId" :modelIds="modelIds" :prompt="projectInfo.prompt" :cachedModels="cachedModels" @change="backupProject"></USMDialoger>
                                <UIWizardDialoger v-if="genType == 'UI'" ref="uiDialoger"   v-model="projectInfo.ui"                 :isServerProject="isServer" :projectId="projectId" :modelIds="modelIds" :prompt="projectInfo.prompt" :cachedModels="cachedModels" @change="backupProject" @selected="onUIStyleSelected"  ></UIWizardDialoger>
                            </div>
                        </v-card-text>
                    <!-- </div> -->
                </v-card>
            </v-expand-x-transition>

            <ModelStorageDialog
                    :showDialog="showStorageDialog"
                    :condition="storageCondition"
                    @save="saveProject"
                    @close="closeStorageDialog()"
            ></ModelStorageDialog>
        </v-col>


        <v-snackbar v-model="snackbar.show"
                outlined
                :color="snackbar.color"
                :multi-line="snackbar.multi"
                :timeout="snackbar.timeout"
                style="z-index: 100000;"
        >
            {{ snackbar.text }}
            <template v-slot:action="{ attrs }">
                <v-btn
                        v-bind="attrs"
                        small
                        icon
                        @click="snackbar.show = false" 
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    </div>
</template>
<script src="./speechRecognition.js"></script>
<script>
    import { VueTypedJs } from 'vue-typed-js'
    import UMLDialoger from './generators/UMLDialoger'
    import CJMDialoger from './generators/CJMDialoger'
    import ESDialoger from './generators/ESDialoger'
    import BMDialoger from './generators/BMDialoger'
    import UIWizardDialoger from './generators/UIWizardDialoger'
    import USMDialoger from './generators/USMDialoger'
    import PowerPointGenerator from "./generators/PowerPointGenerator";
    import StorageBase from "../../CommonStorageBase";
    import ModelStorageDialog from "./ModelStorageDialog";
    import getParent from '../../../utils/getParent'

    // const axios = require('axios');
    let partialParse = require('partial-json-parser');
    let changeCase = require('change-case');
    export default {
        name: 'auto-modeling-dialog',
        props: {
            projectId: {
                type: String,
                default: function(){
                    return null;
                }
            },
            projectInfo: {
                type: Object,
                default: function(){
                    return {
                        eventStorming: null,
                        customerJourneyMap: null,
                        businessModel: null,
                        userStoryMap: null,
                        prompt: ''
                    }
                }
            },
            isServer: Boolean,
            mode: String,
            showDialog:{
                type: Boolean,
                default: function () {
                    return false
                }
            },
            showChat:{
                type: Boolean,
                default: function () {
                    return false
                }
            },
            openChatUI:{
                type: Boolean,
                default: function () {
                    return false
                }
            },
            genType: {
                type: String,
                default: function(){
                    return null;
                }
            },
        },
        mixins: [StorageBase],
        components: {
            VueTypedJs,
            ESDialoger,
            UMLDialoger,
            CJMDialoger,
            BMDialoger,
            UIWizardDialoger,
            USMDialoger,
            ModelStorageDialog
        },
        data() {
            return {
                setAutoModelingTextChips: [
                    'autoModeling.chip1',
                    'autoModeling.chip2',
                    'autoModeling.chip3',
                    'autoModeling.chip4'
                ],
                cardItems: [
                    {
                        type: 'CJM',
                        class: 'auto-cjm',
                        chipOutlined: true,
                        chipColor: 'orange',
                        chipText: 'Beta',
                        imgSrc: 'https://miro.medium.com/v2/resize:fit:0/1*GeerSkalcxLlE3bp83i1XA.png',
                        textKey: 'mainAutoModelingText.cjm'
                    },
                    {
                        type: 'BM2',
                        class: 'auto-bm',
                        chipOutlined: true,
                        chipColor: 'orange',
                        chipText: 'Beta',
                        imgSrc: 'https://user-images.githubusercontent.com/92732781/233012222-d0662c4b-5546-4e7b-af28-c07617a57ef0.png',
                        textKey: 'mainAutoModelingText.bm'
                    },
                    {
                        type: 'USM',
                        class: 'auto-usm',
                        chipOutlined: true,
                        chipColor: 'orange',
                        chipText: 'Beta',
                        imgSrc: '/static/image/userStoryMap.png',
                        textKey: 'mainAutoModelingText.userStory'
                    },
                    {
                        type: 'ES2',
                        class: 'auto-es',
                        chipOutlined: false,
                        chipColor: 'green',
                        chipText: 'Stable',
                        imgSrc: '/static/image/main/mainModeling.png',
                        textKey: 'mainAutoModelingText.eventstorming'
                    },
                    {
                        type: 'UI',
                        class: 'auto-ui',
                        chipOutlined: true,
                        chipColor: 'orange',
                        chipText: 'Beta',
                        imgSrc: '/static/image/brandUi.png',
                        textKey: 'mainAutoModelingText.Brand'
                    }
                ],
                disableSaveBtn: false,
                // projectInfo: {
                //     eventStorming: null,
                //     customerJourneyMap: null,
                //     prompt: ""
                // },
                cachedModels: null,
                uiStyle: null,
                reGenKey: 0,
                autoScroll: true,
                bmName: null,
                // genType: null,
                autoModelDialog: 0,
                gptResponseId: null,
                userPanel: 1,
                modelJson: null,
                //type-js
                firstMessageIsTyping: true,
                secondMessageIsTyping: true,
                //
                createModelErrMessage: null,
                modelCreationStopped: false,
                lastBCView: null,
                bcPosition: {},
                userUid: null,
                // chat
                isCheckedErr: false,
                startCrateModel: false,
                // openChatUI: false, 
                modelScenario: "",
                // dailog
                pageNum: '1',
                openAiPromptForBC: "",
                openAiPrompt: "",
                isListening: false,
                openAiResult: "",
                speechRecognition: null,
                startTemplateGenerate: false,
                generateStatusValue: 0,
                bufferInterval: null,
                //token
                openaiPopup: false,
                sequenceForUUID: 0,
                autoModelingInput: true,
                //snackbar
                snackbar: {
                    show: false,
                    multi: false,
                    text: "",
                    color: "",
                    timeout: -1,
                },
                storageCondition: null,
                showStorageDialog: false,
                modelIds:{
                    projectId : null,
                    ESDefinitionId : null,
                    CJMDefinitionId : null,
                    BMDefinitionId : null,
                    UIDefinitionId : null,
                    USMDefinitionId: null,
                }
            }
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
            this.setModelIds()

            let getPrompt = localStorage.getItem('noLoginPrompt')
            if(this.isLogin && getPrompt){
                this.projectInfo.prompt = this.projectInfo.prompt ? this.projectInfo.prompt : getPrompt
                this.openChatUI = true
            }
        },
        watch: {
            "projectInfo.prompt":_.debounce(function(){
                localStorage.setItem('noLoginPrompt',this.projectInfo.prompt)
            }, 1000)
        },
        beforeDestroy() {
            let getPrompt = localStorage.getItem('noLoginPrompt')
            if( !(this.isLogin && getPrompt)){
                localStorage.removeItem('noLoginPrompt')
            }
        },
        async mounted(){
            var me = this
            if(me.mode == "project"){
                me.openChatUI = true
                if(me.projectId){
                    await me.open();
                }
            }
            me.scrollToBottom();

            //// listen to generators done to save the cacheModels
            me.cachedModels = {}

            const aiGeneratorChannel = new BroadcastChannel('ai-generator');
            aiGeneratorChannel.onmessage = function(e) {
                if (e.data) {
                    if(e.data.generator=='CJMGenerator'){
                        let persona = me.projectInfo.customerJourneyMap.selectedPersona.persona
                        if(!me.cachedModels[e.data.generator]){
                            me.cachedModels[e.data.generator] = {}
                        }
                        me.cachedModels[e.data.generator][persona] = e.data.model
                        // Object.keys(e.data.model.elements).forEach(function (ele) {
                        //     if(e.data.model.elements[ele]!=null && e.data.model.elements[ele]._type=="Persona"){
                        //         // persona = e.data.model.elements[ele].name
                        //         if(!me.cachedModels[e.data.generator]){
                        //             me.cachedModels[e.data.generator] = {}
                        //         }
                        //         me.cachedModels[e.data.generator][persona] = e.data.model
                        //     }
                        // });
                    }else{
                        me.cachedModels[e.data.generator] = e.data.model
                    }
                }
            };

            const eventStormingCanvasChannel = new BroadcastChannel('event-storming-model-canvas')//this.$vnode.tag);

            eventStormingCanvasChannel.onmessage = function(e) {
                if (e.data) {
                    me.cachedModels["ESGenerator"] = Object.assign([], e.data.model)
                }
            };

            const modelCanvasChannel = new BroadcastChannel('model-canvas')//this.$vnode.tag);

            modelCanvasChannel.onmessage = async function(e) {
                if (e.data && e.data.event === "ProjectIdChanged") {
                    me.modifyModelList(e.data)
                } else if (e.data && e.data.event === "ScreenShot") {
                    await me.putString(`storage://definitions/${me.projectId}/information/image`, e.data.image);
                }
            };
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
            setAutoModelingText(inputAutoModelingChip) {
                var me = this
                me.projectInfo.prompt = inputAutoModelingChip;
                me.openProjectDialog()
            },
            setModelIds(){
                var me = this

                if(!me.projectId) me.projectId = me.uuid();
                if(!me.modelIds.projectId) me.modelIds.projectId = me.projectId
                if(!me.modelIds.ESDefinitionId) me.modelIds.ESDefinitionId = me.uuid()
                if(!me.modelIds.CJMDefinitionId) me.modelIds.CJMDefinitionId = me.uuid()
                if(!me.modelIds.BMDefinitionId) me.modelIds.BMDefinitionId = me.uuid()
                if(!me.modelIds.UIDefinitionId) me.modelIds.UIDefinitionId = me.uuid()
                if(!me.modelIds.USMDefinitionId) me.modelIds.USMDefinitionId = me.uuid()
            },
            checkLogin(type){
                if(this.isLogin){
                    this.genType = type
                } else {
                    this.$EventBus.$emit('showLoginDialog')
                }
            },
            openStorageDialog(){
                this.storageCondition = {
                    action: 'save',
                    title: 'Save Project',
                    comment: '',
                    projectName: this.projectInfo.prompt,
                    projectId: this.projectId,
                    error: null,
                    loading: false,
                    type: 'project'
                }
                this.showStorageDialog = true;
            },
            closeStorageDialog(){
                this.storageCondition = null;
                this.showStorageDialog = false
            },
            async saveProject(){
                var me = this

                let validate = await me.validateStorageCondition(me.storageCondition, 'save');
                if(validate) {
                    var originProjectId = me.projectId
                    var settingProjectId = me.storageCondition.projectId.replaceAll(' ', '-').trim();

                    me.projectInfo.author = me.userInfo.uid
                    me.projectInfo.authorEmail = me.userInfo.email
                    me.projectInfo.projectId =settingProjectId
                    me.projectInfo.projectName = me.storageCondition.projectName ? me.storageCondition.projectName : me.projectInfo.prompt;
                    me.projectInfo.prompt =  me.projectInfo.prompt ? me.projectInfo.prompt : me.projectInfo.projectName
                    me.projectInfo.type = me.storageCondition.type;
                    me.projectInfo.createdTimeStamp = Date.now();
                    me.projectInfo.lastModifiedTimeStamp = Date.now();

                    await me.putObject(`db://definitions/${settingProjectId}/information`, me.projectInfo)
                    me.isServer = true;
                    me.$router.push({path: `/${me.projectInfo.type}/${settingProjectId}`});
                    me.$emit('forceUpdateKey')
                } else{
                    me.storageCondition.loading = false
                }
            },
            async validateStorageCondition(condition, action){
                var me = this

                if( !this.isLogin ) {
                    var otherMsg = 'Please check your login.';
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }

                if( !condition.projectId || condition.projectId.includes('/') ){
                    var otherMsg = 'ProjectId must be non-empty strings and can\'t contain  "/"'
                    var obj ={
                        'projectId': otherMsg
                    }
                    condition.error = obj
                    return false;
                }

                // checked duplicate projectId
                var validateInfo = await me.isValidatePath(`db://definitions/${condition.projectId}/information`);
                if( !validateInfo.status ){
                    var obj ={
                        'projectId': validateInfo.msg,
                    }
                    condition.error = obj
                    return false;
                }

                var information = await me.list(`db://definitions/${condition.projectId}/information`)
                if(information){
                    var obj ={
                        'projectId': 'This project id already exists.'
                    }
                    condition.error = obj
                    return false;
                }


                return true;
            },
            generatePowerPoint() {
                const me = this;
                const modelData = [];
                const genTypes = Object.keys(me.cachedModels);

                if (genTypes.length > 0) {
                    genTypes.forEach((type) => {
                        if (type.includes("ES")) {
                            modelData.push({
                                canvasType: "es",
                                value: {
                                    elements: me.cachedModels[type].elements,
                                    relations: me.cachedModels[type].relations,
                                }
                            });
                        } else if (type.includes("BM")) {
                            const bmElements = me.cachedModels[type];
                            modelData.push({
                                canvasType: "bm",
                                value: {
                                    elements: bmElements,
                                }
                            });
                        } else if (type.includes("CJM")) {
                            modelData.push({
                                canvasType: "cjm",
                                value: {
                                    elements: me.cachedModels[type].elements,
                                    relations: me.cachedModels[type].relations,
                                }
                            });
                        }
                    });

                    const generator = new PowerPointGenerator(me.projectInfo.prompt);
                    generator.createPowerPoint(modelData);

                } else {
                    me.snackbar = {
                        show: true,
                        text: "Before generate PPT, create at least one Canvas Model.",
                        multi: false,
                        color: "red",
                        timeout: -1
                    };
                }
            },

            modifyModelList(changedInfo){
                var me = this
                
                // event: "ProjectIdChanged",
                // type: me.canvasType,
                // old: originProjectId,
                // new: settingProjectId
                if(changedInfo.type == 'es'){
                    var oldModelIndex = me.projectInfo.eventStorming.modelList.findIndex(x => x == changedInfo.old)
                    me.projectInfo.eventStorming.modelList[oldModelIndex] = changedInfo.new
                    me.projectInfo.eventStorming.modelList.__ob__.dep.notify()
                } else if(changedInfo.type == 'bm'){
                    var oldModelIndex = me.projectInfo.businessModel.modelList.findIndex(x => x == changedInfo.old)
                    me.projectInfo.businessModel.modelList[oldModelIndex] = changedInfo.new
                    me.projectInfo.businessModel.modelList.__ob__.dep.notify()
                } else if(changedInfo.type == 'usm'){
                    var oldModelIndex = me.projectInfo.userStoryMap.modelList.findIndex(x => x == changedInfo.old)
                    me.projectInfo.userStoryMap.modelList[oldModelIndex] = changedInfo.new
                    me.projectInfo.userStoryMap.modelList.__ob__.dep.notify()
                } else if(changedInfo.type == 'cm'){
                    var oldModelIndex = me.projectInfo.contextMapping.modelList.findIndex(x => x == changedInfo.old)
                    me.projectInfo.contextMapping.modelList[oldModelIndex] = changedInfo.new
                    me.projectInfo.contextMapping.modelList.__ob__.dep.notify()
                }else if(changedInfo.type == 'cjm'){
                    var oldModelIndex = me.projectInfo.customerJourneyMap.modelList.findIndex(x => x == changedInfo.old)
                    me.projectInfo.customerJourneyMap.modelList[oldModelIndex] = changedInfo.new
                    me.projectInfo.customerJourneyMap.modelList.__ob__.dep.notify()
                }
                
                me.backupProject();
            },
            openProjectDialog(){
                var me = this
                me.genType = null
                me.setModelIds()
                me.openChatUI = true

                if(!me.isLogin){
                    localStorage.setItem('noLoginPrompt', me.projectInfo.prompt)
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
            cancelCreateModel(val){
                var me = this
                localStorage.removeItem('noLoginPrompt')
                if(!val){
                    me.openChatUI = false
                    me.openaiPopup = false

                    me.projectInfo = {
                        eventStorming: null,
                        customerJourneyMap: null,
                        businessModel: null,
                        userStoryMap: null,
                        prompt: ""
                    },
                    me.modelScenarioPrompt = ""
                    me.openAiResult = ""
                } 
                me.startTemplateGenerate = false
                if(me.mode == 'project'){
                    this.$emit("closeDialog")
                }
                this.$emit("changeFieldStatus", false)
            },
            async open(){
                let me = this;
                // me.projectInfo = await me.getObject(`db://definitions/${me.projectId}/information`)
                // if(me.projectInfo && me.projectInfo.type){
                //     me.disableSaveBtn = true
                // }

                // mounted 랑 중복.
                // const modelCanvasChannel = new BroadcastChannel('model-canvas')//this.$vnode.tag);
                // modelCanvasChannel.onmessage = function(e) {
                //     if (e.data && e.data.event === "ProjectIdChanged") {
                //         me.modifyModelList(e.data)
                //     }
                // };
                  
            },
            async backupProject(){
                // type: eventStorming,  businessModel, customerJourneyMap
                var me = this

                if( me.isServer ) {
                    if( me.isLogin ){
                        me.putObject(`db://definitions/${me.projectId}/information`, {
                            eventStorming: me.projectInfo.eventStorming,
                            businessModel: me.projectInfo.businessModel,
                            customerJourneyMap: me.projectInfo.customerJourneyMap,
                            userStoryMap: me.projectInfo.userStoryMap,
                        })
                    }
                } else  {
                    // local
                    let lists = await me.getObject(`localstorage://localLists`)
                    lists = lists ? lists : [];
                    var index = lists.findIndex(list => list.projectId == me.projectId)
                    if( index != -1 ){
                        lists[index] = me.projectInfo
                        me.putObject(`localstorage://localLists`, lists);
                    }
                }
            },
            onUIStyleSelected(uiStyle){
                this.uiStyle = uiStyle;
            },
            setPersonas(personas){
                this.cachedModels['Personas'] = personas;
            },
            handleContentChange() {
                this.$nextTick(() => {
                    if (this.autoScroll) {
                        this.scrollToBottom();
                    }
                });
            },
            startGen(){
                this.reGenKey++;
            },
            show(options){
                ///
                this.reGenKey++;
                this.modelScenarioPrompt = options && options.title ? options.title:options.projectName
                this.showChat = true;
                this.openChatUI = true;
                this.$emit("changeFieldStatus", true)
                //this.showDialog = true;
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
            openChatDialog(options){
                if(options && options.prompt)
                    this.modelScenarioPrompt = options.prompt;
                this.openChatUI = true;
            },
            onReceive(content){
                console.log(content);
            },
            openCanvas(val){
                var me = this
                var dbuid = me.dbuid()
                localStorage.setItem(dbuid + '-model-info', JSON.stringify(val))
                localStorage.setItem(dbuid + '-Project-Name', val.name)
                // localStorage.setItem(dbuid + '-Scenario', val.result)
                if(val.type == 'ES'){
                    me.$router.push({path: `storming/${dbuid}`});
                } else if(val.type == 'BM'){
                    me.$router.push({path: `business-model-canvas/${dbuid}`});
                }
            },  
        }
    }
</script>
<style>
.main-auto-modeling-chip {
    margin:0px 5px;
    opacity: 0.8;
    border-width: 1.5px;
}
.main-auto-modeling-chip-row { 
    padding:10px 0px 0px 10px;
    margin:0px 0px -5px 0px;
}

@media only screen and (max-width:672px) {
    .main-auto-modeling-chip {
        margin-top:10px;
    }
    .main-auto-modeling-chip-row { 
        padding:0px 0px 0px 10px;
    }
    
}
</style>
<style lang="scss">
</style>