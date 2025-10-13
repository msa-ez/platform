const RequirementsMappingGenerator = require("../../../../../../../RequirementsMappingGenerator")
const { requirementsMappingGeneratorInput } = require("./mocks");

export default async function runRequirementsMappingGenerator(commandArgs, client) {
    const generatorInput = structuredClone(requirementsMappingGeneratorInput)

    for(let i = 0; i < generatorInput.requirementChunks.length; i++) {
        const runGenerator = new Promise((resolve, reject) => {
            const generator = new RequirementsMappingGenerator({
                onModelCreated: (returnObj) => {
                    console.log("[*] 생성중인 내용:", returnObj.modelValue.output)
                },
                onGenerationSucceeded: (returnObj) => {
                    console.log("[*] 생성된 내용:", returnObj.modelValue.output)
                    resolve(returnObj.modelValue.output)
                },
            })
            generator.client.input = generatorInput.baseInput
            generator.client.input.requirementChunk = generatorInput.requirementChunks[i]
            generator.generate()
        })
        await runGenerator
    }
}