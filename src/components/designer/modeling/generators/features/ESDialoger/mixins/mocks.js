export const aggregateDraftScenarios = {
    "libraryApplication": {
        "selectedStructureOption": {
            "boundedContexts": [
                {
                    "name": "BookManagement",
                    "alias": "도서 관리",
                    "importance": "Core Domain",
                    "complexity": "0.8",
                    "differentiation": "0.9",
                    "implementationStrategy": "Rich Domain Model",
                    "aggregates": [
                        {
                            "name": "Book",
                            "alias": "도서"
                        }
                    ],
                    "events": [
                        "BookRegistered",
                        "BookRegistrationFailed",
                        "BookDiscarded",
                        "BookSearched",
                        "BookLoanHistoryViewed",
                        "BookStatusHistoryViewed"
                    ],
                    "requirements": [
                        {
                            "type": "userStory",
                            "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                        },
                        {
                            "type": "userStory",
                            "text": "도서는 도서명이나 ISBN으로 검색할 수 있어야 해."
                        },
                        {
                            "type": "userStory",
                            "text": "도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해."
                        },
                        {
                            "type": "userStory",
                            "text": "각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}"
                        }
                    ],
                    "role": "도서 관리자는 새로운 도서를 등록하고, 도서의 상태(대출가능/대출중/예약중/폐기)를 관리하며, 각 도서의 대출 및 상태 변경 이력을 조회한다. 도서 등록 시 중복 및 형식 검증이 포함되고, 도서의 상태는 대출 및 반납 이벤트에 따라 변경된다. 도서 검색 기능도 포함한다."
                },
                {
                    "name": "BookLoanProcess",
                    "alias": "도서 대출 프로세스",
                    "importance": "Core Domain",
                    "complexity": "0.9",
                    "differentiation": "0.8",
                    "implementationStrategy": "Rich Domain Model",
                    "aggregates": [
                        {
                            "name": "Loan",
                            "alias": "대출"
                        },
                        {
                            "name": "Reservation",
                            "alias": "예약"
                        },
                        {
                            "name": "Member",
                            "alias": "회원"
                        }
                    ],
                    "events": [
                        "MemberVerified",
                        "BookLoanRequested",
                        "BookLoanRejected",
                        "BookLoanApproved",
                        "BookReserved",
                        "BookReturned",
                        "BookAvailable",
                        "BookReservedForNext",
                        "LoanExtended",
                        "LoanOverdue"
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
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}"
                        }
                    ],
                    "role": "회원의 대출/반납, 예약, 대출 연장, 연체 관리 등 도서 대출 전체 프로세스를 담당한다. 회원 인증 및 도서 검색, 대출 상태 전환, 예약 처리, 반납 및 연체 상태 처리까지의 흐름을 포함한다."
                }
            ],
            "relations": [
                {
                    "name": "BookManagementToBookLoanProcess",
                    "type": "Pub/Sub",
                    "upStream": {
                        "name": "BookManagement",
                        "alias": "도서 관리"
                    },
                    "downStream": {
                        "name": "BookLoanProcess",
                        "alias": "도서 대출 프로세스"
                    }
                }
            ],
            "thoughts": "이번 분리는 도메인 복잡도와 프로세스(밸류 스트림)를 기준으로 수행하였다. 우선, 요구사항을 PBC 매칭 규칙에 따라 확인하였으나, 도서 관리, 대출, 예약 등 도서관 특화 기능에 일치하는 PBC가 없어 모두 고유 도메인(코어 도메인)으로 분리하였다. 도서 등록/상태관리/검색/이력 등 도서 객체와 직접 관련된 복잡한 비즈니스 규칙은 '도서 관리'로, 회원 인증부터 대출/반납/예약/연장/연체 등 대출의 전체 흐름은 '도서 대출 프로세스'로 분리하였다. 이는 각 도메인의 책임과 이벤트 흐름, 데이터 일관성, 프로세스 소유권을 명확히 하기 위함이다. 두 컨텍스트는 도서의 상태 변화(대출 가능→대출중, 반납→예약중 등) 등에서 상호 이벤트를 주고받으며 Pub/Sub 패턴으로 느슨하게 연결된다. 인프라적 관점에서는 확장성 및 업무 변경의 유연성을 고려하여 단방향 이벤트 기반 연동을 선택하였다.",
            "explanations": [
                {
                    "sourceContext": "도서 관리",
                    "targetContext": "도서 대출 프로세스",
                    "relationType": "Pub/Sub",
                    "reason": "도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.",
                    "interactionPattern": "도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리."
                }
            ],
            "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
            "currentGeneratedLength": 3347
        },
        "resultDevideBoundedContext": {
            "도메인 복잡도 분리+프로세스(value stream) 기반 분리": {
                "boundedContexts": [
                    {
                        "name": "BookManagement",
                        "alias": "도서 관리",
                        "importance": "Core Domain",
                        "complexity": "0.8",
                        "differentiation": "0.9",
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Book",
                                "alias": "도서"
                            }
                        ],
                        "events": [
                            "BookRegistered",
                            "BookRegistrationFailed",
                            "BookDiscarded",
                            "BookSearched",
                            "BookLoanHistoryViewed",
                            "BookStatusHistoryViewed"
                        ],
                        "requirements": [
                            {
                                "type": "userStory",
                                "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                            },
                            {
                                "type": "userStory",
                                "text": "도서는 도서명이나 ISBN으로 검색할 수 있어야 해."
                            },
                            {
                                "type": "userStory",
                                "text": "도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해."
                            },
                            {
                                "type": "userStory",
                                "text": "각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}"
                            }
                        ],
                        "role": "도서 관리자는 새로운 도서를 등록하고, 도서의 상태(대출가능/대출중/예약중/폐기)를 관리하며, 각 도서의 대출 및 상태 변경 이력을 조회한다. 도서 등록 시 중복 및 형식 검증이 포함되고, 도서의 상태는 대출 및 반납 이벤트에 따라 변경된다. 도서 검색 기능도 포함한다."
                    },
                    {
                        "name": "BookLoanProcess",
                        "alias": "도서 대출 프로세스",
                        "importance": "Core Domain",
                        "complexity": "0.9",
                        "differentiation": "0.8",
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Loan",
                                "alias": "대출"
                            },
                            {
                                "name": "Reservation",
                                "alias": "예약"
                            },
                            {
                                "name": "Member",
                                "alias": "회원"
                            }
                        ],
                        "events": [
                            "MemberVerified",
                            "BookLoanRequested",
                            "BookLoanRejected",
                            "BookLoanApproved",
                            "BookReserved",
                            "BookReturned",
                            "BookAvailable",
                            "BookReservedForNext",
                            "LoanExtended",
                            "LoanOverdue"
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
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}"
                            }
                        ],
                        "role": "회원의 대출/반납, 예약, 대출 연장, 연체 관리 등 도서 대출 전체 프로세스를 담당한다. 회원 인증 및 도서 검색, 대출 상태 전환, 예약 처리, 반납 및 연체 상태 처리까지의 흐름을 포함한다."
                    }
                ],
                "relations": [
                    {
                        "name": "BookManagementToBookLoanProcess",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "BookManagement",
                            "alias": "도서 관리"
                        },
                        "downStream": {
                            "name": "BookLoanProcess",
                            "alias": "도서 대출 프로세스"
                        }
                    }
                ],
                "thoughts": "이번 분리는 도메인 복잡도와 프로세스(밸류 스트림)를 기준으로 수행하였다. 우선, 요구사항을 PBC 매칭 규칙에 따라 확인하였으나, 도서 관리, 대출, 예약 등 도서관 특화 기능에 일치하는 PBC가 없어 모두 고유 도메인(코어 도메인)으로 분리하였다. 도서 등록/상태관리/검색/이력 등 도서 객체와 직접 관련된 복잡한 비즈니스 규칙은 '도서 관리'로, 회원 인증부터 대출/반납/예약/연장/연체 등 대출의 전체 흐름은 '도서 대출 프로세스'로 분리하였다. 이는 각 도메인의 책임과 이벤트 흐름, 데이터 일관성, 프로세스 소유권을 명확히 하기 위함이다. 두 컨텍스트는 도서의 상태 변화(대출 가능→대출중, 반납→예약중 등) 등에서 상호 이벤트를 주고받으며 Pub/Sub 패턴으로 느슨하게 연결된다. 인프라적 관점에서는 확장성 및 업무 변경의 유연성을 고려하여 단방향 이벤트 기반 연동을 선택하였다.",
                "explanations": [
                    {
                        "sourceContext": "도서 관리",
                        "targetContext": "도서 대출 프로세스",
                        "relationType": "Pub/Sub",
                        "reason": "도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.",
                        "interactionPattern": "도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리."
                    }
                ],
                "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                "currentGeneratedLength": 3347
            }
        },
        "draftOptions": {
            "BookManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Book",
                            "alias": "도서"
                        },
                        "enumerations": [
                            {
                                "name": "BookCategory",
                                "alias": "도서 카테고리"
                            },
                            {
                                "name": "BookStatus",
                                "alias": "도서 상태"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "BookLoanHistoryInfo",
                                "alias": "도서 대출 이력 정보",
                                "referencedAggregate": {
                                    "name": "Loan",
                                    "alias": "대출"
                                }
                            },
                            {
                                "name": "BookStatusHistoryInfo",
                                "alias": "도서 상태 변경 이력 정보"
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "도서의 핵심 정보와 이력 데이터, 상태 전이를 한 Aggregate 내에서 일관성 있게 관리하여 비즈니스 규칙을 강하게 보장한다.",
                    "coupling": "도서 관련 작업이 한 Aggregate 내에서 해결되므로 외부 참조와 Aggregate 간 결합이 최소화된다.",
                    "consistency": "ISBN 유일성, 상태 전이 등 도서 중심의 모든 비즈니스 불변성이 단일 트랜잭션에서 강하게 보장된다.",
                    "encapsulation": "도서의 등록, 폐기, 상태 전이, 이력 관리까지 내부에서 처리되어 외부에 복잡성을 노출하지 않는다.",
                    "complexity": "이력까지 모두 한 곳에서 관리되어 구현 및 유지보수가 직관적이다.",
                    "independence": "Book Aggregate만으로 도서 업무의 대부분이 독립적으로 처리된다.",
                    "performance": "도서와 연관된 이력/상태 조회가 단일 Aggregate 조회로 효율적이다."
                },
                "cons": {
                    "cohesion": "이력 데이터가 계속 누적되면 Aggregate가 비대해져 단일 책임 원칙이 약화될 수 있다.",
                    "coupling": "이력 데이터의 구조 변경이 Book 전체에 영향을 줄 수 있어 변화에 취약해진다.",
                    "consistency": "대량 이력 데이터로 인한 트랜잭션 부하 및 충돌 가능성이 증가한다.",
                    "encapsulation": "외부 시스템에서 이력 정보만 분리 활용 시 도서 전체 구조를 알아야 한다.",
                    "complexity": "이력 데이터, 상태 등 다양한 관심사가 한 객체에 집중되어 복잡도가 누적된다.",
                    "independence": "이력 처리, 조회만 확장하려면 Book 전체 구조를 함께 고려해야 한다.",
                    "performance": "이력 데이터 증가 시 단일 Aggregate 조회/저장 성능 저하 우려가 있다."
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "name": "BookManagement",
                    "alias": "도서 관리",
                    "displayName": "도서 관리",
                    "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n도서는 도서명이나 ISBN으로 검색할 수 있어야 해.\n\n## userStory\n\n도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 대출 프로세스 (BookLoanProcess)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                    "aggregates": [
                        {
                            "name": "Book",
                            "alias": "도서"
                        }
                    ]
                },
                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 상태 관리\",\"description\":\"도서 관리자로서 새로운 도서를 등록하고, 보유 도서들의 상태(대출가능/대출중/예약중/폐기)를 관리할 수 있다.\",\"acceptance\":[\"도서명, ISBN(13자리), 저자, 출판사, 카테고리 입력이 필수이며, ISBN 중복 검사가 반드시 수행된다.\",\"도서 등록 시 상태는 '대출가능'이 기본값으로 설정된다.\",\"도서 상태는 대출/반납/예약/폐기 처리에 따라 자동으로 변경된다.\",\"폐기된 도서는 더 이상 대출이 불가하다.\"]},{\"title\":\"도서 검색\",\"description\":\"사용자로서 도서명이나 ISBN으로 도서를 검색할 수 있다.\",\"acceptance\":[\"검색어로 도서명 또는 ISBN 입력 시 관련 도서 목록이 출력된다.\"]},{\"title\":\"도서 반납 및 상태 전이\",\"description\":\"도서가 반납되면 해당 도서의 상태가 '대출가능' 또는 '예약중'으로 자동 전환된다.\",\"acceptance\":[\"예약자가 없으면 '대출가능', 예약자가 있으면 '예약중'으로 상태가 자동 변경된다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서 관리자로서 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"대출 이력과 상태 변경 이력이 조회 화면에 표시된다.\",\"이력에는 시점, 변경자, 변경 사유 등이 포함된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"statusHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"changedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN_Validation\",\"description\":\"ISBN은 반드시 13자리의 숫자여야 하며, 시스템 내에서 유일해야 한다.\"},{\"name\":\"BookStatus_AutoTransition\",\"description\":\"도서는 등록 시 '대출가능' 상태로 시작하며, 대출/반납/예약/폐기 상황에 따라 상태가 자동으로 변경된다.\"},{\"name\":\"BookDiscard_Restriction\",\"description\":\"폐기된 도서는 더 이상 대출이 불가하다.\"},{\"name\":\"ReturnStatusTransition\",\"description\":\"도서 반납 시 예약자가 없으면 '대출가능', 예약자가 있으면 '예약중' 상태로 자동 변경된다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"중복확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"상세보기\",\"폐기처리\"],\"filters\":[\"title\",\"ISBN\",\"category\",\"status\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"ISBN\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\",\"폐기처리\"]}}]},\"BookDetail\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"loanedBy\",\"loanDate\",\"returnDate\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"status\",\"changedAt\",\"changedBy\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"displayName\":\"도서가 등록됨\"},{\"name\":\"BookRegistrationFailed\",\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"displayName\":\"도서 등록 실패됨\"},{\"name\":\"BookDiscarded\",\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"displayName\":\"도서가 폐기됨\"},{\"name\":\"BookSearched\",\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"displayName\":\"도서가 검색됨\"},{\"name\":\"BookLoanHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"displayName\":\"도서의 대출 이력이 조회됨\"},{\"name\":\"BookStatusHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"sends to\",\"targetContext\":\"BookLoanProcess\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
            },
            "BookLoanProcess": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Loan",
                            "alias": "대출"
                        },
                        "enumerations": [
                            {
                                "name": "LoanStatus",
                                "alias": "대출 상태"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "BookReference",
                                "alias": "도서 참조",
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
                            "name": "Reservation",
                            "alias": "예약"
                        },
                        "enumerations": [],
                        "valueObjects": [
                            {
                                "name": "BookReference",
                                "alias": "도서 참조",
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
                    }
                ],
                "pros": {
                    "cohesion": "핵심 대출·예약 업무에만 집중하여 집계 경계가 단순하다.",
                    "coupling": "Book, Member 등 외부 엔티티와의 참조만 유지하며 내부 결합도가 낮다.",
                    "consistency": "대출·예약 관련 상태 변경이 집계 내에서 일관성 있게 처리된다.",
                    "encapsulation": "도서 상태 자동 변경, 연체 연장 불가 등 핵심 규칙이 Loan 집계에 명확히 캡슐화된다.",
                    "complexity": "집계 수가 적어 전체 시스템 구조가 단순하며 이해와 유지보수가 쉽다.",
                    "independence": "Loan, Reservation은 별도로 발전 가능하며, 서비스 규모가 작을 때 최적화된 형태다.",
                    "performance": "불필요한 조인과 복잡한 트랜잭션이 최소화되어 빠른 응답이 가능하다."
                },
                "cons": {
                    "cohesion": "이력 관리, 상세 현황 등 부가 업무가 서비스 계층에 집중되어 코드 분산이 발생한다.",
                    "coupling": "이력·상태 추적이 외부 집계(BookLoanHistory, BookStatusHistory)에 의존해야 한다.",
                    "consistency": "복합 시나리오(대출→이력 동시 기록 등)에서 강한 일관성 보장이 어렵다.",
                    "encapsulation": "이력 및 상태 변경 규칙이 Loan 외부에 위치해 도메인 규칙이 분산될 수 있다.",
                    "complexity": "확장 시 부가 업무(이력, 상태변경 등) 도입을 위해 구조 변경 필요성이 생긴다.",
                    "independence": "외부 이력 집계와의 연동이 반드시 필요해 완전 독립 운영은 어렵다.",
                    "performance": "대출 및 예약 현황, 이력 동시 조회 시 성능 저하가 발생할 수 있다."
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "name": "BookLoanProcess",
                    "alias": "도서 대출 프로세스",
                    "displayName": "도서 대출 프로세스",
                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}\n\n## Event\n\n{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}\n\n## Event\n\n{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}\n\n## Event\n\n{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                    "aggregates": [
                        {
                            "name": "Loan",
                            "alias": "대출"
                        },
                        {
                            "name": "Reservation",
                            "alias": "예약"
                        },
                        {
                            "name": "Member",
                            "alias": "회원"
                        }
                    ]
                },
                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 회원 확인 후 도서를 대출하거나 반납할 수 있다. 대출 시 도서명 또는 ISBN으로 검색, 대출 기간 선택, 이미 대출 중인 경우 예약 신청이 가능하다. 반납 시 도서 상태 및 예약자 유무에 따라 자동 상태 변경이 이루어진다.\",\"acceptance\":[\"회원번호와 이름으로 회원이 확인되어야 한다.\",\"도서명 또는 ISBN으로 도서를 검색할 수 있어야 한다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"이미 대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 자동으로 '대출중'으로 변경된다.\",\"반납 완료 시 예약자 유무에 따라 도서 상태가 '예약중' 또는 '대출가능'으로 변경된다.\"]},{\"title\":\"대출 현황 및 처리\",\"description\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"acceptance\":[\"대출 건별로 대출일, 반납예정일, 현재 상태를 확인할 수 있다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"연체 상태에서는 연장이 불가하다.\"]},{\"title\":\"도서별 이력 및 상태 변경 추적\",\"description\":\"관리자는 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있다.\",\"acceptance\":[\"도서별로 모든 대출 이력과 상태 변경 이력을 볼 수 있다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"beforeStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"afterStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 기간 선택 제한\",\"description\":\"대출 기간은 7일, 14일, 30일만 선택할 수 있다.\"},{\"name\":\"연체 도서 연장 불가\",\"description\":\"연체 상태(OVERDUE)인 대출 건은 연장이 불가하다.\"},{\"name\":\"대출 상태 자동 변경\",\"description\":\"도서 대출 시 상태는 'ON_LOAN', 반납 시 예약자 없으면 'AVAILABLE', 예약자 있으면 'RESERVED'로 자동 변경된다.\"},{\"name\":\"폐기/대출 불가 도서 대출 거부\",\"description\":\"도서 상태가 'DISCARDED' 또는 대출 불가 시 대출이 거부된다.\"}],\"interfaces\":{\"LoanAndReturn\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[\"회원 확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchType\",\"type\":\"select\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\",\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 반납\",\"type\":\"form\",\"fields\":[{\"name\":\"loanId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"반납 처리\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatus\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\"],\"filters\":[\"대출 상태\",\"대출일\",\"반납예정일\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"title\",\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서별 이력 조회\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"대출 이력 조회\",\"상태 변경 이력 조회\"],\"filters\":[],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"status\"],\"actions\":[]}},{\"name\":\"도서 상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"historyId\",\"beforeStatus\",\"afterStatus\",\"changedAt\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"MemberVerified\",\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"displayName\":\"회원이 확인됨\"},{\"name\":\"BookLoanRequested\",\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"displayName\":\"도서 대출이 신청됨\"},{\"name\":\"BookLoanRejected\",\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"displayName\":\"도서 대출이 거부됨\"},{\"name\":\"BookLoanApproved\",\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"displayName\":\"도서 대출이 승인됨\"},{\"name\":\"BookReserved\",\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 예약됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookAvailable\",\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\"},{\"name\":\"BookReservedForNext\",\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"displayName\":\"대출 기간이 연장됨\"},{\"name\":\"LoanOverdue\",\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"displayName\":\"도서 대출이 연체됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"receives from\",\"targetContext\":\"도서 관리 (BookManagement)\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
            }
        },
        "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
        "state": {
            "generator": "RequirementsMappingGenerator",
            "isAIModelSelected": false,
            "firstMessageIsTyping": true,
            "secondMessageIsTyping": false,
            "userStory": "",
            "communicationStyle": "Choreography",
            "aggregateDetail": false,
            "uiStyle": null
        },
        "messages": [
            {
                "uniqueId": "a7d478c9160fb9db7cdff83b720f30d7",
                "type": "processAnalysis",
                "isAnalizing": false,
                "isSummarizeStarted": false,
                "isGeneratingBoundedContext": false,
                "isStartMapping": false,
                "processingRate": 0,
                "content": {
                    "type": "ANALYSIS_RESULT",
                    "projectName": "Requirements Analysis",
                    "content": {
                        "elements": {
                            "dc17fbbc-b66d-3c08-4d8d-c7f291c98cd6": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "dc17fbbc-b66d-3c08-4d8d-c7f291c98cd6",
                                "name": "도서 관리자",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "dc17fbbc-b66d-3c08-4d8d-c7f291c98cd6",
                                    "x": 150,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "8772000b-f2c4-f4bb-2dbd-9ff041bf664c": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "8772000b-f2c4-f4bb-2dbd-9ff041bf664c",
                                "name": "회원",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "8772000b-f2c4-f4bb-2dbd-9ff041bf664c",
                                    "x": 150,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "0d1c5f32-b18e-e1b4-772f-42eed6905650": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "0d1c5f32-b18e-e1b4-772f-42eed6905650",
                                "name": "도서 대출 시스템",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "0d1c5f32-b18e-e1b4-772f-42eed6905650",
                                    "x": 150,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "628255aa-fb94-6e14-4f6d-14c5ee7d3d5b": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "628255aa-fb94-6e14-4f6d-14c5ee7d3d5b",
                                "visibility": "public",
                                "name": "BookRegistered",
                                "oldName": "",
                                "displayName": "도서가 등록됨",
                                "namePascalCase": "BookRegistered",
                                "nameCamelCase": "bookRegistered",
                                "namePlural": "",
                                "description": "도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "628255aa-fb94-6e14-4f6d-14c5ee7d3d5b",
                                    "x": 300,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "628255aa-fb94-6e14-4f6d-14c5ee7d3d5b",
                                    "x": 300,
                                    "y": 150,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "5aea5ee1-144e-ad12-2e62-ebee77cff972": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "5aea5ee1-144e-ad12-2e62-ebee77cff972",
                                "visibility": "public",
                                "name": "BookRegistrationFailed",
                                "oldName": "",
                                "displayName": "도서 등록 실패됨",
                                "namePascalCase": "BookRegistrationFailed",
                                "nameCamelCase": "bookRegistrationFailed",
                                "namePlural": "",
                                "description": "도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "5aea5ee1-144e-ad12-2e62-ebee77cff972",
                                    "x": 500,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "5aea5ee1-144e-ad12-2e62-ebee77cff972",
                                    "x": 500,
                                    "y": 150,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "ba6af07d-1de1-7c88-9591-339dbaeee7f5": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "ba6af07d-1de1-7c88-9591-339dbaeee7f5",
                                "visibility": "public",
                                "name": "BookDiscarded",
                                "oldName": "",
                                "displayName": "도서가 폐기됨",
                                "namePascalCase": "BookDiscarded",
                                "nameCamelCase": "bookDiscarded",
                                "namePlural": "",
                                "description": "도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "ba6af07d-1de1-7c88-9591-339dbaeee7f5",
                                    "x": 700,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "ba6af07d-1de1-7c88-9591-339dbaeee7f5",
                                    "x": 700,
                                    "y": 150,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "f24421e5-5a83-d40c-3870-d2df9a572838": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "f24421e5-5a83-d40c-3870-d2df9a572838",
                                "visibility": "public",
                                "name": "BookLoanHistoryViewed",
                                "oldName": "",
                                "displayName": "도서의 대출 이력이 조회됨",
                                "namePascalCase": "BookLoanHistoryViewed",
                                "nameCamelCase": "bookLoanHistoryViewed",
                                "namePlural": "",
                                "description": "도서 관리자가 특정 도서의 대출 이력을 조회함.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "f24421e5-5a83-d40c-3870-d2df9a572838",
                                    "x": 900,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "f24421e5-5a83-d40c-3870-d2df9a572838",
                                    "x": 900,
                                    "y": 150,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "460bf856-ee9b-40ad-ec18-df030e91a131": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "460bf856-ee9b-40ad-ec18-df030e91a131",
                                "visibility": "public",
                                "name": "BookStatusHistoryViewed",
                                "oldName": "",
                                "displayName": "도서의 상태 변경 이력이 조회됨",
                                "namePascalCase": "BookStatusHistoryViewed",
                                "nameCamelCase": "bookStatusHistoryViewed",
                                "namePlural": "",
                                "description": "도서 관리자가 특정 도서의 상태 변경 이력을 조회함.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "460bf856-ee9b-40ad-ec18-df030e91a131",
                                    "x": 1100,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "460bf856-ee9b-40ad-ec18-df030e91a131",
                                    "x": 1100,
                                    "y": 150,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "99af563a-a66d-20a1-3ca7-29a0da0d3108": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "99af563a-a66d-20a1-3ca7-29a0da0d3108",
                                "visibility": "public",
                                "name": "BookSearched",
                                "oldName": "",
                                "displayName": "도서가 검색됨",
                                "namePascalCase": "BookSearched",
                                "nameCamelCase": "bookSearched",
                                "namePlural": "",
                                "description": "회원이 도서명이나 ISBN으로 도서를 검색함.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "99af563a-a66d-20a1-3ca7-29a0da0d3108",
                                    "x": 300,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "99af563a-a66d-20a1-3ca7-29a0da0d3108",
                                    "x": 300,
                                    "y": 400,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "4f4560d3-88cb-ff96-3433-b28225f033eb": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                "visibility": "public",
                                "name": "MemberVerified",
                                "oldName": "",
                                "displayName": "회원이 확인됨",
                                "namePascalCase": "MemberVerified",
                                "nameCamelCase": "memberVerified",
                                "namePlural": "",
                                "description": "회원번호와 이름으로 회원 정보가 확인됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                    "x": 500,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                    "x": 500,
                                    "y": 400,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "12d9c01f-d06d-4afc-f30e-448fa9164758": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                "visibility": "public",
                                "name": "BookLoanRequested",
                                "oldName": "",
                                "displayName": "도서 대출이 신청됨",
                                "namePascalCase": "BookLoanRequested",
                                "nameCamelCase": "bookLoanRequested",
                                "namePlural": "",
                                "description": "회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "x": 700,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "x": 700,
                                    "y": 400,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "c1070049-1afb-a305-1b3c-e3292e2d94c9": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "c1070049-1afb-a305-1b3c-e3292e2d94c9",
                                "visibility": "public",
                                "name": "BookReserved",
                                "oldName": "",
                                "displayName": "도서가 예약됨",
                                "namePascalCase": "BookReserved",
                                "nameCamelCase": "bookReserved",
                                "namePlural": "",
                                "description": "대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "c1070049-1afb-a305-1b3c-e3292e2d94c9",
                                    "x": 900,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "c1070049-1afb-a305-1b3c-e3292e2d94c9",
                                    "x": 900,
                                    "y": 400,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "c8e51c16-e742-d37e-ad1f-64e10e852042": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                "visibility": "public",
                                "name": "BookReturned",
                                "oldName": "",
                                "displayName": "도서가 반납됨",
                                "namePascalCase": "BookReturned",
                                "nameCamelCase": "bookReturned",
                                "namePlural": "",
                                "description": "회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                    "x": 1100,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                    "x": 1100,
                                    "y": 400,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "8f2a0b6c-5704-e46d-d4ec-92dff388fb8b": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "8f2a0b6c-5704-e46d-d4ec-92dff388fb8b",
                                "visibility": "public",
                                "name": "LoanExtended",
                                "oldName": "",
                                "displayName": "대출 기간이 연장됨",
                                "namePascalCase": "LoanExtended",
                                "nameCamelCase": "loanExtended",
                                "namePlural": "",
                                "description": "회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "8f2a0b6c-5704-e46d-d4ec-92dff388fb8b",
                                    "x": 1300,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "8f2a0b6c-5704-e46d-d4ec-92dff388fb8b",
                                    "x": 1300,
                                    "y": 400,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "7905f41a-3249-07c5-8156-23a812533f41": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "7905f41a-3249-07c5-8156-23a812533f41",
                                "visibility": "public",
                                "name": "BookLoanRejected",
                                "oldName": "",
                                "displayName": "도서 대출이 거부됨",
                                "namePascalCase": "BookLoanRejected",
                                "nameCamelCase": "bookLoanRejected",
                                "namePlural": "",
                                "description": "도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "7905f41a-3249-07c5-8156-23a812533f41",
                                    "x": 300,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "7905f41a-3249-07c5-8156-23a812533f41",
                                    "x": 300,
                                    "y": 650,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "d976f812-65a9-161c-a1f2-a9b83f7a39e2": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                "visibility": "public",
                                "name": "BookLoanApproved",
                                "oldName": "",
                                "displayName": "도서 대출이 승인됨",
                                "namePascalCase": "BookLoanApproved",
                                "nameCamelCase": "bookLoanApproved",
                                "namePlural": "",
                                "description": "도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                    "x": 500,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                    "x": 500,
                                    "y": 650,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "c45c0034-1123-ddea-61c8-45ce7691076e": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                "visibility": "public",
                                "name": "BookAvailable",
                                "oldName": "",
                                "displayName": "도서가 대출 가능 상태로 변경됨",
                                "namePascalCase": "BookAvailable",
                                "nameCamelCase": "bookAvailable",
                                "namePlural": "",
                                "description": "반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                    "x": 700,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                    "x": 700,
                                    "y": 650,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "24b57ad9-8842-6de1-3af4-b7d41c06f1de": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                "visibility": "public",
                                "name": "BookReservedForNext",
                                "oldName": "",
                                "displayName": "도서가 다음 예약자를 위해 예약중 상태로 변경됨",
                                "namePascalCase": "BookReservedForNext",
                                "nameCamelCase": "bookReservedForNext",
                                "namePlural": "",
                                "description": "반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                    "x": 900,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                    "x": 900,
                                    "y": 650,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            },
                            "8df111e5-4765-a78f-0f42-7d544de05555": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "8df111e5-4765-a78f-0f42-7d544de05555",
                                "visibility": "public",
                                "name": "LoanOverdue",
                                "oldName": "",
                                "displayName": "도서 대출이 연체됨",
                                "namePascalCase": "LoanOverdue",
                                "nameCamelCase": "loanOverdue",
                                "namePlural": "",
                                "description": "반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.",
                                "author": null,
                                "aggregate": {},
                                "boundedContext": {},
                                "fieldDescriptors": [
                                    {
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "name": "id",
                                        "className": "Long",
                                        "nameCamelCase": "id",
                                        "namePascalCase": "Id",
                                        "isKey": true
                                    }
                                ],
                                "mirrorElement": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "8df111e5-4765-a78f-0f42-7d544de05555",
                                    "x": 1100,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "8df111e5-4765-a78f-0f42-7d544de05555",
                                    "x": 1100,
                                    "y": 650,
                                    "subWidth": 100,
                                    "width": 20,
                                    "height": 20,
                                    "style": "{}"
                                },
                                "relationPolicyInfo": [],
                                "relationCommandInfo": [],
                                "trigger": "@PostPersist"
                            }
                        },
                        "relations": {
                            "3a415ff8-f749-77a7-4f06-c6a8a2adcb20": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "3a415ff8-f749-77a7-4f06-c6a8a2adcb20",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "3a415ff8-f749-77a7-4f06-c6a8a2adcb20",
                                "to": "3a415ff8-f749-77a7-4f06-c6a8a2adcb20",
                                "description": "",
                                "relationView": {
                                    "id": "3a415ff8-f749-77a7-4f06-c6a8a2adcb20",
                                    "value": "[[0,275],[2000,275]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,275],[2000,275]]"
                            },
                            "bcd7193e-9f99-56d6-4ea0-bdace657808a": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "bcd7193e-9f99-56d6-4ea0-bdace657808a",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "bcd7193e-9f99-56d6-4ea0-bdace657808a",
                                "to": "bcd7193e-9f99-56d6-4ea0-bdace657808a",
                                "description": "",
                                "relationView": {
                                    "id": "bcd7193e-9f99-56d6-4ea0-bdace657808a",
                                    "value": "[[0,525],[2000,525]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,525],[2000,525]]"
                            },
                            "19b5c789-f01e-d7a4-e0c7-ce56a457cb5f": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "19b5c789-f01e-d7a4-e0c7-ce56a457cb5f",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "19b5c789-f01e-d7a4-e0c7-ce56a457cb5f",
                                "to": "19b5c789-f01e-d7a4-e0c7-ce56a457cb5f",
                                "description": "",
                                "relationView": {
                                    "id": "19b5c789-f01e-d7a4-e0c7-ce56a457cb5f",
                                    "value": "[[0,775],[2000,775]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,775],[2000,775]]"
                            },
                            "7f18f2c0-cbad-4ef3-b6e5-e41f4ad73f41": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "7f18f2c0-cbad-4ef3-b6e5-e41f4ad73f41",
                                "name": "5",
                                "displayName": "5",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                    "visibility": "public",
                                    "name": "MemberVerified",
                                    "oldName": "",
                                    "displayName": "회원이 확인됨",
                                    "namePascalCase": "MemberVerified",
                                    "nameCamelCase": "memberVerified",
                                    "namePlural": "",
                                    "description": "회원번호와 이름으로 회원 정보가 확인됨.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                        "x": 500,
                                        "y": 400,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "visibility": "public",
                                    "name": "BookLoanRequested",
                                    "oldName": "",
                                    "displayName": "도서 대출이 신청됨",
                                    "namePascalCase": "BookLoanRequested",
                                    "nameCamelCase": "bookLoanRequested",
                                    "namePlural": "",
                                    "description": "회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                        "x": 700,
                                        "y": 400,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "from": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                "to": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                "relationView": {
                                    "id": "7f18f2c0-cbad-4ef3-b6e5-e41f4ad73f41",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "4f4560d3-88cb-ff96-3433-b28225f033eb",
                                    "to": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "needReconnect": true
                                }
                            },
                            "441e296c-6e9f-abab-03a6-3f07d92b3560": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "441e296c-6e9f-abab-03a6-3f07d92b3560",
                                "name": "6",
                                "displayName": "6",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "visibility": "public",
                                    "name": "BookLoanRequested",
                                    "oldName": "",
                                    "displayName": "도서 대출이 신청됨",
                                    "namePascalCase": "BookLoanRequested",
                                    "nameCamelCase": "bookLoanRequested",
                                    "namePlural": "",
                                    "description": "회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                        "x": 700,
                                        "y": 400,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                    "visibility": "public",
                                    "name": "BookLoanApproved",
                                    "oldName": "",
                                    "displayName": "도서 대출이 승인됨",
                                    "namePascalCase": "BookLoanApproved",
                                    "nameCamelCase": "bookLoanApproved",
                                    "namePlural": "",
                                    "description": "도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                        "x": 500,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                        "x": 500,
                                        "y": 650,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "from": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                "to": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                "relationView": {
                                    "id": "441e296c-6e9f-abab-03a6-3f07d92b3560",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "to": "d976f812-65a9-161c-a1f2-a9b83f7a39e2",
                                    "needReconnect": true
                                }
                            },
                            "f4af5758-5206-99f2-af9a-08ed0966598e": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "f4af5758-5206-99f2-af9a-08ed0966598e",
                                "name": "6",
                                "displayName": "6",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "visibility": "public",
                                    "name": "BookLoanRequested",
                                    "oldName": "",
                                    "displayName": "도서 대출이 신청됨",
                                    "namePascalCase": "BookLoanRequested",
                                    "nameCamelCase": "bookLoanRequested",
                                    "namePlural": "",
                                    "description": "회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                        "x": 700,
                                        "y": 400,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "7905f41a-3249-07c5-8156-23a812533f41",
                                    "visibility": "public",
                                    "name": "BookLoanRejected",
                                    "oldName": "",
                                    "displayName": "도서 대출이 거부됨",
                                    "namePascalCase": "BookLoanRejected",
                                    "nameCamelCase": "bookLoanRejected",
                                    "namePlural": "",
                                    "description": "도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "7905f41a-3249-07c5-8156-23a812533f41",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7905f41a-3249-07c5-8156-23a812533f41",
                                        "x": 300,
                                        "y": 650,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "from": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                "to": "7905f41a-3249-07c5-8156-23a812533f41",
                                "relationView": {
                                    "id": "f4af5758-5206-99f2-af9a-08ed0966598e",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "12d9c01f-d06d-4afc-f30e-448fa9164758",
                                    "to": "7905f41a-3249-07c5-8156-23a812533f41",
                                    "needReconnect": true
                                }
                            },
                            "7ed2d57b-fd48-f546-fcd1-93e00611dabb": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "7ed2d57b-fd48-f546-fcd1-93e00611dabb",
                                "name": "10",
                                "displayName": "10",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                    "visibility": "public",
                                    "name": "BookReturned",
                                    "oldName": "",
                                    "displayName": "도서가 반납됨",
                                    "namePascalCase": "BookReturned",
                                    "nameCamelCase": "bookReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                        "x": 1100,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                        "x": 1100,
                                        "y": 400,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                    "visibility": "public",
                                    "name": "BookAvailable",
                                    "oldName": "",
                                    "displayName": "도서가 대출 가능 상태로 변경됨",
                                    "namePascalCase": "BookAvailable",
                                    "nameCamelCase": "bookAvailable",
                                    "namePlural": "",
                                    "description": "반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                        "x": 700,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                        "x": 700,
                                        "y": 650,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "from": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                "to": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                "relationView": {
                                    "id": "7ed2d57b-fd48-f546-fcd1-93e00611dabb",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                    "to": "c45c0034-1123-ddea-61c8-45ce7691076e",
                                    "needReconnect": true
                                }
                            },
                            "91f6e213-75cd-b1fd-e1f7-1ec4fe94198b": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "91f6e213-75cd-b1fd-e1f7-1ec4fe94198b",
                                "name": "10",
                                "displayName": "10",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                    "visibility": "public",
                                    "name": "BookReturned",
                                    "oldName": "",
                                    "displayName": "도서가 반납됨",
                                    "namePascalCase": "BookReturned",
                                    "nameCamelCase": "bookReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                        "x": 1100,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                        "x": 1100,
                                        "y": 400,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                    "visibility": "public",
                                    "name": "BookReservedForNext",
                                    "oldName": "",
                                    "displayName": "도서가 다음 예약자를 위해 예약중 상태로 변경됨",
                                    "namePascalCase": "BookReservedForNext",
                                    "nameCamelCase": "bookReservedForNext",
                                    "namePlural": "",
                                    "description": "반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.",
                                    "author": null,
                                    "aggregate": {},
                                    "boundedContext": {},
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "id",
                                            "className": "Long",
                                            "nameCamelCase": "id",
                                            "namePascalCase": "Id",
                                            "isKey": true
                                        }
                                    ],
                                    "mirrorElement": null,
                                    "elementView": {
                                        "_type": "org.uengine.modeling.model.Event",
                                        "id": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                        "x": 900,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                        "x": 900,
                                        "y": 650,
                                        "subWidth": 100,
                                        "width": 20,
                                        "height": 20,
                                        "style": "{}"
                                    },
                                    "relationPolicyInfo": [],
                                    "relationCommandInfo": [],
                                    "trigger": "@PostPersist"
                                },
                                "from": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                "to": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                "relationView": {
                                    "id": "91f6e213-75cd-b1fd-e1f7-1ec4fe94198b",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "c8e51c16-e742-d37e-ad1f-64e10e852042",
                                    "to": "24b57ad9-8842-6de1-3af4-b7d41c06f1de",
                                    "needReconnect": true
                                }
                            }
                        }
                    },
                    "analysisResult": {
                        "recommendedBoundedContextsNumber": 4,
                        "events": [
                            {
                                "name": "BookRegistered",
                                "displayName": "도서가 등록됨",
                                "actor": "도서 관리자",
                                "level": 1,
                                "description": "도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.",
                                "inputs": [
                                    "도서명",
                                    "ISBN(13자리)",
                                    "저자",
                                    "출판사",
                                    "카테고리",
                                    "ISBN 중복 아님"
                                ],
                                "outputs": [
                                    "신규 도서 데이터",
                                    "'대출가능' 상태"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookRegistrationFailed",
                                "displayName": "도서 등록 실패됨",
                                "actor": "도서 관리자",
                                "level": 2,
                                "description": "도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.",
                                "inputs": [
                                    "ISBN(중복 또는 13자리 아님)"
                                ],
                                "outputs": [
                                    "에러 메시지",
                                    "등록 거부"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookDiscarded",
                                "displayName": "도서가 폐기됨",
                                "actor": "도서 관리자",
                                "level": 3,
                                "description": "도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.",
                                "inputs": [
                                    "도서 식별자",
                                    "폐기 사유"
                                ],
                                "outputs": [
                                    "도서 상태 '폐기'로 변경",
                                    "대출 불가"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookSearched",
                                "displayName": "도서가 검색됨",
                                "actor": "회원",
                                "level": 4,
                                "description": "회원이 도서명이나 ISBN으로 도서를 검색함.",
                                "inputs": [
                                    "검색어(도서명 또는 ISBN)"
                                ],
                                "outputs": [
                                    "검색 결과 도서 목록"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "MemberVerified",
                                "displayName": "회원이 확인됨",
                                "actor": "회원",
                                "level": 5,
                                "description": "회원번호와 이름으로 회원 정보가 확인됨.",
                                "inputs": [
                                    "회원번호",
                                    "이름"
                                ],
                                "outputs": [
                                    "회원 정보"
                                ],
                                "nextEvents": [
                                    "BookLoanRequested"
                                ]
                            },
                            {
                                "name": "BookLoanRequested",
                                "displayName": "도서 대출이 신청됨",
                                "actor": "회원",
                                "level": 6,
                                "description": "회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.",
                                "inputs": [
                                    "회원 정보",
                                    "도서 식별자",
                                    "대출 기간"
                                ],
                                "outputs": [
                                    "대출 신청 요청"
                                ],
                                "nextEvents": [
                                    "BookLoanApproved",
                                    "BookLoanRejected"
                                ]
                            },
                            {
                                "name": "BookLoanRejected",
                                "displayName": "도서 대출이 거부됨",
                                "actor": "도서 대출 시스템",
                                "level": 7,
                                "description": "도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.",
                                "inputs": [
                                    "도서 상태 '폐기' 또는 대출 불가"
                                ],
                                "outputs": [
                                    "대출 거부 알림"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookLoanApproved",
                                "displayName": "도서 대출이 승인됨",
                                "actor": "도서 대출 시스템",
                                "level": 8,
                                "description": "도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.",
                                "inputs": [
                                    "도서 상태 '대출가능'",
                                    "대출 신청 정보"
                                ],
                                "outputs": [
                                    "대출 정보 생성",
                                    "도서 상태 '대출중'으로 변경"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookReserved",
                                "displayName": "도서가 예약됨",
                                "actor": "회원",
                                "level": 9,
                                "description": "대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.",
                                "inputs": [
                                    "회원 정보",
                                    "대출 중인 도서 식별자"
                                ],
                                "outputs": [
                                    "예약 정보 생성",
                                    "도서 상태 '예약중'으로 변경"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookReturned",
                                "displayName": "도서가 반납됨",
                                "actor": "회원",
                                "level": 10,
                                "description": "회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.",
                                "inputs": [
                                    "반납 도서 식별자"
                                ],
                                "outputs": [
                                    "반납 처리",
                                    "도서 상태 변경"
                                ],
                                "nextEvents": [
                                    "BookAvailable",
                                    "BookReservedForNext"
                                ]
                            },
                            {
                                "name": "BookAvailable",
                                "displayName": "도서가 대출 가능 상태로 변경됨",
                                "actor": "도서 대출 시스템",
                                "level": 11,
                                "description": "반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.",
                                "inputs": [
                                    "반납 도서 식별자",
                                    "예약자 없음"
                                ],
                                "outputs": [
                                    "도서 상태 '대출가능'"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookReservedForNext",
                                "displayName": "도서가 다음 예약자를 위해 예약중 상태로 변경됨",
                                "actor": "도서 대출 시스템",
                                "level": 12,
                                "description": "반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.",
                                "inputs": [
                                    "반납 도서 식별자",
                                    "예약자 존재"
                                ],
                                "outputs": [
                                    "도서 상태 '예약중'"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanExtended",
                                "displayName": "대출 기간이 연장됨",
                                "actor": "회원",
                                "level": 13,
                                "description": "회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.",
                                "inputs": [
                                    "회원 정보",
                                    "대출 중인 도서 식별자",
                                    "연장 요청"
                                ],
                                "outputs": [
                                    "대출 기간 연장",
                                    "새 반납 예정일"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanOverdue",
                                "displayName": "도서 대출이 연체됨",
                                "actor": "도서 대출 시스템",
                                "level": 14,
                                "description": "반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.",
                                "inputs": [
                                    "반납 예정일 경과",
                                    "반납 미처리"
                                ],
                                "outputs": [
                                    "대출 상태 '연체'로 변경"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookLoanHistoryViewed",
                                "displayName": "도서의 대출 이력이 조회됨",
                                "actor": "도서 관리자",
                                "level": 15,
                                "description": "도서 관리자가 특정 도서의 대출 이력을 조회함.",
                                "inputs": [
                                    "도서 식별자"
                                ],
                                "outputs": [
                                    "대출 이력 목록"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookStatusHistoryViewed",
                                "displayName": "도서의 상태 변경 이력이 조회됨",
                                "actor": "도서 관리자",
                                "level": 16,
                                "description": "도서 관리자가 특정 도서의 상태 변경 이력을 조회함.",
                                "inputs": [
                                    "도서 식별자"
                                ],
                                "outputs": [
                                    "상태 변경 이력 목록"
                                ],
                                "nextEvents": []
                            }
                        ],
                        "actors": [
                            {
                                "name": "도서 관리자",
                                "events": [
                                    "BookRegistered",
                                    "BookRegistrationFailed",
                                    "BookDiscarded",
                                    "BookLoanHistoryViewed",
                                    "BookStatusHistoryViewed"
                                ],
                                "lane": 0
                            },
                            {
                                "name": "회원",
                                "events": [
                                    "BookSearched",
                                    "MemberVerified",
                                    "BookLoanRequested",
                                    "BookReserved",
                                    "BookReturned",
                                    "LoanExtended"
                                ],
                                "lane": 1
                            },
                            {
                                "name": "도서 대출 시스템",
                                "events": [
                                    "BookLoanApproved",
                                    "BookLoanRejected",
                                    "BookAvailable",
                                    "BookReservedForNext",
                                    "LoanOverdue"
                                ],
                                "lane": 2
                            }
                        ]
                    },
                    "currentGeneratedLength": 7214
                },
                "currentGeneratedLength": 0,
                "timestamp": "2025-06-09T05:50:18.530Z"
            },
            {
                "uniqueId": "e66bf4c2e45e592c8f8ab675f7ff5862",
                "type": "bcGenerationOption",
                "isSummarizeStarted": false,
                "isGeneratingBoundedContext": false,
                "isStartMapping": false,
                "isAnalizing": false,
                "generateOption": {
                    "numberOfBCs": 2,
                    "selectedAspects": [
                        "도메인 복잡도 분리",
                        "프로세스(value stream) 기반 분리"
                    ],
                    "additionalOptions": "",
                    "aspectDetails": {},
                    "isProtocolMode": true
                },
                "recommendedBoundedContextsNumber": 4,
                "timestamp": "2025-06-09T05:50:49.007Z"
            },
            {
                "uniqueId": "c8a00460a2fcfce981c198c32dfde3ed",
                "type": "boundedContextResult",
                "result": {
                    "도메인 복잡도 분리+프로세스(value stream) 기반 분리": {
                        "boundedContexts": [
                            {
                                "name": "BookManagement",
                                "alias": "도서 관리",
                                "importance": "Core Domain",
                                "complexity": "0.8",
                                "differentiation": "0.9",
                                "implementationStrategy": "Rich Domain Model",
                                "aggregates": [
                                    {
                                        "name": "Book",
                                        "alias": "도서"
                                    }
                                ],
                                "events": [
                                    "BookRegistered",
                                    "BookRegistrationFailed",
                                    "BookDiscarded",
                                    "BookSearched",
                                    "BookLoanHistoryViewed",
                                    "BookStatusHistoryViewed"
                                ],
                                "requirements": [
                                    {
                                        "type": "userStory",
                                        "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                                    },
                                    {
                                        "type": "userStory",
                                        "text": "도서는 도서명이나 ISBN으로 검색할 수 있어야 해."
                                    },
                                    {
                                        "type": "userStory",
                                        "text": "도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해."
                                    },
                                    {
                                        "type": "userStory",
                                        "text": "각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}"
                                    }
                                ],
                                "role": "도서 관리자는 새로운 도서를 등록하고, 도서의 상태(대출가능/대출중/예약중/폐기)를 관리하며, 각 도서의 대출 및 상태 변경 이력을 조회한다. 도서 등록 시 중복 및 형식 검증이 포함되고, 도서의 상태는 대출 및 반납 이벤트에 따라 변경된다. 도서 검색 기능도 포함한다."
                            },
                            {
                                "name": "BookLoanProcess",
                                "alias": "도서 대출 프로세스",
                                "importance": "Core Domain",
                                "complexity": "0.9",
                                "differentiation": "0.8",
                                "implementationStrategy": "Rich Domain Model",
                                "aggregates": [
                                    {
                                        "name": "Loan",
                                        "alias": "대출"
                                    },
                                    {
                                        "name": "Reservation",
                                        "alias": "예약"
                                    },
                                    {
                                        "name": "Member",
                                        "alias": "회원"
                                    }
                                ],
                                "events": [
                                    "MemberVerified",
                                    "BookLoanRequested",
                                    "BookLoanRejected",
                                    "BookLoanApproved",
                                    "BookReserved",
                                    "BookReturned",
                                    "BookAvailable",
                                    "BookReservedForNext",
                                    "LoanExtended",
                                    "LoanOverdue"
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
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}"
                                    }
                                ],
                                "role": "회원의 대출/반납, 예약, 대출 연장, 연체 관리 등 도서 대출 전체 프로세스를 담당한다. 회원 인증 및 도서 검색, 대출 상태 전환, 예약 처리, 반납 및 연체 상태 처리까지의 흐름을 포함한다."
                            }
                        ],
                        "relations": [
                            {
                                "name": "BookManagementToBookLoanProcess",
                                "type": "Pub/Sub",
                                "upStream": {
                                    "name": "BookManagement",
                                    "alias": "도서 관리"
                                },
                                "downStream": {
                                    "name": "BookLoanProcess",
                                    "alias": "도서 대출 프로세스"
                                }
                            }
                        ],
                        "thoughts": "이번 분리는 도메인 복잡도와 프로세스(밸류 스트림)를 기준으로 수행하였다. 우선, 요구사항을 PBC 매칭 규칙에 따라 확인하였으나, 도서 관리, 대출, 예약 등 도서관 특화 기능에 일치하는 PBC가 없어 모두 고유 도메인(코어 도메인)으로 분리하였다. 도서 등록/상태관리/검색/이력 등 도서 객체와 직접 관련된 복잡한 비즈니스 규칙은 '도서 관리'로, 회원 인증부터 대출/반납/예약/연장/연체 등 대출의 전체 흐름은 '도서 대출 프로세스'로 분리하였다. 이는 각 도메인의 책임과 이벤트 흐름, 데이터 일관성, 프로세스 소유권을 명확히 하기 위함이다. 두 컨텍스트는 도서의 상태 변화(대출 가능→대출중, 반납→예약중 등) 등에서 상호 이벤트를 주고받으며 Pub/Sub 패턴으로 느슨하게 연결된다. 인프라적 관점에서는 확장성 및 업무 변경의 유연성을 고려하여 단방향 이벤트 기반 연동을 선택하였다.",
                        "explanations": [
                            {
                                "sourceContext": "도서 관리",
                                "targetContext": "도서 대출 프로세스",
                                "relationType": "Pub/Sub",
                                "reason": "도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.",
                                "interactionPattern": "도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리."
                            }
                        ],
                        "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                        "currentGeneratedLength": 3347
                    }
                },
                "isStartMapping": false,
                "isGeneratingBoundedContext": false,
                "isSummarizeStarted": false,
                "isAnalizing": false,
                "processingRate": 100,
                "currentProcessingBoundedContext": "도서 대출 프로세스",
                "selectedAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                "summarizedResult": "",
                "pbcLists": [
                    {
                        "name": "chat-vue3-en",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/caa875dd-dc2c-402f-8d6b-66431c45cd6c",
                        "description": "Chat service (Vue3)",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## PBC Chat System Overview <br>\nThe PBC Chat system is designed to handle all chat-related tasks efficiently and securely. It provides a robust framework for chat room creation, conversation history storage, and retrieval. The system ensures seamless integration with Supabase and offers a user-friendly interface for both developers and users. Specifically optimized for Vue3-based environments, it delivers a smooth and responsive user experience utilizing modern web technologies. Through this integration, it offers various chat options and leverages Supabase's unique features to provide an optimal chat experience. The PBC Chat system ensures both reliability and scalability while offering users more diverse options to make the chat process smoother and more convenient.\n\n## Available Features\n### 1) Chat Room Creation <br>\n  Enables users to create chat rooms through various supported methods, ensuring a safe and fast chat environment.\n\n### 2) Conversation History Storage <br>\n  Provides functionality to securely store and manage all conversation history using Supabase.\n\n### 3) Conversation History Retrieval <br>\n  Allows users to view detailed records of past conversations, providing information including chat status and timestamps.\n\n## Usage Guide\n\n### 1) Analysis/Design\n1. Double-click the applied PBC's bounded context area to activate the PBC panel.\n\n<img width=\"1275\" alt=\"image\" src=\"https://github.com/user-attachments/assets/69cebda6-8334-4945-b0b7-7b061ad6c064\" /> <br>\n<Example of PBC Panel Creation>\n\n2. From the PBC panel options, select the event storming stickers corresponding to the features you want to use from reading elements, command elements, and event elements.\n\n<img width=\"435\" alt=\"image\" src=\"https://github.com/user-attachments/assets/22365ca1-139f-4582-a95f-bb425bb61383\" /> <br>\n<Example of Panel Sticker Option Selection>\n\n### 2) Implementation\n1. After closing the panel, click CODE to preview the event storming-based generated code.\n<img width=\"714\" alt=\"image\" src=\"https://github.com/user-attachments/assets/4d3f35e7-30cb-483d-a3b5-2fd099101ed4\" /> <br>\n\n2. In the generated code, click on the selected PBC folder > README.md to check the source code usage instructions.\n<img width=\"716\" alt=\"image\" src=\"https://github.com/user-attachments/assets/324887ab-53b3-4bd9-b8ba-823a62bcf764\" /> <br>\n<Example of PBC README.md File>\n\n3. After loading the source code in your IDE environment, follow the README instructions to download and extract the files, then verify that the downloaded PBC has been created in your source code.\n<img width=\"741\" alt=\"image\" src=\"https://github.com/user-attachments/assets/037b4ac3-dc03-4b96-9d83-dd049629d24f\" /> <br>\n<Example of PBC Source Code Download>\n\n4. To avoid port conflicts, modify the port appropriately in application.yml (payment/src/main/resources/application.yml).\n<img width=\"290\" alt=\"image\" src=\"https://github.com/user-attachments/assets/8809f047-3cc4-4e66-932e-9f89f6f8df5b\" /> <br>\n<Example of PBC Port Modification>\n",
                        "id": 12,
                        "pbcPath": "https://github.com/msa-ez/pbc-chat-vue3-en/blob/main/model.json"
                    },
                    {
                        "name": "review",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/fec3779d-2eb8-40bb-8a07-1a03ee120f6f",
                        "description": "review",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## PBC Review 시스템 개요\nPBC Review 시스템은 모든 리뷰 관련 작업을 효율적이고 안전하게 처리하도록 설계되었습니다. 이 시스템은 리뷰 등록, 평점 등록 및 조회를 위한 견고한 프레임워크를 제공합니다. 사용자 친화적인 인터페이스를 통해 특정 정보에 대한 평점과 리뷰를 쉽게 남길 수 있도록 지원합니다. 이러한 기능을 통해 다양한 리뷰 옵션을 제공하고, 사용자 경험을 최적화하여 보다 매끄럽고 편리한 리뷰 과정을 제공합니다. PBC Review 시스템은 신뢰성과 확장성을 동시에 확보하며, 사용자에게 보다 다양한 선택지를 제공하여 리뷰 과정을 더욱 매끄럽고 편리하게 만듭니다.\n\n## 사용 가능한 기능\n### 1) 리뷰 등록 <br>\n  사용자가 특정 정보에 대한 리뷰를 쉽게 등록할 수 있도록 하며, 안전하고 빠른 리뷰 환경을 보장합니다.\n\n### 2) 평점 등록 <br>\n  사용자 친화적인 인터페이스를 통해 사용자가 평점을 등록할 수 있는 기능을 제공합니다.\n\n### 3) 리뷰 및 평점 조회 <br>\n  등록된 모든 리뷰와 평점을 서비스를 이용하는 모든 사용자가 확인할 수 있도록 하는 기능을 제공합니다.\n\n## 사용 방법\n\n### 1) 분석/설계\n1. 적용한 PBC의 바운디드 컨텍스트 영역을 더블 클릭하여 PBC 패널을 활성화 합니다.\n\n<img width=\"1422\" alt=\"image\" src=\"https://github.com/user-attachments/assets/f1e557a5-7ac9-44d0-9ba2-30fd6fa11ba8\" /> <br>\n<PBC Panel 생성 예시>\n\n2. PBC 패널 옵션중 읽기 요소, 커맨드 요소, 이벤트 요소에서 각각 사용할 기능에 해당하는 이벤트스토밍 스티커를 선택합니다. \n\n<img width=\"767\" alt=\"image\" src=\"https://github.com/user-attachments/assets/2b255acd-934d-4565-8981-b16a2fe7e087\" /> <br>\n<Panel 스티커 옵션 선택 예시>\n\n### 2) 구현\n1. 패널을 닫은 후, CODE를 클릭하여 코드 프리뷰를 통해 이벤트스토밍기반 생성된 코드를 확인합니다.\n<img width=\"509\" alt=\"image\" src=\"https://github.com/user-attachments/assets/717d6253-1f07-43f7-b949-6bd7350e459b\" /> <br>\n\n2. 생성된 코드에서 선택한 PBC 폴더 > README.md를 클릭하여 소스코드 사용방법을 확인하여 사용할 수 있습니다.\n<img width=\"998\" alt=\"image\" src=\"https://github.com/user-attachments/assets/699bda6a-7167-4c50-98b4-1afe1ccb1607\" /> <br>\n<PBC README.md 파일 예시>\n",
                        "id": 14,
                        "pbcPath": "https://github.com/msa-ez/pbc-review/blob/main/model.json"
                    },
                    {
                        "name": "reservation-notification",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/88a59203-26e6-4f9e-8349-169b8737ef8a",
                        "description": "예약 & 알림 서비스",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## PBC Alarm 시스템 개요\nPBC Alarm 시스템은 모든 알림 관련 작업을 효율적이고 안전하게 처리하도록 설계되었습니다. 이 시스템은 즉각 알람 발송 및 예약 알림 발송을 위한 견고한 프레임워크를 제공합니다. SSE(Server-Sent Events) 기반의 기술을 활용하여 실시간으로 알림을 전송하며, 사용자 친화적인 인터페이스를 통해 알림 설정을 쉽게 관리할 수 있도록 지원합니다. 이러한 기능을 통해 다양한 알림 옵션을 제공하고, 사용자 경험을 최적화하여 보다 매끄럽고 편리한 알림 과정을 제공합니다. PBC Alarm 시스템은 신뢰성과 확장성을 동시에 확보하며, 사용자에게 보다 다양한 선택지를 제공하여 알림 과정을 더욱 매끄럽고 편리하게 만듭니다.\n\n## 사용 가능한 기능\n### 1) 즉각 알람 발송 <br>\n  SSE 기반의 기술을 통해 사용자가 즉각적인 알람을 받을 수 있도록 하며, 안전하고 빠른 알림 환경을 보장합니다.\n\n### 2) 예약 알림 발송 <br>\n  사용자가 정해진 날짜와 시간에 알림을 설정할 수 있는 기능을 제공하여, 예약된 알림을 정확하게 발송할 수 있도록 지원합니다.\n\n## 사용 방법\n\n### 1) 분석/설계\n1. 적용한 PBC의 바운디드 컨텍스트 영역을 더블 클릭하여 PBC 패널을 활성화 합니다.\n\n<img width=\"1275\" alt=\"image\" src=\"https://github.com/user-attachments/assets/69cebda6-8334-4945-b0b7-7b061ad6c064\" /> <br>\n<PBC Panel 생성 예시>\n\n2. PBC 패널 옵션중 읽기 요소, 커맨드 요소, 이벤트 요소에서 각각 사용할 기능에 해당하는 이벤트스토밍 스티커를 선택합니다. \n\n<img width=\"435\" alt=\"image\" src=\"https://github.com/user-attachments/assets/22365ca1-139f-4582-a95f-bb425bb61383\" /> <br>\n<Panel 스티커 옵션 선택 예시>\n\n* 결제를 통한 결제정보 업데이트와 같은 다른 마이크로서비스와의 통신이 발생할 경우\n  Event - Policy Relation을 연결해야합니다.\n\n  예시) 결제성공을 통한 주문 애그리거트의 결제정보 변경\n  \n  <img width=\"823\" alt=\"image\" src=\"https://github.com/user-attachments/assets/cfaa6b70-a489-42eb-8c18-823b8c9ed7dc\" /> <br>\n  \n\n### 2) 구현\n1. 패널을 닫은 후, CODE를 클릭하여 코드 프리뷰를 통해 이벤트스토밍기반 생성된 코드를 확인합니다.\n<img width=\"714\" alt=\"image\" src=\"https://github.com/user-attachments/assets/4d3f35e7-30cb-483d-a3b5-2fd099101ed4\" /> <br>\n\n2. 생성된 코드에서 선택한 PBC 폴더 > README.md를 클릭하여 소스코드 사용방법을 확인합니다.\n<img width=\"716\" alt=\"image\" src=\"https://github.com/user-attachments/assets/324887ab-53b3-4bd9-b8ba-823a62bcf764\" /> <br>\n<PBC README.md 파일 예시>\n\n3. IDE환경에서 소스코드를 Load한 후, README를 참고하여 다운로드 > 압축 해제를 진행하여 소스코드에 다운로드 받은 PBC가 생성되었는지 확인합니다.\n<img width=\"741\" alt=\"image\" src=\"https://github.com/user-attachments/assets/037b4ac3-dc03-4b96-9d83-dd049629d24f\" /> <br>\n<PBC 소스코드 다운 예시>\n\n4. port 충돌을 고려해 application.yml(payment/src/main/resources/application.yml)의 port를 적절하게 변경합니다.\n<img width=\"290\" alt=\"image\" src=\"https://github.com/user-attachments/assets/8809f047-3cc4-4e66-932e-9f89f6f8df5b\" /> <br>\n<PBC Port 변경 예시>\n",
                        "id": 15,
                        "pbcPath": "https://github.com/msa-ez/pbc-reservation-notification/blob/main/model.json"
                    },
                    {
                        "name": "reservation-notification-vue3",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/88a59203-26e6-4f9e-8349-169b8737ef8a",
                        "description": "예약 & 알림 서비스(Vue3)",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## PBC Alarm 시스템 개요\nPBC Alarm 시스템은 모든 알림 관련 작업을 효율적이고 안전하게 처리하도록 설계되었습니다. 이 시스템은 즉각 알람 발송 및 예약 알림 발송을 위한 견고한 프레임워크를 제공합니다. SSE(Server-Sent Events) 기반의 기술을 활용하여 실시간으로 알림을 전송하며, 사용자 친화적인 인터페이스를 통해 알림 설정을 쉽게 관리할 수 있도록 지원합니다. 특히, Vue3 기반 환경에서 원활하게 동작하도록 최적화되어 있어, 최신 웹 기술을 활용한 매끄럽고 반응성 높은 사용자 경험을 제공합니다. 이러한 기능을 통해 다양한 알림 옵션을 제공하고, 사용자 경험을 최적화하여 보다 매끄럽고 편리한 알림 과정을 제공합니다. PBC Alarm 시스템은 신뢰성과 확장성을 동시에 확보하며, 사용자에게 보다 다양한 선택지를 제공하여 알림 과정을 더욱 매끄럽고 편리하게 만듭니다.\n\n## 사용 가능한 기능\n### 1) 즉각 알람 발송 <br>\n  SSE 기반의 기술을 통해 사용자가 즉각적인 알람을 받을 수 있도록 하며, 안전하고 빠른 알림 환경을 보장합니다.\n\n### 2) 예약 알림 발송 <br>\n  사용자가 정해진 날짜와 시간에 알림을 설정할 수 있는 기능을 제공하여, 예약된 알림을 정확하게 발송할 수 있도록 지원합니다.\n\n## 사용 방법\n\n### 1) 분석/설계\n1. 적용한 PBC의 바운디드 컨텍스트 영역을 더블 클릭하여 PBC 패널을 활성화 합니다.\n\n<img width=\"1275\" alt=\"image\" src=\"https://github.com/user-attachments/assets/69cebda6-8334-4945-b0b7-7b061ad6c064\" /> <br>\n<PBC Panel 생성 예시>\n\n2. PBC 패널 옵션중 읽기 요소, 커맨드 요소, 이벤트 요소에서 각각 사용할 기능에 해당하는 이벤트스토밍 스티커를 선택합니다. \n\n<img width=\"435\" alt=\"image\" src=\"https://github.com/user-attachments/assets/22365ca1-139f-4582-a95f-bb425bb61383\" /> <br>\n<Panel 스티커 옵션 선택 예시>\n\n### 2) 구현\n1. 패널을 닫은 후, CODE를 클릭하여 코드 프리뷰를 통해 이벤트스토밍기반 생성된 코드를 확인합니다.\n<img width=\"714\" alt=\"image\" src=\"https://github.com/user-attachments/assets/4d3f35e7-30cb-483d-a3b5-2fd099101ed4\" /> <br>\n\n2. 생성된 코드에서 선택한 PBC 폴더 > README.md를 클릭하여 소스코드 사용방법을 확인합니다.\n<img width=\"716\" alt=\"image\" src=\"https://github.com/user-attachments/assets/324887ab-53b3-4bd9-b8ba-823a62bcf764\" /> <br>\n<PBC README.md 파일 예시>\n\n3. IDE환경에서 소스코드를 Load한 후, README를 참고하여 다운로드 > 압축 해제를 진행하여 소스코드에 다운로드 받은 PBC가 생성되었는지 확인합니다.\n<img width=\"741\" alt=\"image\" src=\"https://github.com/user-attachments/assets/037b4ac3-dc03-4b96-9d83-dd049629d24f\" /> <br>\n<PBC 소스코드 다운 예시>\n\n4. port 충돌을 고려해 application.yml(payment/src/main/resources/application.yml)의 port를 적절하게 변경합니다.\n<img width=\"290\" alt=\"image\" src=\"https://github.com/user-attachments/assets/8809f047-3cc4-4e66-932e-9f89f6f8df5b\" /> <br>\n<PBC Port 변경 예시>\n",
                        "id": 16,
                        "pbcPath": "https://github.com/msa-ez/pbc-reservation-notification-vue3/blob/main/model.json"
                    },
                    {
                        "name": "chat-vue3",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/caa875dd-dc2c-402f-8d6b-66431c45cd6c",
                        "description": "채팅 서비스(Vue3)",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## PBC Chat 시스템 개요 <br>\nPBC Chat 시스템은 모든 채팅 관련 작업을 효율적이고 안전하게 처리하도록 설계되었습니다. 이 시스템은 채팅방 생성, 대화 내역 저장 및 조회를 위한 견고한 프레임워크를 제공합니다. Supabase와의 원활한 통합을 보장하며, 개발자와 사용자 모두에게 사용자 친화적인 인터페이스를 제공합니다. 특히, Vue3 기반 환경에서 원활하게 동작하도록 최적화되어 있어, 최신 웹 기술을 활용한 매끄럽고 반응성 높은 사용자 경험을 제공합니다. 이러한 통합을 통해 다양한 채팅 옵션을 제공하고, Supabase의 고유한 기능을 활용하여 최적의 채팅 경험을 제공합니다. PBC Chat 시스템은 신뢰성과 확장성을 동시에 확보하며, 사용자에게 보다 다양한 선택지를 제공하여 채팅 과정을 더욱 매끄럽고 편리하게 만듭니다.\n\n## 사용 가능한 기능\n### 1) 채팅방 생성 <br>\n  다양한 지원 방법을 통해 사용자가 채팅방을 생성할 수 있도록 하며, 안전하고 빠른 채팅 환경을 보장합니다.\n\n### 2) 대화 내역 저장 <br>\n  Supabase를 사용하여 모든 대화 내역을 안전하게 저장하고 관리할 수 있는 기능을 제공합니다.\n\n### 3) 대화 내역 조회 <br>\n  과거 대화의 상세 기록을 사용자가 볼 수 있도록 하여, 채팅 상태 및 타임스탬프를 포함한 정보를 제공합니다.\n\n## 사용 방법\n\n### 1) 분석/설계\n1. 적용한 PBC의 바운디드 컨텍스트 영역을 더블 클릭하여 PBC 패널을 활성화 합니다.\n\n<img width=\"1275\" alt=\"image\" src=\"https://github.com/user-attachments/assets/69cebda6-8334-4945-b0b7-7b061ad6c064\" /> <br>\n<PBC Panel 생성 예시>\n\n2. PBC 패널 옵션중 읽기 요소, 커맨드 요소, 이벤트 요소에서 각각 사용할 기능에 해당하는 이벤트스토밍 스티커를 선택합니다. \n\n<img width=\"435\" alt=\"image\" src=\"https://github.com/user-attachments/assets/22365ca1-139f-4582-a95f-bb425bb61383\" /> <br>\n<Panel 스티커 옵션 선택 예시>\n\n### 2) 구현\n1. 패널을 닫은 후, CODE를 클릭하여 코드 프리뷰를 통해 이벤트스토밍기반 생성된 코드를 확인합니다.\n<img width=\"714\" alt=\"image\" src=\"https://github.com/user-attachments/assets/4d3f35e7-30cb-483d-a3b5-2fd099101ed4\" /> <br>\n\n2. 생성된 코드에서 선택한 PBC 폴더 > README.md를 클릭하여 소스코드 사용방법을 확인합니다.\n<img width=\"716\" alt=\"image\" src=\"https://github.com/user-attachments/assets/324887ab-53b3-4bd9-b8ba-823a62bcf764\" /> <br>\n<PBC README.md 파일 예시>\n\n3. IDE환경에서 소스코드를 Load한 후, README를 참고하여 다운로드 > 압축 해제를 진행하여 소스코드에 다운로드 받은 PBC가 생성되었는지 확인합니다.\n<img width=\"741\" alt=\"image\" src=\"https://github.com/user-attachments/assets/037b4ac3-dc03-4b96-9d83-dd049629d24f\" /> <br>\n<PBC 소스코드 다운 예시>\n\n4. port 충돌을 고려해 application.yml(payment/src/main/resources/application.yml)의 port를 적절하게 변경합니다.\n<img width=\"290\" alt=\"image\" src=\"https://github.com/user-attachments/assets/8809f047-3cc4-4e66-932e-9f89f6f8df5b\" /> <br>\n<PBC Port 변경 예시>\n",
                        "id": 17,
                        "pbcPath": "https://github.com/msa-ez/pbc-chat-vue3/blob/main/model.json"
                    },
                    {
                        "name": "chat",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/caa875dd-dc2c-402f-8d6b-66431c45cd6c",
                        "description": "채팅 서비스",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## PBC Chat 시스템 개요 <br>\nPBC Chat 시스템은 모든 채팅 관련 작업을 효율적이고 안전하게 처리하도록 설계되었습니다. 이 시스템은 채팅방 생성, 대화 내역 저장 및 조회를 위한 견고한 프레임워크를 제공합니다. Supabase와의 원활한 통합을 보장하며, 개발자와 사용자 모두에게 사용자 친화적인 인터페이스를 제공합니다. 이러한 통합을 통해 다양한 채팅 옵션을 제공하고, Supabase의 고유한 기능을 활용하여 최적의 채팅 경험을 제공합니다. PBC Chat 시스템은 신뢰성과 확장성을 동시에 확보하며, 사용자에게 보다 다양한 선택지를 제공하여 채팅 과정을 더욱 매끄럽고 편리하게 만듭니다.\n\n## 사용 가능한 기능\n### 1) 채팅방 생성 <br>\n  다양한 지원 방법을 통해 사용자가 채팅방을 생성할 수 있도록 하며, 안전하고 빠른 채팅 환경을 보장합니다.\n\n### 2) 대화 내역 저장 <br>\n  Supabase를 사용하여 모든 대화 내역을 안전하게 저장하고 관리할 수 있는 기능을 제공합니다.\n\n### 3) 대화 내역 조회 <br>\n  과거 대화의 상세 기록을 사용자가 볼 수 있도록 하여, 채팅 상태 및 타임스탬프를 포함한 정보를 제공합니다.\n\n## 사용 방법\n\n### 1) 분석/설계\n1. 적용한 PBC의 바운디드 컨텍스트 영역을 더블 클릭하여 PBC 패널을 활성화 합니다.\n\n<img width=\"1275\" alt=\"image\" src=\"https://github.com/user-attachments/assets/69cebda6-8334-4945-b0b7-7b061ad6c064\" /> <br>\n<PBC Panel 생성 예시>\n\n2. PBC 패널 옵션중 읽기 요소, 커맨드 요소, 이벤트 요소에서 각각 사용할 기능에 해당하는 이벤트스토밍 스티커를 선택합니다. \n\n<img width=\"435\" alt=\"image\" src=\"https://github.com/user-attachments/assets/22365ca1-139f-4582-a95f-bb425bb61383\" /> <br>\n<Panel 스티커 옵션 선택 예시>\n\n### 2) 구현\n1. 패널을 닫은 후, CODE를 클릭하여 코드 프리뷰를 통해 이벤트스토밍기반 생성된 코드를 확인합니다.\n<img width=\"714\" alt=\"image\" src=\"https://github.com/user-attachments/assets/4d3f35e7-30cb-483d-a3b5-2fd099101ed4\" /> <br>\n\n2. 생성된 코드에서 선택한 PBC 폴더 > README.md를 클릭하여 소스코드 사용방법을 확인합니다.\n<img width=\"716\" alt=\"image\" src=\"https://github.com/user-attachments/assets/324887ab-53b3-4bd9-b8ba-823a62bcf764\" /> <br>\n<PBC README.md 파일 예시>\n\n3. IDE환경에서 소스코드를 Load한 후, README를 참고하여 다운로드 > 압축 해제를 진행하여 소스코드에 다운로드 받은 PBC가 생성되었는지 확인합니다.\n<img width=\"741\" alt=\"image\" src=\"https://github.com/user-attachments/assets/037b4ac3-dc03-4b96-9d83-dd049629d24f\" /> <br>\n<PBC 소스코드 다운 예시>\n\n4. port 충돌을 고려해 application.yml(payment/src/main/resources/application.yml)의 port를 적절하게 변경합니다.\n<img width=\"290\" alt=\"image\" src=\"https://github.com/user-attachments/assets/8809f047-3cc4-4e66-932e-9f89f6f8df5b\" /> <br>\n<PBC Port 변경 예시>\n",
                        "id": 18,
                        "pbcPath": "https://github.com/msa-ez/pbc-chat/blob/main/model.json"
                    },
                    {
                        "name": "payment-system",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/7577d207-dec2-4421-9f4d-754efea9f41d",
                        "description": "결제를 위한 공통 기능",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## PBC 결제 시스템 개요 <br>\nPBC 결제 시스템은 모든 결제 관련 작업을 효율적이고 안전하게 처리하도록 설계되었습니다. 이 시스템은 결제 처리, 취소 관리, 거래 내역 조회를 위한 견고한 프레임워크를 제공합니다. 다양한 결제 게이트웨이(PG사)와의 원활한 통합을 보장하며, 개발자와 사용자 모두에게 사용자 친화적인 인터페이스를 제공합니다. 이러한 통합을 통해 다양한 결제 옵션을 제공하고, 각 게이트웨이의 고유한 기능을 활용하여 최적의 결제 경험을 제공합니다. PBC 결제 시스템은 신뢰성과 확장성을 동시에 확보하며, 사용자에게 보다 다양한 선택지를 제공하여 결제 과정을 더욱 매끄럽고 편리하게 만듭니다.\n\n## 사용 가능한 기능\n\n### 1) 결제 처리 <br>\n  다양한 지원 방법을 통해 사용자가 결제를 할 수 있도록 하며, 안전하고 빠른 거래를 보장합니다.\n\n### 2) 결제 취소 <br>\n   전체 또는 부분 환불 옵션을 통해 결제를 취소할 수 있는 기능을 제공합니다.\n\n### 3) 거래 내역 조회 <br>\n   결제 상태 및 타임스탬프를 포함한 과거 거래의 상세 기록을 사용자가 볼 수 있도록 합니다.\n\n## 사용 방법\n\n### 1) 분석/설계\n1. 적용한 PBC의 바운디드 컨텍스트 영역을 더블 클릭하여 PBC 패널을 활성화 합니다.\n\n<img width=\"1275\" alt=\"image\" src=\"https://github.com/user-attachments/assets/69cebda6-8334-4945-b0b7-7b061ad6c064\" /> <br>\n<PBC Panel 생성 예시>\n\n2. PBC 패널 옵션중 읽기 요소, 커맨드 요소, 이벤트 요소에서 각각 사용할 기능에 해당하는 이벤트스토밍 스티커를 선택합니다. \n\n<img width=\"435\" alt=\"image\" src=\"https://github.com/user-attachments/assets/22365ca1-139f-4582-a95f-bb425bb61383\" /> <br>\n<Panel 스티커 옵션 선택 예시>\n\n* 결제를 통한 결제정보 업데이트와 같은 다른 마이크로서비스와의 통신이 발생할 경우\n  Event - Policy Relation을 연결해야합니다.\n\n  예시) 결제성공을 통한 주문 애그리거트의 결제정보 변경\n  \n  <img width=\"823\" alt=\"image\" src=\"https://github.com/user-attachments/assets/cfaa6b70-a489-42eb-8c18-823b8c9ed7dc\" /> <br>\n  \n\n### 2) 구현\n1. 패널을 닫은 후, CODE를 클릭하여 코드 프리뷰를 통해 이벤트스토밍기반 생성된 코드를 확인합니다.\n<img width=\"714\" alt=\"image\" src=\"https://github.com/user-attachments/assets/4d3f35e7-30cb-483d-a3b5-2fd099101ed4\" /> <br>\n\n2. 생성된 코드에서 선택한 PBC 폴더 > README.md를 클릭하여 소스코드 사용방법을 확인합니다.\n<img width=\"716\" alt=\"image\" src=\"https://github.com/user-attachments/assets/324887ab-53b3-4bd9-b8ba-823a62bcf764\" /> <br>\n<PBC README.md 파일 예시>\n\n3. IDE환경에서 소스코드를 Load한 후, README를 참고하여 다운로드 > 압축 해제를 진행하여 소스코드에 다운로드 받은 PBC가 생성되었는지 확인합니다.\n<img width=\"741\" alt=\"image\" src=\"https://github.com/user-attachments/assets/037b4ac3-dc03-4b96-9d83-dd049629d24f\" /> <br>\n<PBC 소스코드 다운 예시>\n\n4. port 충돌을 고려해 application.yml(payment/src/main/resources/application.yml)의 port를 적절하게 변경합니다.\n<img width=\"290\" alt=\"image\" src=\"https://github.com/user-attachments/assets/8809f047-3cc4-4e66-932e-9f89f6f8df5b\" /> <br>\n<PBC Port 변경 예시>\n\n6. 이후, EDA기반 통신이 이루어지도록 다른 마이크로서비스와 topic명을 일치 시키기 위해 destination을 수정합니다.\n<img width=\"314\" alt=\"image\" src=\"https://github.com/user-attachments/assets/634d95ea-3d50-43e2-8d95-2a42a51de390\" /> <br>\n\n7. Frontend도 동일하게 package.json(frontend/package.json)의 'start'에 명시된 port number를 변경합니다.\n<img width=\"366\" alt=\"image\" src=\"https://github.com/user-attachments/assets/c750e392-c186-4d25-a8a1-2c088a412468\" /> <br>\n\n8. 아래 커맨드를 통해 Payment system의 backend, frontend를 기동합니다.\n```\n// 1. payment Backend\n\n// Root 기준\ncd payment-system-0-0-6\ncd payment\nmvn spring-boot:run\n\n// 2. payment Frontend\n\n// Root 기준\ncd frontend\nnpm install\nnpm run build\nnpm run start\n```\n\n8. Payment system의 Gateway 라우팅 설정을 진행하기 위해 application.yml(gateway/src/resources/application.yml)에 라우팅을 설정합니다.\n<img width=\"350\" alt=\"image\" src=\"https://github.com/user-attachments/assets/884ee895-b385-43be-aa37-7626b1d70056\" /> <br>\n\n9. Root에 위치한 Frontend에 web component 등록을 위해 index.html(frontend/public/index.html)에 Payment system의 17line에 아래와 같이 등록합니다.\n```\n<script src=\"<Payment system의 Frontend Url>/payment-system-app.js\"></script>\n```\n<img width=\"1013\" alt=\"image\" src=\"https://github.com/user-attachments/assets/8a5e7b96-facd-4c0b-9e65-387c198a2d80\" /> <br>\n\n10. Payment system을 SingleSPA로 동작하기 위해 Component의 \\<template>과 <script>에 다음과 같이 코드를 생성합니다.\n```\n// template\n<template>\n  <payment-system-app>\n      <payment-system\n          service-type=\"<payment-system frontend의 Payment.vue에 생성된 타입 ex) pay, refund, receipt...>\"\n          :request-info=\"JSON.stringify(paymentData)\" \n          buyer-info-mode=\"<결제 detail 정보 옵션 ex) true, false>\"\n      ></payment-system>\n  </payment-system-app>\n</template>\n\n// script\ndata: () => ({\n  snackbar: {\n    paymentData: null,\n}),\nasync created() {\n  if(!this.paymentData){\n    this.paymentData = {\n      itemId : this.decode(this.value._links.self.href.split(\"/\")[this.value._links.self.href.split(\"/\").length - 1]),\n      price: , // 직접 설정\n      name: \"\", // 직접 설정\n      buyerId: \"\", // 직접 설정\n      buyerEmail: \"\", // 직접 설정\n      buyerTel: \"\", // 직접 설정\n      buyerName: \"\" // 직접 설정\n    }\n  }\n}\n```\n\nPayment system에 대한 설정이 완료되면 Root Frontend UI에 아래와 같이 Payment system에 대한 UI가 생성됩니다. <br>\n![image](https://github.com/user-attachments/assets/5792ce28-b318-4ed8-b65d-d908fb1524ec) <br>\n\n",
                        "id": 19,
                        "pbcPath": "https://github.com/msa-ez/pbc-payment-system/blob/main/model.json"
                    },
                    {
                        "name": "document-management",
                        "rating": 5,
                        "imageUrl": "https://github.com/user-attachments/assets/533ae0ee-e901-49f6-b1fe-ed24cc9e2626",
                        "description": "파일관리를 위한 공통 기능",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "### Instruction\n",
                        "id": 25,
                        "pbcPath": "https://github.com/msa-ez/pbc-document-management/blob/main/model.json"
                    },
                    {
                        "name": "gitlab",
                        "rating": 5,
                        "imageUrl": null,
                        "description": "openapi.yaml",
                        "tags": [
                            "COMMON"
                        ],
                        "instruction": "## instruction\n",
                        "id": 29,
                        "pbcPath": "https://github.com/msa-ez/pbc-gitlab/blob/main/openapi.yaml"
                    },
                    {
                        "name": "PBC-Test",
                        "rating": 5,
                        "imageUrl": "https://github.com/msa-ez/template-spring-boot-3/assets/123912988/a901ad8f-7548-42db-b4a4-67a34bfd9279",
                        "description": "Framework for rapidly and easily developing Java-based web applications.",
                        "tags": [
                            "PBC"
                        ],
                        "instruction": "### Spring Boot is a popular framework in the Java ecosystem for building microservices and web applications. Here are some of the key advantages of Spring Boot:\n\n#### Rapid Development: Spring Boot offers a range of out-of-the-box functionalities and default configurations, which helps in quick application development without much boilerplate code.\n\n#### Standalone: Spring Boot applications are standalone and web servers can be embedded in the application. This means applications can be run from the command line without needing an external server.\n\n#### Production Ready: It comes with built-in features like health checks and metrics, which makes it easy to monitor and manage production applications.\n\n#### Opinionated Defaults: Spring Boot gives you a set of default settings, libraries, and configurations so you can get started without needing to figure out what's the best way to set up a Spring application.\n\n#### Microservices Ready: Spring Boot works seamlessly with Spring Cloud, making it a natural choice for building microservices applications.\n\n#### No Code Generation: Spring Boot does not generate code and there is absolutely zero requirement for XML configuration.\n\n#### Customizable: While it provides a lot of default configurations, settings, and libraries, these can easily be overridden and customized as per the requirements.\n\n#### Spring Ecosystem: It integrates seamlessly with other Spring modules like Spring Data, Spring Security, and Spring Batch.\n\n#### Rich Developer Tools: Spring Boot includes an array of tools to improve the productivity of developers, such as the Spring Boot Initializr for bootstrapping a new project and the Actuator for introspecting and managing your application.\n\n#### Embedded Server Support: It supports embedded servers like Tomcat, Jetty, and Undertow, which reduces the need for external server setup.\n\n#### Wide Range of Plugins: Spring Boot offers a wide range of built-in plugins for developers, facilitating tasks such as creating executable JARs and WARs.\n\n#### Active Community: Spring Boot has a very active community which means that it's continuously updated, and developers can get support from community members, forums, and blogs.\n\n#### Extensive Documentation: Spring Boot provides comprehensive documentation, making it easier for developers to understand, adopt, and troubleshoot.\n",
                        "id": 30,
                        "pbcPath": "https://github.com/msa-ez/pbc-testRepo/blob/main/openapi.yaml"
                    }
                ],
                "currentGeneratedLength": 0,
                "timestamp": "2025-06-09T05:51:18.521Z"
            },
            {
                "type": "aggregateDraftDialogDto",
                "uniqueId": "1749448347346",
                "isShow": true,
                "draftOptions": [
                    {
                        "boundedContext": "BookManagement",
                        "boundedContextAlias": "도서 관리",
                        "description": "{\"userStories\":[{\"title\":\"도서 등록 및 상태 관리\",\"description\":\"도서 관리자로서 새로운 도서를 등록하고, 보유 도서들의 상태(대출가능/대출중/예약중/폐기)를 관리할 수 있다.\",\"acceptance\":[\"도서명, ISBN(13자리), 저자, 출판사, 카테고리 입력이 필수이며, ISBN 중복 검사가 반드시 수행된다.\",\"도서 등록 시 상태는 '대출가능'이 기본값으로 설정된다.\",\"도서 상태는 대출/반납/예약/폐기 처리에 따라 자동으로 변경된다.\",\"폐기된 도서는 더 이상 대출이 불가하다.\"]},{\"title\":\"도서 검색\",\"description\":\"사용자로서 도서명이나 ISBN으로 도서를 검색할 수 있다.\",\"acceptance\":[\"검색어로 도서명 또는 ISBN 입력 시 관련 도서 목록이 출력된다.\"]},{\"title\":\"도서 반납 및 상태 전이\",\"description\":\"도서가 반납되면 해당 도서의 상태가 '대출가능' 또는 '예약중'으로 자동 전환된다.\",\"acceptance\":[\"예약자가 없으면 '대출가능', 예약자가 있으면 '예약중'으로 상태가 자동 변경된다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서 관리자로서 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"대출 이력과 상태 변경 이력이 조회 화면에 표시된다.\",\"이력에는 시점, 변경자, 변경 사유 등이 포함된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"statusHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"changedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN_Validation\",\"description\":\"ISBN은 반드시 13자리의 숫자여야 하며, 시스템 내에서 유일해야 한다.\"},{\"name\":\"BookStatus_AutoTransition\",\"description\":\"도서는 등록 시 '대출가능' 상태로 시작하며, 대출/반납/예약/폐기 상황에 따라 상태가 자동으로 변경된다.\"},{\"name\":\"BookDiscard_Restriction\",\"description\":\"폐기된 도서는 더 이상 대출이 불가하다.\"},{\"name\":\"ReturnStatusTransition\",\"description\":\"도서 반납 시 예약자가 없으면 '대출가능', 예약자가 있으면 '예약중' 상태로 자동 변경된다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"중복확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"상세보기\",\"폐기처리\"],\"filters\":[\"title\",\"ISBN\",\"category\",\"status\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"ISBN\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\",\"폐기처리\"]}}]},\"BookDetail\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"loanedBy\",\"loanDate\",\"returnDate\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"status\",\"changedAt\",\"changedBy\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"displayName\":\"도서가 등록됨\"},{\"name\":\"BookRegistrationFailed\",\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"displayName\":\"도서 등록 실패됨\"},{\"name\":\"BookDiscarded\",\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"displayName\":\"도서가 폐기됨\"},{\"name\":\"BookSearched\",\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"displayName\":\"도서가 검색됨\"},{\"name\":\"BookLoanHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"displayName\":\"도서의 대출 이력이 조회됨\"},{\"name\":\"BookStatusHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"sends to\",\"targetContext\":\"BookLoanProcess\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}",
                        "options": [
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "Book",
                                            "alias": "도서"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "BookCategory",
                                                "alias": "도서 카테고리"
                                            },
                                            {
                                                "name": "BookStatus",
                                                "alias": "도서 상태"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "BookLoanHistoryInfo",
                                                "alias": "도서 대출 이력 정보",
                                                "referencedAggregate": {
                                                    "name": "Loan",
                                                    "alias": "대출"
                                                }
                                            },
                                            {
                                                "name": "BookStatusHistoryInfo",
                                                "alias": "도서 상태 변경 이력 정보"
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "도서의 핵심 정보와 이력 데이터, 상태 전이를 한 Aggregate 내에서 일관성 있게 관리하여 비즈니스 규칙을 강하게 보장한다.",
                                    "coupling": "도서 관련 작업이 한 Aggregate 내에서 해결되므로 외부 참조와 Aggregate 간 결합이 최소화된다.",
                                    "consistency": "ISBN 유일성, 상태 전이 등 도서 중심의 모든 비즈니스 불변성이 단일 트랜잭션에서 강하게 보장된다.",
                                    "encapsulation": "도서의 등록, 폐기, 상태 전이, 이력 관리까지 내부에서 처리되어 외부에 복잡성을 노출하지 않는다.",
                                    "complexity": "이력까지 모두 한 곳에서 관리되어 구현 및 유지보수가 직관적이다.",
                                    "independence": "Book Aggregate만으로 도서 업무의 대부분이 독립적으로 처리된다.",
                                    "performance": "도서와 연관된 이력/상태 조회가 단일 Aggregate 조회로 효율적이다."
                                },
                                "cons": {
                                    "cohesion": "이력 데이터가 계속 누적되면 Aggregate가 비대해져 단일 책임 원칙이 약화될 수 있다.",
                                    "coupling": "이력 데이터의 구조 변경이 Book 전체에 영향을 줄 수 있어 변화에 취약해진다.",
                                    "consistency": "대량 이력 데이터로 인한 트랜잭션 부하 및 충돌 가능성이 증가한다.",
                                    "encapsulation": "외부 시스템에서 이력 정보만 분리 활용 시 도서 전체 구조를 알아야 한다.",
                                    "complexity": "이력 데이터, 상태 등 다양한 관심사가 한 객체에 집중되어 복잡도가 누적된다.",
                                    "independence": "이력 처리, 조회만 확장하려면 Book 전체 구조를 함께 고려해야 한다.",
                                    "performance": "이력 데이터 증가 시 단일 Aggregate 조회/저장 성능 저하 우려가 있다."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "BookManagement",
                                    "alias": "도서 관리",
                                    "displayName": "도서 관리",
                                    "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n도서는 도서명이나 ISBN으로 검색할 수 있어야 해.\n\n## userStory\n\n도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 대출 프로세스 (BookLoanProcess)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ]
                                },
                                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 상태 관리\",\"description\":\"도서 관리자로서 새로운 도서를 등록하고, 보유 도서들의 상태(대출가능/대출중/예약중/폐기)를 관리할 수 있다.\",\"acceptance\":[\"도서명, ISBN(13자리), 저자, 출판사, 카테고리 입력이 필수이며, ISBN 중복 검사가 반드시 수행된다.\",\"도서 등록 시 상태는 '대출가능'이 기본값으로 설정된다.\",\"도서 상태는 대출/반납/예약/폐기 처리에 따라 자동으로 변경된다.\",\"폐기된 도서는 더 이상 대출이 불가하다.\"]},{\"title\":\"도서 검색\",\"description\":\"사용자로서 도서명이나 ISBN으로 도서를 검색할 수 있다.\",\"acceptance\":[\"검색어로 도서명 또는 ISBN 입력 시 관련 도서 목록이 출력된다.\"]},{\"title\":\"도서 반납 및 상태 전이\",\"description\":\"도서가 반납되면 해당 도서의 상태가 '대출가능' 또는 '예약중'으로 자동 전환된다.\",\"acceptance\":[\"예약자가 없으면 '대출가능', 예약자가 있으면 '예약중'으로 상태가 자동 변경된다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서 관리자로서 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"대출 이력과 상태 변경 이력이 조회 화면에 표시된다.\",\"이력에는 시점, 변경자, 변경 사유 등이 포함된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"statusHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"changedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN_Validation\",\"description\":\"ISBN은 반드시 13자리의 숫자여야 하며, 시스템 내에서 유일해야 한다.\"},{\"name\":\"BookStatus_AutoTransition\",\"description\":\"도서는 등록 시 '대출가능' 상태로 시작하며, 대출/반납/예약/폐기 상황에 따라 상태가 자동으로 변경된다.\"},{\"name\":\"BookDiscard_Restriction\",\"description\":\"폐기된 도서는 더 이상 대출이 불가하다.\"},{\"name\":\"ReturnStatusTransition\",\"description\":\"도서 반납 시 예약자가 없으면 '대출가능', 예약자가 있으면 '예약중' 상태로 자동 변경된다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"중복확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"상세보기\",\"폐기처리\"],\"filters\":[\"title\",\"ISBN\",\"category\",\"status\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"ISBN\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\",\"폐기처리\"]}}]},\"BookDetail\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"loanedBy\",\"loanDate\",\"returnDate\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"status\",\"changedAt\",\"changedBy\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"displayName\":\"도서가 등록됨\"},{\"name\":\"BookRegistrationFailed\",\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"displayName\":\"도서 등록 실패됨\"},{\"name\":\"BookDiscarded\",\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"displayName\":\"도서가 폐기됨\"},{\"name\":\"BookSearched\",\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"displayName\":\"도서가 검색됨\"},{\"name\":\"BookLoanHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"displayName\":\"도서의 대출 이력이 조회됨\"},{\"name\":\"BookStatusHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"sends to\",\"targetContext\":\"BookLoanProcess\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
                            },
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "Book",
                                            "alias": "도서"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "BookCategory",
                                                "alias": "도서 카테고리"
                                            },
                                            {
                                                "name": "BookStatus",
                                                "alias": "도서 상태"
                                            }
                                        ],
                                        "valueObjects": []
                                    },
                                    {
                                        "aggregate": {
                                            "name": "BookLoanHistory",
                                            "alias": "도서 대출 이력"
                                        },
                                        "enumerations": [],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
                                                "referencedAggregate": {
                                                    "name": "Book",
                                                    "alias": "도서"
                                                }
                                            },
                                            {
                                                "name": "LoanReference",
                                                "alias": "대출 참조",
                                                "referencedAggregate": {
                                                    "name": "Loan",
                                                    "alias": "대출"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "BookStatusHistory",
                                            "alias": "도서 상태 변경 이력"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "BookStatus",
                                                "alias": "도서 상태"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
                                                "referencedAggregate": {
                                                    "name": "Book",
                                                    "alias": "도서"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "도서, 대출 이력, 상태 이력을 각 도메인별로 Aggregate로 분리하여 각 업무가 명확하게 관리된다.",
                                    "coupling": "이력/상태 이력의 변경이 Book Aggregate에 직접 영향을 미치지 않으므로 결합도가 낮다.",
                                    "consistency": "각 Aggregate의 트랜잭션 범위가 작아져 대용량 이력 처리 및 확장에 유리하다.",
                                    "encapsulation": "이력 또는 상태 변경 내역만 별도로 관리하거나 확장할 때 도서 로직과 분리해 작업할 수 있다.",
                                    "complexity": "각 Aggregate의 책임과 구현 범위가 명확해 개발/운영 난이도가 낮다.",
                                    "independence": "이력 관리 시스템 혹은 통계 처리 등 별도 서비스로의 확장성이 높다.",
                                    "performance": "도서 이력, 상태 이력 쿼리가 분리돼 대량 데이터에도 효율적이다."
                                },
                                "cons": {
                                    "cohesion": "도서 상태 전이/등록/폐기와 이력 반영이 Aggregate 간에 분산되어 흐름 파악이 어렵다.",
                                    "coupling": "이력 추가 시 도서 참조 등 연계 작업이 필요하여 간접적인 결합이 존재한다.",
                                    "consistency": "상태 변경/이력 기록의 원자성을 보장하려면 추가적인 트랜잭션 관리가 필요하다.",
                                    "encapsulation": "상태 전이와 이력 동기화 로직이 외부(Application Service)로 분리될 수 있다.",
                                    "complexity": "여러 Aggregate를 함께 다루는 오케스트레이션 및 이벤트 관리가 필요하다.",
                                    "independence": "상태 전이와 이력의 동기화를 위해 각 Aggregate 간 인터페이스 계약이 명확해야 한다.",
                                    "performance": "도서 상세정보와 이력정보 동시 조회 시 여러 Aggregate 접근으로 복수 쿼리가 필요하다."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "BookManagement",
                                    "alias": "도서 관리",
                                    "displayName": "도서 관리",
                                    "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n도서는 도서명이나 ISBN으로 검색할 수 있어야 해.\n\n## userStory\n\n도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 대출 프로세스 (BookLoanProcess)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ]
                                },
                                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 상태 관리\",\"description\":\"도서 관리자로서 새로운 도서를 등록하고, 보유 도서들의 상태(대출가능/대출중/예약중/폐기)를 관리할 수 있다.\",\"acceptance\":[\"도서명, ISBN(13자리), 저자, 출판사, 카테고리 입력이 필수이며, ISBN 중복 검사가 반드시 수행된다.\",\"도서 등록 시 상태는 '대출가능'이 기본값으로 설정된다.\",\"도서 상태는 대출/반납/예약/폐기 처리에 따라 자동으로 변경된다.\",\"폐기된 도서는 더 이상 대출이 불가하다.\"]},{\"title\":\"도서 검색\",\"description\":\"사용자로서 도서명이나 ISBN으로 도서를 검색할 수 있다.\",\"acceptance\":[\"검색어로 도서명 또는 ISBN 입력 시 관련 도서 목록이 출력된다.\"]},{\"title\":\"도서 반납 및 상태 전이\",\"description\":\"도서가 반납되면 해당 도서의 상태가 '대출가능' 또는 '예약중'으로 자동 전환된다.\",\"acceptance\":[\"예약자가 없으면 '대출가능', 예약자가 있으면 '예약중'으로 상태가 자동 변경된다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서 관리자로서 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"대출 이력과 상태 변경 이력이 조회 화면에 표시된다.\",\"이력에는 시점, 변경자, 변경 사유 등이 포함된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"statusHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"changedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN_Validation\",\"description\":\"ISBN은 반드시 13자리의 숫자여야 하며, 시스템 내에서 유일해야 한다.\"},{\"name\":\"BookStatus_AutoTransition\",\"description\":\"도서는 등록 시 '대출가능' 상태로 시작하며, 대출/반납/예약/폐기 상황에 따라 상태가 자동으로 변경된다.\"},{\"name\":\"BookDiscard_Restriction\",\"description\":\"폐기된 도서는 더 이상 대출이 불가하다.\"},{\"name\":\"ReturnStatusTransition\",\"description\":\"도서 반납 시 예약자가 없으면 '대출가능', 예약자가 있으면 '예약중' 상태로 자동 변경된다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"중복확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"상세보기\",\"폐기처리\"],\"filters\":[\"title\",\"ISBN\",\"category\",\"status\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"ISBN\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\",\"폐기처리\"]}}]},\"BookDetail\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"loanedBy\",\"loanDate\",\"returnDate\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"status\",\"changedAt\",\"changedBy\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"displayName\":\"도서가 등록됨\"},{\"name\":\"BookRegistrationFailed\",\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"displayName\":\"도서 등록 실패됨\"},{\"name\":\"BookDiscarded\",\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"displayName\":\"도서가 폐기됨\"},{\"name\":\"BookSearched\",\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"displayName\":\"도서가 검색됨\"},{\"name\":\"BookLoanHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"displayName\":\"도서의 대출 이력이 조회됨\"},{\"name\":\"BookStatusHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"sends to\",\"targetContext\":\"BookLoanProcess\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
                            }
                        ],
                        "conclusions": "Option 1은 단일 Aggregate에서 도서 및 이력, 상태 관리까지 원자적 트랜잭션과 간단한 구조가 요구될 때 적합합니다. 이 구조는 도서별 데이터가 크지 않고 일관성 유지가 최우선일 때 유리합니다. Option 2는 도서, 대출 이력, 상태 변경 이력을 분리 Aggregate로 관리하여 확장성과 대용량 데이터 처리에 탁월하며, 이력/상태 관리의 독립적인 발전 및 외부 서비스 연계가 필요한 환경에서 추천됩니다. Option 2를 기본으로 선정한 이유는 도서 정보와 이력, 상태 관리 업무의 확장성 및 독립적 유지보수에 강점을 가지기 때문입니다.",
                        "defaultOptionIndex": 1,
                        "analysisResult": {
                            "userStories": [
                                {
                                    "title": "도서 등록 및 상태 관리",
                                    "description": "도서 관리자로서 새로운 도서를 등록하고, 보유 도서들의 상태(대출가능/대출중/예약중/폐기)를 관리할 수 있다.",
                                    "acceptance": [
                                        "도서명, ISBN(13자리), 저자, 출판사, 카테고리 입력이 필수이며, ISBN 중복 검사가 반드시 수행된다.",
                                        "도서 등록 시 상태는 '대출가능'이 기본값으로 설정된다.",
                                        "도서 상태는 대출/반납/예약/폐기 처리에 따라 자동으로 변경된다.",
                                        "폐기된 도서는 더 이상 대출이 불가하다."
                                    ]
                                },
                                {
                                    "title": "도서 검색",
                                    "description": "사용자로서 도서명이나 ISBN으로 도서를 검색할 수 있다.",
                                    "acceptance": [
                                        "검색어로 도서명 또는 ISBN 입력 시 관련 도서 목록이 출력된다."
                                    ]
                                },
                                {
                                    "title": "도서 반납 및 상태 전이",
                                    "description": "도서가 반납되면 해당 도서의 상태가 '대출가능' 또는 '예약중'으로 자동 전환된다.",
                                    "acceptance": [
                                        "예약자가 없으면 '대출가능', 예약자가 있으면 '예약중'으로 상태가 자동 변경된다."
                                    ]
                                },
                                {
                                    "title": "도서별 이력 조회",
                                    "description": "도서 관리자로서 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있다.",
                                    "acceptance": [
                                        "대출 이력과 상태 변경 이력이 조회 화면에 표시된다.",
                                        "이력에는 시점, 변경자, 변경 사유 등이 포함된다."
                                    ]
                                }
                            ],
                            "entities": {
                                "Book": {
                                    "properties": [
                                        {
                                            "name": "bookId",
                                            "type": "Long",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "title",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "ISBN",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "author",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "publisher",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "category",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "소설",
                                                "비소설",
                                                "학술",
                                                "잡지"
                                            ]
                                        },
                                        {
                                            "name": "status",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "대출가능",
                                                "대출중",
                                                "예약중",
                                                "폐기"
                                            ]
                                        }
                                    ]
                                },
                                "BookLoanHistory": {
                                    "properties": [
                                        {
                                            "name": "historyId",
                                            "type": "Long",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "bookId",
                                            "type": "Long",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Book"
                                        },
                                        {
                                            "name": "loanedBy",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "loanDate",
                                            "type": "Date",
                                            "required": true
                                        },
                                        {
                                            "name": "returnDate",
                                            "type": "Date"
                                        }
                                    ]
                                },
                                "BookStatusHistory": {
                                    "properties": [
                                        {
                                            "name": "statusHistoryId",
                                            "type": "Long",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "bookId",
                                            "type": "Long",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Book"
                                        },
                                        {
                                            "name": "status",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "대출가능",
                                                "대출중",
                                                "예약중",
                                                "폐기"
                                            ]
                                        },
                                        {
                                            "name": "changedAt",
                                            "type": "Date",
                                            "required": true
                                        },
                                        {
                                            "name": "changedBy",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "reason",
                                            "type": "String"
                                        }
                                    ]
                                }
                            },
                            "businessRules": [
                                {
                                    "name": "ISBN_Validation",
                                    "description": "ISBN은 반드시 13자리의 숫자여야 하며, 시스템 내에서 유일해야 한다."
                                },
                                {
                                    "name": "BookStatus_AutoTransition",
                                    "description": "도서는 등록 시 '대출가능' 상태로 시작하며, 대출/반납/예약/폐기 상황에 따라 상태가 자동으로 변경된다."
                                },
                                {
                                    "name": "BookDiscard_Restriction",
                                    "description": "폐기된 도서는 더 이상 대출이 불가하다."
                                },
                                {
                                    "name": "ReturnStatusTransition",
                                    "description": "도서 반납 시 예약자가 없으면 '대출가능', 예약자가 있으면 '예약중' 상태로 자동 변경된다."
                                }
                            ],
                            "interfaces": {
                                "BookManagement": {
                                    "sections": [
                                        {
                                            "name": "도서 등록",
                                            "type": "form",
                                            "fields": [
                                                {
                                                    "name": "title",
                                                    "type": "text",
                                                    "required": true
                                                },
                                                {
                                                    "name": "ISBN",
                                                    "type": "text",
                                                    "required": true
                                                },
                                                {
                                                    "name": "author",
                                                    "type": "text",
                                                    "required": true
                                                },
                                                {
                                                    "name": "publisher",
                                                    "type": "text",
                                                    "required": true
                                                },
                                                {
                                                    "name": "category",
                                                    "type": "select",
                                                    "required": true
                                                }
                                            ],
                                            "actions": [
                                                "등록",
                                                "중복확인"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "도서 목록",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [
                                                "상세보기",
                                                "폐기처리"
                                            ],
                                            "filters": [
                                                "title",
                                                "ISBN",
                                                "category",
                                                "status"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "bookId",
                                                    "title",
                                                    "ISBN",
                                                    "author",
                                                    "publisher",
                                                    "category",
                                                    "status"
                                                ],
                                                "actions": [
                                                    "상세보기",
                                                    "폐기처리"
                                                ]
                                            }
                                        }
                                    ]
                                },
                                "BookDetail": {
                                    "sections": [
                                        {
                                            "name": "대출 이력",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [
                                                    "loanedBy",
                                                    "loanDate",
                                                    "returnDate"
                                                ],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "상태 변경 이력",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [
                                                    "status",
                                                    "changedAt",
                                                    "changedBy",
                                                    "reason"
                                                ],
                                                "actions": []
                                            }
                                        }
                                    ]
                                }
                            },
                            "events": [
                                {
                                    "name": "BookRegistered",
                                    "description": "도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.",
                                    "displayName": "도서가 등록됨"
                                },
                                {
                                    "name": "BookRegistrationFailed",
                                    "description": "도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.",
                                    "displayName": "도서 등록 실패됨"
                                },
                                {
                                    "name": "BookDiscarded",
                                    "description": "도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.",
                                    "displayName": "도서가 폐기됨"
                                },
                                {
                                    "name": "BookSearched",
                                    "description": "회원이 도서명이나 ISBN으로 도서를 검색함.",
                                    "displayName": "도서가 검색됨"
                                },
                                {
                                    "name": "BookLoanHistoryViewed",
                                    "description": "도서 관리자가 특정 도서의 대출 이력을 조회함.",
                                    "displayName": "도서의 대출 이력이 조회됨"
                                },
                                {
                                    "name": "BookStatusHistoryViewed",
                                    "description": "도서 관리자가 특정 도서의 상태 변경 이력을 조회함.",
                                    "displayName": "도서의 상태 변경 이력이 조회됨"
                                }
                            ],
                            "contextRelations": [
                                {
                                    "name": "BookManagementToBookLoanProcess",
                                    "type": "Pub/Sub",
                                    "direction": "sends to",
                                    "targetContext": "BookLoanProcess",
                                    "reason": "도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.",
                                    "interactionPattern": "도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리."
                                }
                            ],
                            "inference": "요구사항 분석 결과, 도서 관리 시스템은 도서 등록, 상태 관리, 검색, 대출/반납/폐기, 이력 조회 등 복수의 업무 흐름을 갖는다. ISBN의 13자리 제약과 중복 방지, 카테고리 Enum 정의, 도서 상태 자동 변이, 폐기 도서의 대출 불가, 상세 이력 관리 등이 주요 비즈니스 규칙이다. 이벤트 및 컨텍스트 연계는 느슨한 결합 및 데이터 소유권 분리를 명확히 한다."
                        },
                        "inference": "\n\n요구사항, 비즈니스 규칙, 기존 컨텍스트와의 연계, 그리고 누적 설계를 검토한 결과, Book(도서) Aggregate는 반드시 생성되어야 하며, Option 1에서는 Book 단일 Aggregate로 일체화된 이력 정보를 포함하고, Option 2는 Book과 BookLoanHistory, BookStatusHistory를 별도 Aggregate로 분리하여 다양한 관리 및 확장 시나리오를 각각 반영하였다. 이미 BookLoanProcess 컨텍스트에 존재하는 Loan, Reservation, Member는 직접 생성하지 않고 참조 ValueObject로만 처리함을 준수하였다."
                    },
                    {
                        "boundedContext": "BookLoanProcess",
                        "boundedContextAlias": "도서 대출 프로세스",
                        "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 회원 확인 후 도서를 대출하거나 반납할 수 있다. 대출 시 도서명 또는 ISBN으로 검색, 대출 기간 선택, 이미 대출 중인 경우 예약 신청이 가능하다. 반납 시 도서 상태 및 예약자 유무에 따라 자동 상태 변경이 이루어진다.\",\"acceptance\":[\"회원번호와 이름으로 회원이 확인되어야 한다.\",\"도서명 또는 ISBN으로 도서를 검색할 수 있어야 한다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"이미 대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 자동으로 '대출중'으로 변경된다.\",\"반납 완료 시 예약자 유무에 따라 도서 상태가 '예약중' 또는 '대출가능'으로 변경된다.\"]},{\"title\":\"대출 현황 및 처리\",\"description\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"acceptance\":[\"대출 건별로 대출일, 반납예정일, 현재 상태를 확인할 수 있다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"연체 상태에서는 연장이 불가하다.\"]},{\"title\":\"도서별 이력 및 상태 변경 추적\",\"description\":\"관리자는 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있다.\",\"acceptance\":[\"도서별로 모든 대출 이력과 상태 변경 이력을 볼 수 있다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"beforeStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"afterStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 기간 선택 제한\",\"description\":\"대출 기간은 7일, 14일, 30일만 선택할 수 있다.\"},{\"name\":\"연체 도서 연장 불가\",\"description\":\"연체 상태(OVERDUE)인 대출 건은 연장이 불가하다.\"},{\"name\":\"대출 상태 자동 변경\",\"description\":\"도서 대출 시 상태는 'ON_LOAN', 반납 시 예약자 없으면 'AVAILABLE', 예약자 있으면 'RESERVED'로 자동 변경된다.\"},{\"name\":\"폐기/대출 불가 도서 대출 거부\",\"description\":\"도서 상태가 'DISCARDED' 또는 대출 불가 시 대출이 거부된다.\"}],\"interfaces\":{\"LoanAndReturn\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[\"회원 확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchType\",\"type\":\"select\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\",\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 반납\",\"type\":\"form\",\"fields\":[{\"name\":\"loanId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"반납 처리\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatus\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\"],\"filters\":[\"대출 상태\",\"대출일\",\"반납예정일\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"title\",\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서별 이력 조회\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"대출 이력 조회\",\"상태 변경 이력 조회\"],\"filters\":[],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"status\"],\"actions\":[]}},{\"name\":\"도서 상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"historyId\",\"beforeStatus\",\"afterStatus\",\"changedAt\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"MemberVerified\",\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"displayName\":\"회원이 확인됨\"},{\"name\":\"BookLoanRequested\",\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"displayName\":\"도서 대출이 신청됨\"},{\"name\":\"BookLoanRejected\",\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"displayName\":\"도서 대출이 거부됨\"},{\"name\":\"BookLoanApproved\",\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"displayName\":\"도서 대출이 승인됨\"},{\"name\":\"BookReserved\",\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 예약됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookAvailable\",\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\"},{\"name\":\"BookReservedForNext\",\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"displayName\":\"대출 기간이 연장됨\"},{\"name\":\"LoanOverdue\",\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"displayName\":\"도서 대출이 연체됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"receives from\",\"targetContext\":\"도서 관리 (BookManagement)\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}",
                        "options": [
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "LoanStatus",
                                                "alias": "대출 상태"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
                                                "referencedAggregate": {
                                                    "name": "Book",
                                                    "alias": "도서"
                                                }
                                            },
                                            {
                                                "name": "MemberReference",
                                                "alias": "회원 참조",
                                                "referencedAggregate": {
                                                    "name": "Member",
                                                    "alias": "회원"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        "enumerations": [],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
                                                "referencedAggregate": {
                                                    "name": "Book",
                                                    "alias": "도서"
                                                }
                                            },
                                            {
                                                "name": "MemberReference",
                                                "alias": "회원 참조",
                                                "referencedAggregate": {
                                                    "name": "Member",
                                                    "alias": "회원"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "Member",
                                            "alias": "회원"
                                        },
                                        "enumerations": [],
                                        "valueObjects": []
                                    }
                                ],
                                "pros": {
                                    "cohesion": "각 집계는 대출, 예약, 회원 관련 책임에만 집중하여 단일 책임 원칙이 잘 지켜진다.",
                                    "coupling": "집계 간 참조는 ValueObject를 통한 일방향 참조만 사용하여 결합도가 낮고, Book, Member 등 외부 컨텍스트와의 경계가 명확하다.",
                                    "consistency": "Loan과 Reservation의 상태 변경, 이벤트 발행, 연체/연장 등 핵심 규칙이 각 집계 내부에서 원자적으로 보장된다.",
                                    "encapsulation": "도메인 규칙(대출 연장 제한, 자동 상태 변경 등)이 집계 내부에 감춰져 외부에 노출되지 않는다.",
                                    "complexity": "각 집계가 단순 명료하여 구현 및 유지보수가 용이하다.",
                                    "independence": "Loan, Reservation, Member는 독립적으로 확장 및 개선 가능하다.",
                                    "performance": "집계별 쿼리가 간결해지고 대출·예약 처리 시 병목이 적다."
                                },
                                "cons": {
                                    "cohesion": "대출-예약-회원 간 복잡한 시나리오(예: 반납 후 예약 자동 전환)에서는 집계 간 오케스트레이션 로직이 서비스 계층에 추가된다.",
                                    "coupling": "도서 상태 및 이력 참조가 많아질수록 ValueObject를 통한 외부 참조가 늘어 관리 포인트가 증가한다.",
                                    "consistency": "여러 집계에 걸친 원자적 작업(예: 반납→예약 자동 승인)에서 일관성 유지가 어려워 이벤트 기반 보상 로직이 필요하다.",
                                    "encapsulation": "업무 프로세스가 집계 밖 서비스 레이어에 분산될 수 있다.",
                                    "complexity": "복잡한 프로세스의 경우 여러 집계 조합으로 인한 서비스 복잡도가 증가할 수 있다.",
                                    "independence": "도서 폐기 등 외부 Pub/Sub 이벤트 반영 시 모든 관련 집계가 적절히 대응해야 한다.",
                                    "performance": "현황 및 이력 조회시 집계별 데이터 조합이 필요해 복합 쿼리 성능 저하가 있을 수 있다."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "BookLoanProcess",
                                    "alias": "도서 대출 프로세스",
                                    "displayName": "도서 대출 프로세스",
                                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}\n\n## Event\n\n{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}\n\n## Event\n\n{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}\n\n## Event\n\n{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        {
                                            "name": "Member",
                                            "alias": "회원"
                                        }
                                    ]
                                },
                                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 회원 확인 후 도서를 대출하거나 반납할 수 있다. 대출 시 도서명 또는 ISBN으로 검색, 대출 기간 선택, 이미 대출 중인 경우 예약 신청이 가능하다. 반납 시 도서 상태 및 예약자 유무에 따라 자동 상태 변경이 이루어진다.\",\"acceptance\":[\"회원번호와 이름으로 회원이 확인되어야 한다.\",\"도서명 또는 ISBN으로 도서를 검색할 수 있어야 한다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"이미 대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 자동으로 '대출중'으로 변경된다.\",\"반납 완료 시 예약자 유무에 따라 도서 상태가 '예약중' 또는 '대출가능'으로 변경된다.\"]},{\"title\":\"대출 현황 및 처리\",\"description\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"acceptance\":[\"대출 건별로 대출일, 반납예정일, 현재 상태를 확인할 수 있다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"연체 상태에서는 연장이 불가하다.\"]},{\"title\":\"도서별 이력 및 상태 변경 추적\",\"description\":\"관리자는 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있다.\",\"acceptance\":[\"도서별로 모든 대출 이력과 상태 변경 이력을 볼 수 있다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"beforeStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"afterStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 기간 선택 제한\",\"description\":\"대출 기간은 7일, 14일, 30일만 선택할 수 있다.\"},{\"name\":\"연체 도서 연장 불가\",\"description\":\"연체 상태(OVERDUE)인 대출 건은 연장이 불가하다.\"},{\"name\":\"대출 상태 자동 변경\",\"description\":\"도서 대출 시 상태는 'ON_LOAN', 반납 시 예약자 없으면 'AVAILABLE', 예약자 있으면 'RESERVED'로 자동 변경된다.\"},{\"name\":\"폐기/대출 불가 도서 대출 거부\",\"description\":\"도서 상태가 'DISCARDED' 또는 대출 불가 시 대출이 거부된다.\"}],\"interfaces\":{\"LoanAndReturn\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[\"회원 확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchType\",\"type\":\"select\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\",\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 반납\",\"type\":\"form\",\"fields\":[{\"name\":\"loanId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"반납 처리\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatus\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\"],\"filters\":[\"대출 상태\",\"대출일\",\"반납예정일\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"title\",\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서별 이력 조회\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"대출 이력 조회\",\"상태 변경 이력 조회\"],\"filters\":[],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"status\"],\"actions\":[]}},{\"name\":\"도서 상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"historyId\",\"beforeStatus\",\"afterStatus\",\"changedAt\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"MemberVerified\",\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"displayName\":\"회원이 확인됨\"},{\"name\":\"BookLoanRequested\",\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"displayName\":\"도서 대출이 신청됨\"},{\"name\":\"BookLoanRejected\",\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"displayName\":\"도서 대출이 거부됨\"},{\"name\":\"BookLoanApproved\",\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"displayName\":\"도서 대출이 승인됨\"},{\"name\":\"BookReserved\",\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 예약됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookAvailable\",\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\"},{\"name\":\"BookReservedForNext\",\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"displayName\":\"대출 기간이 연장됨\"},{\"name\":\"LoanOverdue\",\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"displayName\":\"도서 대출이 연체됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"receives from\",\"targetContext\":\"도서 관리 (BookManagement)\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
                            },
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "LoanStatus",
                                                "alias": "대출 상태"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
                                                "referencedAggregate": {
                                                    "name": "Book",
                                                    "alias": "도서"
                                                }
                                            },
                                            {
                                                "name": "MemberReference",
                                                "alias": "회원 참조",
                                                "referencedAggregate": {
                                                    "name": "Member",
                                                    "alias": "회원"
                                                }
                                            },
                                            {
                                                "name": "ReservationReference",
                                                "alias": "예약 참조",
                                                "referencedAggregate": {
                                                    "name": "Reservation",
                                                    "alias": "예약"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        "enumerations": [],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
                                                "referencedAggregate": {
                                                    "name": "Book",
                                                    "alias": "도서"
                                                }
                                            },
                                            {
                                                "name": "MemberReference",
                                                "alias": "회원 참조",
                                                "referencedAggregate": {
                                                    "name": "Member",
                                                    "alias": "회원"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "Member",
                                            "alias": "회원"
                                        },
                                        "enumerations": [],
                                        "valueObjects": []
                                    },
                                    {
                                        "aggregate": {
                                            "name": "LoanHistory",
                                            "alias": "대출 이력"
                                        },
                                        "enumerations": [],
                                        "valueObjects": [
                                            {
                                                "name": "LoanReference",
                                                "alias": "대출 참조",
                                                "referencedAggregate": {
                                                    "name": "Loan",
                                                    "alias": "대출"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "LoanHistory 집계를 별도로 분리하여, 이력 저장과 검색에 최적화된 설계를 제공한다.",
                                    "coupling": "Loan과 Reservation은 분리되고, 각 역할에 집중하여 코드 결합도가 낮다.",
                                    "consistency": "대출-예약-이력 각각의 상태 및 변경이 독립적으로 보장된다.",
                                    "encapsulation": "이력 관련 규칙이 LoanHistory 내부에 집중되어 이력 처리의 복잡성을 분산한다.",
                                    "complexity": "이력 저장·조회 업무가 Loan, Reservation과 분리되어 개발 및 테스트가 쉽다.",
                                    "independence": "이력 확장, 별도 보관, 조회 성능 개선 등 다양한 변화에 유연하게 대응 가능하다.",
                                    "performance": "대출/예약 처리 트랜잭션과 이력 기록을 분리함으로써 주업무 흐름의 성능 저하를 방지한다."
                                },
                                "cons": {
                                    "cohesion": "집계가 늘어나 관리 포인트가 증가하고, 단순 케이스에서 구조가 복잡하게 느껴질 수 있다.",
                                    "coupling": "Loan↔LoanHistory 간 참조가 추가되어 이벤트 동기화나 데이터 일관성 관리 비용이 있다.",
                                    "consistency": "Loan과 LoanHistory 간 데이터 불일치(예: 기록 누락 등) 발생 가능성이 존재한다.",
                                    "encapsulation": "이력 갱신을 위해 Loan 이벤트와 LoanHistory 연동이 필요해 구현 난이도가 상승한다.",
                                    "complexity": "서비스 계층에서 여러 집계 조합 및 연계 로직(예: 대출/이력 동시 기록) 구현 필요.",
                                    "independence": "LoanHistory가 Loan 변화에 민감하게 연동되므로 완전한 독립성은 제한된다.",
                                    "performance": "복합 조회(현황+이력 등) 시 여러 집계 조인 및 추가 I/O가 발생할 수 있다."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "BookLoanProcess",
                                    "alias": "도서 대출 프로세스",
                                    "displayName": "도서 대출 프로세스",
                                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}\n\n## Event\n\n{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}\n\n## Event\n\n{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}\n\n## Event\n\n{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        {
                                            "name": "Member",
                                            "alias": "회원"
                                        }
                                    ]
                                },
                                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 회원 확인 후 도서를 대출하거나 반납할 수 있다. 대출 시 도서명 또는 ISBN으로 검색, 대출 기간 선택, 이미 대출 중인 경우 예약 신청이 가능하다. 반납 시 도서 상태 및 예약자 유무에 따라 자동 상태 변경이 이루어진다.\",\"acceptance\":[\"회원번호와 이름으로 회원이 확인되어야 한다.\",\"도서명 또는 ISBN으로 도서를 검색할 수 있어야 한다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"이미 대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 자동으로 '대출중'으로 변경된다.\",\"반납 완료 시 예약자 유무에 따라 도서 상태가 '예약중' 또는 '대출가능'으로 변경된다.\"]},{\"title\":\"대출 현황 및 처리\",\"description\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"acceptance\":[\"대출 건별로 대출일, 반납예정일, 현재 상태를 확인할 수 있다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"연체 상태에서는 연장이 불가하다.\"]},{\"title\":\"도서별 이력 및 상태 변경 추적\",\"description\":\"관리자는 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있다.\",\"acceptance\":[\"도서별로 모든 대출 이력과 상태 변경 이력을 볼 수 있다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"beforeStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"afterStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 기간 선택 제한\",\"description\":\"대출 기간은 7일, 14일, 30일만 선택할 수 있다.\"},{\"name\":\"연체 도서 연장 불가\",\"description\":\"연체 상태(OVERDUE)인 대출 건은 연장이 불가하다.\"},{\"name\":\"대출 상태 자동 변경\",\"description\":\"도서 대출 시 상태는 'ON_LOAN', 반납 시 예약자 없으면 'AVAILABLE', 예약자 있으면 'RESERVED'로 자동 변경된다.\"},{\"name\":\"폐기/대출 불가 도서 대출 거부\",\"description\":\"도서 상태가 'DISCARDED' 또는 대출 불가 시 대출이 거부된다.\"}],\"interfaces\":{\"LoanAndReturn\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[\"회원 확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchType\",\"type\":\"select\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\",\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 반납\",\"type\":\"form\",\"fields\":[{\"name\":\"loanId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"반납 처리\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatus\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\"],\"filters\":[\"대출 상태\",\"대출일\",\"반납예정일\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"title\",\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서별 이력 조회\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"대출 이력 조회\",\"상태 변경 이력 조회\"],\"filters\":[],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"status\"],\"actions\":[]}},{\"name\":\"도서 상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"historyId\",\"beforeStatus\",\"afterStatus\",\"changedAt\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"MemberVerified\",\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"displayName\":\"회원이 확인됨\"},{\"name\":\"BookLoanRequested\",\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"displayName\":\"도서 대출이 신청됨\"},{\"name\":\"BookLoanRejected\",\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"displayName\":\"도서 대출이 거부됨\"},{\"name\":\"BookLoanApproved\",\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"displayName\":\"도서 대출이 승인됨\"},{\"name\":\"BookReserved\",\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 예약됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookAvailable\",\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\"},{\"name\":\"BookReservedForNext\",\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"displayName\":\"대출 기간이 연장됨\"},{\"name\":\"LoanOverdue\",\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"displayName\":\"도서 대출이 연체됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"receives from\",\"targetContext\":\"도서 관리 (BookManagement)\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
                            },
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "LoanStatus",
                                                "alias": "대출 상태"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
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
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        "enumerations": [],
                                        "valueObjects": [
                                            {
                                                "name": "BookReference",
                                                "alias": "도서 참조",
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
                                    }
                                ],
                                "pros": {
                                    "cohesion": "핵심 대출·예약 업무에만 집중하여 집계 경계가 단순하다.",
                                    "coupling": "Book, Member 등 외부 엔티티와의 참조만 유지하며 내부 결합도가 낮다.",
                                    "consistency": "대출·예약 관련 상태 변경이 집계 내에서 일관성 있게 처리된다.",
                                    "encapsulation": "도서 상태 자동 변경, 연체 연장 불가 등 핵심 규칙이 Loan 집계에 명확히 캡슐화된다.",
                                    "complexity": "집계 수가 적어 전체 시스템 구조가 단순하며 이해와 유지보수가 쉽다.",
                                    "independence": "Loan, Reservation은 별도로 발전 가능하며, 서비스 규모가 작을 때 최적화된 형태다.",
                                    "performance": "불필요한 조인과 복잡한 트랜잭션이 최소화되어 빠른 응답이 가능하다."
                                },
                                "cons": {
                                    "cohesion": "이력 관리, 상세 현황 등 부가 업무가 서비스 계층에 집중되어 코드 분산이 발생한다.",
                                    "coupling": "이력·상태 추적이 외부 집계(BookLoanHistory, BookStatusHistory)에 의존해야 한다.",
                                    "consistency": "복합 시나리오(대출→이력 동시 기록 등)에서 강한 일관성 보장이 어렵다.",
                                    "encapsulation": "이력 및 상태 변경 규칙이 Loan 외부에 위치해 도메인 규칙이 분산될 수 있다.",
                                    "complexity": "확장 시 부가 업무(이력, 상태변경 등) 도입을 위해 구조 변경 필요성이 생긴다.",
                                    "independence": "외부 이력 집계와의 연동이 반드시 필요해 완전 독립 운영은 어렵다.",
                                    "performance": "대출 및 예약 현황, 이력 동시 조회 시 성능 저하가 발생할 수 있다."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "BookLoanProcess",
                                    "alias": "도서 대출 프로세스",
                                    "displayName": "도서 대출 프로세스",
                                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}\n\n## Event\n\n{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}\n\n## Event\n\n{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}\n\n## Event\n\n{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        {
                                            "name": "Member",
                                            "alias": "회원"
                                        }
                                    ]
                                },
                                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 회원 확인 후 도서를 대출하거나 반납할 수 있다. 대출 시 도서명 또는 ISBN으로 검색, 대출 기간 선택, 이미 대출 중인 경우 예약 신청이 가능하다. 반납 시 도서 상태 및 예약자 유무에 따라 자동 상태 변경이 이루어진다.\",\"acceptance\":[\"회원번호와 이름으로 회원이 확인되어야 한다.\",\"도서명 또는 ISBN으로 도서를 검색할 수 있어야 한다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"이미 대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 자동으로 '대출중'으로 변경된다.\",\"반납 완료 시 예약자 유무에 따라 도서 상태가 '예약중' 또는 '대출가능'으로 변경된다.\"]},{\"title\":\"대출 현황 및 처리\",\"description\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"acceptance\":[\"대출 건별로 대출일, 반납예정일, 현재 상태를 확인할 수 있다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"연체 상태에서는 연장이 불가하다.\"]},{\"title\":\"도서별 이력 및 상태 변경 추적\",\"description\":\"관리자는 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있다.\",\"acceptance\":[\"도서별로 모든 대출 이력과 상태 변경 이력을 볼 수 있다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"beforeStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"afterStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 기간 선택 제한\",\"description\":\"대출 기간은 7일, 14일, 30일만 선택할 수 있다.\"},{\"name\":\"연체 도서 연장 불가\",\"description\":\"연체 상태(OVERDUE)인 대출 건은 연장이 불가하다.\"},{\"name\":\"대출 상태 자동 변경\",\"description\":\"도서 대출 시 상태는 'ON_LOAN', 반납 시 예약자 없으면 'AVAILABLE', 예약자 있으면 'RESERVED'로 자동 변경된다.\"},{\"name\":\"폐기/대출 불가 도서 대출 거부\",\"description\":\"도서 상태가 'DISCARDED' 또는 대출 불가 시 대출이 거부된다.\"}],\"interfaces\":{\"LoanAndReturn\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[\"회원 확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchType\",\"type\":\"select\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\",\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 반납\",\"type\":\"form\",\"fields\":[{\"name\":\"loanId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"반납 처리\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatus\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\"],\"filters\":[\"대출 상태\",\"대출일\",\"반납예정일\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"title\",\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서별 이력 조회\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"대출 이력 조회\",\"상태 변경 이력 조회\"],\"filters\":[],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"status\"],\"actions\":[]}},{\"name\":\"도서 상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"historyId\",\"beforeStatus\",\"afterStatus\",\"changedAt\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"MemberVerified\",\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"displayName\":\"회원이 확인됨\"},{\"name\":\"BookLoanRequested\",\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"displayName\":\"도서 대출이 신청됨\"},{\"name\":\"BookLoanRejected\",\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"displayName\":\"도서 대출이 거부됨\"},{\"name\":\"BookLoanApproved\",\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"displayName\":\"도서 대출이 승인됨\"},{\"name\":\"BookReserved\",\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 예약됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookAvailable\",\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\"},{\"name\":\"BookReservedForNext\",\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"displayName\":\"대출 기간이 연장됨\"},{\"name\":\"LoanOverdue\",\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"displayName\":\"도서 대출이 연체됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"receives from\",\"targetContext\":\"도서 관리 (BookManagement)\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
                            }
                        ],
                        "conclusions": "1번 옵션은 핵심 대출/예약/회원 중심 업무 처리와 이벤트 기반 확장에 유리하며, 대부분의 일반적인 도서관 업무에 적합하다. 2번 옵션은 대출 이력 집계를 도입하여 이력 중심 분석·감사·통계가 많은 환경이나 이력 보관 요건이 엄격한 경우에 최적이다. 3번 옵션은 시스템 규모가 작고 단순 현황 위주 관리가 필요한 환경, 초기 단계에 적합하다.",
                        "defaultOptionIndex": 1,
                        "analysisResult": {
                            "userStories": [
                                {
                                    "title": "도서 대출 및 반납 관리",
                                    "description": "회원은 '대출/반납' 화면에서 회원 확인 후 도서를 대출하거나 반납할 수 있다. 대출 시 도서명 또는 ISBN으로 검색, 대출 기간 선택, 이미 대출 중인 경우 예약 신청이 가능하다. 반납 시 도서 상태 및 예약자 유무에 따라 자동 상태 변경이 이루어진다.",
                                    "acceptance": [
                                        "회원번호와 이름으로 회원이 확인되어야 한다.",
                                        "도서명 또는 ISBN으로 도서를 검색할 수 있어야 한다.",
                                        "대출 기간은 7일/14일/30일 중 선택할 수 있다.",
                                        "이미 대출 중인 도서는 예약 신청이 가능하다.",
                                        "대출 완료 시 도서 상태가 자동으로 '대출중'으로 변경된다.",
                                        "반납 완료 시 예약자 유무에 따라 도서 상태가 '예약중' 또는 '대출가능'으로 변경된다."
                                    ]
                                },
                                {
                                    "title": "대출 현황 및 처리",
                                    "description": "대출 현황 화면에서는 현재 대출 중인 도서들의 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.",
                                    "acceptance": [
                                        "대출 건별로 대출일, 반납예정일, 현재 상태를 확인할 수 있다.",
                                        "대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.",
                                        "연체 상태에서는 연장이 불가하다."
                                    ]
                                },
                                {
                                    "title": "도서별 이력 및 상태 변경 추적",
                                    "description": "관리자는 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있다.",
                                    "acceptance": [
                                        "도서별로 모든 대출 이력과 상태 변경 이력을 볼 수 있다."
                                    ]
                                }
                            ],
                            "entities": {
                                "Member": {
                                    "properties": [
                                        {
                                            "name": "memberId",
                                            "type": "String",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "name",
                                            "type": "String",
                                            "required": true
                                        }
                                    ]
                                },
                                "Book": {
                                    "properties": [
                                        {
                                            "name": "bookId",
                                            "type": "String",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "title",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "isbn",
                                            "type": "String",
                                            "required": true
                                        },
                                        {
                                            "name": "status",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "AVAILABLE",
                                                "ON_LOAN",
                                                "RESERVED",
                                                "DISCARDED"
                                            ]
                                        }
                                    ]
                                },
                                "Loan": {
                                    "properties": [
                                        {
                                            "name": "loanId",
                                            "type": "String",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "memberId",
                                            "type": "String",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Member"
                                        },
                                        {
                                            "name": "bookId",
                                            "type": "String",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Book"
                                        },
                                        {
                                            "name": "loanDate",
                                            "type": "Date",
                                            "required": true
                                        },
                                        {
                                            "name": "dueDate",
                                            "type": "Date",
                                            "required": true
                                        },
                                        {
                                            "name": "returnDate",
                                            "type": "Date"
                                        },
                                        {
                                            "name": "status",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "ON_LOAN",
                                                "OVERDUE",
                                                "RETURNED"
                                            ]
                                        }
                                    ]
                                },
                                "Reservation": {
                                    "properties": [
                                        {
                                            "name": "reservationId",
                                            "type": "String",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "memberId",
                                            "type": "String",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Member"
                                        },
                                        {
                                            "name": "bookId",
                                            "type": "String",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Book"
                                        },
                                        {
                                            "name": "reservationDate",
                                            "type": "Date",
                                            "required": true
                                        }
                                    ]
                                },
                                "BookStatusHistory": {
                                    "properties": [
                                        {
                                            "name": "historyId",
                                            "type": "String",
                                            "required": true,
                                            "isPrimaryKey": true
                                        },
                                        {
                                            "name": "bookId",
                                            "type": "String",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Book"
                                        },
                                        {
                                            "name": "beforeStatus",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "AVAILABLE",
                                                "ON_LOAN",
                                                "RESERVED",
                                                "DISCARDED"
                                            ]
                                        },
                                        {
                                            "name": "afterStatus",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "AVAILABLE",
                                                "ON_LOAN",
                                                "RESERVED",
                                                "DISCARDED"
                                            ]
                                        },
                                        {
                                            "name": "changedAt",
                                            "type": "Date",
                                            "required": true
                                        }
                                    ]
                                }
                            },
                            "businessRules": [
                                {
                                    "name": "대출 기간 선택 제한",
                                    "description": "대출 기간은 7일, 14일, 30일만 선택할 수 있다."
                                },
                                {
                                    "name": "연체 도서 연장 불가",
                                    "description": "연체 상태(OVERDUE)인 대출 건은 연장이 불가하다."
                                },
                                {
                                    "name": "대출 상태 자동 변경",
                                    "description": "도서 대출 시 상태는 'ON_LOAN', 반납 시 예약자 없으면 'AVAILABLE', 예약자 있으면 'RESERVED'로 자동 변경된다."
                                },
                                {
                                    "name": "폐기/대출 불가 도서 대출 거부",
                                    "description": "도서 상태가 'DISCARDED' 또는 대출 불가 시 대출이 거부된다."
                                }
                            ],
                            "interfaces": {
                                "LoanAndReturn": {
                                    "sections": [
                                        {
                                            "name": "회원 확인",
                                            "type": "form",
                                            "fields": [
                                                {
                                                    "name": "memberId",
                                                    "type": "text",
                                                    "required": true
                                                },
                                                {
                                                    "name": "name",
                                                    "type": "text",
                                                    "required": true
                                                }
                                            ],
                                            "actions": [
                                                "회원 확인"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "도서 대출 신청",
                                            "type": "form",
                                            "fields": [
                                                {
                                                    "name": "bookSearch",
                                                    "type": "text",
                                                    "required": true
                                                },
                                                {
                                                    "name": "searchType",
                                                    "type": "select",
                                                    "required": true
                                                },
                                                {
                                                    "name": "loanPeriod",
                                                    "type": "select",
                                                    "required": true
                                                }
                                            ],
                                            "actions": [
                                                "대출 신청",
                                                "예약 신청"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "도서 반납",
                                            "type": "form",
                                            "fields": [
                                                {
                                                    "name": "loanId",
                                                    "type": "text",
                                                    "required": true
                                                }
                                            ],
                                            "actions": [
                                                "반납 처리"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        }
                                    ]
                                },
                                "LoanStatus": {
                                    "sections": [
                                        {
                                            "name": "대출 현황 목록",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [
                                                "연장",
                                                "반납"
                                            ],
                                            "filters": [
                                                "대출 상태",
                                                "대출일",
                                                "반납예정일"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "loanId",
                                                    "bookId",
                                                    "title",
                                                    "loanDate",
                                                    "dueDate",
                                                    "status"
                                                ],
                                                "actions": [
                                                    "연장",
                                                    "반납"
                                                ]
                                            }
                                        }
                                    ]
                                },
                                "BookHistory": {
                                    "sections": [
                                        {
                                            "name": "도서별 이력 조회",
                                            "type": "table",
                                            "fields": [
                                                {
                                                    "name": "bookId",
                                                    "type": "text",
                                                    "required": true
                                                }
                                            ],
                                            "actions": [
                                                "대출 이력 조회",
                                                "상태 변경 이력 조회"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [
                                                    "loanId",
                                                    "memberId",
                                                    "loanDate",
                                                    "dueDate",
                                                    "returnDate",
                                                    "status"
                                                ],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "도서 상태 변경 이력",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [
                                                    "historyId",
                                                    "beforeStatus",
                                                    "afterStatus",
                                                    "changedAt"
                                                ],
                                                "actions": []
                                            }
                                        }
                                    ]
                                }
                            },
                            "events": [
                                {
                                    "name": "MemberVerified",
                                    "description": "회원번호와 이름으로 회원 정보가 확인됨.",
                                    "displayName": "회원이 확인됨"
                                },
                                {
                                    "name": "BookLoanRequested",
                                    "description": "회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.",
                                    "displayName": "도서 대출이 신청됨"
                                },
                                {
                                    "name": "BookLoanRejected",
                                    "description": "도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.",
                                    "displayName": "도서 대출이 거부됨"
                                },
                                {
                                    "name": "BookLoanApproved",
                                    "description": "도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.",
                                    "displayName": "도서 대출이 승인됨"
                                },
                                {
                                    "name": "BookReserved",
                                    "description": "대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.",
                                    "displayName": "도서가 예약됨"
                                },
                                {
                                    "name": "BookReturned",
                                    "description": "회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.",
                                    "displayName": "도서가 반납됨"
                                },
                                {
                                    "name": "BookAvailable",
                                    "description": "반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.",
                                    "displayName": "도서가 대출 가능 상태로 변경됨"
                                },
                                {
                                    "name": "BookReservedForNext",
                                    "description": "반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.",
                                    "displayName": "도서가 다음 예약자를 위해 예약중 상태로 변경됨"
                                },
                                {
                                    "name": "LoanExtended",
                                    "description": "회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.",
                                    "displayName": "대출 기간이 연장됨"
                                },
                                {
                                    "name": "LoanOverdue",
                                    "description": "반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.",
                                    "displayName": "도서 대출이 연체됨"
                                }
                            ],
                            "contextRelations": [
                                {
                                    "name": "BookManagementToBookLoanProcess",
                                    "type": "Pub/Sub",
                                    "direction": "receives from",
                                    "targetContext": "도서 관리 (BookManagement)",
                                    "reason": "도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.",
                                    "interactionPattern": "도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리."
                                }
                            ],
                            "inference": "요구사항을 바탕으로 대출/반납 및 대출 현황, 도서 이력 관리에 필요한 모든 명시적/암묵적 기능을 반영하였다. 엔터티 속성 및 타입, 업무 규칙, 인터페이스의 입력 유형, 도메인 이벤트, 컨텍스트 간 관계까지 구체적으로 구성하였다."
                        },
                        "inference": "\n\n도메인 요구사항과 누적 초안, 이벤트, 컨텍스트 관계, 집계 경계 원칙을 바탕으로, 각 옵션은 Loan(대출), Reservation(예약), Member(회원)을 반드시 포함하도록 설계했다. Book, BookLoanHistory, BookStatusHistory는 이미 존재하므로 ValueObject 참조로 처리했다. 옵션마다 집계 개수에 차별성을 두었고, 각 옵션은 트랜잭션 일관성, 상태 관리, 이벤트 발행에 맞춰 경계를 설정했다."
                    }
                ],
                "draftUIInfos": {
                    "leftBoundedContextCount": 0,
                    "directMessage": "Generating options for 도서 대출 프로세스 Bounded Context... (8479 characters generated)",
                    "progress": 100
                },
                "isGeneratorButtonEnabled": true,
                "boundedContextVersion": 1,
                "retryInputs": {
                    "initialInputs": [
                        {
                            "boundedContext": {
                                "name": "BookManagement",
                                "alias": "도서 관리",
                                "displayName": "도서 관리",
                                "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n도서는 도서명이나 ISBN으로 검색할 수 있어야 해.\n\n## userStory\n\n도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 대출 프로세스 (BookLoanProcess)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                                "aggregates": [
                                    {
                                        "name": "Book",
                                        "alias": "도서"
                                    }
                                ]
                            },
                            "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n도서는 도서명이나 ISBN으로 검색할 수 있어야 해.\n\n## userStory\n\n도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 대출 프로세스 (BookLoanProcess)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리."
                        },
                        {
                            "boundedContext": {
                                "name": "BookLoanProcess",
                                "alias": "도서 대출 프로세스",
                                "displayName": "도서 대출 프로세스",
                                "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}\n\n## Event\n\n{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}\n\n## Event\n\n{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}\n\n## Event\n\n{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                                "aggregates": [
                                    {
                                        "name": "Loan",
                                        "alias": "대출"
                                    },
                                    {
                                        "name": "Reservation",
                                        "alias": "예약"
                                    },
                                    {
                                        "name": "Member",
                                        "alias": "회원"
                                    }
                                ]
                            },
                            "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}\n\n## Event\n\n{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}\n\n## Event\n\n{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}\n\n## Event\n\n{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리."
                        }
                    ],
                    "initialAccumulatedDrafts": {
                        "BookManagement": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "enumerations": [],
                                "valueObjects": []
                            }
                        ],
                        "BookLoanProcess": [
                            {
                                "aggregate": {
                                    "name": "Loan",
                                    "alias": "대출"
                                },
                                "enumerations": [],
                                "valueObjects": []
                            },
                            {
                                "aggregate": {
                                    "name": "Reservation",
                                    "alias": "예약"
                                },
                                "enumerations": [],
                                "valueObjects": []
                            },
                            {
                                "aggregate": {
                                    "name": "Member",
                                    "alias": "회원"
                                },
                                "enumerations": [],
                                "valueObjects": []
                            }
                        ]
                    }
                },
                "selectedOptionItem": {
                    "BookManagement": {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "enumerations": [
                                    {
                                        "name": "BookCategory",
                                        "alias": "도서 카테고리"
                                    },
                                    {
                                        "name": "BookStatus",
                                        "alias": "도서 상태"
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "name": "BookLoanHistoryInfo",
                                        "alias": "도서 대출 이력 정보",
                                        "referencedAggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
                                        }
                                    },
                                    {
                                        "name": "BookStatusHistoryInfo",
                                        "alias": "도서 상태 변경 이력 정보"
                                    }
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "도서의 핵심 정보와 이력 데이터, 상태 전이를 한 Aggregate 내에서 일관성 있게 관리하여 비즈니스 규칙을 강하게 보장한다.",
                            "coupling": "도서 관련 작업이 한 Aggregate 내에서 해결되므로 외부 참조와 Aggregate 간 결합이 최소화된다.",
                            "consistency": "ISBN 유일성, 상태 전이 등 도서 중심의 모든 비즈니스 불변성이 단일 트랜잭션에서 강하게 보장된다.",
                            "encapsulation": "도서의 등록, 폐기, 상태 전이, 이력 관리까지 내부에서 처리되어 외부에 복잡성을 노출하지 않는다.",
                            "complexity": "이력까지 모두 한 곳에서 관리되어 구현 및 유지보수가 직관적이다.",
                            "independence": "Book Aggregate만으로 도서 업무의 대부분이 독립적으로 처리된다.",
                            "performance": "도서와 연관된 이력/상태 조회가 단일 Aggregate 조회로 효율적이다."
                        },
                        "cons": {
                            "cohesion": "이력 데이터가 계속 누적되면 Aggregate가 비대해져 단일 책임 원칙이 약화될 수 있다.",
                            "coupling": "이력 데이터의 구조 변경이 Book 전체에 영향을 줄 수 있어 변화에 취약해진다.",
                            "consistency": "대량 이력 데이터로 인한 트랜잭션 부하 및 충돌 가능성이 증가한다.",
                            "encapsulation": "외부 시스템에서 이력 정보만 분리 활용 시 도서 전체 구조를 알아야 한다.",
                            "complexity": "이력 데이터, 상태 등 다양한 관심사가 한 객체에 집중되어 복잡도가 누적된다.",
                            "independence": "이력 처리, 조회만 확장하려면 Book 전체 구조를 함께 고려해야 한다.",
                            "performance": "이력 데이터 증가 시 단일 Aggregate 조회/저장 성능 저하 우려가 있다."
                        },
                        "isAIRecommended": false,
                        "boundedContext": {
                            "name": "BookManagement",
                            "alias": "도서 관리",
                            "displayName": "도서 관리",
                            "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n도서는 도서명이나 ISBN으로 검색할 수 있어야 해.\n\n## userStory\n\n도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"도서 관리자\",\"level\":1,\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 데이터\",\"'대출가능' 상태\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookRegistrationFailed\",\"displayName\":\"도서 등록 실패됨\",\"actor\":\"도서 관리자\",\"level\":2,\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"inputs\":[\"ISBN(중복 또는 13자리 아님)\"],\"outputs\":[\"에러 메시지\",\"등록 거부\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"도서 관리자\",\"level\":3,\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"inputs\":[\"도서 식별자\",\"폐기 사유\"],\"outputs\":[\"도서 상태 '폐기'로 변경\",\"대출 불가\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookSearched\",\"displayName\":\"도서가 검색됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"inputs\":[\"검색어(도서명 또는 ISBN)\"],\"outputs\":[\"검색 결과 도서 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanHistoryViewed\",\"displayName\":\"도서의 대출 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":15,\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookStatusHistoryViewed\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\",\"actor\":\"도서 관리자\",\"level\":16,\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"상태 변경 이력 목록\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 대출 프로세스 (BookLoanProcess)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                            "aggregates": [
                                {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            ]
                        },
                        "description": "{\"userStories\":[{\"title\":\"도서 등록 및 상태 관리\",\"description\":\"도서 관리자로서 새로운 도서를 등록하고, 보유 도서들의 상태(대출가능/대출중/예약중/폐기)를 관리할 수 있다.\",\"acceptance\":[\"도서명, ISBN(13자리), 저자, 출판사, 카테고리 입력이 필수이며, ISBN 중복 검사가 반드시 수행된다.\",\"도서 등록 시 상태는 '대출가능'이 기본값으로 설정된다.\",\"도서 상태는 대출/반납/예약/폐기 처리에 따라 자동으로 변경된다.\",\"폐기된 도서는 더 이상 대출이 불가하다.\"]},{\"title\":\"도서 검색\",\"description\":\"사용자로서 도서명이나 ISBN으로 도서를 검색할 수 있다.\",\"acceptance\":[\"검색어로 도서명 또는 ISBN 입력 시 관련 도서 목록이 출력된다.\"]},{\"title\":\"도서 반납 및 상태 전이\",\"description\":\"도서가 반납되면 해당 도서의 상태가 '대출가능' 또는 '예약중'으로 자동 전환된다.\",\"acceptance\":[\"예약자가 없으면 '대출가능', 예약자가 있으면 '예약중'으로 상태가 자동 변경된다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서 관리자로서 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"대출 이력과 상태 변경 이력이 조회 화면에 표시된다.\",\"이력에는 시점, 변경자, 변경 사유 등이 포함된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"statusHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"changedBy\",\"type\":\"String\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN_Validation\",\"description\":\"ISBN은 반드시 13자리의 숫자여야 하며, 시스템 내에서 유일해야 한다.\"},{\"name\":\"BookStatus_AutoTransition\",\"description\":\"도서는 등록 시 '대출가능' 상태로 시작하며, 대출/반납/예약/폐기 상황에 따라 상태가 자동으로 변경된다.\"},{\"name\":\"BookDiscard_Restriction\",\"description\":\"폐기된 도서는 더 이상 대출이 불가하다.\"},{\"name\":\"ReturnStatusTransition\",\"description\":\"도서 반납 시 예약자가 없으면 '대출가능', 예약자가 있으면 '예약중' 상태로 자동 변경된다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"중복확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"상세보기\",\"폐기처리\"],\"filters\":[\"title\",\"ISBN\",\"category\",\"status\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"ISBN\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\",\"폐기처리\"]}}]},\"BookDetail\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"loanedBy\",\"loanDate\",\"returnDate\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"status\",\"changedAt\",\"changedBy\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"도서 관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 도서를 등록함. 등록된 도서는 '대출가능' 상태가 됨.\",\"displayName\":\"도서가 등록됨\"},{\"name\":\"BookRegistrationFailed\",\"description\":\"도서 등록 시 ISBN이 13자리가 아니거나 중복된 경우 등록이 거부됨.\",\"displayName\":\"도서 등록 실패됨\"},{\"name\":\"BookDiscarded\",\"description\":\"도서가 훼손되거나 분실된 경우 도서 관리자가 해당 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가함.\",\"displayName\":\"도서가 폐기됨\"},{\"name\":\"BookSearched\",\"description\":\"회원이 도서명이나 ISBN으로 도서를 검색함.\",\"displayName\":\"도서가 검색됨\"},{\"name\":\"BookLoanHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 대출 이력을 조회함.\",\"displayName\":\"도서의 대출 이력이 조회됨\"},{\"name\":\"BookStatusHistoryViewed\",\"description\":\"도서 관리자가 특정 도서의 상태 변경 이력을 조회함.\",\"displayName\":\"도서의 상태 변경 이력이 조회됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"sends to\",\"targetContext\":\"BookLoanProcess\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
                    },
                    "BookLoanProcess": {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Loan",
                                    "alias": "대출"
                                },
                                "enumerations": [
                                    {
                                        "name": "LoanStatus",
                                        "alias": "대출 상태"
                                    }
                                ],
                                "valueObjects": [
                                    {
                                        "name": "BookReference",
                                        "alias": "도서 참조",
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
                                    "name": "Reservation",
                                    "alias": "예약"
                                },
                                "enumerations": [],
                                "valueObjects": [
                                    {
                                        "name": "BookReference",
                                        "alias": "도서 참조",
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
                            }
                        ],
                        "pros": {
                            "cohesion": "핵심 대출·예약 업무에만 집중하여 집계 경계가 단순하다.",
                            "coupling": "Book, Member 등 외부 엔티티와의 참조만 유지하며 내부 결합도가 낮다.",
                            "consistency": "대출·예약 관련 상태 변경이 집계 내에서 일관성 있게 처리된다.",
                            "encapsulation": "도서 상태 자동 변경, 연체 연장 불가 등 핵심 규칙이 Loan 집계에 명확히 캡슐화된다.",
                            "complexity": "집계 수가 적어 전체 시스템 구조가 단순하며 이해와 유지보수가 쉽다.",
                            "independence": "Loan, Reservation은 별도로 발전 가능하며, 서비스 규모가 작을 때 최적화된 형태다.",
                            "performance": "불필요한 조인과 복잡한 트랜잭션이 최소화되어 빠른 응답이 가능하다."
                        },
                        "cons": {
                            "cohesion": "이력 관리, 상세 현황 등 부가 업무가 서비스 계층에 집중되어 코드 분산이 발생한다.",
                            "coupling": "이력·상태 추적이 외부 집계(BookLoanHistory, BookStatusHistory)에 의존해야 한다.",
                            "consistency": "복합 시나리오(대출→이력 동시 기록 등)에서 강한 일관성 보장이 어렵다.",
                            "encapsulation": "이력 및 상태 변경 규칙이 Loan 외부에 위치해 도메인 규칙이 분산될 수 있다.",
                            "complexity": "확장 시 부가 업무(이력, 상태변경 등) 도입을 위해 구조 변경 필요성이 생긴다.",
                            "independence": "외부 이력 집계와의 연동이 반드시 필요해 완전 독립 운영은 어렵다.",
                            "performance": "대출 및 예약 현황, 이력 동시 조회 시 성능 저하가 발생할 수 있다."
                        },
                        "isAIRecommended": false,
                        "boundedContext": {
                            "name": "BookLoanProcess",
                            "alias": "도서 대출 프로세스",
                            "displayName": "도서 대출 프로세스",
                            "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"MemberVerified\",\"displayName\":\"회원이 확인됨\",\"actor\":\"회원\",\"level\":5,\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"inputs\":[\"회원번호\",\"이름\"],\"outputs\":[\"회원 정보\"],\"nextEvents\":[\"BookLoanRequested\"]}\n\n## Event\n\n{\"name\":\"BookLoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"inputs\":[\"회원 정보\",\"도서 식별자\",\"대출 기간\"],\"outputs\":[\"대출 신청 요청\"],\"nextEvents\":[\"BookLoanApproved\",\"BookLoanRejected\"]}\n\n## Event\n\n{\"name\":\"BookLoanRejected\",\"displayName\":\"도서 대출이 거부됨\",\"actor\":\"도서 대출 시스템\",\"level\":7,\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"inputs\":[\"도서 상태 '폐기' 또는 대출 불가\"],\"outputs\":[\"대출 거부 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookLoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"도서 대출 시스템\",\"level\":8,\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"inputs\":[\"도서 상태 '대출가능'\",\"대출 신청 정보\"],\"outputs\":[\"대출 정보 생성\",\"도서 상태 '대출중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서가 예약됨\",\"actor\":\"회원\",\"level\":9,\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태 '예약중'으로 변경\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"회원\",\"level\":10,\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\"],\"outputs\":[\"반납 처리\",\"도서 상태 변경\"],\"nextEvents\":[\"BookAvailable\",\"BookReservedForNext\"]}\n\n## Event\n\n{\"name\":\"BookAvailable\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":11,\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 없음\"],\"outputs\":[\"도서 상태 '대출가능'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookReservedForNext\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\",\"actor\":\"도서 대출 시스템\",\"level\":12,\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"inputs\":[\"반납 도서 식별자\",\"예약자 존재\"],\"outputs\":[\"도서 상태 '예약중'\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 기간이 연장됨\",\"actor\":\"회원\",\"level\":13,\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"inputs\":[\"회원 정보\",\"대출 중인 도서 식별자\",\"연장 요청\"],\"outputs\":[\"대출 기간 연장\",\"새 반납 예정일\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"도서 대출 시스템\",\"level\":14,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일 경과\",\"반납 미처리\"],\"outputs\":[\"대출 상태 '연체'로 변경\"],\"nextEvents\":[]}\n\n\n## Context Relations\n\n### BookManagementToBookLoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\n- **Interaction Pattern**: 도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.",
                            "aggregates": [
                                {
                                    "name": "Loan",
                                    "alias": "대출"
                                },
                                {
                                    "name": "Reservation",
                                    "alias": "예약"
                                },
                                {
                                    "name": "Member",
                                    "alias": "회원"
                                }
                            ]
                        },
                        "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 회원 확인 후 도서를 대출하거나 반납할 수 있다. 대출 시 도서명 또는 ISBN으로 검색, 대출 기간 선택, 이미 대출 중인 경우 예약 신청이 가능하다. 반납 시 도서 상태 및 예약자 유무에 따라 자동 상태 변경이 이루어진다.\",\"acceptance\":[\"회원번호와 이름으로 회원이 확인되어야 한다.\",\"도서명 또는 ISBN으로 도서를 검색할 수 있어야 한다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"이미 대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 자동으로 '대출중'으로 변경된다.\",\"반납 완료 시 예약자 유무에 따라 도서 상태가 '예약중' 또는 '대출가능'으로 변경된다.\"]},{\"title\":\"대출 현황 및 처리\",\"description\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록, 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"acceptance\":[\"대출 건별로 대출일, 반납예정일, 현재 상태를 확인할 수 있다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"연체 상태에서는 연장이 불가하다.\"]},{\"title\":\"도서별 이력 및 상태 변경 추적\",\"description\":\"관리자는 각 도서별 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있다.\",\"acceptance\":[\"도서별로 모든 대출 이력과 상태 변경 이력을 볼 수 있다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"beforeStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"afterStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\",\"DISCARDED\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 기간 선택 제한\",\"description\":\"대출 기간은 7일, 14일, 30일만 선택할 수 있다.\"},{\"name\":\"연체 도서 연장 불가\",\"description\":\"연체 상태(OVERDUE)인 대출 건은 연장이 불가하다.\"},{\"name\":\"대출 상태 자동 변경\",\"description\":\"도서 대출 시 상태는 'ON_LOAN', 반납 시 예약자 없으면 'AVAILABLE', 예약자 있으면 'RESERVED'로 자동 변경된다.\"},{\"name\":\"폐기/대출 불가 도서 대출 거부\",\"description\":\"도서 상태가 'DISCARDED' 또는 대출 불가 시 대출이 거부된다.\"}],\"interfaces\":{\"LoanAndReturn\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[\"회원 확인\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchType\",\"type\":\"select\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\",\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 반납\",\"type\":\"form\",\"fields\":[{\"name\":\"loanId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"반납 처리\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatus\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\"],\"filters\":[\"대출 상태\",\"대출일\",\"반납예정일\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"title\",\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서별 이력 조회\",\"type\":\"table\",\"fields\":[{\"name\":\"bookId\",\"type\":\"text\",\"required\":true}],\"actions\":[\"대출 이력 조회\",\"상태 변경 이력 조회\"],\"filters\":[],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"status\"],\"actions\":[]}},{\"name\":\"도서 상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[\"historyId\",\"beforeStatus\",\"afterStatus\",\"changedAt\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"MemberVerified\",\"description\":\"회원번호와 이름으로 회원 정보가 확인됨.\",\"displayName\":\"회원이 확인됨\"},{\"name\":\"BookLoanRequested\",\"description\":\"회원이 대출하고자 하는 도서와 대출 기간(7일/14일/30일)을 선택하여 대출을 신청함.\",\"displayName\":\"도서 대출이 신청됨\"},{\"name\":\"BookLoanRejected\",\"description\":\"도서가 폐기되었거나 대출 불가 상태인 경우 대출이 거부됨.\",\"displayName\":\"도서 대출이 거부됨\"},{\"name\":\"BookLoanApproved\",\"description\":\"도서가 대출 가능 상태라면 대출이 승인되고 대출 정보가 생성됨. 도서 상태는 '대출중'으로 변경됨.\",\"displayName\":\"도서 대출이 승인됨\"},{\"name\":\"BookReserved\",\"description\":\"대출하려는 도서가 이미 대출 중일 때 회원이 해당 도서의 예약을 신청하면 예약이 생성되고, 도서의 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 예약됨\"},{\"name\":\"BookReturned\",\"description\":\"회원이 대출한 도서를 반납함. 도서에 예약자가 있으면 상태가 '예약중'으로, 없으면 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 반납됨\"},{\"name\":\"BookAvailable\",\"description\":\"반납된 도서에 예약자가 없는 경우 도서 상태가 '대출가능'으로 변경됨.\",\"displayName\":\"도서가 대출 가능 상태로 변경됨\"},{\"name\":\"BookReservedForNext\",\"description\":\"반납된 도서에 예약자가 있을 경우 도서 상태가 '예약중'으로 변경됨.\",\"displayName\":\"도서가 다음 예약자를 위해 예약중 상태로 변경됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출 중인 도서의 대출 기간을 연장함. 연체 상태에서는 연장이 불가함.\",\"displayName\":\"대출 기간이 연장됨\"},{\"name\":\"LoanOverdue\",\"description\":\"반납 예정일이 지나도 도서가 반납되지 않은 경우, 대출 건의 상태가 '연체'로 변경됨.\",\"displayName\":\"도서 대출이 연체됨\"}],\"contextRelations\":[{\"name\":\"BookManagementToBookLoanProcess\",\"type\":\"Pub/Sub\",\"direction\":\"receives from\",\"targetContext\":\"도서 관리 (BookManagement)\",\"reason\":\"도서의 상태 변화, 신규 등록, 폐기 등 이벤트가 발생하면 이를 대출/예약/연체 프로세스에 전달해야 하며, 두 컨텍스트가 느슨하게 결합되고 데이터 소유권이 명확히 분리됨.\",\"interactionPattern\":\"도서 상태 변경, 신규 등록, 폐기 등 이벤트를 Pub/Sub로 발행하며 대출 프로세스에서 구독하여 반영함. 예: 도서가 폐기되면 대출 프로세스에서 대출 거부 처리.\"}]}"
                    }
                }
            }
        ]
    }
}