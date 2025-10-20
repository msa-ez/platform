const { DataValidationUtil } = require("../../utils")

class DDLLineRefSplitter {
    static convertToAbsoluteRefs(ddlFieldRefs, ddlLines, lineTraceMap) {
        ddlFieldRefs = this.__sanitizeInputParams(ddlFieldRefs)
        this.__validateInputParams(ddlFieldRefs, ddlLines, lineTraceMap)

        const convertedDDLFieldRefs = []
        for(const ddlFieldRef of ddlFieldRefs) {
            const convertedRefs = []
            for(const refRange of ddlFieldRef.refs) {
                const [startRef, endRef] = refRange
                const [mergedStartLine, startCol] = startRef
                const [mergedEndLine, endCol] = endRef

                // 여러 ddlRequirements 블록에 걸친 refs를 분할하여 처리
                const splitRefs = DDLLineRefSplitter._splitRefRangeAcrossBlocks(
                    mergedStartLine, startCol, mergedEndLine, endCol, ddlLines, lineTraceMap
                )
                convertedRefs.push(...splitRefs)
            }
            convertedDDLFieldRefs.push({
                ...ddlFieldRef,
                refs: convertedRefs
            })
        }
        return convertedDDLFieldRefs
    }
    static __sanitizeInputParams(ddlFieldRefs, ddlLines, lineTraceMap) {
        const sanitizedDDLFieldRefs = []
        for(const ddlFieldRef of ddlFieldRefs) {
            if(!DataValidationUtil.isValidData(ddlFieldRef, {
                type: 'object',
                properties: {
                    fieldName: { type: 'string', required: true },
                    refs: { type: 'array', required: true,
                        items: { type: 'array', length: 2, 
                            items: { type: 'array', length: 2, 
                                items: { type: 'number' } 
                            } 
                        } 
                    }
                }
            }, "root", true)) {
                console.warn(`Invalid ddlFieldRef: ${JSON.stringify(ddlFieldRef)}. Ignoring...`)
                continue
            }

            sanitizedDDLFieldRefs.push(ddlFieldRef)
        }
        return sanitizedDDLFieldRefs
    }
    static __validateInputParams(ddlFieldRefs, ddlLines, lineTraceMap) {
        DataValidationUtil.validateData(ddlFieldRefs, {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    refs: {
                        type: 'array',
                        items: {
                            type: 'array',
                            length: 2,
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
        })
        DataValidationUtil.validateData(ddlLines, {
            type: 'array',
            items: {
                type: 'string'
            }
        })
        DataValidationUtil.validateData(lineTraceMap, {
            type: 'object',
            additionalProperties: {
                type: 'number'
            }
        })
    }

    static _splitRefRangeAcrossBlocks(mergedStartLine, startCol, mergedEndLine, endCol, ddlLines, lineTraceMap) {
        const splitRefs = []
        
        let currentSegmentStart = mergedStartLine
        let currentSegmentStartCol = startCol
        let previousOriginalLine = lineTraceMap[mergedStartLine]
        
        for (let mergedLine = mergedStartLine + 1; mergedLine <= mergedEndLine; mergedLine++) {
            const currentOriginalLine = lineTraceMap[mergedLine]
            
            // 원본 라인이 연속되지 않거나 매핑이 누락된 경우 경계로 판단
            const isDiscontinuous = (
                previousOriginalLine === undefined ||
                currentOriginalLine === undefined ||
                currentOriginalLine !== previousOriginalLine + 1
            )
            if (isDiscontinuous) {
                // 이전 세그먼트를 완료하고 추가
                const segmentOriginalStartLine = lineTraceMap[currentSegmentStart] || currentSegmentStart
                const segmentOriginalEndLine = previousOriginalLine || (mergedLine - 1)
                const segmentEndMergedLine = mergedLine - 1
                const segmentEndCol = DDLLineRefSplitter._getMergedLineLength(segmentEndMergedLine, ddlLines)

                splitRefs.push([
                    [segmentOriginalStartLine, currentSegmentStartCol], 
                    [segmentOriginalEndLine, segmentEndCol]
                ])
                
                // 새 세그먼트 시작
                currentSegmentStart = mergedLine
                currentSegmentStartCol = 1
            }
            
            if (currentOriginalLine !== undefined) {
                previousOriginalLine = currentOriginalLine
            }
        }
        
        // 마지막 세그먼트 추가
        const finalOriginalStartLine = lineTraceMap[currentSegmentStart] || currentSegmentStart
        const finalOriginalEndLine = lineTraceMap[mergedEndLine] || mergedEndLine
        
        splitRefs.push([
            [finalOriginalStartLine, currentSegmentStartCol],
            [finalOriginalEndLine, endCol]
        ])
        
        return splitRefs
    }

    static _getMergedLineLength(mergedLine, ddlLines) {
        const idx = (typeof mergedLine === 'number' ? mergedLine : parseInt(mergedLine, 10)) - 1
        if (isNaN(idx) || idx < 0 || idx >= ddlLines.length) return 0
        const len = ddlLines[idx] ? ddlLines[idx].length : 0
        return Math.max(0, len)
    }
}

module.exports = DDLLineRefSplitter;