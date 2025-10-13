import testRequirementsValidationGenerator from "./RequirementsValidationGenerator/testRequirementsValidationGenerator"
import testRecursiveRequirementsValidationGenerator from "./RecursiveRequirementsValidationGenerator/testRecursiveRequirementsValidationGenerator"
import testDevideBoundedContextGenerator from "./DevideBoundedContextGenerator/testDevideBoundedContextGenerator"
import testRequirementsMappingGenerator from "./RequirementsMappingGenerator/testRequirementsMappingGenerator"

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
    }
}

export const testGenerator = function (commandArgs, client, runner) {
    testRequirementsValidationGenerator(commandArgs, client, runner)
    testRecursiveRequirementsValidationGenerator(commandArgs, client, runner)
    testDevideBoundedContextGenerator(commandArgs, client, runner)
    testRequirementsMappingGenerator(commandArgs, client, runner)
}