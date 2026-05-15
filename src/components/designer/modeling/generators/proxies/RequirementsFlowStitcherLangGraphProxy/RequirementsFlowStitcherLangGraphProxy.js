const Vue = require('vue').default || require('vue');
const StorageBase = require('../../../../../CommonStorageBase.vue').default;

/**
 * Requirements Flow Stitcher 용 LangGraph Backend Proxy.
 *
 * 청크 단위로 추출된 events 의 nextEvents/level 을 글로벌 컨텍스트로 보강하는
 * 백엔드 EventFlowStitcher 잡과 통신.
 *
 * RecursiveRequirementsValidationGeneratorLangGraph 가 모든 청크 처리를 끝낸 직후
 * (resolveCurrentProcess 직전) 한 번 호출함.
 */
class RequirementsFlowStitcherLangGraphProxy {
    static get JOB_TYPE() {
        return 'requirements_flow_stitcher';
    }

    static get PATHS() {
        return {
            JOBS: 'jobs',
            REQUESTED_JOBS: 'requestedJobs'
        };
    }

    static async makeNewJob(jobId, events, actors, requirementsText) {
        const storage = new Vue(StorageBase);

        const inputs = {
            jobId,
            events: events || [],
            actors: actors || [],
            requirements: requirementsText || ''
        };

        await storage.setObject(this._getJobPath(jobId), {
            state: { inputs }
        });

        await storage.setObject(this._getRequestJobPath(jobId), {
            createdAt: storage.getServerTimestamp()
        });

        return jobId;
    }

    /**
     * @param {Function} onComplete - (events: Array, error: string|null) => void
     * @param {Function} onFailed   - (errorMsg: string) => void
     */
    static watchJob(jobId, onComplete, onFailed) {
        const storage = new Vue(StorageBase);
        const jobState = {
            content: null,
            isCompleted: false,
            isFailed: false,
            error: '',
            _watchedPaths: new Set(),
            _watchersCleaned: false
        };

        const trackWatch = (path) => {
            if (jobState && jobState._watchedPaths) {
                jobState._watchedPaths.add(path);
            }
        };
        const cleanupWatchers = () => {
            if (!jobState || !jobState._watchedPaths || jobState._watchersCleaned) return;
            jobState._watchersCleaned = true;
            for (const path of jobState._watchedPaths) {
                try { storage.watch_off(path); } catch (e) { /* noop */ }
            }
            jobState._watchedPaths.clear();
        };

        let invoked = false;
        const tryNotifyComplete = async () => {
            if (invoked) return;
            if (!jobState.isCompleted) return;
            invoked = true;
            const events = (jobState.content && jobState.content.events) || [];
            await onComplete(events, jobState.error || null);
            cleanupWatchers();
        };

        const contentPath = `${this._getJobPath(jobId)}/state/outputs/content`;
        trackWatch(contentPath);
        storage.watch(contentPath, async (content) => {
            if (content) {
                jobState.content = this._restoreDataFromFirebase(content);
                await tryNotifyComplete();
            }
        });

        const completedPath = `${this._getJobPath(jobId)}/state/outputs/isCompleted`;
        trackWatch(completedPath);
        storage.watch(completedPath, async (isCompleted) => {
            if (isCompleted === true) {
                jobState.isCompleted = true;
                await tryNotifyComplete();
            }
        });

        const failedPath = `${this._getJobPath(jobId)}/state/outputs/isFailed`;
        trackWatch(failedPath);
        storage.watch(failedPath, async (isFailed) => {
            if (isFailed === true && !invoked) {
                invoked = true;
                jobState.isFailed = true;
                const msg = jobState.error || 'Event flow stitching failed';
                if (typeof onFailed === 'function') {
                    await onFailed(msg);
                }
                cleanupWatchers();
            }
        });

        const errorPath = `${this._getJobPath(jobId)}/state/outputs/error`;
        trackWatch(errorPath);
        storage.watch(errorPath, async (error) => {
            if (error) {
                jobState.error = error;
            }
        });
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
        return `flow-stitch-${timestamp}-${random}`;
    }
}

module.exports = RequirementsFlowStitcherLangGraphProxy;
