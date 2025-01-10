<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>

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
                directJumpByLibrary: {
                    command: () => this._directJumpByLibrary(),
                    description: "도서-대출 도서관 시나리오로 바로 ES 모델링을 실행"
                }
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


        _directJumpByLibrary() {
            this.generator.stop();
            this.state.startTemplateGenerate = false
            this.done = true;
            
            this.value.userStory = `도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.

'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.

'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.

대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.

각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.`

            this.state = {
    "generator": "DevideBoundedContextGenerator",
    "firstMessageIsTyping": false,
    "secondMessageIsTyping": false,
    "userStory": "",
    "communicationStyle": "Choreography",
    "aggregateDetail": false,
    "uiStyle": null,
    "startTemplateGenerate": false
}

            const selectedBoundedContext = {
    "boundedContexts": [
        {
            "name": "BookManagement",
            "alias": "도서 관리",
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ],
            "requirements": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
        },
        {
            "name": "LoanManagement",
            "alias": "대출/반납 관리",
            "aggregates": [
                {
                    "name": "Loan",
                    "alias": "대출"
                },
                {
                    "name": "Member",
                    "alias": "회원"
                }
            ],
            "requirements": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해. 대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해."
        }
    ],
    "relations": [
        {
            "name": "BookLoanStatusUpdate",
            "type": "Customer-Supplier",
            "upStream": "BookManagement",
            "downStream": "LoanManagement"
        }
    ],
    "thoughts": "도서 관리와 대출/반납 관리는 서로 다른 업무 전문성을 가지고 있으며, 도서의 상태 관리와 대출 프로세스는 각각의 응집도가 높은 기능이다. 두 컨텍스트는 도서의 상태 변경을 통해 연결되므로 Customer-Supplier 관계로 설정하였다.",
    "explanations": [
        {
            "sourceContext": "BookManagement",
            "targetContext": "LoanManagement",
            "relationType": "Customer-Supplier",
            "reason": "도서 관리 시스템은 도서의 상태를 관리하고, 대출/반납 시스템은 그 상태를 기반으로 대출 프로세스를 관리한다. 따라서 도서 관리 시스템이 상위 시스템으로서 도서 상태 정보를 제공한다.",
            "interactionPattern": "도서 상태 변경 시 이벤트를 발행하고, 대출/반납 시스템은 이를 구독하여 상태를 업데이트한다."
        }
    ],
    "devisionAspect": "조직적"
}

            this.jump(selectedBoundedContext)
        }
    }
}
</script>
  