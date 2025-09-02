const ESDialogerTraceUtil = require("./ESDialogerTraceUtil");
const { mockDatas } = require("./mocks");

class ESDialogerTraceUtilTest {
    static async test() {
        const result = ESDialogerTraceUtil.extractTraceInfoFromDraftOptions(mockDatas.draftOptions, mockDatas.projectInfo)
        console.log(result)
    }
}

module.exports = ESDialogerTraceUtilTest;