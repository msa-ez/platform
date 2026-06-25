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
                    v-model="localShowDetailedAttributes"
                    :label="$t('ModelDraftDialogForDistribution.showDetailedAttributes')"
                    dense
                    inset
                    hide-details
                    class="mt-0"
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
                <div v-if="analysisData.length > 0 && !isStandardTransformed" class="text-center">
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
    import { DataValidationUtil } from '../../../../utils'

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

            showDetailedAttributes: {
                type: Boolean,
                default: false,
                required: false
            },
            isStandardTransformed: {
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
            },
            localShowDetailedAttributes: {
                get() {
                    return this.showDetailedAttributes;
                },
                set(value) {
                    this.$emit('update:showDetailedAttributes', value);
                    this.$nextTick(() => {
                        this.updateMermaidDiagram();
                    });
                }
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
                if(!this.__isValidToMermaidUMLDiagramStringParams({ structure })) {
                    throw new Error("Invalid structure params for toMermaidUMLDiagramString: " + JSON.stringify({ structure }))
                }

                const initConfig = {
                    theme: "default",
                    themeVariables: {
                        fontSize: "14px"
                    }
                };
                const config = "%%{init: " + JSON.stringify(initConfig) + "}%%\n";


                let mermaidString = config + "graph TD\n";

                const groups = {}; 
                const relSet = new Set();
                
                const getValidAlias = (alias) => {
                    return alias.replace(/[^a-zA-Z0-9가-힣_]/g, '');
                }

                // mermaid 노드 id 안전화 (하이브리드).
                // 한글 등 정상 alias 는 mermaid 에서 그대로 잘 동작하므로(기존 정상 케이스) 그대로 쓰고,
                // 파싱을 끊는 경우 — 빈문자(특수문자뿐인 alias)/예약어('end','subgraph','graph','class' 등)/
                // 숫자 시작 — 일 때만 합성 id(n0,n1..)로 치환한다. 같은 logical key 는 항상 같은 id 로 매핑해
                // grouping/relation 일관성 유지.
                const MERMAID_RESERVED = new Set([
                    'graph','subgraph','end','class','classdef','click','style','linkstyle',
                    'direction','flowchart','default','call','href'
                ]);
                const idMap = {};
                let idSeq = 0;
                const mid = (key) => {
                    const k = String(key);
                    if (k in idMap) return idMap[k];
                    const safe = k && !MERMAID_RESERVED.has(k.toLowerCase()) && !/^[0-9]/.test(k);
                    idMap[k] = safe ? k : ('n' + (idSeq++));
                    return idMap[k];
                };

                // Mermaid 노드 라벨([-Role-<br/>...] 안에 들어감) 정제.
                // alias/name 이 그대로 들어가면 `]` `[` `|` 등이 노드 경계를 깨고
                // `\n` 은 mermaid 파싱을 통째로 끊음. <br/> 자체는 유지해야 하므로
                // 일반적인 HTML escape 대신 충돌 문자만 골라서 제거.
                const sanitizeMermaidLabel = (s) => {
                    if (s == null) return '?'
                    const out = String(s)
                        .replace(/[\r\n\t]+/g, ' ')
                        .replace(/[\[\]\(\){}]/g, ' ')
                        .replace(/[|`\\]/g, ' ')
                        .replace(/[;#]/g, ' ')
                        .replace(/"/g, "'")
                        .replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;')
                        .replace(/\s+/g, ' ')
                        .trim()
                    return out || '?'
                }
                
                const addClassToGroup = (groupKey, classId, label, role, fieldNames = null) => {
                    if (!groups[groupKey]) {
                        groups[groupKey] = { id: groupKey, label: label, classes: {}, fieldNames: fieldNames };
                    }
                    if (!groups[groupKey].classes[classId]) {
                        groups[groupKey].classes[classId] = { id: classId, label: label, role: role };
                    } else if (role === "Aggregate Root" && groups[groupKey].classes[classId].role !== "Aggregate Root") {
                        groups[groupKey].classes[classId].role = "Aggregate Root";
                    }
                    
                    // Aggregate Root인 경우 previewAttributes 업데이트
                    if (role === "Aggregate Root" && fieldNames && fieldNames.length > 0) {
                        groups[groupKey].fieldNames = fieldNames;
                    }
                };
                

                structure.forEach((item, aggIndex) => {
                    const aggAlias = (item.aggregate && item.aggregate.alias) || (item.aggregate && item.aggregate.name) || `Temp Aggregate Root ${aggIndex + 1}`;
                    const aggName = (item.aggregate && item.aggregate.name) || '';
                    const aggKey = getValidAlias(aggAlias);

                    // Aggregate Root의 표시명 (줄바꿈으로 구분) — sanitize 후 결합
                    const safeAggAlias = sanitizeMermaidLabel(aggAlias);
                    const safeAggName = sanitizeMermaidLabel(aggName);
                    const displayName = aggName && aggAlias !== aggName
                        ? safeAggAlias + '<br/>' + safeAggName  // 한글<br/>영문
                        : safeAggAlias;

                    const fieldNames = (item.previewAttributes) ? item.previewAttributes.map(attr => attr.fieldName) : null;
                    // Mermaid에 displayName 사용 (label 파라미터로 전달)
                    addClassToGroup(aggKey, aggKey, displayName, "Aggregate Root", this.__sanitizePreviewAttributes(fieldNames));

                    if (item.enumerations) {
                        item.enumerations.forEach((enumeration, enumIndex) => {
                            const enumAlias = enumeration.alias || enumeration.name || `Temp Enumeration ${aggIndex + 1}-${enumIndex + 1}`;
                            const enumName = enumeration.name || '';
                            const enumKey = getValidAlias(enumAlias);

                            const safeEnumAlias = sanitizeMermaidLabel(enumAlias);
                            const safeEnumName = sanitizeMermaidLabel(enumName);
                            const enumDisplayName = enumName && enumAlias !== enumName
                                ? safeEnumAlias + '<br/>' + safeEnumName
                                : safeEnumAlias;

                            addClassToGroup(aggKey, enumKey, enumDisplayName, "Enumeration");
                            relSet.add(`    ${mid(aggKey)} --> ${mid(enumKey)}`);
                        });
                    }

                    if (item.valueObjects) {
                        item.valueObjects.forEach((vo, voIndex) => {
                            const voAlias = vo.alias || vo.name || `Temp Value Object ${aggIndex + 1}-${voIndex + 1}`;
                            const voName = vo.name || '';
                            const voKey = getValidAlias(voAlias);

                            const safeVoAlias = sanitizeMermaidLabel(voAlias);
                            const safeVoName = sanitizeMermaidLabel(voName);
                            const voDisplayName = voName && voAlias !== voName
                                ? safeVoAlias + '<br/>' + safeVoName
                                : safeVoAlias;

                            addClassToGroup(aggKey, voKey, voDisplayName, "Value Object");
                            relSet.add(`    ${mid(aggKey)} --> ${mid(voKey)}`);

                            if (vo.referencedAggregate) {
                                const refAggAlias = vo.referencedAggregate.alias || vo.referencedAggregate.name || `Temp Referenced Aggregate Root ${aggIndex + 1}-${voIndex + 1}`;
                                const refAggName = vo.referencedAggregate.name || '';
                                const refAggKey = getValidAlias(refAggAlias);

                                const safeRefAggAlias = sanitizeMermaidLabel(refAggAlias);
                                const safeRefAggName = sanitizeMermaidLabel(refAggName);
                                const refAggDisplayName = refAggName && refAggAlias !== refAggName
                                    ? safeRefAggAlias + '<br/>' + safeRefAggName
                                    : safeRefAggAlias;

                                addClassToGroup(refAggKey, refAggKey, refAggDisplayName, "Aggregate Root");

                                if (aggKey !== refAggKey)
                                    relSet.add(`    ${mid(voKey)} --> ${mid(refAggKey)}`);
                            }
                        });
                    }
                });
                
                
                Object.values(groups).forEach(group => {
                    // 원본과 동일한 subgraph 선언 형식 유지(제목 bracket 미사용 — 배포 mermaid 버전에서
                    // `subgraph id [title]` 가 파싱을 깨 정상 다이어그램까지 회귀시켰던 것을 되돌림).
                    // 안전 alias 는 mid() 가 alias 를 그대로 반환하므로 헤더에 원래 이름이 보이고,
                    // 문제 alias 만 합성 id 로 표기된다.
                    mermaidString += `subgraph ${mid(group.id)} \n`;
                    Object.values(group.classes).forEach(cls => {
                        // label 사용 (displayName: "한글(영문)" 형식 포함)
                        let nodeContent = `[-${cls.role}-<br/>${cls.label}`;
                        
                        // Aggregate Root이고 fieldNames가 있는 경우 속성 목록 추가
                        if (cls.role === "Aggregate Root" && group.fieldNames && group.fieldNames.length > 0 && this.showDetailedAttributes) {               
                            nodeContent += `<br/>___`;
                            group.fieldNames.forEach(attr => {
                                // 속성명을 안전하게 처리 (특수문자 제거)
                                const safeAttr = String(attr).replace(/[<>&"']/g, '');
                                nodeContent += `<br/>${safeAttr}`;
                            });
                        }
                        
                        nodeContent += `]`;
                        mermaidString += `${mid(cls.id)}${nodeContent}\n`;
                    });
                    mermaidString += `end\n`;
                });
                
                relSet.forEach(rel => {
                    mermaidString += rel + "\n";
                });

                return mermaidString;
            },
            __isValidToMermaidUMLDiagramStringParams(params){
                const structureSchema = {
                    type: 'array',
                    required: true,
                    items: {
                        type: 'object',
                        properties: {
                            aggregate: {
                                type: 'object',
                                required: true,
                                properties: {
                                    name: { type: 'string', required: false, minLength: 1 },
                                    alias: { type: 'string', required: false, minLength: 1 }
                                }
                            },
                            enumerations: {
                                type: 'array',
                                required: false,
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', required: false, minLength: 1 },
                                        alias: { type: 'string', required: false, minLength: 1 }
                                    }
                                }
                            },
                            valueObjects: {
                                type: 'array',
                                required: false,
                                items: {
                                    type: 'object',
                                    properties: {
                                        name: { type: 'string', required: false, minLength: 1 },
                                        alias: { type: 'string', required: false, minLength: 1 },
                                        referencedAggregateName: { type: 'string', required: false },
                                        referencedAggregate: {
                                            type: 'object',
                                            required: false,
                                            properties: {
                                                name: { type: 'string', required: false, minLength: 1 },
                                                alias: { type: 'string', required: false, minLength: 1 }
                                            }
                                        }
                                    }
                                }
                            },
                            previewAttributes: {
                                type: 'array',
                                required: false,
                                items: {
                                    type: 'object',
                                    properties: {
                                        fieldName: { type: 'string', required: true, minLength: 1 },
                                        refs: {
                                            type: 'array',
                                            required: false,  // optional로 변경 (없으면 빈 배열로 보정)
                                            items: {
                                                type: 'array',
                                                items: {
                                                    type: 'array',
                                                    items: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };

                // DataValidationUtil을 사용하여 검증
                return DataValidationUtil.isValidData(params.structure, structureSchema);
            },
            __sanitizePreviewAttributes(previewAttributes) {
                if(!previewAttributes || !Array.isArray(previewAttributes)) return []
                return previewAttributes.filter(attr => typeof attr === 'string' && attr.replace(/[^a-zA-Z0-9_]/g, '') === attr)
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
    text-align: left;
}
</style>