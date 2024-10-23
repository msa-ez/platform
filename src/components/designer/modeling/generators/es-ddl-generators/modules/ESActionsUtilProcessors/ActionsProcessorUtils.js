const changeCase = require('change-case');
const GlobalPromptUtil = require('../GlobalPromptUtil');

class ActionsProcessorUtils {
    static getAllBoundedContexts(esValue) {
        return Object.values(esValue.elements).filter(element => element && element._type === "org.uengine.modeling.model.BoundedContext")
    }

    static getAllElementsInBoundedContext(esValue, boundedContextId) {
        return Object.values(esValue.elements)
            .filter(element => element && element.boundedContext && element.boundedContext.id === boundedContextId)
    }

    static getElementIdsInBoundedContext(esValue, boundedContextId) {
        return ActionsProcessorUtils.getAllElementsInBoundedContext(esValue, boundedContextId).map(element => element.id)
    }

    static getAllAggregatesInBoundedContext(esValue, boundedContextId) {
        return Object.values(esValue.elements)
            .filter(element => element && element._type === "org.uengine.modeling.model.Aggregate" && element.boundedContext.id === boundedContextId)
    }


    static getEntitiesForAggregate(esValue, aggregateId) {
        const entities = esValue.elements[aggregateId].aggregateRoot.entities
        if(!entities.elements) entities.elements = {}
        if(!entities.relations) entities.relations = {}
        return entities
    }

    static getAggregateRootObject(aggregateObject) {
        if(!aggregateObject.aggregateRoot || !aggregateObject.aggregateRoot.entities || !aggregateObject.aggregateRoot.entities.elements) return null
        return Object.values(aggregateObject.aggregateRoot.entities.elements).find(entity => entity.isAggregateRoot)
    }

    static getAggregateCommands(esValue, targetAggregateId) {
        return Object.values(esValue.elements).filter((element) => {
            return element &&
                element._type === "org.uengine.modeling.model.Command" &&
                element.aggregate &&
                element.aggregate.id === targetAggregateId
        })
    }

    static getAggregateEvents (esValue, targetAggregateId) {
        return Object.values(esValue.elements).filter((element) => {
            return element &&
                element._type === "org.uengine.modeling.model.Event" &&
                element.aggregate &&
                element.aggregate.id === targetAggregateId
        })
    }

    static getRelatedValueObjects (esValue, aggregateId) {
        let relatedValueObjects = []
        for(const element of Object.values(ActionsProcessorUtils.getEntitiesForAggregate(esValue, aggregateId).elements)) {
            if(element && element._type === "org.uengine.uml.model.vo.Class")
                relatedValueObjects.push(element)
        }
        return relatedValueObjects
    }

    static getRelatedEnumerations(esValue, action) {
        let relatedEnums = []
        for(const element of Object.values(ActionsProcessorUtils.getEntitiesForAggregate(esValue, action.ids.aggregateId).elements)) {
            if(element && element._type === "org.uengine.uml.model.enum")
                relatedEnums.push(element)
        }
        return relatedEnums
    }


    static addEntityPropertyToAggregateIfNotExist (esValue, targetAggregateId, propertyName) {
        const aggregate = esValue.elements[targetAggregateId]
        const aggregateRootObject = ActionsProcessorUtils.getAggregateRootObject(aggregate)
        const aggregateCommands = ActionsProcessorUtils.getAggregateCommands(esValue, targetAggregateId)
        const aggregateEvents = ActionsProcessorUtils.getAggregateEvents(esValue, targetAggregateId)

        ActionsProcessorUtils._addPropertyIfNotExist(aggregate.aggregateRoot.fieldDescriptors, propertyName, true)
        if(aggregateRootObject) ActionsProcessorUtils._addPropertyIfNotExist(aggregateRootObject.fieldDescriptors, propertyName, true)
        aggregateCommands.map(command => {
            if(command.isRestRepository && command.controllerInfo.method === "POST")
                ActionsProcessorUtils._addPropertyIfNotExist(command.fieldDescriptors, propertyName, false)
        })
        aggregateEvents.map(event => {
            if(ActionsProcessorUtils.isRelatedByPostCommand(esValue, event))
                ActionsProcessorUtils._addPropertyIfNotExist(event.fieldDescriptors, propertyName, false)
        })
    }

    static _addPropertyIfNotExist(targetFileDescriptor, propertyName, isFromAggregate) {
        if(targetFileDescriptor.find(property => property.className === propertyName)) return

        let fieldDescriptorToPush = {
            "className": propertyName,
            "isCopy": false,
            "isKey": false,
            "name": changeCase.camelCase(propertyName),
            "displayName": "",
            "nameCamelCase": changeCase.camelCase(propertyName),
            "namePascalCase": changeCase.pascalCase(propertyName),
            "_type": "org.uengine.model.FieldDescriptor"
        }
        if(isFromAggregate) {
            fieldDescriptorToPush["inputUI"] = null
            fieldDescriptorToPush["options"] = null
        }
        targetFileDescriptor.push(fieldDescriptorToPush)
    }


    static isRelatedByDeleteCommand(esValue, event) {
        return Object.values(esValue.relations).some(relation => {
            return relation &&
                relation._type === "org.uengine.modeling.model.Relation" &&
                relation.sourceElement &&
                relation.sourceElement._type === "org.uengine.modeling.model.Command" &&
                relation.sourceElement.isRestRepository &&
                relation.sourceElement.controllerInfo.method === "DELETE" &&
                relation.targetElement &&
                relation.targetElement.id === event.id
        })
    }

    static isRelatedByPostCommand(esValue, event) {
        return Object.values(esValue.relations).some(relation => {
            return relation &&
                relation._type === "org.uengine.modeling.model.Relation" &&
                relation.sourceElement &&
                relation.sourceElement._type === "org.uengine.modeling.model.Command" &&
                relation.sourceElement.isRestRepository &&
                relation.sourceElement.controllerInfo.method === "POST" &&
                relation.targetElement &&
                relation.targetElement.id === event.id
        })
    }

    
    /**
     * 주어진 Aggregate 내부의 Element가 Aggregate나 Bounded Context를 벗어나지 않도록 수직으로 크기를 재조정 함
     */
    static reseizeAggregateVertically(esValue, aggElementObject) {
        const RESIZE_HEIGHT = 150

        const bcObject = esValue.elements[aggElementObject.boundedContext.id]
        const aggObject = esValue.elements[aggElementObject.aggregate.id]
        if(!bcObject || !aggObject) return
        if(aggElementObject.elementView.y <= aggObject.elementView.y + Math.round(aggObject.elementView.height/2)) return

        if(aggObject.elementView.y + Math.round(aggObject.elementView.height/2) + RESIZE_HEIGHT > bcObject.elementView.y + Math.round(bcObject.elementView.height/2)) {
            const BC_RESIZE_HEIGHT = Math.round(RESIZE_HEIGHT * 0.90)
            bcObject.elementView.height += BC_RESIZE_HEIGHT
            bcObject.elementView.y += Math.round(BC_RESIZE_HEIGHT/2)
            esValue.elements[bcObject.id] = {...bcObject}
        }

        aggObject.elementView.height += RESIZE_HEIGHT
        aggObject.elementView.y += Math.round(RESIZE_HEIGHT/2)
        esValue.elements[aggObject.id] = {...aggObject}

        for(const bcElement of ActionsProcessorUtils._getAllBcBelowBc(esValue, bcObject)) {
            bcElement.elementView.y += RESIZE_HEIGHT
            esValue.elements[bcElement.id] = {...bcElement}

            for(const elementInBc of ActionsProcessorUtils.getAllElementsInBoundedContext(esValue, bcElement.id)) {
                elementInBc.elementView.y += RESIZE_HEIGHT
                esValue.elements[elementInBc.id] = {...elementInBc}
            }
        }
    }

    static _getAllBcBelowBc(esValue, bcObject) {
        let targetElements = []

        for(const element of Object.values(esValue.elements)) {
            if(element && element._type === "org.uengine.modeling.model.BoundedContext" &&
               element.id !== bcObject.id &&
               element.elementView.y >= bcObject.elementView.y &&
               element.elementView.x >= bcObject.elementView.x - Math.round(bcObject.elementView.width/2) && element.elementView.x <= bcObject.elementView.x + Math.round(bcObject.elementView.width/2))
                targetElements.push(element)
        }

        return targetElements
    }


    static getEventStormingRelationObjectBase(fromObject, toObject) {
        const elementUUIDtoUse = GlobalPromptUtil.getUUID()
        const FROM_OBJECT_ID = fromObject.id ? fromObject.id : fromObject.elementView.id
        const TO_OBJECT_ID = toObject.id ? toObject.id : toObject.elementView.id
        return {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": elementUUIDtoUse,
            "sourceElement": fromObject,
            "targetElement": toObject,
            "from": FROM_OBJECT_ID,
            "to": TO_OBJECT_ID,
            "relationView": {
                "id": elementUUIDtoUse,
                "style": `{"arrow-start":"none","arrow-end":"none"}`,
                "from": FROM_OBJECT_ID,
                "to": TO_OBJECT_ID,
                "needReconnect": true,
                "value": "[]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": FROM_OBJECT_ID,
                "id": elementUUIDtoUse,
                "needReconnect": true,
                "style": `{"arrow-start":"none","arrow-end":"none"}`,
                "to": TO_OBJECT_ID,
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
        }
    }
}

module.exports = ActionsProcessorUtils