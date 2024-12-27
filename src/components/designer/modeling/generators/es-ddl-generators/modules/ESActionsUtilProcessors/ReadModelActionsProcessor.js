const changeCase = require('change-case');
const pluralize = require('pluralize');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')
const ActorProcessor = require('./ActorProcessor')

class ReadModelActionsProcessor {
    static getActionAppliedESValue(action, userInfo, esValue, callbacks) {
        switch(action.type) {
            case "create":
                ReadModelActionsProcessor._createReadModel(action, userInfo, esValue, callbacks)
                break
        }
    }

    static _createReadModel(action, userInfo, esValue, callbacks) {
        const readModelObject = ReadModelActionsProcessor.__getReadModelBase(
            userInfo, action.args.readModelName,
            action.args.readModelAlias ? action.args.readModelAlias : "", 
            action.args.isMultipleResult, action.ids.boundedContextId,
            action.ids.aggregateId, 0, 0, action.ids.readModelId
        )

        const VALID_POSITION = ReadModelActionsProcessor.__getValidPosition(esValue, action, readModelObject)
        readModelObject.elementView.x = VALID_POSITION.x
        readModelObject.elementView.y = VALID_POSITION.y
        callbacks.afterAllRelationAppliedCallBacks.push((esValue) => {
            ActorProcessor.makeActorToCommand(esValue, action, readModelObject, userInfo)
        })

        readModelObject.queryParameters = ReadModelActionsProcessor.__getQueryParameters(esValue, action)
        esValue.elements[readModelObject.id] = readModelObject
        ActionsProcessorUtils.reseizeAggregateVertically(esValue, readModelObject)
    }

    static __getReadModelBase(userInfo, name, displayName, isMultipleResult, boundedContextId, aggregateId, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()

        return {
            "_type": "org.uengine.modeling.model.View",
            "id": elementUUIDtoUse,
            "visibility": "public",
            "name": name,
            "oldName": "",
            "displayName": displayName,
            "namePascalCase": changeCase.pascalCase(name),
            "namePlural": pluralize(changeCase.camelCase(name)),
            "aggregate": {
                "id": aggregateId
            },
            "description": null,
            "author": userInfo.uid,
            "boundedContext": {
                "id": boundedContextId
            },
            "fieldDescriptors": [
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "name": "id",
                    "className": "Long",
                    "nameCamelCase": "id",
                    "namePascalCase": "Id",
                    "isKey": true
                }
            ],
            "queryParameters": [],
            "queryOption": {
                "apiPath": "",
                "useDefaultUri": true,
                "multipleResult": isMultipleResult
            },
            "controllerInfo": {
                "url": ""
            },
            "elementView": {
                "_type": "org.uengine.modeling.model.View",
                "id": elementUUIDtoUse,
                "x": x,
                "y": y,
                "width": 100,
                "height": 115,
                "style": "{}",
                "z-index": 999
            },
            "editingView": false,
            "dataProjection": "query-for-aggregate",
            "createRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "CREATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "updateRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "UPDATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "deleteRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "DELETE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "rotateStatus": false,
            "definitionId": ""
        }
    }

    static __getValidPosition(esValue, action, readModelObject) {
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
                y: maxY + Math.round(maxYModel.elementView.height/2) + Math.round(readModelObject.elementView.height/2) + 14
            }
        }
    }

    static __getQueryParameters(esValue, action) {
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

module.exports = ReadModelActionsProcessor