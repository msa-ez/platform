<template>
    <v-card>
        <component 
            :is="currentHeaderComponent"
            :isGenerateButtonDisabled="isGenerateButtonDisabled"
            :boundedContextVersion="boundedContextVersion"
            :isStandardTransformed="isStandardTransformed"
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
                <div v-if="!isTransforming" class="mt-4 pl-4 pr-4">
                    <CoTToggle :inference="activeContext.inference" :isStandardTransformed="isStandardTransformed"/>
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
                        :showDetailedAttributes="getDetailedAttributesState(activeContext.boundedContext, index)"
                        :isStandardTransformed="isStandardTransformed"
                        @onCardSelected="selectedCard"
                        @update:showDetailedAttributes="updateDetailedAttributesState(activeContext.boundedContext, index, $event)"
                    ></AggregateDraftOptionCard>
                </v-card>

                <div v-if="activeContext.conclusions" class="mt-4 pl-4 pr-4">
                    <h4>{{ $t('ModelDraftDialogForDistribution.conclusions') }}</h4>
                    <p>{{ activeContext.conclusions }}</p>
                </div>
                
                <!-- 표준 변환 매핑 테이블 -->
                <div v-if="isStandardTransformed && activeContext && getGroupedTransformationMappings(activeContext.boundedContext).length > 0" 
                     class="mt-4 pl-4 pr-4">
                    <h4>{{ $t('ModelDraftDialogForDistribution.standardTransformedMappings') }}</h4>
                    <v-expansion-panels accordion class="transformation-mapping-panels">
                        <v-expansion-panel 
                            v-for="(group, index) in getGroupedTransformationMappings(activeContext.boundedContext)" 
                            :key="index"
                        >
                            <v-expansion-panel-header>
                                <div class="d-flex align-center">
                                    <span class="font-weight-bold mr-2">{{ group.aggregate.original }}</span>
                                    <v-icon small class="mr-2">arrow_forward</v-icon>
                                    <span class="font-weight-bold text-primary">{{ group.aggregate.transformed }}</span>
                                    <v-spacer></v-spacer>
                                    <v-chip x-small class="mr-2" v-if="group.totalCount > 1">
                                        {{ group.totalCount - 1 }}개 하위 항목
                                    </v-chip>
                                </div>
                            </v-expansion-panel-header>
                            <v-expansion-panel-content>
                                <v-simple-table dense class="transformation-mapping-table">
                                    <thead>
                                        <tr>
                                            <th class="text-left" style="width: 150px;">유형</th>
                                            <th class="text-left" style="width: 200px;">변환 전</th>
                                            <th class="text-left" style="width: 200px;">변환 후</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, itemIndex) in group.items" :key="`${group.aggregate.original}-${itemIndex}`" @click.stop>
                                            <td>{{ item.type }}</td>
                                            <td>{{ item.original }}</td>
                                            <td @click.stop>
                                                <div v-if="item.isEditing" class="d-flex align-center">
                                                    <v-text-field
                                                        :value="editingState[item.editKey] && editingState[item.editKey].editValue"
                                                        @input="updateEditValue(item.editKey, $event)"
                                                        dense
                                                        hide-details
                                                        autofocus
                                                        @blur="saveEditValue(activeContext.boundedContext, group.aggregate.original, group.aggregate.alias, item, itemIndex)"
                                                        @keyup.enter="saveEditValue(activeContext.boundedContext, group.aggregate.original, group.aggregate.alias, item, itemIndex)"
                                                        @keyup.esc="cancelEdit(item)"
                                                        class="mr-2"
                                                    ></v-text-field>
                                                    <v-btn icon x-small @click="saveEditValue(activeContext.boundedContext, group.aggregate.original, group.aggregate.alias, item, itemIndex)">
                                                        <v-icon small>check</v-icon>
                                                    </v-btn>
                                                    <v-btn icon x-small @click="cancelEdit(item)">
                                                        <v-icon small>close</v-icon>
                                                    </v-btn>
                                                </div>
                                                <div v-else @mousedown.stop.prevent @click.stop.prevent="startEdit(item, $event)" class="transformed-value-cell" style="cursor: pointer; min-height: 24px; padding: 4px 8px; user-select: none; position: relative; z-index: 1;">
                                                    <v-icon x-small class="ml-1 mr-2" style="opacity: 0.5;">edit</v-icon>
                                                    <strong v-if="item.transformed && item.transformed !== '-'">{{ item.transformed }}</strong>
                                                    <span v-else class="text--secondary">-</span>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr v-if="group.items.length === 1">
                                            <td colspan="3" class="text-center text--secondary">
                                                하위 항목 없음
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-simple-table>
                            </v-expansion-panel-content>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </div>
            </div>

                <component 
                :is="currentFooterComponent"
                :isGenerateButtonDisabled="isGenerateButtonDisabled"
                :draftOptions="draftOptions"
                :activeTab="activeTab"
                :feedback="feedback"
                :isEditable="isEditable"
                :isTransforming="isTransforming"
                :isStandardTransformed="isStandardTransformed"
                @generateFromDraft="generateFromDraft"
                @feedbackFromDraft="feedbackFromDraft"
                @retry="retry"
                @transformWithStandards="transformWithStandards"
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
        ESDialogerFooter
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
            },
            isTransforming: {
                type: Boolean,
                default: () => false,
                required: false
            },
            isStandardTransformed: {
                type: Boolean,
                default: false,
                required: false
            },
            transformationMappings: {
                type: Object,
                default: () => ({}),
                required: false
            }
        },
        data() {
            return {
                activeTab: null,
                selectedOptionItem: {},
                selectedCardIndex: {},
                selectedCardKey: 0,
                feedback: '',
                detailedAttributesState: {}, // 각 bounded context별 세부 속성 보기 상태 관리
                editingState: {} // 편집 상태 관리: key는 "boundedContext_aggregate_type_original"
                // 예: "CustomerOrder_Customer_Field_customer_id" -> { isEditing: true, editValue: "..." }
            }
        },
        watch: {
            draftOptions: {
                handler(newVal) {
                    this.updateSelectionByDraftOptions(newVal)
                    this.$nextTick(() => {
                        this.selectedCardKey++
                    })
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
                // 표준 전환이 완료되면 버튼 활성화
                if (this.isStandardTransformed) {
                    return !this.isGeneratorButtonEnabled || (!this.selectedOptionItem || Object.keys(this.selectedOptionItem).length !== this.draftOptions.length)
                }
                // 표준 전환 전에는 기존 로직 유지
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
                this.updateSelectionByDraftOptions(this.draftOptions)
                
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
                // 표준 전환 중일 때는 선택 변경 불가
                if (this.isTransforming) {
                    return;
                }
                
                this.selectedCardIndex[key] = index
                this.selectedOptionItem[key] = option
                this.selectedCardKey ++
                
                // messageUniqueId 포함하여 emit (어떤 메시지인지 구분)
                this.$emit('updateSelectedOptionItem', this.selectedOptionItem, this.messageUniqueId)
            },

            getBoundedContextDisplayName(boundedContextInfo) {
                return (boundedContextInfo.boundedContextAlias) ? boundedContextInfo.boundedContextAlias : (boundedContextInfo.boundedContext.charAt(0).toUpperCase() + boundedContextInfo.boundedContext.slice(1))
            },
            
            getTransformationMappingsForBC(boundedContext) {
                if (!this.transformationMappings || !this.transformationMappings[boundedContext]) {
                    return [];
                }
                
                const mappings = this.transformationMappings[boundedContext];
                const result = [];
                
                // Aggregates
                if (mappings.aggregates && Array.isArray(mappings.aggregates)) {
                    mappings.aggregates.forEach(function(mapping) {
                        result.push({
                            type: 'Aggregate',
                            original: mapping.original,
                            transformed: mapping.transformed,
                            aggregate: '-',
                            alias: mapping.alias || ''
                        });
                    });
                }
                
                // Enumerations
                if (mappings.enumerations && Array.isArray(mappings.enumerations)) {
                    mappings.enumerations.forEach(function(mapping) {
                        result.push({
                            type: 'Enumeration',
                            original: mapping.original,
                            transformed: mapping.transformed,
                            aggregate: mapping.aggregate || '-'
                        });
                    });
                }
                
                // ValueObjects
                if (mappings.valueObjects && Array.isArray(mappings.valueObjects)) {
                    mappings.valueObjects.forEach(function(mapping) {
                        result.push({
                            type: 'ValueObject',
                            original: mapping.original,
                            transformed: mapping.transformed,
                            aggregate: mapping.aggregate || '-'
                        });
                    });
                }
                
                // Fields
                if (mappings.fields && Array.isArray(mappings.fields)) {
                    mappings.fields.forEach(function(mapping) {
                        result.push({
                            type: 'Field',
                            original: mapping.original,
                            transformed: mapping.transformed,
                            aggregate: mapping.aggregate || '-',
                            alias: mapping.alias || ''
                        });
                    });
                }
                
                return result;
            },
            
            getGroupedTransformationMappings(boundedContext) {
                if (!this.transformationMappings || !this.transformationMappings[boundedContext]) {
                    return [];
                }
                
                const mappings = this.transformationMappings[boundedContext];
                const groups = [];
                
                // Aggregate별로 그룹화
                if (mappings.aggregates && Array.isArray(mappings.aggregates)) {
                    mappings.aggregates.forEach((aggMapping) => {
                        const group = {
                            aggregate: {
                                original: aggMapping.original,
                                transformed: aggMapping.transformed || '-',
                                alias: aggMapping.alias || ''
                            },
                            items: [],
                            totalCount: 0
                        };
                        
                        // Aggregate 자체를 첫 번째 항목으로 추가
                        const aggKey = `${boundedContext}_${aggMapping.original}_Aggregate_${aggMapping.original}`;
                        const aggEditState = this.editingState[aggKey] || { isEditing: false, editValue: '' };
                        group.items.push({
                            type: 'Aggregate',
                            original: aggMapping.original,
                            transformed: aggMapping.transformed || '-',
                            isEditing: aggEditState.isEditing,
                            editValue: aggEditState.editValue,
                            editKey: aggKey
                        });
                        
                        // 해당 Aggregate에 속한 Enumerations (전환되지 않은 것도 포함)
                        if (mappings.enumerations && Array.isArray(mappings.enumerations)) {
                            mappings.enumerations.forEach((enumMapping) => {
                                if (enumMapping.aggregate === aggMapping.original) {
                                    const enumKey = `${boundedContext}_${aggMapping.original}_Enumeration_${enumMapping.original}`;
                                    const enumEditState = this.editingState[enumKey] || { isEditing: false, editValue: '' };
                                    group.items.push({
                                        type: 'Enumeration',
                                        original: enumMapping.original,
                                        transformed: enumMapping.transformed || '-',
                                        alias: enumMapping.alias || '',
                                        isEditing: enumEditState.isEditing,
                                        editValue: enumEditState.editValue,
                                        editKey: enumKey
                                    });
                                }
                            });
                        }
                        
                        // 해당 Aggregate에 속한 ValueObjects (전환되지 않은 것도 포함)
                        if (mappings.valueObjects && Array.isArray(mappings.valueObjects)) {
                            mappings.valueObjects.forEach((voMapping) => {
                                if (voMapping.aggregate === aggMapping.original) {
                                    const voKey = `${boundedContext}_${aggMapping.original}_ValueObject_${voMapping.original}`;
                                    const voEditState = this.editingState[voKey] || { isEditing: false, editValue: '' };
                                    group.items.push({
                                        type: 'ValueObject',
                                        original: voMapping.original,
                                        transformed: voMapping.transformed || '-',
                                        alias: voMapping.alias || '',
                                        isEditing: voEditState.isEditing,
                                        editValue: voEditState.editValue,
                                        editKey: voKey
                                    });
                                }
                            });
                        }
                        
                        // 해당 Aggregate에 속한 Fields (전환되지 않은 것도 포함)
                        if (mappings.fields && Array.isArray(mappings.fields)) {
                            mappings.fields.forEach((fieldMapping) => {
                                if (fieldMapping.aggregate === aggMapping.original) {
                                    const fieldKey = `${boundedContext}_${aggMapping.original}_Field_${fieldMapping.original}`;
                                    const fieldEditState = this.editingState[fieldKey] || { isEditing: false, editValue: '' };
                                    group.items.push({
                                        type: 'Field',
                                        original: fieldMapping.original,
                                        transformed: fieldMapping.transformed || '-',
                                        alias: fieldMapping.alias || '',
                                        fieldAlias: fieldMapping.alias || '', // Field는 fieldAlias로도 접근 가능하도록
                                        isEditing: fieldEditState.isEditing,
                                        editValue: fieldEditState.editValue,
                                        editKey: fieldKey
                                    });
                                }
                            });
                        }
                        
                        group.totalCount = group.items.length;
                        groups.push(group);
                    });
                }
                
                return groups;
            },

            updateSelectionByDraftOptions(draftOptions) {
                // 표준 전환 중일 때는 선택 변경 불가
                if (this.isTransforming) {
                    return;
                }
                
                if(draftOptions && draftOptions.length > 0) {

                    // console.log("[~] updateSelectionByDraftOptions", structuredClone(draftOptions))

                    draftOptions.map(option => {  
                        if(!option.boundedContext || option.defaultOptionIndex == null) return
                        
                        if(this.selectedCardIndex[option.boundedContext] == null)
                            this.selectedCardIndex[option.boundedContext] = option.defaultOptionIndex
                        if(this.selectedCardIndex[option.boundedContext] >= option.options.length)
                            this.selectedCardIndex[option.boundedContext] = option.options.length - 1

                        const selectedOption = JSON.parse(JSON.stringify(option.options[this.selectedCardIndex[option.boundedContext]]));
                        
                        // 표준 변환된 경우: boundedContext 정보를 객체 형태로 추가 (원본 구조와 동일하게)
                        if (this.isStandardTransformed) {
                            selectedOption.boundedContext = {
                                aggregates: selectedOption.structure ? 
                                    selectedOption.structure.map(s => ({
                                        alias: (s.aggregate && s.aggregate.alias) || '',
                                        name: (s.aggregate && s.aggregate.name) || ''
                                    })) : [],
                                alias: option.boundedContextAlias || option.boundedContext,
                                description: option.description || '',
                                displayName: option.boundedContextAlias || option.boundedContext,
                                name: option.boundedContext,
                                requirements: {
                                    ddl: '',
                                    description: option.description || '',
                                    event: option.description || '',
                                    eventNames: '',
                                    traceMap: {},
                                    userStory: ''
                                }
                            };
                            
                            // inference와 conclusions도 최상위에 추가
                            selectedOption.inference = option.inference || '';
                            selectedOption.conclusions = option.conclusions || '';
                        }
                        
                        this.selectedOptionItem[option.boundedContext] = selectedOption;
                    })

                    // console.log("[~] updateSelectionByDraftOptions", structuredClone(this.selectedCardIndex), structuredClone(this.selectedOptionItem))

                    // messageUniqueId 포함하여 emit (어떤 메시지인지 구분)
                    this.$emit('updateSelectedOptionItem', this.selectedOptionItem, this.messageUniqueId)
                }
            },
            getDetailedAttributesState(boundedContext, optionIndex) {
                const key = `${boundedContext}_${optionIndex}`;
                return this.detailedAttributesState[key] || false;
            },
            updateDetailedAttributesState(boundedContext, optionIndex, value) {
                const key = `${boundedContext}_${optionIndex}`;
                this.$set(this.detailedAttributesState, key, value);
            },
            transformWithStandards(boundedContextInfo) {
                this.$emit('transformWithStandards', boundedContextInfo, this.draftOptions, this.messageUniqueId);
            },
            
            startEdit(item, event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (!item || !item.editKey) {
                    console.warn('startEdit: item is null or editKey is missing', item);
                    return;
                }
                const transformedValue = item.transformed && item.transformed !== '-' ? item.transformed : '';
                // editingState를 통해 편집 상태 관리
                this.$set(this.editingState, item.editKey, {
                    isEditing: true,
                    editValue: transformedValue
                });
            },
            
            cancelEdit(item) {
                if (!item || !item.editKey) {
                    return;
                }
                this.$set(this.editingState, item.editKey, {
                    isEditing: false,
                    editValue: ''
                });
            },
            
            updateEditValue(editKey, value) {
                if (!this.editingState[editKey]) {
                    this.$set(this.editingState, editKey, {
                        isEditing: true,
                        editValue: value
                    });
                } else {
                    this.$set(this.editingState[editKey], 'editValue', value);
                }
            },
            
            saveEditValue(boundedContext, aggregateOriginal, aggregateAlias, item, itemIndex) {
                if (!item || !item.editKey) {
                    return;
                }
                const editState = this.editingState[item.editKey];
                if (!editState) {
                    return;
                }
                const newValue = editState.editValue || '';
                this.cancelEdit(item);
                if (newValue.trim()) {
                    // alias 전달 (Field의 경우 fieldAlias 사용)
                    const itemAlias = item.alias || item.fieldAlias || '';
                    this.updateTransformedValue(boundedContext, aggregateOriginal, aggregateAlias, item.type, item.original, newValue, itemAlias);
                }
            },
            
            updateTransformedValue(boundedContext, aggregateOriginal, aggregateAlias, itemType, itemOriginal, newValue, itemAlias = '') {
                if (!newValue || !newValue.trim()) {
                    return; // 빈 값은 무시
                }
                
                const trimmedValue = newValue.trim();
                
                // transformationMappings 업데이트
                if (!this.transformationMappings[boundedContext]) {
                    this.$set(this.transformationMappings, boundedContext, {
                        aggregates: [],
                        enumerations: [],
                        valueObjects: [],
                        fields: []
                    });
                }
                
                const mappings = this.transformationMappings[boundedContext];
                
                // 매핑 업데이트 (없으면 생성)
                if (itemType === 'Aggregate') {
                    let aggMapping = mappings.aggregates.find(m => m.original === itemOriginal);
                    if (!aggMapping) {
                        aggMapping = {
                            original: itemOriginal,
                            transformed: null,
                            alias: ''
                        };
                        mappings.aggregates.push(aggMapping);
                    }
                    this.$set(aggMapping, 'transformed', trimmedValue);
                } else if (itemType === 'Enumeration') {
                    let enumMapping = mappings.enumerations.find(m => 
                        m.original === itemOriginal && m.aggregate === aggregateOriginal
                    );
                    if (!enumMapping) {
                        enumMapping = {
                            original: itemOriginal,
                            transformed: null,
                            aggregate: aggregateOriginal
                        };
                        mappings.enumerations.push(enumMapping);
                    }
                    this.$set(enumMapping, 'transformed', trimmedValue);
                } else if (itemType === 'ValueObject') {
                    let voMapping = mappings.valueObjects.find(m => 
                        m.original === itemOriginal && m.aggregate === aggregateOriginal
                    );
                    if (!voMapping) {
                        voMapping = {
                            original: itemOriginal,
                            transformed: null,
                            aggregate: aggregateOriginal
                        };
                        mappings.valueObjects.push(voMapping);
                    }
                    this.$set(voMapping, 'transformed', trimmedValue);
                } else if (itemType === 'Field') {
                    let fieldMapping = mappings.fields.find(m => 
                        m.original === itemOriginal && m.aggregate === aggregateOriginal
                    );
                    if (!fieldMapping) {
                        fieldMapping = {
                            original: itemOriginal,
                            transformed: null,
                            aggregate: aggregateOriginal,
                            alias: ''
                        };
                        mappings.fields.push(fieldMapping);
                    }
                    this.$set(fieldMapping, 'transformed', trimmedValue);
                }
                
                // 실제 draftOptions의 모든 옵션의 structure 업데이트
                const draftOption = this.draftOptions.find(opt => opt.boundedContext === boundedContext);
                if (!draftOption || !draftOption.options || draftOption.options.length === 0) {
                    return;
                }
                
                // 모든 옵션의 structure를 업데이트
                draftOption.options.forEach(option => {
                    if (!option.structure) {
                        return;
                    }
                    
                    // alias로 먼저 찾기 (가장 확실함 - 변환 전후 동일)
                    let structureItem = null;
                    if (aggregateAlias) {
                        structureItem = option.structure.find(item => 
                            item.aggregate && item.aggregate.alias === aggregateAlias
                        );
                    }
                    
                    // alias로 못 찾으면 transformationMappings에서 변환된 이름으로 찾기
                    if (!structureItem) {
                        const aggMapping = mappings.aggregates.find(m => m.original === aggregateOriginal);
                        if (aggMapping && aggMapping.transformed) {
                            structureItem = option.structure.find(item => 
                                item.aggregate && item.aggregate.name === aggMapping.transformed
                            );
                        }
                    }
                    
                    // 그래도 못 찾으면 aggregateOriginal로 찾기 (변환되지 않은 경우)
                    if (!structureItem) {
                        structureItem = option.structure.find(item => 
                            item.aggregate && item.aggregate.name === aggregateOriginal
                        );
                    }
                    
                    if (!structureItem) {
                        return;
                    }
                    
                    // 실제 데이터 업데이트
                    if (itemType === 'Aggregate') {
                        if (structureItem.aggregate) {
                            this.$set(structureItem.aggregate, 'name', trimmedValue);
                        }
                    } else if (itemType === 'Enumeration') {
                        // transformationMappings를 역으로 조회: structure의 각 enum을 확인하면서
                        // original이 itemOriginal과 일치하는 매핑을 찾기
                        let enumItem = null;
                        
                        if (structureItem.enumerations) {
                            // 1. alias로 찾기 (가장 확실함)
                            if (itemAlias) {
                                enumItem = structureItem.enumerations.find(e => e.alias === itemAlias);
                            }
                            
                            // 2. alias로 못 찾으면, structure의 각 enum을 순회하면서
                            // transformationMappings에서 original이 itemOriginal과 일치하는지 확인
                            if (!enumItem) {
                                for (const enumInStructure of structureItem.enumerations) {
                                    const enumMapping = mappings.enumerations.find(m => 
                                        (m.original === itemOriginal || m.transformed === enumInStructure.name) && 
                                        m.aggregate === aggregateOriginal
                                    );
                                    if (enumMapping) {
                                        enumItem = enumInStructure;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (enumItem) {
                            this.$set(enumItem, 'name', trimmedValue);
                        }
                    } else if (itemType === 'ValueObject') {
                        // transformationMappings를 역으로 조회
                        let voItem = null;
                        
                        if (structureItem.valueObjects) {
                            // 1. alias로 찾기
                            if (itemAlias) {
                                voItem = structureItem.valueObjects.find(vo => vo.alias === itemAlias);
                            }
                            
                            // 2. alias로 못 찾으면, structure의 각 VO를 순회하면서
                            // transformationMappings에서 original이 itemOriginal과 일치하는지 확인
                            if (!voItem) {
                                for (const voInStructure of structureItem.valueObjects) {
                                    const voMapping = mappings.valueObjects.find(m => 
                                        (m.original === itemOriginal || m.transformed === voInStructure.name) && 
                                        m.aggregate === aggregateOriginal
                                    );
                                    if (voMapping) {
                                        voItem = voInStructure;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (voItem) {
                            this.$set(voItem, 'name', trimmedValue);
                        }
                    } else if (itemType === 'Field') {
                        // transformationMappings를 역으로 조회
                        let previewAttr = null;
                        let ddlField = null;
                        
                        // 1. fieldAlias로 찾기 (가장 확실함)
                        if (itemAlias) {
                            if (structureItem.previewAttributes) {
                                previewAttr = structureItem.previewAttributes.find(attr => attr.fieldAlias === itemAlias);
                            }
                            if (!previewAttr && structureItem.ddlFields) {
                                ddlField = structureItem.ddlFields.find(field => field.fieldAlias === itemAlias);
                            }
                        }
                        
                        // 2. fieldAlias로 못 찾으면, structure의 각 field를 순회하면서
                        // transformationMappings에서 original이 itemOriginal과 일치하는지 확인
                        if (!previewAttr && !ddlField) {
                            if (structureItem.previewAttributes) {
                                for (const attrInStructure of structureItem.previewAttributes) {
                                    const fieldMapping = mappings.fields.find(m => 
                                        (m.original === itemOriginal || m.transformed === attrInStructure.fieldName) && 
                                        m.aggregate === aggregateOriginal
                                    );
                                    if (fieldMapping) {
                                        previewAttr = attrInStructure;
                                        break;
                                    }
                                }
                            }
                            if (!previewAttr && structureItem.ddlFields) {
                                for (const fieldInStructure of structureItem.ddlFields) {
                                    const fieldMapping = mappings.fields.find(m => 
                                        (m.original === itemOriginal || m.transformed === fieldInStructure.fieldName) && 
                                        m.aggregate === aggregateOriginal
                                    );
                                    if (fieldMapping) {
                                        ddlField = fieldInStructure;
                                        break;
                                    }
                                }
                            }
                        }
                        
                        if (previewAttr) {
                            this.$set(previewAttr, 'fieldName', trimmedValue);
                        }
                        if (ddlField) {
                            this.$set(ddlField, 'fieldName', trimmedValue);
                        }
                    }
                });
                
                // selectedOptionItem도 업데이트 (모든 타입에 대해)
                const selectedOption = this.selectedOptionItem[boundedContext];
                if (selectedOption && selectedOption.structure) {
                    // alias로 먼저 찾기 (가장 확실함 - 변환 전후 동일)
                    let structureItem = null;
                    let aggMapping = null;
                    
                    if (aggregateAlias) {
                        structureItem = selectedOption.structure.find(item => 
                            item.aggregate && item.aggregate.alias === aggregateAlias
                        );
                    }
                    
                    // alias로 못 찾으면 transformationMappings에서 변환된 이름으로 찾기
                    if (!structureItem) {
                        aggMapping = mappings.aggregates.find(m => m.original === aggregateOriginal);
                        if (aggMapping && aggMapping.transformed) {
                            structureItem = selectedOption.structure.find(item => 
                                item.aggregate && item.aggregate.name === aggMapping.transformed
                            );
                        }
                    } else {
                        // 이미 찾았으면 매핑 정보도 가져오기
                        aggMapping = mappings.aggregates.find(m => m.original === aggregateOriginal);
                    }
                    
                    // 그래도 못 찾으면 aggregateOriginal로 찾기 (변환되지 않은 경우)
                    if (!structureItem) {
                        structureItem = selectedOption.structure.find(item => 
                            item.aggregate && item.aggregate.name === aggregateOriginal
                        );
                        if (!aggMapping) {
                            aggMapping = mappings.aggregates.find(m => m.original === aggregateOriginal);
                        }
                    }
                    
                    if (structureItem) {
                        // draftOptions에서 업데이트한 것과 동일한 로직으로 selectedOptionItem도 업데이트
                        if (itemType === 'Aggregate') {
                            if (structureItem.aggregate) {
                                this.$set(structureItem.aggregate, 'name', trimmedValue);
                                
                                // selectedOptionItem.boundedContext.aggregates 배열도 업데이트
                                if (selectedOption.boundedContext && selectedOption.boundedContext.aggregates) {
                                    const aggInBoundedContext = selectedOption.boundedContext.aggregates.find(agg => 
                                        agg.name === aggregateOriginal || agg.name === (aggMapping && aggMapping.transformed)
                                    );
                                    if (aggInBoundedContext) {
                                        this.$set(aggInBoundedContext, 'name', trimmedValue);
                                    }
                                }
                            }
                        } else if (itemType === 'Enumeration') {
                            let enumItem = null;
                            if (structureItem.enumerations) {
                                if (itemAlias) {
                                    enumItem = structureItem.enumerations.find(e => e.alias === itemAlias);
                                }
                                if (!enumItem) {
                                    for (const enumInStructure of structureItem.enumerations) {
                                        const enumMapping = mappings.enumerations.find(m => 
                                            (m.original === itemOriginal || m.transformed === enumInStructure.name) && 
                                            m.aggregate === aggregateOriginal
                                        );
                                        if (enumMapping) {
                                            enumItem = enumInStructure;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (enumItem) {
                                this.$set(enumItem, 'name', trimmedValue);
                            }
                        } else if (itemType === 'ValueObject') {
                            let voItem = null;
                            if (structureItem.valueObjects) {
                                if (itemAlias) {
                                    voItem = structureItem.valueObjects.find(vo => vo.alias === itemAlias);
                                }
                                if (!voItem) {
                                    for (const voInStructure of structureItem.valueObjects) {
                                        const voMapping = mappings.valueObjects.find(m => 
                                            (m.original === itemOriginal || m.transformed === voInStructure.name) && 
                                            m.aggregate === aggregateOriginal
                                        );
                                        if (voMapping) {
                                            voItem = voInStructure;
                                            break;
                                        }
                                    }
                                }
                            }
                            if (voItem) {
                                this.$set(voItem, 'name', trimmedValue);
                            }
                        } else if (itemType === 'Field') {
                            let previewAttr = null;
                            let ddlField = null;
                            
                            if (itemAlias) {
                                if (structureItem.previewAttributes) {
                                    previewAttr = structureItem.previewAttributes.find(attr => attr.fieldAlias === itemAlias);
                                }
                                if (!previewAttr && structureItem.ddlFields) {
                                    ddlField = structureItem.ddlFields.find(field => field.fieldAlias === itemAlias);
                                }
                            }
                            
                            if (!previewAttr && !ddlField) {
                                if (structureItem.previewAttributes) {
                                    for (const attrInStructure of structureItem.previewAttributes) {
                                        const fieldMapping = mappings.fields.find(m => 
                                            (m.original === itemOriginal || m.transformed === attrInStructure.fieldName) && 
                                            m.aggregate === aggregateOriginal
                                        );
                                        if (fieldMapping) {
                                            previewAttr = attrInStructure;
                                            break;
                                        }
                                    }
                                }
                                if (!previewAttr && structureItem.ddlFields) {
                                    for (const fieldInStructure of structureItem.ddlFields) {
                                        const fieldMapping = mappings.fields.find(m => 
                                            (m.original === itemOriginal || m.transformed === fieldInStructure.fieldName) && 
                                            m.aggregate === aggregateOriginal
                                        );
                                        if (fieldMapping) {
                                            ddlField = fieldInStructure;
                                            break;
                                        }
                                    }
                                }
                            }
                            
                            if (previewAttr) {
                                this.$set(previewAttr, 'fieldName', trimmedValue);
                            }
                            if (ddlField) {
                                this.$set(ddlField, 'fieldName', trimmedValue);
                            }
                        }
                    }
                }
                
                // 변경사항을 부모 컴포넌트에 알림
                this.$emit('updateSelectedOptionItem', this.selectedOptionItem, this.messageUniqueId);
                
                // draftOptions 변경사항도 부모에 알림 (deep copy로 변경된 값 전달)
                // prop은 직접 수정할 수 없으므로 deep copy를 만들어서 emit
                const updatedDraftOptions = JSON.parse(JSON.stringify(this.draftOptions));
                this.$emit('updateDraftOptions', updatedDraftOptions, this.messageUniqueId);
            }
        }
    }
</script>