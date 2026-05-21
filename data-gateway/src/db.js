// PostgreSQL 커넥션 풀
import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool(config.pg);

pool.on('error', (err) => {
  console.error('[db] 유휴 커넥션 오류:', err.message);
});

/** 단순 질의 헬퍼. */
export function query(text, params) {
  return pool.query(text, params);
}

/**
 * 트랜잭션 헬퍼 — fn(client) 실행을 BEGIN/COMMIT 으로 감싼다.
 * fn 안에서 예외 발생 시 ROLLBACK.
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
