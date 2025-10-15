import runXmlUtil from "./XmlUtil/runXmlUtil"
import runFirebaseUtil from "./FirebaseUtil/runFirebaseUtil"
import runLitellmProxyUtil from "./LitellmProxyUtil/runLitellmProxyUtil"

export const runUtilCommandRegistry = {
    XmlUtil: {
        handler: runXmlUtil,
        description: "XmlUtil 실행",
        usage: "run runUtil XmlUtil"
    },
    FirebaseUtil: {
        handler: runFirebaseUtil,
        description: "FirebaseUtil 실행",
        usage: "run runUtil FirebaseUtil"
    },
    LitellmProxyUtil: {
        handler: runLitellmProxyUtil,
        description: "LitellmProxyUtil 실행",
        usage: "run runUtil LitellmProxyUtil"
    }
}

export const runUtil = async function (commandArgs, client) {
    const utilName = commandArgs[0]
    const command = runUtilCommandRegistry[utilName]
    if(!command) {
        alert(`유효하지 않은 Util 이름입니다. ${utilName}`)
        return false
    }
    return await command.handler(commandArgs, client)
}