# Ingress.yaml에서 사용하는 cert-manager를 설치
# cd proxies; bash .\commands\runs\k8s\install\installCertManager.sh

kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# 설치 확인
kubectl get pods --namespace cert-manager