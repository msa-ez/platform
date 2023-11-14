
forEach: k8s.Pod
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

### {{object.metadata.name}} {{object.kind}}가 정상적으로 생성되었는지 확인하시려면 아래의 명령어를 실행하세요.

```
kubectl get {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}가 확인이 되신다면 정상 생성이 된 것 입니다.  

> 보류 중인(Pending) 파드가 있나요?
>> ~$ kubectl describe {{object.kind}} {{object.metadata.name}}

> 파드(Pod)가 노드에 할당되었나요?
>> 할당되지 않았다면 쿠버 스케줄러(Scheduler)에 문제가 있습니다.

> 파드(Pod)가 동작 중(Runnging) 인가요?
>> 파드가 준비된(Ready) 상태인가요?
>>> Ready 상태라면, kubectl port-forward pod/{{object.metadata.name}} 8080:{{portNumber object}} 을 실행하세요.
>>> Ready 상태가 아니라면, kubectl describe pod {{object.metadata.name}}을 실행하여 상태를 확인하세요.  
#

### 생성된 {{object.metadata.name}} {{object.kind}}의 상세 실행 정보를 확인하시려면 아래의 명령어를 입력하세요.

```
Kubectl describe {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 상태를 확인하고 문제가 발생했다면 아래의 트러블 슈팅을 진행해보세요.  

> 파드상태가 이미지를 가져올 수 없는(ImagePullBackOff) 상태인가요?
>> kubectl describe {{object.kind}}/{{object.metadata.name}}
>> 이미지 이름이 정확한지 확인하세요.
>> 이미지 태그(Tag)가 유효한지 확인하세요.
>> 컨테이너 이미지를 Private Registry에서 가져오도록 설정하세요.
>>> 설정은 잘 되어있다면 CRI(Container Runtime Interface)나 Kublet에 문제가 있을 수도 있습니다.

> 파드상태가 비정상 종료를 반복(CrashLoopBackOff) 하고 있나요?
>> kubectl logs -f {{object.kind}}/{{object.metadata.name}}
>> 로그를 확인하고 애플리케이션의 문제를 해결하세요.
>> 도커파일(Dockerfile)에 실행 명령이 존재하는지 확인하세요.
>> 파드 상태가 Running과 CrashLoopBackOff으로 계속 바뀐다면 Liveness probe설정을 수정하세요.

> 파드상태가 컨테이너 실행 오류(RunContainerError) 인가요?
>> 컨테이너의 구성에 문제가 있습니다.
>> 아니라면 실행 중(Running)인 컨테이너가 있나요?
>>> 노드 생명주기 컨트롤러(node-lifecycle controller)와 관련된 문제입니다.

> Readiness porbe의 결과가 실패인가요?
>> 맞다면 Readiness probe의 설정을 수정하세요.
>> 아니라면 알려지지 않은(Unknown) 상태입니다.

> 엔드포인트(endpoints) 목록이 확인되나요?
>> 목록이 확인된다면, kubectl port-forward service/{{object.metadata.name}} 8080:{{portNumber object}}
>> 목록 확인이 안됀다면 서비스 셀렉터(Selector)와 파드 Label이 일치하는지 확인하세요.
>> 목록 확인이 안됀다면 파드에 IP 주소가 할당되어 있나요?
>>> 할당되어 있다면 쿠버 컨트롤러 매니저(controller manager)에 문제가 있습니다.
>>> 할당되어있지 않다면 Kubelet에 문제가 있습니다.

> 백엔드(Backend) 목록이 확인되나요?
>> 확인된다면, kubectl port-forward {{object.metadata.name}} 8080:{{portNumber object}}
>> 학인되지 않는다면 Ingress의 서비스 이름과 포트가 실제 서비스의 이름과 포트가 일치하는지 확인하세요.
>>> 일치하지만 애플리케이션에 접근할 수 없다면 Ingress Controller의 문제이므로 관련 문서를 참고하세요.
#

### Kubernetes Cluster network 외부에서 service에 access할 때, 해당 명령어로 외부 IP traffic을 허용할 수 있습니다.

```
kubectl port-forward {{object.kind}}/{{object.metadata.name}} 8080:{{portNumber object}}
```
#

### {{object.metadata.name}} {{object.kind}}의 로그 기록을 확인하려면 아래의 명령어를 실행하세요.

```
# logs of deployment
kubectl logs {{object.kind}}/{{object.metadata.name}}

# follow logs
kubectl logs -f {{object.kind}}/{{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 로그 기록을 통해 이슈를 확인할 수 있습니다. 
#

### {{object.metadata.name}} {{object.kind}}를 삭제하려면 아래의 명령어를 실행하세요.

```
kubectl delete {{object.kind}} {{object.metadata.name}}
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
</function>