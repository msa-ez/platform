const AIGenerator = require("./AIGenerator");
const { TokenCounter, JsonParsingUtil } = require("./utils")

const DEFAULT_CONFIG = {
    MAX_RETRY_COUNT: 3
}

/**
 * @description AI 응답을 JSON 형식으로 처리하고 포맷팅하는 기본 생성기 클래스입니다.
 * 이 클래스는 AI 모델의 응답을 구조화된 JSON으로 변환하고, 도메인 모델 생성에 필요한 
 * 기본적인 포맷팅 및 유효성 검사 기능을 제공합니다.
 * 
 * @example 기본적인 생성기 구현
 * class MyGenerator extends FormattedJSONAIGenerator {
 *   constructor(client) {
 *     super(client);
 *     this.checkInputParamsKeys = ["requiredParam1", "requiredParam2"];
 *     this.progressCheckStrings = ["step1", "step2"]; // 진행률 추적용 문자열
 *   }
 *
 *   // 시스템 프롬프트 구성을 위한 필수 메서드들 구현
 *   __buildAgentRolePrompt() {
 *     return "You are an AI assistant specialized in...";
 *   }
 *   
 *   __buildTaskGuidelinesPrompt() {
 *     return "Please follow these rules...";
 *   }
 *   
 *   __buildJsonResponseFormat() {
 *     return {
 *       "result": {
 *         "actions": []
 *       }
 *     };
 *   }
 * }
 * 
 * @example 실시간 생성 모니터링과 오류 처리
 * const generator = new MyGenerator({
 *   input: { requiredParam1: "value1", requiredParam2: "value2" },
 *   
 *   // 첫 응답 수신시 처리
 *   onFirstResponse: (returnObj) => {
 *     console.log("Generation started");
 *     openProgressDialog();
 *   },
 *   
 *   // 생성 진행중 처리
 *   onCreateModelGenerating: (returnObj) => {
 *     updateProgress(returnObj.progress);
 *     showPartialResults(returnObj.modelValue);
 *   },
 *   
 *   // 실패/성공/멈춤에 관계없이, 생성 완료시 처리
 *   onModelCreated: (returnObj) => {
 *     console.log("Model created");
 *     saveResults(returnObj.modelValue);
 *   },
 * 
 *   // 성공한 경우에만 처리
 *   onGenerationSucceeded: (returnObj) => {
 *     console.log("Generation succeeded");
 *     saveResults(returnObj.modelValue);
 *   },
 *   
 *   // 오류 발생시 처리
 *   onError: (returnObj) => {
 *     console.error(`Error: ${returnObj.errorMessage}`);
 *     if (returnObj.leftRetryCount > 0) {
 *       console.log(`Retrying... (${returnObj.leftRetryCount} attempts left)`);
 *     }
 *   }
 * });
 * generator.generate()
 *
 * @note
 * - client 파라미터는 필수이며, 생성기의 입력값과 콜백 함수들을 포함해야 합니다.
 * - checkInputParamsKeys로 지정된 모든 필수 파라미터가 전달되어야 합니다.
 * - progressCheckStrings를 통해 생성 진행률을 추적할 수 있습니다.
 * - 토큰 제한을 초과하는 경우 isCreatedPromptWithinTokenLimit()로 확인할 수 있습니다.
 * - 생성 중 오류 발생시 MAX_RETRY_COUNT만큼 자동으로 재시도합니다.(Json 파싱 에러는 재시도 횟수를 차감시키지 않음)
 * - 모든 JSON 응답은 압축된 형식으로 반환됩니다.
 * - 상속받는 클래스는 최소한 __buildAgentRolePrompt(), __buildTaskGuidelinesPrompt(), 
 *   __buildJsonResponseFormat() 메서드를 구현해야 합니다.
 */
class FormattedJSONAIGenerator extends AIGenerator {
    constructor(client, options, modelType){
        if(!client) throw new Error(`[!] client 파라미터가 전달되지 않으면 제대로 동작하지 않습니다.`)
        super(client, options, modelType)

        this.usedModelType = modelType
        this.generatorName = this.constructor.name
        this.isFirstResponse = true // 스트리밍시에 첫번째 메세지 도착시 로직들(다이얼로그 오픈 등)을 수행하기 위해서 추적함

        this.MAX_RETRY_COUNT = DEFAULT_CONFIG.MAX_RETRY_COUNT
        this.leftRetryCount = this.MAX_RETRY_COUNT
        this.isStopped = false // stop이 실행되어도 계속 실행되는 경우가 있기 때문에 관련 상태를 추적함

        this.checkInputParamsKeys = []
        this.progressCheckStrings = [] // AI 응답에서 특정 문자열들을 순차적으로 확인해서 진행률을 추적하기 위해서 사용
        this.prevPartialAiOutput = {} // 중간에 부분 파싱이 실패 할 경우, 이전의 파싱 값을 반환하도록 만들어서 연속성 확보
    
        // onModelCreated가 없을 경우에는 onGenerationSucceeded가 구현되어도 제대로 동작하지 않기 때문에 디폴트 콜백을 작성함
        if(!this.client.onModelCreated)
            this.client.onModelCreated = (returnObj) => {
                if(returnObj.modelValue)
                    console.log(`[*] ${this.generatorName}에 대한 생성된 모델 정보 : `, {
                        modelValue: returnObj.modelValue,
                        parsedTexts: returnObj.parsedTexts
                    })
            }
        
        this._addOnsendCallback()

        // 이것이 true인 경우, AI의 기존 응답에서 Json 파싱 문제가 일어난 부분을 복원하는 프롬프트로 전환시킴
        this.useJsonRestoreStrategy = false
        this.jsonOutputTextToRestore = undefined
        this.savedOnSendCallback = undefined
        this.createdPrompt = {}
        
        this.startTime = Date.now()
    }

    _addOnsendCallback(){
        if(!this.client.onSend && this.modelInfo.isInferenceModel)
            this.client.onSend = () => {
                if(this.modelInfo.requestArgs.reasoning_effort)
                    console.log(`[*] ${this.modelInfo.requestModelName}-${this.modelInfo.requestArgs.reasoning_effort} 모델이 추론중...`)
                else
                    console.log(`[*] ${this.modelInfo.requestModelName} 모델이 추론중...`)
            }
    }


    async generate() {
        await this.onInputParamsCheckBefore(this.client.input, this.generatorName)
        if(this.client.onInputParamsCheckBefore) {
            const signals = await this.client.onInputParamsCheckBefore(this.client.input, this.generatorName)
            if(signals && signals.stop) return
        }


        for(let key of this.checkInputParamsKeys)
            if(this.client.input[key] === undefined)
                throw new Error(`${key} 파라미터가 전달되지 않았습니다.`)
        console.log(`[*] ${this.generatorName}에 대한 입력 파라미터 전달중...`, {
            inputParams: this.client.input,
            modelInfo: this.modelInfo
        })

        this.leftRetryCount = this.MAX_RETRY_COUNT


        await this.onGenerateBefore(this.client.input, this.generatorName)
        if(this.client.onGenerateBefore) await this.client.onGenerateBefore(this.client.input, this.generatorName)
        await super.generate()
    }
    // generate() 호출 전에 파라미터를 완전히 구성하기 어려운 특수한 케이스에서 사용됨
    // Ex) 새로운 이벤트 스토밍 캔버스를 새 탭으로 열고, GeneraterUI에 의해서 즉시 실행되어서, 대상 Bounded Context와 같은 파라미터를 전달하기 어려운 경우
    async onInputParamsCheckBefore(inputParams, generatorName){}
    async onGenerateBefore(inputParams, generatorName){}

    createPromptWithRoles(){
        if(this.useJsonRestoreStrategy && this.jsonOutputTextToRestore) {
            this.changeToSimpleModel()

            this.useJsonRestoreStrategy = false
            this.jsonOutputTextToRestore = undefined

            this.savedOnSendCallback = this.client.onSend
            this.client.onSend = undefined

            this.createdPrompt = this._getJsonRestorePrompt(this.jsonOutputTextToRestore)
            console.log("[*] Json 파싱에러가 난 데이터를 복구하는 전략으로 시도", {
                prompt: structuredClone(this.createdPrompt),
                modelInfo: this.modelInfo
            })
            return this.createdPrompt
        }
        else {
            this.changeModel(this.usedModelType)

            if(this.modelInfo.isInferenceModel && !this.client.onSend && this.savedOnSendCallback)
                this.client.onSend = this.savedOnSendCallback

            console.log("[*] 일반적인 프롬프트 생성 전략으로 시도", {
                modelInfo: this.modelInfo
            })
        }


        try {

            this.createdPrompt = this._assembleRolePrompt()

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, 
                {prompt: structuredClone(this.createdPrompt)}
            )
            this.isFirstResponse = true

            return this.createdPrompt

        } catch(e) {

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {inputParams: this.client.input, error:e})
            console.error(e)
            throw e

        }
    }

    _getJsonRestorePrompt(jsonOutputText){
        return {
            system: `The given JSON object is not grammatically valid.
Please fix this JSON object and return a valid JSON object.

Rules:
1. Output only the modified JSON object.
2. Do not include any additional text or comments.`,
            user: [jsonOutputText],
            assistant: []
        }
    }

    /**
     * @description 생성하려는 프롬프트가 모델의 토큰 제한을 초과하는지 확인합니다.
     * 이 함수는 주로 대규모 입력 데이터를 처리하기 전에 사전 검증을 위해 사용됩니다.
     * 
     * @example 기본적인 토큰 제한 체크
     * // 프롬프트 생성 전에 토큰 제한 확인
     * if (!generator.isCreatedPromptWithinTokenLimit()) {
     *   throw new Error("입력 데이터가 토큰 제한을 초과했습니다.");
     * }
     * 
     * @example 토큰 제한 초과시 데이터 분할 처리
     * // 대용량 데이터를 여러 번에 나누어 처리
     * if (!generator.isCreatedPromptWithinTokenLimit()) {
     *   // 1. 데이터를 더 작은 단위로 분할
     *   const chunks = TokenCounter.splitByTokenLimit(inputData, this.modelInfo.requestModelName, this.modelInfo.inputTokenLimit);
     *   
     *   // 2. 각 청크별로 개별 처리
     *   for (const chunk of chunks) {
     *     generator.client.input = chunk;
     *     if (generator.isCreatedPromptWithinTokenLimit()) {
     *       await generator.generate();
     *     }
     *   }
     * }
     * 
     * @note
     * - TokenCounter.isWithinTokenLimit()를 내부적으로 사용하여 토큰 수를 계산합니다.
     * - createPrompt() 메서드로 생성된 전체 프롬프트를 기준으로 검사합니다.
     * - 토큰 제한 초과시 데이터를 분할하거나 축소하는 전략을 고려해야 합니다.
     * - 모델의 컨텍스트 크기에 따라 제한이 다르므로 사용 중인 모델의 특성을 고려해야 합니다.
     */
    isCreatedPromptWithinTokenLimit(){
        return TokenCounter.isWithinTokenLimit(
            this.createPrompt(), this.modelInfo.requestModelName, this.modelInfo.inputTokenLimit
        )
    }

    /**
     * @description 현재 또는 가상의 입력 파라미터로 생성될 프롬프트의 토큰 수를 계산합니다.
     * 이 함수는 주로 프롬프트 생성 전에 토큰 제한을 초과하지 않는지 확인하거나,
     * 다양한 입력 조합의 토큰 수를 미리 계산하는데 사용됩니다.
     * 
     * @example 현재 입력값으로 토큰 수 계산
     * // 현재 설정된 입력값으로 프롬프트의 토큰 수를 계산
     * const currentTokenCount = generator.getCreatedPromptTokenCount();
     * console.log(`Current prompt will use ${currentTokenCount} tokens`);
     * 
     * @example 임시 입력값으로 토큰 수 시뮬레이션
     * // 실제 입력값을 변경하지 않고 다른 입력값으로 토큰 수를 계산
     * const simulatedCount = generator.getCreatedPromptTokenCount({
     *   userInput: "새로운 테스트 입력",
     *   contextSize: "large"
     * });
     * // 원본 입력값은 보존됨
     * console.log(`Modified prompt would use ${simulatedCount} tokens`);
     * 
     * @example 토큰 제한 확인과 함께 사용
     * // 입력값 변경 전에 토큰 제한 초과 여부를 미리 확인
     * const newParams = { largeInput: "매우 긴 입력 텍스트..." };
     * const wouldExceedLimit = generator.getCreatedPromptTokenCount(newParams) > generator.modelInfo.inputTokenLimit;
     * 
     * if (wouldExceedLimit) {
     *   console.log("Warning: This input would exceed token limit");
     * } else {
     *   // 실제 입력값 업데이트 진행
     *   generator.client.input = { ...generator.client.input, ...newParams };
     * }
     *
     * @note
     * - 임시 파라미터 전달 시 원본 입력값은 변경되지 않습니다.
     * - 토큰 계산은 createPrompt()로 생성되는 전체 프롬프트를 기준으로 합니다.
     * - TokenCounter 유틸리티의 정확도에 따라 실제 토큰 수와 차이가 있을 수 있습니다.
     * - 대용량 입력 처리 전에 토큰 제한 검증용으로 활용하면 효과적입니다.
     */
    getCreatedPromptTokenCount(tempInputParams={}){
        if (Object.keys(tempInputParams).length === 0) {
            return TokenCounter.getTokenCount(this.createPrompt(), this.modelInfo.requestModelName);
        }

        const changedValues = {};
        Object.keys(tempInputParams).forEach(key => {
            changedValues[key] = this.client.input[key];
            this.client.input[key] = tempInputParams[key];
        });

        try {
            return TokenCounter.getTokenCount(this.createPrompt(), this.modelInfo.requestModelName);
        } finally {
            Object.keys(changedValues).forEach(key => {
                if (changedValues[key] === undefined) {
                    delete this.client.input[key];
                } else {
                    this.client.input[key] = changedValues[key];
                }
            });
        }
    }

    /**
     * @description 현재 또는 가상의 입력 파라미터로 생성될 프롬프트에 대해 남은 토큰 수를 계산합니다.
     * 이 함수는 주로 입력 데이터의 크기를 조절하거나, 추가 데이터 입력 가능 여부를 확인하는데 사용됩니다.
     * 
     * @example 현재 입력값으로 남은 토큰 수 확인
     * // 현재 설정된 입력값으로 추가로 사용 가능한 토큰 수를 계산
     * const remainingTokens = generator.getCreatePromptLeftTokenCount();
     * console.log(`Can still add content using ${remainingTokens} more tokens`);
     * 
     * @example 새로운 입력 추가 가능 여부 확인
     * // 새로운 데이터 추가 전에 토큰 여유 공간 확인
     * const newInput = { additionalContext: "새로운 컨텍스트 정보..." };
     * const remainingAfterAdd = generator.getCreatePromptLeftTokenCount(newInput);
     * 
     * if (remainingAfterAdd < 0) {
     *   console.log("Warning: Adding this input would exceed token limit");
     *   // 입력 데이터 축소 또는 분할 처리 로직
     * } else {
     *   console.log(`Can safely add input, ${remainingAfterAdd} tokens will remain`);
     *   // 새 입력 데이터 추가 진행
     * }
     *
     * @note
     * - 반환값이 음수인 경우 토큰 제한을 초과했음을 의미합니다
     * - 임시 입력값으로 계산시 원본 입력값은 변경되지 않습니다
     * - TokenCounter의 추정치와 실제 토큰 수 간에 약간의 차이가 있을 수 있습니다
     * - 대규모 입력 데이터 처리 전에 미리 확인하여 토큰 초과를 방지하는 것이 좋습니다
     * - getCreatedPromptTokenCount()와 함께 사용하여 더 정확한 토큰 관리가 가능합니다
     */
    getCreatePromptLeftTokenCount(tempInputParams={}){
        return this.modelInfo.inputTokenLimit - this.getCreatedPromptTokenCount(tempInputParams)
    }

    _assembleRolePrompt(){
        return {
            system: this.__buildSystemPrompt(),
            user: this.__buildUserPrompt(),
            assistant: this.__buildAssistantPrompt()
        }
    }


    __buildSystemPrompt(){
        const systemPrompts = [
            this.__buildAgentRolePrompt(),
            this.__buildTaskGuidelinesPrompt(),
            this.__buildInferenceGuidelinesPrompt(),
            this.__buildRequestFormatPrompt(),,
            this.__buildResponseFormatPrompt()
        ].filter(prompt => prompt !== "")

        // 응답 포멧이 있는 경우에는 지시와 상관없이 공백을 반드시 포함해서 Json을 출력하기 때문에 없는 경우에만 추가
        if(!this.modelInfo.requestArgs.response_format)
            systemPrompts.push(this.__getJsonCompressGuidePrompt())

        return systemPrompts.join("\n\n")
    }

    /**
     * AI 에이전트의 역할 및 전문 분야를 정의해서 문제 수행에 대한 범위를 줄임
     * @example
     * You are an experienced domain-driven design (DDD) architect specializing in aggregate design. Your expertise lies in:
     * - Breaking down complex domains into well-structured aggregates
     * ...
     */
    __buildAgentRolePrompt(){
        return ``
    }

    /**
     * @example
     * You are required to write a proposal on how to define multiple Aggregates in a given Bounded Context via a passed in functional requirements.
     * Please follow these rules.
     * 1. Generate suggestions that match all functional requirements requested by users.
     * ...
     */
    __buildTaskGuidelinesPrompt(){
        return ``
    }

    /**
     * 추론 모델인 경우, CoT를 사용하지 않고, 별도의 추론 가이드를 제공하기 위해서 사용
     */
    __buildInferenceGuidelinesPrompt(){
        return ``
    }

    __buildRequestFormatPrompt(){
        return ``
    }

    __buildResponseFormatPrompt(){
        const jsonFormat = this.__buildJsonResponseFormat()
        const afterJsonFormat = this.__buildAfterJsonResponseFormat()

        if(!jsonFormat) return ""
        return `You should return a list containing JSON objects for performing specific actions.
The returned format should be as follows.
\`\`\`json
${jsonFormat.trim()}
\`\`\`

${afterJsonFormat.trim()}
`
    }
    __buildJsonResponseFormat() { return "" }
    __buildAfterJsonResponseFormat() { return "" }

    /**
     * JSON 응답을 압축시켜서 토큰 초과 문제 해소 및 출력 속도 개선
     */
    __getJsonCompressGuidePrompt() {
        return `- When returning JSON, please remove all whitespace and return it in a compressed format, as shown in the example below.
# BEFORE
{
    "a": 1,
    "b": 2
}
        
# AFTER
{"a":1,"b":2}

`
    }


    __buildUserPrompt(){
        const inputsToString = (inputs) => {
            return Object.entries(inputs)
                .map(([key, value]) => `- ${key.trim()}\n${typeof value === 'string' ? value.trim() : JSON.stringify(value)}`).join("\n\n")
        }

        let userPrompts = []
        const exampleInputs = this.__buildJsonExampleInputFormat()
        if(exampleInputs) userPrompts.push(inputsToString(exampleInputs))
        
        const userInputs = this.__buildJsonUserQueryInputFormat()
        if(userInputs) userPrompts.push(inputsToString(userInputs))

        return userPrompts
    }

    __buildJsonExampleInputFormat(){ return null }
    __buildJsonUserQueryInputFormat(){ return {} }


    __buildAssistantPrompt(){
        const exampleOutputs = this.__buildJsonExampleOutputFormat()
        if(!exampleOutputs) return ""

        return [`\`\`\`json
${JSON.stringify(exampleOutputs)}
\`\`\``]
    }

    __buildJsonExampleOutputFormat(){ return null }
    

    createModel(text){ 
        let returnObj = {
            generatorName: this.generatorName,
            inputParams: this.client.input,
            modelRawValue: text,
            isFirstResponse: this.isFirstResponse,
            leftRetryCount: this.leftRetryCount,
            isStopped: this.stopSignaled,
            modelValue: {},
            createdPrompt: this.createdPrompt,
            modelInfo: this.modelInfo,
            parsedTexts: this.parsedTexts,
            startTime: this.startTime,
            currentTime: Date.now(),
            passedSeconds: (Date.now() - this.startTime) / 1000,
            actions: {
                stopGeneration: () => {
                    this.stop()
                },
                retryGeneration: () => {
                    this.generate()
                }
            }
        }

        if(!text) {
            console.log("[*] 별도의 처리할 텍스트가 없음", { ...this._makeDebugObject(returnObj) })
            return returnObj
        }

        if(this.isFirstResponse) {
            this.prevPartialAiOutput = {}
            returnObj.isFirstResponse = this.isFirstResponse
            this.isFirstResponse = false
            this.onFirstResponse(returnObj)
            if(this.client.onFirstResponse) this.client.onFirstResponse(returnObj)
        }
        else
            returnObj.isFirstResponse = this.isFirstResponse


        if(this.progressCheckStrings.length > 0)
            returnObj.progress = this._getProcessPercentage(text)


        if (this.hasExcessiveRepeatingPattern(text, 250, 100)) {
            returnObj = {
                ...returnObj,
                isError: true,
                errorMessage: `[!] ${this.generatorName} 출력에서 반복되는 문자열 감지됨(JSON 파싱 예외 유형)`,
                leftRetryCount: this.leftRetryCount,
                isJsonParsingError: true,
                isDied: false,
                directMessage: "Json parsing error occurred, retrying..."
            }

            console.error(returnObj.errorMessage)
            console.log("[*] 오류가 발생한 관련 반환값 정보", { ...this._makeDebugObject(returnObj) })

            this.onError(returnObj)
            if(this.client.onError) this.client.onError(returnObj)

            this.stop()
            this._retryByError()

            return returnObj
        }

        if(this.state !== 'end') {
            returnObj.modelValue.isPartialParse = true

            try {
                returnObj.modelValue.aiOutput = JsonParsingUtil.applyTrimToAllStringProperties(
                    JsonParsingUtil.parseToJson(text)
                )
                this.prevPartialAiOutput = structuredClone(returnObj.modelValue.aiOutput)
            } catch {
                console.error(`[!] ${this.generatorName}에서 부분적인 결과 처리중에 오류 발생! 이전 값 활용`, {text})
                returnObj.modelValue.aiOutput = this.prevPartialAiOutput
            }
        }


        // 중지 상태에 대한 별도 처리를 하지 않으면 예외로 인식해서 재시도를 하기 때문에 반드시 있어야 함
        if(returnObj.isStopped) {
            console.log(`[*] ${this.generatorName}에서 결과 생성 중지됨!`, { ...this._makeDebugObject(returnObj) })
            returnObj.directMessage = `stopped!`
            this.onStopped(returnObj)
            if(this.client.onStopped) this.client.onStopped(returnObj)
            
            return returnObj
        }
        
        try {

            if(this.state !== 'end') {
                console.log(`[*] ${this.generatorName}에서 결과 생성중...`, { ...this._makeDebugObject(returnObj) })
                returnObj.directMessage = `Generating... (${text.length} characters generated)`
    
                // 실시간으로 진행중인 결과값을 처리하는 도중에 예외 발생시에는 예외 처리를 하지 않고 그냥 넘어감
                try {
                    this.onCreateModelGenerating(returnObj)
                    if(this.client.onCreateModelGenerating) this.client.onCreateModelGenerating(returnObj)
                } catch(e) {
                    console.error(`[!] ${this.generatorName}에서 부분적인 결과 처리중에 오류 발생!`, {text, error:e})
                    console.error(e)
                }

                return returnObj
            }
 
            returnObj.modelValue.aiOutput = JsonParsingUtil.applyTrimToAllStringProperties(
                JsonParsingUtil.parseToJson(text)
            )
            returnObj.modelValue.isPartialParse = false
            returnObj = {
                ...returnObj,
                directMessage: `Generating Finished! (${text.length} characters generated)`
            }

            this.onCreateModelFinished(returnObj)
            if(this.client.onCreateModelFinished) this.client.onCreateModelFinished(returnObj)
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, { ...this._makeDebugObject(returnObj) })

            if(!returnObj.isStopped && !returnObj.isError) {
                this.onGenerationSucceeded(returnObj)
                if(this.client.onGenerationSucceeded) this.client.onGenerationSucceeded(returnObj)
            }

            return returnObj

        } catch(e) {

            returnObj = {
                ...returnObj,
                isError: true,
                errorMessage: e.message,
                leftRetryCount: this.leftRetryCount,
                isJsonParsingError: e.message.includes("JSON 파싱")
            }
            returnObj.isDied = returnObj.leftRetryCount <= 0 && !returnObj.isJsonParsingError
            if(returnObj.isJsonParsingError)
                returnObj.directMessage = "Json parsing error occurred, restoring..."
            else
                returnObj.directMessage = `An error occurred during creation,` + (returnObj.leftRetryCount <= 0 ? ' the model has died. please try again.' : ' retrying...(' + returnObj.leftRetryCount + ' retries left)')

            console.error(`[!] ${this.generatorName}에서 결과 파싱중에 오류 발생!`, {error:e, ...this._makeDebugObject(returnObj)})
            console.error(e)

            this.onError(returnObj)
            if(this.client.onError) this.client.onError(returnObj)

            if(returnObj.isDied) {
                this.onRetry(returnObj)
                if(this.client.onRetry) this.client.onRetry(returnObj)
            }
        
            if(returnObj.isJsonParsingError) {
                this.jsonOutputTextToRestore = returnObj.modelRawValue
                this.useJsonRestoreStrategy = true
                this._retryByError()
            }
            else if(this.leftRetryCount > 0) {
                this.leftRetryCount--
                this._retryByError()
            }

            return returnObj

        }
    }
    onFirstResponse(returnObj){}
    onStopped(returnObj){}
    onError(returnObj){}
    onRetry(returnObj){}
    // onCreateModel을 생성 도중과 생성 완료시로 구분해서 처리하기 위한 확장된 콜백 함수
    onCreateModelGenerating(returnObj){}
    onCreateModelFinished(returnObj){}
    // onGenerationFinished는 도중에 생성이 멈추거나 오류가 나도 실행되기 때문에 완전히 성공한 경우에만 호출되는 콜백 함수를 별도로 추가시켜서 공통적으로 이러한 체크 로직이 추가되는 것을 방지함
    onGenerationSucceeded(returnObj){}

    _getProcessPercentage(text){
        let foundCount = 0
        for(let checkString of this.progressCheckStrings){
            if(text.includes(checkString)) foundCount++
        }

        return Math.round((foundCount / (this.progressCheckStrings.length+1)) * 100)
    }
    
    /**
     * @description 입력된 문자열(text)의 마지막 부분(tail)을 검사하여, 
     * 특정 문자(공백 제외)가 설정된 반복 횟수(repeatLimit) 이상 반복되는지를 확인하는 함수입니다.
     * 이 함수는 주로 AI 모델의 응답 처리 시, 모델이 동일한 문자를 반복적으로 생성하여 발생할 수 있는 
     * 잘못된 JSON 형식이나 파싱 오류를 미리 감지하는 데 사용됩니다.
     * 예를 들어, JSON 응답에서 "!!!!!!"과 같이 동일한 문자가 과도하게 반복될 경우, 
     * 이를 오류 신호로 감지하여 재시도 로직을 활성화할 수 있습니다.
     * 
     * @example 기본 사용 예시
     * // 주의: 이 예시는 tail에 '!' 문자가 6번 반복되어 repeatLimit인 5를 초과하는 경우 true를 반환합니다.
     * const text1 = "안녕하세요!!!!!!";  // "!"가 6번 반복됨
     * const result1 = hasExcessiveRepeatingPattern(text1, 10, 5);
     * console.log(result1);  // true
     * 
     * @example JSON 출력 검증에서의 활용
     * // 주의: JSON 출력에 공백은 반드시 포함되어야 하므로, 공백 문자는 검사 대상에서 제외됩니다.
     * const text2 = '{"key": "value", "number": 123}    ';  // 문자열 끝에 여분의 공백이 있음
     * const result2 = hasExcessiveRepeatingPattern(text2, 10, 5);
     * console.log(result2);  // false, 공백은 검사하지 않음
     *
     * @note
     * - 파라미터 tailLength는 검사할 문자열의 끝부분 길이를 지정합니다.
     * - 파라미터 repeatLimit은 단일 문자가 허용되는 최대 반복 횟수를 정의하며,
     *   해당 한계를 초과하면 true를 반환합니다.
     * - JSON 포맷의 정상 출력을 위해 공백(' ')은 반복 검사에서 제외됩니다.
     */
    hasExcessiveRepeatingPattern(text, tailLength, repeatLimit) {
        const tail = text.replaceAll(" ", "").slice(-tailLength)
        for(const searchChar of new Set(tail))
            if(tail.split(searchChar).length-1 >= repeatLimit) return true
        return false;
    }

    _retryByError(){
        // 일부 경우에는 response_format이 정의되어 있어서 끝없이 동일한 예외가 발생하는 경우가 있기 때문에 재시도시에는 제거해서 재시도 하도록 함
        this.modelInfo.requestArgs.response_format = undefined
        super.generate()
    }

    _makeDebugObject(returnObj) {
        const lengthInfos = {}
        if(returnObj.modelRawValue) lengthInfos.rawTextLength = returnObj.modelRawValue.length
        if(returnObj.parsedTexts) {
            for(const [key, value] of Object.entries(returnObj.parsedTexts))
                if(value) lengthInfos[key + "Length"] = value.length
        }

        const debugObj = {
            returnObj: structuredClone({...returnObj, actions: undefined}),
            ...lengthInfos
        }

        return debugObj
    }
}

module.exports = FormattedJSONAIGenerator;