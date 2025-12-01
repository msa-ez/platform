const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../CommonStorageBase.vue').default;
const firebase = require('firebase');
const LoggingUtil = require('../utils/LoggingUtil');
const logger = LoggingUtil.makeFromNamespace("LangGraphProxyBase");

class LangGraphProxyBase {
    static get ROOT_PATH_JOBS() {return 'jobs';}
    static get ROOT_PATH_REQUESTED_JOBS() {return 'requestedJobs';}
    static get ROOT_PATH_JOB_STATES() {return 'jobStates';}
    static get DEFAULT_NAMESPACE() {return '';}

    static get IS_BLOCK_JOB_REMOVING() {
        if(localStorage.getItem('is_block_job_removing') === 'true') return true;
        return false;
    }

    static get JOB_NAMESPACE_SUFFIX() {
        return localStorage.getItem('job_namespace_suffix') || '';
    }

    static get NAMESPACE() {
        return (this.JOB_NAMESPACE_SUFFIX) ? `${this.DEFAULT_NAMESPACE}_${this.JOB_NAMESPACE_SUFFIX}` : this.DEFAULT_NAMESPACE;
    }

    static get STORAGE() {
        return new Vue(StorageBase);
    }


    static _getJobPath(jobId) {
        return `db://${this.ROOT_PATH_JOBS}/${this.NAMESPACE}/${jobId}`;
    }

    static _getRequestJobPath(jobId) {
        return `db://${this.ROOT_PATH_REQUESTED_JOBS}/${this.NAMESPACE}/${jobId}`;
    }

    static _getJobStatePath(jobId) {
        return `db://${this.ROOT_PATH_JOB_STATES}/${this.NAMESPACE}/${jobId}`;
    }


    static async makeNewJob(inputObj) {
        const jobId = this._makeNewJobId();

        const jobState = {
            "state": {
                "inputs": {
                    jobId: jobId,
                    ...inputObj
                }
            }
        }
        logger.debug("업로드시킬 Job 데이터가 완전히 구축됨", jobState)
        await this.STORAGE.setObject(this._getJobPath(jobId), jobState);

        await this.STORAGE.setObject(this._getRequestJobPath(jobId), {
            "createdAt": firebase.database.ServerValue.TIMESTAMP
        });

        return jobId;
    }
    
    static _makeNewJobId() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }


    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const jobState = this._initializeJobState(jobId);
        const callbacks = { onUpdate, onComplete, onWaiting, onFailed };
        
        this._setupJobWatchers(jobId, jobState, callbacks);
    }

    static _initializeJobState(jobId) {
        let accumulatedOutputState = this._restoreDataFromFirebase(
            this.STORAGE.getObject(`${this._getJobPath(jobId)}/state/outputs`)
        );
        return this._onInitializeJobState(accumulatedOutputState);
    }
    static _onInitializeJobState(accumulatedOutputState) {
        return accumulatedOutputState;
    }

    static _setupJobWatchers(jobId, jobState, callbacks) {
        const notifyJobState = async () => await this._notifyJobState(jobState, callbacks);

        this._watchWaitingJobCount(jobId, callbacks.onWaiting);
        this._watchJobStatus(jobId, jobState, callbacks.onFailed, notifyJobState);
        this._watchJobProgress(jobId, jobState, notifyJobState);
        this._watchJobLogs(jobId, jobState, notifyJobState);

        this._onSetupJobWatchers(jobId, jobState, notifyJobState);
    }
    static _onSetupJobWatchers(jobId, jobState, notifyJobState) {
    }

    static async _notifyJobState(jobState, callbacks) {
        const total_percentage = jobState.totalProgressCount 
        ? Math.min(Math.round((jobState.currentProgressCount / jobState.totalProgressCount) * 100), 100)
        : 0;
        let notifyState = {
            isCompleted: jobState.isCompleted,
            isFailed: jobState.isFailed,
            logs: jobState.logs.filter(log => log.value !== null),
            totalProgressCount: jobState.totalProgressCount,
            currentProgressCount: jobState.currentProgressCount,
            totalPercentage: total_percentage,
            outputs: {}
        }
        notifyState = this._onNotifyJobState(notifyState, jobState);
 
        if (notifyState.isCompleted) {
            await callbacks.onComplete(
                notifyState.outputs, notifyState.logs, notifyState.totalPercentage, notifyState.isFailed
            );
        } else {
            await callbacks.onUpdate(
                notifyState.outputs, notifyState.logs, notifyState.totalPercentage, notifyState.isFailed
            );
        }
    }
    static _onNotifyJobState(notifyState, jobState) {
        return notifyState;
    }

    static _watchWaitingJobCount(jobId, onWaiting) {
        this.STORAGE.watch(`${this._getRequestJobPath(jobId)}/waitingJobCount`, async (waitingJobCount) => {
            if (waitingJobCount && waitingJobCount > 0) {
                await onWaiting(waitingJobCount);
            }
        });
    }

    static _watchJobStatus(jobId, jobState, onFailed, notifyJobState) {
        this.STORAGE.watch(`${this._getJobPath(jobId)}/state/outputs/isFailed`, async (isFailed) => {
            if (!isFailed) return;
            
            jobState.isFailed = isFailed;
            await notifyJobState();
            
            const errorLogs = jobState.logs.filter(log => log.level === "error");
            logger.error("Job 실패 후, 에러 로그가 발생함", errorLogs)

            await onFailed(errorLogs.join("\n"));
        });

        this.STORAGE.watch(`${this._getJobPath(jobId)}/state/outputs/isCompleted`, async (isCompleted) => {
            if (!isCompleted) return;
            
            jobState.isCompleted = isCompleted;

            logger.debug("Job 완료 후, 출력 상태가 완전히 구축됨", jobState)
            await notifyJobState();
        });
    }

    static _watchJobProgress(jobId, jobState, notifyJobState) {
        this.STORAGE.watch(`${this._getJobPath(jobId)}/state/outputs/totalProgressCount`, async (totalProgressCount) => {
            if (!totalProgressCount) return;
            
            jobState.totalProgressCount = totalProgressCount;
            await notifyJobState();
        });

        this.STORAGE.watch(`${this._getJobPath(jobId)}/state/outputs/currentProgressCount`, async (currentProgressCount) => {
            if (!currentProgressCount) return;
            
            jobState.currentProgressCount = currentProgressCount;
            await notifyJobState();
        });
    }

    static _watchJobLogs(jobId, jobState, notifyJobState) {
        this.STORAGE.watch_added(`${this._getJobPath(jobId)}/state/outputs/logs`, null, async (log) => {
            if (!log) return;
            
            jobState.logs.push(this._restoreDataFromFirebase(log));
            await notifyJobState();
        });
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
            const result = {};
            for (const [k, v] of Object.entries(data)) {
                result[k] = processValue(v);
            }
            return result;
        }
        return data;
    }


    static async removeJob(jobId) {
        if(this.IS_BLOCK_JOB_REMOVING) return;

        await this.STORAGE.setObject(this._getJobStatePath(jobId), {
            "isRemoveRequested": true
        });
    }
}

module.exports = LangGraphProxyBase;