const TraceInfoModelAbstract = require("./TraceInfoModelAbstract").default;
const { RefsTraceUtil } = require("../../../../utils");

export default class CommandTraceInfoModel extends TraceInfoModelAbstract {
    constructor(type, value, canvasExplorer) {
        super(type, value, canvasExplorer)
    }

    getOriginalRefs() {
        if(!this.value || !this.value.boundedContext || !this.value.boundedContext.id) {
            return null;
        }

        
        const boundedContext = this.canvasExplorer.getElementById(this.value.boundedContext.id)
        if(!boundedContext || !boundedContext.traceName) {
            return null;
        }
        const boundedContextTraceName = boundedContext.traceName
        

        const traceInfo = this.canvasExplorer.getTraceInfo()
        if(!traceInfo) {
            return null;
        }

        if(this.__isValidCommandRefsValueExists(this.value, boundedContextTraceName, traceInfo)) {
            return traceInfo.commandRefs[boundedContextTraceName].commands[this.value.traceName];
        }


        if(!traceInfo.traceMaps || !traceInfo.traceMaps[boundedContextTraceName]) {
            return null;
        }

        const bcTraceMap = traceInfo.traceMaps[boundedContextTraceName]
        if(!bcTraceMap || !this.value.refs) {
            return null;
        }

        return RefsTraceUtil.convertToOriginalRefsUsingTraceMap(this.value.refs, bcTraceMap);
    }
    __isValidCommandRefsValueExists(value, boundedContextTraceName, traceInfo) {
        return value.traceName && traceInfo.commandRefs && 
               traceInfo.commandRefs[boundedContextTraceName] && 
               traceInfo.commandRefs[boundedContextTraceName].commands && 
               traceInfo.commandRefs[boundedContextTraceName].commands[value.traceName]
    }
}