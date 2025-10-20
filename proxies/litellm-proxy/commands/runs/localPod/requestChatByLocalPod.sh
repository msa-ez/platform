# 생성된 Litellm 기반 로컬 Pod에 대한 채팅 요청
# cd proxies/litellm-proxy; bash .\commands\runs\localPod\requestChatByLocalPod.sh

curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1-proxy",
    "messages": [
      { "role": "user", "content": "Hello, this is a test from local docker." }
    ]
  }'