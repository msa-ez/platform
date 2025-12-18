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
    },
    status: {
        handler: (commandArgs, client) => {
            const status = {
                value: client.value,
                langgraphStudioInfos: client.value.langgraphStudioInfos,
                generatorProgressDto: client.generatorProgressDto
            }
            console.log(`[#] 상태 >`)
            console.log(status)
            return status
        },
        description: "현재 ESTerminal의 주요 상태 변수들 출력",
        usage: "get status"
    },
    esValue: {
        handler: (commandArgs, client) => {
            const esValue = {
                elements: client.value.elements,
                relations: client.value.relations,
                k8sValue: client.value.k8sValue,
                langgraphStudioInfos: client.value.langgraphStudioInfos
            }
            console.log(`[#] ESValue >`)
            console.log(esValue)
            return esValue
        },
        description: "ESValue 출력",
        usage: "get esValue"
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