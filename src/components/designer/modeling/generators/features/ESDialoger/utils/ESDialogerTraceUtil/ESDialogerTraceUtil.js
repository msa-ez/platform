const { DataValidationUtil, RefsTraceUtil } = require("../../../../utils");

class ESDialogerTraceUtil {
    static extractTraceInfoFromDraftOptions(draftOptions, projectInfo) {
        this.__validateExtractTraceInfoFromDraftOptionsParams({
            draftOptions,
            projectInfo
        })
        this.__validateIndexOfRefs(draftOptions, projectInfo)


        const result = structuredClone(draftOptions);
        result.traceInfo = {
            previewAttributes: {},
            structureRefs: {},
            idValueObjectRefs: {},
            traceMaps: {},
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
     * refs에 존재하는 인덱스 정보가 원천 정보에 대해서 유효한 인덱스인지를 최종 검증해서 에러 전파 방지
     */
    static __validateIndexOfRefs(draftOptions, projectInfo) {
        const userText = [projectInfo.userStory, projectInfo.ddl].join("\n")
        const userTextLines = userText.split("\n")

        let isInvalid = false;
        let errorMessage = "";
        RefsTraceUtil.searchRefsArrayRecursively(draftOptions, (refsArray) => {
            refsArray.forEach(refArray => {
                try {

                    const startLineIndex = refArray[0][0] -1
                    const startColumnIndex = refArray[0][1] - 1
                    const endLineIndex = refArray[1][0] - 1
                    const endColumnIndex = refArray[1][1] - 1

                    if(userTextLines.length <= startLineIndex || userTextLines.length <= endLineIndex) {
                        isInvalid = true;
                        errorMessage += `Invalid ref : ${JSON.stringify(refArray)}\n`;
                    }

                    const startLineContent = userTextLines[startLineIndex]
                    if(startLineContent.length <= startColumnIndex) {
                        isInvalid = true;
                        errorMessage += `Invalid ref : ${JSON.stringify(refArray)}\n`;
                    }

                    const endLineContent = userTextLines[endLineIndex]
                    if(endLineContent.length <= endColumnIndex) {
                        isInvalid = true;
                        errorMessage += `Invalid ref : ${JSON.stringify(refArray)}\n`;
                    }

                } catch(e) {
                    isInvalid = true;
                    errorMessage += `Invalid ref : ${JSON.stringify(refArray)}\n`;
                }
            })
        })
        if(isInvalid) {
            throw new Error(errorMessage);
        }
    }
}

module.exports = ESDialogerTraceUtil;