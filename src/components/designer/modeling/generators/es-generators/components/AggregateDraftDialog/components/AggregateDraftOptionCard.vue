<template>
    <v-card
        @click="selectedCard(optionIndex, optionInfo, boundedContextInfo.boundedContext)"
        :class="isSelectedCard ? 'model-draft-dialog-selected-card': ''"
        :disabled="isDisabled"
    >
        <v-card-title class="d-flex justify-space-between align-center pa-4 option-title">
            <div class="d-flex align-center">
                <v-chip
                    color="primary"
                    small
                    class="mr-2"
                >
                    OPTION {{ optionIndex + 1 }}
                </v-chip>
                <v-chip
                    v-if="optionInfo.isAIRecommended"
                    color="info"
                    x-small
                    class="mr-2"
                >
                    <v-icon x-small left>mdi-robot</v-icon>
                    AI 추천
                </v-chip>
            </div>
            <v-chip
                v-if="isSelectedCard"
                color="success"
                x-small
                label
            >
                선택됨
            </v-chip>
        </v-card-title>
        
        <v-card-text class="pa-0">
            <div v-if="optionInfo.structure" class="mb-4">
                <div v-for="(mermaidString, index) in mermaidDto.mermaidStrings" :key="`mermaid-${index}`" style="text-align: center;">
                    <vue-mermaid-string 
                        :key="mermaidDto.renderKey"
                        :value="mermaidString"
                    />
                </div>
            </div>

            <div class="pl-4 pr-4 pb-4">
                <div v-if="optionInfo.pros && Object.keys(optionInfo.pros).length > 0">
                    <h4>{{ $t('ModelDraftDialogForDistribution.pros') }}</h4>
                    <v-simple-table dense class="analysis-table">
                        <tbody>
                            <tr v-for="(value, key) in optionInfo.pros" :key="`pros-${key}`">
                                <td class="analysis-key text-capitalize">{{ key }}</td>
                                <td class="analysis-value">{{ value }}</td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </div>

                <div v-if="optionInfo.cons && Object.keys(optionInfo.cons).length > 0">
                    <h4 class="mt-4">{{ $t('ModelDraftDialogForDistribution.cons') }}</h4>
                    <v-simple-table dense class="analysis-table">
                        <tbody>
                            <tr v-for="(value, key) in optionInfo.cons" :key="`cons-${key}`">
                                <td class="analysis-key text-capitalize">{{ key }}</td>
                                <td class="analysis-value">{{ value }}</td>
                            </tr>
                        </tbody>
                    </v-simple-table>
                </div>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
    import VueMermaidString from 'vue-mermaid-string'

    export default {
        name: 'aggregate-draft-dialog',
        components: {
            VueMermaidString
        },
        props: {
            boundedContextInfo: {
                type: Object,
                default: () => ({}),
                required: false
            },

            optionIndex: {
                type: Number,
                default: 0,
                required: false
            },

            optionInfo: {
                type: Object,
                default: () => ({}),
                required: false
            },

            isSelectedCard: {
                type: Boolean,
                default: false,
                required: false
            },

            isDisabled: {
                type: Boolean,
                default: false,
                required: false
            }
        },
        data(){
            return {
                mermaidDto: {
                    mermaidStrings: '',
                    renderKey: 0
                }
            }
        },
        watch: {
            optionInfo: {
                deep: true,
                handler(newVal) {
                    this.mermaidDto.mermaidStrings = this.toMermaidUMLDiagramStrings(newVal.structure, 2);
                    this.mermaidDto.renderKey++;
                }
            }
        },
        created(){
            this.mermaidDto.mermaidStrings = this.toMermaidUMLDiagramStrings(this.optionInfo.structure, 2);
            this.mermaidDto.renderKey++;
        },
        methods: {
            selectedCard(optionIndex, optionInfo, boundedContextName){
                this.$emit('onCardSelected', optionIndex, optionInfo, boundedContextName);
            },

            toMermaidUMLDiagramStrings(structure, cutLength){
                let mermaidStrings = [];
                for(let i = 0; i < structure.length; i += cutLength){
                    mermaidStrings.push(this.toMermaidUMLDiagramString(structure.slice(i, i + cutLength)));
                }
                return mermaidStrings;
            },

            toMermaidUMLDiagramString(structure){
                const initConfig = {
                    theme: "default",
                    themeVariables: {
                        fontSize: "14px",
                        classFontSize: "14px",
                        classBoxPadding: 10
                    }
                };
                let config = "%%{init: " + JSON.stringify(initConfig) + "}%%\n";
                let diagram = config + "classDiagram\n";
                if (!structure || !Array.isArray(structure)) {
                    diagram += "    class None {\n    }\n";
                    return diagram;
                }

                structure.forEach(item => {
                    if (item.aggregate || (item.entities && item.entities.length > 0) || (item.valueObjects && item.valueObjects.length > 0)) {
                        let className, label;
                        if (item.aggregate) {
                            className = item.aggregate.alias || item.aggregate.name || "UnnamedAggregate";
                        } else {
                            className = "Unnamed";
                        }
                        diagram += `    class ${className} {\n`;
                        diagram += item.aggregate ? `        <<Aggregate>>\n` : `        <<Unspecified>>\n`;
                        
                        if (item.entities && Array.isArray(item.entities) && item.entities.length > 0) {
                            diagram += `        %% Entities\n`;
                            item.entities.forEach(entity => {
                                const entityAlias = entity.alias || entity.name || "UnnamedEntity";
                                const entityName = entity.name || entity.alias || "UnnamedEntity";
                                diagram += `        - ${entityAlias}: ${entityName}\n`;
                            });
                        }
                        
                        if (item.valueObjects && Array.isArray(item.valueObjects) && item.valueObjects.length > 0) {
                            diagram += `        %% ValueObjects\n`;
                            item.valueObjects.forEach(vo => {
                                const voAlias = vo.alias || vo.name || "UnnamedValueObject";
                                const voName = vo.name || vo.alias || "UnnamedValueObject";
                                let fieldLine = `        - ${voAlias}: ${voName}`;
                                // if (vo.referencedAggregate) {
                                //     const refAggAlias = vo.referencedAggregate.alias || vo.referencedAggregate.name || "UnnamedAggregate";
                                //     fieldLine += ` -> ${refAggAlias}`;
                                // }
                                fieldLine += "\n";
                                diagram += fieldLine;
                            });
                        }
                        diagram += "    }\n";
                    } else {
                        diagram += "    class None {\n    }\n";
                    }
                });
                return diagram;
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