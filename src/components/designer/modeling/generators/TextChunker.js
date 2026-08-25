class TextChunker {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 6000;
        this.spareSize = options.spareSize || 1000; // system prompt 크기로 인한 여유 size
    }

    /**
     * 텍스트를 의미 있는 청크로 분할
     * @param {string} text - 분할할 텍스트
     * @returns {Array<string>} 청크 배열
     */
    splitIntoChunks(text) {
        // 문장 단위로 분할 (마침표, 느낌표, 물음표, 세미콜론 기준)
        const segments = text.split(/(?<=;)|(?<=[.!?])/).map(s => s.trim()).filter(s => s);
        const chunks = [];
        let currentChunk = '';
        let overlapText = '';
        let isCurrentlyDDL = false;
        
        for (const segment of segments) {
            const isDDL = segment.trim().toUpperCase().startsWith('CREATE TABLE');
            
            // 시나리오에서 DDL로 전환되는 경우에만 청크 분리
            if (isDDL && !isCurrentlyDDL && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = segment;
                isCurrentlyDDL = true;
                continue;
            }
            
            // 청크 사이즈 체크
            if ((currentChunk + segment).length > this.chunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    const lastSentences = this.getLastSentences(currentChunk, this.spareSize);
                    overlapText = lastSentences;
                    currentChunk = overlapText + ' ' + segment;
                } else {
                    currentChunk = segment;
                }
            } else {
                currentChunk += (currentChunk ? ' ' : '') + segment;
            }
            
            isCurrentlyDDL = isDDL;
        }
        
        // 마지막 청크 처리
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    /**
     * 텍스트를 라인 단위로 청크로 분할하고 시작 라인 번호를 함께 반환
     * @param {string} text - 분할할 텍스트
     * @returns {Array<{text: string, startLine: number}>} 청크 배열 (텍스트와 시작 라인 번호 포함)
     */
    splitIntoChunksByLine(text) {
        // US-단위 경계 인식: '##### [PROJ-US-FR/NFR-XXX]' 같은 user story 헤더.
        // 이런 헤더가 있으면 US-단위로 묶어 청크를 나눈다 → mid-story 분할/overlap 누출 제거.
        // (overlap 기반 line 청킹은 한 story 의 끝 줄이 다음 청크에 반복되어, 인접 BC 로
        //  이벤트가 1개씩 새는 off-by-one 누출의 원인이었음.)
        const usHeaderRe = /^\s*#{4,6}\s+\[(?:[A-Za-z][\w-]*-)?US-(?:FR|NFR)-\d+\]/;
        const allLines = text.split('\n');
        if (allLines.some(l => usHeaderRe.test(l))) {
            return this._splitIntoChunksByUserStory(text, usHeaderRe);
        }
        // US 헤더가 없는 비표준 입력 → 기존 line+overlap 방식 유지 (backward-compat)
        return this._splitIntoChunksByLineRaw(text);
    }

    /**
     * US-단위(`##### [PROJ-US-FR/NFR-XXX]` 블록)로 청크 분할.
     * - 첫 US 헤더 이전(목차/개요 preamble)은 하나의 unit.
     * - 각 US 헤더에서 새 unit 시작, 다음 US 헤더 직전까지가 한 블록.
     * - unit 은 절대 쪼개지 않고, overlap 없이 chunkSize 까지 greedy 하게 묶음.
     *   (한 unit 이 chunkSize 를 넘으면 그 unit 단독 청크 — story 를 쪼개는 것보다 나음.)
     * - 라인이 연속이라 startLine 기반 traceMap 좌표가 그대로 유지됨.
     */
    _splitIntoChunksByUserStory(text, usHeaderRe) {
        const lines = text.split('\n');
        const units = []; // [{ startLine, lines:[...] }]
        let cur = null;
        for (let i = 0; i < lines.length; i++) {
            if (usHeaderRe.test(lines[i])) {
                if (cur) units.push(cur);
                cur = { startLine: i + 1, lines: [] };
            } else if (!cur) {
                cur = { startLine: i + 1, lines: [] }; // preamble
            }
            cur.lines.push(lines[i]);
        }
        if (cur) units.push(cur);

        const chunks = [];
        let buf = null; // { startLine, text }
        for (const u of units) {
            const uText = u.lines.join('\n');
            if (buf && (buf.text.length + 1 + uText.length) > this.chunkSize) {
                chunks.push({ text: buf.text, startLine: buf.startLine });
                buf = null;
            }
            if (!buf) {
                buf = { startLine: u.startLine, text: uText };
            } else {
                buf.text += '\n' + uText;
            }
        }
        if (buf) chunks.push({ text: buf.text, startLine: buf.startLine });
        return chunks;
    }

    /** 기존 line+overlap 청킹 (US 헤더 없는 입력용 fallback) */
    _splitIntoChunksByLineRaw(text) {
        const lines = text.split('\n');
        const chunks = [];
        let currentChunk = '';
        let currentStartLine = 1;
        let currentLineCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineWithNewline = i < lines.length - 1 ? line + '\n' : line;
            
            // 청크 사이즈 체크
            if ((currentChunk + lineWithNewline).length > this.chunkSize && currentChunk) {
                // 현재 청크를 저장
                chunks.push({
                    text: currentChunk,
                    startLine: currentStartLine
                });
                
                // 중첩(overlap) 처리: 마지막 몇 줄을 다음 청크 시작에 포함
                const overlapLines = this.getLastLines(currentChunk, this.spareSize);
                const overlapLineCount = overlapLines.split('\n').length - 1; // 마지막 빈 줄 제외
                
                currentChunk = overlapLines + lineWithNewline;
                currentStartLine = currentStartLine + currentLineCount - overlapLineCount;
                currentLineCount = overlapLineCount + 1;
            } else {
                currentChunk += lineWithNewline;
                if (currentLineCount === 0) {
                    currentStartLine = i + 1; // 라인 번호는 1부터 시작
                }
                currentLineCount++;
            }
        }
        
        // 마지막 청크 처리
        if (currentChunk.trim()) {
            chunks.push({
                text: currentChunk,
                startLine: currentStartLine
            });
        }
        
        return chunks;
    }

    // 지정된 크기만큼의 마지막 문장들을 가져오는 헬퍼 메서드
    getLastSentences(text, targetSize) {
        const sentences = text.split(/(?<=;)|(?<=[.!?])/).map(s => s.trim()).filter(s => s);
        let result = '';
        
        for (let i = sentences.length - 1; i >= 0; i--) {
            const sentence = sentences[i];
            if ((result + sentence).length > targetSize) {
                break;
            }
            result = sentence + ' ' + result;
        }
        
        return result.trim();
    }

    /**
     * 지정된 크기만큼의 마지막 라인들을 가져오는 헬퍼 메서드
     * @param {string} text - 텍스트
     * @param {number} targetSize - 목표 크기
     * @returns {string} 마지막 라인들
     */
    getLastLines(text, targetSize) {
        const lines = text.trimEnd().split('\n'); // 마지막에 \n이 있을 경우, \n\n으로 의도치 않은 추가가 발생할 수 있음
        let result = '';
        
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            const lineWithNewline = i > 0 ? line + '\n' : line;
            if ((result + lineWithNewline).length > targetSize) {
                break;
            }
            result = lineWithNewline + result;
        }
        
        return result;
    }

    /**
     * 청크 후처리 (너무 작은 청크 병합 등)
     * @param {Array<string>} chunks - 처리할 청크 배열
     * @returns {Array<string>} 처리된 청크 배열
     */
    postProcessChunks(chunks) {
        const minChunkSize = this.chunkSize * 0.3; // 최소 청크 크기
        const processedChunks = [];
        let currentChunk = '';

        for (const chunk of chunks) {
            if (currentChunk && (currentChunk + ' ' + chunk).length < this.chunkSize) {
                currentChunk += ' ' + chunk;
            } else {
                if (currentChunk) {
                    processedChunks.push(currentChunk);
                }
                currentChunk = chunk;
            }
        }

        if (currentChunk) {
            // 마지막 청크가 너무 작으면 이전 청크와 병합
            if (currentChunk.length < minChunkSize && processedChunks.length > 0) {
                const lastChunk = processedChunks.pop();
                processedChunks.push(lastChunk + ' ' + currentChunk);
            } else {
                processedChunks.push(currentChunk);
            }
        }

        return processedChunks;
    }

    /**
     * 청크의 통계 정보 반환
     * @param {Array<string>} chunks - 분석할 청크 배열
     * @returns {Object} 통계 정보
     */
    getChunkStats(chunks) {
        return {
            totalChunks: chunks.length,
            chunkSizes: chunks.map(chunk => chunk.length),
            averageSize: chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length,
            maxSize: Math.max(...chunks.map(chunk => chunk.length)),
            minSize: Math.min(...chunks.map(chunk => chunk.length))
        };
    }
}

module.exports = TextChunker;
