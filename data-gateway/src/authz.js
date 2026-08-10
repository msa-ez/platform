// Data API 인가(authorization) 미들웨어.
//
// 배경(모의해킹 2026-06 A-005/A-007): 초기 게이트웨이는 /data/:db/* 에 인증·인가가
// 전혀 없어 익명 요청조차 임의 사용자의 definitions/userLists/enrolledUsers/jobs 를
// 열거·조회·변조할 수 있었다(BOLA/IDOR + 인증 부재). 백엔드(project/ES generator)는
// 게이트웨이가 아니라 postgres 에 직결하므로 이 미들웨어는 "브라우저 트래픽"에만 적용되어
// 백엔드에는 영향이 없다.
//
// 정책:
//   - 쓰기(PUT/PATCH/POST/DELETE)는 항상 유효한 JWT 필요(익명 쓰기 금지).
//   - 컬렉션 통째 열거(definitions/jobs/requestedJobs) 금지 — 앱은 목록을 Algolia 로
//     조회하며 이 컬렉션들을 API 로 통째 리스트하지 않는다.
//   - user_lists 는 요청자 uid 로 스코프(타인 목록 접근 금지).
//   - definitions/{pid} 행은 소유자(author) / 공유(permissions.everyone / permissions[uid])
//     기준으로 접근 판정. 공유(everyone)면 비로그인도 read 허용(공유 URL 열람 보존).
//   - 민감 kv 루트 열거 금지, 민감 서브트리는 인증 필요.
import { verifyJwt } from './oauth/jwt.js';
import { routePath } from './pathRouter.js';
import { getData } from './dataStore.js';
import { config } from './config.js';

// 통째 열거·루트 접근을 막을 민감 최상위 컬렉션.
const SENSITIVE_ROOTS = [
  'definitions', 'jobs', 'requestedJobs',
  'userLists', 'enrolledUsers', 'users',
];

/** 요청의 Bearer JWT 를 검증해 클레임을 반환. 없거나 무효면 null(익명). */
export function requesterClaims(req) {
  const h = req.headers['authorization'] || req.headers['Authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(String(h));
  if (!m) return null;
  try {
    return verifyJwt(m[1]) || null;
  } catch (e) {
    return null;
  }
}

/**
 * definitions/{pid} 접근 가능 여부.
 * author 가 아직 없으면(신규 생성) 허용 — 최초 생성 흐름 보존(쓰기 인증은 상위에서 이미 확인).
 */
export async function canAccessDefinition(pid, uid, isWrite, _depth = 0) {
  // image(수백 KB base64) 로딩을 피하려 author/permissions 만 좁혀서 조회.
  let author = null;
  let perms = null;
  try {
    author = await getData(`definitions/${pid}/information/author`);
    perms = await getData(`definitions/${pid}/information/permissions`);
  } catch (e) {
    // 조회 실패 시 보수적으로 소유자만 통과(=uid 있어야). 아래 로직에서 처리.
    console.warn('[authz] definition 메타 조회 실패:', e && e.message);
  }
  perms = perms && typeof perms === 'object' ? perms : {};

  // 신규(아직 author 없음): 생성 허용.
  if (!author) return true;
  if (uid && author === uid) return true;

  const everyone = perms.everyone;
  if (everyone) {
    // 공유(전체): read 는 익명 포함 허용, write 는 (상위에서) 인증된 사용자만 도달.
    return true;
  }
  if (uid && perms[uid]) {
    return isWrite ? !!perms[uid].write : true;
  }

  // 파생 모델(ESD 등)은 자체 권한이 없으면 연결된 부모 프로젝트(associatedProject)의
  // 권한을 따른다. ESD 는 definitions/{creator}_es_{uuid} 로 저장되고 author 가 만든
  // 사람이며 부모 권한을 상속하지 않는다. A-005/A-007 로 definition 직접 접근을 막은 뒤,
  // 공유 프로젝트 안에서 타 사용자가 만든 ESD 를 협업자가 못 보는 회귀가 생겨 이를 복구한다.
  // ★ 부모 프로젝트에 접근 가능한 사용자에게만 허용하므로 무단 접근은 여전히 차단된다.
  // associatedProject 는 부모 프로젝트의 전체 definition 키({owner}_project_{id})를 담는다.
  // 무한 재귀 방지를 위해 1 hop 만 따라간다.
  if (_depth === 0) {
    let associated = null;
    try {
      associated = await getData(`definitions/${pid}/information/associatedProject`);
    } catch (e) {
      // 무시 — associatedProject 없으면 접근 불가로 확정.
    }
    if (associated && typeof associated === 'string' && associated !== pid) {
      return canAccessDefinition(associated, uid, isWrite, _depth + 1);
    }
  }
  return false;
}

export function dataAuthz() {
  return async (req, res, next) => {
    try {
      const path = req.params[0] || '';
      const isWrite = req.method !== 'GET';
      const claims = requesterClaims(req);
      const uid = claims && claims.sub;
      const route = routePath(path);

      // 익명(비로그인) 전면 차단 — 폐쇄망 정책상 모든 /data 접근은 SSO 인증 필요(공개 프로젝트 포함).
      // 프론트에서도 로그인 유도하지만, API 직접 호출(모의해킹 A-005/A-007)을 막기 위해
      // 게이트웨이에서도 강제한다. 이하 규칙은 "인증된 사용자 간" BOLA(타인 소유 자원 접근) 차단.
      if (!uid) {
        return res.status(401).json({ error: 'authentication required' });
      }

      // 가입 승인 전(pending/rejected) 유저 전면 차단 — 승인 전까지 모든 기능 사용 불가.
      // 클레임 approved 로만 판정(hot path 에 DB 조회 없음). 구 토큰(approved 없음)은
      // grandfather 로 통과. 승인되면 /auth/status 가 새 토큰을 재발급한다.
      if (config.approvalEnabled && claims.approved === false) {
        return res.status(403).json({ error: 'approval pending' });
      }

      // 0) userLists — 본인/everyone 외 타 사용자 리스트 접근 통제 (모의해킹 A-007).
      //   재점검에서 userLists 로 타 사용자 uid 를 확보 → 그 uid 의 mine/share 를 읽어
      //   비공개 프로젝트 목록까지 열람하는 체인이 남아 있었다(루트 열거는 이미 차단됨).
      //   - 앱은 항상 "본인 uid + everyone" 만 읽는다(프론트 확인). → 읽기는 그 둘만 허용.
      //   - 공유는 대상 사용자의 /share 로 mirror-write 하므로, 쓰기는 타 사용자라도
      //     /share 서브패스에 한해 허용(그 외 남의 /mine 등 쓰기는 거부).
      {
        const uls = String(path).split('/').filter(Boolean);
        if (uls[0] === 'userLists') {
          const targetUid = uls[1];
          if (!targetUid) {
            return res.status(403).json({ error: 'enumeration not allowed' }); // 루트 열거
          }
          if (targetUid !== 'everyone' && targetUid !== uid) {
            if (!isWrite) return res.status(403).json({ error: 'forbidden' });
            if (uls[2] !== 'share') return res.status(403).json({ error: 'forbidden' });
          }
          return next();
        }
      }

      // 1) 컬렉션 열거
      if (route.kind === 'collection') {
        if (route.table === 'definitions' || route.table === 'jobs' || route.table === 'requested_jobs') {
          return res.status(403).json({ error: 'collection enumeration not allowed' });
        }
        if (route.table === 'user_lists') {
          // 'everyone' 은 공개 인덱스(공유/Public 목록) — 읽기는 누구나, 쓰기는 인증(위 글로벌에서 확인).
          // 그 외 개인 리스트는 인증 필요. 앱은 공유 시 "대상 사용자/everyone 인덱스에 미러링(write)"
          // 하고, Public/Share 탭은 everyone·본인 리스트만 읽으므로 인증만 강제한다.
          // (익명의 userLists 루트 통째 열거(A-007)는 kv 루트 차단으로 이미 방지됨)
          const listUid = route.filters && route.filters.uid;
          if (listUid === 'everyone') return next();
          if (!uid) return res.status(401).json({ error: 'authentication required' });
          return next();
        }
        // definition_queue / definition_snapshots (특정 pid 로 스코프):
        //  - 인증 사용자: 허용(편집 흐름, 소유권 조회 생략해 고빈도 저비용 유지)
        //  - 익명: 부모 definition 이 공유(everyone)면 read 허용(비로그인 공유 URL 열람 보존)
        if (route.table === 'definition_queue' || route.table === 'definition_snapshots') {
          if (uid) return next();
          const pid = route.filters && route.filters.project_id;
          if (await canAccessDefinition(pid, null, false)) return next();
          return res.status(401).json({ error: 'authentication required' });
        }
        if (!uid) return res.status(401).json({ error: 'authentication required' });
        return next();
      }

      // 2) kv_store
      if (route.kind === 'kv') {
        const p = String(route.path || '');
        const root = p.split('/')[0];
        if (SENSITIVE_ROOTS.includes(p)) {
          // 정확히 민감 루트 = 서브트리 통째 열거.
          return res.status(403).json({ error: 'enumeration not allowed' });
        }
        if (SENSITIVE_ROOTS.includes(root)) {
          if (!uid) return res.status(401).json({ error: 'authentication required' });
          return next();
        }
        // 그 외 kv: 쓰기는 위에서 인증 확인됨, 읽기는 허용.
        return next();
      }

      // 3) row 접근
      if (route.table === 'definitions') {
        const pid = route.pk.project_id;
        const ok = await canAccessDefinition(pid, uid, isWrite);
        if (!ok) return res.status(uid ? 403 : 401).json({ error: 'forbidden' });
        return next();
      }
      if (route.table === 'user_lists') {
        // 컬렉션 규칙과 동일: everyone 공개 인덱스는 읽기 허용, 그 외는 인증 필요.
        // (공유 미러링이 타 사용자 share 리스트에 write 하므로 소유 강제는 하지 않는다)
        const listUid = route.pk.uid;
        if (listUid === 'everyone') return next();
        if (!uid) return res.status(401).json({ error: 'authentication required' });
        return next();
      }
      if (route.table === 'users') {
        // 쓰기는 본인만, 읽기는 인증된 사용자(프로필 조회) 허용 — 익명 스크래핑 차단.
        if (!uid) return res.status(401).json({ error: 'authentication required' });
        if (isWrite && route.pk.uid !== uid) return res.status(403).json({ error: 'forbidden' });
        return next();
      }
      if (route.table === 'jobs' || route.table === 'requested_jobs') {
        if (!uid) return res.status(401).json({ error: 'authentication required' });
        return next();
      }
      if (route.table === 'definition_queue' || route.table === 'definition_snapshots') {
        // 인증 사용자는 허용(편집, 저비용). 익명은 부모 definition 이 공유(everyone)인 read 만 허용.
        if (uid) return next();
        if (isWrite) return res.status(401).json({ error: 'authentication required' });
        const pid = route.pk && route.pk.project_id;
        if (await canAccessDefinition(pid, null, false)) return next();
        return res.status(401).json({ error: 'authentication required' });
      }

      // 기타(catch-all): 인증 필요.
      if (!uid) return res.status(401).json({ error: 'authentication required' });
      return next();
    } catch (e) {
      console.error('[authz]', e.message);
      return res.status(500).json({ error: 'authorization error' });
    }
  };
}
