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
  await setData(req.params[0], req.body);
  fireTrigger(afterWrite(req.params[0]));
  res.json({ ok: true });
}));

// PATCH — 부분 병합
dataRouter.patch('/:db/*', asyncHandler(async (req, res) => {
  await updateData(req.params[0], req.body);
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
