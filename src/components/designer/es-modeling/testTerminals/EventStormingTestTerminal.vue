<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import { TokenCounterTest } from "../../modeling/generators/utils";
import {
    getEsDraft,
    ESValueSummaryGeneratorTest,
    ESValueSummarizeWithFilterTest,
    CreateAggregateActionsByFunctionsTest,
    CreateAggregateClassIdByDraftsTest,
    CreateCommandActionsByFunctionsTest,
    CreatePolicyActionsByFunctionsTest,
    CommandGWTGeneratorByFunctionsTest,
    PreProcessingFunctionsGeneratorTest,
    DraftGeneratorByFunctionsTest,
    SanityCheckGeneratorTest
} from "../../modeling/generators/es-generators";
import { 
    ModelInfoHelperTest,
    TextParseHelperTest
} from "../../modeling/generators/features/AIGenerator"
import ESActionsUtilTest from "../../modeling/generators/es-ddl-generators/modules/ESActionsUtilTest";
import { mockedProgressDto, mockedProgressDtoUpdateCallback } from "./mocks"

export default {
    name: "es-test-terminal",
    mounted() {
        window.addEventListener('keydown', this.handleKeyPress);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyPress);
    },
    methods: {
        handleKeyPress(event) {
            if (event.altKey && event.key.toLowerCase() === 't') {
                this.promptCommand();
            }
        },


        promptCommand() {
            const COMMANDS = {
                directESGenerationByLibrary: {
                    command: () => this._directESGenerationByLibrary(),
                    description: "도서-대출 초안 선택을 넘기고 바로 이벤트 스토밍 생성"
                },
                mockProgressDto: {
                    command: () => this._mockProgressDto(),
                    description: "AI 진행 상황 UI에 대한 Mock 데이터 표시"
                },
                TempTest: {
                    command: () => this._TempTest(),
                    description: "임시 테스트"
                },

                SanityCheckGeneratorTest: {command: async () => { await SanityCheckGeneratorTest.test() }},
                TokenCounterTest: { command: () => {TokenCounterTest.test()} },
                ESValueSummaryGeneratorTest: {command: async () => { await ESValueSummaryGeneratorTest.test() }},
                ESValueSummarizeWithFilterTest: {command: async () => { await ESValueSummarizeWithFilterTest.test() }},
                PreProcessingFunctionsGeneratorTest: {command: async () => { await PreProcessingFunctionsGeneratorTest.test() }},
                DraftGeneratorByFunctionsTest: {command: async () => { await DraftGeneratorByFunctionsTest.test("draftGeneratorByFunctionsInputs") }},
                DraftGeneratorByFunctionsTestWithFeedback: {command: async () => { await DraftGeneratorByFunctionsTest.test("draftGeneratorByFunctionsInputsWithFeedback") }},
                CreateAggregateActionsByFunctionsTest: {command: async () => { await CreateAggregateActionsByFunctionsTest.test() }},
                CreateAggregateClassIdByDraftsTest: {command: async () => { await CreateAggregateClassIdByDraftsTest.test() }},
                CreateCommandActionsByFunctionsTest: {command: async () => { await CreateCommandActionsByFunctionsTest.test() }},
                CreatePolicyActionsByFunctionsTest: {command: async () => { await CreatePolicyActionsByFunctionsTest.test() }},
                CommandGWTGeneratorByFunctionsTest: {command: async () => { await CommandGWTGeneratorByFunctionsTest.test() }},
                ModelInfoHelperTest: {command: async () => { await ModelInfoHelperTest.test() }},
                TextParseHelperTest: {command: async () => { await TextParseHelperTest.test() }},
                TextParseHelperTestError: {command: async () => { await TextParseHelperTest.testError() }},
                ESActionsUtilTest: {command: async () => { await ESActionsUtilTest.test() }}
            }
            

            const commandList = Object.keys(COMMANDS)
                .map((cmd, index) => ((COMMANDS[cmd].description) ? 
                    `${index}. ${cmd}: ${COMMANDS[cmd].description}` : `${index}. ${cmd}`))
                .join('\n')

            let inputedCommand = prompt(this._getPromptMessage(commandList))
            if(!inputedCommand) return

            if(!isNaN(inputedCommand)) {
                const commandKeys = Object.keys(COMMANDS)
                const inputedIndex = parseInt(inputedCommand)
                if(inputedIndex >= 0 && inputedIndex < commandKeys.length) {
                    inputedCommand = commandKeys[inputedIndex]
                }
            }


            if(!COMMANDS[inputedCommand]) {
                alert("유효하지 않은 커맨드입니다.")
                return
            }
            COMMANDS[inputedCommand].command()
        },

        _getPromptMessage(commandList) {
            return `테스트 커맨드를 선택하세요:\n` +
                `(숫자 또는 커맨드명 입력)\n` +
                `-------------------\n` +
                `${commandList}\n` +
                `-------------------`
        },

        
        _directESGenerationByLibrary() {
            this.generateAggregatesFromDraft(getEsDraft("libraryService"))
        },

        _mockProgressDto() {
            this.generatorProgressDto = mockedProgressDto
            mockedProgressDtoUpdateCallback(this.generatorProgressDto)
        },

        async _TempTest() {
        }
    }
}
</script>

  