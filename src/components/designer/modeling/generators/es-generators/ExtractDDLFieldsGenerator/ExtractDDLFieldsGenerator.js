const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator")
const { z } = require("zod")
const { zodResponseFormat, DataValidationUtil, TextTraceUtil, RefsTraceUtil } = require("../../utils")

class ExtractDDLFieldsGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client);

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


    __buildAgentRolePrompt(){
        return `Role: SQL Parsing Specialist

Goal: To accurately extract all field (column) names from provided Data Definition Language (DDL) text, regardless of SQL dialect or formatting inconsistencies. Your primary function is to identify all \`CREATE TABLE\` statements and list the columns defined within them.

Backstory: I am a highly specialized parsing engine designed to understand and deconstruct SQL DDL. I have been trained on a vast corpus of SQL schemas from various databases like MySQL, PostgreSQL, Oracle, and SQL Server. I can cut through complex formatting, comments, and varied syntax to reliably identify the fundamental column definitions that form the blueprint of a database table. My sole focus is precision and completeness in field extraction.

Operational Guidelines:
* Scan the input text specifically for \`CREATE TABLE\` statements.
* For each table found, meticulously parse the column definitions between the parentheses \`()\`.
* Extract only the column names. Ignore data types, constraints (like \`NOT NULL\`, \`PRIMARY KEY\`, \`FOREIGN KEY\`), default values, and comments.
* If the DDL contains multiple \`CREATE TABLE\` statements, extract and consolidate column names from all of them into a single list.
* Do not infer or create any names. Only extract what is explicitly defined in the DDL.
* Return an empty list if no \`CREATE TABLE\` statements are found or if the DDL is empty.`
    }

    __buildTaskGuidelinesPrompt(){
        return `Your task is to analyze the provided line-numbered DDL (Data Definition Language) string and identify every valid field name with its position references.

Please adhere to the following strict guidelines:

1.  **Focus only on column names:** Identify all \`CREATE TABLE\` statements and extract the names of the columns defined within them.
2.  **Return references, not field names:** For each field found, return the field name along with its position reference in the DDL text using the format: [[[startLineNumber, "start position phrase"], [endLineNumber, "end position phrase"]]]
3.  **Reference the exact position:** The references should point to the exact location in the line-numbered DDL where the field name appears. Use minimal 1-2 word phrases that uniquely identify the position in the line.
4.  **Ignore everything else:** Do not include data types, constraints (\`PRIMARY KEY\`, \`NOT NULL\`, etc.), table names, comments, or ENUM values in your output.
5.  **Consolidate all fields:** If there are multiple tables defined, gather all column names from all tables into one single list.
6.  **Handle inconsistencies:** The DDL might have inconsistent formatting, comments, or vary in SQL dialect. Your process should be robust enough to handle this.
7.  **No DDL, no fields:** If the input DDL is empty or contains no \`CREATE TABLE\` statements, return an empty list for \`ddlFieldRefs\`.
8.  **Uniqueness:** Ensure the final list of fields contains no duplicates. Each field name should appear only once, even if it's defined in multiple tables.
9.  **Ignore Comments:** Do not extract any text from SQL comments (lines starting with \`--\` or blocks enclosed in \`/* ... */\`). Any potential field names within comments must be ignored.
10. **English Only:** Only extract field names written in English. Field names containing Korean characters or other non-ASCII characters must be ignored. For example, ignore a field named \`'회원유형'\`.
11. **Valid Characters:** Field names should only consist of letters, numbers, and underscores (\_). They typically start with a letter. Ignore any text quoted in backticks that does not follow this format (e.g., if it's in Korean).
12. **Ignore ENUM values:** Do not extract the values listed within an \`ENUM(...)\` definition. For example, from \`status ENUM('ACTIVE', 'INACTIVE')\`, you should only identify \`status\` as the field, and ignore \`'ACTIVE'\` and \`'INACTIVE'\`.
`
    }

    __buildInferenceGuidelinesPrompt() {
        return `
Inference Guidelines:
1.  **State the Goal:** Begin by stating the primary goal, which is to extract all unique column names from the provided DDL.
2.  **Describe the Process:** Briefly explain the steps taken, such as scanning for \`CREATE TABLE\` statements, parsing the column definitions, and filtering out non-column name elements.
3.  **Mention Tables Found (Optional):** If useful for clarity, mention the names of the tables from which fields were extracted.
4.  **Confirm Consolidation:** Note that fields from all identified tables have been consolidated into a single, unique list.
5.  **Acknowledge Empty Input:** If the DDL was empty or lacked \`CREATE TABLE\` statements, explicitly state that this is why the field list is empty.
`
    }

    __buildJsonResponseFormat() {
        return `
{
    "inference": "<inference>",
    "result": {
        "ddlFieldRefs": [
            {
                "fieldName": "<fieldName1>",
                "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
            },
            {
                "fieldName": "<fieldName2>", 
                "refs": [[[startLineNumber, "minimal start phrase"], [endLineNumber, "minimal end phrase"]]]
            }
        ]
    }
}
`
    }

    __buildJsonExampleInputFormat() {
        return {
            "DDL": `1: -- Courses Table
2: CREATE TABLE \`courses\` (
3:     \`course_id\` BIGINT AUTO_INCREMENT PRIMARY KEY,
4:     title VARCHAR(255) NOT NULL,
5:     description TEXT,
6:     instructor_id BIGINT NOT NULL,
7:     -- Status of the course
8:     status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
9:     price_amount DECIMAL(10, 2),
10:     price_currency VARCHAR(3),
11:     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
12:     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
13:     INDEX idx_instructor_id (instructor_id)
14: );
15: 
16: -- Table for tracking student enrollments
17: CREATE TABLE enrollments(
18:     enrollment_id BIGINT PRIMARY KEY,
19:     student_id BIGINT,
20:     course_id BIGINT, -- Foreign key to courses
21:     enrollment_date DATE
22: );`
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "inference": "I have scanned the provided line-numbered DDL, identified two tables: \`courses\` and \`enrollments\`. I located all column names from both definitions with their exact positions, ignored data types and constraints, and consolidated them into a single unique list with position references.",
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
                        "fieldName": "price_amount",
                        "refs": [[[9, "price_amount"], [9, "DECIMAL(10, 2)"]]]
                    },
                    {
                        "fieldName": "price_currency",
                        "refs": [[[10, "price_currency"], [10, "VARCHAR(3)"]]]
                    },
                    {
                        "fieldName": "created_at",
                        "refs": [[[11, "created_at"], [11, "CURRENT_TIMESTAMP"]]]
                    },
                    {
                        "fieldName": "updated_at",
                        "refs": [[[12, "updated_at"], [12, "UPDATE CURRENT_TIMESTAMP"]]]
                    },
                    {
                        "fieldName": "enrollment_id",
                        "refs": [[[18, "enrollment_id"], [18, "KEY"]]]
                    },
                    {
                        "fieldName": "student_id",
                        "refs": [[[19, "student_id"], [19, "BIGINT"]]]
                    },
                    {
                        "fieldName": "enrollment_date",
                        "refs": [[[21, "enrollment_date"], [21, "DATE"]]]
                    }
                ]
            }
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "DDL": this._getLineNumberedRequirements(),
            "Line Number Validation Note": TextTraceUtil.getLineNumberValidationPrompt(this._getLineNumberedRequirements())
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
        const sanitizedRefs = RefsTraceUtil.sanitizeAndConvertRefs(ddlFieldRefs, this._getLineNumberedRequirements())
        
        // 2단계: 상대 좌표를 절대 좌표로 변환
        return this._convertToAbsoluteRefs(sanitizedRefs)
    }

    _convertToAbsoluteRefs(ddlFieldRefs) {
        return ddlFieldRefs.map(fieldRef => {
            if (!fieldRef.refs || !Array.isArray(fieldRef.refs)) {
                return fieldRef
            }

            const convertedRefs = []
            
            fieldRef.refs.forEach(refRange => {
                if (!Array.isArray(refRange) || refRange.length !== 2) {
                    convertedRefs.push(refRange)
                    return
                }

                const [startRef, endRef] = refRange
                if (!Array.isArray(startRef) || !Array.isArray(endRef) || 
                    startRef.length !== 2 || endRef.length !== 2) {
                    convertedRefs.push(refRange)
                    return
                }

                const [mergedStartLine, startCol] = startRef
                const [mergedEndLine, endCol] = endRef

                // 여러 ddlRequirements 블록에 걸친 refs를 분할하여 처리
                const splitRefs = this._splitRefRangeAcrossBlocks(mergedStartLine, startCol, mergedEndLine, endCol)
                convertedRefs.push(...splitRefs)
            })

            return {
                ...fieldRef,
                refs: convertedRefs
            }
        })
    }

    _splitRefRangeAcrossBlocks(mergedStartLine, startCol, mergedEndLine, endCol) {
        const { lineTraceMap } = this.client.input
        const splitRefs = []
        
        let currentSegmentStart = mergedStartLine
        let currentSegmentStartCol = startCol
        let previousOriginalLine = lineTraceMap[mergedStartLine]
        
        for (let mergedLine = mergedStartLine + 1; mergedLine <= mergedEndLine; mergedLine++) {
            const currentOriginalLine = lineTraceMap[mergedLine]
            
            // 원본 라인이 연속되지 않거나 매핑이 누락된 경우 경계로 판단
            const isDiscontinuous = (
                previousOriginalLine === undefined ||
                currentOriginalLine === undefined ||
                currentOriginalLine !== previousOriginalLine + 1
            )
            if (isDiscontinuous) {
                // 이전 세그먼트를 완료하고 추가
                const segmentOriginalStartLine = lineTraceMap[currentSegmentStart] || currentSegmentStart
                const segmentOriginalEndLine = previousOriginalLine || (mergedLine - 1)
                const segmentEndMergedLine = mergedLine - 1
                const segmentEndCol = this._getMergedLineLength(segmentEndMergedLine)

                splitRefs.push([
                    [segmentOriginalStartLine, currentSegmentStartCol], 
                    [segmentOriginalEndLine, segmentEndCol]
                ])
                
                // 새 세그먼트 시작
                currentSegmentStart = mergedLine
                currentSegmentStartCol = 1
            }
            
            if (currentOriginalLine !== undefined) {
                previousOriginalLine = currentOriginalLine
            }
        }
        
        // 마지막 세그먼트 추가
        const finalOriginalStartLine = lineTraceMap[currentSegmentStart] || currentSegmentStart
        const finalOriginalEndLine = lineTraceMap[mergedEndLine] || mergedEndLine
        
        splitRefs.push([
            [finalOriginalStartLine, currentSegmentStartCol],
            [finalOriginalEndLine, endCol]
        ])
        
        return splitRefs
    }

    _getMergedLineLength(mergedLine) {
        const lines = this.client.input.ddlLines
        const idx = (typeof mergedLine === 'number' ? mergedLine : parseInt(mergedLine, 10)) - 1
        if (isNaN(idx) || idx < 0 || idx >= lines.length) return 1
        const len = lines[idx] ? lines[idx].length : 0
        return Math.max(1, len)
    }


    _getLineNumberedRequirements(){
        return TextTraceUtil.addLineNumbers(this.client.input.ddl)
    }
}

module.exports = ExtractDDLFieldsGenerator;