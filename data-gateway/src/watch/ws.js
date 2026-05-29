// 실시간 watch — WebSocket 서버 (DB-migration-plan.md §7.4 / §7.5).
//
// 클라이언트 → 서버:
//   { action:'watch',   id, path, watchType, startAt? }
//       watchType: 'value' | 'child_added' | 'child_changed'
//   { action:'unwatch', id }
// 서버 → 클라이언트:
//   { id, watchType, path, key?, value, initial? }
//
// 변경 감지: PostgreSQL 트리거 → LISTEN/NOTIFY → changeBus → 구독 매칭 → 푸시.
//
// 주의: jobs/definitions 등 정규화 JSONB 테이블의 트리거는 "행 단위" 로 발화한다.
//   즉 jobs/{ns}/{jobId} 행의 깊은 JSON 자식(state/outputs/esValue/elements/* 등)이
//   바뀌어도 알림 경로 P 는 행 경로(jobs/{ns}/{jobId})뿐이다. 따라서 깊은 자식
//   컬렉션을 보는 child_added/child_changed 구독은 "조상 행 변경" 도 자기 변경으로
//   간주하고, 그 때마다 자식 목록을 재조회해 추가/변경분을 가려 전달한다.
//   (이 처리가 없으면 ES 생성 Job 의 incremental 출력이 브라우저에 전혀 안 옴)
import { WebSocketServer } from 'ws';
import { changeBus } from './notify.js';
import { rowToPath } from './pathReverse.js';
import { getData, listData } from '../dataStore.js';

function parentOf(p) {
  const i = p.lastIndexOf('/');
  return i < 0 ? '' : p.slice(0, i);
}
function lastSeg(p) {
  const i = p.lastIndexOf('/');
  return i < 0 ? p : p.slice(i + 1);
}

/** 구독(sub)이 변경 경로 P / 연산 op 에 매칭되는가. */
function matches(sub, P, op) {
  const W = sub.path;
  // P 가 W 본인 / 후손 / 조상이면 W 가 속한 데이터가 영향을 받음
  const related = P === W || P.startsWith(`${W}/`) || W.startsWith(`${P}/`);
  if (sub.watchType === 'value') return related;
  if (sub.watchType === 'child_added' || sub.watchType === 'child_changed') {
    // (1) P 가 W 의 직속 자식 — 경로 단위 테이블(kv_store 등)의 정상 케이스
    if (parentOf(P) === W) return true;
    // (2) P 가 W 본인 또는 조상 — 행 단위 JSONB 테이블에서 행이 통째로 바뀐 경우.
    //     deliver 에서 자식 목록을 재조회해 added/changed 를 가려낸다.
    if (P === W || W.startsWith(`${P}/`)) return true;
    return false;
  }
  return false;
}

function safeSend(ws, obj) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

// 같은 구독에 대해 짧은 시간에 여러 변경이 쌓일 때, 마지막 변경 시점부터
// COALESCE_MS 만큼 기다렸다가 한 번만 deliver 한다. 윈도우 안에서 새 변경이
// 오면 타이머를 재설정 — debounce trailing-edge 패턴.
// 효과:
//  - jobs row 에 LangGraph 가 1초에 N 회 자식 필드를 갱신할 때, 클라이언트는
//    한 번의 deliver 만 받음 (value watcher 는 항상 최신 row 를 fetch 하므로
//    중간값을 잃지 않음).
//  - child_added/child_changed 는 deliver 가 listData 로 자식 목록을 다시 읽고
//    sub._seen 과 대조해 신규/변경분만 가려 보내므로, 합쳐도 누락 없음.
//  - 클라이언트 측 reactive watcher 가 받는 알림 수가 줄어 echo loop 의 진폭이 작아짐.
const COALESCE_MS = 150;
function scheduleDeliver(ws, sub, P) {
  if (!sub._pendingPaths) sub._pendingPaths = new Set();
  sub._pendingPaths.add(P);
  if (sub._coalesceTimer) clearTimeout(sub._coalesceTimer);
  sub._coalesceTimer = setTimeout(async () => {
    sub._coalesceTimer = null;
    const paths = Array.from(sub._pendingPaths);
    sub._pendingPaths.clear();
    // value watcher 는 path 가 무엇이든 sub.path 의 최신 상태 하나만 보내면 충분.
    // child_added/child_changed 는 각 변경 path 별로 자식 목록을 재조회해야 정확하다.
    if (sub.watchType === 'value') {
      await deliver(ws, sub, sub.path);
    } else {
      for (const p of paths) await deliver(ws, sub, p);
    }
  }, COALESCE_MS);
}

/**
 * child_added / child_changed 한 건을 sub._seen 과 대조해 신규/변경일 때만 전송.
 *  - child_added : key 가 처음 등장할 때만 1회 전송 (sub._seen 에는 key 만 기록)
 *  - child_changed: 기존 key 의 값이 바뀔 때만 전송 (sub._seen 에는 값 직렬화 기록)
 */
function sendChild(ws, sub, key, value, initial) {
  if (sub.watchType === 'child_added') {
    if (sub._seen.has(key)) return;
    sub._seen.set(key, true);
    if (sub.startAt != null && String(key) < String(sub.startAt)) return;
    safeSend(ws, { id: sub.id, watchType: 'child_added', path: sub.path, key, value, initial });
  } else { // child_changed
    const ser = JSON.stringify(value === undefined ? null : value);
    const had = sub._seen.has(key);
    if (sub._seen.get(key) === ser) return;
    sub._seen.set(key, ser);
    if (!had) return; // 신규 자식은 child_added 담당 — child_changed 는 보내지 않음
    safeSend(ws, { id: sub.id, watchType: 'child_changed', path: sub.path, key, value });
  }
}

/** 구독 직후 현재 상태를 초기 전송 (AceBase on() 의미 — 기존 데이터부터 콜백). */
async function sendInitial(ws, sub) {
  if (sub.watchType === 'value') {
    const value = await getData(sub.path);
    safeSend(ws, { id: sub.id, watchType: 'value', path: sub.path, value, initial: true });
    return;
  }
  // child_added: 기존 자식 전부 덤프 / child_changed: baseline 만 기록(덤프 없음)
  const children = await listData(sub.path, { startAt: sub.startAt, sort: 'asc' });
  if (children && typeof children === 'object') {
    for (const [key, value] of Object.entries(children)) {
      sendChild(ws, sub, key, value, true);
    }
  }
}

/** 변경 발생 시 해당 구독자에게 전달. */
async function deliver(ws, sub, P) {
  try {
    if (sub.watchType === 'value') {
      const value = await getData(sub.path);
      safeSend(ws, { id: sub.id, watchType: 'value', path: sub.path, value });
      return;
    }
    // child_added / child_changed
    if (parentOf(P) === sub.path && P !== sub.path) {
      // 직속 자식 한 건 변경 (경로 단위 테이블 — kv_store 등)
      const value = await getData(P);
      sendChild(ws, sub, lastSeg(P), value, false);
      return;
    }
    // 조상 행이 통째로 바뀜 — 자식 목록을 재조회해 added/changed 를 가려 전달
    const children = await listData(sub.path);
    if (children && typeof children === 'object') {
      for (const [key, value] of Object.entries(children)) {
        sendChild(ws, sub, key, value, false);
      }
    }
  } catch (e) {
    console.error('[ws] deliver 실패:', e.message);
  }
}

export function attachWatchServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/watch' });

  wss.on('connection', (ws) => {
    ws.subs = new Map(); // id -> { id, path, watchType, startAt, _seen }

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (msg.action === 'watch' && msg.id && msg.path) {
        const sub = {
          id: msg.id,
          path: String(msg.path).replace(/^\/+|\/+$/g, ''),
          watchType: msg.watchType || 'value',
          startAt: msg.startAt,
          // child_added/child_changed 의 added/changed 판별용 — key→(true|값직렬화)
          _seen: new Map(),
        };
        ws.subs.set(msg.id, sub);
        await sendInitial(ws, sub);
      } else if (msg.action === 'unwatch' && msg.id) {
        const old = ws.subs.get(msg.id);
        if (old && old._coalesceTimer) clearTimeout(old._coalesceTimer);
        ws.subs.delete(msg.id);
      }
    });

    const cleanup = () => {
      for (const sub of ws.subs.values()) {
        if (sub._coalesceTimer) clearTimeout(sub._coalesceTimer);
      }
      ws.subs.clear();
    };
    ws.on('close', cleanup);
    ws.on('error', cleanup);
  });

  // 변경 알림 → 구독 매칭 → 푸시 (구독별 trailing-edge debounce)
  changeBus.on('change', (payload) => {
    const P = rowToPath(payload.table, payload.keys);
    if (!P) return;
    for (const ws of wss.clients) {
      if (ws.readyState !== ws.OPEN || !ws.subs) continue;
      for (const sub of ws.subs.values()) {
        if (matches(sub, P, payload.op)) {
          scheduleDeliver(ws, sub, P);
        }
      }
    }
  });

  console.log('[ws] watch 서버 attach 완료 (path=/watch)');
  return wss;
}
