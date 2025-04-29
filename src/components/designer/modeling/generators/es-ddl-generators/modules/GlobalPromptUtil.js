class GlobalPromptUtil {
    /**
     * JSON 출력에서 불필요한 공백을 없애고 압축된 형태로 반환하도록 지시하는 프롬프트 얻기
     * @example
     * GlobalPromptUtil.getJsonCompressGuidePrompt()
     * @returns 상세한 AI 프롬프트 설명
     */
    static getJsonCompressGuidePrompt() {
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

    /**
     * Markdown 형식의 JSON 문자열을 적합한 JSON 형식으로 반환
     * 일부 불완전한 경우에도 최대한 다양한 경우를 고려해서 파싱을 시도함
     * @example
     * GlobalPromptUtil.parseToJson(aiTextResult)
     * @returns 적합한 JSON 형식으로 변환된 객체
     */
    static parseToJson(aiTextResult){
        let aiTextToParse = ""


        if(aiTextResult.includes("```")) {
            aiTextResult = aiTextResult.replace(/\`\`\`json/g, "```")
            const aiTextResultParts = aiTextResult.split("```")
            aiTextToParse = aiTextResultParts[aiTextResultParts.length - 2].trim()
        } else
            aiTextToParse = aiTextResult.trim()


        let parseStrategies = [
            (text) => JSON.parse(text),
            (text) => JSON.parse(text + "}"),
            (text) => JSON.parse("{" + text),
            (text) => JSON.parse("{" + text + "}"),
            (text) => JSON.parse(text.replace(/'/g, '"')),
            (text) => JSON.parse(text.replace(/\n/g, '')),
            (text) => JSON.parse(text.replace(/,\s*}/g, '}')),
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

    /**
     * 이벤트스토밍에서 사용하는 형식의 UUID 값을 반환
     * @returns 
     */
    static getUUID(){
        const s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
    }
}

module.exports = GlobalPromptUtil