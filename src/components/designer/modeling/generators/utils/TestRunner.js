export default class TestRunner {
    constructor() {
      this.tests = [];
    }

    describe(suiteName, testFn) {
      const suite = { name: suiteName, tests: [] };
      const context = {
        it: (testName, testFn) => {
          suite.tests.push({ name: testName, fn: testFn });
        }
      };
      testFn(context);
      this.tests.push(suite);
    }

    async runTests(suiteName = null) {
      const results = [];
      const suitesToRun = suiteName 
        ? this.tests.filter(s => s.name === suiteName)
        : this.tests;

      const errorMessages = [];
      for (const suite of suitesToRun) {
        const suiteResult = {
          name: suite.name,
          tests: []
        };

        console.log(`[#] '${suite.name}' 모음 테스트 시작`)
        for (const test of suite.tests) {
          const startTime = performance.now();
          let passed = false;
          let error = null;

          try {
            console.log(`[#] '${test.name}' 테스트 시작`)
            await test.fn();
            passed = true;
          } catch (e) {
            error = e.message;
          }

          const duration = (performance.now() - startTime).toFixed(2);


          const message = `[#] '${test.name}' 테스트 완료 > ${duration}ms / ${passed ? '통과' : '실패'} / ${error ? error : ''}`
          if(!passed) {
            errorMessages.push(message)
          }
          console.log(message)

          suiteResult.tests.push({
            name: test.name,
            passed,
            error,
            duration
          });
        }

        results.push(suiteResult);
      }

      const passedCount = results.filter(r => r.tests.every(t => t.passed)).length;
      const failedCount = results.filter(r => r.tests.some(t => !t.passed)).length;

      console.log(`[#] 테스트 완료 > ${passedCount} 통과, ${failedCount} 실패`)
      console.log(errorMessages.join('\n'))
      return results;
    }

    expect(actual) {
        return {
            toBe(expected) {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual(expected) {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy() {
                if (!actual) {
                    throw new Error(`Expected truthy value, but got ${actual}`);
                }
            },
            toBeFalsy() {
                if (actual) {
                    throw new Error(`Expected falsy value, but got ${actual}`);
                }
            },
            toBeGreaterOrEqualThan(expected) {
                if(actual === null || actual === undefined) {
                    throw new Error(`Expected ${actual} to have a number value`);
                }
                if (actual < expected) {
                    throw new Error(`Expected ${actual} to be greater or equal than ${expected}`);
                }
            },
            toBeLessOrEqualThan(expected) {
                if(actual === null || actual === undefined) {
                    throw new Error(`Expected ${actual} to have a number value`);
                }
                if (actual > expected) {
                    throw new Error(`Expected ${actual} to be less or equal than ${expected}`);
                }
            },
            toContain(expected) {
                if (!Array.isArray(actual) && typeof actual !== 'string') {
                    throw new Error(`Expected ${JSON.stringify(actual)} to be an array or string`);
                }
                const contains = Array.isArray(actual) 
                    ? actual.includes(expected)
                    : actual.includes(expected);
                if (!contains) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
                }
            },
            toBeOneOf(expectedArray) {
                if (!Array.isArray(expectedArray)) {
                    throw new Error(`Expected array, but got ${JSON.stringify(expectedArray)}`);
                }
                if (!expectedArray.includes(actual)) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to be one of ${JSON.stringify(expectedArray)}`);
                }
            }
        }
    }
}