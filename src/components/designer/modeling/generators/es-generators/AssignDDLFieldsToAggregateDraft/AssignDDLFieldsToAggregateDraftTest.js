const AssignDDLFieldsToAggregateDraft = require("./AssignDDLFieldsToAggregateDraft")
const { assignDDLFieldsToAggregateDraftInputs } = require("./mocks");

class AssignDDLFieldsToAggregateDraftTest {
    static async test(inputType="assignDDLFieldsToAggregateDraftInputs") {
        let inputsDic = {
            "assignDDLFieldsToAggregateDraftInputs": assignDDLFieldsToAggregateDraftInputs,
        }
        const inputs = structuredClone(inputsDic[inputType])

        const generator = new AssignDDLFieldsToAggregateDraft({
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

module.exports = AssignDDLFieldsToAggregateDraftTest;