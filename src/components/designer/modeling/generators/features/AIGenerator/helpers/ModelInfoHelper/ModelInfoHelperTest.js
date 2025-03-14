const ModelInfoHelper = require("./ModelInfoHelper");

class ModelInfoHelperTest {
    static test() {
        const modelNamesToTest = [
            "claude-3-7-sonnet-20240620",
            "claude-3-7-sonnet-20240620-thinking-simple",
            "claude-3-7-sonnet-20240620-thinking-medium",
            "claude-3-7-sonnet-20240620-thinking-complex"
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