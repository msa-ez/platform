class ESValueSummarizeUtil {
    /**
     * getSummarizedESValue() 함수에서 반환된 값에 대한 상세한 AI 프롬프트 설명을 반환
     * @example
     * ESValueSummarizeUtil.getGuidePrompt()
     * @returns 상세한 AI 프롬프트 설명
     */
    static getGuidePrompt() {
        return `You will receive a JSON object containing summarized information about the event storming model on which you will perform your task.
The approximate structure is as follows.
{
    // The event storming model consists of multiple Bounded Contexts.
    "<boundedContextId>": {
        "id": "<boundedContextId>",
        "name": "<boundedContextName>",
        "actors": [
            {
                "id": "<actorId>",
                "name": "<actorName>"
            }
        ],

        // A Bounded Context has multiple aggregates.
        "aggregates": {
            "<aggregateId>": {
                "id": "<aggregateId>",
                "name": "<aggregateName>",
                
                // The aggregate has properties related to the Aggregate Root.
                "properties": [
                    {
                        "name": "<propertyName>",
                        
                        // "<propertyType>" must belong to one of the following three categories:
                        // 1. You can use well-known Java class names. In this case, write only the class name without the full package path. (e.g., java.lang.String > String)
                        // 2. You can use one of the following values: Address, Portrait, Rating, Money, Email
                        // 3. If there's a name defined in enumerations or valueObjects, you can use that name.
                        ["type": "<propertyType>"], // If the type is String, do not specify the type.
                        ["isKey": true] // Indicates whether it's a primary key. Only one of the properties should have isKey set to true.
                    }
                ],

                // Definitions of Entity objects used for the Aggregate Root properties.
                "entities": [
                    {
                        "id": "<entityId>",
                        "name": "<entityName>",
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                                ["isKey": true],
                                ["isForeignProperty": true] // Indicates whether it's a foreign key. If this property references a property in another table, this value should be set to true.
                            }
                        ]
                    }
                ],
                
                // Definitions of Enum objects used for the Aggregate Root properties.
                "enumerations": [
                    {
                        "id": "<enumerationId>",
                        "name": "<enumerationName>",
                        "items": ["<itemName1>", "<itemName2>"]
                    }
                ],
                
                // Definitions of ValueObject objects used for the Aggregate Root properties.
                "valueObjects": [
                    {
                        "id": "<valueObjectId>",
                        "name": "<valueObjectName>",
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                                ["isKey": true],
                                ["isForeignProperty": true] // Indicates whether it's a foreign key. If this property references a property in another table, this value should be set to true.
                            }
                        ]
                    }
                ],
                
                // List of commands representing requests through REST API.
                "commands": [
                    {
                        "id": "<commandId>",
                        "name": "<commandName>",
                        "api_verb":  <"POST" | "DELETE" | "PUT">,
                        "outputEvents": [{
                            "relationId": "<relationId>",
                            "id": "<eventId>",
                            "name": "<eventName>"
                        }] // Information about the event that occurs when this command is requested.
                    }
                ],
                
                // List of events triggered by commands.
                "events": [
                    {
                        "id": "<eventId>",
                        "name": "<eventName>",
                        "outputCommands": [{
                            "relationId": "<relationId>",
                            "id": "<commandId>",
                            "name": "<commandName>"
                        }] // Information about the command that occurs when this event is requested.
                    }
                ]
            }
        }
    }
}

`
    }

    /**
     * 주어진 이벤트스토밍에서 위치 데이터등을 제외한 핵심 정보들만 추출한 결과를 반환
     * @param {*} esValue 이벤트스토밍 모델 값(this.value)
     * @example
     * ESValueSummarizeUtil.getSummarizedESValue(this.value)
     * {
     *   "bc-001": {
     *       "id": "bc-001",
     *       "name": "주문 관리",
     *       "actors": [
     *           { "id": "actor-001", "name": "고객" }
     *       ],
     *       "aggregates": {
     *           "agg-001": {
     *               "id": "agg-001",
     *               "name": "주문",
     *               "properties": [
     *                 { "name": "orderId", "type": "Long", "isKey": true },
     *                 { "name": "customerName" },
     *                 { "name": "orderDate", "type": "Date" }
     *               ],
     *               "enumerations": [
     *                 {
     *                   "id": "enum-001",
     *                   "name": "OrderStatus",
     *                   "items": ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"]
     *                 }
     *              ],
     *              "valueObjects": [
     *                 {
     *                     "id": "vo-001",
     *                     "name": "Address",
     *                     "properties": [
     *                         { "name": "street" },
     *                         { "name": "city" },
     *                         { "name": "zipCode" }
     *                     ]
     *                 }
     *             ],
     *             "commands": [
     *                 {
     *                     "id": "cmd-001",
     *                     "name": "주문 생성",
     *                     "api_verb": "POST",
     *                     "outputEvents": [
     *                         { "relationId": "rel-001", "id": "evt-001", "name": "주문 생성됨" }
     *                     ]
     *                 }
     *             ],
     *             "events": [
     *                 {
     *                     "id": "evt-001",
     *                     "name": "주문 생성됨",
     *                     "outputCommands": [
     *                         { "relationId": "rel-002", "id": "cmd-002", "name": "결제 처리" }
     *                     ]
     *                 }
     *             ]
     *         }
     *     }
     * }
     * @returns 요약된 이벤트스토밍 모델 값
     */
    static getSummarizedESValue(esValue){
        const getAllBoundedContexts = (esValue) => {
            return Object.values(esValue.elements)
                .filter(element => element && element._type === 'org.uengine.modeling.model.BoundedContext')
        }

        /**
         * 주어진 BoundedContext에서 agggregates 속성이 없을 경우를 대비해서, 주어진 이벤트스토밍 값을 통해서 복원
         */
        const restoreBoundedContextAggregatesProperties = (esValue, boundedContext) => {
            boundedContext.aggregates = []
            for(let element of Object.values(esValue.elements))
            {
                if(element && element._type === "org.uengine.modeling.model.Aggregate" 
                   && element.boundedContext && element.boundedContext.id === boundedContext.id)
                   boundedContext.aggregates.push({id: element.id})
            }
        }

        let summarizedESValue = {}
        for(let boundedContext of getAllBoundedContexts(esValue)) {
            restoreBoundedContextAggregatesProperties(esValue, boundedContext)
            summarizedESValue[boundedContext.id] = ESValueSummarizeUtil.getSummarizedBoundedContextValue(esValue, boundedContext)
        }
        return summarizedESValue
    }


    static getSummarizedBoundedContextValue(esValue, boundedContext) {
        const getAllAggregates = (esValue, boundedContext) => {
            return boundedContext.aggregates.map(aggregate => esValue.elements[aggregate.id])
        }

        const getAllActors = (esValue, boundedContext) => {
            let actors = []
            for(let element of Object.values(esValue.elements)){
                if(element && (element._type === 'org.uengine.modeling.model.Actor') &&
                (element.boundedContext.id === boundedContext.id)){
                    actors.push({
                        id: ESValueSummarizeUtil.__getElementIdSafely(element),
                        name: element.name
                    })
                }
            }

            let uniqueActors = []
            for(let actor of actors){
                if(!uniqueActors.some(a => a.name === actor.name))
                    uniqueActors.push(actor)
            }
            return uniqueActors;
        }

        let summarizedBoundedContextValue = {}
        summarizedBoundedContextValue.id = ESValueSummarizeUtil.__getElementIdSafely(boundedContext)
        summarizedBoundedContextValue.name = boundedContext.name
        summarizedBoundedContextValue.actors = getAllActors(esValue, boundedContext)
        
        summarizedBoundedContextValue.aggregates = {}
        for(let aggregate of getAllAggregates(esValue, boundedContext))
            summarizedBoundedContextValue.aggregates[aggregate.id] = ESValueSummarizeUtil.getSummarizedAggregateValue(esValue, boundedContext, aggregate)
        return summarizedBoundedContextValue
    }

    static getSummarizedAggregateValue(esValue, boundedContext, aggregate) {
        const getAggregateProperties = (aggregate) => {
            return aggregate.aggregateRoot.fieldDescriptors.map(fieldDescriptor => {
                let property = {
                    name: fieldDescriptor.name
                }

                if(!(fieldDescriptor.className.toLowerCase().includes("string")))
                    property.type = fieldDescriptor.className
                if(fieldDescriptor.isKey)
                    property.isKey = true

                return property
            })
        }

        let summarizedAggregateValue = {}
        summarizedAggregateValue.id = ESValueSummarizeUtil.__getElementIdSafely(aggregate)
        summarizedAggregateValue.name = aggregate.name
        summarizedAggregateValue.properties = getAggregateProperties(aggregate)
        summarizedAggregateValue.entities = ESValueSummarizeUtil.getSummarizedEntityValue(aggregate)
        summarizedAggregateValue.enumerations = ESValueSummarizeUtil.getSummarizedEnumerationValue(aggregate)
        summarizedAggregateValue.valueObjects = ESValueSummarizeUtil.getSummarizedValueObjectValue(aggregate)
        summarizedAggregateValue.commands = ESValueSummarizeUtil.getSummarizedCommandValue(esValue, boundedContext, aggregate)
        summarizedAggregateValue.events = ESValueSummarizeUtil.getSummarizedEventValue(esValue, boundedContext, aggregate)
        return summarizedAggregateValue
    }

    static getSummarizedEntityValue(aggregate) {
        const getEntityInfo = (entity) => {
            let entityInfo = {}
            entityInfo.id = ESValueSummarizeUtil.__getElementIdSafely(entity)
            entityInfo.name = entity.name
            entityInfo.properties = entity.fieldDescriptors.map(fieldDescriptor => {
                let property = {
                    name: fieldDescriptor.name
                }

                if(!(fieldDescriptor.className.toLowerCase().includes("string"))) 
                    property.type = fieldDescriptor.className
                if(fieldDescriptor.isKey) 
                    property.isKey = true
                if(fieldDescriptor.className.toLowerCase() === aggregate.name.toLowerCase()) 
                    property.isForeignProperty = true
                
                return property
            })
            return entityInfo
        }

        if(!aggregate.aggregateRoot || !aggregate.aggregateRoot.entities || !aggregate.aggregateRoot.entities.elements) return []

        let summarizedEntityValue = []
        for(let element of Object.values(aggregate.aggregateRoot.entities.elements))
            if(element && !element.isAggregateRoot && (element._type === 'org.uengine.uml.model.Class'))
                summarizedEntityValue.push(getEntityInfo(element))
        return summarizedEntityValue
    }

    static getSummarizedEnumerationValue(aggregate) {
        const getEnumInfo = (element) => {
            let enumInfo = {}
            enumInfo.id = ESValueSummarizeUtil.__getElementIdSafely(element)
            enumInfo.name = element.name
            enumInfo.items = element.items.map(item => {
                return item.value
            })
            return enumInfo
        }

        if(!aggregate.aggregateRoot || !aggregate.aggregateRoot.entities || !aggregate.aggregateRoot.entities.elements) return []

        let summarizedEnumerationValue = []
        for(let element of Object.values(aggregate.aggregateRoot.entities.elements))
            if(element && (element._type === 'org.uengine.uml.model.enum'))
                summarizedEnumerationValue.push(getEnumInfo(element))
        return summarizedEnumerationValue
    }

    static getSummarizedValueObjectValue(aggregate) {
        const getValueObjectInfo = (element) => {
            let valueObjectInfo = {}
            valueObjectInfo.id = ESValueSummarizeUtil.__getElementIdSafely(element)
            valueObjectInfo.name = element.name
            valueObjectInfo.properties = element.fieldDescriptors.map(fieldDescriptor => {
                let property = {
                    name: fieldDescriptor.name
                }

                if(!(fieldDescriptor.className.toLowerCase().includes("string"))) 
                    property.type = fieldDescriptor.className
                if(fieldDescriptor.isKey) 
                    property.isKey = true
                if(fieldDescriptor.className.toLowerCase() === aggregate.name.toLowerCase()) 
                    property.isForeignProperty = true
                
                return property
            })
            return valueObjectInfo
        }

        if(!aggregate.aggregateRoot || !aggregate.aggregateRoot.entities || !aggregate.aggregateRoot.entities.elements) return []

        let summarizedValueObjectValue = []
        for(let element of Object.values(aggregate.aggregateRoot.entities.elements)){
            if(element && (element._type === 'org.uengine.uml.model.vo.Class'))
                summarizedValueObjectValue.push(getValueObjectInfo(element))
        }
        return summarizedValueObjectValue
    }

    static getSummarizedCommandValue(esValue, boundedContext, aggregate) {
        const getCommandInfo = (esValue, element) => {
            let commandInfo = {}
            commandInfo.id = ESValueSummarizeUtil.__getElementIdSafely(element)
            commandInfo.name = element.name
            commandInfo.api_verb = (element.restRepositoryInfo && element.restRepositoryInfo.method) ? element.restRepositoryInfo.method : "POST"

            commandInfo.outputEvents = []
            for(let relation of Object.values(esValue.relations)){
                if(relation && relation.sourceElement.id === element.id && 
                   relation.targetElement._type === 'org.uengine.modeling.model.Event')
                   commandInfo.outputEvents.push({
                        relationId: ESValueSummarizeUtil.__getElementIdSafely(relation),
                        id: ESValueSummarizeUtil.__getElementIdSafely(relation.targetElement),
                        name: relation.targetElement.name
                    })
            }

            return commandInfo
        }

        let summarizedCommandValue = []
        for(let element of Object.values(esValue.elements)){
            if(element && (element._type === 'org.uengine.modeling.model.Command') &&
            (element.boundedContext.id === boundedContext.id) &&
            (element.aggregate.id === aggregate.id)){
                summarizedCommandValue.push(getCommandInfo(esValue, element))
            }
        }
        return summarizedCommandValue
    }

    static getSummarizedEventValue(esValue, boundedContext, aggregate) {
        const getRelationsForType = (esValue, sourceElement, targetType) => {
            return Object.values(esValue.relations)
                .filter(r => r && r.sourceElement.id === sourceElement.id && r.targetElement._type === targetType)
        }

        const getEventInfo = (esValue, element) => {
            let eventInfo = {}
            eventInfo.id = ESValueSummarizeUtil.__getElementIdSafely(element)
            eventInfo.name = element.name

            eventInfo.outputCommands = []
            for(let policyRelation of getRelationsForType(esValue, element, "org.uengine.modeling.model.Policy")) {
                const targetPolicy = esValue.elements[policyRelation.targetElement.id]
                for(let commandRelation of getRelationsForType(esValue, targetPolicy, "org.uengine.modeling.model.Command")) {
                    eventInfo.outputCommands.push({
                        relationId: ESValueSummarizeUtil.__getElementIdSafely(commandRelation),
                        id: ESValueSummarizeUtil.__getElementIdSafely(commandRelation.targetElement),
                        name: commandRelation.targetElement.name
                    })   
                }
            }
            return eventInfo
        }

        let summarizedEventValue = []
        for(let element of Object.values(esValue.elements)){
            if(element && (element._type === 'org.uengine.modeling.model.Event') &&
            (element.boundedContext.id === boundedContext.id) &&
            (element.aggregate.id === aggregate.id)){
                summarizedEventValue.push(getEventInfo(esValue, element))
            }
        }
        return summarizedEventValue
    }

    
    static __getElementIdSafely(element) {
        if(element.id) return element.id
        if(element.elementView) return element.elementView.id
        throw new Error("전달된 이벤트 스토밍 엘리먼트중에서 id를 구할 수 없는 객체가 존재함! " + element)
    }
}

module.exports = ESValueSummarizeUtil