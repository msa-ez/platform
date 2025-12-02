import { mockedTraceInfoViewerDto } from "./mocks"

export default async function showTraceInfoViwerUI(commandArgs, client) {
    client.traceInfoViewerDto = structuredClone(mockedTraceInfoViewerDto)
}

