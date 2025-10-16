const { LitellmProxyUtil } = require("../../../../../../../utils")

export default function testLitellmProxyUtil(commandArgs, client, runner) {
    runner.describe('LitellmProxyUtil', ({ it }) => {
        it('Chat Completions URL을 가져올 수 있어야 함', async () => {
            const url = await LitellmProxyUtil.getChatCompletionsURL()
            console.log(`LitellmProxyUtil Chat Completions URL: `, url)

            // 브라우저 요청인 경우에는 'https' 프로토콜로 통신해야 함
            runner.expect(url.includes('https://')).toBeTruthy()

            // OpenAI 표준 통신 엔드포인트
            runner.expect(url.includes('/v1/chat/completions')).toBeTruthy()
        });
    });
}