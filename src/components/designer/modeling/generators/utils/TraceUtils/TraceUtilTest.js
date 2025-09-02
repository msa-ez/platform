const RefsMergeUtil = require("./RefsMergeUtil");

class TraceUtilTest {
    static async testRefsMergeUtil() {
        console.log('=== RefsMergeUtil.mergeRefs 테스트 시작 ===\n');
        
        let totalTests = 0;
        let passedTests = 0;
        
        // 테스트 헬퍼 함수
        const runTest = (testName, input, expected, description = '') => {
            totalTests++;
            console.log(`테스트 ${totalTests}: ${testName}`);
            if (description) console.log(`설명: ${description}`);
            console.log(`입력: ${JSON.stringify(input)}`);
            
            try {
                const result = RefsMergeUtil.mergeRefs(input);
                console.log(`결과: ${JSON.stringify(result)}`);
                console.log(`예상: ${JSON.stringify(expected)}`);
                
                const isEqual = this._deepEqual(result, expected);
                if (isEqual) {
                    console.log('✅ 통과\n');
                    passedTests++;
                } else {
                    console.log('❌ 실패\n');
                }
            } catch (error) {
                console.log(`❌ 오류 발생: ${error.message}\n`);
            }
        };

        // 테스트 케이스 1: 사용자 요구사항 예시
        runTest(
            '포함 관계 병합',
            [[[1, 1], [2, 10]], [[1, 5], [2, 5]]],
            [[[1, 1], [2, 10]]],
            '뒤의 범위가 앞의 범위에 완전히 포함되므로 병합되어야 함'
        );

        // 테스트 케이스 2: 겹치는 범위
        runTest(
            '겹치는 범위 병합',
            [[[1, 1], [2, 5]], [[1, 3], [3, 8]]],
            [[[1, 1], [3, 8]]],
            '두 범위가 일부 겹치므로 합쳐진 범위로 병합되어야 함'
        );

        // 테스트 케이스 3: 인접한 범위 (같은 라인)
        runTest(
            '인접한 범위 병합',
            [[[1, 1], [1, 5]], [[1, 6], [1, 10]]],
            [[[1, 1], [1, 10]]],
            '같은 라인에서 인접한 범위들은 병합되어야 함'
        );

        // 테스트 케이스 4: 분리된 범위 (병합되지 않아야 함)
        runTest(
            '분리된 범위',
            [[[1, 1], [1, 5]], [[3, 1], [3, 5]]],
            [[[1, 1], [1, 5]], [[3, 1], [3, 5]]],
            '분리된 범위들은 병합되지 않아야 함'
        );

        // 테스트 케이스 5: 복잡한 연쇄 병합
        runTest(
            '복잡한 연쇄 병합',
            [[[1, 1], [1, 5]], [[1, 3], [1, 8]], [[1, 7], [2, 3]], [[2, 1], [2, 5]]],
            [[[1, 1], [2, 5]]],
            '여러 범위가 연쇄적으로 연결되어 하나의 큰 범위로 병합되어야 함'
        );

        // 테스트 케이스 6: 같은 범위 중복
        runTest(
            '동일한 범위 중복',
            [[[1, 1], [1, 5]], [[1, 1], [1, 5]], [[1, 1], [1, 5]]],
            [[[1, 1], [1, 5]]],
            '동일한 범위가 여러 개 있으면 하나로 병합되어야 함'
        );

        // 테스트 케이스 7: 단일 범위
        runTest(
            '단일 범위',
            [[[1, 1], [2, 5]]],
            [[[1, 1], [2, 5]]],
            '단일 범위는 그대로 반환되어야 함'
        );

        // 테스트 케이스 8: 빈 배열
        runTest(
            '빈 배열',
            [],
            [],
            '빈 배열은 그대로 반환되어야 함'
        );

        // 테스트 케이스 9: 여러 라인에 걸친 포함 관계
        runTest(
            '다중 라인 포함 관계',
            [[[1, 1], [5, 10]], [[2, 3], [3, 8]]],
            [[[1, 1], [5, 10]]],
            '여러 라인에 걸쳐 포함된 범위는 병합되어야 함'
        );

        // 테스트 케이스 10: 순서가 뒤바뀐 경우
        runTest(
            '순서 뒤바뀐 포함 관계',
            [[[1, 5], [2, 5]], [[1, 1], [2, 10]]],
            [[[1, 1], [2, 10]]],
            '입력 순서와 관계없이 올바르게 병합되어야 함'
        );

        // 테스트 케이스 11: 인접하지만 다른 라인 (병합되지 않아야 함)
        runTest(
            '다른 라인의 분리된 범위',
            [[[1, 1], [1, 5]], [[2, 1], [2, 5]]],
            [[[1, 1], [1, 5]], [[2, 1], [2, 5]]],
            '다른 라인의 범위들은 인접하지 않으므로 병합되지 않아야 함'
        );

        // 테스트 케이스 12: 라인 끝과 다음 라인 시작이 인접한 경우
        runTest(
            '라인 경계 인접',
            [[[1, 1], [1, 10]], [[2, 1], [2, 5]]],
            [[[1, 1], [1, 10]], [[2, 1], [2, 5]]],
            '라인 경계에서는 인접하지 않으므로 병합되지 않아야 함'
        );

        // 결과 요약
        console.log('=== 테스트 결과 요약 ===');
        console.log(`총 테스트: ${totalTests}`);
        console.log(`통과: ${passedTests}`);
        console.log(`실패: ${totalTests - passedTests}`);
        console.log(`성공률: ${totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0}%`);
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: totalTests - passedTests,
            success: passedTests === totalTests
        };
    }

    /**
     * 깊은 비교 함수 (배열과 객체를 재귀적으로 비교)
     */
    static _deepEqual(a, b) {
        if (a === b) return true;
        
        if (a == null || b == null) return a === b;
        
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this._deepEqual(a[i], b[i])) return false;
            }
            return true;
        }
        
        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            for (let key of keysA) {
                if (!keysB.includes(key) || !this._deepEqual(a[key], b[key])) return false;
            }
            return true;
        }
        
        return false;
    }

    /**
     * 모든 테스트를 실행하는 메인 함수
     */
    static async runAllTests() {
        console.log('=== TraceUtil 전체 테스트 실행 ===\n');
        
        try {
            const refsMergeResult = await this.testRefsMergeUtil();
            console.log('\n=== 전체 테스트 완료 ===');
            return refsMergeResult;
        } catch (error) {
            console.error('테스트 실행 중 오류 발생:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = TraceUtilTest;