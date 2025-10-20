# docker-compose로 생성된 로컬 Pod에 대한 채팅 요청
# cd proxies; bash .\commands\runs\dockerCompose\requestChatByLocalProxyPod.sh
# [!] 테스트를 위해서는 실제로 유효한 Firebase JWT 토큰이 필요합니다.

YOUR_FIREBASE_TOKEN=
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $YOUR_FIREBASE_TOKEN" \
  -d '{
    "model": "gpt-4.1-proxy",
    "messages": [
      { "role": "user", "content": "Hello, this is a test from local docker." }
    ]
  }'