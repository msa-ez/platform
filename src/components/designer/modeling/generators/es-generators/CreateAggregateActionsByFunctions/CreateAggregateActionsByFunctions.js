
const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { ESValueSummaryGenerator } = require("..")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESActionsUtil = require("../../es-ddl-generators/modules/ESActionsUtil")
const ESFakeActionsUtil = require("../../es-ddl-generators/modules/ESFakeActionsUtil")
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class CreateAggregateActionsByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.generatorName = "CreateAggregateActionsByFunctions"
        this.checkInputParamsKeys = ["targetBoundedContext", "description", "draftOption", "esValue", "userInfo", "information", "isAccumulated"]
        this.progressCheckStrings = ["inference", "aggregateActions", "valueObjectActions", "enumerationActions"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    aggregateActions: z.array(
                        z.object({
                            actionName: z.string(),
                            objectType: z.literal("Aggregate"),
                            ids: z.object({
                                aggregateId: z.string(),
                            }).strict(),
                            args: z.object({
                                aggregateName: z.string(),
                                aggregateAlias: z.string(),
                                properties: z.array(
                                    z.object({
                                        name: z.string(),
                                        type: z.string(),
                                        isKey: z.boolean(),
                                    }).strict()
                                ),
                            }).strict(),
                        }).strict()
                    ),
                    valueObjectActions: z.array(
                        z.object({
                            actionName: z.string(),
                            objectType: z.literal("ValueObject"),
                            ids: z.object({
                                aggregateId: z.string(),
                                valueObjectId: z.string(),
                            }).strict(),
                            args: z.object({
                                valueObjectName: z.string(),
                                valueObjectAlias: z.string(),
                                properties: z.array(
                                    z.object({
                                        name: z.string(),
                                        type: z.string(),
                                        isKey: z.boolean(),
                                        isForeignProperty: z.boolean(),
                                    }).strict()
                                ),
                            }).strict(),
                        }).strict()
                    ),
                    enumerationActions: z.array(
                        z.object({
                            actionName: z.string(),
                            objectType: z.literal("Enumeration"),
                            ids: z.object({
                                aggregateId: z.string(),
                                enumerationId: z.string(),
                            }).strict(),
                            args: z.object({
                                enumerationName: z.string(),
                                enumerationAlias: z.string(),
                                properties: z.array(
                                    z.object({
                                        name: z.string(),
                                    }).strict()
                                ),
                            }).strict(),
                        }).strict()
                    ),
                }).strict()
            }).strict(),
            "instruction"
        )
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
                console.warn(`[!] An error occurred during aggregate creation, please try again.\n* Error log \n${returnObj.errorMessage}`)

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
        inputParams.esValue = structuredClone(inputParams.esValue)
        inputParams.draftOption = this._removeClassIdProperties(structuredClone(inputParams.draftOption))

        inputParams.targetAggregate = Object.values(inputParams.draftOption)[0].aggregate
        inputParams.aggregateDisplayName = inputParams.targetAggregate.alias ? inputParams.targetAggregate.alias : inputParams.targetAggregate.name
        inputParams.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)

        let targetBCRemovedESValue = structuredClone(inputParams.esValue)
        if(!inputParams.isAccumulated)
            this._removePrevBoundedContextRelatedElements(inputParams.targetBoundedContext.name, targetBCRemovedESValue)
        
        inputParams.summarizedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(targetBCRemovedESValue, 
            ESValueSummarizeWithFilter.KEY_FILTER_TEMPLATES.aggregateOuterStickers, inputParams.esAliasTransManager)

        inputParams.subjectText = `Creating ${inputParams.aggregateDisplayName} Aggregate`
        if(!(await this.isCreatedPromptWithinTokenLimit())) {
            const leftTokenCount = await this.getCreatePromptLeftTokenCount({summarizedESValue: {}})
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
                this.modelInfo.requestModelName,
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
        const hasEnumerations = (aggregateStructure.enumerations) ? aggregateStructure.enumerations.length > 0 : false
        
        return `Task: Creating ${aggregateName} Aggregate in ${boundedContextName} Bounded Context
        
Business Context:
${description}

Aggregate Structure:
- Creating new aggregate '${aggregateName}'${inputParams.targetAggregate.alias ? ` (${inputParams.targetAggregate.alias})` : ''}
- Will contain ${hasValueObjects ? 'value objects' : ''}${hasValueObjects && hasEnumerations ? ' and ' : ''}${hasEnumerations ? 'enumerations' : ''}
- Part of ${boundedContextName} domain

Focus:
- Elements directly related to ${aggregateName} aggregate
- Supporting elements within ${boundedContextName} bounded context
- Essential domain relationships and dependencies`
    }


    __buildAgentRolePrompt(){
        return `You are a seasoned Domain-Driven Design (DDD) architect and strategist with over 15 years of experience implementing complex enterprise systems across various industries. Your expertise encompasses:

1. Strategically translating intricate business domains into precisely bounded, cohesive domain models that align with organizational contexts and business capabilities.
2. Designing resilient and adaptable aggregate structures that appropriately encapsulate business invariants and enforce transactional consistency boundaries.
3. Orchestrating sophisticated event-driven architectures with comprehensive event sourcing patterns to capture complete domain state transitions and history.
4. Crafting immutable value objects and expressive enumerations that accurately represent domain concepts while maintaining semantic integrity.

Core Competencies:
- Identifying ubiquitous language patterns and implementing them consistently across domain models and technical implementations
- Applying tactical DDD patterns (aggregates, entities, value objects, repositories, domain services) with precision to solve complex domain problems
- Recognizing and implementing appropriate bounded context integration patterns (shared kernel, customer-supplier, conformist, anti-corruption layer)
- Balancing technical constraints with business needs to design pragmatic domain models that scale effectively

Technical Implementation Focus:
- Enforcing strict aggregate boundaries to maintain data consistency and transaction isolation
- Designing event streams that accurately represent the complete history of domain state changes
- Leveraging value objects to encapsulate related attributes and associated validation rules
- Strategically using enumerations to model discrete states, categories, and classification schemes

You excel at navigating complex domain spaces, identifying core domain elements, and designing elegant, maintainable models that evolve gracefully with changing business requirements.`
    }

    __buildTaskGuidelinesPrompt(){
        return `In your current event storming model, you need to write actions to add elements inside a particular Bounded Context following the structure provided by the user.

Please adhere to the following guidelines:

Data Type Rules:
1. For Aggregate properties, use:
   - Basic Java types: String, Long, Integer, Double, Boolean, Date
   - Custom types must be defined as either Enumeration or ValueObject.
2. For collections, use the 'List<ClassName>' syntax (e.g., List<String>).

Type Reference and Enumeration Rules:
3. When to use Enumerations:
   - When a property represents a fixed set of values or categories.
   - When the property value must be one of a predefined list.
   - When the property name ends with words such as Type, Status, Category, Level, Phase, or Stage.
   - Specifically, when storing state or status information, an Enumeration must be used.
   Example cases:
     • category → BookCategory (Enumeration)
     • status → OrderStatus (Enumeration)
     • type → ProductType (Enumeration)
     • level → MembershipLevel (Enumeration)
     • paymentMethod → PaymentMethod (Enumeration)

4. When to use ValueObjects:
   - When a group of related properties forms a meaningful concept and immutability is required.
   - **All ValueObjects must be directly associated with their Aggregate.** Do not define ValueObjects that are nested within or used by other ValueObjects.
   - Unless there is a special case, avoid creating meaningless ValueObjects. Instead, incorporate such properties directly within the Aggregate.
   - Refrain from creating an excessive number of ValueObjects.
   Example cases:
     • address → Address (street, city, zipCode)
     • period → DateRange (startDate, endDate)
     • money → Money (amount, currency)
     • contact → ContactInfo (phone, email, address)

Naming and Language Conventions:
5. Object names (classes, properties, methods) must be in English.
6. Supporting content (aliases, descriptions) must adhere to the preferred language setting.

Structural Rules:
7. Aggregates:
   - Must have exactly one primary key attribute.
   - For composite keys, create a ValueObject and use it as the primary key.
   - Reference other Aggregates using their class names rather than IDs.
   - Avoid creating separate transaction objects when the main Aggregate can manage its lifecycle. Do not duplicate properties by creating Transaction ValueObjects if they overlap with the main Aggregate.
   - Use the Aggregate root to manage state transitions and history. Consider Event Sourcing for tracking historical changes if needed.

8. ValueObjects:
   - Must be directly linked to an Aggregate; avoid defining ValueObjects that are internally nested or that represent subordinate structures.
   - Should encapsulate multiple, related properties and be immutable.
   - Prevent the creation of trivial or redundant ValueObjects by including properties directly in the Aggregate unless a special case dictates otherwise.
   - Do not generate an excessive number of ValueObjects.

Creation Guidelines:
9. Create only:
   - Aggregates listed under 'Aggregate to create'.
   - All ValueObjects from the provided structure that have a direct association with the Aggregate.
   - Enumerations for any property requiring a fixed set of values.
   - All supporting types needed for the properties.

10. Property Type Selection:
    - Opt for specific types over generic ones.
    - Example mappings:
      • startDate → Date
      • currentCapacity → Integer
      • price → Double
      • category → Enumeration
      • status → Enumeration

Type Dependency Resolution:
11. Before finalizing your result:
    - Validate all property types.
    - Create Enumerations for properties representing classifications, statuses, or types.
    - Ensure that all custom types are clearly defined.
    - Verify the appropriate usage of ValueObjects versus Enumerations.

Constraints:
12. Rules:
    - Only reference existing Aggregates without altering them.
    - Do not recreate types that already exist in the system.
    - Avoid including comments in the output JSON object.
    - Prevent duplicate elements in the model.
    - Do not use ValueObjects for properties that should be defined as Enumerations.
    - Refrain from appending type names (e.g., 'Enumeration' or 'ValueObject') to object names; use base names only (e.g., 'BookStatus' rather than 'BookStatusEnumeration').
    - Ensure names are unique across both new and existing elements, with no duplicates.

13. Required Elements:
    - Every ValueObject and Enumeration must be directly associated with an Aggregate.
    - Every generated ValueObject and Enumeration must be included as a named attribute in at least one Aggregate.
    - Implement all elements specified in the user's structure.
    - Accurately map all relationships.
    - Provide corresponding definitions for all custom types.
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The reasoning should directly inform the output result with specific design decisions rather than generic strategies.
2. Begin by thoroughly understanding the task requirements and the overall domain context.
3. Evaluate key design aspects, including domain alignment, adherence to Domain-Driven Design (DDD) principles, and technical feasibility.
4. Analyze the relationships and dependencies between Aggregates, ValueObjects, and Enumerations precisely.
5. Ensure that all design decisions comply with DDD best practices.
6. When properties represent state or status information, enforce the use of Enumerations to clearly define valid values.
7. Verify that every ValueObject and Enumeration is directly associated with an Aggregate; avoid nested or subordinate ValueObject definitions.
8. Avoid creating unnecessary or excessive ValueObjects; integrate properties directly into the Aggregate unless a distinct ValueObject offers significant encapsulation.
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
        // aggregateId can be used when defining Enumeration, ValueObject that belong to an Aggregate.
        "aggregateActions": [
            {
                // Write the ActionName that you utilized in the previous steps
                "actionName": "<actionName>",
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
        ],

        // ValueObjects are immutable objects defined by their attributes rather than their identity.
        // They are used to group related attributes that should be treated as a single unit.
        "valueObjectActions": [
            {
                "actionName": "<actionName>",
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
        ],

        // If the type of property you want to add to the aggregate does not have an appropriate default Java type, you can create a new type as an enumeration.
        "enumerationActions": [
            {
                "actionName": "<actionName>",
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
                        "id": "bc-order",
                        "name": "orderservice",
                        "actors": [
                            { "id": "act-customer", "name": "Customer" },
                            { "id": "act-admin", "name": "Admin" }
                        ],
                        "aggregates": [
                            {
                                "id": "agg-product",
                                "name": "Product",
                                "properties": [
                                    { "name": "productId", "type": "Long", "isKey": true },
                                    { "name": "name" },
                                    { "name": "price", "type": "Double" },
                                    { "name": "category", "type": "ProductCategory" },
                                    { "name": "stock", "type": "Integer" }
                                ],
                                "entities": [],
                                "enumerations": [
                                    {
                                        "id": "enum-product-category",
                                        "name": "ProductCategory",
                                        "items": ["ELECTRONICS", "FURNITURE", "CLOTHING", "FOOD"]
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "id": "vo-product-dimensions",
                                        "name": "ProductDimensions",
                                        "properties": [
                                            { "name": "length", "type": "Double" },
                                            { "name": "width", "type": "Double" },
                                            { "name": "height", "type": "Double" }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "Bounded Context to Generate Actions": "orderservice",
            "Functional Requirements": {
                "userStories": [
                    {
                        "title": "Place New Order",
                        "description": "As a customer, I want to place a new order with my selected products to complete my purchase.",
                        "acceptance": [
                            "All selected products must be available in stock.",
                            "Customer information must be valid.",
                            "Payment should be processed successfully."
                        ]
                    },
                    {
                        "title": "View Order History",
                        "description": "As a customer, I want to view my past orders and their statuses.",
                        "acceptance": [
                            "Orders must be sorted by order date.",
                            "Order details are displayed correctly.",
                            "Filtering by order status is available."
                        ]
                    }
                ],
                "entities": {
                    "Customer": {
                        "properties": [
                            { "name": "customerId", "type": "Long", "required": true, "isPrimaryKey": true },
                            { "name": "name", "type": "String", "required": true },
                            { "name": "email", "type": "String", "required": true }
                        ]
                    },
                    "Order": {
                        "properties": [
                            { "name": "orderId", "type": "Long", "required": true, "isPrimaryKey": true },
                            { "name": "customerId", "type": "Long", "required": true, "isForeignKey": true, "foreignEntity": "Customer" },
                            { "name": "orderDate", "type": "Date", "required": true },
                            { "name": "totalAmount", "type": "Integer", "required": true }
                        ]
                    }
                },
                "businessRules": [
                    { "name": "ValidOrderTotal", "description": "Order total must be a positive value." },
                    { "name": "CustomerExists", "description": "Order must be associated with an existing customer." }
                ],
                "interfaces": {
                    "NewOrder": {
                        "sections": [
                            {
                                "name": "OrderDetails",
                                "type": "form",
                                "fields": [
                                    { "name": "customerId", "type": "text", "required": true },
                                    { "name": "orderDate", "type": "date", "required": true },
                                    { "name": "totalAmount", "type": "number", "required": true }
                                ]
                            },
                            {
                                "name": "ProductSelection",
                                "type": "table",
                                "filters": [ "category", "priceRange" ],
                                "resultTable": {
                                    "columns": [ "productId", "name", "price", "stock" ],
                                    "actions": [ "select", "viewDetails" ]
                                }
                            }
                        ]
                    },
                    "OrderHistory": {
                        "sections": [
                            {
                                "name": "PastOrders",
                                "type": "table",
                                "filters": [ "dateRange", "status" ],
                                "resultTable": {
                                    "columns": [ "orderId", "orderDate", "totalAmount", "status" ],
                                    "actions": [ "viewDetails", "reorder" ]
                                }
                            }
                        ]
                    }
                }
            },
            "Suggested Structure": [
                {
                    "aggregate": {
                        "name": "Order",
                        "alias": "Customer Order"
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
                            "alias": "Shipping Address"
                        },
                        {
                            "name": "PaymentDetail",
                            "alias": "Payment Detail"
                        }
                    ]
                }
            ],
            "Aggregate to create": {
                "name": "Order",
                "alias": "Customer Order"
            }
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": "The Customer Order aggregate has been created successfully. OrderStatus enumeration defines the order states, while ShippingAddress and PaymentDetail value objects encapsulate address and payment information respectively.",
            "result": {
                "aggregateActions": [
                    {
                        "actionName": "CreateOrderAggregate",
                        "objectType": "Aggregate",
                        "ids": {
                            "aggregateId": "agg-order"
                        },
                        "args": {
                            "aggregateName": "Order",
                            "aggregateAlias": "Customer Order",
                            "properties": [
                                { "name": "orderId", "type": "Long", "isKey": true },
                                { "name": "customerId", "type": "Long" },
                                { "name": "orderDate", "type": "Date" },
                                { "name": "totalAmount", "type": "Integer" },
                                { "name": "shippingAddress", "type": "ShippingAddress" },
                                { "name": "paymentDetail", "type": "PaymentDetail" },
                                { "name": "status", "type": "OrderStatus" }
                            ]
                        }
                    }
                ],
                "valueObjectActions": [
                    {
                        "actionName": "CreateShippingAddressVO",
                        "objectType": "ValueObject",
                        "ids": {
                            "aggregateId": "agg-order",
                            "valueObjectId": "vo-shipping-address"
                        },
                        "args": {
                            "valueObjectName": "ShippingAddress",
                            "valueObjectAlias": "Shipping Address",
                            "properties": [
                                { "name": "street" },
                                { "name": "city" },
                                { "name": "state" },
                                { "name": "zipCode" }
                            ]
                        }
                    },
                    {
                        "actionName": "CreatePaymentDetailVO",
                        "objectType": "ValueObject",
                        "ids": {
                            "aggregateId": "agg-order",
                            "valueObjectId": "vo-payment-detail"
                        },
                        "args": {
                            "valueObjectName": "PaymentDetail",
                            "valueObjectAlias": "Payment Detail",
                            "properties": [
                                { "name": "cardNumber" },
                                { "name": "cardHolder" },
                                { "name": "expirationDate", "type": "Date" },
                                { "name": "securityCode" }
                            ]
                        }
                    }
                ],
                "enumerationActions": [
                    {
                        "actionName": "CreateOrderStatusEnum",
                        "objectType": "Enumeration",
                        "ids": {
                            "aggregateId": "agg-order",
                            "enumerationId": "enum-order-status"
                        },
                        "args": {
                            "enumerationName": "OrderStatus",
                            "enumerationAlias": "Order Status",
                            "properties": [
                                { "name": "PENDING" },
                                { "name": "CONFIRMED" },
                                { "name": "SHIPPED" },
                                { "name": "DELIVERED" },
                                { "name": "CANCELLED" }
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
1. Language and Naming:
   * Object names (classes, methods, properties): English only
   * Alias properties: ${this.preferredLanguage} only
   * Follow consistent naming patterns
   * Use domain-specific terminology
`,
        }
    }


    onThink(returnObj, thinkText){
        returnObj.directMessage = `Creating ${this.client.input.aggregateDisplayName} Aggregate... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onModelCreatedWithThinking(returnObj){
        returnObj.directMessage = `Creating ${this.client.input.aggregateDisplayName} Aggregate... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
        if(!returnObj.modelValue.aiOutput.result) return
        
        let actions = [
            ...(returnObj.modelValue.aiOutput.result.aggregateActions || []),
            ...(returnObj.modelValue.aiOutput.result.valueObjectActions || []),
            ...(returnObj.modelValue.aiOutput.result.enumerationActions || [])
        ]
        if(actions.length === 0) return
        console.log("[*] 파싱된 액션 목록: ", {actions: structuredClone(actions)})

        let {actions: appliedActions, createdESValue: createdESValue, removedElements: removedElements} = this._getActionAppliedESValue(actions, !returnObj.isFinished)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue,
            removedElements: removedElements
        }
    }

    _getActionAppliedESValue(actions, isAddFakeActions) {
        actions = this._filterValidPropertyActions(actions)
        actions = this.client.input.esAliasTransManager.transToUUIDInActions(actions)

        this._restoreActions(actions, this.client.input.esValue, this.client.input.targetBoundedContext.name)
        actions = this._filterValidAggregateIDActions(actions)
        
        // 부분적인 결과를 반환시에는 가짜 액션을 추가해서 버그를 방지하기 위해서
        let esValueToModify = JSON.parse(JSON.stringify(this.client.input.esValue))
        if(isAddFakeActions)
            actions = ESFakeActionsUtil.addFakeActions(actions, esValueToModify)
        actions = ESActionsUtil.addDefaultProperties(actions)

        // Aggregate별로 분리해서 요청시에는 이전에 생성한 Aggregate 정보를 포함시켜서 요청하기 위해서
        let removedElements = []
        if(!this.client.input.isAccumulated)
            removedElements = this._removePrevBoundedContextRelatedElements(this.client.input.targetBoundedContext.name, esValueToModify)

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

    _filterValidPropertyActions(actions){
        actions = actions.filter(action => action.actionName && action.objectType && action.ids && action.ids.aggregateId)
        actions = actions.filter(action => 
            (action.objectType === "Aggregate") ||
            (action.objectType === "ValueObject" && action.ids && action.ids.valueObjectId) ||
            (action.objectType === "Enumeration" && action.ids && action.ids.enumerationId)
        )
        
        for(let action of actions){
            if(action.args && action.args.properties){
                action.args.properties = action.args.properties.filter(property => property.name)
            }
        }

        return actions
    }

    _filterValidAggregateIDActions(actions){
        const targetAggregateName = this.client.input.targetAggregate.name.toLowerCase()
        const validAggregateIds = actions
            .filter(action => 
                action.objectType === "Aggregate" && 
                action.args &&
                action.args.aggregateName &&
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