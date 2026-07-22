// 레거시 BPM 엔드포인트 (DB-migration-plan.md §2.5 책임 5).
// AceBase main.js 의 GET /api/definitions/:definition + bpmParser 를 이전.
// 정의를 BPM ProcessDefinition 형식으로 변환하여 반환한다.
import express from 'express';
import { asyncHandler } from './util.js';
import { getData } from './dataStore.js';
import { requesterClaims, canAccessDefinition } from './authz.js';
import { config } from './config.js';

export const legacyRouter = express.Router();

// lodash _.pickBy(obj) 대응 — falsy 값 제거
function pickTruthy(obj) {
  return Object.fromEntries(Object.entries(obj || {}).filter(([, v]) => v));
}

// 모델(elements/relations) → BPM ProcessDefinition 변환
function bpmParser(projectId, model) {
  const elements = pickTruthy(model.elements);
  const relations = pickTruthy(model.relations);
  const childActivities = [];
  const sequenceFlows = [];
  const roles = [];

  for (const key of Object.keys(elements)) {
    const el = elements[key];
    const type = String(el._type || '').split('.').pop();
    el.name = el.name && el.name.length > 0 ? el.name : type;
    delete el.elementView;
    if (String(el._type || '').includes('Role')) roles.push(el);
    else childActivities.push(el);
  }
  for (const key of Object.keys(relations)) {
    delete relations[key].relationView;
    sequenceFlows.push(relations[key]);
  }

  const out = { ...model };
  out.childActivities = childActivities;
  out.sequenceFlows = sequenceFlows;
  out.roles = roles;
  out.name = projectId;
  delete out.relations;
  delete out.elements;
  out._type = 'org.uengine.kernel.ProcessDefinition';
  out.id = projectId;
  return out;
}

// 인가: /data/:db/definitions/{pid} 와 동일 정책을 적용한다.
// 이 엔드포인트는 definitions 본문(최신 모델 전체)을 반환하므로, 인가가 없으면
// /data 에 걸어둔 게이트를 우회해 익명으로 타 사용자 프로젝트를 열람할 수 있다
// (모의해킹 A-005 와 동일 유형). 익명 401 + 소유자/공유 기준 접근 판정.
legacyRouter.get('/api/definitions/:definition', asyncHandler(async (req, res) => {
  const pid = req.params.definition;

  const claims = requesterClaims(req);
  const uid = claims && claims.sub;
  if (!uid) return res.status(401).json({ error: 'authentication required' });
  if (config.approvalEnabled && claims.approved === false) {
    return res.status(403).json({ error: 'approval pending' });
  }
  if (!(await canAccessDefinition(pid, uid, false))) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const info = await getData(`definitions/${pid}/information`);
  if (!info) return res.status(404).json({ error: 'Definition not found' });

  const lastVersion = info.lastVersionName;
  if (!lastVersion) return res.status(404).json({ error: 'Last version not found' });

  const versionValue = await getData(
    `definitions/${pid}/versionLists/${lastVersion}/versionValue`,
  );
  if (!versionValue) return res.status(404).json({ error: 'Version value not found' });

  let lastValue;
  try {
    lastValue = typeof versionValue.value === 'string'
      ? JSON.parse(versionValue.value)
      : versionValue.value;
  } catch (e) {
    return res.status(500).json({ error: `version value 파싱 실패: ${e.message}` });
  }

  res.json(bpmParser(pid, lastValue));
}));
