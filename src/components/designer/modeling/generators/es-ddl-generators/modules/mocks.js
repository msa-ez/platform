export const esActionUtilMocks = [
    {
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
                        }
                    ]
                }
            },

            {
                "objectType": "BoundedContext",
                "type": "create",
                "ids": {
                    "boundedContextId": `bc-userManagement`
                },
                "args": {
                    "boundedContextName": "UserManagement",
                    "boundedContextAlias": "User Management",
                    "description": "User Management Description"
                }
            },

            {
                "objectType": "Aggregate",
                "ids": {
                    "boundedContextId": "bc-userManagement",
                    "aggregateId": "agg-user"
                },
                "args": {
                    "aggregateName": "User",
                    "aggregateAlias": "User",

                    "properties": [
                        {
                            "name": "userId",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "userName",
                            "type": "String"
                        }
                    ]
                }
            },
        ]
    },

    {
        "actions": [
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
                        }
                    ]
                }
            },

            {
                "objectType": "Command",
                "ids": {
                    "boundedContextId": "bc-userManagement",
                    "aggregateId": "agg-user",
                    "commandId": "cmd-registerUser"
                },
                "args": {
                    "commandName": "RegisterUser",
                    "commandAlias": "Register User",
                    "api_verb": "POST",

                    "properties": [
                        {
                            "name": "userId",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "userName",
                            "type": "String"
                        }
                    ],

                    "outputEventIds": ["evt-userRegistered"],
                    "actor": "User"
                }
            },

            {
                "objectType": "Event",
                "ids": {
                    "boundedContextId": "bc-userManagement",
                    "aggregateId": "agg-user",
                    "eventId": "evt-userRegistered"
                },
                "args": {
                    "eventName": "UserRegistered",
                    "eventAlias": "User Registered",

                    "properties": [
                        {
                            "name": "userId",
                            "type": "String",
                            "isKey": true
                        },
                        {
                            "name": "userName",
                            "type": "String"
                        }
                    ]
                }
            }
        ]
    },

    {
        "actions": [
            {
                "objectType": "Event",
                "type": "update",
                "ids": {
                    "boundedContextId": "bc-bookManagement",
                    "aggregateId": "agg-book",
                    "eventId": "evt-bookLoaned"
                },
                "args": {
                    "outputCommandIds": [{
                        "commandId": "cmd-registerUser",
                        "reason": "Mocked",
                        "name": "Register User",
                        "alias": "Register User"
                    }]
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

export const initialESValue = {
    "elements": {},
    "relations": {}
}
