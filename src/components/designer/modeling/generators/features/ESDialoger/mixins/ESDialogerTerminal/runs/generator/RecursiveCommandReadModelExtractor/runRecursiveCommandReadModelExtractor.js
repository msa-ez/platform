const RecursiveCommandReadModelExtractor = require("../../../../../../../RecursiveCommandReadModelExtractor")
const { recursiveCommandReadModelExtractorInput } = require("./mocks");

export default async function runRecursiveCommandReadModelExtractor(commandArgs, client) {
    const generatorInput = structuredClone(recursiveCommandReadModelExtractorInput)

    const generator = new RecursiveCommandReadModelExtractor({
        onModelCreated: (returnObj) => {
            console.log("[*] 생성중인 내용: ", returnObj.modelValue.output)
        },
        onGenerationFinished: (returnObj) => {
            console.log("[*] 생성된 내용: ", returnObj.modelValue.output)
        }
    })
    generator.client.input = {
        "resultDevideBoundedContext": generatorInput.resultDevideBoundedContext,
    }

    const finalResult = await generator.generateRecursively(generatorInput.usedUserStory)
    console.log("[*] 최종 결과: ", finalResult)
}