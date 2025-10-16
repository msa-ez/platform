const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const DDLLineRefSplitter = require("./DDLLineRefSplitter")

const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("../../utils")

class ExtractDDLFieldsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client, {}, "thinkingModel", true);

        this.generatorName = "ExtractDDLFieldsGenerator"
        this.checkInputParamsKeys = ["ddlRequirements", "boundedContextName"]
        this.progressCheckStrings = ["inference", "result"]

        this.initialResponseFormat = zodResponseFormat(
            z.object({
                inference: z.string(),
                result: z.object({
                    ddlFieldRefs: z.array(z.object({
                        fieldName: z.string(),
                        refs: z.array(z.array(z.array(z.union([z.number(), z.string()]))))
                    }))
                }).strict()
            }).strict(),
            "instruction"
        )
    }


    async onGenerateBefore(inputParams, generatorName){
        this.__validateInputParams(inputParams)
        inputParams.ddl = inputParams.ddlRequirements.map(ddlRequirement => ddlRequirement.text).join("\n")
        inputParams.ddlLines = inputParams.ddl.split("\n")
        inputParams.lineTraceMap = this._buildLineTraceMap(inputParams.ddlRequirements)
    }
    __validateInputParams(inputParams){
        DataValidationUtil.validateData(inputParams, {
            type: 'object',
            properties: {
                ddlRequirements: { 
                    type: 'array', 
                    required: true, 
                    minLength: 1,
                    items: {
                        type: 'object',
                        properties: {
                            text: { 
                                type: 'string', 
                                required: true,
                                minLength: 1
                            },
                            refs: {
                                type: 'array',
                                required: true,
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'array',
                                        length: 2,
                                        items: {
                                            type: 'number'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                boundedContextName: { 
                    type: 'string', 
                    required: true, 
                    minLength: 1
                }
            }
        });
    }
    
    _buildLineTraceMap(ddlRequirements) {
        const lineTraceMap = {}
        let currentMergedLine = 1
        
        for (const ddlRequirement of ddlRequirements) {
            const lines = ddlRequirement.text.split('\n')
            
            // refs에서 시작 라인 번호 추출 (첫 번째 ref의 첫 번째 좌표의 라인 번호)
            if (ddlRequirement.refs && ddlRequirement.refs.length > 0 && ddlRequirement.refs[0].length > 0) {
                const originalStartLine = ddlRequirement.refs[0][0][0]
                
                // 각 라인을 매핑
                for (let i = 0; i < lines.length; i++) {
                    lineTraceMap[currentMergedLine + i] = originalStartLine + i
                }
                
                currentMergedLine += lines.length
            }
        }
        
        return lineTraceMap
    }


    __buildPersonaInfo() {
        return {
            persona: "Expert SQL Parsing Specialist",
            goal: "To accurately extract all field (column) names from provided Data Definition Language (DDL) text with precise position traceability, regardless of SQL dialect or formatting inconsistencies.",
            backstory: "I am a highly specialized parsing engine designed to understand and deconstruct SQL DDL. I have been trained on a vast corpus of SQL schemas from various databases like MySQL, PostgreSQL, Oracle, and SQL Server. I can cut through complex formatting, comments, and varied syntax to reliably identify the fundamental column definitions that form the blueprint of a database table. My sole focus is precision and completeness in field extraction with accurate source traceability."
        }
    }

    __buildTaskGuidelinesPrompt(){
        return `<instruction>
    <core_instructions>
        <title>DDL Field Extraction Task</title>
        <task_description>Your task is to analyze the provided line-numbered DDL (Data Definition Language) text and identify every valid field (column) name with its precise position references. You must extract column names from CREATE TABLE statements and provide traceable references back to the source DDL.</task_description>
        
        <input_description>
            <title>You will be given:</title>
            <item id="1">**Line-Numbered DDL:** DDL text with line numbers for traceability</item>
            <item id="2">**Line Number Validation Note:** Guidelines for ensuring valid line number references</item>
        </input_description>

        <guidelines>
            <title>DDL Field Extraction Guidelines</title>
            
            <section id="parsing_strategy">
                <title>Parsing Strategy</title>
                <rule id="1">**Focus on CREATE TABLE:** Scan the input text specifically for \`CREATE TABLE\` statements</rule>
                <rule id="2">**Parse Column Definitions:** For each table found, meticulously parse the column definitions between the parentheses \`()\`</rule>
                <rule id="3">**Extract Column Names Only:** Extract only the column names. Ignore data types, constraints (like \`NOT NULL\`, \`PRIMARY KEY\`, \`FOREIGN KEY\`), default values, and comments</rule>
                <rule id="4">**Consolidate All Fields:** If there are multiple tables defined, gather all column names from all tables into one single list</rule>
                <rule id="5">**No Inference:** Do not infer or create any names. Only extract what is explicitly defined in the DDL</rule>
            </section>

            <section id="filtering_rules">
                <title>Filtering and Validation Rules</title>
                <rule id="1">**Uniqueness:** Ensure the final list of fields contains no duplicates. Each field name should appear only once, even if it's defined in multiple tables</rule>
                <rule id="2">**Ignore Comments:** Do not extract any text from SQL comments (lines starting with \`--\` or blocks enclosed in \`/* ... */\`). Any potential field names within comments must be ignored</rule>
                <rule id="3">**Field Name Language Check:** Only extract field names (column names) written in English. The field name itself must contain only English characters. However, the values in ENUM definitions, default values, or other constraints can be in any language (including Korean or other non-ASCII characters). For example, \`category ENUM('소설', '비소설', '학술', '잡지')\` has an English field name \`category\` and should be extracted, even though the ENUM values are in Korean</rule>
                <rule id="4">**Valid Characters:** Field names should only consist of letters, numbers, and underscores (\_). They typically start with a letter. Ignore any text quoted in backticks that does not follow this format</rule>
                <rule id="5">**Ignore ENUM Values:** Do not extract the values listed within an \`ENUM(...)\` definition. For example, from \`status ENUM('ACTIVE', 'INACTIVE')\`, you should only identify \`status\` as the field, and ignore \`'ACTIVE'\` and \`'INACTIVE'\`. The same applies to ENUM values in any language: from \`category ENUM('소설', '비소설')\`, extract only \`category\` as the field name</rule>
                <rule id="6">**Handle Formatting Inconsistencies:** The DDL might have inconsistent formatting, comments, or vary in SQL dialect. Your process should be robust enough to handle this</rule>
            </section>

            <section id="traceability">
                <title>Source Traceability Requirements</title>
                <rule id="1">**Mandatory Refs:** For each field found, return the field name along with its position reference in the DDL text</rule>
                <rule id="2">**Refs Format:** Use format [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]</rule>
                <rule id="3">**Minimal Phrases:** Use 1-2 word phrases that uniquely identify the position in the line</rule>
                <rule id="4">**Exact Position:** The references should point to the exact location in the line-numbered DDL where the field name appears</rule>
                <rule id="5">**Valid Line Numbers:** Refs must reference valid line numbers from the DDL text</rule>
            </section>

            <section id="inference_requirements">
                <title>Inference Requirements</title>
                <rule id="1">**State the Goal:** Begin by stating the primary goal, which is to extract all unique column names from the provided DDL</rule>
                <rule id="2">**Describe the Process:** Briefly explain the steps taken, such as scanning for \`CREATE TABLE\` statements, parsing the column definitions, and filtering out non-column name elements</rule>
                <rule id="3">**Mention Tables Found:** If useful for clarity, mention the names of the tables from which fields were extracted</rule>
                <rule id="4">**Confirm Consolidation:** Note that fields from all identified tables have been consolidated into a single, unique list</rule>
                <rule id="5">**Handle Empty Input:** If the DDL was empty or lacked \`CREATE TABLE\` statements, explicitly state that this is why the field list is empty and return an empty list for \`ddlFieldRefs\`</rule>
            </section>
        </guidelines>

        <refs_format_example>
            <title>Example of refs Format</title>
            <description>If DDL contains:</description>
            <example_ddl>
<3>    \`course_id\` BIGINT AUTO_INCREMENT PRIMARY KEY,</3>
<4>    title VARCHAR(255) NOT NULL,</4>
<8>    status ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',</8>
<9>    category ENUM('강의', '실습', '세미나') NOT NULL,</9>
            </example_ddl>
            <example_refs>
- "course_id" field → refs: [[[3, "course_id"], [3, "KEY"]]]
- "title" field → refs: [[[4, "title"], [4, "NULL"]]]
- "status" field → refs: [[[8, "status"], [8, "'DRAFT'"]]]
- "category" field → refs: [[[9, "category"], [9, "NULL"]]]  (Note: Extract "category" even though ENUM values are in Korean)
            </example_refs>
        </refs_format_example>
    </core_instructions>
    
    <output_format>
        <title>JSON Output Format</title>
        <description>The output must be a JSON object structured as follows:</description>
        <schema>
{
    "inference": "(Brief explanation of the extraction process and results)",
    "result": {
        "ddlFieldRefs": [
            {
                "fieldName": "(ColumnName in original case)",
                "refs": [[[(startLineNumber), "(minimal_start_phrase)"], [(endLineNumber), "(minimal_end_phrase)"]]]
            }
        ]
    }
}
        </schema>
        <field_requirements>
            <requirement id="1">All field names must match exactly as they appear in the DDL</requirement>
            <requirement id="2">Each field must include valid refs pointing to its location in the DDL</requirement>
            <requirement id="3">The inference field must explain what was extracted and from which tables</requirement>
            <requirement id="4">Return empty ddlFieldRefs array if no valid fields are found</requirement>
        </field_requirements>
    </output_format>
</instruction>`;
    }

    __buildJsonExampleInputFormat() {
        const ddl = `-- Courses Table
CREATE TABLE \`courses\` (
    \`course_id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id BIGINT NOT NULL,
    -- Status of the course
    status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    category ENUM('강의', '실습', '세미나') NOT NULL,
    price_amount DECIMAL(10, 2),
    price_currency VARCHAR(3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_instructor_id (instructor_id)
);

-- Table for tracking student enrollments
CREATE TABLE enrollments(
    enrollment_id BIGINT PRIMARY KEY,
    student_id BIGINT,
    course_id BIGINT, -- Foreign key to courses
    enrollment_date DATE
);`
        const lineNumberedDDL = TextTraceUtil.addLineNumbers(ddl, 1, true)

        return {
            "DDL": lineNumberedDDL
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": "I have scanned the provided line-numbered DDL, identified two tables: \`courses\` and \`enrollments\`. I located all column names from both definitions with their exact positions, ignored data types and constraints, and consolidated them into a single unique list with position references. Note that fields like \`category\` with Korean ENUM values ('강의', '실습', '세미나') were correctly extracted since the field name itself is in English.",
            "result": {
                "ddlFieldRefs": [
                    {
                        "fieldName": "course_id",
                        "refs": [[[3, "course_id"], [3, "KEY"]]]
                    },
                    {
                        "fieldName": "title", 
                        "refs": [[[4, "title"], [4, "NULL"]]]
                    },
                    {
                        "fieldName": "description",
                        "refs": [[[5, "description"], [5, "TEXT"]]]
                    },
                    {
                        "fieldName": "instructor_id",
                        "refs": [[[6, "instructor_id"], [6, "NULL"]]]
                    },
                    {
                        "fieldName": "status",
                        "refs": [[[8, "status"], [8, "'DRAFT'"]]]
                    },
                    {
                        "fieldName": "category",
                        "refs": [[[9, "category"], [9, "NULL"]]]
                    },
                    {
                        "fieldName": "price_amount",
                        "refs": [[[10, "price_amount"], [10, "DECIMAL(10, 2)"]]]
                    },
                    {
                        "fieldName": "price_currency",
                        "refs": [[[11, "price_currency"], [11, "VARCHAR(3)"]]]
                    },
                    {
                        "fieldName": "created_at",
                        "refs": [[[12, "created_at"], [12, "CURRENT_TIMESTAMP"]]]
                    },
                    {
                        "fieldName": "updated_at",
                        "refs": [[[13, "updated_at"], [13, "UPDATE CURRENT_TIMESTAMP"]]]
                    },
                    {
                        "fieldName": "enrollment_id",
                        "refs": [[[19, "enrollment_id"], [19, "KEY"]]]
                    },
                    {
                        "fieldName": "student_id",
                        "refs": [[[20, "student_id"], [20, "BIGINT"]]]
                    },
                    {
                        "fieldName": "enrollment_date",
                        "refs": [[[22, "enrollment_date"], [22, "DATE"]]]
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "DDL": this._getLineNumberedRequirements()
        } 
    }


    onThink(returnObj, thinkText){
        returnObj.directMessage = `Extracting DDL fields for ${this.client.input.boundedContextName}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
    }

    onModelCreatedWithThinking(returnObj){
        returnObj.directMessage = `Extracting DDL fields for ${this.client.input.boundedContextName}... (${this.getTotalOutputTextLength(returnObj)} characters generated)`
        if(!this.__isValidAIOutput(returnObj.modelValue.aiOutput)) return
        
        const processedFieldRefs = this._convertRefsToIndexes(returnObj.modelValue.aiOutput.result.ddlFieldRefs)
        returnObj.modelValue = {
            ...returnObj.modelValue,
            output: processedFieldRefs
        }
    }
    __isValidAIOutput(aiOutput){
        if(!aiOutput) return false
        if(!aiOutput.result) return false
        if(!aiOutput.result.ddlFieldRefs) return false
        if(!Array.isArray(aiOutput.result.ddlFieldRefs)) return false
        return true
    }

    _convertRefsToIndexes(ddlFieldRefs) {
        // 1단계: 기존 sanitizeAndConvertRefs로 상대 좌표 변환
        const sanitizedRefs = RefsTraceUtil.sanitizeAndConvertRefs(
            ddlFieldRefs, this._getLineNumberedRequirements(), true
        )
        
        // 2단계: 상대 좌표를 절대 좌표로 변환하면서, 여러 ddlRequirements 블록에 걸친 refs를 분할하여 처리
        return DDLLineRefSplitter.convertToAbsoluteRefs(
            sanitizedRefs,
            this.client.input.ddlLines,
            this.client.input.lineTraceMap
        )
    }


    _getLineNumberedRequirements(){
        return TextTraceUtil.addLineNumbers(this.client.input.ddl, 1, true)
    }
}

module.exports = ExtractDDLFieldsGenerator;