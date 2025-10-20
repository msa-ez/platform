# Litellm 기반 로컬 Pod 생성 후, 채팅이 유효한지 검증
# cd proxies/litellm-proxy; bash .\commands\tests\localPod\testChatByLocalPod.sh

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