import { MockedCanvasExpolorer, getDelayedMockedDatas } from "../../mocks"
import { TraceInfoController } from "../../../../modeling/generators/features/EventStormingModelCanvas"
import { traceInfoControllerTestSets } from "./traceInfoControllerTestSets"

export default function testTraceInfoController(commandArgs, client, runner) {
    runner.describe('TraceInfoController', ({ it }) => {
        it('각각의 특정 타입을 가진 엘리먼트들에 대해서 적절한 추적성 정보가 확보되어야 함', async () => {
            const mockedCavnasValueForTest = await getDelayedMockedDatas("test")
            
            for(const testSet of traceInfoControllerTestSets) {
                console.log(`[#] ${testSet.type} 타입 요소에 대한 추적성 정보 테스트 시작...`)
                let testElementValue = null
                for(const elementValue of Object.values(mockedCavnasValueForTest.elements)) {
                    if(elementValue._type === testSet.type) {
                        testElementValue = elementValue
                        break
                    }
                }
                if(!testElementValue) {
                    throw new Error(`Element value not found: ${testSet.type}`)
                }
            
                const controller = new TraceInfoController(
                    testElementValue, null, new MockedCanvasExpolorer(mockedCavnasValueForTest), null
                )
                const originalRefs = controller.getOriginalRefs()
                runner.expect(originalRefs).toEqual(testSet.expectedRefs)
            }
        });
    });
}
