// OAuth/Auth 스모크 테스트 (Phase 2 Step 3).
// 게이트웨이가 실행 중이어야 한다: node --env-file=.env src/server.js
// 실행: node --env-file=.env test/test-oauth.mjs
//
// 주의: 실제 Gitea 핸드셰이크(code 교환)는 Gitea 인스턴스가 필요해 Phase 4 통합
// 테스트에서 검증한다. 여기서는 JWT / 유저 upsert / 라우트 / graceful 실패를 본다.
import { signJwt, verifyJwt } from '../src/oauth/jwt.js';
import { upsertOAuthUser, getUserByUid } from '../src/oauth/users.js';
import { query, pool } from '../src/db.js';

const GW = 'http://localhost:5757';
let PASS = 0;
let FAIL = 0;

function check(name, cond) {
  if (cond) { PASS++; console.log(`  PASS  ${name}`); }
  else { FAIL++; console.log(`  FAIL  ${name}`); }
}

const TEST_EMAILS = ['oauthtest@e.com', 'signuptest@e.com'];

async function cleanup() {
  await query(
    "DELETE FROM users WHERE value->>'email' = ANY($1)",
    [TEST_EMAILS],
  );
}

async function main() {
  await cleanup();

  // 1. JWT 라운드트립
  const tok = signJwt({ sub: 'u-test' });
  check('JWT 서명+검증', verifyJwt(tok).sub === 'u-test');

  let badRejected = false;
  try { verifyJwt(`${tok.slice(0, -3)}xxx`); } catch { badRejected = true; }
  check('JWT 변조 서명 거부', badRejected);

  // 2. 유저 upsert
  const u1 = await upsertOAuthUser('gitea', {
    id: 'g-1', email: 'oauthtest@e.com', username: 'oauthtester',
    name: 'OAuth Tester', emailVerified: true,
  });
  check('신규 유저 생성', !!u1.uid && u1.email === 'oauthtest@e.com');

  const fetched = await getUserByUid(u1.uid);
  check('uid 로 조회', !!fetched && fetched.uid === u1.uid);

  const u2 = await upsertOAuthUser('gitea', {
    id: 'g-1', email: 'oauthtest@e.com', username: 'oauthtester', name: 'OAuth Tester',
  });
  check('재로그인 시 동일 uid (update)', u2.uid === u1.uid);

  const g = await query('SELECT email, username FROM users WHERE uid = $1', [u1.uid]);
  check('generated column email/username 추출',
    g.rows[0].email === 'oauthtest@e.com' && g.rows[0].username === 'oauthtester');

  // 3. POST /auth/signin — 유효 JWT
  const jwt = signJwt({ sub: u1.uid });
  let r = await fetch(`${GW}/auth/mydb/signin`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: jwt }),
  });
  let body = await r.json();
  check('/auth/signin 유효 토큰 → 유저 반환',
    r.status === 200 && body.user && body.user.uid === u1.uid);

  // 4. POST /auth/signin — 잘못된 토큰
  r = await fetch(`${GW}/auth/mydb/signin`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: 'garbage.token.here' }),
  });
  check('/auth/signin 잘못된 토큰 → 401', r.status === 401);

  // 5. GET /oauth2/init — Gitea 미기동 → graceful 에러 (서버 크래시 X)
  r = await fetch(`${GW}/oauth2/mydb/init?callbackUrl=http://example/cb`);
  body = await r.json().catch(() => ({}));
  check('/oauth2/init Gitea 없음 → graceful 500',
    r.status === 500 && /discovery|fetch|OIDC/i.test(body.error || ''));

  r = await fetch(`${GW}/health`);
  body = await r.json();
  check('에러 후 게이트웨이 생존', body.status === 'ok');

  // 6. POST /auth/signup
  r = await fetch(`${GW}/auth/mydb/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'signuptest@e.com', username: 'su' }),
  });
  body = await r.json();
  check('/auth/signup 유저 생성',
    r.status === 200 && !!body.access_token && body.user.email === 'signuptest@e.com');

  await cleanup();
  await pool.end();
  console.log(`\n=== ${PASS} passed, ${FAIL} failed ===`);
  process.exit(FAIL ? 1 : 0);
}

main().catch((err) => {
  console.error('테스트 실행 오류:', err);
  process.exit(1);
});
