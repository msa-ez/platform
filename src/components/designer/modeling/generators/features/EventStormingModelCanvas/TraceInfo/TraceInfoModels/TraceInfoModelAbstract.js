export default class TraceInfoModelAbstract {
    constructor(type, value, canvasExplorer) {
        this.type = type
        this.value = value
        this.canvasExplorer = canvasExplorer
    }


    getOriginalRefs() {
        throw new Error("Not implemented")
    }

    isRefsExist() {
        const originalRefs = this.getOriginalRefs()
        if(!originalRefs || originalRefs.length === 0) {
            return false
        }
        return true
    }


    getBoundedContextTraceName() {
        if(!this.value || !this.value.boundedContext || !this.value.boundedContext.id) {
            return null;
        }

        const boundedContext = this.canvasExplorer.getElementById(this.value.boundedContext.id)
        if(!boundedContext || !boundedContext.traceName) {
            return null;
        }

        return boundedContext.traceName
    }

    getBoundedContextTraceNameByEntityId(entityId) {
        if(!entityId) {
            return null;
        }

        let aggregate = null
        this.canvasExplorer.iterateElements(element => {
            if(element._type !== "org.uengine.modeling.model.Aggregate" || !element.aggregateRoot || !element.aggregateRoot.entities || !element.aggregateRoot.entities.elements) return

            if(Object.values(element.aggregateRoot.entities.elements).find(e => e.id === entityId)) {
                aggregate = element
                return
            }
        })
        if(!aggregate || !aggregate.boundedContext || !aggregate.boundedContext.id) return null

        const boundedContext = this.canvasExplorer.getElementById(aggregate.boundedContext.id)
        if(!boundedContext || !boundedContext.traceName) return null

        return boundedContext.traceName
    }

    getTraceInfo() {
        return this.canvasExplorer.getTraceInfo()
    }
}