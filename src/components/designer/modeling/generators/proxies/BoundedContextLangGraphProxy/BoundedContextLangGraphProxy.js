const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;
const firebase = require('firebase');

/**
 * BoundedContextLangGraphProxy
 * 
 * Firebase Job Queue를 통해 백엔드 BoundedContextGenerator와 통신
 */
class BoundedContextLangGraphProxy {
    // 상수 정의
    static get JOB_TYPE() {
        return 'bounded_context';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    /**
     * 새 Bounded Context 생성 Job 생성
     * 
     * @param {string} jobId - Job ID
     * @param {string} devisionAspect - 분리 관점
     * @param {Object} requirements - 요구사항 (userStory, summarizedResult, analysisResult, pbcInfo)
     * @param {Object} generateOption - 생성 옵션 (numberOfBCs, additionalOptions, aspectDetails, isProtocolMode)
     * @param {string} feedback - 피드백 (선택)
     * @param {Object} previousAspectModel - 이전 모델 (선택)
     * @returns {Promise<string>} Job ID
     */
    static async makeNewJob(jobId, devisionAspect, requirements, generateOption, feedback = null, previousAspectModel = null) {
        const storage = new Vue(StorageBase);

        const inputs = {
            "jobId": jobId,
            "devisionAspect": devisionAspect,
            "requirements": requirements,
            "generateOption": generateOption
        };

        if (feedback) {
            inputs["feedback"] = feedback;
        }

        if (previousAspectModel) {
            inputs["previousAspectModel"] = previousAspectModel;
        }

        await storage.setObject(this._getJobPath(jobId), {
            "state": {
                "inputs": inputs
            }
        });

        await storage.setObject(this._getRequestJobPath(jobId), {
            "createdAt": firebase.database.ServerValue.TIMESTAMP
        });

        console.log(`✅ BoundedContext Job created: ${jobId}`);

        return jobId;
    }

    /**
     * Job 진행 상황 감시
     * 
     * @param {string} jobId - Job ID
     * @param {Function} onUpdate - 진행 중 업데이트 콜백 (thoughts, boundedContexts, relations, explanations, logs, progress)
     * @param {Function} onComplete - 완료 콜백 (thoughts, boundedContexts, relations, explanations, logs, progress, isFailed)
     * @param {Function} onWaiting - 대기 콜백 (waitingJobCount)
     * @param {Function} onFailed - 실패 콜백 (errorMsg)
     */
    static watchJob(jobId, onUpdate, onComplete, onWaiting, onFailed) {
        const storage = new Vue(StorageBase);
        const jobState = this._initializeJobState(storage, jobId);
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
        await storage.setObject(this._getJobStatePath(jobId), {
            "isRemoveRequested": true
        });
    }
    
    // ========== 내부 메서드 ==========
    
    /**
     * Job 상태 초기화
     * Firebase에서 기존 데이터 복원
     */
    static _initializeJobState(storage, jobId) {
        let accumulatedOutputState = this._restoreDataFromFirebase(
            storage.getObject(`${this._getJobPath(jobId)}/state/outputs`)
        );
        
        if (!accumulatedOutputState) {
            accumulatedOutputState = {};
        }
        
        // 필수 필드 초기화
        if (!accumulatedOutputState.thoughts) {
            accumulatedOutputState.thoughts = '';
        }
        if (!accumulatedOutputState.boundedContexts) {
            accumulatedOutputState.boundedContexts = [];
        }
        if (!accumulatedOutputState.relations) {
            accumulatedOutputState.relations = [];
        }
        if (!accumulatedOutputState.explanations) {
            accumulatedOutputState.explanations = [];
        }
        if (!accumulatedOutputState.logs) {
            accumulatedOutputState.logs = [];
        }
        if (!accumulatedOutputState.progress) {
            accumulatedOutputState.progress = 0;
        }
        if (!accumulatedOutputState.isCompleted) {
            accumulatedOutputState.isCompleted = false;
        }
        if (!accumulatedOutputState.isFailed) {
            accumulatedOutputState.isFailed = false;
        }
        if (!accumulatedOutputState.error) {
            accumulatedOutputState.error = '';
        }
        
        return accumulatedOutputState;
    }

    /**
     * 모든 워처 설정
     */
    static _setupJobWatchers(storage, jobId, jobState, callbacks) {
        const parseState = async () => await this._parseAndNotifyJobState(jobState, callbacks);
        
        // 대기 중인 작업 수 감시
        this._watchWaitingJobCount(storage, jobId, callbacks.onWaiting);
        
        // 작업 상태 감시 (완료/실패)
        this._watchJobStatus(storage, jobId, jobState, callbacks.onFailed, parseState);
        
        // 작업 진행률 감시
        this._watchJobProgress(storage, jobId, jobState, parseState);
        
        // BC 결과 감시
        this._watchBoundedContexts(storage, jobId, jobState, parseState);
        
        // 로그 감시
        this._watchJobLogs(storage, jobId, jobState, parseState);
    }

    /**
     * 대기 중인 작업 수 감시
     */
    static _watchWaitingJobCount(storage, jobId, onWaiting) {
        storage.watch(`${this._getRequestJobPath(jobId)}/waitingJobCount`, async (count) => {
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
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isFailed`, async (isFailed) => {
            if (isFailed === null || isFailed === undefined) return;
            if (!isFailed) return;
            
            jobState.isFailed = isFailed;
            await parseState();
            
            const errorMsg = jobState.error || "Unknown error occurred";
            await onFailed(errorMsg);
        });

        // 완료 상태 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/isCompleted`, async (isCompleted) => {
            console.log('[BoundedContextLangGraphProxy] _watchJobStatus isCompleted 감지:', isCompleted);
            if (isCompleted) {
                jobState.isCompleted = isCompleted;
                
                // 완료 시 전체 outputs 객체 읽기
                const outputs = await storage.getObject(`${this._getJobPath(jobId)}/state/outputs`);
                
                if (outputs) {
                    if (outputs.devisionAspect !== null && outputs.devisionAspect !== undefined) {
                        jobState.devisionAspect = outputs.devisionAspect;
                    }
                    if (outputs.thoughts !== null && outputs.thoughts !== undefined) {
                        jobState.thoughts = outputs.thoughts;
                    }
                    if (outputs.relations !== null && outputs.relations !== undefined) {
                        jobState.relations = this._restoreArrayFromFirebase(outputs.relations);
                    }
                    if (outputs.explanations !== null && outputs.explanations !== undefined) {
                        jobState.explanations = this._restoreArrayFromFirebase(outputs.explanations);
                    }
                }
                
                await parseState();
            }
        });
        
        // 에러 메시지 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/error`, async (error) => {
            if (error) {
                jobState.error = error;
            }
        });
    }

    /**
     * 작업 진행률 감시
     */
    static _watchJobProgress(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/progress`, async (progress) => {
            if (progress !== null && progress !== undefined) {
                jobState.progress = progress;
                // parseState는 _watchBoundedContexts에서만 호출됨
            }
        });
        
        // currentGeneratedLength 감시
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/currentGeneratedLength`, async (currentGeneratedLength) => {
            if (currentGeneratedLength !== null && currentGeneratedLength !== undefined) {
                jobState.currentGeneratedLength = currentGeneratedLength;
            }
        });
    }

    /**
     * Bounded Contexts 감시
     */
    static _watchBoundedContexts(storage, jobId, jobState, parseState) {
        storage.watch(`${this._getJobPath(jobId)}/state/outputs/boundedContexts`, async (boundedContexts) => {
            if (boundedContexts) {
                jobState.boundedContexts = this._restoreArrayFromFirebase(boundedContexts);
                
                // 전체 outputs 객체 읽기
                const outputs = await storage.getObject(`${this._getJobPath(jobId)}/state/outputs`);
                
                if (outputs) {
                    if (outputs.devisionAspect !== null && outputs.devisionAspect !== undefined) {
                        jobState.devisionAspect = outputs.devisionAspect;
                    }
                    if (outputs.thoughts !== null && outputs.thoughts !== undefined) {
                        jobState.thoughts = outputs.thoughts;
                    }
                    if (outputs.relations !== null && outputs.relations !== undefined) {
                        jobState.relations = this._restoreArrayFromFirebase(outputs.relations);
                    }
                    if (outputs.explanations !== null && outputs.explanations !== undefined) {
                        jobState.explanations = this._restoreArrayFromFirebase(outputs.explanations);
                    }
                }
                
                await parseState();
            }
        });
    }

    /**
     * 로그 감시
     */
    static _watchJobLogs(storage, jobId, jobState, parseState) {
        storage.watch_added(`${this._getJobPath(jobId)}/state/outputs/logs`, null, async (log) => {
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
            devisionAspect: jobState.devisionAspect || '',
            thoughts: jobState.thoughts || '',
            boundedContexts: jobState.boundedContexts || [],
            relations: jobState.relations || [],
            explanations: jobState.explanations || [],
            logs: jobState.logs || [],
            progress: jobState.progress || 0,
            currentGeneratedLength: jobState.currentGeneratedLength || 0,
            isCompleted: jobState.isCompleted || false,
            isFailed: jobState.isFailed || false,
            error: jobState.error || ''
        };

        console.log('[BoundedContextLangGraphProxy] _parseAndNotifyJobState:', {
            boundedContexts: state.boundedContexts.length,
            isCompleted: state.isCompleted,
            hasOnComplete: !!callbacks.onComplete
        });

        if (state.isCompleted) {
            console.log('[BoundedContextLangGraphProxy] _parseAndNotifyJobState onComplete 호출:', state.boundedContexts.length);
            await callbacks.onComplete(
                state.devisionAspect,
                state.thoughts,
                state.boundedContexts,
                state.relations,
                state.explanations,
                state.logs,
                state.progress,
                state.isFailed
            );
        } else {
            console.log('[BoundedContextLangGraphProxy] _parseAndNotifyJobState onUpdate 호출:', state.boundedContexts.length);
            await callbacks.onUpdate(
                state.devisionAspect,
                state.thoughts,
                state.boundedContexts,
                state.relations,
                state.explanations,
                state.logs,
                state.progress,
                state.currentGeneratedLength
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
        
        if (Array.isArray(firebaseData)) {
            return firebaseData.map(item => this._restoreDataFromFirebase(item));
        }
        
        // Firebase 객체를 배열로 변환
        if (typeof firebaseData === 'object') {
            return Object.values(firebaseData).map(item => this._restoreDataFromFirebase(item));
        }
        
        return [];
    }

    static _restoreDataFromFirebase(firebaseData) {
        if (!firebaseData) return null;
        
        if (Array.isArray(firebaseData)) {
            return firebaseData.map(item => this._restoreDataFromFirebase(item));
        }
        
        if (typeof firebaseData === 'object') {
            const restored = {};
            for (const [key, value] of Object.entries(firebaseData)) {
                restored[key] = this._restoreDataFromFirebase(value);
            }
            return restored;
        }
        
        return firebaseData;
    }
}

module.exports = BoundedContextLangGraphProxy;

