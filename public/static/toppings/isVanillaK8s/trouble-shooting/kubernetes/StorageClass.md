
forEach: k8s.StorageClass
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
- StorageClass는 자동으로 볼륨을 생성 & 할당(Dynamic Provisioning)할 수 있게 합니다.

```
kubectl apply -f {{{yamlPath}}}
```
- Create가 된 상태라면 {{object.metadata.name}} {{object.kind}}의 수정이 이루어지고, Create가 된 상태가 아니라면 {{object.metadata.name}} {{object.kind}}를 Create 해주는 명령어입니다.  
#

### StorageClass(Dynamic PV Provisioning)를 확인하시려면 아래의 명령어를 실행하세요.

```
kubectl get {{object.kind}}

NAME            PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
gp2 (default)   kubernetes.io/aws-ebs   Delete          WaitForFirstConsumer   false                  2d1h

```
- 위와 같은 결과가 출력되었는지 확인합니다.
#

### 파일 시스템 생성 후, 아래를 참고하여 EFS 프로비저너를 등록하세요.

```
# ServiceAccount 생성

kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: efs-provisioner
EOF	
```
- EFS 연계를 위한 EKS 계정 생성 및 Role을 설정합니다.

```
kubectl apply -f https://raw.githubusercontent.com/event-storming/container-orchestration/master/yaml/volume/aws/efs-rbac.yaml
```
- 서비스 계정(efs-provisioner)에 권한(rbac)을 설정합니다.

```
# EKS에 EFS 프로비저너 설치

apiVersion: apps/v1
kind: Deployment
metadata:
  name: efs-provisioner
spec:
  replicas: 1
  strategy:
    type: Recreate
  selector:
    matchLabels:
      app: efs-provisioner
  template:
    metadata:
      labels:
        app: efs-provisioner
    spec:
      serviceAccount: efs-provisioner
      containers:
        - name: efs-provisioner
          image: quay.io/external_storage/efs-provisioner:latest
          env:
            - name: FILE_SYSTEM_ID
              value: # {efs system id}
            - name: AWS_REGION
              value: # {region code}
            - name: PROVISIONER_NAME
              value: my-aws.com/aws-efs
          volumeMounts:
            - name: pv-volume
              mountPath: /persistentvolumes
      volumes:
        - name: pv-volume
          nfs:
            server: # {efs dns server name}
            path: /

```
- 위의 YAML을 복사하여 efs-provisioner.yaml을 생성합니다.
> 이 중, FILE_SYSTEM_ID, AWS_REGION, volumes.nfs.server 정보를 수정합니다.
>> value: #{efs system id} => 파일 시스템 ID
>> value: # {aws region} => EKS 리전
>> server: # {file-system-id}.efs.{aws-region}.amazonaws.com

```
kubectl apply -f efs-provisioner.yaml
```
- NFS 생성을 위한 Provisioner를 설치합니다.

```
kubectl apply -f - <<EOF
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: aws-efs
provisioner: my-aws.com/aws-efs
EOF
```
- 생성된 Provisioner를 StorageClass에 등록합니다.

```
kubectl get sc

NAME            PROVISIONER             RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
aws-efs         my-aws.com/aws-efs      Delete          Immediate              false                  4s
gp2 (default)   kubernetes.io/aws-ebs   Delete          WaitForFirstConsumer   false
```
- 위와 같은 결과가 출력되었는지 확인합니다.
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