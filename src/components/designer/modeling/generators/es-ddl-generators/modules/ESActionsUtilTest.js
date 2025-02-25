const ESActionsUtil = require("./ESActionsUtil")
const ESAliasTransManager = require("./ESAliasTransManager")
const { ESValueSummarizeWithFilter } = require("../../es-generators");
const { esActionUtilMocks, esConfigs } = require("./mocks");

class ESActionsUtilTest {
    static test() {
        for(const mock of esActionUtilMocks) {
            console.log("[*] 기존 이벤트 스토밍 정보: ", ESValueSummarizeWithFilter.getSummarizedESValue(
                mock.currentESValue, [], new ESAliasTransManager(mock.currentESValue)
            ))

            const createdESValue = ESActionsUtil.getActionAppliedESValue(
                mock.actions, esConfigs.userInfo, esConfigs.information, mock.currentESValue, null
            )
            
            console.log("[*] 업데이트된 이벤트 스토밍 정보: ", ESValueSummarizeWithFilter.getSummarizedESValue(
                createdESValue, [], new ESAliasTransManager(createdESValue)
            ))
        }
    }
}

module.exports = ESActionsUtilTest