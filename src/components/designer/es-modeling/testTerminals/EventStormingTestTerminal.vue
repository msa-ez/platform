<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>

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
            const draftOptions = {
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
                        "name": "BookCategory",
                        "alias": "도서 카테고리"
                    },
                    {
                        "name": "BookStatus",
                        "alias": "도서 상태"
                    },
                    {
                        "name": "LoanReference",
                        "alias": "대출 참조",
                        "referencedAggregate": {
                            "name": "Loan",
                            "alias": "대출"
                        }
                    },
                    {
                        "name": "Reservation",
                        "alias": "예약"
                    }
                ]
            }
        ],
        "analysis": {
            "transactionalConsistency": "도서 등록 및 상태 변경 작업이 단일 애그리거트 경계 내에서 원자적으로 처리됨",
            "performanceScalability": "단일 애그리거트로 기본 작업 성능은 우수하지만, 복잡한 조회에서 확장성 문제가 발생할 수 있음",
            "domainAlignment": "도서 관리 도메인 개념과 비즈니스 규칙에 밀접하게 정렬됨",
            "maintainability": "구조가 단순하여 유지보수가 용이하지만, 기능 확장 시 복잡성이 증가할 수 있음",
            "futureFlexibility": "구조적 변경 없이 간단한 기능 추가는 가능하지만, 확장성은 제한적임"
        },
        "pros": {
            "cohesion": "도서 관리와 관련된 모든 속성과 규칙이 하나의 애그리거트에 포함됨",
            "coupling": "ValueObject를 통해 외부 애그리거트와 최소한의 결합 유지",
            "consistency": "강한 일관성을 보장",
            "encapsulation": "도서 관리 로직이 잘 캡슐화됨",
            "complexity": "구조가 단순하고 명확함",
            "independence": "Loan 및 Reservation과 독립적으로 작동 가능",
            "performance": "기본적인 도서 등록 및 상태 변경 작업에서 높은 성능 제공"
        },
        "cons": {
            "cohesion": "기능이 확장되면 애그리거트가 비대해질 가능성",
            "coupling": "외부 애그리거트에 대한 참조로 인한 간접적 의존성",
            "consistency": "모든 상태 변경이 단일 애그리거트 경계 내에서 처리되어야 함",
            "encapsulation": "일부 도서 관리 규칙이 UI로 누출될 가능성",
            "complexity": "기능 확장 시 복잡성 증가 가능",
            "independence": "외부 애그리거트 참조가 필요함",
            "performance": "복잡한 조회에서 성능 저하 가능"
        },
        "isAIRecommended": false,
        "boundedContext": {
            "_type": "org.uengine.modeling.model.BoundedContext",
            "aggregates": [
                {
                    "id": "9dfa2c4c-e039-ca56-5b19-d327d24db785"
                }
            ],
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "description": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.",
            "id": "03188828-bf01-0382-2d94-80f3f0025d99",
            "elementView": {
                "_type": "org.uengine.modeling.model.BoundedContext",
                "height": 590,
                "id": "03188828-bf01-0382-2d94-80f3f0025d99",
                "style": "{}",
                "width": 560,
                "x": 650,
                "y": 450
            },
            "gitURL": null,
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                "height": 350,
                "id": "03188828-bf01-0382-2d94-80f3f0025d99",
                "style": "{}",
                "width": 350,
                "x": 235,
                "y": 365
            },
            "members": [],
            "name": "BookManagement",
            "displayName": "도서 관리",
            "oldName": "",
            "policies": [],
            "portGenerated": null,
            "preferredPlatform": "template-spring-boot",
            "preferredPlatformConf": {},
            "rotateStatus": false,
            "tempId": "",
            "templatePerElements": {},
            "views": [],
            "definitionId": "0a3e2544aa1ce9159e4871fe18656ed1"
        },
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서 새로운 도서를 등록하여 도서 목록에 추가하고 관리할 수 있다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력해야 한다.\",\"ISBN은 13자리 숫자여야 하며 중복되지 않아야 한다.\",\"카테고리는 소설/비소설/학술/잡지 중 하나를 선택해야 한다.\",\"등록된 도서는 '대출가능' 상태로 초기화된다.\"]},{\"title\":\"도서 상태 관리\",\"description\":\"관리자로서 도서의 대출/반납/폐기 상태를 관리할 수 있다.\",\"acceptance\":[\"도서 상태는 대출 및 반납 상황에 따라 자동으로 변경된다.\",\"폐기된 도서는 더 이상 대출 및 예약이 불가능하다.\",\"폐기 처리 시 해당 도서의 상태가 '폐기'로 변경된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"isbn\",\"type\":\"string\",\"required\":true,\"validations\":[\"13자리 숫자\"],\"isUnique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]}},\"businessRules\":[{\"name\":\"UniqueISBN\",\"description\":\"ISBN은 13자리 숫자이며 중복될 수 없다.\"},{\"name\":\"InitialBookStatus\",\"description\":\"등록된 도서는 기본적으로 '대출가능' 상태로 설정된다.\"},{\"name\":\"StatusChange\",\"description\":\"도서 상태는 대출 및 반납 상황에 따라 자동으로 변경된다.\"},{\"name\":\"DiscardedBookRestriction\",\"description\":\"폐기된 도서는 대출 및 예약이 불가능하다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"BookRegistration\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"초기화\"]},{\"name\":\"BookStatusManagement\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true},{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"status\",\"type\":\"select\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}],\"actions\":[\"상태변경\",\"폐기처리\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\",\"상태변경\",\"폐기처리\"]}}]}}}"
    },
    "LoanManagement": {
        "structure": [
            {
                "aggregate": {
                    "name": "Loan",
                    "alias": "대출"
                },
                "entities": [],
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
                        "name": "LoanPeriod",
                        "alias": "대출 기간"
                    },
                    {
                        "name": "LoanStatus",
                        "alias": "대출 상태"
                    }
                ]
            },
            {
                "aggregate": {
                    "name": "Reservation",
                    "alias": "예약"
                },
                "entities": [],
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
                        "name": "ReservationStatus",
                        "alias": "예약 상태"
                    }
                ]
            }
        ],
        "analysis": {
            "transactionalConsistency": "대출과 예약을 별도 Aggregate로 분리하여 각각의 원자적 처리 가능",
            "performanceScalability": "대출과 예약을 독립적으로 확장 가능",
            "domainAlignment": "대출과 예약의 도메인 복잡성을 명확히 반영",
            "maintainability": "책임 분리로 유지보수 용이성 증가",
            "futureFlexibility": "대출 및 예약 기능 확장을 위한 높은 유연성 제공"
        },
        "pros": {
            "cohesion": "대출과 예약의 책임이 명확히 분리",
            "coupling": "각 Aggregate 간 결합 최소화",
            "consistency": "각 Aggregate 내에서 강한 일관성 유지",
            "encapsulation": "대출과 예약 로직이 각각 캡슐화됨",
            "complexity": "책임 분리로 구조 명확",
            "independence": "대출과 예약이 독립적으로 진화 가능",
            "performance": "필요 시 예약 정보는 지연 로드 가능"
        },
        "cons": {
            "cohesion": "대출과 예약 간 관련성 관리 필요",
            "coupling": "Aggregate 간 동기화 필요",
            "consistency": "더 복잡한 트랜잭션 관리 필요",
            "encapsulation": "Aggregate 간 관계 관리 복잡성 증가",
            "complexity": "추가 Aggregate 관리 필요",
            "independence": "변경 시 상호 조정 필요",
            "performance": "전체 대출 및 예약 정보 조회 시 추가 쿼리 필요"
        },
        "isAIRecommended": true,
        "boundedContext": {
            "name": "LoanManagement",
            "alias": "대출 관리",
            "displayName": "대출 관리",
            "description": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해. 대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
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
        "description": "{\"userStories\":[{\"title\":\"도서 대출 신청\",\"description\":\"회원으로서 도서를 대출하여 원하는 기간 동안 읽을 수 있기를 원한다.\",\"acceptance\":[\"회원번호와 이름을 입력하여 회원을 확인할 수 있어야 한다.\",\"대출할 도서를 도서명 또는 ISBN으로 검색할 수 있어야 한다.\",\"대출 기간은 7일, 14일, 30일 중 하나를 선택할 수 있어야 한다.\",\"대출 완료 시 도서 상태는 '대출중'으로 자동 변경되어야 한다.\"]},{\"title\":\"도서 반납 처리\",\"description\":\"회원으로서 대출한 도서를 반납하여 상태를 갱신할 수 있기를 원한다.\",\"acceptance\":[\"반납 시 도서 상태는 '대출가능'으로 자동 변경되어야 한다.\",\"반납된 도서에 예약자가 있을 경우, 해당 도서 상태는 '예약중'으로 변경되어야 한다.\"]},{\"title\":\"대출 현황 조회\",\"description\":\"회원으로서 현재 대출 중인 도서 목록과 상태를 확인할 수 있기를 원한다.\",\"acceptance\":[\"대출 현황 화면에서 대출일, 반납예정일, 현재 상태를 확인할 수 있어야 한다.\",\"대출 중인 도서는 연장 또는 반납 처리가 가능해야 한다.\"]},{\"title\":\"도서 대출 이력 조회\",\"description\":\"관리자로서 각 도서의 대출 이력과 상태 변경 이력을 확인할 수 있기를 원한다.\",\"acceptance\":[\"각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 한다.\",\"대출 이력을 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 한다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"string\",\"required\":true},{\"name\":\"loanHistory\",\"type\":\"array\",\"required\":false}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"isbn\",\"type\":\"string\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\"]},{\"name\":\"loanHistory\",\"type\":\"array\",\"required\":false},{\"name\":\"statusChangeHistory\",\"type\":\"array\",\"required\":false}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"reservationDate\",\"type\":\"date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"LoanPeriodValidation\",\"description\":\"대출 기간은 7일, 14일, 30일 중 하나여야 한다.\"},{\"name\":\"LoanStatusUpdate\",\"description\":\"대출 완료 시 도서 상태는 '대출중'으로 변경되어야 한다.\"},{\"name\":\"ReturnStatusUpdate\",\"description\":\"반납 시 도서 상태는 '대출가능'으로 변경되어야 하며, 예약자가 있을 경우 '예약중'으로 변경되어야 한다.\"}],\"interfaces\":{\"LoanManagement\":{\"sections\":[{\"name\":\"LoanApplication\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true},{\"name\":\"bookSearch\",\"type\":\"search\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Submit\",\"Clear\"]}]},\"LoanStatus\":{\"sections\":[{\"name\":\"CurrentLoans\",\"type\":\"table\",\"filters\":[\"loanStatus\"],\"resultTable\":{\"columns\":[\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"extendLoan\",\"returnBook\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"LoanAndStatusHistory\",\"type\":\"table\",\"filters\":[\"bookId\"],\"resultTable\":{\"columns\":[\"loanHistory\",\"statusChangeHistory\"],\"actions\":[]}}]}}}"
    }
}

            this.generateFromDraftWithXAI(draftOptions)
        }
    }
}
</script>

  