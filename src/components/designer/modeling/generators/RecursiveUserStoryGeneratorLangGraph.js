/**
 * RecursiveUserStoryGeneratorLangGraph
 * 
 * LangGraph 백엔드를 사용하는 User Story Generator
 * 기존 RecursiveUserStoryGenerator와 동일한 인터페이스 제공
 * 청크 단위 처리 지원
 */
import UserStoryLangGraphProxy from './proxies/UserStoryLangGraphProxy/UserStoryLangGraphProxy';
import TextChunker from './TextChunker';

class RecursiveUserStoryGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.resolveCurrentProcess = null;
        this.rejectCurrentProcess = null;
        this.jobId = null;
        
        // TextChunker 설정 (더 작은 청크로 세밀한 분석)
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 1000
        });
        
        this.currentChunks = [];
        this.currentChunkIndex = 0;
        this.isProcessingChunk = false;  // 중복 처리 방지 플래그
        
        this.accumulated = {
            title: '',
            actors: [],
            userStories: [],
            businessRules: [],
            boundedContexts: []
        };
    }

    /**
     * 요구사항을 기반으로 User Story 생성 (재귀적)
     * 
     * @param {string} requirementsText - 요구사항 텍스트
     * @returns {Promise<Object>} 생성된 User Stories
     */
    async generateRecursively(requirementsText) {
        // 요구사항이 없으면 가상 시나리오 생성
        if (!requirementsText || requirementsText.length === 0) {
            console.log('[RecursiveUserStoryGeneratorLangGraph] Empty requirements text, generating virtual scenario');
            requirementsText = this._generateVirtualScenario();
        }

        // 요구사항을 청크로 나눔
        this.currentChunks = this.textChunker.splitIntoChunks(requirementsText);
        this.currentChunkIndex = 0;
        this.accumulated = {
            title: '',
            actors: [],
            userStories: [],
            businessRules: [],
            boundedContexts: []
        };
        
        console.log(`[LangGraph] ${this.currentChunks.length}개 청크로 분할`);
        
        return new Promise((resolve, reject) => {
            this.resolveCurrentProcess = resolve;
            this.rejectCurrentProcess = reject;
            this.processNextChunk();
        });
    }
    
    /**
     * 다음 청크 처리 (재귀적)
     * 각 청크가 완전히 완료될 때까지 기다림
     */
    async processNextChunk() {
        if (this.currentChunkIndex < this.currentChunks.length) {
            const chunkText = this.currentChunks[this.currentChunkIndex];
            const chunkNumber = this.currentChunkIndex + 1;
            const totalChunks = this.currentChunks.length;
            
            console.log(`[LangGraph] 청크 ${chunkNumber}/${totalChunks} 처리 중...`);
            
            // Job ID 생성 (각 청크마다)
            this.jobId = this._generateJobId();
            
            // Bounded Contexts 정보 수집
            const boundedContexts = this._extractBoundedContexts();
            
            try {
                // Firebase Job 생성 (이전 청크의 요약 정보만 전달 - 컨텍스트 사이즈 최소화)
                const existingSummary = this._createExistingSummary(this.accumulated);
                

                const makeJobParams = {
                    jobId: this.jobId,
                    requirements: chunkText,
                    boundedContexts: boundedContexts,
                    existingSummary: existingSummary
                }
                console.log(
                    `[DEBUG][RecursiveUserStoryGeneratorLangGraph] ${this.currentChunkIndex + 1}번째 청크 생성 요청 작업 수행`, structuredClone(makeJobParams)
                )
                await UserStoryLangGraphProxy.makeNewJob(
                    makeJobParams.jobId,
                    makeJobParams.requirements,
                    makeJobParams.boundedContexts,
                    makeJobParams.existingSummary  // ✅ title/name만 포함된 요약 정보
                );
                
                // Job 완료를 Promise로 기다림
                await new Promise((resolve, reject) => {
                    this.chunkResolve = resolve;
                    this.chunkReject = reject;
                    
                    // Job 상태 감시
                    UserStoryLangGraphProxy.watchJob(
                        this.jobId,
                        // onUpdate
                        async (userStories, logs, progress) => {
                            await this._handleUpdate(userStories, logs, progress);
                        },
                        // onComplete
                        async (userStories, logs, progress, isFailed) => {
                            await this._handleChunkComplete(userStories, logs, progress, isFailed);
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
                console.error('[RecursiveUserStoryGeneratorLangGraph] Chunk processing failed:', error);
                if (this.rejectCurrentProcess) {
                    this.rejectCurrentProcess(error);
                }
                return;
            }
        } else {
            // 모든 청크 처리 완료
            console.log(`[LangGraph] ✅ 완료 - 총 ${this.accumulated.userStories.length}개 생성`);
            if (this.resolveCurrentProcess) {
                this.resolveCurrentProcess(this.accumulated);
            }
        }
    }

    /**
     * 진행 중 업데이트 처리
     */
    async _handleUpdate(userStories, logs, progress) {
        
        // User Stories를 accumulated 형식으로 변환
        this._convertToAccumulatedFormat(userStories);
        
        // 진행 상황을 클라이언트에 알림
        if (this.client.onModelUpdated) {
            this.client.onModelUpdated(this.accumulated);
        }
        
        // 진행률 업데이트
        if (this.client.updateProgress) {
            this.client.updateProgress(progress);
        }
    }

    /**
     * 청크 완료 처리 (기존 RecursiveUserStoryGenerator 방식과 호환)
     * ESDialoger의 onGenerationFinished에서 호출됨
     */
    handleGenerationFinished(model) {
        
        try {
            if (model) {
                // LangGraph 결과를 accumulated에 누적 (이미 camelCase 형식)
                const newStories = model.userStories && Array.isArray(model.userStories) ? model.userStories.length : 0;
                
                if (model.userStories && Array.isArray(model.userStories)) {
                    this.accumulated.userStories.push(...model.userStories);
                }
                
                if (model.actors && Array.isArray(model.actors)) {
                    this.accumulated.actors.push(...model.actors);
                }
                
                if (model.businessRules && Array.isArray(model.businessRules)) {
                    this.accumulated.businessRules.push(...model.businessRules);
                }
                
                if (model.boundedContexts && Array.isArray(model.boundedContexts)) {
                    this.accumulated.boundedContexts.push(...model.boundedContexts);
                }
                
                // title은 최초 한 번만
                if (!this.accumulated.title && model.title) {
                    this.accumulated.title = model.title;
                }
                
                // 누적 결과 로그
                if (newStories > 0) {
                    console.log(`[LangGraph] 청크 ${this.currentChunkIndex + 1}/${this.currentChunks.length}: +${newStories}개 → 총 ${this.accumulated.userStories.length}개`);
                }
            }
            
            // 현재 청크 완료 - Promise resolve하여 processNextChunk의 await 해제
            if (this.chunkResolve) {
                console.log('[RecursiveUserStoryGeneratorLangGraph] Resolving chunk promise');
                this.chunkResolve();
                this.chunkResolve = null;
                this.chunkReject = null;
            }
            
            return this.accumulated;
        } catch (e) {
            console.error('Error in handleGenerationFinished:', e);
            if (this.chunkReject) {
                this.chunkReject(e);
                this.chunkResolve = null;
                this.chunkReject = null;
            }
            return this.accumulated;
        }
    }
    
    /**
     * 청크 완료 처리 (Firebase 이벤트 핸들러)
     */
    async _handleChunkComplete(userStories, logs, progress, isFailed) {
        if (isFailed) {
            const errorLog = logs.find(log => log.level === 'error');
            const errorMsg = errorLog ? errorLog.message : 'Unknown error occurred';
            console.error(`[LangGraph] ❌ Job 실패: ${errorMsg}`);
            if (this.rejectCurrentProcess) {
                this.rejectCurrentProcess(new Error(errorMsg));
            }
            return;
        }

        console.log(
            `[DEBUG][RecursiveUserStoryGeneratorLangGraph] ${this.currentChunkIndex + 1}번째 청크 생성 완료: `, structuredClone({
                userStories: userStories,
                logs: logs,
                progress: progress
            })
        )
        
        // LangGraph 결과를 기존 형식으로 변환
        const title = (this.client.input && this.client.input.title) || '';
        const model = {
            userStories: userStories,
            actors: [],
            businessRules: [],
            boundedContexts: [],
            title: title
        };
        
        // ESDialoger의 onGenerationFinished를 통해 처리 (기존 방식과 동일)
        if (this.client.onGenerationFinished) {
            this.client.onGenerationFinished({ modelValue: { output: model } });
        }
    }

    /**
     * 대기 처리
     */
    async _handleWaiting(waitingJobCount) {
        console.log(`[LangGraph] 대기 중... (앞에 ${waitingJobCount}개 작업)`);
        
        if (this.client.onWaiting) {
            this.client.onWaiting(waitingJobCount);
        }
    }

    /**
     * 실패 처리
     */
    async _handleFailed(errorMsg) {
        console.error(`[RecursiveUserStoryGeneratorLangGraph] Failed: ${errorMsg}`);
        
        if (this.client.onFailed) {
            this.client.onFailed(errorMsg);
        }
        
        if (this.rejectCurrentProcess) {
            this.rejectCurrentProcess(new Error(errorMsg));
        }
    }

    /**
     * LangGraph 형식을 기존 accumulated 형식으로 변환 (누적 방식)
     */
    _convertToAccumulatedFormat(userStories) {
        if (!userStories || userStories.length === 0) {
            return;
        }
        
        // User Stories 추가 (누적)
        const newStories = userStories.map(story => ({
            title: story.title || '',
            as: story.as_a || story.as || '',
            iWant: story.i_want || story.iWant || '',
            soThat: story.so_that || story.soThat || '',
            description: story.description || '',
            acceptanceCriteria: story.acceptance_criteria || story.acceptanceCriteria || [],
            priority: story.priority || 'medium',
            estimation: story.estimation || 3,
            boundedContext: story.bounded_context || story.boundedContext || ''
        }));
        
        this.accumulated.userStories.push(...newStories);
        
        // Actors 추출 및 중복 제거 (기존 + 신규)
        const existingActors = new Set(this.accumulated.actors.map(a => a.title));
        
        userStories.forEach(story => {
            const actor = story.as_a || story.as;
            if (actor && !existingActors.has(actor)) {
                existingActors.add(actor);
                this.accumulated.actors.push({
                    title: actor,
                    role: actor,
                    description: `${actor} in the system`
                });
            }
        });
        
        // Bounded Contexts 추출 및 중복 제거 (기존 + 신규)
        const existingBCs = new Set(this.accumulated.boundedContexts.map(bc => bc.name));
        
        userStories.forEach(story => {
            const bc = story.bounded_context || story.boundedContext;
            if (bc && !existingBCs.has(bc)) {
                existingBCs.add(bc);
                this.accumulated.boundedContexts.push({
                    name: bc,
                    description: `${bc} bounded context`
                });
            }
        });
        
        // Title 설정
        if (!this.accumulated.title && this.client.input && this.client.input.title) {
            this.accumulated.title = this.client.input.title;
        }
        
    }

    /**
     * Bounded Context 정보 추출
     */
    _extractBoundedContexts() {
        const boundedContexts = [];
        
        // client.input에서 BC 정보 추출
        if (this.client.input) {
            if (this.client.input.resultDevideBoundedContext) {
                this.client.input.resultDevideBoundedContext.forEach(bc => {
                    boundedContexts.push({
                        name: bc.name || bc.title,
                        alias: bc.alias || bc.name,
                        description: bc.description || ''
                    });
                });
            }
            
            if (this.client.input.boundedContexts) {
                this.client.input.boundedContexts.forEach(bc => {
                    boundedContexts.push({
                        name: bc.name || bc.title,
                        alias: bc.alias || bc.name,
                        description: bc.description || ''
                    });
                });
            }
        }
        
        return boundedContexts;
    }

    /**
     * 빈 결과 생성
     */
    _createEmptyResult() {
        const title = (this.client.input && this.client.input.title) || '새로운 서비스';
        return {
            title: title,
            actors: [],
            userStories: [],
            businessRules: [],
            boundedContexts: []
        };
    }

    /**
     * 기존 누적 데이터를 요약 (title/name만 추출)
     * 컨텍스트 사이즈를 최소화하여 LLM 토큰 제한 회피
     */
    _createExistingSummary(accumulated) {
        return {
            actors: (accumulated.actors || []).map(actor => ({
                title: actor.title || ''
            })),
            userStories: (accumulated.userStories || []).map(story => ({
                title: story.title || ''
            })),
            businessRules: (accumulated.businessRules || []).map(rule => ({
                title: rule.title || ''
            })),
            boundedContexts: (accumulated.boundedContexts || []).map(bc => ({
                name: bc.name || ''
            }))
        };
    }

    /**
     * 가상 시나리오 생성 (기존 UserStoryGenerator와 동일한 로직)
     */
    _generateVirtualScenario() {
        let modelDescription = "";

        // Painpoint Analysis가 있으면 사용
        if (this.client.input.painpointAnalysis) {
            let modelPerPersona = this.client.input.painpointAnalysis;
            modelDescription += "Persona definition and he(or her)'s painpoints and possible solutions as follows: \n\n";
            Object.keys(this.client.input.painpointAnalysis).forEach(persona => {
                modelDescription += "- " + persona + "\n";
                let relations = modelPerPersona[persona].relations;
                Object.keys(relations).forEach(key => {
                    let painPoint = relations[key].sourceElement.name;
                    let possibleSolution = relations[key].targetElement.name;
                    modelDescription += `${painPoint}:${possibleSolution}\n`;
                });
            });
        } else if (this.client.input.personas && this.client.input.personas.length > 0) {
            // Personas가 있으면 사용
            let personas = this.client.input.personas;
            modelDescription += "Create pain points and possible solutions that may arise by considering the following Personas. \n\n";
            for (var i = 0; i < personas.length; i++) {
                modelDescription += "- " + personas[i].persona + "\n";
            }
        }

        // Business Model이 있으면 추가
        if (this.client.input.businessModel) {
            modelDescription += "\n Detailed Business Model of the service is: \n";
            let elementsByTypes = {};
            let model = this.client.input.businessModel;
            Object.keys(model).forEach(key => {
                let element = model[key];
                if (!elementsByTypes[element._type]) elementsByTypes[element._type] = [];
                elementsByTypes[element._type].push(element.name);
            });

            modelDescription += "\n" + Object.keys(elementsByTypes).reduce((sum, type) => {
                let shortType = type.split(".").pop();
                let stickers = elementsByTypes[type].join(", ");
                return sum + `${shortType}:${stickers}\n`;
            }, "");
        }

        // 서비스 제목 추가
        const serviceTitle = this.client.input.title || "Digital Platform";
        modelDescription += `\n\nThe response is must be in the same language with the service name. Also, please list bounded contexts in the perspective of ${this.client.input.separationPrinciple || 'domain complexity'}.`;

        return `Please generate a comprehensive analysis for ${serviceTitle} with the following requests:

${modelDescription}

1. Actors:
- List all actors (users, external systems, etc.) that interact with the system
- Describe each actor's role and responsibilities

2. User Stories (in detailed usecase spec):
- Create detailed user stories for each actor
- Each story should include "As a", "I want to", "So that" format
- Include acceptance criteria for each story

3. Business Rules:
- Define business rules and constraints
- Include validation rules and business logic

4. Bounded Contexts:
- Identify bounded contexts based on the separation principle
- Define clear boundaries and responsibilities for each context`;
    }

    /**
     * Job ID 생성
     */
    _generateJobId() {
        return `usgen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 생성 중지
     */
    stop() {
        
        if (this.jobId) {
            UserStoryLangGraphProxy.removeJob(this.jobId);
        }
        
        if (this.rejectCurrentProcess) {
            this.rejectCurrentProcess(new Error('Generation stopped by user'));
        }
    }
}

export default RecursiveUserStoryGeneratorLangGraph;

