/**
 * @from ESDialoger.generators.DraftGeneratorByFunctions.generate
 */
export const draftGeneratorByFunctionsInputs = [
    {
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서, 나는 새로운 도서를 등록하여 도서관의 데이터를 최신 상태로 유지하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리를 입력받아야 한다.\",\"ISBN은 13자리 숫자여야 하고 중복 확인이 필요하다.\",\"카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 한다.\",\"등록된 도서는 기본적으로 '대출가능' 상태로 설정되어야 한다.\"]},{\"title\":\"도서 상태 관리\",\"description\":\"관리자로서, 나는 도서의 대출 상태를 관리하고 폐기 처리할 수 있어야 한다.\",\"acceptance\":[\"대출/반납 상황에 따라 도서 상태가 '대출중', '예약중'으로 자동 변경되어야 한다.\",\"폐기된 도서는 더 이상 대출이 불가능해야 한다.\",\"관리자는 도서를 '폐기' 상태로 변경할 수 있어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"isUnique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"date\",\"required\":false},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"반납완료\"]}]}},\"businessRules\":[{\"name\":\"UniqueISBN\",\"description\":\"ISBN은 중복될 수 없다.\"},{\"name\":\"BookStatusChange\",\"description\":\"대출/반납 상황에 따라 도서 상태가 자동으로 변경되어야 한다.\"},{\"name\":\"DiscardedBooksRestriction\",\"description\":\"폐기된 도서는 대출이 불가능해야 한다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"BookRegistration\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Submit\",\"Clear\"]},{\"name\":\"BookStatusManagement\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"status\",\"type\":\"select\",\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}],\"actions\":[\"Edit\",\"Discard\"]}]}}}",
        "boundedContext": {
            "name": "BookManagement",
            "alias": "도서 관리",
            "displayName": "도서 관리",
            "description": [
                {
                    "type": "userStory",
                    "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                },
                {
                    "type": "ddl",
                    "text": "도서명, ISBN, 저자, 출판사, 카테고리"
                }
            ],
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ]
        },
        "accumulatedDrafts": {
            "BookManagement": [],
            "LoanManagement": [
                {
                    "aggregate": {
                        "name": "Loan",
                        "alias": "대출"
                    },
                    "entities": [],
                    "valueObjects": []
                },
                {
                    "aggregate": {
                        "name": "Member",
                        "alias": "회원"
                    },
                    "entities": [],
                    "valueObjects": []
                }
            ]
        }
    }
]

/**
 * @from ESDialoger.generators.DraftGeneratorByFunctions.generate
 */
export const draftGeneratorByFunctionsInputsWithFeedback = [
    {
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서, 나는 새로운 도서를 등록하여 도서관의 데이터를 최신 상태로 유지하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리를 입력받아야 한다.\",\"ISBN은 13자리 숫자여야 하고 중복 확인이 필요하다.\",\"카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 한다.\",\"등록된 도서는 기본적으로 '대출가능' 상태로 설정되어야 한다.\"]},{\"title\":\"도서 상태 관리\",\"description\":\"관리자로서, 나는 도서의 대출 상태를 관리하고 폐기 처리할 수 있어야 한다.\",\"acceptance\":[\"대출/반납 상황에 따라 도서 상태가 '대출중', '예약중'으로 자동 변경되어야 한다.\",\"폐기된 도서는 더 이상 대출이 불가능해야 한다.\",\"관리자는 도서를 '폐기' 상태로 변경할 수 있어야 한다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"isUnique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"date\",\"required\":false},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"반납완료\"]}]}},\"businessRules\":[{\"name\":\"UniqueISBN\",\"description\":\"ISBN은 중복될 수 없다.\"},{\"name\":\"BookStatusChange\",\"description\":\"대출/반납 상황에 따라 도서 상태가 자동으로 변경되어야 한다.\"},{\"name\":\"DiscardedBooksRestriction\",\"description\":\"폐기된 도서는 대출이 불가능해야 한다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"BookRegistration\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Submit\",\"Clear\"]},{\"name\":\"BookStatusManagement\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"status\",\"type\":\"select\",\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}],\"actions\":[\"Edit\",\"Discard\"]}]}}}",
        "boundedContext": {
            "name": "BookManagement",
            "alias": "도서 관리",
            "displayName": "도서 관리",
            "description": [
                {
                    "type": "userStory",
                    "text": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해."
                },
                {
                    "type": "ddl",
                    "text": "도서명, ISBN, 저자, 출판사, 카테고리"
                }
            ],
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ]
        },
        "accumulatedDrafts": {
            "BookManagement": [],
            "LoanManagement": [
                {
                    "aggregate": {
                        "name": "Loan",
                        "alias": "대출"
                    },
                    "entities": [],
                    "valueObjects": []
                },
                {
                    "aggregate": {
                        "name": "Member",
                        "alias": "회원"
                    },
                    "entities": [],
                    "valueObjects": []
                }
            ]
        },
        "feedback": {
            "previousDraftOutput": {
                "options": [
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "entities": [],
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
                                        "name": "ISBN",
                                        "alias": "ISBN"
                                    },
                                    {
                                        "name": "Category",
                                        "alias": "카테고리"
                                    },
                                    {
                                        "name": "BookStatus",
                                        "alias": "도서 상태"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "structure": [
                            {
                                "aggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                },
                                "entities": [],
                                "valueObjects": [
                                    {
                                        "name": "ISBN",
                                        "alias": "ISBN"
                                    },
                                    {
                                        "name": "Category",
                                        "alias": "카테고리"
                                    }
                                ]
                            },
                            {
                                "aggregate": {
                                    "name": "BookStatus",
                                    "alias": "도서 상태"
                                },
                                "entities": [],
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
                                        "name": "LoanReference",
                                        "alias": "대출 참조",
                                        "referencedAggregate": {
                                            "name": "Loan",
                                            "alias": "대출"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            "feedbacks": [
                "Aggregate가 3개인 경우를 포함해서 옵션을 생성해주세요."
            ]
        }
    }
]