const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESAliasTransManager = require("./modules/ESAliasTransManager")
const ESValueSummarizeUtil_WithProperties = require("./modules/ESValueSummarizeUtil_WithProperties")

class GWTGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "targetCommandIds", "description", "esValue"]
        this.progressCheckStrings = ["step1-requirementsAnalysis", "\"requirements\"", "step2-testCaseAnalysis", "step3-GWTGeneration", "step4-GWTEvaluation", "\"overallScore\""]
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
        return `You are an experienced test engineer and behavior-driven development (BDD) specialist. Your expertise lies in:
- Creating comprehensive test scenarios using Given-When-Then format
- Analyzing business requirements to identify testable behaviors
- Ensuring test coverage across different use cases
- Designing maintainable and reusable test cases
- Understanding domain-driven design concepts and event-driven systems
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You need to extract the right GWT (Given, When, Then) cases from the user's requirements and add them to the right commands in the given bounded context.

Please follow these rules.
1. Extract as many requirements about GWT as possible to add to the command passed in by the user.
2. All GWTs should be generated only for the ids of the commands passed in by the user.
3. The generated GWTs will be used later in code generation, so we need unique, non-duplicated GWTs that are sufficiently helpful in code generation.
4. given is matched against Aggregate, when is matched against Command, and then is matched against Event. You need to make the properties of each target available to GWT.
5. Do not write comments in the output JSON object.

`
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeUtil_WithProperties.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "thoughtProcess": {
        // From the requirements requested by the user, derive scenarios that can be tested with the given commands.
        "step1-requirementsAnalysis": {
            "thought": "thought process for request analysis",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "requirements": [
                    {"name": "requirement-name", "description": "requirement-description", "commandId": "command-id"},
                    ...
                ]
            }
        },

        // Analyse the different scenarios in which GWTs can be derived from the requirements identified in Step 1.
        "step2-testCaseAnalysis": {
            "thought": "thought process for request analysis",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "<requirement-name>": {
                    "scenarios": [
                        {"name": "scenario-name", "description": "scenario-description"},
                        ...
                    ]
                }
            }
        },

        // Based on your analysis in steps 1 and 2, create a set of possible GWTs for each requirement.
        // Generate the appropriate GWTs for each scenario analysed in STEP2.
        "step3-GWTGeneration": {
            "thought": "thought process for GWT generation",
            "reflection": "re-evaluate your thought to see if there's anything you can strengthen.",
            "result": {
                "<requirement-name>": {
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
            }
        },

        "step4-GWTEvaluation": {
            "thought": "Evaluate the completeness and quality of generated GWTs",
            "reflection": "Consider if the GWTs fully cover all scenarios and follow best practices",
            "result": {
                "evaluationCriteria": {
                    "requirementsCoverage": {
                        "score": "<0-100>",
                        "details": ["<requirement coverage detail>", ...],
                        "missingScenarios": ["<missing scenario>", ...]
                    },
                    "gwtQuality": {
                        "score": "<0-100>",
                        "details": ["<GWT quality detail>", ...],
                        "improvements": ["<suggested improvement>", ...]
                    },
                    "testScenarioCompleteness": {
                        "score": "<0-100>",
                        "details": ["<test scenario detail>", ...],
                        "gaps": ["<identified gap>", ...]
                    },
                    "bestPracticesAlignment": {
                        "score": "<0-100>",
                        "details": ["<best practice alignment detail>", ...],
                        "violations": ["<best practice violation>", ...]
                    },
                    "commandAlignment": {
                        "score": "<0-100>",
                        "details": ["<command alignment detail>", ...],
                        "matchedCommands": [
                            {
                                "commandId": "<command id>",
                                "implementedGWTs": ["<GWT name>", ...],
                                "missingAspects": ["<missing aspect>", ...]
                            }
                        ],
                        "unmatchedCommands": ["<command without GWT>", ...]
                    }
                },
                "overallScore": "<0-100>",
                "recommendedImprovements": [
                    {
                        "area": "<improvement area>",
                        "description": "<improvement description>",
                        "suggestedGWTs": ["<GWT name>", ...]
                    }
                ],
                "needsIteration": "<true|false>" // true if overallScore < 80
            }
        }
    }
}`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Current Bounded Context": {
                "id": "bc-ordermanagement",
                "name": "ordermanagement",
                "aggregates": {
                    "agg-order": {
                        "id": "agg-order",
                        "name": "Order",
                        "properties": [
                            {
                                "name": "orderId",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "customer",
                                "type": "Customer"
                            },
                            {
                                "name": "orderStatus",
                                "type": "OrderStatus"
                            },
                            {
                                "name": "orderDetails",
                                "type": "OrderDetails"
                            },
                            {
                                "name": "paymentInfo",
                                "type": "PaymentInfo"
                            }
                        ],
                        "entities": [
                            {
                                "id": "ent-customer",
                                "name": "Customer",
                                "properties": [
                                    {
                                        "name": "customerId",
                                        "type": "String"
                                    },
                                    {
                                        "name": "name",
                                        "type": "String"
                                    },
                                    {
                                        "name": "email",
                                        "type": "String"
                                    },
                                    {
                                        "name": "phone",
                                        "type": "String"
                                    }
                                ]
                            }
                        ],
                        "enumerations": [
                            {
                                "id": "enum-orderStatus",
                                "name": "OrderStatus",
                                "items": [
                                    "CREATED",
                                    "PAID",
                                    "CANCELLED"
                                ]
                            },
                            {
                                "id": "enum-paymentMethod",
                                "name": "PaymentMethod",
                                "items": [
                                    "CREDIT_CARD",
                                    "BANK_TRANSFER",
                                    "DIGITAL_WALLET"
                                ]
                            }
                        ],
                        "valueObjects": [
                            {
                                "id": "vo-orderDetails",
                                "name": "OrderDetails",
                                "properties": [
                                    {
                                        "name": "items",
                                        "type": "List<OrderItem>"
                                    },
                                    {
                                        "name": "totalAmount",
                                        "type": "Number"
                                    }
                                ]
                            },
                            {
                                "id": "vo-orderItem",
                                "name": "OrderItem",
                                "properties": [
                                    {
                                        "name": "productId",
                                        "type": "String"
                                    },
                                    {
                                        "name": "quantity",
                                        "type": "Number"
                                    },
                                    {
                                        "name": "price",
                                        "type": "Number"
                                    }
                                ]
                            },
                            {
                                "id": "vo-paymentInfo",
                                "name": "PaymentInfo",
                                "properties": [
                                    {
                                        "name": "paymentMethod",
                                        "type": "PaymentMethod"
                                    },
                                    {
                                        "name": "paymentStatus",
                                        "type": "String"
                                    },
                                    {
                                        "name": "transactionId",
                                        "type": "String"
                                    }
                                ]
                            }
                        ],
                        "commands": [
                            {
                                "id": "cmd-createOrder",
                                "name": "CreateOrder",
                                "api_verb": "POST",
                                "outputEvents": [
                                    {
                                        "id": "evt-orderCreated",
                                        "name": "OrderCreated"
                                    }
                                ],
                                "properties": [
                                    {
                                        "name": "customer",
                                        "type": "Customer"
                                    },
                                    {
                                        "name": "orderDetails",
                                        "type": "OrderDetails"
                                    }
                                ]
                            },
                            {
                                "id": "cmd-processPayment",
                                "name": "ProcessPayment",
                                "api_verb": "PUT",
                                "outputEvents": [
                                    {
                                        "id": "evt-paymentProcessed",
                                        "name": "PaymentProcessed"
                                    }
                                ],
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long",
                                        "isKey": true
                                    },
                                    {
                                        "name": "paymentInfo",
                                        "type": "PaymentInfo"
                                    }
                                ]
                            }
                        ],
                        "events": [
                            {
                                "id": "evt-orderCreated",
                                "name": "OrderCreated",
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long"
                                    },
                                    {
                                        "name": "customer",
                                        "type": "Customer"
                                    },
                                    {
                                        "name": "orderStatus",
                                        "type": "OrderStatus"
                                    }
                                ]
                            },
                            {
                                "id": "evt-paymentProcessed",
                                "name": "PaymentProcessed",
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long"
                                    },
                                    {
                                        "name": "paymentInfo",
                                        "type": "PaymentInfo"
                                    }
                                ]
                            }
                        ]
                    },
                    "agg-delivery": {
                        "id": "agg-delivery",
                        "name": "Delivery",
                        "properties": [
                            {
                                "name": "deliveryId",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "orderId",
                                "type": "Long"
                            },
                            {
                                "name": "status",
                                "type": "DeliveryStatus"
                            },
                            {
                                "name": "address",
                                "type": "Address"
                            },
                            {
                                "name": "courier",
                                "type": "Courier"
                            }
                        ],
                        "entities": [
                            {
                                "id": "ent-courier",
                                "name": "Courier",
                                "properties": [
                                    {
                                        "name": "courierId",
                                        "type": "String"
                                    },
                                    {
                                        "name": "name",
                                        "type": "String"
                                    },
                                    {
                                        "name": "contactNumber",
                                        "type": "String"
                                    }
                                ]
                            }
                        ],
                        "enumerations": [
                            {
                                "id": "enum-deliveryStatus",
                                "name": "DeliveryStatus",
                                "items": [
                                    "PENDING",
                                    "IN_PROGRESS",
                                    "COMPLETED",
                                    "FAILED"
                                ]
                            }
                        ],
                        "valueObjects": [
                            {
                                "id": "vo-address",
                                "name": "Address",
                                "properties": [
                                    {
                                        "name": "street",
                                        "type": "String"
                                    },
                                    {
                                        "name": "city",
                                        "type": "String"
                                    },
                                    {
                                        "name": "state",
                                        "type": "String"
                                    },
                                    {
                                        "name": "postalCode",
                                        "type": "String"
                                    },
                                    {
                                        "name": "country",
                                        "type": "String"
                                    }
                                ]
                            }
                        ],
                        "commands": [
                            {
                                "id": "cmd-startDelivery",
                                "name": "StartDelivery",
                                "api_verb": "POST",
                                "outputEvents": [
                                    {
                                        "id": "evt-deliveryStarted",
                                        "name": "DeliveryStarted"
                                    }
                                ],
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long"
                                    },
                                    {
                                        "name": "address",
                                        "type": "Address"
                                    }
                                ]
                            }
                        ],
                        "events": [
                            {
                                "id": "evt-deliveryStarted",
                                "name": "DeliveryStarted",
                                "properties": [
                                    {
                                        "name": "deliveryId",
                                        "type": "Long"
                                    },
                                    {
                                        "name": "orderId",
                                        "type": "Long"
                                    },
                                    {
                                        "name": "status",
                                        "type": "DeliveryStatus"
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
    
            "Functional Requirements": `
We need to implement an order management system with the following requirements:

1. Order Creation:
- Customers should be able to create new orders with their information (name, email, phone)
- Each order must include items (product ID, quantity, price) and total amount
- Initial order status should be set to 'CREATED'

2. Payment Processing:
- Customers can process payment for their created orders
- Multiple payment methods should be supported (credit card, bank transfer, digital wallet)
- Payment information including transaction ID should be recorded
- After successful payment, order status should change to 'PAID'

3. Delivery Management:
- After payment, delivery can be started with detailed shipping address
- Each delivery is assigned to a courier
- Delivery status should be tracked with tracking number and estimated delivery date`,
    
            "Target Command Ids": "cmd-createOrder, cmd-processPayment"
        }

    }

    __buildJsonExampleOutputFormat() {
        return {
            "thoughtProcess": {
                "step1-requirementsAnalysis": {
                    "thought": "Analyzing the order management requirements to identify testable scenarios for CreateOrder and ProcessPayment commands",
                    "reflection": "The requirements clearly outline the order creation and payment processing flows",
                    "result": {
                        "requirements": [
                            {
                                "name": "order-creation",
                                "description": "Customer creates new order with personal info and order details",
                                "commandId": "cmd-createOrder"
                            },
                            {
                                "name": "payment-processing",
                                "description": "Process payment for existing order with payment method",
                                "commandId": "cmd-processPayment"
                            }
                        ]
                    }
                },
                "step2-testCaseAnalysis": {
                    "thought": "Breaking down each requirement into specific test scenarios",
                    "reflection": "Ensuring coverage of main flows and edge cases",
                    "result": {
                        "order-creation": {
                            "scenarios": [
                                {
                                    "name": "successful-order-creation",
                                    "description": "Customer successfully creates order with valid information"
                                }
                            ]
                        },
                        "payment-processing": {
                            "scenarios": [
                                {
                                    "name": "successful-payment-processing",
                                    "description": "Successfully process payment for existing order"
                                }
                            ]
                        }
                    }
                },
                "step3-GWTGeneration": {
                    "thought": "Creating specific GWTs for each identified scenario",
                    "reflection": "Ensuring proper property coverage in each GWT step",
                    "result": {
                        "order-creation": {
                            "targetCommandId": "cmd-createOrder",
                            "gwts": [
                                {
                                    "given": {
                                        "name": "Order",
                                        "values": {
                                            "orderId": null,
                                            "customer": {
                                                "customerId": "CUST123",
                                                "name": "John Doe",
                                                "email": "john@example.com",
                                                "phone": "+1234567890"
                                            },
                                            "orderStatus": "N/A",
                                            "orderDetails": "N/A",
                                            "paymentInfo": "N/A"
                                        }
                                    },
                                    "when": {
                                        "name": "CreateOrder",
                                        "values": {
                                            "customer": {
                                                "customerId": "CUST123",
                                                "name": "John Doe",
                                                "email": "john@example.com",
                                                "phone": "+1234567890"
                                            },
                                            "orderDetails": {
                                                "items": [
                                                    {
                                                        "productId": "PROD123",
                                                        "quantity": 2,
                                                        "price": 100.00
                                                    }
                                                ],
                                                "totalAmount": 200.00
                                            }
                                        }
                                    },
                                    "then": {
                                        "name": "OrderCreated",
                                        "values": {
                                            "orderId": 1001,
                                            "customer": {
                                                "customerId": "CUST123",
                                                "name": "John Doe",
                                                "email": "john@example.com",
                                                "phone": "+1234567890"
                                            },
                                            "orderStatus": "CREATED"
                                        }
                                    }
                                }
                            ]
                        },
                        "payment-processing": {
                            "targetCommandId": "cmd-processPayment",
                            "gwts": [
                                {
                                    "given": {
                                        "name": "Order",
                                        "values": {
                                            "orderId": 1001,
                                            "customer": "N/A",
                                            "orderStatus": "CREATED",
                                            "orderDetails": "N/A",
                                            "paymentInfo": null
                                        }
                                    },
                                    "when": {
                                        "name": "ProcessPayment",
                                        "values": {
                                            "orderId": 1001,
                                            "paymentInfo": {
                                                "paymentMethod": "CREDIT_CARD",
                                                "paymentStatus": "PENDING",
                                                "transactionId": null
                                            }
                                        }
                                    },
                                    "then": {
                                        "name": "PaymentProcessed",
                                        "values": {
                                            "orderId": 1001,
                                            "paymentInfo": {
                                                "paymentMethod": "CREDIT_CARD",
                                                "paymentStatus": "COMPLETED",
                                                "transactionId": "TXN123456"
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                },
                "step4-GWTEvaluation": {
                    "thought": "Evaluating the completeness and quality of generated GWTs",
                    "reflection": "Checking coverage of requirements and alignment with best practices",
                    "result": {
                        "evaluationCriteria": {
                            "requirementsCoverage": {
                                "score": "90",
                                "details": [
                                    "Covers main order creation flow",
                                    "Covers payment processing flow"
                                ],
                                "missingScenarios": [
                                    "Order creation with invalid customer data"
                                ]
                            },
                            "gwtQuality": {
                                "score": "95",
                                "details": [
                                    "Clear and specific test conditions",
                                    "Proper use of property values"
                                ],
                                "improvements": [
                                    "Could add more edge cases"
                                ]
                            },
                            "testScenarioCompleteness": {
                                "score": "85",
                                "details": [
                                    "Core functionality covered",
                                    "Main success paths implemented"
                                ],
                                "gaps": [
                                    "Error scenarios not fully covered"
                                ]
                            },
                            "bestPracticesAlignment": {
                                "score": "90",
                                "details": [
                                    "Follows GWT format correctly",
                                    "Properties properly utilized"
                                ],
                                "violations": [
                                    "Some N/A values could be more specific"
                                ]
                            },
                            "commandAlignment": {
                                "score": "100",
                                "details": [
                                    "All target commands implemented",
                                    "Command properties properly used"
                                ],
                                "matchedCommands": [
                                    {
                                        "commandId": "cmd-createOrder",
                                        "implementedGWTs": ["successful-order-creation"],
                                        "missingAspects": []
                                    },
                                    {
                                        "commandId": "cmd-processPayment",
                                        "implementedGWTs": ["successful-payment-processing"],
                                        "missingAspects": []
                                    }
                                ],
                                "unmatchedCommands": []
                            }
                        },
                        "overallScore": "92",
                        "recommendedImprovements": [
                            {
                                "area": "Error Scenarios",
                                "description": "Add test cases for invalid inputs and error conditions",
                                "suggestedGWTs": ["invalid-customer-data", "payment-failure"]
                            }
                        ],
                        "needsIteration": false
                    }
                }
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        const summarizedBoundedContext = Object.values(this.esAliasTransManager.transToAliasInSummarizedESValue({
            "targetBoundedContext": ESValueSummarizeUtil_WithProperties.getSummarizedBoundedContextValue(
                this.client.input.esValue,
                this.client.input.targetBoundedContext
            )
        }))[0]

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
        const result = returnObj.modelValue.aiOutput.thoughtProcess["step3-GWTGeneration"].result


        let commandsToReplace = []
        for(const scenario of Object.values(result)){
            const targetCommandUUID = this.esAliasTransManager.aliasToUUIDDic[scenario.targetCommandId]
            if(!targetCommandUUID) continue
            
            let targetCommand = this.client.input.esValue.elements[targetCommandUUID]
            if(!targetCommand) continue
            targetCommand = JSON.parse(JSON.stringify(targetCommand))

            targetCommand.examples = this._getExamples(scenario.gwts)
            commandsToReplace.push(targetCommand)
        }
        returnObj.modelValue.commandsToReplace = commandsToReplace


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
        return Object.values(this.client.input.esValue.elements).find(element => element.name === name)
    }

    __getValuesUsingFieldDescriptors(values, fieldDescriptors) {
        let returnValues = {}
        for(const fieldDescriptor of fieldDescriptors)
            returnValues[fieldDescriptor.name] = (values.hasOwnProperty(fieldDescriptor.name) ? values[fieldDescriptor.name] : "N/A")
        return returnValues
    }
}

module.exports = GWTGeneratorByFunctions;