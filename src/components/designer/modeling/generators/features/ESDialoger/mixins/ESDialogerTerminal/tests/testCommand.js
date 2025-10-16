const { TestRunner } = require("../../../../../utils");
import { testUtil } from "./util/testUtil";
import { testGenerator } from "./generator/testGenerator";

export const testCommandRegistry = {
    all: {
        handler: null,
        description: "모든 테스트 실행",
        usage: "test all"
    }
}

export const testCommand = async function (suiteName, commandArgs, client) {
    const runner = new TestRunner();

    testUtil(commandArgs, client, runner);
    testGenerator(commandArgs, client, runner);

    if(suiteName === "all") {
        runner.runTests();
    } else {
        runner.runTests(suiteName);
    }
}