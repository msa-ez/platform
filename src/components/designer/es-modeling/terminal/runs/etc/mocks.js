export const mockedProgressDto = {
    generateDone: false,
    displayMessage: "Mock Message",
    thinkMessage: "Mock Think Message\n",
    progress: 50,
    globalProgress: 25,
    actions: {
        stopGeneration: () => {
            alert("stopGeneration 호출")
        }
    }
}

export const mockedTraceInfoViewerDto = {
    isShow: true,
    userInputs: {
        "userStory": "도서관의 도서 관리와 대출/반납을 통합적으로 관리하는 화면을 만들려고 해.\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\n\n대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n",
        "ddl": "-- 회원 테이블\nCREATE TABLE members (\n    member_id VARCHAR(20) PRIMARY KEY,\n    member_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    email VARCHAR(100),\n    address TEXT,\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n);\n\n-- 도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);\n\n-- 대출 테이블\nCREATE TABLE loans (\n    loan_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    due_date DATETIME NOT NULL,\n    return_date DATETIME NULL,\n    loan_period_days INT NOT NULL CHECK (loan_period_days IN (7, 14, 30)),\n    status ENUM('대출중', '연체', '반납완료', '연장') DEFAULT '대출중',\n    extension_count INT DEFAULT 0,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_due_date (due_date)\n);\n\n-- 예약 테이블\nCREATE TABLE reservations (\n    reservation_id INT AUTO_INCREMENT PRIMARY KEY,\n    member_id VARCHAR(20) NOT NULL,\n    book_id INT NOT NULL,\n    reservation_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    status ENUM('예약중', '예약완료', '예약취소', '예약만료') DEFAULT '예약중',\n    notification_sent BOOLEAN DEFAULT FALSE,\n    expiry_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (member_id) REFERENCES members(member_id),\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_member_id (member_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_status (status),\n    INDEX idx_reservation_date (reservation_date)\n);\n\n-- 도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);\n\n-- 대출 이력 테이블 (모든 대출 활동의 상세 로그)\nCREATE TABLE loan_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    action_type ENUM('대출', '반납', '연장', '연체알림', '분실신고') NOT NULL,\n    action_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    previous_due_date DATETIME NULL,\n    new_due_date DATETIME NULL,\n    notes TEXT,\n    processed_by VARCHAR(100),\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_action_type (action_type),\n    INDEX idx_action_date (action_date)\n);\n\n-- 연체 관리 테이블\nCREATE TABLE overdue_records (\n    overdue_id INT AUTO_INCREMENT PRIMARY KEY,\n    loan_id INT NOT NULL,\n    overdue_days INT NOT NULL,\n    fine_amount DECIMAL(10,2) DEFAULT 0.00,\n    fine_paid BOOLEAN DEFAULT FALSE,\n    notification_count INT DEFAULT 0,\n    last_notification_date DATETIME NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),\n    INDEX idx_loan_id (loan_id),\n    INDEX idx_overdue_days (overdue_days)\n);"
    },
    directRefInfos: {
        refs: [
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
            ]
        ]
    }
}

export const mockedUIComponent = {
	"_type": "org.uengine.modeling.model.UI",
	"aggregate": {
		"id": "5f3bc451-33ba-4520-93a5-4f704d4c73b5"
	},
	"author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
	"boundedContext": {
		"id": "14f1fcf0-554b-4cfe-96af-7c5a675c14e2"
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
		"id": "280c8ada-cc07-47f7-839e-012f1c188bb3"
	},
	"description": "- Used SiteMap Title: 도서 관리\n- Used SiteMap Description: 도서 등록, 상태 관리, 폐기 처리를 위한 화면입니다.\n* Inference(When generating the wireframe)\n이번 도서 등록 UI는 '도서 관리'라는 상위 컨텍스트 내에서 도서 등록, 상태 관리, 폐기 처리 등 다양한 기능 중 도서 등록 부분만을 담당하는 컴포넌트로 설계해야 한다. 필드는 도서명, ISBN(13자리 숫자, 중복 확인 필요), 저자, 출판사, 카테고리(소설/비소설/학술/잡지 선택)로 구성된다. 모든 필드는 필수는 아니지만, ISBN 입력란에는 13자리 숫자 제한과 중복 확인 버튼, 카테고리는 드롭다운으로 구현한다. UI는 도서 관리의 일부로서, 상단에 '도서 등록' 섹션 타이틀과 간단한 설명을 추가해 맥락을 명확히 하고, 입력 폼은 시각적 구분을 위해 카드 형태로 배치한다. 각 입력 필드는 명확한 레이블과 적절한 placeholder, ISBN 입력란 옆에 중복 확인 버튼을 배치한다. 버튼은 기본 스타일 가이드(Primary #007bff, Secondary #6c757d)를 따른다. 폼 하단에는 등록 버튼을 배치하고, 입력 예시 데이터와 에러 상태(예: ISBN 자리수 오류)를 시각적으로 표현한다. 접근성을 위해 label-for, aria-label 등을 활용한다. 전체적으로 컨테이너 내에서 적절한 여백과 정렬, 시각적 계층 구조를 유지한다.\n",
	"displayName": "도서 등록 UI",
	"elementView": {
		"_type": "org.uengine.modeling.model.UI",
		"height": 100,
		"id": "9cecb8eb-07bb-453b-bd82-f8b3acc7d802",
		"style": {},
		"width": 100,
		"x": 490,
		"y": 280
	},
	"generateDescription": "",
	"grid": {
		"columns": []
	},
	"id": "9cecb8eb-07bb-453b-bd82-f8b3acc7d802",
	"name": "RegisterBookUI",
	"nameCamelCase": "registerbookui",
	"namePascalCase": "Registerbookui",
	"namePlural": "registerbookuis",
	"oldName": "",
	"readModel": null,
	"referencedSiteMapId": "nav-book-mgmt",
	"rotateStatus": false,
	"runTimeTemplateHtml": "<div style=\"max-width:600px; margin:0 auto; padding:24px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;\">\n  <div style=\"margin-bottom:24px;\">\n    <h2 style=\"font-size:22px; color:#333; margin-bottom:6px;\">도서 등록</h2>\n    <p style=\"font-size:14px; color:#666; margin:0;\">새로운 도서를 등록하려면 아래 정보를 입력하세요.</p>\n  </div>\n  <div style=\"background:#fff; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.07); padding:32px;\">\n    <form style=\"display:flex; flex-direction:column; gap:18px;\">\n      <div>\n        <label for=\"title\" style=\"display:block; margin-bottom:6px; font-weight:500; color:#555;\">도서명</label>\n        <input type=\"text\" id=\"title\" name=\"title\" placeholder=\"예: UI/UX 디자인 원리\" style=\"width:100%; padding:12px; border:2px solid #ddd; border-radius:4px; font-size:16px; box-sizing:border-box;\">\n      </div>\n      <div>\n        <label for=\"isbn\" style=\"display:block; margin-bottom:6px; font-weight:500; color:#555;\">ISBN</label>\n        <div style=\"display:flex; gap:8px; align-items:center;\">\n          <input type=\"text\" id=\"isbn\" name=\"isbn\" maxlength=\"13\" pattern=\"\\d{13}\" aria-label=\"ISBN 13자리 숫자\" placeholder=\"예: 9781234567890\" style=\"flex:1; padding:12px; border:2px solid #dc3545; border-radius:4px; font-size:16px; box-sizing:border-box;\">\n          <button type=\"button\" style=\"background:#6c757d; color:#fff; border:none; padding:10px 16px; border-radius:4px; font-size:14px; cursor:pointer;\">중복 확인</button>\n        </div>\n        <div style=\"margin-top:4px; font-size:12px; color:#dc3545;\">13자리 숫자를 입력하세요.</div>\n      </div>\n      <div>\n        <label for=\"author\" style=\"display:block; margin-bottom:6px; font-weight:500; color:#555;\">저자</label>\n        <input type=\"text\" id=\"author\" name=\"author\" placeholder=\"예: 홍길동\" style=\"width:100%; padding:12px; border:2px solid #ddd; border-radius:4px; font-size:16px; box-sizing:border-box;\">\n      </div>\n      <div>\n        <label for=\"publisher\" style=\"display:block; margin-bottom:6px; font-weight:500; color:#555;\">출판사</label>\n        <input type=\"text\" id=\"publisher\" name=\"publisher\" placeholder=\"예: 한빛미디어\" style=\"width:100%; padding:12px; border:2px solid #ddd; border-radius:4px; font-size:16px; box-sizing:border-box;\">\n      </div>\n      <div>\n        <label for=\"category\" style=\"display:block; margin-bottom:6px; font-weight:500; color:#555;\">카테고리</label>\n        <select id=\"category\" name=\"category\" style=\"width:100%; padding:12px; border:2px solid #ddd; border-radius:4px; font-size:16px; box-sizing:border-box;\">\n          <option value=\"\" disabled selected>카테고리 선택</option>\n          <option value=\"novel\">소설</option>\n          <option value=\"nonfiction\">비소설</option>\n          <option value=\"academic\">학술</option>\n          <option value=\"magazine\">잡지</option>\n        </select>\n      </div>\n      <button type=\"submit\" style=\"background:#007bff; color:#fff; border:none; padding:14px 0; border-radius:4px; font-size:16px; font-weight:500; cursor:pointer; margin-top:8px;\">도서 등록</button>\n    </form>\n  </div>\n</div>",
	"uiType": "Chart"
}