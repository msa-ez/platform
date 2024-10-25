<template>
    <v-card>
        <v-card-title>BoundedContext Reconstruction Draft</v-card-title>
        <v-card-subtitle>
            <div class="d-flex align-center">
                <div v-if="draftUIInfos.leftBoundedContextCount > 0">
                    <p class="mb-0">{{ draftUIInfos.leftBoundedContextCount }} Bounded Contexts remaining...</p>
                </div>
                <v-progress-circular
                    v-if="draftUIInfos.leftBoundedContextCount > 0"
                    color="primary"
                    indeterminate
                    size="24"
                    class="ml-2"
                ></v-progress-circular>
            </div>
        </v-card-subtitle>

        <v-card-text v-if="DDLDraftOptions && DDLDraftOptions.length > 0">
            <v-tabs v-model="activeTab">
                <v-tab v-for="(boundedContextInfo, index) in DDLDraftOptions" :key="index">
                {{ boundedContextInfo.boundedContext }}<br>
                </v-tab>
            </v-tabs>

            <v-tabs-items v-model="activeTab">
                <v-tab-item v-for="(boundedContextInfo, index) in DDLDraftOptions" :key="index">
                    <div class="d-flex align-center mb-2">
                        <h3>Bounded Context: {{ boundedContextInfo.boundedContext }}</h3>
                    </div>

                    <v-radio-group v-model="selectedOptionItem[boundedContextInfo.boundedContext]">
                        <v-card v-for="(option, index) in boundedContextInfo.options" :key="index" class="mb-4">
                            <v-card-title class="d-flex justify-space-between">
                                <span>Option {{ index + 1 }}</span>
                                <v-radio :value="option"></v-radio>
                            </v-card-title>
                            <v-card-text>
                                <div v-if="option.structure">
                                    <div v-for="(aggregate, index) in option.structure" :key="index">
                                        <strong>{{ aggregate.aggregateName }}</strong>
                                        <div class="ml-3">
                                            <div v-if="aggregate.entities.length > 0"><span class="font-weight-medium">Entities:</span> {{ aggregate.entities.join(', ') }}</div>
                                            <div v-if="aggregate.valueObjects.length > 0"><span class="font-weight-medium">ValueObjects:</span> {{ aggregate.valueObjects.join(', ') }}</div>
                                        </div><br>
                                    </div>
                                </div>
                                <h4>Pros:</h4>
                                <p>{{ option.pros }}</p>

                                <h4>Cons:</h4>
                                <p>{{ option.cons }}</p>
                            </v-card-text>
                        </v-card>
                    </v-radio-group>
                    
                    <h4 class="mt-4">Conclusions:</h4>
                    <p>{{ boundedContextInfo.conclusions }}</p>
                </v-tab-item>
            </v-tabs-items>

            <v-btn @click="generateFromDraft"
                :disabled="!isGeneratorButtonEnabled || draftUIInfos.leftBoundedContextCount > 0 || (!selectedOptionItem || Object.keys(selectedOptionItem).length !== DDLDraftOptions.length)"
                block>Generate From Draft</v-btn>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'model-draft-dialog-for-distribution',
        props: {
            DDLDraftOptions: {
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
                selectedOptionItem: {}
            }
        },
        watch: {
            DDLDraftOptions: {
                handler(newVal) {
                    if(newVal.length === 0) return

                    const lastDraftOption = newVal[newVal.length - 1]
                    this.activeTab = newVal.length - 1
                    this.selectedOptionItem[lastDraftOption.boundedContext] = lastDraftOption.options[lastDraftOption.defaultOptionIndex]
                },
                deep: true
            }
        },
        methods: {
            generateFromDraft(){
                this.$emit('generateFromDraft', this.selectedOptionItem);                
            }
        }
    }
</script>