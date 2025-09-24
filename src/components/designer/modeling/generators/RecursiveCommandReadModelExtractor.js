const CommandReadModelExtractor = require('./CommandReadModelExtractor');

class RecursiveCommandReadModelExtractor extends CommandReadModelExtractor {
    constructor(client) {
        super(client);
        this.generatorName = 'RecursiveCommandReadModelExtractor';
        
        // 청크 처리 관련 상태
        this.chunkSize = 8000; // 토큰 기준으로 청크 크기 설정
        this.currentChunkIndex = 0;
        this.requirementsChunks = [];
        this.accumulated = {
            boundedContexts: []
        };
        this.isProcessing = false;
    }

    async generateRecursively(requirementsText) {
        try {
            this.requirementsChunks = this.splitRequirementsIntoChunks(requirementsText);
            this.currentChunkIndex = 0;
            this.accumulated = {
                boundedContexts: []
            };
            this.isProcessing = true;

            // 초기 진행률 업데이트 (총 청크 수 설정)
            this.updateProgress();

            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this.processNextChunk();
            });
        } catch (error) {
            console.error('RecursiveCommandReadModelExtractor error:', error);
            return {
                extractedData: { boundedContexts: [] },
                currentGeneratedLength: 0
            };
        }
    }

    splitRequirementsIntoChunks(requirementsText) {
        if (!requirementsText || requirementsText.length <= this.chunkSize) {
            return [requirementsText];
        }

        // 전체 컨텍스트 크기 계산하여 청크 크기 동적 조정
        const totalContextSize = this.calculateTotalContextSize();
        const adjustedChunkSize = Math.max(15000, this.chunkSize - totalContextSize);
        
        console.log(`RecursiveCommandReadModelExtractor - Total context size: ${totalContextSize}, Adjusted chunk size: ${adjustedChunkSize}`);

        const chunks = [];
        let currentChunk = '';
        const sentences = requirementsText.split(/[.!?]\s+/);
        
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= adjustedChunkSize) {
                currentChunk += (currentChunk ? '. ' : '') + sentence;
            } else {
                if (currentChunk) {
                    chunks.push(currentChunk);
                    currentChunk = sentence;
                } else {
                    // 문장이 너무 긴 경우 강제로 자르기
                    chunks.push(sentence.substring(0, adjustedChunkSize));
                    currentChunk = sentence.substring(adjustedChunkSize);
                }
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        
        return chunks;
    }

    calculateTotalContextSize() {
        try {
            let totalSize = 0;
            
            // 1. 프롬프트 템플릿 크기 (대략 5000자 추정)
            totalSize += 5000;
            
            // 2. Bounded Contexts 데이터 크기
            if (this.client.input && this.client.input.resultDevideBoundedContext) {
                const bcJson = JSON.stringify(this.client.input.resultDevideBoundedContext);
                totalSize += bcJson.length;
            }
            
            // 3. 누적된 Bounded Contexts 데이터 크기
            if (this.accumulated && this.accumulated.boundedContexts) {
                const accumulatedJson = JSON.stringify(this.accumulated);
                totalSize += accumulatedJson.length;
            }
            
            // 4. 안전 마진 (10%)
            totalSize = Math.round(totalSize * 1.1);
            
            return totalSize;
            
        } catch (e) {
            console.warn('Failed to calculate total context size:', e);
            return 5000; // 기본값으로 5KB 추정
        }
    }

    processNextChunk() {
        if (this.currentChunkIndex >= this.requirementsChunks.length) {
            this.isProcessing = false;
            this.resolve({
                extractedData: this.accumulated,
                currentGeneratedLength: JSON.stringify(this.accumulated).length
            });
            return;
        }

        const currentChunk = this.requirementsChunks[this.currentChunkIndex];
        
        // 이전 결과 요약과 함께 현재 청크 처리
        const promptWithContext = this.createRecursivePrompt(currentChunk);
        
        this.client.input.requirements = promptWithContext;
        
        // 진행 상황 업데이트
        this.updateProgress();
        
        this.generate().then(result => {
            this.handleGenerationFinished(result);
        }).catch(error => {
            console.error('Chunk processing error:', error);
            this.currentChunkIndex++;
            setTimeout(() => this.processNextChunk(), 100);
        });
    }

    createRecursivePrompt(currentChunk) {
        const accumulatedSummary = this.createAccumulatedSummary();
        
        return `You are an expert DDD architect. Extract Commands and ReadModels from the following requirements chunk and merge with previous results.

        PREVIOUS EXTRACTED DATA SUMMARY:
        ${accumulatedSummary}

        CURRENT REQUIREMENTS CHUNK:
        ${currentChunk}

        BOUNDED CONTEXTS:
        ${JSON.stringify(this.client.input.resultDevideBoundedContext || [])}

        TASK:
        1. Extract Commands and ReadModels from the current chunk
        2. Merge with the previous accumulated data
        3. Avoid duplicates based on name and functionality
        4. Ensure proper categorization by Bounded Context

        EXTRACTION GUIDELINES:
        - Focus on NEW operations not already in the previous summary
        - Maintain consistency with existing naming conventions
        - Ensure proper Bounded Context assignment
        - Use the same output format as the base extractor

        OUTPUT FORMAT:
        {
          "extractedData": {
            "boundedContexts": [
              {
                "name": "BoundedContextName",
                "alias": "BoundedContextAlias", 
                "commands": [...],
                "readModels": [...]
              }
            ]
          }
        }

        Return ONLY JSON, no explanations.`;
    }

    createAccumulatedSummary() {
        if (!this.accumulated.boundedContexts || this.accumulated.boundedContexts.length === 0) {
            return "No previous data available.";
        }

        return this.accumulated.boundedContexts.map(bc => {
            const commandNames = bc.commands ? bc.commands.map(cmd => cmd.name).join(', ') : 'None';
            const readModelNames = bc.readModels ? bc.readModels.map(rm => rm.name).join(', ') : 'None';
            
            return `- ${bc.name} (${bc.alias}): Commands=[${commandNames}], ReadModels=[${readModelNames}]`;
        }).join('\n');
    }

    handleGenerationFinished(model) {
        try {
            if (model && model.extractedData && model.extractedData.boundedContexts) {
                this.accumulated = this.mergeExtractedData(this.accumulated, model.extractedData);
            }

            // 다음 청크로 진행하기 전에 진행률 업데이트
            this.currentChunkIndex++;
            this.updateProgress();
            setTimeout(() => this.processNextChunk(), 100);
        } catch (error) {
            console.error('Error handling generation finished:', error);
            this.currentChunkIndex++;
            this.updateProgress();
            setTimeout(() => this.processNextChunk(), 100);
        }
    }

    updateProgress() {
        if (this.client && this.client.updateMessageState) {
            const progress = Math.round((this.currentChunkIndex / this.requirementsChunks.length) * 100);
            const siteMapViewerMessage = this.client.messages.find(msg => msg.type === 'siteMapViewer');
            const messageId = siteMapViewerMessage ? siteMapViewerMessage.uniqueId : null;
            
            if (messageId) {
                this.client.updateMessageState(messageId, {
                    processingRate: progress,
                    currentChunk: this.currentChunkIndex + 1,
                    totalChunks: this.requirementsChunks.length,
                    currentProcessingStep: 'extractingCommandsAndReadModels'
                });
            }
        }
    }

    getProgressInfo() {
        return {
            isProcessing: this.isProcessing,
            currentChunk: this.currentChunkIndex + 1,
            totalChunks: this.requirementsChunks.length,
            progress: Math.round((this.currentChunkIndex / this.requirementsChunks.length) * 100)
        };
    }
}

module.exports = RecursiveCommandReadModelExtractor;
