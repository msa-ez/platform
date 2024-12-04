const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESAliasTransManager = require("./modules/ESAliasTransManager")
const ESValueSummarizeUtil_WithProperties = require("./modules/ESValueSummarizeUtil_WithProperties")

class GWTGeneratorByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "description", "esValue"]
        this.progressCheckStrings = ["step1-requirementsAnalysis", "\"requirements\"", "step2-testCaseAnalysis", "step3-GWTGeneration", "step4-GWTEvaluation", "\"overallScore\""]
    }


    onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        this.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
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
1. Extract GWTs from user requirements that cover as many different cases as possible.
2. You must add GWT using only the Id of the command in the given Bounded Context.
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
                "actors": [
                    {
                        "id": "act-customer",
                        "name": "Customer"
                    }
                ],
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
                            },
                            {
                                "name": "createdAt",
                                "type": "Date"
                            }
                        ],
                        "entities": [
                            {
                                "id": "ent-customer",
                                "name": "Customer",
                                "properties": [
                                    {
                                        "name": "customerId"
                                    },
                                    {
                                        "name": "name"
                                    },
                                    {
                                        "name": "email"
                                    },
                                    {
                                        "name": "phone"
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
                                    "CANCELLED",
                                    "REFUNDED"
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
                                        "type": "Array"
                                    },
                                    {
                                        "name": "totalAmount",
                                        "type": "Number"
                                    }
                                ]
                            },
                            {
                                "id": "vo-paymentInfo",
                                "name": "PaymentInfo",
                                "properties": [
                                    {
                                        "name": "paymentMethod"
                                    },
                                    {
                                        "name": "paymentStatus"
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
                            },
                            {
                                "id": "cmd-cancelOrder",
                                "name": "CancelOrder",
                                "api_verb": "PUT",
                                "outputEvents": [
                                    {
                                        "id": "evt-orderCancelled",
                                        "name": "OrderCancelled"
                                    }
                                ],
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long",
                                        "isKey": true
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
                                "id": "evt-orderCreated",
                                "name": "OrderCreated",
                                "outputCommands": [],
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
                                        "name": "orderDetails",
                                        "type": "OrderDetails"
                                    },
                                    {
                                        "name": "orderStatus",
                                        "type": "OrderStatus"
                                    },
                                    {
                                        "name": "createdAt",
                                        "type": "Date"
                                    }
                                ]
                            },
                            {
                                "id": "evt-paymentProcessed",
                                "name": "PaymentProcessed",
                                "outputCommands": [],
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long",
                                        "isKey": true
                                    },
                                    {
                                        "name": "orderStatus",
                                        "type": "OrderStatus"
                                    },
                                    {
                                        "name": "paymentInfo",
                                        "type": "PaymentInfo"
                                    }
                                ]
                            },
                            {
                                "id": "evt-orderCancelled",
                                "name": "OrderCancelled",
                                "outputCommands": [],
                                "properties": [
                                    {
                                        "name": "orderId",
                                        "type": "Long",
                                        "isKey": true
                                    },
                                    {
                                        "name": "orderStatus",
                                        "type": "OrderStatus"
                                    },
                                    {
                                        "name": "reason",
                                        "type": "String"
                                    },
                                    {
                                        "name": "cancelledAt",
                                        "type": "Date"
                                    }
                                ]
                            }
                        ]
                    }
                }
            },

            "Functional Requirements": `
We need to implement an online order management system with the following requirements:

1. Order Creation:
- Customers should be able to create new orders by providing their information (name, email, phone)
- Each order must include at least one item and the total amount
- The system should generate a unique order ID
- Initial order status should be set to 'CREATED'

2. Payment Processing:
- Customers can process payment for their created orders
- Payment can be made using various methods (credit card, bank transfer)
- After successful payment, order status should change to 'PAID'
- Payment information should be recorded with the order

3. Order Cancellation:
- Customers can cancel their orders if they haven't been paid yet
- Cancelled orders should have status 'CANCELLED'
- If an order is cancelled after payment, a refund should be initiated
- Refunded orders should have status 'REFUNDED'

All operations should be recorded with timestamps and proper status updates.`
        }

    }

    __buildJsonExampleOutputFormat() {
        return {
            "thoughtProcess": {
                "step1-requirementsAnalysis": {
                    "thought": "Analyzing the order management requirements to identify testable scenarios",
                    "reflection": "The requirements cover order lifecycle from creation to cancellation with various status changes",
                    "result": {
                        "requirements": [
                            {
                                "name": "order-creation",
                                "description": "Customer should be able to create new orders",
                                "commandId": "cmd-createOrder"
                            },
                            {
                                "name": "payment-processing",
                                "description": "Process payment for created orders",
                                "commandId": "cmd-processPayment"
                            },
                            {
                                "name": "order-cancellation",
                                "description": "Cancel orders with different payment states",
                                "commandId": "cmd-cancelOrder"
                            }
                        ]
                    }
                },
                "step2-testCaseAnalysis": {
                    "thought": "Identifying different scenarios for each requirement",
                    "reflection": "Need to cover both successful and edge cases",
                    "result": {
                        "order-creation": {
                            "scenarios": [
                                {
                                    "name": "valid-order-creation",
                                    "description": "Create order with valid customer information and items"
                                }
                            ]
                        },
                        "payment-processing": {
                            "scenarios": [
                                {
                                    "name": "successful-payment",
                                    "description": "Process payment for a created order"
                                }
                            ]
                        },
                        "order-cancellation": {
                            "scenarios": [
                                {
                                    "name": "cancel-unpaid-order",
                                    "description": "Cancel order before payment"
                                }
                            ]
                        }
                    }
                },
                "step3-GWTGeneration": {
                    "thought": "Creating GWTs for identified scenarios",
                    "reflection": "Ensuring proper state transitions and validations",
                    "result": {
                        "order-creation": {
                            "targetCommandId": "cmd-createOrder",
                            "gwts": [
                                {
                                    "given": {
                                        "name": "Order",
                                        "values": {
                                            "orderId": null,
                                            "customer": null,
                                            "orderStatus": null,
                                            "orderDetails": null,
                                            "paymentInfo": null,
                                            "createdAt": null
                                        }
                                    },
                                    "when": {
                                        "name": "CreateOrder",
                                        "values": {
                                            "customer": {
                                                "customerId": "CUST123",
                                                "name": "John Doe",
                                                "email": "john@example.com",
                                                "phone": "123-456-7890"
                                            },
                                            "orderDetails": {
                                                "items": ["item1", "item2"],
                                                "totalAmount": 100.00
                                            }
                                        }
                                    },
                                    "then": {
                                        "name": "OrderCreated",
                                        "values": {
                                            "orderId": "ORD123",
                                            "customer": {
                                                "customerId": "CUST123",
                                                "name": "John Doe",
                                                "email": "john@example.com",
                                                "phone": "123-456-7890"
                                            },
                                            "orderDetails": {
                                                "items": ["item1", "item2"],
                                                "totalAmount": 100.00
                                            },
                                            "orderStatus": "CREATED",
                                            "createdAt": "2024-03-21T10:00:00Z"
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
                                            "orderId": "ORD123",
                                            "orderStatus": "CREATED",
                                            "customer": {
                                                "customerId": "CUST123",
                                                "name": "John Doe",
                                                "email": "john@example.com",
                                                "phone": "123-456-7890"
                                            },
                                            "orderDetails": {
                                                "items": ["item1", "item2"],
                                                "totalAmount": 100.00
                                            },
                                            "paymentInfo": null,
                                            "createdAt": "2024-03-21T10:00:00Z"
                                        }
                                    },
                                    "when": {
                                        "name": "ProcessPayment",
                                        "values": {
                                            "orderId": "ORD123",
                                            "paymentInfo": {
                                                "paymentMethod": "CREDIT_CARD",
                                                "paymentStatus": "PENDING"
                                            }
                                        }
                                    },
                                    "then": {
                                        "name": "PaymentProcessed",
                                        "values": {
                                            "orderId": "ORD123",
                                            "orderStatus": "PAID",
                                            "paymentInfo": {
                                                "paymentMethod": "CREDIT_CARD",
                                                "paymentStatus": "COMPLETED"
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        "order-cancellation": {
                            "targetCommandId": "cmd-cancelOrder",
                            "gwts": [
                                {
                                    "given": {
                                        "name": "Order",
                                        "values": {
                                            "orderId": "ORD123",
                                            "orderStatus": "CREATED",
                                            "customer": {
                                                "customerId": "CUST123",
                                                "name": "John Doe",
                                                "email": "john@example.com",
                                                "phone": "123-456-7890"
                                            },
                                            "orderDetails": {
                                                "items": ["item1", "item2"],
                                                "totalAmount": 100.00
                                            },
                                            "paymentInfo": null,
                                            "createdAt": "2024-03-21T10:00:00Z"
                                        }
                                    },
                                    "when": {
                                        "name": "CancelOrder",
                                        "values": {
                                            "orderId": "ORD123",
                                            "reason": "Customer requested cancellation"
                                        }
                                    },
                                    "then": {
                                        "name": "OrderCancelled",
                                        "values": {
                                            "orderId": "ORD123",
                                            "orderStatus": "CANCELLED",
                                            "reason": "Customer requested cancellation",
                                            "cancelledAt": "2024-03-21T10:30:00Z"
                                        }
                                    }
                                }
                            ]
                        }
                    }
                },
                "step4-GWTEvaluation": {
                    "thought": "Evaluating the completeness of generated GWTs",
                    "reflection": "Checking coverage and alignment with requirements",
                    "result": {
                        "evaluationCriteria": {
                            "requirementsCoverage": {
                                "score": "90",
                                "details": ["Covers main order creation flow"],
                                "missingScenarios": ["Edge cases for invalid input"]
                            },
                            "gwtQuality": {
                                "score": "85",
                                "details": ["Clear state transitions", "Proper validation checks"],
                                "improvements": ["Add more specific assertions"]
                            },
                            "testScenarioCompleteness": {
                                "score": "95",
                                "details": [
                                    "Covers all main flows",
                                    "Includes status transitions",
                                    "Handles payment processing"
                                ],
                                "gaps": [
                                    "Missing validation error cases",
                                    "Missing payment failure scenarios"
                                ]
                            },
                            "bestPracticesAlignment": {
                                "score": "90",
                                "details": [
                                    "Clear preconditions in Given",
                                    "Specific actions in When",
                                    "Verifiable outcomes in Then"
                                ],
                                "violations": [
                                    "Some scenarios could be more specific"
                                ]
                            },
                            "commandAlignment": {
                                "score": "100",
                                "details": [
                                    "All commands have corresponding GWTs",
                                    "Command parameters properly utilized"
                                ],
                                "matchedCommands": [
                                    {
                                        "commandId": "cmd-createOrder",
                                        "implementedGWTs": ["valid-order-creation"],
                                        "missingAspects": []
                                    },
                                    {
                                        "commandId": "cmd-processPayment",
                                        "implementedGWTs": ["successful-payment"],
                                        "missingAspects": ["payment-failure"]
                                    },
                                    {
                                        "commandId": "cmd-cancelOrder",
                                        "implementedGWTs": ["cancel-unpaid-order"],
                                        "missingAspects": ["cancel-paid-order"]
                                    }
                                ],
                                "unmatchedCommands": []
                            }
                        },
                        "overallScore": "88",
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

            "Final Check List": `
* Make sure each command has an appropriate GWT from the user's requirements.
* Make sure your scenarios reflect the best use of GWT in your code generation.
* The generated GWT must have the properties found in the Aggregate, Command, and Event presented.
`
        }
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Generating GWTs for ${this.client.input.targetBoundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
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


        returnObj.directMessage = `Generating GWTs for ${this.client.input.targetBoundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
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