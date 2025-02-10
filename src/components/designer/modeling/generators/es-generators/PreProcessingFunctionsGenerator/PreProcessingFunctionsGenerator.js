const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class PreProcessingFunctionsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.checkInputParamsKeys = ["description", "boundedContext"]
        this.progressCheckStrings = ["inference", "userStories", "entities", "businessRules", "interfaces"]
        this.response_format = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    userStories: z.array(
                        z.object({
                            title: z.string(),
                            description: z.string(),
                            acceptance: z.array(z.string())
                        }).strict()
                    ),
                    entities: z.record(
                        z.object({
                            properties: z.array(
                                z.object({
                                    name: z.string(),
                                    type: z.string(),
                                    required: z.boolean(),
                                    isPrimaryKey: z.boolean(),
                                    isForeignKey: z.boolean(),
                                    foreignEntity: z.string(),
                                    values: z.array(z.string())
                                }).strict()
                            )
                        }).strict()
                    ),
                    businessRules: z.array(
                        z.object({
                            name: z.string(),
                            description: z.string()
                        }).strict()
                    ),
                    interfaces: z.record(
                        z.object({
                            sections: z.array(
                                z.object({
                                    name: z.string(),
                                    type: z.enum(["form", "table"]),
                                    fields: z.array(
                                        z.object({
                                            name: z.string(),
                                            type: z.string(),
                                            required: z.boolean()
                                        }).strict()
                                    ),
                                    actions: z.array(z.string()),
                                    filters: z.array(z.string()),
                                    resultTable: z.object({
                                        columns: z.array(z.string()),
                                        actions: z.array(z.string())
                                    })
                                }).strict()
                            )
                        }).strict()
                    )
                }).strict()
            }).strict(),
            "instruction",
            ["entities", "interfaces"]
        )
    }


    onGenerateBefore(inputParams){
        inputParams.boundedContextDisplayName = inputParams.boundedContext.displayName ? inputParams.boundedContext.displayName : inputParams.boundedContext.name
        inputParams.subjectText = `Analysing user requirements for ${inputParams.boundedContextDisplayName} Bounded Context`
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
        return `You are tasked with thoroughly analyzing the user's requirements and converting them into a structured, unambiguous output. Follow these detailed guidelines to ensure a high-quality result:

1. Comprehensive Analysis:
   - Capture all explicit requirements provided by the user.
   - Identify and include any implicit or inferred requirements.
   - Consider dependencies and potential chain of events resulting from the requirements.

2. Clarity & Precision:
   - Reformulate the user input to eliminate ambiguities.
   - Use precise language to clearly define the scope and expectations.

3. Structured Formatting:
   - Ensure the output strictly adheres to the specified JSON format without any extra commentary.
   - Organize the data into clearly defined sections (user stories, entities, business rules, interfaces).

4. Validation & Completeness:
   - Validate that all necessary fields and logical connections between requirements are addressed.
   - Recheck for missed details or potential edge cases common to similar use cases.

5. Inference & Justification:
   - When inferring additional requirements, base them on logical assumptions and common practices for similar domains.
   - Ensure that the inferred requirements are clearly justified by the provided information.

6. Quality Assurance:
   - Review the final structured output for consistency and completeness.
   - Avoid including any internal comments or chain-of-thought details in the JSON result.

By meticulously following these guidelines, you will create a clear, comprehensive, and high-quality representation of the user's requirements.
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The process of reasoning should be directly related to the output result, not a reference to a general strategy.
2. Thoroughly analyze all the provided user requirements, focusing on both explicit details and any implicit or inferred needs.
3. Evaluate the overall context, considering domain complexity, stakeholder impact, and technical feasibility.
4. For each functional area (overview, user stories, entities, business rules, interfaces), ensure that all necessary details are captured and potential edge cases are addressed.
        `;
    }

    __buildJsonResponseFormat() {
        return `
{
    "inference": "<inference>",
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
                    {
                        "name": "<name>",
                        "type": "<type>", 
                        "required?": <true|false>,
                        "isPrimaryKey?": <true|false>,
                        "isForeignKey?": <true|false>,
                        "foreignEntity?": "<foreignEntity>",
                        "values?": ["<values>"]
                    }
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
                        "type": "<form|table>",
                        "fields": [
                            {
                                "name": "<name>",
                                "type": "<type>",
                                "required?": <true|false>
                            }
                        ],
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
            "inference": `The analysis of the provided requirements indicates the necessity for two distinct functionalities: the "Room Booking" interface and the "Reservation Status" interface. For the Room Booking screen, explicit requirements focus on gathering guest details and booking specifics with precise validations—such as mandatory fields, a searchable room type input, calendar-based date selections, and dropdown options for meal plans. Implicit requirements include dynamic interaction behaviors, like conditionally enabling the booking action only when every required field is correctly completed, and ensuring consistency in data inputs (e.g., valid check-in/check-out dates). Meanwhile, the Reservation Status screen is expected to present a historical view of bookings with filtering capabilities by date range and status, alongside interactive elements such as detailed view pop-ups and options for modifying or cancelling active bookings. This inference succinctly encapsulates both the clear, explicit directives and the inferred, context-driven needs, ensuring that the output comprehensively addresses user stories, entity definitions, business rules, and interface specifications while aligning with stakeholder expectations and technical feasibility.`,
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
        this._makeOutputs(returnObj)
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        this._makeOutputs(returnObj)
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContextDisplayName} Bounded Context... (${returnObj.modelRawValue.length} characters generated)`
    }

    _makeOutputs(returnObj) {
        if(returnObj.modelValue.aiOutput.inference) {
            returnObj.modelValue.inference = returnObj.modelValue.aiOutput.inference
            returnObj.modelValue.analysisResult = {
                inference: returnObj.modelValue.aiOutput.inference
            }
        }


        if(returnObj.modelValue.aiOutput.result) {
            const output = structuredClone(returnObj.modelValue.aiOutput.result)
            this._removeUnnecessaryFields(output)
    
            returnObj.modelValue.output = output
            returnObj.modelValue.analysisResult = {
                ...output,
                inference: returnObj.modelValue.inference ? returnObj.modelValue.inference : ""
            }
        }
    }

    _removeUnnecessaryFields(output) {
        if (output.entities) {
            Object.keys(output.entities).forEach(entityKey => {
                const entity = output.entities[entityKey];
                if (entity.properties && Array.isArray(entity.properties)) {
                    entity.properties.forEach(property => {
                        if (property.hasOwnProperty('required') && property.required === false) {
                            delete property.required;
                        }
                        if (property.hasOwnProperty('isPrimaryKey') && property.isPrimaryKey === false) {
                            delete property.isPrimaryKey;
                        }
                        if (property.hasOwnProperty('isForeignKey') && property.isForeignKey === false) {
                            delete property.isForeignKey;
                        }
                        if (property.hasOwnProperty('foreignEntity') && property.foreignEntity === "") {
                            delete property.foreignEntity;
                        }
                        if (property.hasOwnProperty('values') && Array.isArray(property.values) && property.values.length === 0) {
                            delete property.values;
                        }
                    });
                }
            });
        }

        if (output.interfaces) {
            Object.keys(output.interfaces).forEach(interfaceKey => {
                const interfaceObj = output.interfaces[interfaceKey];
                if (interfaceObj.sections && Array.isArray(interfaceObj.sections)) {
                    interfaceObj.sections.forEach(section => {
                        if (section.fields && Array.isArray(section.fields)) {
                            section.fields.forEach(field => {
                                if (field.hasOwnProperty('required') && field.required === false) {
                                    delete field.required;
                                }
                            });
                        }
                    });
                }
            });
        }
    }
}

module.exports = PreProcessingFunctionsGenerator;