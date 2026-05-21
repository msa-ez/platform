// PostgreSQL LISTEN/NOTIFY 수신기.
// 'msaez_change' 채널을 LISTEN 하여 changeBus 로 변경 이벤트를 흘려보낸다.
import pg from 'pg';
import { EventEmitter } from 'node:events';
import { config } from '../config.js';

// 변경 이벤트 버스. payload: { table, op, keys }
export const changeBus = new EventEmitter();
changeBus.setMaxListeners(0);

let reconnectTimer = null;

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 2000);
}

async function connect() {
  const client = new pg.Client(config.pg);
  client.on('error', (e) => {
    console.error('[notify] LISTEN 커넥션 오류, 재연결 예약:', e.message);
    scheduleReconnect();
  });
  client.on('end', () => {
    console.error('[notify] LISTEN 커넥션 종료, 재연결 예약');
    scheduleReconnect();
  });
  client.on('notification', (msg) => {
    try {
      changeBus.emit('change', JSON.parse(msg.payload));
    } catch (e) {
      console.error('[notify] payload 파싱 실패:', e.message);
    }
  });
  try {
    await client.connect();
    await client.query('LISTEN msaez_change');
    console.log('[notify] LISTEN msaez_change 시작');
  } catch (e) {
    console.error('[notify] 연결 실패, 재시도:', e.message);
    scheduleReconnect();
  }
}

/** LISTEN 수신기 시작. */
export async function startChangeListener() {
  await connect();
}
