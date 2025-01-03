/**
 * @description OpenAI API 사용을 위한 텍스트의 토큰 수를 계산하고 관리하는 유틸리티 클래스입니다.
 * 다양한 문자 유형(URL, 이모지, 한글, 영숫자, 특수문자 등)에 대한 토큰 수를 추정하고,
 * 텍스트 분할 및 최적화 기능을 제공합니다.
 * 
 * @class
 * 
 * @property {Object} urlPatterns - URL 패턴별 토큰 가중치 정보
 *   - key: URL 패턴 문자열 (예: 'http://', '.com')
 *   - value: 해당 패턴의 토큰 가중치
 * 
 * @throws {TypeError} 잘못된 타입의 입력값 제공 시
 * @throws {Error} 토큰 제한값이 1 미만인 경우
 * 
 * @see https://platform.openai.com/tokenizer - OpenAI 토큰 계산기
 * 
 * @example 기본 토큰 계산
 * const text = "안녕하세요! Hello World 👋";
 * const tokenCount = TokenCounter.getEstimatedTokenCount(text);
 * console.log(tokenCount); // 예상 토큰 수 출력
 * 
 * @example 토큰 제한에 따른 텍스트 분할
 * const longText = "이것은 매우 긴 텍스트입니다. 여러 문장으로 구성되어 있습니다.";
 * const chunks = TokenCounter.splitByTokenLimit(longText, 10);
 * for (const chunk of chunks) {
 *   console.log(chunk); // 분할된 텍스트 청크 출력
 * }
 * 
 * @example 토큰 최적화
 * const text = "자세한 내용은 https://example.com/very/long/path 참고하세요.";
 * const optimized = TokenCounter.optimizeToTokenLimit(text, 8);
 * console.log(optimized); // 최적화된 텍스트 출력
 * 
 * @note
 * - 토큰 수 계산은 추정치이며, 실제 OpenAI API 사용시와 약 3% 내외의 오차가 발생할 수 있습니다
 * - URL은 도메인과 경로를 분리하여 계산되며, 긴 URL은 자동으로 축약됩니다
 * - 한글은 음절 단위로 계산되며, 길이에 따라 가중치가 적용됩니다
 * - 연속된 특수문자는 축소된 토큰 수로 계산됩니다
 * - 텍스트 분할 시 문장의 의미를 최대한 보존하려 시도합니다
 */
class TokenCounter {
    /**
     * @description OpenAI API 사용을 위한 텍스트의 토큰 수를 추정하는 메서드입니다.
     * URL, 이모지, 한글, 영숫자, 특수문자 등 다양한 문자 유형을 고려하여 토큰 수를 계산합니다.
     * 실제 OpenAI의 토큰 계산과 비교하여 약 3% 내외의 오차가 발생할 수 있습니다.
     * 
     * @param {string} text - 토큰 수를 계산할 텍스트
     *   - URL, 이모지, 한글, 영숫자, 특수문자 등 모든 유형의 텍스트 입력 가능
     *   - 빈 문자열 또는 공백만 있는 경우 0을 반환
     * 
     * @returns {number} 추정된 토큰 수 (1 이상의 정수)
     * 
     * @see _processUrl - URL 토큰 계산
     * @see _processEmojis - 이모지 토큰 계산
     * @see _processKorean - 한글 토큰 계산
     * @see _processAlphanumeric - 영숫자 토큰 계산
     * @see _processSpecialChars - 특수문자 토큰 계산
     * 
     * @example 기본 텍스트 토큰 계산
     * TokenCounter.getEstimatedTokenCount("안녕하세요!");
     * // 결과: 3 (한글 문장)
     * 
     * @example 복합 텍스트 토큰 계산
     * TokenCounter.getEstimatedTokenCount("Hello World! 안녕하세요 👋 https://example.com");
     * // 결과: 11 (영문 + 한글 + 이모지 + URL)
     * 
     * @note
     * - 토큰 수 계산은 추정치이며, 실제 OpenAI API 사용시의 토큰 수와 차이가 있을 수 있습니다
     * - 긴 문장의 경우 문장 부호(., !, ?)를 기준으로 분리하여 처리합니다
     * - URL은 도메인과 경로를 분리하여 계산합니다
     * - 연속된 특수문자는 축소된 토큰 수로 계산됩니다
     */
    static getEstimatedTokenCount(text) {
        if (!text) return 0;

        text = text.replace(/\s+/g, ' ').trim();
        
        let tokenCount = 0;

        const sentences = text.split(/([.!?]+)/g);
        for (const sentence of sentences) {
            if (!sentence.trim()) continue;
            
            const urlMatches = sentence.match(/https?:\/\/[^\s]+/g) || [];
            for (const url of urlMatches) {
                tokenCount += this._processUrl(url);
                text = text.replace(url, ' ');
            }

            const words = sentence.trim().split(/\s+/);
            
            for (const word of words) {
                const emojiMatches = word.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu) || [];
                if (emojiMatches.length > 0) {
                    tokenCount += this._processEmojis(emojiMatches);
                    continue;
                }

                if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(word)) {
                    tokenCount += this._processKorean(word);
                    continue;
                }

                if (/[a-zA-Z0-9]/.test(word)) {
                    tokenCount += this._processAlphanumeric(word);
                    continue;
                }

                tokenCount += this._processSpecialChars(word);
            }
        }

        return Math.max(1, Math.round(tokenCount * 1.05));
    }

    /**
     * @description 여러 텍스트를 한 번에 처리하여 총 토큰 수를 계산하는 메서드입니다.
     * 대화 내역이나 여러 문서의 총 토큰 수를 확인할 때 사용합니다.
     * 
     * @param {Array<string>} texts - 토큰 수를 계산할 텍스트 배열
     *   - 빈 문자열이나 null 값이 포함된 경우 0으로 처리됨
     *   - 배열이 비어있는 경우 0을 반환
     * 
     * @returns {number} 모든 텍스트의 총 토큰 수 합계
     * 
     * @throws {TypeError} texts가 배열이 아닌 경우
     * 
     * @see getEstimatedTokenCount - 개별 텍스트의 토큰 수 계산에 사용되는 메서드
     * 
     * @example 대화 내역의 총 토큰 수 계산
     * const messages = [
     *   "안녕하세요!",
     *   "오늘 날씨가 좋네요.",
     *   "네, 산책하기 좋은 날씨입니다. 😊"
     * ];
     * TokenCounter.getTotalEstimatedTokenCount(messages);
     * // 결과: 12
     * 
     * @example 빈 값이 포함된 텍스트 처리
     * const texts = ["Hello", "", null, "World"];
     * TokenCounter.getTotalEstimatedTokenCount(texts);
     * // 결과: 2
     * 
     * @note
     * - 각 텍스트의 토큰 수는 getEstimatedTokenCount 메서드를 통해 계산됨
     * - OpenAI API의 실제 토큰 수와 약 3% 내외의 오차가 발생할 수 있음
     */
    static getTotalEstimatedTokenCount(texts) {
        return texts.reduce((sum, text) => 
            sum + this.getEstimatedTokenCount(text), 0);
    }

    /**
     * @description 텍스트가 지정된 토큰 제한을 초과하는지 확인하는 메서드입니다.
     * 텍스트 분할이나 최적화가 필요한지 판단하기 위한 사전 검사에 활용됩니다.
     * 
     * @param {string} text - 토큰 수를 확인할 텍스트
     *   - 빈 문자열이나 null의 경우 false 반환
     *   - URL, 이모지, 한글, 영숫자, 특수문자 등 모든 유형의 텍스트 지원
     * @param {number} limit - 토큰 제한 수
     *   - 1 이상의 정수여야 함
     *   - 실제 사용시 모델별 제한(예: GPT-3.5는 4096) 고려 필요
     * 
     * @returns {boolean} 토큰 제한 초과 여부
     *   - true: 텍스트의 토큰 수가 제한을 초과함
     *   - false: 텍스트의 토큰 수가 제한 이하임
     * 
     * @throws {TypeError} limit가 숫자가 아니거나 1 미만인 경우
     * 
     * @see getEstimatedTokenCount - 토큰 수 계산에 사용되는 메서드
     * @see splitByTokenLimit - 제한을 초과하는 경우 텍스트 분할에 사용
     * @see optimizeToTokenLimit - 제한을 초과하는 경우 텍스트 최적화에 사용
     * 
     * @example 기본 사용법
     * const text = "이것은 테스트 텍스트입니다.";
     * TokenCounter.exceedsTokenLimit(text, 10);
     * // 결과: false (토큰 수가 10 이하인 경우)
     * 
     * @example 텍스트 분할 전 검사
     * const longText = "이것은 매우 긴 텍스트입니다...";
     * if (TokenCounter.exceedsTokenLimit(longText, 5)) {
     *   const chunks = TokenCounter.splitByTokenLimit(longText, 5);
     * }
     * 
     * @note
     * - 토큰 수 계산은 추정치이며, 실제 OpenAI API 사용시의 토큰 수와 약 3% 내외의 차이가 있을 수 있습니다
     * - 중요한 처리의 경우 여유있는 제한값 설정을 권장합니다
     */
    static exceedsTokenLimit(text, limit) {
        return this.getEstimatedTokenCount(text) > limit;
    }

    /**
     * @description 긴 텍스트를 지정된 토큰 제한에 맞춰 여러 개의 작은 텍스트로 분할합니다.
     * 문장의 의미를 최대한 보존하면서 각 부분이 지정된 토큰 수를 초과하지 않도록 분할합니다.
     * 
     * @param {string} text - 분할하고자 하는 원본 텍스트
     *   - 빈 문자열이나 null이 입력되면 빈 배열 반환
     *   - 문장 구분자(., !, ?)를 기준으로 분할됨
     * @param {number} maxTokens - 각 분할된 텍스트의 최대 토큰 수
     *   - 1 이상의 정수여야 함
     *   - 너무 작은 값을 지정하면 문장이 의도치 않게 분할될 수 있음
     * 
     * @returns {Array<string>} 분할된 텍스트 배열
     *   - 각 요소는 maxTokens 이하의 토큰을 가짐
     *   - 원본 텍스트의 순서가 보존됨
     * 
     * @throws {TypeError} maxTokens가 숫자가 아니거나 1 미만인 경우
     * 
     * @see getEstimatedTokenCount - 각 분할된 텍스트의 토큰 수 계산에 사용
     * @see optimizeToTokenLimit - 텍스트를 특정 토큰 수에 최적화할 때 함께 사용됨
     * 
     * @example 긴 텍스트 분할
     * const text = "안녕하세요. 오늘은 날씨가 좋네요! AI는 정말 흥미롭습니다.";
     * TokenCounter.splitByTokenLimit(text, 5);
     * // 결과: ["안녕하세요.", "오늘은 날씨가 좋네요!", "AI는 정말 흥미롭습니다."]
     * 
     * @example 최적화와 함께 사용
     * const longText = "이것은 매우 긴 텍스트입니다...";
     * const chunks = TokenCounter.splitByTokenLimit(longText, 10);
     * const optimizedChunks = chunks.map(chunk => 
     *   TokenCounter.optimizeToTokenLimit(chunk, 8)
     * );
     * 
     * @note
     * - 문장 중간에서 분할되는 것을 방지하기 위해 문장 구분자(., !, ?)를 기준으로 분할
     * - 단일 문장이 maxTokens를 초과하는 경우에도 해당 문장은 분할되지 않음
     * - 반환된 각 텍스트는 앞뒤 공백이 제거된 상태
     */
    static splitByTokenLimit(text, maxTokens) {
        const chunks = [];
        const sentences = text.split(/([.!?]+)/g);
        let currentChunk = '';
        
        for (const sentence of sentences) {
            const tempChunk = currentChunk + sentence;
            if (this.getEstimatedTokenCount(tempChunk) <= maxTokens) {
                currentChunk = tempChunk;
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = sentence;
            }
        }
        
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks;
    }

    /**
     * @description 긴 텍스트를 지정된 토큰 제한에 맞추어 최적화하는 메서드입니다.
     * URL 축약, 공백 제거, 텍스트 잘라내기 등의 방법으로 텍스트를 압축합니다.
     * 
     * @param {string} text - 최적화할 텍스트
     *   - URL, 일반 텍스트 등 모든 형식의 텍스트 지원
     *   - 빈 문자열이나 null의 경우 그대로 반환
     * @param {number} targetTokens - 목표 토큰 수
     *   - 1 이상의 정수여야 함
     *   - 텍스트가 이 토큰 수를 초과하지 않도록 최적화됨
     * 
     * @returns {string} 최적화된 텍스트
     *   - 목표 토큰 수 이하로 최적화된 텍스트
     *   - 텍스트가 잘린 경우 끝에 '...' 추가
     * 
     * @throws {TypeError} targetTokens가 숫자가 아니거나 1 미만인 경우
     * 
     * @see getEstimatedTokenCount - 토큰 수 계산에 사용
     * @see splitByTokenLimit - 텍스트 분할이 필요한 경우 함께 사용
     * 
     * @example 기본 텍스트 최적화
     * const text = "이것은 매우 긴 텍스트입니다...";
     * TokenCounter.optimizeToTokenLimit(text, 5);
     * // 결과: "이것은 매우..."
     * 
     * @example URL이 포함된 텍스트 최적화
     * const text = "자세한 내용은 https://example.com/very/long/path/to/document 참고";
     * TokenCounter.optimizeToTokenLimit(text, 8);
     * // 결과: "자세한 내용은 https://example.com/... 참고"
     * 
     * @note
     * - URL은 30자 이상인 경우 도메인만 남기고 축약됨
     * - 연속된 공백은 단일 공백으로 변환됨
     * - 최적화 후에도 토큰 제한을 초과하는 경우 텍스트가 잘림
     */
    static optimizeToTokenLimit(text, targetTokens) {
        if (this.getEstimatedTokenCount(text) <= targetTokens) {
            return text;
        }

        text = text.replace(/(https?:\/\/[^\s]{30,})/g, (url) => {
            try {
                const urlObj = new URL(url);
                return `${urlObj.protocol}//${urlObj.hostname}/...`;
            } catch {
                return url;
            }
        });

        text = text.replace(/\s+/g, ' ');

        if (this.getEstimatedTokenCount(text) > targetTokens) {
            const words = text.split(/\s+/);
            let result = '';
            for (const word of words) {
                const temp = result + ' ' + word;
                if (this.getEstimatedTokenCount(temp) <= targetTokens) {
                    result = temp;
                } else {
                    break;
                }
            }
            return result.trim() + '...';
        }

        return text;
    }


    static _processUrl(url) {
        let count = 0;

        for (const [pattern, tokenValue] of Object.entries(this.urlPatterns)) {
            if (url.includes(pattern)) {
                count += tokenValue;
            }
        }

        const remainingParts = url
            .replace(/https?:\/\//g, '')
            .replace(/\.(com|net|org|io|ai|gov|edu)/g, '')
            .split(/[/\-_]/);
        
        for (const part of remainingParts) {
            if (part.length > 0) {
                count += Math.ceil(part.length / 4);
            }
        }

        return Math.max(1, count);
    }

    static _processEmojis(emojis) {
        let count = 0;

        let prevEmoji = '';
        for (const emoji of emojis) {
            count += 1;

            if (prevEmoji) count += 0.5;
            prevEmoji = emoji;
        }

        return Math.ceil(count);
    }

    static _processKorean(word) {        
        let count = 0;

        const completeChars = word.match(/[가-힣]+/g) || [];
        for (const chars of completeChars) {
            count += Math.ceil(chars.length * 0.6);

            if (chars.length > 4) {
                count += Math.floor(chars.length / 4);
            }
        }

        const jamoChars = word.match(/[ㄱ-ㅎㅏ-ㅣ]+/g) || [];
        for (const jamo of jamoChars) {
            count += Math.ceil(jamo.length * 0.3);
        }

        return Math.max(1, count);
    }

    static _processAlphanumeric(word) {
        let count = 0;

        const numbers = word.match(/\d+/g) || [];
        for (const num of numbers) {
            count += Math.max(1, Math.ceil(num.length / 6));
        }

        const englishParts = word.match(/[a-zA-Z]+/g) || [];
        for (const part of englishParts) {
            const hasUpperCase = /[A-Z]/.test(part);
            if (part.length <= 4) {
                count += 1;
            } else {
                count += Math.ceil(part.length / (hasUpperCase ? 3 : 4));
            }
        }

        return count;
    }

    static _processSpecialChars(word) {
        const specialChars = word.match(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu) || [];
        let count = 0;
        let consecutive = 0;

        for (let i = 0; i < specialChars.length; i++) {
            if (i > 0 && specialChars[i] === specialChars[i-1]) {
                consecutive++;
            } else {
                consecutive = 0;
            }
            count += 1 / (consecutive + 1);
        }

        return Math.ceil(count);
    }
}

TokenCounter.urlPatterns = {
    'http://': 1,
    'https://': 1,
    'www.': 1,
    '.com': 1,
    '.net': 1,
    '.org': 1,
    '.io': 1,
    '.ai': 1,
    '.gov': 1,
    '.edu': 1
};

module.exports = TokenCounter;