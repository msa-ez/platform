// AceBase 경로 → (테이블, 행 키, JSON 서브경로) 라우팅.
// 백엔드 어댑터(postgres_system.py / postgres_storage_system.py)의 _route 와
// 동일한 규칙을 Node 로 포팅한 것. DB-migration-plan.md §4·§5.2.
//
// 반환 형태:
//   { kind: 'row'|'collection'|'kv',
//     table, pk:{}, filters:{}, insertCols:{}, subpath:[], keyCol, path }

// 테이블별 PK 컬럼
export const TABLE_PK = {
  jobs: ['job_id'],
  requested_jobs: ['job_id'],
  definitions: ['project_id'],
  user_lists: ['uid', 'list_type', 'project_id'],
  definition_queue: ['project_id', 'seq_key'],
  definition_snapshots: ['project_id', 'snapshot_key'],
  users: ['uid'],
};

export function routePath(path) {
  const segs = String(path || '')
    .split('/')
    .map((s) => s.trim())
    .filter((s) => s !== '');

  if (segs.length === 0) {
    return { kind: 'kv', table: 'kv_store', path: '' };
  }

  const head = segs[0];

  // jobs/{ns}/{jobId}[/...subpath]  ·  requestedJobs/{ns}/{jobId}[/...subpath]
  if (head === 'jobs' || head === 'requestedJobs') {
    const table = head === 'jobs' ? 'jobs' : 'requested_jobs';
    if (segs.length === 1) {
      return { kind: 'collection', table, filters: {}, keyCol: 'job_id' };
    }
    const namespace = segs[1];
    if (segs.length === 2) {
      return { kind: 'collection', table, filters: { namespace }, keyCol: 'job_id' };
    }
    return {
      kind: 'row', table,
      pk: { job_id: segs[2] },
      insertCols: { namespace },
      subpath: segs.slice(3),
    };
  }

  // definitions/{pid}/queue/{seqKey}  ·  definitions/{pid}/snapshotLists/{snapKey}
  // definitions/{pid}[/...subpath]
  if (head === 'definitions') {
    if (segs.length === 1) {
      return { kind: 'collection', table: 'definitions', filters: {}, keyCol: 'project_id' };
    }
    const pid = segs[1];
    if (segs.length >= 3 && segs[2] === 'queue') {
      if (segs.length === 3) {
        return {
          kind: 'collection', table: 'definition_queue',
          filters: { project_id: pid }, keyCol: 'seq_key',
        };
      }
      return {
        kind: 'row', table: 'definition_queue',
        pk: { project_id: pid, seq_key: segs[3] },
        subpath: segs.slice(4),
      };
    }
    if (segs.length >= 3 && segs[2] === 'snapshotLists') {
      if (segs.length === 3) {
        return {
          kind: 'collection', table: 'definition_snapshots',
          filters: { project_id: pid }, keyCol: 'snapshot_key',
        };
      }
      return {
        kind: 'row', table: 'definition_snapshots',
        pk: { project_id: pid, snapshot_key: segs[3] },
        subpath: segs.slice(4),
      };
    }
    return {
      kind: 'row', table: 'definitions',
      pk: { project_id: pid },
      subpath: segs.slice(2),
    };
  }

  // userLists/{uid}/{type}/{pid}[/...subpath]
  if (head === 'userLists') {
    if (segs.length === 3) {
      return {
        kind: 'collection', table: 'user_lists',
        filters: { uid: segs[1], list_type: segs[2] }, keyCol: 'project_id',
      };
    }
    if (segs.length >= 4) {
      return {
        kind: 'row', table: 'user_lists',
        pk: { uid: segs[1], list_type: segs[2], project_id: segs[3] },
        subpath: segs.slice(4),
      };
    }
    return { kind: 'kv', table: 'kv_store', path: segs.join('/') };
  }

  // users/{uid}[/...subpath]
  if (head === 'users' && segs.length >= 2) {
    return {
      kind: 'row', table: 'users',
      pk: { uid: segs[1] },
      subpath: segs.slice(2),
    };
  }

  // 그 외 모든 경로 → kv_store catch-all
  return { kind: 'kv', table: 'kv_store', path: segs.join('/') };
}
