
forEach: k8s.PersistentVolumeClaim
fileName: {{object.metadata.name}}.md
path: kubernetes/docs/{{object.kind}}
---

#### Object: {{object.metadata.name}}
#### Type: {{object.kind}}

### Cluster에 {{object.metadata.name}} {{object.kind}}를 생성하려면 아래의 명령어를 실행하세요.

```
kubectl create -f {{{yamlPath}}}
```
- Yaml 파일에 명시된 스펙으로 {{object.metadata.name}} {{object.kind}}를 생성합니다.
- PersistentVolumeClaim(PVC)는 사용자가 storage를 요청한 것으로 PV를 resource로 사용합니다.

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
> 기본으로 장착된 gp2라고 하는 StorageClass 를 통해서 얻을 수 있으며, PVC가 생성되면 DB pod 의 pending 이 해제될 것입니다.  
#

### EFS Provisioner를 사용하는 PVC를 생성하시려면 아래의 명령어를 실행하세요.
```
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: aws-efs
  labels:
    app: test-pvc
spec:
  accessModes:
  - ReadWriteMany
  resources:
    requests:
      storage: 1Mi
  storageClassName: aws-efs
	EOF
```
- "persistentvolumeclaim/{{object.metadata.name}} created"라는 문구가 출력되면 정상 생성된 것입니다.

```
kubectl get pvc

NAME      STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE
aws-efs   Bound                                        aws-efs        59s
```
- PVC를 조회하여 위와 같은 결과가 출력되는지 확인합니다.
#

### NFS 볼륨을 가지는 마이크로서비스를 배포하시려면 아래의 명령어를 참고하세요.
```
kubectl apply -f - <<EOF
kind: Pod
apiVersion: v1
metadata:
  name: <Servicce_name>
spec:
  containers:
  - name: order
    image: ghcr.io/<docker_id>/<image_name>:latest
    resources:
      requests:
        cpu: 100m
        memory: 128Mi
      limits:
        cpu: 250m
        memory: 256Mi
    volumeMounts:
    - mountPath: "/mnt/data"
      name: volume
  volumes:
    - name: volume
      persistentVolumeClaim:
        claimName: aws-efs
EOF
```

```
kubectl exec -it [ORDER POD 객체] -- /bin/sh
ls /mnt/data
```
- 배포 후 서비스 컨테이너에 접속하여 파일시스템이 제대로 마운트되었는지 확인합니다.
#

### 생성된 {{object.metadata.name}} {{object.kind}}의 상세 실행 정보를 확인하시려면 아래의 명령어를 입력하세요.

```
Kubectl describe {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 실행 정보 상태를 확인하여 문제가 있는지 확인합니다. 
> Volume mount 에 대한 설정변경은 apply만 해서는 반영이 될 수 없으며, 이를 해결하기 위해서는 완전히 기존 DB 설정을 삭제한 후 다시 기동해주어야 합니다.
#

### {{object.metadata.name}} {{object.kind}}를 삭제하려면 아래의 명령어를 실행하세요.

```
kubectl delete {{object.kind}} {{object.metadata.name}}
```
#