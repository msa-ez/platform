const { TestRunner } = require("../../../modeling/generators/utils");
const testTraceInfoController = require("./traceInfo/testTraceInfoController").default;


export const testCommandRegistry = {
    all: {
        handler: null,
        description: "모든 테스트 실행",
        usage: "test all"
    },
    traceInfoController: {
        handler: testTraceInfoController,
        description: "TraceInfoController 테스트",
        usage: "test TraceInfoController"
    },
}

export const testCommand = async function (suiteName, commandArgs, client) {
    const runner = new TestRunner();

    testTraceInfoController(commandArgs, client, runner);

    if(suiteName === "all") {
        runner.runTests();
    } else {
        runner.runTests(suiteName);
    }
}