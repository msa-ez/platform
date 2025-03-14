export const anthropicModelInfos = {
    // 가능한 설정 옵션들: claude-3-7-sonnet-20250219, claude-3-7-sonnet-20250219-thinking-simple, claude-3-7-sonnet-20250219-thinking-standard, claude-3-7-sonnet-20250219-thinking-complex, claude-3-7-sonnet-20250219-thinking-powerful
    "claude-3-7-sonnet": {
        vendor: "anthropic",
        contextWindowTokenLimit: 204800,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7,
            maxTokens: 8192
        },
        transforms: {
            "-thinking-simple": {
                outputTokenLimit: 64000,
                requestArgs: {
                    temperature: 1.0, // Thinking 활성화시에 이 값은 1.0으로 반드시 고정되어야 함
                    budgetTokens: 2048,
                    maxTokens: 64000
                },
                outputTokenLimitReasoningMargin: 2048,
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-thinking-standard": {
                outputTokenLimit: 64000,
                requestArgs: {
                    temperature: 1.0,
                    budgetTokens: 8192,
                    maxTokens: 64000
                },
                outputTokenLimitReasoningMargin: 8192,
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-thinking-complex": {
                outputTokenLimit: 64000,
                requestArgs: {
                    temperature: 1.0,
                    budgetTokens: 24576,
                    maxTokens: 64000
                },
                outputTokenLimitReasoningMargin: 24576,
                isInferenceModel: true,
                useThinkParseStrategy: true
            },

            "-thinking-powerful": {
                outputTokenLimit: 64000,
                requestArgs: {
                    temperature: 1.0,
                    budgetTokens: 55808,
                    maxTokens: 64000
                },
                outputTokenLimitReasoningMargin: 55808,
                isInferenceModel: true,
                useThinkParseStrategy: true
            }
        }
    },

    // 가능한 설정 옵션들: claude-3-5-sonnet-20241022, claude-3-5-sonnet-latest
    "claude-3-5-sonnet": {
        vendor: "anthropic",
        contextWindowTokenLimit: 204800,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7,
            maxTokens: 8192
        }
    },

    // 가능한 설정 옵션들: claude-3-5-haiku-20241022, claude-3-5-haiku-latest
    "claude-3-5-haiku": {
        vendor: "anthropic",
        contextWindowTokenLimit: 204800,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7,
            maxTokens: 8192
        }
    }
}