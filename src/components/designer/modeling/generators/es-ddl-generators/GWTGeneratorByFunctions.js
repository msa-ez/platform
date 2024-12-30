const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESAliasTransManager = require("./modules/ESAliasTransManager")
const ESValueSummarizeWithFilterUtil = require("./modules/ESValueSummarizeWithFilterUtil")

class GWTGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "targetCommandIds", "description", "esValue"]
        this.progressCheckStrings = ["thoughts", "inference", "reflection", "targetCommandId"]
    }


    onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        this.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
        inputParams.targetCommandAliases = inputParams.targetCommandIds.map(commandId => this.esAliasTransManager.UUIDToAliasDic[commandId])
        
        inputParams.targetAggregateNames = inputParams.targetCommandIds.map(commandId => {
            const commandAggregateId = inputParams.esValue.elements[commandId].aggregate.id
            const targetAggregate = inputParams.esValue.elements[commandAggregateId]
            return targetAggregate.displayName ? targetAggregate.displayName : targetAggregate.name
        })
        inputParams.targetAggregateNames = Array.from(new Set(inputParams.targetAggregateNames))
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

    __buildRequestFormatPrompt(){
        return ESValueSummarizeWithFilterUtil.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "thoughts": {
        "summary": "Test scenario analysis and validation requirements",
        "details": {
            "businessOperations": "Core test cases for business operations",
            "commandFlow": "Command validation and test coverage requirements",
            "eventFlow": "Event verification and state transition tests",
            "readModelPurpose": "Query validation and view testing requirements",
            "actorInteractions": "User interaction test scenarios"
        },
        "additionalConsiderations": "Test environment and data setup requirements"
    },

    "inference": {
        "summary": "Test strategy and coverage implications",
        "details": {
            "cascadingCommands": "Integration test scenarios for command chains",
            "stateTransitions": "State machine testing requirements",
            "validationRules": "Input validation test cases",
            "queryPatterns": "Performance and load test scenarios",
            "eventChains": "Event propagation test coverage"
        },
        "additionalInferences": "Edge cases and error scenarios to test"
    },

    "reflection": {
        "summary": "Test implementation and maintenance considerations",
        "details": {
            "consistency": "Data consistency test requirements",
            "performance": "Performance test metrics and thresholds",
            "scalability": "Load and stress test considerations",
            "maintainability": "Test suite maintenance strategy",
            "security": "Security testing requirements"
        },
        "additionalReflections": "Test automation and CI/CD integration"
    },

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
            "thoughts": {
                "summary": "Comprehensive analysis of inventory management test scenarios focusing on stock management and product lifecycle",
                "details": {
                    "businessOperations": "Core inventory operations including stock updates and product discontinuation with proper validation rules",
                    "commandFlow": "Sequential validation of commands ensuring business rule compliance and data integrity",
                    "eventFlow": "Event chain verification for stock updates and status changes with proper state tracking",
                    "readModelPurpose": "Real-time inventory tracking and product status monitoring for accurate stock management",
                    "actorInteractions": "Role-based operations for inventory managers and product managers with proper authorization"
                },
                "additionalConsiderations": "Data consistency across inventory updates and proper audit trail maintenance"
            },

            "inference": {
                "summary": "Strategic approach to inventory management testing with focus on data integrity and business rule validation",
                "details": {
                    "cascadingCommands": "Stock updates affecting product availability status and inventory levels",
                    "stateTransitions": "Product lifecycle states from AVAILABLE through OUT_OF_STOCK to DISCONTINUED",
                    "validationRules": "Stock quantity validation and mandatory discontinuation reason checks",
                    "queryPatterns": "Stock level monitoring and product status verification scenarios",
                    "eventChains": "Stock update propagation and status change notification flows"
                },
                "additionalInferences": "Edge cases including zero stock handling and invalid state transitions"
            },

            "reflection": {
                "summary": "Implementation considerations focusing on maintainability and system reliability",
                "details": {
                    "consistency": "Atomic operations for stock updates and status changes",
                    "performance": "Efficient stock update processing and status change propagation",
                    "scalability": "Handling multiple concurrent stock updates and status changes",
                    "maintainability": "Clear separation of stock management and product lifecycle concerns",
                    "security": "Role-based access control for inventory operations"
                },
                "additionalReflections": "Integration with inventory monitoring and alerting systems"
            },

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
        const summarizedBoundedContext = {
            "deletedProperties": [],
            "boundedContexts": [
                ESValueSummarizeWithFilterUtil.getSummarizedBoundedContextValue(
                    this.client.input.esValue,
                    this.client.input.targetBoundedContext,
                    [],
                    this.esAliasTransManager
                )
            ]
        }

        return {
            "Current Bounded Context": JSON.stringify(summarizedBoundedContext),

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
        returnObj.directMessage = `Generating GWTs for ${this.client.input.targetAggregateNames.join(", ")} Aggregates... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        const result = returnObj.modelValue.aiOutput.result
        if(this.client.input.targetCommandAliases.length !== result.length)
            throw new Error("The number of target command IDs and the number of GWT scenarios do not match.")

        let commandsToReplace = []
        for(const scenario of Object.values(result)){
            const targetCommandUUID = this.esAliasTransManager.aliasToUUIDDic[scenario.targetCommandId]
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


        returnObj.directMessage = `Generating GWTs for ${this.client.input.targetAggregateNames.join(", ")} Aggregates... (${returnObj.modelRawValue.length} characters generated)`
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

module.exports = GWTGeneratorByFunctions;