export default class CanvasExploreAbstract { 
    constructor(canvas) {
        this.canvas = canvas
    }

    getCanvas() {
        return this.canvas
    }

    getElementById(id) {
        throw new Error("Not implemented")
    }

    getElementByName(name) {
        throw new Error("Not implemented")
    }

    getTraceInfo() {
        throw new Error("Not implemented")
    }

    isTraceInfoViewerUsable() {
        throw new Error("Not implemented")
    }

    setTraceInfoViewerIsShow(isShow) {
        throw new Error("Not implemented")
    }
    
    setTraceInfoViewerDirectRefInfos(directRefInfos) {
        throw new Error("Not implemented")
    }
}