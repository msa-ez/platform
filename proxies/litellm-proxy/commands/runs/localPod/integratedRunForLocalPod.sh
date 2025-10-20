# Litellm 기반 로컬 Pod 생성 > 컨테이너 생성 > 로그 확인 > 채팅 요청
# cd proxies/litellm-proxy; bash .\commands\runs\localPod\integratedRunForLocalPod.sh

bash ./commands/runs/localPod/makeLocalPod.sh
bash ./commands/runs/localPod/executeLocalPod.sh

echo "Waiting for 5 seconds..."
sleep 5

bash ./commands/runs/localPod/logLocalPod.sh
bash ./commands/runs/localPod/requestChatByLocalPod.sh