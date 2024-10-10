class EventStormingUtil {
    /**
     * 이벤트스토밍에서 사용하는 형식의 UUID 값을 반환
     * @returns 
     */
    static getUUID(){
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
    }

    static getAllBoundedContexts(esValue) {
        return Object.values(esValue.elements).filter(element => element && element._type === "org.uengine.modeling.model.BoundedContext")
    }

    static getOnlyRelatedAggregates(boundedContext, esValue) {
        return Object.values(esValue.elements)
          .filter(element => element && element._type == 'org.uengine.modeling.model.Aggregate' &&
            element.boundedContext.id === boundedContext.id
          )
    }

    static getOnlyRelatedElements(boundedContext, esValue) {
        return Object.values(esValue.elements).filter(element => element && element.boundedContext && 
            element.boundedContext.id === boundedContext.id)
    }

    static getOnlyRelatedESValue(boundedContext, esValue) {
        let relatedElements = {}
        for (const element of EventStormingUtil.getOnlyRelatedElements(boundedContext, esValue))
            relatedElements[element.id] = element

        return {
            elements: relatedElements,
            relations: {}
        }
    }
}

module.exports = EventStormingUtil