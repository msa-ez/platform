const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;
const firebase = require('firebase');

/**
 * DDL Extractor용 LangGraph Backend Proxy
 */
class DDLExtractorLangGraphProxy {
    static get JOB_TYPE() {
        return 'ddl_extractor';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    static async makeNewJob(jobId, ddlRequirements, boundedContextName) {
        const storage = new Vue(StorageBase);

        const inputs = {
            jobId: jobId,
            ddlRequirements: ddlRequirements,
            boundedContextName: boundedContextName
        };

        await storage.setObject(this._getJobPath(jobId), {
            state: { inputs }
        });

        await storage.setObject(this._getRequestJobPath(jobId), {
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });

        return jobId;
    }

    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        const callbacks = { onUpdate, onComplete, onWaiting, onFailed };
        const jobState = this._initializeJobState();
        this._setupJobWatchers(storage, jobId, jobState, callbacks);
    }

    static _initializeJobState() {
        return {
            inference: '',
            ddlFieldRefs: [],
            logs: [],
            progress: 0,
            isCompleted: false,
            isFailed: false,
            error: ''
        };
    }

    static _setupJobWatchers(storage, jobId, jobState, callbacks) {
        let callbackInvoked = false;

        const parseState = async () => {
            if (callbackInvoked) return;
            if (jobState.isCompleted) callbackInvoked = true;
            await this._parseAndNotifyJobState(jobState, callbacks);
        };

        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting);
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        this._watchJobProgress(storage, jobId, jobState, parseState);
        this._watchInference(storage, jobId, jobState, parseState);
        this._watchDDLFieldRefs(storage, jobId, jobState, parseState);
        this._watchJobLogs(storage, jobId, jobState, parseState);
    }

    static _watchWaitingJobCount(storage, jobId, onWaiting) {
        if (!onWaiting) return;
        storage.watch(`${this._getRequestJobPath(jobId)}/waitingJobCount`, async (count) => {
            if (count !== null && count !== undefined) {
                await onWaiting(count);
            }
        });
    }

    static _watchJobStatus(storage, jobId, jobState, onFailed, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isCompleted`, async (isCompleted) => {
            if (isCompleted === true) {
                jobState.isCompleted = true;
                await parseState();
            }
        });

        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isFailed`, async (isFailed) => {
            if (isFailed === true) {
                jobState.isFailed = true;
                const errorMsg = jobState.error || 'Job failed';
                if (onFailed) {
                    await onFailed(errorMsg);
                }
            }
        });
    }

    static _watchJobProgress(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/progress`, async (progress) => {
            if (progress !== null && progress !== undefined) {
                jobState.progress = progress;
                await parseState();
            }
        });
    }

    static _watchInference(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/inference`, async (inference) => {
            if (inference) {
                jobState.inference = inference;
                await parseState();
            }
        });
    }

    static _watchDDLFieldRefs(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/ddlFieldRefs`, async (ddlFieldRefs) => {
            if (ddlFieldRefs) {
                jobState.ddlFieldRefs = this._restoreArrayFromFirebase(ddlFieldRefs);
                await parseState();
            }
        });
    }

    static _watchJobLogs(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/logs`, async (logs) => {
            if (logs) {
                jobState.logs = logs;
                if (Array.isArray(logs) && logs.length > 0) {
                    const errorLog = logs.find(log => log.level === 'error');
                    if (errorLog) {
                        jobState.error = errorLog.message || 'Job failed';
                    }
                }
                await parseState();
            }
        });
    }

    static async _parseAndNotifyJobState(jobState, callbacks) {
        if (callbacks.onUpdate && jobState.progress < 100) {
            await callbacks.onUpdate({
                progress: jobState.progress,
                inference: jobState.inference
            });
        }

        if (callbacks.onComplete && jobState.isCompleted) {
            await callbacks.onComplete({
                ddlFieldRefs: jobState.ddlFieldRefs,
                inference: jobState.inference,
                logs: jobState.logs,
                progress: jobState.progress,
                isFailed: jobState.isFailed
            });
        }

        if (callbacks.onFailed && jobState.isFailed) {
            const errorMsg = jobState.error || 'Job failed';
            await callbacks.onFailed(errorMsg);
        }
    }

    static _restoreArrayFromFirebase(data) {
        if (!data) return [];
        if (Array.isArray(data)) {
            if (data.length === 1 && data[0] === '@') return [];
            return data.map(item => this._restoreDataFromFirebase(item));
        }
        return [];
    }

    static _restoreDataFromFirebase(data) {
        if (Array.isArray(data)) {
            if (data.length === 1 && data[0] === '@') return [];
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

    static _getJobPath(jobId) {
        return `db://${this.PATHS.JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    static _getRequestJobPath(jobId) {
        return `db://${this.PATHS.REQUESTED_JOBS}/${this.JOB_TYPE}/${jobId}`;
    }

    static generateJobId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return `ddl-extract-${timestamp}-${random}`;
    }
}

module.exports = DDLExtractorLangGraphProxy;

