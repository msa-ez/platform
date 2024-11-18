const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil")
const ESValueSummarizeUtil_OnlyName = require("./modules/ESValueSummarizeUtil_OnlyName")

class AggregateInsideQuestionShapeGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);
        
        this.model = "gpt-4o-2024-08-06"
        this.generatorName = 'AggregateInsideQuestionShapeGenerator'
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
                information: this.client.input.information,
                leftRetryCount: this.client.input.leftRetryCount
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
        return `You should make user-directed instructions for generating event storms more specific and clear to help AI generate them in the future.

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
11. The final output will always output the requirements in English, even if the user types in another language.
12. Do not write comments in the output JSON object.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "restructuredQuestions": [
        {
            "mainRequest": "...", // Core business requirement in a clear, concise statement
            "subRequests": {
                "aggregateChanges": ["..."], // Changes needed in aggregate structure (properties, value objects, etc.)
                "commandChanges": ["..."], // New or modified commands
                "eventChanges": ["..."], // New or modified events
                "policyChanges": ["..."] // Business rules or policies that need to be implemented
            },
            "cautions": {
                "technicalCautions": ["..."], // Technical implementation warnings
                "businessCautions": ["..."], // Business logic and rule considerations
                "securityCautions": ["..."] // Security and validation related warnings
            },
            "dependencies": ["..."] // Other aggregates or services that might be affected
        }
    ]
}
\`\`\`

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
이메일 인증 기능을 추가해주세요.

[OUTPUT]
\`\`\`json
{"restructuredQuestions":[{"mainRequest":"Add email verification functionality to the user registration process","subRequests":{"aggregateChanges":["Add PENDING and VERIFIED states to UserStatus enumeration: UserStatus { PENDING, VERIFIED, ACTIVE, INACTIVE, SUSPENDED }","Add verificationToken property of type String to User aggregate","Add verificationDate property of type Date to User aggregate","Add verificationExpiryDate property of type Date to User aggregate"],"commandChanges":["Add VerifyEmail command with parameters: userId and verificationToken","Add ResendVerificationEmail command with parameter: userId","Modify RegisterUser command to set initial status as PENDING and generate verificationToken"],"eventChanges":["Add EmailVerificationRequested event containing userId, email, and verificationToken","Add EmailVerified event containing userId and verificationDate","Add VerificationEmailResent event containing userId and newVerificationToken"],"policyChanges":["Users must verify their email before accessing certain features","Verification token should expire after 24 hours","Maximum 3 verification email resend attempts per day"]},"cautions":{"technicalCautions":["Ensure verification tokens are securely generated using cryptographic functions","Implement token expiration mechanism using verificationExpiryDate","Handle concurrent verification attempts for the same user"],"businessCautions":["Consider resend verification email functionality with cool-down period","Define clear user limitations before verification","Implement clear error messages for expired or invalid tokens"],"securityCautions":["Protect verification endpoints from brute force attacks using rate limiting","Implement rate limiting for verification attempts (max 5 attempts per hour)","Ensure verification tokens are single-use only"]},"dependencies":["NotificationService for sending verification emails","Update UserProfile ValueObject to include verificationStatus"]}]}
\`\`\`

[INPUT]
- Existing Event Storming Model
{"storeService":{"name":"storeService","actors":[{"name":"StoreOwner"}],"aggregates":{"Store":{"name":"Store","valueObjects":[{"name":"StoreAddress"},{"name":"BusinessHours"}],"commands":[{"name":"RegisterStore","api_verb":"POST","outputEvents":["StoreRegistered"]}],"events":[{"name":"StoreRegistered","outputCommands":[]}]}}}}

- Aggregate info to add event and command
{"name":"Store","properties":[{"name":"storeId","type":"Long"},{"name":"name","type":"String"},{"name":"address","type":"StoreAddress"},{"name":"businessHours","type":"BusinessHours"}],"valueObjects":[{"name":"StoreAddress","properties":[{"name":"street"},{"name":"city"},{"name":"zipCode"}]},{"name":"BusinessHours","properties":[{"name":"openTime"},{"name":"closeTime"}]}],"commands":[{"name":"RegisterStore","api_verb":"POST","outputEvents":["StoreRegistered"]}],"events":[{"name":"StoreRegistered","outputCommands":[]}]}

- Function Requirements
현재 상점의 운영 상태를 업데이트할 수 있는 기능이 필요합니다.

[OUTPUT]
\`\`\`json
{"restructuredQuestions":[{"mainRequest":"Add functionality to update store's operational status","subRequests":{"aggregateChanges":["Add OperationalStatus enumeration with values: OPEN, CLOSED, TEMPORARILY_CLOSED, UNDER_MAINTENANCE","Add operationalStatus property of type OperationalStatus to Store aggregate"],"commandChanges":["Add UpdateStoreStatus command with parameters: storeId and newStatus"],"eventChanges":["Add StoreStatusUpdated event containing storeId and newStatus"],"policyChanges":["Only store owner can update the operational status","Status changes should be logged with timestamp","Customers should be notified of status changes"]},"cautions":{"technicalCautions":["Ensure atomic status updates to prevent race conditions","Implement proper validation for status transitions"],"businessCautions":["Consider time zone differences for status updates","Define clear criteria for each status state"],"securityCautions":["Validate store owner's permissions before status update","Implement audit logging for all status changes"]},"dependencies":["Notification service for customer alerts","Audit service for logging status changes"]}]}
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
* All property types must be either Java native types, predefined types (Address, Portrait, Rating, Money, Email), or defined ValueObjects/Enumerations/Entities
* All update/delete operations must include the aggregate's primary key
* All names must be in English, following proper naming conventions
* All arrays must be specified using List<ClassName> format
* Check if new events need to trigger any existing commands from the event storming model
* Ensure all ValueObjects and Entities have their properties properly defined
* Verify that all required security and validation rules are included in cautions
* Consider potential impacts on other aggregates or services listed in dependencies
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


            let restructuredQuestions = GlobalPromptUtil.parseToJson(text).restructuredQuestions

            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    restructuredQuestions: restructuredQuestions
                },
                modelRawValue: text,
                inputedParams: this.inputedParams
            }
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, {outputResult})
            console.log(`### Aggregate Question Shape에서 생성한 재구성된 질문 정보 ###`)
            console.log(JSON.stringify(outputResult.modelValue.restructuredQuestions, null, 2))

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
}


module.exports = AggregateInsideQuestionShapeGenerator;