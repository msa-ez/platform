
forEach: k8s.PersistentVolume
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
- PersistentVolume(PV)은 관리자가 provisioning 했거나 Storage Class를 사용하여 동적으로 provisioning 된 cluster의 storage입니다.

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
#

### 서비스 YAML에 Database(MySQL) 설정 및 컨테이너 플랫폼에서 저장소 정보를 주입하여 Database에 접근 가능하도록 설정 해주세요.
```
spring:
  jpa:
    hibernate:
      naming:
        physical-strategy: org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
      ddl-auto: update
    properties:
      hibernate:
        show_sql: true
        format_sql: true
        dialect: org.hibernate.dialect.MySQL57Dialect
  datasource:
    url: jdbc:mysql://${_DATASOURCE_ADDRESS:35.221.110.118:3306}/${_DATASOURCE_TABLESPACE:my-database}
    username: ${_DATASOURCE_USERNAME:root1}
    password: ${_DATASOURCE_PASSWORD:secretpassword}
    driverClassName: com.mysql.cj.jdbc.Driver
```
- 변경한 정보를 환경변수에서 얻어오도록 설정하였고, Deployment에서 값이 전달되도록 주입할 수 있습니다.

```
apiVersion: "apps/v1"
kind: "Deployment"
metadata: 
  name: "<Service_name>"
  labels: 
    app: "<Service_name>"
spec: 
  selector: 
    matchLabels: 
      app: "<Service_name>"
  replicas: 1
  template: 
    metadata: 
      labels: 
        app: "<Service_name>"
    spec: 
      containers: 
        - 
          name: "<Service_name>"
          image: "<docker_id>/<image_name>:latest"
          ports: 
            - 
              containerPort: 8080
          env:
            - name: superuser.userId
              value: some_value					
            - name: _DATASOURCE_ADDRESS
              value: mysql
            - name: _DATASOURCE_TABLESPACE
              value: orderdb
            - name: _DATASOURCE_USERNAME
              value: root
            - name: _DATASOURCE_PASSWORD
              value: admin
```
- 위의 Database 환경정보를 가진 YAML을 복사하여 Deployment.yaml에 입력해주세요.
- Service 및 Docker image의 내용을 수정해주세요.

```
kubectl apply -f deployment.yaml
kubectl get po # pod 명 확인
kubectl logs <pod 명>

# 로그 내용
Caused by: java.net.UnknownHostException: mysql: Name does not resolv
```
- Deployment를 apply하고 log을 확인해보면 위와 같은 오류가 발견됩니다.
- 우리가 제공한 DB server 의 주소를 환경변수로 잘 받아왔고 (mysql), 그 주소로 접근을 시도했으나 서비스가 올라있지 않으므로 발생하는 오류입니다.

```
# Secret 스펙을 "---(Triple dash)"를 포함하여 deployment.yaml 맨 아래에 추가하여 붙여넣어주세요.
---
apiVersion: v1
kind: Secret
metadata:
  name: mysql-pass
type: Opaque
data:
  password: YWRtaW4=
```
- 값을 위와 같이 Deployment 설정에 직접 입력하는것은 별도의 Configuration 을 위한 쿠버네티스 객체인 ConfigMap (혹은 Secret)을 선언하여 연결할 수 있습니다. 
- 여기서는 패스워드가 노출되면 안되므로 PASSWORD 에 대해서만 Secret 을 이용하여 분리해줍니다.
- "YWRtaW4="는 ‘admin’ 문자열의 BASE64 인코딩된 문자열로, “echo -n ‘admin’ | base64” 명령을 통해 생성이 가능합니다.

```
kubectl apply -f deployment.yaml 

secret/mysql-pass created

#생성된 secret 확인
kubectl get secrets

NAME                  TYPE                                  DATA   AGE
default-token-l7t7b   kubernetes.io/service-account-token   3      4h24m
mysql-pass            Opaque                                1      1m
```

```
# 전체를 복사하여 deployment.yaml의 env: 부분을 덮어씌워 주세요.
         env:
            - name: superuser.userId
              value: userId
            - name: _DATASOURCE_ADDRESS
              value: mysql
            - name: _DATASOURCE_TABLESPACE
              value: orderdb
            - name: _DATASOURCE_USERNAME
              value: root
            - name: _DATASOURCE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-pass
                  key: password
```
- 생성된 Secret을 Service Deployment.yaml에 반영합니다.
#

### Database 서비스를 생성하시려면 아래의 내용을 참고해주세요.
```
apiVersion: v1
kind: Pod
metadata:
  name: mysql
  labels:
    name: lbl-k8s-mysql
spec:
  containers:
  - name: mysql
    image: mysql:latest
    env:
    - name: MYSQL_ROOT_PASSWORD
      valueFrom:
        secretKeyRef:
          name: mysql-pass
          key: password
    ports:
    - name: mysql
      containerPort: 3306
      protocol: TCP
    volumeMounts:
    - name: k8s-mysql-storage
      mountPath: /var/lib/mysql
  volumes:
  - name: k8s-mysql-storage
    emptyDir: {}
```
- MySQL 이미지 명으로 위의 mysql-delpoyment.yaml을 생성하여 Pod하나를 생성합니다.

```
kubectl apply -f mysql-deployment.yaml

pod/mysql created

# Pod 실행을 확인합니다.
kubectl get pod

NAME        READY   STATUS    RESTARTS   AGE
mysql   1/1     Running   0          30s
```

```
kubectl exec mysql -it -- bash

# echo $MYSQL_ROOT_PASSWORD
admin

# mysql --user=root --password=$MYSQL_ROOT_PASSWORD

mysql> create database orderdb;
    -> ;
Query OK, 1 row affected (0.01 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| orderdb            |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.01 sec)

mysql> exit
```
- 새 터미널에서 Pod에 접속해 Database 공간을 만들어주고, Database가 제대로 동작하는지 확인합니다. 

```
apiVersion: v1
kind: Service
metadata:
  labels:
    name: lbl-k8s-mysql
  name: mysql
spec:
  ports:
  - port: 3306
    protocol: TCP
    targetPort: 3306
  selector:
    name: lbl-k8s-mysql
  type: ClusterIP
```
- mysql-deployment.yaml 에 추가하고 "kubectl apply -f mysql-deployment.yaml" 명령어를 실행합니다.
- Service를 ClusterIP로 생성하고, mysql 접근을 위해 "mysql"이라는 도메인명으로 접근하고 있으므로, 같은 이름으로 서비스를 만들어 줍니다.

```
kubectl get po -l app=<Service_name>
kubectl delete po <Service-po-name>
```
- 마이크로 서비스를 새로 재기동 시키기 위해서는 위와 같이 po를 삭제해주면 deployment에 의해 자동으로 재시작됩니다.
#

### PersistenceVolume을 통한 Database의 데이터 보존을 진행하시려면 아래의 내용을 참고해주세요.
```
kubectl delete pod mysql
kubectl apply -f mysql-deployment.yaml

kubectl exec mysql -it -- bash
mysql --user=root --password=$MYSQL_ROOT_PASSWORD
show databases;
```
- MySQL 서비스를 제거했다가 다시 기동시키면 애플리케이션 데이터가 모두 소실됨을 확인할 수 있습니다.

```
   volumeMounts:
    - name: k8s-mysql-storage
      mountPath: /var/lib/mysql
  volumes:
  - name: k8s-mysql-storage
    persistentVolumeClaim:
      claimName: "fs"
```
- MySQL 자체가 사용하는 볼륨이 Pod에 기본 부착된 파일 시스템이기 때문에 이를 PersistenseVolume으로 된 파일 시스템에 연결하도록 설정합니다.
- 위의 내용 중, 맨 아래의 2줄을 복사하여 mysql-deployment.yaml의 emptyDir()을 persistentVolumeClaim으로 수정합니다.

```
kubectl delete -f mysql-deployment.yaml 
kubectl apply -f mysql-deployment.yaml
```
- 변경 후, 재배포하면 해당 Pod를 위한 fs라는 PVC가 생성되지 않았기 때문에 Pending 상태가 지속됩니다.

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: fs
  labels:
    app: test-pvc
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```
- 위의 yaml 을 mysql-pvc.yaml에 추가한 다음 배포합니다.

```
kubectl get pvc

NAME            STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
fs              Bound     pvc-225ebe47-cc67-4985-8f94-c0d4d795dede   1Gi        RWO            gp2            9m47
```
- PVC가 생성되면, mysql pod 의 pending 이 해제되고, AWS 영구 스토리지에 DB 생성이 가능합니다.
#

### 생성된 {{object.metadata.name}} {{object.kind}}의 상세 실행 정보를 확인하시려면 아래의 명령어를 입력하세요.

```
Kubectl describe {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 실행 정보 상태를 확인하여 문제가 있는지 확인합니다. 

> 보류 중인(Pending) 파드가 있나요?
>> 해당 Pod를 위한 PVC가 생성되었는지 확인하고, 관련 플랫폼(Azure or AWS)의 파일 서비스에서 생성하세요.
>> Volume mount 설정 변경을 위해 기존의 DB 설정을 삭제한 후, 다시 기동 해주세요.
#

### {{object.metadata.name}} {{object.kind}}를 삭제하려면 아래의 명령어를 실행하세요.

```
kubectl delete {{object.kind}} {{object.metadata.name}}
```
#