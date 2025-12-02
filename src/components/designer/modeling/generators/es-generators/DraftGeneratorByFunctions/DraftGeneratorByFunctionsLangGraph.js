const AggregateDraftLangGraphProxy = require('../../proxies/AggregateDraftLangGraphProxy/AggregateDraftLangGraphProxy.js');

/**
 * LangGraph 백엔드를 사용하는 Aggregate Draft Generator
 */
class DraftGeneratorByFunctionsLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'DraftGeneratorByFunctionsLangGraph';
    }

    async generate() {
        const boundedContext = this.client.input['boundedContext'];
        const description = this.client.input['description'];
        const accumulatedDrafts = this.client.input['accumulatedDrafts'];
        const analysisResult = this.client.input['analysisResult'] || null;

        const jobId = `aggr-draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Job 생성
            await AggregateDraftLangGraphProxy.makeNewJob(
                jobId,
                boundedContext,
                description,
                accumulatedDrafts,
                analysisResult
            );

            // Job 감시
            AggregateDraftLangGraphProxy.watchJob(
                jobId,
                // onUpdate - 진행 중 업데이트
                async (bcName, inference, options, progress) => {
                    const updateObj = {
                        modelValue: {
                            aiOutput: {
                                inference: inference,
                                result: {
                                    options: options
                                }
                            }
                        },
                        inputParams: {
                            boundedContext: boundedContext
                        }
                    };
                    
                    // onThink 콜백 (inference 업데이트)
                    if (this.client.onThink) {
                        this.client.onThink(updateObj, inference);
                    }
                },
                // onComplete - 완료 후 처리
                async (bcName, inference, options, defaultOptionIndex, conclusions, logs, progress, isFailed) => {
                    if (isFailed) {
                        console.error('[AggregateDraftGenerator] Job failed');
                        if (this.client.onError) {
                            this.client.onError({
                                errorMessage: jobState.error || 'Unknown error',
                                inputParams: { boundedContext }
                            });
                        }
                        return;
                    }

                    const returnObj = {
                        modelValue: {
                            output: {
                                options: options,
                                defaultOptionIndex: defaultOptionIndex,
                                conclusions: conclusions
                            },
                            aiOutput: {
                                inference: inference,
                                result: {
                                    options: options,
                                    defaultOptionIndex: defaultOptionIndex,
                                    conclusions: conclusions
                                }
                            },
                            inference: inference  // 기존 생성기와 동일하게 inference 추가
                        },
                        inputParams: {
                            boundedContext: {
                                ...boundedContext,
                                requirements: this.client.input['boundedContext'].requirements || {}
                            },
                            description: description
                        }
                    };
                    
                    this.client.onGenerationSucceeded(returnObj);
                },
                // onWaiting
                async (waitingJobCount) => {
                    // Silent
                },
                // onFailed
                async (errorMsg) => {
                    console.error('[AggregateDraftGenerator] Job failed:', errorMsg);
                    if (this.client.onError) {
                        this.client.onError({
                            errorMessage: errorMsg,
                            inputParams: { boundedContext }
                        });
                    }
                }
            );

        } catch (error) {
            console.error('[AggregateDraftGenerator] Error:', error);
            if (this.client.onError) {
                this.client.onError({
                    errorMessage: error.message,
                    inputParams: { boundedContext }
                });
            }
        }
    }
}

module.exports = DraftGeneratorByFunctionsLangGraph;

