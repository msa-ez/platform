// 역방향 라우팅 — (table, 식별 컬럼) → AceBase 경로.
// pathRouter.js 의 routePath 역함수. 변경 알림(트리거 payload)을 경로로 환원한다.

export function rowToPath(table, keys) {
  switch (table) {
    case 'jobs':
      return `jobs/${keys.namespace}/${keys.job_id}`;
    case 'requested_jobs':
      return `requestedJobs/${keys.namespace}/${keys.job_id}`;
    case 'definitions':
      return `definitions/${keys.project_id}`;
    case 'definition_queue':
      return `definitions/${keys.project_id}/queue/${keys.seq_key}`;
    case 'definition_snapshots':
      return `definitions/${keys.project_id}/snapshotLists/${keys.snapshot_key}`;
    case 'user_lists':
      return `userLists/${keys.uid}/${keys.list_type}/${keys.project_id}`;
    case 'users':
      return `users/${keys.uid}`;
    case 'kv_store':
      return keys.path;
    default:
      return null;
  }
}
