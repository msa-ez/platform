const { AICacheUtil } = require("../../../../AIGenerator/utils")

export const utilCommandRegistry = {
    clearAICache: {
        handler: async (commandArgs, client) => {
            await AICacheUtil.clearAll()
            alert("AICache 모두 삭제 완료")
        },
        description: "AICache 모두 삭제",
        usage: "util clearAICache"
    },
    clearAICacheByTag: {
        handler: async (commandArgs, client) => {
            const tag = commandArgs[0]
            if(!tag) {
                alert("태그 이름이 필요합니다")
                return false
            }
            
            await AICacheUtil.clearByTag(tag)
            alert(`AICache ${tag} 태그에 해당하는 모든 캐시 삭제 완료`)
        },
        description: "AICache 특정 태그 삭제",
        usage: "util clearAICacheByTag <태그 이름>"
    }
}

export const utilCommand = async function (commandName, commandArgs, client) {
    const command = utilCommandRegistry[commandName]
    if(!command) {
        alert(`유효하지 않은 콘솔 명령어입니다. ${commandName}`)
        return false
    }
    return await command.handler(commandArgs, client)
}