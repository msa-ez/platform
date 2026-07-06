// 게이트웨이 환경 설정 — DB-migration-plan.md §3.3 / §14
export const config = {
  // 게이트웨이는 기존 AceBase 자리(5757)를 그대로 차지한다.
  port: parseInt(process.env.GATEWAY_PORT || '5757', 10),
  dbName: process.env.DB_NAME || 'mydb',

  // PostgreSQL 연결
  pg: {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    database: process.env.POSTGRES_DB || 'msaez',
    user: process.env.POSTGRES_USER || 'msaez',
    password: process.env.POSTGRES_PASSWORD || '',
    max: parseInt(process.env.POSTGRES_POOL_MAX || '10', 10),
  },

  // JWT 서명 시크릿
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',

  // OAuth (Gitea OIDC) — AceBase 가 쓰던 환경변수를 그대로 흡수 (§3.3)
  oauth: {
    provider: process.env.PROVIDER || 'gitea',
    clientId: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    // GIT: Gitea 호스트:포트 (예: gitea:3000, 34.64.202.245:3000)
    gitHost: process.env.GIT || 'localhost:3000',
    protocol: process.env.PROTOCOL || 'http',
    // OAuth/SSO 콜백(callbackUrl) 허용 오리진 — open redirect(A-028) 차단용.
    // 예: "http://localhost:8080,https://msaez.example.com". 미설정 시에는 요청의
    // Origin/Referer 와 동일 오리진만 허용(레거시 호환). 상대경로는 항상 허용.
    allowedRedirectOrigins: (process.env.ALLOWED_REDIRECT_ORIGINS || '')
      .split(',').map((s) => s.trim()).filter(Boolean),
  },

  // SWP(POSCO) SSO — SWP HTTP 인증 토큰 방식 (OIDC 아님).
  // Gitea OAuth 와 독립된 로그인 경로. 코드생성용 Gitea 는 그대로 유지되고,
  // 로그인만 SWP SSO 로 대체하기 위한 설정. 기본값은 가동계(운영) 기준.
  swp: {
    // 사용자를 보낼 SWP 로그인 redirect. 'redir_url=' 로 끝나야 하며 뒤에 콜백 URL 을 append 한다.
    redirectUrl: process.env.SWP_SSO_REDIRECT_URL
      || 'http://swpsso.posco.net/idms/U61/jsp/redirect.jsp?redir_url=',
    // ssoToken 유효성 검증 (Cookie: SWP-H-SESSION-ID). 성공 시 사용자정보 CSV 를 반환.
    validCheckUrl: process.env.SWP_SSO_VALID_CHECK_URL
      || 'http://swpsso.posco.net/idms/U61/jsp/isValidSSO.jsp',
    // 미인증 시 되돌려보낼 SWP 로그인 홈.
    loginUrl: process.env.SWP_SSO_LOGIN_URL || 'http://swp.posco.net',
    // isValidSSO 응답(콤마 구분)의 필드 인덱스(0-based) — 현장에서 raw 로그 확인 후
    // 재빌드 없이 env 로만 조정 가능. 기본값은 "2-1. (SWP) 사용자 정보" 표 순서.
    idxId: parseInt(process.env.SWP_IDX_ID || '0', 10),                   // iv-user (ID)
    idxEmpno: parseInt(process.env.SWP_IDX_EMPNO || '1', 10),            // sp_empno (사번)
    idxDisplayName: parseInt(process.env.SWP_IDX_DISPLAYNAME || '8', 10), // displayname (영문성명)
    idxMail: parseInt(process.env.SWP_IDX_MAIL || '9', 10),              // mail (메일주소)
    idxDept: parseInt(process.env.SWP_IDX_DEPT || '4', 10),              // seealso (부서명)
    // mail 이 비어있을 때 enrolledUsers 키/식별용으로 합성할 이메일 도메인.
    emailFallbackDomain: process.env.SWP_EMAIL_FALLBACK_DOMAIN || 'posco.local',
  },
};
