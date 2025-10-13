import testXmlUtil from "./XmlUtil/testXmlUtil"

export const testUtilCommandRegistry = {
    XmlUtil: {
        handler: null,
        description: "XmlUtil 테스트",
        usage: "test XmlUtil"
    }
}

export const testUtil = function (commandArgs, client, runner) {
    testXmlUtil(commandArgs, client, runner)
}