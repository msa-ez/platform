export const requirementsMappingGeneratorInputs = {
    "baseInput": {
        "requirements": {
            "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
            "summarizedResult": {
                "summary": "도서관 도서의 등록, 상태(대출가능/대출중/예약중/폐기) 관리와 회원에 대한 도서 대출·반납·예약을 통합적으로 관리할 수 있는 화면을 제공해야 한다.\n도서 등록 시 도서명, ISBN(13자리, 중복 확인), 저자, 출판사, 카테고리(소설/비소설/학술/잡지)를 입력받고, 폐기 도서는 대출이 불가능해야 한다.\n대출/반납 시 회원번호와 이름으로 회원을 확인하고, 도서를 도서명 또는 ISBN으로 검색하며, 대출 기간은 7/14/30일 중 선택하고 대출 중 도서는 예약 신청이 가능해야 한다.\n대출 현황 화면에서는 대출 중인 도서 목록과 각 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 연장 및 반납 처리가 가능해야 하며, 반납 시 도서 상태가 자동으로 변경되어야 하고 예약자가 있는 경우에는 '예약중'으로 표시되어야 한다.\n각 도서별로 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 추적할 수 있어야 한다.",
                "refs": {
                    "summarizedRequirements": [
                        {
                            "text": "도서관 도서의 등록, 상태(대출가능/대출중/예약중/폐기) 관리와 회원에 대한 도서 대출·반납·예약을 통합적으로 관리할 수 있는 화면을 제공해야 한다.",
                            "refs": [
                                [
                                    [
                                        1,
                                        1
                                    ],
                                    [
                                        1,
                                        41
                                    ]
                                ],
                                [
                                    [
                                        3,
                                        1
                                    ],
                                    [
                                        3,
                                        305
                                    ]
                                ],
                                [
                                    [
                                        5,
                                        1
                                    ],
                                    [
                                        5,
                                        238
                                    ]
                                ]
                            ],
                            "source_lines": [
                                1,
                                3,
                                5
                            ]
                        },
                        {
                            "text": "도서 등록 시 도서명, ISBN(13자리, 중복 확인), 저자, 출판사, 카테고리(소설/비소설/학술/잡지)를 입력받고, 폐기 도서는 대출이 불가능해야 한다.",
                            "refs": [
                                [
                                    [
                                        3,
                                        1
                                    ],
                                    [
                                        3,
                                        305
                                    ]
                                ]
                            ],
                            "source_lines": [
                                3
                            ]
                        },
                        {
                            "text": "대출/반납 시 회원번호와 이름으로 회원을 확인하고, 도서를 도서명 또는 ISBN으로 검색하며, 대출 기간은 7/14/30일 중 선택하고 대출 중 도서는 예약 신청이 가능해야 한다.",
                            "refs": [
                                [
                                    [
                                        5,
                                        1
                                    ],
                                    [
                                        5,
                                        238
                                    ]
                                ]
                            ],
                            "source_lines": [
                                5
                            ]
                        },
                        {
                            "text": "대출 현황 화면에서는 대출 중인 도서 목록과 각 도서의 대출일, 반납예정일, 상태(대출중/연체/반납완료)를 확인하고, 연장 및 반납 처리가 가능해야 하며, 반납 시 도서 상태가 자동으로 변경되어야 하고 예약자가 있는 경우에는 '예약중'으로 표시되어야 한다.",
                            "refs": [
                                [
                                    [
                                        7,
                                        1
                                    ],
                                    [
                                        7,
                                        217
                                    ]
                                ]
                            ],
                            "source_lines": [
                                7
                            ]
                        },
                        {
                            "text": "각 도서별로 대출 이력과 상태 변경 이력을 조회하여 도서의 대출 현황과 상태 변화를 추적할 수 있어야 한다.",
                            "refs": [
                                [
                                    [
                                        9,
                                        1
                                    ],
                                    [
                                        9,
                                        74
                                    ]
                                ]
                            ],
                            "source_lines": [
                                9
                            ]
                        }
                    ]
                },
                "originalRequirements": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n"
            },
            "analysisResult": {
                "recommendedBoundedContextsNumber": 4,
                "reasonOfRecommendedBoundedContextsNumber": "추천된 바운디드 컨텍스트는 4개입니다. (1) 도서 관리(Book Management): 도서의 등록, 상태 변경, 폐기, 도서 정보 관리 등 도서 개체의 라이프사이클에 초점을 둡니다. (2) 대출 관리(Loan Management): 도서의 대출, 반납, 연장, 대출 상태 관리 등 대출 관련 모든 비즈니스 로직을 담당합니다. (3) 예약 관리(Reservation Management): 도서 예약, 예약 상태 변경, 예약 처리와 예외상황(예약 중 도서 반납 등) 관리를 별도의 컨텍스트로 분리합니다. (4) 이력 및 모니터링(History & Monitoring): 도서별 대출 이력, 상태 변경 이력 등 트래킹 및 감사(Audit) 기능을 제공합니다. 각 컨텍스트는 주된 액터(사서, 회원, 시스템)에 따라 업무 책임이 명확하게 분리되며, 이벤트 복잡성과 도메인 경계를 기준으로 적절히 구분되었습니다. 이러한 분리는 유지보수성, 조직 구조와 정합성을 높이며, 도서관의 핵심 비즈니스 역량에 최적화된 경계를 제공합니다.",
                "events": [
                    {
                        "name": "BookRegistered",
                        "displayName": "도서 등록됨",
                        "actor": "Librarian",
                        "level": 1,
                        "description": "사서가 새로운 도서를 등록하여 도서 목록에 추가하였음. ISBN 중복 검증, 필수 정보(도서명, 저자, 출판사, 카테고리) 입력 후 정상적으로 등록 완료.",
                        "inputs": [
                            "도서명",
                            "ISBN(13자리 숫자)",
                            "저자",
                            "출판사",
                            "카테고리"
                        ],
                        "outputs": [
                            "신규 도서 데이터 생성",
                            "도서 상태 '대출가능'으로 설정"
                        ],
                        "nextEvents": [
                            "BookStateChanged"
                        ],
                        "refs": [
                            [
                                [
                                    3,
                                    15
                                ],
                                [
                                    3,
                                    70
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "BookDuplicateIsbnDetected",
                        "displayName": "ISBN 중복 감지됨",
                        "actor": "System",
                        "level": 2,
                        "description": "도서 등록 과정에서 입력한 ISBN이 이미 등록된 도서와 중복됨을 시스템이 감지하여 등록을 차단함.",
                        "inputs": [
                            "ISBN(13자리 숫자)"
                        ],
                        "outputs": [
                            "등록 거부",
                            "사용자에게 오류 알림"
                        ],
                        "nextEvents": [],
                        "refs": [
                            [
                                [
                                    3,
                                    105
                                ],
                                [
                                    3,
                                    134
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "BookStateChanged",
                        "displayName": "도서 상태 변경됨",
                        "actor": "System",
                        "level": 3,
                        "description": "도서 등록/대출/반납/폐기 등 이벤트에 따라 도서의 상태가 자동 또는 수동으로 변경됨. 예: 대출가능 → 대출중, 대출중 → 예약중, 예약중 → 대출가능, 대출가능/대출중 → 폐기 등.",
                        "inputs": [
                            "도서ID",
                            "상태변경 사유(등록, 대출, 반납, 예약, 폐기 등)"
                        ],
                        "outputs": [
                            "도서 상태 값 변경"
                        ],
                        "nextEvents": [
                            "BookDisposed",
                            "LoanCreated",
                            "LoanReturned",
                            "ReservationCreated"
                        ],
                        "refs": [
                            [
                                [
                                    3,
                                    172
                                ],
                                [
                                    3,
                                    244
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "BookDisposed",
                        "displayName": "도서 폐기됨",
                        "actor": "Librarian",
                        "level": 4,
                        "description": "사서가 도서의 훼손 또는 분실 등의 사유로 해당 도서를 폐기 처리함. 폐기된 도서는 대출 불가 상태로 변경됨.",
                        "inputs": [
                            "도서ID",
                            "폐기 사유"
                        ],
                        "outputs": [
                            "도서 상태 '폐기'로 변경"
                        ],
                        "nextEvents": [],
                        "refs": [
                            [
                                [
                                    3,
                                    246
                                ],
                                [
                                    3,
                                    305
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "LoanCreated",
                        "displayName": "대출 처리됨",
                        "actor": "Librarian",
                        "level": 5,
                        "description": "회원의 대출 신청에 따라 사서가 대출을 승인 및 처리함. 도서의 상태가 자동으로 '대출중'으로 변경됨.",
                        "inputs": [
                            "회원번호",
                            "회원 이름",
                            "도서ID",
                            "대출기간(7/14/30일)"
                        ],
                        "outputs": [
                            "대출 내역 생성",
                            "도서 상태 '대출중'으로 변경"
                        ],
                        "nextEvents": [
                            "LoanStateChanged"
                        ],
                        "refs": [
                            [
                                [
                                    5,
                                    15
                                ],
                                [
                                    5,
                                    238
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "LoanStateChanged",
                        "displayName": "대출 상태 변경됨",
                        "actor": "System",
                        "level": 6,
                        "description": "대출 상태(대출중, 연체, 반납완료 등)가 시스템에 의해 자동 또는 사서의 처리에 따라 변경됨. 반납 시 '반납완료', 기한 경과 시 '연체' 등.",
                        "inputs": [
                            "대출ID",
                            "상태 변경 트리거(반납, 연체, 연장 등)"
                        ],
                        "outputs": [
                            "대출 상태 값 변경"
                        ],
                        "nextEvents": [
                            "LoanReturned",
                            "LoanExtended"
                        ],
                        "refs": [
                            [
                                [
                                    7,
                                    13
                                ],
                                [
                                    7,
                                    97
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "LoanReturned",
                        "displayName": "도서 반납됨",
                        "actor": "Librarian",
                        "level": 7,
                        "description": "회원이 대출한 도서를 반납함. 시스템이 도서의 상태를 '대출가능' 또는 '예약중'(예약자 있는 경우)으로 자동 전환.",
                        "inputs": [
                            "대출ID",
                            "도서ID",
                            "회원ID"
                        ],
                        "outputs": [
                            "대출 상태 '반납완료'로 변경",
                            "도서 상태 '대출가능' 또는 '예약중'으로 변경"
                        ],
                        "nextEvents": [
                            "BookStateChanged",
                            "ReservationActivated"
                        ],
                        "refs": [
                            [
                                [
                                    7,
                                    129
                                ],
                                [
                                    7,
                                    217
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "LoanExtended",
                        "displayName": "대출 연장됨",
                        "actor": "Librarian",
                        "level": 8,
                        "description": "사서가 대출 중인 도서의 대출 기간 연장을 승인하여, 반납 예정일을 연장함.",
                        "inputs": [
                            "대출ID",
                            "연장 기간"
                        ],
                        "outputs": [
                            "반납 예정일 연장",
                            "대출 상태 갱신"
                        ],
                        "nextEvents": [
                            "LoanStateChanged"
                        ],
                        "refs": [
                            [
                                [
                                    7,
                                    99
                                ],
                                [
                                    7,
                                    127
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "ReservationCreated",
                        "displayName": "예약 신청됨",
                        "actor": "Member",
                        "level": 9,
                        "description": "회원이 대출 중인 도서를 예약 신청함. 예약 대기 리스트에 추가되고, 도서 상태가 '예약중'으로 자동 변경됨.",
                        "inputs": [
                            "회원ID",
                            "도서ID"
                        ],
                        "outputs": [
                            "예약 내역 생성",
                            "도서 상태 '예약중'으로 변경"
                        ],
                        "nextEvents": [
                            "BookStateChanged"
                        ],
                        "refs": [
                            [
                                [
                                    5,
                                    161
                                ],
                                [
                                    5,
                                    196
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "ReservationActivated",
                        "displayName": "예약 활성화됨",
                        "actor": "System",
                        "level": 10,
                        "description": "예약된 도서가 반납 처리되었을 때 예약 리스트 최상위 회원의 예약이 활성화됨. 해당 회원에게 알림 전송 및 도서 상태 '예약중' 유지.",
                        "inputs": [
                            "도서ID",
                            "예약 리스트"
                        ],
                        "outputs": [
                            "예약 상태 '활성'으로 변경",
                            "알림 발송"
                        ],
                        "nextEvents": [],
                        "refs": [
                            [
                                [
                                    7,
                                    175
                                ],
                                [
                                    7,
                                    217
                                ]
                            ]
                        ]
                    },
                    {
                        "name": "BookHistoryTracked",
                        "displayName": "도서 이력 기록됨",
                        "actor": "System",
                        "level": 11,
                        "description": "각 도서별 대출 이력 및 상태 변경 이력이 시스템에 의해 기록되어 도서의 상태 변화 및 대출 내역을 추적할 수 있음.",
                        "inputs": [
                            "도서ID",
                            "상태 변경 이벤트 또는 대출/반납 이벤트"
                        ],
                        "outputs": [
                            "이력 데이터 누적 저장"
                        ],
                        "nextEvents": [],
                        "refs": [
                            [
                                [
                                    9,
                                    1
                                ],
                                [
                                    9,
                                    74
                                ]
                            ]
                        ]
                    }
                ],
                "actors": [
                    {
                        "name": "Librarian",
                        "events": [
                            "BookRegistered",
                            "BookDisposed",
                            "LoanCreated",
                            "LoanReturned",
                            "LoanExtended"
                        ],
                        "lane": 0
                    },
                    {
                        "name": "Member",
                        "events": [
                            "ReservationCreated"
                        ],
                        "lane": 1
                    },
                    {
                        "name": "System",
                        "events": [
                            "BookDuplicateIsbnDetected",
                            "BookStateChanged",
                            "LoanStateChanged",
                            "ReservationActivated",
                            "BookHistoryTracked"
                        ],
                        "lane": 2
                    }
                ]
            },
            "pbcInfo": [
                {
                    "name": "chat-vue3-en",
                    "description": "Chat service (Vue3)"
                },
                {
                    "name": "review",
                    "description": "review"
                },
                {
                    "name": "reservation-notification",
                    "description": "예약 & 알림 서비스"
                },
                {
                    "name": "reservation-notification-vue3",
                    "description": "예약 & 알림 서비스(Vue3)"
                },
                {
                    "name": "chat-vue3",
                    "description": "채팅 서비스(Vue3)"
                },
                {
                    "name": "chat",
                    "description": "채팅 서비스"
                },
                {
                    "name": "payment-system",
                    "description": "결제를 위한 공통 기능"
                },
                {
                    "name": "document-management",
                    "description": "파일관리를 위한 공통 기능"
                },
                {
                    "name": "gitlab",
                    "description": "openapi.yaml"
                },
                {
                    "name": "PBC-Test",
                    "description": "Framework for rapidly and easily developing Java-based web applications."
                },
                {
                    "name": "reservation-notification",
                    "description": "예약 & 알림 서비스"
                },
                {
                    "name": "reservation-notification-vue3",
                    "description": "예약 & 알림 서비스(Vue3)"
                },
                {
                    "name": "chat-vue3",
                    "description": "채팅 서비스(Vue3)"
                },
                {
                    "name": "chat",
                    "description": "채팅 서비스"
                },
                {
                    "name": "payment-system",
                    "description": "결제를 위한 공통 기능"
                },
                {
                    "name": "document-management",
                    "description": "파일관리를 위한 공통 기능"
                },
                {
                    "name": "gitlab",
                    "description": "openapi.yaml"
                },
                {
                    "name": "PBC-Test",
                    "description": "Framework for rapidly and easily developing Java-based web applications."
                }
            ]
        },
        "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
        "generateOption": {
            "numberOfBCs": 3,
            "selectedAspects": [
                "도메인 복잡도 분리",
                "프로세스(value stream) 기반 분리"
            ],
            "additionalOptions": "",
            "aspectDetails": {},
            "isProtocolMode": true,
            "isGenerateFrontEnd": false
        },
        "boundedContext": {
            "name": "LibraryLending",
            "alias": "도서관 대출 관리",
            "importance": "Core Domain",
            "complexity": 0.8,
            "differentiation": 1,
            "implementationStrategy": "Rich Domain Model",
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                },
                {
                    "name": "Loan",
                    "alias": "대출"
                },
                {
                    "name": "Member",
                    "alias": "회원"
                }
            ],
            "events": [
                "BookRegistered",
                "BookDisposed",
                "BookStateChanged",
                "LoanCreated",
                "LoanReturned",
                "LoanExtended",
                "LoanStateChanged",
                "ReservationCreated",
                "ReservationActivated"
            ],
            "requirements": [],
            "role": "도서 등록, 대출, 반납, 연장, 폐기 및 회원의 도서 대출·예약·반납 업무를 통합적으로 관리하며, 도서 상태와 대출 현황을 실시간으로 추적 및 제어한다. 회원 및 도서 정보, 대출 기간 관리, 예약 상태 연동 등 핵심 비즈니스 로직과 복잡한 상태 전이를 책임진다.",
            "roleRefs": [
                [
                    [
                        [
                            1,
                            1
                        ],
                        [
                            1,
                            41
                        ]
                    ],
                    [
                        [
                            3,
                            1
                        ],
                        [
                            3,
                            305
                        ]
                    ],
                    [
                        [
                            5,
                            1
                        ],
                        [
                            5,
                            238
                        ]
                    ]
                ],
                [
                    [
                        [
                            7,
                            1
                        ],
                        [
                            7,
                            217
                        ]
                    ]
                ],
                [
                    [
                        [
                            5,
                            1
                        ],
                        [
                            5,
                            238
                        ]
                    ]
                ]
            ]
        }
    },

    "requirementChunks": [
        {
            "text": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n",
            "startLine": 1
        },

        {
            "text": "\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n-- 회원 테이블\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n\n-- 도서 테이블\n",
            "startLine": 5
        },

        {
            "recommendedBoundedContextsNumber": 4,
            "reasonOfRecommendedBoundedContextsNumber": "추천된 바운디드 컨텍스트는 4개입니다. (1) 도서 관리(Book Management): 도서의 등록, 상태 변경, 폐기, 도서 정보 관리 등 도서 개체의 라이프사이클에 초점을 둡니다. (2) 대출 관리(Loan Management): 도서의 대출, 반납, 연장, 대출 상태 관리 등 대출 관련 모든 비즈니스 로직을 담당합니다. (3) 예약 관리(Reservation Management): 도서 예약, 예약 상태 변경, 예약 처리와 예외상황(예약 중 도서 반납 등) 관리를 별도의 컨텍스트로 분리합니다. (4) 이력 및 모니터링(History & Monitoring): 도서별 대출 이력, 상태 변경 이력 등 트래킹 및 감사(Audit) 기능을 제공합니다. 각 컨텍스트는 주된 액터(사서, 회원, 시스템)에 따라 업무 책임이 명확하게 분리되며, 이벤트 복잡성과 도메인 경계를 기준으로 적절히 구분되었습니다. 이러한 분리는 유지보수성, 조직 구조와 정합성을 높이며, 도서관의 핵심 비즈니스 역량에 최적화된 경계를 제공합니다.",
            "events": [
                {
                    "name": "BookRegistered",
                    "displayName": "도서 등록됨",
                    "actor": "Librarian",
                    "level": 1,
                    "description": "사서가 새로운 도서를 등록하여 도서 목록에 추가하였음. ISBN 중복 검증, 필수 정보(도서명, 저자, 출판사, 카테고리) 입력 후 정상적으로 등록 완료.",
                    "inputs": [
                        "도서명",
                        "ISBN(13자리 숫자)",
                        "저자",
                        "출판사",
                        "카테고리"
                    ],
                    "outputs": [
                        "신규 도서 데이터 생성",
                        "도서 상태 '대출가능'으로 설정"
                    ],
                    "nextEvents": [
                        "BookStateChanged"
                    ],
                    "refs": [
                        [
                            [
                                3,
                                15
                            ],
                            [
                                3,
                                70
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookDuplicateIsbnDetected",
                    "displayName": "ISBN 중복 감지됨",
                    "actor": "System",
                    "level": 2,
                    "description": "도서 등록 과정에서 입력한 ISBN이 이미 등록된 도서와 중복됨을 시스템이 감지하여 등록을 차단함.",
                    "inputs": [
                        "ISBN(13자리 숫자)"
                    ],
                    "outputs": [
                        "등록 거부",
                        "사용자에게 오류 알림"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                3,
                                105
                            ],
                            [
                                3,
                                134
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookStateChanged",
                    "displayName": "도서 상태 변경됨",
                    "actor": "System",
                    "level": 3,
                    "description": "도서 등록/대출/반납/폐기 등 이벤트에 따라 도서의 상태가 자동 또는 수동으로 변경됨. 예: 대출가능 → 대출중, 대출중 → 예약중, 예약중 → 대출가능, 대출가능/대출중 → 폐기 등.",
                    "inputs": [
                        "도서ID",
                        "상태변경 사유(등록, 대출, 반납, 예약, 폐기 등)"
                    ],
                    "outputs": [
                        "도서 상태 값 변경"
                    ],
                    "nextEvents": [
                        "BookDisposed",
                        "LoanCreated",
                        "LoanReturned",
                        "ReservationCreated"
                    ],
                    "refs": [
                        [
                            [
                                3,
                                172
                            ],
                            [
                                3,
                                244
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookDisposed",
                    "displayName": "도서 폐기됨",
                    "actor": "Librarian",
                    "level": 4,
                    "description": "사서가 도서의 훼손 또는 분실 등의 사유로 해당 도서를 폐기 처리함. 폐기된 도서는 대출 불가 상태로 변경됨.",
                    "inputs": [
                        "도서ID",
                        "폐기 사유"
                    ],
                    "outputs": [
                        "도서 상태 '폐기'로 변경"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                3,
                                246
                            ],
                            [
                                3,
                                305
                            ]
                        ]
                    ]
                },
                {
                    "name": "LoanCreated",
                    "displayName": "대출 처리됨",
                    "actor": "Librarian",
                    "level": 5,
                    "description": "회원의 대출 신청에 따라 사서가 대출을 승인 및 처리함. 도서의 상태가 자동으로 '대출중'으로 변경됨.",
                    "inputs": [
                        "회원번호",
                        "회원 이름",
                        "도서ID",
                        "대출기간(7/14/30일)"
                    ],
                    "outputs": [
                        "대출 내역 생성",
                        "도서 상태 '대출중'으로 변경"
                    ],
                    "nextEvents": [
                        "LoanStateChanged"
                    ],
                    "refs": [
                        [
                            [
                                5,
                                15
                            ],
                            [
                                5,
                                238
                            ]
                        ]
                    ]
                },
                {
                    "name": "LoanStateChanged",
                    "displayName": "대출 상태 변경됨",
                    "actor": "System",
                    "level": 6,
                    "description": "대출 상태(대출중, 연체, 반납완료 등)가 시스템에 의해 자동 또는 사서의 처리에 따라 변경됨. 반납 시 '반납완료', 기한 경과 시 '연체' 등.",
                    "inputs": [
                        "대출ID",
                        "상태 변경 트리거(반납, 연체, 연장 등)"
                    ],
                    "outputs": [
                        "대출 상태 값 변경"
                    ],
                    "nextEvents": [
                        "LoanReturned",
                        "LoanExtended"
                    ],
                    "refs": [
                        [
                            [
                                7,
                                13
                            ],
                            [
                                7,
                                97
                            ]
                        ]
                    ]
                },
                {
                    "name": "LoanReturned",
                    "displayName": "도서 반납됨",
                    "actor": "Librarian",
                    "level": 7,
                    "description": "회원이 대출한 도서를 반납함. 시스템이 도서의 상태를 '대출가능' 또는 '예약중'(예약자 있는 경우)으로 자동 전환.",
                    "inputs": [
                        "대출ID",
                        "도서ID",
                        "회원ID"
                    ],
                    "outputs": [
                        "대출 상태 '반납완료'로 변경",
                        "도서 상태 '대출가능' 또는 '예약중'으로 변경"
                    ],
                    "nextEvents": [
                        "BookStateChanged",
                        "ReservationActivated"
                    ],
                    "refs": [
                        [
                            [
                                7,
                                129
                            ],
                            [
                                7,
                                217
                            ]
                        ]
                    ]
                },
                {
                    "name": "LoanExtended",
                    "displayName": "대출 연장됨",
                    "actor": "Librarian",
                    "level": 8,
                    "description": "사서가 대출 중인 도서의 대출 기간 연장을 승인하여, 반납 예정일을 연장함.",
                    "inputs": [
                        "대출ID",
                        "연장 기간"
                    ],
                    "outputs": [
                        "반납 예정일 연장",
                        "대출 상태 갱신"
                    ],
                    "nextEvents": [
                        "LoanStateChanged"
                    ],
                    "refs": [
                        [
                            [
                                7,
                                99
                            ],
                            [
                                7,
                                127
                            ]
                        ]
                    ]
                },
                {
                    "name": "ReservationCreated",
                    "displayName": "예약 신청됨",
                    "actor": "Member",
                    "level": 9,
                    "description": "회원이 대출 중인 도서를 예약 신청함. 예약 대기 리스트에 추가되고, 도서 상태가 '예약중'으로 자동 변경됨.",
                    "inputs": [
                        "회원ID",
                        "도서ID"
                    ],
                    "outputs": [
                        "예약 내역 생성",
                        "도서 상태 '예약중'으로 변경"
                    ],
                    "nextEvents": [
                        "BookStateChanged"
                    ],
                    "refs": [
                        [
                            [
                                5,
                                161
                            ],
                            [
                                5,
                                196
                            ]
                        ]
                    ]
                },
                {
                    "name": "ReservationActivated",
                    "displayName": "예약 활성화됨",
                    "actor": "System",
                    "level": 10,
                    "description": "예약된 도서가 반납 처리되었을 때 예약 리스트 최상위 회원의 예약이 활성화됨. 해당 회원에게 알림 전송 및 도서 상태 '예약중' 유지.",
                    "inputs": [
                        "도서ID",
                        "예약 리스트"
                    ],
                    "outputs": [
                        "예약 상태 '활성'으로 변경",
                        "알림 발송"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                7,
                                175
                            ],
                            [
                                7,
                                217
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookHistoryTracked",
                    "displayName": "도서 이력 기록됨",
                    "actor": "System",
                    "level": 11,
                    "description": "각 도서별 대출 이력 및 상태 변경 이력이 시스템에 의해 기록되어 도서의 상태 변화 및 대출 내역을 추적할 수 있음.",
                    "inputs": [
                        "도서ID",
                        "상태 변경 이벤트 또는 대출/반납 이벤트"
                    ],
                    "outputs": [
                        "이력 데이터 누적 저장"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                9,
                                1
                            ],
                            [
                                9,
                                74
                            ]
                        ]
                    ]
                }
            ],
            "actors": [
                {
                    "name": "Librarian",
                    "events": [
                        "BookRegistered",
                        "BookDisposed",
                        "LoanCreated",
                        "LoanReturned",
                        "LoanExtended"
                    ],
                    "lane": 0
                },
                {
                    "name": "Member",
                    "events": [
                        "ReservationCreated"
                    ],
                    "lane": 1
                },
                {
                    "name": "System",
                    "events": [
                        "BookDuplicateIsbnDetected",
                        "BookStateChanged",
                        "LoanStateChanged",
                        "ReservationActivated",
                        "BookHistoryTracked"
                    ],
                    "lane": 2
                }
            ],
            "type": "analysisResult"
        }
    ]
}