export const extractDDLFieldsGeneratorInputs = {
    "ddl": `
-- 회원 테이블
CREATE TABLE members (
    member_id VARCHAR(20) PRIMARY KEY,
    member_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 도서 테이블
CREATE TABLE books (
    book_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    author VARCHAR(200) NOT NULL,
    publisher VARCHAR(200) NOT NULL,
    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,
    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    disposal_date DATETIME NULL,
    disposal_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title),
    INDEX idx_isbn (isbn),
    INDEX idx_status (status),
    INDEX idx_category (category)
);
`
}