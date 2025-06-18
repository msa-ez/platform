const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { ESValueSummarizeWithFilter } = require("../helpers")
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class DraftGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.generatorName = "DraftGeneratorByFunctions"
        this.checkInputParamsKeys = ["description", "boundedContext", "accumulatedDrafts"] // Optional ["feedback"]
        this.progressCheckStrings = ["inference", "options", "analysis", "defaultOptionIndex"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    options: z.array(
                        z.object({
                            structure: z.array(
                                z.object({
                                    aggregate: z.object({
                                        name: z.string(),
                                        alias: z.string()
                                    }).strict(),
                                    enumerations: z.array(
                                        z.object({
                                            name: z.string(),
                                            alias: z.string()
                                        }).strict()
                                    ),
                                    valueObjects: z.array(
                                        z.object({
                                            name: z.string(),
                                            alias: z.string(),
                                            referencedAggregateName: z.string()
                                        }).strict()
                                    )
                                }).strict()
                            ),
                            pros: z.object({
                                cohesion: z.string(),
                                coupling: z.string(),
                                consistency: z.string(),
                                encapsulation: z.string(),
                                complexity: z.string(),
                                independence: z.string(),
                                performance: z.string()
                            }).strict(),
                            cons: z.object({
                                cohesion: z.string(),
                                coupling: z.string(),
                                consistency: z.string(),
                                encapsulation: z.string(),
                                complexity: z.string(),
                                independence: z.string(),
                                performance: z.string()
                            }).strict()
                        }).strict()
                    ),
                    defaultOptionIndex: z.number(),
                    conclusions: z.string()
                }).strict()
            }).strict(),
            "instruction"
        )
    }

    static outputToAccumulatedDrafts(output, targetBoundedContext){
        return {
            [targetBoundedContext.name]: output.options[output.defaultOptionIndex].structure
        }
    }

    static esValueToAccumulatedDrafts(esValue, targetBoundedContext){
        let accumulatedDrafts = {}

        const summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(esValue)
        for(const boundedContextInfo of summarizedESValue.boundedContexts){
            let structure = []

            if(boundedContextInfo.name !== targetBoundedContext.name) {
                for(const aggregateInfo of boundedContextInfo.aggregates){
                    let selectedOption = {}

                    const targetAggregate = esValue.elements[aggregateInfo.id]
                    selectedOption.aggregate = {
                        name: aggregateInfo.name,
                        alias: (targetAggregate && targetAggregate.displayName) ? targetAggregate.displayName : aggregateInfo.name
                    }

                    let aggregateElements = null
                    if(targetAggregate && targetAggregate.aggregateRoot && targetAggregate.aggregateRoot.entities &&
                    targetAggregate.aggregateRoot.entities.elements
                    ){
                        aggregateElements = targetAggregate.aggregateRoot.entities.elements
                    }

                    selectedOption.enumerations = aggregateInfo.enumerations.map(enumInfo => ({
                        name: enumInfo.name,
                        alias: (aggregateElements && aggregateElements[enumInfo.id]) ? aggregateElements[enumInfo.id].displayName : enumInfo.name
                    }))

                    selectedOption.valueObjects = aggregateInfo.valueObjects.map(valueObjectInfo => ({
                        name: valueObjectInfo.name,
                        alias: (aggregateElements && aggregateElements[valueObjectInfo.id]) ? aggregateElements[valueObjectInfo.id].displayName : valueObjectInfo.name
                    }))

                    structure.push(selectedOption)
                }
            }

            accumulatedDrafts[boundedContextInfo.name] = structure
        }

        return accumulatedDrafts
    }
    
    onGenerateBefore(inputParams){
        inputParams.accumulatedDrafts = structuredClone(inputParams.accumulatedDrafts)
        inputParams.aggregateNamesToSuggest = inputParams.accumulatedDrafts[inputParams.boundedContext.name]
            .map(aggregateInfo => 
                ({
                    name: aggregateInfo.aggregate.name,
                    alias: aggregateInfo.aggregate.alias
                })
            )
        inputParams.accumulatedDrafts[inputParams.boundedContext.name] = []

        const existingAggregates = []
        for(const aggregateInfos of Object.values(inputParams.accumulatedDrafts)) {
            for(const aggregateInfo of aggregateInfos) {
                if(aggregateInfo.aggregate) existingAggregates.push(aggregateInfo.aggregate.name)
            }
        }
        inputParams.existingAggregates = existingAggregates

        inputParams.boundedContextDisplayName = inputParams.boundedContext.displayName ? inputParams.boundedContext.displayName : inputParams.boundedContext.name
        inputParams.subjectText = `Generating options for ${inputParams.boundedContextDisplayName} Bounded Context`
    }


    __buildAgentRolePrompt(){
        return `You are a distinguished Domain-Driven Design (DDD) architect with extensive expertise in:
- Structuring complex domains into well-defined aggregates with clear boundaries and invariants
- Applying strategic design patterns to align technical models with business capabilities
- Identifying and protecting core domain concepts through precise aggregate root definition
- Ensuring transactional consistency, data integrity, and system scalability across bounded contexts
- Balancing between immediate business requirements and long-term domain evolution
- Evaluating design options based on cohesion, coupling, performance, consistency, and business alignment
- Accurately defining and referencing value objects, entities, and enumerations according to DDD principles
- Establishing ubiquitous language that bridges technical implementation and business terminology

Your role is to craft thoughtful aggregate designs that:
1. Enforce business invariants through carefully designed transaction boundaries
2. Minimize cross-aggregate dependencies while maintaining necessary references
3. Balance between overly large aggregates (that create contention) and overly small aggregates (that fragment business rules)
4. Provide concrete, domain-specific analysis of each design option's strengths and weaknesses
5. Select optimal designs based on both technical criteria and business significance

Adhere strictly to naming conventions (use English for all object names) and rigorously analyze each design option in light of both functional requirements and business rules. Your proposals should demonstrate deep domain understanding while maintaining technical precision.
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You are tasked with drafting a proposal to define multiple Aggregates within a specified Bounded Context based on provided functional requirements and business rules.

Guidelines:

1. Alignment with Functional Requirements and Business Rules  
   - Ensure that all design proposals fully satisfy the given functional requirements.  
   - Accurately address every business rule and constraint within your design.

2. Event-Driven Design Considerations
   - Analyze the provided events to understand the domain behaviors and state transitions that occur within the bounded context.
   - Design aggregates that can naturally produce and handle the identified domain events.
   - Consider how events reflect business processes and ensure aggregates align with these processes.
   - Use events to identify aggregate boundaries - operations that should be atomic typically belong to the same aggregate.

3. Context Relationship Analysis
   - Examine contextRelations to understand how this bounded context interacts with other contexts.
   - Design aggregates that support the identified interaction patterns (Pub/Sub, API calls, etc.).
   - Consider the direction of relationships when defining aggregate dependencies and references.
   - Ensure that cross-context communications are handled through well-defined aggregate interfaces.

4. Transactional Consistency  
   - Consolidate transaction-critical data within a single Aggregate to preserve atomicity.  
   - Avoid splitting core transactional data (e.g., do not separate elements such as loan/loan details or order/order items).  
   - Define Aggregate boundaries that respect inherent business invariants and support identified events.

5. Design for Maintainability  
   - Distribute properties across well-defined Value Objects to improve maintainability.  
   - Avoid creating Value Objects with only one property unless they represent a significant domain concept.  
   - Unless in special cases, do not create meaningless or redundant Value Objects; include related properties directly within the Aggregate.  
   - Do not derive an excessive number of Value Objects.

6. Proper Use of Enumerations  
   - When storing state or similar information, always use Enumerations.  
   - Ensure that all Enumerations are directly associated with the Aggregate and are not embedded within or produced by Value Objects.
   - Consider state transitions implied by events when defining enumeration values.

7. Naming and Language Conventions  
   - Use English for all object names.  
   - Do not include type information in names or aliases (e.g., use "Book" instead of "BookAggregate", "PersonInfo" instead of "PersonInfoValueObject", "책" instead of "책 애그리거트", "카테고리" instead of "카테고리 열거형").
   - Utilize the user's preferred language for aliases, descriptions, pros, cons, conclusions, and other descriptive elements to ensure clarity.
   - Within a single option, each name and alias must be unique to ensure clear identification and prevent ambiguity.

8. Reference Handling and Duplication Avoidance  
   - Before creating an Aggregate, check if an Aggregate with the same core concept already exists in either accumulated drafts or in other Bounded Contexts.  
   - If it exists, reference it using a Value Object with a foreign key rather than duplicating its definition.  
   - Ensure that any Aggregate referenced via a Value Object has a corresponding, pre-existing definition either in accumulated drafts or in the current design.

9. Aggregate References  
   - Aggregates that relate to other Aggregates should use Value Objects to hold these references.  
   - When referencing another Aggregate and it is a ValueObject, write the name as '<Referenced Aggregate Name> + Reference'. The same applies for aliases.
   - Avoid bidirectional references: ensure that references remain unidirectional by carefully determining which Aggregate owns the reference based on ownership and lifecycle dependencies.  
   - All Value Objects and Enumerations must be directly related to an Aggregate and should not be used to define or wrap additional independent Value Objects.

10. High-Quality Evaluation of Options
    - For each design option, provide specific and concrete pros and cons that go beyond generic statements.
    - Evaluate options based on design quality attributes with specific consequences and examples:
      * Cohesion: Assess how focused each aggregate is on a single responsibility or business capability
      * Coupling: Analyze dependencies between aggregates and their impact on system flexibility
      * Consistency: Evaluate how well business invariants are protected within transaction boundaries
      * Encapsulation: Consider how effectively domain rules are hidden and implementation details are protected
      * Complexity: Assess cognitive load for developers working with the design and its implementation difficulty
      * Independence: Evaluate how autonomously each aggregate can evolve without affecting others
      * Performance: Consider query efficiency, memory usage, and operational characteristics
    - Ensure pros and cons are meaningfully different between options and don't contradict each other
    - For pros, focus on genuine strengths with specific domain-relevant benefits
    - For cons, identify actual limitations and trade-offs with real consequences for implementation
    - Avoid vague statements like "moderate" or "high" without explaining why; instead explain the specific impact

11. Output Requirements  
    - The final JSON output must not include any inline comments.  
    - Maintain clarity and conciseness in the JSON structure.

Proposal Writing Recommendations:

- Design Proposals:  
  - Each Aggregate should encapsulate a complete business capability and enforce its invariants.  
  - Generate distinct design options that address transactional consistency, performance, scalability, and maintainability.
  - Consider how each aggregate supports the identified events and context relationships.
  - Clearly articulate the rationale for selecting a default option among your proposals.

- Default Option Selection Criteria:  
  - Transactional Consistency: Ensure atomic operations and safeguard business invariants.  
  - Event Alignment: Support natural event production and handling within aggregate boundaries.
  - Context Integration: Enable smooth interactions with other bounded contexts as specified in contextRelations.
  - Performance & Scalability: Minimize inter-Aggregate dependencies to optimize querying and support independent scaling.  
  - Domain Alignment: Reflect natural business boundaries while maintaining semantic clarity.  
  - Maintainability & Flexibility: Promote clear separation of concerns and allow for anticipated growth.

Priority Order:  
Consistency > Event Alignment > Context Integration > Domain Alignment > Performance > Maintainability > Flexibility
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The process of reasoning should be directly related to the output result, not a reference to a general strategy.
2. Analyze the provided functional requirements, business rules, and the bounded context thoroughly to understand the problem domain.
3. Focus on clearly defining aggregate boundaries and ensuring transactional consistency while properly grouping related entities and value objects.
4. Evaluate multiple design options by considering factors such as domain complexity, scalability, maintainability, and future flexibility.
5. Assess each option's strengths and weaknesses in terms of cohesion, coupling, consistency, performance, and encapsulation.
6. Strictly adhere to naming conventions: all object names must be in English, and all aliases should be in the user's preferred language.
7. Ensure proper handling of Value Objects and Enumerations:
   - When storing state or similar information, always use Enumerations.
   - All Value Objects and Enumerations must be directly associated with an Aggregate; avoid defining nested or indirect Value Objects.
   - Refrain from creating meaningless or redundant Value Objects except in special cases.
   - Do not derive an excessive number of Value Objects; incorporate properties directly into the Aggregate when appropriate.
`   
    }

    __buildJsonResponseFormat() {
        return `
{
    "inference": "<inference>",
    "result": {
        "options": [
            {
                "structure": [
                    {
                        "aggregate": {
                            "name": "<name>",
                            "alias": "<alias>"
                        },
                        "enumerations": [{
                            "name": "<name>",
                            "alias": "<alias>"
                        }],
                        "valueObjects": [{
                            "name": "<name>",
                            "alias": "<alias>",
                            "referencedAggregateName?": "<name of aggregate>" // If there is a referencedAggregateName, it means that the ValueObject is used to reference the Aggregate. You can write the name of an Aggregate created from the same option, as well as an existing Aggregate.
                        }]
                    }
                ],
                "pros": {
                    "cohesion": "<cohesion for this option>",
                    "coupling": "<coupling for this option>",
                    "consistency": "<consistency for this option>",
                    "encapsulation": "<encapsulation for this option>",
                    "complexity": "<complexity for this option>",
                    "independence": "<independence for this option>",
                    "performance": "<performance for this option>"
                },
                "cons": {
                    "cohesion": "<cohesion for this option>",
                    "coupling": "<coupling for this option>",
                    "consistency": "<consistency for this option>",
                    "encapsulation": "<encapsulation for this option>",
                    "complexity": "<complexity for this option>",
                    "independence": "<independence for this option>",
                    "performance": "<performance for this option>"
                }
            }
        ],
        
        // Based on our analysis of each option, we'll recommend a default option that's right for you.
        "defaultOptionIndex": "<The index of the option that is selected by default(starts from 1)>",
        "conclusions": "<Write a conclusion for each option, explaining in which cases it would be best to choose that option.>"
    }        
}
`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Accumulated Drafts": {
                "OrderProcessing": [],
                "CustomerManagement": [
                    {
                        "aggregate": {
                            "name": "CustomerProfile",
                            "alias": "Customer Profile Data"
                        },
                        "enumerations": [
                            {
                                "name": "CustomerType",
                                "alias": "Customer Type Enumeration"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "CustomerAddress",
                                "alias": "Customer Address Info"
                            }
                        ]
                    }
                ],
                "InventoryManagement": [
                    {
                        "aggregate": {
                            "name": "Product",
                            "alias": "Product Details"
                        },
                        "enumerations": [
                            {
                                "name": "ProductStatus",
                                "alias": "Product Availability Status"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "ProductSpecification",
                                "alias": "Detailed Specifications"
                            }
                        ]
                    }
                ]
            },
            "Target Bounded Context Name": "OrderProcessing",
            "Functional Requirements": {
                "userStories": [
                    {
                        "title": "Place an Order",
                        "description": "As a customer, I want to place an order so that I can purchase products online.",
                        "acceptance": [
                            "The order must include at least one product.",
                            "Customer information is validated.",
                            "Order total is correctly calculated.",
                            "Payment process is invoked and approved."
                        ]
                    },
                    {
                        "title": "Cancel an Order",
                        "description": "As a customer, I want to cancel my order before it is processed.",
                        "acceptance": [
                            "Only orders that are not yet shipped can be cancelled.",
                            "Cancellation triggers refund initiation.",
                            "Order status reflects cancellation."
                        ]
                    }
                ],
                "entities": {
                    "Order": {
                        "properties": [
                            {"name": "orderId", "type": "String", "required": true, "isPrimaryKey": true},
                            {"name": "customerId", "type": "String", "required": true, "isForeignKey": true, "foreignEntity": "CustomerProfile"},
                            {"name": "orderDate", "type": "Date", "required": true},
                            {"name": "shippingAddress", "type": "String", "required": true},
                            {"name": "totalAmount", "type": "Integer", "required": true},
                            {"name": "orderStatus", "type": "enum", "required": true, "values": ["Pending", "Confirmed", "Shipped", "Cancelled"]}
                        ]
                    },
                    "Payment": {
                        "properties": [
                            {"name": "paymentId", "type": "String", "required": true, "isPrimaryKey": true},
                            {"name": "orderId", "type": "String", "required": true, "isForeignKey": true, "foreignEntity": "Order"},
                            {"name": "paymentMethod", "type": "enum", "required": true, "values": ["CreditCard", "PayPal", "BankTransfer"]},
                            {"name": "paymentStatus", "type": "enum", "required": true, "values": ["Successful", "Failed", "Pending"]}
                        ]
                    }
                },
                "businessRules": [
                    {
                        "name": "OrderValidationRule",
                        "description": "An order must have a valid total amount greater than zero."
                    },
                    {
                        "name": "CancellationPolicy",
                        "description": "Orders can only be cancelled within 1 hour of placement if not confirmed."
                    }
                ],
                "interfaces": {
                    "OrderInterface": {
                        "sections": [
                            {
                                "name": "OrderForm",
                                "type": "form",
                                "fields": [
                                    {"name": "customerId", "type": "text", "required": true},
                                    {"name": "shippingAddress", "type": "textarea", "required": true},
                                    {"name": "orderDetails", "type": "textarea", "required": true}
                                ],
                                "actions": ["Submit", "Reset"]
                            }
                        ]
                    },
                    "PaymentInterface": {
                        "sections": [
                            {
                                "name": "PaymentForm",
                                "type": "form",
                                "fields": [
                                    {"name": "orderId", "type": "text", "required": true},
                                    {"name": "paymentMethod", "type": "dropdown", "required": true},
                                    {"name": "paymentAmount", "type": "decimal", "required": true}
                                ],
                                "actions": ["Pay", "Cancel"]
                            }
                        ]
                    }
                },
                "events": [
                    {
                        "name": "OrderPlaced",
                        "description": "A customer has successfully placed an order with valid products and customer information.",
                        "displayName": "Order Placed"
                    },
                    {
                        "name": "OrderConfirmed",
                        "description": "An order has been confirmed after payment verification and inventory check.",
                        "displayName": "Order Confirmed"
                    },
                    {
                        "name": "OrderCancelled",
                        "description": "An order has been cancelled by the customer before shipping.",
                        "displayName": "Order Cancelled"
                    },
                    {
                        "name": "PaymentProcessed",
                        "description": "Payment for an order has been successfully processed.",
                        "displayName": "Payment Processed"
                    },
                    {
                        "name": "PaymentFailed",
                        "description": "Payment processing has failed due to insufficient funds or invalid payment method.",
                        "displayName": "Payment Failed"
                    }
                ],
                "contextRelations": [
                    {
                        "name": "OrderInventorySync",
                        "type": "API",
                        "direction": "calls to",
                        "targetContext": "InventoryManagement",
                        "reason": "Order processing needs to verify product availability and reserve inventory items.",
                        "interactionPattern": "OrderProcessing calls InventoryManagement API to check product availability and reserve items when order is placed."
                    },
                    {
                        "name": "CustomerNotification",
                        "type": "Pub/Sub",
                        "direction": "publishes to",
                        "targetContext": "NotificationService",
                        "reason": "Order status changes need to be communicated to customers through various channels.",
                        "interactionPattern": "OrderProcessing publishes order events (placed, confirmed, cancelled) that NotificationService subscribes to for sending notifications."
                    }
                ]
            }
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": "After analyzing the functional requirements and existing drafts, two design options were generated. The first option integrates Order and Payment into a single aggregate, promoting transactional consistency and simplifying interactions. The second option separates Order and Payment into distinct aggregates, ensuring specialized focus on each domain concern.",
            "result": {
                "options": [
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "OrderWithPayment",
                                    "alias": "Complete Order Processing"
                                },
                                "enumerations": [
                                    {
                                        "name": "OrderStatus",
                                        "alias": "Order Status"
                                    },
                                    {
                                        "name": "PaymentStatus",
                                        "alias": "Payment Status"
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "name": "ShippingAddress",
                                        "alias": "Shipping Address Details"
                                    },
                                    {
                                        "name": "CustomerProfileReference",
                                        "alias": "Customer Profile Reference",
                                        "referencedAggregateName": "CustomerProfile"
                                    }
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "All order and payment data are managed within a single transaction boundary, ensuring that critical business processes like order placement with payment are handled atomically.",
                            "coupling": "Eliminates inter-aggregate communications for order-payment operations, removing the need for eventual consistency patterns or distributed transactions.",
                            "consistency": "Business rules that span both order and payment (like 'payment must be verified before order confirmation') are enforced within a single transaction.",
                            "encapsulation": "Payment verification logic and order state transitions are encapsulated together, ensuring payment rules are applied before order status changes.",
                            "complexity": "Simplifies the domain model by merging related concepts, reducing the need for coordination mechanisms between separate aggregates.",
                            "independence": "Changes to order or payment processing can be made in one place without coordinating changes across multiple aggregates.",
                            "performance": "Eliminates the need for multiple database queries when accessing both order and payment data, improving read operation performance."
                        },
                        "cons": {
                            "cohesion": "Dilutes the single responsibility principle by forcing the aggregate to handle both order management and payment processing concerns.",
                            "coupling": "Changes to payment processing requirements will impact the entire OrderWithPayment aggregate, potentially affecting order functionality.",
                            "consistency": "As the aggregate grows, transaction timeouts become more likely, especially with high-volume order processing.",
                            "encapsulation": "Different teams handling order vs. payment concerns must coordinate changes to the same aggregate, creating organizational friction.",
                            "complexity": "The aggregate will grow larger over time, making it harder to understand all the business rules contained within it.",
                            "independence": "Cannot scale order and payment operations independently since they share the same resource constraints.",
                            "performance": "Write operations may suffer from contention, as concurrent modifications to different aspects (order vs. payment) target the same aggregate."
                        }
                    },
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Order",
                                    "alias": "Order Management"
                                },
                                "enumerations": [
                                    {
                                        "name": "OrderStatus",
                                        "alias": "Order Status"
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "name": "ShippingAddress",
                                        "alias": "Order Shipping Address"
                                    },
                                    {
                                        "name": "PaymentReference",
                                        "alias": "Payment Reference",
                                        "referencedAggregateName": "Payment"
                                    }
                                ]
                            },
                            {
                                "aggregate": {
                                    "name": "Payment",
                                    "alias": "Payment Processing"
                                },
                                "enumerations": [
                                    {
                                        "name": "PaymentMethod",
                                        "alias": "Payment Methods"
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "name": "PaymentDetails",
                                        "alias": "Payment Details Info"
                                    }
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "Each aggregate focuses on a single responsibility - Order handles order management while Payment handles payment processing exclusively.",
                            "coupling": "Changes to payment processing (like adding new payment methods) can be made without touching the Order aggregate.",
                            "consistency": "Each aggregate maintains its own smaller, more manageable transaction boundary, reducing the risk of long-running transactions.",
                            "encapsulation": "Payment processing details remain hidden from Order, following interface segregation principles and protecting internal implementation.",
                            "complexity": "Domain concepts are divided into smaller, more comprehensible units that align with specific business capabilities.",
                            "independence": "Order and Payment can be developed, tested, and deployed independently, allowing specialized teams to work in parallel.",
                            "performance": "Enables independent scaling of order and payment operations based on their different resource requirements and usage patterns."
                        },
                        "cons": {
                            "cohesion": "Business processes spanning both order and payment require coordination across aggregate boundaries, complicating process flows.",
                            "coupling": "Orders depend on Payments through references, necessitating careful handling of foreign key relationships across aggregates.",
                            "consistency": "Ensuring that order state always reflects payment state requires eventual consistency patterns, increasing system complexity.",
                            "encapsulation": "Cross-aggregate business rules (like 'only paid orders can be shipped') must be implemented outside the aggregates in application services.",
                            "complexity": "Additional orchestration logic is needed to coordinate the two aggregates during order placement and payment processing.",
                            "independence": "Changes to the interaction between orders and payments require coordinated updates across both aggregates.",
                            "performance": "Retrieving complete order information with payment details requires joining data across aggregates, adding query complexity."
                        }
                    }
                ],
                "defaultOptionIndex": 1,
                "conclusions": "Option 1 is recommended when transactional consistency and simplified data management are prioritized, as it consolidates order and payment into a single aggregate. Option 2 may be chosen if modular separation and independent scalability of order and payment processes are preferred."
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        let userInputQuery = {
            "Accumulated Drafts": this.client.input.accumulatedDrafts,

            "Target Bounded Context Name": this.client.input.boundedContext.name,

            "Functional Requirements": this.client.input.description,

            "Final Check List": `
* Confirm naming conventions:
  - All object names must be in English and follow PascalCase
  - All aliases must be in ${this.preferredLanguage}
`,

            "Guidelines": `
* The following Aggregate should not be created because it already exists, but should be made to reference a ValueObject.: ${(this.client.input.existingAggregates && this.client.input.existingAggregates.length > 0) ? this.client.input.existingAggregates.join(", ") : "None"}
* Please include Aggregates with the following names among the generated Aggregates: ${this.client.input.aggregateNamesToSuggest.map(aggregate => `${aggregate.name}(${aggregate.alias})`).join(", ")}
* Each generated option is created to have a different number of Aggregates.
`
        }

        if(this.client.input.feedback)
            userInputQuery["Feedback"] = `
You should recreate the content of the draft you created earlier, incorporating the user's feedback.
* Previous Draft Output
${JSON.stringify(this.client.input.feedback.previousDraftOutput)}

* User Feedbacks
${this.client.input.feedback.feedbacks.join("\n")}`

        return userInputQuery
    }


    onThink(returnObj, thinkText){
        returnObj.directMessage = `Generating options for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onCreateModelGenerating(returnObj) {
        returnObj.modelValue.output = (returnObj.modelValue.aiOutput.result) ? returnObj.modelValue.aiOutput.result : {}
        returnObj.modelValue.inference = ""
        if(this.parsedTexts && this.parsedTexts.think)
            returnObj.modelValue.inference += this.parsedTexts.think
        if(returnObj.modelValue.aiOutput.inference) 
            returnObj.modelValue.inference += ("\n\n" + returnObj.modelValue.aiOutput.inference)

        if(returnObj.modelValue.output) {
            this._removeOptionsWithExistingAggregates(returnObj.modelValue.output)
            this._linkValueObjectsToReferencedAggregates(returnObj.modelValue.output)
            this._enrichValueObjectsWithAggregateDetails(returnObj.modelValue.output)
            this._removeInvalidAliases(returnObj.modelValue.output)
        }

        if(this.client.input.feedback) {
            returnObj.directMessage = `Re-generating options for ${this.client.input.boundedContextDisplayName} Bounded Context based on user feedback... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
            returnObj.isFeedbackBased = true
        } else {
            returnObj.directMessage = `Generating options for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
        }
    }

    onCreateModelFinished(returnObj) {
        returnObj.modelValue.output = returnObj.modelValue.aiOutput.result
        returnObj.modelValue.inference = ""
        if(this.parsedTexts && this.parsedTexts.think)
            returnObj.modelValue.inference += this.parsedTexts.think
        if(returnObj.modelValue.aiOutput.inference) 
            returnObj.modelValue.inference += ("\n\n" + returnObj.modelValue.aiOutput.inference)

        this._removeOptionsWithExistingAggregates(returnObj.modelValue.output)
        returnObj.modelValue.output.defaultOptionIndex = Math.min(returnObj.modelValue.output.defaultOptionIndex, returnObj.modelValue.output.options.length - 1)
        if(returnObj.modelValue.output.options.length === 0) 
            throw new Error("No valid options found")

        this._linkValueObjectsToReferencedAggregates(returnObj.modelValue.output)
        this._enrichValueObjectsWithAggregateDetails(returnObj.modelValue.output)
        this._markRecommendedOption(returnObj.modelValue.output)
        this._removeInvalidAliases(returnObj.modelValue.output)

        if(this.client.input.feedback) {
            returnObj.directMessage = `Re-generating options for ${this.client.input.boundedContextDisplayName} Bounded Context based on user feedback... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
            returnObj.isFeedbackBased = true
        } else {
            returnObj.directMessage = `Generating options for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
        }
    }

    _removeOptionsWithExistingAggregates(output) {
        if(!output || !output.options) return;

        const filteredOptions = [];

        for (const option of structuredClone(output.options)) {
            if (!option.structure) continue;


            let hasDuplicateNames = false;
            for (const aggregateInfo of option.structure) {
                if (!aggregateInfo.aggregate || !aggregateInfo.aggregate.name) continue;
                
                const aggregateName = aggregateInfo.aggregate.name;
                const aggregateAlias = aggregateInfo.aggregate.alias;
                
                if (aggregateInfo.enumerations && aggregateInfo.enumerations.length > 0) {
                    for (const enumeration of aggregateInfo.enumerations) {
                        if (enumeration.name === aggregateName || enumeration.alias === aggregateAlias) {
                            hasDuplicateNames = true;
                            break;
                        }
                    }
                }
                
                if (!hasDuplicateNames && aggregateInfo.valueObjects && aggregateInfo.valueObjects.length > 0) {
                    for (const valueObject of aggregateInfo.valueObjects) {
                        if (valueObject.name === aggregateName || valueObject.alias === aggregateAlias) {
                            hasDuplicateNames = true;
                            break;
                        }
                    }
                }
                
                if (hasDuplicateNames) break;
            }
            if (hasDuplicateNames) continue;


            let validAggregateInfos = []
            for (const aggregateInfo of option.structure) {
                if (!aggregateInfo.aggregate || !aggregateInfo.aggregate.name) continue;
                if (this.client.input.existingAggregates.includes(aggregateInfo.aggregate.name)) continue

                if (aggregateInfo.valueObjects && aggregateInfo.valueObjects.length > 0) {
                    aggregateInfo.valueObjects = aggregateInfo.valueObjects.filter(valueObject => {
                        return !valueObject.referencedAggregateName || 
                               valueObject.referencedAggregateName !== aggregateInfo.aggregate.name;
                    });
                }

                validAggregateInfos.push(aggregateInfo)
            }
            if(validAggregateInfos.length === 0) continue


            option.structure = validAggregateInfos
            filteredOptions.push(option)
        }

        output.options = filteredOptions;
    }

    // 적절한 참조 요소를 추가하지 않은 경우, 추가시켜 줌
    _linkValueObjectsToReferencedAggregates(output) {
        if(!output || !output.options) return

        for(const option of output.options) {
            if(!option.structure) continue

            let validAggregateNames = this.__getValidAggregateNames(option)
            for(const aggregate of option.structure) {
                if(!aggregate.valueObjects) continue

                for(const valueObject of aggregate.valueObjects) {
                    if(!valueObject.name) continue

                    if(validAggregateNames.includes(valueObject.name)) {
                        valueObject.referencedAggregateName = valueObject.name
                        break
                    }

                    if(validAggregateNames.includes(valueObject.name.replace("Reference", ""))) {
                        valueObject.referencedAggregateName = valueObject.name.replace("Reference", "")
                        break
                    }
                }
            }
        }
    }

    // 추가된 Alias는 추후에 초안에 관련된 사항 표시에 활용됨
    _enrichValueObjectsWithAggregateDetails(output) {
        if(!output || !output.options) return

        for(const option of output.options) {
            if(!option.structure) continue

            let validAggregateNames = this.__getValidAggregateNames(option)
            for(const aggregate of option.structure) {
                if(!aggregate.valueObjects) continue

                for(const valueObject of aggregate.valueObjects) {
                    if(!valueObject.name || !valueObject.alias) continue

                    if(!valueObject.referencedAggregateName) {
                        valueObject.name = valueObject.name.replace("Reference", "").trim()
                        valueObject.alias = valueObject.alias.replace("Reference", "").replace("참조", "").trim()
                        continue
                    }

                    if(!validAggregateNames.includes(valueObject.referencedAggregateName)){
                        delete valueObject.referencedAggregateName
                        valueObject.name = valueObject.name.replace("Reference", "").trim()
                        valueObject.alias = valueObject.alias.replace("Reference", "").replace("참조", "").trim()
                        continue
                    }

                    valueObject.referencedAggregate = {
                        name: valueObject.referencedAggregateName,
                        alias: this.__findAggregateAliasByName(valueObject.referencedAggregateName, output)
                    }

                    delete valueObject.referencedAggregateName
                }
            }
        }
    }

    _removeInvalidAliases(output) {
        if(!output || !output.options) return
    
        const termsToRemove = [
            /\baggregate\b/i,
            /\bvalueobject\b/i,
            /\benum(eration)?\b/i,
            /\b열거형\b/,
            /\b값객체\b/,
            /\b애그리거트\b/,
            /\b어그리거트\b/,
            /\b구조체\b/
        ];
    
        const cleanAlias = (alias) => {
            if (!alias) return alias;
            
            let cleanedAlias = alias;
            for (const term of termsToRemove) {
                cleanedAlias = cleanedAlias.replace(term, '');
            }
            return cleanedAlias.replace(/\s+/g, ' ').trim();
        };
    
        for(const option of output.options) {
            if(!option.structure) continue;
            
            for(const aggregateInfo of option.structure) {
                if(aggregateInfo.aggregate && aggregateInfo.aggregate.alias) {
                    aggregateInfo.aggregate.alias = cleanAlias(aggregateInfo.aggregate.alias);
                }
                
                if(aggregateInfo.enumerations) {
                    for(const enumeration of aggregateInfo.enumerations) {
                        if(enumeration.alias) {
                            enumeration.alias = cleanAlias(enumeration.alias);
                        }
                    }
                }
                
                if(aggregateInfo.valueObjects) {
                    for(const valueObject of aggregateInfo.valueObjects) {
                        if(valueObject.alias) {
                            valueObject.alias = cleanAlias(valueObject.alias);
                        }
                        
                        if(valueObject.referencedAggregate && valueObject.referencedAggregate.alias) {
                            valueObject.referencedAggregate.alias = cleanAlias(valueObject.referencedAggregate.alias);
                        }
                    }
                }
            }
        }
    }

    // usedOption: 초안에서 옵션들은 서로 배타적인 관계이기 때문에 다른 옵션을 기반으로 참조를 생성할 수 없음
    __getValidAggregateNames(usedOption) {
        let validAggregateNames = this.client.input.validAggregateNames ? this.client.input.validAggregateNames : []

        for(const option of [usedOption]) {
            if(!option.structure) continue
            
            for(const aggregate of option.structure) {
                if(!aggregate.aggregate || !aggregate.aggregate.name) continue
                if(!validAggregateNames.includes(aggregate.aggregate.name))
                    validAggregateNames.push(aggregate.aggregate.name)
            }
        }

        for(const accumulatedDraft of Object.values(this.client.input.accumulatedDrafts)) {
            for(const aggregateInfo of accumulatedDraft) {
                if(!aggregateInfo.aggregate || !aggregateInfo.aggregate.name) continue
                if(!validAggregateNames.includes(aggregateInfo.aggregate.name))
                    validAggregateNames.push(aggregateInfo.aggregate.name)
            }
        }

        return validAggregateNames
    }

    __findAggregateAliasByName(aggregateName, output) {
        for(const aggregateInfos of Object.values(this.client.input.accumulatedDrafts)) {
            for(const aggregateInfo of aggregateInfos) {
                if(!aggregateInfo.aggregate || !aggregateInfo.aggregate.name) continue
                if(aggregateInfo.aggregate.name === aggregateName) return aggregateInfo.aggregate.alias
            }
        }

        for(const option of output.options) {
            if(!option.structure) continue

            for(const aggregate of option.structure) {
                if(!aggregate.aggregate || !aggregate.aggregate.name) continue
                if(aggregate.aggregate.name === aggregateName) return aggregate.aggregate.alias
            }
        }

        return aggregateName
    }

    // 추가된 AI 추천 여부는 추후에 초안에 관련된 사항 표시에 활용됨
    _markRecommendedOption(output) {
        if(!output || !output.options) return

        for(let i = 0; i < output.options.length; i++) {
            output.options[i].isAIRecommended = i === output.defaultOptionIndex
        }
    }
}

module.exports = DraftGeneratorByFunctions;