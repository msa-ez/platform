const EsValueLangGraphStudioProxy = require("./EsValueLangGraphStudioProxy");
const { requestData } = require("./mocks")

class EsValueLangGraphStudioProxyTest {
    static async test() {
        console.log("[*] ### EsValueLangGraphStudioProxy 테스트 ###")
        
        const healthCheck = await EsValueLangGraphStudioProxy.healthCheck()
        console.log(healthCheck)

        const createNewThreadRun = await EsValueLangGraphStudioProxy.createNewThreadRun(
            requestData,
            (threadId, runId) => {
                console.log("threadId", threadId)
                console.log("runId", runId)
            },
            (esValue) => console.log('업데이트:', esValue),
            (finalEsValue) => console.log('완료:', finalEsValue)
        )
        console.log(createNewThreadRun)
    }
}

module.exports = EsValueLangGraphStudioProxyTest