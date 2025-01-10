const RequirementsSummarizer = require("./RequirementsSummarizer");
const TextChunker = require("./TextChunker");

class RecursiveRequirementsSummarizer {
    constructor(options = {}) {
        this.maxTokenSize = options.maxTokenSize || 6000;
        this.textChunker = new TextChunker({
            chunkSize: this.maxTokenSize,
            overlapSize: 200
        });
        this.maxIterations = options.maxIterations || 3;
    }

    /**
     * 요구사항을 토큰 제한 이내로 요약
     * @param {Object} client - Generator 클라이언트
     * @param {string} text - 요약할 텍스트
     * @returns {Promise<string>} 요약된 텍스트
     */
    async summarize(client, text) {
        let currentText = text;
        let iterations = 0;
        let generator = new RequirementsSummarizer(client);

        console.log(`Initial text length: ${currentText.length}`);

        while (currentText.length > this.textChunker.chunkSize && iterations < this.maxIterations) {
            iterations++;
            console.log(`Iteration ${iterations} - Current length: ${currentText.length}`);

            // 텍스트가 너무 길면 청크로 분할
            if (currentText.length > this.textChunker.chunkSize) {
                const chunks = this.textChunker.splitIntoChunks(currentText);
                const summarizedChunks = [];

                // 각 청크 요약
                for (const chunk of chunks) {
                    client.input = {
                        requirements: {
                            userStory: chunk,
                            currentChunk: chunks.indexOf(chunk) + 1,
                            totalChunks: chunks.length,
                            isFinalSummary: false
                        }
                    };

                    const result = await this.summarizeChunk(generator);
                    summarizedChunks.push(result);
                }

                // 모든 청크의 요약본을 합치기
                currentText = summarizedChunks.join('\n\n');
            }

            // 최종 요약이 필요한 경우
            if (currentText.length > this.textChunker.chunkSize) {
                client.input = {
                    requirements: {
                        userStory: currentText,
                        isFinalSummary: true
                    }
                };
                currentText = await this.summarizeChunk(generator);
            }
        }

        console.log(`Final text length: ${currentText.length}`);
        return currentText;
    }

    /**
     * 개별 청크 요약
     * @param {RequirementsSummarizer} generator
     * @returns {Promise<string>}
     */
    async summarizeChunk(generator) {
        await generator.generate();
        const result = await new Promise(resolve => {
            generator.client.onReceived = (content) => {
                try {
                    const parsed = JSON.parse(content);
                    resolve(parsed.summarizedRequirements);
                } catch (e) {
                    console.error('Error parsing summary result:', e);
                    resolve(content);
                }
            };
        });
        return result;
    }
}

module.exports = RecursiveRequirementsSummarizer;