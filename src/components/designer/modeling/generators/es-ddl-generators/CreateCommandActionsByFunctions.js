
const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");
const ESActionsUtil = require("./modules/ESActionsUtil")
const ESFakeActionsUtil = require("./modules/ESFakeActionsUtil")
const ESValueSummarizeWithFilterUtil = require("./modules/ESValueSummarizeWithFilterUtil")
const ESAliasTransManager = require("./modules/ESAliasTransManager")

class CreateCommandActionsByFunctions extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["targetBoundedContext", "targetAggregate", "description", "esValue", "userInfo", "information"]
        this.progressCheckStrings = ["thoughts", "inference", "reflection", "result"]
    }


    onGenerateBefore(inputParams){
        inputParams.esValue = JSON.parse(JSON.stringify(inputParams.esValue))
        inputParams.aggregateDisplayName = inputParams.targetAggregate.displayName ? inputParams.targetAggregate.displayName : inputParams.targetAggregate.name
        this.esAliasTransManager = new ESAliasTransManager(inputParams.esValue)
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
   - Predefined complex types: Address, Portrait, Rating, Money, Email
   - Collection types: List<Type>, Set<Type>
   - Custom types must be defined as Enumeration, ValueObject, or Entity within the Aggregate
2. Avoid using String type when a more specific type exists (e.g., use Date for dates, Integer for counts)
3. For arrays/collections, always use List<Type> format (e.g., List<Address>, List<OrderItem>)

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

    __buildRequestFormatPrompt(){
        return ESValueSummarizeWithFilterUtil.getGuidePrompt()
    }

    __buildJsonResponseFormat() {
        return `
{
    "overviewThoughts": {
        "summary": "High-level overview of the entire action set being generated",
        "details": {
            "businessAlignment": "How the actions align with business requirements and domain model",
            "architecturalConsiderations": "Key architectural decisions and patterns being applied",
            "dataFlowAnalysis": "How data flows between commands, events, and read models"
        },
        "additionalConsiderations": "Any cross-cutting concerns or future considerations"
    },

    "result": {
        "actions": [
            {
                "actionThoughts": {
                    "summary": "Specific reasoning for this particular action",
                    "details": {
                        "businessRules": "Business rules and validations specific to this action",
                        "stateTransitions": "How this action affects aggregate state",
                        "eventFlow": "Event sourcing considerations and event flow"
                    },
                    "additionalConsiderations": "Action-specific edge cases or special handling"
                },

                // Write the ActionName that you utilized in the previous steps
                "actionName": "<actionName>",

                // This attribute indicates what type of object information is being modified.
                // Choose one from Command, Event, ReadModel
                "objectType": "<objectType>",

                // This attribute contains the ID information of the object on which the action is performed.
                "ids": {
                    "<idName>": "<idValue>"
                },

                // This attribute contains the parameters required for the action.
                "args": {
                    "<argName>": "<argValue>",

                    "propertyThoughts": {
                        "summary": "Property-level design considerations",
                        "details": {
                            "dataValidation": "Validation rules and constraints for properties",
                            "typeSelection": "Reasoning for chosen data types and structures",
                            "domainAlignment": "How properties reflect domain concepts"
                        },
                        "additionalConsiderations": "Property-specific concerns or future extensibility"
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
        "api_verb": <"POST" | "PUT" | "PATCH" | "DELETE">,

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
        ]
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
`
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
                                        "type": "Money"
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
                                                "name": "email",
                                                "type": "Email"
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
                                        "type": "Money"
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
            "overviewThoughts": {
                "summary": "Creating a complete hotel booking management system with commands, events, and read models",
                "details": {
                    "businessAlignment": "Implements core booking operations including creation, confirmation, and cancellation while maintaining guest and room management",
                    "architecturalConsiderations": "Uses CQRS pattern with separate command and query models, event sourcing for state changes, and read models for efficient querying",
                    "dataFlowAnalysis": "Commands trigger state changes, events capture those changes, and read models provide optimized views of the data"
                },
                "additionalConsiderations": "System needs to handle concurrent bookings, maintain data consistency, and support future extensions like payment integration"
            },
            "result": {
                "actions": [
                    {
                        "actionThoughts": {
                            "summary": "Implementing initial booking creation with all necessary guest and room details",
                            "details": {
                                "businessRules": "Validates guest information, room availability, and booking dates",
                                "stateTransitions": "Creates new booking record in PENDING status",
                                "eventFlow": "Triggers BookingCreated event for downstream processing"
                            },
                            "additionalConsiderations": "Must handle concurrent booking attempts for same room"
                        },
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
                            "propertyThoughts": {
                                "summary": "Capturing essential booking information",
                                "details": {
                                    "dataValidation": "All required fields must be present and valid",
                                    "typeSelection": "Using appropriate types for dates and IDs",
                                    "domainAlignment": "Properties reflect core booking concepts"
                                },
                                "additionalConsiderations": "May need to add more fields for future requirements"
                            },
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
                        "actionThoughts": {
                            "summary": "Recording the successful creation of a new booking",
                            "details": {
                                "businessRules": "Captures complete initial booking state",
                                "stateTransitions": "Establishes initial booking record",
                                "eventFlow": "May trigger notifications or inventory updates"
                            },
                            "additionalConsiderations": "Event should contain all data needed for replay"
                        },
                        "actionName": "BookingCreatedEvent",
                        "objectType": "Event",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "eventId": "evt-booking-created"
                        },
                        "args": {
                            "eventName": "BookingCreated",
                            "eventAlias": "Booking Created",
                            "propertyThoughts": {
                                "summary": "Storing complete booking state",
                                "details": {
                                    "dataValidation": "All fields must be populated correctly",
                                    "typeSelection": "Using domain-specific types where appropriate",
                                    "domainAlignment": "Reflects complete booking state"
                                },
                                "additionalConsiderations": "Important for event sourcing replay"
                            },
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
                                    "type": "Money"
                                }
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Handling booking confirmation after payment",
                            "details": {
                                "businessRules": "Validates payment completion",
                                "stateTransitions": "Updates booking status to CONFIRMED",
                                "eventFlow": "Triggers confirmation notifications"
                            },
                            "additionalConsiderations": "Must handle failed payment scenarios"
                        },
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
                            "propertyThoughts": {
                                "summary": "Minimal data needed for confirmation",
                                "details": {
                                    "dataValidation": "Payment ID must be valid",
                                    "typeSelection": "Simple types for confirmation",
                                    "domainAlignment": "Focuses on confirmation action"
                                },
                                "additionalConsiderations": "May need additional payment details"
                            },
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
                        "actionThoughts": {
                            "summary": "Recording successful booking confirmation",
                            "details": {
                                "businessRules": "Captures payment and confirmation details",
                                "stateTransitions": "Finalizes booking confirmation",
                                "eventFlow": "May trigger guest notifications"
                            },
                            "additionalConsiderations": "Important for audit trail"
                        },
                        "actionName": "BookingConfirmedEvent",
                        "objectType": "Event",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "eventId": "evt-booking-confirmed"
                        },
                        "args": {
                            "eventName": "BookingConfirmed",
                            "eventAlias": "Booking Confirmed",
                            "propertyThoughts": {
                                "summary": "Recording confirmation details",
                                "details": {
                                    "dataValidation": "All confirmation data must be valid",
                                    "typeSelection": "Appropriate types for tracking",
                                    "domainAlignment": "Captures confirmation state"
                                },
                                "additionalConsiderations": "Important for payment reconciliation"
                            },
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
                        "actionThoughts": {
                            "summary": "Processing booking cancellation request",
                            "details": {
                                "businessRules": "Validates cancellation eligibility",
                                "stateTransitions": "Updates status to CANCELLED",
                                "eventFlow": "Triggers refund process if applicable"
                            },
                            "additionalConsiderations": "Must handle refund policies"
                        },
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
                            "propertyThoughts": {
                                "summary": "Capturing cancellation details",
                                "details": {
                                    "dataValidation": "Reason must be provided",
                                    "typeSelection": "Simple types for cancellation",
                                    "domainAlignment": "Focuses on cancellation process"
                                },
                                "additionalConsiderations": "May need cancellation policy reference"
                            },
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
                    },
                    {
                        "actionThoughts": {
                            "summary": "Recording booking cancellation details",
                            "details": {
                                "businessRules": "Captures cancellation and refund information",
                                "stateTransitions": "Finalizes cancellation state",
                                "eventFlow": "May trigger room availability update"
                            },
                            "additionalConsiderations": "Important for cancellation analytics"
                        },
                        "actionName": "BookingCancelledEvent",
                        "objectType": "Event",
                        "ids": {
                            "aggregateId": "agg-booking",
                            "eventId": "evt-booking-cancelled"
                        },
                        "args": {
                            "eventName": "BookingCancelled",
                            "eventAlias": "Booking Cancelled",
                            "propertyThoughts": {
                                "summary": "Recording complete cancellation state",
                                "details": {
                                    "dataValidation": "All cancellation details must be valid",
                                    "typeSelection": "Appropriate types for tracking",
                                    "domainAlignment": "Reflects cancellation state"
                                },
                                "additionalConsiderations": "Important for refund tracking"
                            },
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
                                    "type": "Money"
                                }
                            ]
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Providing booking list view for users",
                            "details": {
                                "businessRules": "Shows relevant booking information",
                                "stateTransitions": "Read-only view",
                                "eventFlow": "Updated by booking events"
                            },
                            "additionalConsiderations": "Must be optimized for listing"
                        },
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
                            "propertyThoughts": {
                                "summary": "Optimized for listing view",
                                "details": {
                                    "dataValidation": "Derived from verified events",
                                    "typeSelection": "Efficient types for querying",
                                    "domainAlignment": "Shows key booking information"
                                },
                                "additionalConsiderations": "May need pagination support"
                            },
                            "properties": [
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
                                    "type": "Money"
                                }
                            ],
                            "actor": "Guest"
                        }
                    },
                    {
                        "actionThoughts": {
                            "summary": "Providing detailed booking information",
                            "details": {
                                "businessRules": "Shows complete booking details",
                                "stateTransitions": "Read-only view",
                                "eventFlow": "Updated by all booking events"
                            },
                            "additionalConsiderations": "Must handle complex relationships"
                        },
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
                            "propertyThoughts": {
                                "summary": "Comprehensive booking view",
                                "details": {
                                    "dataValidation": "Maintains referential integrity",
                                    "typeSelection": "Complex types for complete info",
                                    "domainAlignment": "Full booking context"
                                },
                                "additionalConsiderations": "May need lazy loading"
                            },
                            "properties": [
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
        const summarizedESValue = ESValueSummarizeWithFilterUtil.getSummarizedESValue(
            JSON.parse(JSON.stringify(this.client.input.esValue)), [], this.esAliasTransManager
        )

        return {
            "Summarized Existing EventStorming Model": JSON.stringify(summarizedESValue),

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


    onCreateModelGenerating(returnObj){
        returnObj.directMessage = `Generating commands for ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`

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
        let actions = returnObj.modelValue.aiOutput.result.actions
        let {actions: appliedActions, createdESValue: createdESValue} = this._getActionAppliedESValue(actions, false)

        returnObj.modelValue = {
            ...returnObj.modelValue,
            actions: appliedActions,
            createdESValue: createdESValue
        }
        returnObj.directMessage = `Generating commands for ${this.client.input.aggregateDisplayName} Aggregate... (${returnObj.modelRawValue.length} characters generated)`
    }

    _getActionAppliedESValue(actions, isAddFakeActions) {
        actions = this.esAliasTransManager.transToUUIDInActions(actions)
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