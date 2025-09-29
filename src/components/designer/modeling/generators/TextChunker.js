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