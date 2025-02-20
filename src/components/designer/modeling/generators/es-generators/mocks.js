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
                            "name": "ApplicationForm",
                            "alias": "민원 신청서"
                        },
                        "enumerations": [
                            {
                                "name": "ApplicationStatus",
                                "alias": "신청서 상태"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "ApplicationReviewReference",
                                "alias": "민원 신청서 검토 참조",
                                "referencedAggregate": {
                                    "name": "ApplicationReview",
                                    "alias": "민원 신청서 검토"
                                }
                            },
                            {
                                "name": "DocumentReference",
                                "alias": "민원 문서 참조",
                                "referencedAggregate": {
                                    "name": "Document",
                                    "alias": "민원 문서"
                                }
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "매우 높음: 단일 Aggregate 내에서 임시저장 및 제출 로직을 모두 관리하여 도메인 일관성이 유지됨.",
                    "coupling": "매우 낮음: 외부 Aggregate에 대한 참조는 ValueObject 형태로 외부와 독립적으로 유지됨.",
                    "consistency": "매우 높음: 모든 트랜잭션이 단일 Aggregate 내에서 처리되어 일관성이 보장됨.",
                    "encapsulation": "높음: 도메인 내부의 상태 변화와 규칙이 명확하게 캡술화됨.",
                    "complexity": "낮음: 시스템 전체가 단일 Aggregate로 단순화되어 관리하기 쉬움.",
                    "independence": "높음: 모든 관련 로직이 한곳에 집중되어 독립적인 운영이 가능함.",
                    "performance": "높음: 단일 Aggregate 접근으로 인한 연산 효율성이 좋음."
                },
                "cons": {
                    "cohesion": "중간: 임시 저장과 제출 프로세스가 하나의 Aggregate에 포함되어 경우에 따라 복잡도가 증가할 수 있음.",
                    "coupling": "낮음: 다만, 단일 Aggregate의 변화가 전체 프로세스에 영향을 줄 수 있음.",
                    "consistency": "중간: Aggregate 크기가 커질 경우 응답시간에 영향을 줄 가능성 있음.",
                    "encapsulation": "중간: 여러 역할을 수행하는 만큼 내부 경계 관리는 주의가 필요함.",
                    "complexity": "낮음: 단일 Aggregate 설계로 복잡도는 낮으나 다양한 상태 관리가 필요함.",
                    "independence": "높음: 하나의 Aggregate로 전체 프로세스를 관리하지만 역할 구분이 다소 모호할 수 있음.",
                    "performance": "높음: 단일 데이터 접근으로 빠른 성능을 기대할 수 있음."
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-001: 민원 신청서 작성]\\n• 액터: 민원 신청자\\n• 목적: 사용자가 간편하게 민원 신청서를 작성하여 필요한 정보를 입력한다.\\n• 전제조건:\\n  - 민원 신청자가 시스템에 로그인(인증) 완료되어 있어야 함.\\n  - 필요한 개인정보 및 민원 관련 정보(예: 주민등록번호, 주소 등)가 준비되어 있음.\\n• 기본 흐름:\\n  1. 민원 신청자는 UI 화면에서 \\\"newApplication\\\" 폼을 호출한다.\\n  2. 사용자는 신청서 항목(예: 제목, 상세내용, 첨부파일 등)을 입력한다.\\n  3. UI는 \\\"validateInput\\\" 함수를 통해 입력값의 유효성 검사를 수행한다.\\n  4. 입력값이 유효하면, 데이터가 백엔드 데이터베이스로 전송된다.\\n  5. 시스템은 신청서 임시저장(success message)을 사용자에게 반환한다.\\n• 예외 흐름:\\n  - 입력값 검증 실패 시 → 오류 메시지를 출력하고, 수정 후 재입력을 요청.\"},{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-002: 민원 신청서 제출]\\n• 액터: 민원 신청자\\n• 목적: 작성 완료된 민원 신청서를 최종 제출하여 민원 담당자가 검토할 수 있도록 한다.\\n• 전제조건:\\n  - UC-001을 통해 작성된 신청서가 존재함.\\n  - 신청서 데이터가 임시 저장된 상태임.\\n• 기본 흐름:\\n  1. 민원 신청자는 임시 저장된 신청서를 불러온 후, \\\"submitApplication\\\" 함수를 호출한다.\\n  2. 시스템은 신청서의 필수 항목들을 재검증 후 제증명 처리 대기 상태로 변경한다.\\n  3. 제출 완료 메시지를 사용자에게 반환한다.\\n• 예외 흐름:\\n  - 필수 정보 미입력 시 → 제출 불가 메시지 출력 및 수정 유도.\"}]",
                    "id": "af1cc5ab-8a10-648b-d119-90a732415c27",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27",
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
                    "definitionId": "c53ab2766ab59bcc80c6ef8982e01cc6",
                    "selected": false
                },
                "description": "{\"userStories\":[{\"title\":\"유스케이스 UC-001: 민원 신청서 작성\",\"description\":\"민원 신청자는 시스템에 로그인한 후, newApplication 폼을 호출하여 제목, 상세내용, 첨부파일 및 필수 개인정보(주민등록번호, 주소 등)를 입력하고 임시 저장을 수행한다.\",\"acceptance\":[\"사용자는 시스템에 로그인되어 있어야 한다.\",\"newApplication 폼을 호출하면 신청서 작성 UI가 표시된다.\",\"validateInput 함수를 통해 입력값의 유효성이 검사된다.\",\"모든 필수 입력 항목이 입력될 경우 임시저장이 가능하다.\",\"입력값 검증 실패 시 오류 메시지가 출력된다.\"]},{\"title\":\"유스케이스 UC-002: 민원 신청서 제출\",\"description\":\"민원 신청자는 임시 저장된 신청서를 불러와 submitApplication 함수를 호출하여 최종 제출을 진행하며, 시스템은 재검증 후 신청서를 제출 상태(제증명 처리 대기)로 전환한다.\",\"acceptance\":[\"임시 저장된 신청서가 존재해야 한다.\",\"필수 항목에 대한 재검증이 수행된다.\",\"submitApplication 호출 후 신청서의 상태가 제출 대기 상태로 변경된다.\",\"필수 정보 미입력 시 제출이 불가하고, 수정이 유도된다.\"]}],\"entities\":{\"Application\":{\"properties\":[{\"name\":\"applicationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"detail\",\"type\":\"String\",\"required\":true},{\"name\":\"attachment\",\"type\":\"String\"},{\"name\":\"residentRegistrationNumber\",\"type\":\"String\",\"required\":true},{\"name\":\"address\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"Draft\",\"PendingReview\"]}]}},\"businessRules\":[{\"name\":\"로그인 전제조건\",\"description\":\"민원 신청자는 시스템에 로그인(인증)되어 있어야 민원 신청서를 작성할 수 있다.\"},{\"name\":\"입력값 유효성 검증\",\"description\":\"validateInput 함수를 통해 모든 입력 데이터의 형식과 필수 항목 유무가 검증되어야 하며, 검증 실패 시 오류 메시지를 제공한다.\"},{\"name\":\"필수 항목 확인\",\"description\":\"민원 신청서 작성 시 제목, 상세내용, 주민등록번호, 주소 등 필수 정보가 모두 제공되어야만 임시 저장 또는 최종 제출이 가능하다.\"},{\"name\":\"재검증 규칙\",\"description\":\"신청서 제출 시 submitApplication 함수로 호출되기 전에 필수 항목들이 재검증되어야 하며, 누락된 정보가 있을 경우 제출이 제한된다.\"}],\"interfaces\":{\"newApplication\":{\"sections\":[{\"name\":\"신청서 작성\",\"type\":\"form\",\"fields\":[{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"detail\",\"type\":\"textarea\",\"required\":true},{\"name\":\"attachment\",\"type\":\"file\"},{\"name\":\"residentRegistrationNumber\",\"type\":\"text\",\"required\":true},{\"name\":\"address\",\"type\":\"text\",\"required\":true}],\"actions\":[\"validateInput\",\"temporarySave\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]},\"submitApplication\":{\"sections\":[{\"name\":\"신청서 검토 및 제출\",\"type\":\"form\",\"fields\":[{\"name\":\"applicationId\",\"type\":\"text\",\"required\":true},{\"name\":\"title\",\"type\":\"text\",\"required\":true},{\"name\":\"detail\",\"type\":\"textarea\",\"required\":true},{\"name\":\"attachment\",\"type\":\"file\"},{\"name\":\"residentRegistrationNumber\",\"type\":\"text\",\"required\":true},{\"name\":\"address\",\"type\":\"text\",\"required\":true},{\"name\":\"status\",\"type\":\"select\",\"required\":true}],\"actions\":[\"submitApplication\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]}}}"
            },
            "ApplicationProcessing": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "ApplicationReview",
                            "alias": "민원 신청서 검토"
                        },
                        "enumerations": [
                            {
                                "name": "ApplicationStatus",
                                "alias": "신청서 상태"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "ApplicationFormReference",
                                "alias": "민원 신청서 참조",
                                "referencedAggregate": {
                                    "name": "ApplicationForm",
                                    "alias": "민원 신청서"
                                }
                            }
                        ]
                    },
                    {
                        "aggregate": {
                            "name": "Document",
                            "alias": "민원 문서"
                        },
                        "enumerations": [
                            {
                                "name": "DocumentFormat",
                                "alias": "문서 포맷"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "ApplicationReviewReference",
                                "alias": "민원 신청서 검토 참조",
                                "referencedAggregate": {
                                    "name": "ApplicationReview",
                                    "alias": "민원 신청서 검토"
                                }
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "집계별 역할이 명확하여 관련 로직이 집중됨",
                    "coupling": "필요한 참조만 존재하여 다른 시스템과의 결합도가 낮음",
                    "consistency": "단일 트랜잭션 내 처리로 데이터 일관성이 높음",
                    "encapsulation": "각 집계가 자신만의 책임 범위를 가져 내부 구현이 캡슐화됨",
                    "complexity": "집계 수가 적어 설계와 유지보수가 단순함",
                    "independence": "기능별로 독립적으로 운영 가능",
                    "performance": "통합 처리로 호출 간 오버헤드가 낮음"
                },
                "cons": {
                    "cohesion": "모든 처리를 하나의 트랜잭션 내에서 관리할 경우 집계가 커질 수 있음",
                    "coupling": "응용 프로세스 확장이 필요한 경우 한 집계 내 책임이 증가할 수 있음",
                    "consistency": "대규모 트랜잭션 시 록 경합이 발생할 가능성 존재",
                    "encapsulation": "내부 로직 분리 시 세밀한 캡슐화 관리가 필요함",
                    "complexity": "기능 추가 시 단일 집계의 복잡도가 상승할 수 있음",
                    "independence": "모듈 분리 요구사항이 있는 경우 분리된 집계보다 독립성 낮을 수 있음",
                    "performance": "집계 내 연산이 많아지면 응답 속도 저하 우려"
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                        },
                        {
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-003: 민원 신청서 검토 및 승인/반려]\\n• 액터: 민원 담당자\\n• 목적: 제출된 민원 신청서를 검토하여 승인 혹은 반려 여부를 결정한다.\\n• 전제조건:\\n  - UC-002를 통해 제출된 민원 신청서가 대기 리스트에 있음.\\n  - 민원 담당자는 필요한 권한이 부여되어 있음.\\n• 기본 흐름:\\n  1. 민원 담당자는 \\\"listPendingApplications\\\" 함수를 통해 대기중인 신청서 목록을 조회한다.\\n  2. 특정 신청서를 선택하여 상세 내용을 확인한다.\\n  3. 검토 후 \\\"approveApplication\\\" 또는 \\\"rejectApplication\\\" 함수를 호출하여 결정한다.\\n  4. 승인 시 → 신청서 상태가 승인으로 변경되고, 후속 발급 프로세스가 자동 시작됨.\\n  5. 반려 시 → 신청서에는 반려 사유를 기록하고, 민원 신청자에게 통보함.\\n• 예외 흐름:\\n  - 시스템 오류 시 → 오류 메시지를 로그에 기록하고, 민원 담당자에게 재시도 요청.\"},{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-004: 민원 신청 발급 처리]\\n• 액터: 민원 담당자 (승인 처리 후 자동 또는 수동 실행 가능)\\n• 목적: 승인된 민원 신청서를 기반으로 공식 민원 문서를 발급한다.\\n• 전제조건:\\n  - UC-003에서 민원 신청서가 승인된 상태임.\\n  - 문서 발급에 필요한 외부 혹은 내부 데이터(예: 서식, 인증 로직 등)가 준비되어 있음.\\n• 기본 흐름:\\n  1. 시스템은 승인된 신청서를 확인 후 \\\"issueDocument\\\" 함수를 호출하여 문서 발급을 준비한다.\\n  2. 문서 발급 프로세스 내에서 PDF 혹은 해당 포맷으로 문서가 생성된다.\\n  3. 생성된 문서를 민원 신청자 계정에 업로드하거나 이메일로 전송한다.\\n  4. 발급 성공 메시지를 민원 담당자와 신청자 모두에게 제공한다.\\n• 예외 흐름:\\n  - 문서 생성 실패 시 → 오류 로그 기록, 민원 담당자에게 재시도 요청, 필요시 수동 발급 처리.\"}]",
                    "id": "886c1ea5-4b72-c968-7f43-c888489594ec",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec",
                        "style": "{}",
                        "width": 1010,
                        "x": 1460,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "ApplicationProcessing",
                    "displayName": "민원 검토 및 발급 처리",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": 8080,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "c53ab2766ab59bcc80c6ef8982e01cc6",
                    "selected": false
                },
                "description": "{\"userStories\":[{\"title\":\"UC-003: 민원 신청서 검토 및 승인/반려\",\"description\":\"민원 담당자는 대기 리스트에 있는 민원 신청서를 검토하여 승인 또는 반려 여부를 결정한다. 민원 담당자는 listPendingApplications 함수를 통해 대기중인 신청서 목록을 조회하고, 특정 신청서를 선택하여 상세 내용을 확인한 후, approveApplication 또는 rejectApplication 함수를 호출하여 결정한다. 승인 시 신청서 상태가 승인으로 변경되며, 후속 발급 프로세스가 자동으로 시작된다. 반려 시에는 신청서에 반려 사유가 기록되고 민원 신청자에게 통보된다.\",\"acceptance\":[\"대기중인 민원 신청서 목록이 올바르게 조회되어야 한다.\",\"특정 신청서를 선택하면 상세 내용이 올바르게 표시되어야 한다.\",\"approveApplication 호출 시 신청서 상태가 승인으로 변경되고, 발급 프로세스가 시작되어야 한다.\",\"rejectApplication 호출 시 반려 사유가 기록되고 민원 신청자에게 통보되어야 한다.\",\"시스템 오류 발생 시 오류 로그가 기록되고 민원 담당자에게 재시도 요청 메시지가 표시되어야 한다.\"]},{\"title\":\"UC-004: 민원 신청 발급 처리\",\"description\":\"시스템은 승인된 민원 신청서를 확인 후 issueDocument 함수를 호출하여 공식 민원 문서를 발급한다. 문서 발급 프로세스 내에서 PDF 또는 해당 포맷의 문서를 생성하고, 생성된 문서를 민원 신청자 계정에 업로드하거나 이메일로 전송한다. 발급 성공 시 민원 담당자와 신청자 모두에게 성공 메시지를 제공한다.\",\"acceptance\":[\"승인된 민원 신청서에 대해서만 문서 발급이 진행되어야 한다.\",\"issueDocument 호출 후 PDF 또는 다른 지정 포맷의 문서가 생성되어야 한다.\",\"생성된 문서는 민원 신청자에게 업로드 또는 이메일 전송되어야 한다.\",\"발급 성공 메시지가 민원 담당자와 신청자에게 제공되어야 한다.\",\"문서 생성 실패 시 오류 로그가 기록되고 민원 담당자에게 재시도 요청이 표시되어야 한다.\"]}],\"entities\":{\"Application\":{\"properties\":[{\"name\":\"applicationId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"pending\",\"approved\",\"rejected\"]},{\"name\":\"applicantId\",\"type\":\"String\",\"required\":true},{\"name\":\"submissionDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"rejectionReason\",\"type\":\"String\"},{\"name\":\"reviewedBy\",\"type\":\"String\"},{\"name\":\"reviewDate\",\"type\":\"Date\"}]},\"Document\":{\"properties\":[{\"name\":\"documentId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"applicationId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Application\"},{\"name\":\"format\",\"type\":\"enum\",\"required\":true,\"values\":[\"PDF\",\"OTHER\"]},{\"name\":\"createdDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"sentTo\",\"type\":\"String\",\"required\":true}]}},\"businessRules\":[{\"name\":\"민원 신청서 상태 규칙\",\"description\":\"신청서는 pending, approved, rejected 중 하나의 상태를 가져야 하며, 승인 및 반려 처리 후 상태가 변경되어야 한다.\"},{\"name\":\"문서 발급 규칙\",\"description\":\"문서 발급은 오직 승인된(approved) 신청서에 대해서만 수행되며, 이때 정확한 포맷(PDF 또는 OTHER)으로 생성되어야 한다.\"},{\"name\":\"오류 처리 규칙\",\"description\":\"시스템 오류 발생 시 오류 로그를 기록하고, 민원 담당자에게 재시도 요청을 표시해야 한다.\"}],\"interfaces\":{\"ApplicationReview\":{\"sections\":[{\"name\":\"Pending Applications\",\"type\":\"table\",\"fields\":[],\"actions\":[\"approveApplication\",\"rejectApplication\"],\"filters\":[\"dateRange\",\"status\"],\"resultTable\":{\"columns\":[\"applicationId\",\"applicantId\",\"submissionDate\",\"status\"],\"actions\":[\"View Details\"]}}]},\"DocumentIssuance\":{\"sections\":[{\"name\":\"Document Generation\",\"type\":\"form\",\"fields\":[{\"name\":\"applicationId\",\"type\":\"text\",\"required\":true},{\"name\":\"format\",\"type\":\"select\",\"required\":true}],\"actions\":[\"issueDocument\"],\"filters\":[],\"resultTable\":{\"columns\":[\"documentId\",\"applicationId\",\"format\",\"createdDate\",\"sentTo\"],\"actions\":[\"View Document\"]}}]}}}"
            },
            "Operations": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "SystemMonitor",
                            "alias": "시스템 모니터링"
                        },
                        "enumerations": [
                            {
                                "name": "MonitorStatus",
                                "alias": "모니터링 상태"
                            }
                        ],
                        "valueObjects": []
                    }
                ],
                "pros": {
                    "cohesion": "매우 높음 - 모든 시스템 모니터링 관련 데이터가 하나의 Aggregate로 집중되어 있음.",
                    "coupling": "매우 낮음 - 내부 결합이 높지만 외부 종속성은 Value Object를 통해서만 관리됨.",
                    "consistency": "매우 높음 - 단일 Aggregate로 트랜잭셔널 일관성이 보장됨.",
                    "encapsulation": "높음 - 도메인 경계가 명확하며 관련 데이터들이 캡슐화됨.",
                    "complexity": "낮음 - 구조가 단순하여 유지보수 및 관리가 용이함.",
                    "independence": "높음 - 독립적으로 운영 가능하며, 다른 Aggregate와의 상호작용 최소화됨.",
                    "performance": "높음 - 단일 Aggregate 내에서 처리되어 성능 최적화 가능."
                },
                "cons": {
                    "cohesion": "단일 Aggregate에 모든 데이터를 포함할 경우, 향후 기능 확장 시 Aggregate 크기가 증가할 수 있음.",
                    "coupling": "내부 구조가 복잡해지면 Aggregate 내 모듈 간 결합도가 증가할 가능성이 있음.",
                    "consistency": "Aggregate가 커질 경우, 트랜잭션 복잡성이 상승할 수 있음.",
                    "encapsulation": "모든 기능을 한 곳에 몰아넣음으로써 일부 변경이 전체에 영향을 줄 수 있음.",
                    "complexity": "확장성 측면에서 분리된 책임보다는 복잡성이 증가할 수 있음.",
                    "independence": "모든 관련 기능이 하나의 Aggregate에 묶여 있어 독립적 확장이 어려울 수 있음.",
                    "performance": "Aggregate 크기가 지나치게 커질 경우 성능 저하 우려가 있을 수 있음."
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-005: 시스템 관리 및 모니터링]\\n• 액터: 시스템 관리자\\n• 목적: 서비스 안정성 확보와 운영 효율성을 위해 시스템을 관리, 모니터링한다.\\n• 전제조건:\\n  - 관리자 전용 콘솔 접근 권한 보유.\\n• 기본 흐름:\\n  1. 시스템 관리자는 \\\"monitorSystem\\\" 함수를 통해 전체 시스템 상태(서버 상태, 트랜잭션 로그 등)를 확인한다.\\n  2. 장애 또는 비정상 상황 발생 시 알림을 확인하고, 즉각적인 조치 또는 해당 팀에 이슈 전달한다.\\n  3. 정기적인 업데이트 및 보안 점검 프로세스를 실행한다.\\n• 예외 흐름:\\n  - 모니터링 도구 오류 시 → 백업 로깅 시스템으로 전환, 수동 모니터링 조치.\"}]",
                    "id": "81fab6f5-399c-4722-35ba-75ec4c67a041",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041",
                        "style": "{}",
                        "width": 560,
                        "x": 2270,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "Operations",
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
                    "definitionId": "c53ab2766ab59bcc80c6ef8982e01cc6",
                    "selected": false
                },
                "description": "{\"userStories\":[{\"title\":\"시스템 관리 및 모니터링\",\"description\":\"시스템 관리자는 관리자 전용 콘솔을 통해 monitorSystem 함수를 사용하여 전체 시스템 상태(서버 상태, 트랜잭션 로그 등)를 확인하고, 장애나 비정상 상황 발생시 즉각적으로 알림을 확인하여 조치하거나 관련 팀에 이슈를 전달하며, 정기적인 업데이트 및 보안 점검을 실행한다.\",\"acceptance\":[\"관리자 전용 콘솔 접근 권한이 필요하다.\",\"monitorSystem 함수를 통해 서버 상태, 트랜잭션 로그 등 전체 시스템 상태를 확인할 수 있어야 한다.\",\"장애나 비정상 상황 발생 시 알림이 제공되고, 즉각 조치 또는 이슈 전달이 가능해야 한다.\",\"모니터링 도구 오류 시 자동으로 백업 로깅 시스템으로 전환되어야 한다.\"]}],\"entities\":{\"SystemStatus\":{\"properties\":[{\"name\":\"statusId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"serverStatus\",\"type\":\"String\",\"required\":true},{\"name\":\"transactionLog\",\"type\":\"String\",\"required\":true},{\"name\":\"lastChecked\",\"type\":\"Date\",\"required\":true},{\"name\":\"alerts\",\"type\":\"String\"}]}},\"businessRules\":[{\"name\":\"백업 로깅 시스템 전환\",\"description\":\"모니터링 도구 오류 발생 시, 시스템은 자동으로 백업 로깅 시스템으로 전환되어 수동 모니터링 조치를 지원해야 한다.\"}],\"interfaces\":{\"SystemMonitoring\":{\"sections\":[{\"name\":\"시스템 상태\",\"type\":\"form\",\"fields\":[{\"name\":\"serverStatus\",\"type\":\"text\",\"required\":true},{\"name\":\"transactionLog\",\"type\":\"textarea\",\"required\":true},{\"name\":\"lastChecked\",\"type\":\"date\",\"required\":true},{\"name\":\"alerts\",\"type\":\"textarea\"}],\"actions\":[\"monitorSystem\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]}}}"
            }
        },
        esValue: {
            "elements": {
                "af1cc5ab-8a10-648b-d119-90a732415c27": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-001: 민원 신청서 작성]\\n• 액터: 민원 신청자\\n• 목적: 사용자가 간편하게 민원 신청서를 작성하여 필요한 정보를 입력한다.\\n• 전제조건:\\n  - 민원 신청자가 시스템에 로그인(인증) 완료되어 있어야 함.\\n  - 필요한 개인정보 및 민원 관련 정보(예: 주민등록번호, 주소 등)가 준비되어 있음.\\n• 기본 흐름:\\n  1. 민원 신청자는 UI 화면에서 \\\"newApplication\\\" 폼을 호출한다.\\n  2. 사용자는 신청서 항목(예: 제목, 상세내용, 첨부파일 등)을 입력한다.\\n  3. UI는 \\\"validateInput\\\" 함수를 통해 입력값의 유효성 검사를 수행한다.\\n  4. 입력값이 유효하면, 데이터가 백엔드 데이터베이스로 전송된다.\\n  5. 시스템은 신청서 임시저장(success message)을 사용자에게 반환한다.\\n• 예외 흐름:\\n  - 입력값 검증 실패 시 → 오류 메시지를 출력하고, 수정 후 재입력을 요청.\"},{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-002: 민원 신청서 제출]\\n• 액터: 민원 신청자\\n• 목적: 작성 완료된 민원 신청서를 최종 제출하여 민원 담당자가 검토할 수 있도록 한다.\\n• 전제조건:\\n  - UC-001을 통해 작성된 신청서가 존재함.\\n  - 신청서 데이터가 임시 저장된 상태임.\\n• 기본 흐름:\\n  1. 민원 신청자는 임시 저장된 신청서를 불러온 후, \\\"submitApplication\\\" 함수를 호출한다.\\n  2. 시스템은 신청서의 필수 항목들을 재검증 후 제증명 처리 대기 상태로 변경한다.\\n  3. 제출 완료 메시지를 사용자에게 반환한다.\\n• 예외 흐름:\\n  - 필수 정보 미입력 시 → 제출 불가 메시지 출력 및 수정 유도.\"}]",
                    "id": "af1cc5ab-8a10-648b-d119-90a732415c27",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27",
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
                    "definitionId": "c53ab2766ab59bcc80c6ef8982e01cc6",
                    "selected": false
                },
                "886c1ea5-4b72-c968-7f43-c888489594ec": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                        },
                        {
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-003: 민원 신청서 검토 및 승인/반려]\\n• 액터: 민원 담당자\\n• 목적: 제출된 민원 신청서를 검토하여 승인 혹은 반려 여부를 결정한다.\\n• 전제조건:\\n  - UC-002를 통해 제출된 민원 신청서가 대기 리스트에 있음.\\n  - 민원 담당자는 필요한 권한이 부여되어 있음.\\n• 기본 흐름:\\n  1. 민원 담당자는 \\\"listPendingApplications\\\" 함수를 통해 대기중인 신청서 목록을 조회한다.\\n  2. 특정 신청서를 선택하여 상세 내용을 확인한다.\\n  3. 검토 후 \\\"approveApplication\\\" 또는 \\\"rejectApplication\\\" 함수를 호출하여 결정한다.\\n  4. 승인 시 → 신청서 상태가 승인으로 변경되고, 후속 발급 프로세스가 자동 시작됨.\\n  5. 반려 시 → 신청서에는 반려 사유를 기록하고, 민원 신청자에게 통보함.\\n• 예외 흐름:\\n  - 시스템 오류 시 → 오류 메시지를 로그에 기록하고, 민원 담당자에게 재시도 요청.\"},{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-004: 민원 신청 발급 처리]\\n• 액터: 민원 담당자 (승인 처리 후 자동 또는 수동 실행 가능)\\n• 목적: 승인된 민원 신청서를 기반으로 공식 민원 문서를 발급한다.\\n• 전제조건:\\n  - UC-003에서 민원 신청서가 승인된 상태임.\\n  - 문서 발급에 필요한 외부 혹은 내부 데이터(예: 서식, 인증 로직 등)가 준비되어 있음.\\n• 기본 흐름:\\n  1. 시스템은 승인된 신청서를 확인 후 \\\"issueDocument\\\" 함수를 호출하여 문서 발급을 준비한다.\\n  2. 문서 발급 프로세스 내에서 PDF 혹은 해당 포맷으로 문서가 생성된다.\\n  3. 생성된 문서를 민원 신청자 계정에 업로드하거나 이메일로 전송한다.\\n  4. 발급 성공 메시지를 민원 담당자와 신청자 모두에게 제공한다.\\n• 예외 흐름:\\n  - 문서 생성 실패 시 → 오류 로그 기록, 민원 담당자에게 재시도 요청, 필요시 수동 발급 처리.\"}]",
                    "id": "886c1ea5-4b72-c968-7f43-c888489594ec",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec",
                        "style": "{}",
                        "width": 1010,
                        "x": 1460,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "ApplicationProcessing",
                    "displayName": "민원 검토 및 발급 처리",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": 8080,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "c53ab2766ab59bcc80c6ef8982e01cc6",
                    "selected": false
                },
                "81fab6f5-399c-4722-35ba-75ec4c67a041": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"[유스케이스 UC-005: 시스템 관리 및 모니터링]\\n• 액터: 시스템 관리자\\n• 목적: 서비스 안정성 확보와 운영 효율성을 위해 시스템을 관리, 모니터링한다.\\n• 전제조건:\\n  - 관리자 전용 콘솔 접근 권한 보유.\\n• 기본 흐름:\\n  1. 시스템 관리자는 \\\"monitorSystem\\\" 함수를 통해 전체 시스템 상태(서버 상태, 트랜잭션 로그 등)를 확인한다.\\n  2. 장애 또는 비정상 상황 발생 시 알림을 확인하고, 즉각적인 조치 또는 해당 팀에 이슈 전달한다.\\n  3. 정기적인 업데이트 및 보안 점검 프로세스를 실행한다.\\n• 예외 흐름:\\n  - 모니터링 도구 오류 시 → 백업 로깅 시스템으로 전환, 수동 모니터링 조치.\"}]",
                    "id": "81fab6f5-399c-4722-35ba-75ec4c67a041",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041",
                        "style": "{}",
                        "width": 560,
                        "x": 2270,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "Operations",
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
                    "definitionId": "c53ab2766ab59bcc80c6ef8982e01cc6",
                    "selected": false
                },
                "39120b26-cdde-82ad-fa95-a25d828ad2b7": {
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
                                "name": "detail",
                                "nameCamelCase": "detail",
                                "namePascalCase": "Detail",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "attachment",
                                "nameCamelCase": "attachment",
                                "namePascalCase": "Attachment",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "residentRegistrationNumber",
                                "nameCamelCase": "residentRegistrationNumber",
                                "namePascalCase": "ResidentRegistrationNumber",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "address",
                                "nameCamelCase": "address",
                                "namePascalCase": "Address",
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
                                "className": "DocumentId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "documentId",
                                "nameCamelCase": "documentId",
                                "namePascalCase": "DocumentId",
                                "displayName": "",
                                "referenceClass": "Document",
                                "isOverrideField": true,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "89cf284d-f75c-94db-0660-74f117eb9764": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "89cf284d-f75c-94db-0660-74f117eb9764",
                                    "name": "ApplicationForm",
                                    "namePascalCase": "ApplicationForm",
                                    "nameCamelCase": "applicationForm",
                                    "namePlural": "ApplicationForms",
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
                                            "name": "detail",
                                            "displayName": "",
                                            "nameCamelCase": "detail",
                                            "namePascalCase": "Detail",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "attachment",
                                            "displayName": "",
                                            "nameCamelCase": "attachment",
                                            "namePascalCase": "Attachment",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "residentRegistrationNumber",
                                            "displayName": "",
                                            "nameCamelCase": "residentRegistrationNumber",
                                            "namePascalCase": "ResidentRegistrationNumber",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "address",
                                            "displayName": "",
                                            "nameCamelCase": "address",
                                            "namePascalCase": "Address",
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
                                            "className": "DocumentId",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "documentId",
                                            "nameCamelCase": "documentId",
                                            "namePascalCase": "DocumentId",
                                            "displayName": "",
                                            "referenceClass": "Document",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "89cf284d-f75c-94db-0660-74f117eb9764",
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
                                    "parentId": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                                },
                                "d50a3c1b-805d-9fd0-fe26-a48d639c2d01": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "d50a3c1b-805d-9fd0-fe26-a48d639c2d01",
                                    "name": "ApplicationStatus",
                                    "displayName": "신청서 상태",
                                    "nameCamelCase": "applicationStatus",
                                    "namePascalCase": "ApplicationStatus",
                                    "namePlural": "applicationStatuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "d50a3c1b-805d-9fd0-fe26-a48d639c2d01",
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
                                            "value": "Draft"
                                        },
                                        {
                                            "value": "PendingReview"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": []
                                },
                                "cd12863f-b080-b2bf-dbf2-2520734ca903": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "cd12863f-b080-b2bf-dbf2-2520734ca903",
                                    "name": "DocumentId",
                                    "displayName": "",
                                    "namePascalCase": "DocumentId",
                                    "nameCamelCase": "documentId",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": true,
                                            "label": "- documentId: String",
                                            "name": "documentId",
                                            "nameCamelCase": "documentId",
                                            "namePascalCase": "DocumentId",
                                            "displayName": "",
                                            "referenceClass": "Document",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "cd12863f-b080-b2bf-dbf2-2520734ca903",
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
                                    "namePlural": "DocumentIds",
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
                        "name": "af1cc5ab-8a10-648b-d119-90a732415c27",
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                    },
                    "commands": [],
                    "description": null,
                    "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "x": 650,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "ApplicationForm",
                    "displayName": "민원 신청서",
                    "nameCamelCase": "applicationForm",
                    "namePascalCase": "ApplicationForm",
                    "namePlural": "applicationForms",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "8046de29-aeab-65f8-db12-c3ffe41abea5": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "reviewId",
                                "nameCamelCase": "reviewId",
                                "namePascalCase": "ReviewId",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reviewer",
                                "nameCamelCase": "reviewer",
                                "namePascalCase": "Reviewer",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reviewDate",
                                "nameCamelCase": "reviewDate",
                                "namePascalCase": "ReviewDate",
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
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "rejectionReason",
                                "nameCamelCase": "rejectionReason",
                                "namePascalCase": "RejectionReason",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "ApplicationFormId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationFormId",
                                "nameCamelCase": "applicationFormId",
                                "namePascalCase": "ApplicationFormId",
                                "displayName": "",
                                "referenceClass": "ApplicationForm",
                                "isOverrideField": true,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "ebbb516c-08c6-075c-5fa0-33a7cffe0867": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "ebbb516c-08c6-075c-5fa0-33a7cffe0867",
                                    "name": "ApplicationReview",
                                    "namePascalCase": "ApplicationReview",
                                    "nameCamelCase": "applicationReview",
                                    "namePlural": "ApplicationReviews",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "reviewId",
                                            "displayName": "",
                                            "nameCamelCase": "reviewId",
                                            "namePascalCase": "ReviewId",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "applicationId",
                                            "displayName": "",
                                            "nameCamelCase": "applicationId",
                                            "namePascalCase": "ApplicationId",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "reviewer",
                                            "displayName": "",
                                            "nameCamelCase": "reviewer",
                                            "namePascalCase": "Reviewer",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "Date",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "reviewDate",
                                            "displayName": "",
                                            "nameCamelCase": "reviewDate",
                                            "namePascalCase": "ReviewDate",
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
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "rejectionReason",
                                            "displayName": "",
                                            "nameCamelCase": "rejectionReason",
                                            "namePascalCase": "RejectionReason",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "ApplicationFormId",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "applicationFormId",
                                            "nameCamelCase": "applicationFormId",
                                            "namePascalCase": "ApplicationFormId",
                                            "displayName": "",
                                            "referenceClass": "ApplicationForm",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "ebbb516c-08c6-075c-5fa0-33a7cffe0867",
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
                                    "parentId": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                                },
                                "27572536-3564-bae4-f9d5-008201819e91": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "27572536-3564-bae4-f9d5-008201819e91",
                                    "name": "ApplicationStatus",
                                    "displayName": "신청서 상태",
                                    "nameCamelCase": "applicationStatus",
                                    "namePascalCase": "ApplicationStatus",
                                    "namePlural": "applicationStatuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "27572536-3564-bae4-f9d5-008201819e91",
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
                                            "value": "PENDING"
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
                                },
                                "0fad5eab-c72e-7b7f-b432-159549c2730b": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "0fad5eab-c72e-7b7f-b432-159549c2730b",
                                    "name": "ApplicationFormId",
                                    "displayName": "",
                                    "namePascalCase": "ApplicationFormId",
                                    "nameCamelCase": "applicationFormId",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": true,
                                            "label": "- applicationId: String",
                                            "name": "applicationId",
                                            "nameCamelCase": "applicationId",
                                            "namePascalCase": "ApplicationId",
                                            "displayName": "",
                                            "referenceClass": "ApplicationForm",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "0fad5eab-c72e-7b7f-b432-159549c2730b",
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
                                    "namePlural": "ApplicationFormIds",
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
                        "name": "886c1ea5-4b72-c968-7f43-c888489594ec",
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "commands": [],
                    "description": null,
                    "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "x": 1235,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "ApplicationReview",
                    "displayName": "민원 신청서 검토",
                    "nameCamelCase": "applicationReview",
                    "namePascalCase": "ApplicationReview",
                    "namePlural": "applicationReviews",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd": {
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
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "format",
                                "nameCamelCase": "format",
                                "namePascalCase": "Format",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "createdDate",
                                "nameCamelCase": "createdDate",
                                "namePascalCase": "CreatedDate",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "sentTo",
                                "nameCamelCase": "sentTo",
                                "namePascalCase": "SentTo",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "ApplicationReviewId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationReviewId",
                                "nameCamelCase": "applicationReviewId",
                                "namePascalCase": "ApplicationReviewId",
                                "displayName": "",
                                "referenceClass": "ApplicationReview",
                                "isOverrideField": true,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "1e523b48-6fab-2056-f95a-1338c1f648c9": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "1e523b48-6fab-2056-f95a-1338c1f648c9",
                                    "name": "Document",
                                    "namePascalCase": "Document",
                                    "nameCamelCase": "document",
                                    "namePlural": "Documents",
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
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "applicationId",
                                            "displayName": "",
                                            "nameCamelCase": "applicationId",
                                            "namePascalCase": "ApplicationId",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "DocumentFormat",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "format",
                                            "displayName": "",
                                            "nameCamelCase": "format",
                                            "namePascalCase": "Format",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "Date",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "createdDate",
                                            "displayName": "",
                                            "nameCamelCase": "createdDate",
                                            "namePascalCase": "CreatedDate",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "sentTo",
                                            "displayName": "",
                                            "nameCamelCase": "sentTo",
                                            "namePascalCase": "SentTo",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "ApplicationReviewId",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "applicationReviewId",
                                            "nameCamelCase": "applicationReviewId",
                                            "namePascalCase": "ApplicationReviewId",
                                            "displayName": "",
                                            "referenceClass": "ApplicationReview",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "1e523b48-6fab-2056-f95a-1338c1f648c9",
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
                                    "parentId": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                                },
                                "ab12c5b2-30f8-9585-c974-360da3e0fa84": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "ab12c5b2-30f8-9585-c974-360da3e0fa84",
                                    "name": "DocumentFormat",
                                    "displayName": "문서 포맷",
                                    "nameCamelCase": "documentFormat",
                                    "namePascalCase": "DocumentFormat",
                                    "namePlural": "documentFormats",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "ab12c5b2-30f8-9585-c974-360da3e0fa84",
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
                                            "value": "OTHER"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": []
                                },
                                "9c90b044-1c7f-06c0-ac24-5c907c51c528": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "9c90b044-1c7f-06c0-ac24-5c907c51c528",
                                    "name": "ApplicationReviewId",
                                    "displayName": "",
                                    "namePascalCase": "ApplicationReviewId",
                                    "nameCamelCase": "applicationReviewId",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": true,
                                            "label": "- reviewId: String",
                                            "name": "reviewId",
                                            "nameCamelCase": "reviewId",
                                            "namePascalCase": "ReviewId",
                                            "displayName": "",
                                            "referenceClass": "ApplicationReview",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "9c90b044-1c7f-06c0-ac24-5c907c51c528",
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
                                    "namePlural": "ApplicationReviewIds",
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
                        "name": "886c1ea5-4b72-c968-7f43-c888489594ec",
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "commands": [],
                    "description": null,
                    "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "x": 1665,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "Document",
                    "displayName": "민원 문서",
                    "nameCamelCase": "document",
                    "namePascalCase": "Document",
                    "namePlural": "documents",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "9d7631f0-85d0-d398-e1d7-054976d2a870": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "monitorId",
                                "nameCamelCase": "monitorId",
                                "namePascalCase": "MonitorId",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
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
                                "referenceClass": null,
                                "isOverrideField": false,
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
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "lastChecked",
                                "nameCamelCase": "lastChecked",
                                "namePascalCase": "LastChecked",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "alerts",
                                "nameCamelCase": "alerts",
                                "namePascalCase": "Alerts",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "MonitorStatus",
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
                                "53a2e7d4-df9b-ad4b-ca8d-e1bc49db8028": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "53a2e7d4-df9b-ad4b-ca8d-e1bc49db8028",
                                    "name": "SystemMonitor",
                                    "namePascalCase": "SystemMonitor",
                                    "nameCamelCase": "systemMonitor",
                                    "namePlural": "SystemMonitors",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "monitorId",
                                            "displayName": "",
                                            "nameCamelCase": "monitorId",
                                            "namePascalCase": "MonitorId",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "serverStatus",
                                            "displayName": "",
                                            "nameCamelCase": "serverStatus",
                                            "namePascalCase": "ServerStatus",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "transactionLog",
                                            "displayName": "",
                                            "nameCamelCase": "transactionLog",
                                            "namePascalCase": "TransactionLog",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "Date",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "lastChecked",
                                            "displayName": "",
                                            "nameCamelCase": "lastChecked",
                                            "namePascalCase": "LastChecked",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "alerts",
                                            "displayName": "",
                                            "nameCamelCase": "alerts",
                                            "namePascalCase": "Alerts",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "MonitorStatus",
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
                                        "id": "53a2e7d4-df9b-ad4b-ca8d-e1bc49db8028",
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
                                    "parentId": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                                },
                                "3031c176-5928-b82a-284b-13325eb8d770": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "3031c176-5928-b82a-284b-13325eb8d770",
                                    "name": "MonitorStatus",
                                    "displayName": "모니터링 상태",
                                    "nameCamelCase": "monitorStatus",
                                    "namePascalCase": "MonitorStatus",
                                    "namePlural": "monitorStatuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "3031c176-5928-b82a-284b-13325eb8d770",
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
                                            "value": "NORMAL"
                                        },
                                        {
                                            "value": "ALERT"
                                        },
                                        {
                                            "value": "BACKUP"
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
                        "name": "81fab6f5-399c-4722-35ba-75ec4c67a041",
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "commands": [],
                    "description": null,
                    "id": "9d7631f0-85d0-d398-e1d7-054976d2a870",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "9d7631f0-85d0-d398-e1d7-054976d2a870",
                        "x": 2270,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "9d7631f0-85d0-d398-e1d7-054976d2a870",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "SystemMonitor",
                    "displayName": "시스템 모니터링",
                    "nameCamelCase": "systemMonitor",
                    "namePascalCase": "SystemMonitor",
                    "namePlural": "systemMonitors",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "55357fca-db61-d383-c8ec-8a24a26abeb3": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
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
                            "name": "attachment",
                            "nameCamelCase": "attachment",
                            "namePascalCase": "Attachment",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "residentRegistrationNumber",
                            "nameCamelCase": "residentRegistrationNumber",
                            "namePascalCase": "ResidentRegistrationNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "address",
                            "nameCamelCase": "address",
                            "namePascalCase": "Address",
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
                        "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "ApplicationDraftSaved",
                    "displayName": "임시 저장된 민원 신청서 생성됨",
                    "nameCamelCase": "applicationDraftSaved",
                    "namePascalCase": "ApplicationDraftSaved",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                    },
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                    },
                    "visibility": "public"
                },
                "17c64ef9-77d3-1c17-4e3e-5a755753f79b": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
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
                            "name": "attachment",
                            "nameCamelCase": "attachment",
                            "namePascalCase": "Attachment",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "residentRegistrationNumber",
                            "nameCamelCase": "residentRegistrationNumber",
                            "namePascalCase": "ResidentRegistrationNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "address",
                            "nameCamelCase": "address",
                            "namePascalCase": "Address",
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
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "submitDate",
                            "nameCamelCase": "submitDate",
                            "namePascalCase": "SubmitDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "ApplicationSubmitted",
                    "displayName": "민원 신청서 제출 완료됨",
                    "nameCamelCase": "applicationSubmitted",
                    "namePascalCase": "ApplicationSubmitted",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                    },
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                    },
                    "visibility": "public"
                },
                "707794be-6f3b-f683-1e06-100f5044c1fd": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "ApplicationDraftSaved"
                    ],
                    "aggregate": {
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
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
                            "name": "attachment",
                            "nameCamelCase": "attachment",
                            "namePascalCase": "Attachment",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "residentRegistrationNumber",
                            "nameCamelCase": "residentRegistrationNumber",
                            "namePascalCase": "ResidentRegistrationNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "address",
                            "nameCamelCase": "address",
                            "namePascalCase": "Address",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "707794be-6f3b-f683-1e06-100f5044c1fd",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "707794be-6f3b-f683-1e06-100f5044c1fd",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "707794be-6f3b-f683-1e06-100f5044c1fd",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "TemporarySaveApplication",
                    "displayName": "임시 저장 민원 신청서",
                    "nameCamelCase": "temporarySaveApplication",
                    "namePascalCase": "TemporarySaveApplication",
                    "namePlural": "temporarySaveApplications",
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
                                    "name": "ApplicationForm",
                                    "value": {
                                        "applicationId": "N/A",
                                        "title": "민원 신청서 제목",
                                        "detail": "신청서 상세내용",
                                        "attachment": "document.pdf",
                                        "residentRegistrationNumber": "123456-1234567",
                                        "address": "서울시 강남구",
                                        "status": "N/A",
                                        "documentId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "TemporarySaveApplication",
                                    "value": {
                                        "title": "민원 신청서 제목",
                                        "detail": "신청서 상세내용",
                                        "attachment": "document.pdf",
                                        "residentRegistrationNumber": "123456-1234567",
                                        "address": "서울시 강남구"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "ApplicationDraftSaved",
                                    "value": {
                                        "applicationId": "APP-001",
                                        "title": "민원 신청서 제목",
                                        "detail": "신청서 상세내용",
                                        "attachment": "document.pdf",
                                        "residentRegistrationNumber": "123456-1234567",
                                        "address": "서울시 강남구",
                                        "status": "Draft"
                                    }
                                }
                            ]
                        }
                    ],
                    "visibility": "public"
                },
                "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "ApplicationSubmitted"
                    ],
                    "aggregate": {
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
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
                            "name": "attachment",
                            "nameCamelCase": "attachment",
                            "namePascalCase": "Attachment",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "residentRegistrationNumber",
                            "nameCamelCase": "residentRegistrationNumber",
                            "namePascalCase": "ResidentRegistrationNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "address",
                            "nameCamelCase": "address",
                            "namePascalCase": "Address",
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
                    "description": null,
                    "id": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "SubmitApplication",
                    "displayName": "민원 신청서 제출",
                    "nameCamelCase": "submitApplication",
                    "namePascalCase": "SubmitApplication",
                    "namePlural": "submitApplications",
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
                                    "name": "ApplicationForm",
                                    "value": {
                                        "applicationId": "APP-001",
                                        "title": "민원 신청서 제목",
                                        "detail": "신청서 상세내용",
                                        "attachment": "document.pdf",
                                        "residentRegistrationNumber": "123456-1234567",
                                        "address": "서울시 강남구",
                                        "status": "Draft",
                                        "documentId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "SubmitApplication",
                                    "value": {
                                        "applicationId": "APP-001",
                                        "title": "민원 신청서 제목",
                                        "detail": "신청서 상세내용",
                                        "attachment": "document.pdf",
                                        "residentRegistrationNumber": "123456-1234567",
                                        "address": "서울시 강남구",
                                        "status": "PendingReview"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "ApplicationSubmitted",
                                    "value": {
                                        "applicationId": "APP-001",
                                        "title": "민원 신청서 제목",
                                        "detail": "신청서 상세내용",
                                        "attachment": "document.pdf",
                                        "residentRegistrationNumber": "123456-1234567",
                                        "address": "서울시 강남구",
                                        "status": "PendingReview",
                                        "submitDate": "2024-03-20T12:00:00Z"
                                    }
                                }
                            ]
                        }
                    ],
                    "visibility": "public"
                },
                "4730f8b2-7822-ea8e-9c35-0c4a2faf7bf5": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "4730f8b2-7822-ea8e-9c35-0c4a2faf7bf5",
                    "visibility": "public",
                    "name": "ApplicationFormSummary",
                    "oldName": "",
                    "displayName": "민원 신청서 요약 정보",
                    "namePascalCase": "ApplicationFormSummary",
                    "namePlural": "applicationFormSummaries",
                    "aggregate": {
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
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
                        "id": "4730f8b2-7822-ea8e-9c35-0c4a2faf7bf5",
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
                    "definitionId": "",
                    "selected": false
                },
                "681bddf0-597d-7f24-959c-6de221a3c128": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                    },
                    "description": null,
                    "id": "681bddf0-597d-7f24-959c-6de221a3c128",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "681bddf0-597d-7f24-959c-6de221a3c128",
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
                    "displayName": "",
                    "selected": false
                },
                "5142d1dc-c442-11b8-e372-a5001392f4c9": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                    },
                    "description": null,
                    "id": "5142d1dc-c442-11b8-e372-a5001392f4c9",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "5142d1dc-c442-11b8-e372-a5001392f4c9",
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
                    "displayName": "",
                    "selected": false
                },
                "305bd2f1-d3f5-61fb-5202-e3b87ab3a8b0": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                    },
                    "description": null,
                    "id": "305bd2f1-d3f5-61fb-5202-e3b87ab3a8b0",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "305bd2f1-d3f5-61fb-5202-e3b87ab3a8b0",
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
                    "name": "Applicant",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": "",
                    "selected": false
                },
                "692db540-1c57-1df9-982f-6398c4c279d9": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "style": "{}",
                        "width": 100,
                        "x": 1329,
                        "y": 250,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "reviewId",
                            "nameCamelCase": "reviewId",
                            "namePascalCase": "ReviewId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
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
                            "name": "reviewer",
                            "nameCamelCase": "reviewer",
                            "namePascalCase": "Reviewer",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "reviewDate",
                            "nameCamelCase": "reviewDate",
                            "namePascalCase": "ReviewDate",
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
                        "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "ApplicationReviewApproved",
                    "displayName": "민원 신청 승인됨",
                    "nameCamelCase": "applicationReviewApproved",
                    "namePascalCase": "ApplicationReviewApproved",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                    },
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "visibility": "public"
                },
                "6ec7b754-ff48-048a-c096-36c4c4883e16": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                        "style": "{}",
                        "width": 100,
                        "x": 1329,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "reviewId",
                            "nameCamelCase": "reviewId",
                            "namePascalCase": "ReviewId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
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
                            "name": "reviewer",
                            "nameCamelCase": "reviewer",
                            "namePascalCase": "Reviewer",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "reviewDate",
                            "nameCamelCase": "reviewDate",
                            "namePascalCase": "ReviewDate",
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
                    "hexagonalView": {
                        "height": 0,
                        "id": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "ApplicationReviewRejected",
                    "displayName": "민원 신청 반려됨",
                    "nameCamelCase": "applicationReviewRejected",
                    "namePascalCase": "ApplicationReviewRejected",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                    },
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "visibility": "public"
                },
                "60773c6d-b4f0-d588-7aef-5842ea8aeb2a": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "ApplicationReviewApproved"
                    ],
                    "aggregate": {
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "controllerInfo": {
                        "method": "PUT"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "reviewId",
                            "nameCamelCase": "reviewId",
                            "namePascalCase": "ReviewId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "reviewer",
                            "nameCamelCase": "reviewer",
                            "namePascalCase": "Reviewer",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ApproveApplicationReview",
                    "displayName": "민원 신청 승인",
                    "nameCamelCase": "approveApplicationReview",
                    "namePascalCase": "ApproveApplicationReview",
                    "namePlural": "approveApplicationReviews",
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
                                    "name": "ApplicationReview",
                                    "value": {
                                        "reviewId": 1001,
                                        "applicationId": "APP-001",
                                        "reviewer": null,
                                        "reviewDate": null,
                                        "status": "PENDING",
                                        "rejectionReason": null,
                                        "applicationFormId": "APPFORM-001"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ApproveApplicationReview",
                                    "value": {
                                        "reviewId": 1001,
                                        "reviewer": "Alice"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "ApplicationReviewApproved",
                                    "value": {
                                        "reviewId": 1001,
                                        "applicationId": "APP-001",
                                        "reviewer": "Alice",
                                        "reviewDate": "2024-04-01T10:00:00Z",
                                        "status": "APPROVED"
                                    }
                                }
                            ]
                        }
                    ],
                    "visibility": "public"
                },
                "0df9b6da-7669-ec3c-af1b-9c0e102218b6": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "ApplicationReviewRejected"
                    ],
                    "aggregate": {
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "controllerInfo": {
                        "method": "PUT"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "reviewId",
                            "nameCamelCase": "reviewId",
                            "namePascalCase": "ReviewId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "reviewer",
                            "nameCamelCase": "reviewer",
                            "namePascalCase": "Reviewer",
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
                    "id": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "RejectApplicationReview",
                    "displayName": "민원 신청 반려",
                    "nameCamelCase": "rejectApplicationReview",
                    "namePascalCase": "RejectApplicationReview",
                    "namePlural": "rejectApplicationReviews",
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
                                    "name": "ApplicationReview",
                                    "value": {
                                        "reviewId": 1002,
                                        "applicationId": "APP-002",
                                        "reviewer": null,
                                        "reviewDate": null,
                                        "status": "PENDING",
                                        "rejectionReason": null,
                                        "applicationFormId": "APPFORM-002"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "RejectApplicationReview",
                                    "value": {
                                        "reviewId": 1002,
                                        "reviewer": "Bob",
                                        "rejectionReason": "서류 미비"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "ApplicationReviewRejected",
                                    "value": {
                                        "reviewId": 1002,
                                        "applicationId": "APP-002",
                                        "reviewer": "Bob",
                                        "reviewDate": "2024-04-01T11:00:00Z",
                                        "status": "REJECTED",
                                        "rejectionReason": "서류 미비"
                                    }
                                }
                            ]
                        }
                    ],
                    "visibility": "public"
                },
                "b60b4bd1-1941-e871-0cc3-bdb5cc98430d": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "b60b4bd1-1941-e871-0cc3-bdb5cc98430d",
                    "visibility": "public",
                    "name": "PendingApplicationReviewSummary",
                    "oldName": "",
                    "displayName": "대기민원 신청서 목록",
                    "namePascalCase": "PendingApplicationReviewSummary",
                    "namePlural": "pendingApplicationReviewSummaries",
                    "aggregate": {
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
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
                            "name": "reviewId",
                            "nameCamelCase": "reviewId",
                            "namePascalCase": "ReviewId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
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
                        "id": "b60b4bd1-1941-e871-0cc3-bdb5cc98430d",
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
                    "definitionId": "",
                    "selected": false
                },
                "66c1ffb4-4913-2d62-4955-fe99b4dded0a": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "66c1ffb4-4913-2d62-4955-fe99b4dded0a",
                    "visibility": "public",
                    "name": "ApplicationReviewDetails",
                    "oldName": "",
                    "displayName": "민원 신청서 상세 내용",
                    "namePascalCase": "ApplicationReviewDetails",
                    "namePlural": "applicationReviewDetails",
                    "aggregate": {
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
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
                            "name": "reviewId",
                            "nameCamelCase": "reviewId",
                            "namePascalCase": "ReviewId",
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
                        "id": "66c1ffb4-4913-2d62-4955-fe99b4dded0a",
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
                    "definitionId": "",
                    "selected": false
                },
                "45282bbe-1807-4581-fa49-0810f3ea21bd": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": null,
                    "id": "45282bbe-1807-4581-fa49-0810f3ea21bd",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "45282bbe-1807-4581-fa49-0810f3ea21bd",
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
                    "displayName": "",
                    "selected": false
                },
                "0175caff-72a0-0fea-1233-cd9a492c7a3b": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": null,
                    "id": "0175caff-72a0-0fea-1233-cd9a492c7a3b",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "0175caff-72a0-0fea-1233-cd9a492c7a3b",
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
                    "displayName": "",
                    "selected": false
                },
                "e7043fe8-838d-4f78-248e-91b82f768ea6": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": null,
                    "id": "e7043fe8-838d-4f78-248e-91b82f768ea6",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "e7043fe8-838d-4f78-248e-91b82f768ea6",
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
                    "name": "Reviewer",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": "",
                    "selected": false
                },
                "23f0d8dd-3a7e-a68d-5a6e-4b3ec00fa1bd": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": null,
                    "id": "23f0d8dd-3a7e-a68d-5a6e-4b3ec00fa1bd",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "23f0d8dd-3a7e-a68d-5a6e-4b3ec00fa1bd",
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
                    "name": "Reviewer",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": "",
                    "selected": false
                },
                "8faa65b0-dbde-3427-7818-aad33c1571ca": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                        "style": "{}",
                        "width": 100,
                        "x": 1759,
                        "y": 250,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "DocumentFormat",
                            "isCopy": false,
                            "isKey": false,
                            "name": "format",
                            "nameCamelCase": "format",
                            "namePascalCase": "Format",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "createdDate",
                            "nameCamelCase": "createdDate",
                            "namePascalCase": "CreatedDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "sentTo",
                            "nameCamelCase": "sentTo",
                            "namePascalCase": "SentTo",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "DocumentIssued",
                    "displayName": "문서 발급 완료",
                    "nameCamelCase": "documentIssued",
                    "namePascalCase": "DocumentIssued",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                    },
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "visibility": "public"
                },
                "e276a629-4038-03c0-d2bd-4be915e2b024": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "DocumentIssued"
                    ],
                    "aggregate": {
                        "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "controllerInfo": {
                        "method": "POST"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "DocumentFormat",
                            "isCopy": false,
                            "isKey": false,
                            "name": "format",
                            "nameCamelCase": "format",
                            "namePascalCase": "Format",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "style": "{}",
                        "width": 100,
                        "x": 1571,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "IssueDocument",
                    "displayName": "문서 발급",
                    "nameCamelCase": "issueDocument",
                    "namePascalCase": "IssueDocument",
                    "namePlural": "issueDocuments",
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
                                    "name": "Document",
                                    "value": {
                                        "documentId": "N/A",
                                        "applicationId": "APP-123",
                                        "format": "PDF",
                                        "createdDate": null,
                                        "sentTo": null,
                                        "applicationReviewId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "IssueDocument",
                                    "value": {
                                        "applicationId": "APP-123",
                                        "format": "PDF"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "DocumentIssued",
                                    "value": {
                                        "applicationId": "APP-123",
                                        "format": "PDF",
                                        "createdDate": "2024-03-20T12:00:00Z",
                                        "sentTo": "applicant@example.com"
                                    }
                                }
                            ]
                        },
                        {
                            "given": [
                                {
                                    "type": "Aggregate",
                                    "name": "Document",
                                    "value": {
                                        "documentId": "N/A",
                                        "applicationId": "APP-124",
                                        "format": "PDF",
                                        "createdDate": null,
                                        "sentTo": null,
                                        "applicationReviewId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "IssueDocument",
                                    "value": {
                                        "applicationId": "APP-124",
                                        "format": "OTHER"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "DocumentIssued",
                                    "value": {
                                        "applicationId": "APP-124",
                                        "format": "OTHER",
                                        "createdDate": null,
                                        "sentTo": null
                                    }
                                }
                            ]
                        }
                    ],
                    "visibility": "public"
                },
                "31c4b8cd-c05c-bab0-5616-efbfb181ba31": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "31c4b8cd-c05c-bab0-5616-efbfb181ba31",
                    "visibility": "public",
                    "name": "DocumentIssuanceSummary",
                    "oldName": "",
                    "displayName": "문서 발급 내역",
                    "namePascalCase": "DocumentIssuanceSummary",
                    "namePlural": "documentIssuanceSummaries",
                    "aggregate": {
                        "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
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
                            "name": "applicationId",
                            "nameCamelCase": "applicationId",
                            "namePascalCase": "ApplicationId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "DocumentFormat",
                            "isCopy": false,
                            "isKey": false,
                            "name": "format",
                            "nameCamelCase": "format",
                            "namePascalCase": "Format",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "createdDate",
                            "nameCamelCase": "createdDate",
                            "namePascalCase": "CreatedDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "sentTo",
                            "nameCamelCase": "sentTo",
                            "namePascalCase": "SentTo",
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
                        "id": "31c4b8cd-c05c-bab0-5616-efbfb181ba31",
                        "x": 1571,
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
                    "definitionId": "",
                    "selected": false
                },
                "23af8434-91ba-ab07-dbde-97c0e052070b": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": null,
                    "id": "23af8434-91ba-ab07-dbde-97c0e052070b",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "23af8434-91ba-ab07-dbde-97c0e052070b",
                        "style": "{}",
                        "width": 100,
                        "x": 1490,
                        "y": 250
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "System",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": "",
                    "selected": false
                },
                "8e9765b9-a0b2-c465-76c9-a4cf268a26bb": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": null,
                    "id": "8e9765b9-a0b2-c465-76c9-a4cf268a26bb",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "8e9765b9-a0b2-c465-76c9-a4cf268a26bb",
                        "style": "{}",
                        "width": 100,
                        "x": 1490,
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
                    "displayName": "",
                    "selected": false
                },
                "a35cc1b5-5399-2070-eaf1-f10eac2beb3e": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                        "style": "{}",
                        "width": 100,
                        "x": 2364,
                        "y": 250,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "monitorId",
                            "nameCamelCase": "monitorId",
                            "namePascalCase": "MonitorId",
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
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "lastChecked",
                            "nameCamelCase": "lastChecked",
                            "namePascalCase": "LastChecked",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "alerts",
                            "nameCamelCase": "alerts",
                            "namePascalCase": "Alerts",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "MonitorStatus",
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
                        "id": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "SystemMonitored",
                    "displayName": "시스템 모니터링 완료",
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
                        "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                    },
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "visibility": "public"
                },
                "295ea3f0-6a93-75f2-6b36-151ca8d11b2d": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                        "style": "{}",
                        "width": 100,
                        "x": 2364,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "monitorId",
                            "nameCamelCase": "monitorId",
                            "namePascalCase": "MonitorId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "errorDetail",
                            "nameCamelCase": "errorDetail",
                            "namePascalCase": "ErrorDetail",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "activatedAt",
                            "nameCamelCase": "activatedAt",
                            "namePascalCase": "ActivatedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BackupLoggingActivated",
                    "displayName": "백업 로깅 시스템 전환 완료",
                    "nameCamelCase": "backupLoggingActivated",
                    "namePascalCase": "BackupLoggingActivated",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                    },
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "visibility": "public"
                },
                "645a47c3-c65a-19fb-7811-8dd2994cca68": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "SystemMonitored"
                    ],
                    "aggregate": {
                        "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "controllerInfo": {
                        "method": "POST"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "monitorId",
                            "nameCamelCase": "monitorId",
                            "namePascalCase": "MonitorId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "style": "{}",
                        "width": 100,
                        "x": 2176,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "MonitorSystem",
                    "displayName": "시스템 모니터링 실행",
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
                                    "name": "SystemMonitor",
                                    "value": {
                                        "monitorId": 101,
                                        "serverStatus": "NORMAL",
                                        "transactionLog": "정상 로그 기록",
                                        "lastChecked": "2024-03-25T10:00:00Z",
                                        "alerts": [],
                                        "status": "NORMAL"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "MonitorSystem",
                                    "value": {
                                        "monitorId": 101
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "SystemMonitored",
                                    "value": {
                                        "monitorId": 101,
                                        "serverStatus": "NORMAL",
                                        "transactionLog": "정상 로그 기록",
                                        "lastChecked": "2024-03-25T10:05:00Z",
                                        "alerts": [],
                                        "status": "NORMAL"
                                    }
                                }
                            ]
                        }
                    ],
                    "visibility": "public"
                },
                "3738bd3a-f0c0-3636-0772-1d8acd44a8ce": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BackupLoggingActivated"
                    ],
                    "aggregate": {
                        "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "controllerInfo": {
                        "method": "POST"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "Long",
                            "isCopy": false,
                            "isKey": true,
                            "name": "monitorId",
                            "nameCamelCase": "monitorId",
                            "namePascalCase": "MonitorId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "errorDetail",
                            "nameCamelCase": "errorDetail",
                            "namePascalCase": "ErrorDetail",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "errorDetail",
                            "nameCamelCase": "errorDetail",
                            "namePascalCase": "ErrorDetail",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                        "style": "{}",
                        "width": 100,
                        "x": 2176,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ActivateBackupLogging",
                    "displayName": "백업 로깅 시스템 활성화",
                    "nameCamelCase": "activateBackupLogging",
                    "namePascalCase": "ActivateBackupLogging",
                    "namePlural": "activateBackupLoggings",
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
                                    "name": "SystemMonitor",
                                    "value": {
                                        "monitorId": 101,
                                        "serverStatus": "ALERT",
                                        "transactionLog": "오류 발생 로그",
                                        "lastChecked": "2024-03-25T10:05:00Z",
                                        "alerts": [
                                            "시스템 장애 감지"
                                        ],
                                        "status": "ALERT"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ActivateBackupLogging",
                                    "value": {
                                        "monitorId": 101,
                                        "errorDetail": "모니터링 도구 오류 - 백업 로깅 전환"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BackupLoggingActivated",
                                    "value": {
                                        "monitorId": 101,
                                        "errorDetail": "모니터링 도구 오류 - 백업 로깅 전환",
                                        "activatedAt": "2024-03-25T10:06:00Z"
                                    }
                                }
                            ]
                        }
                    ],
                    "visibility": "public"
                },
                "5295e95a-4db4-4cc2-e02b-0b08346edce8": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "5295e95a-4db4-4cc2-e02b-0b08346edce8",
                    "visibility": "public",
                    "name": "SystemMonitorSummary",
                    "oldName": "",
                    "displayName": "시스템 모니터링 요약",
                    "namePascalCase": "SystemMonitorSummary",
                    "namePlural": "systemMonitorSummaries",
                    "aggregate": {
                        "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
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
                            "name": "monitorId",
                            "nameCamelCase": "monitorId",
                            "namePascalCase": "MonitorId",
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
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "lastChecked",
                            "nameCamelCase": "lastChecked",
                            "namePascalCase": "LastChecked",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "alerts",
                            "nameCamelCase": "alerts",
                            "namePascalCase": "Alerts",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "MonitorStatus",
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
                        "id": "5295e95a-4db4-4cc2-e02b-0b08346edce8",
                        "x": 2176,
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
                    "definitionId": "",
                    "selected": false
                },
                "0d51f965-c28d-4d89-616e-655275aaa81b": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "description": null,
                    "id": "0d51f965-c28d-4d89-616e-655275aaa81b",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "0d51f965-c28d-4d89-616e-655275aaa81b",
                        "style": "{}",
                        "width": 100,
                        "x": 2095,
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
                    "displayName": "",
                    "selected": false
                },
                "3cf87e2f-d32b-c765-122e-718b88c42611": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "description": null,
                    "id": "3cf87e2f-d32b-c765-122e-718b88c42611",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "3cf87e2f-d32b-c765-122e-718b88c42611",
                        "style": "{}",
                        "width": 100,
                        "x": 2095,
                        "y": 380
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "System",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": "",
                    "selected": false
                },
                "43fa5c05-46dd-4f19-01cd-8780b33f4a68": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "description": null,
                    "id": "43fa5c05-46dd-4f19-01cd-8780b33f4a68",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "43fa5c05-46dd-4f19-01cd-8780b33f4a68",
                        "style": "{}",
                        "width": 100,
                        "x": 2095,
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
                    "displayName": "",
                    "selected": false
                },
                "5e160713-db48-9ea5-77e5-dc1c8314bd1e": {
                    "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": "신청서 최종 제출 시 발생하는 ApplicationSubmitted 이벤트를 감지하여, Document aggregate의 IssueDocument 명령을 실행함으로써 신청서의 상태를 제증명 처리 대기 상태로 전환하고 문서 발행 프로세스를 개시한다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 1452,
                        "y": 250,
                        "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "ApplicationSubmissionDocumentPolicy",
                    "displayName": "신청서 제출 문서 발행 자동화",
                    "nameCamelCase": "applicationSubmissionDocumentPolicy",
                    "namePascalCase": "ApplicationSubmissionDocumentPolicy",
                    "namePlural": "applicationSubmissionDocumentPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy",
                    "selected": false
                },
                "52cbfd28-a17f-4a0c-82f8-97c9336151b9": {
                    "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                    },
                    "description": "신청서 임시 저장 시 발생하는 ApplicationDraftSaved 이벤트를 교차 Bounded Context의 SystemMonitor aggregate로 전달하여, 시스템 모니터링 및 로깅 체계를 강화하고 운영 상태를 점검할 수 있도록 한다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 2057,
                        "y": 250,
                        "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "ApplicationDraftMonitoringPolicy",
                    "displayName": "임시 저장 신청서 모니터링",
                    "nameCamelCase": "applicationDraftMonitoringPolicy",
                    "namePascalCase": "ApplicationDraftMonitoringPolicy",
                    "namePlural": "applicationDraftMonitoringPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy",
                    "selected": false
                },
                "e16944e7-b8c4-f70f-9512-22a51f578b0b": {
                    "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                    },
                    "description": "민원 신청서가 승인되면, 문서 발급 프로세스를 시작하여 승인된 신청서에 대한 문서를 생성합니다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 1452,
                        "y": 250,
                        "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "ApplicationReviewApprovalDocumentPolicy",
                    "displayName": "심사 승인 후 문서 발급 자동화",
                    "nameCamelCase": "applicationReviewApprovalDocumentPolicy",
                    "namePascalCase": "ApplicationReviewApprovalDocumentPolicy",
                    "namePlural": "applicationReviewApprovalDocumentPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy",
                    "selected": false
                }
            },
            "relations": {
                "e8b6bee6-ac3a-447f-c5c9-6f5413a52bdc": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "e8b6bee6-ac3a-447f-c5c9-6f5413a52bdc",
                    "sourceElement": {
                        "aggregateRoot": {
                            "_type": "org.uengine.modeling.model.AggregateRoot",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": true,
                                    "name": "reviewId",
                                    "nameCamelCase": "reviewId",
                                    "namePascalCase": "ReviewId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "applicationId",
                                    "nameCamelCase": "applicationId",
                                    "namePascalCase": "ApplicationId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "reviewer",
                                    "nameCamelCase": "reviewer",
                                    "namePascalCase": "Reviewer",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "Date",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "reviewDate",
                                    "nameCamelCase": "reviewDate",
                                    "namePascalCase": "ReviewDate",
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
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "rejectionReason",
                                    "nameCamelCase": "rejectionReason",
                                    "namePascalCase": "RejectionReason",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "ebbb516c-08c6-075c-5fa0-33a7cffe0867": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "ebbb516c-08c6-075c-5fa0-33a7cffe0867",
                                        "name": "ApplicationReview",
                                        "namePascalCase": "ApplicationReview",
                                        "nameCamelCase": "applicationReview",
                                        "namePlural": "ApplicationReviews",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": true,
                                                "name": "reviewId",
                                                "displayName": "",
                                                "nameCamelCase": "reviewId",
                                                "namePascalCase": "ReviewId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "applicationId",
                                                "displayName": "",
                                                "nameCamelCase": "applicationId",
                                                "namePascalCase": "ApplicationId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "reviewer",
                                                "displayName": "",
                                                "nameCamelCase": "reviewer",
                                                "namePascalCase": "Reviewer",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "Date",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "reviewDate",
                                                "displayName": "",
                                                "nameCamelCase": "reviewDate",
                                                "namePascalCase": "ReviewDate",
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
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "rejectionReason",
                                                "displayName": "",
                                                "nameCamelCase": "rejectionReason",
                                                "namePascalCase": "RejectionReason",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "ebbb516c-08c6-075c-5fa0-33a7cffe0867",
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
                                        "parentId": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                                    },
                                    "27572536-3564-bae4-f9d5-008201819e91": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "27572536-3564-bae4-f9d5-008201819e91",
                                        "name": "ApplicationStatus",
                                        "displayName": "신청서 상태",
                                        "nameCamelCase": "applicationStatus",
                                        "namePascalCase": "ApplicationStatus",
                                        "namePlural": "applicationStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "27572536-3564-bae4-f9d5-008201819e91",
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
                                                "value": "PENDING"
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
                            "name": "886c1ea5-4b72-c968-7f43-c888489594ec",
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "commands": [],
                        "description": null,
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                            "x": 1235,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "ApplicationReview",
                        "displayName": "민원 신청서 검토",
                        "nameCamelCase": "applicationReview",
                        "namePascalCase": "ApplicationReview",
                        "namePlural": "applicationReviews",
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
                                    "name": "detail",
                                    "nameCamelCase": "detail",
                                    "namePascalCase": "Detail",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "attachment",
                                    "nameCamelCase": "attachment",
                                    "namePascalCase": "Attachment",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "residentRegistrationNumber",
                                    "nameCamelCase": "residentRegistrationNumber",
                                    "namePascalCase": "ResidentRegistrationNumber",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "address",
                                    "nameCamelCase": "address",
                                    "namePascalCase": "Address",
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
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "89cf284d-f75c-94db-0660-74f117eb9764": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "89cf284d-f75c-94db-0660-74f117eb9764",
                                        "name": "ApplicationForm",
                                        "namePascalCase": "ApplicationForm",
                                        "nameCamelCase": "applicationForm",
                                        "namePlural": "ApplicationForms",
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
                                                "name": "detail",
                                                "displayName": "",
                                                "nameCamelCase": "detail",
                                                "namePascalCase": "Detail",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "attachment",
                                                "displayName": "",
                                                "nameCamelCase": "attachment",
                                                "namePascalCase": "Attachment",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "residentRegistrationNumber",
                                                "displayName": "",
                                                "nameCamelCase": "residentRegistrationNumber",
                                                "namePascalCase": "ResidentRegistrationNumber",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "address",
                                                "displayName": "",
                                                "nameCamelCase": "address",
                                                "namePascalCase": "Address",
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
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "89cf284d-f75c-94db-0660-74f117eb9764",
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
                                        "parentId": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                                    },
                                    "d50a3c1b-805d-9fd0-fe26-a48d639c2d01": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "d50a3c1b-805d-9fd0-fe26-a48d639c2d01",
                                        "name": "ApplicationStatus",
                                        "displayName": "신청서 상태",
                                        "nameCamelCase": "applicationStatus",
                                        "namePascalCase": "ApplicationStatus",
                                        "namePlural": "applicationStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "d50a3c1b-805d-9fd0-fe26-a48d639c2d01",
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
                                                "value": "Draft"
                                            },
                                            {
                                                "value": "PendingReview"
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
                            "name": "af1cc5ab-8a10-648b-d119-90a732415c27",
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                        },
                        "commands": [],
                        "description": null,
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                            "x": 650,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "ApplicationForm",
                        "displayName": "민원 신청서",
                        "nameCamelCase": "applicationForm",
                        "namePascalCase": "ApplicationForm",
                        "namePlural": "applicationForms",
                        "rotateStatus": false,
                        "selected": false,
                        "_type": "org.uengine.modeling.model.Aggregate"
                    },
                    "from": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                    "to": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                    "relationView": {
                        "id": "e8b6bee6-ac3a-447f-c5c9-6f5413a52bdc",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "to": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "needReconnect": true,
                        "value": "[[1170,456],[715,456]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "id": "e8b6bee6-ac3a-447f-c5c9-6f5413a52bdc",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "d2e2bc60-b15b-ecd2-6781-7dc2c0aa285a": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "d2e2bc60-b15b-ecd2-6781-7dc2c0aa285a",
                    "sourceElement": {
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
                                    "name": "detail",
                                    "nameCamelCase": "detail",
                                    "namePascalCase": "Detail",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "attachment",
                                    "nameCamelCase": "attachment",
                                    "namePascalCase": "Attachment",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "residentRegistrationNumber",
                                    "nameCamelCase": "residentRegistrationNumber",
                                    "namePascalCase": "ResidentRegistrationNumber",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "address",
                                    "nameCamelCase": "address",
                                    "namePascalCase": "Address",
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
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "89cf284d-f75c-94db-0660-74f117eb9764": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "89cf284d-f75c-94db-0660-74f117eb9764",
                                        "name": "ApplicationForm",
                                        "namePascalCase": "ApplicationForm",
                                        "nameCamelCase": "applicationForm",
                                        "namePlural": "ApplicationForms",
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
                                                "name": "detail",
                                                "displayName": "",
                                                "nameCamelCase": "detail",
                                                "namePascalCase": "Detail",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "attachment",
                                                "displayName": "",
                                                "nameCamelCase": "attachment",
                                                "namePascalCase": "Attachment",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "residentRegistrationNumber",
                                                "displayName": "",
                                                "nameCamelCase": "residentRegistrationNumber",
                                                "namePascalCase": "ResidentRegistrationNumber",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "address",
                                                "displayName": "",
                                                "nameCamelCase": "address",
                                                "namePascalCase": "Address",
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
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "89cf284d-f75c-94db-0660-74f117eb9764",
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
                                        "parentId": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                                    },
                                    "d50a3c1b-805d-9fd0-fe26-a48d639c2d01": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "d50a3c1b-805d-9fd0-fe26-a48d639c2d01",
                                        "name": "ApplicationStatus",
                                        "displayName": "신청서 상태",
                                        "nameCamelCase": "applicationStatus",
                                        "namePascalCase": "ApplicationStatus",
                                        "namePlural": "applicationStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "d50a3c1b-805d-9fd0-fe26-a48d639c2d01",
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
                                                "value": "Draft"
                                            },
                                            {
                                                "value": "PendingReview"
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
                            "name": "af1cc5ab-8a10-648b-d119-90a732415c27",
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                        },
                        "commands": [],
                        "description": null,
                        "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                            "x": 650,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "ApplicationForm",
                        "displayName": "민원 신청서",
                        "nameCamelCase": "applicationForm",
                        "namePascalCase": "ApplicationForm",
                        "namePlural": "applicationForms",
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
                                    "name": "documentId",
                                    "nameCamelCase": "documentId",
                                    "namePascalCase": "DocumentId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "applicationId",
                                    "nameCamelCase": "applicationId",
                                    "namePascalCase": "ApplicationId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "DocumentFormat",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "format",
                                    "nameCamelCase": "format",
                                    "namePascalCase": "Format",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "Date",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "createdDate",
                                    "nameCamelCase": "createdDate",
                                    "namePascalCase": "CreatedDate",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "sentTo",
                                    "nameCamelCase": "sentTo",
                                    "namePascalCase": "SentTo",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "1e523b48-6fab-2056-f95a-1338c1f648c9": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "1e523b48-6fab-2056-f95a-1338c1f648c9",
                                        "name": "Document",
                                        "namePascalCase": "Document",
                                        "nameCamelCase": "document",
                                        "namePlural": "Documents",
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
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "applicationId",
                                                "displayName": "",
                                                "nameCamelCase": "applicationId",
                                                "namePascalCase": "ApplicationId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "DocumentFormat",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "format",
                                                "displayName": "",
                                                "nameCamelCase": "format",
                                                "namePascalCase": "Format",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "Date",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "createdDate",
                                                "displayName": "",
                                                "nameCamelCase": "createdDate",
                                                "namePascalCase": "CreatedDate",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "sentTo",
                                                "displayName": "",
                                                "nameCamelCase": "sentTo",
                                                "namePascalCase": "SentTo",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "1e523b48-6fab-2056-f95a-1338c1f648c9",
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
                                        "parentId": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                                    },
                                    "ab12c5b2-30f8-9585-c974-360da3e0fa84": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "ab12c5b2-30f8-9585-c974-360da3e0fa84",
                                        "name": "DocumentFormat",
                                        "displayName": "문서 포맷",
                                        "nameCamelCase": "documentFormat",
                                        "namePascalCase": "DocumentFormat",
                                        "namePlural": "documentFormats",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "ab12c5b2-30f8-9585-c974-360da3e0fa84",
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
                                                "value": "OTHER"
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
                            "name": "886c1ea5-4b72-c968-7f43-c888489594ec",
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "commands": [],
                        "description": null,
                        "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                            "x": 1665,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "Document",
                        "displayName": "민원 문서",
                        "nameCamelCase": "document",
                        "namePascalCase": "Document",
                        "namePlural": "documents",
                        "rotateStatus": false,
                        "selected": false,
                        "_type": "org.uengine.modeling.model.Aggregate"
                    },
                    "from": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                    "to": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                    "relationView": {
                        "id": "d2e2bc60-b15b-ecd2-6781-7dc2c0aa285a",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "to": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "needReconnect": true,
                        "value": "[[715,456],[1600,456]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "39120b26-cdde-82ad-fa95-a25d828ad2b7",
                        "id": "d2e2bc60-b15b-ecd2-6781-7dc2c0aa285a",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "69ff7246-e3c6-f3b8-8353-d89ec8fa3b7b": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "69ff7246-e3c6-f3b8-8353-d89ec8fa3b7b",
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
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "applicationId",
                                    "nameCamelCase": "applicationId",
                                    "namePascalCase": "ApplicationId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "DocumentFormat",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "format",
                                    "nameCamelCase": "format",
                                    "namePascalCase": "Format",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "Date",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "createdDate",
                                    "nameCamelCase": "createdDate",
                                    "namePascalCase": "CreatedDate",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "sentTo",
                                    "nameCamelCase": "sentTo",
                                    "namePascalCase": "SentTo",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "1e523b48-6fab-2056-f95a-1338c1f648c9": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "1e523b48-6fab-2056-f95a-1338c1f648c9",
                                        "name": "Document",
                                        "namePascalCase": "Document",
                                        "nameCamelCase": "document",
                                        "namePlural": "Documents",
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
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "applicationId",
                                                "displayName": "",
                                                "nameCamelCase": "applicationId",
                                                "namePascalCase": "ApplicationId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "DocumentFormat",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "format",
                                                "displayName": "",
                                                "nameCamelCase": "format",
                                                "namePascalCase": "Format",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "Date",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "createdDate",
                                                "displayName": "",
                                                "nameCamelCase": "createdDate",
                                                "namePascalCase": "CreatedDate",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "sentTo",
                                                "displayName": "",
                                                "nameCamelCase": "sentTo",
                                                "namePascalCase": "SentTo",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "1e523b48-6fab-2056-f95a-1338c1f648c9",
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
                                        "parentId": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                                    },
                                    "ab12c5b2-30f8-9585-c974-360da3e0fa84": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "ab12c5b2-30f8-9585-c974-360da3e0fa84",
                                        "name": "DocumentFormat",
                                        "displayName": "문서 포맷",
                                        "nameCamelCase": "documentFormat",
                                        "namePascalCase": "DocumentFormat",
                                        "namePlural": "documentFormats",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "ab12c5b2-30f8-9585-c974-360da3e0fa84",
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
                                                "value": "OTHER"
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
                            "name": "886c1ea5-4b72-c968-7f43-c888489594ec",
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "commands": [],
                        "description": null,
                        "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                            "x": 1665,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "Document",
                        "displayName": "민원 문서",
                        "nameCamelCase": "document",
                        "namePascalCase": "Document",
                        "namePlural": "documents",
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
                                    "name": "reviewId",
                                    "nameCamelCase": "reviewId",
                                    "namePascalCase": "ReviewId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "applicationId",
                                    "nameCamelCase": "applicationId",
                                    "namePascalCase": "ApplicationId",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "reviewer",
                                    "nameCamelCase": "reviewer",
                                    "namePascalCase": "Reviewer",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "Date",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "reviewDate",
                                    "nameCamelCase": "reviewDate",
                                    "namePascalCase": "ReviewDate",
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
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "rejectionReason",
                                    "nameCamelCase": "rejectionReason",
                                    "namePascalCase": "RejectionReason",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "ApplicationFormId",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "applicationFormId",
                                    "nameCamelCase": "applicationFormId",
                                    "namePascalCase": "ApplicationFormId",
                                    "displayName": "",
                                    "referenceClass": "ApplicationForm",
                                    "isOverrideField": true,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "ebbb516c-08c6-075c-5fa0-33a7cffe0867": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "ebbb516c-08c6-075c-5fa0-33a7cffe0867",
                                        "name": "ApplicationReview",
                                        "namePascalCase": "ApplicationReview",
                                        "nameCamelCase": "applicationReview",
                                        "namePlural": "ApplicationReviews",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": true,
                                                "name": "reviewId",
                                                "displayName": "",
                                                "nameCamelCase": "reviewId",
                                                "namePascalCase": "ReviewId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "applicationId",
                                                "displayName": "",
                                                "nameCamelCase": "applicationId",
                                                "namePascalCase": "ApplicationId",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "reviewer",
                                                "displayName": "",
                                                "nameCamelCase": "reviewer",
                                                "namePascalCase": "Reviewer",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "Date",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "reviewDate",
                                                "displayName": "",
                                                "nameCamelCase": "reviewDate",
                                                "namePascalCase": "ReviewDate",
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
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "rejectionReason",
                                                "displayName": "",
                                                "nameCamelCase": "rejectionReason",
                                                "namePascalCase": "RejectionReason",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "ApplicationFormId",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "applicationFormId",
                                                "nameCamelCase": "applicationFormId",
                                                "namePascalCase": "ApplicationFormId",
                                                "displayName": "",
                                                "referenceClass": "ApplicationForm",
                                                "isOverrideField": true,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "ebbb516c-08c6-075c-5fa0-33a7cffe0867",
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
                                        "parentId": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                                    },
                                    "27572536-3564-bae4-f9d5-008201819e91": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "27572536-3564-bae4-f9d5-008201819e91",
                                        "name": "ApplicationStatus",
                                        "displayName": "신청서 상태",
                                        "nameCamelCase": "applicationStatus",
                                        "namePascalCase": "ApplicationStatus",
                                        "namePlural": "applicationStatuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "27572536-3564-bae4-f9d5-008201819e91",
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
                                                "value": "PENDING"
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
                                    },
                                    "0fad5eab-c72e-7b7f-b432-159549c2730b": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "0fad5eab-c72e-7b7f-b432-159549c2730b",
                                        "name": "ApplicationFormId",
                                        "displayName": "",
                                        "namePascalCase": "ApplicationFormId",
                                        "nameCamelCase": "applicationFormId",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isKey": true,
                                                "label": "- applicationId: String",
                                                "name": "applicationId",
                                                "nameCamelCase": "applicationId",
                                                "namePascalCase": "ApplicationId",
                                                "displayName": "",
                                                "referenceClass": "ApplicationForm",
                                                "isOverrideField": true,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "0fad5eab-c72e-7b7f-b432-159549c2730b",
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
                                        "namePlural": "ApplicationFormIds",
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
                            "name": "886c1ea5-4b72-c968-7f43-c888489594ec",
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "commands": [],
                        "description": null,
                        "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                            "x": 1235,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "ApplicationReview",
                        "displayName": "민원 신청서 검토",
                        "nameCamelCase": "applicationReview",
                        "namePascalCase": "ApplicationReview",
                        "namePlural": "applicationReviews",
                        "rotateStatus": false,
                        "selected": false,
                        "_type": "org.uengine.modeling.model.Aggregate"
                    },
                    "from": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                    "to": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                    "relationView": {
                        "id": "69ff7246-e3c6-f3b8-8353-d89ec8fa3b7b",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "to": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "needReconnect": true,
                        "value": "[[1600,456],[1300,456]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd",
                        "id": "69ff7246-e3c6-f3b8-8353-d89ec8fa3b7b",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "8046de29-aeab-65f8-db12-c3ffe41abea5",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "d52c5280-3f33-c4b9-bacf-0791f6e7a60c": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "d52c5280-3f33-c4b9-bacf-0791f6e7a60c",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "ApplicationDraftSaved"
                        ],
                        "aggregate": {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
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
                                "name": "attachment",
                                "nameCamelCase": "attachment",
                                "namePascalCase": "Attachment",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "residentRegistrationNumber",
                                "nameCamelCase": "residentRegistrationNumber",
                                "namePascalCase": "ResidentRegistrationNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "address",
                                "nameCamelCase": "address",
                                "namePascalCase": "Address",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "707794be-6f3b-f683-1e06-100f5044c1fd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "707794be-6f3b-f683-1e06-100f5044c1fd",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "707794be-6f3b-f683-1e06-100f5044c1fd",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "TemporarySaveApplication",
                        "displayName": "임시 저장 민원 신청서",
                        "nameCamelCase": "temporarySaveApplication",
                        "namePascalCase": "TemporarySaveApplication",
                        "namePlural": "temporarySaveApplications",
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
                        "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
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
                                "name": "attachment",
                                "nameCamelCase": "attachment",
                                "namePascalCase": "Attachment",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "residentRegistrationNumber",
                                "nameCamelCase": "residentRegistrationNumber",
                                "namePascalCase": "ResidentRegistrationNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "address",
                                "nameCamelCase": "address",
                                "namePascalCase": "Address",
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
                            "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ApplicationDraftSaved",
                        "displayName": "임시 저장된 민원 신청서 생성됨",
                        "nameCamelCase": "applicationDraftSaved",
                        "namePascalCase": "ApplicationDraftSaved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        },
                        "boundedContext": {
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                        }
                    },
                    "from": "707794be-6f3b-f683-1e06-100f5044c1fd",
                    "to": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                    "relationView": {
                        "id": "d52c5280-3f33-c4b9-bacf-0791f6e7a60c",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "707794be-6f3b-f683-1e06-100f5044c1fd",
                        "to": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                        "needReconnect": true,
                        "value": "[[606,252],[694,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "707794be-6f3b-f683-1e06-100f5044c1fd",
                        "id": "d52c5280-3f33-c4b9-bacf-0791f6e7a60c",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "3e3b1367-f0ff-fa20-dd61-8e049de6a299": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "3e3b1367-f0ff-fa20-dd61-8e049de6a299",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "ApplicationSubmitted"
                        ],
                        "aggregate": {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
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
                                "name": "attachment",
                                "nameCamelCase": "attachment",
                                "namePascalCase": "Attachment",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "residentRegistrationNumber",
                                "nameCamelCase": "residentRegistrationNumber",
                                "namePascalCase": "ResidentRegistrationNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "address",
                                "nameCamelCase": "address",
                                "namePascalCase": "Address",
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
                        "description": null,
                        "id": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "SubmitApplication",
                        "displayName": "민원 신청서 제출",
                        "nameCamelCase": "submitApplication",
                        "namePascalCase": "SubmitApplication",
                        "namePlural": "submitApplications",
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
                        "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
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
                                "name": "attachment",
                                "nameCamelCase": "attachment",
                                "namePascalCase": "Attachment",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "residentRegistrationNumber",
                                "nameCamelCase": "residentRegistrationNumber",
                                "namePascalCase": "ResidentRegistrationNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "address",
                                "nameCamelCase": "address",
                                "namePascalCase": "Address",
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
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "submitDate",
                                "nameCamelCase": "submitDate",
                                "namePascalCase": "SubmitDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ApplicationSubmitted",
                        "displayName": "민원 신청서 제출 완료됨",
                        "nameCamelCase": "applicationSubmitted",
                        "namePascalCase": "ApplicationSubmitted",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        },
                        "boundedContext": {
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                        }
                    },
                    "from": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                    "to": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                    "relationView": {
                        "id": "3e3b1367-f0ff-fa20-dd61-8e049de6a299",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                        "to": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                        "needReconnect": true,
                        "value": "[[606,380],[694,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "fb44e9a8-29fd-2a3d-2642-bc0a47be31d6",
                        "id": "3e3b1367-f0ff-fa20-dd61-8e049de6a299",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "2d676dd5-7088-2477-af61-ae1825af4c26": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "2d676dd5-7088-2477-af61-ae1825af4c26",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "ApplicationReviewApproved"
                        ],
                        "aggregate": {
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "controllerInfo": {
                            "method": "PUT"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "reviewId",
                                "nameCamelCase": "reviewId",
                                "namePascalCase": "ReviewId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reviewer",
                                "nameCamelCase": "reviewer",
                                "namePascalCase": "Reviewer",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ApproveApplicationReview",
                        "displayName": "민원 신청 승인",
                        "nameCamelCase": "approveApplicationReview",
                        "namePascalCase": "ApproveApplicationReview",
                        "namePlural": "approveApplicationReviews",
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
                        "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 250,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "reviewId",
                                "nameCamelCase": "reviewId",
                                "namePascalCase": "ReviewId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
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
                                "name": "reviewer",
                                "nameCamelCase": "reviewer",
                                "namePascalCase": "Reviewer",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reviewDate",
                                "nameCamelCase": "reviewDate",
                                "namePascalCase": "ReviewDate",
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
                            "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ApplicationReviewApproved",
                        "displayName": "민원 신청 승인됨",
                        "nameCamelCase": "applicationReviewApproved",
                        "namePascalCase": "ApplicationReviewApproved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                        },
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        }
                    },
                    "from": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                    "to": "692db540-1c57-1df9-982f-6398c4c279d9",
                    "relationView": {
                        "id": "2d676dd5-7088-2477-af61-ae1825af4c26",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                        "to": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "needReconnect": true,
                        "value": "[[1191,252],[1279,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "60773c6d-b4f0-d588-7aef-5842ea8aeb2a",
                        "id": "2d676dd5-7088-2477-af61-ae1825af4c26",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "2e496eb4-e949-f581-71c8-835e4e351eae": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "2e496eb4-e949-f581-71c8-835e4e351eae",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "ApplicationReviewRejected"
                        ],
                        "aggregate": {
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "controllerInfo": {
                            "method": "PUT"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "reviewId",
                                "nameCamelCase": "reviewId",
                                "namePascalCase": "ReviewId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reviewer",
                                "nameCamelCase": "reviewer",
                                "namePascalCase": "Reviewer",
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
                        "id": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "RejectApplicationReview",
                        "displayName": "민원 신청 반려",
                        "nameCamelCase": "rejectApplicationReview",
                        "namePascalCase": "RejectApplicationReview",
                        "namePlural": "rejectApplicationReviews",
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
                        "id": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "reviewId",
                                "nameCamelCase": "reviewId",
                                "namePascalCase": "ReviewId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
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
                                "name": "reviewer",
                                "nameCamelCase": "reviewer",
                                "namePascalCase": "Reviewer",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reviewDate",
                                "nameCamelCase": "reviewDate",
                                "namePascalCase": "ReviewDate",
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
                        "hexagonalView": {
                            "height": 0,
                            "id": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ApplicationReviewRejected",
                        "displayName": "민원 신청 반려됨",
                        "nameCamelCase": "applicationReviewRejected",
                        "namePascalCase": "ApplicationReviewRejected",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                        },
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        }
                    },
                    "from": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                    "to": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                    "relationView": {
                        "id": "2e496eb4-e949-f581-71c8-835e4e351eae",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                        "to": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                        "needReconnect": true,
                        "value": "[[1191,380],[1279,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "0df9b6da-7669-ec3c-af1b-9c0e102218b6",
                        "id": "2e496eb4-e949-f581-71c8-835e4e351eae",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "6ec7b754-ff48-048a-c096-36c4c4883e16",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "feefb19a-e320-5040-c0f3-7d8ba58bfa1d": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "feefb19a-e320-5040-c0f3-7d8ba58bfa1d",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "DocumentIssued"
                        ],
                        "aggregate": {
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "format",
                                "nameCamelCase": "format",
                                "namePascalCase": "Format",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                            "style": "{}",
                            "width": 100,
                            "x": 1571,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "IssueDocument",
                        "displayName": "문서 발급",
                        "nameCamelCase": "issueDocument",
                        "namePascalCase": "IssueDocument",
                        "namePlural": "issueDocuments",
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
                        "id": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                            "style": "{}",
                            "width": 100,
                            "x": 1759,
                            "y": 250,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "format",
                                "nameCamelCase": "format",
                                "namePascalCase": "Format",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "createdDate",
                                "nameCamelCase": "createdDate",
                                "namePascalCase": "CreatedDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "sentTo",
                                "nameCamelCase": "sentTo",
                                "namePascalCase": "SentTo",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "DocumentIssued",
                        "displayName": "문서 발급 완료",
                        "nameCamelCase": "documentIssued",
                        "namePascalCase": "DocumentIssued",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                        },
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        }
                    },
                    "from": "e276a629-4038-03c0-d2bd-4be915e2b024",
                    "to": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                    "relationView": {
                        "id": "feefb19a-e320-5040-c0f3-7d8ba58bfa1d",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "to": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                        "needReconnect": true,
                        "value": "[[1621,252],[1709,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "id": "feefb19a-e320-5040-c0f3-7d8ba58bfa1d",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "8faa65b0-dbde-3427-7818-aad33c1571ca",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "1eaf495a-af7c-94b1-6b0f-fbca1da50fbe": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "1eaf495a-af7c-94b1-6b0f-fbca1da50fbe",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "SystemMonitored"
                        ],
                        "aggregate": {
                            "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "monitorId",
                                "nameCamelCase": "monitorId",
                                "namePascalCase": "MonitorId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                            "style": "{}",
                            "width": 100,
                            "x": 2176,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "MonitorSystem",
                        "displayName": "시스템 모니터링 실행",
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
                        "id": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                            "style": "{}",
                            "width": 100,
                            "x": 2364,
                            "y": 250,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "monitorId",
                                "nameCamelCase": "monitorId",
                                "namePascalCase": "MonitorId",
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
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "lastChecked",
                                "nameCamelCase": "lastChecked",
                                "namePascalCase": "LastChecked",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "alerts",
                                "nameCamelCase": "alerts",
                                "namePascalCase": "Alerts",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "MonitorStatus",
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
                            "id": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "SystemMonitored",
                        "displayName": "시스템 모니터링 완료",
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
                            "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                        },
                        "boundedContext": {
                            "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                        }
                    },
                    "from": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                    "to": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                    "relationView": {
                        "id": "1eaf495a-af7c-94b1-6b0f-fbca1da50fbe",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "to": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                        "needReconnect": true,
                        "value": "[[2226,252],[2314,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "id": "1eaf495a-af7c-94b1-6b0f-fbca1da50fbe",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "a35cc1b5-5399-2070-eaf1-f10eac2beb3e",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "4816c87e-32ff-3a31-d6b5-5b3600ad1ea0": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "4816c87e-32ff-3a31-d6b5-5b3600ad1ea0",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BackupLoggingActivated"
                        ],
                        "aggregate": {
                            "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "monitorId",
                                "nameCamelCase": "monitorId",
                                "namePascalCase": "MonitorId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "errorDetail",
                                "nameCamelCase": "errorDetail",
                                "namePascalCase": "ErrorDetail",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "errorDetail",
                                "nameCamelCase": "errorDetail",
                                "namePascalCase": "ErrorDetail",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                            "style": "{}",
                            "width": 100,
                            "x": 2176,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ActivateBackupLogging",
                        "displayName": "백업 로깅 시스템 활성화",
                        "nameCamelCase": "activateBackupLogging",
                        "namePascalCase": "ActivateBackupLogging",
                        "namePlural": "activateBackupLoggings",
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
                        "id": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                            "style": "{}",
                            "width": 100,
                            "x": 2364,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "monitorId",
                                "nameCamelCase": "monitorId",
                                "namePascalCase": "MonitorId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "errorDetail",
                                "nameCamelCase": "errorDetail",
                                "namePascalCase": "ErrorDetail",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "activatedAt",
                                "nameCamelCase": "activatedAt",
                                "namePascalCase": "ActivatedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BackupLoggingActivated",
                        "displayName": "백업 로깅 시스템 전환 완료",
                        "nameCamelCase": "backupLoggingActivated",
                        "namePascalCase": "BackupLoggingActivated",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                        },
                        "boundedContext": {
                            "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                        }
                    },
                    "from": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                    "to": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                    "relationView": {
                        "id": "4816c87e-32ff-3a31-d6b5-5b3600ad1ea0",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                        "to": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                        "needReconnect": true,
                        "value": "[[2226,380],[2314,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "3738bd3a-f0c0-3636-0772-1d8acd44a8ce",
                        "id": "4816c87e-32ff-3a31-d6b5-5b3600ad1ea0",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "295ea3f0-6a93-75f2-6b36-151ca8d11b2d",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "8b16108d-d01d-20ba-7ec1-9868342a677b": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "8b16108d-d01d-20ba-7ec1-9868342a677b",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
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
                                "name": "attachment",
                                "nameCamelCase": "attachment",
                                "namePascalCase": "Attachment",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "residentRegistrationNumber",
                                "nameCamelCase": "residentRegistrationNumber",
                                "namePascalCase": "ResidentRegistrationNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "address",
                                "nameCamelCase": "address",
                                "namePascalCase": "Address",
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
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "submitDate",
                                "nameCamelCase": "submitDate",
                                "namePascalCase": "SubmitDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ApplicationSubmitted",
                        "displayName": "민원 신청서 제출 완료됨",
                        "nameCamelCase": "applicationSubmitted",
                        "namePascalCase": "ApplicationSubmitted",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        },
                        "boundedContext": {
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                        }
                    },
                    "targetElement": {
                        "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "description": "신청서 최종 제출 시 발생하는 ApplicationSubmitted 이벤트를 감지하여, Document aggregate의 IssueDocument 명령을 실행함으로써 신청서의 상태를 제증명 처리 대기 상태로 전환하고 문서 발행 프로세스를 개시한다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1452,
                            "y": 250,
                            "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ApplicationSubmissionDocumentPolicy",
                        "displayName": "신청서 제출 문서 발행 자동화",
                        "nameCamelCase": "applicationSubmissionDocumentPolicy",
                        "namePascalCase": "ApplicationSubmissionDocumentPolicy",
                        "namePlural": "applicationSubmissionDocumentPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                    "to": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                    "relationView": {
                        "id": "8b16108d-d01d-20ba-7ec1-9868342a677b",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                        "to": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "needReconnect": true,
                        "value": "[[794,380],[1100,380],[1100,252],[1402,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "17c64ef9-77d3-1c17-4e3e-5a755753f79b",
                        "id": "8b16108d-d01d-20ba-7ec1-9868342a677b",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "a319d619-a4dd-a4ce-70d5-a4ae63aafe91": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "a319d619-a4dd-a4ce-70d5-a4ae63aafe91",
                    "sourceElement": {
                        "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "description": "신청서 최종 제출 시 발생하는 ApplicationSubmitted 이벤트를 감지하여, Document aggregate의 IssueDocument 명령을 실행함으로써 신청서의 상태를 제증명 처리 대기 상태로 전환하고 문서 발행 프로세스를 개시한다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1452,
                            "y": 250,
                            "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ApplicationSubmissionDocumentPolicy",
                        "displayName": "신청서 제출 문서 발행 자동화",
                        "nameCamelCase": "applicationSubmissionDocumentPolicy",
                        "namePascalCase": "ApplicationSubmissionDocumentPolicy",
                        "namePlural": "applicationSubmissionDocumentPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "DocumentIssued"
                        ],
                        "aggregate": {
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "format",
                                "nameCamelCase": "format",
                                "namePascalCase": "Format",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                            "style": "{}",
                            "width": 100,
                            "x": 1571,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "IssueDocument",
                        "displayName": "문서 발급",
                        "nameCamelCase": "issueDocument",
                        "namePascalCase": "IssueDocument",
                        "namePlural": "issueDocuments",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "POST"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                    "to": "e276a629-4038-03c0-d2bd-4be915e2b024",
                    "relationView": {
                        "id": "a319d619-a4dd-a4ce-70d5-a4ae63aafe91",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "to": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "needReconnect": true,
                        "value": "[[1502,252],[1521,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "5e160713-db48-9ea5-77e5-dc1c8314bd1e",
                        "id": "a319d619-a4dd-a4ce-70d5-a4ae63aafe91",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "2c6c4dcc-ed0c-c1ed-f92a-71d0d1dbdbba": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "2c6c4dcc-ed0c-c1ed-f92a-71d0d1dbdbba",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
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
                                "name": "attachment",
                                "nameCamelCase": "attachment",
                                "namePascalCase": "Attachment",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "residentRegistrationNumber",
                                "nameCamelCase": "residentRegistrationNumber",
                                "namePascalCase": "ResidentRegistrationNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "address",
                                "nameCamelCase": "address",
                                "namePascalCase": "Address",
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
                            "id": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ApplicationDraftSaved",
                        "displayName": "임시 저장된 민원 신청서 생성됨",
                        "nameCamelCase": "applicationDraftSaved",
                        "namePascalCase": "ApplicationDraftSaved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "39120b26-cdde-82ad-fa95-a25d828ad2b7"
                        },
                        "boundedContext": {
                            "id": "af1cc5ab-8a10-648b-d119-90a732415c27"
                        }
                    },
                    "targetElement": {
                        "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                        },
                        "description": "신청서 임시 저장 시 발생하는 ApplicationDraftSaved 이벤트를 교차 Bounded Context의 SystemMonitor aggregate로 전달하여, 시스템 모니터링 및 로깅 체계를 강화하고 운영 상태를 점검할 수 있도록 한다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 2057,
                            "y": 250,
                            "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ApplicationDraftMonitoringPolicy",
                        "displayName": "임시 저장 신청서 모니터링",
                        "nameCamelCase": "applicationDraftMonitoringPolicy",
                        "namePascalCase": "ApplicationDraftMonitoringPolicy",
                        "namePlural": "applicationDraftMonitoringPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                    "to": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                    "relationView": {
                        "id": "2c6c4dcc-ed0c-c1ed-f92a-71d0d1dbdbba",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                        "to": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "needReconnect": true,
                        "value": "[[794,252],[2007,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "55357fca-db61-d383-c8ec-8a24a26abeb3",
                        "id": "2c6c4dcc-ed0c-c1ed-f92a-71d0d1dbdbba",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "2e0a5679-6129-ac6a-eb44-89d8db43a01e": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "2e0a5679-6129-ac6a-eb44-89d8db43a01e",
                    "sourceElement": {
                        "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                        },
                        "description": "신청서 임시 저장 시 발생하는 ApplicationDraftSaved 이벤트를 교차 Bounded Context의 SystemMonitor aggregate로 전달하여, 시스템 모니터링 및 로깅 체계를 강화하고 운영 상태를 점검할 수 있도록 한다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 2057,
                            "y": 250,
                            "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ApplicationDraftMonitoringPolicy",
                        "displayName": "임시 저장 신청서 모니터링",
                        "nameCamelCase": "applicationDraftMonitoringPolicy",
                        "namePascalCase": "ApplicationDraftMonitoringPolicy",
                        "namePlural": "applicationDraftMonitoringPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "SystemMonitored"
                        ],
                        "aggregate": {
                            "id": "9d7631f0-85d0-d398-e1d7-054976d2a870"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "81fab6f5-399c-4722-35ba-75ec4c67a041"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "monitorId",
                                "nameCamelCase": "monitorId",
                                "namePascalCase": "MonitorId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                            "style": "{}",
                            "width": 100,
                            "x": 2176,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "MonitorSystem",
                        "displayName": "시스템 모니터링 실행",
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
                    "from": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                    "to": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                    "relationView": {
                        "id": "2e0a5679-6129-ac6a-eb44-89d8db43a01e",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "to": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "needReconnect": true,
                        "value": "[[2107,252],[2126,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "52cbfd28-a17f-4a0c-82f8-97c9336151b9",
                        "id": "2e0a5679-6129-ac6a-eb44-89d8db43a01e",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "645a47c3-c65a-19fb-7811-8dd2994cca68",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "5b8c6bf5-100c-e2d5-fdac-6cecb5f09859": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "5b8c6bf5-100c-e2d5-fdac-6cecb5f09859",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 250,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "Long",
                                "isCopy": false,
                                "isKey": true,
                                "name": "reviewId",
                                "nameCamelCase": "reviewId",
                                "namePascalCase": "ReviewId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
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
                                "name": "reviewer",
                                "nameCamelCase": "reviewer",
                                "namePascalCase": "Reviewer",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reviewDate",
                                "nameCamelCase": "reviewDate",
                                "namePascalCase": "ReviewDate",
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
                            "id": "692db540-1c57-1df9-982f-6398c4c279d9",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ApplicationReviewApproved",
                        "displayName": "민원 신청 승인됨",
                        "nameCamelCase": "applicationReviewApproved",
                        "namePascalCase": "ApplicationReviewApproved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "8046de29-aeab-65f8-db12-c3ffe41abea5"
                        },
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        }
                    },
                    "targetElement": {
                        "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "description": "민원 신청서가 승인되면, 문서 발급 프로세스를 시작하여 승인된 신청서에 대한 문서를 생성합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1452,
                            "y": 250,
                            "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ApplicationReviewApprovalDocumentPolicy",
                        "displayName": "심사 승인 후 문서 발급 자동화",
                        "nameCamelCase": "applicationReviewApprovalDocumentPolicy",
                        "namePascalCase": "ApplicationReviewApprovalDocumentPolicy",
                        "namePlural": "applicationReviewApprovalDocumentPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "692db540-1c57-1df9-982f-6398c4c279d9",
                    "to": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                    "relationView": {
                        "id": "5b8c6bf5-100c-e2d5-fdac-6cecb5f09859",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "to": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "needReconnect": true,
                        "value": "[[1379,252],[1402,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "692db540-1c57-1df9-982f-6398c4c279d9",
                        "id": "5b8c6bf5-100c-e2d5-fdac-6cecb5f09859",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
                },
                "184390cf-315b-9190-dd12-c30af2f88c07": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "184390cf-315b-9190-dd12-c30af2f88c07",
                    "sourceElement": {
                        "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "description": "민원 신청서가 승인되면, 문서 발급 프로세스를 시작하여 승인된 신청서에 대한 문서를 생성합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1452,
                            "y": 250,
                            "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ApplicationReviewApprovalDocumentPolicy",
                        "displayName": "심사 승인 후 문서 발급 자동화",
                        "nameCamelCase": "applicationReviewApprovalDocumentPolicy",
                        "namePascalCase": "ApplicationReviewApprovalDocumentPolicy",
                        "namePlural": "applicationReviewApprovalDocumentPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "DocumentIssued"
                        ],
                        "aggregate": {
                            "id": "1c1b8300-506a-2317-3fef-9fd3f7cc3dfd"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "886c1ea5-4b72-c968-7f43-c888489594ec"
                        },
                        "controllerInfo": {
                            "method": "POST"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "applicationId",
                                "nameCamelCase": "applicationId",
                                "namePascalCase": "ApplicationId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "DocumentFormat",
                                "isCopy": false,
                                "isKey": false,
                                "name": "format",
                                "nameCamelCase": "format",
                                "namePascalCase": "Format",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                            "style": "{}",
                            "width": 100,
                            "x": 1571,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "e276a629-4038-03c0-d2bd-4be915e2b024",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "IssueDocument",
                        "displayName": "문서 발급",
                        "nameCamelCase": "issueDocument",
                        "namePascalCase": "IssueDocument",
                        "namePlural": "issueDocuments",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "POST"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                    "to": "e276a629-4038-03c0-d2bd-4be915e2b024",
                    "relationView": {
                        "id": "184390cf-315b-9190-dd12-c30af2f88c07",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "to": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "needReconnect": true,
                        "value": "[[1502,252],[1521,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "e16944e7-b8c4-f70f-9512-22a51f578b0b",
                        "id": "184390cf-315b-9190-dd12-c30af2f88c07",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "e276a629-4038-03c0-d2bd-4be915e2b024",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": "",
                    "selected": false
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
                    "3dca26f7-b684-2bc1-0270-f950cfe711f6": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "3dca26f7-b684-2bc1-0270-f950cfe711f6",
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
                    "c6d98ba6-068a-e8eb-2e48-1af0ada2c1b5": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "c6d98ba6-068a-e8eb-2e48-1af0ada2c1b5",
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
                                "id": "3dca26f7-b684-2bc1-0270-f950cfe711f6",
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
                    "8bbacd66-9fe9-037b-b0b7-e78e81a264e5": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "8bbacd66-9fe9-037b-b0b7-e78e81a264e5",
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
                                "name": "applicationprocessing",
                                "labels": {
                                    "app": "applicationprocessing"
                                },
                                "annotations": {
                                    "msaez.io/x": "351"
                                }
                            },
                            "spec": {
                                "selector": {
                                    "matchLabels": {
                                        "app": "applicationprocessing"
                                    }
                                },
                                "replicas": 1,
                                "template": {
                                    "metadata": {
                                        "labels": {
                                            "app": "applicationprocessing"
                                        }
                                    },
                                    "spec": {
                                        "containers": [
                                            {
                                                "name": "applicationprocessing",
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
                    "285ffddc-b3f8-aa0c-6a6a-8b9624dca46c": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "285ffddc-b3f8-aa0c-6a6a-8b9624dca46c",
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
                                "name": "applicationprocessing",
                                "labels": {
                                    "app": "applicationprocessing"
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
                                    "app": "applicationprocessing"
                                }
                            }
                        },
                        "outboundDeployment": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "8bbacd66-9fe9-037b-b0b7-e78e81a264e5",
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
                                    "name": "applicationprocessing",
                                    "labels": {
                                        "app": "applicationprocessing"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "351"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "applicationprocessing"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "applicationprocessing"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "applicationprocessing",
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
                    "3b6512ae-3fc1-ca01-1c41-54236cc580d1": {
                        "_type": "Deployment",
                        "name": "",
                        "namespace": "",
                        "elementView": {
                            "_type": "Deployment",
                            "id": "3b6512ae-3fc1-ca01-1c41-54236cc580d1",
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
                                "name": "operations",
                                "labels": {
                                    "app": "operations"
                                },
                                "annotations": {
                                    "msaez.io/x": "551"
                                }
                            },
                            "spec": {
                                "selector": {
                                    "matchLabels": {
                                        "app": "operations"
                                    }
                                },
                                "replicas": 1,
                                "template": {
                                    "metadata": {
                                        "labels": {
                                            "app": "operations"
                                        }
                                    },
                                    "spec": {
                                        "containers": [
                                            {
                                                "name": "operations",
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
                    "cd7fdb51-438e-fe69-453e-735463a5f97a": {
                        "_type": "Service",
                        "name": "",
                        "namespace": "",
                        "host": "",
                        "path": "",
                        "elementView": {
                            "_type": "Service",
                            "id": "cd7fdb51-438e-fe69-453e-735463a5f97a",
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
                                "name": "operations",
                                "labels": {
                                    "app": "operations"
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
                                    "app": "operations"
                                }
                            }
                        },
                        "outboundDeployment": {
                            "_type": "Deployment",
                            "name": "",
                            "namespace": "",
                            "elementView": {
                                "_type": "Deployment",
                                "id": "3b6512ae-3fc1-ca01-1c41-54236cc580d1",
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
                                    "name": "operations",
                                    "labels": {
                                        "app": "operations"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "551"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "operations"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "operations"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "operations",
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
                    "d75c7d21-4534-7b61-ba37-bbb570b5b459": {
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
                                "id": "c6d98ba6-068a-e8eb-2e48-1af0ada2c1b5",
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
                                    "id": "3dca26f7-b684-2bc1-0270-f950cfe711f6",
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
                                "id": "3dca26f7-b684-2bc1-0270-f950cfe711f6",
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
                        "from": "c6d98ba6-068a-e8eb-2e48-1af0ada2c1b5",
                        "to": "3dca26f7-b684-2bc1-0270-f950cfe711f6",
                        "relationView": {
                            "id": "d75c7d21-4534-7b61-ba37-bbb570b5b459",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[152,250],[152,350]]",
                            "from": "c6d98ba6-068a-e8eb-2e48-1af0ada2c1b5",
                            "to": "3dca26f7-b684-2bc1-0270-f950cfe711f6",
                            "needReconnect": true
                        },
                        "sourceMultiplicity": 3,
                        "targetMultiplicity": 3,
                        "style": {}
                    },
                    "5ab9d915-02e2-012e-66d8-efa4968675cf": {
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
                                "id": "285ffddc-b3f8-aa0c-6a6a-8b9624dca46c",
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
                                    "name": "applicationprocessing",
                                    "labels": {
                                        "app": "applicationprocessing"
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
                                        "app": "applicationprocessing"
                                    }
                                }
                            },
                            "outboundDeployment": {
                                "_type": "Deployment",
                                "name": "",
                                "namespace": "",
                                "elementView": {
                                    "_type": "Deployment",
                                    "id": "8bbacd66-9fe9-037b-b0b7-e78e81a264e5",
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
                                        "name": "applicationprocessing",
                                        "labels": {
                                            "app": "applicationprocessing"
                                        },
                                        "annotations": {
                                            "msaez.io/x": "351"
                                        }
                                    },
                                    "spec": {
                                        "selector": {
                                            "matchLabels": {
                                                "app": "applicationprocessing"
                                            }
                                        },
                                        "replicas": 1,
                                        "template": {
                                            "metadata": {
                                                "labels": {
                                                    "app": "applicationprocessing"
                                                }
                                            },
                                            "spec": {
                                                "containers": [
                                                    {
                                                        "name": "applicationprocessing",
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
                                "id": "8bbacd66-9fe9-037b-b0b7-e78e81a264e5",
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
                                    "name": "applicationprocessing",
                                    "labels": {
                                        "app": "applicationprocessing"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "351"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "applicationprocessing"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "applicationprocessing"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "applicationprocessing",
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
                        "from": "285ffddc-b3f8-aa0c-6a6a-8b9624dca46c",
                        "to": "8bbacd66-9fe9-037b-b0b7-e78e81a264e5",
                        "relationView": {
                            "id": "5ab9d915-02e2-012e-66d8-efa4968675cf",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[352,250],[352,350]]",
                            "from": "285ffddc-b3f8-aa0c-6a6a-8b9624dca46c",
                            "to": "8bbacd66-9fe9-037b-b0b7-e78e81a264e5",
                            "needReconnect": true
                        },
                        "sourceMultiplicity": 3,
                        "targetMultiplicity": 3,
                        "style": {}
                    },
                    "3ec233e8-c1af-ebba-8efb-c6af382add55": {
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
                                "id": "cd7fdb51-438e-fe69-453e-735463a5f97a",
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
                                    "name": "operations",
                                    "labels": {
                                        "app": "operations"
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
                                        "app": "operations"
                                    }
                                }
                            },
                            "outboundDeployment": {
                                "_type": "Deployment",
                                "name": "",
                                "namespace": "",
                                "elementView": {
                                    "_type": "Deployment",
                                    "id": "3b6512ae-3fc1-ca01-1c41-54236cc580d1",
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
                                        "name": "operations",
                                        "labels": {
                                            "app": "operations"
                                        },
                                        "annotations": {
                                            "msaez.io/x": "551"
                                        }
                                    },
                                    "spec": {
                                        "selector": {
                                            "matchLabels": {
                                                "app": "operations"
                                            }
                                        },
                                        "replicas": 1,
                                        "template": {
                                            "metadata": {
                                                "labels": {
                                                    "app": "operations"
                                                }
                                            },
                                            "spec": {
                                                "containers": [
                                                    {
                                                        "name": "operations",
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
                                "id": "3b6512ae-3fc1-ca01-1c41-54236cc580d1",
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
                                    "name": "operations",
                                    "labels": {
                                        "app": "operations"
                                    },
                                    "annotations": {
                                        "msaez.io/x": "551"
                                    }
                                },
                                "spec": {
                                    "selector": {
                                        "matchLabels": {
                                            "app": "operations"
                                        }
                                    },
                                    "replicas": 1,
                                    "template": {
                                        "metadata": {
                                            "labels": {
                                                "app": "operations"
                                            }
                                        },
                                        "spec": {
                                            "containers": [
                                                {
                                                    "name": "operations",
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
                        "from": "cd7fdb51-438e-fe69-453e-735463a5f97a",
                        "to": "3b6512ae-3fc1-ca01-1c41-54236cc580d1",
                        "relationView": {
                            "id": "3ec233e8-c1af-ebba-8efb-c6af382add55",
                            "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                            "value": "[[552,250],[552,350]]",
                            "from": "cd7fdb51-438e-fe69-453e-735463a5f97a",
                            "to": "3b6512ae-3fc1-ca01-1c41-54236cc580d1",
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