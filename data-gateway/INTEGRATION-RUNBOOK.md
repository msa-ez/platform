# Phase 4 통합 테스트 런북 (v1.0.30)

DB 전환(AceBase → PostgreSQL) 풀스택 end-to-end 검증 절차.
설계·진척은 저장소 외부 `DB-migration-plan.md` 참조.

## 자동 검증된 것 (스모크 + 통합 테스트, 누적 69건)

이미 통과 — 재현하려면 각 명령 실행:

| 영역 | 테스트 | 명령 |
| --- | --- | --- |
| 백엔드 어댑터 (eventstorming) | 14/14 | `cd msaez-automate-eventstorming-generator && .venv/bin/python tests/test_postgres_system_smoke.py` |
| 백엔드 어댑터 (project-generator) | 15/15 | `cd 'msaez-automate-project-generator ' && venv/bin/python scripts/test_postgres_storage_smoke.py` |
| 게이트웨이 OAuth | 11/11 | `data-gateway/ $ node --env-file=.env test/test-oauth.mjs` |
| 게이트웨이 watch | 6/6 | `node --env-file=.env test/test-watch.mjs` |
| 게이트웨이 트리거+레거시 | 7/7 | `node --env-file=.env test/test-triggers.mjs` |
| 프론트 게이트웨이 클라이언트 | 9/9 | `node test/test-gateway-client.mjs` |
| **계층 관통 통합** | 7/7 | `node test/test-integration.mjs` |

> 전제: `data-gateway/ $ docker compose -f docker-compose.dev.yml up -d` (PostgreSQL) + `node --env-file=.env src/server.js` (게이트웨이).

## 수동 검증 필요 (이 런북의 대상)

LLM API 키 · 실제 Gitea · 브라우저가 필요해 자동화하지 못한 부분.

---

## 1. 풀스택 기동

### 1-1. PostgreSQL + 게이트웨이

```sh
cd platform/data-gateway
docker compose -f docker-compose.dev.yml up -d        # PostgreSQL (스키마 자동 적용)
```

### 1-2. Gitea 기동 + OAuth2 앱 등록

```sh
cd platform
docker compose up -d gitea
```

1. 브라우저에서 `http://localhost:3000` → 초기 설정 (기존 가이드 `DB 전환 계획.txt` "Setting Gitea" 참조)
2. 관리자 계정 생성
3. **OAuth2 Application 생성** — Settings → Applications → Manage OAuth2 Applications:
   - Redirect URI: `http://localhost:5757/oauth2/mydb/signin`
   - 생성된 **Client ID / Client Secret** 기록
4. Gitea가 OIDC discovery를 제공하는지 확인:
   `curl http://localhost:3000/.well-known/openid-configuration` → JSON 이 나와야 함

### 1-3. 게이트웨이 OAuth 설정

`data-gateway/.env` 에 추가 후 게이트웨이 재기동:

```
PROVIDER=gitea
CLIENT_ID=<위에서 받은 Client ID>
CLIENT_SECRET=<위에서 받은 Client Secret>
GIT=localhost:3000
PROTOCOL=http
JWT_SECRET=<임의의 긴 시크릿>
```

```sh
node --env-file=.env src/server.js
```

### 1-4. 백엔드 generators

각 generator 의 `.env`:

```
DB_TYPE=postgres            # eventstorming-generator
STORAGE_TYPE=postgres       # project-generator
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_DB=msaez
POSTGRES_USER=msaez
POSTGRES_PASSWORD=msaez_dev
OPENAI_API_KEY=<실제 키>     # LLM 워크플로우 실행에 필수
GOOGLE_API_KEY=<실제 키>     # eventstorming-generator (Gemini 사용 시)
```

```sh
# eventstorming-generator
pip install -e .  &&  ./start.sh
# project-generator
pip install -e .  &&  ./start.sh
```

### 1-5. 프론트엔드

`platform/` 의 `docker-compose.yml` `msaez` 서비스 환경변수 — `VUE_APP_DB_HOST/PORT` 는 게이트웨이(5757)를 가리키게 두고 기동. 또는 dev 빌드.

---

## 2. 시나리오 체크리스트

각 항목 — 동작 + 확인 포인트(✔). 실패 시 계획서 §9 위험표 참조.

### 2-1. Gitea OAuth 로그인
- [ ] 로그인 버튼 → Gitea 로그인 화면으로 이동
- [ ] 승인 후 앱으로 복귀, 로그인 상태
- ✔ localStorage 에 `accessToken`(JWT), `gitToken`(raw Gitea 토큰), `uid` 저장됨
- ✔ `users` 테이블에 행 생성 (`docker exec msaez-postgres-dev psql -U msaez -d msaez -c "SELECT uid,email FROM users;"`)
- ✔ `kv_store` 에 `enrolledUsers/{email}` 생성 (트리거 책임 4-(2))

### 2-2. 모델 생성 → 내 목록 반영
- [ ] 새 EventStorming/도메인 모델 생성
- ✔ `definitions` 테이블에 행 생성
- ✔ 잠시 후 `user_lists` 에 `(uid, 'mine', project_id)` 행 생성 (트리거 책임 4-(1))
- ✔ 목록 화면에 모델이 보임

### 2-3. 협업 편집 (브라우저 2개)
- [ ] 같은 모델을 두 브라우저에서 열고 한쪽에서 요소 추가/이동
- ✔ 다른 브라우저에 실시간 반영 (WebSocket watch)
- ✔ `definition_queue` 에 편집 연산 행 누적, `seq_key` 가 시간순 정렬
- ✔ N개 누적 시 `definition_snapshots` 에 스냅샷 생성

### 2-4. EventStorming Generator 워크플로우 (LLM)
- [ ] 요구사항 입력 → ES 생성 실행
- ✔ `requested_jobs` 에 행(status='pending') → 백엔드가 `SKIP LOCKED` 로 클레임(status='processing')
- ✔ `jobs/{ns}/{jobId}/state/outputs` 가 점진적으로 채워지고 화면에 실시간 표시
- ✔ **대량 출력 시 ping out 없음** (AceBase 병목 해소 — 계획서 §1.1)
- ✔ 완료 시 `state/outputs/isCompleted=true`

### 2-5. Project Generator 워크플로우 (LLM)
- [ ] 프로젝트 생성 실행
- ✔ project-generator 가 `postgres_storage_system` 으로 동작, 결과 코드 생성
- ✔ `transaction` 기반 작업 조율 정상

### 2-6. 모델 공유 → 공유 목록
- [ ] 모델 공유(권한 부여)
- ✔ `user_lists` 에 대상 uid 의 `share` 행 생성 (트리거 책임 4-(1))
- ✔ 권한 회수 시 `share` 행 삭제

### 2-7. 모델 삭제 → cascade
- [ ] 내 목록에서 모델 삭제
- ✔ `definitions` 행 삭제, 관련 `user_lists`/public 목록 정리 (트리거 책임 4-(3))

### 2-8. 레거시 BPM 엔드포인트
- [ ] `curl http://localhost:5757/api/definitions/<projectId>` → BPM ProcessDefinition JSON

### 2-9. 재시작/영속성
- [ ] `docker compose restart` 후 데이터 보존, 재로그인 정상
- [ ] 동시 사용자 부하 — 큐 처리 latency 체감 확인

---

## 3. 동시성·부하 (선택)

- LLM Job 동시 다수 실행 시 `requested_jobs` 의 `SKIP LOCKED` 로 중복 처리 없음
  (자동 검증됨 — Phase 1 스모크에서 5스레드 동시성 확인. 실부하는 여기서 재확인)
- 100KB 이상 단일 write — AceBase 에서 ping out 나던 케이스가 PostgreSQL 에서 무사 통과

## 4. 롤백 (문제 시)

계획서 §10 — `msaez` 이미지를 `v1.0.29`(AceBase 버전)로, 게이트웨이/postgres 중지, 호스트 AceBase 재기동. 전환 시점 `acebase/mydb.acebase/` 백업 보존이 전제.
