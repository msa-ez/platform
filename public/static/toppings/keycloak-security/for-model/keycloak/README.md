---

# Getting Started

1. Started keycloak
2. Keycloak Setting
3. Gateway Setting
4. Running Gateway


# 1. Started Keycloak
## Docker - Gitpod
## keycloak <docker-compose.yml>
version: '3.8'

services:  
  keycloak:
    container_name: keycloak
    image: quay.io/keycloak/keycloak:18.0.1
    ports:
      - 9090:8080
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KEYCLOAK_LOGLEVEL: debug
      KC_METRICS_ENABLED: "true"
      KC_HTTP_ENABLED: "false"
      KC_PROXY: edge
    command:
      - start-dev
```
cd keycloak
docker compose up
(keycloak port = 9090)
```
    
## Local - Download Archive
#step1. Download Keycloak
- Linux/Unix
```yaml
$ wget https://github.com/keycloak/keycloak/releases/download/17.0.1/keycloak-17.0.1.zip
```
- Windows
```text
https://github.com/keycloak/keycloak/releases/download/17.0.1/keycloak-17.0.1.zip.sha
```
다운로드후 파일 업로드

#step2. Installing
Unpack the ZIP file using the appropriate unzip utility, such as unzip, tar, or Expand-Archive.
```yaml
$ unzip keycloak-17.0.1.zip
or
$ tar -zxvf keycloak-17.0.1.tar.gz
```
#step3. Starting
If you want to make DockerImage, you move Dockerfile to /keycloak-17.0.1 folder.
```yaml
$ cd keycloak-17.0.1/bin
```

- Linux/Unix
```
$ sh kc.sh start-dev --http-port=9090 
    or
  chmod +x kc.sh
$ ./kc.sh start-dev --proxy=edge --http-port=9090
```
- Windows
```
$ \bin\kc.bat start-dev --http-port=9090
```


Open http://localhost:9090/ or https://9090-<gitpod주소> in your web browser.


# 2. Keycloak Setting
#step1. admin 접속
'http://localhost:9090/' or 'https://9090-<gitpod주소>' 접속 > admin 계정 생성. (docker compose up 했을 경우, admin user 생성되어 있음.)

#step2. Clients setting
1. Client create >  client-id

2. Move to Setting Tab
    - Access Type : public
    - Root URL : 'http://localhost:9090/*' or 'https://9090-<gitpod주소>/*'
    - Valid Redirect URIs : 'http://localhost:8088/*' or 'https://8088-<gitpod주소>/*' (gateway 주소)
    - Web Origins : '*'

3. Role setting
Client tab - 새롭게 생성한 Client click
상단 Roles tab - Add Role - Modeling에서 사용한 Actor와 동일한 이름으로 Role 추가 (대소문자 주의)

#step3. User register
Users Tab 
1. add User > 정보 입력 > 저장
2. 'view all users' 클릭
3. user id 클릭 > Credentials > password 설정 (temporary Off)
4. Role Mappings > Client Roles > 생성한 Client 선택 > 해당 User에 부여할 Role(Actor) 선택 > Add Seleted

# 3. Gateway Setting
1. gateway >  application.yml

Insert application.yaml
````yaml
spring:
  security:
    oauth2:
      client:
        provider:
          keycloak:
            issuer-uri: ${keycloak-client.server-url}/realms/${keycloak-client.realm}
            user-name-attribute: preferred_username
        registration:
          keycloak:
            client-id: ${client-id}
            client-secret: 
            redirect-uri: "gateway-path/login/oauth2/code/client-name"
            authorization-grant-type: authorization_code
            scope: openid
      resourceserver:
        jwt:
          jwk-set-uri: ${keycloak-client.server-url}/realms/${keycloak-client.realm}/protocol/openid-connect/certs
````

# 5. Setting frontend - src - main.js
Line 67
let initOptions = {
  url: 'http://localhost:9090/*' or 'https://9090-<gitpod주소>'
  realm: `master`,
  clientId: `client-id`,
  onLoad: `login-required`,
};
    
    
    
### Keycloak yaml
1. keycloak-service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: keycloak
  labels:
    app: keycloak
spec:
  ports:
  - name: http
    port: 8080
    targetPort: 8080
  selector:
    app: keycloak
  type: LoadBalancer
```

2. keycloak-deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keycloak
  namespace: default
  labels:
    app: keycloak
spec:
  replicas: 1
  selector:
    matchLabels:
      app: keycloak
  template:
    metadata:
      labels:
        app: keycloak
    spec:
      containers:
      - name: keycloak
        image: quay.io/keycloak/keycloak:15.0.2
        env:
        - name: KEYCLOAK_USER
          value: "admin"
        - name: KEYCLOAK_PASSWORD
          value: "admin"
        - name: PROXY_ADDRESS_FORWARDING
          value: "true"
        ports:
        - name: http
          containerPort: 8080
        - name: https
          containerPort: 8443
        readinessProbe:
          httpGet:
            path: /auth/realms/master
            port: 8080
```
            
#Documentation
https://www.keycloak.org/docs/latest/getting_started/index.html

#vue.js
https://www.keycloak.org/securing-apps/vue

