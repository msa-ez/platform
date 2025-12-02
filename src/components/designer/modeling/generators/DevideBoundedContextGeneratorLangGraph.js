const BoundedContextLangGraphProxy = require('./proxies/BoundedContextLangGraphProxy');

/**
 * DevideBoundedContextGeneratorLangGraph
 * 
 * LangGraph Backend를 사용하여 Bounded Context 분할 생성
 */
class DevideBoundedContextGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'DevideBoundedContextGeneratorLangGraph';
    }

    /**
     * Bounded Context 생성
     */
    async generate() {
        const devisionAspect = this.client.input.devisionAspect;
        const requirements = this.client.input.requirements;
        const generateOption = this.client.input.generateOption;
        const feedback = this.client.input.feedback || null;
        const previousAspectModel = this.client.input.previousAspectModel || null;

        console.log('[DevideBoundedContextGeneratorLangGraph] generate 시작:', {
            devisionAspect,
            numberOfBCs: generateOption && generateOption.numberOfBCs,
            hasRequirements: !!requirements
        });

        // Job ID 생성
        const jobId = this._generateJobId();

        // Backend에 Job 생성
        await BoundedContextLangGraphProxy.makeNewJob(
            jobId,
            devisionAspect,
            requirements,
            generateOption,
            feedback,
            previousAspectModel
        );

        // Job 완료 대기
        return new Promise((resolve, reject) => {
            let hasResolved = false;

            BoundedContextLangGraphProxy.watchJob(
                jobId,
                // onUpdate (사용하지 않음)
                (devisionAspect, thoughts, boundedContexts, relations, explanations, logs, progress, currentGeneratedLength) => {
                    const length = currentGeneratedLength || this._getGeneratedLength(boundedContexts, relations, explanations);
                    
                    if (this.client.onModelCreated) {
                        this.client.onModelCreated({
                            modelValue: {
                                output: {
                                    currentGeneratedLength: length
                                }
                            }
                        });
                    }
                },
                // onComplete
                (devisionAspect, thoughts, boundedContexts, relations, explanations, logs, progress, currentGeneratedLength, isFailed) => {
                    if (hasResolved) return;
                    hasResolved = true;
                    
                    console.log('[DevideBoundedContextGeneratorLangGraph] onComplete 호출:', {
                        boundedContextsCount: boundedContexts ? boundedContexts.length : 0,
                        relationsCount: relations ? relations.length : 0,
                        explanationsCount: explanations ? explanations.length : 0,
                        isFailed
                    });
                    
                    if (isFailed) {
                        reject(new Error(`BC 생성 실패: ${this.client.error || 'Unknown error'}`));
                        return;
                    }
                    
                    const length = currentGeneratedLength || this._getGeneratedLength(boundedContexts, relations, explanations);
                    
                    // User Story Generator와 동일한 형식으로 변환
                    const result = {
                        modelValue: {
                            output: {
                                devisionAspect,
                                thoughts,
                                boundedContexts,
                                relations,
                                explanations,
                                logs,
                                progress,
                                currentGeneratedLength: length
                            }
                        }
                    };
                    
                    if (this.client.onModelCreated) {
                        this.client.onModelCreated({
                            modelValue: {
                                output: {
                                    currentGeneratedLength: length
                                }
                            }
                        });
                    }
                    
                    // onGenerationFinished 호출 (User Story Generator와 동일한 방식)
                    if (this.client.onGenerationFinished) {
                        this.client.onGenerationSucceeded(result);
                    }
                    
                    console.log('[DevideBoundedContextGeneratorLangGraph] onGenerationFinished 호출 후, resolve');
                    
                    resolve(result);
                },
                // onWaiting
                (waitingCount) => {
                    // 대기 중
                },
                // onError
                (error) => {
                    if (hasResolved) return;
                    hasResolved = true;
                    
                    console.error('[DevideBoundedContextGeneratorLangGraph] 오류:', error);
                    reject(new Error(error));
                }
            );
        });
    }

    /**
     * Job ID 생성 (bcgen-{timestamp}-{random})
     */
    _generateJobId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `bcgen-${timestamp}-${random}`;
    }

    _getGeneratedLength(boundedContexts = [], relations = [], explanations = []) {
        try {
            return JSON.stringify({
                boundedContexts,
                relations,
                explanations
            }).length;
        } catch (e) {
            return 0;
        }
    }
}

module.exports = DevideBoundedContextGeneratorLangGraph;

