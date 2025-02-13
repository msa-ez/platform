const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { ESValueSummaryGenerator } = require("..")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { ESValueSummarizeWithFilter } = require("../helpers")

class CommandGWTGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "targetCommandIds", "description", "esValue"]
        this.progressCheckStrings = ["inference", "targetCommandId"]
    }

    /**
     * @description 이벤트 스토밍 모델에서 Command들의 GWT(Given-When-Then) 시나리오를 생성하기 위한 generator를 생성합니다.
     * 생성된 generator는 각각의 Aggregate에 대해 순차적으로 GWT를 생성하며, 생성 과정의 각 단계에서 콜백을 통해 진행 상황을 전달합니다.
     * 
     * @example 실제 이벤트 스토밍 모델 업데이트 예시
     * const esValue = mocks.getEsValue("libraryService")
     * const generator = CommandGWTGeneratorByFunctions.createGeneratorByDraftOptions({
     *     onGenerationSucceeded: (returnObj) => {
     *         if(returnObj.modelValue && returnObj.modelValue.commandsToReplace) {
     *             // 생성된 GWT를 이벤트 스토밍 모델에 적용
     *             for(const command of returnObj.modelValue.commandsToReplace)
     *                 esValue.elements[command.id] = command
     *         }
     *     },
     *     onGenerationDone: () => {
     *         console.log("이벤트 스토밍 모델 업데이트 완료")
     *     }
     * })
     * 
     * // generator 초기화 및 실행
     * generator.initInputs(
     *      mocks.getEsDraft("libraryService"),
     *      esValue
     * )
     * generator.generateIfInputsExist()
     *
     * @note
     * - callbacks.onFirstResponse: 첫 번째 응답이 도착했을 때 호출됩니다.
     * - callbacks.onModelCreated: 모델이 생성되었을 때 호출됩니다.
     * - callbacks.onGenerationSucceeded: GWT 생성이 성공했을 때 호출됩니다.
     *   returnObj.modelValue.commandsToReplace를 통해 업데이트된 Command 정보를 얻을 수 있습니다.
     * - callbacks.onRetry: 오류가 발생하여 재시도가 필요할 때 호출됩니다.
     * - callbacks.onStopped: 생성이 중지되었을 때 호출됩니다.
     * - callbacks.onGenerationDone: 모든 GWT 생성이 완료되었을 때 호출됩니다.
     * - generator.initInputs()를 통해 초기 입력값을 설정한 후 generateIfInputsExist()를 호출하여 생성을 시작합니다.
     * - 각 Aggregate마다 순차적으로 GWT가 생성되므로, 대량의 데이터 처리 시 성능을 고려해야 합니다.
     */
    static createGeneratorByDraftOptions(callbacks){
        const generator = new CommandGWTGeneratorByFunctions({
            input: null,

            onSend: (input, stopCallback) => {
                if(callbacks.onSend)
                    callbacks.onSend(input, stopCallback)
            },

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
                alert(`[!] An error occurred during creating GWT for commands, please try again.\n* Error log \n${returnObj.errorMessage}`)

                if(callbacks.onRetry)
                    callbacks.onRetry(returnObj)
            },

            onStopped: () => {
                if(callbacks.onStopped)
                    callbacks.onStopped()
            }
        })

        generator.initInputs = (draftOptions, esValue) => {
            let inputs = []
            for(const eachDraftOption of Object.values(draftOptions)) {
                const targetAggregates = Object.values(esValue.elements).filter(element => element && element._type === "org.uengine.modeling.model.Aggregate" && element.boundedContext.id === eachDraftOption.boundedContext.id)

                // Aggregate각각마다 존재하는 커맨드에 GWT를 생성하는 요청을 함으로써 다루는 문제영역을 최소화함
                for(const targetAggregate of targetAggregates) {
                    const targetCommandIds = Object.values(esValue.elements)
                    .filter(element => element && element._type === "org.uengine.modeling.model.Command" && element.aggregate.id === targetAggregate.id)
                    .map(command => command.id)
                    if(!targetCommandIds || targetCommandIds.length === 0) continue

                    inputs.push({
                        targetBoundedContext: eachDraftOption.boundedContext,
                        targetCommandIds: targetCommandIds,
                        description: eachDraftOption.description,
                        esValue: esValue
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


    async onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        inputParams.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
        inputParams.targetCommandAliases = inputParams.targetCommandIds.map(
            commandId => inputParams.esAliasTransManager.UUIDToAliasDic[commandId])
        
        inputParams.targetAggregateNames = inputParams.targetCommandIds.map(commandId => {
            const commandAggregateId = inputParams.esValue.elements[commandId].aggregate.id
            const targetAggregate = inputParams.esValue.elements[commandAggregateId]
            return targetAggregate.displayName ? targetAggregate.displayName : targetAggregate.name
        })
        inputParams.targetAggregateNames = Array.from(new Set(inputParams.targetAggregateNames))

        inputParams.summarizedESValue = {
            "deletedProperties": [],
            "boundedContexts": [
                ESValueSummarizeWithFilter.getSummarizedBoundedContextValue(
                    inputParams.esValue,
                    inputParams.targetBoundedContext,
                    [],
                    inputParams.esAliasTransManager
                )
            ]
        }
        inputParams.subjectText = `Creating GWTs for ${inputParams.targetAggregateNames.join(", ")} Aggregates`
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
        return `Focus on generating Given-When-Then (GWT) test scenarios for commands in the following context:

        Bounded Context: ${inputParams.targetBoundedContext.name}
        Target Commands: ${inputParams.targetCommandAliases.join(", ")}
        
        Business Requirements:
        ${inputParams.description}
        
        Please prioritize elements that are:
        1. Directly related to the target commands and their associated events
        2. Part of the same aggregate as the target commands
        3. Referenced by the target commands or their events
        4. Related to the business requirements provided
        5. Part of the specified bounded context
        
        This context is specifically for generating comprehensive GWT scenarios that validate the behavior and business rules of the target commands.`
    }


    __buildAgentRolePrompt(){
        return `You are an expert in Domain-Driven Design (DDD) and test engineering, specializing in:
- Writing precise Given-When-Then scenarios for event-driven systems
- Converting business rules into testable acceptance criteria
- Validating command-event flows in bounded contexts
- Ensuring test coverage for aggregate state transitions
- Maintaining consistency between commands, events, and aggregate states
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You need to extract the right GWT (Given, When, Then) cases from the user's requirements and add them to the right commands in the given bounded context.

Please follow these rules:
1. Requirements Analysis:
   - Extract all relevant GWT scenarios from the provided requirements
   - Each GWT must be directly related to the specified command IDs
   - Ensure full coverage of acceptance criteria and business rules

2. GWT Structure:
   - Given: Must reference valid Aggregate state with realistic property values
   - When: Must match Command properties exactly as defined in the schema
   - Then: Must include all mandatory Event properties with expected outcomes

3. Quality Guidelines:
   - Generate unique, non-duplicated GWT scenarios
   - Each scenario should test a specific aspect or business rule
   - Include both positive and negative test scenarios
   - Ensure property values are realistic and type-compatible

4. Property Mapping:
   - Given: Use only properties defined in the Aggregate
   - When: Include all required Command parameters
   - Then: Map to all relevant Event properties
   - Use "N/A" only for truly unrelated properties

5. Validation Rules:
   - Verify all business constraints are covered
   - Include boundary conditions and edge cases
   - Consider state transitions and their validity
   - Check for proper error scenarios

6. Output Format:
   - Provide clean JSON without comments
   - Use consistent property naming
   - Ensure all required fields are populated
   - Maintain proper value types for each property
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The process of reasoning should be directly related to the output result, not a reference to a general strategy.
2. Context Assessment: Evaluate the provided business requirements, domain context, and target command details to determine the core testing scenarios.
3. Validation & Mapping: Ensure that the inferred GWT scenarios accurately map Aggregates, Commands, and Events based on the business rules and domain constraints.
4. Synthesis & Decision Making: Integrate domain expertise to synthesize concise and precise GWT scenarios from the analyzed inputs, while considering edge cases, error handling, and consistency.
`;
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeWithFilter.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
   "inference": "<inference>",
   "result": [
        {
            "targetCommandId": "<targetCommandId>",
            "gwts": [
                {
                    "given": {
                        "name": "<givenName>", // You can write the name of Aggregate
                        "values": {
                            // There are three types of attribute values you can write.
                            // 1. Write an actual possible value(You can write String, Number, Boolean, Array, Object, etc.)
                            // 2. If the current value is empty, write null.
                            // 3. If the attribute seems unrelated to this GWT, write "N/A".
                            "<attributeName>": <attributeValue|null|"N/A">
                        }
                    },

                    "when": {
                        "name": "<whenName>", // You can write the name of Command
                        "values": {
                            "<attributeName>": <attributeValue|null|"N/A">
                        }
                    },

                    "then": {
                        "name": "<thenName>", // You can write the name of Event
                        "values": {
                            "<attributeName>": <attributeValue|null|"N/A">
                        }
                    }
                }
            ]
        }
    ]
}`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Current Bounded Context": {
                "deletedProperties": [],
                "boundedContexts": [
                    {
                        "id": "bc-inventory",
                        "name": "inventory",
                        "aggregates": [
                            {
                                "id": "agg-product",
                                "name": "Product",
                                "properties": [
                                    {
                                        "name": "productId",
                                        "type": "String",
                                        "isKey": true
                                    },
                                    {
                                        "name": "name",
                                        "type": "String"
                                    },
                                    {
                                        "name": "quantity",
                                        "type": "Integer"
                                    },
                                    {
                                        "name": "status",
                                        "type": "ProductStatus"
                                    },
                                    {
                                        "name": "category",
                                        "type": "Category"
                                    }
                                ],
                                "entities": [
                                    {
                                        "id": "ent-category",
                                        "name": "Category",
                                        "properties": [
                                            {
                                                "name": "categoryId",
                                                "type": "String"
                                            },
                                            {
                                                "name": "name",
                                                "type": "String"
                                            },
                                            {
                                                "name": "description",
                                                "type": "String"
                                            }
                                        ]
                                    }
                                ],
                                "enumerations": [
                                    {
                                        "id": "enum-productStatus",
                                        "name": "ProductStatus",
                                        "items": [
                                            "AVAILABLE",
                                            "OUT_OF_STOCK",
                                            "DISCONTINUED"
                                        ]
                                    }
                                ],
                                "commands": [
                                    {
                                        "id": "cmd-addStock",
                                        "name": "AddStock",
                                        "api_verb": "PATCH",
                                        "isRestRepository": true,
                                        "outputEvents": [
                                            {
                                                "id": "evt-stockAdded",
                                                "name": "StockAdded"
                                            }
                                        ],
                                        "properties": [
                                            {
                                                "name": "productId",
                                                "type": "String"
                                            },
                                            {
                                                "name": "quantity",
                                                "type": "Integer"
                                            }
                                        ]
                                    },
                                    {
                                        "id": "cmd-discontinueProduct",
                                        "name": "DiscontinueProduct",
                                        "api_verb": "PATCH",
                                        "isRestRepository": true,
                                        "outputEvents": [
                                            {
                                                "id": "evt-productDiscontinued",
                                                "name": "ProductDiscontinued"
                                            }
                                        ],
                                        "properties": [
                                            {
                                                "name": "productId",
                                                "type": "String"
                                            },
                                            {
                                                "name": "reason",
                                                "type": "String"
                                            }
                                        ]
                                    }
                                ],
                                "events": [
                                    {
                                        "id": "evt-stockAdded",
                                        "name": "StockAdded",
                                        "properties": [
                                            {
                                                "name": "productId",
                                                "type": "String"
                                            },
                                            {
                                                "name": "quantity",
                                                "type": "Integer"
                                            },
                                            {
                                                "name": "newTotalQuantity",
                                                "type": "Integer"
                                            }
                                        ]
                                    },
                                    {
                                        "id": "evt-productDiscontinued",
                                        "name": "ProductDiscontinued",
                                        "properties": [
                                            {
                                                "name": "productId",
                                                "type": "String"
                                            },
                                            {
                                                "name": "reason",
                                                "type": "String"
                                            },
                                            {
                                                "name": "discontinuedDate",
                                                "type": "Date"
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
                        "title": "Add Stock to Product",
                        "description": "As an inventory manager, I want to add stock to existing products so that we can maintain accurate inventory levels",
                        "acceptance": [
                            "Stock quantity must be a positive number",
                            "Product must exist in the system",
                            "System should update total quantity after addition",
                            "Stock addition should be logged for audit"
                        ]
                    },
                    {
                        "title": "Discontinue Product",
                        "description": "As a product manager, I want to discontinue products that are no longer sold so that they are not available for future orders",
                        "acceptance": [
                            "Must provide reason for discontinuation",
                            "Product status should be updated to DISCONTINUED",
                            "Discontinuation date should be recorded",
                            "Cannot discontinue already discontinued products"
                        ]
                    }
                ],
                "businessRules": [
                    {
                        "name": "StockQuantityValidation",
                        "description": "Stock quantity must be greater than zero"
                    },
                    {
                        "name": "DiscontinuationReason",
                        "description": "Reason for discontinuation is mandatory and must be descriptive"
                    }
                ]
            },
            
            "Target Command Ids": "cmd-addStock, cmd-discontinueProduct"
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": `The generated output scenarios are based on a detailed analysis of the provided aggregate, command, and event definitions within the current bounded context. For 'cmd-addStock', the inference emphasizes that the 'Product' aggregate starts with specific attributes (e.g., productId, name, initial quantity, and status) and reflects a successful stock update when the 'AddStock' command is executed, resulting in a 'StockAdded' event with an updated total quantity. For 'cmd-discontinueProduct', the scenario verifies that an appropriate state transition occurs by incorporating a valid discontinuation reason and recording a discontinuation date in the 'ProductDiscontinued' event. This systematic approach ensures that each command's GWT scenario correctly captures both the intended business logic and the underlying domain constraints, providing robust and comprehensive test coverage.`,
            "result": [
                {
                    "targetCommandId": "cmd-addStock",
                    "gwts": [
                        {
                            "given": {
                                "name": "Product",
                                "values": {
                                    "productId": "PROD-001",
                                    "name": "Sample Product",
                                    "quantity": 100,
                                    "status": "AVAILABLE"
                                }
                            },
                            "when": {
                                "name": "AddStock",
                                "values": {
                                    "productId": "PROD-001",
                                    "quantity": 50
                                }
                            },
                            "then": {
                                "name": "StockAdded",
                                "values": {
                                    "productId": "PROD-001",
                                    "quantity": 50,
                                    "newTotalQuantity": 150
                                }
                            }
                        }
                    ]
                },
                {
                    "targetCommandId": "cmd-discontinueProduct",
                    "gwts": [
                        {
                            "given": {
                                "name": "Product",
                                "values": {
                                    "productId": "PROD-001",
                                    "name": "Sample Product",
                                    "status": "AVAILABLE"
                                }
                            },
                            "when": {
                                "name": "DiscontinueProduct",
                                "values": {
                                    "productId": "PROD-001",
                                    "reason": "Product replaced by newer model"
                                }
                            },
                            "then": {
                                "name": "ProductDiscontinued",
                                "values": {
                                    "productId": "PROD-001",
                                    "reason": "Product replaced by newer model",
                                    "discontinuedDate": "2024-03-20T00:00:00Z"
                                }
                            }
                        }
                    ]
                }
            ]
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Current Bounded Context": JSON.stringify(this.client.input.summarizedESValue),

            "Functional Requirements": this.client.input.description,

            "Target Command Ids": this.client.input.targetCommandAliases.join(", "),

            "Final Check List": `
* Make sure each command has an appropriate GWT from the user's requirements.
* Make sure your scenarios reflect the best use of GWT in your code generation.
* The generated GWT must have the properties found in the Aggregate, Command, and Event presented.
`
        }
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Creating GWTs for ${this.client.input.targetAggregateNames.join(", ")} Aggregates... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        const result = returnObj.modelValue.aiOutput.result
        if(this.client.input.targetCommandAliases.length !== result.length)
            throw new Error("The number of target command IDs and the number of GWT scenarios do not match.")

        let commandsToReplace = []
        for(const scenario of Object.values(result)){
            const targetCommandUUID = this.client.input.esAliasTransManager.aliasToUUIDDic[scenario.targetCommandId]
            if(!targetCommandUUID) continue
            
            let targetCommand = this.client.input.esValue.elements[targetCommandUUID]
            if(!targetCommand) continue
            targetCommand = JSON.parse(JSON.stringify(targetCommand))

            if(!scenario.gwts || scenario.gwts.length === 0) continue
            targetCommand.examples = this._getExamples(scenario.gwts)
            commandsToReplace.push(targetCommand)
        }
        returnObj.modelValue.commandsToReplace = commandsToReplace
        console.log("[*] commandsToReplace", JSON.parse(JSON.stringify(commandsToReplace)))


        returnObj.directMessage = `Creating GWTs for ${this.client.input.targetAggregateNames.join(", ")} Aggregates... (${returnObj.modelRawValue.length} characters generated)`
    }

    _getExamples(gwts){
        let examples = []
        for(const gwt of gwts){
            if(!gwt.given || !gwt.when || !gwt.then) continue

            const givenElement = this.__findElementByName(gwt.given.name)
            const whenElement = this.__findElementByName(gwt.when.name)
            const thenElement = this.__findElementByName(gwt.then.name)
            if(!givenElement || !whenElement || !thenElement) continue
            if(!givenElement._type.includes("Aggregate") || !whenElement._type.includes("Command") || !thenElement._type.includes("Event")) continue

            examples.push({
                "given": [{
                    "type": "Aggregate",
                    "name": gwt.given.name,
                    "value": this.__getValuesUsingFieldDescriptors(gwt.given.values, givenElement.aggregateRoot.fieldDescriptors)
                }],

                "when": [{
                    "type": "Command",
                    "name": gwt.when.name,
                    "value": this.__getValuesUsingFieldDescriptors(gwt.when.values, whenElement.fieldDescriptors)
                }],

                "then": [{
                    "type": "Event",
                    "name": gwt.then.name,
                    "value": this.__getValuesUsingFieldDescriptors(gwt.then.values, thenElement.fieldDescriptors)
                }]
            })
        }
        return examples
    }

    __findElementByName(name) {
        return Object.values(this.client.input.esValue.elements).filter(element => element).find(element => element.name === name)
    }

    __getValuesUsingFieldDescriptors(values, fieldDescriptors) {
        let returnValues = {}
        for(const fieldDescriptor of fieldDescriptors)
            returnValues[fieldDescriptor.name] = (values.hasOwnProperty(fieldDescriptor.name) ? values[fieldDescriptor.name] : "N/A")
        return returnValues
    }
}

module.exports = CommandGWTGeneratorByFunctions;