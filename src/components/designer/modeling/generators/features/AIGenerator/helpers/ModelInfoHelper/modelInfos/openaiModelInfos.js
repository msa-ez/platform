export const openaiModelInfos = {
    "gpt-4o": {
        vendor: "openai",
        contextWindowTokenLimit: 128000,
        outputTokenLimit: 16384,
        requestArgs: {
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0
        }
    },

    "o3-mini": { 
        vendor: "openai",
        contextWindowTokenLimit: 200000,
        outputTokenLimit: 100000,
        isInferenceModel: true,
        requestArgs: {
            reasoningEffort: "medium",
            frequencyPenalty: 0,
            presencePenalty: 0
        },
        transforms: {
            "-low": {
                requestArgs: {
                    reasoningEffort: "low"
                }
            },
            "-medium": {
                requestArgs: {
                    reasoningEffort: "medium"
                }
            },
            "-high": {
                requestArgs: {
                    reasoningEffort: "high"
                }
            }
        }
    }
}