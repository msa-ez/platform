const { AICacheUtil } = require("../../../../../../AIGenerator/utils")

export default async function runAICacheUtil(commandArgs, client) {
    const requestFuncName = commandArgs[1]

    if(!requestFuncName) {
        alert("requestFunc is required")
        return false
    }

    if(requestFuncName === 'set') {
        AICacheUtil.set("testMessage", "testValue", "testTag")
    }
    else if(requestFuncName === 'get') {
        const value = await AICacheUtil.get("testMessage")
        console.log("saved value: ", value)
    }
    else if(requestFuncName === 'clearAll') {
        await AICacheUtil.clearAll()
    }
    else if(requestFuncName === 'clearByTag') {
        await AICacheUtil.clearByTag("testTag")
    }
}