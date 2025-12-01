const TraceabilityLangGraphProxy = require('../../proxies/TraceabilityLangGraphProxy/TraceabilityLangGraphProxy');

/**
 * LangGraph 백엔드를 사용하는 Traceability Addition Generator
 */
class AddTraceToDraftOptionsGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'AddTraceToDraftOptionsGeneratorLangGraph';
    }

    async generate() {
        const generatedDraftOptions = this.client.input['generatedDraftOptions'];
        const boundedContextName = this.client.input['boundedContextName'];
        const functionalRequirements = this.client.input['functionalRequirements'];
        const traceMap = this.client.input['traceMap'];

        const jobId = `trace-add-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Job 생성
            await TraceabilityLangGraphProxy.makeNewJob(
                jobId,
                generatedDraftOptions,
                boundedContextName,
                '', // description (not used in current implementation)
                functionalRequirements,
                traceMap
            );

            // Job 감시
            TraceabilityLangGraphProxy.watchJob(
                jobId,
                // onUpdate - 진행 중 업데이트
                (updateData) => {
                    if (this.client.onModelCreatedWithThinking) {
                        this.client.onModelCreatedWithThinking({
                            directMessage: `Adding traceability information to domain objects for ${boundedContextName}...`,
                            progress: updateData.progress || 0
                        });
                    }
                },
                // onComplete - 완료 후 처리
                async (completeData) => {
                    const draftTraceMap = completeData && completeData.draftTraceMap 
                        ? completeData.draftTraceMap 
                        : { aggregates: [], enumerations: [], valueObjects: [] };

                    // _addTraceToDraftOptions 로직 적용
                    const AddTraceToDraftOptionsGenerator = require('./AddTraceToDraftOptionsGenerator');
                    const generatedDraftOptionsWithTrace = AddTraceToDraftOptionsGenerator._addTraceToDraftOptions(
                        JSON.parse(JSON.stringify(generatedDraftOptions)), // deep clone
                        draftTraceMap
                    );

                    const returnObj = {
                        modelValue: {
                            output: draftTraceMap,
                            aiOutput: draftTraceMap
                        },
                        inputParams: {
                            generatedDraftOptions: generatedDraftOptions,
                            boundedContextName: boundedContextName,
                            functionalRequirements: functionalRequirements,
                            traceMap: traceMap
                        },
                        draftTraceMap: draftTraceMap,
                        generatedDraftOptionsWithTrace: generatedDraftOptionsWithTrace
                    };

                    if (this.client.onGenerationSucceeded) {
                        this.client.onGenerationSucceeded(returnObj);
                    }
                },
                // onWaiting
                (waitingJobCount) => {
                    // Silent or could log waiting count
                },
                // onFailed
                (errorMsg) => {
                    console.error('[AddTraceToDraftOptionsGeneratorLangGraph] Job failed:', errorMsg);
                    if (this.client.onError) {
                        this.client.onError({
                            errorMessage: errorMsg,
                            inputParams: {
                                generatedDraftOptions,
                                boundedContextName,
                                functionalRequirements,
                                traceMap
                            }
                        });
                    }
                }
            );

        } catch (error) {
            console.error('[AddTraceToDraftOptionsGeneratorLangGraph] Error:', error);
            if (this.client.onError) {
                this.client.onError({
                    errorMessage: error.message,
                    inputParams: {
                        generatedDraftOptions,
                        boundedContextName,
                        functionalRequirements,
                        traceMap
                    }
                });
            }
        }
    }
}

module.exports = AddTraceToDraftOptionsGeneratorLangGraph;

