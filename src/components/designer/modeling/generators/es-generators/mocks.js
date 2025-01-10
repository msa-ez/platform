/**
 * @from EventStormingModelCanvas.value
 * @description 이벤트 스토밍 서비스 종류에 따라 테스트 가능한 이벤트 스토밍 값을 반환
 *
 * @example 도서관 시나리오와 관련된 이벤트 스토밍 value 값을 반환
 * // 가능한 이벤트 스토밍 서비스 종류: libraryService
 * console.log(getEsValue("libraryService"))
 * 
 * @example command, event, view 타입 엘리먼트를 제외하고, 반환
 * // 이러한 일부 미완성된 반환은 중간 과정을 처리하는 생성기 테스트시에 유용할 수 있음
 * console.log(getEsValue("libraryService", ['command', 'event', 'view']))
 * 
 * @example 템플릿 필터 키를 활용해서 BoundedContext 엘리먼트만 얻기
 * // 가능한 템플릿: remainOnlyBoundedContext, remainOnlyAggregate
 * console.log(getEsValue("libraryService", ['remainOnlyBoundedContext']))
 */
export const getEsValue = (targetService="libraryService", typesToExcludeFilter=[]) => {
    let excludeFilterTemplate = []
    excludeFilterTemplate.remainOnlyBoundedContext = ["aggregate", "command", "event", "view", "actor", "policy"]
    excludeFilterTemplate.remainOnlyAggregate = excludeFilterTemplate.remainOnlyBoundedContext.filter(type => type !== "aggregate")

    Object.keys(excludeFilterTemplate).forEach(key => {
        if (typesToExcludeFilter.includes(key)) {
            typesToExcludeFilter.push(...excludeFilterTemplate[key])
        }
    })

    const targetEsValue = JSON.parse(JSON.stringify(esValues[targetService].esValue))
    for(const element of Object.values(targetEsValue.elements)) {
        if(typesToExcludeFilter.some(type => element._type.toLowerCase().includes(type.toLowerCase())))
            delete targetEsValue.elements[element.id]
    }
    return targetEsValue
}

/**
 * @from EventStormingModelCanvas.selectedDraftOptions
 * @description 특정 이벤트 스토밍을 생성하기 위한 기본 초안 정보를 반환
 * 
 * @example 도서관 시나리오와 관련된 이벤트 스토밍 초안 정보를 반환
 * console.log(getEsDraft("libraryService"))
 */
export const getEsDraft = (targetService="libraryService") => {
    return esValues[targetService].draft
}

/**
 * @from EventStormingModelCanvas.userInfo
 * @from EventStormingModelCanvas.information
 */
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

/**
 * @from EventStormingModelCanvas.value
 * @from EventStormingModelCanvas.selectedDraftOptions
 */
const esValues = {
    libraryService: {
        draft: {
            "BookManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Book",
                            "alias": "도서"
                        },
                        "entities": [
                            {
                                "name": "LoanHistory",
                                "alias": "대출 이력"
                            },
                            {
                                "name": "StatusChangeHistory",
                                "alias": "상태 변경 이력"
                            }
                        ],
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
                                "name": "Category",
                                "alias": "도서 카테고리"
                            },
                            {
                                "name": "ISBN",
                                "alias": "ISBN 번호"
                            }
                        ]
                    }
                ],
                "analysis": {
                    "transactionalConsistency": "모든 도서 관련 데이터를 하나의 트랜잭션으로 관리하여 강한 일관성 보장",
                    "performanceScalability": "기본적인 CRUD 작업에는 효율적이지만, 대규모 데이터 처리를 위해 확장성에 제한이 있음",
                    "domainAlignment": "도서 중심 비즈니스 규칙과 강하게 결합된 설계",
                    "maintainability": "단순한 구조로 유지보수가 용이하지만 기능 확장 시 복잡성 증가 가능성 있음",
                    "futureFlexibility": "도서 관련 요구사항 추가에는 유연하지만 분리된 기능 확장은 어려움"
                },
                "pros": {
                    "cohesion": "도서 관련 모든 데이터와 로직이 높은 응집도 유지",
                    "coupling": "Loan Aggregate와의 최소한의 결합",
                    "consistency": "단일 Aggregate로 강한 일관성 보장",
                    "encapsulation": "도서 관련 비즈니스 로직이 잘 캡슐화됨",
                    "complexity": "구조가 단순하여 이해 및 유지보수 용이",
                    "independence": "다른 Aggregate로부터 독립적으로 동작 가능",
                    "performance": "단일 Aggregate로 빠른 데이터 처리 가능"
                },
                "cons": {
                    "cohesion": "기능이 증가하면 Aggregate가 비대해질 위험",
                    "coupling": "Loan Aggregate에 의존성이 존재",
                    "consistency": "단일 트랜잭션 내에서 모든 작업 처리 필요",
                    "encapsulation": "모든 데이터를 관리하므로 로직이 복잡해질 수 있음",
                    "complexity": "기능 증가 시 복잡성 증가",
                    "independence": "모든 데이터를 하나로 묶으므로 분리 어려움",
                    "performance": "대규모 데이터 처리 시 성능 저하 우려"
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                    "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
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
                    "definitionId": "270ac558fa4e056681521442133ad827"
                },
                "description": "{\"userStories\":[{\"title\":\"도서 등록\",\"description\":\"관리자로서 새로운 도서를 등록하여 도서관 시스템에 추가하고 싶다.\",\"acceptance\":[\"도서명, ISBN, 저자, 출판사, 카테고리를 입력해야 함\",\"ISBN은 13자리 숫자여야 하며, 중복되지 않아야 함\",\"카테고리는 소설/비소설/학술/잡지 중 하나를 선택해야 함\",\"등록된 도서의 상태는 기본적으로 '대출가능'으로 설정됨\"]},{\"title\":\"도서 상태 변경\",\"description\":\"관리자로서 도서 상태를 변경하여 도서의 현재 상태를 관리하고 싶다.\",\"acceptance\":[\"도서는 '대출가능', '대출중', '예약중', '폐기' 상태를 가질 수 있음\",\"대출/반납 상황에 따라 상태가 자동 변경됨\",\"폐기된 도서는 대출이 불가능해야 함\",\"상태 변경 이력을 통해 변경 내역을 확인할 수 있어야 함\"]},{\"title\":\"대출 이력 조회\",\"description\":\"관리자로서 도서의 대출 이력을 조회하여 사용 내역을 확인하고 싶다.\",\"acceptance\":[\"도서별 대출 이력을 조회할 수 있어야 함\",\"대출 이력에는 대출일, 반납일, 대출 상태가 포함되어야 함\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"isbn\",\"type\":\"string\",\"required\":true},{\"name\":\"author\",\"type\":\"string\",\"required\":true},{\"name\":\"publisher\",\"type\":\"string\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"LoanHistory\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDate\",\"type\":\"date\",\"required\":false},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"반납됨\"]}]},\"StatusChangeHistory\":{\"properties\":[{\"name\":\"changeId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"changeDate\",\"type\":\"date\",\"required\":true},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]},{\"name\":\"currentStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]},\"Category\":{\"properties\":[{\"name\":\"categoryId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"string\",\"required\":true}]}},\"businessRules\":[{\"name\":\"ISBNValidation\",\"description\":\"ISBN은 13자리 숫자로 입력되어야 한다.\"},{\"name\":\"UniqueISBNCheck\",\"description\":\"ISBN은 중복될 수 없다.\"},{\"name\":\"BookStatusChange\",\"description\":\"도서는 상태 변경 시 유효한 상태 전이만 허용된다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"BookRegistration\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"isbn\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"등록\",\"초기화\"]},{\"name\":\"BookStatusManagement\",\"type\":\"table\",\"filters\":[\"status\"],\"resultTable\":{\"columns\":[\"bookId\",\"title\",\"isbn\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"상태변경\",\"폐기\"]}}]}}}"
            },
            "LoanManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Loan",
                            "alias": "대출 관리"
                        },
                        "entities": [],
                        "valueObjects": [
                            {
                                "name": "Member",
                                "alias": "회원"
                            },
                            {
                                "name": "BookReference",
                                "alias": "도서 참조",
                                "referencedAggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            },
                            {
                                "name": "LoanStatus",
                                "alias": "대출 상태"
                            },
                            {
                                "name": "LoanPeriod",
                                "alias": "대출 기간"
                            }
                        ]
                    }
                ],
                "analysis": {
                    "transactionalConsistency": "대출과 도서 상태가 동일 트랜잭션 내에서 처리되므로 강한 일관성을 보장합니다.",
                    "performanceScalability": "단일 Aggregate 접근으로 인한 성능 저하가 우려됩니다.",
                    "domainAlignment": "대출 도메인에 대한 비즈니스 요구 사항을 충족합니다.",
                    "maintainability": "단순한 구조로 인해 유지보수가 용이합니다.",
                    "futureFlexibility": "기능 추가 시 단일 Aggregate 확장에 제약이 있을 수 있습니다."
                },
                "pros": {
                    "cohesion": "대출 관련 데이터가 하나로 모여 높은 응집도를 가집니다.",
                    "coupling": "다른 Aggregate와의 결합이 최소화됩니다.",
                    "consistency": "강한 일관성을 보장합니다.",
                    "encapsulation": "대출 로직이 잘 캡슐화됩니다.",
                    "complexity": "구조가 단순하여 복잡성이 낮습니다.",
                    "independence": "독립적으로 진화할 수 있습니다.",
                    "performance": "단일 트랜잭션으로 성능 최적화 가능."
                },
                "cons": {
                    "cohesion": "도서와 대출 상태가 성장하면서 응집도가 낮아질 가능성이 있습니다.",
                    "coupling": "Book과 Member Aggregate와의 간접적인 종속성이 있습니다.",
                    "consistency": "다양한 상태를 처리하기 위한 관리가 필요합니다.",
                    "encapsulation": "비즈니스 규칙의 복잡도가 증가할 수 있습니다.",
                    "complexity": "대규모 기능 추가 시 복잡성이 증가합니다.",
                    "independence": "도서 상태에 대한 참조로 인해 약간의 종속성이 발생합니다.",
                    "performance": "큰 데이터 트랜잭션 시 성능 병목이 발생할 수 있습니다."
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해. 대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.",
                    "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
                        "style": "{}",
                        "width": 560,
                        "x": 1235,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
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
                    "definitionId": "270ac558fa4e056681521442133ad827"
                },
                "description": "{\"userStories\":[{\"title\":\"도서 대출 및 반납\",\"description\":\"회원으로서 도서를 대출하고 반납함으로써 원하는 자료를 이용하고 상태를 관리하고 싶다.\",\"acceptance\":[\"회원번호와 이름으로 회원 확인 가능\",\"도서는 도서명 또는 ISBN으로 검색 가능\",\"대출 기간은 7일/14일/30일 중 선택\",\"대출 완료 시 도서 상태는 '대출중'으로 변경\",\"반납 완료 시 도서 상태는 '대출가능'으로 변경\",\"예약자가 있는 도서 반납 시 도서 상태는 '예약중'으로 변경\"]},{\"title\":\"대출 현황 조회\",\"description\":\"회원으로서 현재 대출 중인 도서와 상태를 조회하고 필요한 경우 연장하거나 반납을 처리하고 싶다.\",\"acceptance\":[\"현재 대출 중인 도서 목록 제공\",\"각 대출 건에 대해 대출일, 반납예정일, 상태(대출중/연체/반납완료) 표시\",\"대출 중인 도서는 연장 또는 반납 가능\",\"상태 변경 시 자동으로 데이터가 업데이트\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"string\",\"required\":true},{\"name\":\"phoneNumber\",\"type\":\"string\",\"required\":false}]},\"Book\":{\"properties\":[{\"name\":\"isbn\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"isbn\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDueDate\",\"type\":\"date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]}},\"businessRules\":[{\"name\":\"LoanStatusManagement\",\"description\":\"대출 및 반납 시 도서 상태를 자동으로 업데이트\"},{\"name\":\"BookReservation\",\"description\":\"이미 대출 중인 도서는 예약 가능, 반납 시 예약자 우선 처리\"}],\"interfaces\":{\"LoanManagement\":{\"sections\":[{\"name\":\"LoanForm\",\"type\":\"form\",\"fields\":[{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true},{\"name\":\"bookSearch\",\"type\":\"search\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true,\"values\":[\"7일\",\"14일\",\"30일\"]}],\"actions\":[\"대출완료\",\"취소\"]}]},\"LoanStatus\":{\"sections\":[{\"name\":\"LoanStatusTable\",\"type\":\"table\",\"filters\":[\"대출 상태\"],\"resultTable\":{\"columns\":[\"loanId\",\"isbn\",\"loanDate\",\"returnDueDate\",\"status\"],\"actions\":[\"연장\",\"반납\"]}}]}}}"
            }
        },
        esValue: {
            "elements": {
                "9c4a1895-b3b7-7694-7ce4-eb17d426725e": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "'도서 관리' 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 하며, 폐기된 도서는 더 이상 대출이 불가능해야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.",
                    "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
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
                    "definitionId": "270ac558fa4e056681521442133ad827"
                },
                "e9db0d1f-8d08-cd69-f92f-8746ab477c6d": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "'대출/반납' 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해. 대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해.",
                    "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
                        "style": "{}",
                        "width": 560,
                        "x": 1235,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
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
                    "definitionId": "270ac558fa4e056681521442133ad827"
                },
                "9667535e-510b-01c5-e8ad-ae22cbad64c0": {
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
                                "className": "String",
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
                                "className": "BookStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "status",
                                "nameCamelCase": "status",
                                "namePascalCase": "Status",
                                "displayName": "",
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor",
                                "classId": "09a0b971-5346-36f9-9d43-d0ec28969aab"
                            },
                            {
                                "className": "StatusChangeHistory",
                                "isCopy": false,
                                "isKey": false,
                                "name": "statusChangeHistory",
                                "nameCamelCase": "statusChangeHistory",
                                "namePascalCase": "StatusChangeHistory",
                                "displayName": "",
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor",
                                "isVO": false,
                                "classId": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "ebc11f25-d295-f4f8-c150-0c997740f743": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
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
                                            "className": "String",
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
                                            "className": "BookStatus",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "status",
                                            "nameCamelCase": "status",
                                            "namePascalCase": "Status",
                                            "displayName": "",
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "classId": "09a0b971-5346-36f9-9d43-d0ec28969aab"
                                        },
                                        {
                                            "className": "StatusChangeHistory",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "statusChangeHistory",
                                            "nameCamelCase": "statusChangeHistory",
                                            "namePascalCase": "StatusChangeHistory",
                                            "displayName": "",
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "isVO": false,
                                            "classId": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77"
                                        }
                                    ],
                                    "operations": [
                                        {
                                            "name": "CreateBook",
                                            "class": "Book",
                                            "returnType": "void",
                                            "parameters": [],
                                            "label": "+ CreateBook(): void",
                                            "isOverride": false,
                                            "isRootMethod": false
                                        },
                                        {
                                            "name": "ChangeBookStatus",
                                            "class": "Book",
                                            "returnType": "void",
                                            "parameters": [],
                                            "label": "+ ChangeBookStatus(): void",
                                            "isOverride": false,
                                            "isRootMethod": true
                                        }
                                    ],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
                                        "x": 200,
                                        "y": 200,
                                        "width": 250,
                                        "height": 320,
                                        "style": "{}",
                                        "titleH": 50,
                                        "subEdgeH": 265,
                                        "fieldH": 270,
                                        "methodH": 55
                                    },
                                    "selected": false,
                                    "relations": [
                                        "014eb244-81ee-0b0c-dcd2-b5c060e44a62",
                                        "02d13fdd-cde2-669a-a5d0-e4365cf55841"
                                    ],
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": false,
                                    "isAbstract": false,
                                    "isInterface": false,
                                    "isAggregateRoot": true,
                                    "parentId": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                                    "displayName": "도서"
                                },
                                "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                    "name": "StatusChangeHistory",
                                    "displayName": "상태 변경 이력",
                                    "namePascalCase": "StatusChangeHistory",
                                    "nameCamelCase": "statusChangeHistory",
                                    "namePlural": "statusChangeHistories",
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "changeId",
                                            "nameCamelCase": "changeId",
                                            "namePascalCase": "ChangeId",
                                            "className": "String",
                                            "isKey": true,
                                            "isName": false,
                                            "isList": false,
                                            "isVO": false,
                                            "isLob": false,
                                            "isCorrelationKey": false,
                                            "displayName": ""
                                        },
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "changeDate",
                                            "nameCamelCase": "changeDate",
                                            "namePascalCase": "ChangeDate",
                                            "className": "Date",
                                            "isKey": false,
                                            "isName": false,
                                            "isList": false,
                                            "isVO": false,
                                            "isLob": false,
                                            "isCorrelationKey": false,
                                            "displayName": ""
                                        },
                                        {
                                            "_type": "org.uengine.uml.model.FieldDescriptor",
                                            "name": "bookStatus",
                                            "displayName": "도서 상태",
                                            "className": "BookStatus",
                                            "isKey": false,
                                            "namePascalCase": "BookStatus",
                                            "nameCamelCase": "bookStatus",
                                            "label": "- 도서 상태: BookStatus",
                                            "classId": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                            "isList": false
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                        "x": 716,
                                        "y": 380,
                                        "width": 200,
                                        "height": 150,
                                        "style": "{}",
                                        "titleH": 50,
                                        "subEdgeH": 120,
                                        "fieldH": 90,
                                        "methodH": 30
                                    },
                                    "selected": false,
                                    "relations": [
                                        "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                        "02d13fdd-cde2-669a-a5d0-e4365cf55841"
                                    ],
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": false,
                                    "isAbstract": false,
                                    "isInterface": false,
                                    "isAggregateRoot": false
                                },
                                "09a0b971-5346-36f9-9d43-d0ec28969aab": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                    "name": "BookStatus",
                                    "displayName": "도서 상태",
                                    "nameCamelCase": "bookStatus",
                                    "namePascalCase": "BookStatus",
                                    "namePlural": "bookStatuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                        "x": 716,
                                        "y": 120,
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
                                            "value": "ON_LOAN"
                                        },
                                        {
                                            "value": "RESERVED"
                                        },
                                        {
                                            "value": "DISCARDED"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": [
                                        "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                        "014eb244-81ee-0b0c-dcd2-b5c060e44a62"
                                    ]
                                }
                            },
                            "relations": {
                                "38ce2ee1-de62-86be-b96d-d757b7247f00": {
                                    "name": "BookStatus",
                                    "id": "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                    "_type": "org.uengine.uml.model.Relation",
                                    "sourceElement": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                        "name": "StatusChangeHistory",
                                        "displayName": "상태 변경 이력",
                                        "namePascalCase": "StatusChangeHistory",
                                        "nameCamelCase": "statusChangeHistory",
                                        "namePlural": "statusChangeHistories",
                                        "fieldDescriptors": [
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "changeId",
                                                "nameCamelCase": "changeId",
                                                "namePascalCase": "ChangeId",
                                                "className": "String",
                                                "isKey": true,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            },
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "changeDate",
                                                "nameCamelCase": "changeDate",
                                                "namePascalCase": "ChangeDate",
                                                "className": "Date",
                                                "isKey": false,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                            "x": 700,
                                            "y": 760,
                                            "width": 200,
                                            "height": 150,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 120,
                                            "fieldH": 90,
                                            "methodH": 30
                                        },
                                        "selected": false,
                                        "relations": [
                                            "38ce2ee1-de62-86be-b96d-d757b7247f00"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": false
                                    },
                                    "targetElement": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                        "name": "BookStatus",
                                        "displayName": "도서 상태",
                                        "nameCamelCase": "bookStatus",
                                        "namePascalCase": "BookStatus",
                                        "namePlural": "bookStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
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
                                                "value": "AVAILABLE"
                                            },
                                            {
                                                "value": "ON_LOAN"
                                            },
                                            {
                                                "value": "RESERVED"
                                            },
                                            {
                                                "value": "DISCARDED"
                                            }
                                        ],
                                        "useKeyValue": false,
                                        "relations": [
                                            "38ce2ee1-de62-86be-b96d-d757b7247f00"
                                        ]
                                    },
                                    "from": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                    "to": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                    "selected": false,
                                    "relationView": {
                                        "id": "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                        "from": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                        "to": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                        "needReconnect": true,
                                        "value": "[[716,305],[716,170]]"
                                    },
                                    "sourceMultiplicity": "1",
                                    "targetMultiplicity": "1",
                                    "relationType": "Association",
                                    "fromLabel": "",
                                    "toLabel": "",
                                    "displayName": "도서 상태"
                                },
                                "014eb244-81ee-0b0c-dcd2-b5c060e44a62": {
                                    "name": "status",
                                    "id": "014eb244-81ee-0b0c-dcd2-b5c060e44a62",
                                    "_type": "org.uengine.uml.model.Relation",
                                    "sourceElement": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
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
                                                "className": "String",
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
                                                "className": "BookStatus",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "status",
                                                "nameCamelCase": "status",
                                                "namePascalCase": "Status",
                                                "displayName": "",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "classId": "09a0b971-5346-36f9-9d43-d0ec28969aab"
                                            },
                                            {
                                                "className": "StatusChangeHistory",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "statusChangeHistory",
                                                "nameCamelCase": "statusChangeHistory",
                                                "namePascalCase": "StatusChangeHistory",
                                                "displayName": "",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": false,
                                                "classId": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77"
                                            }
                                        ],
                                        "operations": [
                                            {
                                                "name": "CreateBook",
                                                "class": "Book",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ CreateBook(): void",
                                                "isOverride": false,
                                                "isRootMethod": false
                                            },
                                            {
                                                "name": "ChangeBookStatus",
                                                "class": "Book",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ ChangeBookStatus(): void",
                                                "isOverride": false,
                                                "isRootMethod": true
                                            }
                                        ],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
                                            "x": 200,
                                            "y": 200,
                                            "width": 250,
                                            "height": 320,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 265,
                                            "fieldH": 270,
                                            "methodH": 55
                                        },
                                        "selected": false,
                                        "relations": [
                                            "014eb244-81ee-0b0c-dcd2-b5c060e44a62",
                                            "02d13fdd-cde2-669a-a5d0-e4365cf55841"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": true,
                                        "parentId": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                                        "displayName": "도서"
                                    },
                                    "targetElement": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                        "name": "BookStatus",
                                        "displayName": "도서 상태",
                                        "nameCamelCase": "bookStatus",
                                        "namePascalCase": "BookStatus",
                                        "namePlural": "bookStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                            "x": 716,
                                            "y": 120,
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
                                                "value": "ON_LOAN"
                                            },
                                            {
                                                "value": "RESERVED"
                                            },
                                            {
                                                "value": "DISCARDED"
                                            }
                                        ],
                                        "useKeyValue": false,
                                        "relations": [
                                            "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                            "014eb244-81ee-0b0c-dcd2-b5c060e44a62"
                                        ]
                                    },
                                    "from": "ebc11f25-d295-f4f8-c150-0c997740f743",
                                    "to": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                    "selected": false,
                                    "relationView": {
                                        "id": "014eb244-81ee-0b0c-dcd2-b5c060e44a62",
                                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                        "value": "[[325,200],[452,200],[452,120],[616,120]]",
                                        "from": "ebc11f25-d295-f4f8-c150-0c997740f743",
                                        "to": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                        "needReconnect": true
                                    },
                                    "sourceMultiplicity": "1",
                                    "targetMultiplicity": "1",
                                    "relationType": "Realization",
                                    "fromLabel": "",
                                    "toLabel": "",
                                    "displayName": "도서 상태"
                                },
                                "02d13fdd-cde2-669a-a5d0-e4365cf55841": {
                                    "name": "statusChangeHistory",
                                    "id": "02d13fdd-cde2-669a-a5d0-e4365cf55841",
                                    "_type": "org.uengine.uml.model.Relation",
                                    "sourceElement": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
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
                                                "className": "String",
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
                                                "className": "BookStatus",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "status",
                                                "nameCamelCase": "status",
                                                "namePascalCase": "Status",
                                                "displayName": "",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "classId": "09a0b971-5346-36f9-9d43-d0ec28969aab"
                                            },
                                            {
                                                "className": "StatusChangeHistory",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "statusChangeHistory",
                                                "nameCamelCase": "statusChangeHistory",
                                                "namePascalCase": "StatusChangeHistory",
                                                "displayName": "",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": false,
                                                "classId": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77"
                                            }
                                        ],
                                        "operations": [
                                            {
                                                "name": "CreateBook",
                                                "class": "Book",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ CreateBook(): void",
                                                "isOverride": false,
                                                "isRootMethod": false
                                            },
                                            {
                                                "name": "ChangeBookStatus",
                                                "class": "Book",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ ChangeBookStatus(): void",
                                                "isOverride": false,
                                                "isRootMethod": true
                                            }
                                        ],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
                                            "x": 200,
                                            "y": 200,
                                            "width": 250,
                                            "height": 320,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 265,
                                            "fieldH": 270,
                                            "methodH": 55
                                        },
                                        "selected": false,
                                        "relations": [
                                            "014eb244-81ee-0b0c-dcd2-b5c060e44a62",
                                            "02d13fdd-cde2-669a-a5d0-e4365cf55841"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": true,
                                        "parentId": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                                        "displayName": "도서"
                                    },
                                    "targetElement": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                        "name": "StatusChangeHistory",
                                        "displayName": "상태 변경 이력",
                                        "namePascalCase": "StatusChangeHistory",
                                        "nameCamelCase": "statusChangeHistory",
                                        "namePlural": "statusChangeHistories",
                                        "fieldDescriptors": [
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "changeId",
                                                "nameCamelCase": "changeId",
                                                "namePascalCase": "ChangeId",
                                                "className": "String",
                                                "isKey": true,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            },
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "changeDate",
                                                "nameCamelCase": "changeDate",
                                                "namePascalCase": "ChangeDate",
                                                "className": "Date",
                                                "isKey": false,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            },
                                            {
                                                "_type": "org.uengine.uml.model.FieldDescriptor",
                                                "name": "bookStatus",
                                                "displayName": "도서 상태",
                                                "className": "BookStatus",
                                                "isKey": false,
                                                "namePascalCase": "BookStatus",
                                                "nameCamelCase": "bookStatus",
                                                "label": "- 도서 상태: BookStatus",
                                                "classId": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                                "isList": false
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                            "x": 716,
                                            "y": 380,
                                            "width": 200,
                                            "height": 150,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 120,
                                            "fieldH": 90,
                                            "methodH": 30
                                        },
                                        "selected": false,
                                        "relations": [
                                            "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                            "02d13fdd-cde2-669a-a5d0-e4365cf55841"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": false
                                    },
                                    "from": "ebc11f25-d295-f4f8-c150-0c997740f743",
                                    "to": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                    "selected": false,
                                    "relationView": {
                                        "id": "02d13fdd-cde2-669a-a5d0-e4365cf55841",
                                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                        "value": "[[325,238],[452,276],[452,380],[616,380]]",
                                        "from": "ebc11f25-d295-f4f8-c150-0c997740f743",
                                        "to": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                        "needReconnect": true
                                    },
                                    "sourceMultiplicity": "1",
                                    "targetMultiplicity": "1",
                                    "relationType": "Realization",
                                    "fromLabel": "",
                                    "toLabel": "",
                                    "displayName": "상태 변경 이력"
                                }
                            }
                        },
                        "operations": [
                            {
                                "name": "CreateBook",
                                "class": "Book",
                                "returnType": "void",
                                "parameters": [],
                                "label": "+ CreateBook(): void",
                                "isOverride": false,
                                "isRootMethod": false
                            },
                            {
                                "name": "ChangeBookStatus",
                                "class": "Book",
                                "returnType": "void",
                                "parameters": [],
                                "label": "+ ChangeBookStatus(): void",
                                "isOverride": false,
                                "isRootMethod": true
                            }
                        ]
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "name": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    },
                    "commands": [],
                    "description": null,
                    "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                        "x": 650,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
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
                "94feb7ab-fc4a-ee57-033d-a35f50fee524": {
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
                                "displayName": "회원",
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor",
                                "isVO": true,
                                "classId": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                "isList": false,
                                "label": "- 회원: Member"
                            },
                            {
                                "className": "LoanPeriod",
                                "isCopy": false,
                                "isKey": false,
                                "name": "loanPeriod",
                                "nameCamelCase": "loanPeriod",
                                "namePascalCase": "LoanPeriod",
                                "displayName": "대출 기간",
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor",
                                "isVO": true,
                                "classId": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                "isList": false,
                                "label": "- 대출 기간: LoanPeriod"
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
                                "className": "BookId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookId",
                                "nameCamelCase": "bookId",
                                "namePascalCase": "BookId",
                                "displayName": "bookId",
                                "isOverrideField": true,
                                "_type": "org.uengine.model.FieldDescriptor",
                                "isVO": true,
                                "classId": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                "isList": false,
                                "label": "- bookId: BookId"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "6e17f7b7-d402-4e8b-47fa-af3393101662": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
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
                                            "displayName": "회원",
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "isVO": true,
                                            "classId": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                            "isList": false,
                                            "label": "- 회원: Member"
                                        },
                                        {
                                            "className": "LoanPeriod",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "loanPeriod",
                                            "nameCamelCase": "loanPeriod",
                                            "namePascalCase": "LoanPeriod",
                                            "displayName": "대출 기간",
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "isVO": true,
                                            "classId": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                            "isList": false,
                                            "label": "- 대출 기간: LoanPeriod"
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
                                            "className": "BookId",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "bookId",
                                            "nameCamelCase": "bookId",
                                            "namePascalCase": "BookId",
                                            "displayName": "bookId",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "isVO": true,
                                            "classId": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                            "isList": false,
                                            "label": "- bookId: BookId"
                                        }
                                    ],
                                    "operations": [
                                        {
                                            "name": "CreateLoan",
                                            "class": "Loan",
                                            "returnType": "void",
                                            "parameters": [],
                                            "label": "+ CreateLoan(): void",
                                            "isOverride": false,
                                            "isRootMethod": false
                                        },
                                        {
                                            "name": "ReturnLoan",
                                            "class": "Loan",
                                            "returnType": "void",
                                            "parameters": [],
                                            "label": "+ ReturnLoan(): void",
                                            "isOverride": false,
                                            "isRootMethod": true
                                        }
                                    ],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                        "x": 200,
                                        "y": 200,
                                        "width": 200,
                                        "height": 260,
                                        "style": "{}",
                                        "titleH": 50,
                                        "subEdgeH": 205,
                                        "fieldH": 210,
                                        "methodH": 55
                                    },
                                    "selected": false,
                                    "relations": [
                                        "7bee93e2-a401-16fb-212d-0b3cb8ce67ce",
                                        "82d0b449-a64f-0f38-acf9-1729b0bcdebd",
                                        "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd"
                                    ],
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": false,
                                    "isAbstract": false,
                                    "isInterface": false,
                                    "isAggregateRoot": true,
                                    "parentId": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                                    "displayName": "대출 관리"
                                },
                                "d287207e-b9e8-b99a-8120-287a24a14f2d": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "d287207e-b9e8-b99a-8120-287a24a14f2d",
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
                                        },
                                        {
                                            "className": "String",
                                            "isKey": false,
                                            "label": "- phoneNumber: String",
                                            "name": "phoneNumber",
                                            "nameCamelCase": "phoneNumber",
                                            "namePascalCase": "PhoneNumber",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                        "x": 700,
                                        "y": 152,
                                        "width": 200,
                                        "height": 150,
                                        "style": "{}",
                                        "titleH": 50,
                                        "subEdgeH": 120,
                                        "fieldH": 100,
                                        "methodH": 30
                                    },
                                    "selected": false,
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": true,
                                    "relations": [
                                        "7bee93e2-a401-16fb-212d-0b3cb8ce67ce"
                                    ],
                                    "groupElement": null,
                                    "isAggregateRoot": false,
                                    "namePlural": "Members",
                                    "isAbstract": false,
                                    "isInterface": false
                                },
                                "10243908-79f4-e183-23b6-ebb7c5e8b7f5": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                    "name": "LoanPeriod",
                                    "displayName": "대출 기간",
                                    "namePascalCase": "LoanPeriod",
                                    "nameCamelCase": "loanPeriod",
                                    "fieldDescriptors": [
                                        {
                                            "className": "Date",
                                            "isKey": false,
                                            "label": "- loanDate: Date",
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
                                            "isKey": false,
                                            "label": "- returnDueDate: Date",
                                            "name": "returnDueDate",
                                            "nameCamelCase": "returnDueDate",
                                            "namePascalCase": "ReturnDueDate",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                        "x": 702,
                                        "y": 348,
                                        "width": 200,
                                        "height": 150,
                                        "style": "{}",
                                        "titleH": 50,
                                        "subEdgeH": 120,
                                        "fieldH": 100,
                                        "methodH": 30
                                    },
                                    "selected": false,
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": true,
                                    "relations": [
                                        "82d0b449-a64f-0f38-acf9-1729b0bcdebd"
                                    ],
                                    "groupElement": null,
                                    "isAggregateRoot": false,
                                    "namePlural": "LoanPeriods",
                                    "isAbstract": false,
                                    "isInterface": false
                                },
                                "b35ee933-e9e8-fffe-f196-d4826b1d8452": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
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
                                            "label": "- title: String",
                                            "name": "title",
                                            "nameCamelCase": "title",
                                            "namePascalCase": "Title",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                        "x": 704,
                                        "y": 556,
                                        "width": 200,
                                        "height": 150,
                                        "style": "{}",
                                        "titleH": 50,
                                        "subEdgeH": 120,
                                        "fieldH": 100,
                                        "methodH": 30
                                    },
                                    "selected": false,
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": true,
                                    "relations": [
                                        "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd"
                                    ],
                                    "groupElement": null,
                                    "isAggregateRoot": false,
                                    "namePlural": "BookIds",
                                    "isAbstract": false,
                                    "isInterface": false
                                }
                            },
                            "relations": {
                                "7bee93e2-a401-16fb-212d-0b3cb8ce67ce": {
                                    "name": "member",
                                    "id": "7bee93e2-a401-16fb-212d-0b3cb8ce67ce",
                                    "_type": "org.uengine.uml.model.Relation",
                                    "sourceElement": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
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
                                                "displayName": "회원",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                                "isList": false,
                                                "label": "- 회원: Member"
                                            },
                                            {
                                                "className": "LoanPeriod",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "loanPeriod",
                                                "nameCamelCase": "loanPeriod",
                                                "namePascalCase": "LoanPeriod",
                                                "displayName": "대출 기간",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                                "isList": false,
                                                "label": "- 대출 기간: LoanPeriod"
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
                                                "className": "BookId",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookId",
                                                "nameCamelCase": "bookId",
                                                "namePascalCase": "BookId",
                                                "displayName": "bookId",
                                                "isOverrideField": true,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                                "isList": false,
                                                "label": "- bookId: BookId"
                                            }
                                        ],
                                        "operations": [
                                            {
                                                "name": "CreateLoan",
                                                "class": "Loan",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ CreateLoan(): void",
                                                "isOverride": false,
                                                "isRootMethod": false
                                            },
                                            {
                                                "name": "ReturnLoan",
                                                "class": "Loan",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ ReturnLoan(): void",
                                                "isOverride": false,
                                                "isRootMethod": true
                                            }
                                        ],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                            "x": 200,
                                            "y": 200,
                                            "width": 200,
                                            "height": 260,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 205,
                                            "fieldH": 210,
                                            "methodH": 55
                                        },
                                        "selected": false,
                                        "relations": [
                                            "7bee93e2-a401-16fb-212d-0b3cb8ce67ce",
                                            "82d0b449-a64f-0f38-acf9-1729b0bcdebd",
                                            "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": true,
                                        "parentId": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                                        "displayName": "대출 관리"
                                    },
                                    "targetElement": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "d287207e-b9e8-b99a-8120-287a24a14f2d",
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
                                            },
                                            {
                                                "className": "String",
                                                "isKey": false,
                                                "label": "- phoneNumber: String",
                                                "name": "phoneNumber",
                                                "nameCamelCase": "phoneNumber",
                                                "namePascalCase": "PhoneNumber",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                            "x": 700,
                                            "y": 152,
                                            "width": 200,
                                            "height": 150,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 120,
                                            "fieldH": 100,
                                            "methodH": 30
                                        },
                                        "selected": false,
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": true,
                                        "relations": [
                                            "7bee93e2-a401-16fb-212d-0b3cb8ce67ce"
                                        ],
                                        "groupElement": null,
                                        "isAggregateRoot": false,
                                        "namePlural": "Members",
                                        "isAbstract": false,
                                        "isInterface": false
                                    },
                                    "from": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                    "to": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                    "selected": false,
                                    "relationView": {
                                        "id": "7bee93e2-a401-16fb-212d-0b3cb8ce67ce",
                                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                        "value": "[[300,200],[452,200],[452,152],[600,152]]",
                                        "from": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                        "to": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                        "needReconnect": true
                                    },
                                    "sourceMultiplicity": "1",
                                    "targetMultiplicity": "1",
                                    "relationType": "Association",
                                    "fromLabel": "",
                                    "toLabel": "",
                                    "displayName": "회원"
                                },
                                "82d0b449-a64f-0f38-acf9-1729b0bcdebd": {
                                    "name": "loanPeriod",
                                    "id": "82d0b449-a64f-0f38-acf9-1729b0bcdebd",
                                    "_type": "org.uengine.uml.model.Relation",
                                    "sourceElement": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
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
                                                "displayName": "회원",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                                "isList": false,
                                                "label": "- 회원: Member"
                                            },
                                            {
                                                "className": "LoanPeriod",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "loanPeriod",
                                                "nameCamelCase": "loanPeriod",
                                                "namePascalCase": "LoanPeriod",
                                                "displayName": "대출 기간",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                                "isList": false,
                                                "label": "- 대출 기간: LoanPeriod"
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
                                                "className": "BookId",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookId",
                                                "nameCamelCase": "bookId",
                                                "namePascalCase": "BookId",
                                                "displayName": "bookId",
                                                "isOverrideField": true,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                                "isList": false,
                                                "label": "- bookId: BookId"
                                            }
                                        ],
                                        "operations": [
                                            {
                                                "name": "CreateLoan",
                                                "class": "Loan",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ CreateLoan(): void",
                                                "isOverride": false,
                                                "isRootMethod": false
                                            },
                                            {
                                                "name": "ReturnLoan",
                                                "class": "Loan",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ ReturnLoan(): void",
                                                "isOverride": false,
                                                "isRootMethod": true
                                            }
                                        ],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                            "x": 200,
                                            "y": 200,
                                            "width": 200,
                                            "height": 260,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 205,
                                            "fieldH": 210,
                                            "methodH": 55
                                        },
                                        "selected": false,
                                        "relations": [
                                            "7bee93e2-a401-16fb-212d-0b3cb8ce67ce",
                                            "82d0b449-a64f-0f38-acf9-1729b0bcdebd",
                                            "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": true,
                                        "parentId": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                                        "displayName": "대출 관리"
                                    },
                                    "targetElement": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                        "name": "LoanPeriod",
                                        "displayName": "대출 기간",
                                        "namePascalCase": "LoanPeriod",
                                        "nameCamelCase": "loanPeriod",
                                        "fieldDescriptors": [
                                            {
                                                "className": "Date",
                                                "isKey": false,
                                                "label": "- loanDate: Date",
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
                                                "isKey": false,
                                                "label": "- returnDueDate: Date",
                                                "name": "returnDueDate",
                                                "nameCamelCase": "returnDueDate",
                                                "namePascalCase": "ReturnDueDate",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                            "x": 702,
                                            "y": 348,
                                            "width": 200,
                                            "height": 150,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 120,
                                            "fieldH": 100,
                                            "methodH": 30
                                        },
                                        "selected": false,
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": true,
                                        "relations": [
                                            "82d0b449-a64f-0f38-acf9-1729b0bcdebd"
                                        ],
                                        "groupElement": null,
                                        "isAggregateRoot": false,
                                        "namePlural": "LoanPeriods",
                                        "isAbstract": false,
                                        "isInterface": false
                                    },
                                    "from": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                    "to": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                    "selected": false,
                                    "relationView": {
                                        "id": "82d0b449-a64f-0f38-acf9-1729b0bcdebd",
                                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                        "value": "[[300,200],[576,200],[576,348],[602,348]]",
                                        "from": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                        "to": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                        "needReconnect": true
                                    },
                                    "sourceMultiplicity": "1",
                                    "targetMultiplicity": "1",
                                    "relationType": "Association",
                                    "fromLabel": "",
                                    "toLabel": "",
                                    "displayName": "대출 기간"
                                },
                                "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd": {
                                    "name": "bookId",
                                    "id": "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd",
                                    "_type": "org.uengine.uml.model.Relation",
                                    "sourceElement": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
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
                                                "displayName": "회원",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "d287207e-b9e8-b99a-8120-287a24a14f2d",
                                                "isList": false,
                                                "label": "- 회원: Member"
                                            },
                                            {
                                                "className": "LoanPeriod",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "loanPeriod",
                                                "nameCamelCase": "loanPeriod",
                                                "namePascalCase": "LoanPeriod",
                                                "displayName": "대출 기간",
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                                "isList": false,
                                                "label": "- 대출 기간: LoanPeriod"
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
                                                "className": "BookId",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookId",
                                                "nameCamelCase": "bookId",
                                                "namePascalCase": "BookId",
                                                "displayName": "bookId",
                                                "isOverrideField": true,
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "isVO": true,
                                                "classId": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                                "isList": false,
                                                "label": "- bookId: BookId"
                                            }
                                        ],
                                        "operations": [
                                            {
                                                "name": "CreateLoan",
                                                "class": "Loan",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ CreateLoan(): void",
                                                "isOverride": false,
                                                "isRootMethod": false
                                            },
                                            {
                                                "name": "ReturnLoan",
                                                "class": "Loan",
                                                "returnType": "void",
                                                "parameters": [],
                                                "label": "+ ReturnLoan(): void",
                                                "isOverride": false,
                                                "isRootMethod": true
                                            }
                                        ],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                            "x": 200,
                                            "y": 200,
                                            "width": 200,
                                            "height": 260,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 205,
                                            "fieldH": 210,
                                            "methodH": 55
                                        },
                                        "selected": false,
                                        "relations": [
                                            "7bee93e2-a401-16fb-212d-0b3cb8ce67ce",
                                            "82d0b449-a64f-0f38-acf9-1729b0bcdebd",
                                            "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": true,
                                        "parentId": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                                        "displayName": "대출 관리"
                                    },
                                    "targetElement": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
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
                                                "label": "- title: String",
                                                "name": "title",
                                                "nameCamelCase": "title",
                                                "namePascalCase": "Title",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                            "x": 704,
                                            "y": 556,
                                            "width": 200,
                                            "height": 150,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 120,
                                            "fieldH": 100,
                                            "methodH": 30
                                        },
                                        "selected": false,
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": true,
                                        "relations": [
                                            "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd"
                                        ],
                                        "groupElement": null,
                                        "isAggregateRoot": false,
                                        "namePlural": "BookIds",
                                        "isAbstract": false,
                                        "isInterface": false
                                    },
                                    "from": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                    "to": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                    "selected": false,
                                    "relationView": {
                                        "id": "06f8d7bc-e5aa-e045-48e1-7da0d4793fdd",
                                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                        "value": "[[300,200],[704,200],[704,481]]",
                                        "from": "6e17f7b7-d402-4e8b-47fa-af3393101662",
                                        "to": "b35ee933-e9e8-fffe-f196-d4826b1d8452",
                                        "needReconnect": true
                                    },
                                    "sourceMultiplicity": "1",
                                    "targetMultiplicity": "1",
                                    "relationType": "Association",
                                    "fromLabel": "",
                                    "toLabel": "",
                                    "displayName": ""
                                }
                            }
                        },
                        "operations": [
                            {
                                "name": "CreateLoan",
                                "class": "Loan",
                                "returnType": "void",
                                "parameters": [],
                                "label": "+ CreateLoan(): void",
                                "isOverride": false,
                                "isRootMethod": false
                            },
                            {
                                "name": "ReturnLoan",
                                "class": "Loan",
                                "returnType": "void",
                                "parameters": [],
                                "label": "+ ReturnLoan(): void",
                                "isOverride": false,
                                "isRootMethod": true
                            }
                        ]
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "name": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    },
                    "commands": [],
                    "description": null,
                    "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                        "x": 1235,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "Loan",
                    "displayName": "대출 관리",
                    "nameCamelCase": "loan",
                    "namePascalCase": "Loan",
                    "namePlural": "loans",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "a3bae10f-287b-a60a-c0a0-ba86cc43967c": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
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
                            "className": "BookCategory",
                            "isCopy": false,
                            "isKey": false,
                            "name": "category",
                            "nameCamelCase": "category",
                            "namePascalCase": "Category",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "BookStatus",
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
                        "id": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
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
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                    },
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    }
                },
                "c5ffd8f7-7c5b-c8b0-9448-fe7636569760": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                        "style": "{}",
                        "width": 100,
                        "x": 744,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "BookStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "previousStatus",
                            "nameCamelCase": "previousStatus",
                            "namePascalCase": "PreviousStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "BookStatus",
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
                            "name": "changeReason",
                            "nameCamelCase": "changeReason",
                            "namePascalCase": "ChangeReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
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
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                    },
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    }
                },
                "00c68a6d-b3ae-b8b4-1780-62b02d5119fd": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookCreated"
                    ],
                    "aggregate": {
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
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
                            "className": "BookCategory",
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
                    "id": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
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
                                        "category": null,
                                        "status": "N/A",
                                        "statusChangeHistory": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "CreateBook",
                                    "value": {
                                        "title": "자바의 정석",
                                        "isbn": "9781234567890",
                                        "author": "남궁성",
                                        "publisher": "도우출판",
                                        "category": "학술"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookCreated",
                                    "value": {
                                        "title": "자바의 정석",
                                        "isbn": "9781234567890",
                                        "author": "남궁성",
                                        "publisher": "도우출판",
                                        "category": "학술",
                                        "status": "AVAILABLE"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "d628de35-9de0-e39b-d55f-afc6872ffef2": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookStatusChanged"
                    ],
                    "aggregate": {
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    },
                    "controllerInfo": {
                        "method": "PUT"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "BookStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "currentStatus",
                            "nameCamelCase": "currentStatus",
                            "namePascalCase": "CurrentStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "changeReason",
                            "nameCamelCase": "changeReason",
                            "namePascalCase": "ChangeReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
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
                                        "title": "자바의 정석",
                                        "isbn": "9781234567890",
                                        "author": "남궁성",
                                        "publisher": "도우출판",
                                        "category": "학술",
                                        "status": "AVAILABLE",
                                        "statusChangeHistory": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ChangeBookStatus",
                                    "value": {
                                        "currentStatus": "ON_LOAN",
                                        "changeReason": "사용자가 도서를 대출함"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookStatusChanged",
                                    "value": {
                                        "previousStatus": "AVAILABLE",
                                        "currentStatus": "ON_LOAN",
                                        "changeDate": "2023-10-21T00:00:00Z",
                                        "changeReason": "사용자가 도서를 대출함"
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
                                        "title": "알고리즘 트레이닝",
                                        "isbn": "9789876543210",
                                        "author": "김철수",
                                        "publisher": "서울출판사",
                                        "category": "학술",
                                        "status": "DISCARDED",
                                        "statusChangeHistory": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ChangeBookStatus",
                                    "value": {
                                        "currentStatus": "AVAILABLE",
                                        "changeReason": "잘못된 상태 변경 요청"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookStatusChanged",
                                    "value": {
                                        "previousStatus": "DISCARDED",
                                        "currentStatus": "N/A",
                                        "changeDate": "N/A",
                                        "changeReason": "N/A"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "0c58fb6d-dc63-1a37-4bb3-97d14feced27": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "0c58fb6d-dc63-1a37-4bb3-97d14feced27",
                    "visibility": "public",
                    "name": "LoanHistory",
                    "oldName": "",
                    "displayName": "대출 이력",
                    "namePascalCase": "LoanHistory",
                    "namePlural": "loanHistories",
                    "aggregate": {
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
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
                        "multipleResult": true
                    },
                    "controllerInfo": {
                        "url": ""
                    },
                    "elementView": {
                        "_type": "org.uengine.modeling.model.View",
                        "id": "0c58fb6d-dc63-1a37-4bb3-97d14feced27",
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
                "67eb4745-6328-f3ab-71df-fea40c385419": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "67eb4745-6328-f3ab-71df-fea40c385419",
                    "visibility": "public",
                    "name": "BookDetails",
                    "oldName": "",
                    "displayName": "도서 상세",
                    "namePascalCase": "BookDetails",
                    "namePlural": "bookDetails",
                    "aggregate": {
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
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
                            "className": "BookCategory",
                            "isCopy": false,
                            "isKey": false,
                            "name": "category",
                            "nameCamelCase": "category",
                            "namePascalCase": "Category",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "BookStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "status",
                            "nameCamelCase": "status",
                            "namePascalCase": "Status",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "List<StatusChangeHistory>",
                            "isCopy": false,
                            "isKey": false,
                            "name": "statusChangeHistory",
                            "nameCamelCase": "statusChangeHistory",
                            "namePascalCase": "StatusChangeHistory",
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
                        "id": "67eb4745-6328-f3ab-71df-fea40c385419",
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
                "9f26add9-054b-df4b-c088-ff5286529d96": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    },
                    "description": null,
                    "id": "9f26add9-054b-df4b-c088-ff5286529d96",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "9f26add9-054b-df4b-c088-ff5286529d96",
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
                "d223009f-0a56-4ac6-8e10-d5d97da7d136": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    },
                    "description": null,
                    "id": "d223009f-0a56-4ac6-8e10-d5d97da7d136",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "d223009f-0a56-4ac6-8e10-d5d97da7d136",
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
                "90d37bf1-89c5-bf43-b9ce-6ef0c3cb277f": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    },
                    "description": null,
                    "id": "90d37bf1-89c5-bf43-b9ce-6ef0c3cb277f",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "90d37bf1-89c5-bf43-b9ce-6ef0c3cb277f",
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
                "2a43ad82-d379-5ba5-1df8-cb52c909b180": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    },
                    "description": null,
                    "id": "2a43ad82-d379-5ba5-1df8-cb52c909b180",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "2a43ad82-d379-5ba5-1df8-cb52c909b180",
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
                "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
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
                            "name": "status",
                            "nameCamelCase": "status",
                            "namePascalCase": "Status",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanCreated",
                    "displayName": "대출 생성됨",
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
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                    },
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    }
                },
                "61f88ad5-b877-64b4-8357-91c77d358c75": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
                        "style": "{}",
                        "width": 100,
                        "x": 1329,
                        "y": 380,
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
                            "name": "status",
                            "nameCamelCase": "status",
                            "namePascalCase": "Status",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "BookStatus",
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
                        "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
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
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                    },
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    }
                },
                "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanCreated"
                    ],
                    "aggregate": {
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
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
                            "className": "LoanPeriod",
                            "isCopy": false,
                            "isKey": false,
                            "name": "loanPeriod",
                            "nameCamelCase": "loanPeriod",
                            "namePascalCase": "LoanPeriod",
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
                        }
                    ],
                    "description": null,
                    "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "CreateLoan",
                    "displayName": "대출 생성",
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
                                        "loanId": "N/A",
                                        "member": {
                                            "memberId": "MEM001",
                                            "name": "홍길동",
                                            "phoneNumber": "010-1234-5678"
                                        },
                                        "loanPeriod": {
                                            "loanDate": "2024-01-01",
                                            "returnDueDate": "2024-01-08"
                                        },
                                        "loanStatus": "N/A",
                                        "bookId": {
                                            "bookId": "BOOK001",
                                            "title": "DDD 완벽 가이드"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "CreateLoan",
                                    "value": {
                                        "memberId": "MEM001",
                                        "isbn": "BOOK001",
                                        "loanPeriod": {
                                            "loanDate": "2024-01-01",
                                            "returnDueDate": "2024-01-08"
                                        },
                                        "loanDate": "2024-01-01"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanCreated",
                                    "value": {
                                        "memberId": "MEM001",
                                        "isbn": "BOOK001",
                                        "loanDate": "2024-01-01",
                                        "returnDueDate": "2024-01-08",
                                        "status": "대출중"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanReturned"
                    ],
                    "aggregate": {
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    },
                    "controllerInfo": {
                        "method": "PUT"
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
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "returnReason",
                            "nameCamelCase": "returnReason",
                            "namePascalCase": "ReturnReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ReturnLoan",
                    "displayName": "반납 처리",
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
                                        "loanId": "LOAN001",
                                        "member": {
                                            "memberId": "MEM001",
                                            "name": "홍길동",
                                            "phoneNumber": "010-1234-5678"
                                        },
                                        "loanPeriod": {
                                            "loanDate": "2024-01-01",
                                            "returnDueDate": "2024-01-08"
                                        },
                                        "loanStatus": "대출중",
                                        "bookId": {
                                            "bookId": "BOOK001",
                                            "title": "DDD 완벽 가이드"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ReturnLoan",
                                    "value": {
                                        "returnDate": "2024-01-07",
                                        "returnReason": "정상 반납"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanReturned",
                                    "value": {
                                        "returnDate": "2024-01-07",
                                        "status": "반납완료",
                                        "nextStatus": "대출가능"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "31ee22d5-a2ac-12bd-a14f-db72bab1f1fb": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "31ee22d5-a2ac-12bd-a14f-db72bab1f1fb",
                    "visibility": "public",
                    "name": "ActiveLoans",
                    "oldName": "",
                    "displayName": "대출 중 도서 목록",
                    "namePascalCase": "ActiveLoans",
                    "namePlural": "activeLoans",
                    "aggregate": {
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
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
                            "name": "isbn",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
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
                        "multipleResult": true
                    },
                    "controllerInfo": {
                        "url": ""
                    },
                    "elementView": {
                        "_type": "org.uengine.modeling.model.View",
                        "id": "31ee22d5-a2ac-12bd-a14f-db72bab1f1fb",
                        "x": 1141,
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
                "b49aa683-05ee-8ef4-7bb6-85a2bc206737": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "b49aa683-05ee-8ef4-7bb6-85a2bc206737",
                    "visibility": "public",
                    "name": "LoanDetails",
                    "oldName": "",
                    "displayName": "대출 세부 정보",
                    "namePascalCase": "LoanDetails",
                    "namePlural": "loanDetails",
                    "aggregate": {
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
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
                            "name": "member",
                            "nameCamelCase": "member",
                            "namePascalCase": "Member",
                            "displayName": "",
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
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "LoanPeriod",
                            "isCopy": false,
                            "isKey": false,
                            "name": "loanPeriod",
                            "nameCamelCase": "loanPeriod",
                            "namePascalCase": "LoanPeriod",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "LoanStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "status",
                            "nameCamelCase": "status",
                            "namePascalCase": "Status",
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
                        "id": "b49aa683-05ee-8ef4-7bb6-85a2bc206737",
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
                "f992cd8e-b0bb-e279-331f-c826823e73d2": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    },
                    "description": null,
                    "id": "f992cd8e-b0bb-e279-331f-c826823e73d2",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "f992cd8e-b0bb-e279-331f-c826823e73d2",
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
                    "name": "Admin",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "4a6358fb-0d59-eec5-9a8b-ea0d690946d3": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    },
                    "description": null,
                    "id": "4a6358fb-0d59-eec5-9a8b-ea0d690946d3",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "4a6358fb-0d59-eec5-9a8b-ea0d690946d3",
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
                    "name": "Admin",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "78f94f77-0582-83df-0396-1d1006b36587": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    },
                    "description": null,
                    "id": "78f94f77-0582-83df-0396-1d1006b36587",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "78f94f77-0582-83df-0396-1d1006b36587",
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
                    "name": "Admin",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "b9ef9447-85a6-1908-899d-6ecb2fcc9196": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    },
                    "description": null,
                    "id": "b9ef9447-85a6-1908-899d-6ecb2fcc9196",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "b9ef9447-85a6-1908-899d-6ecb2fcc9196",
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
                    "name": "Admin",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "3115caac-b47b-bfb1-9f00-723ffea2b23d": {
                    "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                    },
                    "description": "도서 상태 변경 시 상태 변경 내역을 기록해야 함.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 954,
                        "y": 250,
                        "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "BookStatusChangeLoggingPolicy",
                    "displayName": "도서 상태 변경 기록 정책",
                    "nameCamelCase": "bookStatusChangeLoggingPolicy",
                    "namePascalCase": "BookStatusChangeLoggingPolicy",
                    "namePlural": "bookStatusChangeLoggingPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "1afaf140-9d40-428e-aba0-fab773b5adc0": {
                    "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                    },
                    "description": "대출 반납 시 도서 상태를 적절히 업데이트하기 위해",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 409,
                        "y": 356,
                        "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "BookReturnPolicy",
                    "displayName": "도서 반납 상태 업데이트",
                    "nameCamelCase": "bookReturnPolicy",
                    "namePascalCase": "BookReturnPolicy",
                    "namePlural": "bookReturnPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                }
            },
            "relations": {
                "4bb72728-b8df-c523-2b92-9df9c9eaa770": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "4bb72728-b8df-c523-2b92-9df9c9eaa770",
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
                                    "className": "LoanPeriod",
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
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "6e17f7b7-d402-4e8b-47fa-af3393101662": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
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
                                                "className": "LoanPeriod",
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
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "6e17f7b7-d402-4e8b-47fa-af3393101662",
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
                                        "parentId": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                                    },
                                    "d287207e-b9e8-b99a-8120-287a24a14f2d": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "d287207e-b9e8-b99a-8120-287a24a14f2d",
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
                                            },
                                            {
                                                "className": "String",
                                                "isKey": false,
                                                "label": "- phoneNumber: String",
                                                "name": "phoneNumber",
                                                "nameCamelCase": "phoneNumber",
                                                "namePascalCase": "PhoneNumber",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "d287207e-b9e8-b99a-8120-287a24a14f2d",
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
                                    "10243908-79f4-e183-23b6-ebb7c5e8b7f5": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
                                        "name": "LoanPeriod",
                                        "displayName": "대출 기간",
                                        "namePascalCase": "LoanPeriod",
                                        "nameCamelCase": "loanPeriod",
                                        "fieldDescriptors": [
                                            {
                                                "className": "Date",
                                                "isKey": false,
                                                "label": "- loanDate: Date",
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
                                                "isKey": false,
                                                "label": "- returnDueDate: Date",
                                                "name": "returnDueDate",
                                                "nameCamelCase": "returnDueDate",
                                                "namePascalCase": "ReturnDueDate",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "10243908-79f4-e183-23b6-ebb7c5e8b7f5",
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
                                        "relations": [],
                                        "groupElement": null,
                                        "isAggregateRoot": false,
                                        "namePlural": "LoanPeriods",
                                        "isAbstract": false,
                                        "isInterface": false
                                    }
                                },
                                "relations": {}
                            },
                            "operations": []
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "name": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d",
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                        },
                        "commands": [],
                        "description": null,
                        "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                            "x": 1235,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "Loan",
                        "displayName": "대출 관리",
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
                                    "className": "String",
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
                                    "className": "BookStatus",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "status",
                                    "nameCamelCase": "status",
                                    "namePascalCase": "Status",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "StatusChangeHistory",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "statusChangeHistory",
                                    "nameCamelCase": "statusChangeHistory",
                                    "namePascalCase": "StatusChangeHistory",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "ebc11f25-d295-f4f8-c150-0c997740f743": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
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
                                                "className": "String",
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
                                                "className": "BookStatus",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "status",
                                                "displayName": "",
                                                "nameCamelCase": "status",
                                                "namePascalCase": "Status",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "StatusChangeHistory",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "statusChangeHistory",
                                                "displayName": "",
                                                "nameCamelCase": "statusChangeHistory",
                                                "namePascalCase": "StatusChangeHistory",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "ebc11f25-d295-f4f8-c150-0c997740f743",
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
                                        "parentId": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                                    },
                                    "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                        "name": "StatusChangeHistory",
                                        "displayName": "상태 변경 이력",
                                        "namePascalCase": "StatusChangeHistory",
                                        "nameCamelCase": "statusChangeHistory",
                                        "namePlural": "statusChangeHistories",
                                        "fieldDescriptors": [
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "changeId",
                                                "nameCamelCase": "changeId",
                                                "namePascalCase": "ChangeId",
                                                "className": "String",
                                                "isKey": true,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            },
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "changeDate",
                                                "nameCamelCase": "changeDate",
                                                "namePascalCase": "ChangeDate",
                                                "className": "Date",
                                                "isKey": false,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                            "x": 700,
                                            "y": 760,
                                            "width": 200,
                                            "height": 150,
                                            "style": "{}",
                                            "titleH": 50,
                                            "subEdgeH": 120,
                                            "fieldH": 90,
                                            "methodH": 30
                                        },
                                        "selected": false,
                                        "relations": [
                                            "38ce2ee1-de62-86be-b96d-d757b7247f00"
                                        ],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": false
                                    },
                                    "09a0b971-5346-36f9-9d43-d0ec28969aab": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                        "name": "BookStatus",
                                        "displayName": "도서 상태",
                                        "nameCamelCase": "bookStatus",
                                        "namePascalCase": "BookStatus",
                                        "namePlural": "bookStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
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
                                                "value": "AVAILABLE"
                                            },
                                            {
                                                "value": "ON_LOAN"
                                            },
                                            {
                                                "value": "RESERVED"
                                            },
                                            {
                                                "value": "DISCARDED"
                                            }
                                        ],
                                        "useKeyValue": false,
                                        "relations": [
                                            "38ce2ee1-de62-86be-b96d-d757b7247f00"
                                        ]
                                    }
                                },
                                "relations": {
                                    "38ce2ee1-de62-86be-b96d-d757b7247f00": {
                                        "name": "BookStatus",
                                        "id": "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                        "_type": "org.uengine.uml.model.Relation",
                                        "sourceElement": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                            "name": "StatusChangeHistory",
                                            "displayName": "상태 변경 이력",
                                            "namePascalCase": "StatusChangeHistory",
                                            "nameCamelCase": "statusChangeHistory",
                                            "namePlural": "statusChangeHistories",
                                            "fieldDescriptors": [
                                                {
                                                    "_type": "org.uengine.model.FieldDescriptor",
                                                    "name": "changeId",
                                                    "nameCamelCase": "changeId",
                                                    "namePascalCase": "ChangeId",
                                                    "className": "String",
                                                    "isKey": true,
                                                    "isName": false,
                                                    "isList": false,
                                                    "isVO": false,
                                                    "isLob": false,
                                                    "isCorrelationKey": false,
                                                    "displayName": ""
                                                },
                                                {
                                                    "_type": "org.uengine.model.FieldDescriptor",
                                                    "name": "changeDate",
                                                    "nameCamelCase": "changeDate",
                                                    "namePascalCase": "ChangeDate",
                                                    "className": "Date",
                                                    "isKey": false,
                                                    "isName": false,
                                                    "isList": false,
                                                    "isVO": false,
                                                    "isLob": false,
                                                    "isCorrelationKey": false,
                                                    "displayName": ""
                                                }
                                            ],
                                            "operations": [],
                                            "elementView": {
                                                "_type": "org.uengine.uml.model.Class",
                                                "id": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                                "x": 700,
                                                "y": 760,
                                                "width": 200,
                                                "height": 150,
                                                "style": "{}",
                                                "titleH": 50,
                                                "subEdgeH": 120,
                                                "fieldH": 90,
                                                "methodH": 30
                                            },
                                            "selected": false,
                                            "relations": [
                                                "38ce2ee1-de62-86be-b96d-d757b7247f00"
                                            ],
                                            "parentOperations": [],
                                            "relationType": null,
                                            "isVO": false,
                                            "isAbstract": false,
                                            "isInterface": false,
                                            "isAggregateRoot": false
                                        },
                                        "targetElement": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                            "name": "BookStatus",
                                            "displayName": "도서 상태",
                                            "nameCamelCase": "bookStatus",
                                            "namePascalCase": "BookStatus",
                                            "namePlural": "bookStatuses",
                                            "elementView": {
                                                "_type": "org.uengine.uml.model.enum",
                                                "id": "09a0b971-5346-36f9-9d43-d0ec28969aab",
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
                                                    "value": "AVAILABLE"
                                                },
                                                {
                                                    "value": "ON_LOAN"
                                                },
                                                {
                                                    "value": "RESERVED"
                                                },
                                                {
                                                    "value": "DISCARDED"
                                                }
                                            ],
                                            "useKeyValue": false,
                                            "relations": [
                                                "38ce2ee1-de62-86be-b96d-d757b7247f00"
                                            ]
                                        },
                                        "from": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                        "to": "09a0b971-5346-36f9-9d43-d0ec28969aab",
                                        "selected": false,
                                        "relationView": {
                                            "id": "38ce2ee1-de62-86be-b96d-d757b7247f00",
                                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                            "from": "3e7f8d9e-80f0-2df7-950d-1118fd8bbf77",
                                            "to": "09a0b971-5346-36f9-9d43-d0ec28969aab",
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
                            "name": "9c4a1895-b3b7-7694-7ce4-eb17d426725e",
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        },
                        "commands": [],
                        "description": null,
                        "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                            "x": 650,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
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
                    "from": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                    "to": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                    "relationView": {
                        "id": "4bb72728-b8df-c523-2b92-9df9c9eaa770",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                        "to": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                        "needReconnect": true,
                        "value": "[[1170,456],[715,456]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "94feb7ab-fc4a-ee57-033d-a35f50fee524",
                        "id": "4bb72728-b8df-c523-2b92-9df9c9eaa770",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "9667535e-510b-01c5-e8ad-ae22cbad64c0",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "889fa05c-adec-1dba-4212-c64310bc2795": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "889fa05c-adec-1dba-4212-c64310bc2795",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookCreated"
                        ],
                        "aggregate": {
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
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
                                "className": "BookCategory",
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
                        "id": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 115,
                            "id": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
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
                        "id": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
                        "elementView": {
                            "angle": 0,
                            "height": 115,
                            "id": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
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
                                "className": "BookCategory",
                                "isCopy": false,
                                "isKey": false,
                                "name": "category",
                                "nameCamelCase": "category",
                                "namePascalCase": "Category",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "BookStatus",
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
                            "id": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
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
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                        },
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        }
                    },
                    "from": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
                    "to": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
                    "relationView": {
                        "id": "889fa05c-adec-1dba-4212-c64310bc2795",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
                        "to": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
                        "needReconnect": true,
                        "value": "[[606,252],[694,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "00c68a6d-b3ae-b8b4-1780-62b02d5119fd",
                        "id": "889fa05c-adec-1dba-4212-c64310bc2795",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "a3bae10f-287b-a60a-c0a0-ba86cc43967c",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "305a49bf-9269-40f5-5d2b-5e1d58c59682": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "305a49bf-9269-40f5-5d2b-5e1d58c59682",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusChanged"
                        ],
                        "aggregate": {
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        },
                        "controllerInfo": {
                            "method": "PUT"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "BookStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "currentStatus",
                                "nameCamelCase": "currentStatus",
                                "namePascalCase": "CurrentStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "changeReason",
                                "nameCamelCase": "changeReason",
                                "namePascalCase": "ChangeReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 115,
                            "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
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
                        "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                        "elementView": {
                            "angle": 0,
                            "height": 115,
                            "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                            "style": "{}",
                            "width": 100,
                            "x": 744,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "BookStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "previousStatus",
                                "nameCamelCase": "previousStatus",
                                "namePascalCase": "PreviousStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "BookStatus",
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
                                "name": "changeReason",
                                "nameCamelCase": "changeReason",
                                "namePascalCase": "ChangeReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
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
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                        },
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        }
                    },
                    "from": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                    "to": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                    "relationView": {
                        "id": "305a49bf-9269-40f5-5d2b-5e1d58c59682",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                        "to": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                        "needReconnect": true,
                        "value": "[[606,380],[694,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                        "id": "305a49bf-9269-40f5-5d2b-5e1d58c59682",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "6d707ad9-e590-8add-8231-bd167ee5c10c": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "6d707ad9-e590-8add-8231-bd167ee5c10c",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanCreated"
                        ],
                        "aggregate": {
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
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
                                "className": "LoanPeriod",
                                "isCopy": false,
                                "isKey": false,
                                "name": "loanPeriod",
                                "nameCamelCase": "loanPeriod",
                                "namePascalCase": "LoanPeriod",
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
                            }
                        ],
                        "description": null,
                        "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 115,
                            "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "CreateLoan",
                        "displayName": "대출 생성",
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
                        "id": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
                        "elementView": {
                            "angle": 0,
                            "height": 115,
                            "id": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
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
                                "name": "status",
                                "nameCamelCase": "status",
                                "namePascalCase": "Status",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanCreated",
                        "displayName": "대출 생성됨",
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
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                        },
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                        }
                    },
                    "from": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                    "to": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
                    "relationView": {
                        "id": "6d707ad9-e590-8add-8231-bd167ee5c10c",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "to": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
                        "needReconnect": true,
                        "value": "[[1191,252],[1279,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "id": "6d707ad9-e590-8add-8231-bd167ee5c10c",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "a2a0723e-0c4b-494a-a3e3-e6d0dcfe6099",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "8ab797d3-db54-79df-2f42-9694649e8464": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "8ab797d3-db54-79df-2f42-9694649e8464",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanReturned"
                        ],
                        "aggregate": {
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                        },
                        "controllerInfo": {
                            "method": "PUT"
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
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "returnReason",
                                "nameCamelCase": "returnReason",
                                "namePascalCase": "ReturnReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 115,
                            "id": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ReturnLoan",
                        "displayName": "반납 처리",
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
                        "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
                        "elementView": {
                            "angle": 0,
                            "height": 115,
                            "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 380,
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
                                "name": "status",
                                "nameCamelCase": "status",
                                "namePascalCase": "Status",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "BookStatus",
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
                            "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
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
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                        },
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                        }
                    },
                    "from": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                    "to": "61f88ad5-b877-64b4-8357-91c77d358c75",
                    "relationView": {
                        "id": "8ab797d3-db54-79df-2f42-9694649e8464",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                        "to": "61f88ad5-b877-64b4-8357-91c77d358c75",
                        "needReconnect": true,
                        "value": "[[1191,380],[1279,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "0a92db32-1425-eaeb-5c0c-3ccdb023a2ff",
                        "id": "8ab797d3-db54-79df-2f42-9694649e8464",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "61f88ad5-b877-64b4-8357-91c77d358c75",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "aacdb132-5631-a7df-a38f-dd200b201cf6": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "aacdb132-5631-a7df-a38f-dd200b201cf6",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                        "elementView": {
                            "angle": 0,
                            "height": 115,
                            "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                            "style": "{}",
                            "width": 100,
                            "x": 744,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "BookStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "previousStatus",
                                "nameCamelCase": "previousStatus",
                                "namePascalCase": "PreviousStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "BookStatus",
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
                                "name": "changeReason",
                                "nameCamelCase": "changeReason",
                                "namePascalCase": "ChangeReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
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
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                        },
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        }
                    },
                    "targetElement": {
                        "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                        },
                        "description": "도서 상태 변경 시 상태 변경 내역을 기록해야 함.",
                        "elementView": {
                            "height": 115,
                            "width": 100,
                            "x": 1022,
                            "y": 250,
                            "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "BookStatusChangeLoggingPolicy",
                        "displayName": "도서 상태 변경 기록 정책",
                        "nameCamelCase": "bookStatusChangeLoggingPolicy",
                        "namePascalCase": "BookStatusChangeLoggingPolicy",
                        "namePlural": "bookStatusChangeLoggingPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                    "to": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                    "relationView": {
                        "id": "aacdb132-5631-a7df-a38f-dd200b201cf6",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                        "to": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "needReconnect": true,
                        "value": "[[794,380],[956,380],[956,308]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "c5ffd8f7-7c5b-c8b0-9448-fe7636569760",
                        "id": "aacdb132-5631-a7df-a38f-dd200b201cf6",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "d6462768-bd81-6899-93eb-f9f0f5d76fbd": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "d6462768-bd81-6899-93eb-f9f0f5d76fbd",
                    "sourceElement": {
                        "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                        },
                        "description": "도서 상태 변경 시 상태 변경 내역을 기록해야 함.",
                        "elementView": {
                            "height": 115,
                            "width": 100,
                            "x": 1022,
                            "y": 250,
                            "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "BookStatusChangeLoggingPolicy",
                        "displayName": "도서 상태 변경 기록 정책",
                        "nameCamelCase": "bookStatusChangeLoggingPolicy",
                        "namePascalCase": "BookStatusChangeLoggingPolicy",
                        "namePlural": "bookStatusChangeLoggingPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanCreated"
                        ],
                        "aggregate": {
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
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
                                "className": "LoanPeriod",
                                "isCopy": false,
                                "isKey": false,
                                "name": "loanPeriod",
                                "nameCamelCase": "loanPeriod",
                                "namePascalCase": "LoanPeriod",
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
                            }
                        ],
                        "description": null,
                        "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 115,
                            "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "CreateLoan",
                        "displayName": "대출 생성",
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
                    "from": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                    "to": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                    "relationView": {
                        "id": "d6462768-bd81-6899-93eb-f9f0f5d76fbd",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "to": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "needReconnect": true,
                        "value": "[[1004,252],[1091,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "3115caac-b47b-bfb1-9f00-723ffea2b23d",
                        "id": "d6462768-bd81-6899-93eb-f9f0f5d76fbd",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "e78a1cb0-a1dc-c07c-ae48-73e23c3e6da5",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "5914cde5-057b-369a-ef0e-6e260035566b": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "5914cde5-057b-369a-ef0e-6e260035566b",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 380,
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
                                "name": "status",
                                "nameCamelCase": "status",
                                "namePascalCase": "Status",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "BookStatus",
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
                            "id": "61f88ad5-b877-64b4-8357-91c77d358c75",
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
                            "id": "94feb7ab-fc4a-ee57-033d-a35f50fee524"
                        },
                        "boundedContext": {
                            "id": "e9db0d1f-8d08-cd69-f92f-8746ab477c6d"
                        }
                    },
                    "targetElement": {
                        "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        },
                        "description": "대출 반납 시 도서 상태를 적절히 업데이트하기 위해",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 409,
                            "y": 356,
                            "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "BookReturnPolicy",
                        "displayName": "도서 반납 상태 업데이트",
                        "nameCamelCase": "bookReturnPolicy",
                        "namePascalCase": "BookReturnPolicy",
                        "namePlural": "bookReturnPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "61f88ad5-b877-64b4-8357-91c77d358c75",
                    "to": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                    "relationView": {
                        "id": "5914cde5-057b-369a-ef0e-6e260035566b",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "61f88ad5-b877-64b4-8357-91c77d358c75",
                        "to": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "needReconnect": true,
                        "value": "[[1279,378],[459,356]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "61f88ad5-b877-64b4-8357-91c77d358c75",
                        "id": "5914cde5-057b-369a-ef0e-6e260035566b",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "d27c82e7-1446-0315-b1c6-d82280219110": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "d27c82e7-1446-0315-b1c6-d82280219110",
                    "sourceElement": {
                        "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        },
                        "description": "대출 반납 시 도서 상태를 적절히 업데이트하기 위해",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 409,
                            "y": 356,
                            "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "BookReturnPolicy",
                        "displayName": "도서 반납 상태 업데이트",
                        "nameCamelCase": "bookReturnPolicy",
                        "namePascalCase": "BookReturnPolicy",
                        "namePlural": "bookReturnPolicies",
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
                            "id": "9667535e-510b-01c5-e8ad-ae22cbad64c0"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "9c4a1895-b3b7-7694-7ce4-eb17d426725e"
                        },
                        "controllerInfo": {
                            "method": "PUT"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "BookStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "currentStatus",
                                "nameCamelCase": "currentStatus",
                                "namePascalCase": "CurrentStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "changeReason",
                                "nameCamelCase": "changeReason",
                                "namePascalCase": "ChangeReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "d628de35-9de0-e39b-d55f-afc6872ffef2",
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
                    "from": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                    "to": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                    "relationView": {
                        "id": "d27c82e7-1446-0315-b1c6-d82280219110",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "to": "d628de35-9de0-e39b-d55f-afc6872ffef2",
                        "needReconnect": true,
                        "value": "[[459,356],[500,356],[500,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "1afaf140-9d40-428e-aba0-fab773b5adc0",
                        "id": "d27c82e7-1446-0315-b1c6-d82280219110",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "d628de35-9de0-e39b-d55f-afc6872ffef2",
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
                "elements": {
                    "c148c643-068e-9743-0865-1f98cbc89531": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "c148c643-068e-9743-0865-1f98cbc89531",
                            "x": 151,
                            "y": 400,
                            "width": 100,
                            "height": 100,
                            "style": "{}",
                            "angle": 0
                        },
                        "object": {
                            "apiVersion": "apps/v1",
                            "kind": "Deployment",
                            "metadata": {
                                "name": "bookmanagement",
                                "labels": {
                                    "app": "bookmanagement"
                                },
                                "annotations": {
                                    "msaez.io/x": "151"
                                }
                            },
                            "spec": {
                                "selector": {
                                    "matchLabels": {
                                        "app": "bookmanagement"
                                    }
                                },
                                "replicas": 1,
                                "template": {
                                    "metadata": {
                                        "labels": {
                                            "app": "bookmanagement"
                                        }
                                    },
                                    "spec": {
                                        "containers": [
                                            {
                                                "name": "bookmanagement",
                                                "image": "ghcr.io/undefined",
                                                "ports": [
                                                    {
                                                        "containerPort": 8080
                                                    }
                                                ],
                                                "readinessProbe": {
                                                    "httpGet": {
                                                        "path": "/actuator/health",
                                                        "port": 8080
                                                    },
                                                    "initialDelaySeconds": 10,
                                                    "timeoutSeconds": 2,
                                                    "periodSeconds": 5,
                                                    "failureThreshold": 10
                                                },
                                                "livenessProbe": {
                                                    "httpGet": {
                                                        "path": "/actuator/health",
                                                        "port": 8080
                                                    },
                                                    "initialDelaySeconds": 120,
                                                    "timeoutSeconds": 2,
                                                    "periodSeconds": 5,
                                                    "failureThreshold": 5
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        "advancedAttributePaths": {
                            "metadata.annotataions": {
                                "kubernetes.io/change-cause": ""
                            },
                            "spec.template.spec.containers[0].resources[0]": {
                                "limits": {
                                    "cpu": "100m",
                                    "mem": "512Mi"
                                }
                            }
                        },
                        "outboundVolumes": [],
                        "outboundConfigMaps": [],
                        "inboundHPA": null,
                        "connectableType": [
                            "PersistentVolumeClaim",
                            "ConfigMap",
                            "Secret"
                        ],
                        "status": null,
                        "replicasStatus": "",
                        "inboundDestinationRule": null,
                        "outboundSecrets": []
                    },
                    "8e67e9fe-d2b1-edbc-6a29-e07abb6ba1ed": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "8e67e9fe-d2b1-edbc-6a29-e07abb6ba1ed",
                            "x": 151,
                            "y": 200,
                            "width": 100,
                            "height": 100,
                            "style": "{}",
                            "angle": 0
                        },
                        "object": {
                            "apiVersion": "v1",
                            "kind": "Service",
                            "metadata": {
                                "name": "bookmanagement",
                                "labels": {
                                    "app": "bookmanagement"
                                },
                                "annotations": {
                                    "msaez.io/x": "151"
                                }
                            },
                            "spec": {
                                "ports": [
                                    {
                                        "port": 8080,
                                        "targetPort": 8080
                                    }
                                ],
                                "selector": {
                                    "app": "bookmanagement"
                                }
                            }
                        },
                        "outboundDeployment": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "c148c643-068e-9743-0865-1f98cbc89531",
                                "x": 151,
                                "y": 400,
                                "width": 100,
                                "height": 100,
                                "style": "{}",
                                "angle": 0
                            },
                            "object": {
                                "apiVersion": "apps/v1",
                                "kind": "Deployment",
                                "metadata": {
                                    "name": "bookmanagement",
                                    "labels": {
                                        "app": "bookmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "151"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "bookmanagement"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "bookmanagement"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "bookmanagement",
                                                    "image": "ghcr.io/undefined",
                                                    "ports": [
                                                        {
                                                            "containerPort": 8080
                                                        }
                                                    ],
                                                    "readinessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 10,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 10
                                                    },
                                                    "livenessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 120,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 5
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            "advancedAttributePaths": {
                                "metadata.annotataions": {
                                    "kubernetes.io/change-cause": ""
                                },
                                "spec.template.spec.containers[0].resources[0]": {
                                    "limits": {
                                        "cpu": "100m",
                                        "mem": "512Mi"
                                    }
                                }
                            },
                            "outboundVolumes": [],
                            "outboundConfigMaps": [],
                            "inboundHPA": null,
                            "connectableType": [
                                "PersistentVolumeClaim",
                                "ConfigMap",
                                "Secret"
                            ],
                            "status": null,
                            "replicasStatus": "",
                            "inboundDestinationRule": null,
                            "outboundSecrets": []
                        },
                        "outboundPod": null,
                        "outboundReplicaSet": null,
                        "outboundStatefulSet": null,
                        "outboundDaemonSet": null,
                        "outboundRollout": null,
                        "connectableType": [
                            "Deployment",
                            "Pod",
                            "ReplicaSet",
                            "StatefulSet",
                            "DaemonSet",
                            "Rollout"
                        ],
                        "status": null
                    },
                    "3f9aed08-4fd5-8928-2e27-65a05940d01d": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "3f9aed08-4fd5-8928-2e27-65a05940d01d",
                            "x": 351,
                            "y": 400,
                            "width": 100,
                            "height": 100,
                            "style": "{}",
                            "angle": 0
                        },
                        "object": {
                            "apiVersion": "apps/v1",
                            "kind": "Deployment",
                            "metadata": {
                                "name": "loanmanagement",
                                "labels": {
                                    "app": "loanmanagement"
                                },
                                "annotations": {
                                    "msaez.io/x": "351"
                                }
                            },
                            "spec": {
                                "selector": {
                                    "matchLabels": {
                                        "app": "loanmanagement"
                                    }
                                },
                                "replicas": 1,
                                "template": {
                                    "metadata": {
                                        "labels": {
                                            "app": "loanmanagement"
                                        }
                                    },
                                    "spec": {
                                        "containers": [
                                            {
                                                "name": "loanmanagement",
                                                "image": "ghcr.io/undefined",
                                                "ports": [
                                                    {
                                                        "containerPort": 8080
                                                    }
                                                ],
                                                "readinessProbe": {
                                                    "httpGet": {
                                                        "path": "/actuator/health",
                                                        "port": 8080
                                                    },
                                                    "initialDelaySeconds": 10,
                                                    "timeoutSeconds": 2,
                                                    "periodSeconds": 5,
                                                    "failureThreshold": 10
                                                },
                                                "livenessProbe": {
                                                    "httpGet": {
                                                        "path": "/actuator/health",
                                                        "port": 8080
                                                    },
                                                    "initialDelaySeconds": 120,
                                                    "timeoutSeconds": 2,
                                                    "periodSeconds": 5,
                                                    "failureThreshold": 5
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        "advancedAttributePaths": {
                            "metadata.annotataions": {
                                "kubernetes.io/change-cause": ""
                            },
                            "spec.template.spec.containers[0].resources[0]": {
                                "limits": {
                                    "cpu": "100m",
                                    "mem": "512Mi"
                                }
                            }
                        },
                        "outboundVolumes": [],
                        "outboundConfigMaps": [],
                        "inboundHPA": null,
                        "connectableType": [
                            "PersistentVolumeClaim",
                            "ConfigMap",
                            "Secret"
                        ],
                        "status": null,
                        "replicasStatus": "",
                        "inboundDestinationRule": null,
                        "outboundSecrets": []
                    },
                    "5859db5b-7c66-ac93-a06f-3e9986884fa9": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "5859db5b-7c66-ac93-a06f-3e9986884fa9",
                            "x": 351,
                            "y": 200,
                            "width": 100,
                            "height": 100,
                            "style": "{}",
                            "angle": 0
                        },
                        "object": {
                            "apiVersion": "v1",
                            "kind": "Service",
                            "metadata": {
                                "name": "loanmanagement",
                                "labels": {
                                    "app": "loanmanagement"
                                },
                                "annotations": {
                                    "msaez.io/x": "351"
                                }
                            },
                            "spec": {
                                "ports": [
                                    {
                                        "port": 8080,
                                        "targetPort": 8080
                                    }
                                ],
                                "selector": {
                                    "app": "loanmanagement"
                                }
                            }
                        },
                        "outboundDeployment": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "3f9aed08-4fd5-8928-2e27-65a05940d01d",
                                "x": 351,
                                "y": 400,
                                "width": 100,
                                "height": 100,
                                "style": "{}",
                                "angle": 0
                            },
                            "object": {
                                "apiVersion": "apps/v1",
                                "kind": "Deployment",
                                "metadata": {
                                    "name": "loanmanagement",
                                    "labels": {
                                        "app": "loanmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "351"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "loanmanagement"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "loanmanagement"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "loanmanagement",
                                                    "image": "ghcr.io/undefined",
                                                    "ports": [
                                                        {
                                                            "containerPort": 8080
                                                        }
                                                    ],
                                                    "readinessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 10,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 10
                                                    },
                                                    "livenessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 120,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 5
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            "advancedAttributePaths": {
                                "metadata.annotataions": {
                                    "kubernetes.io/change-cause": ""
                                },
                                "spec.template.spec.containers[0].resources[0]": {
                                    "limits": {
                                        "cpu": "100m",
                                        "mem": "512Mi"
                                    }
                                }
                            },
                            "outboundVolumes": [],
                            "outboundConfigMaps": [],
                            "inboundHPA": null,
                            "connectableType": [
                                "PersistentVolumeClaim",
                                "ConfigMap",
                                "Secret"
                            ],
                            "status": null,
                            "replicasStatus": "",
                            "inboundDestinationRule": null,
                            "outboundSecrets": []
                        },
                        "outboundPod": null,
                        "outboundReplicaSet": null,
                        "outboundStatefulSet": null,
                        "outboundDaemonSet": null,
                        "outboundRollout": null,
                        "connectableType": [
                            "Deployment",
                            "Pod",
                            "ReplicaSet",
                            "StatefulSet",
                            "DaemonSet",
                            "Rollout"
                        ],
                        "status": null
                    }
                },
                "relations": {
                    "acf548ff-abcb-9bd9-b636-8294adc65d0f": {
                        "_type": "org.uengine.modeling.model.Relation",
                        "name": "",
                        "sourceElement": {
                            "_type": "Service",
                            "name": "",
                            "namespace": "",
                            "host": "",
                            "path": "",
                            "elementView": {
                                "_type": "Service",
                                "id": "8e67e9fe-d2b1-edbc-6a29-e07abb6ba1ed",
                                "x": 151,
                                "y": 200,
                                "width": 100,
                                "height": 100,
                                "style": "{}",
                                "angle": 0
                            },
                            "object": {
                                "apiVersion": "v1",
                                "kind": "Service",
                                "metadata": {
                                    "name": "bookmanagement",
                                    "labels": {
                                        "app": "bookmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "151"
                                    }
                                },
                                "spec": {
                                    "ports": [
                                        {
                                            "port": 8080,
                                            "targetPort": 8080
                                        }
                                    ],
                                    "selector": {
                                        "app": "bookmanagement"
                                    }
                                }
                            },
                            "outboundDeployment": {
                                "_type": "Deployment",
                                "name": "",
                                "namespace": "",
                                "elementView": {
                                    "_type": "Deployment",
                                    "id": "c148c643-068e-9743-0865-1f98cbc89531",
                                    "x": 151,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "object": {
                                    "apiVersion": "apps/v1",
                                    "kind": "Deployment",
                                    "metadata": {
                                        "name": "bookmanagement",
                                        "labels": {
                                            "app": "bookmanagement"
                                        },
                                        "annotations": {
                                            "msaez.io/x": "151"
                                        }
                                    },
                                    "spec": {
                                        "selector": {
                                            "matchLabels": {
                                                "app": "bookmanagement"
                                            }
                                        },
                                        "replicas": 1,
                                        "template": {
                                            "metadata": {
                                                "labels": {
                                                    "app": "bookmanagement"
                                                }
                                            },
                                            "spec": {
                                                "containers": [
                                                    {
                                                        "name": "bookmanagement",
                                                        "image": "ghcr.io/undefined",
                                                        "ports": [
                                                            {
                                                                "containerPort": 8080
                                                            }
                                                        ],
                                                        "readinessProbe": {
                                                            "httpGet": {
                                                                "path": "/actuator/health",
                                                                "port": 8080
                                                            },
                                                            "initialDelaySeconds": 10,
                                                            "timeoutSeconds": 2,
                                                            "periodSeconds": 5,
                                                            "failureThreshold": 10
                                                        },
                                                        "livenessProbe": {
                                                            "httpGet": {
                                                                "path": "/actuator/health",
                                                                "port": 8080
                                                            },
                                                            "initialDelaySeconds": 120,
                                                            "timeoutSeconds": 2,
                                                            "periodSeconds": 5,
                                                            "failureThreshold": 5
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                "advancedAttributePaths": {
                                    "metadata.annotataions": {
                                        "kubernetes.io/change-cause": ""
                                    },
                                    "spec.template.spec.containers[0].resources[0]": {
                                        "limits": {
                                            "cpu": "100m",
                                            "mem": "512Mi"
                                        }
                                    }
                                },
                                "outboundVolumes": [],
                                "outboundConfigMaps": [],
                                "inboundHPA": null,
                                "connectableType": [
                                    "PersistentVolumeClaim",
                                    "ConfigMap",
                                    "Secret"
                                ],
                                "status": null,
                                "replicasStatus": "",
                                "inboundDestinationRule": null,
                                "outboundSecrets": []
                            },
                            "outboundPod": null,
                            "outboundReplicaSet": null,
                            "outboundStatefulSet": null,
                            "outboundDaemonSet": null,
                            "outboundRollout": null,
                            "connectableType": [
                                "Deployment",
                                "Pod",
                                "ReplicaSet",
                                "StatefulSet",
                                "DaemonSet",
                                "Rollout"
                            ],
                            "status": null
                        },
                        "targetElement": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "c148c643-068e-9743-0865-1f98cbc89531",
                                "x": 151,
                                "y": 400,
                                "width": 100,
                                "height": 100,
                                "style": "{}",
                                "angle": 0
                            },
                            "object": {
                                "apiVersion": "apps/v1",
                                "kind": "Deployment",
                                "metadata": {
                                    "name": "bookmanagement",
                                    "labels": {
                                        "app": "bookmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "151"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "bookmanagement"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "bookmanagement"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "bookmanagement",
                                                    "image": "ghcr.io/undefined",
                                                    "ports": [
                                                        {
                                                            "containerPort": 8080
                                                        }
                                                    ],
                                                    "readinessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 10,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 10
                                                    },
                                                    "livenessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 120,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 5
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            "advancedAttributePaths": {
                                "metadata.annotataions": {
                                    "kubernetes.io/change-cause": ""
                                },
                                "spec.template.spec.containers[0].resources[0]": {
                                    "limits": {
                                        "cpu": "100m",
                                        "mem": "512Mi"
                                    }
                                }
                            },
                            "outboundVolumes": [],
                            "outboundConfigMaps": [],
                            "inboundHPA": null,
                            "connectableType": [
                                "PersistentVolumeClaim",
                                "ConfigMap",
                                "Secret"
                            ],
                            "status": null,
                            "replicasStatus": "",
                            "inboundDestinationRule": null,
                            "outboundSecrets": []
                        },
                        "from": "8e67e9fe-d2b1-edbc-6a29-e07abb6ba1ed",
                        "to": "c148c643-068e-9743-0865-1f98cbc89531",
                        "relationView": {
                            "id": "acf548ff-abcb-9bd9-b636-8294adc65d0f",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[152,250],[152,350]]",
                            "from": "8e67e9fe-d2b1-edbc-6a29-e07abb6ba1ed",
                            "to": "c148c643-068e-9743-0865-1f98cbc89531",
                            "needReconnect": true
                        },
                        "sourceMultiplicity": 3,
                        "targetMultiplicity": 3,
                        "style": {}
                    },
                    "388e3600-57b5-dd41-92e4-440011006c09": {
                        "_type": "org.uengine.modeling.model.Relation",
                        "name": "",
                        "sourceElement": {
                            "_type": "Service",
                            "name": "",
                            "namespace": "",
                            "host": "",
                            "path": "",
                            "elementView": {
                                "_type": "Service",
                                "id": "5859db5b-7c66-ac93-a06f-3e9986884fa9",
                                "x": 351,
                                "y": 200,
                                "width": 100,
                                "height": 100,
                                "style": "{}",
                                "angle": 0
                            },
                            "object": {
                                "apiVersion": "v1",
                                "kind": "Service",
                                "metadata": {
                                    "name": "loanmanagement",
                                    "labels": {
                                        "app": "loanmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "351"
                                    }
                                },
                                "spec": {
                                    "ports": [
                                        {
                                            "port": 8080,
                                            "targetPort": 8080
                                        }
                                    ],
                                    "selector": {
                                        "app": "loanmanagement"
                                    }
                                }
                            },
                            "outboundDeployment": {
                                "_type": "Deployment",
                                "name": "",
                                "namespace": "",
                                "elementView": {
                                    "_type": "Deployment",
                                    "id": "3f9aed08-4fd5-8928-2e27-65a05940d01d",
                                    "x": 351,
                                    "y": 400,
                                    "width": 100,
                                    "height": 100,
                                    "style": "{}",
                                    "angle": 0
                                },
                                "object": {
                                    "apiVersion": "apps/v1",
                                    "kind": "Deployment",
                                    "metadata": {
                                        "name": "loanmanagement",
                                        "labels": {
                                            "app": "loanmanagement"
                                        },
                                        "annotations": {
                                            "msaez.io/x": "351"
                                        }
                                    },
                                    "spec": {
                                        "selector": {
                                            "matchLabels": {
                                                "app": "loanmanagement"
                                            }
                                        },
                                        "replicas": 1,
                                        "template": {
                                            "metadata": {
                                                "labels": {
                                                    "app": "loanmanagement"
                                                }
                                            },
                                            "spec": {
                                                "containers": [
                                                    {
                                                        "name": "loanmanagement",
                                                        "image": "ghcr.io/undefined",
                                                        "ports": [
                                                            {
                                                                "containerPort": 8080
                                                            }
                                                        ],
                                                        "readinessProbe": {
                                                            "httpGet": {
                                                                "path": "/actuator/health",
                                                                "port": 8080
                                                            },
                                                            "initialDelaySeconds": 10,
                                                            "timeoutSeconds": 2,
                                                            "periodSeconds": 5,
                                                            "failureThreshold": 10
                                                        },
                                                        "livenessProbe": {
                                                            "httpGet": {
                                                                "path": "/actuator/health",
                                                                "port": 8080
                                                            },
                                                            "initialDelaySeconds": 120,
                                                            "timeoutSeconds": 2,
                                                            "periodSeconds": 5,
                                                            "failureThreshold": 5
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                "advancedAttributePaths": {
                                    "metadata.annotataions": {
                                        "kubernetes.io/change-cause": ""
                                    },
                                    "spec.template.spec.containers[0].resources[0]": {
                                        "limits": {
                                            "cpu": "100m",
                                            "mem": "512Mi"
                                        }
                                    }
                                },
                                "outboundVolumes": [],
                                "outboundConfigMaps": [],
                                "inboundHPA": null,
                                "connectableType": [
                                    "PersistentVolumeClaim",
                                    "ConfigMap",
                                    "Secret"
                                ],
                                "status": null,
                                "replicasStatus": "",
                                "inboundDestinationRule": null,
                                "outboundSecrets": []
                            },
                            "outboundPod": null,
                            "outboundReplicaSet": null,
                            "outboundStatefulSet": null,
                            "outboundDaemonSet": null,
                            "outboundRollout": null,
                            "connectableType": [
                                "Deployment",
                                "Pod",
                                "ReplicaSet",
                                "StatefulSet",
                                "DaemonSet",
                                "Rollout"
                            ],
                            "status": null
                        },
                        "targetElement": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "3f9aed08-4fd5-8928-2e27-65a05940d01d",
                                "x": 351,
                                "y": 400,
                                "width": 100,
                                "height": 100,
                                "style": "{}",
                                "angle": 0
                            },
                            "object": {
                                "apiVersion": "apps/v1",
                                "kind": "Deployment",
                                "metadata": {
                                    "name": "loanmanagement",
                                    "labels": {
                                        "app": "loanmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "351"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "loanmanagement"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "loanmanagement"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "loanmanagement",
                                                    "image": "ghcr.io/undefined",
                                                    "ports": [
                                                        {
                                                            "containerPort": 8080
                                                        }
                                                    ],
                                                    "readinessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 10,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 10
                                                    },
                                                    "livenessProbe": {
                                                        "httpGet": {
                                                            "path": "/actuator/health",
                                                            "port": 8080
                                                        },
                                                        "initialDelaySeconds": 120,
                                                        "timeoutSeconds": 2,
                                                        "periodSeconds": 5,
                                                        "failureThreshold": 5
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            "advancedAttributePaths": {
                                "metadata.annotataions": {
                                    "kubernetes.io/change-cause": ""
                                },
                                "spec.template.spec.containers[0].resources[0]": {
                                    "limits": {
                                        "cpu": "100m",
                                        "mem": "512Mi"
                                    }
                                }
                            },
                            "outboundVolumes": [],
                            "outboundConfigMaps": [],
                            "inboundHPA": null,
                            "connectableType": [
                                "PersistentVolumeClaim",
                                "ConfigMap",
                                "Secret"
                            ],
                            "status": null,
                            "replicasStatus": "",
                            "inboundDestinationRule": null,
                            "outboundSecrets": []
                        },
                        "from": "5859db5b-7c66-ac93-a06f-3e9986884fa9",
                        "to": "3f9aed08-4fd5-8928-2e27-65a05940d01d",
                        "relationView": {
                            "id": "388e3600-57b5-dd41-92e4-440011006c09",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[352,250],[352,350]]",
                            "from": "5859db5b-7c66-ac93-a06f-3e9986884fa9",
                            "to": "3f9aed08-4fd5-8928-2e27-65a05940d01d",
                            "needReconnect": true
                        },
                        "sourceMultiplicity": 3,
                        "targetMultiplicity": 3,
                        "style": {}
                    }
                }
            }
        }
    }
}