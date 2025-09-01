/**
 * @from ESDialoger.generators.DraftGeneratorByFunctions.generate
 */
export const draftGeneratorByFunctionsInputs = [
    {
        "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 상태 관리(대출가능/대출중/예약중/폐기) 및 도서 정보(도서명, ISBN, 저자, 출판사, 카테고리) 관리를 담당한다. ISBN 중복 및 자리수 유효성 검증, 카테고리 분류, 도서의 상태 변동, 폐기 처리 등을 수행한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStateChanged\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"사서\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서 정보를 입력하고, 유효성(ISBN 중복/자리수, 카테고리) 검증 후 도서를 등록하였음.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"도서관리시스템\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 상황 변화에 따라 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 조건 발생(대출/반납/예약/폐기)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능/대출중/예약중/폐기\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"사서\",\n  \"level\": 3,\n  \"description\": \"사서가 훼손, 분실 등으로 도서를 폐기 처리함. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\",\n    \"대출 불가 처리\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n## Context Relations\n\n### BookManagement-LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서 상태 변경 등 주요 이벤트가 대출/반납 프로세스에 영향을 미치므로, 느슨한 결합과 확장성을 위해 pub/sub을 적용했다.\n- **Interaction Pattern**: 도서 등록, 폐기, 상태 변경 이벤트가 발생하면 대출/반납 처리 컨텍스트가 이를 구독하여 내부 상태를 동기화한다.\n\n### BookManagement-HistoryManagement\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryManagement)\n- **Reason**: 도서 등록/상태 변경 이벤트가 이력 관리의 기록 트리거가 되므로, pub/sub을 적용해 독립성과 유연성을 보장했다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 도서 등록/상태 변경이 발생하면 이력 관리 컨텍스트가 이를 구독해 상태 변경 이력을 기록한다.",
        "boundedContext": {
            "name": "BookManagement",
            "alias": "도서 관리",
            "displayName": "도서 관리",
            "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 상태 관리(대출가능/대출중/예약중/폐기) 및 도서 정보(도서명, ISBN, 저자, 출판사, 카테고리) 관리를 담당한다. ISBN 중복 및 자리수 유효성 검증, 카테고리 분류, 도서의 상태 변동, 폐기 처리 등을 수행한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStateChanged\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"사서\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서 정보를 입력하고, 유효성(ISBN 중복/자리수, 카테고리) 검증 후 도서를 등록하였음.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"도서관리시스템\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 상황 변화에 따라 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 조건 발생(대출/반납/예약/폐기)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능/대출중/예약중/폐기\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"사서\",\n  \"level\": 3,\n  \"description\": \"사서가 훼손, 분실 등으로 도서를 폐기 처리함. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\",\n    \"대출 불가 처리\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n## Context Relations\n\n### BookManagement-LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서 상태 변경 등 주요 이벤트가 대출/반납 프로세스에 영향을 미치므로, 느슨한 결합과 확장성을 위해 pub/sub을 적용했다.\n- **Interaction Pattern**: 도서 등록, 폐기, 상태 변경 이벤트가 발생하면 대출/반납 처리 컨텍스트가 이를 구독하여 내부 상태를 동기화한다.\n\n### BookManagement-HistoryManagement\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryManagement)\n- **Reason**: 도서 등록/상태 변경 이벤트가 이력 관리의 기록 트리거가 되므로, pub/sub을 적용해 독립성과 유연성을 보장했다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 도서 등록/상태 변경이 발생하면 이력 관리 컨텍스트가 이를 구독해 상태 변경 이력을 기록한다.",
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ],
            "requirements": {
                "userStory": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                "ddl": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                "event": "{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"사서\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서 정보를 입력하고, 유효성(ISBN 중복/자리수, 카테고리) 검증 후 도서를 등록하였음.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        15\n      ],\n      [\n        3,\n        103\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"도서관리시스템\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 상황 변화에 따라 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 조건 발생(대출/반납/예약/폐기)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능/대출중/예약중/폐기\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        40\n      ],\n      [\n        3,\n        244\n      ]\n    ]\n  ]\n}\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"사서\",\n  \"level\": 3,\n  \"description\": \"사서가 훼손, 분실 등으로 도서를 폐기 처리함. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\",\n    \"대출 불가 처리\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ],\n  \"refs\": [\n    [\n      [\n        3,\n        246\n      ],\n      [\n        3,\n        305\n      ]\n    ]\n  ]\n}",
                "eventNames": "BookRegistered, BookDiscarded, BookStateChanged 이벤트가 발생할 수 있어.",
                "ddlFields": [
                    {
                        "field_name": "book_id",
                        "refs": [
                            [
                                [
                                    3,
                                    5
                                ],
                                [
                                    3,
                                    31
                                ]
                            ],
                            [
                                [
                                    23,
                                    5
                                ],
                                [
                                    23,
                                    25
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "title",
                        "refs": [
                            [
                                [
                                    4,
                                    5
                                ],
                                [
                                    4,
                                    32
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "isbn",
                        "refs": [
                            [
                                [
                                    5,
                                    5
                                ],
                                [
                                    5,
                                    37
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "author",
                        "refs": [
                            [
                                [
                                    6,
                                    5
                                ],
                                [
                                    6,
                                    33
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "publisher",
                        "refs": [
                            [
                                [
                                    7,
                                    5
                                ],
                                [
                                    7,
                                    36
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "registration_date",
                        "refs": [
                            [
                                [
                                    10,
                                    5
                                ],
                                [
                                    10,
                                    57
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "disposal_date",
                        "refs": [
                            [
                                [
                                    11,
                                    5
                                ],
                                [
                                    11,
                                    32
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "disposal_reason",
                        "refs": [
                            [
                                [
                                    12,
                                    5
                                ],
                                [
                                    12,
                                    30
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "created_at",
                        "refs": [
                            [
                                [
                                    13,
                                    5
                                ],
                                [
                                    13,
                                    50
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "updated_at",
                        "refs": [
                            [
                                [
                                    14,
                                    5
                                ],
                                [
                                    14,
                                    78
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "history_id",
                        "refs": [
                            [
                                [
                                    22,
                                    5
                                ],
                                [
                                    22,
                                    34
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "change_reason",
                        "refs": [
                            [
                                [
                                    26,
                                    5
                                ],
                                [
                                    26,
                                    31
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "changed_by",
                        "refs": [
                            [
                                [
                                    27,
                                    5
                                ],
                                [
                                    27,
                                    28
                                ]
                            ]
                        ]
                    },
                    {
                        "field_name": "change_date",
                        "refs": [
                            [
                                [
                                    28,
                                    5
                                ],
                                [
                                    28,
                                    51
                                ]
                            ]
                        ]
                    }
                ],
                "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 상태 관리(대출가능/대출중/예약중/폐기) 및 도서 정보(도서명, ISBN, 저자, 출판사, 카테고리) 관리를 담당한다. ISBN 중복 및 자리수 유효성 검증, 카테고리 분류, 도서의 상태 변동, 폐기 처리 등을 수행한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStateChanged\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"사서\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서 정보를 입력하고, 유효성(ISBN 중복/자리수, 카테고리) 검증 후 도서를 등록하였음.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"도서관리시스템\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 상황 변화에 따라 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 조건 발생(대출/반납/예약/폐기)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능/대출중/예약중/폐기\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"사서\",\n  \"level\": 3,\n  \"description\": \"사서가 훼손, 분실 등으로 도서를 폐기 처리함. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\",\n    \"대출 불가 처리\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n## Context Relations\n\n### BookManagement-LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서 상태 변경 등 주요 이벤트가 대출/반납 프로세스에 영향을 미치므로, 느슨한 결합과 확장성을 위해 pub/sub을 적용했다.\n- **Interaction Pattern**: 도서 등록, 폐기, 상태 변경 이벤트가 발생하면 대출/반납 처리 컨텍스트가 이를 구독하여 내부 상태를 동기화한다.\n\n### BookManagement-HistoryManagement\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryManagement)\n- **Reason**: 도서 등록/상태 변경 이벤트가 이력 관리의 기록 트리거가 되므로, pub/sub을 적용해 독립성과 유연성을 보장했다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 도서 등록/상태 변경이 발생하면 이력 관리 컨텍스트가 이를 구독해 상태 변경 이력을 기록한다.",
                "traceMap": {
                    "4": {
                        "refs": [
                            [
                                [
                                    1,
                                    1
                                ],
                                [
                                    3,
                                    306
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    306
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
                                    75
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
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "23": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
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
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "25": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "26": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "27": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "28": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "29": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "30": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "31": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "32": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "33": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "34": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "35": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "36": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "37": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "38": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "39": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "40": {
                        "refs": [
                            [
                                [
                                    24,
                                    1
                                ],
                                [
                                    42,
                                    3
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
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "44": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
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
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "46": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "47": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "48": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "49": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "50": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "51": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "52": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "53": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "54": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
                                ]
                            ]
                        ],
                        "isDirectMatching": true
                    },
                    "55": {
                        "refs": [
                            [
                                [
                                    84,
                                    1
                                ],
                                [
                                    96,
                                    3
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    15
                                ],
                                [
                                    3,
                                    103
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    40
                                ],
                                [
                                    3,
                                    244
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
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
                                    246
                                ],
                                [
                                    3,
                                    305
                                ]
                            ]
                        ],
                        "isDirectMatching": false
                    },
                    "122": {
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
                        ],
                        "isDirectMatching": false
                    },
                    "123": {
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
                        ],
                        "isDirectMatching": false
                    },
                    "129": {
                        "refs": [
                            [
                                [
                                    3,
                                    172
                                ],
                                [
                                    7,
                                    171
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
                                    172
                                ],
                                [
                                    7,
                                    171
                                ]
                            ]
                        ],
                        "isDirectMatching": false
                    },
                    "131": {
                        "refs": [
                            [
                                [
                                    3,
                                    172
                                ],
                                [
                                    7,
                                    171
                                ]
                            ]
                        ],
                        "isDirectMatching": false
                    },
                    "132": {
                        "refs": [
                            [
                                [
                                    3,
                                    172
                                ],
                                [
                                    7,
                                    171
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
                                    75
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
                                    75
                                ]
                            ]
                        ],
                        "isDirectMatching": false
                    },
                    "137": {
                        "refs": [
                            [
                                [
                                    9,
                                    15
                                ],
                                [
                                    9,
                                    75
                                ]
                            ]
                        ],
                        "isDirectMatching": false
                    },
                    "138": {
                        "refs": [
                            [
                                [
                                    9,
                                    15
                                ],
                                [
                                    9,
                                    75
                                ]
                            ]
                        ],
                        "isDirectMatching": false
                    }
                }
            }
        },
        "accumulatedDrafts": {
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
            "LoanProcessing": [
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
            ],
            "HistoryManagement": [
                {
                    "aggregate": {
                        "name": "LoanHistory",
                        "alias": "대출 이력"
                    },
                    "enumerations": [],
                    "valueObjects": []
                },
                {
                    "aggregate": {
                        "name": "BookStatusHistory",
                        "alias": "도서 상태 이력"
                    },
                    "enumerations": [],
                    "valueObjects": []
                }
            ]
        }
    }
]

/**
 * @from ESDialoger.generators.DraftGeneratorByFunctions.generate
 */
export const draftGeneratorByFunctionsInputsWithFeedback = [
    {
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서, 나는 새로운 도서를 등록하여 도서관의 데이터를 최신 상태로 유지하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리를 입력받아야 한다.\",\"ISBN은 13자리 숫자여야 하고 중복 확인이 필요하다.\",\"카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 한다.\",\"등록된 도서는 기본적으로 '대출가능' 상태로 설정되어야 한다.\"]},{\"title\":\"도서 상태 관리\",\"description\":\"관리자로서, 나는 도서의 대출 상태를 관리하고 폐기 처리할 수 있어야 한다.\",\"acceptance\":[\"대출/반납 상황에 따라 도서 상태가 '대출중', '예약중'으로 자동 변경되어야 한다.\",\"폐기된 도서는 더 이상 대출이 불가능해야 한다.\",\"관리자는 도서를 '폐기' 상태로 변경할 수 있어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"isUnique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"date\",\"required\":false},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"반납완료\"]}]}},\"businessRules\":[{\"name\":\"UniqueISBN\",\"description\":\"ISBN은 중복될 수 없다.\"},{\"name\":\"BookStatusChange\",\"description\":\"대출/반납 상황에 따라 도서 상태가 자동으로 변경되어야 한다.\"},{\"name\":\"DiscardedBooksRestriction\",\"description\":\"폐기된 도서는 대출이 불가능해야 한다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"BookRegistration\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Submit\",\"Clear\"]},{\"name\":\"BookStatusManagement\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"status\",\"type\":\"select\",\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}],\"actions\":[\"Edit\",\"Discard\"]}]}}}",
        "boundedContext": {
            "name": "BookManagement",
            "alias": "도서 관리",
            "displayName": "도서 관리",
            "description": [
                {
                    "type": "userStory",
                    "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                },
                {
                    "type": "ddl",
                    "text": "도서명, ISBN, 저자, 출판사, 카테고리"
                }
            ],
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ]
        },
        "accumulatedDrafts": {
            "BookManagement": [],
            "LoanManagement": [
                {
                    "aggregate": {
                        "name": "Loan",
                        "alias": "대출"
                    },
                    "entities": [],
                    "valueObjects": []
                },
                {
                    "aggregate": {
                        "name": "Member",
                        "alias": "회원"
                    },
                    "entities": [],
                    "valueObjects": []
                }
            ]
        },
        "feedback": {
            "previousDraftOutput": {
                "options": [
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "entities": [],
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
                                        "name": "ISBN",
                                        "alias": "ISBN"
                                    },
                                    {
                                        "name": "Category",
                                        "alias": "카테고리"
                                    },
                                    {
                                        "name": "BookStatus",
                                        "alias": "도서 상태"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "entities": [],
                                "valueObjects": [
                                    {
                                        "name": "ISBN",
                                        "alias": "ISBN"
                                    },
                                    {
                                        "name": "Category",
                                        "alias": "카테고리"
                                    }
                                ]
                            },
                            {
                                "aggregate": {
                                    "name": "BookStatus",
                                    "alias": "도서 상태"
                                },
                                "entities": [],
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
                            }
                        ]
                    }
                ]
            },
            "feedbacks": [
                "Aggregate가 3개인 경우를 포함해서 옵션을 생성해주세요."
            ]
        }
    }
]