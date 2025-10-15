# Deployment만 GCP로 최종적으로 배포
# cd proxies; bash .\commands\runs\k8s\deploy\deployOnlyDeploymentToGTP.sh

kubectl delete -f litellm-proxy-gateway/k8s/deployment.yaml
kubectl apply -f litellm-proxy-gateway/k8s/deployment.yaml