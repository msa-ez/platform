const DevideBoundedContextGenerator = require("../../../../../../../DevideBoundedContextGenerator")
const { devideBoundedContextGeneratorInput } = require("./mocks");

export default function testDevideBoundedContextGenerator(commandArgs, client, runner) {
    runner.describe('DevideBoundedContextGenerator', ({ it }) => {
        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise((resolve, reject) => {
                const generator = new DevideBoundedContextGenerator({
                    onModelCreated: (returnObj) => {
                    },
                    onGenerationSucceeded: (returnObj) => {
                        resolve(returnObj.modelValue.output)
                    }
                })

                const generatorInput = structuredClone(devideBoundedContextGeneratorInput)
                generator.client.input = generatorInput
                generator.generate()
            })

            const generatorResult = await getGeneratorResult
            console.log("[#] generatorResult: ", generatorResult)

            // 기본 구조 검증
            runner.expect(generatorResult).toBeTruthy()
            runner.expect(generatorResult.devisionAspect).toBeTruthy()
            runner.expect(generatorResult.thoughts).toBeTruthy()
            runner.expect(Array.isArray(generatorResult.boundedContexts)).toBeTruthy()
            runner.expect(Array.isArray(generatorResult.relations)).toBeTruthy()
            runner.expect(Array.isArray(generatorResult.explanations)).toBeTruthy()

            // boundedContexts 배열이 비어있지 않은지 확인
            runner.expect(generatorResult.boundedContexts.length).toBeGreaterOrEqualThan(1)

            const allBoundedContextNames = generatorResult.boundedContexts.map(bc => bc.name)
            const allBoundedContextAliases = generatorResult.boundedContexts.map(bc => bc.alias)

            // boundedContexts의 각 요소 검증
            for(const bc of generatorResult.boundedContexts) {
                runner.expect(bc.name).toBeTruthy()
                runner.expect(bc.alias).toBeTruthy()
                runner.expect(bc.importance).toBeOneOf(["Core Domain", "Supporting Domain", "Generic Domain"])
                runner.expect(bc.complexity).toBeGreaterOrEqualThan(0)
                runner.expect(bc.complexity).toBeLessOrEqualThan(1)
                runner.expect(bc.differentiation).toBeGreaterOrEqualThan(0)
                runner.expect(bc.differentiation).toBeLessOrEqualThan(1)
                runner.expect(bc.implementationStrategy).toBeTruthy()
                runner.expect(bc.role).toBeTruthy()
                runner.expect(Array.isArray(bc.aggregates)).toBeTruthy()
                runner.expect(Array.isArray(bc.events)).toBeTruthy()
                runner.expect(Array.isArray(bc.requirements)).toBeTruthy()
                runner.expect(Array.isArray(bc.roleRefs)).toBeTruthy()

                // aggregates 검증
                for(const aggregate of bc.aggregates) {
                    runner.expect(aggregate.name).toBeTruthy()
                    runner.expect(aggregate.alias).toBeTruthy()
                }
            }

            // relations의 각 요소 검증
            for(const relation of generatorResult.relations) {
                runner.expect(relation.name).toBeTruthy()
                runner.expect(relation.type).toBeTruthy()
                runner.expect(relation.upStream).toBeTruthy()
                runner.expect(relation.upStream.name).toBeTruthy()
                runner.expect(relation.upStream.alias).toBeTruthy()
                runner.expect(relation.downStream).toBeTruthy()
                runner.expect(relation.downStream.name).toBeTruthy()
                runner.expect(relation.downStream.alias).toBeTruthy()
                runner.expect(Array.isArray(relation.refs)).toBeTruthy()

                // upstream과 downstream이 실제 boundedContext에 존재하는지 확인
                runner.expect(relation.upStream.name).toBeOneOf(allBoundedContextNames)
                runner.expect(relation.downStream.name).toBeOneOf(allBoundedContextNames)
            }

            // explanations의 각 요소 검증
            for(const explanation of generatorResult.explanations) {
                runner.expect(explanation.sourceContext).toBeTruthy()
                runner.expect(explanation.targetContext).toBeTruthy()
                runner.expect(explanation.relationType).toBeTruthy()
                runner.expect(explanation.reason).toBeTruthy()
                runner.expect(explanation.interactionPattern).toBeTruthy()
                runner.expect(Array.isArray(explanation.refs)).toBeTruthy()

                // sourceContext와 targetContext가 실제 boundedContext alias에 존재하는지 확인
                runner.expect(explanation.sourceContext).toBeOneOf(allBoundedContextAliases)
                runner.expect(explanation.targetContext).toBeOneOf(allBoundedContextAliases)
            }
        });
    });
}