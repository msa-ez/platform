const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

/**
 * UserStoryLangGraphProxy
 * 
 * Firebase Job Queue를 통해 백엔드 UserStoryGenerator와 통신
 */
class UserStoryLangGraphProxy {
    // 상수 정의
    static get JOB_TYPE() {
        return 'user_story_generator';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    /**
     * 새 UserStory 생성 Job 생성
     * 
     * @param {string} jobId - Job ID
     * @param {string} requirements - 요구사항 텍스트
     * @param {Array} boundedContexts - Bounded Context 정보 (선택)
     * @param {Object} existingData - 이전 청크의 누적 결과 (recursive 모드)
     * @returns {Promise<string>} Job ID
     */
    static async makeNewJob(jobId, requirements, boundedContexts = [], existingData = null) {
        const storage = new Vue(StorageBase);

        const inputs = {
            "jobId": jobId,
            "requirements": requirements,
            "bounded_contexts": boundedContexts
        };

        // ✅ 이전 청크의 누적 결과 포함 (기존 RecursiveUserStoryGenerator 방식)
        if (existingData) {
            inputs["existingActors"] = existingData.actors || [];
            inputs["existingUserStories"] = existingData.userStories || [];
            inputs["existingBusinessRules"] = existingData.businessRules || [];
            inputs["existingBoundedContexts"] = existingData.boundedContexts || [];
        }

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
     * @param {Function} onUpdate - 진행 중 업데이트 콜백 (userStories, logs, progress)
     * @param {Function} onComplete - 완료 콜백 (userStories, logs, progress, isFailed)
     * @param {Function} onWaiting - 대기 콜백 (waitingJobCount)
     * @param {Function} onFailed - 실패 콜백 (errorMsg)
     */
    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        const jobState = this._initializeJobState(storage, jobId);  // storage와 jobId 전달
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
     * Firebase에서 기존 데이터 복원 (Aggregate Generator 방식)
     */
    static _initializeJobState(storage, jobId) {
        let accumulatedOutputState = this._restoreDataFromFirebase(
            storage.getObject(`${this._getJobPath(jobId)}/state/outputs`)
        );
        
        // 기본값 설정
        if (!accumulatedOutputState.userStories) {
            accumulatedOutputState.userStories = [];
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
        if (!accumulatedOutputState.textResponse) {
            accumulatedOutputState.textResponse = null;
        }
        if (accumulatedOutputState.isFailed === undefined) {
            accumulatedOutputState.isFailed = false;
        }
        if (!accumulatedOutputState.error) {
            accumulatedOutputState.error = '';
        }
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
        const parseState = async () => {
            await this._parseAndNotifyJobState(jobState, callbacks);
            if (jobState.isCompleted || jobState.isFailed) {
                this._cleanupWatchers(storage, jobState);
            }
        };
        
        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, jobState, callbacks.onWaiting);
        
        // 작업 상태 감시 (완료/실패)
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        // 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        // User Stories 감시
        this._watchUserStories(storage, jobId, jobState, parseState);
        
        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);
    }

    /**
     * 대기 중인 작업 수 감시
     */
    static _watchWaitingJobCount(storage, jobId, jobState, onWaiting) {
        const path = `${this._getRequestJobPath(jobId)}/waitingJobCount`;
        this._trackWatch(jobState, path);
        storage.watch(path, async (waitingJobCount) => {
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
        const failedPath = `${this._getJobPath(jobId)}/state/outputs/isFailed`;
        this._trackWatch(jobState, failedPath);
        storage.watch(failedPath, async (isFailed) => {
            if (!isFailed) return;
            
            jobState.isFailed = isFailed;
            await parseState();
            
            const errorMsg = jobState.error || "Unknown error occurred";
            await onFailed(errorMsg);
            this._cleanupWatchers(storage, jobState);
        });

        // 완료 상태 감시
        const completedPath = `${this._getJobPath(jobId)}/state/outputs/isCompleted`;
        this._trackWatch(jobState, completedPath);
        storage.watch(completedPath, async (isCompleted) => {
            if (!isCompleted) return;
            
            jobState.isCompleted = isCompleted;
            await parseState();
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
                await parseState();
            }
        });
    }

    /**
     * User Stories 감시
     */
    static _watchUserStories(storage, jobId, jobState, parseState) {
        // User Stories 배열 전체 감시 (camelCase)
        const userStoriesPath = `${this._getJobPath(jobId)}/state/outputs/userStories`;
        this._trackWatch(jobState, userStoriesPath);
        storage.watch(userStoriesPath, async (userStories) => {
            if (userStories) {
                jobState.userStories = this._restoreArrayFromFirebase(userStories);
                await parseState();
            }
        });
        
        // Actors 감시
        const actorsPath = `${this._getJobPath(jobId)}/state/outputs/actors`;
        this._trackWatch(jobState, actorsPath);
        storage.watch(actorsPath, async (actors) => {
            if (actors) {
                jobState.actors = this._restoreArrayFromFirebase(actors);
                await parseState();
            }
        });
        
        // Business Rules 감시
        const businessRulesPath = `${this._getJobPath(jobId)}/state/outputs/businessRules`;
        this._trackWatch(jobState, businessRulesPath);
        storage.watch(businessRulesPath, async (businessRules) => {
            if (businessRules) {
                jobState.businessRules = this._restoreArrayFromFirebase(businessRules);
                await parseState();
            }
        });
        
        // Bounded Contexts 감시
        const boundedContextsPath = `${this._getJobPath(jobId)}/state/outputs/boundedContexts`;
        this._trackWatch(jobState, boundedContextsPath);
        storage.watch(boundedContextsPath, async (boundedContexts) => {
            if (boundedContexts) {
                jobState.boundedContexts = this._restoreArrayFromFirebase(boundedContexts);
                await parseState();
            }
        });
        
        // Text Response 감시 (텍스트 모드용)
        const textResponsePath = `${this._getJobPath(jobId)}/state/outputs/textResponse`;
        this._trackWatch(jobState, textResponsePath);
        storage.watch(textResponsePath, async (textResponse) => {
            if (textResponse) {
                jobState.textResponse = textResponse;
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
            await parseState();
        });
    }

    /**
     * 작업 상태 파싱 및 콜백 호출
     */
    static async _parseAndNotifyJobState(jobState, callbacks) {
        const state = {
            userStories: jobState.userStories || [],
            actors: jobState.actors || [],
            businessRules: jobState.businessRules || [],
            boundedContexts: jobState.boundedContexts || [],
            textResponse: jobState.textResponse || null,
            logs: jobState.logs || [],
            progress: jobState.progress || 0,
            isCompleted: jobState.isCompleted || false,
            isFailed: jobState.isFailed || false,
            error: jobState.error || ''
        };

        if (state.isCompleted) {
            await callbacks.onComplete(
                state,
                state.logs,
                state.progress,
                state.isFailed
            );
        } else {
            await callbacks.onUpdate(
                state,
                state.logs,
                state.progress
            );
        }
    }

    /**
     * Firebase 경로 헬퍼
     * UserStory Generator 전용 namespace
     */
    static _getNamespace() {
        return 'user_story_generator';
    }

    static _getJobPath(jobId) {
        return `db://${this.PATHS.JOBS}/${this._getNamespace()}/${jobId}`;
    }

    static _getRequestJobPath(jobId) {
        return `db://${this.PATHS.REQUESTED_JOBS}/${this._getNamespace()}/${jobId}`;
    }

    static _getJobStatePath(jobId) {
        return `db://${this.PATHS.JOB_STATES}/${this._getNamespace()}/${jobId}`;
    }

    /**
     * Firebase 배열 복원
     * Firebase에서는 배열이 객체로 저장되므로 복원 필요
     */
    static _restoreArrayFromFirebase(data) {
        if (Array.isArray(data)) {
            return data.map(item => this._restoreDataFromFirebase(item));
        }
        if (typeof data === 'object' && data !== null) {
            // Firebase 객체를 배열로 변환
            return Object.values(data).map(item => this._restoreDataFromFirebase(item));
        }
        return [];
    }

    /**
     * Firebase에서 가져온 데이터를 원본 형태로 복원
     * @param {Object} data Firebase에서 가져온 데이터
     * @returns {Object} 복원된 데이터
     */
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

module.exports = UserStoryLangGraphProxy;

