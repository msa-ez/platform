export const aggregateDraftScenarios = {
    "libraryApplication": {
        "selectedStructureOption": {
            "boundedContexts": [
                {
                    "name": "LibraryCirculation",
                    "alias": "도서관 대출/반납 관리",
                    "importance": "Core Domain",
                    "complexity": "0.8",
                    "differentiation": "0.9",
                    "implementationStrategy": "Rich Domain Model",
                    "aggregates": [
                        {
                            "name": "Loan",
                            "alias": "대출"
                        },
                        {
                            "name": "Reservation",
                            "alias": "예약"
                        },
                        {
                            "name": "LoanHistory",
                            "alias": "대출 이력"
                        }
                    ],
                    "events": [
                        "LoanRequested",
                        "LoanApproved",
                        "LoanRejectedDueToBookNotAvailable",
                        "ReservationRequested",
                        "ReservationApproved",
                        "BookReturned",
                        "BookStateChangedAfterReturn",
                        "LoanExtended",
                        "LoanExtensionRejected",
                        "BookOverdue",
                        "BookHistoryViewed"
                    ],
                    "requirements": [
                        {
                            "type": "userStory",
                            "text": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해."
                        },
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
                            "text": "{\"name\":\"LoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서명 또는 ISBN\",\"대출 기간(7/14/30일)\",\"도서 상태 '대출가능'\"],\"outputs\":[\"대출 신청 정보 생성\"],\"nextEvents\":[\"LoanApproved\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"Librarian\",\"level\":5,\"description\":\"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\"inputs\":[\"대출 신청 정보\",\"도서 상태 '대출가능'\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태 '대출중' 변경\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanRejectedDueToBookNotAvailable\",\"displayName\":\"도서가 대출불가로 대출 거절됨\",\"actor\":\"Librarian\",\"level\":6,\"description\":\"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\"inputs\":[\"대출 신청 정보\",\"도서 상태 '대출중' 또는 '폐기'\"],\"outputs\":[\"대출 거절 메시지\"],\"nextEvents\":[\"ReservationRequested\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"ReservationRequested\",\"displayName\":\"도서 예약이 신청됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\"inputs\":[\"회원번호\",\"도서 식별자\",\"도서 상태 '대출중'\"],\"outputs\":[\"예약 신청 정보 생성\"],\"nextEvents\":[\"ReservationApproved\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"ReservationApproved\",\"displayName\":\"도서 예약이 승인됨\",\"actor\":\"Librarian\",\"level\":8,\"description\":\"예약 신청을 확인하고 예약을 승인함.\",\"inputs\":[\"예약 신청 정보\"],\"outputs\":[\"예약 기록 생성\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":9,\"description\":\"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\"inputs\":[\"대출 정보\",\"도서 식별자\"],\"outputs\":[\"반납 기록 생성\",\"대출 상태 '반납완료'\"],\"nextEvents\":[\"BookStateChangedAfterReturn\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookStateChangedAfterReturn\",\"displayName\":\"반납 후 도서 상태가 변경됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\"inputs\":[\"도서 식별자\",\"예약 대기자 존재 여부\"],\"outputs\":[\"도서 상태 '예약중' 또는 '대출가능' 변경\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanExtended\",\"displayName\":\"도서 대출이 연장됨\",\"actor\":\"Member\",\"level\":11,\"description\":\"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\"inputs\":[\"대출 정보\",\"연장 신청\",\"연장 가능 조건\"],\"outputs\":[\"대출 기간 연장\",\"대출 기록 갱신\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"LoanExtensionRejected\",\"displayName\":\"대출 연장이 거절됨\",\"actor\":\"Librarian\",\"level\":12,\"description\":\"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\"inputs\":[\"대출 정보\",\"연장 신청\",\"연장 불가 사유\"],\"outputs\":[\"연장 거절 메시지\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"System\",\"level\":13,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일\",\"반납 기록 미존재\"],\"outputs\":[\"대출 상태 '연체' 변경\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookHistoryViewed\",\"displayName\":\"도서 이력이 조회됨\",\"actor\":\"Librarian\",\"level\":14,\"description\":\"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\",\"상태 변경 이력\"],\"nextEvents\":[]}"
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
                            "text": "-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);"
                        },
                        {
                            "type": "DDL",
                            "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                        }
                    ],
                    "role": "회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다."
                },
                {
                    "name": "LibraryBookManagement",
                    "alias": "도서관리",
                    "importance": "Core Domain",
                    "complexity": "0.6",
                    "differentiation": "0.7",
                    "implementationStrategy": "Rich Domain Model",
                    "aggregates": [
                        {
                            "name": "Book",
                            "alias": "도서"
                        }
                    ],
                    "events": [
                        "BookRegistered",
                        "BookRegistrationFailedDueToDuplicateISBN",
                        "BookDiscarded",
                        "BookStateChangedAfterReturn"
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
                            "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 없음\"],\"outputs\":[\"새로운 도서 엔티티 생성\",\"도서 상태 '대출가능' 설정\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookRegistrationFailedDueToDuplicateISBN\",\"displayName\":\"ISBN 중복으로 도서 등록 실패됨\",\"actor\":\"Librarian\",\"level\":2,\"description\":\"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\"inputs\":[\"입력된 ISBN\",\"기존 도서의 ISBN\"],\"outputs\":[\"등록 실패 메시지\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\"inputs\":[\"폐기 사유\",\"도서 식별자\",\"도서 상태 != '폐기'\"],\"outputs\":[\"도서 상태 '폐기'로 변경\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":9,\"description\":\"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\"inputs\":[\"대출 정보\",\"도서 식별자\"],\"outputs\":[\"반납 기록 생성\",\"대출 상태 '반납완료'\"],\"nextEvents\":[\"BookStateChangedAfterReturn\"]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookStateChangedAfterReturn\",\"displayName\":\"반납 후 도서 상태가 변경됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\"inputs\":[\"도서 식별자\",\"예약 대기자 존재 여부\"],\"outputs\":[\"도서 상태 '예약중' 또는 '대출가능' 변경\"],\"nextEvents\":[]}"
                        },
                        {
                            "type": "Event",
                            "text": "{\"name\":\"BookHistoryViewed\",\"displayName\":\"도서 이력이 조회됨\",\"actor\":\"Librarian\",\"level\":14,\"description\":\"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\",\"상태 변경 이력\"],\"nextEvents\":[]}"
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
                    "role": "신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다."
                }
            ],
            "relations": [
                {
                    "name": "BookStatusEventPubSub",
                    "type": "Pub/Sub",
                    "upStream": {
                        "name": "LibraryBookManagement",
                        "alias": "도서관리"
                    },
                    "downStream": {
                        "name": "LibraryCirculation",
                        "alias": "도서관 대출/반납 관리"
                    }
                },
                {
                    "name": "LoanStatusEventPubSub",
                    "type": "Pub/Sub",
                    "upStream": {
                        "name": "LibraryCirculation",
                        "alias": "도서관 대출/반납 관리"
                    },
                    "downStream": {
                        "name": "LibraryBookManagement",
                        "alias": "도서관리"
                    }
                }
            ],
            "thoughts": "이번 분리에서는 도메인 복잡도와 프로세스(value stream) 관점 모두를 고려하였다. 도서의 등록, 정보 관리, 상태 전이 등 도서 자체의 라이프사이클과 관련된 요구는 도서관리(도서 라이프사이클)로 고유하게 분리하여 LibraryBookManagement로 구성하였다. 반면, 대출/반납/예약/연장 등 도서가 실제로 이용되는 비즈니스 프로세스는 LibraryCirculation(도서관 대출/반납 관리)로 집중시켰다. 이는 사용자(회원/사서) 행동 및 비즈니스 가치의 흐름(프로세스)에 기반해 분리한 것이다. 두 컨텍스트는 도서 상태 변화와 대출/예약 이벤트를 주고받으면서 느슨하게 연결되어 있으며, Pub/Sub 이벤트 방식으로 결합도를 최소화하였다. PBC 매칭 규칙을 우선 검토했으나, 주어진 PBC 리스트에는 도서관리나 대출 프로세스와 일치하는 PBC가 존재하지 않아 별도 Core Domain으로 정의했다.",
            "explanations": [
                {
                    "sourceContext": "도서관리",
                    "targetContext": "도서관 대출/반납 관리",
                    "relationType": "Pub/Sub",
                    "reason": "도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.",
                    "interactionPattern": "도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                },
                {
                    "sourceContext": "도서관 대출/반납 관리",
                    "targetContext": "도서관리",
                    "relationType": "Pub/Sub",
                    "reason": "대출/예약/반납/연체 등 유통 이벤트가 도서 상태 전이에 영향을 미치므로, 도서관리 컨텍스트가 관련 이벤트를 구독하여 상태를 변경함.",
                    "interactionPattern": "대출/예약/반납/연체 등 도서 상태에 영향을 주는 이벤트가 발생할 때마다 도서관리 컨텍스트가 해당 이벤트를 구독·적용함."
                }
            ],
            "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
            "currentGeneratedLength": 4023
        },
        "resultDevideBoundedContext": {
            "도메인 복잡도 분리+프로세스(value stream) 기반 분리": {
                "boundedContexts": [
                    {
                        "name": "LibraryCirculation",
                        "alias": "도서관 대출/반납 관리",
                        "importance": "Core Domain",
                        "complexity": "0.8",
                        "differentiation": "0.9",
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Loan",
                                "alias": "대출"
                            },
                            {
                                "name": "Reservation",
                                "alias": "예약"
                            },
                            {
                                "name": "LoanHistory",
                                "alias": "대출 이력"
                            }
                        ],
                        "events": [
                            "LoanRequested",
                            "LoanApproved",
                            "LoanRejectedDueToBookNotAvailable",
                            "ReservationRequested",
                            "ReservationApproved",
                            "BookReturned",
                            "BookStateChangedAfterReturn",
                            "LoanExtended",
                            "LoanExtensionRejected",
                            "BookOverdue",
                            "BookHistoryViewed"
                        ],
                        "requirements": [
                            {
                                "type": "userStory",
                                "text": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해."
                            },
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
                                "text": "{\"name\":\"LoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서명 또는 ISBN\",\"대출 기간(7/14/30일)\",\"도서 상태 '대출가능'\"],\"outputs\":[\"대출 신청 정보 생성\"],\"nextEvents\":[\"LoanApproved\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"Librarian\",\"level\":5,\"description\":\"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\"inputs\":[\"대출 신청 정보\",\"도서 상태 '대출가능'\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태 '대출중' 변경\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanRejectedDueToBookNotAvailable\",\"displayName\":\"도서가 대출불가로 대출 거절됨\",\"actor\":\"Librarian\",\"level\":6,\"description\":\"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\"inputs\":[\"대출 신청 정보\",\"도서 상태 '대출중' 또는 '폐기'\"],\"outputs\":[\"대출 거절 메시지\"],\"nextEvents\":[\"ReservationRequested\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"ReservationRequested\",\"displayName\":\"도서 예약이 신청됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\"inputs\":[\"회원번호\",\"도서 식별자\",\"도서 상태 '대출중'\"],\"outputs\":[\"예약 신청 정보 생성\"],\"nextEvents\":[\"ReservationApproved\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"ReservationApproved\",\"displayName\":\"도서 예약이 승인됨\",\"actor\":\"Librarian\",\"level\":8,\"description\":\"예약 신청을 확인하고 예약을 승인함.\",\"inputs\":[\"예약 신청 정보\"],\"outputs\":[\"예약 기록 생성\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":9,\"description\":\"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\"inputs\":[\"대출 정보\",\"도서 식별자\"],\"outputs\":[\"반납 기록 생성\",\"대출 상태 '반납완료'\"],\"nextEvents\":[\"BookStateChangedAfterReturn\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookStateChangedAfterReturn\",\"displayName\":\"반납 후 도서 상태가 변경됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\"inputs\":[\"도서 식별자\",\"예약 대기자 존재 여부\"],\"outputs\":[\"도서 상태 '예약중' 또는 '대출가능' 변경\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanExtended\",\"displayName\":\"도서 대출이 연장됨\",\"actor\":\"Member\",\"level\":11,\"description\":\"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\"inputs\":[\"대출 정보\",\"연장 신청\",\"연장 가능 조건\"],\"outputs\":[\"대출 기간 연장\",\"대출 기록 갱신\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"LoanExtensionRejected\",\"displayName\":\"대출 연장이 거절됨\",\"actor\":\"Librarian\",\"level\":12,\"description\":\"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\"inputs\":[\"대출 정보\",\"연장 신청\",\"연장 불가 사유\"],\"outputs\":[\"연장 거절 메시지\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"System\",\"level\":13,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일\",\"반납 기록 미존재\"],\"outputs\":[\"대출 상태 '연체' 변경\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookHistoryViewed\",\"displayName\":\"도서 이력이 조회됨\",\"actor\":\"Librarian\",\"level\":14,\"description\":\"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\",\"상태 변경 이력\"],\"nextEvents\":[]}"
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
                                "text": "-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);"
                            },
                            {
                                "type": "DDL",
                                "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                            }
                        ],
                        "role": "회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다."
                    },
                    {
                        "name": "LibraryBookManagement",
                        "alias": "도서관리",
                        "importance": "Core Domain",
                        "complexity": "0.6",
                        "differentiation": "0.7",
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Book",
                                "alias": "도서"
                            }
                        ],
                        "events": [
                            "BookRegistered",
                            "BookRegistrationFailedDueToDuplicateISBN",
                            "BookDiscarded",
                            "BookStateChangedAfterReturn"
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
                                "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 없음\"],\"outputs\":[\"새로운 도서 엔티티 생성\",\"도서 상태 '대출가능' 설정\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookRegistrationFailedDueToDuplicateISBN\",\"displayName\":\"ISBN 중복으로 도서 등록 실패됨\",\"actor\":\"Librarian\",\"level\":2,\"description\":\"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\"inputs\":[\"입력된 ISBN\",\"기존 도서의 ISBN\"],\"outputs\":[\"등록 실패 메시지\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\"inputs\":[\"폐기 사유\",\"도서 식별자\",\"도서 상태 != '폐기'\"],\"outputs\":[\"도서 상태 '폐기'로 변경\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":9,\"description\":\"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\"inputs\":[\"대출 정보\",\"도서 식별자\"],\"outputs\":[\"반납 기록 생성\",\"대출 상태 '반납완료'\"],\"nextEvents\":[\"BookStateChangedAfterReturn\"]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookStateChangedAfterReturn\",\"displayName\":\"반납 후 도서 상태가 변경됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\"inputs\":[\"도서 식별자\",\"예약 대기자 존재 여부\"],\"outputs\":[\"도서 상태 '예약중' 또는 '대출가능' 변경\"],\"nextEvents\":[]}"
                            },
                            {
                                "type": "Event",
                                "text": "{\"name\":\"BookHistoryViewed\",\"displayName\":\"도서 이력이 조회됨\",\"actor\":\"Librarian\",\"level\":14,\"description\":\"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\",\"상태 변경 이력\"],\"nextEvents\":[]}"
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
                        "role": "신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다."
                    }
                ],
                "relations": [
                    {
                        "name": "BookStatusEventPubSub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LibraryBookManagement",
                            "alias": "도서관리"
                        },
                        "downStream": {
                            "name": "LibraryCirculation",
                            "alias": "도서관 대출/반납 관리"
                        }
                    },
                    {
                        "name": "LoanStatusEventPubSub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LibraryCirculation",
                            "alias": "도서관 대출/반납 관리"
                        },
                        "downStream": {
                            "name": "LibraryBookManagement",
                            "alias": "도서관리"
                        }
                    }
                ],
                "thoughts": "이번 분리에서는 도메인 복잡도와 프로세스(value stream) 관점 모두를 고려하였다. 도서의 등록, 정보 관리, 상태 전이 등 도서 자체의 라이프사이클과 관련된 요구는 도서관리(도서 라이프사이클)로 고유하게 분리하여 LibraryBookManagement로 구성하였다. 반면, 대출/반납/예약/연장 등 도서가 실제로 이용되는 비즈니스 프로세스는 LibraryCirculation(도서관 대출/반납 관리)로 집중시켰다. 이는 사용자(회원/사서) 행동 및 비즈니스 가치의 흐름(프로세스)에 기반해 분리한 것이다. 두 컨텍스트는 도서 상태 변화와 대출/예약 이벤트를 주고받으면서 느슨하게 연결되어 있으며, Pub/Sub 이벤트 방식으로 결합도를 최소화하였다. PBC 매칭 규칙을 우선 검토했으나, 주어진 PBC 리스트에는 도서관리나 대출 프로세스와 일치하는 PBC가 존재하지 않아 별도 Core Domain으로 정의했다.",
                "explanations": [
                    {
                        "sourceContext": "도서관리",
                        "targetContext": "도서관 대출/반납 관리",
                        "relationType": "Pub/Sub",
                        "reason": "도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.",
                        "interactionPattern": "도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                    },
                    {
                        "sourceContext": "도서관 대출/반납 관리",
                        "targetContext": "도서관리",
                        "relationType": "Pub/Sub",
                        "reason": "대출/예약/반납/연체 등 유통 이벤트가 도서 상태 전이에 영향을 미치므로, 도서관리 컨텍스트가 관련 이벤트를 구독하여 상태를 변경함.",
                        "interactionPattern": "대출/예약/반납/연체 등 도서 상태에 영향을 주는 이벤트가 발생할 때마다 도서관리 컨텍스트가 해당 이벤트를 구독·적용함."
                    }
                ],
                "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                "currentGeneratedLength": 4023
            }
        },
        "boundedContextVersion": {
            "data": {
                "boundedContexts": [
                    {
                        "name": "LibraryCirculation",
                        "alias": "도서관 대출/반납 관리",
                        "importance": "Core Domain",
                        "complexity": "0.8",
                        "differentiation": "0.9",
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Loan",
                                "alias": "대출"
                            },
                            {
                                "name": "Reservation",
                                "alias": "예약"
                            },
                            {
                                "name": "LoanHistory",
                                "alias": "대출 이력"
                            }
                        ],
                        "events": [
                            "LoanRequested",
                            "LoanApproved",
                            "LoanRejectedDueToBookNotAvailable",
                            "ReservationRequested",
                            "ReservationApproved",
                            "BookReturned",
                            "BookStateChangedAfterReturn",
                            "LoanExtended",
                            "LoanExtensionRejected",
                            "BookOverdue",
                            "BookHistoryViewed"
                        ],
                        "requirements": [],
                        "role": "회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다."
                    },
                    {
                        "name": "LibraryBookManagement",
                        "alias": "도서관리",
                        "importance": "Core Domain",
                        "complexity": "0.6",
                        "differentiation": "0.7",
                        "implementationStrategy": "Rich Domain Model",
                        "aggregates": [
                            {
                                "name": "Book",
                                "alias": "도서"
                            }
                        ],
                        "events": [
                            "BookRegistered",
                            "BookRegistrationFailedDueToDuplicateISBN",
                            "BookDiscarded",
                            "BookStateChangedAfterReturn"
                        ],
                        "requirements": [],
                        "role": "신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다."
                    }
                ],
                "relations": [
                    {
                        "name": "BookStatusEventPubSub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LibraryBookManagement",
                            "alias": "도서관리"
                        },
                        "downStream": {
                            "name": "LibraryCirculation",
                            "alias": "도서관 대출/반납 관리"
                        }
                    },
                    {
                        "name": "LoanStatusEventPubSub",
                        "type": "Pub/Sub",
                        "upStream": {
                            "name": "LibraryCirculation",
                            "alias": "도서관 대출/반납 관리"
                        },
                        "downStream": {
                            "name": "LibraryBookManagement",
                            "alias": "도서관리"
                        }
                    }
                ],
                "thoughts": "이번 분리에서는 도메인 복잡도와 프로세스(value stream) 관점 모두를 고려하였다. 도서의 등록, 정보 관리, 상태 전이 등 도서 자체의 라이프사이클과 관련된 요구는 도서관리(도서 라이프사이클)로 고유하게 분리하여 LibraryBookManagement로 구성하였다. 반면, 대출/반납/예약/연장 등 도서가 실제로 이용되는 비즈니스 프로세스는 LibraryCirculation(도서관 대출/반납 관리)로 집중시켰다. 이는 사용자(회원/사서) 행동 및 비즈니스 가치의 흐름(프로세스)에 기반해 분리한 것이다. 두 컨텍스트는 도서 상태 변화와 대출/예약 이벤트를 주고받으면서 느슨하게 연결되어 있으며, Pub/Sub 이벤트 방식으로 결합도를 최소화하였다. PBC 매칭 규칙을 우선 검토했으나, 주어진 PBC 리스트에는 도서관리나 대출 프로세스와 일치하는 PBC가 존재하지 않아 별도 Core Domain으로 정의했다.",
                "explanations": [
                    {
                        "sourceContext": "도서관리",
                        "targetContext": "도서관 대출/반납 관리",
                        "relationType": "Pub/Sub",
                        "reason": "도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.",
                        "interactionPattern": "도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                    },
                    {
                        "sourceContext": "도서관 대출/반납 관리",
                        "targetContext": "도서관리",
                        "relationType": "Pub/Sub",
                        "reason": "대출/예약/반납/연체 등 유통 이벤트가 도서 상태 전이에 영향을 미치므로, 도서관리 컨텍스트가 관련 이벤트를 구독하여 상태를 변경함.",
                        "interactionPattern": "대출/예약/반납/연체 등 도서 상태에 영향을 주는 이벤트가 발생할 때마다 도서관리 컨텍스트가 해당 이벤트를 구독·적용함."
                    }
                ],
                "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                "currentGeneratedLength": 4023
            },
            "version": 1,
            "aspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리"
        },
        "draftOptions": {
            "LibraryCirculation": {
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
                                "name": "LoanPeriodType",
                                "alias": "대출 기간 구분"
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
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "대출과 예약 업무에 집중되어 있어 각 도메인별 업무 프로세스 구현이 간결함.",
                    "coupling": "Loan과 Reservation 사이의 상호작용이 명확하며, 외부(Book) 참조만 존재하여 컨텍스트 결합도가 낮음.",
                    "consistency": "대출과 예약 상태 전이, 예약자 존재 시 도서 상태 전환 등은 Aggregate 내에서 원자적으로 처리 가능.",
                    "encapsulation": "핵심 대출/예약 불변성이 각 Aggregate 내부에서 보장되어 설계가 견고함.",
                    "complexity": "이력까지 별도 관리하지 않아 구조가 단순하고 입문자가 빠르게 이해할 수 있음.",
                    "independence": "대출/예약 정책 변경이나 확장 시 서로 영향을 최소화할 수 있음.",
                    "performance": "대출/예약 건수 기준 데이터 접근이 빠르고, 업무 처리량 확장에 유리함."
                },
                "cons": {
                    "cohesion": "대출/예약 이력이 별도 관리되지 않아 도서 상태 변동이나 이력 조회에 제약이 생김.",
                    "coupling": "상세 이력이나 복잡한 감사 로깅이 필요한 경우 애그리거트 외부 로직이 늘어남.",
                    "consistency": "과거 기록을 바탕으로 한 정책(예: 연체 누적 등) 적용이 어려움.",
                    "encapsulation": "도메인 이벤트 이력 추적이 약화되어, 감사 및 추적에 취약할 수 있음.",
                    "complexity": "이력 로직이 서비스 계층에 퍼질 경우 전체 시스템 구조가 산만해질 우려.",
                    "independence": "향후 감사/이력 요구사항이 증가하면 Aggregate 구조의 대대적 변경 필요.",
                    "performance": "복합 이력 조회(도서별 대출/예약/반납 현황 등)가 느려질 수 있음."
                },
                "boundedContext": {
                    "name": "LibraryCirculation",
                    "alias": "도서관 대출/반납 관리",
                    "displayName": "도서관 대출/반납 관리",
                    "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                    "aggregates": [
                        {
                            "name": "Loan",
                            "alias": "대출"
                        },
                        {
                            "name": "Reservation",
                            "alias": "예약"
                        },
                        {
                            "name": "LoanHistory",
                            "alias": "대출 이력"
                        }
                    ]
                },
                "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
            },
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
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "Book과 BookStatusHistory가 각자의 명확한 역할(정보/상태 관리 vs 이력 관리)에 집중해 단일 책임 원칙이 잘 지켜진다.",
                    "coupling": "Book과 이력 관리가 분리되어, 각 Aggregate별 변경이나 확장 시 상호 영향이 적다.",
                    "consistency": "Book의 상태와 이력 기록이 분리되면서 장기 데이터 처리와 확장성이 용이하다.",
                    "encapsulation": "이력 관리 로직이 BookStatusHistory에 은닉되어, 도서와 이력의 도메인 규칙 분리가 가능하다.",
                    "complexity": "각 Aggregate가 단순하여 도메인, 개발, 테스트 모두 직관적으로 관리할 수 있다.",
                    "independence": "상태 이력 확장이나 데이터 보관 정책 변화 시 Book에 영향 없이 변경이 가능하다.",
                    "performance": "이력 데이터가 대용량이 되더라도 Book Aggregate의 성능 저하 없이 효율적 관리가 가능하다."
                },
                "cons": {
                    "cohesion": "도서 상태 변경 시 이력 기록을 별도로 연계해야 하므로 업무 흐름이 분산된다.",
                    "coupling": "이벤트 처리나 서비스 계층에서 Book과 BookStatusHistory의 트랜잭션 연계 로직을 추가 구현해야 한다.",
                    "consistency": "상태 변경과 이력 기록이 각각의 트랜잭션 경계를 갖기 때문에 완전한 원자성이 보장되지 않을 수 있다.",
                    "encapsulation": "상태 전이와 이력 동기화 규칙이 Aggregate 외부(서비스)에 노출된다.",
                    "complexity": "도서 상태 변경/이력 저장 연동이 추가로 필요하여 업무 프로세스 구현이 복잡해질 수 있다.",
                    "independence": "이력 데이터와 도서 데이터 간 동기화 오류 발생 가능성이 높아진다.",
                    "performance": "이력과 Book을 동시에 조회할 때 추가 쿼리가 필요하므로 일부 복합 조회 시 응답 속도가 저하될 수 있다."
                },
                "boundedContext": {
                    "name": "LibraryBookManagement",
                    "alias": "도서관리",
                    "displayName": "도서관리",
                    "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                    "aggregates": [
                        {
                            "name": "Book",
                            "alias": "도서"
                        }
                    ]
                },
                "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
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
                "uniqueId": "075c00087b64753e507fbf077329c92c",
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
                            "8f10587f-4a32-bd35-eb3f-c26af058aa7d": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "8f10587f-4a32-bd35-eb3f-c26af058aa7d",
                                "name": "Librarian",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "8f10587f-4a32-bd35-eb3f-c26af058aa7d",
                                    "x": 150,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "4dc47f16-1514-a1da-f834-dfcc9081bf89": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "4dc47f16-1514-a1da-f834-dfcc9081bf89",
                                "name": "Member",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "4dc47f16-1514-a1da-f834-dfcc9081bf89",
                                    "x": 150,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "7a8fe45e-ad33-c527-73ef-9ec02367f258": {
                                "_type": "org.uengine.modeling.model.Actor",
                                "id": "7a8fe45e-ad33-c527-73ef-9ec02367f258",
                                "name": "System",
                                "oldName": "",
                                "displayName": "",
                                "description": "",
                                "author": null,
                                "elementView": {
                                    "_type": "org.uengine.modeling.model.Actor",
                                    "id": "7a8fe45e-ad33-c527-73ef-9ec02367f258",
                                    "x": 150,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}"
                                },
                                "boundedContext": {}
                            },
                            "4ce1b676-52bb-bd5a-52ae-9990f6c16d54": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "4ce1b676-52bb-bd5a-52ae-9990f6c16d54",
                                "visibility": "public",
                                "name": "BookRegistered",
                                "oldName": "",
                                "displayName": "도서가 등록됨",
                                "namePascalCase": "BookRegistered",
                                "nameCamelCase": "bookRegistered",
                                "namePlural": "",
                                "description": "사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.",
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
                                    "id": "4ce1b676-52bb-bd5a-52ae-9990f6c16d54",
                                    "x": 300,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "4ce1b676-52bb-bd5a-52ae-9990f6c16d54",
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
                            "aa48af19-681c-90e5-111f-b46fe5c48f35": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "aa48af19-681c-90e5-111f-b46fe5c48f35",
                                "visibility": "public",
                                "name": "BookRegistrationFailedDueToDuplicateISBN",
                                "oldName": "",
                                "displayName": "ISBN 중복으로 도서 등록 실패됨",
                                "namePascalCase": "BookRegistrationFailedDueToDuplicateISBN",
                                "nameCamelCase": "bookRegistrationFailedDueToDuplicateISBN",
                                "namePlural": "",
                                "description": "입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.",
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
                                    "id": "aa48af19-681c-90e5-111f-b46fe5c48f35",
                                    "x": 500,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "aa48af19-681c-90e5-111f-b46fe5c48f35",
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
                            "ad634dd6-14ef-392d-0f65-56b370fa2438": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "ad634dd6-14ef-392d-0f65-56b370fa2438",
                                "visibility": "public",
                                "name": "BookDiscarded",
                                "oldName": "",
                                "displayName": "도서가 폐기됨",
                                "namePascalCase": "BookDiscarded",
                                "nameCamelCase": "bookDiscarded",
                                "namePlural": "",
                                "description": "도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.",
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
                                    "id": "ad634dd6-14ef-392d-0f65-56b370fa2438",
                                    "x": 700,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "ad634dd6-14ef-392d-0f65-56b370fa2438",
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
                            "03484ba8-2a48-f9ee-ac2b-d054d28ee727": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
                                "visibility": "public",
                                "name": "LoanApproved",
                                "oldName": "",
                                "displayName": "도서 대출이 승인됨",
                                "namePascalCase": "LoanApproved",
                                "nameCamelCase": "loanApproved",
                                "namePlural": "",
                                "description": "대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.",
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
                                    "id": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
                                    "x": 900,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
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
                            "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                "visibility": "public",
                                "name": "LoanRejectedDueToBookNotAvailable",
                                "oldName": "",
                                "displayName": "도서가 대출불가로 대출 거절됨",
                                "namePascalCase": "LoanRejectedDueToBookNotAvailable",
                                "nameCamelCase": "loanRejectedDueToBookNotAvailable",
                                "namePlural": "",
                                "description": "도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.",
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
                                    "id": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                    "x": 1100,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                    "x": 1100,
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
                            "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                "visibility": "public",
                                "name": "ReservationApproved",
                                "oldName": "",
                                "displayName": "도서 예약이 승인됨",
                                "namePascalCase": "ReservationApproved",
                                "nameCamelCase": "reservationApproved",
                                "namePlural": "",
                                "description": "예약 신청을 확인하고 예약을 승인함.",
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
                                    "id": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                    "x": 1300,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                    "x": 1300,
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
                            "80f7d73f-13a3-6dfa-689c-1954c4c64490": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "80f7d73f-13a3-6dfa-689c-1954c4c64490",
                                "visibility": "public",
                                "name": "LoanExtensionRejected",
                                "oldName": "",
                                "displayName": "대출 연장이 거절됨",
                                "namePascalCase": "LoanExtensionRejected",
                                "nameCamelCase": "loanExtensionRejected",
                                "namePlural": "",
                                "description": "연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.",
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
                                    "id": "80f7d73f-13a3-6dfa-689c-1954c4c64490",
                                    "x": 1500,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "80f7d73f-13a3-6dfa-689c-1954c4c64490",
                                    "x": 1500,
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
                            "206d738e-2ea0-aa93-3016-0b915f93c324": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "206d738e-2ea0-aa93-3016-0b915f93c324",
                                "visibility": "public",
                                "name": "BookHistoryViewed",
                                "oldName": "",
                                "displayName": "도서 이력이 조회됨",
                                "namePascalCase": "BookHistoryViewed",
                                "nameCamelCase": "bookHistoryViewed",
                                "namePlural": "",
                                "description": "도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.",
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
                                    "id": "206d738e-2ea0-aa93-3016-0b915f93c324",
                                    "x": 1700,
                                    "y": 150,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "206d738e-2ea0-aa93-3016-0b915f93c324",
                                    "x": 1700,
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
                            "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
                                "visibility": "public",
                                "name": "LoanRequested",
                                "oldName": "",
                                "displayName": "도서 대출이 신청됨",
                                "namePascalCase": "LoanRequested",
                                "nameCamelCase": "loanRequested",
                                "namePlural": "",
                                "description": "회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.",
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
                                    "id": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
                                    "x": 300,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
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
                            "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                "visibility": "public",
                                "name": "ReservationRequested",
                                "oldName": "",
                                "displayName": "도서 예약이 신청됨",
                                "namePascalCase": "ReservationRequested",
                                "nameCamelCase": "reservationRequested",
                                "namePlural": "",
                                "description": "대출이 불가능한 도서에 대해 회원이 예약을 신청함.",
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
                                    "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                    "x": 500,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
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
                            "69b77028-8293-683f-c9e4-34340c0e58a0": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "69b77028-8293-683f-c9e4-34340c0e58a0",
                                "visibility": "public",
                                "name": "BookReturned",
                                "oldName": "",
                                "displayName": "도서가 반납됨",
                                "namePascalCase": "BookReturned",
                                "nameCamelCase": "bookReturned",
                                "namePlural": "",
                                "description": "회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.",
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
                                    "id": "69b77028-8293-683f-c9e4-34340c0e58a0",
                                    "x": 700,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "69b77028-8293-683f-c9e4-34340c0e58a0",
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
                            "595199f2-e1db-55d2-eeae-f6378cbd7471": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "595199f2-e1db-55d2-eeae-f6378cbd7471",
                                "visibility": "public",
                                "name": "LoanExtended",
                                "oldName": "",
                                "displayName": "도서 대출이 연장됨",
                                "namePascalCase": "LoanExtended",
                                "nameCamelCase": "loanExtended",
                                "namePlural": "",
                                "description": "대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.",
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
                                    "id": "595199f2-e1db-55d2-eeae-f6378cbd7471",
                                    "x": 900,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "595199f2-e1db-55d2-eeae-f6378cbd7471",
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
                            "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
                                "visibility": "public",
                                "name": "BookStateChangedAfterReturn",
                                "oldName": "",
                                "displayName": "반납 후 도서 상태가 변경됨",
                                "namePascalCase": "BookStateChangedAfterReturn",
                                "nameCamelCase": "bookStateChangedAfterReturn",
                                "namePlural": "",
                                "description": "도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.",
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
                                    "id": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
                                    "x": 300,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
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
                            "44599d64-d377-922d-6c33-41aab8b5acca": {
                                "_type": "org.uengine.modeling.model.Event",
                                "id": "44599d64-d377-922d-6c33-41aab8b5acca",
                                "visibility": "public",
                                "name": "BookOverdue",
                                "oldName": "",
                                "displayName": "도서 대출이 연체됨",
                                "namePascalCase": "BookOverdue",
                                "nameCamelCase": "bookOverdue",
                                "namePlural": "",
                                "description": "반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.",
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
                                    "id": "44599d64-d377-922d-6c33-41aab8b5acca",
                                    "x": 500,
                                    "y": 650,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "hexagonalView": {
                                    "_type": "org.uengine.modeling.model.EventHexagonal",
                                    "id": "44599d64-d377-922d-6c33-41aab8b5acca",
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
                            }
                        },
                        "relations": {
                            "22c5e87e-bee9-a24f-8cf8-c390d81bfa1a": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "22c5e87e-bee9-a24f-8cf8-c390d81bfa1a",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "22c5e87e-bee9-a24f-8cf8-c390d81bfa1a",
                                "to": "22c5e87e-bee9-a24f-8cf8-c390d81bfa1a",
                                "description": "",
                                "relationView": {
                                    "id": "22c5e87e-bee9-a24f-8cf8-c390d81bfa1a",
                                    "value": "[[0,275],[2000,275]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,275],[2000,275]]"
                            },
                            "8b7409f2-5622-86a7-871f-536639aee37a": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "8b7409f2-5622-86a7-871f-536639aee37a",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "8b7409f2-5622-86a7-871f-536639aee37a",
                                "to": "8b7409f2-5622-86a7-871f-536639aee37a",
                                "description": "",
                                "relationView": {
                                    "id": "8b7409f2-5622-86a7-871f-536639aee37a",
                                    "value": "[[0,525],[2000,525]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,525],[2000,525]]"
                            },
                            "e6cce8cf-aa68-be13-acd2-e9c7cbc4410d": {
                                "_type": "org.uengine.modeling.model.Line",
                                "id": "e6cce8cf-aa68-be13-acd2-e9c7cbc4410d",
                                "name": "",
                                "author": null,
                                "oldName": "",
                                "displayName": "",
                                "from": "e6cce8cf-aa68-be13-acd2-e9c7cbc4410d",
                                "to": "e6cce8cf-aa68-be13-acd2-e9c7cbc4410d",
                                "description": "",
                                "relationView": {
                                    "id": "e6cce8cf-aa68-be13-acd2-e9c7cbc4410d",
                                    "value": "[[0,775],[2000,775]]"
                                },
                                "size": 10,
                                "color": "#cccccc",
                                "dashStyle": "3,3",
                                "imgSrc": "https://www.msaez.io:8081/static/image/symbol/edge.png",
                                "vertices": "[[0,775],[2000,775]]"
                            },
                            "f01347fb-1b47-4bab-4c69-0b05077e1ed0": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "f01347fb-1b47-4bab-4c69-0b05077e1ed0",
                                "name": "4",
                                "displayName": "4",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
                                    "visibility": "public",
                                    "name": "LoanRequested",
                                    "oldName": "",
                                    "displayName": "도서 대출이 신청됨",
                                    "namePascalCase": "LoanRequested",
                                    "nameCamelCase": "loanRequested",
                                    "namePlural": "",
                                    "description": "회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.",
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
                                        "id": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
                                        "x": 300,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
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
                                    "id": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
                                    "visibility": "public",
                                    "name": "LoanApproved",
                                    "oldName": "",
                                    "displayName": "도서 대출이 승인됨",
                                    "namePascalCase": "LoanApproved",
                                    "nameCamelCase": "loanApproved",
                                    "namePlural": "",
                                    "description": "대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.",
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
                                        "id": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
                                        "x": 900,
                                        "y": 150,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
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
                                "from": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
                                "to": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
                                "relationView": {
                                    "id": "f01347fb-1b47-4bab-4c69-0b05077e1ed0",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "662c5a6d-0d63-7d5a-e73b-4c5d01cddf9f",
                                    "to": "03484ba8-2a48-f9ee-ac2b-d054d28ee727",
                                    "needReconnect": true
                                }
                            },
                            "12bdf16b-4230-b3b5-70f9-5dbbeb6cc2e5": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "12bdf16b-4230-b3b5-70f9-5dbbeb6cc2e5",
                                "name": "6",
                                "displayName": "6",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                    "visibility": "public",
                                    "name": "LoanRejectedDueToBookNotAvailable",
                                    "oldName": "",
                                    "displayName": "도서가 대출불가로 대출 거절됨",
                                    "namePascalCase": "LoanRejectedDueToBookNotAvailable",
                                    "nameCamelCase": "loanRejectedDueToBookNotAvailable",
                                    "namePlural": "",
                                    "description": "도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.",
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
                                        "id": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                        "x": 1100,
                                        "y": 150,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                        "x": 1100,
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
                                    "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                    "visibility": "public",
                                    "name": "ReservationRequested",
                                    "oldName": "",
                                    "displayName": "도서 예약이 신청됨",
                                    "namePascalCase": "ReservationRequested",
                                    "nameCamelCase": "reservationRequested",
                                    "namePlural": "",
                                    "description": "대출이 불가능한 도서에 대해 회원이 예약을 신청함.",
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
                                        "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
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
                                "from": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                "to": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                "relationView": {
                                    "id": "12bdf16b-4230-b3b5-70f9-5dbbeb6cc2e5",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "8d4e7161-34f8-46f4-3d19-989a9f3bcdc3",
                                    "to": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                    "needReconnect": true
                                }
                            },
                            "8e0f7a46-379a-582b-fed4-43d5448eaea9": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "8e0f7a46-379a-582b-fed4-43d5448eaea9",
                                "name": "7",
                                "displayName": "7",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                    "visibility": "public",
                                    "name": "ReservationRequested",
                                    "oldName": "",
                                    "displayName": "도서 예약이 신청됨",
                                    "namePascalCase": "ReservationRequested",
                                    "nameCamelCase": "reservationRequested",
                                    "namePlural": "",
                                    "description": "대출이 불가능한 도서에 대해 회원이 예약을 신청함.",
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
                                        "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                        "x": 500,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
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
                                    "id": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                    "visibility": "public",
                                    "name": "ReservationApproved",
                                    "oldName": "",
                                    "displayName": "도서 예약이 승인됨",
                                    "namePascalCase": "ReservationApproved",
                                    "nameCamelCase": "reservationApproved",
                                    "namePlural": "",
                                    "description": "예약 신청을 확인하고 예약을 승인함.",
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
                                        "id": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                        "x": 1300,
                                        "y": 150,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                        "x": 1300,
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
                                "from": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                "to": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                "relationView": {
                                    "id": "8e0f7a46-379a-582b-fed4-43d5448eaea9",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "7ec8e1f8-5e71-22ba-16a5-6a77c10c16b7",
                                    "to": "a26d9ae0-ba00-eca3-3c71-65dc0dcdefa7",
                                    "needReconnect": true
                                }
                            },
                            "20a61f0b-4a4c-400c-bc1a-39a755cfb6a6": {
                                "_type": "org.uengine.modeling.model.Relation",
                                "id": "20a61f0b-4a4c-400c-bc1a-39a755cfb6a6",
                                "name": "9",
                                "displayName": "9",
                                "sourceElement": {
                                    "_type": "org.uengine.modeling.model.Event",
                                    "id": "69b77028-8293-683f-c9e4-34340c0e58a0",
                                    "visibility": "public",
                                    "name": "BookReturned",
                                    "oldName": "",
                                    "displayName": "도서가 반납됨",
                                    "namePascalCase": "BookReturned",
                                    "nameCamelCase": "bookReturned",
                                    "namePlural": "",
                                    "description": "회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.",
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
                                        "id": "69b77028-8293-683f-c9e4-34340c0e58a0",
                                        "x": 700,
                                        "y": 400,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "69b77028-8293-683f-c9e4-34340c0e58a0",
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
                                    "id": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
                                    "visibility": "public",
                                    "name": "BookStateChangedAfterReturn",
                                    "oldName": "",
                                    "displayName": "반납 후 도서 상태가 변경됨",
                                    "namePascalCase": "BookStateChangedAfterReturn",
                                    "nameCamelCase": "bookStateChangedAfterReturn",
                                    "namePlural": "",
                                    "description": "도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.",
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
                                        "id": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
                                        "x": 300,
                                        "y": 650,
                                        "width": 100,
                                        "height": 100,
                                        "style": "{}",
                                        "angle": 0
                                    },
                                    "hexagonalView": {
                                        "_type": "org.uengine.modeling.model.EventHexagonal",
                                        "id": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
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
                                "from": "69b77028-8293-683f-c9e4-34340c0e58a0",
                                "to": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
                                "relationView": {
                                    "id": "20a61f0b-4a4c-400c-bc1a-39a755cfb6a6",
                                    "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"block\",\"stroke\":\"grey\",\"stroke-width\":\"1.4\",\"font-size\":\"12px\",\"font-weight\":\"bold\"}",
                                    "value": null,
                                    "from": "69b77028-8293-683f-c9e4-34340c0e58a0",
                                    "to": "34cef7a8-06ee-5746-4df8-4f4ce1d43a5d",
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
                                "displayName": "도서가 등록됨",
                                "actor": "Librarian",
                                "level": 1,
                                "description": "사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.",
                                "inputs": [
                                    "도서명",
                                    "ISBN(13자리)",
                                    "저자",
                                    "출판사",
                                    "카테고리(소설/비소설/학술/잡지)",
                                    "ISBN 중복 없음"
                                ],
                                "outputs": [
                                    "새로운 도서 엔티티 생성",
                                    "도서 상태 '대출가능' 설정"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookRegistrationFailedDueToDuplicateISBN",
                                "displayName": "ISBN 중복으로 도서 등록 실패됨",
                                "actor": "Librarian",
                                "level": 2,
                                "description": "입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.",
                                "inputs": [
                                    "입력된 ISBN",
                                    "기존 도서의 ISBN"
                                ],
                                "outputs": [
                                    "등록 실패 메시지"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookDiscarded",
                                "displayName": "도서가 폐기됨",
                                "actor": "Librarian",
                                "level": 3,
                                "description": "도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.",
                                "inputs": [
                                    "폐기 사유",
                                    "도서 식별자",
                                    "도서 상태 != '폐기'"
                                ],
                                "outputs": [
                                    "도서 상태 '폐기'로 변경"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanRequested",
                                "displayName": "도서 대출이 신청됨",
                                "actor": "Member",
                                "level": 4,
                                "description": "회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.",
                                "inputs": [
                                    "회원번호",
                                    "회원명",
                                    "도서명 또는 ISBN",
                                    "대출 기간(7/14/30일)",
                                    "도서 상태 '대출가능'"
                                ],
                                "outputs": [
                                    "대출 신청 정보 생성"
                                ],
                                "nextEvents": [
                                    "LoanApproved"
                                ]
                            },
                            {
                                "name": "LoanApproved",
                                "displayName": "도서 대출이 승인됨",
                                "actor": "Librarian",
                                "level": 5,
                                "description": "대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.",
                                "inputs": [
                                    "대출 신청 정보",
                                    "도서 상태 '대출가능'"
                                ],
                                "outputs": [
                                    "대출 기록 생성",
                                    "도서 상태 '대출중' 변경"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanRejectedDueToBookNotAvailable",
                                "displayName": "도서가 대출불가로 대출 거절됨",
                                "actor": "Librarian",
                                "level": 6,
                                "description": "도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.",
                                "inputs": [
                                    "대출 신청 정보",
                                    "도서 상태 '대출중' 또는 '폐기'"
                                ],
                                "outputs": [
                                    "대출 거절 메시지"
                                ],
                                "nextEvents": [
                                    "ReservationRequested"
                                ]
                            },
                            {
                                "name": "ReservationRequested",
                                "displayName": "도서 예약이 신청됨",
                                "actor": "Member",
                                "level": 7,
                                "description": "대출이 불가능한 도서에 대해 회원이 예약을 신청함.",
                                "inputs": [
                                    "회원번호",
                                    "도서 식별자",
                                    "도서 상태 '대출중'"
                                ],
                                "outputs": [
                                    "예약 신청 정보 생성"
                                ],
                                "nextEvents": [
                                    "ReservationApproved"
                                ]
                            },
                            {
                                "name": "ReservationApproved",
                                "displayName": "도서 예약이 승인됨",
                                "actor": "Librarian",
                                "level": 8,
                                "description": "예약 신청을 확인하고 예약을 승인함.",
                                "inputs": [
                                    "예약 신청 정보"
                                ],
                                "outputs": [
                                    "예약 기록 생성"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookReturned",
                                "displayName": "도서가 반납됨",
                                "actor": "Member",
                                "level": 9,
                                "description": "회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.",
                                "inputs": [
                                    "대출 정보",
                                    "도서 식별자"
                                ],
                                "outputs": [
                                    "반납 기록 생성",
                                    "대출 상태 '반납완료'"
                                ],
                                "nextEvents": [
                                    "BookStateChangedAfterReturn"
                                ]
                            },
                            {
                                "name": "BookStateChangedAfterReturn",
                                "displayName": "반납 후 도서 상태가 변경됨",
                                "actor": "System",
                                "level": 10,
                                "description": "도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.",
                                "inputs": [
                                    "도서 식별자",
                                    "예약 대기자 존재 여부"
                                ],
                                "outputs": [
                                    "도서 상태 '예약중' 또는 '대출가능' 변경"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanExtended",
                                "displayName": "도서 대출이 연장됨",
                                "actor": "Member",
                                "level": 11,
                                "description": "대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.",
                                "inputs": [
                                    "대출 정보",
                                    "연장 신청",
                                    "연장 가능 조건"
                                ],
                                "outputs": [
                                    "대출 기간 연장",
                                    "대출 기록 갱신"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "LoanExtensionRejected",
                                "displayName": "대출 연장이 거절됨",
                                "actor": "Librarian",
                                "level": 12,
                                "description": "연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.",
                                "inputs": [
                                    "대출 정보",
                                    "연장 신청",
                                    "연장 불가 사유"
                                ],
                                "outputs": [
                                    "연장 거절 메시지"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookOverdue",
                                "displayName": "도서 대출이 연체됨",
                                "actor": "System",
                                "level": 13,
                                "description": "반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.",
                                "inputs": [
                                    "반납 예정일",
                                    "반납 기록 미존재"
                                ],
                                "outputs": [
                                    "대출 상태 '연체' 변경"
                                ],
                                "nextEvents": []
                            },
                            {
                                "name": "BookHistoryViewed",
                                "displayName": "도서 이력이 조회됨",
                                "actor": "Librarian",
                                "level": 14,
                                "description": "도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.",
                                "inputs": [
                                    "도서 식별자"
                                ],
                                "outputs": [
                                    "대출 이력 목록",
                                    "상태 변경 이력"
                                ],
                                "nextEvents": []
                            }
                        ],
                        "actors": [
                            {
                                "name": "Librarian",
                                "events": [
                                    "BookRegistered",
                                    "BookRegistrationFailedDueToDuplicateISBN",
                                    "BookDiscarded",
                                    "LoanApproved",
                                    "LoanRejectedDueToBookNotAvailable",
                                    "ReservationApproved",
                                    "LoanExtensionRejected",
                                    "BookHistoryViewed"
                                ],
                                "lane": 0
                            },
                            {
                                "name": "Member",
                                "events": [
                                    "LoanRequested",
                                    "ReservationRequested",
                                    "BookReturned",
                                    "LoanExtended"
                                ],
                                "lane": 1
                            },
                            {
                                "name": "System",
                                "events": [
                                    "BookStateChangedAfterReturn",
                                    "BookOverdue"
                                ],
                                "lane": 2
                            }
                        ]
                    },
                    "currentGeneratedLength": 6949
                },
                "currentGeneratedLength": 0,
                "timestamp": "2025-06-25T03:22:25.577Z"
            },
            {
                "uniqueId": "40475cd368130cc1b52f92ea2869338e",
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
                "timestamp": "2025-06-25T03:22:56.519Z"
            },
            {
                "uniqueId": "0cdc4ac171e8f3558c78f59467aa681e",
                "type": "boundedContextResult",
                "result": {
                    "도메인 복잡도 분리+프로세스(value stream) 기반 분리": {
                        "boundedContexts": [
                            {
                                "name": "LibraryCirculation",
                                "alias": "도서관 대출/반납 관리",
                                "importance": "Core Domain",
                                "complexity": "0.8",
                                "differentiation": "0.9",
                                "implementationStrategy": "Rich Domain Model",
                                "aggregates": [
                                    {
                                        "name": "Loan",
                                        "alias": "대출"
                                    },
                                    {
                                        "name": "Reservation",
                                        "alias": "예약"
                                    },
                                    {
                                        "name": "LoanHistory",
                                        "alias": "대출 이력"
                                    }
                                ],
                                "events": [
                                    "LoanRequested",
                                    "LoanApproved",
                                    "LoanRejectedDueToBookNotAvailable",
                                    "ReservationRequested",
                                    "ReservationApproved",
                                    "BookReturned",
                                    "BookStateChangedAfterReturn",
                                    "LoanExtended",
                                    "LoanExtensionRejected",
                                    "BookOverdue",
                                    "BookHistoryViewed"
                                ],
                                "requirements": [
                                    {
                                        "type": "userStory",
                                        "text": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해."
                                    },
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
                                        "text": "{\"name\":\"LoanRequested\",\"displayName\":\"도서 대출이 신청됨\",\"actor\":\"Member\",\"level\":4,\"description\":\"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\"inputs\":[\"회원번호\",\"회원명\",\"도서명 또는 ISBN\",\"대출 기간(7/14/30일)\",\"도서 상태 '대출가능'\"],\"outputs\":[\"대출 신청 정보 생성\"],\"nextEvents\":[\"LoanApproved\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanApproved\",\"displayName\":\"도서 대출이 승인됨\",\"actor\":\"Librarian\",\"level\":5,\"description\":\"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\"inputs\":[\"대출 신청 정보\",\"도서 상태 '대출가능'\"],\"outputs\":[\"대출 기록 생성\",\"도서 상태 '대출중' 변경\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanRejectedDueToBookNotAvailable\",\"displayName\":\"도서가 대출불가로 대출 거절됨\",\"actor\":\"Librarian\",\"level\":6,\"description\":\"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\"inputs\":[\"대출 신청 정보\",\"도서 상태 '대출중' 또는 '폐기'\"],\"outputs\":[\"대출 거절 메시지\"],\"nextEvents\":[\"ReservationRequested\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"ReservationRequested\",\"displayName\":\"도서 예약이 신청됨\",\"actor\":\"Member\",\"level\":7,\"description\":\"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\"inputs\":[\"회원번호\",\"도서 식별자\",\"도서 상태 '대출중'\"],\"outputs\":[\"예약 신청 정보 생성\"],\"nextEvents\":[\"ReservationApproved\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"ReservationApproved\",\"displayName\":\"도서 예약이 승인됨\",\"actor\":\"Librarian\",\"level\":8,\"description\":\"예약 신청을 확인하고 예약을 승인함.\",\"inputs\":[\"예약 신청 정보\"],\"outputs\":[\"예약 기록 생성\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":9,\"description\":\"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\"inputs\":[\"대출 정보\",\"도서 식별자\"],\"outputs\":[\"반납 기록 생성\",\"대출 상태 '반납완료'\"],\"nextEvents\":[\"BookStateChangedAfterReturn\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookStateChangedAfterReturn\",\"displayName\":\"반납 후 도서 상태가 변경됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\"inputs\":[\"도서 식별자\",\"예약 대기자 존재 여부\"],\"outputs\":[\"도서 상태 '예약중' 또는 '대출가능' 변경\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanExtended\",\"displayName\":\"도서 대출이 연장됨\",\"actor\":\"Member\",\"level\":11,\"description\":\"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\"inputs\":[\"대출 정보\",\"연장 신청\",\"연장 가능 조건\"],\"outputs\":[\"대출 기간 연장\",\"대출 기록 갱신\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"LoanExtensionRejected\",\"displayName\":\"대출 연장이 거절됨\",\"actor\":\"Librarian\",\"level\":12,\"description\":\"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\"inputs\":[\"대출 정보\",\"연장 신청\",\"연장 불가 사유\"],\"outputs\":[\"연장 거절 메시지\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookOverdue\",\"displayName\":\"도서 대출이 연체됨\",\"actor\":\"System\",\"level\":13,\"description\":\"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\"inputs\":[\"반납 예정일\",\"반납 기록 미존재\"],\"outputs\":[\"대출 상태 '연체' 변경\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookHistoryViewed\",\"displayName\":\"도서 이력이 조회됨\",\"actor\":\"Librarian\",\"level\":14,\"description\":\"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\",\"상태 변경 이력\"],\"nextEvents\":[]}"
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
                                        "text": "-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);"
                                    },
                                    {
                                        "type": "DDL",
                                        "text": "-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
                                    }
                                ],
                                "role": "회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다."
                            },
                            {
                                "name": "LibraryBookManagement",
                                "alias": "도서관리",
                                "importance": "Core Domain",
                                "complexity": "0.6",
                                "differentiation": "0.7",
                                "implementationStrategy": "Rich Domain Model",
                                "aggregates": [
                                    {
                                        "name": "Book",
                                        "alias": "도서"
                                    }
                                ],
                                "events": [
                                    "BookRegistered",
                                    "BookRegistrationFailedDueToDuplicateISBN",
                                    "BookDiscarded",
                                    "BookStateChangedAfterReturn"
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
                                        "text": "{\"name\":\"BookRegistered\",\"displayName\":\"도서가 등록됨\",\"actor\":\"Librarian\",\"level\":1,\"description\":\"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\"inputs\":[\"도서명\",\"ISBN(13자리)\",\"저자\",\"출판사\",\"카테고리(소설/비소설/학술/잡지)\",\"ISBN 중복 없음\"],\"outputs\":[\"새로운 도서 엔티티 생성\",\"도서 상태 '대출가능' 설정\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookRegistrationFailedDueToDuplicateISBN\",\"displayName\":\"ISBN 중복으로 도서 등록 실패됨\",\"actor\":\"Librarian\",\"level\":2,\"description\":\"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\"inputs\":[\"입력된 ISBN\",\"기존 도서의 ISBN\"],\"outputs\":[\"등록 실패 메시지\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookDiscarded\",\"displayName\":\"도서가 폐기됨\",\"actor\":\"Librarian\",\"level\":3,\"description\":\"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\"inputs\":[\"폐기 사유\",\"도서 식별자\",\"도서 상태 != '폐기'\"],\"outputs\":[\"도서 상태 '폐기'로 변경\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookReturned\",\"displayName\":\"도서가 반납됨\",\"actor\":\"Member\",\"level\":9,\"description\":\"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\"inputs\":[\"대출 정보\",\"도서 식별자\"],\"outputs\":[\"반납 기록 생성\",\"대출 상태 '반납완료'\"],\"nextEvents\":[\"BookStateChangedAfterReturn\"]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookStateChangedAfterReturn\",\"displayName\":\"반납 후 도서 상태가 변경됨\",\"actor\":\"System\",\"level\":10,\"description\":\"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\"inputs\":[\"도서 식별자\",\"예약 대기자 존재 여부\"],\"outputs\":[\"도서 상태 '예약중' 또는 '대출가능' 변경\"],\"nextEvents\":[]}"
                                    },
                                    {
                                        "type": "Event",
                                        "text": "{\"name\":\"BookHistoryViewed\",\"displayName\":\"도서 이력이 조회됨\",\"actor\":\"Librarian\",\"level\":14,\"description\":\"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\"inputs\":[\"도서 식별자\"],\"outputs\":[\"대출 이력 목록\",\"상태 변경 이력\"],\"nextEvents\":[]}"
                                    }
                                ],
                                "role": "신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다."
                            }
                        ],
                        "relations": [
                            {
                                "name": "BookStatusEventPubSub",
                                "type": "Pub/Sub",
                                "upStream": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리"
                                },
                                "downStream": {
                                    "name": "LibraryCirculation",
                                    "alias": "도서관 대출/반납 관리"
                                }
                            },
                            {
                                "name": "LoanStatusEventPubSub",
                                "type": "Pub/Sub",
                                "upStream": {
                                    "name": "LibraryCirculation",
                                    "alias": "도서관 대출/반납 관리"
                                },
                                "downStream": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리"
                                }
                            }
                        ],
                        "thoughts": "이번 분리에서는 도메인 복잡도와 프로세스(value stream) 관점 모두를 고려하였다. 도서의 등록, 정보 관리, 상태 전이 등 도서 자체의 라이프사이클과 관련된 요구는 도서관리(도서 라이프사이클)로 고유하게 분리하여 LibraryBookManagement로 구성하였다. 반면, 대출/반납/예약/연장 등 도서가 실제로 이용되는 비즈니스 프로세스는 LibraryCirculation(도서관 대출/반납 관리)로 집중시켰다. 이는 사용자(회원/사서) 행동 및 비즈니스 가치의 흐름(프로세스)에 기반해 분리한 것이다. 두 컨텍스트는 도서 상태 변화와 대출/예약 이벤트를 주고받으면서 느슨하게 연결되어 있으며, Pub/Sub 이벤트 방식으로 결합도를 최소화하였다. PBC 매칭 규칙을 우선 검토했으나, 주어진 PBC 리스트에는 도서관리나 대출 프로세스와 일치하는 PBC가 존재하지 않아 별도 Core Domain으로 정의했다.",
                        "explanations": [
                            {
                                "sourceContext": "도서관리",
                                "targetContext": "도서관 대출/반납 관리",
                                "relationType": "Pub/Sub",
                                "reason": "도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.",
                                "interactionPattern": "도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                            },
                            {
                                "sourceContext": "도서관 대출/반납 관리",
                                "targetContext": "도서관리",
                                "relationType": "Pub/Sub",
                                "reason": "대출/예약/반납/연체 등 유통 이벤트가 도서 상태 전이에 영향을 미치므로, 도서관리 컨텍스트가 관련 이벤트를 구독하여 상태를 변경함.",
                                "interactionPattern": "대출/예약/반납/연체 등 도서 상태에 영향을 주는 이벤트가 발생할 때마다 도서관리 컨텍스트가 해당 이벤트를 구독·적용함."
                            }
                        ],
                        "devisionAspect": "도메인 복잡도 분리+프로세스(value stream) 기반 분리",
                        "currentGeneratedLength": 4023
                    }
                },
                "isStartMapping": false,
                "isGeneratingBoundedContext": false,
                "isSummarizeStarted": false,
                "isAnalizing": false,
                "processingRate": 100,
                "currentProcessingBoundedContext": "도서관리",
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
                "timestamp": "2025-06-25T03:24:04.725Z"
            },
            {
                "type": "aggregateDraftDialogDto",
                "uniqueId": "1750821914477",
                "isShow": true,
                "draftOptions": [
                    {
                        "boundedContext": "LibraryCirculation",
                        "boundedContextAlias": "도서관 대출/반납 관리",
                        "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
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
                                            },
                                            {
                                                "name": "LoanPeriodType",
                                                "alias": "대출 기간 구분"
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
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "LoanHistory",
                                            "alias": "대출 이력"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "LoanActionType",
                                                "alias": "대출 이력 유형"
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
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "대출/예약/이력별 핵심 도메인 규칙을 각각의 Aggregate 내부에서 강하게 유지하여 책임 분리가 명확함.",
                                    "coupling": "Book을 외부 참조(ValueObject)로 관리해 BookContext와의 결합을 최소화하고, 각 Aggregate간 참조 방향도 일관적임.",
                                    "consistency": "대출, 예약, 이력에 대한 트랜잭션이 각각 분리되어 각 업무 불변성 보장에 용이.",
                                    "encapsulation": "각 Aggregate가 자신의 상태 변화와 이벤트 처리를 명확하게 감싸고 있어 유지보수성이 높음.",
                                    "complexity": "업무 역할에 따라 Aggregate 구성이 일치하므로 개발자가 업무별 모델을 직관적으로 이해할 수 있음.",
                                    "independence": "대출, 예약, 이력 처리가 독립적이어서 각 서비스의 독립 배포·확장이 쉬움.",
                                    "performance": "각 업무(대출/예약/이력)별로 데이터 접근 및 처리 부하 분산이 가능해 트래픽이 몰릴 때에도 성능 저하가 적음."
                                },
                                "cons": {
                                    "cohesion": "대출 반납 시 예약자 확인 및 상태 전이 등 업무 프로세스가 여러 Aggregate에 분산되어 오케스트레이션 로직이 추가됨.",
                                    "coupling": "대출-예약-이력간 상태 동기화 이벤트 관리 필요성이 커져, 개발 난이도가 높아질 수 있음.",
                                    "consistency": "업무 간 원자적 상태 변화(예: 반납+예약자 상태 전이)가 애플리케이션 서비스에서 보장되어야 함.",
                                    "encapsulation": "단일 트랜잭션으로 여러 업무 규칙을 동시에 처리하기 어렵고, 복합 규칙은 서비스 계층에서 처리해야 함.",
                                    "complexity": "상호 연관된 Aggregate간 이벤트/명령 관리가 복잡해져 학습 난이도가 상승.",
                                    "independence": "업무 규칙이 교차되는 경우 애그리거트 간 인터페이스 규약이 복잡해질 수 있음.",
                                    "performance": "이력, 예약, 대출을 동시에 조회할 때 조인이 많아져 쿼리 효율이 떨어질 수 있음."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LibraryCirculation",
                                    "alias": "도서관 대출/반납 관리",
                                    "displayName": "도서관 대출/반납 관리",
                                    "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        {
                                            "name": "LoanHistory",
                                            "alias": "대출 이력"
                                        }
                                    ]
                                },
                                "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
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
                                            },
                                            {
                                                "name": "LoanPeriodType",
                                                "alias": "대출 기간 구분"
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
                                            }
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "대출과 예약 업무에 집중되어 있어 각 도메인별 업무 프로세스 구현이 간결함.",
                                    "coupling": "Loan과 Reservation 사이의 상호작용이 명확하며, 외부(Book) 참조만 존재하여 컨텍스트 결합도가 낮음.",
                                    "consistency": "대출과 예약 상태 전이, 예약자 존재 시 도서 상태 전환 등은 Aggregate 내에서 원자적으로 처리 가능.",
                                    "encapsulation": "핵심 대출/예약 불변성이 각 Aggregate 내부에서 보장되어 설계가 견고함.",
                                    "complexity": "이력까지 별도 관리하지 않아 구조가 단순하고 입문자가 빠르게 이해할 수 있음.",
                                    "independence": "대출/예약 정책 변경이나 확장 시 서로 영향을 최소화할 수 있음.",
                                    "performance": "대출/예약 건수 기준 데이터 접근이 빠르고, 업무 처리량 확장에 유리함."
                                },
                                "cons": {
                                    "cohesion": "대출/예약 이력이 별도 관리되지 않아 도서 상태 변동이나 이력 조회에 제약이 생김.",
                                    "coupling": "상세 이력이나 복잡한 감사 로깅이 필요한 경우 애그리거트 외부 로직이 늘어남.",
                                    "consistency": "과거 기록을 바탕으로 한 정책(예: 연체 누적 등) 적용이 어려움.",
                                    "encapsulation": "도메인 이벤트 이력 추적이 약화되어, 감사 및 추적에 취약할 수 있음.",
                                    "complexity": "이력 로직이 서비스 계층에 퍼질 경우 전체 시스템 구조가 산만해질 우려.",
                                    "independence": "향후 감사/이력 요구사항이 증가하면 Aggregate 구조의 대대적 변경 필요.",
                                    "performance": "복합 이력 조회(도서별 대출/예약/반납 현황 등)가 느려질 수 있음."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "LibraryCirculation",
                                    "alias": "도서관 대출/반납 관리",
                                    "displayName": "도서관 대출/반납 관리",
                                    "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        {
                                            "name": "LoanHistory",
                                            "alias": "대출 이력"
                                        }
                                    ]
                                },
                                "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
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
                                            },
                                            {
                                                "name": "LoanPeriodType",
                                                "alias": "대출 기간 구분"
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
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "LoanHistory",
                                            "alias": "대출 이력"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "LoanActionType",
                                                "alias": "대출 이력 유형"
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
                                            }
                                        ]
                                    },
                                    {
                                        "aggregate": {
                                            "name": "BookStatusHistory",
                                            "alias": "도서 상태 이력"
                                        },
                                        "enumerations": [
                                            {
                                                "name": "BookStatusType",
                                                "alias": "도서 상태 구분"
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
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "업무 성격별(대출/예약/대출이력/도서상태이력)로 Aggregate를 세분화해 각 업무 규칙과 이력 요구사항을 세밀하게 관리 가능.",
                                    "coupling": "이력과 업무 트랜잭션이 완전히 분리되어 서비스별 변화가 독립적임.",
                                    "consistency": "도서 상태 및 대출/예약 이력의 변경이 각각의 Aggregate 내에서 일관성 있게 기록됨.",
                                    "encapsulation": "이력 관리와 업무 프로세스가 각자 감싸여 있어 보안 및 감사가 용이.",
                                    "complexity": "확장성, 감사성, 규제 대응에 매우 유리하며, 기능별로 담당 조직이 별도로 유지보수 가능.",
                                    "independence": "대출, 예약, 이력 기능을 개별 서비스 또는 마이크로서비스로 분리 배포 가능.",
                                    "performance": "조회·저장 트래픽이 업무별로 분산되어 대규모 운영 환경에서 성능 유지에 강점."
                                },
                                "cons": {
                                    "cohesion": "복합 업무(예: 대출+이력+상태변경 동시 처리) 트랜잭션이 여러 Aggregate에 분산되어 오케스트레이션 복잡도 증가.",
                                    "coupling": "상태·이력·업무별 이벤트 연동 로직이 늘어나 개발·운영이 어려워질 수 있음.",
                                    "consistency": "업무 전이와 이력 동시 반영이 eventual consistency 기반으로 이뤄질 때 순간적인 불일치 가능.",
                                    "encapsulation": "업무 경계가 명확한 만큼, 업무 연계 로직(예: 반납 시 예약자 존재 확인 및 상태 전이 등)이 Aggregate 외부에서 복잡하게 구성됨.",
                                    "complexity": "업무 규모가 작거나 이력 요구가 약한 환경에서는 과도한 분리로 인해 개발 오버헤드가 생김.",
                                    "independence": "업무간 데이터 흐름이 많을수록 cross-aggregate 트랜잭션 비용이 증가함.",
                                    "performance": "단일 업무에 대해 여러 Aggregate 조회/저장이 필요할 때 오버헤드가 발생할 수 있음."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LibraryCirculation",
                                    "alias": "도서관 대출/반납 관리",
                                    "displayName": "도서관 대출/반납 관리",
                                    "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                                    "aggregates": [
                                        {
                                            "name": "Loan",
                                            "alias": "대출"
                                        },
                                        {
                                            "name": "Reservation",
                                            "alias": "예약"
                                        },
                                        {
                                            "name": "LoanHistory",
                                            "alias": "대출 이력"
                                        }
                                    ]
                                },
                                "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                            }
                        ],
                        "conclusions": "1안은 대출/예약/이력 등 주요 업무 영역을 독립 Aggregate로 분리하여 역할과 책임이 명확해지고, 확장·감사 요구가 높은 조직에 적합하다. 2안은 업무 단위로만 분리해 구조가 단순하며, 일반 도서관이나 단일화된 대출/예약 관리 환경에 권장된다. 3안은 대규모 이력·상태 감사, 서비스 독립성, 마이크로서비스화가 핵심인 조직에 적합하지만, 운영·개발 복잡도가 높다.",
                        "defaultOptionIndex": 1,
                        "inference": "\n\n도서관 대출/반납 관리의 트랜잭션 일관성, 이벤트와 상태 전이, 대출/예약/이력 관리 등 업무 규칙을 고려하여 세 가지 옵션을 제안한다. 1안은 모든 대출 및 예약 트랜잭션을 Loan, Reservation, LoanHistory 단일 집합에 통합하여 강한 일관성을 보장한다. 2안은 대출(Loan)과 예약(Reservation)을 별도 Aggregate로 분리해 유통 이벤트 처리의 독립성을 높였다. 3안은 대출/예약/이력 모두 개별 Aggregate로 분리하여 확장성과 서비스 독립성을 극대화한다."
                    },
                    {
                        "boundedContext": "LibraryBookManagement",
                        "boundedContextAlias": "도서관리",
                        "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
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
                                    "cohesion": "도서 관리와 상태, 이력 관리가 하나의 Aggregate에서 원자적으로 처리되어 도서 라이프사이클 전체를 강력하게 보호한다.",
                                    "coupling": "외부 컨텍스트(Loan/Reservation)와는 ValueObject 참조만 있어 결합도가 낮고, 이벤트 기반 연동이 자연스럽다.",
                                    "consistency": "도서 상태 전이와 이력 기록, 폐기 처리가 단일 트랜잭션 내에서 보장된다.",
                                    "encapsulation": "상태 변경 및 이력 관리 규칙이 Book 내부에 은닉되어 구현 세부 정보 노출이 최소화된다.",
                                    "complexity": "단일 Aggregate로 관리해 개발자 입장에서 도서 관련 처리를 한 곳에서 쉽게 이해할 수 있다.",
                                    "independence": "도서의 관리 및 확장이 타 Aggregate와 독립적으로 이뤄진다.",
                                    "performance": "이력 및 상태 관리가 Book Aggregate 내에서 이뤄져 단건 조회 및 상태변경 작업이 신속하다."
                                },
                                "cons": {
                                    "cohesion": "상태 이력, 폐기 등 도서와 직접적이지 않은 세부 기능까지 통합되어 기능이 복잡해질 수 있다.",
                                    "coupling": "모든 도서 관련 작업이 하나의 Aggregate를 거치므로, 업무 부하가 높을 때 경합이 발생할 수 있다.",
                                    "consistency": "이력 데이터가 많아지면 트랜잭션 내 쓰기 비용이 증가하고 장기적으로 성능 저하 위험이 있다.",
                                    "encapsulation": "이력 관리가 커질수록 Book Aggregate의 크기와 복잡성이 증가해 일부 세부 규칙이 은닉되기 어려워질 수 있다.",
                                    "complexity": "비즈니스 로직이 커짐에 따라 테스트 및 유지보수가 어려워질 수 있다.",
                                    "independence": "상태 이력만 별도로 확장하고 싶을 때 구조적 제약이 생길 수 있다.",
                                    "performance": "도서 상태 변경 시마다 이력까지 함께 저장하므로, 대량 이력 기록이 누적될 때 성능 저하가 발생할 수 있다."
                                },
                                "isAIRecommended": false,
                                "boundedContext": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리",
                                    "displayName": "도서관리",
                                    "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ]
                                },
                                "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
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
                                        ]
                                    }
                                ],
                                "pros": {
                                    "cohesion": "Book과 BookStatusHistory가 각자의 명확한 역할(정보/상태 관리 vs 이력 관리)에 집중해 단일 책임 원칙이 잘 지켜진다.",
                                    "coupling": "Book과 이력 관리가 분리되어, 각 Aggregate별 변경이나 확장 시 상호 영향이 적다.",
                                    "consistency": "Book의 상태와 이력 기록이 분리되면서 장기 데이터 처리와 확장성이 용이하다.",
                                    "encapsulation": "이력 관리 로직이 BookStatusHistory에 은닉되어, 도서와 이력의 도메인 규칙 분리가 가능하다.",
                                    "complexity": "각 Aggregate가 단순하여 도메인, 개발, 테스트 모두 직관적으로 관리할 수 있다.",
                                    "independence": "상태 이력 확장이나 데이터 보관 정책 변화 시 Book에 영향 없이 변경이 가능하다.",
                                    "performance": "이력 데이터가 대용량이 되더라도 Book Aggregate의 성능 저하 없이 효율적 관리가 가능하다."
                                },
                                "cons": {
                                    "cohesion": "도서 상태 변경 시 이력 기록을 별도로 연계해야 하므로 업무 흐름이 분산된다.",
                                    "coupling": "이벤트 처리나 서비스 계층에서 Book과 BookStatusHistory의 트랜잭션 연계 로직을 추가 구현해야 한다.",
                                    "consistency": "상태 변경과 이력 기록이 각각의 트랜잭션 경계를 갖기 때문에 완전한 원자성이 보장되지 않을 수 있다.",
                                    "encapsulation": "상태 전이와 이력 동기화 규칙이 Aggregate 외부(서비스)에 노출된다.",
                                    "complexity": "도서 상태 변경/이력 저장 연동이 추가로 필요하여 업무 프로세스 구현이 복잡해질 수 있다.",
                                    "independence": "이력 데이터와 도서 데이터 간 동기화 오류 발생 가능성이 높아진다.",
                                    "performance": "이력과 Book을 동시에 조회할 때 추가 쿼리가 필요하므로 일부 복합 조회 시 응답 속도가 저하될 수 있다."
                                },
                                "isAIRecommended": true,
                                "boundedContext": {
                                    "name": "LibraryBookManagement",
                                    "alias": "도서관리",
                                    "displayName": "도서관리",
                                    "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                                    "aggregates": [
                                        {
                                            "name": "Book",
                                            "alias": "도서"
                                        }
                                    ]
                                },
                                "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                            }
                        ],
                        "conclusions": "옵션 1은 도서의 상태와 이력 관리, 폐기까지 모두 하나의 트랜잭션과 도메인 규칙으로 처리해야 하며, 상태 이력 데이터가 많지 않고 업무 복잡성이 낮은 환경에 적합하다. 옵션 2는 대용량 이력 관리, 이력 보관 정책 분리, 도서 정보와 상태 관리가 각자 확장돼야 하는 상황, 또는 도서/이력 데이터에 대한 운영 정책이 달라질 가능성이 있을 때 적합하다. 분산 트랜잭션이나 이벤트 기반 처리가 필수인 대형 도서관에는 옵션 2가 더 유리하다.",
                        "defaultOptionIndex": 1,
                        "inference": "\n\n요구사항과 이벤트, DDL, 컨텍스트 관계 및 누적된 초안을 종합 분석한 결과, Book(도서) Aggregate를 반드시 포함해야 하며, Loan/Reservation Aggregate는 이미 LibraryCirculation에 정의되어 있으므로 ValueObject를 통한 참조로 처리해야 한다. 도서 상태와 이력, 폐기 정보, 카테고리와 상태와 같은 열거형이 반드시 필요하다. 대출 이력과 상태 변경 이력의 관리 범위를 기준으로, 한 옵션은 Book 단일 Aggregate로 모든 도서 관리 기능을 통합하고, 또 다른 옵션은 Book과 BookStatusHistory를 분리해 집계 경계를 달리한다. 옵션별로 응집도, 일관성, 독립성, 성능 등에 차별화가 있도록 설계하였다."
                    }
                ],
                "draftUIInfos": {
                    "leftBoundedContextCount": 0,
                    "directMessage": "Generating options for 도서관리 Bounded Context... (5414 characters generated)",
                    "progress": 100
                },
                "isGeneratorButtonEnabled": true,
                "boundedContextVersion": 1,
                "retryInputs": {
                    "initialInputs": [
                        {
                            "boundedContext": {
                                "name": "LibraryCirculation",
                                "alias": "도서관 대출/반납 관리",
                                "displayName": "도서관 대출/반납 관리",
                                "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                                "aggregates": [
                                    {
                                        "name": "Loan",
                                        "alias": "대출"
                                    },
                                    {
                                        "name": "Reservation",
                                        "alias": "예약"
                                    },
                                    {
                                        "name": "LoanHistory",
                                        "alias": "대출 이력"
                                    }
                                ]
                            },
                            "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                        },
                        {
                            "boundedContext": {
                                "name": "LibraryBookManagement",
                                "alias": "도서관리",
                                "displayName": "도서관리",
                                "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                                "aggregates": [
                                    {
                                        "name": "Book",
                                        "alias": "도서"
                                    }
                                ]
                            },
                            "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                        }
                    ],
                    "initialAccumulatedDrafts": {
                        "LibraryCirculation": [
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
                            },
                            {
                                "aggregate": {
                                    "name": "LoanHistory",
                                    "alias": "대출 이력"
                                },
                                "enumerations": [],
                                "valueObjects": []
                            }
                        ],
                        "LibraryBookManagement": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "enumerations": [],
                                "valueObjects": []
                            }
                        ]
                    }
                },
                "selectedOptionItem": {
                    "LibraryCirculation": {
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
                                        "name": "LoanPeriodType",
                                        "alias": "대출 기간 구분"
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
                                    }
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "대출과 예약 업무에 집중되어 있어 각 도메인별 업무 프로세스 구현이 간결함.",
                            "coupling": "Loan과 Reservation 사이의 상호작용이 명확하며, 외부(Book) 참조만 존재하여 컨텍스트 결합도가 낮음.",
                            "consistency": "대출과 예약 상태 전이, 예약자 존재 시 도서 상태 전환 등은 Aggregate 내에서 원자적으로 처리 가능.",
                            "encapsulation": "핵심 대출/예약 불변성이 각 Aggregate 내부에서 보장되어 설계가 견고함.",
                            "complexity": "이력까지 별도 관리하지 않아 구조가 단순하고 입문자가 빠르게 이해할 수 있음.",
                            "independence": "대출/예약 정책 변경이나 확장 시 서로 영향을 최소화할 수 있음.",
                            "performance": "대출/예약 건수 기준 데이터 접근이 빠르고, 업무 처리량 확장에 유리함."
                        },
                        "cons": {
                            "cohesion": "대출/예약 이력이 별도 관리되지 않아 도서 상태 변동이나 이력 조회에 제약이 생김.",
                            "coupling": "상세 이력이나 복잡한 감사 로깅이 필요한 경우 애그리거트 외부 로직이 늘어남.",
                            "consistency": "과거 기록을 바탕으로 한 정책(예: 연체 누적 등) 적용이 어려움.",
                            "encapsulation": "도메인 이벤트 이력 추적이 약화되어, 감사 및 추적에 취약할 수 있음.",
                            "complexity": "이력 로직이 서비스 계층에 퍼질 경우 전체 시스템 구조가 산만해질 우려.",
                            "independence": "향후 감사/이력 요구사항이 증가하면 Aggregate 구조의 대대적 변경 필요.",
                            "performance": "복합 이력 조회(도서별 대출/예약/반납 현황 등)가 느려질 수 있음."
                        },
                        "boundedContext": {
                            "name": "LibraryCirculation",
                            "alias": "도서관 대출/반납 관리",
                            "displayName": "도서관 대출/반납 관리",
                            "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                            "aggregates": [
                                {
                                    "name": "Loan",
                                    "alias": "대출"
                                },
                                {
                                    "name": "Reservation",
                                    "alias": "예약"
                                },
                                {
                                    "name": "LoanHistory",
                                    "alias": "대출 이력"
                                }
                            ]
                        },
                        "description": "# Bounded Context Overview: LibraryCirculation (도서관 대출/반납 관리)\n\n## Role\n회원의 도서 대출 신청, 승인, 거절, 예약, 반납, 연장 등 도서의 유통과 관련된 모든 업무 프로세스와 이벤트를 담당하며, 대출/예약/반납/연체 상태를 일관성 있게 관리하고, 도서별 대출 및 상태 변경 이력을 추적하는 역할을 수행한다.\n\n## Key Events\n- LoanRequested\n- LoanApproved\n- LoanRejectedDueToBookNotAvailable\n- ReservationRequested\n- ReservationApproved\n- BookReturned\n- BookStateChangedAfterReturn\n- LoanExtended\n- LoanExtensionRejected\n- BookOverdue\n- BookHistoryViewed\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"LoanRequested\",\n  \"displayName\": \"도서 대출이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 4,\n  \"description\": \"회원이 도서명 또는 ISBN으로 도서를 검색하고, 회원번호와 이름으로 본인 인증 후 대출을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"회원명\",\n    \"도서명 또는 ISBN\",\n    \"대출 기간(7/14/30일)\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"LoanApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"LoanApproved\",\n  \"displayName\": \"도서 대출이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 5,\n  \"description\": \"대출 신청을 확인하여 도서 대출을 승인함. 도서 상태가 '대출중'으로 변경됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출가능'\"\n  ],\n  \"outputs\": [\n    \"대출 기록 생성\",\n    \"도서 상태 '대출중' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanRejectedDueToBookNotAvailable\",\n  \"displayName\": \"도서가 대출불가로 대출 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 6,\n  \"description\": \"도서가 이미 대출중이거나 폐기 등으로 대출이 불가능할 때 대출 신청이 거절됨.\",\n  \"inputs\": [\n    \"대출 신청 정보\",\n    \"도서 상태 '대출중' 또는 '폐기'\"\n  ],\n  \"outputs\": [\n    \"대출 거절 메시지\"\n  ],\n  \"nextEvents\": [\n    \"ReservationRequested\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationRequested\",\n  \"displayName\": \"도서 예약이 신청됨\",\n  \"actor\": \"Member\",\n  \"level\": 7,\n  \"description\": \"대출이 불가능한 도서에 대해 회원이 예약을 신청함.\",\n  \"inputs\": [\n    \"회원번호\",\n    \"도서 식별자\",\n    \"도서 상태 '대출중'\"\n  ],\n  \"outputs\": [\n    \"예약 신청 정보 생성\"\n  ],\n  \"nextEvents\": [\n    \"ReservationApproved\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"ReservationApproved\",\n  \"displayName\": \"도서 예약이 승인됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 8,\n  \"description\": \"예약 신청을 확인하고 예약을 승인함.\",\n  \"inputs\": [\n    \"예약 신청 정보\"\n  ],\n  \"outputs\": [\n    \"예약 기록 생성\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtended\",\n  \"displayName\": \"도서 대출이 연장됨\",\n  \"actor\": \"Member\",\n  \"level\": 11,\n  \"description\": \"대출 중인 도서에 대해 회원이 연장 신청을 하고, 연장 조건에 부합할 경우 대출 기간이 연장됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 가능 조건\"\n  ],\n  \"outputs\": [\n    \"대출 기간 연장\",\n    \"대출 기록 갱신\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"LoanExtensionRejected\",\n  \"displayName\": \"대출 연장이 거절됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 12,\n  \"description\": \"연장 조건 불충족(예: 예약자 존재, 최대 연장 횟수 초과 등) 시 대출 연장이 거절됨.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"연장 신청\",\n    \"연장 불가 사유\"\n  ],\n  \"outputs\": [\n    \"연장 거절 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookOverdue\",\n  \"displayName\": \"도서 대출이 연체됨\",\n  \"actor\": \"System\",\n  \"level\": 13,\n  \"description\": \"반납 예정일이 지나도 도서가 반납되지 않으면 자동으로 대출 상태가 '연체'로 변경됨.\",\n  \"inputs\": [\n    \"반납 예정일\",\n    \"반납 기록 미존재\"\n  ],\n  \"outputs\": [\n    \"대출 상태 '연체' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n```\n\n```sql\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n```\n\n```sql\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n```sql\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관리 (LibraryBookManagement)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                    },
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
                                ]
                            }
                        ],
                        "pros": {
                            "cohesion": "Book과 BookStatusHistory가 각자의 명확한 역할(정보/상태 관리 vs 이력 관리)에 집중해 단일 책임 원칙이 잘 지켜진다.",
                            "coupling": "Book과 이력 관리가 분리되어, 각 Aggregate별 변경이나 확장 시 상호 영향이 적다.",
                            "consistency": "Book의 상태와 이력 기록이 분리되면서 장기 데이터 처리와 확장성이 용이하다.",
                            "encapsulation": "이력 관리 로직이 BookStatusHistory에 은닉되어, 도서와 이력의 도메인 규칙 분리가 가능하다.",
                            "complexity": "각 Aggregate가 단순하여 도메인, 개발, 테스트 모두 직관적으로 관리할 수 있다.",
                            "independence": "상태 이력 확장이나 데이터 보관 정책 변화 시 Book에 영향 없이 변경이 가능하다.",
                            "performance": "이력 데이터가 대용량이 되더라도 Book Aggregate의 성능 저하 없이 효율적 관리가 가능하다."
                        },
                        "cons": {
                            "cohesion": "도서 상태 변경 시 이력 기록을 별도로 연계해야 하므로 업무 흐름이 분산된다.",
                            "coupling": "이벤트 처리나 서비스 계층에서 Book과 BookStatusHistory의 트랜잭션 연계 로직을 추가 구현해야 한다.",
                            "consistency": "상태 변경과 이력 기록이 각각의 트랜잭션 경계를 갖기 때문에 완전한 원자성이 보장되지 않을 수 있다.",
                            "encapsulation": "상태 전이와 이력 동기화 규칙이 Aggregate 외부(서비스)에 노출된다.",
                            "complexity": "도서 상태 변경/이력 저장 연동이 추가로 필요하여 업무 프로세스 구현이 복잡해질 수 있다.",
                            "independence": "이력 데이터와 도서 데이터 간 동기화 오류 발생 가능성이 높아진다.",
                            "performance": "이력과 Book을 동시에 조회할 때 추가 쿼리가 필요하므로 일부 복합 조회 시 응답 속도가 저하될 수 있다."
                        },
                        "boundedContext": {
                            "name": "LibraryBookManagement",
                            "alias": "도서관리",
                            "displayName": "도서관리",
                            "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.",
                            "aggregates": [
                                {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            ]
                        },
                        "description": "# Bounded Context Overview: LibraryBookManagement (도서관리)\n\n## Role\n신규 도서 등록, ISBN 중복 확인, 도서 정보 및 상태(대출가능/대출중/예약중/폐기) 관리, 도서 폐기 등 도서의 라이프사이클을 책임지고, 도서 상태 변화 이벤트를 발행한다.\n\n## Key Events\n- BookRegistered\n- BookRegistrationFailedDueToDuplicateISBN\n- BookDiscarded\n- BookStateChangedAfterReturn\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서가 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서를 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력하고 ISBN 중복 검증을 통과하여 등록함.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\",\n    \"ISBN 중복 없음\"\n  ],\n  \"outputs\": [\n    \"새로운 도서 엔티티 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookRegistrationFailedDueToDuplicateISBN\",\n  \"displayName\": \"ISBN 중복으로 도서 등록 실패됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 2,\n  \"description\": \"입력된 ISBN이 이미 존재하여 도서 등록이 거부됨.\",\n  \"inputs\": [\n    \"입력된 ISBN\",\n    \"기존 도서의 ISBN\"\n  ],\n  \"outputs\": [\n    \"등록 실패 메시지\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서가 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 3,\n  \"description\": \"도서가 훼손 또는 분실로 폐기 처리되어, 더 이상 대출이 불가능해짐.\",\n  \"inputs\": [\n    \"폐기 사유\",\n    \"도서 식별자\",\n    \"도서 상태 != '폐기'\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookReturned\",\n  \"displayName\": \"도서가 반납됨\",\n  \"actor\": \"Member\",\n  \"level\": 9,\n  \"description\": \"회원이 대출한 도서를 반납함. 반납 즉시 도서 상태 변경 처리 필요.\",\n  \"inputs\": [\n    \"대출 정보\",\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"반납 기록 생성\",\n    \"대출 상태 '반납완료'\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChangedAfterReturn\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChangedAfterReturn\",\n  \"displayName\": \"반납 후 도서 상태가 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 10,\n  \"description\": \"도서가 반납되면 예약자가 있으면 도서 상태를 '예약중', 없으면 '대출가능'으로 자동 변경.\",\n  \"inputs\": [\n    \"도서 식별자\",\n    \"예약 대기자 존재 여부\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '예약중' 또는 '대출가능' 변경\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n```json\n{\n  \"name\": \"BookHistoryViewed\",\n  \"displayName\": \"도서 이력이 조회됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 14,\n  \"description\": \"도서별로 대출 이력과 상태 변경 이력을 조회하여 현황 및 이력 확인.\",\n  \"inputs\": [\n    \"도서 식별자\"\n  ],\n  \"outputs\": [\n    \"대출 이력 목록\",\n    \"상태 변경 이력\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## DDL\n\n```sql\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n```\n\n```sql\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n```\n\n\n## Context Relations\n\n### BookStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: sends to 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함.\n\n### LoanStatusEventPubSub\n- **Type**: Pub/Sub\n- **Direction**: receives from 도서관 대출/반납 관리 (LibraryCirculation)\n- **Reason**: 도서의 상태 변경(예: 폐기, 신규등록, 상태전이)이 대출/예약 등 유통 프로세스에 영향을 미치므로 이벤트 발행 방식으로 연결, 두 컨텍스트 간 결합도를 최소화함.\n- **Interaction Pattern**: 도서 상태가 변경될 때마다 이벤트를 발행하여 대출/반납 컨텍스트에서 이를 구독·반영함."
                    }
                }
            }
        ]
    }
}