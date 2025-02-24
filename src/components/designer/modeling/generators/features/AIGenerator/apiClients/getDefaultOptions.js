// 사용가능한 모델명은 ModelInfoHelper/modelInfos/modelInfos.js를 참고
// * 주의사항
// OpenAI 모델을 제외한 다른 모델들을 요청할 경우에는 CORS 에러를 피하기 위해서 프록시 서버를 동작시켜야 함
// `node server.js` 명령어로 프록시 서버를 실행시킨 후 사용
function getDefaultOptions() {
    return {
        // 대부분의 모델에서 제대로 동작하지 않는 매우 복잡한 문제에 활용: 이벤트 스토밍 정책 생성등
        complexModel: localStorage.getItem("complexModel") || "o3-mini-2025-01-31-high",
    
        // 대부분의 일반적인 작업에 활용: 애그리거트 초안 생성, 정책 생성을 제외한 이벤트 스토밍 생성등
        standardModel: localStorage.getItem("standardModel") || "o3-mini-2025-01-31-medium",
    
        // 입출력이 명확한 단순 작업용 모델: 잘못된 JSON 데이터를 복구등
        simpleModel: localStorage.getItem("simpleModel") || "gpt-4o-2024-11-20"
    }
}

module.exports = getDefaultOptions;