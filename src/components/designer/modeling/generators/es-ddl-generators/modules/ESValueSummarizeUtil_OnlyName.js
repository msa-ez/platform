const ESValueSummarizeUtil = require('./ESValueSummarizeUtil')

/**
 * @deprecated 이 클래스는 레거시 코드입니다. 대신 ESValueSummarizeWithFilterUtil 클래스를 사용해주세요.
 * 새로운 기능과 개선된 성능을 위해 ESValueSummarizeWithFilterUtil로 마이그레이션을 권장합니다.
*/
class ESValueSummarizeUtil_OnlyName {
    static getGuidePrompt() {
        return `You will receive a JSON object containing summarized information about the event storming model on which you will perform your task.
The approximate structure is as follows.
{
    // The event storming model consists of multiple Bounded Contexts.
    "<boundedContextName>": {
        "name": "<boundedContextName>",
        "actors": [
            {
                "name": "<actorName>"
            }
        ],

        // A Bounded Context has multiple aggregates.
        "aggregates": {
            "<aggregateName>": {
                "name": "<aggregateName>",
                
                // Definitions of Entity objects used for the Aggregate Root properties.
                "entities": [
                    {
                        "name": "<entityName>",
                    }
                ],

                // Definitions of Enum objects used for the Aggregate Root properties.
                "enumerations": [
                    {
                        "name": "<enumerationName>",
                    }
                ],
                
                // Definitions of ValueObject objects used for the Aggregate Root properties.
                "valueObjects": [
                    {
                        "name": "<valueObjectName>",
                    }
                ],
                
                // List of commands representing requests through REST API.
                "commands": [
                    {
                        "name": "<commandName>",
                        "api_verb":  <"POST" | "DELETE" | "PUT">,
                        "outputEvents": ["<eventName>"] // Information about the event that occurs when this command is requested.
                    }
                ],
                
                // List of events triggered by commands.
                "events": [
                    {
                        "name": "<eventName>",
                        "outputCommands": ["<commandName>"] // Information about the command that occurs when this event is requested.
                    }
                ],

                // List of ReadModels representing data read through REST API.
                "readModels": [
                    {
                        "name": "<readModelName>"
                    }
                ]
            }
        }
    }
}

`
    }

    static getFilteredSummarizedESValue(esValue){
        const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(esValue)

        let filteredSummarizedESValue = {}
        for(let boundedContext of Object.values(summarizedESValue))
        {
            let filteredAggregates = {}
            for(let aggregate of Object.values(boundedContext.aggregates))
                filteredAggregates[aggregate.name] = ESValueSummarizeUtil_OnlyName._getFilteredAggregate(aggregate)

            filteredSummarizedESValue[boundedContext.name] = {
                name: boundedContext.name,
                actors: boundedContext.actors.map(actor => {
                    return {
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
            name: aggregate.name,

            entities: aggregate.entities.map(entity => {
                return {
                    name: entity.name
                }
            }),
            
            enumerations: aggregate.enumerations.map(enumeration => { 
                return {
                    name: enumeration.name
                }
            }),

            valueObjects: aggregate.valueObjects.map(valueObject => {
                return {
                    name: valueObject.name
                }
            }),

            commands: aggregate.commands.map(command => {
                return {
                    name: command.name,
                    api_verb: command.api_verb,
                    outputEvents: (command.outputEvents) ? command.outputEvents.map(event => event.name) : []
                }
            }),

            events: aggregate.events.map(event => {
                return {
                    name: event.name,
                    outputCommands: (event.outputCommands) ? event.outputCommands.map(command => command.name) : []
                }
            }),

            readModels: aggregate.readModels.map(readModel => {
                return {
                    name: readModel.name
                }
            })
        }
    }
}

module.exports = ESValueSummarizeUtil_OnlyName