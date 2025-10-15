const { LitellmProxyUtil } = require("../../../../../../../utils")

export default async function runLitellmProxyUtil(commandArgs, client) {
    const url = await LitellmProxyUtil.getChatCompletionsURL()
    console.log(`LitellmProxyUtil Chat Completions URL: `, url)
}