export const getCommandRegistry = {
    direct: {
        handler: (commandArgs, client) => {
            const valueName = commandArgs[0]
            const value = client[valueName]

            console.log(`[#] '${valueName}' 값 >`)
            console.log(value)
            return value
        },
        description: "특정 값을 콘솔에 출력",
        usage: "get direct <값 이름>"
    }
}

export const getCommand = async function (commandName, commandArgs, client) {
    const command = getCommandRegistry[commandName]
    if(!command) {
        alert(`유효하지 않은 콘솔 명령어입니다. ${commandName}`)
        return false
    }
    return await command.handler(commandArgs, client)
}