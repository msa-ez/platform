/**
 * RecursiveRequirementsValidationGeneratorLangGraph
 * 
 * LangGraph 백엔드를 사용하는 Requirements Validation Generator
 * 재귀적 청크 처리 (요구사항 길 때)
 */
const RequirementsValidatorLangGraphProxy = require('./proxies/RequirementsValidatorLangGraphProxy/RequirementsValidatorLangGraphProxy');
const TextChunker = require('./TextChunker');

class RecursiveRequirementsValidationGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.resolveCurrentProcess = null;
        this.rejectCurrentProcess = null;
        this.jobId = null;
        
        // TextChunker 설정
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 2000
        });
        
        this.currentChunks = [];
        this.currentChunkIndex = 0;
        this.isProcessingChunk = false;
        
        // 누적 결과
        this.accumulatedResults = {
            type: "ANALYSIS_RESULT",
            projectName: "Requirements Analysis",
            content: {
                elements: {},
                relations: {}
            },
            analysisResult: {
                events: [],
                actors: [],
                recommendedBoundedContextsNumber: 3,
                reasonOfRecommendedBoundedContextsNumber: ""
            }
        };

        // 위치 추적
        this.positionTracker = {
            actorPositions: {},
            lastEventXByActor: {},
            lastActorY: 150
        };
    }

    /**
     * 요구사항 검증 (재귀적)
     * 
     * @param {string} requirementsText - 요구사항 텍스트
     * @returns {Promise<Object>} 누적된 분석 결과
     */
    async validateRecursively(requirementsText) {
        if (!requirementsText || requirementsText.length === 0) {
            console.error('[RecursiveRequirementsValidationGeneratorLangGraph] No requirements text provided');
            throw new Error('Requirements text is required');
        }

        // 청크로 분할
        this.currentChunks = this.textChunker.splitIntoChunksByLine(requirementsText);
        this.currentChunkIndex = 0;
        this.accumulatedResults = {
            type: "ANALYSIS_RESULT",
            projectName: "Requirements Analysis",
            content: {
                elements: {},
                relations: {}
            },
            analysisResult: {
                events: [],
                actors: [],
                recommendedBoundedContextsNumber: 3,
                reasonOfRecommendedBoundedContextsNumber: ""
            }
        };
        
        console.log(`[RecursiveRequirementsValidationGeneratorLangGraph] ${this.currentChunks.length}개 청크로 분할`);
        
        return new Promise((resolve, reject) => {
            this.resolveCurrentProcess = resolve;
            this.rejectCurrentProcess = reject;
            this.processNextChunk();
        });
    }

    /**
     * 다음 청크 처리 (재귀적)
     */
    async processNextChunk() {
        if (this.currentChunkIndex < this.currentChunks.length) {
            const chunkData = this.currentChunks[this.currentChunkIndex];
            const chunkNumber = this.currentChunkIndex + 1;
            const totalChunks = this.currentChunks.length;
            
            console.log(`[RecursiveRequirementsValidationGeneratorLangGraph] 청크 ${chunkNumber}/${totalChunks} 처리 중...`);
            
            this.jobId = this._generateJobId();
            
            try {
                // 이전 청크의 요약 정보 생성
                const existingSummary = this._createExistingSummary();
                
                // Firebase Job 생성
                await RequirementsValidatorLangGraphProxy.makeNewJob(
                    this.jobId,
                    chunkData.text,
                    existingSummary
                );
                
                // Job 완료를 Promise로 기다림
                await new Promise((resolve, reject) => {
                    this.chunkResolve = resolve;
                    this.chunkReject = reject;
                    
                    RequirementsValidatorLangGraphProxy.watchJob(
                        this.jobId,
                        // onUpdate - 단일 객체를 받음
                        async (result) => {
                            await this._handleUpdate(result);
                        },
                        // onComplete - 단일 객체를 받음
                        async (result) => {
                            await this._handleChunkComplete(result);
                        },
                        // onWaiting
                        async (waitingJobCount) => {
                            await this._handleWaiting(waitingJobCount);
                        },
                        // onFailed
                        async (errorMsg) => {
                            await this._handleFailed(errorMsg);
                        }
                    );
                });
                
                // 다음 청크 처리
                this.currentChunkIndex++;
                await this.processNextChunk();
                
            } catch (error) {
                console.error('[RecursiveRequirementsValidationGeneratorLangGraph] Chunk processing failed:', error);
                if (this.rejectCurrentProcess) {
                    this.rejectCurrentProcess(error);
                }
                return;
            }
        } else {
            // 모든 청크 처리 완료
            console.log(`[RecursiveRequirementsValidationGeneratorLangGraph] ✅ 완료 - 총 ${this.accumulatedResults.analysisResult.events.length}개 이벤트, ${this.accumulatedResults.analysisResult.actors.length}개 액터`);
            
            if (this.resolveCurrentProcess) {
                this.resolveCurrentProcess(this.accumulatedResults);
            }
        }
    }

    /**
     * 업데이트 핸들러
     * @param {Object} result - { type, content, logs, progress, isFailed }
     */
    async _handleUpdate(result) {
        const progress = result.progress || 0;
        console.log(`[RecursiveRequirementsValidationGeneratorLangGraph] Update - progress: ${progress}%`);

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
        
        if (this.client.onGenerationUpdate) {
            this.client.onGenerationUpdate(this.accumulatedResults, progress);
        }
    }

    /**
     * 청크 완료 처리 (기존 RecursiveRequirementsValidationGenerator 방식과 호환)
     * ESDialoger의 onGenerationFinished → onGenerationSucceeded에서 호출됨
     */
    handleGenerationFinished(model) {
        try {
            if (model) {
                // 결과 누적
                this._accumulateResults(model);
                
                const newEvents = model.analysisResult && model.analysisResult.events ? model.analysisResult.events.length : 0;
                const newActors = model.analysisResult && model.analysisResult.actors ? model.analysisResult.actors.length : 0;
                
                // 누적 결과 로그
                console.log(`[RecursiveRequirementsValidationGeneratorLangGraph] 청크 ${this.currentChunkIndex + 1}/${this.currentChunks.length}: +${newEvents}개 이벤트, +${newActors}개 액터 → 총 ${this.accumulatedResults.analysisResult.events.length}개 이벤트, ${this.accumulatedResults.analysisResult.actors.length}개 액터`);
            }
            
            // 현재 청크 완료 - Promise resolve하여 processNextChunk의 await 해제
            if (this.chunkResolve) {
                console.log('[RecursiveRequirementsValidationGeneratorLangGraph] Resolving chunk promise');
                this.chunkResolve();
                this.chunkResolve = null;
                this.chunkReject = null;
            }
            
            return this.accumulatedResults;
        } catch (e) {
            console.error('[RecursiveRequirementsValidationGeneratorLangGraph] Error in handleGenerationFinished:', e);
            if (this.chunkReject) {
                this.chunkReject(e);
                this.chunkResolve = null;
                this.chunkReject = null;
            }
            return this.accumulatedResults;
        }
    }

    /**
     * 청크 완료 핸들러 (Firebase 이벤트 핸들러)
     * @param {Object} result - { type, content, logs, progress, isFailed }
     */
    async _handleChunkComplete(result) {
        if (result.isFailed) {
            console.error('[RecursiveRequirementsValidationGeneratorLangGraph] Chunk failed');
            if (this.chunkReject) {
                this.chunkReject(new Error('Chunk processing failed'));
            }
            return;
        }

        // result.content = { events: [...], actors: [...], recommendedBoundedContextsNumber: ..., ... }
        const content = result.content || {};

        // Enhancement Guide인 경우 (방어 코드 - 실제로는 발생하지 않음)
        if (result.type === "ENHANCEMENT_GUIDE") {
            console.warn('[RecursiveRequirementsValidationGeneratorLangGraph] Unexpected ENHANCEMENT_GUIDE type, treating as empty result');
            // ENHANCEMENT_GUIDE는 생성되지 않아야 하므로 빈 결과로 변환
            content.events = [];
            content.actors = [];
        }

        // 결과가 비어있으면 빈 결과로 간주하고 계속 진행
        if (!content.events || content.events.length === 0) {
            console.warn('[RecursiveRequirementsValidationGeneratorLangGraph] Empty chunk result, continuing...');
            
            // 빈 결과도 ESDialoger에 전달
            const emptyModel = this._formatResult(content);
            const emptyLength = typeof result.currentGeneratedLength === 'number'
                ? result.currentGeneratedLength
                : this._getGeneratedLength(content);
            if (this.client.onModelCreated) {
                this.client.onModelCreated({ modelValue: { output: { currentGeneratedLength: emptyLength } } });
            }
            if (this.client.onGenerationSucceeded) {
                this.client.onGenerationSucceeded({ modelValue: { output: emptyModel } });
            }
            return;
        }

        // 결과를 모델 형식으로 변환
        const model = this._formatResult(content);
        const currentGeneratedLength = typeof result.currentGeneratedLength === 'number'
            ? result.currentGeneratedLength
            : this._getGeneratedLength(content);
        
        console.log(`[RecursiveRequirementsValidationGeneratorLangGraph] 청크 ${this.currentChunkIndex + 1}/${this.currentChunks.length} 완료: ${content.events.length}개 이벤트, ${content.actors.length}개 액터`);
        
        if (this.client.onModelCreated) {
            this.client.onModelCreated({
                modelValue: {
                    output: { currentGeneratedLength }
                }
            });
        }

        // ESDialoger의 onGenerationSucceeded를 통해 처리 (기존 방식과 동일)
        if (this.client.onGenerationSucceeded) {
            this.client.onGenerationSucceeded({ modelValue: { output: model } });
        }
    }

    /**
     * 대기 핸들러
     */
    async _handleWaiting(waitingJobCount) {
        console.log(`[RecursiveRequirementsValidationGeneratorLangGraph] Waiting... (${waitingJobCount} jobs ahead)`);
        
        if (this.client.onGenerationWaiting) {
            this.client.onGenerationWaiting(waitingJobCount);
        }
    }

    /**
     * 실패 핸들러
     */
    async _handleFailed(errorMsg) {
        console.error('[RecursiveRequirementsValidationGeneratorLangGraph] Job failed:', errorMsg);
        
        if (this.client.onGenerationError) {
            this.client.onGenerationError(new Error(errorMsg || 'Requirements validation failed'));
        }
        
        if (this.chunkReject) {
            this.chunkReject(new Error(errorMsg || 'Requirements validation failed'));
        }
    }

    /**
     * 이전 청크의 요약 정보 생성
     */
    _createExistingSummary() {
        if (this.currentChunkIndex === 0) {
            return null;
        }

        const events = this.accumulatedResults.analysisResult.events.map(e => ({
            name: e.name,
            actor: e.actor,
            nextEvents: e.nextEvents || []
        }));

        const actors = this.accumulatedResults.analysisResult.actors.map(a => ({
            name: a.name,
            events: a.events || []
        }));

        return {
            events: events,
            actors: actors
        };
    }

    /**
     * 결과 누적
     *
     * ⚠️ 청크 1+ 분기는 immutable-style 로 새 최상위 참조를 만든다.
     *    과거에는 `accumulatedResults.content.elements = {...}`, `events.push(...)` 처럼
     *    in-place 변경만 해서 `accumulatedResults` 의 참조가 그대로였음. 그 결과 ESDialoger 의
     *    `updateMessageState({content: accumulatedResults})` 가 같은 참조를 다시 박았고,
     *    `RequirementAnalysis` 의 `analysisResult` 프롭 참조도 안 바뀌어 와처가 안 깨어남.
     *    → 청크 0 만 그려지고 중간 청크가 화면에 반영 안 됐던 원인. 마지막 청크에서만
     *    `processingRate=0` 등 다른 프롭 변화로 우연히 리렌더 트리거.
     *
     *    매번 fresh 최상위 + content/analysisResult 도 fresh 객체 + events/actors 도 fresh 배열을
     *    만들어 Vue 프롭 비교에서 항상 "바뀐 것"으로 인식되게 한다.
     *
     * @param {Object} result - 백엔드 content 객체 또는 _formatResult로 변환된 model
     */
    _accumulateResults(result) {
        if (!result) {
            console.error("Invalid result for accumulation:", result);
            return;
        }

        // _formatResult로 변환된 model인 경우 (analysisResult 프로퍼티 존재)
        if (result.analysisResult) {
            // 첫 번째 청크인 경우
            if (this.currentChunkIndex === 0) {
                this.accumulatedResults = {
                    ...result,
                    currentGeneratedLength: this._getGeneratedLength(result.analysisResult)
                };
                return;
            }

            // 두 번째 이후 청크: 새 참조로 재구성
            const prev = this.accumulatedResults;
            const prevAnalysis = prev.analysisResult || { events: [], actors: [] };
            const incoming = result.analysisResult || { events: [], actors: [] };

            const mergedEvents = [...(prevAnalysis.events || [])];
            if (incoming.events && incoming.events.length > 0) {
                const existing = new Set(mergedEvents.map(e => e.name));
                for (const e of incoming.events) {
                    if (!existing.has(e.name)) mergedEvents.push(e);
                }
            }

            const mergedActors = [...(prevAnalysis.actors || [])];
            if (incoming.actors && incoming.actors.length > 0) {
                const existing = new Set(mergedActors.map(a => a.name));
                for (const a of incoming.actors) {
                    if (!existing.has(a.name)) mergedActors.push(a);
                }
            }

            const mergedAnalysis = {
                ...prevAnalysis,
                events: mergedEvents,
                actors: mergedActors,
                recommendedBoundedContextsNumber:
                    incoming.recommendedBoundedContextsNumber || prevAnalysis.recommendedBoundedContextsNumber,
                reasonOfRecommendedBoundedContextsNumber:
                    incoming.reasonOfRecommendedBoundedContextsNumber || prevAnalysis.reasonOfRecommendedBoundedContextsNumber
            };

            this.accumulatedResults = {
                ...prev,
                content: {
                    elements: { ...(prev.content && prev.content.elements), ...(result.content && result.content.elements) },
                    relations: { ...(prev.content && prev.content.relations), ...(result.content && result.content.relations) }
                },
                analysisResult: mergedAnalysis,
                currentGeneratedLength: this._getGeneratedLength(mergedAnalysis)
            };
            return;
        }

        // 백엔드 content 객체인 경우 (events, actors 프로퍼티가 직접 존재)
        if (!result.events || !result.actors) {
            console.error("Invalid result format for accumulation:", result);
            return;
        }

        // 첫 번째 청크인 경우
        if (this.currentChunkIndex === 0) {
            const formatted = this._formatResult(result);
            this.accumulatedResults = {
                ...formatted,
                currentGeneratedLength: this._getGeneratedLength(formatted.analysisResult)
            };
            return;
        }

        // 두 번째 이후 청크: 새 참조로 재구성
        const prev = this.accumulatedResults;
        const prevAnalysis = prev.analysisResult || { events: [], actors: [] };
        const incrementalElements = this._createIncrementalElements(result);

        const mergedEvents = [...(prevAnalysis.events || [])];
        const existingEventNames = new Set(mergedEvents.map(e => e.name));
        for (const e of result.events) {
            if (!existingEventNames.has(e.name)) mergedEvents.push(e);
        }

        const mergedActors = [...(prevAnalysis.actors || [])];
        const existingActorNames = new Set(mergedActors.map(a => a.name));
        for (const a of result.actors) {
            if (!existingActorNames.has(a.name)) mergedActors.push(a);
        }

        const mergedAnalysis = {
            ...prevAnalysis,
            events: mergedEvents,
            actors: mergedActors,
            recommendedBoundedContextsNumber:
                result.recommendedBoundedContextsNumber || prevAnalysis.recommendedBoundedContextsNumber,
            reasonOfRecommendedBoundedContextsNumber:
                result.reasonOfRecommendedBoundedContextsNumber || prevAnalysis.reasonOfRecommendedBoundedContextsNumber
        };

        this.accumulatedResults = {
            ...prev,
            content: {
                elements: { ...(prev.content && prev.content.elements), ...incrementalElements.elements },
                relations: { ...(prev.content && prev.content.relations), ...incrementalElements.relations }
            },
            analysisResult: mergedAnalysis,
            currentGeneratedLength: this._getGeneratedLength(mergedAnalysis)
        };
    }

    /**
     * 증분 요소 생성 (기존 요소와 병합 가능한 형태로)
     */
    _createIncrementalElements(result) {
        const LANE_HEIGHT = 250;
        const ACTOR_MARGIN_LEFT = 150;
        const EVENT_SPACING = 200;
        const INITIAL_Y = 150;
        
        let modelElements = {};
        let relations = {};
        let eventElements = {};

        // 기존 액터들 수집
        const existingActors = Object.values(this.accumulatedResults.content.elements)
            .filter(e => e._type === "org.uengine.modeling.model.Actor");
        const existingActorNames = new Set(existingActors.map(a => a.name));

        // 마지막 액터 Y 좌표
        const lastActorY = existingActors.length > 0 
            ? Math.max(...existingActors.map(a => a.elementView.y))
            : 0;

        // 새로운 액터 생성
        const newActors = result.actors.filter(a => a.name && !existingActorNames.has(a.name));
        newActors.forEach((actor, idx) => {
            const actorUuid = this._uuid();
            const newActorY = lastActorY + ((idx + 1) * LANE_HEIGHT);
            
            modelElements[actorUuid] = this._createActor(
                actor,
                actorUuid,
                ACTOR_MARGIN_LEFT,
                newActorY
            );

            this.positionTracker.actorPositions[actor.name] = newActorY;

            const laneUuid = this._uuid();
            relations[laneUuid] = this._createSwimLane(
                laneUuid,
                newActorY + LANE_HEIGHT/2,
                0,
                2000
            );
        });

        // 이벤트를 액터별로 그룹화
        let eventsByActor = {};
        result.events.forEach(event => {
            if (!event.name || !event.actor) return;
            if (!eventsByActor[event.actor]) {
                eventsByActor[event.actor] = [];
            }
            eventsByActor[event.actor].push(event);
        });

        // 이벤트 생성
        Object.entries(eventsByActor).forEach(([actorName, events]) => {
            // 액터 Y 좌표 찾기
            let actorY;
            const existingActor = existingActors.find(a => a.name === actorName);
            if (existingActor && existingActor.elementView) {
                actorY = existingActor.elementView.y;
            } else if (this.positionTracker.actorPositions[actorName]) {
                actorY = this.positionTracker.actorPositions[actorName];
            }

            if (!actorY) {
                console.warn(`No Y position found for actor: ${actorName}`);
                return;
            }

            // 해당 액터의 마지막 이벤트 X 좌표 찾기
            let lastEventX = this.positionTracker.lastEventXByActor[actorName] || 100;

            events.forEach((event) => {
                if (!event.name) return;
                
                const elementUuid = this._uuid();
                const eventX = lastEventX + EVENT_SPACING;
                lastEventX = eventX;
                
                const eventElement = this._createEvent(
                    event,
                    elementUuid,
                    eventX,
                    actorY
                );
                modelElements[elementUuid] = eventElement;
                eventElements[event.name] = eventElement;
            });

            this.positionTracker.lastEventXByActor[actorName] = lastEventX;
        });

        return {
            elements: modelElements,
            relations: relations
        };
    }

    /**
     * 백엔드 결과를 프론트엔드 형식으로 변환 (첫 번째 청크용)
     */
    _formatResult(backendResult) {
        const analysisResult = {
            events: backendResult.events || [],
            actors: backendResult.actors || [],
            recommendedBoundedContextsNumber: backendResult.recommendedBoundedContextsNumber || 3,
            reasonOfRecommendedBoundedContextsNumber: backendResult.reasonOfRecommendedBoundedContextsNumber || ""
        };

        return {
            type: "ANALYSIS_RESULT",
            projectName: "Requirements Analysis",
            content: this._createModelElements(analysisResult),
            analysisResult,
            currentGeneratedLength: this._getGeneratedLength(analysisResult)
        };
    }

    /**
     * 모델 요소 생성 (첫 번째 청크용)
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
            // Actor 생성
            analysisResult.actors.forEach((actor, idx) => {
                const actorUuid = this._uuid();
                const laneY = INITIAL_Y + idx * LANE_HEIGHT;
                actorLanes[actor.name] = idx;
                
                modelElements[actorUuid] = this._createActor(
                    actor,
                    actorUuid,
                    ACTOR_MARGIN_LEFT,
                    laneY
                );

                this.positionTracker.actorPositions[actor.name] = laneY;

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

            // 이벤트 그룹화
            let eventsByActor = {};
            analysisResult.events.forEach(event => {
                if (!eventsByActor[event.actor]) {
                    eventsByActor[event.actor] = [];
                }
                eventsByActor[event.actor].push(event);
            });

            // 이벤트 생성
            Object.entries(eventsByActor).forEach(([actorName, events]) => {
                const actorLane = actorLanes[actorName];
                let lastEventX = EVENT_START_X;
                
                events.forEach((event, eventIdx) => {
                    const elementUuid = this._uuid();
                    const eventX = EVENT_START_X + eventIdx * EVENT_SPACING;
                    lastEventX = eventX;
                    
                    const eventElement = this._createEvent(
                        event,
                        elementUuid,
                        eventX,
                        INITIAL_Y + actorLane * LANE_HEIGHT
                    );
                    modelElements[elementUuid] = eventElement;
                    eventElements[event.name] = eventElement;
                });

                this.positionTracker.lastEventXByActor[actorName] = lastEventX;
            });

            // 관계 생성
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

module.exports = RecursiveRequirementsValidationGeneratorLangGraph;

