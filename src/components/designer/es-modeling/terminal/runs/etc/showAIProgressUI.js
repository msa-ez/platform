import { mockedProgressDto } from "./mocks"

export default async function showAIProgressUI(commandArgs, client) {
    const mockedProgressDtoUpdateCallback = (mockedProgressDto) => {
        setInterval(() => {
            mockedProgressDto.displayMessage = "Mock Message: " + "#".repeat(Math.floor(Math.random() * 100))
            mockedProgressDto.thinkMessage += "Mock Think Message: " + new Date().toLocaleTimeString() + " - " + "#".repeat(Math.floor(Math.random() * 100)) + "\n"
        }, 250)
    }

    client.generatorProgressDto = mockedProgressDto
    mockedProgressDtoUpdateCallback(client.generatorProgressDto)
}

