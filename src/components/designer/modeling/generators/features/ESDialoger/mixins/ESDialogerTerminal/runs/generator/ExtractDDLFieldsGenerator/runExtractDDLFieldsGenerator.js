const { ExtractDDLFieldsGenerator, DDLLineRefSplitter } = require("../../../../../../../es-generators")
const { extractDDLFieldsGeneratorInput, DDLLineRefSplitterInput } = require("./mocks");

export default async function runExtractDDLFieldsGenerator(commandArgs, client) {
    const relatedUtilName = commandArgs[1]
    if(relatedUtilName) {
        if(relatedUtilName === "DDLLineRefSplitter") {
            const result = DDLLineRefSplitter.convertToAbsoluteRefs(
                DDLLineRefSplitterInput.sanitizedRefs,
                DDLLineRefSplitterInput.ddlLines,
                DDLLineRefSplitterInput.lineTraceMap
            )
            console.log(result)
        }
        else {
            alert(`지원하지 않는 유틸리티 이름: ${relatedUtilName}`)
        }
        return
    }

    const generatorInput = structuredClone(extractDDLFieldsGeneratorInput)

    const generator = new ExtractDDLFieldsGenerator({
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
