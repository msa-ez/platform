const AddTraceToDraftOptionsGenerator = require("./AddTraceToDraftOptionsGenerator")
const { AddTraceToDraftOptionsGeneratorInputs } = require("./mocks");

class AddTraceToDraftOptionsGeneratorTest {
    static async test() {
        const inputs = structuredClone(AddTraceToDraftOptionsGeneratorInputs[0])

        const result = await AddTraceToDraftOptionsGenerator.addTraceToDraftOptions(
            inputs.generatedDraftOptions,
            inputs.boundedContextName,
            inputs.functionalRequirements,
            inputs.traceMap,
            {
                onModelCreated: (returnObj) => {
                    console.log("[*] 생성중인 추적성 정보 : ", returnObj.modelValue.output)
                },
                onGenerationSucceeded: (returnObj) => {
                    console.log("[*] 생성된 추적성 정보 : ", returnObj.modelValue.output)
                }
            }
        )
        console.log("[*] 생성된 추적성 정보 : ", result)
    }
}

module.exports = AddTraceToDraftOptionsGeneratorTest;