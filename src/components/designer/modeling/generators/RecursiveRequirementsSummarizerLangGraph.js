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
        // 청크 병렬 처리 동시성. P-GPT 게이트웨이 부하 고려해 3 으로 시작.
        // 너무 키우면 429/연결 거부, 너무 낮으면 직렬과 다를 게 없음.
        this.chunkConcurrency = 3;
        // 이번 iteration 에서 텍스트가 거의 안 줄었으면(95% 이상 잔존) 더 돌려도 의미 없으니 중단.
        this.noProgressRatio = 0.95;

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

            // no-progress 가드: 이번 패스에서 거의 안 줄었으면 더 돌려도 LLM 이 컨솔리데이션 못 한다는 신호.
            // 이전엔 maxIterations + 추가 final pass 까지 4번 헛돌고 끝났음. 일찍 손 털기.
            if (newLength >= currentLength * this.noProgressRatio) {
                console.warn(`[SummarizerLangGraph] no-progress 감지 (${currentLength} → ${newLength}, ${((newLength/currentLength)*100).toFixed(1)}%). 추가 iteration 중단.`);
                break;
            }
        }

        // 입력이 처음부터 chunkSize 이하인 경우에만 한 번 요약 패스. (텍스트는 그대로 두고 끝낼 수도 있지만,
        // 호출자는 라인 추적이 포함된 structuredResult 를 기대하므로 1회 요약 패스를 돌려준다.)
        // ⚠️ 과거에는 iteration 이 maxIterations 까지 갔는데도 길이가 안 줄면 여기서 한 번 더 final pass 를
        // 돌렸는데, 이미 비수렴이라는 신호인 상태에서 4번째 패스는 시간만 더 잡아먹고 효과 없었음. 제거.
        if (this.iterations === 0) {
            structuredResult = await this._processFirstIteration(structuredResult);
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
     * 단일 청크에 대한 Backend Job 생성 + 완료 대기.
     * 호출자는 chunkIndex/총개수만 넘기면 됨. 순서는 _processChunksParallel 가 인덱스로 보존.
     *
     * @param {Object} chunk - { numberedText: string, ... }
     * @param {number} chunkIndex - 0-based
     * @param {number} totalChunks
     * @param {number} iteration - prompt 메타 전송용
     * @param {boolean} verbose - 진행률/대기 로그 출력 여부 (iter 1 만 true 권장)
     * @returns {Promise<{summarizedRequirements: Array}>}
     */
    async _runChunkJob(chunk, chunkIndex, totalChunks, iteration, verbose) {
        const jobId = this._generateJobId();
        // 마지막으로 만든 jobId 도 보존 (stop() 등 외부 참조용)
        this.jobId = jobId;

        await SummarizerLangGraphProxy.makeNewJob(
            jobId,
            chunk.numberedText,
            iteration
        );

        return new Promise((resolve, reject) => {
            let hasResolved = false;

            SummarizerLangGraphProxy.watchJob(
                jobId,
                // onUpdate
                verbose ? (summaries, logs, progress) => {
                    console.log(`[SummarizerLangGraph] 청크 ${chunkIndex + 1}/${totalChunks} - Progress: ${progress}%`);
                } : () => {},
                // onComplete (summaries, logs, progress, isFailed)
                (summaries, logs, progress, isFailed) => {
                    if (hasResolved) return;
                    hasResolved = true;
                    if (verbose) {
                        console.log(`[SummarizerLangGraph] 청크 ${chunkIndex + 1}/${totalChunks} 완료: ${summaries ? summaries.length : 0}개 요약`);
                    }
                    resolve({ summarizedRequirements: summaries || [] });
                },
                // onWaiting
                verbose ? (waitingCount) => {
                    console.log(`[SummarizerLangGraph] 청크 ${chunkIndex + 1}/${totalChunks} 대기 중... Queue: ${waitingCount}`);
                } : () => {},
                // onFailed
                (error) => {
                    if (hasResolved) return;
                    hasResolved = true;
                    console.error(`[SummarizerLangGraph] 청크 ${chunkIndex + 1}/${totalChunks} 오류:`, error);
                    reject(new Error(error));
                }
            );
        });
    }

    /**
     * 청크 배열을 제한된 동시성으로 병렬 처리. 결과 순서는 인덱스 기준 보존.
     * 청크 1개라도 실패하면 즉시 throw (Promise.all 의 fail-fast 의미).
     */
    async _processChunksParallel(chunks, iteration, verbose) {
        const results = new Array(chunks.length);
        let nextIdx = 0;

        const worker = async () => {
            while (true) {
                const i = nextIdx++;
                if (i >= chunks.length) return;
                results[i] = await this._runChunkJob(chunks[i], i, chunks.length, iteration, verbose);
            }
        };

        const workerCount = Math.min(this.chunkConcurrency, chunks.length);
        await Promise.all(Array.from({ length: workerCount }, () => worker()));

        return results;
    }

    /**
     * 청크 결과 배열을 단일 structured result 로 병합.
     * 순서는 입력 그대로 — 라인 ref 가 그대로 유지되어야 하므로.
     */
    _combineChunkResults(chunkResults, logLabel) {
        const allSummaries = [];
        for (const chunkResult of chunkResults) {
            if (chunkResult && chunkResult.summarizedRequirements) {
                allSummaries.push(...chunkResult.summarizedRequirements);
            }
        }
        const result = { summarizedRequirements: allSummaries };
        console.log(`[SummarizerLangGraph] ✅ ${logLabel} 병합 완료: ${allSummaries.length}개 요약, 총 ${this._getCurrentTextLength(result)} 자`);
        return result;
    }

    /**
     * 첫 번째 Iteration 처리 (청크별로 Backend Job 생성)
     */
    async _processFirstIteration(structuredResult) {
        const chunks = this._prepareLineNumberedChunks(structuredResult);
        this.currentChunks = chunks;

        console.log(`[SummarizerLangGraph] 첫 번째 요약: ${chunks.length}개 청크, 동시성 ${this.chunkConcurrency}`);

        const chunkResults = await this._processChunksParallel(chunks, this.iterations, /*verbose*/ true);
        this.summarizedChunks = chunkResults;
        return this._combineChunkResults(chunkResults, '청크');
    }

    /**
     * 후속 Iteration 처리
     */
    async _processSubsequentIteration(structuredResult) {
        const chunks = this._prepareLineNumberedChunks(structuredResult);
        this.currentChunks = chunks;

        console.log(`[SummarizerLangGraph] Iteration ${this.iterations}: ${chunks.length}개 청크, 동시성 ${this.chunkConcurrency}`);

        const chunkResults = await this._processChunksParallel(chunks, this.iterations, /*verbose*/ false);
        this.summarizedChunks = chunkResults;
        return this._combineChunkResults(chunkResults, '후속');
    }

    /**
     * 최종 요약 처리 (현재는 summarizeRecursively 에서 호출하지 않음 — no-progress 가드 도입으로 비수렴
     * 시 추가 패스를 안 돌리도록 변경했음. 외부에서 직접 호출하는 경우를 대비해 정의는 유지.)
     */
    async _processFinalSummary(structuredResult) {
        console.log('[SummarizerLangGraph] 최종 요약 처리');
        const chunks = this._prepareLineNumberedChunks(structuredResult);
        this.currentChunks = chunks;

        const chunkResults = await this._processChunksParallel(chunks, this.iterations + 1, /*verbose*/ false);
        this.summarizedChunks = chunkResults;
        return this._combineChunkResults(chunkResults, '최종');
    }

    // (deprecated 호환용 — 외부 코드가 호출할 수도 있어 남겨둠. 신규 코드는 _combineChunkResults 사용.)
    _combineFirstIterationResults() {
        return this._combineChunkResults(this.summarizedChunks, '청크');
    }
    _combineSubsequentResults() {
        return this._combineChunkResults(this.summarizedChunks, '후속');
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

