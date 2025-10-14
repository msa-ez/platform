const { COUNTRY_CODE_LANG_MAP, DEFAULT_LANG, REQUEST_ARG_KEYS } = require("./contants");
const { ModelInfoHelper } = require("../helpers")
const { HashUtil, RequestUtil, TokenUtil } = require("../utils")
const { GeneratorLockKeyError, TokenNotInputedError, AiModelSettingError } = require("../../../errors")
const store = require("../../../../../../../store").default;


let previousRequestInfos = []
let previousResponseInfos = []
/**
 * @description
 * AI Generator API의 공통 기능을 제공하기 위한 기본 클래스입니다.
 * 이 클래스는 다양한 AI 모델 제공자(vendor)의 API 요청을 간소화하기 위해 토큰 관리, 
 * 요청 파라미터 생성, 응답 파싱, 캐싱 및 에러 처리를 포함한 여러 공통 동작을 구현합니다.
 * 
 * 하위 클래스(OpenAIClient 등)는 이 클래스를 상속받아 `_makeRequestParams`와 `_parseResponseText`
 * 메소드를 해당 API의 요구 사항에 맞게 반드시 재정의하여 사용해야 합니다.
 *
 * @example 기본 사용 예시 (OpenAI API 사용):
 * // OpenAIClient는 BaseAPIClient를 상속받아 OpenAI API에 맞게 요청 파라미터와 응답 파싱을 구현합니다.
 * const openAIClient = new OpenAIClient(client, options, model, aiGenerator);
 * openAIClient.generate(generateOption)
 *   .then(model => console.log("생성된 모델:", model))
 *   .catch(err => console.error("에러 발생:", err));
 *
 * @example 응용 사용 예시 (토큰 관리 및 입력 처리):
 * // 토큰은 우선 localStorage, 이후에 Firebase, 그리고 사용자 입력 순으로 조회됩니다.
 * // 토큰이 존재하지 않을 경우, 사용자에게 입력을 요청하게 됩니다.
 * (async () => {
 *   try {
 *     const token = await openAIClient.getToken("openai");
 *     console.log("토큰을 성공적으로 확보함:", token);
 *   } catch (error) {
 *     console.error("토큰 확보 중 에러 발생:", error);
 *   }
 * })();
 *
 * @note
 * - 이 클래스는 직접 인스턴스화하여 사용하기보다는, 특정 API 제공자에 맞게 확장한 하위 클래스를 통해 사용해야 합니다.
 * - 반드시 `_makeRequestParams`와 `_parseResponseText` 메소드를 하위 클래스에서 구현해야 정상 동작합니다.
 * - API 요청 중 캐싱, 에러 처리, 응답 스트리밍 등의 기능이 내장되어 있으므로, 
 *   프로젝트의 전반적인 에러 핸들링 및 캐싱 정책과 일치하도록 필요한 경우 수정해야 합니다.
 * - 토큰 저장 및 조회 방식(localStorage, Firebase 등)이 환경에 따라 달라질 수 있으므로, 
 *   보안 및 데이터 관리 정책에 유의해야 합니다.
 */
class BaseAPIClient {
    constructor(client, options, modelOptionDto, aiGenerator) {
        this.aiGenerator = aiGenerator;
        const g = this.aiGenerator


        Object.assign(g, {
            client,
            model: modelOptionDto.modelID,
            modelOptionDto: modelOptionDto,
            preferredLanguage: this.getPreferredLanguage(),
            partedResponseCount: 0,
            responseLimit: 15,
            previousMessages: [],
            finish_reason: null,
            modelJson: null,
            savedModel: null,
            stopSignaled: false,
            gptResponseId: null,
            openaiToken: null,
            parsedTexts: {}
        })

        if(options) {
            Object.assign(g, {
                preferredLanguage: options.preferredLanguage || g.preferredLanguage,
                previousMessages: options.previousMessages || g.previousMessages,
                prompt: options.prompt || g.prompt
            })
        }
        g.originalLanguage = g.preferredLanguage.toLowerCase()
        if(!g.generatorID) g.generatorID = Date.now()
        g.apiClientID = Date.now()

        g.extraOptions = {
            requestArgs: {}
        }
        REQUEST_ARG_KEYS.forEach(key => {
            if (g[key])
                g.extraOptions.requestArgs[key] = g[key]
        })

        g.modelInfo = modelOptionDto.modelInfos

        g.roleNames = {
            system: "system",
            user: "user",
            assistant: "assistant"
        }


        // 생성된 생성기 인스턴스는 반드시 한번에 하나의 요청만을 수행해야 됨
        // 동시에 요청 수행시에 state와 같은 속성이 공유되어서 의도치 않은 동작을 하게됨
        // 따라서 lockKey와 같은 세마포어를 통해서 동시 요청을 방지함
        g.lockKey = false
    }
       
    getPreferredLanguage(){
        if(window && window.countryCode && COUNTRY_CODE_LANG_MAP[window.countryCode])
            return COUNTRY_CODE_LANG_MAP[window.countryCode]
        return DEFAULT_LANG
    }

    createPrompt() {
        return this.aiGenerator.prompt ? this.aiGenerator.prompt : "say hello in Korean.";
    }

    stop() {
        const g = this.aiGenerator;
        g.stopSignaled = true;
        
        if (g.abortController) {
            g.abortController.abort();
            g.state = 'stopped';
            console.log("[*] 생성이 중단됨");
        }
    }
    
    async getToken(vendor) {
        return await TokenUtil.getToken(vendor);
    }


    async generate(generateOption) {
        const g = this.aiGenerator
    
        if(g.lockKey) {
            return Promise.reject(new GeneratorLockKeyError());
        }
    
        g.lockKey = true;
        
        let token = null
        try {
            token = await g.getToken(g.modelInfo.vendor);
        } catch (err) {
            g.lockKey = false;
            return Promise.reject(new TokenNotInputedError());
        }
    
        return new Promise((resolve, reject) => {
            try {
                g.state = 'running';
                g.messages = this._getMessages(generateOption);
                g.abortController = new AbortController();

                g.gptResponseId = null;
                g.firstResponseTime = null
                g.requestStartTime = new Date().getTime()
                const requestParams = this._makeRequestParams(g.messages, g.modelInfo, token);
    
                const requestInfo = this._makeRequestInfo(requestParams, g.messages)
                previousRequestInfos.push(requestInfo)
                previousRequestInfos = previousRequestInfos.slice(-500)
                console.log("[*] 최종적으로 요청되는 정보", { requestInfo, previousRequestInfos });
        

                if(localStorage.getItem("useCache") === "true") {
                    const hashKey = HashUtil.generateHashKey(JSON.stringify(g.messages));
                    let existingResult = localStorage.getItem("cache-" + hashKey);
        
                    if(existingResult){
                        setTimeout(()=>{
                            g.state = 'end';
                            g.modelJson = existingResult
                            g.requestEndTime = new Date().getTime()
                            const responseInfo = this._makeResponseInfo(g.modelJson)
                            previousResponseInfos.push(responseInfo)
                            previousResponseInfos = previousResponseInfos.slice(-500)
                            console.log("[*] AI 모델 생성이 완료됨", { responseInfo, previousResponseInfos })

                            if(g.client.onReceived){
                                g.client.onReceived(existingResult);
                            }

                            const model = g.createModel(existingResult);
                            if(g.client.onModelCreated){
                                g.client.onModelCreated(model);
                            }
                            if(g.client.onGenerationFinished){
                                g.client.onGenerationFinished(model);
                                resolve(model);
                            }
                            g.lockKey = false;
                        }, 0);
                        return;
                    }
                }
        
                
                RequestUtil.sendPostRequest(
                    requestParams.requestUrl,
                    requestParams.requestData,
                    requestParams.requestHeaders,
                    this._onProgress.bind(this),
                    (event) => {
                        this._onLoadEnd(event, resolve, reject);
                        g.lockKey = false;
                    },
                    (error) => {
                        this._onError(error, resolve, reject);
                        g.lockKey = false;
                    },
                    resolve,
                    (error) => {
                        g.lockKey = false;
                        reject(error);
                    },
                    g.abortController.signal
                );
    
                if(g.client.onSend) {
                    g.client.onSend(g.client.input, () => {
                        g.stop();
                    });
    
                    g.onSend(g.client.input, () => {
                        g.stop();
                    });
                }
            } catch(e) {
                g.lockKey = false;
                reject(e);
            }
        }).catch(error => {
            g.lockKey = false;
            throw error;
        });
    }

    _makeRequestInfo(requestParams, messages){
        const g = this.aiGenerator
        let requestInfo = {}
        
        try {
            requestInfo.requestData = requestParams.requestData ? JSON.parse(requestParams.requestData) : null
            requestInfo.singleMessage = messages.map((m) => m.content).join("\n\n---\n\n") + "\n\n---\n\n"
        }catch{}

        try {
            if((g.client && g.client.input)) {
                if(typeof g.client.input === "object")
                    requestInfo.input = structuredClone(g.client.input)
                else
                    requestInfo.input = g.client.input
            }
            else
                requestInfo.input = null
        }catch{}

        try {
            requestInfo = {
                ...requestInfo,
                requestStartTime: g.requestStartTime,
                generatorName: g.generatorName || "unknown",
                generatorID: g.generatorID,
                apiClientID: g.apiClientID,
                networkRequestID: new Date().getTime()
            }
        }catch{}

        return requestInfo
    }

    /**
     * **상위 클래스에서 반드시 재정의해야하는 메소드**
     * 각 모델에 따라서 적절한 POST 요청 파라미터를 반환해야 함
     */
    _makeRequestParams(messages, modelInfo, token){
        // return {
        //     requestUrl: "",
        //     requestData: JSON.stringify({}),
        //     requestHeaders: {}
        // }
        throw new Error("_makeRequestParams 메소드는 서브 클래스에서 구현되어야 합니다.")
    }

    _getMessages(generateOption) {
        const g = this.aiGenerator
        if(!generateOption) return g.createMessages();

        if(generateOption.action === "reGenerate") {
            let messages = g.createMessages();
            messages[0].content = generateOption.messages
            return messages
        }

        let messages = generateOption.messages
        g.previousMessages = generateOption.messages
        return messages
    }

    _onProgress(event, resolve, reject) {
        const g = this.aiGenerator

        if(!g.firstResponseTime)
            g.firstResponseTime = new Date().getTime()

        if(g.stopSignaled || window.stopSignaled){
            event.target.abort();
            g.stopSignaled = false;
            window.stopSignaled = null
            g.state = 'stopped'
            
            console.log("[*] 생성이 중단됨")
        }
    
        const responseTextInfo = this._parseResponseText(event.target.responseText)
        if(responseTextInfo.error) {
            if(g.client.onError){
                g.client.onError(responseTextInfo.error);
            }
            reject(responseTextInfo.error)
        }
    
        if(!g.gptResponseId)
            g.gptResponseId = responseTextInfo.id
    
        if(responseTextInfo.finish_reason === "length")
            g.finish_reason = "length"
        
        g.modelJson = responseTextInfo.joinedText
    
        if(g.client.onReceived){
            if(g.gptResponseId === responseTextInfo.id){
                g.client.onReceived(g.modelJson);
            }
        }
    
        if(g.client.onModelCreated){
            if(g.partedResponseCount >= g.responseLimit){
                const createdModel = g.createModel(g.modelJson)
                if(createdModel){
                    g.savedModel = createdModel
                    g.client.onModelCreated(createdModel);
                    g.partedResponseCount = 0;
                }
            } else
                g.partedResponseCount++;
        }
    }
    /**
     * **상위 클래스에서 반드시 재정의해야하는 메소드**
     * 각 모델에 따라서 실시간으로 얻어진 텍스트에 대해서 적절한 형식으로 파싱한 결과를 반환
     */
    _parseResponseText(responseText) { 
        // return {
        //     error: null,
        //     id: "", // 각각의 스트리밍 요청마다 고유하게 전달되는 채팅 ID
        //     finish_reason: null, // 토큰 초과인 경우, "length"를 반환시킬 것
        //     joinedText: "" // 스트리밍으로 전달되는 각각의 조각 텍스트들을 결합시켜서 반환
        // }
        throw new Error("_parseResponseText 메소드는 서브 클래스에서 구현되어야 합니다.")
    }

    _onLoadEnd(event, resolve, reject) {
        const g = this.aiGenerator

        g.state = 'end';
        let model = {};

        g.requestEndTime = new Date().getTime()
        const responseInfo = this._makeResponseInfo(g.modelJson)
        previousResponseInfos.push(responseInfo)
        previousResponseInfos = previousResponseInfos.slice(-500)
        console.log("[*] AI 모델 생성이 완료됨", { responseInfo, previousResponseInfos })

        if(!g.client) return
        if(g.finish_reason === 'length'){
            console.log('max_token issue')
            alert('max_token issue')
        }


        if(g.client.onModelCreated){
            model = g.createModel(g.modelJson)
            if(g.client.input && g.client.input.associatedProject) {
                model.associatedProject = g.client.input.associatedProject
            }
            if(g.client.input && g.client.input.persona) {
                model.persona = g.client.input.persona
            }
            g.client.onModelCreated(model);
        } 

        if(g.client.onGenerationFinished){
            if(g.client.input){
                if(g.client.input.associatedProject) model.associatedProject = g.client.input.associatedProject
                if(g.client.input.persona) model.persona = g.client.input.persona
            }
            g.client.onGenerationFinished(model)
            resolve(model); 
        }


        if(localStorage.getItem("useCache") === "true"){
            let hashKey = HashUtil.generateHashKey(JSON.stringify(g.messages))
            localStorage.setItem("cache-" + hashKey, g.modelJson)
        }
    }

    _makeResponseInfo(modelJson) {
        const g = this.aiGenerator

        let inputData = null
        try {
            if((g.client && g.client.input)) {
                if(typeof g.client.input === "object")
                    inputData = structuredClone(g.client.input)
                else
                    inputData = g.client.input
            }
            else
                inputData = null
        }catch{}

        let messages = null
        try {
            messages = structuredClone(g.previousMessages)
        }catch{}

        return {
            generatorName: g.generatorName,
            generatorID: g.generatorID,
            apiClientID: g.apiClientID,
            networkRequestID: g.networkRequestID,
            input: inputData,
            messages: messages,
            output: modelJson,
            parsedTexts: g.parsedTexts,
            requestStartTime: g.requestStartTime,
            firstResponseTime: g.firstResponseTime,
            requestEndTime: g.requestEndTime,
            totalSeconds: (g.requestEndTime - g.requestStartTime) / 1000,
            responseDelaySeconds: (g.firstResponseTime - g.requestStartTime) / 1000,
            tokenGenerateDelaySeconds: (g.requestEndTime - g.firstResponseTime) / 1000,
            state: g.state,
            finish_reason: g.finish_reason
        }
    }

    _onError(error, resolve, reject) {
        const g = this.aiGenerator
        console.error('Error in generation:', error);
        g.state = 'error';

        if (g.client.onError)
            g.client.onError(error);

        reject(error);
    }


    createMessages() { 
        const g = this.aiGenerator
        g.previousMessages = []
        g.preferredLanguage = g.getPreferredLanguage();
        g.originalLanguage = g.preferredLanguage.toLowerCase();


        const languageToUse = g.fixedLanguage || g.preferredLanguage || "English"
        const contentToAppend = "\n<language_guide>Please generate the response in " + languageToUse + " while ensuring that all code elements (e.g., variable names, function names) remain in English.</language_guide>"


        let promptsToBuild = {
            "system": "",
            "user": [],
            "assistant": []
        }
        const createPromptWithRoles = g.createPromptWithRoles()

        if(createPromptWithRoles) {
            promptsToBuild.system = createPromptWithRoles.system
            promptsToBuild.user = createPromptWithRoles.user
            if(promptsToBuild.user && promptsToBuild.user.length > 0 && !g.disableLanguageGuide)
                promptsToBuild.user[promptsToBuild.user.length - 1] += contentToAppend
            
            promptsToBuild.assistant = createPromptWithRoles.assistant
        }
        else {
            if(g.disableLanguageGuide)
                promptsToBuild.user = [g.createPrompt()]
            else
                promptsToBuild.user = [g.createPrompt() + contentToAppend]
        }


        const buildedMessages = this._buildMessages(promptsToBuild)

        if(g.client.openAiMessageList){
            g.client.openAiMessageList = g.client.openAiMessageList.concat(buildedMessages)
            g.previousMessages = g.client.openAiMessageList;
        } else
            g.previousMessages = g.previousMessages.concat(buildedMessages)
        
        return g.previousMessages;
    }

    _buildMessages(promptsToBuild) {
        const g = this.aiGenerator
        const messages = []
        
        if(promptsToBuild.system)
            messages.push({
                role: g.roleNames.system,
                content: promptsToBuild.system
            })

        for(let i = 0; i < promptsToBuild.user.length; i++) {
            messages.push({
                role: g.roleNames.user,
                content: promptsToBuild.user[i]
            })
            if(promptsToBuild.assistant[i])
                messages.push({
                    role: g.roleNames.assistant,
                    content: promptsToBuild.assistant[i]
                })
        }

        return messages
    }

    
    createModel(text) {
        return text
    }

    onSend(input, stopCallback){}
}
  
module.exports = BaseAPIClient;