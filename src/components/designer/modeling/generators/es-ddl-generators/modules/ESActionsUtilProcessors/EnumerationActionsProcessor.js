const changeCase = require('change-case');
const pluralize = require('pluralize');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')

class EnumerationActionsProcessor {
    static getActionAppliedESValue(action, esValue, callbacks) {
        switch(action.type) {
            case "create":
                EnumerationActionsProcessor._createEnumeration(action, callbacks)
                break
            case "update":
                EnumerationActionsProcessor._updateEnumeration(action, esValue, callbacks)
                break
        }
    }
    

    static _createEnumeration(action, callbacks) {
        callbacks.afterAllObjectAppliedCallBacks.push((esValue) => {
            const enumObject = EnumerationActionsProcessor.__getEnumerationBase(
                action.args.enumerationName, 
                action.args.enumerationAlias ? action.args.enumerationAlias : "",
                action.args.properties ? action.args.properties.map(property => {return {"value": property.name}}) : [],
                0, 0,
                action.ids.enumerationId
            )

            const VALID_POSITION = EnumerationActionsProcessor.__getValidPosition(esValue, action)
            enumObject.elementView.x = VALID_POSITION.x
            enumObject.elementView.y = VALID_POSITION.y

            let entities = ActionsProcessorUtils.getEntitiesForAggregate(esValue, action.ids.aggregateId)
            entities.elements[enumObject.id] = enumObject
        })
    }

    static __getEnumerationBase(name, displayName, items, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()
        return {
            "_type": "org.uengine.uml.model.enum",
            "id": elementUUIDtoUse,
            "name": name,
            "displayName": displayName,
            "nameCamelCase": changeCase.camelCase(name),
            "namePascalCase": changeCase.pascalCase(name),
            "namePlural": pluralize(changeCase.camelCase(name)),
            "elementView": {
                "_type": "org.uengine.uml.model.enum",
                "id": elementUUIDtoUse,
                "x": x,
                "y": y,
                "width": 200,
                "height": 100,
                "style": "{}",
                "titleH": 50,
                "subEdgeH": 50
            },
            "selected": false,
            "items": items,
            "useKeyValue": false,
            "relations": []
        }
    }

    static __getValidPosition(esValue, action) {
        const relatedEnums = ActionsProcessorUtils.getRelatedEnumerations(esValue, action)
        return {x: 700 + (relatedEnums.length * 250), y: 456}
    }


    static _updateEnumeration(action, esValue, callbacks) {
        const targetAggregate = esValue.elements[action.ids.aggregateId]
        if(!targetAggregate || !targetAggregate.aggregateRoot || 
           !targetAggregate.aggregateRoot.entities || !targetAggregate.aggregateRoot.entities.elements) return

        const targetEnumeration = targetAggregate.aggregateRoot.entities.elements[action.ids.enumerationId]
        if(!targetEnumeration) return

        if(action.args.properties) {
            targetEnumeration.items = targetEnumeration.items.concat(action.args.properties.map(property => {return {"value": property.name}}))
            targetAggregate.aggregateRoot.entities.elements[action.ids.enumerationId] = {...targetEnumeration}
        }
    }
}

module.exports = EnumerationActionsProcessor