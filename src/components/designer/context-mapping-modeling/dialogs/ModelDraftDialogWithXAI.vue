<template>
    <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('ModelDraftDialogForDistribution.reconstructionAggregateDraft') }}</span>
            <div class="d-flex align-center">
                <v-btn @click="retry()" 
                    text 
                    icon 
                    class="pa-0 mr-2"
                    :disabled="draftUIInfos.leftBoundedContextCount > 0"
                >
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
                <v-btn @click="close()" text icon class="pa-0">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </v-card-title>

        <v-card-subtitle>
            <div class="d-flex align-center">
                <v-progress-circular
                    v-if="draftUIInfos.leftBoundedContextCount > 0"
                    :value="draftUIInfos.progress"
                    :indeterminate="draftUIInfos.progress === null"
                    color="primary"
                    size="20"
                    :width="3"
                    class="mr-3"
                ></v-progress-circular>

                <div v-if="draftUIInfos.leftBoundedContextCount > 0" 
                    class="text-body-2"
                >
                    <template v-if="draftUIInfos.directMessage">
                        <span>{{ draftUIInfos.directMessage }}</span>
                    </template>
                    <template v-else>
                        <span>
                            <strong>{{ draftUIInfos.leftBoundedContextCount }}</strong> Bounded Contexts remaining...
                        </span>
                    </template>
                </div>
            </div>
        </v-card-subtitle>

        <v-card-text v-if="draftOptions && draftOptions.length > 0"
            class="pa-0"
        >
            <v-tabs v-model="activeTab" class="model-draft-dialog-tab">
                <v-tab v-for="(boundedContextInfo, index) in draftOptions" :key="index" style="text-transform: none;">
                    {{ (boundedContextInfo.boundedContextAlias) ? boundedContextInfo.boundedContextAlias : (boundedContextInfo.boundedContext.charAt(0).toUpperCase() + boundedContextInfo.boundedContext.slice(1)) }}<br>
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab"
                class="model-draft-dialog-tab-items"
            >
                <v-tab-item v-for="(boundedContextInfo, index) in draftOptions" :key="index">
                    <v-row class="ma-0 pa-0">
                        <v-col v-for="(option, index) in boundedContextInfo.options" 
                            :key="selectedCardKey"
                            class="ma-0 pa-4 pr-4"
                        >
                            <v-card
                                @click="selectedCard(index, option, boundedContextInfo.boundedContext)"
                                :class="isSelectedCard(boundedContextInfo, index) ? 'model-draft-dialog-selected-card': ''"
                                :disabled="!isGeneratorButtonEnabled || draftUIInfos.leftBoundedContextCount > 0 || (!selectedOptionItem || Object.keys(selectedOptionItem).length !== draftOptions.length)"
                            >
                                <v-card-title class="d-flex justify-space-between align-center pa-4 option-title">
                                    <div class="d-flex align-center">
                                        <v-chip
                                            color="primary"
                                            small
                                            class="mr-2"
                                        >
                                            OPTION {{ index + 1 }}
                                        </v-chip>
                                        <v-chip
                                            v-if="option.isAIRecommended"
                                            color="info"
                                            x-small
                                            class="mr-2"
                                        >
                                            <v-icon x-small left>mdi-robot</v-icon>
                                            AI 추천
                                        </v-chip>
                                    </div>
                                    <v-chip
                                        v-if="isSelectedCard(boundedContextInfo, index)"
                                        color="success"
                                        x-small
                                        label
                                    >
                                        선택됨
                                    </v-chip>
                                </v-card-title>
                                <v-card-text class="pa-0">
                                    <div v-if="option.structure" class="mb-4">
                                        <v-row class="ma-0 pa-0">
                                            <v-col v-for="(aggregate, index) in option.structure" :key="index"  
                                                class="pa-2 ma-2 rounded-lg draft-aggregate-box d-inline-block"
                                            >
                                                <div class="d-flex flex-column mb-2">
                                                    <span style="margin-bottom:-5px;">&lt;&lt; Aggregate Root &gt;&gt;</span>
                                                    <strong>{{ aggregate.aggregate.alias }}</strong>
                                                </div>
                                                <div>
                                                    <div v-if="aggregate.entities.length > 0" class="mb-2">
                                                        <span>&lt;&lt; Entities &gt;&gt;</span>
                                                        <div v-for="(entity, index) in aggregate.entities" :key="index"
                                                            class="draft-aggregate-box-text"
                                                        >{{ entity.alias }}</div>
                                                    </div>
                                                    <div v-if="aggregate.valueObjects.length > 0">
                                                        <span>&lt;&lt; Value Objects &gt;&gt;</span> 
                                                        <div v-for="(valueObject, index) in aggregate.valueObjects" :key="index"
                                                            class="draft-aggregate-box-text">
                                                            {{ valueObject.alias }}
                                                            <v-chip
                                                                v-if="valueObject.referencedAggregate"
                                                                x-small
                                                                class="ml-2"
                                                                color="info"
                                                                outlined
                                                            >
                                                                <v-icon x-small left>mdi-link-variant</v-icon>
                                                                {{ valueObject.referencedAggregate.alias }}
                                                            </v-chip>
                                                        </div>
                                                    </div>
                                                </div>
                                            </v-col>
                                        </v-row>
                                    </div>
                                    <div class="pl-4 pr-4 pb-4">
                                        <h4>{{ $t('ModelDraftDialogForDistribution.pros') }}</h4>
                                        <v-simple-table dense class="analysis-table">
                                            <tbody>
                                                <tr v-for="(value, key) in option.pros" :key="`pros-${key}`">
                                                    <td class="analysis-key text-capitalize">{{ key }}</td>
                                                    <td class="analysis-value">{{ value }}</td>
                                                </tr>
                                            </tbody>
                                        </v-simple-table>

                                        <h4 class="mt-4">{{ $t('ModelDraftDialogForDistribution.cons') }}</h4>
                                        <v-simple-table dense class="analysis-table">
                                            <tbody>
                                                <tr v-for="(value, key) in option.cons" :key="`cons-${key}`">
                                                    <td class="analysis-key text-capitalize">{{ key }}</td>
                                                    <td class="analysis-value">{{ value }}</td>
                                                </tr>
                                            </tbody>
                                        </v-simple-table>
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                    <div class="mt-4 pl-4 pr-4">
                        <h4>{{ $t('ModelDraftDialogForDistribution.conclusions') }}</h4>
                        <p>{{ boundedContextInfo.conclusions }}</p>
                    </div>
                </v-tab-item>
            </v-tabs-items>

            <v-row class="ma-0 pa-4">
                <v-btn @click="generateFromDraft"
                    :disabled="!isGeneratorButtonEnabled || draftUIInfos.leftBoundedContextCount > 0 || (!selectedOptionItem || Object.keys(selectedOptionItem).length !== draftOptions.length)"
                    block
                    color="primary"
                >{{ $t('ModelDraftDialogForDistribution.create') }}
                </v-btn>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'model-draft-dialog-with-xai',
        props: {
            draftOptions: {
                type: Array,
                default: () => ([]),
                required: false
            },

            draftUIInfos: {
                type: Object,
                default: () => ({}),
                required: false
            },

            isGeneratorButtonEnabled: {
                type: Boolean,
                default: true,
                required: false
            }
        },
        data() {
            return {
                activeTab: null,
                selectedOptionItem: {},
                selectedCardIndex: {},
                selectedCardKey: 0
            }
        },
        watch: {
            draftOptions: {
                handler(newVal) {
                    if(newVal.length === 0) return
                    if(newVal.length === Object.keys(this.selectedCardIndex).length) return

                    Object.keys(this.selectedCardIndex).forEach(key => {
                        if(!newVal.some(option => option.boundedContext === key)) {
                            delete this.selectedCardIndex[key];
                        }
                    });
                    Object.keys(this.selectedOptionItem).forEach(key => {
                        if(!newVal.some(option => option.boundedContext === key)) {
                            delete this.selectedOptionItem[key];
                        }
                    });

                    
                    const lastDraftOption = newVal[newVal.length - 1]
                    this.activeTab = newVal.length - 1

                    this.selectedCardIndex[lastDraftOption.boundedContext] = lastDraftOption.defaultOptionIndex
                    this.selectedOptionItem[lastDraftOption.boundedContext] = lastDraftOption.options[lastDraftOption.defaultOptionIndex]
                },
                deep: true
            }
        },
        computed: {
            isSelectedCard() {
                return (boundedContextInfo, index) => {
                    return this.selectedCardIndex.hasOwnProperty(boundedContextInfo.boundedContext) && 
                           this.selectedCardIndex[boundedContextInfo.boundedContext] === index
                }
            }
        },
        methods: {
            generateFromDraft(){
                this.$emit('generateFromDraft', this.selectedOptionItem);                
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
            }
        }
    }
</script>

<style scoped>
.analysis-table {
    background-color: transparent !important;
}
.analysis-table ::v-deep .v-data-table__wrapper {
    overflow-x: hidden;
}
.analysis-table ::v-deep table {
    width: 100%;
    border-spacing: 0;
}
.analysis-table ::v-deep tbody tr:hover {
    background-color: transparent !important;
}
.analysis-key {
    color: var(--v-primary-base);
    font-weight: 500;
    font-size: 0.9rem;
    width: 120px;
    vertical-align: top;
    padding: 4px 8px 4px 0 !important;
}
.analysis-value {
    font-size: 0.9rem;
    line-height: 1.4;
    padding: 4px 0 !important;
}
</style>