// JWT (HS256) — Node 내장 crypto 로 직접 구현 (외부 의존성 없음).
// AceBase 의 내부 토큰을 대체한다 (DB-migration-plan.md §7.2).
// 보안: HS256 전용, 서명은 timingSafeEqual 로 비교, exp 검사.
import crypto from 'node:crypto';
import { config } from '../config.js';

function b64urlEncode(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}
function b64urlDecode(str) {
  return JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
}

/** payload 를 JWT 로 서명. 기본 만료 7일. */
export function signJwt(payload, { expiresInSec = 604800 } = {}) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const data = `${b64urlEncode(header)}.${b64urlEncode(body)}`;
  const sig = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

/** JWT 검증. 실패 시 throw. 성공 시 payload 반환. */
export function verifyJwt(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const [h, b, sig] = parts;

  const expected = crypto
    .createHmac('sha256', config.jwtSecret)
    .update(`${h}.${b}`)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error('invalid signature');
  }

  const header = b64urlDecode(h);
  if (header.alg !== 'HS256') throw new Error('unsupported alg');

  const body = b64urlDecode(b);
  if (body.exp && body.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('token expired');
  }
  return body;
}
