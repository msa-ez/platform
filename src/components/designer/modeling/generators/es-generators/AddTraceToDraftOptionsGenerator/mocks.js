export const AddTraceToDraftOptionsGeneratorInputs = [
    {
        "generatedDraftOptions": [
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
                                "name": "BookSpecification",
                                "alias": "도서 상세 정보",
                                "referencedAggregateName": ""
                            },
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
                    "cohesion": "도서의 등록, 상태 관리, 폐기 등 모든 도서 관련 기능이 Book Aggregate 내에 집중되어 있어 일관된 트랜잭션 경계를 제공한다.",
                    "coupling": "외부 컨텍스트(대출, 예약, 이력)와의 의존성을 ValueObject 참조로만 유지하여 결합도가 낮다.",
                    "consistency": "도서 상태 변경, 폐기 등 핵심 비즈니스 규칙을 Aggregate 내부에서 원자적으로 보장할 수 있다.",
                    "encapsulation": "도서의 상태, 상세 정보, 대출/예약 참조 등 도서 관리의 모든 세부 구현이 Aggregate 내부에 은닉된다.",
                    "complexity": "단일 Aggregate로 구조가 단순하며, 도서 관리 업무에 대한 이해와 유지보수가 용이하다.",
                    "independence": "도서 관리 정책 변경이 Aggregate 단위로 독립적으로 이루어질 수 있다.",
                    "performance": "단일 Aggregate 접근으로 도서 상태 및 정보 조회·변경 시 쿼리 효율이 높다."
                },
                "cons": {
                    "cohesion": "상태 이력, 대출/예약 참조 등 다양한 책임이 한 Aggregate에 집중되어 도서 관리가 복잡해질 수 있다.",
                    "coupling": "도서 상태 이력 등 확장 요구가 생기면 Aggregate 크기가 커져 외부 시스템과의 연동이 어려워질 수 있다.",
                    "consistency": "상태 이력 등 대용량 데이터가 누적될 경우 트랜잭션 처리에 부담이 될 수 있다.",
                    "encapsulation": "상태 이력, 대출/예약 등 서로 다른 도메인 관심사가 한 Aggregate에 혼재되어 캡슐화가 약해질 수 있다.",
                    "complexity": "도서 관리 업무가 확장될수록 Aggregate가 비대해져 도메인 복잡도가 증가한다.",
                    "independence": "상태 이력, 대출/예약 등 세부 기능 변경 시 전체 Aggregate에 영향이 갈 수 있다.",
                    "performance": "상태 이력, 대출/예약 등 데이터가 누적될수록 단일 Aggregate 접근 시 성능 저하가 발생할 수 있다."
                },
                "isAIRecommended": false
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
                                "name": "BookSpecification",
                                "alias": "도서 상세 정보",
                                "referencedAggregateName": ""
                            },
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
                    "cohesion": "도서 정보와 상태 변경 이력을 별도 Aggregate로 분리해 각자의 책임과 라이프사이클을 명확히 구분한다.",
                    "coupling": "상태 이력 관리가 Book Aggregate와 분리되어, 이력 확장·변경 시 도서 관리에 영향이 적다.",
                    "consistency": "도서 상태 변경과 이력 기록이 분리되어 대용량 이력 데이터 관리에 유리하다.",
                    "encapsulation": "상태 이력 관리의 세부 구현이 BookStatusHistory Aggregate에 은닉되어 도서 관리와 분리된다.",
                    "complexity": "도서 관리와 상태 이력 관리가 분리되어 각 Aggregate의 복잡도가 낮아진다.",
                    "independence": "상태 이력 관리 정책 변경이 BookStatusHistory Aggregate 단위로 독립적으로 가능하다.",
                    "performance": "상태 이력 데이터가 많아져도 Book Aggregate의 성능 저하 없이 이력만 별도로 관리할 수 있다."
                },
                "cons": {
                    "cohesion": "도서 상태 변경 시 이력 기록을 위해 두 Aggregate 간의 오케스트레이션이 필요하다.",
                    "coupling": "상태 변경 트랜잭션이 두 Aggregate에 걸쳐 발생하므로, 일관성 보장을 위해 추가적인 처리 로직이 필요하다.",
                    "consistency": "상태 변경과 이력 기록이 분리되어 일시적으로 데이터 불일치가 발생할 수 있다.",
                    "encapsulation": "상태 변경과 이력 기록에 대한 비즈니스 규칙이 Aggregate 외부(Application Service 등)에서 관리되어야 한다.",
                    "complexity": "두 Aggregate 간의 연동 및 트랜잭션 관리 로직이 추가되어 시스템 복잡도가 증가한다.",
                    "independence": "도서 상태 변경과 이력 기록의 동기화 정책 변경 시 두 Aggregate 모두에 영향이 갈 수 있다.",
                    "performance": "상태 변경 시 두 Aggregate를 모두 접근해야 하므로 트랜잭션 처리 비용이 증가할 수 있다."
                },
                "isAIRecommended": true
            }
        ],
        "boundedContextName": "BookManagement",
        "functionalRequirements": `# Bounded Context Overview: BookManagement (도서 관리)

## Role
도서 등록, 상태 관리, 폐기 처리를 담당하며 도서의 생애주기와 상태 변화를 관리한다.

## Key Events
- BookRegistered
- BookStatusChanged
- BookDisposed

# Requirements

## userStory

도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야

도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할

## DDL

\`\`\`sql
도서 테이블
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
\`\`\`
\`\`\`sql
도서 상태 변경 이력 테이블
CREATE TABLE book_status_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    previous_status ENUM('대출가능', '대출중', '예약중', '폐기'),
    new_status ENUM('대출가능', '대출중', '예약중', '폐기') NOT NULL,
    change_reason VARCHAR(200),
    changed_by VARCHAR(100),
    change_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    INDEX idx_book_id (book_id),
    INDEX idx_change_date (change_date)
);
\`\`\`
## Event

\`\`\`json
{
  "name": "BookRegistered",
  "displayName": "도서 등록됨",
  "actor": "Librarian",
  "level": 1,
  "description": "사서가 새로운 도서를 등록하여 도서관 시스템에 추가하였음. 등록 시 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증이 완료됨.",
  "inputs": [
    "도서명",
    "ISBN(13자리)",
    "저자",
    "출판사",
    "카테고리(소설/비소설/학술/잡지)"
  ],
  "outputs": [
    "신규 도서 정보",
    "도서 상태: 대출가능"
  ],
  "nextEvents": [
    "BookStatusChanged"
  ]
}
\`\`\`

\`\`\`json
{
  "name": "BookStatusChanged",
  "displayName": "도서 상태 변경됨",
  "actor": "System",
  "level": 2,
  "description": "도서의 대출/반납/예약/폐기 등 상태 변화가 발생하여 도서 상태가 자동 또는 수동으로 변경됨.",
  "inputs": [
    "도서 상태 변경 트리거(대출, 반납, 예약, 폐기 등)",
    "도서 식별자"
  ],
  "outputs": [
    "변경된 도서 상태"
  ],
  "nextEvents": [
    "BookDisposed",
    "BookLoaned",
    "BookReturned",
    "BookReserved"
  ]
}
\`\`\`

\`\`\`json
{
  "name": "BookDisposed",
  "displayName": "도서 폐기됨",
  "actor": "Librarian",
  "level": 3,
  "description": "도서가 훼손 또는 분실되어 사서에 의해 폐기 처리됨. 폐기된 도서는 더 이상 대출이 불가능함.",
  "inputs": [
    "도서 식별자",
    "폐기 사유"
  ],
  "outputs": [
    "도서 상태: 폐기"
  ],
  "nextEvents": []
}
\`\`\`

## Context Relations

### BookManagement-LoanAndReservation
- **Type**: Pub/Sub
- **Direction**: sends to 대출/반납 및 예약 (LoanAndReservation)
- **Reason**: 도서 상태 변경(대출가능, 대출중, 예약중, 폐기 등)이 발생하면 대출/반납 및 예약 컨텍스트에서 이를 구독하여 대출/예약 프로세스에 반영한다.
- **Interaction Pattern**: 도서 관리에서 도서 상태 변경 이벤트를 발행하면 대출/반납 및 예약 컨텍스트가 이를 구독하여 처리한다.

### BookManagement-LoanHistory
- **Type**: Pub/Sub
- **Direction**: sends to 이력 관리 (LoanHistory)
- **Reason**: 도서 등록, 폐기 등 도서 상태 변화 이력도 이력 관리 컨텍스트에서 기록할 수 있도록 이벤트를 발행한다.
- **Interaction Pattern**: 도서 관리에서 도서 등록, 폐기 등 상태 변화 이벤트를 발행하면 이력 관리 컨텍스트가 이를 구독하여 상태 변경 이력을 기록한다.`,
        "traceMap": {
            "4": {
                "refs": [
                    [
                        [
                            3,
                            2
                        ],
                        [
                            3,
                            265
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            264
                        ],
                        [
                            3,
                            302
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
                            301
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
                            63
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
                            24,
                            6
                        ]
                    ]
                ],
                "isDirectMatching": true
            },
            "23": {
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
            "24": {
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
            "25": {
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
            "26": {
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
            "27": {
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
            "28": {
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
            "29": {
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
            "30": {
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
            "31": {
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
            "32": {
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
            "33": {
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
            "34": {
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
            "35": {
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
            "36": {
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
            "37": {
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
            "38": {
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
            "39": {
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
            "40": {
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
            "43": {
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
            "44": {
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
            "45": {
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
            "46": {
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
            "47": {
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
            "48": {
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
            "49": {
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
            "50": {
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
            "51": {
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
            "52": {
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
            "53": {
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
            "54": {
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
            "55": {
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
            "60": {
                "refs": [
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                    ],
                    [
                        [
                            3,
                            136
                        ],
                        [
                            3,
                            161
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            191
                        ],
                        [
                            3,
                            238
                        ]
                    ],
                    [
                        [
                            3,
                            264
                        ],
                        [
                            3,
                            302
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
                            175
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            302
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
                            203
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
                            203
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
                            203
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
                            203
                        ]
                    ]
                ],
                "isDirectMatching": false
            },
            "133": {
                "refs": [
                    [
                        [
                            3,
                            1
                        ],
                        [
                            9,
                            67
                        ]
                    ]
                ],
                "isDirectMatching": false
            },
            "134": {
                "refs": [
                    [
                        [
                            3,
                            1
                        ],
                        [
                            9,
                            67
                        ]
                    ]
                ],
                "isDirectMatching": false
            },
            "135": {
                "refs": [
                    [
                        [
                            3,
                            1
                        ],
                        [
                            9,
                            67
                        ]
                    ]
                ],
                "isDirectMatching": false
            },
            "136": {
                "refs": [
                    [
                        [
                            3,
                            1
                        ],
                        [
                            9,
                            67
                        ]
                    ]
                ],
                "isDirectMatching": false
            }
        }
    }
]