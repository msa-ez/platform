const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;
const firebase = require('firebase');

/**
 * Requirements Validator용 LangGraph Backend Proxy
 */
class RequirementsValidatorLangGraphProxy {
    static get JOB_TYPE() {
        return 'requirements_validator';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    static async makeNewJob(jobId, requirements, previousChunkSummary, currentChunkStartLine) {
        const storage = new Vue(StorageBase);

        const inputs = {
            jobId: jobId,
            requirements: {
                userStory: requirements
            },
            previousChunkSummary: previousChunkSummary || null,
            currentChunkStartLine: currentChunkStartLine || 1
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
            type: '',
            content: {},
            logs: [],
            progress: 0,
            currentGeneratedLength: 0,
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
        this._watchCurrentGeneratedLength(storage, jobId, jobState, parseState);
        this._watchJobType(storage, jobId, jobState, parseState);
        this._watchJobContent(storage, jobId, jobState, parseState);
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

    static _watchCurrentGeneratedLength(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/currentGeneratedLength`, async (length) => {
            if (length !== null && length !== undefined) {
                jobState.currentGeneratedLength = length;
                await parseState();
            }
        });
    }

    static _watchJobType(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/type`, async (type) => {
            if (type) {
                jobState.type = type;
                await parseState();
            }
        });
    }

    static _watchJobContent(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/content`, async (content) => {
            if (content) {
                jobState.content = this._restoreDataFromFirebase(content);
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
                type: jobState.type,
                content: jobState.content,
                currentGeneratedLength: jobState.currentGeneratedLength || 0
            });
        }

        if (callbacks.onComplete && jobState.isCompleted) {
            await callbacks.onComplete({
                type: jobState.type,
                content: jobState.content,
                logs: jobState.logs,
                progress: jobState.progress,
                currentGeneratedLength: jobState.currentGeneratedLength || 0,
                isFailed: jobState.isFailed
            });
        }

        if (callbacks.onFailed && jobState.isFailed) {
            const errorMsg = jobState.error || 'Job failed';
            await callbacks.onFailed(errorMsg);
        }
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
        return `req-valid-${timestamp}-${random}`;
    }
}

module.exports = RequirementsValidatorLangGraphProxy;

