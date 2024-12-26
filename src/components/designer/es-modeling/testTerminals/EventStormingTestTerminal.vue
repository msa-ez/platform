<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import ESValueSummarizeWithFilterUtil from "../../modeling/generators/es-ddl-generators/modules/ESValueSummarizeWithFilterUtil"
import ESAliasTransManager from "../../modeling/generators/es-ddl-generators/modules/ESAliasTransManager"
import DraftGeneratorByFunctions from "../../modeling/generators/es-ddl-generators/DraftGeneratorByFunctions";

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
            let COMMAND = prompt("테스트 커맨드 입력")
            if(!COMMAND) {
                COMMAND = "test_ESModeling"
            }

            const commands = {
                test_ESModeling: () => this._test_ESModeling()
            }

            const commandFunction = commands[COMMAND]
            if (commandFunction) commandFunction()
            else alert("유효하지 않은 커맨드입니다.")
        },

        _test_ESModeling() {
            console.log(
                ESValueSummarizeWithFilterUtil.getSummarizedESValue(this.value, [], new ESAliasTransManager(this.value))
            )
            console.log(
                ESValueSummarizeWithFilterUtil.getSummarizedESValue(this.value, ["id"], new ESAliasTransManager(this.value))
            )
        }
    }
}
</script>

  