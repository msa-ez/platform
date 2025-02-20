<template>
    <v-card
        class="fill-height"
        :class="isSelectedCard ? 'model-draft-dialog-selected-card': ''"
    >
        <v-card-title 
            :class="{ 'no-pointer': isDisabled }"
            class="d-flex justify-space-between align-center pa-4 option-title pointer"
            @click="handleCardClick"
        >
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
        
        <v-card-text class="pa-0 flex-grow-1 d-flex flex-column">
            <div 
                v-if="optionInfo.structure" 
                :class="{ 'no-pointer': isDisabled }"
                class="mb-4 flex-grow-1 pointer" 
                style="text-align: center;"
                @click="handleCardClick"
            >
                <vue-mermaid-string 
                    :key="mermaidDto.renderKey"
                    :value="mermaidDto.mermaidString"
                />
            </div>

            <div class="pl-4 pr-4 pb-4 mt-auto">
                <div v-if="optionInfo.pros && Object.keys(optionInfo.pros).length > 0" class="text-center">
                    <h4 @click="prosExpanded = !prosExpanded" style="cursor: pointer">
                        {{ $t('ModelDraftDialogForDistribution.pros') }}
                        <v-icon small>
                            {{ prosExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                        </v-icon>
                    </h4>
                    <v-expand-transition>
                        <v-simple-table v-show="prosExpanded" dense class="analysis-table mx-auto">
                            <tbody>
                                <tr v-for="(value, key) in optionInfo.pros" :key="`pros-${key}`">
                                    <td class="analysis-key text-capitalize">{{ key }}</td>
                                    <td class="analysis-value">{{ value }}</td>
                                </tr>
                            </tbody>
                        </v-simple-table>
                    </v-expand-transition>
                </div>

                <div v-if="optionInfo.cons && Object.keys(optionInfo.cons).length > 0" class="text-center">
                    <h4 @click="consExpanded = !consExpanded" style="cursor: pointer">
                        {{ $t('ModelDraftDialogForDistribution.cons') }}
                        <v-icon small>
                            {{ consExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                        </v-icon>
                    </h4>
                    <v-expand-transition>
                        <v-simple-table v-show="consExpanded" dense class="analysis-table mx-auto">
                            <tbody>
                                <tr v-for="(value, key) in optionInfo.cons" :key="`cons-${key}`">
                                    <td class="analysis-key text-capitalize">{{ key }}</td>
                                    <td class="analysis-value">{{ value }}</td>
                                </tr>
                            </tbody>
                        </v-simple-table>
                    </v-expand-transition>
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
                    mermaidString: '',
                    renderKey: 0
                },
                prosExpanded: false,
                consExpanded: false
            }
        },
        watch: {
            optionInfo: {
                deep: true,
                handler(newVal) {
                    this.mermaidDto.mermaidString = this.toMermaidUMLDiagramString(newVal.structure);
                    this.mermaidDto.renderKey++;
                }
            }
        },
        created(){
            this.mermaidDto.mermaidString = this.toMermaidUMLDiagramString(this.optionInfo.structure);
            this.mermaidDto.renderKey++;
        },
        methods: {
            handleCardClick() {
                if (this.isDisabled) return
                this.selectedCard(this.optionIndex, this.optionInfo, this.boundedContextInfo.boundedContext);
            },
            selectedCard(optionIndex, optionInfo, boundedContextName){
                this.$emit('onCardSelected', optionIndex, optionInfo, boundedContextName);
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
                let mermaidString = config + "classDiagram\n";
                if (!structure || !Array.isArray(structure)) {
                    mermaidString += "    class None {\n    }\n";
                    return mermaidString;
                }
                

                const classes = {};
                const addClass = (className, role) => {
                    if (!className) return;
                    if (!classes[className]) {
                        classes[className] = role;
                    } else if(role === "Aggregate Root" && classes[className] !== "Aggregate Root"){
                        classes[className] = role;
                    }
                };

                const getValidAlias = (alias) => {
                    return alias.replace(/[^a-zA-Z0-9가-힣_]/g, '');
                }

                const relationships = new Set();

                structure.forEach(item => {
                    if (item.aggregate && item.aggregate.alias) {
                        const aggregateName = getValidAlias(item.aggregate.alias);
                        addClass(aggregateName, "Aggregate Root");

                        if (Array.isArray(item.enumerations)) {
                            item.enumerations.forEach(enumeration => {
                                if (!enumeration.alias) return;
                                const enumerationName = getValidAlias(enumeration.alias);
                                addClass(enumerationName, "Enumeration");
                                relationships.add(`    ${aggregateName} --> ${enumerationName}`);
                            })
                        }

                        if (Array.isArray(item.valueObjects)) {
                            item.valueObjects.forEach(vo => {
                                if (!vo.alias) return;
                                const voName = getValidAlias(vo.alias);
                                addClass(voName, "Value Object");
                                relationships.add(`    ${aggregateName} --> ${voName}`);

                                if (vo.referencedAggregate && vo.referencedAggregate.alias) {
                                    const refAggName = vo.referencedAggregate.alias;
                                    addClass(refAggName, "Aggregate Root");
                                    relationships.add(`    ${voName} --> ${refAggName}`);
                                }
                            });
                        }
                    }
                });


                let classesStr = "";
                Object.entries(classes).forEach(([className, role]) => {
                    classesStr += `    class ${className} {\n`;
                    classesStr += `        <<${role}>>\n`;
                    classesStr += `    }\n\n`;
                });

                mermaidString += classesStr;
                relationships.forEach(rel => {
                    mermaidString += rel + "\n";
                });

                return mermaidString;
            }
        }
    }
</script>

<style scoped>
.no-pointer {
    pointer-events: none;
    opacity: 0.5;
}
.pointer {
    cursor: pointer;
}
.fill-height {
    height: 100%;
    display: flex;
    flex-direction: column;
}
.v-card-text {
    overflow-y: auto;
}
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