const TraceInfoModelAbstract = require("./TraceInfoModelAbstract").default;
const { RefsTraceUtil } = require("../../../../utils");

export default class EventTraceInfoModel extends TraceInfoModelAbstract {
    constructor(type, value, canvasExplorer) {
        super(type, value, canvasExplorer)
    }

    getOriginalRefs() {
        if(!this.__isValidEventTraceValue(this.value)) {
            return null;
        }


        const boundedContextTraceName = this.getBoundedContextTraceName()
        if(!boundedContextTraceName) {
            return null;
        }

        const traceInfo = this.getTraceInfo()
        if(!traceInfo) {
            return null;
        }

        
        // TYPE 1: 이벤트가 특정 커맨드에 연결되어 있고, 커맨드의 트레이스 정보 자체에 Command 참조 정보가 존재함(프로젝트를 기반으로 생성)
        const relatedCommands = this.canvasExplorer.getRelatedCommandsByOutputEventName(this.value.traceName)
        if(relatedCommands && relatedCommands.length > 0) {
            const commandTraceNames = relatedCommands.map(command => command.traceName)
            const refsByCommand = []
            for(let commandTraceName of commandTraceNames) {
                if(this.__isValidCommandTraceInfo(traceInfo, boundedContextTraceName, commandTraceName)) {
                    refsByCommand.push(...traceInfo.commandRefs[boundedContextTraceName].commands[commandTraceName]);
                }
            }
            if(refsByCommand.length > 0) {
                return refsByCommand
            }
        }

        // TYPE 2: Event 내부에 refs 정보가 있으며, 참조하는 요구사항에 대한 인덱스 맵핑 정보가 traceInfo에 존재함(특수한 예외 케이스)
        if(this.value.refs && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextTraceName]) {
            return RefsTraceUtil.convertToOriginalRefsUsingTraceMap(
                this.value.refs, traceInfo.traceMaps[boundedContextTraceName]
            );
        }

        // TYPE 3: Event 내부에 refs 정보가 있으며, 참조하는 요구사항에 대한 인덱스 맵핑 정보가 traceInfo에 존재하지 않음(A2A를 기반으로 생성)
        if(this.value.refs) {
            return this.value.refs;
        }

        return null;
    }
    __isValidEventTraceValue(value) {
        return value && value.boundedContext && value.boundedContext.id && value.traceName;
    }
    __isValidCommandTraceInfo(traceInfo, boundedContextTraceName, commandTraceName) {
        return traceInfo && traceInfo.commandRefs && 
               traceInfo.commandRefs[boundedContextTraceName] && 
               traceInfo.commandRefs[boundedContextTraceName].commands && 
               traceInfo.commandRefs[boundedContextTraceName].commands[commandTraceName]
    }
}