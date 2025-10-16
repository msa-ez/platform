import testRequirementsValidationGenerator from "./RequirementsValidationGenerator/testRequirementsValidationGenerator"
import testRecursiveRequirementsValidationGenerator from "./RecursiveRequirementsValidationGenerator/testRecursiveRequirementsValidationGenerator"
import testDevideBoundedContextGenerator from "./DevideBoundedContextGenerator/testDevideBoundedContextGenerator"
import testRequirementsMappingGenerator from "./RequirementsMappingGenerator/testRequirementsMappingGenerator"
import testExtractDDLFieldsGenerator from "./ExtractDDLFieldsGenerator/testExtractDDLFieldsGenerator"
import testAddTraceToDraftOptionsGenerator from "./AddTraceToDraftOptionsGenerator/testAddTraceToDraftOptionsGenerator"
import testAssignPreviewFieldsToAggregateDraft from "./AssignPreviewFieldsToAggregateDraft/testAssignPreviewFieldsToAggregateDraft"

export const testGeneratorCommandRegistry = {
    RequirementsValidationGenerator: {
        handler: null,
        description: "RequirementsValidationGenerator 테스트",
        usage: "test RequirementsValidationGenerator"
    },
    RecursiveRequirementsValidationGenerator: {
        handler: null,
        description: "RecursiveRequirementsValidationGenerator 테스트",
        usage: "test RecursiveRequirementsValidationGenerator"
    },
    DevideBoundedContextGenerator: {
        handler: null,
        description: "DevideBoundedContextGenerator 테스트",
        usage: "test DevideBoundedContextGenerator"
    },
    RequirementsMappingGenerator: {
        handler: null,
        description: "RequirementsMappingGenerator 테스트",
        usage: "test RequirementsMappingGenerator"
    },
    ExtractDDLFieldsGenerator: {
        handler: null,
        description: "ExtractDDLFieldsGenerator 테스트",
        usage: "test ExtractDDLFieldsGenerator"
    },
    AddTraceToDraftOptionsGenerator: {
        handler: null,
        description: "AddTraceToDraftOptionsGenerator 테스트",
        usage: "test AddTraceToDraftOptionsGenerator"
    },
    AssignPreviewFieldsToAggregateDraft: {
        handler: null,
        description: "AssignPreviewFieldsToAggregateDraft 테스트",
        usage: "test AssignPreviewFieldsToAggregateDraft"
    }
}

export const testGenerator = function (commandArgs, client, runner) {
    testRequirementsValidationGenerator(commandArgs, client, runner)
    testRecursiveRequirementsValidationGenerator(commandArgs, client, runner)
    testDevideBoundedContextGenerator(commandArgs, client, runner)
    testRequirementsMappingGenerator(commandArgs, client, runner)
    testExtractDDLFieldsGenerator(commandArgs, client, runner)
    testAddTraceToDraftOptionsGenerator(commandArgs, client, runner)
    testAssignPreviewFieldsToAggregateDraft(commandArgs, client, runner)
}