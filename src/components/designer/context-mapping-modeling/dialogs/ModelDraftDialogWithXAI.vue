<template>
    <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ $t('ModelDraftDialogForDistribution.reconstructionDraft') }}</span>
            <v-btn @click="close()" text icon class="pa-0">
                <v-icon>mdi-close</v-icon>
            </v-btn>
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
                {{ boundedContextInfo.boundedContext }}<br>
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab"
                class="model-draft-dialog-tab-items"
            >
                <v-tab-item v-for="(boundedContextInfo, index) in draftOptions" :key="index">
                    <!-- <div class="d-flex align-center mb-2 pl-4 pr-4 pt-4">
                        <h3>Bounded Context: {{ boundedContextInfo.boundedContext }}</h3>
                    </div> -->

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
                                <!-- <v-card-title class="d-flex justify-space-between">
                                    <span>Option {{ index + 1 }}</span>
                                </v-card-title> -->
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
                                                            class="draft-aggregate-box-text"
                                                        >{{ valueObject.alias }}</div>
                                                    </div>
                                                </div>
                                            </v-col>
                                        </v-row>
                                    </div>
                                    <div class="pl-4 pr-4 pb-4">
                                        <h4>{{ $t('ModelDraftDialogForDistribution.pros') }}</h4>
                                        <div>{{ option.pros }}</div><br>

                                        <h4>{{ $t('ModelDraftDialogForDistribution.cons') }}</h4>
                                        <div>{{ option.cons }}</div>
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
                    this.$emit('close');
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