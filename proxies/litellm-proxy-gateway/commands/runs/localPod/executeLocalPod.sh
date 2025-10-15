# 생성된 litellm-proxy-gateway 로컬 Pod를 실행
# cd proxies/litellm-proxy-gateway; bash .\commands\runs\localPod\executeLocalPod.sh

# 기존 컨테이너가 존재하면 중지 및 삭제
docker stop litellm-proxy-gateway-container 2>/dev/null || true
docker rm litellm-proxy-gateway-container 2>/dev/null || true

docker run -d \
  -p 3000:3000 \
  -e LITELLM_URL=http://host.docker.internal:4000 \
  -e FIREBASE_PROJECT_ID=eventstorming-tool-db \
  --name litellm-proxy-gateway-container \
  litellm-proxy-gateway:v1