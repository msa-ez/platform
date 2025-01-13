const RequirementsSummarizer = require("./RequirementsSummarizer");
const TextChunker = require("./TextChunker");

class RecursiveRequirementsSummarizer extends RequirementsSummarizer {
    constructor(client) {
        super(client);
        this.textChunker = new TextChunker({
            chunkSize: 5000,
            spareSize: 1000
        });
        this.maxIterations = 3;
        
        // 상태 관리 추가
        this.currentChunks = [];
        this.summarizedChunks = [];
        this.currentChunkIndex = 0;
        this.resolveCurrentProcess = null;
        this.iterations = 0;
    }

    async summarizeRecursively(text) {
        let currentText = text;
        this.iterations = 0;
        
        console.log(`Before summarize: ${currentText.length}`);

        while (currentText.length > this.textChunker.chunkSize && this.iterations < this.maxIterations) {
            this.iterations++;
            
            // 청크 준비
            this.currentChunks = this.textChunker.splitIntoChunks(currentText);
            this.summarizedChunks = [];
            this.currentChunkIndex = 0;

            // 첫 번째 청크 처리 시작
            currentText = await this.processChunks();
        }

        // 최종 텍스트가 청크 크기보다 작으면 한 번의 요약만 수행
        if (currentText.length <= this.textChunker.chunkSize) {
            this.client.input = {
                requirements: {
                    userStory: currentText,
                    isFinalSummary: true
                }
            };
            currentText = await new Promise(resolve => {
                this.resolveCurrentProcess = resolve;
                this.generate();
            });
        }

        return currentText;
    }

    async processChunks() {
        return new Promise(resolve => {
            this.resolveCurrentProcess = resolve;
            this.processNextChunk();
        });
    }

    processNextChunk() {
        if (this.currentChunkIndex < this.currentChunks.length) {
            // 다음 청크 처리
            this.client.input = {
                requirements: {
                    userStory: this.currentChunks[this.currentChunkIndex],
                    currentChunk: this.currentChunkIndex + 1,
                    totalChunks: this.currentChunks.length,
                    isFinalSummary: false
                }
            };
            this.generate();
        } else {
            // 모든 청크 처리 완료, 합치기
            const combinedText = this.summarizedChunks.join('\n\n');
            
            // 합친 텍스트가 여전히 크다면 최종 요약
            if (combinedText.length > this.textChunker.chunkSize) {
                this.client.input = {
                    requirements: {
                        userStory: combinedText,
                        isFinalSummary: true
                    }
                };
                this.generate();
            } else {
                this.resolveCurrentProcess(combinedText);
            }
        }
    }

    handleGenerationFinished(model) {
        try {
            const summarizedText = model.summarizedRequirements;
            
            if (!this.client.input.requirements.isFinalSummary) {
                // 청크 요약 결과 저장 및 다음 청크 처리
                this.summarizedChunks.push(summarizedText);
                this.currentChunkIndex++;
                this.processNextChunk();
            } else {
                // 최종 요약 완료
                if (this.resolveCurrentProcess) {
                    this.resolveCurrentProcess(summarizedText);
                    console.log("After summarize: ", this.summarizedChunks.join().length);
                }
            }
        } catch (e) {
            console.error('Error parsing summary result:', e);
            if (this.resolveCurrentProcess) {
                this.resolveCurrentProcess(model);
            }
        }
    }
}

module.exports = RecursiveRequirementsSummarizer;