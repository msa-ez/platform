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
            error: '',
            // 이 job 에서 등록한 모든 watch path. 완료/실패 시 일괄 watch_off — 누수 방지.
            _watchedPaths: new Set(),
            _watchersCleaned: false,
            _pollTimer: null,
            _pollInFlight: false,
            _pollAttempts: 0
        };

        return accumulatedOutputState;
    }

    /**
     * watch 등록 직전 path 를 추적 Set 에 넣어 _cleanupWatchers 가 일괄 해제 가능하게.
     */
    static _trackWatch(jobState, path) {
        if (jobState && jobState._watchedPaths) {
            jobState._watchedPaths.add(path);
        }
    }

    /**
     * job 종료(완료/실패) 시 등록된 모든 watch listener 해제.
     * 미정리 시 같은 path 에 listener 가 누적 → acebase reconnect 후 callback 폭주 → ws 부하 → ping timeout.
     */
    static _cleanupWatchers(storage, jobState) {
        if (!jobState || !jobState._watchedPaths || jobState._watchersCleaned) return;
        jobState._watchersCleaned = true;
        if (jobState._pollTimer) {
            clearInterval(jobState._pollTimer);
            jobState._pollTimer = null;
        }
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
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting, jobState);

        // 작업 상태 감시 (완료/실패)
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        // 작업 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        // Inference 감시
        this._watchInference(storage, jobId, jobState, parseState);

        // options 는 완료 시에만 로드 (large-tree value watch 회피 — AceBase #49)
        
        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);

        // websocket ping timeout으로 value 이벤트를 놓쳐도 완료를 놓치지 않도록 폴링 복구 경로를 둔다.
        this._startCompletionPolling(storage, jobId, jobState, parseState);
    }

    static _startCompletionPolling(storage, jobId, jobState, parseState) {
        const outputsPath = `${this._getJobPath(jobId)}/state/outputs`;
        const pollCompletion = async () => {
            if (!jobState || jobState._watchersCleaned || jobState.isFailed || jobState._pollInFlight) return;
            jobState._pollInFlight = true;
            try {
                if (!jobState.isCompleted) {
                    const isCompleted = await storage.getObjectWithRetry(`${outputsPath}/isCompleted`);
                    if (!isCompleted) return;
                    jobState.isCompleted = true;
                }

                jobState._pollAttempts += 1;
                const [boundedContext, inference, defaultOptionIndex, conclusions, optionsChunked, optionsChunkCount] = await Promise.all([
                    storage.getObjectWithRetry(`${outputsPath}/boundedContext`),
                    this._getPrimitiveWithRetry(storage, `${outputsPath}/inference`),
                    storage.getObjectWithRetry(`${outputsPath}/defaultOptionIndex`),
                    this._getPrimitiveWithRetry(storage, `${outputsPath}/conclusions`),
                    storage.getObjectWithRetry(`${outputsPath}/optionsChunked`),
                    storage.getObjectWithRetry(`${outputsPath}/optionsChunkCount`)
                ]);

                if (!jobState.boundedContext && boundedContext) jobState.boundedContext = boundedContext;
                if (inference) jobState.inference = inference;
                if (defaultOptionIndex !== null && defaultOptionIndex !== undefined) {
                    jobState.defaultOptionIndex = defaultOptionIndex;
                }
                if (conclusions) jobState.conclusions = conclusions;

                const loaded = await this._loadJobOptions(storage, jobId, {
                    optionsChunked,
                    optionsChunkCount
                });

                // chunks 가 다 모였으면 (정당한 empty 포함) 완료 처리.
                if (loaded.ready) {
                    jobState.options = Array.isArray(loaded.options) ? loaded.options : [];
                    await parseState();
                    this._cleanupWatchers(storage, jobState);
                    return;
                }

                if (jobState._pollAttempts >= 30) {
                    console.warn('[AggregateDraftLangGraphProxy] completion polling exhausted with unready options:', { jobId, optionsChunkCount });
                    jobState.options = Array.isArray(loaded.options) ? loaded.options : [];
                    await parseState();
                    this._cleanupWatchers(storage, jobState);
                }
            } catch (e) {
                // 폴링 복구 경로는 실패해도 다음 주기에 재시도
            } finally {
                jobState._pollInFlight = false;
            }
        };

        jobState._pollTimer = setInterval(() => {
            pollCompletion();
        }, 1500);

        setTimeout(() => {
            pollCompletion();
        }, 500);
    }

    static async _getPrimitiveWithRetry(storage, path, maxRetries = 10) {
        let delay = 200;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const value = await storage.getString(path);
                if (value !== undefined && value !== null) {
                    return value;
                }
            } catch (e) {
                // noop: retry
            }
            if (attempt < maxRetries - 1) {
                await new Promise(r => setTimeout(r, delay));
                delay = Math.min(2000, Math.round(delay * 1.5));
            }
        }
        return undefined;
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

        // BoundedContext 감시
        const bcPath = `${this._getJobPath(jobId)}/state/outputs/boundedContext`;
        this._trackWatch(jobState, bcPath);
        storage.watch(bcPath, async (boundedContext) => {
            if (boundedContext !== null && boundedContext !== undefined) {
                jobState.boundedContext = boundedContext;
            }
        });

        // 완료 상태 감시 (중복 호출 방지)
        let completedCalled = false;
        const completedPath = `${this._getJobPath(jobId)}/state/outputs/isCompleted`;
        this._trackWatch(jobState, completedPath);
        storage.watch(completedPath, async (isCompleted) => {
            if (isCompleted && !completedCalled) {
                jobState.isCompleted = isCompleted;

                const outputsPath = `${this._getJobPath(jobId)}/state/outputs`;
                const [
                    boundedContext,
                    inference,
                    defaultOptionIndex,
                    conclusions,
                    optionsChunked,
                    optionsChunkCount
                ] = await Promise.all([
                    storage.getObjectWithRetry(`${outputsPath}/boundedContext`),
                    this._getPrimitiveWithRetry(storage, `${outputsPath}/inference`),
                    storage.getObjectWithRetry(`${outputsPath}/defaultOptionIndex`),
                    this._getPrimitiveWithRetry(storage, `${outputsPath}/conclusions`),
                    storage.getObjectWithRetry(`${outputsPath}/optionsChunked`),
                    storage.getObjectWithRetry(`${outputsPath}/optionsChunkCount`)
                ]);

                if (!jobState.boundedContext && boundedContext) {
                    jobState.boundedContext = boundedContext;
                }
                if (inference) {
                    jobState.inference = inference;
                }
                if (defaultOptionIndex !== null && defaultOptionIndex !== undefined) {
                    jobState.defaultOptionIndex = defaultOptionIndex;
                }
                if (conclusions) {
                    jobState.conclusions = conclusions;
                }
                const loaded = await this._loadJobOptions(storage, jobId, {
                    optionsChunked,
                    optionsChunkCount
                });
                jobState.options = loaded.options;

                // chunks 가 아직 다 안 보이면 onComplete 보류 — 폴링 fallback 에 위임.
                // 여기서 cleanup 하면 폴링 타이머까지 죽어 빈 옵션이 영구화된다.
                if (!loaded.ready) {
                    console.warn('[AggregateDraftLangGraphProxy] completion watcher fired but chunks not yet visible; deferring to polling:', { jobId, optionsChunkCount });
                    return;
                }

                completedCalled = true;
                await parseState();

                // 완료 후 등록된 모든 watch listener 해제 (logs/options/inference/error/progress 등 누수 방지)
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
     * 완료 시 options 로드 — chunked 이면 optionsChunks 만, 아니면 options 경로만 읽음.
     * 반환: {options: Array, ready: boolean}
     *   - ready=true 면 더 이상 기다릴 필요 없음 (성공이든 정당한 empty 든 결과 확정)
     *   - ready=false 면 chunks 가 아직 안 보임 → 호출자가 폴링/재시도로 이어받아야 함
     */
    static async _loadJobOptions(storage, jobId, outputMeta) {
        const outputsPath = `${this._getJobPath(jobId)}/state/outputs`;
        const meta = outputMeta || {};

        if (meta.optionsChunked) {
            const chunkCount = meta.optionsChunkCount;
            // ping timeout/reconnect 상황에서는 chunk 조회가 늦게 동기화될 수 있어 재시도를 충분히 둔다.
            for (let attempt = 0; attempt < 12; attempt++) {
                const optionsChunks = await storage.getObjectWithRetry(`${outputsPath}/optionsChunks`);
                const restored = this._restoreChunkedOptions(optionsChunks, chunkCount);
                if (restored.ready) {
                    return restored;
                }
                if (attempt < 11) {
                    const waitMs = Math.min(3000, 300 * (attempt + 1));
                    await new Promise(r => setTimeout(r, waitMs));
                }
            }
            console.warn('[AggregateDraftLangGraphProxy] optionsChunks restore exhausted retries:', {
                jobId,
                chunkCount
            });
            return { options: [], ready: false };
        }

        const options = await storage.getObjectWithRetry(`${outputsPath}/options`);
        return { options: this._restoreArrayFromFirebase(options), ready: true };
    }

    /**
     * chunks 를 합쳐서 options 배열 복원.
     * 반환: {options, ready}
     *   - ready=false: chunkKeys 가 expectedCount 보다 적음 → 아직 다 도착 안 함, 재시도 필요
     *   - ready=true: chunks 가 다 모였고 파싱 성공 (혹은 빈 결과여도 정당한 종결)
     */
    static _restoreChunkedOptions(optionsChunks, expectedCount) {
        try {
            if (!optionsChunks || typeof optionsChunks !== 'object') {
                return { options: [], ready: false };
            }
            const chunkKeys = Object.keys(optionsChunks)
                .filter(k => /^\d+$/.test(String(k)))
                .sort((a, b) => Number(a) - Number(b));
            if (expectedCount && chunkKeys.length < expectedCount) {
                return { options: [], ready: false };
            }

            const jsonText = chunkKeys.map(k => {
                const chunkNode = optionsChunks[k];
                if (chunkNode && typeof chunkNode === 'object' && chunkNode.data !== undefined) {
                    return String(chunkNode.data);
                }
                return String(chunkNode || '');
            }).join('');

            if (!jsonText) return { options: [], ready: true };
            const parsed = JSON.parse(jsonText);
            if (Array.isArray(parsed)) {
                return {
                    options: parsed.map(item => this._restoreDataFromFirebase(item)),
                    ready: true
                };
            }
            return { options: [], ready: true };
        } catch (e) {
            console.warn('[AggregateDraftLangGraphProxy] Failed to restore chunked options:', e);
            return { options: [], ready: false };
        }
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

