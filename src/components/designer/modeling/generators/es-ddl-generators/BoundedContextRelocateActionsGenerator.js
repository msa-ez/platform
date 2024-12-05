const JsonAIGenerator = require("../JsonAIGenerator");
const GlobalPromptUtil = require("./modules/GlobalPromptUtil");
const ESActionUtil = require("./modules/ESActionsUtil")
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil")
const ESValueSummarizeUtil_OnlyNameWithId = require("./modules/ESValueSummarizeUtil_OnlyNameWithId")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class BoundedContextRelocateActionsGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);
        
        this.model = "gpt-4o-2024-08-06"
        this.generatorName = 'BoundedContextRelocateActionsGenerator'
        this.inputedParams = null

        this.temperature = 1.0
        this.top_p = 0.6
    }
    

    createPrompt(){
        try {

            for(let optionKey of ["targetBoundedContextName", "suggestedStructures", "esValue", "userInfo", "information"])
                if(this.client.input[optionKey] === undefined) 
                    throw new Error(`${optionKey} 파라미터가 전달되지 않았습니다.`)
            this.inputedParams = {
                targetBoundedContextName: this.client.input.targetBoundedContextName,
                suggestedStructures: this.client.input.suggestedStructures,
                esValue: this.client.input.esValue,
                userInfo: this.client.input.userInfo,
                information: this.client.input.information
            }
            
            console.log(`[*] ${this.generatorName}에 대한 프롬프트 생성중...`, {inputedParams: this.inputedParams})


            this.esAliasTransManager = new ESAliasTransManager(this.inputedParams.esValue)
            const prompt = this._getSystemPrompt() + this._getUserPrompt(
                this.inputedParams.targetBoundedContextName, this.inputedParams.suggestedStructures,
                this.inputedParams.esValue, this.esAliasTransManager
            )

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            return prompt

        } catch(e) {

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {error:e})
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
        return `You will need to write generation actions to reorganise the contents of a given Bounded Context to reflect the structure you have passed to it.

Please follow these rules.
1. You can utilize basic Java data types such as String and Long for Aggregate properties, or predefined properties such as Address, Portrait, Rating, Money, and Email. Other properties must be defined in the corresponding Aggregate as Enumeration or ValueObject or Entity.
2. If the Bounded Context name is not in English, you will need to change it to an appropriate English name. ex) 고객 -> Customer Service
3. If the names of Aggregate, Enumeration, ValueObject, and Entity used in the user-supplied structure are not English, you must change them to appropriate English names.
4. Create existing Event and Command structures in the recreated structure as appropriate.
5. When using the value of an Enumeration or ValueObject or Entity in an Aggregate Root, you must use its class name, not the type of the object's Id. Ex) Integer -> OrderStatus
6. Be sure to create and follow all user-directed reconfiguration structures. If there are no objects in the existing structure that the user has directed to be reconfigured, do not create them.
7. Commands must raise an event for themselves. e.g. CreateCustomer -> CustomerCreated
8. Do not write comments in the output JSON object.

`
    }

    __getOutputSyntaxGuidePrompt() {
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
{
    "thoughtProcess": {
        "analysis": "Analyze the current structure and requirements here",
        "identifiedChanges": [
            "List the key changes that need to be made",
            "Include reasoning for each major decision"
        ],
        "structuralConsiderations": [
            "Discuss any important structural decisions",
            "Explain relationships between components"
        ],
        "potentialImpacts": [
            "Consider downstream effects of changes",
            "Note any important dependencies"
        ]
    },
    "actions": [
        {
            // This attribute indicates what type of object information is being modified.
            // Choose one from BoundedContext, Aggregate, Enumeration, ValueObject, Entity, Command, Event.
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
\`\`\`

I will explain the ids and args used in each objectType.
You cannot use any arbitrary parameters not described in this explanation in ids or args.

# objectType: Aggregate
- Description
aggregateId can be used when defining ValueObjects, Enumerations, and Entities that belong to an Aggregate.

- Return format
{
    "objectType": "Aggregate",
    "ids": {
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
    "ids": {
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
        "api_verb": <"POST" | "DELETE" | "PUT">,
        "outputEventIds": ["<outputEventId>"], // List of event IDs generated by this command. Must write existing event IDs.
        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, system, etc.
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

    __getExamplePrompt(){
        return `Let me give you an example.
[INPUT]
- Summarized Existing Event Storming Model
{"bc-orderManagement":{"id":"bc-orderManagement","name":"OrderManagement","actors":[{"id":"act-customer","name":"Customer"},{"id":"act-system","name":"System"}],"aggregates":{"agg-order":{"id":"agg-order","name":"Order","entities":[],"enumerations":[{"id":"enum-orderStatus","name":"OrderStatus"}],"valueObjects":[{"id":"vo-payment","name":"Payment"},{"id":"vo-shippingAddress","name":"ShippingAddress"}],"commands":[{"id":"cmd-placeOrder","name":"PlaceOrder","api_verb":"POST","outputEvents":[{"id":"evt-orderPlaced","name":"OrderPlaced"}]},{"id":"cmd-cancelOrder","name":"CancelOrder","api_verb":"PUT","outputEvents":[{"id":"evt-orderCancelled","name":"OrderCancelled"}]}],"events":[{"id":"evt-orderPlaced","name":"OrderPlaced","outputCommands":[]},{"id":"evt-orderCancelled","name":"OrderCancelled","outputCommands":[]}]}}}}

- Target Bounded Context Info To Relocate
{"bc-orderManagement":{"id":"bc-orderManagement","name":"OrderManagement","actors":[{"id":"act-customer","name":"Customer"},{"id":"act-system","name":"System"}],"aggregates":{"agg-order":{"id":"agg-order","name":"Order","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"customerId","type":"Long"},{"name":"orderStatus","type":"String"},{"name":"totalAmount","type":"Money"},{"name":"orderDate","type":"LocalDateTime"},{"name":"payment","type":"Payment"},{"name":"shippingAddress","type":"String"}],"entities":[],"enumerations":[{"id":"enum-orderStatus","name":"OrderStatus","properties":[{"name":"PENDING"},{"name":"CONFIRMED"},{"name":"CANCELLED"}]}],"valueObjects":[{"id":"vo-payment","name":"Payment","properties":[{"name":"method"},{"name":"amount","type":"Money"},{"name":"status"}]},{"id":"vo-shippingAddress","name":"ShippingAddress","properties":[{"name":"street"},{"name":"city"},{"name":"country"},{"name":"zipCode"}]}],"commands":[{"id":"cmd-placeOrder","name":"PlaceOrder","api_verb":"POST","outputEvents":[{"id":"evt-orderPlaced","name":"OrderPlaced"}]},{"id":"cmd-cancelOrder","name":"CancelOrder","api_verb":"PUT","outputEvents":[{"id":"evt-orderCancelled","name":"OrderCancelled"}]}],"events":[{"id":"evt-orderPlaced","name":"OrderPlaced","outputCommands":[]},{"id":"evt-orderCancelled","name":"OrderCancelled","outputCommands":[]}]}}}}

- Reorganize Structure
[{"aggregateName":"Order","entities":["OrderItem"],"valueObjects":["Payment","ShippingAddress"]}]

[OUTPUT]
\`\`\`json
{"thoughtProcess":{"analysis":"The current Order aggregate needs to be enhanced with OrderItem entity and refined value objects. The existing structure has basic order management capabilities but lacks detailed item tracking and proper status management.","identifiedChanges":["Add OrderItem entity to track individual items in an order","Enhance OrderStatus enumeration with additional states (SHIPPED, DELIVERED)","Add PaymentStatus enumeration to better track payment lifecycle","Refine Payment value object with proper status tracking","Add new UpdateOrderStatus command for order lifecycle management"],"structuralConsiderations":["OrderItem needs to reference both Order and Product, establishing proper relationships","Payment status should be tracked separately from order status for better separation of concerns","ShippingAddress needs standardized fields for consistent address handling"],"potentialImpacts":["Adding OrderItem will require updates to order total calculation logic","New status transitions will need proper validation and business rules","Payment processing will need integration with external payment systems","Customer notifications should be triggered for all relevant status changes"]},"actions":[{"objectType":"Aggregate","ids":{"aggregateId":"agg-order"},"args":{"aggregateName":"Order","properties":[{"name":"orderId","type":"Long","isKey":true},{"name":"customerId","type":"Long","isForeignProperty":true},{"name":"orderStatus","type":"OrderStatus"},{"name":"orderItems","type":"List<OrderItem>"},{"name":"totalAmount","type":"Money"},{"name":"orderDate","type":"LocalDateTime"},{"name":"payment","type":"Payment"},{"name":"shippingAddress","type":"ShippingAddress"}]}},{"objectType":"Enumeration","ids":{"aggregateId":"agg-order","enumerationId":"enum-orderStatus"},"args":{"enumerationName":"OrderStatus","properties":[{"name":"PENDING"},{"name":"CONFIRMED"},{"name":"SHIPPED"},{"name":"DELIVERED"},{"name":"CANCELLED"}]}},{"objectType":"Enumeration","ids":{"aggregateId":"agg-order","enumerationId":"enum-paymentStatus"},"args":{"enumerationName":"PaymentStatus","properties":[{"name":"PENDING"},{"name":"COMPLETED"},{"name":"FAILED"},{"name":"REFUNDED"}]}},{"objectType":"ValueObject","ids":{"aggregateId":"agg-order","valueObjectId":"vo-payment"},"args":{"valueObjectName":"Payment","properties":[{"name":"method"},{"name":"amount","type":"Money"},{"name":"status","type":"PaymentStatus"}]}},{"objectType":"ValueObject","ids":{"aggregateId":"agg-order","valueObjectId":"vo-shippingAddress"},"args":{"valueObjectName":"ShippingAddress","properties":[{"name":"street"},{"name":"city"},{"name":"state"},{"name":"country"},{"name":"zipCode"}]}},{"objectType":"Entity","ids":{"aggregateId":"agg-order","entityId":"entity-orderItem"},"args":{"entityName":"OrderItem","properties":[{"name":"orderItemId","type":"Long","isKey":true},{"name":"productId","type":"Long","isForeignProperty":true},{"name":"quantity","type":"Integer"},{"name":"unitPrice","type":"Money"},{"name":"subtotal","type":"Money"}]}},{"objectType":"Command","ids":{"aggregateId":"agg-order","commandId":"cmd-placeOrder"},"args":{"commandName":"PlaceOrder","api_verb":"POST","outputEventIds":["evt-orderPlaced"],"actor":"Customer"}},{"objectType":"Command","ids":{"aggregateId":"agg-order","commandId":"cmd-cancelOrder"},"args":{"commandName":"CancelOrder","api_verb":"PUT","outputEventIds":["evt-orderCancelled"],"actor":"Customer"}},{"objectType":"Command","ids":{"aggregateId":"agg-order","commandId":"cmd-updateOrderStatus"},"args":{"commandName":"UpdateOrderStatus","api_verb":"PUT","outputEventIds":["evt-orderStatusUpdated"],"actor":"System"}},{"objectType":"Event","ids":{"aggregateId":"agg-order","eventId":"evt-orderPlaced"},"args":{"eventName":"OrderPlaced","outputCommandIds":[{"commandId":"cmd-processPayment","relatedAttribute":"paymentStatus","reason":"When an order is placed, payment processing should be initiated"}]}},{"objectType":"Event","ids":{"aggregateId":"agg-order","eventId":"evt-orderCancelled"},"args":{"eventName":"OrderCancelled","outputCommandIds":[{"commandId":"cmd-refundPayment","relatedAttribute":"paymentStatus","reason":"When an order is cancelled, payment should be refunded if already processed"}]}},{"objectType":"Event","ids":{"aggregateId":"agg-order","eventId":"evt-orderStatusUpdated"},"args":{"eventName":"OrderStatusUpdated","outputCommandIds":[{"commandId":"cmd-notifyCustomer","relatedAttribute":"notificationStatus","reason":"When order status changes, customer should be notified of the update"}]}}]}
\`\`\`

`
    }

    _getUserPrompt(targetBoundedContextName, suggestedStructures, esValue, esAliasTransManager){
        const bcRelatedESValue = this.__getOnlyBoundedContextRelatedSummarizedESValue(esValue, targetBoundedContextName)
        const relocateInfo = esAliasTransManager.transToAliasInSummarizedESValue(ESValueSummarizeUtil.getSummarizedESValue(bcRelatedESValue))

        return `Now let's process the user's input.
[INPUT]
- Summarized Existing Event Storming Model
${JSON.stringify(ESValueSummarizeUtil_OnlyNameWithId.getFilteredSummarizedESValue(esValue, esAliasTransManager))}

- Target Bounded Context Info To Relocate
${JSON.stringify(relocateInfo)}

- Reorganize Structure
${JSON.stringify(suggestedStructures)}

- Final Check
* All property types in Aggregate must be either basic Java types (String, Long, etc.), predefined types (Address, Money, etc.), or defined within the Aggregate as Enumeration/ValueObject/Entity
* All names must be in English and follow proper naming conventions (PascalCase for types, camelCase for properties)
* All foreign keys should be marked with isForeignProperty: true
* Primary keys should be marked with isKey: true
* Ensure all existing Commands and Events from the original structure are preserved unless explicitly removed
* Check that all relationships between Aggregates, Entities, and ValueObjects are properly defined
* Verify that all required properties from the original structure are maintained in the new structure
* The command you create must call the event for that command. Ex) CreateCustomer -> CustomerCreated
* When using the value of an Enumeration or ValueObject or Entity in an Aggregate Root, you must use its class name, not the type of the object's Id. Ex) Integer -> OrderStatus

[OUTPUT]
\`\`\`json
`
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
            actions = this.esAliasTransManager.transToUUIDInActions(actions)
            this._restoreActions(actions, this.inputedParams.esValue, this.inputedParams.targetBoundedContextName)

            let esValueToModify = JSON.parse(JSON.stringify(this.inputedParams.esValue))
            const removedElements = this._removePrevBoundedContextRelatedElements(this.inputedParams.targetBoundedContextName, esValueToModify)
            let createdESValue = ESActionUtil.getActionAppliedESValue(actions, this.inputedParams.userInfo, this.inputedParams.information, esValueToModify)
            
            const outputResult = {
                generatorName: this.generatorName,
                modelValue: {
                    actions: actions,
                    createdESValue: createdESValue,
                    removedElements: removedElements
                },
                modelRawValue: text,
                inputedParams: this.inputedParams
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
                isError: true
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
                    break
            }
        }
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

module.exports = BoundedContextRelocateActionsGenerator;