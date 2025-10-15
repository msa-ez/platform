# 현재 배포된 litellm-proxy Pod에 대한 로그 확인
# cd proxies; bash .\commands\runs\k8s\debug\logLitellmProxy.sh

kubectl logs -f deployment.apps/litellm-proxy