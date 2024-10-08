const changeCase = require('change-case');

class ActionsProcessorUtils {
    static getAllBoundedContexts(esValue) {
        return Object.values(esValue.elements).filter(element => element && element._type === "org.uengine.modeling.model.BoundedContext")
    }

    static getElementIdsInBoundedContext(esValue, boundedContextId) {
        return Object.values(esValue.elements)
            .filter(element => element && element.boundedContext && element.boundedContext.id === boundedContextId)
            .map(element => element.id)
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
            ActionsProcessorUtils._addPropertyIfNotExist(command.fieldDescriptors, propertyName, false)
        })
        aggregateEvents.map(event => {
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
}

module.exports = ActionsProcessorUtils