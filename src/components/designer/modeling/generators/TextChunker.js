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
        // 문장 단위로 분할 (마침표, 느낌표, 물음표 기준)
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';
        let overlapText = '';  // 오버랩될 텍스트 저장
        
        for (const sentence of sentences) {
            // 현재 청크에 새 문장을 추가했을 때의 길이 확인
            if ((currentChunk + sentence).length > this.chunkSize) {
                if (currentChunk) {
                    // 현재 청크를 저장하고, 마지막 부분을 오버랩 텍스트로 저장
                    chunks.push(currentChunk.trim());
                    
                    // 마지막 문장들을 오버랩 텍스트로 설정
                    const lastSentences = this.getLastSentences(currentChunk, this.spareSize);
                    overlapText = lastSentences;
                    
                    // 새로운 청크는 오버랩 텍스트로 시작
                    currentChunk = overlapText + ' ' + sentence;
                } else {
                    currentChunk = sentence;
                }
            } else {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
        }
        
        // 마지막 청크 처리
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    // 지정된 크기만큼의 마지막 문장들을 가져오는 헬퍼 메서드
    getLastSentences(text, targetSize) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
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