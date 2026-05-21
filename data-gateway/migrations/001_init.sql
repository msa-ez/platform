-- =====================================================================
-- MSAez PostgreSQL 초기 스키마 (v1.0.30)
-- 근거: DB-migration-plan.md §4 (하이브리드 스키마)
--
-- 설계 원칙:
--   - 모든 핫 테이블은 문서 컬럼 `value JSONB`로 통일한다.
--   - 비즈니스 키(path segment)는 별도 컬럼.
--   - 인덱스/큐 처리에 필요한 필드만 추가 컬럼(또는 generated column).
--   => 어댑터의 path router가 한 규칙으로 단순해진다:
--      "행 식별(table + key 컬럼) + 나머지 경로는 value 내부 JSON 경로"
--
--   예) AceBase 경로 jobs/{ns}/{jobId}/state/outputs/logs
--       -> 테이블 jobs, job_id={jobId}, value 내부 경로 {state,outputs,logs}
--
-- 하이브리드: 알려진 핫 prefix -> 전용 테이블, 그 외 -> kv_store catch-all.
-- =====================================================================

-- ── 마이그레이션 추적 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     TEXT PRIMARY KEY,
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── catch-all: 미지/비핫 경로 흡수 ──────────────────────────────────
-- AceBase의 "임의 path에 즉석 write" 동작을 그대로 복제.
-- 게이트웨이/어댑터는 알려진 prefix가 매칭 안 되면 무조건 여기로 폴백.
-- 예: jobStates/{ns}/{jobId}, enrolledUsers/{email}, 기타 신규 컬렉션.
CREATE TABLE IF NOT EXISTS kv_store (
    path        TEXT PRIMARY KEY,            -- AceBase 경로의 "행 식별 prefix"
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by  TEXT
);
CREATE INDEX IF NOT EXISTS idx_kv_store_path_prefix ON kv_store (path text_pattern_ops);

-- ── users (책임 3: Gitea OAuth) ─────────────────────────────────────
-- AceBase __auth__/accounts 대체. 게이트웨이 OAuth signin 흐름(§7.2)이 채운다.
-- email은 조회·중복검사에 쓰이므로 value에서 추출한 generated column.
CREATE TABLE IF NOT EXISTS users (
    uid         TEXT PRIMARY KEY,
    value       JSONB NOT NULL DEFAULT '{}',
    email       TEXT GENERATED ALWAYS AS (value->>'email') STORED,
    username    TEXT GENERATED ALWAYS AS (value->>'username') STORED,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- ── definitions (모델 정의) ─────────────────────────────────────────
-- AceBase: definitions/{projectId}/{information|versionLists|queue|...}
-- author는 목록/권한 조회에 쓰이므로 generated column.
CREATE TABLE IF NOT EXISTS definitions (
    project_id  TEXT PRIMARY KEY,
    value       JSONB NOT NULL DEFAULT '{}',
    author_uid  TEXT GENERATED ALWAYS AS (value #>> '{information,author}') STORED,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_definitions_author ON definitions (author_uid);
CREATE INDEX IF NOT EXISTS idx_definitions_value  ON definitions USING gin (value);
-- 참고(§2.6): value.information.image 는 base64 PNG(수백 KB)일 수 있어 목록 조회의
--             hot path를 무겁게 만든다. 향후 별도 컬럼/테이블 분리 검토(미결 §12).

-- ── user_lists (내 모델/공유 목록) ──────────────────────────────────
-- AceBase: userLists/{uid}/{list_type}/{projectId}
--   list_type 예: 'mine', 'share', 'share_es', 'share_first', 'share_{type}'
CREATE TABLE IF NOT EXISTS user_lists (
    uid         TEXT NOT NULL,
    list_type   TEXT NOT NULL,
    project_id  TEXT NOT NULL,
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (uid, list_type, project_id)
);
CREATE INDEX IF NOT EXISTS idx_user_lists_uid_type ON user_lists (uid, list_type);

-- ── requested_jobs (LLM Job 큐 — 책임 2) ────────────────────────────
-- AceBase: requestedJobs/{namespace}/{jobId}  (백엔드가 폴링하던 대기열)
-- status/locked_* 는 SELECT ... FOR UPDATE SKIP LOCKED 큐 처리용 추가 컬럼(§4.3).
--   status 는 어댑터가 관리: requestedJob write 시 'pending'으로 INSERT.
CREATE TABLE IF NOT EXISTS requested_jobs (
    job_id      TEXT PRIMARY KEY,
    namespace   TEXT NOT NULL,
    value       JSONB NOT NULL DEFAULT '{}',
    status      TEXT NOT NULL DEFAULT 'pending',   -- pending | processing | completed | failed
    locked_by   TEXT,                              -- pod_id
    locked_at   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),-- 큐 정렬 기준 (불변)
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now() -- 마지막 갱신 (어댑터 write 시)
);
CREATE INDEX IF NOT EXISTS idx_requested_jobs_pending
    ON requested_jobs (namespace, created_at) WHERE status = 'pending';

-- ── jobs (Job 진행 상황/결과 — 책임 2) ──────────────────────────────
-- AceBase: jobs/{namespace}/{jobId}  (value 내부: {state:{inputs,outputs,...}})
-- 깊은 경로 부분 갱신은 jsonb_set 으로 (split-write 꼼수 불필요).
CREATE TABLE IF NOT EXISTS jobs (
    job_id      TEXT PRIMARY KEY,
    namespace   TEXT NOT NULL,
    value       JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_jobs_namespace ON jobs (namespace);

-- ── definition_queue (협업 편집 큐 — 책임 6) ────────────────────────
-- AceBase: definitions/{projectId}/queue/{pushId}
-- seq_key 는 시간순 = 사전식 정렬 가능해야 함 (Firebase push-ID 형식).
--   코드가 `key > lastKey`, `ORDER BY key` 로 직접 비교(§2.6). UUID 금지.
CREATE TABLE IF NOT EXISTS definition_queue (
    project_id  TEXT NOT NULL,
    seq_key     TEXT NOT NULL,                  -- Firebase식 push-ID (예: mpaykctj001e3b6iw9jc0k6e)
    value       JSONB NOT NULL,                 -- 편집 연산 (action/editUid/timeStamp/...)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, seq_key)
);
CREATE INDEX IF NOT EXISTS idx_definition_queue_range ON definition_queue (project_id, seq_key);

-- ── definition_snapshots (모델 스냅샷 — 책임 6) ─────────────────────
-- AceBase: definitions/{projectId}/snapshotLists/{pushId}
CREATE TABLE IF NOT EXISTS definition_snapshots (
    project_id      TEXT NOT NULL,
    snapshot_key    TEXT NOT NULL,              -- push-ID 형식
    value           JSONB NOT NULL,             -- {snapshot, snapshotImg, lastSnapshotKey, timeStamp}
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, snapshot_key)
);
CREATE INDEX IF NOT EXISTS idx_definition_snapshots_proj ON definition_snapshots (project_id, snapshot_key);

-- ── 마이그레이션 기록 ───────────────────────────────────────────────
INSERT INTO schema_migrations (version) VALUES ('001_init')
    ON CONFLICT (version) DO NOTHING;
