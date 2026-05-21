// 반응형 트리거 — cross-collection 동기화 (DB-migration-plan.md §2.4 책임 4).
// AceBase main.js 의 initializeListeners() 를 게이트웨이 application-level 로 이전.
//
// 루프 방지: 트리거의 cascade write 는 dataStore 를 직접 호출한다.
// dataApi 만 트리거를 호출하므로, cascade write 는 트리거를 재호출하지 않는다.
import { getData, setData, updateData, deleteData } from './dataStore.js';

// information 에서 목록 항목으로 추릴 필드
function pickListFields(pid, info) {
  return {
    projectId: pid,
    img: info.img ?? null,
    projectName: info.projectName ?? null,
    lastModifiedTimeStamp: info.lastModifiedTimeStamp ?? null,
    createdTimeStamp: info.createdTimeStamp ?? null,
    authorEmail: info.authorEmail ?? null,
    author: info.author ?? null,
    authorProfile: info.authorProfile ?? null,
    date: info.date ?? null,
    comment: info.comment ?? null,
    type: info.type ?? null,
  };
}

// 책임 4-(1): definitions/{pid}/information 변경 → userLists 동기화
export async function onDefinitionChanged(pid) {
  const info = await getData(`definitions/${pid}/information`);
  if (!info || typeof info !== 'object') return;
  const item = pickListFields(pid, info);

  // 작성자의 'mine' 목록
  if (info.author) {
    await updateData(`userLists/${info.author}/mine/${pid}`, item);
  }

  // permissions 기반 'share' 목록
  if (info.permissions && typeof info.permissions === 'object') {
    for (const [uid, allowed] of Object.entries(info.permissions)) {
      if (allowed) {
        await setData(`userLists/${uid}/share/${pid}`, item);
        if (uid === 'everyone' && info.type) {
          await setData(`userLists/everyone/share_${info.type}/${pid}`, item);
          await setData(`userLists/everyone/share_first/${pid}`, item);
        }
      } else {
        await deleteData(`userLists/${uid}/share/${pid}`);
      }
    }
  }
}

// 책임 4-(3): userLists/{uid}/mine/{pid} 제거 → 정의 cascade 삭제
export async function onMineRemoved(uid, pid) {
  // 정의 삭제 전에 권한 보유자 share 에 deleted 마킹
  const info = await getData(`definitions/${pid}/information`);
  if (info && info.permissions && typeof info.permissions === 'object') {
    for (const [puid, allowed] of Object.entries(info.permissions)) {
      if (allowed && puid !== 'everyone') {
        await updateData(`userLists/${puid}/share/${pid}`, { state: 'deleted' });
      }
    }
  }
  // 정의 및 public 목록 정리
  await deleteData(`definitions/${pid}`);
  await deleteData(`userLists/everyone/share_es/${pid}`);
  await deleteData(`userLists/everyone/share_first/${pid}`);
}

// 책임 4-(2): 신규 사용자 → enrolledUsers 자동 생성
export async function onUserCreated(user) {
  if (!user || !user.email) return;
  const convertEmail = String(user.email).replace(/\./g, '_');
  await setData(`enrolledUsers/${convertEmail}`, { ...user });
}

// ── dataApi 가 write/delete 후 호출하는 디스패처 ─────────────────────
function segments(path) {
  return String(path || '').split('/').filter((s) => s !== '');
}

/** write(PUT/PATCH) 후 호출. definitions 의 information 변경만 트리거. */
export async function afterWrite(path) {
  const segs = segments(path);
  if (segs[0] === 'definitions' && segs.length >= 2) {
    // definitions/{pid} 전체 또는 definitions/{pid}/information[/...] 만 대상.
    // queue/snapshotLists/versionLists 변경은 제외 (협업 큐 등 고빈도).
    const sub = segs[2];
    if (sub === undefined || sub === 'information') {
      await onDefinitionChanged(segs[1]);
    }
  }
}

/** delete 후 호출. userLists/{uid}/mine/{pid} 제거 → cascade. */
export async function afterDelete(path) {
  const segs = segments(path);
  if (segs[0] === 'userLists' && segs[2] === 'mine' && segs.length === 4) {
    await onMineRemoved(segs[1], segs[3]);
  }
}
