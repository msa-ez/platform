const { openaiModelInfos } = require("./openaiModelInfos");
const { ollamaModelInfos } = require("./ollamaModelInfos");
const { anthropicModelInfos } = require("./anthropicModelInfos");
const { runpodModelInfos } = require("./runpodModelInfos");

/**
 * @description 특정 모델에 대한 API 요청시에 활용되는 기반 정보
 * @example
 * // 키 이름은 버전을 제외한 대표 모델명만 작성함. 이렇게 하면 'gpt-4o-2024-08-06'도 매칭됨
 * // 키 매칭 우선 순위: 완전한 키 매칭 > 앞 부분이 부분적으로 매칭
 * "gpt-4o": {
 *  vendor: "openai", // 모델 제공자. API 요청을 위한 클래스 선택시에 활용됨
 *  contextWindowTokenLimit: 128000, // 모델의 컨텍스트 윈도우 토큰 제한 수(공식 홈페이지에서 확인)
 *  outputTokenLimit: 16384, // 모델의 출력 토큰 제한 수(공식 홈페이지에서 확인)
 *  isInferenceModel: false, // o1, o3-mini와 같은 추론 모델 여부(디폴트: false)
 *  requestArgs: { // 모델 요청시에 함께 전달시킬 파라미터들
 *      temperature: 0.7,
 *      topP: 1,
 *      frequencyPenalty: 0,
 *      presencePenalty: 0
 *  },
 *  transforms: { 
 *     // 매칭 후, 해당 키 값의 포함 여부를 통해서 설정된 파리미터를 덮어쓸 수 있음
 *     // 이 경우, 사용된 키 값에서 매칭된 값은 제거함
 *     // 예를 들어, "gpt-4o-2024-08-06-high-temp"와 같은 형식으로 전달되었을 경우 실행되는 모델명은 매칭된 키 값이 제거된
 *     // "gpt-4o-2024-08-06"이며, temperature는 0.7 > 1.0 으로 변경됨됨
 *    "-high-temp": {
 *          requestArgs: {
 *              temperature: 1.0
 *          }
 *      }
 *  }
 */
const modelInfos = {
    ...openaiModelInfos,
    ...ollamaModelInfos,
    ...anthropicModelInfos,
    ...runpodModelInfos
}

const defaultModelInfos = {
    vendor: "openai",
    contextWindowTokenLimit: 16385, // 토큰 제한 수를 알 수 없을 경우, GPT-3.5 Turbo의 제한 수를 활용
    outputTokenLimit: 4096,
    inputTokenLimitMargin: 1000,
    outputTokenLimitReasoningMargin: 0,
    isInferenceModel: false,
    requestArgs: {},
    transforms: {}
}

Object.values(modelInfos).forEach((modelInfo) => {
    // 컨텍스트 토큰 제한만 적혀져있고, 출력 토큰 제한 수를 알 수 없을 경우, 임시 방편으로 20%로 할당
    if(modelInfo.contextWindowTokenLimit && !modelInfo.outputTokenLimit)
        modelInfo.outputTokenLimit = modelInfo.contextWindowTokenLimit * 0.20

    for(const key of Object.keys(defaultModelInfos)){
        if(!modelInfo[key]) modelInfo[key] = defaultModelInfos[key]
    }

    if(!modelInfo.inputTokenLimit)
        modelInfo.inputTokenLimit = modelInfo.contextWindowTokenLimit - modelInfo.outputTokenLimit - modelInfo.inputTokenLimitMargin

    if(modelInfo.isInferenceModel)
        modelInfo.outputTokenLimit = modelInfo.outputTokenLimit - modelInfo.outputTokenLimitReasoningMargin
})

module.exports = modelInfos;