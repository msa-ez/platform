
const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESActionsUtil = require("./modules/ESActionsUtil")
const ESFakeActionsUtil = require("./modules/ESFakeActionsUtil")
const ESValueSummarizeUtil = require("./modules/ESValueSummarizeUtil")
const ActionsProcessorUtils = require("./modules/ESActionsUtilProcessors/ActionsProcessorUtils")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class BCReGenerateCreateActionsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.generatorName = "BCReGenerateCreateActionsGenerator"
        this.checkInputParamsKeys = ["targetBoundedContext", "description", "draftOption", "esValue", "userInfo", "information", "isAccumulated"]
        this.progressCheckStrings = ["step1-requirementsAnalysis", "\"requirements\"", "step2-designPossibleActions", "step3-determineDependencies", "\"actions\"", "step4-generateActions", "step5-evaluateActions", "\"evaluationCriteria\"", "\"recommendedImprovements\""]
    }


    onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        inputParams.targetAggregate = Object.values(inputParams.draftOption)[0].aggregate
        inputParams.aggregateDisplayName = inputParams.targetAggregate.alias ? inputParams.targetAggregate.alias : inputParams.targetAggregate.name
        this.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
    }


    __buildAgentRolePrompt(){
        return `You are an experienced domain-driven design (DDD) architect and event storming specialist. Your expertise lies in:
- Translating business requirements into well-structured domain models
- Designing event-driven systems with proper bounded contexts
- Ensuring consistency and best practices in event sourcing
- Creating maintainable and scalable software architectures
`
    }

    __buildTaskGuidelinesPrompt(){
        return `In your current event stemming model, you need to write actions to add elements inside a particular Bounded Context, following the structure provided by the user.

Please follow these rules.
1. You can utilize basic Java data types such as String and Long for Aggregate properties, or predefined properties such as Address, Portrait, Rating, Money, and Email. Other properties must be defined in the corresponding Aggregate as Enumeration or ValueObject or Entity.
2. The name of each object should be written in English, and the rest of the content (alias, etc.) should be written in ${this.preferredLanguage} language so that it is easily understood by the user.
3. When using the value of an Enumeration or ValueObject or Entity in an Aggregate Root, you must use its class name, not the type of the object's Id. Ex) Integer -> OrderStatus
4. If you want to specify it as an array, use 'List<ClassName>'. Ex) List<Address>
5. Commands must raise an event for themselves. e.g. CreateCustomer -> CustomerCreated
6. Note that updates and deletes require the Aggregate's primary key to be included in the event or command to distinguish them.
7. An Aggregate should have only one primary key attribute. If you need a composite key, create an associated ValueObject and assign it as the primary key for the Aggregate.
8. Avoid having only one property in a ValueObject, and put as many related properties as possible.
9. Enumerations that are not in the user's proposed structure can be extracted from the requirements.
10. Make sure to create all Aggregates, Entities, and ValueObjects in the user's proposed structure with the appropriate actions.
11. The ValueObject, Entity, and Enumeration you create must be used as properties in other Aggregates.
12. Do not recreate ValueObjects, Entities, or Enumerations that already exist. If they do exist, recycle them.
13. If possible, you should use another appropriate base type rather than the default String type. Ex) startDate > Date, currentCapacity > Integer
14. Write an action that creates and builds a new Aggregate from the given structure. Do not modify any existing Aggregates; use them for reference only.
15. Create only the Aggregates presented in 'Aggregate to create' as actions.
16. Don't create duplicate commands or events that already exist.
17. Don't create commands and events for simple lookups. Use ReadModels for lookups.
18. If the ValueObject in the structure passed in by the user has a referencedAggregate, this should be utilised as a foreign key: create an Id to reference that Aggregate, and if it is static data that is used infrequently, you can duplicate and store some of its properties for caching.
19. Do not write comments in the output JSON object.
`
    }

    __buildRequestFormatPrompt(){
        return ESValueSummarizeUtil.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `{
   "thoughtProcess": {
       // Analyse your users' requirements to extract as much of their requirements as you can use for event stemming.
       // Analyse which objects in the user's proposed structure match the requirements.
       // Extract requirements that are not reflected in existing event storming values.
       "step1-requirementsAnalysis": {
           "thought": "thought process for requirements analysis",
           "reflection": "Re-evaluate your thought to see if there's anything you can strengthen.",
           "result": {
               "requirements": [
                   {name: "requirement-name", description: "requirement-description", matchedUserObjectNames: ["<matchedUserObjectName>", ...]},
                   ...
               ]
           }
       },

       // Analyse what actions will actually implement the requirements you've identified.
       "step2-designPossibleActions": {
           "thought": "thought process for action design",
           "reflection": "Review your thought to see if there's anything you can strengthen.",
           "result": {
               "requirements": {
                   "requirement-name": ["<actionName>", ...]
               }
           }
       },

       // Determine if any of the event actions you created have dependencies, such as calling other existing events or commands.
       "step3-determineDependencies": {
           "thought": "thought process for dependency analysis",
           "reflection": "Review your thought to see if there's anything you can strengthen.",
           "result": {
               "actions": {
                   "<actionName>": {
                       "dependencies": ["<eventOrCommandName>", ...]
                   }
               }
           }
       },

       // Synthesise the information you already have to create a final action.
       // Fill in the details of all the actions from the previous steps.
       // If you want to modify an existing action, create a name for it and rewrite the entire action.
       // Do not create duplicate commands or events that perform the same role as existing ones.
       "step4-generateActions": {
           "thought": "thought process for action generation",
           "reflection": "Review your thought to see if there's anything you can strengthen.",
           "result": {
               "actions": [
                   {
                       // Write the ActionName that you utilized in the previous steps
                       "actionName": "<actionName>",

                       // This attribute indicates what type of object information is being modified.
                       // Choose one from Aggregate, Command, Event, ReadModel, Enumeration, ValueObject, Entity
                       "objectType": "<objectType>",

                       // This attribute contains the ID information of the object on which the action is performed.
                       "ids": {
                           "<idName>": "<idValue>"
                       },

                       // This attribute contains the parameters required for the action.
                       "args": {
                           "<argName>": "<argValue>"
                       }
                   }
               ]
           }
       },

      "step5-evaluateActions": {
         "thought": "Evaluate the completeness and quality of generated actions",
         "reflection": "Consider if the actions fully address all requirements and follow best practices",
         "result": {
            "evaluationCriteria": {
               "requirementsCoverage": {
                  "score": "<0-100>",
                  "details": ["<requirement coverage detail>", ...],
                  "missingAspects": ["<missing requirement>", ...]
               },
               "domainModelQuality": {
                  "score": "<0-100>",
                  "details": ["<domain model quality detail>", ...],
                  "improvements": ["<suggested improvement>", ...]
               },
               "eventFlowCompleteness": {
                  "score": "<0-100>",
                  "details": ["<event flow detail>", ...],
                  "gaps": ["<identified gap>", ...]
               },
               "bestPracticesAlignment": {
                  "score": "<0-100>",
                  "details": ["<best practice alignment detail>", ...],
                  "violations": ["<best practice violation>", ...]
               },
               "structureAlignment": {
                  "score": "<0-100>",
                  "details": ["<structure alignment detail>", ...],
                  "matchedElements": [
                    {
                       "suggestedElement": "<element name from user structure>",
                       "implementedActions": ["<action name>", ...],
                       "missingAspects": ["<missing aspect>", ...]
                    }
                 ],
                 "unmatchedElements": ["<unimplemented element from user structure>", ...]
              }
            },
            "overallScore": "<0-100>",
            "recommendedImprovements": [
               {
                  "area": "<improvement area>",
                  "description": "<improvement description>",
                  "suggestedActions": ["<actionName>", ...]
               }
            ],
            "needsIteration": "<true|false>" // true if overallScore < 80
         }
      }
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

# objectType: Command
- Description
Generate commands in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "Command",
    "ids": {
        "aggregateId": "<aggregateId>",
        "commandId": "<commandId>"
    },
    "args": {
        "commandName": "<commandName>",
        "commandAlias": "<commandAlias>",
        "api_verb": <"POST" | "DELETE" | "PUT">,

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ],

        "outputEventIds": ["<outputEventId>"], // List of event IDs generated by this command. Must write existing event IDs.
        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, system, etc.
    }
}

# objectType: Event
- Description
Generate events in the aggregate to satisfy the given functional requirements.

- Return format
{
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
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ],

        // Specific events can call commands within other BoundedContexts to change states.
        // Examples of such call information are as follows.
        // 1. If the patient's preference information has changed and there is an updated latest date of the patient's preference information in the patient information, it should be written to reflect this.
        // 2. If the quantity of ordered products has changed and there is information related to the total quantity of ordered products in the order product information, it should be written to reflect this.
        // 3. If a customer has purchased a new product with points and there are remaining points in the customer information, the points should be reduced to reflect this.
        "outputCommandIds": [{
            "commandId": "<outputCommandId>", // The ID of the command being called. Must write existing command IDs.
            "relatedAttribute": "<relatedAttribute>", // Specify which attribute is being updated by calling the command. Write the attribute name of the Aggregate to which the called command belongs.
            "reason": "<reason>" // Specify the reason for calling this command.
        }]
    }
}

# objectType: ReadModel
- Description
Generate read models in the aggregate to satisfy the given functional requirements.

- Return format
{
    "objectType": "ReadModel",
    "ids": {
        "aggregateId": "<aggregateId>",
        "readModelId": "<readModelId>"
    },
    "args": {
        "readModelName": "<readModelName>",
        "readModelAlias": "<readModelAlias>",
        "isMultipleResult": <true|false>,

        "properties": [
            {
                "name": "<propertyName>",
                ["type": "<propertyType>"], // If the type is String, do not specify the type.
                ["isKey": true] // Write only if there is a primary key.
            }
        ],

        "actor": "<actorName>" // The name of the actor performing the action. Should include names like user, admin, system, etc.
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
                "name": "<propertyName>"
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
                "bc-order": {
                    "id": "bc-order",
                    "name": "orderservice",
                    "actors": [
                        {
                            "id": "actor-customer",
                            "name": "Customer"
                        }
                    ],
                    "aggregates": {
                        "agg-product": {
                            "id": "agg-product",
                            "name": "Product",
                            "properties": [
                                {
                                    "name": "productId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "name"
                                },
                                {
                                    "name": "price",
                                    "type": "Money"
                                },
                                {
                                    "name": "status",
                                    "type": "ProductStatus"
                                }
                            ],
                            "enumerations": [
                                {
                                    "id": "enum-product-status",
                                    "name": "ProductStatus",
                                    "items": ["AVAILABLE", "OUT_OF_STOCK", "DISCONTINUED"]
                                }
                            ],
                            "valueObjects": [
                                {
                                    "id": "vo-product-details",
                                    "name": "ProductDetails",
                                    "properties": [
                                        {
                                            "name": "description"
                                        },
                                        {
                                            "name": "category"
                                        }
                                    ]
                                }
                            ],
                            "commands": [],
                            "events": [],
                            "readModels": [
                                {
                                    "id": "rm-product-list",
                                    "name": "ProductList"
                                }
                            ]
                        }
                    }
                },
                "bc-inventory": {
                    "id": "bc-inventory",
                    "name": "inventoryservice",
                    "actors": [],
                    "aggregates": {
                        "agg-inventory": {
                            "id": "agg-inventory",
                            "name": "Inventory",
                            "properties": [
                                {
                                    "name": "inventoryId",
                                    "type": "Long",
                                    "isKey": true
                                },
                                {
                                    "name": "productId",
                                    "type": "Long",
                                    "isForeignProperty": true
                                },
                                {
                                    "name": "quantity",
                                    "type": "Integer"
                                }
                            ],
                            "entities": [
                                {
                                    "id": "entity-stock-history",
                                    "name": "StockHistory",
                                    "properties": [
                                        {
                                            "name": "historyId",
                                            "type": "Long",
                                            "isKey": true
                                        },
                                        {
                                            "name": "inventoryId",
                                            "type": "Long",
                                            "isForeignProperty": true
                                        },
                                        {
                                            "name": "changeDate",
                                            "type": "Date"
                                        },
                                        {
                                            "name": "quantity",
                                            "type": "Integer"
                                        }
                                    ]
                                }
                            ],
                            "commands": [
                                {
                                    "id": "cmd-update-stock",
                                    "name": "UpdateStock",
                                    "api_verb": "PUT",
                                    "outputEvents": [
                                        {
                                            "relationId": "rel-stock-update",
                                            "id": "evt-stock-updated",
                                            "name": "StockUpdated"
                                        }
                                    ]
                                }
                            ],
                            "events": [
                                {
                                    "id": "evt-stock-updated",
                                    "name": "StockUpdated",
                                    "outputCommands": []
                                }
                            ],
                            "readModels": [
                                {
                                    "id": "rm-inventory-status",
                                    "name": "InventoryStatus"
                                }
                            ]
                        }
                    }
                }
            },

            "Bounded Context to Generate Actions": "orderservice",

            "Functional Requirements": `We need to implement a basic order management system with the following requirements:

1. Order Creation:
- Customers should be able to create orders with a single item
- Each order must include product reference and quantity
- Orders must have a shipping address

2. Order Management:
- Customers should be able to cancel orders
- The system should maintain basic order status (PENDING, CONFIRMED, CANCELLED)
- The system should maintain product information reference for each order

3. Order Inquiry:
- Customers should be able to view their order details
- Order details should include order status, product information (cached), quantity, and shipping address`,

            "Suggested Structure": [
                {
                    "aggregate": {
                        "name": "Order",
                        "alias": "Customer Order"
                    },
                    "valueObjects": [
                        {
                            "name": "ShippingAddress",
                            "alias": "Delivery Address"
                        },
                        {
                            "name": "ProductReference",
                            "alias": "Product Information",
                            "referencedAggregate": {
                                "name": "Product",
                                "alias": "Product"
                            }
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
            "thoughtProcess": {
               "step1-requirementsAnalysis": {
                  "thought": "The requirements describe a simple order system with creation, cancellation, and inquiry functionality, including product reference handling.",
                  "reflection": "Added product reference caching requirement for better query performance.",
                  "result": {
                     "requirements": [
                        {
                           "name": "order-creation",
                           "description": "Create new orders with product reference",
                           "matchedUserObjectNames": [
                              "Order",
                              "ShippingAddress",
                              "ProductReference"
                           ]
                        },
                        {
                           "name": "order-management",
                           "description": "Handle order cancellations",
                           "matchedUserObjectNames": [
                              "Order"
                           ]
                        },
                        {
                           "name": "order-inquiry",
                           "description": "View order details with cached product info",
                           "matchedUserObjectNames": [
                              "Order",
                              "ShippingAddress",
                              "ProductReference"
                           ]
                        }
                     ]
                  }
               },
               "step2-designPossibleActions": {
                  "thought": "We need basic commands for order creation and cancellation with their corresponding events.",
                  "reflection": "The actions need to handle product reference caching.",
                  "result": {
                     "requirements": {
                        "order-creation": [
                           "CreateOrder"
                        ],
                        "order-management": [
                           "CancelOrder"
                        ],
                        "order-inquiry": [
                           "GetOrderDetails"
                        ]
                     }
                  }
               },
               "step3-determineDependencies": {
                  "thought": "Order creation will need to update inventory and cache product information.",
                  "reflection": "The dependencies include both inventory update and product reference.",
                  "result": {
                     "actions": {
                        "CreateOrder": {
                           "dependencies": [
                              "UpdateStock"
                           ]
                        }
                     }
                  }
               },
               "step4-generateActions": {
                  "thought": "Generate the basic aggregate, commands, and events needed with product reference handling.",
                  "reflection": "Include product reference caching in the structure.",
                  "result": {
                     "actions": [
                        {
                           "actionName": "DefineOrderAggregate",
                           "objectType": "Aggregate",
                           "ids": {
                              "aggregateId": "agg-order"
                           },
                           "args": {
                              "aggregateName": "Order",
                              "aggregateAlias": "Customer Order",
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
                                    "name": "productReference",
                                    "type": "ProductReference"
                                 },
                                 {
                                    "name": "quantity",
                                    "type": "Integer"
                                 },
                                 {
                                    "name": "shippingAddress",
                                    "type": "ShippingAddress"
                                 },
                                 {
                                    "name": "orderDate",
                                    "type": "Date"
                                 }
                              ]
                           }
                        },
                        {
                           "actionName": "DefineOrderStatusEnum",
                           "objectType": "Enumeration",
                           "ids": {
                              "aggregateId": "agg-order",
                              "enumerationId": "enum-order-status"
                           },
                           "args": {
                              "enumerationName": "OrderStatus",
                              "enumerationAlias": "Order Status",
                              "properties": [
                                 {
                                    "name": "PENDING"
                                 },
                                 {
                                    "name": "CONFIRMED"
                                 },
                                 {
                                    "name": "CANCELLED"
                                 }
                              ]
                           }
                        },
                        {
                           "actionName": "DefineProductReferenceVO",
                           "objectType": "ValueObject",
                           "ids": {
                              "aggregateId": "agg-order",
                              "valueObjectId": "vo-product-reference"
                           },
                           "args": {
                              "valueObjectName": "ProductReference",
                              "valueObjectAlias": "Product Information",
                              "properties": [
                                 {
                                    "name": "productId",
                                    "type": "Long",
                                    "isForeignProperty": true
                                 },
                                 {
                                    "name": "name"
                                 },
                                 {
                                    "name": "price",
                                    "type": "Money"
                                 },
                                 {
                                    "name": "lastUpdated",
                                    "type": "Date"
                                 }
                              ]
                           }
                        },
                        {
                           "actionName": "DefineShippingAddressVO",
                           "objectType": "ValueObject",
                           "ids": {
                              "aggregateId": "agg-order",
                              "valueObjectId": "vo-shipping-address"
                           },
                           "args": {
                              "valueObjectName": "ShippingAddress",
                              "valueObjectAlias": "Delivery Address",
                              "properties": [
                                 {
                                    "name": "street"
                                 },
                                 {
                                    "name": "city"
                                 },
                                 {
                                    "name": "zipCode"
                                 }
                              ]
                           }
                        },
                        {
                           "actionName": "CreateOrder",
                           "objectType": "Command",
                           "ids": {
                              "aggregateId": "agg-order",
                              "commandId": "cmd-create-order"
                           },
                           "args": {
                              "commandName": "CreateOrder",
                              "commandAlias": "Create New Order",
                              "api_verb": "POST",
                              "properties": [
                                 {
                                    "name": "productId",
                                    "type": "Long"
                                 },
                                 {
                                    "name": "quantity",
                                    "type": "Integer"
                                 },
                                 {
                                    "name": "shippingAddress",
                                    "type": "ShippingAddress"
                                 }
                              ],
                              "outputEventIds": [
                                 "evt-order-created"
                              ],
                              "actor": "Customer"
                           }
                        },
                        {
                           "actionName": "CancelOrder",
                           "objectType": "Command",
                           "ids": {
                              "aggregateId": "agg-order",
                              "commandId": "cmd-cancel-order"
                           },
                           "args": {
                              "commandName": "CancelOrder",
                              "commandAlias": "Cancel Order",
                              "api_verb": "PUT",
                              "properties": [
                                 {
                                    "name": "orderId",
                                    "type": "Long",
                                    "isKey": true
                                 }
                              ],
                              "outputEventIds": [
                                 "evt-order-cancelled"
                              ],
                              "actor": "Customer"
                           }
                        },
                        {
                           "actionName": "OrderCreated",
                           "objectType": "Event",
                           "ids": {
                              "aggregateId": "agg-order",
                              "eventId": "evt-order-created"
                           },
                           "args": {
                              "eventName": "OrderCreated",
                              "eventAlias": "Order Created",
                              "properties": [
                                 {
                                    "name": "orderId",
                                    "type": "Long",
                                    "isKey": true
                                 },
                                 {
                                    "name": "productId",
                                    "type": "Long"
                                 },
                                 {
                                    "name": "quantity",
                                    "type": "Integer"
                                 }
                              ],
                              "outputCommandIds": [
                                 {
                                    "commandId": "cmd-update-stock",
                                    "relatedAttribute": "stockQuantity",
                                    "reason": "Update inventory stock level after order creation"
                                 }
                              ]
                           }
                        },
                        {
                           "actionName": "OrderCancelled",
                           "objectType": "Event",
                           "ids": {
                              "aggregateId": "agg-order",
                              "eventId": "evt-order-cancelled"
                           },
                           "args": {
                              "eventName": "OrderCancelled",
                              "eventAlias": "Order Cancelled",
                              "properties": [
                                 {
                                    "name": "orderId",
                                    "type": "Long",
                                    "isKey": true
                                 }
                              ],
                              "outputCommandIds": []
                           }
                        },
                        {
                           "actionName": "GetOrderDetails",
                           "objectType": "ReadModel",
                           "ids": {
                              "aggregateId": "agg-order",
                              "readModelId": "read-order-details"
                           },
                           "args": {
                              "readModelName": "OrderDetails",
                              "readModelAlias": "Order Details View",
                              "isMultipleResult": false,
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
                                    "name": "productReference",
                                    "type": "ProductReference"
                                 },
                                 {
                                    "name": "quantity",
                                    "type": "Integer"
                                 },
                                 {
                                    "name": "shippingAddress",
                                    "type": "ShippingAddress"
                                 },
                                 {
                                    "name": "orderDate",
                                    "type": "Date"
                                 }
                              ],
                              "actor": "Customer"
                           }
                        }
                     ]
                  }
               },
               "step5-evaluateActions": {
                  "thought": "Evaluate the completeness and quality of the generated order management system actions",
                  "reflection": "Consider if all requirements are met and best practices are followed",
                  "result": {
                     "evaluationCriteria": {
                        "requirementsCoverage": {
                           "score": "95",
                           "details": [
                              "Order creation with product reference and shipping details implemented",
                              "Order cancellation functionality provided",
                              "Order details view with cached product information"
                           ],
                           "missingAspects": [
                              "No explicit confirmation flow defined"
                           ]
                        },
                        "domainModelQuality": {
                           "score": "95",
                           "details": [
                              "Clear separation of Aggregate, ValueObject, and Enumeration",
                              "Proper use of ProductReference with foreign key",
                              "Well-defined OrderStatus enumeration"
                           ],
                           "improvements": [
                              "Could consider adding validation rules for quantity"
                           ]
                        },
                        "eventFlowCompleteness": {
                           "score": "90",
                           "details": [
                              "Basic event flow for order creation and cancellation",
                              "Integration with inventory service through UpdateStock",
                              "Product reference caching implemented"
                           ],
                           "gaps": [
                              "No compensation events for failed inventory updates"
                           ]
                        },
                        "bestPracticesAlignment": {
                           "score": "95",
                           "details": [
                              "Commands and events properly named",
                              "Aggregate root identified with proper ID",
                              "Clear actor specification in commands",
                              "Proper foreign key implementation in ProductReference"
                           ],
                           "violations": [
                              "Some properties could have more specific types"
                           ]
                        },
                        "structureAlignment": {
                           "score": "100",
                           "details": [
                              "All elements from suggested structure implemented",
                              "Order aggregate properly created with required properties",
                              "ProductReference implemented with proper foreign key relationship"
                           ],
                           "matchedElements": [
                              {
                                 "suggestedElement": "Order",
                                 "implementedActions": [
                                    "DefineOrderAggregate",
                                    "CreateOrder",
                                    "CancelOrder",
                                    "GetOrderDetails"
                                 ],
                                 "missingAspects": []
                              },
                              {
                                 "suggestedElement": "ShippingAddress",
                                 "implementedActions": [
                                    "DefineShippingAddressVO"
                                 ],
                                 "missingAspects": []
                              },
                              {
                                 "suggestedElement": "ProductReference",
                                 "implementedActions": [
                                    "DefineProductReferenceVO"
                                 ],
                                 "missingAspects": []
                              }
                           ],
                           "unmatchedElements": []
                        }
                     },
                     "overallScore": "95",
                     "recommendedImprovements": [
                        {
                           "area": "Order Processing",
                           "description": "Add explicit order confirmation flow",
                           "suggestedActions": [
                              "CreateConfirmOrderCommand",
                              "AddOrderConfirmedEvent"
                           ]
                        },
                        {
                           "area": "Error Handling",
                           "description": "Implement compensation logic for inventory updates",
                           "suggestedActions": [
                              "AddOrderFailedEvent",
                              "CreateRollbackInventoryCommand"
                           ]
                        }
                     ],
                     "needsIteration": false
                  }
               }
            }
         }
    }

    __buildJsonUserQueryInputFormat() {
        let targetBCRemovedESValue = JSON.parse(JSON.stringify(this.client.input.esValue))
        if(!this.client.input.isAccumulated)
            this._removePrevBoundedContextRelatedElements(this.client.input.targetBoundedContext.name, targetBCRemovedESValue)

        const summarizedESValue = this.esAliasTransManager.transToAliasInSummarizedESValue(
            ESValueSummarizeUtil.getSummarizedESValue(targetBCRemovedESValue)
        )

        let commandIds = []
        for(const boundedContextInfo of Object.values(summarizedESValue)) {
            for(const aggregateInfo of Object.values(boundedContextInfo.aggregates)) {
                for(const commandInfo of aggregateInfo.commands)
                    commandIds.push(commandInfo.id)
            }
        }

        return {
            "Summarized Existing EventStorming Model": JSON.stringify(summarizedESValue),

            "Bounded Context to Generate Actions": this.client.input.targetBoundedContext.name,

            "Functional Requirements": this.client.input.description,

            "Suggested Structure": JSON.stringify(this.client.input.draftOption),

            "Aggregate to create": JSON.stringify(this.client.input.targetAggregate),

            "Final Check": `
* Ensure all user needs are adequately addressed
* Remove any redundant or unnecessary properties
* Write all object name properties in English and alias properties in ${this.preferredLanguage}
* Do not create commands, events, or ReadModels that already exist in another Aggregate.
* Create all ValueObjects and Entities from the user's proposed structure as actions
* Remove any unnecessary actions that recreate existing ValueObjects, Entities, or Enumerations
* Use appropriate data types for all property names
* Ensure each command calls its corresponding event (e.g., CreateOrder > OrderCreated)
* Include sufficient Commands, Events, and ReadModels to fulfill all user requirements
* Try to come up with as many new commands as possible that are not covered by existing commands.
`,

            "Guidelines": `
* When generating an event, it checks to see if the command Id presented can fit in the outputCommandIds.: ${(commandIds && commandIds.length > 0) ? commandIds.join(", ") : "None"}
            `
        }
    }


    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Generating actions for ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`

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
        let actions = returnObj.modelValue.aiOutput.thoughtProcess["step4-generateActions"].result.actions
        let {actions: appliedActions, createdESValue: createdESValue, removedElements: removedElements} = this._getActionAppliedESValue(actions, false)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue,
            removedElements: removedElements,
            callbacks: {
                ...returnObj.modelValue.callbacks,
                addAggregateRelation: (esValue) => {
                    this._addAggregateRelation(this.client.input.draftOption, esValue)
                }
            }
        }
        returnObj.directMessage = `Generating actions for ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`
    }

    _getActionAppliedESValue(actions, isAddFakeActions) {
        actions = this.esAliasTransManager.transToUUIDInActions(actions)
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

                case "Command":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }                            
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
                    break
                }

                case "Enumeration":
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
                
                case "Entity":
                    action.ids = {
                        boundedContextId: targetBoundedContext.id,
                        ...action.ids
                    }
                    action.objectType = "GeneralClass"
                    action.args.generalClassName = action.args.entityName
                    action.args.generalClassAlias = action.args.entityAlias
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
        // 이미 존재하는 Aggregate에 수정을 가하는 액션을 막아서 잠재적인 중복 생성을 방지하기 위해서
        let avaliableAggregateIds = actions.filter(action => action.objectType === "Aggregate")
            .map(action => action.ids.aggregateId)
        actions = actions.filter(action => avaliableAggregateIds.includes(action.ids.aggregateId))

        // 이미 존재하는 Command, Event, ReadModel을 새로 생성하려는 경우 막아서 중복 생성을 방지하기 위해서
        const esNames = Object.values(this.client.input.esValue.elements)
            .filter(element => element && element.name)
            .map(element => element.name)
        const displayNames = Object.values(this.client.input.esValue.elements)
            .filter(element => element && element.displayName)
            .map(element => element.displayName.replaceAll(" ", ""))

        actions = actions.filter(action => {
            // 이미 존재하는 Aggregate에 대한 액션은 제외시켜서 예외적인 상황을 최대한 방지함
            if(action.ids && action.ids.aggregateId) {
                if(this.client.input.esValue.elements[action.ids.aggregateId]) return false
            }

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

    _addAggregateRelation(usedDraftOption, esValue){
        let aggregateRelations = []
        for (const structureInfo of usedDraftOption) {
            for(const valueObject of structureInfo.valueObjects){
                if(valueObject.referencedAggregate)
                    aggregateRelations.push({
                        fromAggregateName: structureInfo.aggregate.name,
                        toAggregateName: valueObject.referencedAggregate.name
                    })
            }
        }

        if(aggregateRelations.length <= 0) return
        aggregateRelations.forEach(relation => {
            const fromAggregate = this.__getAggregateByName(esValue, relation.fromAggregateName)
            const toAggregate = this.__getAggregateByName(esValue, relation.toAggregateName)
            if(!fromAggregate || !toAggregate) return

            const aggregateRelation = ActionsProcessorUtils.getEventStormingRelationObjectBase(fromAggregate, toAggregate)
            console.log("[*] 생성된 관계 추가", {aggregateRelation})
            esValue.relations[aggregateRelation.id] = aggregateRelation
        })
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

module.exports = BCReGenerateCreateActionsGenerator;