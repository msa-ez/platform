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
  },
};
