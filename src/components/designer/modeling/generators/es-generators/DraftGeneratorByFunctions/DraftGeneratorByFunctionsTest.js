const DraftGeneratorByFunctions = require("./DraftGeneratorByFunctions")
const { draftGeneratorByFunctionsInputs, draftGeneratorByFunctionsInputsWithFeedback } = require("./mocks");

class DraftGeneratorByFunctionsTest {
    static async test(inputType="draftGeneratorByFunctionsInputs") {
        let inputsDic = {
            "draftGeneratorByFunctionsInputs": draftGeneratorByFunctionsInputs,
            "draftGeneratorByFunctionsInputsWithFeedback": draftGeneratorByFunctionsInputsWithFeedback
        }
        const inputs = structuredClone(inputsDic[inputType])

        const generator = new DraftGeneratorByFunctions({
            onGenerationSucceeded: (returnObj) => {
                console.log("[*] 생성된 초안 내용 : ", returnObj.modelValue.output)
                generator.generateIfInputExists()
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

module.exports = DraftGeneratorByFunctionsTest;