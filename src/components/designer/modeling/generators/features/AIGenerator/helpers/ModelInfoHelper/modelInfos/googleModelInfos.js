export const googleModelInfos = {
    // 가능한 설정 옵션들: gemini-2.5-pro-preview-03-25
    "gemini-2.5-pro-preview": {
        label: "Gemini Pro 2.5 (Preview)",
        defaultValue: "gemini-2.5-pro-preview-03-25",
        vendor: "google",
        contextWindowTokenLimit: 1048576,
        outputTokenLimit: 65536,
        requestArgs: {
            temperature: 0.7
        },
        isInferenceModel: true
    },

    // 가능한 설정 옵션들: gemini-2.5-flash-preview-04-17
    "gemini-2.5-flash-preview": {
        label: "Gemini Flash 2.5 (Preview)",
        defaultValue: "gemini-2.5-flash-preview-04-17",
        vendor: "google",
        contextWindowTokenLimit: 1048576,
        outputTokenLimit: 65536,
        requestArgs: {
            temperature: 0.7
        },
        isInferenceModel: false
    }
}