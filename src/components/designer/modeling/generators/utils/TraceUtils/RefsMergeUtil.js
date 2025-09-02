const DataValidationUtil = require("../DataValidationUtil")

class RefsMergeUtil {
    static mergeRefs(refs) {
        this.__validateRefs(refs)

        if (refs.length <= 1) return refs;

        // 2차원적으로 범위를 병합하기 위한 반복적 알고리즘
        let currentRefs = structuredClone(refs);
        let hasChanges = true;
        
        while (hasChanges) {
            hasChanges = false;
            const newRefs = [];
            const processed = new Set();
            
            for (let i = 0; i < currentRefs.length; i++) {
                if (processed.has(i)) continue;
                
                let mergedRef = currentRefs[i];
                const merged = [i];
                
                // 현재 ref와 병합 가능한 모든 ref들을 찾아서 병합
                for (let j = i + 1; j < currentRefs.length; j++) {
                    if (processed.has(j)) continue;
                    
                    if (this._canMergeRanges(mergedRef, currentRefs[j])) {
                        mergedRef = this._mergeRanges(mergedRef, currentRefs[j]);
                        merged.push(j);
                        hasChanges = true;
                    }
                }
                
                newRefs.push(mergedRef);
                merged.forEach(index => processed.add(index));
            }
            
            currentRefs = newRefs;
        }
        
        return currentRefs;
    }
    static __validateRefs(refs) {
        DataValidationUtil.validateData({ refs }, {
            type: 'object',
            properties: {
                refs: {
                    type: 'array',
                    required: true,
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
        })
    }

    /**
     * 두 범위가 병합 가능한지 확인합니다 (포함, 겹침, 인접 중 하나라도 만족하면 병합 가능).
     * @param {Array} range1 - 첫 번째 범위
     * @param {Array} range2 - 두 번째 범위
     * @returns {boolean}
     */
    static _canMergeRanges(range1, range2) {
        return this._isRangeContained(range1, range2) ||
               this._isRangeContained(range2, range1) ||
               this._isRangeOverlapping(range1, range2) ||
               this._isRangeAdjacent(range1, range2);
    }

    /**
     * 첫 번째 범위가 두 번째 범위에 완전히 포함되는지 확인합니다.
     * @param {Array} innerRange - 포함될 범위 [[startLine, startCol], [endLine, endCol]]
     * @param {Array} outerRange - 포함하는 범위 [[startLine, startCol], [endLine, endCol]]
     * @returns {boolean}
     */
    static _isRangeContained(innerRange, outerRange) {
        const [innerStart, innerEnd] = innerRange;
        const [outerStart, outerEnd] = outerRange;
        
        return this._comparePosition(outerStart, innerStart) <= 0 && 
               this._comparePosition(innerEnd, outerEnd) <= 0;
    }

    /**
     * 두 범위가 겹치는지 확인합니다.
     * @param {Array} range1 - 첫 번째 범위 [[startLine, startCol], [endLine, endCol]]
     * @param {Array} range2 - 두 번째 범위 [[startLine, startCol], [endLine, endCol]]
     * @returns {boolean}
     */
    static _isRangeOverlapping(range1, range2) {
        const [start1, end1] = range1;
        const [start2, end2] = range2;
        
        return this._comparePosition(start1, end2) <= 0 && 
               this._comparePosition(start2, end1) <= 0;
    }

    /**
     * 두 범위가 인접한지 확인합니다.
     * @param {Array} range1 - 첫 번째 범위 [[startLine, startCol], [endLine, endCol]]
     * @param {Array} range2 - 두 번째 범위 [[startLine, startCol], [endLine, endCol]]
     * @returns {boolean}
     */
    static _isRangeAdjacent(range1, range2) {
        const [start1, end1] = range1;
        const [start2, end2] = range2;
        
        // range1의 끝이 range2의 시작과 인접한지 확인
        const [endLine1, endCol1] = end1;
        const [startLine2, startCol2] = start2;
        
        if (endLine1 === startLine2) {
            return endCol1 + 1 === startCol2;
        }
        
        // range2의 끝이 range1의 시작과 인접한지 확인
        const [endLine2, endCol2] = end2;
        const [startLine1, startCol1] = start1;
        
        if (endLine2 === startLine1) {
            return endCol2 + 1 === startCol1;
        }
        
        return false;
    }

    /**
     * 두 2차원 위치를 비교합니다.
     * @param {Array} pos1 - [line, column] 형태의 위치
     * @param {Array} pos2 - [line, column] 형태의 위치  
     * @returns {number} - pos1이 pos2보다 앞서면 -1, 같으면 0, 뒤면 1
     */
    static _comparePosition(pos1, pos2) {
        const [line1, col1] = pos1;
        const [line2, col2] = pos2;
        
        if (line1 < line2) return -1;
        if (line1 > line2) return 1;
        if (col1 < col2) return -1;
        if (col1 > col2) return 1;
        return 0;
    }

    /**
     * 두 범위를 병합합니다.
     * @param {Array} range1 - 첫 번째 범위 [[startLine, startCol], [endLine, endCol]]
     * @param {Array} range2 - 두 번째 범위 [[startLine, startCol], [endLine, endCol]]
     * @returns {Array} - 병합된 범위
     */
    static _mergeRanges(range1, range2) {
        const [start1, end1] = range1;
        const [start2, end2] = range2;
        
        // 더 앞선 시작점과 더 뒤의 끝점을 찾기
        const mergedStart = this._comparePosition(start1, start2) <= 0 ? start1 : start2;
        const mergedEnd = this._comparePosition(end1, end2) >= 0 ? end1 : end2;
        
        return [mergedStart, mergedEnd];
    }
}

module.exports = RefsMergeUtil;
