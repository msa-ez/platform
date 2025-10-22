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
}