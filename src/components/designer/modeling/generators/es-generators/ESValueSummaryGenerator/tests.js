const ESValueSummaryGenerator = require("./ESValueSummaryGenerator")
const { libraryEsValue } = require("./mocks");
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { TokenCounter } = require("../../utils")

class ESValueSummaryGeneratorTest {
    static test(esValue=null) {
        if(!esValue) esValue = JSON.parse(JSON.stringify(libraryEsValue));
        
        
        const summariezedESValue = ESValueSummarizeWithFilter.getSummarizedESValue(
            esValue, [], new ESAliasTransManager(esValue)
        )
        console.log(summariezedESValue)
        console.log("[*] 전체 ESValue 토큰 수 :", TokenCounter.getTokenCount(JSON.stringify(summariezedESValue), "gpt-4o"))


        const esValueSummaryGenerator = new ESValueSummaryGenerator({
            input: {
                "context": "도서 관련 커맨드 생성 작업을 수행해야 함",
                "esValue": esValue,
                "keysToFilter": [],
                "maxTokens": 800,
                "tokenCalcModel": "gpt-4o"
            },

            onModelCreated: (returnObj) => {
                
            },

            onGenerationSucceeded: (returnObj) => {
                console.log("[*] 요약 토큰 수 :", TokenCounter.getTokenCount(JSON.stringify(returnObj.modelValue.summary), "gpt-4o"))
            }
        })

        esValueSummaryGenerator.generate()
    }
}

module.exports = ESValueSummaryGeneratorTest;