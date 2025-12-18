export const mockedEsProxyNewJobParamsForRun = {
    "selectedDraftOptions": {
        "BookManagement": {
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
                            "name": "ISBN",
                            "alias": "ISBN",
                            "referencedAggregateName": ""
                        },
                        {
                            "name": "BookCategoryReference",
                            "alias": "도서 카테고리 참조",
                            "referencedAggregate": {
                                "name": "BookCategory",
                                "alias": "도서 카테고리"
                            }
                        },
                        {
                            "name": "StatusHistoryReference",
                            "alias": "상태 변경 이력 참조",
                            "referencedAggregate": {
                                "name": "StatusHistory",
                                "alias": "상태 변경 이력"
                            }
                        },
                        {
                            "name": "LoanHistoryReference",
                            "alias": "대출 이력 참조",
                            "referencedAggregate": {
                                "name": "LoanHistory",
                                "alias": "대출 이력"
                            }
                        }
                    ],
                    "previewAttributes": [
                        "book_id",
                        "title",
                        "isbn",
                        "author",
                        "publisher",
                        "category",
                        "status",
                        "registration_date",
                        "disposal_date",
                        "disposal_reason",
                        "created_at",
                        "updated_at",
                        "history_id",
                        "previous_status",
                        "new_status",
                        "change_reason",
                        "changed_by",
                        "change_date"
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
                            "alias": "카테고리 유형"
                        }
                    ],
                    "valueObjects": [],
                    "previewAttributes": []
                }
            ],
            "pros": {
                "cohesion": "도서 정보와 카테고리 관리가 분리되어 각 Aggregate가 명확한 책임을 가집니다.",
                "coupling": "카테고리 확장, 다국어 지원 등 BookCategory Aggregate만 수정하면 되므로 결합도가 낮아집니다.",
                "consistency": "도서 상태 변경 등 핵심 비즈니스 규칙은 Book Aggregate 내에서 보장되고, 카테고리 관리 규칙은 별도 Aggregate에서 관리됩니다.",
                "encapsulation": "카테고리 관리 로직이 별도 Aggregate에 캡슐화되어, 도서 관리와 독립적으로 발전시킬 수 있습니다.",
                "complexity": "카테고리 관리, 도서 관리가 분리되어 각 도메인별 복잡도가 낮아지고, 유지보수가 쉬워집니다.",
                "independence": "카테고리 정책 변경, 신규 카테고리 추가 등 BookCategory Aggregate만 독립적으로 확장할 수 있습니다.",
                "performance": "카테고리 변경, 조회 등은 BookCategory Aggregate에서 독립적으로 처리되어, 도서 관리와 분산 처리 및 확장이 용이합니다."
            },
            "cons": {
                "cohesion": "도서 등록, 상태 변경 시 카테고리 참조가 필요해 두 Aggregate 간 연동이 필수적입니다.",
                "coupling": "도서와 카테고리 간 참조가 추가되어, 일부 트랜잭션에서 두 Aggregate 동시 접근이 필요할 수 있습니다.",
                "consistency": "카테고리 변경이 도서에 미치는 영향(예: 카테고리 삭제 시 도서 처리 등)에 대한 추가 일관성 관리가 필요합니다.",
                "encapsulation": "도서 상태 변경과 카테고리 변경이 분리되어, 복합 비즈니스 규칙 구현 시 애플리케이션 서비스 계층에서 조정이 필요합니다.",
                "complexity": "두 Aggregate 간 연동 로직 및 참조 관리가 추가되어 전체 시스템 복잡도가 증가할 수 있습니다.",
                "independence": "도서 등록, 상태 변경 등 일부 작업에서 BookCategory Aggregate의 상태에 의존하게 됩니다.",
                "performance": "도서와 카테고리 정보를 동시에 조회할 때 조인 또는 추가 쿼리가 필요해 성능에 영향이 있을 수 있습니다."
            },
            "isAIRecommended": true,
            "boundedContext": {
                "name": "BookManagement",
                "alias": "도서 관리",
                "displayName": "도서 관리",
                "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 폐기, 상태 변경 등 도서의 라이프사이클을 관리하며, ISBN 중복 및 유효성 검증, 카테고리 관리, 도서 상태 전환(대출가능/대출중/예약중/폐기)을 담당한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\n도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 도서 관리 화면에서 등록함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 통과한 후 도서가 등록됨. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서(대출가능 상태)\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 상태가 자동으로 변경됨. 예: 등록 시 '대출가능', 대출 시 '대출중', 반납 시 '대출가능' 또는 '예약중', 폐기 시 '폐기' 등.\",\n  \"inputs\": [\n    \"도서 이벤트(등록/대출/반납/예약/폐기 등)\"\n  ],\n  \"outputs\": [\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 7,\n  \"description\": \"사서가 훼손되거나 분실된 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서명 또는 ISBN\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### BookManagement→LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이벤트가 대출/반납 프로세스와 연동되어야 하므로 이벤트 기반의 느슨한 결합이 적합하다.\n- **Interaction Pattern**: 도서 상태 변경 이벤트(BookStatusChanged 등)를 발행하면 대출/반납 처리 컨텍스트가 이를 구독하여 상태에 따라 대출 가능 여부를 판단한다.\n\n### BookManagement→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryTracking)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다.",
                "aggregates": [
                    {
                        "name": "Book",
                        "alias": "도서"
                    }
                ],
                "requirements": {
                    "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할",
                    "ddl": "도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                    "event": "{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 도서 관리 화면에서 등록함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 통과한 후 도서가 등록됨. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서(대출가능 상태)\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        57\n      ],\n      [\n        3,\n        177\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 상태가 자동으로 변경됨. 예: 등록 시 '대출가능', 대출 시 '대출중', 반납 시 '대출가능' 또는 '예약중', 폐기 시 '폐기' 등.\",\n  \"inputs\": [\n    \"도서 이벤트(등록/대출/반납/예약/폐기 등)\"\n  ],\n  \"outputs\": [\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        1\n      ],\n      [\n        3,\n        238\n      ]\n    ],\n    [\n      [\n        7,\n        150\n      ],\n      [\n        7,\n        159\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 7,\n  \"description\": \"사서가 훼손되거나 분실된 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서명 또는 ISBN\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        3,\n        264\n      ],\n      [\n        3,\n        286\n      ]\n    ]\n  ]\n}",
                    "eventNames": "BookRegistered, BookDiscarded, BookStatusChanged 이벤트가 발생할 수 있어.",
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
                            "fieldName": "category",
                            "refs": [
                                [
                                    [
                                        31,
                                        5
                                    ],
                                    [
                                        31,
                                        51
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "status",
                            "refs": [
                                [
                                    [
                                        32,
                                        5
                                    ],
                                    [
                                        32,
                                        22
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
                            "fieldName": "previous_status",
                            "refs": [
                                [
                                    [
                                        88,
                                        5
                                    ],
                                    [
                                        88,
                                        53
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "new_status",
                            "refs": [
                                [
                                    [
                                        89,
                                        5
                                    ],
                                    [
                                        89,
                                        56
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
                    "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 폐기, 상태 변경 등 도서의 라이프사이클을 관리하며, ISBN 중복 및 유효성 검증, 카테고리 관리, 도서 상태 전환(대출가능/대출중/예약중/폐기)을 담당한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\n도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 도서 관리 화면에서 등록함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 통과한 후 도서가 등록됨. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서(대출가능 상태)\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 상태가 자동으로 변경됨. 예: 등록 시 '대출가능', 대출 시 '대출중', 반납 시 '대출가능' 또는 '예약중', 폐기 시 '폐기' 등.\",\n  \"inputs\": [\n    \"도서 이벤트(등록/대출/반납/예약/폐기 등)\"\n  ],\n  \"outputs\": [\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 7,\n  \"description\": \"사서가 훼손되거나 분실된 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서명 또는 ISBN\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### BookManagement→LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이벤트가 대출/반납 프로세스와 연동되어야 하므로 이벤트 기반의 느슨한 결합이 적합하다.\n- **Interaction Pattern**: 도서 상태 변경 이벤트(BookStatusChanged 등)를 발행하면 대출/반납 처리 컨텍스트가 이를 구독하여 상태에 따라 대출 가능 여부를 판단한다.\n\n### BookManagement→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryTracking)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다.",
                    "commandNames": [
                        "RegisterBook",
                        "DiscardBook",
                        "ChangeBookStatus"
                    ],
                    "readModelNames": [
                        "BookList",
                        "BookDetail",
                        "CategoryList"
                    ]
                }
            },
            "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 폐기, 상태 변경 등 도서의 라이프사이클을 관리하며, ISBN 중복 및 유효성 검증, 카테고리 관리, 도서 상태 전환(대출가능/대출중/예약중/폐기)을 담당한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\n도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 도서 관리 화면에서 등록함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 통과한 후 도서가 등록됨. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서(대출가능 상태)\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 상태가 자동으로 변경됨. 예: 등록 시 '대출가능', 대출 시 '대출중', 반납 시 '대출가능' 또는 '예약중', 폐기 시 '폐기' 등.\",\n  \"inputs\": [\n    \"도서 이벤트(등록/대출/반납/예약/폐기 등)\"\n  ],\n  \"outputs\": [\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 7,\n  \"description\": \"사서가 훼손되거나 분실된 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서명 또는 ISBN\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### BookManagement→LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이벤트가 대출/반납 프로세스와 연동되어야 하므로 이벤트 기반의 느슨한 결합이 적합하다.\n- **Interaction Pattern**: 도서 상태 변경 이벤트(BookStatusChanged 등)를 발행하면 대출/반납 처리 컨텍스트가 이를 구독하여 상태에 따라 대출 가능 여부를 판단한다.\n\n### BookManagement→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryTracking)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다."
        },
        "LoanProcessing": {
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
                        },
                        {
                            "name": "LoanActionType",
                            "alias": "대출 처리 유형"
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
                            "name": "LoanHistoryReference",
                            "alias": "대출 이력 참조",
                            "referencedAggregate": {
                                "name": "LoanHistory",
                                "alias": "대출 이력"
                            }
                        }
                    ],
                    "previewAttributes": [
                        "loan_id",
                        "book_id",
                        "loan_date",
                        "due_date",
                        "return_date",
                        "loan_period_days",
                        "extension_count",
                        "history_id",
                        "action_type",
                        "action_date",
                        "previous_due_date",
                        "new_due_date",
                        "notes",
                        "processed_by",
                        "overdue_id",
                        "overdue_days",
                        "fine_amount",
                        "fine_paid",
                        "notification_count",
                        "last_notification_date"
                    ]
                },
                {
                    "aggregate": {
                        "name": "Member",
                        "alias": "회원"
                    },
                    "enumerations": [
                        {
                            "name": "MemberStatus",
                            "alias": "회원 상태"
                        }
                    ],
                    "valueObjects": [],
                    "previewAttributes": [
                        "member_id",
                        "member_name",
                        "phone",
                        "email",
                        "address",
                        "registration_date",
                        "status",
                        "created_at",
                        "updated_at"
                    ]
                }
            ],
            "pros": {
                "cohesion": "대출 트랜잭션과 회원 정보가 각각의 Aggregate에 집중되어 있어 각자의 책임이 명확하다.",
                "coupling": "Book, LoanHistory 등 외부 Aggregate는 ValueObject 참조로만 연결되어 결합도가 낮다.",
                "consistency": "대출 생성, 연장, 반납 등 주요 비즈니스 규칙이 Loan Aggregate 내부에서 원자적으로 보장된다.",
                "encapsulation": "대출 상태 전이, 연장, 반납 로직이 Loan Aggregate 내부에 캡슐화되어 도메인 규칙 노출이 최소화된다.",
                "complexity": "Aggregate 수가 적어 전체 구조가 단순하고 유지보수가 용이하다.",
                "independence": "대출과 회원 관리가 독립적으로 진화할 수 있다.",
                "performance": "대출 관련 조회 및 변경이 단일 Aggregate 내에서 처리되어 트랜잭션 효율이 높다."
            },
            "cons": {
                "cohesion": "연체 관리, 벌금 등 확장 요구가 발생할 경우 Loan Aggregate가 비대해질 수 있다.",
                "coupling": "연체, 벌금 등 추가 도메인 개념이 Loan에 집중되어 결합도가 증가할 수 있다.",
                "consistency": "연체 기록 등 세부 관리가 Loan 내부에 포함되면 트랜잭션 경계가 커질 수 있다.",
                "encapsulation": "Loan이 너무 많은 책임을 가지면 도메인 규칙 분리가 어려워질 수 있다.",
                "complexity": "대출, 연장, 반납, 연체 등 다양한 상태와 로직이 Loan에 집중되어 복잡도가 증가할 수 있다.",
                "independence": "연체 관리 등 신규 기능 추가 시 Loan에 영향이 커진다.",
                "performance": "Loan에 연체 정보까지 포함하면 빈번한 업데이트로 인한 성능 저하가 발생할 수 있다."
            },
            "isAIRecommended": false,
            "boundedContext": {
                "name": "LoanProcessing",
                "alias": "대출/반납 처리",
                "displayName": "대출/반납 처리",
                "description": "# Bounded Context Overview: LoanProcessing (대출/반납 처리)\n\n## Role\n회원 인증, 도서 대출/반납/연장, 대출 상태 관리, 대출 가능 여부 및 예약 연동 등 대출 프로세스 전반을 담당한다.\n\n## Key Events\n- BookLoaned\n- BookLoanExtended\n- BookReturned\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n```\n```sql\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n```sql\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n```sql\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookLoaned\",\n  \"displayName\": \"도서 대출됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 도서 대출/반납 화면에서 회원 인증 후 대출할 도서를 선택하고 대출 기간을 지정하여 대출을 완료함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 기록\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"nextEvents\": [\n    \"BookLoanExtended\",\n    \"BookReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookLoanExtended\",\n  \"displayName\": \"도서 대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 현황 화면에서 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\"\n  ],\n  \"nextEvents\": [\n    \"BookReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 중인 도서를 반납함. 도서 상태가 '대출가능' 또는 예약자가 있을 경우 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\"\n  ],\n  \"outputs\": [\n    \"반납 기록\",\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n## Context Relations\n\n### BookManagement→LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이벤트가 대출/반납 프로세스와 연동되어야 하므로 이벤트 기반의 느슨한 결합이 적합하다.\n- **Interaction Pattern**: 도서 상태 변경 이벤트(BookStatusChanged 등)를 발행하면 대출/반납 처리 컨텍스트가 이를 구독하여 상태에 따라 대출 가능 여부를 판단한다.\n\n### LoanProcessing→reservation-notification\n- **Type**: Request/Response\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 예약 및 알림 기능은 PBC로 제공되며, Generic Domain이므로 Request/Response 패턴을 사용해야 한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 예약 요청이 발생하면 예약 & 알림 서비스에 동기적으로 예약 요청을 전달한다.\n\n### LoanProcessing→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryTracking)\n- **Reason**: 대출/반납/연장 등 주요 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 이력을 기록한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 대출/반납/연장 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 대출 이력을 기록한다.",
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
                "requirements": {
                    "userStory": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할",
                    "ddl": "CREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
                    "event": "{\n  \"name\": \"BookLoaned\",\n  \"displayName\": \"도서 대출됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 도서 대출/반납 화면에서 회원 인증 후 대출할 도서를 선택하고 대출 기간을 지정하여 대출을 완료함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 기록\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"nextEvents\": [\n    \"BookLoanExtended\",\n    \"BookReturned\"\n  ],\n  \"refs\": [\n    [\n      [\n        5,\n        23\n      ],\n      [\n        5,\n        203\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookLoanExtended\",\n  \"displayName\": \"도서 대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 현황 화면에서 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\"\n  ],\n  \"nextEvents\": [\n    \"BookReturned\"\n  ],\n  \"refs\": [\n    [\n      [\n        7,\n        109\n      ],\n      [\n        7,\n        110\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 중인 도서를 반납함. 도서 상태가 '대출가능' 또는 예약자가 있을 경우 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\"\n  ],\n  \"outputs\": [\n    \"반납 기록\",\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        7,\n        58\n      ],\n      [\n        7,\n        59\n      ]\n    ],\n    [\n      [\n        7,\n        175\n      ],\n      [\n        7,\n        203\n      ]\n    ]\n  ]\n}",
                    "eventNames": "BookLoaned, BookLoanExtended, BookReturned 이벤트가 발생할 수 있어.",
                    "ddlFields": [
                        {
                            "fieldName": "member_id",
                            "refs": [
                                [
                                    [
                                        13,
                                        5
                                    ],
                                    [
                                        13,
                                        37
                                    ]
                                ],
                                [
                                    [
                                        47,
                                        5
                                    ],
                                    [
                                        47,
                                        34
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "member_name",
                            "refs": [
                                [
                                    [
                                        14,
                                        5
                                    ],
                                    [
                                        14,
                                        37
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "phone",
                            "refs": [
                                [
                                    [
                                        15,
                                        5
                                    ],
                                    [
                                        15,
                                        21
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "email",
                            "refs": [
                                [
                                    [
                                        16,
                                        5
                                    ],
                                    [
                                        16,
                                        22
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "address",
                            "refs": [
                                [
                                    [
                                        17,
                                        5
                                    ],
                                    [
                                        17,
                                        16
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "registration_date",
                            "refs": [
                                [
                                    [
                                        18,
                                        5
                                    ],
                                    [
                                        18,
                                        56
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "status",
                            "refs": [
                                [
                                    [
                                        19,
                                        5
                                    ],
                                    [
                                        19,
                                        24
                                    ]
                                ],
                                [
                                    [
                                        53,
                                        5
                                    ],
                                    [
                                        53,
                                        21
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "created_at",
                            "refs": [
                                [
                                    [
                                        20,
                                        5
                                    ],
                                    [
                                        20,
                                        49
                                    ]
                                ],
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
                                        123,
                                        5
                                    ],
                                    [
                                        123,
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
                                        21,
                                        5
                                    ],
                                    [
                                        21,
                                        77
                                    ]
                                ],
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
                                        124,
                                        5
                                    ],
                                    [
                                        124,
                                        77
                                    ]
                                ]
                            ]
                        },
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
                                        42
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
                                ],
                                [
                                    [
                                        117,
                                        5
                                    ],
                                    [
                                        117,
                                        24
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
                                        71
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
                                        33
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
                                        45
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
                        },
                        {
                            "fieldName": "overdue_id",
                            "refs": [
                                [
                                    [
                                        116,
                                        5
                                    ],
                                    [
                                        116,
                                        45
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "overdue_days",
                            "refs": [
                                [
                                    [
                                        118,
                                        5
                                    ],
                                    [
                                        118,
                                        29
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "fine_amount",
                            "refs": [
                                [
                                    [
                                        119,
                                        5
                                    ],
                                    [
                                        119,
                                        42
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "fine_paid",
                            "refs": [
                                [
                                    [
                                        120,
                                        5
                                    ],
                                    [
                                        120,
                                        35
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "notification_count",
                            "refs": [
                                [
                                    [
                                        121,
                                        5
                                    ],
                                    [
                                        121,
                                        36
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "last_notification_date",
                            "refs": [
                                [
                                    [
                                        122,
                                        5
                                    ],
                                    [
                                        122,
                                        40
                                    ]
                                ]
                            ]
                        }
                    ],
                    "description": "# Bounded Context Overview: LoanProcessing (대출/반납 처리)\n\n## Role\n회원 인증, 도서 대출/반납/연장, 대출 상태 관리, 대출 가능 여부 및 예약 연동 등 대출 프로세스 전반을 담당한다.\n\n## Key Events\n- BookLoaned\n- BookLoanExtended\n- BookReturned\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n```\n```sql\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n```sql\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n```sql\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookLoaned\",\n  \"displayName\": \"도서 대출됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 도서 대출/반납 화면에서 회원 인증 후 대출할 도서를 선택하고 대출 기간을 지정하여 대출을 완료함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 기록\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"nextEvents\": [\n    \"BookLoanExtended\",\n    \"BookReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookLoanExtended\",\n  \"displayName\": \"도서 대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 현황 화면에서 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\"\n  ],\n  \"nextEvents\": [\n    \"BookReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 중인 도서를 반납함. 도서 상태가 '대출가능' 또는 예약자가 있을 경우 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\"\n  ],\n  \"outputs\": [\n    \"반납 기록\",\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n## Context Relations\n\n### BookManagement→LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이벤트가 대출/반납 프로세스와 연동되어야 하므로 이벤트 기반의 느슨한 결합이 적합하다.\n- **Interaction Pattern**: 도서 상태 변경 이벤트(BookStatusChanged 등)를 발행하면 대출/반납 처리 컨텍스트가 이를 구독하여 상태에 따라 대출 가능 여부를 판단한다.\n\n### LoanProcessing→reservation-notification\n- **Type**: Request/Response\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 예약 및 알림 기능은 PBC로 제공되며, Generic Domain이므로 Request/Response 패턴을 사용해야 한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 예약 요청이 발생하면 예약 & 알림 서비스에 동기적으로 예약 요청을 전달한다.\n\n### LoanProcessing→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryTracking)\n- **Reason**: 대출/반납/연장 등 주요 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 이력을 기록한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 대출/반납/연장 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 대출 이력을 기록한다.",
                    "commandNames": [
                        "LoanBook",
                        "ReserveBook",
                        "ReturnBook",
                        "ExtendLoan"
                    ],
                    "readModelNames": [
                        "LoanStatusList",
                        "BookSearch"
                    ]
                }
            },
            "description": "# Bounded Context Overview: LoanProcessing (대출/반납 처리)\n\n## Role\n회원 인증, 도서 대출/반납/연장, 대출 상태 관리, 대출 가능 여부 및 예약 연동 등 대출 프로세스 전반을 담당한다.\n\n## Key Events\n- BookLoaned\n- BookLoanExtended\n- BookReturned\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야\n\n대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n```\n```sql\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n```sql\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n```sql\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookLoaned\",\n  \"displayName\": \"도서 대출됨\",\n  \"actor\": \"Member\",\n  \"level\": 3,\n  \"description\": \"회원이 도서 대출/반납 화면에서 회원 인증 후 대출할 도서를 선택하고 대출 기간을 지정하여 대출을 완료함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"이름\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 기록\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"nextEvents\": [\n    \"BookLoanExtended\",\n    \"BookReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookLoanExtended\",\n  \"displayName\": \"도서 대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 현황 화면에서 대출 중인 도서의 대출 기간을 연장함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\"\n  ],\n  \"nextEvents\": [\n    \"BookReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 중인 도서를 반납함. 도서 상태가 '대출가능' 또는 예약자가 있을 경우 '예약중'으로 변경됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서명 또는 ISBN\"\n  ],\n  \"outputs\": [\n    \"반납 기록\",\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n## Context Relations\n\n### BookManagement→LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이벤트가 대출/반납 프로세스와 연동되어야 하므로 이벤트 기반의 느슨한 결합이 적합하다.\n- **Interaction Pattern**: 도서 상태 변경 이벤트(BookStatusChanged 등)를 발행하면 대출/반납 처리 컨텍스트가 이를 구독하여 상태에 따라 대출 가능 여부를 판단한다.\n\n### LoanProcessing→reservation-notification\n- **Type**: Request/Response\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 예약 및 알림 기능은 PBC로 제공되며, Generic Domain이므로 Request/Response 패턴을 사용해야 한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 예약 요청이 발생하면 예약 & 알림 서비스에 동기적으로 예약 요청을 전달한다.\n\n### LoanProcessing→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryTracking)\n- **Reason**: 대출/반납/연장 등 주요 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 이력을 기록한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 대출/반납/연장 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 대출 이력을 기록한다."
        },
        "HistoryTracking": {
            "structure": [
                {
                    "aggregate": {
                        "name": "HistoryRecord",
                        "alias": "통합 이력 기록"
                    },
                    "enumerations": [
                        {
                            "name": "HistoryType",
                            "alias": "이력 유형"
                        },
                        {
                            "name": "BookStatus",
                            "alias": "도서 상태"
                        },
                        {
                            "name": "LoanActionType",
                            "alias": "대출 처리 유형"
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
                            "name": "LoanReference",
                            "alias": "대출 참조",
                            "referencedAggregate": {
                                "name": "Loan",
                                "alias": "대출"
                            }
                        }
                    ],
                    "previewAttributes": [
                        "history_id",
                        "book_id",
                        "previous_status",
                        "new_status",
                        "change_reason",
                        "changed_by",
                        "change_date",
                        "loan_id",
                        "action_type",
                        "action_date",
                        "previous_due_date",
                        "new_due_date",
                        "notes",
                        "processed_by"
                    ]
                }
            ],
            "pros": {
                "cohesion": "모든 이력 데이터가 하나의 Aggregate에 통합되어 있어, 복합 이력 조회 및 통계 처리에 최적화되어 있습니다.",
                "coupling": "이력 간 상호 참조나 복합 이벤트 처리 시, 단일 Aggregate 내에서 모두 처리할 수 있어 구현이 단순해집니다.",
                "consistency": "대출 이력과 상태 변경 이력이 동시에 기록되어야 할 때, 단일 트랜잭션으로 원자성 보장이 쉽습니다.",
                "encapsulation": "이력 관련 모든 도메인 규칙이 한 곳에 집중되어 있어, 규칙 변경 시 일관성 있게 관리할 수 있습니다.",
                "complexity": "복합 이력 관리 및 통합 리포트 기능 구현이 단순해집니다.",
                "independence": "이력 관리 기능 자체는 독립적으로 진화할 수 있습니다.",
                "performance": "복합 이력 조회 시 단일 Aggregate만 접근하면 되므로, 조회 성능이 우수합니다."
            },
            "cons": {
                "cohesion": "대출 이력과 상태 변경 이력의 도메인 규칙이 혼합되어, 단일 책임 원칙이 약화됩니다.",
                "coupling": "이력 유형별로 관리 정책이 달라질 경우, Aggregate 내부가 복잡해지고 변경 영향 범위가 넓어집니다.",
                "consistency": "이력 유형별로 트랜잭션 분리가 어렵고, 특정 이력만 독립적으로 관리하기 힘듭니다.",
                "encapsulation": "이력 유형별로 도메인 규칙을 분리하기 어렵고, 규칙 누락 가능성이 높아집니다.",
                "complexity": "Aggregate가 커질수록 관리 및 테스트가 어려워지고, 신규 이력 유형 추가 시 영향도가 커집니다.",
                "independence": "이력 유형별로 독립적 확장이나 변경이 어렵고, 전체 이력 관리 정책에 영향을 미칠 수 있습니다.",
                "performance": "이력 데이터가 대량으로 누적될 경우, 단일 Aggregate의 저장/조회 성능 저하 및 확장성 문제가 발생할 수 있습니다."
            },
            "isAIRecommended": true,
            "boundedContext": {
                "name": "HistoryTracking",
                "alias": "이력 관리",
                "displayName": "이력 관리",
                "description": "# Bounded Context Overview: HistoryTracking (이력 관리)\n\n## Role\n도서별 대출 이력과 상태 변경 이력을 기록 및 조회하여 도서의 상태 변화를 추적한다.\n\n## Key Events\n- BookLoanHistoryRecorded\n- BookStatusHistoryRecorded\n\n# Requirements\n\n## userStory\n\n대출 이력\n\n력과 상\n\n## DDL\n\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n```sql\n대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookLoanHistoryRecorded\",\n  \"displayName\": \"도서 대출 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"도서의 대출 및 반납, 연장 등 주요 상태 변경 시 대출 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 이벤트(대출/반납/연장)\"\n  ],\n  \"outputs\": [\n    \"대출 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusHistoryRecorded\",\n  \"displayName\": \"도서 상태 변경 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 상태가 변경될 때마다 상태 변경 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 이벤트\"\n  ],\n  \"outputs\": [\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcessing→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 처리 (LoanProcessing)\n- **Reason**: 대출/반납/연장 등 주요 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 이력을 기록한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 대출/반납/연장 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 대출 이력을 기록한다.\n\n### BookManagement→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다.",
                "aggregates": [
                    {
                        "name": "LoanHistory",
                        "alias": "대출 이력"
                    },
                    {
                        "name": "StatusHistory",
                        "alias": "상태 변경 이력"
                    }
                ],
                "requirements": {
                    "userStory": "대출 이력\n력과 상",
                    "ddl": "도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);",
                    "event": "{\n  \"name\": \"BookLoanHistoryRecorded\",\n  \"displayName\": \"도서 대출 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"도서의 대출 및 반납, 연장 등 주요 상태 변경 시 대출 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 이벤트(대출/반납/연장)\"\n  ],\n  \"outputs\": [\n    \"대출 이력\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        9,\n        8\n      ],\n      [\n        9,\n        53\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookStatusHistoryRecorded\",\n  \"displayName\": \"도서 상태 변경 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 상태가 변경될 때마다 상태 변경 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 이벤트\"\n  ],\n  \"outputs\": [\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        9,\n        15\n      ],\n      [\n        9,\n        60\n      ]\n    ]\n  ]\n}",
                    "eventNames": "BookLoanHistoryRecorded, BookStatusHistoryRecorded 이벤트가 발생할 수 있어.",
                    "ddlFields": [
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
                                ],
                                [
                                    [
                                        100,
                                        5
                                    ],
                                    [
                                        100,
                                        45
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "book_id",
                            "refs": [
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
                            "fieldName": "previous_status",
                            "refs": [
                                [
                                    [
                                        88,
                                        5
                                    ],
                                    [
                                        88,
                                        24
                                    ]
                                ]
                            ]
                        },
                        {
                            "fieldName": "new_status",
                            "refs": [
                                [
                                    [
                                        89,
                                        5
                                    ],
                                    [
                                        89,
                                        56
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
                        },
                        {
                            "fieldName": "loan_id",
                            "refs": [
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
                    "description": "# Bounded Context Overview: HistoryTracking (이력 관리)\n\n## Role\n도서별 대출 이력과 상태 변경 이력을 기록 및 조회하여 도서의 상태 변화를 추적한다.\n\n## Key Events\n- BookLoanHistoryRecorded\n- BookStatusHistoryRecorded\n\n# Requirements\n\n## userStory\n\n대출 이력\n\n력과 상\n\n## DDL\n\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n```sql\n대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookLoanHistoryRecorded\",\n  \"displayName\": \"도서 대출 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"도서의 대출 및 반납, 연장 등 주요 상태 변경 시 대출 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 이벤트(대출/반납/연장)\"\n  ],\n  \"outputs\": [\n    \"대출 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusHistoryRecorded\",\n  \"displayName\": \"도서 상태 변경 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 상태가 변경될 때마다 상태 변경 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 이벤트\"\n  ],\n  \"outputs\": [\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcessing→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 처리 (LoanProcessing)\n- **Reason**: 대출/반납/연장 등 주요 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 이력을 기록한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 대출/반납/연장 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 대출 이력을 기록한다.\n\n### BookManagement→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다.",
                    "commandNames": [],
                    "readModelNames": [
                        "BookLoanHistory",
                        "BookStatusChangeHistory"
                    ]
                }
            },
            "description": "# Bounded Context Overview: HistoryTracking (이력 관리)\n\n## Role\n도서별 대출 이력과 상태 변경 이력을 기록 및 조회하여 도서의 상태 변화를 추적한다.\n\n## Key Events\n- BookLoanHistoryRecorded\n- BookStatusHistoryRecorded\n\n# Requirements\n\n## userStory\n\n대출 이력\n\n력과 상\n\n## DDL\n\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n```sql\n대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookLoanHistoryRecorded\",\n  \"displayName\": \"도서 대출 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"도서의 대출 및 반납, 연장 등 주요 상태 변경 시 대출 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 이벤트(대출/반납/연장)\"\n  ],\n  \"outputs\": [\n    \"대출 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusHistoryRecorded\",\n  \"displayName\": \"도서 상태 변경 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 상태가 변경될 때마다 상태 변경 이력이 자동으로 기록됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 이벤트\"\n  ],\n  \"outputs\": [\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcessing→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 처리 (LoanProcessing)\n- **Reason**: 대출/반납/연장 등 주요 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 이력을 기록한다.\n- **Interaction Pattern**: 대출/반납 처리 컨텍스트에서 대출/반납/연장 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 대출 이력을 기록한다.\n\n### BookManagement→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서 관리 (BookManagement)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다."
        }
    },
    "userInfo": {
        "name": "shinseongjin@uengine.org",
        "profile": "https://avatars.githubusercontent.com/u/163972132?v=4",
        "email": "shinseongjin@uengine.org",
        "uid": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
        "providerUid": "163972132",
        "savedCoin": 0,
        "savedToolTime": 0,
        "consultingTime": 0,
        "authorized": "admin"
    },
    "information": {
        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
        "authorEmail": "shinseongjin@uengine.org",
        "comment": "",
        "createdTimeStamp": 1761206260790,
        "lastModifiedTimeStamp": 1761206260790,
        "projectName": "untitled",
        "projectId": "163972132_es_e2f9a38a083d8750dd00a7e123630ce9",
        "type": "es"
    },
    "preferedLanguage": "Korean"
}