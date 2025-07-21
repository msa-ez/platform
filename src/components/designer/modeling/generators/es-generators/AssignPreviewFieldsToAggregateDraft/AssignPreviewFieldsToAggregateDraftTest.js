const AssignPreviewFieldsToAggregateDraft = require("./AssignPreviewFieldsToAggregateDraft")
const { assignPreviewFieldsToAggregateDraftInputs } = require("./mocks");

class AssignPreviewFieldsToAggregateDraftTest {
    static async test(inputType="assignPreviewFieldsToAggregateDraftInputs") {
        let inputsDic = {
            "assignPreviewFieldsToAggregateDraftInputs": assignPreviewFieldsToAggregateDraftInputs,
        }
        const inputs = structuredClone(inputsDic[inputType])

        const generator = new AssignPreviewFieldsToAggregateDraft({
            onModelCreated: (returnObj) => {
                console.log("[*] 생성중인 필드 할당 내용:", returnObj.modelValue.output)
            },
            onGenerationSucceeded: (returnObj) => {
                console.log("[*] 생성된 필드 할당 내용:", returnObj.modelValue.output)
            },
        })

        generator.client.input = inputs
        generator.generate()
    }
}

module.exports = AssignPreviewFieldsToAggregateDraftTest;