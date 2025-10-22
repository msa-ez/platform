<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import { runCommand } from "./runs/runCommand"
import { testCommand } from "./tests/testCommand"
import { getCommand } from "./gets/getCommand"
import { setCommand } from "./sets/setCommand"
import { utilCommand } from "./utils/utilCommand"
import { checkCommand } from "./checks/checkCommand"
import { helpCommand } from "./helps/helpCommand"

const commandHandlers = {
    run: runCommand,
    test: testCommand,
    get: getCommand,
    set: setCommand,
    util: utilCommand,
    check: checkCommand,
    help: helpCommand
}

export default {
    name: "es-terminal",
    mounted() {
        window.addEventListener('keydown', this.handleKeyPressForTerminal);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyPressForTerminal);
    },
    data() {
        return {
            terminalUnlockTryCount: 0,
            previousCommandLocalKey: 'previousCommand_ESTerminal',
            isTerminalEnabled: false
        }
    },
    created() {
        this.isTerminalEnabled = localStorage.getItem('isUseTerminal') === 'true'
    },
    methods: {
        handleKeyPressForTerminal(event) {
            if (event.altKey && event.key.toLowerCase() === 't') {
                if(this.isTerminalEnabled) {
                    this._stopStoryGenerating()
                    this.promptCommand();
                } else {
                    this.terminalUnlockTryCount++
                    if(this.terminalUnlockTryCount >= 5) {
                        localStorage.setItem('isUseTerminal', 'true')
                        this.isTerminalEnabled = true
                        alert("콘솔 명령어 기능이 활성화됨")
                        return
                    }
                }
            }
        },

        _stopStoryGenerating() {
            this.isAnalizeResultSetted = true
            if(this.generator && this.generator.stop) this.generator.stop();
            if(this.state) this.state.startTemplateGenerate = false
            this.done = true;
        },


        async promptCommand() {
            let command = prompt('콘솔 명령어 입력 > ')
            if(!command) {
                alert("콘솔 명령어가 입력되지 않아서 종료합니다.")
                return
            }
            if(command === "r") {
                command = localStorage.getItem(this.previousCommandLocalKey)
                if(!command) {
                    alert("이전 명령어가 없어서 종료합니다.")
                    return
                }
            }

            const commandParts = command.split(' ')
            const commandType = commandParts[0]
            const commandName = commandParts[1]
            const commandArgs = commandParts.slice(2)

            const handler = commandHandlers[commandType]
            if(handler) {
                await handler(commandName, commandArgs, this)
            } else {
                alert("유효하지 않은 콘솔 명령어입니다.\n사용 가능한 명령어를 보려면 'help' 명령어를 입력하세요.")
                return
            }
            localStorage.setItem(this.previousCommandLocalKey, command)
        }
    }
}
</script>

  