<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import ESActionUtil from "../../modeling/generators/es-ddl-generators/modules/ESActionsUtil"
import DDLManager from "../../modeling/generators/es-ddl-generators/managers/DDLManager"

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
            if (event.altKey && event.key.toLowerCase() === 't') {
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
                
                case "TestDDLManager":
                    this._test_DDLManager()
                    break
                
                case "TestDDLBoundedContextDistributeGenerator":
                    this._test_DDLBoundedContextDistributeGenerator()
                    break
                
                case "TestDDLDraftGeneratorForDistribution":
                    this._test_DDLDraftGeneratorForDistribution()
                    break
                
                case "TestDDLDraftComponent":
                    this._test_DDLDraftComponent()
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
    total_points INT DEFAULT 0,
    category_id INT NOT NULL,
    level_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES customer_categories(category_id),
    FOREIGN KEY (level_id) REFERENCES customer_levels(level_id)
);

CREATE TABLE customer_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    description VARCHAR(200)
);

CREATE TABLE customer_levels (
    level_id INT PRIMARY KEY AUTO_INCREMENT,
    level_name VARCHAR(50) NOT NULL,
    min_points INT NOT NULL,
    max_points INT NOT NULL
);`,
                suggestedStructures: [
                    {
                        aggregateRoot: "Customer",
                        generalClasses: ["CustomerCategory", "CustomerLevel"],
                        valueObjects: ["Contact", "Address"]
                    }
                ],
                boundedContexts: [`Customer`],
                functionRequests: "Add the appropriate Create and Delete operations for the given DDL.",
                userInfo: me.userInfo,
                information: me.information
            })
        },

        _test_ESActionUtil() {
            const createdESValue = ESActionUtil.getActionAppliedESValue([
    {
        "objectType": "BoundedContext",
        "ids": {
        "boundedContextId": "bc-customer"
        },
        "args": {
        "boundedContextName": "Customer"
        }
    },
    {
        "objectType": "Aggregate",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer"
        },
        "args": {
        "aggregateName": "Customer",
        "properties": [
            {
                "name": "customerId",
                "type": "Long",
                "isKey": true
            },
            {
                "name": "name"
            },
            {
                "name": "contact",
                "type": "Contact"
            },
            {
                "name": "address",
                "type": "Address"
            },
            {
                "name": "totalPoints",
                "type": "Integer"
            }
        ]
        }
    },
    {
        "objectType": "ValueObject",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer",
        "valueObjectId": "vo-contact"
        },
        "args": {
        "valueObjectName": "Contact",
        "properties": [
            {
                "name": "phone"
            }
        ]
        }
    },
    {
        "objectType": "Command",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer",
        "commandId": "cmd-create-customer"
        },
        "args": {
        "commandName": "CreateCustomer",
        "api_verb": "POST",
        "outputEventIds": [
            "evt-customer-created"
        ],
        "actor": ""
        }
    },
    {
        "objectType": "Event",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer",
        "eventId": "evt-customer-created"
        },
        "args": {
        "eventName": "CustomerCreated"
        }
    },
    {
        "objectType": "Command",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer",
        "commandId": "cmd-update-customer"
        },
        "args": {
        "commandName": "UpdateCustomer",
        "api_verb": "PUT",
        "outputEventIds": [
            "evt-customer-updated"
        ],
        "actor": ""
        }
    },
    {
        "objectType": "Event",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer",
        "eventId": "evt-customer-updated"
        },
        "args": {
        "eventName": "CustomerUpdated"
        }
    },
    {
        "objectType": "Command",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer",
        "commandId": "cmd-delete-customer"
        },
        "args": {
        "commandName": "DeleteCustomer",
        "api_verb": "DELETE",
        "outputEventIds": [
            "evt-customer-deleted"
        ],
        "actor": ""
        }
    },
    {
        "objectType": "Event",
        "ids": {
        "boundedContextId": "bc-customer",
        "aggregateId": "agg-customer",
        "eventId": "evt-customer-deleted"
        },
        "args": {
        "eventName": "CustomerDeleted"
        }
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
                            "boundedContextId": "bc-customer"
                        },
                        "args": {
                            "boundedContextName": "Customer"
                        }
                    },
                    {
                        "objectType": "Aggregate",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer"
                        },
                        "args": {
                            "aggregateName": "Customer",
                            "properties": [
                            {
                                "name": "customerId",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "name"
                            },
                            {
                                "name": "contact",
                                "type": "Contact"
                            },
                            {
                                "name": "address",
                                "type": "Address"
                            },
                            {
                                "name": "totalPoints",
                                "type": "Integer"
                            },
                            {
                                "name": "customerCategory",
                                "type": "CustomerCategory"
                            },
                            {
                                "name": "customerLevel",
                                "type": "CustomerLevel"
                            }
                            ]
                        }
                    },
                    {
                        "objectType": "ValueObject",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "valueObjectId": "vo-contact"
                        },
                        "args": {
                            "valueObjectName": "Contact",
                            "properties": [
                            {
                                "name": "phone"
                            }
                            ]
                        }
                    },
                    {
                        "objectType": "ValueObject",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "valueObjectId": "vo-address"
                        },
                        "args": {
                            "valueObjectName": "Address",
                            "properties": [
                            {
                                "name": "address"
                            }
                            ]
                        }
                    },
                    {
                        "objectType": "GeneralClass",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "generalClassId": "gc-customer-category"
                        },
                        "args": {
                            "generalClassName": "CustomerCategory",
                            "properties": [
                            {
                                "name": "categoryId",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "categoryName"
                            },
                            {
                                "name": "description"
                            }
                            ]
                        }
                    },
                    {
                        "objectType": "GeneralClass",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "generalClassId": "gc-customer-level"
                        },
                        "args": {
                            "generalClassName": "CustomerLevel",
                            "properties": [
                            {
                                "name": "levelId",
                                "type": "Long",
                                "isKey": true
                            },
                            {
                                "name": "levelName"
                            },
                            {
                                "name": "minPoints",
                                "type": "Integer"
                            },
                            {
                                "name": "maxPoints",
                                "type": "Integer"
                            }
                            ]
                        }
                    },
                    {
                        "objectType": "Command",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "commandId": "cmd-create-customer"
                        },
                        "args": {
                            "commandName": "CreateCustomer",
                            "api_verb": "POST",
                            "outputEventIds": [
                            "evt-customer-created"
                            ],
                            "actor": "User"
                        }
                    },
                    {
                        "objectType": "Event",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "eventId": "evt-customer-created"
                        },
                        "args": {
                            "eventName": "CustomerCreated"
                        }
                    },
                    {
                        "objectType": "Command",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "commandId": "cmd-delete-customer"
                        },
                        "args": {
                            "commandName": "DeleteCustomer",
                            "api_verb": "DELETE",
                            "outputEventIds": [
                            "evt-customer-deleted"
                            ],
                            "actor": "User"
                        }
                    },
                    {
                        "objectType": "Event",
                        "ids": {
                            "boundedContextId": "bc-customer",
                            "aggregateId": "agg-customer",
                            "eventId": "evt-customer-deleted"
                        },
                        "args": {
                            "eventName": "CustomerDeleted"
                        }
                    }
                ], this.userInfo, this.information)
            console.log(JSON.stringify(createdESValue, null, 2))
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
        },

        _test_DDLManager(){
            const mockDDL = `CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    total_points INT DEFAULT 0,
    category_id INT NOT NULL,
    level_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES customer_categories(category_id),
    FOREIGN KEY (level_id) REFERENCES customer_levels(level_id)
);

CREATE TABLE customer_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50) NOT NULL,
    description VARCHAR(200)
);

CREATE TABLE customer_levels (
    level_id INT PRIMARY KEY AUTO_INCREMENT,
    level_name VARCHAR(50) NOT NULL,
    min_points INT NOT NULL,
    max_points INT NOT NULL
);`

            const ddlManager = new DDLManager(mockDDL)
            console.log(ddlManager.getParsedDDLs())
        },

        _test_DDLBoundedContextDistributeGenerator(){
            this.__generate('DDLBoundedContextDistributeGenerator', {
                ddlSummaries: [
                    "patients(PK: patient_id)",
                    "patient_medical_records(PK: record_id, FK: patient_id, FK: doctor_id)",
                    "doctors(PK: doctor_id, FK: department_id)",
                    "departments(PK: department_id)",
                    "appointments(PK: appointment_id, FK: patient_id, FK: doctor_id, FK: room_id)",
                    "medical_rooms(PK: room_id, FK: department_id)",
                    "prescriptions(PK: prescription_id, FK: record_id, FK: medicine_id)",
                    "medicines(PK: medicine_id)",
                    "medicine_inventory(PK: inventory_id, FK: medicine_id)",
                    "billing_records(PK: bill_id, FK: patient_id, FK: appointment_id)",
                    "insurance_claims(PK: claim_id, FK: bill_id)",
                    "staff_schedules(PK: schedule_id, FK: doctor_id)",
                    "lab_tests(PK: test_id, FK: record_id)",
                    "lab_results(PK: result_id, FK: test_id)"
                ],
                suggestedBoundedContexts: [
                    "환자관리",
                    "진료부서관리"
                ],
                functionRequirements: [
                    "환자 진료 기록을 관리해야 합니다",
                    "의사별 진료 일정 관리가 필요합니다",
                    "약품 재고 관리 기능이 필요합니다",
                    "보험 청구 프로세스를 자동화해야 합니다",
                    "진료실 예약 관리가 필요합니다",
                    "검사 결과를 환자 기록과 연동해야 합니다",
                    "부서별 의사 배치 현황을 관리해야 합니다"
                ]
            })
        },

        _test_DDLDraftGeneratorForDistribution(){
            this.__generate('DDLDraftGeneratorForDistribution', {
                ddl: `CREATE TABLE employees (
    employee_id VARCHAR(36) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    hire_date DATE NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    salary DECIMAL(12,2) NOT NULL,
    department_id VARCHAR(36) NOT NULL,
    manager_id VARCHAR(36),
    status VARCHAR(20) NOT NULL
);

CREATE TABLE departments (
    department_id VARCHAR(36) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
    budget DECIMAL(15,2) NOT NULL,
    manager_id VARCHAR(36)
);

CREATE TABLE employee_benefits (
    benefit_id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    benefit_type VARCHAR(50) NOT NULL,
    coverage_amount DECIMAL(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE attendance_records (
    record_id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    check_in TIMESTAMP NOT NULL,
    check_out TIMESTAMP,
    work_type VARCHAR(20) NOT NULL,
    location VARCHAR(100),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE performance_reviews (
    review_id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    reviewer_id VARCHAR(36) NOT NULL,
    review_date DATE NOT NULL,
    rating INTEGER NOT NULL,
    comments TEXT,
    goals TEXT,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id),
    FOREIGN KEY (reviewer_id) REFERENCES employees(employee_id)
);`,
                boundedContext: `HR Management`
            })
        },

        _test_DDLDraftComponent(){
            const aiOutput = {
    "generatorName": "DDLDraftGeneratorForDistribution",
    "modelValue": {
        "options": [
            {
                "structure": [
                    {
                        "aggregateName": "Store",
                        "entities": [],
                        "valueObjects": [
                            "Address",
                            "Phone"
                        ]
                    },
                    {
                        "aggregateName": "Category",
                        "entities": [],
                        "valueObjects": []
                    }
                ],
                "pros": "간단한 구조: 각 스토어와 카테고리를 독립적으로 관리할 수 있음, 높은 성능: 작은 집합체로 빠른 연산 가능",
                "cons": "복잡한 관계 관리: 스토어와 카테고리 간의 관계를 별도로 관리해야 함"
            },
            {
                "structure": [
                    {
                        "aggregateName": "Store",
                        "entities": [
                            "Category"
                        ],
                        "valueObjects": [
                            "Address",
                            "Phone"
                        ]
                    }
                ],
                "pros": "강력한 일관성: 스토어와 카테고리 간의 관계가 명확히 정의됨, 단순한 관리: 모든 관련 데이터가 하나의 집합체 내에 존재",
                "cons": "큰 집합체 크기: 모든 스토어 관련 데이터를 하나의 집합체로 관리하므로 성능 저하 가능성"
            },
            {
                "structure": [
                    {
                        "aggregateName": "Store",
                        "entities": [],
                        "valueObjects": [
                            "Address",
                            "Phone"
                        ]
                    },
                    {
                        "aggregateName": "StoreCategory",
                        "entities": [],
                        "valueObjects": []
                    }
                ],
                "pros": "높은 유연성: 스토어와 카테고리를 독립적으로 관리 가능, 단순한 확장성: 각 요소를 독립적으로 확장 가능",
                "cons": "복잡한 일관성 관리: 스토어와 카테고리 간의 일관성을 유지하기 위한 추가 로직 필요"
            }
        ],
        "defaultOptionIndex": 0,
        "conclusions": "Write a conclusion for each option, explaining in which cases it would be best to choose that option."
    },
    "modelRawValue": "```json\n{\"options\":[{\"structure\":[{\"aggregateName\":\"Store\",\"entities\":[],\"valueObjects\":[\"Address\",\"Phone\"]},{\"aggregateName\":\"Category\",\"entities\":[],\"valueObjects\":[]}],\"pros\":\"간단한 구조: 각 스토어와 카테고리를 독립적으로 관리할 수 있음, 높은 성능: 작은 집합체로 빠른 연산 가능\",\"cons\":\"복잡한 관계 관리: 스토어와 카테고리 간의 관계를 별도로 관리해야 함\"},{\"structure\":[{\"aggregateName\":\"Store\",\"entities\":[\"Category\"],\"valueObjects\":[\"Address\",\"Phone\"]}],\"pros\":\"강력한 일관성: 스토어와 카테고리 간의 관계가 명확히 정의됨, 단순한 관리: 모든 관련 데이터가 하나의 집합체 내에 존재\",\"cons\":\"큰 집합체 크기: 모든 스토어 관련 데이터를 하나의 집합체로 관리하므로 성능 저하 가능성\"},{\"structure\":[{\"aggregateName\":\"Store\",\"entities\":[],\"valueObjects\":[\"Address\",\"Phone\"]},{\"aggregateName\":\"StoreCategory\",\"entities\":[],\"valueObjects\":[]}],\"pros\":\"높은 유연성: 스토어와 카테고리를 독립적으로 관리 가능, 단순한 확장성: 각 요소를 독립적으로 확장 가능\",\"cons\":\"복잡한 일관성 관리: 스토어와 카테고리 간의 일관성을 유지하기 위한 추가 로직 필요\"}],\"defaultOptionIndex\":0,\"conclusions\":\"옵션 1은 간단한 스토어와 카테고리 관리가 필요한 경우 적합합니다. 옵션 2는 스토어와 카테고리 간의 강력한 일관성이 필요한 경우 적합합니다. 옵션 3은 유연성과 확장성이 중요한 경우에 적합합니다.\"}\n```",
    "inputedParams": {
        "ddl": "CREATE TABLE stores (\n    store_id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100) NOT NULL,\n    address VARCHAR(255) NOT NULL,\n    phone VARCHAR(20) NOT NULL\n)\nCREATE TABLE store_categories (\n    category_id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(50) NOT NULL\n)",
        "boundedContext": "Store",
        "functionRequirements": []
    }
}

        const ddlDraftOptions = [
            {
                boundedContext: aiOutput.inputedParams.boundedContext,
                options: aiOutput.modelValue.options.map(option => ({
                    ...option,
                    boundedContext: aiOutput.inputedParams.boundedContext,
                    functionRequirements: aiOutput.inputedParams.functionRequirements,
                    ddl: aiOutput.inputedParams.ddl
                })),
                conclusions: aiOutput.modelValue.conclusions,
                defaultOptionIndex: aiOutput.modelValue.defaultOptionIndex
            }
        ]
        this.DDLDraftOptions = ddlDraftOptions
        this.showDDLDraftDialog = true

            
        }
    }
}
</script>
  