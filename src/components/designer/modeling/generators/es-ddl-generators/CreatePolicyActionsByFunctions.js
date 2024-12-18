
const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESActionsUtil = require("./modules/ESActionsUtil")
const ESValueSummarizeUtil_OnlyNameWithId = require("./modules/ESValueSummarizeUtil_OnlyNameWithId")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class CreatePolicyActionsByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "description", "esValue", "userInfo", "information"]
        this.progressCheckStrings = ["thoughts", "inference", "reflection", "extractedPolicies"]
    }


    onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        inputParams.boundedContextDisplayName = inputParams.targetBoundedContext.displayName ? inputParams.targetBoundedContext.displayName : inputParams.targetBoundedContext.name
        this.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
    }


    __buildAgentRolePrompt(){
        return `You are an expert policy designer and DDD architect specializing in event-driven systems. Your expertise includes:
- Analyzing business requirements to derive effective policies and automation rules
- Designing event-driven workflows with clear policy triggers and actions
- Creating maintainable policy implementations across bounded contexts
- Ensuring consistency between events, commands, and business rules
- Identifying optimal automation patterns and integration points
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You need to analyse a given event stemming model to derive a policy (where events lead to commands).

Please follow these rules:
1. By analysing the given requirements and the generated event streams, we need to derive possible business logic and create relevant policies.
2. The name of policy should be written in English, and the rest of the content (alias, etc.) should be written in ${this.preferredLanguage} language so that it is easily understood by the user.
3. Do not write comments in the output JSON object.
4. Each policy should follow these guidelines:
   - Policy names should be clear and action-oriented
   - Reasons should explain the business value and purpose
   - Consider the temporal aspects of event-command relationships
   - Ensure policies don't create circular dependencies
5. When creating policies, consider:
   - Business rules and constraints from requirements
   - Eventual consistency requirements
   - Error handling and compensation scenarios
   - Performance implications of cross-context communication
6. Validation criteria for each policy:
   - Must have clear trigger conditions
   - Should respect bounded context boundaries
   - Must be idempotent where possible
   - Should handle failure scenarios gracefully
7. Avoid:
   - Tightly coupled policies across multiple contexts
   - Policies that could cause deadlocks
   - Over-complicated policy chains
   - Ambiguous or vague policy names
`
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeUtil_OnlyNameWithId.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "thoughts": {
        "summary": "Analysis of event-driven policy requirements",
        "details": {
            "eventTriggers": "Events that initiate policy actions",
            "commandResponses": "Commands triggered by policy rules",
            "businessRules": "Business rules governing policy execution",
            "crossBoundaryEffects": "Cross-aggregate and bounded context impacts",
            "automationPatterns": "Automated process flows and system responses"
        },
        "additionalConsiderations": "Technical and architectural implications"
    },

    "inference": {
        "summary": "Derived patterns and implications for policy implementation",
        "details": {
            "eventChains": "Cascading event sequences and their effects",
            "policyRules": "Business rules and conditions for policy execution",
            "systemBehaviors": "Expected system responses and state changes",
            "integrationPoints": "Integration requirements with other contexts",
            "automationLogic": "Logic for automated policy execution"
        },
        "additionalInferences": "Edge cases and special considerations"
    },

    "reflection": {
        "summary": "Evaluation of policy design and implementation approach",
        "details": {
            "effectiveness": "Policy effectiveness and coverage analysis",
            "reliability": "Reliability of policy execution and error handling",
            "maintainability": "Long-term maintenance and evolution considerations",
            "flexibility": "Adaptability to changing business rules",
            "monitoring": "Monitoring and tracking policy execution"
        },
        "additionalReflections": "Potential improvements and optimizations"
    },

    "result": {
        "extractedPolicies": [
            {
                "name": "<name>",
                "alias": "<alias>",
                "reason": "<reason>",
                "fromEventId": "<fromEventId>",
                "toCommandId": "<toCommandId>"
            }
        ]
    }
}        
`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Summarized Existing EventStorming Model": {
                "bc-reservation": {
                    "id": "bc-reservation",
                    "name": "reservationservice",
                    "actors": [
                        {
                            "id": "actor-customer",
                            "name": "Customer"
                        },
                        {
                            "id": "actor-staff",
                            "name": "RestaurantStaff"
                        }
                    ],
                    "aggregates": {
                        "agg-reservation": {
                            "id": "agg-reservation",
                            "name": "Reservation",
                            "commands": [
                                {
                                    "id": "cmd-create-reservation",
                                    "name": "CreateReservation",
                                    "api_verb": "POST",
                                    "outputEvents": [
                                        {
                                            "id": "evt-reservation-created",
                                            "name": "ReservationCreated"
                                        }
                                    ]
                                },
                                {
                                    "id": "cmd-confirm-reservation",
                                    "name": "ConfirmReservation",
                                    "api_verb": "PUT",
                                    "outputEvents": [
                                        {
                                            "id": "evt-reservation-confirmed",
                                            "name": "ReservationConfirmed"
                                        }
                                    ]
                                }
                            ],
                            "events": [
                                {
                                    "id": "evt-reservation-created",
                                    "name": "ReservationCreated",
                                    "outputCommands": []
                                },
                                {
                                    "id": "evt-reservation-confirmed",
                                    "name": "ReservationConfirmed",
                                    "outputCommands": []
                                }
                            ]
                        }
                    }
                },
                "bc-kitchen": {
                    "id": "bc-kitchen",
                    "name": "kitchenservice",
                    "aggregates": {
                        "agg-kitchen": {
                            "id": "agg-kitchen",
                            "name": "Kitchen",
                            "commands": [
                                {
                                    "id": "cmd-prepare-kitchen",
                                    "name": "PrepareKitchen",
                                    "api_verb": "POST",
                                    "outputEvents": [
                                        {
                                            "id": "evt-kitchen-prepared",
                                            "name": "KitchenPrepared"
                                        }
                                    ]
                                }
                            ],
                            "events": [
                                {
                                    "id": "evt-kitchen-prepared",
                                    "name": "KitchenPrepared",
                                    "outputCommands": []
                                }
                            ]
                        }
                    }
                },
                "bc-table": {
                    "id": "bc-table",
                    "name": "tableservice",
                    "aggregates": {
                        "agg-table": {
                            "id": "agg-table",
                            "name": "Table",
                            "commands": [
                                {
                                    "id": "cmd-assign-table",
                                    "name": "AssignTable",
                                    "api_verb": "PUT",
                                    "outputEvents": [
                                        {
                                            "id": "evt-table-assigned",
                                            "name": "TableAssigned"
                                        }
                                    ]
                                }
                            ],
                            "events": [
                                {
                                    "id": "evt-table-assigned",
                                    "name": "TableAssigned",
                                    "outputCommands": []
                                }
                            ]
                        }
                    }
                }
            },
            "Functional Requirements": {
                "userStories": [
                    {
                        "title": "Restaurant Reservation Process",
                        "description": "As a customer, I want to make a restaurant reservation and receive confirmation",
                        "acceptance": [
                            "Reservation should be created with customer details and party size",
                            "System should automatically assign appropriate table",
                            "Kitchen should be notified for preparation",
                            "Customer should receive confirmation"
                        ]
                    }
                ],
                "entities": {
                    "Reservation": {
                        "properties": [
                            {"name": "reservationId", "type": "string", "required": true, "isPrimaryKey": true},
                            {"name": "customerId", "type": "string", "required": true},
                            {"name": "partySize", "type": "integer", "required": true},
                            {"name": "dateTime", "type": "datetime", "required": true},
                            {"name": "status", "type": "enum", "required": true, "values": ["Pending", "Confirmed", "Cancelled"]},
                            {"name": "specialRequests", "type": "string", "required": false}
                        ]
                    }
                },
                "businessRules": [
                    {
                        "name": "TableAssignment",
                        "description": "Tables must be assigned based on party size and availability"
                    },
                    {
                        "name": "KitchenPreparation",
                        "description": "Kitchen must be notified 2 hours before reservation time"
                    }
                ]
            }
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "thoughts": {
                "summary": "Analysis of restaurant reservation policy requirements reveals multiple interconnected processes requiring careful orchestration",
                "details": {
                    "eventTriggers": "Primary triggers are ReservationCreated and ReservationConfirmed events, initiating cascading processes across contexts",
                    "commandResponses": "System needs to coordinate table assignment and kitchen preparation commands based on reservation status",
                    "businessRules": "Table assignment must consider capacity and timing, kitchen preparation follows specific schedule requirements",
                    "crossBoundaryEffects": "Actions span across reservation, table, and kitchen contexts requiring careful state management",
                    "automationPatterns": "Sequential and parallel processing patterns identified for reservation fulfillment"
                },
                "additionalConsiderations": "Need to handle edge cases such as table unavailability and kitchen capacity constraints"
            },
    
            "inference": {
                "summary": "Multiple policy patterns emerge from the event flow analysis",
                "details": {
                    "eventChains": "ReservationCreated -> TableAssigned -> KitchenPrepared forms the main success path",
                    "policyRules": [
                        "Table assignment must occur immediately after reservation creation",
                        "Kitchen preparation should be triggered 2 hours before reservation time",
                        "All status changes must be tracked for coordination"
                    ],
                    "systemBehaviors": "System must maintain consistency across bounded contexts while handling asynchronous operations",
                    "integrationPoints": "Critical touchpoints between reservation management and resource allocation systems",
                    "automationLogic": "Automated workflows with timing considerations and resource checks"
                },
                "additionalInferences": "Potential need for compensation logic in case of resource allocation failures"
            },
    
            "reflection": {
                "summary": "The proposed policy design balances automation with business constraints",
                "details": {
                    "effectiveness": "Policies cover all critical paths while maintaining bounded context independence",
                    "reliability": "Built-in checks for resource availability and timing constraints",
                    "maintainability": "Clear separation of concerns allows for independent policy updates",
                    "flexibility": "Design accommodates future additions to business rules",
                    "monitoring": "Key points identified for policy execution tracking"
                },
                "additionalReflections": "Consider implementing circuit breakers for cross-context communication"
            },
    
            "result": {
                "extractedPolicies": [
                    {
                        "name": "TableAssignmentPolicy",
                        "alias": "Table Assignment Automation",
                        "reason": "Automatically assign appropriate table upon reservation creation",
                        "fromEventId": "evt-reservation-created",
                        "toCommandId": "cmd-assign-table"
                    },
                    {
                        "name": "KitchenPreparationPolicy",
                        "alias": "Kitchen Preparation Trigger",
                        "reason": "Initiate kitchen preparation process when reservation is confirmed",
                        "fromEventId": "evt-reservation-confirmed",
                        "toCommandId": "cmd-prepare-kitchen"
                    },
                    {
                        "name": "ReservationConfirmationPolicy",
                        "alias": "Reservation Status Update",
                        "reason": "Update reservation status after successful table assignment",
                        "fromEventId": "evt-table-assigned",
                        "toCommandId": "cmd-confirm-reservation"
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        const summarizedESValue = ESValueSummarizeUtil_OnlyNameWithId.getFilteredSummarizedESValue(
            JSON.parse(JSON.stringify(this.client.input.esValue)), this.esAliasTransManager
        )

        return {
            "Summarized Existing EventStorming Model": JSON.stringify(summarizedESValue),

            "Functional Requirements": this.client.input.description,

            "Final Check": `
* Do not create a duplicate policy if there is already any existing policy connecting the same Event to the same Command
* Do not create a policy where an Event triggers a Command within the same Aggregate
* Ensure all policies cross Aggregate or Bounded Context boundaries
* Verify that each policy serves a distinct business purpose and is not redundant
`
        }
    }


    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Generating policies for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj){
        let policies = returnObj.modelValue.aiOutput.result.extractedPolicies

        let {actions: appliedActions, createdESValue: createdESValue} = this._getActionAppliedESValue(policies)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        }
        returnObj.directMessage = `Generating policies for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    _getActionAppliedESValue(policies) {
        let actions = this.__toEventUpdateActions(policies)

        let esValueToModify = JSON.parse(JSON.stringify(this.client.input.esValue))

        let createdESValue = ESActionsUtil.getActionAppliedESValue(actions, this.client.input.userInfo, this.client.input.information, esValueToModify)

        return { actions, createdESValue }
    }

    __toEventUpdateActions(policies){
        let actions = []

        for(let policy of policies) {
            const eventId = this.esAliasTransManager.aliasToUUIDDic[policy.fromEventId]
            const eventObject = this.client.input.esValue.elements[eventId]
            if(!eventObject) {
                console.error("[!] Event to update not found", policy)
                continue
            }

            const commandId = this.esAliasTransManager.aliasToUUIDDic[policy.toCommandId]
            const commandObject = this.client.input.esValue.elements[commandId]
            if(!commandObject) {
                console.error("[!] Command to update not found", policy)
                continue
            }


            let isAlreadyConnected = false
            let targetPolicies = []
            for(let relation of Object.values(this.client.input.esValue.relations)) {
                if(!relation || !relation.sourceElement || !relation.targetElement) continue
                if(relation.sourceElement.id === eventObject.id && 
                   relation.targetElement._type === "org.uengine.modeling.model.Policy") {
                    targetPolicies.push(relation.targetElement)
                }
            }

            if(targetPolicies.length > 0) {
                for(let targetPolicy of targetPolicies) {
                    for(let relation of Object.values(this.client.input.esValue.relations)) {
                        if(!relation || !relation.sourceElement || !relation.targetElement) continue
                        if(relation.sourceElement.id === targetPolicy.id && 
                           relation.targetElement.id === commandObject.id) {
                            isAlreadyConnected = true
                            break
                        }
                    }
                }
            }
            if(isAlreadyConnected) continue

            
            actions.push({
                "objectType": "Event",
                "type": "update",
                "ids": {
                    "boundedContextId": eventObject.boundedContext.id,
                    "aggregateId": eventObject.aggregate.id,
                    "eventId": eventObject.id
                },
                "args": {
                    "outputCommandIds": [{
                        "commandId": commandObject.id,
                        "reason": policy.reason,
                        "name": policy.name,
                        "alias": policy.alias
                    }]
                }
            })
        }

        return actions
    }
}

module.exports = CreatePolicyActionsByFunctions;