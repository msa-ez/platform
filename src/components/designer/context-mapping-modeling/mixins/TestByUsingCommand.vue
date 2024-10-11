<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import ESActionUtil from "../../modeling/generators/es-ddl-generators/modules/ESActionsUtil"

export default {
    name: "test-by-using-command",
    mounted() {
        window.addEventListener('keydown', this.handleKeyPress);
    },
    beforeDestroy() {
        window.removeEventListener('keydown', this.handleKeyPress);
    },
    methods: {
        handleKeyPress(event) {
            if (event.altKey && event.key === 't') {
                this.promptCommand();
            }
        },


        promptCommand() {
            const COMMAND = prompt("테스트 커맨드 입력")
            if(!COMMAND) return

            switch(COMMAND) {
                case "TestDDLCreateESActionsGenerator":
                    this._test_DDLCreateESActionsGenerator()
                    break

                case "TestESActionUtil":
                    this._test_ESActionUtil()
                    break

                case "TestBoundedContextCMUtil":
                    this._test_BoundedContextCMUtil()
                    break

                case "makeNewEventStormingProject":
                    this._test_makeNewEventStormingProject()
                    break

                case "generateFromDraft":
                    this._test_generateFromDraft()
                    break

                default:
                    alert("유효하지 않은 커맨드입니다.")
                    break
            }
        },

        _test_DDLCreateESActionsGenerator() {
            var me = this
            me.__generate('DDLCreateESActionsGenerator', {
                ddl: `CREATE TABLE customers (
customer_id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
phone VARCHAR(20) NOT NULL,
address VARCHAR(255) NOT NULL,
total_points INT DEFAULT 0
);`,
                selectedOption: "고객 (Entities: 고객, ValueObjects: 연락처, 주소)",
                boundedContexts: [`고객`],
                userInfo: me.userInfo,
                information: me.information
            })
        },

        _test_ESActionUtil() {
            const createdESValue = ESActionUtil.getActionAppliedESValue([
                {
                    "objectType": "BoundedContext",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e"
                    },
                    "args": {
                        "boundedContextName": "StoreService"
                    },
                    "type": "create"
                },
                {
                    "objectType": "Aggregate",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "915eabd8-012f-fb23-3a00-75d8ffe29183"
                    },
                    "args": {
                        "aggregateName": "Store",
                        "properties": [
                            {
                                "name": "storeId",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "name"
                            },
                            {
                                "name": "address",
                                "type": "Address"
                            },
                            {
                                "name": "contact",
                                "type": "Contact"
                            }
                        ]
                    },
                    "type": "create"
                },
                {
                    "objectType": "ValueObject",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "915eabd8-012f-fb23-3a00-75d8ffe29183",
                        "valueObjectId": "e6e0d4e7-5d96-20d8-9460-1449f083a80f"
                    },
                    "args": {
                        "valueObjectName": "Contact",
                        "properties": [
                            {
                                "name": "phone"
                            }
                        ]
                    },
                    "type": "create"
                },
                {
                    "objectType": "Aggregate",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "851fee67-1709-e1b5-1715-32370fcf193e"
                    },
                    "args": {
                        "aggregateName": "StoreAddress",
                        "properties": [
                            {
                                "name": "id",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "storeId",
                                "type": "Long",
                                "isForeignProperty": true
                            },
                            {
                                "name": "address",
                                "type": "Address"
                            }
                        ]
                    },
                    "type": "create"
                },
                {
                    "objectType": "ValueObject",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "851fee67-1709-e1b5-1715-32370fcf193e",
                        "valueObjectId": "8074f9d0-44b3-65d7-6b5d-19e83af1e992"
                    },
                    "args": {
                        "valueObjectName": "Address",
                        "properties": [
                            {
                                "name": "address"
                            }
                        ]
                    },
                    "type": "create"
                }
            ], this.userInfo, this.information)
            console.log(createdESValue)
        },

        _test_BoundedContextCMUtil(){
            this.__addNewBoundedContextCM('TEST CONTEXT 1')
            this.__addNewBoundedContextCM('TEST CONTEXT 2')
            this.__addNewBoundedContextCM('TEST CONTEXT 3')
            this.__addNewBoundedContextCM('TEST CONTEXT 4')
            this.__addNewBoundedContextCM('TEST CONTEXT 5')
            this.__addNewBoundedContextCM('TEST CONTEXT 6')
        },

        _test_makeNewEventStormingProject() {
            const createdESValue = ESActionUtil.getActionAppliedESValue([
                {
                    "objectType": "BoundedContext",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e"
                    },
                    "args": {
                        "boundedContextName": "StoreService"
                    },
                    "type": "create"
                },
                {
                    "objectType": "Aggregate",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "915eabd8-012f-fb23-3a00-75d8ffe29183"
                    },
                    "args": {
                        "aggregateName": "Store",
                        "properties": [
                            {
                                "name": "storeId",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "name"
                            },
                            {
                                "name": "address",
                                "type": "Address"
                            },
                            {
                                "name": "contact",
                                "type": "Contact"
                            }
                        ]
                    },
                    "type": "create"
                },
                {
                    "objectType": "ValueObject",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "915eabd8-012f-fb23-3a00-75d8ffe29183",
                        "valueObjectId": "e6e0d4e7-5d96-20d8-9460-1449f083a80f"
                    },
                    "args": {
                        "valueObjectName": "Contact",
                        "properties": [
                            {
                                "name": "phone"
                            }
                        ]
                    },
                    "type": "create"
                },
                {
                    "objectType": "Aggregate",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "851fee67-1709-e1b5-1715-32370fcf193e"
                    },
                    "args": {
                        "aggregateName": "StoreAddress",
                        "properties": [
                            {
                                "name": "id",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "storeId",
                                "type": "Long",
                                "isForeignProperty": true
                            },
                            {
                                "name": "address",
                                "type": "Address"
                            }
                        ]
                    },
                    "type": "create"
                },
                {
                    "objectType": "ValueObject",
                    "ids": {
                        "boundedContextId": "c2b72ca1-722e-4924-366b-1d68c9097a2e",
                        "aggregateId": "851fee67-1709-e1b5-1715-32370fcf193e",
                        "valueObjectId": "8074f9d0-44b3-65d7-6b5d-19e83af1e992"
                    },
                    "args": {
                        "valueObjectName": "Address",
                        "properties": [
                            {
                                "name": "address"
                            }
                        ]
                    },
                    "type": "create"
                }
            ], this.userInfo, this.information)
            this.__makeNewEventStormingProject(createdESValue)
        },

        _test_generateFromDraft() {
            const mock_selectedOptionItem = {
                "고객": [
                    {
                        "option": 1,
                        "aggregates": "고객 (Entities: 고객, ValueObjects: 고객 정보)",
                        "pros": "고객 중심의 설계: 고객 정보를 중심으로 모든 고객 관련 데이터를 관리할 수 있습니다.",
                        "cons": "확장성 제한: 고객 정보에 새로운 기능을 추가할 때 복잡할 수 있습니다.",
                        "ddl": "customers"
                    }
                ],
                "상점": [
                    {
                        "option": 2,
                        "aggregates": "상점 카테고리 (Entities: 상점, ValueObjects: 카테고리 정보)",
                        "pros": "카테고리 관리 최적화: 상점의 카테고리 정보를 별도로 관리하여 카테고리 관련 기능을 확장하기 용이합니다.",
                        "cons": "상점 정보 분리: 상점의 기본 정보와 카테고리 정보가 분리되어 있어 관리가 복잡할 수 있습니다.",
                        "ddl": "stores"
                    }
                ],
                "etc": [
                    {
                        "option": 1,
                        "aggregates": "리뷰 (Entities: 리뷰, ValueObjects: 리뷰 정보)",
                        "pros": "리뷰 중심의 설계: 리뷰 정보를 중심으로 모든 리뷰 관련 데이터를 관리할 수 있습니다.",
                        "cons": "확장성 제한: 리뷰 정보에 새로운 기능을 추가할 때 복잡할 수 있습니다.",
                        "ddl": "reviews, store_categories"
                    }
                ]
            }

            this.defaultGeneratorUiInputData.DDL = `-- 고객 테이블
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    total_points INT DEFAULT 0
);
-- 상점 테이블
CREATE TABLE stores (
    store_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL
);
-- 리뷰 테이블
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    order_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
-- 상점 카테고리 테이블
CREATE TABLE store_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL
);`

            this.generateFromDraft(mock_selectedOptionItem)
        }
    }
}
</script>
  