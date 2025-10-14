export const requirementsMappingGeneratorInput = {
    "baseInput": {
        "boundedContext": {
            "name": "BookManagement",
            "alias": "도서 관리",
            "importance": "Core Domain",
            "complexity": 0.7,
            "differentiation": 0.9,
            "implementationStrategy": "Rich Domain Model",
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ],
            "events": [
                "BookRegistered",
                "BookDisposed",
                "BookStatusChanged"
            ],
            "requirements": [],
            "role": "도서의 등록, 폐기, 상태 관리(대출가능/대출중/예약중/폐기)를 담당하며, ISBN 중복 확인 및 카테고리 관리 등 도서의 생애주기 전반을 관리한다.",
            "roleRefs": [
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
            "commandNames": [
                "RegisterBook",
                "DiscardBook",
                "ChangeBookStatus",
                "ValidateIsbn"
            ],
            "readModelNames": [
                "BookList",
                "BookDetail",
                "CategoryOptions"
            ]
        }
    },

    "requirementChunks": [
        {
            "text": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
            "startLine": 1
        },
        {
            "text": "-- 회원 테이블\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
            "startLine": 11
        },
        {
            "events": [
                {
                    "name": "BookRegistered",
                    "displayName": "도서가 등록됨",
                    "actor": "Librarian",
                    "level": 1,
                    "description": "사서가 새로운 도서를 등록하면, 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아 도서가 시스템에 등록된다. 등록된 도서는 '대출가능' 상태가 된다.",
                    "inputs": [
                        "도서명",
                        "ISBN(13자리, 중복불가)",
                        "저자",
                        "출판사",
                        "카테고리(소설/비소설/학술/잡지)"
                    ],
                    "outputs": [
                        "신규 도서 등록",
                        "'대출가능' 상태 설정"
                    ],
                    "nextEvents": [
                        "BookStatusChanged"
                    ],
                    "refs": [
                        [
                            [
                                3,
                                2
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
                    "description": "도서의 대출, 반납, 예약, 폐기 등 상황에 따라 도서의 상태가 자동 또는 수동으로 변경된다.",
                    "inputs": [
                        "도서 상태 변경 트리거(대출/반납/예약/폐기)"
                    ],
                    "outputs": [
                        "도서 상태 변경(대출가능/대출중/예약중/폐기)"
                    ],
                    "nextEvents": [
                        "BookDisposed",
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
                    "name": "BookDisposed",
                    "displayName": "도서가 폐기됨",
                    "actor": "Librarian",
                    "level": 3,
                    "description": "도서가 훼손되거나 분실된 경우, 사서가 해당 도서를 폐기 처리한다. 폐기된 도서는 더 이상 대출이 불가능하다.",
                    "inputs": [
                        "폐기 사유",
                        "도서 식별자"
                    ],
                    "outputs": [
                        "도서 상태 '폐기'로 변경",
                        "대출 불가 처리"
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
                    "description": "회원이 도서 대출을 신청하고, 회원 인증 및 도서 선택 후 대출이 완료된다. 도서 상태는 '대출중'으로 변경된다.",
                    "inputs": [
                        "회원번호",
                        "이름",
                        "도서명 또는 ISBN",
                        "대출 기간(7/14/30일)"
                    ],
                    "outputs": [
                        "대출 기록 생성",
                        "도서 상태 '대출중' 변경"
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
                    "description": "대출 중인 도서에 대해 회원이 예약을 신청하면, 예약이 등록되고 도서 상태가 '예약중'으로 변경된다.",
                    "inputs": [
                        "회원번호",
                        "도서 식별자"
                    ],
                    "outputs": [
                        "예약 기록 생성",
                        "도서 상태 '예약중' 변경"
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
                    "description": "회원이 대출한 도서를 반납하면, 도서 상태가 '대출가능'으로 변경된다. 만약 예약자가 있으면 '예약중' 상태로 변경된다.",
                    "inputs": [
                        "회원번호",
                        "도서 식별자"
                    ],
                    "outputs": [
                        "반납 기록 생성",
                        "도서 상태 변경(대출가능/예약중)"
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
                    "description": "회원이 대출 중인 도서의 대출 기간을 연장하면, 대출 기록이 갱신되고 반납 예정일이 변경된다.",
                    "inputs": [
                        "회원번호",
                        "도서 식별자",
                        "연장 기간"
                    ],
                    "outputs": [
                        "대출 기록 갱신",
                        "반납 예정일 변경"
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
                    "name": "LoanOverdue",
                    "displayName": "대출이 연체됨",
                    "actor": "System",
                    "level": 3,
                    "description": "대출 기간이 경과했으나 도서가 반납되지 않은 경우, 해당 대출 건이 연체 상태로 변경된다.",
                    "inputs": [
                        "대출 만료일",
                        "반납 미처리"
                    ],
                    "outputs": [
                        "대출 상태 '연체'로 변경"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                7,
                                75
                            ],
                            [
                                7,
                                76
                            ]
                        ]
                    ]
                },
                {
                    "name": "BookHistoryTracked",
                    "displayName": "도서 이력이 기록됨",
                    "actor": "System",
                    "level": 4,
                    "description": "각 도서별로 대출 이력과 상태 변경 이력이 자동으로 기록된다.",
                    "inputs": [
                        "도서 식별자",
                        "이벤트 발생 정보"
                    ],
                    "outputs": [
                        "이력 데이터 생성"
                    ],
                    "nextEvents": [],
                    "refs": [
                        [
                            [
                                9,
                                11
                            ],
                            [
                                9,
                                65
                            ]
                        ]
                    ]
                }
            ],
            "type": "analysisResult"
        }
    ]
}