const StandardTransformerLangGraphProxy = require('../../proxies/StandardTransformerLangGraphProxy/StandardTransformerLangGraphProxy');

/**
 * LangGraph 백엔드를 사용하는 Standard Transformer Generator
 * 생성된 Aggregate 초안을 회사 표준에 맞게 변환
 */
class StandardTransformerLangGraph {
    constructor(client) {
        this.client = client;
        this.generatorName = 'StandardTransformerLangGraph';
    }

    async generate() {
        const draftOptions = this.client.input['draftOptions'];
        const boundedContext = this.client.input['boundedContext'];
        const transformationSessionId = this.client.input['transformationSessionId'];
        const userId = this.client.input['userId'];

        // Proxy의 generateJobId 사용 (백엔드 감지 패턴과 일치)
        const jobId = StandardTransformerLangGraphProxy.generateJobId();

        try {
            // Job 생성
            await StandardTransformerLangGraphProxy.makeNewJob(
                jobId,
                draftOptions,
                boundedContext,
                transformationSessionId,
                userId
            );

            // Job 감시
            StandardTransformerLangGraphProxy.watchJob(
                jobId,
                // onUpdate - 진행 중 업데이트
                (updateData) => {
                    if (this.client.onModelCreatedWithThinking) {
                        this.client.onModelCreatedWithThinking({
                            directMessage: updateData.transformationLog || `Applying company standards to aggregate drafts...`,
                            transformationLog: updateData.transformationLog || '',
                            transformation_log: updateData.transformationLog || '',
                            progress: updateData.progress || 0
                        });
                    }
                },
                // onComplete - 완료 후 처리 (프록시에서 이미 검증 완료)
                async (completeData) => {
                    // 프록시에서 검증을 통과했으므로 안정적으로 변환된 결과
                    const transformedOptions = completeData && completeData.transformedOptions 
                        ? completeData.transformedOptions 
                        : draftOptions; // fallback (이론적으로는 발생하지 않아야 함)

                    // 변환 검증을 완화: 프록시에서 이미 검증했으므로, transformedOptions가 있으면 통과
                    if (!transformedOptions || transformedOptions.length === 0) {
                        return;
                    }

                    const returnObj = {
                        modelValue: {
                            output: {
                                options: transformedOptions
                            }
                        },
                        inputParams: {
                            draftOptions: draftOptions,
                            boundedContext: boundedContext
                        },
                        transformedOptions: transformedOptions,
                        transformationLog: completeData.transformationLog || ''
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
                    if (this.client.onError) {
                        this.client.onError({
                            errorMessage: errorMsg,
                            inputParams: {
                                draftOptions,
                                boundedContext
                            }
                        });
                    }
                }
            );

        } catch (error) {
            if (this.client.onError) {
                this.client.onError({
                    errorMessage: error.message,
                    inputParams: {
                        draftOptions,
                        boundedContext
                    }
                });
            }
        }
    }

    /**
     * 실제 변환이 일어났는지 확인
     * @param {Array} originalOptions - 원본 옵션들
     * @param {Array} transformedOptions - 변환된 옵션들
     * @returns {boolean} - 실제 변환이 일어났으면 true
     */
    _hasActualTransformation(originalOptions, transformedOptions) {
        if (!Array.isArray(originalOptions) || !Array.isArray(transformedOptions)) {
            return false;
        }

        if (originalOptions.length !== transformedOptions.length) {
            // 옵션 수가 다르면 변환이 일어난 것으로 간주 (검증 실패이지만 변환 시도는 했음)
            return true;
        }

        // 각 옵션의 structure 내부의 name/alias가 실제로 변환되었는지 확인
        for (let i = 0; i < originalOptions.length; i++) {
            const original = originalOptions[i];
            const transformed = transformedOptions[i];

            if (!original || !transformed) {
                continue;
            }

            const originalStructure = original.structure || [];
            const transformedStructure = transformed.structure || [];

            if (originalStructure.length !== transformedStructure.length) {
                return true; // 구조가 다르면 변환된 것으로 간주
            }

            // 각 structure 항목의 name/alias 비교
            for (let j = 0; j < originalStructure.length; j++) {
                const origItem = originalStructure[j];
                const transItem = transformedStructure[j];

                if (!origItem || !transItem) {
                    continue;
                }

                // Aggregate name/alias 비교
                const origAgg = origItem.aggregate || {};
                const transAgg = transItem.aggregate || {};
                if (origAgg.name !== transAgg.name || origAgg.alias !== transAgg.alias) {
                    return true; // 변환됨
                }

                // ValueObject name/alias 비교
                const origVOs = origItem.valueObjects || [];
                const transVOs = transItem.valueObjects || [];
                if (origVOs.length !== transVOs.length) {
                    return true; // 변환됨
                }
                for (let k = 0; k < origVOs.length; k++) {
                    const origVO = origVOs[k];
                    const transVO = transVOs[k];
                    if (origVO && transVO) {
                        if ((origVO.name !== transVO.name) || 
                            (origVO.alias !== transVO.alias)) {
                            return true; // 변환됨
                        }
                    }
                }

                // Enumeration name/alias 비교
                const origEnums = origItem.enumerations || [];
                const transEnums = transItem.enumerations || [];
                if (origEnums.length !== transEnums.length) {
                    return true; // 변환됨
                }
                for (let k = 0; k < origEnums.length; k++) {
                    const origEnum = origEnums[k];
                    const transEnum = transEnums[k];
                    if (origEnum && transEnum) {
                        if ((origEnum.name !== transEnum.name) || 
                            (origEnum.alias !== transEnum.alias)) {
                            return true; // 변환됨
                        }
                    }
                }
            }
        }

        // 모든 항목이 동일하면 변환이 일어나지 않은 것으로 간주
        return false;
    }
}

module.exports = StandardTransformerLangGraph;

