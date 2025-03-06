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
        "processes": [
            {
                "name": "string",
                "explanation": "string",
                "department": "string",
                "description": "string",
                "inputs": ["string"],    // Required inputs for this process
                "outputs": ["string"],   // Outputs produced by this process
                "nextProcesses": ["string"]  // Names of the next processes in flow
            }
        ]
    }
}

Note: 
1. Each process should clearly indicate its inputs and outputs
2. Process flow should be indicated through nextProcesses
3. Only provide ANALYSIS_RESULT if all processes can be clearly identified
4. Otherwise, provide ENHANCEMENT_GUIDE with specific missing elements
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
            if(model){
                if (model.type === "ANALYSIS_RESULT") {
                    console.log("[*] 요구사항이 충분하여 프로세스 분석 결과를 생성했습니다.");
                } else if (model.type === "ENHANCEMENT_GUIDE") {
                    console.log("[*] 요구사항이 불충분하여 개선 가이드를 생성했습니다.");
                }
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