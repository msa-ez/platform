const GlobalPromptUtil = require('./GlobalPromptUtil')
const ESRestoreActionsUtil = require('./ESRestoreActionsUtil')
const BoundedContextActionsProcessor = require('./ESActionsUtilProcessors/BoundedContextActionsProcessor')
const AggregateActionsProcessor = require('./ESActionsUtilProcessors/AggregateActionsProcessor')
const ValueObjectActionsProcessor = require('./ESActionsUtilProcessors/ValueObjectActionsProcessor')
const EnumerationActionsProcessor = require('./ESActionsUtilProcessors/EnumerationActionsProcessor')
const EventActionsProcessor = require('./ESActionsUtilProcessors/EventActionsProcessor')
const CommandActionsProcessor = require('./ESActionsUtilProcessors/CommandActionsProcessor')
const GeneralClassActionsProcessor = require('./ESActionsUtilProcessors/GeneralClassActionsProcessor')
const ReadModelActionsProcessor = require('./ESActionsUtilProcessors/ReadModelActionsProcessor')

class ESActionsUtil {
    static getActionAppliedESValue(actions, userInfo, information, prevESValue=null, options=null) {
        const isValidParams = () => {
            if(!userInfo) {
                throw new Error('[!] userInfo 정보가 전달되지 않았습니다.');
            }

            if(!information) {
                console.log("[*] information 정보가 전달되지 않음! 간접적으로 information 정보를 복구를 시도함")
    
                const parsedURL = window.location.href.split("/")
                const projectId = parsedURL[parsedURL.length - 1]
    
                const validProjectIdPattern = /^[0-9a-f]{32}$/i;
                if (!validProjectIdPattern.test(projectId)) {
                    throw new Error('[!] information 정보 복구에 실패했습니다.');
                }
    
    
                information = {
                    projectId: projectId
                }
            }

            return true
        } 


        /*
        isRestoreUsed: 이 옵션은 누락된 type 복구하거나 디폴트 VO 생성 액션이 없을 경우, 추가하는 등의 교정 기능을 제공하며, 기본적으로 사용되어야 함
        isStrictRestoreUsed: 이 옵션은 기본적인 복구 기능에 더해서 유효하지 않은 속성들 및 액션을 전체적으로 수정하기 때문에 상황에 따라서는 의도대로 작동하지 않을 수 있음
        - 동일한 Aggregate 내부에서 동일한 이름의 ValueObject, Enumeration, GeneralClass 생성 액션을 삭제함(대소문자 구분 없이)
        - 모든 액션에 대해서 Aggregate 이름을 직접적으로 속성으로 가지는 경우, 해당 속성을 삭제함(ClassID로만 접근해야 하기 때문에)
        - 모든 액션에 대해서 Aggregate 이름 + Id를 속성으로 가지며, 그것이 자바 디폴트 타입인 경우, 해당 속성을 삭제함(대소문자 구분 없이)(위와 동일한 이유)
        - 현재 존재하는 Aggregate 이름과 동일한 이름의 ValueObject, GeneralClass 생성 액션을 삭제함(대소문자 구분 없이)(위와 동일한 이유)
        - Aggregate, ValueObject, GeneralClass에서 디폴트 VO나 Java 타입이 아닌 타입을 사용하고, 그 타입이 해당 Aggregate에 없을 경우, 다른 Aggregate에 있는 타입을 찾아서 생성하도록 추가함. 만약, 다른 Aggregate에도 없을 경우에는 삭제시킴
        - GeneralClass, Entity, Enumeration이 생성되어 있는데, 다른 곳에서 속성으로 사용하는 경우가 없을 경우, 해당 AggregateRoot에 속성을 추가함
        - 속성을 1개만 가지는 ValueObject를 생성하려고 하는 경우, 직접 그 속성을 사용하도록 만들고, 해당 생성 액션을 제거함
        */
        options = {
            isRestoreUsed: (options && options.isRestoreUsed !== undefined) ? options.isRestoreUsed : true,
            isStrictRestoreUsed: (options && options.isStrictRestoreUsed !== undefined) ? options.isStrictRestoreUsed : true
        }

        console.log("[*] 이벤트 스토밍 수정 액션 적용 시도", {actions: JSON.parse(JSON.stringify(actions, null, 2)), userInfo, information, prevESValue, options})
        if(!isValidParams()) return;


        if(!prevESValue) prevESValue = {elements: {}, relations: {}}
        let esValue = JSON.parse(JSON.stringify(prevESValue))


        if(options.isRestoreUsed)
            ESRestoreActionsUtil.restoreActions(actions, esValue, options)

        actions = ESActionsUtil._getSortedActions(actions)
        ESActionsUtil._idsToUUIDs(actions, esValue)
        

        let callbacks = {
            afterAllObjectAppliedCallBacks: [],
            afterAllRelationAppliedCallBacks: []
        }

        for(let action of actions)
            ESActionsUtil._applyAction(action, userInfo, information, esValue, callbacks)
        
        callbacks.afterAllObjectAppliedCallBacks.forEach(callback => callback(esValue, userInfo, information))
        callbacks.afterAllRelationAppliedCallBacks.forEach(callback => callback(esValue, userInfo, information))
        
        console.log("[*] 이벤트 스토밍 수정 액션 적용 완료", esValue)
        return esValue
    }

    static _getSortedActions(actions) {
        const priorityMap = {
            'BoundedContext': 1,
            'Aggregate': 2,
            'GeneralClass': 3,
            'ValueObject': 4,
            'Enumeration': 5,
            'Event': 6,
            'Command': 7,
            'ReadModel': 8
        }

        return [...actions].sort((a, b) => {
            const priorityA = priorityMap[a.objectType] || 999
            const priorityB = priorityMap[b.objectType] || 999
            return priorityA - priorityB
        })
    }

    /**
     * AI가 생성한 ids의 내용들 중에서 해당 id가 prevESValue에 존재하지 않는 경우, 적절한 UUID로 변경
     */
    static _idsToUUIDs(actions, esValue){
        let idToUUIDDic = {}

        for(let action of actions) {
            if(action.ids) {
                for(let idKey of Object.keys(action.ids))
                    action.ids[idKey] = ESActionsUtil.__getOrCreateUUID(action.ids[idKey], idToUUIDDic, esValue)
            }

            if(action.args) {
                if(action.args.outputEventIds)
                    action.args.outputEventIds = action.args.outputEventIds.map(id => ESActionsUtil.__getOrCreateUUID(id, idToUUIDDic, esValue))

                if(action.args.outputCommandIds)
                    action.args.outputCommandIds = action.args.outputCommandIds.map(idObj => {
                        return {
                            ...idObj,
                            commandId: ESActionsUtil.__getOrCreateUUID(idObj.commandId, idToUUIDDic, esValue)
                        }
                    })
            }
        }
    }

    static __getOrCreateUUID(id, idToUUIDDic, esValue) {
        if(esValue && esValue.elements && esValue.elements[id])
            return id

        if(!idToUUIDDic[id]) 
            idToUUIDDic[id] = GlobalPromptUtil.getUUID()
        return idToUUIDDic[id]
    }

    static _applyAction(action, userInfo, information, esValue, callbacks) {
        switch(action.objectType) {
            case "BoundedContext":
                BoundedContextActionsProcessor.getActionAppliedESValue(action, userInfo, information, esValue, callbacks);
                break
            case "Aggregate":
                AggregateActionsProcessor.getActionAppliedESValue(action, userInfo, esValue, callbacks);
                break
            case "ValueObject":
                ValueObjectActionsProcessor.getActionAppliedESValue(action, esValue, callbacks);
                break
            case "Enumeration":
                EnumerationActionsProcessor.getActionAppliedESValue(action, esValue, callbacks);
                break
            case "GeneralClass":
                GeneralClassActionsProcessor.getActionAppliedESValue(action, esValue, callbacks);
                break
            case "Event":
                EventActionsProcessor.getActionAppliedESValue(action, userInfo, esValue, callbacks);
                break
            case "Command":
                CommandActionsProcessor.getActionAppliedESValue(action, userInfo, esValue, callbacks);
                break
            case "ReadModel":
                ReadModelActionsProcessor.getActionAppliedESValue(action, userInfo, esValue, callbacks);
                break
        }
    }


    static addDefaultProperties(actions) {
        for(let action of actions){
            switch(action.objectType) {
                case "Aggregate":
                    if(!action.args) action.args = {}
                    if(!action.args.aggregateName) action.args.aggregateName = "Aggregate " + action.ids.aggregateId.slice(0, 4)
                    if(!action.args.properties || action.args.properties.length === 0)
                        action.args.properties = [
                            {
                                "name": "id",
                                "type": "Long",
                                "isKey": true
                            }
                        ]
                    break
                
                case "ValueObject":
                    if(!action.args) action.args = {}
                    if(!action.args.valueObjectName) action.args.valueObjectName = "ValueObject " + action.ids.valueObjectId.slice(0, 4)
                    if(!action.args.properties) action.args.properties = []
                    break
                    
                case "Enumeration":
                    if(!action.args) action.args = {}
                    if(!action.args.enumerationName) action.args.enumerationName = "Enumeration " + action.ids.enumerationId.slice(0, 4)
                    if(!action.args.properties) action.args.properties = []
                    break
                
                case "Event":
                    if(!action.args) action.args = {}
                    if(!action.args.eventName) action.args.eventName = "Event " + action.ids.eventId.slice(0, 4)
                    if(!action.args.properties) action.args.properties = []
                    break

                case "Command":
                    if(!action.args) action.args = {}
                    if(!action.args.commandName) action.args.commandName = "Command " + action.ids.commandId.slice(0, 4)
                    if(!action.args.properties) action.args.properties = []
                    if(!action.args.outputEventIds) action.args.outputEventIds = []
                    break
                
                case "ReadModel":
                    if(!action.args) action.args = {}
                    if(!action.args.readModelName) action.args.readModelName = "ReadModel " + action.ids.readModelId.slice(0, 4)
                    if(!action.args.queryParameters) action.args.queryParameters = []
                    break
            }
        }
        return actions
    }
}

module.exports = ESActionsUtil