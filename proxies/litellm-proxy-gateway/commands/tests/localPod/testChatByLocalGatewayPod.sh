# Litellm 기반 로컬 Pod 생성 후, 채팅이 유효한지 검증
# cd proxies/litellm-proxy-gateway; bash .\commands\tests\localPod\testChatByLocalGatewayPod.sh
# [!] 테스트를 위해서는 ./commands/runs/localPod/requestChatByLocalGatewayPod.sh에 실제로 유효한 Firebase JWT 토큰이 세팅되어 있어야 합니다.
# [!] 테스트를 위해서는 litellm-proxy 로컬 Pod가 실행되어 있어야 합니다.

RESPONSE=$(bash ./commands/runs/localPod/integratedRunForLocalPod.sh 2>&1)

echo "RESPONSE:"
echo "$RESPONSE"

if echo "$RESPONSE" | grep -q '"choices"' && echo "$RESPONSE" | grep -q '"content"'; then
    echo "✅ TEST PASSED"
    exit 0
else
    echo "❌ TEST FAILED"
    exit 1
fi