const { 
    APIClientFactory
} = require("./features/AIGenerator");

// 사용하는 모델 변경시에는 apiClients/getDefaultOptions.js를 참고
class AIGenerator {
    constructor(client, options, modelType){
        this.apiClientParams = {
            client: client || {},
            options: options || {},
            modelType: modelType || ""
        }

        this.changeApiClient()
    }

    changeApiClient(){
        this.apiClient = APIClientFactory.createClient(
            this.apiClientParams.client, 
            this.apiClientParams.options, 
            this.apiClientParams.modelType, 
            this
        )

        // 이 로그는 한 모델 로드에 700+ 회 발생하는데, 매번 generator 인스턴스 전체와
        // apiClient/modelInfo 참조까지 함께 console 에 잡혀 있어 GC 가 못 풀어내고
        // 브라우저 메모리를 크게 잡아먹는 원인이 된다. 디버깅용 노이즈를 줄여 안정화.
        // console.log("[*] apiClient가 세팅됨", {...})

        this.onApiClientChanged()
    }
    changeModel(modelType){
        this.model = null
        this.apiClientParams.modelType = modelType
        this.changeApiClient()
    }
    changeToThinkingModel(){
        this.changeModel("thinkingModel")
    }
    changeToNormalModel(){
        this.changeModel("normalModel")
    }
    

    getPreferredLanguage(){
        return this.apiClient.getPreferredLanguage()
    }

    /**
     * 문자열을 반환해야하며, 반환된 문자열은 전부 {role: "user", content: "..."} 형식으로 최종 전달됨
     */
    createPrompt(){
        return this.apiClient.createPrompt()
    }

    /**
     * {
     *  "system": "...",
     *  "user": ["...", "..."],
     *  "assistant": ["...", "..."]
     * }
     * 
     * 형식으로 반환해서 system > user[0] > assistant[0] > user[1] > assistant[1] > ... 형식으로 최종 전달됨
     * createPromptWithRoles()가 구현되어 있을 경우, createPrompt()에서 반환된 문자열은 무시됨
     */
    createPromptWithRoles(){
        return undefined
    }

    
    stop(){
        this.apiClient.stop()
    }

    getToken(vendor="openai") {
        return this.apiClient.getToken(vendor)
    }

    async generate(generateOption){
        return this.apiClient.generate(generateOption)
    }

    createMessages(){
        return this.apiClient.createMessages()
    }

    createModel(text){
        return this.apiClient.createModel(text)
    }

    onSend(input, stopCallback){
        return this.apiClient.onSend(input, stopCallback)
    }

    onApiClientChanged(){
    }
}


module.exports = AIGenerator;