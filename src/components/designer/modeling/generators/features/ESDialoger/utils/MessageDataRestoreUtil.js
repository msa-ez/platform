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
                // Firebase에서 빈 배열이 ["@"]로 저장되는 경우 처리
                if (Array.isArray(structureItem.previewAttributes) && structureItem.previewAttributes.length === 1 && structureItem.previewAttributes[0] === "@") {
                    structureItem.previewAttributes = []
                } else {
                    // previewAttributes의 각 항목에 refs가 없으면 빈 배열로 추가
                    structureItem.previewAttributes = structureItem.previewAttributes.map(attr => {
                        // "@" 마커는 무시
                        if (attr === "@") {
                            return null
                        }
                        // 문자열인 경우 (구형 데이터 형식)
                        if (typeof attr === 'string') {
                            return {
                                fieldName: attr,
                                fieldAlias: '',
                                refs: []
                            }
                        }
                        // 객체인 경우
                        if (attr && typeof attr === 'object') {
                            // fieldName만 있고 refs가 없는 경우
                            if (attr.fieldName && !attr.refs) {
                                return {
                                    fieldName: attr.fieldName,
                                    fieldAlias: attr.fieldAlias || '',
                                    refs: []
                                }
                            }
                            if (attr.fieldName && !attr.hasOwnProperty('fieldAlias')) {
                                attr.fieldAlias = attr.fieldAlias || '';
                            }
                        }
                        return attr
                    }).filter(attr => attr !== null) // null 필터링
                }
            }
            
            if(!structureItem.ddlFields) {
                structureItem.ddlFields = []
            } else {
                // Firebase에서 빈 배열이 ["@"]로 저장되는 경우 처리
                if (Array.isArray(structureItem.ddlFields) && structureItem.ddlFields.length === 1 && structureItem.ddlFields[0] === "@") {
                    structureItem.ddlFields = []
                } else {
                    structureItem.ddlFields = structureItem.ddlFields.map(field => {
                        // "@" 마커는 무시
                        if (field === "@") {
                            return null
                        }
                        // 문자열인 경우 (구형 데이터 형식)
                        if (typeof field === 'string') {
                            return {
                                fieldName: field,
                                fieldAlias: '',
                            }
                        }
                        // 객체인 경우
                        if (field && typeof field === 'object') {
                            // fieldAlias가 없으면 빈 문자열로 설정 (기존 데이터 보존)
                            if (field.fieldName && !field.hasOwnProperty('fieldAlias')) {
                                field.fieldAlias = field.fieldAlias || '';
                            }
                        }
                        return field
                    }).filter(field => field !== null) // null 필터링
                }
            }
        }
    }

    static _restoreTraceMap(traceMap){
        // 이미 객체 형태인 경우 그대로 반환
        if(!Array.isArray(traceMap) && typeof traceMap === 'object' && traceMap !== null) {
            // 문자열 키 그대로 유지하되, 숫자 키로도 접근 가능하도록 양쪽 모두 저장
            // (RefsTraceUtil.convertToOriginalRefsUsingTraceMap에서 traceMap[i] || traceMap[String(i)]로 접근)
            const normalizedTraceMap = {}
            for(const [key, value] of Object.entries(traceMap)) {
                normalizedTraceMap[key] = value
                // 숫자로 변환 가능하면 숫자 키로도 저장 (양쪽 모두 접근 가능)
                const numKey = Number(key)
                if(!isNaN(numKey) && numKey.toString() === key) {
                    normalizedTraceMap[numKey] = value
                }
            }
            return normalizedTraceMap
        }
        
        // 배열 형태인 경우 변환
        const restoredTraceMap = {}
        if(Array.isArray(traceMap)) {
            for(let [index, traceMapItem] of traceMap.entries()){
                if(!traceMapItem) continue
                
                // {"key":"4","value":{...}} 형태인 경우
                if(traceMapItem.key !== undefined && traceMapItem.value !== undefined) {
                    const key = traceMapItem.key
                    restoredTraceMap[key] = traceMapItem.value
                    // 숫자로 변환 가능하면 숫자 키로도 저장 (양쪽 모두 접근 가능)
                    const numKey = Number(key)
                    if(!isNaN(numKey) && numKey.toString() === String(key)) {
                        restoredTraceMap[numKey] = traceMapItem.value
                    }
                } else {
                    // 일반 배열 형태인 경우
                    restoredTraceMap[index] = traceMapItem
                    // 숫자 키로도 저장
                    restoredTraceMap[String(index)] = traceMapItem
                }
            }
        }
        return restoredTraceMap
    }
}

module.exports = MessageDataRestoreUtil;