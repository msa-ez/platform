const { FirebaseUtil } = require("../../../../../../../utils")

export default function testFirebaseUtil(commandArgs, client, runner) {
    runner.describe('FirebaseUtil', ({ it }) => {
        it('현재 사용자의 JWT 토큰을 가져올 수 있어야 함', async () => {
            const jwt = await FirebaseUtil.getCurrentUserJWT()
            console.log(`FirebaseUtil JWT token: `, jwt)

            runner.expect(jwt).toBeTruthy()
        });
    });
}