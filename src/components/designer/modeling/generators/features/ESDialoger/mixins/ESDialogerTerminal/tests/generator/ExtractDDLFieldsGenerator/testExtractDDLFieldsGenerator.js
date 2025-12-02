const { ExtractDDLFieldsGenerator, DDLLineRefSplitter } = require("../../../../../../../es-generators")
const { extractDDLFieldsGeneratorInput, DDLLineRefSplitterInput } = require("./mocks");

export default function testExtractDDLFieldsGenerator(commandArgs, client, runner) {
    runner.describe('ExtractDDLFieldsGenerator', ({ it }) => {
        it('생성된 DDL 추적성 정보가 기존 정보를 활용해서 적절하게 구축되어야 함', async () => {
            const absoluteRefs = DDLLineRefSplitter.convertToAbsoluteRefs(
                DDLLineRefSplitterInput.sanitizedRefs,
                DDLLineRefSplitterInput.ddlLines,
                DDLLineRefSplitterInput.lineTraceMap
            )
            console.log("[#] absoluteRefs: ", absoluteRefs)

            // absoluteRefs 검증
            runner.expect(Array.isArray(absoluteRefs)).toBe(true)
            runner.expect(absoluteRefs.length).toBeGreaterThan(0)

            // 예상되는 필드 이름들
            const expectedFieldNames = DDLLineRefSplitterInput.sanitizedRefs.map(ref => ref.fieldName)
            const actualFieldNames = absoluteRefs.map(ref => ref.fieldName)
            
            // 모든 예상 필드가 결과에 포함되어야 함
            for (const expectedFieldName of expectedFieldNames) {
                runner.expect(actualFieldNames).toContain(expectedFieldName)
            }

            // 각 필드의 구조 검증
            for (const fieldRef of absoluteRefs) {
                runner.expect(fieldRef.fieldName).toBeTruthy()
                runner.expect(Array.isArray(fieldRef.refs)).toBe(true)
                runner.expect(fieldRef.refs.length).toBeGreaterThan(0)

                // refs의 각 항목 검증
                for (const ref of fieldRef.refs) {
                    runner.expect(Array.isArray(ref)).toBe(true)
                    runner.expect(ref.length).toBe(2)
                    
                    const [startRef, endRef] = ref
                    runner.expect(Array.isArray(startRef)).toBe(true)
                    runner.expect(Array.isArray(endRef)).toBe(true)
                    runner.expect(startRef.length).toBe(2)
                    runner.expect(endRef.length).toBe(2)

                    // 좌표값 검증
                    const [startLine, startCol] = startRef
                    const [endLine, endCol] = endRef
                    
                    runner.expect(typeof startLine).toBe('number')
                    runner.expect(typeof startCol).toBe('number')
                    runner.expect(typeof endLine).toBe('number')
                    runner.expect(typeof endCol).toBe('number')
                    
                    runner.expect(startLine).toBeGreaterThan(0)
                    runner.expect(startCol).toBeGreaterOrEqualThan(0)
                    runner.expect(endLine).toBeGreaterThan(0)
                    runner.expect(endCol).toBeGreaterOrEqualThan(0)
                    
                    // 시작 라인이 끝 라인보다 작거나 같아야 함
                    runner.expect(startLine).toBeLessOrEqualThan(endLine)
                }
            }
        });

        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise(async (resolve, reject) => {
                const generator = new ExtractDDLFieldsGenerator({
                    onModelCreated: (returnObj) => {
                    },
                    onGenerationSucceeded: (returnObj) => {
                        resolve(returnObj.modelValue.output)
                    },
                })

                const generatorInput = structuredClone(extractDDLFieldsGeneratorInput)
                generator.client.input = generatorInput
                generator.generate()
            })

            const generatorResult = await getGeneratorResult
            console.log("[#] generatorResult: ", generatorResult)

            // generatorResult 기본 구조 검증
            runner.expect(Array.isArray(generatorResult)).toBe(true)
            runner.expect(generatorResult.length).toBeGreaterThan(0)

            // DDL에서 예상되는 필드들 (extractDDLFieldsGeneratorInput의 DDL 분석 기반)
            const expectedFieldsFromBooksTable = [
                'book_id', 'title', 'isbn', 'author', 'publisher', 'category', 
                'status', 'registration_date', 'disposal_date', 'disposal_reason', 
                'created_at', 'updated_at'
            ]
            const expectedFieldsFromHistoryTable = [
                'history_id', 'book_id', 'previous_status', 'new_status', 
                'change_reason', 'changed_by', 'change_date'
            ]
            const allExpectedFields = [...new Set([...expectedFieldsFromBooksTable, ...expectedFieldsFromHistoryTable])]

            const actualFieldNames = generatorResult.map(ref => ref.fieldName)
            for (const criticalField of allExpectedFields) {
                runner.expect(actualFieldNames).toContain(criticalField)
            }

            // 각 필드의 구조 검증
            for (const fieldRef of generatorResult) {
                runner.expect(fieldRef.fieldName).toBeTruthy()
                runner.expect(typeof fieldRef.fieldName).toBe('string')
                runner.expect(fieldRef.fieldName.length).toBeGreaterThan(0)
                
                runner.expect(Array.isArray(fieldRef.refs)).toBe(true)
                runner.expect(fieldRef.refs.length).toBeGreaterThan(0)

                // refs의 각 항목 검증
                for (const ref of fieldRef.refs) {
                    runner.expect(Array.isArray(ref)).toBe(true)
                    runner.expect(ref.length).toBe(2)
                    
                    const [startRef, endRef] = ref
                    runner.expect(Array.isArray(startRef)).toBe(true)
                    runner.expect(Array.isArray(endRef)).toBe(true)
                    runner.expect(startRef.length).toBe(2)
                    runner.expect(endRef.length).toBe(2)

                    // 절대 좌표값 검증
                    const [startLine, startCol] = startRef
                    const [endLine, endCol] = endRef
                    
                    runner.expect(typeof startLine).toBe('number')
                    runner.expect(typeof startCol).toBe('number')
                    runner.expect(typeof endLine).toBe('number')
                    runner.expect(typeof endCol).toBe('number')
                    
                    runner.expect(startLine).toBeGreaterThan(0)
                    runner.expect(startCol).toBeGreaterOrEqualThan(0)
                    runner.expect(endLine).toBeGreaterThan(0)
                    runner.expect(endCol).toBeGreaterOrEqualThan(0)
                    
                    // 시작 라인이 끝 라인보다 작거나 같아야 함
                    runner.expect(startLine).toBeLessOrEqualThan(endLine)
                    
                    // 원본 DDL의 refs 범위 내에 있어야 함 (24-42, 84-96)
                    const validRanges = [[24, 42], [84, 96]]
                    const isInValidRange = validRanges.some(([min, max]) => 
                        startLine >= min && endLine <= max
                    )
                    runner.expect(isInValidRange).toBe(true)
                }
            }
        });
    });
}