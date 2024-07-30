const JsonAIGenerator = require("../JsonAIGenerator");
const changeCase = require('change-case');
const jp = require('jsonpath');

class DebeziumLogsTabGenerator extends JsonAIGenerator{
    constructor(client, messageObj){
        super(client);

        this.model = "gpt-4o"
        this.preferredLanguage = this.setPreferredLanguage();
        this.originalLanguage = this.preferredLanguage.toLowerCase();
        this.messageObj = messageObj
        this.modelName = "DebeziumLogsTabGenerator"

        this.modelMode = "generateCommands"
        this.modelInputLengthLimit = 10000
        this.relatedPreProcessModelValueString = ""
        this.queryResultsToModificate = null

        this.UUIDAliasDic = {}
    }

    createPrompt(userProps, modelValue){
        const getUUIDAliasDic = (modelValue) => {
            let UUIDToAlias = {}
            let aliasToUUID = {}
        
            const getAliasToUse = (element, UUIDToAlias, aliasToUUID) => {
                const getFrontId = (element) => {
                    switch(element._type) {
                        case "org.uengine.modeling.model.BoundedContext": return "bc"
                        case "org.uengine.modeling.model.Aggregate": return "agg"
                        case "org.uengine.modeling.model.Command": return "cmd"
                        case "org.uengine.modeling.model.Event": return "evt"
                        case "org.uengine.modeling.model.Actor": return "act"
                        case "org.uengine.uml.model.Class": return element.isAggregateRoot ? "agg-root" : "entity"
                        case "org.uengine.uml.model.Enum": return "enum"
                        case "org.uengine.uml.model.vo.Class": return "vo"
                        default: return "obj"
                    }
                }
        
                if(UUIDToAlias[element.id]) 
                    return UUIDToAlias[element.id]
        
                let aliasToUse = `${getFrontId(element)}-${changeCase.camelCase(element.name)}`
                let i = 1
                while(aliasToUUID[aliasToUse]) {
                    aliasToUse = `${aliasToUse}-${i}`
                    i++
                }
                return aliasToUse
            }
        
            const getAliasForRelation = (relation, UUIDToAlias, aliasToUUID) => {
                const sourceAlias = getAliasToUse(relation.sourceElement, UUIDToAlias, aliasToUUID)
                const targetAlias = getAliasToUse(relation.targetElement, UUIDToAlias, aliasToUUID)
                return `${sourceAlias}-to-${targetAlias}`
            }
        
            const initUUIDAliasForElements = (elements, UUIDToAlias, aliasToUUID) => {
                Object.keys(elements).forEach(key => {
                    const element = elements[key]
                    if(!element) return

                    const aliasToUse = getAliasToUse(element, UUIDToAlias, aliasToUUID)
                    UUIDToAlias[key] = aliasToUse
                    aliasToUUID[aliasToUse] = key
                })
            }
        
            const initUUIDAliasForRelations = (relations, UUIDToAlias, aliasToUUID) => {
                Object.keys(relations).forEach(relationKey => {
                    const relation = relations[relationKey]
                    if(!relation) return

                    const relationAliasToUse = getAliasForRelation(relation, UUIDToAlias, aliasToUUID)
                    UUIDToAlias[relationKey] = relationAliasToUse
                    aliasToUUID[relationAliasToUse] = relationKey
                })
            }
        
            initUUIDAliasForElements(modelValue.elements, UUIDToAlias, aliasToUUID)
            initUUIDAliasForRelations(modelValue.relations, UUIDToAlias, aliasToUUID)
        
            Object.keys(modelValue.elements).forEach(key => {
                const element = modelValue.elements[key]
                if(!element) return
        
                if(element._type === "org.uengine.modeling.model.Aggregate" &&
                   element.aggregateRoot && element.aggregateRoot.entities) {
                    if(element.aggregateRoot.entities.elements) {
                        initUUIDAliasForElements(element.aggregateRoot.entities.elements, UUIDToAlias, aliasToUUID)
                    }
        
                    if(element.aggregateRoot.entities.relations) {
                        initUUIDAliasForRelations(element.aggregateRoot.entities.relations, UUIDToAlias, aliasToUUID)
                    }
                }
            })
        
            return {
                UUIDToAlias: UUIDToAlias,
                aliasToUUID: aliasToUUID
            }
        }

        const getPreprocessModelValue = (modelValue, UUIDToAlias) => {
            const getAliasIfExist = (id) => {
                return UUIDToAlias[id] ? UUIDToAlias[id] : id
            }
        
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
                            let property = {
                                name: fieldDescriptor.name
                            }
                            if(!(fieldDescriptor.className.toLowerCase().includes("string"))) property.type = fieldDescriptor.className
                            if(fieldDescriptor.isKey) property.isKey = true
                            return property
                        })
                    }
        
                    const getEnumInfos = (aggregate) => {
                        const getEnumInfo = (element) => {
                            let enumInfo = {}
                            enumInfo.id = getAliasIfExist(element.id ? element.id : element.elementView.id)
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
                                    let property = {
                                        name: fieldDescriptor.name
                                    }
                                    if(!(fieldDescriptor.className.toLowerCase().includes("string"))) property.type = fieldDescriptor.className
                                    if(fieldDescriptor.isKey) property.isKey = true
                                    if(fieldDescriptor.className.toLowerCase() === aggregate.name.toLowerCase()) property.isForeignProperty = true
                                    return property
                                })
                            }
        
                            let valueObjectInfo = {}
                            valueObjectInfo.id = getAliasIfExist(element.id ? element.id : element.elementView.id)
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
                                            relationId: getAliasIfExist(relation.id ? relation.id : relation.elementView.id),
                                            id: getAliasIfExist(relation.targetElement.id),
                                            name: relation.targetElement.name
                                        })
                                }
                                return outputEvents
                            }
        
                            let commandInfo = {}
                            commandInfo.id = getAliasIfExist(element.id ? element.id : element.elementView.id)
                            commandInfo.name = element.name
                            commandInfo.api_verb = (element.restRepositoryInfo && element.restRepositoryInfo.method) ? element.restRepositoryInfo.method : "POST"
                            commandInfo.outputEvents = getOutputEvents(element, modelValue)
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
                            const getOutputCommands = (event, modelValue) => {
                                const getRelationsForType = (sourceElement, targetType, modelValue) => {
                                    return Object.values(modelValue.relations)
                                        .filter(r => r && r.sourceElement.id === sourceElement.id && r.targetElement._type === targetType)
                                }
        
                                let outputCommands = []
                                for(let policyRelation of getRelationsForType(event, 'org.uengine.modeling.model.Policy', modelValue)) {
                                    const targetPolicy = modelValue.elements[policyRelation.targetElement.id]
                                    for(let commandRelation of getRelationsForType(targetPolicy, 'org.uengine.modeling.model.Command', modelValue)) {
                                        outputCommands.push({
                                            relationId: getAliasIfExist(commandRelation.id ? commandRelation.id : commandRelation.elementView.id),
                                            id: getAliasIfExist(commandRelation.targetElement.id),
                                            name: commandRelation.targetElement.name
                                        })   
                                    }
                                }
                                return outputCommands
                            }
        
                            let eventInfo = {}
                            eventInfo.id = getAliasIfExist(element.id ? element.id : element.elementView.id)
                            eventInfo.name = element.name
                            eventInfo.outputCommands = getOutputCommands(element, modelValue)
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
                    aggegateInfo.id = getAliasIfExist(aggregate.id ? aggregate.id : aggregate.elementView.id)
                    aggegateInfo.name = aggregate.name
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
                                id: getAliasIfExist(element.id ? element.id : element.elementView.id),
                                name: element.name
                            })
                        }
                    }
                    return actors
                }
        
                let boundedContextInfo = {}
                boundedContextInfo.id = getAliasIfExist(boundedContext.id ? boundedContext.id : boundedContext.elementView.id)
                boundedContextInfo.name = boundedContext.name
                
                boundedContextInfo.aggregates = {}
                for(let aggregate of getAllAggregates(boundedContext, modelValue))
                    boundedContextInfo.aggregates[getAliasIfExist(aggregate.id)] = getAggregateInfo(aggregate, boundedContext, modelValue)
                
                boundedContextInfo.actors = getAllActors(boundedContext, modelValue)
        
                return boundedContextInfo
            }
            
            let boundedContextInfos = {}
            for(let boundedContext of getAllBoundedContexts(modelValue))
                boundedContextInfos[getAliasIfExist(boundedContext.id)] = getBoundedContextInfo(boundedContext, modelValue)
            return boundedContextInfos;
        }

        const getObjectIdInfos = (preprocessModelValue) => {
            let objectIdInfos = {
                "commandIds": [],
                "eventIds": []
            }
            Object.values(preprocessModelValue).forEach(boundary => {
                if(boundary.aggregates){
                    Object.values(boundary.aggregates).forEach(aggregate => {
                        if(aggregate.commands)
                            objectIdInfos.commandIds = objectIdInfos.commandIds.concat(aggregate.commands.map(command => command.id))
                        if(aggregate.events)
                            objectIdInfos.eventIds = objectIdInfos.eventIds.concat(aggregate.events.map(event => event.id))
                    })
                }
            })
            return objectIdInfos
        }


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

        const getSystemPromptForGenerateCommands = (preprocessModelValueString, debeziumLogs, objectIdInfos) => {
            const getSystemPrompt = (preprocessModelValueString, debeziumLogs, objectIdInfos) => {
                const getFrontGuidePrompt = () => {
                    return `당신은 특정 시스템의 데이터베이스에서 발생하는 Debezium CDC 트랜잭션 로그를 해석해서 주어진 이벤트 스토밍 모델을 수정하기 위한 액션이 담긴 쿼리를 작성해야 합니다.
Debezium CDC 트랜잭션 로그에서 기존 이벤트 모델에 반영되어 있지 않은 유즈케이스들을 찾아서 그에 맞춰서 이벤트 스토밍 모델에 반영하기 위한 액션이 담긴 쿼리들을 작성하시면 됩니다.

다음 규칙을 따라서 작성해 주세요.
1. 제공된 Debezium CDC 트랜잭션에서 발견된 속성 및 Bounded Context에 대해서만 수정 사항들을 생성해 주세요. 그 외의 추가적인 속성을 추측하지 마세요.
2. 각 Bounded Context는 서로 상호작용 할 수 있습니다. 특정 Bounded Context의 이벤트가 발생하면, 해당 이벤트는 다른 Bounded Context의 커맨드를 호출할 수 있습니다.
3. 출력되는 JSON 객체에는 주석을 절대로 작성하면 안 됩니다.
4. 자바에서 제공하는 기본 데이터타입 혹은 Address, Portrait, Rating, Money, Email을 제외한 속성들은 enumerations나 valueObjects로 직접 정의해야 합니다.
5. event.block이나 hibernate_sequence와 같이 비즈니스 로직과 직접적으로 관련이 없는 트랜잭션은 무시해야 합니다.
6. id 속성은 고유해야 하며, 수정하면 안 됩니다.
7. 필수적인 상황이 아니라면, 하나의 Bounded Context 안에 하나의 Aggregate가 속하도록 해주세요.
8. '<해당 Bounded Context에 속하게 될 Aggregate의 이름> + Service'와 같이 Bounded Context의 이름을 작성해 주세요.
9. 트랜젝션의 속성 및 유즈 케이스가 다르다면, 관련된 새로운 Aggregate를 생성해야 합니다. 기존의 Aggregate를 덮어쓰면 안됩니다.
    
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
                
                // aggregate는 Aggregate Root에 관한 속성들을 가지고 있습니다.
                "properties": [
                    {
                        "name": "<propertyName>",
                        
                        // "<propertyType>"은 다음 3가지중 하나에 속해야합니다.
                        // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다. 이때, 패키지 전체 경로를 적지 말고, 클래스 명만 적어주세요. (ex. java.lang.String > String)
                        // 2. 다음 같은 값 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                        // 3. enumerations, valueObjects에 정의된 name이 있는 경우, 해당 이름을 사용할 수 있습니다.
                        ["type": "<propertyType>"], // type이 String인 경우, type을 명시하지 않습니다.
                        ["isKey": true] // 기본키 여부입니다. properties 중 오직 하나만 isKey가 true로 설정되어야 합니다.
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
                                ["type": "<propertyType>"], // type이 String인 경우, type을 명시하지 않습니다.
                                ["isKey": true],
                                ["isForeignProperty": true] // 외래키 여부입니다. 이 속성이 다른 테이블의 속성을 참조하는 경우, 이 값은 true로 설정해야 합니다.
                            }
                        ]
                    }
                ],
                
                // REST API를 통해서 요청할 경우를 나타내는 command 목록입니다.
                "commands": [
                    {
                        "id": "<commandId>",
                        "name": "<commandName>",
                        "api_verb":  <"POST" | "DELETE" | "PUT">,
                        "outputEvents": [{
                            "relationId": "<relationId>",
                            "id": "<eventId>",
                            "name": "<eventName>"
                        }] // 이 command에 요청한 경우, 발생하게 되는 event에 대한 정보가 적힙니다.
                    }
                ],
                
                // command에 의해서 발생한 event 목록입니다.
                "events": [
                    {
                        "id": "<eventId>",
                        "name": "<eventName>",
                        "outputCommands": [{
                            "relationId": "<relationId>",
                            "id": "<commandId>",
                            "name": "<commandName>"
                        }] // 이 event에 요청한 경우, 발생하게 되는 command에 대한 정보가 적힙니다.
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
\`\`\`json
{
    // 먼저, 당신은 Debezium 트랜잭션 로그의 내용을 바탕으로 트랜잭션 별로 id와 description을 적어야 합니다.
    // 전달된 트랜잭션 로그들의 순서와 일치해야 합니다.
    "transactions": [
        {
            "id": "<transactionId>",
            "description": "<transactionDescription>",

            // 해당하는 트랜잭션의 payload에 작성된 모든 필드를 적여야 합니다.
            // etc1, etc2와 같이 순번에 매겨져 있는 경우에도 통합시키지 않고, 모두 작성하세요.
            "properties": [
                {
                    "name": "<propertyName>",
                    ["type": "<propertyType>"], // type이 String인 경우, type을 명시하지 않습니다.
                    ["isKey": true], // 기본키가 존재하는 경우에만 작성해주세요.
                    ["isForeignProperty": true] // 외래키가 존재하는 경우에만 작성해주세요.
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

            "relatedCommandQueryIds": ["<queryId>"], // 이 유즈케이스를 사용한 커맨드 관련 쿼리의 ID이며, 최소한 하나 이상 존재해야 합니다.
            "relatedEventQueryIds": ["<queryId>"] // 이 유즈케이스를 사용한 이벤트 관련 쿼리의 ID이며, 최소한 하나 이상 존재해야 합니다.
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
            // update, delete 중 하나를 선택해야 합니다.
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
\`\`\`

각각의 action에 대한 규칙은 다음과 같습니다.
- update 액션
    새롭게 생성하는 경우, ids와 args에 나열된 모든 속성을 반드시 작성해야 합니다.
    수정할려고 하는 경우, 수정시킬 대상의 ids를 반드시 작성해야 하고, args에는 변경시킬 속성들만 작성해야 합니다.
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
    "action": "<update | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>"
    },
    "args": {
        "boundedContextName": "<boundedContextName>"
    }
}

# objectType: Aggregate
- 설명
Debezium 트랜잭션 로그는 특정 테이블에 대한 액션이 포함되어 있습니다.
해당 Aggregate가 속할 수 있는 적절한 Bounded Context가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "Aggregate",
    "action": "<update | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>"
    },
    "args": {
        "aggregateName": "<aggregateName>",

        // 해당 트랜잭션에서 사용한 속성들을 최대한 다 적어주세요.
        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // type이 String인 경우, type을 명시하지 않습니다.
                ["isKey": true] // 기본키가 존재하는 경우에만 작성해주세요.
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
    "action": "<update | delete>",
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
    "action": "<update | delete>",
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
                ["type": "<propertyType>"], // type이 String인 경우, type을 명시하지 않습니다.
                ["isKey": true], // 기본키가 존재하는 경우에만 작성해주세요.
                ["isForeignProperty": true] // 외래키 여부입니다. 이 속성이 다른 테이블의 속성을 참조하는 경우에만 작성해주세요.
            }
        ],
    }
}

# objectType: Command
- 설명
주어진 트랜잭션에서 의해서 수행되는 커맨드에 대한 정보를 담는 객체입니다.
해당 커맨드가 속할 수 있는 적절한 Bounded Context나 Aggregate가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "Command",
    "action": "<update | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "commandId": "<commandId>"
    },
    "args": {
        "commandName": "<commandName>",
        "api_verb": <"POST" | "DELETE" | "PUT">,
        "outputEventIds": ["<outputEventId>"], // 이 커맨드로 인해서 발생되는 이벤트들의 id 리스트
        "actor": "<actorName>" // 해당 액션을 수행하는 액터명입니다. 사용자, 관리자등의 이름이 들어가야 합니다. 특정한 액터가 없을 경우, 빈값으로 넣어야 합니다.
    }
}

# objectType: Event
- 설명
특정 커맨드나 정책에 의해서 발생하는 이벤트에 대한 정보를 담는 객체입니다.
해당 이벤트가 속할 수 있는 적절한 Bounded Context나 Aggregate가 없을 경우에는 쿼리를 통해서 새롭게 만들어야 합니다.

- 반환 형태
{
    "objectType": "Event",
    "action": "<update | delete>",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "eventId": "<eventId>"
    },
    "args": {
        "eventName": "<eventName>",

        // 특정한 이벤트는 다른 BoundedContext 내부의 커맨드를 호출시켜서 상태를 변경할 수 있습니다.
        // 이러한 호출 정보를 작성해야하는 예시들은 다음과 같습니다.
        // 1. 환자의 선호도 정보가 변경되었고, 환자 정보에 환자의 선호도 정보가 업데이트된 최신 날짜가 있다고 가정하면 이를 반영하기 위해 작성해야 합니다.
        // 2. 주문 상품의 수량이 변경되었고, 주문 상품 정보에 주문 상품의 총 수량과 관련된 정보가 있다고 가정하면 이를 반영하기 위해 작성해야 합니다.
        // 위에서 작성한 예시처럼 이벤트가 다른 커맨드를 호출시켜서 속성을 업데이트해야하는 관계에 있는 경우, 반드시 명시해주시길 바랍니다.
        "outputCommandIds": [{
            "commandId": "<outputCommandId>", // 호출하는 커맨드 Id입니다.
            "relatedAttribute": "<relatedAttribute>", // 어떠한 속성을 업데이트하기 위해서 커맨드를 호출하는지 명시합니다. 정확한 속성명을 지정해야 합니다.
            "reason": "<reason>" // 이 커맨드를 호출하는 이유를 명시합니다.
        }]
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
환자 선호도 정보 업데이트 이벤트가 발생했을 경우, outputCommandIds 속성에 환자 정보 업데이트 커맨드 Id를 전달해서 환자 정보의 데이터도 업데이트한다는 점도 확인해 주세요.
반환 결과는 다음과 같습니다.
- 이것은 단지 예시일 뿐입니다. 실제로 제가 제공하는 이벤트 스토밍 모델링 데이터는 추후에 INPUT으로 제공될 겁니다.
\`\`\`json
{"transactions":[{"description":"Update Patient Information","id":"patient-update-transaction","properties":[{"isKey":true,"name":"id","type":"Long"},{"name":"name"},{"name":"phoneNumber"},{"name":"bloodType","type":"EnumBloodType"},{"name":"isPreferenceInputed","type":"Boolean"}]},{"description":"Update medicalRecord Information","id":"medicalRecord-update-transaction","properties":[{"isKey":true,"name":"id","type":"Long"},{"isForeignProperty":true,"name":"patientId"},{"name":"medicalRecord"}]},{"description":"Update patientPreference Information","id":"patientPreference-update-transaction","properties":[{"isKey":true,"name":"id","type":"Long"},{"isForeignProperty":true,"name":"patientId"},{"name":"PreferenceValue"}]}],"usecases":[{"relatedTransactionId":"patient-update-transaction","id":"usecase-update-patient","name":"UpdatePatient","displayName":"Update Patient","actor":"User","relatedBoundedContextQueryIds":["query-bc-update-patient"],"relatedAggregateQueryIds":["query-agg-update-patient"],"relatedEnumerationQueryIds":["query-enum-blood-type"],"relatedValueObjectQueryIds":[],"relatedCommandQueryIds":["query-cmd-update-patient"],"relatedEventQueryIds":["query-evt-update-patient"]},{"relatedTransactionId":"medicalRecord-update-transaction","id":"usecase-update-medical-record","name":"UpdateMedicalRecord","displayName":"Update Record Record","actor":"User","relatedBoundedContextQueryIds":[],"relatedAggregateQueryIds":[],"relatedEnumerationQueryIds":[],"relatedValueObjectQueryIds":["query-vo-update-medical-record"],"relatedCommandQueryIds":["query-cmd-update-medical-record"],"relatedEventQueryIds":["query-evt-update-medical-record"]},{"relatedTransactionId":"patientPreference-update-transaction","id":"usecase-update-patient-preference","name":"UpdatePatientPreference","displayName":"Update Patient Preference","actor":"User","relatedBoundedContextQueryIds":["query-bc-update-patient-preference"],"relatedAggregateQueryIds":["query-agg-update-patient-preference"],"relatedEnumerationQueryIds":[],"relatedValueObjectQueryIds":[],"relatedCommandQueryIds":["query-cmd-update-patient-preference"],"relatedEventQueryIds":["query-evt-update-patient-preference"]}],"queries":[{"fromUsecaseId":"usecase-update-patient","queryId":"query-bc-update-patient","objectType":"BoundedContext","action":"update","ids":{"boundedContextId":"bc-patient"},"args":{"boundedContextName":"PatientService"}},{"fromUsecaseId":"usecase-update-patient","queryId":"query-agg-update-patient","objectType":"Aggregate","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient"},"args":{"aggregateName":"Patient","properties":[{"isKey":true,"name":"id","type":"Long"},{"name":"name"},{"name":"phoneNumber"},{"name":"bloodType","type":"EnumBloodType"},{"name":"isPreferenceInputed","type":"Boolean"}]}},{"fromUsecaseId":"usecase-update-patient","queryId":"query-cmd-update-patient","objectType":"Command","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","commandId":"cmd-update-patient"},"args":{"commandName":"UpdatePatient","api_verb":"PUT","outputEventIds":["evt-patient-updated"],"actor":"User"}},{"fromUsecaseId":"usecase-update-patient","queryId":"query-evt-update-patient","objectType":"Event","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","eventId":"evt-patient-updated"},"args":{"eventName":"PatientUpdated"}},{"fromUsecaseId":"usecase-update-patient","queryId":"query-enum-blood-type","objectType":"Enumeration","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","enumerationId":"enum-blood-type"},"args":{"enumerationName":"EnumBloodType","properties":[{"name":"A"},{"name":"B"},{"name":"AB"},{"name":"O"}]}},{"fromUsecaseId":"usecase-update-medical-record","queryId":"query-vo-update-medical-record","objectType":"ValueObject","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","valueObjectId":"vo-medical-record"},"args":{"valueObjectName":"MedicalRecord","properties":[{"isKey":true,"name":"id","type":"Long"},{"isForeignProperty":true,"name":"patientId","type":"String"},{"name":"medicalRecord"}]}},{"fromUsecaseId":"usecase-update-medical-record","queryId":"query-cmd-update-medical-record","objectType":"Command","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","commandId":"cmd-update-medical-record"},"args":{"commandName":"UpdateMedicalRecord","api_verb":"PUT","outputEventIds":["evt-medical-record-updated"],"actor":"User"}},{"fromUsecaseId":"usecase-update-medical-record","queryId":"query-evt-update-medical-record","objectType":"Event","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","eventId":"evt-medical-record-updated"},"args":{"eventName":"MedicalRecordUpdated"}},{"fromUsecaseId":"usecase-update-patient-preference","queryId":"query-bc-update-patient-preference","objectType":"BoundedContext","action":"update","ids":{"boundedContextId":"bc-patient-preference"},"args":{"boundedContextName":"PatientPreferenceService"}},{"fromUsecaseId":"usecase-update-patient-preference","queryId":"query-agg-update-patient-preference","objectType":"Aggregate","action":"update","ids":{"boundedContextId":"bc-patient-preference","aggregateId":"agg-patient-preference"},"args":{"aggregateName":"PatientPreference","properties":[{"isKey":true,"name":"id","type":"Long"},{"name":"patientId"},{"name":"PreferenceValue"}]}},{"fromUsecaseId":"usecase-update-patient-preference","queryId":"query-cmd-update-patient-preference","objectType":"Command","action":"update","ids":{"boundedContextId":"bc-patient-preference","aggregateId":"agg-patient-preference","commandId":"cmd-update-patient-preference"},"args":{"commandName":"UpdatePatientPreference","api_verb":"PUT","outputEventIds":["evt-patient-preference-updated"],"actor":"User"}},{"fromUsecaseId":"usecase-update-patient-preference","queryId":"query-evt-update-patient-preference","objectType":"Event","action":"update","ids":{"boundedContextId":"bc-patient-preference","aggregateId":"agg-patient-preference","eventId":"evt-patient-preference-updated"},"args":{"eventName":"PatientPreferenceUpdated","outputCommandIds":[{"commandId":"cmd-update-patient","relatedAttribute":"isPreferenceInputed","reason":"To update isPreferenceInputed attribute when patient preference is updated"}]}}]}
\`\`\`

- Json 반환시에는 아래의 예시처럼 모든 공백을 제거하고, 압축된 형태로 반환해주세요.
# BEFORE
{
    "a": 1,
    "b": 2
}

# AFTER
{"a":1,"b":2}

`
                }
    
                const getUserPrompt = (preprocessModelValueString, debeziumLogs, objectIdInfos) => {
                    const requestDebeziumFieldsPrompt = (debeziumLogs) => {
                        const debeziumFieldsSet = new Set()
                        
                        const beforePayload = JSON.parse(debeziumLogs).payload.before
                        if(beforePayload && typeof beforePayload === "object") 
                            Object.keys(beforePayload).forEach(key => debeziumFieldsSet.add(key))
                    
                        const afterPayload = JSON.parse(debeziumLogs).payload.after
                        if(afterPayload && typeof afterPayload === "object")
                            Object.keys(afterPayload).forEach(key => debeziumFieldsSet.add(key))
                        
                        return `트랜젝션 로그에서 다음 필드들을 반드시 활용해서 액션을 작성하셔야 합니다.: ${Array.from(debeziumFieldsSet).join(", ")}`
                    }

                    const requestReverseEventToCommandIdsPrompt = (eventIds) => {
                        return `커맨드 생성 쿼리의 경우, 다음 이벤트들이 생성된 커맨드를 호출해서 데이터를 변경시킬 필요가 있는 경우, 해당 이벤트의 outputCommandIds에 추가해야 합니다.: ${eventIds.join(", ")}`
                    }
                    
                    const requestEventToCommandIdsPrompt = (commandIds) => {
                        return `이벤트 생성 쿼리의 경우, 해당 이벤트가 다음 커맨드들을 추가로 호출해서 데이터를 변경시킬 필요가 있는 경우, 해당 이벤트의 outputCommandIds에 추가해야 합니다. : ${commandIds.join(", ")}`
                    }

                    return `[INPUT]
- 기존 이벤트스토밍 모델 객체
${preprocessModelValueString}

- Debezium 트랜잭션 로그
${getSummarizedDebeziumLogStrings(debeziumLogs)}

- 추가 요청
${requestDebeziumFieldsPrompt(debeziumLogs)}
${objectIdInfos.eventIds.length > 0 ? requestReverseEventToCommandIdsPrompt(objectIdInfos.eventIds) : ""}
${objectIdInfos.commandIds.length > 0 ? requestEventToCommandIdsPrompt(objectIdInfos.commandIds) : ""}

[OUTPUT]
\`\`\`json
`
                }
    
                return  getFrontGuidePrompt() +
                        getInputSyntaxGuidePrompt() +
                        getOutputSyntaxGuidePrompt() +
                        getExamplePrompt() +
                        getUserPrompt(preprocessModelValueString, debeziumLogs, objectIdInfos)
            }

            return getSystemPrompt(
                preprocessModelValueString,
                debeziumLogs,
                objectIdInfos
            )
        }

        const getSystemPromptForSummaryPreProcessModelValue = (preProcessModelValue, debeziumLogs) => {
            const getEventStormingNames = (preProcessModelValue) => {
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
                for(const boundedContext of Object.values(preProcessModelValue)) {
                    eventStormingNames.push(`${boundedContext.id}:${boundedContext.name}`)
                    for(const aggregate of Object.values(boundedContext.aggregates))
                        eventStormingNames = eventStormingNames.concat(getEventStormingNamesInAggregate(aggregate))
                }
                return eventStormingNames
            }

            const getSystemPrompt = (eventStormingNames, debeziumLogs) => {
                return `당신은 특정 시스템의 데이터베이스에서 발생하는 Debezium CDC 트랜잭션 로그를 해석해서 전달된 이벤트 스토밍 객체의 이름들을 가장 관련성이 높은 이름부터 순서대로 나열해야 합니다.

반환 형식은 다음과 같은 JSON 객체만 반환하세요.
{
    "sortedObjectNames": [
        "<objectName1>",
        "<objectName2>"
    ]
}

입출력 예시를 보여드리겠습니다.
[INPUT]
- Debezium Logs
{"payload":{"before":null,"after":{"order_number":10005,"order_date":19848,"purchaser":1001,"quantity":3,"product_id":104},"source":{"db":"inventory","table":"orders"}}}

- Event Storming Names
bc-customer-management:customer-management, bc-customer-management-command-CreateCustomer:CreateCustomer, bc-order-management:order-management

[OUTPUT]
\`\`\`json
{
    "sortedObjectNames": [
        "bc-order-management:order-management",
        "bc-customer-management-command-CreateCustomer:CreateCustomer",
        "bc-customer-management:customer-management"
    ]
}
\`\`\`

[INPUT]
- Debezium Logs
${getSummarizedDebeziumLogStrings(debeziumLogs)}

- Event Storming Names
${eventStormingNames.join(", ")}

[OUTPUT]
\`\`\`json
`
            }

            const eventStormingNames = getEventStormingNames(preProcessModelValue)
            return getSystemPrompt(eventStormingNames, debeziumLogs)
        }

        const getSystemPromptForGenerateGWT = (gwtRequestValue, debeziumLogs) => {        
            const getSystemPrompt = () => {
                return `당신은 주어진 Debezium 정보와 이벤트 스토밍 정보를 바탕으로 GWT(Given, When, Then) 형식으로 JSON 객체를 생성해야 합니다.

당신은 다음과 같은 형식으로 정보를 제공받습니다.
\`\`\`json
{
    "debeziumLog": "<debeziumLog>", // 당신은 전달된 Debezium CDC 로그와 관련된 GWT를 생성해야 합니다.
    "eventStorming": {
        // Given과 관련된 Aggregate의 이름과 관련 속성입니다.
        "givens": [
            {
                "name": "<aggregateName>",
                "attributes": [
                    {
                        "name": "<attributeName>",
                        "type": "<attributeType>"
                    }
                ]
            }
        ],

        // When과 관련된 Command의 이름과 관련 속성입니다.
        "whens": [
            {
                "name": "<commandName>",
                "attributes": [
                    {
                        "name": "<attributeName>",
                        "type": "<attributeType>"
                    }
                ]
            }
        ],

        // Then과 관련된 Event의 이름과 관련 속성입니다.
        "thens": [
            {
                "name": "<eventName>",
                "attributes": [
                    {
                        "name": "<attributeName>",
                        "type": "<attributeType>"
                    }
                ]
            }
        ]
    }
}
\`\`\`

당신이 반환해야 하는 형식은 다음과 같습니다.
\`\`\`json
{
    // 첫 번째로 당신은 GWT를 생성하기 위한 유즈케이스를 생성해야 합니다.
    // 유즈케이스는 제시된 Command와 관련되어서 액터가 어떠한 행위를 수행할지를 고려해서 작성하시면 됩니다.
    "usecases": [
        {
            "usecaseId": "<usecaseId>",
            "gwtId": "<gwtId>", // 이 유즈케이스를 활용한 GWT의 ID입니다.
            "name": "<usecaseName>", // 해당 유즈케이스를 설명하는 일반적인 이름입니다.
            "description": "<usecaseDescription>", // 해당 유즈케이스를 설명하는 상세한 설명입니다.
            "actor": "<actor>" // 해당 유즈케이스를 수행하는 액터의 이름입니다.
        }
    ],

    // 위에서 제시한 유즈케이스를 활용해서 GWT를 생성하시면 됩니다.
    "gwts": [
        {   
            "gwtId": "<gwtId>",
            "usecaseId": "<usecaseId>", // 이 GWT를 생성하기 위해서 사용한 유즈케이스의 ID입니다.
            "givens": [
                {
                    "name": "<givenName>", // 위에서 제시한 given의 이름입니다.
                    "values": {
                        // 작성할 수 있는 속성값에는 3가지 종류가 있습니다.
                        // 1. 실제로 존재할 수 있는 값을 작성합니다.
                        // 2. 현재 값이 비어있는 상태라면 null을 작성합니다.
                        // 3. 해당 GWT와 관련성이 없어 보이는 속성이라면 "N/A"를 작성합니다.
                        "<attributeName>": <attributeValue|null|"N/A">
                    }
                }
            ],
            "whens": [
                {
                    "name": "<whenName>", // 위에서 제시한 when의 이름입니다.
                    "values": {
                        "<attributeName>": <attributeValue|null|"N/A">
                    }
                }
            ],
            "thens": [
                {
                    "name": "<thenName>", // 위에서 제시한 then의 이름입니다.
                    "values": {
                        "<attributeName>": <attributeValue|null|"N/A">
                    }
                }
            ]
        }
    ]
}
\`\`\`

예시는 다음과 같습니다.
여기서는 주문 생성과 관련된 트랜잭션과 관련 Aggregate, Command, Event가 주어지고 있습니다.
출력된 GWT는 처음에는 주문과 관련된 정보가 없어서 null이라는 값이 입력되었지만, 주문을 생성한 Command에 의해서 최종적으로는 Event에 사용자가 입력한 주문 정보가 담긴 상태를 나타내고 있습니다.
[INPUT]
\`\`\`json
{"debeziumLog":"{\"payload\":{\"before\":null,\"after\":{\"order_number\":10005,\"order_date\":19848,\"purchaser\":1001,\"quantity\":3,\"product_id\":104},\"source\":{\"db\":\"inventory\",\"table\":\"orders\"}}}","eventStorming":{"givens":[{"name":"orders","attributes":[{"name":"orderNumber","type":"Integer"},{"name":"orderDate","type":"Integer"},{"name":"purchaser","type":"Integer"},{"name":"quantity","type":"Integer"},{"name":"productId","type":"Integer"}]}],"whens":[{"name":"CreateOrder","attributes":[{"name":"orderNumber","type":"Integer"},{"name":"orderDate","type":"Integer"},{"name":"purchaser","type":"Integer"},{"name":"quantity","type":"Integer"},{"name":"productId","type":"Integer"}]}],"thens":[{"name":"OrderCreated","attributes":[{"name":"orderNumber","type":"Integer"},{"name":"orderDate","type":"Integer"},{"name":"purchaser","type":"Integer"},{"name":"quantity","type":"Integer"},{"name":"productId","type":"Integer"}]}]}}
\`\`\`

[OUTPUT]
\`\`\`json
{"usecases":[{"usecaseId":"UC001","gwtId":"GWT001","name":"고객이 주문을 생성함","description":"고객이 제품을 선택하고 주문 수량을 지정하여 새로운 주문을 생성합니다.","actor":"고객"}],"gwts":[{"gwtId":"GWT001","usecaseId":"UC001","givens":[{"name":"orders","values":{"orderNumber":null,"orderDate":null,"purchaser":null,"quantity":null,"productId":null}}],"whens":[{"name":"CreateOrder","values":{"orderNumber":10005,"orderDate":19848,"purchaser":1001,"quantity":3,"productId":104}}],"thens":[{"name":"OrderCreated","values":{"orderNumber":10005,"orderDate":19848,"purchaser":1001,"quantity":3,"productId":104}}]}]}
\`\`\`

Json 반환시에는 아래의 예시처럼 모든 공백을 제거하고, 압축된 형태로 반환해주세요.
# BEFORE
{
    "a": 1,
    "b": 2
}

# AFTER
{"a":1,"b":2}

이제 실제로 유저의 입력을 받아서 처리해보겠습니다.
`
            }

            const getUserPrompt = (gwtRequestValue, debeziumLogs) => {
                const getEventStormingObject = (gwtRequestValue) => {
                    const getAttributes = (fieldDescriptors) => {
                        return fieldDescriptors.map((fieldDescriptor) => {
                            return {
                                "name": fieldDescriptor.name,
                                "type": fieldDescriptor.className
                            }
                        })
                    }
                
                    const getGivens = (givenObjects) => {
                        return givenObjects.map((givenObject) => {
                            return {
                                "name": givenObject.name,
                                "attributes": getAttributes(givenObject.aggregateRoot.fieldDescriptors)
                            }
                        })
                    }
                
                    const getWhens = (whenObjects) => {
                        return whenObjects.map((whenObject) => {
                            return {
                                "name": whenObject.name,
                                "attributes": getAttributes(whenObject.fieldDescriptors)
                            }
                        })
                    }
                
                    const getThens = (thenObjects) => {
                        return thenObjects.map((thenObject) => {
                            return {
                                "name": thenObject.name,
                                "attributes": getAttributes(thenObject.fieldDescriptors)
                            }
                        })
                    }
                
                    return {
                        "givens": getGivens(gwtRequestValue.givenObjects),
                        "whens": getWhens(gwtRequestValue.whenObjects),
                        "thens": getThens(gwtRequestValue.thenObjects)
                    }
                }

                const inputObject = {
                    "debeziumLog": getSummarizedDebeziumLogStrings(debeziumLogs),
                    "eventStorming": getEventStormingObject(gwtRequestValue)
                }

                return `[INPUT]
\`\`\`json
${JSON.stringify(inputObject)}
\`\`\`

[OUTPUT]
\`\`\`json
`
            }

            return getSystemPrompt() +
                getUserPrompt(gwtRequestValue, debeziumLogs)
        }

        let preprocessModelValueString = ""
        switch(this.modelMode) {
            case "generateCommands":
                this.UUIDAliasDic = getUUIDAliasDic(this.client.modelValue)
                this.preprocessModelValue = getPreprocessModelValue(this.client.modelValue, this.UUIDAliasDic.UUIDToAlias)
                this.objectIdInfos = getObjectIdInfos(this.preprocessModelValue)
                preprocessModelValueString = JSON.stringify(this.preprocessModelValue)
        
                this.modelMode = "generateCommands"
                if(preprocessModelValueString.length > this.modelInputLengthLimit)
                    this.modelMode = "summaryPreprocessModelValue"
                break
            
            case "summaryPreprocessModelValue":
                this.objectIdInfos = getObjectIdInfos(this.relatedPreProcessModelValue)
                preprocessModelValueString = JSON.stringify(this.relatedPreProcessModelValue)
                    .replace(/\{\}/g, "{...}")
                    .replace(/\[\]/g, "[...]")
                this.modelMode = "generateCommands"
                break
        }


        let systemPrompt = ""
        switch(this.modelMode) {
            case "generateCommands":
                systemPrompt = getSystemPromptForGenerateCommands(preprocessModelValueString, this.messageObj.modificationMessage, this.objectIdInfos)
                break

            case "summaryPreprocessModelValue":
                systemPrompt = getSystemPromptForSummaryPreProcessModelValue(this.preprocessModelValue, this.messageObj.modificationMessage)
                break
            
            case "generateGWT":
                systemPrompt = getSystemPromptForGenerateGWT(this.messageObj.gwtRequestValue, this.messageObj.modificationMessage)
                break
        }

        console.log("[*] 전달된 시스템 프롬프트 \n" + systemPrompt)
        return systemPrompt
    }

    createModel(text){
        const parseToJson = (aiTextResult) => {
            let aiTextToParse = ""

            if(aiTextResult.includes("```")) {
                aiTextResult = aiTextResult.replace(/\`\`\`json/g, "```")
                const aiTextResultParts = aiTextResult.split("```")
                aiTextToParse = aiTextResultParts[aiTextResultParts.length - 2].trim()
            } else
                aiTextToParse = aiTextResult.trim()

            return JSON.parse(aiTextToParse)
        }

        const getDebeziumLogStrings = (logs) => {
            return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
        }

        const getRelatedPreprocecssModelValue = (preprocessModelValue, sortedObjectNames, lengthLimit, onlyNameLengthLimit) => {
            const getSortedObjectPaths = (preProcessModelValue, sortedObjectNames) => {
                const getSearchedObjectPaths = (preProcessModelValue, sortedObjectId) => {
                    let searchObjectPaths = []
                    for(const boundedContext of Object.values(preProcessModelValue)) {
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
                    const searchedObjectPaths = getSearchedObjectPaths(preProcessModelValue, sortedObjectName.split(":")[0])
                    for(const searchedObjectPath of searchedObjectPaths) {
                        if(!objectIdSet.has(searchedObjectPath.id)) {
                            sortedObjectPaths.push(searchedObjectPath)
                            objectIdSet.add(searchedObjectPath.id)
                        }
                    }
                }
        
                return sortedObjectPaths
            }
        
            const getRelatedPreprocessModelValueByPath = (sortedObjectPaths, lenghtLimit, onlyNameLengthLimit) => {
                const applyToObject = (sortedObjectPath, relatedPreprocessModelValue, isApplyOnlyNameProperty) => {
                    let targetObjectValue = relatedPreprocessModelValue
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
                let relatedPreprocessModelValue = {}
                for(const sortedObjectPath of sortedObjectPaths) {
                    let relatedPreprocessModelValue_prev = JSON.parse(JSON.stringify(relatedPreprocessModelValue))
        
                    applyToObject(sortedObjectPath, relatedPreprocessModelValue, isApplyOnlyNameProperty)
        
                    const checkLength = JSON.stringify(relatedPreprocessModelValue).length
                    if(checkLength > onlyNameLengthLimit) isApplyOnlyNameProperty = true
                    if(checkLength > lenghtLimit) return relatedPreprocessModelValue_prev
                }
                
                return relatedPreprocessModelValue
            }
        
            const sortedObjectPaths = getSortedObjectPaths(preprocessModelValue, sortedObjectNames)
            const relatedPreprocessModelValue = getRelatedPreprocessModelValueByPath(sortedObjectPaths, lengthLimit, onlyNameLengthLimit)
            return relatedPreprocessModelValue
        }

        const applyAliasToUUIDToQueries = (queries, aliasToUUIDDic) => {
            const getUUIDIfExist = (alias) => {
                return aliasToUUIDDic[alias] ? aliasToUUIDDic[alias] : alias
            }
        
            for(let query of queries) {
                if(query.ids) {
                    if(query.ids.boundedContextId) query.ids.boundedContextId = getUUIDIfExist(query.ids.boundedContextId)
                    if(query.ids.aggregateId) query.ids.aggregateId = getUUIDIfExist(query.ids.aggregateId)
                    if(query.ids.commandId) query.ids.commandId = getUUIDIfExist(query.ids.commandId)
                    if(query.ids.eventId) query.ids.eventId = getUUIDIfExist(query.ids.eventId)
                    if(query.ids.valueObjectId) query.ids.valueObjectId = getUUIDIfExist(query.ids.valueObjectId)
                    if(query.ids.enumerationId) query.ids.enumerationId = getUUIDIfExist(query.ids.enumerationId)
                }
        
                if(query.args.outputEventIds)
                    query.args.outputEventIds = query.args.outputEventIds.map(eventId => getUUIDIfExist(eventId))
            
                if(query.args.outputCommandIds)
                    query.args.outputCommandIds = query.args.outputCommandIds.map(outputCommandId => {
                        return {
                            commandId: getUUIDIfExist(outputCommandId.commandId),
                            relatedAttribute: outputCommandId.relatedAttribute,
                            reason: outputCommandId.reason
                        }
                    })
            }
            return queries
        }

        if(this.state !== 'end') {
            console.log(`[*] DebeziumLogsTabGenerator에서 결과 생성중... (현재 모드: ${this.modelMode}, 현재 출력된 문자 수: ${text.length})`)

            return {
                modelName: this.modelName,
                modelMode: this.modelMode,
                modelValue: null,
                modelRawValue: text
            }
        }

        try {
            console.log("[*] DebeziumLogsTabGenerator에서 결과이 완료됨! 파싱중... \n" + text)

            let outputResult = {}
            switch(this.modelMode) {
                case "generateCommands":
                    let queryResults = parseToJson(text)
                    applyAliasToUUIDToQueries(queryResults.queries, this.UUIDAliasDic.aliasToUUID)

                    outputResult = {
                        modelName: this.modelName,
                        modelMode: this.modelMode,
                        modelValue: {
                            ...queryResults,
                            debeziumLogStrings: getDebeziumLogStrings(this.messageObj.modificationMessage)
                        },
                        modelRawValue: text
                    }
                    break

                case "summaryPreprocessModelValue":
                    const sortedObjectNames = parseToJson(text).sortedObjectNames
                    this.relatedPreProcessModelValue = getRelatedPreprocecssModelValue(this.preprocessModelValue, sortedObjectNames, this.modelInputLengthLimit, Math.floor(this.modelInputLengthLimit*0.8))

                    outputResult = {
                        modelName: this.modelName,
                        modelMode: this.modelMode,
                        modelValue: {
                            sortedObjectNames: sortedObjectNames,
                            relatedPreProcessModelValue: this.relatedPreProcessModelValue,
                            debeziumLogStrings: getDebeziumLogStrings(this.messageObj.modificationMessage)
                        },
                        modelRawValue: text
                    }
                    break
                
                case "generateGWT":
                    outputResult = {
                        modelName: this.modelName,
                        modelMode: this.modelMode,
                        modelValue: {
                            ...parseToJson(text),
                            requestValue: this.messageObj.gwtRequestValue,
                            debeziumLogStrings: getDebeziumLogStrings(this.messageObj.modificationMessage)
                        },
                        modelRawValue: text
                    }
                    this.modelMode = "generateCommands"
                    break
            }

            console.log("[*] 최종 파싱 결과", outputResult)
            return outputResult
        }
        catch(e) {
            console.error("[!] DebeziumLogsTabGenerator에서 에러가 발생함! \n" + text)
            console.error(e)
            alert("죄송합니다. AI가 출력한 결과가 올바르지 않아서 이벤트 스토밍 모델을 처리하는데 실패했습니다. 다시 시도해주시길 바랍니다. 에러 내용:" + e.message)

            return {
                modelName: this.modelName,
                modelMode: this.modelMode,
                modelValue: null,
                modelRawValue: text,
                errorMessage: e.message
            }
        }
    }
}


module.exports = DebeziumLogsTabGenerator;