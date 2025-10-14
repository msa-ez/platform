const RequirementsValidationGenerator = require("../../../../../../../RequirementsValidationGenerator")
const { requirementsValidationGeneratorInput } = require("./mocks");

export default function testRequirementsValidationGenerator(commandArgs, client, runner) {
    runner.describe('RequirementsValidationGenerator', ({ it }) => {
        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise((resolve, reject) => {
                const generator = new RequirementsValidationGenerator({
                    onModelCreated: (returnObj) => {
                    },
                    onGenerationSucceeded: (returnObj) => {
                        resolve(returnObj.modelValue.output)
                    }
                })

                const generatorInput = structuredClone(requirementsValidationGeneratorInput)
                generator.client.input = generatorInput
                generator.generate()
            })

            const generatorResult = await getGeneratorResult
            console.log("[#] generatorResult: ", generatorResult)

            runner.expect(generatorResult.type).toBe("ANALYSIS_RESULT")
            runner.expect(generatorResult.analysisResult).toBeTruthy()
            const analysisResult = generatorResult.analysisResult
            
            runner.expect(analysisResult.recommendedBoundedContextsNumber).toBeGreaterOrEqualThan(3)
            runner.expect(analysisResult.recommendedBoundedContextsNumber).toBeLessOrEqualThan(15)
            runner.expect(analysisResult.reasonOfRecommendedBoundedContextsNumber).toBeTruthy()

            const allEventNames = analysisResult.events.map(event => event.name)
            for(const event of analysisResult.events) {
                runner.expect(event.name).toBeTruthy()
                runner.expect(event.displayName).toBeTruthy()
                runner.expect(event.actor).toBeTruthy()
                runner.expect(event.level).toBeGreaterOrEqualThan(1)
                runner.expect(event.description).toBeTruthy()
                
                for(const nextEvent of event.nextEvents) {
                    runner.expect(nextEvent).toBeOneOf(allEventNames)
                }
            }

            for(const actor of analysisResult.actors) {
                runner.expect(actor.name).toBeTruthy()
                runner.expect(actor.lane).toBeGreaterOrEqualThan(0)
                
                for(const event of actor.events) {
                    runner.expect(event).toBeOneOf(allEventNames)
                }
            }
        });
    });
}