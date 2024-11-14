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

            for(let optionKey of ["description", "targetAggregate", "esValue", "userInfo", "information", "leftRetryCount"])
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

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {error:e})
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
3. Properties that are used as events or commands must exist in the Aggregate. If they don't, create them through an action.
4. When adding new properties to an aggregate, you can use native Java data types such as String, Long, Integer, etc. for aggregate properties, or you can use predefined properties: Address, Portrait, Rating, Money, Email. Other properties must be defined as ValueObject or Enumeration or Entity in the corresponding aggregation.
5. When you add a property to an entity or value object, as with aggregate, if the property you want to use does not exist, you must add a new ValueObject or Enumeration directly.
6. If the event to be generated additionally calls other commands. Please reference the existing event storming  information passing the name of that command and add it.
7. When using the value of an Enumeration or ValueObject or Entity in an Aggregate Root, you must use its class name, not the type of the object's Id. Ex) Integer -> OrderStatus
8. Consider using ValueObject and Entity wherever possible.
9. If you want to specify it as an array, use 'List<ClassName>'. Ex) List<Address>
10. Note that updates and deletes require the Aggregate's primary key to be included in the event or command to distinguish them.
11. Do not write comments in the output JSON object.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "thoughtProcess": {
        "requirements": {
            "summary": "<Brief summary of the requirements>",
            "keyPoints": [
                "<Key point 1>",
                "<Key point 2>",
                "..."
            ]
        },
        "analysis": {
            "existingComponents": {
                "commands": ["<existing command names>"],
                "events": ["<existing event names>"],
                "properties": ["<existing property names>"]
            },
            "missingComponents": {
                "commands": ["<needed command names>"],
                "events": ["<needed event names>"],
                "properties": ["<needed property names>"]
            }
        },
        "decisions": [
            {
                "decision": "<What was decided>",
                "reasoning": "<Why this decision was made>",
                "impact": ["<Impact 1>", "<Impact 2>", "..."]
            }
        ]
    },
    "actions": [
        {
            // This attribute indicates what type of object information is being modified.
            // Choose one from Event, Command, Aggregate, Enumeration, ValueObject, Entity.
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
ValueObjects are immutable objects defined by their attributes rather than their identity.
They are used to group related attributes that should be treated as a single unit.

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

# objectType: Entity
- Description
If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an Entity.
Unlike ValueObjects, Entities are mutable objects with their own identity and lifecycle.
They represent complex domain concepts that don't qualify as Aggregates but need more flexibility than ValueObjects.

- Return format
{
    "objectType": "Entity",
    "args": {
        "entityName": "<entityName>",
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

`
    }

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- Existing Event Storming Model
{"userService":{"name":"userService","actors":[{"name":"Admin"},{"name":"User"}],"aggregates":{"User":{"name":"User","enumerations":[{"name":"UserStatus"}],"valueObjects":[{"name":"UserProfile"}],"commands":[{"name":"RegisterUser","api_verb":"POST","outputEvents":["UserRegistered"]},{"name":"UpdateUserStatus","api_verb":"PUT","outputEvents":["UserStatusUpdated"]}],"events":[{"name":"UserRegistered","outputCommands":["SendWelcomeNotification"]},{"name":"UserStatusUpdated","outputCommands":[]}]}}},"notificationService":{"name":"notificationService","actors":[{"name":"System"}],"aggregates":{"Notification":{"name":"Notification","enumerations":[{"name":"NotificationType"}],"valueObjects":[{"name":"NotificationContent"}],"commands":[{"name":"SendWelcomeNotification","api_verb":"POST","outputEvents":["WelcomeNotificationSent"]},{"name":"SendStatusNotification","api_verb":"POST","outputEvents":["StatusNotificationSent"]}],"events":[{"name":"WelcomeNotificationSent","outputCommands":[]},{"name":"StatusNotificationSent","outputCommands":[]}]}}}}

- Aggregate info to add event and command
{"name":"User","properties":[{"name":"userId","type":"Long"},{"name":"email","type":"Email"},{"name":"userStatus","type":"UserStatus"},{"name":"profile","type":"UserProfile"}],"enumerations":[{"name":"UserStatus","properties":["ACTIVE","INACTIVE","SUSPENDED"]}],"valueObjects":[{"name":"UserProfile","properties":[{"name":"nickname"},{"name":"bio"},{"name":"joinDate","type":"Date"}]}],"commands":[{"name":"RegisterUser","api_verb":"POST","outputEvents":["UserRegistered"]},{"name":"UpdateUserStatus","api_verb":"PUT","outputEvents":["UserStatusUpdated"]}],"events":[{"name":"UserRegistered","outputCommands":["SendWelcomeNotification"]},{"name":"UserStatusUpdated","outputCommands":[]}]}

- Function Requirements
{"restructuredQuestions":[{"mainRequest":"Add email verification functionality to the user registration process","subRequests":{"aggregateChanges":["Add PENDING and VERIFIED states to UserStatus enumeration: UserStatus { PENDING, VERIFIED, ACTIVE, INACTIVE, SUSPENDED }","Add verificationToken property of type String to User aggregate","Add verificationDate property of type Date to User aggregate","Add verificationExpiryDate property of type Date to User aggregate"],"commandChanges":["Add VerifyEmail command with parameters: userId and verificationToken","Add ResendVerificationEmail command with parameter: userId","Modify RegisterUser command to set initial status as PENDING and generate verificationToken"],"eventChanges":["Add EmailVerificationRequested event containing userId, email, and verificationToken","Add EmailVerified event containing userId and verificationDate","Add VerificationEmailResent event containing userId and newVerificationToken"],"policyChanges":["Users must verify their email before accessing certain features","Verification token should expire after 24 hours","Maximum 3 verification email resend attempts per day"]},"cautions":{"technicalCautions":["Ensure verification tokens are securely generated using cryptographic functions","Implement token expiration mechanism using verificationExpiryDate","Handle concurrent verification attempts for the same user"],"businessCautions":["Consider resend verification email functionality with cool-down period","Define clear user limitations before verification","Implement clear error messages for expired or invalid tokens"],"securityCautions":["Protect verification endpoints from brute force attacks using rate limiting","Implement rate limiting for verification attempts (max 5 attempts per hour)","Ensure verification tokens are single-use only"]},"dependencies":["NotificationService for sending verification emails","Update UserProfile ValueObject to include verificationStatus"]}]}

[OUTPUT]
\`\`\`json
{"thoughtProcess":{"requirements":{"summary":"Implement email verification functionality for new user registrations with security measures and token management","keyPoints":["Email verification flow for new registrations","Token-based verification system","Resend verification capability","Status tracking for verification process","Security considerations for verification process"]},"analysis":{"existingComponents":{"commands":["RegisterUser","UpdateUserStatus"],"events":["UserRegistered","UserStatusUpdated"],"properties":["userId","email","userStatus","profile"]},"missingComponents":{"commands":["VerifyEmail","ResendVerificationEmail"],"events":["EmailVerificationRequested","EmailVerified","VerificationEmailResent"],"properties":["verificationToken","verificationDate","verificationExpiryDate"]}},"decisions":[{"decision":"Add PENDING and VERIFIED states to UserStatus","reasoning":"Track user verification state separately from active/inactive status","impact":["Allows differentiation between unverified and verified users","Enables verification-based access control"]},{"decision":"Create separate commands for verification and resend","reasoning":"Follow single responsibility principle and enable separate rate limiting","impact":["Better security control per operation","Clearer audit trail","Simplified error handling"]},{"decision":"Add verification tracking properties to User aggregate","reasoning":"Need to manage verification process state and security","impact":["Enables token validation","Supports expiration mechanism","Allows verification attempt tracking"]}]},"actions":[{"objectType":"Command","args":{"commandName":"VerifyEmail","api_verb":"PUT","properties":[{"name":"userId","type":"Long","isKey":true},{"name":"verificationToken"}],"outputEventNames":["EmailVerified"],"actor":"User"}},{"objectType":"Command","args":{"commandName":"ResendVerificationEmail","api_verb":"POST","properties":[{"name":"userId","type":"Long","isKey":true}],"outputEventNames":["VerificationEmailResent"],"actor":"User"}},{"objectType":"Event","args":{"eventName":"EmailVerified","properties":[{"name":"userId","type":"Long","isKey":true},{"name":"verificationDate","type":"Date"}]}},{"objectType":"Event","args":{"eventName":"EmailVerificationRequested","properties":[{"name":"userId","type":"Long","isKey":true},{"name":"email","type":"Email"},{"name":"verificationToken"}],"outputCommandNames":["SendWelcomeNotification"]}},{"objectType":"Event","args":{"eventName":"VerificationEmailResent","properties":[{"name":"userId","type":"Long","isKey":true},{"name":"newVerificationToken"}]}},{"objectType":"Aggregate","args":{"properties":[{"name":"verificationToken"},{"name":"verificationDate","type":"Date"},{"name":"verificationExpiryDate","type":"Date"}]}},{"objectType":"Enumeration","args":{"enumerationName":"UserStatus","properties":[{"name":"PENDING"},{"name":"VERIFIED"}]}}]}
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

- Final Check
* Every property used in Commands and Events must exist in the Aggregate (add if missing)
* Use proper data types (avoid String when domain-specific types exist)
* Include primary key (isKey: true) for update/delete operations
* Consider using ValueObjects for related property groups
* Check if new Events should trigger any existing Commands
* Ensure consistent naming conventions (PascalCase for types, camelCase for properties)
* Verify all required properties are included in Commands/Events based on the business requirements
* The command you create must call the event for that command. Ex) CreateCustomer -> CustomerCreated
* When using the value of an Enumeration or ValueObject or Entity in an Aggregate Root, you must use its class name, not the type of the object's Id. Ex) Integer -> OrderStatus

[OUTPUT]
\`\`\`json
`
    }

    __getFilteredAggregateValueWithProperties(esValue, boundedContext, aggregate){
        const summarizedAggregateValue = ESValueSummarizeUtil.getSummarizedAggregateValue(esValue, boundedContext, aggregate)

        let filteredAggregateValue = {
            name: summarizedAggregateValue.name,
            properties: summarizedAggregateValue.properties,
            entities: summarizedAggregateValue.entities.map(entity => {
                return {
                    name: entity.name,
                    properties: entity.properties
                }
            }),
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

            this.inputedParams.leftRetryCount -= 1
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
                
                case "Entity":
                    action.ids = {
                        boundedContextId: targetAggregate.boundedContext.id,
                        aggregateId: targetAggregate.id,
                        generalClassId: this.__getIdByNameInAggregateRoot(action.args.entityName, "Entity", targetAggregate) 
                    }
                    action.objectType = "GeneralClass"
                    action.args.generalClassName = action.args.entityName
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
            case "Entity":
                return `gc-${name}`
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
                case "Entity":
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