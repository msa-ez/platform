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
            </v-data-table>
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
            }
        }
    }
</script>