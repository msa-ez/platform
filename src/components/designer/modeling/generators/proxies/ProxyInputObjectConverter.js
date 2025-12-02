class ProxyInputObjectConverter {
    static toEsProxyInputObject(selectedDraftOptions, userInfo, information, preferedLanguage) {
        if(!selectedDraftOptions) {
            throw new Error("selectedDraftOptions is required")
        }
        if(!userInfo || !userInfo.uid) {
            throw new Error("userInfo.uid is required")
        }
        if(!information || !information.projectId) {
            throw new Error("information.projectId is required")
        }

        return {
            "requestType": "fromDraft",
            "draft": this._toDraft(selectedDraftOptions),
            "ids": {
                "uid": userInfo.uid,
                "projectId": information.projectId
            },
            "preferedLanguage": (preferedLanguage) ? preferedLanguage : "English"
        }
    }

    static _toDraft(selectedDraftOptions) {
        const structures = [];
        const boundedContextRequirements = {};
        const essentialAggregateAttributes = {};
        const essentialEventNames = {};
        const essentialCommandNames = {};
        const essentialReadModelNames = {};

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
                boundedContextRequirements: boundedContextRequirements
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
