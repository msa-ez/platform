export const assignPreviewFieldsToAggregateDraftInputs = {
    "description": "# Bounded Context Overview: BookManagement (도서 관리)\n\n## Role\n도서 등록, 도서 상태 관리(대출가능/대출중/예약중/폐기) 및 도서 정보(도서명, ISBN, 저자, 출판사, 카테고리) 관리를 담당한다. ISBN 중복 및 자리수 유효성 검증, 카테고리 분류, 도서의 상태 변동, 폐기 처리 등을 수행한다.\n\n## Key Events\n- BookRegistered\n- BookDiscarded\n- BookStateChanged\n\n# Requirements\n\n## userStory\n\n'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\n\n각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\n\n## Event\n\n```json\n{\n  \"name\": \"BookRegistered\",\n  \"displayName\": \"도서 등록됨\",\n  \"actor\": \"사서\",\n  \"level\": 1,\n  \"description\": \"사서가 신규 도서 정보를 입력하고, 유효성(ISBN 중복/자리수, 카테고리) 검증 후 도서를 등록하였음.\",\n  \"inputs\": [\n    \"도서명\",\n    \"ISBN(13자리)\",\n    \"저자\",\n    \"출판사\",\n    \"카테고리(소설/비소설/학술/잡지)\"\n  ],\n  \"outputs\": [\n    \"신규 도서 생성\",\n    \"도서 상태 '대출가능' 설정\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookStateChanged\",\n  \"displayName\": \"도서 상태 변경됨\",\n  \"actor\": \"도서관리시스템\",\n  \"level\": 2,\n  \"description\": \"도서가 등록, 대출, 반납, 예약, 폐기 등 상황 변화에 따라 상태가 자동으로 변경됨.\",\n  \"inputs\": [\n    \"도서 상태 변경 조건 발생(대출/반납/예약/폐기)\"\n  ],\n  \"outputs\": [\n    \"도서 상태: 대출가능/대출중/예약중/폐기\"\n  ],\n  \"nextEvents\": [\n    \"BookLoaned\",\n    \"BookReturned\",\n    \"BookReserved\",\n    \"BookDiscarded\"\n  ]\n}\n```\n\n```json\n{\n  \"name\": \"BookDiscarded\",\n  \"displayName\": \"도서 폐기됨\",\n  \"actor\": \"사서\",\n  \"level\": 3,\n  \"description\": \"사서가 훼손, 분실 등으로 도서를 폐기 처리함. 폐기된 도서는 대출 불가.\",\n  \"inputs\": [\n    \"도서\",\n    \"폐기 사유\"\n  ],\n  \"outputs\": [\n    \"도서 상태 '폐기'로 변경\",\n    \"대출 불가 처리\"\n  ],\n  \"nextEvents\": [\n    \"BookStateChanged\"\n  ]\n}\n```\n\n## Context Relations\n\n### BookManagement-LoanProcessing\n- **Type**: Pub/Sub\n- **Direction**: sends to 대출/반납 처리 (LoanProcessing)\n- **Reason**: 도서 상태 변경 등 주요 이벤트가 대출/반납 프로세스에 영향을 미치므로, 느슨한 결합과 확장성을 위해 pub/sub을 적용했다.\n- **Interaction Pattern**: 도서 등록, 폐기, 상태 변경 이벤트가 발생하면 대출/반납 처리 컨텍스트가 이를 구독하여 내부 상태를 동기화한다.\n\n### BookManagement-HistoryManagement\n- **Type**: Pub/Sub\n- **Direction**: sends to 이력 관리 (HistoryManagement)\n- **Reason**: 도서 등록/상태 변경 이벤트가 이력 관리의 기록 트리거가 되므로, pub/sub을 적용해 독립성과 유연성을 보장했다.\n- **Interaction Pattern**: 도서 관리 컨텍스트에서 도서 등록/상태 변경이 발생하면 이력 관리 컨텍스트가 이를 구독해 상태 변경 이력을 기록한다.",
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
                        305
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
                        102
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
                        304
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
                        243
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
                        305
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
                        74
                    ]
                ]
            ],
            "isDirectMatching": true
        },
        "22": {
            "refs": [
                [
                    [
                        3,
                        15
                    ],
                    [
                        3,
                        102
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "23": {
            "refs": [
                [
                    [
                        3,
                        15
                    ],
                    [
                        3,
                        102
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "24": {
            "refs": [
                [
                    [
                        3,
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
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
                        15
                    ],
                    [
                        3,
                        102
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "46": {
            "refs": [
                [
                    [
                        3,
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        40
                    ],
                    [
                        3,
                        243
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        246
                    ],
                    [
                        3,
                        304
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
                        172
                    ],
                    [
                        7,
                        170
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
                        172
                    ],
                    [
                        7,
                        170
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
                        172
                    ],
                    [
                        7,
                        170
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
                        172
                    ],
                    [
                        7,
                        170
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
                        15
                    ],
                    [
                        9,
                        74
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
                        15
                    ],
                    [
                        9,
                        74
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "99": {
            "refs": [
                [
                    [
                        9,
                        15
                    ],
                    [
                        9,
                        74
                    ]
                ]
            ],
            "isDirectMatching": false
        },
        "100": {
            "refs": [
                [
                    [
                        9,
                        15
                    ],
                    [
                        9,
                        74
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
        }
    ],
    "generatorKey": "option 1"
}