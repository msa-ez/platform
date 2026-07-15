// AI 생성 Job 에 "누가(uid) / 어떤 definition(projectId) 에서 요청했는지" 를 기록하기 위한
// 경량 컨텍스트(모듈 싱글톤).
//
// - ESDialoger 등 오케스트레이터가 현재 작업 중인 definition(projectId) 을 publish 한다.
// - StorageBaseAbstract.setObject 가 Job 최초 생성 write(db://jobs/{type}/{jobId}) 를
//   감지해 inputs.ids = { uid, projectId } 로 스탬프한다.
// uid 는 항상 localStorage 에서 읽으므로 별도 publish 가 필요 없다.

let _projectId = null;

/** 현재 작업 중인 definition(projectId) 을 등록. */
export function setJobRequestorProjectId(projectId) {
  if (projectId) _projectId = String(projectId);
}

/** Job 에 기록할 요청자 식별자 { uid, projectId }. uid 는 localStorage 폴백. */
export function getJobRequestorIds() {
  let uid = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      uid = window.localStorage.getItem('uid');
    }
  } catch (e) { /* noop */ }
  return { uid: uid || null, projectId: _projectId || null };
}
