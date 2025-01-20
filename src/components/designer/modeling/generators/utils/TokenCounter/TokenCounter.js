const { encoderMap, defaultEncoder } = require("./constants");
const { getEncoder } = require("./externals");

/**
 * @description AI 모델에 전송되는 텍스트의 토큰 수를 계산하고 관리하는 유틸리티 클래스입니다.
 * 주요 기능으로는 토큰 수 계산, 텍스트 분할, 토큰 제한 확인 등이 있으며,
 * AI 모델의 컨텍스트 크기 제한을 준수하면서 효율적인 텍스트 처리를 지원합니다.
 * 
 * @example 기본적인 토큰 수 계산 및 제한 확인
 * // 텍스트의 토큰 수를 계산하고 모델 제한을 확인
 * const text = "분석할 텍스트 내용...";
 * const tokenCount = TokenCounter.getTokenCount(text, "gpt-4");
 * const isValid = TokenCounter.isWithinTokenLimit(text, "gpt-4", 4000);
 * // 주의: 모델명이 잘못되면 기본 인코더(o200k_base)가 사용됨
 * 
 * @example 대용량 텍스트 처리를 위한 청크 분할
 * // 긴 텍스트를 처리 가능한 크기로 분할
 * const longText = "매우 긴 문서 내용...";
 * const chunks = TokenCounter.splitByTokenLimit(longText, "gpt-4", 3000, 200);
 * chunks.forEach(chunk => {
 *   // 각 청크 처리 로직
 * });
 * // 주의: overlap 값이 너무 크면 처리 효율성이 떨어질 수 있음
 * 
 * @example 토큰 제한에 맞춘 텍스트 축소
 * // 텍스트를 지정된 토큰 수로 제한
 * const options = {
 *   addEllipsis: true,       // 말줄임표 추가
 *   preserveSentences: true, // 문장 단위 보존
 *   debug: true             // 디버그 정보 출력
 * };
 * const truncated = TokenCounter.truncateToTokenLimit(text, "gpt-4", 1000, options);
 * // 주의: preserveSentences 옵션으로 인해 실제 토큰 수가 요청값보다 적을 수 있음
 */
class TokenCounter {
    /**
     * @description 주어진 텍스트의 토큰 수를 계산합니다. 이 메소드는 AI 모델에 텍스트를 전송하기 전에
     * 텍스트가 모델의 토큰 제한을 준수하는지 확인하거나, 텍스트를 적절한 크기로 분할하기 위한
     * 기초 작업으로 사용됩니다.
     * 
     * @example 기본적인 토큰 수 계산
     * // 텍스트의 토큰 수를 확인하여 모델 제한을 준수하는지 확인
     * const text = "안녕하세요, 이것은 예시 텍스트입니다.";
     * const tokenCount = TokenCounter.getTokenCount(text, "gpt-4o");
     * console.log(`토큰 수: ${tokenCount}`); // 예상 출력: 토큰 수: 13
     * 
     * @example 토큰 제한 확인을 위한 활용
     * // isWithinTokenLimit 메소드에서 실제 사용되는 예시
     * const maxTokens = 100;
     * const text = "긴 문서 내용...";
     * try {
     *   const tokenCount = TokenCounter.getTokenCount(text, "gpt-4o");
     *   const isWithinLimit = tokenCount <= maxTokens;
     *   // 토큰 수가 제한을 초과하면 텍스트를 분할하거나 축소하는 로직 구현
     * } catch (error) {
     *   console.error("토큰 계산 중 오류 발생:", error);
     *   // 적절한 폴백(fallback) 처리
     * }
     * 
     * @example 텍스트 청크 분할 전 검사
     * // splitByTokenLimit 메소드에서 활용되는 예시
     * const longText = "매우 긴 문서 내용...";
     * const model = "gpt-4";
     * try {
     *   const totalTokens = TokenCounter.getTokenCount(longText, model);
     *   if (totalTokens > 1000) {
     *     // 텍스트가 너무 길 경우 청크로 분할
     *     const chunks = TokenCounter.splitByTokenLimit(longText, model, 1000);
     *   }
     * } catch (error) {
     *   // 인코더 로드 실패 또는 기타 오류 처리
     * }
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
     * @description 텍스트 배열의 총 토큰 수를 계산합니다. 이 메소드는 여러 텍스트(예: 대화 이력, 문서 묶음)의
     * 전체 토큰 수를 확인하여 모델의 컨텍스트 크기 제한을 준수하는지 검증하거나, 청크 분할 여부를
     * 결정하는 데 사용됩니다.
     * 
     * @example 대화 이력의 토큰 수 계산
     * // 대화 이력의 전체 토큰 수를 확인하여 모델 제한을 준수하는지 검증
     * const conversations = [
     *   "사용자: 안녕하세요!",
     *   "시스템: 안녕하세요, 무엇을 도와드릴까요?",
     *   "사용자: 날씨가 좋네요."
     * ];
     * const totalTokens = TokenCounter.getTotalTokenCount(conversations, "gpt-4o");
     * console.log(`총 토큰 수: ${totalTokens}`);
     * // 주의: 대화가 길어질수록 메모리 사용량이 증가할 수 있음
     * 
     * @example 문서 묶음 처리 시 에러 처리
     * // 여러 문서의 토큰 수를 계산하면서 잠재적 오류 처리
     * const documents = ["문서1 내용...", "문서2 내용...", "문서3 내용..."];
     * try {
     *   const totalTokens = TokenCounter.getTotalTokenCount(documents, "gpt-4o");
     *   if (totalTokens > 4096) {
     *     // 토큰 수가 제한을 초과하면 문서를 분할하거나 요약하는 로직 구현
     *     const chunks = TokenCounter.splitByTokenLimit(documents.join("\n"), "gpt-4o", 4096);
     *   }
     * } catch (error) {
     *   console.error("토큰 계산 중 오류 발생:", error);
     *   // 개별 문서 단위로 재시도하거나 대체 처리 방안 적용
     * }
     */
    static getTotalTokenCount(texts, model) {
        return texts.reduce((total, text) => total + this.getTokenCount(text, model), 0);
    }

    /**
     * @description 주어진 텍스트가 지정된 토큰 제한을 초과하는지 검사합니다. 이 메소드는 AI 모델에
     * 텍스트를 전송하기 전에 토큰 제한을 준수하는지 확인하거나, 텍스트 분할 여부를 결정하는 데
     * 사용됩니다.
     * 
     * @example 기본적인 토큰 제한 검사
     * // 텍스트가 토큰 제한을 준수하는지 확인
     * const text = "검사할 텍스트 내용";
     * const isValid = TokenCounter.isWithinTokenLimit(text, "gpt-4", 100);
     * if (!isValid) {
     *   console.log("텍스트가 토큰 제한을 초과했습니다.");
     *   // 텍스트 처리 로직 구현 (예: 분할 또는 축소)
     * }
     * 
     * @example API 요청 전 토큰 검증
     * // API 호출 전에 텍스트가 모델의 최대 토큰 제한을 준수하는지 확인
     * const prompt = "매우 긴 프롬프트 내용...";
     * const maxTokens = 4096;  // GPT-3.5의 경우
     * try {
     *   if (!TokenCounter.isWithinTokenLimit(prompt, "gpt-3.5-turbo", maxTokens)) {
     *     // 토큰 제한 초과 시 처리 방안:
     *     // 1. 텍스트 축소
     *     const truncated = TokenCounter.truncateToTokenLimit(prompt, "gpt-3.5-turbo", maxTokens);
     *     // 2. 또는 청크로 분할
     *     const chunks = TokenCounter.splitByTokenLimit(prompt, "gpt-3.5-turbo", maxTokens);
     *   }
     *   // API 요청 진행
     * } catch (error) {
     *   console.error("토큰 검증 중 오류 발생:", error);
     *   // 적절한 오류 처리
     * }
     */
    static isWithinTokenLimit(text, model, maxTokens) {
        return this.getTokenCount(text, model) <= maxTokens;
    }

    /**
     * @description 긴 텍스트를 지정된 토큰 제한에 맞춰 여러 개의 청크로 분할합니다. 이 메소드는 
     * 대용량 텍스트를 AI 모델의 컨텍스트 크기 제한에 맞게 처리하거나, 문서를 분석 가능한 
     * 크기로 나누는 데 사용됩니다. overlap 매개변수를 통해 청크 간의 연속성을 보장할 수 있습니다.
     * 
     * @example 기본적인 텍스트 분할
     * // 긴 문서를 4000 토큰 크기의 청크로 분할
     * const longDocument = "매우 긴 문서 내용...";
     * const chunks = TokenCounter.splitByTokenLimit(longDocument, "gpt-4", 4000);
     * chunks.forEach((chunk, index) => {
     *   console.log(`청크 ${index + 1} 처리 중...`);
     *   // 각 청크에 대한 AI 처리 로직
     * });
     * // 주의: 청크 크기는 모델의 최대 토큰 제한보다 작아야 함
     * 
     * @example 오버랩을 활용한 문맥 유지
     * // 청크 간 200 토큰 오버랩을 사용하여 문맥 연속성 보장
     * const text = "긴 기술 문서 내용...";
     * const chunks = TokenCounter.splitByTokenLimit(text, "gpt-3.5-turbo", 2000, 200);
     * // 각 청크는 이전 청크의 끝부분 200 토큰을 포함
     * // 주의: 오버랩이 너무 크면 처리 효율성이 떨어질 수 있음
     * 
     * @example 대용량 문서 처리 시 에러 처리
     * // 안전한 청크 분할 처리
     * const largeText = "대용량 문서 내용...";
     * try {
     *   const chunks = TokenCounter.splitByTokenLimit(largeText, "gpt-4", 3000, 100);
     *   if (chunks.length > 10) {
     *     console.warn("문서가 너무 많은 청크로 분할됨. 처리 시간이 길어질 수 있습니다.");
     *   }
     *   // 청크 순차 처리 또는 병렬 처리 로직
     * } catch (error) {
     *   console.error("청크 분할 중 오류 발생:", error);
     *   // 대체 처리 방안 적용
     * }
     * // 주의: 메모리 사용량과 처리 시간을 고려하여 적절한 청크 크기 선택
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
     * @description 주어진 텍스트를 지정된 토큰 제한에 맞게 잘라내는 메소드입니다. 이 메소드는 긴 텍스트를
     * AI 모델의 컨텍스트 크기 제한에 맞추거나, 텍스트를 적절한 길이로 축소하는 데 사용됩니다.
     * 문장 단위 보존 및 말줄임표 추가 등의 옵션을 제공합니다.
     * 
     * @example 기본적인 텍스트 자르기
     * // 텍스트를 지정된 토큰 수로 제한하고 말줄임표 추가
     * const longText = "매우 긴 문서 내용...";
     * const truncated = TokenCounter.truncateToTokenLimit(longText, "gpt-4", 100);
     * console.log(truncated);
     * // 주의: 기본적으로 문장 단위 보존과 말줄임표가 활성화됨
     * 
     * @example 고급 옵션을 활용한 텍스트 자르기
     * // 문장 보존 없이 정확한 토큰 수로 자르기
     * const text = "분석할 긴 텍스트 내용...";
     * const options = {
     *   addEllipsis: false,    // 말줄임표 비활성화
     *   preserveSentences: false,  // 문장 단위 보존 비활성화
     *   debug: true            // 디버그 정보 출력
     * };
     * const result = TokenCounter.truncateToTokenLimit(text, "gpt-3.5-turbo", 50, options);
     * // 주의: preserveSentences를 false로 설정하면 문장 중간에서 잘릴 수 있음
     * 
     * @example API 요청 전 텍스트 길이 조정
     * // API 요청 전에 프롬프트를 모델의 컨텍스트 제한에 맞게 조정
     * const prompt = "매우 긴 프롬프트 내용...";
     * try {
     *   if (!TokenCounter.isWithinTokenLimit(prompt, "gpt-4", 4000)) {
     *     const truncated = TokenCounter.truncateToTokenLimit(prompt, "gpt-4", 4000, {
     *       preserveSentences: true,  // 문장 단위 보존으로 문맥 유지
     *       debug: true               // 잘린 내용 확인을 위한 디버그 정보
     *     });
     *     // API 요청 진행
     *   }
     * } catch (error) {
     *   console.error("텍스트 처리 중 오류 발생:", error);
     * }
     * // 주의: 
     * // 1. preserveSentences 옵션으로 인해 실제 토큰 수가 요청한 것보다 적을 수 있음
     * // 2. addEllipsis 옵션 사용 시 실제 사용 가능한 토큰 수가 3개 정도 감소할 수 있음
     * // 3. debug 옵션을 활용하여 실제 잘린 토큰 수 확인 권장
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
        let encoderName = defaultEncoder;
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
            const encoder = getEncoder(encoderName);
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