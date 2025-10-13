const DevideBoundedContextGenerator = require("../../../../../../../DevideBoundedContextGenerator")
const { devideBoundedContextGeneratorInput } = require("./mocks");

export default async function runDevideBoundedContextGenerator(commandArgs, client) {
    const generatorInput = structuredClone(devideBoundedContextGeneratorInput)

    const generator = new DevideBoundedContextGenerator({
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