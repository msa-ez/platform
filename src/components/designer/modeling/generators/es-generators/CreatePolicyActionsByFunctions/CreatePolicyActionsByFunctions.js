const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { ESValueSummaryGenerator } = require("..")
const ESActionsUtil = require("../../es-ddl-generators/modules/ESActionsUtil")
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class CreatePolicyActionsByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client, {}, "complexModel");

        this.generatorName = "CreatePolicyActionsByFunctions"
        this.checkInputParamsKeys = ["targetBoundedContext", "description", "esValue", "userInfo", "information"]
        this.progressCheckStrings = ["inference", "extractedPolicies"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    extractedPolicies: z.array(
                        z.object({
                            name: z.string(),
                            alias: z.string(),
                            reason: z.string(),
                            fromEventId: z.string(),
                            toCommandId: z.string()
                        }).strict()
                    )
                }).strict()
            }).strict(),
            "instruction"
        )
    }

    /** 
     * @description 이벤트 스토밍 모델에서 정책을 생성하고 관리하기 위한 제너레이터를 생성합니다.
     * 정책 생성 프로세스의 각 단계(첫 응답, 모델 생성, 생성 성공, 재시도, 중지)에서 
     * 콜백을 통해 처리할 수 있습니다.
     * 
     * @example 기본적인 정책 생성기 설정
     * const esValue = mocks.getEsValue("libraryService", ["policy"])
     * const generator = CreatePolicyActionsByFunctions.createGeneratorByDraftOptions({
     *     onGenerationSucceeded: (returnObj) => {
     *         // 생성된 정책을 기존 이벤트 스토밍 모델에 적용
     *         if(returnObj.modelValue && returnObj.modelValue.createdESValue) {
     *             esValue.elements = returnObj.modelValue.createdESValue.elements
     *             esValue.relations = returnObj.modelValue.createdESValue.relations
     *         }
     *     },
     *     onGenerationDone: () => {
     *         console.log("정책 생성 완료")
     *     }
     * })
     * generator.initInputs(
     *      mocks.getEsDraft("libraryService"),
     *      esValue,
     *      esConfigs.userInfo,
     *      esConfigs.information
     * )
     * generator.generateIfInputsExist()

     * @example 전체 생성 프로세스 모니터링
     * const generator = CreatePolicyActionsByFunctions.createGeneratorByDraftOptions({
     *     onFirstResponse: (returnObj) => {
     *         console.log("정책 생성 시작")
     *     },
     *     onModelCreated: (returnObj) => {
     *         console.log("모델 생성됨")
     *     },
     *     onGenerationSucceeded: (returnObj) => {
     *         // 생성된 모델 처리
     *     },
     *     onGenerationDone: () => {
     *         // 모든 정책 생성 완료시 처리
     *         console.log("모든 정책 생성 완료")
     *     },
     *     onRetry: (returnObj) => {
     *         console.error("정책 생성 중 오류 발생:", returnObj.errorMessage)
     *     },
     *     onStopped: () => {
     *         console.log("정책 생성 중단")
     *     }
     * })
     * 
     * @note
     * - 콜백 함수들은 선택적으로 구현할 수 있으며, 필요한 콜백만 정의하면 됩니다.
     * - initInputs 메소드를 통해 여러 정책을 순차적으로 생성할 수 있습니다.
     * - generateIfInputsExist는 큐에 남은 입력이 있는 경우 자동으로 다음 정책 생성을 시작합니다.
     * - 에러 발생 시 onRetry 콜백에서 적절한 에러 처리가 필요합니다.
     * - 모든 정책 생성이 완료되면 onGenerationDone이 호출됩니다.
     */
    static createGeneratorByDraftOptions(callbacks){
        const generator = new CreatePolicyActionsByFunctions({
            input: null,

            onSend: (input, stopCallback) => {
                if(callbacks.onSend)
                    callbacks.onSend(input, stopCallback)
            },

            onFirstResponse: (returnObj) => {
                if(callbacks.onFirstResponse)
                    callbacks.onFirstResponse(returnObj)
            },

            onThink: (returnObj, thinkText) => {
                if(callbacks.onThink)
                    callbacks.onThink(returnObj, thinkText)
            },

            onModelCreatedWithThinking: (returnObj) => {
                if(callbacks.onModelCreatedWithThinking)
                    callbacks.onModelCreatedWithThinking(returnObj)
            },

            onModelCreated: (returnObj) => {
                if(callbacks.onModelCreated)
                    callbacks.onModelCreated(returnObj)
            },

            onGenerationSucceeded: (returnObj) => {
                if(callbacks.onGenerationSucceeded)
                    callbacks.onGenerationSucceeded(returnObj)

                if(generator.generateIfInputsExist())
                    return


                if(callbacks.onGenerationDone)
                    callbacks.onGenerationDone()
            },

            onRetry: (returnObj) => {
                alert(`[!] An error occurred during policy creation, please try again.\n* Error log \n${returnObj.errorMessage}`)

                if(callbacks.onRetry)
                    callbacks.onRetry(returnObj)
            },

            onStopped: () => {
                if(callbacks.onStopped)
                    callbacks.onStopped()
            }
        })

        generator.initInputs = (draftOptions, esValue, userInfo, information) => {
            let inputs = []
            for(const eachDraftOption of Object.values(draftOptions)) {
                inputs.push({
                        targetBoundedContext: eachDraftOption.boundedContext,
                        description: eachDraftOption.description,
                        esValue: esValue,
                        userInfo: userInfo,
                        information: information
                    })
            }
            generator.inputs = inputs
        }

        generator.generateIfInputsExist = () => {
            if(generator.inputs.length > 0) {
                generator.client.input = generator.inputs.shift()
                generator.generate()
                return true
            }
            return false
        }

        return generator
    }

    async onGenerateBefore(inputParams){
        inputParams.boundedContextDisplayName = inputParams.targetBoundedContext.displayName ? inputParams.targetBoundedContext.displayName : inputParams.targetBoundedContext.name

        inputParams.esValue = structuredClone(inputParams.esValue)
        inputParams.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
        inputParams.summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(
            inputParams.esValue, 
            ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateInnerStickers
                .concat(ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.detailedProperties),
            inputParams.esAliasTransManager
        )

        inputParams.subjectText = `Creating policies for ${inputParams.boundedContextDisplayName} Bounded Context`
        if(!this.isCreatedPromptWithinTokenLimit()) {
            const leftTokenCount = this.getCreatePromptLeftTokenCount({summarizedESValue: {}})
            if(leftTokenCount <= 100)
                throw new Error("[!] The size of the draft being passed is too large to process.")

            console.log(`[*] 토큰 제한이 초과되어서 이벤트 스토밍 정보를 제한 수치까지 요약해서 전달함`)
            console.log(`[*] 요약 이전 Summary`, inputParams.summarizedESValue)
            const requestContext = this._buildRequestContext(inputParams)
            inputParams.summarizedESValue = await ESValueSummaryGenerator.getSummarizedESValueWithMaxTokenSummarize(
                requestContext,
                inputParams.esValue,
                ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateInnerStickers
                .concat(ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.detailedProperties),
                leftTokenCount,
                this.modelInfo.requestModelName,
                inputParams.esAliasTransManager
            )
            console.log(`[*] 요약 이후 Summary`, inputParams.summarizedESValue)
        }
    }

    _buildRequestContext(inputParams) {
        return `Analyzing requirements to create policies for the ${inputParams.targetBoundedContext.name} bounded context.
- Requirements
${inputParams.description}`;
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

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The process of reasoning should be directly related to the output result, not a reference to a general strategy.
2. Context Analysis: Thoroughly analyze the provided event storming model and functional requirements to understand the business objectives, domain boundaries, and integration points.
3. Policy Design: Derive clear and distinct policies that connect related events with appropriate commands, ensuring each policy delivers unique business value.
4. Validation: Verify that policies avoid duplication, circular dependencies, and only span across aggregates or bounded contexts when necessary.
`;   
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeWithFilter.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "inference": "<inference>",
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
                "deletedProperties": ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateInnerStickers
                    .concat(ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.detailedProperties),
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
                            {"name": "reservationId", "type": "String", "required": true, "isPrimaryKey": true},
                            {"name": "customerId", "type": "String", "required": true},
                            {"name": "partySize", "type": "Integer", "required": true},
                            {"name": "dateTime", "type": "Date", "required": true},
                            {"name": "status", "type": "enum", "required": true, "values": ["Pending", "Confirmed", "Cancelled"]},
                            {"name": "specialRequests", "type": "String", "required": false}
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
            "inference": `Based on the detailed analysis of the event storming model and functional requirements, three distinct policies have been derived. The "TableAssignmentPolicy" connects the "ReservationCreated" event to the "AssignTable" command, ensuring that table assignment is automatically triggered upon reservation creation. The "KitchenPreparationPolicy" links the "ReservationConfirmed" event to the "PrepareKitchen" command, initiating kitchen preparation as soon as the reservation is confirmed. Lastly, the "ReservationConfirmationPolicy" ties the "TableAssigned" event to the "ConfirmReservation" command, finalizing the reservation process through a status update. Each policy is carefully designed to span across aggregate boundaries while avoiding duplication and circular dependencies, thereby delivering clear and actionable business value.`,
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
        return {
            "Summarized Existing EventStorming Model": JSON.stringify(this.client.input.summarizedESValue),

            "Functional Requirements": this.client.input.description,

            "Final Check": `
* Do not create a duplicate policy if there is already any existing policy connecting the same Event to the same Command
* Do not create a policy where an Event triggers a Command within the same Aggregate
* Ensure all policies cross Aggregate or Bounded Context boundaries
* Verify that each policy serves a distinct business purpose and is not redundant
`
        }
    }

    
    onThink(returnObj, thinkText){
        returnObj.directMessage = `Creating policies for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Creating policies for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onCreateModelFinished(returnObj){
        let policies = returnObj.modelValue.aiOutput.result.extractedPolicies

        let {actions: appliedActions, createdESValue: createdESValue} = this._getActionAppliedESValue(policies)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        }
        returnObj.directMessage = `Creating policies for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    _getActionAppliedESValue(policies){
        let actions = this.__toEventUpdateActions(policies)

        let esValueToModify = JSON.parse(JSON.stringify(this.client.input.esValue))

        let createdESValue = ESActionsUtil.getActionAppliedESValue(actions, this.client.input.userInfo, this.client.input.information, esValueToModify)

        return { actions, createdESValue }
    }

    __toEventUpdateActions(policies){
        let actions = []

        for(let policy of policies) {
            const eventId = this.client.input.esAliasTransManager.aliasToUUIDDic[policy.fromEventId]
            const eventObject = this.client.input.esValue.elements[eventId]
            if(!eventObject) {
                console.error("[!] Event to update not found", policy)
                continue
            }

            const commandId = this.client.input.esAliasTransManager.aliasToUUIDDic[policy.toCommandId]
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