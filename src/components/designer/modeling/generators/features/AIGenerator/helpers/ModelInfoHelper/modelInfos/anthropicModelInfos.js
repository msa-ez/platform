export const anthropicModelInfos = {
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