const RequirementsMappingGenerator = require("../../../../../../../RequirementsMappingGenerator")
const { requirementsMappingGeneratorInput } = require("./mocks");

export default function testRequirementsMappingGenerator(commandArgs, client, runner) {
    runner.describe('RequirementsMappingGenerator', ({ it }) => {
        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const generatorInput = structuredClone(requirementsMappingGeneratorInput)

            for(let i = 0; i < generatorInput.requirementChunks.length; i++) {
                console.log(`\n[#] RequirementChunk ${i + 1}/${generatorInput.requirementChunks.length} 처리 중...`)
                
                const getGeneratorResult = new Promise((resolve, reject) => {
                    const generator = new RequirementsMappingGenerator({
                        onModelCreated: (returnObj) => {
                        },
                        onGenerationSucceeded: (returnObj) => {
                            resolve(returnObj.modelValue.output)
                        },
                    })
                    generator.client.input = generatorInput.baseInput
                    generator.client.input.requirementChunk = generatorInput.requirementChunks[i]
                    generator.generate()
                })
                
                const generatorResult = await getGeneratorResult
                console.log("[#] generatorResult: ", generatorResult)
                
                // 기본 구조 검증
                runner.expect(generatorResult).toBeTruthy()
                runner.expect(generatorResult.boundedContext).toBe(generatorInput.baseInput.boundedContext.name)
                runner.expect(Array.isArray(generatorResult.requirements)).toBeTruthy()
                
                // 각 requirement 검증
                for(const requirement of generatorResult.requirements) {
                    // type 필드 검증 (있는 경우)
                    if(requirement.type) {
                        runner.expect(requirement.type).toBeOneOf(["userStory", "DDL", "Event"])
                    }
                    
                    // refs 필드 검증 (있는 경우)
                    if(requirement.refs) {
                        runner.expect(Array.isArray(requirement.refs)).toBeTruthy()
                    }
                    
                    // text 필드 검증 (있는 경우)
                    if(requirement.text) {
                        runner.expect(typeof requirement.text).toBe('string')
                        runner.expect(requirement.text.length).toBeGreaterOrEqualThan(1)
                    }
                }
                
                console.log(`[#] RequirementChunk ${i + 1} 검증 완료`)
            }
        });
    });
}