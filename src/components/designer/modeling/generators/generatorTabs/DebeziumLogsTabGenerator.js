const JsonAIGenerator = require("../JsonAIGenerator");
const changeCase = require('change-case');
const jp = require('jsonpath');

class DebeziumLogsTabGenerator extends JsonAIGenerator{
    constructor(client, messageObj, errorCallback){
        super(client);

        this.model = "gpt-4o"
        this.preferredLanguage = this.setPreferredLanguage();
        this.originalLanguage = this.preferredLanguage.toLowerCase();
        this.messageObj = messageObj
        this.modelName = "DebeziumLogsTabGenerator"
        this.errorCallback = errorCallback

        this.modelMode = "generateGodTableDistributeGuidesPreStep"
        this.modelInputLengthLimit = 10000
        this.relatedPreProcessModelValueString = ""
        this.queryResultsToModificate = null

        this.UUIDAliasDic = {}
        this.generatedGuideValues = {}
        this.temperature = 0.3
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
        
            const restoreAggregatesProperties = (boundedContext, modelValue) => {
                let aggregates = []
                for(let element of Object.values(modelValue.elements))
                {
                    if(element && element._type === "org.uengine.modeling.model.Aggregate" 
                       && element.boundedContext && element.boundedContext.id === boundedContext.id)
                        aggregates.push({id: element.id})
                }
                boundedContext.aggregates = aggregates
            }
            
            let boundedContextInfos = {}
            for(let boundedContext of getAllBoundedContexts(modelValue)) {
                restoreAggregatesProperties(boundedContext, modelValue)
                boundedContextInfos[getAliasIfExist(boundedContext.id)] = getBoundedContextInfo(boundedContext, modelValue)
            }
            return boundedContextInfos;
            
        }

        const getPreprocessInfos = (preprocessModelValue, modelValue) => {
            const getPreprocessInfos = (preprocessModelValue) => {
                let primaryKeysSet = new Set()
                let preProcessInfos = {
                    boundedContextInfos: [],
                    aggregateInfos: [],
                    valueObjectInfos: [],
                    commandInfos: [],
                    eventInfos: [],
                    aggregateValueObjectNameDic: {}
                }


                Object.values(preprocessModelValue).forEach(boundary => {
                    preProcessInfos.boundedContextInfos.push({
                        id: boundary.id,
                        name: boundary.name
                    })

                    if(boundary.aggregates){
                        Object.values(boundary.aggregates).forEach(aggregate => {
                            let aggregateInfo = {
                                boundedContextId: boundary.id,
                                id: aggregate.id,
                                name: aggregate.name,
                                primaryKeys: []
                            }

                            aggregate.properties.forEach(property => {
                                if(property.isKey) {
                                    primaryKeysSet.add(property.name)
                                    aggregateInfo.primaryKeys.push(property.name)
                                }
                            })

                            preProcessInfos.aggregateInfos.push(aggregateInfo)
                            

                            preProcessInfos.aggregateValueObjectNameDic[aggregate.name] = [aggregate.name]
                            if(aggregate.valueObjects) {
                                aggregate.valueObjects.forEach(valueObject => {
                                    preProcessInfos.aggregateValueObjectNameDic[aggregate.name].push(valueObject.name)

                                    preProcessInfos.valueObjectInfos.push({
                                        boundedContextId: boundary.id,
                                        aggregateId: aggregate.id,
                                        id: valueObject.id,
                                        name: valueObject.name
                                    })
                                    
                                    valueObject.properties.forEach(property => {
                                        if(property.isKey)
                                            primaryKeysSet.add(property.name)
                                    })
                                })
                            }
                            
                            if(aggregate.commands) {
                                aggregate.commands.forEach(command => {
                                    preProcessInfos.commandInfos.push({
                                        boundedContextId: boundary.id,
                                        aggregateId: aggregate.id,
                                        id: command.id,
                                        name: command.name
                                    })
                                })
                            }
                            
                            if(aggregate.events) {
                                aggregate.events.forEach(event => {
                                    preProcessInfos.eventInfos.push({
                                        boundedContextId: boundary.id,
                                        aggregateId: aggregate.id,
                                        id: event.id,
                                        name: event.name
                                    })
                                })
                            }
                        })
                    }
                })
    

                return {
                    primaryKeys: Array.from(primaryKeysSet),
                    ...preProcessInfos
                }
            }

            const getUsableBoundedContextInfos = (modelValue, prevPreprocessInfos) => {
                const currentBoundedContextNames = []
                for(const element of Object.values(modelValue.elements)) {
                    if(element && element._type === "org.uengine.modeling.model.BoundedContext")
                        currentBoundedContextNames.push(element.name)
                }
    
                const usableBoundedContextInfos = []
                for(const boundedContextInfo of prevPreprocessInfos.boundedContextInfos) {
                    if(currentBoundedContextNames.includes(boundedContextInfo.name))
                        usableBoundedContextInfos.push(boundedContextInfo)
                }

                return usableBoundedContextInfos
            }

            const getUsableAggregateInfos = (modelValue, prevPreprocessInfos) => {
                const currentAggregateNames = []
                for(const element of Object.values(modelValue.elements)) {
                    if(element && element._type === "org.uengine.modeling.model.Aggregate")
                        currentAggregateNames.push(element.name)
                }
    
                const usableAggregateInfos = []
                for(const aggregateInfo of prevPreprocessInfos.aggregateInfos) {
                    if(currentAggregateNames.includes(aggregateInfo.name))
                        usableAggregateInfos.push(aggregateInfo)
                }
                
                return usableAggregateInfos
            }

            const getUsableValueObjectInfos = (modelValue, prevPreprocessInfos) => {
                const currentValueObjectNames = []
                for(const element of Object.values(modelValue.elements)) {
                    if(element && element._type === "org.uengine.modeling.model.Aggregate" && 
                       element.aggregateRoot && element.aggregateRoot.entities && element.aggregateRoot.entities.elements
                    ) {
                        for(const entity of Object.values(element.aggregateRoot.entities.elements)) {
                            if(entity && entity._type === "org.uengine.uml.model.vo.Class")
                                currentValueObjectNames.push(entity.name)
                        }
                    }
                }
    
                const usableValueObjectInfos = []
                for(const valueObjectInfo of prevPreprocessInfos.valueObjectInfos) {
                    if(currentValueObjectNames.includes(valueObjectInfo.name))
                        usableValueObjectInfos.push(valueObjectInfo)
                }
                
                return usableValueObjectInfos
            }

            let preProcessInfos = getPreprocessInfos(preprocessModelValue)
            preProcessInfos.usableBoundedContextInfos = getUsableBoundedContextInfos(modelValue, preProcessInfos)
            preProcessInfos.usableAggregateInfos = getUsableAggregateInfos(modelValue, preProcessInfos)
            preProcessInfos.usableValueObjectInfos = getUsableValueObjectInfos(modelValue, preProcessInfos)
            return preProcessInfos
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

        const getClientModelValue = (modelValue, mirrorValue) => {
            const getMirrorElementIds = (modelValue) => {
                let mirrorElementIds = []
                for(const element of Object.values(modelValue.elements))
                    if(element && element.mirrorElement)
                        mirrorElementIds.push(element.mirrorElement)
                return mirrorElementIds
            }
            
            let clientModelValue = {
                elements: {...modelValue.elements},
                relations: {...modelValue.relations}
            }
            let mirrorElementIds = getMirrorElementIds(modelValue)

            for(const element of Object.values(mirrorValue.elements)) {
                if(element && !modelValue.elements[element.id] && !mirrorElementIds.includes(element.id))
                    clientModelValue.elements[element.id] = element
            }

            return clientModelValue
        }

        const checkIsValidBoundedContexts = (preprocessInfos, errorCallback) => {
            if(preprocessInfos.usableBoundedContextInfos.length <= 0) {
                const errorObj = new Error("전달된 트랜잭션과 관련해서 현재 사용가능한 Bounded Context가 존재하지 않습니다. 해당 트랜잭션과 관련된 새로운 Bounded Context를 생성해주세요.")
                errorCallback(errorObj)
                throw errorObj
            }

            const invalidBoundedContextNames = preprocessInfos.usableBoundedContextInfos.filter((info) => info.name && info.name.match(/BoundedContext[\d\.]+/) !== null)
            if(invalidBoundedContextNames.length > 0) {
                const errorObj = new Error(`생성한 Bounded Context가 OrderSerivce, ShippingService와 같이 의미있는 이름을 가지도록 해주세요.: ${invalidBoundedContextNames.map((info) => info.name).join(", ")}`)
                errorCallback(errorObj)
                throw errorObj
            }
        }

        const getGodTableDistributeGuideProperties = (godTableDistributeGuidesPreStep, godTableDistributeGuide, propertyKeys, actionsTypes, alwaysIncludeCommonProperty=true) => {
            let properties = []
            Object.keys(godTableDistributeGuide.tableActions).forEach((tableActionKey) => {
                if(!actionsTypes.includes(godTableDistributeGuide.tableActions[tableActionKey].actionType))
                    return


                const targetTableInfo = godTableDistributeGuidesPreStep.tables.filter((table) => {
                    return table.tableName === tableActionKey
                })[0]

                let tableProperties = []
                if(alwaysIncludeCommonProperty)
                    tableProperties = [godTableDistributeGuidesPreStep.commonProperty, ...targetTableInfo.properties]
                else
                    tableProperties = (targetTableInfo.isMainInfoTable ?  [godTableDistributeGuidesPreStep.commonProperty, ...targetTableInfo.properties] : targetTableInfo.properties)


                let property = {tableName: tableActionKey, properties: tableProperties}

                Object.keys(godTableDistributeGuide.tableActions[tableActionKey].args).forEach((argKey) => {
                    if(propertyKeys.includes(argKey))
                        property[argKey] = godTableDistributeGuide.tableActions[tableActionKey].args[argKey]
                })

                properties.push(property)
            })
            return properties
        }


        const getInputEventStormingSyntaxGuidePrompt = () => {
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

        const getJsonCompressGuidePrompt = () => {
            return `- When returning JSON, please remove all whitespace and return it in a compressed format, as shown in the example below.
# BEFORE
{
    "a": 1,
    "b": 2
}

# AFTER
{"a":1,"b":2}

`
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
                return `You need to interpret the Debezium CDC transaction logs occurring in a specific system's database and list the names of the transmitted event storming objects in order of highest relevance.

Please return only a JSON object in the following format.
{
    "sortedObjectNames": [
        "<objectName1>",
        "<objectName2>"
    ]
}

I will show you an input/output example.
[INPUT]
- Debezium Logs
{"payload":{"before":null,"after":{"order_number":10005,"order_date":19848,"purchaser":1001,"quantity":3,"product_id":104},"source":{"db":"inventory","table":"orders"}}}

- Event Storming Names
bc-customer-management:customer-management, bc-customer-management-command-CreateCustomer:CreateCustomer, bc-order-management:order-management

[OUTPUT]
\`\`\`json
{"sortedObjectNames":["bc-order-management:order-management","bc-customer-management-command-CreateCustomer:CreateCustomer","bc-customer-management:customer-management"]}
\`\`\`

${getJsonCompressGuidePrompt()}

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

        const getSystemPromptForGenerateGodTableDistributeGuidesPreStep = (debeziumLogs, preprocessInfos) => {
            const getSystemPrompt = () => {
                const getFrontGuidePrompt = () => {
                    return `You will receive a list of attributes from a God table of a specific system, and you need to perform the following tasks:

1. Utilize Bounded Context to split a given transaction into multiple tables to fit each problem domain. Follow these guidelines:
   a) Single Responsibility Principle: Each table should represent one clear concept or entity.
   b) Normalization: Separate to minimize data redundancy and maintain data integrity.
   c) Business Logic: Separate to reflect business processes and domain models.
   d) Scalability: Separate considering future changes or expansions
   e) Avoid Excessive Separation: Be cautious as too many tables can increase complexity.
   f) Consider Integration: If a related entity only has an ID reference (e.g., author_id for Author), it may be more reasonable to keep it integrated rather than separating it into a new table (e.g., BookAuthor).

Please follow these rules when writing:
1. The output JSON object must not contain any comments.
2. Common attributes (e.g., ID) should be indicated separately and not included in each table.
3. Create the table name by prefixing given table name.
    ex) given tableName: Customer, tableNames: Customer, CustomerAddress, CustomerOrder
4. When deciding whether to separate or integrate tables, consider the amount and nature of the related data. If only an ID reference exists, integration might be more appropriate than separation.
5. Utilize all attributes provided in the transaction when decomposing tables. Ensure that every attribute from the original transaction is accounted for and properly placed in the resulting table structure.

`   
                }

                const getOutputSyntaxGuidePrompt = () => {
                    return `You should return a JSON object as follows:
\`\`\`json
{   
    // This is a property shared by all tables that have been split from the original properties.
    // If there's no suitable property from the provided list, write "<TableName>_id".
    "commonProperty": "<commonProperty>",

    // This is a list of tables created by dividing the provided properties.
    "tables": [
        {
            "tableName": "<tableName>",
            "properties": ["<property1>", "<property2>"],

            // Indicate whether this table is the primary table containing core information.
            // Set to true for the main table (e.g., CustomerTransaction), and false for related detail tables 
            // (e.g., CustomerTransactionAccount, CustomerTransactionAccountBalance).
            "isMainInfoTable": "<true|false>",
            
            // If some table has immediate consistency requirement with current table, write the table name in this field.
            // Written table should be value object of current table later.
            // Consider adding a table to this list if:
            // 1. Financial impact: Inconsistency could lead to financial losses or errors.
            // 2. Legal and compliance: Immediate consistency is necessary for regulatory compliance.
            // 3. Security implications: Delayed consistency could create security vulnerabilities.
            // 4. Critical user experience: Inconsistency would result in a poor or confusing user experience.
            // 5. Data integrity: The data is critical for maintaining the overall integrity of the system.
            // 6. Business logic dependencies: Other processes rely on this data being immediately consistent.
            // 7. Transactional boundaries: The data must be updated within the same transaction as the current table.
            // Examples: AccountBalance for Account, OrderItems for Order, UserCredentials for UserProfile.
            "immediateConsistencyRequirementTables": [
                {
                    "tableName": "<tableName>",
                    "reason": "<reason>"
                }
            ]
        }
    ]
}
\`\`\`

`
                }

                const getExamplePrompt = () => {
                    return `I will show you an input/output example.
[INPUT]
- Bounded Context Names
BankingService

- Table Name
CustomerTransaction

- Attributes
accountId, accountNumber, accountType, transactionId, amount, transactionType, timestamp, balance, lastUpdated

[OUTPUT]
\`\`\`json
{"commonProperty":"transactionId","tables":[{"tableName":"CustomerTransactionAccount","isMainInfoTable":false,"properties":["accountId","accountNumber","accountType"],"immediateConsistencyRequirementTables":[{"tableName":"CustomerTransactionAccountBalance","reason":"Account balance needs to be immediately consistent with the account to ensure accurate financial reporting and prevent overdrafts."}]},{"tableName":"CustomerTransaction","isMainInfoTable":true,"properties":["amount","transactionType","timestamp"]},{"tableName":"CustomerTransactionAccountBalance","isMainInfoTable":false,"properties":["balance","lastUpdated"]}]}
\`\`\`

[INPUT]
- Bounded Context Names
ProductCatalogService

- Table Name
Product

- Attributes
productId, name, description, price, categoryId, categoryName, stockQuantity, supplierId, supplierName, supplierContact, createdAt, updatedAt, isActive

[OUTPUT]
\`\`\`json
{"commonProperty":"productId","tables":[{"tableName":"Product","properties":["name","description","price","createdAt","updatedAt","isActive"],"isMainInfoTable":true,"immediateConsistencyRequirementTables":[{"tableName":"ProductInventory","reason":"Stock quantity needs to be immediately consistent with the product to prevent overselling and ensure accurate inventory management."}]},{"tableName":"ProductCategory","properties":["categoryId","categoryName"],"isMainInfoTable":false},{"tableName":"ProductInventory","properties":["stockQuantity"],"isMainInfoTable":false},{"tableName":"ProductSupplier","properties":["supplierId","supplierName","supplierContact"],"isMainInfoTable":false}]}
\`\`\`

[INPUT]
- Bounded Context Names
OrderService

- Table Name
Order

- Attributes
orderId, customerId, orderDate, totalAmount, status, paymentMethod

[OUTPUT]
\`\`\`json
{"commonProperty":"orderId","tables":[{"tableName":"Order","properties":["customerId","orderDate","totalAmount","status","paymentMethod"],"isMainInfoTable":true}]}
\`\`\`

`
                }
                
                return getFrontGuidePrompt() +
                       getOutputSyntaxGuidePrompt() +
                       getExamplePrompt() +
                       getJsonCompressGuidePrompt()
            }

            const getUserPrompt = (debeziumLogs, preprocessInfos) => {
                const getDebeziumMetadatas = (debeziumLogs) => {
                    const getDebeziumLogInfo = (debeziumLogs) => {
                        const getDebeziumLogStringList = (logs) => {
                            return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
                        }

                        const debeziumLogStringList = getDebeziumLogStringList(debeziumLogs)
                        if(debeziumLogStringList === null || 
                            debeziumLogStringList.length <= 0
                        ) return null

                        return JSON.parse(debeziumLogStringList[0])    
                    }

                    const getDebeziumFields = (debeziumLogInfo) => {
                        let debeziumFieldsSet = new Set()
                        if(debeziumLogInfo.payload.before) {
                            for(const field of Object.keys(debeziumLogInfo.payload.before))
                                debeziumFieldsSet.add(field)
                        }
                        if(debeziumLogInfo.payload.after) {
                            for(const field of Object.keys(debeziumLogInfo.payload.after))
                                debeziumFieldsSet.add(field)
                        }
                        return Array.from(debeziumFieldsSet)
                    }

                    const debeziumMetadatas = {tableName: "", fields: []}

                    const debeziumLogInfo = getDebeziumLogInfo(debeziumLogs)
                    if(debeziumLogInfo === null) return debeziumMetadatas

                    debeziumMetadatas.fields = getDebeziumFields(debeziumLogInfo)
                    debeziumMetadatas.tableName = debeziumLogInfo.payload.source.table
                    return debeziumMetadatas
                }

                const debeziumMetadatas = getDebeziumMetadatas(debeziumLogs)

                return `Now let's process the user's input.
[INPUT]
- Bounded Context Names
${preprocessInfos.usableBoundedContextInfos.map((usableBoundedContextInfo) => {
    return usableBoundedContextInfo.name
}).join(", ")}

- Table Name
${debeziumMetadatas.tableName.replace("TB_", "").replace("Table_", "").replace("Table", "")}

- Attributes
${debeziumMetadatas.fields.join(", ")}

[OUTPUT]
\`\`\`json

`
            }

            return getSystemPrompt() + getUserPrompt(debeziumLogs, preprocessInfos)
        }

        const getSystemPromptForGodTableDistributeGuides = (preprocessModelValueString, preprocessInfos, godTableDistributeGuidesPreStep) => {
            const getSystemPrompt = () => {
                const getFrontGuidePrompt = () => {
                    return `You will receive a list of tables that is already divided from god table of a specific system, and you need to perform the following tasks:

1. For each divided table, perform one of four actions (UseExistingAggregateId, UseExistingValueObjectId, CreateNewAggregate, CreateNewValueObject):

1-1. If a related table is already defined in the existing event storming model, you can perform UseExistingAggregateId or UseExistingValueObjectId action. Consider the following:
    a) If it makes sense to reuse the attribute in its current context, use UseExistingAggregateId or UseExistingValueObjectId action.
    b) If the attribute would be more appropriate in a new context or if its meaning changes significantly, create it using CreateNewAggregate or CreateNewValueObject action.
    c) Use your judgment to determine whether reusing or creating a new attribute would better serve the domain model and maintain clear boundaries between different contexts.

1-2. If you need to create a new Aggregate or ValueObject, perform CreateNewAggregate or CreateNewValueObject action. Consider the following:
    a) Identifying Aggregate Roots:
        - Choose entities with independent lifecycles as Aggregate Roots.
        - Consider entities directly referenced by other entities as Aggregate Roots.
        - Select representatives of entity groups that must maintain consistency of business rules as Aggregate Roots.

    b) Identifying Value Objects:
        - Model groups of attributes that form a conceptual whole as Value Objects.
        - Consider objects with immutability as Value Objects.
        - Model objects without identifiers and compared by equality as Value Objects.

    c) Composing Aggregates:
        - Group related entities and Value Objects around the Aggregate Root.
        - Design so that all objects within an Aggregate always maintain a consistent state.
        - Ensure references between Aggregates are made only through IDs.

    d) Considerations:
        - Be cautious of overly large Aggregates as they can cause performance issues.
        - Set Aggregate boundaries considering concurrency issues.
        - Design flexible models considering the possibility of changing business requirements.

2. When deciding between creating a new Aggregate or a ValueObject within an existing Aggregate, consider the following:
    a) Tight Coupling: If an entity is business-critical and cannot afford to have data inconsistencies with its parent entity, even for a moment, it should be modeled as a ValueObject within the parent Aggregate.

    b) Independent Lifecycle: If an entity has an independent lifecycle or can exist without the parent entity, it may be better modeled as a separate Aggregate.

    c) Scalability and Performance: Consider whether the entity needs to be managed and scaled independently from its parent. If so, it might be better as a separate Aggregate.

    d) Consistency Requirements: If immediate consistency is required between the entity and its parent, it should be a ValueObject. If eventual consistency is acceptable, it can be a separate Aggregate.

3. If it's ambiguous which action should be taken for a table, list multiple possible actions in possibleActions so that the user can choose from them.

Please follow these rules when writing:
1. The output JSON object must not contain any comments.
2. tableActions attribute should contain all defined table names.
3. Always follow additional requests.

`   
                }

                const getOutputSyntaxGuidePrompt = () => {
                    return `You should return a JSON object as follows:
\`\`\`json
{   
    // This is a list of possible actions that can be taken for the table.
    // If multiple possible cases exist, you need to write them all.
    "possibleActions": [
        {
            "description": "<description>", // Describe your action with arguments. This will be viewed as possible options for user.
            "isRecommended": "<true|false>", // Only one possibleActions item can to be true.
            "isRecommendedReason": "<isRecommendedReason>", // You need to write reason why you setted isRecommended to true or false.

            // This is a list of actions that can be taken for tables of Distributed Table Information.
            // You should define all tableActions for each table.
            "tableActions": {
                "<tableName>": {
                    "actionType": "<UseExistingAggregateId|UseExistingValueObjectId|CreateNewAggregate|CreateNewValueObject>",
                    "args": {
                        "<property>": "<value>"
                    } // Arguments for actiontype. It can be different for each actionType.
                }
            }
        }
    ]
}
\`\`\`

Arguments for each actionType:

UseExistingAggregateId:
{
    "existingBoundedContextId": "<existingBoundedContextId>", // Bounded Context Id from existing event storming model.
    "existingAggregateId": "<existingAggregateId>" // Aggregate Id from existing event storming model.
}

UseExistingValueObjectId:
{
    "existingBoundedContextId": "<existingBoundedContextId>", // Bounded Context Id from existing event storming model.
    "existingValueObjectId": "<existingValueObjectId>" // valueObject Id from existing event storming model.
}

CreateNewAggregate:
{
    "existingBoundedContextId": "<existingBoundedContextId>", // Bounded Context Id from existing event storming model.
    "newAggregateId": "<newAggregateId>", // Must not exist in an existing Aggregate, and must be defined as something like 'agg-<Name>'.
    "newAggregateName": "<newAggregateName>" // unique aggregate name like 'Order' or 'Customer'.
}

CreateNewValueObject:
{
    "existingBoundedContextId": "<existingBoundedContextId>", // Bounded Context Id from existing event storming model.
    "existingAggregateId": "<existingAggregateId>", // Aggregate Id from existing event storming model.
    "newValueObjectId": "<newValueObjectId>", // Must not exist in an existing ValueObject, and must be defined as something like 'vo-<Name>'.
    "newValueObjectName": "<newValueObjectName>" // unique valueObject name like 'Address' or 'CustomerInfo'.
}

`
                }

                const getExamplePrompt = () => {
                    return `I will show you an input/output example.
[INPUT]
- Event Storming Information
{"bc-banking":{"id":"bc-banking","name":"Banking","aggregates":{"agg-account":{"id":"agg-account","name":"Account","properties":[{"name":"accountId","type":"String","isKey":true},{"name":"accountNumber","type":"String"},{"name":"accountType","type":"AccountType"}],"enumerations":[{"id":"enum-account-type","name":"AccountType","items":["CHECKING","SAVINGS","INVESTMENT"]}]}}}}

- Distributed Table Information
{"commonProperty":"accountId","tables":[{"tableName":"Account","properties":["accountNumber","accountType"],"immediateConsistencyRequirementTables":[{"tableName":"AccountBalance","reason":"Account balance needs to be immediately consistent with the account to ensure accurate financial reporting and prevent overdrafts."}]},{"tableName":"Transaction","properties":["transactionId","amount","transactionType","timestamp"]},{"tableName":"AccountBalance","properties":["balance","lastUpdated"]}]}

[OUTPUT]
\`\`\`json
{"possibleActions":[{"description":"Model Account as an Aggregate, Transaction as a separate Aggregate, and AccountBalance as a ValueObject within the Account Aggregate","isRecommended":true,"isRecommendedReason":"This approach balances data consistency with scalability. AccountBalance is tightly coupled with Account and requires immediate consistency, while Transaction can be managed independently.","tableActions":{"Account":{"actionType":"UseExistingAggregateId","args":{"existingBoundedContextId":"bc-banking","existingAggregateId":"agg-account"}},"Transaction":{"actionType":"CreateNewAggregate","args":{"existingBoundedContextId":"bc-banking","newAggregateId":"agg-transaction","newAggregateName":"Transaction"}},"AccountBalance":{"actionType":"CreateNewValueObject","args":{"existingBoundedContextId":"bc-banking","existingAggregateId":"agg-account","newValueObjectId":"vo-account-balance","newValueObjectName":"AccountBalance"}}}},{"description":"Model Account as an Aggregate, with both Transaction and AccountBalance as ValueObjects within the Account Aggregate","isRecommended":false,"isRecommendedReason":"While this ensures strong consistency, it may limit scalability for high-volume transaction processing.","tableActions":{"Account":{"actionType":"UseExistingAggregateId","args":{"existingBoundedContextId":"bc-banking","existingAggregateId":"agg-account"}},"Transaction":{"actionType":"CreateNewValueObject","args":{"existingBoundedContextId":"bc-banking","existingAggregateId":"agg-account","newValueObjectId":"vo-transaction","newValueObjectName":"Transaction"}},"AccountBalance":{"actionType":"CreateNewValueObject","args":{"existingBoundedContextId":"bc-banking","existingAggregateId":"agg-account","newValueObjectId":"vo-account-balance","newValueObjectName":"AccountBalance"}}}}]}
\`\`\`

`
                }
                
                return getFrontGuidePrompt() +
                       getInputEventStormingSyntaxGuidePrompt() +
                       getOutputSyntaxGuidePrompt() +
                       getExamplePrompt() +
                       getJsonCompressGuidePrompt()
            }

            const getUserPrompt = (preprocessModelValueString, preprocessInfos, godTableDistributeGuidesPreStep) => {
                const getExistingGuides = (preprocessInfos) => {
                    let existingGuides = {
                        boundedContextInfoIds: "",
                        aggregateInfoIds: "You can not use UseExistingAggregateId actionType because there is no usable existingAggregateId. Instead, you can use CreateNewAggregate actionType.",
                        valueObjectInfoIds: "You can not use UseExistingValueObjectId actionType because there is no usable existingValueObjectId. Instead, you can use CreateNewValueObject actionType.",
                        usableBoundedContextInfoIds: "",
                        usableAggregateInfoIds: ""
                    }

                    if(preprocessInfos.boundedContextInfos && preprocessInfos.boundedContextInfos.length > 0) {
                        const boundedContextInfoIds = preprocessInfos.boundedContextInfos.map((boundedContextInfo) => {
                            return boundedContextInfo.id
                        })

                        existingGuides.boundedContextInfoIds = "The value of existingBoundedContextId in UseExistingAggregateId or UseExistingValueObjectId actionType must be one of the following values.: " + boundedContextInfoIds.join(", ")
                    }

                    if(preprocessInfos.aggregateInfos && preprocessInfos.aggregateInfos.length > 0) {
                        const aggregateInfoIds = preprocessInfos.aggregateInfos.map((aggregateInfo) => {
                            return aggregateInfo.id
                        })

                        existingGuides.aggregateInfoIds = "The value of existingAggregateId in UseExistingAggregateId actionType must be one of the following values.: " + aggregateInfoIds.join(", ")
                    }

                    if(preprocessInfos.valueObjectInfos && preprocessInfos.valueObjectInfos.length > 0) {
                        const valueObjectInfoIds = preprocessInfos.valueObjectInfos.map((valueObjectInfo) => {
                            return valueObjectInfo.id
                        })

                        existingGuides.existingValueObjectId = "The value of existingValueObjectId in UseExistingValueObjectId actionType must be one of the following values.: " + valueObjectInfoIds.join(", ")
                    }


                    if(preprocessInfos.usableBoundedContextInfos && preprocessInfos.usableBoundedContextInfos.length > 0) {
                        const usableBoundedContextInfoIds = preprocessInfos.usableBoundedContextInfos.map((usableBoundedContextInfo) => {
                            return usableBoundedContextInfo.id
                        })

                        existingGuides.usableBoundedContextInfoIds = "The value of existingBoundedContextId in CreateNewAggregate or CreateNewValueObject actionType must be one of the following values.: " + usableBoundedContextInfoIds.join(", ")
                    }

                    if(preprocessInfos.usableAggregateInfos && preprocessInfos.usableAggregateInfos.length > 0) {
                        const usableAggregateInfoIds = preprocessInfos.usableAggregateInfos.map((usableAggregateInfo) => {
                            return usableAggregateInfo.id
                        })

                        existingGuides.usableAggregateInfoIds = "The value of existingAggregateId in CreateNewValueObject actionType must be one of the following values.: " + usableAggregateInfoIds.join(", ")
                    }


                    return existingGuides
                }
                const existingGuides = getExistingGuides(preprocessInfos)

                return `Now let's process the user's input.
[INPUT]
- Event Storming Information
${preprocessModelValueString}

- Distributed Table Information
${JSON.stringify(godTableDistributeGuidesPreStep)}

- Additional requests
${existingGuides.boundedContextInfoIds}
${existingGuides.aggregateInfoIds}
${existingGuides.valueObjectInfoIds}
${existingGuides.usableBoundedContextInfoIds}
${existingGuides.usableAggregateInfoIds}

[OUTPUT]
\`\`\`json
`
            }

            return getSystemPrompt() + getUserPrompt(preprocessModelValueString, preprocessInfos, godTableDistributeGuidesPreStep)
        }

        const getSystemPromptForGenerateEventCommandRelationGuides = (preprocessModelValueString, debeziumLogs, preprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
            const getSystemPrompt = () => {
                const getFrontGuidePrompt = () => {
                    return `You need to interpret the Debezium CDC transaction logs from a specific system's database and derive the following.
1. Generate new event or command names that can be added to event storming based on the given transaction logs.
2. Determine if the generated events can trigger other commands.
3. Determine if the generated commands can trigger other events.

Please follow these rules.
1. The output JSON object must not contain any comments.
2. Do not create separate entries if related events or commands already exist.
3. Always follow additional requests.

`   
                }

                const getOutputSyntaxGuidePrompt = () => {
                    return `You should return a JSON object as follows.
\`\`\`json
{
    // Extract and create new events from use cases in the Debezium Log that are not present in the existing event storming model.
    "newEvents": [
        {
            "aggregateId": "<aggregateId>", // Write the Id of an Aggregate Root that exists in the current event storming.
            "eventId": "<eventId>", // Write a unique event Id starting with "evt-".
            "eventName": "<eventName>",
            "outputCommands": [{
                "id": "<commandId>", // If this event needs to call another command, write the Id of that command.
                "reason": "<reason>" // rite the reason why this event needs to call another command.
            }]
        }
    ],

    "newCommands": [
        {
            "aggregateId": "<aggregateId>", // Write the Id of an Aggregate Root that exists in the current event storming.
            "commandId": "<commandId>", // Write a unique command Id starting with "cmd-".
            "commandName": "<commandName>",
            "outputEvents": [{
                "id": "<eventId>" // If this command needs to call another event, write the Id of that event. If the event doesn't exist in the given event storming model, it must be added to newEvents.
            }]
        }
    ],

    // If existing events need to call newly created commands, write them here.
    "newRelations": [
        {
            "fromEventId": "<fromEventId>",
            "toCommandId": "<toCommandId>",
            "reason": "<reason>" // Write the reason why an existing event needs to call another command.
        }
    ]
}
\`\`\`

`
                }

                const getExamplePrompt = () => {
                    return `I'll show you an example.
The following example has three Bounded Contexts: Order, Shipping, and Payment. Shipping and Payment have Order's id, so we can see that they reference it. We receive a transaction log that generates Order content, create related commands and events called by those commands, and since Shipping and Payment have additional information about the Order, we can see that related command IDs are added to outputCommands to add them sequentially when additional requests are made to Order.
[INPUT]
- Existing event storming model object
{"bc-order":{"id":"bc-order","name":"OrderService","actors":[],"aggregates":{"agg-order":{"id":"agg-order","name":"Order","properties":[{"name":"order_id","type":"Long","isKey":true},{"name":"customer_id","type":"Long"},{"name":"order_date"},{"name":"total_amount","type":"Double"},{"name":"status"}],"enumerations":[],"valueObjects":[],"commands":[],"events":[]}}},"bc-shipping":{"id":"bc-shipping","name":"ShippingService","actors":[],"aggregates":{"agg-shipping":{"id":"agg-shipping","name":"Shipping","properties":[{"name":"order_id","type":"Long","isKey":true},{"name":"shipping_id","type":"Long"},{"name":"shipping_method"},{"name":"tracking_number"},{"name":"estimated_delivery_date"}],"enumerations":[],"valueObjects":[],"commands":[{"id":"cmd-create-shipping","name":"CreateShipping","api_verb":"POST","outputEvents":[{"relationId":"rl-to-shipping-created","id":"evt-shipping-created","name":"ShippingCreated"}]}],"events":[{"id":"evt-shipping-created","name":"ShippingCreated"}]}}},"bc-payment":{"id":"bc-payment","name":"PaymentService","actors":[],"aggregates":{"agg-payment":{"id":"agg-payment","name":"Payment","properties":[{"name":"order_id","type":"Long","isKey":true},{"name":"payment_id","type":"Long"},{"name":"payment_method"},{"name":"payment_date"},{"name":"payment_status"}],"enumerations":[],"valueObjects":[],"commands":[{"id":"cmd-create-payment","name":"CreatePayment","api_verb":"POST","outputEvents":[{"relationId":"rl-to-payment-created","id":"evt-payment-created","name":"PaymentCreated"}]}],"events":[{"id":"evt-payment-created","name":"PaymentCreated"}]}}}}

- Debezium transaction log
{"payload":{"before":null,"after":{"order_id":1001,"customer_id":5001,"order_date":"2023-04-15T10:30:00Z","total_amount":"150.75","status":"PROCESSING"},"source":"Inventory","table":"order"}}

[OUTPUT]
\`\`\`json
{"newEvents":[{"aggregateId":"agg-order","eventId":"evt-order-created","eventName":"OrderCreated","outputCommands":[{"id":"cmd-create-shipping","reason":"When an order is created, shipping information must be created"},{"id":"cmd-create-payment","reason":"When an order is created, payment information must be created"}]}],"newCommands":[{"aggregateId":"agg-order","commandId":"cmd-create-order","commandName":"CreateOrder","outputEvents":[{"id":"evt-order-created"}]}],"newRelations":[]}
\`\`\`

I'll show you another example.
The following example has three Bounded Contexts: Customer, Order, and Preference. Preference has Customer's id, so it can be updated sequentially when Customer is updated. Also, Customer has order_count, so when the existing OrderCreated event occurs and an Order is added, Customer's order_count can be increased by adding the related relationship to newRelations.
[INPUT]
- Existing event storming model object
{"bc-customer":{"id":"bc-customer","name":"CustomerService","actors":[],"aggregates":{"agg-customer":{"id":"agg-customer","name":"Customer","properties":[{"name":"id","type":"long","isKey":true},{"name":"name"},{"name":"order_count","type":"long"}],"enumerations":[],"valueObjects":[],"commands":[],"events":[]}}},"bc-order":{"id":"bc-order","name":"OrderService","actors":[],"aggregates":{"agg-order":{"id":"agg-order","name":"Order","properties":[{"name":"id","type":"long","isKey":true},{"name":"product_id","type":"long"},{"name":"qty","type":"long"}],"enumerations":[],"valueObjects":[],"commands":[{"id":"cmd-create-order","name":"CreateOrder","api_verb":"POST","outputEvents":[{"relationId":"rl-to-order-created","id":"evt-order-created","name":"OrderCreated"}]}],"events":[{"id":"evt-order-created","name":"OrderCreated"}]}}},"bc-preference":{"id":"bc-preference","name":"PreferenceService","actors":[],"aggregates":{"agg-preference":{"id":"agg-preference","name":"Preference","properties":[{"name":"customer_id","type":"long","isKey":true},{"name":"preference"}],"enumerations":[],"valueObjects":[],"commands":[{"id":"cmd-update-preference","name":"UpdatePreference","api_verb":"POST","outputEvents":[{"relationId":"rl-to-preference-updated","id":"evt-preference-updated","name":"PreferenceUpdated"}]}],"events":[{"id":"evt-preference-updated","name":"PreferenceUpdated"}]}}}}

- Debezium transaction log
{"payload":{"before":{"id":5001,"first_name":"John Doe","orderCount":5},"after":{"id":5001,"first_name":"John Doe","orderCount":6}}}

[OUTPUT]
\`\`\`json
{"newEvents":[{"aggregateId":"agg-customer","eventId":"evt-customer-updated","eventName":"CustomerUpdated","outputCommands":[{"id":"cmd-update-preference","reason":"When an customer is updated, preference information must be updated"}]}],"newCommands":[{"aggregateId":"agg-customer","commandId":"cmd-update-customer","commandName":"UpdateCustomer","outputEvents":[{"id":"evt-customer-updated"}]}],"newRelations":[{"fromEventId":"evt-order-created","toCommandId":"cmd-update-customer","reason":"When order is created, the order_count property in customer must be updated"}]}
\`\`\`

`
                }
                
                return getFrontGuidePrompt() +
                       getInputEventStormingSyntaxGuidePrompt() +
                       getOutputSyntaxGuidePrompt() +
                       getExamplePrompt() +
                       getJsonCompressGuidePrompt()
            }

            const getUserPrompt = (preprocessModelValueString, debeziumLogs, preprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                const getGodTableDistributeGuideObj = (preprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                    const getNewAggregateRootsGuide = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                        let godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["newAggregateName", "newAggregateId"], ["CreateNewAggregate"], true)
                        if(godGuideProperties.length <= 0) return ""

                        const guide = godGuideProperties.map((newAggregateIdInfo) => {
                            return {
                                "id": newAggregateIdInfo.newAggregateId,
                                "name": newAggregateIdInfo.newAggregateName,
                                "properties": newAggregateIdInfo.properties
                            }
                        })

                        return `The following Aggregates will be newly added. Please generate new events and commands for these.: ${JSON.stringify(guide)}`
                    }

                    const getExistingAggregateRootsGuide = (godTableDistributeGuidesPreStep, godTableDistributeGuide, preprocessInfos) => {
                        let godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["existingAggregateId"], ["UseExistingAggregateId"])
                        if(godGuideProperties.length <= 0) return ""

                        const guide = godGuideProperties
                            .filter((newAggregateIdInfo) => preprocessInfos.usableAggregateInfos.some((usableAggregateInfo) =>  usableAggregateInfo.id === newAggregateIdInfo.existingAggregateId))
                            .map((newAggregateIdInfo) => {
                                return {
                                    "id": newAggregateIdInfo.existingAggregateId
                            }
                        })
                        if(guide.length <= 0) return ""

                        return `Please generate events and commands related to the transaction logs passed to the following Aggregate Roots.: ${JSON.stringify(guide)}`
                    }

                    const getTableChainGuide = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                        const godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["newAggregateId", "existingAggregateId"], ["UseExistingAggregateId", "CreateNewAggregate"])
                        if(godGuideProperties.length <= 0) return ""

                        const allAggregateIds = new Set()
                        godGuideProperties.forEach((newAggregateIdInfo) => {
                            if(newAggregateIdInfo.newAggregateId)
                                allAggregateIds.add(newAggregateIdInfo.newAggregateId)
                            if(newAggregateIdInfo.existingAggregateId)
                                allAggregateIds.add(newAggregateIdInfo.existingAggregateId)
                        })
                        if(allAggregateIds.size <= 0) return ""

                        return `Please add to the outputCommands property in the ${godTableDistributeGuidesPreStep.commonProperty.replace("_id", "").replace("Id", "").replace("Id", "")} related events to call commands with different ${godTableDistributeGuidesPreStep.commonProperty} properties, as in the previous example, so that creation or updates occur in a chain.`
                    }

                    const getUsableAggregateIdGuide = (preprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                        const godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["newAggregateId", "existingAggregateId"], ["UseExistingAggregateId", "CreateNewAggregate"])

                        let usableAggregateIds = new Set()

                        for(const usableAggregateInfo of preprocessInfos.usableAggregateInfos)
                            usableAggregateIds.add(usableAggregateInfo.id)
    
                        for(const godGuideProperty of godGuideProperties) {
                            if(godGuideProperty.newAggregateId)
                                usableAggregateIds.add(godGuideProperty.newAggregateId)
                            if(godGuideProperty.existingAggregateId && preprocessInfos.usableAggregateInfos.some((usableAggregateInfo) => usableAggregateInfo.id === godGuideProperty.existingAggregateId))
                                usableAggregateIds.add(godGuideProperty.existingAggregateId)
                        }
    
                        if(usableAggregateIds.size <= 0)
                            return ""
    
                        return "The value of aggregateId must be one of the following values.: " + Array.from(usableAggregateIds).join(", ")
                    }


                    return {
                        newAggregateRootsGuide: getNewAggregateRootsGuide(godTableDistributeGuidesPreStep, godTableDistributeGuide),
                        existingAggregateRootsGuide: getExistingAggregateRootsGuide(godTableDistributeGuidesPreStep, godTableDistributeGuide, preprocessInfos),
                        tableChainGuide: getTableChainGuide(godTableDistributeGuidesPreStep, godTableDistributeGuide),
                        usableAggregateIdGuide: getUsableAggregateIdGuide(preprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide)
                    }
                }
                
                const getDebeziumOpGuides = (debeziumLogs) => {
                    const getDebeziumLogStringList = (logs) => {
                        return logs.match(/\{"schema":\{.*?"name":".*?\.Envelope".*?\},"payload":\{.*?\}\}/g)
                    }
                
                    const debeziumLogStringList = getDebeziumLogStringList(debeziumLogs)
                    if(debeziumLogStringList.length <= 0) return ""

                    const op = JSON.parse(debeziumLogStringList[0]).payload.op
                    if(op === "c")
                        return "The transmitted transaction log is creating a new property. Check if there's a related Create event or command, and if not, please create one."
                    else if(op === "u")
                        return "The transmitted transaction log is updating the given property. Check if there's a related Update event or command, and if not, please create one."
                    else if(op === "d")
                        return "The transmitted transaction log is deleting the given property. Check if there's a related Delete event or command, and if not, please create one."
                    return ""
                }

                const godTableDistributeGuideObj = getGodTableDistributeGuideObj(preprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide)

                return `Now let's process the user's input.
[INPUT]
- Existing event storming model object
${preprocessModelValueString}

- Debezium transaction log
${getSummarizedDebeziumLogStrings(debeziumLogs)}

- Additional requests
${godTableDistributeGuideObj.newAggregateRootsGuide}
${godTableDistributeGuideObj.existingAggregateRootsGuide}
${godTableDistributeGuideObj.tableChainGuide}
${godTableDistributeGuideObj.usableAggregateIdGuide}
${getDebeziumOpGuides(debeziumLogs)}
A command must always have an event related to its execution. For example, when adding a CreateOrder command, you should add an OrderCreated event to newEvents and make it so that this event is called.

[OUTPUT]
\`\`\`json
`
            }

            return getSystemPrompt() + getUserPrompt(preprocessModelValueString, debeziumLogs, preprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide)
        }

        const getSystemPromptForGenerateCommands = (preprocessModelValueString, debeziumLogs, prevPreprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide, eventCommandRelationGuides) => {
            const getSystemPrompt = () => {
                const getFrontGuidePrompt = () => {
                    return `You need to interpret the Debezium CDC transaction logs occurring in a specific system's database and write queries containing actions to modify the given event storming model.
You should find use cases in the Debezium CDC transaction logs that are not reflected in the existing event model and write queries containing actions to reflect them in the event storming model.

Please follow these rules.
1. Generate modifications only for the attributes and Bounded Contexts found in the provided Debezium CDC transactions. Do not speculate additional attributes.
2. Each Bounded Context can interact with each other. When an event occurs in a specific Bounded Context, that event can call commands in other Bounded Contexts.
3. Do not write comments in the output JSON object.
4. Attributes other than the basic data types provided by Java or Address, Portrait, Rating, Money, Email should be directly defined as enumerations or valueObjects.
5. Ignore transactions that are not directly related to business logic, such as event.block or hibernate_sequence.
6. The id attribute must be unique and should not be modified.
7. Write the name of the Bounded Context as '<Name of the Aggregate that will belong to the Bounded Context> + Service'.
8. If the attributes and use cases of the transaction are different, create a new related Aggregate. Do not overwrite the existing Aggregate.
9. Always follow additional requests.

`
                }
    
                const getOutputSyntaxGuidePrompt = () => {
                    return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    // First, based on the contents of the Debezium transaction logs, you should write the id and description for each transaction.
    // The order should match the sequence of the provided transaction logs.
    "transactions": [
        {
            "id": "<transactionId>",
            "description": "<transactionDescription>",

            // You should list all fields written in the payload of the corresponding transaction.
            // Even if they are numbered like etc1, etc2, do not merge them; list them all.
            "properties": [
                {
                    "name": "<propertyName>",
                    ["type": "<propertyType>"], // If the type is String, do not specify the type.
                    ["isKey": true], // Write this only if there is a primary key.
                    ["isForeignProperty": true] // Write this only if there is a foreign key.
                }
            ]
        }
    ],

    // Based on the defined transactions above, you should identify and write as many use cases as possible that are not reflected in the existing event modeling from the Debezium logs.
    // For example, if there is a transaction related to adding a product that is not in the event storming information given in the transactions above, write the transaction id and the use case.
    "usecases": [
        {
            // Write which transaction id this use case is related to.
            // The properties declared in the transaction written here will be used in this use case.
            "relatedTransactionId": "<transactionId>",

            "id": "<usecaseId>",
            "name": "<usecaseName>",
            "displayName": "<usecaseAlias>",
            "actor": "<actorName>", // Write the name of the actor related to this use case.

            // Pre-write the IDs of the queries to be performed for this use case.
            // All these query IDs must be implemented in the queries section later.
            "relatedAggregateQueryIds": ["<queryId>"], 
            "relatedEnumerationQueryIds": ["<queryId>"], // If an enumeration object is declared in the given Aggregate, add a query to add specific information about the enumeration object.

            // If a ValueObject object is declared in the given Aggregate, add a query to add specific information about the ValueObject object.
            // Or, if a specific table references the given Aggregate as a foreign key, you can add the transaction table to the ValueObject instead of the Aggregate if you judge the business criticality of data inconsistency to be fatal.
            "relatedValueObjectQueryIds": ["<queryId>"],  

            "relatedCommandQueryIds": ["<queryId>"], // The ID of the command-related query using this use case
            "relatedEventQueryIds": ["<queryId>"] // The ID of the event-related query using this use case
        }
    ],

    // Write the queries to reflect the contents of the use case presented above here.
    "queries": [
        {
            // Write which use case this query is to reflect.
            "fromUsecaseId": "<usecaseId>",

            // This is a unique ID to identify this query.
            "queryId": "<queryId>",

            // This attribute indicates what type of object information is being modified.
            // Choose one from Aggregate, Enumeration, ValueObject, Command, Event.
            "objectType": "<objectType>",

            // This attribute indicates the action to be performed.
            // Currently, only update can be written in action.
            "action": "update",

            // This attribute contains the ID information of the object on which the action is performed.
            "ids": {
                "<idName>": "<idValue>"
            },

            // This attribute contains the parameters required for the action.
            "args": {
                "<argName>": "<argValue>"
            }
        }
    ]
}
\`\`\`

The rules for each action are as follows.
- update action
    When creating a new one, all attributes listed in ids and args must be written.
    When modifying, the ids of the target to be modified must be written, and only the attributes to be changed should be written in args.
    In the case of properties, only the object containing the name attribute to be changed should be written.
    If that name does not exist, it will be newly created, otherwise, it will modify the existing attribute.

I will explain the ids and args used in each objectType.
You cannot use any arbitrary parameters not described in this explanation in ids or args.

# objectType: Aggregate
- Description
Debezium transaction logs contain actions for a specific table.

- Return format
{
    "objectType": "Aggregate",
    "action": "update",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>"
    },
    "args": {
        "aggregateName": "<aggregateName>",

        // Please list as many attributes used in the transaction as possible.
        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ]
    }
}

# objectType: Enumeration
- Description
An object containing enumeration information that can be used in an Aggregate.
If there is no appropriate Aggregate that this Enumeration can belong to, it must be newly created through a query.

- Return format
{
    "objectType": "Enumeration",
    "action": "update",
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
- Description
An object containing ValueObject information that can be used in an Aggregate.
If there is no appropriate Aggregate that this ValueObject can belong to, it must be newly created through a query.

- Return format
{
    "objectType": "ValueObject",
    "action": "update",
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
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true], // Write only if there is a primary key.
                ["isForeignProperty": true] // Whether it is a foreign key. Write only if this attribute references another table's attribute.
            }
        ],
    }
}

# objectType: Command
- Description
An object containing information about the command executed by the given transaction.
If there is no appropriate Aggregate that this command can belong to, it must be newly created through a query.

- Return format
{
    "objectType": "Command",
    "action": "update",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "commandId": "<commandId>"
    },
    "args": {
        "commandName": "<commandName>",
        "api_verb": <"POST" | "DELETE" | "PUT">,
        "outputEventIds": ["<outputEventId>"], // List of event IDs generated by this command. Must write existing event IDs.
        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, system, etc.
    }
}

# objectType: Event
- Description
An object containing information about events generated by a specific command or policy.
If there is no appropriate Aggregate that this event can belong to, it must be newly created through a query.

- Return format
{
    "objectType": "Event",
    "action": "update",
    "ids": {
        "boundedContextId": "<boundedContextId>",
        "aggregateId": "<aggregateId>",
        "eventId": "<eventId>"
    },
    "args": {
        "eventName": "<eventName>",

        // Specific events can call commands within other BoundedContexts to change states.
        // Examples of such call information are as follows.
        // 1. If the patient's preference information has changed and there is an updated latest date of the patient's preference information in the patient information, it should be written to reflect this.
        // 2. If the quantity of ordered products has changed and there is information related to the total quantity of ordered products in the order product information, it should be written to reflect this.
        // 3. If a customer has purchased a new product with points and there are remaining points in the customer information, the points should be reduced to reflect this.
        // Notes are as follows.
        // 1. Do not call a command to change the primary key. The primary key is an unchanging attribute.
        // 2. Specify which attribute is being changed by calling the command.
        "outputCommandIds": [{
            "commandId": "<outputCommandId>", // The ID of the command being called. Must write existing command IDs.
            "relatedAttribute": "<relatedAttribute>", // Specify which attribute is being updated by calling the command. Write the attribute name of the Aggregate to which the called command belongs.
            "reason": "<reason>" // Specify the reason for calling this command.
        }]
    }
}
    
`
                }
    
                const getExamplePrompt = () => {
                    return `Let me give you an example.
In this example, it is assumed that Debezium transaction logs related to patient information, patient medical records, and patient preference information updates have been delivered, and the output is based on this assumption.
In this example, since patient medical records and patient preference information have foreign keys to patient information, they can be defined as ValueObjects or Aggregates.
Since data inconsistency between patient medical records and patient information can be critical from a business perspective, patient medical records are included as ValueObjects in patient information.
On the other hand, since data inconsistency between patient preference information and patient information is not a significant business issue, patient preference information is defined as an Aggregate.
Please also note that when a patient preference information update event occurs, the 'outputCommandIds' property includes the patient information update command Id to ensure that the patient information data is also updated.
The output result is as follows.
- This is just an example. The actual event storming modeling data I provide will be given as INPUT later.
\`\`\`json
{"transactions":[{"description":"Update Patient Information","id":"patient-update-transaction","properties":[{"isKey":true,"name":"id","type":"Long"},{"name":"name"},{"name":"phoneNumber"},{"name":"bloodType","type":"EnumBloodType"},{"name":"isPreferenceInputed","type":"Boolean"}]},{"description":"Update medicalRecord Information","id":"medicalRecord-update-transaction","properties":[{"isKey":true,"name":"id","type":"Long"},{"isForeignProperty":true,"name":"patientId"},{"name":"medicalRecord"}]},{"description":"Update patientPreference Information","id":"patientPreference-update-transaction","properties":[{"isKey":true,"name":"id","type":"Long"},{"isForeignProperty":true,"name":"patientId"},{"name":"PreferenceValue"}]}],"usecases":[{"relatedTransactionId":"patient-update-transaction","id":"usecase-update-patient","name":"UpdatePatient","displayName":"Update Patient","actor":"User","relatedAggregateQueryIds":["query-agg-update-patient"],"relatedEnumerationQueryIds":["query-enum-blood-type"],"relatedValueObjectQueryIds":[],"relatedCommandQueryIds":["query-cmd-update-patient"],"relatedEventQueryIds":["query-evt-update-patient"]},{"relatedTransactionId":"medicalRecord-update-transaction","id":"usecase-update-medical-record","name":"UpdateMedicalRecord","displayName":"Update Record Record","actor":"User","relatedAggregateQueryIds":[],"relatedEnumerationQueryIds":[],"relatedValueObjectQueryIds":["query-vo-update-medical-record"],"relatedCommandQueryIds":["query-cmd-update-medical-record"],"relatedEventQueryIds":["query-evt-update-medical-record"]},{"relatedTransactionId":"patientPreference-update-transaction","id":"usecase-update-patient-preference","name":"UpdatePatientPreference","displayName":"Update Patient Preference","actor":"User","relatedAggregateQueryIds":["query-agg-update-patient-preference"],"relatedEnumerationQueryIds":[],"relatedValueObjectQueryIds":[],"relatedCommandQueryIds":["query-cmd-update-patient-preference"],"relatedEventQueryIds":["query-evt-update-patient-preference"]}],"queries":[{"fromUsecaseId":"usecase-update-patient","queryId":"query-agg-update-patient","objectType":"Aggregate","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient"},"args":{"aggregateName":"Patient","properties":[{"isKey":true,"name":"id","type":"Long"},{"name":"name"},{"name":"phoneNumber"},{"name":"bloodType","type":"EnumBloodType"},{"name":"isPreferenceInputed","type":"Boolean"}]}},{"fromUsecaseId":"usecase-update-patient","queryId":"query-cmd-update-patient","objectType":"Command","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","commandId":"cmd-update-patient"},"args":{"commandName":"UpdatePatient","api_verb":"PUT","outputEventIds":["evt-patient-updated"],"actor":"User"}},{"fromUsecaseId":"usecase-update-patient","queryId":"query-evt-update-patient","objectType":"Event","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","eventId":"evt-patient-updated"},"args":{"eventName":"PatientUpdated"}},{"fromUsecaseId":"usecase-update-patient","queryId":"query-enum-blood-type","objectType":"Enumeration","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","enumerationId":"enum-blood-type"},"args":{"enumerationName":"EnumBloodType","properties":[{"name":"A"},{"name":"B"},{"name":"AB"},{"name":"O"}]}},{"fromUsecaseId":"usecase-update-medical-record","queryId":"query-vo-update-medical-record","objectType":"ValueObject","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","valueObjectId":"vo-medical-record"},"args":{"valueObjectName":"MedicalRecord","properties":[{"isKey":true,"name":"id","type":"Long"},{"isForeignProperty":true,"name":"patientId","type":"String"},{"name":"medicalRecord"}]}},{"fromUsecaseId":"usecase-update-medical-record","queryId":"query-cmd-update-medical-record","objectType":"Command","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","commandId":"cmd-update-medical-record"},"args":{"commandName":"UpdateMedicalRecord","api_verb":"PUT","outputEventIds":["evt-medical-record-updated"],"actor":"User"}},{"fromUsecaseId":"usecase-update-medical-record","queryId":"query-evt-update-medical-record","objectType":"Event","action":"update","ids":{"boundedContextId":"bc-patient","aggregateId":"agg-patient","eventId":"evt-medical-record-updated"},"args":{"eventName":"MedicalRecordUpdated"}},{"fromUsecaseId":"usecase-update-patient-preference","queryId":"query-agg-update-patient-preference","objectType":"Aggregate","action":"update","ids":{"boundedContextId":"bc-patient-preference","aggregateId":"agg-patient-preference"},"args":{"aggregateName":"PatientPreference","properties":[{"isKey":true,"name":"id","type":"Long"},{"name":"patientId"},{"name":"PreferenceValue"}]}},{"fromUsecaseId":"usecase-update-patient-preference","queryId":"query-cmd-update-patient-preference","objectType":"Command","action":"update","ids":{"boundedContextId":"bc-patient-preference","aggregateId":"agg-patient-preference","commandId":"cmd-update-patient-preference"},"args":{"commandName":"UpdatePatientPreference","api_verb":"PUT","outputEventIds":["evt-patient-preference-updated"],"actor":"User"}},{"fromUsecaseId":"usecase-update-patient-preference","queryId":"query-evt-update-patient-preference","objectType":"Event","action":"update","ids":{"boundedContextId":"bc-patient-preference","aggregateId":"agg-patient-preference","eventId":"evt-patient-preference-updated"},"args":{"eventName":"PatientPreferenceUpdated","outputCommandIds":[{"commandId":"cmd-update-patient","relatedAttribute":"isPreferenceInputed","reason":"To update isPreferenceInputed attribute when patient preference is updated"}]}}]}
\`\`\`

`
                }
        
                return  getFrontGuidePrompt() +
                        getInputEventStormingSyntaxGuidePrompt() +
                        getOutputSyntaxGuidePrompt() +
                        getExamplePrompt() +
                        getJsonCompressGuidePrompt()
                        
            }

            const getUserPrompt = (preprocessModelValueString, debeziumLogs, prevPreprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide, eventCommandRelationGuides) => {

                const usableBoundedContextInfosRequest = (usableBoundedContextInfos) => {
                    if(usableBoundedContextInfos.length <= 0)
                        return ""

                    return `The boundedContextId in a query can have only one of the following values.: ${usableBoundedContextInfos.map(usableBoundedContextInfo => usableBoundedContextInfo.id).join(", ")}`
                }

                const usableAggregateInfosRequest = (usableAggregateInfos, usableValueObjectInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                    const godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["newAggregateId", "existingAggregateId"], ["UseExistingAggregateId", "CreateNewAggregate"])

                    if(usableAggregateInfos.length <= 0 && usableValueObjectInfos.length <= 0 && godGuideProperties.length <= 0)
                        return ""

                    let usableAggregateIds = new Set()

                    usableAggregateInfos.forEach(usableAggregateInfo => usableAggregateIds.add(usableAggregateInfo.id))
                    usableValueObjectInfos.forEach(usableValueObjectInfo => usableAggregateIds.add(usableValueObjectInfo.aggregateId))

                    for(const godGuideProperty of godGuideProperties) {
                        if(godGuideProperty.newAggregateId)
                            usableAggregateIds.add(godGuideProperty.newAggregateId)
                        if(godGuideProperty.existingAggregateId && prevPreprocessInfos.usableAggregateInfos.some((aggregateInfo) => aggregateInfo.id === godGuideProperty.existingAggregateId))
                            usableAggregateIds.add(godGuideProperty.existingAggregateId)
                    }

                    return `The aggregateId in a query can have only one of the following values.: ${Array.from(usableAggregateIds).join(", ")}`
                }


                const godTableDistributeGuidesAggregateRequest = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                    let godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["existingBoundedContextId", "newAggregateName", "newAggregateId"], ["CreateNewAggregate"], false)
                    if(godGuideProperties.length <= 0) return ""

                    const guide = godGuideProperties.map((newAggregateIdInfo) => {
                        return {
                            "boundedContextId": newAggregateIdInfo.existingBoundedContextId,
                            "id": newAggregateIdInfo.newAggregateId,
                            "name": newAggregateIdInfo.newAggregateName,
                            "properties": newAggregateIdInfo.properties
                        }
                    })

                    return `Create Aggregates with the following properties for the passed transaction based on the given information.:${JSON.stringify(guide)}`
                }

                const godTableDistributeGuidesValueObjectRequest = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                    let godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["existingBoundedContextId", "existingAggregateId", "newValueObjectId", "newValueObjectName"], ["CreateNewValueObject"])
                    if(godGuideProperties.length <= 0) return ""

                    const guide = godGuideProperties.map((newAggregateIdInfo) => {
                        return {
                            "boundedContextId": newAggregateIdInfo.existingBoundedContextId,
                            "aggregateId": newAggregateIdInfo.existingAggregateId,
                            "id": newAggregateIdInfo.newValueObjectId,
                            "name": newAggregateIdInfo.newValueObjectName,
                            "properties": newAggregateIdInfo.properties
                        }
                    })

                    return `Create ValueObjects with the following properties for the passed transaction based on the given information.:${JSON.stringify(guide)}`
                }

                const godTableDistributeGuideAggregateLimitRequest = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                    let godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["existingAggregateId"], ["UseExistingAggregateId"])
                    if(godGuideProperties.length <= 0) return ""

                    const guide = godGuideProperties.map((newAggregateIdInfo) => {
                        return {
                            "id": newAggregateIdInfo.existingAggregateId
                        }
                    })

                    return `Do not create an update action for an Aggregate with the following Aggregate Id.: ${JSON.stringify(guide)}`
                }

                const godTableDistributeGuideValueObjectLimitRequest = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                    let godGuideProperties = getGodTableDistributeGuideProperties(godTableDistributeGuidesPreStep, godTableDistributeGuide, ["existingValueObjectId"], ["UseExistingValueObjectId"])
                    if(godGuideProperties.length <= 0) return ""

                    const guide = godGuideProperties.map((newValueObjectIdInfo) => {
                        return {
                            "id": newValueObjectIdInfo.existingValueObjectId
                        }
                    })

                    return `Do not create an update action for a ValueObject with the following ValueObject Id.: ${JSON.stringify(guide)}`
                }


                const eventCommandRelationGuidesEventRequest = (newEvents) => {
                    if(newEvents.length <= 0)
                        return ""

                    return `Generate Events with the following properties for the passed transaction based on the given information.: ${JSON.stringify(newEvents)}`
                }

                const eventCommandRelationGuidesCommandRequest = (newCommands) => {
                    if(newCommands.length <= 0)
                        return ""

                    return `Generate commands with the following properties for the passed transaction based on the given information.: ${JSON.stringify(newCommands)}`
                }

                const eventCommandRelationGuidesRelationsQueryRequest = (newRelations) => {
                    if(newRelations.length <= 0)
                        return ""

                    return `Generate a modification query to link the following events to commands for the given transaction.: ${JSON.stringify(newRelations)}`
                }


                return `[INPUT]
- Existing Event Storming Model Object
${preprocessModelValueString}

- Debezium Transaction Log
${getSummarizedDebeziumLogStrings(debeziumLogs)}

- Additional Requests
${usableBoundedContextInfosRequest(prevPreprocessInfos.usableBoundedContextInfos)}
${usableAggregateInfosRequest(prevPreprocessInfos.usableAggregateInfos, prevPreprocessInfos.usableValueObjectInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide)}
${godTableDistributeGuidesAggregateRequest(godTableDistributeGuidesPreStep, godTableDistributeGuide)}
${godTableDistributeGuidesValueObjectRequest(godTableDistributeGuidesPreStep, godTableDistributeGuide)}
${godTableDistributeGuideAggregateLimitRequest(godTableDistributeGuidesPreStep, godTableDistributeGuide)}
${godTableDistributeGuideValueObjectLimitRequest(godTableDistributeGuidesPreStep, godTableDistributeGuide)}
${eventCommandRelationGuidesEventRequest(eventCommandRelationGuides.newEvents)}
${eventCommandRelationGuidesCommandRequest(eventCommandRelationGuides.newCommands)}
${eventCommandRelationGuidesRelationsQueryRequest(eventCommandRelationGuides.newRelations)}
Ensure that only one transaction content is included in transactions.
Ensure that all query values are included in one use case.

[OUTPUT]
\`\`\`json
`
            }

            return getSystemPrompt() + getUserPrompt(preprocessModelValueString, debeziumLogs, prevPreprocessInfos, godTableDistributeGuidesPreStep, godTableDistributeGuide, eventCommandRelationGuides)
        }

        const getSystemPromptForGenerateGWT = (gwtRequestValue, debeziumLogs) => {        
            const getSystemPrompt = () => {
                return `You need to generate a JSON object in the GWT (Given, When, Then) format based on the provided Debezium information and event storming information.

You will be provided with information in the following format.
\`\`\`json
{
    "debeziumLog": "<debeziumLog>", // You need to generate GWT related to the provided Debezium CDC log.
    "eventStorming": {
        // The name and related attributes of the Aggregate related to Given.
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

        // The name and related attributes of the Command related to When.
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

        // The name and related attributes of the Event related to Then.
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

The format you should return is as follows.
\`\`\`json
{
    // First, you need to create a use case to generate the GWT..
    // The use case should be written considering what actions the actor will perform in relation to the given Command.
    "usecases": [
        {
            "usecaseId": "<usecaseId>",
            "gwtId": "<gwtId>", // The ID of the GWT that uses this use case.
            "name": "<usecaseName>", // A general name describing this use case.
            "description": "<usecaseDescription>", // A detailed description of this use case.
            "actor": "<actor>" // The name of the actor performing this use case.
        }
    ],

    // Using the use case presented above, you should generate the GWT.
    "gwts": [
        {   
            "gwtId": "<gwtId>",
            "usecaseId": "<usecaseId>", // The ID of the use case used to generate this GWT.
            "givens": [
                {
                    "name": "<givenName>", // The name of the given presented above.
                    "values": {
                        // There are three types of attribute values you can write.
                        // 1. Write an actual possible value.
                        // 2. If the current value is empty, write null.
                        // 3. If the attribute seems unrelated to this GWT, write "N/A".
                        "<attributeName>": <attributeValue|null|"N/A">
                    }
                }
            ],
            "whens": [
                {
                    "name": "<whenName>", // The name of the when presented above.
                    "values": {
                        "<attributeName>": <attributeValue|null|"N/A">
                    }
                }
            ],
            "thens": [
                {
                    "name": "<thenName>", // The name of the then presented above.
                    "values": {
                        "<attributeName>": <attributeValue|null|"N/A">
                    }
                }
            ]
        }
    ]
}
\`\`\`

The example is as follows.
Here, transactions related to order creation and the associated Aggregate, Command, and Event are given.
The output GWT initially has no information related to the order, so a value of null is entered, but ultimately, the Command to create the order results in the Event containing the order information entered by the user.
[INPUT]
\`\`\`json
{"debeziumLog":"{\"payload\":{\"before\":null,\"after\":{\"order_number\":10005,\"order_date\":19848,\"purchaser\":1001,\"quantity\":3,\"product_id\":104},\"source\":{\"db\":\"inventory\",\"table\":\"orders\"}}}","eventStorming":{"givens":[{"name":"orders","attributes":[{"name":"orderNumber","type":"Integer"},{"name":"orderDate","type":"Integer"},{"name":"purchaser","type":"Integer"},{"name":"quantity","type":"Integer"},{"name":"productId","type":"Integer"}]}],"whens":[{"name":"CreateOrder","attributes":[{"name":"orderNumber","type":"Integer"},{"name":"orderDate","type":"Integer"},{"name":"purchaser","type":"Integer"},{"name":"quantity","type":"Integer"},{"name":"productId","type":"Integer"}]}],"thens":[{"name":"OrderCreated","attributes":[{"name":"orderNumber","type":"Integer"},{"name":"orderDate","type":"Integer"},{"name":"purchaser","type":"Integer"},{"name":"quantity","type":"Integer"},{"name":"productId","type":"Integer"}]}]}}
\`\`\`

[OUTPUT]
\`\`\`json
{"usecases":[{"usecaseId":"UC001","gwtId":"GWT001","name":"Customer creates an order","description":"The customer selects a product and specifies the order quantity to create a new order.","actor":"Customer"}],"gwts":[{"gwtId":"GWT001","usecaseId":"UC001","givens":[{"name":"orders","values":{"orderNumber":null,"orderDate":null,"purchaser":null,"quantity":null,"productId":null}}],"whens":[{"name":"CreateOrder","values":{"orderNumber":10005,"orderDate":19848,"purchaser":1001,"quantity":3,"productId":104}}],"thens":[{"name":"OrderCreated","values":{"orderNumber":10005,"orderDate":19848,"purchaser":1001,"quantity":3,"productId":104}}]}]}
\`\`\`

${getJsonCompressGuidePrompt()}
Now, let's actually process the user's input.
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

        try {
            
            let preprocessInfos = {}
            let preprocessModelValueString = ""
            switch(this.modelMode) {
                case "summaryPreprocessModelValue":
                    preprocessInfos = getPreprocessInfos(this.relatedPreProcessModelValue, this.client.modelValue)
                    preprocessModelValueString = JSON.stringify(this.relatedPreProcessModelValue)
                        .replace(/\{\}/g, "{...}")
                        .replace(/\[\]/g, "[...]")
    
                    this.modelMode = "generateGodTableDistributeGuidesPreStep"
                    break
    
                case "generateGodTableDistributeGuidesPreStep":
                    const clientModelValue = (this.client.information && this.client.information.associatedProject) ? 
                        getClientModelValue(this.client.modelValue, this.client.mirrorValue) : this.client.modelValue
    
                    this.UUIDAliasDic = getUUIDAliasDic(clientModelValue)
                    this.preprocessModelValue = getPreprocessModelValue(clientModelValue, this.UUIDAliasDic.UUIDToAlias)
    
                    preprocessInfos = getPreprocessInfos(this.preprocessModelValue, this.client.modelValue)
                    preprocessModelValueString = JSON.stringify(this.preprocessModelValue)
    
                    if(preprocessModelValueString.length > this.modelInputLengthLimit)
                        this.modelMode = "summaryPreprocessModelValue"
                    break
            }
    
    
            let systemPrompt = ""
            switch(this.modelMode) {
                case "summaryPreprocessModelValue":
                    systemPrompt = getSystemPromptForSummaryPreProcessModelValue(this.preprocessModelValue, this.messageObj.modificationMessage)
                    break
    
                case "generateGodTableDistributeGuidesPreStep":
                    checkIsValidBoundedContexts(preprocessInfos, this.errorCallback)
                    systemPrompt = getSystemPromptForGenerateGodTableDistributeGuidesPreStep(this.messageObj.modificationMessage, preprocessInfos)
                    this.prevPreprocessInfos = preprocessInfos
                    this.prevPreprocessModelValueString = preprocessModelValueString
                    this.generatedGuideValues = {}
                    break
    
                case "generateGodTableDistributeGuides":
                    systemPrompt = getSystemPromptForGodTableDistributeGuides(this.prevPreprocessModelValueString, this.prevPreprocessInfos, this.generatedGuideValues.godTableDistributeGuidesPreStep)
                    break
                
                case "generateEventCommandRelationGuides":
                    systemPrompt = getSystemPromptForGenerateEventCommandRelationGuides(this.prevPreprocessModelValueString, this.messageObj.modificationMessage, this.prevPreprocessInfos, this.generatedGuideValues.godTableDistributeGuidesPreStep, this.generatedGuideValues.godTableDistributeGuide)
                    break
    
                case "generateCommands":
                    systemPrompt = getSystemPromptForGenerateCommands(this.prevPreprocessModelValueString, this.messageObj.modificationMessage, this.prevPreprocessInfos, this.generatedGuideValues.godTableDistributeGuidesPreStep, this.generatedGuideValues.godTableDistributeGuide, this.generatedGuideValues.eventCommandRelationGuides
                    )
                    break
                
                case "generateGWT":
                    systemPrompt = getSystemPromptForGenerateGWT(this.messageObj.gwtRequestValue, this.messageObj.modificationMessage)
                    break
            }
    
            console.log("[*] 전달된 시스템 프롬프트 \n" + systemPrompt)
            return systemPrompt

        } catch(e) {
            console.error(e)
            const errorObj = new Error(`AI에 지시할 프롬프트 생성 도중에 오류가 발생했습니다. 다시 시도해 주세요.: ${e.message}`)
            this.errorCallback(errorObj)
            throw e
        }
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

        const applyAggregateRelationToQueries = (queryResults, godTableDistributeGuidesPreStep, godTableDistributeGuide, prevPreprocessInfos) => {
            const getAggregateRelationItems = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                const tableNameToAggregateInfo = (tableName, godTableDistributeGuide) => {
                    const tagetTableAction = godTableDistributeGuide.tableActions[tableName]
                    if(tagetTableAction.actionType === "CreateNewAggregate") {
                        return {
                            "boundedContextId": tagetTableAction.args.existingBoundedContextId,
                            "aggregateId": tagetTableAction.args.newAggregateId
                        }
                    }
                    else if(tagetTableAction.actionType === "UseExistingAggregateId") {
                        return {
                            "boundedContextId": tagetTableAction.args.existingBoundedContextId,
                            "aggregateId": tagetTableAction.args.existingAggregateId
                        }
                    }
                    return null
                }
        
                const getMainInfoTableAggregateInfo = (godTableDistributeGuidesPreStep, godTableDistributeGuide) => {
                    for(const table of godTableDistributeGuidesPreStep.tables) {
                        if(table.isMainInfoTable) {
                            return tableNameToAggregateInfo(table.tableName, godTableDistributeGuide)
                        }
                    }
                    return null
                }
        
                const mainInfoTableAggregateInfo = getMainInfoTableAggregateInfo(godTableDistributeGuidesPreStep, godTableDistributeGuide)
                if(!mainInfoTableAggregateInfo) return null
        
                let aggregateRelationItems = []
                for(const table of godTableDistributeGuidesPreStep.tables) {
                    if(!table.isMainInfoTable) {
                        const fromTableAggregateInfo = tableNameToAggregateInfo(table.tableName, godTableDistributeGuide)
                        if(!fromTableAggregateInfo) continue
        
                        aggregateRelationItems.push({
                            from: fromTableAggregateInfo,
                            to: mainInfoTableAggregateInfo
                        })
                    }
                }
                return aggregateRelationItems
            }
        
            const applyToUpdateAggregateQueries = (queryResults, aggregateRelationItems) => {
                let appliedRelationItems = []
                for(const aggregateRelationItem of aggregateRelationItems) {
                    for(const query of queryResults.queries) {
                        if(query.objectType === "Aggregate" && 
                           query.action === "update" && 
                           query.ids.boundedContextId === aggregateRelationItem.from.boundedContextId && 
                           query.ids.aggregateId === aggregateRelationItem.from.aggregateId) {
                            query.args.toAggregateIds = [aggregateRelationItem.to.aggregateId]
                            appliedRelationItems.push(aggregateRelationItem)
                        }
                    }
                }
                return appliedRelationItems
            }
        
            const applyToExistingAggregateQueries = (queryResults, aggregateRelationItems, appliedRelationItems, prevPreprocessInfos) => {
                const addUpdateAggregateQuery = (queryResults, boundedContextId, aggregateId, toAggregateId) => {
                    const newQueryId = `query-agg-update-${aggregateId}`
        
                    queryResults.usecases[0].relatedAggregateQueryIds.push(newQueryId)
                    queryResults.queries.push({
                        "fromUsecaseId": queryResults.usecases[0].id,
                        "queryId": newQueryId,
                        "objectType": "Aggregate",
                        "action": "update",
                        "ids": {
                            "boundedContextId": boundedContextId,
                            "aggregateId": aggregateId
                        },
                        "args": {
                            "toAggregateIds": [toAggregateId]
                        }
                    })
                }
        
                const notAppliedRelationItems = aggregateRelationItems.filter(item => !appliedRelationItems.includes(item))
                for(const aggregateRelationItem of notAppliedRelationItems) {
                    if(prevPreprocessInfos.usableAggregateInfos.some((aggregateInfo) => aggregateInfo.id === aggregateRelationItem.from.aggregateId))
                        addUpdateAggregateQuery(queryResults, aggregateRelationItem.from.boundedContextId, aggregateRelationItem.from.aggregateId, aggregateRelationItem.to.aggregateId)
                }
            }
        
            const aggregateRelationItems = getAggregateRelationItems(godTableDistributeGuidesPreStep, godTableDistributeGuide)
            if(!aggregateRelationItems || aggregateRelationItems.length === 0) return
        
            const appliedRelationItems = applyToUpdateAggregateQueries(queryResults, aggregateRelationItems)
            applyToExistingAggregateQueries(queryResults, aggregateRelationItems, appliedRelationItems, prevPreprocessInfos)
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
        
                if(query.args && query.args.outputEventIds)
                    query.args.outputEventIds = query.args.outputEventIds.map(eventId => getUUIDIfExist(eventId))
            
                if(query.args && query.args.outputCommandIds)
                    query.args.outputCommandIds = query.args.outputCommandIds.map(outputCommandId => {
                        return {
                            commandId: getUUIDIfExist(outputCommandId.commandId),
                            relatedAttribute: outputCommandId.relatedAttribute,
                            reason: outputCommandId.reason
                        }
                    })
                
                if(query.args && query.args.toAggregateIds)
                    query.args.toAggregateIds = query.args.toAggregateIds.map(toAggregateId => getUUIDIfExist(toAggregateId))
            }
            return queries
        }

        const applyPostProcessToEventCommandRelationGuides = (eventCommandRelationGuides, prevPreprocessInfos) => {
            const getExistingEventIds = (eventCommandRelationGuides, prevPreprocessInfos) => {
                let existingEventIds = new Set()
                for(const eventInfo of prevPreprocessInfos.eventInfos)
                    existingEventIds.add(eventInfo.id)
                for(const newEvent of eventCommandRelationGuides.newEvents)
                    existingEventIds.add(newEvent.eventId)
                return Array.from(existingEventIds)
            }

            const existingEventIds = getExistingEventIds(eventCommandRelationGuides, prevPreprocessInfos)
            for(const newCommand of eventCommandRelationGuides.newCommands) {
                for(const outputEvent of newCommand.outputEvents)
                    if(!existingEventIds.includes(outputEvent.id)) {
                        eventCommandRelationGuides.newEvents.push({
                            "aggregateId": newCommand.aggregateId,
                            "eventId": outputEvent.id,
                            "eventName": changeCase.pascalCase(outputEvent.id),
                            "outputCommands": []
                         })
                    }
            }
        }

        const filterInvalidPossibleActions = (possibleActions, prevPreprocessInfos) => {
            const isValidPossibleAction = (possibleAction, prevPreprocessInfos) => {
                const getExistingCheckLists = (possibleAction, prevPreprocessInfos) => {
                    const boundedContextIds = prevPreprocessInfos.boundedContextInfos.map((boundedContextInfo) => {
                        return boundedContextInfo.id
                    })
                    const aggregateIds = prevPreprocessInfos.aggregateInfos.map((aggregateInfo) => {
                        return aggregateInfo.id
                    })
                    const valueObjectIds = prevPreprocessInfos.valueObjectInfos.map((valueObjectInfo) => {
                        return valueObjectInfo.id
                    })
                    const usableBoundedContextIds = prevPreprocessInfos.usableBoundedContextInfos.map((boundedContextInfo) => {
                        return boundedContextInfo.id
                    })
                    const usableAggregateIds = prevPreprocessInfos.usableAggregateInfos.map((aggregateInfo) => {
                        return aggregateInfo.id
                    })

                    let existingCheckLists = {
                        "UseExistingAggregateId": {
                            "existingBoundedContextId": [...boundedContextIds],
                            "existingAggregateId": [...aggregateIds]
                        },
                        "UseExistingValueObjectId": {
                            "existingBoundedContextId": [...boundedContextIds],
                            "existingValueObjectId": [...valueObjectIds]
                        },
                        "CreateNewAggregate": {
                            "existingBoundedContextId": [...usableBoundedContextIds]
                        },
                        "CreateNewValueObject": {
                            "existingBoundedContextId": [...usableBoundedContextIds],
                            "existingAggregateId": [...usableAggregateIds]
                        }
                    }

                    for(const tableAction of Object.values(possibleAction.tableActions)) {
                        if(tableAction.args.newAggregateId) {
                            existingCheckLists.UseExistingAggregateId.existingAggregateId.push(tableAction.args.newAggregateId)
                            existingCheckLists.CreateNewValueObject.existingAggregateId.push(tableAction.args.newAggregateId)
                        }
                        if(tableAction.args.newValueObjectId) {
                            existingCheckLists.UseExistingValueObjectId.existingValueObjectId.push(tableAction.args.newValueObjectId)
                        }
                    }

                    return existingCheckLists
                }

                const existingCheckLists = getExistingCheckLists(possibleAction, prevPreprocessInfos)
                for(const tableAction of Object.values(possibleAction.tableActions)) {
                    const existingCheckList = existingCheckLists[tableAction.actionType]
                    if(!existingCheckList) return false

                    for(const argKey of Object.keys(tableAction.args)) {
                        if(existingCheckList[argKey] && !existingCheckList[argKey].includes(tableAction.args[argKey]))
                            return false
                    }
                }
                return true
            }

            const checkIsRecommendExist = (possibleActions) => {
                return possibleActions.some((possibleAction) => {
                    return possibleAction.isRecommended
                })
            }

            let filteredPossibleActions = possibleActions.filter((possibleAction) => {
                return isValidPossibleAction(possibleAction, prevPreprocessInfos)
            })
            if(filteredPossibleActions.length === 0)
                throw new Error("죄송합니다. 현재 조건에 맞는 가능한 모델링 옵션이 없습니다. 다시 시도해주시길 바랍니다.")

            if(!checkIsRecommendExist(filteredPossibleActions)) {
                filteredPossibleActions[0].isRecommended = true
            }

            return filteredPossibleActions
        }

        const checkIsValidGodTableDistributeGuidesPreStep = (godTableDistributeGuidesPreStep) => {
            const allTableNames = godTableDistributeGuidesPreStep.tables.map((table) => table.tableName)

            for(const table of godTableDistributeGuidesPreStep.tables) {
                if(table.immediateConsistencyRequirementTables) {
                    for(const imTable of table.immediateConsistencyRequirementTables) {
                        if(!allTableNames.includes(imTable.tableName))
                            throw new Error("테이블 분해로 생성된 AI 결과가 올바르지 않습니다. 다시 시도해주시길 바립니다.")
                    }
                }
            }
        }

        const applyPostProcessToGodTableDistributeGuidesPreStep = (godTableDistributeGuidesPreStep) => {
            let tablesToInclude = []
            for (const table of godTableDistributeGuidesPreStep.tables) {
               if(table.isMainInfoTable ||
                  (table.immediateConsistencyRequirementTables && table.immediateConsistencyRequirementTables.length > 0) ||
                  table.properties.length !== 1
               ) continue
         
               if(changeCase.camelCase(table.properties[0]).includes('id') || changeCase.camelCase(table.properties[0]).includes('Id'))
                  tablesToInclude.push(table)
            }
            if(tablesToInclude.length === 0) return
            
         
            const mainInfoTable = godTableDistributeGuidesPreStep.tables.find(table => table.isMainInfoTable)
            for (const table of tablesToInclude) {
               mainInfoTable.properties.push(table.properties[0])
            }
         
         
            godTableDistributeGuidesPreStep.tables = godTableDistributeGuidesPreStep.tables.filter(table => !tablesToInclude.includes(table))
            for (const table of godTableDistributeGuidesPreStep.tables) {
               if(table.immediateConsistencyRequirementTables) {
                  table.immediateConsistencyRequirementTables = table.immediateConsistencyRequirementTables.filter(requirement => tablesToInclude.includes(requirement.tableName))
                  if(table.immediateConsistencyRequirementTables.length === 0) delete table.immediateConsistencyRequirementTables
               }
            }
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

                case "generateGodTableDistributeGuidesPreStep":
                    this.generatedGuideValues.godTableDistributeGuidesPreStep = parseToJson(text)
                    checkIsValidGodTableDistributeGuidesPreStep(this.generatedGuideValues.godTableDistributeGuidesPreStep)
                    applyPostProcessToGodTableDistributeGuidesPreStep(this.generatedGuideValues.godTableDistributeGuidesPreStep)
                    outputResult = {
                        modelName: this.modelName,
                        modelMode: this.modelMode,
                        modelValue: {
                            godTableDistributeGuidesPreStep: this.generatedGuideValues.godTableDistributeGuidesPreStep,
                            debeziumLogStrings: getDebeziumLogStrings(this.messageObj.modificationMessage)
                        },
                        modelRawValue: text
                    }
                    this.modelMode = "generateGodTableDistributeGuides"
                    break

                case "generateGodTableDistributeGuides":
                    this.generatedGuideValues.godTableDistributeGuides = parseToJson(text)
                    this.generatedGuideValues.godTableDistributeGuides.possibleActions = filterInvalidPossibleActions(this.generatedGuideValues.godTableDistributeGuides.possibleActions, this.prevPreprocessInfos)
                    this.generatedGuideValues.godTableDistributeGuide = this.generatedGuideValues.godTableDistributeGuides.possibleActions.filter((possibleAction) => {
                        return possibleAction.isRecommended
                    })[0]

                    outputResult = {
                        modelName: this.modelName,
                        modelMode: this.modelMode,
                        modelValue: {
                            godTableDistributeGuides: this.generatedGuideValues.godTableDistributeGuides,
                            debeziumLogStrings: getDebeziumLogStrings(this.messageObj.modificationMessage)
                        },
                        modelRawValue: text
                    }
                    this.modelMode = "generateEventCommandRelationGuides"
                    break
                
                case "generateEventCommandRelationGuides":
                    this.generatedGuideValues.eventCommandRelationGuides = parseToJson(text)
                    applyPostProcessToEventCommandRelationGuides(this.generatedGuideValues.eventCommandRelationGuides, this.prevPreprocessInfos)

                    outputResult = {
                        modelName: this.modelName,
                        modelMode: this.modelMode,
                        modelValue: {
                            eventCommandRelationGuides: this.generatedGuideValues.eventCommandRelationGuides,
                            debeziumLogStrings: getDebeziumLogStrings(this.messageObj.modificationMessage)
                        },
                        modelRawValue: text
                    }
                    this.modelMode = "generateCommands"
                    break

                case "generateCommands":
                    let queryResults = parseToJson(text)
                    applyAggregateRelationToQueries(queryResults, this.generatedGuideValues.godTableDistributeGuidesPreStep, this.generatedGuideValues.godTableDistributeGuide, this.prevPreprocessInfos)
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
                    this.modelMode = "generateGodTableDistributeGuides"
                    break
            }

            console.log("[*] 최종 파싱 결과", outputResult)
            return outputResult
        }
        catch(e) {
            console.error("[!] DebeziumLogsTabGenerator에서 에러가 발생함! \n" + text)
            console.error(e)

            return {
                modelName: this.modelName,
                modelMode: this.modelMode,
                modelValue: null,
                modelRawValue: text,
                errorMessage: e.message,
                isJsonParseError: (e instanceof SyntaxError && e.message.includes('JSON'))
            }
        }
    }
}


module.exports = DebeziumLogsTabGenerator;