// msaez-data-gateway 진입점 (v1.0.30).
// 현 단계: Data API. OAuth / watch / 트리거 / 레거시는 후속 단계에서 추가.
import http from 'node:http';
import express from 'express';
import { config } from './config.js';
import { pool } from './db.js';
import { dataRouter } from './dataApi.js';
import { oauthRouter } from './oauth/routes.js';
import { legacyRouter } from './legacy.js';
import { attachWatchServer } from './watch/ws.js';
import { startChangeListener } from './watch/notify.js';

const app = express();
app.use(express.json({ limit: '50mb', strict: false }));

// 헬스 체크
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'db_unavailable', error: err.message });
  }
});

// OAuth / Auth
app.use(oauthRouter);

// 레거시 BPM 엔드포인트 (책임 5)
app.use(legacyRouter);

// Data API
app.use('/data', dataRouter);

const server = http.createServer(app);

// 실시간 watch — WebSocket (/watch) + PostgreSQL LISTEN/NOTIFY
attachWatchServer(server);

server.listen(config.port, () => {
  console.log(`[gateway] msaez-data-gateway listening on :${config.port} ` +
    `(db ${config.pg.host}:${config.pg.port}/${config.pg.database})`);
  startChangeListener().catch((e) => {
    console.error('[notify] 시작 실패:', e.message);
  });
});

function shutdown() {
  console.log('[gateway] 종료 중...');
  server.close(() => {
    pool.end().then(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
