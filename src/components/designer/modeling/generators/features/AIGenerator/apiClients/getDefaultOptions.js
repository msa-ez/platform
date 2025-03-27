// 사용가능한 모델명은 ModelInfoHelper/modelInfos/modelInfos.js를 참고
// * 주의사항
// OpenAI 모델을 제외한 다른 모델들을 요청할 경우에는 CORS 에러를 피하기 위해서 프록시 서버를 동작시켜야 함
// `node server.js` 명령어로 프록시 서버를 실행시킨 후 사용
function getDefaultOptions() {
    const MODEL_FLAGS = {
        NOT_USED: "NOT_USED", // thinkingModel만 사용 할 경우등의 상황에서 활용
    }

    return {
        // 복잡한 추론이 필요한 작업에 활용: 이벤트 스토밍 생성, 애그리거트 초안 생성 등
        thinkingModel: localStorage.getItem("thinkingModel") || "o3-mini-2025-01-31-medium",

        // 입출력이 명확한 단순한 작업에 활용: 잘못된 JSON 데이터 복구 등
        normalModel: localStorage.getItem("normalModel") || "gpt-4o-2024-11-20",

        MODEL_FLAGS
    }
}

module.exports = getDefaultOptions;