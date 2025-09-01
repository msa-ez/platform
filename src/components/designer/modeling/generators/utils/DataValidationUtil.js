class DataValidationUtil {
    /**
     * 유효하지 않을 경우, 바로 예외를 발생시킴
     * 구체적인 사용법은 isValidData 함수 참고
     */
    static validateData(data, schema, path = 'root'){
        if(!this.isValidData(data, schema, path))
            throw new Error(`Data validation failed for ${path}: ${JSON.stringify(data)}`);
    }
    
    /**
     * 주어진 데이터가 스키마와 일치하는지 검증합니다.
     * @param {any} data - 검증할 데이터
     * @param {Object} dataSchema - 데이터 스키마 정의
     * @param {string} [path='root'] - 현재 검증 중인 데이터의 경로 (에러 메시지용)
     * @returns {boolean} 검증 통과 여부
     * 
     * @example
     * // 기본 객체 검증
     * const schema1 = {
     *   type: 'object',
     *   properties: {
     *     name: { type: 'string', required: true, minLength: 1 },
     *     age: { type: 'number', required: false }
     *   }
     * };
     * const data1 = { name: 'John Doe', age: 30 };
     * DataValidationUtil.isValidData(data1, schema1); // true
     *
     * const invalidData1 = { age: 30 }; // 'name' is missing
     * DataValidationUtil.isValidData(invalidData1, schema1); // false
     * 
     * const invalidData2 = { name: '', age: 30 }; // 'name' is too short
     * DataValidationUtil.isValidData(invalidData2, schema1); // false
     * 
     * @example
     * // 배열 및 중첩 객체 검증
     * const schema2 = {
     *   type: 'object',
     *   properties: {
     *     users: {
     *       type: 'array',
     *       items: {
     *         type: 'object',
     *         properties: {
     *           id: { type: 'number' },
     *           email: { type: 'string' }
     *         }
     *       }
     *     }
     *   }
     * };
     * const data2 = {
     *   users: [
     *     { id: 1, email: 'user1@example.com' },
     *     { id: 2, email: 'user2@example.com' }
     *   ]
     * };
     * DataValidationUtil.isValidData(data2, schema2); // true
     * 
     * @example
     * // additionalProperties를 사용한 동적 키 객체 검증
     * const schema3 = {
     *     type: 'object',
     *     additionalProperties: {
     *         type: 'object',
     *         properties: {
     *             isDirectMatching: { type: 'boolean' }
     *         }
     *     }
     * };
     * const data3 = {
     *     event1: { isDirectMatching: true },
     *     event2: { isDirectMatching: false }
     * };
     * DataValidationUtil.isValidData(data3, schema3); // true
     *
     * const invalidData3 = { event1: { isDirectMatching: 'yes' } };
     * DataValidationUtil.isValidData(invalidData3, schema3); // false
     * 
     * @example
     * // 문자열 길이 검증 (기본적으로 trim 적용)
     * const schema4 = {
     *     type: 'object',
     *     properties: {
     *         username: { type: 'string', minLength: 3, maxLength: 20 },
     *         password: { type: 'string', minLength: 8 },
     *         code: { type: 'string', length: 6 }
     *     }
     * };
     * const data4 = { username: 'john_doe', password: 'securepass123', code: 'ABC123' };
     * DataValidationUtil.isValidData(data4, schema4); // true
     *
     * const invalidData4 = { username: 'jo', password: 'short', code: 'ABC12' };
     * DataValidationUtil.isValidData(invalidData4, schema4); // false (username too short, password too short, code wrong length)
     * 
     * @example
     * // trim 기능 제어 (기본값: trimByDefault: true)
     * const schema5 = {
     *     type: 'object',
     *     properties: {
     *         trimmedField: { type: 'string', minLength: 3 }, // 기본적으로 trim 적용
     *         nonTrimmedField: { type: 'string', minLength: 3, trimByDefault: false }, // trim 비적용
     *         explicitTrimField: { type: 'string', minLength: 3, trimByDefault: true } // 명시적 trim 적용
     *     }
     * };
     * const data5 = { 
     *     trimmedField: '  abc  ',      // trim 후 'abc' (길이 3) -> 통과
     *     nonTrimmedField: '  abc  ',   // trim 없이 '  abc  ' (길이 7) -> 통과
     *     explicitTrimField: '  xy  '   // trim 후 'xy' (길이 2) -> 실패
     * };
     * DataValidationUtil.isValidData(data5, schema5); // false (explicitTrimField가 minLength 미만)
     */
    static isValidData(data, dataSchema, path = 'root') {
        try {
            return this._validateRecursively(data, dataSchema, path);
        } catch (error) {
            console.error(`DataValidationUtil: ${error.message}`);
            return false;
        }
    }

    /**
     * 재귀적으로 데이터를 검증합니다.
     * @private
     */
    static _validateRecursively(data, schema, path) {
        // null/undefined 검사
        if (schema.required !== false && (data === null || data === undefined)) {
            throw new Error(`${path} is required but got ${data}`);
        }

        if (data === null || data === undefined) {
            return true; // optional field
        }

        // 타입 검증
        if (schema.type) {
            if (!this._validateType(data, schema.type, path)) {
                return false;
            }
        }

        // 문자열 검증
        if (schema.type === 'string') {
            return this._validateString(data, schema, path);
        }

        // 배열 검증
        if (schema.type === 'array') {
            return this._validateArray(data, schema, path);
        }

        // 객체 검증
        if (schema.type === 'object') {
            return this._validateObject(data, schema, path);
        }

        // 값 검증 (enum, range 등)
        if (schema.values && !schema.values.includes(data)) {
            throw new Error(`${path} must be one of [${schema.values.join(', ')}] but got ${data}`);
        }

        return true;
    }

    /**
     * 타입 검증
     * @private
     */
    static _validateType(data, expectedType, path) {
        let actualType = typeof data;
        
        if (expectedType === 'array' && Array.isArray(data)) {
            actualType = 'array';
        }

        if (actualType !== expectedType) {
            throw new Error(`${path} must be ${expectedType} but got ${actualType}`);
        }

        return true;
    }

    /**
     * 배열 검증
     * @private
     */
    static _validateArray(data, schema, path) {
        if (!Array.isArray(data)) {
            throw new Error(`${path} must be an array`);
        }

        // 배열 길이 검증
        if (schema.length !== undefined && data.length !== schema.length) {
            throw new Error(`${path} must have length ${schema.length} but got ${data.length}`);
        }

        if (schema.minLength !== undefined && data.length < schema.minLength) {
            throw new Error(`${path} must have at least ${schema.minLength} elements but got ${data.length}`);
        }

        if (schema.maxLength !== undefined && data.length > schema.maxLength) {
            throw new Error(`${path} must have at most ${schema.maxLength} elements but got ${data.length}`);
        }

        // 배열 요소 검증
        if (schema.items) {
            for (let i = 0; i < data.length; i++) {
                if (!this._validateRecursively(data[i], schema.items, `${path}[${i}]`)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 객체 검증
     * @private
     */
    static _validateObject(data, schema, path) {
        if (typeof data !== 'object' || Array.isArray(data) || data === null) {
            throw new Error(`${path} must be an object`);
        }

        // 속성 검증
        if (schema.properties) {
            for (const [key, propertySchema] of Object.entries(schema.properties)) {
                const propertyPath = `${path}.${key}`;
                if (!this._validateRecursively(data[key], propertySchema, propertyPath)) {
                    return false;
                }
            }
        }

        // 추가 속성 검증
        if (schema.additionalProperties !== undefined) {
            if (schema.additionalProperties === false && schema.properties) {
                // 추가 속성 허용하지 않음
                const allowedKeys = Object.keys(schema.properties);
                const dataKeys = Object.keys(data);
                const extraKeys = dataKeys.filter(key => !allowedKeys.includes(key));
                
                if (extraKeys.length > 0) {
                    throw new Error(`${path} has unexpected properties: [${extraKeys.join(', ')}]`);
                }
            } else if (typeof schema.additionalProperties === 'object') {
                // 추가 속성에 대한 스키마가 정의됨
                const definedKeys = schema.properties ? Object.keys(schema.properties) : [];
                const dataKeys = Object.keys(data);
                const additionalKeys = dataKeys.filter(key => !definedKeys.includes(key));
                
                // 추가 속성들을 스키마로 검증
                for (const key of additionalKeys) {
                    const additionalPath = `${path}.${key}`;
                    if (!this._validateRecursively(data[key], schema.additionalProperties, additionalPath)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * 문자열 검증
     * @private
     */
    static _validateString(data, schema, path) {
        if (typeof data !== 'string') {
            throw new Error(`${path} must be a string`);
        }

        // trim 사용 여부 결정 (기본값: true)
        const shouldTrim = schema.trimByDefault !== false;
        const validationData = shouldTrim ? data.trim() : data;

        // 문자열 길이 검증
        if (schema.length !== undefined && validationData.length !== schema.length) {
            const trimInfo = shouldTrim ? ' (after trimming)' : '';
            throw new Error(`${path} must have length ${schema.length} but got ${validationData.length}${trimInfo}`);
        }

        if (schema.minLength !== undefined && validationData.length < schema.minLength) {
            const trimInfo = shouldTrim ? ' (after trimming)' : '';
            throw new Error(`${path} must have at least ${schema.minLength} characters but got ${validationData.length}${trimInfo}`);
        }

        if (schema.maxLength !== undefined && validationData.length > schema.maxLength) {
            const trimInfo = shouldTrim ? ' (after trimming)' : '';
            throw new Error(`${path} must have at most ${schema.maxLength} characters but got ${validationData.length}${trimInfo}`);
        }

        return true;
    }
}

module.exports = DataValidationUtil;