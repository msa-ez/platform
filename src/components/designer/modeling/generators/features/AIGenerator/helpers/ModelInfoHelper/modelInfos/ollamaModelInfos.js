export const ollamaModelInfos = {
    "deepseek-r1:1.5b": {
        vendor: "ollama",
        contextWindowTokenLimit: 32768,
        outputTokenLimit: 2048,
        requestArgs: {
            temperature: 0.7
        }
    },

    "deepseek-r1:14b": {
        vendor: "ollama",
        contextWindowTokenLimit: 131072,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        }
    }
}