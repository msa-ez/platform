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
  if (sub.watchType === 'value') {
    // P 가 W 본인 / 후손 / 조상이면 영향 받음
    return P === W || P.startsWith(`${W}/`) || W.startsWith(`${P}/`);
  }
  if (sub.watchType === 'child_added') {
    if (op !== 'INSERT') return false;
    if (parentOf(P) !== W) return false;
    if (sub.startAt && lastSeg(P) < sub.startAt) return false;
    return true;
  }
  if (sub.watchType === 'child_changed') {
    return op === 'UPDATE' && parentOf(P) === W;
  }
  return false;
}

function safeSend(ws, obj) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

/** 구독 직후 현재 상태를 초기 전송 (AceBase on() 의미 — 기존 데이터부터 콜백). */
async function sendInitial(ws, sub) {
  if (sub.watchType === 'value') {
    const value = await getData(sub.path);
    safeSend(ws, { id: sub.id, watchType: 'value', path: sub.path, value, initial: true });
  } else if (sub.watchType === 'child_added') {
    const children = await listData(sub.path, { startAt: sub.startAt, sort: 'asc' });
    if (children && typeof children === 'object') {
      for (const [key, value] of Object.entries(children)) {
        safeSend(ws, {
          id: sub.id, watchType: 'child_added', path: sub.path, key, value, initial: true,
        });
      }
    }
  }
  // child_changed 는 초기 덤프 없음 (변경에만 반응)
}

/** 변경 발생 시 해당 구독자에게 전달. */
async function deliver(ws, sub, P) {
  try {
    if (sub.watchType === 'value') {
      const value = await getData(sub.path);
      safeSend(ws, { id: sub.id, watchType: 'value', path: sub.path, value });
    } else {
      const value = await getData(P);
      safeSend(ws, {
        id: sub.id, watchType: sub.watchType, path: sub.path, key: lastSeg(P), value,
      });
    }
  } catch (e) {
    console.error('[ws] deliver 실패:', e.message);
  }
}

export function attachWatchServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/watch' });

  wss.on('connection', (ws) => {
    ws.subs = new Map(); // id -> { id, path, watchType, startAt }

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
        };
        ws.subs.set(msg.id, sub);
        await sendInitial(ws, sub);
      } else if (msg.action === 'unwatch' && msg.id) {
        ws.subs.delete(msg.id);
      }
    });

    ws.on('close', () => ws.subs.clear());
    ws.on('error', () => ws.subs.clear());
  });

  // 변경 알림 → 구독 매칭 → 푸시
  changeBus.on('change', (payload) => {
    const P = rowToPath(payload.table, payload.keys);
    if (!P) return;
    for (const ws of wss.clients) {
      if (ws.readyState !== ws.OPEN || !ws.subs) continue;
      for (const sub of ws.subs.values()) {
        if (matches(sub, P, payload.op)) {
          deliver(ws, sub, P);
        }
      }
    }
  });

  console.log('[ws] watch 서버 attach 완료 (path=/watch)');
  return wss;
}
