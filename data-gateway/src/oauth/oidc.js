// Gitea OIDC 클라이언트 — 표준 authorization-code flow.
// Phase 0 분석(DB-migration-plan.md §7.2): gitlab-acebase 의 gitea.js 는
// 표준 OIDC discovery 기반이며, 그 흐름을 외부 의존성 없이 포팅한 것.
import { config } from '../config.js';

const { provider, clientId, clientSecret, gitHost, protocol } = config.oauth;

let cachedConfig = null;

/** OIDC discovery 문서 조회 (.well-known/openid-configuration). 캐시함. */
export async function getOidcConfig() {
  if (cachedConfig) return cachedConfig;
  const url = `${protocol}://${gitHost}/.well-known/openid-configuration`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OIDC discovery 실패 (${url}): HTTP ${res.status}`);
  }
  cachedConfig = await res.json();
  return cachedConfig;
}

/** 사용자를 보낼 authorize URL 생성. */
export async function buildAuthUrl({ redirectUri, state, scope = 'openid profile email' }) {
  const cfg = await getOidcConfig();
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state,
  });
  return `${cfg.authorization_endpoint}?${params.toString()}`;
}

/** authorization code → 액세스/리프레시 토큰 교환. */
export async function exchangeCode({ code, redirectUri }) {
  const cfg = await getOidcConfig();
  const res = await fetch(cfg.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });
  const result = await res.json();
  if (result.error) {
    throw new Error(`토큰 교환 실패: ${result.error} ${result.error_description || ''}`);
  }
  return result; // { access_token, refresh_token, expires_in, id_token, ... }
}

/** userinfo 엔드포인트에서 사용자 정보 조회 → 정규화. */
export async function fetchUserInfo(accessToken) {
  const cfg = await getOidcConfig();
  const res = await fetch(cfg.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`userinfo 조회 실패: HTTP ${res.status}`);
  }
  const u = await res.json();
  return {
    id: String(u.sub ?? u.id ?? ''),
    username: u.preferred_username || u.name || null,
    name: u.name || u.preferred_username || null,
    email: u.email || null,
    emailVerified: u.email_verified !== false,
    picture: u.picture || null,
    raw: u,
  };
}

export const oauthProvider = provider;
