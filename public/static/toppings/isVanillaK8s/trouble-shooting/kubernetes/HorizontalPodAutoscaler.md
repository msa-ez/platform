
forEach: k8s.HorizontalPodAutoscaler
fileName: {{object.metadata.name}}.md
path: trouble-shooting/kubernetes/{{object.kind}}
---

#### Object: {{object.metadata.name}}
#### Type: {{object.kind}}

### Cluster에 {{object.metadata.name}} {{object.kind}}를 생성하려면 아래의 명령어를 실행하세요.

```
kubectl create -f {{{yamlPath}}}
```
- Yaml 파일에 명시된 스펙으로 {{object.metadata.name}} {{object.kind}}를 생성합니다.

```
kubectl apply -f {{{yamlPath}}}
```
- Create가 된 상태라면 {{object.metadata.name}} {{object.kind}}의 수정이 이루어지고, Create가 된 상태가 아니라면 {{object.metadata.name}} {{object.kind}}를 Create 해주는 명령어입니다.  
#

### Menual Scale Out 적용을 하려면 아래의 명령어를 실행하세요.
```
kubectl scale deploy <Deployment_name> --replicas=3
# 서비스가 3개로 확장된다.
kubectl scale deploy <Deployment_name> --replicas=1
```
#

### {{object.metadata.name}} {{object.kind}}가 정상적으로 생성되었는지 확인하시려면 아래의 명령어를 실행하세요.

```
kubectl get {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}가 확인이 되신다면 정상 생성이 된 것 입니다.
> HPA는 워크로드의 CPU 또는 메모리를 측정하여 작동하기 때문에 Kubernetes 에 metric server가 필수적으로 설치되어 있어야 합니다.  
#

### 부하 테스트 Pod를 설치하시려면 아래의 명령어를 실행하세요.

```
kubectl apply -f - <<EOF
apiVersion: v1
kind: Pod
metadata:
  name: siege
spec:
  containers:
  - name: siege
    image: apexacme/siege-nginx
EOF
```

```
kubectl exec -it siege -- /bin/bash
siege -c1 -t2S -v http://order:8080/orders
exit
```
- 생성된 siege Pod 안쪽에서 정상 작동을 확인합니다.
#

### Metric server 설치 확인을 하시려면 아래의 명령어를 실행하세요.

```
kubectl top pods

NAME                     CPU(cores)   MEMORY(bytes)   
order-684647ccf9-ltlqg   3m           288Mi           
siege                    0m           8Mi  

```
- kubectl top pods를 실행했을 때, 위와 같이 정보가 나오면 설치가 되어있는 것입니다.

```
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl get deployment metrics-server -n kube-system
```
- “error: Metrics API not available” 메시지가 나오면 metric server가 설치되지 않은 것으로 위와 같은 명령어로 설치합니다.
#

### Auto Scale-out 설정을 하시려면 아래의 명령어를 참고하세요.

```
kubectl autoscale deployment <Deployment_name> --cpu-percent=50 --min=1 --max=3
```
- "cpu-percent=50 : Pod 들의 요청 대비 평균 CPU 사용율 (여기서는 요청이 200 milli-cores이므로, 모든 Pod의 평균 CPU 사용율이 100 milli-cores(50%)를 넘게되면 HPA 발생)"

```
kubectl get hpa

NAME    REFERENCE          TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
order   Deployment/order   <unknown>/20%   1         3         0          7s
```
- 설정 값을 확인해봅니다.
#

### Auto Scale-out 증명을 하시려면 아래의 내용을 참고하세요.

```
kubectl exec -it siege -- /bin/bash
siege -c20 -t40S -v http://<Deployment_name>:8080/<Deployment_names>
exit
```
- seige 명령으로 부하를 주어서 Pod 가 늘어나도록 합니다.

```
kubectl get po -w

order-7b76557b8f-bgptv   1/1     Running             0          34m
siege                    1/1     Running             0          33m
order-7b76557b8f-7g9d6   0/1     Pending             0          0s
order-7b76557b8f-hmssb   0/1     Pending             0          0s
order-7b76557b8f-7g9d6   0/1     ContainerCreating   0          0s
order-7b76557b8f-hmssb   0/1     ContainerCreating   0          0s
order-7b76557b8f-7g9d6   0/1     Running             0          6s
order-7b76557b8f-hmssb   0/1     Running             0          6s
order-7b76557b8f-7g9d6   1/1     Running             0          23s
order-7b76557b8f-hmssb   1/1     Running             0          27s

```
- 새로운 터미널에서 pod 가 생성되었는지 확인합니다.

```
kubectl get hpa

NAME    REFERENCE          TARGETS     MINPODS   MAXPODS   REPLICAS   AGE
order   Deployment/order   1152%/20%   1         3         3          37m
```
- kubectl get hpa 명령어로 CPU 값이 늘어난 것을 확인합니다.
#

### 생성된 {{object.metadata.name}} {{object.kind}}의 상세 실행 정보를 확인하시려면 아래의 명령어를 입력하세요.

```
Kubectl describe {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 실행 정보 상태를 확인하여 문제가 있는지 확인합니다. 
#

### {{object.metadata.name}} {{object.kind}}를 삭제하려면 아래의 명령어를 실행하세요.

```
kubectl delete {{object.kind}} {{object.metadata.name}}
```
#