const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");

class DraftGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["description", "boundedContext"]
        this.progressCheckStrings = ["step1-requirementsAnalysis", "\"requirements\"", "step2-designPossibleAggregates", "\"aggregates\"", "step3-designPossibleOptions", "\"options\"", "step4-evaluateOptions", "\"evaluationCriteria\"", "\"optionEvaluations\"", "\"overallAssessment\""]
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
5. Do not write comments in the output JSON object.

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

        // Figure out how Aggregate, ValueObject, and Entity can be configured with the requirements you identified in step 1.
        "step2-designPossibleAggregates": {
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
        "step3-designPossibleOptions": {
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
                                    "alias": "value-object-alias"
                                }]
                            }
                        ],
                        "pros": "pros keyword: pros for this option",
                        "cons": "cons keyword: cons for this option"
                    }
                ],
                "defaultOptionIndex": "The index of the option that is selected by default(starts from 0)",
                "conclusions": "Write a conclusion for each option, explaining in which cases it would be best to choose that option."
            }
        },

        // Evaluate the quality and completeness of the designed options
        "step4-evaluateOptions": {
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
            "Functional Requirements": `
We need to create a 'Room Reservation' screen and a 'Reservation Status' screen for managing meeting room reservations.

The 'Room Reservation' screen consists of two main sections: requester information and reservation details. The requester information section displays the requester's name, department, employee ID, office phone, mobile number, request date (YYYY.MM.DD), and approver information. Users can search and select a different approver by clicking a search button that opens a popup.

The reservation details section includes room selection, purpose, meeting type, number of participants, required equipment, reservation period, catering service, and additional notes. Room selection allows users to search available rooms with filters for location (building/floor) and capacity. Meeting type can be selected from a dropdown menu (internal, client meeting, training). The number of participants must be entered as a number. Required equipment can be selected from multiple checkboxes (projector, video conference system, whiteboard). Reservation period requires both date (YYYY.MM.DD) and time (HH:MM) selection using a calendar and time picker. Catering service is optional and includes meal type selection and number of meals if selected. Additional notes is a text field for special requests.

The 'Reservation Status' screen shows all reservations made by the user. It includes filters for date range (reservation date or meeting date) and status (all, pending, approved, rejected, cancelled). The result table displays reservation number, meeting purpose, department, requester name, employee ID, meeting date, request date, approval date, and status. Users can click on individual reservations to view details in a popup window.

The detail popup includes buttons for modification, cancellation, and printing. Modifications are only allowed for reservations in 'pending' status. Cancellation changes the status to 'cancelled' and can only be done before the meeting start time. The print button generates a printable version of the reservation details.

All fields except additional notes are required for submission. The submit button should only be activated when all required fields are filled. All data must be stored in the database upon successful submission.`
        }
    }

    __buildJsonExampleOutputFormat() {
        return JSON.parse(`

{"thoughtProcess":{"step1-requirementsAnalysis":{"thought":"The requirements describe a meeting room reservation system with two main functionalities: room reservation and reservation management. Let's break down the core requirements and identify key entities.","reflection":"We should consider the relationship between reservations and rooms, and how to handle the approval workflow efficiently.","result":{"requirements":[{"name":"reservation-creation","description":"Users must be able to create room reservations with requester details and meeting specifications"},{"name":"room-management","description":"System needs to manage meeting rooms with their properties and availability"},{"name":"approval-workflow","description":"Reservations require approval process with different status management"},{"name":"equipment-handling","description":"Rooms can have different equipment configurations that need to be tracked"},{"name":"catering-service","description":"Optional catering services can be added to reservations"}]}},"step2-designPossibleAggregates":{"thought":"We need to identify the main aggregates that will form the core of our domain model. The reservation process seems to be the main focus.","reflection":"We should consider separating room management from reservations to allow independent scaling and maintenance.","result":{"aggregates":[{"name":"Reservation","alias":"reservation","entities":["Requester","Approver"],"valueObjects":["ReservationPeriod","CateringDetails"],"usedRequestNames":["reservation-creation","approval-workflow","catering-service"]},{"name":"Room","alias":"room","entities":["Equipment"],"valueObjects":["Location","Capacity"],"usedRequestNames":["room-management","equipment-handling"]}]}},"step3-designPossibleOptions":{"thought":"Let's create different options for organizing these aggregates, considering various trade-offs.","reflection":"We should consider both tight and loose coupling approaches between Room and Reservation.","result":{"options":[{"structure":[{"aggregate":{"name":"Reservation","alias":"Reservation"},"entities":[{"name":"Requester","alias":"Requester"},{"name":"Approver","alias":"Approver"}],"valueObjects":[{"name":"ReservationPeriod","alias":"ReservationPeriod"},{"name":"CateringDetails","alias":"CateringDetails"}]},{"aggregate":{"name":"Room","alias":"Room"},"entities":[{"name":"Equipment","alias":"Equipment"}],"valueObjects":[{"name":"Location","alias":"Location"},{"name":"Capacity","alias":"Capacity"}]}],"pros":"Each aggregate is managed independently providing good scalability, clear separation of responsibilities between room management and reservation management","cons":"Requires querying between two aggregates when checking reservation availability"},{"structure":[{"aggregate":{"name":"RoomReservation","alias":"RoomReservation"},"entities":[{"name":"Room","alias":"Room"},{"name":"Requester","alias":"Requester"},{"name":"Approver","alias":"Approver"}],"valueObjects":[{"name":"ReservationPeriod","alias":"ReservationPeriod"},{"name":"Equipment","alias":"Equipment"},{"name":"CateringDetails","alias":"CateringDetails"}]}],"pros":"All reservation-related information is managed in a single aggregate, making queries simple","cons":"The aggregate may become too large making changes difficult, and room management functionality may be limited to expand"}],"defaultOptionIndex":0,"conclusions":"The first option provides better scalability and maintainability by clearly separating room management and reservation management responsibilities. The second option is easier to implement in simple systems but may become harder to manage as the system grows."}},"step4-evaluateOptions":{"thought":"Let's evaluate both options against key DDD principles and system requirements","reflection":"We need to ensure the chosen design supports scalability, maintainability, and proper domain alignment","result":{"evaluationCriteria":{"domainAlignment":{"score":"90","details":["Both options clearly represent the core domain concepts of reservations and rooms","The separation of concerns aligns well with business operations"],"improvements":["Consider adding domain events for reservation status changes"]},"aggregateDesign":{"score":"85","details":["Option 1 maintains clear aggregate boundaries","Option 2 provides simpler transaction management"],"issues":["Option 2's aggregate might grow too large over time","Option 1 requires careful consistency management between aggregates"]},"boundaryConsistency":{"score":"80","details":["Both options maintain clear bounded contexts","Transaction boundaries are well-defined"],"inconsistencies":["Room availability checking might need eventual consistency in Option 1"]},"maintainability":{"score":"95","details":["Option 1 allows independent evolution of room and reservation features","Separation of concerns makes code organization clearer"],"concerns":["Option 2 might require more frequent changes across the entire aggregate"]},"valueObjectUsage":{"score":"85","details":["Appropriate use of value objects for ReservationPeriod and Location","CateringDetails as value object captures related attributes well"],"opportunities":["Could consider making Equipment a value object in Option 1"]}},"optionEvaluations":[{"optionIndex":0,"strengths":["Clear separation of concerns","Independent scalability","Better maintainability"],"weaknesses":["More complex querying","Eventual consistency challenges"],"score":"88"},{"optionIndex":1,"strengths":["Simpler implementation","Stronger consistency guarantees","Easier querying"],"weaknesses":["Limited scalability","Risk of aggregate growth","Tighter coupling"],"score":"75"}],"overallAssessment":{"bestOptionIndex":0,"justification":"Option 1 provides better long-term maintainability and scalability, which are crucial for a reservation system that might need to handle multiple locations and complex booking rules in the future","recommendedImprovements":[{"area":"Consistency Management","description":"Implement eventual consistency patterns for room availability checks","applicableOptions":["0"]},{"area":"Domain Events","description":"Add domain events for reservation status changes to improve integration","applicableOptions":["0","1"]}]},"needsRevision":false}}}}

        `.trim())
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Functional Requirements": this.client.input.description,

            "Final Check List": `
* Ensure all user requirements are adequately addressed
* Verify there are no Entities or ValueObjects with single property or unnecessary properties
* Remove any redundant or meaningless options
* Confirm all object name properties are in English and alias properties are in ${this.preferredLanguage} language
`
        }
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Generating options for ${this.client.input.boundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        returnObj.modelValue.output = returnObj.modelValue.aiOutput.thoughtProcess["step3-designPossibleOptions"].result
        returnObj.directMessage = `Generating options for ${this.client.input.boundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }
}

module.exports = DraftGeneratorByFunctions;