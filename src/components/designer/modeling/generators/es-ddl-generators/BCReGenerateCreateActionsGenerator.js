const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESActionUtil = require("./modules/ESActionsUtil")
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class BCReGenerateCreateActionsGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);
        
        this.model = "gpt-4o-2024-11-20"
        this.generatorName = 'BCReGenerateCreateActionsGenerator'
        this.inputedParams = null
        this.isFirstResponse = true

        this.preferredLanguage = this.preferredLanguage ? this.preferredLanguage : "English"
        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["targetBoundedContext", "description", "draftOption", "esValue", "userInfo", "information", "isAccumulated"])
                if(this.client.input[optionKey] === undefined) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                targetBoundedContext: this.client.input.targetBoundedContext,
                description: this.client.input.description,
                draftOption: this.client.input.draftOption,
                esValue: this.client.input.esValue,
                userInfo: this.client.input.userInfo,
                information: this.client.input.information,
                isAccumulated: this.client.input.isAccumulated
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})

            this.esAliasTransManager = new ESAliasTransManager(this.inputedParams.esValue)
            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.targetBoundedContext, this.inputedParams.description, this.inputedParams.draftOption, this.inputedParams.esValue, this.inputedParams.isAccumulated, this.esAliasTransManager
            )

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            this.isFirstResponse = true
            return prompt

        } catch(e) {

            console.error(`[!] GetRelatedESValueByDDLGenerator에 대한 프롬프트 생성 도중에 오류 발생!`, {esValue, ddl, error:e})
            throw e

        }
    }

    _getSystemPrompt(){
        return this.__getFrontGuidePrompt() +
            ESValueSummarizeUtil_OnlyNameWithId.getGuidePrompt() +
            this.__getOutputSyntaxGuidePrompt() +
            this.__getExamplePrompt() +
            GlobalPromptUtil.getJsonCompressGuidePrompt()
    }

    __getFrontGuidePrompt(){
        return `In your current event stemming model, you need to write actions to add elements inside a particular Bounded Context, following the structure provided by the user.

Please follow these rules.
1. You can utilize basic Java data types such as String and Long for Aggregate properties, or predefined properties such as Address, Portrait, Rating, Money, and Email. Other properties must be defined in the corresponding Aggregate as Enumeration or ValueObject or Entity.
2. The name of each object should be written in English, and the rest of the content (alias, etc.) should be written in ${this.preferredLanguage} language so that it is easily understood by the user.
3. When using the value of an Enumeration or ValueObject or Entity in an Aggregate Root, you must use its class name, not the type of the object's Id. Ex) Integer -> OrderStatus
4. If you want to specify it as an array, use 'List<ClassName>'. Ex) List<Address>
5. Commands must raise an event for themselves. e.g. CreateCustomer -> CustomerCreated
6. Note that updates and deletes require the Aggregate's primary key to be included in the event or command to distinguish them.
7. An Aggregate should have only one primary key attribute. If you need a composite key, create an associated ValueObject and assign it as the primary key for the Aggregate.
8. Avoid having only one property in a ValueObject, and put as many related properties as possible.
9. Enumerations that are not in the user's proposed structure can be extracted from the requirements.
10. Make sure to create all Aggregates, Entities, and ValueObjects in the user's proposed structure with the appropriate actions.
11. The ValueObject, Entity, and Enumeration you create must be used as properties in other Aggregates.
12. Do not recreate ValueObjects, Entities, or Enumerations that already exist. If they do exist, recycle them.
13. Do not write comments in the output JSON object.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
   "thoughtProcess": {
       // Analyse your users' requirements to extract as much of their requirements as you can use for event stemming.
       // Analyse which objects in the user's proposed structure match the requirements.
       // Extract requirements that are not reflected in existing event storming values.
       "step1-requirementsAnalysis": {
           "thought": "thought process for requirements analysis",
           "reflection": "Re-evaluate your thought to see if there's anything you can strengthen.",
           "result": {
               "requirements": [
                   {name: "requirement-name", description: "requirement-description", matchedUserObjectNames: ["<matchedUserObjectName>", ...]},
                   ...
               ]
           }
       },

       // Analyse what actions will actually implement the requirements you've identified.
       "step2-designPossibleActions": {
           "thought": "thought process for action design",
           "reflection": "Review your thought to see if there's anything you can strengthen.",
           "result": {
               "requirements": {
                   "requirement-name": ["<actionName>", ...]
               }
           }
       },

       // Determine if any of the event actions you created have dependencies, such as calling other existing events or commands.
       "step3-determineDependencies": {
           "thought": "thought process for dependency analysis",
           "reflection": "Review your thought to see if there's anything you can strengthen.",
           "result": {
               "actions": {
                   "<actionName>": {
                       "dependencies": ["<eventOrCommandName>", ...]
                   }
               }
           }
       },

       // Synthesise the information you already have to create a final action.
       // Fill in the details of all the actions from the previous steps.
       // If you want to modify an existing action, create a name for it and rewrite the entire action.
       // Do not create duplicate commands or events that perform the same role as existing ones.
       "step4-generateActions": {
           "thought": "thought process for action generation",
           "reflection": "Review your thought to see if there's anything you can strengthen.",
           "result": {
               "actions": [
                   {
                       // Write the ActionName that you utilized in the previous steps
                       "actionName": "<actionName>",

                       // This attribute indicates what type of object information is being modified.
                       // Choose one from Aggregate, Command, Event, ReadModel, Enumeration, ValueObject, Entity
                       "objectType": "<objectType>",

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
       },

      "step5-evaluateActions": {
         "thought": "Evaluate the completeness and quality of generated actions",
         "reflection": "Consider if the actions fully address all requirements and follow best practices",
         "result": {
            "evaluationCriteria": {
               "requirementsCoverage": {
                  "score": "<0-100>",
                  "details": ["<requirement coverage detail>", ...],
                  "missingAspects": ["<missing requirement>", ...]
               },
               "domainModelQuality": {
                  "score": "<0-100>",
                  "details": ["<domain model quality detail>", ...],
                  "improvements": ["<suggested improvement>", ...]
               },
               "eventFlowCompleteness": {
                  "score": "<0-100>",
                  "details": ["<event flow detail>", ...],
                  "gaps": ["<identified gap>", ...]
               },
               "bestPracticesAlignment": {
                  "score": "<0-100>",
                  "details": ["<best practice alignment detail>", ...],
                  "violations": ["<best practice violation>", ...]
               },
               "structureAlignment": {
                  "score": "<0-100>",
                  "details": ["<structure alignment detail>", ...],
                  "matchedElements": [
                    {
                       "suggestedElement": "<element name from user structure>",
                       "implementedActions": ["<action name>", ...],
                       "missingAspects": ["<missing aspect>", ...]
                    }
                 ],
                 "unmatchedElements": ["<unimplemented element from user structure>", ...]
              }
            },
            "overallScore": "<0-100>",
            "recommendedImprovements": [
               {
                  "area": "<improvement area>",
                  "description": "<improvement description>",
                  "suggestedActions": ["<actionName>", ...]
               }
            ],
            "needsIteration": "<true|false>" // true if overallScore < 80
         }
      }
   }
}
\`\`\`

I will explain the ids and args used in each objectType.
You cannot use any arbitrary parameters not described in this explanation in ids or args.

# objectType: Aggregate
- Description
aggregateId can be used when defining Enumeration, ValueObject, Entity that belong to an Aggregate.

- Return format
{
    "objectType": "Aggregate",
    "ids": {
        "aggregateId": "<aggregateId>"
    },
    "args": {
        "aggregateName": "<aggregateName>",
        "aggregateAlias": "<aggregateAlias>",

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ]
    }
}

# objectType: Command
- Description
Generate commands in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "Command",
    "ids": {
        "aggregateId": "<aggregateId>",
        "commandId": "<commandId>"
    },
    "args": {
        "commandName": "<commandName>",
        "commandAlias": "<commandAlias>",
        "api_verb": <"POST" | "DELETE" | "PUT">,

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ],

        "outputEventIds": ["<outputEventId>"], // List of event IDs generated by this command. Must write existing event IDs.
        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, etc. If there is no specific actor, leave it empty.
    }
}

# objectType: Event
- Description
Generate events in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "Event",
    "ids": {
        "aggregateId": "<aggregateId>",
        "eventId": "<eventId>"
    },
    "args": {
        "eventName": "<eventName>",
        "eventAlias": "<eventAlias>",

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
        "outputCommandIds": [{
            "commandId": "<outputCommandId>", // The ID of the command being called. Must write existing command IDs.
            "relatedAttribute": "<relatedAttribute>", // Specify which attribute is being updated by calling the command. Write the attribute name of the Aggregate to which the called command belongs.
            "reason": "<reason>" // Specify the reason for calling this command.
        }]
    }
}

# objectType: ReadModel
- Description
Generate read models in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "ReadModel",
    "ids": {
        "aggregateId": "<aggregateId>",
        "readModelId": "<readModelId>"
    },
    "args": {
        "readModelName": "<readModelName>",
        "readModelAlias": "<readModelAlias>",
        "isMultipleResult": <true|false>,

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ],

        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, etc. If there is no specific actor, leave it empty.
    }
}

# objectType: Enumeration
- Description
If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an enumeration.

- Return format
{
    "objectType": "Enumeration",
    "ids": {
        "aggregateId": "<aggregateId>",
        "enumerationId": "<enumerationId>"
    },
    "args": {
        "enumerationName": "<enumerationName>",
        "enumerationAlias": "<enumerationAlias>",
        
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
    "ids": {
        "aggregateId": "<aggregateId>",
        "valueObjectId": "<valueObjectId>"
    },
    "args": {
        "valueObjectName": "<valueObjectName>",
        "valueObjectAlias": "<valueObjectAlias>",

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
    "ids": {
        "aggregateId": "<aggregateId>",
        "entityId": "<entityId>"
    },
    "args": {
        "entityName": "<entityName>",
        "entityAlias": "<entityAlias>",

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
- Summarized Existing EventStorming Model
{"bc-order":{"id":"bc-order","name":"orderservice","actors":[{"id":"actor-customer","name":"Customer"}],"aggregates":{}},"bc-inventory":{"id":"bc-inventory","name":"inventoryservice","actors":[],"aggregates":{"agg-inventory":{"id":"agg-inventory","name":"Inventory","commands":[{"id":"cmd-update-stock","name":"UpdateStock","api_verb":"PUT","outputEventIds":["evt-stock-updated"]}],"events":[{"id":"evt-stock-updated","name":"StockUpdated","outputCommandIds":[]}]}}}}

- Bounded Context to Generate Actions
orderservice

- Functional Requirements
We need to implement a basic order management system with the following requirements:

1. Order Creation:
- Customers should be able to create orders with a single item
- Each order must include product ID and quantity
- Orders must have a shipping address

2. Order Management:
- Customers should be able to cancel orders
- The system should maintain basic order status (PENDING, CONFIRMED, CANCELLED)

3. Order Inquiry:
- Customers should be able to view their order details
- Order details should include order status, product information, quantity, and shipping address

- Suggested Structure
[{"aggregate":{"name":"Order","alias":"Customer Order"},"valueObjects":[{"name":"ShippingAddress","alias":"Delivery Address"}]}]

[OUTPUT]
\`\`\`json
{"thoughtProcess":{"step1-requirementsAnalysis":{"thought":"The requirements describe a simple order system with creation, cancellation, and inquiry functionality.","reflection":"Added inquiry requirement needs a read model for viewing order details.","result":{"requirements":[{"name":"order-creation","description":"Create new orders","matchedUserObjectNames":["Order","ShippingAddress"]},{"name":"order-management","description":"Handle order cancellations","matchedUserObjectNames":["Order"]},{"name":"order-inquiry","description":"View order details","matchedUserObjectNames":["Order","ShippingAddress"]}]}},"step2-designPossibleActions":{"thought":"We need basic commands for order creation and cancellation with their corresponding events.","reflection":"The actions are minimal but sufficient for the basic requirements.","result":{"requirements":{"order-creation":["CreateOrder"],"order-management":["CancelOrder"],"order-inquiry":["GetOrderDetails"]}}},"step3-determineDependencies":{"thought":"Order creation will need to update inventory. Cancellation is a simple status change.","reflection":"The dependencies are minimal and straightforward.","result":{"actions":{"CreateOrder":{"dependencies":["UpdateStock"]}}}},"step4-generateActions":{"thought":"Generate the basic aggregate, commands, and events needed.","reflection":"Keep the structure simple with only essential properties.","result":{"actions":[{"actionName":"DefineOrderAggregate","objectType":"Aggregate","ids":{"aggregateId":"agg-order"},"args":{"aggregateName":"Order","aggregateAlias":"Customer Order","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"orderStatus","type":"OrderStatus"},{"name":"productId","type":"Long"},{"name":"quantity","type":"Integer"}]}},{"actionName":"DefineOrderStatusEnum","objectType":"Enumeration","ids":{"aggregateId":"agg-order","enumerationId":"enum-order-status"},"args":{"enumerationName":"OrderStatus","enumerationAlias":"Order Status","properties":[{"name":"PENDING"},{"name":"CONFIRMED"},{"name":"CANCELLED"}]}},{"actionName":"DefineShippingAddressVO","objectType":"ValueObject","ids":{"aggregateId":"agg-order","valueObjectId":"vo-shipping-address"},"args":{"valueObjectName":"ShippingAddress","valueObjectAlias":"Delivery Address","properties":[{"name":"street"},{"name":"city"},{"name":"zipCode"}]}},{"actionName":"CreateOrder","objectType":"Command","ids":{"aggregateId":"agg-order","commandId":"cmd-create-order"},"args":{"commandName":"CreateOrder","commandAlias":"Create New Order","api_verb":"POST","properties":[{"name":"productId","type":"Long"},{"name":"quantity","type":"Integer"},{"name":"shippingAddress","type":"ShippingAddress"}],"outputEventIds":["evt-order-created"],"actor":"Customer"}},{"actionName":"CancelOrder","objectType":"Command","ids":{"aggregateId":"agg-order","commandId":"cmd-cancel-order"},"args":{"commandName":"CancelOrder","commandAlias":"Cancel Order","api_verb":"PUT","properties":[{"name":"orderId","type":"Long","isKey":true}],"outputEventIds":["evt-order-cancelled"],"actor":"Customer"}},{"actionName":"OrderCreated","objectType":"Event","ids":{"aggregateId":"agg-order","eventId":"evt-order-created"},"args":{"eventName":"OrderCreated","eventAlias":"Order Created","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"productId","type":"Long"},{"name":"quantity","type":"Integer"}],"outputCommandIds":[{"commandId":"cmd-update-stock","relatedAttribute":"stockQuantity","reason":"Update inventory stock level after order creation"}]}},{"actionName":"OrderCancelled","objectType":"Event","ids":{"aggregateId":"agg-order","eventId":"evt-order-cancelled"},"args":{"eventName":"OrderCancelled","eventAlias":"Order Cancelled","properties":[{"name":"orderId","type":"Long","isKey":true}],"outputCommandIds":[]}},{"actionName":"GetOrderDetails","objectType":"ReadModel","ids":{"aggregateId":"agg-order","readModelId":"read-order-details"},"args":{"readModelName":"OrderDetails","readModelAlias":"Order Details View","isMultipleResult":false,"properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"orderStatus","type":"OrderStatus"},{"name":"productId","type":"Long"},{"name":"quantity","type":"Integer"},{"name":"shippingAddress","type":"ShippingAddress"}],"actor":"Customer"}}]}},"step5-evaluateActions":{"thought":"Evaluate the completeness and quality of the generated order management system actions","reflection":"Consider if all requirements are met and best practices are followed","result":{"evaluationCriteria":{"requirementsCoverage":{"score":"95","details":["Order creation with product and shipping details implemented","Order cancellation functionality provided","Order details view with all required information"],"missingAspects":["No explicit confirmation flow defined"]},"domainModelQuality":{"score":"90","details":["Clear separation of Aggregate, ValueObject, and Enumeration","Proper use of ShippingAddress as ValueObject","Well-defined OrderStatus enumeration"],"improvements":["Could consider adding validation rules for quantity and address"]},"eventFlowCompleteness":{"score":"85","details":["Basic event flow for order creation and cancellation","Integration with inventory service through UpdateStock"],"gaps":["No compensation events for failed inventory updates"]},"bestPracticesAlignment":{"score":"90","details":["Commands and events properly named","Aggregate root identified with proper ID","Clear actor specification in commands"],"violations":["Some properties could have more specific types"]},"structureAlignment":{"score":"100","details":["All elements from suggested structure implemented","Order aggregate properly created with required properties","ShippingAddress value object implemented as suggested"],"matchedElements":[{"suggestedElement":"Order","implementedActions":["DefineOrderAggregate","CreateOrder","CancelOrder","GetOrderDetails"],"missingAspects":[]},{"suggestedElement":"ShippingAddress","implementedActions":["DefineShippingAddressVO"],"missingAspects":[]}],"unmatchedElements":[]}},"overallScore":"92","recommendedImprovements":[{"area":"Order Processing","description":"Add explicit order confirmation flow","suggestedActions":["CreateConfirmOrderCommand","AddOrderConfirmedEvent"]},{"area":"Error Handling","description":"Implement compensation logic for inventory updates","suggestedActions":["AddOrderFailedEvent","CreateRollbackInventoryCommand"]}],"needsIteration":false}}}}
\`\`\`

`
    }

    _getUserPrompt(targetBoundedContext, description, draftOption, esValue, isAccumulated, esAliasTransManager){
        let targetBCRemovedESValue = JSON.parse(JSON.stringify(esValue))
        if(!isAccumulated)
            this._removePrevBoundedContextRelatedElements(targetBoundedContext.name, targetBCRemovedESValue)

        return `Now let's process the user's input.
[INPUT]
- Summarized Existing EventStorming Model
${JSON.stringify(ESValueSummarizeUtil_OnlyNameWithId.getFilteredSummarizedESValue(esValue, esAliasTransManager))}

- Bounded Context to Generate Actions
${targetBoundedContext.name}

- Functional Requirements
${description}

- Suggested Structure
${JSON.stringify(draftOption)}

- Final Check
* Have you adequately addressed all of your users' needs?
* Are there any properties that are redundant and unnecessary?
* Did you write the name property of the object you created in English and the alias property in ${this.preferredLanguage} language?
* Are you using the ValueObject, Entity, or Enumeration you created as properties in other Aggregates?
* Did you create all of the ValueObjects and Enitities in the user's proposed structure as actions?
* Are you creating duplicate actions that do the same thing as existing events and commands?
* Are there any unnecessary actions that recreate ValueObjects, Entities, or Enumerations that already exist?

[OUTPUT]
\`\`\`json
`
    }


    createModel(text){
        const isFirstResponse = this.isFirstResponse
        this.isFirstResponse = false

        if(this.state !== 'end') {
            console.log(`[*] ${this.generatorName}에서 결과 생성중... (현재 출력된 문자 수: ${text.length})`)

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text,
                isFirstResponse: isFirstResponse
            }
        }

        try {

            console.log(`[*] ${this.generatorName}에서 결과 파싱중...`, {text})
            const aiOutput = GlobalPromptUtil.parseToJson(text)
            let actions = aiOutput.thoughtProcess["step4-generateActions"].result.actions
            actions = this.esAliasTransManager.transToUUIDInActions(actions)
            this._restoreActions(actions, this.inputedParams.esValue, this.inputedParams.targetBoundedContext.name)
            actions = this._filterActions(actions)
            
            let esValueToModify = JSON.parse(JSON.stringify(this.inputedParams.esValue))

            let removedElements = []
            if(!this.inputedParams.isAccumulated)
                removedElements = this._removePrevBoundedContextRelatedElements(this.inputedParams.targetBoundedContext.name, esValueToModify)

            let createdESValue = ESActionUtil.getActionAppliedESValue(actions, this.inputedParams.userInfo, this.inputedParams.information, esValueToModify)

            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    actions: actions,
                    createdESValue: createdESValue,
                    removedElements: removedElements,
                    thoughtProcess: aiOutput.thoughtProcess
                },
                modelRawValue: text,
                inputedParams: this.inputedParams,
                isFirstResponse: isFirstResponse
            }
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, {outputResult})

            return outputResult

        } catch(e) {

            console.error(`[!] ${this.modelName}에서 결과 파싱중에 오류 발생!`, {text, error:e})

            return {
                generatorName: this.generatorName,
                modelValue: null,
                modelRawValue: text,
                inputedParams: this.inputedParams,
                isError: true,
                isFirstResponse: isFirstResponse
            }

        }
    }

    _restoreActions(actions, esValue, targetBoundedContextName){
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)

        for(let action of actions){
            switch(action.objectType){
                case "Aggregate":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break

                case "Command":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }                            
                    break

                case "Event":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break

                case "Enumeration":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break

                case "ValueObject":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break
                
                case "Entity":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    action.objectType = "GeneralClass"
                    action.args.generalClassName = action.args.entityName
                    action.args.generalClassAlias = action.args.entityAlias
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

    _filterActions(actions){
        let avaliableAggregateIds = actions.filter(action => action.objectType === "Aggregate")
            .map(action => action.ids.aggregateId)

        actions = actions.filter(action => avaliableAggregateIds.includes(action.ids.aggregateId))
        return actions
    }

    _removePrevBoundedContextRelatedElements(targetBoundedContextName, esValue){
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)
        const esValueToRemove = this.__getOnlyBoundedContextRelatedSummarizedESValue(esValue, targetBoundedContextName)

        let removedElements = []
        for(let element of Object.values(esValueToRemove.elements)) {
            if(element.id === targetBoundedContext.id) continue
            esValue.elements[element.id] = null
            removedElements.push(element)
        }

        for(let relation of Object.values(esValueToRemove.relations))
            esValue.relations[relation.id] = null

        return removedElements
    }
    
    _removePrevBoundedContextRelatedElements(targetBoundedContextName, esValue){
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)
        const esValueToRemove = this.__getOnlyBoundedContextRelatedSummarizedESValue(esValue, targetBoundedContextName)

        let removedElements = []
        for(let element of Object.values(esValueToRemove.elements)) {
            if(element.id === targetBoundedContext.id) continue
            esValue.elements[element.id] = null
            removedElements.push(element)
        }

        for(let relation of Object.values(esValueToRemove.relations))
            esValue.relations[relation.id] = null

        return removedElements
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

    __getOnlyBoundedContextRelatedSummarizedESValue(esValue, targetBoundedContextName){
        const isHaveTargetBoundedContext = (targetBoundedContext, element) => {
            return (typeof element.boundedContext === "string" && element.boundedContext === targetBoundedContext.id) ||
                (element.boundedContext && element.boundedContext.id === targetBoundedContext.id)
        }
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)

        let bcRelatedESValue = {
            elements: {},
            relations: {}
        }
        bcRelatedESValue.elements[targetBoundedContext.id] = targetBoundedContext

        for(let element of Object.values(esValue.elements).filter(element => element)) {
            if(isHaveTargetBoundedContext(targetBoundedContext, element))
                bcRelatedESValue.elements[element.id] = element
        }

        for(let relation of Object.values(esValue.relations).filter(relation => relation)) {
            if(relation.sourceElement && relation.targetElement) {
                if(isHaveTargetBoundedContext(targetBoundedContext, relation.sourceElement) || 
                   isHaveTargetBoundedContext(targetBoundedContext, relation.targetElement))
                    bcRelatedESValue.relations[relation.id] = relation
            }
        }

        return bcRelatedESValue
    }

    __getTargetBoundedContext(esValue, targetBoundedContextName){
        let targetBoundedContext = null
        for(let element of Object.values(esValue.elements).filter(element => element)) {
            if(element._type === "org.uengine.modeling.model.BoundedContext") {
                if(element.name === targetBoundedContextName) targetBoundedContext = element
            }
        }
        if(!targetBoundedContext) throw new Error(`${targetBoundedContextName}에 대한 정보를 찾을 수 없습니다.`)
        return targetBoundedContext
    }
}

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
            })
        }
    }
}

module.exports = BCReGenerateCreateActionsGenerator;