import { CommandTraceInfoModel, ReadModelTraceInfoModel, EventTraceInfoModel } from "./TraceInfoModels"

export default class TraceInfoModelFactory {
    static createTraceInfoModel(type, elementValue, canvasExplorer) {
        if(!type || !elementValue || !canvasExplorer) {
            throw new Error("Type, element value and canvas explorer are required")
        }

        switch(type) {
            case "org.uengine.modeling.model.Command":
                return new CommandTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.modeling.model.View":
                return new ReadModelTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.modeling.model.Event":
                return new EventTraceInfoModel(type, elementValue, canvasExplorer)
            default:
                throw new Error(`Invalid trace info model type: ${type}`)
        }
    }
}