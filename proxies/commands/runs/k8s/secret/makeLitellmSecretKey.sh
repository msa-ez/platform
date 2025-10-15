# k8s litellm에서 사용 할 수 있는 Secret Key 생성
# cd proxies; bash .\commands\runs\k8s\secret\makeLitellmSecretKey.sh

kubectl create secret generic litellm-secrets \
  --from-literal=openai-api-key=$OPENAI_API_KEY