const { AssignPreviewFieldsToAggregateDraft } = require("../../../../../../../es-generators")
const { assignPreviewFieldsToAggregateDraftInput } = require("./mocks");

export default async function runAssignPreviewFieldsToAggregateDraft(commandArgs, client) {
    const generatorInput = structuredClone(assignPreviewFieldsToAggregateDraftInput)

    const generator = new AssignPreviewFieldsToAggregateDraft({
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