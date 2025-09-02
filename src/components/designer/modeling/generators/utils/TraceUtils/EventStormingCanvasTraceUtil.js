class EventStormingCanvasTraceUtil {
    static getBoundedContextTraceNameById(boundedContextId, component) {
        const canvas = this.getParentEventStormingCanvas(component)
        if(!canvas || !canvas.value || !canvas.value.elements || !canvas.value.elements[boundedContextId]) return null

        const boundedContext = canvas.value.elements[boundedContextId]
        if(!boundedContext || !boundedContext.traceName) return null

        return boundedContext.traceName
    }

    static getBoundedContextTraceNameByEntityId(entityId, component) {
        const canvas = this.getParentEventStormingCanvas(component)
        if(!canvas || !canvas.value || !canvas.value.elements) return null

        let aggregate = null
        for(const element of Object.values(canvas.value.elements)) {
            if(element._type === 'org.uengine.modeling.model.Aggregate') {
                if(!element.aggregateRoot || !element.aggregateRoot.entities || !element.aggregateRoot.entities.elements) continue

                if(Object.values(element.aggregateRoot.entities.elements).find(e => e && e.id === entityId)) {
                    aggregate = element
                    break
                }
            }
        }
        if(!aggregate || !aggregate.boundedContext || !aggregate.boundedContext.id) return null

        const boundedContext = canvas.value.elements[aggregate.boundedContext.id]
        if(!boundedContext || !boundedContext.traceName) return null

        return boundedContext.traceName
    }

    static getBoundedContextTraceNameByElementId(elementId, component) {
        const canvas = this.getParentEventStormingCanvas(component)
        if(!canvas || !canvas.value || !canvas.value.elements || !canvas.value.elements[elementId]) return null

        const element = canvas.value.elements[elementId]
        if(!element || !element.boundedContext || !element.boundedContext.id) return null

        const boundedContext = canvas.value.elements[element.boundedContext.id]
        if(!boundedContext || !boundedContext.traceName) return null

        return boundedContext.traceName
    }

    static getTraceNameByElementId(elementId, component) {
        const element = this.getElementById(elementId, component)
        if(!element || !element.traceName) return null
        return element.traceName
    }

    static getElementById(elementId, component) {
        const canvas = this.getParentEventStormingCanvas(component)
        if(!canvas || !canvas.value || !canvas.value.elements || !canvas.value.elements[elementId]) return null
        return canvas.value.elements[elementId]
    }

    static getTraceInfo(component) {
        const canvas = this.getParentEventStormingCanvas(component)
        if(!canvas || !canvas.value || !canvas.value.langgraphStudioInfos || 
           !canvas.value.langgraphStudioInfos.esGenerator || 
           !canvas.value.langgraphStudioInfos.esGenerator.traceInfo) return null
        return canvas.value.langgraphStudioInfos.esGenerator.traceInfo
    }

    static getParentEventStormingCanvas(component) {
        let parent = component.$parent;
        while(parent.$vnode.tag.indexOf('event-storming-model-canvas') == -1) parent = parent.$parent;
        return parent
    }
}

module.exports = EventStormingCanvasTraceUtil;
