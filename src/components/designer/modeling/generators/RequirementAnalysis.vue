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

                <!-- 프로세스 세트별 탭 -->
                <div v-if="processSets.length > 0 && !isAnalizing && analysisResult && analysisResult.type === 'ANALYSIS_RESULT'" class="process-tabs mb-4">
                    <v-tabs
                        v-model="activeTab"
                        background-color="transparent"
                        color="primary"
                        grow
                    >
                        <v-tab
                            v-for="(processSet, index) in processSets"
                            :key="index"
                            :value="index"
                        >
                            {{ processSet.name }}
                            <v-chip
                                small
                                color="primary"
                                text-color="white"
                                class="ml-2"
                            >
                                {{ processSet.events.length }}
                            </v-chip>
                        </v-tab>
                    </v-tabs>
                </div>

                <div class="bpmn-canvas">
                    <div class="canvas-controls mb-2">
                        <v-btn @click="autoLayout" small>Auto Layout</v-btn>
                        <v-btn @click="restoreOriginalLayout" small class="ml-2">Restore Layout</v-btn>
                        <v-chip
                            v-if="processSets.length > 0"
                            color="info"
                            text-color="white"
                            small
                            class="ml-2"
                        >
                            {{ activeProcessSet ? activeProcessSet.name : '' }} Process
                        </v-chip>
                    </div>
                    <bpmn-js-editor
                        ref="bpmnEditor"
                        :xml="currentBpmXml"
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
            originalBpmXml: '',
            activeTab: null, // 활성화된 탭의 인덱스
            processSets: [] // 프로세스 세트 데이터
        }
    },
    computed: {
        currentBpmXml() {
            // 프로세스 세트가 없거나 분석 중인 경우 전체 BPMN XML 반환
            if (this.processSets.length === 0 || this.isAnalizing) {
                return this.bpmXml;
            }
            
            // 탭이 없거나 유효하지 않은 경우 전체 BPMN XML 반환
            if (this.activeTab === null || this.activeTab >= this.processSets.length) {
                return this.bpmXml;
            }
            
            const processSet = this.processSets[this.activeTab];
            if (processSet && processSet.events.length > 0) {
                // 탭 변경 시 동적으로 BPMN XML 생성
                const bpmnXml = this.generateProcessSetBPMN(processSet.events, processSet.actors);
                console.log('Generated BPMN XML for:', processSet.name, 'with', processSet.events.length, 'events');
                return bpmnXml;
            }
            
            return this.bpmXml;
        },
        activeProcessSet() {
            if (this.activeTab === null || this.activeTab >= this.processSets.length) {
                return null;
            }
            return this.processSets[this.activeTab];
        }
    },
    watch: {
        analysisResult: {
            handler(newVal) {
                this.generateBPMN(newVal.analysisResult);
            },
            deep: true
        },
        activeTab: {
            handler(newTab) {
                // 탭이 변경되면 computed 속성이 자동으로 새로운 BPMN XML을 생성하고 BPMN 에디터가 업데이트됨
                console.log('Tab changed to:', newTab);
                
                // BPMN 에디터에 새로운 XML을 강제로 로드하기 위해 nextTick 사용
                this.$nextTick(() => {
                    if (this.$refs.bpmnEditor) {
                        console.log('Reloading BPMN editor with new XML for tab:', newTab);
                        // BPMN 에디터의 XML을 강제로 업데이트
                        this.$refs.bpmnEditor.importDiagram(this.currentBpmXml);
                    }
                });
            }
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
                this.processSets = [];
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

            // 3. 프로세스 세트 생성
            this.createProcessSets(actors, events);
        },

        createProcessSets(actors, events) {
            console.log('Creating process sets from', events.length, 'events');
            
            // 1. 연결된 이벤트 그룹 찾기 (nextEvents 기반)
            const connectedGroups = this.findConnectedEventGroups(events);
            console.log('Connected groups:', connectedGroups.length);
            
            // 2. 연결되지 않은 이벤트들을 개별 세트로 만들기
            const unconnectedGroups = this.findUnconnectedEventGroups(events, connectedGroups);
            console.log('Unconnected groups:', unconnectedGroups.length);
            
            // 3. 단일 이벤트들을 하나의 그룹으로 합치기
            const singleEventGroups = unconnectedGroups.filter(group => group.events.length === 1);
            const multiEventGroups = unconnectedGroups.filter(group => group.events.length > 1);
            
            console.log('Single event groups:', singleEventGroups.length);
            console.log('Multi event groups:', multiEventGroups.length);
            
            // 4. 단일 이벤트들을 하나의 탭으로 그룹화
            let allGroups = [...connectedGroups, ...multiEventGroups];
            
            // 단일 이벤트가 있으면 하나의 탭으로 합치기
            if (singleEventGroups.length > 0) {
                const singleEventsGroup = {
                    name: 'Single Events',
                    description: '독립적인 단일 이벤트들',
                    events: singleEventGroups.flatMap(group => group.events),
                    actors: actors.filter(actor => 
                        singleEventGroups.some(group => 
                            group.events.some(event => event.actor === actor.name)
                        )
                    )
                };
                console.log('Created single events group with', singleEventsGroup.events.length, 'events');
                allGroups.push(singleEventsGroup);
            }
            
            // 5. 프로세스 세트 생성 (BPMN XML은 탭 클릭 시 동적 생성)
            this.processSets = allGroups.map((group, index) => {
                const groupEvents = group.events;
                const groupActors = actors.filter(actor => 
                    groupEvents.some(event => event.actor === actor.name)
                );
                
                // 최초 BPMN XML 생성
                const bpmnXml = this.generateProcessSetBPMN(groupEvents, groupActors);
                return {
                    name: group.name,
                    description: group.description,
                    events: groupEvents,
                    actors: groupActors,
                    originalXml: bpmnXml // 각 세트별 원본 XML 저장
                };
            }).filter(processSet => processSet.events.length > 0);

            // 전체 BPMN XML 생성 (기존 로직 유지)
            this.generateFullBPMN(actors, events);

            // 첫 번째 탭을 기본으로 설정
            this.activeTab = this.processSets.length > 0 ? 0 : null;
            
            // 첫 번째 탭이 활성화되면 computed 속성이 자동으로 BPMN XML을 생성함
            console.log('Created', this.processSets.length, 'process sets');
            this.processSets.forEach((set, index) => {
                console.log(`Process Set ${index}: ${set.name} (${set.events.length} events)`);
            });
        },

        findConnectedEventGroups(events) {
            const groups = [];
            const visited = new Set();
            
            console.log('Finding connected event groups from', events.length, 'events');
            
            // 연결된 이벤트들을 찾기 위해 각 이벤트의 nextEvents를 확인
            const connectedEventMap = new Map();
            
            // 각 이벤트의 연결 정보를 수집
            events.forEach(event => {
                if (event.nextEvents && event.nextEvents.length > 0) {
                    const connectedEvents = [];
                    event.nextEvents.forEach(nextEventName => {
                        const nextEvent = events.find(e => e.normName === nextEventName);
                        if (nextEvent) {
                            connectedEvents.push(nextEvent);
                        }
                    });
                    if (connectedEvents.length > 0) {
                        connectedEventMap.set(event.name, connectedEvents);
                    }
                }
            });
            
            console.log('Connected event map:', connectedEventMap);
            
            // 연결된 이벤트 그룹들을 찾기
            events.forEach(event => {
                if (visited.has(event.name)) return;
                
                // 이 이벤트가 다른 이벤트와 연결되어 있는지 확인
                const hasIncomingConnection = events.some(e => 
                    e.nextEvents && e.nextEvents.some(next => next === event.normName)
                );
                const hasOutgoingConnection = connectedEventMap.has(event.name);
                
                // 연결이 있는 경우에만 그룹 생성
                if (hasIncomingConnection || hasOutgoingConnection) {
                    const group = this.findConnectedEvents(event, events, visited);
                    // 연결된 이벤트가 있으면 그룹으로 인정 (단일 이벤트라도 다른 이벤트와 연결되어 있으면 포함)
                    if (group.events.length > 0) {
                        console.log('Found connected group:', group.name, 'with', group.events.length, 'events:', group.events.map(e => e.name));
                        groups.push(group);
                    } else {
                        // 연결되지 않은 이벤트는 visited에서 제거하여 나중에 개별 처리
                        visited.delete(event.name);
                    }
                } else {
                    // 연결되지 않은 이벤트는 visited에서 제거하여 나중에 개별 처리
                    visited.delete(event.name);
                }
            });
            
            console.log('Total connected groups found:', groups.length);
            return groups;
        },

        findConnectedEvents(startEvent, allEvents, visited) {
            const group = {
                events: [],
                name: '',
                description: ''
            };
            
            const queue = [startEvent];
            console.log('Starting connected event search from:', startEvent.name, 'with nextEvents:', startEvent.nextEvents);
            
            while (queue.length > 0) {
                const currentEvent = queue.shift();
                if (visited.has(currentEvent.name)) continue;
                
                visited.add(currentEvent.name);
                group.events.push(currentEvent);
                
                // nextEvents가 있는 경우 연결된 이벤트들 추가
                if (currentEvent.nextEvents && currentEvent.nextEvents.length > 0) {
                    currentEvent.nextEvents.forEach(nextEventName => {
                        // 정규화된 이름으로 이벤트 찾기
                        const nextEvent = allEvents.find(e => e.normName === nextEventName);
                        if (nextEvent && !visited.has(nextEvent.name)) {
                            console.log('Found connected event:', currentEvent.name, '->', nextEvent.name, '(normName:', nextEventName, ')');
                            queue.push(nextEvent);
                        } else {
                            console.log('Could not find connected event:', currentEvent.name, '->', nextEventName);
                        }
                    });
                }
                
                // 현재 이벤트를 nextEvents로 가진 다른 이벤트들도 찾아서 추가
                allEvents.forEach(otherEvent => {
                    if (otherEvent.nextEvents && otherEvent.nextEvents.includes(currentEvent.normName) && !visited.has(otherEvent.name)) {
                        console.log('Found incoming connection:', otherEvent.name, '->', currentEvent.name);
                        queue.push(otherEvent);
                    }
                });
            }
            
            // 그룹 이름과 설명 생성
            if (group.events.length > 0) {
                const mainActor = group.events[0].actor;
                const actorCount = new Set(group.events.map(e => e.actor)).size;
                
                // 프로세스 이름 생성
                const processName = this.generateProcessName(group.events);
                
                if (actorCount === 1) {
                    group.name = processName || mainActor;
                    group.description = `${mainActor} 관련 프로세스`;
                } else {
                    group.name = processName || `Multi-Actor Process`;
                    group.description = `다중 액터 협업 프로세스`;
                }
            }
            
            return group;
        },

        findUnconnectedEventGroups(events, connectedGroups) {
            const groups = [];
            const usedEvents = new Set();
            
            // 연결된 그룹에서 사용된 이벤트들 표시
            connectedGroups.forEach(group => {
                group.events.forEach(event => {
                    usedEvents.add(event.name);
                });
            });
            
            // 사용되지 않은 이벤트들을 개별 세트로 만들기
            const unusedEvents = events.filter(event => !usedEvents.has(event.name));
            
            console.log('Unconnected events found:', unusedEvents.length, unusedEvents.map(e => e.name));
            
            unusedEvents.forEach(event => {
                groups.push({
                    name: `${event.actor} - ${event.displayName || event.name}`,
                    description: `${event.actor}의 독립적인 프로세스`,
                    events: [event]
                });
            });
            
            return groups;
        },

        generateProcessName(events) {
            if (!events || events.length === 0) return null;
            
            // 이벤트들을 레벨 순으로 정렬
            const sortedEvents = [...events].sort((a, b) => a.level - b.level);
            
            if (sortedEvents.length === 1) {
                // 단일 이벤트인 경우
                return sortedEvents[0].displayName || sortedEvents[0].name;
            } else {
                // 여러 이벤트인 경우: 시작 이벤트 ~ 끝 이벤트
                const startEvent = sortedEvents[0];
                const endEvent = sortedEvents[sortedEvents.length - 1];
                
                const startName = startEvent.displayName || startEvent.name;
                const endName = endEvent.displayName || endEvent.name;
                
                return `${startName} ~ ${endName}`;
            }
        },

        generateProcessSetBPMN(events, actors) {
            if (!events || events.length === 0) return '';
            
            console.log('Generating BPMN for process set with', events.length, 'events:', events.map(e => e.name));
            console.log('Actors:', actors.map(a => a.name));

            const normalize = str => {
                if (!str) return '';
                return String(str)
                    .trim()
                    .replace(/[^a-zA-Z0-9가-힣]/g, '')
                    .toLowerCase();
            };

            // 프로세스 세트별 레인 생성
            const actorNames = Array.from(new Set([
                ...actors.map(a => a.name),
                ...events.map(e => e.actor)
            ]));
            const lanes = actorNames.map((name, idx) => ({
                name,
                normName: normalize(name),
                idx,
                id: `Lane_${idx}`
            }));

            // 레이아웃 상수
            const nodeWidth = 120;
            const nodeHeight = 70;
            const margin = 40;
            const xStart = 60;
            const xGap = 180;

            // 레인 높이/위치 계산 - 프로세스 세트별로 독립적으로 계산
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

                // 레벨별로 노드 배치 - 프로세스 세트별로 독립적인 y좌표 계산
                let levelYs = [];
                let currentLevelY = 0;
                const levelEntries = Object.entries(levelGroups).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
                levelEntries.forEach(([level, eventsInLevel], i) => {
                    const n = eventsInLevel.length;
                    const levelHeight = Math.max(nodeHeight, (n - 1) * (nodeHeight + margin) + nodeHeight);
                    const startY = currentLevelY;
                    eventsInLevel.forEach((ev, idx) => {
                        ev._bpmn_y = startY + idx * (nodeHeight + margin);
                        levelYs.push(ev._bpmn_y);
                    });
                    currentLevelY += levelHeight;
                    if (i < levelEntries.length - 1) currentLevelY += margin;
                });

                const minY = Math.min(...levelYs);
                const maxY = Math.max(...levelYs) + nodeHeight;
                const laneHeight = (maxY - minY) + margin * 2;
                lane.y = currentY;
                lane.height = laneHeight;

                const nodesCenterY = (minY + maxY) / 2;
                const laneCenterY = lane.y + lane.height / 2;
                const offset = laneCenterY - nodesCenterY;
                actorEvents.forEach(ev => {
                    ev._bpmn_y += offset;
                });

                currentY += lane.height;
            });

            // x좌표 계산 - 프로세스 세트별로 독립적으로 계산
            const levels = events.map(ev => ev.level);
            const minLevel = levels.length > 0 ? Math.min(...levels) : 0;
            events.forEach(ev => {
                // 프로세스 세트별로 독립적인 x좌표 계산
                ev._bpmn_x = xStart + (ev.level - minLevel) * xGap;
            });

            // BPMN XML 생성
            const lanesXml = lanes.map(lane => {
                const actorEvents = events.filter(ev => ev.normActor === lane.normName);
                return `
                    <bpmn:lane id="${lane.id}" name="${lane.name}">
                        ${actorEvents.map(ev => `<bpmn:flowNodeRef>${ev.normName}</bpmn:flowNodeRef>`).join('\n')}
                    </bpmn:lane>
                `;
            }).join('\n');

            const flowNodes = events.map(ev => {
                return `<bpmn:task id="${ev.normName}" name="${ev.displayName || ev.name}" />`;
            }).join('\n');

            const sequenceFlows = [];
            events.forEach(ev => {
                if (ev.nextEvents) {
                    ev.nextEvents.forEach(next => {
                        const nextNorm = normalize(next);
                        const nextEvent = events.find(e => e.normName === nextNorm);
                        if (nextEvent) { // 같은 프로세스 세트 내의 이벤트만 연결
                            sequenceFlows.push(
                                `<bpmn:sequenceFlow id="Flow_${ev.normName}_to_${nextNorm}" sourceRef="${ev.normName}" targetRef="${nextNorm}" />`
                            );
                        }
                    });
                }
            });

            const bpmnEdges = sequenceFlows.map(flowXml => {
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

            const bpmnShapes = events.map(ev => {
                let x = ev._bpmn_x;
                let y = ev._bpmn_y;
                let width = nodeWidth, height = nodeHeight;
                return `<bpmndi:BPMNShape id="Shape_${ev.normName}" bpmnElement="${ev.normName}">
                    <dc:Bounds x="${x}" y="${y}" width="${width}" height="${height}"/>
                </bpmndi:BPMNShape>`;
            }).join('\n');

            const bpmnLaneShapes = lanes.map((lane, idx) => {
                const laneWidth = xStart + (Math.max(...levels) - minLevel) * xGap + nodeWidth + 300;
                return `                    <bpmndi:BPMNShape id="Shape_${lane.id}" bpmnElement="${lane.id}">
                        <dc:Bounds x="0" y="${lane.y}" width="${laneWidth}" height="${lane.height}" />
                        <bpmndi:BPMNLabel>
                          <dc:Bounds x="20" y="${lane.y + 10}" width="300" height="40" />
                        </bpmndi:BPMNLabel>
                    </bpmndi:BPMNShape>
                `;
            }).join('\n');

            const totalWidth = xStart + (Math.max(...levels) - minLevel) * xGap + nodeWidth + 120;
            const totalHeight = lanes.length > 0 ? (lanes[lanes.length-1].y + lanes[lanes.length-1].height + 80) : 800;

            return `<?xml version="1.0" encoding="UTF-8"?>
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
        },

        generateFullBPMN(actors, events) {
            // 기존의 전체 BPMN 생성 로직 (기존 코드와 동일)
            const normalize = str => {
                if (!str) return '';
                return String(str)
                    .trim()
                    .replace(/[^a-zA-Z0-9가-힣]/g, '')
                    .toLowerCase();
            };

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
            if (this.processSets.length > 0 && this.activeTab !== null) {
                const originalXml = this.processSets[this.activeTab].originalXml;
                if (originalXml) {
                    this.$refs.bpmnEditor.importDiagram(originalXml);
                }
            } else if (this.originalBpmXml) {
                this.bpmXml = this.originalBpmXml;
            }
        },
        onBpmnXmlUpdate(newXml) {
            // XML이 실제로 변경된 경우에만 업데이트
            if (newXml !== this.currentBpmXml) {
                console.log('BPMN XML updated, length:', newXml.length);
                // 동적으로 생성되는 XML이므로 별도 저장 불필요
            }
        },
        printXML() {
            console.log(this.bpmXml);
        },

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

.process-tabs {
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
    padding: 0 16px;
}

.canvas-controls {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 10px;
    padding: 8px 0;
}

.process-tabs .v-tab {
    text-transform: none;
    font-weight: 500;
    min-height: 48px;
}

.process-tabs .v-tab--active {
    background: white;
    border-radius: 8px 8px 0 0;
    box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
}
</style>