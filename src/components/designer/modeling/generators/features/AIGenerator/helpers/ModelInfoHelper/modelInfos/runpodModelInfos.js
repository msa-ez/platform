export const runpodModelInfos = {
    // 가능한 설정 옵션들: neuralmagic/DeepSeek-R1-Distill-Llama-70B-quantized.w8a8
    "neuralmagic/DeepSeek-R1-Distill-Llama-70B-quantized.w8a8": {
        vendor: "runpod",
        contextWindowTokenLimit: 16000,
        outputTokenLimit: 2048,
        requestArgs: {
            maxTokens: 2048
        },
        useThinkParseStrategy: true
    },

    "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B": {
        vendor: "runpod",
        contextWindowTokenLimit: 131072,
        outputTokenLimit: 8192,
        requestArgs: {
            maxTokens: 8192
        },
        useThinkParseStrategy: true
    },

    "Qwen/QwQ-32B": {
        vendor: "runpod",
        contextWindowTokenLimit: 131072,
        outputTokenLimit: 8192,
        requestArgs: {
            maxTokens: 8192
        },
        useThinkParseStrategy: true
    }
}