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
                                "name": "ISBN",
                                "alias": "ISBN",
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
                            },
                            {
                                "name": "LoanHistoryReference",
                                "alias": "대출 이력 참조",
                                "referencedAggregate": {
                                    "name": "LoanHistory",
                                    "alias": "대출 이력"
                                }
                            },
                            {
                                "name": "BookStatusHistoryReference",
                                "alias": "도서 상태 이력 참조",
                                "referencedAggregate": {
                                    "name": "BookStatusHistory",
                                    "alias": "도서 상태 이력"
                                }
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "도서 등록, 상태변경, 폐기 등 모든 도서 관련 비즈니스 로직이 한 Aggregate 내에서 집중적으로 관리되어 높은 응집도를 보장한다.",
                    "coupling": "외부 컨텍스트(대출, 예약, 이력)와의 관계가 ValueObject 참조로 단방향으로만 연결되어 결합도가 낮다.",
                    "consistency": "ISBN 중복, 도서 상태 변경 등 핵심 불변식이 단일 트랜잭션 내에서 강하게 보장된다.",
                    "encapsulation": "도서 상태 및 관리 규칙이 Aggregate 내부에 잘 은닉되어 시스템 전체의 일관성이 높다.",
                    "complexity": "단일 Aggregate 구조로 인해 개발 및 이해가 용이하며, 코드 복잡성이 낮다.",
                    "independence": "외부 컨텍스트와의 의존성이 ValueObject 참조에 그쳐 도서 관리 도메인의 독립적 진화가 가능하다.",
                    "performance": "도서 한 건의 조회, 상태 변경이 Aggregate 단일 조회/갱신으로 처리되어 성능상 이점이 있다."
                },
                "cons": {
                    "cohesion": "카테고리 등 도서 정보와 상태 관리 이력이 모두 포함되어 확장 시 책임이 커질 수 있다.",
                    "coupling": "모든 도서 관리 변경이 Book Aggregate에 집중되어 변경 영향도가 높아질 수 있다.",
                    "consistency": "도서 데이터가 대규모일 때 단일 Aggregate로 인한 락 경합이 발생할 수 있다.",
                    "encapsulation": "확장이나 팀 분업 시 상태 이력 등 세부 영역의 은닉이 상대적으로 약하다.",
                    "complexity": "도서 도메인 모든 책임이 집중되어 큰 도서 관리 시스템에서 기능 분리가 어려울 수 있다.",
                    "independence": "카테고리 분류 정책 등 변화가 많을 때 도서 전체에 영향을 줄 수 있다.",
                    "performance": "상태 변경 이력, 대출 이력 등 연관 정보까지 모두 Aggregate에 포함될 경우 대용량 처리에 부하가 발생할 수 있다."
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
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "ISBN",
                                "alias": "ISBN",
                                "referencedAggregateName": ""
                            },
                            {
                                "name": "CategoryReference",
                                "alias": "카테고리 참조",
                                "referencedAggregate": {
                                    "name": "Category",
                                    "alias": "카테고리"
                                }
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
                            },
                            {
                                "name": "LoanHistoryReference",
                                "alias": "대출 이력 참조",
                                "referencedAggregate": {
                                    "name": "LoanHistory",
                                    "alias": "대출 이력"
                                }
                            },
                            {
                                "name": "BookStatusHistoryReference",
                                "alias": "도서 상태 이력 참조",
                                "referencedAggregate": {
                                    "name": "BookStatusHistory",
                                    "alias": "도서 상태 이력"
                                }
                            }
                        ]
                    },
                    {
                        "aggregate": {
                            "name": "Category",
                            "alias": "카테고리"
                        },
                        "enumerations": [
                            {
                                "name": "BookCategory",
                                "alias": "도서 카테고리"
                            }
                        ],
                        "valueObjects": []
                    }
                ],
                "pros": {
                    "cohesion": "Book과 Category 영역을 분리해 도서 정보 관리와 카테고리 정책 변경의 독립성이 높다.",
                    "coupling": "카테고리 정책 및 구조 변경이 Book Aggregate에 직접적 영향을 주지 않아 결합도가 낮다.",
                    "consistency": "카테고리 변경/확장/통합 등 정책 변경 시 Book 도메인에 영향 없이 독립적으로 일관성 있게 처리 가능하다.",
                    "encapsulation": "카테고리 정책의 관리 및 은닉이 Category Aggregate 내부에 잘 구현된다.",
                    "complexity": "카테고리별 규칙, 도서별 상태 관리 등 복잡성이 Aggregate 별로 분산되어 관리 부담이 줄어든다.",
                    "independence": "Category 정책만 변경해도 도서 등록, 분류, 상태관리 등 확장·진화가 가능하다.",
                    "performance": "도서 검색, 카테고리별 조회 등 쿼리 패턴별로 최적화·분산이 가능해진다."
                },
                "cons": {
                    "cohesion": "카테고리 참조 구조로 인해 도서 등록·변경 시 두 Aggregate 간 연동이 필요하다.",
                    "coupling": "Book과 Category 사이의 참조로 인한 약한 결합이 생기며, 데이터 동기화 오류 가능성이 있다.",
                    "consistency": "카테고리별 정책 변경이 Book에 즉각 반영되지 않을 경우 일관성 보장이 어렵다.",
                    "encapsulation": "도서 상태 관리와 카테고리 정책이 분리되어 전체 비즈니스 규칙 파악이 어려워질 수 있다.",
                    "complexity": "Aggregate 분리로 인해 트랜잭션 관리 및 서비스 레이어에서의 오케스트레이션 코드가 추가된다.",
                    "independence": "Book과 Category 동시 변경 시 동시성 이슈나 트랜잭션 관리가 복잡해진다.",
                    "performance": "카테고리 기반 대용량 조회 시 Cross-Aggregate Join이 필요해질 수 있다."
                },
                "isAIRecommended": true
            }
        ],
        "boundedContextName": "RoomManagement",
        "functionalRequirements": `# Bounded Context Overview: BookManagement (도서 관리)

## Role
도서 등록, 도서 상태 관리(대출가능/대출중/예약중/폐기) 및 도서 정보(도서명, ISBN, 저자, 출판사, 카테고리) 관리를 담당한다. ISBN 중복 및 자리수 유효성 검증, 카테고리 분류, 도서의 상태 변동, 폐기 처리 등을 수행한다.

## Key Events
- BookRegistered
- BookDiscarded
- BookStateChanged

# Requirements

## userStory

'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.

각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.

## DDL

\`\`\`sql
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
\`\`\`
\`\`\`sql
-- 도서 상태 변경 이력 테이블
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
  "actor": "사서",
  "level": 1,
  "description": "사서가 신규 도서 정보를 입력하고, 유효성(ISBN 중복/자리수, 카테고리) 검증 후 도서를 등록하였음.",
  "inputs": [
    "도서명",
    "ISBN(13자리)",
    "저자",
    "출판사",
    "카테고리(소설/비소설/학술/잡지)"
  ],
  "outputs": [
    "신규 도서 생성",
    "도서 상태 '대출가능' 설정"
  ],
  "nextEvents": [
    "BookStateChanged"
  ]
}
\`\`\`

\`\`\`json
{
  "name": "BookStateChanged",
  "displayName": "도서 상태 변경됨",
  "actor": "도서관리시스템",
  "level": 2,
  "description": "도서가 등록, 대출, 반납, 예약, 폐기 등 상황 변화에 따라 상태가 자동으로 변경됨.",
  "inputs": [
    "도서 상태 변경 조건 발생(대출/반납/예약/폐기)"
  ],
  "outputs": [
    "도서 상태: 대출가능/대출중/예약중/폐기"
  ],
  "nextEvents": [
    "BookLoaned",
    "BookReturned",
    "BookReserved",
    "BookDiscarded"
  ]
}
\`\`\`

\`\`\`json
{
  "name": "BookDiscarded",
  "displayName": "도서 폐기됨",
  "actor": "사서",
  "level": 3,
  "description": "사서가 훼손, 분실 등으로 도서를 폐기 처리함. 폐기된 도서는 대출 불가.",
  "inputs": [
    "도서",
    "폐기 사유"
  ],
  "outputs": [
    "도서 상태 '폐기'로 변경",
    "대출 불가 처리"
  ],
  "nextEvents": [
    "BookStateChanged"
  ]
}
\`\`\`

## Context Relations

### BookManagement-LoanProcessing
- **Type**: Pub/Sub
- **Direction**: sends to 대출/반납 처리 (LoanProcessing)
- **Reason**: 도서 상태 변경 등 주요 이벤트가 대출/반납 프로세스에 영향을 미치므로, 느슨한 결합과 확장성을 위해 pub/sub을 적용했다.
- **Interaction Pattern**: 도서 등록, 폐기, 상태 변경 이벤트가 발생하면 대출/반납 처리 컨텍스트가 이를 구독하여 내부 상태를 동기화한다.

### BookManagement-HistoryManagement
- **Type**: Pub/Sub
- **Direction**: sends to 이력 관리 (HistoryManagement)
- **Reason**: 도서 등록/상태 변경 이벤트가 이력 관리의 기록 트리거가 되므로, pub/sub을 적용해 독립성과 유연성을 보장했다.
- **Interaction Pattern**: 도서 관리 컨텍스트에서 도서 등록/상태 변경이 발생하면 이력 관리 컨텍스트가 이를 구독해 상태 변경 이력을 기록한다.`,
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
]