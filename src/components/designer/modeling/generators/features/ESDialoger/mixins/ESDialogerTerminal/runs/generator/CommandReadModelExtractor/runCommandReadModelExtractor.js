const CommandReadModelExtractor = require("../../../../../../../CommandReadModelExtractor")
const { commandReadModelExtractorInput } = require("./mocks");

export default async function runCommandReadModelExtractor(commandArgs, client) {
    const generatorInput = structuredClone(commandReadModelExtractorInput)

    const generator = new CommandReadModelExtractor({
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