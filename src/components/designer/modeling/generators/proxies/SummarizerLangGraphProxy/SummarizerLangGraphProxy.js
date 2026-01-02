const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

/**
 * SummarizerLangGraphProxy
 * 
 * Firebase Job Queue를 통해 Backend Summarizer와 통신
 */
class SummarizerLangGraphProxy {
    // 상수 정의
    static get JOB_TYPE() {
        return 'summarizer';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    /**
     * 새 Summarizer 생성 Job 생성
     * 
     * @param {string} jobId - Job ID
     * @param {string} requirements - 요구사항 텍스트 (라인 번호 포함)
     * @param {number} iteration - 반복 횟수 (1-3)
     * @returns {Promise<string>} Job ID
     */
    static async makeNewJob(jobId, requirements, iteration = 1) {
        const storage = new Vue(StorageBase);

        const inputs = {
            "jobId": jobId,
            "requirements": requirements,
            "iteration": iteration
        };

        await storage.setObject(this._getJobPath(jobId), {
            "state": {
                "inputs": inputs
            }
        });

        await storage.setObject(this._getRequestJobPath(jobId), {
            "createdAt": storage.getServerTimestamp()
        });

        console.log(`✅ Summarizer Job created: ${jobId}`);
        return jobId;
    }

    /**
     * Job 진행 상황 감시
     * 
     * @param {string} jobId - Job ID
     * @param {Function} onUpdate - 진행 중 업데이트 콜백 (summaries, logs, progress)
     * @param {Function} onComplete - 완료 콜백 (summaries, logs, progress, isFailed)
     * @param {Function} onWaiting - 대기 콜백 (waitingJobCount)
     * @param {Function} onFailed - 실패 콜백 (errorMsg)
     */
    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        const jobState = this._initializeJobState(storage, jobId);
        const callbacks = { onUpdate, onComplete, onWaiting, onFailed };
        
        this._setupJobWatchers(storage, jobId, jobState, callbacks);
    }

    /**
     * Job 상태 초기화
     */
    static _initializeJobState(storage, jobId) {
        let accumulatedOutputState = this._restoreDataFromFirebase(
            storage.getObject(`${this._getJobPath(jobId)}/state/outputs`)
        );
        
        // 기본값 설정
        if (!accumulatedOutputState.summarizedRequirements) {
            accumulatedOutputState.summarizedRequirements = [];
        }
        if (!accumulatedOutputState.logs) {
            accumulatedOutputState.logs = [];
        }
        if (accumulatedOutputState.progress === undefined) {
            accumulatedOutputState.progress = 0;
        }
        if (accumulatedOutputState.isCompleted === undefined) {
            accumulatedOutputState.isCompleted = false;
        }
        if (accumulatedOutputState.isFailed === undefined) {
            accumulatedOutputState.isFailed = false;
        }
        if (!accumulatedOutputState.error) {
            accumulatedOutputState.error = '';
        }
        
        return accumulatedOutputState;
    }

    /**
     * 모든 워처 설정
     */
    static _setupJobWatchers(storage, jobId, jobState, callbacks) {
        const parseState = async () => await this._parseAndNotifyJobState(jobState, callbacks);
        
        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting);
        
        // 작업 상태 감시 (완료/실패)
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        // 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        // Summaries 감시 (비동기)
        this._watchSummaries(storage, jobId, jobState, parseState);
        
        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);
    }

    /**
     * 대기 중인 작업 수 감시
     */
    static _watchWaitingJobCount(storage, jobId, onWaiting) {
        storage.watch(`${this._getRequestJobPath(jobId)}/waitingJobCount`, async (waitingJobCount) => {
            if (waitingJobCount && waitingJobCount > 0) {
                await onWaiting(waitingJobCount);
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

        // 완료 상태 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isCompleted`, async (isCompleted) => {
            if (isCompleted) {
                jobState.isCompleted = isCompleted;
                // parseState는 _watchSummaries에서 호출됨
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
                // parseState는 _watchSummaries에서만 호출됨
            }
        });
    }

    /**
     * Summaries 감시
     */
    static _watchSummaries(storage, jobId, jobState, parseState) {
        console.log('[SummarizerLangGraphProxy] _watchSummaries 시작:', jobId);
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/summarizedRequirements`, async (summaries) => {
            console.log('[SummarizerLangGraphProxy] _watchSummaries 감지:', summaries);
            if (summaries) {
                jobState.summarizedRequirements = this._restoreArrayFromFirebase(summaries);
                console.log('[SummarizerLangGraphProxy] _watchSummaries 복원 후:', jobState.summarizedRequirements.length);
                console.log('[SummarizerLangGraphProxy] _watchSummaries parseState 호출 전:', jobState.isCompleted);
                await parseState();
                console.log('[SummarizerLangGraphProxy] _watchSummaries parseState 호출 후');
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
            summarizedRequirements: jobState.summarizedRequirements || [],
            logs: jobState.logs || [],
            progress: jobState.progress || 0,
            isCompleted: jobState.isCompleted || false,
            isFailed: jobState.isFailed || false,
            error: jobState.error || ''
        };

        console.log('[SummarizerLangGraphProxy] _parseAndNotifyJobState:', {
            summarizedRequirements: state.summarizedRequirements.length,
            isCompleted: state.isCompleted,
            hasOnComplete: !!callbacks.onComplete
        });

        if (state.isCompleted) {
            console.log('[SummarizerLangGraphProxy] _parseAndNotifyJobState onComplete 호출:', state.summarizedRequirements.length);
            await callbacks.onComplete(
                state.summarizedRequirements,
                state.logs,
                state.progress,
                state.isFailed
            );
        } else {
            console.log('[SummarizerLangGraphProxy] _parseAndNotifyJobState onUpdate 호출:', state.summarizedRequirements.length);
            await callbacks.onUpdate(
                state.summarizedRequirements,
                state.logs,
                state.progress
            );
        }
    }

    /**
     * Firebase 배열 데이터 복원
     */
    static _restoreArrayFromFirebase(firebaseData) {
        if (!firebaseData) return [];
        if (Array.isArray(firebaseData)) return firebaseData;
        
        // Firebase에서 객체로 저장된 배열 복원
        return Object.keys(firebaseData)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(key => firebaseData[key]);
    }

    /**
     * Firebase 데이터 복원 (마커 처리)
     */
    static _restoreDataFromFirebase(data) {
        if (!data) return data;
        
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
            const result = {};
            for (const [k, v] of Object.entries(data)) {
                result[k] = processValue(v);
            }
            return result;
        }
        return data;
    }

    /**
     * Job 삭제
     */
    static async deleteJob(jobId) {
        const storage = new Vue(StorageBase);
        
        try {
            await storage.removeObject(this._getJobPath(jobId));
            await storage.removeObject(this._getRequestJobPath(jobId));
            console.log(`✅ Summarizer Job deleted: ${jobId}`);
        } catch (error) {
            console.error(`❌ Failed to delete Summarizer Job ${jobId}:`, error);
        }
    }

    // Path 헬퍼 메서드들
    static _getJobPath(jobId) {
        return `db://${this.PATHS.JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    static _getRequestJobPath(jobId) {
        return `db://${this.PATHS.REQUESTED_JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    static _getJobStatePath(jobId) {
        return `db://${this.PATHS.JOB_STATES}/${this.JOB_TYPE}/${jobId}`;
    }
    
    static _getNamespace() {
        return this.JOB_TYPE;
    }
}

module.exports = SummarizerLangGraphProxy;

