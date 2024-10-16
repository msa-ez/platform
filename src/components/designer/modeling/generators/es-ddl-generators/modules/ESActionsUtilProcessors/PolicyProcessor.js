const changeCase = require('change-case');
const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')

class PolicyProcessor {
    static createNewPolicy(esValue, userInfo, eventObject, commandId, updateReason) {
        const commandObject = esValue.elements[commandId]
        if(!commandObject || !eventObject) return
        if(commandObject.aggregate.id === eventObject.aggregate.id) return

        const policyObject = PolicyProcessor._getPolicyBase(
            userInfo, commandObject.name + " Policy", commandObject.name + " Policy", 
            commandObject.boundedContext.id, updateReason, 0, 0
        )

        esValue.elements[policyObject.id] = policyObject

        PolicyProcessor._makeEventToPolicyRelation(esValue, eventObject, policyObject)
        PolicyProcessor._makePolicyToCommandRelation(esValue, policyObject, commandObject)

        const VALID_POSITION = PolicyProcessor._getValidPosition(esValue, commandObject.aggregate.id, policyObject)
        policyObject.elementView.x = VALID_POSITION.x
        policyObject.elementView.y = VALID_POSITION.y
    }

    static _getPolicyBase(userInfo, name, displayName, boundedContextId, updateReason, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()
        return {
            id: elementUUIDtoUse,
            author: userInfo.uid,
            boundedContext: {
                id: boundedContextId
            },
            description: updateReason ? updateReason : null,
            elementView: {
                height: 115,
                width: 100,
                x: x,
                y: y,
                id: elementUUIDtoUse,
                style: "{}",
                _type: "org.uengine.modeling.model.Policy"
            },
            fieldDescriptors: [],
            hexagonalView: {
                height: 20,
                id: elementUUIDtoUse,
                style: "{}",
                subWidth: 100,
                width: 20,
                _type: "org.uengine.modeling.model.PolicyHexagonal"
            },
            isSaga: false,
            name: name,
            displayName: displayName,
            nameCamelCase: changeCase.camelCase(name),
            namePascalCase: changeCase.pascalCase(name),
            namePlural: "",
            oldName: "",
            rotateStatus: false,
            _type: "org.uengine.modeling.model.Policy"
        } 
    }

    static _makeEventToPolicyRelation(esValue, eventObject, policyObject) {
        if(!esValue.elements[eventObject.id] || !esValue.elements[policyObject.id]) return

        const eventPolicyRelation = ActionsProcessorUtils.getEventStormingRelationObjectBase(
            esValue.elements[eventObject.id], esValue.elements[policyObject.id])
        esValue.relations[eventPolicyRelation.id] = eventPolicyRelation
    }

    static _makePolicyToCommandRelation(esValue, policyObject, commandObject) {
        if(!esValue.elements[policyObject.id] || !esValue.elements[commandObject.id]) return

        const policyCommandRelation = ActionsProcessorUtils.getEventStormingRelationObjectBase(
            esValue.elements[policyObject.id], esValue.elements[commandObject.id])
        esValue.relations[policyCommandRelation.id] = policyCommandRelation
    }

    static _getValidPosition(esValue, aggregateId, policyObject) {
        const relatedCommands = PolicyProcessor.__getRelatedCommands(esValue, policyObject)
        if(relatedCommands.length <= 0) {
            const currentAggregate = esValue.elements[aggregateId]
            return {
                x: currentAggregate.elementView.x - Math.round(currentAggregate.elementView.width/2) - 148,
                y: currentAggregate.elementView.y - Math.round(currentAggregate.elementView.height/2)
            }
        }
        else {
            const minX = Math.min(...relatedCommands.map(command => command.elementView.x))
            const maxY = Math.max(...relatedCommands.map(command => command.elementView.y))

            const maxYCommand = relatedCommands.filter(command => command.elementView.y === maxY)[0]
            return {
                x: minX - Math.round(policyObject.elementView.width/2) - Math.round(maxYCommand.elementView.width/2) - 19,
                y: maxY
            }
        }
    }

    static __getRelatedCommands(esValue, policyObject) {
        let relatedCommands = []
        for(const relation of Object.values(esValue.relations)) {
            if(relation && relation._type === "org.uengine.modeling.model.Relation" && 
              (relation.sourceElement.id === policyObject.id || relation.sourceElement.id === policyObject.elementView.id) && 
              (relation.targetElement._type === "org.uengine.modeling.model.Command")) {
                relatedCommands.push(esValue.elements[relation.targetElement.id])
            }
        }
        return relatedCommands
    }
}

module.exports = PolicyProcessor