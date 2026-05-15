const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

/**
 * Preview Fields Generator용 LangGraph Backend Proxy
 */
class PreviewFieldsLangGraphProxy {
    static get JOB_TYPE() {
        return 'preview_fields_generator';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    /**
     * 새로운 Preview Fields Job 생성
     * 
     * @param {string} jobId - Job ID (preview-fields-{timestamp}-{random})
     * @param {string} description - 요구사항 설명
     * @param {Array} aggregateDrafts - Aggregate 초안 리스트 [{name, alias}, ...]
     * @param {string} generatorKey - 생성기 키 (예: "option 1")
     * @param {object} traceMap - 추적성 맵
     */
    static async makeNewJob(jobId, description, aggregateDrafts, generatorKey, traceMap, originalRequirements = null) {
        // console.log(`✅ Preview Fields Job created: ${jobId}`);
        
        const storage = new Vue(StorageBase);

        const inputs = {
            "jobId": jobId,
            "description": description,
            "aggregateDrafts": aggregateDrafts,
            "generatorKey": generatorKey,
            "traceMap": traceMap
        };
        
        // originalRequirements가 제공되면 추가
        if (originalRequirements) {
            inputs["originalRequirements"] = originalRequirements;
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
     * @param {Function} onUpdate - 진행 중 업데이트 콜백 (progress)
     * @param {Function} onComplete - 완료 콜백 (aggregateFieldAssignments, logs, progress, isFailed)
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
            inference: '',
            aggregateFieldAssignments: [],
            logs: [],
            progress: 0,
            isCompleted: false,
            isFailed: false,
            error: '',
            // watcher 누수 방지 — 완료/실패 시 일괄 watch_off.
            _watchedPaths: new Set(),
            _watchersCleaned: false
        };

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

            if (jobState.isCompleted || jobState.isFailed) {
                this._cleanupWatchers(storage, jobState);
            }
        };

        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting, jobState);

        // 작업 상태 감시 (완료/실패)
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);

        // 작업 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);

        // Inference 감시
        this._watchInference(storage, jobId, jobState, parseState);

        // AggregateFieldAssignments 감시
        this._watchFieldAssignments(storage, jobId, jobState, parseState);

        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);
    }

    /**
     * 대기 중인 작업 수 감시
     */
    static _watchWaitingJobCount(storage, jobId, onWaiting, jobState) {
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
        // 완료 여부 감시
        const completedPath = `${this._getJobPath(jobId)}/state/outputs/isCompleted`;
        this._trackWatch(jobState, completedPath);
        storage.watch(completedPath, async (isCompleted) => {
            if (isCompleted === true) {
                jobState.isCompleted = true;
                await parseState();
            }
        });

        // 실패 여부 감시
        const failedPath = `${this._getJobPath(jobId)}/state/outputs/isFailed`;
        this._trackWatch(jobState, failedPath);
        storage.watch(failedPath, async (isFailed) => {
            if (isFailed === true) {
                jobState.isFailed = true;
                const errorMsg = jobState.error || 'Job failed';
                console.error(`[PreviewFieldsProxy] ❌ Job failed: ${errorMsg}`);
                if (onFailed) {
                    await onFailed(errorMsg);
                }
                this._cleanupWatchers(storage, jobState);
            }
        });
    }

    /**
     * 진행률 감시
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
     * Inference 감시
     */
    static _watchInference(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/inference`;
        this._trackWatch(jobState, path);
        storage.watch(path, async (inference) => {
            if (inference) {
                jobState.inference = inference;
                await parseState();
            }
        });
    }

    /**
     * AggregateFieldAssignments 감시
     */
    static _watchFieldAssignments(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/aggregateFieldAssignments`;
        this._trackWatch(jobState, path);
        storage.watch(path, async (assignments) => {
            if (assignments) {
                jobState.aggregateFieldAssignments = this._restoreArrayFromFirebase(assignments);
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
        storage.watch(path, async (logs) => {
            if (logs) {
                jobState.logs = this._restoreArrayFromFirebase(logs);
                await parseState();
            }
        });
    }

    /**
     * Job 상태 파싱 및 콜백 호출
     */
    static async _parseAndNotifyJobState(jobState, callbacks) {
        // console.log(`[PreviewFieldsProxy] 🔔 Notifying state:`, jobState);
        
        // Update 콜백 (진행 중)
        if (callbacks.onUpdate && jobState.progress < 100) {
            await callbacks.onUpdate({
                progress: jobState.progress,
                inference: jobState.inference
            });
        }
        
        // Complete 콜백 (완료 시)
        if (callbacks.onComplete && jobState.isCompleted) {
            // console.log(`[PreviewFieldsProxy] ✅ Calling onComplete callback`);
            await callbacks.onComplete({
                aggregateFieldAssignments: jobState.aggregateFieldAssignments,
                inference: jobState.inference,
                logs: jobState.logs,
                progress: jobState.progress,
                isFailed: jobState.isFailed
            });
        }
        
        // Failed 콜백 (실패 시)
        if (callbacks.onFailed && jobState.isFailed) {
            const errorMsg = jobState.error || 'Job failed';
            await callbacks.onFailed(errorMsg);
        }
    }

    /**
     * Firebase 배열 복원 (Firebase는 빈 배열을 ['@']로 저장)
     */
    static _restoreArrayFromFirebase(data) {
        if (!data) return [];
        if (Array.isArray(data)) {
            // ['@']를 []로 변환
            if (data.length === 1 && data[0] === '@') {
                return [];
            }
            return data;
        }
        if (typeof data === 'object') {
            return this._restoreDataFromFirebase(data);
        }
        return data;
    }

    /**
     * Firebase 객체 복원
     */
    static _restoreDataFromFirebase(data) {
        if (Array.isArray(data)) {
            return data.map(item => this._restoreDataFromFirebase(item));
        }
        if (typeof data === 'object' && data !== null) {
            const restored = {};
            for (const key in data) {
                restored[key] = this._restoreDataFromFirebase(data[key]);
            }
            return restored;
        }
        return data;
    }

    /**
     * Job 경로 생성
     */
    static _getJobPath(jobId) {
        return `db://${this.PATHS.JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    /**
     * RequestedJob 경로 생성
     */
    static _getRequestJobPath(jobId) {
        return `db://${this.PATHS.REQUESTED_JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    /**
     * Job ID 생성 (preview-fields-{timestamp}-{random})
     */
    static generateJobId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `preview-fields-${timestamp}-${random}`;
    }
}

module.exports = PreviewFieldsLangGraphProxy;

