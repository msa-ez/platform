# msaez-data-gateway

MSAez의 DB 계층(AceBase → PostgreSQL) 전환을 담당하는 컴포넌트.
브라우저 ↔ PostgreSQL 사이의 게이트웨이 — OAuth + Data API + 실시간 watch + 트리거.
전체 설계는 저장소 외부의 `DB-migration-plan.md` 참조.

- 적용 버전: `v1.0.30` (`release/v1.0.30` 브랜치)
- 포트: 5757 (기존 AceBase 자리 재사용)
- 런타임: Node 20 이상

## 운영 환경에서의 실행

설치형 MSAez 를 v1.0.29 → v1.0.30 으로 전환하는 절차는 상위 [../README.md](../README.md) 참조.
게이트웨이는 호스트에서 node 로 직접 실행한다:

```sh
cd data-gateway
npm install
cp .env.example .env                      # POSTGRES_* / Gitea OAuth 채우기
node --env-file=.env src/server.js        # 포트 5757 (--env-file 필수: .env 로드)
```

## 로컬 개발 PostgreSQL 기동

상위 docker-compose.yml 과 별개로, 게이트웨이만 단독 개발할 때 쓰는 PostgreSQL:

```sh
cd platform/data-gateway
docker compose -f docker-compose.dev.yml up -d
```

- 접속: `postgresql://msaez:msaez_dev@localhost:5432/msaez`
- `migrations/*.sql`은 **최초 기동 시 1회만** 자동 적용된다.
  스키마를 다시 적용하려면 `down -v`로 볼륨을 삭제 후 재기동.

```sh
# 스키마 확인
docker exec msaez-postgres-dev psql -U msaez -d msaez -c "\dt"
```

## 디렉토리 구조

```
data-gateway/
├── migrations/         # PostgreSQL 스키마 (001_init, 002_notify)
├── docker-compose.dev.yml
├── Dockerfile          # (선택) 게이트웨이를 컨테이너로 실행할 경우
├── src/
│   ├── oauth/          # Gitea OAuth (표준 OIDC)
│   ├── watch/          # WebSocket + PostgreSQL LISTEN/NOTIFY 실시간
│   ├── dataApi.js      # /data/* REST + path router
│   ├── triggers.js     # cross-collection 동기화
│   └── legacy.js       # /api/definitions/:id (BPM 레거시)
├── test/               # 스모크 + 통합 테스트
├── INTEGRATION-RUNBOOK.md
└── README.md
```

> `migrations/`의 자동 적용은 postgres 컨테이너 최초 기동 시 1회뿐이다.
