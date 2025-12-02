import runXmlUtil from "./XmlUtil/runXmlUtil"
import runFirebaseUtil from "./FirebaseUtil/runFirebaseUtil"
import runLitellmProxyUtil from "./LitellmProxyUtil/runLitellmProxyUtil"
import runAICacheUtil from "./AICacheUtil/runAICacheUtil"
import runTextChunker from "./TextChunker/runTextChunker"
import runChunkIterator from "./ChunkIterator/runChunkIterator"
import runESDialogerTraceUtil from "./ESDialogerTraceUtil/runESDialogerTraceUtil"
import runLoggingUtil from "./runLoggingUtil"

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
    },
    TextChunker: {
        handler: runTextChunker,
        description: "TextChunker 실행",
        usage: "run runUtil TextChunker <splitIntoChunksByLine>"
    },
    ChunkIterator: {
        handler: runChunkIterator,
        description: "ChunkIterator 실행",
        usage: "run runUtil ChunkIterator"
    },
    ESDialogerTraceUtil: {
        handler: runESDialogerTraceUtil,
        description: "ESDialogerTraceUtil 실행",
        usage: "run runUtil ESDialogerTraceUtil"
    },
    LoggingUtil: {
        handler: runLoggingUtil,
        description: "LoggingUtil 실행",
        usage: "run runUtil LoggingUtil"
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