const ESActionsUtil = require("./ESActionsUtil")
const ESAliasTransManager = require("./ESAliasTransManager")
const { ESValueSummarizeWithFilter } = require("../../es-generators");
const { esActionUtilMocks, esConfigs, initialESValue } = require("./mocks");

class ESActionsUtilTest {
    static async test(onModelCreated) {
        let currentESValue = structuredClone(initialESValue)
        onModelCreated(currentESValue)
        await new Promise(resolve => setTimeout(resolve, 1000));

        const aliasTransManager = new ESAliasTransManager(currentESValue)
        for(const mock of esActionUtilMocks) {
            console.log("[*] 기존 이벤트 스토밍 정보: ", ESValueSummarizeWithFilter.getSummarizedESValue(
                currentESValue, [], aliasTransManager
            ))

            const mockActions = aliasTransManager.transToUUIDInActions(structuredClone(mock.actions))
            const createdESValue = ESActionsUtil.getActionAppliedESValue(
                mockActions, esConfigs.userInfo, esConfigs.information, currentESValue, null
            )
            
            console.log("[*] 업데이트된 이벤트 스토밍 정보: ", ESValueSummarizeWithFilter.getSummarizedESValue(
                createdESValue, [], aliasTransManager
            ))
            onModelCreated(createdESValue)
            currentESValue = createdESValue


            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

module.exports = ESActionsUtilTest