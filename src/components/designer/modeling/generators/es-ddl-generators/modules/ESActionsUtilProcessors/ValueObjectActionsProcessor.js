const changeCase = require('change-case');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')

class ValueObjectActionsProcessor {
    static getActionAppliedESValue(action, callbacks) {
        switch(action.type) {
            case "create":
                ValueObjectActionsProcessor._createValueObject(action, callbacks)
                break
        }
    }

    static _createValueObject(action, callbacks) {
        callbacks.afterAllObjectAppliedCallBacks.push((esValue) => {
            const valueObject = ValueObjectActionsProcessor.__getValueObjectBase(
                action.args.valueObjectName, 
                ValueObjectActionsProcessor.__getFileDescriptors(action.args.properties),
                0, 0, action.ids.valueObjectId
            )

            const VALID_POSITION = ValueObjectActionsProcessor.__getValidPosition(esValue, action)
            valueObject.elementView.x = VALID_POSITION.x
            valueObject.elementView.y = VALID_POSITION.y
            
            let entities = ActionsProcessorUtils.getEntitiesForAggregate(esValue, action.ids.aggregateId)
            entities.elements[valueObject.id] = valueObject
            
            ActionsProcessorUtils.addEntityPropertyToAggregateIfNotExist(esValue, action.ids.aggregateId, valueObject.name)
        })
    }

    static __getValueObjectBase (name, fieldDescriptors, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()
        return {
            "_type": "org.uengine.uml.model.vo.Class",
            "id": elementUUIDtoUse,
            "name": name,
            "namePascalCase": changeCase.pascalCase(name),
            "nameCamelCase": changeCase.camelCase(name),
            "fieldDescriptors": fieldDescriptors,
            "operations": [],
            "elementView": {
                "_type": "org.uengine.uml.model.vo.address.Class",
                "id": elementUUIDtoUse,
                "x": x,
                "y": y,
                "width": 200,
                "height": 100,
                "style": "{}",
                "titleH": 50,
                "subEdgeH": 170,
                "fieldH": 150,
                "methodH": 30
            },
            "selected": false,
            "parentOperations": [],
            "relationType": null,
            "isVO": true,
            "relations": [],
            "groupElement": null,
            "isAggregateRoot": false,
            "namePlural": name+ "s",
            "isAbstract": false,
            "isInterface": false
        }
    }

    static __getFileDescriptors(actionProperties) {
        return actionProperties.filter(property => !property.isForeignProperty).map((property) => {
            return {
                "className": property.type ? property.type : "String",
                "isKey": property.isKey ? true : false,
                "label": "- " + property.name + ": " + (property.type ? property.type : "String"),
                "name": property.name,
                "nameCamelCase": changeCase.pascalCase(property.name),
                "namePascalCase": changeCase.camelCase(property.name),
                "_type": "org.uengine.model.FieldDescriptor"
            }
        })
    }

    static __getValidPosition(esValue, action) {
        const relatedValueObjects = ActionsProcessorUtils.getRelatedValueObjects(esValue, action.ids.aggregateId)
        return {x: 700 + (relatedValueObjects.length * 250), y: 152}
    }
}

module.exports = ValueObjectActionsProcessor