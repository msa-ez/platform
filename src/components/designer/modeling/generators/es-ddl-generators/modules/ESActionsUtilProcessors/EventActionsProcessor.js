const changeCase = require('change-case');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')
const PolicyProcessor = require('./PolicyProcessor')

class EventActionsProcessor {
    static getActionAppliedESValue(action, userInfo, esValue, callbacks) {
        switch(action.type) {
            case "create":
                EventActionsProcessor._createEvent(action, userInfo, esValue, callbacks)
                break
            case "update":
                EventActionsProcessor._updateEvent(action, userInfo, esValue, callbacks)
                break
        }
    }

    static _createEvent(action, userInfo, esValue, callbacks) {
        const eventObject = EventActionsProcessor.__getEventBase(
            userInfo, action.args.eventName, 
            action.args.eventAlias ? action.args.eventAlias : "", 
            action.ids.boundedContextId, action.ids.aggregateId, 0, 0, action.ids.eventId
        )

        const VALID_POSITION = EventActionsProcessor.__getValidPosition(esValue, action, eventObject)
        eventObject.elementView.x = VALID_POSITION.x
        eventObject.elementView.y = VALID_POSITION.y

        esValue.elements[eventObject.id] = eventObject
        ActionsProcessorUtils.reseizeAggregateVertically(esValue, eventObject)

        if(action.args.outputCommandIds) {
            callbacks.afterAllObjectAppliedCallBacks.push((esValue) => {
                action.args.outputCommandIds.forEach(outputCommandId => {
                    PolicyProcessor.createNewPolicy(esValue, userInfo, eventObject, outputCommandId.commandId, outputCommandId.reason)
                })
            })
        }

        callbacks.afterAllRelationAppliedCallBacks.push((esValue) => {
            eventObject.fieldDescriptors = EventActionsProcessor.__getAggregateFileDescriptors(esValue, action, eventObject)
        })
    }

    static __getEventBase(userInfo, name, displayName, boundedContextId, aggregateId, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()
        return {
            alertURL: "/static/image/symbol/alert-icon.png",
            author: userInfo.uid,
            checkAlert: true,
            description: null,
            id: elementUUIDtoUse,
            elementView: {
                angle: 0,
                height: 115,
                id: elementUUIDtoUse,
                style: "{}",
                width: 100,
                x: x, 
                y: y, 
                _type: "org.uengine.modeling.model.Event"
            },
            fieldDescriptors: [],
            hexagonalView: {
                height: 0,
                id: elementUUIDtoUse,
                style: "{}",
                width: 0,
                x: 0,
                y: 0,
                _type: "org.uengine.modeling.model.EventHexagonal"
            },
            name: name,
            displayName: displayName,
            nameCamelCase: changeCase.camelCase(name),
            namePascalCase: changeCase.pascalCase(name),
            namePlural: "",
            relationCommandInfo: [],
            relationPolicyInfo: [],
            rotateStatus: false,
            selected: false,
            trigger: "@PostPersist",
            _type: "org.uengine.modeling.model.Event",
            aggregate: {
                id: aggregateId,
            },
            boundedContext: {
                id: boundedContextId
            }
        }
    }

    static __getValidPosition(esValue, action, eventObject) {
        const events = ActionsProcessorUtils.getAggregateEvents(esValue, action.ids.aggregateId)
        if(events.length <= 0) {
            const currentAggregate = esValue.elements[action.ids.aggregateId]
            return {
                x: currentAggregate.elementView.x + Math.round(currentAggregate.elementView.width/2) + 29,
                y: currentAggregate.elementView.y - Math.round(currentAggregate.elementView.height/2)
            }
        }
        else {
            const maxX = Math.max(...events.map(event => event.elementView.x))
            const maxY = Math.max(...events.map(event => event.elementView.y))

            const maxYEvent = events.filter(event => event.elementView.y === maxY)[0]
            return {
                x: maxX,
                y: maxY + Math.round(maxYEvent.elementView.height/2) + Math.round(eventObject.elementView.height/2) + 14
            }
        }
    }

    static __getAggregateFileDescriptors(esValue, action, eventObject) {
        if(action.args.properties) {
            return action.args.properties.map((property) => {
                return {
                    "className": property.type ? property.type : "String",
                    "isCopy": false,
                    "isKey": property.isKey ? true : false,
                    "name": property.name,
                    "nameCamelCase": changeCase.camelCase(property.name),
                    "namePascalCase": changeCase.pascalCase(property.name),
                    "displayName": property.displayName ? property.displayName : "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            })
        }

        let targetFieldDescriptors = esValue.elements[action.ids.aggregateId].aggregateRoot.fieldDescriptors
        if(ActionsProcessorUtils.isRelatedByDeleteCommand(esValue, eventObject))
            targetFieldDescriptors = targetFieldDescriptors.filter(fieldDescriptor => fieldDescriptor.isKey)

        return targetFieldDescriptors.map((property) => {
            return {
                "className": property.className,
                "isCopy": false,
                "isKey": property.isKey ? true : false,
                "name": property.name,
                "nameCamelCase": property.nameCamelCase,
                "namePascalCase": property.namePascalCase,
                "displayName": property.displayName,
                "_type": "org.uengine.model.FieldDescriptor"
            }
        })
    }

    static _updateEvent(action, userInfo, esValue, callbacks) {
        const eventObject = esValue.elements[action.ids.eventId]
        if(!eventObject) {
            console.error("[!] Event to update not found", action)
            return
        }

        if(action.args.outputCommandIds) {
            callbacks.afterAllObjectAppliedCallBacks.push((esValue) => {
                action.args.outputCommandIds.forEach(outputCommandId => {
                    PolicyProcessor.createNewPolicy(esValue, userInfo, eventObject, outputCommandId.commandId, outputCommandId.reason, outputCommandId.name, outputCommandId.alias)
                })
            })
        }
    }
}

module.exports = EventActionsProcessor