const libraryEsValue = require("./mocks")
const ESAliasTransManager = require("../../../es-ddl-generators/modules/ESAliasTransManager")
const ESValueSummarizeWithFilter = require("./ESValueSummarizeWithFilter")

class ESValueSummarizeWithFilterTest {
    static async test(esValue=null) {
        if(!esValue)
            esValue = libraryEsValue

        const esAliasTransManager = new ESAliasTransManager(esValue)

        console.log("[*] 대상 ESValue", {esValue})

        console.log("[*] 1. 일반적인 요약 요청")
        const summary = ESValueSummarizeWithFilter.getSummarizedESValue(
            esValue,
            [],
            esAliasTransManager
        )
        console.log(summary)


        console.log("[*] 2. 속성 키를 제외하기 위한 필터링 요청")
        const summaryWithFilter = ESValueSummarizeWithFilter.getSummarizedESValue(
            esValue,
            ["properties"],
            esAliasTransManager
        )
        console.log(summaryWithFilter)
    

        console.log("[*] 3. 토큰 수 초과시 자동 요약 기능을 포함한 요약 요청")
        const summaryWithAutoSummarize = await ESValueSummarizeWithFilter.getSummarizedESValueWithMaxTokenSummarize(
            esValue,
            [],
            esAliasTransManager,
            800,
            "gpt-4o"
        )
        console.log(summaryWithAutoSummarize)
    }
}

module.exports = ESValueSummarizeWithFilterTest