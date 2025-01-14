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
                directGenerateAggregateDrafts: {
                    command: () => this._directGenerateAggregateDrafts(),
                    description: "도서관 시나리오 및 도서-대출 BC 구성으로 바로 애그리거트 초안 생성 실행"
                },
                directGenerateFromAggregateDrafts: {
                    command: () => this._directGenerateFromAggregateDrafts(),
                    description: "도서관 시나리오 및 도서-대출 BC 초안으로 바로 이벤트 스토밍 생성 실행"
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


        _directGenerateAggregateDrafts() {
            this.generator.stop();
            this.state.startTemplateGenerate = false
            this.done = true;

            const selectedStructureOption = {
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
            "requirements": [
                {
                    "type": "userStory",
                    "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                },
                {
                    "type": "ddl",
                    "text": "도서명, ISBN, 저자, 출판사, 카테고리"
                }
            ]
        },
        {
            "name": "LoanManagement",
            "alias": "대출/반납",
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
            "requirements": [
                {
                    "type": "userStory",
                    "text": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해."
                },
                {
                    "type": "userStory",
                    "text": "대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해."
                },
                {
                    "type": "userStory",
                    "text": "각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
                }
            ]
        }
    ],
    "relations": [
        {
            "name": "BookLoanIntegration",
            "type": "Customer-Supplier",
            "upStream": {
                "name": "BookManagement",
                "alias": "도서 관리"
            },
            "downStream": {
                "name": "LoanManagement",
                "alias": "대출/반납"
            }
        }
    ],
    "thoughts": "도서 관리와 대출/반납 기능은 각각의 독립적인 도메인으로, 도서의 상태 관리와 대출 프로세스를 담당합니다. 도서 관리에서는 도서의 등록 및 상태 관리에 집중하고, 대출/반납에서는 대출 프로세스와 회원 관리에 중점을 둡니다. 두 도메인은 도서의 상태 정보를 공유하지만, 각각의 비즈니스 로직을 독립적으로 유지합니다.",
    "explanations": [
        {
            "sourceContext": "도서 관리",
            "targetContext": "대출/반납",
            "relationType": "Customer-Supplier",
            "reason": "대출/반납 시스템은 도서 관리 시스템의 도서 상태 정보를 활용하여 대출 프로세스를 수행합니다. 도서 관리가 상위 시스템으로, 도서의 상태 정보를 제공합니다.",
            "interactionPattern": "REST API를 통해 도서 상태 정보를 조회하고 갱신합니다."
        }
    ],
    "devisionAspect": "도메인"
}
            this.generateAggregateDrafts(selectedStructureOption)
        },

        _directGenerateFromAggregateDrafts() {
            const selectedDrafts = {
        "BookManagement": {
            "structure": [
                {
                    "aggregate": {
                        "name": "Book",
                        "alias": "도서"
                    },
                    "entities": [],
                    "valueObjects": [
                        {
                            "name": "LoanReference",
                            "alias": "대출 참조",
                            "referencedAggregate": {
                                "name": "Loan",
                                "alias": "대출"
                            }
                        },
                        {
                            "name": "BookCategory",
                            "alias": "도서 카테고리"
                        },
                        {
                            "name": "BookStatus",
                            "alias": "도서 상태"
                        }
                    ]
                }
            ],
            "analysis": {
                "transactionalConsistency": "단일 Aggregate 경계를 통해 강한 일관성을 유지하며 트랜잭션 안전성을 보장",
                "performanceScalability": "단일 Aggregate 접근으로 단순하지만, 높은 부하에서는 성능 병목이 발생할 가능성 존재",
                "domainAlignment": "도서 등록 및 관리라는 도메인 목표와 높은 일치도",
                "maintainability": "구조가 단순하여 유지보수가 용이하나 기능 확장 시 복잡성 증가 가능",
                "futureFlexibility": "추가 기능 확장에는 구조적 변경이 필요할 수 있음"
            },
            "pros": {
                "cohesion": "도서와 상태 관리에 초점이 맞춰진 높은 응집도",
                "coupling": "Loan과의 최소 참조를 통해 낮은 결합도",
                "consistency": "강한 트랜잭션 일관성 제공",
                "encapsulation": "도서 관련 비즈니스 규칙이 명확히 캡슐화됨",
                "complexity": "구조가 단순하고 명확함",
                "independence": "다른 Aggregate와 독립적으로 작동 가능",
                "performance": "도서 정보와 상태 관리를 단일 Aggregate에서 처리"
            },
            "cons": {
                "cohesion": "모든 도서 상태 관리 규칙을 포함할 경우 응집도가 과도해질 수 있음",
                "coupling": "Loan과의 참조가 필요",
                "consistency": "모든 상태 관리 로직이 포함되므로 관리 복잡도 증가 가능",
                "encapsulation": "상태 변경 규칙이 복잡할 경우 내부 논리 부담 증가",
                "complexity": "확장 시 복잡도가 증가 가능",
                "independence": "Loan 정보 없이 도서 상태 관리가 불가능",
                "performance": "대량 데이터 처리 시 병목 가능"
            },
            "isAIRecommended": false,
            "boundedContext": {
                "name": "BookManagement",
                "alias": "도서 관리",
                "displayName": "도서 관리",
                "description": [
                    {
                        "type": "userStory",
                        "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                    }
                ],
                "aggregates": [
                    {
                        "name": "Book",
                        "alias": "도서"
                    }
                ]
            },
            "description": "{\"userStories\":[{\"title\":\"도서 등록\",\"description\":\"도서 관리자 입장에서 새로운 도서를 등록하여 도서 목록을 관리할 수 있어야 한다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 한다.\",\"ISBN은 13자리 숫자여야 하며 중복 등록이 불가능하다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중 하나를 선택해야 한다.\",\"등록된 도서는 기본적으로 '대출가능' 상태여야 한다.\"]},{\"title\":\"도서 상태 관리\",\"description\":\"도서 관리자 입장에서 대출, 반납, 예약 상태 변경 및 도서 폐기 처리를 통해 도서를 관리할 수 있어야 한다.\",\"acceptance\":[\"도서 상태는 '대출가능', '대출중', '예약중', '폐기' 중 하나여야 한다.\",\"대출 또는 반납 시 상태가 자동으로 업데이트되어야 한다.\",\"폐기된 도서는 대출이 불가능해야 한다.\",\"훼손 또는 분실된 도서는 폐기 처리할 수 있어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"isbn\",\"type\":\"string\",\"required\":true,\"validation\":\"13자리 숫자\",\"isUnique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"date\",\"required\":false},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"반납완료\",\"예약중\"]}]},\"businessRules\":[{\"businessRulesThoughts\":{\"summary\":\"ISBN 유효성 검증 규칙\",\"details\":{\"validationComplexity\":\"간단한 형식 및 중복 체크\",\"businessImpact\":\"데이터의 무결성 유지\",\"maintainability\":\"추가 ISBN 형식이 생길 경우 확장 가능\"},\"additionalConsiderations\":\"ISBN의 글로벌 규격 준수 여부 확인 필요\"},\"name\":\"ISBNValidation\",\"description\":\"ISBN은 13자리 숫자여야 하며 중복 등록이 불가능하다.\"},{\"businessRulesThoughts\":{\"summary\":\"도서 상태 전환 규칙\",\"details\":{\"validationComplexity\":\"자동 상태 전환 로직 구현\",\"businessImpact\":\"도서 관리 프로세스 간소화\",\"maintainability\":\"상태 추가 시 업데이트 필요\"},\"additionalConsiderations\":\"상태 전환 시 데이터 변경 기록 유지 필요\"},\"name\":\"BookStatusChange\",\"description\":\"대출, 반납, 예약 상황에 따라 도서 상태가 자동으로 변경되어야 한다.\"},{\"businessRulesThoughts\":{\"summary\":\"폐기 도서 대출 제한 규칙\",\"details\":{\"validationComplexity\":\"간단한 상태 조건 체크\",\"businessImpact\":\"대출 관리 정확성 향상\",\"maintainability\":\"규칙 자체는 유지보수가 용이\"},\"additionalConsiderations\":\"폐기된 도서 데이터의 명확한 구분 필요\"},\"name\":\"DiscardedBookRestriction\",\"description\":\"폐기된 도서는 대출이 불가능해야 한다.\"}],\"interfaces\":{\"BookManagement\":{\"interfaceThoughts\":{\"summary\":\"도서 관리 인터페이스\",\"details\":{\"usability\":\"간단하고 명확한 입력 폼 제공\",\"dataFlow\":\"도서 등록 및 상태 업데이트를 지원\",\"responsiveness\":\"빠른 상태 전환 및 데이터 저장 가능\"},\"additionalConsiderations\":\"도서 상태 변경에 대한 실시간 업데이트 필요\"},\"sections\":[{\"name\":\"BookRegistration\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]}],\"actions\":[\"Submit\",\"Clear\"]},{\"name\":\"BookStatusManagement\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true},{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"status\",\"type\":\"select\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}],\"actions\":[\"UpdateStatus\",\"Discard\"]}]}}}}"
        },
        "LoanManagement": {
            "structure": [
                {
                    "aggregate": {
                        "name": "Loan",
                        "alias": "대출"
                    },
                    "entities": [
                        {
                            "name": "LoanDetail",
                            "alias": "대출 세부 정보"
                        }
                    ],
                    "valueObjects": [
                        {
                            "name": "Member",
                            "alias": "회원"
                        },
                        {
                            "name": "BookReference",
                            "alias": "도서 참조",
                            "referencedAggregate": {
                                "name": "Book",
                                "alias": "도서"
                            }
                        },
                        {
                            "name": "LoanStatus",
                            "alias": "대출 상태"
                        }
                    ]
                }
            ],
            "analysis": {
                "transactionalConsistency": "단일 Aggregate 경계 내에서 강한 일관성을 유지하여 대출 생명 주기를 원자적으로 처리",
                "performanceScalability": "기본 작업에 대해 좋은 성능을 제공하지만 복잡한 쿼리에서는 확장성 문제 발생 가능",
                "domainAlignment": "핵심 대출 도메인 개념 및 비즈니스 규칙과 밀접하게 정렬됨",
                "maintainability": "단순한 구조로 유지보수가 용이하지만 기능이 증가함에 따라 복잡성이 증가할 가능성 있음",
                "futureFlexibility": "구조적 변경 없이 광범위한 기능 추가에 제한적"
            },
            "pros": {
                "cohesion": "대출 중심의 높은 응집성",
                "coupling": "ValueObject 참조를 통해 낮은 결합도",
                "consistency": "대출 경계 내에서 강한 일관성",
                "encapsulation": "잘 캡슐화된 대출 로직",
                "complexity": "단순하고 직관적인 구조",
                "independence": "Member 및 Book과 독립적으로 발전 가능",
                "performance": "효율적인 대출 작업"
            },
            "cons": {
                "cohesion": "대출 기능이 증가할 경우 분할 필요",
                "coupling": "Member 및 Book Aggregate에 의존",
                "consistency": "세심한 트랜잭션 관리 필요",
                "encapsulation": "일부 대출 규칙이 UI로 누출될 가능성",
                "complexity": "참조 동기화 관리 필요",
                "independence": "Member 및 Book 없이 작동 불가",
                "performance": "전체 대출 정보를 위해 다중 Aggregate 조회 필요"
            },
            "isAIRecommended": false,
            "boundedContext": {
                "name": "LoanManagement",
                "alias": "대출/반납",
                "displayName": "대출/반납",
                "description": [
                    {
                        "type": "userStory",
                        "text": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해. 대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
                    }
                ],
                "aggregates": [
                    {
                        "name": "Loan",
                        "alias": "대출"
                    },
                    {
                        "name": "Reservation",
                        "alias": "예약"
                    }
                ]
            },
            "description": "{\"userStories\":[{\"title\":\"도서 대출 신청\",\"description\":\"회원으로서 내가 도서를 대출하고 싶다. 그래서 내가 원하는 책을 읽을 수 있다.\",\"acceptance\":[\"회원번호와 이름을 입력하여 회원을 확인할 수 있어야 한다.\",\"대출할 도서를 도서명이나 ISBN으로 검색하여 선택할 수 있어야 한다.\",\"대출 기간은 7일, 14일, 30일 중 선택할 수 있어야 한다.\",\"이미 대출 중인 도서는 예약 신청이 가능해야 한다.\",\"대출 완료 시 도서 상태는 '대출중'으로 변경되어야 한다.\"]},{\"title\":\"대출 도서 관리\",\"description\":\"회원으로서 내가 대출 중인 도서를 확인하고 연장하거나 반납하고 싶다. 그래서 대출 상태를 관리할 수 있다.\",\"acceptance\":[\"대출일, 반납 예정일, 상태(대출중/연체/반납완료)를 확인할 수 있어야 한다.\",\"대출 중인 도서는 연장하거나 반납할 수 있어야 한다.\",\"반납 완료 시 도서 상태는 '대출가능'으로 변경되어야 한다.\",\"예약자가 있는 도서가 반납되면 상태는 '예약중'으로 변경되어야 한다.\"]},{\"title\":\"도서 이력 조회\",\"description\":\"도서관 직원으로서 내가 특정 도서의 대출 이력과 상태 변경 이력을 조회하고 싶다. 그래서 도서의 상태 변화를 추적할 수 있다.\",\"acceptance\":[\"도서별 대출 이력과 상태 변경 이력을 확인할 수 있어야 한다.\",\"대출 현황과 상태 변화가 명확히 표시되어야 한다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"string\",\"required\":true},{\"name\":\"phoneNumber\",\"type\":\"string\",\"required\":true},{\"name\":\"email\",\"type\":\"string\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"isbn\",\"type\":\"string\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"연체\",\"예약중\"]},{\"name\":\"history\",\"type\":\"list\",\"required\":false}]}},\"businessRules\":[{\"name\":\"ValidLoanStatus\",\"description\":\"대출하려는 도서가 '대출가능' 상태여야 대출 가능\"},{\"name\":\"ReturnBookStatusUpdate\",\"description\":\"반납 시 예약자가 있으면 도서 상태는 '예약중', 예약자가 없으면 '대출가능'으로 변경\"}],\"interfaces\":{\"LoanReturn\":{\"sections\":[{\"name\":\"LoanRequest\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true},{\"name\":\"bookSearch\",\"type\":\"search\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true,\"values\":[\"7일\",\"14일\",\"30일\"]}],\"actions\":[\"Submit\",\"Clear\"]},{\"name\":\"LoanStatus\",\"type\":\"table\",\"fields\":[{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDueDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}],\"actions\":[\"Extend\",\"Return\"]}]}}}"
        }
    }

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

            this.generateFromDraftWithXAI(selectedDrafts)
        }
    }
}
</script>
  