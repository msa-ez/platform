const ESValueSummaryGenerator = require("./ESValueSummaryGenerator")
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { TokenCounter } = require("../../utils")
const { getEsValue } = require("../mocks")

class ESValueSummaryGeneratorTest {
    static async test(esValue=null) {
        if(!esValue) esValue = getEsValue("libraryService");

        const esAliasTransManager = new ESAliasTransManager(esValue)
        
        
        const summariezedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(
            esValue, [], esAliasTransManager
        )
        console.log(summariezedESValue)
        console.log("[*] 전체 ESValue 토큰 수 :", TokenCounter.getTokenCount(JSON.stringify(summariezedESValue), "gpt-4o"))


        const summary = await ESValueSummaryGenerator.getSummarizedESValueWithMaxTokenSummarize(
            "도서 관련 커맨드 생성 작업을 수행해야 함",
            esValue,
            [],
            800,
            "gpt-4o",
            esAliasTransManager
        )
        console.log("[*] 요약된 ESValue :", summary)
        console.log("[*] 요약된 ESValue 토큰 수 :", TokenCounter.getTokenCount(JSON.stringify(summary), "gpt-4o"))
    }
}

module.exports = ESValueSummaryGeneratorTest;