import RunUtils from "../runUtils"

export default async function requestRunFromSenario(commandArgs, client) {
    const requestType = commandArgs[0]
    const senarioName = commandArgs[1]

    const selectedScenario = await RunUtils.initValueWithSelectedScenario(senarioName, client)
    switch(requestType) {
        case "siteMapGenerate":
            client.commandReadModelData = null
            client.generateSiteMap()
            break
        case "aggregateDraftGenerate":
            client.generateAggregateDrafts(selectedScenario.selectedStructureOption)
            break
        case "eventStormingGenerate":
            client.generateFromAggregateDrafts(selectedScenario.draftOptions)
            break
        default:
            alert("유효하지 않은 요청 타입입니다.")
            throw new Error("유효하지 않은 요청 타입입니다.")
    }
}