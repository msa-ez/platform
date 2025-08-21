const TokenCounter = require("./TokenCounter");
const { mockDatas } = require("./mocks");

class TokenCounterTest {
    static async test() {
        console.log("=== TokenCounter 테스트 시작 ===\n");

        for (const mockData of mockDatas) {
            const tokenCount = await TokenCounter.getTokenCount(mockData.text, mockData.model);
            console.log(`모델: ${mockData.model} / 텍스트: ${mockData.text} / 토큰 수: ${tokenCount}`);
        }
    }
}

module.exports = TokenCounterTest;