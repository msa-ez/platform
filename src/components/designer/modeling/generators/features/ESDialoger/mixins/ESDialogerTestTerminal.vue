<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import { JsonParsingUtilTest } from "../../../utils"
import { aggregateDraftScenarios } from "./mocks"
import {
    PreProcessingFunctionsGeneratorTest,
    DraftGeneratorByFunctionsTest,
    ExtractDDLFieldsGeneratorTest,
    AssignDDLFieldsToAggregateDraftTest,
    AssignPreviewFieldsToAggregateDraftTest,
    AddTraceToDraftOptionsGeneratorTest
} from "../../../es-generators";
import {
    DevideBoundedContextGeneratorTest,
    RecursiveRequirementsSummarizerTest,
    RecursiveRequirementsValidationGeneratorTest,
    RequirementsMappingGeneratorTest,
    RequirementsValidationGeneratorTest
} from "../generators";
import {
    ESDialogerTraceUtilTest
} from "../utils";
import {
     TraceUtilTest,
     TraceMarkdownUtilTest
} from "../../../utils";

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
                ExtractDDLFieldsGeneratorTest: {command: async () => { await ExtractDDLFieldsGeneratorTest.test("extractDDLFieldsGeneratorInputs") }},
                AssignDDLFieldsToAggregateDraftTest: {command: async () => { await AssignDDLFieldsToAggregateDraftTest.test("assignDDLFieldsToAggregateDraftInputs") }},
                AssignPreviewFieldsToAggregateDraftTest: {command: async () => { await AssignPreviewFieldsToAggregateDraftTest.test("assignPreviewFieldsToAggregateDraftInputs") }},
                RequirementsValidationGeneratorTest: {command: async () => { await RequirementsValidationGeneratorTest.test() }},
                RecursiveRequirementsValidationGeneratorTest: {command: async () => { await RecursiveRequirementsValidationGeneratorTest.test() }},
                DevideBoundedContextGeneratorTest: {command: async () => { await DevideBoundedContextGeneratorTest.test() }},
                DevideBoundedContextGeneratorTestWithSummarizedResult: {command: async () => { await DevideBoundedContextGeneratorTest.testWithSummarizedResult() }},
                RecursiveRequirementsSummarizerTest: {command: async () => { await RecursiveRequirementsSummarizerTest.test() }},
                RecursiveRequirementsSummarizerTestWithLargeText: {command: async () => { await RecursiveRequirementsSummarizerTest.testWithLargeText() }},
                RequirementsMappingGeneratorTest: {command: async () => { await RequirementsMappingGeneratorTest.test() }},
                AddTraceToDraftOptionsGeneratorTest: {command: async () => { await AddTraceToDraftOptionsGeneratorTest.test() }},
                ESDialogerTraceUtilTest: {command: async () => { await ESDialogerTraceUtilTest.test() }},
                testRefsMergeUtil: {command: async () => { await TraceUtilTest.testRefsMergeUtil() }},
                TraceMarkdownUtilTest: {command: async () => { await TraceMarkdownUtilTest.test() }},
                UserStoryChunksTest: {command: async () => { await RecursiveRequirementsSummarizerTest.testMakeUserStoryChunks() }},
            }
            
            // 전체 명령어 목록을 콘솔에 출력
            console.clear();
            console.log('='.repeat(60));
            console.log('📋 사용 가능한 테스트 커맨드 목록');
            console.log('='.repeat(60));
            
            Object.keys(COMMANDS).forEach((cmd, index) => {
                const description = COMMANDS[cmd].description || '';
                console.log(`${index.toString().padStart(2, ' ')}. ${cmd}`);
                if (description) {
                    console.log(`    └─ ${description}`);
                }
            });
            
            console.log('='.repeat(60));
            console.log('💡 위 목록에서 번호 또는 커맨드명을 입력하세요');
            console.log('='.repeat(60));

            // 간단한 prompt 메시지
            let inputedCommand = prompt('테스트 커맨드 번호 또는 이름을 입력하세요:\n(전체 목록은 개발자 도구 콘솔을 확인하세요)')
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
            if(!this.value) this.value = {}
            this.value.userStory = selectedScenario.projectInfo.userStory
            this.state = selectedScenario.state
            this.resultDevideBoundedContext = selectedScenario.resultDevideBoundedContext
            this.boundedContextVersion = selectedScenario.boundedContextVersion
            this.frontEndResults = selectedScenario.frontEndResults
            this.pbcResults = selectedScenario.pbcResults
            this.pbcLists = selectedScenario.pbcLists
            this.projectInfo = selectedScenario.projectInfo
            this.requirementsValidationResult = selectedScenario.requirementsValidationResult
            this.commandReadModelData = selectedScenario.commandReadModelData
            this.siteMap = selectedScenario.siteMap
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

  