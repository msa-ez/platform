const RequirementsSummarizer = require("./RequirementsSummarizer");
const TextChunker = require("./TextChunker");
const { TextTraceUtil } = require("./utils");

class RecursiveRequirementsSummarizer extends RequirementsSummarizer {
    constructor(client) {
        super(client);
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 2000
        });
        this.maxIterations = 3;
        
        // 상태 관리 추가
        this.currentChunks = [];
        this.summarizedChunks = [];
        this.currentChunkIndex = 0;
        this.resolveCurrentProcess = null;
        this.iterations = 0;
        
        // 참조 추적을 위한 속성 추가
        this.originalRequirements = '';
    }

    makeUserStoryChunks(text) {
        return this.textChunker.splitIntoChunksByLine(text);
    }


    async summarizeRecursively(text) {
        let structuredResult = {
            summarizedRequirements: [
                {
                    text: text,
                    refs: []
                }
            ]
        };


        this.originalRequirements = text;
        this.iterations = 0;
        while (this._getCurrentTextLength(structuredResult) > this.textChunker.chunkSize && this.iterations < this.maxIterations) {
            this.iterations++;
            const currentLength = this._getCurrentTextLength(structuredResult);
            console.log(`Iteration ${this.iterations} - Before summarize: ${currentLength}`);
            
            // 첫 번째 요약인 경우: 원본을 라인 번호와 함께 청크로 분할
            if (this.iterations === 1) {
                this.currentChunks = this._prepareLineNumberedChunks(structuredResult);
                this.summarizedChunks = [];
                this.currentChunkIndex = 0;
                
                // 첫 번째 요약 - 원본을 구조화된 형식으로 요약
                structuredResult = await this._processFirstIteration();
            } else {
                // 이후 요약 - 구조화된 데이터를 청킹하여 요약
                structuredResult = await this._processSubsequentIteration(structuredResult);
            }
            
            const newLength = this._getCurrentTextLength(structuredResult);
            console.log(`Iteration ${this.iterations} - After summarize: ${newLength}`);
        }
    
        // 최종 요약이 필요한 경우에만 수행
        if (this.iterations === 0 || this._getCurrentTextLength(structuredResult) > this.textChunker.chunkSize) {
            // 원본이 크지 않은 경우 첫 번째 요약 실행
            if (this.iterations === 0) {
                this.currentChunks = this._prepareLineNumberedChunks(structuredResult);
                this.summarizedChunks = [];
                this.currentChunkIndex = 0;
                structuredResult = await this._processFirstIteration();
            } else {
                // 최종 요약 필요
                structuredResult = await this.processFinalSummary(structuredResult);
            }
        }
    
        // 프로세스 완료 표시
        this.resolveCurrentProcess = null;
        

        this._restoreLastLineNumber(structuredResult);
        return {
            summary: this._extractFinalText(structuredResult),
            refs: structuredResult,
            originalRequirements: this.originalRequirements
        }
    }

    _prepareLineNumberedChunks(structuredResult) {
        const text = this._extractFinalText(structuredResult);
        const chunks = this.textChunker.splitIntoChunksByLine(text);
        return chunks.map(chunk => ({
            ...chunk,
            numberedText: TextTraceUtil.addLineNumbers(chunk.text, chunk.startLine)
        }));
    }

    async _processFirstIteration() {
        return new Promise(resolve => {
            this.resolveCurrentProcess = resolve;
            this._processNextFirstChunk();
        });
    }

    _restoreLastLineNumber(structuredResult) {
        if(!structuredResult || !structuredResult.summarizedRequirements || !Array.isArray(structuredResult.summarizedRequirements) || !this.originalRequirements) {
            return;
        }

        const originalRequirementsLines = this.originalRequirements.split('\n');
        structuredResult.summarizedRequirements.forEach(summary => {
            if(!summary.refs || !Array.isArray(summary.refs)) {
                return;
            }

            const validSummaryRefs = []
            for(const ref of summary.refs) {
                if(!ref || !Array.isArray(ref) || ref.length !== 2 || !Array.isArray(ref[1]) || ref[1].length !== 2) {
                    continue;
                }
                if(ref[1][1] === -1) {
                    const matchLine = originalRequirementsLines[ref[1][0] - 1];
                    if(!matchLine || !matchLine.trim()) {
                        continue;
                    }
                    ref[1][1] = matchLine.length;
                }
                validSummaryRefs.push(ref);
            }
            summary.refs = validSummaryRefs;
        });
    }


    async _processSubsequentIteration(structuredResult) {
        // 구조화된 데이터를 번호가 매겨진 목록으로 변환
        const numberedText = this._createNumberedText(structuredResult);
        
        // 번호가 매겨진 목록의 크기 확인 및 청킹 결정
        if (numberedText.length <= this.textChunker.chunkSize) {
            // 청킹이 필요 없는 경우 - 직접 처리
            return await this._processSubsequentSingleChunk(numberedText, structuredResult);
        } else {
            // 청킹이 필요한 경우 - 여러 청크로 분할하여 처리
            return await this._processSubsequentWithChunking(numberedText, structuredResult);
        }
    }

    async _processSubsequentSingleChunk(numberedText, originalStructuredResult) {
        this.client.input = {
            requirements: {
                userStory: numberedText,
                isFinalSummary: false
            }
        };

        return new Promise(resolve => {
            this.resolveCurrentProcess = (result) => {
                const processedResult = this._processSubsequentResult(result, originalStructuredResult);
                resolve(processedResult);
            };
            this.generate();
        });
    }

    async _processSubsequentWithChunking(numberedText, originalStructuredResult) {
        // 번호가 매겨진 목록을 텍스트 청킹을 통해 분할
        const chunks = this.textChunker.splitIntoChunksByLine(numberedText);
        
        const chunkResults = [];
        
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i].text;

            this.client.input = {
                requirements: {
                    userStory: chunk,
                    isFinalSummary: false
                }
            };

            const chunkResult = await new Promise(resolve => {
                this.resolveCurrentProcess = resolve;
                this.generate();
            });

            if (chunkResult && chunkResult.summarizedRequirements) {
                chunkResults.push(chunkResult);
            }
        }

        // 모든 청크 결과를 병합
        return this._mergeSubsequentChunkResults(chunkResults, originalStructuredResult);
    }

    _mergeSubsequentChunkResults(chunkResults, originalStructuredResult) {
        const allSummaries = [];
        
        chunkResults.forEach((chunkResult) => {
            if(!chunkResult || !chunkResult.summarizedRequirements || !Array.isArray(chunkResult.summarizedRequirements)) {
                return;
            }

            chunkResult.summarizedRequirements.forEach(summary => {
                const mergedRefs = this._mergeRefsFromIndicesWithChunkOffset(
                    summary.source_lines || [],
                    originalStructuredResult.summarizedRequirements
                );
                
                allSummaries.push({
                    text: summary.text,
                    refs: mergedRefs
                });
            });
        });

        return {
            summarizedRequirements: allSummaries
        };
    }

    /**
     * 청킹된 결과에서 source_lines를 올바른 원본 인덱스로 변환
     * @param {Array} sourceIndices - AI가 반환한 청크 내 인덱스들
     * @param {Array} originalSummaries - 이전 단계의 요약들
     * @param {number} chunkIndex - 현재 청크의 인덱스
     * @param {string} numberedText - 번호가 매겨진 전체 목록
     * @returns {Array} 병합된 refs
     */
    _mergeRefsFromIndicesWithChunkOffset(sourceIndices, originalSummaries) {
        const mergedRefs = [];
        
        sourceIndices.forEach(sourceIndex => {
            const summaryIndex = sourceIndex - 1;
            
            if (summaryIndex < originalSummaries.length && originalSummaries[summaryIndex].refs) {
                mergedRefs.push(...originalSummaries[summaryIndex].refs);
            }
        });
        
        return this._deduplicateAndSortRefs(mergedRefs);
    }

    async processFinalSummary(structuredResult) {
        const numberedText = this._createNumberedText(structuredResult);
        
        // 최종 요약에서도 청킹이 필요한지 확인
        if (numberedText.length <= this.textChunker.chunkSize) {
            // 청킹이 필요 없는 경우
            this.client.input = {
                requirements: {
                    userStory: numberedText,
                    isFinalSummary: true
                }
            };

            return new Promise(resolve => {
                this.resolveCurrentProcess = (result) => {
                    const processedResult = this._processSubsequentResult(result, structuredResult);
                    resolve(processedResult);
                };
                this.generate();
            });
        } else {
            // 최종 요약에서도 청킹 필요
            console.log(`Final summary requires chunking: ${numberedText.length} > ${this.textChunker.chunkSize}`);
            return await this._processSubsequentWithChunking(numberedText, structuredResult);
        }
    }

    _processSubsequentResult(aiResult, previousStructuredResult) {
        if (!aiResult || !aiResult.summarizedRequirements || !Array.isArray(aiResult.summarizedRequirements)) {
            return previousStructuredResult; // 실패 시 이전 결과 반환
        }

        const newSummaries = [];
        aiResult.summarizedRequirements.forEach(summary => {
            const mergedRefs = this._mergeRefsFromIndices(
                summary.source_lines || [],
                previousStructuredResult.summarizedRequirements
            );
            
            newSummaries.push({
                text: summary.text,
                refs: mergedRefs
            });
        });
        return {
            summarizedRequirements: newSummaries
        };
    }

    /**
     * 재귀적 요약 과정에서 원본 요구사항 텍스트에 대한 참조(refs) 정보를 계속해서 유지하고 전파
     */
    _mergeRefsFromIndices(sourceLines, previousSummaries) {
        const mergedRefs = [];
        
        sourceLines.forEach(lineNumber => {
            if (lineNumber < previousSummaries.length && previousSummaries[lineNumber].refs) {
                mergedRefs.push(...previousSummaries[lineNumber].refs);
            }
        });
        
        // 중복 제거 및 정렬
        return this._deduplicateAndSortRefs(mergedRefs);
    }

    /**
     * refs 배열에서 중복을 제거하고 정렬
     * @param {Array} refs - refs 배열
     * @returns {Array} 정리된 refs 배열
     */
    _deduplicateAndSortRefs(refs) {
        if (!refs || refs.length === 0) return [];
        
        // refs를 문자열로 변환하여 중복 제거
        const refsSet = new Set();
        const validRefs = [];
        
        refs.forEach(ref => {
            if (Array.isArray(ref) && ref.length === 2 && 
                Array.isArray(ref[0]) && Array.isArray(ref[1]) &&
                ref[0].length === 2 && ref[1].length === 2) {
                
                const refString = JSON.stringify(ref);
                if (!refsSet.has(refString)) {
                    refsSet.add(refString);
                    validRefs.push(ref);
                }
            }
        });
        
        // 시작 라인 번호 순으로 정렬
        validRefs.sort((a, b) => {
            const startLineA = a[0][0];
            const startLineB = b[0][0];
            return startLineA - startLineB;
        });
        
        return validRefs;
    }



    handleGenerationFinished(model) {
        try {
            let summarizedChunk;
            if (!model || !model.summarizedRequirements) {
                console.warn('Invalid model received:', model);
                // 현재 청크의 원본 텍스트 사용
                if (this.iterations === 1 && this.currentChunkIndex < this.currentChunks.length) {
                    summarizedChunk = {
                        summarizedRequirements: [{
                            text: this.currentChunks[this.currentChunkIndex].text,
                            refs: []
                        }]
                    };
                } else {
                    summarizedChunk = model;
                }
            } else {
                summarizedChunk = model;
            }
            
            if (this.iterations === 1 && !this.client.input.requirements.isFinalSummary) {
                // 첫 번째 요약의 청크 처리
                console.log(`Processing first iteration chunk ${this.currentChunkIndex + 1}/${this.currentChunks.length}`);
                this.summarizedChunks.push(summarizedChunk);
                this.currentChunkIndex++;
                setTimeout(() => this._processNextFirstChunk(), 100);
            } else {
                // 후속 요약, 최종 요약, 또는 subsequent chunk 처리 완료   
                if (this.resolveCurrentProcess) {
                    this.resolveCurrentProcess(summarizedChunk);
                }
            }
        } catch (e) {
            console.error('Error in handleGenerationFinished:', e);
            // 에러 발생 시 대체 텍스트 사용
            const fallbackText = this.client.input.requirements.isFinalSummary ? 
                this.client.input.requirements.userStory : 
                (this.currentChunks[this.currentChunkIndex] ? this.currentChunks[this.currentChunkIndex].text : '');
                
            if (this.iterations === 1 && !this.client.input.requirements.isFinalSummary) {
                console.log(`Fallback: Using original text for chunk ${this.currentChunkIndex + 1}`);
                this.summarizedChunks.push({
                    summarizedRequirements: [{
                        text: fallbackText,
                        refs: []
                    }]
                });
                this.currentChunkIndex++;
                setTimeout(() => this._processNextFirstChunk(), 100);
            } else {
                console.log('Fallback: Using original text for summary');
                if (this.resolveCurrentProcess) {
                    this.resolveCurrentProcess(fallbackText);
                }
            }
        }
    }


    _processNextFirstChunk() {
        try {
            if (this.currentChunkIndex < this.currentChunks.length) {
                const chunk = this.currentChunks[this.currentChunkIndex];
                
                // 첫 번째 요약: 라인 번호가 포함된 텍스트를 AI에 전달
                this.client.input = {
                    requirements: {
                        userStory: chunk.numberedText,
                        isFinalSummary: false
                    }
                };
                this.generate();
            } else {
                // 모든 청크 처리 완료, 합치기
                const combinedResult = this._combineFirstIterationResults();
                this.resolveCurrentProcess(combinedResult);
            }
        } catch (e) {
            console.error('Error in _processNextFirstChunk:', e);
            // 에러 발생 시 현재 청크의 원본 텍스트 사용
            this.summarizedChunks.push({
                summarizedRequirements: [{
                    text: this.currentChunks[this.currentChunkIndex].text,
                    refs: []
                }]
            });
            this.currentChunkIndex++;
            setTimeout(() => this._processNextFirstChunk(), 100);
        }
    }

    _combineFirstIterationResults() {
        const allSummaries = [];
        
        this.summarizedChunks.forEach(chunkResult => {
            if (chunkResult.summarizedRequirements) {
                allSummaries.push(...chunkResult.summarizedRequirements);
            }
        });

        return {
            summarizedRequirements: allSummaries
        };
    }


    _extractFinalText(structuredResult) {
        if (!structuredResult.summarizedRequirements) return '';
        
        return structuredResult.summarizedRequirements
            .map(item => item.text)
            .join('\n');
    }

    _getCurrentTextLength(structuredResult) {
        if(!structuredResult || !structuredResult.summarizedRequirements) return 0;

        return this._createNumberedText(structuredResult).length;
    }

    _createNumberedText(structuredResult) {
        if (!structuredResult.summarizedRequirements) return '';

        return structuredResult.summarizedRequirements
            .map((item, index) => `${index + 1}: ${item.text}`)
            .join('\n');
    }
}

module.exports = RecursiveRequirementsSummarizer;