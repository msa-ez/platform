export const libraryEsValue = {
    "elements": {
        "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741": {
            "_type": "org.uengine.modeling.model.BoundedContext",
            "aggregates": [
                {
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa"
                }
            ],
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "description": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
            "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741",
            "elementView": {
                "_type": "org.uengine.modeling.model.BoundedContext",
                "height": 590,
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741",
                "style": "{}",
                "width": 560,
                "x": 650,
                "y": 450
            },
            "gitURL": null,
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                "height": 350,
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741",
                "style": "{}",
                "width": 350,
                "x": 235,
                "y": 365
            },
            "members": [],
            "name": "BookManagement",
            "displayName": "도서 관리",
            "oldName": "",
            "policies": [],
            "portGenerated": null,
            "preferredPlatform": "template-spring-boot",
            "preferredPlatformConf": {},
            "rotateStatus": false,
            "tempId": "",
            "templatePerElements": {},
            "views": [],
            "definitionId": "163972132_es_9c3424a86507b5056f7433e4cbbf6f4a"
        },
        "85c498d4-39ed-5546-59b8-8eaaf33cffc8": {
            "_type": "org.uengine.modeling.model.BoundedContext",
            "aggregates": [
                {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                }
            ],
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "description": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해. 대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.",
            "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8",
            "elementView": {
                "_type": "org.uengine.modeling.model.BoundedContext",
                "height": 726,
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8",
                "style": "{}",
                "width": 560,
                "x": 1235,
                "y": 518
            },
            "gitURL": null,
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                "height": 350,
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8",
                "style": "{}",
                "width": 350,
                "x": 235,
                "y": 365
            },
            "members": [],
            "name": "LoanManagement",
            "displayName": "대출/반납 관리",
            "oldName": "",
            "policies": [],
            "portGenerated": 8080,
            "preferredPlatform": "template-spring-boot",
            "preferredPlatformConf": {},
            "rotateStatus": false,
            "tempId": "",
            "templatePerElements": {},
            "views": [],
            "definitionId": "163972132_es_9c3424a86507b5056f7433e4cbbf6f4a"
        },
        "554241df-8091-4819-87d3-8fa38d18deaa": {
            "aggregateRoot": {
                "_type": "org.uengine.modeling.model.AggregateRoot",
                "fieldDescriptors": [
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": true,
                        "name": "bookId",
                        "nameCamelCase": "bookId",
                        "namePascalCase": "BookId",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "title",
                        "nameCamelCase": "title",
                        "namePascalCase": "Title",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "isbn",
                        "nameCamelCase": "isbn",
                        "namePascalCase": "Isbn",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "author",
                        "nameCamelCase": "author",
                        "namePascalCase": "Author",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "publisher",
                        "nameCamelCase": "publisher",
                        "namePascalCase": "Publisher",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Category",
                        "isCopy": false,
                        "isKey": false,
                        "name": "category",
                        "nameCamelCase": "category",
                        "namePascalCase": "Category",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Status",
                        "isCopy": false,
                        "isKey": false,
                        "name": "status",
                        "nameCamelCase": "status",
                        "namePascalCase": "Status",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "entities": {
                    "elements": {
                        "0a22d0ce-0f1d-80fa-42b3-19647aa41149": {
                            "_type": "org.uengine.uml.model.Class",
                            "id": "0a22d0ce-0f1d-80fa-42b3-19647aa41149",
                            "name": "Book",
                            "namePascalCase": "Book",
                            "nameCamelCase": "book",
                            "namePlural": "Books",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": true,
                                    "name": "bookId",
                                    "displayName": "",
                                    "nameCamelCase": "bookId",
                                    "namePascalCase": "BookId",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "title",
                                    "displayName": "",
                                    "nameCamelCase": "title",
                                    "namePascalCase": "Title",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "isbn",
                                    "displayName": "",
                                    "nameCamelCase": "isbn",
                                    "namePascalCase": "Isbn",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "author",
                                    "displayName": "",
                                    "nameCamelCase": "author",
                                    "namePascalCase": "Author",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "publisher",
                                    "displayName": "",
                                    "nameCamelCase": "publisher",
                                    "namePascalCase": "Publisher",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "Category",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "category",
                                    "displayName": "",
                                    "nameCamelCase": "category",
                                    "namePascalCase": "Category",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "Status",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "status",
                                    "displayName": "",
                                    "nameCamelCase": "status",
                                    "namePascalCase": "Status",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                }
                            ],
                            "operations": [],
                            "elementView": {
                                "_type": "org.uengine.uml.model.Class",
                                "id": "0a22d0ce-0f1d-80fa-42b3-19647aa41149",
                                "x": 200,
                                "y": 200,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 120,
                                "fieldH": 90,
                                "methodH": 30
                            },
                            "selected": false,
                            "relations": [],
                            "parentOperations": [],
                            "relationType": null,
                            "isVO": false,
                            "isAbstract": false,
                            "isInterface": false,
                            "isAggregateRoot": true,
                            "parentId": "554241df-8091-4819-87d3-8fa38d18deaa"
                        },
                        "e029780c-da79-3641-c1f3-8e45ebd5bfb7": {
                            "_type": "org.uengine.uml.model.enum",
                            "id": "e029780c-da79-3641-c1f3-8e45ebd5bfb7",
                            "name": "Category",
                            "displayName": "도서 카테고리",
                            "nameCamelCase": "category",
                            "namePascalCase": "Category",
                            "namePlural": "categories",
                            "elementView": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "e029780c-da79-3641-c1f3-8e45ebd5bfb7",
                                "x": 700,
                                "y": 456,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 50
                            },
                            "selected": false,
                            "items": [
                                {
                                    "value": "NOVEL"
                                },
                                {
                                    "value": "NONFICTION"
                                },
                                {
                                    "value": "ACADEMIC"
                                },
                                {
                                    "value": "MAGAZINE"
                                }
                            ],
                            "useKeyValue": false,
                            "relations": []
                        },
                        "3abb79e5-1456-e11b-560b-1483b5807a68": {
                            "_type": "org.uengine.uml.model.enum",
                            "id": "3abb79e5-1456-e11b-560b-1483b5807a68",
                            "name": "Status",
                            "displayName": "도서 상태",
                            "nameCamelCase": "status",
                            "namePascalCase": "Status",
                            "namePlural": "statuses",
                            "elementView": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "3abb79e5-1456-e11b-560b-1483b5807a68",
                                "x": 950,
                                "y": 456,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 50
                            },
                            "selected": false,
                            "items": [
                                {
                                    "value": "AVAILABLE"
                                },
                                {
                                    "value": "BORROWED"
                                },
                                {
                                    "value": "RESERVED"
                                },
                                {
                                    "value": "DISCARDED"
                                }
                            ],
                            "useKeyValue": false,
                            "relations": []
                        }
                    },
                    "relations": {}
                },
                "operations": []
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "name": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741",
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "commands": [],
            "description": null,
            "id": "554241df-8091-4819-87d3-8fa38d18deaa",
            "elementView": {
                "_type": "org.uengine.modeling.model.Aggregate",
                "id": "554241df-8091-4819-87d3-8fa38d18deaa",
                "x": 650,
                "y": 450,
                "width": 130,
                "height": 400
            },
            "events": [],
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.AggregateHexagonal",
                "id": "554241df-8091-4819-87d3-8fa38d18deaa",
                "x": 0,
                "y": 0,
                "subWidth": 0,
                "width": 0
            },
            "name": "Book",
            "displayName": "도서",
            "nameCamelCase": "book",
            "namePascalCase": "Book",
            "namePlural": "books",
            "rotateStatus": false,
            "selected": false,
            "_type": "org.uengine.modeling.model.Aggregate"
        },
        "f8dc3056-6183-539a-7f20-68681ddcc8a2": {
            "aggregateRoot": {
                "_type": "org.uengine.modeling.model.AggregateRoot",
                "fieldDescriptors": [
                    {
                        "className": "Long",
                        "isCopy": false,
                        "isKey": true,
                        "name": "loanId",
                        "nameCamelCase": "loanId",
                        "namePascalCase": "LoanId",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Member",
                        "isCopy": false,
                        "isKey": false,
                        "name": "member",
                        "nameCamelCase": "member",
                        "namePascalCase": "Member",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Integer",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanPeriod",
                        "nameCamelCase": "loanPeriod",
                        "namePascalCase": "LoanPeriod",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanStatus",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanStatus",
                        "nameCamelCase": "loanStatus",
                        "namePascalCase": "LoanStatus",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDate",
                        "nameCamelCase": "loanDate",
                        "namePascalCase": "LoanDate",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "returnDueDate",
                        "nameCamelCase": "returnDueDate",
                        "namePascalCase": "ReturnDueDate",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanDuration",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDuration",
                        "nameCamelCase": "loanDuration",
                        "namePascalCase": "LoanDuration",
                        "displayName": "",
                        "referenceClass": null,
                        "isOverrideField": false,
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "BookId",
                        "isCopy": false,
                        "isKey": false,
                        "name": "bookId",
                        "nameCamelCase": "bookId",
                        "namePascalCase": "BookId",
                        "displayName": "",
                        "referenceClass": "Book",
                        "isOverrideField": true,
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "entities": {
                    "elements": {
                        "30397330-2606-86f2-57f4-bf677bae16dc": {
                            "_type": "org.uengine.uml.model.Class",
                            "id": "30397330-2606-86f2-57f4-bf677bae16dc",
                            "name": "Loan",
                            "namePascalCase": "Loan",
                            "nameCamelCase": "loan",
                            "namePlural": "Loans",
                            "fieldDescriptors": [
                                {
                                    "className": "Long",
                                    "isCopy": false,
                                    "isKey": true,
                                    "name": "loanId",
                                    "displayName": "",
                                    "nameCamelCase": "loanId",
                                    "namePascalCase": "LoanId",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "Member",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "member",
                                    "displayName": "",
                                    "nameCamelCase": "member",
                                    "namePascalCase": "Member",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "Integer",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "loanPeriod",
                                    "displayName": "",
                                    "nameCamelCase": "loanPeriod",
                                    "namePascalCase": "LoanPeriod",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "LoanStatus",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "loanStatus",
                                    "displayName": "",
                                    "nameCamelCase": "loanStatus",
                                    "namePascalCase": "LoanStatus",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "Date",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "loanDate",
                                    "displayName": "",
                                    "nameCamelCase": "loanDate",
                                    "namePascalCase": "LoanDate",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "Date",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "returnDueDate",
                                    "displayName": "",
                                    "nameCamelCase": "returnDueDate",
                                    "namePascalCase": "ReturnDueDate",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "LoanDuration",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "loanDuration",
                                    "displayName": "",
                                    "nameCamelCase": "loanDuration",
                                    "namePascalCase": "LoanDuration",
                                    "_type": "org.uengine.model.FieldDescriptor",
                                    "inputUI": null,
                                    "options": null
                                },
                                {
                                    "className": "BookId",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "bookId",
                                    "nameCamelCase": "bookId",
                                    "namePascalCase": "BookId",
                                    "displayName": "",
                                    "referenceClass": "Book",
                                    "isOverrideField": true,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "operations": [],
                            "elementView": {
                                "_type": "org.uengine.uml.model.Class",
                                "id": "30397330-2606-86f2-57f4-bf677bae16dc",
                                "x": 200,
                                "y": 200,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 120,
                                "fieldH": 90,
                                "methodH": 30
                            },
                            "selected": false,
                            "relations": [],
                            "parentOperations": [],
                            "relationType": null,
                            "isVO": false,
                            "isAbstract": false,
                            "isInterface": false,
                            "isAggregateRoot": true,
                            "parentId": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                        },
                        "09ee5a03-4449-1bde-3705-35c2ca198880": {
                            "_type": "org.uengine.uml.model.vo.Class",
                            "id": "09ee5a03-4449-1bde-3705-35c2ca198880",
                            "name": "Member",
                            "displayName": "회원",
                            "namePascalCase": "Member",
                            "nameCamelCase": "member",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
                                    "isKey": false,
                                    "label": "- memberId: String",
                                    "name": "memberId",
                                    "nameCamelCase": "memberId",
                                    "namePascalCase": "MemberId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isKey": false,
                                    "label": "- name: String",
                                    "name": "name",
                                    "nameCamelCase": "name",
                                    "namePascalCase": "Name",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "operations": [],
                            "elementView": {
                                "_type": "org.uengine.uml.model.vo.address.Class",
                                "id": "09ee5a03-4449-1bde-3705-35c2ca198880",
                                "x": 700,
                                "y": 152,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 170,
                                "fieldH": 150,
                                "methodH": 30
                            },
                            "selected": false,
                            "parentOperations": [],
                            "relationType": null,
                            "isVO": true,
                            "relations": [],
                            "groupElement": null,
                            "isAggregateRoot": false,
                            "namePlural": "Members",
                            "isAbstract": false,
                            "isInterface": false
                        },
                        "bfdf118a-ad46-c0e3-2ae4-d0372b9d8361": {
                            "_type": "org.uengine.uml.model.enum",
                            "id": "bfdf118a-ad46-c0e3-2ae4-d0372b9d8361",
                            "name": "LoanStatus",
                            "displayName": "대출 상태",
                            "nameCamelCase": "loanStatus",
                            "namePascalCase": "LoanStatus",
                            "namePlural": "loanStatuses",
                            "elementView": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "bfdf118a-ad46-c0e3-2ae4-d0372b9d8361",
                                "x": 700,
                                "y": 456,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 50
                            },
                            "selected": false,
                            "items": [
                                {
                                    "value": "BORROWED"
                                },
                                {
                                    "value": "OVERDUE"
                                },
                                {
                                    "value": "RETURNED"
                                }
                            ],
                            "useKeyValue": false,
                            "relations": []
                        },
                        "8c1b2fee-54a7-b460-486a-1453593fac3f": {
                            "_type": "org.uengine.uml.model.enum",
                            "id": "8c1b2fee-54a7-b460-486a-1453593fac3f",
                            "name": "LoanDuration",
                            "displayName": "대출 기간 옵션",
                            "nameCamelCase": "loanDuration",
                            "namePascalCase": "LoanDuration",
                            "namePlural": "loanDurations",
                            "elementView": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "8c1b2fee-54a7-b460-486a-1453593fac3f",
                                "x": 950,
                                "y": 456,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 50
                            },
                            "selected": false,
                            "items": [
                                {
                                    "value": "7_DAYS"
                                },
                                {
                                    "value": "14_DAYS"
                                },
                                {
                                    "value": "30_DAYS"
                                }
                            ],
                            "useKeyValue": false,
                            "relations": []
                        },
                        "498f116f-796f-fa99-d9a2-a2f257761c80": {
                            "_type": "org.uengine.uml.model.vo.Class",
                            "id": "498f116f-796f-fa99-d9a2-a2f257761c80",
                            "name": "BookId",
                            "displayName": "",
                            "namePascalCase": "BookId",
                            "nameCamelCase": "bookId",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
                                    "isKey": true,
                                    "label": "- bookId: String",
                                    "name": "bookId",
                                    "nameCamelCase": "bookId",
                                    "namePascalCase": "BookId",
                                    "displayName": "",
                                    "referenceClass": "Book",
                                    "isOverrideField": true,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isKey": false,
                                    "label": "- isbn: String",
                                    "name": "isbn",
                                    "nameCamelCase": "isbn",
                                    "namePascalCase": "Isbn",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "operations": [],
                            "elementView": {
                                "_type": "org.uengine.uml.model.vo.address.Class",
                                "id": "498f116f-796f-fa99-d9a2-a2f257761c80",
                                "x": 950,
                                "y": 152,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 170,
                                "fieldH": 150,
                                "methodH": 30
                            },
                            "selected": false,
                            "parentOperations": [],
                            "relationType": null,
                            "isVO": true,
                            "relations": [
                                "9c545fdc-cddf-9cbb-e621-60b6aec1c837"
                            ],
                            "groupElement": null,
                            "isAggregateRoot": false,
                            "namePlural": "BookIds",
                            "isAbstract": false,
                            "isInterface": false
                        },
                        "7c0b178b-e639-d076-551b-a6e54231343a": {
                            "_type": "org.uengine.uml.model.enum",
                            "id": "7c0b178b-e639-d076-551b-a6e54231343a",
                            "name": "Category",
                            "displayName": "도서 카테고리",
                            "nameCamelCase": "category",
                            "namePascalCase": "Category",
                            "namePlural": "categories",
                            "elementView": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "7c0b178b-e639-d076-551b-a6e54231343a",
                                "x": 1200,
                                "y": 456,
                                "width": 200,
                                "height": 100,
                                "style": "{}",
                                "titleH": 50,
                                "subEdgeH": 50
                            },
                            "selected": false,
                            "items": [
                                {
                                    "value": "NOVEL"
                                },
                                {
                                    "value": "NONFICTION"
                                },
                                {
                                    "value": "ACADEMIC"
                                },
                                {
                                    "value": "MAGAZINE"
                                }
                            ],
                            "useKeyValue": false,
                            "relations": [
                                "9c545fdc-cddf-9cbb-e621-60b6aec1c837"
                            ]
                        }
                    },
                    "relations": {
                        "9c545fdc-cddf-9cbb-e621-60b6aec1c837": {
                            "name": "Category",
                            "id": "9c545fdc-cddf-9cbb-e621-60b6aec1c837",
                            "_type": "org.uengine.uml.model.Relation",
                            "sourceElement": {
                                "_type": "org.uengine.uml.model.vo.Class",
                                "id": "498f116f-796f-fa99-d9a2-a2f257761c80",
                                "name": "BookId",
                                "displayName": "",
                                "namePascalCase": "BookId",
                                "nameCamelCase": "bookId",
                                "fieldDescriptors": [
                                    {
                                        "className": "String",
                                        "isKey": true,
                                        "label": "- bookId: String",
                                        "name": "bookId",
                                        "nameCamelCase": "bookId",
                                        "namePascalCase": "BookId",
                                        "displayName": "",
                                        "referenceClass": "Book",
                                        "isOverrideField": true,
                                        "_type": "org.uengine.model.FieldDescriptor"
                                    },
                                    {
                                        "className": "String",
                                        "isKey": false,
                                        "label": "- isbn: String",
                                        "name": "isbn",
                                        "nameCamelCase": "isbn",
                                        "namePascalCase": "Isbn",
                                        "displayName": "",
                                        "referenceClass": null,
                                        "isOverrideField": false,
                                        "_type": "org.uengine.model.FieldDescriptor"
                                    }
                                ],
                                "operations": [],
                                "elementView": {
                                    "_type": "org.uengine.uml.model.vo.address.Class",
                                    "id": "498f116f-796f-fa99-d9a2-a2f257761c80",
                                    "x": 950,
                                    "y": 152,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 170,
                                    "fieldH": 150,
                                    "methodH": 30
                                },
                                "selected": false,
                                "parentOperations": [],
                                "relationType": null,
                                "isVO": true,
                                "relations": [
                                    "9c545fdc-cddf-9cbb-e621-60b6aec1c837"
                                ],
                                "groupElement": null,
                                "isAggregateRoot": false,
                                "namePlural": "BookIds",
                                "isAbstract": false,
                                "isInterface": false
                            },
                            "targetElement": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "7c0b178b-e639-d076-551b-a6e54231343a",
                                "name": "Category",
                                "displayName": "도서 카테고리",
                                "nameCamelCase": "category",
                                "namePascalCase": "Category",
                                "namePlural": "categories",
                                "elementView": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "7c0b178b-e639-d076-551b-a6e54231343a",
                                    "x": 1200,
                                    "y": 456,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 50
                                },
                                "selected": false,
                                "items": [
                                    {
                                        "value": "NOVEL"
                                    },
                                    {
                                        "value": "NONFICTION"
                                    },
                                    {
                                        "value": "ACADEMIC"
                                    },
                                    {
                                        "value": "MAGAZINE"
                                    }
                                ],
                                "useKeyValue": false,
                                "relations": [
                                    "9c545fdc-cddf-9cbb-e621-60b6aec1c837"
                                ]
                            },
                            "from": "498f116f-796f-fa99-d9a2-a2f257761c80",
                            "to": "7c0b178b-e639-d076-551b-a6e54231343a",
                            "selected": false,
                            "relationView": {
                                "id": "9c545fdc-cddf-9cbb-e621-60b6aec1c837",
                                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                "from": "498f116f-796f-fa99-d9a2-a2f257761c80",
                                "to": "7c0b178b-e639-d076-551b-a6e54231343a",
                                "needReconnect": true
                            },
                            "sourceMultiplicity": "1",
                            "targetMultiplicity": "1",
                            "relationType": "Association",
                            "fromLabel": "",
                            "toLabel": ""
                        }
                    }
                },
                "operations": []
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "name": "85c498d4-39ed-5546-59b8-8eaaf33cffc8",
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "commands": [],
            "description": null,
            "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
            "elementView": {
                "_type": "org.uengine.modeling.model.Aggregate",
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
                "x": 1235,
                "y": 525,
                "width": 130,
                "height": 550
            },
            "events": [],
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.AggregateHexagonal",
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
                "x": 0,
                "y": 0,
                "subWidth": 0,
                "width": 0
            },
            "name": "Loan",
            "displayName": "대출",
            "nameCamelCase": "loan",
            "namePascalCase": "Loan",
            "namePlural": "loans",
            "rotateStatus": false,
            "selected": false,
            "_type": "org.uengine.modeling.model.Aggregate"
        },
        "5afcf0dc-5c3b-f67a-d273-fab421febc20": {
            "alertURL": "/static/image/symbol/alert-icon.png",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "checkAlert": true,
            "description": null,
            "id": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
            "elementView": {
                "angle": 0,
                "height": 116,
                "id": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
                "style": "{}",
                "width": 100,
                "x": 744,
                "y": 250,
                "_type": "org.uengine.modeling.model.Event"
            },
            "fieldDescriptors": [
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "title",
                    "nameCamelCase": "title",
                    "namePascalCase": "Title",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "isbn",
                    "nameCamelCase": "isbn",
                    "namePascalCase": "Isbn",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "author",
                    "nameCamelCase": "author",
                    "namePascalCase": "Author",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "publisher",
                    "nameCamelCase": "publisher",
                    "namePascalCase": "Publisher",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Category",
                    "isCopy": false,
                    "isKey": false,
                    "name": "category",
                    "nameCamelCase": "category",
                    "namePascalCase": "Category",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Status",
                    "isCopy": false,
                    "isKey": false,
                    "name": "status",
                    "nameCamelCase": "status",
                    "namePascalCase": "Status",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "hexagonalView": {
                "height": 0,
                "id": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0,
                "_type": "org.uengine.modeling.model.EventHexagonal"
            },
            "name": "BookCreated",
            "displayName": "도서 등록됨",
            "nameCamelCase": "bookCreated",
            "namePascalCase": "BookCreated",
            "namePlural": "",
            "relationCommandInfo": [],
            "relationPolicyInfo": [],
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PostPersist",
            "_type": "org.uengine.modeling.model.Event",
            "aggregate": {
                "id": "554241df-8091-4819-87d3-8fa38d18deaa"
            },
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "visibility": "public"
        },
        "a82665ee-dc60-21db-a491-8fffbc623007": {
            "alertURL": "/static/image/symbol/alert-icon.png",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "checkAlert": true,
            "description": null,
            "id": "a82665ee-dc60-21db-a491-8fffbc623007",
            "elementView": {
                "angle": 0,
                "height": 116,
                "id": "a82665ee-dc60-21db-a491-8fffbc623007",
                "style": "{}",
                "width": 100,
                "x": 744,
                "y": 380,
                "_type": "org.uengine.modeling.model.Event"
            },
            "fieldDescriptors": [
                {
                    "className": "Status",
                    "isCopy": false,
                    "isKey": false,
                    "name": "previousStatus",
                    "nameCamelCase": "previousStatus",
                    "namePascalCase": "PreviousStatus",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Status",
                    "isCopy": false,
                    "isKey": false,
                    "name": "currentStatus",
                    "nameCamelCase": "currentStatus",
                    "namePascalCase": "CurrentStatus",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "changeDate",
                    "nameCamelCase": "changeDate",
                    "namePascalCase": "ChangeDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "reason",
                    "nameCamelCase": "reason",
                    "namePascalCase": "Reason",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "hexagonalView": {
                "height": 0,
                "id": "a82665ee-dc60-21db-a491-8fffbc623007",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0,
                "_type": "org.uengine.modeling.model.EventHexagonal"
            },
            "name": "BookStatusChanged",
            "displayName": "도서 상태 변경됨",
            "nameCamelCase": "bookStatusChanged",
            "namePascalCase": "BookStatusChanged",
            "namePlural": "",
            "relationCommandInfo": [],
            "relationPolicyInfo": [],
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PostPersist",
            "_type": "org.uengine.modeling.model.Event",
            "aggregate": {
                "id": "554241df-8091-4819-87d3-8fa38d18deaa"
            },
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "visibility": "public"
        },
        "fcdfa519-b23b-a129-296b-90b34d98a7db": {
            "_type": "org.uengine.modeling.model.Command",
            "outputEvents": [
                "BookCreated"
            ],
            "aggregate": {
                "id": "554241df-8091-4819-87d3-8fa38d18deaa"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "controllerInfo": {
                "method": "POST"
            },
            "fieldDescriptors": [
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "title",
                    "nameCamelCase": "title",
                    "namePascalCase": "Title",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "isbn",
                    "nameCamelCase": "isbn",
                    "namePascalCase": "Isbn",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "author",
                    "nameCamelCase": "author",
                    "namePascalCase": "Author",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "publisher",
                    "nameCamelCase": "publisher",
                    "namePascalCase": "Publisher",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Category",
                    "isCopy": false,
                    "isKey": false,
                    "name": "category",
                    "nameCamelCase": "category",
                    "namePascalCase": "Category",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "description": null,
            "id": "fcdfa519-b23b-a129-296b-90b34d98a7db",
            "elementView": {
                "_type": "org.uengine.modeling.model.Command",
                "height": 116,
                "id": "fcdfa519-b23b-a129-296b-90b34d98a7db",
                "style": "{}",
                "width": 100,
                "x": 556,
                "y": 250,
                "z-index": 999
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.CommandHexagonal",
                "height": 0,
                "id": "fcdfa519-b23b-a129-296b-90b34d98a7db",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0
            },
            "isRestRepository": false,
            "name": "CreateBook",
            "displayName": "도서 등록",
            "nameCamelCase": "createBook",
            "namePascalCase": "CreateBook",
            "namePlural": "createBooks",
            "relationCommandInfo": [],
            "relationEventInfo": [],
            "restRepositoryInfo": {
                "method": "POST"
            },
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PrePersist",
            "examples": [
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Book",
                            "value": {
                                "bookId": null,
                                "title": null,
                                "isbn": null,
                                "author": null,
                                "publisher": null,
                                "category": "N/A",
                                "status": "N/A"
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "CreateBook",
                            "value": {
                                "title": "해리 포터",
                                "isbn": "1234567890123",
                                "author": "J.K. 롤링",
                                "publisher": "문학사",
                                "category": "NOVEL"
                            }
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "BookCreated",
                            "value": {
                                "title": "해리 포터",
                                "isbn": "1234567890123",
                                "author": "J.K. 롤링",
                                "publisher": "문학사",
                                "category": "NOVEL",
                                "status": "AVAILABLE"
                            }
                        }
                    ]
                }
            ],
            "visibility": "public"
        },
        "ae7bd270-ac8c-7103-9866-c3e1867c019a": {
            "_type": "org.uengine.modeling.model.Command",
            "outputEvents": [
                "BookStatusChanged"
            ],
            "aggregate": {
                "id": "554241df-8091-4819-87d3-8fa38d18deaa"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "controllerInfo": {
                "method": "PUT",
                "apiPath": "changebookstatus"
            },
            "fieldDescriptors": [
                {
                    "className": "Status",
                    "isCopy": false,
                    "isKey": false,
                    "name": "status",
                    "nameCamelCase": "status",
                    "namePascalCase": "Status",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "reason",
                    "nameCamelCase": "reason",
                    "namePascalCase": "Reason",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "description": null,
            "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
            "elementView": {
                "_type": "org.uengine.modeling.model.Command",
                "height": 116,
                "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "style": "{}",
                "width": 100,
                "x": 556,
                "y": 380,
                "z-index": 999
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.CommandHexagonal",
                "height": 0,
                "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0
            },
            "isRestRepository": false,
            "name": "ChangeBookStatus",
            "displayName": "도서 상태 변경",
            "nameCamelCase": "changeBookStatus",
            "namePascalCase": "ChangeBookStatus",
            "namePlural": "changeBookStatuses",
            "relationCommandInfo": [],
            "relationEventInfo": [],
            "restRepositoryInfo": {
                "method": "PUT"
            },
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PrePersist",
            "examples": [
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Book",
                            "value": {
                                "bookId": "BOOK-001",
                                "title": "해리 포터",
                                "isbn": "1234567890123",
                                "author": "J.K. 롤링",
                                "publisher": "문학사",
                                "category": "NOVEL",
                                "status": "AVAILABLE"
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "ChangeBookStatus",
                            "value": {
                                "status": "BORROWED",
                                "reason": "사용자가 대출"
                            }
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "BookStatusChanged",
                            "value": {
                                "previousStatus": "AVAILABLE",
                                "currentStatus": "BORROWED",
                                "changeDate": "2024-03-20T00:00:00Z",
                                "reason": "사용자가 대출"
                            }
                        }
                    ]
                },
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Book",
                            "value": {
                                "bookId": "BOOK-002",
                                "title": "1984",
                                "isbn": "9876543210123",
                                "author": "조지 오웰",
                                "publisher": "문학사",
                                "category": "NOVEL",
                                "status": "BORROWED"
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "ChangeBookStatus",
                            "value": {
                                "status": "AVAILABLE",
                                "reason": "사용자가 반납"
                            }
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "BookStatusChanged",
                            "value": {
                                "previousStatus": "BORROWED",
                                "currentStatus": "AVAILABLE",
                                "changeDate": "2024-03-21T00:00:00Z",
                                "reason": "사용자가 반납"
                            }
                        }
                    ]
                },
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Book",
                            "value": {
                                "bookId": "BOOK-003",
                                "title": "데미안",
                                "isbn": "1122334455667",
                                "author": "헤르만 헤세",
                                "publisher": "문학사",
                                "category": "NOVEL",
                                "status": "AVAILABLE"
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "ChangeBookStatus",
                            "value": {
                                "status": "RESERVED",
                                "reason": "사용자가 예약"
                            }
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "BookStatusChanged",
                            "value": {
                                "previousStatus": "AVAILABLE",
                                "currentStatus": "RESERVED",
                                "changeDate": "2024-03-22T00:00:00Z",
                                "reason": "사용자가 예약"
                            }
                        }
                    ]
                },
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Book",
                            "value": {
                                "bookId": "BOOK-004",
                                "title": "호밀밭의 파수꾼",
                                "isbn": "9988776655443",
                                "author": "제롬 데이비드 샐린저",
                                "publisher": "문학사",
                                "category": "NOVEL",
                                "status": "AVAILABLE"
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "ChangeBookStatus",
                            "value": {
                                "status": "DISCARDED",
                                "reason": "오래된 도서 폐기"
                            }
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "BookStatusChanged",
                            "value": {
                                "previousStatus": "AVAILABLE",
                                "currentStatus": "DISCARDED",
                                "changeDate": "2024-03-23T00:00:00Z",
                                "reason": "오래된 도서 폐기"
                            }
                        }
                    ]
                }
            ],
            "visibility": "public",
            "oldName": "ChangeBookStatus"
        },
        "739e4179-c302-708b-a3e7-09878dca9a29": {
            "_type": "org.uengine.modeling.model.View",
            "id": "739e4179-c302-708b-a3e7-09878dca9a29",
            "visibility": "public",
            "name": "BookHistory",
            "oldName": "",
            "displayName": "도서 이력",
            "namePascalCase": "BookHistory",
            "namePlural": "bookHistories",
            "aggregate": {
                "id": "554241df-8091-4819-87d3-8fa38d18deaa"
            },
            "description": null,
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
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
            "queryParameters": [
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": true,
                    "name": "historyId",
                    "nameCamelCase": "historyId",
                    "namePascalCase": "HistoryId",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "changeDate",
                    "nameCamelCase": "changeDate",
                    "namePascalCase": "ChangeDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Status",
                    "isCopy": false,
                    "isKey": false,
                    "name": "status",
                    "nameCamelCase": "status",
                    "namePascalCase": "Status",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "userId",
                    "nameCamelCase": "userId",
                    "namePascalCase": "UserId",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "queryOption": {
                "apiPath": "",
                "useDefaultUri": true,
                "multipleResult": true
            },
            "controllerInfo": {
                "url": ""
            },
            "elementView": {
                "_type": "org.uengine.modeling.model.View",
                "id": "739e4179-c302-708b-a3e7-09878dca9a29",
                "x": 556,
                "y": 510,
                "width": 100,
                "height": 116,
                "style": "{}",
                "z-index": 999
            },
            "editingView": false,
            "dataProjection": "query-for-aggregate",
            "createRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "CREATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "updateRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "UPDATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "deleteRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "DELETE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "rotateStatus": false,
            "definitionId": ""
        },
        "65f57c13-6e15-18af-9892-1d47a205fba1": {
            "_type": "org.uengine.modeling.model.View",
            "id": "65f57c13-6e15-18af-9892-1d47a205fba1",
            "visibility": "public",
            "name": "BookDetails",
            "oldName": "",
            "displayName": "도서 상세정보",
            "namePascalCase": "BookDetails",
            "namePlural": "bookDetails",
            "aggregate": {
                "id": "554241df-8091-4819-87d3-8fa38d18deaa"
            },
            "description": null,
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
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
            "queryParameters": [
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "title",
                    "nameCamelCase": "title",
                    "namePascalCase": "Title",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "isbn",
                    "nameCamelCase": "isbn",
                    "namePascalCase": "Isbn",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "author",
                    "nameCamelCase": "author",
                    "namePascalCase": "Author",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "publisher",
                    "nameCamelCase": "publisher",
                    "namePascalCase": "Publisher",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Category",
                    "isCopy": false,
                    "isKey": false,
                    "name": "category",
                    "nameCamelCase": "category",
                    "namePascalCase": "Category",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Status",
                    "isCopy": false,
                    "isKey": false,
                    "name": "status",
                    "nameCamelCase": "status",
                    "namePascalCase": "Status",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "queryOption": {
                "apiPath": "",
                "useDefaultUri": true,
                "multipleResult": false
            },
            "controllerInfo": {
                "url": ""
            },
            "elementView": {
                "_type": "org.uengine.modeling.model.View",
                "id": "65f57c13-6e15-18af-9892-1d47a205fba1",
                "x": 556,
                "y": 640,
                "width": 100,
                "height": 116,
                "style": "{}",
                "z-index": 999
            },
            "editingView": false,
            "dataProjection": "query-for-aggregate",
            "createRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "CREATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "updateRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "UPDATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "deleteRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "DELETE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "rotateStatus": false,
            "definitionId": ""
        },
        "bc3d714f-e3f8-943e-b35d-976bb0f1bd0f": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "description": null,
            "id": "bc3d714f-e3f8-943e-b35d-976bb0f1bd0f",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "bc3d714f-e3f8-943e-b35d-976bb0f1bd0f",
                "style": "{}",
                "width": 100,
                "x": 475,
                "y": 250
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "Admin",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "1ff02715-95b2-38ce-7a08-1d9744801560": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "description": null,
            "id": "1ff02715-95b2-38ce-7a08-1d9744801560",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "1ff02715-95b2-38ce-7a08-1d9744801560",
                "style": "{}",
                "width": 100,
                "x": 475,
                "y": 380
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "Admin",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "e724b611-05fb-9b1c-1c85-156db2a5a928": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "description": null,
            "id": "e724b611-05fb-9b1c-1c85-156db2a5a928",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "e724b611-05fb-9b1c-1c85-156db2a5a928",
                "style": "{}",
                "width": 100,
                "x": 475,
                "y": 510
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "Admin",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "d9ef505f-9ac6-27f9-e8c4-f9b2136a20cb": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "description": null,
            "id": "d9ef505f-9ac6-27f9-e8c4-f9b2136a20cb",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "d9ef505f-9ac6-27f9-e8c4-f9b2136a20cb",
                "style": "{}",
                "width": 100,
                "x": 475,
                "y": 640
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "Admin",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "78937fb4-354e-7c45-ea1f-a9604081b75b": {
            "alertURL": "/static/image/symbol/alert-icon.png",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "checkAlert": true,
            "description": null,
            "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
            "elementView": {
                "angle": 0,
                "height": 116,
                "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "style": "{}",
                "width": 100,
                "x": 1329,
                "y": 250,
                "_type": "org.uengine.modeling.model.Event"
            },
            "fieldDescriptors": [
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "memberId",
                    "nameCamelCase": "memberId",
                    "namePascalCase": "MemberId",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "LoanDuration",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanDuration",
                    "nameCamelCase": "loanDuration",
                    "namePascalCase": "LoanDuration",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanDate",
                    "nameCamelCase": "loanDate",
                    "namePascalCase": "LoanDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "returnDueDate",
                    "nameCamelCase": "returnDueDate",
                    "namePascalCase": "ReturnDueDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "LoanStatus",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanStatus",
                    "nameCamelCase": "loanStatus",
                    "namePascalCase": "LoanStatus",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "hexagonalView": {
                "height": 0,
                "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0,
                "_type": "org.uengine.modeling.model.EventHexagonal"
            },
            "name": "LoanCreated",
            "displayName": "대출 생성",
            "nameCamelCase": "loanCreated",
            "namePascalCase": "LoanCreated",
            "namePlural": "",
            "relationCommandInfo": [],
            "relationPolicyInfo": [],
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PostPersist",
            "_type": "org.uengine.modeling.model.Event",
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "visibility": "public"
        },
        "efa0739f-ad74-5be2-0d5f-27a167cdc711": {
            "alertURL": "/static/image/symbol/alert-icon.png",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "checkAlert": true,
            "description": null,
            "id": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
            "elementView": {
                "angle": 0,
                "height": 116,
                "id": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
                "style": "{}",
                "width": 100,
                "x": 1329,
                "y": 380,
                "_type": "org.uengine.modeling.model.Event"
            },
            "fieldDescriptors": [
                {
                    "className": "LoanDuration",
                    "isCopy": false,
                    "isKey": false,
                    "name": "extensionDuration",
                    "nameCamelCase": "extensionDuration",
                    "namePascalCase": "ExtensionDuration",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "newReturnDueDate",
                    "nameCamelCase": "newReturnDueDate",
                    "namePascalCase": "NewReturnDueDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "hexagonalView": {
                "height": 0,
                "id": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0,
                "_type": "org.uengine.modeling.model.EventHexagonal"
            },
            "name": "LoanExtended",
            "displayName": "대출 연장됨",
            "nameCamelCase": "loanExtended",
            "namePascalCase": "LoanExtended",
            "namePlural": "",
            "relationCommandInfo": [],
            "relationPolicyInfo": [],
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PostPersist",
            "_type": "org.uengine.modeling.model.Event",
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "visibility": "public"
        },
        "ac75186c-693b-322d-9554-c112044993f4": {
            "alertURL": "/static/image/symbol/alert-icon.png",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "checkAlert": true,
            "description": null,
            "id": "ac75186c-693b-322d-9554-c112044993f4",
            "elementView": {
                "angle": 0,
                "height": 116,
                "id": "ac75186c-693b-322d-9554-c112044993f4",
                "style": "{}",
                "width": 100,
                "x": 1329,
                "y": 510,
                "_type": "org.uengine.modeling.model.Event"
            },
            "fieldDescriptors": [
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "returnDate",
                    "nameCamelCase": "returnDate",
                    "namePascalCase": "ReturnDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "LoanStatus",
                    "isCopy": false,
                    "isKey": false,
                    "name": "nextStatus",
                    "nameCamelCase": "nextStatus",
                    "namePascalCase": "NextStatus",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "hexagonalView": {
                "height": 0,
                "id": "ac75186c-693b-322d-9554-c112044993f4",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0,
                "_type": "org.uengine.modeling.model.EventHexagonal"
            },
            "name": "LoanReturned",
            "displayName": "대출 반납됨",
            "nameCamelCase": "loanReturned",
            "namePascalCase": "LoanReturned",
            "namePlural": "",
            "relationCommandInfo": [],
            "relationPolicyInfo": [],
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PostPersist",
            "_type": "org.uengine.modeling.model.Event",
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "visibility": "public"
        },
        "83df6bbe-e74e-3765-06a7-c79af07cb94d": {
            "_type": "org.uengine.modeling.model.Command",
            "outputEvents": [
                "LoanCreated"
            ],
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "controllerInfo": {
                "method": "POST",
                "apiPath": "/createloan"
            },
            "fieldDescriptors": [
                {
                    "className": "String",
                    "isCopy": false,
                    "isKey": false,
                    "name": "memberId",
                    "nameCamelCase": "memberId",
                    "namePascalCase": "MemberId",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "LoanDuration",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanDuration",
                    "nameCamelCase": "loanDuration",
                    "namePascalCase": "LoanDuration",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanDate",
                    "nameCamelCase": "loanDate",
                    "namePascalCase": "LoanDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "returnDueDate",
                    "nameCamelCase": "returnDueDate",
                    "namePascalCase": "ReturnDueDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "description": null,
            "id": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
            "elementView": {
                "_type": "org.uengine.modeling.model.Command",
                "height": 116,
                "id": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
                "style": "{}",
                "width": 100,
                "x": 1141,
                "y": 250,
                "z-index": 999
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.CommandHexagonal",
                "height": 0,
                "id": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0
            },
            "isRestRepository": false,
            "name": "CreateLoan",
            "displayName": "대출 신청",
            "nameCamelCase": "createLoan",
            "namePascalCase": "CreateLoan",
            "namePlural": "createLoans",
            "relationCommandInfo": [],
            "relationEventInfo": [],
            "restRepositoryInfo": {
                "method": "POST"
            },
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PrePersist",
            "examples": [
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Loan",
                            "value": {
                                "loanId": null,
                                "member": {
                                    "memberId": "MEMBER-001",
                                    "name": "홍길동"
                                },
                                "loanPeriod": null,
                                "loanStatus": "N/A",
                                "loanDate": null,
                                "returnDueDate": null,
                                "loanDuration": "N/A",
                                "bookId": {
                                    "bookId": "BOOK-001",
                                    "isbn": "9781234567890"
                                }
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "CreateLoan",
                            "value": {
                                "memberId": "MEMBER-001",
                                "loanDuration": "7_DAYS",
                                "loanDate": "2023-11-01",
                                "returnDueDate": "2023-11-08"
                            }
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "LoanCreated",
                            "value": {
                                "memberId": "MEMBER-001",
                                "loanDuration": "7_DAYS",
                                "loanDate": "2023-11-01",
                                "returnDueDate": "2023-11-08",
                                "loanStatus": "BORROWED"
                            }
                        }
                    ]
                }
            ],
            "visibility": "public",
            "oldName": "CreateLoan"
        },
        "b524c993-e776-e8fe-2fb9-4654540d48fe": {
            "_type": "org.uengine.modeling.model.Command",
            "outputEvents": [
                "LoanExtended"
            ],
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "controllerInfo": {
                "method": "PUT"
            },
            "fieldDescriptors": [
                {
                    "className": "LoanDuration",
                    "isCopy": false,
                    "isKey": false,
                    "name": "extensionDuration",
                    "nameCamelCase": "extensionDuration",
                    "namePascalCase": "ExtensionDuration",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "description": null,
            "id": "b524c993-e776-e8fe-2fb9-4654540d48fe",
            "elementView": {
                "_type": "org.uengine.modeling.model.Command",
                "height": 116,
                "id": "b524c993-e776-e8fe-2fb9-4654540d48fe",
                "style": "{}",
                "width": 100,
                "x": 1141,
                "y": 380,
                "z-index": 999
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.CommandHexagonal",
                "height": 0,
                "id": "b524c993-e776-e8fe-2fb9-4654540d48fe",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0
            },
            "isRestRepository": false,
            "name": "ExtendLoan",
            "displayName": "대출 연장",
            "nameCamelCase": "extendLoan",
            "namePascalCase": "ExtendLoan",
            "namePlural": "extendLoans",
            "relationCommandInfo": [],
            "relationEventInfo": [],
            "restRepositoryInfo": {
                "method": "PUT"
            },
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PrePersist",
            "examples": [
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Loan",
                            "value": {
                                "loanId": 1001,
                                "member": {
                                    "memberId": "MEMBER-001",
                                    "name": "홍길동"
                                },
                                "loanPeriod": 7,
                                "loanStatus": "BORROWED",
                                "loanDate": "2023-11-01",
                                "returnDueDate": "2023-11-08",
                                "loanDuration": "7_DAYS",
                                "bookId": {
                                    "bookId": "BOOK-001",
                                    "isbn": "9781234567890"
                                }
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "ExtendLoan",
                            "value": {
                                "extensionDuration": "7_DAYS"
                            }
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "LoanExtended",
                            "value": {
                                "extensionDuration": "7_DAYS",
                                "newReturnDueDate": "2023-11-15"
                            }
                        }
                    ]
                }
            ],
            "visibility": "public"
        },
        "1179f8d5-304f-fc47-74d8-4f93b8129008": {
            "_type": "org.uengine.modeling.model.Command",
            "outputEvents": [
                "LoanReturned"
            ],
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "controllerInfo": {
                "method": "PUT"
            },
            "fieldDescriptors": [],
            "description": null,
            "id": "1179f8d5-304f-fc47-74d8-4f93b8129008",
            "elementView": {
                "_type": "org.uengine.modeling.model.Command",
                "height": 116,
                "id": "1179f8d5-304f-fc47-74d8-4f93b8129008",
                "style": "{}",
                "width": 100,
                "x": 1141,
                "y": 510,
                "z-index": 999
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.CommandHexagonal",
                "height": 0,
                "id": "1179f8d5-304f-fc47-74d8-4f93b8129008",
                "style": "{}",
                "width": 0,
                "x": 0,
                "y": 0
            },
            "isRestRepository": false,
            "name": "ReturnLoan",
            "displayName": "대출 반납",
            "nameCamelCase": "returnLoan",
            "namePascalCase": "ReturnLoan",
            "namePlural": "returnLoans",
            "relationCommandInfo": [],
            "relationEventInfo": [],
            "restRepositoryInfo": {
                "method": "PUT"
            },
            "rotateStatus": false,
            "selected": false,
            "trigger": "@PrePersist",
            "examples": [
                {
                    "given": [
                        {
                            "type": "Aggregate",
                            "name": "Loan",
                            "value": {
                                "loanId": 1001,
                                "member": {
                                    "memberId": "MEMBER-001",
                                    "name": "홍길동"
                                },
                                "loanPeriod": 7,
                                "loanStatus": "BORROWED",
                                "loanDate": "2023-11-01",
                                "returnDueDate": "2023-11-08",
                                "loanDuration": "7_DAYS",
                                "bookId": {
                                    "bookId": "BOOK-001",
                                    "isbn": "9781234567890"
                                }
                            }
                        }
                    ],
                    "when": [
                        {
                            "type": "Command",
                            "name": "ReturnLoan",
                            "value": {}
                        }
                    ],
                    "then": [
                        {
                            "type": "Event",
                            "name": "LoanReturned",
                            "value": {
                                "returnDate": "2023-11-07",
                                "nextStatus": "AVAILABLE"
                            }
                        }
                    ]
                }
            ],
            "visibility": "public"
        },
        "ba4cf08a-138b-f78c-6beb-137aa4ce6c53": {
            "_type": "org.uengine.modeling.model.View",
            "id": "ba4cf08a-138b-f78c-6beb-137aa4ce6c53",
            "visibility": "public",
            "name": "LoanStatus",
            "oldName": "",
            "displayName": "대출 상태",
            "namePascalCase": "LoanStatus",
            "namePlural": "loanStatuses",
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "description": null,
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
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
            "queryParameters": [
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanDate",
                    "nameCamelCase": "loanDate",
                    "namePascalCase": "LoanDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "returnDueDate",
                    "nameCamelCase": "returnDueDate",
                    "namePascalCase": "ReturnDueDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "LoanStatus",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanStatus",
                    "nameCamelCase": "loanStatus",
                    "namePascalCase": "LoanStatus",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "queryOption": {
                "apiPath": "",
                "useDefaultUri": true,
                "multipleResult": true
            },
            "controllerInfo": {
                "url": ""
            },
            "elementView": {
                "_type": "org.uengine.modeling.model.View",
                "id": "ba4cf08a-138b-f78c-6beb-137aa4ce6c53",
                "x": 1141,
                "y": 640,
                "width": 100,
                "height": 116,
                "style": "{}",
                "z-index": 999
            },
            "editingView": false,
            "dataProjection": "query-for-aggregate",
            "createRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "CREATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "updateRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "UPDATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "deleteRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "DELETE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "rotateStatus": false,
            "definitionId": ""
        },
        "c0299480-37ae-dc00-eafe-8b423d09e34a": {
            "_type": "org.uengine.modeling.model.View",
            "id": "c0299480-37ae-dc00-eafe-8b423d09e34a",
            "visibility": "public",
            "name": "LoanDetails",
            "oldName": "",
            "displayName": "대출 세부 정보",
            "namePascalCase": "LoanDetails",
            "namePlural": "loanDetails",
            "aggregate": {
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
            },
            "description": null,
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
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
            "queryParameters": [
                {
                    "className": "Member",
                    "isCopy": false,
                    "isKey": false,
                    "name": "memberDetails",
                    "nameCamelCase": "memberDetails",
                    "namePascalCase": "MemberDetails",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanDate",
                    "nameCamelCase": "loanDate",
                    "namePascalCase": "LoanDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "returnDueDate",
                    "nameCamelCase": "returnDueDate",
                    "namePascalCase": "ReturnDueDate",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "LoanStatus",
                    "isCopy": false,
                    "isKey": false,
                    "name": "loanStatus",
                    "nameCamelCase": "loanStatus",
                    "namePascalCase": "LoanStatus",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Integer",
                    "isCopy": false,
                    "isKey": false,
                    "name": "extensions",
                    "nameCamelCase": "extensions",
                    "namePascalCase": "Extensions",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "createdAt",
                    "nameCamelCase": "createdAt",
                    "namePascalCase": "CreatedAt",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                },
                {
                    "className": "Date",
                    "isCopy": false,
                    "isKey": false,
                    "name": "lastModifiedAt",
                    "nameCamelCase": "lastModifiedAt",
                    "namePascalCase": "LastModifiedAt",
                    "displayName": "",
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            ],
            "queryOption": {
                "apiPath": "",
                "useDefaultUri": true,
                "multipleResult": false
            },
            "controllerInfo": {
                "url": ""
            },
            "elementView": {
                "_type": "org.uengine.modeling.model.View",
                "id": "c0299480-37ae-dc00-eafe-8b423d09e34a",
                "x": 1141,
                "y": 770,
                "width": 100,
                "height": 116,
                "style": "{}",
                "z-index": 999
            },
            "editingView": false,
            "dataProjection": "query-for-aggregate",
            "createRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "CREATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "updateRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "UPDATE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null,
                            "operator": "="
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "deleteRules": [
                {
                    "_type": "viewStoreRule",
                    "operation": "DELETE",
                    "when": null,
                    "fieldMapping": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ],
                    "where": [
                        {
                            "viewField": null,
                            "eventField": null
                        }
                    ]
                }
            ],
            "rotateStatus": false,
            "definitionId": ""
        },
        "c057a98f-46c0-406f-e1ef-9038a557fd9a": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "description": null,
            "id": "c057a98f-46c0-406f-e1ef-9038a557fd9a",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "c057a98f-46c0-406f-e1ef-9038a557fd9a",
                "style": "{}",
                "width": 100,
                "x": 1060,
                "y": 250
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "회원",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "d0141724-e51b-ddf3-3c84-c245b9846a65": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "description": null,
            "id": "d0141724-e51b-ddf3-3c84-c245b9846a65",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "d0141724-e51b-ddf3-3c84-c245b9846a65",
                "style": "{}",
                "width": 100,
                "x": 1060,
                "y": 380
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "회원",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "354b804b-3689-6240-d6ae-c78607e2bb89": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "description": null,
            "id": "354b804b-3689-6240-d6ae-c78607e2bb89",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "354b804b-3689-6240-d6ae-c78607e2bb89",
                "style": "{}",
                "width": 100,
                "x": 1060,
                "y": 510
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "회원",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "67f61a87-74f8-a9ea-6a9e-5a605e1a25d4": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "description": null,
            "id": "67f61a87-74f8-a9ea-6a9e-5a605e1a25d4",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "67f61a87-74f8-a9ea-6a9e-5a605e1a25d4",
                "style": "{}",
                "width": 100,
                "x": 1060,
                "y": 640
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "회원",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "e17a9268-9129-caea-2c8f-2849d2c9e063": {
            "_type": "org.uengine.modeling.model.Actor",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
            },
            "description": null,
            "id": "e17a9268-9129-caea-2c8f-2849d2c9e063",
            "elementView": {
                "_type": "org.uengine.modeling.model.Actor",
                "height": 100,
                "id": "e17a9268-9129-caea-2c8f-2849d2c9e063",
                "style": "{}",
                "width": 100,
                "x": 1060,
                "y": 770
            },
            "innerAggregate": {
                "command": [],
                "event": [],
                "external": [],
                "policy": [],
                "view": []
            },
            "name": "회원",
            "oldName": "",
            "rotateStatus": false,
            "displayName": ""
        },
        "dcfad35d-4305-25a5-993d-9426931c4ee6": {
            "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "description": "도서 대출 후 상태를 '대출중'으로 변경",
            "elementView": {
                "height": 116,
                "width": 100,
                "x": 425,
                "y": 240,
                "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "style": "{}",
                "_type": "org.uengine.modeling.model.Policy"
            },
            "fieldDescriptors": [],
            "hexagonalView": {
                "height": 20,
                "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "style": "{}",
                "subWidth": 100,
                "width": 20,
                "_type": "org.uengine.modeling.model.PolicyHexagonal"
            },
            "isSaga": false,
            "name": "UpdateLoanBookStatusPolicy",
            "displayName": "대출 도서 상태 변경",
            "nameCamelCase": "updateLoanBookStatusPolicy",
            "namePascalCase": "UpdateLoanBookStatusPolicy",
            "namePlural": "updateLoanBookStatusPolicies",
            "oldName": "",
            "rotateStatus": false,
            "_type": "org.uengine.modeling.model.Policy"
        },
        "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0": {
            "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "boundedContext": {
                "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
            },
            "description": "도서 반납 후 상태를 '대출가능'으로 변경",
            "elementView": {
                "height": 116,
                "width": 100,
                "x": 425,
                "y": 472,
                "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "style": "{}",
                "_type": "org.uengine.modeling.model.Policy"
            },
            "fieldDescriptors": [],
            "hexagonalView": {
                "height": 20,
                "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "style": "{}",
                "subWidth": 100,
                "width": 20,
                "_type": "org.uengine.modeling.model.PolicyHexagonal"
            },
            "isSaga": false,
            "name": "ReturnBookStatusPolicy",
            "displayName": "반납 도서 상태 변경",
            "nameCamelCase": "returnBookStatusPolicy",
            "namePascalCase": "ReturnBookStatusPolicy",
            "namePlural": "returnBookStatusPolicies",
            "oldName": "",
            "rotateStatus": false,
            "_type": "org.uengine.modeling.model.Policy"
        }
    },
    "relations": {
        "8e86c434-1dae-0ebd-04ae-b81e3646d927": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "8e86c434-1dae-0ebd-04ae-b81e3646d927",
            "sourceElement": {
                "aggregateRoot": {
                    "_type": "org.uengine.modeling.model.AggregateRoot",
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Member",
                            "isCopy": false,
                            "isKey": false,
                            "name": "member",
                            "nameCamelCase": "member",
                            "namePascalCase": "Member",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Integer",
                            "isCopy": false,
                            "isKey": false,
                            "name": "loanPeriod",
                            "nameCamelCase": "loanPeriod",
                            "namePascalCase": "LoanPeriod",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "LoanStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "loanStatus",
                            "nameCamelCase": "loanStatus",
                            "namePascalCase": "LoanStatus",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "loanDate",
                            "nameCamelCase": "loanDate",
                            "namePascalCase": "LoanDate",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "returnDueDate",
                            "nameCamelCase": "returnDueDate",
                            "namePascalCase": "ReturnDueDate",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "LoanDuration",
                            "isCopy": false,
                            "isKey": false,
                            "name": "loanDuration",
                            "nameCamelCase": "loanDuration",
                            "namePascalCase": "LoanDuration",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "entities": {
                        "elements": {
                            "30397330-2606-86f2-57f4-bf677bae16dc": {
                                "_type": "org.uengine.uml.model.Class",
                                "id": "30397330-2606-86f2-57f4-bf677bae16dc",
                                "name": "Loan",
                                "namePascalCase": "Loan",
                                "nameCamelCase": "loan",
                                "namePlural": "Loans",
                                "fieldDescriptors": [
                                    {
                                        "className": "Long",
                                        "isCopy": false,
                                        "isKey": true,
                                        "name": "loanId",
                                        "displayName": "",
                                        "nameCamelCase": "loanId",
                                        "namePascalCase": "LoanId",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "Member",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "member",
                                        "displayName": "",
                                        "nameCamelCase": "member",
                                        "namePascalCase": "Member",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "Integer",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "loanPeriod",
                                        "displayName": "",
                                        "nameCamelCase": "loanPeriod",
                                        "namePascalCase": "LoanPeriod",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "LoanStatus",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "loanStatus",
                                        "displayName": "",
                                        "nameCamelCase": "loanStatus",
                                        "namePascalCase": "LoanStatus",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "Date",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "loanDate",
                                        "displayName": "",
                                        "nameCamelCase": "loanDate",
                                        "namePascalCase": "LoanDate",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "Date",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "returnDueDate",
                                        "displayName": "",
                                        "nameCamelCase": "returnDueDate",
                                        "namePascalCase": "ReturnDueDate",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "LoanDuration",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "loanDuration",
                                        "displayName": "",
                                        "nameCamelCase": "loanDuration",
                                        "namePascalCase": "LoanDuration",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    }
                                ],
                                "operations": [],
                                "elementView": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "30397330-2606-86f2-57f4-bf677bae16dc",
                                    "x": 200,
                                    "y": 200,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 120,
                                    "fieldH": 90,
                                    "methodH": 30
                                },
                                "selected": false,
                                "relations": [],
                                "parentOperations": [],
                                "relationType": null,
                                "isVO": false,
                                "isAbstract": false,
                                "isInterface": false,
                                "isAggregateRoot": true,
                                "parentId": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                            },
                            "09ee5a03-4449-1bde-3705-35c2ca198880": {
                                "_type": "org.uengine.uml.model.vo.Class",
                                "id": "09ee5a03-4449-1bde-3705-35c2ca198880",
                                "name": "Member",
                                "displayName": "회원",
                                "namePascalCase": "Member",
                                "nameCamelCase": "member",
                                "fieldDescriptors": [
                                    {
                                        "className": "String",
                                        "isKey": false,
                                        "label": "- memberId: String",
                                        "name": "memberId",
                                        "nameCamelCase": "memberId",
                                        "namePascalCase": "MemberId",
                                        "displayName": "",
                                        "referenceClass": null,
                                        "isOverrideField": false,
                                        "_type": "org.uengine.model.FieldDescriptor"
                                    },
                                    {
                                        "className": "String",
                                        "isKey": false,
                                        "label": "- name: String",
                                        "name": "name",
                                        "nameCamelCase": "name",
                                        "namePascalCase": "Name",
                                        "displayName": "",
                                        "referenceClass": null,
                                        "isOverrideField": false,
                                        "_type": "org.uengine.model.FieldDescriptor"
                                    }
                                ],
                                "operations": [],
                                "elementView": {
                                    "_type": "org.uengine.uml.model.vo.address.Class",
                                    "id": "09ee5a03-4449-1bde-3705-35c2ca198880",
                                    "x": 700,
                                    "y": 152,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 170,
                                    "fieldH": 150,
                                    "methodH": 30
                                },
                                "selected": false,
                                "parentOperations": [],
                                "relationType": null,
                                "isVO": true,
                                "relations": [],
                                "groupElement": null,
                                "isAggregateRoot": false,
                                "namePlural": "Members",
                                "isAbstract": false,
                                "isInterface": false
                            },
                            "bfdf118a-ad46-c0e3-2ae4-d0372b9d8361": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "bfdf118a-ad46-c0e3-2ae4-d0372b9d8361",
                                "name": "LoanStatus",
                                "displayName": "대출 상태",
                                "nameCamelCase": "loanStatus",
                                "namePascalCase": "LoanStatus",
                                "namePlural": "loanStatuses",
                                "elementView": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "bfdf118a-ad46-c0e3-2ae4-d0372b9d8361",
                                    "x": 700,
                                    "y": 456,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 50
                                },
                                "selected": false,
                                "items": [
                                    {
                                        "value": "BORROWED"
                                    },
                                    {
                                        "value": "OVERDUE"
                                    },
                                    {
                                        "value": "RETURNED"
                                    }
                                ],
                                "useKeyValue": false,
                                "relations": []
                            },
                            "8c1b2fee-54a7-b460-486a-1453593fac3f": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "8c1b2fee-54a7-b460-486a-1453593fac3f",
                                "name": "LoanDuration",
                                "displayName": "대출 기간 옵션",
                                "nameCamelCase": "loanDuration",
                                "namePascalCase": "LoanDuration",
                                "namePlural": "loanDurations",
                                "elementView": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "8c1b2fee-54a7-b460-486a-1453593fac3f",
                                    "x": 950,
                                    "y": 456,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 50
                                },
                                "selected": false,
                                "items": [
                                    {
                                        "value": "7_DAYS"
                                    },
                                    {
                                        "value": "14_DAYS"
                                    },
                                    {
                                        "value": "30_DAYS"
                                    }
                                ],
                                "useKeyValue": false,
                                "relations": []
                            }
                        },
                        "relations": {}
                    },
                    "operations": []
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "name": "85c498d4-39ed-5546-59b8-8eaaf33cffc8",
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                },
                "commands": [],
                "description": null,
                "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Aggregate",
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
                    "x": 1235,
                    "y": 450,
                    "width": 130,
                    "height": 400
                },
                "events": [],
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.AggregateHexagonal",
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
                    "x": 0,
                    "y": 0,
                    "subWidth": 0,
                    "width": 0
                },
                "name": "Loan",
                "displayName": "대출",
                "nameCamelCase": "loan",
                "namePascalCase": "Loan",
                "namePlural": "loans",
                "rotateStatus": false,
                "selected": false,
                "_type": "org.uengine.modeling.model.Aggregate"
            },
            "targetElement": {
                "aggregateRoot": {
                    "_type": "org.uengine.modeling.model.AggregateRoot",
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "bookId",
                            "nameCamelCase": "bookId",
                            "namePascalCase": "BookId",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "title",
                            "nameCamelCase": "title",
                            "namePascalCase": "Title",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "isbn",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "author",
                            "nameCamelCase": "author",
                            "namePascalCase": "Author",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "publisher",
                            "nameCamelCase": "publisher",
                            "namePascalCase": "Publisher",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Category",
                            "isCopy": false,
                            "isKey": false,
                            "name": "category",
                            "nameCamelCase": "category",
                            "namePascalCase": "Category",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Status",
                            "isCopy": false,
                            "isKey": false,
                            "name": "status",
                            "nameCamelCase": "status",
                            "namePascalCase": "Status",
                            "displayName": "",
                            "referenceClass": null,
                            "isOverrideField": false,
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "entities": {
                        "elements": {
                            "0a22d0ce-0f1d-80fa-42b3-19647aa41149": {
                                "_type": "org.uengine.uml.model.Class",
                                "id": "0a22d0ce-0f1d-80fa-42b3-19647aa41149",
                                "name": "Book",
                                "namePascalCase": "Book",
                                "nameCamelCase": "book",
                                "namePlural": "Books",
                                "fieldDescriptors": [
                                    {
                                        "className": "String",
                                        "isCopy": false,
                                        "isKey": true,
                                        "name": "bookId",
                                        "displayName": "",
                                        "nameCamelCase": "bookId",
                                        "namePascalCase": "BookId",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "String",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "title",
                                        "displayName": "",
                                        "nameCamelCase": "title",
                                        "namePascalCase": "Title",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "String",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "isbn",
                                        "displayName": "",
                                        "nameCamelCase": "isbn",
                                        "namePascalCase": "Isbn",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "String",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "author",
                                        "displayName": "",
                                        "nameCamelCase": "author",
                                        "namePascalCase": "Author",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "String",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "publisher",
                                        "displayName": "",
                                        "nameCamelCase": "publisher",
                                        "namePascalCase": "Publisher",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "Category",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "category",
                                        "displayName": "",
                                        "nameCamelCase": "category",
                                        "namePascalCase": "Category",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    },
                                    {
                                        "className": "Status",
                                        "isCopy": false,
                                        "isKey": false,
                                        "name": "status",
                                        "displayName": "",
                                        "nameCamelCase": "status",
                                        "namePascalCase": "Status",
                                        "_type": "org.uengine.model.FieldDescriptor",
                                        "inputUI": null,
                                        "options": null
                                    }
                                ],
                                "operations": [],
                                "elementView": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "0a22d0ce-0f1d-80fa-42b3-19647aa41149",
                                    "x": 200,
                                    "y": 200,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 120,
                                    "fieldH": 90,
                                    "methodH": 30
                                },
                                "selected": false,
                                "relations": [],
                                "parentOperations": [],
                                "relationType": null,
                                "isVO": false,
                                "isAbstract": false,
                                "isInterface": false,
                                "isAggregateRoot": true,
                                "parentId": "554241df-8091-4819-87d3-8fa38d18deaa"
                            },
                            "e029780c-da79-3641-c1f3-8e45ebd5bfb7": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "e029780c-da79-3641-c1f3-8e45ebd5bfb7",
                                "name": "Category",
                                "displayName": "도서 카테고리",
                                "nameCamelCase": "category",
                                "namePascalCase": "Category",
                                "namePlural": "categories",
                                "elementView": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "e029780c-da79-3641-c1f3-8e45ebd5bfb7",
                                    "x": 700,
                                    "y": 456,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 50
                                },
                                "selected": false,
                                "items": [
                                    {
                                        "value": "NOVEL"
                                    },
                                    {
                                        "value": "NONFICTION"
                                    },
                                    {
                                        "value": "ACADEMIC"
                                    },
                                    {
                                        "value": "MAGAZINE"
                                    }
                                ],
                                "useKeyValue": false,
                                "relations": []
                            },
                            "3abb79e5-1456-e11b-560b-1483b5807a68": {
                                "_type": "org.uengine.uml.model.enum",
                                "id": "3abb79e5-1456-e11b-560b-1483b5807a68",
                                "name": "Status",
                                "displayName": "도서 상태",
                                "nameCamelCase": "status",
                                "namePascalCase": "Status",
                                "namePlural": "statuses",
                                "elementView": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "3abb79e5-1456-e11b-560b-1483b5807a68",
                                    "x": 950,
                                    "y": 456,
                                    "width": 200,
                                    "height": 100,
                                    "style": "{}",
                                    "titleH": 50,
                                    "subEdgeH": 50
                                },
                                "selected": false,
                                "items": [
                                    {
                                        "value": "AVAILABLE"
                                    },
                                    {
                                        "value": "BORROWED"
                                    },
                                    {
                                        "value": "RESERVED"
                                    },
                                    {
                                        "value": "DISCARDED"
                                    }
                                ],
                                "useKeyValue": false,
                                "relations": []
                            }
                        },
                        "relations": {}
                    },
                    "operations": []
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "name": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741",
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "commands": [],
                "description": null,
                "id": "554241df-8091-4819-87d3-8fa38d18deaa",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Aggregate",
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa",
                    "x": 650,
                    "y": 450,
                    "width": 130,
                    "height": 400
                },
                "events": [],
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.AggregateHexagonal",
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa",
                    "x": 0,
                    "y": 0,
                    "subWidth": 0,
                    "width": 0
                },
                "name": "Book",
                "displayName": "도서",
                "nameCamelCase": "book",
                "namePascalCase": "Book",
                "namePlural": "books",
                "rotateStatus": false,
                "selected": false,
                "_type": "org.uengine.modeling.model.Aggregate"
            },
            "from": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
            "to": "554241df-8091-4819-87d3-8fa38d18deaa",
            "relationView": {
                "id": "8e86c434-1dae-0ebd-04ae-b81e3646d927",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
                "to": "554241df-8091-4819-87d3-8fa38d18deaa",
                "needReconnect": true,
                "value": "[[1170,524],[944,524],[944,456],[715,456]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "f8dc3056-6183-539a-7f20-68681ddcc8a2",
                "id": "8e86c434-1dae-0ebd-04ae-b81e3646d927",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "554241df-8091-4819-87d3-8fa38d18deaa",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "abdff6e1-deb4-4dea-426c-3c0b32661397": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "abdff6e1-deb4-4dea-426c-3c0b32661397",
            "sourceElement": {
                "_type": "org.uengine.modeling.model.Command",
                "outputEvents": [
                    "BookCreated"
                ],
                "aggregate": {
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "controllerInfo": {
                    "method": "POST"
                },
                "fieldDescriptors": [
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "title",
                        "nameCamelCase": "title",
                        "namePascalCase": "Title",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "isbn",
                        "nameCamelCase": "isbn",
                        "namePascalCase": "Isbn",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "author",
                        "nameCamelCase": "author",
                        "namePascalCase": "Author",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "publisher",
                        "nameCamelCase": "publisher",
                        "namePascalCase": "Publisher",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Category",
                        "isCopy": false,
                        "isKey": false,
                        "name": "category",
                        "nameCamelCase": "category",
                        "namePascalCase": "Category",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "description": null,
                "id": "fcdfa519-b23b-a129-296b-90b34d98a7db",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "fcdfa519-b23b-a129-296b-90b34d98a7db",
                    "style": "{}",
                    "width": 100,
                    "x": 556,
                    "y": 250,
                    "z-index": 999
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "fcdfa519-b23b-a129-296b-90b34d98a7db",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "isRestRepository": false,
                "name": "CreateBook",
                "displayName": "도서 등록",
                "nameCamelCase": "createBook",
                "namePascalCase": "CreateBook",
                "namePlural": "createBooks",
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "POST"
                },
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PrePersist"
            },
            "targetElement": {
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "checkAlert": true,
                "description": null,
                "id": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
                "elementView": {
                    "angle": 0,
                    "height": 115,
                    "id": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
                    "style": "{}",
                    "width": 100,
                    "x": 744,
                    "y": 250,
                    "_type": "org.uengine.modeling.model.Event"
                },
                "fieldDescriptors": [
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "title",
                        "nameCamelCase": "title",
                        "namePascalCase": "Title",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "isbn",
                        "nameCamelCase": "isbn",
                        "namePascalCase": "Isbn",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "author",
                        "nameCamelCase": "author",
                        "namePascalCase": "Author",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "publisher",
                        "nameCamelCase": "publisher",
                        "namePascalCase": "Publisher",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Category",
                        "isCopy": false,
                        "isKey": false,
                        "name": "category",
                        "nameCamelCase": "category",
                        "namePascalCase": "Category",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Status",
                        "isCopy": false,
                        "isKey": false,
                        "name": "status",
                        "nameCamelCase": "status",
                        "namePascalCase": "Status",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "hexagonalView": {
                    "height": 0,
                    "id": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0,
                    "_type": "org.uengine.modeling.model.EventHexagonal"
                },
                "name": "BookCreated",
                "displayName": "도서 등록됨",
                "nameCamelCase": "bookCreated",
                "namePascalCase": "BookCreated",
                "namePlural": "",
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PostPersist",
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa"
                },
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                }
            },
            "from": "fcdfa519-b23b-a129-296b-90b34d98a7db",
            "to": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
            "relationView": {
                "id": "abdff6e1-deb4-4dea-426c-3c0b32661397",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "fcdfa519-b23b-a129-296b-90b34d98a7db",
                "to": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
                "needReconnect": true,
                "value": "[[606,252],[694,252]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "fcdfa519-b23b-a129-296b-90b34d98a7db",
                "id": "abdff6e1-deb4-4dea-426c-3c0b32661397",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "5afcf0dc-5c3b-f67a-d273-fab421febc20",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "347c91c4-3478-cef4-4493-208a8a50dafb": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "347c91c4-3478-cef4-4493-208a8a50dafb",
            "sourceElement": {
                "_type": "org.uengine.modeling.model.Command",
                "outputEvents": [
                    "BookStatusChanged"
                ],
                "aggregate": {
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "controllerInfo": {
                    "method": "PUT"
                },
                "fieldDescriptors": [
                    {
                        "className": "Status",
                        "isCopy": false,
                        "isKey": false,
                        "name": "status",
                        "nameCamelCase": "status",
                        "namePascalCase": "Status",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "reason",
                        "nameCamelCase": "reason",
                        "namePascalCase": "Reason",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "description": null,
                "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                    "style": "{}",
                    "width": 100,
                    "x": 556,
                    "y": 380,
                    "z-index": 999
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "isRestRepository": false,
                "name": "ChangeBookStatus",
                "displayName": "도서 상태 변경",
                "nameCamelCase": "changeBookStatus",
                "namePascalCase": "ChangeBookStatus",
                "namePlural": "changeBookStatuses",
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "PUT"
                },
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PrePersist"
            },
            "targetElement": {
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "checkAlert": true,
                "description": null,
                "id": "a82665ee-dc60-21db-a491-8fffbc623007",
                "elementView": {
                    "angle": 0,
                    "height": 115,
                    "id": "a82665ee-dc60-21db-a491-8fffbc623007",
                    "style": "{}",
                    "width": 100,
                    "x": 744,
                    "y": 380,
                    "_type": "org.uengine.modeling.model.Event"
                },
                "fieldDescriptors": [
                    {
                        "className": "Status",
                        "isCopy": false,
                        "isKey": false,
                        "name": "previousStatus",
                        "nameCamelCase": "previousStatus",
                        "namePascalCase": "PreviousStatus",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Status",
                        "isCopy": false,
                        "isKey": false,
                        "name": "currentStatus",
                        "nameCamelCase": "currentStatus",
                        "namePascalCase": "CurrentStatus",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "changeDate",
                        "nameCamelCase": "changeDate",
                        "namePascalCase": "ChangeDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "reason",
                        "nameCamelCase": "reason",
                        "namePascalCase": "Reason",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "hexagonalView": {
                    "height": 0,
                    "id": "a82665ee-dc60-21db-a491-8fffbc623007",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0,
                    "_type": "org.uengine.modeling.model.EventHexagonal"
                },
                "name": "BookStatusChanged",
                "displayName": "도서 상태 변경됨",
                "nameCamelCase": "bookStatusChanged",
                "namePascalCase": "BookStatusChanged",
                "namePlural": "",
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PostPersist",
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa"
                },
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                }
            },
            "from": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
            "to": "a82665ee-dc60-21db-a491-8fffbc623007",
            "relationView": {
                "id": "347c91c4-3478-cef4-4493-208a8a50dafb",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "to": "a82665ee-dc60-21db-a491-8fffbc623007",
                "needReconnect": true,
                "value": "[[606,380],[694,380]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "id": "347c91c4-3478-cef4-4493-208a8a50dafb",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "a82665ee-dc60-21db-a491-8fffbc623007",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "295dd65b-874b-00ae-910f-8eba75db08f1": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "295dd65b-874b-00ae-910f-8eba75db08f1",
            "sourceElement": {
                "_type": "org.uengine.modeling.model.Command",
                "outputEvents": [
                    "LoanCreated"
                ],
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                },
                "controllerInfo": {
                    "method": "POST"
                },
                "fieldDescriptors": [
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "memberId",
                        "nameCamelCase": "memberId",
                        "namePascalCase": "MemberId",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanDuration",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDuration",
                        "nameCamelCase": "loanDuration",
                        "namePascalCase": "LoanDuration",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDate",
                        "nameCamelCase": "loanDate",
                        "namePascalCase": "LoanDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "returnDueDate",
                        "nameCamelCase": "returnDueDate",
                        "namePascalCase": "ReturnDueDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "description": null,
                "id": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
                    "style": "{}",
                    "width": 100,
                    "x": 1141,
                    "y": 250,
                    "z-index": 999
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "isRestRepository": false,
                "name": "CreateLoan",
                "displayName": "대출 신청",
                "nameCamelCase": "createLoan",
                "namePascalCase": "CreateLoan",
                "namePlural": "createLoans",
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "POST"
                },
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PrePersist"
            },
            "targetElement": {
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "checkAlert": true,
                "description": null,
                "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "elementView": {
                    "angle": 0,
                    "height": 115,
                    "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                    "style": "{}",
                    "width": 100,
                    "x": 1329,
                    "y": 250,
                    "_type": "org.uengine.modeling.model.Event"
                },
                "fieldDescriptors": [
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "memberId",
                        "nameCamelCase": "memberId",
                        "namePascalCase": "MemberId",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanDuration",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDuration",
                        "nameCamelCase": "loanDuration",
                        "namePascalCase": "LoanDuration",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDate",
                        "nameCamelCase": "loanDate",
                        "namePascalCase": "LoanDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "returnDueDate",
                        "nameCamelCase": "returnDueDate",
                        "namePascalCase": "ReturnDueDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanStatus",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanStatus",
                        "nameCamelCase": "loanStatus",
                        "namePascalCase": "LoanStatus",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "hexagonalView": {
                    "height": 0,
                    "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0,
                    "_type": "org.uengine.modeling.model.EventHexagonal"
                },
                "name": "LoanCreated",
                "displayName": "대출 생성",
                "nameCamelCase": "loanCreated",
                "namePascalCase": "LoanCreated",
                "namePlural": "",
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PostPersist",
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                }
            },
            "from": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
            "to": "78937fb4-354e-7c45-ea1f-a9604081b75b",
            "relationView": {
                "id": "295dd65b-874b-00ae-910f-8eba75db08f1",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
                "to": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "needReconnect": true,
                "value": "[[1191,252],[1279,252]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "83df6bbe-e74e-3765-06a7-c79af07cb94d",
                "id": "295dd65b-874b-00ae-910f-8eba75db08f1",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "2f10ed41-ab75-4f4d-68ab-526c59d76ee2": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "2f10ed41-ab75-4f4d-68ab-526c59d76ee2",
            "sourceElement": {
                "_type": "org.uengine.modeling.model.Command",
                "outputEvents": [
                    "LoanExtended"
                ],
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                },
                "controllerInfo": {
                    "method": "PUT"
                },
                "fieldDescriptors": [
                    {
                        "className": "LoanDuration",
                        "isCopy": false,
                        "isKey": false,
                        "name": "extensionDuration",
                        "nameCamelCase": "extensionDuration",
                        "namePascalCase": "ExtensionDuration",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "description": null,
                "id": "b524c993-e776-e8fe-2fb9-4654540d48fe",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "b524c993-e776-e8fe-2fb9-4654540d48fe",
                    "style": "{}",
                    "width": 100,
                    "x": 1141,
                    "y": 380,
                    "z-index": 999
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "b524c993-e776-e8fe-2fb9-4654540d48fe",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "isRestRepository": false,
                "name": "ExtendLoan",
                "displayName": "대출 연장",
                "nameCamelCase": "extendLoan",
                "namePascalCase": "ExtendLoan",
                "namePlural": "extendLoans",
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "PUT"
                },
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PrePersist"
            },
            "targetElement": {
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "checkAlert": true,
                "description": null,
                "id": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
                "elementView": {
                    "angle": 0,
                    "height": 115,
                    "id": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
                    "style": "{}",
                    "width": 100,
                    "x": 1329,
                    "y": 380,
                    "_type": "org.uengine.modeling.model.Event"
                },
                "fieldDescriptors": [
                    {
                        "className": "LoanDuration",
                        "isCopy": false,
                        "isKey": false,
                        "name": "extensionDuration",
                        "nameCamelCase": "extensionDuration",
                        "namePascalCase": "ExtensionDuration",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "newReturnDueDate",
                        "nameCamelCase": "newReturnDueDate",
                        "namePascalCase": "NewReturnDueDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "hexagonalView": {
                    "height": 0,
                    "id": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0,
                    "_type": "org.uengine.modeling.model.EventHexagonal"
                },
                "name": "LoanExtended",
                "displayName": "대출 연장됨",
                "nameCamelCase": "loanExtended",
                "namePascalCase": "LoanExtended",
                "namePlural": "",
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PostPersist",
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                }
            },
            "from": "b524c993-e776-e8fe-2fb9-4654540d48fe",
            "to": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
            "relationView": {
                "id": "2f10ed41-ab75-4f4d-68ab-526c59d76ee2",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "b524c993-e776-e8fe-2fb9-4654540d48fe",
                "to": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
                "needReconnect": true,
                "value": "[[1191,380],[1279,380]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "b524c993-e776-e8fe-2fb9-4654540d48fe",
                "id": "2f10ed41-ab75-4f4d-68ab-526c59d76ee2",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "efa0739f-ad74-5be2-0d5f-27a167cdc711",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "20476c5e-0541-5f9d-d188-02fce5fe93cd": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "20476c5e-0541-5f9d-d188-02fce5fe93cd",
            "sourceElement": {
                "_type": "org.uengine.modeling.model.Command",
                "outputEvents": [
                    "LoanReturned"
                ],
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                },
                "controllerInfo": {
                    "method": "PUT"
                },
                "fieldDescriptors": [],
                "description": null,
                "id": "1179f8d5-304f-fc47-74d8-4f93b8129008",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "1179f8d5-304f-fc47-74d8-4f93b8129008",
                    "style": "{}",
                    "width": 100,
                    "x": 1141,
                    "y": 510,
                    "z-index": 999
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "1179f8d5-304f-fc47-74d8-4f93b8129008",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "isRestRepository": false,
                "name": "ReturnLoan",
                "displayName": "대출 반납",
                "nameCamelCase": "returnLoan",
                "namePascalCase": "ReturnLoan",
                "namePlural": "returnLoans",
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "PUT"
                },
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PrePersist"
            },
            "targetElement": {
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "checkAlert": true,
                "description": null,
                "id": "ac75186c-693b-322d-9554-c112044993f4",
                "elementView": {
                    "angle": 0,
                    "height": 115,
                    "id": "ac75186c-693b-322d-9554-c112044993f4",
                    "style": "{}",
                    "width": 100,
                    "x": 1329,
                    "y": 510,
                    "_type": "org.uengine.modeling.model.Event"
                },
                "fieldDescriptors": [
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "returnDate",
                        "nameCamelCase": "returnDate",
                        "namePascalCase": "ReturnDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanStatus",
                        "isCopy": false,
                        "isKey": false,
                        "name": "nextStatus",
                        "nameCamelCase": "nextStatus",
                        "namePascalCase": "NextStatus",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "hexagonalView": {
                    "height": 0,
                    "id": "ac75186c-693b-322d-9554-c112044993f4",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0,
                    "_type": "org.uengine.modeling.model.EventHexagonal"
                },
                "name": "LoanReturned",
                "displayName": "대출 반납됨",
                "nameCamelCase": "loanReturned",
                "namePascalCase": "LoanReturned",
                "namePlural": "",
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PostPersist",
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                }
            },
            "from": "1179f8d5-304f-fc47-74d8-4f93b8129008",
            "to": "ac75186c-693b-322d-9554-c112044993f4",
            "relationView": {
                "id": "20476c5e-0541-5f9d-d188-02fce5fe93cd",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "1179f8d5-304f-fc47-74d8-4f93b8129008",
                "to": "ac75186c-693b-322d-9554-c112044993f4",
                "needReconnect": true,
                "value": "[[1191,512],[1279,512]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "1179f8d5-304f-fc47-74d8-4f93b8129008",
                "id": "20476c5e-0541-5f9d-d188-02fce5fe93cd",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "ac75186c-693b-322d-9554-c112044993f4",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "e20354ba-41ff-5f16-f2e2-40459087191e": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "e20354ba-41ff-5f16-f2e2-40459087191e",
            "sourceElement": {
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "checkAlert": true,
                "description": null,
                "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "elementView": {
                    "angle": 0,
                    "height": 115,
                    "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                    "style": "{}",
                    "width": 100,
                    "x": 1329,
                    "y": 250,
                    "_type": "org.uengine.modeling.model.Event"
                },
                "fieldDescriptors": [
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "memberId",
                        "nameCamelCase": "memberId",
                        "namePascalCase": "MemberId",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanDuration",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDuration",
                        "nameCamelCase": "loanDuration",
                        "namePascalCase": "LoanDuration",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanDate",
                        "nameCamelCase": "loanDate",
                        "namePascalCase": "LoanDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "returnDueDate",
                        "nameCamelCase": "returnDueDate",
                        "namePascalCase": "ReturnDueDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanStatus",
                        "isCopy": false,
                        "isKey": false,
                        "name": "loanStatus",
                        "nameCamelCase": "loanStatus",
                        "namePascalCase": "LoanStatus",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "hexagonalView": {
                    "height": 0,
                    "id": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0,
                    "_type": "org.uengine.modeling.model.EventHexagonal"
                },
                "name": "LoanCreated",
                "displayName": "대출 생성",
                "nameCamelCase": "loanCreated",
                "namePascalCase": "LoanCreated",
                "namePlural": "",
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PostPersist",
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                }
            },
            "targetElement": {
                "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "description": "도서 대출 후 상태를 '대출중'으로 변경",
                "elementView": {
                    "height": 115,
                    "width": 100,
                    "x": 437,
                    "y": 380,
                    "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                    "style": "{}",
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "fieldDescriptors": [],
                "hexagonalView": {
                    "height": 20,
                    "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                    "style": "{}",
                    "subWidth": 100,
                    "width": 20,
                    "_type": "org.uengine.modeling.model.PolicyHexagonal"
                },
                "isSaga": false,
                "name": "UpdateLoanBookStatusPolicy",
                "displayName": "대출 도서 상태 변경",
                "nameCamelCase": "updateLoanBookStatusPolicy",
                "namePascalCase": "UpdateLoanBookStatusPolicy",
                "namePlural": "updateLoanBookStatusPolicies",
                "oldName": "",
                "rotateStatus": false,
                "_type": "org.uengine.modeling.model.Policy"
            },
            "from": "78937fb4-354e-7c45-ea1f-a9604081b75b",
            "to": "dcfad35d-4305-25a5-993d-9426931c4ee6",
            "relationView": {
                "id": "e20354ba-41ff-5f16-f2e2-40459087191e",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "to": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "needReconnect": true,
                "value": "[[1328,192],[1328,136],[424,136],[424,182]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "78937fb4-354e-7c45-ea1f-a9604081b75b",
                "id": "e20354ba-41ff-5f16-f2e2-40459087191e",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "78a22ec0-5533-0df2-f8be-c8492487e98d": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "78a22ec0-5533-0df2-f8be-c8492487e98d",
            "sourceElement": {
                "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "description": "도서 대출 후 상태를 '대출중'으로 변경",
                "elementView": {
                    "height": 115,
                    "width": 100,
                    "x": 437,
                    "y": 380,
                    "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                    "style": "{}",
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "fieldDescriptors": [],
                "hexagonalView": {
                    "height": 20,
                    "id": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                    "style": "{}",
                    "subWidth": 100,
                    "width": 20,
                    "_type": "org.uengine.modeling.model.PolicyHexagonal"
                },
                "isSaga": false,
                "name": "UpdateLoanBookStatusPolicy",
                "displayName": "대출 도서 상태 변경",
                "nameCamelCase": "updateLoanBookStatusPolicy",
                "namePascalCase": "UpdateLoanBookStatusPolicy",
                "namePlural": "updateLoanBookStatusPolicies",
                "oldName": "",
                "rotateStatus": false,
                "_type": "org.uengine.modeling.model.Policy"
            },
            "targetElement": {
                "_type": "org.uengine.modeling.model.Command",
                "outputEvents": [
                    "BookStatusChanged"
                ],
                "aggregate": {
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "controllerInfo": {
                    "method": "PUT"
                },
                "fieldDescriptors": [
                    {
                        "className": "Status",
                        "isCopy": false,
                        "isKey": false,
                        "name": "status",
                        "nameCamelCase": "status",
                        "namePascalCase": "Status",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "reason",
                        "nameCamelCase": "reason",
                        "namePascalCase": "Reason",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "description": null,
                "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                    "style": "{}",
                    "width": 100,
                    "x": 556,
                    "y": 380,
                    "z-index": 999
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "isRestRepository": false,
                "name": "ChangeBookStatus",
                "displayName": "도서 상태 변경",
                "nameCamelCase": "changeBookStatus",
                "namePascalCase": "ChangeBookStatus",
                "namePlural": "changeBookStatuses",
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "PUT"
                },
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PrePersist"
            },
            "from": "dcfad35d-4305-25a5-993d-9426931c4ee6",
            "to": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
            "relationView": {
                "id": "78a22ec0-5533-0df2-f8be-c8492487e98d",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "to": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "needReconnect": true,
                "value": "[[424,298],[424,380],[506,380]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "dcfad35d-4305-25a5-993d-9426931c4ee6",
                "id": "78a22ec0-5533-0df2-f8be-c8492487e98d",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "a4abefcb-3ab3-c3d3-f730-4abb61c7073a": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "a4abefcb-3ab3-c3d3-f730-4abb61c7073a",
            "sourceElement": {
                "alertURL": "/static/image/symbol/alert-icon.png",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "checkAlert": true,
                "description": null,
                "id": "ac75186c-693b-322d-9554-c112044993f4",
                "elementView": {
                    "angle": 0,
                    "height": 115,
                    "id": "ac75186c-693b-322d-9554-c112044993f4",
                    "style": "{}",
                    "width": 100,
                    "x": 1329,
                    "y": 510,
                    "_type": "org.uengine.modeling.model.Event"
                },
                "fieldDescriptors": [
                    {
                        "className": "Date",
                        "isCopy": false,
                        "isKey": false,
                        "name": "returnDate",
                        "nameCamelCase": "returnDate",
                        "namePascalCase": "ReturnDate",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "LoanStatus",
                        "isCopy": false,
                        "isKey": false,
                        "name": "nextStatus",
                        "nameCamelCase": "nextStatus",
                        "namePascalCase": "NextStatus",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "hexagonalView": {
                    "height": 0,
                    "id": "ac75186c-693b-322d-9554-c112044993f4",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0,
                    "_type": "org.uengine.modeling.model.EventHexagonal"
                },
                "name": "LoanReturned",
                "displayName": "대출 반납됨",
                "nameCamelCase": "loanReturned",
                "namePascalCase": "LoanReturned",
                "namePlural": "",
                "relationCommandInfo": [],
                "relationPolicyInfo": [],
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PostPersist",
                "_type": "org.uengine.modeling.model.Event",
                "aggregate": {
                    "id": "f8dc3056-6183-539a-7f20-68681ddcc8a2"
                },
                "boundedContext": {
                    "id": "85c498d4-39ed-5546-59b8-8eaaf33cffc8"
                }
            },
            "targetElement": {
                "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "description": "도서 반납 후 상태를 '대출가능'으로 변경",
                "elementView": {
                    "height": 115,
                    "width": 100,
                    "x": 437,
                    "y": 380,
                    "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                    "style": "{}",
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "fieldDescriptors": [],
                "hexagonalView": {
                    "height": 20,
                    "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                    "style": "{}",
                    "subWidth": 100,
                    "width": 20,
                    "_type": "org.uengine.modeling.model.PolicyHexagonal"
                },
                "isSaga": false,
                "name": "ReturnBookStatusPolicy",
                "displayName": "반납 도서 상태 변경",
                "nameCamelCase": "returnBookStatusPolicy",
                "namePascalCase": "ReturnBookStatusPolicy",
                "namePlural": "returnBookStatusPolicies",
                "oldName": "",
                "rotateStatus": false,
                "_type": "org.uengine.modeling.model.Policy"
            },
            "from": "ac75186c-693b-322d-9554-c112044993f4",
            "to": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
            "relationView": {
                "id": "a4abefcb-3ab3-c3d3-f730-4abb61c7073a",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "ac75186c-693b-322d-9554-c112044993f4",
                "to": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "needReconnect": true,
                "value": "[[1379,512],[1436,512],[1436,604],[424,584],[424,530]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "ac75186c-693b-322d-9554-c112044993f4",
                "id": "a4abefcb-3ab3-c3d3-f730-4abb61c7073a",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        },
        "9f52f8ae-8acb-3af4-2c26-d11e0f3b9f2f": {
            "_type": "org.uengine.modeling.model.Relation",
            "name": "",
            "id": "9f52f8ae-8acb-3af4-2c26-d11e0f3b9f2f",
            "sourceElement": {
                "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "description": "도서 반납 후 상태를 '대출가능'으로 변경",
                "elementView": {
                    "height": 115,
                    "width": 100,
                    "x": 437,
                    "y": 380,
                    "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                    "style": "{}",
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "fieldDescriptors": [],
                "hexagonalView": {
                    "height": 20,
                    "id": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                    "style": "{}",
                    "subWidth": 100,
                    "width": 20,
                    "_type": "org.uengine.modeling.model.PolicyHexagonal"
                },
                "isSaga": false,
                "name": "ReturnBookStatusPolicy",
                "displayName": "반납 도서 상태 변경",
                "nameCamelCase": "returnBookStatusPolicy",
                "namePascalCase": "ReturnBookStatusPolicy",
                "namePlural": "returnBookStatusPolicies",
                "oldName": "",
                "rotateStatus": false,
                "_type": "org.uengine.modeling.model.Policy"
            },
            "targetElement": {
                "_type": "org.uengine.modeling.model.Command",
                "outputEvents": [
                    "BookStatusChanged"
                ],
                "aggregate": {
                    "id": "554241df-8091-4819-87d3-8fa38d18deaa"
                },
                "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                "boundedContext": {
                    "id": "cca6bb4c-1e8c-9a45-b3d0-f09307ed0741"
                },
                "controllerInfo": {
                    "method": "PUT"
                },
                "fieldDescriptors": [
                    {
                        "className": "Status",
                        "isCopy": false,
                        "isKey": false,
                        "name": "status",
                        "nameCamelCase": "status",
                        "namePascalCase": "Status",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    },
                    {
                        "className": "String",
                        "isCopy": false,
                        "isKey": false,
                        "name": "reason",
                        "nameCamelCase": "reason",
                        "namePascalCase": "Reason",
                        "displayName": "",
                        "_type": "org.uengine.model.FieldDescriptor"
                    }
                ],
                "description": null,
                "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "elementView": {
                    "_type": "org.uengine.modeling.model.Command",
                    "height": 115,
                    "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                    "style": "{}",
                    "width": 100,
                    "x": 556,
                    "y": 380,
                    "z-index": 999
                },
                "hexagonalView": {
                    "_type": "org.uengine.modeling.model.CommandHexagonal",
                    "height": 0,
                    "id": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                    "style": "{}",
                    "width": 0,
                    "x": 0,
                    "y": 0
                },
                "isRestRepository": false,
                "name": "ChangeBookStatus",
                "displayName": "도서 상태 변경",
                "nameCamelCase": "changeBookStatus",
                "namePascalCase": "ChangeBookStatus",
                "namePlural": "changeBookStatuses",
                "relationCommandInfo": [],
                "relationEventInfo": [],
                "restRepositoryInfo": {
                    "method": "PUT"
                },
                "rotateStatus": false,
                "selected": false,
                "trigger": "@PrePersist"
            },
            "from": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
            "to": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
            "relationView": {
                "id": "9f52f8ae-8acb-3af4-2c26-d11e0f3b9f2f",
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "to": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "needReconnect": true,
                "value": "[[424,414],[424,380],[506,380]]"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.RelationHexagonal",
                "from": "f9f9ee5e-d4d1-d31b-0f2e-cef969de05b0",
                "id": "9f52f8ae-8acb-3af4-2c26-d11e0f3b9f2f",
                "needReconnect": true,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "to": "ae7bd270-ac8c-7103-9866-c3e1867c019a",
                "value": null
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "displayName": ""
        }
    },
    "basePlatform": null,
    "basePlatformConf": {},
    "toppingPlatforms": [],
    "toppingPlatformsConf": {},
    "scm": {
        "tag": null,
        "org": null,
        "repo": null,
        "forkedOrg": null,
        "forkedRepo": null
    },
    "version": 3,
    "k8sValue": {
        "elements": {},
        "relations": {}
    }
}