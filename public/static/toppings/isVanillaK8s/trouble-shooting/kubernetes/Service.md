
forEach: k8s.Service
fileName: {{object.metadata.name}}.md
path: kubernetes/docs/{{object.kind}}
---

#### Object: {{object.metadata.name}}
#### Type: {{object.kind}}

### Cluster에 {{object.metadata.name}} {{object.kind}}를 생성하려면 아래의 명령어를 실행하세요.

```
$ kubectl create -f {{{yamlPath}}}
```
- Yaml 파일에 명시된 스펙으로 {{object.metadata.name}} {{object.kind}}를 생성합니다.

```
$ kubectl apply -f {{{yamlPath}}}
```
- Create가 된 상태라면 {{object.metadata.name}} {{object.kind}}의 수정이 이루어지고, Create가 된 상태가 아니라면 {{object.metadata.name}} {{object.kind}}를 Create 해주는 명령어입니다.  
#

### {{object.metadata.name}} {{object.kind}}가 정상적으로 생성되었는지 확인하시려면 아래의 명령어를 실행하세요.

```
$ kubectl get {{object.kind}}

NAME         TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)    AGE
kubernetes   ClusterIP   10.100.0.1       <none>        443/TCP    4m58s
order        ClusterIP   10.100.244.220   <none>        8080/TCP   2m24s

```
- {{object.metadata.name}} {{object.kind}}가 확인이 되신다면 정상 생성이 된 것 입니다.  
#

### 생성된 {{object.metadata.name}} {{object.kind}}의 상세 실행 정보를 확인하시려면 아래의 명령어를 입력하세요.

```
$ Kubectl describe {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 실행 정보 상태를 확인하여 문제가 있는지 확인합니다. 
#

### 생성된 {{object.metadata.name}} {{object.kind}}에 접속하여 서비스가 정상 동작하는지 테스트 해보세요.

```
kubectl create deploy {{object.metadata.name}} --image=ghcr.io/docker_id/docker_image:latest
```
- 대상 컨테이너를 생성합니다.

```
kubectl expose deploy order --type=ClusterIP --port={{portNumber object}} --target-port={{targetPortNumber object}}
# 생성된 ClusterIP 정보확인
kubectl get service 
# Selector 확인
kubectl get service {{object.metadata.name}} -o yaml
```
- ClusterIP Type Service를 생성합니다.

```
$ kubectl apply -f - <<EOF
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
- 새로운 터미널에서 클라이언트용 컨테이너를 생성하고 접속합니다.
- 위의 스크립트를 terminal 에 복사하여 siege 라는 Pod 를 생성합니다. 

```
$ kubectl exec -it siege -- /bin/bash
http http://10.x.x.x:{{portNumber object}}
exit
```
- 생성된 siege Pod 안쪽에서 {{object.metadata.name}} {{object.kind}}의 ClusterIP로 접근해봅니다.
#

### Kubernetes Cluster network 외부에서 service에 access할 때, 해당 명령어로 외부 IP traffic을 허용할 수 있습니다.

```
$ kubectl port-forward {{object.kind}}/{{object.metadata.name}} 8080:{{portNumber object}}

# 접속 테스트
http :{{portNumber object}}
```
#

### {{object.metadata.name}} {{object.kind}}를 삭제하려면 아래의 명령어를 실행하세요.

```
$ kubectl delete {{object.kind}} {{object.metadata.name}}
```
#

<function>
  window.$HandleBars.registerHelper('portNumber', function (object) {
      var port = ''

      if(object.kind=='Service'){
          port = object.spec.ports[0].port
      }else if(object.kind=='Deployment'){
          port = object.spec.template.spec.containers[0].ports[0].containerPort
      }else if(object.kind=='Pod'){
          port = object.spec.containers[0].ports[0].containerPort
      }

      return port;
  })

  window.$HandleBars.registerHelper('targetPortNumber', function (object) {
      var port = ''

      if(object.kind=='Service'){
          port = object.spec.ports[0].targetPort
      }

      return port;
  })
</function>