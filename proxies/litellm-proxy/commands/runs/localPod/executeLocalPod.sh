# 생성된 Litellm 기반 로컬 Pod를 실행
# cd proxies/litellm-proxy; bash .\commands\runs\localPod\executeLocalPod.sh
# [!] $OPENAI_API_KEY 환경변수가 세팅되어 있어야 함

# $OPENAI_API_KEY가 세팅되어 있지 않으면 경고 후 종료
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠ Warning: OPENAI_API_KEY is not set"
    echo "Please set it with: export OPENAI_API_KEY=your-key"
    exit 1
fi

# 기존 컨테이너가 존재하면 중지 및 삭제
docker stop litellm-proxy-container 2>/dev/null || true
docker rm litellm-proxy-container 2>/dev/null || true

docker run -d \
  -p 4000:4000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  --name litellm-proxy-container \
  litellm-proxy:v1