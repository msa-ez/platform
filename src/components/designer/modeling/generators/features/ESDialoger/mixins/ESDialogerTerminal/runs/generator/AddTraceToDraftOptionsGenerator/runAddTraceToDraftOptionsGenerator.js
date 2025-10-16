const { AddTraceToDraftOptionsGenerator } = require("../../../../../../../es-generators")
const { AddTraceToDraftOptionsGeneratorInput } = require("./mocks");

export default async function runAddTraceToDraftOptionsGenerator(commandArgs, client) {
    const generatorInput = structuredClone(AddTraceToDraftOptionsGeneratorInput)

    const result = await AddTraceToDraftOptionsGenerator.addTraceToDraftOptions(
        generatorInput.generatedDraftOptions,
        generatorInput.boundedContextName,
        generatorInput.functionalRequirements,
        generatorInput.traceMap,
        {
            onModelCreated: (returnObj) => {
                console.log("[*] 생성중인 내용:", returnObj.modelValue.output)
            },
            onGenerationSucceeded: (returnObj) => {
                console.log("[*] 생성된 내용:", returnObj.modelValue.output)
            }
        }
    )
    console.log("[*] 생성된 최종 내용:", result)
}
