export const setCommandRegistry = {
    value: {
        handler: (commandArgs, client) => {
            const inject_value = prompt("삽입시킬 value 값을 Json 형식으로 입력: ")
            if(!inject_value) return

            const inject_value_keys = Object.keys(JSON.parse(inject_value))
            for(const key of inject_value_keys) {
                client.value[key] = JSON.parse(inject_value)[key]
            }

            client._initializeTraceInfoViewerDto()
            client.forceRefreshCanvas()
        },
        description: "value의 일부 키 값을 전달된 Json 객체의 키 값으로 세팅",
        usage: "set value"
    }
}

export const setCommand = async function (commandName, commandArgs, client) {
    const command = setCommandRegistry[commandName]
    if(!command) {
        alert(`유효하지 않은 콘솔 명령어입니다. ${commandName}`)
        return false
    }
    return await command.handler(commandArgs, client)
}