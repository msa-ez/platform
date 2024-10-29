const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESActionUtil = require("./modules/ESActionsUtil")
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil")
const ESValueSummarizeUtil_OnlyName = require("./modules/ESValueSummarizeUtil_OnlyName")

class AggregateInsideGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);
        
        this.model = "gpt-4o-2024-08-06"
        this.generatorName = 'AggregateInsideGenerator'
        this.inputedParams = null

        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["description", "targetAggregate", "esValue", "userInfo", "information"])
                if(this.client.input[optionKey] === undefined) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                description: this.client.input.description,
                targetAggregate: this.client.input.targetAggregate,
                esValue: this.client.input.esValue,
                userInfo: this.client.input.userInfo,
                information: this.client.input.information
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})

            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.esValue, this.inputedParams.targetAggregate, this.inputedParams.description
            )

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            return prompt

        } catch(e) {

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {esValue, ddl, error:e})
            console.error(e)
            throw e

        }
    }

    _getSystemPrompt(){
        return this.__getFrontGuidePrompt() +
            ESValueSummarizeUtil_OnlyName.getGuidePrompt() +
            this.__getOutputSyntaxGuidePrompt() +
            this.__getExamplePrompt() +
            GlobalPromptUtil.getJsonCompressGuidePrompt()
    }

    __getFrontGuidePrompt(){
        return `You need to return actions to add Commands and Events to a specific Aggregate based on the given EventStorming information.

Please follow these rules.
1. Commands must raise at least one event. Ex) CreateUser > UserCreated
2. Even if the name of the feature passed by the user is not in English, you need to convert it to an appropriate English name and add it. Ex) 유저 업데이트 기능 -> UpdateUser, UserUpdated
3. When adding properties to events and commands, make sure they exist in the Aggregate. If it doesn't, you can add the new property to the Aggregate via an action.
4. When adding new properties to an aggregate, you can use native Java data types such as String, Long, Integer, etc. for aggregate properties, or you can use predefined properties: Address, Portrait, Rating, Money, Email. Other properties must be defined as enumerations or value objects in the corresponding aggregation.
5. If the event to be generated additionally calls other commands. Please reference the existing event storming  information passing the name of that command and add it.
6. When the value of a ValueObject or Enumeration is utilised by the Aggregate Root, the corresponding material type must be used, not String. Ex) String > OrderStatus
7. Do not write comments in the output JSON object.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "actions": [
        {
            // This attribute indicates what type of object information is being modified.
            // Choose one from Event, Command, Aggregate, Enumeration, ValueObject.
            "objectType": "<objectType>",

            // This attribute contains the parameters required for the action.
            "args": {
                "<argName>": "<argValue>"
            }
        }
    ]
}
\`\`\`

I will explain the ids and args used in each objectType.
You cannot use any arbitrary parameters not described in this explanation in ids or args.

# objectType: Command
- Description
Generate commands in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "Command",
    "args": {
        "commandName": "<commandName>",
        "api_verb": <"POST" | "DELETE" | "PUT">,

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ],

        "outputEventNames": ["<outputEventName>"], // Must write existing event names.
        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, etc. If there is no specific actor, leave it empty.
    }
}

# objectType: Event
- Description
Generate events in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "Event",
    "args": {
        "eventName": "<eventName>",

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ],

        // Specific events can call commands within other BoundedContexts to change states.
        // Examples of such call information are as follows.
        // 1. If the patient's preference information has changed and there is an updated latest date of the patient's preference information in the patient information, it should be written to reflect this.
        // 2. If the quantity of ordered products has changed and there is information related to the total quantity of ordered products in the order product information, it should be written to reflect this.
        // 3. If a customer has purchased a new product with points and there are remaining points in the customer information, the points should be reduced to reflect this.
        "outputCommandNames": ["<outputCommandName>"], // Must write existing command names.
    }
}

# objectType: Aggregate
- Description
When adding a command or event, if an existing Aggregate does not have the required property, you can add a new property.

- Return format
{
    "objectType": "Aggregate",
    "args": {
        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"] // If the type is String, do not specify the type.
            }
        ]
    }
}

# objectType: Enumeration
- Description
If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an enumeration.

- Return format
{
    "objectType": "Enumeration",
    "args": {
        // If you use a name that already exists, we'll add a new property to that Enumeration. 
        // If you use a name that doesn't exist, we'll create a new Enumeration.
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
If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an ValueObject.

- Return format
{
    "objectType": "ValueObject",
    "args": {
        // If you use a name that already exists, we'll add a new property to that ValueObject. 
        // If you use a name that doesn't exist, we'll create a new ValueObject.
        "valueObjectName": "<valueObjectName>",
        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true], // Write only if there is a primary key.
                ["isForeignProperty": true] // Whether it is a foreign key. Write only if this attribute references another table's attribute.
            }
        ]
    }
}

`
    }

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- Existing Event Storming Model
{"orderService":{"name":"orderService","actors":[{"name":"Customer"}],"aggregates":{"Order":{"name":"Order","enumerations":[{"name":"OrderStatus"}],"valueObjects":[],"commands":[{"name":"PlaceOrder","api_verb":"POST","outputEvents":["OrderPlaced"]}],"events":[{"name":"OrderPlaced","outputCommands":[]}]},"Inventory":{"name":"Inventory","enumerations":[],"valueObjects":[],"commands":[{"name":"UpdateInventory","api_verb":"POST","outputEvents":["InvenetoryUpdated"]}],"events":[{"name":"InvenetoryUpdated","outputCommands":[]}]}}}}

- Aggregate info to add event and command
{"name":"Order","properties":[{"name":"orderId","type":"Long"},{"name":"customerId","type":"Long"},{"name":"orderStatus","type":"OrderStatus"},{"name":"totalAmount","type":"Money"}],"enumerations":[{"name":"OrderStatus","properties":["PLACED","PAID","CANCELLED"]}],"valueObjects":[],"commands":[{"name":"PlaceOrder","api_verb":"POST","outputEvents":["OrderPlaced"]}],"events":[{"name":"OrderPlaced","outputCommands":[]}]}

- Function Requirements
Add functionality to cancel an order. When an order is cancelled, it should update the order status, and update the inventory.

[OUTPUT]
\`\`\`json
{"actions":[{"objectType":"Command","args":{"commandName":"CancelOrder","api_verb":"PUT","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"cancellationReason"}],"outputEventNames":["OrderCancelled"],"actor":"user"}},{"objectType":"Event","args":{"eventName":"OrderCancelled","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"cancellationReason"},{"name":"cancellationDate","type":"Date"}],"outputCommandNames":["UpdateInventory"]}},{"objectType":"Aggregate","args":{"properties":[{"name":"cancellationReason"},{"name":"cancellationDate","type":"Date"}]}}]}
\`\`\`

`
    }

    _getUserPrompt(esValue, targetAggregate, description){
        return `Now let's process the user's input.
[INPUT]
- Existing Event Storming Model
${JSON.stringify(ESValueSummarizeUtil_OnlyName.getFilteredSummarizedESValue(esValue))}

- Aggregate info to add event and command
${JSON.stringify(this.__getFilteredAggregateValueWithProperties(esValue, esValue.elements[targetAggregate.boundedContext.id], targetAggregate))}

- Function Requirements
${description}

[OUTPUT]
\`\`\`json
`
    }

    __getFilteredAggregateValueWithProperties(esValue, boundedContext, aggregate){
        const summarizedAggregateValue = ESValueSummarizeUtil.getSummarizedAggregateValue(esValue, boundedContext, aggregate)

        let filteredAggregateValue = {
            name: summarizedAggregateValue.name,
            properties: summarizedAggregateValue.properties,
            enumerations: summarizedAggregateValue.enumerations.map(enumeration => {
                return {
                    name: enumeration.name,
                    properties: enumeration.items
                }
            }),
            valueObjects: summarizedAggregateValue.valueObjects.map(valueObject => {
                return {
                    name: valueObject.name,
                    properties: valueObject.properties
                }
            }),
            commands: summarizedAggregateValue.commands.map(command => {
                return {
                    name: command.name,
                    api_verb: command.api_verb,
                    outputEvents: (command.outputEvents) ? command.outputEvents.map(event => event.name) : []
                }
            }),
            events: summarizedAggregateValue.events.map(event => {
                return {
                    name: event.name,
                    outputCommands: (event.outputCommands) ? event.outputCommands.map(command => command.name) : []
                }
            })
        }

        return filteredAggregateValue
    }


    createModel(text){
        if(this.state !== 'end') {
            console.log(`[*] ${this.generatorName}에서 결과 생성중... (현재 출력된 문자 수: ${text.length})`)

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text
            }
        }

        try {

            console.log(`[*] ${this.generatorName}에서 결과 파싱중...`, {text})


            let actions = GlobalPromptUtil.parseToJson(text).actions
            this._restoreActions(actions, this.inputedParams.esValue, this.inputedParams.targetAggregate)

            const createdESValue = ESActionUtil.getActionAppliedESValue(actions, this.inputedParams.userInfo, this.inputedParams.information, this.inputedParams.esValue)
            const elementModifyInfo = this._createElementModifyInfo(actions, createdESValue)


            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    actions: actions,
                    createdESValue: createdESValue,
                    elementModifyInfo: elementModifyInfo
                },
                modelRawValue: text,
                inputedParams: this.inputedParams
            }
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, {outputResult})
            console.log(`### Aggregate Inside에서 생성한 액션 정보 ###`)
            console.log(JSON.stringify(outputResult.modelValue.actions, null, 2))

            return outputResult

        } catch(e) {

            console.error(`[!] ${this.modelName}에서 결과 파싱중에 오류 발생!`, {text, error:e})
            console.error(e)

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text,
                inputedParams: this.inputedParams,
                isError: true
            }

        }
    }

    _restoreActions(actions, esValue, targetAggregate) {
        for(let action of actions){
            switch(action.objectType){
                case "Aggregate":
                    action.ids = {
                        boundedContextId: targetAggregate.boundedContext.id,
                        aggregateId: targetAggregate.id
                    }
                    break

                case "Command":
                    action.ids = {
                        boundedContextId: targetAggregate.boundedContext.id,
                        aggregateId: targetAggregate.id,
                        commandId: `cmd-${action.args.commandName}`
                    }                            
                    break

                case "Event":
                    action.ids = {
                        boundedContextId: targetAggregate.boundedContext.id,
                        aggregateId: targetAggregate.id,
                        eventId: `evt-${action.args.eventName}`
                    }
                    break

                case "Enumeration":
                    action.ids = {
                        boundedContextId: targetAggregate.boundedContext.id,
                        aggregateId: targetAggregate.id,
                        enumerationId: this.__getIdByNameInAggregateRoot(action.args.enumerationName, "Enumeration", targetAggregate) 
                    }
                    break

                case "ValueObject":
                    action.ids = {
                        boundedContextId: targetAggregate.boundedContext.id,
                        aggregateId: targetAggregate.id,
                        valueObjectId: this.__getIdByNameInAggregateRoot(action.args.valueObjectName, "ValueObject", targetAggregate) 
                    }
                    break
            }
        }

        for(let action of actions){
            switch(action.objectType){
                case "Command":
                    if(action.args && action.args.outputEventNames)
                        action.args.outputEventIds = action.args.outputEventNames
                            .map(name => this.__getIdByNameInEsValue(name, actions, esValue))
                        .filter(id => id)
                    break
                
                case "Event":
                    if(action.args && action.args.outputCommandNames)
                        action.args.outputCommandIds = action.args.outputCommandNames.map(name => {
                            return {
                                commandId: this.__getIdByNameInEsValue(name, actions, esValue),
                                relatedAttribute: "",
                                reason: ""
                            }
                        }).filter(outputCommand => outputCommand.commandId)
                    break
            }
        }
    }

    __getIdByNameInAggregateRoot(name, objectType, targetAggregate){
        if(targetAggregate.aggregateRoot &&
            targetAggregate.aggregateRoot.entities &&
            targetAggregate.aggregateRoot.entities.elements
        ) {
            for(let element of Object.values(targetAggregate.aggregateRoot.entities.elements)){
                if(element && element.name === name && element.id)
                    return element.id
            }
        }

        switch(objectType){
            case "Enumeration":
                return `enum-${name}`
            case "ValueObject":
                return `vo-${name}`
        }
    }

    __getIdByNameInEsValue(name, actions, esValue){
        for(let action of actions){
            if(action.args && action.args.commandName && action.args.commandName === name)
                return action.ids.commandId
            if(action.args && action.args.eventName && action.args.eventName === name)
                return action.ids.eventId
        }

        for(let element of Object.values(esValue.elements)){
            if(element && element.name === name && element.id)
                return element.id
        }

        return null
    }

    _createElementModifyInfo(actions, createdESValue){
        let elementModifyInfo = {}

        for(let action of actions){
            switch(action.objectType){
                case "Aggregate":
                case "Enumeration":
                case "ValueObject":
                    if(action.ids && action.ids.aggregateId && !elementModifyInfo[action.ids.aggregateId])
                        elementModifyInfo[action.ids.aggregateId] = createdESValue.elements[action.ids.aggregateId]
                    break
                    
                case "Command":
                    if(action.ids && action.ids.commandId)
                        elementModifyInfo[action.ids.commandId] = createdESValue.elements[action.ids.commandId]
                    break
                
                case "Event":
                    if(action.ids && action.ids.eventId)
                        elementModifyInfo[action.ids.eventId] = createdESValue.elements[action.ids.eventId]
                    break
            }
        }

        return elementModifyInfo
    }
}


module.exports = AggregateInsideGenerator;