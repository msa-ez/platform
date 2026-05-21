// Phase 4 통합 테스트 — 계층 간 연결 검증.
// 게이트웨이 + 로컬 PostgreSQL 실행 중이어야 한다.
// 실행: node test/test-integration.mjs
//
// 검증하는 것 (지금까지의 스모크 테스트는 각 계층을 따로 봤음):
//   1) 백엔드 어댑터(Python) → PG → 트리거/NOTIFY → 게이트웨이 LISTEN → WS → 프론트
//      = "백엔드가 쓴 Job 진행상황을 프론트가 실시간으로 본다" (책임 2)
//   2) 프론트(게이트웨이 Data API) → PG → 백엔드 어댑터가 읽음
//      = "프론트가 만든 데이터를 백엔드가 본다"
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PostgresGatewayClient } from '../../src/components/designer/modeling/postgresGatewayClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTSTORMING_PY = path.resolve(
  __dirname, '../../../msaez-automate-eventstorming-generator/.venv/bin/python',
);
const HELPER = path.join(__dirname, '_backend_write.py');

let PASS = 0;
let FAIL = 0;
function check(name, cond) {
  if (cond) { PASS++; console.log(`  PASS  ${name}`); }
  else { FAIL++; console.log(`  FAIL  ${name}`); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 백엔드 어댑터(Python)로 직접 PG 에 write/read
function backend(action, p, data) {
  const args = [HELPER, action, p];
  if (data !== undefined) args.push(JSON.stringify(data));
  const r = spawnSync(EVENTSTORMING_PY, args, {
    encoding: 'utf8',
    env: { ...process.env, POSTGRES_PASSWORD: 'msaez_dev' },
  });
  if (r.status !== 0) {
    throw new Error(`backend ${action} 실패: ${r.stderr || r.stdout}`);
  }
  // 어댑터의 LoggingUtil 로그가 stdout 에 섞이므로 마지막 줄(=결과 JSON)만 파싱
  const lines = (r.stdout || '').trim().split('\n').filter((l) => l.trim() !== '');
  return JSON.parse(lines[lines.length - 1] || 'null');
}

async function main() {
  const gw = new PostgresGatewayClient({
    baseUrl: 'http://localhost:5757', dbName: 'mydb', getToken: () => null,
  });
  const NS = 'intg_ns';
  const JOB = 'intg_job1';
  const jobPath = `jobs/${NS}/${JOB}`;

  backend('delete', jobPath);
  for (let i = 0; i < 50 && !gw.connected; i++) await sleep(100);
  check('게이트웨이 WS 연결', gw.connected);

  // ── 방향 1: 백엔드 write → 프론트 WS watcher 수신 ──────────────────
  let received = [];
  gw.subscribe(jobPath, 'value', null, (msg) => {
    if (!msg.initial) received.push(msg);
  });
  await sleep(300);

  // 백엔드 어댑터가 Job 을 직접 PG 에 생성
  const setOk = backend('set', jobPath, { state: { inputs: { req: 'r1' }, outputs: {} } });
  check('백엔드 어댑터 set_data 성공', setOk === true);

  for (let i = 0; i < 40 && received.length === 0; i++) await sleep(100);
  check('백엔드 write → 프론트 WS 수신 (계층 관통)',
    received.some((m) => m.value && m.value.state && m.value.state.inputs.req === 'r1'));

  // 백엔드가 깊은 서브경로(Job 진행상황) 갱신 → 프론트 수신
  received = [];
  backend('update', `${jobPath}/state/outputs`, { logs: ['step1', 'step2'], isCompleted: false });
  for (let i = 0; i < 40 && received.length === 0; i++) await sleep(100);
  check('백엔드 진행상황 갱신 → 프론트 실시간 수신',
    received.some((m) => m.value && m.value.state.outputs
      && Array.isArray(m.value.state.outputs.logs)
      && m.value.state.outputs.logs.length === 2));

  // ── 방향 2: 프론트(게이트웨이 Data API) write → 백엔드 어댑터가 읽음 ──
  await gw.setData(`${jobPath}/state/outputs/isCompleted`, true);
  await sleep(200);
  const backendRead = backend('get', `${jobPath}/state/outputs/isCompleted`);
  check('프론트 write → 백엔드 어댑터가 동일 값 read', backendRead === true);

  // 백엔드가 본 전체 Job 이 양쪽 write 를 모두 반영하는지
  const fullJob = backend('get', jobPath);
  check('양방향 write 가 한 Job 에 일관 반영',
    fullJob && fullJob.state.inputs.req === 'r1'
    && fullJob.state.outputs.logs.length === 2
    && fullJob.state.outputs.isCompleted === true);

  // ── 큐 클레임 통합: 게이트웨이가 requestedJob 생성 → 백엔드가 SKIP LOCKED 클레임 ──
  await gw.setData(`requestedJobs/${NS}/intg_req1`, { inputs: { x: 1 } });
  await sleep(150);
  // 백엔드 어댑터의 claim_pending_job 은 _backend_write.py 에 없으므로 get 으로 존재만 확인
  const reqSeen = backend('get', `requestedJobs/${NS}/intg_req1`);
  check('프론트가 만든 requestedJob 을 백엔드가 조회', reqSeen && reqSeen.inputs.x === 1);

  // 정리
  backend('delete', jobPath);
  backend('delete', `requestedJobs/${NS}/intg_req1`);
  gw.close();

  console.log(`\n=== ${PASS} passed, ${FAIL} failed ===`);
  process.exit(FAIL ? 1 : 0);
}

main().catch((err) => {
  console.error('테스트 실행 오류:', err);
  process.exit(1);
});
