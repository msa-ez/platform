export default async function checkEsGeneratorLogs(commandArgs, client) {
    if(!client.value.langgraphStudioInfos || !client.value.langgraphStudioInfos.esGenerator || !client.value.langgraphStudioInfos.esGenerator.logs) {
        alert("로그 데이터가 없음")
        return
    }

    const logs = client.value.langgraphStudioInfos.esGenerator.logs
    const infoLogs = {
        type: "info",
        logs: logs.filter(log => log.level === "info")
    }
    const warningLogs = {
        type: "warning",
        logs: logs.filter(log => log.level === "warning")
    }
    const errorLogs = {
        type: "error",
        logs: logs.filter(log => log.level === "error")
    }

    for(const splitLogs of [infoLogs, warningLogs, errorLogs]) {
        console.log(`[#] ${splitLogs.type} - (${splitLogs.logs.length}개) >`)
        console.log(splitLogs)
    }

    if(errorLogs.logs.length > 0) {
        alert("[!] 에러 로그를 발견했습니다! 개발자 콘솔에서 확인해주세요.")
        return false
    }
    else {
        alert("[*] 에러 로그를 발견하지 못했습니다.")
    }
}

