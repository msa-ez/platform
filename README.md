# MSAez v1.0.29 → v1.0.30 전환 가이드 (AceBase → PostgreSQL)

이미 동작 중인 **v1.0.29 운영 환경**에서 DB 계층만 AceBase → PostgreSQL 로
교체하는 CLI 절차다. Gitea·OAuth2 앱·Personal Access Token 은 **그대로 재사용**한다.

> - 신규 설치가 아니라 **운영 중인 v1.0.29 전환**만 다룬다.
> - 모든 작업은 기존 v1.0.29 를 받아둔 **그 `platform` 디렉토리 하나**에서 한다.
>   새로 `git clone` 하지 말 것 — 디렉토리가 둘이 되면 `docker compose` 프로젝트가
>   꼬여 컨테이너가 충돌한다.
> - **단일 VM** (DB+AP 한 호스트) 인지 **분리 VM** (DB 와 AP 별도) 인지에 따라
>   §3 에서 사용하는 compose 파일이 다르다. 그 외 절차는 동일.

---

## 0. 무엇이 바뀌나

| 컴포넌트 | v1.0.29 | v1.0.30 |
| --- | --- | --- |
| DB | AceBase — **호스트 node + systemd `acebase`**, 5757 | PostgreSQL — **docker**, 5432 (단일은 loopback, 분리는 사내) |
| DB 게이트웨이 | (없음) | **msaez-data-gateway — docker**, 5757 ← AceBase 자리 |
| msaez (프론트) | docker, 8080 | docker, 8080 (이미지만 `:v1.0.30`) |
| backend-generators | docker, 2025 | docker, 2025 (`:v1.0.30`, DB→postgres) |
| backend-es-generators | docker, 5000 | docker, 5000 (`:v1.0.30`, DB→postgres) |
| gitea | docker, 3000/222 | docker, 3000/222 (**변경 없음**) |

핵심: AceBase(systemd) 를 내리고 그 자리(5757)에 **msaez-data-gateway 컨테이너**를
띄운다. PostgreSQL 컨테이너 신규 추가. 호스트에 Node 설치 등 추가 작업 없음 —
모든 게 docker compose 한 줄로 끝난다.

**그대로 두는 것** — Gitea(컨테이너·데이터·`app.ini`), Gitea OAuth2 앱(Client ID/Secret),
PAT, 개방 포트(5757/8080/3000/2025/5000). 인터넷 아웃바운드도 v1.0.29 리스트 그대로면
충분하다 — **추가 방화벽 신청 0건**.

---

## 1. v1.0.30 소스 받기

기존 `platform` 디렉토리에서 `release/v1.0.30` 으로 전환한다. 운영 중
`docker-compose.yml` 은 값이 채워진 git 추적 파일이라 그대로 두면 `checkout` 이
막히므로, 백업 후 로컬 수정을 폐기한다.

```sh
cd platform                           # 기존 v1.0.29 를 받아둔 그 디렉토리
git status                            # 수정된 파일 확인

cp docker-compose.yml docker-compose.yml.v1029.bak    # 현재 값 백업 (값 이전·롤백용)
git checkout -- docker-compose.yml    # 추적 파일 로컬 수정 폐기 (백업했으니 안전)
# 그 외 수정된 추적 파일이 있으면 동일하게: 백업 후 git checkout -- <파일>

git fetch origin
git checkout release/v1.0.30
git pull
```

---

## 2. 기존 스택 중지

> ⚠️ 중지 전에 **AceBase systemd unit 의 환경변수를 기록**해 둔다 — 게이트웨이가
> 그대로 재사용한다:
> ```sh
> systemctl cat acebase | grep -E 'CLIENT_ID|CLIENT_SECRET|GIT=|PROTOCOL'
> ```

```sh
sudo systemctl stop acebase
sudo systemctl disable acebase        # 부팅 시 자동기동 방지
docker compose down                   # v1.0.29 컨테이너 정리
```

> AceBase 가 systemd 가 아니면 해당 프로세스를 직접 종료한다
> (`lsof -i :5757` 로 5757 이 빈 것 확인).
>
> ⚠️ **롤백 대비** — 다음은 **삭제 금지**: `acebase/` 데이터 디렉토리, `gitea/` 디렉토리,
> v1.0.29 도커 이미지. `docker compose down` 은 컨테이너만 제거하며 이들은 보존된다.

---

## 3. compose 파일 채우기

환경에 따라 사용할 파일이 다르다. **둘 중 하나만 선택**.

### 3-A. 단일 VM (DB+AP 한 호스트)

`docker-compose.yml` 을 사용한다. `<...>` 자리표시자를
`docker-compose.yml.v1029.bak` 에서 옮겨오면 된다 (`<DB_PASSWORD>`, `<JWT_SECRET>` 만
새로 정함):

| 자리표시자 | 위치 | 값 |
| --- | --- | --- |
| `<DB_PASSWORD>` | postgres / data-gateway / backend ×2 | PostgreSQL 비밀번호 — **4곳 동일** |
| `<JWT_SECRET>` | data-gateway | `openssl rand -hex 32` 로 생성. 한 번 정하면 **절대 바꾸지 말 것** (바꾸면 모든 사용자 로그아웃됨) |
| `<GITEA_OAUTH_CLIENT_ID>` `<GITEA_OAUTH_CLIENT_SECRET>` | data-gateway | v1.0.29 의 AceBase unit 에 있던 값 그대로 (§2 기록) |
| `<VM_IP>` | data-gateway / msaez / backend-es-generators | 브라우저가 접근하는 호스트 IP/도메인 |
| `<GITEA_PERSONAL_ACCESS_TOKEN>` | msaez | v1.0.29 의 PAT 그대로 |
| LLM 키 (`OPENAI_API_KEY` 등) | backend ×2 | v1.0.29 의 값 그대로 (P-GPT 는 compose 주석 참조) |

### 3-B. 분리 VM (DB / AP 호스트 분리)

DB 서버와 AP 서버에 각각 다른 파일을 둔다 — **같은 파일을 양쪽에 두는 게 아니다**.

| 서버 | 사용할 파일 | 안에 포함되는 서비스 |
| --- | --- | --- |
| **DB 서버** | `docker-compose.split.db.yml` | postgres + msaez-data-gateway |
| **AP 서버** | `docker-compose.split.ap.yml` | msaez + backend ×2 + gitea |

채워야 할 자리표시자는 단일 VM 과 거의 같지만 두 가지가 다르다:
- AP 서버의 `POSTGRES_HOST` = **DB 서버 IP** (docker DNS 가 아니라)
- AP 서버의 `VUE_APP_DB_HOST` = **DB 서버 IP** (브라우저가 5757 게이트웨이에 접근하는 주소)

자세한 자리표시자는 두 파일의 주석 참조.

---

## 4. 기동

> ⚠️ 단일 VM 은 §4-A, 분리 VM 은 §4-B 만 수행.

### 4-A. 단일 VM

```sh
docker compose pull                   # :v1.0.30 이미지 일괄 확보
docker compose up -d                  # 전체 기동
docker compose ps                     # 모두 Up 확인
```

최초 기동 시 `data-gateway/migrations/` 의 스키마(`001_init`, `002_notify`)가
postgres 에 자동 적용된다.

### 4-B. 분리 VM

**DB 서버**:
```sh
docker compose -f docker-compose.split.db.yml pull
docker compose -f docker-compose.split.db.yml up -d
docker compose -f docker-compose.split.db.yml ps
```

**AP 서버** (DB 서버가 먼저 떠야 한다 — postgres 가 준비돼야 backend 가 붙는다):
```sh
docker compose -f docker-compose.split.ap.yml pull
docker compose -f docker-compose.split.ap.yml up -d
docker compose -f docker-compose.split.ap.yml ps
```

---

## 5. 동작 확인

스키마 적용 확인 (DB 서버, 도메인 테이블 8개 + `schema_migrations` = **총 9개**):

```sh
docker exec msaez-postgres psql -U msaez -d msaez -c "\dt"
```

게이트웨이 health:
```sh
# 단일: 같은 호스트 / 분리: DB 서버
curl http://<DB_HOST_IP>:5757/health        # {"status":"ok"} 면 정상
```

브라우저 `http://<AP_HOST_IP>:8080` — Gitea 로그인 → 모델 생성·협업 → AI 생성기 실행.

> 로그인 시 Gitea 가 `redirect_uri mismatch` 를 내면, Gitea OAuth2 앱의 Redirect URI 에
> `http://<DB_HOST_IP>:5757/oauth2/mydb/signin` 이 있는지 확인 (AceBase 때와 동일 주소).

DB 반영 확인:
```sh
docker exec msaez-postgres psql -U msaez -d msaez -c "SELECT uid,email FROM users;"
```

---

## 6. 롤백 (v1.0.29 로 복귀)

`platform` 디렉토리에서:

```sh
# v1.0.30 컨테이너 중지 (단일/분리 모두 동일 패턴 — 사용한 compose 파일만 다름)
docker compose down                                      # 단일
# docker compose -f docker-compose.split.db.yml down    # 분리 DB
# docker compose -f docker-compose.split.ap.yml down    # 분리 AP

cp docker-compose.yml.v1029.bak docker-compose.yml
git checkout release/v1.0.29                             # 소스도 되돌릴 경우

sudo systemctl enable --now acebase                      # AceBase 재기동 (보존된 acebase/ 사용)
docker compose up -d                                     # msaez·gitea·백엔드 v1.0.29
```

v1.0.29 이미지(`platform:v1.0.29` 등)와 `acebase/`·`gitea/` 데이터가 보존돼 있어
즉시 복귀 가능하다.

---

## 7. 포트 / 방화벽

| 포트 | 서비스 | 외부 개방 |
| --- | --- | --- |
| 8080 | msaez | 필요 (v1.0.29 와 동일) |
| 5757 | data-gateway | 필요 (v1.0.29 와 동일, AceBase 자리) |
| 3000 / 222 | gitea | 필요 (v1.0.29 와 동일) |
| 2025 / 5000 | backend ×2 | 필요 (v1.0.29 와 동일) |
| 5432 | postgres | **단일 VM**: 불필요 (loopback). **분리 VM**: AP→DB 사내 통신만, 인터넷 차단 유지 |

방화벽 신규 신청 **0건**. 인터넷 아웃바운드도 v1.0.29 리스트 그대로면 충분.

---

## 8. 문제 해결

| 증상 | 확인 |
| --- | --- |
| 게이트웨이 `db_unavailable` | `POSTGRES_PASSWORD` 가 data-gateway·postgres 에서 일치하는지, `docker compose ps postgres` |
| 게이트웨이 5757 바인딩 실패 | AceBase 가 안 내려감 — §2 `systemctl stop acebase` (`lsof -i :5757`) |
| 게이트웨이 로그 | `docker logs -f msaez-data-gateway` |
| 브라우저 CORS / 로그인 실패 | 게이트웨이 `/health` ok 인지, compose 의 `CLIENT_ID`/`CLIENT_SECRET`/`GIT` 가 Gitea 앱과 일치하는지 |
| 로그인 후 401 지속 | 브라우저 localStorage 의 옛 토큰 — 로그아웃 후 재로그인 |
| 백엔드 DB 접속 실패 (단일) | backend 의 `POSTGRES_HOST: postgres` 인지 확인 |
| 백엔드 DB 접속 실패 (분리) | backend 의 `POSTGRES_HOST` 가 **DB 서버 IP** 인지 확인, AP→DB 5432 통신 가능한지 (`nc -zv <DB_IP> 5432`) |
| 큐(생성기) 동작 안 함 | `docker compose pull` 로 backend 이미지가 최신 `:v1.0.30` 인지 확인 후 재기동 |
| 스키마 미적용 | postgres 볼륨이 비어 있을 때만 자동 적용. 재적용은 `docker compose down -v` 후 재기동 (데이터 삭제 주의) |

상세 점검 절차는 [data-gateway/INTEGRATION-RUNBOOK.md](data-gateway/INTEGRATION-RUNBOOK.md) 참조.
