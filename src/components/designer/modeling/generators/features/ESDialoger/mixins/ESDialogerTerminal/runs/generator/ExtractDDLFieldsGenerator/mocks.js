export const extractDDLFieldsGeneratorInput = {
    "ddlRequirements": [
        {
            "text": "도서 테이블\nCREATE TABLE books (\n    book_id INT AUTO_INCREMENT PRIMARY KEY,\n    title VARCHAR(500) NOT NULL,\n    isbn VARCHAR(13) UNIQUE NOT NULL,\n    author VARCHAR(200) NOT NULL,\n    publisher VARCHAR(200) NOT NULL,\n    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,\n    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',\n    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    disposal_date DATETIME NULL,\n    disposal_reason TEXT NULL,\n    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,\n    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_title (title),\n    INDEX idx_isbn (isbn),\n    INDEX idx_status (status),\n    INDEX idx_category (category)\n);",
            "refs": [
                [
                    [
                        24,
                        4
                    ],
                    [
                        42,
                        2
                    ]
                ]
            ]
        },
        {
            "text": "도서 상태 변경 이력 테이블\nCREATE TABLE book_status_history (\n    history_id INT AUTO_INCREMENT PRIMARY KEY,\n    book_id INT NOT NULL,\n    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),\n    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,\n    change_reason VARCHAR(200),\n    changed_by VARCHAR(100),\n    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (book_id) REFERENCES books(book_id),\n    INDEX idx_book_id (book_id),\n    INDEX idx_change_date (change_date)\n);",
            "refs": [
                [
                    [
                        84,
                        4
                    ],
                    [
                        96,
                        2
                    ]
                ]
            ]
        }
    ],
    "boundedContextName": "BookManagement"
}

export const DDLLineRefSplitterInput = {
    sanitizedRefs: [
        {
            "fieldName": "book_id",
            "refs": [
                [
                    [
                        3,
                        5
                    ],
                    [
                        22,
                        5
                    ]
                ],
                [
                    [
                        23,
                        5
                    ],
                    [
                        23,
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
                        4,
                        5
                    ],
                    [
                        4,
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
                        5,
                        5
                    ],
                    [
                        5,
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
                        6,
                        5
                    ],
                    [
                        6,
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
                        7,
                        5
                    ],
                    [
                        7,
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
                        10,
                        5
                    ],
                    [
                        10,
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
                        11,
                        5
                    ],
                    [
                        11,
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
                        12,
                        5
                    ],
                    [
                        12,
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
                        13,
                        5
                    ],
                    [
                        13,
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
                        14,
                        5
                    ],
                    [
                        14,
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
                        22,
                        5
                    ],
                    [
                        22,
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
                        24,
                        5
                    ],
                    [
                        24,
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
                        25,
                        5
                    ],
                    [
                        25,
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
                        26,
                        5
                    ],
                    [
                        26,
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
                        27,
                        5
                    ],
                    [
                        27,
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
                        28,
                        5
                    ],
                    [
                        28,
                        50
                    ]
                ]
            ]
        }
    ],
    ddlLines: [
        "도서 테이블",
        "CREATE TABLE books (",
        "    book_id INT AUTO_INCREMENT PRIMARY KEY,",
        "    title VARCHAR(500) NOT NULL,",
        "    isbn VARCHAR(13) UNIQUE NOT NULL,",
        "    author VARCHAR(200) NOT NULL,",
        "    publisher VARCHAR(200) NOT NULL,",
        "    category ENUM('소설', '비소설', '학술', '잡지') NOT NULL,",
        "    status ENUM('대출가능', '대출중', '예약중', '폐기') DEFAULT '대출가능',",
        "    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,",
        "    disposal_date DATETIME NULL,",
        "    disposal_reason TEXT NULL,",
        "    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,",
        "    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,",
        "    INDEX idx_title (title),",
        "    INDEX idx_isbn (isbn),",
        "    INDEX idx_status (status),",
        "    INDEX idx_category (category)",
        ");",
        "",
        "도서 상태 변경 이력 테이블",
        "CREATE TABLE book_status_history (",
        "    history_id INT AUTO_INCREMENT PRIMARY KEY,",
        "    book_id INT NOT NULL,",
        "    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),",
        "    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,",
        "    change_reason VARCHAR(200),",
        "    changed_by VARCHAR(100),",
        "    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,",
        "    FOREIGN KEY (book_id) REFERENCES books(book_id),",
        "    INDEX idx_book_id (book_id),",
        "    INDEX idx_change_date (change_date)",
        ");"
    ],
    lineTraceMap: {
        "1": 24,
        "2": 25,
        "3": 26,
        "4": 27,
        "5": 28,
        "6": 29,
        "7": 30,
        "8": 31,
        "9": 32,
        "10": 33,
        "11": 34,
        "12": 35,
        "13": 36,
        "14": 37,
        "15": 38,
        "16": 39,
        "17": 40,
        "18": 41,
        "19": 42,
        "20": 43,
        "21": 84,
        "22": 85,
        "23": 86,
        "24": 87,
        "25": 88,
        "26": 89,
        "27": 90,
        "28": 91,
        "29": 92,
        "30": 93,
        "31": 94,
        "32": 95,
        "33": 96
    }
}