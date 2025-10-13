const FormattedJSONAIGenerator = require("./FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil, XmlUtil } = require("./utils");

class DevideBoundedContextGenerator extends FormattedJSONAIGenerator {
    constructor(client){
        super(client, {}, "thinkingModel", true);

        this.generatorName = 'DevideBoundedContextGenerator'
        this.checkInputParamsKeys = ["devisionAspect", "generateOption", "requirements"]
        this.progressCheckStrings = ["thoughts", "boundedContexts", "relations", "explanations"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                thoughts: z.string(),
                boundedContexts: z.array(z.object({
                    name: z.string(),
                    alias: z.string(),
                    importance: z.enum(["Core Domain", "Supporting Domain", "Generic Domain"]),
                    complexity: z.number().min(0).max(1),
                    differentiation: z.number().min(0).max(1),
                    implementationStrategy: z.string(),
                    aggregates: z.array(z.object({
                        name: z.string(),
                        alias: z.string()
                    })),
                    events: z.array(z.string()),
                    requirements: z.array(z.string()),
                    role: z.string(),
                    roleRefs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                })),
                relations: z.array(z.object({
                    name: z.string(),
                    type: z.string(),
                    upStream: z.object({
                        name: z.string(),
                        alias: z.string()
                    }),
                    downStream: z.object({
                        name: z.string(),
                        alias: z.string()
                    }),
                    refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                })),
                explanations: z.array(z.object({
                    sourceContext: z.string(),
                    targetContext: z.string(),
                    relationType: z.string(),
                    reason: z.string(),
                    interactionPattern: z.string(),
                    refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                }))
            }).strict(),
            "instruction"
        )
    }

    async onGenerateBefore(inputParams, generatorName){
        this.__sanitizeInputParams(inputParams);
        this.__validateInputParams(inputParams);
    }
    __sanitizeInputParams(inputParams){
        if(!inputParams.generateOption) inputParams.generateOption = {}
        if(inputParams.generateOption.numberOfBCs === undefined) inputParams.generateOption.numberOfBCs = 3
        if(inputParams.generateOption.additionalOptions === undefined) inputParams.generateOption.additionalOptions = ''
        if(inputParams.generateOption.aspectDetails === undefined) inputParams.generateOption.aspectDetails = {}
        if(inputParams.generateOption.isProtocolMode === undefined) inputParams.generateOption.isProtocolMode = true
    }
    __validateInputParams(inputParams){
        DataValidationUtil.validateData(inputParams, {
            type: 'object',
            properties: {
                devisionAspect: {
                    type: 'string',
                    required: true,
                    minLength: 1
                },
                requirements: {
                    type: 'object',
                    required: true,
                    properties: {
                        userStory: {
                            type: 'string',
                            required: true,
                            minLength: 1
                        },
                        analysisResult: {
                            type: 'object',
                            required: true,
                            properties: {
                                actors: {
                                    type: 'array',
                                    required: true
                                },
                                events: {
                                    type: 'array',
                                    required: true
                                }
                            }
                        },
                        pbcInfo: {
                            type: 'array',
                            required: true
                        },
                        summarizedResult: {
                            type: 'object',
                            required: false // optional field
                        }
                    }
                },
                generateOption: {
                    type: 'object',
                    required: true,
                    properties: {
                        numberOfBCs: {
                            type: 'number',
                            required: true
                        },
                        additionalOptions: {
                            type: 'string',
                            required: false // optional field, can be empty string
                        },
                        aspectDetails: {
                            type: 'object',
                            required: false // optional field
                        },
                        isProtocolMode: {
                            type: 'boolean',
                            required: false // optional field
                        }
                    }
                },
                feedback: {
                    type: 'string',
                    required: false // optional field for regeneration
                },
                previousAspectModel: {
                    type: 'object',
                    required: false // optional field for regeneration
                }
            },
            additionalProperties: true // Allow additional properties like 'title', 'separationPrinciple' etc.
        });
    }

    __buildPersonaInfo() {
        return {
            persona: "Expert Domain-Driven Design (DDD) Architect",
            goal: "To analyze functional requirements and divide them into appropriate Bounded Contexts following Domain-Driven Design principles, ensuring high cohesion and low coupling.",
            backstory: "I am a highly experienced domain architect specializing in system decomposition and bounded context design. I have extensive knowledge of domain-driven design principles and patterns, microservices architecture and context boundaries, business domain modeling and strategic design, and event-driven architecture and system integration patterns. My expertise lies in identifying natural boundaries within complex business domains and creating cohesive, loosely-coupled bounded contexts that align with organizational structure and business capabilities. I excel at analyzing actor interactions, event flows, and business capabilities to determine optimal context boundaries and integration patterns."
        }
    }

    __buildTaskGuidelinesPrompt(){
        return `<instruction>
    <core_instructions>
        <title>Bounded Context Division Task</title>
        <task_description>Your task is to analyze the provided requirements and divide them into multiple Bounded Contexts following Domain-Driven Design principles. You will identify natural boundaries within the business domain and create cohesive, loosely-coupled bounded contexts that align with organizational structure and business capabilities.</task_description>
        
        <input_description>
            <title>You will receive user inputs containing:</title>
            <item id="1">**Division Aspect:** The specific aspect to focus on when dividing contexts</item>
            <item id="2">**Maximum Number of Bounded Contexts:** The maximum number of bounded contexts to create</item>
            <item id="3">**Requirements Document:** Business requirements with actors and events</item>
            <item id="4">**Available Pre-Built Components (PBCs):** List of reusable components that can be leveraged</item>
            <item id="5">**Additional Rules:** Optional additional requirements and constraints to consider</item>
        </input_description>

        <guidelines>
            <title>Bounded Context Division Guidelines</title>
            
            <section id="core_principles">
                <title>Core Principles</title>
                <rule id="1">**High Cohesion, Low Coupling:** Group related behaviors and data together while minimizing inter-context dependencies</rule>
                <rule id="2">**Event Action Range:** Seize event's action range to create bounded context</rule>
                <rule id="3">**Event Flow:** Seize relation between events to create flow</rule>
                <rule id="4">**Actor Grouping:** Consider which actors are responsible for which events</rule>
                <rule id="5">**Business Capability Alignment:** Ensure bounded contexts align with business capabilities</rule>
            </section>

            <section id="domain_classification">
                <title>Domain Classification Strategy</title>
                
                <core_domain>
                    <title>Core Domain</title>
                    <characteristics>
                        <item>Direct impact on business competitive advantage</item>
                        <item>User-facing functionality</item>
                        <item>Strategic importance to business goals</item>
                    </characteristics>
                    <scoring>
                        <differentiation>Typically 0.8-1.0 (high business differentiation value)</differentiation>
                        <complexity>Can vary (0.4-1.0)</complexity>
                    </scoring>
                    <implementation_strategy>Rich Domain Model</implementation_strategy>
                </core_domain>

                <supporting_domain>
                    <title>Supporting Domain</title>
                    <characteristics>
                        <item>Enables core domain functionality</item>
                        <item>Internal business processes</item>
                        <item>Medium business impact</item>
                    </characteristics>
                    <scoring>
                        <differentiation>Typically 0.4-0.7 (medium business differentiation)</differentiation>
                        <complexity>Can vary (0.3-0.9)</complexity>
                    </scoring>
                    <implementation_strategy>Transaction Script or Active Record</implementation_strategy>
                </supporting_domain>

                <generic_domain>
                    <title>Generic Domain</title>
                    <characteristics>
                        <item>Common functionality across industries</item>
                        <item>Can be replaced by third-party solutions</item>
                        <item>Low differentiation but can have high complexity</item>
                    </characteristics>
                    <scoring>
                        <differentiation>0.0-0.3 (low business differentiation)</differentiation>
                        <complexity>Can vary (0.2-1.0, can be high despite low differentiation)</complexity>
                    </scoring>
                    <implementation_strategy>Active Record or PBC: (pbc-name)</implementation_strategy>
                </generic_domain>
            </section>

            <section id="scoring_instructions">
                <title>Scoring Instructions</title>
                <complexity>
                    <description>Score from 0.0 to 1.0 indicating technical implementation difficulty</description>
                    <considerations>
                        <item>Technical dependencies</item>
                        <item>Business rules complexity</item>
                        <item>Data consistency requirements</item>
                    </considerations>
                    <note>High score is possible even for Generic domains</note>
                </complexity>
                <differentiation>
                    <description>Score from 0.0 to 1.0 indicating business differentiation value</description>
                    <considerations>
                        <item>Competitive advantage</item>
                        <item>User interaction</item>
                        <item>Strategic importance</item>
                    </considerations>
                    <note>User-facing domains should have higher scores</note>
                </differentiation>
            </section>

            <section id="pbc_matching">
                <title>Pre-Built Component (PBC) Matching Rule</title>
                <importance>CRITICAL</importance>
                <rule id="1">**Priority:** Before creating any bounded context, first check if the functionality already exists in the available PBCs provided in user input</rule>
                <rule id="2">**If Match Found:** You MUST create it as a "Generic Domain" bounded context</rule>
                <rule id="3">**Implementation Strategy:** Set to "PBC: [pbc-name]"</rule>
                <rule id="4">**Naming:** Bounded context name of PBC must be written as is pbc name</rule>
                <rule id="5">**Precedence:** This rule takes precedence over all other domain classification rules</rule>
            </section>

            <section id="aggregate_extraction">
                <title>Aggregate Extraction</title>
                <rule id="1">**Identify Aggregates:** For each bounded context, extract aggregates that represent business entities and their consistency boundaries</rule>
                <rule id="2">**Naming:** Aggregates should be named in PascalCase</rule>
                <rule id="3">**Alias:** Provide alias in the same national language as the requirements</rule>
            </section>

            <section id="traceability">
                <title>Source Traceability Requirements</title>
                <rule id="1">**Mandatory Refs:** Every bounded context role, relation, and explanation MUST include refs linking back to specific requirement lines</rule>
                <rule id="2">**Refs Format:** Use format [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]</rule>
                <rule id="3">**Minimal Phrases:** Use 1-2 word phrases that uniquely identify the position in the line</rule>
                <rule id="4">**Valid Line Numbers:** Refs must reference valid line numbers from the requirements section</rule>
                <rule id="5">**Multiple References:** Include multiple ranges if a field references multiple parts of requirements</rule>
            </section>

            <section id="language_instructions">
                <title>Language Instructions</title>
                <rule id="1">**National Language Usage:** Use the same national language as the Requirements for: thoughts, explanations, alias, requirements</rule>
                <rule id="2">**Bounded Context Names:** Must be written in English PascalCase</rule>
                <rule id="3">**References in Explanations:** When referring to bounded context in explanations, use alias</rule>
            </section>
        </guidelines>

        <refs_format_example>
            <title>Example of refs Format</title>
            <description>If requirements contain:</description>
            <example_requirements>
<1>E-commerce Platform</1>
<2></2>
<3>Users can browse and purchase products</3>
<4>Payment processing with multiple providers</4>
<5>Order fulfillment and tracking system</5>
<6>Customer support chat functionality</6>
            </example_requirements>
            <example_refs>
- "ProductCatalog" BC with role "Manages product information and browsing" → roleRefs: [[[3, "Users"], [3, "products"]]]
- Relation between "Payment" and "Order" → refs: [[[4, "Payment"], [5, "Order"]]]
- Explanation about "CustomerSupport" interaction → refs: [[[6, "Customer"], [6, "functionality"]]]
            </example_refs>
        </refs_format_example>
    </core_instructions>
    
    <output_format>
        <title>JSON Output Format</title>
        <description>The output must be a JSON object structured as follows:</description>
        <schema>
{
    "thoughts": "(Explanations of how Bounded Contexts were derived: cohesion & coupling analysis, domain expertise, technical cohesion, persona-based division, etc.)",
    "boundedContexts": [
        {
            "name": "(Bounded Context name in PascalCase)",
            "alias": "(Alias of Bounded Context in national language of Requirements)",
            "importance": "Core Domain" || "Supporting Domain" || "Generic Domain",
            "complexity": (number: 0.0-1.0, technical implementation difficulty),
            "differentiation": (number: 0.0-1.0, business differentiation value),
            "implementationStrategy": "Event Sourcing" || "Rich Domain Model" || "Transaction Script" || "Active Record" || "PBC: (pbc-name)",
            "aggregates": [
                {
                    "name": "(Aggregate name in PascalCase)",
                    "alias": "(Alias of Aggregate in language of Requirements)"
                }
            ],
            "events": [], // All events that are composed from this Bounded Context
            "requirements": [], // Must be empty array
            "role": "(Explanation of what to do and how this Bounded Context works)",
            "roleRefs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
        }
    ],
    "relations": [
        {
            "name": "(Name of relation between Bounded Contexts)",
            "type": "(Relation type - refer to Additional Rules in user input for allowed types)",
            "upStream": {
                "name": "(Name of upstream Bounded Context)",
                "alias": "(Alias of upstream Bounded Context in language of Requirements)"
            },
            "downStream": {
                "name": "(Name of downstream Bounded Context)",
                "alias": "(Alias of downstream Bounded Context in language of Requirements)"
            },
            "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
        }
    ],
    "explanations": [
        {
            "sourceContext": "(Source Bounded Context alias)",
            "targetContext": "(Target Bounded Context alias)",
            "relationType": "(Relationship type)",
            "reason": "(Explanation of why this type was chosen)",
            "interactionPattern": "(Description of how these contexts interact)",
            "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
        }
    ]
}
        </schema>
        <field_requirements>
            <requirement id="1">All field names must match exactly as shown in the schema</requirement>
            <requirement id="2">Bounded Context names must be PascalCase</requirement>
            <requirement id="3">Alias must be in the same language as the requirements</requirement>
            <requirement id="4">All refs must use minimal phrases and valid line numbers</requirement>
        </field_requirements>
    </output_format>
</instruction>`;
    }

    
    __buildJsonUserQueryInputFormat(){
        const userInput = {
            "division_aspect": this.client.input['devisionAspect'],
            "maximum_number_of_bounded_contexts": this.client.input['generateOption']['numberOfBCs'],
            "actors": XmlUtil.from_dict(this.client.input['requirements']['analysisResult']['actors']),
            "events": XmlUtil.from_dict(RefsTraceUtil.removeRefsAttributes(this.client.input['requirements']['analysisResult']['events'])),
            "available_pre_built_components_pbcs": XmlUtil.from_dict(this.client.input['requirements']['pbcInfo']),
            "additional_rules": this._buildAdditionalRules(),
            "requirements": this._getlineNumberedRequirements()
        }

        if(this.client.input['feedback']) {
            userInput["feedback"] = this._feedbackPrompt()
        }

        return userInput
    }

    _getlineNumberedRequirements(){
        if(!this.client.input['requirements']['summarizedResult'] || 
           !this.client.input['requirements']['summarizedResult'].summary || 
           this.client.input['requirements']['summarizedResult'].summary === "") {
            return TextTraceUtil.addLineNumbers(this.client.input['requirements']['userStory'], 1, true)
        }

        const summary = this.client.input['requirements']['summarizedResult'].summary;
        return TextTraceUtil.addLineNumbers(summary, 1, true)
    }

    _buildAdditionalRules() {
        const additionalOptions = this.client.input['generateOption']['additionalOptions'] || '';
        const isProtocolMode = this.client.input['generateOption']['isProtocolMode'];
        const aspectDetails = this.client.input['generateOption']['aspectDetails'] || {};
        const isOllama = this.modelInfo.vendor === 'ollama';

        const rules = [];

        // Relation type rules based on mode
        if (isProtocolMode) {
            rules.push(`<relation_type_constraint>
    <allowed_types>
        <type>Request/Response</type>
        <type>Pub/Sub</type>
    </allowed_types>
    <requirements>
        <requirement>All Bounded Contexts must have at least one relation</requirement>
        <requirement>Event-driven architecture is preferred for loose coupling</requirement>
        <requirement>All relation types must use 'Pub/Sub' pattern. However, only Generic domains as downstream MUST use 'Request/Response' pattern</requirement>
    </requirements>
</relation_type_constraint>`);
        } else {
            rules.push(`<relation_type_constraint>
    <allowed_types>
        <type>Conformist</type>
        <type>Shared Kernel</type>
        <type>Anti-corruption</type>
        <type>Separate Ways</type>
        <type>Customer-Supplier</type>
    </allowed_types>
</relation_type_constraint>`);
        }

        // Aspect details
        if (Object.keys(aspectDetails).length > 0) {
            let aspectDetailsXml = `<specific_aspect_requirements>
    <description>When determining and explaining the bounded contexts, consider and reflect the following specific requirements:</description>`;
            
            if (aspectDetails.organizationalAspect) {
                aspectDetailsXml += `
    <organizational_aspect>
        <details>${aspectDetails.organizationalAspect}</details>
        <instruction>Please reflect this team structure when separating bounded contexts</instruction>
    </organizational_aspect>`;
            }
            
            if (aspectDetails.infrastructureAspect) {
                aspectDetailsXml += `
    <infrastructure_aspect>
        <details>${aspectDetails.infrastructureAspect}</details>
        <instruction>Please consider these technical requirements when defining bounded contexts</instruction>
    </infrastructure_aspect>`;
            }
            
            aspectDetailsXml += `
    <important_note>In the "thoughts" section of your response, explicitly explain how these specific organizational and infrastructure requirements influenced your bounded context separation decisions.</important_note>
</specific_aspect_requirements>`;
            
            rules.push(aspectDetailsXml);
        }

        // Additional options from user
        if (additionalOptions) {
            rules.push(`<user_additional_requirements>
    <content>${additionalOptions}</content>
</user_additional_requirements>`);
        }

        // Ollama specific instructions
        if (isOllama) {
            rules.push(`<output_generation_instructions>
    <instruction>Focus directly on generating the required JSON output with minimal intermediate thinking</instruction>
    <instruction>Always use the exact keys specified in the JSON format</instruction>
    <instruction>Must not be missing information that is required in the JSON format</instruction>
</output_generation_instructions>`);
        }

        if (rules.length === 0) {
            return `<status>None</status>`;
        }

        return rules.join('\n');
    }

    _feedbackPrompt(){
        return `<feedback_for_regeneration>
    <previous_model>
${JSON.stringify(RefsTraceUtil.removeRefsAttributes(this.client.input['previousAspectModel']), null, 2)}
    </previous_model>
    <instruction>Please refer to the added feedback below to create a new model that addresses the user's concerns while maintaining consistency with the requirements.</instruction>
    <user_feedback>
${this.client.input['feedback']}
    </user_feedback>
</feedback_for_regeneration>`
    }

    
    onThink(returnObj, thinkText){
        returnObj.directMessage = `Analyzing requirements for ${this.client.input['devisionAspect']}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onModelCreatedWithThinking(returnObj){
        returnObj.directMessage = `Generating bounded contexts for ${this.client.input['devisionAspect']}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
        
        if(!this.__isValidAIOutput(returnObj.modelValue.aiOutput))  {
            returnObj.modelValue = {
                ...returnObj.modelValue,
                output: {
                    "devisionAspect": this.client.input['devisionAspect'],
                    "boundedContexts":[],
                    "relations":[],
                    "thoughts":"",
                    "explanations":[],
                    "role":"",
                    "currentGeneratedLength": this.getTotalOutputTextLength(returnObj)
                }
            }
            return
        }

        returnObj.modelValue = {
            ...returnObj.modelValue,
            output: this._processAIOutput(returnObj.modelValue.aiOutput, returnObj)
        }
    }
    __isValidAIOutput(aiOutput){
        if(!aiOutput) return false
        if(!aiOutput.boundedContexts || !Array.isArray(aiOutput.boundedContexts)) return false
        if(!aiOutput.relations || !Array.isArray(aiOutput.relations)) return false
        return true
    }

    _processAIOutput(aiOutput, returnObj = null){
        let model = structuredClone(aiOutput)
        
        // Set division aspect and other metadata
        model['devisionAspect'] = this.client.input['devisionAspect'];
        model['currentGeneratedLength'] = returnObj ? this.getTotalOutputTextLength(returnObj) : JSON.stringify(aiOutput).length;

        // Convert refs to indexes
        this._convertRefsToIndexes(model);

        // Add COT if available
        if(this.parsedTexts && this.parsedTexts.think){
            model['cotThink'] = this.parsedTexts.think
        }

        // Initialize empty arrays for events and requirements
        if(model['boundedContexts']) {
            model['boundedContexts'].forEach(boundedContext => {
                if(!boundedContext['events']) boundedContext['events'] = []
                if(!boundedContext['requirements']) boundedContext['requirements'] = []
            })
        }

        return model
    }

    /**
     * Convert phrase-based refs to index-based refs for model
     * @param {Object} model - Model object containing refs
     */
    _convertRefsToIndexes(model) {
        if (!model) return;

        if(this.__isSummarizedRequirementsRefExists()){
            if (model.boundedContexts && Array.isArray(model.boundedContexts)) {
                model.boundedContexts = RefsTraceUtil.convertToOriginalRefs(
                    model.boundedContexts, 
                    this.client.input['requirements']['summarizedResult']['refs']['summarizedRequirements']
                );
            }

            if (model.relations && Array.isArray(model.relations)) {
                model.relations = RefsTraceUtil.convertToOriginalRefs(
                    model.relations, 
                    this.client.input['requirements']['summarizedResult']['refs']['summarizedRequirements']
                );
            }

            if (model.explanations && Array.isArray(model.explanations)) {
                model.explanations = RefsTraceUtil.convertToOriginalRefs(
                    model.explanations, 
                    this.client.input['requirements']['summarizedResult']['refs']['summarizedRequirements']
                );
            }
        }
        else {
            const lineNumberedRequirements = this._getlineNumberedRequirements()
            const rawRequirements = this.client.input['requirements']['userStory']
            if (model.boundedContexts && Array.isArray(model.boundedContexts)) {
                model.boundedContexts = RefsTraceUtil.sanitizeAndConvertRefs(
                    model.boundedContexts, lineNumberedRequirements, true
                );
                RefsTraceUtil.validateRefs(model.boundedContexts, rawRequirements);
            }

            if (model.relations && Array.isArray(model.relations)) {
                model.relations = RefsTraceUtil.sanitizeAndConvertRefs(
                    model.relations, lineNumberedRequirements, true
                );
                RefsTraceUtil.validateRefs(model.relations, rawRequirements);
            }

            if (model.explanations && Array.isArray(model.explanations)) {
                model.explanations = RefsTraceUtil.sanitizeAndConvertRefs(
                    model.explanations, lineNumberedRequirements, true
                );
                RefsTraceUtil.validateRefs(model.explanations, rawRequirements);
            }
        }
    }
    __isSummarizedRequirementsRefExists(){
        return this.client.input['requirements'] &&
               this.client.input['requirements']['summarizedResult'] && 
               this.client.input['requirements']['summarizedResult']["refs"] && 
               this.client.input['requirements']['summarizedResult']["refs"]["summarizedRequirements"] && 
               this.client.input['requirements']['summarizedResult']["refs"]["summarizedRequirements"].length > 0
    }
}

module.exports = DevideBoundedContextGenerator;