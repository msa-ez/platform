import RunUtils from "../runUtils"

export default async function requestEventStormingGenerate(commandArgs, client) {
    const senarioName = commandArgs[0]
    const selectedScenario = RunUtils.initValueWithSelectedScenario(senarioName, client)
    client.generateFromAggregateDrafts(selectedScenario.draftOptions)
}