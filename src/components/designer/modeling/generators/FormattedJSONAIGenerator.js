const AIGenerator = require("./AIGenerator");

let partialParse;
try{
    partialParse = require('./partial-json-parser');
}catch(e){
    partialParse = function(text){return JSON.parse(text)}
}

const DEFAULT_CONFIG = {
    MODEL: "gpt-4o-2024-11-20",
    MAX_RETRY_COUNT: 3,
    TEMPERATURE: 1.0,
    TOP_P: 0.6,
    DEFAULT_LANGUAGE: "English"
};

/**
 * AI 기반의 JSON 형식 응답을 처리하는 제너레이터
 * 
 * 주요 책임:
 * - AI 모델과의 상호작용을 위한 프롬프트 구성
 * - JSON 형식의 응답 파싱 및 정규화
 * - 오류 복구 및 재시도 메커니즘 관리
 * - 생성 프로세스의 진행 상태 추적
 * 
 * 확장 가이드:
 * - __buildAgentRolePrompt(): AI 에이전트의 전문성과 역할 정의
 * - __buildTaskGuidelinesPrompt(): 작업별 규칙과 제약조건 정의
 * - __buildRequestFormatPrompt(): 입력 형식에 대한 가이드라인 정의
 * - __buildResponseFormatPrompt(): 응답 형식에 대한 구조 정의
 * - __buildExamplePrompt(): 입출력 예시를 통한 명확한 가이드 제공
 * 
 * 사용 예시:
 * ```javascript
 * const generator = new FormattedJSONAIGenerator({
 *   input: {
 *     input1: "value1",
 *     input2: "value2"
 *   },
 *   onFirstResponse: (returnObj) => {
 *     console.log(returnObj)
 *   },
 *   ...
 * });
 * generator.generate();
 * ```
 * 
 * @extends AIGenerator
 */
class FormattedJSONAIGenerator extends AIGenerator {
    constructor(client){
        if(!client) throw new Error(`[!] client 파라미터가 전달되지 않으면 제대로 동작하지 않습니다.`)
        super(client)

        this.model = DEFAULT_CONFIG.MODEL
        this.generatorName = this.constructor.name
        this.isFirstResponse = true // 스트리밍시에 첫번째 메세지 도착시 로직들(다이얼로그 오픈 등)을 수행하기 위해서 추적함

        this.preferredLanguage = this.preferredLanguage ? this.preferredLanguage : DEFAULT_CONFIG.DEFAULT_LANGUAGE
        this.temperature = DEFAULT_CONFIG.TEMPERATURE
        this.top_p = DEFAULT_CONFIG.TOP_P

        this.MAX_RETRY_COUNT = DEFAULT_CONFIG.MAX_RETRY_COUNT
        this.leftRetryCount = this.MAX_RETRY_COUNT
        this.isStopped = false // stop이 실행되어도 계속 실행되는 경우가 있기 때문에 관련 상태를 추적함

        this.checkInputParamsKeys = []
        this.progressCheckStrings = [] // AI 응답에서 특정 문자열들을 순차적으로 확인해서 진행률을 추적하기 위해서 사용
    }


    async generate() {
        for(let key of this.checkInputParamsKeys)
            if(this.client.input[key] === undefined)
                throw new Error(`${key} 파라미터가 전달되지 않았습니다.`)
        console.log(`[*] ${this.generatorName}에 대한 입력 파라미터 전달중...`, this.client.input)

        this.leftRetryCount = this.MAX_RETRY_COUNT

        this.onGenerateBefore(this.client.input)
        if(this.client.onGenerateBefore) this.client.onGenerateBefore(this.client.input)
        await super.generate()
    }
    onGenerateBefore(inputParams){}
    

    createPrompt(){
        try {

            const prompt = this._assembleSystemContext() + this._buildUserQueryPrompt()

            console.log(`[*] LLM에게 ${this.generatorName}에서 생성된 프롬프트 전달중...`, {prompt})
            this.isFirstResponse = true
            return prompt

        } catch(e) {

            console.error(`[!] ${this.generatorName}에 대한 프롬프트 생성 도중에 오류 발생!`, {inputParams: this.client.input, error:e})
            console.error(e)
            throw e

        }
    }

    _assembleSystemContext(){
        return [
            this.__buildAgentRolePrompt(),
            this.__buildTaskGuidelinesPrompt(),
            this.__buildRequestFormatPrompt(),
            this.__buildResponseFormatPrompt(),
            this.__buildExamplePrompt(),
            this.__getJsonCompressGuidePrompt()
        ].join("\n\n")
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

    __buildExamplePrompt(){
        const inputs = this.__buildJsonExampleInputFormat()
        const jsonOutput = this.__buildJsonExampleOutputFormat()

        if(!inputs || !jsonOutput) return ""
        return `Let me give you an example.
[INPUT]
${Object.entries(inputs).map(([key, value]) => `- ${key.trim()}\n${typeof value === 'string' ? value.trim() : JSON.stringify(value)}`).join("\n\n")}

[OUTPUT]
\`\`\`json
${JSON.stringify(jsonOutput)}
\`\`\`
`
    }
    __buildJsonExampleInputFormat(){ return {} }
    __buildJsonExampleOutputFormat(){ return {} }

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

    _buildUserQueryPrompt(){
        const inputs = this.__buildJsonUserQueryInputFormat()

        if(!inputs) return ""
        return `Now let's process the user's input.
[INPUT]
${Object.entries(inputs).map(([key, value]) => `- ${key.trim()}\n${typeof value === 'string' ? value.trim() : JSON.stringify(value)}`).join("\n\n")}

[OUTPUT]
\`\`\`json
`
    }
    __buildJsonUserQueryInputFormat(){ return {} }


    createModel(text){     
        let returnObj = {
            generatorName: this.generatorName,
            inputParams: this.client.input,
            modelRawValue: text,
            isFirstResponse: this.isFirstResponse,
            leftRetryCount: this.leftRetryCount,
            isStopped: this.stopSignaled,
            actions: {
                stopGeneration: () => {
                    this.stop()
                }
            }
        }
        if(this.isFirstResponse) {
            returnObj.isFirstResponse = this.isFirstResponse
            this.isFirstResponse = false
            this.onFirstResponse(returnObj)
            if(this.client.onFirstResponse) this.client.onFirstResponse(returnObj)
        }
        else
            returnObj.isFirstResponse = this.isFirstResponse


        if(this.progressCheckStrings.length > 0)
            returnObj.progress = this._getProcessPercentage(text)

        // 중지 상태에 대한 별도 처리를 하지 않으면 예외로 인식해서 재시도를 하기 때문에 반드시 있어야 함
        if(returnObj.isStopped) {
            console.log(`[*] ${this.generatorName}에서 결과 생성 중지됨!`)
            returnObj.directMessage = `stopped!`
            this.onStopped(returnObj)
            if(this.client.onStopped) this.client.onStopped(returnObj)
            return returnObj
        }
        
        try {

            if(this.state !== 'end') {
                console.log(`[*] ${this.generatorName}에서 결과 생성중... (현재 출력된 문자 수: ${text.length})`)
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

            
            console.log(`[*] ${this.generatorName}에서 결과 파싱중...`, {text})

            let aiOutput = this._parseToJson(text)

            returnObj = {
                ...returnObj,
                modelValue: {
                    aiOutput: aiOutput // 상속시 해당 값을 활용해서 후속 처리를 수행
                },
                directMessage: `Generating Finished! (${text.length} characters generated)`
            }

            this.onCreateModelFinished(returnObj)
            if(this.client.onCreateModelFinished) this.client.onCreateModelFinished(returnObj)
            console.log(`[*] ${this.generatorName}에서 결과 파싱 완료!`, {returnObj})

            if(!returnObj.isStopped && !returnObj.isError) {
                this.onGenerationSucceeded(returnObj)
                if(this.client.onGenerationSucceeded) this.client.onGenerationSucceeded(returnObj)
            }
            return returnObj

        } catch(e) {

            console.error(`[!] ${this.generatorName}에서 결과 파싱중에 오류 발생!`, {text, error:e})
            console.error(e)
            returnObj = {
                ...returnObj,
                isError: true,
                isDied: this.leftRetryCount <= 0,
                errorMessage: e.message,
                leftRetryCount: this.leftRetryCount,
                directMessage: `An error occurred during creation,` + (this.leftRetryCount <= 0 ? ' the model has died. please try again.' : ' retrying...(' + this.leftRetryCount + ' retries left)')
            }

            this.onError(returnObj)
            if(this.client.onError) this.client.onError(returnObj)

            if(returnObj.isDied) {
                this.onRetry(returnObj)
                if(this.client.onRetry) this.client.onRetry(returnObj)
            }
        
            if(this.leftRetryCount > 0) {
                this.leftRetryCount--
                super.generate()
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

    _parseToJson(aiTextResult){
        let aiTextToParse = ""


        if(aiTextResult.includes("```")) {
            aiTextResult = aiTextResult.replace(/\`\`\`json/g, "```")
            const aiTextResultParts = aiTextResult.split("```")
            aiTextToParse = aiTextResultParts[aiTextResultParts.length - 2].trim()
        } else
            aiTextToParse = aiTextResult.trim()


        // 최대한 다양한 경우를 고려해서 JSON 파싱을 시도함
        let parseStrategies = [
            (text) => JSON.parse(text),                              
            (text) => partialParse(text),              
            (text) => JSON.parse(
                text.replace(/'/g, '"')
                    .replace(/\n/g, '')
                    .replace(/,(\s*[}\]])/g, '$1')
                    .replace(/([{,]\s*)(\w+):/g, '$1"$2":')
            )
        ]

        for(let strategy of parseStrategies) {
            try {
                return strategy(aiTextToParse)
            } catch(e) {
                continue
            }
        }

        throw new Error(`[!] JSON 파싱 중에 오류 발생!`, {aiTextToParse})
    }
}

module.exports = FormattedJSONAIGenerator;