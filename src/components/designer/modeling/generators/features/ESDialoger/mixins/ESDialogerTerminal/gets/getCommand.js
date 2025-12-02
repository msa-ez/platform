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
                selectedAspect: client.selectedAspect,
                boundedContextVersion: client.boundedContextVersion,
                resultDevideBoundedContext: client.resultDevideBoundedContext,
                projectInfo: client.projectInfo,
                state: client.state,
                messages: client.messages,
                workingMessages: client.workingMessages,
                frontEndResults: client.frontEndResults,
                boundedContexts: client.boundedContexts,
                pbcResults: client.pbcResults,
                pbcLists: client.pbcLists,
                requirementsValidationResult: client.requirementsValidationResult,
                commandReadModelData: client.commandReadModelData,
                siteMap: client.siteMap
            }
            console.log(`[#] 상태 >`)
            console.log(status)
            return status
        },
        description: "현재 ESDialoger의 주요 상태 변수들 출력",
        usage: "get status"
    },
    config: {
        handler: (commandArgs, client) => {
            const configInfos = {
                isUseTerminal: {
                    value: localStorage.getItem("isUseTerminal") || "false",
                    description: "MSEAZ에서 Alt+T를 통한 콘솔 명령어 기능 사용 여부",
                },
                job_namespace_suffix: {
                    value: localStorage.getItem("job_namespace_suffix") || "",
                    description: "요청되는 Job에 suffix를 붙여서 고유한 테스트 환경을 만듬",
                },
                is_block_job_removing: {
                    value: localStorage.getItem("is_block_job_removing") || "false",
                    description: "Job 삭제 기능 블로킹 여부",
                },
                useCache: {
                    value: localStorage.getItem("useCache") || "false",
                    description: "AI 응답시 캐시 저장 및 사용 여부",
                },
                log_level: {
                    value: localStorage.getItem("log_level") || "DEBUG",
                    description: "로그 레벨 설정",
                }
            }

            console.log(`# 키 이름 / 값 / 설명`)
            console.log(`--------------------------------`)
            for(const key in configInfos) {
                console.log(`   - ${key} / ${configInfos[key].value} / ${configInfos[key].description}`)
            }
            console.log(`--------------------------------`)
            return configInfos
        },
        description: "MSAEZ에서 전역적으로 사용되는 로컬 스톨리지 설정 값 출력",
        usage: "get config"
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