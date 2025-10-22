const TextChunker = require("../../../../../../../TextChunker")
const { ChunkIterator } = require("../../../../../../../iterators")
const { chunkIteratorInput } = require("./mocks");

export default async function runChunkIterator(commandArgs, client) {
    const utilInputs = structuredClone(chunkIteratorInput)

    const textChunker = new TextChunker({
        chunkSize: 25000,
        spareSize: 2000
    });
    const chunkIterator = new ChunkIterator(textChunker, utilInputs.usedUserStory)

    console.log("총 청크 수: ", chunkIterator.getTotalChunks())
    while(chunkIterator.moveToNextChunk()) {
        console.log("청크 인덱스: ", chunkIterator.getCurrentChunkIndex())
        console.log("청크 텍스트: ", chunkIterator.getCurrentChunkText())
        console.log("청크 시작 라인: ", chunkIterator.getCurrentChunkStartLine())
    }
}