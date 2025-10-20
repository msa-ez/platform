import runXmlUtil from "./XmlUtil/runXmlUtil"
import runFirebaseUtil from "./FirebaseUtil/runFirebaseUtil"
import runLitellmProxyUtil from "./LitellmProxyUtil/runLitellmProxyUtil"
import runAICacheUtil from "./AICacheUtil/runAICacheUtil"

export const runUtilCommandRegistry = {
    FirebaseUtil: {
        handler: runFirebaseUtil,
        description: "FirebaseUtil 실행",
        usage: "run runUtil FirebaseUtil"
    },
    LitellmProxyUtil: {
        handler: runLitellmProxyUtil,
        description: "LitellmProxyUtil 실행",
        usage: "run runUtil LitellmProxyUtil"
    },
    AICacheUtil: {
        handler: runAICacheUtil,
        description: "AICacheUtil 실행",
        usage: "run runUtil AICacheUtil <set|get|clearAll|clearByTag>"
    },
    XmlUtil: {
        handler: runXmlUtil,
        description: "XmlUtil 실행",
        usage: "run runUtil XmlUtil"
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