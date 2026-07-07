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

  const trimmed = parts.map((p) => String(p).trim());
  const at = (i) => (i >= 0 && i < trimmed.length ? trimmed[i] : '');
  const decode = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
  const empno = at(swp.idxEmpno);   // 사번 — 드리프트 앞이라 인덱스(1) 고정 안전
  const id = at(swp.idxId);         // iv-user(로그인 ID) — 인덱스(0) 고정 안전

  // 이메일/영문성명은 현장 피드가 스펙 표보다 필드 하나 더 밀려 오는 사례가 있어
  // (idx 8 이 빈 값으로 들어와 displayname/mail 이 +1 어긋남) 인덱스에 의존하지 않는다.
  //   - 이메일: '@' 를 포함한 토큰을 직접 찾는다(없으면 설정 인덱스 → 사번 합성).
  //   - 영문성명(displayname): 스펙상 mail 바로 앞 필드이므로 이메일 토큰의 앞 토큰.
  //     SWP 는 이 값을 URL 인코딩해 보내므로 decode 한다.
  const emailIdx = trimmed.findIndex((p) => p.includes('@'));
  let email = emailIdx >= 0 ? trimmed[emailIdx] : at(swp.idxMail);
  if (!email && empno) email = `${empno}@${swp.emailFallbackDomain}`;

  let displayName = emailIdx > 0 ? decode(trimmed[emailIdx - 1]) : decode(at(swp.idxDisplayName));
  displayName = displayName || id || empno;

  const userInfo = {
    id: empno || id,                          // 안정 고유키 = 사번
    username: id || empno,                     // 로그인 ID(iv-user)
    name: displayName,                         // 영문성명(URL 디코드)
    email: email || null,
    emailVerified: true,
    picture: null,
    raw: { department: decode(at(swp.idxDept)), empno, source: 'swp' },
  };
  return { authenticated: true, userInfo, raw };
}
