// 레거시 BPM 엔드포인트 (DB-migration-plan.md §2.5 책임 5).
// AceBase main.js 의 GET /api/definitions/:definition + bpmParser 를 이전.
// 정의를 BPM ProcessDefinition 형식으로 변환하여 반환한다.
import express from 'express';
import { asyncHandler } from './util.js';
import { getData } from './dataStore.js';

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

legacyRouter.get('/api/definitions/:definition', asyncHandler(async (req, res) => {
  const pid = req.params.definition;

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
