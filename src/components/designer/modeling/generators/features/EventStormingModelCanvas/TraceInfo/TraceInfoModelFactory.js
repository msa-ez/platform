import { AggregateTraceInfoModel, CommandTraceInfoModel, ReadModelTraceInfoModel, EventTraceInfoModel, PolicyTraceInfoModel, ModelClassTraceInfoModel, EntityTraceInfoModel, EnumTraceInfoModel } from "./TraceInfoModels"

export default class TraceInfoModelFactory {
    static createTraceInfoModel(type, elementValue, canvasExplorer) {
        if(!type || !elementValue || !canvasExplorer) {
            throw new Error("Type, element value and canvas explorer are required")
        }

        switch(type) {
            case "org.uengine.modeling.model.Aggregate":
                return new AggregateTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.modeling.model.Command":
                return new CommandTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.modeling.model.View":
                return new ReadModelTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.modeling.model.Event":
                return new EventTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.modeling.model.Policy":
                return new PolicyTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.uml.model.Class":
                return new ModelClassTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.uml.model.vo.Class":
                return new EntityTraceInfoModel(type, elementValue, canvasExplorer)
            case "org.uengine.uml.model.enum":
                return new EnumTraceInfoModel(type, elementValue, canvasExplorer)
            default:
                throw new Error(`Invalid trace info model type: ${type}`)
        }
    }
}