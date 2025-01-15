const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");

class PreProcessingFunctionsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["description", "boundedContext"]
        this.progressCheckStrings = ["overviewThoughts", "userStories", "entities", "businessRules", "interfaces"]
    }


    onGenerateBefore(inputParams){
        inputParams.boundedContextDisplayName = inputParams.boundedContext.displayName ? inputParams.boundedContext.displayName : inputParams.boundedContext.name
    }


    __buildAgentRolePrompt(){
        return `You are an expert requirements analyst and domain modeler specializing in structured documentation. Your expertise includes:
- Comprehensive analysis of business requirements and technical specifications
- Converting unstructured requirements into well-organized documentation
- Identifying implicit requirements and their dependencies
- Creating detailed user stories with clear acceptance criteria
- Defining precise entity structures and their relationships
- Documenting business rules and validation constraints
- Designing user interface specifications and interaction flows
- Ensuring traceability between requirements and implementation details
- Balancing between business needs and technical feasibility
- Providing clear rationale for design decisions and trade-offs
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You need to analyse the requirements communicated by the user and put them into a structured format.

Please follow these rules.
1. Make sure you include all of the user's requirements, not just a few.
2. Elicit potentially inferred requirements.
3. Derive what might happen in a chain of events.
4. The reformulated requirements should be clear, with no ambiguity.
5. Do not write comments in the output JSON object.
`
    }

    __buildJsonResponseFormat() {
        return `
{
    "overviewThoughts": {
        "summary": "High-level overview of the entire requirement",
        "details": {
            "domainComplexity": "Assessment of domain complexity and key challenges",
            "stakeholderImpact": "Analysis of impact on different stakeholders",
            "technicalFeasibility": "Evaluation of technical implementation feasibility"
        },
        "additionalConsiderations": "Other important factors not covered in details"
    },

    "result": {
        "userStories": [
            {
                "userStoryThoughts": {
                    "summary": "Analysis of specific user story requirements",
                    "details": {
                        "businessValue": "Assessment of business value and priority",
                        "implementationComplexity": "Evaluation of technical complexity",
                        "userExperience": "Impact on user workflow and satisfaction"
                    },
                    "additionalConsiderations": "Edge cases and special scenarios"
                },

                "title": "<title>",
                "description": "<description>",
                "acceptance": [
                    "<acceptance>"
                ]
            }
        ],
        "entities": {
            "<name>": {
                "entityThoughts": {
                    "summary": "Analysis of entity structure and relationships",
                    "details": {
                        "dataIntegrity": "Considerations for maintaining data consistency",
                        "relationshipComplexity": "Analysis of entity relationships and dependencies",
                        "scalability": "Future growth and performance implications"
                    },
                    "additionalConsiderations": "Special handling requirements and constraints"
                },

                "properties": [
                    {"name": "<name>", "type": "<type>", ["required": <true|false>], ["values": ["<values>"]], ["isPrimaryKey": <true|false>], ["isForeignKey": <true|false>], ["foreignEntity": "<foreignEntity>"]}
                ]
            }
        },
        "businessRules": [
            {
                "businessRulesThoughts": {
                    "summary": "Analysis of business rule implications",
                    "details": {
                        "validationComplexity": "Complexity of rule validation logic",
                        "businessImpact": "Impact on business processes",
                        "maintainability": "Long-term maintenance considerations"
                    },
                    "additionalConsiderations": "Exception handling and special cases"
                },

                "name": "<name>",
                "description": "<description>"
            }
        ],
        "interfaces": {
            "<name>": {
                "interfaceThoughts": {
                    "summary": "Analysis of interface design and interactions",
                    "details": {
                        "usability": "User interaction and accessibility considerations",
                        "dataFlow": "Data movement and processing requirements",
                        "responsiveness": "Performance and response time requirements"
                    },
                    "additionalConsiderations": "Integration points and external dependencies"
                },

                "sections": [
                    {
                        "name": "<name>",
                        "type": "table",
                        "fields": [{"name": "<name>", "type": "<type>", ["required": <true|false>]}],
                        "actions": ["<actions>"],
                        "filters": ["<filters>"],
                        "resultTable": {
                            "columns": ["<columns>"],
                            "actions": ["<actions>"]
                        }
                    }
                ]
            }
        }
    }
}`
    }

    __buildJsonExampleInputFormat() {
        return {
            "description": `We need to create two screens for hotel room reservations: a 'Room Booking' screen and a 'Reservation Status' screen.

The 'Room Booking' screen should be divided into guest information and booking details sections. The guest information section should display name, guest ID, membership level (standard/VIP), phone number, email, and current active bookings. The booking details section should include room type, check-in date, check-out date, number of guests, meal plan, and special requests. Room type should be searchable with a magnifying glass button that opens a room search popup. Check-in and check-out dates must be selected from a calendar. Number of guests should be input as a number. Meal plan should be selectable from a dropdown menu with options for 'No Meal', 'Breakfast Only', 'Half Board', or 'Full Board'. Special requests is optional, but all other fields are required for the booking button to be activated.

The 'Reservation Status' screen should show all booking history for guests. It should have filters for date range and booking status. Date range should be selectable in YYYY.MM.DD format. Status should be filterable through a dropdown with options for All/Active/Completed/Cancelled. Results should be displayed in a table showing booking number, room type, check-in date, check-out date, total amount, and status. Clicking a row should show detailed information in a popup, and active bookings should have options for modification or cancellation.`
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "overviewThoughts": {
                "summary": "A hotel reservation system requiring guest management and booking functionality with two main interfaces",
                "details": {
                    "domainComplexity": "Medium complexity with interconnected booking and guest management processes",
                    "stakeholderImpact": "Affects hotel staff, guests, and management with different access needs and workflows",
                    "technicalFeasibility": "Implementable with standard web technologies and database systems"
                },
                "additionalConsiderations": "Need for real-time availability updates and concurrent booking handling"
            },
            "result": {
                "userStories": [
                    {
                        "userStoryThoughts": {
                            "summary": "Core booking functionality for hotel guests",
                            "details": {
                                "businessValue": "High priority - direct impact on revenue generation",
                                "implementationComplexity": "Medium - requires multiple form validations and real-time checks",
                                "userExperience": "Must be intuitive and efficient for guests"
                            },
                            "additionalConsiderations": "Handle edge cases like last-minute bookings and VIP priorities"
                        },
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
                        "userStoryThoughts": {
                            "summary": "Reservation management functionality",
                            "details": {
                                "businessValue": "High - enables self-service and reduces staff workload",
                                "implementationComplexity": "Medium - requires status tracking and modification handling",
                                "userExperience": "Must provide clear visibility of booking status and actions"
                            },
                            "additionalConsiderations": "Consider cancellation policies and modification restrictions"
                        },
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
                        "entityThoughts": {
                            "summary": "Core entity for guest information management",
                            "details": {
                                "dataIntegrity": "Must maintain accurate guest profiles and prevent duplicates",
                                "relationshipComplexity": "One-to-many relationship with bookings",
                                "scalability": "Consider future guest profile extensions"
                            },
                            "additionalConsiderations": "Privacy and data protection requirements"
                        },
                        "properties": [
                            {"name": "guestId", "type": "string", "required": true, "isPrimaryKey": true},
                            {"name": "name", "type": "string", "required": true},
                            {"name": "membershipLevel", "type": "enum", "required": true, "values": ["standard", "VIP"]},
                            {"name": "phoneNumber", "type": "string", "required": true},
                            {"name": "email", "type": "string", "required": true}
                        ]
                    },
                    "Booking": {
                        "entityThoughts": {
                            "summary": "Central entity for reservation management",
                            "details": {
                                "dataIntegrity": "Must maintain booking consistency and prevent conflicts",
                                "relationshipComplexity": "Connected to guests and room inventory",
                                "scalability": "Consider high volume of historical bookings"
                            },
                            "additionalConsiderations": "Audit trail requirements for modifications"
                        },
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
                        "businessRulesThoughts": {
                            "summary": "Fundamental booking validation rule",
                            "details": {
                                "validationComplexity": "Simple date comparison",
                                "businessImpact": "Critical for preventing invalid bookings",
                                "maintainability": "Easy to maintain and modify"
                            },
                            "additionalConsiderations": "Consider timezone implications"
                        },
                        "name": "ValidBookingDates",
                        "description": "Check-out date must be after check-in date"
                    },
                    {
                        "businessRulesThoughts": {
                            "summary": "Data completeness rule",
                            "details": {
                                "validationComplexity": "Simple field presence check",
                                "businessImpact": "Ensures complete booking information",
                                "maintainability": "Low maintenance needed"
                            },
                            "additionalConsiderations": "Consider field dependency rules"
                        },
                        "name": "RequiredFields",
                        "description": "All fields except special requests are mandatory for booking"
                    },
                    {
                        "businessRulesThoughts": {
                            "summary": "Booking modification control",
                            "details": {
                                "validationComplexity": "Simple status check",
                                "businessImpact": "Prevents invalid modifications",
                                "maintainability": "May need updates for new statuses"
                            },
                            "additionalConsiderations": "Consider grace periods for modifications"
                        },
                        "name": "ActiveBookingModification",
                        "description": "Only active bookings can be modified or cancelled"
                    }
                ],
                "interfaces": {
                    "RoomBooking": {
                        "interfaceThoughts": {
                            "summary": "Primary booking interface for guests",
                            "details": {
                                "usability": "Must be intuitive with clear section organization",
                                "dataFlow": "Sequential form submission with validation",
                                "responsiveness": "Quick response for room availability checks"
                            },
                            "additionalConsiderations": "Mobile-friendly layout requirements"
                        },
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
                        "interfaceThoughts": {
                            "summary": "Booking management interface",
                            "details": {
                                "usability": "Easy filtering and clear status display",
                                "dataFlow": "Real-time status updates",
                                "responsiveness": "Quick loading of booking history"
                            },
                            "additionalConsiderations": "Pagination for large booking histories"
                        },
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
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "description": this.client.input.description
        }
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        returnObj.modelValue.output = returnObj.modelValue.aiOutput.result
        this._removeThoughts(returnObj.modelValue.output)
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    _removeThoughts(output) {
        if (output.userStories) {
            output.userStories.forEach(story => {
                delete story.userStoryThoughts;
            });
        }

        if (output.entities) {
            Object.values(output.entities).forEach(entity => {
                delete entity.entityThoughts;
            });
        }

        if (output.businessRules) {
            output.businessRules.forEach(rule => {
                delete rule.businessRulesThoughts;
            });
        }

        if (output.interfaces) {
            Object.values(output.interfaces).forEach(inter => {
                delete inter.interfaceThoughts;
            });
        }
    }
}

module.exports = PreProcessingFunctionsGenerator;