
forEach: k8s.Deployment
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
$ kubectl get all

NAME                         READY   STATUS    RESTARTS   AGE
pod/order-647f5c6d6f-lt27f   1/1     Running   0          14s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.100.0.1   <none>        443/TCP   19s

NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/order   1/1     1            1           15s

NAME                               DESIRED   CURRENT   READY   AGE
replicaset.apps/order-647f5c6d6f   1         1         1       15s

```
- {{object.metadata.name}} {{object.kind}}와 Pod, Replicaset이 모두 확인이 된다면 정상적으로 생성된 것입니다.
#

### 생성된 {{object.metadata.name}} {{object.kind}}의 상세 실행 정보를 확인하시려면 아래의 명령어를 입력하세요.

```
$ kubectl describe {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 상태를 확인하여 문제가 있는지 확인합니다. 
#

### Kubernetes Cluster network 외부에서 service에 access할 때, 해당 명령어로 외부 IP traffic을 허용할 수 있습니다.

```
$ kubectl port-forward {{object.kind}}/{{object.metadata.name}} 8080:{{portNumber object}}
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
</function>