const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

class StandardTransformerLangGraphProxy {
    static get JOB_TYPE() { return 'standard_transformer' }
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
        return `std-trans-${ts}-${rnd}`
    }

    static _getJobPath(jobId) { 
        return `db://${this.PATHS.JOBS}/${this.JOB_TYPE}/${jobId}` 
    }
    
    static _getRequestJobPath(jobId) { 
        return `db://${this.PATHS.REQUESTED_JOBS}/${this.JOB_TYPE}/${jobId}` 
    }

    static async makeNewJob(jobId, draftOptions, boundedContext, transformationSessionId = null, userId = null) {
        const storage = new Vue(StorageBase)
        const inputs = {
            jobId,
            draftOptions,
            boundedContext
        }
        
        // transformationSessionId가 있으면 추가
        if (transformationSessionId) {
            inputs.transformationSessionId = transformationSessionId
        }
        
        // userId가 있으면 추가
        if (userId) {
            inputs.userId = userId
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
            transformedOptions: [],
            transformationLog: '',
            progress: 0,
            isCompleted: false,
            isFailed: false,
            error: '',
            originalDraftOptions: null,  // 원본 옵션 저장 (검증용)
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
        let parseTimeout = null
        
        const parseState = async () => {
            if (callbackInvoked) return
            
            // 타이밍 이슈 해결: 모든 필드가 도착할 시간을 주기 위해 약간 지연
            if (parseTimeout) clearTimeout(parseTimeout)
            parseTimeout = setTimeout(async () => {
                if (callbackInvoked) return
                if (jobState.isCompleted) callbackInvoked = true
                await this._parseAndNotifyJobState(jobState, callbacks)
            }, 100) // 100ms 대기
        }

        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, jobState, callbacks.onWaiting)
        
        // 작업 상태 감시
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState)
        
        // 작업 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState)
        
        // TransformedOptions 감시
        this._watchTransformedOptions(storage, jobId, jobState, parseState)
        
        // TransformationLog 감시
        this._watchTransformationLog(storage, jobId, jobState, parseState)
    }

    static _watchTransformedOptions(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/transformedOptions`
        this._trackWatch(jobState, path)
        storage.watch(path, async (transformedOptions) => {
            if (transformedOptions) {
                // 🔒 CRITICAL: Firebase에서 ["@"] 마커를 빈 배열로 복원
                jobState.transformedOptions = this._restoreDataFromFirebase(transformedOptions)
                await parseState()
            }
        })
    }

    static _watchTransformationLog(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/transformationLog`
        this._trackWatch(jobState, path)
        storage.watch(path, async (log) => {
            if (log) {
                jobState.transformationLog = log
                await parseState()
            }
        })
    }

    static _watchJobProgress(storage, jobId, jobState, parseState) {
        const path = `${this._getJobPath(jobId)}/state/outputs/progress`
        this._trackWatch(jobState, path)
        storage.watch(path, async (progress) => {
            if (progress !== undefined && progress !== null) {
                jobState.progress = progress
                await parseState()
            }
        })
    }

    static _watchJobStatus(storage, jobId, jobState, onFailed, parseState) {
        const completedPath = `${this._getJobPath(jobId)}/state/outputs/isCompleted`
        this._trackWatch(jobState, completedPath)
        storage.watch(completedPath, async (isCompleted) => {
            if (isCompleted !== undefined && isCompleted !== null) {
                jobState.isCompleted = isCompleted
                await parseState()
                if (isCompleted === true) {
                    this._cleanupWatchers(storage, jobState)
                }
            }
        })

        const errorPath = `${this._getJobPath(jobId)}/state/outputs/error`
        this._trackWatch(jobState, errorPath)
        storage.watch(errorPath, async (error) => {
            // Firebase에서 None이 "@"로 변환되므로, "@"는 무시
            if (error && error !== "@") {
                jobState.isFailed = true
                jobState.error = error
                if (onFailed) {
                    onFailed(error)
                }
                this._cleanupWatchers(storage, jobState)
            }
        })
    }

    static _watchWaitingJobCount(storage, jobId, jobState, onWaiting) {
        if (!onWaiting) return
        
        const requestedJobsPath = `db://${this.PATHS.REQUESTED_JOBS}/${this.JOB_TYPE}`
        this._trackWatch(jobState, requestedJobsPath)
        storage.watch(requestedJobsPath, async (requestedJobs) => {
            if (requestedJobs) {
                const jobIds = Object.keys(requestedJobs)
                const currentJobIndex = jobIds.indexOf(jobId)
                if (currentJobIndex > 0) {
                    onWaiting(currentJobIndex)
                }
            }
        })
    }

    static async _parseAndNotifyJobState(jobState, callbacks) {
        if (jobState.isFailed) {
            return
        }

        // 진행 중 업데이트
        if (callbacks.onUpdate && !jobState.isCompleted) {
            callbacks.onUpdate({
                progress: jobState.progress,
                transformationLog: jobState.transformationLog,
                // 백엔드에서 보내는 상세 정보 전달
                currentBC: jobState.currentBC,
                currentAgg: jobState.currentAgg,
                currentPropertyType: jobState.currentPropertyType,
                chunkInfo: jobState.chunkInfo,
                status: jobState.status,
                error: jobState.error
            })
        }

        // 완료 처리 - 안정적으로 변환된 경우에만 UI에 반영
        if (jobState.isCompleted && callbacks.onComplete) {
            // 변환 결과 검증
            const isValid = this._validateTransformationResult(jobState)
            
            if (isValid) {
                // 안정적으로 변환된 경우에만 onComplete 호출
                callbacks.onComplete({
                    transformedOptions: jobState.transformedOptions,
                    transformationLog: jobState.transformationLog,
                    isCompleted: jobState.isCompleted
                })
            }
            // 변환이 안정적이지 않은 경우 onComplete를 호출하지 않음 - 기존 초안 결과 유지
        }
    }

    /**
     * 변환 결과가 안정적인지 검증
     * @param {Object} jobState - 작업 상태
     * @returns {boolean} - 안정적이면 true, 아니면 false
     */
    static _validateTransformationResult(jobState) {
        // 1. 에러가 없어야 함
        if (jobState.error && jobState.error !== "@") {
            return false
        }

        // 2. transformedOptions가 배열이고 비어있지 않아야 함
        if (!Array.isArray(jobState.transformedOptions) || jobState.transformedOptions.length === 0) {
            return false
        }

        // 3. isCompleted가 true여야 함
        if (!jobState.isCompleted) {
            return false
        }

        return true
    }

    /**
     * Firebase에서 가져온 데이터를 원본 형태로 복원
     * @param {*} data Firebase에서 가져온 데이터
     * @returns {*} 복원된 데이터
     */
    static _restoreDataFromFirebase(data) {
        if (!data) return data;
        
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
        } else if (Array.isArray(data)) {
            return data.map(item => processValue(item));
        } else {
            return data;
        }
    }
}

module.exports = StandardTransformerLangGraphProxy;

