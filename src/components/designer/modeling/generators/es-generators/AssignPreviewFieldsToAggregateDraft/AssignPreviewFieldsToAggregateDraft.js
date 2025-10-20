const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil, XmlUtil } = require("../../utils")
const { traceMapSchema } = require("../../constants")

class AssignPreviewFieldsToAggregateDraft extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.generatorName = "AssignPreviewFieldsToAggregateDraft"
        this.checkInputParamsKeys = ["description", "aggregateDrafts", "generatorKey", "traceMap"]
        this.progressCheckStrings = ["inference", "result"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    aggregateFieldAssignments: z.array(z.object({
                        aggregateName: z.string(),
                        previewFields: z.array(z.object({
                            fieldName: z.string(),
                            refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                        }))
                    }))
                }).strict()
            }).strict(),
            "instruction"
        )
    }


    onGenerateBefore(inputParams){
        if(!this.__isValidClientInput(inputParams)) throw new Error("Invalid client input: " + JSON.stringify(inputParams))

        inputParams.lineNumberedRequirements = TextTraceUtil.addLineNumbers(inputParams.description, 1, true)
    }
    __isValidClientInput(inputParams){
        const inputParamsSchema = {
            type: 'object',
            properties: {
                description: { 
                    type: 'string', 
                    required: true,
                    minLength: 1
                },
                aggregateDrafts: {
                    type: 'array',
                    required: true,
                    minLength: 1,
                    items: {
                        type: 'object',
                        properties: {
                            name: { 
                                type: 'string', 
                                required: true,
                                minLength: 1
                            }
                        },
                        additionalProperties: true
                    }
                },
                generatorKey: { 
                    type: 'string', 
                    required: true,
                    minLength: 1
                },
                traceMap: {
                    required: true
                    // traceMap validation will be handled separately with traceMapSchema
                }
            },
            additionalProperties: true
        };

        if (!DataValidationUtil.isValidData(inputParams, inputParamsSchema)) {
            console.error("AssignPreviewFieldsToAggregateDraft: inputParams structure is invalid")
            return false
        }

        // Validate traceMap with specific schema
        if(!DataValidationUtil.isValidData(inputParams.traceMap, traceMapSchema)) {
            console.error("AssignPreviewFieldsToAggregateDraft: traceMap is not valid")
            return false
        }

        return true
    }
    
    __buildPersonaInfo() {
        return {
            persona: "Domain-Driven Design (DDD) Field Generation Specialist",
            goal: "To analyze functional requirements and aggregate draft structures within a bounded context, then intelligently generate appropriate field names for each aggregate based on domain semantics and business logic. Your primary function is to create comprehensive and semantically correct field sets that accurately represent the data each aggregate should contain according to the business requirements.",
            backstory: "With extensive experience in domain modeling and database design, I specialize in translating business requirements into concrete data structures. I understand how to analyze functional requirements, identify the key data elements needed for each business concept, and generate appropriate field names that reflect both technical best practices and domain semantics. My expertise lies in understanding business context, aggregate responsibilities, and creating field sets that support the intended business operations."
        }
    }

    __buildTaskGuidelinesPrompt() {
        return `<instruction>
    <core_instructions>
        <title>Aggregate Field Generation Task</title>
        <task_description>Your task is to analyze functional requirements and generate appropriate field names with traceability information for each aggregate draft in a bounded context. Generate comprehensive and semantically correct field sets that accurately represent the data each aggregate should contain according to the business requirements.</task_description>
        
        <input_description>
            <title>You will be given:</title>
            <item id="1">**Functional Requirements:** The business context and domain description for the bounded context with line numbers for traceability</item>
            <item id="2">**Aggregate Drafts:** A list of planned aggregates with their names and basic structure information</item>
        </input_description>

        <guidelines>
            <title>Field Generation Guidelines</title>
            
            <section id="field_generation_rules">
                <title>Field Generation Rules</title>
                <rule id="1">**Business-Driven Generation:** Generate fields that directly support the business operations described in the functional requirements</rule>
                <rule id="2">**Complete Coverage:** Each aggregate should have a comprehensive set of fields that covers its full responsibility scope</rule>
                <rule id="3">**Avoid Duplication:** Each field concept should appear in only one aggregate unless there's a clear business need for duplication</rule>
                <rule id="4">**Domain Semantics:** Field names should reflect the business language and concepts used in the domain</rule>
                <rule id="5">**Consistent Naming:** Use consistent naming patterns across all aggregates (e.g., snake_case, clear prefixes/suffixes)</rule>
            </section>

            <section id="field_categories">
                <title>Standard Field Categories</title>
                <rule id="1">**Identity Fields:** Each aggregate should have a primary identifier (e.g., "user_id", "order_id")</rule>
                <rule id="2">**Core Business Fields:** Fields that represent the main business data for the aggregate</rule>
                <rule id="3">**Lifecycle Fields:** Standard fields like "created_at", "updated_at", "status" where relevant</rule>
                <rule id="4">**Relationship Fields:** Foreign key references to other aggregates when relationships exist</rule>
                <rule id="5">**Metadata Fields:** Additional fields for versioning, auditing, or technical requirements when needed</rule>
            </section>

            <section id="domain_context">
                <title>Domain Context Considerations</title>
                <rule id="1">**Business Operations:** Consider what operations will be performed on each aggregate and what data they require</rule>
                <rule id="2">**State Management:** Include fields needed to track the aggregate's state through its lifecycle</rule>
                <rule id="3">**Business Rules:** Generate fields that support the business rules and constraints mentioned in the requirements</rule>
                <rule id="4">**User Interactions:** Consider what data users will need to view, create, or modify for each aggregate</rule>
            </section>

            <section id="inference_process">
                <title>Inference Process</title>
                <rule id="1">**Domain Analysis:** Begin by understanding the business domain and identifying the core responsibilities of each aggregate</rule>
                <rule id="2">**Extract Data Requirements:** From the functional requirements, identify what data is needed to support the described business operations</rule>
                <rule id="3">**Map Data to Aggregates:** Assign data concepts to the most appropriate aggregate based on business ownership and responsibility</rule>
                <rule id="4">**Apply Domain Language:** Use terminology and naming conventions that match the business domain vocabulary</rule>
                <rule id="5">**Validate Business Logic:** Ensure the generated fields support the business operations and rules described in the requirements</rule>
                <rule id="6">**Document Reasoning:** Clearly explain your field generation decisions, especially for complex or ambiguous cases</rule>
            </section>

            <section id="traceability">
                <title>Source Traceability Requirements</title>
                <rule id="1">**Mandatory Refs:** Each field MUST include a 'refs' array that traces back to specific parts of the functional requirements</rule>
                <rule id="2">**Refs Format:** Use format [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]</rule>
                <rule id="3">**Minimal Phrases:** Use 1-2 word phrases that uniquely identify the position in the requirement text</rule>
                <rule id="4">**Valid Line Numbers:** Refs must reference valid line numbers from the provided functional requirements section</rule>
                <rule id="5">**Multiple References:** Multiple reference ranges can be included if a field is derived from multiple requirement sections</rule>
                <rule id="6">**Complete Traceability:** Every generated field must have at least one traceability reference</rule>
            </section>

            <section id="quality">
                <title>Quality Guidelines</title>
                <rule id="1">**Appropriate Granularity:** Generate fields at the right level of detail - not too generic, not overly specific</rule>
                <rule id="2">**Future-Friendly:** Consider reasonable extensions and modifications that might be needed</rule>
                <rule id="3">**Precision and Accuracy:** Be precise in identifying the exact text segments that justify each field</rule>
            </section>
        </guidelines>

        <refs_format_example>
            <title>Example of refs Format for Field Traceability</title>
            <description>If functional requirements contain:</description>
            <example_requirements>
<1># Course Management System</1>
<2></2> 
<3>As an instructor, I want to create and manage my courses. When creating a course, I need to provide a title, description, and price.</3>
<4>Students can enroll in published courses.</4>
<5></5>
<6>## Key Events</6>
<7>- CourseCreated</7>
<8>- CoursePublished</8>
<9>- StudentEnrolled</9>
            </example_requirements>
            <example_refs>
- "course_id" field for Course aggregate → refs: [[[3, "create"], [3, "courses"]]]
- "title" field based on course creation → refs: [[[3, "title"], [3, "price"]]]
- "status" field for course lifecycle → refs: [[[7, "CourseCreated"], [8, "CoursePublished"]]]
- "student_id" field for enrollment → refs: [[[4, "Students"], [9, "StudentEnrolled"]]]
            </example_refs>
            <note>The refs array contains ranges where each range is [[startLine, startPhrase], [endLine, endPhrase]]. Use the shortest possible phrase that can locate the specific part of requirements.</note>
        </refs_format_example>
    </core_instructions>
    
    <output_format>
        <title>JSON Output Format</title>
        <description>The output must be a JSON object structured as follows:</description>
        <schema>
{
    "inference": "(Detailed reasoning for the field generation, including analysis of the domain context and explanation of field choices for each aggregate)",
    "result": {
        "aggregateFieldAssignments": [
            {
                "aggregateName": "(name_of_aggregate)",
                "previewFields": [
                    {
                        "fieldName": "(field_name_1)",
                        "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
                    },
                    {
                        "fieldName": "(field_name_2)",
                        "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
                    }
                ]
            }
        ]
    }
}
        </schema>
        <field_requirements>
            <requirement id="1">All field names must use consistent naming patterns (e.g., snake_case)</requirement>
            <requirement id="2">Every field must include a refs array with valid line number references</requirement>
            <requirement id="3">Aggregate names must match the names provided in the input Aggregate Drafts</requirement>
        </field_requirements>
    </output_format>
</instruction>`;
    }

    __buildJsonExampleInputFormat() {
        const functionalRequirements = `# Bounded Context Overview: CourseManagement

## Role
This context is responsible for the entire lifecycle of a course, including its creation, management, and tracking. It handles course content, instructor assignments, pricing, and status changes (e.g., Draft, Published, Archived). It also manages student enrollments in courses.

## User Story
As an instructor, I want to create and manage my courses on the platform. When creating a course, I need to provide a title, description, and price. Students can enroll in published courses, and I need to track these enrollments.
8.
## Key Events
- CourseCreated
- CoursePublished  
- CoursePriceUpdated
- CourseArchived
- StudentEnrolled
- StudentDropped`
        const lineNumberedRequirements = TextTraceUtil.addLineNumbers(functionalRequirements, 1, true);

        return {
            "Functional Requirements": lineNumberedRequirements,
            "Aggregate Drafts": XmlUtil.from_dict([
                {
                    "name": "Course",
                    "alias": "Online Course"
                },
                {
                    "name": "Enrollment", 
                    "alias": "Course Enrollment"
                }
            ])
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": "I analyzed the CourseManagement domain and generated comprehensive field sets for each aggregate with traceability information. For the Course aggregate, I included identification (course_id), core business data (title, description, price_amount, price_currency), instructor relationship (instructor_id), lifecycle management (status, created_at, updated_at), and content management fields. Each field is traced back to specific requirements that justify its creation. For the Enrollment aggregate, I focused on the student-course relationship with identification (enrollment_id), relationship fields (student_id, course_id), enrollment tracking (enrollment_date, status), and progress monitoring (completion_status, progress_percentage), all with proper traceability.",
            "result": {
                "aggregateFieldAssignments": [
                    {
                        "aggregateName": "Course",
                        "previewFields": [
                            {
                                "fieldName": "course_id",
                                "refs": [[[7, "create"], [7, "courses"]]]
                            },
                            {
                                "fieldName": "title",
                                "refs": [[[7, "title"], [7, "price"]]]
                            },
                            {
                                "fieldName": "description", 
                                "refs": [[[7, "description"], [7, "price"]]]
                            },
                            {
                                "fieldName": "instructor_id",
                                "refs": [[[7, "instructor"], [7, "courses"]]]
                            },
                            {
                                "fieldName": "status",
                                "refs": [[[11, "CoursePublished"], [13, "CourseArchived"]]]
                            },
                            {
                                "fieldName": "price_amount",
                                "refs": [[[7, "price"], [12, "CoursePriceUpdated"]]]
                            },
                            {
                                "fieldName": "created_at",
                                "refs": [[[10, "CourseCreated"], [10, "CourseCreated"]]]
                            },
                            {
                                "fieldName": "updated_at",
                                "refs": [[[12, "CoursePriceUpdated"], [12, "CoursePriceUpdated"]]]
                            }
                        ]
                    },
                    {
                        "aggregateName": "Enrollment",
                        "previewFields": [
                            {
                                "fieldName": "enrollment_id",
                                "refs": [[[14, "StudentEnrolled"], [14, "StudentEnrolled"]]]
                            },
                            {
                                "fieldName": "student_id",
                                "refs": [[[7, "Students"], [14, "StudentEnrolled"]]]
                            },
                            {
                                "fieldName": "course_id", 
                                "refs": [[[7, "courses"], [14, "StudentEnrolled"]]]
                            },
                            {
                                "fieldName": "enrollment_date",
                                "refs": [[[14, "StudentEnrolled"], [14, "StudentEnrolled"]]]
                            },
                            {
                                "fieldName": "status",
                                "refs": [[[14, "StudentEnrolled"], [15, "StudentDropped"]]]
                            }
                        ]
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Functional Requirements": this.client.input.lineNumberedRequirements,
            "Aggregate Drafts": XmlUtil.from_dict(this.client.input.aggregateDrafts)
        } 
    }


    onThink(returnObj, thinkText){
        returnObj.directMessage = `Generating preview fields for aggregates in ${this.client.input.generatorKey}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onModelCreatedWithThinking(returnObj){
        returnObj.directMessage = `Generating preview fields for aggregates in ${this.client.input.generatorKey}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
        if(!returnObj.modelValue.aiOutput.result) return

        const aggregateFieldAssignments = returnObj.modelValue.aiOutput.result.aggregateFieldAssignments
        returnObj.modelValue = {
            ...returnObj.modelValue,
            output: aggregateFieldAssignments,
        }
        if(!returnObj.isFinished) return

        this._convertRefsToIndexes(returnObj.modelValue.output)
    }

    _convertRefsToIndexes(aggregateFieldAssignments) {
        const rawRequirements = this.client.input.description;
        const lineNumberedRequirements = this.client.input.lineNumberedRequirements;
        const traceMap = this.client.input.traceMap;

        for (const assignment of aggregateFieldAssignments) {
            for (const field of assignment.previewFields) {
                field.refs = RefsTraceUtil.sanitizeAndConvertRefs(
                    { refs: field.refs }, lineNumberedRequirements, true
                ).refs;
                RefsTraceUtil.validateRefs(field.refs, rawRequirements)
                field.refs = RefsTraceUtil.convertToOriginalRefsUsingTraceMap(field.refs, traceMap)
            }
        }

        this.__sanitizeFieldGeneration(aggregateFieldAssignments)
        this.__validateFieldGeneration(aggregateFieldAssignments)
    }
    __sanitizeFieldGeneration(aggregateFieldAssignments) {
        return aggregateFieldAssignments.map(assignment => ({
            aggregateName: assignment.aggregateName,
            previewFields: assignment.previewFields.filter(
                field => field.fieldName.replace(/[^a-zA-Z0-9_]/g, '') === field.fieldName
            )
        }))
    }
    __validateFieldGeneration(aggregateFieldAssignments) {
        // 각 애그리거트가 최소한의 필드를 가지고 있는지 확인
        for(const assignment of aggregateFieldAssignments) {
            if(!assignment.previewFields || assignment.previewFields.length === 0) {
                throw new Error(`Aggregate "${assignment.aggregateName}" has no generated fields. Each aggregate must have at least one field.`)
            }
        }
    }
}

module.exports = AssignPreviewFieldsToAggregateDraft;