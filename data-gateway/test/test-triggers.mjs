// 트리거(책임 4) + 레거시 BPM 스모크 테스트 (Phase 2 Step 5).
// 게이트웨이 + 로컬 PostgreSQL 실행 중이어야 한다.
// 실행: node --env-file=.env test/test-triggers.mjs
const GW = 'http://localhost:5757';
let PASS = 0;
let FAIL = 0;

function check(name, cond) {
  if (cond) { PASS++; console.log(`  PASS  ${name}`); }
  else { FAIL++; console.log(`  FAIL  ${name}`); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path) {
  const r = await fetch(`${GW}/data/mydb/${path}`);
  return (await r.json()).value;
}
async function put(path, body) {
  await fetch(`${GW}/data/mydb/${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
async function patch(path, body) {
  await fetch(`${GW}/data/mydb/${path}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
async function del(path) {
  await fetch(`${GW}/data/mydb/${path}`, { method: 'DELETE' });
}

// 트리거는 fire-and-forget — 결과를 폴링으로 대기
async function waitFor(fn, { timeout = 3000, interval = 80 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const v = await fn();
    if (v) return v;
    await sleep(interval);
  }
  return null;
}

async function main() {
  const pid = 'trg_p1';
  const author = 'trg_author';
  const shareUid = 'trg_share';

  // 정리
  for (const p of [`definitions/${pid}`, `userLists/${author}/mine/${pid}`,
    `userLists/${shareUid}/share/${pid}`, `userLists/everyone/share_es/${pid}`,
    `userLists/everyone/share_first/${pid}`, 'definitions/trg_bpm1']) {
    await del(p);
  }

  // 1. 책임 4-(1): definition information → userLists 동기화
  await put(`definitions/${pid}/information`, {
    author, authorEmail: 'a@e.com', projectName: 'TrigTest', type: 'es',
    permissions: { [shareUid]: true, everyone: true },
  });
  const mine = await waitFor(async () => {
    const v = await get(`userLists/${author}/mine/${pid}`);
    return v && v.projectId === pid ? v : null;
  });
  check('책임4-(1) author mine 목록 생성', mine && mine.projectName === 'TrigTest');

  const share = await waitFor(() => get(`userLists/${shareUid}/share/${pid}`));
  check('책임4-(1) 권한 보유자 share 목록 생성', !!share);

  const pub = await waitFor(() => get(`userLists/everyone/share_es/${pid}`));
  check('책임4-(1) everyone share_es 생성', !!pub);

  // 2. 책임 4-(1): 권한 회수 → share 삭제
  await patch(`definitions/${pid}/information`, {
    permissions: { [shareUid]: false, everyone: true },
  });
  const revoked = await waitFor(async () => {
    const v = await get(`userLists/${shareUid}/share/${pid}`);
    return v === null ? true : null;
  });
  check('책임4-(1) 권한 회수 시 share 삭제', revoked === true);

  // 3. 책임 4-(3): userLists/mine 제거 → 정의 cascade 삭제
  await del(`userLists/${author}/mine/${pid}`);
  const defGone = await waitFor(async () => {
    const v = await get(`definitions/${pid}`);
    return v === null ? true : null;
  });
  check('책임4-(3) mine 삭제 → 정의 cascade 삭제', defGone === true);

  // 4. 책임 4-(2): 신규 사용자 → enrolledUsers
  const email = 'trgenroll@e.com';
  const r = await fetch(`${GW}/auth/mydb/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username: 'trgenroll' }),
  });
  const signupBody = await r.json();
  const convEmail = email.replace(/\./g, '_');
  const enrolled = await waitFor(async () => {
    const v = await get(`enrolledUsers/${convEmail}`);
    return v && v.email === email ? v : null;
  });
  check('책임4-(2) 신규 유저 → enrolledUsers 자동 생성', !!enrolled);

  // 5. 레거시 BPM 엔드포인트
  const bpid = 'trg_bpm1';
  await put(`definitions/${bpid}/information`, { lastVersionName: 'v1' });
  const model = {
    elements: {
      e1: { _type: 'org.uengine.kernel.Activity', name: 'Act1' },
      role1: { _type: 'org.uengine.kernel.RoleActivity', name: 'Reviewer' },
    },
    relations: { r1: { _type: 'org.uengine.kernel.SequenceFlow', name: '' } },
  };
  await put(`definitions/${bpid}/versionLists/v1/versionValue`,
    { value: JSON.stringify(model) });
  const bpmRes = await fetch(`${GW}/api/definitions/${bpid}`);
  const bpm = await bpmRes.json();
  check('레거시 BPM 변환',
    bpm._type === 'org.uengine.kernel.ProcessDefinition'
    && bpm.id === bpid
    && Array.isArray(bpm.childActivities) && bpm.childActivities.length === 1
    && Array.isArray(bpm.roles) && bpm.roles.length === 1
    && Array.isArray(bpm.sequenceFlows) && bpm.sequenceFlows.length === 1
    && !bpm.elements && !bpm.relations);

  // 정리
  for (const p of [`definitions/${pid}`, `definitions/${bpid}`,
    `userLists/${author}/mine/${pid}`, `userLists/${shareUid}/share/${pid}`,
    `userLists/everyone/share_es/${pid}`, `userLists/everyone/share_first/${pid}`,
    `enrolledUsers/${convEmail}`]) {
    await del(p);
  }
  if (signupBody?.user?.uid) await del(`users/${signupBody.user.uid}`);

  console.log(`\n=== ${PASS} passed, ${FAIL} failed ===`);
  process.exit(FAIL ? 1 : 0);
}

main().catch((err) => {
  console.error('테스트 실행 오류:', err);
  process.exit(1);
});
