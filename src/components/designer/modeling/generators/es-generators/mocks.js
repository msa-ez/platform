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
 * 
 * @example ClassId 역할을 수행하는 ValueObject와 관련 속성을 Aggregate에서 제거해서 얻기
 * console.log(getEsValue("libraryService", ['classId']))
 * 
 * @note
 * - 가능한 typesToExcludeFilter 키 값 종류
 *    - 일반 속성: boundedcontext, aggregate, command, event, policy, view(readmodel), valueobject, enumeration(enum), entity
 *    - 템플릿: remainOnlyBoundedContext, remainOnlyAggregate
 *    - 특수 속성: classId
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


    const inferedTypesToExcludeFilter = []
    for(const excludeFilter of typesToExcludeFilter) {
        if(excludeFilter.toLowerCase().includes("valueobject")) 
            inferedTypesToExcludeFilter.push("org.uengine.uml.model.vo.Class")
        if(excludeFilter.toLowerCase().includes("entity")) 
            inferedTypesToExcludeFilter.push("org.uengine.uml.model.Class")
        if(excludeFilter.toLowerCase().includes("readmodel")) 
            inferedTypesToExcludeFilter.push("org.uengine.modeling.model.View")
        if(excludeFilter.toLowerCase().includes("enum")) 
            inferedTypesToExcludeFilter.push("org.uengine.uml.model.enum")
    }
    typesToExcludeFilter = [...typesToExcludeFilter, ...inferedTypesToExcludeFilter]


    const targetEsValue = JSON.parse(JSON.stringify(esValues[targetService].esValue))
    let deletedElements = []
    for(const element of Object.values(targetEsValue.elements).filter(e => e)) {
        if(typesToExcludeFilter.some(type => element._type.toLowerCase().includes(type.toLowerCase()))) {
            deletedElements.push(element)
            delete targetEsValue.elements[element.id]
        }
    }

    for(const element of Object.values(targetEsValue.elements).filter(e => e)) {
        if(element._type !== "org.uengine.modeling.model.Aggregate") continue
        if(!element.aggregateRoot || !element.aggregateRoot.entities || !element.aggregateRoot.entities.elements) continue
        const aggregateElements = element.aggregateRoot.entities.elements

        let deletedAggElements = []
        for(const aggElement of Object.values(aggregateElements).filter(e => e)) {
            if(typesToExcludeFilter.some(type => aggElement._type.toLowerCase().includes(type.toLowerCase()))) {
                deletedAggElements.push(aggElement)
                delete aggregateElements[aggElement.id]
            }

            if(typesToExcludeFilter.includes("classId") && aggElement._type === "org.uengine.uml.model.vo.Class" && aggElement.name.includes("Id")) {
                element.aggregateRoot.fieldDescriptors = element.aggregateRoot.fieldDescriptors.filter(fieldDescriptor => fieldDescriptor.className !== aggElement.name)
                deletedAggElements.push(aggElement)
                delete aggregateElements[aggElement.id]
            }
        }

        if(!element.aggregateRoot.entities.relations) continue
        const aggregateRelations = element.aggregateRoot.entities.relations

        for(const relation of Object.values(aggregateRelations).filter(r => r)) {
            if(deletedAggElements.some(element => element.id === relation.sourceElement.id || element.id === relation.targetElement.id))
                delete aggregateRelations[relation.id]
        }
    }

    for(const relation of Object.values(targetEsValue.relations).filter(r => r)) {
        if(deletedElements.some(element => element.id === relation.sourceElement.id || element.id === relation.targetElement.id))
            delete targetEsValue.relations[relation.id]
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
    },
    civilApplication: {
        draft: {
            "ApplicationManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "CivilComplaintApplication",
                            "alias": "민원신청서"
                        },
                        "entities": [
                            {
                                "name": "ApplicationData",
                                "alias": "신청서 정보"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "ApplicationStatus",
                                "alias": "신청서 상태",
                                "referencedAggregateName": ""
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "하나의 집합체 내에서 민원 신청의 전체 생명주기를 관리하여 높은 응집력을 보임",
                    "coupling": "외부 집합체와의 의존성이 없으므로 낮은 결합도를 유지",
                    "consistency": "트랜잭션 경계가 명확하여 상태 전이와 검증을 원자적으로 처리함",
                    "encapsulation": "신청서 작성, 임시저장, 제출, 검토를 하나의 집합체에 캡슐화함",
                    "complexity": "구조가 단순하여 이해와 유지보수가 용이함",
                    "independence": "다른 맥락과 독립적으로 동작 가능함",
                    "performance": "단일 집합체 내에서 처리하여 성능 저하 요인이 적음"
                },
                "cons": {
                    "cohesion": "모든 로직이 한 집합체에 집중되어 향후 기능 확장 시 복잡성이 증가할 수 있음",
                    "coupling": "집합체 내부에서 모든 책임을 다루므로 책임 분리가 명확하지 않을 수 있음",
                    "consistency": "모든 변경을 단일 트랜잭션으로 관리해야 하므로 규모가 커질 경우 성능 이슈가 발생할 수 있음",
                    "encapsulation": "신청서 검토와 승인/반려 로직이 신청서 작성과 동일 컨텍스트에 있어서 분리 필요성이 있음",
                    "complexity": "기능 확장이 진행될 경우 단일 집합체의 복잡도가 증가할 수 있음",
                    "independence": "모든 기능이 묶여 있어 일부 기능만 독립적으로 변경하기 어려움",
                    "performance": "집합체 크기가 커질 경우 일부 작업에서 병목현상이 발생할 수 있음"
                },
                "isAIRecommended": false,
                "boundedContext": {
                    "name": "ApplicationManagement",
                    "alias": "민원 신청 관리",
                    "displayName": "민원 신청 관리",
                    "description": "[{\"type\":\"userStory\",\"text\":\"UC-001: 민원 신청서 작성\\n• 액터: 민원 신청자\\n• 목적: 사용자가 간편하게 민원 신청서를 작성하여 필요한 정보를 입력한다.\\n• 전제조건: 민원 신청자가 시스템에 로그인(인증) 완료되어 있어야 함, 개인정보 및 민원 관련 정보 준비\\n• 기본 흐름: 신규 신청서 생성(newApplication), 입력, validateInput, 임시저장(success message)\\n• 예외: 입력값 검증 실패 시 오류 메시지 출력\\n\\nUC-002: 민원 신청서 제출\\n• 액터: 민원 신청자\\n• 목적: 작성 완료된 민원 신청서를 최종 제출\\n• 전제조건: UC-001을 통해 작성된 임시저장 신청서 존재\\n• 기본 흐름: 임시 저장된 신청서 불러오기, submitApplication 호출, 재검증 후 대기 상태 변경\\n• 예외: 필수 정보 미입력 시 제출 불가\\n\\nUC-003: 민원 신청서 검토 및 승인/반려\\n• 액터: 민원 담당자\\n• 목적: 제출된 민원 신청서를 검토하여 승인 혹은 반려 결정\\n• 전제조건: UC-002를 통해 제출된 신청서 대기 리스트 존재, 담당자 권한 보유\\n• 기본 흐름: listPendingApplications, 상세내용 확인, approveApplication 또는 rejectApplication 호출, 승인 시 후속 발급 자동 시작, 반려 시 반려 사유 기록 및 통보\\n• 예외: 시스템 오류 발생 시 오류 메시지 로그 기록 및 재시도 요청\"},{\"type\":\"ddl\",\"text\":\"민원 신청 관리와 관련된 데이터: 민원신청서(제목, 상세내용, 첨부파일, 신청자 개인정보 등) 및 신청서 상태(임시저장, 제출, 승인, 반려)\"}]",
                    "aggregates": [
                        {
                            "name": "Application",
                            "alias": "민원신청서"
                        }
                    ]
                },
                "description": "{\"userStories\":[{\"title\":\"UC-001: 민원 신청서 작성\",\"description\":\"민원 신청자로서, 로그인이 완료된 상태에서 간편하게 민원 신청서를 작성하고 임시 저장하여 나중에 활용할 수 있도록 한다.\",\"acceptance\":[\"시스템에 로그인이 완료되어 있어야 한다.\",\"newApplication 기능을 통해 신규 신청서가 생성되어야 한다.\",\"입력 후 validateInput을 통해 입력값이 검증되어야 한다.\",\"임시저장 시 success message가 표시되어야 한다.\",\"입력 검증 실패 시 오류 메시지가 출력되어야 한다.\"]},{\"title\":\"UC-002: 민원 신청서 제출\",\"description\":\"민원 신청자로서, 임시 저장된 민원 신청서를 불러와 최종 제출하여 처리 상태를 대기 상태로 변경하고자 한다.\",\"acceptance\":[\"UC-001에서 임시 저장된 신청서가 존재해야 한다.\",\"submitApplication 호출 시 재검증이 수행되어야 한다.\",\"필수 정보가 누락된 경우 제출이 불가해야 한다.\",\"제출 후 신청서 상태가 대기로 변경되어야 한다.\"]},{\"title\":\"UC-003: 민원 신청서 검토 및 승인/반려\",\"description\":\"민원 담당자로서, 제출된 민원 신청서를 검토하고 승인 또는 반려하여 후속 처리를 수행하고, 반려 시에는 사유를 기록하여 신청자에게 통보할 수 있어야 한다.\",\"acceptance\":[\"담당자는 listPendingApplications를 통해 대기 중인 신청서를 확인할 수 있어야 한다.\",\"상세 내용을 확인한 후 approveApplication 또는 rejectApplication 기능이 호출되어야 한다.\",\"승인 시 후속 발급이 자동으로 시작되어야 한다.\",\"반려 시 반려 사유가 기록되고 신청자에게 통보되어야 한다.\",\"시스템 오류 발생 시 오류 메시지가 로그에 기록되고 재시도 요청이 가능해야 한다.\"]}],\"entities\":{\"CivilComplaintApplication\":{\"properties\":[{\"name\":\"applicationId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"string\",\"required\":true},{\"name\":\"detail\",\"type\":\"string\",\"required\":true},{\"name\":\"attachedFiles\",\"type\":\"string\"},{\"name\":\"applicantInfo\",\"type\":\"string\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"임시저장\",\"제출\",\"승인\",\"반려\"]}]}},\"businessRules\":[{\"name\":\"InputValidation\",\"description\":\"모든 입력 필드는 validateInput 함수를 통해 필수 항목 및 형식이 검증되어야 한다.\"},{\"name\":\"SubmissionMandatoryFields\",\"description\":\"임시 저장된 신청서 제출 시 필수 정보가 누락되면 제출할 수 없다.\"},{\"name\":\"ApplicationReviewAuthorization\",\"description\":\"민원 담당자는 권한이 있는 경우에만 대기 중인 신청서를 검토할 수 있으며, 승인/반려 후 적절한 후속 조치가 이루어져야 한다.\"}],\"interfaces\":{\"CivilComplaintApplicationForm\":{\"sections\":[{\"name\":\"ApplicationForm\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"detail\",\"type\":\"textarea\",\"required\":true},{\"name\":\"attachedFiles\",\"type\":\"file\"},{\"name\":\"applicantInfo\",\"type\":\"text\",\"required\":true}],\"actions\":[\"newApplication\",\"validateInput\",\"tempSave\",\"submitApplication\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"ApplicationReview\":{\"sections\":[{\"name\":\"PendingApplications\",\"type\":\"table\",\"fields\":[],\"actions\":[],\"filters\":[\"applicationStatus\"],\"resultTable\":{\"columns\":[\"applicationId\",\"title\",\"applicantInfo\",\"status\"],\"actions\":[\"viewDetails\",\"approveApplication\",\"rejectApplication\"]}}]}}}"
            },
            "DocumentIssuance": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "MinwonDocument",
                            "alias": "민원문서"
                        },
                        "entities": [
                            {
                                "name": "DocumentData",
                                "alias": "문서데이터"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "ApprovedApplicationReference",
                                "alias": "승인신청서참조",
                                "referencedAggregate": {
                                    "name": "CivilComplaintApplication",
                                    "alias": "민원신청서"
                                }
                            },
                            {
                                "name": "TransmissionRecordVO",
                                "alias": "전송기록",
                                "referencedAggregateName": ""
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "문서 발급 프로세스의 모든 핵심 기능(문서 생성 및 전송)이 단일 집합체 내에서 관리되어 높은 응집력을 가짐",
                    "coupling": "외부 집합체(민원 신청)의 참조를 값 객체로 관리하여 결합도를 낮춤",
                    "consistency": "트랜잭션 단위가 하나로 통합되어 일관성 유지가 용이함",
                    "encapsulation": "도메인 규칙 및 비즈니스 로직이 한 곳에 집중되어 캡슐화가 우수함",
                    "complexity": "단일 집합체로 설계되어 구조가 단순해짐",
                    "independence": "외부 집합체에 대한 참조만 존재하므로, 해당 집합체와의 독립적인 진화가 가능함",
                    "performance": "단일 집합체 내에서 원자적 처리가 가능해 성능 최적화에 유리함"
                },
                "cons": {
                    "cohesion": "모든 기능이 한 집합체에 집중되어, 기능 확장이 필요한 경우 경계 조정이 필요할 수 있음",
                    "coupling": "외부 시스템(민원 신청)의 변경에 영향을 받을 수 있음",
                    "consistency": "모든 발급 관련 데이터가 단일 트랜잭션으로 처리되어 일부 경우 트랜잭션 크기가 커질 수 있음",
                    "encapsulation": "모든 로직이 한곳에 있으므로, 복잡한 비즈니스 로직은 관리가 필요함",
                    "complexity": "기능 확장이 심해질 경우 단일 집합체의 복잡도가 증가할 수 있음",
                    "independence": "외부 값을 참조하므로 완전한 독립성은 보장하기 어려움",
                    "performance": "집합체 크기가 커질 경우, 처리 성능에 미세한 영향이 있을 수 있음"
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "name": "DocumentIssuance",
                    "alias": "문서 발급 서비스",
                    "displayName": "문서 발급 서비스",
                    "description": "[{\"type\":\"userStory\",\"text\":\"UC-004: 민원 신청 발급 처리\\n• 액터: 민원 담당자 (승인 처리 후 자동 또는 수동 실행 가능)\\n• 목적: 승인된 민원 신청서를 기반으로 공식 민원 문서를 발급\\n• 전제조건: UC-003에서 승인된 신청서, 문서 발급에 필요한 데이터 및 서식 준비\\n• 기본 흐름: 승인된 신청서 확인, issueDocument 호출, PDF 등 문서 생성, 업로드 또는 이메일 전송, 발급 성공 메시지 전달\\n• 예외: 문서 생성 실패 시 오류 로그 기록, 재시도 또는 수동 발급 처리\"},{\"type\":\"ddl\",\"text\":\"문서 발급과 관련된 데이터: 민원문서(PDF 또는 지정 포맷), 발급 상태 및 전송 기록\"}]",
                    "aggregates": [
                        {
                            "name": "Document",
                            "alias": "민원문서"
                        }
                    ]
                },
                "description": "{\"userStories\":[{\"title\":\"UC-004: 민원 신청 발급 처리\",\"description\":\"민원 담당자가 UC-003에서 승인된 신청서를 바탕으로 공식 민원 문서를 발급하는 프로세스를 수행한다. 승인된 신청서를 확인 후 issueDocument 함수를 호출하여 PDF 등 문서를 생성하고, 문서를 업로드하거나 이메일로 전송하며 발급 성공 메시지를 제공한다.\",\"acceptance\":[\"승인된 신청서를 기반으로 문서 발급이 이루어져야 한다.\",\"issueDocument 호출 후 PDF 또는 지정 포맷 문서를 생성해야 한다.\",\"문서 업로드 또는 이메일 전송이 성공적으로 수행되어야 한다.\",\"문서 생성 실패 시 오류 로그가 기록되고, 재시도 또는 수동 발급 처리가 가능해야 한다.\"]}],\"entities\":{\"MinwonDocument\":{\"properties\":[{\"name\":\"documentId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"documentFormat\",\"type\":\"enum\",\"required\":true,\"values\":[\"PDF\",\"SpecifiedFormat\"]},{\"name\":\"issueStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"Issued\",\"Failed\",\"Pending\"]},{\"name\":\"transmissionRecord\",\"type\":\"string\",\"required\":true}]}},\"businessRules\":[{\"name\":\"DocumentGenerationSuccess\",\"description\":\"문서 생성은 성공해야 하며, 실패 시 오류 로그를 기록하고 재시도 또는 수동 발급 처리가 가능해야 한다.\"},{\"name\":\"ApprovedApplicationRequired\",\"description\":\"문서 발급은 UC-003에서 승인된 신청서를 기반으로 진행되어야 한다.\"}],\"interfaces\":{\"DocumentIssuance\":{\"sections\":[{\"name\":\"ApplicationReview\",\"type\":\"form\",\"fields\":[{\"name\":\"applicationId\",\"type\":\"text\",\"required\":true},{\"name\":\"approvalStatus\",\"type\":\"text\",\"required\":true}],\"actions\":[\"issueDocument\",\"retry\",\"manualIssue\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]}}}"
            },
            "SystemOperations": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "SystemOperation",
                            "alias": "시스템 운영"
                        },
                        "entities": [
                            {
                                "name": "OperationData",
                                "alias": "운영 데이터"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "FallbackStatus",
                                "alias": "백업 상태",
                                "referencedAggregateName": ""
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "모든 시스템 운영 관련 데이터가 단일 Aggregate 내에 응집되어 있음",
                    "coupling": "타 Aggregate과의 의존성이 없으며 독립적으로 운영 가능",
                    "consistency": "하나의 트랜잭션으로 모든 시스템 정보를 일관성 있게 처리",
                    "encapsulation": "모니터링 및 백업 전환 로직이 Aggregate 내부에서 캡슐화됨",
                    "complexity": "구조가 단순하여 유지보수와 이해가 용이함",
                    "independence": "시스템 운영 전반을 하나의 후보군으로 관리하여 독립적 발전 가능",
                    "performance": "단일 Aggregate 조회로 성능 최적화가 가능함"
                },
                "cons": {
                    "cohesion": "모든 기능이 한 Aggregate에 포함되어 기능 확장이 어려울 수 있음",
                    "coupling": "모든 변화가 단일 Aggregate에 집중되어 있음",
                    "consistency": "Aggregate 내 데이터 과부하 발생 시 일관성 관리가 도전적일 수 있음",
                    "encapsulation": "복잡한 로직은 내부 구현이 커질 위험이 있음",
                    "complexity": "기능 확장이 필요한 경우 리팩토링 난이도 상승 가능",
                    "independence": "모든 기능이 함께 배포되어 개별 기능 독립성이 제한될 수 있음",
                    "performance": "모든 데이터를 단일 조회할 경우 잠재적 성능 병목이 발생할 수 있음"
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "name": "SystemOperations",
                    "alias": "시스템 운영 및 모니터링",
                    "displayName": "시스템 운영 및 모니터링",
                    "description": "[{\"type\":\"userStory\",\"text\":\"UC-005: 시스템 관리 및 모니터링\\n• 액터: 시스템 관리자\\n• 목적: 서비스 안정성 확보와 운영 효율성을 위해 시스템을 관리, 모니터링\\n• 전제조건: 관리자 전용 콘솔 접근 권한 보유\\n• 기본 흐름: monitorSystem 호출로 서버 상태, 트랜잭션 로그 등 확인, 장애 발생 시 알림 및 즉각 조치, 정기적인 업데이트 및 보안 점검 실행\\n• 예외: 모니터링 도구 오류 시 백업 로깅 시스템으로 전환, 수동 모니터링 조치\"},{\"type\":\"ddl\",\"text\":\"시스템 운영과 관련된 데이터: 서버 상태, 트랜잭션 로그, 장애 및 알림 기록\"}]",
                    "aggregates": [
                        {
                            "name": "SystemStatus",
                            "alias": "시스템상태"
                        }
                    ]
                },
                "description": "{\"userStories\":[{\"title\":\"UC-005: 시스템 관리 및 모니터링\",\"description\":\"시스템 관리자로서, 서비스의 안정성과 운영 효율성을 확보하기 위해 시스템을 모니터링하고 관리하고자 합니다. 관리자 전용 콘솔에 접근하여 monitorSystem 호출을 통해 서버 상태, 트랜잭션 로그 및 장애 발생 시 알림을 확인하고 즉각 조치할 수 있어야 합니다. 또한 정기적인 업데이트와 보안 점검이 실행됩니다.\",\"acceptance\":[\"관리자 전용 콘솔 접근 권한 보유\",\"monitorSystem 호출 시 서버 상태, 트랜잭션 로그 확인\",\"장애 발생 시 알림 및 즉각 조치\",\"정기 업데이트 및 보안 점검의 실행 확인\",\"모니터링 도구 오류 발생 시 백업 로깅 시스템으로 전환 및 수동 모니터링 조치\"]}],\"entities\":{\"SystemOperation\":{\"properties\":[{\"name\":\"serverStatus\",\"type\":\"string\",\"required\":true},{\"name\":\"transactionLog\",\"type\":\"string\",\"required\":true},{\"name\":\"alertRecords\",\"type\":\"string\",\"required\":true}]}},\"businessRules\":[{\"name\":\"MonitorFallback\",\"description\":\"모니터링 도구 오류 발생 시 자동으로 백업 로깅 시스템으로 전환하고 수동 모니터링 조치를 수행할 수 있어야 한다.\"}],\"interfaces\":{\"SystemMonitoringConsole\":{\"sections\":[{\"name\":\"SystemOverview\",\"type\":\"form\",\"fields\":[{\"name\":\"serverStatus\",\"type\":\"text\",\"required\":true},{\"name\":\"transactionLog\",\"type\":\"textarea\",\"required\":true},{\"name\":\"alertRecords\",\"type\":\"textarea\",\"required\":true}],\"actions\":[\"monitorSystem\",\"switchToBackup\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]}}}"
            }
        },
        esValue: {
            "elements": {
                "1e909e6e-53f8-febb-f8e0-016837952467": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"UC-001: 민원 신청서 작성\\n• 액터: 민원 신청자\\n• 목적: 사용자가 간편하게 민원 신청서를 작성하여 필요한 정보를 입력한다.\\n• 전제조건: 민원 신청자가 시스템에 로그인(인증) 완료되어 있어야 함, 개인정보 및 민원 관련 정보 준비\\n• 기본 흐름: 신규 신청서 생성(newApplication), 입력, validateInput, 임시저장(success message)\\n• 예외: 입력값 검증 실패 시 오류 메시지 출력\\n\\nUC-002: 민원 신청서 제출\\n• 액터: 민원 신청자\\n• 목적: 작성 완료된 민원 신청서를 최종 제출\\n• 전제조건: UC-001을 통해 작성된 임시저장 신청서 존재\\n• 기본 흐름: 임시 저장된 신청서 불러오기, submitApplication 호출, 재검증 후 대기 상태 변경\\n• 예외: 필수 정보 미입력 시 제출 불가\\n\\nUC-003: 민원 신청서 검토 및 승인/반려\\n• 액터: 민원 담당자\\n• 목적: 제출된 민원 신청서를 검토하여 승인 혹은 반려 결정\\n• 전제조건: UC-002를 통해 제출된 신청서 대기 리스트 존재, 담당자 권한 보유\\n• 기본 흐름: listPendingApplications, 상세내용 확인, approveApplication 또는 rejectApplication 호출, 승인 시 후속 발급 자동 시작, 반려 시 반려 사유 기록 및 통보\\n• 예외: 시스템 오류 발생 시 오류 메시지 로그 기록 및 재시도 요청\"},{\"type\":\"ddl\",\"text\":\"민원 신청 관리와 관련된 데이터: 민원신청서(제목, 상세내용, 첨부파일, 신청자 개인정보 등) 및 신청서 상태(임시저장, 제출, 승인, 반려)\"}]",
                    "id": "1e909e6e-53f8-febb-f8e0-016837952467",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 860,
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 586
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "ApplicationManagement",
                    "displayName": "민원 신청 관리",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": null,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "99898ec5cd1a76a95f8816a997de6897"
                },
                "03323d91-1261-f9b8-65e2-333f1a241fc0": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"UC-004: 민원 신청 발급 처리\\n• 액터: 민원 담당자 (승인 처리 후 자동 또는 수동 실행 가능)\\n• 목적: 승인된 민원 신청서를 기반으로 공식 민원 문서를 발급\\n• 전제조건: UC-003에서 승인된 신청서, 문서 발급에 필요한 데이터 및 서식 준비\\n• 기본 흐름: 승인된 신청서 확인, issueDocument 호출, PDF 등 문서 생성, 업로드 또는 이메일 전송, 발급 성공 메시지 전달\\n• 예외: 문서 생성 실패 시 오류 로그 기록, 재시도 또는 수동 발급 처리\"},{\"type\":\"ddl\",\"text\":\"문서 발급과 관련된 데이터: 민원문서(PDF 또는 지정 포맷), 발급 상태 및 전송 기록\"}]",
                    "id": "03323d91-1261-f9b8-65e2-333f1a241fc0",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0",
                        "style": "{}",
                        "width": 560,
                        "x": 1235,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "DocumentIssuance",
                    "displayName": "문서 발급 서비스",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": 8080,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "99898ec5cd1a76a95f8816a997de6897"
                },
                "f0a567cc-2b73-509f-37cb-24dde03e0d76": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "857059f8-228a-8b17-127a-354eece4ee86"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"UC-005: 시스템 관리 및 모니터링\\n• 액터: 시스템 관리자\\n• 목적: 서비스 안정성 확보와 운영 효율성을 위해 시스템을 관리, 모니터링\\n• 전제조건: 관리자 전용 콘솔 접근 권한 보유\\n• 기본 흐름: monitorSystem 호출로 서버 상태, 트랜잭션 로그 등 확인, 장애 발생 시 알림 및 즉각 조치, 정기적인 업데이트 및 보안 점검 실행\\n• 예외: 모니터링 도구 오류 시 백업 로깅 시스템으로 전환, 수동 모니터링 조치\"},{\"type\":\"ddl\",\"text\":\"시스템 운영과 관련된 데이터: 서버 상태, 트랜잭션 로그, 장애 및 알림 기록\"}]",
                    "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76",
                        "style": "{}",
                        "width": 560,
                        "x": 1820,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "SystemOperations",
                    "displayName": "시스템 운영 및 모니터링",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": 8081,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "99898ec5cd1a76a95f8816a997de6897"
                },
                "626b7229-4e39-028a-5f05-99bf207ed201": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "ApplicationStatus",
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
                                "className": "ApplicationData",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationData",
                                "nameCamelCase": "applicationData",
                                "namePascalCase": "ApplicationData",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "4aee28d7-ebb2-c518-692e-bf4ed37a3c99": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "4aee28d7-ebb2-c518-692e-bf4ed37a3c99",
                                    "name": "CivilComplaintApplication",
                                    "namePascalCase": "CivilComplaintApplication",
                                    "nameCamelCase": "civilComplaintApplication",
                                    "namePlural": "CivilComplaintApplications",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "applicationId",
                                            "displayName": "",
                                            "nameCamelCase": "applicationId",
                                            "namePascalCase": "ApplicationId",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "ApplicationStatus",
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
                                            "className": "ApplicationData",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "applicationData",
                                            "displayName": "",
                                            "nameCamelCase": "applicationData",
                                            "namePascalCase": "ApplicationData",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "4aee28d7-ebb2-c518-692e-bf4ed37a3c99",
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
                                    "parentId": "626b7229-4e39-028a-5f05-99bf207ed201"
                                },
                                "988dda2a-b1bb-5b3f-9dbf-ec28819faff6": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "988dda2a-b1bb-5b3f-9dbf-ec28819faff6",
                                    "name": "ApplicationData",
                                    "displayName": "신청서 정보",
                                    "namePascalCase": "ApplicationData",
                                    "nameCamelCase": "applicationData",
                                    "namePlural": "applicationData",
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "applicationDataId",
                                            "nameCamelCase": "applicationDataId",
                                            "namePascalCase": "ApplicationDataId",
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
                                            "name": "title",
                                            "nameCamelCase": "title",
                                            "namePascalCase": "Title",
                                            "className": "String",
                                            "isKey": false,
                                            "isName": false,
                                            "isList": false,
                                            "isVO": false,
                                            "isLob": false,
                                            "isCorrelationKey": false,
                                            "displayName": ""
                                        },
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "detail",
                                            "nameCamelCase": "detail",
                                            "namePascalCase": "Detail",
                                            "className": "String",
                                            "isKey": false,
                                            "isName": false,
                                            "isList": false,
                                            "isVO": false,
                                            "isLob": false,
                                            "isCorrelationKey": false,
                                            "displayName": ""
                                        },
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "attachedFiles",
                                            "nameCamelCase": "attachedFiles",
                                            "namePascalCase": "AttachedFiles",
                                            "className": "String",
                                            "isKey": false,
                                            "isName": false,
                                            "isList": false,
                                            "isVO": false,
                                            "isLob": false,
                                            "isCorrelationKey": false,
                                            "displayName": ""
                                        },
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "applicantInfo",
                                            "nameCamelCase": "applicantInfo",
                                            "namePascalCase": "ApplicantInfo",
                                            "className": "String",
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
                                        "id": "988dda2a-b1bb-5b3f-9dbf-ec28819faff6",
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
                                    "relations": [],
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": false,
                                    "isAbstract": false,
                                    "isInterface": false,
                                    "isAggregateRoot": false
                                },
                                "56c3c677-d7f5-0747-3a2a-2d9964e384da": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "56c3c677-d7f5-0747-3a2a-2d9964e384da",
                                    "name": "ApplicationStatus",
                                    "displayName": "신청서 상태",
                                    "nameCamelCase": "applicationStatus",
                                    "namePascalCase": "ApplicationStatus",
                                    "namePlural": "applicationStatuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "56c3c677-d7f5-0747-3a2a-2d9964e384da",
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
                                            "value": "TEMPORARY"
                                        },
                                        {
                                            "value": "SUBMITTED"
                                        },
                                        {
                                            "value": "APPROVED"
                                        },
                                        {
                                            "value": "REJECTED"
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
                        "name": "1e909e6e-53f8-febb-f8e0-016837952467",
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "commands": [],
                    "description": null,
                    "id": "626b7229-4e39-028a-5f05-99bf207ed201",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201",
                        "x": 650,
                        "y": 600,
                        "width": 130,
                        "height": 700
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "CivilComplaintApplication",
                    "displayName": "민원신청서",
                    "nameCamelCase": "civilComplaintApplication",
                    "namePascalCase": "CivilComplaintApplication",
                    "namePlural": "civilComplaintApplications",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "66dacbed-e343-9cd7-2dd0-db20f2a86a90": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "documentId",
                                "nameCamelCase": "documentId",
                                "namePascalCase": "DocumentId",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "documentFormat",
                                "nameCamelCase": "documentFormat",
                                "namePascalCase": "DocumentFormat",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "IssueStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "issueStatus",
                                "nameCamelCase": "issueStatus",
                                "namePascalCase": "IssueStatus",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "TransmissionRecordVO",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transmissionRecord",
                                "nameCamelCase": "transmissionRecord",
                                "namePascalCase": "TransmissionRecord",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentData",
                                "isCopy": false,
                                "isKey": false,
                                "name": "documentData",
                                "nameCamelCase": "documentData",
                                "namePascalCase": "DocumentData",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "CivilComplaintApplicationId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "civilComplaintApplicationId",
                                "nameCamelCase": "civilComplaintApplicationId",
                                "namePascalCase": "CivilComplaintApplicationId",
                                "displayName": "",
                                "referenceClass": "CivilComplaintApplication",
                                "isOverrideField": true,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "42e42acc-bcea-565f-6412-f36434b3fed3": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "42e42acc-bcea-565f-6412-f36434b3fed3",
                                    "name": "MinwonDocument",
                                    "namePascalCase": "MinwonDocument",
                                    "nameCamelCase": "minwonDocument",
                                    "namePlural": "MinwonDocuments",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "documentId",
                                            "displayName": "",
                                            "nameCamelCase": "documentId",
                                            "namePascalCase": "DocumentId",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "DocumentFormat",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "documentFormat",
                                            "displayName": "",
                                            "nameCamelCase": "documentFormat",
                                            "namePascalCase": "DocumentFormat",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "IssueStatus",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "issueStatus",
                                            "displayName": "",
                                            "nameCamelCase": "issueStatus",
                                            "namePascalCase": "IssueStatus",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "TransmissionRecordVO",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "transmissionRecord",
                                            "displayName": "",
                                            "nameCamelCase": "transmissionRecord",
                                            "namePascalCase": "TransmissionRecord",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "DocumentData",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "documentData",
                                            "displayName": "",
                                            "nameCamelCase": "documentData",
                                            "namePascalCase": "DocumentData",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "CivilComplaintApplicationId",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "civilComplaintApplicationId",
                                            "nameCamelCase": "civilComplaintApplicationId",
                                            "namePascalCase": "CivilComplaintApplicationId",
                                            "displayName": "",
                                            "referenceClass": "CivilComplaintApplication",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "42e42acc-bcea-565f-6412-f36434b3fed3",
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
                                    "parentId": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                                },
                                "5d63b1d9-fada-a0ca-f7e7-ec08de27e302": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "5d63b1d9-fada-a0ca-f7e7-ec08de27e302",
                                    "name": "DocumentData",
                                    "displayName": "문서데이터",
                                    "namePascalCase": "DocumentData",
                                    "nameCamelCase": "documentData",
                                    "namePlural": "documentData",
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "documentDataId",
                                            "nameCamelCase": "documentDataId",
                                            "namePascalCase": "DocumentDataId",
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
                                            "name": "content",
                                            "nameCamelCase": "content",
                                            "namePascalCase": "Content",
                                            "className": "String",
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
                                        "id": "5d63b1d9-fada-a0ca-f7e7-ec08de27e302",
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
                                    "relations": [],
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": false,
                                    "isAbstract": false,
                                    "isInterface": false,
                                    "isAggregateRoot": false
                                },
                                "af1f426e-5c41-fcef-c46f-0a724172df44": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "af1f426e-5c41-fcef-c46f-0a724172df44",
                                    "name": "TransmissionRecordVO",
                                    "displayName": "전송기록",
                                    "namePascalCase": "TransmissionRecordVo",
                                    "nameCamelCase": "transmissionRecordVo",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": false,
                                            "label": "- method: String",
                                            "name": "method",
                                            "nameCamelCase": "method",
                                            "namePascalCase": "Method",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        },
                                        {
                                            "className": "Date",
                                            "isKey": false,
                                            "label": "- sentDate: Date",
                                            "name": "sentDate",
                                            "nameCamelCase": "sentDate",
                                            "namePascalCase": "SentDate",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "af1f426e-5c41-fcef-c46f-0a724172df44",
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
                                    "namePlural": "TransmissionRecordVOs",
                                    "isAbstract": false,
                                    "isInterface": false
                                },
                                "4cb8390a-27e9-0332-aa36-e99c3c57bbae": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "4cb8390a-27e9-0332-aa36-e99c3c57bbae",
                                    "name": "DocumentFormat",
                                    "displayName": "문서형식",
                                    "nameCamelCase": "documentFormat",
                                    "namePascalCase": "DocumentFormat",
                                    "namePlural": "documentFormats",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "4cb8390a-27e9-0332-aa36-e99c3c57bbae",
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
                                            "value": "PDF"
                                        },
                                        {
                                            "value": "SpecifiedFormat"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": []
                                },
                                "927786fa-77fa-0579-79d9-0d462e62b134": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "927786fa-77fa-0579-79d9-0d462e62b134",
                                    "name": "IssueStatus",
                                    "displayName": "발급상태",
                                    "nameCamelCase": "issueStatus",
                                    "namePascalCase": "IssueStatus",
                                    "namePlural": "issueStatuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "927786fa-77fa-0579-79d9-0d462e62b134",
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
                                            "value": "Issued"
                                        },
                                        {
                                            "value": "Failed"
                                        },
                                        {
                                            "value": "Pending"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": []
                                },
                                "5b0626c9-db66-2c06-d636-3a9c1a57be92": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "5b0626c9-db66-2c06-d636-3a9c1a57be92",
                                    "name": "CivilComplaintApplicationId",
                                    "displayName": "",
                                    "namePascalCase": "CivilComplaintApplicationId",
                                    "nameCamelCase": "civilComplaintApplicationId",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": true,
                                            "label": "- applicationId: String",
                                            "name": "applicationId",
                                            "nameCamelCase": "applicationId",
                                            "namePascalCase": "ApplicationId",
                                            "displayName": "",
                                            "referenceClass": "CivilComplaintApplication",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "5b0626c9-db66-2c06-d636-3a9c1a57be92",
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
                                    "namePlural": "CivilComplaintApplicationIds",
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
                        "name": "03323d91-1261-f9b8-65e2-333f1a241fc0",
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                    },
                    "commands": [],
                    "description": null,
                    "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                        "x": 1235,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "MinwonDocument",
                    "displayName": "민원문서",
                    "nameCamelCase": "minwonDocument",
                    "namePascalCase": "MinwonDocument",
                    "namePlural": "minwonDocuments",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "857059f8-228a-8b17-127a-354eece4ee86": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "operationId",
                                "nameCamelCase": "operationId",
                                "namePascalCase": "OperationId",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "FallbackStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "fallbackStatus",
                                "nameCamelCase": "fallbackStatus",
                                "namePascalCase": "FallbackStatus",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "OperationData",
                                "isCopy": false,
                                "isKey": false,
                                "name": "operationData",
                                "nameCamelCase": "operationData",
                                "namePascalCase": "OperationData",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "9e1e1410-621f-fe3a-9ce1-3080f7eca9a1": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "9e1e1410-621f-fe3a-9ce1-3080f7eca9a1",
                                    "name": "SystemOperation",
                                    "namePascalCase": "SystemOperation",
                                    "nameCamelCase": "systemOperation",
                                    "namePlural": "SystemOperations",
                                    "fieldDescriptors": [
                                        {
                                            "className": "Long",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "operationId",
                                            "displayName": "",
                                            "nameCamelCase": "operationId",
                                            "namePascalCase": "OperationId",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "FallbackStatus",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "fallbackStatus",
                                            "displayName": "",
                                            "nameCamelCase": "fallbackStatus",
                                            "namePascalCase": "FallbackStatus",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "OperationData",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "operationData",
                                            "displayName": "",
                                            "nameCamelCase": "operationData",
                                            "namePascalCase": "OperationData",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "9e1e1410-621f-fe3a-9ce1-3080f7eca9a1",
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
                                    "parentId": "857059f8-228a-8b17-127a-354eece4ee86"
                                },
                                "70d61a68-66e9-712e-a126-f306b9882d8e": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "70d61a68-66e9-712e-a126-f306b9882d8e",
                                    "name": "OperationData",
                                    "displayName": "운영 데이터",
                                    "namePascalCase": "OperationData",
                                    "nameCamelCase": "operationData",
                                    "namePlural": "operationData",
                                    "fieldDescriptors": [
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "dataId",
                                            "nameCamelCase": "dataId",
                                            "namePascalCase": "DataId",
                                            "className": "Long",
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
                                            "name": "serverStatus",
                                            "nameCamelCase": "serverStatus",
                                            "namePascalCase": "ServerStatus",
                                            "className": "String",
                                            "isKey": false,
                                            "isName": false,
                                            "isList": false,
                                            "isVO": false,
                                            "isLob": false,
                                            "isCorrelationKey": false,
                                            "displayName": ""
                                        },
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "transactionLog",
                                            "nameCamelCase": "transactionLog",
                                            "namePascalCase": "TransactionLog",
                                            "className": "String",
                                            "isKey": false,
                                            "isName": false,
                                            "isList": false,
                                            "isVO": false,
                                            "isLob": false,
                                            "isCorrelationKey": false,
                                            "displayName": ""
                                        },
                                        {
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "name": "alertRecords",
                                            "nameCamelCase": "alertRecords",
                                            "namePascalCase": "AlertRecords",
                                            "className": "String",
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
                                        "id": "70d61a68-66e9-712e-a126-f306b9882d8e",
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
                                    "relations": [],
                                    "parentOperations": [],
                                    "relationType": null,
                                    "isVO": false,
                                    "isAbstract": false,
                                    "isInterface": false,
                                    "isAggregateRoot": false
                                },
                                "48695ce7-3cc5-8cb0-65ae-53f29fa20f24": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "48695ce7-3cc5-8cb0-65ae-53f29fa20f24",
                                    "name": "FallbackStatus",
                                    "displayName": "백업 상태",
                                    "namePascalCase": "FallbackStatus",
                                    "nameCamelCase": "fallbackStatus",
                                    "fieldDescriptors": [
                                        {
                                            "className": "Boolean",
                                            "isKey": false,
                                            "label": "- active: Boolean",
                                            "name": "active",
                                            "nameCamelCase": "active",
                                            "namePascalCase": "Active",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        },
                                        {
                                            "className": "Date",
                                            "isKey": false,
                                            "label": "- lastSwitchedDate: Date",
                                            "name": "lastSwitchedDate",
                                            "nameCamelCase": "lastSwitchedDate",
                                            "namePascalCase": "LastSwitchedDate",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "48695ce7-3cc5-8cb0-65ae-53f29fa20f24",
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
                                    "namePlural": "FallbackStatuss",
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
                        "name": "f0a567cc-2b73-509f-37cb-24dde03e0d76",
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    },
                    "commands": [],
                    "description": null,
                    "id": "857059f8-228a-8b17-127a-354eece4ee86",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "857059f8-228a-8b17-127a-354eece4ee86",
                        "x": 1820,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "857059f8-228a-8b17-127a-354eece4ee86",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "SystemOperation",
                    "displayName": "시스템 운영",
                    "nameCamelCase": "systemOperation",
                    "namePascalCase": "SystemOperation",
                    "namePlural": "systemOperations",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "66f3458b-5642-0fcb-b29b-ebe3befd6d33": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
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
                            "isKey": true,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
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
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "detail",
                            "nameCamelCase": "detail",
                            "namePascalCase": "Detail",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "attachedFiles",
                            "nameCamelCase": "attachedFiles",
                            "namePascalCase": "AttachedFiles",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "applicantInfo",
                            "nameCamelCase": "applicantInfo",
                            "namePascalCase": "ApplicantInfo",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "ApplicationStatus",
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
                        "id": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "CivilComplaintApplicationCreated",
                    "displayName": "민원 신청서 임시 저장 완료",
                    "nameCamelCase": "civilComplaintApplicationCreated",
                    "namePascalCase": "CivilComplaintApplicationCreated",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    }
                },
                "f29c3838-ea28-5652-c1f1-cf692b607ab0": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                        "style": "{}",
                        "width": 100,
                        "x": 744,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "submittedAt",
                            "nameCamelCase": "submittedAt",
                            "namePascalCase": "SubmittedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "CivilComplaintApplicationSubmitted",
                    "displayName": "민원 신청서 제출 완료",
                    "nameCamelCase": "civilComplaintApplicationSubmitted",
                    "namePascalCase": "CivilComplaintApplicationSubmitted",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    }
                },
                "bc5229a7-862e-d110-8cbc-09473b572133": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "style": "{}",
                        "width": 100,
                        "x": 744,
                        "y": 510,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "approvedAt",
                            "nameCamelCase": "approvedAt",
                            "namePascalCase": "ApprovedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "CivilComplaintApplicationApproved",
                    "displayName": "민원 신청서 승인 완료",
                    "nameCamelCase": "civilComplaintApplicationApproved",
                    "namePascalCase": "CivilComplaintApplicationApproved",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    }
                },
                "76b52ff8-08f2-4639-5353-53dc2421a6c8": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                        "style": "{}",
                        "width": 100,
                        "x": 744,
                        "y": 640,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "rejectionReason",
                            "nameCamelCase": "rejectionReason",
                            "namePascalCase": "RejectionReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "rejectedAt",
                            "nameCamelCase": "rejectedAt",
                            "namePascalCase": "RejectedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "CivilComplaintApplicationRejected",
                    "displayName": "민원 신청서 반려 완료",
                    "nameCamelCase": "civilComplaintApplicationRejected",
                    "namePascalCase": "CivilComplaintApplicationRejected",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    }
                },
                "30a5302a-47fa-1359-ef3c-530be470a9ad": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "CivilComplaintApplicationCreated"
                    ],
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
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
                            "name": "detail",
                            "nameCamelCase": "detail",
                            "namePascalCase": "Detail",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "attachedFiles",
                            "nameCamelCase": "attachedFiles",
                            "namePascalCase": "AttachedFiles",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "applicantInfo",
                            "nameCamelCase": "applicantInfo",
                            "namePascalCase": "ApplicantInfo",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "CreateCivilComplaintApplication",
                    "displayName": "신규 민원 신청서 생성",
                    "nameCamelCase": "createCivilComplaintApplication",
                    "namePascalCase": "CreateCivilComplaintApplication",
                    "namePlural": "createCivilComplaintApplications",
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
                                    "name": "CivilComplaintApplication",
                                    "value": {
                                        "applicationId": null,
                                        "status": "N/A",
                                        "applicationData": {
                                            "title": "N/A",
                                            "detail": "N/A",
                                            "attachedFiles": "N/A",
                                            "applicantInfo": "N/A"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "CreateCivilComplaintApplication",
                                    "value": {
                                        "title": "도로 파손 신고",
                                        "detail": "도로 포장 파손으로 인한 불편 발생",
                                        "attachedFiles": "file1.png",
                                        "applicantInfo": "홍길동"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "CivilComplaintApplicationCreated",
                                    "value": {
                                        "applicationId": "APP-001",
                                        "title": "도로 파손 신고",
                                        "detail": "도로 포장 파손으로 인한 불편 발생",
                                        "attachedFiles": "file1.png",
                                        "applicantInfo": "홍길동",
                                        "status": "TEMPORARY"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "CivilComplaintApplicationSubmitted"
                    ],
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "controllerInfo": {
                        "method": "PUT"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "SubmitCivilComplaintApplication",
                    "displayName": "민원 신청서 제출",
                    "nameCamelCase": "submitCivilComplaintApplication",
                    "namePascalCase": "SubmitCivilComplaintApplication",
                    "namePlural": "submitCivilComplaintApplications",
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
                                    "name": "CivilComplaintApplication",
                                    "value": {
                                        "applicationId": "APP-001",
                                        "status": "TEMPORARY",
                                        "applicationData": {
                                            "title": "도로 파손 신고",
                                            "detail": "도로 포장 파손으로 인한 불편 발생",
                                            "attachedFiles": "file1.png",
                                            "applicantInfo": "홍길동"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "SubmitCivilComplaintApplication",
                                    "value": {
                                        "applicationId": "APP-001"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "CivilComplaintApplicationSubmitted",
                                    "value": {
                                        "applicationId": "APP-001",
                                        "submittedAt": "2024-03-20T10:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "162056e1-3668-2d15-3622-74cba332f2b8": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "CivilComplaintApplicationApproved"
                    ],
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "controllerInfo": {
                        "method": "PUT"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "162056e1-3668-2d15-3622-74cba332f2b8",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "162056e1-3668-2d15-3622-74cba332f2b8",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 510,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "162056e1-3668-2d15-3622-74cba332f2b8",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ApproveCivilComplaintApplication",
                    "displayName": "민원 신청서 승인",
                    "nameCamelCase": "approveCivilComplaintApplication",
                    "namePascalCase": "ApproveCivilComplaintApplication",
                    "namePlural": "approveCivilComplaintApplications",
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
                                    "name": "CivilComplaintApplication",
                                    "value": {
                                        "applicationId": "APP-002",
                                        "status": "SUBMITTED",
                                        "applicationData": {
                                            "title": "건물 안전 점검 신청",
                                            "detail": "건물 외벽 균열 발견",
                                            "attachedFiles": "file2.pdf",
                                            "applicantInfo": "이순신"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ApproveCivilComplaintApplication",
                                    "value": {
                                        "applicationId": "APP-002"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "CivilComplaintApplicationApproved",
                                    "value": {
                                        "applicationId": "APP-002",
                                        "approvedAt": "2024-03-21T09:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "CivilComplaintApplicationRejected"
                    ],
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "controllerInfo": {
                        "method": "PUT"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "rejectionReason",
                            "nameCamelCase": "rejectionReason",
                            "namePascalCase": "RejectionReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 640,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "RejectCivilComplaintApplication",
                    "displayName": "민원 신청서 반려",
                    "nameCamelCase": "rejectCivilComplaintApplication",
                    "namePascalCase": "RejectCivilComplaintApplication",
                    "namePlural": "rejectCivilComplaintApplications",
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
                                    "name": "CivilComplaintApplication",
                                    "value": {
                                        "applicationId": "APP-003",
                                        "status": "SUBMITTED",
                                        "applicationData": {
                                            "title": "소음 민원 신청",
                                            "detail": "야간 소음으로 인한 불편",
                                            "attachedFiles": "file3.docx",
                                            "applicantInfo": "김유신"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "RejectCivilComplaintApplication",
                                    "value": {
                                        "applicationId": "APP-003",
                                        "rejectionReason": "제출된 정보가 불충분하여 재검토 필요"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "CivilComplaintApplicationRejected",
                                    "value": {
                                        "applicationId": "APP-003",
                                        "rejectionReason": "제출된 정보가 불충분하여 재검토 필요",
                                        "rejectedAt": "2024-03-22T15:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "3f68da4c-b2a8-f1c2-6f6e-e2144061f511": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "3f68da4c-b2a8-f1c2-6f6e-e2144061f511",
                    "visibility": "public",
                    "name": "CivilComplaintApplicationDetails",
                    "oldName": "",
                    "displayName": "민원 신청서 상세 정보",
                    "namePascalCase": "CivilComplaintApplicationDetails",
                    "namePlural": "civilComplaintApplicationDetails",
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
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
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
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
                        "id": "3f68da4c-b2a8-f1c2-6f6e-e2144061f511",
                        "x": 556,
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
                "560f34e0-bcdd-7ab7-a097-11b7807cb915": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "560f34e0-bcdd-7ab7-a097-11b7807cb915",
                    "visibility": "public",
                    "name": "PendingCivilComplaintApplications",
                    "oldName": "",
                    "displayName": "대기중인 민원 신청서 목록",
                    "namePascalCase": "PendingCivilComplaintApplications",
                    "namePlural": "pendingCivilComplaintApplications",
                    "aggregate": {
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
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
                            "className": "ApplicationStatus",
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
                        "id": "560f34e0-bcdd-7ab7-a097-11b7807cb915",
                        "x": 556,
                        "y": 900,
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
                "931f4b29-2dbf-78e7-95ac-24dff68ddd67": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "description": null,
                    "id": "931f4b29-2dbf-78e7-95ac-24dff68ddd67",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "931f4b29-2dbf-78e7-95ac-24dff68ddd67",
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
                    "name": "Applicant",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "03283964-9f9b-a737-cbb1-7ed84bc72b66": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "description": null,
                    "id": "03283964-9f9b-a737-cbb1-7ed84bc72b66",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "03283964-9f9b-a737-cbb1-7ed84bc72b66",
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
                    "name": "Applicant",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "62d1a098-88e6-5b4d-98df-923064c3adb1": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "description": null,
                    "id": "62d1a098-88e6-5b4d-98df-923064c3adb1",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "62d1a098-88e6-5b4d-98df-923064c3adb1",
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
                    "name": "Reviewer",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "615302d8-8e3e-a938-c852-41a137fc1381": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "description": null,
                    "id": "615302d8-8e3e-a938-c852-41a137fc1381",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "615302d8-8e3e-a938-c852-41a137fc1381",
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
                    "name": "Reviewer",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "173359b3-af08-c0f8-df3e-637e5f39fb23": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "description": null,
                    "id": "173359b3-af08-c0f8-df3e-637e5f39fb23",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "173359b3-af08-c0f8-df3e-637e5f39fb23",
                        "style": "{}",
                        "width": 100,
                        "x": 475,
                        "y": 770
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "Applicant",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "87800a4c-7058-e6d4-7baf-d5dacf2745d3": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                    },
                    "description": null,
                    "id": "87800a4c-7058-e6d4-7baf-d5dacf2745d3",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "87800a4c-7058-e6d4-7baf-d5dacf2745d3",
                        "style": "{}",
                        "width": 100,
                        "x": 475,
                        "y": 900
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "Reviewer",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
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
                            "isKey": true,
                            "name": "documentId",
                            "nameCamelCase": "documentId",
                            "namePascalCase": "DocumentId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "CivilComplaintApplicationId",
                            "isCopy": false,
                            "isKey": false,
                            "name": "civilComplaintApplicationId",
                            "nameCamelCase": "civilComplaintApplicationId",
                            "namePascalCase": "CivilComplaintApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "DocumentFormat",
                            "isCopy": false,
                            "isKey": false,
                            "name": "documentFormat",
                            "nameCamelCase": "documentFormat",
                            "namePascalCase": "DocumentFormat",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "IssueStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "issueStatus",
                            "nameCamelCase": "issueStatus",
                            "namePascalCase": "IssueStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "TransmissionRecordVO",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transmissionRecord",
                            "nameCamelCase": "transmissionRecord",
                            "namePascalCase": "TransmissionRecord",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "issuedAt",
                            "nameCamelCase": "issuedAt",
                            "namePascalCase": "IssuedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "MinwonDocumentIssued",
                    "displayName": "민원문서 발급 완료",
                    "nameCamelCase": "minwonDocumentIssued",
                    "namePascalCase": "MinwonDocumentIssued",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                    },
                    "boundedContext": {
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                    }
                },
                "75f8fa95-e80d-e653-5afe-af30b2b6abc7": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "MinwonDocumentIssued"
                    ],
                    "aggregate": {
                        "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                    },
                    "controllerInfo": {
                        "method": "POST"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "CivilComplaintApplicationId",
                            "isCopy": false,
                            "isKey": false,
                            "name": "civilComplaintApplicationId",
                            "nameCamelCase": "civilComplaintApplicationId",
                            "namePascalCase": "CivilComplaintApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "DocumentFormat",
                            "isCopy": false,
                            "isKey": false,
                            "name": "documentFormat",
                            "nameCamelCase": "documentFormat",
                            "namePascalCase": "DocumentFormat",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "IssueMinwonDocument",
                    "displayName": "민원문서 발급 요청",
                    "nameCamelCase": "issueMinwonDocument",
                    "namePascalCase": "IssueMinwonDocument",
                    "namePlural": "issueMinwonDocuments",
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
                                    "name": "MinwonDocument",
                                    "value": {
                                        "documentId": "N/A",
                                        "documentFormat": "PDF",
                                        "issueStatus": "Pending",
                                        "transmissionRecord": "N/A",
                                        "documentData": "N/A",
                                        "civilComplaintApplicationId": "APPROVED-001"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "IssueMinwonDocument",
                                    "value": {
                                        "civilComplaintApplicationId": "APPROVED-001",
                                        "documentFormat": "PDF"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "MinwonDocumentIssued",
                                    "value": {
                                        "documentId": "DOC-001",
                                        "civilComplaintApplicationId": "APPROVED-001",
                                        "documentFormat": "PDF",
                                        "issueStatus": "Issued",
                                        "transmissionRecord": {
                                            "method": "Email",
                                            "sentDate": "2024-03-20T00:00:00Z"
                                        },
                                        "issuedAt": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ]
                        },
                        {
                            "given": [
                                {
                                    "type": "Aggregate",
                                    "name": "MinwonDocument",
                                    "value": {
                                        "documentId": "N/A",
                                        "documentFormat": "SpecifiedFormat",
                                        "issueStatus": "Pending",
                                        "transmissionRecord": "N/A",
                                        "documentData": "N/A",
                                        "civilComplaintApplicationId": "APPROVED-002"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "IssueMinwonDocument",
                                    "value": {
                                        "civilComplaintApplicationId": "APPROVED-002",
                                        "documentFormat": "SpecifiedFormat"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "MinwonDocumentIssued",
                                    "value": {
                                        "documentId": "DOC-002",
                                        "civilComplaintApplicationId": "APPROVED-002",
                                        "documentFormat": "SpecifiedFormat",
                                        "issueStatus": "Failed",
                                        "transmissionRecord": {
                                            "method": "N/A",
                                            "sentDate": null
                                        },
                                        "issuedAt": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "e6442477-0d7b-fdfe-1653-def2818d68e4": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "e6442477-0d7b-fdfe-1653-def2818d68e4",
                    "visibility": "public",
                    "name": "MinwonDocumentSummary",
                    "oldName": "",
                    "displayName": "민원문서 발급 상태",
                    "namePascalCase": "MinwonDocumentSummary",
                    "namePlural": "minwonDocumentSummaries",
                    "aggregate": {
                        "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
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
                            "name": "documentId",
                            "nameCamelCase": "documentId",
                            "namePascalCase": "DocumentId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "IssueStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "issueStatus",
                            "nameCamelCase": "issueStatus",
                            "namePascalCase": "IssueStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "TransmissionRecordVO",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transmissionRecord",
                            "nameCamelCase": "transmissionRecord",
                            "namePascalCase": "TransmissionRecord",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "issuedAt",
                            "nameCamelCase": "issuedAt",
                            "namePascalCase": "IssuedAt",
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
                        "id": "e6442477-0d7b-fdfe-1653-def2818d68e4",
                        "x": 1141,
                        "y": 380,
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
                "024d893a-7af4-8e32-55c3-b882ebbef679": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                    },
                    "description": null,
                    "id": "024d893a-7af4-8e32-55c3-b882ebbef679",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "024d893a-7af4-8e32-55c3-b882ebbef679",
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
                    "name": "Reviewer",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "71e75fe6-1293-65c1-b234-11d9c3dbc1dc": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                    },
                    "description": null,
                    "id": "71e75fe6-1293-65c1-b234-11d9c3dbc1dc",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "71e75fe6-1293-65c1-b234-11d9c3dbc1dc",
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
                    "name": "Reviewer",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "be82b54d-1d1b-c7c3-1072-61ac006a77e7": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                        "style": "{}",
                        "width": 100,
                        "x": 1914,
                        "y": 250,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "operationId",
                            "nameCamelCase": "operationId",
                            "namePascalCase": "OperationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "serverStatus",
                            "nameCamelCase": "serverStatus",
                            "namePascalCase": "ServerStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionLog",
                            "nameCamelCase": "transactionLog",
                            "namePascalCase": "TransactionLog",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "alertRecords",
                            "nameCamelCase": "alertRecords",
                            "namePascalCase": "AlertRecords",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "monitoredAt",
                            "nameCamelCase": "monitoredAt",
                            "namePascalCase": "MonitoredAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "SystemMonitored",
                    "displayName": "시스템 모니터링 결과 확인",
                    "nameCamelCase": "systemMonitored",
                    "namePascalCase": "SystemMonitored",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "857059f8-228a-8b17-127a-354eece4ee86"
                    },
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    }
                },
                "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                        "style": "{}",
                        "width": 100,
                        "x": 1914,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "operationId",
                            "nameCamelCase": "operationId",
                            "namePascalCase": "OperationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "FallbackStatus",
                            "isCopy": false,
                            "isKey": false,
                            "name": "fallbackStatus",
                            "nameCamelCase": "fallbackStatus",
                            "namePascalCase": "FallbackStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "failureReason",
                            "nameCamelCase": "failureReason",
                            "namePascalCase": "FailureReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "switchedAt",
                            "nameCamelCase": "switchedAt",
                            "namePascalCase": "SwitchedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BackupSwitched",
                    "displayName": "백업 로깅 시스템 전환 완료",
                    "nameCamelCase": "backupSwitched",
                    "namePascalCase": "BackupSwitched",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "857059f8-228a-8b17-127a-354eece4ee86"
                    },
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    }
                },
                "173099e3-2c6a-013a-d89d-c3fb3668f1ab": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "SystemMonitored"
                    ],
                    "aggregate": {
                        "id": "857059f8-228a-8b17-127a-354eece4ee86"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    },
                    "controllerInfo": {
                        "method": "POST"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "operationId",
                            "nameCamelCase": "operationId",
                            "namePascalCase": "OperationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                        "style": "{}",
                        "width": 100,
                        "x": 1726,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "MonitorSystem",
                    "displayName": "시스템 모니터링 호출",
                    "nameCamelCase": "monitorSystem",
                    "namePascalCase": "MonitorSystem",
                    "namePlural": "monitorSystems",
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
                                    "name": "SystemOperation",
                                    "value": {
                                        "operationId": 1001,
                                        "fallbackStatus": {
                                            "active": false,
                                            "lastSwitchedDate": null
                                        },
                                        "operationData": {
                                            "dataId": 1,
                                            "serverStatus": "OK",
                                            "transactionLog": "No issues",
                                            "alertRecords": "None"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "MonitorSystem",
                                    "value": {
                                        "operationId": 1001
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "SystemMonitored",
                                    "value": {
                                        "operationId": 1001,
                                        "serverStatus": "OK",
                                        "transactionLog": "No issues",
                                        "alertRecords": "None",
                                        "monitoredAt": "2024-03-20T12:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "e61a8b5e-75b4-8087-f67c-f248c89f5a8b": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BackupSwitched"
                    ],
                    "aggregate": {
                        "id": "857059f8-228a-8b17-127a-354eece4ee86"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    },
                    "controllerInfo": {
                        "method": "POST"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "operationId",
                            "nameCamelCase": "operationId",
                            "namePascalCase": "OperationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "failureReason",
                            "nameCamelCase": "failureReason",
                            "namePascalCase": "FailureReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "failureReason",
                            "nameCamelCase": "failureReason",
                            "namePascalCase": "FailureReason",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                        "style": "{}",
                        "width": 100,
                        "x": 1726,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "SwitchToBackup",
                    "displayName": "백업 로깅 시스템 전환",
                    "nameCamelCase": "switchToBackup",
                    "namePascalCase": "SwitchToBackup",
                    "namePlural": "switchToBackups",
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
                                    "name": "SystemOperation",
                                    "value": {
                                        "operationId": 1001,
                                        "fallbackStatus": {
                                            "active": false,
                                            "lastSwitchedDate": null
                                        },
                                        "operationData": {
                                            "dataId": 1,
                                            "serverStatus": "OK",
                                            "transactionLog": "No issues",
                                            "alertRecords": "None"
                                        }
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "SwitchToBackup",
                                    "value": {
                                        "operationId": 1001,
                                        "failureReason": "모니터링 도구 오류"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BackupSwitched",
                                    "value": {
                                        "operationId": 1001,
                                        "fallbackStatus": {
                                            "active": true,
                                            "lastSwitchedDate": "2024-03-20T12:05:00Z"
                                        },
                                        "failureReason": "모니터링 도구 오류",
                                        "switchedAt": "2024-03-20T12:05:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "e7bad477-f749-7564-2452-6e009f45db88": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "e7bad477-f749-7564-2452-6e009f45db88",
                    "visibility": "public",
                    "name": "SystemOperationDetails",
                    "oldName": "",
                    "displayName": "시스템 운영 상세 조회",
                    "namePascalCase": "SystemOperationDetails",
                    "namePlural": "systemOperationDetails",
                    "aggregate": {
                        "id": "857059f8-228a-8b17-127a-354eece4ee86"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
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
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "operationId",
                            "nameCamelCase": "operationId",
                            "namePascalCase": "OperationId",
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
                        "id": "e7bad477-f749-7564-2452-6e009f45db88",
                        "x": 1726,
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
                "a89e5e57-2b72-ab89-1ba9-d099aeae4e89": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    },
                    "description": null,
                    "id": "a89e5e57-2b72-ab89-1ba9-d099aeae4e89",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "a89e5e57-2b72-ab89-1ba9-d099aeae4e89",
                        "style": "{}",
                        "width": 100,
                        "x": 1645,
                        "y": 250
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "관리자",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "b9907810-76e7-724b-399a-020aa427efc8": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    },
                    "description": null,
                    "id": "b9907810-76e7-724b-399a-020aa427efc8",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "b9907810-76e7-724b-399a-020aa427efc8",
                        "style": "{}",
                        "width": 100,
                        "x": 1645,
                        "y": 380
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "관리자",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "cc42cc23-614f-0cf3-4979-c70511cdf33f": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                    },
                    "description": null,
                    "id": "cc42cc23-614f-0cf3-4979-c70511cdf33f",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "cc42cc23-614f-0cf3-4979-c70511cdf33f",
                        "style": "{}",
                        "width": 100,
                        "x": 1645,
                        "y": 510
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "관리자",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "c8477556-23cf-8ba5-21da-b80482dfb375": {
                    "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                    },
                    "description": "민원 신청서 승인 시, 민원문서 발급을 자동으로 시작하여 후속 처리의 일관성과 효율성을 보장하기 위함",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 1022,
                        "y": 250,
                        "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "DocumentIssuancePolicy",
                    "displayName": "문서 발급 자동화",
                    "nameCamelCase": "documentIssuancePolicy",
                    "namePascalCase": "DocumentIssuancePolicy",
                    "namePlural": "documentIssuancePolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                }
            },
            "relations": {
                "16161d8f-07da-e555-e00d-c2becdc85c0e": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "16161d8f-07da-e555-e00d-c2becdc85c0e",
                    "sourceElement": {
                        "aggregateRoot": {
                            "_type": "org.uengine.modeling.model.AggregateRoot",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": true,
                                    "name": "documentId",
                                    "nameCamelCase": "documentId",
                                    "namePascalCase": "DocumentId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "DocumentFormat",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "documentFormat",
                                    "nameCamelCase": "documentFormat",
                                    "namePascalCase": "DocumentFormat",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "IssueStatus",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "issueStatus",
                                    "nameCamelCase": "issueStatus",
                                    "namePascalCase": "IssueStatus",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "TransmissionRecordVO",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "transmissionRecord",
                                    "nameCamelCase": "transmissionRecord",
                                    "namePascalCase": "TransmissionRecord",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "DocumentData",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "documentData",
                                    "nameCamelCase": "documentData",
                                    "namePascalCase": "DocumentData",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "42e42acc-bcea-565f-6412-f36434b3fed3": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "42e42acc-bcea-565f-6412-f36434b3fed3",
                                        "name": "MinwonDocument",
                                        "namePascalCase": "MinwonDocument",
                                        "nameCamelCase": "minwonDocument",
                                        "namePlural": "MinwonDocuments",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": true,
                                                "name": "documentId",
                                                "displayName": "",
                                                "nameCamelCase": "documentId",
                                                "namePascalCase": "DocumentId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "DocumentFormat",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "documentFormat",
                                                "displayName": "",
                                                "nameCamelCase": "documentFormat",
                                                "namePascalCase": "DocumentFormat",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "IssueStatus",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "issueStatus",
                                                "displayName": "",
                                                "nameCamelCase": "issueStatus",
                                                "namePascalCase": "IssueStatus",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "TransmissionRecordVO",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "transmissionRecord",
                                                "displayName": "",
                                                "nameCamelCase": "transmissionRecord",
                                                "namePascalCase": "TransmissionRecord",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "DocumentData",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "documentData",
                                                "displayName": "",
                                                "nameCamelCase": "documentData",
                                                "namePascalCase": "DocumentData",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "42e42acc-bcea-565f-6412-f36434b3fed3",
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
                                        "parentId": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                                    },
                                    "5d63b1d9-fada-a0ca-f7e7-ec08de27e302": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "5d63b1d9-fada-a0ca-f7e7-ec08de27e302",
                                        "name": "DocumentData",
                                        "displayName": "문서데이터",
                                        "namePascalCase": "DocumentData",
                                        "nameCamelCase": "documentData",
                                        "namePlural": "documentData",
                                        "fieldDescriptors": [
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "documentDataId",
                                                "nameCamelCase": "documentDataId",
                                                "namePascalCase": "DocumentDataId",
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
                                                "name": "content",
                                                "nameCamelCase": "content",
                                                "namePascalCase": "Content",
                                                "className": "String",
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
                                            "id": "5d63b1d9-fada-a0ca-f7e7-ec08de27e302",
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
                                        "relations": [],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": false
                                    },
                                    "af1f426e-5c41-fcef-c46f-0a724172df44": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "af1f426e-5c41-fcef-c46f-0a724172df44",
                                        "name": "TransmissionRecordVO",
                                        "displayName": "전송기록",
                                        "namePascalCase": "TransmissionRecordVo",
                                        "nameCamelCase": "transmissionRecordVo",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isKey": false,
                                                "label": "- method: String",
                                                "name": "method",
                                                "nameCamelCase": "method",
                                                "namePascalCase": "Method",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            },
                                            {
                                                "className": "Date",
                                                "isKey": false,
                                                "label": "- sentDate: Date",
                                                "name": "sentDate",
                                                "nameCamelCase": "sentDate",
                                                "namePascalCase": "SentDate",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "af1f426e-5c41-fcef-c46f-0a724172df44",
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
                                        "namePlural": "TransmissionRecordVOs",
                                        "isAbstract": false,
                                        "isInterface": false
                                    },
                                    "4cb8390a-27e9-0332-aa36-e99c3c57bbae": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "4cb8390a-27e9-0332-aa36-e99c3c57bbae",
                                        "name": "DocumentFormat",
                                        "displayName": "문서형식",
                                        "nameCamelCase": "documentFormat",
                                        "namePascalCase": "DocumentFormat",
                                        "namePlural": "documentFormats",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "4cb8390a-27e9-0332-aa36-e99c3c57bbae",
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
                                                "value": "PDF"
                                            },
                                            {
                                                "value": "SpecifiedFormat"
                                            }
                                        ],
                                        "useKeyValue": false,
                                        "relations": []
                                    },
                                    "927786fa-77fa-0579-79d9-0d462e62b134": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "927786fa-77fa-0579-79d9-0d462e62b134",
                                        "name": "IssueStatus",
                                        "displayName": "발급상태",
                                        "nameCamelCase": "issueStatus",
                                        "namePascalCase": "IssueStatus",
                                        "namePlural": "issueStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "927786fa-77fa-0579-79d9-0d462e62b134",
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
                                                "value": "Issued"
                                            },
                                            {
                                                "value": "Failed"
                                            },
                                            {
                                                "value": "Pending"
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
                            "name": "03323d91-1261-f9b8-65e2-333f1a241fc0",
                            "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                        },
                        "commands": [],
                        "description": null,
                        "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                            "x": 1235,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "MinwonDocument",
                        "displayName": "민원문서",
                        "nameCamelCase": "minwonDocument",
                        "namePascalCase": "MinwonDocument",
                        "namePlural": "minwonDocuments",
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
                                    "name": "applicationId",
                                    "nameCamelCase": "applicationId",
                                    "namePascalCase": "ApplicationId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "ApplicationStatus",
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
                                    "className": "ApplicationData",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "applicationData",
                                    "nameCamelCase": "applicationData",
                                    "namePascalCase": "ApplicationData",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "4aee28d7-ebb2-c518-692e-bf4ed37a3c99": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "4aee28d7-ebb2-c518-692e-bf4ed37a3c99",
                                        "name": "CivilComplaintApplication",
                                        "namePascalCase": "CivilComplaintApplication",
                                        "nameCamelCase": "civilComplaintApplication",
                                        "namePlural": "CivilComplaintApplications",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": true,
                                                "name": "applicationId",
                                                "displayName": "",
                                                "nameCamelCase": "applicationId",
                                                "namePascalCase": "ApplicationId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "ApplicationStatus",
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
                                                "className": "ApplicationData",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "applicationData",
                                                "displayName": "",
                                                "nameCamelCase": "applicationData",
                                                "namePascalCase": "ApplicationData",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "4aee28d7-ebb2-c518-692e-bf4ed37a3c99",
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
                                        "parentId": "626b7229-4e39-028a-5f05-99bf207ed201"
                                    },
                                    "988dda2a-b1bb-5b3f-9dbf-ec28819faff6": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "988dda2a-b1bb-5b3f-9dbf-ec28819faff6",
                                        "name": "ApplicationData",
                                        "displayName": "신청서 정보",
                                        "namePascalCase": "ApplicationData",
                                        "nameCamelCase": "applicationData",
                                        "namePlural": "applicationData",
                                        "fieldDescriptors": [
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "applicationDataId",
                                                "nameCamelCase": "applicationDataId",
                                                "namePascalCase": "ApplicationDataId",
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
                                                "name": "title",
                                                "nameCamelCase": "title",
                                                "namePascalCase": "Title",
                                                "className": "String",
                                                "isKey": false,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            },
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "detail",
                                                "nameCamelCase": "detail",
                                                "namePascalCase": "Detail",
                                                "className": "String",
                                                "isKey": false,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            },
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "attachedFiles",
                                                "nameCamelCase": "attachedFiles",
                                                "namePascalCase": "AttachedFiles",
                                                "className": "String",
                                                "isKey": false,
                                                "isName": false,
                                                "isList": false,
                                                "isVO": false,
                                                "isLob": false,
                                                "isCorrelationKey": false,
                                                "displayName": ""
                                            },
                                            {
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "name": "applicantInfo",
                                                "nameCamelCase": "applicantInfo",
                                                "namePascalCase": "ApplicantInfo",
                                                "className": "String",
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
                                            "id": "988dda2a-b1bb-5b3f-9dbf-ec28819faff6",
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
                                        "relations": [],
                                        "parentOperations": [],
                                        "relationType": null,
                                        "isVO": false,
                                        "isAbstract": false,
                                        "isInterface": false,
                                        "isAggregateRoot": false
                                    },
                                    "56c3c677-d7f5-0747-3a2a-2d9964e384da": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "56c3c677-d7f5-0747-3a2a-2d9964e384da",
                                        "name": "ApplicationStatus",
                                        "displayName": "신청서 상태",
                                        "nameCamelCase": "applicationStatus",
                                        "namePascalCase": "ApplicationStatus",
                                        "namePlural": "applicationStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "56c3c677-d7f5-0747-3a2a-2d9964e384da",
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
                                                "value": "TEMPORARY"
                                            },
                                            {
                                                "value": "SUBMITTED"
                                            },
                                            {
                                                "value": "APPROVED"
                                            },
                                            {
                                                "value": "REJECTED"
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
                            "name": "1e909e6e-53f8-febb-f8e0-016837952467",
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        },
                        "commands": [],
                        "description": null,
                        "id": "626b7229-4e39-028a-5f05-99bf207ed201",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201",
                            "x": 650,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "CivilComplaintApplication",
                        "displayName": "민원신청서",
                        "nameCamelCase": "civilComplaintApplication",
                        "namePascalCase": "CivilComplaintApplication",
                        "namePlural": "civilComplaintApplications",
                        "rotateStatus": false,
                        "selected": false,
                        "_type": "org.uengine.modeling.model.Aggregate"
                    },
                    "from": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                    "to": "626b7229-4e39-028a-5f05-99bf207ed201",
                    "relationView": {
                        "id": "16161d8f-07da-e555-e00d-c2becdc85c0e",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                        "to": "626b7229-4e39-028a-5f05-99bf207ed201",
                        "needReconnect": true,
                        "value": "[[1170,456],[715,456]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "66dacbed-e343-9cd7-2dd0-db20f2a86a90",
                        "id": "16161d8f-07da-e555-e00d-c2becdc85c0e",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "626b7229-4e39-028a-5f05-99bf207ed201",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "95ae76f1-10d3-d643-a704-fe774e680ecc": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "95ae76f1-10d3-d643-a704-fe774e680ecc",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "CivilComplaintApplicationCreated"
                        ],
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
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
                                "name": "detail",
                                "nameCamelCase": "detail",
                                "namePascalCase": "Detail",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "attachedFiles",
                                "nameCamelCase": "attachedFiles",
                                "namePascalCase": "AttachedFiles",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicantInfo",
                                "nameCamelCase": "applicantInfo",
                                "namePascalCase": "ApplicantInfo",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "CreateCivilComplaintApplication",
                        "displayName": "신규 민원 신청서 생성",
                        "nameCamelCase": "createCivilComplaintApplication",
                        "namePascalCase": "CreateCivilComplaintApplication",
                        "namePlural": "createCivilComplaintApplications",
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
                        "id": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
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
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
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
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "detail",
                                "nameCamelCase": "detail",
                                "namePascalCase": "Detail",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "attachedFiles",
                                "nameCamelCase": "attachedFiles",
                                "namePascalCase": "AttachedFiles",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicantInfo",
                                "nameCamelCase": "applicantInfo",
                                "namePascalCase": "ApplicantInfo",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "ApplicationStatus",
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
                            "id": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "CivilComplaintApplicationCreated",
                        "displayName": "민원 신청서 임시 저장 완료",
                        "nameCamelCase": "civilComplaintApplicationCreated",
                        "namePascalCase": "CivilComplaintApplicationCreated",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        }
                    },
                    "from": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                    "to": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
                    "relationView": {
                        "id": "95ae76f1-10d3-d643-a704-fe774e680ecc",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                        "to": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
                        "needReconnect": true,
                        "value": "[[606,252],[694,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "30a5302a-47fa-1359-ef3c-530be470a9ad",
                        "id": "95ae76f1-10d3-d643-a704-fe774e680ecc",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "66f3458b-5642-0fcb-b29b-ebe3befd6d33",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "08503850-8345-7ed9-577e-3e577423bcaf": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "08503850-8345-7ed9-577e-3e577423bcaf",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "CivilComplaintApplicationSubmitted"
                        ],
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        },
                        "controllerInfo": {
                            "method": "PUT"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "SubmitCivilComplaintApplication",
                        "displayName": "민원 신청서 제출",
                        "nameCamelCase": "submitCivilComplaintApplication",
                        "namePascalCase": "SubmitCivilComplaintApplication",
                        "namePlural": "submitCivilComplaintApplications",
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
                        "id": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                            "style": "{}",
                            "width": 100,
                            "x": 744,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "submittedAt",
                                "nameCamelCase": "submittedAt",
                                "namePascalCase": "SubmittedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "CivilComplaintApplicationSubmitted",
                        "displayName": "민원 신청서 제출 완료",
                        "nameCamelCase": "civilComplaintApplicationSubmitted",
                        "namePascalCase": "CivilComplaintApplicationSubmitted",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        }
                    },
                    "from": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                    "to": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                    "relationView": {
                        "id": "08503850-8345-7ed9-577e-3e577423bcaf",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                        "to": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                        "needReconnect": true,
                        "value": "[[606,380],[694,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "fa84a2f3-3fd2-fcd6-d045-f39cf6024bc3",
                        "id": "08503850-8345-7ed9-577e-3e577423bcaf",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "f29c3838-ea28-5652-c1f1-cf692b607ab0",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "b37c8054-7490-cdb8-cf73-deb594963de3": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "b37c8054-7490-cdb8-cf73-deb594963de3",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "CivilComplaintApplicationApproved"
                        ],
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        },
                        "controllerInfo": {
                            "method": "PUT"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "162056e1-3668-2d15-3622-74cba332f2b8",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "162056e1-3668-2d15-3622-74cba332f2b8",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 510,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "162056e1-3668-2d15-3622-74cba332f2b8",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ApproveCivilComplaintApplication",
                        "displayName": "민원 신청서 승인",
                        "nameCamelCase": "approveCivilComplaintApplication",
                        "namePascalCase": "ApproveCivilComplaintApplication",
                        "namePlural": "approveCivilComplaintApplications",
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
                        "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                            "style": "{}",
                            "width": 100,
                            "x": 744,
                            "y": 510,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "approvedAt",
                                "nameCamelCase": "approvedAt",
                                "namePascalCase": "ApprovedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "CivilComplaintApplicationApproved",
                        "displayName": "민원 신청서 승인 완료",
                        "nameCamelCase": "civilComplaintApplicationApproved",
                        "namePascalCase": "CivilComplaintApplicationApproved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        }
                    },
                    "from": "162056e1-3668-2d15-3622-74cba332f2b8",
                    "to": "bc5229a7-862e-d110-8cbc-09473b572133",
                    "relationView": {
                        "id": "b37c8054-7490-cdb8-cf73-deb594963de3",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "162056e1-3668-2d15-3622-74cba332f2b8",
                        "to": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "needReconnect": true,
                        "value": "[[606,512],[694,512]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "162056e1-3668-2d15-3622-74cba332f2b8",
                        "id": "b37c8054-7490-cdb8-cf73-deb594963de3",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "66a6f2ee-2c86-69be-3619-35ef125a963a": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "66a6f2ee-2c86-69be-3619-35ef125a963a",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "CivilComplaintApplicationRejected"
                        ],
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        },
                        "controllerInfo": {
                            "method": "PUT"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "rejectionReason",
                                "nameCamelCase": "rejectionReason",
                                "namePascalCase": "RejectionReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 640,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "RejectCivilComplaintApplication",
                        "displayName": "민원 신청서 반려",
                        "nameCamelCase": "rejectCivilComplaintApplication",
                        "namePascalCase": "RejectCivilComplaintApplication",
                        "namePlural": "rejectCivilComplaintApplications",
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
                        "id": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                            "style": "{}",
                            "width": 100,
                            "x": 744,
                            "y": 640,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "rejectionReason",
                                "nameCamelCase": "rejectionReason",
                                "namePascalCase": "RejectionReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "rejectedAt",
                                "nameCamelCase": "rejectedAt",
                                "namePascalCase": "RejectedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "CivilComplaintApplicationRejected",
                        "displayName": "민원 신청서 반려 완료",
                        "nameCamelCase": "civilComplaintApplicationRejected",
                        "namePascalCase": "CivilComplaintApplicationRejected",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        }
                    },
                    "from": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                    "to": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                    "relationView": {
                        "id": "66a6f2ee-2c86-69be-3619-35ef125a963a",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                        "to": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                        "needReconnect": true,
                        "value": "[[606,640],[694,640]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "c5b36c63-3d6c-b6d8-fab5-1b633c05f1da",
                        "id": "66a6f2ee-2c86-69be-3619-35ef125a963a",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "76b52ff8-08f2-4639-5353-53dc2421a6c8",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "fdad08df-01e7-43ee-4d21-6db80befae58": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "fdad08df-01e7-43ee-4d21-6db80befae58",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "MinwonDocumentIssued"
                        ],
                        "aggregate": {
                            "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "CivilComplaintApplicationId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "civilComplaintApplicationId",
                                "nameCamelCase": "civilComplaintApplicationId",
                                "namePascalCase": "CivilComplaintApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "documentFormat",
                                "nameCamelCase": "documentFormat",
                                "namePascalCase": "DocumentFormat",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "IssueMinwonDocument",
                        "displayName": "민원문서 발급 요청",
                        "nameCamelCase": "issueMinwonDocument",
                        "namePascalCase": "IssueMinwonDocument",
                        "namePlural": "issueMinwonDocuments",
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
                        "id": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
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
                                "isKey": true,
                                "name": "documentId",
                                "nameCamelCase": "documentId",
                                "namePascalCase": "DocumentId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "CivilComplaintApplicationId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "civilComplaintApplicationId",
                                "nameCamelCase": "civilComplaintApplicationId",
                                "namePascalCase": "CivilComplaintApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "documentFormat",
                                "nameCamelCase": "documentFormat",
                                "namePascalCase": "DocumentFormat",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "IssueStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "issueStatus",
                                "nameCamelCase": "issueStatus",
                                "namePascalCase": "IssueStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "TransmissionRecordVO",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transmissionRecord",
                                "nameCamelCase": "transmissionRecord",
                                "namePascalCase": "TransmissionRecord",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "issuedAt",
                                "nameCamelCase": "issuedAt",
                                "namePascalCase": "IssuedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "MinwonDocumentIssued",
                        "displayName": "민원문서 발급 완료",
                        "nameCamelCase": "minwonDocumentIssued",
                        "namePascalCase": "MinwonDocumentIssued",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                        },
                        "boundedContext": {
                            "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                        }
                    },
                    "from": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                    "to": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
                    "relationView": {
                        "id": "fdad08df-01e7-43ee-4d21-6db80befae58",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                        "to": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
                        "needReconnect": true,
                        "value": "[[1191,252],[1279,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                        "id": "fdad08df-01e7-43ee-4d21-6db80befae58",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "94c1991e-6b7c-f5de-70cb-ae0a75ef09ab",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "d62aecdc-5373-8b5e-379b-dd9a3cffc253": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "d62aecdc-5373-8b5e-379b-dd9a3cffc253",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "SystemMonitored"
                        ],
                        "aggregate": {
                            "id": "857059f8-228a-8b17-127a-354eece4ee86"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "operationId",
                                "nameCamelCase": "operationId",
                                "namePascalCase": "OperationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                            "style": "{}",
                            "width": 100,
                            "x": 1726,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "MonitorSystem",
                        "displayName": "시스템 모니터링 호출",
                        "nameCamelCase": "monitorSystem",
                        "namePascalCase": "MonitorSystem",
                        "namePlural": "monitorSystems",
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
                        "id": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                            "style": "{}",
                            "width": 100,
                            "x": 1914,
                            "y": 250,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "operationId",
                                "nameCamelCase": "operationId",
                                "namePascalCase": "OperationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "serverStatus",
                                "nameCamelCase": "serverStatus",
                                "namePascalCase": "ServerStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionLog",
                                "nameCamelCase": "transactionLog",
                                "namePascalCase": "TransactionLog",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "alertRecords",
                                "nameCamelCase": "alertRecords",
                                "namePascalCase": "AlertRecords",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "monitoredAt",
                                "nameCamelCase": "monitoredAt",
                                "namePascalCase": "MonitoredAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "SystemMonitored",
                        "displayName": "시스템 모니터링 결과 확인",
                        "nameCamelCase": "systemMonitored",
                        "namePascalCase": "SystemMonitored",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "857059f8-228a-8b17-127a-354eece4ee86"
                        },
                        "boundedContext": {
                            "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                        }
                    },
                    "from": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                    "to": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                    "relationView": {
                        "id": "d62aecdc-5373-8b5e-379b-dd9a3cffc253",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                        "to": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                        "needReconnect": true,
                        "value": "[[1776,252],[1864,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "173099e3-2c6a-013a-d89d-c3fb3668f1ab",
                        "id": "d62aecdc-5373-8b5e-379b-dd9a3cffc253",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "be82b54d-1d1b-c7c3-1072-61ac006a77e7",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "7c2df6ef-60bf-90fb-9347-502ad4c4da48": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "7c2df6ef-60bf-90fb-9347-502ad4c4da48",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BackupSwitched"
                        ],
                        "aggregate": {
                            "id": "857059f8-228a-8b17-127a-354eece4ee86"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "operationId",
                                "nameCamelCase": "operationId",
                                "namePascalCase": "OperationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "failureReason",
                                "nameCamelCase": "failureReason",
                                "namePascalCase": "FailureReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "failureReason",
                                "nameCamelCase": "failureReason",
                                "namePascalCase": "FailureReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                            "style": "{}",
                            "width": 100,
                            "x": 1726,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "SwitchToBackup",
                        "displayName": "백업 로깅 시스템 전환",
                        "nameCamelCase": "switchToBackup",
                        "namePascalCase": "SwitchToBackup",
                        "namePlural": "switchToBackups",
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
                        "id": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                            "style": "{}",
                            "width": 100,
                            "x": 1914,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "operationId",
                                "nameCamelCase": "operationId",
                                "namePascalCase": "OperationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "FallbackStatus",
                                "isCopy": false,
                                "isKey": false,
                                "name": "fallbackStatus",
                                "nameCamelCase": "fallbackStatus",
                                "namePascalCase": "FallbackStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "failureReason",
                                "nameCamelCase": "failureReason",
                                "namePascalCase": "FailureReason",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "switchedAt",
                                "nameCamelCase": "switchedAt",
                                "namePascalCase": "SwitchedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BackupSwitched",
                        "displayName": "백업 로깅 시스템 전환 완료",
                        "nameCamelCase": "backupSwitched",
                        "namePascalCase": "BackupSwitched",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "857059f8-228a-8b17-127a-354eece4ee86"
                        },
                        "boundedContext": {
                            "id": "f0a567cc-2b73-509f-37cb-24dde03e0d76"
                        }
                    },
                    "from": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                    "to": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                    "relationView": {
                        "id": "7c2df6ef-60bf-90fb-9347-502ad4c4da48",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                        "to": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                        "needReconnect": true,
                        "value": "[[1776,380],[1864,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "e61a8b5e-75b4-8087-f67c-f248c89f5a8b",
                        "id": "7c2df6ef-60bf-90fb-9347-502ad4c4da48",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "8694fbe0-4ea2-32bc-a86e-b8a03dd5f8ef",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "154dd8f5-55a9-7b96-d905-51583ee01741": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "154dd8f5-55a9-7b96-d905-51583ee01741",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                            "style": "{}",
                            "width": 100,
                            "x": 744,
                            "y": 510,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "approvedAt",
                                "nameCamelCase": "approvedAt",
                                "namePascalCase": "ApprovedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "bc5229a7-862e-d110-8cbc-09473b572133",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "CivilComplaintApplicationApproved",
                        "displayName": "민원 신청서 승인 완료",
                        "nameCamelCase": "civilComplaintApplicationApproved",
                        "namePascalCase": "CivilComplaintApplicationApproved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "626b7229-4e39-028a-5f05-99bf207ed201"
                        },
                        "boundedContext": {
                            "id": "1e909e6e-53f8-febb-f8e0-016837952467"
                        }
                    },
                    "targetElement": {
                        "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                        },
                        "description": "민원 신청서 승인 시, 민원문서 발급을 자동으로 시작하여 후속 처리의 일관성과 효율성을 보장하기 위함",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1022,
                            "y": 250,
                            "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "DocumentIssuancePolicy",
                        "displayName": "문서 발급 자동화",
                        "nameCamelCase": "documentIssuancePolicy",
                        "namePascalCase": "DocumentIssuancePolicy",
                        "namePlural": "documentIssuancePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "bc5229a7-862e-d110-8cbc-09473b572133",
                    "to": "c8477556-23cf-8ba5-21da-b80482dfb375",
                    "relationView": {
                        "id": "154dd8f5-55a9-7b96-d905-51583ee01741",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "to": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "needReconnect": true,
                        "value": "[[794,512],[884,512],[884,252],[972,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "bc5229a7-862e-d110-8cbc-09473b572133",
                        "id": "154dd8f5-55a9-7b96-d905-51583ee01741",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "48faa5aa-f6e4-006f-b5bf-9002e5ec00c2": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "48faa5aa-f6e4-006f-b5bf-9002e5ec00c2",
                    "sourceElement": {
                        "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                        },
                        "description": "민원 신청서 승인 시, 민원문서 발급을 자동으로 시작하여 후속 처리의 일관성과 효율성을 보장하기 위함",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1022,
                            "y": 250,
                            "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "c8477556-23cf-8ba5-21da-b80482dfb375",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "DocumentIssuancePolicy",
                        "displayName": "문서 발급 자동화",
                        "nameCamelCase": "documentIssuancePolicy",
                        "namePascalCase": "DocumentIssuancePolicy",
                        "namePlural": "documentIssuancePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "MinwonDocumentIssued"
                        ],
                        "aggregate": {
                            "id": "66dacbed-e343-9cd7-2dd0-db20f2a86a90"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "03323d91-1261-f9b8-65e2-333f1a241fc0"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "CivilComplaintApplicationId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "civilComplaintApplicationId",
                                "nameCamelCase": "civilComplaintApplicationId",
                                "namePascalCase": "CivilComplaintApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "documentFormat",
                                "nameCamelCase": "documentFormat",
                                "namePascalCase": "DocumentFormat",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "IssueMinwonDocument",
                        "displayName": "민원문서 발급 요청",
                        "nameCamelCase": "issueMinwonDocument",
                        "namePascalCase": "IssueMinwonDocument",
                        "namePlural": "issueMinwonDocuments",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "POST"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "c8477556-23cf-8ba5-21da-b80482dfb375",
                    "to": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                    "relationView": {
                        "id": "48faa5aa-f6e4-006f-b5bf-9002e5ec00c2",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "to": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
                        "needReconnect": true,
                        "value": "[[1072,252],[1091,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "c8477556-23cf-8ba5-21da-b80482dfb375",
                        "id": "48faa5aa-f6e4-006f-b5bf-9002e5ec00c2",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "75f8fa95-e80d-e653-5afe-af30b2b6abc7",
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
                    "b99b550f-fe8a-7223-06bf-c5902ee5a51e": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "b99b550f-fe8a-7223-06bf-c5902ee5a51e",
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
                                "name": "applicationmanagement",
                                "labels": {
                                    "app": "applicationmanagement"
                                },
                                "annotations": {
                                    "msaez.io/x": "151"
                                }
                            },
                            "spec": {
                                "selector": {
                                    "matchLabels": {
                                        "app": "applicationmanagement"
                                    }
                                },
                                "replicas": 1,
                                "template": {
                                    "metadata": {
                                        "labels": {
                                            "app": "applicationmanagement"
                                        }
                                    },
                                    "spec": {
                                        "containers": [
                                            {
                                                "name": "applicationmanagement",
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
                    "936afaff-5ecc-675b-35b4-c18e2a1e49c2": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "936afaff-5ecc-675b-35b4-c18e2a1e49c2",
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
                                "name": "applicationmanagement",
                                "labels": {
                                    "app": "applicationmanagement"
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
                                    "app": "applicationmanagement"
                                }
                            }
                        },
                        "outboundDeployment": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "b99b550f-fe8a-7223-06bf-c5902ee5a51e",
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
                                    "name": "applicationmanagement",
                                    "labels": {
                                        "app": "applicationmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "151"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "applicationmanagement"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "applicationmanagement"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "applicationmanagement",
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
                    "f1b2ca02-8b49-31d9-f5b5-6d3adcabf7cc": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "f1b2ca02-8b49-31d9-f5b5-6d3adcabf7cc",
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
                                "name": "documentissuance",
                                "labels": {
                                    "app": "documentissuance"
                                },
                                "annotations": {
                                    "msaez.io/x": "351"
                                }
                            },
                            "spec": {
                                "selector": {
                                    "matchLabels": {
                                        "app": "documentissuance"
                                    }
                                },
                                "replicas": 1,
                                "template": {
                                    "metadata": {
                                        "labels": {
                                            "app": "documentissuance"
                                        }
                                    },
                                    "spec": {
                                        "containers": [
                                            {
                                                "name": "documentissuance",
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
                    "aa7cafa6-f251-83b0-48b4-acaecee553f8": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "aa7cafa6-f251-83b0-48b4-acaecee553f8",
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
                                "name": "documentissuance",
                                "labels": {
                                    "app": "documentissuance"
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
                                    "app": "documentissuance"
                                }
                            }
                        },
                        "outboundDeployment": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "f1b2ca02-8b49-31d9-f5b5-6d3adcabf7cc",
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
                                    "name": "documentissuance",
                                    "labels": {
                                        "app": "documentissuance"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "351"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "documentissuance"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "documentissuance"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "documentissuance",
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
                    "b497c682-b28b-cbf9-a6b4-12941eb94834": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "b497c682-b28b-cbf9-a6b4-12941eb94834",
                            "x": 551,
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
                                "name": "systemoperations",
                                "labels": {
                                    "app": "systemoperations"
                                },
                                "annotations": {
                                    "msaez.io/x": "551"
                                }
                            },
                            "spec": {
                                "selector": {
                                    "matchLabels": {
                                        "app": "systemoperations"
                                    }
                                },
                                "replicas": 1,
                                "template": {
                                    "metadata": {
                                        "labels": {
                                            "app": "systemoperations"
                                        }
                                    },
                                    "spec": {
                                        "containers": [
                                            {
                                                "name": "systemoperations",
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
                    "15d08ae0-664f-9ad7-b068-f572de13603f": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "15d08ae0-664f-9ad7-b068-f572de13603f",
                            "x": 551,
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
                                "name": "systemoperations",
                                "labels": {
                                    "app": "systemoperations"
                                },
                                "annotations": {
                                    "msaez.io/x": "551"
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
                                    "app": "systemoperations"
                                }
                            }
                        },
                        "outboundDeployment": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "b497c682-b28b-cbf9-a6b4-12941eb94834",
                                "x": 551,
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
                                    "name": "systemoperations",
                                    "labels": {
                                        "app": "systemoperations"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "551"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "systemoperations"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "systemoperations"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "systemoperations",
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
                    "4ffa1348-9a8f-bdc4-2d7c-f85383206989": {
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
                                "id": "936afaff-5ecc-675b-35b4-c18e2a1e49c2",
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
                                    "name": "applicationmanagement",
                                    "labels": {
                                        "app": "applicationmanagement"
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
                                        "app": "applicationmanagement"
                                    }
                                }
                            },
                            "outboundDeployment": {
                                "_type": "Deployment",
                                "name": "",
                                "namespace": "",
                                "elementView": {
                                    "_type": "Deployment",
                                    "id": "b99b550f-fe8a-7223-06bf-c5902ee5a51e",
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
                                        "name": "applicationmanagement",
                                        "labels": {
                                            "app": "applicationmanagement"
                                        },
                                        "annotations": {
                                            "msaez.io/x": "151"
                                        }
                                    },
                                    "spec": {
                                        "selector": {
                                            "matchLabels": {
                                                "app": "applicationmanagement"
                                            }
                                        },
                                        "replicas": 1,
                                        "template": {
                                            "metadata": {
                                                "labels": {
                                                    "app": "applicationmanagement"
                                                }
                                            },
                                            "spec": {
                                                "containers": [
                                                    {
                                                        "name": "applicationmanagement",
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
                                "id": "b99b550f-fe8a-7223-06bf-c5902ee5a51e",
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
                                    "name": "applicationmanagement",
                                    "labels": {
                                        "app": "applicationmanagement"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "151"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "applicationmanagement"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "applicationmanagement"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "applicationmanagement",
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
                        "from": "936afaff-5ecc-675b-35b4-c18e2a1e49c2",
                        "to": "b99b550f-fe8a-7223-06bf-c5902ee5a51e",
                        "relationView": {
                            "id": "4ffa1348-9a8f-bdc4-2d7c-f85383206989",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[152,250],[152,350]]",
                            "from": "936afaff-5ecc-675b-35b4-c18e2a1e49c2",
                            "to": "b99b550f-fe8a-7223-06bf-c5902ee5a51e",
                            "needReconnect": true
                        },
                        "sourceMultiplicity": 3,
                        "targetMultiplicity": 3,
                        "style": {}
                    },
                    "29718b80-a201-bdef-b7be-6ebac6f9b832": {
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
                                "id": "aa7cafa6-f251-83b0-48b4-acaecee553f8",
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
                                    "name": "documentissuance",
                                    "labels": {
                                        "app": "documentissuance"
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
                                        "app": "documentissuance"
                                    }
                                }
                            },
                            "outboundDeployment": {
                                "_type": "Deployment",
                                "name": "",
                                "namespace": "",
                                "elementView": {
                                    "_type": "Deployment",
                                    "id": "f1b2ca02-8b49-31d9-f5b5-6d3adcabf7cc",
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
                                        "name": "documentissuance",
                                        "labels": {
                                            "app": "documentissuance"
                                        },
                                        "annotations": {
                                            "msaez.io/x": "351"
                                        }
                                    },
                                    "spec": {
                                        "selector": {
                                            "matchLabels": {
                                                "app": "documentissuance"
                                            }
                                        },
                                        "replicas": 1,
                                        "template": {
                                            "metadata": {
                                                "labels": {
                                                    "app": "documentissuance"
                                                }
                                            },
                                            "spec": {
                                                "containers": [
                                                    {
                                                        "name": "documentissuance",
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
                                "id": "f1b2ca02-8b49-31d9-f5b5-6d3adcabf7cc",
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
                                    "name": "documentissuance",
                                    "labels": {
                                        "app": "documentissuance"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "351"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "documentissuance"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "documentissuance"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "documentissuance",
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
                        "from": "aa7cafa6-f251-83b0-48b4-acaecee553f8",
                        "to": "f1b2ca02-8b49-31d9-f5b5-6d3adcabf7cc",
                        "relationView": {
                            "id": "29718b80-a201-bdef-b7be-6ebac6f9b832",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[352,250],[352,350]]",
                            "from": "aa7cafa6-f251-83b0-48b4-acaecee553f8",
                            "to": "f1b2ca02-8b49-31d9-f5b5-6d3adcabf7cc",
                            "needReconnect": true
                        },
                        "sourceMultiplicity": 3,
                        "targetMultiplicity": 3,
                        "style": {}
                    },
                    "bd80e5eb-dc45-4530-481d-d69d75696019": {
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
                                "id": "15d08ae0-664f-9ad7-b068-f572de13603f",
                                "x": 551,
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
                                    "name": "systemoperations",
                                    "labels": {
                                        "app": "systemoperations"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "551"
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
                                        "app": "systemoperations"
                                    }
                                }
                            },
                            "outboundDeployment": {
                                "_type": "Deployment",
                                "name": "",
                                "namespace": "",
                                "elementView": {
                                    "_type": "Deployment",
                                    "id": "b497c682-b28b-cbf9-a6b4-12941eb94834",
                                    "x": 551,
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
                                        "name": "systemoperations",
                                        "labels": {
                                            "app": "systemoperations"
                                        },
                                        "annotations": {
                                            "msaez.io/x": "551"
                                        }
                                    },
                                    "spec": {
                                        "selector": {
                                            "matchLabels": {
                                                "app": "systemoperations"
                                            }
                                        },
                                        "replicas": 1,
                                        "template": {
                                            "metadata": {
                                                "labels": {
                                                    "app": "systemoperations"
                                                }
                                            },
                                            "spec": {
                                                "containers": [
                                                    {
                                                        "name": "systemoperations",
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
                                "id": "b497c682-b28b-cbf9-a6b4-12941eb94834",
                                "x": 551,
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
                                    "name": "systemoperations",
                                    "labels": {
                                        "app": "systemoperations"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "551"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "systemoperations"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "systemoperations"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "systemoperations",
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
                        "from": "15d08ae0-664f-9ad7-b068-f572de13603f",
                        "to": "b497c682-b28b-cbf9-a6b4-12941eb94834",
                        "relationView": {
                            "id": "bd80e5eb-dc45-4530-481d-d69d75696019",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[552,250],[552,350]]",
                            "from": "15d08ae0-664f-9ad7-b068-f572de13603f",
                            "to": "b497c682-b28b-cbf9-a6b4-12941eb94834",
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