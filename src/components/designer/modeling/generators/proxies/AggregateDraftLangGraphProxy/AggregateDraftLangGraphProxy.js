const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

/**
 * Aggregate Draft Generator용 LangGraph Backend Proxy
 */
class AggregateDraftLangGraphProxy {
    static get JOB_TYPE() {
        return 'aggregate_draft_generator';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    /**
     * 새로운 Aggregate Draft Job 생성
     * 
     * @param {string} jobId - Job ID (aggr-draft-{timestamp}-{random})
     * @param {object} boundedContext - BC 정보
     * @param {string} description - 요구사항 설명
     * @param {object} accumulatedDrafts - 누적 초안
     * @param {object} analysisResult - 분석 결과 (optional)
     */
    static async makeNewJob(jobId, boundedContext, description, accumulatedDrafts, analysisResult = null) {
        const storage = new Vue(StorageBase);

        const inputs = {
            "jobId": jobId,
            "boundedContext": boundedContext,
            "description": description,
            "accumulatedDrafts": accumulatedDrafts,
            "analysisResult": analysisResult
        };

        await storage.setObject(this._getJobPath(jobId), {
            "state": {
                "inputs": inputs
            }
        });

        await storage.setObject(this._getRequestJobPath(jobId), {
            "createdAt": storage.getServerTimestamp()
        });

        return jobId;
    }

    /**
     * Job 진행 상황 감시
     * 
     * @param {string} jobId - Job ID
     * @param {Function} onUpdate - 진행 중 업데이트 콜백 (bcName, inference, options, progress)
     * @param {Function} onComplete - 완료 콜백 (bcName, inference, options, defaultOptionIndex, conclusions, logs, progress, isFailed)
     * @param {Function} onWaiting - 대기 콜백 (waitingJobCount)
     * @param {Function} onFailed - 실패 콜백 (errorMsg)
     */
    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        
        const callbacks = {
            onUpdate,
            onComplete,
            onWaiting,
            onFailed
        };
        
        const jobState = this._initializeJobState();
        
        this._setupJobWatchers(storage, jobId, jobState, callbacks);
    }

    /**
     * Job 상태 초기화
     */
    static _initializeJobState() {
        const accumulatedOutputState = {
            boundedContext: '',
            inference: '',
            options: [],
            defaultOptionIndex: 0,
            conclusions: '',
            logs: [],
            progress: 0,
            isCompleted: false,
            isFailed: false,
            error: ''
        };
        
        return accumulatedOutputState;
    }

    /**
     * 모든 워처 설정
     */
    static _setupJobWatchers(storage, jobId, jobState, callbacks) {
        // 중복 호출 방지를 위한 플래그
        let callbackInvoked = false;
        
        const parseState = async () => {
            if (callbackInvoked) {
                return;
            }
            
            if (jobState.isCompleted) {
                callbackInvoked = true;
            }
            
            await this._parseAndNotifyJobState(jobState, callbacks);
        };
        
        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting);
        
        // 작업 상태 감시 (완료/실패)
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        // 작업 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        // Inference 감시
        this._watchInference(storage, jobId, jobState, parseState);
        
        // Options 감시
        this._watchOptions(storage, jobId, jobState, parseState);
        
        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);
    }

    /**
     * 대기 중인 작업 수 감시
     */
    static _watchWaitingJobCount(storage, jobId, onWaiting) {
        storage.watch(`${this._getRequestJobPath(jobId)}/waitingJobCount`, async (count) => {
            if (count !== null && count !== undefined) {
                await onWaiting(count);
            }
        });
    }

    /**
     * 작업 상태 감시 (완료/실패)
     */
    static _watchJobStatus(storage, jobId, jobState, onFailed, parseState) {
        // 실패 상태 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isFailed`, async (isFailed) => {
            if (isFailed === null || isFailed === undefined) return;
            if (!isFailed) return;
            
            jobState.isFailed = isFailed;
            await parseState();
            
            const errorMsg = jobState.error || "Unknown error occurred";
            await onFailed(errorMsg);
        });

        // BoundedContext 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/boundedContext`, async (boundedContext) => {
            if (boundedContext !== null && boundedContext !== undefined) {
                jobState.boundedContext = boundedContext;
            }
        });
        
        // 완료 상태 감시 (중복 호출 방지)
        let completedCalled = false;
        const unwatchCompleted = storage.watch(`${this._getJobPath(jobId)}/state/outputs/isCompleted`, async (isCompleted) => {
            if (isCompleted && !completedCalled) {
                completedCalled = true;
                jobState.isCompleted = isCompleted;
                
                // 완료 시 전체 outputs 객체 읽기
                const outputs = await storage.getObject(`${this._getJobPath(jobId)}/state/outputs`);
                
                if (outputs) {
                    if (!jobState.boundedContext && outputs.boundedContext) {
                        jobState.boundedContext = outputs.boundedContext;
                    }
                    if (outputs.inference) {
                        jobState.inference = outputs.inference;
                    }
                    if (outputs.options) {
                        jobState.options = this._restoreArrayFromFirebase(outputs.options);
                    }
                    if (outputs.defaultOptionIndex !== null && outputs.defaultOptionIndex !== undefined) {
                        jobState.defaultOptionIndex = outputs.defaultOptionIndex;
                    }
                    if (outputs.conclusions) {
                        jobState.conclusions = outputs.conclusions;
                    }
                }
                
                await parseState();
                
                // watch 해제
                if (unwatchCompleted) unwatchCompleted();
            }
        });
        
        // 에러 메시지 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/error`, async (error) => {
            if (error) {
                jobState.error = error;
            }
        });
    }

    /**
     * 작업 진행률 감시
     */
    static _watchJobProgress(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/progress`, async (progress) => {
            if (progress !== null && progress !== undefined) {
                jobState.progress = progress;
            }
        });
    }

    /**
     * Inference 감시
     */
    static _watchInference(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/inference`, async (inference) => {
            if (inference) {
                jobState.inference = inference;
                await parseState();
            }
        });
    }

    /**
     * Options 감시
     */
    static _watchOptions(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/options`, async (options) => {
            if (options) {
                jobState.options = this._restoreArrayFromFirebase(options);
                await parseState();
            }
        });
    }

    /**
     * 로그 감시
     */
    static _watchJobLogs(storage, jobId, jobState, parseState) {
        storage.watch_added(`${this._getJobPath(jobId)}/state/outputs/logs`, null, async (log) => {
            if (!log) return;
            
            const restoredLog = this._restoreDataFromFirebase(log);
            jobState.logs.push(restoredLog);
        });
    }

    /**
     * 작업 상태 파싱 및 콜백 호출
     */
    static async _parseAndNotifyJobState(jobState, callbacks) {
        const state = {
            boundedContext: jobState.boundedContext || '',
            inference: jobState.inference || '',
            options: jobState.options || [],
            defaultOptionIndex: jobState.defaultOptionIndex || 0,
            conclusions: jobState.conclusions || '',
            logs: jobState.logs || [],
            progress: jobState.progress || 0,
            isCompleted: jobState.isCompleted || false,
            isFailed: jobState.isFailed || false,
            error: jobState.error || ''
        };

        if (state.isCompleted) {
            await callbacks.onComplete(
                state.boundedContext,
                state.inference,
                state.options,
                state.defaultOptionIndex,
                state.conclusions,
                state.logs,
                state.progress,
                state.isFailed
            );
        } else {
            await callbacks.onUpdate(
                state.boundedContext,
                state.inference,
                state.options,
                state.progress
            );
        }
    }

    // ========== Firebase 경로 헬퍼 메서드 ==========
    
    static _getJobPath(jobId) {
        return `db://${this.PATHS.JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    static _getRequestJobPath(jobId) {
        return `db://${this.PATHS.REQUESTED_JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    static _getJobStatePath(jobId) {
        return `db://${this.PATHS.JOB_STATES}/${this.JOB_TYPE}/${jobId}`;
    }

    // ========== Firebase 데이터 복원 메서드 ==========
    
    static _restoreArrayFromFirebase(firebaseData) {
        if (!firebaseData) return [];
        
        // ['@'] 마커 체크 (빈 배열)
        if (Array.isArray(firebaseData) && firebaseData.length === 1 && firebaseData[0] === '@') {
            return [];
        }
        
        if (Array.isArray(firebaseData)) {
            return firebaseData.map(item => this._restoreDataFromFirebase(item));
        }
        
        // Firebase 객체를 배열로 변환
        if (typeof firebaseData === 'object') {
            return Object.values(firebaseData).map(item => this._restoreDataFromFirebase(item));
        }
        
        return [];
    }

    static _restoreDataFromFirebase(data) {
        const processValue = (value) => {
            if (value === "@") {
                return null;
            } else if (Array.isArray(value) && value.length === 1 && value[0] === "@") {
                return [];
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
                       Object.keys(value).length === 1 && value["@"] === true) {
                return {};
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const result = {};
                for (const [k, v] of Object.entries(value)) {
                    result[k] = processValue(v);
                }
                return result;
            } else if (Array.isArray(value)) {
                return value.map(item => processValue(item));
            } else {
                return value;
            }
        };

        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            return processValue(data);
        } else if (Array.isArray(data)) {
            return data.map(item => processValue(item));
        } else {
            return data;
        }
    }
}

module.exports = AggregateDraftLangGraphProxy;

