const CommandGWTGeneratorByFunctions = require("./CommandGWTGeneratorByFunctions")
const { ESValueSummarizeWithFilter } = require("../helpers")
const ESAliasTransManager = require("../../es-ddl-generators/modules/ESAliasTransManager")
const { getEsValue, getEsDraft } = require("../mocks")

class CommandGWTGeneratorByFunctionsTest {
    static async test() {
        const esValue = getEsValue("libraryService", []);


        console.log("[*] 기존 이벤트 스토밍 정보: ", ESValueSummarizeWithFilter.getSummarizedESValue(
            esValue, [], new ESAliasTransManager(esValue)
        ))

        const generator = CommandGWTGeneratorByFunctions.createGeneratorByDraftOptions({
            onGenerationSucceeded: (returnObj) => {
                if(returnObj.modelValue && returnObj.modelValue.commandsToReplace) {
                    for(const command of returnObj.modelValue.commandsToReplace)
                        esValue.elements[command.id] = command
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
            getEsDraft("libraryService"),
            esValue
        )
        generator.generateIfInputsExist()
    }
}

module.exports = CommandGWTGeneratorByFunctionsTest;