const JsonAIGenerator = require("./JsonAIGenerator");

class ProcessAnalysisGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "simpleModel");
        this.generatorName = 'ProcessAnalysisGenerator';
    }

    createPrompt() {
        return `
First, validate if the provided image is suitable for process analysis.
Then, if valid, analyze the process diagram and extract business processes, value streams, and suggest context mapping.

${this.ollamaPrompt()}

Requirements for a valid process diagram:
1. Must show clear process flows or business activities
2. Should contain identifiable steps or stages
3. Should show relationships between processes
4. Must be readable and have sufficient clarity

The format must be as follows:
{
    "validation": {
        "isValid": true || false,
        "message": "Explanation of why the image is or isn't suitable for analysis",
        "suggestions": [
            "List of suggestions if the image isn't suitable"
        ]
    },
    "processAnalysis": {
        // Only include if validation.isValid is true
        "processes": [
            {
                "name": "Name of the process",
                "description": "Brief description of what this process does",
                "functions": [
                    "List of functions or capabilities within this process"
                ]
            }
        ],
        "valueStreams": [
            {
                "processName": "Name of the process",
                "departments": ["List of related departments"],
                "input": {
                    "data": ["Required input data"],
                    "events": ["Triggering events"]
                },
                "process": "Detailed description of the process steps",
                "output": {
                    "data": ["Produced output data"],
                    "events": ["Generated events"]
                }
            }
        ],
        "contextMapping": {
            "boundedContexts": [
                {
                    "name": "Name of bounded context in PascalCase",
                    "description": "Description of this bounded context",
                    "processes": ["List of processes included"],
                    "dataOwnership": ["List of data this context owns"],
                    "dependencies": [
                        {
                            "context": "Name of dependent context",
                            "type": "Upstream" || "Downstream",
                            "interaction": "Type of interaction (e.g., Pub/Sub, REST)"
                        }
                    ]
                }
            ],
            "relationships": [
                {
                    "source": "Source context name",
                    "target": "Target context name",
                    "type": "Partnership" || "Customer-Supplier" || "Conformist" || "Anti-corruption Layer",
                    "dataFlow": "Description of data flow between contexts"
                }
            ]
        },
        "analysis": {
            "keyFindings": [
                "List of key findings from the analysis"
            ],
            "suggestedImprovements": [
                "List of suggested improvements"
            ]
        }
    }
}

Language Instructions:
- Use the same language as used in the diagram for process names and descriptions
- Technical terms should remain in English
- If the image is not suitable, provide clear reasons and suggestions in the validation section
${this.imageContextPrompt()}
`
    }

    // ... existing methods ...

    createModel(text) {
        try {
            if (text.startsWith('```json')) {
                text = text.slice(7);
            }
            if (text.endsWith('```')) {
                text = text.slice(0, -3);
            }

            let model = super.createModel(text);

            if (model && model.validation) {
                if (!model.validation.isValid) {
                    console.log('[!] 프로세스 분석에 부적합한 이미지:', model.validation.message);
                }
                return model;
            }

            return this.getEmptyModel();
        } catch (e) {
            console.error('프로세스 분석 모델 생성 중 오류 발생:', e);
            return this.getEmptyModel();
        }
    }

    getEmptyModel() {
        return {
            validation: {
                isValid: false,
                message: "프로세스 다이어그램 분석에 실패했습니다.",
                suggestions: [
                    "더 명확한 프로세스 다이어그램을 제공해주세요.",
                    "프로세스 흐름이 잘 보이는 이미지를 사용해주세요.",
                    "텍스트가 읽기 쉬운 이미지를 사용해주세요."
                ]
            },
            processAnalysis: null
        };
    }

    handleGenerationFinished(model) {
        if (!model.validation.isValid) {
            this.client.$emit('processAnalysisInvalid', {
                message: model.validation.message,
                suggestions: model.validation.suggestions
            });
            return;
        }

        // 유효한 경우 분석 결과 전달
        this.client.$emit('processAnalysisComplete', model.processAnalysis);
    }
}

module.exports = ProcessAnalysisGenerator;