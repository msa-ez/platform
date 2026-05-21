// users 테이블 접근 — OAuth signin 시 사용자 조회/생성 (DB-migration-plan.md §7.2).
// users 테이블의 email/username 은 value JSONB 에서 추출되는 generated column 이므로,
// value 안에 email/username 키를 반드시 포함해야 한다.
import { query } from '../db.js';
import { generatePushId } from '../pushId.js';
import { onUserCreated } from '../triggers.js';

/** email 로 사용자 조회. */
export async function findUserByEmail(email) {
  if (!email) return null;
  const res = await query('SELECT uid, value FROM users WHERE email = $1', [email]);
  return res.rows.length ? { uid: res.rows[0].uid, ...res.rows[0].value } : null;
}

/** uid 로 사용자 조회. */
export async function getUserByUid(uid) {
  const res = await query('SELECT uid, value FROM users WHERE uid = $1', [uid]);
  return res.rows.length ? { uid: res.rows[0].uid, ...res.rows[0].value } : null;
}

/**
 * OAuth 로그인 사용자 upsert.
 * 기존 사용자(email 일치)면 갱신, 없으면 신규 생성.
 * @returns {{uid, ...userValue}}
 */
export async function upsertOAuthUser(provider, userInfo) {
  const now = new Date().toISOString();
  const providerSettings = {
    [`${provider}_id`]: userInfo.id,
    [`${provider}_sub`]: userInfo.id,
    [`${provider}_email`]: userInfo.email,
  };

  const existing = await findUserByEmail(userInfo.email);
  if (existing) {
    const value = { ...existing };
    delete value.uid;
    value.email = value.email || userInfo.email;
    value.username = value.username || userInfo.username;
    value.display_name = value.display_name || userInfo.name;
    value.picture = userInfo.picture || value.picture || null;
    value.last_signin = now;
    value.settings = { ...(value.settings || {}), ...providerSettings };
    await query(
      'UPDATE users SET value = $1::jsonb, updated_at = now() WHERE uid = $2',
      [JSON.stringify(value), existing.uid],
    );
    return { uid: existing.uid, ...value };
  }

  const uid = generatePushId();
  const value = {
    uid,
    email: userInfo.email || null,
    username: userInfo.username || null,
    display_name: userInfo.name || userInfo.username || null,
    email_verified: userInfo.emailVerified !== false,
    picture: userInfo.picture || null,
    settings: providerSettings,
    created: now,
    last_signin: now,
  };
  await query(
    'INSERT INTO users (uid, value) VALUES ($1, $2::jsonb)',
    [uid, JSON.stringify(value)],
  );
  // 책임 4-(2): 신규 사용자 → enrolledUsers (fire-and-forget)
  onUserCreated(value).catch((err) => console.error('[trigger]', err.message));
  return value;
}
