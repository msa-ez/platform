const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil, XmlUtil } = require("../../utils")

class AddTraceToDraftOptionsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client, {}, "thinkingModel", true);

        this.generatorName = "AddTraceToDraftOptionsGenerator"
        this.checkInputParamsKeys = ["generatedDraftOptions", "boundedContextName", "functionalRequirements", "traceMap"]
        this.progressCheckStrings = ["aggregates", "enumerations", "valueObjects"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                aggregates: z.array(
                    z.object({
                        name: z.string(),
                        refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                    }).strict()
                ),
                enumerations: z.array(
                    z.object({
                        name: z.string(),
                        refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                    }).strict()
                ),
                valueObjects: z.array(
                    z.object({
                        name: z.string(),
                        refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                    }).strict()
                )
            }).strict(),
            "instruction"
        )
    }

    
    static async addTraceToDraftOptions(generatedDraftOptions, boundedContextName, functionalRequirements, traceMap, callbacks){
        return new Promise((resolve, reject) => {
            try {

                const generator = new AddTraceToDraftOptionsGenerator({
                    input: {
                        generatedDraftOptions,
                        boundedContextName,
                        functionalRequirements,
                        traceMap
                    },
        
                    onSend: (input, stopCallback) => {
                        if(callbacks.onSend)
                            callbacks.onSend(input, stopCallback)
                    },
        
                    onFirstResponse: (returnObj) => {
                        if(callbacks.onFirstResponse)
                            callbacks.onFirstResponse(returnObj)
                    },
        
                    onThink: (returnObj, thinkText) => {
                        if(callbacks.onThink)
                            callbacks.onThink(returnObj, thinkText)
                    },
        
                    onModelCreatedWithThinking: (returnObj) => {
                        if(callbacks.onModelCreatedWithThinking)
                            callbacks.onModelCreatedWithThinking(returnObj)
                    },
        
                    onModelCreated: (returnObj) => {
                        if(callbacks.onModelCreated)
                            callbacks.onModelCreated(returnObj)
                    },
        
                    onGenerationSucceeded: (returnObj) => {
                        if(callbacks.onGenerationSucceeded)
                            callbacks.onGenerationSucceeded(returnObj)
        
                        if(callbacks.onGenerationDone)
                            callbacks.onGenerationDone()
    
                        resolve({
                            draftTraceMap: returnObj.modelValue.output,
                            generatedDraftOptionsWithTrace: AddTraceToDraftOptionsGenerator._addTraceToDraftOptions(structuredClone(generatedDraftOptions), returnObj.modelValue.output)
                        })
                    },
        
                    onRetry: (returnObj) => {
                        console.warn(`[!] An error occurred during command creation, please try again.\n* Error log \n${returnObj.errorMessage}`)
        
                        if(callbacks.onRetry)
                            callbacks.onRetry(returnObj)
                    },
        
                    onStopped: () => {
                        if(callbacks.onStopped)
                            callbacks.onStopped()
    
                        reject(new Error("Generation stopped"))
                    }
                })
    
                generator.generate()

            } catch(error){
                reject(error)
            }
        })
    }

    static _addTraceToDraftOptions(generatedDraftOptions, draftTraceMap){
        if (!generatedDraftOptions || !draftTraceMap) {
            return generatedDraftOptions;
        }

        // Create lookup maps for fast searching
        const aggregateRefsMap = AddTraceToDraftOptionsGenerator._createRefsLookupMap(draftTraceMap.aggregates || []);
        const enumerationRefsMap = AddTraceToDraftOptionsGenerator._createRefsLookupMap(draftTraceMap.enumerations || []);
        const valueObjectRefsMap = AddTraceToDraftOptionsGenerator._createRefsLookupMap(draftTraceMap.valueObjects || []);

        // Process each draft option
        for (const draftOption of generatedDraftOptions) {
            if (!draftOption.structure) continue;

            // Process each structure in the draft option
            for (const structure of draftOption.structure) {
                // Add refs to aggregate
                if (structure.aggregate && structure.aggregate.name) {
                    const refs = aggregateRefsMap[structure.aggregate.name];
                    if (refs) {
                        structure.aggregate.refs = refs;
                    }
                }

                // Add refs to enumerations
                if (structure.enumerations) {
                    for (const enumeration of structure.enumerations) {
                        if (enumeration.name) {
                            const refs = enumerationRefsMap[enumeration.name];
                            if (refs) {
                                enumeration.refs = refs;
                            }
                        }
                    }
                }

                // Add refs to value objects
                if (structure.valueObjects) {
                    for (const valueObject of structure.valueObjects) {
                        if (valueObject.name) {
                            const refs = valueObjectRefsMap[valueObject.name];
                            if (refs) {
                                valueObject.refs = refs;
                            }
                        }
                    }
                }
            }
        }

        return generatedDraftOptions;
    }

    static _createRefsLookupMap(domainObjects) {
        const map = {};
        if (!Array.isArray(domainObjects)) {
            return map;
        }

        for (const obj of domainObjects) {
            if (obj.name && obj.refs) {
                map[obj.name] = obj.refs;
            }
        }
        return map;
    }


    onGenerateBefore(inputParams){
        this.__validateClientInput(inputParams)

        inputParams.lineNumberedRequirements = TextTraceUtil.addLineNumbers(
            inputParams.functionalRequirements, 1, true
        )
        inputParams.allDomainObjects = this._extractAllDomainObjects(inputParams.generatedDraftOptions)
        inputParams.filteredGeneratedDraftOptions = this._filterGeneratedDraftOptions(inputParams.generatedDraftOptions)
    }
    __validateClientInput(inputParams){
        DataValidationUtil.validateData(inputParams, {
            type: 'object',
            properties: {
                generatedDraftOptions: {
                    type: 'array',
                    minLength: 1,
                    items: {
                        type: 'object',
                        properties: {
                            structure: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        aggregate: {
                                            type: 'object',
                                            required: false,
                                            properties: {
                                                name: { 
                                                    type: 'string', 
                                                    minLength: 1 
                                                }
                                            }
                                        },
                                        enumerations: {
                                            type: 'array',
                                            required: false,
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: { 
                                                        type: 'string', 
                                                        minLength: 1 
                                                    }
                                                }
                                            }
                                        },
                                        valueObjects: {
                                            type: 'array',
                                            required: false,
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: { 
                                                        type: 'string', 
                                                        minLength: 1 
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                boundedContextName: { 
                    type: 'string', 
                    minLength: 1 
                },
                functionalRequirements: { 
                    type: 'string', 
                    minLength: 1 
                },
                traceMap: {
                    type: 'object',
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            refs: {
                                type: 'array',
                                items: {
                                    type: 'array',
                                    length: 2,
                                    items: {
                                        type: 'array',
                                        length: 2,
                                        items: {
                                            type: 'number'
                                        }
                                    }
                                }
                            },
                            isDirectMatching: { 
                                type: 'boolean' 
                            }
                        }
                    }
                }
            }
        });
    }

    _extractAllDomainObjects(generatedDraftOptions) {
        const allObjects = {
            aggregates: [],
            enumerations: [],
            valueObjects: []
        }

        for (const option of generatedDraftOptions) {
            // Check if option has structure property (new format)
            const structureArray = option.structure || option;
            
            for (const aggregateInfo of structureArray) {
                // Add aggregate
                if (aggregateInfo.aggregate && aggregateInfo.aggregate.name) {
                    allObjects.aggregates.push({
                        name: aggregateInfo.aggregate.name,
                        alias: aggregateInfo.aggregate.alias
                    })
                }

                // Add enumerations
                if (aggregateInfo.enumerations) {
                    for (const enumeration of aggregateInfo.enumerations) {
                        if (enumeration.name) {
                            allObjects.enumerations.push({
                                name: enumeration.name,
                                alias: enumeration.alias
                            })
                        }
                    }
                }

                // Add value objects
                if (aggregateInfo.valueObjects) {
                    for (const valueObject of aggregateInfo.valueObjects) {
                        if (valueObject.name) {
                            allObjects.valueObjects.push({
                                name: valueObject.name,
                                alias: valueObject.alias
                            })
                        }
                    }
                }
            }
        }

        // Remove duplicates based on name
        allObjects.aggregates = [...new Map(allObjects.aggregates.map(item => [item.name, item])).values()]
        allObjects.enumerations = [...new Map(allObjects.enumerations.map(item => [item.name, item])).values()]
        allObjects.valueObjects = [...new Map(allObjects.valueObjects.map(item => [item.name, item])).values()]

        return allObjects
    }

    _filterGeneratedDraftOptions(generatedDraftOptions) {
        const filteredGeneratedDraftOptions = []
        for(const option of generatedDraftOptions) {
            const filteredStructure = []
            for(const structure of option.structure) {
                const filteredAggregateInfo = {
                    aggregate: {
                        name: "",
                        alias: ""
                    },
                    enumerations: [],
                    valueObjects: []
                }

                if(structure.aggregate) {
                    filteredAggregateInfo.aggregate.name = structure.aggregate.name
                    filteredAggregateInfo.aggregate.alias = structure.aggregate.alias
                }
                if(structure.enumerations) {
                    filteredAggregateInfo.enumerations = structure.enumerations.map(enumeration => ({
                        name: enumeration.name,
                        alias: enumeration.alias
                    }))
                }
                if(structure.valueObjects) {
                    filteredAggregateInfo.valueObjects = structure.valueObjects.map(valueObject => ({
                        name: valueObject.name,
                        alias: valueObject.alias
                    }))
                }

                filteredStructure.push(filteredAggregateInfo)
            }
            if(filteredStructure.length === 0) continue;
            filteredGeneratedDraftOptions.push(filteredStructure)
        }
        return filteredGeneratedDraftOptions
    }


    __buildPersonaInfo() {
        return {
            persona: "Domain-Driven Design (DDD) Traceability Expert",
            goal: "To establish precise traceability mappings between pre-generated domain objects and their source functional requirements, ensuring every domain element has clear justification in the business requirements.",
            backstory: "With extensive expertise in Domain-Driven Design and requirements traceability, I specialize in analyzing functional requirements to identify specific text segments that justify domain object creation. I excel at creating precise mappings between domain model elements (aggregates, enumerations, value objects) and their source requirements. My role ensures that every domain object has clear, traceable justification in the business requirements, maintaining a strong link between business needs and technical implementation. I understand that effective traceability is crucial for domain model validation, change impact analysis, and maintaining alignment between business requirements and system design."
        }
    }

    __buildTaskGuidelinesPrompt(){
        return `<instruction>
    <core_instructions>
        <title>Domain Object Traceability Mapping Task</title>
        <task_description>Your task is to add traceability information (refs) to pre-generated domain objects by mapping them to specific parts of the functional requirements. You must establish clear traceability links that justify the existence of each domain object.</task_description>
        
        <input_description>
            <title>You will be given:</title>
            <item id="1">**Generated Draft Options:** Pre-generated domain objects (aggregates, enumerations, value objects) that need traceability</item>
            <item id="2">**Functional Requirements:** Line-numbered business requirements document</item>
            <item id="3">**Bounded Context Name:** The target bounded context for these domain objects</item>
            <item id="4">**Domain Objects to Trace:** Complete list of all domain objects requiring traceability</item>
        </input_description>

        <guidelines>
            <title>Traceability Mapping Guidelines</title>
            
            <section id="requirements_analysis">
                <title>Requirements Analysis Process</title>
                <rule id="1">**Business Context Understanding:** Carefully analyze the functional requirements to understand the business domain and context</rule>
                <rule id="2">**Concept Identification:** Identify text segments that describe business concepts, entities, processes, and data elements</rule>
                <rule id="3">**Explicit Mentions:** Look for explicit mentions of entities, statuses, enumerations, processes, and business rules</rule>
                <rule id="4">**Conceptual Relationships:** Consider both direct mentions and implied conceptual relationships in the requirements</rule>
            </section>

            <section id="domain_object_mapping">
                <title>Domain Object Mapping Strategy</title>
                <rule id="1">**Justification Matching:** For each domain object, find the specific requirement text that justifies its creation</rule>
                <rule id="2">**Name Alignment:** Match object names and aliases to corresponding business concepts in the requirements</rule>
                <rule id="3">**Type-Specific Mapping:** Apply appropriate mapping strategies for different object types:
                    - **Aggregates:** Map to entity descriptions, business object definitions, or core domain concepts
                    - **Enumerations:** Map to status values, type classifications, or categorical data mentions
                    - **Value Objects:** Map to attribute groups, specification descriptions, or composite data elements</rule>
                <rule id="4">**Complete Coverage:** Every provided domain object must be mapped with at least one traceability reference</rule>
            </section>

            <section id="traceability_reference_format">
                <title>Traceability Reference (refs) Format</title>
                <rule id="1">**Mandatory Refs:** Each domain object MUST include a 'refs' array containing precise references to requirement text</rule>
                <rule id="2">**Format Structure:** Use format [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]</rule>
                <rule id="3">**Minimal Phrases:** Use MINIMAL phrases (1-2 words) that uniquely identify the position in the requirement line</rule>
                <rule id="4">**Shortest Identification:** Use the shortest possible phrase that can accurately locate the specific part of requirements</rule>
                <rule id="5">**Valid Line Numbers:** Only reference line numbers that exist in the provided functional requirements section</rule>
                <rule id="6">**Multiple References:** Include multiple ranges if a domain object is derived from multiple requirement sections</rule>
                <rule id="7">**Precision:** Ensure referenced text actually supports and justifies the existence of the domain object</rule>
            </section>

            <section id="accuracy_requirements">
                <title>Precision and Accuracy Standards</title>
                <rule id="1">**Exact Segments:** Be precise in identifying the exact text segments that justify each domain object</rule>
                <rule id="2">**Avoid Vagueness:** Avoid generic or vague references that don't clearly support the domain object</rule>
                <rule id="3">**Verification:** Ensure that the referenced text actually justifies the domain object's existence and characteristics</rule>
                <rule id="4">**Comprehensive Mapping:** If multiple requirement sections contribute to a single domain object, include all relevant references</rule>
            </section>
        </guidelines>

        <refs_format_example>
            <title>Example of refs Format for Domain Objects</title>
            <description>If functional requirements contain:</description>
            <example_requirements>
<1># Hotel Room Management System</1>
<2></2>
<3>Room registration with room number, type, and capacity</3>
<4>Room status tracking (Available, Occupied, Cleaning)</4>
<5>Maintenance scheduling for room repairs</5>
<6>Housekeeping staff can update cleaning status</6>
            </example_requirements>
            <example_traceability>
- **"Room" aggregate** based on room registration → refs: [[[3, "Room"], [3, "capacity"]]]
- **"RoomStatus" enumeration** for status values → refs: [[[4, "status"], [4, "Cleaning"]]]
- **"MaintenanceSchedule" value object** for repair tracking → refs: [[[5, "Maintenance"], [5, "repairs"]]]
            </example_traceability>
            <format_explanation>
- The refs array contains ranges where each range is [[startLine, startPhrase], [endLine, endPhrase]]
- Phrases should be MINIMAL words (1-2 words) that uniquely identify the position
- Use the shortest possible phrase that can locate the specific part of requirements
- Multiple ranges can be included if a domain object references multiple requirement sections
            </format_explanation>
        </refs_format_example>
    </core_instructions>
    
    <output_format>
        <title>JSON Output Format</title>
        <description>The output must be a JSON object structured as follows:</description>
        <schema>
{
    "aggregates": [
        {
            "name": "(Aggregate name matching provided domain objects)",
            "refs": [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]
        }
    ],
    "enumerations": [
        {
            "name": "(Enumeration name matching provided domain objects)",
            "refs": [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]
        }
    ],
    "valueObjects": [
        {
            "name": "(Value object name matching provided domain objects)",
            "refs": [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]
        }
    ]
}
        </schema>
        <field_requirements>
            <requirement id="1">All domain object names must exactly match the names provided in the input</requirement>
            <requirement id="2">Every domain object from the input must be included in the output with refs</requirement>
            <requirement id="3">Line numbers in refs must be valid (exist in the requirements document)</requirement>
            <requirement id="4">Phrases in refs must be minimal (1-2 words) and accurately identify the location</requirement>
        </field_requirements>
    </output_format>
</instruction>`
    }

    __buildJsonExampleInputFormat() {
        const requirements = `# Hotel Room Management System

Room registration with room number, type, and capacity
Room status tracking (Available, Occupied, Cleaning)
Maintenance scheduling for room repairs`
        const lineNumberedRequirements = TextTraceUtil.addLineNumbers(requirements, 1, true)

        return {
            "generated_draft_options": XmlUtil.from_dict([
                [
                    {
                        "aggregate": {
                            "name": "Room",
                            "alias": "Hotel Room Information"
                        },
                        "enumerations": [
                            {
                                "name": "RoomStatus",
                                "alias": "Room Status"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "RoomSpecification",
                                "alias": "Room Details"
                            }
                        ]
                    }
                ]
            ]),
            "bounded_context_name": "RoomManagement",
            "functional_requirements": lineNumberedRequirements
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "aggregates": [
                {
                    "name": "Room",
                    "refs": [[[3, "Room"], [3, "capacity"]]]
                }
            ],
            "enumerations": [
                {
                    "name": "RoomStatus",
                    "refs": [[[4, "status"], [4, "Cleaning"]]]
                }
            ],
            "valueObjects": [
                {
                    "name": "RoomSpecification",
                    "refs": [[[3, "room"], [3, "capacity"]]]
                }
            ]
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "generated_draft_options": XmlUtil.from_dict(this.client.input.filteredGeneratedDraftOptions),
            "bounded_context_name": this.client.input.boundedContextName,
            "functional_requirements": this.client.input.lineNumberedRequirements,
            "domain_objects_to_trace": XmlUtil.from_dict(this.client.input.allDomainObjects)
        }
    }


    onThink(returnObj, thinkText){
        returnObj.directMessage = `Adding traceability information to domain objects for ${this.client.input.boundedContextName}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onCreateModelGenerating(returnObj) {
        returnObj.directMessage = `Adding traceability information to domain objects for ${this.client.input.boundedContextName}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }


    onCreateModelFinished(returnObj) {
        returnObj.directMessage = `Successfully added traceability information to ${this._getTotalDomainObjectCount(returnObj.modelValue.output)} domain objects for ${this.client.input.boundedContextName}`
        if (!returnObj.modelValue.aiOutput) return;

        returnObj.modelValue.output = returnObj.modelValue.aiOutput
        if(!this.__isValidOutput(returnObj.modelValue.output, this.client.input.allDomainObjects)) {
            throw new Error("Invalid AI output")
        }

        this._convertRefsToIndexes(returnObj.modelValue.output)
    }
    __isValidOutput(output, allDomainObjects) {
        const objectTypes = ['aggregates', 'enumerations', 'valueObjects'];
        for (const objectType of objectTypes) {
            const outputObjects = output[objectType];
            const domainObjects = allDomainObjects[objectType];

            const outputObjectNames = new Set(outputObjects.map(obj => obj.name));
            for (const domainObject of domainObjects) {
                if (!domainObject.name || !outputObjectNames.has(domainObject.name)) {
                    return false;
                }
            }
        }

        return true;
    }

    _convertRefsToIndexes(output) {
        const rawRequirements = this.client.input.functionalRequirements;
        const lineNumberedRequirements = this.client.input.lineNumberedRequirements;
        const traceMap = this.client.input.traceMap;

        // Convert refs for each type of domain object
        for (const objectType of ['aggregates', 'enumerations', 'valueObjects']) {
            if(!output[objectType]) continue;

            for (const domainObject of output[objectType]) {
                if(!domainObject.refs) continue;

                domainObject.refs = RefsTraceUtil.sanitizeAndConvertRefs(
                    { refs: domainObject.refs }, lineNumberedRequirements, true
                ).refs;
                RefsTraceUtil.validateRefs(domainObject.refs, rawRequirements)
                domainObject.refs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(
                    domainObject.refs, traceMap
                )
            }
        }
    }

    _getTotalDomainObjectCount(output) {
        if (!output) return 0;
        
        const aggregateCount = output.aggregates ? output.aggregates.length : 0;
        const enumerationCount = output.enumerations ? output.enumerations.length : 0;
        const valueObjectCount = output.valueObjects ? output.valueObjects.length : 0;
        
        return aggregateCount + enumerationCount + valueObjectCount;
    }
}

module.exports = AddTraceToDraftOptionsGenerator;