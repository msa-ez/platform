export const aggregateDraftScenarios = {
    "libraryApplication": {
        "selectedStructureOption": {
            "boundedContexts": [
                {
                    "name": "LibraryBookManagement",
                    "alias": "도서관리",
                    "importance": "Core Domain",
                    "complexity": 0.8,
                    "differentiation": 0.95,
                    "implementationStrategy": "Rich Domain Model",
                    "aggregates": [
                        {
                            "name": "Book",
                            "alias": "도서"
                        }
                    ],
                    "events": [
                        "BookRegistered",
                        "BookStateChanged",
                        "BookDisposed",
                        "BookHistoryQueried"
                    ],
                    "requirements": [
                        {
                            "type": "userStory",
                            "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                        },
                        {
                            "type": "userStory",
                            "text": "각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}"
                        }
                    ],
                    "role": "도서 등록, ISBN 중복 및 유효성 검사, 도서 상태 관리(대출가능/대출중/예약중/폐기), 도서 상태 변경 이력 추적, 도서의 폐기 처리 등 도서의 전체 수명 주기와 관련된 업무를 담당한다. 도서와 직접적으로 연관된 복잡한 비즈니스 규칙을 다루며, 사용자가 도서 등록, 상태 관리, 이력 조회 등 주도적으로 사용할 수 있다."
                },
                {
                    "name": "LibraryLoanProcess",
                    "alias": "대출/반납",
                    "importance": "Core Domain",
                    "complexity": 0.85,
                    "differentiation": 0.95,
                    "implementationStrategy": "Rich Domain Model",
                    "aggregates": [
                        {
                            "name": "Loan",
                            "alias": "대출"
                        },
                        {
                            "name": "Reservation",
                            "alias": "예약"
                        }
                    ],
                    "events": [
                        "LoanRequested",
                        "LoanApproved",
                        "LoanReturned",
                        "LoanExtended",
                        "LoanOverdueChecked",
                        "BookReserved",
                        "ReservationNotified",
                        "LoanStatusQueried"
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
                            "text": "{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}"
                        }
                    ],
                    "role": "도서 대출 신청, 회원 확인, 도서 검색, 대출 처리 및 상태 변경, 대출 연장/반납/연체 관리, 예약 처리 및 예약자 알림, 대출 현황 조회 등 도서의 대출-반납 및 예약 관련 전체 프로세스를 책임진다. 회원과 도서의 상호작용, 대출/반납/연장/예약 등 복잡한 프로세스 흐름을 포함하며, 각종 정책과 상태 변화에 따라 동작한다."
                }
            ],
            "relations": [
                {
                    "name": "BookStatusEventPubSub",
                    "type": "Pub/Sub",
                    "upStream": {
                        "name": "LibraryLoanProcess",
                        "alias": "대출/반납"
                    },
                    "downStream": {
                        "name": "LibraryBookManagement",
                        "alias": "도서관리"
                    }
                },
                {
                    "name": "BookInfoQueryPubSub",
                    "type": "Pub/Sub",
                    "upStream": {
                        "name": "LibraryBookManagement",
                        "alias": "도서관리"
                    },
                    "downStream": {
                        "name": "LibraryLoanProcess",
                        "alias": "대출/반납"
                    }
                }
            ],
            "thoughts": "본 분리는 도메인 복잡도와 value stream(업무 프로세스) 기반으로 이루어졌다. 도서관리(도서의 등록, 폐기, 상태 관리, 이력 관리)는 도서의 라이프사이클 및 마스터 데이터 관리라는 관점에서 하나의 높은 응집도를 가지는 코어 도메인으로 분리하였다. 반면, 대출/반납은 회원과 도서의 상호작용, 대출-반납-연장-예약-알림 등 일련의 업무 흐름과 정책을 주도하는 프로세스 기반의 코어 도메인으로 독립적으로 분리하였다. 두 컨텍스트 모두 고도의 비즈니스 규칙과 UI/사용자 주도 프로세스를 내포하므로 Core Domain으로 분류했다. 인프라 측면에서, 현재 요구사항과 주어진 PBC 내에서는 도메인에 직접 대응되는 PBC가 없어 독자적 Rich Domain Model 전략을 채택하였다. 각 컨텍스트 간 결합도를 낮추기 위해 Pub/Sub 이벤트 기반 통신 패턴을 도입하였다(예: 대출 완료 시 도서 상태 변경 이벤트 발행, 도서 정보 변경 시 대출 컨텍스트에 동기화 등). 이를 통해 컨텍스트별 역할과 책임의 명확한 분리와 함께 시스템 확장성 및 유지보수성을 높일 수 있다.",
            "explanations": [
                {
                    "sourceContext": "대출/반납",
                    "targetContext": "도서관리",
                    "relationType": "Pub/Sub",
                    "reason": "대출/반납 컨텍스트에서 대출, 반납, 예약 등의 이벤트가 발생하면 도서의 상태를 변경해야 하므로, 이벤트 발행을 통해 도서관리 컨텍스트에 상태 변경을 알린다. 이 방식은 결합도를 낮추고 유연한 확장을 가능하게 한다.",
                    "interactionPattern": "대출/반납 컨텍스트에서 도서 상태 변경 이벤트를 발행하면 도서관리 컨텍스트가 구독하여 처리(Pub/Sub, 예: 메시지 브로커 사용)한다."
                },
                {
                    "sourceContext": "도서관리",
                    "targetContext": "대출/반납",
                    "relationType": "Pub/Sub",
                    "reason": "도서관리 컨텍스트에서 도서 정보가 변경(등록/폐기 등)될 경우, 대출/반납 컨텍스트가 해당 정보를 반영할 수 있도록 Pub/Sub 이벤트를 활용한다.",
                    "interactionPattern": "도서관리 컨텍스트가 도서 정보 이벤트를 발행하면, 대출/반납 컨텍스트가 이를 구독해 자신의 로컬 데이터/캐시를 동기화한다."
                }
            ],
            "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
            "currentGeneratedLength": 3981
        },
        "draftOptions": {
            "LibraryBookManagement": {
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
                                "name": "LoanReference",
                                "alias": "대출 참조",
                                "referencedAggregate": {
                                    "name": "Loan",
                                    "alias": "대출"
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
                            "name": "BookHistory",
                            "alias": "도서 이력"
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
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "도서와 이력 기능이 분리되어 각각 핵심 역할에 집중할 수 있음.",
                    "coupling": "도서와 이력 간의 의존성이 ValueObject(참조) 수준으로 낮아집니다.",
                    "consistency": "도서 트랜잭션과 이력 기록이 분리되어, 대용량 이력에도 안정적으로 대응 가능.",
                    "encapsulation": "이력 관련 정책이나 확장(예: 다양한 이력 종류 추가)이 Book과 분리되어 독립적으로 변경 가능.",
                    "complexity": "이력 관리 로직이 별도 Aggregate에 있어 도서 관리가 단순해지고, 이해하기 쉬움.",
                    "independence": "이력 저장방식이나 보존정책 변경 시 도서 Aggregate에 영향 없음.",
                    "performance": "도서 데이터와 이력 데이터를 분리 저장 및 조회할 수 있어 대량 이력에도 성능 저하가 없음."
                },
                "cons": {
                    "cohesion": "상태 변경과 이력 기록이 분산되어 있어 단일 도서 관리 흐름이 단순하지 않을 수 있음.",
                    "coupling": "이력 기록 시 도서의 참조를 유지해야 하므로 약간의 간접적인 결합이 존재함.",
                    "consistency": "상태 변경과 이력 기록이 각각 별도의 트랜잭션에서 발생할 수 있어, 일시적으로 불일치 상태가 발생 가능.",
                    "encapsulation": "도서 상태 변경이 이력과 분리되어 이력 누락/오류를 방지하는 추가적 방어 코드가 필요함.",
                    "complexity": "이력 데이터 연동, 조회 시 cross-aggregate 처리 로직(조인 등)이 추가됨.",
                    "independence": "도서 삭제 등 라이프사이클 정책이 이력 데이터와 동기화되어야 하므로 관리 포인트가 증가함.",
                    "performance": "도서와 이력을 함께 조회할 경우 두 Aggregate를 동시에 접근해야 하므로 I/O가 증가함."
                },
                "boundedContext": {
                    "name": "LibraryBookManagement",
                    "alias": "도서관리",
                    "displayName": "도서관리",
                    "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}",
                    "aggregates": [
                        {
                            "name": "Book",
                            "alias": "도서"
                        }
                    ]
                },
                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"도서관리자는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 새로운 도서를 등록할 수 있고, 등록된 도서의 상태를 관리할 수 있다.\",\"acceptance\":[\"ISBN은 13자리 숫자이며 중복되지 않아야 한다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.\",\"도서 등록 시 상태는 '대출가능'이 된다.\",\"도서 상태는 대출/반납/예약/폐기 등의 이벤트에 따라 자동으로 변경된다.\",\"폐기된 도서는 대출이 불가능하다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서관리자 또는 회원은 특정 도서의 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 파악할 수 있다.\",\"acceptance\":[\"도서별로 대출 이력과 상태 변경 이력을 각각 조회할 수 있다.\",\"이력에는 상태 변경 일시 및 사유가 명시되어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"loanHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"memberId\",\"type\":\"Long\",\"required\":true}]},\"BookStateHistory\":{\"properties\":[{\"name\":\"stateHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"newStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN 유효성 검증\",\"description\":\"ISBN은 13자리 숫자여야 하며, 시스템 내에서 중복될 수 없다.\"},{\"name\":\"도서 상태 자동 전이\",\"description\":\"도서 등록 시 상태는 자동으로 '대출가능'으로 지정되고, 대출/반납/예약/폐기 등 이벤트 발생 시 상태가 자동으로 변경된다.\"},{\"name\":\"폐기 도서 대출 불가\",\"description\":\"폐기 상태의 도서는 어떠한 경우에도 대출 처리될 수 없다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"중복확인\",\"도서등록\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록 및 상태 관리\",\"type\":\"table\",\"fields\":[],\"actions\":[\"대출처리\",\"반납처리\",\"예약처리\",\"폐기처리\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"loanDate\",\"returnDate\",\"memberId\"],\"actions\":[]}},{\"name\":\"상태 변경 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"previousStatus\",\"newStatus\",\"changedAt\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"displayName\":\"도서 등록됨\"},{\"name\":\"BookStateChanged\",\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"displayName\":\"도서 상태 변경됨\"},{\"name\":\"BookDisposed\",\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"displayName\":\"도서 폐기됨\"},{\"name\":\"BookHistoryQueried\",\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"displayName\":\"도서 이력 조회됨\"}]}"
            },
            "LibraryLoanProcess": {
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
                            },
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
                    "cohesion": "LoanHistory가 별도 Aggregate로 관리되어 대출·연장·반납·연체 이력을 전문적으로 누적·조회할 수 있다.",
                    "coupling": "대출 흐름과 이력 관리가 분리되어 서로의 변경에 최소 영향만 받는다.",
                    "consistency": "Loan/Reservation과 이력 저장이 별도 트랜잭션으로 처리되어 업무별 불변성 보호가 명확하다.",
                    "encapsulation": "대출 이력 관련 규칙(예: 변경 불가, 조회 only 등)이 LoanHistory Aggregate 내부에 집중된다.",
                    "complexity": "이력 관리 로직이 Loan, Reservation에서 분리되어 각 도메인의 복잡도가 낮아진다.",
                    "independence": "이력 정책 변경(예: 이력 상세 항목 추가 등)이 Loan, Reservation Aggregate에 영향을 거의 미치지 않는다.",
                    "performance": "이력 조회/통계 연산이 대출, 예약 데이터와 분리되어 대규모 데이터 처리 시 효율적이다."
                },
                "cons": {
                    "cohesion": "대출-이력 간 강한 연관에도 불구하고 트랜잭션이 분리되어 약간의 데이터 불일치 가능성이 존재한다.",
                    "coupling": "이력 기록 시 Loan의 상태·속성을 반드시 동기화해야 하므로 업무 서비스 계층에 추가 연동 로직이 필요하다.",
                    "consistency": "Loan, LoanHistory의 일관성 보장을 위한 보상 트랜잭션 또는 동기화 이벤트 관리가 필요하다.",
                    "encapsulation": "이력 변경 시 Loan/LoanHistory 양쪽에 수정이 필요할 수 있어 코드 추적성이 떨어질 수 있다.",
                    "complexity": "Aggregate가 늘어나면서 배포, 관리 포인트가 증가한다.",
                    "independence": "이력 데이터와 본 대출/예약 데이터 간의 비즈니스 룰 연결(예: 상태 이력 반영 등)이 추가 구현 필요.",
                    "performance": "이력 저장, 조회에 별도 Aggregate 접근이 필요해 단순한 구조에 비해 오버헤드가 약간 증가한다."
                },
                "boundedContext": {
                    "name": "LibraryLoanProcess",
                    "alias": "대출/반납",
                    "displayName": "대출/반납",
                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}",
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
                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 본인의 회원번호와 이름을 통해 확인받고, 도서명 또는 ISBN으로 도서를 검색하여 대출을 신청할 수 있다. 이미 대출중인 도서는 예약 신청이 가능하다. 도서 대출 완료 시 도서 상태는 자동으로 '대출중'으로 변경된다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인이 가능하다.\",\"도서명 또는 ISBN으로 도서 검색이 가능하다.\",\"대출 가능 상태의 도서만 대출 신청이 가능하다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 '대출중'으로 자동 변경된다.\"]},{\"title\":\"대출 현황 조회 및 관리\",\"description\":\"도서관리자는 '대출 현황' 화면에서 현재 대출 중인 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 건별로 연장 또는 반납 처리를 할 수 있다.\",\"acceptance\":[\"대출 건의 대출일, 반납예정일, 상태가 표시된다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"도서 반납 시 예약자가 있으면 상태가 '예약중', 없으면 '대출가능'으로 변경된다.\",\"대출 상태는 '대출중', '연체', '반납완료'가 존재한다.\"]},{\"title\":\"도서별 대출 및 상태 이력 조회\",\"description\":\"관리자는 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"각 도서별로 대출 이력과 상태 변경 이력이 조회된다.\",\"대출 이력에는 대출일, 반납일, 연장, 연체 정보가 포함된다.\",\"상태 이력에는 상태 변경 일시와 변경 내용이 포함된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"loanStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]},{\"name\":\"extendCount\",\"type\":\"Integer\"}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]},{\"name\":\"changeDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 가능 상태 확인\",\"description\":\"도서 상태가 AVAILABLE인 경우에만 대출 신청이 가능하다.\"},{\"name\":\"대출 중 도서 예약\",\"description\":\"도서 상태가 ON_LOAN일 때만 예약 신청이 가능하다.\"},{\"name\":\"대출 기간 선택\",\"description\":\"대출 신청 시 7일, 14일, 30일 중에서 대출 기간을 선택해야 한다.\"},{\"name\":\"연장 제한\",\"description\":\"대출 연장은 정책에 따라 1회 또는 제한 횟수만큼만 가능하다.\"},{\"name\":\"반납 시 도서 상태 전환\",\"description\":\"도서 반납 후 예약자가 있으면 상태를 RESERVED, 없으면 AVAILABLE로 변경한다.\"},{\"name\":\"연체 처리\",\"description\":\"반납 예정일이 경과하면 도서의 대출 상태를 OVERDUE로 변경한다.\"},{\"name\":\"상태 변경 이력 기록\",\"description\":\"모든 도서의 상태 변경은 BookStatusHistory에 기록된다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 선택\",\"type\":\"form\",\"fields\":[{\"name\":\"titleOrIsbn\",\"type\":\"text\",\"required\":true}],\"actions\":[\"도서 검색\"],\"filters\":[],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"status\"],\"actions\":[\"도서 선택\"]}},{\"name\":\"대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"예약 신청\",\"type\":\"form\",\"fields\":[],\"actions\":[\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatusScreen\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장 신청\",\"반납 처리\"],\"filters\":[\"전체/회원별/도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"bookId\",\"loanDate\",\"dueDate\",\"loanStatus\"],\"actions\":[\"상세 조회\"]}}]},\"BookHistoryScreen\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"loanStatus\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"historyId\",\"status\",\"changeDate\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"LoanRequested\",\"description\":\"회원이 도서명 또는 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"displayName\":\"대출 신청됨\"},{\"name\":\"LoanApproved\",\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"displayName\":\"대출 완료됨\"},{\"name\":\"BookReserved\",\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"displayName\":\"도서 예약됨\"},{\"name\":\"LoanReturned\",\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"displayName\":\"도서 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"displayName\":\"대출 연장됨\"},{\"name\":\"LoanOverdueChecked\",\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"displayName\":\"연체 확인됨\"},{\"name\":\"ReservationNotified\",\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"displayName\":\"예약자 통보됨\"},{\"name\":\"LoanStatusQueried\",\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"displayName\":\"대출 현황 조회됨\"}]}"
            }
        },
        "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
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
                "uniqueId": "7e4fecd1ce121a3a87cee83d994e1a37",
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
                            "f6200042-b415-970e-d56e-69ba0f28733c": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "f6200042-b415-970e-d56e-69ba0f28733c",
                                "name": "도서관리자",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "f6200042-b415-970e-d56e-69ba0f28733c",
                                    "x": 150,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "eac0876e-5b10-8109-7e9d-b8ab97e6becd": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "eac0876e-5b10-8109-7e9d-b8ab97e6becd",
                                "name": "회원",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "eac0876e-5b10-8109-7e9d-b8ab97e6becd",
                                    "x": 150,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "f39b40be-c8e2-a76e-1c41-2344d46e86cb": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "f39b40be-c8e2-a76e-1c41-2344d46e86cb",
                                "name": "도서관리시스템",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "f39b40be-c8e2-a76e-1c41-2344d46e86cb",
                                    "x": 150,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "7645ce73-3114-051f-ba68-347a65424d71": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "7645ce73-3114-051f-ba68-347a65424d71",
                                "visibility": "public",
                                "name": "BookRegistered",
                                "oldName": "",
                                "displayName": "도서 등록됨",
                                "namePascalCase": "BookRegistered",
                                "nameCamelCase": "bookRegistered",
                                "namePlural": "",
                                "description": "관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.",
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
                                    "id": "7645ce73-3114-051f-ba68-347a65424d71",
                                    "x": 300,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "7645ce73-3114-051f-ba68-347a65424d71",
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
                            "f54b8b55-6f10-3c7c-f168-17082b4ee4d0": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
                                "visibility": "public",
                                "name": "BookDisposed",
                                "oldName": "",
                                "displayName": "도서 폐기됨",
                                "namePascalCase": "BookDisposed",
                                "nameCamelCase": "bookDisposed",
                                "namePlural": "",
                                "description": "관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.",
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
                                    "id": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
                                    "x": 500,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
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
                            "05d6ad4f-b523-6a03-be44-ccb8c9b6a612": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "05d6ad4f-b523-6a03-be44-ccb8c9b6a612",
                                "visibility": "public",
                                "name": "BookHistoryQueried",
                                "oldName": "",
                                "displayName": "도서 이력 조회됨",
                                "namePascalCase": "BookHistoryQueried",
                                "nameCamelCase": "bookHistoryQueried",
                                "namePlural": "",
                                "description": "관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.",
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
                                    "id": "05d6ad4f-b523-6a03-be44-ccb8c9b6a612",
                                    "x": 700,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "05d6ad4f-b523-6a03-be44-ccb8c9b6a612",
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
                            "6cad6c4c-60f4-ef4e-32cd-517263995ea0": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "6cad6c4c-60f4-ef4e-32cd-517263995ea0",
                                "visibility": "public",
                                "name": "LoanStatusQueried",
                                "oldName": "",
                                "displayName": "대출 현황 조회됨",
                                "namePascalCase": "LoanStatusQueried",
                                "nameCamelCase": "loanStatusQueried",
                                "namePlural": "",
                                "description": "현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.",
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
                                    "id": "6cad6c4c-60f4-ef4e-32cd-517263995ea0",
                                    "x": 900,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "6cad6c4c-60f4-ef4e-32cd-517263995ea0",
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
                            "a46f6438-cb9e-0f34-421f-f330bf8c862c": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                "visibility": "public",
                                "name": "BookStateChanged",
                                "oldName": "",
                                "displayName": "도서 상태 변경됨",
                                "namePascalCase": "BookStateChanged",
                                "nameCamelCase": "bookStateChanged",
                                "namePlural": "",
                                "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
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
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "x": 300,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
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
                            "2744e4e3-6792-0b2c-a980-88d5f6223aa0": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                "visibility": "public",
                                "name": "LoanApproved",
                                "oldName": "",
                                "displayName": "대출 완료됨",
                                "namePascalCase": "LoanApproved",
                                "nameCamelCase": "loanApproved",
                                "namePlural": "",
                                "description": "대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.",
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
                                    "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "x": 500,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
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
                            "88218e81-cf65-8b25-1222-001fba8aa5ff": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                "visibility": "public",
                                "name": "LoanOverdueChecked",
                                "oldName": "",
                                "displayName": "연체 확인됨",
                                "namePascalCase": "LoanOverdueChecked",
                                "nameCamelCase": "loanOverdueChecked",
                                "namePlural": "",
                                "description": "반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.",
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
                                    "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                    "x": 700,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
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
                            "7396f14a-6b12-f1b9-281d-99403365ed35": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "7396f14a-6b12-f1b9-281d-99403365ed35",
                                "visibility": "public",
                                "name": "ReservationNotified",
                                "oldName": "",
                                "displayName": "예약자 통보됨",
                                "namePascalCase": "ReservationNotified",
                                "nameCamelCase": "reservationNotified",
                                "namePlural": "",
                                "description": "예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.",
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
                                    "id": "7396f14a-6b12-f1b9-281d-99403365ed35",
                                    "x": 900,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "7396f14a-6b12-f1b9-281d-99403365ed35",
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
                            "65c7adb1-9c5e-8b68-610d-001a35e42a9f": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                "visibility": "public",
                                "name": "LoanRequested",
                                "oldName": "",
                                "displayName": "대출 신청됨",
                                "namePascalCase": "LoanRequested",
                                "nameCamelCase": "loanRequested",
                                "namePlural": "",
                                "description": "회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.",
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
                                    "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                    "x": 300,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
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
                            "d5816e58-5dff-6c9f-dd62-a75ff386d96e": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                "visibility": "public",
                                "name": "BookReserved",
                                "oldName": "",
                                "displayName": "도서 예약됨",
                                "namePascalCase": "BookReserved",
                                "nameCamelCase": "bookReserved",
                                "namePlural": "",
                                "description": "회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.",
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
                                    "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                    "x": 500,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
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
                            "2591d6ce-91a8-4278-4fb5-edb44f3de821": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "visibility": "public",
                                "name": "LoanReturned",
                                "oldName": "",
                                "displayName": "도서 반납됨",
                                "namePascalCase": "LoanReturned",
                                "nameCamelCase": "loanReturned",
                                "namePlural": "",
                                "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "x": 700,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                            "7e172b4f-fc79-432c-0a91-24528abf36d8": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                "visibility": "public",
                                "name": "LoanExtended",
                                "oldName": "",
                                "displayName": "대출 연장됨",
                                "namePascalCase": "LoanExtended",
                                "nameCamelCase": "loanExtended",
                                "namePlural": "",
                                "description": "회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.",
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
                                    "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                    "x": 900,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
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
                            }
                        },
                        "relations": {
                            "ab854105-0462-5609-0876-0aea82e12c56": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "ab854105-0462-5609-0876-0aea82e12c56",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "ab854105-0462-5609-0876-0aea82e12c56",
                                "to": "ab854105-0462-5609-0876-0aea82e12c56",
                                "description": "",
                                "relationView": {
                                    "id": "ab854105-0462-5609-0876-0aea82e12c56",
                                    "value": "[[0,275],[2000,275]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,275],[2000,275]]"
                            },
                            "5b6658cc-edf3-8cd0-c94c-afc49e081036": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "5b6658cc-edf3-8cd0-c94c-afc49e081036",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "5b6658cc-edf3-8cd0-c94c-afc49e081036",
                                "to": "5b6658cc-edf3-8cd0-c94c-afc49e081036",
                                "description": "",
                                "relationView": {
                                    "id": "5b6658cc-edf3-8cd0-c94c-afc49e081036",
                                    "value": "[[0,525],[2000,525]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,525],[2000,525]]"
                            },
                            "8733f075-ce65-aaaf-fa4e-33eb8e72a5e6": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "8733f075-ce65-aaaf-fa4e-33eb8e72a5e6",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "8733f075-ce65-aaaf-fa4e-33eb8e72a5e6",
                                "to": "8733f075-ce65-aaaf-fa4e-33eb8e72a5e6",
                                "description": "",
                                "relationView": {
                                    "id": "8733f075-ce65-aaaf-fa4e-33eb8e72a5e6",
                                    "value": "[[0,775],[2000,775]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,775],[2000,775]]"
                            },
                            "4e2d2b20-556e-f0cd-372d-01ba03576c86": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "4e2d2b20-556e-f0cd-372d-01ba03576c86",
                                "name": "1",
                                "displayName": "1",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "7645ce73-3114-051f-ba68-347a65424d71",
                                    "visibility": "public",
                                    "name": "BookRegistered",
                                    "oldName": "",
                                    "displayName": "도서 등록됨",
                                    "namePascalCase": "BookRegistered",
                                    "nameCamelCase": "bookRegistered",
                                    "namePlural": "",
                                    "description": "관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.",
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
                                        "id": "7645ce73-3114-051f-ba68-347a65424d71",
                                        "x": 300,
                                        "y": 150,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7645ce73-3114-051f-ba68-347a65424d71",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
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
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
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
                                "from": "7645ce73-3114-051f-ba68-347a65424d71",
                                "to": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                "relationView": {
                                    "id": "4e2d2b20-556e-f0cd-372d-01ba03576c86",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "7645ce73-3114-051f-ba68-347a65424d71",
                                    "to": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "needReconnect": true
                                }
                            },
                            "9c149ba8-bab6-da4d-0eda-0f81dee788ae": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "9c149ba8-bab6-da4d-0eda-0f81dee788ae",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
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
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
                                    "visibility": "public",
                                    "name": "BookDisposed",
                                    "oldName": "",
                                    "displayName": "도서 폐기됨",
                                    "namePascalCase": "BookDisposed",
                                    "nameCamelCase": "bookDisposed",
                                    "namePlural": "",
                                    "description": "관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.",
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
                                        "id": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
                                        "x": 500,
                                        "y": 150,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
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
                                "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                "to": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
                                "relationView": {
                                    "id": "9c149ba8-bab6-da4d-0eda-0f81dee788ae",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "to": "f54b8b55-6f10-3c7c-f168-17082b4ee4d0",
                                    "needReconnect": true
                                }
                            },
                            "74ab6fd6-867f-e1b9-d3cf-3b48c5425f5a": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "74ab6fd6-867f-e1b9-d3cf-3b48c5425f5a",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
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
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                    "visibility": "public",
                                    "name": "LoanRequested",
                                    "oldName": "",
                                    "displayName": "대출 신청됨",
                                    "namePascalCase": "LoanRequested",
                                    "nameCamelCase": "loanRequested",
                                    "namePlural": "",
                                    "description": "회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.",
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
                                        "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
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
                                "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                "to": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                "relationView": {
                                    "id": "74ab6fd6-867f-e1b9-d3cf-3b48c5425f5a",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "to": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                    "needReconnect": true
                                }
                            },
                            "d9537c62-5fe7-173c-b775-4c7df7b95177": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "d9537c62-5fe7-173c-b775-4c7df7b95177",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
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
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "relationView": {
                                    "id": "d9537c62-5fe7-173c-b775-4c7df7b95177",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "needReconnect": true
                                }
                            },
                            "f3526ae7-65cb-e5fe-3172-543b5b2b3882": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "f3526ae7-65cb-e5fe-3172-543b5b2b3882",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
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
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                    "visibility": "public",
                                    "name": "BookReserved",
                                    "oldName": "",
                                    "displayName": "도서 예약됨",
                                    "namePascalCase": "BookReserved",
                                    "nameCamelCase": "bookReserved",
                                    "namePlural": "",
                                    "description": "회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.",
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
                                        "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
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
                                "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                "to": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                "relationView": {
                                    "id": "f3526ae7-65cb-e5fe-3172-543b5b2b3882",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "to": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                    "needReconnect": true
                                }
                            },
                            "3340c36f-f8a6-ba06-806b-ec9daa941e69": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "3340c36f-f8a6-ba06-806b-ec9daa941e69",
                                "name": "4",
                                "displayName": "4",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                    "visibility": "public",
                                    "name": "LoanRequested",
                                    "oldName": "",
                                    "displayName": "대출 신청됨",
                                    "namePascalCase": "LoanRequested",
                                    "nameCamelCase": "loanRequested",
                                    "namePlural": "",
                                    "description": "회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.",
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
                                        "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "visibility": "public",
                                    "name": "LoanApproved",
                                    "oldName": "",
                                    "displayName": "대출 완료됨",
                                    "namePascalCase": "LoanApproved",
                                    "nameCamelCase": "loanApproved",
                                    "namePlural": "",
                                    "description": "대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.",
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
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                        "x": 500,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
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
                                "from": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                "to": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                "relationView": {
                                    "id": "3340c36f-f8a6-ba06-806b-ec9daa941e69",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                    "to": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "needReconnect": true
                                }
                            },
                            "bb5f7eaf-3b42-cce0-a1f8-d3b42643eb21": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "bb5f7eaf-3b42-cce0-a1f8-d3b42643eb21",
                                "name": "4",
                                "displayName": "4",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                    "visibility": "public",
                                    "name": "LoanRequested",
                                    "oldName": "",
                                    "displayName": "대출 신청됨",
                                    "namePascalCase": "LoanRequested",
                                    "nameCamelCase": "loanRequested",
                                    "namePlural": "",
                                    "description": "회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.",
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
                                        "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                    "visibility": "public",
                                    "name": "BookReserved",
                                    "oldName": "",
                                    "displayName": "도서 예약됨",
                                    "namePascalCase": "BookReserved",
                                    "nameCamelCase": "bookReserved",
                                    "namePlural": "",
                                    "description": "회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.",
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
                                        "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
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
                                "from": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                "to": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                "relationView": {
                                    "id": "bb5f7eaf-3b42-cce0-a1f8-d3b42643eb21",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "65c7adb1-9c5e-8b68-610d-001a35e42a9f",
                                    "to": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                    "needReconnect": true
                                }
                            },
                            "f164a04a-9260-4eca-d69b-90fcfa273a25": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "f164a04a-9260-4eca-d69b-90fcfa273a25",
                                "name": "5",
                                "displayName": "5",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "visibility": "public",
                                    "name": "LoanApproved",
                                    "oldName": "",
                                    "displayName": "대출 완료됨",
                                    "namePascalCase": "LoanApproved",
                                    "nameCamelCase": "loanApproved",
                                    "namePlural": "",
                                    "description": "대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.",
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
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                        "x": 500,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                    "visibility": "public",
                                    "name": "LoanExtended",
                                    "oldName": "",
                                    "displayName": "대출 연장됨",
                                    "namePascalCase": "LoanExtended",
                                    "nameCamelCase": "loanExtended",
                                    "namePlural": "",
                                    "description": "회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.",
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
                                        "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                        "x": 900,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
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
                                "from": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                "to": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                "relationView": {
                                    "id": "f164a04a-9260-4eca-d69b-90fcfa273a25",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "to": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                    "needReconnect": true
                                }
                            },
                            "2fbc28b5-2758-2987-f25d-d40bdc378a06": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "2fbc28b5-2758-2987-f25d-d40bdc378a06",
                                "name": "5",
                                "displayName": "5",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "visibility": "public",
                                    "name": "LoanApproved",
                                    "oldName": "",
                                    "displayName": "대출 완료됨",
                                    "namePascalCase": "LoanApproved",
                                    "nameCamelCase": "loanApproved",
                                    "namePlural": "",
                                    "description": "대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.",
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
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                        "x": 500,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                "from": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "relationView": {
                                    "id": "2fbc28b5-2758-2987-f25d-d40bdc378a06",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "needReconnect": true
                                }
                            },
                            "ff36cfee-342f-580d-6ba1-d81d3353b502": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "ff36cfee-342f-580d-6ba1-d81d3353b502",
                                "name": "5",
                                "displayName": "5",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "visibility": "public",
                                    "name": "LoanApproved",
                                    "oldName": "",
                                    "displayName": "대출 완료됨",
                                    "namePascalCase": "LoanApproved",
                                    "nameCamelCase": "loanApproved",
                                    "namePlural": "",
                                    "description": "대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.",
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
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                        "x": 500,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                    "visibility": "public",
                                    "name": "LoanOverdueChecked",
                                    "oldName": "",
                                    "displayName": "연체 확인됨",
                                    "namePascalCase": "LoanOverdueChecked",
                                    "nameCamelCase": "loanOverdueChecked",
                                    "namePlural": "",
                                    "description": "반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.",
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
                                        "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                        "x": 700,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
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
                                "from": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                "to": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                "relationView": {
                                    "id": "ff36cfee-342f-580d-6ba1-d81d3353b502",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "2744e4e3-6792-0b2c-a980-88d5f6223aa0",
                                    "to": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                    "needReconnect": true
                                }
                            },
                            "3af6ac49-526c-88e5-18a9-603aac3955a3": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "3af6ac49-526c-88e5-18a9-603aac3955a3",
                                "name": "6",
                                "displayName": "6",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                    "visibility": "public",
                                    "name": "BookReserved",
                                    "oldName": "",
                                    "displayName": "도서 예약됨",
                                    "namePascalCase": "BookReserved",
                                    "nameCamelCase": "bookReserved",
                                    "namePlural": "",
                                    "description": "회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.",
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
                                        "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
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
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                "from": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "relationView": {
                                    "id": "3af6ac49-526c-88e5-18a9-603aac3955a3",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "d5816e58-5dff-6c9f-dd62-a75ff386d96e",
                                    "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "needReconnect": true
                                }
                            },
                            "a4d26a38-76bc-2b6c-e69a-b263bf2e68dd": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "a4d26a38-76bc-2b6c-e69a-b263bf2e68dd",
                                "name": "7",
                                "displayName": "7",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                    "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
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
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
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
                                "from": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "to": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                "relationView": {
                                    "id": "a4d26a38-76bc-2b6c-e69a-b263bf2e68dd",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "to": "a46f6438-cb9e-0f34-421f-f330bf8c862c",
                                    "needReconnect": true
                                }
                            },
                            "b8729c86-4796-87d8-dbf3-4213d63b087e": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "b8729c86-4796-87d8-dbf3-4213d63b087e",
                                "name": "7",
                                "displayName": "7",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                    "id": "7396f14a-6b12-f1b9-281d-99403365ed35",
                                    "visibility": "public",
                                    "name": "ReservationNotified",
                                    "oldName": "",
                                    "displayName": "예약자 통보됨",
                                    "namePascalCase": "ReservationNotified",
                                    "nameCamelCase": "reservationNotified",
                                    "namePlural": "",
                                    "description": "예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.",
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
                                        "id": "7396f14a-6b12-f1b9-281d-99403365ed35",
                                        "x": 900,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7396f14a-6b12-f1b9-281d-99403365ed35",
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
                                "from": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "to": "7396f14a-6b12-f1b9-281d-99403365ed35",
                                "relationView": {
                                    "id": "b8729c86-4796-87d8-dbf3-4213d63b087e",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "to": "7396f14a-6b12-f1b9-281d-99403365ed35",
                                    "needReconnect": true
                                }
                            },
                            "9367fe61-e2cf-532e-63f3-e1353df149f4": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "9367fe61-e2cf-532e-63f3-e1353df149f4",
                                "name": "8",
                                "displayName": "8",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                    "visibility": "public",
                                    "name": "LoanExtended",
                                    "oldName": "",
                                    "displayName": "대출 연장됨",
                                    "namePascalCase": "LoanExtended",
                                    "nameCamelCase": "loanExtended",
                                    "namePlural": "",
                                    "description": "회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.",
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
                                        "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                        "x": 900,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                    "visibility": "public",
                                    "name": "LoanOverdueChecked",
                                    "oldName": "",
                                    "displayName": "연체 확인됨",
                                    "namePascalCase": "LoanOverdueChecked",
                                    "nameCamelCase": "loanOverdueChecked",
                                    "namePlural": "",
                                    "description": "반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.",
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
                                        "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                        "x": 700,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
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
                                "from": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                "to": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                "relationView": {
                                    "id": "9367fe61-e2cf-532e-63f3-e1353df149f4",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                    "to": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                    "needReconnect": true
                                }
                            },
                            "aa2da206-6037-28ed-9679-a57be7c67afc": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "aa2da206-6037-28ed-9679-a57be7c67afc",
                                "name": "8",
                                "displayName": "8",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                    "visibility": "public",
                                    "name": "LoanExtended",
                                    "oldName": "",
                                    "displayName": "대출 연장됨",
                                    "namePascalCase": "LoanExtended",
                                    "nameCamelCase": "loanExtended",
                                    "namePlural": "",
                                    "description": "회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.",
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
                                        "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                        "x": 900,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7e172b4f-fc79-432c-0a91-24528abf36d8",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                "from": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "relationView": {
                                    "id": "aa2da206-6037-28ed-9679-a57be7c67afc",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "7e172b4f-fc79-432c-0a91-24528abf36d8",
                                    "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "needReconnect": true
                                }
                            },
                            "c45ebe16-87aa-7d48-f71e-3cec393fe765": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "c45ebe16-87aa-7d48-f71e-3cec393fe765",
                                "name": "9",
                                "displayName": "9",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                    "visibility": "public",
                                    "name": "LoanOverdueChecked",
                                    "oldName": "",
                                    "displayName": "연체 확인됨",
                                    "namePascalCase": "LoanOverdueChecked",
                                    "nameCamelCase": "loanOverdueChecked",
                                    "namePlural": "",
                                    "description": "반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.",
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
                                        "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                        "x": 700,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "88218e81-cf65-8b25-1222-001fba8aa5ff",
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
                                "targetElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
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
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                "from": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
                                "relationView": {
                                    "id": "c45ebe16-87aa-7d48-f71e-3cec393fe765",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "88218e81-cf65-8b25-1222-001fba8aa5ff",
                                    "to": "2591d6ce-91a8-4278-4fb5-edb44f3de821",
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
                                "displayName": "도서 등록됨",
                                "actor": "도서관리자",
                                "level": 1,
                                "description": "관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.",
                                "inputs": [
                                    "도서명",
                                    "ISBN",
                                    "저자",
                                    "출판사",
                                    "카테고리 (소설/비소설/학술/잡지)",
                                    "ISBN 중복 없음",
                                    "ISBN 13자리"
                                ],
                                "outputs": [
                                    "도서 엔티티 생성",
                                    "도서 상태: 대출가능"
                                ],
                                "nextEvents": [
                                    "BookStateChanged"
                                ]
                            },
                            {
                                "name": "BookStateChanged",
                                "displayName": "도서 상태 변경됨",
                                "actor": "도서관리시스템",
                                "level": 2,
                                "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
                                "inputs": [
                                    "도서 이벤트 트리거",
                                    "이전 도서 상태"
                                ],
                                "outputs": [
                                    "도서 상태: 대출가능/대출중/예약중/폐기"
                                ],
                                "nextEvents": [
                                    "BookDisposed",
                                    "LoanRequested",
                                    "LoanReturned",
                                    "BookReserved"
                                ]
                            },
                            {
                                "name": "BookDisposed",
                                "displayName": "도서 폐기됨",
                                "actor": "도서관리자",
                                "level": 3,
                                "description": "관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.",
                                "inputs": [
                                    "도서 식별",
                                    "훼손/분실 사유"
                                ],
                                "outputs": [
                                    "도서 상태: 폐기"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanRequested",
                                "displayName": "대출 신청됨",
                                "actor": "회원",
                                "level": 4,
                                "description": "회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.",
                                "inputs": [
                                    "회원번호",
                                    "이름",
                                    "도서명/ISBN",
                                    "대출 가능 상태 도서",
                                    "대출 기간(7/14/30일)"
                                ],
                                "outputs": [
                                    "대출 신청 생성",
                                    "대출 대기 상태"
                                ],
                                "nextEvents": [
                                    "LoanApproved",
                                    "BookReserved"
                                ]
                            },
                            {
                                "name": "LoanApproved",
                                "displayName": "대출 완료됨",
                                "actor": "도서관리시스템",
                                "level": 5,
                                "description": "대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.",
                                "inputs": [
                                    "대출 신청",
                                    "대출 가능 도서",
                                    "회원 자격 유효"
                                ],
                                "outputs": [
                                    "대출 기록 생성",
                                    "도서 상태: 대출중",
                                    "대출일",
                                    "반납예정일"
                                ],
                                "nextEvents": [
                                    "LoanExtended",
                                    "LoanReturned",
                                    "LoanOverdueChecked"
                                ]
                            },
                            {
                                "name": "BookReserved",
                                "displayName": "도서 예약됨",
                                "actor": "회원",
                                "level": 6,
                                "description": "회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.",
                                "inputs": [
                                    "회원번호",
                                    "이름",
                                    "대출중 상태 도서"
                                ],
                                "outputs": [
                                    "예약 기록 생성",
                                    "도서 상태: 예약중"
                                ],
                                "nextEvents": [
                                    "LoanReturned"
                                ]
                            },
                            {
                                "name": "LoanReturned",
                                "displayName": "도서 반납됨",
                                "actor": "회원",
                                "level": 7,
                                "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
                                "inputs": [
                                    "대출 중 도서",
                                    "회원"
                                ],
                                "outputs": [
                                    "반납 기록 생성",
                                    "도서 상태: 대출가능/예약중"
                                ],
                                "nextEvents": [
                                    "BookStateChanged",
                                    "ReservationNotified"
                                ]
                            },
                            {
                                "name": "LoanExtended",
                                "displayName": "대출 연장됨",
                                "actor": "회원",
                                "level": 8,
                                "description": "회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.",
                                "inputs": [
                                    "회원",
                                    "대출중 상태 도서",
                                    "연장 조건 충족"
                                ],
                                "outputs": [
                                    "반납예정일 변경"
                                ],
                                "nextEvents": [
                                    "LoanOverdueChecked",
                                    "LoanReturned"
                                ]
                            },
                            {
                                "name": "LoanOverdueChecked",
                                "displayName": "연체 확인됨",
                                "actor": "도서관리시스템",
                                "level": 9,
                                "description": "반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.",
                                "inputs": [
                                    "대출중 도서",
                                    "현재 일자",
                                    "반납예정일"
                                ],
                                "outputs": [
                                    "대출 상태: 연체"
                                ],
                                "nextEvents": [
                                    "LoanReturned"
                                ]
                            },
                            {
                                "name": "ReservationNotified",
                                "displayName": "예약자 통보됨",
                                "actor": "도서관리시스템",
                                "level": 10,
                                "description": "예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.",
                                "inputs": [
                                    "도서 반납",
                                    "예약자 존재"
                                ],
                                "outputs": [
                                    "예약자 알림"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookHistoryQueried",
                                "displayName": "도서 이력 조회됨",
                                "actor": "도서관리자",
                                "level": 11,
                                "description": "관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.",
                                "inputs": [
                                    "도서 식별자"
                                ],
                                "outputs": [
                                    "도서 대출 이력 목록",
                                    "도서 상태 변경 이력 목록"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanStatusQueried",
                                "displayName": "대출 현황 조회됨",
                                "actor": "도서관리자",
                                "level": 12,
                                "description": "현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.",
                                "inputs": [
                                    "조회 조건 (전체/회원별/도서별)"
                                ],
                                "outputs": [
                                    "대출 건 목록",
                                    "각 대출 상태"
                                ],
                                "nextEvents": []
                            }
                        ],
                        "actors": [
                            {
                                "name": "도서관리자",
                                "events": [
                                    "BookRegistered",
                                    "BookDisposed",
                                    "BookHistoryQueried",
                                    "LoanStatusQueried"
                                ],
                                "lane": 0
                            },
                            {
                                "name": "회원",
                                "events": [
                                    "LoanRequested",
                                    "BookReserved",
                                    "LoanReturned",
                                    "LoanExtended"
                                ],
                                "lane": 1
                            },
                            {
                                "name": "도서관리시스템",
                                "events": [
                                    "BookStateChanged",
                                    "LoanApproved",
                                    "LoanOverdueChecked",
                                    "ReservationNotified"
                                ],
                                "lane": 2
                            }
                        ]
                    },
                    "currentGeneratedLength": 5858
                },
                "currentGeneratedLength": 0,
                "timestamp": "2025-06-02T02:24:14.450Z"
            },
            {
                "uniqueId": "ec0fd783d838635fad74985f3275e499",
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
                "timestamp": "2025-06-02T02:24:46.717Z"
            },
            {
                "uniqueId": "295699341285b38ad47096f8456737b0",
                "type": "boundedContextResult",
                "result": {
                    "도메인 복잡도 분리+프로세스(value stream) 기반 분리": {
                        "boundedContexts": [
                            {
                                "name": "LibraryBookManagement",
                                "alias": "도서관리",
                                "importance": "Core Domain",
                                "complexity": 0.8,
                                "differentiation": 0.95,
                                "implementationStrategy": "Rich Domain Model",
                                "aggregates": [
                                    {
                                        "name": "Book",
                                        "alias": "도서"
                                    }
                                ],
                                "events": [
                                    "BookRegistered",
                                    "BookStateChanged",
                                    "BookDisposed",
                                    "BookHistoryQueried"
                                ],
                                "requirements": [
                                    {
                                        "type": "userStory",
                                        "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                                    },
                                    {
                                        "type": "userStory",
                                        "text": "각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해."
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}"
                                    }
                                ],
                                "role": "도서 등록, ISBN 중복 및 유효성 검사, 도서 상태 관리(대출가능/대출중/예약중/폐기), 도서 상태 변경 이력 추적, 도서의 폐기 처리 등 도서의 전체 수명 주기와 관련된 업무를 담당한다. 도서와 직접적으로 연관된 복잡한 비즈니스 규칙을 다루며, 사용자가 도서 등록, 상태 관리, 이력 조회 등 주도적으로 사용할 수 있다."
                            },
                            {
                                "name": "LibraryLoanProcess",
                                "alias": "대출/반납",
                                "importance": "Core Domain",
                                "complexity": 0.85,
                                "differentiation": 0.95,
                                "implementationStrategy": "Rich Domain Model",
                                "aggregates": [
                                    {
                                        "name": "Loan",
                                        "alias": "대출"
                                    },
                                    {
                                        "name": "Reservation",
                                        "alias": "예약"
                                    }
                                ],
                                "events": [
                                    "LoanRequested",
                                    "LoanApproved",
                                    "LoanReturned",
                                    "LoanExtended",
                                    "LoanOverdueChecked",
                                    "BookReserved",
                                    "ReservationNotified",
                                    "LoanStatusQueried"
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
                                        "text": "{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}"
                                    }
                                ],
                                "role": "도서 대출 신청, 회원 확인, 도서 검색, 대출 처리 및 상태 변경, 대출 연장/반납/연체 관리, 예약 처리 및 예약자 알림, 대출 현황 조회 등 도서의 대출-반납 및 예약 관련 전체 프로세스를 책임진다. 회원과 도서의 상호작용, 대출/반납/연장/예약 등 복잡한 프로세스 흐름을 포함하며, 각종 정책과 상태 변화에 따라 동작한다."
                            }
                        ],
                        "relations": [
                            {
                                "name": "BookStatusEventPubSub",
                                "type": "Pub/Sub",
                                "upStream": {
                                    "name": "LibraryLoanProcess",
                                    "alias": "대출/반납"
                                },
                                "downStream": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리"
                                }
                            },
                            {
                                "name": "BookInfoQueryPubSub",
                                "type": "Pub/Sub",
                                "upStream": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리"
                                },
                                "downStream": {
                                    "name": "LibraryLoanProcess",
                                    "alias": "대출/반납"
                                }
                            }
                        ],
                        "thoughts": "본 분리는 도메인 복잡도와 value stream(업무 프로세스) 기반으로 이루어졌다. 도서관리(도서의 등록, 폐기, 상태 관리, 이력 관리)는 도서의 라이프사이클 및 마스터 데이터 관리라는 관점에서 하나의 높은 응집도를 가지는 코어 도메인으로 분리하였다. 반면, 대출/반납은 회원과 도서의 상호작용, 대출-반납-연장-예약-알림 등 일련의 업무 흐름과 정책을 주도하는 프로세스 기반의 코어 도메인으로 독립적으로 분리하였다. 두 컨텍스트 모두 고도의 비즈니스 규칙과 UI/사용자 주도 프로세스를 내포하므로 Core Domain으로 분류했다. 인프라 측면에서, 현재 요구사항과 주어진 PBC 내에서는 도메인에 직접 대응되는 PBC가 없어 독자적 Rich Domain Model 전략을 채택하였다. 각 컨텍스트 간 결합도를 낮추기 위해 Pub/Sub 이벤트 기반 통신 패턴을 도입하였다(예: 대출 완료 시 도서 상태 변경 이벤트 발행, 도서 정보 변경 시 대출 컨텍스트에 동기화 등). 이를 통해 컨텍스트별 역할과 책임의 명확한 분리와 함께 시스템 확장성 및 유지보수성을 높일 수 있다.",
                        "explanations": [
                            {
                                "sourceContext": "대출/반납",
                                "targetContext": "도서관리",
                                "relationType": "Pub/Sub",
                                "reason": "대출/반납 컨텍스트에서 대출, 반납, 예약 등의 이벤트가 발생하면 도서의 상태를 변경해야 하므로, 이벤트 발행을 통해 도서관리 컨텍스트에 상태 변경을 알린다. 이 방식은 결합도를 낮추고 유연한 확장을 가능하게 한다.",
                                "interactionPattern": "대출/반납 컨텍스트에서 도서 상태 변경 이벤트를 발행하면 도서관리 컨텍스트가 구독하여 처리(Pub/Sub, 예: 메시지 브로커 사용)한다."
                            },
                            {
                                "sourceContext": "도서관리",
                                "targetContext": "대출/반납",
                                "relationType": "Pub/Sub",
                                "reason": "도서관리 컨텍스트에서 도서 정보가 변경(등록/폐기 등)될 경우, 대출/반납 컨텍스트가 해당 정보를 반영할 수 있도록 Pub/Sub 이벤트를 활용한다.",
                                "interactionPattern": "도서관리 컨텍스트가 도서 정보 이벤트를 발행하면, 대출/반납 컨텍스트가 이를 구독해 자신의 로컬 데이터/캐시를 동기화한다."
                            }
                        ],
                        "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                        "currentGeneratedLength": 3981
                    }
                },
                "isStartMapping": false,
                "isGeneratingBoundedContext": false,
                "isSummarizeStarted": false,
                "isAnalizing": false,
                "processingRate": 100,
                "currentProcessingBoundedContext": "대출/반납",
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
                "timestamp": "2025-06-02T02:24:51.448Z"
            },
            {
                "type": "aggregateDraftDialogDto",
                "uniqueId": "1748831135040",
                "isShow": true,
                "draftOptions": [
                    {
                        "boundedContext": "LibraryBookManagement",
                        "boundedContextAlias": "도서관리",
                        "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"도서관리자는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 새로운 도서를 등록할 수 있고, 등록된 도서의 상태를 관리할 수 있다.\",\"acceptance\":[\"ISBN은 13자리 숫자이며 중복되지 않아야 한다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.\",\"도서 등록 시 상태는 '대출가능'이 된다.\",\"도서 상태는 대출/반납/예약/폐기 등의 이벤트에 따라 자동으로 변경된다.\",\"폐기된 도서는 대출이 불가능하다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서관리자 또는 회원은 특정 도서의 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 파악할 수 있다.\",\"acceptance\":[\"도서별로 대출 이력과 상태 변경 이력을 각각 조회할 수 있다.\",\"이력에는 상태 변경 일시 및 사유가 명시되어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"loanHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"memberId\",\"type\":\"Long\",\"required\":true}]},\"BookStateHistory\":{\"properties\":[{\"name\":\"stateHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"newStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN 유효성 검증\",\"description\":\"ISBN은 13자리 숫자여야 하며, 시스템 내에서 중복될 수 없다.\"},{\"name\":\"도서 상태 자동 전이\",\"description\":\"도서 등록 시 상태는 자동으로 '대출가능'으로 지정되고, 대출/반납/예약/폐기 등 이벤트 발생 시 상태가 자동으로 변경된다.\"},{\"name\":\"폐기 도서 대출 불가\",\"description\":\"폐기 상태의 도서는 어떠한 경우에도 대출 처리될 수 없다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"중복확인\",\"도서등록\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록 및 상태 관리\",\"type\":\"table\",\"fields\":[],\"actions\":[\"대출처리\",\"반납처리\",\"예약처리\",\"폐기처리\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"loanDate\",\"returnDate\",\"memberId\"],\"actions\":[]}},{\"name\":\"상태 변경 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"previousStatus\",\"newStatus\",\"changedAt\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"displayName\":\"도서 등록됨\"},{\"name\":\"BookStateChanged\",\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"displayName\":\"도서 상태 변경됨\"},{\"name\":\"BookDisposed\",\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"displayName\":\"도서 폐기됨\"},{\"name\":\"BookHistoryQueried\",\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"displayName\":\"도서 이력 조회됨\"}]}",
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
                                                "name": "LoanReference",
                                                "alias": "대출 참조",
                                                "referencedAggregate": {
                                                    "name": "Loan",
                                                    "alias": "대출"
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
                                    }
                                ],
                                "pros": {
                                    "cohesion": "도서 정보와 상태, 외부 참조(대출/예약)가 한 Aggregate에 집중되어 있어 단일 책임 원칙을 잘 지킴.",
                                    "coupling": "이력 관리가 Book 내부에서 처리되어 다른 Aggregate와의 상호작용이 필요 없어 의존성이 낮음.",
                                    "consistency": "도서 상태 변경 및 이력 기록을 하나의 트랜잭션으로 처리하여 도메인 불변식과 원자성을 강하게 보장함.",
                                    "encapsulation": "비즈니스 규칙(예: ISBN 검증, 폐기 도서 대출 불가 등)을 Book 내부에서 완전하게 감춤.",
                                    "complexity": "모든 도서 관련 기능이 하나의 Aggregate에 모여 있어 구조가 단순하고 이해하기 쉬움.",
                                    "independence": "Book의 구조가 다른 컨텍스트(Aggregate)에 거의 영향받지 않으므로 독립적으로 진화 가능.",
                                    "performance": "도서 및 이력 조회가 단일 Aggregate 내에서 일어나 I/O 오버헤드가 적고, 실시간 상태 변경에 유리함."
                                },
                                "cons": {
                                    "cohesion": "상태 변경/대출 이력 데이터가 쌓이면 Book의 크기가 커지고, Aggregate가 비대해질 수 있음.",
                                    "coupling": "장기적으로 이력 테이블이 방대해질 경우 도서 데이터와 이력 데이터가 불필요하게 결합됨.",
                                    "consistency": "고빈도 이력 변경 시 하나의 트랜잭션 범위가 커져 동시성 문제나 확장성 저하 우려.",
                                    "encapsulation": "이력 처리 로직이 Book 내에 내포되어 있어, 이력 정책이 변경되면 도서 비즈니스 로직과 혼재될 수 있음.",
                                    "complexity": "이력 데이터와 도서 데이터 동시 관리로 인해 일부 도메인 규칙이 복잡해질 수 있음.",
                                    "independence": "Book 변경이 많아질수록, 이력 관련 기능을 분리·진화하기 어려움.",
                                    "performance": "도서별 이력 데이터가 많아질수록 Book Aggregate 조회 성능이 저하될 수 있음."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리",
                                    "displayName": "도서관리",
                                    "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ]
                                },
                                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"도서관리자는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 새로운 도서를 등록할 수 있고, 등록된 도서의 상태를 관리할 수 있다.\",\"acceptance\":[\"ISBN은 13자리 숫자이며 중복되지 않아야 한다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.\",\"도서 등록 시 상태는 '대출가능'이 된다.\",\"도서 상태는 대출/반납/예약/폐기 등의 이벤트에 따라 자동으로 변경된다.\",\"폐기된 도서는 대출이 불가능하다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서관리자 또는 회원은 특정 도서의 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 파악할 수 있다.\",\"acceptance\":[\"도서별로 대출 이력과 상태 변경 이력을 각각 조회할 수 있다.\",\"이력에는 상태 변경 일시 및 사유가 명시되어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"loanHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"memberId\",\"type\":\"Long\",\"required\":true}]},\"BookStateHistory\":{\"properties\":[{\"name\":\"stateHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"newStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN 유효성 검증\",\"description\":\"ISBN은 13자리 숫자여야 하며, 시스템 내에서 중복될 수 없다.\"},{\"name\":\"도서 상태 자동 전이\",\"description\":\"도서 등록 시 상태는 자동으로 '대출가능'으로 지정되고, 대출/반납/예약/폐기 등 이벤트 발생 시 상태가 자동으로 변경된다.\"},{\"name\":\"폐기 도서 대출 불가\",\"description\":\"폐기 상태의 도서는 어떠한 경우에도 대출 처리될 수 없다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"중복확인\",\"도서등록\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록 및 상태 관리\",\"type\":\"table\",\"fields\":[],\"actions\":[\"대출처리\",\"반납처리\",\"예약처리\",\"폐기처리\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"loanDate\",\"returnDate\",\"memberId\"],\"actions\":[]}},{\"name\":\"상태 변경 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"previousStatus\",\"newStatus\",\"changedAt\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"displayName\":\"도서 등록됨\"},{\"name\":\"BookStateChanged\",\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"displayName\":\"도서 상태 변경됨\"},{\"name\":\"BookDisposed\",\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"displayName\":\"도서 폐기됨\"},{\"name\":\"BookHistoryQueried\",\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"displayName\":\"도서 이력 조회됨\"}]}"
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
                                            "name": "BookHistory",
                                            "alias": "도서 이력"
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
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "도서와 이력 기능이 분리되어 각각 핵심 역할에 집중할 수 있음.",
                                    "coupling": "도서와 이력 간의 의존성이 ValueObject(참조) 수준으로 낮아집니다.",
                                    "consistency": "도서 트랜잭션과 이력 기록이 분리되어, 대용량 이력에도 안정적으로 대응 가능.",
                                    "encapsulation": "이력 관련 정책이나 확장(예: 다양한 이력 종류 추가)이 Book과 분리되어 독립적으로 변경 가능.",
                                    "complexity": "이력 관리 로직이 별도 Aggregate에 있어 도서 관리가 단순해지고, 이해하기 쉬움.",
                                    "independence": "이력 저장방식이나 보존정책 변경 시 도서 Aggregate에 영향 없음.",
                                    "performance": "도서 데이터와 이력 데이터를 분리 저장 및 조회할 수 있어 대량 이력에도 성능 저하가 없음."
                                },
                                "cons": {
                                    "cohesion": "상태 변경과 이력 기록이 분산되어 있어 단일 도서 관리 흐름이 단순하지 않을 수 있음.",
                                    "coupling": "이력 기록 시 도서의 참조를 유지해야 하므로 약간의 간접적인 결합이 존재함.",
                                    "consistency": "상태 변경과 이력 기록이 각각 별도의 트랜잭션에서 발생할 수 있어, 일시적으로 불일치 상태가 발생 가능.",
                                    "encapsulation": "도서 상태 변경이 이력과 분리되어 이력 누락/오류를 방지하는 추가적 방어 코드가 필요함.",
                                    "complexity": "이력 데이터 연동, 조회 시 cross-aggregate 처리 로직(조인 등)이 추가됨.",
                                    "independence": "도서 삭제 등 라이프사이클 정책이 이력 데이터와 동기화되어야 하므로 관리 포인트가 증가함.",
                                    "performance": "도서와 이력을 함께 조회할 경우 두 Aggregate를 동시에 접근해야 하므로 I/O가 증가함."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리",
                                    "displayName": "도서관리",
                                    "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ]
                                },
                                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"도서관리자는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 새로운 도서를 등록할 수 있고, 등록된 도서의 상태를 관리할 수 있다.\",\"acceptance\":[\"ISBN은 13자리 숫자이며 중복되지 않아야 한다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.\",\"도서 등록 시 상태는 '대출가능'이 된다.\",\"도서 상태는 대출/반납/예약/폐기 등의 이벤트에 따라 자동으로 변경된다.\",\"폐기된 도서는 대출이 불가능하다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서관리자 또는 회원은 특정 도서의 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 파악할 수 있다.\",\"acceptance\":[\"도서별로 대출 이력과 상태 변경 이력을 각각 조회할 수 있다.\",\"이력에는 상태 변경 일시 및 사유가 명시되어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"loanHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"memberId\",\"type\":\"Long\",\"required\":true}]},\"BookStateHistory\":{\"properties\":[{\"name\":\"stateHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"newStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN 유효성 검증\",\"description\":\"ISBN은 13자리 숫자여야 하며, 시스템 내에서 중복될 수 없다.\"},{\"name\":\"도서 상태 자동 전이\",\"description\":\"도서 등록 시 상태는 자동으로 '대출가능'으로 지정되고, 대출/반납/예약/폐기 등 이벤트 발생 시 상태가 자동으로 변경된다.\"},{\"name\":\"폐기 도서 대출 불가\",\"description\":\"폐기 상태의 도서는 어떠한 경우에도 대출 처리될 수 없다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"중복확인\",\"도서등록\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록 및 상태 관리\",\"type\":\"table\",\"fields\":[],\"actions\":[\"대출처리\",\"반납처리\",\"예약처리\",\"폐기처리\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"loanDate\",\"returnDate\",\"memberId\"],\"actions\":[]}},{\"name\":\"상태 변경 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"previousStatus\",\"newStatus\",\"changedAt\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"displayName\":\"도서 등록됨\"},{\"name\":\"BookStateChanged\",\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"displayName\":\"도서 상태 변경됨\"},{\"name\":\"BookDisposed\",\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"displayName\":\"도서 폐기됨\"},{\"name\":\"BookHistoryQueried\",\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"displayName\":\"도서 이력 조회됨\"}]}"
                            }
                        ],
                        "conclusions": "옵션1은 단일 Aggregate 내에서 도서 관리와 이력 기능까지 모두 처리할 때 적합합니다. 이 방식은 트랜잭션 일관성과 간단한 구조가 중요하거나, 이력 데이터량이 크지 않을 때 효과적입니다. 옵션2는 도서 관리와 이력 데이터 관리가 별도로 진화·확장될 필요가 있거나, 이력 데이터가 폭증할 수 있는 대규모 도서관 시스템에 적합합니다. 이 경우 도서 데이터와 이력 데이터를 독립적으로 최적화할 수 있으나, 도서 상태와 이력의 강력한 일관성이 반드시 필요할 때는 추가적인 설계 보완이 요구됩니다.",
                        "defaultOptionIndex": 1,
                        "analysisResult": {
                            "userStories": [
                                {
                                    "title": "도서 등록 및 관리",
                                    "description": "도서관리자는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 새로운 도서를 등록할 수 있고, 등록된 도서의 상태를 관리할 수 있다.",
                                    "acceptance": [
                                        "ISBN은 13자리 숫자이며 중복되지 않아야 한다.",
                                        "카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.",
                                        "도서 등록 시 상태는 '대출가능'이 된다.",
                                        "도서 상태는 대출/반납/예약/폐기 등의 이벤트에 따라 자동으로 변경된다.",
                                        "폐기된 도서는 대출이 불가능하다."
                                    ]
                                },
                                {
                                    "title": "도서별 이력 조회",
                                    "description": "도서관리자 또는 회원은 특정 도서의 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 파악할 수 있다.",
                                    "acceptance": [
                                        "도서별로 대출 이력과 상태 변경 이력을 각각 조회할 수 있다.",
                                        "이력에는 상태 변경 일시 및 사유가 명시되어야 한다."
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
                                            "name": "isbn",
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
                                            "name": "loanHistoryId",
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
                                            "name": "loanDate",
                                            "type": "Date",
                                            "required": true
                                        },
                                        {
                                            "name": "returnDate",
                                            "type": "Date"
                                        },
                                        {
                                            "name": "memberId",
                                            "type": "Long",
                                            "required": true
                                        }
                                    ]
                                },
                                "BookStateHistory": {
                                    "properties": [
                                        {
                                            "name": "stateHistoryId",
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
                                            "name": "previousStatus",
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
                                            "name": "newStatus",
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
                                            "name": "reason",
                                            "type": "String"
                                        }
                                    ]
                                }
                            },
                            "businessRules": [
                                {
                                    "name": "ISBN 유효성 검증",
                                    "description": "ISBN은 13자리 숫자여야 하며, 시스템 내에서 중복될 수 없다."
                                },
                                {
                                    "name": "도서 상태 자동 전이",
                                    "description": "도서 등록 시 상태는 자동으로 '대출가능'으로 지정되고, 대출/반납/예약/폐기 등 이벤트 발생 시 상태가 자동으로 변경된다."
                                },
                                {
                                    "name": "폐기 도서 대출 불가",
                                    "description": "폐기 상태의 도서는 어떠한 경우에도 대출 처리될 수 없다."
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
                                                    "name": "isbn",
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
                                                "중복확인",
                                                "도서등록"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "도서 목록 및 상태 관리",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [
                                                "대출처리",
                                                "반납처리",
                                                "예약처리",
                                                "폐기처리"
                                            ],
                                            "filters": [
                                                "카테고리",
                                                "상태"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "bookId",
                                                    "title",
                                                    "isbn",
                                                    "author",
                                                    "publisher",
                                                    "category",
                                                    "status"
                                                ],
                                                "actions": [
                                                    "상세보기"
                                                ]
                                            }
                                        }
                                    ]
                                },
                                "BookHistory": {
                                    "sections": [
                                        {
                                            "name": "도서 이력 조회",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [],
                                            "filters": [
                                                "도서ID"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "loanDate",
                                                    "returnDate",
                                                    "memberId"
                                                ],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "상태 변경 이력 조회",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [],
                                            "filters": [
                                                "도서ID"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "previousStatus",
                                                    "newStatus",
                                                    "changedAt",
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
                                    "description": "관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.",
                                    "displayName": "도서 등록됨"
                                },
                                {
                                    "name": "BookStateChanged",
                                    "description": "도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.",
                                    "displayName": "도서 상태 변경됨"
                                },
                                {
                                    "name": "BookDisposed",
                                    "description": "관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.",
                                    "displayName": "도서 폐기됨"
                                },
                                {
                                    "name": "BookHistoryQueried",
                                    "description": "관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.",
                                    "displayName": "도서 이력 조회됨"
                                }
                            ],
                            "inference": "사용자 요구사항에 따라 도서 등록, 상태 변경, 이력 관리 기능이 필요하며, ISBN의 13자리 숫자 및 중복 검증, 상태별 도서 대출 가능 여부, 카테고리 선택, 각 도서별 대출·상태 이력 추적이 명확하게 도출됨. 이벤트 정의로부터 시스템의 상태 전이 흐름 및 행위 주체(관리자/시스템)도 반영함. 상태 전이에 따른 도서 대출 가능/불가, 폐기 도서 예외처리, 데이터 모델에 대한 명확한 속성 정의와 검증 필요."
                        },
                        "inference": "\n\n기능 요구사항과 비즈니스 규칙, 기존 적재된 도메인 모델을 분석하였습니다. 도서는 상태 관리와 이력 추적의 핵심 단위이므로 Book을 반드시 Aggregate로 정의해야 하며, 대출 및 예약은 이미 LibraryLoanProcess 컨텍스트에서 관리되므로 직접적으로 생성하지 않고 참조 형태로 ValueObject로 처리합니다. 이력(대출/상태변경)을 Book Aggregate에 통합하거나, 별도의 이력 Aggregate로 분리하여 설계안을 마련했습니다. 각 옵션은 Aggregate 수의 차이와 경계에 따라 이력관리의 일관성, 유지보수성, 성능 및 도메인 확장성 측면에서 명확히 구분됩니다."
                    },
                    {
                        "boundedContext": "LibraryLoanProcess",
                        "boundedContextAlias": "대출/반납",
                        "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 본인의 회원번호와 이름을 통해 확인받고, 도서명 또는 ISBN으로 도서를 검색하여 대출을 신청할 수 있다. 이미 대출중인 도서는 예약 신청이 가능하다. 도서 대출 완료 시 도서 상태는 자동으로 '대출중'으로 변경된다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인이 가능하다.\",\"도서명 또는 ISBN으로 도서 검색이 가능하다.\",\"대출 가능 상태의 도서만 대출 신청이 가능하다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 '대출중'으로 자동 변경된다.\"]},{\"title\":\"대출 현황 조회 및 관리\",\"description\":\"도서관리자는 '대출 현황' 화면에서 현재 대출 중인 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 건별로 연장 또는 반납 처리를 할 수 있다.\",\"acceptance\":[\"대출 건의 대출일, 반납예정일, 상태가 표시된다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"도서 반납 시 예약자가 있으면 상태가 '예약중', 없으면 '대출가능'으로 변경된다.\",\"대출 상태는 '대출중', '연체', '반납완료'가 존재한다.\"]},{\"title\":\"도서별 대출 및 상태 이력 조회\",\"description\":\"관리자는 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"각 도서별로 대출 이력과 상태 변경 이력이 조회된다.\",\"대출 이력에는 대출일, 반납일, 연장, 연체 정보가 포함된다.\",\"상태 이력에는 상태 변경 일시와 변경 내용이 포함된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"loanStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]},{\"name\":\"extendCount\",\"type\":\"Integer\"}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]},{\"name\":\"changeDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 가능 상태 확인\",\"description\":\"도서 상태가 AVAILABLE인 경우에만 대출 신청이 가능하다.\"},{\"name\":\"대출 중 도서 예약\",\"description\":\"도서 상태가 ON_LOAN일 때만 예약 신청이 가능하다.\"},{\"name\":\"대출 기간 선택\",\"description\":\"대출 신청 시 7일, 14일, 30일 중에서 대출 기간을 선택해야 한다.\"},{\"name\":\"연장 제한\",\"description\":\"대출 연장은 정책에 따라 1회 또는 제한 횟수만큼만 가능하다.\"},{\"name\":\"반납 시 도서 상태 전환\",\"description\":\"도서 반납 후 예약자가 있으면 상태를 RESERVED, 없으면 AVAILABLE로 변경한다.\"},{\"name\":\"연체 처리\",\"description\":\"반납 예정일이 경과하면 도서의 대출 상태를 OVERDUE로 변경한다.\"},{\"name\":\"상태 변경 이력 기록\",\"description\":\"모든 도서의 상태 변경은 BookStatusHistory에 기록된다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 선택\",\"type\":\"form\",\"fields\":[{\"name\":\"titleOrIsbn\",\"type\":\"text\",\"required\":true}],\"actions\":[\"도서 검색\"],\"filters\":[],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"status\"],\"actions\":[\"도서 선택\"]}},{\"name\":\"대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"예약 신청\",\"type\":\"form\",\"fields\":[],\"actions\":[\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatusScreen\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장 신청\",\"반납 처리\"],\"filters\":[\"전체/회원별/도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"bookId\",\"loanDate\",\"dueDate\",\"loanStatus\"],\"actions\":[\"상세 조회\"]}}]},\"BookHistoryScreen\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"loanStatus\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"historyId\",\"status\",\"changeDate\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"LoanRequested\",\"description\":\"회원이 도서명 또는 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"displayName\":\"대출 신청됨\"},{\"name\":\"LoanApproved\",\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"displayName\":\"대출 완료됨\"},{\"name\":\"BookReserved\",\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"displayName\":\"도서 예약됨\"},{\"name\":\"LoanReturned\",\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"displayName\":\"도서 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"displayName\":\"대출 연장됨\"},{\"name\":\"LoanOverdueChecked\",\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"displayName\":\"연체 확인됨\"},{\"name\":\"ReservationNotified\",\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"displayName\":\"예약자 통보됨\"},{\"name\":\"LoanStatusQueried\",\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"displayName\":\"대출 현황 조회됨\"}]}",
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
                                    "cohesion": "Loan은 대출 처리와 연장, 반납, 연체 등 대출과 관련된 모든 불변성을 보장하며, Reservation은 예약 업무에 집중하여 책임 분리가 명확하다.",
                                    "coupling": "Book, Member는 ValueObject 참조로만 연결하여 도메인 간 의존성을 최소화하였다.",
                                    "consistency": "대출-예약 각각의 트랜잭션 경계 내에서 불변성이 확실하게 보장되어, 동시성 오류나 중복 상태 변동 위험이 낮다.",
                                    "encapsulation": "각 Aggregate 내부에 핵심 도메인 규칙을 은닉하여 외부로부터 변경이 차단된다.",
                                    "complexity": "Aggregate 수가 적어 구조가 단순하고, 개발 및 유지보수가 용이하다.",
                                    "independence": "대출과 예약 업무가 별개로 확장, 유지보수될 수 있다.",
                                    "performance": "대출/예약 별로 데이터 처리 경로가 단순하여 쿼리 성능이 우수하다."
                                },
                                "cons": {
                                    "cohesion": "Book 상태 변경 및 이력 관리가 별도 Aggregate(Book, BookHistory)로 분리되어 응집도가 분산될 수 있다.",
                                    "coupling": "Book 상태 변경, 이력 기록은 LibraryBookManagement에 위임되어, 두 컨텍스트 간 통신/연동이 필요하다.",
                                    "consistency": "대출, 반납 등과 Book 상태변경, 이력저장이 다른 트랜잭션으로 처리되어 일관성 유지 로직이 추가적으로 필요하다.",
                                    "encapsulation": "Book/BookHistory의 내부 규칙을 직접 캡슐화하지 못하고 외부 연동에 의존한다.",
                                    "complexity": "업무 플로우가 컨텍스트를 넘나들 때 비즈니스 오케스트레이션 로직이 추가로 요구된다.",
                                    "independence": "도서 상태 변경 로직에 변경이 있으면, Loan/Reservation 프로세스에도 영향이 간접적으로 미칠 수 있다.",
                                    "performance": "트랜잭션 분리로 인해 도서 상태, 이력 동기화 시 약간의 지연이 발생할 수 있다."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LibraryLoanProcess",
                                    "alias": "대출/반납",
                                    "displayName": "대출/반납",
                                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}",
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
                                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 본인의 회원번호와 이름을 통해 확인받고, 도서명 또는 ISBN으로 도서를 검색하여 대출을 신청할 수 있다. 이미 대출중인 도서는 예약 신청이 가능하다. 도서 대출 완료 시 도서 상태는 자동으로 '대출중'으로 변경된다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인이 가능하다.\",\"도서명 또는 ISBN으로 도서 검색이 가능하다.\",\"대출 가능 상태의 도서만 대출 신청이 가능하다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 '대출중'으로 자동 변경된다.\"]},{\"title\":\"대출 현황 조회 및 관리\",\"description\":\"도서관리자는 '대출 현황' 화면에서 현재 대출 중인 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 건별로 연장 또는 반납 처리를 할 수 있다.\",\"acceptance\":[\"대출 건의 대출일, 반납예정일, 상태가 표시된다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"도서 반납 시 예약자가 있으면 상태가 '예약중', 없으면 '대출가능'으로 변경된다.\",\"대출 상태는 '대출중', '연체', '반납완료'가 존재한다.\"]},{\"title\":\"도서별 대출 및 상태 이력 조회\",\"description\":\"관리자는 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"각 도서별로 대출 이력과 상태 변경 이력이 조회된다.\",\"대출 이력에는 대출일, 반납일, 연장, 연체 정보가 포함된다.\",\"상태 이력에는 상태 변경 일시와 변경 내용이 포함된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"loanStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]},{\"name\":\"extendCount\",\"type\":\"Integer\"}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]},{\"name\":\"changeDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 가능 상태 확인\",\"description\":\"도서 상태가 AVAILABLE인 경우에만 대출 신청이 가능하다.\"},{\"name\":\"대출 중 도서 예약\",\"description\":\"도서 상태가 ON_LOAN일 때만 예약 신청이 가능하다.\"},{\"name\":\"대출 기간 선택\",\"description\":\"대출 신청 시 7일, 14일, 30일 중에서 대출 기간을 선택해야 한다.\"},{\"name\":\"연장 제한\",\"description\":\"대출 연장은 정책에 따라 1회 또는 제한 횟수만큼만 가능하다.\"},{\"name\":\"반납 시 도서 상태 전환\",\"description\":\"도서 반납 후 예약자가 있으면 상태를 RESERVED, 없으면 AVAILABLE로 변경한다.\"},{\"name\":\"연체 처리\",\"description\":\"반납 예정일이 경과하면 도서의 대출 상태를 OVERDUE로 변경한다.\"},{\"name\":\"상태 변경 이력 기록\",\"description\":\"모든 도서의 상태 변경은 BookStatusHistory에 기록된다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 선택\",\"type\":\"form\",\"fields\":[{\"name\":\"titleOrIsbn\",\"type\":\"text\",\"required\":true}],\"actions\":[\"도서 검색\"],\"filters\":[],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"status\"],\"actions\":[\"도서 선택\"]}},{\"name\":\"대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"예약 신청\",\"type\":\"form\",\"fields\":[],\"actions\":[\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatusScreen\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장 신청\",\"반납 처리\"],\"filters\":[\"전체/회원별/도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"bookId\",\"loanDate\",\"dueDate\",\"loanStatus\"],\"actions\":[\"상세 조회\"]}}]},\"BookHistoryScreen\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"loanStatus\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"historyId\",\"status\",\"changeDate\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"LoanRequested\",\"description\":\"회원이 도서명 또는 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"displayName\":\"대출 신청됨\"},{\"name\":\"LoanApproved\",\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"displayName\":\"대출 완료됨\"},{\"name\":\"BookReserved\",\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"displayName\":\"도서 예약됨\"},{\"name\":\"LoanReturned\",\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"displayName\":\"도서 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"displayName\":\"대출 연장됨\"},{\"name\":\"LoanOverdueChecked\",\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"displayName\":\"연체 확인됨\"},{\"name\":\"ReservationNotified\",\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"displayName\":\"예약자 통보됨\"},{\"name\":\"LoanStatusQueried\",\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"displayName\":\"대출 현황 조회됨\"}]}"
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
                                            },
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
                                    "cohesion": "LoanHistory가 별도 Aggregate로 관리되어 대출·연장·반납·연체 이력을 전문적으로 누적·조회할 수 있다.",
                                    "coupling": "대출 흐름과 이력 관리가 분리되어 서로의 변경에 최소 영향만 받는다.",
                                    "consistency": "Loan/Reservation과 이력 저장이 별도 트랜잭션으로 처리되어 업무별 불변성 보호가 명확하다.",
                                    "encapsulation": "대출 이력 관련 규칙(예: 변경 불가, 조회 only 등)이 LoanHistory Aggregate 내부에 집중된다.",
                                    "complexity": "이력 관리 로직이 Loan, Reservation에서 분리되어 각 도메인의 복잡도가 낮아진다.",
                                    "independence": "이력 정책 변경(예: 이력 상세 항목 추가 등)이 Loan, Reservation Aggregate에 영향을 거의 미치지 않는다.",
                                    "performance": "이력 조회/통계 연산이 대출, 예약 데이터와 분리되어 대규모 데이터 처리 시 효율적이다."
                                },
                                "cons": {
                                    "cohesion": "대출-이력 간 강한 연관에도 불구하고 트랜잭션이 분리되어 약간의 데이터 불일치 가능성이 존재한다.",
                                    "coupling": "이력 기록 시 Loan의 상태·속성을 반드시 동기화해야 하므로 업무 서비스 계층에 추가 연동 로직이 필요하다.",
                                    "consistency": "Loan, LoanHistory의 일관성 보장을 위한 보상 트랜잭션 또는 동기화 이벤트 관리가 필요하다.",
                                    "encapsulation": "이력 변경 시 Loan/LoanHistory 양쪽에 수정이 필요할 수 있어 코드 추적성이 떨어질 수 있다.",
                                    "complexity": "Aggregate가 늘어나면서 배포, 관리 포인트가 증가한다.",
                                    "independence": "이력 데이터와 본 대출/예약 데이터 간의 비즈니스 룰 연결(예: 상태 이력 반영 등)이 추가 구현 필요.",
                                    "performance": "이력 저장, 조회에 별도 Aggregate 접근이 필요해 단순한 구조에 비해 오버헤드가 약간 증가한다."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "LibraryLoanProcess",
                                    "alias": "대출/반납",
                                    "displayName": "대출/반납",
                                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}",
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
                                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 본인의 회원번호와 이름을 통해 확인받고, 도서명 또는 ISBN으로 도서를 검색하여 대출을 신청할 수 있다. 이미 대출중인 도서는 예약 신청이 가능하다. 도서 대출 완료 시 도서 상태는 자동으로 '대출중'으로 변경된다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인이 가능하다.\",\"도서명 또는 ISBN으로 도서 검색이 가능하다.\",\"대출 가능 상태의 도서만 대출 신청이 가능하다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 '대출중'으로 자동 변경된다.\"]},{\"title\":\"대출 현황 조회 및 관리\",\"description\":\"도서관리자는 '대출 현황' 화면에서 현재 대출 중인 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 건별로 연장 또는 반납 처리를 할 수 있다.\",\"acceptance\":[\"대출 건의 대출일, 반납예정일, 상태가 표시된다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"도서 반납 시 예약자가 있으면 상태가 '예약중', 없으면 '대출가능'으로 변경된다.\",\"대출 상태는 '대출중', '연체', '반납완료'가 존재한다.\"]},{\"title\":\"도서별 대출 및 상태 이력 조회\",\"description\":\"관리자는 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"각 도서별로 대출 이력과 상태 변경 이력이 조회된다.\",\"대출 이력에는 대출일, 반납일, 연장, 연체 정보가 포함된다.\",\"상태 이력에는 상태 변경 일시와 변경 내용이 포함된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"loanStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]},{\"name\":\"extendCount\",\"type\":\"Integer\"}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]},{\"name\":\"changeDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 가능 상태 확인\",\"description\":\"도서 상태가 AVAILABLE인 경우에만 대출 신청이 가능하다.\"},{\"name\":\"대출 중 도서 예약\",\"description\":\"도서 상태가 ON_LOAN일 때만 예약 신청이 가능하다.\"},{\"name\":\"대출 기간 선택\",\"description\":\"대출 신청 시 7일, 14일, 30일 중에서 대출 기간을 선택해야 한다.\"},{\"name\":\"연장 제한\",\"description\":\"대출 연장은 정책에 따라 1회 또는 제한 횟수만큼만 가능하다.\"},{\"name\":\"반납 시 도서 상태 전환\",\"description\":\"도서 반납 후 예약자가 있으면 상태를 RESERVED, 없으면 AVAILABLE로 변경한다.\"},{\"name\":\"연체 처리\",\"description\":\"반납 예정일이 경과하면 도서의 대출 상태를 OVERDUE로 변경한다.\"},{\"name\":\"상태 변경 이력 기록\",\"description\":\"모든 도서의 상태 변경은 BookStatusHistory에 기록된다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 선택\",\"type\":\"form\",\"fields\":[{\"name\":\"titleOrIsbn\",\"type\":\"text\",\"required\":true}],\"actions\":[\"도서 검색\"],\"filters\":[],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"status\"],\"actions\":[\"도서 선택\"]}},{\"name\":\"대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"예약 신청\",\"type\":\"form\",\"fields\":[],\"actions\":[\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatusScreen\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장 신청\",\"반납 처리\"],\"filters\":[\"전체/회원별/도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"bookId\",\"loanDate\",\"dueDate\",\"loanStatus\"],\"actions\":[\"상세 조회\"]}}]},\"BookHistoryScreen\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"loanStatus\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"historyId\",\"status\",\"changeDate\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"LoanRequested\",\"description\":\"회원이 도서명 또는 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"displayName\":\"대출 신청됨\"},{\"name\":\"LoanApproved\",\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"displayName\":\"대출 완료됨\"},{\"name\":\"BookReserved\",\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"displayName\":\"도서 예약됨\"},{\"name\":\"LoanReturned\",\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"displayName\":\"도서 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"displayName\":\"대출 연장됨\"},{\"name\":\"LoanOverdueChecked\",\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"displayName\":\"연체 확인됨\"},{\"name\":\"ReservationNotified\",\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"displayName\":\"예약자 통보됨\"},{\"name\":\"LoanStatusQueried\",\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"displayName\":\"대출 현황 조회됨\"}]}"
                            },
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "LoanReservation",
                                            "alias": "대출·예약 통합"
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
                                    }
                                ],
                                "pros": {
                                    "cohesion": "Loan과 Reservation을 통합해 한 건의 Aggregate 내에서 대출-예약 전환, 연장, 반납, 예약대기 등 복합 상태 관리를 일관성 있게 처리한다.",
                                    "coupling": "도서(Book), 회원(Member) 외의 외부 의존성이 없고, 상태 변경이 Aggregate 내부에서 직접적으로 이뤄진다.",
                                    "consistency": "대출-예약 상태 변동에 대한 모든 비즈니스 규칙과 트랜잭션 일관성이 단일 Aggregate 내에서 원자적으로 보장된다.",
                                    "encapsulation": "예약대기 리스트, 연체·연장 제한 등 핵심 도메인 로직을 완전히 Aggregate 내부에 은닉 가능하다.",
                                    "complexity": "업무 처리가 한 Aggregate 내에서 집중적으로 이루어져 흐름이 단순해진다.",
                                    "independence": "대출/예약 업무 정책, 상태 관리의 변경이 독립적으로 가능하다.",
                                    "performance": "상태 변경/조회시 단일 Aggregate 접근만으로 충분하여 최적의 처리 성능을 기대할 수 있다."
                                },
                                "cons": {
                                    "cohesion": "대출과 예약 도메인이 결합되어 책임 경계가 다소 모호해질 수 있다.",
                                    "coupling": "LoanReservation이 커질 경우 도메인 논리 분할이 어려워질 수 있다.",
                                    "consistency": "이력 관리, 도서 상태 연동이 별도의 LibraryBookManagement와 분리되어 추가 오케스트레이션이 필요하다.",
                                    "encapsulation": "모든 도메인 로직이 한 곳에 집중되면서 Aggregate가 비대해질 위험이 있다.",
                                    "complexity": "상태 관리, 예약대기, 연장·반납·연체 등 다양한 프로세스가 통합되어 구현 난이도가 증가한다.",
                                    "independence": "대출과 예약 기능을 별도로 확장/변경하는 데에는 불리하다.",
                                    "performance": "동시 다중 이용 시 충돌 가능성이 높아지고, 스케일아웃에 제한이 있을 수 있다."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LibraryLoanProcess",
                                    "alias": "대출/반납",
                                    "displayName": "대출/반납",
                                    "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}",
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
                                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 본인의 회원번호와 이름을 통해 확인받고, 도서명 또는 ISBN으로 도서를 검색하여 대출을 신청할 수 있다. 이미 대출중인 도서는 예약 신청이 가능하다. 도서 대출 완료 시 도서 상태는 자동으로 '대출중'으로 변경된다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인이 가능하다.\",\"도서명 또는 ISBN으로 도서 검색이 가능하다.\",\"대출 가능 상태의 도서만 대출 신청이 가능하다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 '대출중'으로 자동 변경된다.\"]},{\"title\":\"대출 현황 조회 및 관리\",\"description\":\"도서관리자는 '대출 현황' 화면에서 현재 대출 중인 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 건별로 연장 또는 반납 처리를 할 수 있다.\",\"acceptance\":[\"대출 건의 대출일, 반납예정일, 상태가 표시된다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"도서 반납 시 예약자가 있으면 상태가 '예약중', 없으면 '대출가능'으로 변경된다.\",\"대출 상태는 '대출중', '연체', '반납완료'가 존재한다.\"]},{\"title\":\"도서별 대출 및 상태 이력 조회\",\"description\":\"관리자는 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"각 도서별로 대출 이력과 상태 변경 이력이 조회된다.\",\"대출 이력에는 대출일, 반납일, 연장, 연체 정보가 포함된다.\",\"상태 이력에는 상태 변경 일시와 변경 내용이 포함된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"loanStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]},{\"name\":\"extendCount\",\"type\":\"Integer\"}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]},{\"name\":\"changeDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 가능 상태 확인\",\"description\":\"도서 상태가 AVAILABLE인 경우에만 대출 신청이 가능하다.\"},{\"name\":\"대출 중 도서 예약\",\"description\":\"도서 상태가 ON_LOAN일 때만 예약 신청이 가능하다.\"},{\"name\":\"대출 기간 선택\",\"description\":\"대출 신청 시 7일, 14일, 30일 중에서 대출 기간을 선택해야 한다.\"},{\"name\":\"연장 제한\",\"description\":\"대출 연장은 정책에 따라 1회 또는 제한 횟수만큼만 가능하다.\"},{\"name\":\"반납 시 도서 상태 전환\",\"description\":\"도서 반납 후 예약자가 있으면 상태를 RESERVED, 없으면 AVAILABLE로 변경한다.\"},{\"name\":\"연체 처리\",\"description\":\"반납 예정일이 경과하면 도서의 대출 상태를 OVERDUE로 변경한다.\"},{\"name\":\"상태 변경 이력 기록\",\"description\":\"모든 도서의 상태 변경은 BookStatusHistory에 기록된다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 선택\",\"type\":\"form\",\"fields\":[{\"name\":\"titleOrIsbn\",\"type\":\"text\",\"required\":true}],\"actions\":[\"도서 검색\"],\"filters\":[],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"status\"],\"actions\":[\"도서 선택\"]}},{\"name\":\"대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"예약 신청\",\"type\":\"form\",\"fields\":[],\"actions\":[\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatusScreen\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장 신청\",\"반납 처리\"],\"filters\":[\"전체/회원별/도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"bookId\",\"loanDate\",\"dueDate\",\"loanStatus\"],\"actions\":[\"상세 조회\"]}}]},\"BookHistoryScreen\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"loanStatus\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"historyId\",\"status\",\"changeDate\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"LoanRequested\",\"description\":\"회원이 도서명 또는 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"displayName\":\"대출 신청됨\"},{\"name\":\"LoanApproved\",\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"displayName\":\"대출 완료됨\"},{\"name\":\"BookReserved\",\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"displayName\":\"도서 예약됨\"},{\"name\":\"LoanReturned\",\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"displayName\":\"도서 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"displayName\":\"대출 연장됨\"},{\"name\":\"LoanOverdueChecked\",\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"displayName\":\"연체 확인됨\"},{\"name\":\"ReservationNotified\",\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"displayName\":\"예약자 통보됨\"},{\"name\":\"LoanStatusQueried\",\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"displayName\":\"대출 현황 조회됨\"}]}"
                            }
                        ],
                        "conclusions": "옵션 1은 트랜잭션 일관성, 도메인 책임 분리, 유지보수 편의성이 뛰어나 표준적인 도서관 대출 시스템에 가장 적합합니다. 옵션 2는 대출 이력 관리가 빈번하거나 감사가 중요한 기관, 분석이 많은 환경에서 유리합니다. 옵션 3은 대출/예약 사이클이 매우 밀접하게 연결되고 단순한 구조의 소형 도서관 시스템에 적합하나, 확장성과 독립성이 필요한 경우에는 권장되지 않습니다.",
                        "defaultOptionIndex": 1,
                        "analysisResult": {
                            "userStories": [
                                {
                                    "title": "도서 대출 및 반납 관리",
                                    "description": "회원은 '대출/반납' 화면에서 본인의 회원번호와 이름을 통해 확인받고, 도서명 또는 ISBN으로 도서를 검색하여 대출을 신청할 수 있다. 이미 대출중인 도서는 예약 신청이 가능하다. 도서 대출 완료 시 도서 상태는 자동으로 '대출중'으로 변경된다.",
                                    "acceptance": [
                                        "회원번호와 이름으로 회원 확인이 가능하다.",
                                        "도서명 또는 ISBN으로 도서 검색이 가능하다.",
                                        "대출 가능 상태의 도서만 대출 신청이 가능하다.",
                                        "대출 기간은 7일/14일/30일 중 선택할 수 있다.",
                                        "대출 중인 도서는 예약 신청이 가능하다.",
                                        "대출 완료 시 도서 상태가 '대출중'으로 자동 변경된다."
                                    ]
                                },
                                {
                                    "title": "대출 현황 조회 및 관리",
                                    "description": "도서관리자는 '대출 현황' 화면에서 현재 대출 중인 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 건별로 연장 또는 반납 처리를 할 수 있다.",
                                    "acceptance": [
                                        "대출 건의 대출일, 반납예정일, 상태가 표시된다.",
                                        "대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.",
                                        "도서 반납 시 예약자가 있으면 상태가 '예약중', 없으면 '대출가능'으로 변경된다.",
                                        "대출 상태는 '대출중', '연체', '반납완료'가 존재한다."
                                    ]
                                },
                                {
                                    "title": "도서별 대출 및 상태 이력 조회",
                                    "description": "관리자는 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있다.",
                                    "acceptance": [
                                        "각 도서별로 대출 이력과 상태 변경 이력이 조회된다.",
                                        "대출 이력에는 대출일, 반납일, 연장, 연체 정보가 포함된다.",
                                        "상태 이력에는 상태 변경 일시와 변경 내용이 포함된다."
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
                                                "RESERVED"
                                            ]
                                        }
                                    ]
                                },
                                "Loan": {
                                    "properties": [
                                        {
                                            "name": "loanId",
                                            "type": "Long",
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
                                            "name": "memberId",
                                            "type": "String",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Member"
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
                                            "name": "loanStatus",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "ON_LOAN",
                                                "OVERDUE",
                                                "RETURNED"
                                            ]
                                        },
                                        {
                                            "name": "extendCount",
                                            "type": "Integer"
                                        }
                                    ]
                                },
                                "Reservation": {
                                    "properties": [
                                        {
                                            "name": "reservationId",
                                            "type": "Long",
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
                                            "name": "memberId",
                                            "type": "String",
                                            "required": true,
                                            "isForeignKey": true,
                                            "foreignEntity": "Member"
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
                                            "type": "Long",
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
                                            "name": "status",
                                            "type": "enum",
                                            "required": true,
                                            "values": [
                                                "AVAILABLE",
                                                "ON_LOAN",
                                                "RESERVED"
                                            ]
                                        },
                                        {
                                            "name": "changeDate",
                                            "type": "Date",
                                            "required": true
                                        }
                                    ]
                                }
                            },
                            "businessRules": [
                                {
                                    "name": "대출 가능 상태 확인",
                                    "description": "도서 상태가 AVAILABLE인 경우에만 대출 신청이 가능하다."
                                },
                                {
                                    "name": "대출 중 도서 예약",
                                    "description": "도서 상태가 ON_LOAN일 때만 예약 신청이 가능하다."
                                },
                                {
                                    "name": "대출 기간 선택",
                                    "description": "대출 신청 시 7일, 14일, 30일 중에서 대출 기간을 선택해야 한다."
                                },
                                {
                                    "name": "연장 제한",
                                    "description": "대출 연장은 정책에 따라 1회 또는 제한 횟수만큼만 가능하다."
                                },
                                {
                                    "name": "반납 시 도서 상태 전환",
                                    "description": "도서 반납 후 예약자가 있으면 상태를 RESERVED, 없으면 AVAILABLE로 변경한다."
                                },
                                {
                                    "name": "연체 처리",
                                    "description": "반납 예정일이 경과하면 도서의 대출 상태를 OVERDUE로 변경한다."
                                },
                                {
                                    "name": "상태 변경 이력 기록",
                                    "description": "모든 도서의 상태 변경은 BookStatusHistory에 기록된다."
                                }
                            ],
                            "interfaces": {
                                "LoanReturnScreen": {
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
                                            "actions": [],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "도서 검색 및 선택",
                                            "type": "form",
                                            "fields": [
                                                {
                                                    "name": "titleOrIsbn",
                                                    "type": "text",
                                                    "required": true
                                                }
                                            ],
                                            "actions": [
                                                "도서 검색"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [
                                                    "bookId",
                                                    "title",
                                                    "isbn",
                                                    "status"
                                                ],
                                                "actions": [
                                                    "도서 선택"
                                                ]
                                            }
                                        },
                                        {
                                            "name": "대출 신청",
                                            "type": "form",
                                            "fields": [
                                                {
                                                    "name": "loanPeriod",
                                                    "type": "select",
                                                    "required": true
                                                }
                                            ],
                                            "actions": [
                                                "대출 신청"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "예약 신청",
                                            "type": "form",
                                            "fields": [],
                                            "actions": [
                                                "예약 신청"
                                            ],
                                            "filters": [],
                                            "resultTable": {
                                                "columns": [],
                                                "actions": []
                                            }
                                        }
                                    ]
                                },
                                "LoanStatusScreen": {
                                    "sections": [
                                        {
                                            "name": "대출 현황 목록",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [
                                                "연장 신청",
                                                "반납 처리"
                                            ],
                                            "filters": [
                                                "전체/회원별/도서별"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "loanId",
                                                    "memberId",
                                                    "bookId",
                                                    "loanDate",
                                                    "dueDate",
                                                    "loanStatus"
                                                ],
                                                "actions": [
                                                    "상세 조회"
                                                ]
                                            }
                                        }
                                    ]
                                },
                                "BookHistoryScreen": {
                                    "sections": [
                                        {
                                            "name": "대출 이력",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [],
                                            "filters": [
                                                "도서별"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "loanId",
                                                    "memberId",
                                                    "loanDate",
                                                    "dueDate",
                                                    "returnDate",
                                                    "loanStatus"
                                                ],
                                                "actions": []
                                            }
                                        },
                                        {
                                            "name": "상태 변경 이력",
                                            "type": "table",
                                            "fields": [],
                                            "actions": [],
                                            "filters": [
                                                "도서별"
                                            ],
                                            "resultTable": {
                                                "columns": [
                                                    "historyId",
                                                    "status",
                                                    "changeDate"
                                                ],
                                                "actions": []
                                            }
                                        }
                                    ]
                                }
                            },
                            "events": [
                                {
                                    "name": "LoanRequested",
                                    "description": "회원이 도서명 또는 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.",
                                    "displayName": "대출 신청됨"
                                },
                                {
                                    "name": "LoanApproved",
                                    "description": "대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.",
                                    "displayName": "대출 완료됨"
                                },
                                {
                                    "name": "BookReserved",
                                    "description": "회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.",
                                    "displayName": "도서 예약됨"
                                },
                                {
                                    "name": "LoanReturned",
                                    "description": "회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.",
                                    "displayName": "도서 반납됨"
                                },
                                {
                                    "name": "LoanExtended",
                                    "description": "회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.",
                                    "displayName": "대출 연장됨"
                                },
                                {
                                    "name": "LoanOverdueChecked",
                                    "description": "반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.",
                                    "displayName": "연체 확인됨"
                                },
                                {
                                    "name": "ReservationNotified",
                                    "description": "예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.",
                                    "displayName": "예약자 통보됨"
                                },
                                {
                                    "name": "LoanStatusQueried",
                                    "description": "현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.",
                                    "displayName": "대출 현황 조회됨"
                                }
                            ],
                            "inference": "제시된 요구사항을 분석하여, 대출/반납 화면과 대출 현황 화면의 핵심 프로세스와 모든 엔터티, 비즈니스 규칙, 인터페이스 구성, 이벤트 흐름을 체계적으로 정의함. 도서 상태, 대출, 예약, 반납의 다양한 전이와 상태 변화를 추적할 수 있도록 설계하였으며, 연장 및 연체 처리 등 핵심 정책 및 사용자 시나리오를 모두 반영함."
                        },
                        "inference": "\n\n주어진 요구사항과 누적된 초안을 분석하여, 도서 대출·예약·이력관리 업무의 트랜잭션 경계와 불변성을 보장하면서, 도메인별 책임이 명확하게 구분되도록 다양한 옵션을 설계하였다. Book, BookHistory Aggregate는 이미 LibraryBookManagement 컨텍스트에서 정의되어 있으므로, ValueObject 참조로만 처리하였으며, 반드시 Loan(대출) 및 Reservation(예약) Aggregate를 포함하도록 하였다. 각 옵션마다 Aggregate의 수를 다르게 설정하여 책임 분리, 트랜잭션 일관성, 유지보수성의 균형을 고려했다."
                    }
                ],
                "draftUIInfos": {
                    "leftBoundedContextCount": 0,
                    "directMessage": "Generating options for 대출/반납 Bounded Context... (7971 characters generated)",
                    "progress": 100
                },
                "isGeneratorButtonEnabled": true,
                "boundedContextVersion": 1,
                "retryInputs": {
                    "initialInputs": [
                        {
                            "boundedContext": {
                                "name": "LibraryBookManagement",
                                "alias": "도서관리",
                                "displayName": "도서관리",
                                "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}",
                                "aggregates": [
                                    {
                                        "name": "Book",
                                        "alias": "도서"
                                    }
                                ]
                            },
                            "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}"
                        },
                        {
                            "boundedContext": {
                                "name": "LibraryLoanProcess",
                                "alias": "대출/반납",
                                "displayName": "대출/반납",
                                "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}",
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
                            "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}"
                        }
                    ],
                    "initialAccumulatedDrafts": {
                        "LibraryBookManagement": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "enumerations": [],
                                "valueObjects": []
                            }
                        ],
                        "LibraryLoanProcess": [
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
                            }
                        ]
                    }
                },
                "selectedOptionItem": {
                    "LibraryBookManagement": {
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
                                        "name": "LoanReference",
                                        "alias": "대출 참조",
                                        "referencedAggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
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
                                    "name": "BookHistory",
                                    "alias": "도서 이력"
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
                                    }
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "도서와 이력 기능이 분리되어 각각 핵심 역할에 집중할 수 있음.",
                            "coupling": "도서와 이력 간의 의존성이 ValueObject(참조) 수준으로 낮아집니다.",
                            "consistency": "도서 트랜잭션과 이력 기록이 분리되어, 대용량 이력에도 안정적으로 대응 가능.",
                            "encapsulation": "이력 관련 정책이나 확장(예: 다양한 이력 종류 추가)이 Book과 분리되어 독립적으로 변경 가능.",
                            "complexity": "이력 관리 로직이 별도 Aggregate에 있어 도서 관리가 단순해지고, 이해하기 쉬움.",
                            "independence": "이력 저장방식이나 보존정책 변경 시 도서 Aggregate에 영향 없음.",
                            "performance": "도서 데이터와 이력 데이터를 분리 저장 및 조회할 수 있어 대량 이력에도 성능 저하가 없음."
                        },
                        "cons": {
                            "cohesion": "상태 변경과 이력 기록이 분산되어 있어 단일 도서 관리 흐름이 단순하지 않을 수 있음.",
                            "coupling": "이력 기록 시 도서의 참조를 유지해야 하므로 약간의 간접적인 결합이 존재함.",
                            "consistency": "상태 변경과 이력 기록이 각각 별도의 트랜잭션에서 발생할 수 있어, 일시적으로 불일치 상태가 발생 가능.",
                            "encapsulation": "도서 상태 변경이 이력과 분리되어 이력 누락/오류를 방지하는 추가적 방어 코드가 필요함.",
                            "complexity": "이력 데이터 연동, 조회 시 cross-aggregate 처리 로직(조인 등)이 추가됨.",
                            "independence": "도서 삭제 등 라이프사이클 정책이 이력 데이터와 동기화되어야 하므로 관리 포인트가 증가함.",
                            "performance": "도서와 이력을 함께 조회할 경우 두 Aggregate를 동시에 접근해야 하므로 I/O가 증가함."
                        },
                        "boundedContext": {
                            "name": "LibraryBookManagement",
                            "alias": "도서관리",
                            "displayName": "도서관리",
                            "description": "# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"도서관리자\",\"level\":1,\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리 (소설/비소설/학술/잡지)\",\"ISBN 중복 없음\",\"ISBN 13자리\"],\"outputs\":[\"도서 엔티티 생성\",\"도서 상태: 대출가능\"],\"nextEvents\":[\"BookStateChanged\"]}\n\n## Event\n\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"도서관리시스템\",\"level\":2,\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"inputs\":[\"도서 이벤트 트리거\",\"이전 도서 상태\"],\"outputs\":[\"도서 상태: 대출가능/대출중/예약중/폐기\"],\"nextEvents\":[\"BookDisposed\",\"LoanRequested\",\"LoanReturned\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"도서관리자\",\"level\":3,\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"inputs\":[\"도서 식별\",\"훼손/분실 사유\"],\"outputs\":[\"도서 상태: 폐기\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"BookHistoryQueried\",\"displayName\":\"도서 이력 조회됨\",\"actor\":\"도서관리자\",\"level\":11,\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"도서 대출 이력 목록\",\"도서 상태 변경 이력 목록\"],\"nextEvents\":[]}",
                            "aggregates": [
                                {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            ]
                        },
                        "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"도서관리자는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 새로운 도서를 등록할 수 있고, 등록된 도서의 상태를 관리할 수 있다.\",\"acceptance\":[\"ISBN은 13자리 숫자이며 중복되지 않아야 한다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.\",\"도서 등록 시 상태는 '대출가능'이 된다.\",\"도서 상태는 대출/반납/예약/폐기 등의 이벤트에 따라 자동으로 변경된다.\",\"폐기된 도서는 대출이 불가능하다.\"]},{\"title\":\"도서별 이력 조회\",\"description\":\"도서관리자 또는 회원은 특정 도서의 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 파악할 수 있다.\",\"acceptance\":[\"도서별로 대출 이력과 상태 변경 이력을 각각 조회할 수 있다.\",\"이력에는 상태 변경 일시 및 사유가 명시되어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"BookLoanHistory\":{\"properties\":[{\"name\":\"loanHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"memberId\",\"type\":\"Long\",\"required\":true}]},\"BookStateHistory\":{\"properties\":[{\"name\":\"stateHistoryId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"Long\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"newStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"changedAt\",\"type\":\"Date\",\"required\":true},{\"name\":\"reason\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"ISBN 유효성 검증\",\"description\":\"ISBN은 13자리 숫자여야 하며, 시스템 내에서 중복될 수 없다.\"},{\"name\":\"도서 상태 자동 전이\",\"description\":\"도서 등록 시 상태는 자동으로 '대출가능'으로 지정되고, 대출/반납/예약/폐기 등 이벤트 발생 시 상태가 자동으로 변경된다.\"},{\"name\":\"폐기 도서 대출 불가\",\"description\":\"폐기 상태의 도서는 어떠한 경우에도 대출 처리될 수 없다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"중복확인\",\"도서등록\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 목록 및 상태 관리\",\"type\":\"table\",\"fields\":[],\"actions\":[\"대출처리\",\"반납처리\",\"예약처리\",\"폐기처리\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상세보기\"]}}]},\"BookHistory\":{\"sections\":[{\"name\":\"도서 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"loanDate\",\"returnDate\",\"memberId\"],\"actions\":[]}},{\"name\":\"상태 변경 이력 조회\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서ID\"],\"resultTable\":{\"columns\":[\"previousStatus\",\"newStatus\",\"changedAt\",\"reason\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"BookRegistered\",\"description\":\"관리자가 새로운 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하여 등록함. ISBN 중복 및 13자리 유효성 검증을 통과함.\",\"displayName\":\"도서 등록됨\"},{\"name\":\"BookStateChanged\",\"description\":\"도서 등록/대출/반납/예약/폐기 등의 트리거에 의해 도서의 상태가 변경됨.\",\"displayName\":\"도서 상태 변경됨\"},{\"name\":\"BookDisposed\",\"description\":\"관리자가 훼손/분실로 인한 도서 폐기를 처리함. 폐기된 도서는 대출 불가 상태가 됨.\",\"displayName\":\"도서 폐기됨\"},{\"name\":\"BookHistoryQueried\",\"description\":\"관리자/회원이 도서별로 대출 및 상태 변경 이력을 조회함.\",\"displayName\":\"도서 이력 조회됨\"}]}"
                    },
                    "LibraryLoanProcess": {
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
                                    },
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
                            "cohesion": "LoanHistory가 별도 Aggregate로 관리되어 대출·연장·반납·연체 이력을 전문적으로 누적·조회할 수 있다.",
                            "coupling": "대출 흐름과 이력 관리가 분리되어 서로의 변경에 최소 영향만 받는다.",
                            "consistency": "Loan/Reservation과 이력 저장이 별도 트랜잭션으로 처리되어 업무별 불변성 보호가 명확하다.",
                            "encapsulation": "대출 이력 관련 규칙(예: 변경 불가, 조회 only 등)이 LoanHistory Aggregate 내부에 집중된다.",
                            "complexity": "이력 관리 로직이 Loan, Reservation에서 분리되어 각 도메인의 복잡도가 낮아진다.",
                            "independence": "이력 정책 변경(예: 이력 상세 항목 추가 등)이 Loan, Reservation Aggregate에 영향을 거의 미치지 않는다.",
                            "performance": "이력 조회/통계 연산이 대출, 예약 데이터와 분리되어 대규모 데이터 처리 시 효율적이다."
                        },
                        "cons": {
                            "cohesion": "대출-이력 간 강한 연관에도 불구하고 트랜잭션이 분리되어 약간의 데이터 불일치 가능성이 존재한다.",
                            "coupling": "이력 기록 시 Loan의 상태·속성을 반드시 동기화해야 하므로 업무 서비스 계층에 추가 연동 로직이 필요하다.",
                            "consistency": "Loan, LoanHistory의 일관성 보장을 위한 보상 트랜잭션 또는 동기화 이벤트 관리가 필요하다.",
                            "encapsulation": "이력 변경 시 Loan/LoanHistory 양쪽에 수정이 필요할 수 있어 코드 추적성이 떨어질 수 있다.",
                            "complexity": "Aggregate가 늘어나면서 배포, 관리 포인트가 증가한다.",
                            "independence": "이력 데이터와 본 대출/예약 데이터 간의 비즈니스 룰 연결(예: 상태 이력 반영 등)이 추가 구현 필요.",
                            "performance": "이력 저장, 조회에 별도 Aggregate 접근이 필요해 단순한 구조에 비해 오버헤드가 약간 증가한다."
                        },
                        "boundedContext": {
                            "name": "LibraryLoanProcess",
                            "alias": "대출/반납",
                            "displayName": "대출/반납",
                            "description": "# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n## userStory\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n## userStory\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n{\"name\":\"LoanRequested\",\"displayName\":\"대출 신청됨\",\"actor\":\"회원\",\"level\":4,\"description\":\"회원이 도서명이나 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"inputs\":[\"회원번호\",\"이름\",\"도서명/ISBN\",\"대출 가능 상태 도서\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 신청 생성\",\"대출 대기 상태\"],\"nextEvents\":[\"LoanApproved\",\"BookReserved\"]}\n\n## Event\n\n{\"name\":\"LoanApproved\",\"displayName\":\"대출 완료됨\",\"actor\":\"도서관리시스템\",\"level\":5,\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"inputs\":[\"대출 신청\",\"대출 가능 도서\",\"회원 자격 유효\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태: 대출중\",\"대출일\",\"반납예정일\"],\"nextEvents\":[\"LoanExtended\",\"LoanReturned\",\"LoanOverdueChecked\"]}\n\n## Event\n\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"회원\",\"level\":6,\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"inputs\":[\"회원번호\",\"이름\",\"대출중 상태 도서\"],\"outputs\":[\"예약 기록 생성\",\"도서 상태: 예약중\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"회원\",\"level\":7,\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"inputs\":[\"대출 중 도서\",\"회원\"],\"outputs\":[\"반납 기록 생성\",\"도서 상태: 대출가능/예약중\"],\"nextEvents\":[\"BookStateChanged\",\"ReservationNotified\"]}\n\n## Event\n\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"회원\",\"level\":8,\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"inputs\":[\"회원\",\"대출중 상태 도서\",\"연장 조건 충족\"],\"outputs\":[\"반납예정일 변경\"],\"nextEvents\":[\"LoanOverdueChecked\",\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"LoanOverdueChecked\",\"displayName\":\"연체 확인됨\",\"actor\":\"도서관리시스템\",\"level\":9,\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"inputs\":[\"대출중 도서\",\"현재 일자\",\"반납예정일\"],\"outputs\":[\"대출 상태: 연체\"],\"nextEvents\":[\"LoanReturned\"]}\n\n## Event\n\n{\"name\":\"ReservationNotified\",\"displayName\":\"예약자 통보됨\",\"actor\":\"도서관리시스템\",\"level\":10,\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"inputs\":[\"도서 반납\",\"예약자 존재\"],\"outputs\":[\"예약자 알림\"],\"nextEvents\":[]}\n\n## Event\n\n{\"name\":\"LoanStatusQueried\",\"displayName\":\"대출 현황 조회됨\",\"actor\":\"도서관리자\",\"level\":12,\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"inputs\":[\"조회 조건 (전체/회원별/도서별)\"],\"outputs\":[\"대출 건 목록\",\"각 대출 상태\"],\"nextEvents\":[]}",
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
                        "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납 관리\",\"description\":\"회원은 '대출/반납' 화면에서 본인의 회원번호와 이름을 통해 확인받고, 도서명 또는 ISBN으로 도서를 검색하여 대출을 신청할 수 있다. 이미 대출중인 도서는 예약 신청이 가능하다. 도서 대출 완료 시 도서 상태는 자동으로 '대출중'으로 변경된다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인이 가능하다.\",\"도서명 또는 ISBN으로 도서 검색이 가능하다.\",\"대출 가능 상태의 도서만 대출 신청이 가능하다.\",\"대출 기간은 7일/14일/30일 중 선택할 수 있다.\",\"대출 중인 도서는 예약 신청이 가능하다.\",\"대출 완료 시 도서 상태가 '대출중'으로 자동 변경된다.\"]},{\"title\":\"대출 현황 조회 및 관리\",\"description\":\"도서관리자는 '대출 현황' 화면에서 현재 대출 중인 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 대출 건별로 연장 또는 반납 처리를 할 수 있다.\",\"acceptance\":[\"대출 건의 대출일, 반납예정일, 상태가 표시된다.\",\"대출 중인 도서에 대해 연장 및 반납 처리가 가능하다.\",\"도서 반납 시 예약자가 있으면 상태가 '예약중', 없으면 '대출가능'으로 변경된다.\",\"대출 상태는 '대출중', '연체', '반납완료'가 존재한다.\"]},{\"title\":\"도서별 대출 및 상태 이력 조회\",\"description\":\"관리자는 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있다.\",\"acceptance\":[\"각 도서별로 대출 이력과 상태 변경 이력이 조회된다.\",\"대출 이력에는 대출일, 반납일, 연장, 연체 정보가 포함된다.\",\"상태 이력에는 상태 변경 일시와 변경 내용이 포함된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"isbn\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"Date\"},{\"name\":\"loanStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"ON_LOAN\",\"OVERDUE\",\"RETURNED\"]},{\"name\":\"extendCount\",\"type\":\"Integer\"}]},\"Reservation\":{\"properties\":[{\"name\":\"reservationId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"memberId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"reservationDate\",\"type\":\"Date\",\"required\":true}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"Long\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"AVAILABLE\",\"ON_LOAN\",\"RESERVED\"]},{\"name\":\"changeDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출 가능 상태 확인\",\"description\":\"도서 상태가 AVAILABLE인 경우에만 대출 신청이 가능하다.\"},{\"name\":\"대출 중 도서 예약\",\"description\":\"도서 상태가 ON_LOAN일 때만 예약 신청이 가능하다.\"},{\"name\":\"대출 기간 선택\",\"description\":\"대출 신청 시 7일, 14일, 30일 중에서 대출 기간을 선택해야 한다.\"},{\"name\":\"연장 제한\",\"description\":\"대출 연장은 정책에 따라 1회 또는 제한 횟수만큼만 가능하다.\"},{\"name\":\"반납 시 도서 상태 전환\",\"description\":\"도서 반납 후 예약자가 있으면 상태를 RESERVED, 없으면 AVAILABLE로 변경한다.\"},{\"name\":\"연체 처리\",\"description\":\"반납 예정일이 경과하면 도서의 대출 상태를 OVERDUE로 변경한다.\"},{\"name\":\"상태 변경 이력 기록\",\"description\":\"모든 도서의 상태 변경은 BookStatusHistory에 기록된다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 확인\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 선택\",\"type\":\"form\",\"fields\":[{\"name\":\"titleOrIsbn\",\"type\":\"text\",\"required\":true}],\"actions\":[\"도서 검색\"],\"filters\":[],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"status\"],\"actions\":[\"도서 선택\"]}},{\"name\":\"대출 신청\",\"type\":\"form\",\"fields\":[{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"예약 신청\",\"type\":\"form\",\"fields\":[],\"actions\":[\"예약 신청\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"LoanStatusScreen\":{\"sections\":[{\"name\":\"대출 현황 목록\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장 신청\",\"반납 처리\"],\"filters\":[\"전체/회원별/도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"bookId\",\"loanDate\",\"dueDate\",\"loanStatus\"],\"actions\":[\"상세 조회\"]}}]},\"BookHistoryScreen\":{\"sections\":[{\"name\":\"대출 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"loanId\",\"memberId\",\"loanDate\",\"dueDate\",\"returnDate\",\"loanStatus\"],\"actions\":[]}},{\"name\":\"상태 변경 이력\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"도서별\"],\"resultTable\":{\"columns\":[\"historyId\",\"status\",\"changeDate\"],\"actions\":[]}}]}},\"events\":[{\"name\":\"LoanRequested\",\"description\":\"회원이 도서명 또는 ISBN으로 검색하여 대출 가능한 도서에 대해 대출을 신청함. 회원번호와 이름 확인 필요.\",\"displayName\":\"대출 신청됨\"},{\"name\":\"LoanApproved\",\"description\":\"대출 요청이 처리되어 도서가 회원에게 대출됨. 도서 상태는 대출중으로 자동 변경됨.\",\"displayName\":\"대출 완료됨\"},{\"name\":\"BookReserved\",\"description\":\"회원이 이미 대출중인 도서에 대해 예약 신청을 함. 예약된 도서는 예약 대기 리스트에 등록됨.\",\"displayName\":\"도서 예약됨\"},{\"name\":\"LoanReturned\",\"description\":\"회원이 대출 중인 도서를 반납함. 반납 후 예약자가 있으면 도서 상태는 예약중, 없으면 대출가능으로 변경됨.\",\"displayName\":\"도서 반납됨\"},{\"name\":\"LoanExtended\",\"description\":\"회원이 대출중인 도서의 반납예정일을 연장 신청함. 연장은 정책에 따라 1회 혹은 제한 가능.\",\"displayName\":\"대출 연장됨\"},{\"name\":\"LoanOverdueChecked\",\"description\":\"반납 예정일이 지난 도서의 연체 상태를 확인하여 연체로 표시함.\",\"displayName\":\"연체 확인됨\"},{\"name\":\"ReservationNotified\",\"description\":\"예약자가 있는 도서가 반납되었을 때, 예약자에게 도서 이용 가능 안내를 통보함.\",\"displayName\":\"예약자 통보됨\"},{\"name\":\"LoanStatusQueried\",\"description\":\"현재 대출 중인 도서와 각 대출 건의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 조회함.\",\"displayName\":\"대출 현황 조회됨\"}]}"
                    }
                }
            }
        ]
    }
}