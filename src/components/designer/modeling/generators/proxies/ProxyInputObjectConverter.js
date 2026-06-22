class ProxyInputObjectConverter {
    static toEsProxyInputObject(selectedDraftOptions, userInfo, information, preferedLanguage, fullRequirementsText) {
        if(!selectedDraftOptions) {
            throw new Error("selectedDraftOptions is required")
        }
        if(!userInfo || !userInfo.uid) {
            throw new Error("userInfo.uid is required")
        }
        if(!information || !information.projectId) {
            throw new Error("information.projectId is required")
        }

        const payload = {
            "requestType": "fromDraft",
            "draft": this._toDraft(selectedDraftOptions),
            "ids": {
                "uid": userInfo.uid,
                "projectId": information.projectId
            },
            "preferedLanguage": (preferedLanguage) ? preferedLanguage : "English"
        }

        // 전체 userStory 도 함께 전달 — ES backend 의 노이즈 필터가 BC-chunked 가 아닌
        // 원본 userStory 좌표계 기준으로 markdown 헤더/표/빈 라인 ref 를 drop 하도록.
        // (fromDraft 모드에서는 boundedContextRequirements 만 BC 별로 잘려있고 원본 텍스트가 없음)
        if (fullRequirementsText && typeof fullRequirementsText === 'string' && fullRequirementsText.length > 0) {
            payload.requirements = fullRequirementsText
        }

        return payload
    }

    static _toDraft(selectedDraftOptions) {
        const structures = [];
        const boundedContextRequirements = {};
        const essentialAggregateAttributes = {};
        const essentialEventNames = {};
        const essentialCommandNames = {};
        const essentialReadModelNames = {};
        // BC description 의 라인 번호 → 원본 userStory 라인 번호 매핑.
        // ES backend 의 command/event/policy/readModel worker 가 이 매핑으로 LLM 이 BC-local
        // 좌표로 준 refs 를 원본 userStory 좌표로 변환한다. 이게 비면 refs 가 BC-local 인 채로
        // 원본 좌표(목차 표/헤더 영역)와 충돌해 전부 drop/오매핑됨(역추적 공백의 진짜 원인).
        const boundedContextRequirementIndexMapping = {};

        // selectedDraftOptions의 각 Bounded Context를 순회
        for (const [bcName, bcData] of Object.entries(selectedDraftOptions)) {
            // 1. structures 구성
            const aggregates = [];
            if (bcData.structure && Array.isArray(bcData.structure)) {
                // BC별 essentialAggregateAttributes 초기화
                if (!essentialAggregateAttributes[bcName]) {
                    essentialAggregateAttributes[bcName] = {};
                }

                bcData.structure.forEach(structureItem => {
                    if (structureItem.aggregate) {
                        const aggregate = {
                            aggregateName: structureItem.aggregate.name,
                            aggregateAlias: structureItem.aggregate.alias,
                            enumerations: structureItem.enumerations.map(enumeration => ({
                                name: enumeration.name,
                                alias: enumeration.alias
                            })) || [],
                            valueObjects: structureItem.valueObjects.map(valueObject => ({
                                name: valueObject.name,
                                alias: valueObject.alias,
                                referencedAggregate: valueObject.referencedAggregate || null
                            })) || []
                        };
                        aggregates.push(aggregate);

                        // essentialAggregateAttributes 수집 (BC별 > Aggregate별)
                        if (structureItem.previewAttributes && Array.isArray(structureItem.previewAttributes)) {
                            if (!essentialAggregateAttributes[bcName][structureItem.aggregate.name]) {
                                essentialAggregateAttributes[bcName][structureItem.aggregate.name] = [];
                            }
                            essentialAggregateAttributes[bcName][structureItem.aggregate.name].push(...structureItem.previewAttributes);
                        }
                    }
                });
            }

            structures.push({
                boundedContextName: bcName,
                boundedContextAlias: (bcData.boundedContext && bcData.boundedContext.alias) ? bcData.boundedContext.alias : bcName,
                aggregates: aggregates
            });

            // 2. boundedContextRequirements 수집
            if (bcData.description) {
                boundedContextRequirements[bcName] = bcData.description;
            }

            // 2-1. boundedContextRequirementIndexMapping 수집 (descLine → 원본 global line)
            // requirements.traceMap 구조: { "<descLine>": { refs: [[[globalLine, col], [globalLine, col]]], isDirectMatching } }
            const _tm = bcData.boundedContext && bcData.boundedContext.requirements && bcData.boundedContext.requirements.traceMap;
            if (_tm && typeof _tm === 'object') {
                const idxMap = {};
                for (const descLineKey of Object.keys(_tm)) {
                    const dl = parseInt(descLineKey, 10);
                    if (!Number.isFinite(dl)) continue;
                    const info = _tm[descLineKey];
                    let g = null;
                    try {
                        if (info && Array.isArray(info.refs) && info.refs[0] && Array.isArray(info.refs[0][0])) {
                            g = info.refs[0][0][0]; // 첫 ref 의 start global line
                        }
                    } catch (e) { /* skip */ }
                    if (typeof g === 'number' && Number.isFinite(g)) idxMap[dl] = g;
                }
                if (Object.keys(idxMap).length > 0) {
                    boundedContextRequirementIndexMapping[bcName] = idxMap;
                }
            }

            // 3. essentialEventNames 수집 (이벤트 파싱)
            if (bcData.boundedContext && bcData.boundedContext.requirements && bcData.boundedContext.requirements.event) {
                try {
                    const eventNames = [];
                    const eventNameMatches = bcData.boundedContext.requirements.event.matchAll(/"name"\s*:\s*"([^"]+)"/g);
                    for (const match of eventNameMatches) {
                        if (match[1] && !eventNames.includes(match[1])) {
                            eventNames.push(match[1]);
                        }
                    }
                    if (eventNames.length > 0) {
                        essentialEventNames[bcName] = eventNames;
                    }
                } catch (e) {
                    console.error(`Failed to parse events for bounded context '${bcName}':`, e);
                }
            }

            // 4. essentialCommandNames 수집
            if (bcData.boundedContext && bcData.boundedContext.requirements && bcData.boundedContext.requirements.commandNames && Array.isArray(bcData.boundedContext.requirements.commandNames)) {
                essentialCommandNames[bcName] = bcData.boundedContext.requirements.commandNames;
            }

            // 5. essentialReadModelNames 수집
            if (bcData.boundedContext && bcData.boundedContext.requirements && bcData.boundedContext.requirements.readModelNames && Array.isArray(bcData.boundedContext.requirements.readModelNames)) {
                essentialReadModelNames[bcName] = bcData.boundedContext.requirements.readModelNames;
            }
        }

        return {
            structures: structures,
            metadatas: {
                boundedContextRequirements: boundedContextRequirements,
                boundedContextRequirementIndexMapping: boundedContextRequirementIndexMapping
            },
            additionalRequests: {
                essentialAggregateAttributes: essentialAggregateAttributes,
                essentialEventNames: essentialEventNames,
                essentialCommandNames: essentialCommandNames,
                essentialReadModelNames: essentialReadModelNames
            }
        };
    }
}

module.exports = ProxyInputObjectConverter;
