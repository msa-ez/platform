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
import { upsertOAuthUser, getUserByUid, findUserByEmail } from './users.js';
import { generatePushId } from '../pushId.js';

export const oauthRouter = express.Router();

// state 는 단기(10분) JWT 로 서명 → 변조 방지
function signState(data) {
  return signJwt({ st: data }, { expiresInSec: 600 });
}
function verifyState(token) {
  return verifyJwt(token).st;
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
    accessToken: signJwt({ sub: user.uid, ip: req.ip }), // 게이트웨이 JWT (AceBase 토큰 대체)
    user: {
      uid: user.uid,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      picture: user.picture,
      settings: user.settings,
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
    accessToken: signJwt({ sub: user.uid, ip: req.ip }), // 게이트웨이 JWT
    user: {
      uid: user.uid,
      email: user.email,
      username: user.username,
      displayName: user.display_name,
      picture: user.picture,
      settings: user.settings,
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
  res.json({ access_token: token, user });
}));

// ── POST /auth/:db/signup (최소 사용자 생성) ────────────────────────
// onprem 의 1차 인증은 Gitea OAuth 다. signup 은 보조 경로 — 최소 레코드만 생성.
oauthRouter.post('/auth/:db/signup', asyncHandler(async (req, res) => {
  const { email, username, displayName } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email 필요' });

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.json({
      access_token: signJwt({ sub: existing.uid, ip: req.ip }),
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
  res.json({ access_token: signJwt({ sub: user.uid, ip: req.ip }), user });
}));
