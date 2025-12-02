export const mockedCavnasValueForTest = {
    "elements": {
        "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe": {
            "_type": "org.uengine.modeling.model.BoundedContext",
            "aggregates": [
                {
                    "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
                }
            ],
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "definitionId": "163972132_es_cb36734a8c1a52d239ea82f54759d27c",
            "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 폐기, 상태 변경 등 도서의 라이프사이클을 관리하며, ISBN 중복 및 유효성 검증, 카테고리 관리, 도서 상태 전환(대출가능/대출중/예약중/폐기)을 담당한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## DDL\n\n```sql\n도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 도서 관리 화면에서 등록함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 통과한 후 도서가 등록됨. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서(대출가능 상태)\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 상태가 자동으로 변경됨. 예: 등록 시 '대출가능', 대출 시 '대출중', 반납 시 '대출가능' 또는 '예약중', 폐기 시 '폐기' 등.\",\n  \"inputs\": [\n    \"도서 이벤트(등록/대출/반납/예약/폐기 등)\"\n  ],\n  \"outputs\": [\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 7,\n  \"description\": \"사서가 훼손되거나 분실된 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서명 또는 ISBN\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### BookManagement→LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서의 상태(대출가능/대출중/예약중/폐기 등) 변경 이벤트가 대출/반납 프로세스와 연동되어야 하므로 이벤트 기반의 느슨한 결합이 적합하다.\n- **Interaction Pattern**: 도서 상태 변경 이벤트(BookStatusChanged 등)를 발행하면 대출/반납 처리 컨텍스트가 이를 구독하여 상태에 따라 대출 가능 여부를 판단한다.\n\n### BookManagement→HistoryTracking\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryTracking)\n- **Reason**: 도서 등록, 폐기, 상태 변경 등 이벤트 발생 시 이력 관리 컨텍스트가 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다.",
            "displayName": "도서 관리",
            "elementView": {
                "_type": "org.uengine.modeling.model.BoundedContext",
                "height": 1236,
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe",
                "style": "{}",
                "width": 1086,
                "x": 862,
                "y": 770
            },
            "gitURL": null,
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                "height": 350,
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe",
                "style": "{}",
                "width": 350,
                "x": 235,
                "y": 365
            },
            "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe",
            "members": [],
            "name": "BookManagement",
            "oldName": "",
            "policies": [],
            "portGenerated": 8080,
            "preferredPlatform": "template-spring-boot",
            "preferredPlatformConf": {},
            "requirements": {
                "commandNames": [
                    "RegisterBook",
                    "DiscardBook",
                    "ChangeBookStatus"
                ],
                "ddl": "도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
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
                "event": "{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 도서 관리 화면에서 등록함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 통과한 후 도서가 등록됨. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서(대출가능 상태)\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        57\n      ],\n      [\n        3,\n        177\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 상태가 자동으로 변경됨. 예: 등록 시 '대출가능', 대출 시 '대출중', 반납 시 '대출가능' 또는 '예약중', 폐기 시 '폐기' 등.\",\n  \"inputs\": [\n    \"도서 이벤트(등록/대출/반납/예약/폐기 등)\"\n  ],\n  \"outputs\": [\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        1\n      ],\n      [\n        3,\n        238\n      ]\n    ],\n    [\n      [\n        7,\n        150\n      ],\n      [\n        7,\n        159\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 7,\n  \"description\": \"사서가 훼손되거나 분실된 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서명 또는 ISBN\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'\"\n  ],\n  \"nextEvents\": [],\n  \"refs\": [\n    [\n      [\n        3,\n        264\n      ],\n      [\n        3,\n        286\n      ]\n    ]\n  ]\n}",
                "eventNames": "BookRegistered, BookDiscarded, BookStatusChanged 이벤트가 발생할 수 있어.",
                "readModelNames": [
                    "BookList",
                    "BookDetail",
                    "CategoryList"
                ],
                "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할"
            },
            "rotateStatus": false,
            "tempId": "",
            "templatePerElements": {},
            "traceName": "BookManagement",
            "views": []
        },
        "b396bab8-0b7b-472b-8f67-e5083f0c9df4": {
            "_type": "org.uengine.modeling.model.Aggregate",
            "aggregateRoot": {
                "_type": "org.uengine.modeling.model.AggregateRoot",
                "entities": {
                    "elements": {
                        "2e482e1c-5d3a-4f49-bbab-737bfe54250f": {
                            "_type": "org.uengine.uml.model.enum",
                            "displayName": "도서 카테고리",
                            "elementView": {
                                "_type": "org.uengine.uml.model.enum",
                                "height": 100,
                                "id": "2e482e1c-5d3a-4f49-bbab-737bfe54250f",
                                "style": "{}",
                                "subEdgeH": 50,
                                "titleH": 50,
                                "width": 200,
                                "x": 950,
                                "y": 456
                            },
                            "id": "2e482e1c-5d3a-4f49-bbab-737bfe54250f",
                            "items": [
                                {
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "FICTION",
                                    "value": "FICTION"
                                },
                                {
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "NON_FICTION",
                                    "value": "NON_FICTION"
                                },
                                {
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "ACADEMIC",
                                    "value": "ACADEMIC"
                                },
                                {
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "MAGAZINE",
                                    "value": "MAGAZINE"
                                }
                            ],
                            "name": "BookCategory",
                            "nameCamelCase": "bookCategory",
                            "namePascalCase": "BookCategory",
                            "namePlural": "bookCategories",
                            "refs": [
                                [
                                    [
                                        1,
                                        1
                                    ],
                                    [
                                        1,
                                        50
                                    ]
                                ]
                            ],
                            "relations": [],
                            "selected": false,
                            "traceName": "BookCategory",
                            "useKeyValue": false
                        },
                        "3e52635e-63e9-4df0-bf27-b13902454b7d": {
                            "_type": "org.uengine.uml.model.vo.Class",
                            "displayName": "ISBN",
                            "elementView": {
                                "_type": "org.uengine.uml.model.vo.address.Class",
                                "fieldH": 150,
                                "height": 100,
                                "id": "3e52635e-63e9-4df0-bf27-b13902454b7d",
                                "methodH": 30,
                                "style": "{}",
                                "subEdgeH": 170,
                                "titleH": 50,
                                "width": 200,
                                "x": 700,
                                "y": 152
                            },
                            "fieldDescriptors": [
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "String",
                                    "displayName": "",
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "isOverrideField": false,
                                    "label": "- isbn: String",
                                    "name": "isbn",
                                    "nameCamelCase": "isbn",
                                    "namePascalCase": "Isbn",
                                    "referenceClass": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "isbn"
                                }
                            ],
                            "groupElement": null,
                            "id": "3e52635e-63e9-4df0-bf27-b13902454b7d",
                            "isAbstract": false,
                            "isAggregateRoot": false,
                            "isInterface": false,
                            "isVO": true,
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "namePlural": "isbns",
                            "operations": [],
                            "parentOperations": [],
                            "refs": [
                                [
                                    [
                                        1,
                                        1
                                    ],
                                    [
                                        1,
                                        50
                                    ]
                                ]
                            ],
                            "relationType": null,
                            "relations": [],
                            "selected": false,
                            "traceName": "ISBN"
                        },
                        "5095702d-1dcd-441d-8c6c-594da207a799": null,
                        "b2764edc-655a-4d16-bb58-364504ce1aa6": {
                            "_type": "org.uengine.uml.model.vo.Class",
                            "displayName": "",
                            "elementView": {
                                "_type": "org.uengine.uml.model.vo.address.Class",
                                "fieldH": 150,
                                "height": 100,
                                "id": "b2764edc-655a-4d16-bb58-364504ce1aa6",
                                "methodH": 30,
                                "style": "{}",
                                "subEdgeH": 170,
                                "titleH": 50,
                                "width": 200,
                                "x": 950,
                                "y": 152
                            },
                            "fieldDescriptors": [
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Long",
                                    "displayName": "",
                                    "isCopy": false,
                                    "isKey": true,
                                    "isList": false,
                                    "isOverrideField": true,
                                    "label": "- categoryId: Long",
                                    "name": "categoryId",
                                    "nameCamelCase": "categoryId",
                                    "namePascalCase": "CategoryId",
                                    "referenceClass": "BookCategory",
                                    "refs": null,
                                    "traceName": "categoryId"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "BookCategoryType",
                                    "displayName": "",
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "isOverrideField": false,
                                    "label": "- categoryType: BookCategoryType",
                                    "name": "categoryType",
                                    "nameCamelCase": "categoryType",
                                    "namePascalCase": "CategoryType",
                                    "referenceClass": null,
                                    "refs": null,
                                    "traceName": "categoryType"
                                }
                            ],
                            "groupElement": null,
                            "id": "b2764edc-655a-4d16-bb58-364504ce1aa6",
                            "isAbstract": false,
                            "isAggregateRoot": false,
                            "isInterface": false,
                            "isVO": true,
                            "name": "BookCategoryId",
                            "nameCamelCase": "bookCategoryId",
                            "namePascalCase": "BookCategoryId",
                            "namePlural": "bookCategoryIds",
                            "operations": [],
                            "parentOperations": [],
                            "refs": [],
                            "relationType": null,
                            "relations": [],
                            "selected": false,
                            "traceName": "BookCategoryId"
                        },
                        "efb1f68b-4215-4980-8b7a-6564edf8385d": {
                            "_type": "org.uengine.uml.model.Class",
                            "elementView": {
                                "_type": "org.uengine.uml.model.Class",
                                "fieldH": 90,
                                "height": 100,
                                "id": "efb1f68b-4215-4980-8b7a-6564edf8385d",
                                "methodH": 30,
                                "style": "{}",
                                "subEdgeH": 120,
                                "titleH": 50,
                                "width": 200,
                                "x": 200,
                                "y": 200
                            },
                            "fieldDescriptors": [
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Integer",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": true,
                                    "isList": false,
                                    "name": "bookId",
                                    "nameCamelCase": "bookId",
                                    "namePascalCase": "BookId",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "bookId"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "String",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "title",
                                    "nameCamelCase": "title",
                                    "namePascalCase": "Title",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "title"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "ISBN",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "isbn",
                                    "nameCamelCase": "isbn",
                                    "namePascalCase": "Isbn",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "isbn"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "String",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "author",
                                    "nameCamelCase": "author",
                                    "namePascalCase": "Author",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "author"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "String",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "publisher",
                                    "nameCamelCase": "publisher",
                                    "namePascalCase": "Publisher",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "publisher"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "BookCategory",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "category",
                                    "nameCamelCase": "category",
                                    "namePascalCase": "Category",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "category"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "BookStatus",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "status",
                                    "nameCamelCase": "status",
                                    "namePascalCase": "Status",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                4,
                                                77
                                            ]
                                        ]
                                    ],
                                    "traceName": "status"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Date",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "registrationDate",
                                    "nameCamelCase": "registrationDate",
                                    "namePascalCase": "RegistrationDate",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "registrationDate"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Date",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "disposalDate",
                                    "nameCamelCase": "disposalDate",
                                    "namePascalCase": "DisposalDate",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "disposalDate"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "String",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "disposalReason",
                                    "nameCamelCase": "disposalReason",
                                    "namePascalCase": "DisposalReason",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "disposalReason"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Date",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "createdAt",
                                    "nameCamelCase": "createdAt",
                                    "namePascalCase": "CreatedAt",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "createdAt"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Date",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "updatedAt",
                                    "nameCamelCase": "updatedAt",
                                    "namePascalCase": "UpdatedAt",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "updatedAt"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Integer",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "historyId",
                                    "nameCamelCase": "historyId",
                                    "namePascalCase": "HistoryId",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "historyId"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "BookStatus",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "previousStatus",
                                    "nameCamelCase": "previousStatus",
                                    "namePascalCase": "PreviousStatus",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                4,
                                                9
                                            ]
                                        ]
                                    ],
                                    "traceName": "previousStatus"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "BookStatus",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "newStatus",
                                    "nameCamelCase": "newStatus",
                                    "namePascalCase": "NewStatus",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "newStatus"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "String",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "changeReason",
                                    "nameCamelCase": "changeReason",
                                    "namePascalCase": "ChangeReason",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "changeReason"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "String",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "changedBy",
                                    "nameCamelCase": "changedBy",
                                    "namePascalCase": "ChangedBy",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "changedBy"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "Date",
                                    "displayName": "",
                                    "inputUI": null,
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "name": "changeDate",
                                    "nameCamelCase": "changeDate",
                                    "namePascalCase": "ChangeDate",
                                    "options": null,
                                    "refs": [
                                        [
                                            [
                                                1,
                                                1
                                            ],
                                            [
                                                1,
                                                50
                                            ]
                                        ]
                                    ],
                                    "traceName": "changeDate"
                                },
                                {
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "className": "BookCategoryId",
                                    "displayName": "",
                                    "isCopy": false,
                                    "isKey": false,
                                    "isList": false,
                                    "isOverrideField": true,
                                    "name": "bookCategoryId",
                                    "nameCamelCase": "bookCategoryId",
                                    "namePascalCase": "BookCategoryId",
                                    "referenceClass": "BookCategory",
                                    "refs": null,
                                    "traceName": "bookCategoryId"
                                }
                            ],
                            "id": "efb1f68b-4215-4980-8b7a-6564edf8385d",
                            "isAbstract": false,
                            "isAggregateRoot": true,
                            "isInterface": false,
                            "isVO": false,
                            "name": "Book",
                            "nameCamelCase": "book",
                            "namePascalCase": "Book",
                            "namePlural": "books",
                            "operations": [],
                            "parentId": "b396bab8-0b7b-472b-8f67-e5083f0c9df4",
                            "parentOperations": [],
                            "refs": [
                                [
                                    [
                                        1,
                                        45
                                    ],
                                    [
                                        4,
                                        95
                                    ]
                                ]
                            ],
                            "relationType": null,
                            "relations": [],
                            "selected": false,
                            "traceName": "Book"
                        }
                    },
                    "relations": {}
                },
                "fieldDescriptors": [
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "Integer",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": true,
                        "isList": false,
                        "isOverrideField": false,
                        "name": "bookId",
                        "nameCamelCase": "bookId",
                        "namePascalCase": "BookId",
                        "referenceClass": null,
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "bookId"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "isOverrideField": false,
                        "name": "title",
                        "nameCamelCase": "title",
                        "namePascalCase": "Title",
                        "referenceClass": null,
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "title"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "ISBN",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "isOverrideField": false,
                        "name": "isbn",
                        "nameCamelCase": "isbn",
                        "namePascalCase": "Isbn",
                        "referenceClass": null,
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "isbn"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "isOverrideField": false,
                        "name": "publisher",
                        "nameCamelCase": "publisher",
                        "namePascalCase": "Publisher",
                        "referenceClass": null,
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "publisher"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "BookCategory",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "isOverrideField": false,
                        "name": "category",
                        "nameCamelCase": "category",
                        "namePascalCase": "Category",
                        "referenceClass": null,
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "category"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "BookStatus",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "isOverrideField": false,
                        "name": "status",
                        "nameCamelCase": "status",
                        "namePascalCase": "Status",
                        "referenceClass": null,
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    4,
                                    77
                                ]
                            ]
                        ],
                        "traceName": "status"
                    }
                ],
                "operations": [
                    {
                        "name": "RegisterBook",
                        "class": "Book",
                        "returnType": "void",
                        "parameters": [],
                        "label": "+ RegisterBook(): void",
                        "isOverride": false,
                        "isRootMethod": false
                    }
                ]
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "commands": [],
            "description": "* Inference(When generating the aggregate)\n**My Approach to Modeling the Book Management Context**\n\nAlright, I've got a handle on the task at hand. The core of it is building a DDD-compliant structure for managing books, but with some very specific constraints that I need to be mindful of. My expert understanding of DDD tells me that I should, ideally, separate the status history data into its own entity, but the instructions require me to fit it into the `Book` aggregate. This means I'll need to make some pragmatic design choices that prioritize the given requirements over pure DDD principles, while still striving for a reasonable and understandable model.\n\nFirst, I need to define the building blocks: the ValueObjects and Enumerations. The `ISBN` is straightforward; it's a perfect candidate for a ValueObject because it has inherent validation rules (13 digits, unique) and represents a concept. Then I've got `BookStatus` which is clearly an Enumeration based on the provided DDL (대출가능, 대출중, 예약중, 폐기). I also need to create the `BookCategory` enumeration, which is implied by the `category` field and also provided in the DDL. So, I have `BookStatus` (AVAILABLE, ON_LOAN, RESERVED, DISCARDED) and `BookCategory` (FICTION, NON_FICTION, ACADEMIC, MAGAZINE).\n\nNow for the `Book` Aggregate itself. This is where things get interesting. I'll need to include the standard properties like `bookId`, `title`, `author`, `publisher`, `registrationDate`, and the disposal-related fields. I'll use the pre-defined VO and Enums for the `isbn`, `category` and `status` properties.\n\nThe tricky part is integrating the status history fields. Since I'm not allowed to create a separate `BookStatusHistory` entity, I'll need to put them in the `Book` Aggregate, even though conceptually, they really belong elsewhere. Given that I have no other options, I will add these fields directly to the `Book` Aggregate.  They are essentially related data about the current status of the book, so it makes sense in a way to add them, even if it goes against the normal DDD flow. I will keep in mind that I'm sacrificing a bit of design purity for the sake of following the instruction.\n\nSo, I will add the following fields to the `Book` aggregate. These must be added per the instructions: `historyId`, `previousStatus`, `newStatus`, `changeReason`, `changedBy`, and `changeDate`. I'll make sure to use the `BookStatus` Enum for `previousStatus` and `newStatus` to maintain type safety.\n\nIn summary, the design will adhere to the specified requirements, including the history fields in the `Book` aggregate, while still making use of the DDD principles by using value objects and enumerations where appropriate. This is a pragmatic, if slightly unorthodox, approach. My reasoning is sound: the structure is clear and traceable, the requirements are met, and I've tried to make it as DDD-friendly as the specific restrictions allow.\n\n",
            "displayName": "도서",
            "elementView": {
                "_type": "org.uengine.modeling.model.Aggregate",
                "height": 1046,
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4",
                "width": 130,
                "x": 674,
                "y": 764
            },
            "events": [],
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.AggregateHexagonal",
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4",
                "subWidth": 0,
                "width": 0,
                "x": 0,
                "y": 0
            },
            "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4",
            "name": "Book",
            "nameCamelCase": "book",
            "namePascalCase": "Book",
            "namePlural": "books",
            "refs": [
                [
                    [
                        1,
                        45
                    ],
                    [
                        4,
                        95
                    ]
                ]
            ],
            "rotateStatus": false,
            "selected": false,
            "traceName": "Book",
            "oldName": "Book"
        },
        "392073ac-7adf-4238-a70b-06d1a936ebee": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "description": null,
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "392073ac-7adf-4238-a70b-06d1a936ebee",
                "style": "{}",
                "width": 100,
                "x": 418,
                "y": 244
            },
            "id": "392073ac-7adf-4238-a70b-06d1a936ebee",
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "Librarian",
            "oldName": "",
            "rotateStatus": false,
            "traceName": "Librarian",
            "key": "392073ac-7adf-4238-a70b-06d1a936ebee",
            "displayName": ""
        },
        "51e96813-cdfa-4fd8-8629-402b58ec8ccc": {
            "_type": "org.uengine.modeling.model.Command",
            "aggregate": {
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "controllerInfo": {
                "apiPath": "registerbook",
                "fullApiPath": "",
                "method": "POST"
            },
            "description": "* Generated example scenarios\n1. 새로운 도서의 성공적인 등록 (정상 경로)\n2. 이미 존재하는 ISBN으로 도서 등록 시도 시 중복 오류 발생\n3. ISBN이 13자리가 아닌 경우 등록 요청 거부\n4. 필수 입력 항목(저자) 누락 시 등록 요청 거부\n",
            "displayName": "도서 등록",
            "elementView": {
                "_type": "org.uengine.modeling.model.Command",
                "height": 116,
                "id": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
                "style": "{}",
                "width": 100,
                "x": 580,
                "y": 244,
                "z-index": 999
            },
            "examples": [
                {
                    "given": [
                        {
                            "name": "Book",
                            "type": "Aggregate",
                            "value": {
                                "author": "N/A",
                                "bookCategoryId": "N/A",
                                "bookId": "N/A",
                                "category": "N/A",
                                "changeDate": "N/A",
                                "changeReason": "N/A",
                                "changedBy": "N/A",
                                "createdAt": "N/A",
                                "disposalDate": "N/A",
                                "disposalReason": "N/A",
                                "historyId": "N/A",
                                "isbn": "N/A",
                                "newStatus": "N/A",
                                "previousStatus": "N/A",
                                "publisher": "N/A",
                                "registrationDate": "N/A",
                                "status": "N/A",
                                "title": "N/A",
                                "updatedAt": "N/A"
                            }
                        }
                    ],
                    "then": [
                        {
                            "name": "BookRegistered",
                            "type": "Event",
                            "value": {
                                "author": "헤르만 헤세",
                                "bookId": 101,
                                "category": "FICTION",
                                "isbn": {
                                    "isbn": "9788937460001"
                                },
                                "publisher": "민음사",
                                "registrationDate": "2024-07-20",
                                "status": "AVAILABLE",
                                "title": "데미안"
                            }
                        }
                    ],
                    "when": [
                        {
                            "name": "RegisterBook",
                            "type": "Command",
                            "value": {
                                "author": "헤르만 헤세",
                                "category": "FICTION",
                                "isbn": {
                                    "isbn": "9788937460001"
                                },
                                "publisher": "민음사",
                                "title": "데미안"
                            }
                        }
                    ]
                },
                {
                    "given": [
                        {
                            "name": "Book",
                            "type": "Aggregate",
                            "value": {
                                "author": "N/A",
                                "bookCategoryId": "N/A",
                                "bookId": 101,
                                "category": "N/A",
                                "changeDate": "N/A",
                                "changeReason": "N/A",
                                "changedBy": "N/A",
                                "createdAt": "N/A",
                                "disposalDate": "N/A",
                                "disposalReason": "N/A",
                                "historyId": "N/A",
                                "isbn": {
                                    "isbn": "9788937460001"
                                },
                                "newStatus": "N/A",
                                "previousStatus": "N/A",
                                "publisher": "N/A",
                                "registrationDate": "N/A",
                                "status": "AVAILABLE",
                                "title": "기존 도서",
                                "updatedAt": "N/A"
                            }
                        }
                    ],
                    "then": [
                        {
                            "name": "BookRegistered",
                            "type": "Event",
                            "value": {
                                "author": "N/A",
                                "bookId": "N/A",
                                "category": "N/A",
                                "isbn": "N/A",
                                "publisher": "N/A",
                                "registrationDate": "N/A",
                                "status": "N/A",
                                "title": "N/A"
                            }
                        }
                    ],
                    "when": [
                        {
                            "name": "RegisterBook",
                            "type": "Command",
                            "value": {
                                "author": "새로운 저자",
                                "category": "NON_FICTION",
                                "isbn": {
                                    "isbn": "9788937460001"
                                },
                                "publisher": "새로운 출판사",
                                "title": "중복 ISBN 도서"
                            }
                        }
                    ]
                },
                {
                    "given": [
                        {
                            "name": "Book",
                            "type": "Aggregate",
                            "value": {
                                "author": "N/A",
                                "bookCategoryId": "N/A",
                                "bookId": "N/A",
                                "category": "N/A",
                                "changeDate": "N/A",
                                "changeReason": "N/A",
                                "changedBy": "N/A",
                                "createdAt": "N/A",
                                "disposalDate": "N/A",
                                "disposalReason": "N/A",
                                "historyId": "N/A",
                                "isbn": "N/A",
                                "newStatus": "N/A",
                                "previousStatus": "N/A",
                                "publisher": "N/A",
                                "registrationDate": "N/A",
                                "status": "N/A",
                                "title": "N/A",
                                "updatedAt": "N/A"
                            }
                        }
                    ],
                    "then": [
                        {
                            "name": "BookRegistered",
                            "type": "Event",
                            "value": {
                                "author": "N/A",
                                "bookId": "N/A",
                                "category": "N/A",
                                "isbn": "N/A",
                                "publisher": "N/A",
                                "registrationDate": "N/A",
                                "status": "N/A",
                                "title": "N/A"
                            }
                        }
                    ],
                    "when": [
                        {
                            "name": "RegisterBook",
                            "type": "Command",
                            "value": {
                                "author": "작가 A",
                                "category": "ACADEMIC",
                                "isbn": {
                                    "isbn": "1234567890"
                                },
                                "publisher": "출판사 B",
                                "title": "짧은 ISBN 테스트"
                            }
                        }
                    ]
                },
                {
                    "given": [
                        {
                            "name": "Book",
                            "type": "Aggregate",
                            "value": {
                                "author": "N/A",
                                "bookCategoryId": "N/A",
                                "bookId": "N/A",
                                "category": "N/A",
                                "changeDate": "N/A",
                                "changeReason": "N/A",
                                "changedBy": "N/A",
                                "createdAt": "N/A",
                                "disposalDate": "N/A",
                                "disposalReason": "N/A",
                                "historyId": "N/A",
                                "isbn": "N/A",
                                "newStatus": "N/A",
                                "previousStatus": "N/A",
                                "publisher": "N/A",
                                "registrationDate": "N/A",
                                "status": "N/A",
                                "title": "N/A",
                                "updatedAt": "N/A"
                            }
                        }
                    ],
                    "then": [
                        {
                            "name": "BookRegistered",
                            "type": "Event",
                            "value": {
                                "author": "N/A",
                                "bookId": "N/A",
                                "category": "N/A",
                                "isbn": "N/A",
                                "publisher": "N/A",
                                "registrationDate": "N/A",
                                "status": "N/A",
                                "title": "N/A"
                            }
                        }
                    ],
                    "when": [
                        {
                            "name": "RegisterBook",
                            "type": "Command",
                            "value": {
                                "author": "N/A",
                                "category": "MAGAZINE",
                                "isbn": {
                                    "isbn": "9781234567890"
                                },
                                "publisher": "출판사 C",
                                "title": "저자 누락 도서"
                            }
                        }
                    ]
                }
            ],
            "fieldDescriptors": [
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "String",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "title",
                    "nameCamelCase": "title",
                    "namePascalCase": "Title",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "title"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "ISBN",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "isbn",
                    "nameCamelCase": "isbn",
                    "namePascalCase": "Isbn",
                    "refs": [
                        [
                            [
                                4,
                                38
                            ],
                            [
                                4,
                                41
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "isbn"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "String",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "author",
                    "nameCamelCase": "author",
                    "namePascalCase": "Author",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "author"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "String",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "publisher",
                    "nameCamelCase": "publisher",
                    "namePascalCase": "Publisher",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "publisher"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "BookCategory",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "category",
                    "nameCamelCase": "category",
                    "namePascalCase": "Category",
                    "refs": [
                        [
                            [
                                4,
                                56
                            ],
                            [
                                4,
                                59
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "category"
                }
            ],
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.CommandHexagonal",
                "height": 0,
                "id": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0
            },
            "id": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
            "isRestRepository": false,
            "name": "RegisterBook",
            "nameCamelCase": "registerBook",
            "namePascalCase": "RegisterBook",
            "namePlural": "registerBooks",
            "outputEvents": [
                "BookRegistered"
            ],
            "refs": [
                [
                    [
                        1,
                        1
                    ],
                    [
                        1,
                        50
                    ]
                ]
            ],
            "relationCommandInfo": [],
            "relationEventInfo": [],
            "restRepositoryInfo": {
                "method": "POST"
            },
            "rotateStatus": false,
            "selected": false,
            "traceName": "RegisterBook",
            "trigger": "@PrePersist",
            "visibility": "public"
        },
        "6f75afe5-5937-4af8-9b02-25e112031993": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "description": null,
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "6f75afe5-5937-4af8-9b02-25e112031993",
                "style": "{}",
                "width": 100,
                "x": 418,
                "y": 628
            },
            "id": "6f75afe5-5937-4af8-9b02-25e112031993",
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "Librarian",
            "oldName": "",
            "rotateStatus": false,
            "traceName": "Librarian",
            "key": "6f75afe5-5937-4af8-9b02-25e112031993",
            "displayName": ""
        },
        "78d587cc-dbbf-4faa-b61b-e6aa34b436e5": {
            "_type": "org.uengine.modeling.model.UI",
            "aggregate": {
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "card": {
                "subtitle": "",
                "text": "",
                "title": ""
            },
            "chart": {
                "fieldMapping": {
                    "category": [],
                    "data": []
                },
                "type": ""
            },
            "command": null,
            "description": null,
            "displayName": "도서 목록 조회 UI",
            "elementView": {
                "_type": "org.uengine.modeling.model.UI",
                "height": 100,
                "id": "78d587cc-dbbf-4faa-b61b-e6aa34b436e5",
                "style": {},
                "width": 100,
                "x": 499,
                "y": 628
            },
            "generateDescription": "",
            "grid": {
                "columns": []
            },
            "id": "78d587cc-dbbf-4faa-b61b-e6aa34b436e5",
            "name": "BookListUI",
            "nameCamelCase": "booklistui",
            "namePascalCase": "Booklistui",
            "namePlural": "booklistuis",
            "oldName": "",
            "readModel": {
                "id": "a9964707-062c-4120-9a6a-2e16c3497226"
            },
            "rotateStatus": false,
            "runTimeTemplateHtml": "<style>\n.rootdiv { max-width:600px; margin:0 auto; padding:24px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }\n.form-group { margin-bottom: 1rem; }\n.form-label { display: block; margin-bottom: .5rem; font-weight: 500; }\n.form-control { display: block; width: 100%; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; color: #495057; background-color: #fff; background-clip: padding-box; border: 1px solid #ced4da; border-radius: .25rem; transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out; box-sizing: border-box; }\n.btn { display: inline-block; font-weight: 400; text-align: center; vertical-align: middle; user-select: none; background-color: transparent; border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; border-radius: .25rem; cursor: pointer; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; }\n.btn-primary { color: #fff; background-color: #007bff; border-color: #007bff; }\n.btn-secondary { color: #fff; background-color: #6c757d; border-color: #6c757d; }\n</style>\n<style>\n    .search-panel { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }\n    .filter-grid { display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap; }\n    .filter-item { flex: 1; min-width: 180px; }\n    .results-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-top: 15px; }\n    .results-table th, .results-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e9ecef; }\n    .results-table th { background-color: #e9ecef; font-weight: 600; color: #495057; }\n    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.9em; display: inline-block; }\n    .status-available { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }\n    .status-loaned { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba; }\n    .status-disposed { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }\n</style>\n<div class=\"root-div\">\n    <div class=\"search-panel\">\n        <h2 style=\"margin: 0 0 20px 0; color: #333;\">도서 목록 조회</h2>\n        <div class=\"filter-grid\">\n            <div class=\"filter-item form-group\">\n                <label for=\"title\" class=\"form-label\">제목</label>\n                <input type=\"text\" id=\"title\" class=\"form-control\" placeholder=\"도서 제목 입력\">\n            </div>\n            <div class=\"filter-item form-group\">\n                <label for=\"author\" class=\"form-label\">저자</label>\n                <input type=\"text\" id=\"author\" class=\"form-control\" placeholder=\"저자명 입력\">\n            </div>\n            <div class=\"filter-item form-group\">\n                <label for=\"category\" class=\"form-label\">분류</label>\n                <select id=\"category\" class=\"form-control\">\n                    <option value=\"\">전체 분류</option>\n                    <option value=\"literature\">문학</option>\n                    <option value=\"science\">과학</option>\n                    <option value=\"history\">역사</option>\n                </select>\n            </div>\n            <div class=\"filter-item form-group\">\n                <label for=\"status\" class=\"form-label\">상태</label>\n                <select id=\"status\" class=\"form-control\">\n                    <option value=\"\">전체 상태</option>\n                    <option value=\"available\">대여 가능</option>\n                    <option value=\"loaned\">대여 중</option>\n                    <option value=\"disposed\">폐기</option>\n                </select>\n            </div>\n        </div>\n        <div style=\"text-align: right; margin-top: 15px;\">\n            <button class=\"btn btn-secondary\" style=\"margin-right: 10px;\">초기화</button>\n            <button class=\"btn btn-primary\">검색</button>\n        </div>\n    </div>\n\n    <div style=\"overflow-x: auto;\" role=\"region\" aria-labelledby=\"bookListHeader\">\n        <h3 id=\"bookListHeader\" style=\"margin-top: 0; margin-bottom: 10px; font-size: 1.2rem;\">검색 결과 (총 5건)</h3>\n        <table class=\"results-table\">\n            <thead>\n                <tr>\n                    <th>도서 ID</th>\n                    <th>제목</th>\n                    <th>저자</th>\n                    <th>출판사</th>\n                    <th>분류</th>\n                    <th>ISBN</th>\n                    <th>상태</th>\n                    <th>등록일</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr>\n                    <td>1001</td>\n                    <td>코딩의 정석</td>\n                    <td>김철수</td>\n                    <td>IT 출판사</td>\n                    <td>과학</td>\n                    <td>978-89-6077-345-1</td>\n                    <td><span class=\"status-badge status-available\">대여 가능</span></td>\n                    <td>2023-10-01</td>\n                </tr>\n                <tr>\n                    <td>1002</td>\n                    <td>시간의 역사</td>\n                    <td>이영희</td>\n                    <td>미래 문학</td>\n                    <td>문학</td>\n                    <td>978-89-374-2100-5</td>\n                    <td><span class=\"status-badge status-loaned\">대여 중</span></td>\n                    <td>2023-11-20</td>\n                </tr>\n                <tr>\n                    <td>1003</td>\n                    <td>조선 왕조 실록</td>\n                    <td>박민준</td>\n                    <td>역사 연구소</td>\n                    <td>역사</td>\n                    <td>978-89-7092-234-9</td>\n                    <td><span class=\"status-badge status-available\">대여 가능</span></td>\n                    <td>2024-01-05</td>\n                </tr>\n                <tr>\n                    <td>1004</td>\n                    <td>데이터베이스 개론</td>\n                    <td>최지훈</td>\n                    <td>IT 출판사</td>\n                    <td>과학</td>\n                    <td>978-89-6077-501-2</td>\n                    <td><span class=\"status-badge status-disposed\">폐기</span></td>\n                    <td>2022-05-18</td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n</div>",
            "uiType": "Chart"
        },
        "a9964707-062c-4120-9a6a-2e16c3497226": {
            "_type": "org.uengine.modeling.model.View",
            "aggregate": {
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "controllerInfo": {
                "url": ""
            },
            "createRules": [
                {
                    "_type": "viewStoreRule",
                    "fieldMapping": [
                        {
                            "eventField": null,
                            "operator": "=",
                            "viewField": null
                        }
                    ],
                    "operation": "CREATE",
                    "when": null,
                    "where": [
                        {
                            "eventField": null,
                            "viewField": null
                        }
                    ]
                }
            ],
            "dataProjection": "query-for-aggregate",
            "definitionId": "",
            "deleteRules": [
                {
                    "_type": "viewStoreRule",
                    "fieldMapping": [
                        {
                            "eventField": null,
                            "viewField": null
                        }
                    ],
                    "operation": "DELETE",
                    "when": null,
                    "where": [
                        {
                            "eventField": null,
                            "viewField": null
                        }
                    ]
                }
            ],
            "description": null,
            "displayName": "도서 목록 조회",
            "editingView": false,
            "elementView": {
                "_type": "org.uengine.modeling.model.View",
                "height": 116,
                "id": "a9964707-062c-4120-9a6a-2e16c3497226",
                "style": "{}",
                "width": 100,
                "x": 580,
                "y": 628,
                "z-index": 999
            },
            "fieldDescriptors": [
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "Long",
                    "isKey": true,
                    "name": "id",
                    "nameCamelCase": "id",
                    "namePascalCase": "Id"
                }
            ],
            "id": "a9964707-062c-4120-9a6a-2e16c3497226",
            "name": "BookList",
            "namePascalCase": "BookList",
            "namePlural": "bookLists",
            "oldName": "",
            "queryOption": {
                "apiPath": "",
                "multipleResult": true,
                "useDefaultUri": true
            },
            "queryParameters": [
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "BookStatus",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "status",
                    "nameCamelCase": "status",
                    "namePascalCase": "Status",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "status"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "BookCategory",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "category",
                    "nameCamelCase": "category",
                    "namePascalCase": "Category",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                4,
                                59
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "category"
                }
            ],
            "refs": [
                [
                    [
                        1,
                        1
                    ],
                    [
                        1,
                        50
                    ]
                ]
            ],
            "rotateStatus": false,
            "traceName": "BookList",
            "updateRules": [
                {
                    "_type": "viewStoreRule",
                    "fieldMapping": [
                        {
                            "eventField": null,
                            "operator": "=",
                            "viewField": null
                        }
                    ],
                    "operation": "UPDATE",
                    "when": null,
                    "where": [
                        {
                            "eventField": null,
                            "viewField": null
                        }
                    ]
                }
            ],
            "visibility": "public",
            "key": "a9964707-062c-4120-9a6a-2e16c3497226"
        },
        "f5687c5a-06c3-4102-bb5d-c8ff667aea9b": {
            "_type": "org.uengine.modeling.model.UI",
            "aggregate": {
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "card": {
                "subtitle": "",
                "text": "",
                "title": ""
            },
            "chart": {
                "fieldMapping": {
                    "category": [],
                    "data": []
                },
                "type": ""
            },
            "command": {
                "id": "51e96813-cdfa-4fd8-8629-402b58ec8ccc"
            },
            "description": null,
            "displayName": "도서 등록 UI",
            "elementView": {
                "_type": "org.uengine.modeling.model.UI",
                "height": 100,
                "id": "f5687c5a-06c3-4102-bb5d-c8ff667aea9b",
                "style": {},
                "width": 100,
                "x": 499,
                "y": 244
            },
            "generateDescription": "",
            "grid": {
                "columns": []
            },
            "id": "f5687c5a-06c3-4102-bb5d-c8ff667aea9b",
            "name": "RegisterBookUI",
            "nameCamelCase": "registerbookui",
            "namePascalCase": "Registerbookui",
            "namePlural": "registerbookuis",
            "oldName": "",
            "readModel": null,
            "rotateStatus": false,
            "runTimeTemplateHtml": "<style>\n.rootdiv { max-width:600px; margin:0 auto; padding:24px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }\n.form-group { margin-bottom: 1rem; }\n.form-label { display: block; margin-bottom: .5rem; font-weight: 500; }\n.form-control { display: block; width: 100%; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; color: #495057; background-color: #fff; background-clip: padding-box; border: 1px solid #ced4da; border-radius: .25rem; transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out; box-sizing: border-box; }\n.btn { display: inline-block; font-weight: 400; text-align: center; vertical-align: middle; user-select: none; background-color: transparent; border: 1px solid transparent; padding: .375rem .75rem; font-size: 1rem; line-height: 1.5; border-radius: .25rem; cursor: pointer; transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; }\n.btn-primary { color: #fff; background-color: #007bff; border-color: #007bff; }\n.mt-2 { margin-top: .5rem; }\n.w-100 { width: 100%; }\n</style>\n<style>\n    /* Custom styles for component layout */\n    .card-container {\n        background: white;\n        border-radius: 8px;\n        box-shadow: 0 4px 12px rgba(0,0,0,0.08);\n        padding: 30px;\n    }\n    .form-title {\n        text-align: center;\n        margin-bottom: 24px;\n        color: #333;\n        font-size: 22px;\n        font-weight: 600;\n    }\n</style>\n<div class=\"root-div\">\n    <div class=\"card-container\">\n        <h2 class=\"form-title\">도서 등록</h2>\n        \n        <form style=\"display:flex;flex-direction:column;gap:16px;\" aria-label=\"도서 등록 양식\">\n            \n            <!-- Title -->\n            <div class=\"form-group\">\n                <label for=\"title\" class=\"form-label\">제목</label>\n                <input type=\"text\" id=\"title\" name=\"title\" class=\"form-control\" placeholder=\"도서 제목을 입력하세요\" aria-required=\"false\">\n            </div>\n            \n            <!-- ISBN -->\n            <div class=\"form-group\">\n                <label for=\"isbn\" class=\"form-label\">ISBN</label>\n                <input type=\"text\" id=\"isbn\" name=\"isbn\" class=\"form-control\" placeholder=\"예: 978-89-6077-733-1 (선택 사항)\" aria-required=\"false\">\n            </div>\n            \n            <!-- Author -->\n            <div class=\"form-group\">\n                <label for=\"author\" class=\"form-label\">저자</label>\n                <input type=\"text\" id=\"author\" name=\"author\" class=\"form-control\" placeholder=\"저자 이름을 입력하세요\" aria-required=\"false\">\n            </div>\n            \n            <!-- Publisher -->\n            <div class=\"form-group\">\n                <label for=\"publisher\" class=\"form-label\">출판사</label>\n                <input type=\"text\" id=\"publisher\" name=\"publisher\" class=\"form-control\" placeholder=\"출판사 이름을 입력하세요\" aria-required=\"false\">\n            </div>\n            \n            <!-- Category (Selection) -->\n            <div class=\"form-group\">\n                <label for=\"category\" class=\"form-label\">카테고리</label>\n                <select id=\"category\" name=\"category\" class=\"form-control\" aria-required=\"false\">\n                    <option value=\"\" selected>-- 카테고리 선택 (선택 사항) --</option>\n                    <option value=\"literature\">문학</option>\n                    <option value=\"science\">과학</option>\n                    <option value=\"history\">역사</option>\n                    <option value=\"technology\">기술</option>\n                    <option value=\"art\">예술</option>\n                </select>\n            </div>\n            \n            <!-- Submit Button -->\n            <div class=\"mt-2\">\n                <button type=\"submit\" class=\"btn btn-primary w-100\" aria-label=\"도서 등록 실행\">\n                    도서 등록\n                </button>\n            </div>\n        </form>\n    </div>\n</div>",
            "uiType": "Chart"
        },
        "affc8cfa-49be-476d-a603-1a6d545bf1d5": {
            "_type": "org.uengine.modeling.model.Policy",
            "aggregate": {
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "description": "대출이 성공적으로 완료되면, 해당 도서의 상태를 '대출중'으로 자동 변경하여 재고 관리 시스템(BookManagement)에 반영해야 합니다.",
            "displayName": "도서 대출 시 상태 변경",
            "elementView": {
                "_type": "org.uengine.modeling.model.Policy",
                "height": 116,
                "id": "affc8cfa-49be-476d-a603-1a6d545bf1d5",
                "style": "{}",
                "width": 100,
                "x": 580,
                "y": 1012
            },
            "fieldDescriptors": [],
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.PolicyHexagonal",
                "height": 20,
                "id": "affc8cfa-49be-476d-a603-1a6d545bf1d5",
                "style": "{}",
                "subWidth": 100,
                "width": 20
            },
            "id": "affc8cfa-49be-476d-a603-1a6d545bf1d5",
            "isSaga": false,
            "name": "BookStatusUpdateOnLoan",
            "nameCamelCase": "bookStatusUpdateOnLoan",
            "namePascalCase": "BookStatusUpdateOnLoan",
            "namePlural": "bookStatusUpdateOnLoans",
            "oldName": "",
            "refs": [
                [
                    [
                        1,
                        1
                    ],
                    [
                        1,
                        53
                    ]
                ]
            ],
            "rotateStatus": false,
            "sourceBoundedContextId": "87ea227d-da5c-4a99-a765-2df67a509dc8",
            "traceName": "BookStatusUpdateOnLoan",
            "key": "affc8cfa-49be-476d-a603-1a6d545bf1d5"
        },
        "e94a39ae-b012-4684-ad12-0fea78e47569": {
            "_type": "org.uengine.modeling.model.Event",
            "aggregate": {
                "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
            },
            "alertURL": "/static/image/symbol/alert-icon.png",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
            },
            "checkAlert": true,
            "description": null,
            "displayName": "도서 등록됨",
            "elementView": {
                "_type": "org.uengine.modeling.model.Event",
                "angle": 0,
                "height": 116,
                "id": "e94a39ae-b012-4684-ad12-0fea78e47569",
                "style": "{}",
                "width": 100,
                "x": 768,
                "y": 244
            },
            "fieldDescriptors": [
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "Integer",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": true,
                    "isList": false,
                    "name": "bookId",
                    "nameCamelCase": "bookId",
                    "namePascalCase": "BookId",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "bookId"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "String",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "title",
                    "nameCamelCase": "title",
                    "namePascalCase": "Title",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "title"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "ISBN",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "isbn",
                    "nameCamelCase": "isbn",
                    "namePascalCase": "Isbn",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "isbn"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "String",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "author",
                    "nameCamelCase": "author",
                    "namePascalCase": "Author",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "author"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "String",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "publisher",
                    "nameCamelCase": "publisher",
                    "namePascalCase": "Publisher",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "publisher"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "BookCategory",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "category",
                    "nameCamelCase": "category",
                    "namePascalCase": "Category",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "category"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "Date",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "registrationDate",
                    "nameCamelCase": "registrationDate",
                    "namePascalCase": "RegistrationDate",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                1,
                                50
                            ]
                        ]
                    ],
                    "traceName": "registrationDate"
                },
                {
                    "_type": "org.uengine.model.FieldDescriptor",
                    "className": "BookStatus",
                    "displayName": "",
                    "isCopy": false,
                    "isKey": false,
                    "isList": false,
                    "name": "status",
                    "nameCamelCase": "status",
                    "namePascalCase": "Status",
                    "refs": [
                        [
                            [
                                1,
                                1
                            ],
                            [
                                4,
                                77
                            ]
                        ],
                        [
                            [
                                1,
                                1
                            ],
                            [
                                4,
                                77
                            ]
                        ]
                    ],
                    "traceName": "status"
                }
            ],
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.EventHexagonal",
                "height": 0,
                "id": "e94a39ae-b012-4684-ad12-0fea78e47569",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0
            },
            "id": "e94a39ae-b012-4684-ad12-0fea78e47569",
            "name": "BookRegistered",
            "nameCamelCase": "bookRegistered",
            "namePascalCase": "BookRegistered",
            "namePlural": "",
            "refs": [
                [
                    [
                        1,
                        1
                    ],
                    [
                        1,
                        50
                    ]
                ]
            ],
            "relationCommandInfo": [],
            "relationPolicyInfo": [],
            "rotateStatus": false,
            "selected": false,
            "traceName": "BookRegistered",
            "trigger": "@PostPersist",
            "key": "e94a39ae-b012-4684-ad12-0fea78e47569",
            "visibility": "public"
        }
    },
    "relations": {
        "94a7307f-72fd-4a38-af06-022c569acbe3": {
            "_type": "org.uengine.modeling.model.Relation",
            "from": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
                "id": "94a7307f-72fd-4a38-af06-022c569acbe3",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "e94a39ae-b012-4684-ad12-0fea78e47569",
                "value": null
            },
            "id": "94a7307f-72fd-4a38-af06-022c569acbe3",
            "name": "",
            "relationView": {
                "from": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
                "id": "94a7307f-72fd-4a38-af06-022c569acbe3",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "e94a39ae-b012-4684-ad12-0fea78e47569",
                "value": "[[630,244],[718,244]]"
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "to": "e94a39ae-b012-4684-ad12-0fea78e47569",
            "key": "94a7307f-72fd-4a38-af06-022c569acbe3",
            "sourceElement": {
                "_type": "org.uengine.modeling.model.Command",
                "aggregate": {
                    "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
                },
                "controllerInfo": {
                    "apiPath": "registerbook",
                    "fullApiPath": "",
                    "method": "POST"
                },
                "description": "* Generated example scenarios\n1. 새로운 도서의 성공적인 등록 (정상 경로)\n2. 이미 존재하는 ISBN으로 도서 등록 시도 시 중복 오류 발생\n3. ISBN이 13자리가 아닌 경우 등록 요청 거부\n4. 필수 입력 항목(저자) 누락 시 등록 요청 거부\n",
                "displayName": "도서 등록",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
                    "style": "{}",
                    "width": 100,
                    "x": 1076,
                    "y": 280,
                    "z-index": 999
                },
                "examples": [
                    {
                        "given": [
                            {
                                "name": "Book",
                                "type": "Aggregate",
                                "value": {
                                    "author": "N/A",
                                    "bookCategoryId": "N/A",
                                    "bookId": "N/A",
                                    "category": "N/A",
                                    "changeDate": "N/A",
                                    "changeReason": "N/A",
                                    "changedBy": "N/A",
                                    "createdAt": "N/A",
                                    "disposalDate": "N/A",
                                    "disposalReason": "N/A",
                                    "historyId": "N/A",
                                    "isbn": "N/A",
                                    "newStatus": "N/A",
                                    "previousStatus": "N/A",
                                    "publisher": "N/A",
                                    "registrationDate": "N/A",
                                    "status": "N/A",
                                    "title": "N/A",
                                    "updatedAt": "N/A"
                                }
                            }
                        ],
                        "then": [
                            {
                                "name": "BookRegistered",
                                "type": "Event",
                                "value": {
                                    "author": "헤르만 헤세",
                                    "bookId": 101,
                                    "category": "FICTION",
                                    "isbn": {
                                        "isbn": "9788937460001"
                                    },
                                    "publisher": "민음사",
                                    "registrationDate": "2024-07-20",
                                    "status": "AVAILABLE",
                                    "title": "데미안"
                                }
                            }
                        ],
                        "when": [
                            {
                                "name": "RegisterBook",
                                "type": "Command",
                                "value": {
                                    "author": "헤르만 헤세",
                                    "category": "FICTION",
                                    "isbn": {
                                        "isbn": "9788937460001"
                                    },
                                    "publisher": "민음사",
                                    "title": "데미안"
                                }
                            }
                        ]
                    },
                    {
                        "given": [
                            {
                                "name": "Book",
                                "type": "Aggregate",
                                "value": {
                                    "author": "N/A",
                                    "bookCategoryId": "N/A",
                                    "bookId": 101,
                                    "category": "N/A",
                                    "changeDate": "N/A",
                                    "changeReason": "N/A",
                                    "changedBy": "N/A",
                                    "createdAt": "N/A",
                                    "disposalDate": "N/A",
                                    "disposalReason": "N/A",
                                    "historyId": "N/A",
                                    "isbn": {
                                        "isbn": "9788937460001"
                                    },
                                    "newStatus": "N/A",
                                    "previousStatus": "N/A",
                                    "publisher": "N/A",
                                    "registrationDate": "N/A",
                                    "status": "AVAILABLE",
                                    "title": "기존 도서",
                                    "updatedAt": "N/A"
                                }
                            }
                        ],
                        "then": [
                            {
                                "name": "BookRegistered",
                                "type": "Event",
                                "value": {
                                    "author": "N/A",
                                    "bookId": "N/A",
                                    "category": "N/A",
                                    "isbn": "N/A",
                                    "publisher": "N/A",
                                    "registrationDate": "N/A",
                                    "status": "N/A",
                                    "title": "N/A"
                                }
                            }
                        ],
                        "when": [
                            {
                                "name": "RegisterBook",
                                "type": "Command",
                                "value": {
                                    "author": "새로운 저자",
                                    "category": "NON_FICTION",
                                    "isbn": {
                                        "isbn": "9788937460001"
                                    },
                                    "publisher": "새로운 출판사",
                                    "title": "중복 ISBN 도서"
                                }
                            }
                        ]
                    },
                    {
                        "given": [
                            {
                                "name": "Book",
                                "type": "Aggregate",
                                "value": {
                                    "author": "N/A",
                                    "bookCategoryId": "N/A",
                                    "bookId": "N/A",
                                    "category": "N/A",
                                    "changeDate": "N/A",
                                    "changeReason": "N/A",
                                    "changedBy": "N/A",
                                    "createdAt": "N/A",
                                    "disposalDate": "N/A",
                                    "disposalReason": "N/A",
                                    "historyId": "N/A",
                                    "isbn": "N/A",
                                    "newStatus": "N/A",
                                    "previousStatus": "N/A",
                                    "publisher": "N/A",
                                    "registrationDate": "N/A",
                                    "status": "N/A",
                                    "title": "N/A",
                                    "updatedAt": "N/A"
                                }
                            }
                        ],
                        "then": [
                            {
                                "name": "BookRegistered",
                                "type": "Event",
                                "value": {
                                    "author": "N/A",
                                    "bookId": "N/A",
                                    "category": "N/A",
                                    "isbn": "N/A",
                                    "publisher": "N/A",
                                    "registrationDate": "N/A",
                                    "status": "N/A",
                                    "title": "N/A"
                                }
                            }
                        ],
                        "when": [
                            {
                                "name": "RegisterBook",
                                "type": "Command",
                                "value": {
                                    "author": "작가 A",
                                    "category": "ACADEMIC",
                                    "isbn": {
                                        "isbn": "1234567890"
                                    },
                                    "publisher": "출판사 B",
                                    "title": "짧은 ISBN 테스트"
                                }
                            }
                        ]
                    },
                    {
                        "given": [
                            {
                                "name": "Book",
                                "type": "Aggregate",
                                "value": {
                                    "author": "N/A",
                                    "bookCategoryId": "N/A",
                                    "bookId": "N/A",
                                    "category": "N/A",
                                    "changeDate": "N/A",
                                    "changeReason": "N/A",
                                    "changedBy": "N/A",
                                    "createdAt": "N/A",
                                    "disposalDate": "N/A",
                                    "disposalReason": "N/A",
                                    "historyId": "N/A",
                                    "isbn": "N/A",
                                    "newStatus": "N/A",
                                    "previousStatus": "N/A",
                                    "publisher": "N/A",
                                    "registrationDate": "N/A",
                                    "status": "N/A",
                                    "title": "N/A",
                                    "updatedAt": "N/A"
                                }
                            }
                        ],
                        "then": [
                            {
                                "name": "BookRegistered",
                                "type": "Event",
                                "value": {
                                    "author": "N/A",
                                    "bookId": "N/A",
                                    "category": "N/A",
                                    "isbn": "N/A",
                                    "publisher": "N/A",
                                    "registrationDate": "N/A",
                                    "status": "N/A",
                                    "title": "N/A"
                                }
                            }
                        ],
                        "when": [
                            {
                                "name": "RegisterBook",
                                "type": "Command",
                                "value": {
                                    "author": "N/A",
                                    "category": "MAGAZINE",
                                    "isbn": {
                                        "isbn": "9781234567890"
                                    },
                                    "publisher": "출판사 C",
                                    "title": "저자 누락 도서"
                                }
                            }
                        ]
                    }
                ],
                "fieldDescriptors": [
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "title",
                        "nameCamelCase": "title",
                        "namePascalCase": "Title",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ],
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "title"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "ISBN",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "isbn",
                        "nameCamelCase": "isbn",
                        "namePascalCase": "Isbn",
                        "refs": [
                            [
                                [
                                    4,
                                    38
                                ],
                                [
                                    4,
                                    41
                                ]
                            ],
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "isbn"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "author",
                        "nameCamelCase": "author",
                        "namePascalCase": "Author",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ],
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "author"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "publisher",
                        "nameCamelCase": "publisher",
                        "namePascalCase": "Publisher",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ],
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "publisher"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "BookCategory",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "category",
                        "nameCamelCase": "category",
                        "namePascalCase": "Category",
                        "refs": [
                            [
                                [
                                    4,
                                    56
                                ],
                                [
                                    4,
                                    59
                                ]
                            ],
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "category"
                    }
                ],
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "id": "51e96813-cdfa-4fd8-8629-402b58ec8ccc",
                "isRestRepository": false,
                "name": "RegisterBook",
                "nameCamelCase": "registerBook",
                "namePascalCase": "RegisterBook",
                "namePlural": "registerBooks",
                "outputEvents": [
                    "BookRegistered"
                ],
                "refs": [
                    [
                        [
                            1,
                            1
                        ],
                        [
                            1,
                            50
                        ]
                    ]
                ],
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "POST"
                },
                "rotateStatus": false,
                "selected": false,
                "traceName": "RegisterBook",
                "trigger": "@PrePersist"
            },
            "targetElement": {
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "b396bab8-0b7b-472b-8f67-e5083f0c9df4"
                },
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "d5aa6734-1b29-4d4c-85be-0554ea9bbfbe"
                },
                "checkAlert": true,
                "description": null,
                "displayName": "도서 등록됨",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Event",
                    "angle": 0,
                    "height": 115,
                    "id": "e94a39ae-b012-4684-ad12-0fea78e47569",
                    "style": "{}",
                    "width": 100,
                    "x": 1264,
                    "y": 280
                },
                "fieldDescriptors": [
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "Integer",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": true,
                        "isList": false,
                        "name": "bookId",
                        "nameCamelCase": "bookId",
                        "namePascalCase": "BookId",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "bookId"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "title",
                        "nameCamelCase": "title",
                        "namePascalCase": "Title",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "title"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "ISBN",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "isbn",
                        "nameCamelCase": "isbn",
                        "namePascalCase": "Isbn",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "isbn"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "author",
                        "nameCamelCase": "author",
                        "namePascalCase": "Author",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "author"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "String",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "publisher",
                        "nameCamelCase": "publisher",
                        "namePascalCase": "Publisher",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "publisher"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "BookCategory",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "category",
                        "nameCamelCase": "category",
                        "namePascalCase": "Category",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "category"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "Date",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "registrationDate",
                        "nameCamelCase": "registrationDate",
                        "namePascalCase": "RegistrationDate",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    1,
                                    50
                                ]
                            ]
                        ],
                        "traceName": "registrationDate"
                    },
                    {
                        "_type": "org.uengine.model.FieldDescriptor",
                        "className": "BookStatus",
                        "displayName": "",
                        "isCopy": false,
                        "isKey": false,
                        "isList": false,
                        "name": "status",
                        "nameCamelCase": "status",
                        "namePascalCase": "Status",
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    4,
                                    77
                                ]
                            ],
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    4,
                                    77
                                ]
                            ]
                        ],
                        "traceName": "status"
                    }
                ],
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.EventHexagonal",
                    "height": 0,
                    "id": "e94a39ae-b012-4684-ad12-0fea78e47569",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "id": "e94a39ae-b012-4684-ad12-0fea78e47569",
                "name": "BookRegistered",
                "nameCamelCase": "bookRegistered",
                "namePascalCase": "BookRegistered",
                "namePlural": "",
                "refs": [
                    [
                        [
                            1,
                            1
                        ],
                        [
                            1,
                            50
                        ]
                    ]
                ],
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "traceName": "BookRegistered",
                "trigger": "@PostPersist",
                "key": "e94a39ae-b012-4684-ad12-0fea78e47569"
            },
            "displayName": ""
        }
    },
    "k8sValue": {
        "elements": {},
        "relations": {}
    },
    "langgraphStudioInfos": {
        "esGenerator": {
            "jobId": "451dcecb-fe01-44eb-6e3e-f7546d56f217",
            "isCompleted": true,
            "traceInfo": {
                "previewAttributes": {
                    "BookManagement": {
                        "Book": [
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
                        ]
                    }
                },
                "structureRefs": {
                    "BookManagement": {
                        "aggregates": {
                            "Book": [
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
                                        3,
                                        2
                                    ],
                                    [
                                        3,
                                        302
                                    ]
                                ],
                                [
                                    [
                                        28,
                                        5
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
                                        10
                                    ]
                                ]
                            ]
                        },
                        "enumerations": {
                            "BookStatus": [
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
                                        3,
                                        184
                                    ],
                                    [
                                        3,
                                        266
                                    ]
                                ],
                                [
                                    [
                                        32,
                                        5
                                    ],
                                    [
                                        32,
                                        10
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
                                        14
                                    ]
                                ]
                            ],
                            "BookCategoryType": [
                                [
                                    [
                                        3,
                                        142
                                    ],
                                    [
                                        3,
                                        153
                                    ]
                                ],
                                [
                                    [
                                        31,
                                        14
                                    ],
                                    [
                                        31,
                                        40
                                    ]
                                ]
                            ]
                        },
                        "valueObjects": {
                            "ISBN": [
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
                                        3,
                                        72
                                    ],
                                    [
                                        3,
                                        75
                                    ]
                                ],
                                [
                                    [
                                        28,
                                        5
                                    ],
                                    [
                                        28,
                                        8
                                    ]
                                ]
                            ]
                        }
                    }
                },
                "idValueObjectRefs": {
                    "BookManagement": {
                        "Book": {
                            "BookCategory": [
                                [
                                    [
                                        3,
                                        87
                                    ],
                                    [
                                        3,
                                        90
                                    ]
                                ],
                                [
                                    [
                                        31,
                                        5
                                    ],
                                    [
                                        31,
                                        12
                                    ]
                                ]
                            ],
                            "StatusHistory": [
                                [
                                    [
                                        9,
                                        15
                                    ],
                                    [
                                        9,
                                        22
                                    ]
                                ],
                                [
                                    [
                                        84,
                                        4
                                    ],
                                    [
                                        84,
                                        15
                                    ]
                                ],
                                [
                                    [
                                        85,
                                        1
                                    ],
                                    [
                                        85,
                                        34
                                    ]
                                ],
                                [
                                    [
                                        86,
                                        1
                                    ],
                                    [
                                        86,
                                        46
                                    ]
                                ],
                                [
                                    [
                                        87,
                                        1
                                    ],
                                    [
                                        87,
                                        25
                                    ]
                                ],
                                [
                                    [
                                        88,
                                        1
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
                                        57
                                    ]
                                ],
                                [
                                    [
                                        90,
                                        1
                                    ],
                                    [
                                        90,
                                        31
                                    ]
                                ],
                                [
                                    [
                                        91,
                                        1
                                    ],
                                    [
                                        91,
                                        28
                                    ]
                                ],
                                [
                                    [
                                        92,
                                        1
                                    ],
                                    [
                                        92,
                                        51
                                    ]
                                ],
                                [
                                    [
                                        93,
                                        1
                                    ],
                                    [
                                        93,
                                        52
                                    ]
                                ],
                                [
                                    [
                                        94,
                                        1
                                    ],
                                    [
                                        94,
                                        32
                                    ]
                                ],
                                [
                                    [
                                        95,
                                        1
                                    ],
                                    [
                                        95,
                                        39
                                    ]
                                ],
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
                            "LoanHistory": [
                                [
                                    [
                                        9,
                                        8
                                    ],
                                    [
                                        9,
                                        12
                                    ]
                                ]
                            ]
                        }
                    }
                },
                "traceMaps": {
                    "BookManagement": {
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
                                        177
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
                                        264
                                    ],
                                    [
                                        3,
                                        286
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "15": {
                            "refs": [
                                [
                                    [
                                        1,
                                        1
                                    ],
                                    [
                                        1,
                                        29
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "17": {
                            "refs": [
                                [
                                    [
                                        3,
                                        1
                                    ],
                                    [
                                        3,
                                        302
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "19": {
                            "refs": [
                                [
                                    [
                                        9,
                                        1
                                    ],
                                    [
                                        9,
                                        65
                                    ]
                                ]
                            ],
                            "isDirectMatching": true
                        },
                        "24": {
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
                        "25": {
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
                        "26": {
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
                        "27": {
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
                        "28": {
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
                        "29": {
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
                        "30": {
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
                        "31": {
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
                        "32": {
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
                        "33": {
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
                        "34": {
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
                        "35": {
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
                        "36": {
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
                        "37": {
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
                        "38": {
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
                        "39": {
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
                        "40": {
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
                        "41": {
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
                        "42": {
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
                        "45": {
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
                        "46": {
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
                        "47": {
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
                        "48": {
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
                        "49": {
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
                        "50": {
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
                        "51": {
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
                        "52": {
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
                        "53": {
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
                        "54": {
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
                        "55": {
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
                        "56": {
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
                        "57": {
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
                        "62": {
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
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
                                        177
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "81": {
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
                            ],
                            "isDirectMatching": false
                        },
                        "85": {
                            "refs": [
                                [
                                    [
                                        3,
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        1
                                    ],
                                    [
                                        3,
                                        238
                                    ]
                                ],
                                [
                                    [
                                        7,
                                        150
                                    ],
                                    [
                                        7,
                                        159
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
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
                                        286
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "121": {
                            "refs": [
                                [
                                    [
                                        3,
                                        264
                                    ],
                                    [
                                        3,
                                        286
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
                                        7,
                                        216
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
                                        7,
                                        216
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
                                        7,
                                        216
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "130": {
                            "refs": [
                                [
                                    [
                                        3,
                                        1
                                    ],
                                    [
                                        7,
                                        216
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
                                        15
                                    ],
                                    [
                                        9,
                                        73
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
                                        15
                                    ],
                                    [
                                        9,
                                        73
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "135": {
                            "refs": [
                                [
                                    [
                                        9,
                                        15
                                    ],
                                    [
                                        9,
                                        73
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        },
                        "136": {
                            "refs": [
                                [
                                    [
                                        9,
                                        15
                                    ],
                                    [
                                        9,
                                        73
                                    ]
                                ]
                            ],
                            "isDirectMatching": false
                        }
                    }
                },
                "commandRefs": {
                    "BookManagement": {
                        "commands": {
                            "RegisterBook": [
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
                            "DiscardBook": [
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
                            "ChangeBookStatus": [
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
                                        5,
                                        214
                                    ],
                                    [
                                        5,
                                        235
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
                                        206
                                    ]
                                ]
                            ]
                        },
                        "readModels": {
                            "BookList": [
                                [
                                    [
                                        3,
                                        31
                                    ],
                                    [
                                        3,
                                        48
                                    ]
                                ]
                            ],
                            "BookDetail": [
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
                            "CategoryList": [
                                [
                                    [
                                        3,
                                        136
                                    ],
                                    [
                                        3,
                                        163
                                    ]
                                ]
                            ]
                        }
                    }
                },
                "userInputs": {
                    "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
                    "ddl": "-- 회원 테이블\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                }
            },
            "logs": [
            ]
        }
    }
}