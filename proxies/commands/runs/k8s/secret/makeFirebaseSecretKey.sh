# 파이어베이스 JWT 인증에 사용할 수 있는 Secret Key 생성
# cd proxies; bash .\commands\runs\k8s\secret\makeFirebaseSecretKey.sh

kubectl create secret generic firebase-key \
  --from-file=serviceAccountKey.json=./litellm-proxy-gateway/.auth/serviceAccountKey.json