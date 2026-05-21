# MSAez 설치형 가이드 (v1.0.30)

Docker Compose 로 MSAez 를 설치한다. v1.0.30 은 **PostgreSQL 기반** 빌드다
(v1.0.29 의 AceBase 를 PostgreSQL + 게이트웨이로 전환).

구성 서비스:

| 서비스 | 포트 | 역할 |
| --- | --- | --- |
| `msaez` | 8080 | 프론트엔드 (Vue) |
| `msaez-data-gateway` | 5757 | DB 게이트웨이 — OAuth + Data API + 실시간 watch |
| `postgres` | (내부) | 데이터 저장소 |
| `gitea` | 3000 / 222 | Git 서버 + OAuth provider |
| `backend-generators` | 2025 | Project Generator |
| `backend-es-generators` | 5000 | Event Storming Generator |

> v1.0.29 와 달리 호스트에 **Node·Python·AceBase 설치가 필요 없다.** 모든 것이 컨테이너로 동작한다.

---

## 1. 사전 요구사항

- **Docker / Docker Compose** — [Docker Desktop](https://www.docker.com/products/docker-desktop/) 또는 Linux 의 docker-ce
- **Git**
- 사용 가능한 포트: `8080`, `5757`, `3000`, `2025`, `5000`, `222`
  (`5432`(PostgreSQL)는 외부 노출하지 않음 — 컨테이너 내부 전용)
- LLM API Key — OpenAI / Google (AI 생성 기능 사용 시)

---

## 2. 소스 다운로드

```sh
git clone -b release/v1.0.30 https://github.com/msa-ez/platform.git
cd platform
```

저장소에 `docker-compose.yml`, `data-gateway/`(게이트웨이 소스 + DB 스키마)가 포함된다.

> **이미지 전제**: `ghcr.io/msa-ez/platform:v1.0.30` 와 backend 이미지(`:v1.0.30`)가
> 게시되어 있어야 한다 (CI 가 `release/v1.0.30` 푸시 시 빌드). `msaez-data-gateway`
> 는 `data-gateway/` 소스에서 직접 빌드되므로 별도 이미지가 필요 없다.

---

## 3. Gitea 설정

### 3-1. Gitea 실행 및 초기 설정

```sh
docker compose up -d gitea
```

브라우저에서 `http://<VM_IP>:3000` 접속 → 초기 설정:
- **Gitea Base URL / DOMAIN**: 브라우저가 접근 가능한 주소 (`http://<VM_IP>:3000/`)
- 관리자 계정 생성
- CORS 활성화 — `./gitea/gitea/conf/app.ini` 에 추가 후 `docker compose restart gitea`:
  ```ini
  [cors]
  ENABLED = true
  ALLOW_DOMAIN = *
  ```

### 3-2. OAuth2 Application 생성

게이트웨이가 Gitea OAuth(OIDC)로 로그인을 처리한다.

Gitea → **Settings → Applications → Manage OAuth2 Applications**:
- **Application Name**: 임의 (예: `msaez`)
- **Redirect URI**: `http://<VM_IP>:5757/oauth2/mydb/signin`
- **Create Application** → 발급된 **Client ID / Client Secret** 기록

### 3-3. Personal Access Token 생성

MSAez 가 Gitea API 를 호출하기 위한 토큰.

Gitea → **Settings → Applications → Generate New Token**:
- Scopes: `repository`, `user`, `organization` 등 필요한 권한
- 발급된 **토큰** 기록

---

## 4. docker-compose.yml 설정

`docker-compose.yml` 의 `<...>` 자리표시자를 채운다:

| 자리표시자 | 설명 |
| --- | --- |
| `<DB_PASSWORD>` | PostgreSQL 비밀번호 (임의의 강한 값) — `postgres`/`msaez-data-gateway`/backend 3곳 모두 동일하게 |
| `<GITEA_OAUTH_CLIENT_ID>` / `<GITEA_OAUTH_CLIENT_SECRET>` | 3-2 에서 발급 |
| `<JWT_SECRET>` | 임의의 긴 랜덤 문자열 (게이트웨이 JWT 서명용) |
| `<VM_IP>` | 브라우저가 접근하는 호스트 IP/도메인 (로컬은 `localhost`) |
| `<GITEA_PERSONAL_ACCESS_TOKEN>` | 3-3 에서 발급 |
| `OPENAI_API_KEY` / `GOOGLE_API_KEY` 등 | LLM 키 (생성기 LLM 설정 — compose 주석 참조) |

> **민감 정보 권장**: `<DB_PASSWORD>`, `<JWT_SECRET>`, API 키 등은 `.env` 파일로 분리하고
> docker-compose 에서 `${VAR}` 로 참조, `.env` 는 `.gitignore` 에 추가.

---

## 5. 실행

```sh
docker compose up -d --build
```

- `--build` — `msaez-data-gateway` 를 `data-gateway/` 소스에서 빌드
- 그 외 서비스는 이미지 pull
- `postgres` 최초 기동 시 `data-gateway/migrations/*.sql`(스키마)이 자동 적용된다

```sh
docker compose ps          # 상태 확인
docker compose logs -f msaez-data-gateway
```

---

## 6. 동작 확인

- 프론트엔드: `http://<VM_IP>:8080`
- 게이트웨이 헬스체크: `curl http://<VM_IP>:5757/health` → `{"status":"ok"}`
- Gitea: `http://<VM_IP>:3000`
- Gitea 로그인 → 모델 생성/공유 정상 동작 확인

상세 통합 점검 절차는 [data-gateway/INTEGRATION-RUNBOOK.md](data-gateway/INTEGRATION-RUNBOOK.md) 참조.

---

## 7. 문제 해결

| 증상 | 확인 |
| --- | --- |
| 게이트웨이 `db_unavailable` | `<DB_PASSWORD>` 가 3곳에서 일치하는지, `postgres` 컨테이너 상태 |
| OAuth 로그인 실패 | Redirect URI 가 `http://<VM_IP>:5757/oauth2/mydb/signin` 와 정확히 일치하는지, `GIT`/`CLIENT_ID`/`CLIENT_SECRET` |
| 스키마 미적용 | `postgres` 볼륨이 비어 있을 때만 자동 적용됨. 재적용하려면 `docker compose down -v` 후 재기동 (데이터 삭제 주의) |
| 실시간 갱신 안 됨 | 게이트웨이 로그의 `[notify] LISTEN msaez_change 시작` 확인 |

---

## 8. 데이터 백업

```sh
docker exec msaez-postgres pg_dump -U msaez msaez > backup.sql   # 백업
# 복구: docker exec -i msaez-postgres psql -U msaez msaez < backup.sql
```

Gitea 데이터는 `./gitea` 디렉토리에 보존된다.
