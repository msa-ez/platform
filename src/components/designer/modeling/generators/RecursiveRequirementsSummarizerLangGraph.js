const RequirementsSummarizer = require("./RequirementsSummarizer");
const TextChunker = require("./TextChunker");
const { TextTraceUtil } = require("./utils");
const SummarizerLangGraphProxy = require("./proxies/SummarizerLangGraphProxy");

/**
 * RecursiveRequirementsSummarizerLangGraph
 * LangGraph Backend를 사용하는 재귀적 요약 생성기
 */
class RecursiveRequirementsSummarizerLangGraph extends RequirementsSummarizer {
    constructor(client) {
        super(client);
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 2000
        });
        this.maxIterations = 3;
        
        // 상태 관리
        this.currentChunks = [];
        this.summarizedChunks = [];
        this.currentChunkIndex = 0;
        this.iterations = 0;
        this.originalRequirements = '';
        
        // Job 관리
        this.jobId = null;
        this.currentJobPromise = null;
    }

    /**
     * Job ID 생성
     */
    _generateJobId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `summ-${timestamp}-${random}`;
    }

    makeUserStoryChunks(text) {
        return this.textChunker.splitIntoChunksByLine(text);
    }

    /**
     * 재귀적 요약 시작
     */
    async summarizeRecursively(text) {
        console.log('[SummarizerLangGraph] Starting summarization...');
        
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
            console.log(`[SummarizerLangGraph] Iteration ${this.iterations} - Before: ${currentLength} 자`);
            
            if (this.iterations === 1) {
                // 첫 번째 요약: 원본을 청크로 나눠서 Backend 처리
                structuredResult = await this._processFirstIteration(structuredResult);
            } else {
                // 후속 요약: 구조화된 데이터를 다시 청킹
                structuredResult = await this._processSubsequentIteration(structuredResult);
            }
            
            const newLength = this._getCurrentTextLength(structuredResult);
            console.log(`[SummarizerLangGraph] Iteration ${this.iterations} - After: ${newLength} 자`);
        }
        
        // 최종 요약이 필요한 경우
        if (this.iterations === 0 || this._getCurrentTextLength(structuredResult) > this.textChunker.chunkSize) {
            if (this.iterations === 0) {
                structuredResult = await this._processFirstIteration(structuredResult);
            } else {
                structuredResult = await this._processFinalSummary(structuredResult);
            }
        }
        
        // Refs 정리 및 반환
        this._restoreLastLineNumber(structuredResult);
        
        console.log('[SummarizerLangGraph] Summarization completed');
        
        return {
            summary: this._extractFinalText(structuredResult),
            refs: structuredResult,
            originalRequirements: this.originalRequirements
        };
    }

    /**
     * 첫 번째 Iteration 처리 (청크별로 Backend Job 생성)
     */
    async _processFirstIteration(structuredResult) {
        const chunks = this._prepareLineNumberedChunks(structuredResult);
        this.currentChunks = chunks;
        this.summarizedChunks = [];
        
        console.log(`[SummarizerLangGraph] 첫 번째 요약: ${chunks.length}개 청크`);
        
        // 각 청크별로 Backend Job 처리
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`[SummarizerLangGraph] 청크 ${i + 1}/${chunks.length} 처리 중...`);
            
            // Job ID 생성
            this.jobId = this._generateJobId();
            
            // Firebase Job 생성
            await SummarizerLangGraphProxy.makeNewJob(
                this.jobId,
                chunk.numberedText,
                this.iterations
            );
            
            // Job 완료 대기
            const chunkResult = await new Promise((resolve, reject) => {
                let hasResolved = false;
                
                SummarizerLangGraphProxy.watchJob(
                    this.jobId,
                    // onUpdate
                    (summaries, logs, progress) => {
                        console.log(`[SummarizerLangGraph] 청크 ${i + 1} - Progress: ${progress}%`);
                    },
                    // onComplete (summaries, logs, progress, isFailed)
                    (summaries, logs, progress, isFailed) => {
                        if (hasResolved) return; // 중복 호출 방지
                        hasResolved = true;
                        
                        console.log(`[SummarizerLangGraph] 청크 ${i + 1} 완료: ${summaries ? summaries.length : 0}개 요약`);
                        resolve({ summarizedRequirements: summaries || [] });
                    },
                    // onWaiting
                    (waitingCount) => {
                        console.log(`[SummarizerLangGraph] 청크 ${i + 1} 대기 중... Queue: ${waitingCount}`);
                    },
                    // onError
                    (error) => {
                        if (hasResolved) return; // 중복 호출 방지
                        hasResolved = true;
                        
                        console.error(`[SummarizerLangGraph] 청크 ${i + 1} 오류:`, error);
                        reject(new Error(error));
                    }
                );
            });
            
            this.summarizedChunks.push(chunkResult);
        }
        
        // 모든 청크 결과 병합
        return this._combineFirstIterationResults();
    }

    /**
     * 첫 번째 요약 결과 병합
     */
    _combineFirstIterationResults() {
        const allSummaries = [];
        
        for (const chunkResult of this.summarizedChunks) {
            if (chunkResult.summarizedRequirements) {
                allSummaries.push(...chunkResult.summarizedRequirements);
            }
        }
        
        const result = {
            summarizedRequirements: allSummaries
        };
        
        console.log(`[SummarizerLangGraph] ✅ 청크 병합 완료: ${allSummaries.length}개 요약, 총 ${this._getCurrentTextLength(result)} 자`);
        
        return result;
    }

    /**
     * 후속 Iteration 처리
     */
    async _processSubsequentIteration(structuredResult) {
        const chunks = this._prepareLineNumberedChunks(structuredResult);
        this.currentChunks = chunks;
        this.summarizedChunks = [];
        
        console.log(`[SummarizerLangGraph] Iteration ${this.iterations}: ${chunks.length}개 청크`);
        
        // 각 청크별로 Backend Job 처리
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            this.jobId = this._generateJobId();
            
            await SummarizerLangGraphProxy.makeNewJob(
                this.jobId,
                chunk.numberedText,
                this.iterations
            );
            
            const chunkResult = await new Promise((resolve, reject) => {
                let hasResolved = false;
                
                SummarizerLangGraphProxy.watchJob(
                    this.jobId,
                    null,
                    (summaries, logs, progress, isFailed) => {
                        if (hasResolved) return;
                        hasResolved = true;
                        resolve({ summarizedRequirements: summaries || [] });
                    },
                    null,
                    (error) => {
                        if (hasResolved) return;
                        hasResolved = true;
                        reject(new Error(error));
                    }
                );
            });
            
            this.summarizedChunks.push(chunkResult);
        }
        
        return this._combineSubsequentResults();
    }

    /**
     * 후속 요약 결과 병합 및 refs 복원
     */
    _combineSubsequentResults() {
        const allSummaries = [];
        
        for (const chunkResult of this.summarizedChunks) {
            if (chunkResult.summarizedRequirements) {
                allSummaries.push(...chunkResult.summarizedRequirements);
            }
        }
        
        const result = {
            summarizedRequirements: allSummaries
        };
        
        console.log(`[SummarizerLangGraph] ✅ 후속 병합 완료: ${allSummaries.length}개 요약, 총 ${this._getCurrentTextLength(result)} 자`);
        
        return result;
    }

    /**
     * 최종 요약 처리
     */
    async _processFinalSummary(structuredResult) {
        console.log(`[SummarizerLangGraph] 최종 요약 처리`);
        
        const chunks = this._prepareLineNumberedChunks(structuredResult);
        this.currentChunks = chunks;
        this.summarizedChunks = [];
        
        // 단일 청크로 처리
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            this.jobId = this._generateJobId();
            
            await SummarizerLangGraphProxy.makeNewJob(
                this.jobId,
                chunk.numberedText,
                this.iterations + 1
            );
            
            const chunkResult = await new Promise((resolve, reject) => {
                let hasResolved = false;
                
                SummarizerLangGraphProxy.watchJob(
                    this.jobId,
                    null,
                    (summaries, logs, progress, isFailed) => {
                        if (hasResolved) return;
                        hasResolved = true;
                        resolve({ summarizedRequirements: summaries || [] });
                    },
                    null,
                    (error) => {
                        if (hasResolved) return;
                        hasResolved = true;
                        reject(new Error(error));
                    }
                );
            });
            
            this.summarizedChunks.push(chunkResult);
        }
        
        return this._combineSubsequentResults();
    }

    /**
     * 라인 번호가 포함된 청크 준비
     */
    _prepareLineNumberedChunks(structuredResult) {
        const text = this._extractFinalText(structuredResult);
        const chunks = this.textChunker.splitIntoChunksByLine(text);
        return chunks.map(chunk => ({
            ...chunk,
            numberedText: TextTraceUtil.addLineNumbers(chunk.text, chunk.startLine)
        }));
    }

    /**
     * 현재 텍스트 길이 계산
     */
    _getCurrentTextLength(structuredResult) {
        return this._extractFinalText(structuredResult).length;
    }

    /**
     * 최종 텍스트 추출
     */
    _extractFinalText(structuredResult) {
        if (!structuredResult || !structuredResult.summarizedRequirements) {
            return '';
        }
        
        return structuredResult.summarizedRequirements
            .map(item => item.text)
            .join('\n');
    }

    /**
     * 마지막 라인 번호 복원
     */
    _restoreLastLineNumber(structuredResult) {
        if (!structuredResult || !structuredResult.summarizedRequirements) {
            return;
        }
        
        structuredResult.summarizedRequirements.forEach(requirement => {
            if (requirement.refs && requirement.refs.length > 0) {
                requirement.refs.forEach(ref => {
                    if (ref[1] && ref[1][1] === -1) {
                        ref[1][1] = ref[0][1];
                    }
                });
            }
        });
    }

    /**
     * 중단 처리
     */
    stop() {
        console.log('[SummarizerLangGraph] Stopping...');
        // Job 취소 로직 필요시 추가
    }
}

module.exports = RecursiveRequirementsSummarizerLangGraph;

