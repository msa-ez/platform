<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import { TokenCounterTest } from "../../modeling/generators/utils";
import {
    getAvailableServiceNames,
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
    TextParseHelperTest,
    getDefaultOptions,
    ModelInfoHelper,
    ModelOptionDto
} from "../../modeling/generators/features/AIGenerator"
import ESActionsUtilTest from "../../modeling/generators/es-ddl-generators/modules/ESActionsUtilTest";
import { mockedProgressDto, mockedProgressDtoUpdateCallback, mockedTraceInfoViewerDto } from "./mocks"
import { EsValueLangGraphStudioProxyTest, EsValueLangGraphStudioProxy } from "../../modeling/generators/proxies"

export default {
    name: "es-test-terminal",
    mounted() {
        window.addEventListener('keydown', this.handleKeyPressForTestTerminal);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyPressForTestTerminal);
    },
    methods: {
        handleKeyPressForTestTerminal(event) {
            if (event.altKey && event.key.toLowerCase() === 't') {
                this.promptCommand();
            }
        },


        promptCommand() {
            const COMMANDS = {
                directESGeneration: {
                    command: () => this._directESGeneration(),
                    description: "특정 시나리오로 바로 이벤트 스토밍 생성"
                },
                mockProgressDto: {
                    command: () => this._mockProgressDto(),
                    description: "AI 진행 상황 UI에 대한 Mock 데이터 표시"
                },
                EsValueInjection: {
                    command: () => this._EsValueInjection(),
                    description: "이벤트 스토밍 값을 강제로 삽입"
                },
                TempTest: {
                    command: () => this._TempTest(),
                    description: "임시 테스트"
                },
                TestTraceInfoViewer: {
                    command: () => this._testTraceInfoViewer(),
                    description: "TraceInfoViewer 테스트"
                },

                SanityCheckGeneratorTest: {command: async () => { await SanityCheckGeneratorTest.test() }},
                TokenCounterTest: { command: () => {TokenCounterTest.test()} },
                ESValueSummaryGeneratorTest: {command: async () => { await ESValueSummaryGeneratorTest.test() }},
                ESValueSummarizeWithFilterTest: {command: async () => { await ESValueSummarizeWithFilterTest.test() }},
                CreateAggregateActionsByFunctionsTest: {command: async () => { await CreateAggregateActionsByFunctionsTest.test() }},
                CreateAggregateClassIdByDraftsTest: {command: async () => { await CreateAggregateClassIdByDraftsTest.test() }},
                CreateCommandActionsByFunctionsTest: {command: async () => { await CreateCommandActionsByFunctionsTest.test() }},
                CreatePolicyActionsByFunctionsTest: {command: async () => { await CreatePolicyActionsByFunctionsTest.test() }},
                CommandGWTGeneratorByFunctionsTest: {command: async () => { await CommandGWTGeneratorByFunctionsTest.test() }},
                ModelInfoHelperTest: {command: async () => { await ModelInfoHelperTest.test() }},
                TextParseHelperTest: {command: async () => { await TextParseHelperTest.test() }},
                TextParseHelperTestError: {command: async () => { await TextParseHelperTest.testError() }},
                ESActionsUtilTest: {command: async () => { 
                    await ESActionsUtilTest.test((createdESValue) => {
                        this.changedByMe = true
                        this.$set(this.value, "elements", createdESValue.elements)
                        this.$set(this.value, "relations", createdESValue.relations)
                        this.forceRefreshCanvas() 
                    })
                }},
                EsValueLangGraphStudioProxyTest: {command: async () => { await EsValueLangGraphStudioProxyTest.test() }}
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

        
        _directESGeneration() {
            const selectedScenarioName = this.__getSelectedScenarioName()
            this.generateAggregatesFromDraft(getEsDraft(selectedScenarioName))
        },

        _mockProgressDto() {
            this.generatorProgressDto = mockedProgressDto
            mockedProgressDtoUpdateCallback(this.generatorProgressDto)
        },

        __getSelectedScenarioName() {
            const scenarioKeys = getAvailableServiceNames();
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
            
            if(!scenarioKeys.includes(selectedScenarioName)) {
                alert("유효하지 않은 시나리오 이름입니다.");
                throw new Error("유효하지 않은 시나리오 이름입니다.")
            }


            return selectedScenarioName
        },

        _EsValueInjection() {
            const esValue = prompt("이벤트 스토밍 값을 입력하세요:")
            if(!esValue) return

            this.value = JSON.parse(esValue)
            this.forceRefreshCanvas()
        },

        async _TempTest() {
            const result = await EsValueLangGraphStudioProxy.healthCheckUsingConfig()
            console.log(result)
        },

        _testTraceInfoViewer() {
            this.traceInfoViewerDto = structuredClone(mockedTraceInfoViewerDto)
        }
    }
}
</script>

  