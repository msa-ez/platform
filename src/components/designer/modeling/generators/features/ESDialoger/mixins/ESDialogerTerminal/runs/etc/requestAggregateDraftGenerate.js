import RunUtils from "../runUtils"

export default async function requestAggregateDraftGenerate(commandArgs, client) {
    const senarioName = commandArgs[0]
    const selectedScenario = RunUtils.initValueWithSelectedScenario(senarioName, client)
    client.generateAggregateDrafts(selectedScenario.selectedStructureOption)
}