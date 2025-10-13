const RecursiveRequirementsValidationGenerator = require("../../../../../../../RecursiveRequirementsValidationGenerator")
const { recursiveRequirementsValidationGeneratorInput } = require("./mocks");

export default function testRecursiveRequirementsValidationGenerator(commandArgs, client, runner) {
    runner.describe('RecursiveRequirementsValidationGenerator', ({ it }) => {
        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise(async (resolve, reject) => {
                const generatorInput = structuredClone(recursiveRequirementsValidationGeneratorInput)

                const generator = new RecursiveRequirementsValidationGenerator({
                    onModelCreated: (returnObj) => {
                    },
                    onGenerationFinished: (returnObj) => {
                        generator.handleGenerationFinished(returnObj.modelValue.output);
                    }
                })
            
                const finalResult = await generator.validateRecursively(generatorInput.usedUserStory)
                resolve(finalResult)
            })

            const generatorResult = await getGeneratorResult
            console.log("[#] generatorResult: ", generatorResult)

            runner.expect(generatorResult.type).toBe("ANALYSIS_RESULT")
            runner.expect(generatorResult.analysisResult).toBeTruthy()
            const analysisResult = generatorResult.analysisResult
            
            runner.expect(analysisResult.recommendedBoundedContextsNumber).toBeGreaterOrEqualThan(3)
            runner.expect(analysisResult.recommendedBoundedContextsNumber).toBeLessOrEqualThan(15)

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