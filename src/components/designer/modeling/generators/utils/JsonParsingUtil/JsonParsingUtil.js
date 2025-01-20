let partialParse = null
try{
    const { partialJsonParser } = require('./externals');
    partialParse = partialJsonParser
}catch(e){
    partialParse = function(text){return JSON.parse(text)}
}

class JsonParsingUtil {
    /**
     * @description 다양한 형식의 JSON 문자열을 파싱하여 JavaScript 객체로 변환합니다.
     * 일반 JSON, 작은따옴표 사용 JSON, 따옴표가 없는 키를 가진 JSON 등 다양한 형식을 지원합니다.
     * 여러 파싱 전략을 순차적으로 시도하여 최대한 성공적인 파싱을 보장합니다.
     * 
     * @example 표준 JSON 파싱
     * // 정상적인 JSON 형식의 문자열을 파싱
     * const input = '{"name": "John", "age": 30}'
     * const result = JsonParsingUtil.parseToJson(input)
     * // result: { name: "John", age: 30 }
     * 
     * @example 비표준 JSON 형식 파싱
     * // 작은따옴표 사용, 키에 따옴표가 없는 경우도 처리 가능
     * const input = "{name: 'John', age: 30}"
     * const result = JsonParsingUtil.parseToJson(input)
     * // result: { name: "John", age: 30 }
     * 
     * @example 마크다운 코드 블록 내 JSON 파싱
     * // getTextToParse와 연계하여 마크다운 코드 블록 내의 JSON도 처리
     * const input = "```json\n{name: 'John', age: 30}\n```"
     * const result = JsonParsingUtil.parseToJson(input)
     * // result: { name: "John", age: 30 }
     * 
     * @example 부분 완성된 JSON 파싱
     * // 입력 중이거나 불완전한 JSON 문자열도 파싱 시도
     * const input = '{"name": "John", "age": 30, "address": {'
     * const result = JsonParsingUtil.parseToJson(input)
     * // result: { name: "John", age: 30, address: {} }
     * 
     * // 닫히지 않은 배열도 처리 가능
     * const input2 = '{"items": ["apple", "banana", "ora'
     * const result2 = JsonParsingUtil.parseToJson(input2)
     * // result2: { items: ["apple", "banana"] }
     *
     * @note
     * - 파싱 전략은 다음 순서로 시도됩니다:
     *   1. 기본 JSON.parse
     *   2. 부분 파싱 시도
     *   3. 부분 파싱 시도(키 따옴표 추가 후 파싱)
     *   4. 부분 파싱 시도(작은따옴표 변환 및 키 따옴표 추가 후 파싱)
     * 
     * - 모든 전략이 실패하면 에러를 발생시킵니다
     * - 마크다운 코드 블록 처리는 getTextToParse 메소드를 통해 자동으로 수행됩니다
     * - 부분 완성된 JSON의 경우 partialParse를 통해 처리를 시도합니다
     */
    static parseToJson(text){
        const textToParse = this.getTextToParse(text)

        const parseStrategies = [
            (text) => JSON.parse(text),   
            (text) => partialParse(text),         
            (text) => partialParse(
                text.replace(/([{,]\s*)(?!true|false|null)(\w+):/g, '$1"$2":') // {user: {name: "John"}} > {"user": {"name": "John"}}
            ),
            (text) => partialParse(
                text.replace(/'/g, '"') // 이 전략은 의도치 않은 동작을 일으킬 가능성이 높기 때문에 가장 나중에 시도
                .replace(/([{,]\s*)(?!true|false|null)(\w+):/g, '$1"$2":')
            )
        ]

        for(let strategy of parseStrategies) {
            try {
                return strategy(textToParse)
            } catch(e) {
                continue
            }
        }

        throw new Error(`[!] JSON 파싱 중에 오류 발생!`, {textToParse})
    }

    /**
     * @description JSON 파싱을 위해 입력된 텍스트에서 실제 파싱할 JSON 문자열을 추출합니다.
     * 일반 텍스트와 마크다운 코드 블록(```) 형식 모두를 처리할 수 있습니다.
     * 
     * @example 일반 텍스트에서 JSON 추출
     * // 입력된 텍스트가 마크다운 코드 블록을 포함하지 않는 경우
     * const input = '{"name": "John", "age": 30}'
     * const result = JsonParsingUtil.getTextToParse(input)
     * // result: '{"name": "John", "age": 30}'
     * 
     * @example 마크다운 코드 블록에서 JSON 추출
     * // ```json 형식의 코드 블록에서 JSON 추출
     * const input = '여기 JSON이 있습니다:\n```json\n{"name": "John", "age": 30}\n```'
     * const result = JsonParsingUtil.getTextToParse(input)
     * // result: '{"name": "John", "age": 30}'
     * 
     * @example 부분 완성된 코드 블록 처리
     * // 마지막 코드 블록이 비어있는 경우 이전 블록 사용
     * const input = '```json\n{"name": "Joh'
     * const result = JsonParsingUtil.getTextToParse(input)
     * // result: '{"name": "Joh'
     *
     * @note
     * - 입력 텍스트에 여러 코드 블록이 있는 경우, 마지막에서 두 번째 블록을 우선 사용
     * - 마지막에서 두 번째 블록이 비어있는 경우, 마지막 블록을 사용
     * - ```json 태그는 자동으로 ``` 로 변환되어 처리
     * - 모든 추출된 텍스트는 trim() 처리되어 반환
     */
    static getTextToParse(text){
        let textToParse = ""
        if(text.includes("```")) {
            text = text.replace(/\`\`\`json/g, "```")
            const textParts = text.split("```")
            textToParse = textParts[textParts.length - 2].trim()

            if(!textToParse) // 부분적으로 완성된 경우 해당 값을 사용
                textToParse = textParts[textParts.length - 1].trim()
        } else
            textToParse = text.trim()

        return textToParse
    }
}

module.exports = JsonParsingUtil