<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import { JsonParsingUtilTest } from "../../../utils"
import { aggregateDraftScenarios } from "./mocks"
import {
    PreProcessingFunctionsGeneratorTest,
    DraftGeneratorByFunctionsTest
} from "../../../es-generators";

export default {
    name: "es-dialoger-test-terminal",
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
                directGenerateAggregateDrafts: {
                    command: () => this._directGenerateAggregateDrafts(),
                    description: "민원신청발급 시나리오로 바로 애그리거트 초안 생성 실행"
                },
                directGenerateFromAggregateDrafts: {
                    command: () => this._directGenerateFromAggregateDrafts(),
                    description: "민원신청발급 초안으로 바로 이벤트 스토밍 생성 실행"
                },
                showAggregateDraftUI: {
                    command: () => this._showAggregateDraftUI(),
                    description: "민원신청발급 시나리오 Mock 데이터로 애그리거트 초안 UI 표시"
                },
                TempTest: {
                    command: () => this._TempTest(),
                    description: "임시 테스트"
                },
                JsonParsingUtilTest: {command: () => {JsonParsingUtilTest.test()}},
                PreProcessingFunctionsGeneratorTest: {command: async () => { await PreProcessingFunctionsGeneratorTest.test() }},
                DraftGeneratorByFunctionsTest: {command: async () => { await DraftGeneratorByFunctionsTest.test("draftGeneratorByFunctionsInputs") }},
                DraftGeneratorByFunctionsTestWithFeedback: {command: async () => { await DraftGeneratorByFunctionsTest.test("draftGeneratorByFunctionsInputsWithFeedback") }},
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


        _directGenerateAggregateDrafts() {
            this.generator.stop();
            this.state.startTemplateGenerate = false
            this.done = true;
            this.generateAggregateDrafts(aggregateDraftScenarios.civilApplication.selectedStructureOption)
        },

        _directGenerateFromAggregateDrafts() {
            const civilApplicationScenario = aggregateDraftScenarios.civilApplication
            this.value.userStory = civilApplicationScenario.userStory
            this.state = civilApplicationScenario.state
            this.generateFromAggregateDrafts(civilApplicationScenario.draftOptions)
        },

        _showAggregateDraftUI() {
            this.messages = aggregateDraftScenarios.civilApplication.messages
        },

        _TempTest() {}
    }
}
</script>

  