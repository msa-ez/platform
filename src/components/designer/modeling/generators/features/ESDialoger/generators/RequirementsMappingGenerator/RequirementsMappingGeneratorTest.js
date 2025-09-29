const RequirementsMappingGenerator = require("../../../../RequirementsMappingGenerator")
const { requirementsMappingGeneratorInputs } = require("./mocks");

class RequirementsMappingGeneratorTest {
    static async test() {
        const inputs = structuredClone(requirementsMappingGeneratorInputs)
        await this.testRequirementsMappingGenerator(inputs.baseInput, inputs.requirementChunks[1])

        // const startTime = Date.now()
        // for(let i = 0; i < inputs.requirementChunks.length; i++) {
        //     await this.testRequirementsMappingGenerator(inputs.baseInput, inputs.requirementChunks[i])
        // }
        // const endTime = Date.now()
        // console.log(`[*] 모든 처리에 걸린 시간: ${endTime - startTime}ms`)
    }

    static async testRequirementsMappingGenerator(baseInput, requirementChunk) {
        return new Promise((resolve, reject) => {
            const generator = new RequirementsMappingGenerator({
                onModelCreated: (model) => {
                    console.log("[*] 모델 생성: ", model)
                },
                onGenerationFinished: (model) => {
                    console.log("[*] 결과 모델: ", model)
                    resolve(model)
                }
            })
            generator.client.input = baseInput
            generator.client.input.requirementChunk = requirementChunk
            generator.generate()
        })
    }
}

module.exports = RequirementsMappingGeneratorTest;