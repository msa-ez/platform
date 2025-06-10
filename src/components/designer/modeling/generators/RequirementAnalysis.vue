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
            bpmXml: '',
            originalBpmXml: ''
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

            // 2. 데이터 정합성 보정 및 ID/이름 통일
            const normalize = str => {
                if (!str) return '';
                // 한글을 영문으로 변환하지 않고 그대로 유지
                return String(str)
                    .trim()
                    .replace(/[^a-zA-Z0-9가-힣]/g, '') // 특수문자만 제거
                    .toLowerCase();
            };
            const actors = analysisResult.actors.map(actor => ({
                ...actor,
                name: String(actor.name).trim(),
                normName: normalize(actor.name)
            }));
            const events = analysisResult.events.map(ev => ({
                ...ev,
                actor: String(ev.actor).trim(),
                normActor: normalize(ev.actor),
                name: String(ev.name).trim(),
                normName: normalize(ev.name),
                level: Number(ev.level),
                nextEvents: ev.nextEvents ? ev.nextEvents.map(next => normalize(next)) : []
            }));

            // 3. 고유 액터 목록 (Unknown 포함)
            const actorNames = Array.from(new Set([
                ...actors.map(a => a.name),
                ...events.map(e => e.actor)
            ]));
            const lanes = actorNames.map((name, idx) => ({
                name,
                normName: normalize(name),
                idx,
                id: `Lane_${idx}` // 고유한 레인 ID 추가
            }));

            // 4. Unknown 레인 처리
            const knownActorSet = new Set(actors.map(a => a.name));
            const unknownEvents = events.filter(ev => !knownActorSet.has(ev.actor));
            if (unknownEvents.length > 0 && !actorNames.includes('Unknown')) {
                lanes.push({ 
                    name: 'Unknown', 
                    normName: normalize('Unknown'), 
                    idx: lanes.length,
                    id: `Lane_${lanes.length}`
                });
            }

            // 5. 레이아웃 상수
            const minSpacing = 80;
            const nodeWidth = 120;
            const nodeHeight = 70;
            const margin = 40;
            const xStart = 60;
            const xGap = 180;

            // === 레인 높이/위치 계산 (노드 분포 중심과 레인 중심 일치) ===
            let currentY = 40;
            lanes.forEach(lane => {
                const actorEvents = events.filter(ev => ev.normActor === lane.normName);
                if (actorEvents.length === 0) {
                    lane.y = currentY;
                    lane.height = nodeHeight + margin * 2;
                    currentY += lane.height;
                    return;
                }

                // 레벨별 그룹핑
                const levelGroups = {};
                actorEvents.forEach(ev => {
                    if (!levelGroups[ev.level]) levelGroups[ev.level] = [];
                    levelGroups[ev.level].push(ev);
                });

                // 레벨별로 노드 배치 (중앙 정렬)
                let levelYs = [];
                let currentLevelY = 0;
                const levelEntries = Object.entries(levelGroups);
                levelEntries.forEach(([level, eventsInLevel], i) => {
                    const n = eventsInLevel.length;
                    const levelHeight = Math.max(nodeHeight, (n - 1) * (nodeHeight + margin) + nodeHeight);
                    // 레벨 내 노드 분산
                    const startY = currentLevelY;
                    eventsInLevel.forEach((ev, idx) => {
                        ev._bpmn_y = startY + idx * (nodeHeight + margin);
                        levelYs.push(ev._bpmn_y);
                    });
                    currentLevelY += levelHeight;
                    if (i < levelEntries.length - 1) currentLevelY += margin; // 레벨 간 margin
                });

                // 노드 분포의 min/max
                const minY = Math.min(...levelYs);
                const maxY = Math.max(...levelYs) + nodeHeight;
                // 레인 높이 = 노드 분포 + 상하 margin
                const laneHeight = (maxY - minY) + margin * 2;
                lane.y = currentY;
                lane.height = laneHeight;

                // 노드들을 레인 중심에 맞추기
                const nodesCenterY = (minY + maxY) / 2;
                const laneCenterY = lane.y + lane.height / 2;
                const offset = laneCenterY - nodesCenterY;
                actorEvents.forEach(ev => {
                    ev._bpmn_y += offset;
                });

                currentY += lane.height;
            });

            // === x좌표는 기존대로 ===
            const levels = events.map(ev => ev.level);
            const minLevel = levels.length > 0 ? Math.min(...levels) : 0;
            events.forEach(ev => {
                ev._bpmn_x = (ev._bpmn_x !== undefined) ? ev._bpmn_x : (xStart + (ev.level - minLevel) * xGap);
            });

            // 6. 레인별 이벤트 그룹화 (레벨별로도 그룹화)
            const levelLaneEventMap = {};
            events.forEach(ev => {
                const key = `${ev.level}_${ev.normActor}`;
                if (!levelLaneEventMap[key]) levelLaneEventMap[key] = [];
                levelLaneEventMap[key].push(ev);
            });

            // 7. 레인 XML 생성 (이벤트가 없어도 모든 레인 포함, flowNodeRef는 normName 기준)
            let lanesXml = lanes.map(lane => {
                // 해당 레인에 속한 이벤트만 flowNodeRef로 포함
                const actorEvents = events.filter(ev => ev.normActor === lane.normName);
                return `
                    <bpmn:lane id="${lane.id}" name="${lane.name}">
                        ${actorEvents.map(ev => `<bpmn:flowNodeRef>${ev.normName}</bpmn:flowNodeRef>`).join('\n')}
                    </bpmn:lane>
                `;
            }).join('\n');

            // 8. Task/Event XML 생성 (ID는 normName)
            let flowNodes = events.map(ev => {
                return `<bpmn:task id="${ev.normName}" name="${ev.displayName || ev.name}" />`;
            }).join('\n');

            // 9. 시퀀스 플로우 XML 생성 (ID, sourceRef, targetRef 모두 normName)
            let sequenceFlows = [];
            events.forEach(ev => {
                if (ev.nextEvents) {
                    ev.nextEvents.forEach(next => {
                        const nextNorm = normalize(next);
                        sequenceFlows.push(
                            `<bpmn:sequenceFlow id="Flow_${ev.normName}_to_${nextNorm}" sourceRef="${ev.normName}" targetRef="${nextNorm}" />`
                        );
                    });
                }
            });

            // 10. 시퀀스 플로우 waypoints 생성 (좌표 기반, ID/bpmnElement 모두 normName)
            let bpmnEdges = sequenceFlows.map(flowXml => {
                const match = flowXml.match(/sourceRef=\"([^\"]+)\" targetRef=\"([^\"]+)\"/);
                if (!match) return '';
                const [, source, target] = match;
                const sourceEv = events.find(ev => ev.normName === source);
                const targetEv = events.find(ev => ev.normName === target);
                if (!sourceEv || !targetEv) return '';
                const sourceX = sourceEv._bpmn_x + nodeWidth;
                const sourceY = sourceEv._bpmn_y + nodeHeight / 2;
                const targetX = targetEv._bpmn_x;
                const targetY = targetEv._bpmn_y + nodeHeight / 2;
                const midX = (sourceX + targetX) / 2;
                return `                <bpmndi:BPMNEdge id="Edge_${source}_to_${target}" bpmnElement="Flow_${source}_to_${target}">
                    <di:waypoint x="${sourceX}" y="${sourceY}"/>
                    <di:waypoint x="${midX}" y="${sourceY}"/>
                    <di:waypoint x="${midX}" y="${targetY}"/>
                    <di:waypoint x="${targetX}" y="${targetY}"/>
                </bpmndi:BPMNEdge>`;
            }).join('\n');

            // 11. Task/Event BPMNShape 생성 (좌표, 크기 명시, ID/bpmnElement 모두 normName)
            let bpmnShapes = events.map(ev => {
                let x = ev._bpmn_x;
                let y = ev._bpmn_y;
                let width = nodeWidth, height = nodeHeight;
                return `<bpmndi:BPMNShape id="Shape_${ev.normName}" bpmnElement="${ev.normName}">
                    <dc:Bounds x="${x}" y="${y}" width="${width}" height="${height}"/>
                </bpmndi:BPMNShape>`;
            }).join('\n');

            // 12. 레인 BPMNShape 생성 (laneId와 bpmnElement 일치)
            let bpmnLaneShapes = lanes.map((lane, idx) => {
                const laneWidth = xStart + (Math.max(...levels) - minLevel) * xGap + nodeWidth + 300;
                return `                    <bpmndi:BPMNShape id="Shape_${lane.id}" bpmnElement="${lane.id}">
                        <dc:Bounds x="0" y="${lane.y}" width="${laneWidth}" height="${lane.height}" />
                        <bpmndi:BPMNLabel>
                          <dc:Bounds x="20" y="${lane.y + 10}" width="300" height="40" />
                        </bpmndi:BPMNLabel>
                    </bpmndi:BPMNShape>
                `;
            }).join('\n');

            // 13. 전체 다이어그램 크기 계산
            const totalWidth = xStart + (Math.max(...levels) - minLevel) * xGap + nodeWidth + 120;
            const totalHeight = lanes.length > 0 ? (lanes[lanes.length-1].y + lanes[lanes.length-1].height + 80) : 800;

            // 14. 최종 BPMN XML 생성
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

            // 15. 원본 XML 저장 (자동 레이아웃 복원용)
            this.originalBpmXml = this.bpmXml;

            // 16. XML이 생성된 후 BpmnJsEditor 초기화 확인
            this.$nextTick(() => {
                if (this.$refs.bpmnEditor) {
                    this.$refs.bpmnEditor.importDiagram(this.bpmXml);
                }
            });
        },
        async autoLayout() {
            const bpmnEditor = this.$refs.bpmnEditor;
            if (bpmnEditor && typeof bpmnEditor.autoLayout === 'function') {
                await bpmnEditor.autoLayout();
            }
        },
        restoreOriginalLayout() {
            if (this.originalBpmXml) {
                this.bpmXml = this.originalBpmXml;
            }
        },
        onBpmnXmlUpdate(newXml) {
            // XML이 실제로 변경된 경우에만 업데이트
            if (newXml !== this.bpmXml) {
                this.bpmXml = newXml;
            }
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