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
        // 요구사항 유효성 검사
        if (!requirementsText || typeof requirementsText !== 'string') {
            console.warn('RecursiveCommandReadModelExtractor: Invalid or empty requirements text');
            return [];
        }

        const trimmedText = requirementsText.trim();
        if (trimmedText.length === 0) {
            console.warn('RecursiveCommandReadModelExtractor: Empty requirements text after trimming');
            return [];
        }

        if (trimmedText.length <= this.chunkSize) {
            return [{
                content: trimmedText,
                chunkIndex: 0,
                isValid: this.validateChunkContent(trimmedText),
                sourceInfo: {
                    startPosition: 0,
                    endPosition: trimmedText.length,
                    originalLength: trimmedText.length
                }
            }];
        }

        // 전체 컨텍스트 크기 계산하여 청크 크기 동적 조정
        const totalContextSize = this.calculateTotalContextSize();
        const adjustedChunkSize = Math.max(15000, this.chunkSize - totalContextSize);
        
        console.log(`RecursiveCommandReadModelExtractor - Total context size: ${totalContextSize}, Adjusted chunk size: ${adjustedChunkSize}`);

        const chunks = [];
        let currentChunk = '';
        let currentPosition = 0;
        const sentences = trimmedText.split(/[.!?]\s+/);
        
        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            const testChunk = currentChunk + (currentChunk ? '. ' : '') + sentence;
            
            if (testChunk.length <= adjustedChunkSize) {
                currentChunk = testChunk;
            } else {
                if (currentChunk) {
                    const chunkData = this.createChunkData(currentChunk, chunks.length, currentPosition);
                    chunks.push(chunkData);
                    currentPosition += currentChunk.length;
                    currentChunk = sentence;
                } else {
                    // 문장이 너무 긴 경우 강제로 자르기
                    const truncatedSentence = sentence.substring(0, adjustedChunkSize);
                    const chunkData = this.createChunkData(truncatedSentence, chunks.length, currentPosition);
                    chunks.push(chunkData);
                    currentPosition += truncatedSentence.length;
                    currentChunk = sentence.substring(adjustedChunkSize);
                }
            }
        }
        
        if (currentChunk) {
            const chunkData = this.createChunkData(currentChunk, chunks.length, currentPosition);
            chunks.push(chunkData);
        }
        
        return chunks;
    }

    createChunkData(content, chunkIndex, startPosition) {
        return {
            content: content.trim(),
            chunkIndex: chunkIndex,
            isValid: this.validateChunkContent(content),
            sourceInfo: {
                startPosition: startPosition,
                endPosition: startPosition + content.length,
                originalLength: content.length
            }
        };
    }

    validateChunkContent(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        const trimmed = content.trim();
        if (trimmed.length === 0) {
            return false;
        }

        // 최소 의미있는 문장 길이 체크 (최소 10자)
        if (trimmed.length < 10) {
            console.warn(`RecursiveCommandReadModelExtractor: Chunk too short (${trimmed.length} chars): "${trimmed}"`);
            return false;
        }

        // 의미있는 단어가 있는지 체크 (최소 2개 단어)
        const words = trimmed.split(/\s+/).filter(word => word.length > 0);
        if (words.length < 2) {
            console.warn(`RecursiveCommandReadModelExtractor: Chunk has insufficient words (${words.length}): "${trimmed}"`);
            return false;
        }

        return true;
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
        
        // 청크 유효성 검사
        if (!currentChunk || !currentChunk.isValid) {
            console.warn(`RecursiveCommandReadModelExtractor: Skipping invalid chunk ${this.currentChunkIndex}:`, currentChunk);
            this.currentChunkIndex++;
            setTimeout(() => this.processNextChunk(), 100);
            return;
        }

        // 이전 결과 요약과 함께 현재 청크 처리
        const promptWithContext = this.createRecursivePrompt(currentChunk);
        
        this.client.input.requirements = promptWithContext;
        
        // 진행 상황 업데이트
        this.updateProgress();
        
        this.generate().then(result => {
            this.handleGenerationFinished(result, currentChunk);
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

        CURRENT REQUIREMENTS CHUNK (Chunk ${currentChunk.chunkIndex + 1}):
        ${currentChunk.content}

        BOUNDED CONTEXTS:
        ${JSON.stringify(this.client.input.resultDevideBoundedContext || [])}

        TASK:
        1. Extract Commands and ReadModels from the current chunk
        2. Merge with the previous accumulated data
        3. Avoid duplicates based on name and functionality
        4. Ensure proper categorization by Bounded Context
        5. Include source tracking information for each extracted item

        EXTRACTION GUIDELINES:
        - Focus on NEW operations not already in the previous summary
        - Maintain consistency with existing naming conventions
        - Ensure proper Bounded Context assignment
        - Use the same output format as the base extractor
        - Add source tracking metadata to each Command and ReadModel

        OUTPUT FORMAT:
        {
          "extractedData": {
            "boundedContexts": [
              {
                "name": "BoundedContextName",
                "alias": "BoundedContextAlias", 
                "commands": [
                  {
                    "name": "CommandName",
                    "description": "Command description",
                    "sourceInfo": {
                      "chunkIndex": ${currentChunk.chunkIndex},
                      "sourceText": "relevant source text from requirements",
                      "position": {
                        "start": 0,
                        "end": 100
                      }
                    }
                  }
                ],
                "readModels": [
                  {
                    "name": "ReadModelName", 
                    "description": "ReadModel description",
                    "sourceInfo": {
                      "chunkIndex": ${currentChunk.chunkIndex},
                      "sourceText": "relevant source text from requirements",
                      "position": {
                        "start": 0,
                        "end": 100
                      }
                    }
                  }
                ]
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

    handleGenerationFinished(model, currentChunk) {
        try {
            if (model && model.extractedData && model.extractedData.boundedContexts) {
                // 출처 정보를 추가하여 데이터 병합
                const enrichedData = this.enrichWithSourceInfo(model.extractedData, currentChunk);
                this.accumulated = this.mergeExtractedData(this.accumulated, enrichedData);
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

    enrichWithSourceInfo(extractedData, currentChunk) {
        if (!extractedData || !extractedData.boundedContexts) {
            return extractedData;
        }

        const enrichedData = {
            ...extractedData,
            boundedContexts: extractedData.boundedContexts.map(bc => ({
                ...bc,
                commands: bc.commands ? bc.commands.map(cmd => this.addSourceInfoToItem(cmd, currentChunk)) : [],
                readModels: bc.readModels ? bc.readModels.map(rm => this.addSourceInfoToItem(rm, currentChunk)) : []
            }))
        };

        return enrichedData;
    }

    addSourceInfoToItem(item, currentChunk) {
        // 이미 sourceInfo가 있는 경우 유지, 없는 경우 추가
        if (!item.sourceInfo) {
            item.sourceInfo = {
                chunkIndex: currentChunk.chunkIndex,
                sourceText: this.extractRelevantSourceText(item, currentChunk.content),
                position: {
                    start: 0,
                    end: currentChunk.content.length
                },
                chunkSourceInfo: currentChunk.sourceInfo
            };
        }
        return item;
    }

    extractRelevantSourceText(item, chunkContent) {
        // Command나 ReadModel의 이름이나 설명과 관련된 텍스트를 찾아서 반환
        const itemName = item.name || '';
        const itemDescription = item.description || '';
        
        // 청크 내용에서 관련 텍스트 찾기 (간단한 키워드 매칭)
        const keywords = [itemName, ...itemDescription.split(' ').filter(word => word.length > 3)];
        const relevantText = keywords
            .map(keyword => {
                const index = chunkContent.toLowerCase().indexOf(keyword.toLowerCase());
                if (index !== -1) {
                    const start = Math.max(0, index - 50);
                    const end = Math.min(chunkContent.length, index + keyword.length + 50);
                    return chunkContent.substring(start, end);
                }
                return null;
            })
            .filter(text => text !== null)
            .join(' ... ');

        return relevantText || chunkContent.substring(0, 200) + '...';
    }

    // 부모 클래스의 mergeExtractedData를 오버라이드하여 출처 정보 보존
    mergeExtractedData(existingData, newData) {
        if (!existingData || !existingData.boundedContexts) {
            return newData;
        }

        const mergedBoundedContexts = [...existingData.boundedContexts];

        newData.boundedContexts.forEach(newBC => {
            const existingBCIndex = mergedBoundedContexts.findIndex(
                bc => bc.name === newBC.name
            );

            if (existingBCIndex !== -1) {
                // 중복 제거하면서 출처 정보 보존
                const existingCommands = mergedBoundedContexts[existingBCIndex].commands || [];
                const existingReadModels = mergedBoundedContexts[existingBCIndex].readModels || [];
                
                // 새로운 Commands 추가 (중복 제거)
                const newCommands = (newBC.commands || []).filter(newCmd => 
                    !existingCommands.some(existingCmd => 
                        existingCmd.name === newCmd.name && 
                        existingCmd.description === newCmd.description
                    )
                );
                
                // 새로운 ReadModels 추가 (중복 제거)
                const newReadModels = (newBC.readModels || []).filter(newRm => 
                    !existingReadModels.some(existingRm => 
                        existingRm.name === newRm.name && 
                        existingRm.description === newRm.description
                    )
                );

                mergedBoundedContexts[existingBCIndex].commands = [
                    ...existingCommands,
                    ...newCommands
                ];
                mergedBoundedContexts[existingBCIndex].readModels = [
                    ...existingReadModels,
                    ...newReadModels
                ];
            } else {
                mergedBoundedContexts.push(newBC);
            }
        });

        return {
            ...existingData,
            boundedContexts: mergedBoundedContexts
        };
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
