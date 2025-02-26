export const mockedProgressDto = {
    generateDone: false,
    displayMessage: "Mock Message",
    thinkMessage: "Mock Think Message\n",
    progress: 50,
    actions: {
        stopGeneration: () => {
            alert("stopGeneration 호출")
        }
    }
}

export const mockedProgressDtoUpdateCallback = (mockedProgressDto) => {
    setInterval(() => {
        mockedProgressDto.displayMessage = "Mock Message: " + "#".repeat(Math.floor(Math.random() * 100))
        mockedProgressDto.thinkMessage += "Mock Think Message: " + new Date().toLocaleTimeString() + " - " + "#".repeat(Math.floor(Math.random() * 100)) + "\n"
    }, 250)
}
