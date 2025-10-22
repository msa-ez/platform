const TextChunker = require("../../../../../../../TextChunker")
const { textChunkerInput } = require("./mocks");

export default async function runTextChunker(commandArgs, client) {
    const utilInputs = structuredClone(textChunkerInput)
    const requestFuncName = commandArgs[1]
    if(!requestFuncName) {
        alert("requestFunc is required")
        return false
    }

    const requestFuncLogics = {
        splitIntoChunksByLine: (usedUserStory) => {
            console.log("입력 텍스트: ", usedUserStory)

            const textChunker = new TextChunker({
                chunkSize: 25000,
                spareSize: 2000
            });
            const chunks = textChunker.splitIntoChunksByLine(usedUserStory)
        
            console.log("출력 청크: ", chunks)
        }
    }

    if(!requestFuncLogics[requestFuncName]) {
        alert(`requestFunc ${requestFuncName} is not found`)
        return false
    }
    requestFuncLogics[requestFuncName](utilInputs.usedUserStory)
}