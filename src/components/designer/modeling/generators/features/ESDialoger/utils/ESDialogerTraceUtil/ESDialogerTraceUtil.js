const { DataValidationUtil, RefsTraceUtil } = require("../../../../utils");

class ESDialogerTraceUtil {
    static extractTraceInfoFromDraftOptions(draftOptions, projectInfo) {
        // 1차: 백엔드 sanitize 가 실패해 string-phrase refs (예: [[3, "create"], [3, "course"]])
        // 가 남아있는 경우 schema 검증이 throw 해 ES 생성이 통째로 죽는다 (실제 사용자 케이스
        // previewAttributes[k].refs[0][0][1] 이 string).
        // → 검증 전에 모든 refs 의 col 이 number 가 아니면 강제 정수화 (col=1) 하거나 drop.
        draftOptions = this.__coerceStringRefsToNumeric(draftOptions)

        this.__validateExtractTraceInfoFromDraftOptionsParams({
            draftOptions,
            projectInfo
        })
        // 유효하지 않은 refs (라인/열 범위 초과, 빈 줄 가리키는 ref) 를 clamp 또는 drop
        // — 이전 구현은 로그만 찍고 실제 정리는 안 해서 잘못된 ref 가 그대로 ES 로 흘러갔음.
        draftOptions = this.__sanitizeRefsAgainstSourceText(draftOptions, projectInfo)


        const result = structuredClone(draftOptions);
        result.traceInfo = {
            previewAttributes: {},
            structureRefs: {},
            idValueObjectRefs: {},
            traceMaps: {},
            commandRefs: {},
            userInputs: projectInfo
        };
        
        Object.keys(result).forEach(boundedContextName => {
            if (boundedContextName === 'traceInfo') {
                return;
            }

            const boundedContext = result[boundedContextName];
            result.traceInfo.previewAttributes[boundedContextName] = {};
            result.traceInfo.structureRefs[boundedContextName] = {
                aggregates: {},
                enumerations: {},
                valueObjects: {}
            };
            result.traceInfo.idValueObjectRefs[boundedContextName] = {};
            result.traceInfo.commandRefs[boundedContextName] = {
                commands: {},
                readModels: {}
            }
            
            boundedContext.structure.forEach(structureItem => {
                const aggregateName = structureItem.aggregate.name;
                result.traceInfo.previewAttributes[boundedContextName][aggregateName] = structureItem.previewAttributes;
                structureItem.previewAttributes = structureItem.previewAttributes.map(previewAttribute => previewAttribute.fieldName)

                result.traceInfo.structureRefs[boundedContextName].aggregates[aggregateName] = structureItem.aggregate.refs;
                delete structureItem.aggregate.refs;

                result.traceInfo.idValueObjectRefs[boundedContextName][aggregateName] = {}

                structureItem.enumerations.forEach(enumeration => {
                    result.traceInfo.structureRefs[boundedContextName].enumerations[enumeration.name] = enumeration.refs;
                    delete enumeration.refs;
                })

                structureItem.valueObjects.forEach(valueObject => {
                    if(valueObject.referencedAggregate && valueObject.referencedAggregate.name) {
                        result.traceInfo.idValueObjectRefs[boundedContextName][aggregateName][valueObject.referencedAggregate.name] = valueObject.refs;
                    } else {
                        result.traceInfo.structureRefs[boundedContextName].valueObjects[valueObject.name] = valueObject.refs;
                    }

                    delete valueObject.refs;
                })
            });

            result.traceInfo.traceMaps[boundedContextName] = boundedContext.boundedContext.requirements.traceMap;
            delete boundedContext.boundedContext.requirements.traceMap;

            if(boundedContext.boundedContext.requirements.commandInfos) {
                for(let commandInfo of boundedContext.boundedContext.requirements.commandInfos) {
                    if(!commandInfo.name || !commandInfo.refs) continue
                    result.traceInfo.commandRefs[boundedContextName].commands[commandInfo.name] = commandInfo.refs
                }
                delete boundedContext.boundedContext.requirements.commandInfos
            }

            if(boundedContext.boundedContext.requirements.readModelInfos) {
                for(let readModel of boundedContext.boundedContext.requirements.readModelInfos) {
                    if(!readModel.name || !readModel.refs) continue
                    result.traceInfo.commandRefs[boundedContextName].readModels[readModel.name] = readModel.refs
                }
                delete boundedContext.boundedContext.requirements.readModelInfos
            }
        });
        
        return result;
    }
    static __validateExtractTraceInfoFromDraftOptionsParams(params) {
        const schema = {
            type: 'object',
            properties: {
                draftOptions: {
                    type: 'object',
                    required: true,
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            structure: {
                                type: 'array',
                                required: true,
                                items: {
                                    type: 'object',
                                    properties: {
                                        aggregate: {
                                            type: 'object',
                                            required: true,
                                            properties: {
                                                name: {
                                                    type: 'string',
                                                    required: true,
                                                    minLength: 1
                                                },
                                                refs: {
                                                    type: 'array',
                                                    required: true,
                                                    items: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'array',
                                                            length: 2,
                                                            items: {
                                                                type: 'number'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        enumerations: {
                                            type: 'array',
                                            required: true,
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: {
                                                        type: 'string',
                                                        required: true,
                                                        minLength: 1
                                                    },
                                                    refs: {
                                                        type: 'array',
                                                        required: true,
                                                        items: {
                                                            type: 'array',
                                                            items: {
                                                                type: 'array',
                                                                length: 2,
                                                                items: {
                                                                    type: 'number'
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        valueObjects: {
                                            type: 'array',
                                            required: true,
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: {
                                                        type: 'string',
                                                        required: true,
                                                        minLength: 1
                                                    },
                                                    refs: {
                                                        type: 'array',
                                                        required: true,
                                                        items: {
                                                            type: 'array',
                                                            items: {
                                                                type: 'array',
                                                                length: 2,
                                                                items: {
                                                                    type: 'number'
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        previewAttributes: {
                                            type: 'array',
                                            required: true,
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    fieldName: {
                                                        type: 'string',
                                                        required: true,
                                                        minLength: 1
                                                    },
                                                    refs: {
                                                        type: 'array',
                                                        required: true,
                                                        items: {
                                                            type: 'array',
                                                            items: {
                                                                type: 'array',
                                                                length: 2,
                                                                items: {
                                                                    type: 'number'
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                            boundedContext: {
                                type: 'object',
                                required: true,
                                properties: {
                                    requirements: {
                                        type: 'object',
                                        required: true,
                                        properties: {
                                            traceMap: {
                                                type: 'object',
                                                required: true,
                                                additionalProperties: {
                                                    type: 'object',
                                                    properties: {
                                                        refs: {
                                                            type: 'array',
                                                            required: true,
                                                            items: {
                                                                type: 'array',
                                                                items: {
                                                                    type: 'array',
                                                                    length: 2,
                                                                    items: {
                                                                        type: 'number'
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        isDirectMatching: {
                                                            type: 'boolean',
                                                            required: true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                projectInfo: {
                    type: 'object',
                    required: true,
                    additionalProperties: {
                        type: 'string'
                    }
                }
            }
        };

        if(!DataValidationUtil.isValidData(params, schema)) {
            throw new Error("Invalid params : " + JSON.stringify(params));
        }
    }
    /**
     * 백엔드 sanitize 가 실패해 LLM 의 원본 phrase-string refs 가
     * draftOptions 에 남아있는 경우를 방어. col 위치에 string 이 있으면
     * 정수로 강제 (col=1) 하거나 구조가 깨진 ref 는 drop.
     * 이 단계가 없으면 그 아래 __validateExtractTraceInfoFromDraftOptionsParams 가
     * "must be number but got string" 으로 throw 해서 ES 생성 자체가 실패한다.
     */
    static __coerceStringRefsToNumeric(draftOptions) {
        let coerced = 0
        let dropped = 0
        const result = RefsTraceUtil.searchRefsArrayRecursively(draftOptions, (refsArray) => {
            const out = []
            for (const r of refsArray) {
                if (!Array.isArray(r) || r.length !== 2 ||
                    !Array.isArray(r[0]) || r[0].length !== 2 ||
                    !Array.isArray(r[1]) || r[1].length !== 2) {
                    dropped++
                    continue
                }
                const sLine = r[0][0]
                const sColRaw = r[0][1]
                const eLine = r[1][0]
                const eColRaw = r[1][1]
                if (typeof sLine !== 'number' || typeof eLine !== 'number') {
                    dropped++
                    continue
                }
                const sCol = typeof sColRaw === 'number' ? sColRaw : 1
                const eCol = typeof eColRaw === 'number' ? eColRaw : Math.max(sCol, 1)
                if (typeof sColRaw !== 'number' || typeof eColRaw !== 'number') {
                    coerced++
                }
                out.push([[sLine, sCol], [eLine, eCol]])
            }
            return out
        })
        if (coerced > 0 || dropped > 0) {
            console.warn(`[ESDialogerTraceUtil] string refs coerced=${coerced}, dropped=${dropped} (백엔드 sanitize 실패 잔존)`)
        }
        return result
    }

    /**
     * 모든 refs 를 source 텍스트(userStory + ddl) 좌표계에서 검증/정리.
     * - 라인/열 범위 초과: 가능한 범위로 clamp
     * - 빈 줄을 가리키는 ref: drop (highlight 대상이 없음)
     * - 구조적으로 잘못된 ref: drop
     * 정리된 결과를 반환 (입력은 변경하지 않음).
     */
    static __sanitizeRefsAgainstSourceText(draftOptions, projectInfo) {
        const userText = [projectInfo.userStory, projectInfo.ddl].join("\n");
        const userTextLines = userText.split("\n");
        const totalLines = userTextLines.length;

        let clampedCount = 0;
        let droppedCount = 0;

        const cleaned = RefsTraceUtil.searchRefsArrayRecursively(draftOptions, (refsArray) => {
            const validRefs = [];

            for (const refArray of refsArray) {
                try {
                    if (!Array.isArray(refArray) || refArray.length !== 2 ||
                        !Array.isArray(refArray[0]) || refArray[0].length !== 2 ||
                        !Array.isArray(refArray[1]) || refArray[1].length !== 2) {
                        droppedCount++;
                        continue;
                    }

                    const sLine = refArray[0][0];
                    const sCol  = refArray[0][1];
                    const eLine = refArray[1][0];
                    const eCol  = refArray[1][1];

                    // 라인이 텍스트 범위를 완전히 벗어남 → drop
                    if (typeof sLine !== 'number' || typeof eLine !== 'number' ||
                        sLine < 1 || eLine < 1 || sLine > totalLines || eLine > totalLines) {
                        droppedCount++;
                        continue;
                    }

                    const sLen = (userTextLines[sLine - 1] || '').length;
                    const eLen = (userTextLines[eLine - 1] || '').length;

                    // 시작·끝 라인이 모두 빈 줄 → highlight 의미 없음 → drop
                    if (sLen === 0 && eLen === 0) {
                        droppedCount++;
                        continue;
                    }

                    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
                    const ns = (typeof sCol === 'number') ? sCol : 1;
                    const ne = (typeof eCol === 'number') ? eCol : eLen;
                    const newSCol = sLen > 0 ? clamp(ns, 1, sLen) : 1;
                    const newECol = eLen > 0 ? clamp(ne, 1, eLen) : 1;

                    if (newSCol !== ns || newECol !== ne) clampedCount++;

                    // zero-length ref (start === end) drop — highlight 대상이 없는 degenerate ref.
                    // 범용 cross-cutting 라인(예: FR-003 L97 "동일 이벤트가 중복 발생했을 때")에
                    // 요소가 zero-width 점으로 anchor 되어 매트릭스에서 엉뚱한 FR 을 거짓 매핑하는
                    // 케이스 방지 (python es_trace_util._is_zero 와 동일 정책의 draft 경로 mirror).
                    if (sLine === eLine && newSCol === newECol) {
                        droppedCount++;
                        continue;
                    }

                    validRefs.push([[sLine, newSCol], [eLine, newECol]]);
                } catch (e) {
                    droppedCount++;
                }
            }

            return validRefs;
        });

        if (clampedCount > 0 || droppedCount > 0) {
            console.warn(`[ESDialogerTraceUtil] refs sanitized — clamped=${clampedCount}, dropped=${droppedCount} (against userStory+ddl text)`);
        }

        return cleaned;
    }
}

module.exports = ESDialogerTraceUtil;