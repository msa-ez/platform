import { mockedUIComponent } from "./mocks"

export default async function makeUIRunTimeTemplateHtml(commandArgs, client) {
    const uiComponent = structuredClone(mockedUIComponent)

    const runTimeTemplateHtml = prompt("삽입시킬 runTimeTemplateHtml을 입력하세요")
    if(runTimeTemplateHtml)
        uiComponent.runTimeTemplateHtml = runTimeTemplateHtml

    client.value.elements = {
        [uiComponent.id]: uiComponent
    }
    client.value.relations = {}
    client.forceRefreshCanvas()
}

