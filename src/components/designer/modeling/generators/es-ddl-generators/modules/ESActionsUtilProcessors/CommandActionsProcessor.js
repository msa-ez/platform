const changeCase = require('change-case');
const pluralize = require('pluralize');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')
const ActorProcessor = require('./ActorProcessor')

class CommandActionsProcessor {
    static getActionAppliedESValue(action, userInfo, esValue, callbacks) {
        switch(action.type) {
            case "create":
                CommandActionsProcessor._createCommand(action, userInfo, esValue, callbacks)
                break
        }
    }

    static _createCommand(action, userInfo, esValue, callbacks) {
        const commandObject = CommandActionsProcessor.__getCommandBase(
            userInfo, action.args.commandName, "", 
            action.args.api_verb, [], action.ids.boundedContextId,
            action.ids.aggregateId, 0, 0, action.ids.commandId
        )
        
        if(action.args.outputEventIds) {
            callbacks.afterAllObjectAppliedCallBacks.push((esValue) => {
                commandObject.outputEvents = CommandActionsProcessor.__getOutputEventNames(esValue, action.args.outputEventIds)
            })
        } else
            commandObject.outputEvents = []

        CommandActionsProcessor.__makeCommandToEventRelation(commandObject, action, callbacks)

        const VALID_POSITION = CommandActionsProcessor.__getValidPosition(esValue, action, commandObject)
        commandObject.elementView.x = VALID_POSITION.x
        commandObject.elementView.y = VALID_POSITION.y
        callbacks.afterAllRelationAppliedCallBacks.push((esValue) => {
            ActorProcessor.makeActorToCommand(esValue, action, commandObject, userInfo)
        })

        commandObject.fieldDescriptors = CommandActionsProcessor.__getFileDescriptors(esValue, action)
        esValue.elements[commandObject.id] = commandObject
        ActionsProcessorUtils.reseizeAggregateVertically(esValue, commandObject)
    }

    static __getCommandBase(userInfo, name, displayName, api_verb, outputEvents, boundedContextId, aggregateId, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()
        return {
            _type: "org.uengine.modeling.model.Command",
            outputEvents: outputEvents,
            aggregate: {
                id: aggregateId
            },
            author: userInfo.uid,
            boundedContext: {
                id: boundedContextId,
            },
            controllerInfo: {
                method: api_verb
            },
            fieldDescriptors: [],
            description: null,
            id: elementUUIDtoUse,
            elementView: {
                _type: "org.uengine.modeling.model.Command",
                height: 115,
                id: elementUUIDtoUse,
                style: "{}",
                width: 100,
                x: x, 
                y: y,
                "z-index": 999
            },
            hexagonalView: {
                _type: "org.uengine.modeling.model.CommandHexagonal",
                height: 0,
                id: elementUUIDtoUse,
                style: "{}",
                width: 0,
                x: 0,
                y: 0
            },
            isRestRepository: (api_verb == 'PUT' ? false : true),
            name: name,
            displayName: displayName,
            nameCamelCase: changeCase.camelCase(name),
            namePascalCase: changeCase.pascalCase(name),
            namePlural: pluralize(changeCase.camelCase(name)),
            relationCommandInfo: [],
            relationEventInfo: [],
            restRepositoryInfo: {
                method: api_verb ? api_verb : 'POST'
            },
            rotateStatus: false,
            selected: false,
            trigger: "@PrePersist",
        }
    }

    static __getOutputEventNames(esValue, outputEventIds) {
        return outputEventIds.filter(eventId => {
            return esValue.elements[eventId] !== undefined
        }).map(eventId => {
            return esValue.elements[eventId].name
        })
    }

    static __makeCommandToEventRelation(commandObject, action, callbacks) {
        callbacks.afterAllObjectAppliedCallBacks.push((esValue) => {
            action.args.outputEventIds.forEach(eventId => {
                const eventObject = esValue.elements[eventId]
                if(!commandObject || !eventObject) return

                const commandEventRelation = ActionsProcessorUtils.getEventStormingRelationObjectBase(commandObject, eventObject)
                esValue.relations[commandEventRelation.id] = commandEventRelation
            })
        })
    }

    static __getValidPosition(esValue, action, commandObject) {
        const commands = ActionsProcessorUtils.getAggregateCommands(esValue, action.ids.aggregateId)
        const readModels = ActionsProcessorUtils.getAggregateReadModels(esValue, action.ids.aggregateId)
        const allModels = [...commands, ...readModels]

        if(allModels.length <= 0) {
            const currentAggregate = esValue.elements[action.ids.aggregateId]
            return {
                x: currentAggregate.elementView.x - Math.round(currentAggregate.elementView.width/2) - 29,
                y: currentAggregate.elementView.y - Math.round(currentAggregate.elementView.height/2)
            }
        }
        else {
            const minX = Math.min(...allModels.map(model => model.elementView.x))
            const maxY = Math.max(...allModels.map(model => model.elementView.y))

            const maxYModel = allModels.filter(model => model.elementView.y === maxY)[0]
            return {
                x: minX,
                y: maxY + Math.round(maxYModel.elementView.height/2) + Math.round(commandObject.elementView.height/2) + 14
            }
        }
    }

    static __getFileDescriptors(esValue, action) {
        if(action.args.properties) {
            return action.args.properties.map((property) => {
                return {
                    "className": property.type ? property.type : "String",
                    "isCopy": false,
                    "isKey": property.isKey ? true : false,
                    "name": property.name,
                    "nameCamelCase": changeCase.camelCase(property.name),
                    "namePascalCase": changeCase.pascalCase(property.name),
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            })
        }

        
        let targetFieldDescriptors = esValue.elements[action.ids.aggregateId].aggregateRoot.fieldDescriptors
        if(action.args.api_verb == "DELETE")
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
}

module.exports = CommandActionsProcessor