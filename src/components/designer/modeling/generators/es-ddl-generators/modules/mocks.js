export const esActionUtilMocks = [
    {
        "currentESValue": {
            "elements": {},
            "relations": {}
        },

        "actions": [
            {
                "objectType": "BoundedContext",
                "type": "create",
                "ids": {
                    "boundedContextId": `bc-bookManagement`
                },
                "args": {
                    "boundedContextName": "BookManagement",
                    "boundedContextAlias": "Book Management",
                    "description": "Book Management Description"
                }
            },

            {
                "objectType": "Aggregate",
                "ids": {
                    "boundedContextId": "bc-bookManagement",
                    "aggregateId": "agg-book"
                },
                "args": {
                    "aggregateName": "Book",
                    "aggregateAlias": "Book",

                    "properties": [
                        {
                            "name": "bookId",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "bookTitle",
                            "type": "String"
                        },
                        {
                            "name": "bookAuthorInfo",
                            "type": "BookAuthorInfo"
                        },
                        {
                            "name": "bookStatus",
                            "type": "BookStatus"
                        },
                        {
                            "name": "InvalidValueObjectName",
                            "type": "InvalidValueObject"
                        },
                        {
                            "name": "InvalidEnumName",
                            "type": "InvalidEnum"
                        }
                    ]
                }
            },

            {
                "objectType": "ValueObject",
                "ids": {
                    "boundedContextId": "bc-bookManagement",
                    "aggregateId": "agg-book",
                    "valueObjectId": "vo-bookAuthorInfo"
                },
                "args": {
                    "valueObjectName": "BookAuthorInfo",
                    "valueObjectAlias": "Book Author Info",

                    "properties": [
                        {
                            "name": "authorName",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "authorEmail",
                            "type": "String"
                        },
                        {
                            "name": "InvalidEnumName",
                            "type": "InvalidEnum"
                        }
                    ]
                }
            },

            {
                "objectType": "Enumeration",
                "ids": {
                    "boundedContextId": "bc-bookManagement",
                    "aggregateId": "agg-book",
                    "enumerationId": "enum-bookStatus"
                },
                "args": {
                    "enumerationName": "BookStatus",
                    "enumerationAlias": "Book Status",
                    
                    "properties": [
                        {
                            "name": "available"
                        },
                        {
                            "name": "unavailable"
                        }
                    ]
                }
            },

            {
                "objectType": "Command",
                "ids": {
                    "boundedContextId": "bc-bookManagement",
                    "aggregateId": "agg-book",
                    "commandId": "cmd-loanBook"
                },
                "args": {
                    "commandName": "LoanBook",
                    "commandAlias": "Loan Book",
                    "api_verb": "POST",

                    "properties": [
                        {
                            "name": "bookId",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "bookTitle",
                            "type": "String"
                        },
                        {
                            "name": "bookAuthorInfo",
                            "type": "BookAuthorInfo"
                        },
                        {
                            "name": "bookStatus",
                            "type": "BookStatus"
                        },
                        {
                            "name": "InvalidValueObjectName",
                            "type": "InvalidValueObject"
                        },
                        {
                            "name": "InvalidEnumName",
                            "type": "InvalidEnum"
                        }
                    ],

                    "outputEventIds": ["evt-bookLoaned"],
                    "actor": "User"
                }
            },

            {
                "objectType": "Event",
                "ids": {
                    "boundedContextId": "bc-bookManagement",
                    "aggregateId": "agg-book",
                    "eventId": "evt-bookLoaned"
                },
                "args": {
                    "eventName": "BookLoaned",
                    "eventAlias": "Book Loaned",

                    "properties": [
                        {
                            "name": "bookId",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "bookTitle",
                            "type": "String"
                        },
                        {
                            "name": "bookAuthorInfo",
                            "type": "BookAuthorInfo"
                        },
                        {
                            "name": "bookStatus",
                            "type": "BookStatus"
                        },
                        {
                            "name": "InvalidValueObjectName",
                            "type": "InvalidValueObject"
                        },
                        {
                            "name": "InvalidEnumName",
                            "type": "InvalidEnum"
                        }
                    ]
                }
            },

            {
                "objectType": "ReadModel",
                "ids": {
                    "boundedContextId": "bc-bookManagement",
                    "aggregateId": "agg-book",
                    "readModelId": "rm-bookList"
                },
                "args": {
                    "readModelName": "BookList",
                    "readModelAlias": "Book List",
                    "isMultipleResult": true,

                    "queryParameters": [
                        {
                            "name": "bookId",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "bookTitle",
                            "type": "String"
                        },
                        {
                            "name": "bookAuthorInfo",
                            "type": "BookAuthorInfo"
                        },
                        {
                            "name": "bookStatus",
                            "type": "BookStatus"
                        },
                        {
                            "name": "InvalidValueObjectName",
                            "type": "InvalidValueObject"
                        },
                        {
                            "name": "InvalidEnumName",
                            "type": "InvalidEnum"
                        }
                    ],

                    "actor": "User"
                }
            }
        ]
    }
]

export const esConfigs = {
    userInfo: {
        "name": "testName@uengine.org",
        "profile": "https://avatars.githubusercontent.com/u/123456789?v=4",
        "email": "testEmail@uengine.org",
        "uid": "testUid",
        "providerUid": "testProviderUid",
        "savedCoin": 0,
        "savedToolTime": 0,
        "consultingTime": 0,
        "authorized": "admin"
    },

    information: {
        "author": "testAuthor",
        "authorEmail": "testAuthorEmail@uengine.org",
        "comment": "",
        "createdTimeStamp": 123456789,
        "lastModifiedTimeStamp": 123456789,
        "projectName": "testProjectName",
        "projectId": "testProjectId",
        "type": "es"
    }
}