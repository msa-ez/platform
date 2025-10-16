const { AssignPreviewFieldsToAggregateDraft } = require("../../../../../../../es-generators")
const { assignPreviewFieldsToAggregateDraftInput } = require("./mocks");

export default function testAssignPreviewFieldsToAggregateDraft(commandArgs, client, runner) {
    runner.describe('AssignPreviewFieldsToAggregateDraft', ({ it }) => {
        it('생성 결과가 유효한 형식을 가져야 함', async () => {
            const getGeneratorResult = new Promise(async (resolve, reject) => {
                const generatorInput = structuredClone(assignPreviewFieldsToAggregateDraftInput)

                const generator = new AssignPreviewFieldsToAggregateDraft({
                    onModelCreated: (returnObj) => {
                    },
                    onGenerationSucceeded: (returnObj) => {
                        resolve(returnObj.modelValue.output)
                    },
                })
                generator.client.input = generatorInput
                generator.generate()
            })

            const generatorResult = await getGeneratorResult
            console.log("[#] generatorResult: ", generatorResult)

            // 결과가 배열인지 확인
            runner.expect(Array.isArray(generatorResult)).toBeTruthy()
            
            // aggregateDrafts와 일치하는 개수의 assignment가 있는지 확인
            const expectedAggregateNames = assignPreviewFieldsToAggregateDraftInput.aggregateDrafts.map(a => a.name)
            runner.expect(generatorResult.length).toBe(expectedAggregateNames.length)

            // 각 assignment 검증
            for(const assignment of generatorResult) {
                // aggregateName이 존재하고 유효한지 확인
                runner.expect(assignment.aggregateName).toBeTruthy()
                runner.expect(assignment.aggregateName).toBeOneOf(expectedAggregateNames)

                // previewFields가 배열이고 최소 1개 이상의 필드가 있는지 확인
                runner.expect(Array.isArray(assignment.previewFields)).toBeTruthy()
                runner.expect(assignment.previewFields.length).toBeGreaterOrEqualThan(1)

                // 각 필드 검증
                for(const field of assignment.previewFields) {
                    // fieldName이 존재하고 유효한 형식인지 확인
                    runner.expect(field.fieldName).toBeTruthy()
                    runner.expect(typeof field.fieldName).toBe('string')
                    
                    // fieldName이 올바른 형식인지 확인 (영문자, 숫자, 언더스코어만 허용)
                    const isValidFieldName = /^[a-zA-Z0-9_]+$/.test(field.fieldName)
                    if(!isValidFieldName) {
                        throw new Error(`Field name "${field.fieldName}" contains invalid characters`)
                    }

                    // refs가 배열인지 확인
                    runner.expect(Array.isArray(field.refs)).toBeTruthy()
                    runner.expect(field.refs.length).toBeGreaterOrEqualThan(1)

                    // refs의 구조 검증 (각 ref는 [[start, end], ...] 형식)
                    for(const ref of field.refs) {
                        runner.expect(Array.isArray(ref)).toBeTruthy()
                        runner.expect(ref.length).toBe(2)
                        
                        for(const item of ref) {
                            runner.expect(Array.isArray(item)).toBeTruthy()
                            runner.expect(item.length).toBe(2)
                            runner.expect(typeof item[0]).toBe('number')
                            runner.expect(typeof item[1]).toBe('number')
                        }
                    }
                }
            }
        });
    });
}