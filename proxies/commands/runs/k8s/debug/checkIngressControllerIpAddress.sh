# Ingress Controller의 IP 주소 확인
# cd proxies; bash .\commands\runs\k8s\debug\checkIngressControllerIpAddress.sh

kubectl get svc -n ingress-nginx -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}'