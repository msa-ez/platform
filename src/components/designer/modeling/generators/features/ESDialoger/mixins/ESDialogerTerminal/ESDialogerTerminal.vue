<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import { runCommand } from "./runs/runCommand"
import { testCommand } from "./tests/testCommand"
import { getCommand } from "./gets/getCommand"

export default {
    name: "es-dialoger-terminal",
    mounted() {
        window.addEventListener('keydown', this.handleKeyPressForTerminal);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyPressForTerminal);
    },
    methods: {
        handleKeyPressForTerminal(event) {
            if (event.altKey && event.key.toLowerCase() === 't' && localStorage.getItem('isUseTerminal') === 'true') {
                this._stopStoryGenerating()
                this.promptCommand();
            }
        },

        _stopStoryGenerating() {
            this.isAnalizeResultSetted = true
            if(this.generator && this.generator.stop) this.generator.stop();
            if(this.state) this.state.startTemplateGenerate = false
            this.done = true;
        },


        async promptCommand() {
            const command = prompt('콘솔 명령어 입력 > ')
            if(!command) {
                alert("콘솔 명령어가 입력되지 않아서 종료합니다.")
                return
            }

            const commandParts = command.split(' ')
            const commandType = commandParts[0]
            const commandName = commandParts[1]
            const commandArgs = commandParts.slice(2)
            if(commandType === "run") {
                await runCommand(commandName, commandArgs, this)
            } else if (commandType === "test") {
                testCommand(commandName, commandArgs, this)
            } else if (commandType === "get") {
                getCommand(commandName, commandArgs, this)
            } else {
                alert("유효하지 않은 콘솔 명령어입니다.")
                return
            }
        }
    }
}
</script>

  