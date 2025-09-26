const TextTraceUtil = require("./TextTraceUtil");

class RefsTraceUtil {
    static convertRefsToIndexes(data, lineNumberedRequirements) {
        if (!data || !lineNumberedRequirements) return data;

        const lines = lineNumberedRequirements.split('\n');
        const startLineOffset = TextTraceUtil.getMinLineNumberOfRequirements(lineNumberedRequirements) - 1;

        return this.searchRefsArrayRecursively(data, (refsArray) => {
            return this._convertRefsArray(refsArray, lines, startLineOffset);
        });
    }

    static _convertRefsArray(refsArray, lines, startLineOffset) {
        return refsArray.map(refRange => this._convertSingleRefRange(refRange, lines, startLineOffset));
    }

    static _convertSingleRefRange(refRange, lines, startLineOffset) {
        try {
            // Validate ref range structure
            if (!this.__isValidRefRange(refRange)) {
                console.warn('Invalid ref range format:', refRange);
                return refRange;
            }

            // Handle single reference format: [[lineNumber, phrase]]
            if (refRange.length === 1) {
                return this._convertSingleRef(refRange[0], lines, startLineOffset);
            }

            // Handle dual reference format: [[start], [end]]
            return this._convertDualRef(refRange, lines, startLineOffset);
        } catch (error) {
            console.warn('Failed to convert ref range:', refRange, error);
            return refRange;
        }
    }
    static __isValidRefRange(refRange) {
        return Array.isArray(refRange) && (refRange.length === 1 || refRange.length === 2);
    }

    static _convertSingleRef(singleRef, lines, startLineOffset) {
        if (!Array.isArray(singleRef) || singleRef.length !== 2) {
            console.warn('Invalid single ref structure:', singleRef);
            return [singleRef];
        }

        const [lineNumber, phrase] = singleRef;

        // Skip if already converted
        if (typeof phrase === 'number') {
            return [[lineNumber, phrase]];
        }

        const lineContent = this._getLineContent(lines, lineNumber, startLineOffset);
        const phraseIndex = lineContent.indexOf(phrase);
        
        if (phraseIndex !== -1) {
            // Phrase found
            const startIndex = phraseIndex + 1; // Convert to 1-based
            const endIndex = phraseIndex + phrase.length;
            return [[lineNumber, startIndex], [lineNumber, endIndex]];
        } else {
            // Phrase not found - return entire line
            const lineEndIndex = lineContent.length > 0 ? lineContent.length : 1;
            return [[lineNumber, 1], [lineNumber, lineEndIndex]];
        }
    }

    static _convertDualRef(refRange, lines, startLineOffset) {
        const [startRef, endRef] = refRange;
        
        if (!Array.isArray(startRef) || !Array.isArray(endRef) || 
            startRef.length !== 2 || endRef.length !== 2) {
            console.warn('Invalid ref structure:', refRange);
            return refRange;
        }

        const [startLine, startPhrase] = startRef;
        const [endLine, endPhrase] = endRef;

        // Skip if already converted
        if (typeof startPhrase === 'number' && typeof endPhrase === 'number') {
            return refRange;
        }

        const startLineContent = this._getLineContent(lines, startLine, startLineOffset);
        const endLineContent = this._getLineContent(lines, endLine, startLineOffset);

        const startIndex = this._findColumnForWords(startLineContent, startPhrase);
        const endIndex = this._findColumnForWords(endLineContent, endPhrase, true);

        return [[startLine, startIndex], [endLine, endIndex]];
    }

    static _findColumnForWords(lineContent, phrase, isEndPosition = false) {
        if(!lineContent) return 1;
        if(!phrase) return isEndPosition ? lineContent.length : 1;

        const index = lineContent.indexOf(phrase);
        if (index === -1) {
            return isEndPosition ? lineContent.length : 1;
        }
        
        return isEndPosition ? index + phrase.length : index + 1;
    }

    static _getLineContent(lines, lineNumber, startLineOffset) {
        const adjustedLineNumber = lineNumber - startLineOffset;
        if (adjustedLineNumber < 1 || adjustedLineNumber > lines.length) {
            throw new Error(`Line number ${adjustedLineNumber} is out of range`);
        }
        
        const line = lines[adjustedLineNumber - 1]; // Convert to 0-based index
        return this._stripLineNumberPrefix(line);
    }

    static _stripLineNumberPrefix(line) {
        const colonIndex = line.indexOf(': ');
        return colonIndex !== -1 ? line.substring(colonIndex + 2) : line;
    }


    static removeRefsAttributes(data) {
        const clonedData = structuredClone(data);
        return this.searchRefsArrayRecursively(clonedData, () => {
            return undefined
        });
    }


    static convertToOriginalRefs(data, summarizedRequirements) {
        if(!data || !summarizedRequirements) return data;
        return this.searchRefsArrayRecursively(data, (refsArray) => {
            return this._convertRefsToOriginalRefsArray(refsArray, summarizedRequirements);
        });
    }

    static _convertRefsToOriginalRefsArray(refsArray, summarizedRequirements) {
        const referencedLineNumbers = new Set();
        refsArray.forEach(refRange => {
            if(!refRange || !Array.isArray(refRange) || refRange.length !== 2) {
                console.warn('Invalid ref range format:', refRange);
                return;
            }
            const [startLine, startPhrase] = refRange[0];
            const [endLine, endPhrase] = refRange[1];

            for(let i = startLine; i <= endLine; i++) {
                referencedLineNumbers.add(i);
            }
        });

        const convertedRefs = [];
        const addedLineNumbers = Array.from(referencedLineNumbers);
        for(const lineNumber of addedLineNumbers) {
            if(!summarizedRequirements[lineNumber - 1] || !summarizedRequirements[lineNumber - 1].refs) continue;

            const refs = summarizedRequirements[lineNumber - 1].refs;
            if(refs && Array.isArray(refs) && refs.length > 0) {
                convertedRefs.push(...refs);
            }
        }
        return convertedRefs;
    }


    static convertToOriginalRefsUsingTraceMap(refs, traceMap) {
        if(!refs || !traceMap) return refs

        const originalRefs = []
        const processedTraceInfos = new Set() // 중복 처리 방지
        
        for(const ref of refs) {
            const [startLine, startIndex] = ref[0]
            const [endLine, endIndex] = ref[1]

            // 현재 ref 범위에서 고유한 traceInfo들을 수집
            const uniqueTraceInfos = new Map()
            for(let i = startLine; i <= endLine; i++) {
                const traceInfo = traceMap[i]
                if(!traceInfo) continue
                
                const traceKey = JSON.stringify(traceInfo.refs)
                if(!uniqueTraceInfos.has(traceKey)) {
                    uniqueTraceInfos.set(traceKey, { traceInfo, line: i })
                }
            }

            // 각 고유한 traceInfo에 대해 처리
            for(const [traceKey, { traceInfo, line }] of uniqueTraceInfos) {
                if(processedTraceInfos.has(traceKey)) continue
                processedTraceInfos.add(traceKey)

                if(traceInfo.isDirectMatching && traceInfo.refs.length === 1 && traceInfo.refs[0].length === 2) {
                    const [traceStartLine, traceStartIndex] = traceInfo.refs[0][0]
                    const [traceEndLine, traceEndIndex] = traceInfo.refs[0][1]
                    
                    if(traceStartLine !== traceEndLine) {
                        if(endLine - startLine === traceEndLine - traceStartLine) {
                            // 여러 줄에 걸쳐 있고 줄 수가 같은 경우: 라인별 매핑
                            const lineOffset = line - startLine
                            const correspondingTraceLine = traceStartLine + lineOffset
                            
                            let calculatedStartIndex, calculatedEndIndex
                            
                            if(line === startLine) {
                                // 첫 번째 라인: 원본의 startIndex 사용
                                calculatedStartIndex = startIndex
                                calculatedEndIndex = traceEndIndex
                            } else if(line === endLine) {
                                // 마지막 라인: 원본의 endIndex 사용  
                                calculatedStartIndex = traceStartIndex
                                calculatedEndIndex = endIndex
                            } else {
                                // 중간 라인: trace의 전체 범위 사용
                                calculatedStartIndex = traceStartIndex
                                calculatedEndIndex = traceEndIndex
                            }
                            
                            // 인덱스 유효성 검증
                            if(calculatedStartIndex <= calculatedEndIndex) {
                                originalRefs.push([[correspondingTraceLine, calculatedStartIndex], [correspondingTraceLine, calculatedEndIndex]])
                            } else {
                                originalRefs.push([[correspondingTraceLine, traceStartIndex], [correspondingTraceLine, traceEndIndex]])
                            }
                        } else {
                            // 줄 수가 다른 경우: 전체 trace refs 사용
                            originalRefs.push(...traceInfo.refs)
                        }
                    }
                    else if(startLine === endLine) {
                        // 단일 라인 처리
                        if(startIndex > endIndex || startIndex < 1) {
                            originalRefs.push([[traceStartLine, traceStartIndex], [traceEndLine, traceEndIndex]])
                        } else {
                            originalRefs.push([[traceStartLine, startIndex], [traceEndLine, endIndex]])    
                        }
                    } else {
                        // 원본이 여러 줄, trace가 단일 줄인 경우
                        let calculatedStartIndex = null
                        let calculatedEndIndex = null
                        
                        if(line === startLine) {
                            calculatedStartIndex = startIndex
                            calculatedEndIndex = traceEndIndex
                        } else if(line === endLine) {
                            calculatedStartIndex = traceStartIndex
                            calculatedEndIndex = endIndex
                        } else {
                            calculatedStartIndex = traceStartIndex
                            calculatedEndIndex = traceEndIndex
                        }

                        if(calculatedStartIndex <= calculatedEndIndex) {
                            originalRefs.push([[traceStartLine, calculatedStartIndex], [traceEndLine, calculatedEndIndex]])
                        } else {
                            originalRefs.push([[traceStartLine, traceStartIndex], [traceEndLine, traceEndIndex]])
                        }
                    }
                } else {
                    // directMatching이 아니거나 복잡한 refs 구조인 경우
                    originalRefs.push(...traceInfo.refs)
                }
            }
        }
        
        return originalRefs
    }


    /**
     * AI가 생성한 refs 속성들을 유효한 값으로 정리하고 변환
     * 주어진 데이터를 재귀적으로 탐색하여 모든 refs 속성을 찾아서 처리
     * @param {Object} data - 변환할 데이터 객체
     * @param {string} lineNumberedRequirements - 라인 번호가 붙은 요구사항 텍스트
     * @param {number} minLine - 유효한 최소 라인 번호
     * @param {number} maxLine - 유효한 최대 라인 번호
     * @returns {Object} - 변환된 데이터 객체
     */
    static sanitizeAndConvertRefs(data, lineNumberedRequirements) {
        if (!data || !lineNumberedRequirements) return data;
        const { minLine, maxLine } = TextTraceUtil.getLineNumberRangeOfRequirements(lineNumberedRequirements);

        const lines = lineNumberedRequirements.split('\n').map(line => {
            const idx = line.indexOf(': ');
            return idx !== -1 ? line.substring(idx + 2) : line;
        });
        const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

        // 1단계: 재귀적으로 모든 refs 속성을 찾아서 정리 (구문/라인 검증)
        const sanitizedData = this.searchRefsArrayRecursively(data, (refsArray) => {
            return this._sanitizeRefsArray(refsArray, lines, minLine, maxLine, clamp);
        });

        // 2단계: convertRefsToIndexes로 칼럼 좌표 변환
        let convertedData;
        try {
            convertedData = this.convertRefsToIndexes(sanitizedData, lineNumberedRequirements);
        } catch (e) {
            console.warn('Failed to convert refs to indexes:', e);
            convertedData = sanitizedData;
        }

        // 3단계: 최종 클램핑 처리
        const finalData = this.searchRefsArrayRecursively(convertedData, (refsArray) => {
            return this._clampRefsArray(refsArray, lines, minLine, maxLine, clamp);
        });
        return finalData;
    }

    static _sanitizeRefsArray(refsArray, lines, minLine, maxLine, clamp) {
        return refsArray.map(mono => {
            if (!mono || !Array.isArray(mono) || mono.length !== 2) return mono;

            let [s, e] = mono;
            let sLine = typeof s[0] === 'number' ? s[0] : minLine;
            let eLine = typeof e[0] === 'number' ? e[0] : sLine;
            let sPhrase = s[1];
            let ePhrase = e[1];

            sLine = clamp(sLine, minLine, maxLine);
            eLine = clamp(eLine, minLine, maxLine);

            // 문구가 해당 라인에 없으면 ±5 라인 탐색
            const tryRelocate = (line, phrase, isEnd) => {
                if (typeof phrase !== 'string' || !phrase.trim()) return line;
                const has = (ln) => {
                    const idx = ln - minLine;
                    const content = lines[idx] || '';
                    return content.includes(phrase);
                };
                if (has(line)) return line;
                for (let d = 1; d <= 5; d++) {
                    if (line - d >= minLine && has(line - d)) return line - d;
                    if (line + d <= maxLine && has(line + d)) return line + d;
                }
                return line; // 못 찾으면 원래 라인 유지
            };

            sLine = tryRelocate(sLine, sPhrase, false);
            eLine = tryRelocate(eLine, ePhrase, true);

            if (eLine < sLine) [sLine, eLine] = [eLine, sLine];
            return [[sLine, sPhrase], [eLine, ePhrase]];
        });
    }

    static _clampRefsArray(refsArray, lines, minLine, maxLine, clamp) {
        return refsArray.map(mono => {
            if (!mono || !Array.isArray(mono) || mono.length !== 2) return mono;

            let [[sLine, sCol], [eLine, eCol]] = mono;
            sLine = clamp(sLine, minLine, maxLine);
            eLine = clamp(eLine, minLine, maxLine);

            const len = (ln) => {
                const idx = ln - minLine;
                const content = lines[idx] || '';
                return Math.max(1, content.length);
            };

            sCol = Math.max(1, Math.min(len(sLine), typeof sCol === 'number' ? sCol : 1));
            eCol = Math.max(1, Math.min(len(eLine), typeof eCol === 'number' ? eCol : len(eLine)));

            const ordered = (eLine < sLine || (eLine === sLine && eCol < sCol))
                ? [[eLine, eCol], [sLine, sCol]]
                : [[sLine, sCol], [eLine, eCol]];
            return ordered;
        });
    }


    static searchRefsArrayRecursively(data, refsHandler) {
        return this._traverseObjectRecursively(data, (key, value) => {
            if (key.toLowerCase().endsWith("refs") && Array.isArray(value)) {
                return refsHandler(value)
            }
            return value;
        });
    }

    static _traverseObjectRecursively(obj, refsHandler) {
        if (obj === null || obj === undefined) return obj;
        
        // Handle arrays
        if (Array.isArray(obj)) {
            return obj.map(item => this._traverseObjectRecursively(item, refsHandler));
        }
        
        // Handle objects
        if (typeof obj === 'object') {
            const result = {};
            
            for (const [key, value] of Object.entries(obj)) {
                const transformedValue = refsHandler(key, value);
                if (transformedValue === undefined) {
                    // Skip this property (for removal)
                    continue;
                } else if (transformedValue === value) {
                    // No transformation applied, continue recursively
                    result[key] = this._traverseObjectRecursively(value, refsHandler);
                } else {
                    // Transformation applied
                    result[key] = transformedValue;
                }
            }
            
            return result;
        }
        
        // Return primitive values as-is
        return obj;
    }
}

module.exports = RefsTraceUtil;
