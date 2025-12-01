const DDLExtractorLangGraphProxy = require('../../proxies/DDLExtractorLangGraphProxy/DDLExtractorLangGraphProxy');

/**
 * LangGraph 백엔드를 사용하는 DDL Fields Extractor
 */
class ExtractDDLFieldsGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'ExtractDDLFieldsGeneratorLangGraph';
    }

    async generate() {
        const ddlRequirements = this.client.input['ddlRequirements'];
        const boundedContextName = this.client.input['boundedContextName'];

        const jobId = DDLExtractorLangGraphProxy.generateJobId();

        try {
            // Job 생성
            await DDLExtractorLangGraphProxy.makeNewJob(
                jobId,
                ddlRequirements,
                boundedContextName
            );

            // Job 감시
            DDLExtractorLangGraphProxy.watchJob(
                jobId,
                // onUpdate
                (updateData) => {
                    if (this.client.onModelCreatedWithThinking) {
                        this.client.onModelCreatedWithThinking({
                            directMessage: `Extracting DDL fields for ${boundedContextName}...`,
                            progress: updateData.progress || 0
                        });
                    }
                },
                // onComplete
                async (completeData) => {
                    const ddlFieldRefs = completeData && completeData.ddlFieldRefs
                        ? completeData.ddlFieldRefs
                        : [];

                    const returnObj = {
                        modelValue: {
                            output: ddlFieldRefs,
                            aiOutput: {
                                inference: completeData.inference || '',
                                result: {
                                    ddlFieldRefs: ddlFieldRefs
                                }
                            }
                        },
                        inputParams: {
                            ddlRequirements: ddlRequirements,
                            boundedContextName: boundedContextName
                        }
                    };

                    if (this.client.onGenerationSucceeded) {
                        this.client.onGenerationSucceeded(returnObj);
                    }
                },
                // onWaiting
                (waitingJobCount) => {
                    // Silent
                },
                // onFailed
                (errorMsg) => {
                    console.error('[ExtractDDLFieldsGeneratorLangGraph] Job failed:', errorMsg);
                    if (this.client.onError) {
                        this.client.onError({
                            errorMessage: errorMsg,
                            inputParams: {
                                ddlRequirements,
                                boundedContextName
                            }
                        });
                    }
                }
            );

        } catch (error) {
            console.error('[ExtractDDLFieldsGeneratorLangGraph] Error:', error);
            if (this.client.onError) {
                this.client.onError({
                    errorMessage: error.message,
                    inputParams: {
                        ddlRequirements,
                        boundedContextName
                    }
                });
            }
        }
    }
}

module.exports = ExtractDDLFieldsGeneratorLangGraph;

