const ESValueSummarizeUtil = require('./ESValueSummarizeUtil')

/**
 * @deprecated 이 클래스는 레거시 코드입니다. 대신 ESValueSummarizeWithFilter 클래스를 사용해주세요.
 * 새로운 기능과 개선된 성능을 위해 ESValueSummarizeWithFilter로 마이그레이션을 권장합니다.
*/
class ESValueSummarizeUtil_WithProperties {
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
                        // 2. If there's a name defined in enumerations or valueObjects, you can use that name.
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
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                                ["isKey": true]
                            }
                        ],
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
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                                ["isKey": true]
                            }
                        ],
                        "outputCommands": [{
                            "relationId": "<relationId>",
                            "id": "<commandId>",
                            "name": "<commandName>"
                        }] // Information about the command that occurs when this event is requested.
                    }
                ],
            
                // List of ReadModels representing data read through REST API.
                "readModels": [
                    {
                        "id": "<readModelId>",
                        "name": "<readModelName>",
                        "properties": [
                            {
                                "name": "<propertyName>",
                                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                                ["isKey": true]
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

    static getSummarizedESValue(esValue){
        const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(esValue)
        for(let boundedContext of Object.values(summarizedESValue))
            ESValueSummarizeUtil_WithProperties._addEntityPropertiesToBoundedContext(esValue, boundedContext)
        return summarizedESValue
    }

    static getSummarizedBoundedContextValue(esValue, boundedContext){
        const summarizedBoundedContext = ESValueSummarizeUtil.getSummarizedBoundedContextValue(esValue, boundedContext)
        ESValueSummarizeUtil_WithProperties._addEntityPropertiesToBoundedContext(esValue, summarizedBoundedContext)
        return summarizedBoundedContext
    }

    static _addEntityPropertiesToBoundedContext(esValue, boundedContext){
        for(let aggregate of Object.values(boundedContext.aggregates)) {
            for(let command of aggregate.commands) {
                command.properties = ESValueSummarizeUtil_WithProperties.__getEntityProperties(
                    esValue.elements[command.id].fieldDescriptors
                )
            }

            for(let event of aggregate.events) {
                event.properties = ESValueSummarizeUtil_WithProperties.__getEntityProperties(
                    esValue.elements[event.id].fieldDescriptors
                )
            }

            for(let readModel of aggregate.readModels) {
                readModel.properties = ESValueSummarizeUtil_WithProperties.__getEntityProperties(
                    esValue.elements[readModel.id].queryParameters
                )
            }
        }
    }

    static __getEntityProperties(fieldDescriptors) {
        return fieldDescriptors.map(fieldDescriptor => {
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
}

module.exports = ESValueSummarizeUtil_WithProperties