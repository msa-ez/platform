export const AddTraceToDraftOptionsGeneratorInput = {
    "generatedDraftOptions": [
        {
            "structure": [
                {
                    "aggregate": {
                        "name": "Book",
                        "alias": "도서"
                    },
                    "enumerations": [
                        {
                            "name": "BookStatus",
                            "alias": "도서 상태"
                        },
                        {
                            "name": "BookCategory",
                            "alias": "도서 카테고리"
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
                        },
                        {
                            "name": "LoanHistoryReference",
                            "alias": "대출 이력 참조",
                            "referencedAggregate": {
                                "name": "LoanHistory",
                                "alias": "대출 이력"
                            }
                        },
                        {
                            "name": "BookStateHistoryReference",
                            "alias": "도서 상태 변경 이력 참조",
                            "referencedAggregate": {
                                "name": "BookStateHistory",
                                "alias": "도서 상태 변경 이력"
                            }
                        }
                    ]
                }
            ],
            "pros": {
                "cohesion": "도서의 등록, 상태 변경, 폐기 등 모든 라이프사이클 관리가 Book Aggregate에 집중되어 있어 도메인 규칙과 트랜잭션 일관성이 뛰어남.",
                "coupling": "외부 컨텍스트와의 상호작용은 ValueObject 참조 및 이벤트 발행으로만 처리되어 결합도가 낮음.",
                "consistency": "도서 상태 변경과 폐기 등 핵심 비즈니스 규칙을 한 트랜잭션 내에서 원자적으로 보장할 수 있음.",
                "encapsulation": "도서의 상태, 카테고리, 대출/예약 참조 등 모든 속성과 규칙이 Aggregate 내부에 잘 은닉됨.",
                "complexity": "구현 및 유지보수가 단순하며, 도서 관리 업무에 집중된 코드 구조를 제공함.",
                "independence": "도서 관리 정책 변경 시 다른 Aggregate에 영향 없이 독립적으로 진화 가능.",
                "performance": "단일 Aggregate 접근으로 도서 상태 변경, 폐기, 조회 등 주요 연산의 성능이 우수함."
            },
            "cons": {
                "cohesion": "카테고리 관리 등 확장 요구가 생길 경우 Book Aggregate가 비대해질 수 있음.",
                "coupling": "도서와 직접 관련 없는 기능(예: 카테고리 관리)이 추가되면 결합도가 증가할 수 있음.",
                "consistency": "모든 도서 관련 데이터가 한 Aggregate에 집중되어 있어 동시성 이슈 발생 가능성 존재.",
                "encapsulation": "카테고리 등 독립적 관리가 필요한 속성까지 Aggregate 내부에 포함되어 유연성이 저하될 수 있음.",
                "complexity": "도서 관리 기능이 많아질수록 Aggregate의 복잡도가 증가할 수 있음.",
                "independence": "카테고리 등 일부 기능의 독립적 배포 및 확장이 어려움.",
                "performance": "대규모 도서 데이터 환경에서 단일 Aggregate에 대한 동시 접근이 많아질 경우 성능 저하 우려."
            },
            "isAIRecommended": false
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
                            "name": "BookStatus",
                            "alias": "도서 상태"
                        }
                    ],
                    "valueObjects": [
                        {
                            "name": "BookCategoryReference",
                            "alias": "도서 카테고리 참조",
                            "referencedAggregate": {
                                "name": "BookCategory",
                                "alias": "도서 카테고리"
                            }
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
                            "name": "ReservationReference",
                            "alias": "예약 참조",
                            "referencedAggregate": {
                                "name": "Reservation",
                                "alias": "예약"
                            }
                        },
                        {
                            "name": "LoanHistoryReference",
                            "alias": "대출 이력 참조",
                            "referencedAggregate": {
                                "name": "LoanHistory",
                                "alias": "대출 이력"
                            }
                        },
                        {
                            "name": "BookStateHistoryReference",
                            "alias": "도서 상태 변경 이력 참조",
                            "referencedAggregate": {
                                "name": "BookStateHistory",
                                "alias": "도서 상태 변경 이력"
                            }
                        }
                    ]
                },
                {
                    "aggregate": {
                        "name": "BookCategory",
                        "alias": "도서 카테고리"
                    },
                    "enumerations": [
                        {
                            "name": "BookCategoryType",
                            "alias": "카테고리 종류"
                        }
                    ],
                    "valueObjects": []
                }
            ],
            "pros": {
                "cohesion": "도서와 카테고리 관리 책임이 명확히 분리되어 각 Aggregate가 단일 책임 원칙을 잘 따름.",
                "coupling": "Book과 BookCategory가 ValueObject 참조로만 연결되어 있어 상호 영향이 최소화됨.",
                "consistency": "도서 상태 변경, 폐기 등 핵심 트랜잭션은 Book Aggregate에서 일관성 있게 처리 가능.",
                "encapsulation": "카테고리 관리 정책이 BookCategory Aggregate 내부에 은닉되어 도서 관리와 독립적으로 진화 가능.",
                "complexity": "카테고리 관리, 확장 등 도서 외 기능이 필요할 때 구조가 단순하고 명확함.",
                "independence": "카테고리 정책 변경, 신규 카테고리 추가 등은 BookCategory만 수정하면 되어 독립적임.",
                "performance": "카테고리 변경, 관리 등은 BookCategory에서 별도로 처리되어 Book Aggregate의 부하를 분산시킴."
            },
            "cons": {
                "cohesion": "도서 등록 시 카테고리 참조가 필요하므로 두 Aggregate 간 조정 로직이 필요함.",
                "coupling": "카테고리 변경 시 Book과 BookCategory 간 동기화 이슈가 발생할 수 있음.",
                "consistency": "카테고리와 도서 상태 변경이 동시에 일어날 때 트랜잭션 경계가 분리되어 일시적 불일치 가능성 존재.",
                "encapsulation": "도서 등록/수정 시 카테고리 유효성 검증이 Aggregate 외부(서비스 계층)에서 처리되어야 함.",
                "complexity": "두 Aggregate 간 참조 및 동기화 로직이 추가되어 구현 복잡도가 다소 증가함.",
                "independence": "도서와 카테고리의 라이프사이클이 다르므로 관리 포인트가 늘어남.",
                "performance": "도서와 카테고리 정보를 함께 조회할 때 두 Aggregate를 모두 접근해야 하므로 쿼리 성능이 저하될 수 있음."
            },
            "isAIRecommended": true
        }
    ],
    "boundedContextName": "BookManagement",
    "functionalRequirements": '# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서의 등록, 상태 관리, 폐기 처리를 담당하며, 도서의 라이프사이클을 관리한다. ISBN 중복 검증, 카테고리 관리, 도서 상태(대출가능/대출중/예약중/폐기) 변경을 포함한다.\n\n## Key Events\n- BookRegistered\n- BookStateChanged\n- BookDiscarded\n\n# Requirements\n\n## userStory\n\n도서 관리\' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 \'대출가능\' 상태가 되고, 이후 대출/반납 상황에 따라 \'대출중\', \'예약중\' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 \'폐기\' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\n도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM(\'소설\', \'비소설\', \'학술\', \'잡지\') NOT NULL,\n    status ENUM(\'대출가능\', \'대출중\', \'예약중\', \'폐기\') DEFAULT \'대출가능\',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM(\'대출가능\', \'대출중\', \'예약중\', \'폐기\'),\n    new_status ENUM(\'대출가능\', \'대출중\', \'예약중\', \'폐기\') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  "name": "BookRegistered",\n  "displayName": "도서 등록됨",\n  "actor": "Librarian",\n  "level": 1,\n  "description": "사서가 새로운 도서를 등록하여 도서관 시스템에 추가함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 거침.",\n  "inputs": [\n    "도서명",\n    "ISBN(13자리)",\n    "저자",\n    "출판사",\n    "카테고리(소설/비소설/학술/잡지)"\n  ],\n  "outputs": [\n    "신규 도서 등록",\n    "도서 상태: 대출가능"\n  ],\n  "nextEvents": [\n    "BookStateChanged"\n  ]\n}\n```\n\n```json\n{\n  "name": "BookStateChanged",\n  "displayName": "도서 상태 변경됨",\n  "actor": "System",\n  "level": 2,\n  "description": "도서의 대출/반납/예약/폐기 등 상황에 따라 도서 상태가 자동으로 변경됨.",\n  "inputs": [\n    "도서 상태 변경 트리거(대출, 반납, 예약, 폐기 등)"\n  ],\n  "outputs": [\n    "도서 상태: 대출가능/대출중/예약중/폐기"\n  ],\n  "nextEvents": [\n    "BookDiscarded",\n    "BookLoaned",\n    "BookReturned",\n    "BookReserved"\n  ]\n}\n```\n\n```json\n{\n  "name": "BookDiscarded",\n  "displayName": "도서 폐기됨",\n  "actor": "Librarian",\n  "level": 3,\n  "description": "도서가 훼손 또는 분실되어 사서에 의해 폐기 처리됨. 폐기된 도서는 더 이상 대출이 불가능함.",\n  "inputs": [\n    "도서 훼손/분실 확인",\n    "폐기 요청"\n  ],\n  "outputs": [\n    "도서 상태: 폐기"\n  ],\n  "nextEvents": []\n}\n```\n\n## Context Relations\n\n### BookManagement-LoanAndReservation\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 및 예약 (LoanAndReservation)\n- **Reason**: 도서 상태가 변경될 때 대출/반납 프로세스에 영향을 주기 때문에 이벤트 기반으로 상태 변경을 전달한다.\n- **Interaction Pattern**: 도서 등록, 폐기 등 상태 변경 이벤트를 발행하면 대출/반납 컨텍스트에서 이를 구독하여 처리한다.\n\n### LoanAndReservation-BookManagement\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 및 예약 (LoanAndReservation)\n- **Reason**: 도서 상태가 변경될 때 대출/반납 프로세스에 영향을 주기 때문에 이벤트 기반으로 상태 변경을 전달한다.\n- **Interaction Pattern**: 도서 등록, 폐기 등 상태 변경 이벤트를 발행하면 대출/반납 컨텍스트에서 이를 구독하여 처리한다.\n\n### BookManagement-LoanHistoryQuery\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출 및 상태 이력 조회 (LoanHistoryQuery)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 조회 컨텍스트에서 이를 구독하여 상태 변경 이력을 관리한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 조회 컨텍스트에서 이를 구독하여 상태 변경 이력을 기록한다.',
    "traceMap": {
        "4": {
            "refs": [
                [
                    [
                        3,
                        2
                    ],
                    [
                        3,
                        286
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "7": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "8": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "9": {
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
            ],
            "isDirectMatching": false
        },
        "15": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        301
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "17": {
            "refs": [
                [
                    [
                        9,
                        1
                    ],
                    [
                        9,
                        63
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "22": {
            "refs": [
                [
                    [
                        24,
                        1
                    ],
                    [
                        24,
                        6
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "23": {
            "refs": [
                [
                    [
                        25,
                        1
                    ],
                    [
                        25,
                        20
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "24": {
            "refs": [
                [
                    [
                        26,
                        1
                    ],
                    [
                        26,
                        43
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "25": {
            "refs": [
                [
                    [
                        27,
                        1
                    ],
                    [
                        27,
                        32
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "26": {
            "refs": [
                [
                    [
                        28,
                        1
                    ],
                    [
                        28,
                        37
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "27": {
            "refs": [
                [
                    [
                        29,
                        1
                    ],
                    [
                        29,
                        33
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "28": {
            "refs": [
                [
                    [
                        30,
                        1
                    ],
                    [
                        30,
                        36
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "29": {
            "refs": [
                [
                    [
                        31,
                        1
                    ],
                    [
                        31,
                        52
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "30": {
            "refs": [
                [
                    [
                        32,
                        1
                    ],
                    [
                        32,
                        59
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "31": {
            "refs": [
                [
                    [
                        33,
                        1
                    ],
                    [
                        33,
                        57
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "32": {
            "refs": [
                [
                    [
                        34,
                        1
                    ],
                    [
                        34,
                        32
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "33": {
            "refs": [
                [
                    [
                        35,
                        1
                    ],
                    [
                        35,
                        30
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "34": {
            "refs": [
                [
                    [
                        36,
                        1
                    ],
                    [
                        36,
                        50
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "35": {
            "refs": [
                [
                    [
                        37,
                        1
                    ],
                    [
                        37,
                        78
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "36": {
            "refs": [
                [
                    [
                        38,
                        1
                    ],
                    [
                        38,
                        28
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "37": {
            "refs": [
                [
                    [
                        39,
                        1
                    ],
                    [
                        39,
                        26
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "38": {
            "refs": [
                [
                    [
                        40,
                        1
                    ],
                    [
                        40,
                        30
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "39": {
            "refs": [
                [
                    [
                        41,
                        1
                    ],
                    [
                        41,
                        33
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "40": {
            "refs": [
                [
                    [
                        42,
                        1
                    ],
                    [
                        42,
                        2
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "43": {
            "refs": [
                [
                    [
                        84,
                        1
                    ],
                    [
                        84,
                        15
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "44": {
            "refs": [
                [
                    [
                        85,
                        1
                    ],
                    [
                        85,
                        34
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "45": {
            "refs": [
                [
                    [
                        86,
                        1
                    ],
                    [
                        86,
                        46
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "46": {
            "refs": [
                [
                    [
                        87,
                        1
                    ],
                    [
                        87,
                        25
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "47": {
            "refs": [
                [
                    [
                        88,
                        1
                    ],
                    [
                        88,
                        53
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "48": {
            "refs": [
                [
                    [
                        89,
                        1
                    ],
                    [
                        89,
                        57
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "49": {
            "refs": [
                [
                    [
                        90,
                        1
                    ],
                    [
                        90,
                        31
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "50": {
            "refs": [
                [
                    [
                        91,
                        1
                    ],
                    [
                        91,
                        28
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "51": {
            "refs": [
                [
                    [
                        92,
                        1
                    ],
                    [
                        92,
                        51
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "52": {
            "refs": [
                [
                    [
                        93,
                        1
                    ],
                    [
                        93,
                        52
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "53": {
            "refs": [
                [
                    [
                        94,
                        1
                    ],
                    [
                        94,
                        32
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "54": {
            "refs": [
                [
                    [
                        95,
                        1
                    ],
                    [
                        95,
                        39
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "55": {
            "refs": [
                [
                    [
                        96,
                        1
                    ],
                    [
                        96,
                        2
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "60": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "61": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "62": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "63": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "64": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "65": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "66": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "67": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "68": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "69": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "70": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "71": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "72": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "73": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "74": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "75": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "76": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "77": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "78": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "79": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "80": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        100
                    ]
                ],
                [
                    [
                        3,
                        105
                    ],
                    [
                        3,
                        128
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "84": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "85": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "86": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "87": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "88": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "89": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "90": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "91": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "92": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "93": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "94": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "95": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "96": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "97": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "98": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "99": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "100": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "101": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "102": {
            "refs": [
                [
                    [
                        3,
                        191
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        302
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
                ],
                [
                    [
                        7,
                        167
                    ],
                    [
                        7,
                        175
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "106": {
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
            ],
            "isDirectMatching": false
        },
        "107": {
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
            ],
            "isDirectMatching": false
        },
        "108": {
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
            ],
            "isDirectMatching": false
        },
        "109": {
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
            ],
            "isDirectMatching": false
        },
        "110": {
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
            ],
            "isDirectMatching": false
        },
        "111": {
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
            ],
            "isDirectMatching": false
        },
        "112": {
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
            ],
            "isDirectMatching": false
        },
        "113": {
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
            ],
            "isDirectMatching": false
        },
        "114": {
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
            ],
            "isDirectMatching": false
        },
        "115": {
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
            ],
            "isDirectMatching": false
        },
        "116": {
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
            ],
            "isDirectMatching": false
        },
        "117": {
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
            ],
            "isDirectMatching": false
        },
        "118": {
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
            ],
            "isDirectMatching": false
        },
        "119": {
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
            ],
            "isDirectMatching": false
        },
        "120": {
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
            ],
            "isDirectMatching": false
        },
        "126": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        5,
                        238
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "127": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        5,
                        238
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "128": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        5,
                        238
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "129": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        5,
                        238
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "132": {
            "refs": [
                [
                    [
                        5,
                        198
                    ],
                    [
                        7,
                        184
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "133": {
            "refs": [
                [
                    [
                        5,
                        198
                    ],
                    [
                        7,
                        184
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "134": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        5,
                        238
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "135": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        5,
                        238
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "138": {
            "refs": [
                [
                    [
                        3,
                        2
                    ],
                    [
                        9,
                        64
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "139": {
            "refs": [
                [
                    [
                        3,
                        2
                    ],
                    [
                        9,
                        64
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "140": {
            "refs": [
                [
                    [
                        3,
                        2
                    ],
                    [
                        9,
                        64
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "141": {
            "refs": [
                [
                    [
                        3,
                        2
                    ],
                    [
                        9,
                        64
                    ]
                ]
            ],
            "isDirectMatching": false
        }
    }
}