const RequirementsValidationGenerator = require("../../../../../../../RequirementsValidationGenerator")
const { requirementsValidationGeneratorInput } = require("./mocks");

export default async function runRequirementsValidationGenerator(commandArgs, client) {
    const generatorInput = structuredClone(requirementsValidationGeneratorInput)

    const generator = new RequirementsValidationGenerator({
        onModelCreated: (returnObj) => {
            console.log("[*] 생성중인 내용:", returnObj.modelValue.output)
        },
        onGenerationSucceeded: (returnObj) => {
            console.log("[*] 생성된 내용:", returnObj.modelValue.output)
        },
    })
    generator.client.input = generatorInput
    generator.generate()
}