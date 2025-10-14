const RecursiveRequirementsValidationGenerator = require("../../../../../../../RecursiveRequirementsValidationGenerator")
const { recursiveRequirementsValidationGeneratorInput } = require("./mocks");

export default async function runRecursiveRequirementsValidationGenerator(commandArgs, client) {
    const generatorInput = structuredClone(recursiveRequirementsValidationGeneratorInput)

    const generator = new RecursiveRequirementsValidationGenerator({
        onModelCreated: (returnObj) => {
            console.log("[*] 생성중인 내용: ", returnObj.modelValue.output)
        },
        onGenerationFinished: (returnObj) => {
            console.log("[*] 생성된 내용: ", returnObj.modelValue.output)
            generator.handleGenerationFinished(returnObj.modelValue.output);
        }
    })

    const finalResult = await generator.validateRecursively(generatorInput.usedUserStory)
    console.log("[*] 최종 결과: ", finalResult)
}