# MSAez v1.0.29 → v1.0.30 전환 가이드 (AceBase → PostgreSQL)

**v1.0.29 가 이미 서버에서 동작 중**이라는 전제로, DB 계층만 AceBase 에서
PostgreSQL 로 교체하는 절차다. Gitea·OAuth2 앱·Personal Access Token 은
**그대로 재사용**한다 — Gitea 쪽은 손대지 않는다.

> 신규(처음부터) 설치는 이 문서 범위가 아니다. 이미 돌아가는 v1.0.29 환경을
> 전환하는 것만 다룬다.

---

## 0. 무엇이 바뀌나

### v1.0.29 (현재)

| 컴포넌트 | 실행 방식 | 포트 |
| --- | --- | --- |
| AceBase | **node (호스트에서 직접)** | 5757 |
| msaez (프론트엔드) | docker | 8080 |
| backend-generators | docker | 2025 |
| backend-es-generators | docker | 5000 |
| gitea | docker | 3000 / 222 |

### v1.0.30 (전환 후)

| 컴포넌트 | 실행 방식 | 포트 |
| --- | --- | --- |
| **PostgreSQL** | docker (신규) | 5432 — `127.0.0.1` 전용, 외부 미개방 |
| **data-gateway** | **node (호스트에서 직접)** | 5757 ← AceBase 자리 그대로 |
| msaez (프론트엔드) | docker | 8080 |
| backend-generators | docker | 2025 |
| backend-es-generators | docker | 5000 |
| gitea | docker | 3000 / 222 |

### 핵심 — 질문하신 흐름이 맞다

> *".30 을 pull 받아서 data-gateway 를 node 로 띄우고, 나머지는 docker 의
> ghcr 이미지만 바꾸면 되는가?"* → **거의 그렇다.** 단 아래 3가지가 더 필요하다.

1. **PostgreSQL 을 새로 띄우고 스키마를 넣어야 한다** — AceBase 자체가 DB 였으므로
   v1.0.29 엔 없던 컴포넌트다 (§2).
2. **백엔드는 이미지 태그뿐 아니라 DB 환경변수도 바꿔야 한다** — `ACEBASE_*` → `POSTGRES_*` (§5).
3. **AceBase(node) 를 내려야 한다** — 5757 포트를 data-gateway 가 차지하므로 (§3).

그대로 두는 것:

- **Gitea** — 컨테이너, 데이터, `app.ini` 모두 변경 없음.
- **Gitea OAuth2 Application** — AceBase 가 쓰던 **Client ID / Secret 을 게이트웨이가 그대로 사용**.
  Redirect URI 도 `http://<VM_IP>:5757/oauth2/mydb/signin` 으로 동일하므로 **재등록 불필요**.
- **Gitea Personal Access Token** — 프론트엔드가 쓰던 값 그대로.
- **포트** — 5757 / 8080 / 3000 / 2025 / 5000. 방화벽 규칙 변경 없음 (신규 5432 는 호스트 내부 전용).
- **프론트엔드 설정** — 5757 을 그대로 바라보므로 환경변수 변경 없이 **이미지 태그만** 올린다.

---

## 사전 준비 — 호스트 Node 버전

AceBase 는 Node 14 에서 돌았지만, 게이트웨이의 OAuth 코드가 전역 `fetch`(Node 18+)
를 쓰므로 **Node 14 에서는 Gitea 로그인이 실패한다.** 호스트의 node 를 **Node 20**
으로 올린다 (전환이 끝나면 AceBase 가 사라지므로 Node 14 를 유지할 이유도 없다).

아래 명령은 **디렉토리와 무관하다 — 아무 경로에서나 실행해도 된다.**

먼저 nvm(nvm-sh) 이 설치돼 있는지 확인한다:

```sh
ls -la ~/.nvm/nvm.sh       # 파일이 있으면 nvm 설치됨
type nvm                   # 'nvm is a function' 이면 셸에 로드된 상태
```

> ⚠️ `nvm install` 실행 시 `This is not the package you are looking for...` 메시지가
> 나오면, 진짜 nvm 이 아니라 yum 의 **동명(同名) 스텁 패키지**가 응답한 것이다.
> 아래 절차로 진짜 nvm 을 설치한다.

**nvm 이 없으면 — 설치 (curl 스크립트, yum 패키지 아님):**

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc           # 또는 터미널을 새로 연다
command -v nvm             # 'nvm' 이 나오면 정상
```

**nvm 으로 Node 20 설치:**

```sh
nvm install 20
nvm use 20                 # 현재 셸에만 적용됨
nvm alias default 20       # 새로 여는 터미널의 기본값도 20 으로 고정
node -v                    # v20.x 확인
```

> ⚠️ `nvm use 20` 은 **그 터미널 세션에만** 적용된다. §4 에서 `node src/server.js`
> 로 게이트웨이를 띄우는 터미널이 Node 20 인지 반드시 확인할 것
> (`nvm alias default 20` 을 해두면 새 터미널도 자동으로 20).

> nvm 대신 시스템 패키지로 설치할 수도 있다 (`curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -` → `sudo yum install -y nodejs`).
> 단 이 경우 시스템 node 가 20 으로 교체되어 롤백 시 AceBase(Node 14)가 동작하지
> 않을 수 있다 — 14·20 공존이 가능한 **nvm 방식을 권장**한다.

> data-gateway 를 컨테이너로 돌리면 호스트 Node 가 불필요하다 ([data-gateway/Dockerfile](data-gateway/Dockerfile) 포함).
> 다만 본 가이드는 AceBase 와 동일하게 **node 호스트 실행**을 기준으로 한다.

---

## 1. v1.0.30 소스 받기 + 환경변수 설정

### 1-1. 소스 받기

platform 저장소에서 `release/v1.0.30` 브랜치로 전환한다.

> 운영 중인 `docker-compose.yml` 은 VM IP·PAT·LLM 키가 채워진 채
> **git 추적 파일**이므로, 그대로 두면 `checkout`/`pull` 이
> `Your local changes ... would be overwritten` 으로 막힌다.
> 값을 백업한 뒤 추적 파일의 로컬 수정을 폐기해야 한다.

```sh
cd platform                          # 기존 v1.0.29 를 받아둔 디렉토리
git status                           # 로컬 수정 파일 확인 (보통 docker-compose.yml 만)

cp docker-compose.yml docker-compose.yml.v1029.bak   # 현재 값 백업 (값 이전·롤백용)
git checkout -- docker-compose.yml   # 추적 파일의 로컬 수정 폐기 — 위에서 백업했으니 안전
# docker-compose.yml 외에 수정된 파일이 있으면 동일하게: 백업 후 git checkout -- <파일>

git fetch origin
git checkout release/v1.0.30
git pull
```

이걸로 받는 것: 새 `docker-compose.yml`(postgres 추가, 백엔드가 PostgreSQL 사용),
[data-gateway/](data-gateway/)(게이트웨이 소스 + DB 스키마), `.env.example`.

### 1-2. 환경변수 설정 (.env)

v1.0.30 의 `docker-compose.yml` 은 **직접 수정하지 않는다.** 환경별 값(IP·비밀번호·
API 키)은 `.env` 파일에 두고 compose 가 `${VAR}` 로 치환한다. `.env` 는 `.gitignore`
대상이라 **git 에 추적되지 않으므로**, 비밀값이 커밋되지 않고 이후 `git pull` 도
충돌하지 않는다 (compose 파일 자체는 손대지 않으니까).

```sh
cp .env.example .env
```

`.env` 를 열어 6개 값을 채운다 — 백업해 둔 `docker-compose.yml.v1029.bak` 에서
그대로 옮겨오면 된다 (`DB_PASSWORD` 만 새로 정함):

| 변수 | 값 |
| --- | --- |
| `DB_PASSWORD` | PostgreSQL 비밀번호 — 임의의 강한 값 (신규로 정함) |
| `VM_IP` | 브라우저가 접근하는 호스트 IP/도메인 (예: `34.64.202.245`) |
| `GITEA_PERSONAL_ACCESS_TOKEN` | v1.0.29 에서 쓰던 Gitea PAT 그대로 |
| `OPENAI_API_KEY` | v1.0.29 에서 쓰던 LLM 키 그대로 (P-GPT 사용 시 P-GPT Key) |
| `OPENAI_EMBEDDING_API_KEY` | 임베딩용 실제 OpenAI Key |
| `GOOGLE_API_KEY` | Gemini 사용 시 Google AI Key |

> P-GPT 를 쓰면 `.env` 에 `OPENAI_BASE_URL` 도 설정하고 `docker-compose.yml` 의
> 해당 `OPENAI_BASE_URL` 주석 줄을 해제한다 (`.env.example` 참조).

---

## 2. PostgreSQL 기동

`docker-compose.yml` 의 `postgres` 서비스를 먼저 띄운다 — 비밀번호는 §1-2 의 `.env`
`DB_PASSWORD` 에서 읽으므로 compose 를 손댈 필요가 없다.

```sh
docker compose up -d postgres
```

- **최초 기동 시** [data-gateway/migrations/](data-gateway/migrations/) 의 `001_init.sql`(테이블 8개) +
  `002_notify.sql`(트리거/NOTIFY) 가 자동 적용된다.
- 5432 포트는 `127.0.0.1` 에만 바인딩 — 호스트의 게이트웨이만 접근, 외부 노출 없음.

확인:

```sh
docker compose ps postgres
docker exec msaez-postgres psql -U msaez -d msaez -c "\dt"
```

`kv_store`, `users`, `definitions`, `user_lists`, `requested_jobs`, `jobs`,
`definition_queue`, `definition_snapshots` 8개 테이블이 보이면 정상.

---

## 3. AceBase 중지

5757 포트를 data-gateway 가 차지하려면 먼저 AceBase 를 내린다.

```sh
# AceBase 를 실행했던 터미널에서 Ctrl+C, 또는 프로세스 종료
pkill -f "node .*main.js"          # AceBase 프로세스 확인 후 신중히
lsof -i :5757                      # 5757 이 비었는지 확인 (출력 없어야 함)
```

> ⚠️ **롤백 대비**: `acebase/mydb.acebase/` 데이터 디렉토리는 **삭제하지 말고 보존**한다.
> v1.0.29 로 되돌릴 때 그대로 다시 쓴다 (§7).

---

## 4. data-gateway 실행 (node)

AceBase 가 차지하던 5757 자리에 게이트웨이를 올린다.

```sh
cd data-gateway
npm install
cp .env.example .env
```

게이트웨이는 **자체 `.env`** 를 쓴다 — `data-gateway/.env` 로, §1-2 의
`platform/.env`(docker-compose 용)와는 **다른 파일**이다. `POSTGRES_PASSWORD` 는
`platform/.env` 의 `DB_PASSWORD` 와 **같은 값**으로, OAuth 3종(`CLIENT_ID`/
`CLIENT_SECRET`/`GIT`)은 **AceBase 가 쓰던 값을 그대로** 넣는다:

```sh
GATEWAY_PORT=5757
DB_NAME=mydb

# PostgreSQL — platform/.env 의 DB_PASSWORD 와 동일하게
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=msaez
POSTGRES_USER=msaez
POSTGRES_PASSWORD=<DB_PASSWORD 와 동일>

# JWT 서명 시크릿 — 임의의 긴 랜덤 문자열 (신규)
JWT_SECRET=<JWT_SECRET>

# Gitea OAuth — AceBase 가 쓰던 값 그대로 (재발급 불필요)
PROVIDER=gitea
CLIENT_ID=<기존 Gitea OAuth Client ID>
CLIENT_SECRET=<기존 Gitea OAuth Client Secret>
GIT=<VM_IP>:3000
PROTOCOL=http
```

실행:

```sh
node src/server.js
```

상주 실행(터미널을 닫아도 유지)은 AceBase 와 동일하게 `nohup`·`pm2`·`systemd` 중 택일:

```sh
nohup node src/server.js > gateway.log 2>&1 &
```

확인:

```sh
curl http://localhost:5757/health      # {"status":"ok"} 면 정상
```

`{"status":"db_unavailable"}` 가 나오면 `data-gateway/.env` 의 `POSTGRES_PASSWORD` 가
`platform/.env` 의 `DB_PASSWORD` 와 일치하는지, postgres 컨테이너가 떠 있는지 확인한다.

---

## 5. 나머지 서비스 기동 (msaez · 백엔드 · gitea)

`docker-compose.yml` 은 이미 v1.0.30 용으로 맞춰져 있다 — `msaez`/백엔드 이미지
`:v1.0.30`, 백엔드 DB 가 `POSTGRES_*`, `postgres` 서비스 포함. 환경별 값은 §1-2 의
`.env` 에서 `${VAR}` 로 치환된다. **compose 파일은 손대지 않는다.**

```sh
docker compose up -d
```

- postgres 는 §2 에서 이미 떠 있고, 나머지(msaez·백엔드·gitea)가 기동/재생성된다.
- gitea 는 이미지·설정이 동일하므로 영향 없다.

> `.env` 미설정 시 compose 가 `The "VM_IP" variable is not set` 같은 경고를 내고
> 빈 값으로 치환한다 — §1-2 의 6개 값이 모두 채워졌는지 확인할 것.

<details>
<summary>참고 — v1.0.29 대비 docker-compose.yml 이 바뀐 점</summary>

- `msaez` / 백엔드 2종 이미지 → `:v1.0.30`
- `acebase` 서비스 제거, `postgres` 서비스 추가
- 백엔드 DB 환경변수: `ACEBASE_*` 제거 → `POSTGRES_*`
  (`POSTGRES_HOST: postgres` — compose 내부 서비스명), `STORAGE_TYPE`/`DB_TYPE` → `postgres`
- 환경별 값이 `<자리표시자>` 직접 입력에서 `${VAR}`(+ `.env`) 방식으로 바뀜
- `msaez` 의 `VUE_APP_*` 는 5757(게이트웨이)을 그대로 가리킴 — 동작상 변경 없음
</details>

---

## 6. 동작 확인

```sh
docker compose ps                      # postgres / msaez / backend ×2 / gitea — 모두 Up
curl http://<VM_IP>:5757/health        # 게이트웨이 {"status":"ok"}
```

브라우저에서 `http://<VM_IP>:8080`:

- Gitea 로그인 → 정상 (게이트웨이가 OAuth 처리)
- 모델 생성·공유·협업 편집
- AI 생성기(EventStorming / Project) 실행

DB 반영 확인:

```sh
docker exec msaez-postgres psql -U msaez -d msaez -c "SELECT uid,email FROM users;"
docker exec msaez-postgres psql -U msaez -d msaez -c "SELECT count(*) FROM definitions;"
```

상세 점검 절차(시나리오별 체크리스트)는
[data-gateway/INTEGRATION-RUNBOOK.md](data-gateway/INTEGRATION-RUNBOOK.md) 참조.

---

## 7. 롤백 (v1.0.29 로 복귀)

전환에 문제가 있으면 — **아래 명령은 모두 `platform/` 디렉토리에서 시작한다.**

```sh
# 1. 게이트웨이(node) 중지 — data-gateway 를 띄운 터미널에서 Ctrl+C, 또는:
pkill -f "node src/server.js"

# 2. v1.0.30 컨테이너 중지 (postgres 포함)
docker compose down

# 3. v1.0.29 compose 복원
cp docker-compose.yml.v1029.bak docker-compose.yml
git checkout release/v1.0.29          # 소스도 되돌릴 경우

# 4. AceBase 재기동 — platform/acebase/ 에서, Node 14 로
nvm use 14                            # AceBase 는 Node 14 필요 (게이트웨이용 20 아님)
cd acebase                            # → platform/acebase/  (main.js 가 여기 있음)
node main.js                          # v1.0.29 에서 AceBase 를 띄우던 그대로
cd ..                                 # → platform/ 로 복귀

# 5. 나머지 서비스 기동 (platform/ 에서)
docker compose up -d msaez gitea backend-generators backend-es-generators
```

> `node main.js`(AceBase) 는 **롤백할 때만** 쓰는 명령이다. v1.0.30 정상 흐름에서
> node 로 띄우는 것은 게이트웨이(`data-gateway/` 에서 `node src/server.js`, §4)뿐이다.
>
> AceBase 는 `CLIENT_ID`·`CLIENT_SECRET`·`GIT`·`PROTOCOL`·`DB_*` 등 환경변수가
> 필요하다 — v1.0.29 에서 AceBase 를 띄울 때 쓰던 `export`(또는 실행 스크립트)를
> `node main.js` 앞에 그대로 적용한다.

v1.0.29 이미지(`platform:v1.0.29`, AceBase, 백엔드)는 그대로 남아 있으므로
즉시 복귀 가능하다.

---

## 8. 포트 / 방화벽

| 포트 | 서비스 | 외부 개방 |
| --- | --- | --- |
| 8080 | msaez (프론트) | 필요 |
| 5757 | data-gateway | 필요 |
| 3000 / 222 | gitea | 필요 |
| 2025 | backend-generators | 필요 |
| 5000 | backend-es-generators | 필요 |
| 5432 | postgres | **불필요** — `127.0.0.1` 바인딩, 호스트 내부 전용 |

기존 v1.0.29 와 개방 포트가 동일하다. **방화벽 규칙 변경 없음.**

---

## 9. 문제 해결

| 증상 | 확인 |
| --- | --- |
| 게이트웨이 `{"status":"db_unavailable"}` | `data-gateway/.env` 의 `POSTGRES_PASSWORD` 가 `platform/.env` 의 `DB_PASSWORD` 와 일치하는지, `docker compose ps postgres` |
| 게이트웨이가 5757 바인딩 실패 | AceBase 가 아직 떠 있음 — §3 으로 중지 (`lsof -i :5757`) |
| OAuth 로그인 실패 | `data-gateway/.env` 의 `CLIENT_ID`/`CLIENT_SECRET`/`GIT` 가 Gitea OAuth2 앱과 일치하는지 |
| 백엔드가 DB 접속 실패 | 백엔드는 `POSTGRES_HOST: postgres`(서비스명) 로 접속 — `platform/.env` 의 `DB_PASSWORD` 가 채워졌는지 |
| compose `variable is not set` 경고 | `platform/.env` 의 6개 값 누락 — `cp .env.example .env` 후 채웠는지 (§1-2) |
| 스키마 미적용 | postgres 볼륨이 비어 있을 때만 자동 적용. 재적용은 `docker compose down -v` 후 재기동 (데이터 삭제 주의) |
| 실시간 갱신 안 됨 | 게이트웨이 로그에 `LISTEN msaez_change` 가 보이는지 |
