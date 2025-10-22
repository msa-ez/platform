/**
 * UserStoryGeneratorLangGraph
 * 
 * LangGraph 백엔드를 사용하는 통합 User Story Generator
 * - 가상 시나리오 지원 (요구사항 없을 때)
 * - 단일 요청 처리 (요구사항 짧을 때)
 * - 재귀적 청크 처리 (요구사항 길 때)
 */
import UserStoryLangGraphProxy from './proxies/UserStoryLangGraphProxy/UserStoryLangGraphProxy';
import TextChunker from './TextChunker';

class UserStoryGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.resolveCurrentProcess = null;
        this.rejectCurrentProcess = null;
        this.jobId = null;
        
        // TextChunker 설정
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 1000
        });
        
        this.currentChunks = [];
        this.currentChunkIndex = 0;
        this.isProcessingChunk = false;
        
        this.accumulated = {
            title: '',
            actors: [],
            userStories: [],
            businessRules: [],
            boundedContexts: []
        };
    }

    /**
     * User Story 생성 (통합 메서드)
     * 
     * @param {string} requirementsText - 요구사항 텍스트
     * @returns {Promise<Object>} 생성된 User Stories
     */
    async generate(requirementsText) {
        // 요구사항이 없으면 가상 시나리오 생성
        if (!requirementsText || requirementsText.length === 0) {
            console.log('[UserStoryGeneratorLangGraph] Empty requirements text, generating virtual scenario');
            requirementsText = this._generateVirtualScenario();
        }

        // 요구사항이 짧으면 단일 요청, 길면 재귀 처리
        const shouldUseRecursive = requirementsText.length > 25000;
        
        if (shouldUseRecursive) {
            console.log('[UserStoryGeneratorLangGraph] Using recursive mode');
            return await this._generateRecursive(requirementsText);
        } else {
            console.log('[UserStoryGeneratorLangGraph] Using single request mode');
            return await this._generateSingle(requirementsText);
        }
    }

    /**
     * 단일 요청으로 User Story 생성
     */
    async _generateSingle(requirementsText) {
        this.jobId = this._generateJobId();
        const boundedContexts = this._extractBoundedContexts();
        
        try {
            await UserStoryLangGraphProxy.makeNewJob(
                this.jobId,
                requirementsText,
                boundedContexts,
                null
            );
            
            return new Promise((resolve, reject) => {
                let isResolved = false;
                
                UserStoryLangGraphProxy.watchJob(
                    this.jobId,
                    // onUpdate
                    async (result, logs, progress) => {
                        // 단일 요청에서는 업데이트 없음
                    },
                    // onComplete
                    async (result, logs, progress, isFailed) => {
                        if (isResolved) {
                            return;
                        }
                        
                        if (isFailed) {
                            isResolved = true;
                            reject(new Error('User story generation failed'));
                            return;
                        }
                        
                        // textResponse가 null이면 아직 완료되지 않은 것으로 간주하고 대기
                        if (!result.textResponse && (!result.userStories || result.userStories.length === 0)) {
                            return;
                        }
                        
                        if (result.textResponse) {
                            isResolved = true;
                            resolve({
                                textResponse: result.textResponse
                            });
                            return;
                        }
                        
                        isResolved = true;
                        resolve(result);
                    },
                    // onWaiting
                    () => {},
                    // onFailed
                    (error) => {
                        if (isResolved) {
                            return;
                        }
                        isResolved = true;
                        reject(new Error(error));
                    }
                );
            });
        } catch (error) {
            console.error('[UserStoryGeneratorLangGraph] Single request failed:', error);
            throw error;
        }
    }

    /**
     * 재귀적으로 User Story 생성
     */
    async _generateRecursive(requirementsText) {
        this.currentChunks = this.textChunker.splitIntoChunks(requirementsText);
        this.currentChunkIndex = 0;
        this.accumulated = {
            title: '',
            actors: [],
            userStories: [],
            businessRules: [],
            boundedContexts: []
        };
        
        console.log(`[UserStoryGeneratorLangGraph] ${this.currentChunks.length}개 청크로 분할`);
        
        return new Promise((resolve, reject) => {
            this.resolveCurrentProcess = resolve;
            this.rejectCurrentProcess = reject;
            this._processNextChunk();
        });
    }

    /**
     * 다음 청크 처리 (재귀적)
     */
    async _processNextChunk() {
        if (this.currentChunkIndex < this.currentChunks.length) {
            const chunkText = this.currentChunks[this.currentChunkIndex];
            const chunkNumber = this.currentChunkIndex + 1;
            const totalChunks = this.currentChunks.length;
            
            console.log(`[UserStoryGeneratorLangGraph] 청크 ${chunkNumber}/${totalChunks} 처리 중...`);
            
            this.jobId = this._generateJobId();
            const boundedContexts = this._extractBoundedContexts();
            
            try {
                const existingSummary = this._createExistingSummary(this.accumulated);
                
                await UserStoryLangGraphProxy.makeNewJob(
                    this.jobId,
                    chunkText,
                    boundedContexts,
                    existingSummary
                );
                
                await new Promise((resolve, reject) => {
                    this.chunkResolve = resolve;
                    this.chunkReject = reject;
                    
                    UserStoryLangGraphProxy.watchJob(
                        this.jobId,
                        // onUpdate
                        async (result, logs, progress) => {
                            // 청크 단위 업데이트는 필요 없음
                        },
                        // onComplete
                        async (result, logs, progress, isFailed) => {
                            if (isFailed) {
                                reject(new Error('Chunk processing failed'));
                                return;
                            }
                            
                            this._mergeChunkResult(result);
                            resolve();
                        },
                        // onWaiting
                        () => {},
                        // onFailed
                        (error) => {
                            reject(new Error(error));
                        }
                    );
                });
                
                this.currentChunkIndex++;
                this._processNextChunk();
                
            } catch (error) {
                console.error('[UserStoryGeneratorLangGraph] Chunk processing failed:', error);
                this.rejectCurrentProcess(error);
            }
        } else {
            // 모든 청크 처리 완료
            console.log('[UserStoryGeneratorLangGraph] 모든 청크 처리 완료');
            this.resolveCurrentProcess(this.accumulated);
        }
    }

    /**
     * 청크 결과 병합
     */
    _mergeChunkResult(result) {
        if (!result) return;
        
        // title은 최초 한 번만
        if (result.title && !this.accumulated.title) {
            this.accumulated.title = result.title;
        }
        
        // actors 병합
        if (result.actors && Array.isArray(result.actors)) {
            this.accumulated.actors.push(...result.actors);
        }
        
        // userStories 병합
        if (result.userStories && Array.isArray(result.userStories)) {
            this.accumulated.userStories.push(...result.userStories);
        }
        
        // businessRules 병합
        if (result.businessRules && Array.isArray(result.businessRules)) {
            this.accumulated.businessRules.push(...result.businessRules);
        }
        
        // boundedContexts 병합
        if (result.boundedContexts && Array.isArray(result.boundedContexts)) {
            this.accumulated.boundedContexts.push(...result.boundedContexts);
        }
    }

    /**
     * 가상 시나리오 생성
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
        const separationPrinciple = this.client.input.separationPrinciple || 'domain complexity';
        
        modelDescription += `\n\nThe response is must be in the same language with the service name. Also, please list bounded contexts in the perspective of ${separationPrinciple}.`;

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
     * 기존 데이터 요약 생성 (중복 방지용)
     */
    _createExistingSummary(accumulated) {
        return {
            existingActors: (accumulated.actors || []).map(actor => ({
                title: actor.title || ''
            })),
            existingUserStories: (accumulated.userStories || []).map(story => ({
                title: story.title || ''
            })),
            existingBusinessRules: (accumulated.businessRules || []).map(rule => ({
                title: rule.title || ''
            })),
            existingBoundedContexts: (accumulated.boundedContexts || []).map(bc => ({
                name: bc.name || ''
            }))
        };
    }

    /**
     * Bounded Contexts 추출
     */
    _extractBoundedContexts() {
        if (!this.client.input || !this.client.input.boundedContexts) {
            return [];
        }
        
        return this.client.input.boundedContexts.map(bc => ({
            name: bc.name || '',
            description: bc.description || ''
        }));
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

export default UserStoryGeneratorLangGraph;

