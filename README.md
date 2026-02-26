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

MSAez Git url: https://github.com/msa-ez/platform.git

## 사전 요구사항

### 1. Git 설치

**macOS:**
```sh
brew install git
# 또는
xcode-select --install
```

**Windows:** [Git for Windows](https://git-scm.com/download/win) 다운로드 및 설치

**Linux:**
```sh
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install git -y

# CentOS/RHEL/Rocky Linux
# RedHat 8.10: yum 또는 dnf 사용 가능
sudo yum install git -y
# 또는 (RHEL 8+)
sudo dnf install git -y
```

### 2. Node.js 설치 (Node.js 14 필요)

**nvm 사용 (권장):**
```sh
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# 터미널 재시작 후
nvm install 14
nvm use 14
```

**직접 설치:** [Node.js 공식 사이트](https://nodejs.org/)에서 Node.js 14 LTS 다운로드

### 3. Python 설치 (Python 3.12+ 필요)

> ⚠️ **중요**: 
> - **Docker 컨테이너로 백엔드 실행 시**: Python 설치가 **불필요**합니다. 이 섹션을 **스킵**하세요.
> - **로컬에서 백엔드 직접 실행 시**: Backend Generators는 Python 3.12 이상이 필요합니다. Python 3.9나 3.10은 사용할 수 없습니다.

**Python 버전 확인:**
```sh
python3 --version
# Python 3.12 이상이어야 합니다
```

**macOS:**
```sh
brew install python3
```

**Windows:** [Python 공식 사이트](https://www.python.org/downloads/)에서 Python 3.12+ 다운로드

**Linux:**

**Ubuntu/Debian:**
```sh
sudo apt-get update && sudo apt-get install python3.12 python3.12-venv python3.12-pip -y
# 또는 최신 버전 설치
sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt-get update
sudo apt-get install python3.12 python3.12-venv python3.12-pip -y
```

**CentOS/RHEL/Rocky Linux:**

**RedHat 8.10 / CentOS 8:**
```sh
# 기본 Python 3.6 또는 3.8이 설치되어 있지만, Python 3.12가 필요합니다
# Python 3.12 설치 (EPEL 저장소에는 Python 3.12가 없으므로 소스 빌드 또는 pyenv 사용)

# 방법 1: 소스에서 빌드
sudo yum groupinstall "Development Tools" -y
sudo yum install openssl-devel bzip2-devel libffi-devel zlib-devel readline-devel sqlite-devel -y
cd /tmp
wget https://www.python.org/ftp/python/3.12.7/Python-3.12.7.tgz
tar xzf Python-3.12.7.tgz
cd Python-3.12.7
./configure --enable-optimizations
make altinstall
# Python 3.12는 python3.12 명령어로 실행됩니다

# 방법 2: pyenv 사용 (권장)
# pyenv 설치
curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

# Python 3.12 설치
pyenv install 3.12.7
pyenv global 3.12.7
python --version  # Python 3.12.7 확인
```

**Rocky Linux 9 / RHEL 9:**
```sh
# 기본 Python 3.9가 설치되어 있지만, Python 3.12가 필요합니다
# Python 3.12 설치 (EPEL 또는 소스에서 빌드)

# 방법 1: EPEL 저장소에서 설치 시도 (Rocky Linux 9에서만 가능할 수 있음)
sudo dnf install epel-release -y
sudo dnf install python3.12 python3.12-pip -y

# 방법 2: 소스에서 빌드 (방법 1이 실패하는 경우)
sudo dnf groupinstall "Development Tools" -y
sudo dnf install openssl-devel bzip2-devel libffi-devel zlib-devel readline-devel sqlite-devel -y
cd /tmp
wget https://www.python.org/ftp/python/3.12.7/Python-3.12.7.tgz
tar xzf Python-3.12.7.tgz
cd Python-3.12.7
./configure --enable-optimizations
make altinstall
# Python 3.12는 python3.12 명령어로 실행됩니다

# 방법 3: pyenv 사용 (권장)
# pyenv 설치
curl https://pyenv.run | bash
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

# Python 3.12 설치
pyenv install 3.12.7
pyenv global 3.12.7
python --version  # Python 3.12.7 확인
```

> 💡 **참고**: Python 3.12를 설치한 후, 가상환경 생성 시 `python3.12` 명령어를 사용하세요:
> ```sh
> python3.12 -m venv venv
> source venv/bin/activate
> ```

### 4. Docker 설치

**macOS/Windows:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) 다운로드 및 설치

**Linux:**
```sh
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# CentOS/RHEL/Rocky Linux
# RedHat 8.10: yum 사용 (RHEL 8은 dnf도 사용 가능하지만 yum으로도 작동)
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 또는 dnf 사용 (RHEL 8+)
# sudo dnf install -y yum-utils
# sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
# sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
# sudo systemctl start docker
# sudo systemctl enable docker
# sudo usermod -aG docker $USER
```

### 5. 필요한 포트 확인

다음 포트들이 사용 가능한지 확인하세요:
- **8080**: MSAez 플랫폼 (Frontend)
- **5757**: AceBase 데이터베이스
- **3000**: Gitea (Git 서버)
- **2025**: Backend Generators (Flask 서버, LangGraph 워크플로우)
- **5000**: Backend ES Generators (FastAPI 서버, LangGraph 워크플로우)

포트가 이미 사용 중인 경우, `docker-compose.yml`에서 포트를 변경할 수 있습니다.

> 💡 **참고**: Docker 컨테이너로 백엔드를 실행하는 경우, Python 설치나 백엔드 소스코드 다운로드가 불필요합니다.

## 소스코드 다운로드

VM에 설치하기 전에 필요한 소스코드를 다운로드해야 합니다.

> 💡 **Docker 컨테이너로 백엔드 실행 시 (권장)**: 
> - MSAez 플랫폼 소스코드만 다운로드하면 됩니다.
> - Backend Generators와 Backend ES Generators 소스코드 다운로드는 **불필요**합니다. Docker 이미지가 자동으로 다운로드됩니다.

### MSAez 플랫폼 소스코드

```sh
# MSAez 플랫폼 저장소 클론
git clone https://github.com/msa-ez/platform.git
cd platform
```

## Setting Gitea

이 단계에서는 Gitea Git 서버를 초기화하고 OAuth 설정을 완료합니다. MSAez와 AceBase가 Gitea와 연동되도록 설정합니다.

> 📁 **작업 디렉토리**: `platform/` (MSAEz 저장소를 클론한 디렉토리)

### 1. Gitea 초기화 및 실행

먼저 Gitea를 실행하고 초기 설정을 완료합니다.

**Gitea 실행:**
```sh
# platform 디렉토리로 이동
cd platform  # 또는 MSAez 저장소를 클론한 디렉토리

# docker-compose.yml이 있는 디렉토리에서 실행
docker compose up -d gitea
```

**초기 설정:**
1. 브라우저에서 Gitea 접속
   - **로컬 개발 환경**: `http://127.0.0.1:3000/` 또는 `http://localhost:3000/`
   - **VM/프로덕션 환경**: 설정한 도메인 또는 IP (예: `http://192.168.1.100:3000/` 또는 `https://gitea.example.com`)
2. Gitea 초기 설정 화면에서 다음 정보 입력:
   - **Database Type**: SQLite3 (기본값)
   - **Site Title**: 원하는 제목 입력
   - **Repository Root Path**: `/data/git/repositories` (기본값)
   - **Git LFS Root Path**: `/data/git/lfs` (기본값)
   - **Run As Username**: `git` (기본값)
   - **SSH Server Domain**: 
     - **로컬 개발 환경**: `gitea` 또는 `localhost`
     - **VM/프로덕션 환경**: Gitea 도메인 또는 IP (예: `gitea.example.com` 또는 `192.168.1.100`)
   - **SSH Port**: `22`
   - **HTTP Port**: `3000`
   - **Gitea Base URL**: 
     - **로컬 개발 환경**: `http://gitea:3000/` (Docker 네트워크 내부용)
     - **VM/프로덕션 환경**: 실제 접근 가능한 URL (예: `http://192.168.1.100:3000/` 또는 `https://gitea.example.com/`)
3. **Administrator Account Setting** 섹션에서 관리자 계정 생성:
   - **Username**: 원하는 관리자 사용자명
   - **Password**: 관리자 비밀번호
   - **Confirm Password**: 비밀번호 확인
   - **Email**: 관리자 이메일 주소
4. **Install Gitea** 버튼 클릭

![alt text](https://github.com/user-attachments/assets/46aae576-9418-4765-924f-6e37ef5e0881)

### 2. Gitea 설정 파일 수정

app.ini 파일에서 ROOT_URL 및 CORS 설정이 필요합니다.

> ⚠️ **CORS 설정 필수**: VM 환경에서는 프론트엔드(8080 포트)에서 Gitea API(3000 포트)로 요청할 때 CORS 오류가 발생할 수 있습니다. 이를 방지하기 위해 CORS 설정을 추가해야 합니다.

**설정 파일 위치:**
- `./gitea/gitea/conf/app.ini`

**수정 방법:**

파일 권한 문제가 있을 수 있으므로 `sudo`를 사용하여 편집하세요:

```sh
# 방법 1: sudo로 편집
sudo vi ./gitea/gitea/conf/app.ini
# 또는
sudo nano ./gitea/gitea/conf/app.ini

# 방법 2: sudo로 자동 추가 (CLI)
sudo sh -c 'cat >> ./gitea/gitea/conf/app.ini << '\''EOF'\''

[cors]
ENABLED = true
ALLOW_DOMAIN = *
EOF'
```

**추가/수정할 내용:**
```ini
# ./gitea/gitea/conf/app.ini

# CORS 설정 (VM 환경에서 필수)
[cors]
ENABLED = true
ALLOW_DOMAIN = *

[server]
APP_DATA_PATH = /data/gitea
# DOMAIN: Gitea 도메인
# 로컬 개발 환경: gitea (Docker 네트워크 내부)
# VM/프로덕션 환경: 실제 도메인 또는 IP (예: gitea.example.com 또는 192.168.1.100)
DOMAIN = gitea  # VM 환경에서는 실제 도메인 또는 IP로 변경
SSH_DOMAIN = gitea  # VM 환경에서는 실제 도메인 또는 IP로 변경
HTTP_PORT = 3000
# ROOT_URL: Gitea 접근 가능한 전체 URL
# 로컬 개발 환경: http://gitea:3000/ (Docker 네트워크 내부용)
# VM/프로덕션 환경: http://<VM_IP>:3000/ 또는 https://gitea.example.com/
ROOT_URL = http://gitea:3000/  # VM 환경에서는 실제 접근 가능한 URL로 변경
DISABLE_SSH = false
SSH_PORT = 22
SSH_LISTEN_PORT = 22
LFS_START_SERVER = true
LFS_JWT_SECRET = UPSh8CoIsH5nBiwg2kHeBWsKiIt97afTRSg0Jm2eeyA
OFFLINE_MODE = true
```

> 💡 **VM/프로덕션 환경 예시:**
> ```ini
> DOMAIN = 192.168.1.100  # 또는 gitea.example.com
> SSH_DOMAIN = 192.168.1.100  # 또는 gitea.example.com
> ROOT_URL = http://192.168.1.100:3000/  # 또는 https://gitea.example.com/
> ```

**설정 적용:**
```sh
# Gitea 컨테이너 재시작 (변경사항 적용)
sudo docker compose restart gitea

# 재시작 후 로그 확인
sudo docker compose logs -f gitea
```

> 💡 **CORS 설정 확인**: 브라우저 개발자 도구에서 CORS 오류가 발생하지 않는지 확인하세요. 여전히 오류가 발생하면 Gitea 컨테이너가 완전히 재시작될 때까지 몇 초 기다린 후 브라우저를 새로고침하세요.

### 3. OAuth2 Application 생성

AceBase가 Gitea와 OAuth 인증을 하기 위해 OAuth2 Application을 생성합니다.

**단계:**
1. Gitea에 관리자 계정으로 로그인
   - **로컬 개발 환경**: `http://localhost:3000`
   - **VM/프로덕션 환경**: 설정한 도메인 또는 IP (예: `http://192.168.1.100:3000` 또는 `https://gitea.example.com`)
2. 우측 상단 **프로필 아이콘** 클릭
3. **Settings** 클릭
4. 좌측 메뉴에서 **Applications** 클릭
5. **Manage OAuth2 Applications** 섹션에서:
   - **Application Name**: 원하는 이름 입력 (예: `acebase`)
   - **Redirect URIs**: 다음 URI 입력 (새 줄로 구분)
     - **로컬 개발 환경**:
       ```
       http://localhost:5757/oauth2/mydb/signin
       http://127.0.0.1:5757/oauth2/mydb/signin
       ```
     - **VM/프로덕션 환경**: AceBase 접근 가능한 URL 사용
       ```
       http://192.168.1.100:5757/oauth2/mydb/signin
       ```
       또는 도메인 사용 시:
       ```
       https://acebase.example.com/oauth2/mydb/signin
       ```
6. **Create Application** 버튼 클릭
7. 생성된 **Client ID**와 **Client Secret**을 복사하여 저장하세요.
   > ⚠️ **중요**: Client Secret은 한 번만 표시되므로 반드시 저장하세요.
   > ![alt text](https://github.com/user-attachments/assets/5b6c5038-1f29-4bcc-b70f-ed7fe004ee97)
8. **Save** 버튼 클릭

### 4. Gitea Personal Access Token 생성

MSAEz가 Gitea API를 사용하기 위해 Personal Access Token이 필요합니다. OAuth 토큰은 Gitea API에서 직접 사용할 수 없으므로 Personal Access Token을 생성해야 합니다.

**단계:**
1. Gitea에 로그인
   - **로컬 개발 환경**: `http://localhost:3000`
   - **VM/프로덕션 환경**: 설정한 도메인 또는 IP (예: `http://192.168.1.100:3000` 또는 `https://gitea.example.com`)
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

### 5. GitHub 저장소 마이그레이션 (선택사항)

기존 GitHub 저장소를 Gitea로 마이그레이션할 수 있습니다.

**단계:**

0. 계정 등록을 통해 사용자 명을 반드시 "posco"로 지정하여 template-poscodx template를 관리할 용도의 계정을 추가 (이메일과 비밀번호는 자유롭게 설정)
1. 사용자 명을 "posco"로 등록했던 계정으로 Gitea에 로그인
2. 우측 상단의 **+** (새 저장소) 아이콘 클릭
3. 상단의 **"Migrate repository"** 클릭
4. **"GitHub"** 클릭
5. **"URL로 부터 마이그레이션 / 클론"** 필드에 GitHub 저장소 URL 입력 (저장소 이름 변경 X)
   ```
   https://github.com/seongwonyang/template-poscodx.git
   ```
6. **"저장소 마이그레이션"** 버튼 클릭

마이그레이션이 완료되면 저장소의 코드, 커밋 히스토리, 브랜치, 태그가 Gitea로 복사됩니다.

### 6. Hosts 파일 추가 (로컬 개발 환경만 필요)

> ⚠️ **참고**: 이 단계는 **로컬 개발 환경**에서만 필요합니다. VM/프로덕션 환경에서는 DNS 설정이나 실제 도메인을 사용하므로 hosts 파일 수정이 필요하지 않을 수 있습니다.

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
# 로컬 개발 환경
127.0.0.1 gitea
```

**확인:**
```sh
ping gitea
# 127.0.0.1로 응답하는지 확인
```

> 💡 **VM/프로덕션 환경**: 
> - DNS 서버에 Gitea 도메인을 등록하거나
> - 실제 IP 주소를 직접 사용하거나
> - 역방향 프록시(Nginx 등)를 통해 도메인을 설정하세요.

## AceBase 설치 방법 선택

이 단계에서는 AceBase 데이터베이스를 설치하고 실행합니다. 설치형 혹은 docker compose를 사용합니다.

> 💡 **권장**: 프로덕션 환경에서는 **설치형 AceBase**를 사용하세요. 데이터 영속성이 보장되고 더 안정적입니다.

> ⚠️ **주의**: AceBase를 실행하기 전에 위의 "Setting Gitea" 섹션에서 OAuth2 Application을 생성하고 Client ID와 Secret을 발급받아야 합니다.

### 방법 1: 설치형 AceBase (프로덕션 권장) ⭐

프로덕션 환경에서는 Docker 없이 직접 설치하는 것을 권장합니다. 이 방법은 데이터 영속성이 보장되고 더 안정적입니다.

> 📁 **작업 디렉토리**: `platform/acebase/` (MSAEz 저장소의 acebase 디렉토리)

**설치 방법:**
```sh
# 1. platform 디렉토리로 이동 후 acebase 디렉토리로 이동
cd platform/acebase

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
# 위의 "Setting Gitea" 섹션의 "OAuth2 Application 생성" 단계에서 발급받은 Client ID와 Secret 사용
export CLIENT_ID=your-gitea-oauth-client-id
export CLIENT_SECRET=your-gitea-oauth-client-secret
export PROVIDER=gitea
# GIT: Gitea 호스트 및 포트
# 로컬 개발 환경: gitea:3000 (Docker 네트워크 내부) 또는 localhost:3000
# VM/프로덕션 환경: <VM_IP>:3000 또는 gitea.example.com:3000
export GIT=gitea:3000  # VM 환경에서는 실제 Gitea 접근 주소로 변경 (예: export GIT=34.64.202.245:3000)
export PROTOCOL=http  # HTTPS 사용 시 https로 변경
export DB_HOST=0.0.0.0
export DB_NAME=mydb
export DB_PORT=5757
export DB_HTTPS=false  # HTTPS 사용 시 true로 변경
export ADMIN_PASSWORD=your-admin-password  # 선택적: 기본값은 75sdDSFg37w5 (프로덕션 환경에서는 반드시 변경 권장)

# 💡 VM 환경에서 CLI로 GIT 환경 변수 설정:
# export VM_IP=34.64.202.245
# export GIT=${VM_IP}:3000

# 4. AceBase 실행
node main.js
```

**데이터 저장 위치:**
- 데이터는 `./acebase/mydb.acebase/` 디렉토리에 저장됩니다.
- 이 디렉토리를 백업하면 모든 데이터를 보존할 수 있습니다.

**확인:**
- AceBase가 정상적으로 실행되면 터미널에 "SERVER ready" 메시지가 표시됩니다.
- 브라우저에서 AceBase 관리자 포털 접속
  - **로컬 개발 환경**: `http://localhost:5757/webmanager/`
  - **VM/프로덕션 환경**: `http://<VM_IP>:5757/webmanager/` 또는 `https://acebase.example.com/webmanager/`
  - DB Name: `mydb`
  - User: `admin`
  - Password: `75sdDSFg37w5` (또는 `ADMIN_PASSWORD` 환경변수로 설정한 값)

### 방법 2: Docker 사용 (개발 환경용)

Docker를 사용하면 간편하게 실행할 수 있지만, **컨테이너를 재시작하면 데이터가 소멸됩니다.**

> 📁 **작업 디렉토리**: `platform/` (docker-compose.yml이 있는 디렉토리)

**장점:**
- 간편한 설치 및 실행
- 개발/테스트 환경에 적합

**단점:**
- ⚠️ 컨테이너 재시작 시 데이터 소멸
- 프로덕션 환경에는 부적합

**docker-compose.yml 설정:**

**로컬 개발 환경:**
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
    CLIENT_ID: your-gitea-oauth-client-id
    CLIENT_SECRET: your-gitea-oauth-client-secret
    PROVIDER: gitea
    GIT: "gitea:3000"  # Docker 네트워크 내부
    PROTOCOL: http
```

**VM/프로덕션 환경 (외부 접근이 필요한 경우):**
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
    CLIENT_ID: your-gitea-oauth-client-id
    CLIENT_SECRET: your-gitea-oauth-client-secret
    PROVIDER: gitea
    GIT: "34.64.202.245:3000"  # VM IP로 변경 (예시)
    PROTOCOL: http
```

> 💡 **VM 환경에서 CLI로 자동 변경:**
> ```sh
> # VM IP를 환경 변수로 설정
> export VM_IP=34.64.202.245
> 
> # docker-compose.yml의 GIT 환경 변수 변경
> sed -i "s|GIT: \"gitea:3000\"|GIT: \"${VM_IP}:3000\"|g" docker-compose.yml
> 
> # 변경 사항 확인
> grep "GIT:" docker-compose.yml
> ```

**실행:**
```sh
docker compose up -d acebase
```

## Initialize MSAez

이 단계에서는 docker-compose.yml을 설정하고 MSAez 플랫폼을 실행합니다.

> 📁 **작업 디렉토리**: `platform/` (MSAEz 저장소를 클론한 디렉토리, docker-compose.yml이 있는 위치)

### docker-compose.yml 설정

프로젝트 루트 디렉토리에 `docker-compose.yml` 파일을 생성하거나 수정합니다.

> 💡 **VM 환경 설정**: VM에 설치하는 경우, 아래의 환경 변수들을 VM IP 또는 도메인으로 변경해야 합니다.

**파일 편집 방법:**

```sh
# vi 편집기 사용
vi docker-compose.yml

# 또는 nano 편집기 사용 (더 쉬움)
nano docker-compose.yml
```

> 💡 **vi 편집기 사용법**:
> - 파일 열기: `vi docker-compose.yml`
> - 편집 모드 진입: `i` 키 누르기 (INSERT 모드)
> - 수정 완료: `ESC` 키 누르기
> - 저장 및 종료: `:wq` 입력 후 `Enter`
> - 저장 없이 종료: `:q!` 입력 후 `Enter`
> - 검색: `/검색어` 입력 후 `Enter`, 다음 결과: `n`, 이전 결과: `N`
> - 특정 줄로 이동: `:줄번호` 입력 후 `Enter` (예: `:20`)

**VM 환경에서 수정할 내용:**

`docker-compose.yml` 파일은 기본적으로 로컬 환경(`localhost`)을 기준으로 설정되어 있습니다. **VM 환경**에서 사용하는 경우 다음 환경 변수들을 VM IP로 변경하세요:

#### 1. `msaez` 서비스 (약 7-24줄)

```yaml
msaez:
  extra_hosts:
    - "host.docker.internal:host-gateway"
  environment:
    # ⚠️ VM 환경: 127.0.0.1 → VM IP로 변경 (브라우저가 접근하는 주소와 동일하게 설정)
    VUE_APP_DB_HOST: 34.64.202.245  # 예시: VM IP
    # ⚠️ VM 환경: localhost → VM IP로 변경
    VUE_APP_GIT_URL: http://34.64.202.245:3000  # 예시: VM IP
    # ⚠️ VM 환경: localhost → VM IP로 변경
    VUE_APP_BACKEND_URL: http://34.64.202.245:2025  # 예시: VM IP
    VUE_APP_GITEA_TOKEN: "your-gitea-token"  # ⚠️ 수정: Gitea Personal Access Token으로 변경
```

> 💡 **WebSocket 연결 안정성**: `VUE_APP_DB_HOST`를 VM IP로 설정하면 브라우저와 컨테이너가 동일한 주소로 AceBase에 접근하여 WebSocket 연결이 더 안정적입니다.

#### 2. `backend-generators` 서비스 (약 25-52줄)

```yaml
backend-generators:
  extra_hosts:
    - "host.docker.internal:host-gateway"
  environment:
    OPENAI_API_KEY: "your-openai-api-key"  # ⚠️ 수정: 실제 OpenAI API 키로 변경
    # AceBase 설정
    ACEBASE_HOST: host.docker.internal  # 기본값 (로컬/VM 모두 작동)
    # ⚠️ VM 환경: host.docker.internal이 작동하지 않는 경우 VM IP로 변경 가능
    # ACEBASE_HOST: 34.64.202.245  # VM IP
    # 나머지 설정은 기본값 유지 (수정 불필요)
```

> 💡 **AceBase 접근 방법**: 
> - `host.docker.internal`은 로컬/VM 환경 모두에서 작동합니다 (기본값 사용 권장).
> - 만약 `host.docker.internal`이 작동하지 않으면 VM IP를 직접 사용하세요.

#### 3. `backend-es-generators` 서비스 (약 54-90줄)

```yaml
backend-es-generators:
  extra_hosts:
    - "host.docker.internal:host-gateway"
  environment:
    GOOGLE_API_KEY: "your-google-api-key"  # ⚠️ 수정: 실제 Google AI API 키로 변경
    # AceBase 설정
    ACEBASE_HOST: host.docker.internal  # 기본값 (로컬/VM 모두 작동)
    # ⚠️ VM 환경: host.docker.internal이 작동하지 않는 경우 VM IP로 변경 가능
    # ACEBASE_HOST: 34.64.202.245  # VM IP
    # ⚠️ VM 환경: localhost → VM IP로 변경
    A2A_EXTERNAL_URL: http://34.64.202.245:5000  # 예시: VM IP
    # 나머지 설정은 기본값 유지 (수정 불필요)
```

> 💡 **AceBase 접근 방법**: 
> - `host.docker.internal`은 로컬/VM 환경 모두에서 작동합니다 (기본값 사용 권장).
> - 만약 `host.docker.internal`이 작동하지 않으면 VM IP를 직접 사용하세요.

> 💡 **vi에서 특정 서비스로 빠르게 이동하는 방법**:
> - `/backend-generators` 입력 후 `Enter` → backend-generators 서비스로 이동
> - `/backend-es-generators` 입력 후 `Enter` → backend-es-generators 서비스로 이동
> - `/msaez:` 입력 후 `Enter` → msaez 서비스로 이동

**docker-compose.yml 전체 예시:**

아래는 기본 `docker-compose.yml` 파일의 전체 내용입니다. 환경에 따라 **두 가지 차이점**만 수정하면 됩니다:

1. **IP 설정**: 로컬 환경(`localhost`, `127.0.0.1`) vs VM 환경(VM IP)
2. **AceBase 서비스**: 설치형 AceBase 사용 시 주석 처리 vs Docker로 AceBase 사용 시 활성화

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
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      # ⚠️ 로컬: 127.0.0.1 | VM: VM IP (예: 34.64.202.245)
      VUE_APP_DB_HOST: 127.0.0.1
      VUE_APP_DB_PORT: 5757
      VUE_APP_DB_NAME: mydb
      VUE_APP_MODE: onprem
      VUE_APP_DB_HTTPS: "false"
      VUE_APP_GIT: gitea
      # ⚠️ 로컬: localhost | VM: VM IP (예: http://34.64.202.245:3000)
      VUE_APP_GIT_URL: http://localhost:3000
      # ⚠️ 로컬: localhost | VM: VM IP (예: http://34.64.202.245:2025)
      VUE_APP_BACKEND_URL: http://localhost:2025
      VUE_APP_GITEA_TOKEN: "your-gitea-personal-access-token"
  
  backend-generators:
    image: ghcr.io/uengineysw/msaez-automate-project-generator:v1.0.0
    container_name: backend-generators
    networks:
      - msaez
    ports:
      - "2025:2025"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      OPENAI_API_KEY: your-openai-api-key-here
      # ⚠️ 설치형 AceBase: host.docker.internal | Docker AceBase: acebase
      ACEBASE_HOST: host.docker.internal
      ACEBASE_PORT: 5757
      ACEBASE_DB_NAME: mydb
      ACEBASE_HTTPS: "false"
      ACEBASE_USERNAME: admin
      ACEBASE_PASSWORD: 75sdDSFg37w5
      FLASK_HOST: 0.0.0.0
      FLASK_PORT: 2025
      STORAGE_TYPE: acebase
      ENVIRONMENT: production
      IS_LOCAL_RUN: "true"
      NAMESPACE: eventstorming_generator
      POD_ID: docker-pod
    restart: unless-stopped
  
  backend-es-generators:
    image: ghcr.io/shinseongjin2/msaez-automate-eventstorming-generator:v1.0.0
    container_name: backend-es-generators
    networks:
      - msaez
    ports:
      - "5000:5000"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
      GOOGLE_API_KEY: your-google-api-key-here
      AI_MODEL: google_genai:gemini-flash-latest:thinking
      AI_MODEL_MAX_INPUT_LIMIT: 983040
      AI_MODEL_MAX_BATCH_SIZE: 15
      AI_MODEL_LIGHT: google_genai:gemini-flash-latest:thinking
      AI_MODEL_LIGHT_MAX_INPUT_LIMIT: 983040
      AI_MODEL_LIGHT_MAX_BATCH_SIZE: 30
      # ⚠️ 설치형 AceBase: host.docker.internal | Docker AceBase: acebase
      ACEBASE_HOST: host.docker.internal
      ACEBASE_PORT: 5757
      ACEBASE_DB_NAME: mydb
      ACEBASE_HTTPS: "false"
      ACEBASE_USERNAME: admin
      ACEBASE_PASSWORD: 75sdDSFg37w5
      A2A_HOST: 0.0.0.0
      A2A_PORT: 5000
      # ⚠️ 로컬: localhost | VM: VM IP (예: http://34.64.202.245:5000)
      A2A_EXTERNAL_URL: http://localhost:5000
      DB_TYPE: acebase
      NAMESPACE: eventstorming_generator
      POD_ID: docker-pod
      IS_LOCAL_RUN: "true"
      USE_GENERATOR_CACHE: "true"
    restart: unless-stopped
  
  # ⚠️ 설치형 AceBase 사용 시: 주석 처리 유지
  # ⚠️ Docker로 AceBase 사용 시: 아래 주석 해제
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

**수정 요약:**

| 환경 | 수정 항목 | 값 |
|------|----------|-----|
| **로컬 + 설치형 AceBase** | 수정 불필요 | 기본값 그대로 사용 |
| **VM + 설치형 AceBase** | `VUE_APP_DB_HOST`, `VUE_APP_GIT_URL`, `VUE_APP_BACKEND_URL`, `A2A_EXTERNAL_URL` | VM IP로 변경 |
| **로컬 + Docker AceBase** | `ACEBASE_HOST` (backend 서비스들), `VUE_APP_DB_HOST`, `acebase` 서비스 주석 해제 | `acebase`로 변경 |
| **VM + Docker AceBase** | 위의 모든 항목 | VM IP + `acebase` 서비스 활성화 |

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

> 💡 **참고**: AceBase는 위의 "AceBase 설치 방법 선택" 섹션에서 이미 설정 및 실행되었습니다. 이 섹션에서는 MSAez와 Gitea만 실행합니다.

> ⚠️ **VM 환경 주의사항**: VM에 설치하는 경우, 위의 "docker-compose.yml 설정" 섹션에서 VM IP로 환경 변수를 변경한 후 서비스를 실행하세요.

> 📁 **작업 디렉토리**: `platform/` (docker-compose.yml이 있는 디렉토리)

**설치형 AceBase 사용 시:**
```sh
# platform 디렉토리로 이동
cd platform

# VM 환경인 경우, 먼저 docker-compose.yml의 환경 변수를 VM IP로 변경
# (위의 "docker-compose.yml 설정" 섹션 참조)

# MSAez와 Gitea, Backend Generator, Backend ES Generator 모두 실행
docker compose up -d
```

**Docker로 AceBase 사용 시:**
```sh
# VM 환경인 경우, 먼저 docker-compose.yml의 환경 변수를 VM IP로 변경
# (위의 "docker-compose.yml 설정" 섹션 참조)

# 모든 서비스 실행 (MSAEz, AceBase, Gitea)
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
- **로컬 개발 환경**: `http://localhost:8080`
- **VM/프로덕션 환경**: `http://<VM_IP>:8080` 또는 `https://msaez.example.com`

**확인 사항:**
- MSAez 웹 인터페이스가 정상적으로 로드되는지 확인
- Gitea 로그인 기능이 정상적으로 동작하는지 확인
- AceBase 연결 상태 확인 (브라우저 개발자 도구 콘솔에서 확인)

### VM 방화벽 설정

VM 환경에서 외부에서 접근하려면 방화벽 규칙을 설정해야 합니다.

**필요한 포트:**
- **8080**: MSAez Frontend
- **3000**: Gitea
- **5757**: AceBase (설치형 사용 시)
- **2025**: Backend Generators (문서 업로드 등)
- **5000**: Backend ES Generators (Event Storming Generator)

**방화벽 규칙 설정:**

사용하는 클라우드 플랫폼 또는 VM 환경에 따라 다음 포트들에 대한 인바운드 트래픽을 허용하는 방화벽 규칙을 생성하세요:

- **TCP 8080**: MSAez Frontend 접근용
- **TCP 3000**: Gitea 접근용
- **TCP 5757**: AceBase 접근용 (설치형 사용 시)
- **TCP 2025**: Backend Generators 접근용
- **TCP 5000**: Backend ES Generators 접근용

> ⚠️ **중요**: 
> - 보안을 위해 가능한 한 특정 IP 범위나 신뢰할 수 있는 소스에서만 접근을 허용하는 것을 권장합니다.
> - VM이 여러 네트워크를 사용하는 경우, 각 네트워크에 대해 방화벽 규칙을 설정해야 할 수 있습니다.
> - 클라우드 플랫폼별 방화벽 설정 방법은 해당 플랫폼의 문서를 참조하세요.
>   - **GCP**: Cloud Console의 VPC 방화벽 규칙 또는 `gcloud compute firewall-rules` 명령어 사용
>   - **AWS**: Security Groups 설정
>   - **Azure**: Network Security Groups 설정
>   - **기타**: 해당 플랫폼의 방화벽/보안 그룹 설정 사용

**문제 해결:**
- 서비스가 실행되지 않는 경우: `docker compose ps`로 상태 확인
- 포트 충돌: `docker compose logs`로 에러 로그 확인
- Gitea 연결 문제: hosts 파일 설정 확인 (`127.0.0.1 gitea`)
- **VM 환경에서 WebSocket 연결 오류 (timeout)**: 
  - `docker-compose.yml`의 `VUE_APP_DB_HOST`가 VM IP로 설정되어 있는지 확인 (브라우저가 접근하는 주소와 동일해야 함)
  - `msaez` 서비스에 `extra_hosts`가 추가되어 있는지 확인
  - `backend-generators`와 `backend-es-generators`의 `ACEBASE_HOST`가 `host.docker.internal` 또는 VM IP로 설정되어 있는지 확인
  - `extra_hosts`가 추가되어 있는지 확인
  - 컨테이너를 재시작하세요:
  ```sh
  # 환경 변수 변경 후 컨테이너 재시작
  docker compose restart msaez backend-generators backend-es-generators
  
  # 또는 전체 재시작
  docker compose down
  docker compose up -d
  ```
- **AceBase 연결 timeout 오류**: 
  - `host.docker.internal`이 작동하는지 확인: `docker compose exec backend-es-generators sh -c "getent hosts host.docker.internal"`
  - 작동하지 않으면 `ACEBASE_HOST`를 VM IP로 직접 설정
  - AceBase가 `0.0.0.0:5757`에 바인딩되어 있는지 확인: `netstat -tulnp | grep 5757`

## Backend 생성기 설정 (Docker Compose) 

이전 설정단계에서 docker-compose.yml의 모든 내용을 수정했다면, 이미 Backend 생성기들의 설정이 완료되었으므로 스킵합니다.
MSAEz의 AI 기능을 사용하려면 Backend 생성기들을 실행해야 합니다.

> 💡 **Docker 컨테이너 사용**: 이 섹션에서는 Docker 이미지를 사용하여 백엔드를 실행합니다. Python 설치나 소스코드 다운로드가 **불필요**합니다.

> 📁 **작업 디렉토리**: `platform/` (docker-compose.yml이 있는 디렉토리)

### 1. Backend Generators (Project Generator) 설정

**docker-compose.yml 파일 수정:**

`docker-compose.yml` 파일을 편집하여 `backend-generators` 서비스 섹션의 환경 변수를 설정하세요.

**파일 편집 방법:**

```sh
# vi 편집기 사용
vi docker-compose.yml

# 또는 nano 편집기 사용 (더 쉬움)
nano docker-compose.yml
```

> 💡 **vi 편집기 사용법**:
> - 파일 열기: `vi docker-compose.yml`
> - 편집 모드 진입: `i` 키 누르기 (INSERT 모드)
> - 수정 완료: `ESC` 키 누르기
> - 저장 및 종료: `:wq` 입력 후 `Enter`
> - 저장 없이 종료: `:q!` 입력 후 `Enter`
> - 검색: `/검색어` 입력 후 `Enter`, 다음 결과: `n`, 이전 결과: `N`

**수정할 내용:**

`backend-generators` 서비스의 `environment` 섹션에서 다음 값들을 수정하세요:

```yaml
backend-generators:
  image: ghcr.io/uengineYSW/msaez-automate-project-generator:v1.0.0
  environment:
    # ⚠️ 필수: OpenAI API Key
    OPENAI_API_KEY: "your-openai-api-key-here"  # 실제 API 키로 변경
    
    # AceBase 설정
    # 로컬 개발 환경 (Docker Compose로 AceBase 실행): acebase
    # VM 환경 (로컬에서 직접 실행 중인 AceBase): VM IP (예: 34.64.202.245)
    ACEBASE_HOST: acebase  # ⚠️ VM 환경: acebase → VM IP로 변경
    ACEBASE_PORT: 5757
    ACEBASE_DB_NAME: mydb
    ACEBASE_HTTPS: "false"
    ACEBASE_USERNAME: admin
    ACEBASE_PASSWORD: 75sdDSFg37w5  # AceBase ADMIN_PASSWORD와 일치해야 함
    
    # Flask 서버 설정
    FLASK_HOST: 0.0.0.0  # 모든 인터페이스에서 접근 가능
    FLASK_PORT: 2025
    
    # 기타 설정
    STORAGE_TYPE: acebase
    ENVIRONMENT: production
    IS_LOCAL_RUN: "true"  # ⚠️ Docker Compose 환경: "true"로 설정하여 Kubernetes autoscaler 비활성화
    NAMESPACE: eventstorming_generator
    POD_ID: docker-pod
  # ⚠️ VM 환경 (acebase 서비스가 주석 처리된 경우): depends_on 제거 또는 주석 처리
  # depends_on:
  #   - acebase
```

**수정 요약:**
- ✅ **수정 필요**: `OPENAI_API_KEY` (약 32줄), `ACEBASE_HOST` (약 34줄) - VM 환경에서만
- ✅ **VM 환경 추가 수정**: `depends_on: - acebase` 제거 또는 주석 처리 (약 49-50줄)
- ❌ **수정 불필요**: 나머지 모든 환경 변수

> 💡 **API Key 발급**: OpenAI API Key는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

**서비스 실행:**
```sh
# platform 디렉토리로 이동
cd platform

# Backend Generators 실행
docker compose up -d backend-generators

# 로그 확인
docker compose logs -f backend-generators
```

**확인:**
- Health Check: 
  - **로컬 개발 환경**: `http://localhost:2025/ok`
  - **VM/프로덕션 환경**: `http://<VM_IP>:2025/ok`

### 2. Backend ES Generators (Event Storming Generator) 설정

**docker-compose.yml 파일 수정:**

`docker-compose.yml` 파일을 편집하여 `backend-es-generators` 서비스 섹션의 환경 변수를 설정하세요.

**파일 편집 방법:**

```sh
# vi 편집기 사용
vi docker-compose.yml

# 또는 nano 편집기 사용 (더 쉬움)
nano docker-compose.yml
```

> 💡 **vi 편집기 사용법**:
> - 파일 열기: `vi docker-compose.yml`
> - 편집 모드 진입: `i` 키 누르기 (INSERT 모드)
> - 수정 완료: `ESC` 키 누르기
> - 저장 및 종료: `:wq` 입력 후 `Enter`
> - 저장 없이 종료: `:q!` 입력 후 `Enter`
> - 검색: `/검색어` 입력 후 `Enter`, 다음 결과: `n`, 이전 결과: `N`

**수정할 내용:**

`backend-es-generators` 서비스의 `environment` 섹션에서 다음 값들을 수정하세요:

```yaml
backend-es-generators:
  image: ghcr.io/ShinSeongJin2/msaez-automate-eventstorming-generator:v1.0.0
  environment:
    # ⚠️ 필수: Google AI API Key (Gemini 모델 사용)
    GOOGLE_API_KEY: "your-google-api-key-here"  # 실제 API 키로 변경
    
    # AI 모델 설정
    AI_MODEL: google_genai:gemini-flash-latest:thinking
    AI_MODEL_MAX_INPUT_LIMIT: 983040
    AI_MODEL_MAX_BATCH_SIZE: 15
    AI_MODEL_LIGHT: google_genai:gemini-flash-latest:thinking
    AI_MODEL_LIGHT_MAX_INPUT_LIMIT: 983040
    AI_MODEL_LIGHT_MAX_BATCH_SIZE: 30
    
    # AceBase 설정
    # 로컬 개발 환경 (Docker Compose로 AceBase 실행): acebase
    # VM 환경 (로컬에서 직접 실행 중인 AceBase): VM IP (예: 34.64.202.245)
    ACEBASE_HOST: acebase  # ⚠️ VM 환경: acebase → VM IP로 변경
    ACEBASE_PORT: 5757
    ACEBASE_DB_NAME: mydb
    ACEBASE_HTTPS: "false"
    ACEBASE_USERNAME: admin
    ACEBASE_PASSWORD: 75sdDSFg37w5  # AceBase ADMIN_PASSWORD와 일치해야 함
    
    # A2A 서버 설정
    A2A_HOST: 0.0.0.0  # 모든 인터페이스에서 접근 가능
    A2A_PORT: 5000
    A2A_EXTERNAL_URL: http://34.64.202.245:5000  # VM 환경에서는 실제 VM IP로 변경
    
    # 기타 설정
    DB_TYPE: acebase
    NAMESPACE: eventstorming_generator
    POD_ID: docker-pod
    IS_LOCAL_RUN: "true"  # ⚠️ Docker Compose 환경: "true"로 설정하여 Kubernetes autoscaler 비활성화
    USE_GENERATOR_CACHE: "true"
  # ⚠️ VM 환경 (acebase 서비스가 주석 처리된 경우): depends_on 제거 또는 주석 처리
  # depends_on:
  #   - acebase
```

> 💡 **API Key 발급**: Google AI API Key는 [Google AI Studio](https://aistudio.google.com/apikey)에서 발급받을 수 있습니다.

**서비스 실행:**
```sh
# platform 디렉토리로 이동
cd platform

# Backend ES Generators 실행
docker compose up -d backend-es-generators

# 로그 확인
docker compose logs -f backend-es-generators
```

**확인:**
- LangGraph 서버: 
  - **로컬 개발 환경**: `http://localhost:5000`
  - **VM/프로덕션 환경**: `http://<VM_IP>:5000`

### 3. 중요 사항

1. **AceBase 먼저 실행**: Backend 생성기들은 AceBase에 의존하므로, AceBase가 먼저 실행되어 있어야 합니다.
   ```sh
   docker compose up -d acebase
   # AceBase가 준비될 때까지 대기 후
   docker compose up -d backend-generators backend-es-generators
   ```

2. **VM 환경 설정**: 
   - `A2A_EXTERNAL_URL`을 실제 VM IP로 변경해야 합니다 (예: `http://34.64.202.245:5000`).
   - `ACEBASE_HOST`를 VM IP로 변경해야 합니다 (로컬에서 직접 실행 중인 AceBase 접근 시).
   - `IS_LOCAL_RUN`을 `"true"`로 설정해야 합니다 (Docker Compose 환경에서는 Kubernetes autoscaler 비활성화).
   - `depends_on: - acebase`를 제거하거나 주석 처리해야 합니다 (acebase 서비스가 주석 처리되어 있는 경우).
   - **방화벽 규칙 설정이 필요합니다** (위의 "VM 방화벽 설정" 섹션 참조).

3. **모든 서비스 한 번에 실행**:
   ```sh
   docker compose up -d
   ```

4. **서비스 상태 확인**:
   ```sh
   docker compose ps
   docker compose logs -f
   ```

5. **환경 변수 변경 후 재시작**:
   ```sh
   # docker-compose.yml 수정 후 컨테이너 재시작
   docker compose restart backend-generators backend-es-generators
   
   # 또는 전체 재시작
   docker compose down
   docker compose up -d
   ```

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
