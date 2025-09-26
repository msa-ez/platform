const TraceMarkdownUtil = require("./TraceMarkdownUtil");
const { traceMarkdownUtilTestMocks } = require("./mocks");

class TraceMarkdownUtilTest {
    static async test() {
        const mockDatas = traceMarkdownUtilTestMocks
        const result = TraceMarkdownUtil.getDescriptionWithMappingIndex(mockDatas.bc, mockDatas.relations, mockDatas.explanations, mockDatas.events)
        console.log(result)
    }
}

module.exports = TraceMarkdownUtilTest;