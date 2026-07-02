// SWP(POSCO) SSO 클라이언트 — SWP HTTP 인증 토큰 방식.
// Gitea OIDC(oidc.js) 와 달리 authorization-code flow 가 아니다:
//   1) 사용자를 SWP redirect.jsp 로 보내 로그인시키고
//   2) SWP 가 우리 콜백(POST)으로 ssoToken 을 전달하면
//   3) isValidSSO.jsp 에 Cookie(SWP-H-SESSION-ID) 로 재검증하여 사용자정보(CSV)를 받는다.
// 뒷단(JWT 발급 · users upsert · result emit)은 Gitea 경로와 동일하게 재사용한다.
import { config } from '../config.js';

const swp = config.swp;

/**
 * SWP 로그인 redirect URL 생성.
 * @param {string} redirUri  SWP 가 로그인 성공 후 사용자를 되돌려보낼(POST 할) 우리 콜백 URL.
 */
export function buildSwpRedirect(redirUri) {
  return swp.redirectUrl + encodeURIComponent(redirUri);
}

/**
 * ssoToken 유효성 검증 → 파싱된 사용자정보.
 * 미인증이면 { authenticated: false }.
 * @returns {{authenticated: boolean, userInfo?: object, raw: string}}
 */
export async function validateSsoToken(ssoToken) {
  const res = await fetch(swp.validCheckUrl, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': `SWP-H-SESSION-ID=${ssoToken}`,
    },
  });
  const raw = await res.text();

  // 현장 1회 확인용 — isValidSSO 응답의 실제 필드 순서/값을 gateway 로그에서 눈으로 확인.
  // 확인 후 필드 인덱스가 기본값과 다르면 SWP_IDX_* env 로만 조정하면 된다(재빌드 불필요).
  console.log('[swp] isValidSSO raw response:', JSON.stringify(raw));

  const parts = raw.split(',');
  // 실패 판정: 응답이 비었거나 첫 필드가 'Unauthenticated' (POSCO 샘플 코드 기준).
  if (!parts.length || parts[0].trim() === 'Unauthenticated') {
    return { authenticated: false, raw };
  }

  const at = (i) => (i >= 0 && i < parts.length ? String(parts[i]).trim() : '');
  const empno = at(swp.idxEmpno);
  const id = at(swp.idxId);
  let email = at(swp.idxMail);
  // mail 이 없으면 사번 기반 합성 이메일 — enrolledUsers 키/findUserByEmail 안정성 보장.
  if (!email && empno) email = `${empno}@${swp.emailFallbackDomain}`;

  const userInfo = {
    id: empno || id,                          // 안정 고유키 = 사번
    username: id || empno,                     // 로그인 ID(iv-user)
    name: at(swp.idxDisplayName) || id || empno,
    email: email || null,
    emailVerified: true,
    picture: null,
    raw: { department: at(swp.idxDept), source: 'swp' },
  };
  return { authenticated: true, userInfo, raw };
}
