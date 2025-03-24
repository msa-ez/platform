export const ollamaModelInfos = {
    // 가능한 설정 옵션들: gemma3:4b
    "gemma3:4b": {
        huggingFaceModelName: "google/gemma-3-4b-it",
        label: "Gemma 3 4B",
        defaultValue: "gemma3:4b",
        vendor: "ollama",
        contextWindowTokenLimit: 131072,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        }
    },

    // 가능한 설정 옵션들: deepseek-r1:14b
    "deepseek-r1:14b": {
        huggingFaceModelName: "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
        label: "DeepSeek R1 14B",
        defaultValue: "deepseek-r1:14b",
        vendor: "ollama",
        contextWindowTokenLimit: 131072,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        },
        useThinkParseStrategy: true
    },

    // 가능한 설정 옵션들: deepseek-r1:1.5b
    "deepseek-r1:1.5b": {
        huggingFaceModelName: "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
        label: "DeepSeek R1 1.5B",
        defaultValue: "deepseek-r1:1.5b",
        vendor: "ollama",
        contextWindowTokenLimit: 32768,
        outputTokenLimit: 2048,
        requestArgs: {
            temperature: 0.7
        },
        useThinkParseStrategy: true
    }
}