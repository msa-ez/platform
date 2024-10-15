const GlobalPromptUtil = require('../GlobalPromptUtil')

class ActorProcessor {
    static makeActorToCommand(esValue, action, commandObject, userInfo) {
        if(ActorProcessor._getRelatedPolicies(esValue, commandObject).length > 0) return
        if(!(action.args.actor)) return
        
        const actorBase = ActorProcessor._getActorBase(userInfo, action.args.actor, action.ids.boundedContextId, 0, 0)
        const VALID_POSITION = ActorProcessor._getValidPosition(commandObject, actorBase)
        actorBase.elementView.x = VALID_POSITION.x
        actorBase.elementView.y = VALID_POSITION.y

        esValue.elements[actorBase.id] = actorBase
    }

    static _getRelatedPolicies(esValue, commandObject) {
        return Object.values(esValue.relations).filter(relation => {
            return relation && relation.targetElement.id === commandObject.id && 
                relation.sourceElement._type === "org.uengine.modeling.model.Policy"
        })
    }

    static _getActorBase(userInfo, actorName, boundedContextId, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID()
        return {
            _type:"org.uengine.modeling.model.Actor",
            author: userInfo.uid,
            boundedContext: {
                id: boundedContextId
            },
            description: null,
            id: elementUUIDtoUse,
            elementView: {
                _type: "org.uengine.modeling.model.Actor",
                height: 100,
                id: elementUUIDtoUse,
                style: "{}",
                width: 100,
                x: x,
                y: y
            },
            innerAggregate: {
                command: [],
                event: [],
                external: [],
                policy: [],
                view: [],
            },
            name: actorName,
            oldName: "",
            rotateStatus: false
        }
    }

    static _getValidPosition(commandObject, actorObject) {
        return {
            x: commandObject.elementView.x - Math.round(commandObject.elementView.width/2) - Math.round(actorObject.elementView.width/2) + 19,
            y: commandObject.elementView.y
        }
    }
}

module.exports = ActorProcessor