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

                    selectedOption.entities = aggregateInfo.entities.map(entityInfo => ({
                        name: entityInfo.name,
                        alias: (aggregateElements && aggregateElements[entityInfo.id]) ? aggregateElements[entityInfo.id].displayName : entityInfo.name
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


    onApiClientChanged(){
        this.modelInfo.requestArgs.response_format = zodResponseFormat(
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
                                    entities: z.array(
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
    
    onGenerateBefore(inputParams){
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
        return `You are a seasoned DDD architect with expertise in:
- Structuring complex domains into aggregates
- Defining boundaries for entities and value objects
- Ensuring encapsulation and consistency
- Creating scalable domain models
- Weighing design options against business needs
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
   - Define Aggregate boundaries that respect the inherent business invariants.

3. Design for Maintainability  
   - Distribute properties across well-defined Value Objects and Entities to improve maintainability.  
   - Avoid creating Value Objects or Entities with only one property unless they represent a significant domain concept.

4. Naming and Language Conventions  
   - Use English for all object names.  
   - Utilize the user’s preferred language for aliases, pros, cons, conclusions, and other descriptive elements to ensure clarity.

5. Reference Handling and Duplication Avoidance  
   - Before creating an Aggregate, check if an Aggregate with the same core concept already exists in either accumulated drafts or other Bounded Contexts.  
   - If it exists, reference it using a Value Object with a foreign key instead of duplicating its definition.  
   - Ensure that any Aggregate referenced via a Value Object has a corresponding, pre-existing definition either in accumulated drafts or in the current design.

6. Aggregate References  
   - Aggregates that relate to other Aggregates should use Value Objects to hold these references.  
   - Avoid bidirectional references: Ensure that references remain unidirectional by carefully determining which Aggregate owns the reference based on ownership and lifecycle dependencies.

7. Output Requirements  
   - The final JSON output must not include any inline comments.  
   - Maintain clarity and conciseness in the JSON structure.

Proposal Writing Recommendations:

- Design Proposals:  
  - Each Aggregate should encapsulate a complete business capability and enforce its invariants.  
  - Generate distinct design options that address transactional consistency, performance, scalability, and maintainability.  
  - Clearly articulate the rationale for selecting a default option from your proposals.

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
2. Thoroughly analyze the provided functional requirements, business rules, and the bounded context to understand the problem domain.
3. Focus on determining aggregate boundaries and ensuring transactional consistency while grouping related entities and value objects.
4. Evaluate multiple design options by considering key factors such as domain complexity, scalability, maintainability, and future flexibility.
5. Assess the pros and cons of each option in terms of cohesion, coupling, consistency, performance, and encapsulation.
6. Follow naming conventions strictly: all object names must be in English, while all aliases should be in the user's preferred language.
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
                        "entities": [{
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
                "GuestManagement": [
                    {
                        "aggregate": {
                            "name": "Guest",
                            "alias": "Hotel Guest Profile"
                        },
                        "entities": [{
                            "name": "GuestPreference",
                            "alias": "Guest Stay Preferences"
                        }],
                        "valueObjects": [{
                            "name": "GuestContact",
                            "alias": "Guest Contact Information"
                        }]
                    }
                ],
                "RoomManagement": [
                    {
                        "aggregate": {
                            "name": "Room",
                            "alias": "Hotel Room"
                        },
                        "entities": [{
                            "name": "RoomInventory",
                            "alias": "Room Availability Management"
                        }],
                        "valueObjects": [{
                            "name": "RoomRate",
                            "alias": "Room Price Information"
                        }]
                    }
                ]
            },

            "Target Bounded Context Name": "BookingManagement",

            "Functional Requirements": {
                "userStories": [
                    {
                        "title": "Create New Room Booking",
                        "description": "As a guest, I want to book a hotel room with my preferences so that I can secure my stay",
                        "acceptance": [
                            "All required guest information must be provided",
                            "Room type must be selected through search popup",
                            "Valid check-in and check-out dates must be selected",
                            "Meal plan must be chosen from available options",
                            "Booking button activates only when all required fields are filled"
                        ]
                    },
                    {
                        "title": "View Reservation Status",
                        "description": "As a guest, I want to view my booking history and manage active reservations",
                        "acceptance": [
                            "Bookings are filterable by date range and status",
                            "Detailed booking information shows in popup on row click",
                            "Active bookings can be modified or cancelled",
                            "All booking details are displayed in organized table format"
                        ]
                    }
                ],
                "entities": {
                    "Guest": {
                        "properties": [
                            {"name": "guestId", "type": "string", "required": true, "isPrimaryKey": true},
                            {"name": "name", "type": "string", "required": true},
                            {"name": "membershipLevel", "type": "enum", "required": true, "values": ["standard", "VIP"]},
                            {"name": "phoneNumber", "type": "string", "required": true},
                            {"name": "email", "type": "string", "required": true}
                        ]
                    },
                    "Booking": {
                        "properties": [
                            {"name": "bookingNumber", "type": "string", "required": true, "isPrimaryKey": true},
                            {"name": "guestId", "type": "string", "required": true, "isForeignKey": true, "foreignEntity": "Guest"},
                            {"name": "roomType", "type": "string", "required": true},
                            {"name": "checkInDate", "type": "date", "required": true},
                            {"name": "checkOutDate", "type": "date", "required": true},
                            {"name": "numberOfGuests", "type": "integer", "required": true},
                            {"name": "mealPlan", "type": "enum", "required": true, "values": ["No Meal", "Breakfast Only", "Half Board", "Full Board"]},
                            {"name": "specialRequests", "type": "string", "required": false},
                            {"name": "status", "type": "enum", "required": true, "values": ["Active", "Completed", "Cancelled"]},
                            {"name": "totalAmount", "type": "decimal", "required": true}
                        ]
                    }
                },
                "businessRules": [
                    {
                        "name": "ValidBookingDates",
                        "description": "Check-out date must be after check-in date"
                    },
                    {
                        "name": "RequiredFields",
                        "description": "All fields except special requests are mandatory for booking"
                    },
                    {
                        "name": "ActiveBookingModification",
                        "description": "Only active bookings can be modified or cancelled"
                    }
                ],
                "interfaces": {
                    "RoomBooking": {
                        "sections": [
                            {
                                "name": "GuestInformation",
                                "type": "form",
                                "fields": [
                                    {"name": "name", "type": "text", "required": true},
                                    {"name": "guestId", "type": "text", "required": true},
                                    {"name": "membershipLevel", "type": "select", "required": true},
                                    {"name": "phoneNumber", "type": "text", "required": true},
                                    {"name": "email", "type": "email", "required": true}
                                ]
                            },
                            {
                                "name": "BookingDetails",
                                "type": "form",
                                "fields": [
                                    {"name": "roomType", "type": "search", "required": true},
                                    {"name": "checkInDate", "type": "date", "required": true},
                                    {"name": "checkOutDate", "type": "date", "required": true},
                                    {"name": "numberOfGuests", "type": "number", "required": true},
                                    {"name": "mealPlan", "type": "select", "required": true},
                                    {"name": "specialRequests", "type": "textarea", "required": false}
                                ],
                                "actions": ["Submit", "Clear"]
                            }
                        ]
                    },
                    "ReservationStatus": {
                        "sections": [
                            {
                                "name": "BookingHistory",
                                "type": "table",
                                "filters": ["dateRange", "bookingStatus"],
                                "resultTable": {
                                    "columns": ["bookingNumber", "roomType", "checkInDate", "checkOutDate", "totalAmount", "status"],
                                    "actions": ["viewDetails", "modify", "cancel"]
                                }
                            }
                        ]
                    }
                }
            }
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": `After thoroughly reviewing the provided requirements and business rules, we deduced that the domain model must strictly enforce transactional consistency while also accommodating future scalability. The functional requirements—such as booking creation and reservation management—demand that all critical data are processed atomically within clearly defined aggregate boundaries. Two primary design options emerged:

1. **Option 1:** A single consolidated Aggregate (i.e., "Booking") encapsulates both booking logic and associated details. This approach simplifies transaction management and guarantees atomicity, yet it may become less scalable as system complexity increases.

2. **Option 2:** A decomposed model, where “Booking” and “BookingDetail” are managed as separate Aggregates. This design fosters scalability and flexibility through a clear division of concerns, though it also introduces added complexity in ensuring coordinated transactions.

Considering the priority order—Consistency > Domain Alignment > Performance > Maintainability > Flexibility—we inferred that while Option 1 promises simplicity, Option 2 is more advantageous for environments anticipating growth. Therefore, Option 2 is recommended as it better aligns with long-term scalability and maintainability objectives without compromising transactional consistency.`,
            "result": {
                "options": [
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Booking",
                                    "alias": "Room Reservation"
                                },
                                "entities": [
                                    {
                                        "name": "BookingDetail",
                                        "alias": "Reservation Details"
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "name": "Guest",
                                        "alias": "Guest Reference",
                                        "referencedAggregateName": "Guest"
                                    },
                                    {
                                        "name": "Room",
                                        "alias": "Room Reference",
                                        "referencedAggregateName": "Room"
                                    },
                                    {
                                        "name": "StayPeriod",
                                        "alias": "Booking Period"
                                    },
                                    {
                                        "name": "BookingStatus",
                                        "alias": "Reservation Status"
                                    }
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "High cohesion with clear booking focus",
                            "coupling": "Minimal coupling through value object references",
                            "consistency": "Strong consistency within booking boundary",
                            "encapsulation": "Well-encapsulated booking logic",
                            "complexity": "Simple and straightforward structure",
                            "independence": "Can evolve independently of Guest and Room",
                            "performance": "Efficient booking operations"
                        },
                        "cons": {
                            "cohesion": "May need to split if booking features grow",
                            "coupling": "Depends on Guest and Room aggregates",
                            "consistency": "Requires careful transaction management",
                            "encapsulation": "Some booking rules may leak to UI",
                            "complexity": "Must handle reference synchronization",
                            "independence": "Cannot operate without Guest and Room",
                            "performance": "Multiple aggregate lookups needed"
                        }
                    },
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Booking",
                                    "alias": "Room Reservation"
                                },
                                "entities": [],
                                "valueObjects": [
                                    {
                                        "name": "Guest",
                                        "alias": "Guest Reference",
                                        "referencedAggregateName": "Guest"
                                    },
                                    {
                                        "name": "Room",
                                        "alias": "Room Reference",
                                        "referencedAggregateName": "Room"
                                    },
                                    {
                                        "name": "BookingStatus",
                                        "alias": "Reservation Status"
                                    }
                                ]
                            },
                            {
                                "aggregate": {
                                    "name": "BookingDetail",
                                    "alias": "Reservation Details"
                                },
                                "entities": [],
                                "valueObjects": [
                                    {
                                        "name": "Booking",
                                        "alias": "Booking Reference",
                                        "referencedAggregateName": "Booking"
                                    },
                                    {
                                        "name": "StayPeriod",
                                        "alias": "Booking Period"
                                    },
                                    {
                                        "name": "MealPlan",
                                        "alias": "Meal Selection"
                                    }
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "Separate concerns for booking and details",
                            "coupling": "Clear separation of core booking and details",
                            "consistency": "Can manage details separately from core booking",
                            "encapsulation": "Better encapsulation of different aspects",
                            "complexity": "Clear separation of responsibilities",
                            "independence": "Can evolve booking details independently",
                            "performance": "Can load details on demand"
                        },
                        "cons": {
                            "cohesion": "Split of related concepts",
                            "coupling": "Need to maintain consistency between aggregates",
                            "consistency": "More complex transaction management",
                            "encapsulation": "More complex relationship management",
                            "complexity": "Additional aggregate to manage",
                            "independence": "Must coordinate changes across aggregates",
                            "performance": "Multiple queries for full booking info"
                        }
                    }
                ],
                "defaultOptionIndex": 2,
                "conclusions": "Option 1 offers strong transactional consistency and simpler maintenance but limited scalability, while Option 2 provides better scalability and flexibility through separation of concerns at the cost of more complex transaction management - recommended for systems expecting growth in booking features and query requirements."
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        let userInputQuery = {
            "Accumulated Drafts": this.client.input.accumulatedDrafts,

            "Target Bounded Context Name": this.client.input.boundedContext.name,

            "Functional Requirements": this.client.input.description,

            "Final Check List": `
* Validate that all functional requirements and business rules are properly addressed in the design
* Ensure proper aggregate boundaries and consistency rules are maintained
* Check that all Entities and ValueObjects have meaningful properties and business value
* Verify that no single-property objects exist without clear domain significance
* Confirm naming conventions:
  - All object names must be in English and follow PascalCase
  - All aliases must be in ${this.preferredLanguage}
* Verify aggregate references:
  - Existing aggregates must be referenced via ValueObjects with foreign keys
  - New aggregates must not duplicate existing ones
* Review aggregate relationships:
  - Consider using foreign key references between related aggregates
  - Example: Order aggregate should reference Customer via CustomerReference ValueObject
* Evaluate each option for:
  - Technical feasibility
  - Maintainability
  - Scalability
  - Consistency with DDD principles
* The entities in Functional Requirements serve as a reference point only:
  - You can propose alternative aggregate structures that better align with DDD principles
  - Feel free to suggest different entity groupings and relationships
  - You may introduce new entities or combine existing ones if it improves the domain model
  - Focus on creating a design that best serves the business requirements and maintains consistency
* For each option, create a different number of Aggregates configured. Ex) Option 1 consists of one Aggregate, Option 2 consists of two Aggregates.
`,

            "Guidelines": `
* The following Aggregate should not be created because it already exists, but should be made to reference a ValueObject.: ${(this.client.input.existingAggregates && this.client.input.existingAggregates.length > 0) ? this.client.input.existingAggregates.join(", ") : "None"}
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


    onCreateModelGenerating(returnObj) {
        returnObj.modelValue.output = (returnObj.modelValue.aiOutput.result) ? returnObj.modelValue.aiOutput.result : {}
        returnObj.modelValue.inference = returnObj.modelValue.aiOutput.inference ? returnObj.modelValue.aiOutput.inference : ""

        if(returnObj.modelValue.output) {
            this._removeOptionsWithExistingAggregates(returnObj.modelValue.output)
            this._linkValueObjectsToReferencedAggregates(returnObj.modelValue.output)
            this._enrichValueObjectsWithAggregateDetails(returnObj.modelValue.output)
        }

        if(this.client.input.feedback) {
            returnObj.directMessage = `Re-generating options for ${this.client.input.boundedContextDisplayName} Bounded Context based on user feedback... (${returnObj.modelRawValue.length} characters generated)`
            returnObj.isFeedbackBased = true
        } else {
            returnObj.directMessage = `Generating options for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
        }
    }

    onCreateModelFinished(returnObj) {
        returnObj.modelValue.output = returnObj.modelValue.aiOutput.result
        returnObj.modelValue.inference = returnObj.modelValue.aiOutput.inference ? returnObj.modelValue.aiOutput.inference : ""
        returnObj.modelValue.output.defaultOptionIndex = returnObj.modelValue.output.defaultOptionIndex - 1

        this._removeOptionsWithExistingAggregates(returnObj.modelValue.output)
        returnObj.modelValue.output.defaultOptionIndex = Math.min(returnObj.modelValue.output.defaultOptionIndex, returnObj.modelValue.output.options.length - 1)
        if(returnObj.modelValue.output.options.length === 0) 
            throw new Error("No valid options found")

        this._linkValueObjectsToReferencedAggregates(returnObj.modelValue.output)
        this._enrichValueObjectsWithAggregateDetails(returnObj.modelValue.output)
        this._markRecommendedOption(returnObj.modelValue.output)

        if(this.client.input.feedback) {
            returnObj.directMessage = `Re-generating options for ${this.client.input.boundedContextDisplayName} Bounded Context based on user feedback... (${returnObj.modelRawValue.length} characters generated)`
            returnObj.isFeedbackBased = true
        } else {
            returnObj.directMessage = `Generating options for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
        }
    }

    _removeOptionsWithExistingAggregates(output) {
        if(!output || !output.options) return;

        const optionsByAggregateCount = {};
        const filteredOptions = [];

        for (const option of output.options) {
            if (!option.structure) continue;

            let hasExistingAggregate = false;
            for (const aggregateInfo of option.structure) {
                if (!aggregateInfo.aggregate || !aggregateInfo.aggregate.name) continue;
                if (this.client.input.existingAggregates.includes(aggregateInfo.aggregate.name)) {
                    hasExistingAggregate = true;
                    break;
                }
            }
            if (hasExistingAggregate) continue;

            const aggregateCount = option.structure.length;
            if(!aggregateCount) continue
            if (!optionsByAggregateCount[aggregateCount])
                optionsByAggregateCount[aggregateCount] = [];
            
            optionsByAggregateCount[aggregateCount].push(option);
        }

        for (const count in optionsByAggregateCount) {
            if (optionsByAggregateCount[count].length > 0) {
                filteredOptions.push(optionsByAggregateCount[count][0]);
            }
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