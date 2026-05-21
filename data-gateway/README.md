# msaez-data-gateway

MSAez의 DB 계층을 AceBase → PostgreSQL로 전환하기 위한 신규 컴포넌트.
전체 설계는 저장소 외부의 `DB-migration-plan.md` 참조.

- 적용 버전: `v1.0.30` (PostgreSQL 전용 빌드, `release/v1.0.30` 브랜치)
- 역할: 브라우저 ↔ PostgreSQL 사이의 게이트웨이 (OAuth + Data API + 실시간 watch + 트리거)
- 포트: 5757 (기존 AceBase 자리 재사용)

## 현재 상태 — Phase 1 진행 중

| 산출물 | 상태 |
| --- | --- |
| `migrations/001_init.sql` — PostgreSQL 스키마 | ✅ |
| `docker-compose.dev.yml` — 로컬 개발 PostgreSQL | ✅ |
| 백엔드 어댑터 (`postgres_system.py` 2종) | 예정 |
| 게이트웨이 본체 (Node/Express) | Phase 2 |

## 로컬 개발 PostgreSQL 기동

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

## 디렉토리 구조 (목표 — 계획서 §7.1)

```
data-gateway/
├── migrations/         # PostgreSQL 스키마/마이그레이션
├── docker-compose.dev.yml
├── src/                # 게이트웨이 본체 (Phase 2)
│   ├── oauth/          # Gitea OAuth (표준 OIDC — 계획서 §7.2)
│   ├── data/           # /data/* REST + path router
│   ├── watch/          # WebSocket/SSE 실시간
│   ├── triggers/       # cross-collection 동기화 (책임 4)
│   └── legacy/         # /api/definitions/:id (책임 5)
└── README.md
```

> 주의: `migrations/`의 자동 적용은 개발용이다. 운영/배포에는 별도 마이그레이션 러너가 필요하다 (Phase 2/6).
