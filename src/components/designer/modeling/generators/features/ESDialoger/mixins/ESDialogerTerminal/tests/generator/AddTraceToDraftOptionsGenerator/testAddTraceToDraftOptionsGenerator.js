const { AddTraceToDraftOptionsGenerator } = require("../../../../../../../es-generators")
const { AddTraceToDraftOptionsGeneratorInput } = require("./mocks");

export default function testAddTraceToDraftOptionsGenerator(commandArgs, client, runner) {
    runner.describe('AddTraceToDraftOptionsGenerator', ({ it }) => {
        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise(async (resolve, reject) => {
                const generatorInput = structuredClone(AddTraceToDraftOptionsGeneratorInput)
                const result = await AddTraceToDraftOptionsGenerator.addTraceToDraftOptions(
                    generatorInput.generatedDraftOptions,
                    generatorInput.boundedContextName,
                    generatorInput.functionalRequirements,
                    generatorInput.traceMap,
                    {
                        onModelCreated: (returnObj) => {
                        },
                        onGenerationSucceeded: (returnObj) => {
                        }
                    }
                )
                resolve(result)
            })

            const generatorResult = await getGeneratorResult
            console.log("[#] generatorResult: ", generatorResult)

            // 1. 결과 구조 검증
            runner.expect(generatorResult).toBeTruthy()
            runner.expect(generatorResult.draftTraceMap).toBeTruthy()
            runner.expect(generatorResult.generatedDraftOptionsWithTrace).toBeTruthy()

            const draftTraceMap = generatorResult.draftTraceMap

            // 2. draftTraceMap의 기본 구조 검증
            runner.expect(draftTraceMap.aggregates).toBeTruthy()
            runner.expect(draftTraceMap.enumerations).toBeTruthy()
            runner.expect(draftTraceMap.valueObjects).toBeTruthy()
            runner.expect(Array.isArray(draftTraceMap.aggregates)).toBeTruthy()
            runner.expect(Array.isArray(draftTraceMap.enumerations)).toBeTruthy()
            runner.expect(Array.isArray(draftTraceMap.valueObjects)).toBeTruthy()

            // 3. 모든 도메인 객체가 name과 refs를 가지고 있는지 검증
            const allDomainObjects = [
                ...draftTraceMap.aggregates,
                ...draftTraceMap.enumerations,
                ...draftTraceMap.valueObjects
            ]

            for (const domainObject of allDomainObjects) {
                runner.expect(domainObject.name).toBeTruthy()
                runner.expect(domainObject.refs).toBeTruthy()
                runner.expect(Array.isArray(domainObject.refs)).toBeTruthy()
                
                // refs 형식 검증: 배열의 배열의 배열 [[[startLine, startPhrase], [endLine, endPhrase]]]
                for (const refRange of domainObject.refs) {
                    runner.expect(Array.isArray(refRange)).toBeTruthy()
                    runner.expect(refRange.length).toBe(2)
                    
                    for (const refPoint of refRange) {
                        runner.expect(Array.isArray(refPoint)).toBeTruthy()
                        runner.expect(refPoint.length).toBe(2)
                        runner.expect(typeof refPoint[0]).toBe('number')
                    }
                }
            }

            // 4. 필수 도메인 객체 존재 여부 검증
            const aggregateNames = draftTraceMap.aggregates.map(a => a.name)
            const enumerationNames = draftTraceMap.enumerations.map(e => e.name)
            const valueObjectNames = draftTraceMap.valueObjects.map(v => v.name)

            runner.expect(aggregateNames).toContain('Book')
            runner.expect(aggregateNames).toContain('BookCategory')

            runner.expect(enumerationNames).toContain('BookStatus')
            runner.expect(enumerationNames).toContain('BookCategory')
            runner.expect(enumerationNames).toContain('BookCategoryType')

            runner.expect(valueObjectNames).toContain('LoanReference')
            runner.expect(valueObjectNames).toContain('ReservationReference')
            runner.expect(valueObjectNames).toContain('LoanHistoryReference')
            runner.expect(valueObjectNames).toContain('BookStateHistoryReference')
            runner.expect(valueObjectNames).toContain('BookCategoryReference')

            // 5. generatedDraftOptionsWithTrace에 refs가 추가되었는지 검증
            const generatedDraftOptionsWithTrace = generatorResult.generatedDraftOptionsWithTrace
            runner.expect(Array.isArray(generatedDraftOptionsWithTrace)).toBeTruthy()
            runner.expect(generatedDraftOptionsWithTrace.length).toBeGreaterThan(0)

            let hasRefsInGeneratedOptions = false
            for (const option of generatedDraftOptionsWithTrace) {
                if (option.structure) {
                    for (const structure of option.structure) {
                        if (structure.aggregate && structure.aggregate.refs) {
                            hasRefsInGeneratedOptions = true
                            break
                        }
                        if (structure.enumerations) {
                            for (const enumeration of structure.enumerations) {
                                if (enumeration.refs) {
                                    hasRefsInGeneratedOptions = true
                                    break
                                }
                            }
                        }
                        if (structure.valueObjects) {
                            for (const valueObject of structure.valueObjects) {
                                if (valueObject.refs) {
                                    hasRefsInGeneratedOptions = true
                                    break
                                }
                            }
                        }
                    }
                }
            }
            runner.expect(hasRefsInGeneratedOptions).toBeTruthy()
        });
    });
}

