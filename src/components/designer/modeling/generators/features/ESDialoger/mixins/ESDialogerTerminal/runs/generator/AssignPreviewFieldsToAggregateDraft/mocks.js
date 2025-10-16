export const assignPreviewFieldsToAggregateDraftInput = {
    "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 상태 관리(대출가능/대출중/예약중/폐기), ISBN 중복 및 유효성 검증, 도서 폐기 등 도서의 전체 라이프사이클을 관리한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStatusChanged\n\n# Requirements\n\n## userStory\n\n도서관의 도서 관리와 대출/반납을 통합적으로 관리하는\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 1,\n  \"description\": \"사서가 새로운 도서를 도서 관리 화면에서 등록함. 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받고, ISBN 중복 및 유효성 검증을 통과한 후 도서가 등록됨. 등록된 도서는 '대출가능' 상태가 됨.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서(대출가능 상태)\"\n  ],\n  \"nextEvents\": [\n    \"BookStatusChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStatusChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"System\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 주요 이벤트 발생 시 상태가 자동으로 변경됨. 예: 등록 시 '대출가능', 대출 시 '대출중', 반납 시 '대출가능' 또는 '예약중', 폐기 시 '폐기' 등.\",\n  \"inputs\": [\n    \"도서 이벤트(등록/대출/반납/예약/폐기 등)\"\n  ],\n  \"outputs\": [\n    \"도서 상태 변경\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"Librarian\",\n  \"level\": 7,\n  \"description\": \"사서가 훼손되거나 분실된 도서를 폐기 처리함. 폐기된 도서는 더 이상 대출이 불가능함.\",\n  \"inputs\": [\n    \"도서명 또는 ISBN\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'\"\n  ],\n  \"nextEvents\": []\n}\n```\n\n## Context Relations\n\n### LoanProcess→BookManagement\n- **Type**: Pub/Sub\n- **Direction**: receives from 대출/반납 프로세스 (LoanProcess)\n- **Reason**: 대출/반납/연장/예약 등 회원의 행위가 발생하면 도서의 상태 변경이 필요하므로, 이벤트 기반으로 도서 관리 컨텍스트에 상태 변경을 전달한다. 느슨한 결합을 위해 Pub/Sub 패턴을 적용한다.\n- **Interaction Pattern**: 대출/반납 프로세스에서 도서 상태 변경 이벤트를 발행하면, 도서 관리 컨텍스트가 이를 구독하여 상태를 변경한다.\n\n### BookManagement→BookHistory\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (BookHistory)\n- **Reason**: 도서의 상태가 변경될 때마다 이력 관리 컨텍스트가 해당 이벤트를 구독하여 상태 변경 이력을 기록한다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 상태 변경 이벤트가 발생하면, 이력 관리 컨텍스트가 이를 구독하여 이력을 저장한다.",
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
                        304
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
                        177
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
                        264
                    ],
                    [
                        3,
                        286
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
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "15": {
            "refs": [
                [
                    [
                        1,
                        1
                    ],
                    [
                        1,
                        29
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "17": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        302
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "19": {
            "refs": [
                [
                    [
                        9,
                        1
                    ],
                    [
                        9,
                        65
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "24": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "25": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "26": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "27": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "28": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "29": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "30": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "31": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "32": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "33": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "34": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "35": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "36": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "37": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "38": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "39": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "40": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "41": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "42": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "43": {
            "refs": [
                [
                    [
                        3,
                        57
                    ],
                    [
                        3,
                        177
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "47": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "48": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "49": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "50": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "51": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "52": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "53": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "54": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "55": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "56": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "57": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "58": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "59": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "60": {
            "refs": [
                [
                    [
                        3,
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
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
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
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
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
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
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
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
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
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
                        1
                    ],
                    [
                        3,
                        238
                    ]
                ],
                [
                    [
                        7,
                        150
                    ],
                    [
                        7,
                        159
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
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
                        264
                    ],
                    [
                        3,
                        286
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "81": {
            "refs": [
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        286
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "82": {
            "refs": [
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        286
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "83": {
            "refs": [
                [
                    [
                        3,
                        264
                    ],
                    [
                        3,
                        286
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "89": {
            "refs": [
                [
                    [
                        5,
                        2
                    ],
                    [
                        7,
                        169
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "90": {
            "refs": [
                [
                    [
                        5,
                        2
                    ],
                    [
                        7,
                        169
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "91": {
            "refs": [
                [
                    [
                        5,
                        2
                    ],
                    [
                        7,
                        169
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "92": {
            "refs": [
                [
                    [
                        5,
                        2
                    ],
                    [
                        7,
                        169
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "95": {
            "refs": [
                [
                    [
                        9,
                        8
                    ],
                    [
                        9,
                        73
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "96": {
            "refs": [
                [
                    [
                        9,
                        8
                    ],
                    [
                        9,
                        73
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "97": {
            "refs": [
                [
                    [
                        9,
                        8
                    ],
                    [
                        9,
                        73
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "98": {
            "refs": [
                [
                    [
                        9,
                        8
                    ],
                    [
                        9,
                        73
                    ]
                ]
            ],
            "isDirectMatching": false
        }
    },
    "aggregateDrafts": [
        {
            "name": "Book",
            "alias": "도서"
        },
        {
            "name": "BookCategory",
            "alias": "도서 카테고리"
        }
    ],
    "generatorKey": "option 2"
}