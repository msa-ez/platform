const TextChunker = require("../../../../../../../TextChunker")
const { textChunkerInput } = require("./mocks");

export default function testTextChunker(commandArgs, client, runner) {
    runner.describe('TextChunker', ({ it }) => {
        it('주어진 텍스트 입력에 대해서 적절한 청크 배열이 생성되어야 함', async () => {
            const textChunker = new TextChunker({
                chunkSize: 25000,
                spareSize: 2000
            });
            const chunks = textChunker.splitIntoChunksByLine(textChunkerInput.usedUserStory)
            console.log("[#] TextChunker 출력 청크: ", chunks)
            
            runner.expect(chunks).toBeTruthy()
            runner.expect(chunks.length).toBe(2)

            runner.expect(chunks[0].text).toEqual(textChunkerInput.expectedChunks[0].text)
            runner.expect(chunks[0].startLine).toBe(textChunkerInput.expectedChunks[0].startLine)
            
            runner.expect(chunks[1].text).toEqual(textChunkerInput.expectedChunks[1].text)
            runner.expect(chunks[1].startLine).toBe(textChunkerInput.expectedChunks[1].startLine)

        });
    });
}