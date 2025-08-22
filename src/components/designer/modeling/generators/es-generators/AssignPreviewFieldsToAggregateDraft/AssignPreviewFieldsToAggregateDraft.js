const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { z } = require("zod")
const { zodResponseFormat } = require("../../utils")

class AssignPreviewFieldsToAggregateDraft extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

        this.generatorName = "AssignPreviewFieldsToAggregateDraft"
        this.checkInputParamsKeys = ["description", "aggregateDrafts", "generatorKey"]
        this.progressCheckStrings = ["inference", "result"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    aggregateFieldAssignments: z.array(z.object({
                        aggregateName: z.string(),
                        preview_fields: z.array(z.string())
                    }))
                }).strict()
            }).strict(),
            "instruction"
        )
    }
    
    __buildAgentRolePrompt(){
        return `Role: Domain-Driven Design (DDD) Field Generation Specialist

Goal: To analyze functional requirements and aggregate draft structures within a bounded context, then intelligently generate appropriate field names for each aggregate based on domain semantics and business logic. Your primary function is to create comprehensive and semantically correct field sets that accurately represent the data each aggregate should contain according to the business requirements.

Backstory: With extensive experience in domain modeling and database design, I specialize in translating business requirements into concrete data structures. I understand how to analyze functional requirements, identify the key data elements needed for each business concept, and generate appropriate field names that reflect both technical best practices and domain semantics. My expertise lies in understanding business context, aggregate responsibilities, and creating field sets that support the intended business operations.

Operational Guidelines:
* **Analyze Business Context:** Thoroughly understand the functional requirements to identify what data each aggregate needs to fulfill its responsibilities.
* **Generate Comprehensive Fields:** Create complete field sets that cover all aspects of each aggregate's role in the business domain.
* **Follow Naming Conventions:** Use clear, consistent, and domain-appropriate field naming patterns.
* **Consider Data Relationships:** Generate appropriate reference fields (IDs) and relationship indicators where aggregates interact.
* **Include Lifecycle Fields:** Add standard fields like timestamps, status indicators, and versioning where appropriate.
* **Maintain Domain Coherence:** Ensure each field logically belongs to its assigned aggregate and supports that aggregate's business purpose.
* **Provide Clear Reasoning:** Document the rationale behind field generation decisions to ensure transparency and maintainability.`
    }

    __buildTaskGuidelinesPrompt(){
        return `Your task is to analyze functional requirements and generate appropriate field names for each aggregate draft in a bounded context.

You will be given:
1. **Functional Requirements:** The business context and domain description for the bounded context.
2. **Aggregate Drafts:** A list of planned aggregates with their names and basic structure information.

Please adhere to the following guidelines:

Field Generation Rules:
1. **Business-Driven Generation:** Generate fields that directly support the business operations described in the functional requirements.
2. **Complete Coverage:** Each aggregate should have a comprehensive set of fields that covers its full responsibility scope.
3. **Avoid Duplication:** Each field concept should appear in only one aggregate unless there's a clear business need for duplication.
4. **Domain Semantics:** Field names should reflect the business language and concepts used in the domain.

Standard Field Categories:
5. **Identity Fields:** Each aggregate should have a primary identifier (e.g., "user_id", "order_id").
6. **Core Business Fields:** Fields that represent the main business data for the aggregate.
7. **Lifecycle Fields:** Standard fields like "created_at", "updated_at", "status" where relevant.
8. **Relationship Fields:** Foreign key references to other aggregates when relationships exist.
9. **Metadata Fields:** Additional fields for versioning, auditing, or technical requirements when needed.

Domain Context Considerations:
10. **Business Operations:** Consider what operations will be performed on each aggregate and what data they require.
11. **State Management:** Include fields needed to track the aggregate's state through its lifecycle.
12. **Business Rules:** Generate fields that support the business rules and constraints mentioned in the requirements.
13. **User Interactions:** Consider what data users will need to view, create, or modify for each aggregate.

Quality Guidelines:
14. **Consistent Naming:** Use consistent naming patterns across all aggregates (e.g., snake_case, clear prefixes/suffixes).
15. **Appropriate Granularity:** Generate fields at the right level of detail - not too generic, not overly specific.
16. **Future-Friendly:** Consider reasonable extensions and modifications that might be needed.`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1. **Start with Domain Analysis:** Begin by understanding the business domain and identifying the core responsibilities of each aggregate.
2. **Extract Data Requirements:** From the functional requirements, identify what data is needed to support the described business operations.
3. **Map Data to Aggregates:** Assign data concepts to the most appropriate aggregate based on business ownership and responsibility.
4. **Generate Comprehensive Fields:** For each aggregate, create a complete set of field names that covers:
   - Primary identification
   - Core business attributes
   - State/status tracking
   - Relationships to other aggregates
   - Standard metadata (timestamps, etc.)
5. **Apply Domain Language:** Use terminology and naming conventions that match the business domain vocabulary.
6. **Validate Business Logic:** Ensure the generated fields support the business operations and rules described in the requirements.
7. **Document Reasoning:** Clearly explain your field generation decisions, especially for complex or ambiguous cases.
`
    }

    __buildJsonResponseFormat() {
        return `
{
    "inference": "<Detailed reasoning for the field generation, including analysis of the domain context and explanation of field choices for each aggregate>",
    "result": {
        "aggregateFieldAssignments": [
            {
                "aggregateName": "<name_of_aggregate>",
                "preview_fields": [
                    "<field_name_1>",
                    "<field_name_2>"
                ]
            }
        ]
    }
}
`
    }

    __buildJsonExampleInputFormat() {
        return {
            "Functional Requirements": `
# Bounded Context Overview: CourseManagement

## Role
This context is responsible for the entire lifecycle of a course, including its creation, management, and tracking. It handles course content, instructor assignments, pricing, and status changes (e.g., Draft, Published, Archived). It also manages student enrollments in courses.

## User Story
As an instructor, I want to create and manage my courses on the platform. When creating a course, I need to provide a title, description, and price. Students can enroll in published courses, and I need to track these enrollments.

## Key Events
- CourseCreated
- CoursePublished  
- CoursePriceUpdated
- CourseArchived
- StudentEnrolled
- StudentDropped
`,
            "Aggregate Drafts": [
                {
                    "name": "Course",
                    "alias": "Online Course"
                },
                {
                    "name": "Enrollment", 
                    "alias": "Course Enrollment"
                }
            ]
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": "I analyzed the CourseManagement domain and generated comprehensive field sets for each aggregate. For the Course aggregate, I included identification (course_id), core business data (title, description, price_amount, price_currency), instructor relationship (instructor_id), lifecycle management (status, created_at, updated_at), and content management fields. For the Enrollment aggregate, I focused on the student-course relationship with identification (enrollment_id), relationship fields (student_id, course_id), enrollment tracking (enrollment_date, status), and progress monitoring (completion_status, progress_percentage).",
            "result": {
                "aggregateFieldAssignments": [
                    {
                        "aggregateName": "Course",
                        "preview_fields": [
                            "course_id",
                            "title",
                            "description", 
                            "instructor_id",
                            "status",
                            "price_amount",
                            "price_currency",
                            "duration_hours",
                            "difficulty_level",
                            "created_at",
                            "updated_at",
                            "published_at"
                        ]
                    },
                    {
                        "aggregateName": "Enrollment",
                        "preview_fields": [
                            "enrollment_id",
                            "student_id",
                            "course_id", 
                            "enrollment_date",
                            "status",
                            "completion_status",
                            "progress_percentage",
                            "completed_at",
                            "created_at"
                        ]
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "Functional Requirements": this.client.input.description,
            "Aggregate Drafts": this.client.input.aggregateDrafts
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

        // 생성이 완료되었을 때 검증 로직 수행
        if(returnObj.isFinished) {
            this.__sanitizeFieldGeneration(returnObj.modelValue.output)
            this.__validateFieldGeneration(returnObj.modelValue.output)
        }
    }
    __sanitizeFieldGeneration(aggregateFieldAssignments) {
        return aggregateFieldAssignments.map(assignment => ({
            aggregateName: assignment.aggregateName,
            preview_fields: assignment.preview_fields.filter(
                field => field.replace(/[^a-zA-Z0-9_]/g, '') === field
            )
        }))
    }
    __validateFieldGeneration(aggregateFieldAssignments) {
        // 각 애그리거트가 최소한의 필드를 가지고 있는지 확인
        for(const assignment of aggregateFieldAssignments) {
            if(!assignment.preview_fields || assignment.preview_fields.length === 0) {
                throw new Error(`Aggregate "${assignment.aggregateName}" has no generated fields. Each aggregate must have at least one field.`)
            }
        }
    }
}

module.exports = AssignPreviewFieldsToAggregateDraft;