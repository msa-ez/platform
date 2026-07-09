// users 테이블 접근 — OAuth signin 시 사용자 조회/생성 (DB-migration-plan.md §7.2).
// users 테이블의 email/username 은 value JSONB 에서 추출되는 generated column 이므로,
// value 안에 email/username 키를 반드시 포함해야 한다.
import { query } from '../db.js';
import { generatePushId } from '../pushId.js';
import { onUserCreated } from '../triggers.js';
import { config } from '../config.js';

/** 이메일이 ADMIN_EMAILS 에 포함되는가(대소문자 무시). */
export function isAdminEmail(email) {
  return !!email && config.adminEmails.includes(String(email).toLowerCase());
}

/**
 * 사용자 승인 상태. status 필드가 없는 기존 유저는 'approved'(grandfather)로 취급해
 * 이 기능 도입 전 사용자가 잠기지 않게 한다. 반환값: 'approved' | 'pending' | 'rejected'.
 */
export function resolveStatus(userValue) {
  return (userValue && userValue.status) || 'approved';
}
export function isApproved(userValue) {
  return resolveStatus(userValue) === 'approved';
}

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

/** 특정 status 의 사용자 목록(admin 대기목록 등). */
export async function listUsersByStatus(status) {
  const res = await query(
    "SELECT uid, value FROM users WHERE value->>'status' = $1 ORDER BY value->>'created' DESC",
    [status],
  );
  return res.rows.map((r) => ({ uid: r.uid, ...r.value }));
}

/** 사용자 승인 상태 변경(admin approve/reject). 갱신된 사용자 반환(없으면 null). */
export async function setUserStatus(uid, status) {
  const existing = await getUserByUid(uid);
  if (!existing) return null;
  const value = { ...existing };
  delete value.uid;
  value.status = status;
  if (status === 'approved') value.authorized = value.authorized || 'student';
  value.status_updated_at = new Date().toISOString();
  await query(
    'UPDATE users SET value = $1::jsonb, updated_at = now() WHERE uid = $2',
    [JSON.stringify(value), uid],
  );
  return { uid, ...value };
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

  const admin = isAdminEmail(userInfo.email);

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
    // admin 이메일은 항상 admin + 승인. 그 외는 기존 상태 유지(status 없으면 grandfather).
    if (admin) {
      value.authorized = 'admin';
      value.status = 'approved';
    } else {
      value.authorized = value.authorized || 'student';
      value.status = value.status || 'approved'; // 기존 유저 grandfather
    }
    await query(
      'UPDATE users SET value = $1::jsonb, updated_at = now() WHERE uid = $2',
      [JSON.stringify(value), existing.uid],
    );
    return { uid: existing.uid, ...value };
  }

  // 신규 유저: admin 이메일이면 admin+approved, 승인제 켜져있으면 pending, 아니면 approved.
  const status = admin ? 'approved' : (config.approvalEnabled ? 'pending' : 'approved');
  const uid = generatePushId();
  const value = {
    uid,
    email: userInfo.email || null,
    username: userInfo.username || null,
    display_name: userInfo.name || userInfo.username || null,
    email_verified: userInfo.emailVerified !== false,
    picture: userInfo.picture || null,
    authorized: admin ? 'admin' : 'student',
    status,
    department: (userInfo.raw && userInfo.raw.department) || null, // 관리자 대기목록 표시용
    settings: providerSettings,
    created: now,
    last_signin: now,
  };
  await query(
    'INSERT INTO users (uid, value) VALUES ($1, $2::jsonb)',
    [uid, JSON.stringify(value)],
  );
  // 책임 4-(2): 신규 사용자 → enrolledUsers. 단 pending 은 보류(onUserCreated 내부에서 approved 만 push).
  onUserCreated(value).catch((err) => console.error('[trigger]', err.message));
  return value;
}
