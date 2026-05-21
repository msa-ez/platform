// OAuth / Auth 라우트 (DB-migration-plan.md §7.2 / §7.5).
//   GET  /oauth2/:db/init    OAuth 시작 → { redirectUrl }
//   GET  /oauth2/:db/signin  Gitea 콜백 → ${callbackUrl}?result=base64(JSON)
//   POST /auth/:db/signin    JWT 검증 → { access_token, user }
//   POST /auth/:db/signup    최소 사용자 생성 → { access_token, user }
import express from 'express';
import { config } from '../config.js';
import { asyncHandler } from '../util.js';
import { signJwt, verifyJwt } from './jwt.js';
import { buildAuthUrl, exchangeCode, fetchUserInfo } from './oidc.js';
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

// ── GET /oauth2/:db/init ────────────────────────────────────────────
oauthRouter.get('/oauth2/:db/init', asyncHandler(async (req, res) => {
  const provider = req.query.provider || config.oauth.provider;
  const callbackUrl = req.query.callbackUrl;
  if (!callbackUrl) {
    return res.status(400).json({ error: 'callbackUrl 쿼리 파라미터 필요' });
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
