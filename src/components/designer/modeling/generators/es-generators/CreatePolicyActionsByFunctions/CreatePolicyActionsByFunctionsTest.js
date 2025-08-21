const CreatePolicyActionsByFunctions = require("./CreatePolicyActionsByFunctions")
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { getEsValue, getEsDraft, esConfigs } = require("../mocks")

class CreatePolicyActionsByFunctionsTest {
    static async test() {
        const serviceName = "libraryService"
        const esValue = getEsValue(serviceName, ["policy"]);


        console.log("[*] 기존 이벤트 스토밍 정보: ", ESValueSummarizeWithFilter.getSummarizedESValue(
            esValue, [], new ESAliasTransManager(esValue)
        ))

        const generator = CreatePolicyActionsByFunctions.createGeneratorByDraftOptions({
            onGenerationSucceeded: (returnObj) => {
                if(returnObj.modelValue && returnObj.modelValue.createdESValue) {
                    esValue.elements = returnObj.modelValue.createdESValue.elements
                    esValue.relations = returnObj.modelValue.createdESValue.relations
                }

                console.log("[*] 업데이트된 이벤트 스토밍 정보: ", ESValueSummarizeWithFilter.getSummarizedESValue(
                    esValue, [], new ESAliasTransManager(esValue)
                ))
            },
            
            onGenerationDone: () => {
                console.log("[*] 이벤트 스토밍 생성 완료: ", ESValueSummarizeWithFilter.getSummarizedESValue(
                    esValue, [], new ESAliasTransManager(esValue)
                ))
            }
        })


        generator.initInputs(
            getEsDraft(serviceName),
            esValue,
            esConfigs.userInfo,
            esConfigs.information
        )
        generator.generateIfInputsExist()
    }
}

module.exports = CreatePolicyActionsByFunctionsTest;