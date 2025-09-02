const RequirementsValidationGenerator = require("../../../../RequirementsValidationGenerator")
const { requirementsValidationGeneratorInputs } = require("./mocks");

class RequirementsValidationGeneratorTest {
    static async test() {
        const inputs = structuredClone(requirementsValidationGeneratorInputs)

        const generator = new RequirementsValidationGenerator({
            onModelCreated: (returnObj) => {
                console.log("[*] 생성중인 필수 필드 내용:", returnObj.modelValue.output)
            },
            onGenerationSucceeded: (returnObj) => {
                console.log("[*] 생성된 필수 필드 내용:", returnObj.modelValue.output)
            },
        })
        generator.generateIfInputExists = () => {
            if(inputs.length > 0) {
                const inputToUse = inputs.shift()
                console.log("[*] 사용할 입력 데이터 : ", inputToUse)

                generator.client.input = inputToUse
                generator.generate()
            }
        }

        generator.generateIfInputExists()
    }
}

module.exports = RequirementsValidationGeneratorTest;