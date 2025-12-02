import testFirebaseUtil from "./FirebaseUtil/testFirebaseUtil"
import testLitellmProxyUtil from "./LitellmProxyUtil/testLitellmProxyUtil"
import testXmlUtil from "./XmlUtil/testXmlUtil"
import testTextChunker from "./TextChunker/testTextChunker"
import testChunkIterator from "./ChunkIterator/testChunkIterator"

export const testUtilCommandRegistry = {
    FirebaseUtil: {
        handler: null,
        description: "FirebaseUtil 테스트",
        usage: "test FirebaseUtil"
    },
    LitellmProxyUtil: {
        handler: null,
        description: "LitellmProxyUtil 테스트",
        usage: "test LitellmProxyUtil"
    },
    XmlUtil: {
        handler: null,
        description: "XmlUtil 테스트",
        usage: "test XmlUtil"
    },
    TextChunker: {
        handler: null,
        description: "TextChunker 테스트",
        usage: "test TextChunker"
    },
    ChunkIterator: {
        handler: null,
        description: "ChunkIterator 테스트",
        usage: "test ChunkIterator"
    }
}

export const testUtil = function (commandArgs, client, runner) {
    testFirebaseUtil(commandArgs, client, runner)
    testLitellmProxyUtil(commandArgs, client, runner)
    testXmlUtil(commandArgs, client, runner)
    testTextChunker(commandArgs, client, runner)
    testChunkIterator(commandArgs, client, runner)
}