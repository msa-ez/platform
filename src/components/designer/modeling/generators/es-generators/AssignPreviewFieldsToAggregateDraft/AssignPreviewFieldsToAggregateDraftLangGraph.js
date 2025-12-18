const PreviewFieldsLangGraphProxy = require('../../proxies/PreviewFieldsLangGraphProxy/PreviewFieldsLangGraphProxy');
const TextTraceUtil = require('../../utils/TraceUtils/TextTraceUtil');
const RefsTraceUtil = require('../../utils/TraceUtils/RefsTraceUtil');
const MessageDataRestoreUtil = require('../../features/ESDialoger/utils/MessageDataRestoreUtil');

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
        const originalRequirements = this.client.input['originalRequirements']; // 원본 요구사항 (userStory + ddl)

        const jobId = PreviewFieldsLangGraphProxy.generateJobId();

        try {
            // Job 생성 (프론트엔드 에이전트 방식과 동일하게 description만 전달)
            await PreviewFieldsLangGraphProxy.makeNewJob(
                jobId,
                description || 'Bounded context description',
                aggregateDrafts,
                generatorKey,
                traceMap,
                originalRequirements // 원본 요구사항 전달
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
                        
                        // refs 후처리 (프론트엔드 에이전트 방식과 동일: _convertRefsToIndexes)
                        // Firebase를 통해서 변질된 것을 원복하는 단계만 추가
                        if (result && result.length > 0) {
                            // 프론트엔드 에이전트 방식과 동일하게 description만 사용
                            const rawRequirements = description; // bounded context description
                            const lineNumberedRequirements = TextTraceUtil.addLineNumbers(description, 1, true);
                            
                            // traceMap 복원 (Firebase가 배열로 변환한 경우 처리)
                            let traceMapObj = MessageDataRestoreUtil._restoreTraceMap(traceMap);
                            
                            // traceMap이 Map 객체인 경우 일반 객체로 변환 (RefsTraceUtil.convertToOriginalRefsUsingTraceMap은 traceMap[i]로 접근)
                            if (traceMapObj instanceof Map) {
                                const mapObj = {};
                                for (const [key, value] of traceMapObj.entries()) {
                                    mapObj[key] = value;
                                }
                                traceMapObj = mapObj;
                            }
                            
                            for (const assignment of result) {
                                for (const field of assignment.previewFields) {
                                    if (!field.refs || field.refs.length === 0) continue;
                                    
                                    // 백엔드에서 이미 변환된 refs인지 확인 (인덱스 형식: [[[line, col], [line, col]]])
                                    const firstRef = field.refs[0];
                                    const isAlreadyIndexFormat = Array.isArray(firstRef) && 
                                        Array.isArray(firstRef[0]) && 
                                        Array.isArray(firstRef[1]) &&
                                        typeof firstRef[0][1] === 'number' && 
                                        typeof firstRef[1][1] === 'number';
                                    
                                    // 디버그: 백엔드에서 반환된 refs 형식 확인
                                    console.debug(`[AssignPreviewFieldsToAggregateDraftLangGraph] field='${field.fieldName}', refs=${JSON.stringify(field.refs.slice(0, 1))}, isAlreadyIndexFormat=${isAlreadyIndexFormat}`);
                                    
                                    // 백엔드에서 이미 변환된 refs (sanitizeAndConvertRefs + convertToOriginalRefsUsingTraceMap 완료)
                                    // 프론트엔드에서는 원본 요구사항 기준으로 검증만 수행
                                    // (백엔드에서 공통 유틸리티 RefsTraceUtil을 사용하여 프론트엔드와 동일한 로직으로 처리됨)
                                    RefsTraceUtil.validateRefs(field.refs, originalRequirements || rawRequirements);
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

