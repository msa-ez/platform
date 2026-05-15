const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

/**
 * RequirementsMappingLangGraphProxy
 * 
 * Firebase Job Queue를 통해 백엔드 RequirementsMappingGenerator와 통신
 */
class RequirementsMappingLangGraphProxy {
    // 상수 정의
    static get JOB_TYPE() {
        return 'requirements_mapper';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    /**
     * 새 Requirements Mapping Job 생성
     * 
     * @param {string} jobId - Job ID
     * @param {Object} boundedContext - BC 정보
     * @param {Object} requirementChunk - 요구사항 청크
     * @returns {Promise<string>} Job ID
     */
    static async makeNewJob(jobId, boundedContext, requirementChunk) {
        const storage = new Vue(StorageBase);

        const inputs = {
            "jobId": jobId,
            "boundedContext": boundedContext,
            "requirementChunk": requirementChunk
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
     * @param {Function} onUpdate - 진행 중 업데이트 콜백
     * @param {Function} onComplete - 완료 콜백
     * @param {Function} onWaiting - 대기 콜백
     * @param {Function} onFailed - 실패 콜백
     */
    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        const jobState = this._initializeJobState(storage, jobId);
        const callbacks = { onUpdate, onComplete, onWaiting, onFailed };
        
        this._setupJobWatchers(storage, jobId, jobState, callbacks);
    }

    /**
     * Job 삭제 요청
     * 
     * @param {string} jobId - Job ID
     */
    static async removeJob(jobId) {
        const storage = new Vue(StorageBase);
        // setObjectWithRetry 로 일시 DB 끊김에도 stop 신호 안 유실되게.
        await storage.setObjectWithRetry(this._getJobStatePath(jobId), {
            "isRemoveRequested": true
        });
    }
    
    // ========== 내부 메서드 ==========
    
    /**
     * Job 상태 초기화
     * Firebase에서 기존 데이터 복원
     */
    static _initializeJobState(storage, jobId) {
        let accumulatedOutputState = this._restoreDataFromFirebase(
            storage.getObject(`${this._getJobPath(jobId)}/state/outputs`)
        );
        
        if (!accumulatedOutputState) {
            accumulatedOutputState = {};
        }
        
        // 필수 필드 초기화
        if (!accumulatedOutputState.requirements) {
            accumulatedOutputState.requirements = [];
        }
        if (!accumulatedOutputState.logs) {
            accumulatedOutputState.logs = [];
        }
        if (!accumulatedOutputState.progress) {
            accumulatedOutputState.progress = 0;
        }
        if (!accumulatedOutputState.isCompleted) {
            accumulatedOutputState.isCompleted = false;
        }
        if (!accumulatedOutputState.isFailed) {
            accumulatedOutputState.isFailed = false;
        }
        if (!accumulatedOutputState.error) {
            accumulatedOutputState.error = '';
        }

        // watcher 누수 방지용 path 추적
        accumulatedOutputState._watchedPaths = new Set();
        accumulatedOutputState._watchersCleaned = false;
        
        return accumulatedOutputState;
    }

    static _trackWatch(jobState, path) {
        if (jobState && jobState._watchedPaths) {
            jobState._watchedPaths.add(path);
        }
    }

    static _cleanupWatchers(storage, jobState) {
        if (!jobState || !jobState._watchedPaths || jobState._watchersCleaned) return;
        jobState._watchersCleaned = true;
        for (const path of jobState._watchedPaths) {
            try { storage.watch_off(path); } catch (e) { /* noop */ }
        }
        jobState._watchedPaths.clear();
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
        this._watchWaitingJobCount(storage, jobId, jobState, callbacks.onWaiting);
        
        // 작업 상태 감시 (완료/실패)
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        // 작업 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        // Requirements 결과 감시
        this._watchRequirements(storage, jobId, jobState, parseState);
        
        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);
    }

    /**
     * 대기 중인 작업 수 감시
     */
    static _watchWaitingJobCount(storage, jobId, jobState, onWaiting) {
        const path = `${this._getRequestJobPath(jobId)}/waitingJobCount`;
        this._trackWatch(jobState, path);
        storage.watch(path, async (count) => {
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
        const failedPath = `${this._getJobPath(jobId)}/state/outputs/isFailed`;
        this._trackWatch(jobState, failedPath);
        storage.watch(failedPath, async (isFailed) => {
            if (isFailed === null || isFailed === undefined) return;
            if (!isFailed) return;
            
            jobState.isFailed = isFailed;
            await parseState();
            
            const errorMsg = jobState.error || "Unknown error occurred";
            await onFailed(errorMsg);
            this._cleanupWatchers(storage, jobState);
        });

        // BoundedContext 감시 (개별 필드 감시 - 데이터만 저장, 콜백 호출 안함)
        const bcPath = `${this._getJobPath(jobId)}/state/outputs/boundedContext`;
        this._trackWatch(jobState, bcPath);
        storage.watch(bcPath, async (boundedContext) => {
            if (boundedContext !== null && boundedContext !== undefined) {
                jobState.boundedContext = boundedContext;
            }
        });
        
        // 완료 상태 감시 (중복 호출 방지 + watch 해제)
        let completedCalled = false;
        const completedPath = `${this._getJobPath(jobId)}/state/outputs/isCompleted`;
        this._trackWatch(jobState, completedPath);
        const unwatchCompleted = storage.watch(completedPath, async (isCompleted) => {
            if (isCompleted && !completedCalled) {
                completedCalled = true;
                jobState.isCompleted = isCompleted;
                
                // 완료 시 전체 outputs 객체 읽기 — DB 가 일시적으로 끊긴 상태일 수 있어 retry 버전 사용
                const outputs = await storage.getObjectWithRetry(`${this._getJobPath(jobId)}/state/outputs`);
                
                if (outputs) {
                    // boundedContext가 비어있으면 outputs에서 다시 가져오기
                    if (!jobState.boundedContext && outputs.boundedContext) {
                        jobState.boundedContext = outputs.boundedContext;
                    }
                    if (outputs.requirements !== null && outputs.requirements !== undefined) {
                        jobState.requirements = this._restoreArrayFromFirebase(outputs.requirements);
                    }
                }
                
                // parseState 호출 (콜백 실행)
                await parseState();
                
                // 콜백 완료 후 watch 해제
                if (unwatchCompleted) unwatchCompleted();
                this._cleanupWatchers(storage, jobState);
            }
        });
        
        // 에러 메시지 감시
        const errorPath = `${this._getJobPath(jobId)}/state/outputs/error`;
        this._trackWatch(jobState, errorPath);
        storage.watch(errorPath, async (error) => {
            if (error) {
                jobState.error = error;
            }
        });
    }

    /**
     * 작업 진행률 감시
     */
    static _watchJobProgress(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/progress`;
        this._trackWatch(jobState, path);
        storage.watch(path, async (progress) => {
            if (progress !== null && progress !== undefined) {
                jobState.progress = progress;
            }
        });
    }

    /**
     * Requirements 감시
     */
    static _watchRequirements(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/requirements`;
        this._trackWatch(jobState, path);
        storage.watch(path, async (requirements) => {
            if (requirements) {
                jobState.requirements = this._restoreArrayFromFirebase(requirements);
                await parseState();
            }
        });
    }

    /**
     * 로그 감시
     */
    static _watchJobLogs(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/logs`;
        this._trackWatch(jobState, path);
        storage.watch_added(path, null, async (log) => {
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
            requirements: jobState.requirements || [],
            logs: jobState.logs || [],
            progress: jobState.progress || 0,
            isCompleted: jobState.isCompleted || false,
            isFailed: jobState.isFailed || false,
            error: jobState.error || ''
        };

        if (state.isCompleted) {
            await callbacks.onComplete(
                state.boundedContext,
                state.requirements,
                state.logs,
                state.progress,
                state.isFailed
            );
        } else {
            await callbacks.onUpdate(
                state.boundedContext,
                state.requirements,
                state.logs,
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
                return null;  // 빈 문자열 → null
            } else if (Array.isArray(value) && value.length === 1 && value[0] === "@") {
                return [];  // 마커 → 빈 배열
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
                       Object.keys(value).length === 1 && value["@"] === true) {
                return {};  // 마커 객체 → 빈 객체
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // 객체인 경우 재귀적으로 처리
                const result = {};
                for (const [k, v] of Object.entries(value)) {
                    result[k] = processValue(v);
                }
                return result;
            } else if (Array.isArray(value)) {
                // 배열인 경우 각 요소를 재귀적으로 처리
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
}

module.exports = RequirementsMappingLangGraphProxy;

