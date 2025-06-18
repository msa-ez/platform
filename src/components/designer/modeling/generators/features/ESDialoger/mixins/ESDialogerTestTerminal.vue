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
        window.addEventListener('keydown', this.handleKeyPressForTestTerminal);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyPressForTestTerminal);
    },
    methods: {
        handleKeyPressForTestTerminal(event) {
            if (event.altKey && event.key.toLowerCase() === 't') {
                this.__stopStoryGenerating()
                this.promptCommand();
            }
        },


        promptCommand() {
            const COMMANDS = {
                directGenerateAggregateDrafts: {
                    command: () => this._directGenerateAggregateDrafts(),
                    description: "특정한 시나리오로 바로 애그리거트 초안 생성 실행"
                },
                directGenerateFromAggregateDrafts: {
                    command: () => this._directGenerateFromAggregateDrafts(),
                    description: "특정한 시나리오로 바로 이벤트 스토밍 생성 실행"
                },
                showAggregateDraftUI: {
                    command: () => this._showAggregateDraftUI(),
                    description: "특정한 시나리오 Mock 데이터로 애그리거트 초안 UI 표시"
                },
                mermaidStringTest: {
                    command: () => this._mermaidStringTest(),
                    description: "Mermaid 문자열 테스트"
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
            const selectedScenario = this.__getSelectedScenario()
            this._initValuesFromSelectedScenario(selectedScenario)
            this.generateAggregateDrafts(selectedScenario.selectedStructureOption)
        },

        _directGenerateFromAggregateDrafts() {
            const selectedScenario = this.__getSelectedScenario()
            this._initValuesFromSelectedScenario(selectedScenario)
            this.generateFromAggregateDrafts(selectedScenario.draftOptions)
        },

        _showAggregateDraftUI() {
            const selectedScenario = this.__getSelectedScenario()
            this.messages = selectedScenario.messages
            this._initValuesFromSelectedScenario(selectedScenario)
        },

        _initValuesFromSelectedScenario(selectedScenario) {
            this.value.userStory = selectedScenario.userStory
            this.state = selectedScenario.state
            this.resultDevideBoundedContext = selectedScenario.resultDevideBoundedContext
        },

        _mermaidStringTest() {
            this.messages = [
                {
                    type: 'mermaidStringTest'
                }
            ]
        },

        _TempTest() {
        },


        __getSelectedScenario() {
            const scenarioKeys = Object.keys(aggregateDraftScenarios);
            const scenarioList = scenarioKeys.map((name, index) => 
                `${index}. ${name}`
            ).join('\n');
            
            const selectedInput = prompt(`시나리오 이름 또는 번호를 입력하세요:\n\n${scenarioList}`);
            if(!selectedInput) return
            

            let selectedScenarioName = selectedInput;
            
            if(!isNaN(selectedInput)) {
                const inputIndex = parseInt(selectedInput);
                if(inputIndex >= 0 && inputIndex < scenarioKeys.length) {
                    selectedScenarioName = scenarioKeys[inputIndex];
                }
            }
            
            if(!aggregateDraftScenarios[selectedScenarioName]) {
                alert("유효하지 않은 시나리오 이름입니다.");
                return;
            }

            return aggregateDraftScenarios[selectedScenarioName]
        },

        __stopStoryGenerating() {
            this.isAnalizeResultSetted = true
            if(this.generator && this.generator.stop) this.generator.stop();
            if(this.state) this.state.startTemplateGenerate = false
            this.done = true;
        }
    }
}
</script>

  