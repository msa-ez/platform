<template>
    <v-card
        class="fill-height"
        :class="isSelectedCard ? 'model-draft-dialog-selected-card': ''"
    >
        <v-card-title 
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
                    {{ $t('ModelDraftDialogForDistribution.aiRecommended') }}
                </v-chip>
            </div>
            <v-chip
                v-if="isSelectedCard"
                color="success"
                x-small
                label
            >
                {{ $t('ModelDraftDialogForDistribution.selected') }}
            </v-chip>
        </v-card-title>
        
        <v-card-text class="pa-0 flex-grow-1 d-flex flex-column">
            <!-- 세부 속성 보기 스위치 추가 -->
            <div v-if="optionInfo.structure && hasPreviewAttributes" class="px-4 py-2">
                <v-switch
                    v-model="showDetailedAttributes"
                    :label="$t('ModelDraftDialogForDistribution.showDetailedAttributes')"
                    dense
                    inset
                    hide-details
                    class="mt-0"
                    @change="updateMermaidDiagram"
                ></v-switch>
            </div>

            <div 
                v-if="optionInfo.structure" 
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
                <div v-if="analysisData.length > 0" class="text-center">
                    <h4 @click="analysisExpanded = !analysisExpanded" style="cursor: pointer">
                        {{ $t('ModelDraftDialogForDistribution.pros') }} & {{ $t('ModelDraftDialogForDistribution.cons') }}
                        <v-icon small>
                            {{ analysisExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                        </v-icon>
                    </h4>
                    <v-expand-transition>
                        <v-simple-table v-show="analysisExpanded" dense class="analysis-table mx-auto">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width: 100px;">{{ $t('ModelDraftDialogForDistribution.category') }}</th>
                                    <th class="text-center">{{ $t('ModelDraftDialogForDistribution.pros') }}</th>
                                    <th class="text-center">{{ $t('ModelDraftDialogForDistribution.cons') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item in analysisData" :key="item.key">
                                    <td class="analysis-key text-capitalize">{{ item.key }}</td>
                                    <td class="analysis-value">{{ item.pro }}</td>
                                    <td class="analysis-value">{{ item.con }}</td>
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
            }
        },
        data(){
            return {
                mermaidDto: {
                    mermaidString: '',
                    renderKey: 0
                },
                analysisExpanded: false,
                showDetailedAttributes: false, // 세부 속성 보기 스위치 상태
            }
        },
        computed: {
            analysisData() {
                if (!this.optionInfo || (!this.optionInfo.pros && !this.optionInfo.cons)) {
                    return [];
                }
                const pros = this.optionInfo.pros || {};
                const cons = this.optionInfo.cons || {};
                const allKeys = Array.from(new Set([...Object.keys(pros), ...Object.keys(cons)]));

                return allKeys.map(key => ({
                    key: key,
                    pro: pros[key] || '-',
                    con: cons[key] || '-',
                }));
            },
            hasPreviewAttributes() {
                return this.optionInfo.structure && this.optionInfo.structure.some(item => 
                    item.previewAttributes && Array.isArray(item.previewAttributes) && item.previewAttributes.length > 0
                );
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
                this.selectedCard(this.optionIndex, this.optionInfo, this.boundedContextInfo.boundedContext);
            },
            selectedCard(optionIndex, optionInfo, boundedContextName){
                this.$emit('onCardSelected', optionIndex, optionInfo, boundedContextName);
            },

            toMermaidUMLDiagramString(structure){
                const initConfig = {
                    theme: "default",
                    themeVariables: {
                        fontSize: "14px"
                    }
                };
                let config = "%%{init: " + JSON.stringify(initConfig) + "}%%\n";
                let mermaidString = config + "graph TD\n";
                if (!structure || !Array.isArray(structure)) {
                    mermaidString += "    None[None]\n";
                    return mermaidString;
                }
                
                
                const groups = {}; 
                const relSet = new Set(); 
                
                const getValidAlias = (alias) => {
                    return alias.replace(/[^a-zA-Z0-9가-힣_]/g, '');
                }
                
                const addClassToGroup = (groupKey, classId, label, role, previewAttributes = null) => {
                    if (!groups[groupKey]) {
                        groups[groupKey] = { id: groupKey, label: label, classes: {}, previewAttributes: previewAttributes };
                    }
                    if (!groups[groupKey].classes[classId]) {
                        groups[groupKey].classes[classId] = { id: classId, label: label, role: role };
                    } else if (role === "Aggregate Root" && groups[groupKey].classes[classId].role !== "Aggregate Root") {
                        groups[groupKey].classes[classId].role = "Aggregate Root";
                    }
                    
                    // Aggregate Root인 경우 previewAttributes 업데이트
                    if (role === "Aggregate Root" && previewAttributes && Array.isArray(previewAttributes) && previewAttributes.length > 0) {
                        groups[groupKey].previewAttributes = previewAttributes;
                    }
                };
                

                structure.forEach(item => {
                    if (item.aggregate && item.aggregate.alias) {
                        const aggAlias = item.aggregate.alias;
                        const aggKey = getValidAlias(aggAlias);
                        
                        // previewAttributes가 있는지 확인하고 전달
                        const previewAttributes = item.previewAttributes && Array.isArray(item.previewAttributes) ? item.previewAttributes : null;
                        addClassToGroup(aggKey, aggKey, aggAlias, "Aggregate Root", previewAttributes);
                        
                        if (Array.isArray(item.enumerations)) {
                            item.enumerations.forEach(enumeration => {
                                if (!enumeration.alias) return;
                                const enumKey = getValidAlias(enumeration.alias);
                                addClassToGroup(aggKey, enumKey, enumeration.alias, "Enumeration");   
                                relSet.add(`    ${aggKey} --> ${enumKey}`);
                            });
                        }
                        
                        if (Array.isArray(item.valueObjects)) {
                            item.valueObjects.forEach(vo => {
                                if (!vo.alias) return;
                                const voKey = getValidAlias(vo.alias);
                                addClassToGroup(aggKey, voKey, vo.alias, "Value Object");
                                relSet.add(`    ${aggKey} --> ${voKey}`);
                                
                                if (vo.referencedAggregate && vo.referencedAggregate.alias) {
                                    const refAggAlias = vo.referencedAggregate.alias;
                                    const refAggKey = getValidAlias(refAggAlias);
                                    addClassToGroup(refAggKey, refAggKey, refAggAlias, "Aggregate Root");
                                    
                                    if (aggKey !== refAggKey)
                                        relSet.add(`    ${voKey} --> ${refAggKey}`);
                                }
                            });
                        }
                    }
                });
                
                
                Object.values(groups).forEach(group => {
                    mermaidString += `subgraph ${group.id} \n`;
                    Object.values(group.classes).forEach(cls => {
                        let nodeContent = `[-${cls.role}-<br/>${cls.id}`;
                        
                        // Aggregate Root이고 previewAttributes가 있는 경우 속성 목록 추가
                        if (cls.role === "Aggregate Root" && group.previewAttributes && group.previewAttributes.length > 0 && this.showDetailedAttributes) {               
                            nodeContent += `<br/>___`;
                            group.previewAttributes.forEach(attr => {
                                // 속성명을 안전하게 처리 (특수문자 제거)
                                const safeAttr = String(attr).replace(/[<>&"']/g, '');
                                nodeContent += `<br/>${safeAttr}`;
                            });
                        }
                        
                        nodeContent += `]`;
                        mermaidString += `${cls.id}${nodeContent}\n`;
                    });
                    mermaidString += `end\n`;
                });
                
                
                relSet.forEach(rel => {
                    mermaidString += rel + "\n";
                });

                return mermaidString;
            },
            updateMermaidDiagram() {
                this.mermaidDto.mermaidString = this.toMermaidUMLDiagramString(this.optionInfo.structure);
                this.mermaidDto.renderKey++;
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
    table-layout: fixed;
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
    padding: 4px 8px !important;
    word-break: keep-all;
}
</style>