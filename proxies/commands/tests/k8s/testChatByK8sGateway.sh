# K8s로 실제로 배포된 service/litellm-proxy-gateway-service에 대한 요청 수행해서 결과를 검증
# cd proxies; bash .\commands\tests\k8s\testChatByK8sGateway.sh
# [!] 테스트를 위해서는 ./commands/runs/k8s/test/requestChatByK8sGateway.sh에 실제로 유효한 Firebase JWT 토큰 및 게이트웨이 IP 주소가 세팅되어 있어야 합니다.

RESPONSE=$(bash ./commands/runs/k8s/test/requestChatByK8sGateway.sh 2>&1)

echo "RESPONSE:"
echo "$RESPONSE"

if echo "$RESPONSE" | grep -q '"choices"' && echo "$RESPONSE" | grep -q '"content"'; then
    echo "✅ TEST PASSED"
    exit 0
else
    echo "❌ TEST FAILED"
    exit 1
fi