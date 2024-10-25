const changeCase = require('change-case');
const pluralize = require('pluralize');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')

class AggregateActionsProcessor {
    static getActionAppliedESValue(action, userInfo, esValue, callbacks) {
        switch(action.type) {
            case "create":
                AggregateActionsProcessor._createAggregate(action, userInfo, esValue, callbacks)
                break
            
            case "update":
                AggregateActionsProcessor._updateAggregate(action, userInfo, esValue, callbacks)
                break
        }
    }


    static _createAggregate(action, userInfo, esValue, callbacks) {
        let aggregateObject = AggregateActionsProcessor.__getAggregateBase(
            userInfo, action.args.aggregateName, "", 
            action.ids.boundedContextId, 0, 0, action.ids.aggregateId
        )

        const VALID_POSITION = AggregateActionsProcessor.__getValidPosition(esValue, action, aggregateObject)
        aggregateObject.elementView.x = VALID_POSITION.x
        aggregateObject.elementView.y = VALID_POSITION.y

        action.args.properties = AggregateActionsProcessor.__makePrimaryKeyPropertyIfNotExists(action.args.properties)
        aggregateObject.aggregateRoot.fieldDescriptors = AggregateActionsProcessor.__getFileDescriptors(action.args.properties)
        
        AggregateActionsProcessor.__relocateUIPositions(esValue, action, aggregateObject)
        esValue.elements[aggregateObject.id] = aggregateObject


        const rootAggregateObject = AggregateActionsProcessor.__getRootAggregateBase(action.args.aggregateName, aggregateObject.id,
            AggregateActionsProcessor.__getFileDescriptorsForRootAggegate(action.args.properties)
        )
        aggregateObject.aggregateRoot.entities.elements[rootAggregateObject.id] = rootAggregateObject
    }

    static __getAggregateBase(userInfo, name, displayName, boundedContextId, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID();
        return {
            aggregateRoot: {
                _type: 'org.uengine.modeling.model.AggregateRoot', 
                fieldDescriptors: [],
                entities: {
                    elements: {},
                    relations: {}
                }, 
                operations: [],
            },
            author: userInfo.uid,
            boundedContext: {
                name: boundedContextId,
                id: boundedContextId
            },
            commands: [],
            description: null,
            id: elementUUIDtoUse, 
            elementView: {
                _type: 'org.uengine.modeling.model.Aggregate', 
                id: elementUUIDtoUse, 
                x: x, 
                y: y,
                width: 130,
                height: 400,
                _type: "org.uengine.modeling.model.Aggregate"
            },
            events: [],
            hexagonalView: {
                _type: 'org.uengine.modeling.model.AggregateHexagonal', 
                id: elementUUIDtoUse, 
                x: 0, 
                y: 0, 
                subWidth: 0,
                width: 0,
                x: 0,
                y: 0,
                _type: "org.uengine.modeling.model.AggregateHexagonal"
            },
            name: name,
            displayName: displayName,
            nameCamelCase: changeCase.camelCase(name),
            namePascalCase: changeCase.pascalCase(name),
            namePlural: pluralize(changeCase.camelCase(name)),
            rotateStatus: false,
            selected: false,
            _type: "org.uengine.modeling.model.Aggregate"
        }
    }

    static __getValidPosition(esValue, action, aggregateObject) {  
        const aggregates = ActionsProcessorUtils.getAllAggregatesInBoundedContext(esValue, action.ids.boundedContextId)
        if(aggregates.length <= 0) {
            const currentBoundedContext = esValue.elements[action.ids.boundedContextId]
            return {x: currentBoundedContext.elementView.x, y: currentBoundedContext.elementView.y}
        }
        else {
            const maxX = Math.max(...aggregates.map(agg => agg.elementView.x))
            const minY = Math.min(...aggregates.map(agg => agg.elementView.y))

            const maxXAggregate = aggregates.filter(agg => agg.elementView.x === maxX)[0]
            return {x: maxX + Math.round(maxXAggregate.elementView.width/2) 
                   + Math.round(aggregateObject.elementView.width/2) + 300, y: minY}
        }
    }

    static __makePrimaryKeyPropertyIfNotExists(properties) {
        if(properties.find(property => property.isKey)) return properties
        return [{name: "id", type: "Long", isKey: true}].concat(properties)
    }

    static __relocateUIPositions(esValue, action, aggregateObject) {
        const getTargetBoundedContextIds = (esValue, currentBoundedContext) => {
            let targetBoundedContextIds = []
            for(const element of Object.values(esValue.elements)) {
                if(element && element._type === "org.uengine.modeling.model.BoundedContext" && element.id !== currentBoundedContext.id)
                {
                    if((currentBoundedContext.elementView.x < element.elementView.x) && 
                       (currentBoundedContext.elementView.y + currentBoundedContext.elementView.height/2 > element.elementView.y) &&
                       (currentBoundedContext.elementView.y - currentBoundedContext.elementView.height/2 < element.elementView.y))
                       targetBoundedContextIds.push(element.id)
                }
            }
            return targetBoundedContextIds
        }

        const aggregates = ActionsProcessorUtils.getAllAggregatesInBoundedContext(esValue, action.ids.boundedContextId)
        if(aggregates.length <= 0) return

        const currentBoundedContext = esValue.elements[action.ids.boundedContextId]
        for(const boundedContextId of getTargetBoundedContextIds(esValue, currentBoundedContext)) {
            const boundedContext = esValue.elements[boundedContextId]
            boundedContext.elementView.x = boundedContext.elementView.x + 450
            esValue.elements[boundedContextId] = {...boundedContext}

            for(const elementId of ActionsProcessorUtils.getElementIdsInBoundedContext(esValue, boundedContextId)) {
                const element = esValue.elements[elementId]
                element.elementView.x = element.elementView.x + 450
                esValue.elements[elementId] = {...element}
            }
        }

        currentBoundedContext.elementView.x = currentBoundedContext.elementView.x + 225
        currentBoundedContext.elementView.width = currentBoundedContext.elementView.width + 450
        currentBoundedContext.aggregates = [...currentBoundedContext.aggregates, {"id": aggregateObject.id}]
        esValue.elements[action.ids.boundedContextId] = {...currentBoundedContext}
    }

    static __getFileDescriptorsForRootAggegate(actionProperties) {
        return actionProperties.map((property) => {
            return {
                "className": property.type ? property.type : "String",
                "isCopy": false,
                "isKey": property.isKey ? true : false,
                "name": property.name,
                "displayName": "",
                "nameCamelCase": changeCase.camelCase(property.name),
                "namePascalCase": changeCase.pascalCase(property.name),
                "_type": "org.uengine.model.FieldDescriptor",
                "inputUI": null,
                "options": null
            }
        })
    }

    static __getRootAggregateBase(name, aggregateId, fieldDescriptors, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()

        return {
            "_type": "org.uengine.uml.model.Class",
            "id": elementUUIDtoUse,
            "name": name,
            "namePascalCase": changeCase.pascalCase(name),
            "nameCamelCase": changeCase.camelCase(name),
            "namePlural": name+ "s",
            "fieldDescriptors": fieldDescriptors,
            "operations": [],
            "elementView": {
                "_type": "org.uengine.uml.model.Class",
                "id": elementUUIDtoUse,
                "x": 200,
                "y": 200,
                "width": 200,
                "height": 100,
                "style": "{}",
                "titleH": 50,
                "subEdgeH": 120,
                "fieldH": 90,
                "methodH": 30
            },
            "selected": false,
            "relations": [],
            "parentOperations": [],
            "relationType": null,
            "isVO": false,
            "isAbstract": false,
            "isInterface": false,
            "isAggregateRoot": true,
            "parentId": aggregateId
        }
    }


    static _updateAggregate(action, userInfo, esValue, callbacks) {
        if(action.args.properties) {
            const aggregateObject = esValue.elements[action.ids.aggregateId]
            aggregateObject.aggregateRoot.fieldDescriptors = aggregateObject.aggregateRoot.fieldDescriptors.concat(AggregateActionsProcessor.__getFileDescriptors(action.args.properties))

            const aggregateRootObject = ActionsProcessorUtils.getAggregateRootObject(aggregateObject)
            if(aggregateRootObject) {
                aggregateRootObject.fieldDescriptors = aggregateRootObject.fieldDescriptors.concat(AggregateActionsProcessor.__getFileDescriptors(action.args.properties))
            }
            
            esValue.elements[action.ids.aggregateId] = {...aggregateObject}
        }
    }


    static __getFileDescriptors(actionProperties) {
        return actionProperties.map((property) => {
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
}

module.exports = AggregateActionsProcessor