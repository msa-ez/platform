const EventStormingUtil = require('./EventStormingUtil')

class BoundedContextCMUtil {
    /**
     * 주어진 컨텍스트 맵핑 캔버스에서 적절한 위치 좌표를 가진 새로운 BoundedContextCM 값을 반환
     */
    static getNewBoundedContextCM(name, esValue) {
        let boundedContextCM = BoundedContextCMUtil._getBoundedContextCMBase(name)

        let validPosition = BoundedContextCMUtil._getValidBoundedContextCMPosition(boundedContextCM, esValue)
        boundedContextCM.elementView.x = validPosition.x
        boundedContextCM.elementView.y = validPosition.y  

        return boundedContextCM
    }

    static _getBoundedContextCMBase(name){
        const elementId = EventStormingUtil.getUUID()

        return {
            _type: "org.uengine.modeling.model.BoundedContext",
            id: elementId,
            name: name,
            oldName: "",
            description: null,
            author: null,
            aggregates: [],
            policies: [],
            members: [],
            views: [],
            gitURL: null,
            mirrorElement: null,
            elementView: {
              _type: "org.uengine.modeling.model.BoundedContext",
              id: elementId,
              x: 250,
              y: 250,
              width: 250,
              height: 300,
              style: JSON.stringify({}),
            },
            hexagonalView: {
              _type: "org.uengine.modeling.model.BoundedContextHexagonal",
              id: elementId,
              x: 250,
              y: 250,
              width: 350,
              height: 350,
              style: JSON.stringify({}),
            },
            portGenerated: 0,
            tempId: "",
            templatePerElements: {},
            preferredPlatform: "spring-boot",
            preferredPlatformConf: {},
          }
    }

    static _getValidBoundedContextCMPosition(boundedContextCM, esValue) {
        const boundedContextCMs = BoundedContextCMUtil.__getAllBoundedContextCMs(esValue)
        if(boundedContextCMs.length <= 0) return {x: 250, y: 250}
        const mostBottomRightBoundedContextCM = BoundedContextCMUtil.__getMostBottomRightBoundedContextCM(boundedContextCMs)


        const validXPos = mostBottomRightBoundedContextCM.elementView.x + Math.round(mostBottomRightBoundedContextCM.elementView.width/2) + 25 
                            + Math.round(boundedContextCM.elementView.width/2)
        if(validXPos <= 1750) return {x: validXPos, y: mostBottomRightBoundedContextCM.elementView.y}


        const maxY = Math.max(...boundedContextCMs.map(bc => bc.elementView.y + Math.round(bc.elementView.height/2)))
        return {x: 250, y: (maxY + Math.round(boundedContextCM.elementView.height/2) + 25)}
    }

    static __getAllBoundedContextCMs(esValue){
        let boundedContexts = []
        Object.values(esValue.elements).forEach(function (element) {
            if (element && element._type === "org.uengine.modeling.model.BoundedContext")
                boundedContexts.push(element)
        })
        return boundedContexts
    }

    /**
     * 주어진 Bounded Context CM 중에서 가장 오른쪽 아래에 위치한 BoundedContextCM을 반환
     */
    static __getMostBottomRightBoundedContextCM(boundedContextCMs){
        const maxY = Math.max(...boundedContextCMs.map(bc => bc.elementView.y))
        const maxYBoundedContextCM = boundedContextCMs.find(bc => bc.elementView.y === maxY)

        let targetBoundedContextCMs = []
        boundedContextCMs.forEach(function (boundedContextCM) {
            if((boundedContextCM.elementView.y >= maxYBoundedContextCM.elementView.y - maxYBoundedContextCM.elementView.height/2) && 
                (boundedContextCM.elementView.y <= maxYBoundedContextCM.elementView.y + maxYBoundedContextCM.elementView.height/2))
                targetBoundedContextCMs.push(boundedContextCM)
        })
        
        const maxX = Math.max(...targetBoundedContextCMs.map(bc => bc.elementView.x))
        const maxXBoundedContextCM = targetBoundedContextCMs.find(bc => bc.elementView.x === maxX)
        return maxXBoundedContextCM
    }


    /**
     * 이미 동일한 이름의 BoundedContextCM이 존재하는지 여부 반환
     */
    static isSameNameBoundedContextCMExists(name, esValue) {
        for(let element of Object.values(esValue.elements)) {
            if(element && element._type === "org.uengine.modeling.model.BoundedContext" && element.name === name)
                return true
        }
        return false
    }
}

module.exports = BoundedContextCMUtil