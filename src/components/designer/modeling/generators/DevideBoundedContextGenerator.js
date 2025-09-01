const FormattedJSONAIGenerator = require("./FormattedJSONAIGenerator");
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("./utils");

class DevideBoundedContextGenerator extends FormattedJSONAIGenerator {
    constructor(client){
        super(client, {}, "thinkingModel");

        this.generatorName = 'DevideBoundedContextGenerator'
        this.checkInputParamsKeys = ["devisionAspect", "generateOption", "requirements"]
        this.progressCheckStrings = ["boundedContexts", "relations", "thoughts", "explanations"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
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
                thoughts: z.string(),
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


    __buildAgentRolePrompt(){
        return `Role: Domain-Driven Design (DDD) Architect

Goal: To analyze functional requirements and divide them into appropriate Bounded Contexts following Domain-Driven Design principles.

Backstory: I am a highly experienced domain architect specializing in system decomposition and bounded context design. I have extensive knowledge of:
- Domain-driven design principles and patterns
- Microservices architecture and context boundaries
- Business domain modeling and strategic design
- Event-driven architecture and system integration patterns

My expertise lies in identifying natural boundaries within complex business domains and creating cohesive, loosely-coupled bounded contexts that align with organizational structure and business capabilities.`
    }


    __buildTaskGuidelinesPrompt(){
        const params = {
            ollamaPrompt: this._ollamaPrompt(),
            devisionAspect: this.client.input['devisionAspect'],
            aspectDetails: this._aspectDetailsPrompt(),
            numberOfBCs: this.client.input['generateOption']['numberOfBCs'],
            additionalOptions: this.client.input['generateOption']['additionalOptions'] ? this.client.input['generateOption']['additionalOptions'] : 'None',
            pbcPrompt: this._getPBCPrompt(),
            relationGuidelines: this._relationGuidelines()
        }

        return `Your task is to analyze the provided requirements and divide them into multiple Bounded Contexts following these guidelines:

${params.ollamaPrompt}

Focus on these aspects:
${params.devisionAspect}

${params.aspectDetails}

Maximum Number of Bounded Contexts:
${params.numberOfBCs}

Additional requirements:
${params.additionalOptions}

${params.pbcPrompt}

Key principles:
- High cohesion, low coupling
- Group related behaviors and data together
- Minimize inter-context dependencies
- Seize event's action range to create bounded context
- Seize relation between events to create flow
- User-facing domains should be considered as Core Domain
- Generic domains can have high complexity despite low differentiation

Domain Classification Guidelines:
Core Domain:
- Direct impact on business competitive advantage
- User-facing functionality
- Strategic importance to business goals
- Differentiation score typically 0.8-1.0
- Complexity can vary (0.4-1.0)

Supporting Domain:
- Enables core domain functionality
- Internal business processes
- Medium business impact
- Differentiation score typically 0.4-0.7
- Complexity can vary (0.3-0.9)

Generic Domain:
- Common functionality across industries
- Can be replaced by third-party solutions
- Differentiation score 0.0-0.3
- Complexity can vary (0.2-1.0)

Scoring Instructions:
- complexity: Score from 0.0 to 1.0 indicating the technical implementation difficulty
  - Consider: Technical dependencies, business rules complexity, data consistency requirements
  - High score possible even for Generic domains
- differentiation: Score from 0.0 to 1.0 indicating business differentiation value
  - Consider: Competitive advantage, user interaction, strategic importance
  - User-facing domains should have higher scores

Implementation Strategy Guidelines:
- Core Domain: Rich Domain Model
- Supporting Domain: Transaction Script or Active Record
- Generic Domain: Active Record or PBC: (pbc-name)

${params.relationGuidelines}

Language Instruction of Output:
- Use the "same national language" as the Requirements at thoughts, context of explanations, alias, requirements.
- When referring to bounded context in explanations, use alias.
- name of Bounded Context must be written in English PascalCase.

EXAMPLE of refs format:
If requirements contain:
1: # E-commerce Platform
2: 
3: Users can browse and purchase products
4: Payment processing with multiple providers
5: Order fulfillment and tracking system
6: Customer support chat functionality

And you create bounded contexts like:
- "ProductCatalog" BC with role "Manages product information and browsing" -> roleRefs: [[[3, "Users"], [3, "products"]]]
- Relation between "Payment" and "Order" -> refs: [[[4, "Payment"], [5, "Order"]]]
- Explanation about "CustomerSupport" interaction -> refs: [[[6, "Customer"], [6, "functionality"]]]

The refs array contains ranges where each range is [[startLine, startPhrase], [endLine, endPhrase]].
The phrases should be MINIMAL words (1-2 words) that uniquely identify the position in the line.
Use the shortest possible phrase that can locate the specific part of requirements.
Multiple ranges can be included if a field references multiple parts of requirements.`
    }

    _ollamaPrompt(){
        if(this.modelInfo.vendor === 'ollama'){
            return `
Focus directly on generating the required JSON output with minimal intermediate thinking.
Always use the extact keys specified in the JSON format.
Must not be missing information that is required in the JSON format.

1. Required JSON Structure:
{
    "boundedContexts": [...],
    "relations": [...],
    "thoughts": "...",
    "explanations": [...]
}

2. For "relations" array, each object must have:
{
    "name": "...",
    "type": "Conformist" || "Shared Kernel" || "Anti-corruption" || "Seperate Ways" || "Customer-Supplier",
    "upStream": {
        "name": "...",
        "alias": "..."
    },
    "downStream": {
        "name": "...",
        "alias": "..."
    }
}
        
        `;
        }else{
            return '';
        }
    }

    _aspectDetailsPrompt(){
        if (Object.keys(this.client.input['generateOption']['aspectDetails']).length === 0) return ''
        
        return `Details of the aspect:
When determining and explaining the bounded contexts to be separated, please consider and reflect the following specific requirements for each aspect:

${this.client.input['generateOption']['aspectDetails']['organizationalAspect'] ? 
`- Organization Structure: ${this.client.input['generateOption']['aspectDetails']['organizationalAspect']}
    (Please reflect this team structure when separating bounded contexts)` : ''}

${this.client.input['generateOption']['aspectDetails']['infrastructureAspect'] ? 
`- Infrastructure Environment: ${this.client.input['generateOption']['aspectDetails']['infrastructureAspect']}
    (Please consider these technical requirements when defining bounded contexts)` : ''}

Important: In the "thoughts" section of your response, please explicitly explain how these specific organizational and infrastructure requirements influenced your bounded context separation decisions.
`;
    }

    _relationGuidelines(){
        if(this.client.input['generateOption']['isProtocolMode']){
            return `
Relation Guidelines:
- All Bounded Contexts must have at least one relation
- Event-driven architecture is preferred for loose coupling 
- Relation Type Rule: All relation types must use 'Pub/Sub' pattern. But, only Generic domains as downstream MUST use 'Request/Response' pattern
        `
        }
            
        return ''
    }

    _getPBCPrompt(){
        return `
IMPORTANT - PBC MATCHING RULE:
Before creating any bounded context, first check if the functionality already exists in the available PBCs.
If a functionality matches with any available PBC, you MUST:
1. Create it as a "Generic Domain" bounded context
2. Set its implementation strategy to "PBC: [pbc-name]"
3. Bounded context name of PBC must be written it as is pbc name.
This rule takes precedence over all other domain classification rules.

Available Pre-Built Components (PBCs):
The following PBCs are available for implementation strategies:
${JSON.stringify(this.client.input['requirements']['pbcInfo'], null, 2)}
        `
    }    


    __buildJsonResponseFormat(){
        return `{
    "boundedContexts": [
        {
            "name": "name of Bounded Context in PascalCase",
            "alias": "alias of Bounded Context in national language of Requirements",
            "importance": "Core Domain" || "Supporting Domain" || "Generic Domain",
            "complexity": "score of complexity", // 0.0 ~ 1.0
            "differentiation": "score of differentiation", // 0.0 ~ 1.0
            "implementationStrategy": "Event Sourcing" || "Rich Domain Model" || "Transaction Script" || "Active Record" || "PBC: (pbc-name)",
            "aggregates": [ // Aggregates that can be extracted from this Bounded Context.
                {
                    "name": "name of Aggregate in PascalCase",
                    "alias": "alias of Aggregate in language of Requirements"
                }
            ],
            "events": [], // All events that composed from this Bounded Context.
            "requirements": [], // Must be empty array
            "role": "Explanation of what to do and how to works in this Bounded Context",
            "roleRefs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]] // Reference to source requirements for role explanation. Use minimal 1-2 word phrases that uniquely identify the position
        }
    ],
    "relations": [
        {
            "name": "name of relation between Bounded Contexts",
            "type": ${this._relationTypePrompt()},
            "upStream": {
                "name": "name of upstream Bounded Context",
                "alias": "alias of upstream Bounded Context in language of Requirements"
            },
            "downStream": {
                "name": "name of downstream Bounded Context",
                "alias": "alias of downstream Bounded Context in language of Requirements"
            },
            "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]] // Use minimal 1-2 word phrases that uniquely identify the position
        }
    ],
    "thoughts": "explanations of how Bounded Contexts were derived (cohesion & coupling, domain expertise, technical cohesion, persona-based, etc.)",
    "explanations": [
        {
            "sourceContext": "Source Bounded Context alias",
            "targetContext": "Target Bounded Context alias",
            "relationType": "Relationship type",
            "reason": "Explanation of why this type was chosen",
            "interactionPattern": "Description of how these contexts interact",
            "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]] // Use minimal 1-2 word phrases that uniquely identify the position
        }
    ]
}`
    }

    _relationTypePrompt(){
        if(this.client.input['generateOption']['isProtocolMode']){
            return `"Request/Response || Pub/Sub"`;
        }else{
            return `"Conformist" || "Shared Kernel" || "Anti-corruption" || "Seperate Ways" || "Customer-Supplier"`;
        }
    }


    __buildJsonUserQueryInputFormat(){
        const summaryRequirements = this._summaryRequirements()
        const userInput = {
            "Division Aspect": this.client.input['devisionAspect'],
            "Actors": JSON.stringify(this.client.input['requirements']['analysisResult']['actors'], null, 2),
            "Events": JSON.stringify(RefsTraceUtil.removeRefsAttributes(this.client.input['requirements']['analysisResult']['events']), null, 2),
            "Requirements": summaryRequirements,
            "Line Number Validation Note": TextTraceUtil.getLineNumberValidationPrompt(summaryRequirements)
        }

        if(this.client.input['feedback']) {
            userInput["Feedback"] = this._feedbackPrompt()
        }

        return userInput
    }

    _summaryRequirements(){
        if(!this.client.input['requirements']['summarizedResult'] || 
           !this.client.input['requirements']['summarizedResult'].summary || 
           this.client.input['requirements']['summarizedResult'].summary === "") {
            return TextTraceUtil.addLineNumbers(this.client.input['requirements']['userStory'])
        }

        const summary = this.client.input['requirements']['summarizedResult'].summary;
        return TextTraceUtil.addLineNumbers(summary)
    }

    _feedbackPrompt(){
        return `
You previously created a model like this: 
${JSON.stringify(RefsTraceUtil.removeRefsAttributes(this.client.input['previousAspectModel']), null, 2)}

Please refer to the added feedback below to create a new model.

Feedback:
${this.client.input['feedback']}
`
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
        
        const lineNumberedRequirements = this._getLineNumberedRequirements();
        if (!lineNumberedRequirements) return;

        // Convert refs in boundedContexts (roleRefs)
        if (model.boundedContexts && Array.isArray(model.boundedContexts)) {
            if(this.__isSummarizedRequirementsRefExists()){
                model.boundedContexts = RefsTraceUtil.convertToOriginalRefs(
                    model.boundedContexts, 
                    this.client.input['requirements']['summarizedResult']['refs']['summarizedRequirements']
                );
            }
            else{
                model.boundedContexts = RefsTraceUtil.sanitizeAndConvertRefs(model.boundedContexts, lineNumberedRequirements);
            }
        }

        // Convert refs in relations
        if (model.relations && Array.isArray(model.relations)) {
            if(this.__isSummarizedRequirementsRefExists()){
                model.relations = RefsTraceUtil.convertToOriginalRefs(
                    model.relations, 
                    this.client.input['requirements']['summarizedResult']['refs']['summarizedRequirements']
                );
            }else{
                model.relations = RefsTraceUtil.sanitizeAndConvertRefs(model.relations, lineNumberedRequirements);
            }
        }

        // Convert refs in explanations
        if (model.explanations && Array.isArray(model.explanations)) {
            if(this.__isSummarizedRequirementsRefExists()){
                model.explanations = RefsTraceUtil.convertToOriginalRefs(
                    model.explanations, 
                    this.client.input['requirements']['summarizedResult']['refs']['summarizedRequirements']
                );
            }else{
                model.explanations = RefsTraceUtil.sanitizeAndConvertRefs(model.explanations, lineNumberedRequirements);
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

    _getLineNumberedRequirements() {
        const requirements = this.client.input['requirements']['userStory'] || '';
        return TextTraceUtil.addLineNumbers(requirements);
    }
}

module.exports = DevideBoundedContextGenerator;