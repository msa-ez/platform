export const getDelayedMockedDatas = async (type) => {
    switch(type) {
        case "run":
            return (await import("./mockedCavnasValueForRun")).mockedCavnasValueForRun
        case "test":
            return (await import("./mockedCavnasValueForTest")).mockedCavnasValueForTest
        default:
            throw new Error(`Invalid type: ${type}`)
    }
}

export const MockedCanvasExpolorer = require("./MockedCanvasExpolorer").default;