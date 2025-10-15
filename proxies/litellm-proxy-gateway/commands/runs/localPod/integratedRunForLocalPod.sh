# Litellm 기반 로컬 Proxy Pod 생성 > 컨테이너 생성 > 로그 확인 > 채팅 요청
# cd proxies/litellm-proxy-gateway; bash .\commands\runs\localPod\integratedRunForLocalPod.sh
# [!] 테스트를 위해서는 ./requestChatByLocalGatewayPod.sh에 실제로 유효한 Firebase JWT 토큰이 세팅되어 있어야 합니다.
# [!] 테스트를 위해서는 litellm-proxy 로컬 Pod가 실행되어 있어야 합니다.

bash ./commands/runs/localPod/makeLocalPod.sh
bash ./commands/runs/localPod/executeLocalPod.sh

echo "Waiting for 5 seconds..."
sleep 5

bash ./commands/runs/localPod/logLocalPod.sh
bash ./commands/runs/localPod/requestChatByLocalGatewayPod.sh