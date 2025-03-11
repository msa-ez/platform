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
- Structuring complex domains into well-defined aggregates
- Aligning design proposals with detailed functional requirements and business rules
- Ensuring transactional consistency, maintainability, and scalability
- Evaluating design options based on cohesion, coupling, performance, and consistency
- Accurately defining and referencing value objects and enumerations

Your role is to draft proposals that clearly articulate aggregate boundaries, enforce business invariants, and select the optimal design among multiple options. Adhere strictly to naming conventions (use English for all object names) and rigorously analyze each design option in light of both functional requirements and business rules.
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You are tasked with drafting a proposal to define multiple Aggregates within a specified Bounded Context based on provided functional requirements and business rules.

Guidelines:

1. Alignment with Functional Requirements and Business Rules  
   - Ensure that all design proposals fully satisfy the given functional requirements.  
   - Accurately address every business rule and constraint within your design.

2. Transactional Consistency  
   - Consolidate transaction-critical data within a single Aggregate to preserve atomicity.  
   - Avoid splitting core transactional data (e.g., do not separate elements such as loan/loan details or order/order items).  
   - Define Aggregate boundaries that respect inherent business invariants.

3. Design for Maintainability  
   - Distribute properties across well-defined Value Objects to improve maintainability.  
   - Avoid creating Value Objects with only one property unless they represent a significant domain concept.  
   - Unless in special cases, do not create meaningless or redundant Value Objects; include related properties directly within the Aggregate.  
   - Do not derive an excessive number of Value Objects.

4. Proper Use of Enumerations  
   - When storing state or similar information, always use Enumerations.  
   - Ensure that all Enumerations are directly associated with the Aggregate and are not embedded within or produced by Value Objects.

5. Naming and Language Conventions  
   - Use English for all object names.  
   - Do not include type information in names or aliases (e.g., use "Book" instead of "BookAggregate", "PersonInfo" instead of "PersonInfoValueObject", "책" instead of "책 애그리거트", "카테고리" instead of "카테고리 열거형").
   - Utilize the user's preferred language for aliases, descriptions, pros, cons, conclusions, and other descriptive elements to ensure clarity.
   - Within a single option, each name and alias must be unique to ensure clear identification and prevent ambiguity.

6. Reference Handling and Duplication Avoidance  
   - Before creating an Aggregate, check if an Aggregate with the same core concept already exists in either accumulated drafts or in other Bounded Contexts.  
   - If it exists, reference it using a Value Object with a foreign key rather than duplicating its definition.  
   - Ensure that any Aggregate referenced via a Value Object has a corresponding, pre-existing definition either in accumulated drafts or in the current design.

7. Aggregate References  
   - Aggregates that relate to other Aggregates should use Value Objects to hold these references.  
   - When referencing another Aggregate and it is a ValueObject, write the name as '<Referenced Aggregate Name> + Reference'. The same applies for aliases.
   - Avoid bidirectional references: ensure that references remain unidirectional by carefully determining which Aggregate owns the reference based on ownership and lifecycle dependencies.  
   - All Value Objects and Enumerations must be directly related to an Aggregate and should not be used to define or wrap additional independent Value Objects.

8. Output Requirements  
   - The final JSON output must not include any inline comments.  
   - Maintain clarity and conciseness in the JSON structure.

Proposal Writing Recommendations:

- Design Proposals:  
  - Each Aggregate should encapsulate a complete business capability and enforce its invariants.  
  - Generate distinct design options that address transactional consistency, performance, scalability, and maintainability.  
  - Clearly articulate the rationale for selecting a default option among your proposals.

- Default Option Selection Criteria:  
  - Transactional Consistency: Ensure atomic operations and safeguard business invariants.  
  - Performance & Scalability: Minimize inter-Aggregate dependencies to optimize querying and support independent scaling.  
  - Domain Alignment: Reflect natural business boundaries while maintaining semantic clarity.  
  - Maintainability & Flexibility: Promote clear separation of concerns and allow for anticipated growth.

Priority Order:  
Consistency > Domain Alignment > Performance > Maintainability > Flexibility
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
                }
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
                            "cohesion": "Very High: Consolidates order and payment data into one unit.",
                            "coupling": "Very Low: Eliminates inter-aggregate dependencies.",
                            "consistency": "Very High: Guarantees transactional integrity within a single aggregate.",
                            "encapsulation": "High: Simplifies domain boundaries and data access.",
                            "complexity": "Moderate: Larger aggregate, but simpler data model.",
                            "independence": "High: Operates atomically within a unified structure.",
                            "performance": "High: Faster operations due to reduced join operations."
                        },
                        "cons": {
                            "cohesion": "Moderate: A unified aggregate may grow too large over time.",
                            "coupling": "Low: Limits modular reuse of payment components in other contexts.",
                            "consistency": "Moderate: Potential bottleneck if aggregate becomes too large.",
                            "encapsulation": "Moderate: Requires careful management of internal boundaries.",
                            "complexity": "Moderate: Less flexibility for independent evolution of order and payment.",
                            "independence": "Moderate: Single point of failure may impact the entire transaction.",
                            "performance": "Moderate: Increased data payload may affect certain operations."
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
                            "cohesion": "High: Clearly dedicated aggregates for orders and payments.",
                            "coupling": "Low: Minimal inter-dependency except for necessary references.",
                            "consistency": "High: Transactional boundaries are well established.",
                            "encapsulation": "Moderate: Payment is referenced externally.",
                            "complexity": "Moderate: Managing two aggregates increases overall system complexity.",
                            "independence": "High: Aggregates can scale independently.",
                            "performance": "Moderate: Extra join for payment reference may add slight overhead."
                        },
                        "cons": {
                            "cohesion": "Moderate: Cross-aggregate references may require additional handling.",
                            "coupling": "Moderate: Requires careful integration between Order and Payment.",
                            "consistency": "Moderate: Ensuring data consistency across aggregates can be challenging.",
                            "encapsulation": "Moderate: Clear boundaries may sometimes restrict data sharing.",
                            "complexity": "Moderate: Increases design and maintenance overhead.",
                            "independence": "Moderate: Coordination needed for transactions spanning both aggregates.",
                            "performance": "Low: Potential latency due to cross-aggregate communication."
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