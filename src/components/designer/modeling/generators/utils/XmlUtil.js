const changeCase = require('change-case');

class XmlUtil {
    static from_dict(data, is_use_escape_xml = false, to_snake_case = false) {
        /**
         * 값을 XML 형식으로 변환하는 내부 함수
         * @param {*} value - 변환할 값
         * @param {number} indentLevel - 들여쓰기 레벨
         * @returns {string} XML 형식 문자열
         */
        function _convertValueToXml(value, indentLevel = 1) {
            const indent = "  ".repeat(indentLevel);
            
            if (Array.isArray(value)) {
                // 배열인 경우 각 항목을 <item> 태그로 감쌈
                const result = [];
                for (const item of value) {
                    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                        // 딕셔너리 항목인 경우 재귀적으로 처리
                        const nestedResult = _convertValueToXml(item, indentLevel + 1);
                        const nestedLines = nestedResult.split('\n');
                        result.push(`${indent}<item>`);
                        for (const line of nestedLines) {
                            if (line.trim()) {  // 빈 줄이 아닌 경우만
                                result.push(`  ${line}`);
                            }
                        }
                        result.push(`${indent}</item>`);
                    } else if (Array.isArray(item)) {
                        // 리스트 항목인 경우 재귀적으로 처리
                        const nestedResult = _convertValueToXml(item, indentLevel + 1);
                        const nestedLines = nestedResult.split('\n');
                        result.push(`${indent}<item>`);
                        for (const line of nestedLines) {
                            if (line.trim()) {  // 빈 줄이 아닌 경우만
                                result.push(`  ${line}`);
                            }
                        }
                        result.push(`${indent}</item>`);
                    } else {
                        // 일반 값인 경우
                        result.push(`${indent}<item>${_escapeXml(item)}</item>`);
                    }
                }
                return result.join('\n');
            } else if (typeof value === 'object' && value !== null) {
                // 딕셔너리인 경우 각 키-값 쌍을 태그로 변환
                const result = [];
                for (let [key, val] of Object.entries(value)) {
                    if (to_snake_case) {
                        key = changeCase.snakeCase(key);
                    }
                    
                    if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
                        // 리스트나 딕셔너리인 경우 재귀적으로 처리
                        result.push(`${indent}<${key}>`);
                        result.push(_convertValueToXml(val, indentLevel + 1));
                        result.push(`${indent}</${key}>`);
                    } else {
                        // 일반 값인 경우
                        result.push(`${indent}<${key}>${_escapeXml(val)}</${key}>`);
                    }
                }
                return result.join('\n');
            } else {
                // 일반 값인 경우
                return `${indent}${_escapeXml(value)}`;
            }
        }
        
        /**
         * XML에서 특수문자를 이스케이프 처리
         * @param {*} value - 이스케이프할 값
         * @returns {string} 이스케이프된 문자열
         */
        function _escapeXml(value) {
            if (value === null || value === undefined) {
                return "";
            }
            
            // Boolean 값을 문자열로 변환
            if (typeof value === 'boolean') {
                return String(value);
            }
            
            // 문자열인 경우 XML 특수문자 이스케이프
            if (typeof value === 'string') {
                if (is_use_escape_xml) {
                    return value
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#39;");
                } else {
                    return value;
                }
            }
            
            return String(value);
        }
        
        return _convertValueToXml(data);
    }
}

module.exports = XmlUtil;