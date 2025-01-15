const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { ESValueSummarizeWithFilter } = require("../helpers")

class DraftGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["description", "boundedContext", "accumulatedDrafts"]
        this.progressCheckStrings = ["overviewThoughts", "options", "analysis", "defaultOptionIndex"]
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


    onGenerateBefore(inputParams){
        const existingAggregates = []
        for(const aggregateInfos of Object.values(inputParams.accumulatedDrafts)) {
            for(const aggregateInfo of aggregateInfos) {
                if(aggregateInfo.aggregate) existingAggregates.push(aggregateInfo.aggregate.name)
            }
        }
        inputParams.existingAggregates = existingAggregates
        inputParams.boundedContextDisplayName = inputParams.boundedContext.displayName ? inputParams.boundedContext.displayName : inputParams.boundedContext.name
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
        return `You are tasked with drafting a proposal for defining multiple Aggregates within a given Bounded Context based on provided functional requirements.

Please adhere to the following guidelines:
1. Ensure all suggestions align with the user's functional requirements.
2. Maintain transactional consistency by keeping transaction-critical data within a single Aggregate:
   - Do not split core transaction data (e.g., loan and loan details, order and order items)
   - Keep data that must be updated atomically in the same Aggregate
   - Consider business invariants when defining Aggregate boundaries
3. Distribute properties across ValueObjects and Entities within an Aggregate to enhance maintainability.
4. Avoid creating ValueObjects and Entities with only a single property unless they provide significant value.
5. Object names should be in English, while aliases, pros, cons, conclusions, etc., should be in ${this.preferredLanguage} language for clarity.
6. If an Aggregate already exists in another Bounded Context, avoid duplication. Instead, create a ValueObject that references the existing Aggregate via a foreign key.
7. Aggregates that reference other Aggregates must include a ValueObject for the referenced Aggregate, using a foreign key.
8. Ensure that any Aggregate referenced via a ValueObject exists in accumulatedDrafts or is created within the current option.
9. If a similar Aggregate already exists in 'Accumulated Drafts' for an Entity analysed in 'Functional Requirements', you need to create a ValueObject reference to that Aggregate instead of creating it yourself.
10. Do not include comments in the output JSON object.
11. **Avoid creating bidirectional references between Aggregates. Aggregate references should be unidirectional. For example, if 'Order' references 'Customer', 'Customer' should not directly reference 'Order'.**
    * **When deciding which Aggregate should reference another, consider the ownership and immutability. Typically, the Aggregate that owns the other or has a lifecycle dependency on the other should hold the reference. For example, 'Order' should reference 'Customer' because an order is always associated with a customer, and the customer's lifecycle is independent of the order. Conversely, 'Customer' should not reference 'Order' because a customer can exist without any orders.**


Proposal Writing Recommendations:
1. Aggregates should represent complete business capabilities and maintain their invariants:
   - Keep transaction-critical data together
   - Consider lifecycle dependencies
   - Ensure business rules can be enforced within the Aggregate boundary
2. Generate distinct options considering:
   - Transactional consistency requirements
   - Business invariants
   - Performance implications
   - Scalability needs
3. Select the best option from the generated options and explain the rationale for its selection, marking it as the default choice.

Best Option Selection Guidelines:
1. Transactional Consistency
   - Maintains atomic operations within aggregate boundaries
   - Preserves business invariants effectively
   - Handles concurrent operations safely

2. Performance & Scalability
   - Minimizes cross-aggregate references
   - Enables efficient querying patterns
   - Supports independent scaling of components

3. Domain Alignment
   - Reflects natural business boundaries
   - Captures essential business rules
   - Maintains semantic clarity

4. Maintainability
   - Clear separation of concerns
   - Minimal duplication
   - Sustainable complexity level

5. Future Flexibility
   - Accommodates expected changes
   - Supports business growth
   - Allows feature extensions

Priority: Consistency > Domain Alignment > Performance > Maintainability > Flexibility
`
    }

    __buildJsonResponseFormat() {
        return `
{
    "overviewThoughts": {
        "summary": "High-level analysis of the bounded context and its requirements",
        "details": {
            "domainComplexity": "Assessment of domain complexity and core business challenges",
            "boundaryDefinition": "Analysis of bounded context boundaries and relationships",
            "strategicFit": "Evaluation of how the design aligns with overall domain strategy"
        },
        "additionalConsiderations": "Other strategic factors affecting the bounded context design"
    },

    "result": {
        "options": [
            {
                "optionThoughts": {
                    "summary": "Analysis of specific design option and its implications",
                    "details": {
                        "consistencyModel": "Analysis of consistency requirements and transaction boundaries",
                        "scalabilityFactors": "Evaluation of growth factors and performance requirements",
                        "maintainabilityImpact": "Assessment of long-term maintenance and evolution considerations"
                    },
                    "additionalConsiderations": "Specific technical or business factors affecting this option"
                },
                "structure": [
                    {
                        "structureThoughts": {
                            "summary": "Detailed analysis of specific aggregate structure",
                            "details": {
                                "aggregateBoundaries": "Reasoning for chosen aggregate boundaries and composition",
                                "invariantProtection": "How the structure maintains business rules and invariants",
                                "relationshipPatterns": "Analysis of relationships with other aggregates and entities"
                            },
                            "additionalConsiderations": "Implementation-specific considerations for this structure"
                        },
                        "aggregate": {
                            "name": "aggregate-name",
                            "alias": "aggregate-alias"
                        },
                        "entities": [{
                            "name": "entity-name",
                            "alias": "entity-alias"
                        }],
                        "valueObjects": [{
                            "name": "value-object-name",
                            "alias": "value-object-alias",
                            ["referencedAggregateName": "aggregate-name"] // Optional. If there is a referencedAggregateName, it means that the ValueObject is used to reference the Aggregate. You can write the name of an Aggregate created from the same option, as well as an existing Aggregate.
                        }]
                    }
                ],
                "analysis": {
                    "transactionalConsistency": "Transactional consistency for this option",
                    "performanceScalability": "Performance & Scalability for this option",
                    "domainAlignment": "Domain Alignment for this option",
                    "maintainability": "Maintainability for this option",
                    "futureFlexibility": "Future Flexibility for this option"
                },
                "pros": {
                    "cohesion": "cohesion for this option",
                    "coupling": "coupling for this option",
                    "consistency": "consistency for this option",
                    "encapsulation": "encapsulation for this option",
                    "complexity": "complexity for this option",
                    "independence": "independence for this option",
                    "performance": "performance for this option"
                },
                "cons": {
                    "cohesion": "cohesion for this option",
                    "coupling": "coupling for this option",
                    "consistency": "consistency for this option",
                    "encapsulation": "encapsulation for this option",
                    "complexity": "complexity for this option",
                    "independence": "independence for this option",
                    "performance": "performance for this option"
                }
            }
        ],

        // Based on our analysis of each option, we'll recommend a default option that's right for you.
        "defaultOptionIndex": "The index of the option that is selected by default(starts from 1)",
        "conclusions": "Write a conclusion for each option, explaining in which cases it would be best to choose that option."
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
            "overviewThoughts": {
                "summary": "Comprehensive analysis of the hotel booking domain and its aggregate design requirements",
                "details": {
                    "domainComplexity": "Hotel booking system requires careful balance between transactional consistency and scalability",
                    "boundaryDefinition": "Clear separation needed between core booking operations and supplementary features",
                    "strategicFit": "Design must support both immediate booking needs and future expansion of hotel services"
                },
                "additionalConsiderations": "Integration with external systems and handling of peak booking periods"
            },
    
            "result": {
                "options": [
                    {
                        "optionThoughts": {
                            "summary": "Single aggregate approach focusing on strong consistency",
                            "details": {
                                "consistencyModel": "Maintains atomic operations within single aggregate boundary",
                                "scalabilityFactors": "Simplified scaling with potential bottlenecks during peak periods",
                                "maintainabilityImpact": "Straightforward maintenance with risk of growing complexity"
                            },
                            "additionalConsiderations": "Consider caching strategies for read-heavy operations"
                        },
                        "structure": [
                            {
                                "structureThoughts": {
                                    "summary": "Unified booking aggregate with embedded details",
                                    "details": {
                                        "aggregateBoundaries": "Single aggregate maintaining complete booking lifecycle",
                                        "invariantProtection": "Direct enforcement of booking rules and constraints",
                                        "relationshipPatterns": "Value object references to Guest and Room aggregates"
                                    },
                                    "additionalConsiderations": "Consider impact on concurrent booking operations"
                                },
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
                        "analysis": {
                            "transactionalConsistency": "Strong consistency within single aggregate boundary ensures atomic operations for booking lifecycle",
                            "performanceScalability": "Good performance for basic operations but may face scaling challenges with complex queries",
                            "domainAlignment": "Closely aligned with core booking domain concepts and business rules",
                            "maintainability": "Simple structure makes maintenance straightforward but may become complex as features grow",
                            "futureFlexibility": "Limited flexibility for extensive feature additions without structural changes"
                        },
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
                        "optionThoughts": {
                            "summary": "Split aggregate approach prioritizing scalability",
                            "details": {
                                "consistencyModel": "Eventually consistent model between core booking and details",
                                "scalabilityFactors": "Independent scaling of booking core and supplementary features",
                                "maintainabilityImpact": "Separated concerns enable focused maintenance"
                            },
                            "additionalConsiderations": "Need for coordination between split aggregates"
                        },
                        "structure": [
                            {
                                "structureThoughts": {
                                    "summary": "Core booking aggregate focused on essential reservation data",
                                    "details": {
                                        "aggregateBoundaries": "Minimal core booking data with separate details",
                                        "invariantProtection": "Core booking rules maintained in primary aggregate",
                                        "relationshipPatterns": "References to Guest and Room plus BookingDetail"
                                    },
                                    "additionalConsiderations": "Transaction coordination with details aggregate"
                                },
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
                                "structureThoughts": {
                                    "summary": "Separate aggregate for booking details and preferences",
                                    "details": {
                                        "aggregateBoundaries": "Contains supplementary booking information",
                                        "invariantProtection": "Maintains detail-specific rules independently",
                                        "relationshipPatterns": "References primary booking aggregate"
                                    },
                                    "additionalConsiderations": "Eventually consistent with main booking"
                                },
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
                        "analysis": {
                            "transactionalConsistency": "Requires careful coordination between booking and detail aggregates but enables fine-grained consistency control",
                            "performanceScalability": "Better scalability through separate scaling of booking and detail components",
                            "domainAlignment": "Clear separation of core booking concepts from supplementary details reflects domain complexity",
                            "maintainability": "Separated concerns enable focused maintenance and evolution of each component",
                            "futureFlexibility": "High flexibility for adding new features to either booking core or details independently"
                        },
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
        return {
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
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Generating options for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        returnObj.modelValue.output = returnObj.modelValue.aiOutput.result
        returnObj.modelValue.output.defaultOptionIndex = returnObj.modelValue.output.defaultOptionIndex - 1

        this._removeThoughts(returnObj.modelValue.output)
        this._removeOptionsWithExistingAggregates(returnObj.modelValue.output)
        returnObj.modelValue.output.defaultOptionIndex = Math.min(returnObj.modelValue.output.defaultOptionIndex, returnObj.modelValue.output.options.length - 1)
        if(returnObj.modelValue.output.options.length === 0) 
            throw new Error("No valid options found")

        this._linkValueObjectsToReferencedAggregates(returnObj.modelValue.output)
        this._enrichValueObjectsWithAggregateDetails(returnObj.modelValue.output)
        this._markRecommendedOption(returnObj.modelValue.output)

        returnObj.directMessage = `Generating options for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    _removeThoughts(output) {
        if(!output || !output.options) return;
    
        for(const option of output.options) {
            if(option.optionThoughts) {
                delete option.optionThoughts;
            }
            
            if(option.structure) {
                for(const structure of option.structure) {
                    if(structure.structureThoughts) {
                        delete structure.structureThoughts;
                    }
                }
            }
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
                if (this.client.input.existingAggregates.includes(aggregateInfo.aggregate.name)) {
                    hasExistingAggregate = true;
                    break;
                }
            }
            if (hasExistingAggregate) continue;

            const aggregateCount = option.structure.length;
            if (!optionsByAggregateCount[aggregateCount]) {
                optionsByAggregateCount[aggregateCount] = [];
            }
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
            
            for(const aggregate of option.structure)
                if(!validAggregateNames.includes(aggregate.aggregate.name))
                    validAggregateNames.push(aggregate.aggregate.name)
        }

        for(const accumulatedDraft of Object.values(this.client.input.accumulatedDrafts)) {
            for(const aggregateInfo of accumulatedDraft) {
                if(!validAggregateNames.includes(aggregateInfo.aggregate.name))
                    validAggregateNames.push(aggregateInfo.aggregate.name)
            }
        }

        return validAggregateNames
    }

    __findAggregateAliasByName(aggregateName, output) {
        for(const aggregateInfos of Object.values(this.client.input.accumulatedDrafts)) {
            for(const aggregateInfo of aggregateInfos)
                if(aggregateInfo.aggregate.name === aggregateName) return aggregateInfo.aggregate.alias
        }

        for(const option of output.options) {
            if(!option.structure) continue

            for(const aggregate of option.structure) {
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