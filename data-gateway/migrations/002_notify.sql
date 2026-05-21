-- =====================================================================
-- 변경 알림 트리거 (v1.0.30) — DB-migration-plan.md §7.4
--
-- 데이터 테이블의 INSERT/UPDATE/DELETE 마다 pg_notify('msaez_change', ...) 발행.
-- 게이트웨이가 LISTEN 하여 WebSocket 구독자에게 실시간 푸시한다.
--
-- DB 트리거로 거는 이유: 백엔드 어댑터(postgres_system.py)가 게이트웨이를
-- 거치지 않고 PostgreSQL 에 직접 write 하므로, 애플리케이션 레벨 알림으로는
-- 백엔드 write(=Job 진행상황)를 놓친다. 트리거는 누가 write 하든 발행된다.
-- =====================================================================

CREATE OR REPLACE FUNCTION msaez_notify_change() RETURNS trigger AS $$
DECLARE
  keys jsonb;
BEGIN
  -- value(대형 payload)는 제외하고 식별 컬럼만 — pg_notify 8000byte 한도 대응
  IF TG_OP = 'DELETE' THEN
    keys := to_jsonb(OLD) - 'value';
  ELSE
    keys := to_jsonb(NEW) - 'value';
  END IF;
  PERFORM pg_notify('msaez_change', left(jsonb_build_object(
    'table', TG_TABLE_NAME,
    'op', TG_OP,
    'keys', keys
  )::text, 7900));
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 데이터 테이블 전체에 트리거 부착
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'jobs', 'requested_jobs', 'definitions', 'user_lists',
    'definition_queue', 'definition_snapshots', 'users', 'kv_store'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_notify_%1$s ON %1$s', t);
    EXECUTE format(
      'CREATE TRIGGER trg_notify_%1$s AFTER INSERT OR UPDATE OR DELETE ON %1$s ' ||
      'FOR EACH ROW EXECUTE FUNCTION msaez_notify_change()', t);
  END LOOP;
END $$;

INSERT INTO schema_migrations (version) VALUES ('002_notify')
  ON CONFLICT (version) DO NOTHING;
