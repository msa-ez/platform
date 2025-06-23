const StorageBase = require('../../../../../CommonStorageBase.vue').default;
const firebase = require('firebase');

class EsValueLangGraphStudioProxy {
    // 상수 정의
    static get PATHS() {
        return {
            CONFIG: 'db://configs/eventstorming_generator',
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    static get NAMESPACES() {
        return {
            DEFAULT: 'eventstorming_generator',
            LOCAL: 'eventstorming_generator_local'
        };
    }

    static get STORAGE_KEYS() {
        return {
            LOCAL_GENERATOR: 'is_local_eventstorming_generator',
            IS_PASS_HEALTH_CHECK: 'is_pass_health_check'
        };
    }


    static async healthCheckUsingConfig() {
        if(localStorage.getItem(this.STORAGE_KEYS.LOCAL_GENERATOR) === 'true') return true;
        if(localStorage.getItem(this.STORAGE_KEYS.IS_PASS_HEALTH_CHECK) === 'true') return true;

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

    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        const jobState = this._initializeJobState(storage, jobId);
        const callbacks = { onUpdate, onComplete, onWaiting, onFailed };
        
        this._setupJobWatchers(storage, jobId, jobState, callbacks);
    }

    static async removeJob(jobId) {
        const storage = new Vue(StorageBase);
        await storage.setObject(this._getJobStatePath(jobId), {
            "isRemoveRequested": true
        });
    }
    
    // 작업 상태 초기화
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

    // 모든 워처 설정
    static _setupJobWatchers(storage, jobId, jobState, callbacks) {
        const parseState = async () => await this._parseAndNotifyJobState(jobState, callbacks);
        
        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting);
        
        // 작업 상태 감시
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        // 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);
        
        // ES 값 감시 (elements, relations)
        this._watchEsValues(storage, jobId, jobState, parseState);
    }

    // 대기 중인 작업 수 감시
    static _watchWaitingJobCount(storage, jobId, onWaiting) {
        storage.watch(`${this._getRequestJobPath(jobId)}/waitingJobCount`, async (waitingJobCount) => {
            if (waitingJobCount && waitingJobCount > 0) {
                await onWaiting(waitingJobCount);
            }
        });
    }

    // 작업 상태 감시 (완료/실패)
    static _watchJobStatus(storage, jobId, jobState, onFailed, parseState) {
        // 실패 상태 감시
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

    // 작업 진행률 감시
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

    // 로그 감시
    static _watchJobLogs(storage, jobId, jobState, parseState) {
        storage.watch_added(`${this._getJobPath(jobId)}/state/outputs/logs`, null, async (log) => {
            if (!log) return;
            
            jobState.logs.push(this._restoreDataFromFirebase(log));
            await parseState();
        });
    }

    // ES 값 감시 (elements, relations)
    static _watchEsValues(storage, jobId, jobState, parseState) {
        // Elements 감시
        this._watchEsValueCollection(
            storage, 
            jobId, 
            'elements', 
            jobState.esValue.elements, 
            parseState
        );

        // Relations 감시
        this._watchEsValueCollection(
            storage, 
            jobId, 
            'relations', 
            jobState.esValue.relations, 
            parseState
        );
    }

    // ES 값 컬렉션 감시 (공통 로직)
    static _watchEsValueCollection(storage, jobId, collectionName, targetCollection, parseState) {
        const basePath = `${this._getJobPath(jobId)}/state/outputs/esValue/${collectionName}`;
        
        // 변경 감시
        storage.watch_changed(basePath, async (item, key) => {
            if (!item || !key) return;
            
            targetCollection[key] = this._restoreDataFromFirebase(item);
            await parseState();
        });

        // 추가 감시
        storage.watch_added(basePath, null, async (item) => {
            if (!item || !item.id) return;
            
            targetCollection[item.id] = this._restoreDataFromFirebase(item);
            await parseState();
        });
    }

    // 작업 상태 파싱 및 콜백 호출
    static async _parseAndNotifyJobState(jobState, callbacks) {
        const state = this._parseJobState(jobState);
        this._addElementRefToState(state.esValue);
 
        if (state.isCompleted) {
            await callbacks.onComplete(state.esValue, state.logs, state.totalPercentage, state.isFailed);
        } else {
            await callbacks.onUpdate(state.esValue, state.logs, state.totalPercentage, state.isFailed);
        }
    }

    static _addElementRefToState(esValue) {
        if(!esValue || !esValue.elements || !esValue.relations) return;

        const relations = esValue.relations;
        const elements = esValue.elements;

        for(const relation of Object.values(relations)) {
            if(relation.from && elements[relation.from]) {
                relation.sourceElement = elements[relation.from];
            }
            if(relation.to && elements[relation.to]) {
                relation.targetElement = elements[relation.to];
            }
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


    static _getJobPath(jobId) {
        return `db://${this.PATHS.JOBS}/${this._getNamespace()}/${jobId}`;
    }

    static _getRequestJobPath(jobId) {
        return `db://${this.PATHS.REQUESTED_JOBS}/${this._getNamespace()}/${jobId}`;
    }

    static _getJobStatePath(jobId) {
        return `db://${this.PATHS.JOB_STATES}/${this._getNamespace()}/${jobId}`;
    }

    static _getNamespace() {
        return localStorage.getItem(this.STORAGE_KEYS.LOCAL_GENERATOR) === 'true' 
            ? this.NAMESPACES.LOCAL 
            : this.NAMESPACES.DEFAULT;
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

module.exports = EsValueLangGraphStudioProxy