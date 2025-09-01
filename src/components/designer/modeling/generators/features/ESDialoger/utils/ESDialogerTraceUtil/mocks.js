export const mockDatas = {
    draftOptions: {
        "BookManagement": {
            "structure": [
                {
                    "aggregate": {
                        "name": "Book",
                        "alias": "도서",
                        "refs": [
                            [
                                [
                                    3,
                                    56
                                ],
                                [
                                    3,
                                    301
                                ]
                            ],
                            [
                                [
                                    25,
                                    1
                                ],
                                [
                                    25,
                                    20
                                ]
                            ],
                            [
                                [
                                    26,
                                    1
                                ],
                                [
                                    26,
                                    43
                                ]
                            ],
                            [
                                [
                                    27,
                                    1
                                ],
                                [
                                    27,
                                    32
                                ]
                            ],
                            [
                                [
                                    28,
                                    1
                                ],
                                [
                                    28,
                                    37
                                ]
                            ],
                            [
                                [
                                    29,
                                    1
                                ],
                                [
                                    29,
                                    33
                                ]
                            ],
                            [
                                [
                                    30,
                                    1
                                ],
                                [
                                    30,
                                    36
                                ]
                            ],
                            [
                                [
                                    31,
                                    1
                                ],
                                [
                                    31,
                                    52
                                ]
                            ],
                            [
                                [
                                    32,
                                    1
                                ],
                                [
                                    32,
                                    59
                                ]
                            ],
                            [
                                [
                                    33,
                                    1
                                ],
                                [
                                    33,
                                    57
                                ]
                            ],
                            [
                                [
                                    34,
                                    1
                                ],
                                [
                                    34,
                                    32
                                ]
                            ],
                            [
                                [
                                    35,
                                    1
                                ],
                                [
                                    35,
                                    30
                                ]
                            ],
                            [
                                [
                                    36,
                                    1
                                ],
                                [
                                    36,
                                    50
                                ]
                            ],
                            [
                                [
                                    37,
                                    1
                                ],
                                [
                                    37,
                                    78
                                ]
                            ],
                            [
                                [
                                    38,
                                    1
                                ],
                                [
                                    38,
                                    28
                                ]
                            ],
                            [
                                [
                                    39,
                                    1
                                ],
                                [
                                    39,
                                    26
                                ]
                            ],
                            [
                                [
                                    40,
                                    1
                                ],
                                [
                                    40,
                                    30
                                ]
                            ],
                            [
                                [
                                    41,
                                    1
                                ],
                                [
                                    41,
                                    33
                                ]
                            ],
                            [
                                [
                                    42,
                                    1
                                ],
                                [
                                    42,
                                    2
                                ]
                            ],
                            [
                                [
                                    3,
                                    57
                                ],
                                [
                                    3,
                                    100
                                ]
                            ]
                        ]
                    },
                    "enumerations": [
                        {
                            "name": "BookStatus",
                            "alias": "도서 상태",
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
                                ],
                                [
                                    [
                                        32,
                                        5
                                    ],
                                    [
                                        32,
                                        58
                                    ]
                                ],
                                [
                                    [
                                        88,
                                        5
                                    ],
                                    [
                                        88,
                                        53
                                    ]
                                ],
                                [
                                    [
                                        89,
                                        1
                                    ],
                                    [
                                        89,
                                        19
                                    ]
                                ],
                                [
                                    [
                                        3,
                                        191
                                    ],
                                    [
                                        3,
                                        302
                                    ]
                                ]
                            ]
                        },
                        {
                            "name": "BookCategory",
                            "alias": "도서 카테고리",
                            "refs": [
                                [
                                    [
                                        3,
                                        86
                                    ],
                                    [
                                        3,
                                        99
                                    ]
                                ],
                                [
                                    [
                                        31,
                                        5
                                    ],
                                    [
                                        31,
                                        51
                                    ]
                                ],
                                [
                                    [
                                        3,
                                        57
                                    ],
                                    [
                                        3,
                                        100
                                    ]
                                ]
                            ]
                        }
                    ],
                    "valueObjects": [
                        {
                            "name": "LoanReference",
                            "alias": "대출 참조",
                            "referencedAggregate": {
                                "name": "Loan",
                                "alias": "대출"
                            },
                            "refs": [
                                [
                                    [
                                        9,
                                        6
                                    ],
                                    [
                                        9,
                                        10
                                    ]
                                ],
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ]
                        },
                        {
                            "name": "ReservationReference",
                            "alias": "예약 참조",
                            "referencedAggregate": {
                                "name": "Reservation",
                                "alias": "예약"
                            },
                            "refs": [
                                [
                                    [
                                        3,
                                        222
                                    ],
                                    [
                                        3,
                                        224
                                    ]
                                ],
                                [
                                    [
                                        3,
                                        191
                                    ],
                                    [
                                        3,
                                        302
                                    ]
                                ]
                            ]
                        }
                    ],
                    "previewAttributes": [
                        {
                            "fieldName": "book_id",
                            "refs": [
                                [
                                    [
                                        26,
                                        5
                                    ],
                                    [
                                        26,
                                        42
                                    ]
                                ],
                                [
                                    [
                                        87,
                                        5
                                    ],
                                    [
                                        87,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "title",
                            "refs": [
                                [
                                    [
                                        27,
                                        5
                                    ],
                                    [
                                        27,
                                        31
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "isbn",
                            "refs": [
                                [
                                    [
                                        28,
                                        5
                                    ],
                                    [
                                        28,
                                        36
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "author",
                            "refs": [
                                [
                                    [
                                        29,
                                        5
                                    ],
                                    [
                                        29,
                                        32
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "publisher",
                            "refs": [
                                [
                                    [
                                        30,
                                        5
                                    ],
                                    [
                                        30,
                                        35
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "registration_date",
                            "refs": [
                                [
                                    [
                                        33,
                                        5
                                    ],
                                    [
                                        33,
                                        56
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "disposal_date",
                            "refs": [
                                [
                                    [
                                        34,
                                        5
                                    ],
                                    [
                                        34,
                                        31
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "disposal_reason",
                            "refs": [
                                [
                                    [
                                        35,
                                        5
                                    ],
                                    [
                                        35,
                                        29
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "created_at",
                            "refs": [
                                [
                                    [
                                        36,
                                        5
                                    ],
                                    [
                                        36,
                                        49
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "updated_at",
                            "refs": [
                                [
                                    [
                                        37,
                                        5
                                    ],
                                    [
                                        37,
                                        77
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "history_id",
                            "refs": [
                                [
                                    [
                                        86,
                                        5
                                    ],
                                    [
                                        86,
                                        45
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "change_reason",
                            "refs": [
                                [
                                    [
                                        90,
                                        5
                                    ],
                                    [
                                        90,
                                        30
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "changed_by",
                            "refs": [
                                [
                                    [
                                        91,
                                        5
                                    ],
                                    [
                                        91,
                                        27
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "change_date",
                            "refs": [
                                [
                                    [
                                        92,
                                        5
                                    ],
                                    [
                                        92,
                                        50
                                    ]
                                ]
                            ]
                        }
                    ]
                }
            ],
            "pros": {
                "cohesion": "도서의 등록, 상태 변경, 폐기, 이력 관리 등 모든 핵심 도서 관리 기능이 Book Aggregate 내에서 일관되게 처리되어 높은 응집도를 가진다.",
                "coupling": "Loan, Reservation과의 관계는 ValueObject 참조로만 구현되어 도메인 간 결합도가 낮고, 이벤트 기반 연동이 자연스럽다.",
                "consistency": "도서 상태 변경, 폐기 등 주요 비즈니스 규칙을 단일 트랜잭션으로 보장할 수 있어 데이터 일관성이 매우 높다.",
                "encapsulation": "도서의 상태 전이, 폐기, 이력 관리 등 도메인 규칙이 Aggregate 내부에 잘 은닉되어 외부에서 임의로 변경할 수 없다.",
                "complexity": "단일 Aggregate로 관리되어 개발 및 유지보수가 단순하며, 도서 관리 업무 흐름이 명확하다.",
                "independence": "도서 관리 정책 변경 시 Book Aggregate만 수정하면 되어, 타 도메인에 영향이 없다.",
                "performance": "도서 상태 변경, 이력 조회 등 대부분의 작업이 단일 Aggregate 조회로 처리되어 쿼리 효율이 높다."
            },
            "cons": {
                "cohesion": "이력 데이터가 많아질 경우 Book Aggregate가 비대해질 수 있으며, 도서 정보와 이력 관리의 관심사가 혼재될 수 있다.",
                "coupling": "이력 관리 로직이 복잡해질수록 Aggregate 내부가 커져 도메인 변경 시 영향 범위가 넓어진다.",
                "consistency": "이력 데이터가 많을 때 트랜잭션 시간이 길어질 수 있다.",
                "encapsulation": "모든 도서 관련 로직이 한 곳에 집중되어, 일부 기능만 분리 개발/배포가 어렵다.",
                "complexity": "이력 관리, 상태 전이, 폐기 등 다양한 규칙이 한 Aggregate에 집중되어 복잡도가 증가할 수 있다.",
                "independence": "이력 관리 기능만 별도로 확장하거나 독립적으로 운영하기 어렵다.",
                "performance": "이력 데이터가 많을 때 도서 조회 성능이 저하될 수 있다."
            },
            "isAIRecommended": false,
            "boundedContext": {
                "name": "BookManagement",
                "alias": "도서 관리",
                "displayName": "도서 관리",
                "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 상태 관리(대출가능/대출중/예약중/폐기), 도서 폐기 처리, 도서별 대출 및 상태 변경 이력 조회를 담당한다.\n\n## Key Events\n- BookRegistered\n- BookStatusChanged\n- BookDiscarded\n- BookHistoryQueried\n\n# Requirements\n\n## userStory\n\n도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 등록하여 도서관 시스템에 추가하였음. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리, 중복 불가)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 대출/반납/예약/폐기 등 상황에 따라 도서 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 트리거(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태(대출가능, 대출중, 예약중, 폐기)\"\n  ],\n  \"nextEvents\": [\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손되거나 분실되어 사서에 의해 폐기 처리됨. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 폐기\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryQueried\",\n  \"displayName\": \"도서 이력 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서별 대출 이력과 상태 변경 이력을 조회함.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcess-BookManagement\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 프로세스 (LoanProcess)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.\n\n### BookManagement-LoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 프로세스 (LoanProcess)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.",
                "aggregates": [
                    {
                        "name": "Book",
                        "alias": "도서"
                    }
                ],
                "requirements": {
                    "userStory": "도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할",
                    "ddl": "CREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                    "event": "{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 등록하여 도서관 시스템에 추가하였음. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리, 중복 불가)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        57\n      ],\n      [\n        3,\n        100\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 대출/반납/예약/폐기 등 상황에 따라 도서 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 트리거(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태(대출가능, 대출중, 예약중, 폐기)\"\n  ],\n  \"nextEvents\": [\n    \"BookDiscarded\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        191\n      ],\n      [\n        3,\n        302\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손되거나 분실되어 사서에 의해 폐기 처리됨. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 폐기\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        3,\n        264\n      ],\n      [\n        3,\n        302\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookHistoryQueried\",\n  \"displayName\": \"도서 이력 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서별 대출 이력과 상태 변경 이력을 조회함.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        9,\n        8\n      ],\n      [\n        9,\n        65\n      ]\n    ]\n  ]\n}",
                    "eventNames": "BookRegistered, BookStatusChanged, BookDiscarded, BookHistoryQueried 이벤트가 발생할 수 있어.",
                    "ddlFields": [
                        {
                            "fieldName": "book_id",
                            "refs": [
                                [
                                    [
                                        26,
                                        5
                                    ],
                                    [
                                        26,
                                        42
                                    ]
                                ],
                                [
                                    [
                                        87,
                                        5
                                    ],
                                    [
                                        87,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "title",
                            "refs": [
                                [
                                    [
                                        27,
                                        5
                                    ],
                                    [
                                        27,
                                        31
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "isbn",
                            "refs": [
                                [
                                    [
                                        28,
                                        5
                                    ],
                                    [
                                        28,
                                        36
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "author",
                            "refs": [
                                [
                                    [
                                        29,
                                        5
                                    ],
                                    [
                                        29,
                                        32
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "publisher",
                            "refs": [
                                [
                                    [
                                        30,
                                        5
                                    ],
                                    [
                                        30,
                                        35
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "registration_date",
                            "refs": [
                                [
                                    [
                                        33,
                                        5
                                    ],
                                    [
                                        33,
                                        56
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "disposal_date",
                            "refs": [
                                [
                                    [
                                        34,
                                        5
                                    ],
                                    [
                                        34,
                                        31
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "disposal_reason",
                            "refs": [
                                [
                                    [
                                        35,
                                        5
                                    ],
                                    [
                                        35,
                                        29
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "created_at",
                            "refs": [
                                [
                                    [
                                        36,
                                        5
                                    ],
                                    [
                                        36,
                                        49
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "updated_at",
                            "refs": [
                                [
                                    [
                                        37,
                                        5
                                    ],
                                    [
                                        37,
                                        77
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "history_id",
                            "refs": [
                                [
                                    [
                                        86,
                                        5
                                    ],
                                    [
                                        86,
                                        45
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "change_reason",
                            "refs": [
                                [
                                    [
                                        90,
                                        5
                                    ],
                                    [
                                        90,
                                        30
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "changed_by",
                            "refs": [
                                [
                                    [
                                        91,
                                        5
                                    ],
                                    [
                                        91,
                                        27
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "change_date",
                            "refs": [
                                [
                                    [
                                        92,
                                        5
                                    ],
                                    [
                                        92,
                                        50
                                    ]
                                ]
                            ]
                        }
                    ],
                    "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 상태 관리(대출가능/대출중/예약중/폐기), 도서 폐기 처리, 도서별 대출 및 상태 변경 이력 조회를 담당한다.\n\n## Key Events\n- BookRegistered\n- BookStatusChanged\n- BookDiscarded\n- BookHistoryQueried\n\n# Requirements\n\n## userStory\n\n도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 등록하여 도서관 시스템에 추가하였음. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리, 중복 불가)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 대출/반납/예약/폐기 등 상황에 따라 도서 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 트리거(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태(대출가능, 대출중, 예약중, 폐기)\"\n  ],\n  \"nextEvents\": [\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손되거나 분실되어 사서에 의해 폐기 처리됨. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 폐기\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryQueried\",\n  \"displayName\": \"도서 이력 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서별 대출 이력과 상태 변경 이력을 조회함.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcess-BookManagement\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 프로세스 (LoanProcess)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.\n\n### BookManagement-LoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 프로세스 (LoanProcess)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.",
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
                                        304
                                    ]
                                ],
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
                                        302
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
                        "10": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "16": {
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
                        "18": {
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
                        "44": {
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
                        "45": {
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
                        "46": {
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
                        "47": {
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
                        "48": {
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
                        "49": {
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
                        "50": {
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
                        "51": {
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
                        "52": {
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
                        "53": {
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
                        "54": {
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
                        "59": {
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
                                ]
                            ],
                            "isDirectMatching": false
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
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "83": {
                            "refs": [
                                [
                                    [
                                        3,
                                        191
                                    ],
                                    [
                                        3,
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                                        302
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
                        "103": {
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
                        "104": {
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
                        "105": {
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
                        "120": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "121": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "122": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "123": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "124": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "125": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "126": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "127": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "128": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "129": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "130": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "131": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "132": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "133": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "134": {
                            "refs": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "140": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "141": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "142": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "143": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "146": {
                            "refs": [
                                [
                                    [
                                        3,
                                        2
                                    ],
                                    [
                                        3,
                                        304
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "147": {
                            "refs": [
                                [
                                    [
                                        3,
                                        2
                                    ],
                                    [
                                        3,
                                        304
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "148": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "149": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        }
                    }
                }
            },
            "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 상태 관리(대출가능/대출중/예약중/폐기), 도서 폐기 처리, 도서별 대출 및 상태 변경 이력 조회를 담당한다.\n\n## Key Events\n- BookRegistered\n- BookStatusChanged\n- BookDiscarded\n- BookHistoryQueried\n\n# Requirements\n\n## userStory\n\n도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 등록하여 도서관 시스템에 추가하였음. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리, 중복 불가)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 대출/반납/예약/폐기 등 상황에 따라 도서 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 트리거(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태(대출가능, 대출중, 예약중, 폐기)\"\n  ],\n  \"nextEvents\": [\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손되거나 분실되어 사서에 의해 폐기 처리됨. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 폐기\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryQueried\",\n  \"displayName\": \"도서 이력 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서별 대출 이력과 상태 변경 이력을 조회함.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcess-BookManagement\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 프로세스 (LoanProcess)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.\n\n### BookManagement-LoanProcess\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 프로세스 (LoanProcess)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다."
        },
        "LoanProcess": {
            "structure": [
                {
                    "aggregate": {
                        "name": "Loan",
                        "alias": "대출",
                        "refs": [
                            [
                                [
                                    5,
                                    2
                                ],
                                [
                                    5,
                                    130
                                ]
                            ],
                            [
                                [
                                    45,
                                    1
                                ],
                                [
                                    45,
                                    20
                                ]
                            ],
                            [
                                [
                                    46,
                                    1
                                ],
                                [
                                    46,
                                    43
                                ]
                            ],
                            [
                                [
                                    47,
                                    1
                                ],
                                [
                                    47,
                                    35
                                ]
                            ],
                            [
                                [
                                    48,
                                    1
                                ],
                                [
                                    48,
                                    25
                                ]
                            ],
                            [
                                [
                                    49,
                                    1
                                ],
                                [
                                    49,
                                    49
                                ]
                            ],
                            [
                                [
                                    50,
                                    1
                                ],
                                [
                                    50,
                                    31
                                ]
                            ],
                            [
                                [
                                    51,
                                    1
                                ],
                                [
                                    51,
                                    30
                                ]
                            ],
                            [
                                [
                                    52,
                                    1
                                ],
                                [
                                    52,
                                    74
                                ]
                            ],
                            [
                                [
                                    53,
                                    1
                                ],
                                [
                                    53,
                                    57
                                ]
                            ],
                            [
                                [
                                    54,
                                    1
                                ],
                                [
                                    54,
                                    34
                                ]
                            ],
                            [
                                [
                                    55,
                                    1
                                ],
                                [
                                    55,
                                    50
                                ]
                            ],
                            [
                                [
                                    56,
                                    1
                                ],
                                [
                                    56,
                                    78
                                ]
                            ],
                            [
                                [
                                    57,
                                    1
                                ],
                                [
                                    57,
                                    58
                                ]
                            ],
                            [
                                [
                                    58,
                                    1
                                ],
                                [
                                    58,
                                    52
                                ]
                            ],
                            [
                                [
                                    59,
                                    1
                                ],
                                [
                                    59,
                                    36
                                ]
                            ],
                            [
                                [
                                    60,
                                    1
                                ],
                                [
                                    60,
                                    32
                                ]
                            ],
                            [
                                [
                                    61,
                                    1
                                ],
                                [
                                    61,
                                    30
                                ]
                            ],
                            [
                                [
                                    62,
                                    1
                                ],
                                [
                                    62,
                                    33
                                ]
                            ],
                            [
                                [
                                    63,
                                    1
                                ],
                                [
                                    63,
                                    2
                                ]
                            ]
                        ]
                    },
                    "enumerations": [
                        {
                            "name": "LoanStatus",
                            "alias": "대출 상태",
                            "refs": [
                                [
                                    [
                                        53,
                                        5
                                    ],
                                    [
                                        53,
                                        50
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ]
                        },
                        {
                            "name": "LoanPeriod",
                            "alias": "대출 기간",
                            "refs": [
                                [
                                    [
                                        52,
                                        5
                                    ],
                                    [
                                        52,
                                        72
                                    ]
                                ],
                                [
                                    [
                                        5,
                                        126
                                    ],
                                    [
                                        5,
                                        152
                                    ]
                                ],
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ]
                        }
                    ],
                    "valueObjects": [
                        {
                            "name": "BookReference",
                            "alias": "도서 참조",
                            "referencedAggregate": {
                                "name": "Book",
                                "alias": "도서"
                            },
                            "refs": [
                                [
                                    [
                                        48,
                                        5
                                    ],
                                    [
                                        48,
                                        11
                                    ]
                                ],
                                [
                                    [
                                        69,
                                        5
                                    ],
                                    [
                                        69,
                                        11
                                    ]
                                ],
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ]
                        },
                        {
                            "name": "Member",
                            "alias": "회원",
                            "refs": [
                                [
                                    [
                                        47,
                                        5
                                    ],
                                    [
                                        47,
                                        13
                                    ]
                                ],
                                [
                                    [
                                        68,
                                        5
                                    ],
                                    [
                                        68,
                                        13
                                    ]
                                ],
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ]
                        }
                    ],
                    "previewAttributes": [
                        {
                            "fieldName": "loan_id",
                            "refs": [
                                [
                                    [
                                        46,
                                        5
                                    ],
                                    [
                                        46,
                                        38
                                    ]
                                ],
                                [
                                    [
                                        101,
                                        5
                                    ],
                                    [
                                        101,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "member_id",
                            "refs": [
                                [
                                    [
                                        47,
                                        5
                                    ],
                                    [
                                        47,
                                        34
                                    ]
                                ],
                                [
                                    [
                                        68,
                                        5
                                    ],
                                    [
                                        68,
                                        34
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "book_id",
                            "refs": [
                                [
                                    [
                                        48,
                                        5
                                    ],
                                    [
                                        48,
                                        24
                                    ]
                                ],
                                [
                                    [
                                        69,
                                        5
                                    ],
                                    [
                                        69,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "loan_date",
                            "refs": [
                                [
                                    [
                                        49,
                                        5
                                    ],
                                    [
                                        49,
                                        48
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "due_date",
                            "refs": [
                                [
                                    [
                                        50,
                                        5
                                    ],
                                    [
                                        50,
                                        30
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "return_date",
                            "refs": [
                                [
                                    [
                                        51,
                                        5
                                    ],
                                    [
                                        51,
                                        29
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "loan_period_days",
                            "refs": [
                                [
                                    [
                                        52,
                                        5
                                    ],
                                    [
                                        52,
                                        23
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "status",
                            "refs": [
                                [
                                    [
                                        53,
                                        5
                                    ],
                                    [
                                        53,
                                        50
                                    ]
                                ],
                                [
                                    [
                                        71,
                                        5
                                    ],
                                    [
                                        71,
                                        54
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "extension_count",
                            "refs": [
                                [
                                    [
                                        54,
                                        5
                                    ],
                                    [
                                        54,
                                        31
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "created_at",
                            "refs": [
                                [
                                    [
                                        55,
                                        5
                                    ],
                                    [
                                        55,
                                        49
                                    ]
                                ],
                                [
                                    [
                                        74,
                                        5
                                    ],
                                    [
                                        74,
                                        49
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "updated_at",
                            "refs": [
                                [
                                    [
                                        56,
                                        5
                                    ],
                                    [
                                        56,
                                        77
                                    ]
                                ],
                                [
                                    [
                                        75,
                                        5
                                    ],
                                    [
                                        75,
                                        77
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "history_id",
                            "refs": [
                                [
                                    [
                                        100,
                                        5
                                    ],
                                    [
                                        100,
                                        41
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "action_type",
                            "refs": [
                                [
                                    [
                                        102,
                                        5
                                    ],
                                    [
                                        102,
                                        63
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "action_date",
                            "refs": [
                                [
                                    [
                                        103,
                                        5
                                    ],
                                    [
                                        103,
                                        50
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "previous_due_date",
                            "refs": [
                                [
                                    [
                                        104,
                                        5
                                    ],
                                    [
                                        104,
                                        35
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "new_due_date",
                            "refs": [
                                [
                                    [
                                        105,
                                        5
                                    ],
                                    [
                                        105,
                                        30
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "notes",
                            "refs": [
                                [
                                    [
                                        106,
                                        5
                                    ],
                                    [
                                        106,
                                        14
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "processed_by",
                            "refs": [
                                [
                                    [
                                        107,
                                        5
                                    ],
                                    [
                                        107,
                                        29
                                    ]
                                ]
                            ]
                        }
                    ]
                },
                {
                    "aggregate": {
                        "name": "Reservation",
                        "alias": "예약",
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
                            ],
                            [
                                [
                                    66,
                                    1
                                ],
                                [
                                    66,
                                    27
                                ]
                            ],
                            [
                                [
                                    67,
                                    1
                                ],
                                [
                                    67,
                                    50
                                ]
                            ],
                            [
                                [
                                    68,
                                    1
                                ],
                                [
                                    68,
                                    35
                                ]
                            ],
                            [
                                [
                                    69,
                                    1
                                ],
                                [
                                    69,
                                    25
                                ]
                            ],
                            [
                                [
                                    70,
                                    1
                                ],
                                [
                                    70,
                                    56
                                ]
                            ],
                            [
                                [
                                    71,
                                    1
                                ],
                                [
                                    71,
                                    61
                                ]
                            ],
                            [
                                [
                                    72,
                                    1
                                ],
                                [
                                    72,
                                    44
                                ]
                            ],
                            [
                                [
                                    73,
                                    1
                                ],
                                [
                                    73,
                                    30
                                ]
                            ],
                            [
                                [
                                    74,
                                    1
                                ],
                                [
                                    74,
                                    50
                                ]
                            ],
                            [
                                [
                                    75,
                                    1
                                ],
                                [
                                    75,
                                    78
                                ]
                            ],
                            [
                                [
                                    76,
                                    1
                                ],
                                [
                                    76,
                                    58
                                ]
                            ],
                            [
                                [
                                    77,
                                    1
                                ],
                                [
                                    77,
                                    52
                                ]
                            ],
                            [
                                [
                                    78,
                                    1
                                ],
                                [
                                    78,
                                    36
                                ]
                            ],
                            [
                                [
                                    79,
                                    1
                                ],
                                [
                                    79,
                                    32
                                ]
                            ],
                            [
                                [
                                    80,
                                    1
                                ],
                                [
                                    80,
                                    30
                                ]
                            ],
                            [
                                [
                                    81,
                                    1
                                ],
                                [
                                    81,
                                    49
                                ]
                            ],
                            [
                                [
                                    82,
                                    1
                                ],
                                [
                                    82,
                                    2
                                ]
                            ]
                        ]
                    },
                    "enumerations": [
                        {
                            "name": "ReservationStatus",
                            "alias": "예약 상태",
                            "refs": [
                                [
                                    [
                                        71,
                                        5
                                    ],
                                    [
                                        71,
                                        54
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ]
                        }
                    ],
                    "valueObjects": [
                        {
                            "name": "BookReference",
                            "alias": "도서 참조",
                            "referencedAggregate": {
                                "name": "Book",
                                "alias": "도서"
                            },
                            "refs": [
                                [
                                    [
                                        48,
                                        5
                                    ],
                                    [
                                        48,
                                        11
                                    ]
                                ],
                                [
                                    [
                                        69,
                                        5
                                    ],
                                    [
                                        69,
                                        11
                                    ]
                                ],
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ]
                        },
                        {
                            "name": "Member",
                            "alias": "회원",
                            "refs": [
                                [
                                    [
                                        47,
                                        5
                                    ],
                                    [
                                        47,
                                        13
                                    ]
                                ],
                                [
                                    [
                                        68,
                                        5
                                    ],
                                    [
                                        68,
                                        13
                                    ]
                                ],
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ]
                        }
                    ],
                    "previewAttributes": [
                        {
                            "fieldName": "reservation_id",
                            "refs": [
                                [
                                    [
                                        67,
                                        5
                                    ],
                                    [
                                        67,
                                        45
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "member_id",
                            "refs": [
                                [
                                    [
                                        47,
                                        5
                                    ],
                                    [
                                        47,
                                        34
                                    ]
                                ],
                                [
                                    [
                                        68,
                                        5
                                    ],
                                    [
                                        68,
                                        34
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "book_id",
                            "refs": [
                                [
                                    [
                                        48,
                                        5
                                    ],
                                    [
                                        48,
                                        24
                                    ]
                                ],
                                [
                                    [
                                        69,
                                        5
                                    ],
                                    [
                                        69,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "reservation_date",
                            "refs": [
                                [
                                    [
                                        70,
                                        5
                                    ],
                                    [
                                        70,
                                        55
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "status",
                            "refs": [
                                [
                                    [
                                        53,
                                        5
                                    ],
                                    [
                                        53,
                                        50
                                    ]
                                ],
                                [
                                    [
                                        71,
                                        5
                                    ],
                                    [
                                        71,
                                        54
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "notification_sent",
                            "refs": [
                                [
                                    [
                                        72,
                                        5
                                    ],
                                    [
                                        72,
                                        37
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "expiry_date",
                            "refs": [
                                [
                                    [
                                        73,
                                        5
                                    ],
                                    [
                                        73,
                                        29
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "created_at",
                            "refs": [
                                [
                                    [
                                        55,
                                        5
                                    ],
                                    [
                                        55,
                                        49
                                    ]
                                ],
                                [
                                    [
                                        74,
                                        5
                                    ],
                                    [
                                        74,
                                        49
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "updated_at",
                            "refs": [
                                [
                                    [
                                        56,
                                        5
                                    ],
                                    [
                                        56,
                                        77
                                    ]
                                ],
                                [
                                    [
                                        75,
                                        5
                                    ],
                                    [
                                        75,
                                        77
                                    ]
                                ]
                            ]
                        }
                    ]
                }
            ],
            "pros": {
                "cohesion": "대출과 예약 각각의 트랜잭션 경계가 명확하며, 각 Aggregate가 핵심 책임(대출/예약)에 집중한다.",
                "coupling": "Book, Member 등 외부 Aggregate는 ValueObject 참조로만 연결되어 도메인 간 결합도가 낮다.",
                "consistency": "대출/예약 처리와 상태 변경이 한 Aggregate 내에서 원자적으로 보장되어 이벤트 생성과 상태 일관성이 뛰어나다.",
                "encapsulation": "대출/예약 관련 도메인 규칙이 Aggregate 내부에 집중되어 외부 노출이 최소화된다.",
                "complexity": "구조가 단순하여 개발 및 유지보수가 용이하다.",
                "independence": "대출과 예약 Aggregate가 독립적으로 진화 및 확장 가능하다.",
                "performance": "대출/예약 처리 시 단일 Aggregate 접근으로 빠른 트랜잭션 처리가 가능하다."
            },
            "cons": {
                "cohesion": "대출 이력 관리가 Loan Aggregate 내부에 포함되어 책임이 다소 분산될 수 있다.",
                "coupling": "이력 관리 등 확장 시 Loan 내부 로직이 복잡해질 수 있다.",
                "consistency": "이력 데이터가 커질 경우 Loan Aggregate의 트랜잭션 경계가 커져 성능 저하 우려가 있다.",
                "encapsulation": "이력 관리와 대출 상태 관리가 한 Aggregate에 혼재되어 도메인 규칙 분리가 약화될 수 있다.",
                "complexity": "이력 관리까지 포함할 경우 Loan의 도메인 모델이 점차 복잡해질 수 있다.",
                "independence": "이력 관리 기능의 독립적 배포/확장이 어렵다.",
                "performance": "이력 데이터가 많아질수록 Loan Aggregate의 조회/갱신 성능이 저하될 수 있다."
            },
            "isAIRecommended": false,
            "boundedContext": {
                "name": "LoanProcess",
                "alias": "대출/반납 프로세스",
                "displayName": "대출/반납 프로세스",
                "description": "# Bounded Context Overview: LoanProcess (대출/반납 프로세스)\n\n## Role\n회원의 도서 대출/반납/연장/예약 신청 및 승인, 대출 상태 변경, 대출 현황 및 연체 관리, 예약 처리와 연동된 도서 상태 변경을 담당한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- ReservationRequested\n- ReservationApproved\n- LoanReturned\n- LoanExtended\n- LoanStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을\n\n대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n```sql\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n```sql\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"대출 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 1,\n  \"description\": \"회원이 도서 대출을 신청함. 회원번호와 이름으로 본인 확인 후 대출할 도서를 선택함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\",\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"대출 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"대출 신청이 승인되어 도서가 회원에게 대출됨. 도서 상태가 자동으로 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"outputs\": [\n    \"대출 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"nextEvents\": [\n    \"LoanReturned\",\n    \"LoanExtended\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"예약 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 2,\n  \"description\": \"대출하려는 도서가 이미 대출 중일 경우 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"예약 정보\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"예약 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 3,\n  \"description\": \"예약 신청이 승인되어 예약이 등록됨. 도서가 반납되면 예약자에게 알림이 전송됨.\",\n  \"inputs\": [\n    \"예약 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"outputs\": [\n    \"예약 상태: 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출한 도서를 반납함. 도서 상태가 자동으로 '대출가능'으로 변경됨. 예약자가 있으면 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능 또는 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"연장된 대출 정보\",\n    \"반납예정일 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanStatusChanged\",\n  \"displayName\": \"대출 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 4,\n  \"description\": \"대출 건의 상태(대출중/연체/반납완료 등)가 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"상태 변경 트리거(반납, 연체 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 대출 상태\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcess-BookManagement\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (BookManagement)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.\n\n### BookManagement-LoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.",
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
                "requirements": {
                    "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을\n대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할",
                    "ddl": "CREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);",
                    "event": "{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"대출 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 1,\n  \"description\": \"회원이 도서 대출을 신청함. 회원번호와 이름으로 본인 확인 후 대출할 도서를 선택함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\",\n    \"ReservationRequested\"\n  ],\n  \"refs\": [\n    [\n      [\n        5,\n        49\n      ],\n      [\n        5,\n        91\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"대출 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"대출 신청이 승인되어 도서가 회원에게 대출됨. 도서 상태가 자동으로 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"outputs\": [\n    \"대출 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"nextEvents\": [\n    \"LoanReturned\",\n    \"LoanExtended\"\n  ],\n  \"refs\": [\n    [\n      [\n        5,\n        198\n      ],\n      [\n        5,\n        235\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"예약 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 2,\n  \"description\": \"대출하려는 도서가 이미 대출 중일 경우 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"예약 정보\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ],\n  \"refs\": [\n    [\n      [\n        5,\n        183\n      ],\n      [\n        5,\n        193\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"예약 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 3,\n  \"description\": \"예약 신청이 승인되어 예약이 등록됨. 도서가 반납되면 예약자에게 알림이 전송됨.\",\n  \"inputs\": [\n    \"예약 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"outputs\": [\n    \"예약 상태: 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        7,\n        175\n      ],\n      [\n        7,\n        203\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출한 도서를 반납함. 도서 상태가 자동으로 '대출가능'으로 변경됨. 예약자가 있으면 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능 또는 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        7,\n        133\n      ],\n      [\n        7,\n        203\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"연장된 대출 정보\",\n    \"반납예정일 변경\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        7,\n        109\n      ],\n      [\n        7,\n        110\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"LoanStatusChanged\",\n  \"displayName\": \"대출 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 4,\n  \"description\": \"대출 건의 상태(대출중/연체/반납완료 등)가 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"상태 변경 트리거(반납, 연체 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 대출 상태\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        7,\n        65\n      ],\n      [\n        7,\n        81\n      ]\n    ]\n  ]\n}",
                    "eventNames": "LoanRequested, LoanApproved, ReservationRequested, ReservationApproved, LoanReturned, LoanExtended, LoanStatusChanged 이벤트가 발생할 수 있어.",
                    "ddlFields": [
                        {
                            "fieldName": "loan_id",
                            "refs": [
                                [
                                    [
                                        46,
                                        5
                                    ],
                                    [
                                        46,
                                        38
                                    ]
                                ],
                                [
                                    [
                                        101,
                                        5
                                    ],
                                    [
                                        101,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "member_id",
                            "refs": [
                                [
                                    [
                                        47,
                                        5
                                    ],
                                    [
                                        47,
                                        34
                                    ]
                                ],
                                [
                                    [
                                        68,
                                        5
                                    ],
                                    [
                                        68,
                                        34
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "book_id",
                            "refs": [
                                [
                                    [
                                        48,
                                        5
                                    ],
                                    [
                                        48,
                                        24
                                    ]
                                ],
                                [
                                    [
                                        69,
                                        5
                                    ],
                                    [
                                        69,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "loan_date",
                            "refs": [
                                [
                                    [
                                        49,
                                        5
                                    ],
                                    [
                                        49,
                                        48
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "due_date",
                            "refs": [
                                [
                                    [
                                        50,
                                        5
                                    ],
                                    [
                                        50,
                                        30
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "return_date",
                            "refs": [
                                [
                                    [
                                        51,
                                        5
                                    ],
                                    [
                                        51,
                                        29
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "loan_period_days",
                            "refs": [
                                [
                                    [
                                        52,
                                        5
                                    ],
                                    [
                                        52,
                                        23
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "status",
                            "refs": [
                                [
                                    [
                                        53,
                                        5
                                    ],
                                    [
                                        53,
                                        50
                                    ]
                                ],
                                [
                                    [
                                        71,
                                        5
                                    ],
                                    [
                                        71,
                                        54
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "extension_count",
                            "refs": [
                                [
                                    [
                                        54,
                                        5
                                    ],
                                    [
                                        54,
                                        31
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "created_at",
                            "refs": [
                                [
                                    [
                                        55,
                                        5
                                    ],
                                    [
                                        55,
                                        49
                                    ]
                                ],
                                [
                                    [
                                        74,
                                        5
                                    ],
                                    [
                                        74,
                                        49
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "updated_at",
                            "refs": [
                                [
                                    [
                                        56,
                                        5
                                    ],
                                    [
                                        56,
                                        77
                                    ]
                                ],
                                [
                                    [
                                        75,
                                        5
                                    ],
                                    [
                                        75,
                                        77
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "reservation_id",
                            "refs": [
                                [
                                    [
                                        67,
                                        5
                                    ],
                                    [
                                        67,
                                        45
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "reservation_date",
                            "refs": [
                                [
                                    [
                                        70,
                                        5
                                    ],
                                    [
                                        70,
                                        55
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "notification_sent",
                            "refs": [
                                [
                                    [
                                        72,
                                        5
                                    ],
                                    [
                                        72,
                                        37
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "expiry_date",
                            "refs": [
                                [
                                    [
                                        73,
                                        5
                                    ],
                                    [
                                        73,
                                        29
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "history_id",
                            "refs": [
                                [
                                    [
                                        100,
                                        5
                                    ],
                                    [
                                        100,
                                        41
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "action_type",
                            "refs": [
                                [
                                    [
                                        102,
                                        5
                                    ],
                                    [
                                        102,
                                        63
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "action_date",
                            "refs": [
                                [
                                    [
                                        103,
                                        5
                                    ],
                                    [
                                        103,
                                        50
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "previous_due_date",
                            "refs": [
                                [
                                    [
                                        104,
                                        5
                                    ],
                                    [
                                        104,
                                        35
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "new_due_date",
                            "refs": [
                                [
                                    [
                                        105,
                                        5
                                    ],
                                    [
                                        105,
                                        30
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "notes",
                            "refs": [
                                [
                                    [
                                        106,
                                        5
                                    ],
                                    [
                                        106,
                                        14
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "processed_by",
                            "refs": [
                                [
                                    [
                                        107,
                                        5
                                    ],
                                    [
                                        107,
                                        29
                                    ]
                                ]
                            ]
                        }
                    ],
                    "description": "# Bounded Context Overview: LoanProcess (대출/반납 프로세스)\n\n## Role\n회원의 도서 대출/반납/연장/예약 신청 및 승인, 대출 상태 변경, 대출 현황 및 연체 관리, 예약 처리와 연동된 도서 상태 변경을 담당한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- ReservationRequested\n- ReservationApproved\n- LoanReturned\n- LoanExtended\n- LoanStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을\n\n대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n```sql\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n```sql\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"대출 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 1,\n  \"description\": \"회원이 도서 대출을 신청함. 회원번호와 이름으로 본인 확인 후 대출할 도서를 선택함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\",\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"대출 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"대출 신청이 승인되어 도서가 회원에게 대출됨. 도서 상태가 자동으로 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"outputs\": [\n    \"대출 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"nextEvents\": [\n    \"LoanReturned\",\n    \"LoanExtended\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"예약 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 2,\n  \"description\": \"대출하려는 도서가 이미 대출 중일 경우 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"예약 정보\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"예약 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 3,\n  \"description\": \"예약 신청이 승인되어 예약이 등록됨. 도서가 반납되면 예약자에게 알림이 전송됨.\",\n  \"inputs\": [\n    \"예약 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"outputs\": [\n    \"예약 상태: 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출한 도서를 반납함. 도서 상태가 자동으로 '대출가능'으로 변경됨. 예약자가 있으면 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능 또는 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"연장된 대출 정보\",\n    \"반납예정일 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanStatusChanged\",\n  \"displayName\": \"대출 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 4,\n  \"description\": \"대출 건의 상태(대출중/연체/반납완료 등)가 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"상태 변경 트리거(반납, 연체 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 대출 상태\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcess-BookManagement\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (BookManagement)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.\n\n### BookManagement-LoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.",
                    "traceMap": {
                        "4": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "7": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "8": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "9": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "10": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "11": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "12": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "13": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "19": {
                            "refs": [
                                [
                                    [
                                        1,
                                        1
                                    ],
                                    [
                                        1,
                                        33
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "21": {
                            "refs": [
                                [
                                    [
                                        3,
                                        1
                                    ],
                                    [
                                        3,
                                        40
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "23": {
                            "refs": [
                                [
                                    [
                                        5,
                                        1
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "25": {
                            "refs": [
                                [
                                    [
                                        7,
                                        1
                                    ],
                                    [
                                        7,
                                        167
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "27": {
                            "refs": [
                                [
                                    [
                                        9,
                                        1
                                    ],
                                    [
                                        9,
                                        58
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "32": {
                            "refs": [
                                [
                                    [
                                        45,
                                        1
                                    ],
                                    [
                                        45,
                                        20
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "33": {
                            "refs": [
                                [
                                    [
                                        46,
                                        1
                                    ],
                                    [
                                        46,
                                        43
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "34": {
                            "refs": [
                                [
                                    [
                                        47,
                                        1
                                    ],
                                    [
                                        47,
                                        35
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "35": {
                            "refs": [
                                [
                                    [
                                        48,
                                        1
                                    ],
                                    [
                                        48,
                                        25
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "36": {
                            "refs": [
                                [
                                    [
                                        49,
                                        1
                                    ],
                                    [
                                        49,
                                        49
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "37": {
                            "refs": [
                                [
                                    [
                                        50,
                                        1
                                    ],
                                    [
                                        50,
                                        31
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "38": {
                            "refs": [
                                [
                                    [
                                        51,
                                        1
                                    ],
                                    [
                                        51,
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
                                        52,
                                        1
                                    ],
                                    [
                                        52,
                                        74
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "40": {
                            "refs": [
                                [
                                    [
                                        53,
                                        1
                                    ],
                                    [
                                        53,
                                        57
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "41": {
                            "refs": [
                                [
                                    [
                                        54,
                                        1
                                    ],
                                    [
                                        54,
                                        34
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "42": {
                            "refs": [
                                [
                                    [
                                        55,
                                        1
                                    ],
                                    [
                                        55,
                                        50
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "43": {
                            "refs": [
                                [
                                    [
                                        56,
                                        1
                                    ],
                                    [
                                        56,
                                        78
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "44": {
                            "refs": [
                                [
                                    [
                                        57,
                                        1
                                    ],
                                    [
                                        57,
                                        58
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "45": {
                            "refs": [
                                [
                                    [
                                        58,
                                        1
                                    ],
                                    [
                                        58,
                                        52
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "46": {
                            "refs": [
                                [
                                    [
                                        59,
                                        1
                                    ],
                                    [
                                        59,
                                        36
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "47": {
                            "refs": [
                                [
                                    [
                                        60,
                                        1
                                    ],
                                    [
                                        60,
                                        32
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "48": {
                            "refs": [
                                [
                                    [
                                        61,
                                        1
                                    ],
                                    [
                                        61,
                                        30
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "49": {
                            "refs": [
                                [
                                    [
                                        62,
                                        1
                                    ],
                                    [
                                        62,
                                        33
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "50": {
                            "refs": [
                                [
                                    [
                                        63,
                                        1
                                    ],
                                    [
                                        63,
                                        2
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "53": {
                            "refs": [
                                [
                                    [
                                        66,
                                        1
                                    ],
                                    [
                                        66,
                                        27
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "54": {
                            "refs": [
                                [
                                    [
                                        67,
                                        1
                                    ],
                                    [
                                        67,
                                        50
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "55": {
                            "refs": [
                                [
                                    [
                                        68,
                                        1
                                    ],
                                    [
                                        68,
                                        35
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "56": {
                            "refs": [
                                [
                                    [
                                        69,
                                        1
                                    ],
                                    [
                                        69,
                                        25
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "57": {
                            "refs": [
                                [
                                    [
                                        70,
                                        1
                                    ],
                                    [
                                        70,
                                        56
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "58": {
                            "refs": [
                                [
                                    [
                                        71,
                                        1
                                    ],
                                    [
                                        71,
                                        61
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "59": {
                            "refs": [
                                [
                                    [
                                        72,
                                        1
                                    ],
                                    [
                                        72,
                                        44
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "60": {
                            "refs": [
                                [
                                    [
                                        73,
                                        1
                                    ],
                                    [
                                        73,
                                        30
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "61": {
                            "refs": [
                                [
                                    [
                                        74,
                                        1
                                    ],
                                    [
                                        74,
                                        50
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "62": {
                            "refs": [
                                [
                                    [
                                        75,
                                        1
                                    ],
                                    [
                                        75,
                                        78
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "63": {
                            "refs": [
                                [
                                    [
                                        76,
                                        1
                                    ],
                                    [
                                        76,
                                        58
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "64": {
                            "refs": [
                                [
                                    [
                                        77,
                                        1
                                    ],
                                    [
                                        77,
                                        52
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "65": {
                            "refs": [
                                [
                                    [
                                        78,
                                        1
                                    ],
                                    [
                                        78,
                                        36
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "66": {
                            "refs": [
                                [
                                    [
                                        79,
                                        1
                                    ],
                                    [
                                        79,
                                        32
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "67": {
                            "refs": [
                                [
                                    [
                                        80,
                                        1
                                    ],
                                    [
                                        80,
                                        30
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "68": {
                            "refs": [
                                [
                                    [
                                        81,
                                        1
                                    ],
                                    [
                                        81,
                                        49
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "69": {
                            "refs": [
                                [
                                    [
                                        82,
                                        1
                                    ],
                                    [
                                        82,
                                        2
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "72": {
                            "refs": [
                                [
                                    [
                                        99,
                                        1
                                    ],
                                    [
                                        99,
                                        27
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "73": {
                            "refs": [
                                [
                                    [
                                        100,
                                        1
                                    ],
                                    [
                                        100,
                                        46
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "74": {
                            "refs": [
                                [
                                    [
                                        101,
                                        1
                                    ],
                                    [
                                        101,
                                        25
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "75": {
                            "refs": [
                                [
                                    [
                                        102,
                                        1
                                    ],
                                    [
                                        102,
                                        64
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "76": {
                            "refs": [
                                [
                                    [
                                        103,
                                        1
                                    ],
                                    [
                                        103,
                                        51
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "77": {
                            "refs": [
                                [
                                    [
                                        104,
                                        1
                                    ],
                                    [
                                        104,
                                        36
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "78": {
                            "refs": [
                                [
                                    [
                                        105,
                                        1
                                    ],
                                    [
                                        105,
                                        31
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "79": {
                            "refs": [
                                [
                                    [
                                        106,
                                        1
                                    ],
                                    [
                                        106,
                                        15
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "80": {
                            "refs": [
                                [
                                    [
                                        107,
                                        1
                                    ],
                                    [
                                        107,
                                        30
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "81": {
                            "refs": [
                                [
                                    [
                                        108,
                                        1
                                    ],
                                    [
                                        108,
                                        52
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "82": {
                            "refs": [
                                [
                                    [
                                        109,
                                        1
                                    ],
                                    [
                                        109,
                                        32
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "83": {
                            "refs": [
                                [
                                    [
                                        110,
                                        1
                                    ],
                                    [
                                        110,
                                        40
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "84": {
                            "refs": [
                                [
                                    [
                                        111,
                                        1
                                    ],
                                    [
                                        111,
                                        39
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "85": {
                            "refs": [
                                [
                                    [
                                        112,
                                        1
                                    ],
                                    [
                                        112,
                                        2
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "90": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "91": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "92": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "93": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "94": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "95": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "96": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "97": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "98": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "99": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "100": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "101": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "102": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "103": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "104": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "105": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "106": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "107": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "108": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "109": {
                            "refs": [
                                [
                                    [
                                        5,
                                        49
                                    ],
                                    [
                                        5,
                                        91
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "113": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "114": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "115": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "116": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "117": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "118": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "119": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "120": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "121": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "122": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "123": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "124": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "125": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "126": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "127": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "128": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "129": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "130": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "131": {
                            "refs": [
                                [
                                    [
                                        5,
                                        198
                                    ],
                                    [
                                        5,
                                        235
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "135": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "136": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "137": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "138": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "139": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "140": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "141": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "142": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "143": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "144": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "145": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "146": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "147": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "148": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "149": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "150": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "151": {
                            "refs": [
                                [
                                    [
                                        5,
                                        183
                                    ],
                                    [
                                        5,
                                        193
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "155": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "156": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "157": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "158": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "159": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "160": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "161": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "162": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "163": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "164": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "165": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "166": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "167": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "168": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "169": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "170": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "171": {
                            "refs": [
                                [
                                    [
                                        7,
                                        175
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "175": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "176": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "177": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "178": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "179": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "180": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "181": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "182": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "183": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "184": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "185": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "186": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "187": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "188": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "189": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "190": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "191": {
                            "refs": [
                                [
                                    [
                                        7,
                                        133
                                    ],
                                    [
                                        7,
                                        203
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "195": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "196": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "197": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "198": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "199": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "200": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "201": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "202": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "203": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "204": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "205": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "206": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "207": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "208": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "209": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "210": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "214": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "215": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "216": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "217": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "218": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "219": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "220": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "221": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "222": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "223": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "224": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "225": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "226": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "227": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "228": {
                            "refs": [
                                [
                                    [
                                        7,
                                        65
                                    ],
                                    [
                                        7,
                                        81
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "234": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "235": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "236": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "237": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "240": {
                            "refs": [
                                [
                                    [
                                        3,
                                        2
                                    ],
                                    [
                                        3,
                                        304
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "241": {
                            "refs": [
                                [
                                    [
                                        3,
                                        2
                                    ],
                                    [
                                        3,
                                        304
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "242": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "243": {
                            "refs": [
                                [
                                    [
                                        5,
                                        2
                                    ],
                                    [
                                        7,
                                        169
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        }
                    }
                }
            },
            "description": "# Bounded Context Overview: LoanProcess (대출/반납 프로세스)\n\n## Role\n회원의 도서 대출/반납/연장/예약 신청 및 승인, 대출 상태 변경, 대출 현황 및 연체 관리, 예약 처리와 연동된 도서 상태 변경을 담당한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- ReservationRequested\n- ReservationApproved\n- LoanReturned\n- LoanExtended\n- LoanStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을\n\n대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n```sql\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n```sql\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"대출 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 1,\n  \"description\": \"회원이 도서 대출을 신청함. 회원번호와 이름으로 본인 확인 후 대출할 도서를 선택함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\",\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"대출 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"대출 신청이 승인되어 도서가 회원에게 대출됨. 도서 상태가 자동으로 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태: 대출가능\"\n  ],\n  \"outputs\": [\n    \"대출 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"nextEvents\": [\n    \"LoanReturned\",\n    \"LoanExtended\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"예약 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 2,\n  \"description\": \"대출하려는 도서가 이미 대출 중일 경우 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"예약 정보\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"예약 승인됨\",\n  \"actor\": \"System\",\n  \"level\": 3,\n  \"description\": \"예약 신청이 승인되어 예약이 등록됨. 도서가 반납되면 예약자에게 알림이 전송됨.\",\n  \"inputs\": [\n    \"예약 정보\",\n    \"도서 상태: 대출중\"\n  ],\n  \"outputs\": [\n    \"예약 상태: 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출한 도서를 반납함. 도서 상태가 자동으로 '대출가능'으로 변경됨. 예약자가 있으면 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능 또는 예약중\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"연장된 대출 정보\",\n    \"반납예정일 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanStatusChanged\",\n  \"displayName\": \"대출 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 4,\n  \"description\": \"대출 건의 상태(대출중/연체/반납완료 등)가 변경됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"상태 변경 트리거(반납, 연체 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 대출 상태\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcess-BookManagement\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (BookManagement)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다.\n\n### BookManagement-LoanProcess\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 대출/반납/예약 이벤트 발생 시 도서 상태 변경이 필요하므로, 이벤트 발행(Pub) 후 도서 관리 컨텍스트에서 구독(Sub)하여 상태를 변경한다. 이는 도메인 간 결합도를 낮추고 확장성을 높인다.\n- **Interaction Pattern**: 대출/반납/예약 처리 시 LoanProcess에서 BookManagement로 도서 상태 변경 이벤트를 발행한다."
        }
    },
    projectInfo: {
        "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
        "ddl": "-- 회원 테이블\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
    }
}