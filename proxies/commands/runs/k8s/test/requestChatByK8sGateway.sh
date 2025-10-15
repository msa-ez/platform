# K8s로 실제로 배포된 service/litellm-proxy-gateway-service에 대한 요청 수행
# cd proxies; bash .\commands\runs\k8s\test\requestChatByK8sGateway.sh
# [!] 테스트를 위해서는 실제로 유효한 Firebase JWT 토큰이 필요합니다.

GATEWAY_IP=34.64.97.116.nip.io
YOUR_FIREBASE_TOKEN=
curl -X POST https://$GATEWAY_IP/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $YOUR_FIREBASE_TOKEN" \
  -d '{
    "model": "gpt-4.1-proxy",
    "messages": [
      { "role": "user", "content": "Hello, this is a test from local docker." }
    ]
  }'