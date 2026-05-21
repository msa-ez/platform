// PostgresGatewayClient 스모크 테스트 (Phase 3 — 프론트 어댑터 코어).
// 게이트웨이 + 로컬 PostgreSQL 실행 중이어야 한다.
// 실행: node test/test-gateway-client.mjs
//
// 프론트 StorageBasePostgres.vue 가 쓰는 클라이언트 모듈을 그대로 검증한다.
import { PostgresGatewayClient } from '../../src/components/designer/modeling/postgresGatewayClient.js';

let PASS = 0;
let FAIL = 0;
function check(name, cond) {
  if (cond) { PASS++; console.log(`  PASS  ${name}`); }
  else { FAIL++; console.log(`  FAIL  ${name}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function waitMsg(pred, { timeout = 3000 } = {}) {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), timeout);
    waitMsg._resolve = (m) => {
      if (pred(m)) { clearTimeout(t); resolve(m); }
    };
  });
}

async function main() {
  const gw = new PostgresGatewayClient({
    baseUrl: 'http://localhost:5757',
    dbName: 'mydb',
    getToken: () => null,
  });

  const NS = 'pgcli_ns';
  await gw.deleteData(`jobs/${NS}/c1`);
  await gw.deleteData(`definitions/pgcli_p/queue`);

  // 1. HTTP CRUD
  await gw.setData(`jobs/${NS}/c1`, { state: { n: 1 } });
  let v = await gw.getData(`jobs/${NS}/c1`);
  check('setData + getData', v && v.state && v.state.n === 1);

  await gw.updateData(`jobs/${NS}/c1/state`, { extra: 'x' });
  v = await gw.getData(`jobs/${NS}/c1/state`);
  check('updateData 깊은 경로 merge', v && v.n === 1 && v.extra === 'x');

  const key = await gw.pushData(`definitions/pgcli_p/queue`, { action: 'op1' });
  check('pushData → 정렬키 반환', typeof key === 'string' && key.length === 20);

  const list = await gw.listData(`definitions/pgcli_p/queue`);
  check('listData 컬렉션 조회', list && list[key] && list[key].action === 'op1');

  // 2. WebSocket watch
  // WS 연결 대기
  for (let i = 0; i < 50 && !gw.connected; i++) await sleep(100);
  check('WebSocket 연결', gw.connected === true);

  // value 구독
  let received = [];
  const subId = gw.subscribe(`jobs/${NS}/c1`, 'value', null, (msg) => {
    received.push(msg);
  });
  await sleep(300); // 초기 메시지
  check('value 구독 초기 메시지', received.some((m) => m.initial && m.watchType === 'value'));

  // write → 푸시 수신
  received = [];
  await gw.setData(`jobs/${NS}/c1`, { state: { n: 2 } });
  for (let i = 0; i < 30 && received.length === 0; i++) await sleep(100);
  check('value 구독 write 푸시', received.some((m) => m.value && m.value.state && m.value.state.n === 2));

  // 구독 해제 → 더 안 받음
  gw.unsubscribe(subId);
  await sleep(200);
  received = [];
  await gw.setData(`jobs/${NS}/c1`, { state: { n: 3 } });
  await sleep(800);
  check('unsubscribe 후 푸시 중단', received.length === 0);

  // 3. child_added 구독
  let added = [];
  gw.subscribe(`definitions/pgcli_p/queue`, 'child_added', null, (msg) => {
    if (!msg.initial) added.push(msg);
  });
  await sleep(300);
  const key2 = await gw.pushData(`definitions/pgcli_p/queue`, { action: 'op2' });
  for (let i = 0; i < 30 && added.length === 0; i++) await sleep(100);
  check('child_added 구독 — push 수신',
    added.some((m) => m.key === key2 && m.value && m.value.action === 'op2'));

  // 정리
  await gw.deleteData(`jobs/${NS}/c1`);
  await gw.deleteData(`definitions/pgcli_p/queue/${key}`);
  await gw.deleteData(`definitions/pgcli_p/queue/${key2}`);
  gw.close();

  console.log(`\n=== ${PASS} passed, ${FAIL} failed ===`);
  process.exit(FAIL ? 1 : 0);
}

main().catch((err) => {
  console.error('테스트 실행 오류:', err);
  process.exit(1);
});
