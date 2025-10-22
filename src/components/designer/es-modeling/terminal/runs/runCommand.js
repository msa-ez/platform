import showAIProgressUI from "./etc/showAIProgressUI"
import showTraceInfoViwerUI from "./etc/showTraceInfoViwerUI"
import makeUIRunTimeTemplateHtml from "./etc/makeUIRunTimeTemplateHtml"
import getOriginalTraceInfo from "./traceInfo/getOriginalTraceInfo"

export const runCommandRegistry = {
    showAIProgressUI: {
        handler: showAIProgressUI,
        description: "AI 생성 진행상황을 표시하는 UI를 Mocked된 데이터로 표시",
        usage: "run showAIProgressUI"
    },
    showTraceInfoViwerUI: {
        handler: showTraceInfoViwerUI,
        description: "TraceInfoViewer UI를 Mocked된 데이터로 표시",
        usage: "run showTraceInfoViwerUI"
    },
    makeUIRunTimeTemplateHtml: {
        handler: makeUIRunTimeTemplateHtml,
        description: "UI의 runTimeTemplateHtml을 생성",
        usage: "run makeUIRunTimeTemplateHtml"
    },
    getOriginalTraceInfo: {
        handler: getOriginalTraceInfo,
        description: "특정 타입 요소의 원본 TraceInfo를 출력",
        usage: "run getOriginalTraceInfo <command|readModel|event>"
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