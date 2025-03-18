<template>
    <div style="margin-top: 10px;">
        <div>
            <v-col class="auto-modeling-message-box">
                <v-card class="auto-modeling-message-card">
                    <v-card-text class="auto-modeling-message">
                        <vue-typed-js
                                :strings="[$t('autoModeling.isModelSelectMessage')]"
                                :typeSpeed="10"
                                :showCursor="false"
                                @onComplete="state.AIModelSelectMessageIsTyping = false"
                        >
                            <span class="typing"></span>
                        </vue-typed-js>
                    </v-card-text>
                </v-card>
            </v-col>
        </div>
        <div style="display: flex; flex-direction: column;" v-if="!state.AIModelSelectMessageIsTyping">
            <AIModelSetting @onConfirm="state.isAIModelSelected = true; generateUserStory();" />
        </div>
        
        <div>
            <v-col class="auto-modeling-message-box" style="margin-top: 20px;">
                <v-card v-if="state.isAIModelSelected" class="auto-modeling-message-card">
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
                        <div class="gs-auto-modeling-userStory-text-pc">{{$t('autoModeling.explanation.userStory')}}</div>
                        <div class="gs-auto-modeling-userStory-text-mobile">{{$t('autoModeling.explanation.userStory')}}</div>
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

                        <!-- 요구사항 분석 결과 표시 -->
                        <v-card v-if="showTestValidationButton" style="height: 400px;">
                            <BpmnViewer
                                ref="bpmnVue"
                                :key="currentXML"
                                :bpmn="currentXML"
                                :options="options"
                                :isViewMode="false"
                                style="height: 100%;"
                            ></BpmnViewer>
                        </v-card>
                        <v-card v-if="requirementsAnalysis" class="requirements-analysis-card ma-4">
                            <v-card-title class="requirements-analysis-title">
                                {{ requirementsAnalysis.type === 'ENHANCEMENT_GUIDE' ? '요구사항 보완 가이드' : '프로세스 분석 결과' }}
                            </v-card-title>
                            
                            <!-- 보완 가이드 -->
                            <v-card-text v-if="requirementsAnalysis.type === 'ENHANCEMENT_GUIDE'">
                                <div class="missing-elements-section">
                                    <h3>누락된 요소</h3>
                                    <v-list dense>
                                        <v-list-item v-for="(items, category) in requirementsAnalysis.content.missingElements" :key="category">
                                            <v-list-item-content>
                                                <v-list-item-title class="font-weight-bold">{{ category }}</v-list-item-title>
                                                <v-list-item-subtitle v-for="item in items" :key="item">
                                                    • {{ item }}
                                                </v-list-item-subtitle>
                                            </v-list-item-content>
                                        </v-list-item>
                                    </v-list>
                                </div>
                                
                                <div class="recommendations-section mt-4">
                                    <h3>권장 사항</h3>
                                    <div class="immediate-actions">
                                        <h4>즉시 조치사항</h4>
                                        <ul>
                                            <li v-for="action in requirementsAnalysis.content.recommendations.immediate" :key="action">
                                                {{ action }}
                                            </li>
                                        </ul>
                                    </div>
                                    <div class="questions mt-2">
                                        <h4>이해관계자 질문</h4>
                                        <ul>
                                            <li v-for="question in requirementsAnalysis.content.recommendations.questions" :key="question">
                                                {{ question }}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </v-card-text>

                            <!-- 분석 결과 -->
                            <v-card-text v-else>
                                <div class="processes-section">
                                    <h3>비즈니스 프로세스</h3>
                                    <v-expansion-panels>
                                        <v-expansion-panel v-for="process in requirementsAnalysis.content.businessProcesses" :key="process.name">
                                            <v-expansion-panel-header>
                                                {{ process.name }}
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <div class="process-details">
                                                    <p><strong>설명:</strong> {{ process.description }}</p>
                                                    <p><strong>관련 부서:</strong> {{ process.departments.join(', ') }}</p>
                                                    
                                                    <div v-if="process.subProcesses.length" class="sub-processes mt-2">
                                                        <h4>서브 프로세스</h4>
                                                        <v-list dense>
                                                            <v-list-item v-for="subProcess in process.subProcesses" :key="subProcess.name">
                                                                <v-list-item-content>
                                                                    <v-list-item-title>{{ subProcess.name }}</v-list-item-title>
                                                                    <v-list-item-subtitle>
                                                                        <div><strong>관련 부서:</strong> {{ subProcess.involvedDepartments.join(', ') }}</div>
                                                                        <div class="mt-1"><strong>입력:</strong></div>
                                                                        <ul>
                                                                            <li v-for="input in subProcess.inputs" :key="input.description">
                                                                                {{ input.description }} (출처: {{ input.source }})
                                                                            </li>
                                                                        </ul>
                                                                        <div class="mt-1"><strong>출력:</strong></div>
                                                                        <ul>
                                                                            <li v-for="output in subProcess.outputs" :key="output.description">
                                                                                {{ output.description }} (목적지: {{ output.destination }})
                                                                            </li>
                                                                        </ul>
                                                                    </v-list-item-subtitle>
                                                                </v-list-item-content>
                                                            </v-list-item>
                                                        </v-list>
                                                    </div>
                                                </div>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </div>

                                <div class="value-streams-section mt-4">
                                    <h3>가치 흐름</h3>
                                    <v-expansion-panels>
                                        <v-expansion-panel v-for="stream in requirementsAnalysis.content.valueStreams" :key="stream.name">
                                            <v-expansion-panel-header>
                                                {{ stream.name }}
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <v-timeline dense>
                                                    <v-timeline-item v-for="step in stream.flow" :key="step.step">
                                                        <template v-slot:opposite>
                                                            <span>{{ step.department }}</span>
                                                        </template>
                                                        <v-card class="elevation-1">
                                                            <v-card-title class="text-subtitle-1">{{ step.step }}</v-card-title>
                                                            <v-card-text>
                                                                <div><strong>입력:</strong> {{ step.input }}</div>
                                                                <div><strong>프로세스:</strong> {{ step.process }}</div>
                                                                <div><strong>출력:</strong> {{ step.output }}</div>
                                                            </v-card-text>
                                                        </v-card>
                                                    </v-timeline-item>
                                                </v-timeline>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </div>

                                <div class="interactions-section mt-4">
                                    <h3>부서간 상호작용</h3>
                                    <v-simple-table>
                                        <template v-slot:default>
                                            <thead>
                                                <tr>
                                                    <th>출발 부서</th>
                                                    <th>도착 부서</th>
                                                    <th>상호작용</th>
                                                    <th>데이터 흐름</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="interaction in requirementsAnalysis.content.crossDepartmentInteractions" 
                                                    :key="`${interaction.sourceDepartment}-${interaction.targetDepartment}`">
                                                    <td>{{ interaction.sourceDepartment }}</td>
                                                    <td>{{ interaction.targetDepartment }}</td>
                                                    <td>{{ interaction.interaction }}</td>
                                                    <td>{{ interaction.dataFlow }}</td>
                                                </tr>
                                            </tbody>
                                        </template>
                                    </v-simple-table>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-tab-item>

                    <!-- DDL -->
                    <!-- <v-tab-item>
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
                    </v-tab-item> -->
                </v-tabs-items>
                <v-btn v-if="!done" @click="stop()" style="position: absolute; right:10px; top:10px;"><v-progress-circular class="auto-modeling-stop-loading-icon" indeterminate></v-progress-circular>Stop generating</v-btn>
                <v-row v-if="done" class="ma-0 pa-4 button-row">
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isSummarizeStarted || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" @click="generate()">
                        <v-icon class="auto-modeling-btn-icon">mdi-refresh</v-icon>{{ $t('ESDialoger.tryAgain') }}
                    </v-btn>
                    <v-btn :disabled="isSummarizeStarted || isGeneratingBoundedContext || isStartMapping" class="auto-modeling-btn" color="primary" @click="showBCGenerationOption = !showBCGenerationOption">
                        {{ $t('ESDialoger.createBoundedContext') }}
                    </v-btn>
                    <v-btn v-if="showTestValidationButton" class="auto-modeling-btn" @click="testValidation()">Test Validate</v-btn>
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
    import RequirementsValidationGenerator from './RequirementsValidationGenerator.js'
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

    //Requirements Summarizer
    import RecursiveRequirementsSummarizer from './RecursiveRequirementsSummarizer.js';
    import RequirementsMappingGenerator from './RequirementsMappingGenerator.js';

    //Bpmn
    import BpmnViewer from '../../bpmnModeling/bpmn/BpmnUengineViewer.vue';

    import { 
        ESDialogerMessages,
        ESDialogerTestTerminal,
        MessageFactory,
        AIModelSetting
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
            projectInfo: Object,
            modelIds: Object,
            isServerProject: Boolean
        },
        components: {
            VueTypedJs,
            DevideBoundedContextDialog,
            BCGenerationOption,
            ESDialogerMessages,
            BpmnViewer,
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
        },
        async created(){
            await this.setUserInfo()
            this.initESDialoger();
            this.autoModel = getParent(this.$parent, 'auto-modeling-dialog');
            this.textChunker = new TextChunker({
                chunkSize: 2000,  // GPT-4 컨텍스트 크기를 고려한 설정
                overlapSize: 100  // 문맥 유지를 위한 오버랩
            });


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

            this.generators.PreProcessingFunctionsGenerator.generator = new PreProcessingFunctionsGenerator({
                onSend: (input, stopCallback) => {
                    this.workingMessages.AggregateDraftDialogDto.isShow = true
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                        directMessage: "",
                        progress: null
                    }
                    this.workingMessages.AggregateDraftDialogDto.actions.stop = stopCallback
                    createThinkingUpdateInterval(0, input.subjectText)
                },

                onFirstResponse: (returnObj) => {
                    clearThinkingUpdateInterval()
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

                onThink: (returnObj, thinkText) => {
                    clearThinkingUpdateInterval()

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = 0

                    this.workingMessages.AggregateDraftDialogDto.draftOptions = [
                        ...this.generators.PreProcessingFunctionsGenerator.preservedDraftOptions,
                        {
                            boundedContext: returnObj.inputParams.boundedContext.name,
                            boundedContextAlias: returnObj.inputParams.boundedContext.displayName,
                            description: returnObj.inputParams.description,
                            options: [],
                            conclusions: "",
                            defaultOptionIndex: null,
                            analysisResult: {
                                inference: thinkText
                            }
                        }
                    ]
                },

                onModelCreatedWithThinking: (returnObj) => {
                    clearThinkingUpdateInterval()
                    if(!returnObj.modelValue.analysisResult ||
                       !returnObj.modelValue.analysisResult.inference ||
                       !returnObj.modelValue.analysisResult.inference.length) return


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
                    clearThinkingUpdateInterval()
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                        directMessage: returnObj.directMessage,
                        progress: 100
                    }

                    this.generators.DraftGeneratorByFunctions.generate(JSON.stringify(returnObj.modelValue.output), returnObj.inputParams.boundedContext, returnObj.modelValue.analysisResult)
                },

                onRetry: (returnObj) => {
                    clearThinkingUpdateInterval()
                    alert(`[!] An error occurred while analysing your requirements, please try again..\n* Error log \n${returnObj.errorMessage}`)
                }
            })
            this.generators.PreProcessingFunctionsGenerator.buildInitialInputs = (selectedStructureOption) => {
                const getDescription = (requirements) => {
                    if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
                        return "Requirements have not been specified."
                    }
                    let markdownOutput = "# Requirements\n\n"
                    requirements.forEach((req) => {
                        markdownOutput += `## ${req.type}\n\n${req.text}\n\n`
                    })
                    return markdownOutput.trim();
                }

                const passedGeneratorInputs = selectedStructureOption.boundedContexts.map(bc => ({
                    boundedContext: {
                        name: bc.name,
                        alias: bc.alias,
                        displayName: bc.alias,
                        description: getDescription(bc.requirements),
                        aggregates: bc.aggregates
                    },
                    description: getDescription(bc.requirements)
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
                            enumerations: [],
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
                onSend: (input, stopCallback) => {
                    this.workingMessages.AggregateDraftDialogDto.isShow = true
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos = {
                        leftBoundedContextCount: this.generators.PreProcessingFunctionsGenerator.inputs.length + 1,
                        directMessage: "",
                        progress: null
                    }
                    this.workingMessages.AggregateDraftDialogDto.actions.stop = stopCallback
                    createThinkingUpdateInterval(0, input.subjectText)
                },

                onFirstResponse: (returnObj) => {
                    clearThinkingUpdateInterval()
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

                onThink: (returnObj, thinkText) => {
                    clearThinkingUpdateInterval()

                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.directMessage = returnObj.directMessage
                    this.workingMessages.AggregateDraftDialogDto.draftUIInfos.progress = 0

                    this.workingMessages.AggregateDraftDialogDto.draftOptions = [
                        ...this.generators.PreProcessingFunctionsGenerator.preservedDraftOptions,
                        {
                            boundedContext: returnObj.inputParams.boundedContext.name,
                            boundedContextAlias: returnObj.inputParams.boundedContext.displayName,
                            description: returnObj.inputParams.description,
                            options: [],
                            conclusions: "",
                            defaultOptionIndex: null,
                            analysisResult: returnObj.inputParams.analysisResult,
                            inference: thinkText
                        }
                    ]
                },

                onModelCreatedWithThinking: (returnObj) => {
                    clearThinkingUpdateInterval()
                    if(!returnObj.modelValue.inference ||
                       !returnObj.modelValue.inference.length) return

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
                            returnObj.inputParams.analysisResult,
                            returnObj.modelValue.inference
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
                            returnObj.inputParams.analysisResult,
                            returnObj.modelValue.inference
                        )
                    ]
                },

                onGenerationSucceeded: (returnObj) => {
                    clearThinkingUpdateInterval()
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
                    if(!this.generators.PreProcessingFunctionsGenerator.generateIfInputsExist()){
                        this.$emit("update:aggregateDrafts", this.messages)
                        return
                    }
                },

                onRetry: (returnObj) => {
                    clearThinkingUpdateInterval()
                    alert(`[!] There was an error creating your draft, please try again.\n* Error log \n${returnObj.errorMessage}`)
                }
            })
            this.generators.DraftGeneratorByFunctions.generate = (structuredDescription, boundedContext, analysisResult) => {
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
                    AIModelSelectMessageIsTyping: true,
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

                showTestValidationButton: false,
                currentXML: '',

                options: {
                    keyboard: { bindTo: window },
                    height: '100%',
                    width: '100%',
                    canvas:{
                        drdPadding: 50
                    }
                },

                requirementsAnalysis: null,
                done: false,
                generator: null,
                generatorName: null,
                showBCGenerationOption: false,
                resultDevideBoundedContext: {},
                selectedAspect: "",

                activeTab: null,
                generatorInputTabs: ['UserStory'
                                        // , 'DDL', "Process"
                                    ],
                inputDDL: '',
                processImage: null,
                processImagePreview: null,
                pendingBCGeneration: false,

                textChunker: null,
                chunks: [],
                currentChunkIndex: 0,
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

                processAnalysisResult: null,
                isAnalyzing: false,

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

                collectedMockDatas: {
                    aggregateDraftScenarios: {
                    }
                }
            }
        },
        methods: {
            initESDialoger(){
                if(!this.projectInfo.draft) return;
                this.messages = this.projectInfo.draft;
            },
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
            },

            onReceived(content){
                if(this.state.generator === "EventOnlyESGenerator"){
                    if(!this.value){
                        this.value = {
                            userStory: ''
                        }
                    }

                    if(content && content.length > 0)
                        this.value.userStory = content;
                }
            },

            onModelCreated(model){
            },

            async onGenerationFinished(model){
                var me = this;
                me.done = true;

                if(me.state.generator === "RequirementsValidationGenerator"){
                    console.log(JSON.stringify(model));
                    me.requirementsAnalysis = model;
                }

                if (me.state.generator === "RecursiveRequirementsSummarizer") {
                    me.generator.handleGenerationFinished(model);
                    return;
                }

                if(this.state.generator === "DevideBoundedContextGenerator"){
                    me.devisionAspectIndex = 0;
                    me.isGeneratingBoundedContext = false;
                    
                    // 현재 메시지의 result를 깊은 복사로 가져옴
                    const currentMessage = me.messages[me.messages.length-1];
                    const newResult = JSON.parse(JSON.stringify(currentMessage.result || {}));
                    
                    // 새로운 모델을 해당 aspect에 할당
                    if (Object.keys(newResult).length > 0) {
                        // 기존 결과가 있는 경우 새로운 선택지로 추가
                        const baseKey = Object.keys(newResult)[0].split('_')[0];
                        const choiceCount = Object.keys(newResult).length;
                        const newKey = `${baseKey}_choice${choiceCount + 1}`;
                        newResult[newKey] = model;
                    } else {
                        // 첫 번째 결과인 경우
                        newResult[model.devisionAspect] = model;
                    }
                    
                    // 메시지 상태 업데이트
                    me.updateMessageState(currentMessage.uniqueId, {
                        result: newResult,
                        isGeneratingBoundedContext: me.isGeneratingBoundedContext,
                        isStartMapping: me.isStartMapping,
                        processingRate: me.processingRate,
                        currentProcessingBoundedContext: me.currentProcessingBoundedContext
                    });

                    me.resultDevideBoundedContext = JSON.parse(JSON.stringify(newResult));
                    me.$emit("update:boundedContextDrafts", me.messages);
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

            generateUserStory(){
                if(!this.value){
                    this.value = {
                        userStory: ''
                    }
                    this.generate();
                } else {
                    this.done = true;
                }
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

            reGenerateWithFeedback(obj){
                const targetMessage = this.messages.find(msg => msg.uniqueId === obj.messageId);
                if (!targetMessage) return;

                // 피드백 기반 재생성 시작
                this.isGeneratingBoundedContext = true;
                this.isStartMapping = false;
                this.processingRate = 0;
                this.currentProcessingBoundedContext = '';

                // 기존 메시지의 상태 업데이트
                this.updateMessageState(obj.messageId, {
                    isGeneratingBoundedContext: this.isGeneratingBoundedContext,
                    isStartMapping: this.isStartMapping,
                    processingRate: this.processingRate,
                    currentProcessingBoundedContext: this.currentProcessingBoundedContext
                });

                // 생성기 설정 및 실행
                this.generator = new DevideBoundedContextGenerator(this);
                this.state.generator = "DevideBoundedContextGenerator";
                this.generatorName = "DevideBoundedContextGenerator";
                
                this.input.devisionAspect = targetMessage.selectedAspect;
                this.input.previousAspectModel = targetMessage.result;
                this.input.feedback = obj.feedback;
                this.generator.generate();
            },

            setGenerateOption(option, isNewChoice) {
                this.selectedAspect = option.selectedAspects.join('+');
                this.bcGenerationOption = option;

                if (isNewChoice && this.messages.length > 0) {
                    // 마지막 boundedContextResult 메시지 찾기
                    const lastBCResultIndex = [...this.messages].reverse().findIndex(msg => 
                        msg.type === "boundedContextResult"
                    );
                    
                    if (lastBCResultIndex !== -1) {
                        const messageIndex = this.messages.length - 1 - lastBCResultIndex;
                        const targetMessage = this.messages[messageIndex];
                        
                        // 기존 메시지를 사용하여 새로운 선택지 생성
                        this.isGeneratingBoundedContext = true;
                        this.updateMessageState(targetMessage.uniqueId, {
                            isGeneratingBoundedContext: this.isGeneratingBoundedContext
                        });

                        this.generator = new DevideBoundedContextGenerator(this);
                        this.state.generator = "DevideBoundedContextGenerator";
                        this.generatorName = "DevideBoundedContextGenerator";

                        this.devisionAspectIndex = 0;
                        this.input['devisionAspect'] = this.selectedAspect;
                        this.input['generateOption'] = this.bcGenerationOption;
                        this.input['requirements'] = {
                            userStory: this.value.userStory,
                            summarizedResult: this.summarizedResult,
                            ddl: this.inputDDL
                        };

                        this.generator.generate();
                        return;
                    }
                }

                // 첫 번째 생성이거나 기존 메시지를 찾지 못한 경우 새 메시지 생성
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
                if (this.value.userStory.length > 30000 && this.summarizedResult.length == 0) {
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
                this.collectedMockDatas.aggregateDraftScenarios.selectedStructureOption = structuredClone(selectedStructureOption)

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
                this.collectedMockDatas.aggregateDraftScenarios.draftOptions = structuredClone(draftOptions)
                this.collectedMockDatas.aggregateDraftScenarios.userStory = this.value.userStory
                this.collectedMockDatas.aggregateDraftScenarios.state = structuredClone(this.state)
                this.collectedMockDatas.aggregateDraftScenarios.messages = structuredClone(
                    this.messages.map(message => ({
                        ...message,
                        actions: undefined
                    }))
                )
                console.log("[*] 시나리오별 테스트를 위한 Mock 데이터 구축 완료", {collectedMockDatas: this.collectedMockDatas.aggregateDraftScenarios})

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

                    console.log("[*] 생성 준비를 위한 입력값 구축과정에서 에러 발생", {error: e, state: this.state})

                    if(e.name=="QuotaExceededError"){
                        let keys = Object.keys(localStorage);

                        for (let i = 0; i < keys.length; i++) {
                            let key = keys[i];
                            if(key.includes('image_')) {
                                localStorage.removeItem(key);
                            }
                        }

                        this.generateFromAggregateDrafts(draftOptions)
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
                        result: result || {}, // 빈 객체로 초기화하여 생성 중 표시가 보이도록 함
                        isStartMapping: this.isStartMapping,
                        isGeneratingBoundedContext: true, // 새 메시지 생성 시 true로 설정
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

            testValidation(){
                this.currentXML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="시작">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    
    <bpmn:task id="Task_1" name="주문 접수">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    
    <bpmn:task id="Task_2" name="결제 처리">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    
    <bpmn:endEvent id="EndEvent_1" name="종료">
      <bpmn:incoming>Flow_3</bpmn:incoming>
    </bpmn:endEvent>
    
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="EndEvent_1" />
  </bpmn:process>
  
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="159" y="145" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      
      <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2">
        <dc:Bounds x="400" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="562" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="569" y="145" width="22" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="400" y="120" />
      </bpmndi:BPMNEdge>
      
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="500" y="120" />
        <di:waypoint x="562" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

                this.generator = new RequirementsValidationGenerator(this);
                this.state.generator = "RequirementsValidationGenerator";
                this.generatorName = "RequirementsValidationGenerator";

                this.input['requirements'] = {
                    userStory: this.value.userStory,
                    ddl: this.inputDDL
                };

                this.generator.generate();
            },

            handleKeyPress(event) {
                if (event.ctrlKey && event.key === 't') {
                    event.preventDefault(); // Prevent default browser behavior
                    this.showTestValidationButton = !this.showTestValidationButton;
                }
            },
        }
    }
</script>

<style scoped>
.requirements-analysis-card {
    background-color: #f8f9fa;
}

.requirements-analysis-title {
    background-color: #e9ecef;
    font-size: 1.2em;
}

.missing-elements-section,
.recommendations-section,
.processes-section,
.value-streams-section,
.interactions-section {
    margin-bottom: 20px;
}

h3 {
    color: #2c3e50;
    margin-bottom: 15px;
}

h4 {
    color: #495057;
    margin: 10px 0;
}

.process-details {
    padding: 10px;
}

.sub-processes {
    margin-left: 15px;
}
</style>
