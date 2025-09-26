const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("../../utils")

class AddTraceToDraftOptionsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

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

        inputParams.lineNumberedRequirements = TextTraceUtil.addLineNumbers(inputParams.functionalRequirements)
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


    __buildAgentRolePrompt(){
        return `You are a Domain-Driven Design (DDD) traceability expert with extensive expertise in:
- Analyzing functional requirements to identify specific text segments that justify domain object creation
- Creating precise traceability mappings between domain objects and their source requirements
- Understanding the relationship between business requirements and domain model elements
- Ensuring that every domain object (aggregate, enumeration, value object) has clear justification in the requirements

Your role is to establish clear traceability links between pre-generated domain objects and the functional requirements that justify their existence. You must identify the specific text segments in the requirements that led to the creation of each domain object.`
    }

    __buildTaskGuidelinesPrompt(){
        return `You are tasked with adding traceability information (refs) to pre-generated domain objects by mapping them to specific parts of the functional requirements.

Guidelines:

1. Requirement Analysis
   - Carefully analyze the provided functional requirements to understand the business context
   - Identify text segments that describe business concepts, processes, and data elements
   - Look for explicit mentions of entities, statuses, processes, and business rules

2. Domain Object Mapping
   - For each provided domain object (aggregate, enumeration, value object), find the specific requirement text that justifies its creation
   - Match object names and aliases to corresponding business concepts in the requirements
   - Consider both direct mentions and conceptual relationships

3. Traceability Reference Format
   - Each domain object MUST include a 'refs' array that traces back to specific parts of the functional requirements
   - The refs array should contain ranges in the format: [[[startLine, startPhrase], [endLine, endPhrase]]]
   - Use MINIMAL phrases (1-2 words) that uniquely identify the relevant requirement text
   - Use the shortest possible phrase that can locate the specific part of requirements
   - Multiple reference ranges can be included if a domain object is derived from multiple requirement sections
   - Only reference line numbers that exist in the provided functional requirements section

4. Precision and Accuracy
   - Be precise in identifying the exact text segments that justify each domain object
   - Avoid generic or vague references
   - Ensure that the referenced text actually supports the existence of the domain object
   - If a domain object cannot be clearly traced to requirements, indicate this appropriately

5. Coverage Requirements
   - Every provided domain object must have at least one traceability reference
   - If multiple requirement sections contribute to a single domain object, include all relevant references
   - Ensure that the traceability is complete and comprehensive

EXAMPLE of refs format for domain objects:

If functional requirements contain:
1: # Hotel Room Management System
2: 
3: Room registration with room number, type, and capacity
4: Room status tracking (Available, Occupied, Cleaning)
5: Maintenance scheduling for room repairs
6: Housekeeping staff can update cleaning status

And you need to trace domain objects like:
- "Room" aggregate based on room registration -> refs: [[[3, "Room"], [3, "capacity"]]]
- "RoomStatus" enumeration for status values -> refs: [[[4, "status"], [4, "Cleaning"]]]
- "MaintenanceSchedule" valueObject for repair tracking -> refs: [[[5, "Maintenance"], [5, "repairs"]]]

The refs array contains ranges where each range is [[startLine, startPhrase], [endLine, endPhrase]].
The phrases should be MINIMAL words (1-2 words) that uniquely identify the position in the line.
Use the shortest possible phrase that can locate the specific part of requirements.
Multiple ranges can be included if a domain object references multiple parts of requirements.
`
    }

    __buildJsonResponseFormat() {
        return `
{
    "aggregates": [
        {
            "name": "<aggregate_name>",
            "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
        }
    ],
    "enumerations": [
        {
            "name": "<enumeration_name>",
            "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
        }
    ],
    "valueObjects": [
        {
            "name": "<value_object_name>",
            "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
        }
    ]
}
`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Generated Draft Options": [
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
            ],
            "Target Bounded Context Name": "RoomManagement",
            "Functional Requirements": `1: # Hotel Room Management System
2: 
3: Room registration with room number, type, and capacity
4: Room status tracking (Available, Occupied, Cleaning)
5: Maintenance scheduling for room repairs`
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
            "Generated Draft Options": this.client.input.filteredGeneratedDraftOptions,
            "Target Bounded Context Name": this.client.input.boundedContextName,
            "Functional Requirements": this.client.input.lineNumberedRequirements,
            "Domain Objects to Trace": this.client.input.allDomainObjects,
            "Line Number Validation Note": TextTraceUtil.getLineNumberValidationPrompt(this.client.input.lineNumberedRequirements)
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
        const lineNumberedRequirements = this.client.input.lineNumberedRequirements;
        const traceMap = this.client.input.traceMap;

        // Convert refs for each type of domain object
        for (const objectType of ['aggregates', 'enumerations', 'valueObjects']) {
            if(!output[objectType]) continue;

            for (const domainObject of output[objectType]) {
                if(!domainObject.refs) continue;

                domainObject.refs = RefsTraceUtil.sanitizeAndConvertRefs(
                    { refs: domainObject.refs }, 
                    lineNumberedRequirements
                ).refs;
                domainObject.refs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(domainObject.refs, traceMap)
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