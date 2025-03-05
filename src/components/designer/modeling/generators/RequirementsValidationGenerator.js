const JsonAIGenerator = require("./JsonAIGenerator");

class RequirementsValidatorGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "simpleModel");
        this.generatorName = 'RequirementsValidatorGenerator';
    }

    createPrompt() {
        return `
Analyze if the following requirements are sufficient for process and value stream mapping.

Requirements to analyze:
${this.client.input['requirements']['userStory']}
${this.ddlPrompt()}

Validation Criteria (ALL must be met for complete requirements):
1. Process Coverage
   - Each use case must map to business processes
   - All actors must be included
   - All main functions must be represented

2. Value Stream Completeness
   - End-to-end user journeys must be clear
   - All major flows must be identifiable

3. Team Integration
   - All teams must have clear roles
   - Inter-team communications must be clear

Based on these criteria, provide ONE of these responses:

IF requirements are incomplete:
{
    "type": "ENHANCEMENT_GUIDE",
    "content": {
        "missingElements": {
            "processes": ["string"], // missing processes
            "flows": ["string"],     // missing flows
            "teams": ["string"]      // missing team interactions
        },
        "recommendations": {
            "immediate": ["string"],  // what to add first
            "questions": ["string"]   // questions to ask stakeholders
        }
    }
}

IF requirements are complete:
{
    "type": "ANALYSIS_RESULT",
    "content": {
        "businessProcesses": [
            {
                "name": "string",
                "description": "string",
                "departments": ["string"],
                "subProcesses": [
                    {
                        "name": "string",
                        "involvedDepartments": ["string"],
                        "inputs": [
                            {
                                "description": "string",
                                "source": "string"
                            }
                        ],
                        "outputs": [
                            {
                                "description": "string",
                                "destination": "string"
                            }
                        ]
                    }
                ]
            }
        ],
        "valueStreams": [
            {
                "name": "string",
                "flow": [
                    {
                        "step": "string",
                        "department": "string",
                        "input": "string",
                        "process": "string",
                        "output": "string"
                    }
                ]
            }
        ],
        "crossDepartmentInteractions": [
            {
                "sourceDepartment": "string",
                "targetDepartment": "string",
                "interaction": "string",
                "dataFlow": "string"
            }
        ]
    }
}

Note: Only provide ANALYSIS_RESULT if ALL aspects can be fully mapped.
Otherwise, provide ENHANCEMENT_GUIDE with specific missing elements and recommendations.
`
    }

    ddlPrompt() {
        if (this.client.input['requirements']['ddl'] != "") {
            return `
Database Schema:
${this.client.input['requirements']['ddl']}`;
        }
        return '';
    }

    createModel(text) {
        try {
            let model = super.createModel(text);
            
            // 응답 타입에 따라 다른 처리
            if (model.type === "ANALYSIS_RESULT") {
                console.log("[*] 요구사항이 충분하여 프로세스 분석 결과를 생성했습니다.");
            } else if (model.type === "ENHANCEMENT_GUIDE") {
                console.log("[*] 요구사항이 불충분하여 개선 가이드를 생성했습니다.");
            }

            return model;
        } catch(e) {
            console.log(e);
            return {
                type: "ENHANCEMENT_GUIDE",
                content: {
                    evaluationResult: {
                        processIdentification: { score: 0, missingElements: ["Error occurred"] },
                        organizationalContext: { score: 0, missingElements: ["Error occurred"] },
                        dataFlow: { score: 0, missingElements: ["Error occurred"] }
                    },
                    missingRequirements: [],
                    nextSteps: {
                        immediate: ["Retry analysis"],
                        recommended: ["Check input format"]
                    }
                }
            };
        }
    }
}

module.exports = RequirementsValidatorGenerator;