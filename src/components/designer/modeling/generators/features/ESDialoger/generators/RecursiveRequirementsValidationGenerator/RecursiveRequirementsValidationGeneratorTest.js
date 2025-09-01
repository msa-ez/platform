const RecursiveRequirementsValidationGenerator = require("../../../../RecursiveRequirementsValidationGenerator")
const { recursiveRequirementsValidationGeneratorInputs } = require("./mocks");

class RecursiveRequirementsValidationGeneratorTest {
    static async test() {
        const inputs = structuredClone(recursiveRequirementsValidationGeneratorInputs)

        const generator = new RecursiveRequirementsValidationGenerator({
            onModelCreated: (returnObj) => {
                console.log("[*] 모델 생성: ", returnObj.modelValue.output)
            },
            onGenerationFinished: (returnObj) => {
                console.log("[*] 결과 모델: ", returnObj.modelValue.output)
                generator.handleGenerationFinished(returnObj.modelValue.output);
            }
        })

        generator.textChunker.chunkSize = 500
        generator.textChunker.spareSize = 50

        const finalResult = await generator.validateRecursively(inputs[0].requirements.userStory)
        console.log("[*] 최종 결과: ", finalResult)
    }
}

module.exports = RecursiveRequirementsValidationGeneratorTest;