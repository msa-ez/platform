const ModelOptionDto = require('../helpers/ModelOptionDto');

// 사용가능한 모델명은 ModelInfoHelper/modelInfos/modelInfos.js를 참고
// * 주의사항
// OpenAI 모델을 제외한 다른 모델들을 요청할 경우에는 CORS 에러를 피하기 위해서 프록시 서버를 동작시켜야 함
// `node server.js` 명령어로 프록시 서버를 실행시킨 후 사용
function getDefaultOptions() {
    const MODEL_FLAGS = {
        NOT_USED: "NOT_USED", // thinkingModel만 사용 할 경우등의 상황에서 활용
    }

    // loadOption: localStorage에서 ModelOptionDto 객체를 로드합니다.
    // 기존 문자열 저장 방식 호환성을 위해 문자열일 경우 기본 DTO를 생성합니다.
    function loadOption(key, defaultModelID) {
        const dto = ModelOptionDto.loadFrom(key, MODEL_FLAGS.NOT_USED);
        if (dto) return dto;

        const raw = localStorage.getItem(key);
        if (!raw) {
            if (defaultModelID === MODEL_FLAGS.NOT_USED) return MODEL_FLAGS.NOT_USED;
            return new ModelOptionDto({ vendor: null, modelID: defaultModelID });
        }
        if (raw === MODEL_FLAGS.NOT_USED) return MODEL_FLAGS.NOT_USED;

        try {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && parsed.vendor) {
                return ModelOptionDto.fromJSON(parsed);
            }
        } catch {}

        return new ModelOptionDto({ vendor: null, modelID: raw });
    }

    return {
        // 복잡한 추론이 필요한 작업에 활용: 이벤트 스토밍 생성, 애그리거트 초안 생성 등
        thinkingModel: loadOption("thinkingModel", MODEL_FLAGS.NOT_USED),

        // 입출력이 명확한 단순한 작업에 활용: 잘못된 JSON 데이터 복구 등
        normalModel: loadOption("normalModel", "gpt-4.1-2025-04-14"),

        MODEL_FLAGS
    }
}

module.exports = getDefaultOptions;