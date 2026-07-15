// Data API — /data/* REST 라우트 (DB-migration-plan.md §7.4 / §7.5).
// 계약:
//   GET    /data/:db/{path}   -> { value }      (쿼리 startAt/endAt/sort/size 시 범위 list)
//   PUT    /data/:db/{path}   -> { ok }         전체 교체 (set)
//   PATCH  /data/:db/{path}   -> { ok }         부분 병합 (update)
//   POST   /data/:db/{path}   -> { key }        push (정렬키 생성)
//   DELETE /data/:db/{path}   -> { ok }
import express from 'express';
import {
  getData, listData, setData, updateData, deleteData, pushData,
} from './dataStore.js';
import { asyncHandler } from './util.js';
import { afterWrite, afterDelete } from './triggers.js';
import { dataAuthz } from './authz.js';

export const dataRouter = express.Router();

// 인가 미들웨어 — 메서드 핸들러보다 먼저 등록해 모든 /data/:db/* 요청을 통과시킨다.
// (모의해킹 A-005/A-007: 인증·인가 부재 → BOLA/열거 차단)
dataRouter.all('/:db/*', dataAuthz());

// 트리거는 fire-and-forget (AceBase 리스너처럼 eventual). 응답을 막지 않는다.
function fireTrigger(promise) {
  promise.catch((err) => console.error('[trigger]', err.message));
}

// users/{uid} 행의 게이트웨이 전용 필드(권한/승인/신원)는 클라이언트가 data API 로
// 쓰지 못하게 한다. authz 는 "본인 행 쓰기"를 허용하므로, 이 가드가 없으면 누구나
// 자기 users 행에 authorized:'admin' 을 PATCH 해 관리자 권한을 자가 승격할 수 있고,
// 프론트 writeUserData 가 authorized 를 실수로 덮어쓰는 문제도 재발한다.
// 이 필드들은 오직 게이트웨이 내부(upsertOAuthUser/setUserStatus, dataStore 직접호출)만 쓴다.
const PROTECTED_USER_FIELDS = [
  'authorized', 'status', 'status_updated_at', 'settings', 'email', 'uid', 'created',
];
// 반환: { body } (정제된 바디) 또는 { blocked: true } (보호 필드 직접 지정 → 거부)
function guardUsersWrite(path, body) {
  const segs = String(path || '').split('/').filter((s) => s !== '');
  if (segs[0] !== 'users') return { body };
  // 깊은 경로로 보호 필드 직접 타겟팅 (users/{uid}/authorized ...) → 거부
  if (segs.length >= 3 && PROTECTED_USER_FIELDS.includes(segs[2])) {
    return { blocked: true };
  }
  // users/{uid} 객체 병합/교체 → 보호 필드 스트립
  if (segs.length === 2 && body && typeof body === 'object' && !Array.isArray(body)) {
    const clean = { ...body };
    for (const k of PROTECTED_USER_FIELDS) delete clean[k];
    return { body: clean };
  }
  return { body };
}

// GET — 조회. startAt/endAt/sort/size 가 있으면 컬렉션 범위 조회.
dataRouter.get('/:db/*', asyncHandler(async (req, res) => {
  const path = req.params[0];
  const { startAt, endAt, sort, size } = req.query;
  let value;
  if (startAt != null || endAt != null || sort != null || size != null) {
    value = await listData(path, {
      startAt, endAt, sort,
      size: size != null ? parseInt(size, 10) : undefined,
    });
  } else {
    value = await getData(path);
  }
  res.json({ value: value ?? null });
}));

// PUT — 전체 교체
dataRouter.put('/:db/*', asyncHandler(async (req, res) => {
  const g = guardUsersWrite(req.params[0], req.body);
  if (g.blocked) return res.status(403).json({ error: 'protected field' });
  await setData(req.params[0], g.body);
  fireTrigger(afterWrite(req.params[0]));
  res.json({ ok: true });
}));

// PATCH — 부분 병합
dataRouter.patch('/:db/*', asyncHandler(async (req, res) => {
  const g = guardUsersWrite(req.params[0], req.body);
  if (g.blocked) return res.status(403).json({ error: 'protected field' });
  await updateData(req.params[0], g.body);
  fireTrigger(afterWrite(req.params[0]));
  res.json({ ok: true });
}));

// POST — push (정렬키 생성 후 추가)
dataRouter.post('/:db/*', asyncHandler(async (req, res) => {
  const key = await pushData(req.params[0], req.body);
  res.json({ key });
}));

// DELETE — 삭제
dataRouter.delete('/:db/*', asyncHandler(async (req, res) => {
  await deleteData(req.params[0]);
  fireTrigger(afterDelete(req.params[0]));
  res.json({ ok: true });
}));
