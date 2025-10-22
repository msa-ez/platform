const StorageBase = require('../../../../../CommonStorageBase.vue').default;
const firebase = require('firebase');

class EsValueLangGraphStudioProxy {
    static get PATHS() {
        return {
            CONFIG: 'db://configs/eventstorming_generator',
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    static get NAMESPACE() {
        return (this.JOB_NAMESPACE_SUFFIX) ? `eventstorming_generator_${this.JOB_NAMESPACE_SUFFIX}` : "eventstorming_generator";
    }

    static get JOB_NAMESPACE_SUFFIX() {
        return localStorage.getItem('job_namespace_suffix') || '';
    }


    static async healthCheckUsingConfig() {
        if(this.JOB_NAMESPACE_SUFFIX) return true;

        try {
            const storage = new Vue(StorageBase);
            const config = await storage.getObject(this.PATHS.CONFIG);
            if(config.is_use_backend) return true;
        } catch (error) {
            console.error('서버 상태 확인 오류:', error);
            return false;
        }
    }

    static async makeNewJob(jobId, selectedDraftOptions, userInfo, information, preferedLanguage) {
        const storage = new Vue(StorageBase);

        await storage.setObject(this._getJobPath(jobId), {
            "state": {
                "inputs": {
                    "jobId": jobId,
                    "selectedDraftOptions": selectedDraftOptions,
                    "userInfo": userInfo,
                    "information": information,
                    "preferedLanguage": preferedLanguage
                }
            }
        });

        await storage.setObject(this._getRequestJobPath(jobId), {
            "createdAt": firebase.database.ServerValue.TIMESTAMP
        });

        return jobId;
    }

    static async removeJob(jobId) {
        const storage = new Vue(StorageBase);
        await storage.setObject(this._getJobStatePath(jobId), {
            "isRemoveRequested": true
        });
    }


    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        const jobState = this._initializeJobState(storage, jobId);
        const callbacks = { onUpdate, onComplete, onWaiting, onFailed };
        
        this._setupJobWatchers(storage, jobId, jobState, callbacks);
    }
    
    static _initializeJobState(storage, jobId) {
        let accumulatedOutputState = this._restoreDataFromFirebase(
            storage.getObject(`${this._getJobPath(jobId)}/state/outputs`)
        );
        
        if (!accumulatedOutputState.esValue) {
            accumulatedOutputState.esValue = {
                elements: {},
                relations: {}
            };
        }
        if (!accumulatedOutputState.logs) {
            accumulatedOutputState.logs = [];
        }

        return accumulatedOutputState;
    }

    static _setupJobWatchers(storage, jobId, jobState, callbacks) {
        const parseState = async () => await this._parseAndNotifyJobState(jobState, callbacks);
        
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting);
        
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        this._watchJobLogs(storage, jobId, jobState, parseState);
        
        this._watchEsValues(storage, jobId, jobState, parseState);
    }

    static _watchWaitingJobCount(storage, jobId, onWaiting) {
        storage.watch(`${this._getRequestJobPath(jobId)}/waitingJobCount`, async (waitingJobCount) => {
            if (waitingJobCount && waitingJobCount > 0) {
                await onWaiting(waitingJobCount);
            }
        });
    }

    static _watchJobStatus(storage, jobId, jobState, onFailed, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isFailed`, async (isFailed) => {
            if (!isFailed) return;
            
            jobState.isFailed = isFailed;
            await parseState();
            
            const errorLogs = jobState.logs.filter(log => log.level === "error");
            await onFailed(errorLogs.join("\n"));
        });

        // 완료 상태 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isCompleted`, async (isCompleted) => {
            if (!isCompleted) return;
            
            jobState.isCompleted = isCompleted;
            await parseState();
        });
    }

    static _watchJobProgress(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/totalProgressCount`, async (totalProgressCount) => {
            if (!totalProgressCount) return;
            
            jobState.totalProgressCount = totalProgressCount;
            await parseState();
        });

        storage.watch(`${this._getJobPath(jobId)}/state/outputs/currentProgressCount`, async (currentProgressCount) => {
            if (!currentProgressCount) return;
            
            jobState.currentProgressCount = currentProgressCount;
            await parseState();
        });
    }

    static _watchJobLogs(storage, jobId, jobState, parseState) {
        storage.watch_added(`${this._getJobPath(jobId)}/state/outputs/logs`, null, async (log) => {
            if (!log) return;
            
            jobState.logs.push(this._restoreDataFromFirebase(log));
            await parseState();
        });
    }

    static _watchEsValues(storage, jobId, jobState, parseState) {
        this._watchEsValueCollection(
            storage, 
            jobId, 
            'elements', 
            jobState.esValue.elements, 
            parseState
        );

        this._watchEsValueCollection(
            storage, 
            jobId, 
            'relations', 
            jobState.esValue.relations, 
            parseState
        );
    }

    static _watchEsValueCollection(storage, jobId, collectionName, targetCollection, parseState) {
        const basePath = `${this._getJobPath(jobId)}/state/outputs/esValue/${collectionName}`;
        
        storage.watch_changed(basePath, async (item, key) => {
            if (!item || !key) return;
            
            targetCollection[key] = this._restoreDataFromFirebase(item);
            await parseState();
        });

        storage.watch_added(basePath, null, async (item) => {
            if (!item || !item.id) return;
            
            targetCollection[item.id] = this._restoreDataFromFirebase(item);
            await parseState();
        });
    }

    static async _parseAndNotifyJobState(jobState, callbacks) {
        const state = this._parseJobState(jobState);
        this._addElementRefToState(state.esValue);
 
        if (state.isCompleted) {
            await callbacks.onComplete(state.esValue, state.logs, state.totalPercentage, state.isFailed);
        } else {
            await callbacks.onUpdate(state.esValue, state.logs, state.totalPercentage, state.isFailed);
        }
    }

    static _parseJobState(outputs) {
        const totalPercentage = outputs.totalProgressCount 
            ? Math.min(Math.round((outputs.currentProgressCount / outputs.totalProgressCount) * 100), 100)
            : 0;

        return {
            isCompleted: outputs.isCompleted,
            isFailed: outputs.isFailed,
            esValue: outputs.esValue,
            logs: outputs.logs,
            totalProgressCount: outputs.totalProgressCount,
            currentProgressCount: outputs.currentProgressCount,
            totalPercentage
        };
    }

    static _addElementRefToState(esValue) {
        if(!esValue || !esValue.elements || !esValue.relations) return;

        const relations = esValue.relations;
        const elements = esValue.elements;
        
        for(const relationKey of Object.keys(relations)) {
            const relation = relations[relationKey];
            if(!relation.from || !elements[relation.from] || !relation.to || !elements[relation.to]) {
                continue;
            }

            relation.sourceElement = elements[relation.from];
            relation.targetElement = elements[relation.to];
        }
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


    static _getJobPath(jobId) {
        return `db://${this.PATHS.JOBS}/${this.NAMESPACE}/${jobId}`;
    }

    static _getRequestJobPath(jobId) {
        return `db://${this.PATHS.REQUESTED_JOBS}/${this.NAMESPACE}/${jobId}`;
    }

    static _getJobStatePath(jobId) {
        return `db://${this.PATHS.JOB_STATES}/${this.NAMESPACE}/${jobId}`;
    }
}

module.exports = EsValueLangGraphStudioProxy