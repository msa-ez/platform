const { TestRunner } = require("../../../../../utils");
import { testGenerator } from "./generator/testGenerator";
import { testUtil } from "./util/testUtil";

export const testCommandRegistry = {
    all: {
        handler: null,
        description: "모든 테스트 실행",
        usage: "test all"
    }
}

export const testCommand = function (suiteName, commandArgs, client) {
    const runner = new TestRunner();

    testGenerator(commandArgs, client, runner);
    testUtil(commandArgs, client, runner);

    if(suiteName === "all") {
        runner.runTests();
    } else {
        runner.runTests(suiteName);
    }
}