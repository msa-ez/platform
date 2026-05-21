// 실시간 watch 스모크 테스트 (Phase 2 Step 4).
// 게이트웨이 + 로컬 PostgreSQL 이 실행 중이어야 한다.
// 실행: node --env-file=.env test/test-watch.mjs
import { WebSocket } from 'ws';

const GW = 'http://localhost:5757';
const WS_URL = 'ws://localhost:5757/watch';
let PASS = 0;
let FAIL = 0;

function check(name, cond) {
  if (cond) { PASS++; console.log(`  PASS  ${name}`); }
  else { FAIL++; console.log(`  FAIL  ${name}`); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function put(path, body) {
  await fetch(`${GW}/data/mydb/${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
async function post(path, body) {
  const r = await fetch(`${GW}/data/mydb/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await r.json()).key;
}
async function del(path) {
  await fetch(`${GW}/data/mydb/${path}`, { method: 'DELETE' });
}

function openWs() {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(WS_URL);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

/** id 의 메시지를 timeout 안에 1건 기다림 (initial 제외 옵션). */
function waitMsg(ws, id, { skipInitial = false, timeout = 3000 } = {}) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => { ws.off('message', handler); resolve(null); }, timeout);
    function handler(raw) {
      const m = JSON.parse(raw.toString());
      if (m.id !== id) return;
      if (skipInitial && m.initial) return;
      clearTimeout(timer);
      ws.off('message', handler);
      resolve(m);
    }
    ws.on('message', handler);
  });
}

async function main() {
  const NS = 'watchns';
  // 정리
  await del(`jobs/${NS}/wj1`);
  await del(`jobs/${NS}/wj2`);
  await del(`definitions/wp1/queue/seed`);

  const ws = await openWs();

  // 1. value watch — 초기 덤프
  ws.send(JSON.stringify({ action: 'watch', id: 'w1', path: `jobs/${NS}/wj1`, watchType: 'value' }));
  const initial = await waitMsg(ws, 'w1');
  check('value watch 초기 메시지 수신', initial && initial.initial === true && initial.value === null);

  // 2. value watch — write 시 푸시
  await put(`jobs/${NS}/wj1`, { state: { n: 1 } });
  const upd = await waitMsg(ws, 'w1', { skipInitial: true });
  check('value watch — write 푸시 수신',
    upd && upd.value && upd.value.state && upd.value.state.n === 1);

  // 3. value watch — 깊은 서브경로 write 도 조상 watcher 에 푸시
  await put(`jobs/${NS}/wj1/state/outputs/done`, true);
  const deep = await waitMsg(ws, 'w1', { skipInitial: true });
  check('value watch — 서브경로 write 푸시',
    deep && deep.value && deep.value.state.outputs && deep.value.state.outputs.done === true);

  // 4. child_added watch — 컬렉션에 push 시
  ws.send(JSON.stringify({ action: 'watch', id: 'w2', path: 'definitions/wp1/queue', watchType: 'child_added' }));
  await sleep(200); // 구독 정착
  const key = await post('definitions/wp1/queue', { action: 'edit1' });
  const added = await waitMsg(ws, 'w2', { skipInitial: true });
  check('child_added watch — push 시 수신',
    added && added.key === key && added.value && added.value.action === 'edit1');

  // 5. value watch — 컬렉션(조상) watcher 가 새 자식 row 에 반응
  ws.send(JSON.stringify({ action: 'watch', id: 'w3', path: `jobs/${NS}`, watchType: 'value' }));
  await waitMsg(ws, 'w3'); // 초기
  await put(`jobs/${NS}/wj2`, { state: { n: 2 } });
  const collUpd = await waitMsg(ws, 'w3', { skipInitial: true });
  check('value watch — 컬렉션 조상 watcher 반응',
    collUpd && collUpd.value && collUpd.value.wj2);

  // 6. unwatch — 해제 후 더 이상 안 받음
  ws.send(JSON.stringify({ action: 'unwatch', id: 'w1' }));
  await sleep(200);
  await put(`jobs/${NS}/wj1`, { state: { n: 99 } });
  const afterUnwatch = await waitMsg(ws, 'w1', { skipInitial: true, timeout: 1500 });
  check('unwatch 후 푸시 중단', afterUnwatch === null);

  ws.close();
  await del(`jobs/${NS}/wj1`);
  await del(`jobs/${NS}/wj2`);
  await del(`definitions/wp1/queue/${key}`);

  console.log(`\n=== ${PASS} passed, ${FAIL} failed ===`);
  process.exit(FAIL ? 1 : 0);
}

main().catch((err) => {
  console.error('테스트 실행 오류:', err);
  process.exit(1);
});
