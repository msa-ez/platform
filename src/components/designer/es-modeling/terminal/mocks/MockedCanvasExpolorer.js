import { CanvasExploreAbstract } from "../../../modeling/generators/features/EventStormingModelCanvas"

export default class MockedCanvasExplorer extends CanvasExploreAbstract {
    constructor(mockedCavnasValue) {
        super(null)
        this.mockedCavnasValue = mockedCavnasValue
    }

    getElementById(id) {
        return this.mockedCavnasValue.elements[id]
    }

    getElementByName(name) {
        return Object.values(this.mockedCavnasValue.elements).find(element => element.name === name)
    }

    getTraceInfo() {
        return this.mockedCavnasValue.langgraphStudioInfos.esGenerator.traceInfo
    }

    isTraceInfoViewerUsable() {
        return true
    }

    setTraceInfoViewerIsShow(isShow) {
        return true
    }
    
    setTraceInfoViewerDirectRefInfos(directRefInfos) {
        return true
    }

    getRelatedCommandsByOutputEventName(eventName) {
        const canvasValue = this.mockedCavnasValue
        const relatedCommands = []
        for(let element of Object.values(canvasValue.elements)) {
            if(element._type !== "org.uengine.modeling.model.Command" || !element.outputEvents) continue
            
            if(element.outputEvents.includes(eventName)) {
                relatedCommands.push(element)
            }
        }
        return relatedCommands
    }
}