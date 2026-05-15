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
        this.jobId = null;
        this.isStopped = false;
        this._reject = null;
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

        // 진행 중인 generate 에 대한 stop 추적 — 새 generate 시작 시점에 플래그 리셋.
        this.isStopped = false;
        this._reject = null;

        // Job ID 생성 — 인스턴스에 저장해서 stop() 이 접근 가능하게.
        const jobId = this._generateJobId();
        this.jobId = jobId;

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
            // stop() 이 외부에서 호출 시 즉시 reject 할 수 있도록 등록.
            this._reject = (err) => {
                if (hasResolved) return;
                hasResolved = true;
                reject(err);
            };

            BoundedContextLangGraphProxy.watchJob(
                jobId,
                // onUpdate (사용하지 않음)
                (devisionAspect, thoughts, boundedContexts, relations, explanations, logs, progress, currentGeneratedLength) => {
                    if (this.isStopped) return;
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
                    if (this.isStopped) return;
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

    /**
     * 생성 중지.
     *  1) isStopped 플래그 → 미도착 watchJob 콜백이 도착해도 onComplete/onUpdate 가 no-op.
     *  2) 백엔드 진행 중 작업에 isRemoveRequested 를 박아 안전하게 취소.
     *  3) generate() 의 외부 promise 를 즉시 reject 해서 caller 가 await 에서 풀려나오게 함.
     */
    stop() {
        this.isStopped = true;

        if (this.jobId) {
            try {
                BoundedContextLangGraphProxy.removeJob(this.jobId);
            } catch (e) {
                console.warn('[DevideBoundedContextGeneratorLangGraph] removeJob failed:', e);
            }
        }

        if (typeof this._reject === 'function') {
            try {
                this._reject(new Error('Generation stopped by user'));
            } catch (e) { /* noop */ }
            this._reject = null;
        }
    }
}

module.exports = DevideBoundedContextGeneratorLangGraph;

