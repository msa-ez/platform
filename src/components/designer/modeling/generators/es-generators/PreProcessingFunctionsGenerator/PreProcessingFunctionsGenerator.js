const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class PreProcessingFunctionsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.generatorName = "PreProcessingFunctionsGenerator"
        this.checkInputParamsKeys = ["description", "boundedContext"]
        this.progressCheckStrings = ["inference", "userStories", "entities", "businessRules", "interfaces", "events"]

        this.initialResponseFormat = zodResponseFormat(
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
                    ),
                    events: z.array(
                        z.object({
                            name: z.string(),
                            description: z.string(),
                            displayName: z.string()
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
        return `You are a Senior Requirements Engineer and Domain Modeling Expert with over 15 years of experience in enterprise software architecture. Your specialized expertise includes:
- Transforming ambiguous business requirements into precise, actionable documentation
- Applying systematic domain-driven design principles to complex business domains
- Extracting implicit requirements and identifying critical dependencies that stakeholders often overlook
- Crafting comprehensive user stories with measurable acceptance criteria that align with business goals
- Modeling robust entity structures with clear relationships, constraints, and validation rules
- Formulating business rules that accurately reflect organizational policies and regulatory requirements
- Designing intuitive user interfaces that balance user experience with functional requirements
- Establishing clear traceability matrices between requirements, implementation components, and testing artifacts
- Optimizing the balance between business value delivery and technical feasibility/sustainability
- Providing evidence-based rationales for architectural decisions with cost-benefit analyses
- Standardizing complex requirements into structured, machine-processable formats for automated implementation
`
    }

    __buildTaskGuidelinesPrompt(){
        return `You are tasked with analyzing the user requirements and converting them into a structured, unambiguous output. Please follow the detailed guidelines below to ensure a comprehensive and high-quality result:

1. Comprehensive Analysis:
   - Capture all explicit requirements provided by the user.
   - Identify and include any implicit or inferred requirements.
   - Consider dependencies and potential chain reactions arising from the requirements.

2. Clarity & Precision:
   - Restate the user input with precise language to eliminate ambiguities.
   - Clearly define the scope, expectations, and validation rules.

3. Structured Formatting:
   - Produce the output strictly in the specified JSON format without any additional commentary.
   - Organize the data into clearly defined sections such as user stories, entities, business rules, interfaces, and events.

4. Entities Definition:
   - For each entity's property, specify the data type. Use Java's basic data types (e.g., String, Long, Integer, Double, Boolean, Date) or define an enum when appropriate.
   - If an enum is used, list the possible values in the "values" field.

5. Interfaces Specification:
   - Within each interface's sections, for the fields configuration, enumerate appropriate field types (e.g., text, select, option, date, password, textarea, number, etc.).
   - Ensure that the field types accurately capture the intended method of user input.

6. Validation & Completeness:
   - Confirm that all mandatory fields and logical relationships between requirements are thoroughly addressed.
   - Recheck for any overlooked details or potential edge cases common to similar use cases.

7. Inference & Justification:
   - When inferring additional requirements, base them on logical assumptions and industry best practices.
   - Provide clear justification for all inferred elements based on the supplied information.

8. Quality Assurance:
   - Review the final output for consistency, clarity, and completeness.
   - Do not include internal commentary or chain-of-thought explanations in the JSON result.

By following these guidelines meticulously, you will deliver a robust, clear, and comprehensive representation of the user’s requirements.
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. The reasoning process must be directly related to producing the output result without referencing a general strategy.
2. Thoroughly analyze all provided user requirements, capturing both explicit details and any implicit or inferred needs.
3. Evaluate the overall context by taking into account domain complexity, stakeholder impact, and technical feasibility.
4. For each functional area (overview, user stories, entities, business rules, interfaces, events), ensure that all necessary details and potential edge cases are addressed.
5. When analyzing entity definitions, verify that each property's data type is specified using Java's basic types (e.g., int, double, boolean, String) or an enum where suitable, with enum options clearly listed in the "values" field.
6. In interface specifications, confirm that each section’s fields clearly state the input type (e.g., text, select, option, date, password, textarea, number, etc.) to accurately reflect the intended user input.
`
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
        },
        "events": [
            {
                "name": "<name>",
                "description": "<description>",
                "displayName": "<displayName>"
            }
        ]
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
            "inference": "Based on the provided requirements for hotel room reservation, two screens are necessary. The Room Booking screen enables guests to enter and submit detailed personal and booking information, ensuring mandatory fields are filled. The Reservation Status screen displays historical booking data with filtering options for date and status, allowing for modifications and cancellations.",
            "result": {
                "userStories": [
                    {
                        "title": "Room Booking",
                        "description": "As a guest, I want to book a hotel room by providing my personal and booking details, so that I can secure a reservation.",
                        "acceptance": [
                            "Guest and booking details are separated into distinct sections.",
                            "All required fields are validated before enabling booking.",
                            "Room type can be searched using a magnifying glass icon.",
                            "Check-in and check-out dates are selected via a calendar."
                        ]
                    },
                    {
                        "title": "Reservation Status",
                        "description": "As a guest, I want to view my booking history with options to filter by date and status, so that I can track my reservations.",
                        "acceptance": [
                            "The booking history is displayed in a table.",
                            "Filters for date range and booking status are available.",
                            "Clicking a row shows detailed booking information.",
                            "Active bookings provide options for modification or cancellation."
                        ]
                    }
                ],
                "entities": {
                    "Guest": {
                        "properties": [
                            {
                                "name": "name",
                                "type": "String",
                                "required": true
                            },
                            {
                                "name": "guestId",
                                "type": "String",
                                "required": true,
                                "isPrimaryKey": true
                            },
                            {
                                "name": "membershipLevel",
                                "type": "enum",
                                "required": true,
                                "values": ["standard", "VIP"]
                            },
                            {
                                "name": "phoneNumber",
                                "type": "String",
                                "required": true
                            },
                            {
                                "name": "email",
                                "type": "String",
                                "required": true
                            },
                            {
                                "name": "activeBookings",
                                "type": "Integer",
                                "required": false
                            }
                        ]
                    },
                    "Booking": {
                        "properties": [
                            {
                                "name": "bookingNumber",
                                "type": "String",
                                "required": true,
                                "isPrimaryKey": true
                            },
                            {
                                "name": "roomType",
                                "type": "String",
                                "required": true
                            },
                            {
                                "name": "checkInDate",
                                "type": "Date",
                                "required": true
                            },
                            {
                                "name": "checkOutDate",
                                "type": "Date",
                                "required": true
                            },
                            {
                                "name": "numberOfGuests",
                                "type": "Integer",
                                "required": true
                            },
                            {
                                "name": "mealPlan",
                                "type": "enum",
                                "required": true,
                                "values": ["No Meal", "Breakfast Only", "Half Board", "Full Board"]
                            },
                            {
                                "name": "specialRequests",
                                "type": "String",
                                "required": false
                            }
                        ]
                    }
                },
                "businessRules": [
                    {
                        "name": "Mandatory Fields",
                        "description": "All fields except 'specialRequests' must be provided to enable the booking process."
                    },
                    {
                        "name": "Calendar Date Selection",
                        "description": "Both check-in and check-out dates must be selected through a calendar to ensure correct date formatting."
                    }
                ],
                "interfaces": {
                    "RoomBooking": {
                        "sections": [
                            {
                                "name": "Guest Information",
                                "type": "form",
                                "fields": [
                                    {
                                        "name": "name",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "guestId",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "membershipLevel",
                                        "type": "select",
                                        "required": true
                                    },
                                    {
                                        "name": "phoneNumber",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "email",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "activeBookings",
                                        "type": "number",
                                        "required": false
                                    }
                                ],
                                "actions": [],
                                "filters": [],
                                "resultTable": {
                                    "columns": [],
                                    "actions": []
                                }
                            },
                            {
                                "name": "Booking Details",
                                "type": "form",
                                "fields": [
                                    {
                                        "name": "roomType",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "checkInDate",
                                        "type": "date",
                                        "required": true
                                    },
                                    {
                                        "name": "checkOutDate",
                                        "type": "date",
                                        "required": true
                                    },
                                    {
                                        "name": "numberOfGuests",
                                        "type": "number",
                                        "required": true
                                    },
                                    {
                                        "name": "mealPlan",
                                        "type": "select",
                                        "required": true
                                    },
                                    {
                                        "name": "specialRequests",
                                        "type": "textarea",
                                        "required": false
                                    }
                                ],
                                "actions": ["Book Room"],
                                "filters": [],
                                "resultTable": {
                                    "columns": [],
                                    "actions": []
                                }
                            }
                        ]
                    },
                    "ReservationStatus": {
                        "sections": [
                            {
                                "name": "Booking History",
                                "type": "table",
                                "fields": [],
                                "actions": ["Modify Booking", "Cancel Booking"],
                                "filters": ["dateRange", "bookingStatus"],
                                "resultTable": {
                                    "columns": ["bookingNumber", "roomType", "checkInDate", "checkOutDate", "totalAmount", "status"],
                                    "actions": ["View Details"]
                                }
                            }
                        ]
                    }
                },
                "events": [
                    {
                        "name": "Booking Created",
                        "description": "When a booking is created, the booking status is set to 'Active'.",
                        "displayName": "예약 생성됨"
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "description": this.client.input.description
        }
    }

    
    onThink(returnObj, thinkText){
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onCreateModelGenerating(returnObj) {
        this._makeOutputs(returnObj)
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onCreateModelFinished(returnObj) {
        this._makeOutputs(returnObj)
        returnObj.directMessage = `Analysing user requirements for ${this.client.input.boundedContextDisplayName} Bounded Context... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    _makeOutputs(returnObj) {
        if(returnObj.modelValue.aiOutput.inference) {
            if(returnObj.parsedTexts && returnObj.parsedTexts.think)
                returnObj.modelValue.inference = returnObj.parsedTexts.think + "\n\n" + returnObj.modelValue.aiOutput.inference
            else
                returnObj.modelValue.inference = returnObj.modelValue.aiOutput.inference

            returnObj.modelValue.analysisResult = {
                inference: returnObj.modelValue.inference
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