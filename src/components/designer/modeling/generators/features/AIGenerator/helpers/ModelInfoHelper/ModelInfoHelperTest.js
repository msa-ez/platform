const ModelInfoHelper = require("./ModelInfoHelper");

class ModelInfoHelperTest {
    static test() {
        const modelNamesToTest = [
            "unknown-model-name",
            "gpt-4o-2024-08-06",
            "o3-mini-2025-01-31",
            "o3-mini-2025-01-31-high",
            "deepseek-r1:1.5b",
            "deepseek-r1:14b"
        ]

        for(const modelName of modelNamesToTest) {
            try {
                console.log(`### ${modelName} ###`)
                console.log(ModelInfoHelper.getModelInfo(modelName))
            } catch(e) {
                console.error(`[*] Error: ${e.message}`)
            }
        }

        console.log("### Override 옵션 사용 테스트 ###")
        console.log(
            ModelInfoHelper.getModelInfo("gpt-4o", {
                requestArgs: {
                    temperature: 0.3
                },
                contextWindowTokenLimit: 1000
            })
        )
    }
}

module.exports = ModelInfoHelperTest