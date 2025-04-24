export const openaiModelInfos = {
    // 가능한 설정 옵션들: o4-mini-2025-04-16, o4-mini-2025-04-16-high
    "o4-mini": { 
        label: "O4-Mini",
        defaultValue: "o4-mini-2025-04-16",
        vendor: "openai",
        contextWindowTokenLimit: 200000,
        outputTokenLimit: 100000,
        outputTokenLimitReasoningMargin: 25000,
        isInferenceModel: true,
        isSupportedResponseFormat: true,
        requestArgs: {
            reasoningEffort: "medium",
            frequencyPenalty: 0,
            presencePenalty: 0
        },
        transforms: {
            "-high": {
                label: "O4-Mini-High",
                defaultValue: "o4-mini-2025-04-16-high",
                requestArgs: {
                    reasoningEffort: "high"
                }
            },
            "-medium": {
                label: "O4-Mini-Medium",
                defaultValue: "o4-mini-2025-04-16-medium",
                requestArgs: {
                    reasoningEffort: "medium"
                }
            },
            "-low": {
                label: "O4-Mini-Low",
                defaultValue: "o4-mini-2025-04-16-low",
                requestArgs: {
                    reasoningEffort: "low"
                }
            }
        }
    },

    // 가능한 설정 옵션들: gpt-4.1-2025-04-14
    "gpt-4.1": {
        label: "GPT-4.1",
        defaultValue: "gpt-4.1-2025-04-14",
        vendor: "openai",
        contextWindowTokenLimit: 1047576,
        outputTokenLimit: 32768,
        isSupportedResponseFormat: true,
        requestArgs: {
            temperature: 0.7,
            topP: 1,
            frequencyPenalty: 0,
            presencePenalty: 0
        }
    }
}