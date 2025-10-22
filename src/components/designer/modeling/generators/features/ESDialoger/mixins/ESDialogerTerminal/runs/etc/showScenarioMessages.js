import RunUtils from "../runUtils"

export default async function requestAggregateDraftGenerate(commandArgs, client) {
    const senarioName = commandArgs[0]
    const selectedScenario = await RunUtils.initValueWithSelectedScenario(senarioName, client)
    client.messages = selectedScenario.messages
}