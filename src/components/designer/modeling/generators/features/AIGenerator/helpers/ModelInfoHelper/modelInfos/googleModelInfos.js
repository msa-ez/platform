export const googleModelInfos = {
    // 가능한 설정 옵션들: gemini-2.0-flash
    "gemini-2.0-flash": {
        vendor: "google",
        contextWindowTokenLimit: 1048576,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        }
    },

    // 가능한 설정 옵션들: gemini-1.5-pro
    "gemini-1.5-pro": {
        vendor: "google",
        contextWindowTokenLimit: 2000000,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        }
    },

    // 가능한 설정 옵션들: gemini-2.0-flash-lite
    "gemini-2.0-flash-lite": {
        vendor: "google",
        contextWindowTokenLimit: 1048576,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        }
    },

    
    // [!] 아래의 모델들은 실험용 버전이며, 언제든지 삭제될 수 있음
    // 가능한 설정 옵션들: gemini-2.0-pro-exp-02-05
    "gemini-2.0-pro-exp-02-05": {
        vendor: "google",
        contextWindowTokenLimit: 2097152,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        }
    },

    // 가능한 설정 옵션들: gemini-2.0-flash-thinking-exp-01-21
    "gemini-2.0-flash-thinking-exp-01-21": {
        vendor: "google",
        contextWindowTokenLimit: 1048576,
        outputTokenLimit: 8192,
        requestArgs: {
            temperature: 0.7
        },
        isInferenceModel: true
    }
}