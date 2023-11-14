
forEach: k8s.Ingress
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
$ kubectl get ingress {{object.metadata.name}} -w

NAME      HOSTS   ADDRESS    PORTS   AGE
ingress   *       ???        80      7m36s

```
- {{object.metadata.name}} {{object.kind}}가 확인이 되신다면 정상 생성이 된 것 입니다.
> ADDRESS 부분에 값이 채워지지 않은 이유는 {{object.metadata.name}} provider가 없기 때문입니다.
>> Ingress 는 Kubernetes의 스펙일 뿐, 이를 실질적으로 지원하는 ingress controller가 필요로 합니다.  
#

### Helm으로 Ingress Controller 설치하시려면 아래의 내용을 참고하세요.
```
# Helm repo 설정

helm repo add stable https://charts.helm.sh/stable
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
kubectl create namespace ingress-basic
```
- 오픈소스 ingress provider 인 nginx ingress controller 를 설치하기 위해서는 하나 이상의 kubernetes 구성요소들을 설치해야 하기 때문에 이를 쉽게 Helm Chart 를 통해서 설치할 수 있습니다.

```
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 > get_helm.sh
chmod 700 get_helm.sh
./get_helm.sh
```
- Helm이 로컬에 설치되어 있지 않은 경우, Helm을 먼저 설치합니다. (Helm 3.x 설치권장)

```
helm install nginx-ingress ingress-nginx/ingress-nginx --namespace=ingress-basic
```
- nginx controller를 설치합니다.

```
kubectl get all --namespace=ingress-basic
```
- 설치확인을 합니다. 
- Ingress Controller의 EXTERNAL-IP가 API Gateway 엔드포인트입니다.

```
$ kubectl get ingress

NAME               HOSTS   ADDRESS                                                                        PORTS   AGE
gateway            *       acbdde7c8e29f451daee5605b8c7840c-1087513605.ap-northeast-2.elb.amazonaws.com   80      7m36s
```
- 자동으로 채워진 {{object.kind}}의 ADDRESS 부분의 설정이 채워지는 것을 확인하실 수 있습니다.

```
# http a52f3e05efdb2439e845aed8379437b4-1576614801.ap-northeast-2.elb.amazonaws.com/orders

HTTP/1.1 503 Service Temporarily Unavailable
Connection: keep-alive
Content-Length: 190
Content-Type: text/html
Date: Tue, 11 May 2021 06:25:37 GMT
```
- 발급된 주소에 path까지 포함하여 접속을 시도할 수 있습니다.
#

### 생성된 {{object.metadata.name}} {{object.kind}}의 상세 실행 정보를 확인하시려면 아래의 명령어를 입력하세요.

```
$ Kubectl describe {{object.kind}} {{object.metadata.name}}
```
- {{object.metadata.name}} {{object.kind}}의 실행 정보 상태를 확인하여 문제가 있는지 확인합니다. 
#

### {{object.metadata.name}} {{object.kind}}를 삭제하려면 아래의 명령어를 실행하세요.

```
$ kubectl delete {{object.kind}} {{object.metadata.name}}
```
#