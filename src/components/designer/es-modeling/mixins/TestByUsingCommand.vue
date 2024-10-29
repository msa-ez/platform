<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import ESValueSummarizeUtil_OnlyName from "../../modeling/generators/es-ddl-generators/modules/ESValueSummarizeUtil_OnlyName"
import ESValueSummarizeUtil from "../../modeling/generators/es-ddl-generators/modules/ESValueSummarizeUtil"
import ESActionsUtil from "../../modeling/generators/es-ddl-generators/modules/ESActionsUtil"

export default {
    name: "test-by-using-command",
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
            const COMMAND = prompt("테스트 커맨드 입력")
            if(!COMMAND) return

            switch(COMMAND) {
                case "TestESValueSummarizeUtilOnlyName":
                    this._test_ESValueSummarizeUtilOnlyName()
                    break

                default:
                    alert("유효하지 않은 커맨드입니다.")
                    break
            }
        },


        _test_ESValueSummarizeUtilOnlyName() {
            var me = this

            const summarizeESValue = ESValueSummarizeUtil_OnlyName.getFilteredSummarizedESValue(me.value)
            
            console.log(me.value)
            console.log(summarizeESValue)
        }
    }
}
</script>
  