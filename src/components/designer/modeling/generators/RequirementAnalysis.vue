<template>
    <div class="pa-4">
        <template v-if="isAnalizing">
            <div class="generating-state">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="24"
                    class="mr-2"
                ></v-progress-circular>
                <span v-if="processingRate==0 || processingRate==100">{{ $t('RequirementAnalysis.validateRequirements') }} ({{ currentGeneratedLength }} Text generated.)</span>
                <span v-else>{{ $t('RequirementAnalysis.validateRequirements') }} ({{ processingRate }}%)</span>
                <v-btn v-if="isAnalizing" text color="primary" @click="stop()">Stop</v-btn>
            </div>
        </template>
        <template>
            <!--분석 결과가 있는 경우-->
            <div v-if="analysisResult && analysisResult.type === 'ANALYSIS_RESULT'" class="bpmn-wrapper">
                <div>
                    <h2 class="bpmn-title pb-2">
                        <v-row class="ma-0 pa-0">
                            <v-icon left>mdi-check-circle</v-icon>
                            <div>{{ $t('RequirementAnalysis.requirementAnalysisResult') }}</div>
                        </v-row>
                    </h2>
                    <div class="pb-2">
                        <div v-if="isAnalizing" class="bpmn-subtitle">{{ $t('RequirementAnalysis.processAndEventFlowExtraction') }}</div>
                        <div v-else class="bpmn-subtitle">{{ $t('RequirementAnalysis.processAndEventFlowExtracted') }}</div>
                    </div>
                </div>

                <div class="bpmn-canvas">
                    <v-btn @click="autoLayout">Auto Layout</v-btn>
                    <v-btn @click="restoreOriginalLayout" class="ml-2">Restore Layout</v-btn>
                    <!-- <v-btn @click="printXML" class="ml-2">Print XML</v-btn> -->
                    <bpmn-js-editor
                        ref="bpmnEditor"
                        :xml="bpmXml"
                        :key="bpmXml"
                        @update:xml="onBpmnXmlUpdate"
                    />
                </div>

                <div class="bpmn-footer">
                    <v-btn 
                        :disabled="isAnalizing || isGeneratingBoundedContext || isStartMapping || isSummarizeStarted || !isEditable"
                        @click="showBCGenerationOption()" 
                        class="auto-modeling-btn" 
                        color="primary"
                    >
                        {{ $t('RequirementAnalysis.createBoundedContext') }}
                    </v-btn>
                </div>
            </div>

            <!-- 가이드가 필요한 경우 -->
            <div v-else-if="analysisResult && analysisResult.type === 'ENHANCEMENT_GUIDE'" class="enhancement-guide">
                <v-alert
                    type="warning"
                    prominent
                    border="left"
                    colored-border
                    class="guide-header"
                >
                    {{ $t('RequirementAnalysis.requirementImprovementNeeded') }}
                </v-alert>

                <div class="quality-criteria-section">
                    <template v-for="(items, criterion) in analysisResult.content.missingElements">
                        <div v-if="items.length" :key="criterion" class="criterion-card">
                            <div class="criterion-header">
                                <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
                                {{ getCriterionTitle(criterion) }}
                            </div>
                            <ul class="criterion-items">
                                <li v-for="item in items" :key="item">{{ item }}</li>
                            </ul>
                        </div>
                    </template>
                </div>

                <div class="recommendations-section mt-4">
                    <v-card outlined>
                        <v-card-title class="recommendations-title">
                            <v-icon color="primary" class="mr-2">mdi-lightbulb</v-icon>
                            {{ $t('RequirementAnalysis.improvementRecommendations') }}
                        </v-card-title>
                        <v-card-text>
                            <div v-if="analysisResult.content.recommendations.immediate">
                                <h4 class="mb-2">{{ $t('RequirementAnalysis.immediateImprovements') }}</h4>
                                <ul>
                                    <li v-for="item in analysisResult.content.recommendations.immediate" 
                                        :key="item" 
                                        class="mb-2">
                                        {{ item }}
                                    </li>
                                </ul>
                            </div>

                            <div v-if="analysisResult.content.recommendations.questions" class="mt-4">
                                <h4 class="mb-2">{{ $t('RequirementAnalysis.reviewRequiredItems')}}</h4>
                                <v-chip-group column>
                                    <v-chip v-for="question in analysisResult.content.recommendations.questions"
                                        :key="question"
                                        outlined
                                        class="ma-1">
                                        <v-icon left small>mdi-help-circle</v-icon>
                                        {{ question }}
                                    </v-chip>
                                </v-chip-group>
                            </div>
                        </v-card-text>
                    </v-card>
                </div>

                <div v-if="analysisResult.content.impactAreas" class="impact-areas-section mt-4">
                    <v-card outlined>
                        <v-card-title class="impact-title">
                            <v-icon color="info" class="mr-2">mdi-target</v-icon>
                            {{ $t('RequirementAnalysis.impactAreas') }}
                        </v-card-title>
                        <v-card-text>
                            <v-chip-group>
                                <v-chip v-for="area in analysisResult.content.impactAreas"
                                    :key="area"
                                    color="info"
                                    text-color="white"
                                    small>
                                    {{ area }}
                                </v-chip>
                            </v-chip-group>
                        </v-card-text>
                    </v-card>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import VueMermaid from '@/components/VueMermaid.vue';
const EventStormingModelCanvas = () => import('@/components/designer/es-modeling/EventStormingModelCanvas.vue');
import BpmnJsEditor from '@/components/designer/bpmnModeling/bpmn/BpmnJsEditor.vue';
import { applyAutoLayoutAndUpdateXml } from '@/components/designer/modeling/generators/BPMAutoLayout.js';

export default {
    name: 'RequirementAnalysis',
    components: {
        VueMermaid,
        EventStormingModelCanvas,
        BpmnJsEditor
    },
    props: {
        analysisResult: {
            type: Object,
            required: true
        },
        isAnalizing: {
            type: Boolean,
            required: false
        },
        isGeneratingBoundedContext: {
            type: Boolean,
            required: false
        },
        isStartMapping: {
            type: Boolean,
            required: false
        },
        isSummarizeStarted: {
            type: Boolean,
            required: false
        },
        processingRate: {
            type: Number,
            required: false,
            default: 0
        },
        isEditable: {
            type: Boolean,
            required: false
        },
        currentGeneratedLength: {
            type: Number,
            required: false,
            default: 0
        }
    },
    data() {
        return {
            bpmXml: null,
            originalBpmXml: null
        }
    },
    watch: {
        analysisResult: {
            handler(newVal) {
                this.generateBPMN(newVal.analysisResult);
            },
            deep: true
        }
    },
    mounted() {
        if (this.analysisResult) {
            this.generateBPMN(this.analysisResult.analysisResult);
            this.originalBpmXml = this.bpmXml;
        }
    },
    methods: {
        showBCGenerationOption() {
            this.$emit('showBCGenerationOption');
        },
        getCriterionTitle(criterion) {
            const titles = {
                clarity: '명확성',
                completeness: '완전성',
                consistency: '일관성',
                verifiability: '검증 가능성',
                modifiability: '수정 용이성',
                traceability: '추적 가능성'
            };
            return titles[criterion] || criterion;
        },
        stop() {
            this.$emit('stop');
        },
        generateBPMN(analysisResult) {
            // 1. 필수 데이터 검증
            if (!analysisResult || !analysisResult.actors || !analysisResult.events) {
                this.bpmXml = null;
                return;
            }

            // 2. 데이터 정합성 보정
            const actors = analysisResult.actors.map(actor => ({
                ...actor,
                name: String(actor.name).trim(),
            }));
            const events = analysisResult.events.map(ev => ({
                ...ev,
                actor: String(ev.actor).trim(),
                level: Number(ev.level)
            }));

            // 3. 고유 액터 목록 (Unknown 포함)
            const actorNames = Array.from(new Set([
                ...actors.map(a => a.name),
                ...events.map(e => e.actor)
            ]));
            const lanes = actorNames.map((name, idx) => ({
                name,
                idx
            }));

            // 4. Unknown 레인 처리
            const knownActorSet = new Set(actors.map(a => a.name));
            const unknownEvents = events.filter(ev => !knownActorSet.has(ev.actor));
            // Unknown 레인 추가(이미 있으면 중복 추가 안함)
            if (unknownEvents.length > 0 && !actorNames.includes('Unknown')) {
                lanes.push({ name: 'Unknown', idx: lanes.length });
            }

            // 5. 레이아웃 상수
            const laneHeight = 450;
            const nodeWidth = 150;
            const nodeHeight = 100;
            const yStart = 100;
            const xStart = 200;
            const xGap = 450;

            // 6. 레벨 범위 계산
            const levels = events.map(ev => ev.level);
            const minLevel = levels.length > 0 ? Math.min(...levels) : 0;
            const maxLevel = levels.length > 0 ? Math.max(...levels) : 0;

            // 7. 레인별 이벤트 그룹화 (레벨별로도 그룹화)
            const levelLaneEventMap = {};
            events.forEach(ev => {
                const key = `${ev.level}_${ev.actor}`;
                if (!levelLaneEventMap[key]) levelLaneEventMap[key] = [];
                levelLaneEventMap[key].push(ev);
            });

            // 8. 레인 XML 생성 (이벤트가 없어도 모든 레인 포함)
            let lanesXml = lanes.map(lane => {
                const laneId = `Lane_${lane.name.replace(/[^a-zA-Z0-9]/g, '')}`;
                const actorEvents = events.filter(ev => ev.actor === lane.name);
                return `
                    <bpmn:lane id="${laneId}" name="${lane.name}">
                        ${actorEvents.map(ev => `<bpmn:flowNodeRef>${ev.name}</bpmn:flowNodeRef>`).join('\n')}
                    </bpmn:lane>
                `;
            }).join('\n');

            // 9. Task/Event XML 생성
            let flowNodes = events.map(ev => {
                if (ev.level === 1) {
                    return `<bpmn:startEvent id="${ev.name}" name="${ev.displayName}" />`;
                } else if (!ev.nextEvents || ev.nextEvents.length === 0) {
                    return `<bpmn:endEvent id="${ev.name}" name="${ev.displayName}" />`;
                } else {
                    return `<bpmn:task id="${ev.name}" name="${ev.displayName}" />`;
                }
            }).join('\n');

            // 10. 시퀀스 플로우 XML 생성
            let sequenceFlows = [];
            events.forEach(ev => {
                if (ev.nextEvents) {
                    ev.nextEvents.forEach(next => {
                        sequenceFlows.push(
                            `<bpmn:sequenceFlow id="Flow_${ev.name}_to_${next}" sourceRef="${ev.name}" targetRef="${next}" />`
                        );
                    });
                }
            });

            // 11. Task/Event BPMNShape 생성 (같은 레벨/레인에 여러 이벤트가 있을 때 y좌표 분산)
            let bpmnShapes = events.map(ev => {
                const x = xStart + (ev.level - minLevel) * xGap;
                const laneIdx = lanes.findIndex(l => l.name === ev.actor);
                const laneY = yStart + laneIdx * laneHeight;
                const key = `${ev.level}_${ev.actor}`;
                const sameLevelLaneEvents = levelLaneEventMap[key] || [];
                let y;
                if (sameLevelLaneEvents.length > 1) {
                    const idx = sameLevelLaneEvents.findIndex(e => e.name === ev.name);
                    const margin = 20;
                    const availableHeight = laneHeight - 2 * margin - nodeHeight;
                    const step = sameLevelLaneEvents.length === 1 ? 0 : availableHeight / (sameLevelLaneEvents.length - 1);
                    y = laneY + margin + idx * step;
                } else {
                    y = laneY + (laneHeight - nodeHeight) / 2;
                }
                ev._bpmn_x = x;
                ev._bpmn_y = y;
                return `<bpmndi:BPMNShape id="Shape_${ev.name}" bpmnElement="${ev.name}">
                    <dc:Bounds x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}"/>
                </bpmndi:BPMNShape>`;
            }).join('\n');

            // 12. 레인 BPMNShape 생성 (laneId와 bpmnElement 일치)
            let bpmnLaneShapes = lanes.map((lane, idx) => {
                const laneId = `Lane_${lane.name.replace(/[^a-zA-Z0-9]/g, '')}`;
                const y = yStart + idx * laneHeight;
                const laneWidth = xStart + (maxLevel - minLevel) * xGap + nodeWidth + 300;
                return `
                    <bpmndi:BPMNShape id="Shape_${laneId}" bpmnElement="${laneId}">
                        <dc:Bounds x="0" y="${y}" width="${laneWidth}" height="${laneHeight}" />
                    </bpmndi:BPMNShape>
                `;
            }).join('\n');

            // 13. 시퀀스 플로우 waypoints 생성
            let bpmnEdges = sequenceFlows.map(flowXml => {
                const match = flowXml.match(/sourceRef="([^"]+)" targetRef="([^"]+)"/);
                if (!match) return '';
                const [, source, target] = match;
                const sourceEv = events.find(ev => ev.name === source);
                const targetEv = events.find(ev => ev.name === target);
                if (!sourceEv || !targetEv) return '';
                const sourceX = sourceEv._bpmn_x + nodeWidth;
                const sourceY = sourceEv._bpmn_y + nodeHeight / 2;
                const targetX = targetEv._bpmn_x;
                const targetY = targetEv._bpmn_y + nodeHeight / 2;
                const midX = (sourceX + targetX) / 2;
                return `
                <bpmndi:BPMNEdge id="Edge_${source}_to_${target}" bpmnElement="Flow_${source}_to_${target}">
                    <di:waypoint x="${sourceX}" y="${sourceY}"/>
                    <di:waypoint x="${midX}" y="${sourceY}"/>
                    <di:waypoint x="${midX}" y="${targetY}"/>
                    <di:waypoint x="${targetX}" y="${targetY}"/>
                </bpmndi:BPMNEdge>`;
            }).join('\n');

            // 14. 전체 다이어그램 크기 계산
            const totalWidth = xStart + (maxLevel - minLevel) * xGap + nodeWidth + 400;
            const totalHeight = yStart + lanes.length * laneHeight + 300;

            // 15. 최종 BPMN XML 생성
            this.bpmXml = `<?xml version="1.0" encoding="UTF-8"?>
            <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                            xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                            xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                            xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                            xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                            id="Definitions_1"
                            targetNamespace="http://bpmn.io/schema/bpmn">
                <bpmn:process id="Process_1" isExecutable="false">
                    <bpmn:laneSet>
                        ${lanesXml}
                    </bpmn:laneSet>
                    ${flowNodes}
                    ${sequenceFlows.join('\n')}
                </bpmn:process>
                <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
                        ${bpmnLaneShapes}
                        ${bpmnShapes}
                        ${bpmnEdges}
                        <dc:Bounds x="0" y="0" width="${totalWidth}" height="${totalHeight}" />
                    </bpmndi:BPMNPlane>
                </bpmndi:BPMNDiagram>
            </bpmn:definitions>`;

            // 16. 원본 XML 저장 (자동 레이아웃 복원용)
            this.originalBpmXml = this.bpmXml;
        },
        async autoLayout() {
            try {
                const bpmnEditor = this.$refs.bpmnEditor;
                if (!bpmnEditor || !bpmnEditor.bpmnModeler) {
                    alert('BPMN 에디터 인스턴스를 찾을 수 없습니다.');
                    return;
                }
                // 새 XML을 받아와서 다시 import
                const newXml = await applyAutoLayoutAndUpdateXml(bpmnEditor.bpmnModeler, { horizontal: true });
                if (newXml) {
                    this.bpmXml = newXml;
                }
            } catch (e) {
                alert('자동 레이아웃 중 오류: ' + e.message);
                console.error(e);
            }
        },
        restoreOriginalLayout() {
            if (this.originalBpmXml) {
                this.bpmXml = this.originalBpmXml;
            }
        },
        onBpmnXmlUpdate(newXml) {
            this.bpmXml = newXml;
        },
        printXML() {
            console.log(this.bpmXml);
        }
    }
}
</script>

<style>
.enhancement-guide {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
}

.guide-header {
    margin-bottom: 24px;
}

.criterion-card {
    background: white;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.criterion-header {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
}

.criterion-items {
    padding-left: 20px;
    margin: 8px 0;
}

.criterion-items li {
    margin-bottom: 8px;
    color: #666;
}

.recommendations-title, .impact-title {
    background-color: #f5f5f5;
    padding: 12px 16px;
}

.recommendations-section, .impact-areas-section {
    margin-top: 24px;
}

.quality-criteria-section {
    margin-bottom: 24px;
}

.bpmn-wrapper {
    width: 100%;
    height: 100vh;
    max-height: 900px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.bpmn-title {
    font-size: 1.5rem;
    color: #333;
}

.bpmn-subtitle {
    color: #666;
    font-size: 1rem;
}

.bpmn-canvas {
    position: relative;
    height: 100%;
    border: 1px solid #eee;
    border-radius: 4px;
    background: white;
    margin: 10px 0;
}

.bpmn-footer {
    padding-top: 20px;
    display: flex;
    justify-content: flex-end;
}

.auto-modeling-btn {
    min-width: 150px;
}
</style>