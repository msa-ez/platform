class TextTraceUtil {
    static getReferencedUserRequirements(userRequirements, sourceReferences, startLineOffset = 0) {
        if(!userRequirements || !sourceReferences) return []
        
        // 요구사항을 줄별로 분리
        const lines = userRequirements.split('\n')
        const results = []
        
        // 각 참조 위치에 대해 텍스트 추출
        for(const ref of sourceReferences) {
            const [[startLine, startCol], [endLine, endCol]] = ref
            
            // 1기반 인덱스를 0기반으로 변환
            const sLine = startLine - startLineOffset - 1
            const sCol = startCol - 1
            const eLine = endLine - startLineOffset - 1
            const eCol = endCol - 1
            
            let extractedText = ''
            
            if(sLine === eLine) {
                // 같은 줄에서 추출 (inclusive이므로 endCol + 1)
                extractedText = lines[sLine].substring(sCol, eCol + 1)
            } else {
                // 여러 줄에 걸쳐 추출
                // 시작 줄의 일부
                extractedText = lines[sLine].substring(sCol)
                
                // 중간 줄들 전체
                for(let i = sLine + 1; i < eLine; i++) {
                    extractedText += '\n' + lines[i]
                }
                
                // 끝 줄의 일부 (inclusive이므로 endCol + 1)
                extractedText += '\n' + lines[eLine].substring(0, eCol + 1)
            }
            
            results.push(extractedText)
        }
        
        return results
    }

    static getTraceDescription(refRequirements, sourceReferences) {
        if(!refRequirements || !sourceReferences) return ''
        if(refRequirements.length === 0 || sourceReferences.length === 0) return ''

        const descriptions = ["* Referenced Requirements"]
        
        for(let i = 0; i < refRequirements.length && i < sourceReferences.length; i++) {
            const requirement = refRequirements[i].trim()
            const [[startLine]] = sourceReferences[i] // 시작 라인만 사용
            
            if(requirement) {
                descriptions.push(`- "${requirement}" (Line ${startLine})`)
            }
        }
        
        return descriptions.join('\n')
    }

    static appendEventStormingRefsDescription(description) {
        return `* Referenced Requirements\n${description}`
    }

    static addLineNumbers(requirements, startIndex = 1, isUseXmlBase = false) {
        if (!requirements) return '';
        
        const results = []
        for(const [index, line] of requirements.split('\n').entries()) {
            const lineNumber = index + startIndex;
            if(isUseXmlBase)
                results.push(`<${lineNumber}>${line}</${lineNumber}>`)
            else
                results.push(`${lineNumber}: ${line}`)
        }
        return results.join('\n');
    }


    static getLineNumberRangeOfRequirements(lineNumberedRequirements, isUseXmlBase = false) {
        const minLine = this.getMinLineNumberOfRequirements(lineNumberedRequirements, isUseXmlBase);
        const maxLine = this.getMaxLineNumberOfRequirements(lineNumberedRequirements, isUseXmlBase);
        return { minLine, maxLine };
    }

    static getMinLineNumberOfRequirements(lineNumberedRequirements, isUseXmlBase = false) {
        const lines = lineNumberedRequirements.trim().split('\n');
        const firstLine = lines[0];
        const minLine = this._extractLineNumber(firstLine, isUseXmlBase);
        return minLine !== null ? minLine : 1;
    }

    static getMaxLineNumberOfRequirements(lineNumberedRequirements, isUseXmlBase = false) {
        const lines = lineNumberedRequirements.trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const maxLine = this._extractLineNumber(lastLine, isUseXmlBase);
        return maxLine !== null ? maxLine : lines.length;
    }

    static _extractLineNumber(lineNumberedRequirement, isUseXmlBase = false) {
        if(isUseXmlBase) {
            const match = lineNumberedRequirement.match(/^<(\d+)>/);
            return match ? parseInt(match[1], 10) : null;
        }

        const match = lineNumberedRequirement.match(/^(\d+):/);
        return match ? parseInt(match[1], 10) : null;
    }


    static getLineNumberValidationPrompt(lineNumberedRequirements) {
        if (!lineNumberedRequirements) return ''

        const { minLine, maxLine } = this.getLineNumberRangeOfRequirements(lineNumberedRequirements);
        return `
IMPORTANT - LINE NUMBER VALIDATION RULE:
When creating 'refs' arrays in your response, you MUST only use line numbers that exist in the Requirements.
Valid line number range: ${minLine} ~ ${maxLine}
`;
    }
}

module.exports = TextTraceUtil;
