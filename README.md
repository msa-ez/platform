# MSAez Platform Core

### Project setup
```
nvm install 14
nvm use 14
npm install
```
### Compiles and hot-reloads for development
```
npm run serve
```


***

# Install MSAez on Docker Compose

1. Npm Build
```sh
npm run build
```

2. MSAez Docker build & push
```sh
# Project Root
docker build -t repository/image-name:image-tag .
docker push repository/image-name:image-tag
```

3. MSAez Docker build & push
```sh
# Project Root
cd acebase
docker build -t repository/image-name:image-tag .
docker push repository/image-name:image-tag
```

4. Docker Compose File Edit
```yaml
version: '2'
services:
  msaez:
    image: asia-northeast3-docker.pkg.dev/eventstorming-tool/eventstorming:v49 # MSAez Docker Image
    ports:
      - 8080:8080
    environment:
      VUE_APP_DB_HOST: localhost # DB Host Name
      VUE_APP_DB_PORT: 5757 # DB Port
      VUE_APP_DB_NAME: mydb # DB NAME
      VUE_APP_MODE: onprem # MODE onprem or dev
      VUE_APP_GITLAB: # Gitlab URL
      VUE_APP_OAUTH_ID: # Gitlab Application ID
      VUE_APP_OAUTH_SECRET: # Gitlab Application Secret
  acebase :
    image: asia-northeast3-docker.pkg.dev/eventstorming-tool/acebase:v33 # Acebase Docker Image
    container_name: acebase
    ports:
      - 5757:5757
    volumes:
      - ~/mydb.acebase:/acebase
    environment:
      - DB_HOST: localhost
      - DB_NAME: mydb
    networks:
      - backend
```

5. Docker Compose run
```sh
docker compose up -d
```

***
# Install MSAez on Kubernetes

* 설치 전, 설치 된 GitLab에 Application 등록하여, OAuth ID와 Secrets 발급이 필요하다.

### GitLab Application 등록

1. 설치된 Gitlab의 Admin 계정으로 접속
2.  Admin Area -> Applications
![Pasted image 20231110122240](https://github.com/msa-ez/platform/assets/16382067/dd07d9bd-f524-4de8-9d6b-b9ad5550d792)
3. **Add New application Click**
4.  Application 설정
![Pasted image 20231110122407](https://github.com/msa-ez/platform/assets/16382067/d6657e15-fd76-4404-a71c-65673f8f3ebd)
5. Application 등록 후, 발급된 ID, Secret은 MSAez Install에 사용되므로, 저장.

### MSAez 설치

1. MSAez 설치는 \[MSAez SourceCode]\([https://github.com/msa-ez/platform](https://github.com/msa-ez/platform)) 해당 소스코드 하위의 on-prem-helm 폴더에서 진행된다.

```bash
$ git clone https://github.com/msa-ez/platform.git
```

***

2. Helm chart Value 수정.

```yaml
# /on-prem-helm/values.yaml
replicaCount: 1
image:
   repository: asia-northeast3-docker.pkg.dev/eventstorming-tool/eventstorming # Image Registry URL
  eventstorming: evenstorming:v49 # Eventstorming-tool Image URL
  acebase: acebase:v33 # Acebase Image URL

gitlab: 
	url: gitlab.handymes.com # Gitlab URL
	oauth: 
		id: # Gitlab Application OAUTH ID
		secret: # Gitlab Application OAUTH Secrets

db:
  host: acebase.handymes.com # DB URL
  port: 443 # 고정
  name: mydb # 고정
```

3. Helm install

```bash
$ cd on-prem-helm
$ helm install msaez .
```

4. 서비스 확인

```bash
# Pod, Service
root@theia-build:/home/kimsanghoon$ kubectl get all
NAME                                     READY   STATUS    RESTARTS   AGE
pod/acebase-6c7c8598fd-6fgkp             1/1     Running   0          9d
pod/eventstorming-tool-8554ffc55-h94vd   1/1     Running   0          23h

NAME                         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
service/acebase              ClusterIP   10.233.15.103   <none>        80/TCP    21d
service/eventstorming-tool   ClusterIP   10.233.19.127   <none>        80/TCP    21d

```

```bash
# Ingress
root@theia-build:/home/kimsanghoon$ kubectl get ing
NAME                     CLASS   HOSTS                  ADDRESS           PORTS     AGE
acebase                  nginx   acebase.handymes.com   000.000.000.000   80, 443   21d
eventstorming-tool-ing   nginx   msa.handymes.com       000.000.000.000   80, 443   21d
```

5. DNS 등록 또는 hosts 파일 수정하여 해당 Host로 접속. 
***
# Acebase Setting

#### 참고 
> [Acebase](https://github.com/appy-one/acebase)

1. acebase 폴더 내부의 main.js 에서 설정한다.
   각 옵션은 주석과 같이 설정하면 된다.
```js
// main.js
...
const host = process.env.DB_HOST;
const dbname = process.env.DB_NAME ? process.env.DB_NAME : "mydb"; // DB Name
const server = new AceBaseServer(dbname, {
    host: host ? host : "localhost", // Acebase Use Domain (allow all 0.0.0.0)
    port: 5757,
    storage: {
        path: "/acebase" // DB File Path
    },
    authentication: {
        enabled: true,
        allowUserSignup: true,
        defaultAccessRule: "auth",
        defaultAdminPassword: {{ password }}, // Admin Password 
    },
});
server.on("ready", () => {
    console.log("SERVER ready");
});
const db = new AceBaseClient({
    host: host ? host : "localhost", // Acebase DB URL
    port: '5757', // Ingress 에서 SSL 처리를 한다면 443
    dbname: dbname, 
    https: false, // Ingress 에서 SSL 처리를 한다면 True
});

// 위에서 설정한 password 설정 
db.auth.signIn("admin", {{ password }} ).then((result) => {
    console.log(
        `Signed in as ${result.user.username}, got access token ${result.accessToken}`
    );
});

...
```
***
#### Acebase 관리자 로그인 페이지
![image](https://github.com/msa-ez/platform/assets/16382067/477d0662-f07c-4db5-8a65-62ab13a1dde5)

위 설정에서 설정한 정보 입력
> Database name : {{ dbname }}
> Username : admin (고정)
> Password : {{ password }}
#### Acebase 접속 화면
![[Pasted image 20231120162428.png]]
로그인 후, 데이터들이 보이는 것을 확인 할 수 있다.

#### Acebase 데이터 변경 및 추가
> ex) OpenAI를 위한 Token값을 넣는 방법
1. 하단의 "**You can update this node or export the value of this node to json**" 메시지에서 **update** 클릭
2. 클릭 후, 아래와 같은 textbox가 추가 되는 것을 확인 할 수 있다.
![[Pasted image 20231120162938.png]]
3. 데이터는 Json 형태로만 입력 가능하며 OpenAI Token 발급 후, base64로 Encode 해준다.
##### Linux or MacOS
```sh
echo "token" | base64
```
##### Windows (CMD and PowerShell)
> CMD
```cmd
powershell "[convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes(\"Token!\"))"
```

> Powershell
```powershell
[Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes("Token!"))
```

4. 위에서 encode한 Token을 JSON 형태로 아래와 같이 넣어준다. 
> Token Path : /tokens/openai

> Result
```json
{
  "tokens": {
    "openai": "encoded token!"
  }
}
```

5. 위에서 생성한 JSON을 TextBox에 입력 후, update를 클릭해주면,

> 전![[Pasted image 20231120170329.png]]

> 후 ![image](https://github.com/msa-ez/platform/assets/16382067/6b6ae0c8-2f7b-4a15-9893-56f49e1e097c)

위 그림과 같이 tokens가 추가된다.

***
# GitLab Template Import

## ※ 기본 Template은 root 계정 하위 프로젝트로 생성하여야 한다.

1. **New project** 선택
![image](https://github.com/msa-ez/platform/assets/16382067/3b22928d-9457-430d-9619-5cf3d66f6ff1)

2. **import project** 선택
![image](https://github.com/msa-ez/platform/assets/16382067/bc79990e-493c-41d1-a22b-1124639d0605)

3. GitHub 선택
![image](https://github.com/msa-ez/platform/assets/16382067/acc6ced6-a85c-49b1-9d9f-f112a0a1eac8)

4. Personal Access Token 입력 후, **Authenticate**
![image](https://github.com/msa-ez/platform/assets/16382067/b432aa46-d3c7-47e7-a1d4-69be70790c20)

  - Personal Token이 없는 경우 하단의 GitHub **Personal Access Token** 를 클릭하면 Github 토큰 발급 화면으로 이동

5. 검색창에 msa-ez 검색 후, 프로젝트 Import
![image](https://github.com/msa-ez/platform/assets/16382067/b78ed33b-cc92-40be-a793-e3c18079217a)

    - msa-ez 검색 후, 아무것도 검색되지 않는다면 Github msa-ez Organization 추가 필요