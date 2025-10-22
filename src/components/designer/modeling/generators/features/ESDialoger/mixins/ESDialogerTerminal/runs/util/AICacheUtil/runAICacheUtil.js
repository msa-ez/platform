const { AICacheUtil } = require("../../../../../../AIGenerator/utils")

export default async function runAICacheUtil(commandArgs, client) {
    const requestFuncName = commandArgs[1]
    if(!requestFuncName) {
        alert("requestFunc is required")
        return false
    }
    
    const requestFuncLogics = {
        set: async (requestMessage="testMessage", value="testValue", tag="testTag") => {
            await AICacheUtil.set(requestMessage, value, tag)
        },
        get: async (requestMessage="testMessage") => {
            const value = await AICacheUtil.get(requestMessage)
            console.log("saved value: ", value)
        },
        clearAll: async () => {
            await AICacheUtil.clearAll()
        },
        clearByTag: async (tag="testTag") => {
            await AICacheUtil.clearByTag(tag)
        }
    }

    if(!requestFuncLogics[requestFuncName]) {
        alert(`requestFunc ${requestFuncName} is not found`)
        return false
    }
    await requestFuncLogics[requestFuncName](...commandArgs.slice(2))
}