import { MockedCanvasExpolorer, getDelayedMockedDatas } from "../../mocks"
import { TraceInfoController } from "../../../../modeling/generators/features/EventStormingModelCanvas"

export default async function getOriginalTraceInfo(commandArgs, client) {
    const mockedCavnasValueForRun = await getDelayedMockedDatas("run")

    const componentType = commandArgs[0]
    if(!componentType) {
        alert("Component type is required")
        return
    }

    const componentTypeToRealType = {
        "command": "org.uengine.modeling.model.Command",
        "readModel": "org.uengine.modeling.model.View",
        "event": "org.uengine.modeling.model.Event"
    }
    if(!componentTypeToRealType[componentType]) {
        alert(`Invalid component type: ${componentType}`)
        return
    }
    
    let testElementValue = null
    for(const elementValue of Object.values(mockedCavnasValueForRun.elements)) {
        if(elementValue._type === componentTypeToRealType[componentType]) {
            testElementValue = elementValue
            break
        }
    }
    if(!testElementValue) {
        alert(`Element value not found: ${componentType}`)
        return
    }

    const controller = new TraceInfoController(
        testElementValue, null, new MockedCanvasExpolorer(mockedCavnasValueForRun), null
    )
    const originalRefs = controller.getOriginalRefs()
    console.log(`originalRefs for ${componentType}: `, originalRefs)
}

