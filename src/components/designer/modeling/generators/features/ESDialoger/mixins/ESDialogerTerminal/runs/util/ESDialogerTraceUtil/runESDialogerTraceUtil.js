const { ESDialogerTraceUtil } = require("../../../../../utils")
const { ESDialogerTraceUtilInput } = require("./mocks");

export default async function runESDialogerTraceUtil(commandArgs, client) {
    const utilInput = structuredClone(ESDialogerTraceUtilInput)

    const result = ESDialogerTraceUtil.extractTraceInfoFromDraftOptions(
        utilInput.draftOptions, utilInput.projectInfo
    )
    console.log("생성된 추적 정보: ", result)
}