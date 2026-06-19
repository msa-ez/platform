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

    /**
     * 부모 Aggregate 의 trace refs 를 상속받기 위한 fallback helper.
     *
     * 배경 — ES generator backend 는 traceInfo.structureRefs.aggregates 에는
     * aggregate 별 refs 를 채워주지만, traceInfo.commandRefs.commands/readModels
     * 와 element-level (Command/Event/View) refs 는 sparse 하게 비워두는 경우가 잦다.
     * 그 결과 canvas 의 TraceInfoViewer 에서 Aggregate 78% 는 trace 보이지만
     * Command/View 12-14%, Event 0% 만 보이는 비대칭 상태가 됨.
     *
     * 이 helper 는 element 의 aggregate.id 로 부모 Aggregate 를 찾고
     * 그 Aggregate 의 traceInfo refs (structureRefs.aggregates[traceName]) 를 그대로
     * 상속해서 반환. "이 Command/Event/View 는 이 Aggregate 의 일부고, 그 Aggregate 는
     * 이 요구사항 영역에서 도출됐다" 는 추적성이 끊김없이 표시됨.
     *
     * @returns refs array or null
     */
    _getParentAggregateRefsFallback() {
        try {
            if (!this.value || !this.value.aggregate || !this.value.aggregate.id) return null
            const parentAgg = this.canvasExplorer.getElementById(this.value.aggregate.id)
            if (!parentAgg || !parentAgg.boundedContext || !parentAgg.boundedContext.id) return null
            const parentBc = this.canvasExplorer.getElementById(parentAgg.boundedContext.id)
            if (!parentBc || !parentBc.traceName) return null
            const ti = this.getTraceInfo()
            if (!ti || !ti.structureRefs) return null
            const sec = ti.structureRefs[parentBc.traceName]
            if (!sec || !sec.aggregates) return null
            const refs = sec.aggregates[parentAgg.traceName]
            if (!refs || refs.length === 0) return null
            return refs
        } catch (_) {
            return null
        }
    }
}