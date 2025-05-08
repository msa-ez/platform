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
                    <!-- <event-storming-model-canvas
                        v-model="analysisResult.content"
                        :projectName="analysisResult.projectName"
                        :labs-id="null"
                        :is-original-model="false"
                    /> -->
                    <bpmn-uengine-viewer
                        :bpmn="bpmXml"
                        :key="bpmXml"
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
import BpmnUengineViewer from '@/components/designer/bpmnModeling/bpmn/BpmnUengineViewer.vue';

export default {
    name: 'RequirementAnalysis',
    components: {
        VueMermaid,
        EventStormingModelCanvas,
        BpmnUengineViewer
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
            bpmXml: null
        }
    },
    watch: {
        analysisResult: {
            handler(newVal) {
                console.log(newVal);
                this.generateBPMN(newVal.analysisResult);
            },
        }
    },
    mounted() {
        if (this.analysisResult) {
            this.generateBPMN(this.analysisResult.analysisResult);
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
            if (!analysisResult || !analysisResult.actors || !analysisResult.events) {
                this.bpmXml = null;
                return;
            }
            // 1. 데이터 정합성 보정
            // actors name, events actor 모두 trim, string화
            const actors = analysisResult.actors.map(actor => ({
                ...actor,
                name: String(actor.name).trim(),
                lane: Number(actor.lane)
            }));
            const events = analysisResult.events.map(ev => ({
                ...ev,
                actor: String(ev.actor).trim(),
                level: Number(ev.level)
            }));

            // 2. 이벤트를 레벨 순서대로 정렬
            const eventsByLevel = [...events].sort((a, b) => a.level - b.level);

            // 3. actorsMap 생성 (빠른 lookup)
            const actorsMap = {};
            actors.forEach(actor => {
                actorsMap[actor.name] = actor;
            });

            // 4. lanes 배열 생성 (Unknown 포함)
            const lanes = [...actors];
            const unknownEvents = [];
            eventsByLevel.forEach(ev => {
                if (!actorsMap[ev.actor]) {
                    unknownEvents.push(ev);
                }
            });
            if (unknownEvents.length > 0) {
                lanes.push({
                    name: "Unknown",
                    events: unknownEvents.map(ev => ev.name),
                    lane: lanes.length
                });
            }

            // 5. actorEventMap 생성 - 수정된 부분
            const actorEventMap = {};
            lanes.forEach(actor => {
                actorEventMap[actor.name] = [];
            });
            eventsByLevel.forEach(ev => {
                const actor = actorsMap[ev.actor];
                if (actor) {
                    actorEventMap[actor.name].push(ev.name);
                } else {
                    actorEventMap["Unknown"].push(ev.name);
                }
            });

            // 6. Pool/Lane 정의 (flowNodeRef를 level 순서대로)
            let lanesXml = lanes.map(actor => {
                const actorEvents = actorEventMap[actor.name] || [];
                return `
                <bpmn:lane id="Lane_${actor.lane}" name="${actor.name}">
                    ${actorEvents.map(ev => `<bpmn:flowNodeRef>${ev}</bpmn:flowNodeRef>`).join('\n')}
                </bpmn:lane>
            `;
            }).join('\n');

            // 7. 이벤트(Task/Start/End 등) 정의 (level 순서대로)
            let eventMap = {};
            let flowNodes = eventsByLevel.map(ev => {
                eventMap[ev.name] = ev;
                if (ev.level === 1) {
                    return `<bpmn:startEvent id="${ev.name}" name="${ev.displayName}" />`;
                } else if (!ev.nextEvents || ev.nextEvents.length === 0) {
                    return `<bpmn:endEvent id="${ev.name}" name="${ev.displayName}" />`;
                } else {
                    return `<bpmn:task id="${ev.name}" name="${ev.displayName}" />`;
                }
            }).join('\n');

            // 8. 시퀀스 플로우 정의
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

            // 9. 시각적 요소(BPMN-DI) 생성
            // 각 lane(액터)별로 y축을 다르게, 각 이벤트는 level에 따라 x축을 다르게 배치
            const laneHeight = 160;
            const nodeWidth = 80;
            const nodeHeight = 60;
            const yStart = 80;
            const xStart = 100;

            // level 정규화: 실제 level 분포에 따라 x축 위치를 조정
            const levels = eventsByLevel.map(ev => Number(ev.level));
            const minLevel = Math.min(...levels);
            const maxLevel = Math.max(...levels);
            const levelRange = maxLevel - minLevel + 1;
            const minCanvasWidth = 1200;
            const canvasWidth = Math.max(minCanvasWidth, levelRange * 80); // 80px per level
            const xGap = Math.max(80, canvasWidth / levelRange);

            // 이벤트별 위치 계산 - 개선된 부분
            const nodePositions = {};
            lanes.forEach((actor, laneIdx) => {
                const actorEvents = actorEventMap[actor.name] || [];
                actorEvents.forEach(evName => {
                    const ev = events.find(e => e.name === evName);
                    if (!ev) return;
                    const levelNum = Number(ev.level);
                    nodePositions[evName] = {
                        x: xStart + (levelNum - minLevel) * xGap,
                        y: yStart + laneIdx * laneHeight
                    };
                });
            });

            // 모든 노드의 x, y 최대값 구하기
            const allX = Object.values(nodePositions).map(pos => pos.x);
            const allY = Object.values(nodePositions).map(pos => pos.y);
            const maxX = Math.max(...allX, 0) + nodeWidth + 100; // 여유 padding
            const maxY = Math.max(...allY, 0) + nodeHeight + 100;

            // Lane의 BPMNShape 생성 (width를 maxX로 동적 설정)
            let bpmnLaneShapes = lanes.map((actor, laneIdx) => {
                return `
                <bpmndi:BPMNShape id="Shape_Lane_${actor.lane}" bpmnElement="Lane_${actor.lane}">
                    <dc:Bounds x="0" y="${yStart + laneIdx * laneHeight - 20}" width="${maxX}" height="${laneHeight}" />
                </bpmndi:BPMNShape>
                `;
            }).join('\n');

            // BPMNShape 생성
            let bpmnShapes = Object.entries(nodePositions).map(([evName, pos]) => {
                return `
                <bpmndi:BPMNShape id="Shape_${evName}" bpmnElement="${evName}">
                    <dc:Bounds x="${pos.x}" y="${pos.y}" width="${nodeWidth}" height="${nodeHeight}"/>
                </bpmndi:BPMNShape>
                `;
            }).join('\n');

            // BPMNEdge(시퀀스 플로우) 생성
            let bpmnEdges = sequenceFlows.map(flowXml => {
                const match = flowXml.match(/sourceRef="([^"]+)" targetRef="([^"]+)"/);
                if (!match) return '';
                const [, source, target] = match;
                const src = nodePositions[source];
                const tgt = nodePositions[target];
                if (!src || !tgt) return '';
                const waypoints = [
                    `<di:waypoint x="${src.x + nodeWidth}" y="${src.y + nodeHeight/2}"/>`,
                    `<di:waypoint x="${tgt.x}" y="${tgt.y + nodeHeight/2}"/>`
                ].join('\n');
                return `
                <bpmndi:BPMNEdge id="Edge_${source}_to_${target}" bpmnElement="Flow_${source}_to_${target}">
                    ${waypoints}
                </bpmndi:BPMNEdge>
                `;
            }).join('\n');

            // 10. 프로세스 조립 (BPMNPlane의 width/height를 maxX, maxY로 맞춤)
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
            </bpmndi:BPMNPlane>
            <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
                    <dc:Bounds x="0" y="0" width="${maxX}" height="${maxY}" />
                </bpmndi:BPMNPlane>
            </bpmndi:BPMNDiagram>
        </bpmndi:BPMNDiagram>
        </bpmn:definitions>
        `;
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