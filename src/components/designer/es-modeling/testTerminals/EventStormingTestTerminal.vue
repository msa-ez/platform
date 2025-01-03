<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import ESValueSummarizeWithFilterUtil from "../../modeling/generators/es-ddl-generators/modules/ESValueSummarizeWithFilterUtil"
import ESAliasTransManager from "../../modeling/generators/es-ddl-generators/modules/ESAliasTransManager"
import DraftGeneratorByFunctions from "../../modeling/generators/es-ddl-generators/DraftGeneratorByFunctions";
import ESActionsUtil from "../../modeling/generators/es-ddl-generators/modules/ESActionsUtil";
import TokenCounter from "../../modeling/generators/TokenCounter";

export default {
    name: "es-test-terminal",
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
            const COMMANDS = {
                directESGenerationByLibrary: {
                    command: () => this._directESGenerationByLibrary(),
                    description: "도서-대출 초안 선택을 넘기고 바로 이벤트 스토밍 생성"
                },
                ESActionTest: {
                    command: () => this._ESActionTest(),
                    description: "Mock 객체를 통한 이벤트 스토밍 수정 액션 테스트 수행"
                },
                ESSummaryTest: {
                    command: () => this._ESSummaryTest(),
                    description: "생성기 전달시 사용하는 이벤트 스토밍 요약기에 대한 테스트 수행"
                },
                CommandGeneratorTestByLibrary: {
                    command: () => this._CommandGeneratorTestByLibrary(),
                    description: "도서관 시나리오와 연계되어서 Command 생성기만을 테스트 수행"
                },
                PolicyGeneratorTestByLibrary: {
                    command: () => this._PolicyGeneratorTestByLibrary(),
                    description: "도서관 시나리오와 연계되어서 Policy 생성기만을 테스트 수행"
                },
                CommandGWTGeneratorTestByLibrary: {
                    command: () => this._CommandGWTGeneratorTestByLibrary(),
                    description: "도서관 시나리오와 연계되어서 Command GWT 생성기만을 테스트 수행"
                },
                TokenCounterTest: {
                    command: () => this._TokenCounterTest(),
                    description: "토큰 카운터 테스트"
                },
                TempTest: {
                    command: () => this._TempTest(),
                    description: "임시 테스트"
                }
            }
            

            const commandList = Object.keys(COMMANDS)
                .map((cmd, index) => `${index}. ${cmd}: ${COMMANDS[cmd].description}`)
                .join('\n')

            let inputedCommand = prompt(this._getPromptMessage(commandList))
            if(!inputedCommand) return

            if(!isNaN(inputedCommand)) {
                const commandKeys = Object.keys(COMMANDS)
                const inputedIndex = parseInt(inputedCommand)
                if(inputedIndex >= 0 && inputedIndex < commandKeys.length) {
                    inputedCommand = commandKeys[inputedIndex]
                }
            }


            if(!COMMANDS[inputedCommand]) {
                alert("유효하지 않은 커맨드입니다.")
                return
            }
            COMMANDS[inputedCommand].command()
        },

        _getPromptMessage(commandList) {
            return `테스트 커맨드를 선택하세요:\n` +
                `(숫자 또는 커맨드명 입력)\n` +
                `-------------------\n` +
                `${commandList}\n` +
                `-------------------`
        },


        _directESGenerationByLibrary() {
            const testDraft = {
    "BookManagement": {
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
                        "alias": "ISBN 번호"
                    },
                    {
                        "name": "Category",
                        "alias": "도서 카테고리"
                    },
                    {
                        "name": "Status",
                        "alias": "도서 상태"
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
        ],
        "analysis": {
            "transactionalConsistency": "모든 도서 관련 데이터가 단일 집계 내에 있으므로 강한 트랜잭션 일관성 보장",
            "performanceScalability": "단일 집계 구조로 성능은 기본적으로 양호하나, 대규모 이력 데이터가 포함되면 성능 저하 가능",
            "domainAlignment": "도서 도메인 요구사항과 밀접하게 정렬됨",
            "maintainability": "단순한 구조로 유지보수가 용이하지만 기능 추가 시 복잡성이 증가할 수 있음",
            "futureFlexibility": "기능 확장이 제한적이며 구조 변경이 필요할 가능성 있음"
        },
        "pros": {
            "cohesion": "모든 도서 데이터를 단일 집계로 처리하여 높은 응집력",
            "coupling": "ValueObject를 통한 외부 참조로 낮은 결합도",
            "consistency": "도서 등록 및 상태 변경 로직에서 강한 일관성 유지",
            "encapsulation": "도서 관련 로직이 잘 캡슐화됨",
            "complexity": "단순하고 명확한 구조",
            "independence": "다른 집계와 독립적으로 작동 가능",
            "performance": "도서 작업의 효율적 처리"
        },
        "cons": {
            "cohesion": "이력 데이터가 추가되면 응집력이 저하될 수 있음",
            "coupling": "외부 참조 관리가 필요함",
            "consistency": "대규모 데이터 처리 시 트랜잭션 관리가 복잡해질 수 있음",
            "encapsulation": "모든 상태 변경 로직을 단일 집계 내에 처리해야 함",
            "complexity": "모든 데이터를 단일 구조로 처리하므로 일부 기능에서 복잡성 증가",
            "independence": "Loan과의 참조로 인해 약간의 의존성 존재",
            "performance": "대규모 데이터 작업 시 성능 저하 가능"
        },
        "isAIRecommended": false,
        "boundedContext": {
            "name": "BookManagement",
            "alias": "도서 관리",
            "displayName": "도서 관리",
            "description": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
            "aggregates": [
                {
                    "name": "Book",
                    "alias": "도서"
                }
            ]
        },
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서 새로운 도서를 등록하여 도서 대출 및 관리를 가능하게 하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력해야 함\",\"ISBN은 13자리 숫자이며 중복 확인을 통과해야 함\",\"카테고리는 소설/비소설/학술/잡지 중 하나를 선택해야 함\",\"등록 완료 시 도서 상태는 '대출가능'이어야 함\"]},{\"title\":\"도서 상태 변경 관리\",\"description\":\"관리자로서 도서의 상태를 변경하여 대출/반납/폐기 상황을 정확히 반영하고 싶다.\",\"acceptance\":[\"도서 대출 시 상태가 '대출가능'에서 '대출중'으로 변경되어야 함\",\"도서 반납 시 상태가 '대출중'에서 '대출가능'으로 변경되어야 함\",\"도서 예약 시 상태가 '대출가능'에서 '예약중'으로 변경되어야 함\",\"도서 폐기 시 상태가 '폐기'로 변경되고 대출이 불가능해야 함\"]},{\"title\":\"도서 대출 및 상태 변경 이력 조회\",\"description\":\"관리자로서 특정 도서의 대출 및 상태 변경 이력을 확인하여 도서의 사용 현황과 변화를 추적하고 싶다.\",\"acceptance\":[\"각 도서별 대출 이력과 상태 변경 이력이 조회 가능해야 함\",\"이력에는 날짜, 변경된 상태, 관련 사용자 정보가 포함되어야 함\",\"이력을 정렬 및 필터링할 수 있어야 함\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"validation\":\"13자리 숫자\",\"unique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"History\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"changeDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"userId\",\"type\":\"string\",\"required\":false}]}},\"businessRules\":[{\"name\":\"ISBNValidation\",\"description\":\"ISBN은 13자리 숫자이며 중복이 없어야 한다.\"},{\"name\":\"InitialBookStatus\",\"description\":\"도서 등록 시 기본 상태는 '대출가능'이어야 한다.\"},{\"name\":\"StatusChangeLogic\",\"description\":\"대출, 반납, 예약, 폐기 시 상태 변경 로직을 따른다.\"}],\"interfaces\":{\"도서관리\":{\"sections\":[{\"name\":\"도서등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"취소\"]},{\"name\":\"도서목록\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"category\",\"type\":\"select\"},{\"name\":\"status\",\"type\":\"text\"}],\"actions\":[\"조회\",\"수정\",\"삭제\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"도서명\",\"ISBN\",\"저자\",\"카테고리\",\"상태\"],\"actions\":[\"상세보기\",\"대출\",\"반납\",\"폐기\"]}}]}}}"
    },
    "LoanManagement": {
        "structure": [
            {
                "aggregate": {
                    "name": "Loan",
                    "alias": "대출"
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
                        "name": "Member",
                        "alias": "회원"
                    },
                    {
                        "name": "LoanPeriod",
                        "alias": "대출 기간"
                    },
                    {
                        "name": "LoanStatus",
                        "alias": "대출 상태"
                    }
                ]
            }
        ],
        "analysis": {
            "transactionalConsistency": "대출 관련 모든 작업이 단일 어그리게이트 내에서 처리되어 강한 일관성 유지",
            "performanceScalability": "단일 어그리게이트 구조로 간단한 작업에 적합하지만 확장성은 제한적",
            "domainAlignment": "대출 도메인의 핵심 요구사항과 잘 맞음",
            "maintainability": "구조가 단순하여 유지보수가 용이함",
            "futureFlexibility": "구조 변경 없이 새로운 기능 추가는 제한적"
        },
        "pros": {
            "cohesion": "대출 로직이 단일 어그리게이트 내에서 잘 통합됨",
            "coupling": "외부 어그리게이트(Book, Member)와 최소한의 결합",
            "consistency": "대출 작업의 강한 일관성 보장",
            "encapsulation": "대출 관련 비즈니스 로직이 잘 캡슐화됨",
            "complexity": "구조가 단순하여 이해하기 쉬움",
            "independence": "다른 어그리게이트에 독립적으로 동작 가능",
            "performance": "단일 어그리게이트 조회로 작업 처리"
        },
        "cons": {
            "cohesion": "예약과 대출 상태 관리가 분리되지 않음",
            "coupling": "Book 및 Member에 대한 참조가 필요",
            "consistency": "참조 데이터 동기화 필요",
            "encapsulation": "예약 로직이 포함될 경우 복잡성 증가",
            "complexity": "특정 기능 확장 시 구조가 복잡해질 수 있음",
            "independence": "예약과 대출의 독립적 관리가 어려움",
            "performance": "대규모 데이터 조회 시 성능 이슈"
        },
        "isAIRecommended": false,
        "boundedContext": {
            "name": "LoanManagement",
            "alias": "대출/반납 관리",
            "displayName": "대출/반납 관리",
            "description": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해. 대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.",
            "aggregates": [
                {
                    "name": "Loan",
                    "alias": "대출"
                },
                {
                    "name": "Member",
                    "alias": "회원"
                }
            ]
        },
        "description": "{\"userStories\":[{\"title\":\"도서 대출 신청\",\"description\":\"회원으로서 원하는 도서를 대출 신청할 수 있어야 한다.\",\"acceptance\":[\"회원번호와 이름으로 회원 정보 확인\",\"대출할 도서는 도서명 또는 ISBN으로 검색 가능\",\"대출 기간은 7일, 14일, 30일 중 선택\",\"대출하려는 도서가 이미 대출 중인 경우 예약 가능\",\"대출 완료 시 도서 상태가 '대출중'으로 변경\"]},{\"title\":\"대출 현황 조회 및 처리\",\"description\":\"회원으로서 대출 중인 도서 현황을 보고, 연장 또는 반납을 처리할 수 있어야 한다.\",\"acceptance\":[\"현재 대출 중인 도서 목록 표시\",\"각 대출 건의 대출일, 반납예정일, 현재 상태 표시\",\"대출 중인 도서는 연장 및 반납 가능\",\"반납 완료 시 도서 상태가 '대출가능'으로 변경\",\"예약자가 있는 도서 반납 시 상태가 '예약중'으로 변경\"]}],\"entities\":{\"회원\":{\"properties\":[{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"이름\",\"type\":\"string\",\"required\":true}]},\"도서\":{\"properties\":[{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"도서명\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\"]}]},\"대출\":{\"properties\":[{\"name\":\"대출번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"대출일\",\"type\":\"date\",\"required\":true},{\"name\":\"반납예정일\",\"type\":\"date\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]},\"예약\":{\"properties\":[{\"name\":\"예약번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"예약일\",\"type\":\"date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출기간제한\",\"description\":\"대출 기간은 7일, 14일, 30일 중 하나여야 한다.\"},{\"name\":\"대출가능여부\",\"description\":\"대출은 '대출가능' 상태의 도서만 가능하다.\"},{\"name\":\"반납처리\",\"description\":\"도서 반납 시 상태는 '대출가능'으로 변경된다. 단, 예약자가 있는 경우 '예약중'으로 변경된다.\"}],\"interfaces\":{\"대출반납\":{\"sections\":[{\"name\":\"대출신청\",\"type\":\"form\",\"fields\":[{\"name\":\"회원번호\",\"type\":\"text\",\"required\":true},{\"name\":\"이름\",\"type\":\"text\",\"required\":true},{\"name\":\"도서검색\",\"type\":\"search\",\"required\":true},{\"name\":\"대출기간\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출\"]},{\"name\":\"반납처리\",\"type\":\"table\",\"filters\":[\"회원번호\",\"도서번호\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]},\"대출현황\":{\"sections\":[{\"name\":\"대출목록\",\"type\":\"table\",\"filters\":[\"회원번호\",\"상태\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]}}}"
    }
}

            this.generateFromDraftWithXAI(testDraft)
        },

        _ESActionTest() {
            const allEsActions = [
                [
                    {
                        "actionName": "CreateBookBoundedContext",
                        "objectType": "BoundedContext",
                        "ids": {
                            "boundedContextId": "bc-booking"
                        },
                        "args": {
                            "boundedContextName": "Booking",
                            "boundedContextAlias": "도서 관리"
                        }
                    },
         {
            "actionName": "CreateBookAggregate",
            "objectType": "Aggregate",
            "ids": {
                "boundedContextId": "bc-booking",
               "aggregateId": "agg-book"
            },
            "args": {
               "aggregateName": "Book",
               "aggregateAlias": "도서",
               "properties": [
                  {
                     "name": "bookId",
                     "type": "String",
                     "isKey": true
                  },
                  {
                     "name": "title"
                  },
                  {
                     "name": "isbn",
                     "type": "ISBN"
                  },
                  {
                     "name": "author"
                  },
                  {
                     "name": "publisher"
                  },
                  {
                     "name": "category",
                     "type": "Category"
                  },
                  {
                     "name": "status",
                     "type": "Status"
                  }
               ]
            }
         },
         {
            "actionName": "CreateISBNValueObject",
            "objectType": "ValueObject",
            "ids": {
               "boundedContextId": "bc-booking",
               "aggregateId": "agg-book",
               "valueObjectId": "vo-isbn"
            },
            "args": {
               "valueObjectName": "ISBN",
               "valueObjectAlias": "ISBN 번호",
               "properties": [
                  {
                     "name": "value"
                  },
                  {
                     "name": "validationRule",
                     "type": "String"
                  }
               ]
            }
         },
         {
            "actionName": "CreateCategoryValueObject",
            "objectType": "ValueObject",
            "ids": {
               "boundedContextId": "bc-booking",
               "aggregateId": "agg-book",
               "valueObjectId": "vo-category"
            },
            "args": {
               "valueObjectName": "Category",
               "valueObjectAlias": "도서 카테고리",
               "properties": [
                  {
                     "name": "type",
                     "type": "CategoryType"
                  }
               ]
            }
         },
         {
            "actionName": "CreateStatusValueObject",
            "objectType": "ValueObject",
            "ids": {
               "boundedContextId": "bc-booking",
               "aggregateId": "agg-book",
               "valueObjectId": "vo-status"
            },
            "args": {
               "valueObjectName": "Status",
               "valueObjectAlias": "도서 상태",
               "properties": [
                  {
                     "name": "state",
                     "type": "StatusType"
                  }
               ]
            }
         },
         {
            "actionName": "CreateCategoryTypeEnumeration",
            "objectType": "Enumeration",
            "ids": {
               "boundedContextId": "bc-booking",
               "aggregateId": "agg-book",
               "enumerationId": "enum-category-type"
            },
            "args": {
               "enumerationName": "CategoryType",
               "enumerationAlias": "카테고리 유형",
               "properties": [
                  {
                     "name": "NOVEL"
                  },
                  {
                     "name": "NONFICTION"
                  },
                  {
                     "name": "ACADEMIC"
                  },
                  {
                     "name": "MAGAZINE"
                  }
               ]
            }
         },
         {
            "actionName": "CreateStatusTypeEnumeration",
            "objectType": "Enumeration",
            "ids": {
               "boundedContextId": "bc-booking",
               "aggregateId": "agg-book",
               "enumerationId": "enum-status-type"
            },
            "args": {
               "enumerationName": "StatusType",
               "enumerationAlias": "도서 상태",
               "properties": [
                  {
                     "name": "AVAILABLE"
                  },
                  {
                     "name": "BORROWED"
                  },
                  {
                     "name": "RESERVED"
                  },
                  {
                     "name": "DISCARDED"
                  }
               ]
            }
         }
                ],
                [
                    {
                        "actionName": "CreateLoanBoundedContext",
                        "objectType": "BoundedContext",
                        "ids": {
                            "boundedContextId": "bc-loan"
                        },
                        "args": {
                            "boundedContextName": "Loan",
                            "boundedContextAlias": "대출/반납 관리"
                        }
                    },
                    {
            "actionName": "CreateLoanAggregate",
            "objectType": "Aggregate",
            "ids": {
               "boundedContextId": "bc-loan",
               "aggregateId": "agg-loan"
            },
            "args": {
               "aggregateName": "Loan",
               "aggregateAlias": "대출",
               "properties": [
                  {
                     "name": "loanId",
                     "type": "String",
                     "isKey": true
                  },
                  {
                     "name": "member",
                     "type": "Member"
                  },
                  {
                     "name": "book",
                     "type": "Book"
                  },
                  {
                     "name": "loanPeriod",
                     "type": "LoanPeriod"
                  },
                  {
                     "name": "loanStatus",
                     "type": "LoanStatus"
                  },
                  {
                     "name": "loanDate",
                     "type": "Date"
                  },
                  {
                     "name": "dueDate",
                     "type": "Date"
                  }
               ]
            }
         },
         {
            "actionName": "CreateMemberValueObject",
            "objectType": "ValueObject",
            "ids": {
               "boundedContextId": "bc-loan",
               "aggregateId": "agg-loan",
               "valueObjectId": "vo-member"
            },
            "args": {
               "valueObjectName": "Member",
               "valueObjectAlias": "회원",
               "properties": [
                  {
                     "name": "memberId",
                     "type": "String",
                     "isKey": true
                  },
                  {
                     "name": "name"
                  }
               ]
            }
         },
         {
            "actionName": "CreateLoanPeriodValueObject",
            "objectType": "ValueObject",
            "ids": {
               "boundedContextId": "bc-loan",
               "aggregateId": "agg-loan",
               "valueObjectId": "vo-loan-period"
            },
            "args": {
               "valueObjectName": "LoanPeriod",
               "valueObjectAlias": "대출 기간",
               "properties": [
                  {
                     "name": "durationDays",
                     "type": "Integer"
                  }
               ]
            }
         },
         {
            "actionName": "CreateLoanStatusEnumeration",
            "objectType": "Enumeration",
            "ids": {
                "boundedContextId": "bc-loan",
               "aggregateId": "agg-loan",
               "enumerationId": "enum-loan-status"
            },
            "args": {
               "enumerationName": "LoanStatus",
               "enumerationAlias": "대출 상태",
               "properties": [
                  {
                     "name": "BORROWED"
                  },
                  {
                     "name": "OVERDUE"
                  },
                  {
                     "name": "RETURNED"
                  }
               ]
            }
         },
         {
            "actionName": "CreateBookEntity",
            "objectType": "Entity",
            "ids": {
               "boundedContextId": "bc-loan",
               "aggregateId": "agg-loan",
               "entityId": "entity-book"
            },
            "args": {
               "entityName": "Book",
               "entityAlias": "도서",
               "properties": [
                  {
                     "name": "bookId",
                     "type": "String",
                     "isKey": true
                  },
                  {
                     "name": "title"
                  },
                  {
                     "name": "isbn",
                     "type": "ISBN"
                  },
                  {
                     "name": "status",
                     "type": "BookStatus"
                  }
               ]
            }
         },
         {
            "actionName": "CreateBookStatusEnumeration",
            "objectType": "Enumeration",
            "ids": {
               "boundedContextId": "bc-loan",
               "aggregateId": "agg-loan",
               "enumerationId": "enum-book-status"
            },
            "args": {
               "enumerationName": "BookStatus",
               "enumerationAlias": "도서 상태",
               "properties": [
                  {
                     "name": "AVAILABLE"
                  },
                  {
                     "name": "BORROWED"
                  },
                  {
                     "name": "RESERVED"
                  }
               ]
            }
         }
                ]
            ]
            
            for(let esActions of allEsActions) {
                const appliedESValue = ESActionsUtil.getActionAppliedESValue(esActions, this.userInfo, this.information, this.value)
        
                this.changedByMe = true
                this.$set(this.value, "elements", appliedESValue.elements)
                this.$set(this.value, "relations", appliedESValue.relations) 
            }
        },

        _ESSummaryTest() {
            const targetBoundedContext = Object.values(this.value.elements).find(element => element && element.name === "LoanManagement")

            const summary = ESValueSummarizeWithFilterUtil.getSummarizedESValue(
               this.value,
               [],
               new ESAliasTransManager(this.value)
            )

            console.log(summary)
        },

        _CommandGeneratorTestByLibrary() {
            const testDraft = {
    "BookManagement": {
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
                        "alias": "ISBN 번호"
                    },
                    {
                        "name": "Category",
                        "alias": "도서 카테고리"
                    },
                    {
                        "name": "Status",
                        "alias": "도서 상태"
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
        ],
        "analysis": {
            "transactionalConsistency": "모든 도서 관련 데이터가 단일 집계 내에 있으므로 강한 트랜잭션 일관성 보장",
            "performanceScalability": "단일 집계 구조로 성능은 기본적으로 양호하나, 대규모 이력 데이터가 포함되면 성능 저하 가능",
            "domainAlignment": "도서 도메인 요구사항과 밀접하게 정렬됨",
            "maintainability": "단순한 구조로 유지보수가 용이하지만 기능 추가 시 복잡성이 증가할 수 있음",
            "futureFlexibility": "기능 확장이 제한적이며 구조 변경이 필요할 가능성 있음"
        },
        "pros": {
            "cohesion": "모든 도서 데이터를 단일 집계로 처리하여 높은 응집력",
            "coupling": "ValueObject를 통한 외부 참조로 낮은 결합도",
            "consistency": "도서 등록 및 상태 변경 로직에서 강한 일관성 유지",
            "encapsulation": "도서 관련 로직이 잘 캡슐화됨",
            "complexity": "단순하고 명확한 구조",
            "independence": "다른 집계와 독립적으로 작동 가능",
            "performance": "도서 작업의 효율적 처리"
        },
        "cons": {
            "cohesion": "이력 데이터가 추가되면 응집력이 저하될 수 있음",
            "coupling": "외부 참조 관리가 필요함",
            "consistency": "대규모 데이터 처리 시 트랜잭션 관리가 복잡해질 수 있음",
            "encapsulation": "모든 상태 변경 로직을 단일 집계 내에 처리해야 함",
            "complexity": "모든 데이터를 단일 구조로 처리하므로 일부 기능에서 복잡성 증가",
            "independence": "Loan과의 참조로 인해 약간의 의존성 존재",
            "performance": "대규모 데이터 작업 시 성능 저하 가능"
        },
        "isAIRecommended": false,
        "boundedContext": Object.values(this.value.elements).find(e => e && e.name === "BookManagement"),
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서 새로운 도서를 등록하여 도서 대출 및 관리를 가능하게 하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력해야 함\",\"ISBN은 13자리 숫자이며 중복 확인을 통과해야 함\",\"카테고리는 소설/비소설/학술/잡지 중 하나를 선택해야 함\",\"등록 완료 시 도서 상태는 '대출가능'이어야 함\"]},{\"title\":\"도서 상태 변경 관리\",\"description\":\"관리자로서 도서의 상태를 변경하여 대출/반납/폐기 상황을 정확히 반영하고 싶다.\",\"acceptance\":[\"도서 대출 시 상태가 '대출가능'에서 '대출중'으로 변경되어야 함\",\"도서 반납 시 상태가 '대출중'에서 '대출가능'으로 변경되어야 함\",\"도서 예약 시 상태가 '대출가능'에서 '예약중'으로 변경되어야 함\",\"도서 폐기 시 상태가 '폐기'로 변경되고 대출이 불가능해야 함\"]},{\"title\":\"도서 대출 및 상태 변경 이력 조회\",\"description\":\"관리자로서 특정 도서의 대출 및 상태 변경 이력을 확인하여 도서의 사용 현황과 변화를 추적하고 싶다.\",\"acceptance\":[\"각 도서별 대출 이력과 상태 변경 이력이 조회 가능해야 함\",\"이력에는 날짜, 변경된 상태, 관련 사용자 정보가 포함되어야 함\",\"이력을 정렬 및 필터링할 수 있어야 함\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"validation\":\"13자리 숫자\",\"unique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"History\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"changeDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"userId\",\"type\":\"string\",\"required\":false}]}},\"businessRules\":[{\"name\":\"ISBNValidation\",\"description\":\"ISBN은 13자리 숫자이며 중복이 없어야 한다.\"},{\"name\":\"InitialBookStatus\",\"description\":\"도서 등록 시 기본 상태는 '대출가능'이어야 한다.\"},{\"name\":\"StatusChangeLogic\",\"description\":\"대출, 반납, 예약, 폐기 시 상태 변경 로직을 따른다.\"}],\"interfaces\":{\"도서관리\":{\"sections\":[{\"name\":\"도서등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"취소\"]},{\"name\":\"도서목록\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"category\",\"type\":\"select\"},{\"name\":\"status\",\"type\":\"text\"}],\"actions\":[\"조회\",\"수정\",\"삭제\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"도서명\",\"ISBN\",\"저자\",\"카테고리\",\"상태\"],\"actions\":[\"상세보기\",\"대출\",\"반납\",\"폐기\"]}}]}}}"
    },
    "LoanManagement": {
        "structure": [
            {
                "aggregate": {
                    "name": "Loan",
                    "alias": "대출"
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
                        "name": "Member",
                        "alias": "회원"
                    },
                    {
                        "name": "LoanPeriod",
                        "alias": "대출 기간"
                    },
                    {
                        "name": "LoanStatus",
                        "alias": "대출 상태"
                    }
                ]
            }
        ],
        "analysis": {
            "transactionalConsistency": "대출 관련 모든 작업이 단일 어그리게이트 내에서 처리되어 강한 일관성 유지",
            "performanceScalability": "단일 어그리게이트 구조로 간단한 작업에 적합하지만 확장성은 제한적",
            "domainAlignment": "대출 도메인의 핵심 요구사항과 잘 맞음",
            "maintainability": "구조가 단순하여 유지보수가 용이함",
            "futureFlexibility": "구조 변경 없이 새로운 기능 추가는 제한적"
        },
        "pros": {
            "cohesion": "대출 로직이 단일 어그리게이트 내에서 잘 통합됨",
            "coupling": "외부 어그리게이트(Book, Member)와 최소한의 결합",
            "consistency": "대출 작업의 강한 일관성 보장",
            "encapsulation": "대출 관련 비즈니스 로직이 잘 캡슐화됨",
            "complexity": "구조가 단순하여 이해하기 쉬움",
            "independence": "다른 어그리게이트에 독립적으로 동작 가능",
            "performance": "단일 어그리게이트 조회로 작업 처리"
        },
        "cons": {
            "cohesion": "예약과 대출 상태 관리가 분리되지 않음",
            "coupling": "Book 및 Member에 대한 참조가 필요",
            "consistency": "참조 데이터 동기화 필요",
            "encapsulation": "예약 로직이 포함될 경우 복잡성 증가",
            "complexity": "특정 기능 확장 시 구조가 복잡해질 수 있음",
            "independence": "예약과 대출의 독립적 관리가 어려움",
            "performance": "대규모 데이터 조회 시 성능 이슈"
        },
        "isAIRecommended": false,
        "boundedContext": Object.values(this.value.elements).find(e => e && e.name === "LoanManagement"),
        "description": "{\"userStories\":[{\"title\":\"도서 대출 신청\",\"description\":\"회원으로서 원하는 도서를 대출 신청할 수 있어야 한다.\",\"acceptance\":[\"회원번호와 이름으로 회원 정보 확인\",\"대출할 도서는 도서명 또는 ISBN으로 검색 가능\",\"대출 기간은 7일, 14일, 30일 중 선택\",\"대출하려는 도서가 이미 대출 중인 경우 예약 가능\",\"대출 완료 시 도서 상태가 '대출중'으로 변경\"]},{\"title\":\"대출 현황 조회 및 처리\",\"description\":\"회원으로서 대출 중인 도서 현황을 보고, 연장 또는 반납을 처리할 수 있어야 한다.\",\"acceptance\":[\"현재 대출 중인 도서 목록 표시\",\"각 대출 건의 대출일, 반납예정일, 현재 상태 표시\",\"대출 중인 도서는 연장 및 반납 가능\",\"반납 완료 시 도서 상태가 '대출가능'으로 변경\",\"예약자가 있는 도서 반납 시 상태가 '예약중'으로 변경\"]}],\"entities\":{\"회원\":{\"properties\":[{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"이름\",\"type\":\"string\",\"required\":true}]},\"도서\":{\"properties\":[{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"도서명\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\"]}]},\"대출\":{\"properties\":[{\"name\":\"대출번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"대출일\",\"type\":\"date\",\"required\":true},{\"name\":\"반납예정일\",\"type\":\"date\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]},\"예약\":{\"properties\":[{\"name\":\"예약번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"예약일\",\"type\":\"date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출기간제한\",\"description\":\"대출 기간은 7일, 14일, 30일 중 하나여야 한다.\"},{\"name\":\"대출가능여부\",\"description\":\"대출은 '대출가능' 상태의 도서만 가능하다.\"},{\"name\":\"반납처리\",\"description\":\"도서 반납 시 상태는 '대출가능'으로 변경된다. 단, 예약자가 있는 경우 '예약중'으로 변경된다.\"}],\"interfaces\":{\"대출반납\":{\"sections\":[{\"name\":\"대출신청\",\"type\":\"form\",\"fields\":[{\"name\":\"회원번호\",\"type\":\"text\",\"required\":true},{\"name\":\"이름\",\"type\":\"text\",\"required\":true},{\"name\":\"도서검색\",\"type\":\"search\",\"required\":true},{\"name\":\"대출기간\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출\"]},{\"name\":\"반납처리\",\"type\":\"table\",\"filters\":[\"회원번호\",\"도서번호\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]},\"대출현황\":{\"sections\":[{\"name\":\"대출목록\",\"type\":\"table\",\"filters\":[\"회원번호\",\"상태\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]}}}"
    }
            }

            const afterElements = JSON.parse(JSON.stringify(this.value.elements))
            Object.values(this.value.elements).forEach(element => {
                if(element && element._type !== "org.uengine.modeling.model.BoundedContext" && element._type !== "org.uengine.modeling.model.Aggregate") {

                    afterElements[element.id] = null
                }
            })

            const afterRelations = JSON.parse(JSON.stringify(this.value.relations))
            Object.values(this.value.relations).forEach(relation => {
                if(relation && relation._type === "org.uengine.modeling.model.Relation" && relation.sourceElement._type !== "org.uengine.modeling.model.Aggregate" && relation.targetElement._type !== "org.uengine.modeling.model.Aggregate") {

                    afterRelations[relation.id] = null
                }
            })

            this.changedByMe = true
            this.$set(this.value, "elements", afterElements)
            this.$set(this.value, "relations", afterRelations) 

            this.generators.CreateCommandActionsByFunctions.initInputs(testDraft)
            this.generators.CreateCommandActionsByFunctions.generateIfInputsExist()

            this.generators.CreatePolicyActionsByFunctions.generateIfInputsExist = () => {return false}
        },

        _PolicyGeneratorTestByLibrary() {
            const testDraft = {
    "BookManagement": {
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
                        "alias": "ISBN 번호"
                    },
                    {
                        "name": "Category",
                        "alias": "도서 카테고리"
                    },
                    {
                        "name": "Status",
                        "alias": "도서 상태"
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
        ],
        "analysis": {
            "transactionalConsistency": "모든 도서 관련 데이터가 단일 집계 내에 있으므로 강한 트랜잭션 일관성 보장",
            "performanceScalability": "단일 집계 구조로 성능은 기본적으로 양호하나, 대규모 이력 데이터가 포함되면 성능 저하 가능",
            "domainAlignment": "도서 도메인 요구사항과 밀접하게 정렬됨",
            "maintainability": "단순한 구조로 유지보수가 용이하지만 기능 추가 시 복잡성이 증가할 수 있음",
            "futureFlexibility": "기능 확장이 제한적이며 구조 변경이 필요할 가능성 있음"
        },
        "pros": {
            "cohesion": "모든 도서 데이터를 단일 집계로 처리하여 높은 응집력",
            "coupling": "ValueObject를 통한 외부 참조로 낮은 결합도",
            "consistency": "도서 등록 및 상태 변경 로직에서 강한 일관성 유지",
            "encapsulation": "도서 관련 로직이 잘 캡슐화됨",
            "complexity": "단순하고 명확한 구조",
            "independence": "다른 집계와 독립적으로 작동 가능",
            "performance": "도서 작업의 효율적 처리"
        },
        "cons": {
            "cohesion": "이력 데이터가 추가되면 응집력이 저하될 수 있음",
            "coupling": "외부 참조 관리가 필요함",
            "consistency": "대규모 데이터 처리 시 트랜잭션 관리가 복잡해질 수 있음",
            "encapsulation": "모든 상태 변경 로직을 단일 집계 내에 처리해야 함",
            "complexity": "모든 데이터를 단일 구조로 처리하므로 일부 기능에서 복잡성 증가",
            "independence": "Loan과의 참조로 인해 약간의 의존성 존재",
            "performance": "대규모 데이터 작업 시 성능 저하 가능"
        },
        "isAIRecommended": false,
        "boundedContext": Object.values(this.value.elements).find(e => e && e.name === "BookManagement"),
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서 새로운 도서를 등록하여 도서 대출 및 관리를 가능하게 하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력해야 함\",\"ISBN은 13자리 숫자이며 중복 확인을 통과해야 함\",\"카테고리는 소설/비소설/학술/잡지 중 하나를 선택해야 함\",\"등록 완료 시 도서 상태는 '대출가능'이어야 함\"]},{\"title\":\"도서 상태 변경 관리\",\"description\":\"관리자로서 도서의 상태를 변경하여 대출/반납/폐기 상황을 정확히 반영하고 싶다.\",\"acceptance\":[\"도서 대출 시 상태가 '대출가능'에서 '대출중'으로 변경되어야 함\",\"도서 반납 시 상태가 '대출중'에서 '대출가능'으로 변경되어야 함\",\"도서 예약 시 상태가 '대출가능'에서 '예약중'으로 변경되어야 함\",\"도서 폐기 시 상태가 '폐기'로 변경되고 대출이 불가능해야 함\"]},{\"title\":\"도서 대출 및 상태 변경 이력 조회\",\"description\":\"관리자로서 특정 도서의 대출 및 상태 변경 이력을 확인하여 도서의 사용 현황과 변화를 추적하고 싶다.\",\"acceptance\":[\"각 도서별 대출 이력과 상태 변경 이력이 조회 가능해야 함\",\"이력에는 날짜, 변경된 상태, 관련 사용자 정보가 포함되어야 함\",\"이력을 정렬 및 필터링할 수 있어야 함\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"validation\":\"13자리 숫자\",\"unique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"History\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"changeDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"userId\",\"type\":\"string\",\"required\":false}]}},\"businessRules\":[{\"name\":\"ISBNValidation\",\"description\":\"ISBN은 13자리 숫자이며 중복이 없어야 한다.\"},{\"name\":\"InitialBookStatus\",\"description\":\"도서 등록 시 기본 상태는 '대출가능'이어야 한다.\"},{\"name\":\"StatusChangeLogic\",\"description\":\"대출, 반납, 예약, 폐기 시 상태 변경 로직을 따른다.\"}],\"interfaces\":{\"도서관리\":{\"sections\":[{\"name\":\"도서등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"취소\"]},{\"name\":\"도서목록\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"category\",\"type\":\"select\"},{\"name\":\"status\",\"type\":\"text\"}],\"actions\":[\"조회\",\"수정\",\"삭제\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"도서명\",\"ISBN\",\"저자\",\"카테고리\",\"상태\"],\"actions\":[\"상세보기\",\"대출\",\"반납\",\"폐기\"]}}]}}}"
    },
    "LoanManagement": {
        "structure": [
            {
                "aggregate": {
                    "name": "Loan",
                    "alias": "대출"
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
                        "name": "Member",
                        "alias": "회원"
                    },
                    {
                        "name": "LoanPeriod",
                        "alias": "대출 기간"
                    },
                    {
                        "name": "LoanStatus",
                        "alias": "대출 상태"
                    }
                ]
            }
        ],
        "analysis": {
            "transactionalConsistency": "대출 관련 모든 작업이 단일 어그리게이트 내에서 처리되어 강한 일관성 유지",
            "performanceScalability": "단일 어그리게이트 구조로 간단한 작업에 적합하지만 확장성은 제한적",
            "domainAlignment": "대출 도메인의 핵심 요구사항과 잘 맞음",
            "maintainability": "구조가 단순하여 유지보수가 용이함",
            "futureFlexibility": "구조 변경 없이 새로운 기능 추가는 제한적"
        },
        "pros": {
            "cohesion": "대출 로직이 단일 어그리게이트 내에서 잘 통합됨",
            "coupling": "외부 어그리게이트(Book, Member)와 최소한의 결합",
            "consistency": "대출 작업의 강한 일관성 보장",
            "encapsulation": "대출 관련 비즈니스 로직이 잘 캡슐화됨",
            "complexity": "구조가 단순하여 이해하기 쉬움",
            "independence": "다른 어그리게이트에 독립적으로 동작 가능",
            "performance": "단일 어그리게이트 조회로 작업 처리"
        },
        "cons": {
            "cohesion": "예약과 대출 상태 관리가 분리되지 않음",
            "coupling": "Book 및 Member에 대한 참조가 필요",
            "consistency": "참조 데이터 동기화 필요",
            "encapsulation": "예약 로직이 포함될 경우 복잡성 증가",
            "complexity": "특정 기능 확장 시 구조가 복잡해질 수 있음",
            "independence": "예약과 대출의 독립적 관리가 어려움",
            "performance": "대규모 데이터 조회 시 성능 이슈"
        },
        "isAIRecommended": false,
        "boundedContext": Object.values(this.value.elements).find(e => e && e.name === "LoanManagement"),
        "description": "{\"userStories\":[{\"title\":\"도서 대출 신청\",\"description\":\"회원으로서 원하는 도서를 대출 신청할 수 있어야 한다.\",\"acceptance\":[\"회원번호와 이름으로 회원 정보 확인\",\"대출할 도서는 도서명 또는 ISBN으로 검색 가능\",\"대출 기간은 7일, 14일, 30일 중 선택\",\"대출하려는 도서가 이미 대출 중인 경우 예약 가능\",\"대출 완료 시 도서 상태가 '대출중'으로 변경\"]},{\"title\":\"대출 현황 조회 및 처리\",\"description\":\"회원으로서 대출 중인 도서 현황을 보고, 연장 또는 반납을 처리할 수 있어야 한다.\",\"acceptance\":[\"현재 대출 중인 도서 목록 표시\",\"각 대출 건의 대출일, 반납예정일, 현재 상태 표시\",\"대출 중인 도서는 연장 및 반납 가능\",\"반납 완료 시 도서 상태가 '대출가능'으로 변경\",\"예약자가 있는 도서 반납 시 상태가 '예약중'으로 변경\"]}],\"entities\":{\"회원\":{\"properties\":[{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"이름\",\"type\":\"string\",\"required\":true}]},\"도서\":{\"properties\":[{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"도서명\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\"]}]},\"대출\":{\"properties\":[{\"name\":\"대출번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"대출일\",\"type\":\"date\",\"required\":true},{\"name\":\"반납예정일\",\"type\":\"date\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]},\"예약\":{\"properties\":[{\"name\":\"예약번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"예약일\",\"type\":\"date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출기간제한\",\"description\":\"대출 기간은 7일, 14일, 30일 중 하나여야 한다.\"},{\"name\":\"대출가능여부\",\"description\":\"대출은 '대출가능' 상태의 도서만 가능하다.\"},{\"name\":\"반납처리\",\"description\":\"도서 반납 시 상태는 '대출가능'으로 변경된다. 단, 예약자가 있는 경우 '예약중'으로 변경된다.\"}],\"interfaces\":{\"대출반납\":{\"sections\":[{\"name\":\"대출신청\",\"type\":\"form\",\"fields\":[{\"name\":\"회원번호\",\"type\":\"text\",\"required\":true},{\"name\":\"이름\",\"type\":\"text\",\"required\":true},{\"name\":\"도서검색\",\"type\":\"search\",\"required\":true},{\"name\":\"대출기간\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출\"]},{\"name\":\"반납처리\",\"type\":\"table\",\"filters\":[\"회원번호\",\"도서번호\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]},\"대출현황\":{\"sections\":[{\"name\":\"대출목록\",\"type\":\"table\",\"filters\":[\"회원번호\",\"상태\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]}}}"
    }
            }

            this.generators.CreatePolicyActionsByFunctions.initInputs(testDraft)
            this.generators.CreatePolicyActionsByFunctions.generateIfInputsExist()

            this.generators.GWTGeneratorByFunctions.generateIfInputsExist = () => {return false}
        },

        _CommandGWTGeneratorTestByLibrary() {
            const testDraft = {
    "BookManagement": {
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
                        "alias": "ISBN 번호"
                    },
                    {
                        "name": "Category",
                        "alias": "도서 카테고리"
                    },
                    {
                        "name": "Status",
                        "alias": "도서 상태"
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
        ],
        "analysis": {
            "transactionalConsistency": "모든 도서 관련 데이터가 단일 집계 내에 있으므로 강한 트랜잭션 일관성 보장",
            "performanceScalability": "단일 집계 구조로 성능은 기본적으로 양호하나, 대규모 이력 데이터가 포함되면 성능 저하 가능",
            "domainAlignment": "도서 도메인 요구사항과 밀접하게 정렬됨",
            "maintainability": "단순한 구조로 유지보수가 용이하지만 기능 추가 시 복잡성이 증가할 수 있음",
            "futureFlexibility": "기능 확장이 제한적이며 구조 변경이 필요할 가능성 있음"
        },
        "pros": {
            "cohesion": "모든 도서 데이터를 단일 집계로 처리하여 높은 응집력",
            "coupling": "ValueObject를 통한 외부 참조로 낮은 결합도",
            "consistency": "도서 등록 및 상태 변경 로직에서 강한 일관성 유지",
            "encapsulation": "도서 관련 로직이 잘 캡슐화됨",
            "complexity": "단순하고 명확한 구조",
            "independence": "다른 집계와 독립적으로 작동 가능",
            "performance": "도서 작업의 효율적 처리"
        },
        "cons": {
            "cohesion": "이력 데이터가 추가되면 응집력이 저하될 수 있음",
            "coupling": "외부 참조 관리가 필요함",
            "consistency": "대규모 데이터 처리 시 트랜잭션 관리가 복잡해질 수 있음",
            "encapsulation": "모든 상태 변경 로직을 단일 집계 내에 처리해야 함",
            "complexity": "모든 데이터를 단일 구조로 처리하므로 일부 기능에서 복잡성 증가",
            "independence": "Loan과의 참조로 인해 약간의 의존성 존재",
            "performance": "대규모 데이터 작업 시 성능 저하 가능"
        },
        "isAIRecommended": false,
        "boundedContext": Object.values(this.value.elements).find(e => e && e.name === "BookManagement"),
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 등록\",\"description\":\"관리자로서 새로운 도서를 등록하여 도서 대출 및 관리를 가능하게 하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력해야 함\",\"ISBN은 13자리 숫자이며 중복 확인을 통과해야 함\",\"카테고리는 소설/비소설/학술/잡지 중 하나를 선택해야 함\",\"등록 완료 시 도서 상태는 '대출가능'이어야 함\"]},{\"title\":\"도서 상태 변경 관리\",\"description\":\"관리자로서 도서의 상태를 변경하여 대출/반납/폐기 상황을 정확히 반영하고 싶다.\",\"acceptance\":[\"도서 대출 시 상태가 '대출가능'에서 '대출중'으로 변경되어야 함\",\"도서 반납 시 상태가 '대출중'에서 '대출가능'으로 변경되어야 함\",\"도서 예약 시 상태가 '대출가능'에서 '예약중'으로 변경되어야 함\",\"도서 폐기 시 상태가 '폐기'로 변경되고 대출이 불가능해야 함\"]},{\"title\":\"도서 대출 및 상태 변경 이력 조회\",\"description\":\"관리자로서 특정 도서의 대출 및 상태 변경 이력을 확인하여 도서의 사용 현황과 변화를 추적하고 싶다.\",\"acceptance\":[\"각 도서별 대출 이력과 상태 변경 이력이 조회 가능해야 함\",\"이력에는 날짜, 변경된 상태, 관련 사용자 정보가 포함되어야 함\",\"이력을 정렬 및 필터링할 수 있어야 함\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true,\"validation\":\"13자리 숫자\",\"unique\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"History\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"changeDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"userId\",\"type\":\"string\",\"required\":false}]}},\"businessRules\":[{\"name\":\"ISBNValidation\",\"description\":\"ISBN은 13자리 숫자이며 중복이 없어야 한다.\"},{\"name\":\"InitialBookStatus\",\"description\":\"도서 등록 시 기본 상태는 '대출가능'이어야 한다.\"},{\"name\":\"StatusChangeLogic\",\"description\":\"대출, 반납, 예약, 폐기 시 상태 변경 로직을 따른다.\"}],\"interfaces\":{\"도서관리\":{\"sections\":[{\"name\":\"도서등록\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"취소\"]},{\"name\":\"도서목록\",\"type\":\"table\",\"fields\":[{\"name\":\"title\",\"type\":\"text\"},{\"name\":\"ISBN\",\"type\":\"text\"},{\"name\":\"author\",\"type\":\"text\"},{\"name\":\"category\",\"type\":\"select\"},{\"name\":\"status\",\"type\":\"text\"}],\"actions\":[\"조회\",\"수정\",\"삭제\"],\"filters\":[\"카테고리\",\"상태\"],\"resultTable\":{\"columns\":[\"도서명\",\"ISBN\",\"저자\",\"카테고리\",\"상태\"],\"actions\":[\"상세보기\",\"대출\",\"반납\",\"폐기\"]}}]}}}"
    },
    "LoanManagement": {
        "structure": [
            {
                "aggregate": {
                    "name": "Loan",
                    "alias": "대출"
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
                        "name": "Member",
                        "alias": "회원"
                    },
                    {
                        "name": "LoanPeriod",
                        "alias": "대출 기간"
                    },
                    {
                        "name": "LoanStatus",
                        "alias": "대출 상태"
                    }
                ]
            }
        ],
        "analysis": {
            "transactionalConsistency": "대출 관련 모든 작업이 단일 어그리게이트 내에서 처리되어 강한 일관성 유지",
            "performanceScalability": "단일 어그리게이트 구조로 간단한 작업에 적합하지만 확장성은 제한적",
            "domainAlignment": "대출 도메인의 핵심 요구사항과 잘 맞음",
            "maintainability": "구조가 단순하여 유지보수가 용이함",
            "futureFlexibility": "구조 변경 없이 새로운 기능 추가는 제한적"
        },
        "pros": {
            "cohesion": "대출 로직이 단일 어그리게이트 내에서 잘 통합됨",
            "coupling": "외부 어그리게이트(Book, Member)와 최소한의 결합",
            "consistency": "대출 작업의 강한 일관성 보장",
            "encapsulation": "대출 관련 비즈니스 로직이 잘 캡슐화됨",
            "complexity": "구조가 단순하여 이해하기 쉬움",
            "independence": "다른 어그리게이트에 독립적으로 동작 가능",
            "performance": "단일 어그리게이트 조회로 작업 처리"
        },
        "cons": {
            "cohesion": "예약과 대출 상태 관리가 분리되지 않음",
            "coupling": "Book 및 Member에 대한 참조가 필요",
            "consistency": "참조 데이터 동기화 필요",
            "encapsulation": "예약 로직이 포함될 경우 복잡성 증가",
            "complexity": "특정 기능 확장 시 구조가 복잡해질 수 있음",
            "independence": "예약과 대출의 독립적 관리가 어려움",
            "performance": "대규모 데이터 조회 시 성능 이슈"
        },
        "isAIRecommended": false,
        "boundedContext": Object.values(this.value.elements).find(e => e && e.name === "LoanManagement"),
        "description": "{\"userStories\":[{\"title\":\"도서 대출 신청\",\"description\":\"회원으로서 원하는 도서를 대출 신청할 수 있어야 한다.\",\"acceptance\":[\"회원번호와 이름으로 회원 정보 확인\",\"대출할 도서는 도서명 또는 ISBN으로 검색 가능\",\"대출 기간은 7일, 14일, 30일 중 선택\",\"대출하려는 도서가 이미 대출 중인 경우 예약 가능\",\"대출 완료 시 도서 상태가 '대출중'으로 변경\"]},{\"title\":\"대출 현황 조회 및 처리\",\"description\":\"회원으로서 대출 중인 도서 현황을 보고, 연장 또는 반납을 처리할 수 있어야 한다.\",\"acceptance\":[\"현재 대출 중인 도서 목록 표시\",\"각 대출 건의 대출일, 반납예정일, 현재 상태 표시\",\"대출 중인 도서는 연장 및 반납 가능\",\"반납 완료 시 도서 상태가 '대출가능'으로 변경\",\"예약자가 있는 도서 반납 시 상태가 '예약중'으로 변경\"]}],\"entities\":{\"회원\":{\"properties\":[{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"이름\",\"type\":\"string\",\"required\":true}]},\"도서\":{\"properties\":[{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"도서명\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\"]}]},\"대출\":{\"properties\":[{\"name\":\"대출번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"대출일\",\"type\":\"date\",\"required\":true},{\"name\":\"반납예정일\",\"type\":\"date\",\"required\":true},{\"name\":\"상태\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]},\"예약\":{\"properties\":[{\"name\":\"예약번호\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"회원번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"회원\"},{\"name\":\"도서번호\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"도서\"},{\"name\":\"예약일\",\"type\":\"date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"대출기간제한\",\"description\":\"대출 기간은 7일, 14일, 30일 중 하나여야 한다.\"},{\"name\":\"대출가능여부\",\"description\":\"대출은 '대출가능' 상태의 도서만 가능하다.\"},{\"name\":\"반납처리\",\"description\":\"도서 반납 시 상태는 '대출가능'으로 변경된다. 단, 예약자가 있는 경우 '예약중'으로 변경된다.\"}],\"interfaces\":{\"대출반납\":{\"sections\":[{\"name\":\"대출신청\",\"type\":\"form\",\"fields\":[{\"name\":\"회원번호\",\"type\":\"text\",\"required\":true},{\"name\":\"이름\",\"type\":\"text\",\"required\":true},{\"name\":\"도서검색\",\"type\":\"search\",\"required\":true},{\"name\":\"대출기간\",\"type\":\"select\",\"required\":true}],\"actions\":[\"대출\"]},{\"name\":\"반납처리\",\"type\":\"table\",\"filters\":[\"회원번호\",\"도서번호\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]},\"대출현황\":{\"sections\":[{\"name\":\"대출목록\",\"type\":\"table\",\"filters\":[\"회원번호\",\"상태\"],\"resultTable\":{\"columns\":[\"대출번호\",\"도서명\",\"대출일\",\"반납예정일\",\"상태\"],\"actions\":[\"연장\",\"반납\"]}}]}}}"
    }
            }

            this.generators.GWTGeneratorByFunctions.initInputs(testDraft)
            this.generators.GWTGeneratorByFunctions.generateIfInputsExist()
        },

        _TokenCounterTest() {
            // 1. getEstimatedTokenCount 테스트
            console.log("=== getEstimatedTokenCount 테스트 ===");
            console.log("기본 텍스트:", TokenCounter.getEstimatedTokenCount("Hello, World!"));
            console.log("한글 텍스트:", TokenCounter.getEstimatedTokenCount("안녕하세요!"));
            console.log("URL 포함:", TokenCounter.getEstimatedTokenCount("https://example.com"));
            console.log("이모지 포함:", TokenCounter.getEstimatedTokenCount("Hello 👋 World 😊"));
            console.log("복합 텍스트:", TokenCounter.getEstimatedTokenCount("안녕하세요! Hello World 👋 https://example.com"));

            // 2. getTotalEstimatedTokenCount 테스트
            console.log("\n=== getTotalEstimatedTokenCount 테스트 ===");
            const texts = [
                "Hello",
                "안녕하세요",
                "https://example.com",
                "👋 😊"
            ];
            console.log("여러 텍스트의 총 토큰:", TokenCounter.getTotalEstimatedTokenCount(texts));

            // 3. exceedsTokenLimit 테스트
            console.log("\n=== exceedsTokenLimit 테스트 ===");
            const testText = "This is a test sentence for token limit checking.";
            console.log("5토큰 제한 초과?", TokenCounter.exceedsTokenLimit(testText, 5));
            console.log("20토큰 제한 초과?", TokenCounter.exceedsTokenLimit(testText, 20));

            // 4. splitByTokenLimit 테스트
            console.log("\n=== splitByTokenLimit 테스트 ===");
            const longText = "첫 번째 문장입니다. 두 번째 문장이에요! 세 번째 문장이네요? 마지막 문장입니다.";
            console.log("5토큰 단위로 분할:", TokenCounter.splitByTokenLimit(longText, 5));

            // 5. optimizeToTokenLimit 테스트
            console.log("\n=== optimizeToTokenLimit 테스트 ===");
            const textToOptimize = "이것은 매우 긴 URL을 포함한 텍스트입니다: https://very-long-domain-name.com/path/to/something/else";
            console.log("10토큰으로 최적화:", TokenCounter.optimizeToTokenLimit(textToOptimize, 10));
        },

        _TempTest() {
         const commandsToReplace = [
    {
        "_type": "org.uengine.modeling.model.Command",
        "outputEvents": [
            "LoanApplied"
        ],
        "aggregate": {
            "id": "59630231-1ccf-f632-a379-e948f3d281fb"
        },
        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
        "boundedContext": {
            "id": "7b15d63b-9505-8216-80d3-1b0a189a12ca"
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
                "className": "Integer",
                "isCopy": false,
                "isKey": false,
                "name": "loanPeriod",
                "nameCamelCase": "loanPeriod",
                "namePascalCase": "LoanPeriod",
                "displayName": "",
                "_type": "org.uengine.model.FieldDescriptor"
            }
        ],
        "description": null,
        "id": "c877e530-3352-6f59-3de8-78b0dd449960",
        "elementView": {
            "_type": "org.uengine.modeling.model.Command",
            "height": 116,
            "id": "c877e530-3352-6f59-3de8-78b0dd449960",
            "style": "{}",
            "width": 100,
            "x": 1141,
            "y": 250,
            "z-index": 999
        },
        "hexagonalView": {
            "_type": "org.uengine.modeling.model.CommandHexagonal",
            "height": 0,
            "id": "c877e530-3352-6f59-3de8-78b0dd449960",
            "style": "{}",
            "width": 0,
            "x": 0,
            "y": 0
        },
        "isRestRepository": false,
        "name": "ApplyLoan",
        "displayName": "대출 신청",
        "nameCamelCase": "applyLoan",
        "namePascalCase": "ApplyLoan",
        "namePlural": "applyLoans",
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
                                "memberId": "MEM-001",
                                "name": "홍길동"
                            },
                            "loanPeriod": null,
                            "loanStatus": "N/A",
                            "loanDate": null,
                            "returnDueDate": null,
                            "bookId": {
                                "bookId": "BOOK-001",
                                "title": "Clean Code",
                                "isbn": "123-456-789"
                            }
                        }
                    }
                ],
                "when": [
                    {
                        "type": "Command",
                        "name": "ApplyLoan",
                        "value": {
                            "memberId": "MEM-001",
                            "loanPeriod": 14
                        }
                    }
                ],
                "then": [
                    {
                        "type": "Event",
                        "name": "LoanApplied",
                        "value": {
                            "memberId": "MEM-001",
                            "loanDate": "2024-03-20T00:00:00Z",
                            "returnDueDate": "2024-04-03T00:00:00Z",
                            "loanStatus": "BORROWED"
                        }
                    }
                ]
            }
        ]
    },
    {
        "_type": "org.uengine.modeling.model.Command",
        "outputEvents": [
            "LoanExtended"
        ],
        "aggregate": {
            "id": "59630231-1ccf-f632-a379-e948f3d281fb"
        },
        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
        "boundedContext": {
            "id": "7b15d63b-9505-8216-80d3-1b0a189a12ca"
        },
        "controllerInfo": {
            "method": "PUT"
        },
        "fieldDescriptors": [
            {
                "className": "Integer",
                "isCopy": false,
                "isKey": false,
                "name": "extensionPeriod",
                "nameCamelCase": "extensionPeriod",
                "namePascalCase": "ExtensionPeriod",
                "displayName": "",
                "_type": "org.uengine.model.FieldDescriptor"
            }
        ],
        "description": null,
        "id": "7aa3f0e9-241d-50ef-0170-75b4869319d5",
        "elementView": {
            "_type": "org.uengine.modeling.model.Command",
            "height": 116,
            "id": "7aa3f0e9-241d-50ef-0170-75b4869319d5",
            "style": "{}",
            "width": 100,
            "x": 1141,
            "y": 380,
            "z-index": 999
        },
        "hexagonalView": {
            "_type": "org.uengine.modeling.model.CommandHexagonal",
            "height": 0,
            "id": "7aa3f0e9-241d-50ef-0170-75b4869319d5",
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
                            "loanId": 101,
                            "member": {
                                "memberId": "MEM-002",
                                "name": "김철수"
                            },
                            "loanPeriod": 14,
                            "loanStatus": "BORROWED",
                            "loanDate": "2024-03-01T00:00:00Z",
                            "returnDueDate": "2024-03-15T00:00:00Z",
                            "bookId": {
                                "bookId": "BOOK-002",
                                "title": "Effective Java",
                                "isbn": "789-456-123"
                            }
                        }
                    }
                ],
                "when": [
                    {
                        "type": "Command",
                        "name": "ExtendLoan",
                        "value": {
                            "extensionPeriod": 7
                        }
                    }
                ],
                "then": [
                    {
                        "type": "Event",
                        "name": "LoanExtended",
                        "value": {
                            "extendedDate": "2024-03-15T00:00:00Z",
                            "newReturnDueDate": "2024-03-22T00:00:00Z"
                        }
                    }
                ]
            }
        ]
    },
    {
        "_type": "org.uengine.modeling.model.Command",
        "outputEvents": [
            "BookReturned"
        ],
        "aggregate": {
            "id": "59630231-1ccf-f632-a379-e948f3d281fb"
        },
        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
        "boundedContext": {
            "id": "7b15d63b-9505-8216-80d3-1b0a189a12ca"
        },
        "controllerInfo": {
            "method": "PUT"
        },
        "fieldDescriptors": [],
        "description": null,
        "id": "b0d52bf5-95d4-2ab7-b442-5716f7eccb20",
        "elementView": {
            "_type": "org.uengine.modeling.model.Command",
            "height": 116,
            "id": "b0d52bf5-95d4-2ab7-b442-5716f7eccb20",
            "style": "{}",
            "width": 100,
            "x": 1141,
            "y": 510,
            "z-index": 999
        },
        "hexagonalView": {
            "_type": "org.uengine.modeling.model.CommandHexagonal",
            "height": 0,
            "id": "b0d52bf5-95d4-2ab7-b442-5716f7eccb20",
            "style": "{}",
            "width": 0,
            "x": 0,
            "y": 0
        },
        "isRestRepository": false,
        "name": "ReturnBook",
        "displayName": "반납 처리",
        "nameCamelCase": "returnBook",
        "namePascalCase": "ReturnBook",
        "namePlural": "returnBooks",
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
                            "loanId": 102,
                            "member": {
                                "memberId": "MEM-003",
                                "name": "박영희"
                            },
                            "loanPeriod": 14,
                            "loanStatus": "BORROWED",
                            "loanDate": "2024-02-15T00:00:00Z",
                            "returnDueDate": "2024-02-29T00:00:00Z",
                            "bookId": {
                                "bookId": "BOOK-003",
                                "title": "Domain-Driven Design",
                                "isbn": "456-789-123"
                            }
                        }
                    }
                ],
                "when": [
                    {
                        "type": "Command",
                        "name": "ReturnBook",
                        "value": {}
                    }
                ],
                "then": [
                    {
                        "type": "Event",
                        "name": "BookReturned",
                        "value": {
                            "returnedDate": "2024-02-28T00:00:00Z",
                            "bookStatus": "AVAILABLE"
                        }
                    }
                ]
            }
        ]
    }
]

            for(const command of commandsToReplace)
               this.$set(this.value.elements, command.id, command)
            this.changedByMe = true
         
         alert("교체됨 !")
        }
    }
}
</script>

  