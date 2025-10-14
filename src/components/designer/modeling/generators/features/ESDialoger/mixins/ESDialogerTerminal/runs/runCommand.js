import requestEventStormingGenerate from "./etc/requestEventStormingGenerate"
import requestAggregateDraftGenerate from "./etc/requestAggregateDraftGenerate"
import showScenarioMessages from "./etc/showScenarioMessages"
import showMermaidTestUIMessage from "./etc/showMermaidTestUIMessage"
import { runGenerator } from "./generator/runGenerator"
import { runUtil } from "./util/runUtil"

export const runCommandRegistry = {
    requestEventStormingGenerate: {
        handler: requestEventStormingGenerate,
        description: "특정 시나리오를 기반으로 이벤트 스토밍 생성",
        usage: "run requestEventStormingGenerate (<시나리오 이름>)"
    },
    requestAggregateDraftGenerate: {
        handler: requestAggregateDraftGenerate,
        description: "특정 시나리오를 기반으로 애그리거트 초안 생성",
        usage: "run requestAggregateDraftGenerate (<시나리오 이름>)"
    },
    showScenarioMessages: {
        handler: showScenarioMessages,
        description: "특정 시나리오에 해당하는 Mock된 메세지들을 표시",
        usage: "run showScenarioMessages (<시나리오 이름>)"
    },
    showMermaidTestUIMessage: {
        handler: showMermaidTestUIMessage,
        description: "Mermaid 문자열들을 테스트하기 위한 메세지 표시",
        usage: "run showMermaidTestUIMessage"
    },
    runGenerator: {
        handler: runGenerator,
        description: "특정 Generator를 즉시 실행",
        usage: "run runGenerator <Generator 이름>"
    },
    runUtil: {
        handler: runUtil,
        description: "특정 Util를 즉시 실행",
        usage: "run runUtil <Util 이름>"
    }
}

export const runCommand = async function (commandName, commandArgs, client) {
    const command = runCommandRegistry[commandName]
    if(!command) {
        alert(`유효하지 않은 콘솔 명령어입니다. ${commandName}`)
        return false
    }
    return await command.handler(commandArgs, client)
}