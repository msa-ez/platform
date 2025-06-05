export const requestData = {
    "inputs": {
        "selectedDraftOptions": {
            "LibraryBookLoan": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Book",
                            "alias": "도서"
                        },
                        "enumerations": [
                            {
                                "name": "BookStatus",
                                "alias": "도서상태"
                            },
                            {
                                "name": "BookCategory",
                                "alias": "도서카테고리"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "LoanHistoryReference",
                                "alias": "대출이력참조",
                                "referencedAggregate": {
                                    "name": "LoanHistory",
                                    "alias": "대출이력"
                                }
                            },
                            {
                                "name": "BookStatusHistoryReference",
                                "alias": "상태변경이력참조",
                                "referencedAggregate": {
                                    "name": "BookStatusHistory",
                                    "alias": "도서상태변경이력"
                                }
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "도서에 관한 모든 속성과 상태 및 이력 관리까지 Book Aggregate에 통합되어, 도서 관점의 모든 비즈니스 규칙을 한 곳에서 강하게 보장할 수 있습니다.",
                    "coupling": "외부 참조가 최소화되어, 도서 단위의 변경이 타 도메인에 미치는 영향이 매우 적고, 도서 관련 변경이 Aggregate 내부에서만 일어납니다.",
                    "consistency": "도서 상태, 등록, 폐기, 대출 가능 여부 등 모든 도메인 불변성이 한 트랜잭션 내에서 완벽하게 보장됩니다.",
                    "encapsulation": "도서 상태 변경, 이력 기록 등 모든 도메인 규칙이 외부에서 직접 접근 불가하며, Aggregate 내부에서만 조작됩니다.",
                    "complexity": "단일 Aggregate이므로 이해와 접근이 직관적이며, 복잡한 관계를 신경 쓸 필요 없이 도서 중심으로 개발이 가능합니다.",
                    "independence": "도서 단위로 독립적인 확장과 유지보수가 가능해, 시스템 진화에 매우 유리합니다.",
                    "performance": "도서 기준의 조회 및 관리에 있어 쿼리 효율성이 극대화되어, 다수의 도서 정보를 빠르게 처리할 수 있습니다."
                },
                "cons": {
                    "cohesion": "대출, 예약 등 도서 외 세부 행위까지 Book Aggregate에 모두 통합하면, 점차 책임 범위가 확장되어 SRP(단일 책임 원칙)가 약화될 수 있습니다.",
                    "coupling": "대출, 예약 등 타 도메인 비즈니스 변화가 도서 Aggregate 구조에 직접적인 영향을 미쳐 Aggregate 크기가 커질 위험이 있습니다.",
                    "consistency": "다수 사용자의 대출, 예약 등 도서 관련 이벤트가 몰릴 경우 동시성 문제나 잠금 이슈가 발생할 수 있습니다.",
                    "encapsulation": "비즈니스가 발전하면서 도서와 관련 없는 세부 규칙까지 이 Aggregate에서 관리하게 되면, 도메인 캡슐화가 흐려질 수 있습니다.",
                    "complexity": "도서 Aggregate 내부에 너무 많은 도메인 규칙이 쏠리면 복잡도가 상승하여 유지보수 비용이 커질 수 있습니다.",
                    "independence": "Book이 모든 책임을 가지면 도서의 변경이 전체 시스템에 ripple effect를 줄 수 있습니다.",
                    "performance": "대규모 대출/예약/상태 변경이 한 Aggregate에 집중되면, 처리 성능 저하 및 병목이 발생할 수 있습니다."
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서명, ISBN, 저자, 출판사, 카테고리를 입력하여 신규 도서를 등록함. ISBN 중복 및 형식(13자리 숫자) 검증을 거침.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\",\"ISBN 형식 유효\"],\"outputs\":[\"신규 도서 등록\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailedDueToDuplicateISBN\",\"displayName\":\"ISBN 중복으로 도서 등록 실패함\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"도서 등록 시 입력한 ISBN이 기존에 이미 존재할 경우, 도서 등록이 실패함.\",\"inputs\":[\"ISBN(13자리)\",\"기존 도서에 동일 ISBN 존재\"],\"outputs\":[\"도서 등록 실패 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailedDueToInvalidISBNFormat\",\"displayName\":\"ISBN 형식 오류로 도서 등록 실패함\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"도서 등록 시 입력한 ISBN이 13자리 숫자 형식이 아닐 경우, 도서 등록이 실패함.\",\"inputs\":[\"ISBN(13자리 아님)\"],\"outputs\":[\"도서 등록 실패 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태가 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 비즈니스 프로세스(등록, 대출, 반납, 예약, 폐기)에 따라 변경됨.\",\"inputs\":[\"도서 ID\",\"변경 사유(등록, 대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"도서 상태 변경(대출가능/대출중/예약중/폐기)\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookDisposed\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"사서가 도서가 훼손되거나 분실되었음을 확인하고 해당 도서를 폐기 처리함.\",\"inputs\":[\"도서 ID\",\"폐기 사유(훼손, 분실 등)\"],\"outputs\":[\"도서 상태: 폐기\",\"해당 도서 대출 불가\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookBorrowed\",\"displayName\":\"도서가 대출됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 회원번호와 이름으로 인증 후 도서명 또는 ISBN으로 도서를 검색하여 대출 기간을 선택하고 대출 신청을 완료함.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 ID\",\"대출 기간(7/14/30일)\",\"도서 상태: 대출가능\"],\"outputs\":[\"도서 대출 기록 생성\",\"도서 상태: 대출중\"],\"nextEvents\":[\"BookStateChanged\",\"LoanHistoryRecorded\"]}\n\n## Event\n\n{\"name\":\"BookBorrowFailedDueToUnavailableBook\",\"displayName\":\"도서 대출 불가로 대출 실패함\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 대출을 시도했으나 해당 도서가 이미 대출 중이어서 대출이 실패함.\",\"inputs\":[\"도서 ID\",\"도서 상태: 대출중/폐기\"],\"outputs\":[\"도서 대출 실패 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서를 예약함. 예약자 정보와 예약 일시가 저장됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 ID\",\"도서 상태: 대출중\"],\"outputs\":[\"도서 예약 기록 생성\",\"도서 상태: 예약중(반납 시 자동 전환)\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 중이던 도서를 반납함. 반납일이 기록되고 도서의 상태가 변경됨.\",\"inputs\":[\"회원번호\",\"도서 ID\",\"대출 기록\"],\"outputs\":[\"반납일 기록\",\"도서 상태: 대출가능(예약자 없을 시) 또는 예약중(예약자 있을 시)\"],\"nextEvents\":[\"BookStateChanged\",\"LoanHistoryRecorded\"]}\n\n## Event\n\n{\"name\":\"BookReturnOverdue\",\"displayName\":\"도서가 연체되어 반납됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 반납 예정일을 초과하여 도서를 반납함. 연체 이력이 기록됨.\",\"inputs\":[\"회원번호\",\"도서 ID\",\"반납일 > 반납예정일\"],\"outputs\":[\"연체 기록\",\"도서 상태 변경\"],\"nextEvents\":[\"BookReturned\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출이 연장됨\",\"actor\":\"Member\",\"level\":8,\"description\":\"회원이 현재 대출 중인 도서에 대해 연장 신청하여 반납 예정일이 연장됨.\",\"inputs\":[\"회원번호\",\"도서 ID\",\"대출 기록\",\"연장 조건 충족\"],\"outputs\":[\"반납 예정일 연장\",\"연장 이력 기록\"],\"nextEvents\":[\"LoanHistoryRecorded\"]}\n\n## Event\n\n{\"name\":\"LoanHistoryRecorded\",\"displayName\":\"대출 이력이 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서별로 대출, 반납, 연장 등의 이력이 기록되어 도서의 대출 현황과 상태 변화 추적이 가능해짐.\",\"inputs\":[\"도서 ID\",\"이벤트 정보(대출/반납/연장/연체 등)\"],\"outputs\":[\"대출/반납/연장/연체 이력 데이터\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryRecorded\",\"displayName\":\"도서 상태 변경 이력이 기록됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이력이 별도로 기록되어 관리자가 이력 조회 가능.\",\"inputs\":[\"도서 ID\",\"이전 상태\",\"변경된 상태\",\"변경 일시\",\"변경 사유\"],\"outputs\":[\"도서 상태 변경 이력\"],\"nextEvents\":[]}",
                    "id": "6e671f4b-e55f-92b2-746d-4451c7d007cb",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "6e671f4b-e55f-92b2-746d-4451c7d007cb",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "6e671f4b-e55f-92b2-746d-4451c7d007cb",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "LibraryBookLoan",
                    "displayName": "도서관 도서대출",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": null,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "22901979210f3e4d4078ed657eee2155"
                },
                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"사서로서 새로운 도서를 등록하고, 등록된 도서의 상태(대출가능, 대출중, 예약중, 폐기)를 관리할 수 있다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리 입력 필수.\",\"ISBN은 13자리 숫자만 허용, 중복 불가.\",\"도서 등록 시 상태는 '대출가능'으로 설정.\",\"도서 상태 변경(대출, 반납, 예약, 폐기) 이력 추적 가능.\",\"도서가 폐기되면 대출 및 예약 불가.\"]},{\"title\":\"도서 대출 및 반납 처리\",\"description\":\"회원이 도서 대출/반납을 신청하고, 시스템은 대출 가능 여부를 판단하며 대출, 예약, 연체, 반납 등의 상태를 관리한다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인 필수.\",\"도서명 또는 ISBN으로 도서 검색 가능.\",\"대출 기간 7/14/30일 중 선택 가능.\",\"대출 중 도서는 예약 가능.\",\"대출 시 도서 상태는 자동으로 '대출중'으로 변경.\",\"반납 시 예약자가 있으면 '예약중', 없으면 '대출가능'으로 자동 전환.\",\"대출 연체 시 연체 이력 기록.\"]},{\"title\":\"대출 현황 및 연장/반납 처리\",\"description\":\"관리자는 현재 대출 중인 도서 현황을 확인하고, 각 건별로 연장 또는 반납 처리를 할 수 있다.\",\"acceptance\":[\"대출 중인 도서 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료) 표시.\",\"각 대출 건별 연장 또는 반납 버튼 제공.\",\"연장 시 반납예정일이 변경되고, 연장 이력이 기록됨.\",\"반납 시 도서 상태가 자동 변경됨.\"]},{\"title\":\"도서별 대출 및 상태 변경 이력 조회\",\"description\":\"관리자는 특정 도서의 대출 이력 및 상태 변경 이력을 조회하여 추적할 수 있다.\",\"acceptance\":[\"도서별 대출/반납/연장/연체 등 이력 리스트 제공.\",\"도서별 상태 변경 이력(변경일시, 변경 전/후 상태, 변경 사유) 제공.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"previousStatus\",\"type\":\"String\",\"required\":true},{\"name\":\"currentStatus\",\"type\":\"String\",\"required\":true},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\",\"required\":true}]},\"LoanHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"eventType\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출\",\"반납\",\"연장\",\"연체\"]},{\"name\":\"eventDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"memberId\",\"type\":\"String\",\"isForeignKey\":true,\"foreignEntity\":\"Member\"}]}},\"businessRules\":[{\"name\":\"ISBN 13자리 유효성 및 중복 검사\",\"description\":\"도서 등록 시 ISBN은 13자리 숫자이며, 기존 도서와 중복되어서는 안된다.\"},{\"name\":\"도서 상태 자동 전환\",\"description\":\"대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 도서 상태를 자동 변경한다.\"},{\"name\":\"폐기 도서 대출/예약 금지\",\"description\":\"도서 상태가 '폐기'일 경우, 대출 또는 예약 처리가 불가하다.\"},{\"name\":\"예약 우선 반영\",\"description\":\"반납 시 예약자가 있으면 도서 상태를 '예약중'으로 변경하며, 예약자에게 우선 대출이 가능하다.\"},{\"name\":\"대출 연장 조건\",\"description\":\"대출 중인 도서는 연장 가능하며, 연장 시 반납 예정일이 변경되고 연장 이력이 기록된다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"도서 등록\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 현황\",\"type\":\"table\",\"fields\":[],\"actions\":[\"상태 변경\",\"폐기 처리\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상태 변경\",\"이력 조회\"]}}]},\"LoanAndReturn\":{\"sections\":[{\"name\":\"대출/반납 처리\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true},{\"name\":\"bookSearch\",\"type\":\"search\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\",\"반납 처리\",\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatus\":{\"sections\":[{\"name\":\"대출 현황\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\"],\"filters\":[\"대출상태\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"title\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"대출 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"historyId\",\"eventType\",\"eventDate\",\"memberId\"],\"actions\":[]}},{\"name\":\"상태 변경 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"historyId\",\"previousStatus\",\"currentStatus\",\"changedAt\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"사서가 도서명, ISBN, 저자, 출판사, 카테고리를 입력하여 신규 도서를 등록함. ISBN 중복 및 형식(13자리 숫자) 검증을 거침.\",\"displayName\":\"도서가 등록됨\"},{\"name\":\"BookRegistrationFailedDueToDuplicateISBN\",\"description\":\"도서 등록 시 입력한 ISBN이 기존에 이미 존재할 경우, 도서 등록이 실패함.\",\"displayName\":\"ISBN 중복으로 도서 등록 실패함\"},{\"name\":\"BookRegistrationFailedDueToInvalidISBNFormat\",\"description\":\"도서 등록 시 입력한 ISBN이 13자리 숫자 형식이 아닐 경우, 도서 등록이 실패함.\",\"displayName\":\"ISBN 형식 오류로 도서 등록 실패함\"},{\"name\":\"BookStateChanged\",\"description\":\"도서의 상태가 비즈니스 프로세스(등록, 대출, 반납, 예약, 폐기)에 따라 변경됨.\",\"displayName\":\"도서 상태가 변경됨\"},{\"name\":\"BookDisposed\",\"description\":\"사서가 도서가 훼손되거나 분실되었음을 확인하고 해당 도서를 폐기 처리함.\",\"displayName\":\"도서가 폐기됨\"},{\"name\":\"BookBorrowed\",\"description\":\"회원이 회원번호와 이름으로 인증 후 도서명 또는 ISBN으로 도서를 검색하여 대출 기간을 선택하고 대출 신청을 완료함.\",\"displayName\":\"도서가 대출됨\"},{\"name\":\"BookBorrowFailedDueToUnavailableBook\",\"description\":\"회원이 대출을 시도했으나 해당 도서가 이미 대출 중이어서 대출이 실패함.\",\"displayName\":\"도서 대출 불가로 대출 실패함\"},{\"name\":\"BookReserved\",\"description\":\"회원이 대출 중인 도서를 예약함. 예약자 정보와 예약 일시가 저장됨.\",\"displayName\":\"도서가 예약됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출 중이던 도서를 반납함. 반납일이 기록되고 도서의 상태가 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookReturnOverdue\",\"description\":\"회원이 반납 예정일을 초과하여 도서를 반납함. 연체 이력이 기록됨.\",\"displayName\":\"도서가 연체되어 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 현재 대출 중인 도서에 대해 연장 신청하여 반납 예정일이 연장됨.\",\"displayName\":\"대출이 연장됨\"},{\"name\":\"LoanHistoryRecorded\",\"description\":\"도서별로 대출, 반납, 연장 등의 이력이 기록되어 도서의 대출 현황과 상태 변화 추적이 가능해짐.\",\"displayName\":\"대출 이력이 기록됨\"},{\"name\":\"BookStatusHistoryRecorded\",\"description\":\"도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이력이 별도로 기록되어 관리자가 이력 조회 가능.\",\"displayName\":\"도서 상태 변경 이력이 기록됨\"}]}"
            },
            "LoanHistory": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "LoanHistory",
                            "alias": "대출이력"
                        },
                        "enumerations": [
                            {
                                "name": "LoanType",
                                "alias": "대출이력타입"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "BookReference",
                                "alias": "도서참조",
                                "referencedAggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            },
                            {
                                "name": "Member",
                                "alias": "회원"
                            }
                        ]
                    },
                    {
                        "aggregate": {
                            "name": "BookStatusHistory",
                            "alias": "도서상태변경이력"
                        },
                        "enumerations": [
                            {
                                "name": "BookStatus",
                                "alias": "도서상태"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "BookReference",
                                "alias": "도서참조",
                                "referencedAggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "대출이력과 상태변경이력 각각 도메인별 책임이 명확하게 분리되어, 각 Aggregate가 자신의 업무 규칙과 트랜잭션 일관성을 독립적으로 유지합니다.",
                    "coupling": "Book, Loan 등 외부 Aggregate는 참조 ValueObject로만 연결되어 직접 의존성이 낮아 전체 시스템 유연성이 높아집니다.",
                    "consistency": "각 이력별로 필수 불변조건(대출 이벤트, 상태 변경 이벤트)을 Aggregate 내부에서 원자적으로 보장할 수 있습니다.",
                    "encapsulation": "각각의 도메인 규칙이 별도 Aggregate 내부에 은닉되어 변경 영향이 최소화됩니다.",
                    "complexity": "업무별 Aggregate로 구조가 단순하며, 한 Aggregate만 파악해도 주요 로직을 이해할 수 있습니다.",
                    "independence": "이력 유형별 확장 및 변경이 독립적으로 가능하며, 운영 중에도 각 Aggregate의 독립 배포가 용이합니다.",
                    "performance": "이력 테이블이 분리되어 대량 데이터가 발생해도 각 쿼리 및 인덱스 설계가 최적화 가능합니다."
                },
                "cons": {
                    "cohesion": "도서별 전체 이력(대출+상태변경) 조회 시 두 Aggregate를 모두 질의해야 하므로 업무 관점의 완전한 단일성을 제공하지 않습니다.",
                    "coupling": "조회나 통계 등 복합 정보가 필요한 경우 두 Aggregate 간 데이터를 조합하는 추가 로직이 필요합니다.",
                    "consistency": "도서 대출 이벤트와 상태 변경이력이 동시에 발생하는 경우 트랜잭션 일관성 보장이 Aggregate 단위로 분리되어 있습니다.",
                    "encapsulation": "비즈니스 규칙이 분산되므로, 전체 이력 처리 로직을 한곳에서 변경하거나 관리하려면 여러 Aggregate를 모두 파악해야 합니다.",
                    "complexity": "대출과 상태변경 이벤트가 동시에 발생할 때 외부 오케스트레이션이 필요합니다.",
                    "independence": "이력 간 통합적 변경 요구가 생길 경우, 구조 재설계가 필요할 수 있습니다.",
                    "performance": "복합 이력 조회 쿼리는 다중 Aggregate 접근으로 인한 약간의 쿼리 비용 상승이 있을 수 있습니다."
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "# Requirements\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookBorrowed\",\"displayName\":\"도서가 대출됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 회원번호와 이름으로 인증 후 도서명 또는 ISBN으로 도서를 검색하여 대출 기간을 선택하고 대출 신청을 완료함.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 ID\",\"대출 기간(7/14/30일)\",\"도서 상태: 대출가능\"],\"outputs\":[\"도서 대출 기록 생성\",\"도서 상태: 대출중\"],\"nextEvents\":[\"BookStateChanged\",\"LoanHistoryRecorded\"]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 중이던 도서를 반납함. 반납일이 기록되고 도서의 상태가 변경됨.\",\"inputs\":[\"회원번호\",\"도서 ID\",\"대출 기록\"],\"outputs\":[\"반납일 기록\",\"도서 상태: 대출가능(예약자 없을 시) 또는 예약중(예약자 있을 시)\"],\"nextEvents\":[\"BookStateChanged\",\"LoanHistoryRecorded\"]}\n\n## Event\n\n{\"name\":\"BookReturnOverdue\",\"displayName\":\"도서가 연체되어 반납됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 반납 예정일을 초과하여 도서를 반납함. 연체 이력이 기록됨.\",\"inputs\":[\"회원번호\",\"도서 ID\",\"반납일 > 반납예정일\"],\"outputs\":[\"연체 기록\",\"도서 상태 변경\"],\"nextEvents\":[\"BookReturned\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출이 연장됨\",\"actor\":\"Member\",\"level\":8,\"description\":\"회원이 현재 대출 중인 도서에 대해 연장 신청하여 반납 예정일이 연장됨.\",\"inputs\":[\"회원번호\",\"도서 ID\",\"대출 기록\",\"연장 조건 충족\"],\"outputs\":[\"반납 예정일 연장\",\"연장 이력 기록\"],\"nextEvents\":[\"LoanHistoryRecorded\"]}\n\n## Event\n\n{\"name\":\"LoanHistoryRecorded\",\"displayName\":\"대출 이력이 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서별로 대출, 반납, 연장 등의 이력이 기록되어 도서의 대출 현황과 상태 변화 추적이 가능해짐.\",\"inputs\":[\"도서 ID\",\"이벤트 정보(대출/반납/연장/연체 등)\"],\"outputs\":[\"대출/반납/연장/연체 이력 데이터\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryRecorded\",\"displayName\":\"도서 상태 변경 이력이 기록됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이력이 별도로 기록되어 관리자가 이력 조회 가능.\",\"inputs\":[\"도서 ID\",\"이전 상태\",\"변경된 상태\",\"변경 일시\",\"변경 사유\"],\"outputs\":[\"도서 상태 변경 이력\"],\"nextEvents\":[]}",
                    "id": "dd3e4d7d-ed26-c3c3-670e-541e8723c9a1",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "dd3e4d7d-ed26-c3c3-670e-541e8723c9a1",
                        "style": "{}",
                        "width": 560,
                        "x": 1235,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "dd3e4d7d-ed26-c3c3-670e-541e8723c9a1",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "LoanHistory",
                    "displayName": "대출이력",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": 8080,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "22901979210f3e4d4078ed657eee2155"
                },
                "description": "{\"userStories\":[{\"title\":\"도서별 대출 및 상태 변경 이력 조회\",\"description\":\"관리자 또는 이용자는 특정 도서의 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 한눈에 파악할 수 있다.\",\"acceptance\":[\"도서 ID로 대출 이력 및 상태 변경 이력을 모두 조회할 수 있다.\",\"대출, 반납, 연장, 연체 등 모든 대출 관련 이력이 포함된다.\",\"상태 변경 이력에는 변경 전/후 상태, 변경 일시, 사유가 명확히 표시된다.\",\"이력 데이터는 정렬/필터링이 가능하다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"BORROWED\",\"RESERVED\",\"DISCARDED\"]}]},\"LoanHistory\":{\"properties\":[{\"name\":\"loanHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanType\",\"type\":\"enum\",\"required\":true,\"values\":[\"BORROW\",\"RETURN\",\"EXTEND\",\"OVERDUE\"]},{\"name\":\"loanStartDate\",\"type\":\"Date\"},{\"name\":\"loanDueDate\",\"type\":\"Date\"},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"overdueDays\",\"type\":\"Integer\"},{\"name\":\"createdAt\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"statusHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"BORROWED\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"currentStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"BORROWED\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]},\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberName\",\"type\":\"String\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 이력 기록\",\"description\":\"모든 도서 대출, 반납, 연장, 연체 발생 시 LoanHistory에 이력이 자동으로 기록된다.\"},{\"name\":\"상태 변경 이력 기록\",\"description\":\"도서 상태(AVAILABLE, BORROWED, RESERVED, DISCARDED)가 변경될 때마다 BookStatusHistory에 이전 상태, 변경된 상태, 일시, 사유가 저장된다.\"}],\"interfaces\":{\"BookHistoryLookup\":{\"sections\":[{\"name\":\"도서 이력 조회\",\"type\":\"form\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"이력 조회\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"대출 이력 테이블\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"기간\",\"이력 타입(BORROW, RETURN, EXTEND, OVERDUE)\"],\"resultTable\":{\"columns\":[\"loanType\",\"memberId\",\"loanStartDate\",\"loanDueDate\",\"returnDate\",\"overdueDays\",\"createdAt\"],\"actions\":[]}},{\"name\":\"상태 변경 이력 테이블\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"기간\",\"상태\"],\"resultTable\":{\"columns\":[\"previousStatus\",\"currentStatus\",\"changedAt\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookBorrowed\",\"description\":\"회원이 회원번호와 이름으로 인증 후 도서명 또는 ISBN으로 도서를 검색하여 대출 기간을 선택하고 대출 신청을 완료함.\",\"displayName\":\"도서가 대출됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출 중이던 도서를 반납함. 반납일이 기록되고 도서의 상태가 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookReturnOverdue\",\"description\":\"회원이 반납 예정일을 초과하여 도서를 반납함. 연체 이력이 기록됨.\",\"displayName\":\"도서가 연체되어 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 현재 대출 중인 도서에 대해 연장 신청하여 반납 예정일이 연장됨.\",\"displayName\":\"대출이 연장됨\"},{\"name\":\"LoanHistoryRecorded\",\"description\":\"도서별로 대출, 반납, 연장 등의 이력이 기록되어 도서의 대출 현황과 상태 변화 추적이 가능해짐.\",\"displayName\":\"대출 이력이 기록됨\"},{\"name\":\"BookStatusHistoryRecorded\",\"description\":\"도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이력이 별도로 기록되어 관리자가 이력 조회 가능.\",\"displayName\":\"도서 상태 변경 이력이 기록됨\"}]}"
            }
        },
        "userInfo": {
            "name": "mock-name",
            "profile": "mock-profile",
            "email": "mock@uengine.org",
            "uid": "mock-uid",
            "providerUid": "mock-provider-uid",
            "savedCoin": 0,
            "savedToolTime": 0,
            "consultingTime": 0,
            "authorized": "admin"
        },
        "information": {
            "author": "mock-uid",
            "authorEmail": "mock@uengine.org",
            "comment": "mock-comment",
            "createdTimeStamp": 1746592677727,
            "lastModifiedTimeStamp": 1746592677727,
            "projectName": "mock-project",
            "projectId": "mock-project-id",
            "type": "es"
        }
    },
    "outputs": {
        "esValue": {}
    }
}