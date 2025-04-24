<template>
    <v-card>
        <component 
            :is="currentHeaderComponent"
            :isGenerateButtonDisabled="isGenerateButtonDisabled"
            :boundedContextVersion="boundedContextVersion"
            @retry="retry"
            @close="close"
        />

        <v-card-subtitle>
            <ProgressInfo
                :progress="draftUIInfos.progress"
                :leftBoundedContextCount="draftUIInfos.leftBoundedContextCount"
                :directMessage="draftUIInfos.directMessage"
            />
        </v-card-subtitle>

        <v-card-text v-if="draftOptions && draftOptions.length > 0"
            class="pa-0"
        >
            <v-tabs v-model="activeTab" class="model-draft-dialog-tab">
                <v-tab v-for="(boundedContextInfo, index) in draftOptions" :key="index" style="text-transform: none;">
                    {{ getBoundedContextDisplayName(boundedContextInfo) }}<br>
                </v-tab>
            </v-tabs>

            <div v-if="activeContext">
                <AnalysisResultPanel
                    class="ml-4 mr-4 mt-4"
                    :analysisResult="activeContext.analysisResult"
                />

                <div class="mt-4 pl-4 pr-4">
                    <CoTToggle :inference="activeContext.inference"/>
                </div>

                <v-card v-for="(option, index) in activeContext.options" 
                    :key="`${selectedCardKey}_${index}`"
                    class="ma-0 pa-4"
                    style="width: 100%;"
                >
                    <AggregateDraftOptionCard 
                        class="flex-grow-1"
                        :boundedContextInfo="activeContext"
                        :optionIndex="index"
                        :optionInfo="option"
                        :isSelectedCard="isSelectedCard(activeContext, index)"
                        @onCardSelected="selectedCard"
                    ></AggregateDraftOptionCard>
                </v-card>

                <div v-if="activeContext.conclusions" class="mt-4 pl-4 pr-4">
                    <h4>{{ $t('ModelDraftDialogForDistribution.conclusions') }}</h4>
                    <p>{{ activeContext.conclusions }}</p>
                </div>
            </div>

            <component 
                :is="currentFooterComponent"
                :isGenerateButtonDisabled="isGenerateButtonDisabled"
                :draftOptions="draftOptions"
                :activeTab="activeTab"
                :feedback="feedback"
                :isEditable="isEditable"
                @generateFromDraft="generateFromDraft"
                @feedbackFromDraft="feedbackFromDraft"
                @retry="retry"
            />
        </v-card-text>
    </v-card>
</template>

<script>
    import { 
        AggregateDraftOptionCard,
        EventStormingHeader,
        ESDialogerHeader,
        ProgressInfo,
        EventStormingFooter,
        ESDialogerFooter,
        AnalysisResultPanel
    } from './components'
    import CoTToggle from '../CoTToggle.vue'

    /**
     * @description 
     * Aggregate 모델 초안을 생성하고 관리하기 위한 대화형 UI 컴포넌트입니다.
     * 바운디드 컨텍스트별로 여러 Aggregate 모델 옵션을 제시하고, 사용자가 선택하거나 
     * 피드백을 통해 개선된 모델을 생성할 수 있습니다.
     * 
     * @example 기본 Aggregate 모델 초안 생성 및 선택
     * <AggregateDraftDialog
     *   :draftOptions="draftOptions"
     *   :draftUIInfos="draftUIInfos"
     *   :isGeneratorButtonEnabled="true"
     *   @generateFromDraft="generateFromDraft"
     * />
     * 
     * @example 피드백 기반 모델 재생성
     * <AggregateDraftDialog
     *   :draftOptions="draftOptions"
     *   :draftUIInfos="draftUIInfos"
     *   :isGeneratorButtonEnabled="true"
     *   @feedbackFromDraft="feedbackFromDraft"
     *   @generateFromDraft="generateFromDraft"
     * />
     * 
     * @note
     * - draftOptions: 각 바운디드 컨텍스트별 Aggregate 모델 옵션들을 포함
     *   - structure: Aggregate, Entity, Value Object 구조 정의
     *   - analysis: 일관성, 성능, 도메인 정렬성 등 분석 정보
     *   - pros/cons: 각 옵션의 장단점
     * 
     * - draftUIInfos: UI 상태 정보
     *   - progress: 생성 진행률
     *   - leftBoundedContextCount: 남은 바운디드 컨텍스트 수
     *   - directMessage: 현재 상태 메시지
     * 
     * - Events:
     *   - generateFromDraft: 선택된 옵션으로 최종 모델 생성
     *   - feedbackFromDraft: 특정 바운디드 컨텍스트에 대한 피드백 제공
     *   - retry: 모델 생성 재시도
     *   - close: 다이얼로그 닫기
     * 
     * - 주의사항:
     *   - 모든 바운디드 컨텍스트에 대해 옵션을 선택해야 최종 생성 가능
     *   - 피드백은 개별 바운디드 컨텍스트 단위로 제공
     *   - 재시도 시 이전 진행 상태가 초기화됨
     */
    export default {
        name: 'aggregate-draft-dialog',
        components: {
            AggregateDraftOptionCard,
            EventStormingHeader,
            ESDialogerHeader,
            ProgressInfo,
            EventStormingFooter,
            ESDialogerFooter,
            AnalysisResultPanel,
            CoTToggle
        },
        props: {
            draftOptions: {
                type: Array,
                default: () => ([]),
                required: false
            },

            draftUIInfos: {
                type: Object,
                default: () => ({
                    leftBoundedContextCount: 0,
                    directMessage: '',
                    progress: null
                }),
                required: false
            },

            isGeneratorButtonEnabled: {
                type: Boolean,
                default: true,
                required: false
            },

            uiType: {
                type: String,
                default: 'EventStormingModelCanvas', // ESDialoger | EventStormingModelCanvas
                required: false
            },

            messageUniqueId: {
                type: String,
                default: '',
                required: false
            },

            isEditable: {
                type: Boolean,
                default: () => false,
                required: false
            },

            boundedContextVersion: {
                type: Number,
                default: 1,
                required: false
            }
        },
        data() {
            return {
                activeTab: null,
                selectedOptionItem: {},
                selectedCardIndex: {},
                selectedCardKey: 0,
                feedback: ''
            }
        },
        watch: {
            draftOptions: {
                handler(newVal) {
                    this.updateSelectionByDraftOptions(newVal)
                },
                deep: true
            },
            activeTab: {
                handler() {
                    // 항목 선택 후, 탭 전환시에 Mermaid 그래프가 제대로 렌더링이 안되는 이슈 해결을 위함
                    this.$nextTick(() => {
                        this.selectedCardKey++
                    })
                },
                deep: true
            }
        },
        created() {
            if(this.draftOptions)
                this.updateSelectionByDraftOptions(this.draftOptions)
        },
        computed: {
            isSelectedCard() {
                return (boundedContextInfo, index) => {
                    return this.selectedCardIndex.hasOwnProperty(boundedContextInfo.boundedContext) && 
                           this.selectedCardIndex[boundedContextInfo.boundedContext] === index
                }
            },

            activeContext() {
                return (this.draftOptions && this.draftOptions.length > 0) 
                       ? this.draftOptions[this.activeTab] 
                       : null;
            },

            isGenerateButtonDisabled() {
                return !this.isGeneratorButtonEnabled || this.draftUIInfos.leftBoundedContextCount > 0 || (!this.selectedOptionItem || Object.keys(this.selectedOptionItem).length !== this.draftOptions.length)
            },

            currentHeaderComponent() {
                return this.uiType === 'EventStormingModelCanvas' 
                    ? 'EventStormingHeader' 
                    : 'ESDialogerHeader'
            },

            currentFooterComponent() {
                return this.uiType === 'EventStormingModelCanvas' 
                    ? 'EventStormingFooter' 
                    : 'ESDialogerFooter'
            }
        },
        methods: {
            feedbackFromDraft(boundedContextInfo, feedback, draftOptions){
                this.$emit('feedbackFromDraft', boundedContextInfo, feedback, draftOptions, this.messageUniqueId);
            },

            generateFromDraft(){
                let optionsToReturn = {}
                this.draftOptions.map(option => {
                    optionsToReturn[option.boundedContext] = this.selectedOptionItem[option.boundedContext]
                })
                this.$emit('generateFromDraft', optionsToReturn);                
            },


            close(){
                if(confirm('Are you sure you want to close this dialog? All progress will be lost.')) {
                    this.$emit('onClose');
                }
            },

            retry(){
                if(confirm('Are you sure you want to retry? All progress will be lost.')) {
                    this.$emit('onRetry');
                }
            },


            selectedCard(index, option, key) {
                this.selectedCardIndex[key] = index
                this.selectedOptionItem[key] = option
                this.selectedCardKey ++
            },

            getBoundedContextDisplayName(boundedContextInfo) {
                return (boundedContextInfo.boundedContextAlias) ? boundedContextInfo.boundedContextAlias : (boundedContextInfo.boundedContext.charAt(0).toUpperCase() + boundedContextInfo.boundedContext.slice(1))
            },

            updateSelectionByDraftOptions(draftOptions) {      
                if(draftOptions && draftOptions.length > 0) {
                    draftOptions.map(option => {  
                        if(!option.boundedContext || option.defaultOptionIndex == null) return
                        
                        if(this.selectedCardIndex[option.boundedContext] == null)
                            this.selectedCardIndex[option.boundedContext] = option.defaultOptionIndex
                        if(this.selectedOptionItem[option.boundedContext] == null)
                            this.selectedOptionItem[option.boundedContext] = option.options[option.defaultOptionIndex]                        
                    })

                    this.$emit('updateSelectedOptionItem', this.selectedOptionItem)
                }
            }
        }
    }
</script>