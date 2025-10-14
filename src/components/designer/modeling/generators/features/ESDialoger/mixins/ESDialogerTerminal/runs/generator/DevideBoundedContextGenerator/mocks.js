export const devideBoundedContextGeneratorInput = {
    "requirements": {
        "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
        "summarizedResult": {
            "summary": "",
            "refs": [],
            "originalRequirements": ""
        },
        "analysisResult": {
            "recommendedBoundedContextsNumber": 4,
            "reasonOfRecommendedBoundedContextsNumber": "이번 도메인 분석에서는 도서관의 업무를 네 가지 주요 비즈니스 역량(도서 관리, 대출/반납 관리, 예약 관리, 이력/상태 추적)으로 분리하는 것이 적합합니다. 1) '도서 관리'는 도서의 등록, 정보 관리, 폐기 등 도서 자체의 라이프사이클을 담당합니다. 2) '대출/반납 관리'는 회원 인증, 대출/반납 처리, 연장 등 대출 프로세스의 핵심 흐름을 담당합니다. 3) '예약 관리'는 대출 불가 도서에 대한 예약 신청 및 예약 상태 전환을 담당합니다. 4) '이력/상태 추적'은 도서별 대출 이력과 상태 변경 이력의 기록 및 조회를 담당합니다. 각 컨텍스트는 담당하는 액터와 이벤트 흐름이 명확히 구분되며, 업무적 책임과 데이터 경계가 뚜렷하게 나뉘어 있어 마이크로서비스 아키텍처 및 조직 구조와도 잘 부합합니다. 이벤트 복잡성과 액터 간 상호작용, 도메인 경계의 명확성을 고려할 때 4개의 바운디드 컨텍스트가 가장 적절합니다.",
            "events": [
                {
                    "name": "BookRegistered",
                    "displayName": "도서가 등록됨",
                    "actor": "Librarian",
                    "level": 1,
                    "description": "사서가 새로운 도서를 등록하여 도서관 시스템에 추가하였으며, 도서는 '대출가능' 상태로 초기화됨.",
                    "inputs": [
                        "도서명",
                        "ISBN(13자리, 중복 불가)",
                        "저자",
                        "출판사",
                        "카테고리(소설/비소설/학술/잡지)"
                    ],
                    "outputs": [
                        "신규 도서 정보",
                        "도서 상태: 대출가능"
                    ],
                    "nextEvents": [
                        "BookStatusChanged"
                    ],
                    "refs": [
                        [
                            [
                                3,
                                57
                            ],
                            [
                                3,
                                177
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookStatusChanged",
                    "displayName": "도서 상태가 변경됨",
                    "actor": "System",
                    "level": 2,
                    "description": "도서의 대출, 반납, 예약, 폐기 등 상황에 따라 도서의 상태가 자동으로 변경됨.",
                    "inputs": [
                        "도서 상태 변경 트리거(대출, 반납, 예약, 폐기)"
                    ],
                    "outputs": [
                        "도서 상태(대출가능, 대출중, 예약중, 폐기)"
                    ],
                    "nextEvents": [
                        "BookDiscarded",
                        "BookLoaned",
                        "BookReturned",
                        "BookReserved"
                    ],
                    "refs": [
                        [
                            [
                                3,
                                191
                            ],
                            [
                                3,
                                241
                            ]
                        ],
                        [
                            [
                                7,
                                150
                            ],
                            [
                                7,
                                167
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookDiscarded",
                    "displayName": "도서가 폐기됨",
                    "actor": "Librarian",
                    "level": 3,
                    "description": "도서가 훼손 또는 분실되어 사서에 의해 폐기 처리됨. 폐기된 도서는 더 이상 대출이 불가능함.",
                    "inputs": [
                        "도서 폐기 사유(훼손/분실)"
                    ],
                    "outputs": [
                        "도서 상태: 폐기"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                3,
                                264
                            ],
                            [
                                3,
                                302
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookLoaned",
                    "displayName": "도서가 대출됨",
                    "actor": "Member",
                    "level": 1,
                    "description": "회원이 도서를 대출하여 해당 도서의 상태가 '대출중'으로 변경됨.",
                    "inputs": [
                        "회원번호",
                        "이름",
                        "도서명 또는 ISBN",
                        "대출 기간(7/14/30일)"
                    ],
                    "outputs": [
                        "대출 정보",
                        "도서 상태: 대출중"
                    ],
                    "nextEvents": [
                        "BookStatusChanged"
                    ],
                    "refs": [
                        [
                            [
                                5,
                                23
                            ],
                            [
                                5,
                                235
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookReserved",
                    "displayName": "도서가 예약됨",
                    "actor": "Member",
                    "level": 2,
                    "description": "대출 중인 도서에 대해 회원이 예약을 신청함. 예약이 완료되면 도서의 상태가 '예약중'으로 변경됨.",
                    "inputs": [
                        "회원번호",
                        "이름",
                        "도서명 또는 ISBN"
                    ],
                    "outputs": [
                        "예약 정보",
                        "도서 상태: 예약중"
                    ],
                    "nextEvents": [
                        "BookStatusChanged"
                    ],
                    "refs": [
                        [
                            [
                                5,
                                183
                            ],
                            [
                                5,
                                187
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookReturned",
                    "displayName": "도서가 반납됨",
                    "actor": "Member",
                    "level": 2,
                    "description": "회원이 대출한 도서를 반납하여 도서의 상태가 '대출가능' 또는 예약자가 있을 경우 '예약중'으로 변경됨.",
                    "inputs": [
                        "회원번호",
                        "도서명 또는 ISBN"
                    ],
                    "outputs": [
                        "반납 정보",
                        "도서 상태: 대출가능 또는 예약중"
                    ],
                    "nextEvents": [
                        "BookStatusChanged"
                    ],
                    "refs": [
                        [
                            [
                                7,
                                133
                            ],
                            [
                                7,
                                167
                            ]
                        ]
                    ]
                },
                {
                    "name": "LoanExtended",
                    "displayName": "대출이 연장됨",
                    "actor": "Member",
                    "level": 3,
                    "description": "회원이 대출 중인 도서의 대출 기간을 연장함.",
                    "inputs": [
                        "회원번호",
                        "도서명 또는 ISBN",
                        "연장 기간"
                    ],
                    "outputs": [
                        "연장된 대출 정보"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                7,
                                109
                            ],
                            [
                                7,
                                110
                            ]
                        ]
                    ]
                },
                {
                    "name": "LoanStatusUpdated",
                    "displayName": "대출 상태가 갱신됨",
                    "actor": "System",
                    "level": 3,
                    "description": "대출 건의 상태(대출중/연체/반납완료)가 시스템에 의해 갱신됨.",
                    "inputs": [
                        "대출 정보",
                        "반납 예정일",
                        "실제 반납일"
                    ],
                    "outputs": [
                        "업데이트된 대출 상태"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                7,
                                65
                            ],
                            [
                                7,
                                89
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookLoanHistoryRecorded",
                    "displayName": "도서 대출 이력이 기록됨",
                    "actor": "System",
                    "level": 4,
                    "description": "도서별 대출 이력이 시스템에 기록됨.",
                    "inputs": [
                        "대출/반납 이벤트"
                    ],
                    "outputs": [
                        "대출 이력 데이터"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                9,
                                8
                            ],
                            [
                                9,
                                67
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookStatusHistoryRecorded",
                    "displayName": "도서 상태 변경 이력이 기록됨",
                    "actor": "System",
                    "level": 4,
                    "description": "도서별 상태 변경 이력이 시스템에 기록됨.",
                    "inputs": [
                        "상태 변경 이벤트"
                    ],
                    "outputs": [
                        "상태 변경 이력 데이터"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                9,
                                15
                            ],
                            [
                                9,
                                67
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
                        "BookDiscarded"
                    ],
                    "lane": 0
                },
                {
                    "name": "Member",
                    "events": [
                        "BookLoaned",
                        "BookReserved",
                        "BookReturned",
                        "LoanExtended"
                    ],
                    "lane": 1
                },
                {
                    "name": "System",
                    "events": [
                        "BookStatusChanged",
                        "LoanStatusUpdated",
                        "BookLoanHistoryRecorded",
                        "BookStatusHistoryRecorded"
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
            }
        ]
    },
    "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
    "generateOption": {
        "numberOfBCs": 4,
        "selectedAspects": [
            "도메인 복잡도 분리",
            "프로세스(value stream) 기반 분리"
        ],
        "additionalOptions": "",
        "aspectDetails": {},
        "isProtocolMode": true,
        "isGenerateFrontEnd": true
    }
}
