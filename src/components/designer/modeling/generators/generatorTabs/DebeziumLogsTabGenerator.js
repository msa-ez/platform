const JsonAIGenerator = require("../JsonAIGenerator");
const changeCase = require('change-case');

class DebeziumLogsTabGenerator extends JsonAIGenerator{
    constructor(client, messageObj){
        super(client);

        this.model = "gpt-4o"
        this.preferredLanguage = this.setPreferredLanguage();
        this.originalLanguage = this.preferredLanguage.toLowerCase();
        this.messageObj = messageObj
        this.modelName = "DebeziumLogsTabGenerator"
    }

    createPrompt(userProps, modelValue){
        const getPreprocessModelValue = (modelValue) => {
            const getAllBoundedContexts = (modelValue) => {
                return Object.values(modelValue.elements)
                    .filter(element => element && element._type === 'org.uengine.modeling.model.BoundedContext')
            }
        
            const getBoundedContextInfo = (boundedContext, modelValue) => {
                const getAllAggregates = (boundedContext, modelValue) => {
                    return boundedContext.aggregates.map(aggregate => modelValue.elements[aggregate.id])
                }
        
                const getAggregateInfo = (aggregate, boundedContext, modelValue) => {
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
        
                    const getEnumInfos = (aggregate) => {
                        const getEnumInfo = (element) => {
                            let enumInfo = {}
                            enumInfo.id = element.id ? element.id : element.elementView.id
                            enumInfo.name = element.name
                            enumInfo.items = element.items.map(item => {
                                return item.value
                            })
                            return enumInfo
                        }
        
                        let enumInfos = []
                        if(aggregate.aggregateRoot && aggregate.aggregateRoot.entities && aggregate.aggregateRoot.entities.elements) {
                            for(let element of Object.values(aggregate.aggregateRoot.entities.elements))
                                if(element && (element._type === 'org.uengine.uml.model.enum'))
                                    enumInfos.push(getEnumInfo(element))
                        }
                        return enumInfos
                    }
        
                    const getValueObjectInfos = (aggregate) => {
                        const getValueObjectInfo = (element) => {
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
                            valueObjectInfo.properties = getValueObjectProperties(element)
                            return valueObjectInfo
                        }
        
                        let valueObjectInfos = []
                        if(aggregate.aggregateRoot && aggregate.aggregateRoot.entities && aggregate.aggregateRoot.entities.elements) {
                            for(let element of Object.values(aggregate.aggregateRoot.entities.elements)){
                                if(element && (element._type === 'org.uengine.uml.model.vo.Class'))
                                    valueObjectInfos.push(getValueObjectInfo(element))
                            }
                        }
                        return valueObjectInfos
                    }
        
                    const getCommandInfos = (aggregate, boundedContext, modelValue) => {
                        const getCommandInfo = (element, boundedContext, modelValue) => {
                            const getOutputEvents = (command, modelValue) => {
                                let outputEvents = []
                                for(let relation of Object.values(modelValue.relations)){
                                    if(relation && relation.sourceElement.id === command.id && 
                                       relation.targetElement._type === 'org.uengine.modeling.model.Event')
                                        outputEvents.push({
                                            relationId: relation.id ? relation.id : relation.elementView.id,
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
                                const getPolicyInfo = (policy, modelValue, relation) => {
                                    const getPolicyInputEvents = (policy, modelValue) => {
                                        let inputEvents = []
                                        for(let relation of Object.values(modelValue.relations)){
                                            if(relation &&
                                            relation.targetElement.id === policy.id &&
                                            relation.sourceElement._type === 'org.uengine.modeling.model.Event'){
                                                inputEvents.push({
                                                    relationId: relation.id ? relation.id : relation.elementView.id,
                                                    id: relation.sourceElement.id,
                                                    name: relation.sourceElement.name
                                                })
                                            }
                                        }
                                        return inputEvents
                                    }
        
                                    let policyInfo = {}
                                    policyInfo.relationId = relation.id ? relation.id : relation.elementView.id
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
                                        policies.push(getPolicyInfo(policy, modelValue, relation))
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
                            commandInfo.properties = getCommandProperties(element)
                            commandInfo.inputPolicies = getPolicyInfos(element, boundedContext, modelValue)
                            return commandInfo
                        }
        
                        let commandInfos = []
                        for(let element of Object.values(modelValue.elements)){
                            if(element && (element._type === 'org.uengine.modeling.model.Command') &&
                            (element.boundedContext.id === boundedContext.id) &&
                            (element.aggregate.id === aggregate.id)){
                                commandInfos.push(getCommandInfo(element, boundedContext, modelValue))
                            }
                        }
                        return commandInfos
                    }
        
                    const getEventInfos = (aggregate, boundedContext, modelValue) => {
                        const getEventInfo = (element) => {
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
                            eventInfo.properties = getEventProperties(element)
                            return eventInfo
                        }
        
                        let events = []
                        for(let element of Object.values(modelValue.elements)){
                            if(element && (element._type === 'org.uengine.modeling.model.Event') &&
                            (element.boundedContext.id === boundedContext.id) &&
                            (element.aggregate.id === aggregate.id)){
                                events.push(getEventInfo(element))
                            }
                        }
                        return events
                    }
        
                    let aggegateInfo = {}
                    aggegateInfo.id = aggregate.id ? aggregate.id : aggregate.elementView.id
                    aggegateInfo.name = aggregate.name
                    aggegateInfo.displayName = aggregate.displayName
                    aggegateInfo.properties = getAggregateProperties(aggregate)
                    aggegateInfo.enumerations = getEnumInfos(aggregate)
                    aggegateInfo.valueObjects = getValueObjectInfos(aggregate)
                    aggegateInfo.commands = getCommandInfos(aggregate, boundedContext, modelValue)
                    aggegateInfo.events = getEventInfos(aggregate, boundedContext, modelValue)
        
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
                boundedContextInfo.name = boundedContext.name
                boundedContextInfo.displayName = boundedContext.displayName
                
                boundedContextInfo.aggregates = {}
                for(let aggregate of getAllAggregates(boundedContext, modelValue))
                    boundedContextInfo.aggregates[aggregate.id] = getAggregateInfo(aggregate, boundedContext, modelValue)
                
                boundedContextInfo.actors = getAllActors(boundedContext, modelValue)
        
                return boundedContextInfo
            }
            
            let boundedContextInfos = {}
            for(let boundedContext of getAllBoundedContexts(modelValue))
                boundedContextInfos[boundedContext.id] = getBoundedContextInfo(boundedContext, modelValue)
            return boundedContextInfos;
        }

        const getSystemPrompt = (preprocessModelValue, debeziumLogs) => {
            const getFrontGuidePrompt = () => {
                return `당신은 특정 시스템의 데이터베이스에서 발생하는 Debezium CDC 트랜잭션 로그를 해석해서 주어진 이벤트 스토밍 모델을 수정하기 위한 액션이 담긴 쿼리를 작성해야 합니다.
Debezium CDC 트랜잭션 로그에서 기존 이벤트 모델에 반영되어 있지 않은 유즈케이스들을 찾아서 그에 맞춰서 이벤트 스토밍 모델에 반영하기 위한 액션이 담긴 쿼리들을 작성하시면 됩니다.

다음 규칙을 따라서 작성해 주세요.
1. 제공된 Debezium CDC 트랜잭션에서 발견된 속성 및 Bounded Context에 대해서만 수정 사항들을 생성해 주세요. 그 외의 추가적인 속성을 추측하지 마세요.
2. 각 Bounded Context는 서로와 상호작용을 합니다. 각 Bounded Context는 도메인 이벤트가 발생하면, 다른 Bounded Context의 정책을 호출하고, 그 정책이 Bounded Context의 Aggregate에 속한 Command를 호출하는 식으로 이벤트 내용을 전달할 수 있습니다.
3. 출력되는 JSON 객체에는 주석을 절대로 작성하면 안 됩니다.
4. 자바에서 제공하는 기본 데이터타입 혹은 Address, Portrait, Rating, Money, Email을 제외한 속성들은 enumerations나 valueObjects로 직접 정의해야 합니다.
5. event.block이나 hibernate_sequence와 같이 비즈니스 로직과 직접적으로 관련이 없는 트랜잭션은 무시해야 합니다.
6. id 속성은 고유해야 하며, 수정하면 안 됩니다.

`
            }

            const getInputSyntaxGuidePrompt = () => {
                return `당신은 수정을 수행 할 이벤트 스토밍 모델에 대한 요약된 정보가 담긴 JSON 객체를 얻습니다.
대략적인 구조는 다음과 같습니다.
{
    // 이벤트 스토밍 모델은 여러개의 Bounded Context로 이루어져 있습니다.
    "<boundedContextId>": {
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
                            "relationId": "<relationId>",
                            "id": "<eventId>",
                            "name": "<eventName>"
                        }], // 이 command에 요청한 경우, 발생하게 되는 event에 대한 정보가 적힙니다.
                        
                        // 이 커멘드를 호출시킨 정책에 관련된 정보를 적힙니다.
                        // 정책은 다른 Bounded Context에 있는 Event가 호출해서 해당 이벤트에 대해 적절한 동작을 수행하게 만듭니다.
                        "inputPolicies": [
                            {
                                "relationId": "<relationId>",
                                "id": "<policyId>",
                                "inputEvents": [{
                                    "relationId": "<relationId>",
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

`
            }

            const getOutputSyntaxGuidePrompt = () => {
                return `당신은 리스트를 반환하며, 그 리스트에는 특정 액션을 수행하기 위한 JSON 객체들이 담겨야 합니다.
다음과 같은 형태로 반환하면 됩니다.
{
    // 먼저, 당신은 Debezium 트랜잭션 로그의 내용을 바탕으로 트랜잭션 별로 id와 description을 적어야 합니다.
    // 전달된 트랜잭션 로그들의 순서와 일치해야 합니다.
    "transactions": [
        {
            "id": "<transactionId>",
            "description": "<transactionDescription>",

            // 해당 트랜잭션에서 사용한 속성들을 적습니다.
            "properties": [
                {
                    "name": "<propertyName>",
                    "displayName": "<propertyAlias>",
                    "type": "<propertyType>",
                    "isKey": <true | false>,
                    "isForeignProperty": <true | false>
                }
            ]
        }
    ],

    // 위에서 정의한 transactions를 바탕으로 당신은 Debezium 로그에서 기존의 이벤트 모델링에 반영되지 않는 유즈케이스들을 최대한 식별해서 적어야 합니다.
    // 예를 들어서 위의 transactions에 주어진 이벤트 스토밍 정보에는 없는 상품 추가와 관련된 트랜잭션이 있으면, 해당 트랜잭션 id와 함께 유즈케이스를 적으면 됩니다.
    "usecases": [
        {
            // 어떤 트랜잭션 id와 관계가 있는 유즈케이스인지 적습니다.
            // 여기에 적힌 트랜잭션에서 선언된 속성들은 이 유즈케이스에서 활용하게 됩니다.
            "relatedTransactionId": "<transactionId>",

            "id": "<usecaseId>",
            "name": "<usecaseName>",
            "displayName": "<usecaseAlias>",
            "actor": "<actorName>", // 이 유즈케이스와 관련된 액터 이름을 적습니다.

            // 해당 유즈케이스에 대해서 수행할 쿼리들의 ID를 미리 작성합니다.
            // 해당 쿼리 ID들은 추후에 queries에서 전부 구현되어야 합니다.
            "relatedBoundedContextQueryIds": ["<queryId>"], // 이 유즈케이스에서 사용할 있는 BoundedContext를 INPUT으로 제공한 이벤트 스토밍 모델에서 발견할 수 없을 경우, 쿼리를 추가합니다.

            "relatedAggregateQueryIds": ["<queryId>"], 
            "relatedEnumerationQueryIds": ["<queryId>"], // 주어진 Aggregate에서 열거형 객체를 선언 했을 경우, 그 열거형 객체에 대한 구체적인 정보를 추가하기 위한 쿼리를 추가합니다.

            // 주어진 Aggregate에서 ValueObject 객체를 선언 했을 경우, 그 ValueObject 객체에 대한 구체적인 정보를 추가하기 위한 쿼리를 추가합니다.
            // 혹은, 특정 테이블이 주어진 Aggregate를 외래키로 참조하는 경우, 당신은 데이터의 불일치에 대한 비즈니스의 치명성을 판단해서 치명적이라고 판단되면 Aggregate가 아닌, ValueObject에 해당 트랙젝션 테이블을 추가할 수 있습니다.
            "relatedValueObjectQueryIds": ["<queryId>"],  

            "relatedCommandQueryIds": ["<queryId>"], // 이 유즈케이스를 사용한 커멘드 관련 쿼리의 ID이며, 최소한 하나 이상 존재해야 합니다.
            "relatedEventQueryIds": ["<queryId>"], // 이 유즈케이스를 사용한 이벤트 관련 쿼리의 ID이며, 최소한 하나 이상 존재해야 합니다.
            "relatedPolicyQueryIds": ["<queryId>"] // 특정 정책이 커멘드를 호출할 수 있을 경우, 그 정책을 추가하기 위한 쿼리를 추가합니다.
        }
    ],

    // 여기에 위에서 제시한 usecase의 내용을 반영하기 위한 쿼리들을 작성하면 됩니다. 
    "queries": [
        {
            // 어느 유즈케이스의 내용을 반영하기 위한 쿼리인지 적어주세요.
            "fromUsecaseId": "<usecaseId>",

            // 이 쿼리를 식별하기 위한 고유 ID 입니다.
            "queryId": "<queryId>",

            // 어떤 유형의 객체에 대한 정보를 수정하는지 나타내는 속성입니다.
            // BoundedContext, Aggregate, Enumeration, ValueObject, Command, Event 중 하나를 선택해야 합니다.
            "objectType": "<objectType>",

            // 수행할 액션을 나타내는 속성입니다.
            // new, modify, delete 중 하나를 선택해야 합니다.
            "action": "<action>",

            // 주어진 액션이 수행되는 객체의 ID 정보들이 담기는 속성입니다.
            "ids": {
                "<idName>": "<idValue>"
            },

            // 액션에 필요한 파라미터를 담는 속성입니다.
            "args": {
                "<argName>": "<argValue>"
            }
        }
    ]
}

각각의 action에 대한 규칙은 다음과 같습니다.
- new 액션
    ids와 args에 나열된 모든 속성을 반드시 작성해야 합니다.

- modify 액션
    수정시킬 대상의 ids를 반드시 작성해야 하고, args에는 변경시킬 속성들만 작성해야 합니다.
    properties인 경우, 변경시킬 name 속성이 담긴 객체만 작성하면 됩니다.
    만약, 그 name이 없으면 새롭게 생성될 것이고, 그렇지 않을 때는 기존의 속성을 수정하는 것으로 합니다.

- delete 액션
    삭제시킬 대상의 ids를 반드시 작성해야 합니다.
    properties의 일부 속성을 삭제하고 싶을 경우, 해당 properties 속성에서 삭제시킬 객체를 작성하면 됩니다.
    properties 내부에서 작성된 name 속성과 매칭되는 속성이 삭제됩니다.

각각의 objectType에서 활용하는 ids와 args에 관해서 설명하겠습니다.
이 설명에서 작성하지 않은 임의의 파리미터를 ids나 args에서 활용할 수 없습니다.

# objectType: BoundedContext
- 설명
모든 액션은 전달된 Bounded Context안에서 수행됩니다.

- 반환 형태
{
    "objectType": "BoundedContext",
    "action": "<new | modify | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>"
    },
    "args": {
        "boundedContextName": "<boundedContextName>",
        "boundedContextAlias": "<boundedContextAlias>"
    }
}

# objectType: Aggregate
- 설명
Debezium 트랜잭션 로그는 특정 테이블에 대한 액션이 포함되어 있습니다.
해당 Aggregate가 속할 수 있는 적절한 Bounded Context가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "Aggregate",
    "action": "<new | modify | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>"
    },
    "args": {
        "aggregateName": "<aggregateName>",
        "aggregateAlias": "<aggregateAlias>",

        // 해당 트랜잭션에서 사용한 속성들을 최대한 다 적어주세요.
        "properties": [
            {
                "name": "<propertyName>",
                "displayName": "<propertyAlias>",
                "type": "<propertyType>",
                "isKey": <true | false>
            }
        ]
    }
}

# objectType: Enumeration
- 설명
Aggreage에서 사용할 수 있는 열거형 정보를 담는 객체입니다.
해당 Enumeration이 속할 수 있는 적절한 Bounded Context나 Aggregate가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "Enumeration",
    "action": "<new | modify | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "enumerationId": "<enumerationId>"
    },
    "args": {
        "enumerationName": "<enumerationName>",
        "properties": [
            {
                "name": "<propertyName>"
            }
        ]
    }
}

# objectType: ValueObject
- 설명
Aggreage에서 사용할 수 있는 ValueObject 정보를 담는 객체입니다.
해당 ValueObject가 속할 수 있는 적절한 Bounded Context나 Aggregate가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "ValueObject",
    "action": "<new | modify | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "valueObjectId": "<valueObjectId>"
    },
    "args": {
        "valueObjectName": "<valueObjectName>",
        "properties": [
            {
                "name": "<propertyName>",
                "displayName": "<propertyAlias>",
                "type": "<propertyType>",
                "isKey": <true | false>,
                "isForeignProperty": <true | false> // 외래키 여부입니다. 이 속성이 다른 테이블의 속성을 참조하는 경우, 이 값은 true로 설정해야 합니다
            }
        ],
    }
}

# objectType: Command
- 설명
주어진 트랜잭션에서 의해서 수행되는 커멘드에 대한 정보를 담는 객체입니다.
해당 커멘드가 속할 수 있는 적절한 Bounded Context나 Aggregate가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "Command",
    "action": "<new | modify | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "commandId": "<commandId>"
    },
    "args": {
        "commandName": "<commandName>",
        "commandAlias": "<commandAlias>",
        "api_verb": <"POST" | "DELETE" | "PUT">,
        "properties": [
            {
                "name": "<propertyName>",
                "displayName": "<propertyAlias>",
                "type": "<propertyType>",
                "isKey": <true | false>
            }
        ],
        "toEventIds": ["<toEventId>"], // 이 커멘드로 인해서 발생되는 이벤트들의 id 리스트
        "fromPolicyIds": ["<fromPolicyId>"], // 이 커멘드를 수행하기 위해서 필요한 정책들의 id 리스트
        "actor": "<actorName>" // 해당 액션을 수행하는 액터명입니다. 사용자, 관리자등의 이름이 들어가야 합니다. 특정한 액터가 없을 경우, 빈값으로 넣어야 합니다.
    }
}

# objectType: Event
- 설명
특정 커멘드나 정책에 의해서 발생하는 이벤트에 대한 정보를 담는 객체입니다.
해당 이벤트가 속할 수 있는 적절한 Bounded Context나 Aggregate가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "Event",
    "action": "<new | modify | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "eventId": "<eventId>"
    },
    "args": {
        "eventName": "<eventName>",
        "eventAlias": "<eventAlias>",
        "properties": [
            {
                "name": "<propertyName>",
                "displayName": "<propertyAlias>",
                "type": "<propertyType>",
                "isKey": <true | false>
            }
        ]
    }
}

# objectType: Policy
- 설명
특정 이벤트가 발생했을 경우, 정책을 통해서 다른 커멘드를 호출할 수 있습니다.

- 반환 형태
{
    "objectType": "Policy",
    "action": "<new | modify | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "policyId": "<policyId>"
    },
    "args": {
        "policyName": "<policyName>",
        "policyAlias": "<policyAlias>",
        "fromEventNames": ["<fromEventId>"] // 이 정책을 실행시키는 이벤트 이름들
    }
}

`
            }

            const getExamplePrompt = () => {
                return `예시를 들어보겠습니다.
이 예시에서는 환자 정보, 환자 진료 기록, 환자 선호도 정보 업데이트와 관련된 Debezium 트랜잭션 로그가 전달되었다고 가정해서 출력된 결과입니다.
이 예시에서 환자 진료 기록, 환자 선호도 정보는 환자 정보를 외래키로 가지고 있기 때문에 ValueObject 혹은 Aggregate로 정의될 수 있습니다.
환자 진료 기록이 환자 정보와 데이터 불일치가 발생하면 비즈니스적으로 치명적이기 때문에 ValueObject로 환자 정보에 포함했고,
환자 선호도 정보는 환자 정보와 데이터 불일치가 발생해도 비즈니스적으로 큰 문제가 되지 않기 때문에 Aggregate로 정의하였습니다.
환자 선호도 정보 업데이트 이벤트가 발생했을 경우, Policy를 이용해서 환자 정보의 데이터도 업데이트한다는 점도 확인해 주세요.

반환 결과 중 일부분을 보여드리겠습니다.
- 이것은 단지 예시일 뿐입니다. 실제로 제가 제공하는 이벤트 스토밍 모델링 데이터는 추후에 INPUT으로 제공될 겁니다.

# transactions: 환자 정보 업데이트 트랙젝션
{"id":"patient-update-transaction","description":"Update Patient Information","properties":[{"name":"id","displayName":"ID","type":"Integer","isKey":true,"isForeignProperty":false},{"name":"name","displayName":"Name","type":"String","isKey":false,"isForeignProperty":false},{"name":"phoneNumber","displayName":"Phone Number","type":"String","isKey":false,"isForeignProperty":false},{"name":"bloodType","displayName":"BloodType","type":"EnumBloodType","isKey":false,"isForeignProperty":false},{"name":"isPreferenceInputed","displayName":"Is Preference Inputed","type":"Boolean","isKey":false,"isForeignProperty":false}]}

# usecase
[{"relatedTransactionId":"patient-update-transaction","id":"usecase-update-patient","name":"UpdatePatient","displayName":"Update Patient","actor":"User","relatedBoundedContextQueryIds":["query-bc-update-patient"],"relatedAggregateQueryIds":["query-agg-update-patient"],"relatedEnumerationQueryIds":["query-enum-blood-type"],"relatedValueObjectQueryIds":[],"relatedCommandQueryIds":["query-cmd-update-patient"],"relatedEventQueryIds":["query-evt-update-patient"],"relatedPolicyQueryIds":["query-policy-update-patient"]},{"relatedTransactionId":"medicalRecord-update-transaction","id":"usecase-update-medical-record","name":"UpdateMedicalRecord","displayName":"Update Record Record","actor":"User","relatedBoundedContextQueryIds":[],"relatedAggregateQueryIds":[],"relatedEnumerationQueryIds":[],"relatedValueObjectQueryIds":["query-vo-update-medical-record"],"relatedCommandQueryIds":["query-cmd-update-medical-record"],"relatedEventQueryIds":["query-evt-update-medical-record"],"relatedPolicyQueryIds":[]},{"relatedTransactionId":"patientPreference-update-transaction","id":"usecase-update-patient-preference","name":"UpdatePatientPreference","displayName":"Update Patient Preference","actor":"User","relatedBoundedContextQueryIds":["query-bc-update-patient-preference"],"relatedAggregateQueryIds":["query-agg-update-patient-preference"],"relatedEnumerationQueryIds":[],"relatedValueObjectQueryIds":[],"relatedCommandQueryIds":["query-cmd-update-patient-preference"],"relatedEventQueryIds":["query-evt-update-patient-preference"],"relatedPolicyQueryIds":[]}]

# query-agg-update-patient
{"fromUsecaseId":"usecase-update-patient","queryId":"query-agg-update-patient","objectType":"Aggregate","action":"new","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient"},"args":{"aggregateName":"Patient","aggregateAlias":"Patient","properties":[{"name":"id","displayName":"ID","type":"Integer","isKey":true},{"name":"name","displayName":"Name","type":"String","isKey":false},{"name":"phoneNumber","displayName":"Phone Number","type":"String","isKey":false},{"name":"bloodType","displayName":"BloodType","type":"EnumBloodType","isKey":false},{"name":"isPreferenceInputed","displayName":"Is Preference Inputed","type":"Boolean","isKey":false}]}}

# query-cmd-update-patient
{"fromUsecaseId":"usecase-update-patient","queryId":"query-cmd-update-patient","objectType":"Command","action":"new","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","commandId":"cmd-update-patient"},"args":{"commandName":"UpdatePatient","commandAlias":"Update Patient","api_verb":"PUT","properties":[{"name":"id","displayName":"ID","type":"Integer","isKey":true},{"name":"name","displayName":"Name","type":"String","isKey":false},{"name":"phoneNumber","displayName":"Phone Number","type":"String","isKey":false},{"name":"bloodType","displayName":"BloodType","type":"EnumBloodType","isKey":false},{"name":"isPreferenceInputed","displayName":"Is Preference Inputed","type":"Boolean","isKey":false}],"toEventIds":["evt-patient-updated"],"fromPolicyIds":["policy-update-patient"],"actor":"User"}}

`
            }

            const getUserPrompt = (preprocessModelValue, debeziumLogs) => {
                const getSummarizedDebeziumLogStrings = (debeziumLogStrings) => {
                    const getDebeziumLogStringList = (logs) => {
                        return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
                    }
                
                    const getSummarizedDebeziumLog = (debeziumLog) => {
                        return {
                            payload: {
                                before: debeziumLog.payload.before,
                                after: debeziumLog.payload.after,
                                source: {
                                    db: debeziumLog.payload.source.db,
                                    table: debeziumLog.payload.source.table
                                }
                            }
                        }
                    }
                
                    let summarizedDebeziumLogStrings = []
                    for(const debeziumLogString of getDebeziumLogStringList(debeziumLogStrings)) {
                        summarizedDebeziumLogStrings.push(JSON.stringify(getSummarizedDebeziumLog(JSON.parse(debeziumLogString))))
                    }
                    return "".concat(summarizedDebeziumLogStrings)
                }

                return `[INPUT]
- 기존 이벤트스토밍 모델 객체
${preprocessModelValue}

- Debezium 트랜잭션 로그
${getSummarizedDebeziumLogStrings(debeziumLogs)}

[OUTPUT]`
            }

            return  getFrontGuidePrompt() +
                    getInputSyntaxGuidePrompt() +
                    getOutputSyntaxGuidePrompt() +
                    getExamplePrompt() +
                    getUserPrompt(preprocessModelValue, debeziumLogs)
        }

        this.preprocessModelValue = getPreprocessModelValue(this.client.modelValue)
        this.preModificationMessage = this.messageObj.modificationMessage
        const systemPrompt = getSystemPrompt(
            JSON.stringify(this.preprocessModelValue, null, 2),
            this.preModificationMessage 
        )

        console.log("[*] 전달된 시스템 프롬프트 \n" + systemPrompt)
        return systemPrompt
    }

    createModel(text){
        const parseToJson = (aiTextResult) => {
            if(aiTextResult.includes("```json")) aiTextResult = aiTextResult.match(/```json\n([\s\S]+)\n```/)[1]
            if(aiTextResult.includes("```")) aiTextResult = aiTextResult.match(/```([\s\S]+)```/)[1]
            return JSON.parse(aiTextResult.trim())
        }

        const getDebeziumLogStrings = (logs) => {
            return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
        }


        if(this.state !== 'end') {
            console.log(`[*] DebeziumLogsTabGenerator에서 결과 생성중... (현재 출력된 문자 수: ${text.length})`)

            return {
                modelName: this.modelName,
                modelValue: null,
                modelRawValue: text
            }
        }

        try {
            console.log("[*] DebeziumLogsTabGenerator에서 결과이 완료됨! 파싱중... \n" + text)

            const outputResult = {
                modelName: this.modelName,
                modelValue: {
                    ...parseToJson(text),
                    debeziumLogStrings: getDebeziumLogStrings(this.preModificationMessage)
                },
                modelRawValue: text,
            }

            console.log("[*] 최종 파싱 결과", outputResult)
            return outputResult
        }
        catch(e) {
            console.error("[!] DebeziumLogsTabGenerator에서 에러가 발생함! \n" + text)
            console.error(e)
        }
    }
}


module.exports = DebeziumLogsTabGenerator;