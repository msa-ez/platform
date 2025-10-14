const RequirementsValidationGenerator = require("./RequirementsValidationGenerator");
const TextChunker = require("./TextChunker");
const { TextTraceUtil } = require("./utils");

class RecursiveRequirementsValidationGenerator extends RequirementsValidationGenerator {
    constructor(client) {
        super(client);
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 2000
        });

        this.currentChunks = [];
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
                recommendedBoundedContextsNumber: 3
            }
        };

        // 위치 추적을 위한 속성 추가
        this.positionTracker = {
            actorPositions: {},      // actor name -> y position
            lastEventXByActor: {},   // actor name -> last event x position
            lastActorY: 150          // 마지막 actor의 y position
        };

        this.reset();
        
        // 원본 요구사항과 현재 청크 시작 라인 정보
        this.originalRequirements = '';
        this.currentChunkStartLine = 1;
    }

    // 1. 메인 진입점: 전체 프로세스 제어
    async validateRecursively(text) {
        // 원본 텍스트 저장 (refs 계산에 필요)
        this.originalRequirements = text;
        
        // 라인 인식 청킹 사용
        this.currentChunks = this.textChunker.splitIntoChunksByLine(text);
        
        for (const chunkData of this.currentChunks) {
            await this.processChunk(chunkData);
            this.currentChunkIndex++;
            // validateRecursively에서는 누적하지 않음
        }
    
        return this.getFinalResult();
    }

    // 2. 각 청크 처리
    async processChunk(chunkData) {
        // 현재 청크의 시작 라인 번호 저장
        this.currentChunkStartLine = chunkData.startLine;
        
        this.client.input = {
            requirements: {
                userStory: chunkData.text
            }
        };
        
        return new Promise((resolve) => {
            this.resolveCurrentProcess = resolve;
            this.generate();
        });
    }

    // 3. 결과 누적
    accumulateResults(model) {
        if (!model || !model.content || !model.analysisResult) {
            console.error("Invalid model for accumulation:", model);
            return;
        }
    
        // elements 누적 (content 객체 내부로 수정)
        this.accumulatedResults.content.elements = {
            ...this.accumulatedResults.content.elements,
            ...model.content.elements
        };
    
        // relations 누적 (content 객체 내부로 수정)
        this.accumulatedResults.content.relations = {
            ...this.accumulatedResults.content.relations,
            ...model.content.relations
        };
    
        // events 누적 (중복 제거)
        const existingEventNames = new Set(this.accumulatedResults.analysisResult.events.map(e => e.name));
        const newEvents = model.analysisResult.events.filter(e => !existingEventNames.has(e.name));
        this.accumulatedResults.analysisResult.events.push(...newEvents);
    
        // actors 누적 (중복 제거)
        const existingActorNames = new Set(this.accumulatedResults.analysisResult.actors.map(a => a.name));
        const newActors = model.analysisResult.actors.filter(a => !existingActorNames.has(a.name));
        this.accumulatedResults.analysisResult.actors.push(...newActors);

        this.accumulatedResults.analysisResult.recommendedBoundedContextsNumber = model.analysisResult.recommendedBoundedContextsNumber;
    }

    // 4. 최종 결과 반환
    getFinalResult() {
        if (this.hasValidResults()) {
            return {
                type: "ANALYSIS_RESULT",
                projectName: "Requirements Analysis",
                content: {
                    elements: this.accumulatedResults.content.elements,
                    relations: this.accumulatedResults.content.relations
                },
                analysisResult: this.accumulatedResults.analysisResult
            };
        }
        
        return {
            type: "ENHANCEMENT_GUIDE",
            content: {
                missingElements: {
                    processes: ["전체 프로세스 흐름이 불완전합니다"],
                    flows: ["프로세스 간 연결이 불명확합니다"],
                    teams: ["책임 주체가 불명확한 프로세스가 있습니다"]
                }
            }
        };
    }

    // 5. 결과 유효성 검사
    hasValidResults() {
        return this.accumulatedResults.analysisResult.events.length > 0 && 
               this.accumulatedResults.analysisResult.actors.length > 0;
    }

    // 6. 부모 클래스의 handleGenerationFinished 오버라이드
    handleGenerationFinished(model) {
        // ENHANCEMENT_GUIDE가 와도 빈 ANALYSIS_RESULT로 변환하여 처리 계속
        if (model && model.type === "ENHANCEMENT_GUIDE") {
            console.log("[*] 청크의 요구사항이 불충분하지만, 분석을 계속 진행합니다.");
            model = {
                type: "ANALYSIS_RESULT",
                projectName: "Requirements Analysis",
                content: {
                    elements: {},
                    relations: {}
                },
                analysisResult: {
                    events: [],
                    actors: []
                }
            };
        }
    
        if (model && model.type === "ANALYSIS_RESULT") {
            if (this.currentChunkIndex === 0) {
                // 첫 번째 청크는 단순히 누적
                this.accumulateResults(model);
                this.updatePreviousChunkSummary(model);
            } else {
                model.content.elements = {};
                model.content.relations = {};

                let modelElements = {};
                let relations = {};
                let eventElements = {};
                let eventsByActor = {};
    
                // 기존 Actor들의 정보 수집
                const existingActors = Object.values(this.accumulatedResults.content.elements)
                    .filter(e => e._type === "org.uengine.modeling.model.Actor");
                const existingActorNames = new Set(existingActors.map(a => a.name));
    
                // 이벤트를 액터별로 그룹화 (이름이 있는 것만)
                model.analysisResult.events.forEach(event => {
                    if (!event.name || !event.actor) {
                        console.warn("Invalid event found:", event);
                        return;
                    }
                    if (!eventsByActor[event.actor]) {
                        eventsByActor[event.actor] = [];
                    }
                    eventsByActor[event.actor].push(event);
                });
    
                const lastActorY = existingActors.length > 0 
                    ? Math.max(...existingActors.map(a => a.elementView.y))
                    : 0;
    
                // 새로운 Actor 생성 (중복 및 이름 체크)
                model.analysisResult.actors
                .filter(actor => actor.name && !existingActorNames.has(actor.name))
                .forEach((actor, idx) => {
                    const actorUuid = this._uuid();
                    const newActorY = lastActorY + ((idx + 1) * 250);
                    
                    modelElements[actorUuid] = this._createActor(
                        { name: actor.name },  // name 속성만 있는 객체 전달
                        actorUuid,
                        150,
                        newActorY
                    );

                    this.positionTracker.actorPositions[actor.name] = newActorY;

                    const laneUuid = this._uuid();
                    relations[laneUuid] = this._createSwimLane(
                        laneUuid,
                        newActorY + 125,
                        0,
                        2000
                    );
                });

                // Event 생성 (이름 체크)
                Object.entries(eventsByActor).forEach(([actorName, events]) => {
                    // 해당 액터 찾기 (기존 액터 또는 새로 생성된 액터)
                    let actorY;

                    // 1. 기존 액터에서 찾기
                    const existingActor = existingActors.find(a => a.name === actorName);
                    if (existingActor && existingActor.elementView) {
                        actorY = existingActor.elementView.y;
                    }

                    // 2. 새로 생성된 액터에서 찾기
                    if (!actorY && this.positionTracker.actorPositions[actorName]) {
                        actorY = this.positionTracker.actorPositions[actorName];
                    }

                    if (!actorY) {
                        console.warn(`No Y position found for actor: ${actorName}`);
                        return;
                    }

                    // 해당 액터의 마지막 이벤트 X 좌표 찾기
                    let lastEventX = this.positionTracker.lastEventXByActor[actorName] || 100;

                    events.forEach((event, idx) => {
                        if (!event.name) {
                            console.warn("Event without name:", event);
                            return;
                        }
                        
                        const elementUuid = this._uuid();
                        // 이전 이벤트 다음에 배치
                        const eventX = lastEventX + 200;
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

                    // 마지막 이벤트 X 좌표 업데이트
                    this.positionTracker.lastEventXByActor[actorName] = lastEventX;
                });
        
                model.content.elements = modelElements;
                model.content.relations = relations;
        
                this.accumulateResults(model);
                this.updatePreviousChunkSummary(model);
            }
        }
        
        if (this.resolveCurrentProcess) {
            const currentResult = this.currentChunkIndex < this.currentChunks.length-1 
                ? model  // 중간 청크는 현재 결과 반환
                : this.getFinalResult();  // 마지막 청크는 누적된 최종 결과 반환
                
            console.log(`Resolving chunk ${this.currentChunkIndex+1}/${this.currentChunks.length}`);
                
            this.resolveCurrentProcess(currentResult);
        }
    }

    reset() {
        this.accumulatedResults = {
            type: "ANALYSIS_RESULT",
            projectName: "Requirements Analysis",
            content: {
                elements: {},
                relations: {}
            },
            analysisResult: {
                events: [],
                actors: []
            }
        };
    }

    /**
     * 부모 클래스의 _getLineNumberedRequirements 오버라이드
     * 현재 청크의 시작 라인 번호를 반영하여 라인 번호를 생성
     */
    _getLineNumberedRequirements() {
        const requirements = this.client.input['requirements']['userStory'] || '';
        return TextTraceUtil.addLineNumbers(requirements, this.currentChunkStartLine, true);
    }
}

module.exports = RecursiveRequirementsValidationGenerator;