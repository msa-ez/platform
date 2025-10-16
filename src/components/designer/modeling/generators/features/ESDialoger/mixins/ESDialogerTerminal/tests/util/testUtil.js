import testFirebaseUtil from "./FirebaseUtil/testFirebaseUtil"
import testLitellmProxyUtil from "./LitellmProxyUtil/testLitellmProxyUtil"
import testXmlUtil from "./XmlUtil/testXmlUtil"

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
    }
}

export const testUtil = function (commandArgs, client, runner) {
    testFirebaseUtil(commandArgs, client, runner)
    testLitellmProxyUtil(commandArgs, client, runner)
    testXmlUtil(commandArgs, client, runner)
}