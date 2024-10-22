const GlobalPromptUtil = require('./GlobalPromptUtil')
const BoundedContextActionsProcessor = require('./ESActionsUtilProcessors/BoundedContextActionsProcessor')
const AggregateActionsProcessor = require('./ESActionsUtilProcessors/AggregateActionsProcessor')
const ValueObjectActionsProcessor = require('./ESActionsUtilProcessors/ValueObjectActionsProcessor')
const EnumerationActionsProcessor = require('./ESActionsUtilProcessors/EnumerationActionsProcessor')
const EventActionsProcessor = require('./ESActionsUtilProcessors/EventActionsProcessor')
const CommandActionsProcessor = require('./ESActionsUtilProcessors/CommandActionsProcessor')

class ESActionsUtil {
    static getActionAppliedESValue(actions, userInfo, information, prevESValue=null) {
        if(!prevESValue) prevESValue = {elements: {}, relations: {}}
        let esValue = JSON.parse(JSON.stringify(prevESValue))

        ESActionsUtil._restoreActions(actions, esValue)
        ESActionsUtil._idsToUUIDs(actions, esValue)
        


        let callbacks = {
            afterAllObjectAppliedCallBacks: [],
            afterAllRelationAppliedCallBacks: []
        }

        for(let action of actions)
            ESActionsUtil._applyAction(action, userInfo, information, esValue, callbacks)
        
        callbacks.afterAllObjectAppliedCallBacks.forEach(callback => callback(esValue, userInfo, information))
        callbacks.afterAllRelationAppliedCallBacks.forEach(callback => callback(esValue, userInfo, information))
        
        return esValue
    }

    /**
     * 액션에서 누락된 값이 있을 경우, 적절하게 복구
     */
    static _restoreActions(actions, esValue) {
        for(let action of actions)
            if(!action.type) {
                if(!esValue || !esValue.elements)
                    action.type = "create" 
                else {
                    let idToSearch = null
                    
                    switch(action.objectType) {
                        case "BoundedContext": idToSearch = action.ids.boundedContextId; break
                        case "Aggregate": idToSearch = action.ids.aggregateId; break
                        case "ValueObject": idToSearch = action.ids.valueObjectId; break
                        case "Enumeration": idToSearch = action.ids.enumerationId; break
                        case "Event": idToSearch = action.ids.eventId; break
                        case "Command": idToSearch = action.ids.commandId; break
                    }

                    if(!idToSearch) action.type = "create"
                    else if(esValue.elements[idToSearch]) action.type = "update"
                    else action.type = "create"
                }
            }
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
                ValueObjectActionsProcessor.getActionAppliedESValue(action, callbacks, esValue);
                break
            case "Enumeration":
                EnumerationActionsProcessor.getActionAppliedESValue(action, callbacks, esValue);
                break
            case "Event":
                EventActionsProcessor.getActionAppliedESValue(action, userInfo, esValue, callbacks);
                break
            case "Command":
                CommandActionsProcessor.getActionAppliedESValue(action, userInfo, esValue, callbacks);
                break
        }
    }
}

module.exports = ESActionsUtil