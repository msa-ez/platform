# MSAez (Microservices made easy) Platform

MSA Easy (https://www.msaez.io/) is a comprehensive tool designed to assist in the analysis, design, implementation, and operation of microservices. It enables business experts and developers to collaboratively analyze and design software using domain-driven design and event-storming techniques. Furthermore, it facilitates the automatic generation of the "Clean-code". Throughout this entire process, ChatGPT can provide automation support and guidance on how to effectively utilize this platform.

Chat-GPT creates User Stories

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/gptgif1.bd6740a.28dad45ee7b0e24b9f110f84bd82bc5e.gif">

Chat-GPT Auto Software Modeling (Event Storming and UML)

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/gptgif3.bd6740a.d7a8ffd811b78d6ce4a35790e79c9ae8.gif">

Code Generation & integrated with Cloud IDEs

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/ggd-6.775f9c8.ba2b625fcefc005fe38d439177ca5e57.gif">

Kubernetes Modeling and Git Deploy (Integrated with Argo)

<img width="500" alt="image" src="https://intro.msaez.io/assets/static/image10.91ad02c.6a3dd0b490829b22cf18e381d27e1aaf.png">

Templates for major microservices platforms - Spring Boot, Axon, Go, Python

<img width="1286" alt="templates" src="https://github.com/msa-ez/platform/assets/487999/7d296274-059c-47f0-900e-794b93ba6817">

Toppings for Event driven Microservices Design Patterns including Saga, CQRS, Event sourcing, GraphQL, Token-based Authz/Authn, Circuit breaker, Microfrontends etc.

<img width="1288" alt="toppings" src="https://github.com/msa-ez/platform/assets/487999/44a821fe-5ab6-4f40-b106-78f3fb849c9d">

### User Guide

User-guide: https://intro.msaez.io/tool/google-drive-examples/#instructions

### Tutorial Videos

#### Google Docs Example

- (English) https://www.youtube.com/watch?v=MUN0iS3cJV8&list=PLEr96Fo5umW9w_5SmjXhOar1xRRWcZsbB&index=3
- (Korean) https://www.youtube.com/watch?v=GLT92wnRkMg

#### Axon Framework Example

- (English) Event sourcing and Choreography - https://www.youtube.com/watch?v=XoWd0QMue7A
- (English) Saga Orchestration- https://www.youtube.com/watch?v=0AEMNgtS5XU
- (Korean):
- part1: https://youtu.be/rFdBueV-JBs?t=2379
- part2: https://youtu.be/YGpUFRJwsuY
- part3: https://youtu.be/-nPsa4r2ceQ
- Background: https://youtu.be/rFdBueV-JBs

#### Multi-tenancy Support and Token-based Authn/Authz

- (Korean) https://www.youtube.com/watch?v=-D6PZldri2w

#### Mock Generation

- (Korean) https://www.youtube.com/watch?v=BlqwuMqI3J8

#### Unit Testing

- (Korean) https://www.youtube.com/watch?v=WF1fWdkFun0

#### ChatGPT based auto modeling

- (Korean) https://www.youtube.com/watch?v=liV2f5ZZlY0
- (Korean) https://www.youtube.com/watch?v=rUKFP6n-d68&list=PLEr96Fo5umW8CYIuf52d06BHfpgS6Q0-X&t=160s

#### ChatGPT based auto implementation & debugging

- (Korean) https://youtu.be/JuCN-bD7Jkk
- (English) https://youtu.be/yZMueAKEqwI

---

# Running on Docker Compose (with Github)

### Register MSAez as a Github OAuth Application

1. Login to Github
2. Settings -> Developer settings -> OAuth Apps -> New OAuth App
3. Set Application Info
   - Application Name: MSAez \* Required
   - Homepage URL: http://localhost:8080
   - Application Description: Description
   - Authorization callback URL: http://localhost:5757/oauth2/mydb/signin
4. Now you can find Github Application Client ID and Secret as follows:
   <img width="800" alt="image" src="https://github.com/msa-ez/platform/assets/487999/06f6af6e-6511-4a7f-a6d5-9021ca9b9d67">

Set those client ID and Secret with following command and run:

```sh
DB_HOST=localhost \
CLIENT_ID={{ Github OAuth Client ID }} \
CLIENT_SECRET={{ Github OAuth Client Secret }} \
docker-compose up -d
```

> If there's pull error please hit this: docker logout ghcr.io

Now you can navigate to localhost:8080

# Settings for AI-aided Model Generations by Chat GPT

To set Open AI token, we need to visit Acebase. Navigate to http://localhost:5757/webmanager/

Login with following info:

- DB Name: mydb
- User: admin
- Password: 75sdDSFg37w5

Set the Token encoded above in JSON format as shown below.

![image](https://github.com/msa-ez/platform/assets/16382067/6b6ae0c8-2f7b-4a15-9893-56f49e1e097c)

```
{ "tokens": {"openai": "BASE64-ENCODED-OPENAI-TOKEN"}}
```

\*\* Note: Your token must be encoded with base64:

```sh
echo "[OPEN-AI-TOKEN]" | base64
```

And Try to auto-generate Event-storming model with this guide: https://intro.msaez.io/tool/chat-gpt/#generating-business-model-utilizing-openai

---

# Setting Development Environment

```sh
# Set the version of npm(macOS)
npm install -g npm@6.14.18

nvm install 14
nvm use 14
npm install
```

### Run the frontend

create a file '/public/static/env.txt' and paste it:

```
VUE_APP_DB_HOST=localhost
VUE_APP_DB_PORT=5757
VUE_APP_DB_NAME=mydb
VUE_APP_MODE=onprem
VUE_APP_DB_HTTPS=false
VUE_APP_GIT=github
```

and run this script in the terminal:

```
npm run serve
```

Navigate to localhost:8080

### Run the Acebase DB

```
cd acebase

export CLIENT_ID=<Github OAuth Client ID>
export CLIENT_SECRET=<Github OAuth Secret>

node main.js
```

Navigate to the Acebase admin portal: localhost:5757

### Register Github App and Set the Open API tokens

[Describe here]

---

# Install MSAez on Docker Compose with Gitea

## 사전 요구사항

### 1. Node.js 설치 확인

AceBase를 실행하기 위해 Node.js 14가 필요합니다.

**Node.js 설치 확인:**
```sh
node --version
npm --version
```

**Node.js가 설치되어 있지 않은 경우:**
- **nvm 사용 (권장)**: 
  ```sh
  # nvm 설치 후
  nvm install 14
  nvm use 14
  ```
- **직접 설치**: [Node.js 공식 사이트](https://nodejs.org/)에서 Node.js 14 LTS 버전 다운로드 및 설치

**Node.js 버전 확인:**
```sh
node --version  # v14.x.x 버전
npm --version   # npm은 Node.js와 함께 설치됨
```

### 2. Python 설치 확인

Backend 생성기들을 실행하기 위해 Python 3가 필요합니다.

**Python 설치 확인:**
```sh
python3 --version
# 또는
python --version
```

**Python이 설치되어 있지 않은 경우:**
- **macOS**: 
  ```sh
  # Homebrew 사용
  brew install python3
  ```
- **Windows**: [Python 공식 사이트](https://www.python.org/downloads/)에서 Python 3.12 이상 다운로드 및 설치
- **Linux**: 
  ```sh
  sudo apt-get update
  sudo apt-get install python3 python3-pip python3-venv
  ```

**Python 버전 확인:**
```sh
python3 --version  # Python 3.12 이상 권장
```

**uv 설치 (Backend ES Generators용, 선택적):**
```sh
# uv는 Python 패키지 관리 도구
curl -LsSf https://astral.sh/uv/install.sh | sh
# 또는
pip install uv
```

### 3. Docker 설치 확인

MSAEz는 Docker와 Docker Compose를 사용합니다. 먼저 Docker가 설치되어 있는지 확인하세요.

**Docker 설치 확인:**
```sh
docker --version
docker compose version
```

**Docker가 설치되어 있지 않은 경우:**
- **macOS**: [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
- **Windows**: [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치
- **Linux**: [Docker Engine 설치 가이드](https://docs.docker.com/engine/install/) 참고

**Docker 설치 후 확인:**
```sh
docker ps
```

정상적으로 설치되었다면 빈 목록이 표시됩니다.

### 4. 필요한 포트 확인

다음 포트들이 사용 가능한지 확인하세요:
- **8080**: MSAez 플랫폼 (Frontend)
- **5757**: AceBase 데이터베이스
- **3000**: Gitea (Git 서버)
- **2025**: Backend Generators (Flask 서버, LangGraph 워크플로우)
- **5000**: Backend ES Generators (FastAPI 서버, LangGraph 워크플로우)

포트가 이미 사용 중인 경우, `docker-compose.yml`에서 포트를 변경할 수 있습니다.

## Setting Gitea

이 단계에서는 Gitea Git 서버를 초기화하고 OAuth 설정을 완료합니다. MSAez와 AceBase가 Gitea와 연동되도록 설정합니다.

### 1. Gitea 초기화 및 실행

먼저 Gitea를 실행하고 초기 설정을 완료합니다.

**Gitea 실행:**
```sh
# docker-compose.yml이 있는 디렉토리에서 실행
docker compose up -d gitea
```

**초기 설정:**
1. 브라우저에서 http://127.0.0.1:3000/ 접속
2. Gitea 초기 설정 화면에서 다음 정보 입력:
   - **Database Type**: SQLite3 (기본값)
   - **Site Title**: 원하는 제목 입력
   - **Repository Root Path**: `/data/git/repositories` (기본값)
   - **Git LFS Root Path**: `/data/git/lfs` (기본값)
   - **Run As Username**: `git` (기본값)
   - **SSH Server Domain**: `gitea` (또는 `localhost`)
   - **SSH Port**: `22`
   - **HTTP Port**: `3000`
   - **Gitea Base URL**: `http://gitea:3000/` (중요!)
3. **Administrator Account Setting** 섹션에서 관리자 계정 생성:
   - **Username**: 원하는 관리자 사용자명
   - **Password**: 관리자 비밀번호
   - **Confirm Password**: 비밀번호 확인
   - **Email**: 관리자 이메일 주소
4. **Install Gitea** 버튼 클릭

![alt text](https://github.com/user-attachments/assets/46aae576-9418-4765-924f-6e37ef5e0881)

### 2. Gitea 설정 파일 수정

Gitea가 Docker로 실행 중인 경우, 설정 파일을 직접 수정해야 합니다.

**설정 파일 위치:**
- Docker로 실행한 경우: `./gitea/gitea/conf/app.ini`

**수정 방법:**
```sh
# 설정 파일 편집
vi ./gitea/gitea/conf/app.ini
# 또는
nano ./gitea/gitea/conf/app.ini
```

**추가/수정할 내용:**
```ini
# ./gitea/gitea/conf/app.ini

[cors]
ENABLED = true
ALLOW_DOMAIN = *

[server]
APP_DATA_PATH = /data/gitea
DOMAIN = gitea
SSH_DOMAIN = gitea
HTTP_PORT = 3000
# ROOT_URL을 http://gitea:3000/로 변경
ROOT_URL = http://gitea:3000/
DISABLE_SSH = false
SSH_PORT = 22
SSH_LISTEN_PORT = 22
LFS_START_SERVER = true
LFS_JWT_SECRET = UPSh8CoIsH5nBiwg2kHeBWsKiIt97afTRSg0Jm2eeyA
OFFLINE_MODE = true
```

**설정 적용:**
```sh
# Gitea 컨테이너 재시작
docker compose restart gitea
```

### 3. OAuth2 Application 생성

AceBase가 Gitea와 OAuth 인증을 하기 위해 OAuth2 Application을 생성합니다.

**단계:**
1. Gitea에 관리자 계정으로 로그인 (http://localhost:3000)
2. 우측 상단 **프로필 아이콘** 클릭
3. **Settings** 클릭
4. 좌측 메뉴에서 **Applications** 클릭
5. **Manage OAuth2 Applications** 섹션에서:
   - **Application Name**: 원하는 이름 입력 (예: `acebase`)
   - **Redirect URIs**: 다음 URI 입력 (새 줄로 구분)
     ```
     http://localhost:5757/oauth2/mydb/signin
     http://127.0.0.1:5757/oauth2/mydb/signin
     ```
6. **Create Application** 버튼 클릭
7. 생성된 **Client ID**와 **Client Secret**을 복사하여 저장하세요.
   > ⚠️ **중요**: Client Secret은 한 번만 표시되므로 반드시 저장하세요.
   > ![alt text](https://github.com/user-attachments/assets/5b6c5038-1f29-4bcc-b70f-ed7fe004ee97)
8. **Save** 버튼 클릭

### 4. Gitea Personal Access Token 생성

MSAEz가 Gitea API를 사용하기 위해 Personal Access Token이 필요합니다. OAuth 토큰은 Gitea API에서 직접 사용할 수 없으므로 Personal Access Token을 생성해야 합니다.

**단계:**
1. Gitea에 로그인 (http://localhost:3000)
2. 우측 상단 **프로필 아이콘** 클릭
3. **Settings** 클릭
4. 좌측 메뉴에서 **Applications** → **Generate New Token** 클릭
5. **Token Name**: 원하는 이름 입력 (예: `msaez-api-token`)
6. **Select Scopes**: 필요한 권한 선택
   - `read:repository` - 저장소 읽기
   - `write:repository` - 저장소 쓰기
   - `read:user` - 사용자 정보 읽기
   - `read:org` - 조직 정보 읽기 (조직 사용 시)
7. **Generate Token** 버튼 클릭
8. **생성된 토큰을 복사하여 저장하세요.** (토큰은 한 번만 표시됩니다)
   > ⚠️ **주의**: 토큰을 잃어버리면 다시 생성해야 합니다.

### 5. Hosts 파일 추가

Gitea 도메인을 로컬에서 인식하도록 hosts 파일을 수정합니다.

**macOS / Linux:**
```sh
sudo vi /etc/hosts
# 또는
sudo nano /etc/hosts
```

**Windows:**
```
C:\Windows\System32\drivers\etc\hosts 파일을 관리자 권한으로 열기
```

**추가할 내용:**
```text
127.0.0.1 gitea
```

**확인:**
```sh
ping gitea
# 127.0.0.1로 응답하는지 확인
```

## AceBase 설치 방법 선택

이 단계에서는 AceBase 데이터베이스를 설치하고 실행합니다. 두 가지 방법 중 하나를 선택하세요.

> 💡 **권장**: 프로덕션 환경에서는 **설치형 AceBase**를 사용하세요. 데이터 영속성이 보장되고 더 안정적입니다.

> ⚠️ **주의**: AceBase를 실행하기 전에 위의 "Setting Gitea" 섹션에서 OAuth2 Application을 생성하고 Client ID와 Secret을 발급받아야 합니다.

### 방법 1: 설치형 AceBase (프로덕션 권장) ⭐

프로덕션 환경에서는 Docker 없이 직접 설치하는 것을 권장합니다. 이 방법은 데이터 영속성이 보장되고 더 안정적입니다.

**장점:**
- 데이터가 호스트에 직접 저장되어 영속성 보장
- 컨테이너 재시작과 무관하게 데이터 유지
- 프로덕션 환경에 적합

**설치 방법:**
```sh
# 1. AceBase 디렉토리로 이동
cd acebase

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
# 위의 "Setting Gitea" 섹션의 "OAuth2 Application 생성" 단계에서 발급받은 Client ID와 Secret 사용
export CLIENT_ID=your-gitea-oauth-client-id
export CLIENT_SECRET=your-gitea-oauth-client-secret
export PROVIDER=gitea
export GIT=gitea:3000
export PROTOCOL=http
export DB_HOST=0.0.0.0
export DB_NAME=mydb
export DB_PORT=5757
export DB_HTTPS=false
export ADMIN_PASSWORD=your-admin-password  # 선택적: 기본값은 75sdDSFg37w5 (프로덕션 환경에서는 반드시 변경 권장)

# 4. AceBase 실행
node main.js
```

**데이터 저장 위치:**
- 데이터는 `./acebase/mydb.acebase/` 디렉토리에 저장됩니다.
- 이 디렉토리를 백업하면 모든 데이터를 보존할 수 있습니다.

**확인:**
- AceBase가 정상적으로 실행되면 터미널에 "SERVER ready" 메시지가 표시됩니다.
- 브라우저에서 http://localhost:5757/webmanager/ 접속하여 관리자 포털 확인 가능
  - DB Name: `mydb`
  - User: `admin`
  - Password: `75sdDSFg37w5`

### 방법 2: Docker 사용 (개발 환경용)

Docker를 사용하면 간편하게 실행할 수 있지만, **컨테이너를 재시작하면 데이터가 소멸됩니다.**

**장점:**
- 간편한 설치 및 실행
- 개발/테스트 환경에 적합

**단점:**
- ⚠️ 컨테이너 재시작 시 데이터 소멸
- 프로덕션 환경에는 부적합

**docker-compose.yml 설정:**
```yml
acebase:
  image: ghcr.io/msa-ez/acebase:v1.0.18
  container_name: acebase
  networks:
    - msaez
  ports:
    - 5757:5757
  volumes:
    - ./acebase/mydb.acebase:/acebase
  environment:
    DB_HOST: "0.0.0.0"
    DB_NAME: mydb
    DB_PORT: 5757
    DB_HTTPS: "false"
    CLIENT_ID: your-gitea-oauth-client-id  # 위의 "Setting Gitea" 섹션에서 발급받은 값
    CLIENT_SECRET: your-gitea-oauth-client-secret  # 위의 "Setting Gitea" 섹션에서 발급받은 값
    PROVIDER: gitea
    GIT: "gitea:3000"
    PROTOCOL: http
```

**실행:**
```sh
docker compose up -d acebase
```

## Initialize MSAez

이 단계에서는 docker-compose.yml을 설정하고 MSAez 플랫폼을 실행합니다.

### docker-compose.yml 설정

프로젝트 루트 디렉토리에 `docker-compose.yml` 파일을 생성하거나 수정합니다.

**전체 예시 (설치형 AceBase 사용 시):**
```yml
version: "3"

networks:
  msaez:
    external: false

services:
  msaez:
    image: ghcr.io/msa-ez/platform:v1.0.29
    networks:
      - msaez
    ports:
      - 8080:8080
    environment:
      VUE_APP_DB_HOST: 127.0.0.1  # 설치형 AceBase는 localhost에서 실행
      VUE_APP_DB_PORT: 5757
      VUE_APP_DB_NAME: mydb
      VUE_APP_MODE: onprem
      VUE_APP_DB_HTTPS: "false"
      VUE_APP_GIT: gitea
      VUE_APP_GIT_URL: http://localhost:3000
      VUE_APP_GITEA_TOKEN: "your-gitea-personal-access-token"  # 위의 "Setting Gitea" 섹션에서 생성한 Personal Access Token

  # 설치형 AceBase를 사용하므로 주석 처리
  # acebase:
  #   image: ghcr.io/msa-ez/acebase:v1.0.18
  #   container_name: acebase
  #   networks:
  #     - msaez
  #   ports:
  #     - 5757:5757
  #   volumes:
  #     - ./acebase/mydb.acebase:/acebase
  #   environment:
  #     DB_HOST: "0.0.0.0"
  #     DB_NAME: mydb
  #     DB_PORT: 5757
  #     DB_HTTPS: "false"
  #     CLIENT_ID: your-gitea-oauth-client-id
  #     CLIENT_SECRET: your-gitea-oauth-client-secret
  #     PROVIDER: gitea
  #     GIT: "gitea:3000"
  #     PROTOCOL: http

  gitea:
    image: gitea/gitea:1.22.3
    container_name: gitea
    networks:
      - msaez
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
```

**Docker로 AceBase 사용 시:**
```yml
version: "3"

networks:
  msaez:
    external: false

services:
  msaez:
    image: ghcr.io/msa-ez/platform:v1.0.29
    networks:
      - msaez
    ports:
      - 8080:8080
    environment:
      VUE_APP_DB_HOST: acebase  # Docker 네트워크 내에서 acebase 서비스명 사용
      VUE_APP_DB_PORT: 5757
      VUE_APP_DB_NAME: mydb
      VUE_APP_MODE: onprem
      VUE_APP_DB_HTTPS: "false"
      VUE_APP_GIT: gitea
      VUE_APP_GIT_URL: http://localhost:3000
      VUE_APP_GITEA_TOKEN: "your-gitea-personal-access-token"

  acebase:
    image: ghcr.io/msa-ez/acebase:v1.0.18
    container_name: acebase
    networks:
      - msaez
    ports:
      - 5757:5757
    volumes:
      - ./acebase/mydb.acebase:/acebase
    environment:
      DB_HOST: "0.0.0.0"
      DB_NAME: mydb
      DB_PORT: 5757
      DB_HTTPS: "false"
      CLIENT_ID: your-gitea-oauth-client-id  # 위의 "Setting Gitea" 섹션에서 발급받은 값
      CLIENT_SECRET: your-gitea-oauth-client-secret  # 위의 "Setting Gitea" 섹션에서 발급받은 값
      PROVIDER: gitea
      GIT: "gitea:3000"
      PROTOCOL: http

  gitea:
    image: gitea/gitea:1.22.3
    container_name: gitea
    networks:
      - msaez
    environment:
      - USER_UID=1000
      - USER_GID=1000
    restart: always
    volumes:
      - ./gitea:/data
      - /etc/timezone:/etc/timezone:ro
      - /etc/localtime:/etc/localtime:ro
    ports:
      - "3000:3000"
      - "222:22"
```

> 💡 **.env 파일 사용 (권장)**: 민감한 정보는 `.env` 파일에 저장하고 docker-compose.yml에서 참조하세요.
> 
> ```bash
> # .env 파일 생성
> VUE_APP_GITEA_TOKEN=your-gitea-personal-access-token
> CLIENT_ID=your-gitea-oauth-client-id
> CLIENT_SECRET=your-gitea-oauth-client-secret
> ```
> 
> ```yml
> # docker-compose.yml
> environment:
>   VUE_APP_GITEA_TOKEN: ${VUE_APP_GITEA_TOKEN}
>   CLIENT_ID: ${CLIENT_ID}
>   CLIENT_SECRET: ${CLIENT_SECRET}
> ```
> 
> ⚠️ **보안 주의사항**: `.env` 파일을 `.gitignore`에 추가하여 Git에 커밋되지 않도록 하세요.

### 서비스 실행

**설치형 AceBase 사용 시:**
```sh
# 1. AceBase 실행 (별도 터미널)
cd acebase
npm install
export CLIENT_ID=your-gitea-oauth-client-id
export CLIENT_SECRET=your-gitea-oauth-client-secret
export PROVIDER=gitea
export GIT=gitea:3000
export PROTOCOL=http
export DB_HOST=0.0.0.0
export DB_NAME=mydb
export DB_PORT=5757
export DB_HTTPS=false
export ADMIN_PASSWORD=your-admin-password  # 선택적: 기본값은 75sdDSFg37w5 (프로덕션 환경에서는 반드시 변경 권장)
node main.js
```

```sh
# 2. MSAez와 Gitea 실행 (다른 터미널)
docker compose up -d msaez gitea
```

**Docker로 AceBase 사용 시:**
```sh
docker compose up -d
```

**확인:**
```sh
# 실행 중인 컨테이너 확인
docker compose ps

# 로그 확인
docker compose logs -f msaez
docker compose logs -f gitea
# 또는 (Docker AceBase 사용 시)
docker compose logs -f acebase
```

**데이터 영속성:**
- **Gitea**: `./gitea:/data` 볼륨 마운트로 호스트에 저장되므로, Docker로 올려도 repo와 계정 정보가 소멸되지 않습니다.
- **AceBase (설치형)**: `./acebase/mydb.acebase/` 디렉토리에 직접 저장되어 영속성이 보장됩니다.
- **AceBase (Docker)**: ⚠️ 컨테이너 재시작 시 데이터가 소멸될 수 있습니다. 프로덕션 환경에서는 설치형 AceBase를 사용하세요.

## Connect MSAez

모든 서비스가 실행되면 MSAez 플랫폼에 접속할 수 있습니다.

**접속:**
> http://localhost:8080

**확인 사항:**
- MSAez 웹 인터페이스가 정상적으로 로드되는지 확인
- Gitea 로그인 기능이 정상적으로 동작하는지 확인
- AceBase 연결 상태 확인 (브라우저 개발자 도구 콘솔에서 확인)

**문제 해결:**
- 서비스가 실행되지 않는 경우: `docker compose ps`로 상태 확인
- 포트 충돌: `docker compose logs`로 에러 로그 확인
- Gitea 연결 문제: hosts 파일 설정 확인 (`127.0.0.1 gitea`)

## Backend 생성기 설정

MSAEz의 AI 기능을 사용하려면 Backend 생성기들을 별도로 실행해야 합니다.

### 1. Backend Generators (Project Generator) 설정

https://github.com/uengineYSW/msaez-automate-project-generator (Code download)

`.env` 루트 경로에 파일을 생성하고 다음 내용을 추가:

```bash
OPENAI_API_KEY=
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
FIREBASE_DATABASE_URL=https://eventstorming-tool-db.firebaseio.com
FIREBASE_STORAGE_BUCKET=gs://eventstorming-tool-db.appspot.com
DEFAULT_LLM_MODEL=gpt-4o-mini
DEFAULT_LLM_TEMPERATURE=0.7
ENVIRONMENT=development
DEBUG=true
NAMESPACE=eventstorming_generator
POD_ID=local-dev
IS_LOCAL_RUN=true

# 로그 레벨 (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL=INFO

# Storage 사용 타입
STORAGE_TYPE=acebase

# Firebase 관련 설정 제거하고 대신 추가
ACEBASE_HOST=127.0.0.1
ACEBASE_PORT=5757
ACEBASE_DB_NAME=mydb
ACEBASE_HTTPS=false
ACEBASE_USERNAME=admin  # AceBase 기본 관리자 계정
ACEBASE_PASSWORD=75sdDSFg37w5  # AceBase 기본 비밀번호 (프로덕션 환경에서는 변경 권장)

```

**설치 및 실행:**
```sh
# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -e .

# 서버 실행
./start.sh
```

**확인:**
- Health Check: http://localhost:2025/ok
- 서버가 정상적으로 실행되면 "🚀 Project Generator 서버를 시작합니다..." 메시지가 표시됩니다.

### 2. Backend ES Generators (Event Storming Generator) 설정

https://github.com/ShinSeongJin2/msaez-automate-eventstorming-generator (Code download)

`.env` 루트 경로에 파일을 생성하고 다음 내용을 추가:

```bash
AI_MODEL=google_genai:gemini-flash-latest:thinking
AI_MODEL_MAX_INPUT_LIMIT=983040
AI_MODEL_MAX_BATCH_SIZE=15

AI_MODEL_LIGHT=google_genai:gemini-flash-latest:thinking
AI_MODEL_LIGHT_MAX_INPUT_LIMIT=983040
AI_MODEL_LIGHT_MAX_BATCH_SIZE=30

GOOGLE_API_KEY=
OPENAI_API_KEY=

LANGSMITH_TRACING=true
LANGSMITH_PROJECT=msaez-automate-eventstorming-generator
LANGSMITH_API_KEY=xxx

FIREBASE_SERVICE_ACCOUNT_PATH=./.auth/serviceAccountKey.json
FIREBASE_DATABASE_URL=

NAMESPACE=eventstorming_generator
POD_ID=local_pod
IS_LOCAL_RUN=true
USE_GENERATOR_CACHE=true

AUTO_SCALE_MIN_REPLICAS=1
AUTO_SCALE_MAX_REPLICAS=3
AUTO_SCALE_TARGET_JOBS_PER_POD=1

MSAEZ_URL=https://www.msaez.io

# Storage 사용 타입
DB_TYPE=acebase

# Firebase 관련 설정 제거하고 대신 추가
ACEBASE_HOST=127.0.0.1
ACEBASE_PORT=5757
ACEBASE_DB_NAME=mydb
ACEBASE_HTTPS=false
ACEBASE_USERNAME=admin  # AceBase 기본 관리자 계정
ACEBASE_PASSWORD=75sdDSFg37w5  # AceBase 기본 비밀번호 (프로덕션 환경에서는 변경 권장)
```

**설치 및 실행:**
```sh
# 의존성 설치
uv run pip install -e .
uv pip install -U "langgraph-cli[inmem]"
# grpcio 버전 호환성 문제 해결
uv pip install "grpcio>=1.75.1"

# 서버 실행
uv run python ./src/eventstorming_generator/main.py
```

**확인:**
- LangGraph 서버: http://localhost:5000
- 서버가 정상적으로 실행되면 LangGraph Studio가 시작됩니다.

### 3. 중요 사항

1. **AceBase 먼저 실행**: Backend 생성기들을 실행하기 전에 AceBase가 실행되어 있어야 합니다.
   
   **설치형 AceBase 사용 시 (권장):**
   ```sh
   cd acebase
   npm install
   export CLIENT_ID=your-gitea-oauth-client-id
   export CLIENT_SECRET=your-gitea-oauth-client-secret
   export PROVIDER=gitea
   export GIT=gitea:3000
   export PROTOCOL=http
   export DB_HOST=0.0.0.0
   export DB_NAME=mydb
   export DB_PORT=5757
   export DB_HTTPS=false
   export ADMIN_PASSWORD=your-admin-password  # 선택적: 기본값은 75sdDSFg37w5 (프로덕션 환경에서는 반드시 변경 권장)
   node main.js
   ```
   
   **Docker 사용 시:**
   ```sh
   docker compose up -d acebase
   ```

2. **데이터 영속성 보장**:
   
   **설치형 AceBase 사용 시 (권장)**:
   - 데이터는 `./acebase/mydb.acebase/` 디렉토리에 직접 저장됩니다.
   - 컨테이너 재시작과 무관하게 데이터가 유지됩니다.
   - 프로덕션 환경에서는 설치형 AceBase 사용을 강력히 권장합니다.
   - 데이터 백업: `./acebase/mydb.acebase/` 디렉토리를 정기적으로 백업하세요.
   
   **Docker 사용 시 (개발 환경용)**:
   - ⚠️ **주의**: Docker 컨테이너 내부에 데이터가 저장되므로, 컨테이너를 재시작하거나 삭제하면 데이터가 소멸됩니다.
   - 개발/테스트 환경에서만 사용하세요.

3. **포트 충돌 확인**: 
   - Backend Generators: 2025
   - Backend ES Generators: 5000
   - 이미 사용 중인 포트가 있다면 `.env` 파일에서 변경하세요.

4. **OpenAI API Key**: 
   - OpenAI API Key는 반드시 설정해야 합니다.
   - API Key는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

5. **Storage Type 일치**: 
   - Frontend와 Backend의 Storage Type이 일치해야 합니다.
   - AceBase를 사용하는 경우: `STORAGE_TYPE=acebase` (backend-generators), `DB_TYPE=acebase` (backend-es-generators)
   - Firebase를 사용하는 경우: `STORAGE_TYPE=firebase` (backend-generators), `DB_TYPE=firebase` (backend-es-generators)

---

# Install MSAez on Kubernetes with GitLab

- Before the installation, register GitLab Application to get OAuth ID and Secrets.

### Install GitLab firstly

[Gitlab Install Guide](https://docs.gitlab.com/charts/installation/)

### Register MSAez as a GitLab Application

1. Login to GitLab with Admin account
2. Admin Area -> Applications
   ![Pasted image 20231110122240](https://github.com/msa-ez/platform/assets/16382067/dd07d9bd-f524-4de8-9d6b-b9ad5550d792)
3. **Add New application Click**
4. Set Application
   ![Pasted image 20231110122407](https://github.com/msa-ez/platform/assets/16382067/d6657e15-fd76-4404-a71c-65673f8f3ebd)
5. ID & Secret issued after the registration of Application is necessary for MSAez Install, so save them. Application.

### Install MSAez

1. Installation of MSAez is running in on-prem-helm folder within the source code of \[MSAez SourceCode]\([https://github.com/msa-ez/platform](https://github.com/msa-ez/platform)).

```bash
$ git clone https://github.com/msa-ez/platform.git
```

---

2. Edit the value of Helm chart

```yaml
# /on-prem-helm/values.yaml
replicaCount: 1
image:
  repository: ghcr.io/msa-ez # Image Registry
  eventstorming: evenstorming:v1.0.7 # Eventstorming-tool Image URL
  acebase: acebase:v1.0.7 # Acebase Image URL

provider: github # github or gitlab

gitlab:
  url: gitlab.handymes.com # Gitlab URL

oauth:
  id: "" # Gitlab Application OAUTH ID
  secret: "" # Gitlab Application OAUTH Secrets

db:
  https: true
  host: acebase.handymes.com # DB URL
  port: 443 # fixed
  name: mydb # fixed
```

3. Install Helm.

```bash
$ cd on-prem-helm
$ helm install msaez .
```

4. Check the Service.

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

5. Register DNS or edit hosts file and login to the Host.

---

# Importing Code Templates to GitLab

## ※ The basic template must be created as a sub-project of a root account.

1. Select **New project**
   ![image](https://github.com/msa-ez/platform/assets/16382067/3b22928d-9457-430d-9619-5cf3d66f6ff1)

2. Select **import project**
   ![image](https://github.com/msa-ez/platform/assets/16382067/bc79990e-493c-41d1-a22b-1124639d0605)

3. Select GitHub
   ![image](https://github.com/msa-ez/platform/assets/16382067/acc6ced6-a85c-49b1-9d9f-f112a0a1eac8)

4. Enter Personal Access Token, then **Authenticate**
   ![image](https://github.com/msa-ez/platform/assets/16382067/b432aa46-d3c7-47e7-a1d4-69be70790c20)

- If you do not have a personal token, click GitHub **Personal Access Token** at the bottom to go to the Github token issuance screen.

5.  Search for msa-ez in the search box and import the project.
    ![image](https://github.com/msa-ez/platform/assets/16382067/b78ed33b-cc92-40be-a793-e3c18079217a)

        - If nothing is found after searching msa-ez, you need to add msa-ez Organization from Github.

# Roadmap

- Legacy Modernization:

Beginning with the input of existing legacy assets, like current codebases or database schemas, the tool identifies and extracts key Business Objects, such as Aggregates or Entities, and delineates APIs with their respective Commands.

After that, MSAez, takes the lead in creating a new, optimized model. This model is not only tailored to align with the modernized architectural design but is also primed for generating code that is compatible with cloud-native applications.

- Automated Coding, System Testing, and Code Debugging:

With the incorporation of ChatGPT, MSAez elevates its functionality by automating the implementation of business logic and test codes in the default generated code. Additionally, ChatGPT aids in automatically detecting and resolving bugs within the generated code, ensuring it successfully passes all necessary tests. This automation streamlines the coding and testing processes, significantly reducing the time and effort required for development and debugging.

- Integration with the Backstage Platform:

MSAez can be integrated as a plugin into the Backstage platform (https://backstage.io/ - a de-facto standard in developer portal platform), enabling BizDevOps professionals to consolidate various tools used throughout the Biz-Dev-Ops lifecycle. This integration allows for a seamless incorporation into Backstage's developer experience, enhancing workflow efficiency and tool management.
