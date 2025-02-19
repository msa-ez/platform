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

        console.log("[*] apiClient가 세팅됨", {
            generator: this,
            apiClient: this.apiClient,
            apiClientParams: this.apiClientParams,
            modelInfo: this.modelInfo,
            requestModelName: this.modelInfo.requestModelName
        })

        this.onApiClientChanged()
    }
    changeModel(modelType){
        this.model = null
        this.apiClientParams.modelType = modelType
        this.changeApiClient()
    }
    changeToComplexModel(){
        this.changeModel("complexModel")
    }
    changeToStandardModel(){
        this.changeModel("standardModel")
    }
    changeToSimpleModel(){
        this.changeModel("simpleModel")
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