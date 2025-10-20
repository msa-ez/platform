# GCP로 최종적으로 배포
# cd proxies; bash .\commands\runs\k8s\deploy\deplayToGCP.sh

# 1. cert-manager와 NGINX Ingress Controller 설치 확인
kubectl get pods -n cert-manager
kubectl get pods -n ingress-nginx

# 2. ClusterIssuer 생성
kubectl apply -f litellm-proxy-gateway/k8s/cert-issuer.yaml

# 3. Deployment & Service 배포
kubectl delete -f litellm-proxy-gateway/k8s/deployment.yaml
kubectl delete -f litellm-proxy-gateway/k8s/service.yaml

kubectl apply -f litellm-proxy-gateway/k8s/deployment.yaml
kubectl apply -f litellm-proxy-gateway/k8s/service.yaml

# 4. Ingress 배포
kubectl delete -f litellm-proxy-gateway/k8s/ingress.yaml
kubectl apply -f litellm-proxy-gateway/k8s/ingress.yaml

# 5. 인증서 발급 확인 (1-2분 소요)
kubectl get certificate
kubectl describe certificate litellm-gateway-tls