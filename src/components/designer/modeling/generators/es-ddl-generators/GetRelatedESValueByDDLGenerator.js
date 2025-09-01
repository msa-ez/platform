const JsonAIGenerator = require("../JsonAIGenerator");
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESAliasTransManager = require("./modules/ESAliasTransManager");

class GetRelatedESValueByDDLGenerator extends JsonAIGenerator {
    constructor(client, maxLengthLimit=10000, onlyNameLengthRatio=0.8, parameterOptions={}){
        super(client);

        this.modelName = "GetRelatedESValueByDDLGenerator"

        this.maxLengthLimit = maxLengthLimit
        this.onlyNameLengthRatio = onlyNameLengthRatio
        this.parameterOptions = parameterOptions

        this.ESAliasTransManager = null
    }


    createPrompt(esValue=null, ddl=null){
        const getSystemPrompt = () => {
            return `You are given a SQL DDL statement and a list of names for the event streaming elements. You need to sort them using the SQL DDL statement so that the most relevant ones are at the top.

Please return only a JSON object in the following format.
{
    "sortedObjectNames": [
        "<objectName1>",
        "<objectName2>"
    ]
}

I will show you an input/output example.
[INPUT]
- SQL DDL Statement
CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    total_amount DECIMAL(10, 2),
    status VARCHAR(20)
);

CREATE TABLE order_items (
    item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    price DECIMAL(10, 2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

- Event Storming Names
bc-order-management:order-management, bc-order-management-command-CreateOrder:CreateOrder, bc-order-management-event-OrderCreated:OrderCreated, bc-customer-management:customer-management, bc-product-management:product-management

[OUTPUT]
\`\`\`json
{"sortedObjectNames":["bc-order-management:order-management","bc-order-management-command-CreateOrder:CreateOrder","bc-order-management-event-OrderCreated:OrderCreated","bc-customer-management:customer-management","bc-product-management:product-management"]}
\`\`\`

${GlobalPromptUtil.getJsonCompressGuidePrompt()}

`
        }

        const getUserPrompt = (summarizedESValue, ddl) => {
            const eventStormingIdNameList = this._getEventStormingIdNameList(summarizedESValue)

            return `[INPUT]
- SQL DDL Statement
${ddl}

- Event Storming Names
${eventStormingIdNameList.join(", ")}

[OUTPUT]
\`\`\`json
`
        }

        try {

            if(this.parameterOptions.esValue !== null) esValue = this.parameterOptions.esValue
            if(this.parameterOptions.ddl !== null) ddl = this.parameterOptions.ddl
                
            if(esValue === null) throw new Error("esValue 파라미터가 전달되지 않았습니다.")
            if(ddl === null) throw new Error("ddl 파라미터가 전달되지 않았습니다.")
            
            console.log(`[*] GetRelatedESValueByDDLGenerator에 대한 프롬프트 생성중...`, {esValue, ddl})


            this.summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(esValue)
            this.ESAliasTransManager = new ESAliasTransManager(esValue)
            this.summarizedESValue = this.ESAliasTransManager.transToAliasInSummarizedESValue(this.summarizedESValue)

            const prompt = getSystemPrompt() + getUserPrompt(this.summarizedESValue, ddl)


            console.log(`[*] LLM에게 생성된 프롬프트 전달중...`, {prompt})
            return prompt

        } catch(e) {

            console.error(`[!] GetRelatedESValueByDDLGenerator에 대한 프롬프트 생성 도중에 오류 발생!`, {esValue, ddl, error:e})
            throw e

        }
    }

    createModel(text){
        if(this.state !== 'end') {
            console.log(`[*] ${this.modelName}에서 결과 생성중... (현재 출력된 문자 수: ${text.length})`)

            return {
                modelName: this.modelName,
                modelValue: null,
                modelRawValue: text
            }
        }

        try {

            console.log(`[*] ${this.modelName}에서 결과 파싱중...`, {text})
            const sortedObjectNames = GlobalPromptUtil.parseToJson(text).sortedObjectNames
            let relatedSummarizedESValue = this._getRelatedSummarizedESValue(this.summarizedESValue, sortedObjectNames, this.maxLengthLimit, this.onlyNameLengthRatio)
            relatedSummarizedESValue = this.ESAliasTransManager.transToUUIDInSummarizedESValue(relatedSummarizedESValue)
            
            const outputResult = {
                modelName: this.modelName,
                modelValue: relatedSummarizedESValue,
                modelRawValue: text
            }
            console.log(`[*] ${this.modelName}에서 결과 파싱 완료!`, {outputResult})

            return outputResult

        } catch(e) {

            console.error(`[!] ${this.modelName}에서 결과 파싱중에 오류 발생!`, {text, error:e})

            return {
                modelName: this.modelName,
                modelValue: null,
                modelRawValue: text,
                isError: true
            }

        }
    }


    /**
     * 주어진 이벤트 스토밍에서 각 엘리먼트들을 'id:name' 형식으로 변환하여 반환
     * @param {*} summarizedESValue ESValueSummarizeUtil로 요약된 이벤트 스토밍 정보
     * @example
     * const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(this.value)
     * const eventStormingIdNameList = this._getEventStormingIdNameList(summarizedESValue)
     * // ['bc-001:CustomerService', 'bc-001-agg-001:Customer', 'bc-001-cmd-001:CreateCustomer']
     * @returns 'id:name' 형식의 이벤트스토밍 엘리먼트 배열
     */
    _getEventStormingIdNameList(summarizedESValue) {
        const getEventStormingNamesInAggregate = (aggregate) => {
            let eventStormingNames = []
            eventStormingNames.push(`${aggregate.id}:${aggregate.name}`)
    
            for(const command of Object.values(aggregate.commands))
                eventStormingNames.push(`${command.id}:${command.name}`)
    
            for(const event of Object.values(aggregate.events))
                eventStormingNames.push(`${event.id}:${event.name}`)
    
            for(const enumeration of Object.values(aggregate.enumerations))
                eventStormingNames.push(`${enumeration.id}:${enumeration.name}`)
    
            for(const valueObject of Object.values(aggregate.valueObjects))
                eventStormingNames.push(`${valueObject.id}:${valueObject.name}`)
    
            return eventStormingNames
        }
    
        let eventStormingNames = []
        for(const boundedContext of Object.values(summarizedESValue)) {
            eventStormingNames.push(`${boundedContext.id}:${boundedContext.name}`)
            for(const aggregate of Object.values(boundedContext.aggregates))
                eventStormingNames = eventStormingNames.concat(getEventStormingNamesInAggregate(aggregate))
        }
        return eventStormingNames
    }

    /**
     * LLM이 반환한 관련성 정보를 활용해서 특정 길이만큼 압축된 이벤트 스토밍 정보를 반환함
     * @param {*} summarizedESValue 압축에 활용 할 요약된 이벤트 스토밍 정보
     * @param {*} sortedObjectNames LLM이 반환한 연관성으로 정렬된 이벤트 스토밍 엘리먼트 이름 배열
     * @param {*} maxLengthLimit 압축된 이벤트 스토밍 정보의 최대 길이
     * @param {*} onlyNameLengthRatio 이름과 같은 최소한의 정보만 포함시키는 것을 시작 할 길이 비율
     * @example
     * const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(this.value)
     * const sortedObjectNames = GlobalPromptUtil.parseToJson(aiTextResult).sortedObjectNames
     * const relatedSummarizedESValue = this._getRelatedSummarizedESValue(summarizedESValue, sortedObjectNames, this.maxLengthLimit, this.onlyNameLengthRatio)
     * @returns 압축된 이벤트 스토밍 정보
     */
    _getRelatedSummarizedESValue(summarizedESValue, sortedObjectNames, maxLengthLimit, onlyNameLengthRatio){
        const sortedObjectPaths = this.__getSortedObjectPaths(summarizedESValue, sortedObjectNames)
        const relatedPreprocessModelValue = this.__getRelatedSummarizedESValueBySortedObjectPaths(sortedObjectPaths, maxLengthLimit, Math.floor(maxLengthLimit*onlyNameLengthRatio))
        return relatedPreprocessModelValue
    }


    /**
     * 주어진 연관 정보를 활용해서 각 엘리먼트들에 대해서 summarizedESValue에서 활용할 수 있는 속성들 및 경로 정보들을 리스트 형태로 반환시킴. 추후에 이 정보를 활용해서 특정 길이로 압축된 이벤트 스토밍 정보를 생성함
     * @param {*} summarizedESValue 압축에 활용 할 요약된 이벤트 스토밍 정보
     * @param {*} sortedObjectNames LLM이 반환한 연관성으로 정렬된 이벤트 스토밍 엘리먼트 이름 배열
     * @example
     * const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(this.value)
     * const sortedObjectNames = GlobalPromptUtil.parseToJson(aiTextResult).sortedObjectNames
     * const sortedObjectPaths = this._getSortedObjectPaths(summarizedESValue, sortedObjectNames)
     * // sortedObjectPaths 예시
     * [
     *   {
     *       id: 'bc-order-management',
     *       valueType: 'object',
     *       path: [],
     *       args: {
     *           id: 'bc-order-management',
     *           name: 'Order Management',
     *           aggregates: {},
     *           actors: ['Customer', 'Sales Manager']
     *       }
     *   },
     *   {
     *       id: 'agg-order',
     *       valueType: 'object',
     *       path: ['bc-order-management', 'aggregates'],
     *       args: {
     *           id: 'agg-order',
     *           name: 'Order',
     *           properties: ['orderId', 'customerId', 'totalAmount'],
     *           commands: [],
     *           events: [],
     *           enumerations: [],
     *           valueObjects: []
     *       }
     *   },
     *   {
     *       id: 'cmd-create-order',
     *       valueType: 'list',
     *       path: ['bc-order-management', 'aggregates', 'agg-order', 'commands'],
     *       args: {
     *           id: 'cmd-create-order',
     *           name: 'Create Order',
     *           api_verb: 'POST',
     *           outputEvents: ['OrderCreated']
     *       }
     *   },
     *   {
     *       id: 'evt-order-created',
     *       valueType: 'list',
     *       path: ['bc-order-management', 'aggregates', 'agg-order', 'events'],
     *       args: {
     *           id: 'evt-order-created',
     *           name: 'Order Created',
     *           outputCommands: ['UpdateInventory']
     *       }
     *   }
     * ]
     * @returns 연관성을 기준으로 정렬된 각 엘리먼트들의 summarizedESValue 속성 및 경로 정보를 담은 배열
     */
    __getSortedObjectPaths(summarizedESValue, sortedObjectNames){
        const getSearchedObjectPaths = (summarizedESValue, sortedObjectId) => {
            let searchObjectPaths = []
            for(const boundedContext of Object.values(summarizedESValue)) {
                searchObjectPaths.push({
                    id: boundedContext.id,
                    valueType: "object",
                    path: [],
                    args: {
                        "id": boundedContext.id,
                        "name": boundedContext.name,
                        "aggregates": {},
                        "actors": boundedContext.actors
                    }
                })
                if(boundedContext.id === sortedObjectId)
                    return searchObjectPaths

                for(const aggregate of Object.values(boundedContext.aggregates)) {
                    searchObjectPaths.push({
                        id: aggregate.id,
                        valueType: "object",
                        path: [boundedContext.id, "aggregates"],
                        args: {
                            "id": aggregate.id,
                            "name": aggregate.name,
                            "properties": aggregate.properties,
                            "commands": [],
                            "events": [],
                            "enumerations": [],
                            "valueObjects": []
                        }
                    })
                    if(aggregate.id === sortedObjectId)
                        return searchObjectPaths

                    for(const command of Object.values(aggregate.commands)) {
                        searchObjectPaths.push({
                            id: command.id,
                            valueType: "list",
                            path: [boundedContext.id, "aggregates", aggregate.id, "commands"],
                            args: {
                                "id": command.id,
                                "name": command.name,
                                "api_verb": command.api_verb,
                                "outputEvents": command.outputEvents
                            }
                        })

                        if(command.id === sortedObjectId)
                            return searchObjectPaths
                        searchObjectPaths.pop()
                    }

                    for(const event of Object.values(aggregate.events)) {
                        searchObjectPaths.push({
                            id: event.id,
                            valueType: "list",
                            path: [boundedContext.id, "aggregates", aggregate.id, "events"],
                            args: {
                                "id": event.id,
                                "name": event.name,
                                "outputCommands": event.outputCommands
                            }
                        })

                        if(event.id === sortedObjectId)
                            return searchObjectPaths
                        searchObjectPaths.pop()
                    }

                    for(const valueObject of Object.values(aggregate.valueObjects)) {
                        searchObjectPaths.push({
                            id: valueObject.id,
                            valueType: "list",
                            path: [boundedContext.id, "aggregates", aggregate.id, "valueObjects"],
                            args: {
                                "id": valueObject.id,
                                "name": valueObject.name,
                                "properties": valueObject.properties
                            }
                        })

                        if(valueObject.id === sortedObjectId)
                            return searchObjectPaths
                        searchObjectPaths.pop()
                    }

                    for(const enumeration of Object.values(aggregate.enumerations)) {
                        searchObjectPaths.push({
                            id: enumeration.id,
                            valueType: "list",
                            path: [boundedContext.id, "aggregates", aggregate.id, "enumerations"],
                            args: {
                                "id": enumeration.id,
                                "name": enumeration.name,
                                "items": enumeration.items
                            }
                        })

                        if(enumeration.id === sortedObjectId)
                            return searchObjectPaths
                        searchObjectPaths.pop()
                    }
                    searchObjectPaths.pop()
                }
                searchObjectPaths.pop()
            }
            return searchObjectPaths
        }


        let sortedObjectPaths = []
        let objectIdSet = new Set()
        
        for(const sortedObjectName of sortedObjectNames) {
            const searchedObjectPaths = getSearchedObjectPaths(summarizedESValue, sortedObjectName.split(":")[0])
            for(const searchedObjectPath of searchedObjectPaths) {
                if(!objectIdSet.has(searchedObjectPath.id)) {
                    sortedObjectPaths.push(searchedObjectPath)
                    objectIdSet.add(searchedObjectPath.id)
                }
            }
        }

        return sortedObjectPaths
    }

    /**
     * 생성된 sortedObjectPaths정보를 활용해서 특정한 길이만큼 압축된 이벤트 스토밍 정보를 생성함
     * @param {*} sortedObjectPaths LLM이 반환한 연관성으로 정렬된 이벤트 스토밍 엘리먼트 이름 배열
     * @param {*} maxLengthLimit 압축된 이벤트 스토밍 정보의 최대 길이
     * @param {*} onlyNameLengthLimit 이름과 같은 최소한의 정보만 포함시키는 것을 시작 할 길이 비율
     * @example
     * const sortedObjectPaths = this._getSortedObjectPaths(summarizedESValue, sortedObjectNames)
     * const relatedSummarizedESValue = this._getRelatedSummarizedESValueBySortedObjectPaths(sortedObjectPaths, this.maxLengthLimit, this.onlyNameLengthRatio)
     * @returns 압축된 이벤트 스토밍 정보
     */
    __getRelatedSummarizedESValueBySortedObjectPaths(sortedObjectPaths, maxLengthLimit, onlyNameLengthLimit){
        const applyToObject = (sortedObjectPath, relatedSummarizedESValue, isApplyOnlyNameProperty) => {
            let targetObjectValue = relatedSummarizedESValue
            for(const path of sortedObjectPath.path)
                targetObjectValue = targetObjectValue[path]

            if(isApplyOnlyNameProperty) {
                let summaryArgs = {}

                for(let key of Object.keys(sortedObjectPath.args)) {
                    if(key === "id" || key === "name")
                        summaryArgs[key] = sortedObjectPath.args[key]
                    else if(typeof sortedObjectPath.args[key] === "object") {
                        if(sortedObjectPath.args[key] instanceof Array)
                            summaryArgs[key] = []
                        else
                            summaryArgs[key] = {}
                    }
                    else if(typeof sortedObjectPath.args[key] === "string") summaryArgs[key] = "..."
                    else summaryArgs[key] = sortedObjectPath.args[key]
                }

                sortedObjectPath.args = summaryArgs
            }

            if(sortedObjectPath.valueType === "object")
                targetObjectValue[sortedObjectPath.id] = sortedObjectPath.args
            else if(sortedObjectPath.valueType === "list")
                targetObjectValue.push(sortedObjectPath.args)
        }

        let isApplyOnlyNameProperty = false
        let relatedSummarizedESValue = {}
        for(const sortedObjectPath of sortedObjectPaths) {
            let relatedSummarizedESValue_prev = JSON.parse(JSON.stringify(relatedSummarizedESValue))
            applyToObject(sortedObjectPath, relatedSummarizedESValue, isApplyOnlyNameProperty)

            const checkLength = JSON.stringify(relatedSummarizedESValue).length
            if(checkLength > onlyNameLengthLimit) isApplyOnlyNameProperty = true
            if(checkLength > maxLengthLimit) return relatedSummarizedESValue_prev
        }
        
        return relatedSummarizedESValue
    }
}


module.exports = GetRelatedESValueByDDLGenerator;