class ESValueSummarizeWithFilter {
    static getGuidePrompt() {
        return `You will receive a JSON object containing summarized information about the event storming model on which you will perform your task. Not all guided properties may be passed, and properties that are unnecessary for the task may be excluded.
The approximate structure is as follows.
{
    // Properties that have been deleted because they are not needed for the given task.
    "deletedProperties": ["<deletedPropertyPath>"],

    "boundedContexts": [
        "id": "<boundedContextId>",
        "name": "<boundedContextName>",
        "actors": [
            {
                "id": "<actorId>",
                "name": "<actorName>"
            }
        ],
        "aggregates": [
            {
                "id": "<aggregateId>",
                "name": "<aggregateName>",
                "properties": [
                    {
                        "name": "<propertyName>",

                        // "<propertyType>" must belong to one of the following three categories:
                        // 1. Well-known Java class names. In this case, write only the class name without the full package path. (e.g., java.lang.String > String)
                        // 2. If there's a name defined in Enumerations or ValueObjects or Entities, It can be used as the property type.
                        // If the type is String, do not specify the type.
                        ["type": "<propertyType>"],

                        // Only one of the properties should have isKey set to true.
                        // If it needs a composite key, it will reference a ValueObject with those properties.
                        ["isKey": true]
                    }
                ],

                "entities": [
                    {
                        "id": "<entityId>",
                        "name": "<entityName>",
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"], 
                                ["isKey": true],

                                // If this property references a property in another table, this value should be set to true.
                                ["isForeignProperty": true]
                            }
                        ]
                    }
                ],

                "enumerations": [
                    {
                        "id": "<enumerationId>",
                        "name": "<enumerationName>",
                        "items": ["<itemName1>"]
                    }
                ],

                "valueObjects": [
                    {
                        "id": "<valueObjectId>",
                        "name": "<valueObjectName>",
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"],
                                ["isKey": true],
                                ["isForeignProperty": true],

                                // If the property is used as a foreign key to reference another Aggregate, write the name of that Aggregate.
                                ["referencedAggregateName": "<referencedAggregateName>"]
                            }
                        ]
                    }
                ],

                "commands": [
                    {
                        "id": "<commandId>",
                        "name": "<commandName>",
                        "api_verb":  <"POST" | "PUT" | "PATCH" | "DELETE">,

                        // Determines the API endpoint structure:
                        // true: Uses standard REST endpoints with HTTP verbs only (e.g., POST /book)
                        // false: Uses custom endpoints with command names for complex operations (e.g., POST /book/updateStatus)
                        "isRestRepository": <true | false>, 
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"],
                                ["isKey": true]
                            }
                        ],

                        // A list of cascading events that occur when a command is executed.
                        "outputEvents": [
                            {
                                "id": "<eventId>",
                                "name": "<eventName>"
                            }
                        ]
                    }
                ],

                "events": [
                    {
                        "id": "<eventId>",
                        "name": "<eventName>",
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"],
                                ["isKey": true]
                            }
                        ],

                        // A list of cascading commands that occur when an event is executed.
                        "outputCommands": [
                            {
                                "id": "<commandId>",
                                "name": "<commandName>",
                                "policyId": "<policyId>",
                                "policyName": "<policyName>"
                            }
                        ]
                    }
                ],

                "readModels": [
                    {
                        "id": "<readModelId>",
                        "name": "<readModelName>",
                        "queryParameters": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"],
                                ["isKey": true]
                            }
                        ],
                        "isMultipleResult": <true | false>
                    }
                ]
            }
        ]
    ]
}`
    }

    /**
     * @description 이벤트 스토밍 모델(esValue)을 요약된 형태로 변환하는 메소드입니다.
     * 특정 속성들을 제외하고 싶을 때 keysToExcludeFilter를 사용하여 필터링할 수 있으며,
     * ID 변환이 필요한 경우 esAliasTransManager를 통해 처리할 수 있습니다.
     * 
     * @example 기본적인 모델 요약
     * // 모든 속성을 포함한 요약된 형태로 변환
     * const esValue = mocks.getEsValue("libraryService")
     * const summary = ESValueSummarizeWithFilter.getSummarizedESValue(
     *     esValue,
     *     [],
     *     new ESAliasTransManager(esValue)
     * )
     * 
     * @example 특정 속성을 제외한 필터링
     * // properties 속성을 제외한 요약 정보 생성
     * // 이는 모델의 구조만 필요하고 상세 속성은 필요없는 경우 유용
     * const esValue = mocks.getEsValue("libraryService")
     * const summaryWithFilter = ESValueSummarizeWithFilter.getSummarizedESValue(
     *     esValue,
     *     ["properties"],
     *     new ESAliasTransManager(esValue)
     * )
     * 
     * @example 템플릿 필터 사용
     * // KEY_FILTER_TEMPLATES를 활용한 필터링
     * // aggregateOuterStickers: 외부 스티커(commands, events, readModels) 제외
     * // aggregateInnerStickers: 내부 스티커(entities, enumerations, valueObjects) 제외
     * // detailedProperties: 상세 속성(properties, items) 제외
     * const esValue = mocks.getEsValue("libraryService")
     * const summaryWithTemplateFilter = ESValueSummarizeWithFilter.getSummarizedESValue(
     *     esValue,
     *     ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.detailedProperties,
     *     new ESAliasTransManager(esValue)
     * )
     * 
     * @param {Object} esValue 이벤트 스토밍 모델 객체
     * @param {Array} keysToExcludeFilter 제외할 속성 키 배열
     * @param {ESAliasTransManager} esAliasTransManager ID 변환을 위한 매니저 객체
     * @returns {Object} 요약된 이벤트 스토밍 모델 정보
     */
    static getSummarizedESValue(esValue, keysToExcludeFilter=[], esAliasTransManager=null){
        const boundedContexts = Object.values(esValue.elements)
        .filter(element => element && element._type === 'org.uengine.modeling.model.BoundedContext')

        let summarizedBoundedContexts = boundedContexts.map(boundedContext => 
            this.getSummarizedBoundedContextValue(
                esValue, boundedContext, keysToExcludeFilter, esAliasTransManager
            )
        )

        return {
            deletedProperties: keysToExcludeFilter,
            boundedContexts: summarizedBoundedContexts
        }
    }

    
    static getSummarizedBoundedContextValue(esValue, boundedContext, keysToExcludeFilter=[], esAliasTransManager=null) {   
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }


        this._restoreBoundedContextAggregatesProperties(esValue, boundedContext)
        
        return {
            ...getConditionalValue(
                ["id", "boundedContext.id"], 
                { id: this._getElementIdSafely(boundedContext, esAliasTransManager) }
            ),
            ...getConditionalValue(
                ["name", "boundedContext.name"], 
                { name: boundedContext.name }
            ),
            ...getConditionalValue(
                ["actors", "boundedContext.actors"], 
                { actors: this.getSummarizedActorValue(
                    esValue, boundedContext, keysToExcludeFilter, esAliasTransManager
                )}
            ),
            ...getConditionalValue(
                ["aggregates", "boundedContext.aggregates"], 
                { aggregates: boundedContext.aggregates
                    .map(aggregate => esValue.elements[aggregate.id])
                    .map(aggregate => this.getSummarizedAggregateValue(
                        esValue, boundedContext, aggregate, keysToExcludeFilter, esAliasTransManager
                    ))
                }
            )
        }
    }

    static getSummarizedActorValue(esValue, boundedContext, keysToExcludeFilter=[], esAliasTransManager=null) {
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }

        const getUniqueActors = (actors, property) => {
            let uniqueActors = []
            for(let actor of actors){
                if(!uniqueActors.some(a => a[property] === actor[property]))
                    uniqueActors.push(actor)
            }
            return uniqueActors
        }


        let actors = []
        for(let element of Object.values(esValue.elements)){
            if(element && (element._type === 'org.uengine.modeling.model.Actor') &&
            (element.boundedContext.id === boundedContext.id)){
                actors.push({
                    ...getConditionalValue(
                        ["id", "actors.id"], 
                        { id: this._getElementIdSafely(element, esAliasTransManager) }
                    ),
                    ...getConditionalValue(
                        ["name", "actors.name"], 
                        { name: element.name }
                    )
                })
            }
        }


        if(!this._checkKeyFilters(keysToExcludeFilter, ["name", "actors.name"]))
            return getUniqueActors(actors, "name")

        if(!this._checkKeyFilters(keysToExcludeFilter, ["id", "actors.id"]))
            return getUniqueActors(actors, "id")

        return actors
    }

    static getSummarizedAggregateValue(esValue, boundedContext, aggregate, keysToExcludeFilter=[], esAliasTransManager=null) {
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }

        return {
            ...getConditionalValue(
                ["id", "aggregate.id"],
                { id: this._getElementIdSafely(aggregate, esAliasTransManager) }
            ),
            ...getConditionalValue(
                ["name", "aggregate.name"],
                { name: aggregate.name }
            ),
            ...getConditionalValue(
                ["properties", "aggregate.properties"],
                { properties: this._getSummarizedFieldDescriptors(aggregate.aggregateRoot.fieldDescriptors) }
            ),
            ...getConditionalValue(
                ["entities", "aggregate.entities"],
                { entities: this.getSummarizedEntityValue(aggregate, keysToExcludeFilter, esAliasTransManager) }
            ),
            ...getConditionalValue(
                ["enumerations", "aggregate.enumerations"],
                { enumerations: this.getSummarizedEnumerationValue(aggregate, keysToExcludeFilter, esAliasTransManager) }
            ),
            ...getConditionalValue(
                ["valueObjects", "aggregate.valueObjects"],
                { valueObjects: this.getSummarizedValueObjectValue(aggregate, keysToExcludeFilter, esAliasTransManager) }
            ),
            ...getConditionalValue(
                ["commands", "aggregate.commands"],
                { commands: this.getSummarizedCommandValue(esValue, boundedContext, aggregate, keysToExcludeFilter, esAliasTransManager) }
            ),
            ...getConditionalValue(
                ["events", "aggregate.events"],
                { events: this.getSummarizedEventValue(esValue, boundedContext, aggregate, keysToExcludeFilter, esAliasTransManager) }
            ),
            ...getConditionalValue(
                ["readModels", "aggregate.readModels"],
                { readModels: this.getSummarizedReadModelValue(esValue, boundedContext, aggregate, keysToExcludeFilter, esAliasTransManager) }
            )
        }
    }

    static getSummarizedEntityValue(aggregate, keysToExcludeFilter=[], esAliasTransManager=null) {
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }


        if(!this._isAggregateHaveElements(aggregate)) return []
        
        let summarizedEntityValue = []
        for(let element of Object.values(aggregate.aggregateRoot.entities.elements)) {
            if(element && !element.isAggregateRoot && 
               (element._type === 'org.uengine.uml.model.Class')) {
                summarizedEntityValue.push({
                    ...getConditionalValue(
                        ["id", "entities.id"],
                        { id: this._getElementIdSafely(element, esAliasTransManager) }
                    ),
                    ...getConditionalValue(
                        ["name", "entities.name"],
                        { name: element.name }
                    ),
                    ...getConditionalValue(
                        ["properties", "entities.properties"],
                        { properties: this._getSummarizedFieldDescriptors(
                            element.fieldDescriptors,
                            (property, fieldDescriptor) => {
                                if(fieldDescriptor.className.toLowerCase() === aggregate.name.toLowerCase()) 
                                    property.isForeignProperty = true
                            }
                        )}
                    )
                })
            }
        }
        return summarizedEntityValue
    }

    static getSummarizedEnumerationValue(aggregate, keysToExcludeFilter=[], esAliasTransManager=null) {
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }


        if(!this._isAggregateHaveElements(aggregate)) return []

        let summarizedEnumerationValue = []
        for(let element of Object.values(aggregate.aggregateRoot.entities.elements)) {
            if(element && (element._type === 'org.uengine.uml.model.enum')) {
                summarizedEnumerationValue.push({
                    ...getConditionalValue(
                        ["id", "enumerations.id"],
                        { id: this._getElementIdSafely(element, esAliasTransManager) }
                    ),
                    ...getConditionalValue(
                        ["name", "enumerations.name"],
                        { name: element.name }
                    ),
                    ...getConditionalValue(
                        ["items", "enumerations.items"],
                        { items: element.items.map(item => item.value) }
                    )
                })
            }
        }
        return summarizedEnumerationValue
    }

    static getSummarizedValueObjectValue(aggregate, keysToExcludeFilter=[], esAliasTransManager=null) {
       const getConditionalValue = (keys, value) => {
           return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
       }

       if(!this._isAggregateHaveElements(aggregate)) return []
       
       let summarizedValueObjectValue = []
       for(let element of Object.values(aggregate.aggregateRoot.entities.elements)) {
           if(element && (element._type === 'org.uengine.uml.model.vo.Class')) {
               summarizedValueObjectValue.push({
                   ...getConditionalValue(
                       ["id", "valueObjects.id"],
                       { id: this._getElementIdSafely(element, esAliasTransManager) }
                   ),
                   ...getConditionalValue(
                       ["name", "valueObjects.name"],
                       { name: element.name }
                   ),
                   ...getConditionalValue(
                       ["properties", "valueObjects.properties"],
                        { properties: this._getSummarizedFieldDescriptors(
                            element.fieldDescriptors,
                            (property, fieldDescriptor) => {
                                if(fieldDescriptor.className.toLowerCase() === aggregate.name.toLowerCase()) 
                                    property.isForeignProperty = true

                                if(fieldDescriptor.referenceClass) {
                                    property.referencedAggregateName = fieldDescriptor.referenceClass
                                    property.isForeignProperty = true
                                }
                            }
                        )}
                   )
               })
           }
       }
       return summarizedValueObjectValue
    }

    static getSummarizedCommandValue(esValue, boundedContext, aggregate, keysToExcludeFilter=[], esAliasTransManager=null) {
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }

        const getOutputEvents = (element) => {
            let events = []
            for(let relation of Object.values(esValue.relations)) {
                if(relation && relation.sourceElement.id === element.id && 
                   relation.targetElement._type === 'org.uengine.modeling.model.Event') {
                    events.push({
                        ...getConditionalValue(
                            ["id", "commands.outputEvents.id"],
                            { id: this._getElementIdSafely(relation.targetElement, esAliasTransManager) }
                        ),
                        ...getConditionalValue(
                            ["name", "commands.outputEvents.name"],
                            { name: relation.targetElement.name }
                        )
                    })
                }
            }
            return events
        }

        let summarizedCommandValue = []
        for(let element of Object.values(esValue.elements)) {
            if(element && (element._type === 'org.uengine.modeling.model.Command') &&
               (element.boundedContext.id === boundedContext.id) &&
               (element.aggregate.id === aggregate.id)) {
                
                summarizedCommandValue.push({
                    ...getConditionalValue(
                        ["id", "commands.id"],
                        { id: this._getElementIdSafely(element, esAliasTransManager) }
                    ),
                    ...getConditionalValue(
                        ["name", "commands.name"],
                        { name: element.name }
                    ),
                    ...getConditionalValue(
                        ["api_verb", "commands.api_verb"],
                        { api_verb: (element.restRepositoryInfo && element.restRepositoryInfo.method) 
                            ? element.restRepositoryInfo.method 
                            : "POST" 
                        }
                    ),
                    ...getConditionalValue(
                        ["isRestRepository", "commands.isRestRepository"],
                        { isRestRepository: element.isRestRepository ? true : false }
                    ),
                    ...getConditionalValue(
                        ["properties", "commands.properties"],
                        { properties: element.fieldDescriptors ? 
                            this._getSummarizedFieldDescriptors(element.fieldDescriptors) : [] 
                        }
                    ),
                    ...getConditionalValue(
                        ["outputEvents", "commands.outputEvents"],
                        { outputEvents: getOutputEvents(element) }
                    )
                })
            }
        }
        return summarizedCommandValue
    }

    static getSummarizedEventValue(esValue, boundedContext, aggregate, keysToExcludeFilter=[], esAliasTransManager=null) {
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }

        const getRelationsForType = (esValue, sourceElement, targetType) => {
            return Object.values(esValue.relations)
                .filter(r => r && r.sourceElement.id === sourceElement.id && r.targetElement._type === targetType)
        }

        const getOutputCommands = (element) => {
            let commands = []
            for(let policyRelation of getRelationsForType(esValue, element, "org.uengine.modeling.model.Policy")) {
                const targetPolicy = esValue.elements[policyRelation.targetElement.id]
                if(!targetPolicy) continue
                
                for(let commandRelation of getRelationsForType(esValue, targetPolicy, "org.uengine.modeling.model.Command")) {
                    commands.push({
                        ...getConditionalValue(
                            ["id", "events.outputCommands.id"],
                            { id: this._getElementIdSafely(commandRelation.targetElement, esAliasTransManager) }
                        ),
                        ...getConditionalValue(
                            ["name", "events.outputCommands.name"],
                            { name: commandRelation.targetElement.name }
                        ),
                        ...getConditionalValue(
                            ["id", "events.outputCommands.policyId"],
                            { policyId: this._getElementIdSafely(targetPolicy, esAliasTransManager) }
                        ),
                        ...getConditionalValue(
                            ["name", "events.outputCommands.policyName"],
                            { policyName: targetPolicy.name }
                        )
                    })
                }
            }
            return commands
        }

        let summarizedEventValue = []
        for(let element of Object.values(esValue.elements)) {
            if(element && (element._type === 'org.uengine.modeling.model.Event') &&
               (element.boundedContext.id === boundedContext.id) &&
               (element.aggregate.id === aggregate.id)) {
                
                summarizedEventValue.push({
                    ...getConditionalValue(
                        ["id", "events.id"],
                        { id: this._getElementIdSafely(element, esAliasTransManager) }
                    ),
                    ...getConditionalValue(
                        ["name", "events.name"],
                        { name: element.name }
                    ),
                    ...getConditionalValue(
                        ["properties", "events.properties"],
                        { properties: element.fieldDescriptors ? 
                            this._getSummarizedFieldDescriptors(element.fieldDescriptors) : [] 
                        }
                    ),
                    ...getConditionalValue(
                        ["outputCommands", "events.outputCommands"],
                        { outputCommands: getOutputCommands(element) }
                    )
                })
            }
        }
        return summarizedEventValue
    }

    static getSummarizedReadModelValue(esValue, boundedContext, aggregate, keysToExcludeFilter=[], esAliasTransManager=null) {
        const getConditionalValue = (keys, value) => {
            return !this._checkKeyFilters(keysToExcludeFilter, keys) ? value : {}
        }

        let summarizedReadModelValue = []
        for(let element of Object.values(esValue.elements)) {
            if(element && (element._type === "org.uengine.modeling.model.View") &&
               (element.boundedContext.id === boundedContext.id) &&
               (element.aggregate.id === aggregate.id)) {
                
                summarizedReadModelValue.push({
                    ...getConditionalValue(
                        ["id", "readModels.id"],
                        { id: this._getElementIdSafely(element, esAliasTransManager) }
                    ),
                    ...getConditionalValue(
                        ["name", "readModels.name"],
                        { name: element.name }
                    ),
                    ...getConditionalValue(
                        ["properties", "readModels.properties"],
                        { queryParameters: element.queryParameters ? 
                            this._getSummarizedFieldDescriptors(element.queryParameters) : [] 
                        } // ReadModel인 경우에만 기존과 다르게 queryParameters로 참조
                    ),
                    ...getConditionalValue(
                        ["isMultipleResult", "readModels.isMultipleResult"],
                        { isMultipleResult: element.isMultipleResult ? true : false }
                    )
                })
            }
        }
        return summarizedReadModelValue
    }
 

    /**
     * 주어진 BoundedContext에서 agggregates 속성이 없을 경우를 대비해서, 주어진 이벤트스토밍 값을 통해서 복원
     */
    static _restoreBoundedContextAggregatesProperties(esValue, boundedContext) {
        boundedContext.aggregates = []
        for(let element of Object.values(esValue.elements))
        {
            if(element && element._type === "org.uengine.modeling.model.Aggregate" 
                && element.boundedContext && element.boundedContext.id === boundedContext.id)
                boundedContext.aggregates.push({id: element.id})
        }
    }

    static _getSummarizedFieldDescriptors(fieldDescriptors, onAfterCreateProperty=null) {
        return fieldDescriptors.map(fieldDescriptor => {
            let property = {
                name: fieldDescriptor.name
            }

            if(!(fieldDescriptor.className.toLowerCase().includes("string")))
                property.type = fieldDescriptor.className

            if(fieldDescriptor.isKey)
                property.isKey = true

            if(onAfterCreateProperty) onAfterCreateProperty(property, fieldDescriptor)
            return property
        })
    }

    static _checkKeyFilters(keysToExcludeFilter, valuesToCheck, onNotMatch=null) {
        for(let key of keysToExcludeFilter)
            if(valuesToCheck.includes(key)) return true

        if(onNotMatch) onNotMatch()
        return false
    }

    static _getElementIdSafely(element, esAliasTransManager=null) {
        if(esAliasTransManager) return esAliasTransManager.getElementAliasSafely(element)
        if(element.id) return element.id
        if(element.elementView) return element.elementView.id
        throw new Error("전달된 이벤트 스토밍 엘리먼트중에서 id를 구할 수 없는 객체가 존재함! " + element)
    }

    static _isAggregateHaveElements(aggregate) {
        return aggregate.aggregateRoot && aggregate.aggregateRoot.entities && aggregate.aggregateRoot.entities.elements
    }
}

ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES = {
    "aggregateOuterStickers": ["aggregate.commands", "aggregate.events", "aggregate.readModels"],
    "aggregateInnerStickers": ["aggregate.entities", "aggregate.enumerations", "aggregate.valueObjects"],
    "detailedProperties": ["properties", "items"]
}

module.exports = ESValueSummarizeWithFilter