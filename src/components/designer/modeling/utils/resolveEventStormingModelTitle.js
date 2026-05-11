/**
 * definitions/{modelId}/information 및 스냅샷에서 문서/보내기용 표시 제목을 고릅니다.
 * projectName은 Git/영문 슬러그용으로 untitled인 경우가 많아 editProjectName·prompt 등을 우선합니다.
 */

const PLACEHOLDER = /^untitled?$/i;

function isMeaningfulTitle(value) {
    if (value == null) return false;
    const s = String(value).trim();
    if (!s) return false;
    return !PLACEHOLDER.test(s);
}

/**
 * @param {object|null|undefined} information - list/putObject로 얻은 information 노드
 * @param {object|null|undefined} models - 스냅샷 { elements, relations, ... }
 * @param {string|null|undefined} projectLevelFallback - 연결 프로젝트의 prompt 등 (모델 information에 제목이 없을 때)
 * @returns {string}
 */
export function resolveEventStormingModelTitle(information, models, projectLevelFallback) {
    if (!information || typeof information !== 'object') {
        if (isMeaningfulTitle(projectLevelFallback)) return String(projectLevelFallback).trim();
        return 'Untitled';
    }
    const candidates = [
        information.editProjectName,
        information.prompt,
        information.title,
        models && typeof models === 'object' ? models.projectName : null,
        information.projectName
    ];
    for (const c of candidates) {
        if (isMeaningfulTitle(c)) return String(c).trim();
    }
    const fallback = information.projectName || information.editProjectName || information.prompt;
    if (fallback != null && String(fallback).trim() !== '') {
        return String(fallback).trim();
    }
    if (isMeaningfulTitle(projectLevelFallback)) return String(projectLevelFallback).trim();
    return 'Untitled';
}

/**
 * AceBase 등에서 information이 배열/조각 형태로 올 때 평탄화
 * @param {*} raw
 * @returns {object|null}
 */
export function normalizeDefinitionInformation(raw) {
    if (raw == null) return null;
    if (Array.isArray(raw)) {
        return raw.reduce((acc, item) => {
            if (item && typeof item === 'object') {
                return { ...acc, ...item };
            }
            return acc;
        }, {});
    }
    if (typeof raw !== 'object') return null;
    return raw;
}
