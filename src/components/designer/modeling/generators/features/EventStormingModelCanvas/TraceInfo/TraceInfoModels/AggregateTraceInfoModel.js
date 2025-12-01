const TraceInfoModelAbstract = require("./TraceInfoModelAbstract").default;
const { RefsTraceUtil } = require("../../../../utils");

export default class AggregateTraceInfoModel extends TraceInfoModelAbstract {
    constructor(type, value, canvasExplorer) {
        super(type, value, canvasExplorer)
    }

    getOriginalRefs() {
        if(!this.__isValidAggregateTraceValue(this.value)) {
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


        // TYPE 1: 트레이스 정보 자체에 Aggregate 참조 정보가 존재함(프로젝트를 기반으로 생성)
        if(this.__isValidAggregateTraceInfo(traceInfo, boundedContextTraceName, this.value.traceName)) {
            return traceInfo.structureRefs[boundedContextTraceName].aggregates[this.value.traceName];
        }

        // TYPE 2: 애그리거트 내부에 refs 정보가 있으며, 참조하는 요구사항에 대한 인덱스 맵핑 정보가 traceInfo에 존재함(특수한 예외 케이스)
        if(this.value.refs && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextTraceName]) {
            return RefsTraceUtil.convertToOriginalRefsUsingTraceMap(
                this.value.refs, traceInfo.traceMaps[boundedContextTraceName]
            );
        }

        // TYPE 3: 애그리거트 내부에 refs 정보가 있으며, 참조하는 요구사항에 대한 인덱스 맵핑 정보가 traceInfo에 존재하지 않음(A2A를 기반으로 생성)
        if(this.value.refs) {
            return this.value.refs;
        }

        return null;
    }
    __isValidAggregateTraceValue(value) {
        return value && value.boundedContext && value.boundedContext.id && value.traceName;
    }
    __isValidAggregateTraceInfo(traceInfo, boundedContextTraceName, aggregateTraceName) {
        return traceInfo && traceInfo.structureRefs && 
               traceInfo.structureRefs[boundedContextTraceName] && 
               traceInfo.structureRefs[boundedContextTraceName].aggregates &&
               traceInfo.structureRefs[boundedContextTraceName].aggregates[aggregateTraceName] &&
               traceInfo.userInputs;
    }
}