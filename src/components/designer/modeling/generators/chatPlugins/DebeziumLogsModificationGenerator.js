const VODefinitions = require("../VODefinitions");
const JsonAIGenerator = require("../JsonAIGenerator");
let changeCase = require('change-case');
const jp = require('jsonpath');

class DebeziumLogsModificationGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);

        this.model = "gpt-4o"
        this.preferredLanguage = this.setPreferredLanguage();
        this.originalLanguage = this.preferredLanguage.toLowerCase();
    }
    
    isMatchedGenerator(userMessage) {
        const isDebeziumLog = (str) => {
            return /\{"schema":\{.*"name":".*\.Envelope".*\},"payload":\{.*\}\}/.test(str)
        }

        return isDebeziumLog(userMessage)
    }

    createPrompt(){
        const getPreprocessModelValue = (modelValue, selectedElement) => {
            const getAllBoundedContexts = (modelValue) => {
                return Object.values(modelValue.elements)
                    .filter(element => element && element._type === 'org.uengine.modeling.model.BoundedContext')
            }
        
            const getBoundedContextInfo = (boundedContext, modelValue, selectedElement) => {
                const getSelectedBoundedContextId = (selectedElement) => {
                    if(selectedElement.boundedContext && selectedElement.boundedContext.id)
                        return selectedElement.boundedContext.id
                    else
                        return selectedElement.id
                }
        
                const getAllAggregates = (boundedContext, modelValue) => {
                    return boundedContext.aggregates.map(aggregate => modelValue.elements[aggregate.id])
                }
        
                const getAggregateInfo = (aggregate, isReadOnly, boundedContext, modelValue) => {
                    const getAggregateProperties = (aggregate) => {
                        return aggregate.aggregateRoot.fieldDescriptors.map(fieldDescriptor => {
                            return {
                                name: fieldDescriptor.name,
                                displayName: fieldDescriptor.displayName,
                                type: fieldDescriptor.className,
                                isKey: fieldDescriptor.isKey
                            }
                        })
                    }
        
                    const getEnumInfos = (aggregate, isReadOnly) => {
                        const getEnumInfo = (element, isReadOnly) => {
                            let enumInfo = {}
                            enumInfo.id = element.id ? element.id : element.elementView.id
                            enumInfo.name = element.name
                            if(!isReadOnly)
                                enumInfo.items = element.items.map(item => {
                                    return item.value
                                })
                            return enumInfo
                        }
        
                        let enumInfos = []
                        for(let element of Object.values(aggregate.aggregateRoot.entities.elements))
                            if(element && (element._type === 'org.uengine.uml.model.enum'))
                                enumInfos.push(getEnumInfo(element, isReadOnly))
                        return enumInfos
                    }
        
                    const getValueObjectInfos = (aggregate, isReadOnly) => {
                        const getValueObjectInfo = (element, isReadOnly) => {
                            const getValueObjectProperties = (valueObject) => {
                                return valueObject.fieldDescriptors.map(fieldDescriptor => {
                                    return {
                                        name: fieldDescriptor.name,
                                        displayName: fieldDescriptor.displayName,
                                        type: fieldDescriptor.className,
                                        isKey: fieldDescriptor.isKey,
                                        isForeignProperty: (fieldDescriptor.className.toLowerCase() === aggregate.name.toLowerCase())
                                    }
                                })
                            }
        
                            let valueObjectInfo = {}
                            valueObjectInfo.id = element.id ? element.id : element.elementView.id
                            valueObjectInfo.name = element.name
                            if(!isReadOnly) valueObjectInfo.properties = getValueObjectProperties(element)
                            return valueObjectInfo
                        }
        
                        let valueObjectInfos = []
                        for(let element of Object.values(aggregate.aggregateRoot.entities.elements)){
                            if(element && (element._type === 'org.uengine.uml.model.vo.Class'))
                                valueObjectInfos.push(getValueObjectInfo(element, isReadOnly))
                        }
                        return valueObjectInfos
                    }
        
                    const getCommandInfos = (aggregate, isReadOnly, boundedContext, modelValue) => {
                        const getCommandInfo = (element, isReadOnly, boundedContext, modelValue) => {
                            const getOutputEvents = (command, modelValue) => {
                                let outputEvents = []
                                for(let relation of Object.values(modelValue.relations)){
                                    if(relation && relation.sourceElement.id === command.id && 
                                       relation.targetElement._type === 'org.uengine.modeling.model.Event')
                                        outputEvents.push({
                                            id: relation.targetElement.id,
                                            name: relation.targetElement.name
                                        })
                                }
                                return outputEvents
                            }
        
                            const getCommandProperties = (command) => {
                                return command.fieldDescriptors.map(fieldDescriptor => {
                                    return {
                                        name: fieldDescriptor.name,
                                        displayName: fieldDescriptor.displayName,
                                        type: fieldDescriptor.className,
                                        isKey: fieldDescriptor.isKey
                                    }
                                })
                            }
        
                            const getPolicyInfos = (command, boundedContext, modelValue) => {
                                const getPolicyInfo = (policy, modelValue) => {
                                    const getPolicyInputEvents = (policy, modelValue) => {
                                        let inputEvents = []
                                        for(let relation of Object.values(modelValue.relations)){
                                            if(relation &&
                                            relation.targetElement.id === policy.id &&
                                            relation.sourceElement._type === 'org.uengine.modeling.model.Event'){
                                                inputEvents.push({
                                                    id: relation.sourceElement.id,
                                                    name: relation.sourceElement.name
                                                })
                                            }
                                        }
                                        return inputEvents
                                    }
        
                                    let policyInfo = {}
                                    policyInfo.id = policy.id ? policy.id : policy.elementView.id
                                    policyInfo.name = policy.name
                                    policyInfo.displayName = policy.displayName
                                    policyInfo.inputEvents = getPolicyInputEvents(policy, modelValue)
                                    return policyInfo
                                }
        
                                let policies = []
                                for(let relation of Object.values(modelValue.relations)){
                                    if(relation &&
                                    relation.targetElement.id === command.id &&
                                    relation.sourceElement.boundedContext.id === boundedContext.id &&
                                    relation.sourceElement._type === 'org.uengine.modeling.model.Policy'){
                                        let policy = modelValue.elements[relation.sourceElement.id]
                                        policies.push(getPolicyInfo(policy, modelValue))
                                    }
                                }
                                return policies
                            }
        
                            let commandInfo = {}
                            commandInfo.id = element.id ? element.id : element.elementView.id
                            commandInfo.name = element.name
                            commandInfo.displayName = element.displayName
                            commandInfo.api_verb = (element.restRepositoryInfo && element.restRepositoryInfo.method) ? element.restRepositoryInfo.method : "POST"
                            commandInfo.outputEvents = getOutputEvents(element, modelValue)
                            if(!isReadOnly) commandInfo.properties = getCommandProperties(element)
                            commandInfo.inputPolicies = getPolicyInfos(element, boundedContext, modelValue)
                            return commandInfo
                        }
        
                        let commandInfos = []
                        for(let element of Object.values(modelValue.elements)){
                            if(element && (element._type === 'org.uengine.modeling.model.Command') &&
                            (element.boundedContext.id === boundedContext.id) &&
                            (element.aggregate.id === aggregate.id)){
                                commandInfos.push(getCommandInfo(element, isReadOnly, boundedContext, modelValue))
                            }
                        }
                        return commandInfos
                    }
        
                    const getEventInfos = (aggregate, isReadOnly, boundedContext, modelValue) => {
                        const getEventInfo = (element, isReadOnly) => {
                            const getEventProperties = (event) => {
                                return event.fieldDescriptors.map(fieldDescriptor => {
                                    return {
                                        name: fieldDescriptor.name,
                                        displayName: fieldDescriptor.displayName,
                                        type: fieldDescriptor.className,
                                        isKey: fieldDescriptor.isKey,
                                    }
                                })
                            }
        
                            let eventInfo = {}
                            eventInfo.id = element.id ? element.id : element.elementView.id
                            eventInfo.name = element.name
                            eventInfo.displayName = element.displayName
                            if(!isReadOnly) eventInfo.properties = getEventProperties(element)
                            return eventInfo
                        }
        
                        let events = []
                        for(let element of Object.values(modelValue.elements)){
                            if(element && (element._type === 'org.uengine.modeling.model.Event') &&
                            (element.boundedContext.id === boundedContext.id) &&
                            (element.aggregate.id === aggregate.id)){
                                events.push(getEventInfo(element, isReadOnly))
                            }
                        }
                        return events
                    }
        
                    let aggegateInfo = {}
                    aggegateInfo.id = aggregate.id ? aggregate.id : aggregate.elementView.id
                    aggegateInfo.name = aggregate.name
                    aggegateInfo.displayName = aggregate.displayName
                    if(!isReadOnly) aggegateInfo.properties = getAggregateProperties(aggregate)
                    aggegateInfo.enumerations = getEnumInfos(aggregate, isReadOnly)
                    aggegateInfo.valueObjects = getValueObjectInfos(aggregate, isReadOnly)
                    aggegateInfo.commands = getCommandInfos(aggregate, isReadOnly, boundedContext, modelValue)
                    aggegateInfo.events = getEventInfos(aggregate, isReadOnly, boundedContext, modelValue)
        
                    return aggegateInfo
                }
        
                const getAllActors = (boundedContext, modelValue) => {
                    let actors = []
                    for(let element of Object.values(modelValue.elements)){
                        if(element && (element._type === 'org.uengine.modeling.model.Actor') &&
                        (element.boundedContext.id === boundedContext.id)){
                            actors.push({
                                id: element.id ? element.id : element.elementView.id,
                                name: element.name
                            })
                        }
                    }
                    return actors
                }
        
                let boundedContextInfo = {}
                boundedContextInfo.id = boundedContext.id ? boundedContext.id : boundedContext.elementView.id
                boundedContextInfo.isReadOnly = boundedContext.id !== getSelectedBoundedContextId(selectedElement)
                boundedContextInfo.name = boundedContext.name
                boundedContextInfo.displayName = boundedContext.displayName
                
                boundedContextInfo.aggregates = {}
                for(let aggregate of getAllAggregates(boundedContext, modelValue))
                    boundedContextInfo.aggregates[aggregate.id] = getAggregateInfo(aggregate, boundedContextInfo.isReadOnly, boundedContext, modelValue)
                
                boundedContextInfo.actors = getAllActors(boundedContext, modelValue)
        
                return boundedContextInfo
            }
            
            let boundedContextInfos = {}
            for(let boundedContext of getAllBoundedContexts(modelValue))
                boundedContextInfos[boundedContext.id] = getBoundedContextInfo(boundedContext, modelValue, selectedElement)
            return boundedContextInfos;
        }

        const getSystemPrompt = (preprocessModelValue, debeziumLogs) => {
            return `
당신은 특정 시스템의 데이터베이스에서 발생하는 Debezium CDC 트랜젝션 로그를 해석해서 주어진 이벤트 스토밍 모델을 수정하기 위한 JsonPath 쿼리들을 생성해야 합니다.
Debezium CDC 트랜젝션 로그에서 기존 이벤트 모델에 반영되어 있지 않은 유즈케이스를 찾아서 그에 맞춰서 이벤트 스토밍 모델에 반영하면됩니다.

다음 규칙을 따라서 작성해주세요.
1. 제공된 Debezium CDC 트랜젝션에서 발견된 속성 및 Bounded Context에 대해서만 수정 사항들을 생성해 주세요. 그 외의 추가적인 속성을 추측하지 마세요.
2. 각 Bounded Context는 서로와 상호작용을 합니다. 각 Bounded Context는 도메인 이벤트가 발생하면, 다른 Bounded Context의 정책을 호출하고, 그 정책이 Bounded Context의 Aggregate에 속한 Command를 호출하는 식으로 이벤트 내용을 전달할 수 있습니다.
3. 출력되는 JSON 객체에는 주석을 절대로 작성하면 안 됩니다.
4. 자바에서 제공하는 기본 데이터타입 혹은 Address, Portrait, Rating, Money, Email을 제외한 속성들은 enumerations나 valueObjects로 직접 정의해야합니다.
5. event.block이나 hibernate_sequence와 같이 비즈니스 로직과 직접적으로 관련이 없는 트렌젝션은 무시해야합니다.
6. id 속성은 고유해야 하며, 수정하면 안 됩니다.

당신은 수정을 수행 할 이벤트 스토밍 모델에 대한 JSON 객체를 얻습니다.
대략적인 구조는 다음과 같습니다.
{
    // 이벤트 스토밍 모델은 여러개의 Bounded Context로 이루어져 있습니다.
    "<boundedContextId>": {
        // 해당 값이 true로 설정된 경우, 해당 Bounded Context는 참조용으로만 사용해야 하며, 실제 그 내용을 수정할 수는 없습니다.
        // 참조용으로 전달된 Bounded Context는 일부 속성만 제공하며, 해당 속성들을 적절히 활용해서 수정할 수 있습니다.
        "isReadOnly": <true | false>,

        "id": "<boundedContextId>",
        "name": "<boundedContextName>",
        "displayName": "<boundedContextAlias>",
        "actors": [
            {
                "id": "<actorId>",
                "name": "<actorName>"
            }
        ],
        
        // Bounded Context는 여러개의 aggregate를 가지고 있습니다.
        "aggregates": {
            "<aggregateId>": {
                "id": "<aggregateId>",
                "name": "<aggregateName>",
                "displayName": "<aggregateAlias>",
                
                // aggregate는 Aggregate Root에 관한 속성들을 가지고 있습니다.
                "properties": [
                    {
                        "name": "<propertyName>",
                        "displayName": "<propertyAlias>",
                        
                        // "<propertyType>"은 다음 3가지중 하나에 속해야합니다.
                        // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다. 이때, 패키지 전체 경로를 적지 말고, 클래스 명만 적어주세요. (ex. java.lang.String > String)
                        // 2. 다음 같은 값 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                        // 3. enumerations, valueObjects에 정의된 name이 있는 경우, 해당 이름을 사용할 수 있습니다.
                        "type": "<propertyType>",
                        "isKey": <true | false>, // 기본키 여부입니다. properties 중 오직 하나만 isKey가 true로 설정되어야 합니다.
                    }
                ],
                
                // Aggregate Root에 관한 속성들에 사용되는 Enum 객체에 대한 정의입니다.
                "enumerations": [
                    {
                        "id": "<enumerationId>",
                        "name": "<enumerationName>",
                        "items": ["<itemName1>", "<itemName2>"]
                    }
                ],
                
                // Aggregate Root에 관한 속성들에 사용되는 ValueObject 객체에 대한 정의입니다.
                "valueObjects": [
                    {
                        "id": "<valueObjectId>",
                        "name": "<valueObjectName>",
                        "properties": [
                            {
                                "name": "<propertyName>",
                                "displayName": "<propertyAlias>",
                                "type": "<propertyType>",
                                "isKey": <true | false>,
                                "isForeignProperty": <true | false> // 외래키 여부입니다. 이 속성이 다른 테이블의 속성을 참조하는 경우, 이 값은 true로 설정해야 합니다.
                            }
                        ]
                    }
                ],
                
                // REST API를 통해서 요청할 경우를 나타내는 command 목록입니다.
                "commands": [
                    {
                        "id": "<commandId>",
                        "name": "<commandName>",
                        "displayName": "<commandAlias>",
                        "api_verb":  <"POST" | "DELETE" | "PUT">,
                        "outputEvents": [{
                            "id": "<eventId>",
                            "name": "<eventName>"
                        }], // 이 command에 요청한 경우, 발생하게 되는 event에 대한 정보를 적습니다.
                        
                        // 이 커멘드를 호출시킨 정책에 관련된 정보를 적습니다.
                        // 정책은 다른 Bounded Context에 있는 Event가 호출해서 해당 이벤트에 대해 적절한 동작을 수행하게 만듭니다.
                        "inputPolicies": [
                            {
                                "id": "<policyId>",
                                "inputEvents": [{
                                    "id": "<eventId>",
                                    "name": "<eventName>"
                                }],
                                "name": "<policyName>",
                                "displayName": "<policyAlias>"
                            }
                        ],
                        
                        "properties": [
                            {
                                "name": "<propertyName>",
                                "displayName": "<propertyAlias>",
                                "type": "<propertyType>",
                                "isKey": <true | false>
                            }
                        ]
                    }
                ],
                
                // command에 의해서 발생한 event 목록입니다.
                "events": [
                    {
                        "id": "<eventId>",
                        "name": "<eventName>",
                        "displayName": "<eventAlias>",
                        
                        "properties": [
                            {
                                "name": "<propertyName>",
                                "displayName": "<propertyAlias>",
                                "type": "<propertyType>",
                                "isKey": <true | false>
                            }
                        ]
                    }
                ]
            }
        }
    }
}

당신이 반환해야 하는 형식은 다음과 같습니다.
{
    // 먼저, 당신은 Debezium 로그에서 기존의 이벤트 모델링에 반영되지 않는 유즈케이스를 식별해서 적어야 합니다.
    // 예를 들어서 CreateProduct와 같은 상품 추가 Command는 이미 주어진 이벤트 스토밍 객체에 있다고 가정해보겠습니다.
    // 이때, Debezium Logs에서 상품을 삭제하는 트랜젝션이 발생이 있을 경우, 이것은 기존 이벤트 스토밍 객체에 없으므로, usecase에 추가해야합니다.
    "usecases": [
        {
            "id": "<usecaseId>",
            "name": "<usecaseName>",
            "displayName": "<usecaseAlias>"
        }
    ],

    // usecase에서 발견된 새로운 command나 event를 생성하거나 이에 맞게 aggregate에 속성을 추가하는 등에 사용할 수 있습니다.
    "jsonPathAddQueries": [
        {
            "fromUsecaseId": "<usecaseId>", // 어느 유즈케이스의 내용을 반영하기 위한 쿼리인지 적어주세요.
            "jsonPath": "",
            "value": {}
        }
    ],
    
    // usecase에서 발견된 command나 event와 기존의 이벤트 스토밍 속성이 다를 경우, 이를 교정하는 등의 목적으로 사용될 수 있습니다.
    "jsonPathReplaceQueries": [
        {
            "fromUsecaseId": "<usecaseId>",
            "jsonPath": "",
            "value": {}
        }
    ],
    
    // usecase에서 발견된 command나 event와 기존의 이벤트 스토밍 속성이 다를 경우, 이를 교정하는 등의 목적으로 사용될 수 있습니다.
    "jsonPathDeleteQueries: [
        {
            "fromUsecaseId": "<usecaseId>",
            "jsonPath": ""
        }
    ]
}

예를 들어서, 트렌젝션 로그에 고객 정보를 삭제하는 로그가 있다고 가정하면 다음과 같이 반환하면 됩니다.
{
    "usecases": [
        {
            "id": "deleteCustomer",
            "name": "DeleteCustomer",
            "displayName": "고객 삭제"
        }
    ],

    "jsonPathAddQueries": [
        {
            "fromUsecaseId": "deleteCustomer",
            "jsonPath": "$['customer-management']['aggregates']['customers']['commands']",
            "value": {
                "id": "deleteCustomer",
                "name": "DeleteCustomer",
                "displayName": "고객 삭제",
                "api_verb": "DELETE",
                "outputEvents": ["CustomerDeleted"],
                "properties": [
                    {
                        "name": "customerId",
                        "displayName": "고객 ID",
                        "type": "String",
                        "isKey": true
                    }
                ]
            }
        },
        {
            "fromUsecaseId": "deleteCustomer",
            "jsonPath": "$['customer-management']['aggregates']['customers']['events']",
            "value": {
                "id": "CustomerDeleted",
                "name": "CustomerDeleted",
                "displayName": "고객 삭제됨",
                "properties": [
                    {
                        "name": "customerId",
                        "displayName": "고객 ID",
                        "type": "String",
                        "isKey": true
                    }
                ]
            }
        }
    ],
    "jsonPathReplaceQueries": [],
    "jsonPathDeleteQueries": []
}

[INPUT]
- 기존 이벤트스토밍 모델 객체
${preprocessModelValue}

- Debezium 트렌젝션 로그
${debeziumLogs}

[OUTPUT]
`
        }

        this.preprocessModelValue = getPreprocessModelValue(this.client.modelValue, this.client.input.selectedElement)
        return getSystemPrompt(
            JSON.stringify(this.preprocessModelValue, null, 2),
            this.client.input.modificationMessage
        )
    }

    createModel(text){
        var me = this

        const getModelvalueModificationQueries = (preprocessModelValue, aiTextResult, modelValue) => {
            const getPrevNextModelValue = (preprocessModelValue, aiTextResult) => {
                const parseToJson = (aiTextResult) => {
                    if(aiTextResult.includes("```json"))
                        aiTextResult = aiTextResult.match(/```json\n([\s\S]+)\n```/)[1]
                    return JSON.parse(aiTextResult.trim())
                }
            
                const getPrevPreModelValue = (preprocessModelValue) => {
                    const prevPreModelValue = {}
                    for(let boundedContext of Object.values(preprocessModelValue)){
                        if(boundedContext && (!boundedContext.isReadOnly))
                            prevPreModelValue[boundedContext.id] = boundedContext
                    }
                    return prevPreModelValue
                }
            
                const applyJsonPathQueries = (nextPreModelValue, aiJsonResult) => {
                    const applyJsonPathAddQuery = (nextPreModelValue, jsonPathAddQuery) => {
                        const {jsonPath, value} = jsonPathAddQuery
                        jp.apply(nextPreModelValue, jsonPath, (val) => {
                            if (Array.isArray(val)) return [...val, value]
                            else if(typeof val === 'object') return { ...val, ...value }
                            else return value
                        })
                        return nextPreModelValue
                    }
            
                    for(let jsonPathAddQuery of Object.values(aiJsonResult.jsonPathAddQueries)){
                        nextPreModelValue = applyJsonPathAddQuery(nextPreModelValue, jsonPathAddQuery)
                    }
            
                    return nextPreModelValue
                }
        
                const aiJsonResult = parseToJson(aiTextResult)
                const prevPreModelValue = getPrevPreModelValue(preprocessModelValue)
                let nextPreModelValue = JSON.parse(JSON.stringify(prevPreModelValue))
                nextPreModelValue = applyJsonPathQueries(nextPreModelValue, aiJsonResult)
        
                return {
                    prevPreModelValue: Object.values(prevPreModelValue)[0],
                    nextPreModelValue: Object.values(nextPreModelValue)[0],
                    boundedContextId: Object.keys(nextPreModelValue)[0]
                }
            }
        
            const getModificationQueries = (prevPreModelValue, nextPreModelValue, boundedContextId, modelValue) => {
                const uuid = () => {
                    const s4 = () => {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }
            
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
                }
        
                const getEventModificationQueries = (prevPreModelValue, nextPreModelValue, boundedContextId, modelValue) => {
                    let eventAddYPosIndex = 0
        
                    const getEventDifferences = (prevPreModelEvents, nextPreModelEvents) => {
                        const getAddEventDifferences = (prevPreModelEvents, nextPreModelEvents) => {
                            let addEventDifferences = []
                            for(let nextPreModelEvent of Object.values(nextPreModelEvents)){
                                let isEventExist = false
                                for(let prevPreModelEvent of Object.values(prevPreModelEvents)){
                                    if(prevPreModelEvent.id === nextPreModelEvent.id) {
                                        isEventExist = true
                                        break
                                    }
                                }
                                if(!isEventExist)
                                    addEventDifferences.push({
                                        type: "add",
                                        value: nextPreModelEvent
                                    })
                            }
                            return addEventDifferences
                        }
            
                        let eventDifferences = []
                        eventDifferences = eventDifferences.concat(getAddEventDifferences(prevPreModelEvents, nextPreModelEvents))
                        return eventDifferences
                    }
            
                    const getEventModificationQueriesForDifferences = (eventDifferences, boundedContextId, aggregateId, modelValue, aggregate) => {
                        const getEventObjectForAddAction = (eventDifference, boundedContextId, aggregateId, modelValue) => {
                            const getEventObjectBase = (name, displayName, boundedContextId, aggregateId, x, y, elementUUID) => {
                                const elementUUIDtoUse = elementUUID ? elementUUID : uuid()
                                return {
                                    alertURL: "/static/image/symbol/alert-icon.png",
                                    author: me.userUid,
                                    checkAlert: true,
                                    description: null,
                                    id: elementUUIDtoUse,
                                    elementView: {
                                        angle: 0,
                                        height: 115,
                                        id: elementUUIDtoUse,
                                        style: "{}",
                                        width: 100,
                                        x: x, 
                                        y: y, 
                                        _type: "org.uengine.modeling.model.Event"
                                    },
                                    fieldDescriptors: [],
                                    hexagonalView: {
                                        height: 0,
                                        id: elementUUIDtoUse,
                                        style: "{}",
                                        width: 0,
                                        x: 0,
                                        y: 0,
                                        _type: "org.uengine.modeling.model.EventHexagonal"
                                    },
                                    name: name,
                                    displayName: displayName,
                                    nameCamelCase: changeCase.camelCase(name),
                                    namePascalCase: changeCase.pascalCase(name),
                                    namePlural: "",
                                    relationCommandInfo: [],
                                    relationPolicyInfo: [],
                                    rotateStatus: false,
                                    selected: false,
                                    trigger: "@PostPersist",
                                    _type: "org.uengine.modeling.model.Event",
                                    aggregate: {
                                        id: aggregateId,
                                    },
                                    boundedContext: {
                                        id: boundedContextId
                                    }
                                }
                            }
        
                            const getFileDescriptors = (eventDifference) => {
                                return eventDifference.value.properties.map((property) => {
                                    return {
                                        "className": property.type,
                                        "isCopy": false,
                                        "isKey": property.isKey,
                                        "name": property.name,
                                        "nameCamelCase": changeCase.camelCase(property.name),
                                        "namePascalCase": changeCase.pascalCase(property.name),
                                        "displayName": property.displayName,
                                        "_type": "org.uengine.model.FieldDescriptor"
                                    }
                                })
                            }
        
                            const getValidEventPosition = (aggregate, modelValue) => {
                                const getEventObjectsById = (events, modelValue) => {
                                    return events.map((event) => {
                                        return modelValue.elements[event.id]
                                    }).filter(eventObject => eventObject !== null)
                                }
        
                                if(aggregate.events.length > 0) {
                                    const eventObjects = getEventObjectsById(aggregate.events, modelValue)
                                    const x = Math.max(...eventObjects.map((event) => event.elementView.x))
                                    const y = Math.max(...eventObjects.map((event) => event.elementView.y))
        
                                    const validPos = {x: x, y: y+(eventAddYPosIndex*122)+122}
                                    eventAddYPosIndex += 1
                                    return validPos
                                } else {
                                    const aggreateObject = modelValue.elements[aggregateId]
                                    return {
                                        x: aggreateObject.elementView.x + aggreateObject.elementView.width - 35, 
                                        y: aggreateObject.elementView.y - 196
                                    }
                                }
                            }
            
                            const VALID_EVENT_POSITION = getValidEventPosition(aggregate, modelValue)
                            let eventObject = getEventObjectBase(eventDifference.value.name, eventDifference.value.displayName, boundedContextId, aggregateId, VALID_EVENT_POSITION.x, VALID_EVENT_POSITION.y)
                            eventObject.fieldDescriptors = getFileDescriptors(eventDifference)
                            return eventObject
                        }
            
                        let eventModificationQueries = []
                        for(let eventDifference of eventDifferences){
                            if(eventDifference.type === "add"){
                                eventModificationQueries.push({
                                    type: "event",
                                    action: "add",
                                    value: getEventObjectForAddAction(eventDifference, boundedContextId, aggregateId, modelValue)
                                })
                            }
                        }
                        return eventModificationQueries
                    }
                    
                    let eventModificationQueries = []
                    for(let aggregateKey of Object.keys(prevPreModelValue.aggregates)){
                        if(prevPreModelValue.aggregates[aggregateKey] && nextPreModelValue.aggregates[aggregateKey]){
                            const prevAggregate = prevPreModelValue.aggregates[aggregateKey]
                            const nextAggregate = nextPreModelValue.aggregates[aggregateKey]
                            const eventDifferences = getEventDifferences(prevAggregate.events, nextAggregate.events)
                            eventModificationQueries = eventModificationQueries.concat(getEventModificationQueriesForDifferences(eventDifferences, boundedContextId, aggregateKey, modelValue, prevAggregate))
                        }
                    }
                    return eventModificationQueries
                }
        
                const getCommandModificationQueries = (prevPreModelValue, nextPreModelValue, boundedContextId, modelValue) => {
                    let commandAddYPosIndex = 0
                    
                    const getCommandDifferences = (prevPreModelCommands, nextPreModelCommands) => {
                        const getAddCommandDifferences = (prevPreModelCommands, nextPreModelCommands) => {
                            let addCommandDifferences = []
                            for(let nextPreModelCommand of Object.values(nextPreModelCommands)){
                                let isCommandExist = false
                                for(let prevPreModelCommand of Object.values(prevPreModelCommands)){
                                    if(prevPreModelCommand.id === nextPreModelCommand.id) {
                                        isCommandExist = true
                                        break
                                    }
                                }
                                if(!isCommandExist)
                                    addCommandDifferences.push({
                                        type: "add",
                                        value: nextPreModelCommand
                                    })
                            }
                            return addCommandDifferences
                        }
            
                        let commandDifferences = []
                        commandDifferences = commandDifferences.concat(getAddCommandDifferences(prevPreModelCommands, nextPreModelCommands))
                        return commandDifferences
                    }
                    
                    const getCommandModificationQueriesForDifferences = (commandDifferences, boundedContextId, aggregateId, modelValue, aggregate) => {
                        const getCommandObjectForAddAction = (commandDifference, boundedContextId, aggregateId, modelValue) => {
                            const getCommandObjectBase = (name, displayName, api_verb, outputEvents, boundedContextId, aggregateId, x, y, elementUUID) => {
                                const elementUUIDtoUse = elementUUID ? elementUUID : uuid()
                                return {
                                    _type: "org.uengine.modeling.model.Command",
                                    outputEvents: outputEvents,
                                    aggregate: {
                                        id: aggregateId
                                    },
                                    author: me.userUid,
                                    boundedContext: {
                                        id: boundedContextId,
                                    },
                                    controllerInfo: {
                                        method: api_verb
                                    },
                                    fieldDescriptors: [],
                                    description: null,
                                    id: elementUUIDtoUse,
                                    elementView: {
                                        _type: "org.uengine.modeling.model.Command",
                                        height: 115,
                                        id: elementUUIDtoUse,
                                        style: "{}",
                                        width: 100,
                                        x: x, 
                                        y: y,
                                        "z-index": 999
                                    },
                                    hexagonalView: {
                                        _type: "org.uengine.modeling.model.CommandHexagonal",
                                        height: 0,
                                        id: elementUUIDtoUse,
                                        style: "{}",
                                        width: 0,
                                        x: 0,
                                        y: 0
                                    },
                                    isRestRepository: api_verb == 'PUT' ? false:true,
                                    name: name,
                                    displayName: displayName,
                                    nameCamelCase: changeCase.camelCase(name),
                                    namePascalCase: changeCase.pascalCase(name),
                                    namePlural: "",
                                    relationCommandInfo: [],
                                    relationEventInfo: [],
                                    restRepositoryInfo: {
                                        method: api_verb ? api_verb : 'POST'
                                    },
                                    rotateStatus: false,
                                    selected: false,
                                    trigger: "@PrePersist",
                                }
                            }
        
                            const getFileDescriptors = (commandDifference) => {
                                return commandDifference.value.properties.map((property) => {
                                    return {
                                        "className": property.type,
                                        "isCopy": false,
                                        "isKey": property.isKey,
                                        "name": property.name,
                                        "nameCamelCase": changeCase.camelCase(property.name),
                                        "namePascalCase": changeCase.pascalCase(property.name),
                                        "displayName": property.displayName,
                                        "_type": "org.uengine.model.FieldDescriptor"
                                    }
                                })
                            }
        
                            const getValidCommandPosition = (aggregate, modelValue) => {
                                const getCommandObjectsById = (commands, modelValue) => {
                                    return commands.map((command) => {
                                        return modelValue.elements[command.id]
                                    }).filter(commandObject => commandObject !== null)
                                }
        
                                if(aggregate.commands.length > 0) {
                                    const commandObjects = getCommandObjectsById(aggregate.commands, modelValue)
                                    const x = Math.max(...commandObjects.map((command) => command.elementView.x))
                                    const y = Math.max(...commandObjects.map((command) => command.elementView.y))
        
                                    const validPos = {x: x, y: y+(commandAddYPosIndex*122)+122}
                                    commandAddYPosIndex += 1
                                    return validPos
                                } else {
                                    const aggreateObject = modelValue.elements[aggregateId]
                                    return {
                                        x: aggreateObject.elementView.x + - 90, 
                                        y: aggreateObject.elementView.y - 196
                                    }
                                }
                            }
        
                            const getOutputEventNames = (outputEvents) => {
                                return outputEvents.map((event) => {
                                    return event.name
                                })
                            }
            
                            const VALID_EVENT_POSITION = getValidCommandPosition(aggregate, modelValue)
                            let commandObject = getCommandObjectBase(commandDifference.value.name, commandDifference.value.displayName, 
                                commandDifference.value.api_verb, getOutputEventNames(commandDifference.value.outputEvents),
                                boundedContextId, aggregateId, VALID_EVENT_POSITION.x, VALID_EVENT_POSITION.y)
                            commandObject.fieldDescriptors = getFileDescriptors(commandDifference)
                            return commandObject
                        }
            
                        let commandModificationQueries = []
                        for(let commandDifference of commandDifferences){
                            if(commandDifference.type === "add"){
                                commandModificationQueries.push({
                                    type: "command",
                                    action: "add",
                                    value: getCommandObjectForAddAction(commandDifference, boundedContextId, aggregateId, modelValue)
                                })
                            }
                        }
                        return commandModificationQueries
                    }
                    
        
                    let commandModificationQueries = []
                    for(let aggregateKey of Object.keys(prevPreModelValue.aggregates)){
                        if(prevPreModelValue.aggregates[aggregateKey] && nextPreModelValue.aggregates[aggregateKey]){
                            const prevAggregate = prevPreModelValue.aggregates[aggregateKey]
                            const nextAggregate = nextPreModelValue.aggregates[aggregateKey]
                            const commandDifferences = getCommandDifferences(prevAggregate.commands, nextAggregate.commands)
                            commandModificationQueries = commandModificationQueries.concat(getCommandModificationQueriesForDifferences(commandDifferences, boundedContextId, aggregateKey, modelValue, prevAggregate))
                        }
                    }
                    return commandModificationQueries
                }
        
                let modificationQueries = []
                modificationQueries = modificationQueries.concat(getEventModificationQueries(prevPreModelValue, nextPreModelValue, boundedContextId, modelValue))
                modificationQueries = modificationQueries.concat(getCommandModificationQueries(prevPreModelValue, nextPreModelValue, boundedContextId, modelValue))
                return modificationQueries
            }
        
            const {prevPreModelValue, nextPreModelValue, boundedContextId} = getPrevNextModelValue(preprocessModelValue, aiTextResult)
            const modelValueModificationQueries = getModificationQueries(prevPreModelValue, nextPreModelValue, boundedContextId, modelValue)
            return modelValueModificationQueries
        }
        
        try{

            console.log("[*] 현재 DebeziumLogsModificationGenerator에서 출력중인 값 ")
            console.log(text)
            
            return {
                modificationQueries: getModelvalueModificationQueries(
                    this.preprocessModelValue, text, this.client.modelValue
                ),
                fromGeneratorId: "DebeziumLogsModificationGenerator"
            }

        }catch(e){

            console.log("[!] DebeziumLogsModificationGenerator에서 생성 결과 처리중 에러 발생")
            console.log(text)
            console.log(e)

            return {
                modificationQueries: [],
                fromGeneratorId: "DebeziumLogsModificationGenerator"
            }
            
        }
    }
}


module.exports = DebeziumLogsModificationGenerator;