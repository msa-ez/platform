export const getDelayedMockedDatas = async (type) => {
    switch(type) {
        case "run":
            return (await import("./mockedCavnasValueForRun")).mockedCavnasValueForRun
        case "test":
            return (await import("./mockedCavnasValueForTest")).mockedCavnasValueForTest
        case "draftOptions":
            return (await import("./mockedDraftOptions")).mockedDraftOptions
        case "esProxyNewJobParamsForRun":
            return (await import("./mockedEsProxyNewJobParamsForRun")).mockedEsProxyNewJobParamsForRun
        case "esProxyNewJobParamsForTest":
            return (await import("./mockedEsProxyNewJobParamsForTest")).mockedEsProxyNewJobParamsForTest
        default:
            throw new Error(`Invalid type: ${type}`)
    }
}

export const MockedCanvasExpolorer = require("./MockedCanvasExpolorer").default;