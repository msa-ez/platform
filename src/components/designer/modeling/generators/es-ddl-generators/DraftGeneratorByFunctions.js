const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil");

class DraftGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["description", "boundedContext", "accumulatedDrafts"]
        this.progressCheckStrings = ["step1-requirementsAnalysis", "requirements", "step2-determineReferencedAggregates", "referencedAggregates", "step3-designPossibleAggregate", "aggregates", "step4-designPossibleOptions", "structure", "defaultOptionIndex", "step5-evaluateOptions", "optionEvaluations"]
    }

    static outputToAccumulatedDrafts(output, targetBoundedContext){
        return {
            [targetBoundedContext.name]: output.options[output.defaultOptionIndex].structure
        }
    }

    static esValueToAccumulatedDrafts(esValue, targetBoundedContext){
        let accumulatedDrafts = {}

        const summarizedESValue = ESValueSummarizeUtil.getSummarizedESValue(esValue)
        for(const boundedContextInfo of Object.values(summarizedESValue)){
            let structure = []

            if(boundedContextInfo.name !== targetBoundedContext.name) {
                for(const aggregateInfo of Object.values(boundedContextInfo.aggregates)){
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
    }


    __buildAgentRolePrompt(){
        return `You are an experienced domain-driven design (DDD) architect specializing in aggregate design. Your expertise lies in:
- Breaking down complex domains into well-structured aggregates
- Identifying appropriate boundaries between entities and value objects
- Ensuring proper encapsulation and consistency within aggregates
- Designing maintainable and scalable domain models
- Balancing between different design options based on business requirements
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You are required to write a proposal on how to define multiple Aggregates in a given Bounded Context via a passed in functional requirements.

Please follow these rules.
1. Generate suggestions that match all functional requirements requested by users.
2. Instead of putting all properties into a single Aggregate, put multiple Aggregates or some properties into ValueObjects and Entities for better maintainability.
3. Avoid creating unnecessary ValueObjects and Entities with only one property, and only create them if they are useful enough.
4. In the draft, the name of each object should be written in English, and the rest of the content (alias, pros, cons, conclusions, etc.) should be written in ${this.preferredLanguage} language so that it is easily understood by the user.
5. If there is already an Aggregate that you want to create from draft information for another Bounded Context, you should not create a duplicate Aggregate, but rather create it to contain a ValueObject that will leverage a foreign key to reference the existing Aggregate.
6. If an Aggregate needs to reference another Aggregate, it must have a ValueObject for that Aggregate that can be referenced by a foreign key.
7. Do not write comments in the output JSON object.

Recommendation Instructions to write proposal.
1. Aggregates inside a bounded context can have ValueObjects or Entities, and they can have relationships between them.
2. Generate different options based on each of the perspectives provided by ACID.
3. Create at least two unique, non-duplicate options.
4. You should ultimately choose the best option out of the several options and write why, which will be selected by default.
`
    }

    __buildJsonResponseFormat() {
        return `
{
    "thoughtProcess": {
        // Analyse the user's needs as much as possible and rewrite the requirements to be specific and clear.
        "step1-requirementsAnalysis": {
            "thought": "thought process for request analysis",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "requirements": [
                    {name: "requirement-name", description: "requirement-description"},
                    ...
                ]
            }
        },

        // Determine which Aggregates will be referenced by the ValueObject foreign key, if there is an existing draft.
        "step2-determineReferencedAggregates": {
            "thought": "thought process for aggregate design",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "referencedAggregates": [
                    {
                        "name": "aggregate-name",
                        "referencedValueObjectNameToUse": "value-object-name",
                        "purpose": "Purpose of using Aggregate as a reference"
                    }
                ]
            }
        },

        // Figure out how Aggregate, ValueObject, and Entity can be configured with the requirements you identified in step 1.
        // If you have a referencedValueObjectNameToUse to use in step2, include that ValueObject.
        "step3-designPossibleAggregate": {
            "thought": "thought process for aggregate design",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "aggregates": [
                    {
                        "name": "aggregate-name",
                        "alias": "aggregate-alias",
                        "entities": ["entity-name-1", ...],
                        "valueObjects": ["value-object-name-1", ...],
                        "usedRequestNames": ["requirement-name-1", ...]
                    }
                ]
            }
        },

        // Consider how you can leverage the Aggregates you configured in step2 to create your own options.
        "step4-designPossibleOptions": {
            "thought": "thought process for option design",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "options": [
                    {
                        "structure": [
                            {
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
                "defaultOptionIndex": "The index of the option that is selected by default(starts from 1)",
                "conclusions": "Write a conclusion for each option, explaining in which cases it would be best to choose that option."
            }
        },

        // Evaluate the quality and completeness of the designed options
        "step5-evaluateOptions": {
            "thought": "Evaluate the quality and completeness of the designed options",
           "reflection": "Consider if the options effectively address the requirements and follow DDD best practices",
           "result": {
               "evaluationCriteria": {
                   "domainAlignment": {
                       "score": "<0-100>",
                       "details": ["<domain alignment detail>", ...],
                       "improvements": ["<suggested domain improvement>", ...]
                   },
                   "aggregateDesign": {
                       "score": "<0-100>",
                       "details": ["<aggregate design detail>", ...],
                       "issues": ["<identified design issue>", ...]
                   },
                   "boundaryConsistency": {
                       "score": "<0-100>",
                       "details": ["<boundary consistency detail>", ...],
                       "inconsistencies": ["<identified inconsistency>", ...]
                   },
                   "maintainability": {
                       "score": "<0-100>",
                       "details": ["<maintainability detail>", ...],
                       "concerns": ["<maintainability concern>", ...]
                   },
                   "valueObjectUsage": {
                       "score": "<0-100>",
                       "details": ["<value object usage detail>", ...],
                       "opportunities": ["<missed value object opportunity>", ...]
                   }
               },
               "optionEvaluations": [
                   {
                       "optionIndex": "<index of option from step3>",
                       "strengths": ["<strength of this option>", ...],
                       "weaknesses": ["<weakness of this option>", ...],
                       "score": "<0-100>"
                   }
               ],
               "overallAssessment": {
                   "bestOptionIndex": "<index of best option>",
                   "justification": "<explanation of why this option is best>",
                   "recommendedImprovements": [
                       {
                           "area": "<improvement area>",
                           "description": "<improvement description>",
                           "applicableOptions": ["<option index>", ...]
                       }
                   ]
               },
               "needsRevision": "<true|false>" // true if best option score < 80
           }
       }
    }
}`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Accumulated Drafts": {
                "UserManagement": [
                    {
                        "aggregate": {
                            "name": "Employee",
                            "alias": "Employee"
                        },
                        "entities": [{
                            "name": "Department",
                            "alias": "Department"
                        }],
                        "valueObjects": [{
                            "name": "EmployeeContact",
                            "alias": "Employee Contact"
                        }]
                    }
                ],
                "AssetManagement": [
                    {
                        "aggregate": {
                            "name": "MeetingRoom",
                            "alias": "Meeting Room"
                        },
                        "entities": [{
                            "name": "Equipment",
                            "alias": "Room Equipment"
                        }],
                        "valueObjects": [{
                            "name": "RoomLocation",
                            "alias": "Room Location"
                        }]
                    }
                ]
            },

            "Target Bounded Context Name": "RoomReservation",

            "Functional Requirements": `
We need to implement a meeting room reservation system with the following features:

1. Reservation Creation:
   - Users must provide their employee information (name, department, ID)
   - Room selection with capacity and location filters
   - Meeting details (type, participants, equipment needs)
   - Time slot selection (date and time range)
   - Optional catering service
   - Approval workflow

2. Reservation Management:
   - View all reservations with filtering options
   - Status tracking (pending, approved, rejected, cancelled)
   - Modification capability for pending reservations
   - Cancellation before meeting start time
   - Printable reservation details

3. Business Rules:
   - All fields except notes are mandatory
   - Room double-booking prevention
   - Status changes must be tracked
   - Only pending reservations can be modified
   - Cancellation allowed only before start time`
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "thoughtProcess": {
                "step1-requirementsAnalysis": {
                    "thought": "Breaking down the requirements into core domain concepts and rules",
                    "reflection": "Need to consider both single and multi-aggregate approaches",
                    "result": {
                        "requirements": [
                            {
                                "name": "reservation-creation",
                                "description": "Core reservation creation process with employee and room details"
                            },
                            {
                                "name": "approval-workflow",
                                "description": "Reservation approval process and status management"
                            },
                            {
                                "name": "booking-rules",
                                "description": "Business rules for reservation management including double-booking prevention"
                            },
                            {
                                "name": "catering-service",
                                "description": "Optional catering service management for reservations"
                            }
                        ]
                    }
                },
                "step2-determineReferencedAggregates": {
                    "thought": "Identifying existing aggregates that need to be referenced",
                    "reflection": "Both Employee and MeetingRoom must be referenced via value objects",
                    "result": {
                        "referencedAggregates": [
                            {
                                "name": "Employee",
                                "referencedValueObjectNameToUse": "RequesterInfo",
                                "purpose": "To reference employee details for reservation requests"
                            },
                            {
                                "name": "MeetingRoom",
                                "referencedValueObjectNameToUse": "RoomReference",
                                "purpose": "To reference room information for reservations"
                            }
                        ]
                    }
                },
                "step3-designPossibleAggregate": {
                    "thought": "Designing aggregates based on business requirements",
                    "reflection": "Consider both monolithic and split aggregate approaches",
                    "result": {
                        "aggregates": [
                            {
                                "name": "RoomReservation",
                                "alias": "Meeting Room Reservation",
                                "entities": ["ReservationDetails", "CateringOrder"],
                                "valueObjects": ["RequesterInfo", "RoomReference", "TimeSlot", "ReservationStatus"],
                                "usedRequestNames": ["reservation-creation", "booking-rules", "catering-service"]
                            },
                            {
                                "name": "CateringService",
                                "alias": "Catering Service",
                                "entities": ["MenuItems", "ServiceSchedule"],
                                "valueObjects": ["ServiceDetails", "ReservationReference"],
                                "usedRequestNames": ["catering-service"]
                            }
                        ]
                    }
                },
                "step4-designPossibleOptions": {
                    "thought": "Creating different structural options based on business requirements",
                    "reflection": "Need to balance between simplicity and proper domain separation",
                    "result": {
                        "options": [
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "RoomReservation",
                                            "alias": "Meeting Room Reservation"
                                        },
                                        "entities": [
                                            {
                                                "name": "ReservationDetails",
                                                "alias": "Reservation Details"
                                            },
                                            {
                                                "name": "CateringOrder",
                                                "alias": "Catering Order"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "RequesterInfo",
                                                "alias": "Requester Information",
                                                "referencedAggregateName": "Employee"
                                            },
                                            {
                                                "name": "RoomReference",
                                                "alias": "Room Reference",
                                                "referencedAggregateName": "MeetingRoom"
                                            },
                                            {
                                                "name": "TimeSlot",
                                                "alias": "Time Slot"
                                            },
                                            {
                                                "name": "ReservationStatus",
                                                "alias": "Reservation Status"
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "Strong internal cohesion with all reservation-related components together",
                                    "coupling": "Minimal external dependencies with clear transaction boundaries",
                                    "consistency": "Unified handling of reservation and catering data",
                                    "encapsulation": "Well-encapsulated reservation lifecycle management",
                                    "complexity": "Straightforward structure with simple transaction flows",
                                    "independence": "Self-contained aggregate with clear responsibilities",
                                    "performance": "Efficient single-transaction operations for all reservation operations"
                                },
                                "cons": {
                                    "cohesion": "May violate single responsibility principle as features grow",
                                    "coupling": "Tight coupling between reservation and catering concerns",
                                    "consistency": "Risk of becoming a god object over time",
                                    "encapsulation": "May expose unnecessary catering details to reservation handlers",
                                    "complexity": "Potential for growing complexity with additional features",
                                    "independence": "Limited ability to evolve catering features independently",
                                    "performance": "Possible performance bottlenecks with large aggregate size"
                                }
                            },
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "RoomReservation",
                                            "alias": "Meeting Room Reservation"
                                        },
                                        "entities": [
                                            {
                                                "name": "ReservationDetails",
                                                "alias": "Reservation Details"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "RequesterInfo",
                                                "alias": "Requester Information",
                                                "referencedAggregateName": "Employee"
                                            },
                                            {
                                                "name": "RoomReference",
                                                "alias": "Room Reference",
                                                "referencedAggregateName": "MeetingRoom"
                                            },
                                            {
                                                "name": "TimeSlot",
                                                "alias": "Time Slot"
                                            },
                                            {
                                                "name": "ReservationStatus",
                                                "alias": "Reservation Status"
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "CateringService",
                                            "alias": "Catering Service"
                                        },
                                        "entities": [
                                            {
                                                "name": "MenuItems",
                                                "alias": "Menu Items"
                                            },
                                            {
                                                "name": "ServiceSchedule",
                                                "alias": "Service Schedule"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "ServiceDetails",
                                                "alias": "Service Details"
                                            },
                                            {
                                                "name": "ReservationReference",
                                                "alias": "Reservation Reference",
                                                "referencedAggregateName": "RoomReservation"
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "High cohesion with clear separation between reservation and catering concerns",
                                    "coupling": "Loose coupling between core reservation and catering services",
                                    "consistency": "Clear boundaries for each domain concept",
                                    "encapsulation": "Strong encapsulation of domain-specific logic",
                                    "complexity": "Manageable complexity through clear separation",
                                    "independence": "Allows independent evolution of each aggregate",
                                    "performance": "Enables separate scaling and optimization strategies"
                                },
                                "cons": {
                                    "cohesion": "Additional coordination needed between aggregates",
                                    "coupling": "Increased complexity in managing aggregate references",
                                    "consistency": "Challenges in maintaining cross-aggregate consistency",
                                    "encapsulation": "Need for careful transaction boundary management",
                                    "complexity": "Additional complexity in inter-aggregate communication",
                                    "independence": "Requires more sophisticated error handling",
                                    "performance": "Potential overhead from distributed transactions"
                                }
                            }
                        ],
                        "defaultOptionIndex": 2,
                        "conclusions": "Option 2 is recommended as it provides better separation of concerns and scalability. The split between RoomReservation and CateringService allows for independent evolution of each concept while maintaining necessary references through value objects."
                    }
                },
                "step5-evaluateOptions": {
                    "thought": "Evaluating options based on DDD principles and business requirements",
                    "reflection": "Both options have merits, but separation of concerns is crucial for long-term maintainability",
                    "result": {
                        "evaluationCriteria": {
                            "domainAlignment": {
                                "score": "90",
                                "details": [
                                    "Clear separation of reservation and catering concerns",
                                    "Proper use of value objects for references"
                                ],
                                "improvements": [
                                    "Could consider additional validation rules in value objects"
                                ]
                            },
                            "aggregateDesign": {
                                "score": "85",
                                "details": [
                                    "Well-defined aggregate boundaries",
                                    "Proper use of entities and value objects"
                                ],
                                "issues": [
                                    "Need to ensure proper handling of eventual consistency between aggregates"
                                ]
                            }
                        },
                        "optionEvaluations": [
                            {
                                "optionIndex": 0,
                                "strengths": [
                                    "Simpler transaction management",
                                    "Easier to maintain consistency"
                                ],
                                "weaknesses": [
                                    "Less flexible for future changes",
                                    "Potential for large aggregate"
                                ],
                                "score": "75"
                            },
                            {
                                "optionIndex": 1,
                                "strengths": [
                                    "Better separation of concerns",
                                    "More flexible for future changes",
                                    "Independent scaling possible"
                                ],
                                "weaknesses": [
                                    "More complex consistency management",
                                    "Requires careful transaction boundaries"
                                ],
                                "score": "85"
                            }
                        ],
                        "overallAssessment": {
                            "bestOptionIndex": 1,
                            "justification": "Option 1 provides better long-term maintainability and scalability through proper domain separation",
                            "recommendedImprovements": [
                                {
                                    "area": "Consistency Management",
                                    "description": "Implement eventual consistency patterns between aggregates",
                                    "applicableOptions": ["1"]
                                }
                            ]
                        },
                        "needsRevision": false
                    }
                }
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Accumulated Drafts": this.client.input.accumulatedDrafts,

            "Target Bounded Context Name": this.client.input.boundedContext.name,

            "Functional Requirements": this.client.input.description,

            "Final Check List": `
* Ensure all user requirements are adequately addressed
* Verify there are no Entities or ValueObjects with single property or unnecessary properties
* Remove any redundant or meaningless options
* Confirm all object name properties are in English and alias properties are in ${this.preferredLanguage} language
* If you already have an Aggregate in the draft that was created, you need to create it so that you can reference it as a ValueObject.
* If the option you are creating has more than one Aggregate, consider whether one of those Aggregates can be referenced by the foreign key ValueObject. Ex) If the option is to create an order with a customer, the order can have a customer Aggregate as a ValueObject
`,

            "Guidelines": `
* The following Aggregate should not be created because it already exists, but should be made to reference a ValueObject.: ${(this.client.input.existingAggregates && this.client.input.existingAggregates.length > 0) ? this.client.input.existingAggregates.join(", ") : "None"}
`
        }
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Generating options for ${this.client.input.boundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        returnObj.modelValue.output = returnObj.modelValue.aiOutput.thoughtProcess["step4-designPossibleOptions"].result
        returnObj.modelValue.output.defaultOptionIndex = returnObj.modelValue.output.defaultOptionIndex - 1
        
        this._removeOptionsWithExistingAggregates(returnObj.modelValue.output)
        if(returnObj.modelValue.output.options.length <= 1) 
            throw new Error("No valid options found")

        this._linkValueObjectsToReferencedAggregates(returnObj.modelValue.output, returnObj.modelValue.aiOutput.thoughtProcess["step2-determineReferencedAggregates"])
        this._enrichValueObjectsWithAggregateDetails(returnObj.modelValue.output)
        this._markRecommendedOption(returnObj.modelValue.output)

        returnObj.directMessage = `Generating options for ${this.client.input.boundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    // existingAggregates를 다시 Aggregate로 생성하는 유효하지 않은 옵션을 필터링함
    _removeOptionsWithExistingAggregates(output) {
        if(!output || !output.options) return

        const filteredOptions = []
        for(const option of output.options) {
            if(!option.structure) continue

            for(const aggregateInfo of option.structure) {
                if(this.client.input.existingAggregates.includes(aggregateInfo.aggregate.name)) continue
            }

            filteredOptions.push(option)
        }

        output.options = filteredOptions
    }

    // step2-determineReferencedAggregates에서 추출해서 해당 ValueObject의 이름을 사용했으나, referencedAggregateName을 제대로 작성하지 않은 경우, 해당 속성을 추가해줌
    _linkValueObjectsToReferencedAggregates(output, referencedAggregates) {
        if(!output || !output.options) return
        if(!referencedAggregates.result || !referencedAggregates.result.referencedAggregates) return

        let validAggregateNames = this.__getValidAggregateNames(output)
        for(const option of output.options) {
            if(!option.structure) continue

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

        let validAggregateNames = this.__getValidAggregateNames(output)
        for(const option of output.options) {
            if(!option.structure) continue

            for(const aggregate of option.structure) {
                if(!aggregate.valueObjects) continue

                for(const valueObject of aggregate.valueObjects) {
                    if(!valueObject.referencedAggregateName) continue
                    if(!validAggregateNames.includes(valueObject.referencedAggregateName)){
                        delete valueObject.referencedAggregateName
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

    __getValidAggregateNames(output) {
        let validAggregateNames = this.client.input.validAggregateNames ? this.client.input.validAggregateNames : []

        for(const option of output.options) {
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