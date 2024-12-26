const changeCase = require("change-case")
const GlobalPromptUtil = require("./GlobalPromptUtil")

/**
 * 주어진 엘리먼트 이름 정보를 토대로 기존의 UUID 이름을 의미가 있는 별칭으로 변환/역복원시켜서 LLM에게 더 의미있는 엘리먼트 이름을 제공하도록 도와줌
 */
class ESAliasTransManager {
    constructor(esValue){
        this.esValue = esValue
        this.UUIDToAliasDic = {}
        this.aliasToUUIDDic = {}

        this._initUUIDAliasForElements()
        this._initUUIDAliasForRelations()
    }

    _initUUIDAliasForElements() {
        Object.keys(this.esValue.elements).forEach(key => {
            const element = this.esValue.elements[key]
            if(!element) return
            
            const aliasToUse = this.__makeAliasToUse(element)
            this.UUIDToAliasDic[key] = aliasToUse
            this.aliasToUUIDDic[aliasToUse] = key


            if(element._type !== "org.uengine.modeling.model.Aggregate") return
            if(!element.aggregateRoot || !element.aggregateRoot.entities || !element.aggregateRoot.entities.elements) return
            const aggregateElements = element.aggregateRoot.entities.elements

            Object.keys(aggregateElements).forEach(entityKey => {
                const entity = aggregateElements[entityKey]
                if(!entity) return

                const entityAliasToUse = this.__makeAliasToUse(entity)
                this.UUIDToAliasDic[entityKey] = entityAliasToUse
                this.aliasToUUIDDic[entityAliasToUse] = entityKey
            })
        })
    }

    _initUUIDAliasForRelations() {
        const getAliasForRelation = (relation) => {
            const sourceAlias = this.__makeAliasToUse(relation.sourceElement)
            const targetAlias = this.__makeAliasToUse(relation.targetElement)
            return `${sourceAlias}-to-${targetAlias}`
        }

        Object.keys(this.esValue.relations).forEach(relationKey => {
            const relation = this.esValue.relations[relationKey]
            if(!relation) return

            const relationAliasToUse = getAliasForRelation(relation)
            this.UUIDToAliasDic[relationKey] = relationAliasToUse
            this.aliasToUUIDDic[relationAliasToUse] = relationKey
        })
    }

    /**
     * 각 엘리먼트 타입마다 충돌되지 않는 의미있는 별칭을 LLM에게 제공하기 위함
     */
    __makeAliasToUse(element) {
        const getFrontId = (element) => {
            switch(element._type.toLowerCase()) {
                case "org.uengine.modeling.model.boundedcontext": return "bc"
                case "org.uengine.modeling.model.aggregate": return "agg"
                case "org.uengine.modeling.model.command": return "cmd"
                case "org.uengine.modeling.model.event": return "evt"
                case "org.uengine.modeling.model.view": return "rm"
                case "org.uengine.modeling.model.actor": return "act"
                case "org.uengine.uml.model.class": return element.isAggregateRoot ? "agg-root" : "ent"
                case "org.uengine.uml.model.enum": return "enum"
                case "org.uengine.uml.model.vo.class": return "vo"
                case "org.uengine.modeling.model.policy": return "pol"
                default: return "obj"
            }
        }


        if(this.UUIDToAliasDic[element.id]) 
            return this.UUIDToAliasDic[element.id]

        let aliasToUse = `${getFrontId(element)}-${changeCase.camelCase(element.name)}`
        let i = 1
        while(this.aliasToUUIDDic[aliasToUse]) {
            aliasToUse = `${aliasToUse}-${i}`
            i++
        }
        return aliasToUse
    }


    getAliasSafely(uuid){
        if(this.UUIDToAliasDic[uuid]) return this.UUIDToAliasDic[uuid]
        return uuid
    }

    getElementAliasSafely(element) {
        if(element.id) return this.getAliasSafely(element.id)
        if(element.elementView) return this.getAliasSafely(element.elementView.id)
        return element.id
    }

    getUUIDSafely(alias){
        if(this.aliasToUUIDDic[alias]) return this.aliasToUUIDDic[alias]
        return alias
    }

    getUUIDSafelyWithNewUUID(alias){
        if(this.aliasToUUIDDic[alias]) return this.aliasToUUIDDic[alias]

        const newUUID = GlobalPromptUtil.getUUID()
        this.aliasToUUIDDic[alias] = newUUID
        this.UUIDToAliasDic[newUUID] = alias
        return newUUID
    }


    /**
     * summarizedESValue에 존재하는 UUID를 의미있는 별칭으로 변환
     * @param {*} summarizedESValue 요약된 이벤트 스토밍 정보
     * @example
     * const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(this.value)
     * const esAliasTransManager = new ESAliasTransManager(this.value)
     * const transToAliasInSummarizedESValue = esAliasTransManager.transToAliasInSummarizedESValue(summarizedESValue)
     * @returns UUID가 별칭으로 변환된 요약된 이벤트 스토밍 정보
     */
    transToAliasInSummarizedESValue(summarizedESValue){
        return this._transSummarizedESValue(summarizedESValue, (uuid) => this.getAliasSafely(uuid))
    }

    /**
     * summarizedESValue에 존재하는 별칭을 기존의 UUID로 변환
     * @param {*} summarizedESValue 요약된 이벤트 스토밍 정보
     * @example
     * const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(this.value)
     * const esAliasTransManager = new ESAliasTransManager(this.value)
     * const transToUUIDInSummarizedESValue = esAliasTransManager.transToUUIDInSummarizedESValue(summarizedESValue)
     * @returns 별칭이 UUID로 변환된 요약된 이벤트 스토밍 정보
     */
    transToUUIDInSummarizedESValue(summarizedESValue){
        return this._transSummarizedESValue(summarizedESValue, (alias) => this.getUUIDSafely(alias))
    }

    transToAliasInActions(actions){
        return this._transActions(actions, (uuid) => this.getAliasSafely(uuid))
    }

    transToUUIDInActions(actions){
        return this._transActions(actions, (alias) => this.getUUIDSafelyWithNewUUID(alias))
    }

    /**
     * 주어진 요약된 이벤트 스토밍 정보를 토대로 엘리먼트 이름을 변환하는 함수를 적용해서 반환
     * @param {*} summarizedESValue 요약된 이벤트 스토밍 정보
     * @param {*} transFunc 엘리먼트 이름을 변환하는 함수
     * @returns 엘리먼트 이름이 변환된 요약된 이벤트 스토밍 정보
     */
    _transSummarizedESValue(summarizedESValue, transFunc){
        const getTranslatedAggregate = (aggregate) => {
            aggregate.id = transFunc(aggregate.id)

            if(aggregate.entities)
                aggregate.entities.forEach(entity => {
                    entity.id = transFunc(entity.id)
                })

            if(aggregate.enumerations)
                aggregate.enumerations.forEach(enumeration => {
                    enumeration.id = transFunc(enumeration.id)
                })
            
            if(aggregate.valueObjects)
                aggregate.valueObjects.forEach(valueObject => {
                    valueObject.id = transFunc(valueObject.id)
                })
            
            if(aggregate.commands)
                aggregate.commands.forEach(command => {
                    command.id = transFunc(command.id)
                    if(command.outputEvents)
                        command.outputEvents.forEach(outputEvent => {
                            outputEvent.relationId = transFunc(outputEvent.relationId)
                            outputEvent.id = transFunc(outputEvent.id)
                        })
                })
            
            if(aggregate.events)
                aggregate.events.forEach(event => {
                    event.id = transFunc(event.id)
                    if(event.outputCommands)
                        event.outputCommands.forEach(outputCommand => {
                            outputCommand.relationId = transFunc(outputCommand.relationId)
                            outputCommand.id = transFunc(outputCommand.id)
                        })
                })
            
            if(aggregate.readModels)
                aggregate.readModels.forEach(readModel => {
                    readModel.id = transFunc(readModel.id)
                })
            
            return aggregate
        }

        let translatedSummarizedESValue = {}
        for(const bcKey of Object.keys(summarizedESValue)){
            const boundedContext = summarizedESValue[bcKey]
            boundedContext.id = transFunc(boundedContext.id)

            if(boundedContext.actors)
                boundedContext.actors.forEach(actor => {
                    actor.id = transFunc(actor.id)
                })

            if(boundedContext.aggregates) {
                let translatedAggregates = {}
                for(const aggKey of Object.keys(boundedContext.aggregates)){
                    const translatedAggregate = getTranslatedAggregate(boundedContext.aggregates[aggKey])
                    translatedAggregates[translatedAggregate.id] = translatedAggregate
                }
                boundedContext.aggregates = translatedAggregates
            }
            translatedSummarizedESValue[boundedContext.id] = boundedContext
        }
        return translatedSummarizedESValue
    }

    _transActions(actions, transFunc){
        for(const action of actions){
            for(const idKey of Object.keys(action.ids)){
                action.ids[idKey] = transFunc(action.ids[idKey])
            }

            if(action.objectType === "Command" && action.args && action.args.outputEventIds)
                action.args.outputEventIds = action.args.outputEventIds.map(id => transFunc(id))

            if(action.objectType === "Event" && action.args && action.args.outputCommandIds)
                action.args.outputCommandIds = action.args.outputCommandIds.map(outputCommand => {
                    outputCommand.commandId = transFunc(outputCommand.commandId)
                    return outputCommand
                })
        }
        return actions
    }
}

module.exports = ESAliasTransManager