/**
 * RequirementsValidationGeneratorLangGraph
 * 
 * LangGraph 백엔드를 사용하는 Requirements Validation Generator
 * 단일 요청 처리 (요구사항 짧을 때)
 */
const RequirementsValidatorLangGraphProxy = require('./proxies/RequirementsValidatorLangGraphProxy/RequirementsValidatorLangGraphProxy');

class RequirementsValidationGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.resolveCurrentProcess = null;
        this.rejectCurrentProcess = null;
        this.jobId = null;
    }

    /**
     * 요구사항 검증 (단일 요청)
     * 
     * @param {string} requirementsText - 요구사항 텍스트
     * @returns {Promise<Object>} 분석 결과
     */
    async generate() {
        const requirementsText = this.client.input && this.client.input.requirements 
            ? this.client.input.requirements.userStory 
            : '';

        if (!requirementsText || requirementsText.length === 0) {
            console.error('[RequirementsValidationGeneratorLangGraph] No requirements text provided');
            throw new Error('Requirements text is required');
        }

        this.jobId = this._generateJobId();
        
        try {
            await RequirementsValidatorLangGraphProxy.makeNewJob(
                this.jobId,
                requirementsText
            );
            
            return new Promise((resolve, reject) => {
                let isResolved = false;
                
                RequirementsValidatorLangGraphProxy.watchJob(
                    this.jobId,
                    // onUpdate - 단일 객체를 받음
                    async (result) => {
                        const progress = result.progress || 0;
                        const currentGeneratedLength = typeof result.currentGeneratedLength === 'number'
                            ? result.currentGeneratedLength
                            : this._getGeneratedLength(result && result.content);

                        if (this.client.onModelCreated) {
                            this.client.onModelCreated({
                                modelValue: {
                                    output: { currentGeneratedLength }
                                }
                            });
                        }

                        // 단일 요청에서는 업데이트 전달
                        if (this.client.onGenerationUpdate) {
                            this.client.onGenerationUpdate(result, progress);
                        }
                    },
                    // onComplete - 단일 객체를 받음
                    async (result) => {
                        if (isResolved) {
                            return;
                        }
                        
                        if (result.isFailed) {
                            isResolved = true;
                            console.error('[RequirementsValidationGeneratorLangGraph] Job failed');
                            
                            if (this.client.onGenerationError) {
                                this.client.onGenerationError(new Error('Requirements validation failed'));
                            }
                            reject(new Error('Requirements validation failed'));
                            return;
                        }
                        
                        // result = { type, content, logs, progress, isFailed }
                        const content = result.content || {};
                        const backendLength = typeof result.currentGeneratedLength === 'number'
                            ? result.currentGeneratedLength
                            : null;
                        
                        // Enhancement Guide인 경우 (방어 코드 - 실제로는 발생하지 않음)
                        if (result.type === "ENHANCEMENT_GUIDE") {
                            console.warn('[RequirementsValidationGeneratorLangGraph] Unexpected ENHANCEMENT_GUIDE type, treating as empty result');
                            // ENHANCEMENT_GUIDE는 생성되지 않아야 하므로 빈 결과로 변환
                            content.events = [];
                            content.actors = [];
                        }
                        
                        // 결과 검증
                        if (!content.events || content.events.length === 0) {
                            console.warn('[RequirementsValidationGeneratorLangGraph] No events generated');
                            const emptyResult = this._formatResult(content);
                            emptyResult.currentGeneratedLength = backendLength !== null
                                ? backendLength
                                : this._getGeneratedLength(content);

                            if (this.client.onModelCreated) {
                                this.client.onModelCreated({
                                    modelValue: {
                                        output: { currentGeneratedLength: emptyResult.currentGeneratedLength }
                                    }
                                });
                            }
                            
                            if (this.client.onGenerationSucceeded) {
                                this.client.onGenerationSucceeded({
                                    modelValue: {
                                        output: emptyResult
                                    }
                                });
                            }
                            isResolved = true;
                            resolve(emptyResult);
                            return;
                        }
                        
                        // 성공 결과 처리
                        const formattedResult = this._formatResult(content);
                        formattedResult.currentGeneratedLength = backendLength !== null
                            ? backendLength
                            : this._getGeneratedLength(content);

                        if (this.client.onModelCreated) {
                            this.client.onModelCreated({
                                modelValue: {
                                    output: { currentGeneratedLength: formattedResult.currentGeneratedLength }
                                }
                            });
                        }
                        
                        console.log('[RequirementsValidationGeneratorLangGraph] ✅ 검증 완료', {
                            events: formattedResult.analysisResult.events.length,
                            actors: formattedResult.analysisResult.actors.length
                        });
                        
                        if (this.client.onGenerationSucceeded) {
                            // ESDialoger.vue의 onGenerationSucceeded는 returnObj.modelValue.output를 기대
                            this.client.onGenerationSucceeded({
                                modelValue: {
                                    output: formattedResult
                                }
                            });
                        }
                        
                        isResolved = true;
                        resolve(formattedResult);
                    },
                    // onWaiting
                    async (waitingJobCount) => {
                        console.log(`[RequirementsValidationGeneratorLangGraph] Waiting... (${waitingJobCount} jobs ahead)`);
                        if (this.client.onGenerationWaiting) {
                            this.client.onGenerationWaiting(waitingJobCount);
                        }
                    },
                    // onFailed
                    async (errorMsg) => {
                        if (isResolved) {
                            return;
                        }
                        
                        console.error('[RequirementsValidationGeneratorLangGraph] Job failed:', errorMsg);
                        
                        if (this.client.onGenerationError) {
                            this.client.onGenerationError(new Error(errorMsg || 'Requirements validation failed'));
                        }
                        
                        isResolved = true;
                        reject(new Error(errorMsg || 'Requirements validation failed'));
                    }
                );
            });
        } catch (error) {
            console.error('[RequirementsValidationGeneratorLangGraph] Error:', error);
            if (this.client.onGenerationError) {
                this.client.onGenerationError(error);
            }
            throw error;
        }
    }

    /**
     * 백엔드 결과를 프론트엔드 형식으로 변환
     */
    _formatResult(backendResult) {
        // 백엔드 결과 구조:
        // { events: [...], actors: [...], recommendedBoundedContextsNumber: N, reasonOfRecommendedBoundedContextsNumber: "..." }
        
        return {
            type: "ANALYSIS_RESULT",
            projectName: "Requirements Analysis",
            content: this._createModelElements(backendResult),
            analysisResult: {
                events: backendResult.events || [],
                actors: backendResult.actors || [],
                recommendedBoundedContextsNumber: backendResult.recommendedBoundedContextsNumber || 3,
                reasonOfRecommendedBoundedContextsNumber: backendResult.reasonOfRecommendedBoundedContextsNumber || ""
            }
        };
    }

    _getGeneratedLength(data) {
        if (!data) {
            return 0;
        }
        try {
            return JSON.stringify(data).length;
        } catch (e) {
            return String(data).length;
        }
    }

    /**
     * 모델 요소 생성 (Event Storming Canvas용)
     */
    _createModelElements(analysisResult) {
        const LANE_HEIGHT = 250;
        const ACTOR_MARGIN_LEFT = 150;
        const EVENT_START_X = 300;
        const EVENT_SPACING = 200;
        const INITIAL_Y = 150;
        
        let actorLanes = {};
        let modelElements = {};
        let relations = {}; 
        let eventElements = {}; 

        if (analysisResult && analysisResult.actors && analysisResult.events) {
            // Actor 생성 및 위치 설정
            analysisResult.actors.forEach((actor, idx) => {
                const actorUuid = this._uuid();
                const laneY = INITIAL_Y + idx * LANE_HEIGHT;
                actorLanes[actor.name] = idx;
                
                // Actor 생성
                modelElements[actorUuid] = this._createActor(
                    actor,
                    actorUuid,
                    ACTOR_MARGIN_LEFT,
                    laneY
                );

                // 스위레인 라인 생성
                if (idx < analysisResult.actors.length) {
                    const laneUuid = this._uuid();
                    relations[laneUuid] = this._createSwimLane(
                        laneUuid,
                        laneY + LANE_HEIGHT/2,
                        0,
                        2000
                    );
                }
            });

            // 각 Actor별 이벤트 그룹화
            let eventsByActor = {};
            analysisResult.events.forEach(event => {
                if (!eventsByActor[event.actor]) {
                    eventsByActor[event.actor] = [];
                }
                eventsByActor[event.actor].push(event);
            });

            // 이벤트 생성 및 배치
            Object.entries(eventsByActor).forEach(([actorName, events]) => {
                const actorLane = actorLanes[actorName];
                events.forEach((event, eventIdx) => {
                    const elementUuid = this._uuid();
                    const eventElement = this._createEvent(
                        event,
                        elementUuid,
                        EVENT_START_X + eventIdx * EVENT_SPACING,
                        INITIAL_Y + actorLane * LANE_HEIGHT
                    );
                    modelElements[elementUuid] = eventElement;
                    eventElements[event.name] = eventElement;
                });
            });

            // 이벤트 간 관계 생성
            analysisResult.events.forEach(event => {
                if (event.nextEvents && event.nextEvents.length > 0) {
                    const sourceEvent = eventElements[event.name];
                    
                    event.nextEvents.forEach(nextEventName => {
                        const targetEvent = eventElements[nextEventName];
                        if (sourceEvent && targetEvent) {
                            const relationId = this._uuid();
                            relations[relationId] = this._createRelation(
                                sourceEvent,
                                targetEvent,
                                relationId,
                                event.level 
                            );
                        }
                    });
                }
            });
        }

        return {
            elements: modelElements,
            relations: relations
        };
    }

    _createEvent(event, elementId, x, y) {
        return {
            _type: 'org.uengine.modeling.model.Event',
            id: elementId,
            visibility: 'public',
            name: event.name,
            oldName: '',
            displayName: event.displayName,
            namePascalCase: event.name,
            nameCamelCase: event.name.charAt(0).toLowerCase() + event.name.slice(1),
            namePlural: '',
            description: event.description || null,
            author: null,
            aggregate: {},
            boundedContext: {},
            fieldDescriptors: [
                {
                    _type: "org.uengine.model.FieldDescriptor",
                    name: "id",
                    className: "Long",
                    nameCamelCase: 'id',
                    namePascalCase: 'Id',
                    isKey: true
                }
            ],
            mirrorElement: null,
            elementView: {
                '_type': 'org.uengine.modeling.model.Event',
                'id': elementId,
                'x': x,
                'y': y,
                'width': 100,
                'height': 100,
                'style': JSON.stringify({}),
                'angle': 0,
            },
            hexagonalView: {
                '_type': 'org.uengine.modeling.model.EventHexagonal',
                'id': elementId,
                'x': x,
                'y': y,
                'subWidth': 100,
                'width': 20,
                'height': 20,
                'style': JSON.stringify({})
            },
            relationPolicyInfo: [],
            relationCommandInfo: [],
            trigger: '@PostPersist'
        };
    }

    _createActor(actor, actorId, x, y) {
        return {
            _type: 'org.uengine.modeling.model.Actor',
            id: actorId,
            name: actor.name,
            oldName: '',
            displayName: '',
            description: '',
            author: null,
            elementView: {
                '_type': 'org.uengine.modeling.model.Actor',
                'id': actorId,
                'x': x,
                'y': y,
                'width': 100,
                'height': 100,
                'style': JSON.stringify({})
            },
            boundedContext: {}
        };
    }

    _createSwimLane(laneId, y, startX, endX) {
        return {
            _type: 'org.uengine.modeling.model.Line',
            id: laneId,
            name: '',
            author: null,
            oldName: '',
            displayName: '',
            from: laneId,
            to: laneId,
            description: '',
            relationView: {
                id: laneId,
                value: `[[${startX},${y}],[${endX},${y}]]`
            },
            size: 10,
            color: '#cccccc',
            dashStyle: '3,3',
            imgSrc: 'https://www.msaez.io:8081/static/image/symbol/edge.png',
            vertices: `[[${startX},${y}],[${endX},${y}]]`
        };
    }

    _createRelation(fromEvent, toEvent, relationId, level) {
        return {
            _type: 'org.uengine.modeling.model.Relation',
            id: relationId,
            name: `${level}`,
            displayName: `${level}`,
            sourceElement: fromEvent,
            targetElement: toEvent,
            from: fromEvent.id,
            to: toEvent.id,
            relationView: {
                id: relationId,
                style: JSON.stringify({
                    "arrow-start": "none",
                    "arrow-end": "block",
                    "stroke": "grey",
                    "stroke-width": "1.4",
                    "font-size": "12px",
                    "font-weight": "bold"
                }),
                value: null,
                from: fromEvent.id,
                to: toEvent.id,
                needReconnect: true
            }
        };
    }

    _uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    _generateJobId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return `req-valid-${timestamp}-${random}`;
    }
}

module.exports = RequirementsValidationGeneratorLangGraph;

