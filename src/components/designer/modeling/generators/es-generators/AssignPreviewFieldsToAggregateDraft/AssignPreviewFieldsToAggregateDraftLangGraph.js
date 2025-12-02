const PreviewFieldsLangGraphProxy = require('../../proxies/PreviewFieldsLangGraphProxy/PreviewFieldsLangGraphProxy');
const TextTraceUtil = require('../../utils/TraceUtils/TextTraceUtil');
const RefsTraceUtil = require('../../utils/TraceUtils/RefsTraceUtil');

/**
 * LangGraph 백엔드를 사용하는 Preview Fields Generator
 */
class AssignPreviewFieldsToAggregateDraftLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'AssignPreviewFieldsToAggregateDraftLangGraph';
    }

    async generate() {
        const description = this.client.input['description'];
        const aggregateDrafts = this.client.input['aggregateDrafts'];
        const generatorKey = this.client.input['generatorKey'];
        const traceMap = this.client.input['traceMap'];

        const jobId = PreviewFieldsLangGraphProxy.generateJobId();

        try {
            // Job 생성
            await PreviewFieldsLangGraphProxy.makeNewJob(
                jobId,
                description || 'Bounded context description',
                aggregateDrafts,
                generatorKey,
                traceMap
            );

            // Job 감시 및 결과 처리
            PreviewFieldsLangGraphProxy.watchJob(
                jobId,
                // onUpdate
                (updateData) => {
                    if (this.client.onUpdate) {
                        this.client.onUpdate(updateData);
                    }
                },
                // onComplete
                (completeData) => {
                    if (completeData.isFailed) {
                        if (this.client.onError) {
                            this.client.onError({
                                errorMessage: 'Preview fields generation failed',
                                inputParams: {
                                    description,
                                    aggregateDrafts,
                                    generatorKey,
                                    traceMap
                                }
                            });
                        }
                    } else {
                        let result = completeData.aggregateFieldAssignments;
                        
                        // refs 후처리 (기존 Generator와 동일)
                        if (result && result.length > 0) {
                            const lineNumberedRequirements = TextTraceUtil.addLineNumbers(description, 1, true);
                            
                            for (const assignment of result) {
                                for (const field of assignment.previewFields) {
                                    // refs 정규화 및 변환
                                    field.refs = RefsTraceUtil.sanitizeAndConvertRefs(
                                        { refs: field.refs }, lineNumberedRequirements, true
                                    ).refs;
                                    // traceMap을 사용하여 원본 refs로 변환
                                    field.refs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(field.refs, traceMap);
                                }
                            }
                        }
                        
                        if (this.client.onGenerationSucceeded) {
                            this.client.onGenerationSucceeded(result);
                        }
                    }
                },
                // onWaiting
                (waitingJobCount) => {
                    if (this.client.onWaiting) {
                        this.client.onWaiting(waitingJobCount);
                    }
                },
                // onFailed
                (errorMsg) => {
                    console.error('[AssignPreviewFieldsToAggregateDraftLangGraph] Job failed:', errorMsg);
                    if (this.client.onError) {
                        this.client.onError({
                            errorMessage: errorMsg,
                            inputParams: {
                                description,
                                aggregateDrafts,
                                generatorKey,
                                traceMap
                            }
                        });
                    }
                }
            );

        } catch (error) {
            console.error('[AssignPreviewFieldsToAggregateDraftLangGraph] Error:', error);
            if (this.client.onError) {
                this.client.onError({
                    errorMessage: error.message,
                    inputParams: {
                        description,
                        aggregateDrafts,
                        generatorKey,
                        traceMap
                    }
                });
            }
        }
    }
}

module.exports = AssignPreviewFieldsToAggregateDraftLangGraph;

