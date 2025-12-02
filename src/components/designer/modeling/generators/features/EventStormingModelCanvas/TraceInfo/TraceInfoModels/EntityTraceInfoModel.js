const TraceInfoModelAbstract = require("./TraceInfoModelAbstract").default;
const { RefsTraceUtil } = require("../../../../utils");

export default class EntityTraceInfoModel extends TraceInfoModelAbstract {
    constructor(type, value, canvasExplorer) {
        super(type, value, canvasExplorer)
    }

    getOriginalRefs() {
        if(!this.__isValidEntityTraceValue(this.value)) {
            return null;
        }


        const boundedContextTraceName = this.getBoundedContextTraceNameByEntityId(this.value.id)
        if(!boundedContextTraceName) {
            return null;
        }

        const traceInfo = this.getTraceInfo()
        if(!traceInfo) {
            return null;
        }


        // TYPE 1: 추적성 정보에 Entity 참조 정보가 이미 존재함(프로젝트 초안을 기반으로 생성됨)
        if (this.__isValidEntityTraceInfo(traceInfo, boundedContextTraceName, this.value.traceName)) {
            return traceInfo.structureRefs[boundedContextTraceName].entities[this.value.traceName];
        }
        
        // TYPE 2: 추적성 정보에 Entity 참조 정보가 없으며, 인덱스 맵핑 정보가 존재함(예외적인 상황)
        if(this.value.refs && traceInfo.traceMaps && traceInfo.traceMaps[boundedContextTraceName]) {
            return RefsTraceUtil.convertToOriginalRefsUsingTraceMap(this.value.refs, traceInfo.traceMaps[boundedContextTraceName]);
        }

        // TYPE 3: 추적성 정보에 Entity 참조 정보가 없으며, 인덱스 맵핑 정보도 없음(A2A를 기반으로 생성)
        if(this.value.refs) {
            return this.value.refs;
        }

        return null;
    }
    __isValidEntityTraceValue(value) {
        return value && value.id && value.traceName;
    }
    __isValidEntityTraceInfo(traceInfo, boundedContextName, entityTraceName) {
        return traceInfo && traceInfo.structureRefs && 
               traceInfo.structureRefs[boundedContextName] && 
               traceInfo.structureRefs[boundedContextName].entities &&
               traceInfo.structureRefs[boundedContextName].entities[entityTraceName] &&
               traceInfo.userInputs;
    }
}