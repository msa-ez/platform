const CanvasExploreAbstract = require("./CanvasExploreAbstract").default;

export default class CanvasExplorer extends CanvasExploreAbstract {
    constructor(canvas) {
        super(canvas)
    }

    static makeFromComponent(component) {
        let parent = component.$parent;
        while(parent.$vnode.tag.indexOf('event-storming-model-canvas') == -1) parent = parent.$parent;
        return new CanvasExplorer(parent)
    }

    getElementById(id) {
        if(!this.canvas || !this.canvas.value || !this.canvas.value.elements) return null
        return this.canvas.value.elements[id]
    }

    getElementByName(name) {
        if(!this.canvas || !this.canvas.value || !this.canvas.value.elements) return null
        return Object.values(this.canvas.value.elements).find(element => element.name === name)
    }

    getTraceInfo() {
        if(!this.canvas || !this.canvas.value || !this.canvas.value.langgraphStudioInfos || 
           !this.canvas.value.langgraphStudioInfos.esGenerator || 
           !this.canvas.value.langgraphStudioInfos.esGenerator.traceInfo) return null
        return this.canvas.value.langgraphStudioInfos.esGenerator.traceInfo
    }

    isTraceInfoViewerUsable() {
        return this.canvas && this.canvas.traceInfoViewerDto && this.canvas.traceInfoViewerDto.isUsable
    }

    setTraceInfoViewerIsShow(isShow) {
        if(!this.canvas || !this.canvas.traceInfoViewerDto) return
        this.canvas.traceInfoViewerDto.isShow = isShow
    }

    setTraceInfoViewerDirectRefInfos(directRefInfos) {
        if(!this.canvas || !this.canvas.traceInfoViewerDto) return
        this.canvas.traceInfoViewerDto.directRefInfos = directRefInfos
    }

    getRelatedCommandsByOutputEventName(eventName) {
        if(!this.canvas || !this.canvas.value || !this.canvas.value.elements) return null
        
        const relatedCommands = []
        for(let element of Object.values(this.canvas.value.elements)) {
            if(element._type !== "org.uengine.modeling.model.Command" || !element.outputEvents) continue
            
            if(element.outputEvents.includes(eventName)) {
                relatedCommands.push(element)
            }
        }
        return relatedCommands
    }
}