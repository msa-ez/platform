export const aggregateDraftScenarios = {
    "libraryApplication": {
        "selectedStructureOption": {
            "boundedContexts": [
                {
                    "name": "LibraryBookManagement",
                    "alias": "도서 관리",
                    "importance": "Core Domain",
                    "complexity": 0.8,
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
                        "BookStateChanged",
                        "BookHistoryRecorded"
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
                            "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);"
                        }
                    ],
                    "role": "도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다."
                },
                {
                    "name": "LoanAndReservation",
                    "alias": "대출/예약 관리",
                    "importance": "Core Domain",
                    "complexity": 0.9,
                    "differentiation": 0.9,
                    "implementationStrategy": "Rich Domain Model",
                    "aggregates": [
                        {
                            "name": "Loan",
                            "alias": "대출 건"
                        },
                        {
                            "name": "Reservation",
                            "alias": "예약"
                        }
                    ],
                    "events": [
                        "LoanStarted",
                        "BookReserved",
                        "LoanReturned",
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
                            "type": "userStory",
                            "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                        }
                    ],
                    "role": "회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다."
                },
                {
                    "name": "reservation-notification",
                    "alias": "예약 & 알림 서비스",
                    "importance": "Generic Domain",
                    "complexity": 0.4,
                    "differentiation": 0.2,
                    "implementationStrategy": "PBC: reservation-notification",
                    "aggregates": [
                        {
                            "name": "Notification",
                            "alias": "알림"
                        }
                    ],
                    "events": [],
                    "requirements": [
                        {
                            "type": "DDL",
                            "text": "-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                        }
                    ],
                    "role": "예약 관련 알림 발송, 대출/반납/예약 상태 변경에 따른 알림 처리를 담당한다. 시스템 외부와의 통합을 통한 일반적 알림 서비스를 제공한다."
                }
            ],
            "relations": [
                {
                    "name": "도서 상태 변경 Pub/Sub",
                    "type": "Pub/Sub",
                    "upStream": {
                        "name": "LoanAndReservation",
                        "alias": "대출/예약 관리"
                    },
                    "downStream": {
                        "name": "LibraryBookManagement",
                        "alias": "도서 관리"
                    }
                },
                {
                    "name": "알림 서비스 Pub/Sub",
                    "type": "Pub/Sub",
                    "upStream": {
                        "name": "LoanAndReservation",
                        "alias": "대출/예약 관리"
                    },
                    "downStream": {
                        "name": "reservation-notification",
                        "alias": "예약 & 알림 서비스"
                    }
                }
            ],
            "thoughts": "도메인 복잡도와 프로세스(밸류 스트림)를 기준으로 '도서 관리'와 '대출/예약 관리'를 분리했다. '도서 관리'는 도서의 등록, 상태, 폐기, 이력 등 자산적 측면의 라이프사이클 관리를 책임지며, 상태 변화의 기준점을 제공한다. '대출/예약 관리'는 회원 중심의 대출 및 예약 과정, 대출 상태 및 연체 등 복잡한 비즈니스 규칙이 응집되어 있다. 두 컨텍스트는 상태 변화 이벤트로 느슨하게 연결되며, 이벤트 발행을 통해 각자 독립적으로 변화에 반응한다. '알림 서비스'의 경우, PBC Matching Rule에 따라 'reservation-notification' PBC로 구현되는 Generic Domain으로 지정하였다. 이는 대출/예약 프로세스의 변화에 따라 알림이 필요하나, 차별화된 복잡도가 없으므로 외부 PBC를 적극 활용하였다. 각 컨텍스트는 응집된 역할과 적절한 독립성을 유지하며, Pub/Sub 패턴을 통해 결합도를 최소화하였다.",
            "explanations": [
                {
                    "sourceContext": "대출/예약 관리",
                    "targetContext": "도서 관리",
                    "relationType": "Pub/Sub",
                    "reason": "대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.",
                    "interactionPattern": "대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
                },
                {
                    "sourceContext": "대출/예약 관리",
                    "targetContext": "예약 & 알림 서비스",
                    "relationType": "Pub/Sub",
                    "reason": "대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.",
                    "interactionPattern": "대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                }
            ],
            "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
            "currentGeneratedLength": 4250
        },
        "resultDevideBoundedContext": {
            "도메인 복잡도 분리+프로세스(value stream) 기반 분리": {
                "boundedContexts": [
                    {
                        "name": "LibraryBookManagement",
                        "alias": "도서 관리",
                        "importance": "Core Domain",
                        "complexity": 0.8,
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
                            "BookStateChanged",
                            "BookHistoryRecorded"
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
                                "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);"
                            }
                        ],
                        "role": "도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다."
                    },
                    {
                        "name": "LoanAndReservation",
                        "alias": "대출/예약 관리",
                        "importance": "Core Domain",
                        "complexity": 0.9,
                        "differentiation": 0.9,
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Loan",
                                "alias": "대출 건"
                            },
                            {
                                "name": "Reservation",
                                "alias": "예약"
                            }
                        ],
                        "events": [
                            "LoanStarted",
                            "BookReserved",
                            "LoanReturned",
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
                                "type": "userStory",
                                "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                            }
                        ],
                        "role": "회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다."
                    },
                    {
                        "name": "reservation-notification",
                        "alias": "예약 & 알림 서비스",
                        "importance": "Generic Domain",
                        "complexity": 0.4,
                        "differentiation": 0.2,
                        "implementationStrategy": "PBC: reservation-notification",
                        "aggregates": [
                            {
                                "name": "Notification",
                                "alias": "알림"
                            }
                        ],
                        "events": [],
                        "requirements": [
                            {
                                "type": "DDL",
                                "text": "-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                            }
                        ],
                        "role": "예약 관련 알림 발송, 대출/반납/예약 상태 변경에 따른 알림 처리를 담당한다. 시스템 외부와의 통합을 통한 일반적 알림 서비스를 제공한다."
                    }
                ],
                "relations": [
                    {
                        "name": "도서 상태 변경 Pub/Sub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LoanAndReservation",
                            "alias": "대출/예약 관리"
                        },
                        "downStream": {
                            "name": "LibraryBookManagement",
                            "alias": "도서 관리"
                        }
                    },
                    {
                        "name": "알림 서비스 Pub/Sub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LoanAndReservation",
                            "alias": "대출/예약 관리"
                        },
                        "downStream": {
                            "name": "reservation-notification",
                            "alias": "예약 & 알림 서비스"
                        }
                    }
                ],
                "thoughts": "도메인 복잡도와 프로세스(밸류 스트림)를 기준으로 '도서 관리'와 '대출/예약 관리'를 분리했다. '도서 관리'는 도서의 등록, 상태, 폐기, 이력 등 자산적 측면의 라이프사이클 관리를 책임지며, 상태 변화의 기준점을 제공한다. '대출/예약 관리'는 회원 중심의 대출 및 예약 과정, 대출 상태 및 연체 등 복잡한 비즈니스 규칙이 응집되어 있다. 두 컨텍스트는 상태 변화 이벤트로 느슨하게 연결되며, 이벤트 발행을 통해 각자 독립적으로 변화에 반응한다. '알림 서비스'의 경우, PBC Matching Rule에 따라 'reservation-notification' PBC로 구현되는 Generic Domain으로 지정하였다. 이는 대출/예약 프로세스의 변화에 따라 알림이 필요하나, 차별화된 복잡도가 없으므로 외부 PBC를 적극 활용하였다. 각 컨텍스트는 응집된 역할과 적절한 독립성을 유지하며, Pub/Sub 패턴을 통해 결합도를 최소화하였다.",
                "explanations": [
                    {
                        "sourceContext": "대출/예약 관리",
                        "targetContext": "도서 관리",
                        "relationType": "Pub/Sub",
                        "reason": "대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.",
                        "interactionPattern": "대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
                    },
                    {
                        "sourceContext": "대출/예약 관리",
                        "targetContext": "예약 & 알림 서비스",
                        "relationType": "Pub/Sub",
                        "reason": "대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.",
                        "interactionPattern": "대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                    }
                ],
                "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                "currentGeneratedLength": 4250
            }
        },
        "boundedContextVersion": {
            "data": {
                "boundedContexts": [
                    {
                        "name": "LibraryBookManagement",
                        "alias": "도서 관리",
                        "importance": "Core Domain",
                        "complexity": 0.8,
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
                            "BookStateChanged",
                            "BookHistoryRecorded"
                        ],
                        "requirements": [],
                        "role": "도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다."
                    },
                    {
                        "name": "LoanAndReservation",
                        "alias": "대출/예약 관리",
                        "importance": "Core Domain",
                        "complexity": 0.9,
                        "differentiation": 0.9,
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Loan",
                                "alias": "대출 건"
                            },
                            {
                                "name": "Reservation",
                                "alias": "예약"
                            }
                        ],
                        "events": [
                            "LoanStarted",
                            "BookReserved",
                            "LoanReturned",
                            "LoanExtended",
                            "LoanOverdue"
                        ],
                        "requirements": [],
                        "role": "회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다."
                    },
                    {
                        "name": "reservation-notification",
                        "alias": "예약 & 알림 서비스",
                        "importance": "Generic Domain",
                        "complexity": 0.4,
                        "differentiation": 0.2,
                        "implementationStrategy": "PBC: reservation-notification",
                        "aggregates": [
                            {
                                "name": "Notification",
                                "alias": "알림"
                            }
                        ],
                        "events": [],
                        "requirements": [],
                        "role": "예약 관련 알림 발송, 대출/반납/예약 상태 변경에 따른 알림 처리를 담당한다. 시스템 외부와의 통합을 통한 일반적 알림 서비스를 제공한다."
                    }
                ],
                "relations": [
                    {
                        "name": "도서 상태 변경 Pub/Sub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LoanAndReservation",
                            "alias": "대출/예약 관리"
                        },
                        "downStream": {
                            "name": "LibraryBookManagement",
                            "alias": "도서 관리"
                        }
                    },
                    {
                        "name": "알림 서비스 Pub/Sub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LoanAndReservation",
                            "alias": "대출/예약 관리"
                        },
                        "downStream": {
                            "name": "reservation-notification",
                            "alias": "예약 & 알림 서비스"
                        }
                    }
                ],
                "thoughts": "도메인 복잡도와 프로세스(밸류 스트림)를 기준으로 '도서 관리'와 '대출/예약 관리'를 분리했다. '도서 관리'는 도서의 등록, 상태, 폐기, 이력 등 자산적 측면의 라이프사이클 관리를 책임지며, 상태 변화의 기준점을 제공한다. '대출/예약 관리'는 회원 중심의 대출 및 예약 과정, 대출 상태 및 연체 등 복잡한 비즈니스 규칙이 응집되어 있다. 두 컨텍스트는 상태 변화 이벤트로 느슨하게 연결되며, 이벤트 발행을 통해 각자 독립적으로 변화에 반응한다. '알림 서비스'의 경우, PBC Matching Rule에 따라 'reservation-notification' PBC로 구현되는 Generic Domain으로 지정하였다. 이는 대출/예약 프로세스의 변화에 따라 알림이 필요하나, 차별화된 복잡도가 없으므로 외부 PBC를 적극 활용하였다. 각 컨텍스트는 응집된 역할과 적절한 독립성을 유지하며, Pub/Sub 패턴을 통해 결합도를 최소화하였다.",
                "explanations": [
                    {
                        "sourceContext": "대출/예약 관리",
                        "targetContext": "도서 관리",
                        "relationType": "Pub/Sub",
                        "reason": "대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.",
                        "interactionPattern": "대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
                    },
                    {
                        "sourceContext": "대출/예약 관리",
                        "targetContext": "예약 & 알림 서비스",
                        "relationType": "Pub/Sub",
                        "reason": "대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.",
                        "interactionPattern": "대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                    }
                ],
                "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                "currentGeneratedLength": 4250
            },
            "version": 1,
            "aspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리"
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
                                "name": "ISBN",
                                "alias": "ISBN",
                                "referencedAggregateName": ""
                            },
                            {
                                "name": "LoanReference",
                                "alias": "대출 참조",
                                "referencedAggregate": {
                                    "name": "Loan",
                                    "alias": "대출 건"
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
                                "name": "BookStatusHistory",
                                "alias": "도서 상태 변경 이력",
                                "referencedAggregateName": ""
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
                    }
                ],
                "pros": {
                    "cohesion": "도서 정보, 상태, 폐기 및 모든 상태 이력이 하나의 Aggregate에 집중되어 도서 라이프사이클 불변식을 강력하게 보장한다.",
                    "coupling": "Loan, Reservation Aggregate를 ValueObject로 참조함으로써 대출/예약 관리 컨텍스트와의 결합도를 낮춘다.",
                    "consistency": "상태 변경, 폐기, 이력 기록 등 핵심 트랜잭션이 한 번에 원자적으로 처리된다.",
                    "encapsulation": "도서의 전체 상태와 변경 내역을 한곳에서 관리하여, 도서 관리 규칙이 Aggregate 내부에 잘 은닉된다.",
                    "complexity": "단일 Aggregate 접근으로 도서 및 이력에 대한 쿼리·갱신 논리가 단순해진다.",
                    "independence": "도서 도메인 변경이 다른 Aggregate에 영향을 거의 주지 않는다.",
                    "performance": "도서 상태 및 이력 질의 시 별도 조인이나 복잡한 연동 없이 빠르게 접근할 수 있다."
                },
                "cons": {
                    "cohesion": "상태 이력 데이터가 많아질수록 Book Aggregate의 사이즈가 커져, 본질적으로 서로 다른 관심사(도서 관리, 이력 관리)가 혼재된다.",
                    "coupling": "도서 변경 빈도가 높고 이력 기록이 많으면 Aggregate 락 경합이 발생할 수 있다.",
                    "consistency": "이력 데이터가 커질수록 트랜잭션 처리 시간이 길어져 대량 처리 시 성능 저하 우려가 있다.",
                    "encapsulation": "단일 Aggregate가 너무 많은 책임을 져서, 변경/확장 시 영향 범위가 커진다.",
                    "complexity": "아주 다양한 도서 시나리오(상태, 이력, 폐기 등)가 복잡하게 얽혀 Aggregate가 비대해질 수 있다.",
                    "independence": "이력 데이터 증가 시 도서 관리와 이력 관리의 독립적 확장·배포가 어렵다.",
                    "performance": "이력 건수가 많을 때 도서 정보 단순 조회조차 무거워질 수 있다."
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "name": "LibraryBookManagement",
                    "alias": "도서 관리",
                    "displayName": "도서 관리",
                    "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.",
                    "aggregates": [
                        {
                            "name": "Book",
                            "alias": "도서"
                        }
                    ],
                    "requirements": {
                        "userStory": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                        "ddl": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                        "event": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}\n{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}",
                        "eventNames": "BookRegistered, BookDisposed, BookStateChanged, BookHistoryRecorded 이벤트가 발생할 수 있어.",
                        "ddlFields": [
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
                    }
                },
                "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
            },
            "LoanAndReservation": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Loan",
                            "alias": "대출 건"
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
                            },
                            {
                                "name": "LoanHistory",
                                "alias": "대출 이력",
                                "referencedAggregateName": ""
                            }
                        ],
                        "previewAttributes": [
                            "loan_id",
                            "member_id",
                            "book_id",
                            "loan_date",
                            "due_date",
                            "return_date",
                            "loan_period_days",
                            "status",
                            "extension_count",
                            "created_at",
                            "updated_at",
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
                            "name": "Reservation",
                            "alias": "예약"
                        },
                        "enumerations": [
                            {
                                "name": "ReservationStatus",
                                "alias": "예약 상태"
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
                            },
                            {
                                "name": "ReservationHistory",
                                "alias": "예약 이력",
                                "referencedAggregateName": ""
                            }
                        ],
                        "previewAttributes": [
                            "reservation_id",
                            "member_id",
                            "book_id",
                            "reservation_date",
                            "status",
                            "notification_sent",
                            "expiry_date",
                            "created_at",
                            "updated_at"
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "대출과 예약의 정책, 업무 흐름을 각자의 Aggregate에서 독립적으로 관리하여 관심사의 분리가 명확.",
                    "coupling": "도서, 회원 참조 외에는 타 Aggregate와의 의존성이 없어 서비스의 모듈화와 확장이 용이.",
                    "consistency": "각 Aggregate 내의 핵심 비즈니스 규칙(예: 대출→연체, 예약→예약완료 등)은 원자적 트랜잭션으로 처리 가능.",
                    "encapsulation": "도서 상태변경, 알림 이벤트 발행 등 업무 경계 밖 기능을 ValueObject 및 이벤트로 분리해 도메인 규칙 은닉.",
                    "complexity": "업무 복잡도 증가에도 구조가 단순하게 유지되어 유지보수 및 테스트가 쉬움.",
                    "independence": "대출 정책 혹은 예약 정책이 바뀌더라도 상호 영향 없이 개발/배포 가능.",
                    "performance": "예약, 대출이 빈번히 동시에 발생해도 별도의 Aggregate로 관리되어 경합 최소화."
                },
                "cons": {
                    "cohesion": "대출과 예약이 연관된 복잡한 정책(예: 반납 시 예약자 우선 처리)이 있을 때 Cross-Aggregate 트랜잭션 관리 필요.",
                    "coupling": "상태 변경 시 서로 이벤트 발행 및 외부 Pub/Sub로의 동기화 코드가 증가.",
                    "consistency": "예약과 대출 간의 강한 일관성이 요구될 경우 eventual consistency 패턴 적용 필요.",
                    "encapsulation": "업무 규칙이 양쪽 Aggregate에 분산될 수 있어 도메인 규칙 파악이 다소 분산될 수 있음.",
                    "complexity": "업무 프로세스가 길어질 경우, orchestration이나 saga 패턴 등 별도의 프로세스 조정 필요.",
                    "independence": "예약-대출 간 정책 변화가 잦을 때 연계 로직을 지속적으로 맞춰줘야 함.",
                    "performance": "도서별 예약/대출 현황을 통합 조회 시 추가 조인 또는 데이터 집계 로직이 필요."
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "name": "LoanAndReservation",
                    "alias": "대출/예약 관리",
                    "displayName": "대출/예약 관리",
                    "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다.",
                    "aggregates": [
                        {
                            "name": "Loan",
                            "alias": "대출 건"
                        },
                        {
                            "name": "Reservation",
                            "alias": "예약"
                        }
                    ],
                    "requirements": {
                        "userStory": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.",
                        "ddl": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
                        "event": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}\n{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}",
                        "eventNames": "LoanStarted, BookReserved, LoanReturned, LoanExtended, LoanOverdue 이벤트가 발생할 수 있어.",
                        "ddlFields": [
                            "loan_id",
                            "member_id",
                            "book_id",
                            "loan_date",
                            "due_date",
                            "return_date",
                            "loan_period_days",
                            "status",
                            "extension_count",
                            "created_at",
                            "updated_at",
                            "reservation_id",
                            "reservation_date",
                            "notification_sent",
                            "expiry_date",
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
                    }
                },
                "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
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
                "uniqueId": "5cb02d8e5b8d14c19c72cfbdc2cc8dec",
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
                            "e333c17f-f32d-45e7-d0b4-ccf82015d0cc": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "e333c17f-f32d-45e7-d0b4-ccf82015d0cc",
                                "name": "Librarian",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "e333c17f-f32d-45e7-d0b4-ccf82015d0cc",
                                    "x": 150,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "6b037e7f-f3a8-8a5f-c7cb-d232c2a8ba78": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "6b037e7f-f3a8-8a5f-c7cb-d232c2a8ba78",
                                "name": "Member",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "6b037e7f-f3a8-8a5f-c7cb-d232c2a8ba78",
                                    "x": 150,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "abdebafe-c9d9-b0bd-d3cc-0257c25a6371": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "abdebafe-c9d9-b0bd-d3cc-0257c25a6371",
                                "name": "System",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "abdebafe-c9d9-b0bd-d3cc-0257c25a6371",
                                    "x": 150,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
                                "visibility": "public",
                                "name": "BookRegistered",
                                "oldName": "",
                                "displayName": "도서 등록됨",
                                "namePascalCase": "BookRegistered",
                                "nameCamelCase": "bookRegistered",
                                "namePlural": "",
                                "description": "사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.",
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
                                    "id": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
                                    "x": 300,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
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
                            "48a7ffd9-e347-7898-5986-7cd1c164fb75": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
                                "visibility": "public",
                                "name": "BookDisposed",
                                "oldName": "",
                                "displayName": "도서 폐기됨",
                                "namePascalCase": "BookDisposed",
                                "nameCamelCase": "bookDisposed",
                                "namePlural": "",
                                "description": "도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.",
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
                                    "id": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
                                    "x": 500,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
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
                            "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "visibility": "public",
                                "name": "BookStateChanged",
                                "oldName": "",
                                "displayName": "도서 상태 변경됨",
                                "namePascalCase": "BookStateChanged",
                                "nameCamelCase": "bookStateChanged",
                                "namePlural": "",
                                "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "x": 300,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                            "d133d48e-ee71-b128-7b06-41a984d56675": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "d133d48e-ee71-b128-7b06-41a984d56675",
                                "visibility": "public",
                                "name": "LoanOverdue",
                                "oldName": "",
                                "displayName": "대출 연체 발생됨",
                                "namePascalCase": "LoanOverdue",
                                "nameCamelCase": "loanOverdue",
                                "namePlural": "",
                                "description": "반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.",
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
                                    "id": "d133d48e-ee71-b128-7b06-41a984d56675",
                                    "x": 500,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "d133d48e-ee71-b128-7b06-41a984d56675",
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
                            "664551f4-9c6f-0e25-23f2-d01eebb5acb7": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "664551f4-9c6f-0e25-23f2-d01eebb5acb7",
                                "visibility": "public",
                                "name": "BookHistoryRecorded",
                                "oldName": "",
                                "displayName": "도서 이력 기록됨",
                                "namePascalCase": "BookHistoryRecorded",
                                "nameCamelCase": "bookHistoryRecorded",
                                "namePlural": "",
                                "description": "도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.",
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
                                    "id": "664551f4-9c6f-0e25-23f2-d01eebb5acb7",
                                    "x": 700,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "664551f4-9c6f-0e25-23f2-d01eebb5acb7",
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
                            "8518723e-7c67-d947-89b0-486b8dae917a": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                "visibility": "public",
                                "name": "LoanStarted",
                                "oldName": "",
                                "displayName": "도서 대출 시작됨",
                                "namePascalCase": "LoanStarted",
                                "nameCamelCase": "loanStarted",
                                "namePlural": "",
                                "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
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
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "x": 300,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
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
                            "082cadf8-dade-4956-112c-93df9c099189": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "082cadf8-dade-4956-112c-93df9c099189",
                                "visibility": "public",
                                "name": "BookReserved",
                                "oldName": "",
                                "displayName": "도서 예약됨",
                                "namePascalCase": "BookReserved",
                                "nameCamelCase": "bookReserved",
                                "namePlural": "",
                                "description": "회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.",
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
                                    "id": "082cadf8-dade-4956-112c-93df9c099189",
                                    "x": 500,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "082cadf8-dade-4956-112c-93df9c099189",
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
                            "1c0c8d96-5426-4ea0-3928-230993425e23": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                "visibility": "public",
                                "name": "LoanReturned",
                                "oldName": "",
                                "displayName": "도서 반납됨",
                                "namePascalCase": "LoanReturned",
                                "nameCamelCase": "loanReturned",
                                "namePlural": "",
                                "description": "회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.",
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
                                    "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                    "x": 700,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
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
                            "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
                                "visibility": "public",
                                "name": "LoanExtended",
                                "oldName": "",
                                "displayName": "대출 연장됨",
                                "namePascalCase": "LoanExtended",
                                "nameCamelCase": "loanExtended",
                                "namePlural": "",
                                "description": "회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.",
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
                                    "id": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
                                    "x": 900,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
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
                            "59257822-4f35-fcbf-5a40-f49c4cf7f2df": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "59257822-4f35-fcbf-5a40-f49c4cf7f2df",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "59257822-4f35-fcbf-5a40-f49c4cf7f2df",
                                "to": "59257822-4f35-fcbf-5a40-f49c4cf7f2df",
                                "description": "",
                                "relationView": {
                                    "id": "59257822-4f35-fcbf-5a40-f49c4cf7f2df",
                                    "value": "[[0,275],[2000,275]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,275],[2000,275]]"
                            },
                            "05fb902c-0cb8-d1dd-a085-34f3a3455a60": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "05fb902c-0cb8-d1dd-a085-34f3a3455a60",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "05fb902c-0cb8-d1dd-a085-34f3a3455a60",
                                "to": "05fb902c-0cb8-d1dd-a085-34f3a3455a60",
                                "description": "",
                                "relationView": {
                                    "id": "05fb902c-0cb8-d1dd-a085-34f3a3455a60",
                                    "value": "[[0,525],[2000,525]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,525],[2000,525]]"
                            },
                            "18a24fe9-74ab-2ac3-52a7-678fac307f26": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "18a24fe9-74ab-2ac3-52a7-678fac307f26",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "18a24fe9-74ab-2ac3-52a7-678fac307f26",
                                "to": "18a24fe9-74ab-2ac3-52a7-678fac307f26",
                                "description": "",
                                "relationView": {
                                    "id": "18a24fe9-74ab-2ac3-52a7-678fac307f26",
                                    "value": "[[0,775],[2000,775]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,775],[2000,775]]"
                            },
                            "c83c192d-8f3f-13b7-fb53-67e8e60639d4": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "c83c192d-8f3f-13b7-fb53-67e8e60639d4",
                                "name": "1",
                                "displayName": "1",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
                                    "visibility": "public",
                                    "name": "BookRegistered",
                                    "oldName": "",
                                    "displayName": "도서 등록됨",
                                    "namePascalCase": "BookRegistered",
                                    "nameCamelCase": "bookRegistered",
                                    "namePlural": "",
                                    "description": "사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.",
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
                                        "id": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
                                        "x": 300,
                                        "y": 150,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
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
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                "from": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
                                "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "relationView": {
                                    "id": "c83c192d-8f3f-13b7-fb53-67e8e60639d4",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "1e9169a7-8a98-3c28-00d8-cb9fcf76a91b",
                                    "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "needReconnect": true
                                }
                            },
                            "2a881619-f301-2ec7-7024-09085326dd5f": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "2a881619-f301-2ec7-7024-09085326dd5f",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                    "id": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
                                    "visibility": "public",
                                    "name": "BookDisposed",
                                    "oldName": "",
                                    "displayName": "도서 폐기됨",
                                    "namePascalCase": "BookDisposed",
                                    "nameCamelCase": "bookDisposed",
                                    "namePlural": "",
                                    "description": "도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.",
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
                                        "id": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
                                        "x": 500,
                                        "y": 150,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
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
                                "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "to": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
                                "relationView": {
                                    "id": "2a881619-f301-2ec7-7024-09085326dd5f",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "to": "48a7ffd9-e347-7898-5986-7cd1c164fb75",
                                    "needReconnect": true
                                }
                            },
                            "5d599f2b-45f4-fe3a-1be0-6c132797f91f": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "5d599f2b-45f4-fe3a-1be0-6c132797f91f",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "visibility": "public",
                                    "name": "LoanStarted",
                                    "oldName": "",
                                    "displayName": "도서 대출 시작됨",
                                    "namePascalCase": "LoanStarted",
                                    "nameCamelCase": "loanStarted",
                                    "namePlural": "",
                                    "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
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
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
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
                                "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "to": "8518723e-7c67-d947-89b0-486b8dae917a",
                                "relationView": {
                                    "id": "5d599f2b-45f4-fe3a-1be0-6c132797f91f",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "to": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "needReconnect": true
                                }
                            },
                            "e429caf1-f03c-a061-0c55-023e0afd52fd": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "e429caf1-f03c-a061-0c55-023e0afd52fd",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                    "id": "082cadf8-dade-4956-112c-93df9c099189",
                                    "visibility": "public",
                                    "name": "BookReserved",
                                    "oldName": "",
                                    "displayName": "도서 예약됨",
                                    "namePascalCase": "BookReserved",
                                    "nameCamelCase": "bookReserved",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.",
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
                                        "id": "082cadf8-dade-4956-112c-93df9c099189",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "082cadf8-dade-4956-112c-93df9c099189",
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
                                "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "to": "082cadf8-dade-4956-112c-93df9c099189",
                                "relationView": {
                                    "id": "e429caf1-f03c-a061-0c55-023e0afd52fd",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "to": "082cadf8-dade-4956-112c-93df9c099189",
                                    "needReconnect": true
                                }
                            },
                            "d1f7d051-4afe-34d8-9d4f-2a9527e2b149": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "d1f7d051-4afe-34d8-9d4f-2a9527e2b149",
                                "name": "2",
                                "displayName": "2",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                    "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.",
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
                                        "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
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
                                "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "to": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                "relationView": {
                                    "id": "d1f7d051-4afe-34d8-9d4f-2a9527e2b149",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "to": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                    "needReconnect": true
                                }
                            },
                            "2e99e45b-3164-2eda-4a64-382be893d0b3": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "2e99e45b-3164-2eda-4a64-382be893d0b3",
                                "name": "4",
                                "displayName": "4",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "visibility": "public",
                                    "name": "LoanStarted",
                                    "oldName": "",
                                    "displayName": "도서 대출 시작됨",
                                    "namePascalCase": "LoanStarted",
                                    "nameCamelCase": "loanStarted",
                                    "namePlural": "",
                                    "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
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
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
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
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "relationView": {
                                    "id": "2e99e45b-3164-2eda-4a64-382be893d0b3",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "needReconnect": true
                                }
                            },
                            "94ecc1fe-0491-5ce4-726b-f659a62eda8f": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "94ecc1fe-0491-5ce4-726b-f659a62eda8f",
                                "name": "4",
                                "displayName": "4",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "visibility": "public",
                                    "name": "LoanStarted",
                                    "oldName": "",
                                    "displayName": "도서 대출 시작됨",
                                    "namePascalCase": "LoanStarted",
                                    "nameCamelCase": "loanStarted",
                                    "namePlural": "",
                                    "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
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
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
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
                                    "id": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
                                    "visibility": "public",
                                    "name": "LoanExtended",
                                    "oldName": "",
                                    "displayName": "대출 연장됨",
                                    "namePascalCase": "LoanExtended",
                                    "nameCamelCase": "loanExtended",
                                    "namePlural": "",
                                    "description": "회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.",
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
                                        "id": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
                                        "x": 900,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
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
                                "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                "to": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
                                "relationView": {
                                    "id": "94ecc1fe-0491-5ce4-726b-f659a62eda8f",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "to": "0b4a4594-cd33-8c0d-05e0-e4ee083a62c3",
                                    "needReconnect": true
                                }
                            },
                            "3525be50-6403-9d36-8c50-cf57378aa854": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "3525be50-6403-9d36-8c50-cf57378aa854",
                                "name": "4",
                                "displayName": "4",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "visibility": "public",
                                    "name": "LoanStarted",
                                    "oldName": "",
                                    "displayName": "도서 대출 시작됨",
                                    "namePascalCase": "LoanStarted",
                                    "nameCamelCase": "loanStarted",
                                    "namePlural": "",
                                    "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
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
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
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
                                    "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.",
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
                                        "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
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
                                "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                "to": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                "relationView": {
                                    "id": "3525be50-6403-9d36-8c50-cf57378aa854",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "to": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                    "needReconnect": true
                                }
                            },
                            "5ebffcb0-6fd8-d16e-d0e2-246c5c3e32be": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "5ebffcb0-6fd8-d16e-d0e2-246c5c3e32be",
                                "name": "4",
                                "displayName": "4",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "visibility": "public",
                                    "name": "LoanStarted",
                                    "oldName": "",
                                    "displayName": "도서 대출 시작됨",
                                    "namePascalCase": "LoanStarted",
                                    "nameCamelCase": "loanStarted",
                                    "namePlural": "",
                                    "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
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
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
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
                                    "id": "d133d48e-ee71-b128-7b06-41a984d56675",
                                    "visibility": "public",
                                    "name": "LoanOverdue",
                                    "oldName": "",
                                    "displayName": "대출 연체 발생됨",
                                    "namePascalCase": "LoanOverdue",
                                    "nameCamelCase": "loanOverdue",
                                    "namePlural": "",
                                    "description": "반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.",
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
                                        "id": "d133d48e-ee71-b128-7b06-41a984d56675",
                                        "x": 500,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "d133d48e-ee71-b128-7b06-41a984d56675",
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
                                "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                "to": "d133d48e-ee71-b128-7b06-41a984d56675",
                                "relationView": {
                                    "id": "5ebffcb0-6fd8-d16e-d0e2-246c5c3e32be",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "to": "d133d48e-ee71-b128-7b06-41a984d56675",
                                    "needReconnect": true
                                }
                            },
                            "7d573003-9587-d791-5530-33d2bc084a7d": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "7d573003-9587-d791-5530-33d2bc084a7d",
                                "name": "5",
                                "displayName": "5",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "082cadf8-dade-4956-112c-93df9c099189",
                                    "visibility": "public",
                                    "name": "BookReserved",
                                    "oldName": "",
                                    "displayName": "도서 예약됨",
                                    "namePascalCase": "BookReserved",
                                    "nameCamelCase": "bookReserved",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.",
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
                                        "id": "082cadf8-dade-4956-112c-93df9c099189",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "082cadf8-dade-4956-112c-93df9c099189",
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
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                "from": "082cadf8-dade-4956-112c-93df9c099189",
                                "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "relationView": {
                                    "id": "7d573003-9587-d791-5530-33d2bc084a7d",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "082cadf8-dade-4956-112c-93df9c099189",
                                    "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "needReconnect": true
                                }
                            },
                            "d75b9c8f-f97e-70da-385a-f60d8fe61e24": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "d75b9c8f-f97e-70da-385a-f60d8fe61e24",
                                "name": "5",
                                "displayName": "5",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "082cadf8-dade-4956-112c-93df9c099189",
                                    "visibility": "public",
                                    "name": "BookReserved",
                                    "oldName": "",
                                    "displayName": "도서 예약됨",
                                    "namePascalCase": "BookReserved",
                                    "nameCamelCase": "bookReserved",
                                    "namePlural": "",
                                    "description": "회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.",
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
                                        "id": "082cadf8-dade-4956-112c-93df9c099189",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "082cadf8-dade-4956-112c-93df9c099189",
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
                                    "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "visibility": "public",
                                    "name": "LoanStarted",
                                    "oldName": "",
                                    "displayName": "도서 대출 시작됨",
                                    "namePascalCase": "LoanStarted",
                                    "nameCamelCase": "loanStarted",
                                    "namePlural": "",
                                    "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
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
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "8518723e-7c67-d947-89b0-486b8dae917a",
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
                                "from": "082cadf8-dade-4956-112c-93df9c099189",
                                "to": "8518723e-7c67-d947-89b0-486b8dae917a",
                                "relationView": {
                                    "id": "d75b9c8f-f97e-70da-385a-f60d8fe61e24",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "082cadf8-dade-4956-112c-93df9c099189",
                                    "to": "8518723e-7c67-d947-89b0-486b8dae917a",
                                    "needReconnect": true
                                }
                            },
                            "b133eccf-da0b-e005-19f9-44a402af6f2d": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "b133eccf-da0b-e005-19f9-44a402af6f2d",
                                "name": "6",
                                "displayName": "6",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                    "visibility": "public",
                                    "name": "LoanReturned",
                                    "oldName": "",
                                    "displayName": "도서 반납됨",
                                    "namePascalCase": "LoanReturned",
                                    "nameCamelCase": "loanReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.",
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
                                        "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "1c0c8d96-5426-4ea0-3928-230993425e23",
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
                                    "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "visibility": "public",
                                    "name": "BookStateChanged",
                                    "oldName": "",
                                    "displayName": "도서 상태 변경됨",
                                    "namePascalCase": "BookStateChanged",
                                    "nameCamelCase": "bookStateChanged",
                                    "namePlural": "",
                                    "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
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
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
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
                                "from": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                "relationView": {
                                    "id": "b133eccf-da0b-e005-19f9-44a402af6f2d",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "1c0c8d96-5426-4ea0-3928-230993425e23",
                                    "to": "fc11f3ae-e060-ef5b-e3e1-d7ea9c3ddd20",
                                    "needReconnect": true
                                }
                            }
                        }
                    },
                    "analysisResult": {
                        "recommendedBoundedContextsNumber": 4,
                        "reasonOfRecommendedBoundedContextsNumber": "도서관 도서 관리 및 대출/반납 시스템은 도서 정보 관리, 도서 상태 및 이력 관리, 회원 및 대출/예약 관리, 현황 조회라는 네 개의 명확한 비즈니스 기능으로 나눌 수 있습니다. 각각의 컨텍스트는 독립적인 책임과 이벤트 흐름을 가지고 있으며, 도서 관리자는 도서 및 상태 변경에, 회원은 대출 및 예약/반납에, 시스템은 자동 상태 전이 및 이력 기록에 집중합니다. 이벤트 복잡성과 비즈니스 규칙(예: ISBN 중복, 폐기 도서 대출 불가, 예약 자동 전환 등)이 컨텍스트 분리를 필요로 하며, 이는 실제 업무 및 조직 구조와 일치합니다.",
                        "events": [
                            {
                                "name": "BookRegistered",
                                "displayName": "도서 등록됨",
                                "actor": "Librarian",
                                "level": 1,
                                "description": "사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.",
                                "inputs": [
                                    "도서명",
                                    "ISBN",
                                    "저자",
                                    "출판사",
                                    "카테고리(소설/비소설/학술/잡지)",
                                    "ISBN 중복 아님"
                                ],
                                "outputs": [
                                    "신규 도서 정보",
                                    "'대출가능' 상태"
                                ],
                                "nextEvents": [
                                    "BookStateChanged"
                                ]
                            },
                            {
                                "name": "BookStateChanged",
                                "displayName": "도서 상태 변경됨",
                                "actor": "System",
                                "level": 2,
                                "description": "도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.",
                                "inputs": [
                                    "도서",
                                    "상태 변경 조건(대출, 반납, 예약, 폐기 등)"
                                ],
                                "outputs": [
                                    "변경된 도서 상태"
                                ],
                                "nextEvents": [
                                    "BookDisposed",
                                    "LoanStarted",
                                    "BookReserved",
                                    "LoanReturned"
                                ]
                            },
                            {
                                "name": "BookDisposed",
                                "displayName": "도서 폐기됨",
                                "actor": "Librarian",
                                "level": 3,
                                "description": "도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.",
                                "inputs": [
                                    "도서",
                                    "폐기 사유(훼손, 분실)"
                                ],
                                "outputs": [
                                    "도서 상태: '폐기'"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanStarted",
                                "displayName": "도서 대출 시작됨",
                                "actor": "Member",
                                "level": 4,
                                "description": "회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.",
                                "inputs": [
                                    "회원번호",
                                    "회원명",
                                    "도서",
                                    "도서 상태: '대출가능'",
                                    "대출 기간(7/14/30일)"
                                ],
                                "outputs": [
                                    "대출 건 생성",
                                    "도서 상태: '대출중'",
                                    "대출일/반납예정일"
                                ],
                                "nextEvents": [
                                    "BookStateChanged",
                                    "LoanExtended",
                                    "LoanReturned",
                                    "LoanOverdue"
                                ]
                            },
                            {
                                "name": "BookReserved",
                                "displayName": "도서 예약됨",
                                "actor": "Member",
                                "level": 5,
                                "description": "회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.",
                                "inputs": [
                                    "회원번호",
                                    "회원명",
                                    "도서 상태: '대출중'"
                                ],
                                "outputs": [
                                    "예약 정보 생성",
                                    "도서 상태: '예약중'"
                                ],
                                "nextEvents": [
                                    "BookStateChanged",
                                    "LoanStarted"
                                ]
                            },
                            {
                                "name": "LoanReturned",
                                "displayName": "도서 반납됨",
                                "actor": "Member",
                                "level": 6,
                                "description": "회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.",
                                "inputs": [
                                    "회원",
                                    "도서",
                                    "대출 건"
                                ],
                                "outputs": [
                                    "반납일 기록",
                                    "도서 상태: '대출가능' 또는 '예약중'"
                                ],
                                "nextEvents": [
                                    "BookStateChanged"
                                ]
                            },
                            {
                                "name": "LoanExtended",
                                "displayName": "대출 연장됨",
                                "actor": "Member",
                                "level": 7,
                                "description": "회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.",
                                "inputs": [
                                    "회원",
                                    "대출 건",
                                    "연장 요청"
                                ],
                                "outputs": [
                                    "반납 예정일 갱신"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanOverdue",
                                "displayName": "대출 연체 발생됨",
                                "actor": "System",
                                "level": 8,
                                "description": "반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.",
                                "inputs": [
                                    "대출 건",
                                    "반납 예정일 경과"
                                ],
                                "outputs": [
                                    "대출 상태: '연체'"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookHistoryRecorded",
                                "displayName": "도서 이력 기록됨",
                                "actor": "System",
                                "level": 9,
                                "description": "도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.",
                                "inputs": [
                                    "도서",
                                    "상태 변화, 대출/반납/예약/폐기 이벤트"
                                ],
                                "outputs": [
                                    "이력 데이터 축적"
                                ],
                                "nextEvents": []
                            }
                        ],
                        "actors": [
                            {
                                "name": "Librarian",
                                "events": [
                                    "BookRegistered",
                                    "BookDisposed"
                                ],
                                "lane": 0
                            },
                            {
                                "name": "Member",
                                "events": [
                                    "LoanStarted",
                                    "BookReserved",
                                    "LoanReturned",
                                    "LoanExtended"
                                ],
                                "lane": 1
                            },
                            {
                                "name": "System",
                                "events": [
                                    "BookStateChanged",
                                    "LoanOverdue",
                                    "BookHistoryRecorded"
                                ],
                                "lane": 2
                            }
                        ]
                    },
                    "currentGeneratedLength": 4880
                },
                "currentGeneratedLength": 0,
                "timestamp": "2025-08-07T04:39:09.536Z"
            },
            {
                "uniqueId": "cbeab3f156b331775269febc7396fd1f",
                "type": "bcGenerationOption",
                "isSummarizeStarted": false,
                "isGeneratingBoundedContext": false,
                "isStartMapping": false,
                "isAnalizing": false,
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
                "recommendedBoundedContextsNumber": 4,
                "reasonOfRecommendedBoundedContextsNumber": "도서관 도서 관리 및 대출/반납 시스템은 도서 정보 관리, 도서 상태 및 이력 관리, 회원 및 대출/예약 관리, 현황 조회라는 네 개의 명확한 비즈니스 기능으로 나눌 수 있습니다. 각각의 컨텍스트는 독립적인 책임과 이벤트 흐름을 가지고 있으며, 도서 관리자는 도서 및 상태 변경에, 회원은 대출 및 예약/반납에, 시스템은 자동 상태 전이 및 이력 기록에 집중합니다. 이벤트 복잡성과 비즈니스 규칙(예: ISBN 중복, 폐기 도서 대출 불가, 예약 자동 전환 등)이 컨텍스트 분리를 필요로 하며, 이는 실제 업무 및 조직 구조와 일치합니다.",
                "timestamp": "2025-08-07T04:39:29.065Z"
            },
            {
                "uniqueId": "b953288e72c7c39ab52adf94b2baed85",
                "type": "boundedContextResult",
                "result": {
                    "도메인 복잡도 분리+프로세스(value stream) 기반 분리": {
                        "boundedContexts": [
                            {
                                "name": "LibraryBookManagement",
                                "alias": "도서 관리",
                                "importance": "Core Domain",
                                "complexity": 0.8,
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
                                    "BookStateChanged",
                                    "BookHistoryRecorded"
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
                                        "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "DDL",
                                        "text": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);"
                                    },
                                    {
                                        "type": "DDL",
                                        "text": "-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);"
                                    }
                                ],
                                "role": "도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다."
                            },
                            {
                                "name": "LoanAndReservation",
                                "alias": "대출/예약 관리",
                                "importance": "Core Domain",
                                "complexity": 0.9,
                                "differentiation": 0.9,
                                "implementationStrategy": "Rich Domain Model",
                                "aggregates": [
                                    {
                                        "name": "Loan",
                                        "alias": "대출 건"
                                    },
                                    {
                                        "name": "Reservation",
                                        "alias": "예약"
                                    }
                                ],
                                "events": [
                                    "LoanStarted",
                                    "BookReserved",
                                    "LoanReturned",
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
                                        "type": "userStory",
                                        "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "DDL",
                                        "text": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);"
                                    },
                                    {
                                        "type": "DDL",
                                        "text": "-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);"
                                    },
                                    {
                                        "type": "DDL",
                                        "text": "-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);"
                                    },
                                    {
                                        "type": "DDL",
                                        "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                                    }
                                ],
                                "role": "회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다."
                            },
                            {
                                "name": "reservation-notification",
                                "alias": "예약 & 알림 서비스",
                                "importance": "Generic Domain",
                                "complexity": 0.4,
                                "differentiation": 0.2,
                                "implementationStrategy": "PBC: reservation-notification",
                                "aggregates": [
                                    {
                                        "name": "Notification",
                                        "alias": "알림"
                                    }
                                ],
                                "events": [],
                                "requirements": [],
                                "role": "예약 관련 알림 발송, 대출/반납/예약 상태 변경에 따른 알림 처리를 담당한다. 시스템 외부와의 통합을 통한 일반적 알림 서비스를 제공한다."
                            }
                        ],
                        "relations": [
                            {
                                "name": "도서 상태 변경 Pub/Sub",
                                "type": "Pub/Sub",
                                "upStream": {
                                    "name": "LoanAndReservation",
                                    "alias": "대출/예약 관리"
                                },
                                "downStream": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서 관리"
                                }
                            },
                            {
                                "name": "알림 서비스 Pub/Sub",
                                "type": "Pub/Sub",
                                "upStream": {
                                    "name": "LoanAndReservation",
                                    "alias": "대출/예약 관리"
                                },
                                "downStream": {
                                    "name": "reservation-notification",
                                    "alias": "예약 & 알림 서비스"
                                }
                            }
                        ],
                        "thoughts": "도메인 복잡도와 프로세스(밸류 스트림)를 기준으로 '도서 관리'와 '대출/예약 관리'를 분리했다. '도서 관리'는 도서의 등록, 상태, 폐기, 이력 등 자산적 측면의 라이프사이클 관리를 책임지며, 상태 변화의 기준점을 제공한다. '대출/예약 관리'는 회원 중심의 대출 및 예약 과정, 대출 상태 및 연체 등 복잡한 비즈니스 규칙이 응집되어 있다. 두 컨텍스트는 상태 변화 이벤트로 느슨하게 연결되며, 이벤트 발행을 통해 각자 독립적으로 변화에 반응한다. '알림 서비스'의 경우, PBC Matching Rule에 따라 'reservation-notification' PBC로 구현되는 Generic Domain으로 지정하였다. 이는 대출/예약 프로세스의 변화에 따라 알림이 필요하나, 차별화된 복잡도가 없으므로 외부 PBC를 적극 활용하였다. 각 컨텍스트는 응집된 역할과 적절한 독립성을 유지하며, Pub/Sub 패턴을 통해 결합도를 최소화하였다.",
                        "explanations": [
                            {
                                "sourceContext": "대출/예약 관리",
                                "targetContext": "도서 관리",
                                "relationType": "Pub/Sub",
                                "reason": "대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.",
                                "interactionPattern": "대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
                            },
                            {
                                "sourceContext": "대출/예약 관리",
                                "targetContext": "예약 & 알림 서비스",
                                "relationType": "Pub/Sub",
                                "reason": "대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.",
                                "interactionPattern": "대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                            }
                        ],
                        "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                        "currentGeneratedLength": 4250
                    }
                },
                "isStartMapping": false,
                "isGeneratingBoundedContext": false,
                "isSummarizeStarted": false,
                "isAnalizing": false,
                "processingRate": 100,
                "currentProcessingBoundedContext": "예약 & 알림 서비스",
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
                        "id": 18,
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
                        "id": 20,
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
                        "id": 21,
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
                        "id": 22,
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
                        "id": 23,
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
                        "id": 24,
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
                        "id": 25,
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
                        "id": 30,
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
                        "id": 34,
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
                        "id": 35,
                        "pbcPath": "https://github.com/msa-ez/pbc-testRepo/blob/main/openapi.yaml"
                    }
                ],
                "currentGeneratedLength": 0,
                "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
                "siteMap": [],
                "timestamp": "2025-08-07T04:39:31.857Z"
            },
            {
                "type": "aggregateDraftDialogDto",
                "uniqueId": "1754541637962",
                "isShow": true,
                "draftOptions": [
                    {
                        "boundedContext": "LibraryBookManagement",
                        "boundedContextAlias": "도서 관리",
                        "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.",
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
                                                "name": "ISBN",
                                                "alias": "ISBN",
                                                "referencedAggregateName": ""
                                            },
                                            {
                                                "name": "LoanReference",
                                                "alias": "대출 참조",
                                                "referencedAggregate": {
                                                    "name": "Loan",
                                                    "alias": "대출 건"
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
                                                "name": "BookStatusHistory",
                                                "alias": "도서 상태 변경 이력",
                                                "referencedAggregateName": ""
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
                                    }
                                ],
                                "pros": {
                                    "cohesion": "도서 정보, 상태, 폐기 및 모든 상태 이력이 하나의 Aggregate에 집중되어 도서 라이프사이클 불변식을 강력하게 보장한다.",
                                    "coupling": "Loan, Reservation Aggregate를 ValueObject로 참조함으로써 대출/예약 관리 컨텍스트와의 결합도를 낮춘다.",
                                    "consistency": "상태 변경, 폐기, 이력 기록 등 핵심 트랜잭션이 한 번에 원자적으로 처리된다.",
                                    "encapsulation": "도서의 전체 상태와 변경 내역을 한곳에서 관리하여, 도서 관리 규칙이 Aggregate 내부에 잘 은닉된다.",
                                    "complexity": "단일 Aggregate 접근으로 도서 및 이력에 대한 쿼리·갱신 논리가 단순해진다.",
                                    "independence": "도서 도메인 변경이 다른 Aggregate에 영향을 거의 주지 않는다.",
                                    "performance": "도서 상태 및 이력 질의 시 별도 조인이나 복잡한 연동 없이 빠르게 접근할 수 있다."
                                },
                                "cons": {
                                    "cohesion": "상태 이력 데이터가 많아질수록 Book Aggregate의 사이즈가 커져, 본질적으로 서로 다른 관심사(도서 관리, 이력 관리)가 혼재된다.",
                                    "coupling": "도서 변경 빈도가 높고 이력 기록이 많으면 Aggregate 락 경합이 발생할 수 있다.",
                                    "consistency": "이력 데이터가 커질수록 트랜잭션 처리 시간이 길어져 대량 처리 시 성능 저하 우려가 있다.",
                                    "encapsulation": "단일 Aggregate가 너무 많은 책임을 져서, 변경/확장 시 영향 범위가 커진다.",
                                    "complexity": "아주 다양한 도서 시나리오(상태, 이력, 폐기 등)가 복잡하게 얽혀 Aggregate가 비대해질 수 있다.",
                                    "independence": "이력 데이터 증가 시 도서 관리와 이력 관리의 독립적 확장·배포가 어렵다.",
                                    "performance": "이력 건수가 많을 때 도서 정보 단순 조회조차 무거워질 수 있다."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서 관리",
                                    "displayName": "도서 관리",
                                    "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ],
                                    "requirements": {
                                        "userStory": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                                        "ddl": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                                        "event": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}\n{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}",
                                        "eventNames": "BookRegistered, BookDisposed, BookStateChanged, BookHistoryRecorded 이벤트가 발생할 수 있어.",
                                        "ddlFields": [
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
                                    }
                                },
                                "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
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
                                            },
                                            {
                                                "name": "BookCategory",
                                                "alias": "도서 카테고리"
                                            }
                                        ],
                                        "valueObjects": [
                                            {
                                                "name": "ISBN",
                                                "alias": "ISBN",
                                                "referencedAggregateName": ""
                                            },
                                            {
                                                "name": "LoanReference",
                                                "alias": "대출 참조",
                                                "referencedAggregate": {
                                                    "name": "Loan",
                                                    "alias": "대출 건"
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
                                            "updated_at"
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
                                        ],
                                        "previewAttributes": [
                                            "history_id",
                                            "book_id",
                                            "previous_status",
                                            "new_status",
                                            "change_reason",
                                            "changed_by",
                                            "change_date"
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "Book은 도서 자체 속성과 핵심 상태만 관리하고, BookStatusHistory는 상태 변경 이력만 전담하여 관심사가 명확히 분리된다.",
                                    "coupling": "상태 이력 로딩/처리 부담이 Book Aggregate에 영향을 주지 않고, 두 Aggregate는 ValueObject로 단방향 연결되어 있다.",
                                    "consistency": "도서의 현재 상태는 Book에서 원자적으로 보장하고, 이력은 별도 트랜잭션으로 축적해 성능 저하를 방지한다.",
                                    "encapsulation": "각 Aggregate 내부 규칙이 분리되어 관리·확장이 용이하다.",
                                    "complexity": "대용량 이력 관리, 아카이빙, 조회 최적화 등에서 유연성이 높아진다.",
                                    "independence": "이력 저장소의 스케일 아웃/성능 확장이 독립적으로 가능하다.",
                                    "performance": "도서 기본 정보와 상태만 빠르게 질의할 수 있고, 이력 대량 조회나 적재는 별도의 시스템 자원으로 분산 처리 가능하다."
                                },
                                "cons": {
                                    "cohesion": "상태 변경과 이력 기록이 별도 트랜잭션에서 처리되어, 일시적으로 상태와 이력 간 불일치가 발생할 수 있다.",
                                    "coupling": "이력 데이터와 도서 정보를 함께 조회하려면 Aggregate 간 오케스트레이션이 필요하다.",
                                    "consistency": "이력 데이터와 실제 도서 상태가 항상 즉시 동기화된다는 보장을 시스템적으로 해야 한다.",
                                    "encapsulation": "상태 변경 이벤트와 이력 적재 간 타이밍/오류 관리 책임이 애플리케이션 서비스에 넘어간다.",
                                    "complexity": "상태 변경, 이력 기록, 동기화 로직이 복잡해져 개발·운영 난도가 증가한다.",
                                    "independence": "이력 데이터 적재 장애가 도서 상태 변경 처리에도 영향을 줄 수 있다.",
                                    "performance": "도서와 이력 동시 접근 빈도가 높으면 추가 네트워크/스토리지 연산이 발생할 수 있다."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서 관리",
                                    "displayName": "도서 관리",
                                    "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ],
                                    "requirements": {
                                        "userStory": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                                        "ddl": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                                        "event": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}\n{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}",
                                        "eventNames": "BookRegistered, BookDisposed, BookStateChanged, BookHistoryRecorded 이벤트가 발생할 수 있어.",
                                        "ddlFields": [
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
                                    }
                                },
                                "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
                            }
                        ],
                        "conclusions": "Option 1은 도서와 이력을 단일 트랜잭션 내에서 원자적으로 관리해야 하며, 이력 데이터가 적거나 도서 상태 변경 이벤트가 복잡하지 않은 소형/중형 도서관에 적합하다. Option 2는 이력 데이터가 폭증하거나 이력 분석, 별도 아카이빙 등 확장/유지보수가 중요한 환경에 최적이며, 고성능 분산 처리 및 유연한 도서 관리 시스템을 원할 때 추천된다.",
                        "defaultOptionIndex": 1,
                        "inference": "\n\n도서 등록, 상태 변경, 폐기, 이력 기록 등 도서의 라이프사이클과 상태 추적이 요구된다. 핵심 비즈니스 불변식(ISBN 중복 금지, 도서 상태/폐기 일관성, 이력 축적)을 보장하고, 대출/예약 관리 컨텍스트의 Loan, Reservation Aggregate는 참조 ValueObject로 처리해야 한다. 첫 번째 옵션은 Book Aggregate 하나에 모든 상태 이력, 폐기 정보를 통합해 트랜잭션 일관성을 극대화한다. 두 번째 옵션은 Book과 BookStatusHistory 두 개의 Aggregate로 분리해, 상태 이력 관리와 도서 관리를 명확히 분리한다."
                    },
                    {
                        "boundedContext": "LoanAndReservation",
                        "boundedContextAlias": "대출/예약 관리",
                        "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다.",
                        "options": [
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "LoanReservation",
                                            "alias": "대출·예약 통합 관리"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "LoanStatus",
                                                "alias": "대출 상태"
                                            },
                                            {
                                                "name": "ReservationStatus",
                                                "alias": "예약 상태"
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
                                            },
                                            {
                                                "name": "ReservationHistory",
                                                "alias": "예약 이력",
                                                "referencedAggregateName": ""
                                            },
                                            {
                                                "name": "LoanHistory",
                                                "alias": "대출 이력",
                                                "referencedAggregateName": ""
                                            }
                                        ],
                                        "previewAttributes": [
                                            "loan_id",
                                            "member_id",
                                            "book_id",
                                            "loan_date",
                                            "due_date",
                                            "return_date",
                                            "loan_period_days",
                                            "status",
                                            "extension_count",
                                            "created_at",
                                            "updated_at",
                                            "reservation_id",
                                            "reservation_date",
                                            "notification_sent",
                                            "expiry_date",
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
                                    }
                                ],
                                "pros": {
                                    "cohesion": "대출과 예약의 모든 정책과 상태 전이가 하나의 트랜잭션 경계 내에서 관리되어 도서 상태, 연장, 연체, 예약 흐름의 강한 결합 및 일관성 보장.",
                                    "coupling": "Loan과 Reservation 간 상호 참조 없이 내부 상태로만 관리되어 컨텍스트 내 결합도가 낮음.",
                                    "consistency": "도서의 대출/예약/반납/연체/상태변경 비즈니스 규칙이 한 번의 트랜잭션 내에서 원자적으로 처리됨.",
                                    "encapsulation": "예약과 대출 관련 업무 규칙이 통합되어 로직 중복 없이 관리 가능.",
                                    "complexity": "클라이언트 입장에서 업무 흐름을 하나의 객체에서 단순하게 파악 가능.",
                                    "independence": "도서 상태 변경과 같은 이벤트를 외부 Pub/Sub로 송출할 때 통합적으로 관리 가능.",
                                    "performance": "조회 시 대출/예약 정보를 한 번에 조회하므로 추가 조인 없이 신속하게 서비스 가능."
                                },
                                "cons": {
                                    "cohesion": "예약과 대출은 서로 다른 업무 주체와 생명주기를 가질 수 있는데, 통합 관리로 인해 업무 분리가 어렵다.",
                                    "coupling": "예약 정책 변경이 대출 전체 로직에 영향 줄 수 있어 유지보수가 어려움.",
                                    "consistency": "Aggregate가 커질수록 동시성 경합 및 트랜잭션 시간이 증가할 위험.",
                                    "encapsulation": "업무 담당 부서별로 관심사가 달라 일부 로직 수정 시 전체 객체 영향 범위가 넓음.",
                                    "complexity": "통합 Aggregate의 복잡성이 높아지고, 도메인 성장 시 유지관리 부담이 커짐.",
                                    "independence": "예약 또는 대출 정책만 개별적으로 개선하거나 확장할 때 제약이 생김.",
                                    "performance": "예약, 대출이 동시에 잦게 갱신될 경우 성능 저하 및 경합 가능성."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LoanAndReservation",
                                    "alias": "대출/예약 관리",
                                    "displayName": "대출/예약 관리",
                                    "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출 건"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        }
                                    ],
                                    "requirements": {
                                        "userStory": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.",
                                        "ddl": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
                                        "event": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}\n{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}",
                                        "eventNames": "LoanStarted, BookReserved, LoanReturned, LoanExtended, LoanOverdue 이벤트가 발생할 수 있어.",
                                        "ddlFields": [
                                            "loan_id",
                                            "member_id",
                                            "book_id",
                                            "loan_date",
                                            "due_date",
                                            "return_date",
                                            "loan_period_days",
                                            "status",
                                            "extension_count",
                                            "created_at",
                                            "updated_at",
                                            "reservation_id",
                                            "reservation_date",
                                            "notification_sent",
                                            "expiry_date",
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
                                    }
                                },
                                "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                            },
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "Loan",
                                            "alias": "대출 건"
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
                                            },
                                            {
                                                "name": "LoanHistory",
                                                "alias": "대출 이력",
                                                "referencedAggregateName": ""
                                            }
                                        ],
                                        "previewAttributes": [
                                            "loan_id",
                                            "member_id",
                                            "book_id",
                                            "loan_date",
                                            "due_date",
                                            "return_date",
                                            "loan_period_days",
                                            "status",
                                            "extension_count",
                                            "created_at",
                                            "updated_at",
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
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "ReservationStatus",
                                                "alias": "예약 상태"
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
                                            },
                                            {
                                                "name": "ReservationHistory",
                                                "alias": "예약 이력",
                                                "referencedAggregateName": ""
                                            }
                                        ],
                                        "previewAttributes": [
                                            "reservation_id",
                                            "member_id",
                                            "book_id",
                                            "reservation_date",
                                            "status",
                                            "notification_sent",
                                            "expiry_date",
                                            "created_at",
                                            "updated_at"
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "대출과 예약의 정책, 업무 흐름을 각자의 Aggregate에서 독립적으로 관리하여 관심사의 분리가 명확.",
                                    "coupling": "도서, 회원 참조 외에는 타 Aggregate와의 의존성이 없어 서비스의 모듈화와 확장이 용이.",
                                    "consistency": "각 Aggregate 내의 핵심 비즈니스 규칙(예: 대출→연체, 예약→예약완료 등)은 원자적 트랜잭션으로 처리 가능.",
                                    "encapsulation": "도서 상태변경, 알림 이벤트 발행 등 업무 경계 밖 기능을 ValueObject 및 이벤트로 분리해 도메인 규칙 은닉.",
                                    "complexity": "업무 복잡도 증가에도 구조가 단순하게 유지되어 유지보수 및 테스트가 쉬움.",
                                    "independence": "대출 정책 혹은 예약 정책이 바뀌더라도 상호 영향 없이 개발/배포 가능.",
                                    "performance": "예약, 대출이 빈번히 동시에 발생해도 별도의 Aggregate로 관리되어 경합 최소화."
                                },
                                "cons": {
                                    "cohesion": "대출과 예약이 연관된 복잡한 정책(예: 반납 시 예약자 우선 처리)이 있을 때 Cross-Aggregate 트랜잭션 관리 필요.",
                                    "coupling": "상태 변경 시 서로 이벤트 발행 및 외부 Pub/Sub로의 동기화 코드가 증가.",
                                    "consistency": "예약과 대출 간의 강한 일관성이 요구될 경우 eventual consistency 패턴 적용 필요.",
                                    "encapsulation": "업무 규칙이 양쪽 Aggregate에 분산될 수 있어 도메인 규칙 파악이 다소 분산될 수 있음.",
                                    "complexity": "업무 프로세스가 길어질 경우, orchestration이나 saga 패턴 등 별도의 프로세스 조정 필요.",
                                    "independence": "예약-대출 간 정책 변화가 잦을 때 연계 로직을 지속적으로 맞춰줘야 함.",
                                    "performance": "도서별 예약/대출 현황을 통합 조회 시 추가 조인 또는 데이터 집계 로직이 필요."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LoanAndReservation",
                                    "alias": "대출/예약 관리",
                                    "displayName": "대출/예약 관리",
                                    "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출 건"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        }
                                    ],
                                    "requirements": {
                                        "userStory": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.",
                                        "ddl": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
                                        "event": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}\n{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}",
                                        "eventNames": "LoanStarted, BookReserved, LoanReturned, LoanExtended, LoanOverdue 이벤트가 발생할 수 있어.",
                                        "ddlFields": [
                                            "loan_id",
                                            "member_id",
                                            "book_id",
                                            "loan_date",
                                            "due_date",
                                            "return_date",
                                            "loan_period_days",
                                            "status",
                                            "extension_count",
                                            "created_at",
                                            "updated_at",
                                            "reservation_id",
                                            "reservation_date",
                                            "notification_sent",
                                            "expiry_date",
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
                                    }
                                },
                                "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                            },
                            {
                                "structure": [
                                    {
                                        "aggregate": {
                                            "name": "Loan",
                                            "alias": "대출 건"
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
                                            },
                                            {
                                                "name": "LoanHistory",
                                                "alias": "대출 이력",
                                                "referencedAggregateName": ""
                                            }
                                        ],
                                        "previewAttributes": [
                                            "loan_id",
                                            "member_id",
                                            "book_id",
                                            "loan_date",
                                            "due_date",
                                            "return_date",
                                            "loan_period_days",
                                            "status",
                                            "extension_count",
                                            "created_at",
                                            "updated_at",
                                            "history_id",
                                            "action_type",
                                            "action_date",
                                            "previous_due_date",
                                            "new_due_date",
                                            "notes",
                                            "processed_by"
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "ReservationStatus",
                                                "alias": "예약 상태"
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
                                            },
                                            {
                                                "name": "ReservationHistory",
                                                "alias": "예약 이력",
                                                "referencedAggregateName": ""
                                            }
                                        ],
                                        "previewAttributes": [
                                            "reservation_id",
                                            "member_id",
                                            "book_id",
                                            "reservation_date",
                                            "notification_sent",
                                            "expiry_date",
                                            "status",
                                            "created_at",
                                            "updated_at"
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "OverdueRecord",
                                            "alias": "연체 관리"
                                        },
                                        "enumerations": [],
                                        "valueObjects": [
                                            {
                                                "name": "LoanReference",
                                                "alias": "대출 건 참조",
                                                "referencedAggregate": {
                                                    "name": "Loan",
                                                    "alias": "대출 건"
                                                }
                                            }
                                        ],
                                        "previewAttributes": [
                                            "overdue_id",
                                            "loan_id",
                                            "overdue_days",
                                            "fine_amount",
                                            "fine_paid",
                                            "notification_count",
                                            "last_notification_date",
                                            "created_at",
                                            "updated_at"
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "연체 관리까지 별도 Aggregate로 분리하여 각 업무별 트랜잭션 및 생명주기가 명확히 분리됨.",
                                    "coupling": "대출, 예약, 연체 관리가 각자의 업무 규칙에만 집중할 수 있어 향후 정책 변화에 신속히 대응 가능.",
                                    "consistency": "각 Aggregate 내 원자적 트랜잭션 처리로 복잡한 동시성 이슈 최소화.",
                                    "encapsulation": "연체 처리를 별도로 은닉하여 도메인별 책임 구분이 뚜렷.",
                                    "complexity": "도서관 운영 정책이 복잡해져도 업무별 코드 분리가 잘 되어 유지보수성 극대화.",
                                    "independence": "연체 정책, 대출/예약 정책을 각각 독립적으로 개정 및 배포 가능.",
                                    "performance": "연체 데이터, 대출/예약 데이터가 분리되어 빈번한 읽기/쓰기가 필요한 데이터만 독립적으로 최적화 가능."
                                },
                                "cons": {
                                    "cohesion": "예약/대출/연체 업무 흐름을 한 번에 관리해야 할 때 cross-aggregate orchestration이 불가피.",
                                    "coupling": "각 업무 흐름이 이벤트 기반으로만 연결되어 추가적인 동기화/검증 로직 필요.",
                                    "consistency": "예약, 대출, 연체 간 강한 일관성 유지에는 eventual consistency, 보상 트랜잭션 등 복잡한 패턴 적용 필요.",
                                    "encapsulation": "업무 규칙 파악 및 도메인 정책 변경 시 관련 Aggregate를 모두 점검해야 함.",
                                    "complexity": "업무 처리 플로우 전체를 파악하기 위해 여러 객체를 함께 이해해야 하므로 초기 진입장벽이 있음.",
                                    "independence": "예약-대출-연체가 긴밀하게 연결되는 정책 적용 시 독립성의 이점이 감소할 수 있음.",
                                    "performance": "예약, 대출, 연체의 통합 현황 집계 시 데이터 병합 비용 발생."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "LoanAndReservation",
                                    "alias": "대출/예약 관리",
                                    "displayName": "대출/예약 관리",
                                    "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출 건"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        }
                                    ],
                                    "requirements": {
                                        "userStory": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.",
                                        "ddl": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
                                        "event": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}\n{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}",
                                        "eventNames": "LoanStarted, BookReserved, LoanReturned, LoanExtended, LoanOverdue 이벤트가 발생할 수 있어.",
                                        "ddlFields": [
                                            "loan_id",
                                            "member_id",
                                            "book_id",
                                            "loan_date",
                                            "due_date",
                                            "return_date",
                                            "loan_period_days",
                                            "status",
                                            "extension_count",
                                            "created_at",
                                            "updated_at",
                                            "reservation_id",
                                            "reservation_date",
                                            "notification_sent",
                                            "expiry_date",
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
                                    }
                                },
                                "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                            }
                        ],
                        "conclusions": "옵션 1은 대출/예약/연체 업무가 소규모이고, 모든 정책의 일관성과 원자성이 절대적으로 중요한 소형 도서관에 적합합니다. 옵션 2는 대출과 예약 정책이 자주 변경되거나, 두 영역을 조직적으로 분리 관리하는 곳에 권장됩니다. 옵션 3은 연체 관리의 비즈니스 중요성이 높거나, 각 업무의 처리 주기·정책이 크게 달라질 가능성이 높은 공공/대형 도서관에서 장기적인 유연성과 유지보수성을 중시할 때 최적의 선택입니다.",
                        "defaultOptionIndex": 2,
                        "inference": "\n\n도메인 이벤트, 비즈니스 규칙, DDL 및 컨텍스트 관계 분석 결과, Loan과 Reservation은 필수 Aggregate로 정의되어야 하며, Book 및 BookStatusHistory는 기존 컨텍스트의 객체를 ValueObject 참조로 연결해야 한다. 첫 번째 옵션은 Loan/Reservation을 하나의 대규모 Aggregate에 통합하여 일관성과 원자성을 강조하고, 두 번째 옵션은 Loan과 Reservation을 별도 Aggregate로 분리하여 확장성과 유지보수성을 중시한다. 세 번째 옵션은 Loan, Reservation, OverdueRecord까지 분리하여 가장 세분화된 구조를 가진다."
                    }
                ],
                "draftUIInfos": {
                    "leftBoundedContextCount": 0,
                    "directMessage": "Assigning DDL fields to aggregates for option 3... (2434 characters generated)",
                    "progress": 67
                },
                "isGeneratorButtonEnabled": true,
                "boundedContextVersion": 1,
                "retryInputs": {
                    "initialInputs": [
                        {
                            "boundedContext": {
                                "name": "LibraryBookManagement",
                                "alias": "도서 관리",
                                "displayName": "도서 관리",
                                "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.",
                                "aggregates": [
                                    {
                                        "name": "Book",
                                        "alias": "도서"
                                    }
                                ],
                                "requirements": {
                                    "userStory": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                                    "ddl": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                                    "event": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}\n{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}",
                                    "eventNames": "BookRegistered, BookDisposed, BookStateChanged, BookHistoryRecorded 이벤트가 발생할 수 있어.",
                                    "ddlFields": [
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
                                }
                            },
                            "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
                        },
                        {
                            "boundedContext": {
                                "name": "LoanAndReservation",
                                "alias": "대출/예약 관리",
                                "displayName": "대출/예약 관리",
                                "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다.",
                                "aggregates": [
                                    {
                                        "name": "Loan",
                                        "alias": "대출 건"
                                    },
                                    {
                                        "name": "Reservation",
                                        "alias": "예약"
                                    }
                                ],
                                "requirements": {
                                    "userStory": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.",
                                    "ddl": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
                                    "event": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}\n{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}",
                                    "eventNames": "LoanStarted, BookReserved, LoanReturned, LoanExtended, LoanOverdue 이벤트가 발생할 수 있어.",
                                    "ddlFields": [
                                        "loan_id",
                                        "member_id",
                                        "book_id",
                                        "loan_date",
                                        "due_date",
                                        "return_date",
                                        "loan_period_days",
                                        "status",
                                        "extension_count",
                                        "created_at",
                                        "updated_at",
                                        "reservation_id",
                                        "reservation_date",
                                        "notification_sent",
                                        "expiry_date",
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
                                }
                            },
                            "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
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
                        "LoanAndReservation": [
                            {
                                "aggregate": {
                                    "name": "Loan",
                                    "alias": "대출 건"
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
                                        "name": "ISBN",
                                        "alias": "ISBN",
                                        "referencedAggregateName": ""
                                    },
                                    {
                                        "name": "LoanReference",
                                        "alias": "대출 참조",
                                        "referencedAggregate": {
                                            "name": "Loan",
                                            "alias": "대출 건"
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
                                        "name": "BookStatusHistory",
                                        "alias": "도서 상태 변경 이력",
                                        "referencedAggregateName": ""
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
                            }
                        ],
                        "pros": {
                            "cohesion": "도서 정보, 상태, 폐기 및 모든 상태 이력이 하나의 Aggregate에 집중되어 도서 라이프사이클 불변식을 강력하게 보장한다.",
                            "coupling": "Loan, Reservation Aggregate를 ValueObject로 참조함으로써 대출/예약 관리 컨텍스트와의 결합도를 낮춘다.",
                            "consistency": "상태 변경, 폐기, 이력 기록 등 핵심 트랜잭션이 한 번에 원자적으로 처리된다.",
                            "encapsulation": "도서의 전체 상태와 변경 내역을 한곳에서 관리하여, 도서 관리 규칙이 Aggregate 내부에 잘 은닉된다.",
                            "complexity": "단일 Aggregate 접근으로 도서 및 이력에 대한 쿼리·갱신 논리가 단순해진다.",
                            "independence": "도서 도메인 변경이 다른 Aggregate에 영향을 거의 주지 않는다.",
                            "performance": "도서 상태 및 이력 질의 시 별도 조인이나 복잡한 연동 없이 빠르게 접근할 수 있다."
                        },
                        "cons": {
                            "cohesion": "상태 이력 데이터가 많아질수록 Book Aggregate의 사이즈가 커져, 본질적으로 서로 다른 관심사(도서 관리, 이력 관리)가 혼재된다.",
                            "coupling": "도서 변경 빈도가 높고 이력 기록이 많으면 Aggregate 락 경합이 발생할 수 있다.",
                            "consistency": "이력 데이터가 커질수록 트랜잭션 처리 시간이 길어져 대량 처리 시 성능 저하 우려가 있다.",
                            "encapsulation": "단일 Aggregate가 너무 많은 책임을 져서, 변경/확장 시 영향 범위가 커진다.",
                            "complexity": "아주 다양한 도서 시나리오(상태, 이력, 폐기 등)가 복잡하게 얽혀 Aggregate가 비대해질 수 있다.",
                            "independence": "이력 데이터 증가 시 도서 관리와 이력 관리의 독립적 확장·배포가 어렵다.",
                            "performance": "이력 건수가 많을 때 도서 정보 단순 조회조차 무거워질 수 있다."
                        },
                        "isAIRecommended": false,
                        "boundedContext": {
                            "name": "LibraryBookManagement",
                            "alias": "도서 관리",
                            "displayName": "도서 관리",
                            "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.",
                            "aggregates": [
                                {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            ],
                            "requirements": {
                                "userStory": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                                "ddl": "-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
                                "event": "{\"name\":\"BookRegistered\",\"displayName\":\"도서 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\"inputs\":[\"도서명\",\"ISBN\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 아님\"],\"outputs\":[\"신규 도서 정보\",\"'대출가능' 상태\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"BookStateChanged\",\"displayName\":\"도서 상태 변경됨\",\"actor\":\"System\",\"level\":2,\"description\":\"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\"inputs\":[\"도서\",\"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"],\"outputs\":[\"변경된 도서 상태\"],\"nextEvents\":[\"BookDisposed\",\"LoanStarted\",\"BookReserved\",\"LoanReturned\"]}\n{\"name\":\"BookDisposed\",\"displayName\":\"도서 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\"inputs\":[\"도서\",\"폐기 사유(훼손, 분실)\"],\"outputs\":[\"도서 상태: '폐기'\"],\"nextEvents\":[]}\n{\"name\":\"BookHistoryRecorded\",\"displayName\":\"도서 이력 기록됨\",\"actor\":\"System\",\"level\":9,\"description\":\"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\"inputs\":[\"도서\",\"상태 변화, 대출/반납/예약/폐기 이벤트\"],\"outputs\":[\"이력 데이터 축적\"],\"nextEvents\":[]}",
                                "eventNames": "BookRegistered, BookDisposed, BookStateChanged, BookHistoryRecorded 이벤트가 발생할 수 있어.",
                                "ddlFields": [
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
                            }
                        },
                        "description": "# Bounded Context Overview: LibraryBookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 정보 수정, 도서 폐기, 도서 상태 관리 및 상태 변경 이력 기록을 담당한다. ISBN 중복 검증, 카테고리 관리, 폐기 상태 처리 등 도서에 대한 라이프사이클과 상태 추적을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDisposed\n- BookStateChanged\n- BookHistoryRecorded\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 도서 정보를 입력하여 신규 도서를 등록함. ISBN은 13자리로, 중복이 없어야 함. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 아님\"\n  ],\n  \"outputs\": [\n    \"신규 도서 정보\",\n    \"'대출가능' 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서의 상태가 자동 또는 수동으로 변경됨. 상태는 대출가능/대출중/예약중/폐기 등으로 변할 수 있음.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변경 조건(대출, 반납, 예약, 폐기 등)\"\n  ],\n  \"outputs\": [\n    \"변경된 도서 상태\"\n  ],\n  \"nextEvents\": [\n    \"BookDisposed\",\n    \"LoanStarted\",\n    \"BookReserved\",\n    \"LoanReturned\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDisposed\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 분실 또는 훼손으로 폐기 처리됨. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유(훼손, 분실)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryRecorded\",\n  \"displayName\": \"도서 이력 기록됨\",\n  \"actor\": \"System\",\n  \"level\": 9,\n  \"description\": \"도서의 모든 상태 변화, 대출/반납/예약/폐기 등의 이력을 기록함.\",\n  \"inputs\": [\n    \"도서\",\n    \"상태 변화, 대출/반납/예약/폐기 이벤트\"\n  ],\n  \"outputs\": [\n    \"이력 데이터 축적\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/예약 관리 (LoanAndReservation)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다."
                    },
                    "LoanAndReservation": {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Loan",
                                    "alias": "대출 건"
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
                                    },
                                    {
                                        "name": "LoanHistory",
                                        "alias": "대출 이력",
                                        "referencedAggregateName": ""
                                    }
                                ],
                                "previewAttributes": [
                                    "loan_id",
                                    "member_id",
                                    "book_id",
                                    "loan_date",
                                    "due_date",
                                    "return_date",
                                    "loan_period_days",
                                    "status",
                                    "extension_count",
                                    "created_at",
                                    "updated_at",
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
                                    "name": "Reservation",
                                    "alias": "예약"
                                },
                                "enumerations": [
                                    {
                                        "name": "ReservationStatus",
                                        "alias": "예약 상태"
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
                                    },
                                    {
                                        "name": "ReservationHistory",
                                        "alias": "예약 이력",
                                        "referencedAggregateName": ""
                                    }
                                ],
                                "previewAttributes": [
                                    "reservation_id",
                                    "member_id",
                                    "book_id",
                                    "reservation_date",
                                    "status",
                                    "notification_sent",
                                    "expiry_date",
                                    "created_at",
                                    "updated_at"
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "대출과 예약의 정책, 업무 흐름을 각자의 Aggregate에서 독립적으로 관리하여 관심사의 분리가 명확.",
                            "coupling": "도서, 회원 참조 외에는 타 Aggregate와의 의존성이 없어 서비스의 모듈화와 확장이 용이.",
                            "consistency": "각 Aggregate 내의 핵심 비즈니스 규칙(예: 대출→연체, 예약→예약완료 등)은 원자적 트랜잭션으로 처리 가능.",
                            "encapsulation": "도서 상태변경, 알림 이벤트 발행 등 업무 경계 밖 기능을 ValueObject 및 이벤트로 분리해 도메인 규칙 은닉.",
                            "complexity": "업무 복잡도 증가에도 구조가 단순하게 유지되어 유지보수 및 테스트가 쉬움.",
                            "independence": "대출 정책 혹은 예약 정책이 바뀌더라도 상호 영향 없이 개발/배포 가능.",
                            "performance": "예약, 대출이 빈번히 동시에 발생해도 별도의 Aggregate로 관리되어 경합 최소화."
                        },
                        "cons": {
                            "cohesion": "대출과 예약이 연관된 복잡한 정책(예: 반납 시 예약자 우선 처리)이 있을 때 Cross-Aggregate 트랜잭션 관리 필요.",
                            "coupling": "상태 변경 시 서로 이벤트 발행 및 외부 Pub/Sub로의 동기화 코드가 증가.",
                            "consistency": "예약과 대출 간의 강한 일관성이 요구될 경우 eventual consistency 패턴 적용 필요.",
                            "encapsulation": "업무 규칙이 양쪽 Aggregate에 분산될 수 있어 도메인 규칙 파악이 다소 분산될 수 있음.",
                            "complexity": "업무 프로세스가 길어질 경우, orchestration이나 saga 패턴 등 별도의 프로세스 조정 필요.",
                            "independence": "예약-대출 간 정책 변화가 잦을 때 연계 로직을 지속적으로 맞춰줘야 함.",
                            "performance": "도서별 예약/대출 현황을 통합 조회 시 추가 조인 또는 데이터 집계 로직이 필요."
                        },
                        "isAIRecommended": false,
                        "boundedContext": {
                            "name": "LoanAndReservation",
                            "alias": "대출/예약 관리",
                            "displayName": "대출/예약 관리",
                            "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다.",
                            "aggregates": [
                                {
                                    "name": "Loan",
                                    "alias": "대출 건"
                                },
                                {
                                    "name": "Reservation",
                                    "alias": "예약"
                                }
                            ],
                            "requirements": {
                                "userStory": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.",
                                "ddl": "-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);",
                                "event": "{\"name\":\"LoanStarted\",\"displayName\":\"도서 대출 시작됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서\",\"도서 상태: '대출가능'\",\"대출 기간(7/14/30일)\"],\"outputs\":[\"대출 건 생성\",\"도서 상태: '대출중'\",\"대출일/반납예정일\"],\"nextEvents\":[\"BookStateChanged\",\"LoanExtended\",\"LoanReturned\",\"LoanOverdue\"]}\n{\"name\":\"BookReserved\",\"displayName\":\"도서 예약됨\",\"actor\":\"Member\",\"level\":5,\"description\":\"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서 상태: '대출중'\"],\"outputs\":[\"예약 정보 생성\",\"도서 상태: '예약중'\"],\"nextEvents\":[\"BookStateChanged\",\"LoanStarted\"]}\n{\"name\":\"LoanReturned\",\"displayName\":\"도서 반납됨\",\"actor\":\"Member\",\"level\":6,\"description\":\"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\"inputs\":[\"회원\",\"도서\",\"대출 건\"],\"outputs\":[\"반납일 기록\",\"도서 상태: '대출가능' 또는 '예약중'\"],\"nextEvents\":[\"BookStateChanged\"]}\n{\"name\":\"LoanExtended\",\"displayName\":\"대출 연장됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\"inputs\":[\"회원\",\"대출 건\",\"연장 요청\"],\"outputs\":[\"반납 예정일 갱신\"],\"nextEvents\":[]}\n{\"name\":\"LoanOverdue\",\"displayName\":\"대출 연체 발생됨\",\"actor\":\"System\",\"level\":8,\"description\":\"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"대출 건\",\"반납 예정일 경과\"],\"outputs\":[\"대출 상태: '연체'\"],\"nextEvents\":[]}",
                                "eventNames": "LoanStarted, BookReserved, LoanReturned, LoanExtended, LoanOverdue 이벤트가 발생할 수 있어.",
                                "ddlFields": [
                                    "loan_id",
                                    "member_id",
                                    "book_id",
                                    "loan_date",
                                    "due_date",
                                    "return_date",
                                    "loan_period_days",
                                    "status",
                                    "extension_count",
                                    "created_at",
                                    "updated_at",
                                    "reservation_id",
                                    "reservation_date",
                                    "notification_sent",
                                    "expiry_date",
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
                            }
                        },
                        "description": "# Bounded Context Overview: LoanAndReservation (대출/예약 관리)\n\n## Role\n회원의 도서 대출, 반납, 예약, 대출 연장 및 연체 관리 등 대출과 예약 전반의 비즈니스 로직을 담당한다. 대출/반납 시 도서 상태 변경을 트리거하며, 예약 대기 및 연장 관련 정책을 구현한다.\n\n## Key Events\n- LoanStarted\n- BookReserved\n- LoanReturned\n- LoanExtended\n- LoanOverdue\n\n# Requirements\n\n## userStory\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanStarted\",\n  \"displayName\": \"도서 대출 시작됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서 대출을 신청하고, 조건이 맞으면 대출이 시작됨. 도서 상태는 '대출중'으로 변경.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서\",\n    \"도서 상태: '대출가능'\",\n    \"대출 기간(7/14/30일)\"\n  ],\n  \"outputs\": [\n    \"대출 건 생성\",\n    \"도서 상태: '대출중'\",\n    \"대출일/반납예정일\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanExtended\",\n    \"LoanReturned\",\n    \"LoanOverdue\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookReserved\",\n  \"displayName\": \"도서 예약됨\",\n  \"actor\": \"Member\",\n  \"level\": 5,\n  \"description\": \"회원이 대출 중인 도서에 대해 예약을 신청함. 예약 시 도서 상태가 '예약중'으로 전환됨.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서 상태: '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 정보 생성\",\n    \"도서 상태: '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\",\n    \"LoanStarted\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanReturned\",\n  \"displayName\": \"도서 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 6,\n  \"description\": \"회원이 대출 도서를 반납함. 예약자가 있을 경우 '예약중', 없으면 '대출가능'으로 상태 전환.\",\n  \"inputs\": [\n    \"회원\",\n    \"도서\",\n    \"대출 건\"\n  ],\n  \"outputs\": [\n    \"반납일 기록\",\n    \"도서 상태: '대출가능' 또는 '예약중'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"대출 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"회원이 대출 기간 연장을 요청하고 승인됨. 반납 예정일이 연장됨.\",\n  \"inputs\": [\n    \"회원\",\n    \"대출 건\",\n    \"연장 요청\"\n  ],\n  \"outputs\": [\n    \"반납 예정일 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanOverdue\",\n  \"displayName\": \"대출 연체 발생됨\",\n  \"actor\": \"System\",\n  \"level\": 8,\n  \"description\": \"반납 예정일이 지났지만 도서가 반납되지 않은 경우, 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"대출 건\",\n    \"반납 예정일 경과\"\n  ],\n  \"outputs\": [\n    \"대출 상태: '연체'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### 도서 상태 변경 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서 관리 (LibraryBookManagement)\n- **Reason**: 대출, 반납, 예약, 연체 등 도서의 상태 변화가 발생할 때마다 도서 관리 컨텍스트에 변경 이벤트를 전달해 도서 상태 및 이력을 갱신한다. 두 컨텍스트의 결합도를 낮추고, 상태 동기화를 위해 Pub/Sub를 사용했다.\n- **Interaction Pattern**: 대출/예약 관리에서 도서 상태 변화 이벤트를 발행하고, 도서 관리가 이를 구독해 상태를 갱신하며 이력을 기록한다.\n\n### 알림 서비스 Pub/Sub\n- **Type**: Pub/Sub\n- **Direction**: sends to 예약 & 알림 서비스 (reservation-notification)\n- **Reason**: 대출/예약 등 주요 이벤트 발생 시 회원에게 알림을 전송해야 한다. 알림 서비스는 PBC로 구현되며, 업무 핵심과는 분리된 Generic Domain이다.\n- **Interaction Pattern**: 대출/예약 관리에서 이벤트를 발행하고, 예약 & 알림 서비스가 이를 구독해 알림 메시지를 발송한다."
                    }
                }
            }
        ],
        "frontEndResults": [],
        "pbcResults": [
            {
                "name": "reservation-notification",
                "alias": "예약 & 알림 서비스",
                "importance": "Generic Domain",
                "complexity": 0.4,
                "differentiation": 0.2,
                "implementationStrategy": "PBC: reservation-notification",
                "aggregates": [
                    {
                        "name": "Notification",
                        "alias": "알림"
                    }
                ],
                "events": [],
                "requirements": [
                    {
                        "type": "DDL",
                        "text": "-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);"
                    },
                    {
                        "type": "DDL",
                        "text": "-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);"
                    },
                    {
                        "type": "DDL",
                        "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                    }
                ],
                "role": "예약 관련 알림 발송, 대출/반납/예약 상태 변경에 따른 알림 처리를 담당한다. 시스템 외부와의 통합을 통한 일반적 알림 서비스를 제공한다."
            }
        ],
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
                "id": 18,
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
                "id": 20,
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
                "id": 21,
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
                "id": 22,
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
                "id": 23,
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
                "id": 24,
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
                "id": 25,
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
                "id": 30,
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
                "id": 34,
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
                "id": 35,
                "pbcPath": "https://github.com/msa-ez/pbc-testRepo/blob/main/openapi.yaml"
            }
        ]
    }
}