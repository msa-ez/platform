// Data Store — 경로 기반 read/write 코어.
// 백엔드 어댑터(postgres_system.py)의 행/JSONB/kv 연산을 Node 로 포팅한 것.
// DB-migration-plan.md §4·§5.
import { query, withTransaction } from './db.js';
import { routePath, TABLE_PK } from './pathRouter.js';
import { generatePushId } from './pushId.js';

// ── JSON 서브경로 헬퍼 ──────────────────────────────────────────────
function isPlainObject(v) {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

function nestedGet(root, subpath) {
  let cur = root;
  for (const k of subpath) {
    if (isPlainObject(cur) && k in cur) cur = cur[k];
    else return null;
  }
  return cur;
}

// container 인지 — 배열도 traversal 가능한 container 로 인정.
// isPlainObject 만 쓰면 array 가 traversal 경로에 있을 때 {} 로 덮어버려
// modelList 같은 배열이 파괴된다 (예: information/eventStorming/modelList/0 쓰기).
function isContainer(v) {
  return v != null && typeof v === 'object';
}

function nestedSet(root, subpath, value) {
  let cur = root;
  for (let i = 0; i < subpath.length - 1; i++) {
    const k = subpath[i];
    if (!isContainer(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  cur[subpath[subpath.length - 1]] = value;
}

function nestedMerge(root, subpath, value) {
  // value 가 plain object 면 leaf 위치에서 키 단위 merge.
  // value 가 scalar (string/number/bool/null) 나 array 면 leaf 자체를 replace.
  // 이전엔 scalar 면 silently 무시해서 base64 썸네일 / versionValue 등이 사라졌다
  // (DB 에 image:{} 만 남는 형태). Firebase update() 시멘틱은 leaf scalar 도 set.
  if (!subpath.length) {
    if (isPlainObject(value)) Object.assign(root, value);
    return;
  }
  let cur = root;
  for (let i = 0; i < subpath.length - 1; i++) {
    const k = subpath[i];
    if (!isContainer(cur[k])) cur[k] = {};
    cur = cur[k];
  }
  const lastKey = subpath[subpath.length - 1];
  if (isPlainObject(value)) {
    if (!isPlainObject(cur[lastKey])) cur[lastKey] = {};
    Object.assign(cur[lastKey], value);
  } else {
    cur[lastKey] = value;
  }
}

// ── PK WHERE 절 빌더 ────────────────────────────────────────────────
function pkWhere(r, startIdx = 1) {
  const cols = Object.keys(r.pk);
  const where = cols.map((c, i) => `${c} = $${startIdx + i}`).join(' AND ');
  return { where, params: cols.map((c) => r.pk[c]) };
}

// ── 정규화 테이블 — 행 단위 ─────────────────────────────────────────
async function rowRead(r) {
  const { where, params } = pkWhere(r);
  const res = await query(`SELECT value FROM ${r.table} WHERE ${where}`, params);
  return res.rows.length ? res.rows[0].value : null;
}

async function rowWrite(r, data, merge) {
  const pkCols = Object.keys(r.pk);
  const insCols = Object.keys(r.insertCols || {});
  const cols = [...pkCols, ...insCols, 'value'];
  const vals = [
    ...pkCols.map((c) => r.pk[c]),
    ...insCols.map((c) => r.insertCols[c]),
    JSON.stringify(data),
  ];
  const ph = cols
    .map((_, i) => (i === cols.length - 1 ? `$${i + 1}::jsonb` : `$${i + 1}`))
    .join(', ');
  const conflict = TABLE_PK[r.table].join(', ');
  const setClause = merge
    ? `value = ${r.table}.value || EXCLUDED.value, updated_at = now()`
    : 'value = EXCLUDED.value, updated_at = now()';
  await query(
    `INSERT INTO ${r.table} (${cols.join(', ')}) VALUES (${ph}) ` +
      `ON CONFLICT (${conflict}) DO UPDATE SET ${setClause}`,
    vals,
  );
  return true;
}

async function rowSubpathWrite(r, data, mode) {
  return withTransaction(async (client) => {
    const { where, params } = pkWhere(r);
    const sel = await client.query(
      `SELECT value FROM ${r.table} WHERE ${where} FOR UPDATE`,
      params,
    );
    const exists = sel.rows.length > 0;
    let value = exists && isPlainObject(sel.rows[0].value) ? sel.rows[0].value : {};
    if (mode === 'merge') nestedMerge(value, r.subpath, data);
    else nestedSet(value, r.subpath, data);

    if (exists) {
      const w = pkWhere(r, 2);
      await client.query(
        `UPDATE ${r.table} SET value = $1::jsonb, updated_at = now() WHERE ${w.where}`,
        [JSON.stringify(value), ...w.params],
      );
    } else {
      const pkCols = Object.keys(r.pk);
      const insCols = Object.keys(r.insertCols || {});
      const cols = [...pkCols, ...insCols, 'value'];
      const vals = [
        ...pkCols.map((c) => r.pk[c]),
        ...insCols.map((c) => r.insertCols[c]),
        JSON.stringify(value),
      ];
      const ph = cols
        .map((_, i) => (i === cols.length - 1 ? `$${i + 1}::jsonb` : `$${i + 1}`))
        .join(', ');
      await client.query(
        `INSERT INTO ${r.table} (${cols.join(', ')}) VALUES (${ph})`,
        vals,
      );
    }
    return true;
  });
}

async function rowDelete(r) {
  const { where, params } = pkWhere(r);
  await query(`DELETE FROM ${r.table} WHERE ${where}`, params);
  return true;
}

async function rowSubpathDelete(r) {
  const w = pkWhere(r, 2);
  await query(
    `UPDATE ${r.table} SET value = value #- $1::text[], updated_at = now() WHERE ${w.where}`,
    [r.subpath, ...w.params],
  );
  return true;
}

async function collectionRead(r, options = {}) {
  const filterCols = Object.keys(r.filters || {});
  const conds = filterCols.map((c, i) => `${c} = $${i + 1}`);
  const params = filterCols.map((c) => r.filters[c]);
  let p = params.length;
  if (options.startAt != null) {
    conds.push(`${r.keyCol} >= $${++p}`);
    params.push(options.startAt);
  }
  if (options.endAt != null) {
    conds.push(`${r.keyCol} <= $${++p}`);
    params.push(options.endAt);
  }
  const where = conds.length ? conds.join(' AND ') : 'TRUE';
  const order = options.sort === 'desc' ? 'DESC' : 'ASC';
  let sql = `SELECT ${r.keyCol} AS k, value FROM ${r.table} WHERE ${where} ` +
    `ORDER BY ${r.keyCol} ${order}`;
  if (options.size) {
    sql += ` LIMIT $${++p}`;
    params.push(options.size);
  }
  const res = await query(sql, params);
  if (!res.rows.length) return null;
  const out = {};
  for (const row of res.rows) out[row.k] = row.value;
  return out;
}

// ── kv_store — catch-all ────────────────────────────────────────────
async function kvWrite(path, data, merge) {
  const setClause = merge
    ? 'value = kv_store.value || EXCLUDED.value, updated_at = now()'
    : 'value = EXCLUDED.value, updated_at = now()';
  await query(
    `INSERT INTO kv_store (path, value) VALUES ($1, $2::jsonb) ` +
      `ON CONFLICT (path) DO UPDATE SET ${setClause}`,
    [path, JSON.stringify(data)],
  );
  return true;
}

async function kvRead(path) {
  const exact = await query('SELECT value FROM kv_store WHERE path = $1', [path]);
  const children = await query(
    'SELECT path, value FROM kv_store WHERE path LIKE $1',
    [path + '/%'],
  );
  if (!children.rows.length) {
    return exact.rows.length ? exact.rows[0].value : null;
  }
  const assembled = {};
  for (const row of children.rows) {
    const rel = row.path.slice(path.length + 1).split('/');
    nestedSet(assembled, rel, row.value);
  }
  if (exact.rows.length && isPlainObject(exact.rows[0].value)) {
    return { ...exact.rows[0].value, ...assembled };
  }
  return assembled;
}

async function kvDelete(path) {
  await query('DELETE FROM kv_store WHERE path = $1 OR path LIKE $2', [
    path,
    path + '/%',
  ]);
  return true;
}

// ── 공개 API ────────────────────────────────────────────────────────
export async function getData(path) {
  const r = routePath(path);
  if (r.kind === 'kv') return kvRead(r.path);
  if (r.kind === 'collection') return collectionRead(r);
  const value = await rowRead(r);
  if (value == null) return null;
  return r.subpath.length ? nestedGet(value, r.subpath) : value;
}

/** 컬렉션 범위 조회 (startAt/endAt/sort/size). 협업 큐 등에서 사용 — §2.6 */
export async function listData(path, options = {}) {
  const r = routePath(path);
  if (r.kind === 'collection') return collectionRead(r, options);
  return getData(path);
}

export async function setData(path, data) {
  const r = routePath(path);
  if (r.kind === 'kv') return kvWrite(r.path, data, false);
  if (r.kind === 'collection') throw new Error(`set 은 컬렉션 경로 미지원: ${path}`);
  if (r.subpath.length) return rowSubpathWrite(r, data, 'set');
  return rowWrite(r, data, false);
}

export async function updateData(path, data) {
  const r = routePath(path);
  if (r.kind === 'kv') return kvWrite(r.path, data, true);
  if (r.kind === 'collection') throw new Error(`update 은 컬렉션 경로 미지원: ${path}`);
  if (r.subpath.length) return rowSubpathWrite(r, data, 'merge');
  return rowWrite(r, data, true);
}

export async function deleteData(path) {
  const r = routePath(path);
  if (r.kind === 'kv') return kvDelete(r.path);
  if (r.kind === 'collection') throw new Error(`delete 은 컬렉션 경로 미지원: ${path}`);
  if (r.subpath.length) return rowSubpathDelete(r);
  return rowDelete(r);
}

/** push — 시간순 정렬키를 생성하고 path/key 에 저장, 생성된 key 반환. */
export async function pushData(path, data) {
  const key = generatePushId();
  await setData(`${path}/${key}`, data);
  return key;
}
