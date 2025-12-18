import { getDelayedMockedDatas } from "../../mocks"

export default async function createEventStormingFromDraftOptions(commandArgs, client) {
    const mockedDraftOptions = await getDelayedMockedDatas("draftOptions")

    // 항상 새로운 캔버스에서 요청
    client.value.elements = {}
    client.value.relations = {}
    client.value.k8sValue = {}
    client.forceRefreshCanvas()

    client.generateAggregatesFromDraft(mockedDraftOptions)
}

