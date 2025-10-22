const TextChunker = require("../../../../../../../TextChunker")
const { ChunkIterator } = require("../../../../../../../iterators")
const { chunkIteratorInput } = require("./mocks");

export default function testChunkIterator(commandArgs, client, runner) {
    runner.describe('ChunkIterator', ({ it }) => {
        it('주어진 텍스트 입력에 대해서 적절한 청크 이터레이터가 생성되어야 함', async () => {
            const utilInputs = structuredClone(chunkIteratorInput)

            const textChunker = new TextChunker({
                chunkSize: 25000,
                spareSize: 2000
            });
            const chunkIterator = new ChunkIterator(textChunker, utilInputs.usedUserStory)
        
            runner.expect(chunkIterator.getTotalChunks()).toBe(2)

            runner.expect(chunkIterator.moveToNextChunk()).toBe(true)
            runner.expect(chunkIterator.getCurrentChunkIndex()).toBe(0)
            runner.expect(chunkIterator.getCurrentChunkText()).toBe(utilInputs.expectedChunks[0].text)
            runner.expect(chunkIterator.getCurrentChunkStartLine()).toBe(utilInputs.expectedChunks[0].startLine)

            runner.expect(chunkIterator.moveToNextChunk()).toBe(true)
            runner.expect(chunkIterator.getCurrentChunkIndex()).toBe(1)
            runner.expect(chunkIterator.getCurrentChunkText()).toBe(utilInputs.expectedChunks[1].text)
            runner.expect(chunkIterator.getCurrentChunkStartLine()).toBe(utilInputs.expectedChunks[1].startLine)
        });
    });
}