const changeCase = require('change-case');
const pluralize = require('pluralize');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')

class GeneralClassActionsProcessor {
    static getActionAppliedESValue(action, esValue, callbacks) {
        switch(action.type) {
            case "create":
                GeneralClassActionsProcessor._createGeneralClass(action, callbacks)
                break

            case "update":
                GeneralClassActionsProcessor._updateGeneralClass(action, esValue, callbacks)
                break
        }
    }

    
    static _createGeneralClass(action, callbacks) {
        const generalClass = GeneralClassActionsProcessor.__getGeneralClassBase(
            action.args.generalClassName, 
            action.args.generalClassAlias ? action.args.generalClassAlias : "",
            GeneralClassActionsProcessor.__getFileDescriptors(action.args.properties),
            0, 0, action.ids.generalClassId
        )

        callbacks.afterAllObjectAppliedCallBacks.push((esValue) => {
            const VALID_POSITION = GeneralClassActionsProcessor.__getValidPosition(esValue, action)
            generalClass.elementView.x = VALID_POSITION.x
            generalClass.elementView.y = VALID_POSITION.y
            
            let entities = ActionsProcessorUtils.getEntitiesForAggregate(esValue, action.ids.aggregateId)
            entities.elements[generalClass.id] = generalClass
        })

        GeneralClassActionsProcessor.__makeRelations(action, generalClass, callbacks)
    }

    static __getGeneralClassBase(name, displayName, fieldDescriptors, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()
        return {
            "_type": "org.uengine.uml.model.Class",
            "id": elementUUIDtoUse,
            "name": name,
            "displayName": displayName,
            "namePascalCase": changeCase.pascalCase(name),
            "nameCamelCase": changeCase.camelCase(name),
            "namePlural": pluralize(changeCase.camelCase(name)),
            "fieldDescriptors": fieldDescriptors,
            "operations": [],
            "elementView": {
                "_type": "org.uengine.uml.model.Class",
                "id": elementUUIDtoUse,
                "x": x,
                "y": y,
                "width": 200,
                "height": 150,
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
            "isAggregateRoot": false
        }
    }

    static __getValidPosition(esValue, action) {
        const relatedGeneralClasses = ActionsProcessorUtils.getRelatedGeneralClasses(esValue, action)
        return {x: 700 + (relatedGeneralClasses.length * 250), y: 760}
    }


    static _updateGeneralClass(action, esValue, callbacks) {
        const targetAggregate = esValue.elements[action.ids.aggregateId]
        if(!targetAggregate || !targetAggregate.aggregateRoot || 
           !targetAggregate.aggregateRoot.entities || !targetAggregate.aggregateRoot.entities.elements) return

        const targetGeneralClass = targetAggregate.aggregateRoot.entities.elements[action.ids.generalClassId]
        if(!targetGeneralClass) return
        
        if(action.args.properties) {
            targetGeneralClass.fieldDescriptors = targetGeneralClass.fieldDescriptors.concat(GeneralClassActionsProcessor.__getFileDescriptors(action.args.properties))
            targetAggregate.aggregateRoot.entities.elements[action.ids.generalClassId] = {...targetGeneralClass}

            GeneralClassActionsProcessor.__makeRelations(action, targetGeneralClass, callbacks)
        }
    }


    static __getFileDescriptors(actionProperties) {
        return actionProperties.filter(property => !property.isForeignProperty).map((property) => {
            return {
                "_type": "org.uengine.model.FieldDescriptor",
                "name": property.name,
                "nameCamelCase": changeCase.pascalCase(property.name),
                "namePascalCase": changeCase.camelCase(property.name),
                "className": property.type ? property.type : "String",
                "isKey": property.isKey ? true : false,
                "isName": false,
                "isList": false,
                "isVO": false,
                "isLob": false,
                "isCorrelationKey": false,
                "label": "- " + property.name + ": " + (property.type ? property.type : "String")
            }
        })
    }

    static __makeRelations(action, generalClass, callbacks) {
        callbacks.afterAllRelationAppliedCallBacks.push((esValue) => {
            let entities = ActionsProcessorUtils.getEntitiesForAggregate(esValue, action.ids.aggregateId)
            const sourceElement = entities.elements[generalClass.id]
            if(!sourceElement) return

            for(const fieldDescriptor of sourceElement.fieldDescriptors) {
                let matchedElement = null
                for(const element of Object.values(entities.elements).filter(element => element)) {
                    if(fieldDescriptor.className === element.name) {
                        matchedElement = element
                        break
                    }
                }
                if(!matchedElement) continue

                let isRelationAlreadyExists = false
                for(const relation of Object.values(entities.relations).filter(relation => relation)) {
                    if(relation.from === sourceElement.id && relation.to === matchedElement.id) {
                        isRelationAlreadyExists = true
                        break
                    }
                }
                if(isRelationAlreadyExists) continue

                if(matchedElement) {
                    const ddlRelationObject = ActionsProcessorUtils.getDDLRelationObjectBase(sourceElement, matchedElement)

                    if(!sourceElement.relations) sourceElement.relations = []
                    sourceElement.relations.push(ddlRelationObject.id)

                    if(!matchedElement.relations) matchedElement.relations = []
                    matchedElement.relations.push(ddlRelationObject.id)

                    entities.relations[ddlRelationObject.id] = ddlRelationObject

                    
                    sourceElement.fieldDescriptors = sourceElement.fieldDescriptors.filter(fieldDescriptor => fieldDescriptor.className !== matchedElement.name)
                }
            }
        })
    }
}

module.exports = GeneralClassActionsProcessor