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
            notifyJobState
        );

        this._watchEsValueCollection(
            jobId, 
            'relations', 
            jobState.esValue.relations, 
            notifyJobState
        );
    }

    static _watchEsValueCollection(jobId, collectionName, targetCollection, notifyJobState) {
        const basePath = `${this._getJobPath(jobId)}/state/outputs/esValue/${collectionName}`;
        
        this.STORAGE.watch_changed(basePath, async (item, key) => {
            if (!item || !key) return;
            
            targetCollection[key] = this._restoreDataFromFirebase(item);
            await notifyJobState();
        });

        this.STORAGE.watch_added(basePath, null, async (item) => {
            if (!item || !item.id) return;
            
            targetCollection[item.id] = this._restoreDataFromFirebase(item);
            await notifyJobState();
        });
    }
    

    static _onNotifyJobState(notifyState, jobState) {
        this._addElementRefToState(jobState.esValue);
        notifyState.outputs = jobState.esValue;
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