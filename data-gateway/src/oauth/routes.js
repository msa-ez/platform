// OAuth / Auth 라우트 (DB-migration-plan.md §7.2 / §7.5).
//   GET  /oauth2/:db/init    OAuth 시작 → { redirectUrl }
//   GET  /oauth2/:db/signin  Gitea 콜백 → ${callbackUrl}?result=base64(JSON)
//   GET  /sso/:db/init       SWP(POSCO) SSO 시작 → { redirectUrl }
//   POST /sso/:db/valid      SWP 콜백(ssoToken 검증) → ${callbackUrl}?result=base64(JSON)
//   POST /auth/:db/signin    JWT 검증 → { access_token, user }
//   POST /auth/:db/signup    최소 사용자 생성 → { access_token, user }
import express from 'express';
import { config } from '../config.js';
import { asyncHandler } from '../util.js';
import { signJwt, verifyJwt } from './jwt.js';
import { buildAuthUrl, exchangeCode, fetchUserInfo } from './oidc.js';
import { buildSwpRedirect, validateSsoToken } from './swp.js';
import {
  upsertOAuthUser, getUserByUid, findUserByEmail,
  listUsersByStatus, listAllUsers, setUserStatus, resolveStatus, isApproved, isAdminEmail,
} from './users.js';
import { onUserCreated, removeEnrolledUser } from '../triggers.js';
import { generatePushId } from '../pushId.js';

export const oauthRouter = express.Router();

// state 는 단기(10분) JWT 로 서명 → 변조 방지
function signState(data) {
  return signJwt({ st: data }, { expiresInSec: 600 });
}
function verifyState(token) {
  return verifyJwt(token).st;
}

// 로그인 사용자 JWT 발급 — 승인상태(approved)·권한(role)을 클레임에 포함.
// authz 가 클레임만으로 미승인 차단을 판정할 수 있어 hot path 에 DB 조회가 없다.
function issueUserToken(user, req) {
  return signJwt({
    sub: user.uid,
    ip: req.ip,
    approved: isApproved(user),
    role: user.authorized || 'student',
  });
}

// Authorization: Bearer <jwt> 추출.
function bearerToken(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(h));
  if (m) return m[1];
  return (req.body && req.body.access_token) || null;
}

// admin 전용 미들웨어 — JWT 검증 후 DB 로 authorized==='admin' 재확인(클레임만 신뢰 X).
async function requireAdmin(req, res, next) {
  const token = bearerToken(req);
  let claims;
  try {
    claims = verifyJwt(token);
  } catch (e) {
    return res.status(401).json({ error: 'authentication required' });
  }
  const user = await getUserByUid(claims.sub);
  if (!user || user.authorized !== 'admin') {
    return res.status(403).json({ error: 'admin only' });
  }
  req.adminUser = user;
  next();
}

function signinRedirectUri(req) {
  return `${req.protocol}://${req.get('host')}/oauth2/${req.params.db}/signin`;
}

// open redirect(A-028) 차단 — callbackUrl 을 허용 오리진으로 제한.
//   - 상대경로(/...)는 허용, 프로토콜-상대(//host)는 외부이므로 불허.
//   - config.oauth.allowedRedirectOrigins 에 있으면 허용.
//   - 허용목록 미설정 시: 호출 페이지(Origin/Referer)와 동일 오리진만 허용(레거시 호환).
function isAllowedCallback(callbackUrl, req) {
  const s = String(callbackUrl || '');
  if (!s) return false;
  if (s.startsWith('/') && !s.startsWith('//')) return true; // 상대경로
  let u;
  try {
    u = new URL(s);
  } catch (e) {
    return false;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
  const allowed = config.oauth.allowedRedirectOrigins || [];
  if (allowed.length) return allowed.includes(u.origin);
  const ref = req.headers.origin || req.headers.referer || '';
  try {
    return !!ref && new URL(ref).origin === u.origin;
  } catch (e) {
    return false;
  }
}

// ── GET /oauth2/:db/init ────────────────────────────────────────────
oauthRouter.get('/oauth2/:db/init', asyncHandler(async (req, res) => {
  const provider = req.query.provider || config.oauth.provider;
  const callbackUrl = req.query.callbackUrl;
  if (!callbackUrl) {
    return res.status(400).json({ error: 'callbackUrl 쿼리 파라미터 필요' });
  }
  if (!isAllowedCallback(callbackUrl, req)) {
    return res.status(400).json({ error: 'callbackUrl not allowed' });
  }
  const state = signState({ flow: 'redirect', provider, callbackUrl });
  const redirectUrl = await buildAuthUrl({
    redirectUri: signinRedirectUri(req),
    state,
  });
  res.json({ redirectUrl });
}));

// ── GET /oauth2/:db/signin (Gitea 콜백) ─────────────────────────────
oauthRouter.get('/oauth2/:db/signin', asyncHandler(async (req, res) => {
  const { code, state, error } = req.query;

  let st;
  try {
    st = verifyState(state);
  } catch (e) {
    return res.status(400).send(`invalid state: ${e.message}`);
  }

  if (error) {
    return res.redirect(`${st.callbackUrl}?provider=${st.provider}&error=${encodeURIComponent(error)}`);
  }

  const tokens = await exchangeCode({ code, redirectUri: signinRedirectUri(req) });
  const userInfo = await fetchUserInfo(tokens.access_token);
  const user = await upsertOAuthUser(st.provider, userInfo);

  // TODO(Phase 2 Step 5): enrolledUsers 트리거 (책임 4-(2))

  // AceBase 클라이언트 SDK 의 finishAuthProviderSignIn() 가 만들던 최종 형태로 emit한다.
  // (게이트웨이가 서버 + SDK 역할을 겸함 — accessToken 카멜케이스, user 포함)
  const result = {
    provider: {
      name: st.provider,
      access_token: tokens.access_token,       // raw Gitea 토큰 — 프론트가 gitToken 으로 사용
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
    },
    accessToken: issueUserToken(user, req), // 게이트웨이 JWT (승인상태/권한 클레임 포함)
    user: {
      uid: user.uid,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      picture: user.picture,
      settings: user.settings,
      authorized: user.authorized || 'student',
      status: resolveStatus(user),
    },
  };
  const base64Result = Buffer.from(JSON.stringify(result)).toString('base64');
  res.redirect(`${st.callbackUrl}?result=${encodeURIComponent(base64Result)}`);
}));

// ── SWP(POSCO) SSO ──────────────────────────────────────────────────
// Gitea OAuth 와 독립된 로그인 경로. state 는 Gitea 경로와 동일하게 단기 JWT 로 서명해
// callbackUrl 을 왕복 동안 변조 없이 보존한다.

function swpValidUri(req) {
  return `${req.protocol}://${req.get('host')}/sso/${req.params.db}/valid`;
}

// SWP 인증 성공 → Gitea 경로와 동일한 result 형태를 만들어 callbackUrl 로 redirect.
async function emitSwpResult(req, res, st, userInfo) {
  const user = await upsertOAuthUser('posco', userInfo);
  const result = {
    provider: {
      name: 'posco',
      // SWP 는 git 토큰을 발급하지 않는다. 코드생성용 Gitea 접근은 프론트의
      // 서비스 PAT(window.GITEA_TOKEN)가 담당하므로 여기서는 null.
      access_token: null,
      refresh_token: null,
      expires_in: null,
    },
    accessToken: issueUserToken(user, req), // 게이트웨이 JWT (승인상태/권한 클레임 포함)
    user: {
      uid: user.uid,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      picture: user.picture,
      settings: user.settings,
      authorized: user.authorized || 'student',
      status: resolveStatus(user),
    },
  };
  const base64Result = Buffer.from(JSON.stringify(result)).toString('base64');
  res.redirect(`${st.callbackUrl}?result=${encodeURIComponent(base64Result)}`);
}

// ── GET /sso/:db/init ───────────────────────────────────────────────
oauthRouter.get('/sso/:db/init', asyncHandler(async (req, res) => {
  const callbackUrl = req.query.callbackUrl;
  if (!callbackUrl) {
    return res.status(400).json({ error: 'callbackUrl 쿼리 파라미터 필요' });
  }
  if (!isAllowedCallback(callbackUrl, req)) {
    return res.status(400).json({ error: 'callbackUrl not allowed' });
  }
  const state = signState({ flow: 'swp', provider: 'posco', callbackUrl });
  // SWP 는 로그인 후 이 redirUri 로 사용자를 되돌려보낸다(POST). state 를 query 로 실어
  // 왕복 동안 callbackUrl 을 보존한다.
  const redirUri = `${swpValidUri(req)}?state=${encodeURIComponent(state)}`;
  res.json({ redirectUrl: buildSwpRedirect(redirUri) });
}));

// ── POST/GET /sso/:db/valid (SWP 콜백) ──────────────────────────────
// SWP EP 는 보통 form POST(ssoToken 등)로 되돌려보낸다(POSCO 샘플 기준). 다만 환경에
// 따라 GET 으로 오는 경우도 있어 양쪽을 모두 처리한다 — ssoToken 은 body/query 어디서든 수용.
const handleSwpValid = asyncHandler(async (req, res) => {
  let st;
  try {
    st = verifyState(req.query.state);
  } catch (e) {
    return res.status(400).send(`invalid state: ${e.message}`);
  }

  const ssoToken = (req.body && req.body.ssoToken) || req.query.ssoToken;
  if (!ssoToken) {
    // 토큰이 없으면 SWP 로그인 홈으로 돌려보냄.
    return res.redirect(config.swp.loginUrl);
  }

  const check = await validateSsoToken(ssoToken);
  if (!check.authenticated) {
    return res.redirect(config.swp.loginUrl);
  }

  await emitSwpResult(req, res, st, check.userInfo);
});
oauthRouter.post('/sso/:db/valid', handleSwpValid);
oauthRouter.get('/sso/:db/valid', handleSwpValid);

// ── POST /auth/:db/signin (JWT 검증 → 유저) ─────────────────────────
oauthRouter.post('/auth/:db/signin', asyncHandler(async (req, res) => {
  const token = req.body?.access_token || req.body?.token;
  if (!token) return res.status(400).json({ error: 'access_token 필요' });
  let claims;
  try {
    claims = verifyJwt(token);
  } catch (e) {
    return res.status(401).json({ error: `invalid token: ${e.message}` });
  }
  const user = await getUserByUid(claims.sub);
  if (!user) return res.status(401).json({ error: 'user not found' });
  // 승인상태가 토큰 클레임보다 최신(승인/거절/권한변경)이면 토큰 재발급 →
  // 새로고침(signin)만으로도 즉시 반영(폴링과 동일 효과). grandfather(claim 없음)는 재발급 안 함.
  let outToken = token;
  if (isApproved(user) !== (claims.approved !== false) || (claims.role || 'student') !== (user.authorized || 'student')) {
    outToken = issueUserToken(user, req);
  }
  res.json({ access_token: outToken, user: { ...user, status: resolveStatus(user), authorized: user.authorized || 'student' } });
}));

// ── GET /auth/:db/status (승인상태 폴링) ────────────────────────────
// 승인대기 화면이 주기적으로 호출. DB 최신 status 를 확인해 승인되면 새 토큰을
// 재발급(클레임 approved=true)하여 재로그인 없이 자동 진입할 수 있게 한다.
oauthRouter.get('/auth/:db/status', asyncHandler(async (req, res) => {
  const token = bearerToken(req);
  let claims;
  try {
    claims = verifyJwt(token);
  } catch (e) {
    return res.status(401).json({ error: 'authentication required' });
  }
  const user = await getUserByUid(claims.sub);
  if (!user) return res.status(401).json({ error: 'user not found' });
  const status = resolveStatus(user);            // approved | pending | rejected
  const role = user.authorized || 'student';
  const approved = status === 'approved';
  const body = { status, role, approved };
  // 클레임이 stale(approved=false)인데 DB 는 승인 → 새 토큰 재발급.
  if (approved && claims.approved === false) {
    body.access_token = issueUserToken(user, req);
  }
  res.json(body);
}));

// ── POST /auth/:db/signup (최소 사용자 생성) ────────────────────────
// onprem 의 1차 인증은 Gitea OAuth 다. signup 은 보조 경로 — 최소 레코드만 생성.
oauthRouter.post('/auth/:db/signup', asyncHandler(async (req, res) => {
  const { email, username, displayName } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email 필요' });

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.json({
      access_token: issueUserToken(existing, req),
      user: existing,
    });
  }
  const user = await upsertOAuthUser('local', {
    id: generatePushId(),
    email,
    username: username || email,
    name: displayName || username || email,
    emailVerified: false,
  });
  res.json({ access_token: issueUserToken(user, req), user });
}));

// ── 가입 승인(admin) ────────────────────────────────────────────────
// GET  /admin/:db/pending          대기 유저 목록
// POST /admin/:db/approve {uid}    승인 → enrolledUsers push
// POST /admin/:db/reject  {uid}    거절/차단 → enrolledUsers 제거
function publicUser(u) {
  return {
    uid: u.uid,
    email: u.email || null,
    username: u.username || null,
    displayName: u.display_name || null,
    department: u.department || (u.raw && u.raw.department) || null,
    status: resolveStatus(u),
    authorized: u.authorized || 'student',
    created: u.created || null,
  };
}

oauthRouter.get('/admin/:db/pending', requireAdmin, asyncHandler(async (req, res) => {
  const users = await listUsersByStatus('pending');
  res.json({ users: users.map(publicUser) });
}));

// status 쿼리 없으면 전체 사용자 반환(사용자 관리 화면).
oauthRouter.get('/admin/:db/users', requireAdmin, asyncHandler(async (req, res) => {
  const status = req.query.status;
  const users = status ? await listUsersByStatus(String(status)) : await listAllUsers();
  res.json({ users: users.map(publicUser) });
}));

// 활성화(승인) — pending/rejected → approved. enrolledUsers 등록.
oauthRouter.post('/admin/:db/approve', requireAdmin, asyncHandler(async (req, res) => {
  const uid = req.body && req.body.uid;
  if (!uid) return res.status(400).json({ error: 'uid 필요' });
  const user = await setUserStatus(uid, 'approved');
  if (!user) return res.status(404).json({ error: 'user not found' });
  await onUserCreated(user);             // 승인 시점에 enrolledUsers push
  res.json({ ok: true, user: publicUser(user) });
}));

// 비활성화(거절/차단) — → rejected. enrolledUsers 제거.
// 안전장치: 자기 자신 / ADMIN_EMAILS 계정은 비활성화 불가(관리자 잠금 방지).
oauthRouter.post('/admin/:db/reject', requireAdmin, asyncHandler(async (req, res) => {
  const uid = req.body && req.body.uid;
  if (!uid) return res.status(400).json({ error: 'uid 필요' });
  if (uid === req.adminUser.uid) {
    return res.status(400).json({ error: '자기 자신은 비활성화할 수 없습니다' });
  }
  const target = await getUserByUid(uid);
  if (!target) return res.status(404).json({ error: 'user not found' });
  if (isAdminEmail(target.email)) {
    return res.status(400).json({ error: '관리자 계정은 비활성화할 수 없습니다' });
  }
  const user = await setUserStatus(uid, 'rejected');
  await removeEnrolledUser(user);        // 혹시 등록돼 있으면 제거
  res.json({ ok: true, user: publicUser(user) });
}));
