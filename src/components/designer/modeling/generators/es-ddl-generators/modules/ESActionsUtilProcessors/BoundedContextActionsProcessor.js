const ActionsProcessorUtils = require('./ActionsProcessorUtils')
const GlobalPromptUtil = require('../GlobalPromptUtil')

class BoundedContextActionsProcessor {
    static getActionAppliedESValue(action, userInfo, information, esValue, callbacks) {
        switch(action.type) {
            case "create":
                BoundedContextActionsProcessor._createBoundedContext(action, userInfo, information, esValue, callbacks)
                break
        }
    }

    static _createBoundedContext(action, userInfo, information, esValue, callbacks) {
        let boundedContextObject = BoundedContextActionsProcessor.__getBoundedContextBase(
            userInfo, information, action.args.boundedContextName,
            action.args.boundedContextAlias ? action.args.boundedContextAlias : "", 
            BoundedContextActionsProcessor.__getValidPortNumber(esValue),
            0, 0, action.ids.boundedContextId
        )

        const VALID_POSITION = BoundedContextActionsProcessor.__getValidPosition(esValue, boundedContextObject)
        boundedContextObject.elementView.x = VALID_POSITION.x
        boundedContextObject.elementView.y = VALID_POSITION.y

        esValue.elements[boundedContextObject.id] = boundedContextObject 
    }

    static __getValidPortNumber(esValue) {
        const boundedContexts = ActionsProcessorUtils.getAllBoundedContexts(esValue)
        const maxPortNumber = Math.max(...boundedContexts.map(bc => bc.portGenerated ? bc.portGenerated : 8080-1))
        return maxPortNumber + 1
    }

    static __getBoundedContextBase(userInfo, information, name, displayName, portNumber, x, y, elementUUID) {
        const elementUUIDtoUse = elementUUID ? elementUUID : GlobalPromptUtil.getUUID();
        return {
            _type: "org.uengine.modeling.model.BoundedContext",
            aggregates: [],
            author: userInfo.uid,
            description: null,
            id: elementUUIDtoUse,
            elementView: {
                _type: "org.uengine.modeling.model.BoundedContext",
                height: 590,
                id: elementUUIDtoUse,
                style: "{}",
                width: 560,
                x: x, 
                y: y,
            }, 
            gitURL: null,
            hexagonalView: {
                _type: "org.uengine.modeling.model.BoundedContextHexagonal",
                height: 350,
                id: elementUUIDtoUse,
                style: "{}",
                width: 350,
                x: 235,
                y: 365
            },
            members: [],
            name: name,
            displayName: displayName,
            oldName: "",
            policies: [],
            portGenerated: portNumber,
            preferredPlatform: "template-spring-boot",
            preferredPlatformConf: {},
            rotateStatus: false,
            tempId: "",
            templatePerElements: {},
            views: [],
            definitionId: information.projectId
        }
    }

    static __getValidPosition(esValue, boundedContextObject) {
        const getMaxXBoundedContextInMaxYRange = (boundedContexts) => {
            const maxY = Math.max(...boundedContexts.map(bc => bc.elementView.y))
            const maxYBoundedContext = boundedContexts.filter(bc => bc.elementView.y === maxY)[0]

            let boundContextsInMaxYRange = []
            for(let boundedContext of boundedContexts) {
                if(boundedContext.elementView.y >= maxYBoundedContext.elementView.y - maxYBoundedContext.elementView.height/2 &&
                   boundedContext.elementView.y <= maxYBoundedContext.elementView.y + maxYBoundedContext.elementView.height/2)
                    boundContextsInMaxYRange.push(boundedContext)
            }

            let maxXPos = Math.max(...boundContextsInMaxYRange.map(bc => bc.elementView.x))
            return boundContextsInMaxYRange.filter(bc => bc.elementView.x === maxXPos)[0]
        }

        const getValidYPosition = (boundedContexts, xPosInMaxYRange) => {
            const BASE_BC_WIDTH = 560
            const BASE_BC_HEIGHT = 590

            const targetBoundedContexts = []
            for(const boundedContext of boundedContexts) {
                if(boundedContext.elementView.x - boundedContext.elementView.width/2 <= xPosInMaxYRange + BASE_BC_WIDTH/2 && 
                   boundedContext.elementView.x + boundedContext.elementView.width/2 >= xPosInMaxYRange - BASE_BC_WIDTH/2)
                    targetBoundedContexts.push(boundedContext)
            }
            if(targetBoundedContexts.length <= 0) return 450

            const maxYHeightSum = Math.max(...targetBoundedContexts.map(bc => bc.elementView.y + Math.round(bc.elementView.height/2)))
            return maxYHeightSum + 25 + Math.round(BASE_BC_HEIGHT/2)
        }

        const BOUNDED_CONTEXT_MAX_X_LIMIT = 1950
        const boundedContexts = ActionsProcessorUtils.getAllBoundedContexts(esValue)
        if(boundedContexts.length <= 0) return {x: 650, y: 450}

        const maxXBoundedContextInMaxYRange = getMaxXBoundedContextInMaxYRange(boundedContexts)
        const xPosInMaxYRange = maxXBoundedContextInMaxYRange.elementView.x + maxXBoundedContextInMaxYRange.elementView.width/2 + 
                                boundedContextObject.elementView.width/2 + 25
        
        if(xPosInMaxYRange <= BOUNDED_CONTEXT_MAX_X_LIMIT)
            return {x: xPosInMaxYRange, y: getValidYPosition(boundedContexts, xPosInMaxYRange)}
        else
            return {x: 600, y: getValidYPosition(boundedContexts, 450)}
    }
}

module.exports = BoundedContextActionsProcessor