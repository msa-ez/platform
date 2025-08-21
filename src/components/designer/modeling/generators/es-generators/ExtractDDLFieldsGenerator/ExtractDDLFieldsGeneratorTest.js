const ExtractDDLFieldsGenerator = require("./ExtractDDLFieldsGenerator")
const { extractDDLFieldsGeneratorInputs } = require("./mocks");

class ExtractDDLFieldsGeneratorTest {
    static async test(inputType="extractDDLFieldsGeneratorInputs") {
        let inputsDic = {
            "extractDDLFieldsGeneratorInputs": extractDDLFieldsGeneratorInputs,
        }
        const inputs = structuredClone(inputsDic[inputType])

        const generator = new ExtractDDLFieldsGenerator({
            onModelCreated: (returnObj) => {
                console.log("[*] 생성중인 필수 필드 내용:", returnObj.modelValue.output)
            },
            onGenerationSucceeded: (returnObj) => {
                console.log("[*] 생성된 필수 필드 내용:", returnObj.modelValue.output)
            },
        })

        generator.client.input = inputs
        generator.generate()
    }
}

module.exports = ExtractDDLFieldsGeneratorTest;