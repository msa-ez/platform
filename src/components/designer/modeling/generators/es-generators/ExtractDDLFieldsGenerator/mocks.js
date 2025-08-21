export const extractDDLFieldsGeneratorInputs = {
    "ddl": `
-- 회원 테이블
CREATE TABLE members (
    member_id VARCHAR(20) PRIMARY KEY, -- 사용자의 고유 아이디
    member_name VARCHAR(100) NOT NULL, -- 이름
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- 회원 상태: 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- some_invalid_field //E.g.'pendingReview'
    \`회원유형\` VARCHAR(10) -- '정회원', '준회원'
);

-- 도서 테이블
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    author VARCHAR(200) NOT NULL,
    publisher VARCHAR(200) NOT NULL,
    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL, --//카테고리
    -- 대출 상태: '대출가능', '대출중', '예약중', '폐기'
    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    disposal_date DATETIME NULL,
    disposal_reason TEXT NULL, -- //폐기사유
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_isbn (isbn),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

/*
CREATE TABLE reviews (
    review_id INT, --//리뷰ID
    \`리뷰내용\` TEXT,
    -- //반려사유
    rejection_reason TEXT,
    //검수상태:'대기', '승인'
    review_status ENUM('PENDING', 'APPROVED', 'REJECTED')
);
*/
`,
    "boundedContextName": "BookManagement"
}