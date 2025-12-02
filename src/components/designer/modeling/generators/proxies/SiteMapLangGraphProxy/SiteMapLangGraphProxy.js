const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;
const firebase = require('firebase');

/**
 * SiteMap 생성 LangGraph Proxy
 * Firebase를 통해 백엔드 LangGraph 워크플로우와 통신
 */
class SiteMapLangGraphProxy {
    // 상수 정의
    static get JOB_TYPE() {
        return 'sitemap_generator';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs',
            JOB_STATES: 'jobStates'
        };
    }

    constructor(callbacks) {
        this.callbacks = callbacks;
        this.jobId = null;
    }

    /**
     * SiteMap 생성 시작
     */
    async generate(requirements, boundedContexts, commandReadModelData, existingNavigation = []) {
        try {
            // Job ID 생성
            this.jobId = `smapgen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Firebase Job 초기화
            await this._initializeJobState(requirements, boundedContexts, commandReadModelData, existingNavigation);
            
            // Firebase 리스너 등록
            this._watchJobState();
            
            // requestedJob 생성 (백엔드가 처리하도록 트리거)
            await this._createRequestedJob();
            
            return this.jobId;
            
        } catch (error) {
            console.error('[SiteMapLangGraphProxy] Error starting generation:', error);
            throw error;
        }
    }

    /**
     * Job 초기 상태 설정
     */
    async _initializeJobState(requirements, boundedContexts, commandReadModelData, existingNavigation) {
        const storage = new Vue(StorageBase);
        
        const jobData = {
            state: {
                inputs: {
                    requirements: requirements,
                    boundedContexts: boundedContexts,
                    commandReadModelData: commandReadModelData,
                    existingNavigation: existingNavigation
                },
                outputs: {
                    siteMap: {},
                    logs: [],
                    progress: 0,
                    currentGeneratedLength: 0,
                    isCompleted: false,
                    isFailed: false,
                    error: ''
                }
            }
        };
        
        await storage.setObject(this._getJobPath(this.jobId), jobData);
    }

    /**
     * requestedJob 생성 (백엔드 트리거)
     */
    async _createRequestedJob() {
        const storage = new Vue(StorageBase);
        
        const requestedJob = {
            jobId: this.jobId,
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        await storage.setObject(this._getRequestJobPath(this.jobId), requestedJob);
    }

    /**
     * Job 상태 감시
     */
    _watchJobState() {
        const storage = new Vue(StorageBase);
        const jobPath = `${this._getJobPath(this.jobId)}/state`;
        
        // 전체 상태 감시
        storage.watch(jobPath, (jobState) => {
            if (jobState) {
                this._parseAndNotifyJobState(jobState);
            }
        });
    }

    /**
     * Job 상태 파싱 및 콜백 호출
     */
    _parseAndNotifyJobState(jobState) {
        const outputs = jobState.outputs || {};
        
        const state = {
            siteMap: outputs.siteMap || {},
            logs: outputs.logs || [],
            progress: outputs.progress || 0,
            currentGeneratedLength: outputs.currentGeneratedLength || 0,
            isCompleted: outputs.isCompleted || false,
            isFailed: outputs.isFailed || false,
            error: outputs.error || ''
        };
        const currentGeneratedLength = state.currentGeneratedLength || this._calculateGeneratedLength(state.siteMap);
        
        // 완료 콜백
        if (state.isCompleted && this.callbacks.onComplete) {
            this.callbacks.onComplete({
                siteMap: state.siteMap,
                logs: state.logs,
                progress: state.progress,
                currentGeneratedLength
            });
            this._cleanup();
            return;
        }
        
        // 실패 콜백
        if (state.isFailed && this.callbacks.onError) {
            this.callbacks.onError({
                error: state.error,
                logs: state.logs
            });
            this._cleanup();
            return;
        }
        
        // 진행 중 업데이트 콜백
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate({
                siteMap: state.siteMap,
                logs: state.logs,
                progress: state.progress,
                currentGeneratedLength
            });
        }
    }

    /**
     * 리스너 정리
     */
    _cleanup() {
        // storage.watch는 자동으로 정리됨
    }

    /**
     * 수동 정리
     */
    destroy() {
        this._cleanup();
    }

    _calculateGeneratedLength(siteMap) {
        if (!siteMap) {
            return 0;
        }
        try {
            return JSON.stringify(siteMap).length;
        } catch (e) {
            return 0;
        }
    }

    // ========== Firebase 경로 헬퍼 메서드 ==========
    
    _getJobPath(jobId) {
        return `db://${SiteMapLangGraphProxy.PATHS.JOBS}/${SiteMapLangGraphProxy.JOB_TYPE}/${jobId}`;
    }

    _getRequestJobPath(jobId) {
        return `db://${SiteMapLangGraphProxy.PATHS.REQUESTED_JOBS}/${SiteMapLangGraphProxy.JOB_TYPE}/${jobId}`;
    }

    _getJobStatePath(jobId) {
        return `db://${SiteMapLangGraphProxy.PATHS.JOB_STATES}/${SiteMapLangGraphProxy.JOB_TYPE}/${jobId}`;
    }
}

module.exports = SiteMapLangGraphProxy;

