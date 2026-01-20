<template>
    <div style="margin-top: 10px;">        
        <div>
            <v-col class="auto-modeling-message-box" style="margin-top: 20px;">
                <v-card v-if="state.isAIModelSelected" class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js
                                :strings="[$t('autoModeling.selectMessage1')]"
                                :typeSpeed="10"
                                :showCursor="false"
                                @onComplete="
                                    state.firstMessageIsTyping = false; 
                                    state.secondMessageIsTyping = false;
                                "
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
            <!-- <v-col class="auto-modeling-message-box">
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
            </v-col> -->
        </div>
        <v-tabs v-model="activeTab" v-if="!state.secondMessageIsTyping">
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
                        <!-- <div class="gs-auto-modeling-userStory-text-pc">{{$t('autoModeling.explanation.userStory')}}</div>
                        <div class="gs-auto-modeling-userStory-text-mobile">{{$t('autoModeling.explanation.userStory')}}</div> -->
                        <v-card-text class="auto-modling-textarea pa-0" ref="userStoryContainer" style="height: 100%; display: flex; flex-direction: column;">
                            <v-textarea v-model="projectInfo.userStory"
                                flat
                                class="elevation-0 pr-0 delete-input-detail user-story-auto-modling-textarea"
                                dense
                                no-resize
                                solo
                                :disabled="!done || !isEditable"
                                style="flex: 1; min-height: 0;"
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
                        <!-- <v-card-subtitle>{{$t('autoModeling.explanation.ddl')}}</v-card-subtitle> -->
                        <v-card-text class="auto-modling-textarea">
                            <v-textarea 
                                    v-model="projectInfo.inputDDL"
                                    flat
                                    class="elevation-0 pr-0"
                                    dense
                                    rows="14"
                                    no-resize
                                    solo
                                    :disabled="!isEditable"
                                    style="height: auto;"
                            >
                            </v-textarea>
                        </v-card-text>
                    </v-tab-item>
                </v-tabs-items>
                <v-btn v-if="!done && processingRate == 0" :disabled="!isEditable" @click="stop()" style="position: absolute; right:10px; top:10px;">
                    <v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>
                    Stop generating
                </v-btn>
                <v-btn v-if="!done && processingRate > 0" :disabled="!isEditable" @click="stop()" style="position: absolute; right:10px; top:10px;">
                    <v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>
                    Stop generating ({{ processingRate }}%) 
                </v-btn>
                <v-row v-if="done" :disabled="!isEditable" class="ma-0 pa-4">
                    <v-spacer></v-spacer>
                    <v-btn v-if="state.startTemplateGenerate" :disabled="getDisabledGenerateBtn() || !isEditable" class="auto-modeling-btn" @click="generate()">
                        <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('ESDialoger.tryAgain') }}
                    </v-btn>
                    <v-btn v-else
                        :disabled="getDisabledGenerateBtn() || !isEditable"
                        class="auto-modeling-btn"
                        @click="generate(); state.isAIModelSelected = true;"
                    >
                        {{ $t('ESDialoger.generateAIAuto') }}
                    </v-btn>
                    <v-btn :disabled="getDisabledValidateBtn() || !isEditable" class="auto-modeling-btn" color="primary" @click="validateRequirements()">
                        {{ $t('ESDialoger.validateRequirements') }}
                    </v-btn>
                    <v-btn 
                        :disabled="getDisabledValidateBtn() || !isEditable" class="auto-modeling-btn" color="primary" @click="onShowBCGenerationOption()"
                    >
                        {{ $t('RequirementAnalysis.createBoundedContext') }}
                    </v-btn>
                </v-row>
                
                <!-- Processing Progress Bar -->
                <div v-if="!done && processingRate > 0" class="processing-progress-container">
                    <v-progress-linear 
                        :value="processingRate" 
                        color="primary" 
                        height="15"
                        class="processing-progress-bar"
                    ></v-progress-linear>
                    <div class="processing-text">
                        {{ $t('ESDialoger.processingUserStory') }} ( {{ processingRate }}% )
                    </div>
                </div>
            </v-card>

            <ESDialogerMessages 
                :messages="messages"
                :isEditable="isEditable"
                :isServerProject="isServerProject"
                @generateFromAggregateDrafts="generateFromAggregateDrafts"
                @feedbackFromAggregateDrafts="feedbackFromAggregateDrafts"
                @showBCGenerationOption="onShowBCGenerationOption"
                @createModel="generateAggregateDrafts"
                @stop="stop"
                @reGenerate="reGenerate"
                @reGenerateWithFeedback="reGenerateWithFeedback"
                @mappingRequirements="mappingRequirements"
                @setGenerateOption="setGenerateOption"
                @updateSelectedAspect="updateSelectedAspect"
                @updateSelectedOptionItem="updateSelectedOptionItem"
                @updateDraftOptions="updateDraftOptions"
                @updateDevideBoundedContext="updateDevideBoundedContext"
                @update:siteMap="updateSiteMap"
                @generate:siteMap="generateSiteMap"
                @transformWithStandards="transformWithStandards"
            ></ESDialogerMessages>
        </div>
        <div
            :key="modelListKey"
            style="margin-top:25px; height: 100%; width: 100%; overflow-x: auto;"
        >
            <v-col v-if="value && value.modelList && value.modelList.length > 0"
                   style="height: 100%; align-items: center; margin: 2px; width: fit-content; display: flex;"
            >
                <div v-for="id in value.modelList" :key="id" style="display: inline-block;">
                    <jump-to-model-lists-card :id="id" path="storming" @deleteDefinition="deleteDefinition"></jump-to-model-lists-card>
                </div>
            </v-col>
        </div>

        <!-- <v-card flat v-if="isServerProject" style="margin-top: 20px;">
            <v-card flat>
                <v-card-title>Context Mapping Model</v-card-title>
                <v-card-text style="width: 100%; white-space: nowrap; overflow-x: scroll;">
                    <v-row style="height: 100%; margin: 2px; width: max-content;">
                        <div v-for="id in cmModelLists" :key="id">
                            <jump-to-model-lists-card :id="id" path="cm" @deleteDefinition="deleteDefinition"></jump-to-model-lists-card>
                        </div>

                        <v-card :style="cmModelLists.length == 0 ? 'height: 150px': ''" style="text-align: center; margin-top: 5px; margin-left: 5px;" flat>
                            <v-tooltip right>
                                <template v-slot:activator="{ on }">
                                    <v-btn text style="align-items: center; width: 100%; height: 100%;" @click="openStorageDialog('cm')">
                                        <v-icon>mdi-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>add Model</span>
                            </v-tooltip>
                        </v-card>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-card> -->

        <!-- AI 및 직접생성 다이얼로그 -->
        <!-- <v-dialog v-model="generateUserStoryDialog"
            persistent
            max-width="fit-content"
        >
            <v-card>
                <v-row class="ma-0 pa-4">
                    <v-card-title class="headline pa-0">
                        {{ $t('ESDialoger.userStory') }}
                    </v-card-title>
                    <v-spacer></v-spacer>
                    <v-btn @click="generateUserStoryDialog = false"
                        icon
                        text
                    >
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-row>

                
                <v-card-text class="ma-0 pa-4">
                    {{ $t('ESDialoger.generateUserStory') }}
                </v-card-text>
                
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="grey darken-1"
                        text
                        @click="generateUserStoryDialog = false; done = true; state.secondMessageIsTyping = false"
                    >
                        {{ $t('ESDialoger.enterManually') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        @click="generate(); generateUserStoryDialog = false; state.isAIModelSelected = true;"
                    >
                        {{ $t('ESDialoger.generateAIAuto') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog> -->
    </div>

</template>

<script>
    import { VueTypedJs } from 'vue-typed-js'
    import Generator from './UserStoryGenerator.js'
    import RecursiveUserStoryGenerator from './RecursiveUserStoryGenerator.js'
    //import UserStoryGenerator from './UserStoryGenerator.js'
    // import StorageBase from "../StorageBase";
    import StorageBase from '../../../CommonStorageBase.vue';
    import getParent from '../../../../utils/getParent'
    import Usage from '../../../../utils/Usage'
    
    import { 
        DraftGeneratorByFunctions,
        ExtractDDLFieldsGenerator,
        AssignDDLFieldsToAggregateDraft,
        AssignPreviewFieldsToAggregateDraft,
        AddTraceToDraftOptionsGenerator
    } from '../../modeling/generators/es-generators';
    
    // LangGraph 관리 클래스들 (Generator 인터페이스 제공, 내부에서 Proxy 사용)
    const DraftGeneratorByFunctionsLangGraph = require('../../modeling/generators/es-generators/DraftGeneratorByFunctions/DraftGeneratorByFunctionsLangGraph.js');
    const ExtractDDLFieldsGeneratorLangGraph = require('../../modeling/generators/es-generators/ExtractDDLFieldsGenerator/ExtractDDLFieldsGeneratorLangGraph.js');
    const AddTraceToDraftOptionsGeneratorLangGraph = require('../../modeling/generators/es-generators/AddTraceToDraftOptionsGenerator/AddTraceToDraftOptionsGeneratorLangGraph.js');
    const AssignDDLFieldsToAggregateDraftLangGraph = require('../../modeling/generators/es-generators/AssignDDLFieldsToAggregateDraft/AssignDDLFieldsToAggregateDraftLangGraph.js');
    const AssignPreviewFieldsToAggregateDraftLangGraph = require('../../modeling/generators/es-generators/AssignPreviewFieldsToAggregateDraft/AssignPreviewFieldsToAggregateDraftLangGraph.js');
    const StandardTransformerLangGraph = require('../../modeling/generators/es-generators/StandardTransformer/StandardTransformerLangGraph.js');
    
    const UserStoryGeneratorLangGraph = require('./UserStoryGeneratorLangGraph.js');
    const RecursiveUserStoryGeneratorLangGraph = require('./RecursiveUserStoryGeneratorLangGraph.js');
    
    const RequirementsValidationGeneratorLangGraph = require('./RequirementsValidationGeneratorLangGraph.js');
    const RecursiveRequirementsValidationGeneratorLangGraph = require('./RecursiveRequirementsValidationGeneratorLangGraph.js');
    const RecursiveRequirementsSummarizerLangGraph = require('./RecursiveRequirementsSummarizerLangGraph.js');
    
    const DevideBoundedContextGeneratorLangGraph = require('./DevideBoundedContextGeneratorLangGraph.js');
    const RequirementsMappingGeneratorLangGraph = require('./RequirementsMappingGeneratorLangGraph.js');
    
    const CommandReadModelExtractorLangGraph = require('./CommandReadModelExtractorLangGraph.js');
    const RecursiveCommandReadModelExtractorLangGraph = require('./RecursiveCommandReadModelExtractorLangGraph.js');
    const SiteMapGeneratorLangGraph = require('./SiteMapGeneratorLangGraph.js');
    const RecursiveSiteMapGeneratorLangGraph = require('./RecursiveSiteMapGeneratorLangGraph.js');

    import {
        LocalStorageCleanUtil,
        DataValidationUtil,
        RefsTraceUtil,
        TraceMarkdownUtil,
        TextTraceUtil
    } from './utils'
    
    import DevideBoundedContextGenerator from './DevideBoundedContextGenerator.js'
    
    //Requirements Summarizer
    import RecursiveRequirementsSummarizer from './RecursiveRequirementsSummarizer.js';
    import RequirementsMappingGenerator from './RequirementsMappingGenerator.js';
    
    // Requirements Validation Generator
    import RequirementsValidationGenerator from './RequirementsValidationGenerator.js'
    import RecursiveRequirementsValidationGenerator from './RecursiveRequirementsValidationGenerator.js';

    // SiteMap Viewer
    import SiteMapGenerator from './SiteMapGenerator.js';
    import RecursiveSiteMapGenerator from './RecursiveSiteMapGenerator.js';
    
    // Command/ReadModel Extractor
    import CommandReadModelExtractor from './CommandReadModelExtractor.js';
    import RecursiveCommandReadModelExtractor from './RecursiveCommandReadModelExtractor.js';

    const axios = require('axios');
    import YAML from 'js-yaml';

    import { 
        ESDialogerMessages,
        ESDialogerTerminal,
        MessageFactory,
        AIModelSetting,
        ESDialogerTraceUtil,
        MessageDataRestoreUtil
    } from './features/ESDialoger';
import { value } from 'jsonpath';

    export default {
        name: 'es-dialoger',
        mixins:[
            StorageBase,
            ESDialogerTerminal
        ],
        props: {
            value: {
                type: Object,
                default: () => ({
                    modelList: []
                })
            },
            prompt: String,
            uiStyle: Object,
            cachedModels: Object,
            projectId: String,
            projectInfo: Object,
            modelIds: Object,
            isServerProject: Boolean,
            isEditable: Boolean,
            draft: Array
        },
        components: {
            VueTypedJs,
            ESDialogerMessages,
            AIModelSetting
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
            cmModelLists(){
                if( !this.projectInfo) return []
                if( !this.projectInfo.contextMapping ) return []
                if( !this.projectInfo.contextMapping.modelList) return  []
                return this.projectInfo.contextMapping.modelList
            },
        },
        async created(){
            await this.setUserInfo()
            if(!this.value) this.value = {}
            if(!this.value.userStory) this.value.userStory = ""

            // this.initESDialoger();
            this.autoModel = getParent(this.$parent, 'auto-modeling-dialog');


            let thinkingUpdateInterval = undefined
            const createThinkingUpdateInterval = (elapsedSeconds=0, subjectText) => {
                clearThinkingUpdateInterval()

                const updateMessage = (elapsedSeconds, subjectText) => {
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = `Thinking for ${elapsedSeconds} second${elapsedSeconds > 1 ? 's' : ''}... (Subject: ${subjectText})`
                }

                updateMessage(elapsedSeconds, subjectText)
                thinkingUpdateInterval = setInterval(() => {
                    elapsedSeconds += 1
                    updateMessage(elapsedSeconds, subjectText)
                }, 1000)
            }
            const clearThinkingUpdateInterval = () => {
                if(thinkingUpdateInterval) {
                    clearInterval(thinkingUpdateInterval)
                    thinkingUpdateInterval = undefined
                }
            }

            const generatePreviewAggAttributesToDraftOptions = async (options, description, traceMap, allDdlFields, boundedContextName, afterGenerateCallback) => {
                if(!__isValidDDLFields(allDdlFields)) 
                    throw new Error("Invalid allDdlFields: " + JSON.stringify({ allDdlFields }))
                
                // traceMap이 Map 객체인 경우 일반 객체로 변환 (Firebase 직렬화를 위해)
                let normalizedTraceMap = traceMap;
                if (traceMap instanceof Map) {
                    normalizedTraceMap = {};
                    for (const [key, value] of traceMap.entries()) {
                        normalizedTraceMap[key] = value;
                    }
                } else if (!traceMap || typeof traceMap !== 'object') {
                    normalizedTraceMap = {};
                }

                // 각 옵션을 순차적으로 처리
                if (allDdlFields.length > 0) {
                    for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
                        const option = options[optionIndex];
                        
                        if (!option.structure || option.structure.length === 0) continue;

                        // structure에서 aggregateDrafts 구성
                        const aggregateDrafts = option.structure
                            .filter(struct => struct && struct.aggregate)
                            .map(struct => ({
                                name: struct.aggregate.name,
                                alias: struct.aggregate.alias
                            }));

                        // 최적화: Aggregate가 1개만 있을 경우 생성기 호출 없이 직접 할당
                        if (aggregateDrafts.length === 1) {
                            // 직접 모든 DDL 필드를 해당 aggregate에 할당
                            const singleAggregate = aggregateDrafts[0];
                            option.structure.forEach(struct => {
                                if (!struct || !struct.aggregate) return;
                                if (struct.aggregate.name === singleAggregate.name) {
                                    this.$set(struct, 'previewAttributes', [...allDdlFields])
                                    console.log(`[*] Direct assignment - Added all DDL fields to single aggregate ${struct.aggregate.name}:`, struct.previewAttributes);
                                }
                            });
                            
                            // workingMessages 업데이트도 동일하게 수행
                            if (this.workingMessages.AggregateDraftDialogDto && 
                                this.workingMessages.AggregateDraftDialogDto.draftOptions) {
                                let currentBoundedContext = boundedContextName;
                                if (!currentBoundedContext) {
                                    const gens = this.generators && this.generators.DraftGeneratorByFunctions;
                                    const genInst = gens && gens.generator;
                                    const client = genInst && genInst.client;
                                    const input = client && client.input;
                                    const bc = input && input.boundedContext;
                                    if (bc && bc.name) currentBoundedContext = bc.name;
                                }
                                const draftOption = this.workingMessages.AggregateDraftDialogDto.draftOptions.find(
                                    opt => opt.boundedContext === currentBoundedContext
                                );
                                
                                if (draftOption && draftOption.options && draftOption.options[optionIndex]) {
                                    if (draftOption.options[optionIndex].structure) {
                                        draftOption.options[optionIndex].structure.forEach(struct => {
                                            if (!struct || !struct.aggregate) return;
                                            if (struct.aggregate.name === singleAggregate.name) {
                                                this.$set(struct, 'previewAttributes', [...allDdlFields])
                                            }
                                        });
                                    }
                                }
                            }
                        } else {
                            // 여러 Aggregate가 있을 경우 AssignDDLFieldsToAggregateDraft 생성기 호출
                            const generatorKey = `option ${optionIndex + 1}`;
                            const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                            
                            try {
                                let result;

                                if (useLangGraph) {
                                    // ========== LangGraph Backend 사용 ==========
                                    result = await new Promise((resolve, reject) => {
                                        const generator = new AssignDDLFieldsToAggregateDraftLangGraph({
                                            input: {
                                                description: description || 'Bounded context description',
                                                aggregateDrafts: aggregateDrafts,
                                                generatorKey: generatorKey,
                                                traceMap: normalizedTraceMap,
                                                allDdlFields: allDdlFields  // refs 포함을 위해 전체 객체 배열 전달
                                            },
                                            onUpdate: (updateData) => {
                                                this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = `Assigning DDL fields for ${generatorKey}...`;
                                                this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = updateData.progress;
                                            },
                                            onGenerationSucceeded: (result) => {
                                                resolve(result);
                                            },
                                            onWaiting: (waitingJobCount) => {
                                                console.log(`[DDLFields] Waiting: ${waitingJobCount} jobs ahead`);
                                            },
                                            onError: (error) => {
                                                const errorMessage = "An error occurred while adding preview properties based on DDL to the aggregate.\nPlease try again in a moment.\nError message: " + error.errorMessage
                                                console.error(errorMessage)
                                                alert(errorMessage)
                                                reject(new Error(errorMessage))
                                            }
                                        })
                                        generator.generate()
                                    });

                                } else {
                                    // ========== 기존 Frontend Generator 사용 ==========
                                    result = await new Promise((resolve, reject) => {
                                        const processErrorMessage = (returnObj) => {
                                            const errorMessage = "An error occurred while adding preview properties based on DDL to the aggregate.\nPlease try again in a moment.\nError message: " + returnObj.errorMessage
                                            console.error(errorMessage)
                                            alert(errorMessage)
                                            reject(new Error(errorMessage))
                                        }

                                        const generator = new AssignDDLFieldsToAggregateDraft({
                                            onSend: () => {
                                                this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                                                    leftBoundedContextCount: 1,
                                                    directMessage: "Waiting for preview attributes generation...",
                                                    progress: null
                                                }
                                            },
                                            onModelCreatedWithThinking: (returnObj) => {
                                                this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                                                this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress
                                            },
                                            onGenerationSucceeded: (returnObj) => {
                                                resolve(returnObj.modelValue.output);
                                            },
                                            onError: (returnObj) => {
                                                processErrorMessage(returnObj)
                                            },
                                            onRetry: (returnObj) => {
                                                console.warn(`[*] Option ${optionIndex} field assignment retry:`, returnObj.errorMessage);
                                                if (returnObj.isDied) {
                                                    processErrorMessage(returnObj)
                                                }
                                            }
                                        });

                                        // 입력값 설정
                                        generator.client.input = {
                                            description: description || 'Bounded context description',
                                            aggregateDrafts: aggregateDrafts,
                                            allDdlFields: allDdlFields.map(field => field.fieldName),
                                            generatorKey: generatorKey
                                        };

                                        // 생성 실행
                                        generator.generate();
                                    });
                                }

                                // 결과를 해당 옵션의 structure에 previewAttributes와 ddlFields로 추가
                                if (result) {
                                    option.structure.forEach(struct => {
                                        const assignment = result.find(
                                            fa => fa.aggregateName === struct.aggregate.name
                                        );
                                        if (assignment) {
                                            const previewAttributes = []
                                            const ddlFields = []
                                            for(const ddlField of assignment.ddl_fields) {
                                                const ddlFieldRef = allDdlFields.find(field => field.fieldName === ddlField)
                                                if(ddlFieldRef) {
                                                    // previewAttributes에 추가
                                                    previewAttributes.push({
                                                        fieldName: ddlFieldRef.fieldName,
                                                        refs: ddlFieldRef.refs || []
                                                    })
                                                    // ddlFields에도 추가 (refs 포함)
                                                    ddlFields.push({
                                                        fieldName: ddlFieldRef.fieldName,
                                                        fieldAlias: '',
                                                        refs: ddlFieldRef.refs || []
                                                    })
                                                }
                                            }
                                            this.$set(struct, 'previewAttributes', [...(previewAttributes || [])])
                                            this.$set(struct, 'ddlFields', [...(ddlFields || [])])
                                            console.log(`[*] Added previewAttributes and ddlFields to ${struct.aggregate.name}:`, struct.previewAttributes, struct.ddlFields);
                                        } else {
                                            this.$set(struct, 'previewAttributes', [])
                                            this.$set(struct, 'ddlFields', [])
                                        }
                                    });
                                }

                                // workingMessages의 draftOptions에서 해당하는 옵션 찾아서 업데이트
                                if (this.workingMessages.AggregateDraftDialogDto && 
                                    this.workingMessages.AggregateDraftDialogDto.draftOptions) {
                                    
                                    // 현재 처리 중인 bounded context 찾기 (null-guard 및 인자 우선)
                                    let currentBoundedContext = boundedContextName;
                                    if (!currentBoundedContext) {
                                        const gens = this.generators && this.generators.DraftGeneratorByFunctions;
                                        const genInst = gens && gens.generator;
                                        const client = genInst && genInst.client;
                                        const input = client && client.input;
                                        const bc = input && input.boundedContext;
                                        if (bc && bc.name) currentBoundedContext = bc.name;
                                    }
                                    if (!currentBoundedContext) {
                                        // 안전하게 스킵
                                        return;
                                    }
                                    const draftOption = this.workingMessages.AggregateDraftDialogDto.draftOptions.find(
                                        opt => opt.boundedContext === currentBoundedContext
                                    );
                                    
                                    if (draftOption && draftOption.options && draftOption.options[optionIndex]) {
                                        // structure의 각 aggregate에 previewAttributes 추가
                                        if (draftOption.options[optionIndex].structure) {
                                            draftOption.options[optionIndex].structure.forEach(struct => {
                                                const updatedStruct = option.structure.find(
                                                    s => s.aggregate.name === struct.aggregate.name
                                                );
                                                if (updatedStruct && updatedStruct.previewAttributes) {
                                                    this.$set(struct, 'previewAttributes', [...(updatedStruct.previewAttributes || [])])
                                                }
                                            });
                                        }
                                    }
                                }

                            } catch (error) {
                                console.error(`[*] Failed to assign fields for option ${optionIndex}:`, error);
                                // 실패한 경우 빈 previewAttributes 설정
                                option.structure.forEach(struct => {
                                    this.$set(struct, 'previewAttributes', [])
                                });
                            }
                        }
                    }
                }
                else {
                    // 별도의 DDL 필드가 없을 경우에는 AssignPreviewFieldsToAggregateDraft를 이용해서 직접 속성을 생성
                    // LangGraph 사용 여부 확인
                    const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                    
                    if (useLangGraph) {
                        // ========== LangGraph Backend 사용 ==========
                        for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
                            const option = options[optionIndex];
                            
                            if (!option.structure || option.structure.length === 0) continue;

                            // structure에서 aggregateDrafts 구성
                            const aggregateDrafts = option.structure.map(struct => ({
                                name: struct.aggregate.name,
                                alias: struct.aggregate.alias
                            }));
                            const generatorKey = `option ${optionIndex + 1}`;

                            try {
                                // 원본 요구사항 구성 (userStory + ddl) - convertToOriginalRefsUsingTraceMap에서 클램핑에 사용
                                const originalRequirements = [
                                    this.projectInfo.usedUserStory || '',
                                    this.projectInfo.usedInputDDL || ''
                                ].filter(Boolean).join('\n');
                                
                                const result = await new Promise((resolve, reject) => {
                                    const generator = new AssignPreviewFieldsToAggregateDraftLangGraph({
                                        input: {
                                            description: description || 'Bounded context description',
                                            aggregateDrafts: aggregateDrafts,
                                            generatorKey: generatorKey,
                                            traceMap: normalizedTraceMap,
                                            originalRequirements: originalRequirements // 원본 요구사항 전달
                                        },
                                        onUpdate: (updateData) => {
                                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = `Generating preview fields for ${generatorKey}...`;
                                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = updateData.progress;
                                        },
                                        onGenerationSucceeded: (result) => {
                                            resolve(result);
                                        },
                                        onWaiting: (waitingJobCount) => {
                                            // console.log(`[PreviewFields] Waiting: ${waitingJobCount} jobs ahead`);
                                        },
                                        onError: (error) => {
                                            reject(new Error(error.errorMessage || 'Preview fields generation failed'));
                                        }
                                    })
                                    generator.generate()
                                });

                                // 결과를 해당 옵션의 structure에 previewAttributes로 추가
                                if (result) {
                                    option.structure.forEach(struct => {
                                        const assignment = result.find(
                                            fa => fa.aggregateName === struct.aggregate.name
                                        );
                                        if (assignment) {
                                            // console.log(`[PreviewFields] 📝 Adding ${assignment.previewFields.length} fields to ${struct.aggregate.name}`);
                                            this.$set(struct, 'previewAttributes', [...(assignment.previewFields || [])])
                                            // console.log(`[*] Added previewAttributes to ${struct.aggregate.name}:`, struct.previewAttributes);
                                        } else {
                                            console.warn(`[PreviewFields] ⚠️ No assignment found for ${struct.aggregate.name} in ${generatorKey}`);
                                            this.$set(struct, 'previewAttributes', [])
                                        }
                                    });
                                }

                                // workingMessages의 draftOptions에서 해당하는 옵션 찾아서 업데이트
                                if (this.workingMessages.AggregateDraftDialogDto && 
                                    this.workingMessages.AggregateDraftDialogDto.draftOptions) {
                                    
                                    const draftOption = this.workingMessages.AggregateDraftDialogDto.draftOptions.find(
                                        opt => opt.boundedContext === boundedContextName
                                    );
                                    
                                    if (draftOption && draftOption.options && draftOption.options[optionIndex]) {
                                        if (draftOption.options[optionIndex].structure) {
                                            draftOption.options[optionIndex].structure.forEach(struct => {
                                                const updatedStruct = option.structure.find(
                                                    s => s.aggregate.name === struct.aggregate.name
                                                );
                                                if (updatedStruct && updatedStruct.previewAttributes) {
                                                    this.$set(struct, 'previewAttributes', [...(updatedStruct.previewAttributes || [])])
                                                }
                                            });
                                        }
                                    }
                                }

                            } catch (error) {
                                console.error(`[*] Failed to assign fields for option ${optionIndex}:`, error);
                                alert(`An error occurred while adding the preview property to the aggregate.\nPlease try again in a moment.\nError: ${error.message}`);
                                // 실패한 경우 빈 previewAttributes 설정
                                option.structure.forEach(struct => {
                                    this.$set(struct, 'previewAttributes', [])
                                });
                            }
                        }
                    } else {
                        // ========== 기존 Frontend Generator 사용 ==========
                        for (let optionIndex = 0; optionIndex < options.length; optionIndex++) {
                            const option = options[optionIndex];
                            
                            if (!option.structure || option.structure.length === 0) continue;

                            // structure에서 aggregateDrafts 구성
                            const aggregateDrafts = option.structure.map(struct => ({
                                name: struct.aggregate.name,
                                alias: struct.aggregate.alias
                            }));
                            const generatorKey = `option ${optionIndex + 1}`;

                            try {

                                const result = await new Promise((resolve, reject) => {
                                    const processErrorMessage = (returnObj) => {
                                        const errorMessage = "An error occurred while adding the preview property to the aggregate.\nPlease try again in a moment.\nError message: " + returnObj.errorMessage
                                        console.error(errorMessage)
                                        alert(errorMessage)
                                        reject(new Error(errorMessage))
                                    }

                                    const generator = new AssignPreviewFieldsToAggregateDraft({
                                        onSend: () => {
                                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                                                leftBoundedContextCount: 1,
                                                directMessage: "Waiting for preview attributes generation...",
                                                progress: null
                                            }
                                        },
                                        onModelCreatedWithThinking: (returnObj) => {
                                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress
                                        },
                                        onGenerationSucceeded: (returnObj) => {
                                            resolve(returnObj.modelValue.output);
                                        },
                                        onError: (returnObj) => {
                                            processErrorMessage(returnObj)
                                        },
                                        onRetry: (returnObj) => {
                                            console.warn(`[*] Option ${optionIndex} field assignment retry:`, returnObj.errorMessage);
                                            if (returnObj.isDied) {
                                                processErrorMessage(returnObj)
                                            }
                                        }
                                    });

                                    // 입력값 설정
                                    generator.client.input = {
                                        description: description || 'Bounded context description',
                                        traceMap: normalizedTraceMap,
                                        aggregateDrafts: aggregateDrafts,
                                        generatorKey: generatorKey
                                    };

                                    // 생성 실행
                                    generator.generate();
                                });

                                // 결과를 해당 옵션의 structure에 previewAttributes로 추가
                                if (result) {
                                    option.structure.forEach(struct => {
                                        const assignment = result.find(
                                            fa => fa.aggregateName === struct.aggregate.name
                                        );
                                        if (assignment) {
                                            this.$set(struct, 'previewAttributes', [...(assignment.previewFields || [])])
                                            console.log(`[*] Added previewAttributes to ${struct.aggregate.name}:`, struct.previewAttributes);
                                        } else {
                                            this.$set(struct, 'previewAttributes', [])
                                        }
                                    });
                                }

                                // workingMessages의 draftOptions에서 해당하는 옵션 찾아서 업데이트
                                if (this.workingMessages.AggregateDraftDialogDto && 
                                    this.workingMessages.AggregateDraftDialogDto.draftOptions) {
                                    
                                    // 현재 처리 중인 bounded context는 파라미터로 전달받음
                                    const draftOption = this.workingMessages.AggregateDraftDialogDto.draftOptions.find(
                                        opt => opt.boundedContext === boundedContextName
                                    );
                                    
                                    if (draftOption && draftOption.options && draftOption.options[optionIndex]) {
                                        // structure의 각 aggregate에 previewAttributes 추가
                                        if (draftOption.options[optionIndex].structure) {
                                            draftOption.options[optionIndex].structure.forEach(struct => {
                                                const updatedStruct = option.structure.find(
                                                    s => s.aggregate.name === struct.aggregate.name
                                                );
                                                if (updatedStruct && updatedStruct.previewAttributes) {
                                                    this.$set(struct, 'previewAttributes', [...(updatedStruct.previewAttributes || [])])
                                                }
                                            });
                                        }
                                    }
                                }

                            } catch (error) {
                                console.error(`[*] Failed to assign fields for option ${optionIndex}:`, error);
                                // 실패한 경우 빈 previewAttributes 설정
                                option.structure.forEach(struct => {
                                    this.$set(struct, 'previewAttributes', [])
                                });
                            }
                        }
                    }
                }

                if(this.generators.DraftGeneratorByFunctions.inputs.length === 0) {
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.leftBoundedContextCount = 0
                }

                // Preview Fields 생성 완료 후 preservedDraftOptions 업데이트
                // 다음 BC 처리 시 previewAttributes가 보존되도록 함
                this.generators.DraftGeneratorByFunctions.preservedDraftOptions = 
                    this.workingMessages.AggregateDraftDialogDto.draftOptions.slice()

                afterGenerateCallback()
            }
            const __isValidDDLFields = (ddlFields) => {
                return DataValidationUtil.isValidData(ddlFields, {
                    type: 'array',
                    required: true,
                    items: { type: 'object', properties: { fieldName: { type: 'string', required: true }, refs: { type: 'array', required: true, items: { type: 'array', required: true, items: { type: 'array', required: true, items: { type: 'number', required: true } } } } } }
                })
            }


            const callExtractDDLFieldsGenerator = (requirements, bcName) => {
                const ddlRequirements = requirements.filter(requirement => requirement.type === 'DDL').map(requirement => ({
                    text: requirement.text,
                    refs: requirement.refs
                }))
                if(!ddlRequirements.length) return []
                
                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                
                if (useLangGraph) {
                    // ========== LangGraph Backend 사용 ==========
                    return new Promise((resolve, reject) => {
                        const generator = new ExtractDDLFieldsGeneratorLangGraph({
                            input: {
                                ddlRequirements: ddlRequirements,
                                boundedContextName: bcName
                            },
                            onModelCreatedWithThinking: (ret) => {
                                this.workingMessages.AggregateDraftDialogDto.isShow = true
                                this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                                    leftBoundedContextCount: 1,
                                    directMessage: ret.directMessage,
                                    progress: ret.progress
                                }
                            },
                            onGenerationSucceeded: (returnObj) => {
                                resolve(returnObj.modelValue.output)
                            },
                            onError: (error) => {
                                const errorMessage = "An error occurred while extracting core fields from the DDL.\nPlease try again in a moment.\nError message: " + error.errorMessage
                                console.error(errorMessage)
                                alert(errorMessage)
                                reject(new Error(errorMessage))
                            }
                        })
                        generator.generate()
                    })
                } else {
                    // ========== 기존 Frontend Generator 사용 ==========
                    return new Promise((resolve, reject) => {
                        const processErrorMessage = (returnObj) => {
                            const errorMessage = "An error occurred while extracting core fields from the DDL.\nPlease try again in a moment.\nError message: " + returnObj.errorMessage
                            console.error(errorMessage)
                            alert(errorMessage)
                            reject(new Error(errorMessage))
                        }

                        if(!this.generators.ExtractDDLFieldsGenerator.generator) {
                            this.generators.ExtractDDLFieldsGenerator.generator = new ExtractDDLFieldsGenerator({
                                onSend: (input, stopCallback) => {
                                    this.workingMessages.AggregateDraftDialogDto.isShow = true
                                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                                        leftBoundedContextCount: 1,
                                        directMessage: "Waiting for DDL fields extraction...",
                                        progress: null
                                    }
                                    this.workingMessages.AggregateDraftDialogDto.actions.stop = stopCallback
                                },

                                onModelCreatedWithThinking: (returnObj) => {
                                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress
                                }
                            })
                        }

                        this.generators.ExtractDDLFieldsGenerator.generator.client.onGenerationSucceeded = (returnObj) => {
                            resolve(returnObj.modelValue.output)
                        }

                        this.generators.ExtractDDLFieldsGenerator.generator.client.onError = (returnObj) => {
                            processErrorMessage(returnObj)
                        }

                        this.generators.ExtractDDLFieldsGenerator.generator.client.onRetry = (returnObj) => {
                            console.warn('ExtractDDLFieldsGenerator Retry:', returnObj.errorMessage)
                            if(returnObj.isDied) {
                                processErrorMessage(returnObj)
                            }
                        }

                        this.generators.ExtractDDLFieldsGenerator.generator.client.input = {
                            "ddlRequirements": ddlRequirements,
                            "boundedContextName": bcName
                        }
                        this.generators.ExtractDDLFieldsGenerator.generator.generate()
                    })
                }
            }


            this.generators.DraftGeneratorByFunctions.generator = new DraftGeneratorByFunctions({
                onSend: (input, stopCallback) => {
                    this.workingMessages.AggregateDraftDialogDto.isShow = true
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.DraftGeneratorByFunctions.inputs.length + 1,
                        directMessage: "",
                        progress: null
                    }
                    this.workingMessages.AggregateDraftDialogDto.actions.stop = stopCallback

                    const messageUniqueId = this.workingMessages.AggregateDraftDialogDto.uniqueId
                    this.workingMessages.AggregateDraftDialogDto.actions.retry = () => {
                        this.workingMessages.AggregateDraftDialogDto = this.messages.find(message => message.uniqueId === messageUniqueId)
                        this.workingMessages.AggregateDraftDialogDto.draftOptions = []
                        this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                            leftBoundedContextCount: this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs.length + 1,
                            directMessage: "",
                            progress: 0
                        }

                        this.generators.DraftGeneratorByFunctions.inputs = structuredClone(
                            this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs
                        )
                        this.generators.DraftGeneratorByFunctions.accumulatedDrafts = structuredClone(
                            this.workingMessages.AggregateDraftDialogDto.retryInputs.initialAccumulatedDrafts
                        )

                        this.generators.DraftGeneratorByFunctions.generateIfInputsExist()
                    }
                    createThinkingUpdateInterval(0, input.subjectText)
                },

                onFirstResponse: (returnObj) => {
                    clearThinkingUpdateInterval()
                    this.workingMessages.AggregateDraftDialogDto.isShow = true
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.DraftGeneratorByFunctions.inputs.length + 1,
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

                onThink: (returnObj, thinkText) => {
                    clearThinkingUpdateInterval()

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = 0

                    this.workingMessages.AggregateDraftDialogDto.draftOptions = [
                        ...this.generators.DraftGeneratorByFunctions.preservedDraftOptions,
                        {
                            boundedContext: returnObj.inputParams.boundedContext.name,
                            boundedContextAlias: returnObj.inputParams.boundedContext.displayName,
                            description: returnObj.inputParams.description,
                            options: [],
                            conclusions: "",
                            defaultOptionIndex: null,
                            inference: thinkText
                        }
                    ]
                },

                onModelCreatedWithThinking: (returnObj) => {
                    clearThinkingUpdateInterval()
                    if(!returnObj.modelValue.inference ||
                       !returnObj.modelValue.inference.length) return

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = returnObj.progress
                    if(!returnObj.modelValue.output) return

                    this.generators.DraftGeneratorByFunctions._makeDraftOptions(returnObj)
                },

                onGenerationSucceeded: async (returnObj) => {
                    clearThinkingUpdateInterval()

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: (returnObj.isFeedbackBased) ? 1 : this.generators.DraftGeneratorByFunctions.inputs.length + 1,
                        directMessage: returnObj.directMessage,
                        progress: 100
                    }

                    try {
                        const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                        if (useLangGraph) {
                            const traceGenerator = new AddTraceToDraftOptionsGeneratorLangGraph({
                                input: {
                                    generatedDraftOptions: returnObj.modelValue.output.options,
                                    boundedContextName: returnObj.inputParams.boundedContext.name,
                                    functionalRequirements: returnObj.inputParams.boundedContext.description,
                                    traceMap: returnObj.inputParams.boundedContext.requirements && returnObj.inputParams.boundedContext.requirements.traceMap
                                },
                                onModelCreatedWithThinking: (ret) => {
                                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = ret.directMessage
                                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = ret.progress
                                },
                                onGenerationSucceeded: (result) => {
                                    returnObj.modelValue.output.options = result.generatedDraftOptionsWithTrace
                                    
                                    // AI 추천 옵션 마킹 (인라인 구현)
                                    if (returnObj.modelValue.output && returnObj.modelValue.output.options) {
                                        const defaultIdx = returnObj.modelValue.output.defaultOptionIndex || 0;
                                        for (let i = 0; i < returnObj.modelValue.output.options.length; i++) {
                                            returnObj.modelValue.output.options[i].isAIRecommended = (i === defaultIdx);
                                        }
                                    }
                                    
                                    this.generators.DraftGeneratorByFunctions._makeDraftOptions(returnObj)

                                    if(!returnObj.isFeedbackBased) {
                                        this.generators.DraftGeneratorByFunctions.updateAccumulatedDrafts(returnObj.modelValue.output, returnObj.inputParams.boundedContext)
                                    }

                                    // Preview attributes 생성 (표준 변환은 별도 커맨드로 실행)
                                    generatePreviewAggAttributesToDraftOptions(
                                        returnObj.modelValue.output.options,
                                        returnObj.inputParams.boundedContext.description,
                                        returnObj.inputParams.boundedContext.requirements && returnObj.inputParams.boundedContext.requirements.traceMap,
                                        returnObj.inputParams.boundedContext.requirements && returnObj.inputParams.boundedContext.requirements.ddlFields,
                                        returnObj.inputParams.boundedContext.name,
                                        () => {
                                            if(returnObj.isFeedbackBased) {
                                                this.workingMessages.AggregateDraftDialogDto.draftUIInfos.leftBoundedContextCount = 0
                                                this.$emit("update:draft", this.messages);
                                            }
                                            else if(!this.generators.DraftGeneratorByFunctions.generateIfInputsExist()){
                                                this.$emit("update:draft", this.messages);
                                            }
                                        }
                                    )
                                },
                                onError: (error) => {
                                    console.error('[ESDialoger] Traceability generation failed:', error)
                                }
                            })
                            traceGenerator.generate()
                        } else {
                            AddTraceToDraftOptionsGenerator.addTraceToDraftOptions(
                                returnObj.modelValue.output.options,
                                returnObj.inputParams.boundedContext.name,
                                returnObj.inputParams.boundedContext.description,
                                returnObj.inputParams.boundedContext.requirements.traceMap,
                                {
                                    onModelCreatedWithThinking: (ret) => {
                                        this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = ret.directMessage
                                        this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = ret.progress
                                    }
                                }
                            ).then(result => {
                                returnObj.modelValue.output.options = result.generatedDraftOptionsWithTrace
                                this.generators.DraftGeneratorByFunctions._makeDraftOptions(returnObj)
                                if(!returnObj.isFeedbackBased) {
                                    this.generators.DraftGeneratorByFunctions.updateAccumulatedDrafts(returnObj.modelValue.output, returnObj.inputParams.boundedContext)
                                }
                                generatePreviewAggAttributesToDraftOptions(
                                    returnObj.modelValue.output.options, 
                                    returnObj.inputParams.boundedContext.description, 
                                    returnObj.inputParams.boundedContext.requirements.traceMap, 
                                    returnObj.inputParams.boundedContext.requirements.ddlFields,
                                    returnObj.inputParams.boundedContext.name,
                                    () => {
                                        if(returnObj.isFeedbackBased) {
                                            this.workingMessages.AggregateDraftDialogDto.draftUIInfos.leftBoundedContextCount = 0
                                            this.$emit("update:draft", this.messages);
                                        }
                                        else if(!this.generators.DraftGeneratorByFunctions.generateIfInputsExist()){
                                            this.$emit("update:draft", this.messages);
                                        }
                                    }
                                )
                            })
                        }
                    } catch (error) {
                        console.error('[ESDialoger] Traceability addition error:', error)
                    }
                },

                onRetry: (returnObj) => {
                    clearThinkingUpdateInterval()
                    console.warn(`[!] There was an error creating your draft, please try again.\n* Error log \n${returnObj.errorMessage}`)
                }
            })

            this.generators.DraftGeneratorByFunctions._makeDraftOptions = (returnObj) => {
                if(returnObj.isFeedbackBased) {
                    const draftOptions = structuredClone(this.generators.DraftGeneratorByFunctions.preservedDraftOptionsForFeedback)

                    const replaceIndex = draftOptions.findIndex(draftOption => draftOption.boundedContext === returnObj.inputParams.boundedContext.name)
                    draftOptions.splice(replaceIndex, 1, this.generators.DraftGeneratorByFunctions._getXAIDtoDraftOptions(
                        returnObj.modelValue.output,
                        returnObj.inputParams.boundedContext,
                        returnObj.inputParams.description,
                        returnObj.modelValue.inference
                    ))


                    this.workingMessages.AggregateDraftDialogDto.draftOptions = draftOptions
                    return
                }

                this.workingMessages.AggregateDraftDialogDto.draftOptions = [
                    ...this.generators.DraftGeneratorByFunctions.preservedDraftOptions,
                    this.generators.DraftGeneratorByFunctions._getXAIDtoDraftOptions(
                        returnObj.modelValue.output,
                        returnObj.inputParams.boundedContext,
                        returnObj.inputParams.description,
                        returnObj.modelValue.inference
                    )
                ]
            }

            this.generators.DraftGeneratorByFunctions._getXAIDtoDraftOptions = (output, targetBoundedContext, description, inference) => {
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
                    inference: inference
                }
            }

            this.generators.DraftGeneratorByFunctions.buildInitialInputs = async (selectedStructureOption) => {
                const getRequirements = (bc) => {
                    const getRequirementsByType = (type) => {
                        return bc.requirements.filter(requirement => requirement.type === type).map(requirement => requirement.text).join("\n")
                    }

                    const requirements = {
                        userStory: "",
                        ddl: "",
                        event: "",
                        eventNames: ""
                    }

                    requirements.userStory = getRequirementsByType("userStory")
                    requirements.ddl = getRequirementsByType("DDL")
                    requirements.event = getRequirementsByType("Event")
                    if(bc.events) requirements.eventNames = bc.events.join(", ") + " 이벤트가 발생할 수 있어."

                    return requirements
                }

                let passedGeneratorInputs = []
                for(const bc of selectedStructureOption.boundedContexts){
                    const bcDescriptionWithMappingIndex = TraceMarkdownUtil.getDescriptionWithMappingIndex(
                        bc,
                        selectedStructureOption.relations,
                        selectedStructureOption.explanations,
                        this.requirementsValidationResult && this.requirementsValidationResult.analysisResult ? this.requirementsValidationResult.analysisResult.events : []
                    )

                    let requirements = getRequirements(bc)
                    if(requirements.ddl && requirements.ddl.length > 0) {
                        const ddlFieldsResult = await callExtractDDLFieldsGenerator(bc.requirements, bc.name);
                        requirements.ddlFields = ddlFieldsResult;
                    } else {
                        requirements.ddlFields = []
                    }
                    requirements.description = bcDescriptionWithMappingIndex.markdown
                    
                    // traceMap의 refs를 number-only 형식으로 변환
                    const convertedTraceMap = {};
                    for (const [key, value] of Object.entries(bcDescriptionWithMappingIndex.traceMap)) {
                        if (!value.refs) {
                            convertedTraceMap[key] = value;
                            continue;
                        }
                        
                        // 이미 올바른 형식인지 체크: [[[number, number], [number, number]]]
                        try {
                            const isValid = Array.isArray(value.refs) &&
                                value.refs.length > 0 &&
                                Array.isArray(value.refs[0]) &&
                                value.refs[0].length === 2 &&
                                Array.isArray(value.refs[0][0]) &&
                                value.refs[0][0].length === 2 &&
                                typeof value.refs[0][0][0] === 'number' &&
                                typeof value.refs[0][0][1] === 'number' &&
                                Array.isArray(value.refs[0][1]) &&
                                value.refs[0][1].length === 2 &&
                                typeof value.refs[0][1][0] === 'number' &&
                                typeof value.refs[0][1][1] === 'number';
                            
                            if (isValid) {
                                convertedTraceMap[key] = value;
                                continue;
                            }
                        } catch (e) {
                            // 형식 체크 실패, 변환 진행
                        }
                        
                        // refs의 모든 number를 재귀적으로 수집
                        const numbers = [];
                        const collectNumbers = (arr) => {
                            for (const item of arr) {
                                if (typeof item === 'number') {
                                    numbers.push(item);
                                } else if (Array.isArray(item)) {
                                    collectNumbers(item);
                                }
                            }
                        };
                        
                        collectNumbers(value.refs);
                        
                        // number가 있으면 [[[start, col], [end, col]]] 형식으로 변환
                        let numberOnlyRefs;
                        if (numbers.length >= 4) {
                            // 4개 이상: [line1, col1, line2, col2, ...] → [[line1, col1], [line2, col2]]
                            numberOnlyRefs = [[[numbers[0], numbers[1]], [numbers[2], numbers[3]]]];
                        } else if (numbers.length === 3) {
                            // 3개: [line1, col1, line2] → [[line1, col1], [line2, 1]]
                            numberOnlyRefs = [[[numbers[0], numbers[1]], [numbers[2], 1]]];
                        } else if (numbers.length === 2) {
                            // 2개: [line, col] 또는 [line1, line2] → [[line, col], [line, col]]
                            numberOnlyRefs = [[[numbers[0], numbers[1]], [numbers[0], numbers[1]]]];
                        } else if (numbers.length === 1) {
                            // 1개: [line] → [[line, 1], [line, 999]]
                            numberOnlyRefs = [[[numbers[0], 1], [numbers[0], 999]]];
                        } else {
                            // 없음: [[0, 1], [0, 999]]
                            numberOnlyRefs = [[[0, 1], [0, 999]]];
                        }
                        
                        convertedTraceMap[key] = {
                            ...value,
                            refs: numberOnlyRefs
                        };
                    }
                    // Firebase 직렬화를 위해 일반 객체로 저장 (Map 객체는 Firebase에서 직렬화되지 않음)
                    // 프론트엔드에서 사용할 때는 Map으로 변환하거나, 일반 객체로 사용
                    requirements.traceMap = convertedTraceMap
                    requirements.commandInfos = bc.commandInfos ? bc.commandInfos : []
                    requirements.commandNames = bc.commandInfos ? bc.commandInfos.map(command => command.name) : []
                    requirements.readModelInfos = bc.readModelInfos ? bc.readModelInfos : []
                    requirements.readModelNames = bc.readModelInfos ? bc.readModelInfos.map(readModel => readModel.name) : []

                    passedGeneratorInputs.push({
                        boundedContext: {
                            name: bc.name,
                            alias: bc.alias,
                            displayName: bc.alias,
                            description: bcDescriptionWithMappingIndex.markdown,
                            aggregates: bc.aggregates,
                            requirements: requirements
                        },
                        description: bcDescriptionWithMappingIndex.markdown
                    })
                }

                this.generators.DraftGeneratorByFunctions.initialInputs = structuredClone(passedGeneratorInputs)
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
                            enumerations: [],
                            valueObjects: [] 
                        }));
                        accumulatedDrafts[boundedContext.name] = aggregates;
                    }
                });
                this.generators.DraftGeneratorByFunctions.initialAccumulatedDrafts = structuredClone(accumulatedDrafts);
                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialAccumulatedDrafts = structuredClone(accumulatedDrafts);
            }
            this.generators.DraftGeneratorByFunctions.initInputs = () => {
                this.generators.DraftGeneratorByFunctions.inputs = structuredClone(
                    this.generators.DraftGeneratorByFunctions.initialInputs
                )
                this.workingMessages.AggregateDraftDialogDto.draftOptions = []

                this.generators.DraftGeneratorByFunctions.accumulatedDrafts = structuredClone(
                    this.generators.DraftGeneratorByFunctions.initialAccumulatedDrafts
                )
            }
            this.generators.DraftGeneratorByFunctions.generateIfInputsExist = () => {
                if(this.generators.DraftGeneratorByFunctions.inputs.length > 0) {
                    const input = this.generators.DraftGeneratorByFunctions.inputs.shift()
                    
                    // LangGraph 사용 여부 확인
                    const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                    
                    if (useLangGraph) {
                        // LangGraph Generator 사용
                        const langGraphGenerator = new DraftGeneratorByFunctionsLangGraph({
                            input: {
                                description: input.description,
                                boundedContext: input.boundedContext,
                                accumulatedDrafts: this.generators.DraftGeneratorByFunctions.accumulatedDrafts,
                                analysisResult: null
                            },
                            onThink: this.generators.DraftGeneratorByFunctions.generator.client.onThink,
                            onGenerationSucceeded: this.generators.DraftGeneratorByFunctions.generator.client.onGenerationSucceeded,
                            onError: this.generators.DraftGeneratorByFunctions.generator.client.onRetry
                        });
                        langGraphGenerator.generate();
                    } else {
                        // 기존 Generator 사용
                        this.generators.DraftGeneratorByFunctions.generator.client.input = {
                            description: input.description,
                            boundedContext: input.boundedContext,
                            accumulatedDrafts: this.generators.DraftGeneratorByFunctions.accumulatedDrafts
                        }
                        this.generators.DraftGeneratorByFunctions.generator.generate()
                    }
                    
                    return true
                }
                return false
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

                this.generators.DraftGeneratorByFunctions.generator.client.input = {
                    description: boundedContextInfo.description || "",
                    boundedContext: {
                        ...boundedContextInfo.options[0].boundedContext,
                        aggregates: []
                    },
                    accumulatedDrafts: accumulatedDrafts,
                    feedback: {
                        previousDraftOutput: {options: 
                            RefsTraceUtil.removeRefsAttributes(
                                boundedContextInfo.options.map(option => option.structure)
                            )
                        },
                        feedbacks: [
                            feedback
                        ]
                    }
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
            },
            "projectInfo.userStory": {
                deep: true,
                handler: _.debounce(function(newVal, oldVal) {
                    // this.$emit("update:userStory", newVal)
                    
                    // AI 생성 중일 때만 자동 스크롤
                    if (!this.done && this.isAutoScrollEnabled) {
                        this.$nextTick(() => {
                            this.scrollToBottom();
                        });
                    }
                }, 1000)
            },
            "projectInfo.inputDDL": {
                deep: true,
                handler(newVal, oldVal) {
                    this.$emit("update:inputDDL", newVal)
                }
            },
            'processingState': {
                deep: true,
                handler(newState) {
                    if (!Array.isArray(this.messages)) return;
                    
                    this.messages.forEach(message => {
                        if (!message || !message.type || !message.uniqueId) return;
                        
                        if (['boundedContextResult', 'processAnalysis', 'bcGenerationOption'].includes(message.type)) {
                            this.updateMessageState(message.uniqueId, {
                                isSummarizeStarted: newState.isSummarizeStarted,
                                isGeneratingBoundedContext: newState.isGeneratingBoundedContext,
                                isStartMapping: newState.isStartMapping,
                                isAnalizing: newState.isAnalizing
                            });
                        }
                    });
                }
            },
            'workingMessages.AggregateDraftDialogDto': {
                handler(newValue) {
                    if (this.isServerProject && newValue) {
                        const messageIndex = this.messages.findIndex(
                            msg => msg.type === 'aggregateDraftDialogDto' && 
                                msg.uniqueId === newValue.uniqueId
                        );
                        
                        if (messageIndex !== -1) {
                            this.$set(this.messages, messageIndex, {
                                ...newValue
                            });
                        } else {
                            this.messages.push({
                                ...newValue
                            });
                        }
                    }
                },
                deep: true
            },
            activeTab: {
                handler(newVal) {
                    // User Story 탭(0번)이 활성화되었을 때 자동 스크롤 초기화
                    if (newVal === 0) {
                        this.$nextTick(() => {
                            setTimeout(() => {
                                this.initAutoScroll();
                            }, 100);
                        });
                    }
                }
            },
        },
        mounted(){
            var me = this;
            me.setUIStyle(me.uiStyle);
            me.init();

            // LangGraph 사용 여부 설정 (기본값: true)
            localStorage.setItem('useLangGraph', 'true');

            me.$app.try({
                context: me,
                async action(me){
                    // Gitea를 사용하는 경우 헤더 없이 요청 (빈 객체 사용)
                    if (window.PROVIDER === 'gitea') {
                        me.githubHeaders = {};
                    } else {
                        // GitHub를 사용하는 경우
                        if (localStorage.getItem("gitAccessToken")) {
                            me.gitAccessToken = localStorage.getItem("gitAccessToken");
                            me.githubHeaders = {
                                Authorization: "token " + me.gitAccessToken,
                                Accept: "application/vnd.github+json",
                            };
                        } else {
                            me.githubHeaders = {};
                        }
                    }
                }
            })
            
            me.loadAllRepoList()
            me.generateUserStory();

            window.addEventListener('storage', (event) => {
                if (event.key === 'modelListUpdate') {
                    me.modelListKey++;
                }
            })

            // 자동 스크롤 로직 초기화
            me.$nextTick(() => {
                // DOM이 완전히 준비될 때까지 더 기다림
                setTimeout(() => {
                    me.initAutoScroll();
                }, 100);
            });
        },
        beforeDestroy() {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'modelListUpdate') {
                    me.modelListKey++;
                }
            })

            // 스크롤 이벤트 리스너 정리
            if (this.$refs.userStoryContainer) {
                // textarea 이벤트 리스너만 정리
                const textarea = this.$refs.userStoryContainer.querySelector('textarea');
                if (textarea) {
                    textarea.removeEventListener('scroll', this.handleTextareaScroll);
                }
            }
        },
        data() {
            return {
                isCreatedModel: false,
                autoModel: null,
                state:{
                    generator: "UserStoryGenerator",
                    isAIModelSelected: false,
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

                options: {
                    keyboard: { bindTo: window },
                    height: '100%',
                    width: '100%',
                    canvas:{
                        drdPadding: 50
                    }
                },

                generateUserStoryDialog: false,

                done: false,
                generator: null,
                generatorName: null,
                showBCGenerationOption: false,
                resultDevideBoundedContext: {},
                selectedAspect: "",

                activeTab: null,
                generatorInputTabs: [this.$t('ESDialoger.generatorInputTabs.userStory'), "DDL"],
                chunks: [],
                summarizedResult: {
                    summary: "",
                    refs: [],
                    originalRequirements: ""
                },
                userStoryChunks: [],
                userStoryChunksIndex: 0,
                bcInAspectIndex: 0,
                processingRate: 0,
                currentProcessingBoundedContext: "Bounded Context",
                processingState: {
                    isSummarizeStarted: false,
                    isStartMapping: false,
                    isAnalizing: false,
                    isGeneratingBoundedContext: false,
                },
                isStopped: false,

                boundedContextVersion: null,
                
                reGenerateMessageId: null,

                requirementsValidationResult: null,
                
                pendingBCGeneration: false,
                isGeneratingBoundedContext: false,
                bcGenerationOption: {},

                currentGeneratedLength: 0,
                
                messages: [
                ],

                workingMessages: {
                    AggregateDraftDialog: null
                },

                generators: {
                    DraftGeneratorByFunctions: {
                        generator: null,

                        initialInputs: [],
                        inputs: [],

                        initialAccumulatedDrafts: {},
                        accumulatedDrafts: {},

                        preservedDraftOptionsForFeedback: [],
                        preservedDraftOptions: [],

                        _makeDraftOptions: (returnObj) => {},
                        _getXAIDtoDraftOptions: (output, targetBoundedContext, description, inference) => {},
                        buildInitialInputs: async (selectedStructureOption) => {},
                        initInputs: () => {},
                        generateIfInputsExist: () => {},

                        updateAccumulatedDrafts: (output, targetBoundedContext) => {},
                        generateWithFeedback: (boundedContextInfo, feedback, draftOptions) => {}
                    },
                    ExtractDDLFieldsGenerator: {
                        generator: null
                    },
                    AssignDDLFieldsToAggregateDraft: {
                        generator: null
                    }
                },

                collectedMockDatas: {
                    aggregateDraftScenarios: {
                    }
                },

                githubHeaders: null,
                gitAccessToken: null,
                allRepoList: [],
                pbcLists: [],
                pbcResults: [],
                frontEndResults: [],

                siteMap: [],
                
                // Command/ReadModel 추출 관련 상태
                commandReadModelData: null,
                isExtractingCommandReadModel: false,
                commandReadModelExtractionProgress: 0,

                modelListKey: 0,
                isAutoScrollEnabled: true,
                userScrollTimeout: null,
                isAutoScrollInProgress: false, // 자동 스크롤 진행 중 플래그
                autoScrollRetryCount: 0,
            }
        },
        methods: {
            async initESDialoger() {
                if(!this.draft) return;
                this.done = true;
                this.state.secondMessageIsTyping = false;
                this.projectInfo.userStory = this.projectInfo.userStory || '';
                this.projectInfo.inputDDL = this.projectInfo.inputDDL || '';
                this.projectInfo.usedUserStory = this.projectInfo.usedUserStory || '';
                this.projectInfo.usedInputDDL = this.projectInfo.usedInputDDL || '';
                this.userStoryChunks = this.projectInfo.userStoryChunks || [];
                this.summarizedResult = this.projectInfo.summarizedResult || {
                    summary: "",
                    refs: [],
                    originalRequirements: ""
                };

                this.messages = [];

                if(this.draft){
                    const addPropertyWithDelay = async (obj, key, value) => {
                        await new Promise(resolve => setTimeout(resolve, 30));
                        obj[key] = value;
                    };

                    const processMessageData = async (msg) => {
                        const newMessage = {};
                        
                        switch (msg.type) {
                            case 'aggregateDraftDialogDto':
                            case 'standardTransformedDraftDialogDto':
                                await addPropertyWithDelay(newMessage, 'type', msg.type);
                                await addPropertyWithDelay(newMessage, 'uniqueId', msg.uniqueId);
                                await addPropertyWithDelay(newMessage, 'isShow', msg.isShow);
                                await addPropertyWithDelay(newMessage, 'isGeneratorButtonEnabled', msg.isGeneratorButtonEnabled);
                                await addPropertyWithDelay(newMessage, 'boundedContextVersion', msg.boundedContextVersion);
                                await addPropertyWithDelay(newMessage, 'isEditable', msg.isEditable);
                                
                                // messageUniqueId가 있으면 추가 (표준 변환 메시지의 경우)
                                if (msg.messageUniqueId) {
                                    await addPropertyWithDelay(newMessage, 'messageUniqueId', msg.messageUniqueId);
                                }
                                
                                // draftUIInfos 점진적 추가
                                newMessage.draftUIInfos = {};
                                for (const [key, value] of Object.entries(msg.draftUIInfos || {})) {
                                    await addPropertyWithDelay(newMessage.draftUIInfos, key, value);
                                }

                                // draftOptions 점진적 처리
                                newMessage.draftOptions = [];
                                for (const option of msg.draftOptions) {
                                    const newOption = {};
                                    const { description, ...rest } = option;
                                    for (const [key, value] of Object.entries(rest)) {
                                        await addPropertyWithDelay(newOption, key, value);
                                    }
                                    newMessage.draftOptions.push(newOption);
                                }
                                
                                // selectedOptionItem 처리
                                if (msg.selectedOptionItem) {
                                    newMessage.selectedOptionItem = msg.selectedOptionItem;
                                }
                                
                                // transformationMappings 처리 (표준 변환 메시지의 경우)
                                if (msg.type === 'standardTransformedDraftDialogDto' && msg.transformationMappings) {
                                    newMessage.transformationMappings = msg.transformationMappings;
                                }
                                
                                if (msg.type === 'aggregateDraftDialogDto') {
                                    this.workingMessages.AggregateDraftDialog = newMessage;
                                    this.workingMessages['AggregateDraftDialogDto'] = newMessage;
                                } else if (msg.type === 'standardTransformedDraftDialogDto') {
                                    this.workingMessages['StandardTransformedDraftDialogDto'] = newMessage;
                                }
                                break;

                            case 'boundedContextResult':
                                await addPropertyWithDelay(newMessage, 'type', msg.type);
                                await addPropertyWithDelay(newMessage, 'uniqueId', msg.uniqueId);
                                await addPropertyWithDelay(newMessage, 'isStartMapping', msg.isStartMapping);
                                await addPropertyWithDelay(newMessage, 'isGeneratingBoundedContext', false);
                                await addPropertyWithDelay(newMessage, 'isAnalizing', msg.isAnalizing);
                                await addPropertyWithDelay(newMessage, 'isSummarizeStarted', msg.isSummarizeStarted);
                                await addPropertyWithDelay(newMessage, 'processingRate', msg.processingRate);
                                await addPropertyWithDelay(newMessage, 'currentProcessingBoundedContext', msg.currentProcessingBoundedContext);
                                await addPropertyWithDelay(newMessage, 'selectedAspect', msg.selectedAspect);
                                await addPropertyWithDelay(newMessage, 'summarizedResult', msg.summarizedResult);
                                await addPropertyWithDelay(newMessage, 'pbcLists', msg.pbcLists);
                                await addPropertyWithDelay(newMessage, 'isEditable', msg.isEditable);
                                await addPropertyWithDelay(newMessage, 'currentGeneratedLength', 0);
                                await addPropertyWithDelay(newMessage, 'userStory', this.projectInfo.usedUserStory);
                                
                                // Sanitize summarizedResult
                                if(!msg.summarizedResult) {
                                    newMessage.summarizedResult = {
                                        summary: "",
                                        refs: [],
                                        originalRequirements: ""
                                    };
                                }

                                // result 객체 점진적 처리
                                if (msg.result) {
                                    newMessage.result = {};
                                    for (const [key, value] of Object.entries(msg.result)) {
                                        await addPropertyWithDelay(newMessage.result, key, value);
                                    }

                                    this.selectedAspect = msg.selectedAspect;
                                    this.resultDevideBoundedContext[msg.selectedAspect] = JSON.parse(JSON.stringify(newMessage.result[msg.selectedAspect]));

                                    // pbc 항목 추가
                                    this.pbcResults = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts.filter(bc => bc.implementationStrategy.includes("PBC"));
                                    this.frontEndResults = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts.filter(bc => bc.name == "ui");
                                }
                                break;

                            case 'processAnalysis':
                                await addPropertyWithDelay(newMessage, 'type', msg.type);
                                await addPropertyWithDelay(newMessage, 'uniqueId', msg.uniqueId);
                                await addPropertyWithDelay(newMessage, 'isAnalizing', false);
                                await addPropertyWithDelay(newMessage, 'isSummarizeStarted', msg.isSummarizeStarted);
                                await addPropertyWithDelay(newMessage, 'isGeneratingBoundedContext', false);
                                await addPropertyWithDelay(newMessage, 'isStartMapping', msg.isStartMapping);
                                await addPropertyWithDelay(newMessage, 'processingRate', msg.processingRate);
                                await addPropertyWithDelay(newMessage, 'isEditable', msg.isEditable);
                                await addPropertyWithDelay(newMessage, 'currentGeneratedLength', 0);
                                
                                // content 객체 점진적 처리
                                if (msg.content) {
                                    newMessage.content = {};
                                    if (msg.content) {
                                        await addPropertyWithDelay(newMessage.content, 'projectName', msg.content.projectName);
                                        await addPropertyWithDelay(newMessage.content, 'type', msg.content.type);
                                    }

                                    // analysisResult 객체 처리
                                    newMessage.content.analysisResult = {};
                                    if (msg.content.analysisResult) {
                                        await addPropertyWithDelay(newMessage.content.analysisResult, 'actors', msg.content.analysisResult.actors);
                                        await addPropertyWithDelay(newMessage.content.analysisResult, 'events', msg.content.analysisResult.events);
                                        await addPropertyWithDelay(newMessage.content.analysisResult, 'recommendedBoundedContextsNumber', msg.content.analysisResult.recommendedBoundedContextsNumber);
                                        await addPropertyWithDelay(newMessage.content.analysisResult, 'reasonOfRecommendedBoundedContextsNumber', msg.content.analysisResult.reasonOfRecommendedBoundedContextsNumber);
                                    }
                                    // content 객체 처리
                                    newMessage.content.content = {};
                                    if (msg.content.content) {
                                        const BATCH_SIZE = 10;
                                        
                                        // elements 배치 처리
                                        newMessage.content.content.elements = [];
                                        if (msg.content.content.elements) {
                                            for (let i = 0; i < msg.content.content.elements.length; i += BATCH_SIZE) {
                                                const batch = msg.content.content.elements.slice(i, i + BATCH_SIZE);
                                                newMessage.content.content.elements.push(...batch);
                                                await new Promise(resolve => setTimeout(resolve, 200));
                                            }
                                        }

                                        // relations 배치 처리
                                        newMessage.content.content.relations = [];
                                        if (msg.content.content.relations) {
                                            for (let i = 0; i < msg.content.content.relations.length; i += BATCH_SIZE) {
                                                const batch = msg.content.content.relations.slice(i, i + BATCH_SIZE);
                                                newMessage.content.content.relations.push(...batch);
                                                await new Promise(resolve => setTimeout(resolve, 200));
                                            }
                                        }
                                    }
                                    this.requirementsValidationResult = JSON.parse(JSON.stringify(msg.content));
                                }
                                break;

                            case 'siteMapViewer':
                                await addPropertyWithDelay(newMessage, 'type', msg.type);
                                await addPropertyWithDelay(newMessage, 'uniqueId', msg.uniqueId);
                                await addPropertyWithDelay(newMessage, 'resultDevideBoundedContext', msg.resultDevideBoundedContext);
                                await addPropertyWithDelay(newMessage, 'siteMap', msg.siteMap.length > 0 ? msg.siteMap : []);
                                await addPropertyWithDelay(newMessage, 'commandReadModelData', msg.commandReadModelData);

                                this.commandReadModelData = msg.commandReadModelData;

                                this.siteMap = msg.siteMap.length > 0 ? msg.siteMap : [];
                                break;

                            case 'bcGenerationOption':
                                await addPropertyWithDelay(newMessage, 'type', msg.type);
                                await addPropertyWithDelay(newMessage, 'uniqueId', msg.uniqueId);
                                await addPropertyWithDelay(newMessage, 'isSummarizeStarted', msg.isSummarizeStarted);
                                await addPropertyWithDelay(newMessage, 'isGeneratingBoundedContext', false);
                                await addPropertyWithDelay(newMessage, 'isStartMapping', msg.isStartMapping);
                                await addPropertyWithDelay(newMessage, 'isAnalizing', msg.isAnalizing);
                                await addPropertyWithDelay(newMessage, 'generateOption', msg.generateOption);
                                await addPropertyWithDelay(newMessage, 'recommendedBoundedContextsNumber', msg.recommendedBoundedContextsNumber);
                                await addPropertyWithDelay(newMessage, 'reasonOfRecommendedBoundedContextsNumber', msg.reasonOfRecommendedBoundedContextsNumber);
                                await addPropertyWithDelay(newMessage, 'isEditable', msg.isEditable);
                                
                                this.bcGenerationOption = JSON.parse(JSON.stringify(msg.generateOption));
                                break;

                            case 'botMessage':
                            case 'userMessage':
                                await addPropertyWithDelay(newMessage, 'type', msg.type);
                                await addPropertyWithDelay(newMessage, 'uniqueId', msg.uniqueId);
                                await addPropertyWithDelay(newMessage, 'message', msg.message);
                                break;

                            default:
                                Object.assign(newMessage, msg);
                        }

                        return newMessage;
                    };

                    // 메시지들을 순차적으로 처리
                    for (const msg of this.draft) {
                        const restoredMessage = MessageDataRestoreUtil.restoreMessageData(msg);
                        const processedMessage = await processMessageData(restoredMessage);
                        this.messages.push(processedMessage);
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            },
            deleteModel(id){
                var me = this
                var index = me.value.modelList.findIndex(x => x == id)
                me.value.modelList.splice(index, 1)
                
                this.$emit("input", this.value);
                this.$emit("change", 'modelList');
            },
            setUIStyle(uiStyle){
                this.uiStyle = uiStyle;
            },
            init(){
                var me = this 
                if(!me.modelIds.ESDefinitionId) me.modelIds.ESDefinitionId = me.uuid();
            },

            onReceived(content){
                // recursive generator일 때는 토큰마다 업데이트하지 않음 (청크가 많아서 과도하게 호출됨)
                if (this.state.generator === "RecursiveUserStoryGenerator") {
                    return;
                }

                if(this.state.generator === "UserStoryGenerator"){
                    if(!this.projectInfo.userStory){
                        this.projectInfo['userStory'] = ''
                    }

                    if(content && content.length > 0){
                        this.$emit('update:userStory', content, false);
                        
                        // onReceived에서도 자동 스크롤 호출
                        if (!this.done && this.isAutoScrollEnabled) {
                            this.$nextTick(() => {
                                this.scrollToBottom();
                            });
                        }
                    }
                }
            },

            onModelCreated(model){
                if(this.state.generator.includes("UserStory")){
                    return;
                }
                if(model && model.modelValue && model.modelValue.output) {
                    model = model.modelValue.output
                }

                if((model && model.modelValue && model.modelValue.output && model.modelValue.output.currentGeneratedLength) || (model && model.currentGeneratedLength)){
                    this.currentGeneratedLength = model.currentGeneratedLength || model.modelValue.output.currentGeneratedLength;
                    if(this.state.generator === "RequirementsValidationGenerator" || 
                        this.state.generator === "RecursiveRequirementsValidationGenerator" ||
                        this.state.generator === "RequirementsValidationGeneratorLangGraph" ||
                        this.state.generator === "RecursiveRequirementsValidationGeneratorLangGraph"){
                        const currentMessage = this.messages.find(msg => msg.type === 'processAnalysis');
                        this.updateMessageState(currentMessage.uniqueId, {
                            currentGeneratedLength: this.currentGeneratedLength,
                        });
                    }else if(this.state.generator === "DevideBoundedContextGenerator" ||
                        this.state.generator === "DevideBoundedContextGeneratorLangGraph"){
                        const currentMessage = this.messages.find(msg => msg.type === 'boundedContextResult');
                        this.updateMessageState(currentMessage.uniqueId, {
                            currentGeneratedLength: this.currentGeneratedLength,
                        });
                    }else if(this.state.generator === "SiteMapGenerator" ||
                        this.state.generator === "SiteMapGeneratorLangGraph" ||
                        this.state.generator === "RecursiveSiteMapGeneratorLangGraph"){
                        const currentMessage = this.messages.find(msg => msg.type === 'siteMapViewer');
                        this.updateMessageState(currentMessage.uniqueId, {
                            currentGeneratedLength: this.currentGeneratedLength,
                        });
                    }
                }
            },

            onGenerationFinished(model){
                var me = this;
                me.done = true;

                if(me.isStopped){
                    me.isStopped = false;
                    return;
                }

                if(model && model.modelValue && model.modelValue.output) {
                    model = model.modelValue.output
                }

                if (me.state.generator === "RecursiveRequirementsSummarizer") {
                    me.generator.handleGenerationFinished(model);
                    return;
                }

                // if (me.state.generator === "DevideBoundedContextGeneratorLangGraph" || me.state.generator === "DevideBoundedContextGenerator") {
                //     const bcResult = model.modelValue.output;
                //     if (bcResult) {
                //         me.resultDevideBoundedContext[me.selectedAspect] = {
                //             thoughts: bcResult.thoughts,
                //             boundedContexts: bcResult.boundedContexts,
                //             relations: bcResult.relations,
                //             explanations: bcResult.explanations
                //         };
                        
                //         // 메시지 업데이트
                //         const bcMessage = me.messages.find(msg => msg.type === 'boundedContextResult');
                //         if (bcMessage) {
                //             const updatedResult = JSON.parse(JSON.stringify(me.resultDevideBoundedContext));
                            
                //             me.updateMessageState(bcMessage.uniqueId, {
                //                 result: updatedResult,
                //                 selectedAspect: me.selectedAspect,
                //                 isGeneratingBoundedContext: false
                //             });
                //         }
                //     }
                    
                //     me.processingState.isGeneratingBoundedContext = false;
                //     return;
                // }

                // Recursive SiteMap: 청크 단위 결과는 생성기 내부에서 누적 처리하며 진행상황/부분결과 업데이트
                if (me.state.generator === "RecursiveSiteMapGenerator") {
                    me.generator.handleGenerationFinished(model.siteMap);

                    try {
                        const total = me.generator.currentChunks.length || 1;
                        const done = Math.min(me.generator.currentChunkIndex, total);
                        const processingRate = Math.round((done / total) * 100);

                        // 부분 결과 구성
                        const partialRoot = {
                            id: me.uuid(),
                            title: me.generator.accumulated.title || 'New Website',
                            description: me.generator.accumulated.description || 'Website Description',
                            type: 'root',
                            boundedContexts: Array.from(me.generator.accumulated.boundedContextsMap.values()),
                            children: JSON.parse(JSON.stringify(me.generator.accumulated.rootChildren || []))
                        };
                        const partialTree = [partialRoot];

                        // 메시지 업데이트 (진행률, 부분 사이트맵)
                        const siteMapMsg = me.messages.find(msg => msg.type === 'siteMapViewer');
                        me.currentGeneratedLength = 0;
                        if (siteMapMsg) {
                            me.updateMessageState(siteMapMsg.uniqueId, {
                                siteMap: partialTree,
                                isGenerating: done < total,
                                processingRate,
                                currentChunk: done,
                                totalChunks: total,
                                currentGeneratedLength: me.currentGeneratedLength
                            });
                        }

                        // localStorage.setItem("siteMap", JSON.stringify(me.siteMap));
                        me.$emit("update:draft", me.messages);
                    } catch(e) {
                        console.warn('Recursive sitemap incremental update failed:', e);
                    }
                    return;
                }

                if(me.state.generator === "SiteMapGenerator"){
                    me.siteMap = model.siteMap.treeData;
                    me.currentGeneratedLength = 0;
                    me.updateMessageState(me.messages.find(msg => msg.type === 'siteMapViewer').uniqueId, {
                        siteMap: me.siteMap,
                        isGenerating: false,
                        currentGeneratedLength: me.currentGeneratedLength
                    });

                    // localStorage.setItem("siteMap", JSON.stringify(me.siteMap));
                    me.$emit("update:draft", me.messages)
                }

                // Recursive UserStory: 청크 단위 결과는 생성기 내부에서 누적 처리하며 진행상황/부분결과 업데이트
                if (me.state.generator === "RecursiveUserStoryGenerator" || 
                    me.state.generator === "RecursiveUserStoryGeneratorLangGraph" ||
                    me.generatorName === "RecursiveUserStoryGeneratorLangGraph") {
                    // handleGenerationFinished가 있는 경우에만 호출 (기존 방식)
                    if (me.generator.handleGenerationFinished) {
                        me.generator.handleGenerationFinished(model);
                    }

                    try {
                        const total = me.generator.currentChunks.length || 1;
                        const done = Math.min(me.generator.currentChunkIndex + 1, total);
                        
                        // 각 청크 완료마다 누적된 결과를 userStory로 emit
                        const accumulated = me.generator.accumulated;
                        if (accumulated && (accumulated.userStories || accumulated.actors || accumulated.businessRules)) {
                            const userStoryContent = me.convertUserStoriesToText(accumulated);
                            me.$emit('update:userStory', userStoryContent, false);
                            console.log('[ESDialoger] Updated userStory content, stories:', accumulated.userStories.length);
                        }

                        // 현재 처리 상태 표시 (선언된 데이터 활용)
                        me.processingRate = Math.round((done / total) * 100);
                        if(done == total){
                            me.done = true;
                            me.processingRate = 0;
                        }else{
                            me.done = false;
                        }
                        
                    } catch(e) {
                        console.warn('Recursive user story processing failed:', e);
                    }
                    return;
                }
            },  

            
            async onGenerationSucceeded(returnObj) {
                var me = this;
                me.done = true;

                if(me.isStopped){
                    me.isStopped = false;
                    return;
                }

                const model = returnObj.modelValue.output

                if(me.state.generator === "RequirementsValidationGenerator" || 
                    me.state.generator === "RecursiveRequirementsValidationGenerator" ||
                    me.state.generator === "RequirementsValidationGeneratorLangGraph" ||
                    me.state.generator === "RecursiveRequirementsValidationGeneratorLangGraph") {
                    
                    const currentMessage = me.messages.find(msg => msg.type === 'processAnalysis');
                    
                    if (me.state.generator === "RecursiveRequirementsValidationGenerator" ||
                        me.state.generator === "RecursiveRequirementsValidationGeneratorLangGraph") {
                        // 현재 청크의 인덱스가 마지막 청크의 인덱스보다 작은 경우
                        if (me.generator.currentChunkIndex < me.generator.currentChunks.length - 1) {
                            me.generator.handleGenerationFinished(model);
                            me.processingState.isAnalizing = true;
                            me.processingRate = Math.round((me.generator.currentChunkIndex + 1) / 
                                                            me.generator.currentChunks.length * 100)
                            me.updateMessageState(currentMessage.uniqueId, {
                                content: me.generator.accumulatedResults,
                                processingRate: me.processingRate
                            });
                            
                        } else {
                            me.generator.handleGenerationFinished(model);
                            me.processingState.isAnalizing = false;
                            me.processingRate = 0;
                            me.updateMessageState(currentMessage.uniqueId, {
                                content: me.generator.accumulatedResults,
                                processingRate: me.processingRate
                            });
                            me.requirementsValidationResult = me.generator.accumulatedResults;
                        }
                    } else {
                        // 일반 검증인 경우 (기존 로직)
                        if (model) {
                            me.processingState.isAnalizing = false;
                            me.processingRate = 0;
                            me.updateMessageState(currentMessage.uniqueId, {
                                content: model,
                                processingRate: me.processingRate
                            });
                            me.requirementsValidationResult = model;
                        }
                    }

                    this.currentGeneratedLength = 0;
                    me.updateMessageState(currentMessage.uniqueId, {
                        currentGeneratedLength: me.currentGeneratedLength
                    });

                    me.$emit("update:draft", me.messages);
                }

                if (me.state.generator === "CommandReadModelExtractor") {
                    me._handleCommandReadModelExtractorResult(model.extractedData);
                    return;
                }

                if(me.state.generator === "RequirementsMappingGenerator" || me.state.generator === "RequirementsMappingGeneratorLangGraph"){
                    // 이미 매핑 완료 상태면 중복 콜백 무시
                    if (!me.processingState.isStartMapping) {
                        return;
                    }

                    me.processingRate = Math.round((me.userStoryChunksIndex+1) / me.userStoryChunks.length * 100);
                    me.currentProcessingBoundedContext = me.resultDevideBoundedContext[me.selectedAspect].boundedContexts[me.bcInAspectIndex].alias;

                    // 현재 메시지의 result를 깊은 복사로 가져옴
                    const currentMessage = me.messages.find(msg => msg.type === 'boundedContextResult');
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
                            me.processingState.isStartMapping = false;

                            me.generateAggregateDrafts(me.resultDevideBoundedContext[me.selectedAspect]);
                            return;
                        }
                        me.userStoryChunksIndex = 0;
                        me.bcInAspectIndex++;
                    }
                    me.mappingRequirements();
                }

                if(me.state.generator === "DevideBoundedContextGeneratorLangGraph" || me.state.generator === "DevideBoundedContextGenerator"){
                    me.devisionAspectIndex = 0;
                    me.currentGeneratedLength = 0;
                    me.processingState.isGeneratingBoundedContext = false;
                    
                    // 현재 메시지의 result를 깊은 복사로 가져옴
                    const currentMessage = me.messages.find(msg => msg.type === 'boundedContextResult');
                    const newResult = JSON.parse(JSON.stringify(currentMessage.result || {}));
                    
                    // 새로운 모델을 해당 aspect에 할당
                    if (Object.keys(newResult).length > 0) {
                        // 기존 결과가 있는 경우 새로운 선택지로 추가
                        const baseKey = Object.keys(newResult)[0].split('_')[0];
                        const choiceCount = Object.keys(newResult).length;
                        const newKey = `${baseKey}_choice${choiceCount + 1}`;
                        model.devisionAspect = newKey;
                        newResult[newKey] = model;
                        
                        // 프론트엔드 생성 옵션이 있으면 프론트엔드 생성 진행
                        if(this.bcGenerationOption.isGenerateFrontEnd){
                            newResult[newKey].boundedContexts.push(this.generateFrontEnd());
                        }

                    } else {
                        // 첫 번째 결과인 경우
                        newResult[model.devisionAspect] = model;

                        // 프론트엔드 생성 옵션이 있으면 프론트엔드 생성 진행
                        if(this.bcGenerationOption.isGenerateFrontEnd){
                            newResult[model.devisionAspect].boundedContexts.push(this.generateFrontEnd());
                        }
                    }
                    
                    // 메시지 상태 업데이트
                    me.updateMessageState(currentMessage.uniqueId, {
                        result: newResult,
                        processingRate: me.processingRate,
                        isGeneratingBoundedContext: me.processingState.isGeneratingBoundedContext,
                        currentGeneratedLength: me.currentGeneratedLength
                    });

                    me.resultDevideBoundedContext = JSON.parse(JSON.stringify(newResult));
                    me.$emit("update:draft", me.messages);

                    console.log("output: ", model)
                }
            },

            _handleCommandReadModelExtractorResult(extractedData){
                this.commandReadModelData = extractedData;
                this.isExtractingCommandReadModel = false;

                const siteMapMsg = this.messages.find(msg => msg.type === 'siteMapViewer')
                if(siteMapMsg){
                    this.updateMessageState(siteMapMsg.uniqueId, {
                        commandReadModelData: this.commandReadModelData,
                        processingRate: 100,
                        currentProcessingStep: 'extractingCommandsAndReadModels'
                    });
                }
                
                try {
                    this._mapCommandReadModelDataToBoundedContexts(this.commandReadModelData);
                    const bcMsg = this.messages.find(msg => msg.type === 'boundedContextResult');
                    if (bcMsg) {
                        this.updateMessageState(bcMsg.uniqueId, {
                            result: JSON.parse(JSON.stringify(this.resultDevideBoundedContext))
                        });
                    }

                } catch (e) {
                    console.warn('Failed to map sitemap to bounded contexts:', e);
                }

                this.$emit("update:projectInfo", {commandReadModelData: this.commandReadModelData});
                setTimeout(() => {
                    this.generateSiteMap();
                }, 500);
            },

            _mapCommandReadModelDataToBoundedContexts(commandReadModelData) {
                if(!commandReadModelData || !commandReadModelData.boundedContexts || !Array.isArray(commandReadModelData.boundedContexts))
                    throw new Error('Invalid commandReadModelData');
                
                const bcCommandInfos = {}
                const bcReadModelInfos = {}
                for(const bc of commandReadModelData.boundedContexts){
                    bcCommandInfos[bc.name] = (bc.commands) ? bc.commands.map(command => ({
                        name: command.name,
                        refs: command.refs
                    })) : [];
                    bcReadModelInfos[bc.name] = (bc.readModels) ? bc.readModels.map(readModel => ({
                        name: readModel.name,
                        refs: readModel.refs
                    })) : [];
                }

                const aspect = this.selectedAspect || Object.keys(this.resultDevideBoundedContext)[0];
                if (!aspect || !this.resultDevideBoundedContext[aspect]) return;

                const bcArray = this.resultDevideBoundedContext[aspect].boundedContexts || [];
                for(const bc of bcArray){
                    bc.commandInfos = bcCommandInfos[bc.name] || [];
                    bc.readModelInfos = bcReadModelInfos[bc.name] || [];
                }
            },


            generateUserStory(){
                if(!this.projectInfo.userStory){
                    this.projectInfo['userStory'] = ''
                    this.generateUserStoryDialog = !this.generateUserStoryDialog;
                    this.done = true;
                    this.state.secondMessageIsTyping = false;
                } else {
                    this.done = true;
                }
            },

            async generate(){
                let issuedTimeStamp = Date.now()
                
                const requirementsText = this.projectInfo.userStory || '';
                const shouldUseRecursive = requirementsText && requirementsText.length > 24000;
                
                // 로컬 스토리지에서 LangGraph 사용 여부 확인 (기본값: false)
                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                
                if (useLangGraph) {
                    if (shouldUseRecursive) {
                        this.generator = new RecursiveUserStoryGeneratorLangGraph.default(this);
                        this.state.generator = "RecursiveUserStoryGeneratorLangGraph";
                        this.generatorName = "RecursiveUserStoryGeneratorLangGraph";
                    } else {
                        this.generator = new UserStoryGeneratorLangGraph.default(this);
                        this.state.generator = "UserStoryGeneratorLangGraph";
                        this.generatorName = "UserStoryGeneratorLangGraph";
                    }
                } else {
                    if (shouldUseRecursive) {
                        this.generator = new RecursiveUserStoryGenerator(this);
                        this.state.generator = "RecursiveUserStoryGenerator";
                        this.generatorName = "RecursiveUserStoryGenerator";
                    } else {
                        this.generator = new Generator(this);
                        this.state.generator = "UserStoryGenerator";
                        this.generatorName = "UserStoryGenerator";
                    }
                }
                
                // updateProgress 콜백 정의 (진행률 표시)
                this.updateProgress = (progress) => {
                    console.log('[ESDialoger] updateProgress called:', progress);
                    this.processingRate = progress;
                    this.done = (progress >= 100);
                };
                
                this.input.businessModel = this.cachedModels["BMGenerator"]
                this.input.painpointAnalysis = this.cachedModels["CJMGenerator"]
                this.input.title = this.projectInfo.prompt
                this.input.userStory = this.projectInfo.userStory

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

                this.state.startTemplateGenerate = true
                this.done = false;
                this.projectInfo.userStory = '';
                
                if (useLangGraph) {
                    const generatePromise = shouldUseRecursive 
                        ? this.generator.generateRecursively(requirementsText)
                        : this.generator.generate(requirementsText);
                    
                    generatePromise.then(result => {
                        // 최종 결과를 userStory로 설정
                        if (result) {
                            if (result.textResponse) {
                                this.$emit('update:userStory', result.textResponse, true);
                            } else {
                                const userStoryContent = this.convertUserStoriesToText(result);
                                this.$emit('update:userStory', userStoryContent, true);
                            }
                            this.done = true;
                            this.processingRate = 0;
                        }
                    }).catch(error => {
                        console.error('User story generation failed:', error);
                        this.done = true;
                    });
                } else {
                    // 프론트엔드 생성기 사용 (기존 로직)
                    this.generator.generate();
                }
            },

            // JSON 구조화된 유저스토리를 텍스트로 변환
            convertUserStoriesToText(accumulated) {
                if (!accumulated || typeof accumulated !== 'object') {
                    return '';
                }

                let result = '';

                // Actors 섹션
                if (accumulated.actors && Array.isArray(accumulated.actors) && accumulated.actors.length > 0) {
                    result += '=== ACTORS ===\n';
                    accumulated.actors.forEach(actor => {
                        result += `• ${actor.title}\n`;
                        if (actor.description) result += `  Description: ${actor.description}\n`;
                        if (actor.role) result += `  Role: ${actor.role}\n`;
                        result += '\n';
                    });
                }

                // User Stories 섹션
                if (accumulated.userStories && Array.isArray(accumulated.userStories) && accumulated.userStories.length > 0) {
                    result += '=== USER STORIES ===\n';
                    accumulated.userStories.forEach(story => {
                        result += `• ${story.title}\n`;
                        if (story.as && story.iWant && story.soThat) {
                            result += `  ${story.as}\n`;
                            result += `  ${story.iWant}\n`;
                            result += `  ${story.soThat}\n`;
                        }
                        if (story.description) result += `  Description: ${story.description}\n`;
                        result += '\n';
                    });
                }

                // Business Rules 섹션
                if (accumulated.businessRules && Array.isArray(accumulated.businessRules) && accumulated.businessRules.length > 0) {
                    result += '=== BUSINESS RULES ===\n';
                    accumulated.businessRules.forEach(rule => {
                        result += `• ${rule.title}\n`;
                        if (rule.description) result += `  ${rule.description}\n`;
                        result += '\n';
                    });
                }

                // Bounded Contexts 섹션
                if (accumulated.boundedContexts && Array.isArray(accumulated.boundedContexts) && accumulated.boundedContexts.length > 0) {
                    result += '=== BOUNDED CONTEXTS ===\n';
                    accumulated.boundedContexts.forEach(bc => {
                        result += `• ${bc.name || bc.title}\n`;
                        if (bc.description) result += `  Description: ${bc.description}\n`;
                        if (bc.role) result += `  Role: ${bc.role}\n`;
                        result += '\n';
                    });
                }

                // Title이 있는 경우 추가
                if (accumulated.title) {
                    result = `# ${accumulated.title}\n\n${result}`;
                }

                return result.trim();
            },

            stop(){
                this.isStopped = true;

                this.generator.stop();
                this.state.startTemplateGenerate = true
                this.done = true;

                let messageId = null
                if(this.state.generator === "DevideBoundedContextGenerator"){
                    messageId = this.messages.find(msg => msg.type === "boundedContextResult").uniqueId;
                    this.resultDevideBoundedContext = {};
                    this.currentGeneratedLength = 0;
                    this.updateMessageState(messageId, {
                        currentGeneratedLength: this.currentGeneratedLength
                    });
                }

                if(this.state.generator === "RequirementsValidationGenerator" || 
                    this.state.generator === "RecursiveRequirementsValidationGenerator"){
                    messageId = this.messages.find(msg => msg.type === "processAnalysis").uniqueId;
                    this.messages.splice(this.messages.findIndex(msg => msg.type === "processAnalysis"), 1);
                    this.requirementsValidationResult = null;
                }

                if(this.state.generator === "RecursiveUserStoryGenerator"){
                    // recursive generator 중단 처리
                    if (this.generator && this.generator.resolveCurrentProcess) {
                        this.generator.resolveCurrentProcess = null;
                    }
                }

                if(this.state.generator === "RequirementsMappingGenerator"){
                    messageId = this.messages.find(msg => msg.type === "boundedContextResult").uniqueId;
                    this.bcInAspectIndex = 0;
                    this.userStoryChunksIndex = 0;
                    this.processingRate = 0;
                    this.currentProcessingBoundedContext = "";
                }

                this.processingState.isAnalizing = false;
                this.processingState.isGeneratingBoundedContext = false;
                this.processingState.isSummarizeStarted = false;
                this.processingState.isStartMapping = false;

            },

            reGenerate(){
                this.generateDevideBoundedContext();
            },

            reGenerateWithFeedback(obj){
                const targetMessage = this.messages.find(msg => msg.uniqueId === obj.messageId);
                if (!targetMessage) return;

                // 피드백 기반 재생성 시작
                this.processingState.isGeneratingBoundedContext = true;
                this.processingState.isStartMapping = false;
                this.processingRate = 0;
                this.currentProcessingBoundedContext = '';



                // 기존 메시지의 상태 업데이트
                this.updateMessageState(obj.messageId, {
                    processingRate: this.processingRate,
                    currentProcessingBoundedContext: this.currentProcessingBoundedContext
                });

                // 생성기 설정 및 실행
                this.generator = new DevideBoundedContextGenerator(this);
                this.state.generator = "DevideBoundedContextGenerator";
                this.generatorName = "DevideBoundedContextGenerator";
                
                this.input.devisionAspect = targetMessage.selectedAspect;
                this.input.previousAspectModel = targetMessage.result[targetMessage.selectedAspect];
                this.input['requirements'] = {
                    userStory: this.projectInfo.usedUserStory,
                    summarizedResult: this.summarizedResult || {},
                    analysisResult: this.requirementsValidationResult.analysisResult,
                    pbcInfo: this.pbcLists.map(pbc => ({
                        name: pbc.name,
                        description: pbc.description
                    }))
                };

                this.input['generateOption'] = this.bcGenerationOption;
                this.input.feedback = obj.feedback;
                this.generator.generate();
            },

            setGenerateOption(option, isNewChoice) {
                this.selectedAspect = option.selectedAspects.join('+');
                this.bcGenerationOption = option;
                let optionMessage = this.messages.find(msg => msg.type === 'bcGenerationOption');
                if(optionMessage){
                    this.updateMessageState(optionMessage.uniqueId, {
                        generateOption: option
                    });
                }

                if(!this.alertGenerateWarning("bcGenerationOption")){
                    return;
                }

                // if (isNewChoice && this.messages.length > 0) {
                //     // 마지막 boundedContextResult 메시지 찾기
                //     const lastBCResultIndex = [...this.messages].reverse().findIndex(msg => 
                //         msg.type === "boundedContextResult"
                //     );
                    
                //     if (lastBCResultIndex !== -1) {
                //         const messageIndex = this.messages.length - 1 - lastBCResultIndex;
                //         const targetMessage = this.messages[messageIndex];
                        
                //         // 기존 메시지를 사용하여 새로운 선택지 생성
                //         this.processingState.isGeneratingBoundedContext = true;

                //         this.generator = new DevideBoundedContextGenerator(this);
                //         this.state.generator = "DevideBoundedContextGenerator";
                //         this.generatorName = "DevideBoundedContextGenerator";

                //         this.devisionAspectIndex = 0;
                //         this.input['devisionAspect'] = this.selectedAspect;
                //         this.input['generateOption'] = this.bcGenerationOption;
                //         this.input['requirements'] = {
                //             userStory: this.projectInfo.userStory,
                //             summarizedResult: this.summarizedResult,
                //             analysisResult: this.requirementsValidationResult.analysisResult,
                //             pbcInfo: this.pbcLists.map(pbc => ({
                //                 name: pbc.name,
                //                 description: pbc.description
                //             }))
                //         };

                //         this.generator.generate();
                //         return;
                //     }
                // }

                // 첫 번째 생성이거나 기존 메시지를 찾지 못한 경우 새 메시지 생성
                this.generateDevideBoundedContext();
            },

            async summarizeRequirements() {
                // 로컬 스토리지에서 LangGraph 사용 여부 확인 (기본값: false)
                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                
                if (useLangGraph) {
                    this.generator = new RecursiveRequirementsSummarizerLangGraph(this);
                    this.state.generator = "RecursiveRequirementsSummarizerLangGraph";
                    this.generatorName = "RecursiveRequirementsSummarizerLangGraph";
                } else {
                    this.generator = new RecursiveRequirementsSummarizer(this);
                    this.state.generator = "RecursiveRequirementsSummarizer";
                    this.generatorName = "RecursiveRequirementsSummarizer";
                }

                this.processingState.isSummarizeStarted = true;

                try {
                    const summarizedResult = await this.generator.summarizeRecursively(this.projectInfo.usedUserStory);
                    
                    // 요약 결과 저장
                    this.userStoryChunks = this.generator.makeUserStoryChunks(this.projectInfo.usedUserStory + "\n" + this.projectInfo.usedInputDDL);
                    this.userStoryChunksIndex = 0;
                    
                    this.summarizedResult = summarizedResult;

                    this.$emit("update:projectInfo", {
                        userStoryChunks: this.userStoryChunks,
                        summarizedResult: this.summarizedResult
                    })
                    console.log("최종 요약 결과: ", this.summarizedResult);

                    this.processingState.isSummarizeStarted = false;

                    // BC 생성이 대기 중이었다면 진행
                    if (this.pendingBCGeneration) {
                        this.pendingBCGeneration = false;
                        this.generateDevideBoundedContext();
                    }
                } catch (error) {
                    console.error('Summarization failed:', error);
                    this.processingState.isSummarizeStarted = false;
                }
            },

            mappingRequirements(){
                // 요약 > 생성된 bc의 requirements 매핑
                this.processingState.isStartMapping = true;

                // LangGraph 사용 여부 확인
                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';

                if (useLangGraph) {
                    this.generator = new RequirementsMappingGeneratorLangGraph(this);
                    this.state.generator = "RequirementsMappingGeneratorLangGraph";
                    this.generatorName = "RequirementsMappingGeneratorLangGraph";
                } else {
                    this.generator = new RequirementsMappingGenerator(this);
                    this.state.generator = "RequirementsMappingGenerator";
                    this.generatorName = "RequirementsMappingGenerator";
                }

                // 요약 결과가 없어도 원본 매핑 진행을 위해 원본 요구사항을 청크로 넣어줌
                if(this.userStoryChunks.length == 0){
                    if(this.projectInfo.usedUserStory) {
                        this.userStoryChunks.push({
                            text: this.projectInfo.usedUserStory,
                            startLine: 1
                        });
                    }

                    if(this.projectInfo.usedInputDDL) {
                        this.userStoryChunks.push({
                            text: this.projectInfo.usedInputDDL,
                            startLine: this.projectInfo.usedUserStory.split("\n").length + 1
                        });
                    }
                }

                const isAnalysisResultExist = this.userStoryChunks.some(chunk => chunk.type === "analysisResult");
                if(this.requirementsValidationResult && this.requirementsValidationResult.analysisResult && this.userStoryChunksIndex == 0 && !isAnalysisResultExist){
                    this.userStoryChunks.push({
                        events: this.requirementsValidationResult && this.requirementsValidationResult.analysisResult ? this.requirementsValidationResult.analysisResult.events : [],
                        type: "analysisResult"
                    })
                }

                this.input['boundedContext'] = this.resultDevideBoundedContext[this.selectedAspect].boundedContexts[this.bcInAspectIndex];
                this.input['requirementChunk'] = this.userStoryChunks[this.userStoryChunksIndex];
                this.generator.generate();
            },

            async generateDevideBoundedContext(){
                if(!this.alertGenerateWarning("DevideBoundedContextGenerator")){
                    return;
                }

                // 요구사항이 변경되었으므로 추출된 Command/ReadModel 데이터 초기화
                this.commandReadModelData = null;

                // 현재 요약본이 너무 길면 먼저 요약 진행
                if (this.projectInfo.usedUserStory.length + this.projectInfo.usedInputDDL.length > 25000 && !this.summarizedResult.summary) {
                    this.pendingBCGeneration = true;
                    this.summarizeRequirements();
                    return;
                }
                
                // 로컬 스토리지에서 LangGraph 사용 여부 확인 (기본값: false)
                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                
                if (useLangGraph) {
                    this.generator = new DevideBoundedContextGeneratorLangGraph(this);
                    this.state.generator = "DevideBoundedContextGeneratorLangGraph";
                    this.generatorName = "DevideBoundedContextGeneratorLangGraph";
                } else {
                    this.generator = new DevideBoundedContextGenerator(this);
                    this.state.generator = "DevideBoundedContextGenerator";
                    this.generatorName = "DevideBoundedContextGenerator";
                }
                
                this.devisionAspectIndex = 0;
                this.input['devisionAspect'] = this.selectedAspect;
                this.messages.push(this.generateMessage("boundedContextResult", {}))
                
                this.input['generateOption'] = this.bcGenerationOption;
                
                this.input['requirements'] = {
                    userStory: this.projectInfo.usedUserStory,
                    summarizedResult: this.summarizedResult || {},
                    analysisResult: this.requirementsValidationResult && this.requirementsValidationResult.analysisResult ? this.requirementsValidationResult.analysisResult : { actors: [], events: [] },
                    pbcInfo: this.pbcLists.map(pbc => ({
                        name: pbc.name,
                        description: pbc.description
                    }))
                };

                this.processingState.isGeneratingBoundedContext = true;
                this.currentGeneratedLength = 0;

                try {
                    console.log('[ESDialoger] BC 생성 시작...');
                    await this.generator.generate();
                    // onGenerationFinished에서 처리됨
                } catch (error) {
                    console.error('[ESDialoger] BC 생성 실패:', error);
                    this.processingState.isGeneratingBoundedContext = false;
                }
            },

            generateFrontEnd(){
                let frontEnd = {
                    'aggregates':[],
                    'alias':"프론트 엔드",
                    'complexity':"0.0",
                    'differentiation':"0.0",
                    'events':[],
                    'implementationStrategy':"Transaction Script",
                    'importance':"Generic Domain",
                    'name':"ui",
                    'requirements':[],
                    'role':"요구사항에서 화면 관련 내용을 수집하기 위한 컨텍스트"
                }

                return frontEnd;
            },

            uuid: function () {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            },


            async generateAggregateDrafts(versionInfo){
                if(!versionInfo) return

                if(!this.alertGenerateWarning("CreateAggregateActionsByFunctions")){
                    return;
                }

                if(versionInfo.data && versionInfo.version){
                    this.boundedContextVersion = versionInfo
                }

                let isRequirementsMapping = !this.resultDevideBoundedContext[this.boundedContextVersion.aspect].boundedContexts.every(bc => 
                    !bc.requirements || bc.requirements.length === 0
                );

                let selectedStructureOption = this.resultDevideBoundedContext[this.boundedContextVersion.aspect]
                
                if(this.isTerminalEnabled) {
                    if(selectedStructureOption){
                        this.collectedMockDatas.aggregateDraftScenarios.selectedStructureOption = structuredClone(selectedStructureOption)
                    }
                    if(this.resultDevideBoundedContext){
                        this.collectedMockDatas.aggregateDraftScenarios.resultDevideBoundedContext = structuredClone(this.resultDevideBoundedContext)
                    }
                    if(this.boundedContextVersion){
                        this.collectedMockDatas.aggregateDraftScenarios.boundedContextVersion = structuredClone(this.boundedContextVersion)
                    }
                }

                // 요약 결과가 없어도, 상세한 매핑을 위해 원본 매핑 진행
                if(!isRequirementsMapping){
                    this.mappingRequirements();
                    return;
                }

                console.log("[*] 선택된 BC 구성 옵션을 기반으로 생성이 시도됨", {selectedStructureOption})

                this.workingMessages.AggregateDraftDialogDto = MessageFactory.createAggregateDraftDialogDtoMessage()
                this.workingMessages.AggregateDraftDialogDto.boundedContextVersion = this.boundedContextVersion.version
                this.messages.push(this.workingMessages.AggregateDraftDialogDto)

                // PBC 제외하고 생성
                if(selectedStructureOption.boundedContexts.some(bc => bc.implementationStrategy.includes("PBC"))){
                    this.pbcResults = this.pbcResults.concat(selectedStructureOption.boundedContexts.filter(bc => bc.implementationStrategy.includes("PBC")))
                    selectedStructureOption.boundedContexts = selectedStructureOption.boundedContexts.filter(bc => {
                        return !(bc.implementationStrategy.includes("PBC") && bc.importance === "Generic Domain");
                    });
                }

                // frontEnd 제외하고 생성
                if(selectedStructureOption.boundedContexts.some(bc => bc.name === "ui")){
                    this.frontEndResults = this.frontEndResults.concat(selectedStructureOption.boundedContexts.filter(bc => bc.name === "ui"))
                    selectedStructureOption.boundedContexts = selectedStructureOption.boundedContexts.filter(bc => bc.name !== "ui");
                }


                await this.generators.DraftGeneratorByFunctions.buildInitialInputs(selectedStructureOption)
                this.generators.DraftGeneratorByFunctions.initInputs()
                this.generators.DraftGeneratorByFunctions.generateIfInputsExist()
            },

            
            generateFromAggregateDrafts(draftOptions){
                try {

                    if(this.isServerProject) this.state.associatedProject = this.modelIds.projectId
                    if(this.isTerminalEnabled) this._makeCollectedMockDatas(draftOptions)

                    draftOptions = ESDialogerTraceUtil.extractTraceInfoFromDraftOptions(draftOptions, {
                        userStory: this.projectInfo.usedUserStory,
                        ddl: this.projectInfo.usedInputDDL,
                    })

                    
                    if(this.pbcResults.length > 0){
                        this.pbcResults.forEach(pbc => {
                            if(!draftOptions[`PBC-${pbc.name}`]){
                                this.pbcLists.forEach(pbcList => {
                                    if(pbcList.name === pbc.implementationStrategy.replace("PBC:", "").trim()){
                                        pbc['info'] = pbcList
                                    }
                                })
                                draftOptions[`PBC-${pbc.name}`] = pbc
                            }
                        })
                    }

                    if(this.frontEndResults.length > 0){
                        this.frontEndResults.forEach(frontEnd => {
                            draftOptions[`frontend`] = frontEnd
                        })
                    }

                    // Associated Project ID 저장
                    localStorage.setItem("associatedProjectId", this.projectInfo.projectId)
                    
                    this.state = {
                        ...this.state,
                        userStory: this.projectInfo.usedUserStory,
                        draftOptions: draftOptions,
                        generator: "CreateAggregateActionsByFunctions"
                    }
                    console.log("[*] 생성 준비를 위한 입력값 구축 완료", {state: this.state})

                    LocalStorageCleanUtil.clean()

                    if(!this.value) {
                        this.$set(this, 'value', {
                            eventStorming: {
                                modelList: []
                            }
                        });
                    }

                    if(!this.value.modelList) {
                        this.$set(this.value, 'modelList', []);
                    }

                    this.$emit("input", this.value);
                    this.$emit("change", 'eventStorming');

                    // GeneratorUI.createGenerator() 함수에서 해당 값을 받아서 자동 처리 수행
                    localStorage["gen-state"] = JSON.stringify(this.state);;
                    window.open(`/#/${this.userInfo.providerUid}/storming/${this.modelIds.ESDefinitionId}`, "_blank")

                    // AI 생성된 모델을 Project에 저장하기 위해 세팅
                    this.$emit("update:modelList", this.modelIds.ESDefinitionId)
                    this.isCreatedModel = true;

                }
                catch(e) {
                    console.error("[*] 생성 준비를 위한 입력값 구축과정에서 에러 발생", {error: e, state: this.state})
                    alert(`[!] Error occured while building inputs: ${e.message}`)
                }
            },

            _makeCollectedMockDatas(draftOptions){
                this.collectedMockDatas.aggregateDraftScenarios.draftOptions = structuredClone(draftOptions)
                this.collectedMockDatas.aggregateDraftScenarios.userStory = this.projectInfo.userStory
                this.collectedMockDatas.aggregateDraftScenarios.state = structuredClone(this.state)
                this.collectedMockDatas.aggregateDraftScenarios.messages = structuredClone(
                    this.messages.map(message => ({
                        ...message,
                        actions: undefined
                    }))
                )
                this.collectedMockDatas.aggregateDraftScenarios.frontEndResults = structuredClone(this.frontEndResults)
                this.collectedMockDatas.aggregateDraftScenarios.pbcResults = structuredClone(this.pbcResults)
                this.collectedMockDatas.aggregateDraftScenarios.pbcLists = structuredClone(this.pbcLists)
                this.collectedMockDatas.aggregateDraftScenarios.projectInfo = structuredClone(this.projectInfo)
                this.collectedMockDatas.aggregateDraftScenarios.requirementsValidationResult = structuredClone(this.requirementsValidationResult)
                this.collectedMockDatas.aggregateDraftScenarios.commandReadModelData = structuredClone(this.commandReadModelData)
                this.collectedMockDatas.aggregateDraftScenarios.siteMap = structuredClone(this.siteMap)
                this.collectedMockDatas.aggregateDraftScenarios.selectedAspect = this.selectedAspect
                console.log("[#] 시나리오별 테스트를 위한 Mock 데이터 구축 완료", {collectedMockDatas: this.collectedMockDatas.aggregateDraftScenarios})
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
                                directMessage: "",
                                progress: 0
                            }

                            this.generators.DraftGeneratorByFunctions.inputs = structuredClone(
                                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialInputs
                            )
                            this.generators.DraftGeneratorByFunctions.accumulatedDrafts = structuredClone(
                                this.workingMessages.AggregateDraftDialogDto.retryInputs.initialAccumulatedDrafts
                            )

                            this.generators.DraftGeneratorByFunctions.generateIfInputsExist()
                        }
                }
                else {
                    this.workingMessages.AggregateDraftDialogDto.actions.retry = () => {
                        alert("[!] Currently retry is not supported")
                    }
                }

                this.messages.push(this.workingMessages.AggregateDraftDialogDto)
                this.generators.DraftGeneratorByFunctions.generateWithFeedback(boundedContextInfo, [feedback], draftOptions)
            },

            generateMessage(type, result, feedback) {
                if(type === "boundedContextResult"){
                    return {
                        uniqueId: this.uuid(),
                        type: type,
                        result: result || {},
                        isStartMapping: this.processingState.isStartMapping,
                        isGeneratingBoundedContext: this.processingState.isGeneratingBoundedContext,
                        isSummarizeStarted: this.processingState.isSummarizeStarted,
                        isAnalizing: this.processingState.isAnalizing,
                        processingRate: this.processingRate,
                        currentProcessingBoundedContext: this.currentProcessingBoundedContext,
                        selectedAspect: this.selectedAspect,
                        summarizedResult: this.summarizedResult,
                        pbcLists: this.pbcLists,
                        currentGeneratedLength: this.currentGeneratedLength,
                        userStory: this.projectInfo.usedUserStory,
                        timestamp: new Date()
                    };
                } else if(type === "userMessage"){
                    return {
                        uniqueId: this.uuid(),
                        type: type,
                        message: feedback,
                        timestamp: new Date()
                    };
                } else if(type === "processAnalysis") { 
                    return {
                        uniqueId: this.uuid(),
                        type: type,
                        isAnalizing: this.processingState.isAnalizing,
                        isSummarizeStarted: this.processingState.isSummarizeStarted,
                        isGeneratingBoundedContext: this.processingState.isGeneratingBoundedContext,
                        isStartMapping: this.processingState.isStartMapping,
                        processingRate: this.processingRate,
                        content: result,
                        currentGeneratedLength: this.currentGeneratedLength,
                        timestamp: new Date()
                    };
                } else if(type === "bcGenerationOption") {
                    return {
                        uniqueId: this.uuid(),
                        type: type,
                        isSummarizeStarted: this.processingState.isSummarizeStarted,
                        isGeneratingBoundedContext: this.processingState.isGeneratingBoundedContext,
                        isStartMapping: this.processingState.isStartMapping,
                        isAnalizing: this.processingState.isAnalizing,
                        generateOption: {},
                        recommendedBoundedContextsNumber: this.requirementsValidationResult && this.requirementsValidationResult.analysisResult ? this.requirementsValidationResult.analysisResult.recommendedBoundedContextsNumber : 2,
                        reasonOfRecommendedBoundedContextsNumber: this.requirementsValidationResult && this.requirementsValidationResult.analysisResult ? this.requirementsValidationResult.analysisResult.reasonOfRecommendedBoundedContextsNumber : "",
                        timestamp: new Date()
                    };
                } else if(type === "siteMapViewer") {
                    return {
                        uniqueId: this.uuid(),
                        type: type,
                        siteMap: this.siteMap,
                        userStory: (this.summarizedResult && this.summarizedResult.summary) ? this.summarizedResult.summary : this.projectInfo.usedUserStory,
                        resultDevideBoundedContext: this.resultDevideBoundedContext[this.selectedAspect],
                        isGenerating: true,
                        processingRate: 0,
                        currentChunk: 0,
                        totalChunks: 0,
                        currentGeneratedLength: 0,
                        commandReadModelData: this.commandReadModelData,
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

            validateRequirements() {
                if(!this.projectInfo || !this.projectInfo.userStory){
                    alert("Can not found User Story. You need to input User Story to proceed.");
                    return;
                }

                // 요구사항 검증 이후에 요구사항 입력창을 유저가 수정한 경우, 이후 로직이 망가질 수 있기 때문에 별도로 저장 후 사용
                this.projectInfo.usedUserStory = this.projectInfo.userStory || ''
                this.projectInfo.usedInputDDL = this.projectInfo.inputDDL || ''
                this.$emit("update:projectInfo", {
                    usedUserStory: this.projectInfo.usedUserStory,
                    usedInputDDL: this.projectInfo.usedInputDDL
                })
                
                const usedUserStory = this.projectInfo.usedUserStory;
                this.$emit("update:userStory", usedUserStory, true);

                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';

                if(usedUserStory.length > 25000){
                    if(!this.alertGenerateWarning("RecursiveRequirementsValidationGenerator")){
                        return;
                    }
                }else{
                    if(!this.alertGenerateWarning("RequirementsValidationGenerator")){
                        return;
                    }
                }

                this.processingState.isAnalizing = true;
                
                if (usedUserStory.length > 25000) {
                    if (useLangGraph) {
                        this.generator = new RecursiveRequirementsValidationGeneratorLangGraph(this);
                        this.state.generator = "RecursiveRequirementsValidationGeneratorLangGraph";
                        this.generatorName = "RecursiveRequirementsValidationGeneratorLangGraph";

                        this.messages.push(this.generateMessage("processAnalysis", {}));
                        this.generator.validateRecursively(usedUserStory);
                    } else {
                        this.generator = new RecursiveRequirementsValidationGenerator(this);
                        this.state.generator = "RecursiveRequirementsValidationGenerator";
                        this.generatorName = "RecursiveRequirementsValidationGenerator";

                        this.messages.push(this.generateMessage("processAnalysis", {}));
                        this.generator.validateRecursively(usedUserStory);
                    }
                } else {
                    if (useLangGraph) {
                        this.generator = new RequirementsValidationGeneratorLangGraph(this);
                        this.state.generator = "RequirementsValidationGeneratorLangGraph";
                        this.generatorName = "RequirementsValidationGeneratorLangGraph";

                        this.input['requirements'] = {
                            userStory: usedUserStory,
                        };

                        this.messages.push(this.generateMessage("processAnalysis", {}));
                        this.generator.generate();
                    } else {
                        this.generator = new RequirementsValidationGenerator(this);
                        this.state.generator = "RequirementsValidationGenerator";
                        this.generatorName = "RequirementsValidationGenerator";

                        this.input['requirements'] = {
                            userStory: usedUserStory,
                        };

                        this.messages.push(this.generateMessage("processAnalysis", {}));
                        this.generator.generate();
                    }
                }
            },

            onShowBCGenerationOption(){
                if(!this.projectInfo || !this.projectInfo.userStory){
                    alert("Can not found User Story. You need to input User Story to proceed.");
                    return;
                }

                // 요구사항 검증 이후에 요구사항 입력창을 유저가 수정한 경우, 이후 로직이 망가질 수 있기 때문에 별도로 저장 후 사용
                this.projectInfo.usedUserStory = this.projectInfo.userStory || ''
                this.projectInfo.usedInputDDL = this.projectInfo.inputDDL || ''
                this.$emit("update:projectInfo", {
                    usedUserStory: this.projectInfo.usedUserStory,
                    usedInputDDL: this.projectInfo.usedInputDDL
                })
                
                const usedUserStory = this.projectInfo.usedUserStory;
                this.$emit("update:userStory", usedUserStory, true);
                
                if(this.messages.every(message => message.type != "bcGenerationOption")){
                    this.messages.push(this.generateMessage("bcGenerationOption", {}))
                }
            },

            updateSelectedAspect(newTabIndex){
                this.selectedAspect = this.resultDevideBoundedContext[newTabIndex].devisionAspect
                this.updateMessageState(this.messages.find(message => message.type === 'boundedContextResult').uniqueId, {
                    selectedAspect: this.selectedAspect
                });
            },

            getDisabledGenerateBtn(){
                return this.processingState.isSummarizeStarted || this.processingState.isGeneratingBoundedContext || this.processingState.isStartMapping || this.processingState.isAnalizing || this.projectInfo.userStory == null
            },

            getDisabledValidateBtn(){
                return this.processingState.isSummarizeStarted || this.processingState.isGeneratingBoundedContext || this.processingState.isStartMapping || this.processingState.isAnalizing || !this.projectInfo.userStory
            },

            async loadAllRepoList(){
                try {
                    return false;
                    const cachedData = localStorage.getItem('repoListCache');
                    const cacheTimestamp = localStorage.getItem('repoListCacheTimestamp');
                    const CACHE_DURATION = 1000 * 60 * 60;

                    if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < CACHE_DURATION) {
                        console.log('Using cached repository list');
                        this.allRepoList = JSON.parse(cachedData);
                        if (this.allRepoList.length > 0) {
                            this.loadPBCInfo();
                            return;
                        }
                    }

                    var count = 1;
                    this.allRepoList = [];
                    // githubHeaders가 없으면 빈 객체 사용 (public repo 접근 가능)
                    const headers = this.githubHeaders || {};
                    while(count != 'stop'){
                        var repoList = await axios.get(`https://api.github.com/orgs/msa-ez/repos?sort=updated&page=${count}&per_page=100`, { headers: headers})
                        if(repoList && repoList.data && repoList.data.length > 0) {
                            this.allRepoList = this.allRepoList.concat(repoList.data);
                            count++;
                        } else {
                            count = 'stop';
                        }
                    }

                    localStorage.setItem('repoListCache', JSON.stringify(this.allRepoList));
                    localStorage.setItem('repoListCacheTimestamp', Date.now().toString());

                    if(this.allRepoList.length > 0) {
                        this.loadPBCInfo();
                    }
                } catch (error) {
                    console.error('Failed to load repo list:', error);
                    const cachedData = localStorage.getItem('repoListCache');
                    if (cachedData) {
                        this.allRepoList = JSON.parse(cachedData);
                        this.loadPBCInfo();
                    }
                }
            },

            async loadPBCInfo(){
                return false;
                var me = this;
                me.pbcLists = [];

                const cachedPBCData = localStorage.getItem('pbcListCache');
                const cachePBCTimestamp = localStorage.getItem('pbcListCacheTimestamp');
                const CACHE_DURATION = 1000 * 60 * 60;

                if (cachedPBCData && cachePBCTimestamp && (Date.now() - parseInt(cachePBCTimestamp)) < CACHE_DURATION) {
                    me.pbcLists = JSON.parse(cachedPBCData);
                    me.isPBCLoding = false;
                    return;
                }

                // githubHeaders가 없으면 빈 객체 사용 (public repo 접근 가능)
                const headers = me.githubHeaders || {};
                
                for (let idx = 0; idx < me.allRepoList.length; idx++) {
                    const pbcInfo = me.allRepoList[idx];
                    if (pbcInfo.name.includes("pbc-") && !pbcInfo.name.includes("_pbc")) {
                        try {
                            var info = await axios.get(`https://api.github.com/repos/msa-ez/${pbcInfo.name}/contents/.template/metadata.yml`, { headers: headers });
                            var mainTrees = await axios.get(`https://api.github.com/repos/msa-ez/${pbcInfo.name}/git/trees/main`, { headers: headers })
                            if (info && info.data.content) {
                                const modelTree = mainTrees.data.tree.find(tree => tree.path === 'model.json');
                                const openApiTree = mainTrees.data.tree.find(tree => tree.path === 'openapi.yaml');
                                const instruction = await axios.get(`https://api.github.com/repos/msa-ez/${pbcInfo.name}/contents/.template/instruction.md`, { headers: headers });
                            
                                let obj = YAML.load(decodeURIComponent(escape(atob(info.data.content))));

                                obj.instruction = instruction ? decodeURIComponent(escape(atob(instruction.data.content))) : null;
                                obj.id = idx;
                                obj.pbcPath = modelTree 
                                    ? `https://github.com/msa-ez/${pbcInfo.name}/blob/main/model.json` 
                                    : (openApiTree ? `https://github.com/msa-ez/${pbcInfo.name}/blob/main/openapi.yaml` : null);
                                if(!obj.pbcPath){
                                    obj.reason = 'Model 및 OpenAPI 정보가 없습니다'
                                }
                                me.pbcLists.push(obj);
                            }
                        } catch (e) {
                            console.error(`Error processing ${pbcInfo.name}:`, e);
                        }
                    }
                }

                if (me.pbcLists.length > 0) {
                    localStorage.setItem('pbcListCache', JSON.stringify(me.pbcLists));
                    localStorage.setItem('pbcListCacheTimestamp', Date.now().toString());
                }

                me.isPBCLoding = false;
            },

            updateSelectedOptionItem(selectedOptionItem, messageUniqueId) {
                // messageUniqueId가 있으면 해당 메시지 찾기, 없으면 기존 로직 (하위 호환성)
                let targetMessage = null;
                
                if (messageUniqueId) {
                    // uniqueId로 정확한 메시지 찾기 (원본 또는 변환 메시지 구분)
                    targetMessage = this.messages.find(msg => msg.uniqueId === messageUniqueId);
                } else {
                    // 기존 로직: aggregateDraftDialogDto만 찾기
                    targetMessage = this.messages.find(message => message.type === 'aggregateDraftDialogDto');
                }
                
                if (targetMessage) {
                    // Deep copy로 Vue 반응성 참조 공유 방지
                    this.$set(targetMessage, 'selectedOptionItem', JSON.parse(JSON.stringify(selectedOptionItem)));
                    this.$emit("update:draft", this.messages);
                } else {
                    console.warn('[ESDialoger] ⚠️ targetMessage를 찾을 수 없음!');
                }
            },
            
            updateDraftOptions(draftOptions, messageUniqueId) {
                // messageUniqueId가 있으면 해당 메시지 찾기
                let targetMessage = null;
                
                if (messageUniqueId) {
                    targetMessage = this.messages.find(msg => msg.uniqueId === messageUniqueId);
                } else {
                    // 기존 로직: aggregateDraftDialogDto만 찾기
                    targetMessage = this.messages.find(message => message.type === 'aggregateDraftDialogDto');
                }
                
                if (targetMessage) {
                    // Deep copy로 Vue 반응성 참조 공유 방지
                    this.$set(targetMessage, 'draftOptions', JSON.parse(JSON.stringify(draftOptions)));
                    this.$emit("update:draft", this.messages);
                } else {
                    console.warn('[ESDialoger] ⚠️ updateDraftOptions: targetMessage를 찾을 수 없음!');
                }
            },
            
            transformWithStandards(boundedContextInfo, draftOptions, messageUniqueId) {
                // 기존 표준 변환 메시지 제거 (표준 변환은 가장 마지막 단계)
                if(!this.alertGenerateWarning("StandardTransformation")){
                    return;
                }
                
                // Aggregate 초안이 있는 상태에서 표준 변환 실행
                const aggMessage = this.messages.find(msg => msg.uniqueId === messageUniqueId);
                if (!aggMessage || !aggMessage.draftOptions) {
                    console.error('[ESDialoger] Aggregate draft not found for transformation');
                    return;
                }

                // 변환 요청 시작 시점의 타임스탬프 생성 (디렉토리명으로 사용)
                const transformationSessionId = `transformation-${Date.now()}`;

                // 전체 draftOptions를 BC별로 순차 처리
                const allDraftOptions = aggMessage.draftOptions || [];
                const bcQueue = [];
                
                // 각 BC별로 변환 작업 큐 생성
                const selectedOptionItemSnapshot = JSON.parse(JSON.stringify(aggMessage.selectedOptionItem || {}));
                
                allDraftOptions.forEach(function(bcDraftOption) {
                    if (!bcDraftOption || !bcDraftOption.boundedContext) {
                        return;
                    }
                    
                    const boundedContext = bcDraftOption.boundedContext;
                    const allOptions = bcDraftOption.options || [];
                    
                    let optionsToTransform = [];
                    if (selectedOptionItemSnapshot[boundedContext]) {
                        optionsToTransform = [JSON.parse(JSON.stringify(selectedOptionItemSnapshot[boundedContext]))];
                    } else if (allOptions.length > 0) {
                        const defaultIndex = bcDraftOption.defaultOptionIndex != null 
                            ? bcDraftOption.defaultOptionIndex 
                            : 0;
                        if (allOptions[defaultIndex]) {
                            optionsToTransform = [JSON.parse(JSON.stringify(allOptions[defaultIndex]))];
                        }
                    }
                    
                    if (optionsToTransform.length === 0) {
                        return;
                    }

                    
                    // Bounded Context 정보 찾기 (여러 소스에서 시도)
                    let boundedContextData = null;
                    
                    // 1. generators.inputs에서 찾기
                    if (this.generators && 
                        this.generators.DraftGeneratorByFunctions && 
                        this.generators.DraftGeneratorByFunctions.inputs) {
                        const foundInput = this.generators.DraftGeneratorByFunctions.inputs.find(
                            function(input) {
                                return input && 
                                       input.boundedContext && 
                                       input.boundedContext.name === boundedContext;
                            }
                        );
                        if (foundInput && foundInput.boundedContext) {
                            boundedContextData = foundInput.boundedContext;
                        }
                    }
                    
                    // 2. initialInputs에서 찾기
                    if (!boundedContextData && 
                        this.generators && 
                        this.generators.DraftGeneratorByFunctions && 
                        this.generators.DraftGeneratorByFunctions.initialInputs) {
                        const foundInput = this.generators.DraftGeneratorByFunctions.initialInputs.find(
                            function(input) {
                                return input && 
                                       input.boundedContext && 
                                       input.boundedContext.name === boundedContext;
                            }
                        );
                        if (foundInput && foundInput.boundedContext) {
                            boundedContextData = foundInput.boundedContext;
                        }
                    }
                    
                    // 3. draftOptions에서 직접 추출 (최소한의 정보)
                    if (!boundedContextData) {
                        boundedContextData = {
                            name: boundedContext,
                            alias: bcDraftOption.boundedContextAlias || boundedContext,
                            description: bcDraftOption.description || ''
                        };
                    }
                    
                    bcQueue.push({
                        bcDraftOption: bcDraftOption,
                        boundedContext: boundedContext,
                        optionsToTransform: optionsToTransform,
                        boundedContextData: boundedContextData
                    });
                }.bind(this));
                
                if (bcQueue.length === 0) {
                    console.error('[ESDialoger] No bounded contexts found for transformation');
                    return;
                }
                
                // 변환 중 상태 표시
                if (aggMessage.draftUIInfos) {
                    this.$set(aggMessage.draftUIInfos, 'directMessage', `표준 변환 중... (0/${bcQueue.length})`);
                    this.$set(aggMessage.draftUIInfos, 'progress', 0);
                    this.$set(aggMessage, 'isTransforming', true);
                }
                
                // BC별로 순차 처리
                let processedCount = 0;
                let isProcessing = false; // 중복 처리 방지 플래그
                const transformedResults = []; // 변환된 결과를 모아둘 배열
                const self = this; // this 컨텍스트 보존
                
                // 빈 표준 변환 메시지를 미리 생성하여 추가 (업데이트용)
                // Vue 반응성 참조 공유 방지를 위해 모든 객체를 deep copy
                const transformedMessageId = self.uuid();  // 고유 ID 생성
                const transformedMessage = {
                    uniqueId: transformedMessageId,
                    type: 'standardTransformedDraftDialogDto',
                    isShow: true,
                    isGeneratorButtonEnabled: false,
                    // boundedContextVersion도 deep copy (객체일 경우 참조 공유 방지)
                    boundedContextVersion: aggMessage.boundedContextVersion ? 
                        JSON.parse(JSON.stringify(aggMessage.boundedContextVersion)) : 
                        aggMessage.boundedContextVersion,
                    isEditable: true,
                    draftUIInfos: {
                        leftBoundedContextCount: bcQueue.length,  // ProgressInfo 표시 조건
                        directMessage: `표준 변환 중... (0/${bcQueue.length})`,
                        progress: 0,
                        isTransforming: true
                    },
                    draftOptions: [],
                    selectedOptionItem: {},  // 완전히 새로운 빈 객체
                    messageUniqueId: transformedMessageId,  // ← 자기 자신의 ID 사용! (원본과 분리)
                    originalMessageUniqueId: aggMessage.uniqueId,  // 참조용으로만 원본 ID 저장
                    transformationMappings: {},  // BC별 변환 매핑 정보 저장
                    timestamp: new Date()
                };
                
                // 원본 aggMessage의 selectedOptionItem 변경 감지 (디버깅용)
                const originalSelectedItemSnapshot = JSON.stringify(aggMessage.selectedOptionItem || {});
                const checkOriginalUnchanged = function() {
                    const currentSnapshot = JSON.stringify(aggMessage.selectedOptionItem || {});
                    if (currentSnapshot !== originalSelectedItemSnapshot) {
                        console.error('[ESDialoger] ❌ 원본 aggMessage.selectedOptionItem이 변경되었습니다!', {
                            before: originalSelectedItemSnapshot.substring(0, 200),
                            after: currentSnapshot.substring(0, 200),
                            aggMessageId: aggMessage.uniqueId
                        });
                    }
                };
                
                // 원본 aggregateDraftDialogDto 메시지 다음에 추가
                const aggMessageIndex = this.messages.findIndex(
                    msg => msg.type === 'aggregateDraftDialogDto' && msg.uniqueId === aggMessage.uniqueId
                );
                
                if (aggMessageIndex !== -1) {
                    this.messages.splice(aggMessageIndex + 1, 0, transformedMessage);
                } else {
                    this.messages.push(transformedMessage);
                }
                
                // UI 즉시 업데이트
                this.$forceUpdate();
                
                const processNextBC = function() {
                    // 중복 실행 방지
                    if (isProcessing) {
                        return;
                    }
                    
                    if (processedCount >= bcQueue.length) {
                        // transformedResults에 결과가 있는지 확인
                        const actualResultCount = transformedResults.length;
                        console.log(`[ESDialoger] 🎉 표준 변환 완료: ${actualResultCount}개 BC 처리됨`);
                        
                        // ============================================================
                        // 모든 BC 처리 완료 후 Enum/VO 재처리 (다른 BC 참조 문제 해결)
                        // ============================================================
                        // 1. 모든 BC에서 aggregate 이름 매핑 수집 (original -> transformed)
                        // 원본 BC 데이터에서 aggregate 이름 추출
                        const aggregateNameMapping = {};  // original_name -> transformed_name
                        
                        bcQueue.forEach(function(bcItem) {
                            const originalOptions = bcItem.optionsToTransform || [];
                            originalOptions.forEach(function(option) {
                                const structure = option.structure || [];
                                structure.forEach(function(item) {
                                    const aggregate = item.aggregate || {};
                                    const originalName = aggregate.name || '';
                                    if (originalName) {
                                        // 변환된 결과에서 해당 aggregate 찾기
                                        transformedResults.forEach(function(bcResult) {
                                            if (bcResult.boundedContext === bcItem.boundedContext) {
                                                const transformedOptions = bcResult.transformedOptions || [];
                                                transformedOptions.forEach(function(transOption) {
                                                    const transStructure = transOption.structure || [];
                                                    transStructure.forEach(function(transItem) {
                                                        const transAggregate = transItem.aggregate || {};
                                                        const transAggAlias = transAggregate.alias || '';
                                                        // alias로 매칭
                                                        if (transAggAlias === aggregate.alias) {
                                                            const transformedName = transAggregate.name || '';
                                                            if (transformedName && transformedName !== originalName) {
                                                                aggregateNameMapping[originalName] = transformedName;
                                                            }
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        });
                        
                        // 2. 각 BC의 Enum/VO를 전체 매핑으로 다시 처리
                        const reprocessedResults = transformedResults.map(function(bcResult) {
                            const reprocessedOptions = (bcResult.transformedOptions || []).map(function(option) {
                                const structure = option.structure || [];
                                const reprocessedStructure = structure.map(function(item) {
                                    const enumerations = (item.enumerations || []).map(function(enumItem) {
                                        const enumName = enumItem.name || '';
                                        // 전역 매핑에서 참조하는 aggregate 찾기
                                        for (const originalAggName in aggregateNameMapping) {
                                            const transformedAggName = aggregateNameMapping[originalAggName];
                                            // Enum 이름이 원본 aggregate 이름으로 시작하는지 확인
                                            if (enumName && originalAggName && enumName.startsWith(originalAggName)) {
                                                // aggregate 이름을 포함하는 경우 prefix 적용
                                                const suffix = enumName.substring(originalAggName.length);
                                                const suffixSnake = suffix.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
                                                const newEnumName = suffixSnake ? transformedAggName + '_' + suffixSnake : transformedAggName + '_enum';
                                                // 변환이 필요한 경우에만 적용 (이미 올바르게 변환된 경우는 제외)
                                                if (enumName !== newEnumName) {
                                                    enumItem.name = newEnumName;
                                                }
                                                break;
                                            }
                                        }
                                        return enumItem;
                                    });
                                    
                                    const valueObjects = (item.valueObjects || []).map(function(voItem) {
                                        const voName = voItem.name || '';
                                        // 전역 매핑에서 참조하는 aggregate 찾기
                                        for (const originalAggName in aggregateNameMapping) {
                                            const transformedAggName = aggregateNameMapping[originalAggName];
                                            // VO 이름이 원본 aggregate 이름으로 시작하는지 확인
                                            if (voName && originalAggName && voName.startsWith(originalAggName)) {
                                                // aggregate 이름을 포함하는 경우 prefix 적용
                                                const suffix = voName.substring(originalAggName.length);
                                                const suffixSnake = suffix.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
                                                const newVoName = suffixSnake ? transformedAggName + '_' + suffixSnake : transformedAggName + '_vo';
                                                // 변환이 필요한 경우에만 적용 (이미 올바르게 변환된 경우는 제외)
                                                if (voName !== newVoName) {
                                                    voItem.name = newVoName;
                                                }
                                                break;
                                            }
                                        }
                                        return voItem;
                                    });
                                    
                                    return {
                                        ...item,
                                        enumerations: enumerations,
                                        valueObjects: valueObjects
                                    };
                                });
                                
                                return {
                                    ...option,
                                    structure: reprocessedStructure
                                };
                            });
                            
                            return {
                                ...bcResult,
                                transformedOptions: reprocessedOptions
                            };
                        });
                        
                        // 재처리된 결과 사용
                        const finalResults = reprocessedResults;
                        
                        // 메시지 업데이트 (추가가 아님!)
                        self.$set(transformedMessage, 'draftUIInfos', {
                            leftBoundedContextCount: 0,  // 완료되었으므로 0
                            directMessage: '표준 변환 완료',
                            progress: 100,
                            isTransforming: false
                        });
                        
                        // 원본 AggregateDraftDto 메시지의 isTransforming도 false로 설정
                        if (aggMessage) {
                            self.$set(aggMessage, 'isTransforming', false);
                            if (aggMessage.draftUIInfos) {
                                self.$set(aggMessage.draftUIInfos, 'isTransforming', false);
                            }
                        }
                        // draftOptions도 deep copy로 보호
                        const draftOptions = finalResults.map(function(bcResult) {
                            return {
                                boundedContext: bcResult.boundedContext,
                                boundedContextAlias: bcResult.boundedContextAlias,
                                description: bcResult.description,
                                inference: bcResult.inference || '',
                                conclusions: bcResult.conclusions || '',
                                options: JSON.parse(JSON.stringify(bcResult.transformedOptions)),  // deep copy
                                defaultOptionIndex: 0
                            };
                        });
                        self.$set(transformedMessage, 'draftOptions', draftOptions);
                        
                        // selectedOptionItem 자동 설정: options[defaultIndex]에 boundedContext 정보를 추가하여 원본과 동일한 구조 유지
                        const autoSelectedOptionItem = {};
                        draftOptions.forEach(function(draftOption) {
                            if (draftOption.options && draftOption.options.length > 0) {
                                const defaultIndex = draftOption.defaultOptionIndex != null ? draftOption.defaultOptionIndex : 0;
                                const selectedOption = JSON.parse(JSON.stringify(draftOption.options[defaultIndex]));
                                
                                // boundedContext 정보를 객체 형태로 추가 (원본 구조와 동일하게)
                                selectedOption.boundedContext = {
                                    aggregates: draftOption.options[defaultIndex].structure ? 
                                        draftOption.options[defaultIndex].structure.map(s => ({
                                            alias: (s.aggregate && s.aggregate.alias) || '',
                                            name: (s.aggregate && s.aggregate.name) || ''
                                        })) : [],
                                    alias: draftOption.boundedContextAlias || draftOption.boundedContext,
                                    description: draftOption.description || '',
                                    displayName: draftOption.boundedContextAlias || draftOption.boundedContext,
                                    name: draftOption.boundedContext,
                                    requirements: {
                                        ddl: '',
                                        description: draftOption.description || '',
                                        event: draftOption.description || '',
                                        eventNames: '',
                                        traceMap: {},
                                        userStory: ''
                                    }
                                };
                                
                                // inference와 conclusions도 최상위에 추가
                                selectedOption.inference = draftOption.inference || '';
                                selectedOption.conclusions = draftOption.conclusions || '';
                                
                                autoSelectedOptionItem[draftOption.boundedContext] = selectedOption;
                            }
                        });
                        self.$set(transformedMessage, 'selectedOptionItem', autoSelectedOptionItem);
                        
                        // UI 강제 업데이트
                        self.$forceUpdate();
                        self.$emit("update:draft", self.messages);
                        
                        // 원본 변경 체크 (최종)
                        checkOriginalUnchanged();
                        return;
                    }
                    
                    isProcessing = true; // 처리 중 플래그 설정
                    const currentBC = bcQueue[processedCount];
                    const bcIndex = processedCount + 1;
                    
                    // 진행 상태 업데이트
                    if (aggMessage.draftUIInfos) {
                        self.$set(aggMessage.draftUIInfos, 'directMessage', `표준 변환 중... (${bcIndex}/${bcQueue.length}) - ${currentBC.boundedContext} [표준 매핑 컨텍스트 생성 중]`);
                        self.$set(aggMessage.draftUIInfos, 'progress', Math.floor((processedCount / bcQueue.length) * 100));
                    }
                    self.$forceUpdate();
                    
                    // 타임아웃 설정 (60초 이내 응답 없으면 다음 BC로 진행)
                    let timeoutId = null;
                    let isTimedOut = false; // 타임아웃 발생 여부
                    let isProcessed = false; // 이미 처리되었는지 (중복 처리 방지)
                    
                    // 표준 변환 실행
                    const standardTransformer = new StandardTransformerLangGraph({
                        input: {
                            draftOptions: currentBC.optionsToTransform,
                            boundedContext: currentBC.boundedContextData,
                            transformationSessionId: transformationSessionId,  // 변환 세션 ID 전달
                            userId: self.userInfo && self.userInfo.uid ? self.userInfo.uid : null  // 사용자 ID 전달
                        },
                        onModelCreatedWithThinking: (ret) => {
                            // 백엔드에서 보내는 상세 정보 활용
                            const retBC = ret.currentBC || currentBC.boundedContext;
                            const retAgg = ret.currentAgg || '';
                            const retPropertyType = ret.currentPropertyType || '';
                            const retChunkInfo = ret.chunkInfo || '';
                            const retStatus = ret.status || 'processing';
                            const retError = ret.error || '';
                            
                            // transformationLog에서 단계 정보 추출 (백엔드에서 이미 상세 메시지 제공)
                            const transformationLog = ret.transformationLog || ret.transformation_log || ret.directMessage || '';
                            
                            // 상세 정보 기반 메시지 구성
                            let finalMessage = '';
                            if (retBC && retAgg) {
                                const propertyLabel = {
                                    'aggregate': 'Aggregate',
                                    'enum': 'Enum',
                                    'vo': 'ValueObject',
                                    'field': 'Field'
                                }[retPropertyType] || retPropertyType || '';
                                
                                let detailParts = [];
                                if (retBC) detailParts.push(`BC: ${retBC}`);
                                if (retAgg) detailParts.push(`Agg: ${retAgg}`);
                                if (propertyLabel) detailParts.push(propertyLabel);
                                if (retChunkInfo) detailParts.push(retChunkInfo);
                                
                                const detailText = detailParts.length > 0 ? detailParts.join(' > ') : '';
                                
                                if (retStatus === 'error') {
                                    finalMessage = `❌ 오류: ${detailText}${retError ? ` (${retError})` : ''}`;
                                } else if (retStatus === 'completed') {
                                    finalMessage = `✅ 완료: ${detailText}`;
                                } else {
                                    finalMessage = `🔄 처리 중: ${detailText}`;
                                }
                                
                                // BC 진행 상황 추가
                                finalMessage = `표준 변환 중... (${bcIndex}/${bcQueue.length}) - ${finalMessage}`;
                            } else {
                                // 상세 정보가 없으면 기존 방식 사용
                                let stageName = '';
                                if (transformationLog.includes('표준 매핑 컨텍스트 생성 중')) {
                                    stageName = '[표준 매핑 컨텍스트 생성 중]';
                                } else if (transformationLog.includes('선처리 매핑 적용 중') || transformationLog.includes('선처리 매핑')) {
                                    stageName = '[선처리 매핑 중]';
                                } else if (transformationLog.includes('유사도 검색 중') || transformationLog.includes('검색')) {
                                    stageName = '[유사도 검색 중]';
                                } else if (transformationLog.includes('LLM 변환 중') || transformationLog.includes('LLM')) {
                                    stageName = '[LLM 변환 중]';
                                } else if (transformationLog.includes('후처리')) {
                                    stageName = '[후처리 중]';
                                } else if (transformationLog.includes('선처리') || transformationLog.includes('매핑')) {
                                    stageName = '[선처리 매핑 중]';
                                } else if (transformationLog.includes('검색') || transformationLog.includes('RAG')) {
                                    stageName = '[유사도 검색 중]';
                                } else if (transformationLog.includes('LLM') || transformationLog.includes('변환')) {
                                    stageName = '[LLM 변환 중]';
                                }
                                
                                finalMessage = `표준 변환 중... (${bcIndex}/${bcQueue.length}) - ${currentBC.boundedContext} ${stageName}`;
                            }
                            const baseProgress = Math.floor((processedCount / bcQueue.length) * 100);
                            const stepProgress = Math.floor((ret.progress || 0) / bcQueue.length);
                            
                            // aggMessage 업데이트
                            if (aggMessage.draftUIInfos) {
                                self.$set(aggMessage.draftUIInfos, 'directMessage', finalMessage);
                                self.$set(aggMessage.draftUIInfos, 'progress', baseProgress + stepProgress);
                            }
                            
                            // transformedMessage도 업데이트 (진행 상황 표시)
                            if (transformedMessage && transformedMessage.draftUIInfos) {
                                const leftCount = bcQueue.length - processedCount;
                                self.$set(transformedMessage, 'draftUIInfos', {
                                    leftBoundedContextCount: leftCount > 0 ? leftCount : 1,
                                    directMessage: finalMessage,
                                    progress: baseProgress + stepProgress,
                                    isTransforming: true
                                });
                            }
                            
                            self.$forceUpdate();
                        },
                        onGenerationSucceeded: (transformationResult) => {
                            // 타임아웃 취소 (타임아웃 후 데이터가 도착해도 처리함!)
                            if (timeoutId) clearTimeout(timeoutId);
                            
                            // 타임아웃 후 도착한 데이터도 처리 (중복 방지 제거)
                            // 타임아웃이 발생했어도 데이터가 도착하면 처리하도록 수정
                            if (isProcessed && !isTimedOut) {
                                return;
                            }
                            
                            isProcessed = true;
                            // 변환된 결과를 배열에 저장 (기존 초안은 덮어쓰지 않음)
                            // transformedOptions가 여러 위치에 있을 수 있으므로 모두 확인
                            let transformedOptions = null;
                            
                            if (transformationResult) {
                                // 1. 직접 transformedOptions 확인
                                if (transformationResult.transformedOptions) {
                                    transformedOptions = transformationResult.transformedOptions;
                                }
                                // 2. modelValue.output.options 확인
                                else if (transformationResult.modelValue && 
                                         transformationResult.modelValue.output && 
                                         transformationResult.modelValue.output.options) {
                                    transformedOptions = transformationResult.modelValue.output.options;
                                }
                                // 3. modelValue.output 확인
                                else if (transformationResult.modelValue && 
                                         transformationResult.modelValue.output && 
                                         Array.isArray(transformationResult.modelValue.output)) {
                                    transformedOptions = transformationResult.modelValue.output;
                                }
                            }
                            
                            if (transformedOptions && Array.isArray(transformedOptions) && transformedOptions.length > 0) {
                                // 변환된 옵션을 AggregateDraftDialog가 기대하는 형식으로 변환
                                // Deep copy로 Vue 반응성 변질 방지
                                const formattedOptions = transformedOptions.map(function(opt) {
                                    return {
                                        structure: JSON.parse(JSON.stringify(opt.structure || [])),
                                        pros: JSON.parse(JSON.stringify(opt.pros || {})),
                                        cons: JSON.parse(JSON.stringify(opt.cons || {})),
                                        description: opt.description || ''
                                    };
                                });
                                
                                // 변환 매핑 정보 수집
                                const originalOption = currentBC.optionsToTransform[0];
                                const transformedOption = formattedOptions[0];
                                const mappings = self._collectTransformationMappings(
                                    originalOption,
                                    transformedOption,
                                    currentBC.boundedContext
                                );
                                
                                // transformationMappings 업데이트
                                if (!transformedMessage.transformationMappings) {
                                    transformedMessage.transformationMappings = {};
                                }
                                transformedMessage.transformationMappings[currentBC.boundedContext] = mappings;
                                
                                transformedResults.push({
                                    boundedContext: currentBC.boundedContext,
                                    boundedContextAlias: currentBC.bcDraftOption.boundedContextAlias || currentBC.boundedContext,
                                    description: currentBC.bcDraftOption.description || '',
                                    inference: currentBC.bcDraftOption.inference || '', // 원본에서 inference 복사
                                    conclusions: currentBC.bcDraftOption.conclusions || '', // 원본에서 conclusions 복사
                                    transformedOptions: formattedOptions  // 포맷팅된 옵션 배열 (deep copy됨)
                                });
                                
                                // draftUIInfos 전체 객체 교체 (Vue 반응성 보장)
                                const newProgress = Math.floor(((processedCount + 1) / bcQueue.length) * 100);
                                const leftCount = bcQueue.length - (processedCount + 1);
                                let newMessage = '';
                                
                                if (leftCount > 0) {
                                    // 아직 처리할 BC가 남아있음
                                    const nextBC = bcQueue[processedCount + 1];
                                    newMessage = `표준 변환 중... (${processedCount + 1}/${bcQueue.length}) - 다음: ${nextBC.boundedContext}`;
                                } else {
                                    // 모든 BC 처리 완료, 후처리 단계
                                    newMessage = `표준 변환 중... (${processedCount + 1}/${bcQueue.length}) - [후처리 중]`;
                                }
                                
                                // 모든 BC 처리가 완료되었는지 확인 (leftCount === 0이면 완료)
                                const isAllCompleted = leftCount === 0;
                                
                                self.$set(transformedMessage, 'draftUIInfos', {
                                    leftBoundedContextCount: leftCount > 0 ? leftCount : 1,  // 0이면 표시 안되므로 최소 1
                                    directMessage: newMessage,
                                    progress: newProgress,
                                    isTransforming: !isAllCompleted  // 모든 BC 처리 완료 시 false
                                });
                                
                                // draftOptions도 deep copy로 보호
                                const draftOptions = transformedResults.map(function(bcResult) {
                                    return {
                                        boundedContext: bcResult.boundedContext,
                                        boundedContextAlias: bcResult.boundedContextAlias,
                                        description: bcResult.description,
                                        inference: bcResult.inference || '',
                                        conclusions: bcResult.conclusions || '',
                                        options: JSON.parse(JSON.stringify(bcResult.transformedOptions)),  // deep copy
                                        defaultOptionIndex: 0
                                    };
                                });
                                self.$set(transformedMessage, 'draftOptions', draftOptions);
                                
                                // selectedOptionItem 업데이트: options[defaultIndex]에 boundedContext 정보를 추가하여 원본과 동일한 구조 유지
                                // 기존 selectedOptionItem을 유지하면서 새로 추가/업데이트만 수행
                                const currentSelectedOptionItem = transformedMessage.selectedOptionItem || {};
                                const updatedSelectedOptionItem = JSON.parse(JSON.stringify(currentSelectedOptionItem));
                                draftOptions.forEach(function(draftOption) {
                                    if (draftOption.options && draftOption.options.length > 0) {
                                        const defaultIndex = draftOption.defaultOptionIndex != null ? draftOption.defaultOptionIndex : 0;
                                        const selectedOption = JSON.parse(JSON.stringify(draftOption.options[defaultIndex]));
                                        
                                        // boundedContext 정보를 객체 형태로 추가 (원본 구조와 동일하게)
                                        selectedOption.boundedContext = {
                                            aggregates: draftOption.options[defaultIndex].structure ? 
                                                draftOption.options[defaultIndex].structure.map(s => ({
                                                    alias: (s.aggregate && s.aggregate.alias) || '',
                                                    name: (s.aggregate && s.aggregate.name) || ''
                                                })) : [],
                                            alias: draftOption.boundedContextAlias || draftOption.boundedContext,
                                            description: draftOption.description || '',
                                            displayName: draftOption.boundedContextAlias || draftOption.boundedContext,
                                            name: draftOption.boundedContext,
                                            requirements: {
                                                ddl: '',
                                                description: draftOption.description || '',
                                                event: draftOption.description || '',
                                                eventNames: '',
                                                traceMap: {},
                                                userStory: ''
                                            }
                                        };
                                        
                                        // inference와 conclusions도 최상위에 추가
                                        selectedOption.inference = draftOption.inference || '';
                                        selectedOption.conclusions = draftOption.conclusions || '';
                                        
                                        updatedSelectedOptionItem[draftOption.boundedContext] = selectedOption;
                                    }
                                });
                                self.$set(transformedMessage, 'selectedOptionItem', updatedSelectedOptionItem);
                                // transformationMappings도 업데이트
                                if (transformedMessage.transformationMappings) {
                                    self.$set(transformedMessage, 'transformationMappings', JSON.parse(JSON.stringify(transformedMessage.transformationMappings)));
                                }
                                
                                // UI 강제 업데이트
                                self.$forceUpdate();
                                
                                // 원본 변경 체크
                                checkOriginalUnchanged();
                            }
                            
                            // 다음 BC 처리 (비동기로 처리하여 UI 업데이트 시간 확보)
                            processedCount++;
                            isProcessing = false;
                            setTimeout(processNextBC, 100);
                        },
                        onError: (error) => {
                            // 타임아웃 취소
                            if (timeoutId) clearTimeout(timeoutId);
                            
                            // 타임아웃 후 도착한 에러도 처리 (중복 방지 제거)
                            if (isProcessed && !isTimedOut) {
                                return;
                            }
                            isProcessed = true;
                            
                            console.error(`[ESDialoger] ❌ 표준 변환 실패: ${currentBC.boundedContext}`, error);
                            
                            // 에러 발생 시에도 원본 옵션을 transformedResults에 추가 (0개 BC 처리됨 방지)
                            transformedResults.push({
                                boundedContext: currentBC.boundedContext,
                                boundedContextAlias: currentBC.bcDraftOption.boundedContextAlias || currentBC.boundedContext,
                                description: currentBC.bcDraftOption.description || '',
                                inference: currentBC.bcDraftOption.inference || '',
                                conclusions: currentBC.bcDraftOption.conclusions || '',
                                transformedOptions: currentBC.optionsToTransform,  // 원본 옵션 사용
                                error: error.errorMessage || '표준 변환 실패'
                            });
                            
                            // 실패해도 다음 BC 계속 처리
                            processedCount++;
                            isProcessing = false;
                            setTimeout(processNextBC, 100);
                        }
                    });
                    
                    // 타임아웃 설정 (10분 이내 응답 없으면 다음 BC로 진행)
                    timeoutId = setTimeout(() => {
                        if (isProcessed) return; // 이미 처리되었으면 무시
                        isTimedOut = true; // 타임아웃 플래그 설정 (isProcessed는 설정하지 않음!)
                        
                        console.warn(`[ESDialoger] ⚠️  표준 변환 타임아웃: ${currentBC.boundedContext}`);
                        
                        // 타임아웃 발생 시에도 원본 옵션을 transformedResults에 추가 (0개 BC 처리됨 방지)
                        transformedResults.push({
                            boundedContext: currentBC.boundedContext,
                            boundedContextAlias: currentBC.bcDraftOption.boundedContextAlias || currentBC.boundedContext,
                            description: currentBC.bcDraftOption.description || '',
                            inference: currentBC.bcDraftOption.inference || '',
                            conclusions: currentBC.bcDraftOption.conclusions || '',
                            transformedOptions: currentBC.optionsToTransform,  // 원본 옵션 사용
                            error: '타임아웃'
                        });
                        
                        // UI 업데이트: 타임아웃 상태 표시
                        if (aggMessage.draftUIInfos) {
                            self.$set(aggMessage.draftUIInfos, 'directMessage', `표준 변환 중... (${bcIndex}/${bcQueue.length}) - ${currentBC.boundedContext} (타임아웃)`);
                        }
                        self.$forceUpdate();
                        
                        processedCount++;
                        isProcessing = false;
                        setTimeout(processNextBC, 100);
                        // 타임아웃 후에도 데이터가 도착할 수 있으므로 isProcessed는 설정하지 않음
                    }, 600000); // 10분 타임아웃 (600초)
                    
                    standardTransformer.generate();
                };
                
                // 첫 번째 BC부터 시작
                processNextBC();
            },

            alertGenerateWarning(generator) {
                const hasMessagesToRemove = this.hasMessagesToRemove(generator);
                
                if (!hasMessagesToRemove) {
                    return true;
                }

                let warningMessage = '';
                let shouldProceed = false;

                // 각 단계별 경고 메시지
                switch(generator) {
                    case "UserStoryGenerator":
                        warningMessage = this.$t('ESDialoger.warnings.default');
                        break;
                    case "RequirementsValidationGenerator":
                    case "RecursiveRequirementsValidationGenerator":
                        warningMessage = this.$t('ESDialoger.warnings.default');
                        break;
                    case "bcGenerationOption":
                        warningMessage = this.$t('ESDialoger.warnings.default');
                        break;
                    case "DevideBoundedContextGenerator":
                        warningMessage = this.$t('ESDialoger.warnings.default');
                        break;
                    case "CreateAggregateActionsByFunctions":
                        warningMessage = this.$t('ESDialoger.warnings.default');
                        break;
                    case "StandardTransformation":
                        warningMessage = this.$t('ESDialoger.warnings.default');
                        break;
                    case "siteMapViewer":
                        warningMessage = this.$t('ESDialoger.warnings.siteMap');
                        break;
                }

                shouldProceed = confirm(warningMessage);
                
                if (shouldProceed) {
                    // 현재 단계에 따라 하단 메시지들 제거
                    this.removeMessagesAfterCurrent(generator);
                    return true;
                }
                return false;
            },

            hasMessagesToRemove(generator) {
                // 각 단계별로 제거할 메시지 타입 정의
                const messageTypesToRemove = {
                    "UserStoryGenerator": [
                        "processAnalysis",
                        "bcGenerationOption",
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "RequirementsValidationGenerator": [
                        "processAnalysis",
                        "bcGenerationOption",
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ],
                    "RecursiveRequirementsValidationGenerator": [
                        "processAnalysis",
                        "bcGenerationOption",
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ],
                    "bcGenerationOption": [
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "DevideBoundedContextGenerator": [
                        "boundedContextResult",
                        "siteMapViewer",
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "CreateAggregateActionsByFunctions": [
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "StandardTransformation": [
                        "standardTransformedDraftDialogDto"
                    ],
                    "siteMapViewer": [
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ],
                    "RecursiveSiteMapGenerator": [
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ]
                };

                const typesToRemove = messageTypesToRemove[generator] || [];
                
                // 현재 메시지들 중 제거할 타입의 메시지가 있는지 확인
                return this.messages.some(msg => typesToRemove.includes(msg.type));
            },

            removeMessagesAfterCurrent(generator) {
                const messageTypesToRemove = {
                    "UserStoryGenerator": [
                        "processAnalysis",
                        "bcGenerationOption",
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "RequirementsValidationGenerator": [
                        "processAnalysis",
                        "bcGenerationOption",
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ],
                    "RecursiveRequirementsValidationGenerator": [
                        "processAnalysis",
                        "bcGenerationOption",
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ],
                    "bcGenerationOption": [
                        "boundedContextResult",
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "DevideBoundedContextGenerator": [
                        "boundedContextResult",
                        "siteMapViewer",
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "CreateAggregateActionsByFunctions": [
                        "aggregateDraftDialogDto",
                        "standardTransformedDraftDialogDto"
                    ],
                    "StandardTransformation": [
                        "standardTransformedDraftDialogDto"
                    ],
                    "siteMapViewer": [
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ],
                    "RecursiveSiteMapGenerator": [
                        "siteMapViewer",
                        "standardTransformedDraftDialogDto"
                    ]
                };

                const typesToRemove = messageTypesToRemove[generator] || [];
                let filteredMessages = this.messages.filter(msg => !typesToRemove.includes(msg.type));
                // 해당 타입의 메시지들 제거
                this.messages = [...filteredMessages];
                this.$emit('update:draft', this.messages)
            },

            updateDevideBoundedContext(selectedAspect, devideBoundedContext){
                this.resultDevideBoundedContext[selectedAspect] = devideBoundedContext;
                this.updateMessageState(this.messages.find(message => message.type === 'boundedContextResult').uniqueId, {
                    result: this.resultDevideBoundedContext
                });
                this.$emit('update:draft', this.messages)
            },

            updateSiteMap(siteMap){
                this.siteMap = siteMap;
                this.updateMessageState(this.messages.find(message => message.type === 'siteMapViewer').uniqueId, {
                    siteMap: siteMap
                });
                // localStorage.setItem("siteMap", JSON.stringify(this.siteMap));
                this.$emit('update:draft', this.messages)
            },

            deleteDefinition(id, information){
                this.$emit('delete:modelList', id, information)
                this.modelListKey++;
            },

            openStorageDialog(type){
                this.$emit('open:storageDialog', type)
            },

            // 자동 스크롤 관련 메서드들
            initAutoScroll() {
                if (this.$refs.userStoryContainer) {
                    // textarea 스크롤 이벤트만 추가 (컨테이너 스크롤 제거)
                    const textarea = this.$refs.userStoryContainer.querySelector('textarea');
                    if (textarea) {
                        textarea.addEventListener('scroll', this.handleTextareaScroll);
                        
                        // 테스트를 위해 수동으로 스크롤 이벤트 발생
                        textarea.dispatchEvent(new Event('scroll'));
                    }
                } else {
                    // 재시도 (최대 3번)
                    if (!this.autoScrollRetryCount) this.autoScrollRetryCount = 0;
                    if (this.autoScrollRetryCount < 3) {
                        this.autoScrollRetryCount++;
                        setTimeout(() => {
                            this.initAutoScroll();
                        }, 200);
                    }
                }
            },

            scrollToBottom() {
                const container = this.$refs.userStoryContainer;
                if (!container || !this.isAutoScrollEnabled) return;
                
                // 자동 스크롤 시작
                this.isAutoScrollInProgress = true;
                
                // textarea만 스크롤 (컨테이너 스크롤 제거)
                const textarea = container.querySelector('textarea');
                if (textarea) {
                    textarea.scrollTop = textarea.scrollHeight;
                }
                
                // 자동 스크롤 완료 (짧은 지연 후)
                setTimeout(() => {
                    this.isAutoScrollInProgress = false;
                }, 100);
            },

            handleTextareaScroll() {
                const container = this.$refs.userStoryContainer;
                if (!container) {
                    return;
                }
                
                // 자동 스크롤 진행 중이면 사용자 스크롤 감지 무시
                if (this.isAutoScrollInProgress) {
                    return;
                }
                
                const textarea = container.querySelector('textarea');
                if (!textarea) {
                    return;
                }

                // textarea 기준으로 스크롤 위치 확인
                const isAtBottom = this.isTextareaAtBottom(textarea);
                
                if (isAtBottom) {
                    this.isAutoScrollEnabled = true;
                } else {
                    this.isAutoScrollEnabled = false;
                }
            },

            isTextareaAtBottom(textarea) {
                const threshold = 5;
                return Math.abs(textarea.scrollHeight - textarea.clientHeight - textarea.scrollTop) <= threshold;
            },

            generateCommandReadModelExtraction(){
                const requirementsText = this.projectInfo.usedUserStory || '';
                const shouldUseRecursive = requirementsText && requirementsText.length > 24000;

                // 로컬 스토리지에서 LangGraph 사용 여부 확인 (기본값: false)
                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                
                if (useLangGraph) {
                    if (shouldUseRecursive) {
                        this.generator = new RecursiveCommandReadModelExtractorLangGraph(this);
                        this.state.generator = "RecursiveCommandReadModelExtractorLangGraph";
                        this.generatorName = "RecursiveCommandReadModelExtractorLangGraph";
                    } else {
                        this.generator = new CommandReadModelExtractorLangGraph(this);
                        this.state.generator = "CommandReadModelExtractorLangGraph";
                        this.generatorName = "CommandReadModelExtractorLangGraph";
                    }
                } else {
                    this.generator = shouldUseRecursive ? new RecursiveCommandReadModelExtractor(this) : new CommandReadModelExtractor(this);
                    this.state.generator = shouldUseRecursive ? "RecursiveCommandReadModelExtractor" : "CommandReadModelExtractor";
                    this.generatorName = shouldUseRecursive ? "RecursiveCommandReadModelExtractor" : "CommandReadModelExtractor";
                }

                this.input['requirements'] = this.projectInfo.usedUserStory;
                this.input['resultDevideBoundedContext'] = JSON.parse(JSON.stringify(this.resultDevideBoundedContext[this.selectedAspect].boundedContexts.filter(bc => !bc.implementationStrategy.includes('PBC:')))).map(bc => {
                    return {
                        name: bc.name,
                        role: bc.role
                    }
                });

                this.isExtractingCommandReadModel = true;
                this.commandReadModelExtractionProgress = 0;

                // SiteMapViewer 메시지에 추출 진행 상태 표시
                const siteMapMessage = this.generateMessage("siteMapViewer", []);
                const siteMapIndex = this.messages.findIndex(msg => msg.type === 'siteMapViewer');
                if (siteMapIndex !== -1) {
                    this.messages.splice(siteMapIndex, 1);
                }

                const aggregateDraftDialogDtoIndex = this.messages.findIndex(msg => msg.type === 'aggregateDraftDialogDto');
                if (aggregateDraftDialogDtoIndex !== -1) {
                    this.messages.splice(aggregateDraftDialogDtoIndex, 0, siteMapMessage);
                } else {
                    this.messages.push(siteMapMessage);
                }

                // SiteMapViewer에 추출 진행 상태 표시
                this.updateMessageState(this.messages.find(msg => msg.type === 'siteMapViewer').uniqueId, {
                    isGenerating: true,
                    processingRate: 0,
                    currentProcessingStep: 'extractingCommandsAndReadModels',
                    currentChunk: 0,
                    totalChunks: 0
                });

                // LangGraph 사용 시
                if (useLangGraph) {
                    const boundedContexts = this.input['resultDevideBoundedContext'];
                    this.generator.extractRecursively(this.projectInfo.usedUserStory, boundedContexts).then(result => {
                        this.commandReadModelData = result.extractedData;
                        this.isExtractingCommandReadModel = false;
                        
                        // 추출 완료 상태 업데이트 (100% 완료 표시)
                        this.updateMessageState(this.messages.find(msg => msg.type === 'siteMapViewer').uniqueId, {
                            commandReadModelData: this.commandReadModelData,
                            processingRate: 100,
                            currentProcessingStep: 'extractingCommandsAndReadModels'
                        });
                        
                        // 추출 완료 후 자동으로 사이트맵 생성 진행
                        setTimeout(() => {
                            this.generateSiteMap();
                        }, 500);
                    }).catch(error => {
                        console.error('Command/ReadModel extraction failed:', error);
                        this.isExtractingCommandReadModel = false;
                        
                        const siteMapViewerMessage = this.messages.find(msg => msg.type === 'siteMapViewer');
                        if (siteMapViewerMessage) {
                            this.updateMessageState(siteMapViewerMessage.uniqueId, {
                                isGenerating: false,
                                errorMessage: 'Command/ReadModel 추출 실패: ' + (error.message || error)
                            });
                        }
                    });
                } else if (shouldUseRecursive) {
                    this.generator.generateRecursively(this.projectInfo.usedUserStory).then(result => {
                        this._handleCommandReadModelExtractorResult(result.extractedData);
                    }).catch(error => {
                        console.error('Command/ReadModel extraction failed:', error);
                        this.isExtractingCommandReadModel = false;
                        
                        // 에러 메시지 표시 (무한 루프 방지를 위해 generateSiteMap 호출 안함)
                        const siteMapViewerMessage = this.messages.find(msg => msg.type === 'siteMapViewer');
                        if (siteMapViewerMessage) {
                            this.updateMessageState(siteMapViewerMessage.uniqueId, {
                                isGenerating: false,
                                errorMessage: 'Command/ReadModel 추출 실패: ' + (error.message || error)
                            });
                        }
                    });
                } else {
                    this.generator.generate();
                }
            },

            generateSiteMap(){
                // Command/ReadModel 데이터가 없고, 현재 추출 중이 아니면 먼저 추출
                if (!this.commandReadModelData && !this.isExtractingCommandReadModel) {
                    this.generateCommandReadModelExtraction();
                    return;
                }

                const requirementsText = this.projectInfo.usedUserStory || '';
                const shouldUseRecursive = requirementsText && requirementsText.length > 24000;

                // 로컬 스토리지에서 LangGraph 사용 여부 확인 (기본값: false)
                const useLangGraph = localStorage.getItem('useLangGraph') === 'true';
                
                if (useLangGraph) {
                    if (shouldUseRecursive) {
                        this.generator = new RecursiveSiteMapGeneratorLangGraph(this);
                        this.state.generator = "RecursiveSiteMapGeneratorLangGraph";
                        this.generatorName = "RecursiveSiteMapGeneratorLangGraph";
                    } else {
                        this.generator = new SiteMapGeneratorLangGraph(this);
                        this.state.generator = "SiteMapGeneratorLangGraph";
                        this.generatorName = "SiteMapGeneratorLangGraph";
                    }
                } else {
                    this.generator = shouldUseRecursive ? new RecursiveSiteMapGenerator(this) : new SiteMapGenerator(this);
                    this.state.generator = shouldUseRecursive ? "RecursiveSiteMapGenerator" : "SiteMapGenerator";
                    this.generatorName = shouldUseRecursive ? "RecursiveSiteMapGenerator" : "SiteMapGenerator";
                }

                this.input['requirements'] = this.projectInfo.usedUserStory;
                this.input['resultDevideBoundedContext'] = JSON.parse(JSON.stringify(this.resultDevideBoundedContext[this.selectedAspect].boundedContexts.filter(bc => !bc.implementationStrategy.includes('PBC:')))).map(bc => {
                    return {
                        name: bc.name,
                        role: bc.role
                    }
                });
                
                // Command/ReadModel 데이터가 있으면 추가
                if (this.commandReadModelData) {
                    this.input['commandReadModelData'] = this.commandReadModelData;
                }

                this.siteMap = [];
                const siteMapMessage = this.generateMessage("siteMapViewer", []);
                const siteMapIndex = this.messages.findIndex(msg => msg.type === 'siteMapViewer');
                if (siteMapIndex !== -1) {
                    this.messages.splice(siteMapIndex, 1);
                }

                const aggregateDraftDialogDtoIndex = this.messages.findIndex(msg => msg.type === 'aggregateDraftDialogDto');
                if (aggregateDraftDialogDtoIndex !== -1) {
                    // agg 메시지가 있다면 이 메시지보다 앞에 생성
                    this.messages.splice(aggregateDraftDialogDtoIndex, 0, siteMapMessage);
                }else{
                    this.messages.push(siteMapMessage);
                }

                // SiteMapViewer에 사이트맵 생성 진행 상태 표시
                this.updateMessageState(this.messages.find(msg => msg.type === 'siteMapViewer').uniqueId, {
                    isGenerating: true,
                    processingRate: 0,
                    currentProcessingStep: 'generatingSiteMap',
                    currentChunk: 0,
                    totalChunks: 0
                });
                
                if (useLangGraph) {
                    const boundedContexts = this.input['resultDevideBoundedContext'];
                    const existingNavigation = this.siteMap || [];
                    this.generator.generateRecursively(
                        this.projectInfo.usedUserStory,
                        boundedContexts,
                        this.commandReadModelData,
                        existingNavigation
                    ).then(result => {
                        this.siteMap = result.siteMap.treeData || [];
                        this.updateMessageState(this.messages.find(msg => msg.type === 'siteMapViewer').uniqueId, {
                            siteMap: this.siteMap,
                            isGenerating: false
                        });
                        this.$emit('update:draft', this.messages)
                    });
                } else if (shouldUseRecursive) {
                    this.generator.generateRecursively(this.projectInfo.usedUserStory).then(result => {
                        this.siteMap = result.treeData;
                        this.updateMessageState(this.messages.find(msg => msg.type === 'siteMapViewer').uniqueId, {
                            siteMap: this.siteMap,
                            isGenerating: false
                        });
                        this.$emit('update:draft', this.messages)
                    });
                } else {
                    this.generator.generate()
                }
            },
            
            // 사이트맵 루트 노드 안전하게 가져오기
            getSiteMapRoot(siteMapTree) {
                return siteMapTree && Array.isArray(siteMapTree) && siteMapTree.length > 0 ? siteMapTree[0] : null;
            },
            
            // 변환 매핑 정보 수집
            _collectTransformationMappings(originalOption, transformedOption, boundedContext) {
                const mappings = {
                    aggregates: [],
                    enumerations: [],
                    valueObjects: [],
                    fields: []
                };
                
                if (!originalOption || !originalOption.structure || !transformedOption || !transformedOption.structure) {
                    return mappings;
                }
                
                const originalStructure = originalOption.structure || [];
                const transformedStructure = transformedOption.structure || [];
                
                // Aggregate 매핑
                originalStructure.forEach(function(originalItem, index) {
                    const transformedItem = transformedStructure[index];
                    if (!originalItem.aggregate || !transformedItem || !transformedItem.aggregate) {
                        return;
                    }
                    
                    const originalAggName = originalItem.aggregate.name || '';
                    const transformedAggName = transformedItem.aggregate.name || '';
                    
                    // 전환 여부와 관계없이 모든 aggregate 추가 (전환되지 않았으면 transformed는 원본과 동일)
                    if (originalAggName) {
                        mappings.aggregates.push({
                            original: originalAggName,
                            transformed: (transformedAggName && transformedAggName !== originalAggName) ? transformedAggName : null,
                            alias: originalItem.aggregate.alias || ''
                        });
                    }
                    
                    // Enumeration 매핑 (전환되지 않은 것도 포함)
                    const originalEnums = originalItem.enumerations || [];
                    const transformedEnums = transformedItem.enumerations || [];
                    originalEnums.forEach(function(originalEnum, enumIndex) {
                        if (originalEnum && originalEnum.name) {
                            const originalEnumName = originalEnum.name || '';
                            const transformedEnum = transformedEnums[enumIndex];
                            const transformedEnumName = (transformedEnum && transformedEnum.name) ? transformedEnum.name : '';
                            // 전환 여부와 관계없이 모든 enumeration 추가
                            mappings.enumerations.push({
                                original: originalEnumName,
                                transformed: (transformedEnumName && transformedEnumName !== originalEnumName) ? transformedEnumName : null,
                                aggregate: originalAggName
                            });
                        }
                    });
                    
                    // ValueObject 매핑 (전환되지 않은 것도 포함)
                    const originalVOs = originalItem.valueObjects || [];
                    const transformedVOs = transformedItem.valueObjects || [];
                    originalVOs.forEach(function(originalVO, voIndex) {
                        if (originalVO && originalVO.name) {
                            const originalVOName = originalVO.name || '';
                            const transformedVO = transformedVOs[voIndex];
                            const transformedVOName = (transformedVO && transformedVO.name) ? transformedVO.name : '';
                            // 전환 여부와 관계없이 모든 valueObject 추가
                            mappings.valueObjects.push({
                                original: originalVOName,
                                transformed: (transformedVOName && transformedVOName !== originalVOName) ? transformedVOName : null,
                                aggregate: originalAggName
                            });
                        }
                    });
                    
                    // Preview Attributes (Fields) 매핑
                    const originalPreviewAttrs = originalItem.previewAttributes || [];
                    const transformedPreviewAttrs = transformedItem.previewAttributes || [];
                    originalPreviewAttrs.forEach(function(originalAttr, attrIndex) {
                        if (!originalAttr || !originalAttr.fieldName) return;
                        
                        // 매칭 전략: 1) fieldAlias로 매칭, 2) 인덱스로 매칭 (fallback)
                        let transformedAttr = null;
                        
                        // 1. fieldAlias로 매칭 시도
                        if (originalAttr.fieldAlias) {
                            transformedAttr = transformedPreviewAttrs.find(function(attr) {
                                return attr && attr.fieldAlias === originalAttr.fieldAlias;
                            });
                        }
                        
                        // 2. fieldAlias 매칭 실패 시 인덱스로 매칭 (fallback)
                        if (!transformedAttr && attrIndex < transformedPreviewAttrs.length) {
                            transformedAttr = transformedPreviewAttrs[attrIndex];
                        }
                        
                        if (originalAttr.fieldName) {
                            const originalFieldName = originalAttr.fieldName || '';
                            const transformedFieldName = (transformedAttr && transformedAttr.fieldName) ? transformedAttr.fieldName : '';
                            // 전환 여부와 관계없이 모든 field 추가
                            mappings.fields.push({
                                original: originalFieldName,
                                transformed: (transformedFieldName && transformedFieldName !== originalFieldName) ? transformedFieldName : null,
                                aggregate: originalAggName,
                                alias: originalAttr.fieldAlias || ''
                            });
                        }
                    });
                    
                    // DDL Fields 매핑
                    const originalDdlFields = originalItem.ddlFields || [];
                    const transformedDdlFields = transformedItem.ddlFields || [];
                    originalDdlFields.forEach(function(originalField, fieldIndex) {
                        if (!originalField || !originalField.fieldName) return;
                        
                        // 매칭 전략: 1) fieldAlias로 매칭, 2) 인덱스로 매칭 (fallback)
                        let transformedField = null;
                        
                        // 1. fieldAlias로 매칭 시도
                        if (originalField.fieldAlias) {
                            transformedField = transformedDdlFields.find(function(field) {
                                return field && field.fieldAlias === originalField.fieldAlias;
                            });
                        }
                        
                        // 2. fieldAlias 매칭 실패 시 인덱스로 매칭 (fallback)
                        if (!transformedField && fieldIndex < transformedDdlFields.length) {
                            transformedField = transformedDdlFields[fieldIndex];
                        }
                        
                        if (originalField.fieldName) {
                            const originalFieldName = originalField.fieldName || '';
                            const transformedFieldName = (transformedField && transformedField.fieldName) ? transformedField.fieldName : '';
                            // 전환 여부와 관계없이 모든 field 추가
                            mappings.fields.push({
                                original: originalFieldName,
                                transformed: (transformedFieldName && transformedFieldName !== originalFieldName) ? transformedFieldName : null,
                                aggregate: originalAggName,
                                alias: originalField.fieldAlias || ''
                            });
                        }
                    });
                });
                
                return mappings;
            }
        }
    }
</script>

<style scoped>

</style>
