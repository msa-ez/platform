# k8s에서 사용 할 litellm-proxy, litellm-proxy-gateway 이미지를 빌드
# cd proxies; bash .\commands\runs\k8s\deploy\buildK8sImages.sh

docker build -t asia-northeast3-docker.pkg.dev/eventstorming-tool-db/eventstorming-repo/litellm-proxy:latest ./litellm-proxy --no-cache
docker push asia-northeast3-docker.pkg.dev/eventstorming-tool-db/eventstorming-repo/litellm-proxy:latest

docker build -t asia-northeast3-docker.pkg.dev/eventstorming-tool-db/eventstorming-repo/litellm-proxy-gateway:latest ./litellm-proxy-gateway --no-cache
docker push asia-northeast3-docker.pkg.dev/eventstorming-tool-db/eventstorming-repo/litellm-proxy-gateway:latest