/**
 * @description AI 모델별 텍스트 토큰화 및 토큰 수 관리를 위한 유틸리티 클래스입니다.
 * 다양한 AI 모델(GPT-4, GPT-3.5 등)에 대한 토큰 수 계산, 텍스트 분할, 
 * 토큰 제한 관리 등의 기능을 제공합니다.
 * 
 * @class
 * 
 * @property {Object} encoderMap - AI 모델별 토큰화 인코더 매핑
 *   - key: 모델 패턴 (정규식 문자열)
 *   - value: 해당 모델의 토큰화 인코더
 * 
 * @throws {Error} 텍스트 인코딩 과정에서 오류 발생 시
 * @throws {Error} 잘못된 입력값이 제공된 경우
 * @throws {Error} 토큰 분할 시 중복 크기가 청크 크기보다 큰 경우
 * 
 * @see o200k_base - 기본 토큰화 인코더
 * @see cl100k_base - GPT-4/3.5 토큰화 인코더
 * @see p50k_base - GPT-3 토큰화 인코더
 * 
 * @example 기본 토큰 수 계산
 * // 단일 텍스트의 토큰 수 계산
 * const text = "안녕하세요, AI의 세계에 오신 것을 환영합니다!";
 * const tokenCount = TokenCounter.getTokenCount(text, "gpt-4o");
 * console.log(tokenCount); // 예상 출력: 13
 * 
 * @example 텍스트 분할 및 토큰 제한 관리
 * // 긴 텍스트를 토큰 제한에 맞게 분할
 * const longText = "긴 문서의 내용...";
 * const chunks = TokenCounter.splitByTokenLimit(longText, "gpt-3.5-turbo", 1000, 100);
 * 
 * // 토큰 제한 확인
 * const isWithin = TokenCounter.isWithinTokenLimit(text, "gpt-4o", 2000);
 * 
 * // 토큰 제한에 맞게 텍스트 자르기
 * const truncated = TokenCounter.truncateToTokenLimit(text, "gpt-4o", 50, {
 *   addEllipsis: true,
 *   preserveSentences: true
 * });
 * 
 * @note
 * - 모든 메서드는 정적(static) 메서드로 제공됩니다
 * - 같은 텍스트도 AI 모델에 따라 토큰 수가 다를 수 있습니다
 * - 토큰 수 계산 시 항상 정확한 모델명을 지정해야 합니다
 * - 대용량 텍스트 처리 시 메모리 사용량에 주의가 필요합니다
 * - 텍스트 분할 시 문맥 유지를 위해 오버랩 기능을 활용할 수 있습니다
 */
class TokenCounter {
    /**
     * @description 주어진 텍스트의 토큰 수를 계산하는 메서드입니다.
     * AI 모델별로 서로 다른 토큰화 방식을 사용하여 정확한 토큰 수를 계산합니다.
     * 토큰 수 제한이 있는 API 호출 전에 텍스트의 토큰 수를 미리 확인하는 데 활용할 수 있습니다.
     * 
     * @param {string} text - 토큰 수를 계산할 텍스트
     *   - 빈 문자열도 유효한 입력으로 처리됩니다
     * @param {string} model - 사용할 AI 모델명
     *   - 지원 모델: gpt-4o, o1, gpt-4, gpt-3.5, gpt-3, text-davinci-002/003 등
     *   - 알 수 없는 모델의 경우 기본 o200k_base 인코더가 사용됨
     * 
     * @returns {number} 계산된 토큰 수
     * 
     * @throws {Error} 텍스트 인코딩 과정에서 오류가 발생한 경우
     * 
     * @see TokenCounter.getTotalTokenCount - 여러 텍스트의 총 토큰 수 계산
     * @see TokenCounter.isWithinTokenLimit - 토큰 제한 확인
     * @see TokenCounter._getEncoderForModel - 모델별 인코더 선택
     * 
     * @example 기본 토큰 수 계산
     * const tokenCount = TokenCounter.getTokenCount("Hello, World!", "gpt-4o");
     * console.log(tokenCount); // 예: 4
     * 
     * @example 다양한 모델에 대한 토큰 수 계산
     * const text = "AI is transforming the world";
     * console.log(TokenCounter.getTokenCount(text, "gpt-4o")); // GPT-4 모델 기준
     * console.log(TokenCounter.getTokenCount(text, "gpt-3.5-turbo")); // GPT-3 모델 기준
     * 
     * @note
     * - 같은 텍스트라도 모델에 따라 토큰 수가 다를 수 있습니다
     * - 정확한 토큰 수 계산을 위해 올바른 모델명을 지정하는 것이 중요합니다
     */
    static getTokenCount(text, model) {
        try {
            const encoder = this._getEncoderForModel(model);
            return encoder.encode(text).length;
        } catch (error) {
            console.error(`Error counting tokens: ${error.message}`);
            throw error;
        }
    }

    /**
     * @description 여러 텍스트의 총 토큰 수를 계산하는 메서드입니다.
     * 채팅 메시지나 문서 청크와 같이 여러 텍스트의 결합된 토큰 수를 확인할 때 유용합니다.
     * 
     * @param {Array<string>} texts - 토큰 수를 계산할 텍스트 배열
     *   - 각 요소는 비어있지 않은 문자열이어야 합니다
     *   - 빈 배열도 유효한 입력으로 처리됩니다
     * @param {string} model - 사용할 AI 모델명
     *   - 지원 모델: gpt-4o, o1, gpt-4, gpt-3.5, gpt-3, text-davinci-002/003 등
     *   - 알 수 없는 모델의 경우 기본 o200k_base 인코더가 사용됨
     * 
     * @returns {number} 모든 텍스트의 총 토큰 수
     * 
     * @throws {Error} 텍스트 인코딩 과정에서 오류가 발생한 경우
     * @throws {TypeError} texts가 배열이 아니거나, 배열 요소가 문자열이 아닌 경우
     * 
     * @see TokenCounter.getTokenCount - 단일 텍스트의 토큰 수 계산
     * @see TokenCounter.isWithinTokenLimit - 토큰 제한 확인
     * 
     * @example 채팅 메시지의 총 토큰 수 계산
     * const messages = [
     *   "안녕하세요!",
     *   "오늘 날씨가 좋네요.",
     *   "산책하기 좋은 날입니다."
     * ];
     * const totalTokens = TokenCounter.getTotalTokenCount(messages, "gpt-4o");
     * console.log(totalTokens); // 예: 25
     * 
     * @example 문서 청크의 토큰 수 계산
     * const documentChunks = [
     *   "첫 번째 문단입니다.",
     *   "두 번째 문단의 내용입니다.",
     *   "마지막 문단이 됩니다."
     * ];
     * console.log(TokenCounter.getTotalTokenCount(documentChunks, "gpt-3.5-turbo")); // 예: 30
     * 
     * @note
     * - 총 토큰 수는 각 텍스트의 토큰 수의 합으로 계산됩니다
     * - 모델에 따라 같은 텍스트도 다른 토큰 수를 가질 수 있습니다
     * - 대량의 텍스트를 처리할 때는 메모리 사용량에 주의해야 합니다
     */
    static getTotalTokenCount(texts, model) {
        return texts.reduce((total, text) => total + this.getTokenCount(text, model), 0);
    }

    /**
     * @description 주어진 텍스트가 지정된 토큰 제한을 초과하지 않는지 확인하는 메서드입니다.
     * API 호출이나 텍스트 처리 전에 토큰 제한을 미리 확인하는 데 활용할 수 있습니다.
     * 
     * @param {string} text - 토큰 수를 확인할 텍스트
     *   - 빈 문자열도 유효한 입력으로 처리됩니다
     * @param {string} model - 사용할 AI 모델명
     *   - 지원 모델: gpt-4o, o1, gpt-4, gpt-3.5, gpt-3, text-davinci-002/003 등
     *   - 알 수 없는 모델의 경우 기본 o200k_base 인코더가 사용됨
     * @param {number} maxTokens - 최대 허용 토큰 수
     *   - 양의 정수여야 합니다
     * 
     * @returns {boolean} 토큰 수가 제한 이내이면 true, 초과하면 false
     * 
     * @throws {Error} 텍스트 인코딩 과정에서 오류가 발생한 경우
     * 
     * @see TokenCounter.getTokenCount - 토큰 수 계산
     * @see TokenCounter.truncateToTokenLimit - 토큰 제한에 맞게 텍스트 자르기
     * @see TokenCounter.splitByTokenLimit - 토큰 제한에 맞게 텍스트 분할
     * 
     * @example 기본 토큰 제한 확인
     * const text = "안녕하세요, AI의 세계에 오신 것을 환영합니다!";
     * const isWithin = TokenCounter.isWithinTokenLimit(text, "gpt-4o", 10);
     * console.log(isWithin); // false
     * 
     * @example API 호출 전 토큰 제한 확인
     * const prompt = "긴 프롬프트 텍스트...";
     * if (TokenCounter.isWithinTokenLimit(prompt, "gpt-3.5-turbo", 4096)) {
     *   // API 호출 진행
     * } else {
     *   // 텍스트 축소 또는 분할 처리
     * }
     * 
     * @note
     * - 같은 텍스트라도 모델에 따라 토큰 수가 다를 수 있으므로 정확한 모델 지정이 중요합니다
     * - 토큰 제한 초과 시 truncateToTokenLimit 또는 splitByTokenLimit 메서드 사용을 고려하세요
     */
    static isWithinTokenLimit(text, model, maxTokens) {
        return this.getTokenCount(text, model) <= maxTokens;
    }

    /**
     * @description 긴 텍스트를 지정된 토큰 수로 나누어 청크(chunks)로 분할하는 메서드입니다.
     * 대량의 텍스트를 AI 모델의 토큰 제한에 맞게 처리할 때 유용하며,
     * 오버랩 기능을 통해 청크 간의 문맥을 유지할 수 있습니다.
     * 
     * @param {string} text - 분할할 텍스트
     *   - 빈 문자열도 유효한 입력으로 처리됩니다
     * @param {string} model - 사용할 AI 모델명
     *   - 지원 모델: gpt-4o, o1, gpt-4, gpt-3.5, gpt-3, text-davinci-002/003 등
     *   - 알 수 없는 모델의 경우 기본 o200k_base 인코더가 사용됨
     * @param {number} maxTokensPerChunk - 각 청크의 최대 토큰 수
     *   - 양의 정수여야 합니다
     * @param {number} [overlap=0] - 연속된 청크 간에 중복될 토큰 수
     *   - 문맥 유지를 위해 청크 간에 중복되는 토큰 수를 지정
     *   - maxTokensPerChunk보다 작아야 합니다
     * 
     * @returns {Array<string>} 분할된 텍스트 청크들의 배열
     * 
     * @throws {Error} overlap이 maxTokensPerChunk보다 크거나 같은 경우
     * 
     * @see TokenCounter.getTokenCount - 토큰 수 계산
     * @see TokenCounter.isWithinTokenLimit - 토큰 제한 확인
     * @see TokenCounter.truncateToTokenLimit - 토큰 제한에 맞게 텍스트 자르기
     * 
     * @example 기본 텍스트 분할
     * const longText = "긴 문서 내용...";
     * const chunks = TokenCounter.splitByTokenLimit(longText, "gpt-4o", 1000);
     * chunks.forEach(chunk => {
     *   // 각 청크 처리
     *   console.log(chunk);
     * });
     * 
     * @example 오버랩을 사용한 문맥 유지 분할
     * const text = "복잡한 기술 문서...";
     * const chunks = TokenCounter.splitByTokenLimit(text, "gpt-3.5-turbo", 2000, 200);
     * // 각 청크는 이전 청크와 200토큰이 중복되어 문맥 유지
     * 
     * @note
     * - 오버랩을 사용하면 청크 간의 문맥은 유지되지만 총 토큰 사용량이 증가합니다
     * - 마지막 청크는 maxTokensPerChunk보다 작을 수 있습니다
     * - 모델별로 토큰화 방식이 다르므로, 동일한 텍스트도 모델에 따라 다르게 분할될 수 있습니다
     */
    static splitByTokenLimit(text, model, maxTokensPerChunk, overlap = 0) {
        if (overlap >= maxTokensPerChunk) {
            throw new Error('Overlap size must be less than maxTokensPerChunk');
        }

        const encoder = this._getEncoderForModel(model);
        const tokens = encoder.encode(text);
        const chunks = [];
        
        const step = maxTokensPerChunk - overlap;
        
        for (let i = 0; i < tokens.length; i += step) {
            const chunkTokens = tokens.slice(i, i + maxTokensPerChunk);
            chunks.push(encoder.decode(chunkTokens));
        }
        
        return chunks;
    }

    /**
     * @description 긴 텍스트를 지정된 토큰 제한에 맞게 잘라내는 메서드입니다.
     * 텍스트의 끝에 생략 부호를 추가하고, 문장 단위로 자르는 등의 옵션을 제공합니다.
     * AI 모델의 토큰 제한을 준수하면서 자연스러운 텍스트 처리가 필요할 때 사용합니다.
     * 
     * @param {string} text - 잘라낼 텍스트
     *   - 비어있지 않은 문자열이어야 합니다
     * @param {string} model - 사용할 AI 모델명
     *   - 지원 모델: gpt-4o, o1, gpt-4, gpt-3.5, gpt-3, text-davinci-002/003 등
     * @param {number} maxTokens - 최대 허용 토큰 수
     *   - 1 이상의 정수여야 합니다
     * @param {Object} [options] - 텍스트 자르기 옵션
     * @param {boolean} [options.addEllipsis=true] - 잘린 텍스트 끝에 '...' 추가 여부
     * @param {boolean} [options.preserveSentences=true] - 문장 단위로 자르기 여부
     * @param {boolean} [options.debug=false] - 디버그 정보 출력 여부
     * 
     * @returns {string} 토큰 제한에 맞게 잘린 텍스트
     * 
     * @throws {Error} text가 유효하지 않은 경우
     * @throws {Error} maxTokens가 1 미만인 경우
     * 
     * @see TokenCounter.getTokenCount - 토큰 수 계산
     * @see TokenCounter.isWithinTokenLimit - 토큰 제한 확인
     * @see TokenCounter.splitByTokenLimit - 텍스트를 여러 청크로 분할
     * 
     * @example 기본 텍스트 자르기
     * const longText = "이것은 매우 긴 텍스트입니다. 문장이 계속 이어집니다. 끝이 어디일까요?";
     * const truncated = TokenCounter.truncateToTokenLimit(longText, "gpt-4o", 10);
     * console.log(truncated); 
     * // 출력: "이것은 매우 긴..."
     * // 토큰 수: 10 (원본: 25)
     * 
     * @example 고급 옵션 활용
     * const text = "첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.";
     * 
     * // 1. 기본 옵션 (문장 보존 + 생략 부호)
     * console.log(TokenCounter.truncateToTokenLimit(text, "gpt-3.5-turbo", 15));
     * // 출력: "첫 번째 문장입니다. 두 번째 문장입니다..."
     * 
     * // 2. 문장 보존 없이 자르기
     * console.log(TokenCounter.truncateToTokenLimit(text, "gpt-3.5-turbo", 15, {
     *   preserveSentences: false
     * }));
     * // 출력: "첫 번째 문장입니다. 두 번..."
     * 
     * // 3. 생략 부호 없이 문장 단위로 자르기
     * console.log(TokenCounter.truncateToTokenLimit(text, "gpt-3.5-turbo", 15, {
     *   addEllipsis: false,
     *   preserveSentences: true
     * }));
     * // 출력: "첫 번째 문장입니다. 두 번째 문장입니다."
     * 
     * // 4. 디버그 모드 활용
     * TokenCounter.truncateToTokenLimit(text, "gpt-3.5-turbo", 15, {
     *   debug: true
     * });
     * // 콘솔 출력:
     * // {
     * //   originalLength: 28,
     * //   truncatedLength: 15,
     * //   maxTokens: 15,
     * //   preservedSentences: true,
     * //   hasEllipsis: true
     * // }
     * 
     * @note
     * - preserveSentences가 true일 때는 문장이 중간에 잘리지 않습니다
     * - addEllipsis 옵션 사용 시 '...'의 토큰 수도 maxTokens에 포함됩니다
     * - debug 모드에서는 원본 길이, 잘린 길이 등의 상세 정보를 확인할 수 있습니다
     */
    static truncateToTokenLimit(text, model, maxTokens, options = {}) {
        const {
            addEllipsis = true,
            preserveSentences = true,
            debug = false
        } = options;


        if (!text || typeof text !== 'string') {
            throw new Error('Invalid input: text must be a non-empty string');
        }
        if (maxTokens < 1) {
            throw new Error('maxTokens must be a positive number');
        }

        const encoder = this._getEncoderForModel(model);
        const tokens = encoder.encode(text);
        
        if (tokens.length <= maxTokens) {
            return text;
        }


        const ellipsisTokens = addEllipsis ? encoder.encode('...').length : 0;
        const effectiveMaxTokens = maxTokens - ellipsisTokens;

        let truncatedTokens = tokens.slice(0, effectiveMaxTokens);
        let truncatedText = encoder.decode(truncatedTokens);


        if (preserveSentences) {
            const sentenceEndRegex = /[.!?][^.!?]*$/;
            const lastSentenceMatch = truncatedText.match(sentenceEndRegex);
            if (lastSentenceMatch) {
                truncatedText = truncatedText.slice(0, lastSentenceMatch.index + 1);
            }
        }

        if (addEllipsis) {
            truncatedText += '...';
        }


        if (debug) {
            console.log({
                originalLength: tokens.length,
                truncatedLength: encoder.encode(truncatedText).length,
                maxTokens,
                preservedSentences: preserveSentences,
                hasEllipsis: addEllipsis
            });
        }

        return truncatedText;
    }


    static _getEncoderForModel(model) {
        const encoderMap = {
            '^(gpt-4o|o1)': 'o200k_base',
            '^(gpt-4|gpt-3.5)': 'cl100k_base',
            '^(text-davinci-00[23]|gpt-3)': 'p50k_base',
            '(edit-001|davinci-edit)': 'p50k_edit',
            '(gpt-2|codegpt)': 'r50k_base'
        };

        let encoderName = 'o200k_base';
        let matched = false;

        for (const [pattern, name] of Object.entries(encoderMap)) {
            if (new RegExp(pattern, 'i').test(model)) {
                encoderName = name;
                matched = true;
                break;
            }
        }

        if (!matched) {
            console.warn(`Warning: Unknown model "${model}". Using default o200k_base encoder.`);
        }


        if (this._encoderCache.has(encoderName)) {
            return this._encoderCache.get(encoderName);
        }

        try {
            const encoder = require(`./encoders/${encoderName}.legacy`);
            this._encoderCache.set(encoderName, encoder);
            return encoder;
        } catch (error) {
            console.error(`Failed to load encoder ${encoderName}:`, error);
            throw error;
        }
    }
}

TokenCounter._encoderCache = new Map();

module.exports = TokenCounter;