const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

class TraceabilityLangGraphProxy {
    static get JOB_TYPE() { return 'traceability_generator' }
    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        }
    }

    static generateJobId() {
        const ts = Date.now()
        const rnd = Math.random().toString(36).substring(2, 10)
        return `trace-add-${ts}-${rnd}`
    }

    static _getJobPath(jobId) { 
        return `db://${this.PATHS.JOBS}/${this.JOB_TYPE}/${jobId}` 
    }
    
    static _getRequestJobPath(jobId) { 
        return `db://${this.PATHS.REQUESTED_JOBS}/${this.JOB_TYPE}/${jobId}` 
    }

    static async makeNewJob(jobId, generatedDraftOptions, boundedContextName, description, functionalRequirements, traceMap) {
        const storage = new Vue(StorageBase)
        const inputs = {
            jobId,
            generatedDraftOptions,
            boundedContextName,
            description,
            functionalRequirements,
            traceMap
        }

        await storage.setObject(this._getJobPath(jobId), {
            state: { inputs }
        })

        await storage.setObject(this._getRequestJobPath(jobId), {
            createdAt: storage.getServerTimestamp()
        })

        return jobId
    }

    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase)
        const callbacks = { onUpdate, onComplete, onWaiting, onFailed }
        const jobState = this._initializeJobState()
        this._setupJobWatchers(storage, jobId, jobState, callbacks)
    }

    static _initializeJobState() {
        return {
            inference: '',
            draftTraceMap: { aggregates: [], enumerations: [], valueObjects: [] },
            logs: [],
            progress: 0,
            isCompleted: false,
            isFailed: false,
            error: '',
            // watcher 누수 방지 — 완료/실패 시 일괄 watch_off.
            _watchedPaths: new Set(),
            _watchersCleaned: false
        }
    }

    static _trackWatch(jobState, path) {
        if (jobState && jobState._watchedPaths) {
            jobState._watchedPaths.add(path)
        }
    }

    static _cleanupWatchers(storage, jobState) {
        if (!jobState || !jobState._watchedPaths || jobState._watchersCleaned) return
        jobState._watchersCleaned = true
        for (const path of jobState._watchedPaths) {
            try { storage.watch_off(path) } catch (e) { /* noop */ }
        }
        jobState._watchedPaths.clear()
    }

    static _setupJobWatchers(storage, jobId, jobState, callbacks) {
        let callbackInvoked = false

        const parseState = async () => {
            if (callbackInvoked) return
            if (jobState.isCompleted) callbackInvoked = true
            await this._parseAndNotifyJobState(jobState, callbacks)
            if (jobState.isCompleted || jobState.isFailed) {
                this._cleanupWatchers(storage, jobState)
            }
        }

        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting, jobState)

        // 작업 상태 감시
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState)

        // 작업 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState)

        // Inference 감시
        this._watchInference(storage, jobId, jobState, parseState)

        // DraftTraceMap 감시
        this._watchDraftTraceMap(storage, jobId, jobState, parseState)

        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState)
    }

    static _watchInference(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/inference`
        this._trackWatch(jobState, path)
        storage.watch(path, async (inference) => {
            if (inference) {
                jobState.inference = inference
                await parseState()
            }
        })
    }

    static _watchWaitingJobCount(storage, jobId, onWaiting, jobState) {
        if (!onWaiting) return
        const path = `${this._getRequestJobPath(jobId)}/waitingJobCount`
        this._trackWatch(jobState, path)
        storage.watch(path, async (count) => {
            if (count !== null && count !== undefined) {
                await onWaiting(count)
            }
        })
    }

    static _watchJobStatus(storage, jobId, jobState, onFailed, parseState) {
        const completedPath = `${this._getJobPath(jobId)}/state/outputs/isCompleted`
        this._trackWatch(jobState, completedPath)
        storage.watch(completedPath, async (isCompleted) => {
            if (isCompleted === true) {
                jobState.isCompleted = true
                await parseState()
            }
        })

        const failedPath = `${this._getJobPath(jobId)}/state/outputs/isFailed`
        this._trackWatch(jobState, failedPath)
        storage.watch(failedPath, async (isFailed) => {
            if (isFailed === true) {
                jobState.isFailed = true
                const errorMsg = jobState.error || 'Job failed'
                if (onFailed) {
                    await onFailed(errorMsg)
                }
                this._cleanupWatchers(storage, jobState)
            }
        })
    }

    static _watchJobProgress(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/progress`
        this._trackWatch(jobState, path)
        storage.watch(path, async (progress) => {
            if (progress !== null && progress !== undefined) {
                jobState.progress = progress
                await parseState()
            }
        })
    }

    static _watchDraftTraceMap(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/draftTraceMap`
        this._trackWatch(jobState, path)
        storage.watch(path, async (draftTraceMap) => {
            if (draftTraceMap) {
                jobState.draftTraceMap = draftTraceMap
                await parseState()
            }
        })
    }

    static _watchJobLogs(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/logs`
        this._trackWatch(jobState, path)
        storage.watch(path, async (logs) => {
            if (logs) {
                jobState.logs = logs
                // 에러 로그가 있으면 error 메시지 추출
                if (Array.isArray(logs) && logs.length > 0) {
                    const errorLog = logs.find(log => log.level === 'error')
                    if (errorLog) {
                        jobState.error = errorLog.message || 'Job failed'
                    }
                }
                await parseState()
            }
        })
    }

    static async _parseAndNotifyJobState(jobState, callbacks) {
        // Update 콜백 (진행 중)
        if (callbacks.onUpdate && jobState.progress < 100) {
            await callbacks.onUpdate({
                progress: jobState.progress,
                inference: jobState.inference
            })
        }

        // Complete 콜백 (완료 시)
        if (callbacks.onComplete && jobState.isCompleted) {
            await callbacks.onComplete({
                draftTraceMap: jobState.draftTraceMap,
                inference: jobState.inference,
                logs: jobState.logs,
                progress: jobState.progress,
                isFailed: jobState.isFailed
            })
        }

        // Failed 콜백 (실패 시)
        if (callbacks.onFailed && jobState.isFailed) {
            const errorMsg = jobState.error || 'Job failed'
            await callbacks.onFailed(errorMsg)
        }
    }
}

module.exports = TraceabilityLangGraphProxy;
