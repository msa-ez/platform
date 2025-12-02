const FormattedJSONAIGenerator = require("./FormattedJSONAIGenerator");
const { z } = require("zod");
const { zodResponseFormat, XmlUtil, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("./utils");

class CommandReadModelExtractor extends FormattedJSONAIGenerator {
    constructor(client) {
        super(client, {}, "thinkingModel", true);
        
        this.generatorName = 'CommandReadModelExtractor';
        this.checkInputParamsKeys = ["requirements", "resultDevideBoundedContext"];
        this.progressCheckStrings = ["extractedData", "boundedContexts", "commands", "readModels"];

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                extractedData: z.object({
                    boundedContexts: z.array(z.object({
                        name: z.string(),
                        commands: z.array(z.object({
                            name: z.string(),
                            actor: z.enum(["user", "admin", "system", "external"]),
                            aggregate: z.string(),
                            description: z.string(),
                            refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                        })),
                        readModels: z.array(z.object({
                            name: z.string(),
                            actor: z.enum(["user", "admin", "system"]),
                            aggregate: z.string(),
                            isMultipleResult: z.boolean(),
                            description: z.string(),
                            refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                        }))
                    }))
                }).strict()
            }).strict(),
            "command_readmodel_extraction"
        );
    }


    async onGenerateBefore(inputParams) {
        this.__validateInputParams(inputParams);
    }
    __validateInputParams(inputParams) {
        DataValidationUtil.validateData(inputParams, {
            type: 'object',
            properties: {
                requirements: {
                    type: 'string',
                    required: true,
                    minLength: 1
                },
                resultDevideBoundedContext: {
                    type: 'array',
                    required: true,
                    minLength: 1,
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', required: true, minLength: 1 },
                            role: { type: 'string', required: false }   
                        }
                    }
                }
            }
        });
    }


    __buildPersonaInfo() {
        return {
            persona: "Expert Domain-Driven Design (DDD) Architect",
            goal: "To extract and organize all Commands (state-changing operations) and ReadModels (query operations) from business requirements, categorizing them by their corresponding Bounded Contexts with proper aggregate alignment.",
            backstory: "With deep expertise in Domain-Driven Design and CQRS patterns, I specialize in identifying business operations and structuring them according to bounded context boundaries. I excel at distinguishing between command operations that modify state and read models that retrieve data, ensuring each operation is properly categorized with the appropriate actor, aggregate, and bounded context. My expertise ensures comprehensive extraction of all business operations while maintaining clear separation of concerns and domain alignment."
        };
    }

    __buildTaskGuidelinesPrompt() {
        return `<instruction>
    <core_instructions>
        <title>Command and ReadModel Extraction Task</title>
        <task_description>Analyze business requirements and extract all business operations, categorizing them into Commands (state-changing operations) and ReadModels (query operations), organized by their corresponding Bounded Contexts.</task_description>
        
        <input_description>
            <title>You will be given:</title>
            <item id="1">**Requirements:** Business requirements with line numbers describing the system functionality</item>
            <item id="2">**Bounded Contexts:** List of identified bounded contexts with their aggregates</item>
        </input_description>

        <guidelines>
            <title>Extraction Guidelines</title>
            
            <section id="command_extraction">
                <title>Command Extraction Rules</title>
                <description>Commands represent state-changing operations that modify the system's data or state.</description>
                
                <rule id="1">
                    <name>State-Changing Operations</name>
                    <description>Extract all operations that modify system state or data</description>
                    <examples>
                        <category name="Create">CreateReservation, RegisterUser, CreateFlight</category>
                        <category name="Update">UpdateProfile, UpdateReservation, UpdateFlight</category>
                        <category name="Delete">CancelReservation, DeleteFlight, DeleteSeat</category>
                        <category name="Process">ProcessPayment, ConfirmReservation, VerifyEmail</category>
                    </examples>
                </rule>
                
                <rule id="2">
                    <name>Business Processes</name>
                    <description>Operations that execute specific business rules or logic</description>
                    <examples>
                        <category name="Validate">ValidateReservation, AuthenticateUser</category>
                        <category name="Calculate">CalculatePrice, ComputeRefund</category>
                        <category name="Notify">SendNotification, IssueAuthToken</category>
                    </examples>
                </rule>
                
                <rule id="3">
                    <name>External System Integration</name>
                    <description>Operations involving interaction with external systems</description>
                    <examples>
                        <category name="Synchronize">SyncFlightInfo, SyncSeatInfo</category>
                        <category name="Detect">DetectFraudulentReservation</category>
                    </examples>
                </rule>
                
                <rule id="4">
                    <name>Naming Convention</name>
                    <description>Use Verb + Noun pattern in PascalCase (e.g., CreateOrder, UpdateProfile)</description>
                </rule>
                
                <rule id="5">
                    <name>Actor Identification</name>
                    <description>Assign appropriate actor: user, admin, system, or external</description>
                </rule>
            </section>

            <section id="readmodel_extraction">
                <title>ReadModel (View) Extraction Rules</title>
                <description>ReadModels represent query operations that retrieve data without changing state.</description>
                
                <rule id="1">
                    <name>Data Retrieval</name>
                    <description>Operations to fetch data without modifying it</description>
                    <examples>
                        <category name="Single Retrieval">UserProfile, ReservationDetail, FlightDetail</category>
                        <category name="List Retrieval">FlightList, ReservationHistory, InquiryList</category>
                    </examples>
                </rule>
                
                <rule id="2">
                    <name>Search and Filtering</name>
                    <description>Data retrieval based on specific conditions or criteria</description>
                    <examples>
                        <category name="Search">FlightSearch, SearchReservations</category>
                        <category name="Filtering">FilteredFlightList, AvailableSeats</category>
                    </examples>
                </rule>
                
                <rule id="3">
                    <name>Statistics and Reports</name>
                    <description>Aggregated data or summary information</description>
                    <examples>
                        <category name="Statistics">ReservationStatistics, SalesReport</category>
                        <category name="Status">SeatAvailability, FlightStatus</category>
                    </examples>
                </rule>
                
                <rule id="4">
                    <name>UI Support Data</name>
                    <description>Data required for screen composition and user interface</description>
                    <examples>
                        <category name="Option Lists">AirportList, SeatClassOptions</category>
                        <category name="Configuration">UserPreferences, SystemSettings</category>
                    </examples>
                </rule>
                
                <rule id="5">
                    <name>Naming Convention</name>
                    <description>Use Noun + Purpose pattern in PascalCase (e.g., FlightList, UserProfile)</description>
                </rule>
                
                <rule id="6">
                    <name>Multiple Result Indicator</name>
                    <description>Set isMultipleResult to true for list/collection results, false for single item results</description>
                </rule>
                
                <rule id="7">
                    <name>Actor Identification</name>
                    <description>Assign appropriate actor: user, admin, or system</description>
                </rule>
            </section>

            <section id="bounded_context_assignment">
                <title>Bounded Context Assignment Strategy</title>
                
                <rule id="1">
                    <name>Domain Alignment</name>
                    <description>Assign commands and readModels to the most appropriate Bounded Context based on domain responsibility and business capability</description>
                </rule>
                
                <rule id="2">
                    <name>Aggregate Alignment</name>
                    <description>Consider which aggregates within each Bounded Context are most relevant to the operation</description>
                </rule>
                
                <rule id="3">
                    <name>Business Logic Grouping</name>
                    <description>Group related operations within the same Bounded Context to maintain cohesion</description>
                </rule>
                
                <rule id="4">
                    <name>Comprehensive Coverage</name>
                    <description>Extract ALL business operations from requirements without omission</description>
                </rule>
            </section>

            <section id="quality_standards">
                <title>Quality Standards</title>
                
                <rule id="1">
                    <name>Completeness</name>
                    <description>Extract ALL business operations mentioned in requirements</description>
                </rule>
                
                <rule id="2">
                    <name>Domain-Specific Focus</name>
                    <description>Focus on domain-specific operations, not generic CRUD unless explicitly required</description>
                </rule>
                
                <rule id="3">
                    <name>Clear Naming</name>
                    <description>Use clear, descriptive names that reflect business intent and purpose</description>
                </rule>
                
                <rule id="4">
                    <name>Proper Categorization</name>
                    <description>Ensure commands and readModels are correctly distinguished and categorized</description>
                </rule>
                
                <rule id="5">
                    <name>Meaningful Descriptions</name>
                    <description>Provide clear, concise descriptions explaining the purpose and business value of each operation</description>
                </rule>
            </section>

            <section id="traceability">
                <title>Source Traceability Requirements</title>
                
                <rule id="1">
                    <name>Mandatory Refs</name>
                    <description>Every command and readModel MUST include refs linking back to specific requirement lines</description>
                </rule>
                
                <rule id="2">
                    <name>Refs Format</name>
                    <description>Use format [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]</description>
                </rule>
                
                <rule id="3">
                    <name>Minimal Phrases</name>
                    <description>Use 1-2 word phrases that uniquely identify the position in the line</description>
                </rule>
                
                <rule id="4">
                    <name>Valid Line Numbers</name>
                    <description>Refs must reference valid line numbers from the requirements section</description>
                </rule>
                
                <rule id="5">
                    <name>Multiple References</name>
                    <description>Include multiple ranges if an operation references multiple parts of requirements</description>
                </rule>
            </section>
        </guidelines>

        <refs_format_example>
            <title>Example of refs Format</title>
            <description>If requirements contain:</description>
            <example_requirements>
<1>Users can create, update, and cancel reservations</1>
<2>Administrators can view all reservations</2> 
<3>System processes payments automatically</3>
            </example_requirements>
            <example_refs>
- "CreateReservation" command → refs: [[[1, "create"], [1, "reservations"]]]
- "UpdateReservation" command → refs: [[[1, "update"], [1, "reservations"]]]
- "ReservationList" readModel → refs: [[[2, "view"], [2, "reservations"]]]
- "ProcessPayment" command → refs: [[[3, "processes"], [3, "payments"]]]
            </example_refs>
        </refs_format_example>
    </core_instructions>
    
    <output_format>
        <title>JSON Output Format</title>
        <description>The output must be a JSON object structured as follows:</description>
        <schema>
{
    "extractedData": {
        "boundedContexts": [
            {
                "name": "(BoundedContextName)",
                "commands": [
                    {
                        "name": "(CommandName in PascalCase, Verb+Noun)",
                        "actor": "(user|admin|system|external)",
                        "aggregate": "(AggregateName)",
                        "description": "(Clear description of what this command does and its business purpose)",
                        "refs": [[[(startLineNumber), "(minimal_start_phrase)"], [(endLineNumber), "(minimal_end_phrase)"]]]
                    }
                ],
                "readModels": [
                    {
                        "name": "(ReadModelName in PascalCase, Noun+Purpose)",
                        "actor": "(user|admin|system)",
                        "aggregate": "(AggregateName)",
                        "isMultipleResult": (true for lists/collections, false for single items),
                        "description": "(Clear description of what data this readModel retrieves and its purpose)",
                        "refs": [[[(startLineNumber), "(minimal_start_phrase)"], [(endLineNumber), "(minimal_end_phrase)"]]]
                    }
                ]
            }
        ]
    }
}
        </schema>
        <field_requirements>
            <requirement id="1">All field names must match exactly as shown in the schema</requirement>
            <requirement id="2">Command names must follow Verb+Noun pattern (e.g., CreateOrder, ProcessPayment)</requirement>
            <requirement id="3">ReadModel names must follow Noun+Purpose pattern (e.g., OrderList, UserProfile)</requirement>
            <requirement id="4">Actor values must be exactly one of: user, admin, system, external (for commands) or user, admin, system (for readModels)</requirement>
            <requirement id="5">Aggregate names must match those defined in the bounded contexts</requirement>
            <requirement id="6">Descriptions must be clear and explain business purpose</requirement>
            <requirement id="7">Every command and readModel must include refs array linking to requirement source lines</requirement>
        </field_requirements>
    </output_format>
</instruction>`;
    }

    __buildJsonUserQueryInputFormat() {
        return {
            requirements: this._getLineNumberedRequirements(),
            bounded_contexts: XmlUtil.from_dict(this.client.input.resultDevideBoundedContext),
            additional_requirements: this.client.input.additional_requirements || ''
        };
    }

    onModelCreatedWithThinking(returnObj) {
        if (!this.__isValidAIOutput(returnObj.modelValue.aiOutput)) return;
        
        const model = returnObj.modelValue.aiOutput;
        if(!model.extractedData) {
          returnObj.modelValue.output = {
              extractedData: {
                  boundedContexts: []
              },
              currentGeneratedLength: 0
          };
          return;
        }
        
        model.extractedData = RefsTraceUtil.sanitizeAndConvertRefs(
            model.extractedData, 
            this._getLineNumberedRequirements(), 
            true
        );
        this._validateRefs(model.extractedData, this.client.input.requirements);
        
        returnObj.modelValue.output = {
            extractedData: model.extractedData,
            currentGeneratedLength: JSON.stringify(model).length
        };
    }
    __isValidAIOutput(aiOutput) {
      return aiOutput && typeof aiOutput === 'object';
    }

    _getLineNumberedRequirements() {
        return TextTraceUtil.addLineNumbers(
            this.client.input.requirements, 1, true
        );
    }

    _validateRefs(extractedData, requirements) {
        RefsTraceUtil.validateRefs(
            extractedData, 
            requirements
        );
    }
}

module.exports = CommandReadModelExtractor;
