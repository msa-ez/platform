const ESValueSummarizeUtil = require('./ESValueSummarizeUtil')

/**
 * @deprecated 이 클래스는 레거시 코드입니다. 대신 ESValueSummarizeWithFilter 클래스를 사용해주세요.
 * 새로운 기능과 개선된 성능을 위해 ESValueSummarizeWithFilter로 마이그레이션을 권장합니다.
*/
class ESValueSummarizeUtil_OnlyNameWithId {
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

                // Definitions of Entity objects used for the Aggregate Root properties.
                "entities": [
                    {
                        "id": "<entityId>",
                        "name": "<entityName>"
                    }
                ],
                
                // Definitions of Enum objects used for the Aggregate Root properties.
                "enumerations": [
                    {
                        "id": "<enumerationId>",
                        "name": "<enumerationName>"
                    }
                ],
                
                // Definitions of ValueObject objects used for the Aggregate Root properties.
                "valueObjects": [
                    {
                        "id": "<valueObjectId>",
                        "name": "<valueObjectName>"
                    }
                ],
                
                // List of commands representing requests through REST API.
                "commands": [
                    {
                        "id": "<commandId>",
                        "name": "<commandName>",
                        "api_verb":  <"POST" | "DELETE" | "PUT">,
                        "outputEvents": [{
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
                            "id": "<commandId>",
                            "name": "<commandName>"
                        }] // Information about the command that occurs when this event is requested.
                    }
                ],

                // List of ReadModels representing data read through REST API.
                "readModels": [
                    {
                        "id": "<readModelId>",
                        "name": "<readModelName>"
                    }
                ]
            }
        }
    }
}

`
    }

    static getFilteredSummarizedESValue(esValue, esAliasTransManager){
        const summarizedESValue = esAliasTransManager.transToAliasInSummarizedESValue(
            ESValueSummarizeUtil.getSummarizedESValue(esValue)
        )

        let filteredSummarizedESValue = {}
        for(let boundedContext of Object.values(summarizedESValue))
        {
            let filteredAggregates = {}
            for(let aggregate of Object.values(boundedContext.aggregates))
                filteredAggregates[aggregate.id] = ESValueSummarizeUtil_OnlyNameWithId._getFilteredAggregate(aggregate)

            filteredSummarizedESValue[boundedContext.id] = {
                id: boundedContext.id,
                name: boundedContext.name,
                actors: boundedContext.actors.map(actor => {
                    return {
                        id: actor.id,
                        name: actor.name
                    }
                }),
                aggregates: filteredAggregates
            }
        }
        return filteredSummarizedESValue
    }

    static _getFilteredAggregate(aggregate){
        return {
            id: aggregate.id,
            name: aggregate.name,

            entities: aggregate.entities.map(entity => {
                return {
                    id: entity.id,
                    name: entity.name
                }
            }),
            
            enumerations: aggregate.enumerations.map(enumeration => { 
                return {
                    id: enumeration.id,
                    name: enumeration.name
                }
            }),

            valueObjects: aggregate.valueObjects.map(valueObject => {
                return {
                    id: valueObject.id,
                    name: valueObject.name
                }
            }),

            commands: aggregate.commands.map(command => {
                return {
                    id: command.id,
                    name: command.name,
                    api_verb: command.api_verb,
                    outputEvents: (command.outputEvents) ? command.outputEvents.map(event => {
                        return {
                            id: event.id,
                            name: event.name
                        }
                    }) : []
                }
            }),

            events: aggregate.events.map(event => {
                return {
                    id: event.id,
                    name: event.name,
                    outputCommands: (event.outputCommands) ? event.outputCommands.map(command => {
                        return {
                            id: command.id,
                            name: command.name
                        }
                    }) : []
                }
            }),

            readModels: aggregate.readModels.map(readModel => {
                return {
                    id: readModel.id,
                    name: readModel.name
                }
            })
        }
    }
}

module.exports = ESValueSummarizeUtil_OnlyNameWithId;