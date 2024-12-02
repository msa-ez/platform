class ESFakeActionsUtil {
    /**
     * AI 스트리밍시에 일부 액션이 반환된 상황에서도 이벤트 스토밍 구축시에 문제가 없도록 
     * 가짜 액션을 추가하는 함수
     */
    static addFakeActions(actions, esValue) {
        // BC, Aggregate인 경우에는 미리 생성되어 있어야 이벤트, 커맨드가 생성될 수 있기 때문에 해당 가짜 액션들을 앞단에 배치
        const frontFakeActions = [] 
        const backFakeActions = []

        for(let action of actions){
            // 각 액션이 속한 엘리먼트의 id가 존재하지 않을 경우 발생하는 버그를 제거
            if(action.ids) {
                for(let idKey of Object.keys(action.ids)){
                    // 자기 자신을 지칭하는 ID는 예외로 처리하기 위해서
                    if(idKey.toLowerCase().includes(action.objectType.toLowerCase())) continue

                    const ID_TO_CHECK = action.ids[idKey]
                    if(esValue.elements[ID_TO_CHECK]) continue

                    switch(idKey){
                        case "boundedContextId":
                            if(this._isHaveBCCreateAction(actions, ID_TO_CHECK)) continue
                            frontFakeActions.push(this._getFakeBCAction(ID_TO_CHECK))
                            break
                        
                        case "aggregateId":
                            if(this._isHaveAggregateCreateAction(actions, ID_TO_CHECK)) continue
                            frontFakeActions.push(this._getFakeAggregateAction(action.ids.boundedContextId, ID_TO_CHECK))
                            break
                        // 나머지 타입들은 다른 객체가 속할 수 있는 엘리먼트가 아니기 때문에 확인할 필요가 없음
                    }
                }
            }

            // 커맨드가 호출시킬 이벤트가 없을 경우를 대비해서 가짜 이벤트 액션을 추가
            if(action.objectType === "Command" && action.args && action.args.outputEventIds) {
                for(let eventId of action.args.outputEventIds){
                    if(esValue.elements[eventId]) continue
                    if(this._isHaveEventCreateAction(actions, eventId)) continue
                    backFakeActions.push(this._getFakeEventAction(action.ids.boundedContextId, action.ids.aggregateId, eventId))
                }
            }

            // 이벤트가 정책으로 호출시킬 커맨드가 없는 경우를 대비해서 가짜 커맨드 액션을 추가
            if(action.objectType === "Event" && action.args && action.args.outputCommandIds) {
                for(let outputCommandId of action.args.outputCommandIds){
                    const COMMAND_ID_TO_CHECK = outputCommandId.commandId
                    if(esValue.elements[COMMAND_ID_TO_CHECK]) continue
                    if(this._isHaveCommandCreateAction(actions, COMMAND_ID_TO_CHECK)) continue
                    backFakeActions.push(this._getFakeCommandAction(action.ids.boundedContextId, action.ids.aggregateId, COMMAND_ID_TO_CHECK))
                }
            }
        }

        return [...frontFakeActions, ...actions, ...backFakeActions]
    }

    static _isHaveBCCreateAction(actions, ID_TO_CHECK) {
        return actions.some(action => action.objectType === "BoundedContext" && action.ids.boundedContextId === ID_TO_CHECK)
    }

    static _isHaveAggregateCreateAction(actions, ID_TO_CHECK) {
        return actions.some(action => action.objectType === "Aggregate" && action.ids.aggregateId === ID_TO_CHECK)
    }

    static _isHaveEventCreateAction(actions, ID_TO_CHECK) {
        return actions.some(action => action.objectType === "Event" && action.ids.eventId === ID_TO_CHECK)
    }

    static _isHaveCommandCreateAction(actions, ID_TO_CHECK) {
        return actions.some(action => action.objectType === "Command" && action.ids.commandId === ID_TO_CHECK)
    }

    static _getFakeBCAction(boundedContextId) {
        return {
            "objectType": "BoundedContext",
            "ids": {
                "boundedContextId": boundedContextId
            },
            "args": {
                "boundedContextName": "BoundedContext " + ID_TO_CHECK.slice(0, 4)
            }
        }
    }

    static _getFakeAggregateAction(boundedContextId, aggregateId) {
        return {
            "objectType": "Aggregate",
            "ids": {
                "boundedContextId": boundedContextId,
                "aggregateId": aggregateId
            },
            "args": {
                "aggregateName": "Aggregate " + aggregateId.slice(0, 4),
                
                "properties": [
                    {
                        "name": "id",
                        "type": "Long",
                        "isKey": true
                    }
                ]
            }
        }
    }

    static _getFakeEventAction(boundedContextId, aggregateId, eventId) {
        return {
            "objectType": "Event",
            "ids": {
                "boundedContextId": boundedContextId,
                "aggregateId": aggregateId,
                "eventId": eventId
            },
            "args": {
                "eventName": "Event " + eventId.slice(0, 4),
                "properties": [
                    {
                        "name": "id",
                        "type": "Long",
                        "isKey": true
                    }
                ],
                "outputCommandIds": []
            }
        }
    }

    static _getFakeCommandAction(boundedContextId, aggregateId, commandId) {
        return {
            "objectType": "Command",
            "ids": {
                "boundedContextId": boundedContextId,
                "aggregateId": aggregateId,
                "commandId": commandId
            },
            "args": {
                "commandName": "Command " + commandId.slice(0, 4),
                "api_verb": "POST",
                "properties": [
                    {
                        "name": "id",
                        "type": "Long",
                        "isKey": true
                    }
                ],
                "outputEventIds": [],
                "actor": "Actor " + commandId.slice(0, 4)
            }
        }
    }
}

module.exports = ESFakeActionsUtil