
const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { ESValueSummaryGenerator } = require("..")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESActionsUtil = require("../../es-ddl-generators/modules/ESActionsUtil")
const ESFakeActionsUtil = require("../../es-ddl-generators/modules/ESFakeActionsUtil")

class CreateAggregateActionsByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "description", "draftOption", "esValue", "userInfo", "information", "isAccumulated"]
        this.progressCheckStrings = ["overviewThoughts", "actions"]
    }

    /**
     * @description 이벤트 스토밍 모델의 Aggregate를 생성하기 위한 제너레이터를 생성하는 팩토리 메서드입니다.
     * 여러 개의 Aggregate 구조를 순차적으로 생성하고 각 생성 단계별로 콜백을 통해 진행 상황을 추적할 수 있습니다.
     *
     * @example 기본적인 Aggregate 생성 제너레이터 사용
     * const generator = CreateAggregateActionsByFunctions.createGeneratorByDraftOptions({
     *   onGenerationSucceeded: (returnObj) => {
     *     // 생성된 Aggregate 정보로 이벤트 스토밍 모델 업데이트
     *     if(returnObj.modelValue && returnObj.modelValue.createdESValue) {
     *       esValue.elements = returnObj.modelValue.createdESValue.elements
     *       esValue.relations = returnObj.modelValue.createdESValue.relations
     *     }
     *   }
     * })
     * 
     * // 제너레이터 초기화 및 생성 시작
     * generator.initInputs(
     *   mocks.getEsDraft("libraryService"),
     *   mocks.getEsValue("libraryService", ["remainOnlyBoundedContext"]),
     *   mocks.esConfigs.userInfo,
     *   mocks.esConfigs.information
     * )
     * generator.generateIfInputsExist()
     *
     * @example 진행 상태 모니터링을 포함한 상세 사용
     * const generator = CreateAggregateActionsByFunctions.createGeneratorByDraftOptions({
     *   onFirstResponse: (returnObj) => {
     *     // 첫 번째 응답 처리
     *     console.log("Generation started")
     *   },
     *   onModelCreated: (returnObj) => {
     *     // 모델 생성 완료시 처리
     *     console.log("Model created") 
     *   },
     *   onGenerationSucceeded: (returnObj) => {
     *     // 생성 성공시 처리
     *     updateEventStormingModel(returnObj)
     *   },
     *   onGenerationDone: () => {
     *     // 모든 Aggregate 생성 완료시 처리
     *     console.log("All aggregates generated")
     *   },
     *   onRetry: (returnObj) => {
     *     // 오류 발생시 재시도 처리
     *     console.error(returnObj.errorMessage)
     *   },
     *   onStopped: () => {
     *     // 생성 중단시 처리
     *     console.log("Generation stopped")
     *   }
     * })
     *
     * @note
     * - callbacks 파라미터는 다음 콜백 함수들을 포함할 수 있습니다:
     *   - onFirstResponse: 첫 응답 수신시 호출
     *   - onModelCreated: 모델 생성 완료시 호출
     *   - onGenerationSucceeded: 각 Aggregate 생성 성공시 호출
     *   - onGenerationDone: 모든 Aggregate 생성 완료시 호출
     *   - onRetry: 오류 발생으로 재시도시 호출
     *   - onStopped: 생성 중단시 호출
     * - initInputs 메서드는 다음 파라미터들이 필요합니다:
     *   - draftOptions: Aggregate 구조 정의
     *   - esValue: 현재 이벤트 스토밍 모델 상태
     *   - userInfo: 사용자 정보
     *   - information: 추가 설정 정보
     * - generateIfInputsExist 메서드는 남은 입력이 있는 경우 true를 반환하고 다음 생성을 시작합니다
     */
    static createGeneratorByDraftOptions(callbacks){
        const generator = new CreateAggregateActionsByFunctions({
            input: null,

            onFirstResponse: (returnObj) => {
                if(callbacks.onFirstResponse)
                    callbacks.onFirstResponse(returnObj)
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
                alert(`[!] An error occurred during aggregate creation, please try again.\n* Error log \n${returnObj.errorMessage}`)

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
                inputs = inputs.concat(
                    eachDraftOption.structure.map((aggregateStructure, index) => ({
                        targetBoundedContext: eachDraftOption.boundedContext,
                        description: eachDraftOption.description,
                        draftOption: [aggregateStructure],
                        esValue: esValue,
                        userInfo: userInfo,
                        information: information,
                        isAccumulated: index > 0
                    })))
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
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        inputParams.draftOption = this._removeClassIdProperties(JSON.parse(JSON.stringify(inputParams.draftOption)))


        inputParams.targetAggregate = Object.values(inputParams.draftOption)[0].aggregate
        inputParams.aggregateDisplayName = inputParams.targetAggregate.alias ? inputParams.targetAggregate.alias : inputParams.targetAggregate.name
        inputParams.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)


        let targetBCRemovedESValue = JSON.parse(JSON.stringify(inputParams.esValue))
        if(!inputParams.isAccumulated)
            this._removePrevBoundedContextRelatedElements(inputParams.targetBoundedContext.name, targetBCRemovedESValue)
        
        inputParams.summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(targetBCRemovedESValue, 
            ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateOuterStickers, inputParams.esAliasTransManager)

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
                ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateOuterStickers,
                leftTokenCount,
                this.model,
                inputParams.esAliasTransManager
            )
            console.log(`[*] 요약 이후 Summary`, inputParams.summarizedESValue)
        }
    }

    _removeClassIdProperties(draftOption){
        if (!Array.isArray(draftOption)) return draftOption;

        return draftOption.map(option => {
            let cleanedOption = { ...option };

            if (cleanedOption.valueObjects && Array.isArray(cleanedOption.valueObjects)) {
                cleanedOption.valueObjects = cleanedOption.valueObjects.filter(
                    vo => !vo.referencedAggregate
                );
            }

            return cleanedOption;
        });
    }

    _buildRequestContext(inputParams) {
        const aggregateName = inputParams.targetAggregate.name
        const boundedContextName = inputParams.targetBoundedContext.name
        const description = inputParams.description || ''
        
        const aggregateStructure = inputParams.draftOption[0]
        const hasValueObjects = (aggregateStructure.valueObjects) ? aggregateStructure.valueObjects.length > 0 : false
        const hasEntities = (aggregateStructure.entities) ? aggregateStructure.entities.length > 0 : false
        
        return `Task: Creating ${aggregateName} Aggregate in ${boundedContextName} Bounded Context
        
Business Context:
${description}

Aggregate Structure:
- Creating new aggregate '${aggregateName}'${inputParams.targetAggregate.alias ? ` (${inputParams.targetAggregate.alias})` : ''}
- Will contain ${hasValueObjects ? 'value objects' : ''}${hasValueObjects && hasEntities ? ' and ' : ''}${hasEntities ? 'entities' : ''}
- Part of ${boundedContextName} domain

Focus:
- Elements directly related to ${aggregateName} aggregate
- Supporting elements within ${boundedContextName} bounded context
- Essential domain relationships and dependencies`
    }


    __buildAgentRolePrompt(){
        return `You are a DDD expert specializing in:
1. Converting business requirements into precise domain models
2. Designing clean bounded contexts and aggregates
3. Implementing event sourcing patterns
4. Creating maintainable domain structures

Focus on:
- Strategic DDD principles
- Aggregate design best practices 
- Clear domain boundaries
- Consistent naming conventions
`
    }

    __buildTaskGuidelinesPrompt(){
        return `In your current event storming model, you need to write actions to add elements inside a particular Bounded Context, following the structure provided by the user.

Please follow these rules:

Data Type Rules:
1. For Aggregate properties, use:
   - Basic Java types: String, Long, Integer, Double, Boolean, Date
   - Predefined types: Address, Portrait, Rating, Money, Email
   - Custom types must be defined as: Enumeration, ValueObject, or Entity
2. For collections, use 'List<ClassName>' syntax (e.g., List<Address>)

Type Reference and Enumeration Rules:
3. When to use Enumerations:
   - For any property representing a fixed set of values or categories
   - When the property value must be one of a predefined list
   - When the property name ends with: Type, Status, Category, Level, Phase, Stage
   
   ALWAYS create as Enumeration (not ValueObject) when the property:
   - Represents a classification (e.g., BookCategory, AccountType)
   - Represents a status (e.g., OrderStatus, PaymentStatus)
   - Represents a type (e.g., UserType, ProductType)
   - Has a fixed set of possible values (e.g., DayOfWeek, Currency)
   - Is used for categorization or classification
   
   Example Enumeration cases:
   - category -> BookCategory (Enumeration)
   - status -> OrderStatus (Enumeration)
   - type -> ProductType (Enumeration)
   - level -> MembershipLevel (Enumeration)
   - paymentMethod -> PaymentMethod (Enumeration)

4. When to use ValueObjects:
   - When the type contains multiple related properties
   - When the properties together form a meaningful concept
   - When immutability is required
   
   Example ValueObject cases:
   - address -> Address (street, city, zipCode)
   - period -> DateRange (startDate, endDate)
   - money -> Money (amount, currency)
   - contact -> ContactInfo (phone, email, address)

Naming and Language Conventions:
5. Object names (classes, properties, methods) must be in English
6. Supporting content (aliases, descriptions) must be in ${this.preferredLanguage}

Structural Rules:
7. Aggregates:
   - Must have exactly one primary key attribute
   - For composite keys, create a ValueObject and use it as the primary key
   - Reference other Aggregates using their class names, not IDs
   - Avoid creating separate transaction objects when the main aggregate can manage the lifecycle:
     * Do not create Transaction entities if their properties duplicate the main aggregate
     * Use the aggregate root to manage state transitions and history
     * Consider Event Sourcing for tracking historical changes instead of transaction objects
     * Transaction records should only be created when they have unique business value beyond the aggregate's lifecycle

8. ValueObjects:
   - Must contain multiple related properties
   - Should be immutable
   - Cannot have single properties unless absolutely necessary

Creation Guidelines:
9. Create only:
   - Aggregates listed in 'Aggregate to create'
   - All ValueObjects and Entities from the provided structure
   - Enumerations for any property requiring fixed values
   - All supporting types needed by properties

10. Property Type Selection:
    - Use specific types over generic ones
    - Example mappings:
      * startDate -> Date
      * currentCapacity -> Integer
      * price -> Money
      * category -> Enumeration
      * status -> Enumeration

Type Dependency Resolution:
11. Before finalizing the result:
    - Review all property types
    - Create Enumerations for any classification, status, or type properties
    - Ensure all custom types are properly defined
    - Verify correct usage of ValueObjects vs Enumerations

Constraints:
12. Rules:
    - Only reference existing Aggregates without modifying them
    - Do not recreate types that already exist in the system
    - Do not write comments in the output JSON object
    - Do not create duplicate elements in the model
    - Do not create ValueObjects for properties that should be defined as Enumerations
    - Do not append type names (like 'Enumeration', 'ValueObject', 'Entity') to object names - use base names only (e.g., 'BookStatus' instead of 'BookStatusEnumeration')
    - Names must be unique across all actions and existing elements:
      * No duplicate names between new and existing elements
      * No duplicate names within new elements, regardless of their type
      * Example: If creating a ValueObject named "Address" and an Enumeration, the Enumeration cannot be named "Address" even though they are different types

13. Required Elements:
    - All ValueObjects, Entities, and Enumerations must be used as properties
    - All elements from the user's structure must be implemented
    - All relationships must be properly mapped
    - All custom types must have corresponding definitions
`
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeWithFilter.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "overviewThoughts": {
        "summary": "High-level overview of the model's purpose and key design decisions",
        "details": {
            "domainAlignment": "How well the model aligns with core domain concepts and business requirements",
            "structuralIntegrity": "Assessment of model's internal consistency and relationship coherence",
            "technicalFeasibility": "Evaluation of implementation practicality and technical constraints"
        },
        "additionalConsiderations": "Future scalability concerns, integration points, and potential evolution paths"
    },

    "result": {
        "actions": [
            {
                "actionThoughts": {
                    "summary": "Reasoning behind the specific action being taken on the domain object",
                    "details": {
                        "boundaryDecisions": "Justification for object boundaries and responsibility allocation",
                        "invariantProtection": "How the action maintains domain invariants and business rules",
                        "relationshipImpact": "Effects on existing relationships and dependencies"
                    },
                    "additionalConsiderations": "Alternative approaches considered and specific implementation challenges"
                },

                // Write the ActionName that you utilized in the previous steps
                "actionName": "<actionName>",

                // This attribute indicates what type of object information is being modified.
                // Choose one from Aggregate, ValueObject, Entity, Enumeration
                "objectType": "<objectType>",

                // This attribute contains the ID information of the object on which the action is performed.
                "ids": {
                    "<idName>": "<idValue>"
                },

                // This attribute contains the parameters required for the action.
                "args": {
                    "<argName>": "<argValue>",

                    "propertyThoughts": {
                        "summary": "Analysis of property structure and composition decisions",
                        "details": {
                            "typeSelection": "Reasoning behind chosen data types and their implications",
                            "encapsulationStrategy": "How properties are grouped and protected within the object",
                            "validationRules": "Required constraints and business rules for property values"
                        },
                        "additionalConsiderations": "Performance implications, serialization concerns, and validation complexity"
                    },
                    "properties": []
                }
            }
        ]
    }
}`
    }

    __buildAfterJsonResponseFormat() {
        return `I will explain the ids and args used in each objectType.
You cannot use any arbitrary parameters not described in this explanation in ids or args.

# objectType: Aggregate
- Description
aggregateId can be used when defining Enumeration, ValueObject, Entity that belong to an Aggregate.

- Return format
{
    "objectType": "Aggregate",
    "ids": {
        "aggregateId": "<aggregateId>"
    },
    "args": {
        "aggregateName": "<aggregateName>",
        "aggregateAlias": "<aggregateAlias>",

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ]
    }
}

# objectType: Enumeration
- Description
If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an enumeration.

- Return format
{
    "objectType": "Enumeration",
    "ids": {
        "aggregateId": "<aggregateId>",
        "enumerationId": "<enumerationId>"
    },
    "args": {
        "enumerationName": "<enumerationName>",
        "enumerationAlias": "<enumerationAlias>",
        
        "properties": [
            {
                "name": "<propertyName>" // Must be in English
            }
        ]
    }
}

# objectType: ValueObject
- Description
If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an ValueObject.
ValueObjects are immutable objects defined by their attributes rather than their identity.
They are used to group related attributes that should be treated as a single unit.

- Return format
{
    "objectType": "ValueObject",
    "ids": {
        "aggregateId": "<aggregateId>",
        "valueObjectId": "<valueObjectId>"
    },
    "args": {
        "valueObjectName": "<valueObjectName>",
        "valueObjectAlias": "<valueObjectAlias>",

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true], // Write only if there is a primary key.
                ["isForeignProperty": true] // Whether it is a foreign key. Write only if this attribute references another table's attribute.
            }
        ]
    }
}

# objectType: Entity
- Description
If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an Entity.
Unlike ValueObjects, Entities are mutable objects with their own identity and lifecycle.
They represent complex domain concepts that don't qualify as Aggregates but need more flexibility than ValueObjects.

- Return format
{
    "objectType": "Entity",
    "ids": {
        "aggregateId": "<aggregateId>",
        "entityId": "<entityId>"
    },
    "args": {
        "entityName": "<entityName>",
        "entityAlias": "<entityAlias>",

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true], // Write only if there is a primary key.
                ["isForeignProperty": true] // Whether it is a foreign key. Write only if this attribute references another table's attribute.
            }
        ]
    }
}`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Summarized Existing EventStorming Model": {
                "deletedProperties": ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateOuterStickers,
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
                                "id": "act-staff",
                                "name": "HotelStaff"
                            }
                        ],
                        "aggregates": [
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
                                        "name": "type",
                                        "type": "RoomType"
                                    },
                                    {
                                        "name": "rate",
                                        "type": "Money"
                                    },
                                    {
                                        "name": "status",
                                        "type": "RoomStatus"
                                    }
                                ],
                                "entities": [],
                                "enumerations": [
                                    {
                                        "id": "enum-room-type",
                                        "name": "RoomType",
                                        "items": ["STANDARD", "DELUXE", "SUITE", "PRESIDENTIAL"]
                                    },
                                    {
                                        "id": "enum-room-status",
                                        "name": "RoomStatus",
                                        "items": ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"]
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "id": "vo-room-amenities",
                                        "name": "RoomAmenities",
                                        "properties": [
                                            {
                                                "name": "hasMinibar",
                                                "type": "Boolean"
                                            },
                                            {
                                                "name": "hasWifi",
                                                "type": "Boolean"
                                            },
                                            {
                                                "name": "viewType"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },

            "Bounded Context to Generate Actions": "hotelservice",

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
            },

            "Suggested Structure": [
                {
                    "aggregate": {
                        "name": "Booking",
                        "alias": "Room Booking"
                    },
                    "valueObjects": [
                        {
                            "name": "GuestInformation",
                            "alias": "Guest Details"
                        },
                        {
                            "name": "BookingPeriod",
                            "alias": "Stay Duration"
                        }
                    ],
                    "entities": [
                        {
                            "name": "PaymentDetail",
                            "alias": "Payment Information"
                        }
                    ]
                }
            ],

            "Aggregate to create": {
                "name": "Booking",
                "alias": "Room Booking"
            }
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "overviewThoughts": {
                "summary": "Design of a hotel booking domain model implementing DDD patterns and best practices",
                "details": {
                    "domainAlignment": "Model effectively captures core booking concepts including guest information, payment processing, and room management",
                    "structuralIntegrity": "Clear boundaries between aggregates with well-defined value objects and entities",
                    "technicalFeasibility": "Implementation supports both CRUD and event-sourced patterns while maintaining domain integrity"
                },
                "additionalConsiderations": "Model allows for future extensions such as loyalty programs and dynamic pricing while maintaining clean architecture"
            },
    
            "result": {
                "actions": [
                    {
                        "actionThoughts": {
                            "summary": "Creating the core Booking aggregate to manage hotel reservations",
                            "details": {
                                "boundaryDecisions": "Booking aggregate serves as the primary transaction boundary for reservation management",
                                "invariantProtection": "Ensures booking dates validity and payment status tracking",
                                "relationshipImpact": "Coordinates with Room aggregate for availability management"
                            },
                            "additionalConsiderations": "Designed for scalability and future feature additions"
                        },
                        "actionName": "CreateBookingAggregate",
                        "objectType": "Aggregate",
                        "ids": {
                            "aggregateId": "agg-booking"
                        },
                        "args": {
                            "aggregateName": "Booking",
                            "aggregateAlias": "Room Booking",
                            "propertyThoughts": {
                                "summary": "Core properties needed for booking management",
                                "details": {
                                    "typeSelection": "Using strong types for dates and monetary values",
                                    "encapsulationStrategy": "Grouping related data into value objects",
                                    "validationRules": "Ensuring required fields and valid date ranges"
                                },
                                "additionalConsiderations": "Properties support audit and tracking requirements"
                            },
                            "properties": [
                                {
                                    "name": "bookingId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "guestInformation",
                                    "type": "GuestInformation"
                                },
                                {
                                    "name": "bookingPeriod",
                                    "type": "BookingPeriod"
                                },
                                {
                                    "name": "paymentDetails",
                                    "type": "List<PaymentDetail>"
                                },
                                {
                                    "name": "status",
                                    "type": "BookingStatus"
                                },
                                {
                                    "name": "totalAmount",
                                    "type": "Money"
                                },
                                {
                                    "name": "specialRequests"
                                }
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating PaymentDetail entity to track payment information",
                            "details": {
                                "boundaryDecisions": "Separate entity for payment tracking within booking context",
                                "invariantProtection": "Maintains payment status consistency",
                                "relationshipImpact": "Supports multiple payments per booking"
                            },
                            "additionalConsiderations": "Designed for payment reconciliation and audit"
                        },
                        "actionName": "CreatePaymentDetailEntity",
                        "objectType": "Entity",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "entityId": "entity-payment-detail"
                        },
                        "args": {
                            "entityName": "PaymentDetail",
                            "entityAlias": "Payment Information",
                            "propertyThoughts": {
                                "summary": "Essential payment tracking properties",
                                "details": {
                                    "typeSelection": "Strong typing for monetary values and dates",
                                    "encapsulationStrategy": "Complete payment information in one entity",
                                    "validationRules": "Ensuring valid payment amounts and status transitions"
                                },
                                "additionalConsiderations": "Supports multiple payment methods and status tracking"
                            },
                            "properties": [
                                {
                                    "name": "paymentId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "paymentMethod",
                                    "type": "PaymentMethod"
                                },
                                {
                                    "name": "paymentStatus",
                                    "type": "PaymentStatus"
                                },
                                {
                                    "name": "amount",
                                    "type": "Money"
                                },
                                {
                                    "name": "transactionDate",
                                    "type": "Date"
                                }
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating GuestInformation value object for guest details",
                            "details": {
                                "boundaryDecisions": "Encapsulates guest information as immutable value object",
                                "invariantProtection": "Ensures complete guest information",
                                "relationshipImpact": "Used within Booking aggregate"
                            },
                            "additionalConsiderations": "Supports guest profile management"
                        },
                        "actionName": "CreateGuestInformationValueObject",
                        "objectType": "ValueObject",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "valueObjectId": "vo-guest-information"
                        },
                        "args": {
                            "valueObjectName": "GuestInformation",
                            "valueObjectAlias": "Guest Details",
                            "propertyThoughts": {
                                "summary": "Essential guest identification properties",
                                "details": {
                                    "typeSelection": "Using Email type for validation",
                                    "encapsulationStrategy": "Grouping guest details",
                                    "validationRules": "Required contact information"
                                },
                                "additionalConsiderations": "Supports future guest profile extensions"
                            },
                            "properties": [
                                {
                                    "name": "name"
                                },
                                {
                                    "name": "email",
                                    "type": "Email"
                                },
                                {
                                    "name": "phoneNumber"
                                },
                                {
                                    "name": "membershipLevel",
                                    "type": "MembershipLevel"
                                }
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating BookingPeriod value object for stay duration",
                            "details": {
                                "boundaryDecisions": "Encapsulates booking dates as cohesive unit",
                                "invariantProtection": "Ensures valid date ranges",
                                "relationshipImpact": "Core part of Booking aggregate"
                            },
                            "additionalConsiderations": "Supports duration calculations"
                        },
                        "actionName": "CreateBookingPeriodValueObject",
                        "objectType": "ValueObject",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "valueObjectId": "vo-booking-period"
                        },
                        "args": {
                            "valueObjectName": "BookingPeriod",
                            "valueObjectAlias": "Stay Duration",
                            "propertyThoughts": {
                                "summary": "Date range and duration properties",
                                "details": {
                                    "typeSelection": "Date type for temporal values",
                                    "encapsulationStrategy": "Grouping related time information",
                                    "validationRules": "Check-out after check-in validation"
                                },
                                "additionalConsiderations": "Supports duration-based calculations"
                            },
                            "properties": [
                                {
                                    "name": "checkInDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "checkOutDate",
                                    "type": "Date"
                                },
                                {
                                    "name": "numberOfNights",
                                    "type": "Integer"
                                }
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating BookingStatus enumeration",
                            "details": {
                                "boundaryDecisions": "Define possible booking states",
                                "invariantProtection": "Ensures valid status transitions",
                                "relationshipImpact": "Used by Booking aggregate"
                            },
                            "additionalConsiderations": "Supports booking lifecycle management"
                        },
                        "actionName": "CreateBookingStatusEnumeration",
                        "objectType": "Enumeration",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "enumerationId": "enum-booking-status"
                        },
                        "args": {
                            "enumerationName": "BookingStatus",
                            "enumerationAlias": "Booking Status",
                            "propertyThoughts": {
                                "summary": "Complete booking lifecycle states",
                                "details": {
                                    "typeSelection": "Enumeration for fixed set of values",
                                    "encapsulationStrategy": "Clear status definitions",
                                    "validationRules": "Valid status transitions only"
                                },
                                "additionalConsiderations": "Supports status-based workflows"
                            },
                            "properties": [
                                {"name": "PENDING"},
                                {"name": "CONFIRMED"},
                                {"name": "CHECKED_IN"},
                                {"name": "CHECKED_OUT"},
                                {"name": "CANCELLED"}
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating RoomType enumeration",
                            "details": {
                                "boundaryDecisions": "Define available room categories",
                                "invariantProtection": "Ensures valid room types",
                                "relationshipImpact": "Used across booking context"
                            },
                            "additionalConsiderations": "Supports room categorization"
                        },
                        "actionName": "CreateRoomTypeEnumeration",
                        "objectType": "Enumeration",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "enumerationId": "enum-room-type"
                        },
                        "args": {
                            "enumerationName": "RoomType",
                            "enumerationAlias": "Room Type",
                            "propertyThoughts": {
                                "summary": "Standard hotel room categories",
                                "details": {
                                    "typeSelection": "Enumeration for room categories",
                                    "encapsulationStrategy": "Clear type definitions",
                                    "validationRules": "Valid room types only"
                                },
                                "additionalConsiderations": "Extensible for new room types"
                            },
                            "properties": [
                                {"name": "STANDARD"},
                                {"name": "DELUXE"},
                                {"name": "SUITE"},
                                {"name": "PRESIDENTIAL"}
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating PaymentMethod enumeration",
                            "details": {
                                "boundaryDecisions": "Define supported payment methods",
                                "invariantProtection": "Ensures valid payment types",
                                "relationshipImpact": "Used by PaymentDetail entity"
                            },
                            "additionalConsiderations": "Supports payment processing"
                        },
                        "actionName": "CreatePaymentMethodEnumeration",
                        "objectType": "Enumeration",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "enumerationId": "enum-payment-method"
                        },
                        "args": {
                            "enumerationName": "PaymentMethod",
                            "enumerationAlias": "Payment Method",
                            "propertyThoughts": {
                                "summary": "Available payment options",
                                "details": {
                                    "typeSelection": "Enumeration for payment methods",
                                    "encapsulationStrategy": "Clear method definitions",
                                    "validationRules": "Valid payment methods only"
                                },
                                "additionalConsiderations": "Extensible for new payment methods"
                            },
                            "properties": [
                                {"name": "CREDIT_CARD"},
                                {"name": "DEBIT_CARD"},
                                {"name": "CASH"},
                                {"name": "BANK_TRANSFER"}
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating PaymentStatus enumeration",
                            "details": {
                                "boundaryDecisions": "Define payment status states",
                                "invariantProtection": "Ensures valid status transitions",
                                "relationshipImpact": "Used by PaymentDetail entity"
                            },
                            "additionalConsiderations": "Supports payment lifecycle"
                        },
                        "actionName": "CreatePaymentStatusEnumeration",
                        "objectType": "Enumeration",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "enumerationId": "enum-payment-status"
                        },
                        "args": {
                            "enumerationName": "PaymentStatus",
                            "enumerationAlias": "Payment Status",
                            "propertyThoughts": {
                                "summary": "Payment lifecycle states",
                                "details": {
                                    "typeSelection": "Enumeration for payment states",
                                    "encapsulationStrategy": "Clear status definitions",
                                    "validationRules": "Valid status transitions only"
                                },
                                "additionalConsiderations": "Supports payment tracking"
                            },
                            "properties": [
                                {"name": "PENDING"},
                                {"name": "COMPLETED"},
                                {"name": "FAILED"},
                                {"name": "REFUNDED"}
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Creating MembershipLevel enumeration",
                            "details": {
                                "boundaryDecisions": "Define membership tiers",
                                "invariantProtection": "Ensures valid member levels",
                                "relationshipImpact": "Used by GuestInformation"
                            },
                            "additionalConsiderations": "Supports loyalty program"
                        },
                        "actionName": "CreateMembershipLevelEnumeration",
                        "objectType": "Enumeration",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "enumerationId": "enum-membership-level"
                        },
                        "args": {
                            "enumerationName": "MembershipLevel",
                            "enumerationAlias": "Membership Level",
                            "propertyThoughts": {
                                "summary": "Guest loyalty tiers",
                                "details": {
                                    "typeSelection": "Enumeration for membership levels",
                                    "encapsulationStrategy": "Clear level definitions",
                                    "validationRules": "Valid membership levels only"
                                },
                                "additionalConsiderations": "Supports loyalty benefits"
                            },
                            "properties": [
                                {"name": "STANDARD"},
                                {"name": "VIP"},
                                {"name": "PLATINUM"},
                                {"name": "DIAMOND"}
                            ]
                        }
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Summarized Existing EventStorming Model": JSON.stringify(this.client.input.summarizedESValue),

            "Bounded Context to Generate Actions": this.client.input.targetBoundedContext.name,

            "Functional Requirements": this.client.input.description,

            "Suggested Structure": JSON.stringify(this.client.input.draftOption),

            "Aggregate to create": JSON.stringify(this.client.input.targetAggregate),

            "Final Check": `
1. Requirements Validation:
   * Verify all functional requirements are implemented
   * Ensure business rules are properly enforced
   * Check if all user stories are supported by the model

2. Property Management:
   * Remove duplicate or redundant properties
   * Ensure proper encapsulation in value objects
   * Validate property naming conventions
   * Verify all properties have appropriate data types

3. Language and Naming:
   * Object names (classes, methods, properties): English only
   * Alias properties: ${this.preferredLanguage} only
   * Follow consistent naming patterns
   * Use domain-specific terminology

4. Structural Integrity:
   * Create all ValueObjects from proposed structure
   * Implement all Entities from proposed structure
   * Ensure proper aggregate boundaries
   * Validate relationship mappings

5. Duplication Prevention:
   * Avoid recreating existing ValueObjects
   * Prevent duplicate Entity definitions
   * Check for redundant Enumeration declarations
   * Verify unique identifier usage

6. Technical Validation:
   * Confirm appropriate data type usage
   * Validate foreign key relationships
   * Ensure proper inheritance structures
   * Check transaction boundaries

7. Documentation:
   * Verify all aliases are meaningful
   * Ensure clear property descriptions
   * Document complex relationships
   * Include business rule explanations
`,
        }
    }


    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Creating ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`

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


        let {actions: appliedActions, createdESValue: createdESValue, removedElements: removedElements} = this._getActionAppliedESValue(actions, true)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue,
            removedElements: removedElements
        }
        console.log(`[*] 스트리밍 중에 ${this.generatorName}에서 부분적 결과 파싱 완료!`, {returnObj})
    }

    onCreateModelFinished(returnObj){
        let actions = returnObj.modelValue.aiOutput.result.actions
        let {actions: appliedActions, createdESValue: createdESValue, removedElements: removedElements} = this._getActionAppliedESValue(actions, false)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue,
            removedElements: removedElements
        }
        returnObj.directMessage = `Creating ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`
    }

    _getActionAppliedESValue(actions, isAddFakeActions) {
        actions = this.client.input.esAliasTransManager.transToUUIDInActions(actions)
        this._restoreActions(actions, this.client.input.esValue, this.client.input.targetBoundedContext.name)
        actions = this._filterActions(actions)
        
        let esValueToModify = JSON.parse(JSON.stringify(this.client.input.esValue))

        // Aggregate별로 분리해서 요청시에는 이전에 생성한 Aggregate 정보를 포함시켜서 요청하기 위해서
        let removedElements = []
        if(!this.client.input.isAccumulated)
            removedElements = this._removePrevBoundedContextRelatedElements(this.client.input.targetBoundedContext.name, esValueToModify)

        // 부분적인 결과를 반환시에는 가짜 액션을 추가해서 버그를 방지하기 위해서
        if(isAddFakeActions)
            actions = ESFakeActionsUtil.addFakeActions(actions, esValueToModify)

        let createdESValue = ESActionsUtil.getActionAppliedESValue(actions, this.client.input.userInfo, this.client.input.information, esValueToModify)

        return { actions, createdESValue, removedElements }
    }

    _restoreActions(actions, esValue, targetBoundedContextName){
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)

        for(let action of actions){
            switch(action.objectType){
                case "Aggregate":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break

                case "Entity":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break

                case "ValueObject":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break

                case "Enumeration":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    break
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
        const targetAggregateName = this.client.input.targetAggregate.name.toLowerCase()
        const validAggregateIds = actions
            .filter(action => 
                action.objectType === "Aggregate" && 
                action.args.aggregateName.toLowerCase() === targetAggregateName
            )
            .map(action => action.ids.aggregateId)


        actions = actions.filter(action => 
            validAggregateIds.includes(action.ids.aggregateId)
        )

        
        return actions
    }
    
    __getAggregateByName(esValue, aggregateName){
        for(let element of Object.values(esValue.elements).filter(element => element)) {
            if(element._type === "org.uengine.modeling.model.Aggregate" && element.name === aggregateName && element.id)
                return element
        }
        return null
    }

    _removePrevBoundedContextRelatedElements(targetBoundedContextName, esValue){
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)
        const esValueToRemove = this.__getOnlyBoundedContextRelatedSummarizedESValue(esValue, targetBoundedContextName)

        let removedElements = []
        for(let element of Object.values(esValueToRemove.elements)) {
            if(element.id === targetBoundedContext.id) continue
            esValue.elements[element.id] = null
            removedElements.push(element)
        }

        for(let relation of Object.values(esValueToRemove.relations))
            esValue.relations[relation.id] = null

        return removedElements
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

    __getOnlyBoundedContextRelatedSummarizedESValue(esValue, targetBoundedContextName){
        const isHaveTargetBoundedContext = (targetBoundedContext, element) => {
            return (typeof element.boundedContext === "string" && element.boundedContext === targetBoundedContext.id) ||
                (element.boundedContext && element.boundedContext.id === targetBoundedContext.id)
        }
        const targetBoundedContext = this.__getTargetBoundedContext(esValue, targetBoundedContextName)

        let bcRelatedESValue = {
            elements: {},
            relations: {}
        }
        bcRelatedESValue.elements[targetBoundedContext.id] = targetBoundedContext

        for(let element of Object.values(esValue.elements).filter(element => element)) {
            if(isHaveTargetBoundedContext(targetBoundedContext, element))
                bcRelatedESValue.elements[element.id] = element
        }

        for(let relation of Object.values(esValue.relations).filter(relation => relation)) {
            if(relation.sourceElement && relation.targetElement) {
                if(isHaveTargetBoundedContext(targetBoundedContext, relation.sourceElement) || 
                   isHaveTargetBoundedContext(targetBoundedContext, relation.targetElement))
                    bcRelatedESValue.relations[relation.id] = relation
            }
        }

        return bcRelatedESValue
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

module.exports = CreateAggregateActionsByFunctions;