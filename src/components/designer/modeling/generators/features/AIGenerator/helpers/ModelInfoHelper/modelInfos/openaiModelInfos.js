export const openaiModelInfos = {
    // 가능한 설정 옵션들: gpt-4o-2024-11-20, gpt-4o-2024-08-06, gpt-4o
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

    // 가능한 설정 옵션들: o3-mini-2025-01-31, o3-mini, o3-mini-2025-01-31-medium, o3-mini-2025-01-31-high
    "o3-mini": { 
        vendor: "openai",
        contextWindowTokenLimit: 200000,
        outputTokenLimit: 100000,
        outputTokenLimitReasoningMargin: 25000,
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