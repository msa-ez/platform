const DDLFieldsLangGraphProxy = require('../../proxies/DDLFieldsLangGraphProxy/DDLFieldsLangGraphProxy');

/**
 * LangGraph 백엔드를 사용하는 DDL Fields Generator
 */
class AssignDDLFieldsToAggregateDraftLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'AssignDDLFieldsToAggregateDraftLangGraph';
    }

    async generate() {
        const description = this.client.input['description'];
        const aggregateDrafts = this.client.input['aggregateDrafts'];
        const generatorKey = this.client.input['generatorKey'];
        const traceMap = this.client.input['traceMap'];
        const ddlFields = this.client.input['ddlFields'];

        const jobId = DDLFieldsLangGraphProxy.generateJobId();

        try {
            // Job 생성
            await DDLFieldsLangGraphProxy.makeNewJob(
                jobId,
                description || 'Bounded context description',
                aggregateDrafts,
                ddlFields,
                generatorKey
            );

            // Job 감시 및 결과 처리
            DDLFieldsLangGraphProxy.watchJob(
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
                                errorMessage: 'DDL fields generation failed',
                                inputParams: {
                                    description,
                                    aggregateDrafts,
                                    generatorKey,
                                    traceMap,
                                    ddlFields
                                }
                            });
                        }
                    } else {
                        const result = completeData.aggregateFieldAssignments;
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
                    console.error('[AssignDDLFieldsToAggregateDraftLangGraph] Job failed:', errorMsg);
                    if (this.client.onError) {
                        this.client.onError({
                            errorMessage: errorMsg,
                            inputParams: {
                                description,
                                aggregateDrafts,
                                generatorKey,
                                traceMap,
                                ddlFields
                            }
                        });
                    }
                }
            );

        } catch (error) {
            console.error('[AssignDDLFieldsToAggregateDraftLangGraph] Error:', error);
            if (this.client.onError) {
                this.client.onError({
                    errorMessage: error.message,
                    inputParams: {
                        description,
                        aggregateDrafts,
                        generatorKey,
                        traceMap,
                        ddlFields
                    }
                });
            }
        }
    }
}

module.exports = AssignDDLFieldsToAggregateDraftLangGraph;

