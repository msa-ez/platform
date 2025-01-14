const PreProcessingFunctionsGenerator = require("./PreProcessingFunctionsGenerator")
const { preProcessingFunctionsGeneratorInputs } = require("./mocks");

class PreProcessingFunctionsGeneratorTest {
    static async test() {
        const inputs = structuredClone(preProcessingFunctionsGeneratorInputs)

        const generator = new PreProcessingFunctionsGenerator({
            onGenerationSucceeded: (returnObj) => {
                console.log("[*] 요구 사항 분석 결과 : ", returnObj.modelValue.output)
                generator.generateIfInputExists()
            },
        })
        generator.generateIfInputExists = () => {
            if(inputs.length > 0) {
                const inputToUse = inputs.shift()
                console.log("[*] 사용할 입력 데이터 : ", inputToUse)

                generator.client.input = inputToUse
                generator.generate()
            }
        }

        generator.generateIfInputExists()
    }
}

module.exports = PreProcessingFunctionsGeneratorTest;