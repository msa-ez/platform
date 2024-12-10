const FormattedJSONAIGenerator = require("../FormattedJSONAIGenerator");

class PreProcessingFunctionsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["description", "boundedContext"]
        this.progressCheckStrings = ["thoughts", "inference", "reflection", "userStories", "entities", "businessRules", "interfaces"]
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
    // Based on the requirements analysis, here are the key considerations and design decisions
    "thoughts": {
        "summary": "<overall analysis of the requirements and key design considerations>",
        "details": {
            "coreDomainConcepts": "<core domain concepts identified>",
            "aggregateBoundaries": "<potential aggregate boundaries>",
            "dataConsistency": "<data consistency requirements>",
            "businessProcesses": "<business process flows>"
        },
        "additionalConsiderations": "<any additional technical constraints, limitations, or important considerations>"
    },

    // From the given requirements, we can infer additional aspects
    "inference": {
        "summary": "<overall summary of inferred requirements and implications>",
        "details": {
            "implicitRules": "<implicit business rules not directly stated>",
            "edgeCases": "<potential edge cases and exceptions>",
            "validations": "<required validations and constraints>",
            "integrations": "<integration points and system interactions>"
        },
        "additionalInferences": "<any additional inferred requirements or considerations not covered above>"
    },

    // Reflecting on the design decisions and potential improvements
    "reflection": {
        "summary": "<overall reflection on the design approach and decisions>",
        "details": {
            "risks": "<potential risks and mitigation strategies>",
            "improvements": "<suggested improvements and recommendations>",
            "clarifications": "<areas that need further clarification>",
            "futureConsiderations": "<extensibility and future enhancement possibilities>"
        },
        "additionalReflections": "<any additional insights, concerns, or recommendations>"
    },

    "result": {
        "userStories": [
            {
                "title": "<title>",
                "description": "<description>",
                "acceptance": [
                    "<acceptance>"
                ]
            }
        ],
        "entities": {
            "<name>": {
                "properties": [
                    {"name": "<name>", "type": "<type>", ["required": <true|false>], ["values": ["<values>"]], ["isPrimaryKey": <true|false>], ["isForeignKey": <true|false>], ["foreignEntity": "<foreignEntity>"]}
                ]
            }
        },
        "businessRules": [
            {
                "name": "<name>",
                "description": "<description>"
            }
        ],
        "interfaces": {
            "<name>": {
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
            "thoughts": {
                "summary": "The hotel reservation system requires two main interfaces: Room Booking and Reservation Status. The system needs to handle guest information, booking management, and reservation tracking with various validation rules and user interactions.",
                "details": {
                    "coreDomainConcepts": "Guest Management, Room Booking, Reservation Status Tracking, Meal Plan Management",
                    "aggregateBoundaries": "Guest Aggregate (guest information and membership), Booking Aggregate (reservation details and status)",
                    "dataConsistency": "Booking dates validation, Room availability checking, Real-time status updates",
                    "businessProcesses": "Room booking process, Reservation modification workflow, Cancellation handling"
                },
                "additionalConsiderations": "Need to ensure real-time room availability, handle concurrent bookings, and maintain booking history"
            },
            "inference": {
                "summary": "Several implicit requirements and business rules can be derived from the specifications",
                "details": {
                    "implicitRules": "Room availability check before booking, Minimum/Maximum stay duration, Guest capacity limits per room",
                    "edgeCases": "Last-minute cancellations, Overlapping booking modifications, VIP priority handling",
                    "validations": "Check-out date must be after check-in date, Guest count validation against room capacity",
                    "integrations": "Calendar system integration, Room inventory system, Payment processing system"
                },
                "additionalInferences": "Need for notification system for booking confirmations and status changes"
            },
            "reflection": {
                "summary": "The design focuses on user-friendly booking process while maintaining robust booking management",
                "details": {
                    "risks": "Concurrent booking conflicts, Data consistency in status updates, Session management for booking process",
                    "improvements": "Add payment integration, Implement notification system, Add booking confirmation step",
                    "clarifications": "Cancellation policy details, Modification time limits, VIP privileges specification",
                    "futureConsiderations": "Mobile responsiveness, Multi-language support, Integration with external booking platforms"
                },
                "additionalReflections": "Consider implementing caching for room availability and booking history"
            },
            "result": {
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
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "description": this.client.input.description
        }
    }


    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        returnObj.modelValue.output = returnObj.modelValue.aiOutput.result
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContext.name} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }
}

module.exports = PreProcessingFunctionsGenerator;