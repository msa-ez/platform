const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { ESValueSummaryGenerator } = require("..")
const ESActionsUtil = require("../../es-ddl-generators/modules/ESActionsUtil")
const ESFakeActionsUtil = require("../../es-ddl-generators/modules/ESFakeActionsUtil")
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class CreateCommandActionsByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.generatorName = "CreateCommandActionsByFunctions"
        this.checkInputParamsKeys = ["targetBoundedContext", "targetAggregate", "description", "esValue", "userInfo", "information"]
        this.progressCheckStrings = ["inference", "commandActions", "eventActions", "readModelActions"]
    }

    /**
     * @description 이벤트 스토밍 모델의 커맨드, 이벤트, ReadModel을 생성하기 위한 제너레이터를 생성합니다.
     * 각 Aggregate별로 순차적으로 생성을 수행하며, 생성 과정의 각 단계에서 콜백을 통해 진행 상황을 모니터링하고 
     * 제어할 수 있습니다.
     * 
     * @example 기본적인 이벤트 스토밍 생성기 설정
     * // 생성된 모델을 처리하고 완료 시점을 확인하는 기본 설정
     * const esValue = mocks.getEsValue("libraryService", ["remainOnlyAggregate"])
     * const generator = CreateCommandActionsByFunctions.createGeneratorByDraftOptions({
     *     onGenerationSucceeded: (returnObj) => {
     *         // 생성된 모델 처리
     *         if(returnObj.modelValue && returnObj.modelValue.createdESValue) {
     *             esValue.elements = returnObj.modelValue.createdESValue.elements
     *             esValue.relations = returnObj.modelValue.createdESValue.relations
     *         }
     *     },
     *     onGenerationDone: () => {
     *         console.log("[*] 이벤트 스토밍 생성 완료")
     *     }
     * })
     * generator.initInputs(
     *      mocks.getEsDraft("libraryService"),
     *      esValue,
     *      esConfigs.userInfo,
     *      esConfigs.information
     * )
     * generator.generateIfInputsExist()
     * 
     * @example 전체 생성 프로세스 모니터링
     * // 생성 과정의 각 단계를 모니터링하고 오류 처리하는 고급 설정
     * const generator = CreateCommandActionsByFunctions.createGeneratorByDraftOptions({
     *     onFirstResponse: (returnObj) => {
     *         console.log("초기 응답 수신")
     *     },
     *     onModelCreated: (returnObj) => {
     *         console.log("모델 생성됨")
     *     },
     *     onGenerationSucceeded: (returnObj) => {
     *         // 생성된 모델 처리
     *     },
     *     onGenerationDone: () => {
     *         // 모든 커맨드 생성 완료시 처리
     *         console.log("모든 커맨드 생성 완료")
     *     },
     *     onRetry: (returnObj) => {
     *         console.log(`오류 발생: ${returnObj.errorMessage}`)
     *     },
     *     onStopped: () => {
     *         console.log("생성 중단됨")
     *     }
     * })
     *
     * @note
     * - generator.initInputs()를 호출하여 생성에 필요한 입력값을 초기화해야 합니다.
     * - generator.generateIfInputsExist()를 호출하여 실제 생성 프로세스를 시작합니다.
     * - 모든 콜백 함수는 선택적이며, 필요한 콜백만 구현할 수 있습니다.
     * - onGenerationSucceeded 콜백에서는 반드시 생성된 모델을 저장하거나 처리해야 합니다.
     * - 여러 Aggregate가 있는 경우 순차적으로 처리되며, 각각에 대해 콜백이 호출됩니다.
     */
    static createGeneratorByDraftOptions(callbacks){
        const generator = new CreateCommandActionsByFunctions({
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
                alert(`[!] An error occurred during command creation, please try again.\n* Error log \n${returnObj.errorMessage}`)

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
                const targetAggregates = Object.values(esValue.elements).filter(element => element && element._type === "org.uengine.modeling.model.Aggregate" && element.boundedContext.id === eachDraftOption.boundedContext.id)

                // Aggregate각각마다 커맨드/이벤트/ReadModel 생성 요청을 함으로써 다루는 문제영역을 최소화함
                for(const targetAggregate of targetAggregates) {
                    inputs.push({
                        targetBoundedContext: eachDraftOption.boundedContext,
                        targetAggregate: targetAggregate,
                        description: eachDraftOption.description,
                        esValue: esValue,
                        userInfo: userInfo,
                        information: information
                    })
                }
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


    onApiClientChanged(){
        this.modelInfo.requestArgs.response_format = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    commandActions: z.array(
                        z.object({
                            actionName: z.string(),
                            objectType: z.literal("Command"),
                            ids: z.object({
                                aggregateId: z.string(),
                                commandId: z.string()
                            }),
                            args: z.object({
                                commandName: z.string(),
                                commandAlias: z.string(),
                                api_verb: z.enum(["POST", "PUT", "PATCH", "DELETE"]),
                                properties: z.array(
                                    z.object({
                                        name: z.string(),
                                        type: z.string(),
                                        isKey: z.boolean()
                                    })
                                ),
                                outputEventIds: z.array(z.string()),
                                actor: z.string()
                            })
                        })
                    ),
                    eventActions: z.array(
                        z.object({
                            actionName: z.string(),
                            objectType: z.literal("Event"),
                            ids: z.object({
                                aggregateId: z.string(),
                                eventId: z.string()
                            }),
                            args: z.object({
                                eventName: z.string(),
                                eventAlias: z.string(),
                                properties: z.array(
                                    z.object({
                                        name: z.string(),
                                        type: z.string(),
                                        isKey: z.boolean()
                                    })
                                )
                            })
                        })
                    ),
                    readModelActions: z.array(
                        z.object({
                            actionName: z.string(),
                            objectType: z.literal("ReadModel"),
                            ids: z.object({
                                aggregateId: z.string(),
                                readModelId: z.string()
                            }),
                            args: z.object({
                                readModelName: z.string(),
                                readModelAlias: z.string(),
                                isMultipleResult: z.boolean(),
                                queryParameters: z.array(
                                    z.object({
                                        name: z.string(),
                                        type: z.string(),
                                        isKey: z.boolean()
                                    })
                                ),
                                actor: z.string()
                            })
                        })
                    )
                }).strict()
            }).strict(),
            "instruction"
        )
    }

    async onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        inputParams.aggregateDisplayName = inputParams.targetAggregate.displayName ? inputParams.targetAggregate.displayName : inputParams.targetAggregate.name
        inputParams.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)

        inputParams.summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(
            inputParams.esValue, [], inputParams.esAliasTransManager
        )
        inputParams.subjectText = `Creating commands for ${inputParams.aggregateDisplayName} Aggregate`
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
                [],
                leftTokenCount,
                this.modelInfo.requestModelName,
                inputParams.esAliasTransManager
            )
            console.log(`[*] 요약 이후 Summary`, inputParams.summarizedESValue)
        }
    }

    _buildRequestContext(inputParams) {
        return `Creating commands, events, and read models for the following context:
- Target Bounded Context: ${inputParams.targetBoundedContext.name}
- Target Aggregate: ${inputParams.targetAggregate.name}
- Business Requirements
${inputParams.description}

Focus on elements that are:
1. Directly related to the ${inputParams.targetAggregate.name} aggregate
2. Referenced by or dependent on the target aggregate
3. Essential for implementing the specified business requirements

This context is specifically for generating:
- Commands to handle business operations
- Events to record state changes
- Read models for query operations

All within the scope of ${inputParams.targetBoundedContext.name} bounded context and ${inputParams.targetAggregate.name} aggregate.`
    }


    __buildAgentRolePrompt(){
        return `You are a domain-driven design expert specializing in:
- Converting business requirements into domain models and commands
- Designing event-driven architectures
- Implementing CQRS and event sourcing patterns
- Creating maintainable microservices
- Applying DDD tactical patterns (aggregates, entities, value objects)
- Following clean architecture principles
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You need to write an action that adds the appropriate commands, events, and ReadModels to a given Aggregate to reflect the user's needs.

Please follow these rules:

Data Type Guidelines:
1. Use appropriate Java data types:
   - Basic types: String, Long, Integer, Double, Boolean, Date
   - Collection types: List<Type>, Set<Type>
   - Custom types must be defined as Enumeration, ValueObject within the Aggregate
2. Avoid using String type when a more specific type exists (e.g., use Date for dates, Integer for counts)
3. For arrays/collections, always use List<Type> format (e.g., List<String>)

Naming and Language Conventions:
1. Technical names (classes, properties, methods) must be in English
2. Display names and descriptions (aliases) must be in ${this.preferredLanguage}
3. Use clear, descriptive names that reflect business concepts
4. Follow naming patterns:
   - Commands: Verb + Noun (e.g., CreateOrder, UpdateCustomer)
   - Events: Noun + Past Participle (e.g., OrderCreated, CustomerUpdated)
   - ReadModels: Noun + Purpose (e.g., OrderSummary, CustomerDetails)

Command and Event Guidelines:
1. Each command must:
   - Have a corresponding event (e.g., CreateOrder -> OrderCreated)
   - Include necessary validation parameters
   - Specify the actor (user, system, admin, etc.)
2. For update/delete operations:
   - Always include the Aggregate's primary key
   - Include only the fields being modified
3. Events must:
   - Contain all relevant data for state changes
   - Include any cascading effects on other aggregates
   - Reference the originating command

ReadModel Guidelines:
1. Use ReadModels for:
   - Query operations (instead of commands/events)
   - Complex data aggregation
   - Performance optimization
2. Include:
   - Clear filtering/search criteria
   - Pagination parameters when returning lists
   - Necessary joins with other aggregates

Business Logic Extraction:
1. Focus on business operations rather than CRUD:
   - Identify domain-specific actions (e.g., "ApproveOrder" instead of "UpdateOrderStatus")
   - Consider business rules and constraints
   - Include validation requirements
2. Consider cascading effects:
   - Identify related commands in other aggregates
   - Example: CreateOrder might trigger DecreaseInventory in Item aggregate
3. Handle business scenarios:
   - State transitions
   - Validation rules
   - Business process flows

Avoid:
1. Duplicate commands or events
2. CRUD operations disguised as business operations
3. Comments in the output JSON
4. Overly complex command/event structures
5. Using commands/events for simple queries

Best Practices:
1. Keep commands focused on single responsibility
2. Ensure events capture complete state changes
3. Design for eventual consistency
4. Consider security and authorization requirements
5. Plan for versioning and backward compatibility
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The process of reasoning should be directly related to the output result, not a reference to a general strategy.
2. Directional Focus: Prioritize key business objectives and ensure that the generated actions align with domain-driven design, CQRS, and event sourcing principles.
3. Validation and Consistency: Carefully evaluate business rules, validation constraints, state transitions, and property specifications to ensure architectural consistency.
4. Integration and Duplication Avoidance: Verify that new actions integrate with existing Commands, Events, and ReadModels without causing duplication.
5. Edge Cases and Error Handling: Consider potential error scenarios and boundary conditions.
`
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeWithFilter.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "inference": "<inference>",
    "result": {
        // Generate commands in the aggregate to satisfy the given functional requirements.
        "commandActions": [
            {
                // Write the ActionName that you utilized in the previous steps
                "actionName": "<actionName>",
                "objectType": "Command",
                "ids": {
                    "aggregateId": "<aggregateId>",
                    "commandId": "<commandId>"
                },
                "args": {
                    "commandName": "<commandName>",
                    "commandAlias": "<commandAlias>",
                    "api_verb": <"POST" | "PUT" | "PATCH" | "DELETE">,

                    "properties": [
                        {
                            "name": "<propertyName>",
                            "type?": "<propertyType>" // If the type is String, do not specify the type.
                            "isKey?": <true|false> // Write only if there is a primary key.
                        }
                    ],

                    "outputEventIds": ["<outputEventId>"], // List of event IDs generated by this command. Must write existing event IDs.
                    "actor": "<actorName>"
                }
            }
        ],

        // Generate events in the aggregate to satisfy the given functional requirements.
        "eventActions": [
            {
                "actionName": "<actionName>",
                "objectType": "Event",
                "ids": {
                    "aggregateId": "<aggregateId>",
                    "eventId": "<eventId>"
                },
                "args": {
                    "eventName": "<eventName>",
                    "eventAlias": "<eventAlias>",

                    "properties": [
                        {
                            "name": "<propertyName>",
                            "type?": "<propertyType>",
                            "isKey?": <true|false>
                        }
                    ]
                }
            }
        ],

        // Generate read models in the aggregate to satisfy the given functional requirements.
        "readModelActions": [
            {
                "actionName": "<actionName>",
                "objectType": "ReadModel",
                "ids": {
                    "aggregateId": "<aggregateId>",
                    "readModelId": "<readModelId>"
                },
                "args": {
                    "readModelName": "<readModelName>",
                    "readModelAlias": "<readModelAlias>",
                    "isMultipleResult": <true|false>,

                    "queryParameters": [
                        {
                            "name": "<propertyName>",
                            "type?": "<propertyType>",
                            "isKey?": <true|false>
                        }
                    ],

                    "actor": "<actorName>"
                }
            }
        ]
    }
}`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Summarized Existing EventStorming Model": {
                "deletedProperties": [],
                "boundedContexts": [
                    {
                        "id": "bc-hotel",
                        "name": "hotelservice",
                        "actors": [
                            {
                                "id": "act-guest",
                                "name": "Guest"
                            },
                            {
                                "id": "act-system",
                                "name": "System"
                            }
                        ],
                        "aggregates": [
                            {
                                "id": "agg-booking",
                                "name": "Booking",
                                "properties": [
                                    {
                                        "name": "bookingId",
                                        "type": "Long",
                                        "isKey": true
                                    },
                                    {
                                        "name": "guestId",
                                        "type": "Long",
                                        "isForeignProperty": true
                                    },
                                    {
                                        "name": "roomId",
                                        "type": "Long",
                                        "isForeignProperty": true
                                    },
                                    {
                                        "name": "checkInDate",
                                        "type": "Date"
                                    },
                                    {
                                        "name": "checkOutDate",
                                        "type": "Date"
                                    },
                                    {
                                        "name": "status",
                                        "type": "BookingStatus"
                                    },
                                    {
                                        "name": "totalAmount",
                                        "type": "Integer"
                                    }
                                ],
                                "enumerations": [
                                    {
                                        "id": "enum-booking-status",
                                        "name": "BookingStatus",
                                        "items": ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"]
                                    },
                                    {
                                        "id": "enum-meal-plan",
                                        "name": "MealPlan",
                                        "items": ["NO_MEAL", "BREAKFAST_ONLY", "HALF_BOARD", "FULL_BOARD"]
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "id": "vo-guest-details",
                                        "name": "GuestDetails",
                                        "properties": [
                                            {
                                                "name": "name"
                                            },
                                            {
                                                "name": "email"
                                            },
                                            {
                                                "name": "phoneNumber"
                                            },
                                            {
                                                "name": "membershipLevel"
                                            }
                                        ]
                                    },
                                    {
                                        "id": "vo-booking-preferences",
                                        "name": "BookingPreferences",
                                        "properties": [
                                            {
                                                "name": "numberOfGuests",
                                                "type": "Integer"
                                            },
                                            {
                                                "name": "mealPlan",
                                                "type": "MealPlan"
                                            },
                                            {
                                                "name": "specialRequests"
                                            }
                                        ]
                                    }
                                ],
                                "commands": [
                                    {
                                        "id": "cmd-check-room-availability",
                                        "name": "CheckRoomAvailability",
                                        "api_verb": "GET",
                                        "isRestRepository": false,
                                        "properties": [
                                            {
                                                "name": "checkInDate",
                                                "type": "Date"
                                            },
                                            {
                                                "name": "checkOutDate",
                                                "type": "Date"
                                            }
                                        ],
                                        "outputEvents": [
                                            {
                                                "id": "evt-room-availability-checked",
                                                "name": "RoomAvailabilityChecked"
                                            }
                                        ]
                                    }
                                ],
                                "events": [
                                    {
                                        "id": "evt-room-availability-checked",
                                        "name": "RoomAvailabilityChecked",
                                        "outputCommands": [
                                            {
                                                "id": "cmd-calculate-room-price",
                                                "name": "CalculateRoomPrice",
                                                "policyId": "pol-roomPriceCalculation",
                                                "policyName": "RoomPriceCalculation"
                                            }
                                        ]
                                    },
                                    {
                                        "id": "evt-room-price-calculated",
                                        "name": "RoomPriceCalculated",
                                        "outputCommands": []
                                    }
                                ],
                                "readModels": []
                            },
                            {
                                "id": "agg-room",
                                "name": "Room",
                                "properties": [
                                    {
                                        "name": "roomId",
                                        "type": "Long",
                                        "isKey": true
                                    },
                                    {
                                        "name": "roomNumber"
                                    },
                                    {
                                        "name": "roomType",
                                        "type": "RoomType"
                                    },
                                    {
                                        "name": "basePrice",
                                        "type": "Double"
                                    },
                                    {
                                        "name": "status",
                                        "type": "RoomStatus"
                                    }
                                ],
                                "enumerations": [
                                    {
                                        "id": "enum-room-type",
                                        "name": "RoomType",
                                        "items": ["STANDARD", "DELUXE", "SUITE"]
                                    },
                                    {
                                        "id": "enum-room-status",
                                        "name": "RoomStatus",
                                        "items": ["AVAILABLE", "OCCUPIED", "MAINTENANCE"]
                                    }
                                ],
                                "commands": [
                                    {
                                        "id": "cmd-calculate-room-price",
                                        "name": "CalculateRoomPrice",
                                        "api_verb": "POST",
                                        "isRestRepository": false,
                                        "properties": [
                                            {
                                                "name": "roomId",
                                                "type": "Long",
                                                "isKey": true
                                            },
                                            {
                                                "name": "checkInDate",
                                                "type": "Date"
                                            },
                                            {
                                                "name": "checkOutDate",
                                                "type": "Date"
                                            },
                                            {
                                                "name": "numberOfGuests",
                                                "type": "Integer"
                                            },
                                            {
                                                "name": "roomType",
                                                "type": "RoomType"
                                            }
                                        ],
                                        "outputEvents": [
                                            {
                                                "id": "evt-room-price-calculated",
                                                "name": "RoomPriceCalculated"
                                            }
                                        ]
                                    },
                                    {
                                        "id": "cmd-update-room-status",
                                        "name": "UpdateRoomStatus",
                                        "api_verb": "PATCH",
                                        "isRestRepository": true,
                                        "properties": [
                                            {
                                                "name": "roomId",
                                                "type": "Long",
                                                "isKey": true
                                            },
                                            {
                                                "name": "status",
                                                "type": "RoomStatus"
                                            },
                                            {
                                                "name": "reason"
                                            }
                                        ],
                                        "outputEvents": [
                                            {
                                                "id": "evt-room-status-updated",
                                                "name": "RoomStatusUpdated"
                                            }
                                        ]
                                    }
                                ],
                                "events": [
                                    {
                                        "id": "evt-room-status-updated",
                                        "name": "RoomStatusUpdated",
                                        "outputCommands": [
                                            {
                                                "id": "cmd-notify-housekeeping",
                                                "name": "NotifyHousekeeping",
                                                "policyId": "pol-notifyHousekeeping",
                                                "policyName": "NotifyHousekeeping"
                                            }
                                        ]
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
                        "title": "Create New Room Booking",
                        "description": "As a guest, I want to book a hotel room with my preferences so that I can secure my stay",
                        "acceptance": [
                            "All required guest information must be provided",
                            "Room type must be selected through search popup",
                            "Valid check-in and check-out dates must be selected",
                            "Meal plan must be chosen from available options"
                        ]
                    }
                ],
                "entities": {
                    "Booking": {
                        "properties": [
                            {"name": "bookingNumber", "type": "String", "required": true, "isPrimaryKey": true},
                            {"name": "guestId", "type": "String", "required": true, "isForeignKey": true, "foreignEntity": "Guest"},
                            {"name": "roomType", "type": "String", "required": true},
                            {"name": "checkInDate", "type": "Date", "required": true},
                            {"name": "checkOutDate", "type": "Date", "required": true},
                            {"name": "numberOfGuests", "type": "Integer", "required": true},
                            {"name": "mealPlan", "type": "enum", "required": true, "values": ["No Meal", "Breakfast Only", "Half Board", "Full Board"]},
                            {"name": "specialRequests", "type": "String", "required": false},
                            {"name": "status", "type": "enum", "required": true, "values": ["Active", "Completed", "Cancelled"]},
                            {"name": "totalAmount", "type": "Integer", "required": true}
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
                    }
                ],
                "interfaces": {
                    "RoomBooking": {
                        "sections": [
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
                    }
                }
            },

            "Target Aggregate To Generate Actions": "Booking"
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": "In this solution, we analyzed the summarized event storming model and the functional requirements to identify 'Booking' as the critical aggregate. The analysis revealed that the business scenario mandates distinct actions for creating, confirming, and canceling a booking. Accordingly, each action is mapped to a specific command—CreateBooking, ConfirmBooking, and CancelBooking—with corresponding events (BookingCreated, BookingConfirmed, BookingCancelled) ensuring every command triggers a consistent state transition. The design further incorporates read models to support query operations, applying precise data types (e.g., Long, Date, and Enum) and enforcing strict validation rules such as valid booking dates and mandatory field presence. By aligning with domain-driven design, CQRS, and event sourcing principles, this approach minimizes duplication, assigns roles (e.g., Guest and System) appropriately, and maintains overall architectural consistency.",
            "result": {
                "commandActions": [
                    {
                        "actionName": "CreateBookingCommand",
                        "objectType": "Command",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "commandId": "cmd-create-booking"
                        },
                        "args": {
                            "commandName": "CreateBooking",
                            "commandAlias": "Create New Booking",
                            "api_verb": "POST",
                            "properties": [
                                {
                                    "name": "guestId",
                                    "type": "Long"
                                },
                                {
                                    "name": "roomId",
                                    "type": "Long"
                                },
                                {
                                    "name": "checkInDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "checkOutDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "numberOfGuests",
                                    "type": "Integer"
                                },
                                {
                                    "name": "mealPlan",
                                    "type": "MealPlan"
                                },
                                {
                                    "name": "specialRequests",
                                    "type": "String"
                                }
                            ],
                            "outputEventIds": ["evt-booking-created"],
                            "actor": "Guest"
                        }
                    },
                    {
                        "actionName": "ConfirmBookingCommand",
                        "objectType": "Command",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "commandId": "cmd-confirm-booking"
                        },
                        "args": {
                            "commandName": "ConfirmBooking",
                            "commandAlias": "Confirm Booking",
                            "api_verb": "PATCH",
                            "properties": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "paymentId",
                                    "type": "String"
                                }
                            ],
                            "outputEventIds": ["evt-booking-confirmed"],
                            "actor": "System"
                        }
                    },
                    {
                        "actionName": "CancelBookingCommand",
                        "objectType": "Command",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "commandId": "cmd-cancel-booking"
                        },
                        "args": {
                            "commandName": "CancelBooking",
                            "commandAlias": "Cancel Booking",
                            "api_verb": "PATCH",
                            "properties": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "cancellationReason",
                                    "type": "String"
                                }
                            ],
                            "outputEventIds": ["evt-booking-cancelled"],
                            "actor": "Guest"
                        }
                    }
                ],
                "eventActions": [
                    {
                        "actionName": "BookingCreatedEvent",
                        "objectType": "Event",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "eventId": "evt-booking-created"
                        },
                        "args": {
                            "eventName": "BookingCreated",
                            "eventAlias": "Booking Created",
                            "properties": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "guestId",
                                    "type": "Long"
                                },
                                {
                                    "name": "roomId",
                                    "type": "Long"
                                },
                                {
                                    "name": "checkInDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "checkOutDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "numberOfGuests",
                                    "type": "Integer"
                                },
                                {
                                    "name": "mealPlan",
                                    "type": "MealPlan"
                                },
                                {
                                    "name": "status",
                                    "type": "BookingStatus"
                                },
                                {
                                    "name": "totalAmount",
                                    "type": "Integer"
                                }
                            ]
                        }
                    },
                    {
                        "actionName": "BookingConfirmedEvent",
                        "objectType": "Event",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "eventId": "evt-booking-confirmed"
                        },
                        "args": {
                            "eventName": "BookingConfirmed",
                            "eventAlias": "Booking Confirmed",
                            "properties": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "paymentId",
                                    "type": "String"
                                },
                                {
                                    "name": "confirmedAt",
                                    "type": "Date"
                                }
                            ]
                        }
                    },
                    {
                        "actionName": "BookingCancelledEvent",
                        "objectType": "Event",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "eventId": "evt-booking-cancelled"
                        },
                        "args": {
                            "eventName": "BookingCancelled",
                            "eventAlias": "Booking Cancelled",
                            "properties": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "cancellationReason",
                                    "type": "String"
                                },
                                {
                                    "name": "cancelledAt",
                                    "type": "Date"
                                },
                                {
                                    "name": "refundAmount",
                                    "type": "Integer"
                                }
                            ]
                        }
                    }
                ],
                "readModelActions": [
                    {
                        "actionName": "BookingSummaryReadModel",
                        "objectType": "ReadModel",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "readModelId": "read-booking-summary"
                        },
                        "args": {
                            "readModelName": "BookingSummary",
                            "readModelAlias": "Booking Summary",
                            "isMultipleResult": true,
                            "queryParameters": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "guestName",
                                    "type": "String"
                                },
                                {
                                    "name": "roomNumber",
                                    "type": "String"
                                },
                                {
                                    "name": "checkInDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "checkOutDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "status",
                                    "type": "BookingStatus"
                                },
                                {
                                    "name": "totalAmount",
                                    "type": "Integer"
                                }
                            ],
                            "actor": "Guest"
                        }
                    },
                    {
                        "actionName": "BookingDetailsReadModel",
                        "objectType": "ReadModel",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "readModelId": "read-booking-details"
                        },
                        "args": {
                            "readModelName": "BookingDetails",
                            "readModelAlias": "Booking Details",
                            "isMultipleResult": false,
                            "queryParameters": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "guestDetails",
                                    "type": "GuestDetails"
                                },
                                {
                                    "name": "roomDetails",
                                    "type": "RoomDetails"
                                },
                                {
                                    "name": "bookingPreferences",
                                    "type": "BookingPreferences"
                                },
                                {
                                    "name": "paymentHistory",
                                    "type": "List<PaymentRecord>"
                                },
                                {
                                    "name": "status",
                                    "type": "BookingStatus"
                                },
                                {
                                    "name": "createdAt",
                                    "type": "Date"
                                },
                                {
                                    "name": "lastModifiedAt",
                                    "type": "Date"
                                }
                            ],
                            "actor": "Guest"
                        }
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Summarized Existing EventStorming Model": JSON.stringify(this.client.input.summarizedESValue),

            "Functional Requirements": this.client.input.description,

            "Target Aggregate To Generate Actions": this.client.input.targetAggregate.name,

            "Final Check": `
Data Validation:
* All property names use appropriate data types (String, Long, Integer, Double, Boolean, Date, etc.)
* Complex types (Address, Money, Email, etc.) are used instead of String where applicable
* Collections are properly defined using List<Type> format
* Primary keys and foreign keys are correctly specified

Naming Conventions:
* All technical names (Commands, Events, ReadModels) are in English
* All display names (aliases) are in ${this.preferredLanguage}
* Commands follow Verb + Noun pattern (e.g., CreateOrder)
* Events follow Noun + Past Participle pattern (e.g., OrderCreated)
* ReadModels follow Noun + Purpose pattern (e.g., OrderSummary)

Structural Integrity:
* No duplicate Commands, Events, or ReadModels across Aggregates
* Each Command has corresponding Event(s)
* Event properties capture complete state changes
* ReadModels support all required query operations

Business Logic:
* All user requirements are fully addressed
* Business rules and validations are incorporated
* Proper actor assignments for Commands and ReadModels
* State transitions are properly handled

Best Practices:
* Commands maintain single responsibility
* No CRUD operations disguised as business operations
* Appropriate pagination for list operations
* Proper error handling considerations
* Security and authorization requirements included
`
        }
    }


    onThink(returnObj, thinkText){
        returnObj.directMessage = `Creating commands for ${this.client.input.aggregateDisplayName} Aggregate... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Creating commands for ${this.client.input.aggregateDisplayName} Aggregate... (${this.getTotalOutputTextLength(returnObj)} characters generated)`

        // 실시간으로 진행을 보여주기 위해서 가능한 경우, 부분적인 액션이라도 반환함
        const particalActions = returnObj.modelRawValue.match(/({"actionName".*?"objectType".*?"ids".*?"args".*?)(?=,{"actionName")/g)
        if(!particalActions || particalActions.length === 0) return


        let actions = []
        for(let action of particalActions) {
            try {
                const actionObj = this._parseToJson(action)
                actions.push(actionObj)
            } catch(e) {}
        }
        if(actions.length === 0) return


        let {actions: appliedActions, createdESValue: createdESValue} = this._getActionAppliedESValue(actions, true)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        }
        console.log(`[*] 스트리밍 중에 ${this.generatorName}에서 부분적 결과 파싱 완료!`, {returnObj})
    }

    onCreateModelFinished(returnObj){
        let actions = [
            ...(returnObj.modelValue.aiOutput.result.commandActions || []),
            ...(returnObj.modelValue.aiOutput.result.eventActions || []),
            ...(returnObj.modelValue.aiOutput.result.readModelActions || [])
        ]
        let {actions: appliedActions, createdESValue: createdESValue} = this._getActionAppliedESValue(actions, false)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        }
        returnObj.directMessage = `Creating commands for ${this.client.input.aggregateDisplayName} Aggregate... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    _getActionAppliedESValue(actions, isAddFakeActions) {
        actions = this.client.input.esAliasTransManager.transToUUIDInActions(actions)
        this._restoreActions(actions, this.client.input.esValue, this.client.input.targetBoundedContext.name)
        actions = this._filterActions(actions)
        this._removeEventOutputCommandIdsProperty(actions)
        
        let esValueToModify = JSON.parse(JSON.stringify(this.client.input.esValue))

        // 부분적인 결과를 반환시에는 가짜 액션을 추가해서 버그를 방지하기 위해서
        if(isAddFakeActions)
            actions = ESFakeActionsUtil.addFakeActions(actions, esValueToModify)

        let createdESValue = ESActionsUtil.getActionAppliedESValue(actions, this.client.input.userInfo, this.client.input.information, esValueToModify)

        return { actions, createdESValue }
    }

    _restoreActions(actions, esValue, targetBoundedContextName){
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)

        for(let action of actions){
            switch(action.objectType){
                case "Command":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    action.args.isRestRepository = false
                    break

                case "Event":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break
                
                case "ReadModel": {
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    action.args.properties = action.args.queryParameters
                    break
                }
            }
        }

        for(let action of actions){
            switch(action.objectType){
                case "Command":
                    if(action.args && action.args.outputEventNames)
                        action.args.outputEventIds = action.args.outputEventNames
                            .map(name => this.__getIdByNameInEsValue(name, actions, esValue))
                        .filter(id => id)
                    break
                
                case "Event":
                    if(action.args && action.args.outputCommandNames)
                        action.args.outputCommandIds = action.args.outputCommandNames.map(name => {
                            return {
                                commandId: this.__getIdByNameInEsValue(name, actions, esValue),
                                relatedAttribute: "",
                                reason: ""
                            }
                        }).filter(outputCommand => outputCommand.commandId)
                    break
            }
        }
    }

    _filterActions(actions){
        // 이미 존재하는 Command, Event, ReadModel을 새로 생성하려는 경우 막아서 중복 생성을 방지하기 위해서
        const esNames = Object.values(this.client.input.esValue.elements)
            .filter(element => element && element.name)
            .map(element => element.name)
        const displayNames = Object.values(this.client.input.esValue.elements)
            .filter(element => element && element.displayName)
            .map(element => element.displayName.replaceAll(" ", ""))

        actions = actions.filter(action => {
            if(action.objectType === "Command")
                return !esNames.includes(action.args.commandName) && !displayNames.includes(action.args.commandAlias.replaceAll(" ", "")) && !action.args.commandName.toLowerCase().includes("search") && !action.args.commandName.toLowerCase().includes("filter")
            if(action.objectType === "Event")
                return !esNames.includes(action.args.eventName) && !displayNames.includes(action.args.eventAlias.replaceAll(" ", "")) && !action.args.eventName.toLowerCase().includes("search") && !action.args.eventName.toLowerCase().includes("filter")
            if(action.objectType === "ReadModel")
                return !esNames.includes(action.args.readModelName) && !displayNames.includes(action.args.readModelAlias.replaceAll(" ", ""))
            return true
        })


        // 아무도 호출하지 않는 이벤트를 제외시키기 위해서
        const outputEventIds = []
        for(let action of actions) {
            if(action.objectType === "Command")
                outputEventIds.push(...action.args.outputEventIds)
        }

        actions = actions.filter(action => {
            if(action.objectType === "Event")
                return outputEventIds.includes(action.ids.eventId)
            return true
        })

        return actions
    }

    _removeEventOutputCommandIdsProperty(actions){
        // outputCommandIds(정책) 생성 부분은 추후에 별도의 LLM 체인으로 처리
        for(let action of actions){
            if(action.objectType === "Event" && action.args && action.args.outputCommandIds)
                delete action.args.outputCommandIds
        }
    }

    __getIdByNameInEsValue(name, actions, esValue){
        for(let action of actions){
            if(action.args && action.args.commandName && action.args.commandName === name)
                return action.ids.commandId
            if(action.args && action.args.eventName && action.args.eventName === name)
                return action.ids.eventId
        }

        for(let element of Object.values(esValue.elements)){
            if(element && element.name === name && element.id)
                return element.id
        }

        return null
    }

    __getTargetBoundedContext(esValue, targetBoundedContextName){
        let targetBoundedContext = null
        for(let element of Object.values(esValue.elements).filter(element => element)) {
            if(element._type === "org.uengine.modeling.model.BoundedContext") {
                if(element.name.toLowerCase() === targetBoundedContextName.toLowerCase()) targetBoundedContext = element
            }
        }
        if(!targetBoundedContext) throw new Error(`${targetBoundedContextName}에 대한 정보를 찾을 수 없습니다.`)
        return targetBoundedContext
    }
}

module.exports = CreateCommandActionsByFunctions;