const JsonParsingUtil = require("./JsonParsingUtil")
const { particalTexts, particalAITexts } = require("./mocks")

class JsonParsingUtilTest {
    static async test() {
        console.log("[*] ### 기본적인 부분 텍스트 파싱 테스트 ###")
        for(let text of particalTexts) {
            try {

                console.log(`[*] 파싱 시도 중...`, {text})
                const json = JsonParsingUtil.parseToJson(text)
                console.log(`[*] 파싱 완료!`, {json})
            
            } catch(e) {
                console.error(`[!] 파싱 실패!`, {text})
            }
        }

        console.log("[*] ### AI 출력에 따른 텍스트 파싱 테스트 ###")
        for(let text of particalAITexts) {
            try {

                console.log(`[*] 파싱 시도 중...`, {text})
                const json = JsonParsingUtil.parseToJson(text)
                console.log(`[*] 파싱 완료!`, {json})
                
            } catch(e) {
                console.error(`[!] 파싱 실패!`, {text})
            }
        }
    }
}

module.exports = JsonParsingUtilTest