export const openaiModelInfos = {
    // 가능한 설정 옵션들: gpt-5-2025-08-07
    "gpt-5": {
        label: "GPT-5-Minimal",
        defaultValue: "gpt-5-2025-08-07",
        vendor: "openai",
        contextWindowTokenLimit: 4000000,
        outputTokenLimit: 128000,
        isSupportedResponseFormat: true,
        requestArgs: {
            reasoningEffort : "minimal",
            temperature: 1.0, // 변경 불가능한 파라미터
            topP: 1.0, // 변경 불가능한 파라미터
            frequencyPenalty: 0,
            presencePenalty: 0
        },
        transforms: {
            "-high": {
                label: "GPT-5-High",
                defaultValue: "gpt-5-2025-08-07-high",
                requestArgs: {
                    reasoningEffort : "high",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-medium": {
                label: "GPT-5-Medium",
                defaultValue: "gpt-5-2025-08-07-medium",
                requestArgs: {
                    reasoningEffort : "medium",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-low": {
                label: "GPT-5-Low",
                defaultValue: "gpt-5-2025-08-07-low",
                requestArgs: {
                    reasoningEffort : "low",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            }
        }
    },

    // 가능한 설정 옵션들: gpt-5-mini-2025-08-07
    "gpt-5-mini": {
        label: "GPT-5-Mini-Minimal",
        defaultValue: "gpt-5-mini-2025-08-07",
        vendor: "openai",
        contextWindowTokenLimit: 4000000,
        outputTokenLimit: 128000,
        isSupportedResponseFormat: true,
        requestArgs: {
            reasoningEffort : "minimal",
            temperature: 1.0, // 변경 불가능한 파라미터
            topP: 1.0, // 변경 불가능한 파라미터
            frequencyPenalty: 0,
            presencePenalty: 0
        },
        transforms: {
            "-high": {
                label: "GPT-5-Mini-High",
                defaultValue: "gpt-5-mini-2025-08-07-high",
                requestArgs: {
                    reasoningEffort : "high",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-medium": {
                label: "GPT-5-Mini-Medium",
                defaultValue: "gpt-5-mini-2025-08-07-medium",
                requestArgs: {
                    reasoningEffort : "medium",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-low": {
                label: "GPT-5-Mini-Low",
                defaultValue: "gpt-5-mini-2025-08-07-low",
                requestArgs: {
                    reasoningEffort : "low",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            }
        }
    },

    // 가능한 설정 옵션들: gpt-5-nano-2025-08-07
    "gpt-5-nano": {
        label: "GPT-5-Nano-Minimal",
        defaultValue: "gpt-5-nano-2025-08-07",
        vendor: "openai",
        contextWindowTokenLimit: 4000000,
        outputTokenLimit: 128000,
        isSupportedResponseFormat: true,
        requestArgs: {
            reasoningEffort : "minimal",
            temperature: 1.0, // 변경 불가능한 파라미터
            topP: 1.0, // 변경 불가능한 파라미터
            frequencyPenalty: 0,
            presencePenalty: 0
        },
        transforms: {
            "-high": {
                label: "GPT-5-Nano-High",
                defaultValue: "gpt-5-nano-2025-08-07-high",
                requestArgs: {
                    reasoningEffort : "high",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-medium": {
                label: "GPT-5-Nano-Medium",
                defaultValue: "gpt-5-nano-2025-08-07-medium",
                requestArgs: {
                    reasoningEffort : "medium",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-low": {
                label: "GPT-5-Nano-Low",
                defaultValue: "gpt-5-nano-2025-08-07-low",
                requestArgs: {
                    reasoningEffort : "low",
                },
                isInferenceModel: true,
                useThinkParseStrategy: true
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
            temperature: 0.2,
            topP: 1.0,
            frequencyPenalty: 0,
            presencePenalty: 0
        }
    }
}