const { getEncoder } = require("./externals");
const { OpenAITokenCounter, AnthropicTokenCounter, GoogleTokenCounter, HuggingFaceTokenCounter } = require("./encoders");
const { ModelInfoHelper } = require("../../features/AIGenerator");

/**
 * @description AI 모델에 전송되는 텍스트의 토큰 수를 계산하고 관리하는 유틸리티 클래스입니다.
 * 주요 기능으로는 토큰 수 계산, 토큰 제한 확인 등이 있으며,
 * AI 모델의 컨텍스트 크기 제한을 준수하면서 효율적인 텍스트 처리를 지원합니다.
 * 
 * @example 기본적인 토큰 수 계산 및 제한 확인
 * // 텍스트의 토큰 수를 계산하고 모델 제한을 확인
 * const text = "분석할 텍스트 내용...";
 * const tokenCount = TokenCounter.getTokenCount(text, "gpt-4");
 * const isValid = TokenCounter.isWithinTokenLimit(text, "gpt-4", 4000);
 * // 주의: 모델명이 잘못되면 기본 인코더(o200k_base)가 사용됨
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
     */
    static async getTokenCount(text, model) {
        try {
            let modelInfo = null;
            try {
                modelInfo = ModelInfoHelper.getModelInfo(model);
            } catch(error) {
                console.warn(`[~] Error getting model info. Use default fallback.`, {text, model, error});
                return this._getDefaultTokenCount(text, "cl100k_base", 1.00);
            }

            try {
                return await TokenCounter.vendorEncoderMap[modelInfo.vendor].getTokenCount(
                    text, modelInfo.huggingFaceModelName || model
                );
            } catch(error) {
                console.warn(`[~] Error counting tokens. Use default fallback.`, {text, model, error});
                return this._getDefaultTokenCount(text, modelInfo.defaultEncoder, modelInfo.defaultTokenizerWeight);
            }
        } catch (error) {
            console.error(`[!] Error counting tokens`, {text, model, error});
            throw error;
        }
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
     */
    static async isWithinTokenLimit(text, model, maxTokens) {
        return (await this.getTokenCount(text, model)) <= maxTokens;
    }

    static _getDefaultTokenCount(text, encoderName="cl100k_base", weight=1.00) {
        const encoder = getEncoder(encoderName);
        return Math.floor(encoder.encode(text).length * weight);
    }
}

TokenCounter.vendorEncoderMap = {
    "openai": OpenAITokenCounter,
    "anthropic": AnthropicTokenCounter,
    "google": GoogleTokenCounter,
    "ollama": HuggingFaceTokenCounter,
    "runpod": HuggingFaceTokenCounter
}

module.exports = TokenCounter;