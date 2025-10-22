import runRequirementsValidationGenerator from "./RequirementsValidationGenerator/runRequirementsValidationGenerator"
import runRecursiveRequirementsValidationGenerator from "./RecursiveRequirementsValidationGenerator/runRecursiveRequirementsValidationGenerator"
import runDevideBoundedContextGenerator from "./DevideBoundedContextGenerator/runDevideBoundedContextGenerator"
import runRequirementsMappingGenerator from "./RequirementsMappingGenerator/runRequirementsMappingGenerator"
import runExtractDDLFieldsGenerator from "./ExtractDDLFieldsGenerator/runExtractDDLFieldsGenerator"
import runAddTraceToDraftOptionsGenerator from "./AddTraceToDraftOptionsGenerator/runAddTraceToDraftOptionsGenerator"
import runAssignPreviewFieldsToAggregateDraft from "./AssignPreviewFieldsToAggregateDraft/runAssignPreviewFieldsToAggregateDraft"
import runCommandReadModelExtractor from "./CommandReadModelExtractor/runCommandReadModelExtractor"
import runRecursiveCommandReadModelExtractor from "./RecursiveCommandReadModelExtractor/runRecursiveCommandReadModelExtractor"

export const runGeneratorCommandRegistry = {
    RequirementsValidationGenerator: {
        handler: runRequirementsValidationGenerator,
        description: "RequirementsValidationGenerator 실행",
        usage: "run runGenerator RequirementsValidationGenerator"
    },
    RecursiveRequirementsValidationGenerator: {
        handler: runRecursiveRequirementsValidationGenerator,
        description: "RecursiveRequirementsValidationGenerator 실행",
        usage: "run runGenerator RecursiveRequirementsValidationGenerator"
    },
    DevideBoundedContextGenerator: {
        handler: runDevideBoundedContextGenerator,
        description: "DevideBoundedContextGenerator 실행",
        usage: "run runGenerator DevideBoundedContextGenerator"
    },
    CommandReadModelExtractor: {
        handler: runCommandReadModelExtractor,
        description: "CommandReadModelExtractor 실행",
        usage: "run runGenerator CommandReadModelExtractor"
    },
    RecursiveCommandReadModelExtractor: {
        handler: runRecursiveCommandReadModelExtractor,
        description: "RecursiveCommandReadModelExtractor 실행",
        usage: "run runGenerator RecursiveCommandReadModelExtractor"
    },
    RequirementsMappingGenerator: {
        handler: runRequirementsMappingGenerator,
        description: "RequirementsMappingGenerator 실행",
        usage: "run runGenerator RequirementsMappingGenerator"
    },
    ExtractDDLFieldsGenerator: {
        handler: runExtractDDLFieldsGenerator,
        description: "ExtractDDLFieldsGenerator 실행",
        usage: "run runGenerator ExtractDDLFieldsGenerator (DDLLineRefSplitter)"
    },
    AddTraceToDraftOptionsGenerator: {
        handler: runAddTraceToDraftOptionsGenerator,
        description: "AddTraceToDraftOptionsGenerator 실행",
        usage: "run runGenerator AddTraceToDraftOptionsGenerator"
    },
    AssignPreviewFieldsToAggregateDraft: {
        handler: runAssignPreviewFieldsToAggregateDraft,
        description: "AssignPreviewFieldsToAggregateDraft 실행",
        usage: "run runGenerator AssignPreviewFieldsToAggregateDraft"
    }
}

export const runGenerator = async function (commandArgs, client) {
    const generatorName = commandArgs[0]
    const command = runGeneratorCommandRegistry[generatorName]
    if(!command) {
        alert(`유효하지 않은 Generator 이름입니다. ${generatorName}`)
        return false
    }
    return await command.handler(commandArgs, client)
}