export const ollamaModelInfos = {
    // 가능한 설정 옵션들: deepseek-r1:1.5b
    "deepseek-r1:1.5b": {
        vendor: "ollama",
        contextWindowTokenLimit: 32768,
        outputTokenLimit: 2048,
        requestArgs: {
            temperature: 0.7
        },
        useThinkParseStrategy: true
    },

    // 가능한 설정 옵션들: deepseek-r1:14b
    "deepseek-r1:14b": {
        vendor: "ollama",
        contextWindowTokenLimit: 131072,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        },
        useThinkParseStrategy: true
    }
}