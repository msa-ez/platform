const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESAliasTransManager = require("./modules/ESAliasTransManager")
const ESValueSummarizeWithFilterUtil = require("./modules/ESValueSummarizeWithFilterUtil")

class GWTGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "targetCommandIds", "description", "esValue"]
        this.progressCheckStrings = ["overviewThoughts", "targetCommandId"]
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
    "overviewThoughts": {
        "summary": "High-level analysis of the business domain and system requirements",
        "details": {
            "domainComplexity": "Assessment of domain rules, constraints, and business logic complexity",
            "systemBoundaries": "Definition of system scope, interfaces, and integration points",
            "stakeholderImpact": "Analysis of how changes affect different stakeholders and system users"
        },
        "additionalConsiderations": "Long-term maintainability, scalability, and evolution aspects"
    },

   "result": [
        {
            "targetCommandId": "<targetCommandId>",
            "commandThoughts": {
                "summary": "Command-specific analysis focusing on behavior and validation",
                "details": {
                    "businessRules": "Specific business rules and validation requirements for the command",
                    "stateTransitions": "Expected state changes and their implications",
                    "errorScenarios": "Potential failure cases and error handling requirements"
                },
                "additionalConsiderations": "Performance implications and side effects"
            },
            "gwts": [
                {
                    "gwtThoughts": {
                        "summary": "Detailed analysis of specific test scenario requirements",
                        "details": {
                            "preconditions": "Required system state and data setup for the scenario",
                            "expectedOutcomes": "Specific success criteria and verification points",
                            "dataRequirements": "Test data characteristics and constraints"
                        },
                        "additionalConsiderations": "Edge cases and special conditions to consider"
                    },

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
            "overviewThoughts": {
                "summary": "Analysis of inventory management system focusing on stock control and product lifecycle",
                "details": {
                    "domainComplexity": "Medium complexity with stock management and product status transitions",
                    "systemBoundaries": "Inventory management bounded context with stock and product lifecycle operations",
                    "stakeholderImpact": "Affects inventory managers and product managers with distinct operational needs"
                },
                "additionalConsiderations": "Need for real-time stock tracking and audit trail maintenance"
            },
    
            "result": [
                {
                    "targetCommandId": "cmd-addStock",
                    "commandThoughts": {
                        "summary": "Stock addition operation with quantity validation",
                        "details": {
                            "businessRules": "Stock quantity must be positive, product must exist in system",
                            "stateTransitions": "Updates product quantity and may affect availability status",
                            "errorScenarios": "Invalid quantity, non-existent product, system constraints"
                        },
                        "additionalConsiderations": "Concurrent stock updates handling"
                    },
                    "gwts": [
                        {
                            "gwtThoughts": {
                                "summary": "Validate successful stock addition to available product",
                                "details": {
                                    "preconditions": "Product exists with initial stock level",
                                    "expectedOutcomes": "Stock level increased, event generated with new total",
                                    "dataRequirements": "Valid product ID and positive quantity value"
                                },
                                "additionalConsiderations": "Stock level boundaries and concurrent updates"
                            },
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
                    "commandThoughts": {
                        "summary": "Product discontinuation process with reason tracking",
                        "details": {
                            "businessRules": "Requires valid reason, affects product availability",
                            "stateTransitions": "Changes product status to DISCONTINUED",
                            "errorScenarios": "Already discontinued products, missing reason"
                        },
                        "additionalConsiderations": "Impact on related inventory operations"
                    },
                    "gwts": [
                        {
                            "gwtThoughts": {
                                "summary": "Validate product discontinuation process",
                                "details": {
                                    "preconditions": "Active product in available state",
                                    "expectedOutcomes": "Product marked as discontinued with reason",
                                    "dataRequirements": "Valid product ID and discontinuation reason"
                                },
                                "additionalConsiderations": "Status transition validation"
                            },
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