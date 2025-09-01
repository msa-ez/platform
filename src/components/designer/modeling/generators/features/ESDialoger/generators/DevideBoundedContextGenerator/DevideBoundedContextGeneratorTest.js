const DevideBoundedContextGenerator = require("../../../../DevideBoundedContextGenerator")
const { devideBoundedContextGeneratorInputs } = require("./mocks");

class DevideBoundedContextGeneratorTest {
    static async test() {
        const inputs = structuredClone(devideBoundedContextGeneratorInputs)

        const generator = new DevideBoundedContextGenerator({
            onModelCreated: (model) => {
                console.log("[*] 모델 생성: ", model)
            },
            onGenerationFinished: (model) => {
                console.log("[*] 결과 모델: ", model)
            }
        })

        generator.client.input = inputs[0]
        generator.generate()
    }

    static async testWithSummarizedResult() {
        const inputs = structuredClone(devideBoundedContextGeneratorInputs)

        const generator = new DevideBoundedContextGenerator({
            onModelCreated: (model) => {
                console.log("[*] 모델 생성: ", model)
            },
            onGenerationFinished: (model) => {
                console.log("[*] 결과 모델: ", model)
            }
        })

        generator.client.input = inputs[1]
        generator.generate()
    }
}

module.exports = DevideBoundedContextGeneratorTest;