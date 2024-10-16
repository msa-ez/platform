<template>
    <v-card>
        <v-card-title>BoundedContext Reconstruction Draft</v-card-title>
        <v-card-subtitle>
            <div class="d-flex align-center">
                <div v-if="defaultGeneratorUiInputData.numberRemainingDDLs > 0">
                    <p class="mb-0">{{ defaultGeneratorUiInputData.numberRemainingDDLs }} DDLs remaining...</p>
                </div>
                <div v-if="defaultGeneratorUiInputData.reGenerate">
                    <p class="mb-0">{{ defaultGeneratorUiInputData.boundedContextLists }} Re-generating...</p>
                </div>
                <v-progress-circular
                    v-if="(!DDLDraftTable || defaultGeneratorUiInputData.numberRemainingDDLs > 0) || defaultGeneratorUiInputData.reGenerate"
                    color="primary"
                    indeterminate
                    size="24"
                    class="ml-2"
                ></v-progress-circular>
            </div>
        </v-card-subtitle>

        <v-card-text v-if="DDLDraftTable && Object.keys(DDLDraftTable).length > 0">
        <v-tabs v-model="activeTab">
            <v-tab v-for="(table, boundedContext) in DDLDraftTable" :key="boundedContext">
            {{ boundedContext }}<br>
            </v-tab>
        </v-tabs>

        <v-tabs-items v-model="activeTab">
            <v-tab-item v-for="(table, boundedContext) in DDLDraftTable" :key="boundedContext">
                <div class="d-flex align-center mb-2">
                    <h3>Bounded Context: {{ boundedContext }}</h3>
                    <v-btn @click="reGenerate(table, boundedContext)"
                        v-if="defaultGeneratorUiInputData.numberRemainingDDLs === 0 && !defaultGeneratorUiInputData.reGenerate"
                        icon small
                        style="margin-left: 10px; z-index:2"
                        class="gs-es-auto-modling-btn"
                    >
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>
                    <v-card v-for="(recommendation, index) in table.recommendations" :key="index" class="mb-4">
                        <v-card-title class="d-flex justify-space-between">
                            <span>Option {{ recommendation.option }}</span>
                            <v-checkbox
                                :input-value="isSelected(boundedContext, recommendation)"
                                @change="selectOptionItem(boundedContext, recommendation, $event)"
                            ></v-checkbox>
                        </v-card-title>
                        <v-card-text>
                            <div v-if="recommendation.aggregates">
                                <div v-for="(aggregate, name) in parseAggregates(recommendation.aggregates)" :key="name">
                                    <strong>{{ name }}</strong>
                                    <div class="ml-3">
                                        <div v-if="aggregate.entities.length > 0"><span class="font-weight-medium">Entities:</span> {{ aggregate.entities.join(', ') }}</div>
                                        <div v-if="aggregate.valueObjects.length > 0"><span class="font-weight-medium">ValueObjects:</span> {{ aggregate.valueObjects.join(', ') }}</div>
                                    </div><br>
                                </div>
                            </div>
                            <h4>Pros:</h4>
                            <p>{{ recommendation.pros }}</p>

                            <h4>Cons:</h4>
                            <p>{{ recommendation.cons }}</p>
                        </v-card-text>
                    </v-card>
                <h4 class="mt-4">Conclusions:</h4>
                <p>{{ table.conclusions }}</p>
                <!-- <v-textarea 
                    :value="table.scenario" 
                    @input="updateScenario(boundedContext, $event)" 
                    :label="`${boundedContext} Business Scenario`"
                    :placeholder="`입력이 없을 경우, CRUD 기능을 수행하는 시나리오를 자동으로 생성합니다.`"
                    :rows="3"
                ></v-textarea><br><br> -->
            </v-tab-item>
        </v-tabs-items>

        <v-btn v-if="defaultGeneratorUiInputData.numberRemainingDDLs === 0" @click="generateFromDraft"
                :disabled="!isGeneratorButtonEnabled || (!selectedOptionItem || Object.keys(selectedOptionItem).length !== Object.keys(DDLDraftTable).length)"
                block>Generate From Draft</v-btn>
        </v-card-text>
    </v-card>
</template>

<script>
    export default {
        name: 'model-draft-dialog',
        props: {
            DDLDraftTable: {
                type: Object,
                default: () => ({}),
                required: false
            },
            defaultGeneratorUiInputData: {
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
                selectedOptionItem: {},
                activeTab: null
            }
        },
        methods: {
            reGenerate(table, boundedContext){
            this.$emit('reGenerate', table, boundedContext);
            },
            isSelected(boundedContext, recommendation) {
                return this.selectedOptionItem[boundedContext] && 
                    this.selectedOptionItem[boundedContext][0] === recommendation;
            },
            selectOptionItem(boundedContext, recommendation, isSelected) {
                if (isSelected) {
                    this.$set(this.selectedOptionItem, boundedContext, [recommendation]);
                } else {
                    this.$delete(this.selectedOptionItem, boundedContext);
                }
            },
            updateScenario(boundedContext, value) {
                if (!this.DDLDraftTable[boundedContext].hasOwnProperty('scenario')) {
                    this.$set(this.DDLDraftTable[boundedContext], 'scenario', value);
                } else {
                    this.DDLDraftTable[boundedContext].scenario = value;
                }
            },
            generateFromDraft(){
                this._updateMissedInfos();
                this.$emit('generateFromDraft', this.selectedOptionItem);
            },
            parseAggregates(aggregatesString) {
                if (!aggregatesString) {
                    return {};
                }
                const aggregates = {};
                const lines = aggregatesString.split('|||'); // '|||'로 구분된 aggregate들을 분리

                lines.forEach(line => {
                    const parts = line.split('/');
                    if (parts.length < 2) return;

                    const [name, ...rest] = parts;
                    const aggregateName = name.trim();
                    
                    if (!aggregates[aggregateName]) {
                    aggregates[aggregateName] = { entities: [], valueObjects: [] };
                    }

                    rest.forEach(part => {
                    const [entityType, entityList] = part.split(':').map(s => s.trim());
                    const entities = entityList.split(',').map(e => e.trim());

                    if (entityType.toLowerCase() === 'entities') {
                        aggregates[aggregateName].entities = entities;
                    } else if (entityType.toLowerCase() === 'valueobjects') {
                        aggregates[aggregateName].valueObjects = entities;
                    }
                    });
                });

                return aggregates;
            },
            _updateMissedInfos(){
                for(const boundedContext of Object.keys(this.selectedOptionItem)){
                    if(this.DDLDraftTable[boundedContext].ddl)
                        this.selectedOptionItem[boundedContext][0].ddl = this.DDLDraftTable[boundedContext].ddl;
                    if(this.DDLDraftTable[boundedContext].scenario)
                        this.selectedOptionItem[boundedContext][0].scenario = this.DDLDraftTable[boundedContext].scenario;
                }
            }
        }
    }
</script>