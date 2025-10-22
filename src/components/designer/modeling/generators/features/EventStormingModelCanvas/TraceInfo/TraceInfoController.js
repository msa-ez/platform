const { CanvasExplorer } = require("../CanvasExplorer")
const TraceInfoModelFactory = require("./TraceInfoModelFactory").default;

export default class TraceInfoController {
    constructor(elementValue, component, canvasExplorer=null, traceInfoModel=null) {
        this.elementValue = elementValue
        this.component = component
        this.canvasExplorer = canvasExplorer || CanvasExplorer.makeFromComponent(component)
        this.traceInfoModel = traceInfoModel || TraceInfoModelFactory.createTraceInfoModel(
            this.elementValue._type, this.elementValue, this.canvasExplorer
        )
    }

    getOriginalRefs() {
        return this.traceInfoModel.getOriginalRefs()
    }

    isRefsExist() {
        return this.traceInfoModel.isRefsExist()
    }

    showTraceInfoViewer() {
        const originalRefs = this.getOriginalRefs()
        if(!originalRefs) {
            throw new Error('Can not show refs. refs is required.');
        }

        this.canvasExplorer.setTraceInfoViewerIsShow(true)
        this.canvasExplorer.setTraceInfoViewerDirectRefInfos({
            refs: originalRefs
        })
    }
}