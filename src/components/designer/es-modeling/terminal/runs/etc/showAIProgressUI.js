import { mockedProgressDto } from "./mocks"

export default async function showAIProgressUI(commandArgs, client) {
    const mockedProgressDtoUpdateCallback = (mockedProgressDto) => {
        setInterval(() => {
            mockedProgressDto.displayMessage = "Mock Message: " + "#".repeat(Math.floor((crypto.getRandomValues(new Uint32Array(1))[0]/4294967296) * 100))
            mockedProgressDto.thinkMessage += "Mock Think Message: " + new Date().toLocaleTimeString() + " - " + "#".repeat(Math.floor((crypto.getRandomValues(new Uint32Array(1))[0]/4294967296) * 100)) + "\n"
        }, 250)
    }

    client.generatorProgressDto = mockedProgressDto
    mockedProgressDtoUpdateCallback(client.generatorProgressDto)
}

