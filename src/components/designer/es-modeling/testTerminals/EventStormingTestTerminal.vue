<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import TokenCounterTest from "../../modeling/generators/utils/TokenCounter/TokenCounterTest";
import ESValueSummaryGeneratorTest from "../../modeling/generators/es-generators/ESValueSummaryGenerator/ESValueSummaryGeneratorTest";
import ESValueSummarizeWithFilterTest from "../../modeling/generators/es-generators/helpers/ESValueSummarizeWithFilter/ESValueSummarizeWithFilterTest";
import CreateAggregateActionsByFunctionsTest from "../../modeling/generators/es-generators/CreateAggregateActionsByFunctions/CreateAggregateActionsByFunctionsTest";
import { getEsDraft } from "../../modeling/generators/es-generators/mocks";

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
                TempTest: {
                    command: () => this._TempTest(),
                    description: "임시 테스트"
                },

                TokenCounterTest: { command: () => {TokenCounterTest.test()} },
                ESValueSummaryGeneratorTest: {command: async () => { await ESValueSummaryGeneratorTest.test(this.value) }},
                ESValueSummarizeWithFilterTest: {command: async () => { await ESValueSummarizeWithFilterTest.test(this.value) }},
                CreateAggregateActionsByFunctionsTest: {command: async () => { await CreateAggregateActionsByFunctionsTest.test() }}
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
            this.generateFromDraftWithXAI(getEsDraft("libraryService"))
        },

        async _TempTest() {
        }
    }
}
</script>

  