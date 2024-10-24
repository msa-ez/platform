<template>
    <v-card>
        <v-card-title>BoundedContext Reconstruction Draft</v-card-title>
        <v-card-subtitle>
            <div class="d-flex align-center">
                <div v-if="draftUIInfos.leftBoundedContextCount > 0">
                    <p class="mb-0">{{ draftUIInfos.leftBoundedContextCount }} Bounded Contexts remaining...</p>
                </div>
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

                    <v-card v-for="(option, index) in boundedContextInfo.options" :key="index" class="mb-4">
                        <v-card-title class="d-flex justify-space-between">
                            <span>Option {{ index + 1 }}</span>
                            <v-checkbox
                                :input-value="isSelected(boundedContextInfo.boundedContext, option)"
                                @change="selectOptionItem(boundedContextInfo.boundedContext, option, $event)"
                            ></v-checkbox>
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
        methods: {
            isSelected(boundedContext, option) {
                return this.selectedOptionItem[boundedContext] && 
                    this.selectedOptionItem[boundedContext] === option;
            },

            selectOptionItem(boundedContext, option, isSelected) {
                if (isSelected) {
                    this.$set(this.selectedOptionItem, boundedContext, option);
                } else {
                    this.$delete(this.selectedOptionItem, boundedContext);
                }
            },

            generateFromDraft(){
                this.$emit('generateFromDraft', this.selectedOptionItem);
            }
        }
    }
</script>