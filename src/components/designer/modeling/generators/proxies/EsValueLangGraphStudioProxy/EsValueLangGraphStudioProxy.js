const LangGraphProxyBase = require('../LangGraphProxyBase');
const LoggingUtil = require('../../utils/LoggingUtil');
const ProxyInputObjectConverter = require('../ProxyInputObjectConverter');
const logger = LoggingUtil.makeFromNamespace("EsValueLangGraphStudioProxy");

class EsValueLangGraphStudioProxy extends LangGraphProxyBase {
    static get PATH_CONFIG() {return 'db://configs/eventstorming_generator';}
    static get DEFAULT_NAMESPACE() {return 'eventstorming_generator';}

    static async healthCheckUsingConfig() {
        if(this.JOB_NAMESPACE_SUFFIX) return true;

        // AceBase 환경에서는 항상 backend 사용 (config 없어도 작동)
        const isAceBaseMode = window.$isElectron || window.MODE == 'onprem' || window.MODE == "bpm";
        if(isAceBaseMode) {
            return true;
        }

        try {
            const config = await this.STORAGE.getObject(this.PATH_CONFIG);
            if(config && config.is_use_backend) return true;
        } catch (error) {
            console.error('서버 상태 확인 오류:', error);
            return false;
        }
        return false;
    }

    
    static async makeNewJob(selectedDraftOptions, userInfo, information, preferedLanguage) {
        const inputObj = ProxyInputObjectConverter.toEsProxyInputObject(
            selectedDraftOptions, userInfo, information, preferedLanguage
        );
        logger.debug('구축된 데이터를 기반으로 Job 생성 요청', inputObj);
        return await super.makeNewJob(inputObj);
    }


    static _onInitializeJobState(accumulatedOutputState) {
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

    static _onSetupJobWatchers(jobId, jobState, notifyJobState) {
        this._watchEsValueCollection(
            jobId,
            'elements',
            jobState.esValue.elements,
            notifyJobState,
            jobState
        );

        this._watchEsValueCollection(
            jobId,
            'relations',
            jobState.esValue.relations,
            notifyJobState,
            jobState
        );
    }

    static _watchEsValueCollection(jobId, collectionName, targetCollection, notifyJobState, jobState) {
        const basePath = `${this._getJobPath(jobId)}/state/outputs/esValue/${collectionName}`;
        // 부모(LangGraphProxyBase) 의 cleanup 대상에 등록 — job 완료/실패 시 watch_off 됨.
        this._trackWatchedPath(jobState, basePath);

        this.STORAGE.watch_changed(basePath, async (item, key) => {
            if (!item || !key) return;

            targetCollection[key] = this._restoreDataFromFirebase(item);
            jobState._esValueDataReceived = true;
            await notifyJobState();
        });

        this.STORAGE.watch_added(basePath, null, async (item) => {
            if (!item || !item.id) return;

            targetCollection[item.id] = this._restoreDataFromFirebase(item);
            jobState._esValueDataReceived = true;
            await notifyJobState();
        });
    }


    static _onNotifyJobState(notifyState, jobState) {
        this._addElementRefToState(jobState.esValue);
        notifyState.outputs = jobState.esValue;
        // Race fix: 게이트웨이 COALESCE(300ms) + sub 등록 순서 fan-out 으로 isCompleted 가
        // elements/relations child_added 보다 먼저 도착하면 base 가 onComplete 를 빈
        // outputs 로 발사하고 곧장 watch_off → 뒤늦게 도착한 child_added 가 orphan 이 됨.
        // 본 데이터(elements/relations) 가 한 번이라도 watch 로 도착하기 전까지는
        // isCompleted 를 다운그레이드해 onComplete + cleanup 을 지연한다.
        if (notifyState.isCompleted && !jobState._esValueDataReceived) {
            notifyState.isCompleted = false;
        }
        return notifyState;
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


    static async getTraceInfoFromJob(jobId) {
        const requirementPath = `${this._getJobPath(jobId)}/state/inputs/requirements`;
        const userStory = await this.STORAGE.getString(requirementPath)
        return {
            userInputs: {
                userStory: userStory,
                ddl: ""
            }
        }
    }
}

module.exports = EsValueLangGraphStudioProxy