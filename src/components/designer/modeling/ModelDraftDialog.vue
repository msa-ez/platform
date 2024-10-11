<template>
    <v-card>
        <v-card-title>BoundedContext Reconstruction Draft</v-card-title>
        <v-card-subtitle>
            <v-progress-circular v-if="!DDLDraftTable || defaultGeneratorUiInputData.numberRemainingDDLs>0" color="primary" indeterminate ></v-progress-circular>
            <div v-if="defaultGeneratorUiInputData.numberRemainingDDLs > 0">
                <p>{{ defaultGeneratorUiInputData.numberRemainingDDLs }} DDLs remaining...</p>
            </div>
        </v-card-subtitle>
        <v-card-text v-if="DDLDraftTable && Object.keys(DDLDraftTable).length > 0">
            <div v-for="(table, boundedContext) in DDLDraftTable" :key="boundedContext">
                <div class="d-flex align-center mb-2">
                    <h3>{{ boundedContext }}</h3>
                    <v-btn @click="reGenerate(table)"
                        v-if="defaultGeneratorUiInputData.numberRemainingDDLs === 0"
                        icon small
                        v-on="on"
                        style="margin-right: 5px; z-index:2"
                        class="gs-es-auto-modling-btn"
                    >
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </div>
                <v-data-table
                    :headers="table.headers"
                    :items="table.items"
                    :items-per-page="5"
                    item-key="option"
                    show-select
                    single-select
                    v-model="selectedOptionItem[boundedContext]"
                    @item-selected="onOptionSelected(boundedContext, $event)"
                    class="elevation-1 mb-4"
                    :hide-default-footer="true"
                >
                    <template v-slot:item.data-table-select="{ item, isSelected }">
                        <v-checkbox
                            v-if="!item.isConclusion"
                            :input-value="isSelected"
                            :true-value="item"
                            :false-value="null"
                            @change="selectOptionItem(boundedContext, item, $event)"
                        ></v-checkbox>
                    </template>
                    <template v-slot:item.aggregates="{ item }">
                        <div v-if="item.isConclusion">{{ item.aggregates }}</div>
                        <div v-else>
                            <div v-for="(aggregate, index) in parseAggregates(item.aggregates)" :key="index" class="mb-2">
                                <strong>{{ aggregate.name }}</strong>
                                <div class="ml-3">
                                    <div v-if="aggregate.entities.length">
                                        Entities: {{ aggregate.entities.join(', ') }}
                                    </div>
                                    <div v-if="aggregate.valueObjects.length">
                                        Value Objects: {{ aggregate.valueObjects.join(', ') }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </v-data-table>
                <v-textarea 
                    :value="DDLDraftTable[boundedContext].scenario" 
                    @input="updateScenario(boundedContext, $event)" 
                    :label="`${boundedContext} Business Scenario`"
                    :placeholder="`입력이 없을 경우, CRUD 기능을 수행하는 시나리오를 자동으로 생성합니다.`"
                    :rows="3"
                ></v-textarea><br><br>
            </div>

            <v-btn v-if="defaultGeneratorUiInputData.numberRemainingDDLs === 0" @click="generateFromDraft"
                :disabled="!selectedOptionItem || Object.keys(selectedOptionItem).length !== Object.keys(DDLDraftTable).length"
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
            }
        },
        data() {
            return {
                selectedOptionItem: {},
            }
        },
        methods: {
            reGenerate(boundedContext){
                this.$emit('reGenerate', boundedContext);
            },
            onOptionSelected(boundedContext, { item, value }) {
                if(this.DDLDraftTable[boundedContext].ddl){
                    item['ddl'] = this.DDLDraftTable[boundedContext].ddl
                }

                if (value) {
                    this.$set(this.selectedOptionItem, boundedContext, [item]);
                } else {
                    this.$set(this.selectedOptionItem, boundedContext, []);
                }
            },

            selectOptionItem(boundedContext, item, isSelected) {
                if(this.DDLDraftTable[boundedContext].ddl){
                    item['ddl'] = this.DDLDraftTable[boundedContext].ddl
                }

                if (isSelected) {
                    this.$set(this.selectedOptionItem, boundedContext, [item]);
                } else {
                    this.$set(this.selectedOptionItem, boundedContext, []);
                }
            },

            generateFromDraft(){
                this.$emit('generateFromDraft', this.selectedOptionItem);
            },

            updateScenario(boundedContext, value) {
                if (!this.DDLDraftTable[boundedContext].hasOwnProperty('scenario')) {
                    this.$set(this.DDLDraftTable[boundedContext], 'scenario', value);
                } else {
                    this.DDLDraftTable[boundedContext].scenario = value;
                }
            },

            parseAggregates(aggregatesString) {
                return aggregatesString.split('/').map(aggregate => {
                    const [name, details] = aggregate.split('(');
                    const entitiesMatch = details.match(/Entities: ([^)]+)/);
                    const valueObjectsMatch = details.match(/ValueObjects: ([^)]+)/);
                    
                    let entities = entitiesMatch ? entitiesMatch[1].split(',').map(e => e.trim()) : [];
                    let valueObjects = valueObjectsMatch ? valueObjectsMatch[1].split(',').map(vo => vo.trim()) : [];
                    
                    // Remove duplicates
                    valueObjects = [...new Set(valueObjects)];
                    
                    // Remove ValueObjects from entities
                    entities = entities.filter(entity => !valueObjects.includes(entity));
                    
                    // Additional step: Remove any remaining ValueObjects from entities
                    entities = entities.filter(entity => !entity.includes('ValueObjects:'));
                    
                    return {
                        name: name.trim(),
                        entities: entities,
                        valueObjects: valueObjects
                    };
                });
            },
        }
    }
</script>