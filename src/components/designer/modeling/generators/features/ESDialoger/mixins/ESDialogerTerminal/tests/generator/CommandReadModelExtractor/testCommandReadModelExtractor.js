const CommandReadModelExtractor = require("../../../../../../../CommandReadModelExtractor")
const { commandReadModelExtractorInput } = require("./mocks");

export default function testCommandReadModelExtractor(commandArgs, client, runner) {
    runner.describe('CommandReadModelExtractor', ({ it }) => {
        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise((resolve, reject) => {
                const generator = new CommandReadModelExtractor({
                    onModelCreated: (returnObj) => {
                    },
                    onGenerationSucceeded: (returnObj) => {
                        resolve(returnObj.modelValue.output)
                    },
                })

                const generatorInput = structuredClone(commandReadModelExtractorInput)
                generator.client.input = generatorInput
                generator.generate()
            })

            const generatorResult = await getGeneratorResult
            console.log("[#] generatorResult: ", generatorResult)

            // 기본 구조 검증
            runner.expect(generatorResult.extractedData).toBeTruthy()
            runner.expect(generatorResult.extractedData.boundedContexts).toBeTruthy()
            runner.expect(Array.isArray(generatorResult.extractedData.boundedContexts)).toBeTruthy()
            runner.expect(generatorResult.extractedData.boundedContexts.length).toBeGreaterThan(0)

            const validCommandActors = ["user", "admin", "system", "external"]
            const validReadModelActors = ["user", "admin", "system"]

            // 각 Bounded Context 검증
            for(const boundedContext of generatorResult.extractedData.boundedContexts) {
                runner.expect(boundedContext.name).toBeTruthy()
                runner.expect(Array.isArray(boundedContext.commands)).toBeTruthy()
                runner.expect(Array.isArray(boundedContext.readModels)).toBeTruthy()

                // Commands 검증
                for(const command of boundedContext.commands) {
                    runner.expect(command.name).toBeTruthy()
                    runner.expect(command.actor).toBeOneOf(validCommandActors)
                    runner.expect(command.aggregate).toBeTruthy()
                    runner.expect(command.description).toBeTruthy()
                    runner.expect(Array.isArray(command.refs)).toBeTruthy()
                    runner.expect(command.refs.length).toBeGreaterThan(0)
                    
                    // Command 이름이 PascalCase이고 Verb+Noun 패턴인지 확인
                    runner.expect(/^[A-Z][a-zA-Z]*$/.test(command.name)).toBeTruthy()
                }

                // ReadModels 검증
                for(const readModel of boundedContext.readModels) {
                    runner.expect(readModel.name).toBeTruthy()
                    runner.expect(readModel.actor).toBeOneOf(validReadModelActors)
                    runner.expect(readModel.aggregate).toBeTruthy()
                    runner.expect(typeof readModel.isMultipleResult).toBe('boolean')
                    runner.expect(readModel.description).toBeTruthy()
                    runner.expect(Array.isArray(readModel.refs)).toBeTruthy()
                    runner.expect(readModel.refs.length).toBeGreaterThan(0)
                    
                    // ReadModel 이름이 PascalCase인지 확인
                    runner.expect(/^[A-Z][a-zA-Z]*$/.test(readModel.name)).toBeTruthy()
                }
            }

            // currentGeneratedLength 검증
            runner.expect(generatorResult.currentGeneratedLength).toBeTruthy()
            runner.expect(typeof generatorResult.currentGeneratedLength).toBe('number')
            runner.expect(generatorResult.currentGeneratedLength).toBeGreaterThan(0)
        });
    });
}