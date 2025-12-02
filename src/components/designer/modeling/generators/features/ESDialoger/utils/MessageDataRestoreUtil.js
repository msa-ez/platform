class MessageDataRestoreUtil {
    /**
     * 파이어베이스에서 프로젝트 메세지 데이터 로드시에 일부 키 누락으로 인해서 발생할 수 있는 잠재적 이슈 보정
     */
    static restoreMessageData(msg) {
        if(!msg || !msg.type) return msg

        switch(msg.type){
            case 'boundedContextResult':
                this._restoreBoundedContextResultData(msg)
                break

            case 'aggregateDraftDialogDto':
                this._restoreAggregateDraftDialogDtoData(msg)
                break
        }

        return msg
    }


    static _restoreBoundedContextResultData(msg){
        if(msg.result) {
            for(const bcResult of Object.values(msg.result)){
                if(bcResult && bcResult.boundedContexts) {
                    for(const boundedContext of bcResult.boundedContexts){
                        if(!boundedContext.events) boundedContext.events = []
                        if(!boundedContext.requirements) boundedContext.requirements = []
                        if(!boundedContext.aggregates) boundedContext.aggregates = []
                    }
                }
            }
        }
    }


    static _restoreAggregateDraftDialogDtoData(msg){
        if(msg.draftOptions) {
            for(let draftOption of msg.draftOptions){
                if(!draftOption.options) continue

                for(let option of draftOption.options){
                    if(option.structure) {
                        this._restoreStructure(option.structure)
                    }
                    if(option.boundedContext && option.boundedContext.requirements && option.boundedContext.requirements.traceMap) {
                        const boundedContextRequirements = option.boundedContext.requirements
                        boundedContextRequirements.traceMap = this._restoreTraceMap(boundedContextRequirements.traceMap)
                    }
                }
            }
        }

        if(msg.selectedOptionItem) {
            for(let selectedOption of Object.values(msg.selectedOptionItem)){
                if(selectedOption.structure) {
                    this._restoreStructure(selectedOption.structure)
                }
                if(selectedOption.boundedContext && selectedOption.boundedContext.requirements && selectedOption.boundedContext.requirements.traceMap) {
                    const boundedContextRequirements = selectedOption.boundedContext.requirements
                    boundedContextRequirements.traceMap = this._restoreTraceMap(boundedContextRequirements.traceMap)
                }
            }
        }
    }

    static _restoreStructure(structure){
        for(let structureItem of structure) {
            if(!structureItem.enumerations) structureItem.enumerations = []
            if(!structureItem.valueObjects) structureItem.valueObjects = []
            if(!structureItem.previewAttributes) {
                structureItem.previewAttributes = []
            } else {
                // previewAttributes의 각 항목에 refs가 없으면 빈 배열로 추가
                structureItem.previewAttributes = structureItem.previewAttributes.map(attr => {
                    // 문자열인 경우 (구형 데이터 형식)
                    if (typeof attr === 'string') {
                        return {
                            fieldName: attr,
                            refs: []
                        }
                    }
                    // 객체인 경우
                    if (attr && typeof attr === 'object') {
                        // fieldName만 있고 refs가 없는 경우
                        if (attr.fieldName && !attr.refs) {
                            return {
                                fieldName: attr.fieldName,
                                refs: []
                            }
                        }
                    }
                    return attr
                })
            }
        }
    }

    static _restoreTraceMap(traceMap){
        const restoredTraceMap = {}
        for(let [index, traceMapItem] of traceMap.entries()){
            if(!traceMapItem) continue
            restoredTraceMap[index] = traceMapItem
        }
        return restoredTraceMap
    }
}

module.exports = MessageDataRestoreUtil;