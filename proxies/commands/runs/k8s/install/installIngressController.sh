# Ingress.yaml에서 사용하는 Ingress Controller를 설치
# cd proxies; bash .\commands\runs\k8s\install\installIngressController.sh

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml