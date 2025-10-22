const TraceInfoModelAbstract = require("./TraceInfoModelAbstract").default;
const { RefsTraceUtil } = require("../../../../utils");

export default class EventTraceInfoModel extends TraceInfoModelAbstract {
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

        if(this.value.traceName) {
            const relatedCommands = this.canvasExplorer.getRelatedCommandsByOutputEventName(this.value.traceName)
            if(relatedCommands && relatedCommands.length > 0) {
                const commandTraceNames = relatedCommands.map(command => command.traceName)
                const refsByCommand = []
                for(let commandTraceName of commandTraceNames) {
                    if(this.__isValidCommandRefsValueExists(commandTraceName, boundedContextTraceName, traceInfo)) {
                        refsByCommand.push(...traceInfo.commandRefs[boundedContextTraceName].commands[commandTraceName]);
                    }
                }
                if(refsByCommand.length > 0) {
                    return refsByCommand
                }
            }
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
    __isValidCommandRefsValueExists(commandTraceName, boundedContextTraceName, traceInfo) {
        return commandTraceName && traceInfo.commandRefs && 
               traceInfo.commandRefs[boundedContextTraceName] && 
               traceInfo.commandRefs[boundedContextTraceName].commands && 
               traceInfo.commandRefs[boundedContextTraceName].commands[commandTraceName]
    }
}