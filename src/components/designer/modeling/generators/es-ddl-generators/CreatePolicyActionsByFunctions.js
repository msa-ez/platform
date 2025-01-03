
const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESActionsUtil = require("./modules/ESActionsUtil")
const ESValueSummarizeWithFilterUtil = require("./modules/ESValueSummarizeWithFilterUtil")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class CreatePolicyActionsByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "description", "esValue", "userInfo", "information"]
        this.progressCheckStrings = ["overviewThoughts", "extractedPolicies"]
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
        return ESValueSummarizeWithFilterUtil.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "overviewThoughts": {
        "summary": "High-level analysis of the overall policy landscape and system requirements",
        "details": {
            "businessValue": "Assessment of how policies align with business goals and requirements",
            "systemImpact": "Analysis of cross-cutting concerns and system-wide effects",
            "riskFactors": "Identification of potential challenges and mitigation strategies"
        },
        "additionalConsiderations": "Any supplementary insights or future considerations for the overall system"
    },

    "result": {
        "extractedPolicies": [
            {
                "policyThoughts": {
                    "summary": "Specific reasoning behind individual policy design and implementation",
                    "details": {
                        "triggerLogic": "Analysis of event conditions and timing considerations",
                        "domainAlignment": "How policy fits within domain boundaries and business rules",
                        "implementationComplexity": "Technical considerations and resource requirements"
                    },
                    "additionalConsiderations": "Policy-specific edge cases or future enhancement possibilities"
                },

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
                "deletedProperties": ESValueSummarizeWithFilterUtil.KEY_FILTER_TEMPLATES.aggregateInnerStickers
                    .concat(ESValueSummarizeWithFilterUtil.KEY_FILTER_TEMPLATES.detailedProperties),
                "boundedContexts": [
                    {
                        "id": "bc-reservation",
                        "name": "reservationservice",
                        "actors": [
                            {
                                "id": "act-customer",
                                "name": "Customer"
                            },
                            {
                                "id": "act-staff",
                                "name": "RestaurantStaff"
                            }
                        ],
                        "aggregates": [
                            {
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
                                        "api_verb": "PATCH",
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
                        ]
                    },
                    {
                        "id": "bc-kitchen",
                        "name": "kitchenservice",
                        "aggregates": [
                            {
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
                        ]
                    },
                    {
                        "id": "bc-table",
                        "name": "tableservice",
                        "aggregates": [
                            {
                                "id": "agg-table",
                                "name": "Table",
                                "commands": [
                                    {
                                        "id": "cmd-assign-table",
                                        "name": "AssignTable",
                                        "api_verb": "PATCH",
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
                        ]
                    }
                ]
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
            "overviewThoughts": {
                "summary": "Restaurant reservation system requires coordinated policy management across multiple bounded contexts",
                "details": {
                    "businessValue": "Automated reservation flow improves customer experience and staff efficiency",
                    "systemImpact": "Policies ensure proper coordination between reservation, table, and kitchen services",
                    "riskFactors": "Resource conflicts, timing issues, and cross-context consistency challenges"
                },
                "additionalConsiderations": "Future scaling considerations for multiple restaurant locations and peak time management"
            },
    
            "result": {
                "extractedPolicies": [
                    {
                        "policyThoughts": {
                            "summary": "Table assignment must be automated immediately after reservation creation",
                            "details": {
                                "triggerLogic": "ReservationCreated event triggers immediate table allocation",
                                "domainAlignment": "Ensures proper resource management within restaurant domain",
                                "implementationComplexity": "Requires table availability checking and optimization logic"
                            },
                            "additionalConsiderations": "Consider table preference and special seating requirements"
                        },
                        "name": "TableAssignmentPolicy",
                        "alias": "Table Assignment Automation",
                        "reason": "Automatically assign appropriate table upon reservation creation",
                        "fromEventId": "evt-reservation-created",
                        "toCommandId": "cmd-assign-table"
                    },
                    {
                        "policyThoughts": {
                            "summary": "Kitchen preparation must be initiated at the right time for confirmed reservations",
                            "details": {
                                "triggerLogic": "ReservationConfirmed event initiates timed kitchen preparation",
                                "domainAlignment": "Coordinates kitchen operations with reservation timeline",
                                "implementationComplexity": "Requires scheduling and kitchen capacity management"
                            },
                            "additionalConsiderations": "Handle special dietary requirements and preparation timing"
                        },
                        "name": "KitchenPreparationPolicy",
                        "alias": "Kitchen Preparation Trigger",
                        "reason": "Initiate kitchen preparation process when reservation is confirmed",
                        "fromEventId": "evt-reservation-confirmed",
                        "toCommandId": "cmd-prepare-kitchen"
                    },
                    {
                        "policyThoughts": {
                            "summary": "Reservation status must be updated after successful table assignment",
                            "details": {
                                "triggerLogic": "TableAssigned event triggers reservation confirmation",
                                "domainAlignment": "Maintains consistency between table and reservation states",
                                "implementationComplexity": "Requires transaction management across contexts"
                            },
                            "additionalConsiderations": "Handle edge cases like table reassignment needs"
                        },
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
        const summarizedESValue = ESValueSummarizeWithFilterUtil.getSummarizedESValue(
            JSON.parse(JSON.stringify(this.client.input.esValue)), 
            ESValueSummarizeWithFilterUtil.KEY_FILTER_TEMPLATES.aggregateInnerStickers
                .concat(ESValueSummarizeWithFilterUtil.KEY_FILTER_TEMPLATES.detailedProperties),
            this.esAliasTransManager
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