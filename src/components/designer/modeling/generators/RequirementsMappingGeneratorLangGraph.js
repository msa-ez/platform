const RequirementsMappingLangGraphProxy = require("./proxies/RequirementsMappingLangGraphProxy/RequirementsMappingLangGraphProxy");

/**
 * RequirementsMappingGeneratorLangGraph
 * Backend LangGraph를 사용한 Requirements Mapping Generator
 */
class RequirementsMappingGeneratorLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'RequirementsMappingGeneratorLangGraph';
    }

    async generate() {
        const boundedContext = this.client.input['boundedContext'];
        const requirementChunk = this.client.input['requirementChunk'];

        // Job ID 생성
        const jobId = `reqmap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
            // Job 생성
            await RequirementsMappingLangGraphProxy.makeNewJob(
                jobId,
                boundedContext,
                requirementChunk
            );

            // Job 감시
            RequirementsMappingLangGraphProxy.watchJob(
                jobId,
                // onUpdate - 진행 중 업데이트
                async (bcName, requirements, logs, progress) => {
                    const updateObj = {
                        modelValue: {
                            output: {
                                boundedContext: bcName,
                                requirements: requirements
                            }
                        }
                    };
                    this.client.onModelCreated(updateObj);
                },
                // onComplete - 완료 후 다음 BC/청크 처리
                async (bcName, requirements, logs, progress, isFailed) => {
                    if (isFailed) {
                        console.error('[RequirementsMappingGenerator] Job failed');
                        return;
                    }

                    const returnObj = {
                        modelValue: {
                            output: {
                                boundedContext: bcName,
                                requirements: requirements
                            }
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
                    console.error('[RequirementsMapping] Job failed:', errorMsg);
                }
            );

        } catch (error) {
            console.error('[RequirementsMapping] Error:', error);
        }
    }
}

module.exports = RequirementsMappingGeneratorLangGraph;

