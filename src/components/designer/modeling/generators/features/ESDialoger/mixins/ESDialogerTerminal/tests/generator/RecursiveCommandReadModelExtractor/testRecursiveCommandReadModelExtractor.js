const RecursiveCommandReadModelExtractor = require("../../../../../../../RecursiveCommandReadModelExtractor")
const { recursiveCommandReadModelExtractorInput } = require("./mocks");

export default function testRecursiveCommandReadModelExtractor(commandArgs, client, runner) {
    runner.describe('RecursiveCommandReadModelExtractor', ({ it }) => {
        let generator;
        let finalResult;

        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise(async (resolve, reject) => {
                const generatorInput = structuredClone(recursiveCommandReadModelExtractorInput)

                generator = new RecursiveCommandReadModelExtractor({
                    onModelCreated: (returnObj) => {
                    },
                    onGenerationFinished: (returnObj) => {
                    }
                })
                generator.client.input = {
                    "resultDevideBoundedContext": generatorInput.resultDevideBoundedContext,
                }
            
                const result = await generator.generateRecursively(generatorInput.usedUserStory)
                resolve(result)
            })

            finalResult = await getGeneratorResult
            console.log("[#] generatorResult: ", JSON.stringify(finalResult, null, 2))

            // 기본 구조 검증
            runner.expect(finalResult).toBeTruthy()
            runner.expect(finalResult.extractedData).toBeTruthy()
            runner.expect(finalResult.extractedData.boundedContexts).toBeTruthy()
            runner.expect(Array.isArray(finalResult.extractedData.boundedContexts)).toBe(true)
            runner.expect(finalResult.currentGeneratedLength).toBeGreaterThan(0)
        });

        it('최소 하나 이상의 Bounded Context가 추출되어야 함', async () => {
            const boundedContexts = finalResult.extractedData.boundedContexts
            runner.expect(boundedContexts.length).toBeGreaterOrEqualThan(1)
            
            // 각 Bounded Context 구조 검증
            for(const bc of boundedContexts) {
                runner.expect(bc.name).toBeTruthy()
                runner.expect(Array.isArray(bc.commands)).toBe(true)
                runner.expect(Array.isArray(bc.readModels)).toBe(true)
            }
        });

        it('추출된 Command가 올바른 구조를 가져야 함', async () => {
            const boundedContexts = finalResult.extractedData.boundedContexts
            let totalCommands = 0;

            for(const bc of boundedContexts) {
                for(const command of bc.commands) {
                    totalCommands++;
                    
                    // 필수 필드 검증
                    runner.expect(command.name).toBeTruthy()
                    runner.expect(command.actor).toBeTruthy()
                    runner.expect(['user', 'admin', 'system', 'external']).toContain(command.actor)
                    runner.expect(command.aggregate).toBeTruthy()
                    runner.expect(command.description).toBeTruthy()
                    runner.expect(Array.isArray(command.refs)).toBe(true)
                    
                    // refs 구조 검증
                    if(command.refs.length > 0) {
                        for(const refGroup of command.refs) {
                            runner.expect(Array.isArray(refGroup)).toBe(true)
                            for(const ref of refGroup) {
                                runner.expect(Array.isArray(ref)).toBe(true)
                                runner.expect(ref.length).toBe(2)
                            }
                        }
                    }
                }
            }

            console.log(`[#] 총 ${totalCommands}개의 Command 추출됨`)
            runner.expect(totalCommands).toBeGreaterOrEqualThan(1)
        });

        it('추출된 ReadModel이 올바른 구조를 가져야 함', async () => {
            const boundedContexts = finalResult.extractedData.boundedContexts
            let totalReadModels = 0;

            for(const bc of boundedContexts) {
                for(const readModel of bc.readModels) {
                    totalReadModels++;
                    
                    // 필수 필드 검증
                    runner.expect(readModel.name).toBeTruthy()
                    runner.expect(readModel.actor).toBeTruthy()
                    runner.expect(['user', 'admin', 'system']).toContain(readModel.actor)
                    runner.expect(readModel.aggregate).toBeTruthy()
                    runner.expect(typeof readModel.isMultipleResult).toBe('boolean')
                    runner.expect(readModel.description).toBeTruthy()
                    runner.expect(Array.isArray(readModel.refs)).toBe(true)
                    
                    // refs 구조 검증
                    if(readModel.refs.length > 0) {
                        for(const refGroup of readModel.refs) {
                            runner.expect(Array.isArray(refGroup)).toBe(true)
                            for(const ref of refGroup) {
                                runner.expect(Array.isArray(ref)).toBe(true)
                                runner.expect(ref.length).toBe(2)
                            }
                        }
                    }
                }
            }

            console.log(`[#] 총 ${totalReadModels}개의 ReadModel 추출됨`)
            runner.expect(totalReadModels).toBeGreaterOrEqualThan(1)
        });

        it('청크별 결과가 generatedResults에 저장되어야 함', async () => {
            runner.expect(generator.generatedResults).toBeTruthy()
            runner.expect(Array.isArray(generator.generatedResults)).toBe(true)
            runner.expect(generator.generatedResults.length).toBeGreaterOrEqualThan(1)
            
            console.log(`[#] 총 ${generator.generatedResults.length}개의 청크 결과 생성됨`)
            
            // 각 청크 결과 구조 검증
            for(let i = 0; i < generator.generatedResults.length; i++) {
                const chunkResult = generator.generatedResults[i]
                console.log(`[#] 청크 ${i + 1} 검증 중...`)
                
                runner.expect(chunkResult.extractedData).toBeTruthy()
                runner.expect(chunkResult.extractedData.boundedContexts).toBeTruthy()
                runner.expect(Array.isArray(chunkResult.extractedData.boundedContexts)).toBe(true)
            }
        });

        it('누적 결과에 중복 Command가 없어야 함', async () => {
            const boundedContexts = finalResult.extractedData.boundedContexts
            
            for(const bc of boundedContexts) {
                const commandNames = bc.commands.map(cmd => cmd.name)
                const uniqueCommandNames = [...new Set(commandNames)]
                
                if(commandNames.length !== uniqueCommandNames.length) {
                    const duplicates = commandNames.filter((name, index) => commandNames.indexOf(name) !== index)
                    throw new Error(`중복된 Command 발견: ${duplicates.join(', ')} in ${bc.name}`)
                }
                
                runner.expect(commandNames.length).toBe(uniqueCommandNames.length)
            }
        });

        it('누적 결과에 중복 ReadModel이 없어야 함', async () => {
            const boundedContexts = finalResult.extractedData.boundedContexts
            
            for(const bc of boundedContexts) {
                const readModelNames = bc.readModels.map(rm => rm.name)
                const uniqueReadModelNames = [...new Set(readModelNames)]
                
                if(readModelNames.length !== uniqueReadModelNames.length) {
                    const duplicates = readModelNames.filter((name, index) => readModelNames.indexOf(name) !== index)
                    throw new Error(`중복된 ReadModel 발견: ${duplicates.join(', ')} in ${bc.name}`)
                }
                
                runner.expect(readModelNames.length).toBe(uniqueReadModelNames.length)
            }
        });

        it('청크별 결과가 최종 누적 결과에 모두 반영되어야 함', async () => {
            const allChunkCommands = new Set()
            const allChunkReadModels = new Set()
            
            // 모든 청크 결과에서 추출된 항목 수집
            for(const chunkResult of generator.generatedResults) {
                for(const bc of chunkResult.extractedData.boundedContexts) {
                    for(const cmd of bc.commands || []) {
                        allChunkCommands.add(`${bc.name}:${cmd.name}`)
                    }
                    for(const rm of bc.readModels || []) {
                        allChunkReadModels.add(`${bc.name}:${rm.name}`)
                    }
                }
            }
            
            // 최종 누적 결과에서 항목 수집
            const accumulatedCommands = new Set()
            const accumulatedReadModels = new Set()
            
            for(const bc of finalResult.extractedData.boundedContexts) {
                for(const cmd of bc.commands || []) {
                    accumulatedCommands.add(`${bc.name}:${cmd.name}`)
                }
                for(const rm of bc.readModels || []) {
                    accumulatedReadModels.add(`${bc.name}:${rm.name}`)
                }
            }
            
            console.log(`[#] 청크별 Command 총합: ${allChunkCommands.size}, 누적 결과: ${accumulatedCommands.size}`)
            console.log(`[#] 청크별 ReadModel 총합: ${allChunkReadModels.size}, 누적 결과: ${accumulatedReadModels.size}`)
            
            // 청크 결과가 누적 결과에 모두 포함되어 있는지 확인
            // (중복 제거로 인해 누적 결과가 같거나 적을 수 있음)
            runner.expect(accumulatedCommands.size).toBeGreaterOrEqualThan(1)
            runner.expect(accumulatedReadModels.size).toBeGreaterOrEqualThan(1)
            
            // 누적 결과의 모든 항목이 청크 결과 중 하나에서 나왔는지 확인
            for(const cmd of accumulatedCommands) {
                runner.expect(allChunkCommands.has(cmd)).toBe(true)
            }
            for(const rm of accumulatedReadModels) {
                runner.expect(allChunkReadModels.has(rm)).toBe(true)
            }
        });

        it('accumulated 객체가 올바르게 유지되어야 함', async () => {
            runner.expect(generator.accumulated).toBeTruthy()
            runner.expect(generator.accumulated.boundedContexts).toBeTruthy()
            runner.expect(Array.isArray(generator.accumulated.boundedContexts)).toBe(true)
            
            // accumulated와 최종 결과가 동일해야 함
            const accumulatedStr = JSON.stringify(generator.accumulated)
            const finalResultStr = JSON.stringify(finalResult.extractedData)
            runner.expect(accumulatedStr).toBe(finalResultStr)
        });

        it('isProcessing 플래그가 완료 후 false로 설정되어야 함', async () => {
            runner.expect(generator.isProcessing).toBe(false)
        });
    });
}