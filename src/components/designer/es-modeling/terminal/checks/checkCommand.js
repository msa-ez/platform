import checkEsGeneratorLogs from "./checkEsGeneratorLogs"

export const checkCommandRegistry = {
    checkEsGeneratorLogs: {
        handler: checkEsGeneratorLogs,
        description: "ESGenerator에서 생성된 에러 로그 여부 확인",
        usage: "check checkEsGeneratorLogs"
    }
}

export const checkCommand = async function (commandName, commandArgs, client) {
    const command = checkCommandRegistry[commandName]
    if(!command) {
        alert(`유효하지 않은 콘솔 명령어입니다. ${commandName}`)
        return false
    }
    return await command.handler(commandArgs, client)
}