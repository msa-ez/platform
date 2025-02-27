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

export const getAvailableServiceNames = () => {
    return Object.keys(esValues)
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
    simpleLibraryService: {
        "draft": {
            "BookManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Book",
                            "alias": "도서"
                        },
                        "enumerations": [
                            {
                                "name": "Category",
                                "alias": "카테고리"
                            },
                            {
                                "name": "Status",
                                "alias": "도서상태"
                            }
                        ],
                        "valueObjects": []
                    }
                ],
                "pros": {
                    "cohesion": "매우 높음: 도서의 등록, 관리, 상태 전이 등의 모든 기능을 하나의 Aggregate로 집중 관리.",
                    "coupling": "매우 낮음: 외부 Aggregate와의 의존성이 없으며 단일 트랜잭션 내에서 모든 변경이 처리됨.",
                    "consistency": "매우 높음: 하나의 Aggregate 내에서 상태 전이 및 불변성이 보장되어 트랜잭션 일관성이 뛰어남.",
                    "encapsulation": "높음: 도서 도메인의 핵심 속성이 하나의 경계 내에 캡슐화됨.",
                    "complexity": "낮음: 단일 Aggregate로 구조가 단순하며 관리가 용이함.",
                    "independence": "높음: 도서 등록 및 상태 변경 기능이 독립적으로 운영될 수 있음.",
                    "performance": "높음: 단일 Aggregate로 인한 데이터 조회 및 변경이 신속하게 이루어짐."
                },
                "cons": {
                    "cohesion": "단일 Aggregate가 지나치게 확장될 경우 책임이 집중될 수 있음.",
                    "coupling": "없음: 외부 시스템과의 낮은 결합도를 유지하나, 미래 확장 시 재구성이 필요할 수 있음.",
                    "consistency": "없음: 단일 트랜잭션 내 처리로 일관성은 보장되나, Aggregate가 커질 경우 잠금 경쟁 이슈 가능성이 있음.",
                    "encapsulation": "없음: 모든 도서 관련 데이터가 한 곳에 모이므로 캡슐화는 충분함.",
                    "complexity": "낮음: 도서 관련 로직이 한곳에 집중되나 역할 분리가 어려울 수 있음.",
                    "independence": "낮음: 모든 기능이 단일 경계 내에 있으므로 독립적 변화에 제한이 있을 수 있음.",
                    "performance": "낮음: Aggregate 크기가 커지면 성능 저하 위험이 있음."
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"도서 관리 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 해며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\"}]",
                    "id": "e0e608d4-baed-ebff-9767-02d44ab21c02",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02",
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
                    "definitionId": "163972132_es_9e76c880be50347fff308402842a602b"
                },
                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"사용자는 도서 관리 화면에서 새로운 도서를 등록하고, 등록된 도서의 대출 상태를 관리할 수 있다. 신규 등록 시 도서명, ISBN, 저자, 출판사, 카테고리 정보를 필수 입력 받고, ISBN은 13자리 숫자이며 중복 체크가 수행된다. 등록 후 도서는 초기 '대출가능' 상태로 표시되며, 대출, 반납, 예약 등의 이벤트에 따라 상태가 자동 갱신된다. 또한, 도서가 훼손되거나 분실된 경우, '폐기' 처리를 통해 대출 기능에서 제외된다.\",\"acceptance\":[\"도서 등록 시 도서명, ISBN, 저자, 출판사, 카테고리 정보를 반드시 입력해야 한다.\",\"ISBN은 13자리 숫자여야 하며, 중복 체크 로직이 구현되어 있다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.\",\"등록된 도서는 초기 상태가 '대출가능'이며, 대출/반납/예약에 따라 상태가 자동 변경된다.\",\"도서가 훼손되거나 분실되면 '폐기' 처리되어 대출 기능에서 제외된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookTitle\",\"type\":\"String\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]}},\"businessRules\":[{\"name\":\"ISBN 형식 검증\",\"description\":\"ISBN은 13자리 숫자로 구성되어야 하며, 입력된 ISBN은 기존 등록 도서와 중복되지 않아야 한다.\"},{\"name\":\"초기 대출 상태\",\"description\":\"신규 등록된 도서는 자동으로 '대출가능' 상태로 설정된다.\"},{\"name\":\"상태 전이 관리\",\"description\":\"대출, 반납, 예약, 훼손 또는 분실 이벤트 발생 시 도서의 상태는 각각 '대출중', '예약중', '폐기'로 자동 갱신된다.\"},{\"name\":\"폐기 처리\",\"description\":\"도서가 '폐기' 상태일 경우 더 이상 대출이 불가능하다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"bookTitle\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Register Book\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 상태 관리\",\"type\":\"table\",\"fields\":[],\"actions\":[\"Modify Status\",\"Discard Book\"],\"filters\":[\"category\",\"status\"],\"resultTable\":{\"columns\":[\"ISBN\",\"bookTitle\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"View Details\"]}}]}}}"
            },
            "LoanManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "LoanTransaction",
                            "alias": "대출/반납 거래"
                        },
                        "enumerations": [
                            {
                                "name": "TransactionType",
                                "alias": "거래 유형"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "BookReference",
                                "alias": "도서 참조",
                                "referencedAggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "높음: 역할에 따른 Aggregate 분리로 각 Aggregate의 책임이 명확함.",
                    "coupling": "낮음: LoanTransaction이 Member를 참조하는 단방향 관계로 구성됨.",
                    "consistency": "높음: 각 Aggregate별로 트랜잭션 경계를 분리하여 관리함.",
                    "encapsulation": "높음: 회원 정보와 대출/반납 거래의 도메인 로직을 분리하여 캡슐화함.",
                    "complexity": "중간: 두 Aggregate 간의 연계가 필요하지만 전체 복잡성은 낮음.",
                    "independence": "높음: 독립적으로 변경 및 확장이 가능함.",
                    "performance": "중간: Aggregate 간 참조로 인한 약간의 오버헤드가 있을 수 있음."
                },
                "cons": {
                    "cohesion": "중간: Aggregate 분리로 인해 일부 비즈니스 규칙이 여러 Aggregate에 걸쳐 적용될 수 있음.",
                    "coupling": "중간: Member와 LoanTransaction 간의 연계로 복잡도가 약간 증가할 수 있음.",
                    "consistency": "중간: 다수의 Aggregate 간 일관성 유지에 추가 고려가 필요함.",
                    "encapsulation": "중간: 분리된 Aggregate 간 데이터 접근 시 경계 관리가 필요함.",
                    "complexity": "중간: 두 Aggregate 간 조율이 추가됨.",
                    "independence": "중간: 트랜잭션 경계가 분리되면서 동기화 이슈가 발생할 수 있음.",
                    "performance": "중간: 다중 Aggregate 접근으로 인한 약간의 성능 저하 우려."
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"대출/반납 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\"}]",
                    "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
                        "style": "{}",
                        "width": 560,
                        "x": 1235,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
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
                    "definitionId": "163972132_es_9e76c880be50347fff308402842a602b"
                },
                "description": "{\"userStories\":[{\"title\":\"대출/반납 관리 화면\",\"description\":\"회원은 대출/반납 화면에서 회원 번호와 이름으로 본인을 확인한 후, 원하는 도서를 검색 및 선택하여 대출 신청 또는 반납 처리를 할 수 있어야 합니다. 또한, 대출하려는 도서가 이미 대출 중인 경우 예약 신청이 가능해야 합니다.\",\"acceptance\":[\"회원 번호와 이름을 통한 회원 확인 기능이 제공된다.\",\"도서는 도서명 또는 ISBN으로 검색할 수 있다.\",\"대출 기간은 7일, 14일, 30일 옵션 중 선택할 수 있다.\",\"대출 신청 시 모든 필수 정보가 입력되어야 하며, 그렇지 않으면 대출 버튼이 활성화되지 않는다.\",\"이미 대출중인 도서에 대해 예약 신청 기능이 제공된다.\",\"대출 완료 후 도서의 상태가 '대출중'으로 자동 변경된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberNumber\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약신청\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberNumber\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookISBN\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanPeriod\",\"type\":\"Integer\",\"required\":true},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"회원 검증\",\"description\":\"대출 신청 시 회원 번호와 이름을 통해 회원 정보를 확인해야 한다.\"},{\"name\":\"도서 검색\",\"description\":\"도서는 도서명이나 ISBN으로 검색할 수 있어야 한다.\"},{\"name\":\"대출 기간 옵션\",\"description\":\"대출 기간은 7일, 14일, 30일 중 하나로 선택되어야 한다.\"},{\"name\":\"예약 신청 가능\",\"description\":\"대출하려는 도서가 이미 대출중인 경우 예약 신청 기능이 제공되어야 한다.\"},{\"name\":\"도서 상태 변경\",\"description\":\"대출이 완료되면 해당 도서의 상태가 자동으로 '대출중'으로 변경되어야 한다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 정보\",\"type\":\"form\",\"fields\":[{\"name\":\"memberNumber\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 대출 정보\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchButton\",\"type\":\"button\"},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Loan Request\",\"Return Process\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]}}}"
            }
        },
        "esValue": {
            "elements": {
                "e0e608d4-baed-ebff-9767-02d44ab21c02": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"도서 관리 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 해며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\"}]",
                    "id": "e0e608d4-baed-ebff-9767-02d44ab21c02",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02",
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
                    "definitionId": "163972132_es_9e76c880be50347fff308402842a602b"
                },
                "4ddb04c5-2cf6-3998-e527-edf16a959efb": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"대출/반납 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\"}]",
                    "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
                        "style": "{}",
                        "width": 560,
                        "x": 1235,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
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
                    "definitionId": "163972132_es_9e76c880be50347fff308402842a602b"
                },
                "cc721073-c579-8aaa-e6d4-5475304059a7": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookTitle",
                                "nameCamelCase": "bookTitle",
                                "namePascalCase": "BookTitle",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
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
                                "e0d58b29-379c-d099-bd6f-207f3efa547d": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "e0d58b29-379c-d099-bd6f-207f3efa547d",
                                    "name": "Book",
                                    "namePascalCase": "Book",
                                    "nameCamelCase": "book",
                                    "namePlural": "Books",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "bookTitle",
                                            "displayName": "",
                                            "nameCamelCase": "bookTitle",
                                            "namePascalCase": "BookTitle",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "ISBN",
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
                                        "id": "e0d58b29-379c-d099-bd6f-207f3efa547d",
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
                                    "parentId": "cc721073-c579-8aaa-e6d4-5475304059a7"
                                },
                                "3f2fbb3f-20e7-3d60-59b6-955db20de2a5": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "3f2fbb3f-20e7-3d60-59b6-955db20de2a5",
                                    "name": "Category",
                                    "displayName": "카테고리",
                                    "nameCamelCase": "category",
                                    "namePascalCase": "Category",
                                    "namePlural": "categories",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "3f2fbb3f-20e7-3d60-59b6-955db20de2a5",
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
                                "9daf41d9-2adf-adb7-d3d1-7be155f58be7": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "9daf41d9-2adf-adb7-d3d1-7be155f58be7",
                                    "name": "Status",
                                    "displayName": "도서상태",
                                    "nameCamelCase": "status",
                                    "namePascalCase": "Status",
                                    "namePlural": "statuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "9daf41d9-2adf-adb7-d3d1-7be155f58be7",
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
                        "name": "e0e608d4-baed-ebff-9767-02d44ab21c02",
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "commands": [],
                    "description": null,
                    "id": "cc721073-c579-8aaa-e6d4-5475304059a7",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7",
                        "x": 650,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7",
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
                "653f7138-5456-461f-e70a-e676cfc49b9a": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
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
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
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
                                "1125aef9-3613-d6f3-a7f7-c993c7e1e611": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "1125aef9-3613-d6f3-a7f7-c993c7e1e611",
                                    "name": "LoanTransaction",
                                    "namePascalCase": "LoanTransaction",
                                    "nameCamelCase": "loanTransaction",
                                    "namePlural": "LoanTransactions",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
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
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "memberNumber",
                                            "displayName": "",
                                            "nameCamelCase": "memberNumber",
                                            "namePascalCase": "MemberNumber",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "bookISBN",
                                            "displayName": "",
                                            "nameCamelCase": "bookIsbn",
                                            "namePascalCase": "BookIsbn",
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
                                            "className": "TransactionType",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "transactionType",
                                            "displayName": "",
                                            "nameCamelCase": "transactionType",
                                            "namePascalCase": "TransactionType",
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
                                        "id": "1125aef9-3613-d6f3-a7f7-c993c7e1e611",
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
                                    "parentId": "653f7138-5456-461f-e70a-e676cfc49b9a"
                                },
                                "7e37b5db-492f-7b55-4b2d-37f91a0bf62c": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "7e37b5db-492f-7b55-4b2d-37f91a0bf62c",
                                    "name": "TransactionType",
                                    "displayName": "거래 유형",
                                    "nameCamelCase": "transactionType",
                                    "namePascalCase": "TransactionType",
                                    "namePlural": "transactionTypes",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "7e37b5db-492f-7b55-4b2d-37f91a0bf62c",
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
                                            "value": "LOAN_REQUEST"
                                        },
                                        {
                                            "value": "RETURN_PROCESS"
                                        },
                                        {
                                            "value": "RESERVATION_REQUEST"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": []
                                },
                                "ea5c72bc-f8e1-05d3-18c2-42b0cf8e8866": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "ea5c72bc-f8e1-05d3-18c2-42b0cf8e8866",
                                    "name": "BookId",
                                    "displayName": "",
                                    "namePascalCase": "BookId",
                                    "nameCamelCase": "bookId",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": true,
                                            "label": "- ISBN: String",
                                            "name": "ISBN",
                                            "nameCamelCase": "isbn",
                                            "namePascalCase": "Isbn",
                                            "displayName": "",
                                            "referenceClass": "Book",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "ea5c72bc-f8e1-05d3-18c2-42b0cf8e8866",
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
                                    "namePlural": "BookIds",
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
                        "name": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "commands": [],
                    "description": null,
                    "id": "653f7138-5456-461f-e70a-e676cfc49b9a",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a",
                        "x": 1235,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "LoanTransaction",
                    "displayName": "대출/반납 거래",
                    "nameCamelCase": "loanTransaction",
                    "namePascalCase": "LoanTransaction",
                    "namePlural": "loanTransactions",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "e823241d-5082-c916-b55c-a69ab9c633c6": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "e823241d-5082-c916-b55c-a69ab9c633c6",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "e823241d-5082-c916-b55c-a69ab9c633c6",
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookTitle",
                            "nameCamelCase": "bookTitle",
                            "namePascalCase": "BookTitle",
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
                        "id": "e823241d-5082-c916-b55c-a69ab9c633c6",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BookCreated",
                    "displayName": "도서 등록 완료",
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
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                    },
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    }
                },
                "136ddf3b-a470-f306-98a3-463cd8db8269": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "136ddf3b-a470-f306-98a3-463cd8db8269",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "136ddf3b-a470-f306-98a3-463cd8db8269",
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
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
                            "name": "newStatus",
                            "nameCamelCase": "newStatus",
                            "namePascalCase": "NewStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "updatedAt",
                            "nameCamelCase": "updatedAt",
                            "namePascalCase": "UpdatedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "136ddf3b-a470-f306-98a3-463cd8db8269",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BookStatusUpdated",
                    "displayName": "도서 상태 수정 완료",
                    "nameCamelCase": "bookStatusUpdated",
                    "namePascalCase": "BookStatusUpdated",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                    },
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    }
                },
                "0f12feae-d77e-78f9-e44e-c9684300799e": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "0f12feae-d77e-78f9-e44e-c9684300799e",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "0f12feae-d77e-78f9-e44e-c9684300799e",
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
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
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "updatedAt",
                            "nameCamelCase": "updatedAt",
                            "namePascalCase": "UpdatedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "0f12feae-d77e-78f9-e44e-c9684300799e",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BookDiscarded",
                    "displayName": "도서 폐기 처리 완료",
                    "nameCamelCase": "bookDiscarded",
                    "namePascalCase": "BookDiscarded",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                    },
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    }
                },
                "3224f5d9-f39f-f06c-2da8-132252aa2b01": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookCreated"
                    ],
                    "aggregate": {
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "controllerInfo": {
                        "apiPath": "registerbook",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookTitle",
                            "nameCamelCase": "bookTitle",
                            "namePascalCase": "BookTitle",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "ISBN",
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
                    "id": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "RegisterBook",
                    "displayName": "도서 등록",
                    "nameCamelCase": "registerBook",
                    "namePascalCase": "RegisterBook",
                    "namePlural": "registerBooks",
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
                                        "bookTitle": "N/A",
                                        "ISBN": "N/A",
                                        "author": "N/A",
                                        "publisher": "N/A",
                                        "category": "N/A",
                                        "status": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "RegisterBook",
                                    "value": {
                                        "bookTitle": "Effective Java",
                                        "ISBN": "9783161484100",
                                        "author": "Joshua Bloch",
                                        "publisher": "Addison-Wesley",
                                        "category": "ACADEMIC"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookCreated",
                                    "value": {
                                        "ISBN": "9783161484100",
                                        "bookTitle": "Effective Java",
                                        "author": "Joshua Bloch",
                                        "publisher": "Addison-Wesley",
                                        "category": "ACADEMIC",
                                        "status": "AVAILABLE"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "75fca504-958c-2628-ed80-8e98277e00dd": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookStatusUpdated"
                    ],
                    "aggregate": {
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "controllerInfo": {
                        "apiPath": "updatebookstatus",
                        "method": "PUT",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Status",
                            "isCopy": false,
                            "isKey": false,
                            "name": "newStatus",
                            "nameCamelCase": "newStatus",
                            "namePascalCase": "NewStatus",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "UpdateBookStatus",
                    "displayName": "도서 상태 수정",
                    "nameCamelCase": "updateBookStatus",
                    "namePascalCase": "UpdateBookStatus",
                    "namePlural": "updateBookStatuses",
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
                                        "bookTitle": "Effective Java",
                                        "ISBN": "9783161484100",
                                        "author": "Joshua Bloch",
                                        "publisher": "Addison-Wesley",
                                        "category": "ACADEMIC",
                                        "status": "AVAILABLE"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "UpdateBookStatus",
                                    "value": {
                                        "ISBN": "9783161484100",
                                        "newStatus": "BORROWED"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookStatusUpdated",
                                    "value": {
                                        "ISBN": "9783161484100",
                                        "previousStatus": "AVAILABLE",
                                        "newStatus": "BORROWED",
                                        "updatedAt": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookDiscarded"
                    ],
                    "aggregate": {
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "controllerInfo": {
                        "apiPath": "discardbook",
                        "method": "PUT",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
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
                    "id": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 510,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "DiscardBook",
                    "displayName": "도서 폐기 처리",
                    "nameCamelCase": "discardBook",
                    "namePascalCase": "DiscardBook",
                    "namePlural": "discardBooks",
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
                                        "bookTitle": "Effective Java",
                                        "ISBN": "9783161484100",
                                        "author": "Joshua Bloch",
                                        "publisher": "Addison-Wesley",
                                        "category": "ACADEMIC",
                                        "status": "BORROWED"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "DiscardBook",
                                    "value": {
                                        "ISBN": "9783161484100",
                                        "reason": "도서 훼손으로 폐기"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookDiscarded",
                                    "value": {
                                        "ISBN": "9783161484100",
                                        "reason": "도서 훼손으로 폐기",
                                        "updatedAt": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "e63c025a-4e3f-9e18-9ed6-cac91c434397": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "e63c025a-4e3f-9e18-9ed6-cac91c434397",
                    "visibility": "public",
                    "name": "BookSummary",
                    "oldName": "",
                    "displayName": "도서 요약",
                    "namePascalCase": "BookSummary",
                    "namePlural": "bookSummaries",
                    "aggregate": {
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookTitle",
                            "nameCamelCase": "bookTitle",
                            "namePascalCase": "BookTitle",
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
                        "multipleResult": true
                    },
                    "controllerInfo": {
                        "url": ""
                    },
                    "elementView": {
                        "_type": "org.uengine.modeling.model.View",
                        "id": "e63c025a-4e3f-9e18-9ed6-cac91c434397",
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
                "2edbdb7d-c9be-e098-a16d-f582bee5cd7a": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "description": null,
                    "id": "2edbdb7d-c9be-e098-a16d-f582bee5cd7a",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "2edbdb7d-c9be-e098-a16d-f582bee5cd7a",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "8fd3b56e-d9f8-be61-3889-0d64ff0fc008": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "description": null,
                    "id": "8fd3b56e-d9f8-be61-3889-0d64ff0fc008",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "8fd3b56e-d9f8-be61-3889-0d64ff0fc008",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "9e329acc-d3c6-41a8-e199-7a52382b4f14": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "description": null,
                    "id": "9e329acc-d3c6-41a8-e199-7a52382b4f14",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "9e329acc-d3c6-41a8-e199-7a52382b4f14",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "4dcbe45f-579e-e912-c9a6-4d3dd08d3ed9": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "description": null,
                    "id": "4dcbe45f-579e-e912-c9a6-4d3dd08d3ed9",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "4dcbe45f-579e-e912-c9a6-4d3dd08d3ed9",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "25f45fdb-9734-57a8-f36f-3c2447f57f28": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
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
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
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
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanTransactionRequested",
                    "displayName": "대출 신청 완료",
                    "nameCamelCase": "loanTransactionRequested",
                    "namePascalCase": "LoanTransactionRequested",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                    },
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    }
                },
                "c441520a-cd5e-78e4-fe1f-6ec19bc360dd": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "style": "{}",
                        "width": 100,
                        "x": 1329,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanTransactionReturned",
                    "displayName": "반납 처리 완료",
                    "nameCamelCase": "loanTransactionReturned",
                    "namePascalCase": "LoanTransactionReturned",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                    },
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    }
                },
                "923aa143-8b45-51d9-e4bf-b291c2075c5c": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "style": "{}",
                        "width": 100,
                        "x": 1329,
                        "y": 510,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "reservationDate",
                            "nameCamelCase": "reservationDate",
                            "namePascalCase": "ReservationDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "ReservationTransactionRequested",
                    "displayName": "예약 신청 완료",
                    "nameCamelCase": "reservationTransactionRequested",
                    "namePascalCase": "ReservationTransactionRequested",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                    },
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    }
                },
                "08027f09-d0d1-cb36-6211-e34afd5cdde4": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanTransactionRequested"
                    ],
                    "aggregate": {
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "controllerInfo": {
                        "apiPath": "requestloantransaction",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
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
                    "id": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "RequestLoanTransaction",
                    "displayName": "대출 신청",
                    "nameCamelCase": "requestLoanTransaction",
                    "namePascalCase": "RequestLoanTransaction",
                    "namePlural": "requestLoanTransactions",
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
                                    "name": "LoanTransaction",
                                    "value": {
                                        "loanId": "N/A",
                                        "memberNumber": "M-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": null,
                                        "loanDate": null,
                                        "transactionType": "N/A",
                                        "bookId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "RequestLoanTransaction",
                                    "value": {
                                        "memberNumber": "M-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": 14,
                                        "loanDate": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanTransactionRequested",
                                    "value": {
                                        "loanId": "L-1001",
                                        "memberNumber": "M-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": 14,
                                        "loanDate": "2024-03-20T00:00:00Z",
                                        "transactionType": "LOAN_REQUEST"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "287ada1d-ac41-1230-b11a-f813b2516d37": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanTransactionReturned"
                    ],
                    "aggregate": {
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "controllerInfo": {
                        "apiPath": "processreturntransaction",
                        "method": "PUT",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                        }
                    ],
                    "description": null,
                    "id": "287ada1d-ac41-1230-b11a-f813b2516d37",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "287ada1d-ac41-1230-b11a-f813b2516d37",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "287ada1d-ac41-1230-b11a-f813b2516d37",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ProcessReturnTransaction",
                    "displayName": "반납 처리",
                    "nameCamelCase": "processReturnTransaction",
                    "namePascalCase": "ProcessReturnTransaction",
                    "namePlural": "processReturnTransactions",
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
                                    "name": "LoanTransaction",
                                    "value": {
                                        "loanId": "L-1001",
                                        "memberNumber": "M-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": 14,
                                        "loanDate": "2024-03-10T00:00:00Z",
                                        "transactionType": "LOAN_REQUEST",
                                        "bookId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ProcessReturnTransaction",
                                    "value": {
                                        "loanId": "L-1001",
                                        "returnDate": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanTransactionReturned",
                                    "value": {
                                        "loanId": "L-1001",
                                        "returnDate": "2024-03-20T00:00:00Z",
                                        "transactionType": "RETURN_PROCESS"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "ReservationTransactionRequested"
                    ],
                    "aggregate": {
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "controllerInfo": {
                        "apiPath": "requestreservationtransaction",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "reservationDate",
                            "nameCamelCase": "reservationDate",
                            "namePascalCase": "ReservationDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 510,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "RequestReservationTransaction",
                    "displayName": "예약 신청",
                    "nameCamelCase": "requestReservationTransaction",
                    "namePascalCase": "RequestReservationTransaction",
                    "namePlural": "requestReservationTransactions",
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
                                    "name": "LoanTransaction",
                                    "value": {
                                        "loanId": "N/A",
                                        "memberNumber": "M-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": null,
                                        "loanDate": null,
                                        "transactionType": "N/A",
                                        "bookId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "RequestReservationTransaction",
                                    "value": {
                                        "memberNumber": "M-001",
                                        "bookISBN": "9783161484100",
                                        "reservationDate": "2024-03-21T00:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "ReservationTransactionRequested",
                                    "value": {
                                        "loanId": "L-1002",
                                        "memberNumber": "M-001",
                                        "bookISBN": "9783161484100",
                                        "reservationDate": "2024-03-21T00:00:00Z",
                                        "transactionType": "RESERVATION_REQUEST"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "5032fb0b-fc90-1598-7ab4-7ad545a957ff": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "5032fb0b-fc90-1598-7ab4-7ad545a957ff",
                    "visibility": "public",
                    "name": "LoanTransactionSummary",
                    "oldName": "",
                    "displayName": "대출/반납 거래 요약",
                    "namePascalCase": "LoanTransactionSummary",
                    "namePlural": "loanTransactionSummaries",
                    "aggregate": {
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
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
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
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
                            "className": "Integer",
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
                            "name": "returnDate",
                            "nameCamelCase": "returnDate",
                            "namePascalCase": "ReturnDate",
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
                        "id": "5032fb0b-fc90-1598-7ab4-7ad545a957ff",
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
                "bb56e4e5-839f-b1cf-d575-ff7e328b0599": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "description": null,
                    "id": "bb56e4e5-839f-b1cf-d575-ff7e328b0599",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "bb56e4e5-839f-b1cf-d575-ff7e328b0599",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "e5b86997-db06-df20-bec2-58480f587804": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "description": null,
                    "id": "e5b86997-db06-df20-bec2-58480f587804",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "e5b86997-db06-df20-bec2-58480f587804",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "0bc69670-9e57-8de7-1dc3-084173e09e86": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "description": null,
                    "id": "0bc69670-9e57-8de7-1dc3-084173e09e86",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "0bc69670-9e57-8de7-1dc3-084173e09e86",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "c3ee6e18-14c5-5f08-f6f1-fdfc7684abe7": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                    },
                    "description": null,
                    "id": "c3ee6e18-14c5-5f08-f6f1-fdfc7684abe7",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "c3ee6e18-14c5-5f08-f6f1-fdfc7684abe7",
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
                    "name": "User",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "c1ec54fb-9432-4446-0355-6f054b4aebe3": {
                    "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "description": "LoanTransactionRequested 이벤트 발생 시, 도서 상태를 '대출중'으로 갱신하여 대출 관리 시스템의 상태 일관성을 유지합니다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 437,
                        "y": 380,
                        "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "LoanRequestToBookLoanStatusPolicy",
                    "displayName": "대출 요청에 따른 도서 상태 업데이트 정책",
                    "nameCamelCase": "loanRequestToBookLoanStatusPolicy",
                    "namePascalCase": "LoanRequestToBookLoanStatusPolicy",
                    "namePlural": "loanRequestToBookLoanStatusPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120": {
                    "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "description": "LoanTransactionReturned 이벤트 발생 시, 도서 상태를 '대출가능'으로 전환하여 도서가 다시 대출 가능한 상태로 복원됩니다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 437,
                        "y": 380,
                        "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "LoanReturnToBookAvailableStatusPolicy",
                    "displayName": "반납 거래 발생시 도서 상태 업데이트 정책",
                    "nameCamelCase": "loanReturnToBookAvailableStatusPolicy",
                    "namePascalCase": "LoanReturnToBookAvailableStatusPolicy",
                    "namePlural": "loanReturnToBookAvailableStatusPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "961eccc1-a43a-f345-0fb3-cfbee306d2fc": {
                    "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                    },
                    "description": "ReservationTransactionRequested 이벤트 발생 시, 도서의 상태를 '예약중'으로 변경하여 예약 관리 상태를 정확하게 반영합니다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 437,
                        "y": 380,
                        "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "ReservationRequestToBookReservationStatusPolicy",
                    "displayName": "예약 거래 발생시 도서 상태 업데이트 정책",
                    "nameCamelCase": "reservationRequestToBookReservationStatusPolicy",
                    "namePascalCase": "ReservationRequestToBookReservationStatusPolicy",
                    "namePlural": "reservationRequestToBookReservationStatusPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                }
            },
            "relations": {
                "2b0b98eb-1060-4973-2690-63f46988a8c6": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "2b0b98eb-1060-4973-2690-63f46988a8c6",
                    "sourceElement": {
                        "aggregateRoot": {
                            "_type": "org.uengine.modeling.model.AggregateRoot",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
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
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "memberNumber",
                                    "nameCamelCase": "memberNumber",
                                    "namePascalCase": "MemberNumber",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "bookISBN",
                                    "nameCamelCase": "bookIsbn",
                                    "namePascalCase": "BookIsbn",
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
                                    "className": "TransactionType",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "transactionType",
                                    "nameCamelCase": "transactionType",
                                    "namePascalCase": "TransactionType",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "1125aef9-3613-d6f3-a7f7-c993c7e1e611": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "1125aef9-3613-d6f3-a7f7-c993c7e1e611",
                                        "name": "LoanTransaction",
                                        "namePascalCase": "LoanTransaction",
                                        "nameCamelCase": "loanTransaction",
                                        "namePlural": "LoanTransactions",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
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
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "memberNumber",
                                                "displayName": "",
                                                "nameCamelCase": "memberNumber",
                                                "namePascalCase": "MemberNumber",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookISBN",
                                                "displayName": "",
                                                "nameCamelCase": "bookIsbn",
                                                "namePascalCase": "BookIsbn",
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
                                                "className": "TransactionType",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "transactionType",
                                                "displayName": "",
                                                "nameCamelCase": "transactionType",
                                                "namePascalCase": "TransactionType",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "1125aef9-3613-d6f3-a7f7-c993c7e1e611",
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
                                        "parentId": "653f7138-5456-461f-e70a-e676cfc49b9a"
                                    },
                                    "7e37b5db-492f-7b55-4b2d-37f91a0bf62c": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "7e37b5db-492f-7b55-4b2d-37f91a0bf62c",
                                        "name": "TransactionType",
                                        "displayName": "거래 유형",
                                        "nameCamelCase": "transactionType",
                                        "namePascalCase": "TransactionType",
                                        "namePlural": "transactionTypes",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "7e37b5db-492f-7b55-4b2d-37f91a0bf62c",
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
                                                "value": "LOAN_REQUEST"
                                            },
                                            {
                                                "value": "RETURN_PROCESS"
                                            },
                                            {
                                                "value": "RESERVATION_REQUEST"
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
                            "name": "4ddb04c5-2cf6-3998-e527-edf16a959efb",
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        },
                        "commands": [],
                        "description": null,
                        "id": "653f7138-5456-461f-e70a-e676cfc49b9a",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a",
                            "x": 1235,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "LoanTransaction",
                        "displayName": "대출/반납 거래",
                        "nameCamelCase": "loanTransaction",
                        "namePascalCase": "LoanTransaction",
                        "namePlural": "loanTransactions",
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
                                    "isKey": false,
                                    "name": "bookTitle",
                                    "nameCamelCase": "bookTitle",
                                    "namePascalCase": "BookTitle",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": true,
                                    "name": "ISBN",
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
                                    "e0d58b29-379c-d099-bd6f-207f3efa547d": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "e0d58b29-379c-d099-bd6f-207f3efa547d",
                                        "name": "Book",
                                        "namePascalCase": "Book",
                                        "nameCamelCase": "book",
                                        "namePlural": "Books",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookTitle",
                                                "displayName": "",
                                                "nameCamelCase": "bookTitle",
                                                "namePascalCase": "BookTitle",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": true,
                                                "name": "ISBN",
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
                                            "id": "e0d58b29-379c-d099-bd6f-207f3efa547d",
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
                                        "parentId": "cc721073-c579-8aaa-e6d4-5475304059a7"
                                    },
                                    "3f2fbb3f-20e7-3d60-59b6-955db20de2a5": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "3f2fbb3f-20e7-3d60-59b6-955db20de2a5",
                                        "name": "Category",
                                        "displayName": "카테고리",
                                        "nameCamelCase": "category",
                                        "namePascalCase": "Category",
                                        "namePlural": "categories",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "3f2fbb3f-20e7-3d60-59b6-955db20de2a5",
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
                                    "9daf41d9-2adf-adb7-d3d1-7be155f58be7": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "9daf41d9-2adf-adb7-d3d1-7be155f58be7",
                                        "name": "Status",
                                        "displayName": "도서상태",
                                        "nameCamelCase": "status",
                                        "namePascalCase": "Status",
                                        "namePlural": "statuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "9daf41d9-2adf-adb7-d3d1-7be155f58be7",
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
                            "name": "e0e608d4-baed-ebff-9767-02d44ab21c02",
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "commands": [],
                        "description": null,
                        "id": "cc721073-c579-8aaa-e6d4-5475304059a7",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7",
                            "x": 650,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7",
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
                    "from": "653f7138-5456-461f-e70a-e676cfc49b9a",
                    "to": "cc721073-c579-8aaa-e6d4-5475304059a7",
                    "relationView": {
                        "id": "2b0b98eb-1060-4973-2690-63f46988a8c6",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "653f7138-5456-461f-e70a-e676cfc49b9a",
                        "to": "cc721073-c579-8aaa-e6d4-5475304059a7",
                        "needReconnect": true,
                        "value": "[[1170,456],[715,456]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "653f7138-5456-461f-e70a-e676cfc49b9a",
                        "id": "2b0b98eb-1060-4973-2690-63f46988a8c6",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "cc721073-c579-8aaa-e6d4-5475304059a7",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "6a8905b0-a00d-0585-71bb-5c924e0865f3": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "6a8905b0-a00d-0585-71bb-5c924e0865f3",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookCreated"
                        ],
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "controllerInfo": {
                            "apiPath": "registerbook",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookTitle",
                                "nameCamelCase": "bookTitle",
                                "namePascalCase": "BookTitle",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
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
                        "id": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "RegisterBook",
                        "displayName": "도서 등록",
                        "nameCamelCase": "registerBook",
                        "namePascalCase": "RegisterBook",
                        "namePlural": "registerBooks",
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
                        "id": "e823241d-5082-c916-b55c-a69ab9c633c6",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "e823241d-5082-c916-b55c-a69ab9c633c6",
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
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookTitle",
                                "nameCamelCase": "bookTitle",
                                "namePascalCase": "BookTitle",
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
                            "id": "e823241d-5082-c916-b55c-a69ab9c633c6",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BookCreated",
                        "displayName": "도서 등록 완료",
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
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        }
                    },
                    "from": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                    "to": "e823241d-5082-c916-b55c-a69ab9c633c6",
                    "relationView": {
                        "id": "6a8905b0-a00d-0585-71bb-5c924e0865f3",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                        "to": "e823241d-5082-c916-b55c-a69ab9c633c6",
                        "needReconnect": true,
                        "value": "[[606,252],[694,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "3224f5d9-f39f-f06c-2da8-132252aa2b01",
                        "id": "6a8905b0-a00d-0585-71bb-5c924e0865f3",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "e823241d-5082-c916-b55c-a69ab9c633c6",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "222b2aff-3077-43a2-016c-7b5d5355d17e": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "222b2aff-3077-43a2-016c-7b5d5355d17e",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Status",
                                "isCopy": false,
                                "isKey": false,
                                "name": "newStatus",
                                "nameCamelCase": "newStatus",
                                "namePascalCase": "NewStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
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
                        "id": "136ddf3b-a470-f306-98a3-463cd8db8269",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "136ddf3b-a470-f306-98a3-463cd8db8269",
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
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
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
                                "name": "newStatus",
                                "nameCamelCase": "newStatus",
                                "namePascalCase": "NewStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "updatedAt",
                                "nameCamelCase": "updatedAt",
                                "namePascalCase": "UpdatedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "136ddf3b-a470-f306-98a3-463cd8db8269",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BookStatusUpdated",
                        "displayName": "도서 상태 수정 완료",
                        "nameCamelCase": "bookStatusUpdated",
                        "namePascalCase": "BookStatusUpdated",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        }
                    },
                    "from": "75fca504-958c-2628-ed80-8e98277e00dd",
                    "to": "136ddf3b-a470-f306-98a3-463cd8db8269",
                    "relationView": {
                        "id": "222b2aff-3077-43a2-016c-7b5d5355d17e",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "to": "136ddf3b-a470-f306-98a3-463cd8db8269",
                        "needReconnect": true,
                        "value": "[[606,380],[694,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "id": "222b2aff-3077-43a2-016c-7b5d5355d17e",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "136ddf3b-a470-f306-98a3-463cd8db8269",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "611c3516-982f-42f7-e7f8-c914399105c8": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "611c3516-982f-42f7-e7f8-c914399105c8",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookDiscarded"
                        ],
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "controllerInfo": {
                            "apiPath": "discardbook",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                        "id": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 510,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "DiscardBook",
                        "displayName": "도서 폐기 처리",
                        "nameCamelCase": "discardBook",
                        "namePascalCase": "DiscardBook",
                        "namePlural": "discardBooks",
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
                        "id": "0f12feae-d77e-78f9-e44e-c9684300799e",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "0f12feae-d77e-78f9-e44e-c9684300799e",
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
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "updatedAt",
                                "nameCamelCase": "updatedAt",
                                "namePascalCase": "UpdatedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "0f12feae-d77e-78f9-e44e-c9684300799e",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BookDiscarded",
                        "displayName": "도서 폐기 처리 완료",
                        "nameCamelCase": "bookDiscarded",
                        "namePascalCase": "BookDiscarded",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        }
                    },
                    "from": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                    "to": "0f12feae-d77e-78f9-e44e-c9684300799e",
                    "relationView": {
                        "id": "611c3516-982f-42f7-e7f8-c914399105c8",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                        "to": "0f12feae-d77e-78f9-e44e-c9684300799e",
                        "needReconnect": true,
                        "value": "[[606,512],[694,512]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "48cd6ce5-c187-9c1a-8e1e-11a24339ea9a",
                        "id": "611c3516-982f-42f7-e7f8-c914399105c8",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "0f12feae-d77e-78f9-e44e-c9684300799e",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "b76e777b-65c5-648b-e88d-22951e82684d": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "b76e777b-65c5-648b-e88d-22951e82684d",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanTransactionRequested"
                        ],
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        },
                        "controllerInfo": {
                            "apiPath": "requestloantransaction",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                        "id": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "RequestLoanTransaction",
                        "displayName": "대출 신청",
                        "nameCamelCase": "requestLoanTransaction",
                        "namePascalCase": "RequestLoanTransaction",
                        "namePlural": "requestLoanTransactions",
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
                        "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
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
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionRequested",
                        "displayName": "대출 신청 완료",
                        "nameCamelCase": "loanTransactionRequested",
                        "namePascalCase": "LoanTransactionRequested",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        }
                    },
                    "from": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                    "to": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                    "relationView": {
                        "id": "b76e777b-65c5-648b-e88d-22951e82684d",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                        "to": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                        "needReconnect": true,
                        "value": "[[1191,252],[1279,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "08027f09-d0d1-cb36-6211-e34afd5cdde4",
                        "id": "b76e777b-65c5-648b-e88d-22951e82684d",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "f257de35-6af2-c316-7b00-3468b26376f0": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "f257de35-6af2-c316-7b00-3468b26376f0",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanTransactionReturned"
                        ],
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        },
                        "controllerInfo": {
                            "apiPath": "processreturntransaction",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                            }
                        ],
                        "description": null,
                        "id": "287ada1d-ac41-1230-b11a-f813b2516d37",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "287ada1d-ac41-1230-b11a-f813b2516d37",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "287ada1d-ac41-1230-b11a-f813b2516d37",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ProcessReturnTransaction",
                        "displayName": "반납 처리",
                        "nameCamelCase": "processReturnTransaction",
                        "namePascalCase": "ProcessReturnTransaction",
                        "namePlural": "processReturnTransactions",
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
                        "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionReturned",
                        "displayName": "반납 처리 완료",
                        "nameCamelCase": "loanTransactionReturned",
                        "namePascalCase": "LoanTransactionReturned",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        }
                    },
                    "from": "287ada1d-ac41-1230-b11a-f813b2516d37",
                    "to": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                    "relationView": {
                        "id": "f257de35-6af2-c316-7b00-3468b26376f0",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "287ada1d-ac41-1230-b11a-f813b2516d37",
                        "to": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "needReconnect": true,
                        "value": "[[1191,380],[1279,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "287ada1d-ac41-1230-b11a-f813b2516d37",
                        "id": "f257de35-6af2-c316-7b00-3468b26376f0",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "ca40f61b-aeb5-53c2-415b-eae11b735042": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "ca40f61b-aeb5-53c2-415b-eae11b735042",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "ReservationTransactionRequested"
                        ],
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        },
                        "controllerInfo": {
                            "apiPath": "requestreservationtransaction",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reservationDate",
                                "nameCamelCase": "reservationDate",
                                "namePascalCase": "ReservationDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 510,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "RequestReservationTransaction",
                        "displayName": "예약 신청",
                        "nameCamelCase": "requestReservationTransaction",
                        "namePascalCase": "RequestReservationTransaction",
                        "namePlural": "requestReservationTransactions",
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
                        "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 510,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reservationDate",
                                "nameCamelCase": "reservationDate",
                                "namePascalCase": "ReservationDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ReservationTransactionRequested",
                        "displayName": "예약 신청 완료",
                        "nameCamelCase": "reservationTransactionRequested",
                        "namePascalCase": "ReservationTransactionRequested",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        }
                    },
                    "from": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                    "to": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                    "relationView": {
                        "id": "ca40f61b-aeb5-53c2-415b-eae11b735042",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                        "to": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "needReconnect": true,
                        "value": "[[1191,512],[1279,512]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "0273ad23-09ec-5ac4-9f7e-eeb4e27b94e2",
                        "id": "ca40f61b-aeb5-53c2-415b-eae11b735042",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "3ee6fcf3-e084-80c9-28e6-44da6bc800df": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "3ee6fcf3-e084-80c9-28e6-44da6bc800df",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
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
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionRequested",
                        "displayName": "대출 신청 완료",
                        "nameCamelCase": "loanTransactionRequested",
                        "namePascalCase": "LoanTransactionRequested",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        }
                    },
                    "targetElement": {
                        "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "description": "LoanTransactionRequested 이벤트 발생 시, 도서 상태를 '대출중'으로 갱신하여 대출 관리 시스템의 상태 일관성을 유지합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanRequestToBookLoanStatusPolicy",
                        "displayName": "대출 요청에 따른 도서 상태 업데이트 정책",
                        "nameCamelCase": "loanRequestToBookLoanStatusPolicy",
                        "namePascalCase": "LoanRequestToBookLoanStatusPolicy",
                        "namePlural": "loanRequestToBookLoanStatusPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                    "to": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                    "relationView": {
                        "id": "3ee6fcf3-e084-80c9-28e6-44da6bc800df",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                        "to": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "needReconnect": true,
                        "value": "[[1279,252],[884,252],[884,380],[487,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "25f45fdb-9734-57a8-f36f-3c2447f57f28",
                        "id": "3ee6fcf3-e084-80c9-28e6-44da6bc800df",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "5ec0793e-da16-5125-9ea8-509aa5a96b0e": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "5ec0793e-da16-5125-9ea8-509aa5a96b0e",
                    "sourceElement": {
                        "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "description": "LoanTransactionRequested 이벤트 발생 시, 도서 상태를 '대출중'으로 갱신하여 대출 관리 시스템의 상태 일관성을 유지합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanRequestToBookLoanStatusPolicy",
                        "displayName": "대출 요청에 따른 도서 상태 업데이트 정책",
                        "nameCamelCase": "loanRequestToBookLoanStatusPolicy",
                        "namePascalCase": "LoanRequestToBookLoanStatusPolicy",
                        "namePlural": "loanRequestToBookLoanStatusPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Status",
                                "isCopy": false,
                                "isKey": false,
                                "name": "newStatus",
                                "nameCamelCase": "newStatus",
                                "namePascalCase": "NewStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "PUT"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                    "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                    "relationView": {
                        "id": "5ec0793e-da16-5125-9ea8-509aa5a96b0e",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "needReconnect": true,
                        "value": "[[487,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "c1ec54fb-9432-4446-0355-6f054b4aebe3",
                        "id": "5ec0793e-da16-5125-9ea8-509aa5a96b0e",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "eda3e790-469e-fd46-5695-2b1e17572e4c": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "eda3e790-469e-fd46-5695-2b1e17572e4c",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionReturned",
                        "displayName": "반납 처리 완료",
                        "nameCamelCase": "loanTransactionReturned",
                        "namePascalCase": "LoanTransactionReturned",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        }
                    },
                    "targetElement": {
                        "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "description": "LoanTransactionReturned 이벤트 발생 시, 도서 상태를 '대출가능'으로 전환하여 도서가 다시 대출 가능한 상태로 복원됩니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanReturnToBookAvailableStatusPolicy",
                        "displayName": "반납 거래 발생시 도서 상태 업데이트 정책",
                        "nameCamelCase": "loanReturnToBookAvailableStatusPolicy",
                        "namePascalCase": "LoanReturnToBookAvailableStatusPolicy",
                        "namePlural": "loanReturnToBookAvailableStatusPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                    "to": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                    "relationView": {
                        "id": "eda3e790-469e-fd46-5695-2b1e17572e4c",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "to": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "needReconnect": true,
                        "value": "[[1279,380],[487,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "c441520a-cd5e-78e4-fe1f-6ec19bc360dd",
                        "id": "eda3e790-469e-fd46-5695-2b1e17572e4c",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "b10cebb3-164d-2572-113c-aabf16f30ef2": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "b10cebb3-164d-2572-113c-aabf16f30ef2",
                    "sourceElement": {
                        "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "description": "LoanTransactionReturned 이벤트 발생 시, 도서 상태를 '대출가능'으로 전환하여 도서가 다시 대출 가능한 상태로 복원됩니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanReturnToBookAvailableStatusPolicy",
                        "displayName": "반납 거래 발생시 도서 상태 업데이트 정책",
                        "nameCamelCase": "loanReturnToBookAvailableStatusPolicy",
                        "namePascalCase": "LoanReturnToBookAvailableStatusPolicy",
                        "namePlural": "loanReturnToBookAvailableStatusPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Status",
                                "isCopy": false,
                                "isKey": false,
                                "name": "newStatus",
                                "nameCamelCase": "newStatus",
                                "namePascalCase": "NewStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "PUT"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                    "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                    "relationView": {
                        "id": "b10cebb3-164d-2572-113c-aabf16f30ef2",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "needReconnect": true,
                        "value": "[[487,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "3ae240fa-0eb7-00a9-06cc-fd6b1b9a5120",
                        "id": "b10cebb3-164d-2572-113c-aabf16f30ef2",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "72889a1e-782f-b87e-8168-bf78d2fbd712": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "72889a1e-782f-b87e-8168-bf78d2fbd712",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                            "style": "{}",
                            "width": 100,
                            "x": 1329,
                            "y": 510,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "reservationDate",
                                "nameCamelCase": "reservationDate",
                                "namePascalCase": "ReservationDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "ReservationTransactionRequested",
                        "displayName": "예약 신청 완료",
                        "nameCamelCase": "reservationTransactionRequested",
                        "namePascalCase": "ReservationTransactionRequested",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "653f7138-5456-461f-e70a-e676cfc49b9a"
                        },
                        "boundedContext": {
                            "id": "4ddb04c5-2cf6-3998-e527-edf16a959efb"
                        }
                    },
                    "targetElement": {
                        "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "description": "ReservationTransactionRequested 이벤트 발생 시, 도서의 상태를 '예약중'으로 변경하여 예약 관리 상태를 정확하게 반영합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ReservationRequestToBookReservationStatusPolicy",
                        "displayName": "예약 거래 발생시 도서 상태 업데이트 정책",
                        "nameCamelCase": "reservationRequestToBookReservationStatusPolicy",
                        "namePascalCase": "ReservationRequestToBookReservationStatusPolicy",
                        "namePlural": "reservationRequestToBookReservationStatusPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                    "to": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                    "relationView": {
                        "id": "72889a1e-782f-b87e-8168-bf78d2fbd712",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "to": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "needReconnect": true,
                        "value": "[[1279,512],[884,512],[884,380],[487,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "923aa143-8b45-51d9-e4bf-b291c2075c5c",
                        "id": "72889a1e-782f-b87e-8168-bf78d2fbd712",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "09cecf89-80ee-74ec-37bd-ad0e4370a820": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "09cecf89-80ee-74ec-37bd-ad0e4370a820",
                    "sourceElement": {
                        "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "description": "ReservationTransactionRequested 이벤트 발생 시, 도서의 상태를 '예약중'으로 변경하여 예약 관리 상태를 정확하게 반영합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "ReservationRequestToBookReservationStatusPolicy",
                        "displayName": "예약 거래 발생시 도서 상태 업데이트 정책",
                        "nameCamelCase": "reservationRequestToBookReservationStatusPolicy",
                        "namePascalCase": "ReservationRequestToBookReservationStatusPolicy",
                        "namePlural": "reservationRequestToBookReservationStatusPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "cc721073-c579-8aaa-e6d4-5475304059a7"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "e0e608d4-baed-ebff-9767-02d44ab21c02"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Status",
                                "isCopy": false,
                                "isKey": false,
                                "name": "newStatus",
                                "nameCamelCase": "newStatus",
                                "namePascalCase": "NewStatus",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "75fca504-958c-2628-ed80-8e98277e00dd",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "PUT"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                    "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                    "relationView": {
                        "id": "09cecf89-80ee-74ec-37bd-ad0e4370a820",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "needReconnect": true,
                        "value": "[[487,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "961eccc1-a43a-f345-0fb3-cfbee306d2fc",
                        "id": "09cecf89-80ee-74ec-37bd-ad0e4370a820",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "75fca504-958c-2628-ed80-8e98277e00dd",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                }
            }
        }
    },
    libraryService: {
        "draft": {
            "BookManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Book",
                            "alias": "도서"
                        },
                        "enumerations": [
                            {
                                "name": "Category",
                                "alias": "카테고리"
                            },
                            {
                                "name": "Status",
                                "alias": "도서상태"
                            }
                        ],
                        "valueObjects": []
                    }
                ],
                "pros": {
                    "cohesion": "매우 높음: 도서의 등록, 관리, 상태 전이 등의 모든 기능을 하나의 Aggregate로 집중 관리.",
                    "coupling": "매우 낮음: 외부 Aggregate와의 의존성이 없으며 단일 트랜잭션 내에서 모든 변경이 처리됨.",
                    "consistency": "매우 높음: 하나의 Aggregate 내에서 상태 전이 및 불변성이 보장되어 트랜잭션 일관성이 뛰어남.",
                    "encapsulation": "높음: 도서 도메인의 핵심 속성이 하나의 경계 내에 캡슐화됨.",
                    "complexity": "낮음: 단일 Aggregate로 구조가 단순하며 관리가 용이함.",
                    "independence": "높음: 도서 등록 및 상태 변경 기능이 독립적으로 운영될 수 있음.",
                    "performance": "높음: 단일 Aggregate로 인한 데이터 조회 및 변경이 신속하게 이루어짐."
                },
                "cons": {
                    "cohesion": "단일 Aggregate가 지나치게 확장될 경우 책임이 집중될 수 있음.",
                    "coupling": "없음: 외부 시스템과의 낮은 결합도를 유지하나, 미래 확장 시 재구성이 필요할 수 있음.",
                    "consistency": "없음: 단일 트랜잭션 내 처리로 일관성은 보장되나, Aggregate가 커질 경우 잠금 경쟁 이슈 가능성이 있음.",
                    "encapsulation": "없음: 모든 도서 관련 데이터가 한 곳에 모이므로 캡슐화는 충분함.",
                    "complexity": "낮음: 도서 관련 로직이 한곳에 집중되나 역할 분리가 어려울 수 있음.",
                    "independence": "낮음: 모든 기능이 단일 경계 내에 있으므로 독립적 변화에 제한이 있을 수 있음.",
                    "performance": "낮음: Aggregate 크기가 커지면 성능 저하 위험이 있음."
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"도서 관리 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 해며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\"}]",
                    "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
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
                    "definitionId": "4628e249f9170e1f9050b3fc700e9e11"
                },
                "description": "{\"userStories\":[{\"title\":\"도서 등록 및 관리\",\"description\":\"사용자는 도서 관리 화면에서 새로운 도서를 등록하고, 등록된 도서의 대출 상태를 관리할 수 있다. 신규 등록 시 도서명, ISBN, 저자, 출판사, 카테고리 정보를 필수 입력 받고, ISBN은 13자리 숫자이며 중복 체크가 수행된다. 등록 후 도서는 초기 '대출가능' 상태로 표시되며, 대출, 반납, 예약 등의 이벤트에 따라 상태가 자동 갱신된다. 또한, 도서가 훼손되거나 분실된 경우, '폐기' 처리를 통해 대출 기능에서 제외된다.\",\"acceptance\":[\"도서 등록 시 도서명, ISBN, 저자, 출판사, 카테고리 정보를 반드시 입력해야 한다.\",\"ISBN은 13자리 숫자여야 하며, 중복 체크 로직이 구현되어 있다.\",\"카테고리는 소설, 비소설, 학술, 잡지 중에서 선택할 수 있다.\",\"등록된 도서는 초기 상태가 '대출가능'이며, 대출/반납/예약에 따라 상태가 자동 변경된다.\",\"도서가 훼손되거나 분실되면 '폐기' 처리되어 대출 기능에서 제외된다.\"]}],\"entities\":{\"Book\":{\"properties\":[{\"name\":\"bookTitle\",\"type\":\"String\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"author\",\"type\":\"String\",\"required\":true},{\"name\":\"publisher\",\"type\":\"String\",\"required\":true},{\"name\":\"category\",\"type\":\"enum\",\"required\":true,\"values\":[\"소설\",\"비소설\",\"학술\",\"잡지\"]},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"폐기\"]}]}},\"businessRules\":[{\"name\":\"ISBN 형식 검증\",\"description\":\"ISBN은 13자리 숫자로 구성되어야 하며, 입력된 ISBN은 기존 등록 도서와 중복되지 않아야 한다.\"},{\"name\":\"초기 대출 상태\",\"description\":\"신규 등록된 도서는 자동으로 '대출가능' 상태로 설정된다.\"},{\"name\":\"상태 전이 관리\",\"description\":\"대출, 반납, 예약, 훼손 또는 분실 이벤트 발생 시 도서의 상태는 각각 '대출중', '예약중', '폐기'로 자동 갱신된다.\"},{\"name\":\"폐기 처리\",\"description\":\"도서가 '폐기' 상태일 경우 더 이상 대출이 불가능하다.\"}],\"interfaces\":{\"BookManagement\":{\"sections\":[{\"name\":\"도서 등록\",\"type\":\"form\",\"fields\":[{\"name\":\"bookTitle\",\"type\":\"text\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"author\",\"type\":\"text\",\"required\":true},{\"name\":\"publisher\",\"type\":\"text\",\"required\":true},{\"name\":\"category\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Register Book\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 상태 관리\",\"type\":\"table\",\"fields\":[],\"actions\":[\"Modify Status\",\"Discard Book\"],\"filters\":[\"category\",\"status\"],\"resultTable\":{\"columns\":[\"ISBN\",\"bookTitle\",\"author\",\"publisher\",\"category\",\"status\"],\"actions\":[\"View Details\"]}}]}}}"
            },
            "LoanManagement": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "Member",
                            "alias": "회원 정보"
                        },
                        "enumerations": [],
                        "valueObjects": []
                    },
                    {
                        "aggregate": {
                            "name": "LoanTransaction",
                            "alias": "대출/반납 거래"
                        },
                        "enumerations": [
                            {
                                "name": "TransactionType",
                                "alias": "거래 유형"
                            }
                        ],
                        "valueObjects": [
                            {
                                "name": "MemberReference",
                                "alias": "회원 참조",
                                "referencedAggregate": {
                                    "name": "Member",
                                    "alias": "회원 정보"
                                }
                            },
                            {
                                "name": "BookReference",
                                "alias": "도서 참조",
                                "referencedAggregate": {
                                    "name": "Book",
                                    "alias": "도서"
                                }
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "높음: 역할에 따른 Aggregate 분리로 각 Aggregate의 책임이 명확함.",
                    "coupling": "낮음: LoanTransaction이 Member를 참조하는 단방향 관계로 구성됨.",
                    "consistency": "높음: 각 Aggregate별로 트랜잭션 경계를 분리하여 관리함.",
                    "encapsulation": "높음: 회원 정보와 대출/반납 거래의 도메인 로직을 분리하여 캡슐화함.",
                    "complexity": "중간: 두 Aggregate 간의 연계가 필요하지만 전체 복잡성은 낮음.",
                    "independence": "높음: 독립적으로 변경 및 확장이 가능함.",
                    "performance": "중간: Aggregate 간 참조로 인한 약간의 오버헤드가 있을 수 있음."
                },
                "cons": {
                    "cohesion": "중간: Aggregate 분리로 인해 일부 비즈니스 규칙이 여러 Aggregate에 걸쳐 적용될 수 있음.",
                    "coupling": "중간: Member와 LoanTransaction 간의 연계로 복잡도가 약간 증가할 수 있음.",
                    "consistency": "중간: 다수의 Aggregate 간 일관성 유지에 추가 고려가 필요함.",
                    "encapsulation": "중간: 분리된 Aggregate 간 데이터 접근 시 경계 관리가 필요함.",
                    "complexity": "중간: 두 Aggregate 간 조율이 추가됨.",
                    "independence": "중간: 트랜잭션 경계가 분리되면서 동기화 이슈가 발생할 수 있음.",
                    "performance": "중간: 다중 Aggregate 접근으로 인한 약간의 성능 저하 우려."
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"대출/반납 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\"}]",
                    "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                        "style": "{}",
                        "width": 560,
                        "x": 1235,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
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
                    "definitionId": "4628e249f9170e1f9050b3fc700e9e11"
                },
                "description": "{\"userStories\":[{\"title\":\"대출/반납 관리 화면\",\"description\":\"회원은 대출/반납 화면에서 회원 번호와 이름으로 본인을 확인한 후, 원하는 도서를 검색 및 선택하여 대출 신청 또는 반납 처리를 할 수 있어야 합니다. 또한, 대출하려는 도서가 이미 대출 중인 경우 예약 신청이 가능해야 합니다.\",\"acceptance\":[\"회원 번호와 이름을 통한 회원 확인 기능이 제공된다.\",\"도서는 도서명 또는 ISBN으로 검색할 수 있다.\",\"대출 기간은 7일, 14일, 30일 옵션 중 선택할 수 있다.\",\"대출 신청 시 모든 필수 정보가 입력되어야 하며, 그렇지 않으면 대출 버튼이 활성화되지 않는다.\",\"이미 대출중인 도서에 대해 예약 신청 기능이 제공된다.\",\"대출 완료 후 도서의 상태가 '대출중'으로 자동 변경된다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberNumber\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"String\",\"required\":true}]},\"Book\":{\"properties\":[{\"name\":\"ISBN\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약신청\"]}]},\"Loan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberNumber\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookISBN\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanPeriod\",\"type\":\"Integer\",\"required\":true},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true}]}},\"businessRules\":[{\"name\":\"회원 검증\",\"description\":\"대출 신청 시 회원 번호와 이름을 통해 회원 정보를 확인해야 한다.\"},{\"name\":\"도서 검색\",\"description\":\"도서는 도서명이나 ISBN으로 검색할 수 있어야 한다.\"},{\"name\":\"대출 기간 옵션\",\"description\":\"대출 기간은 7일, 14일, 30일 중 하나로 선택되어야 한다.\"},{\"name\":\"예약 신청 가능\",\"description\":\"대출하려는 도서가 이미 대출중인 경우 예약 신청 기능이 제공되어야 한다.\"},{\"name\":\"도서 상태 변경\",\"description\":\"대출이 완료되면 해당 도서의 상태가 자동으로 '대출중'으로 변경되어야 한다.\"}],\"interfaces\":{\"LoanReturnScreen\":{\"sections\":[{\"name\":\"회원 정보\",\"type\":\"form\",\"fields\":[{\"name\":\"memberNumber\",\"type\":\"text\",\"required\":true},{\"name\":\"name\",\"type\":\"text\",\"required\":true}],\"actions\":[],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}},{\"name\":\"도서 검색 및 대출 정보\",\"type\":\"form\",\"fields\":[{\"name\":\"bookSearch\",\"type\":\"text\",\"required\":true},{\"name\":\"searchButton\",\"type\":\"button\"},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true}],\"actions\":[\"Loan Request\",\"Return Process\"],\"filters\":[],\"resultTable\":{\"columns\":[],\"actions\":[]}}]}}}"
            },
            "LoanHistory": {
                "structure": [
                    {
                        "aggregate": {
                            "name": "LoanRecord",
                            "alias": "대출 기록"
                        },
                        "enumerations": [
                            {
                                "name": "LoanStatus",
                                "alias": "대출 상태"
                            },
                            {
                                "name": "StatusChangeEnum",
                                "alias": "상태 변경 이력"
                            }
                        ],
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
                                "name": "StatusHistoryEntry",
                                "alias": "상태 이력 항목",
                                "referencedAggregateName": ""
                            }
                        ]
                    }
                ],
                "pros": {
                    "cohesion": "매우 높음: 대출 정보와 이력 데이터가 한 애그리거트 내에 응집되어 있음.",
                    "coupling": "매우 낮음: 외부 애그리거트(Book 등)를 Value Object로 참조하여 결합도가 낮음.",
                    "consistency": "매우 높음: 단일 트랜잭션 내에서 모든 데이터 변경이 처리되어 일관성 보장.",
                    "encapsulation": "높음: 대출과 관련된 모든 로직이 한 애그리거트 내에 캡슐화됨.",
                    "complexity": "보통: 애그리거트 내에 여러 기능을 포함하지만 구조가 단순함.",
                    "independence": "높음: 단일 애그리거트로 독립적 운용이 가능함.",
                    "performance": "높음: 내부 조회 및 변경이 단일 트랜잭션으로 처리되어 성능 이점이 있음."
                },
                "cons": {
                    "cohesion": "보통: 기능이 증가할 경우 애그리거트가 비대해질 위험이 있음.",
                    "coupling": "낮음: 단일 애그리거트 내 구성으로 확장이 어려울 수 있음.",
                    "consistency": "보통: 애그리거트 규모가 커질 경우 처리 지연 가능성이 있음.",
                    "encapsulation": "보통: 내부 로직 복잡도가 상승할 경우 관리가 어려워질 수 있음.",
                    "complexity": "보통: 모든 관련 기능을 한 곳에서 관리해야 하므로 복잡성이 증가할 수 있음.",
                    "independence": "보통: 대출 정보와 이력 데이터가 같이 변경되어 독립적 확장이 제한될 수 있음.",
                    "performance": "보통: 대용량 데이터 처리 시 단일 애그리거트로 인한 성능 병목 우려."
                },
                "isAIRecommended": true,
                "boundedContext": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\"}]",
                    "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57",
                        "style": "{}",
                        "width": 560,
                        "x": 1820,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "LoanHistory",
                    "displayName": "대출 현황 관리",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": 8081,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "4628e249f9170e1f9050b3fc700e9e11"
                },
                "description": "{\"userStories\":[{\"title\":\"대출 현황 화면 구축\",\"description\":\"사용자는 대출 현황 화면을 통해 현재 대출 중인 도서들의 대출 정보(대출일, 반납예정일, 현재 상태)를 확인하고, 필요시 연장이나 반납 처리를 할 수 있어야 하며, 도서의 대출 이력과 상태 변경 이력을 조회할 수 있어야 한다.\",\"acceptance\":[\"대출 현황 화면에 현재 대출 중인 도서 목록이 테이블 형식으로 표시된다.\",\"각 도서의 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)가 명확히 나타난다.\",\"대출 중인 도서에 대해 연장 및 반납 버튼이 제공되어, 해당 기능을 수행할 수 있다.\",\"도서 반납 시, 예약자가 없으면 도서 상태가 '대출가능'으로, 예약자가 있으면 '예약중'으로 자동 변경된다.\",\"각 도서별 대출 이력과 상태 변경 이력을 상세 팝업으로 조회할 수 있다.\"]}],\"entities\":{\"BookLoan\":{\"properties\":[{\"name\":\"loanId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"loanDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"dueDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"연체\",\"반납완료\"]}]},\"Book\":{\"properties\":[{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"title\",\"type\":\"String\",\"required\":true},{\"name\":\"currentStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\"]}]},\"BookStatusHistory\":{\"properties\":[{\"name\":\"historyId\",\"type\":\"String\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"bookId\",\"type\":\"String\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Book\"},{\"name\":\"changeDate\",\"type\":\"Date\",\"required\":true},{\"name\":\"previousStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"연체\",\"반납완료\"]},{\"name\":\"newStatus\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출가능\",\"대출중\",\"예약중\",\"연체\",\"반납완료\"]}]}},\"businessRules\":[{\"name\":\"반납 상태 자동 변경\",\"description\":\"도서가 반납되면 해당 도서의 상태는 자동으로 '대출가능'으로 변경된다. 단, 도서에 예약자가 있을 경우 '예약중'으로 변경된다.\"},{\"name\":\"연장 및 반납 처리\",\"description\":\"대출 중인 도서에 대해서는 연장과 반납 처리가 가능하며, 처리 이후에는 대출 이력 및 상태 변경 이력이 생성된다.\"},{\"name\":\"이력 조회\",\"description\":\"각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하며, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 한다.\"}],\"interfaces\":{\"LoanStatusScreen\":{\"sections\":[{\"name\":\"대출 현황 테이블\",\"type\":\"table\",\"fields\":[],\"actions\":[\"연장\",\"반납\",\"상세보기\"],\"filters\":[\"dateRange\",\"loanStatus\"],\"resultTable\":{\"columns\":[\"loanId\",\"bookId\",\"loanDate\",\"dueDate\",\"status\"],\"actions\":[\"View Loan History\",\"View Status History\"]}}]}}}"
            }
        },
        "esValue": {
            "elements": {
                "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"도서 관리 화면에서는 새로운 도서를 등록하고 현재 보유한 도서들의 상태를 관리할 수 있어야 해. 도서 등록 시에는 도서명, ISBN, 저자, 출판사, 카테고리 정보를 입력받아야 해. ISBN은 13자리 숫자여야 하고 중복 확인이 필요해. 카테고리는 소설/비소설/학술/잡지 중에서 선택할 수 있어야 해. 등록된 도서는 처음에 '대출가능' 상태가 되고, 이후 대출/반납 상황에 따라 '대출중', '예약중' 상태로 자동으로 변경되어야 해. 도서가 훼손되거나 분실된 경우 '폐기' 처리가 가능해야 해며, 폐기된 도서는 더 이상 대출이 불가능해야 해.\"}]",
                    "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 726,
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
                        "style": "{}",
                        "width": 560,
                        "x": 650,
                        "y": 518
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
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
                    "definitionId": "4628e249f9170e1f9050b3fc700e9e11"
                },
                "d66e3a59-c465-2491-7f7a-0fa741087a1f": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                        },
                        {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"대출/반납 화면에서는 회원이 도서를 대출하고 반납하는 것을 관리할 수 있어야 해. 대출 신청 시에는 회원번호와 이름으로 회원을 확인하고, 대출할 도서를 선택해야 해. 도서는 도서명이나 ISBN으로 검색할 수 있어야 해. 대출 기간은 7일/14일/30일 중에서 선택할 수 있어. 만약 대출하려는 도서가 이미 대출 중이라면, 예약 신청이 가능해야 해. 대출이 완료되면 해당 도서의 상태는 자동으로 '대출중'으로 변경되어야 해.\"}]",
                    "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                        "style": "{}",
                        "width": 1010,
                        "x": 1460,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
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
                    "definitionId": "4628e249f9170e1f9050b3fc700e9e11"
                },
                "f3e979a6-2510-7df5-eaf2-86bcad79ce57": {
                    "_type": "org.uengine.modeling.model.BoundedContext",
                    "aggregates": [
                        {
                            "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                        }
                    ],
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "description": "[{\"type\":\"userStory\",\"text\":\"대출 현황 화면에서는 현재 대출 중인 도서들의 목록을 볼 수 있어야 해. 각 대출 건에 대해 대출일, 반납예정일, 현재 상태(대출중/연체/반납완료)를 확인할 수 있어야 하고, 대출 중인 도서는 연장이나 반납 처리가 가능해야 해. 도서가 반납되면 자동으로 해당 도서의 상태가 '대출가능'으로 변경되어야 해. 만약 예약자가 있는 도서가 반납되면, 해당 도서는 '예약중' 상태로 변경되어야 해. 각 도서별로 대출 이력과 상태 변경 이력을 조회할 수 있어야 하고, 이를 통해 도서의 대출 현황과 상태 변화를 추적할 수 있어야 해.\"}]",
                    "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.BoundedContext",
                        "height": 590,
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57",
                        "style": "{}",
                        "width": 560,
                        "x": 2270,
                        "y": 450
                    },
                    "gitURL": null,
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                        "height": 350,
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57",
                        "style": "{}",
                        "width": 350,
                        "x": 235,
                        "y": 365
                    },
                    "members": [],
                    "name": "LoanHistory",
                    "displayName": "대출 현황 관리",
                    "oldName": "",
                    "policies": [],
                    "portGenerated": 8081,
                    "preferredPlatform": "template-spring-boot",
                    "preferredPlatformConf": {},
                    "rotateStatus": false,
                    "tempId": "",
                    "templatePerElements": {},
                    "views": [],
                    "definitionId": "4628e249f9170e1f9050b3fc700e9e11"
                },
                "5e3aa600-ef91-81e1-b591-b701b4cd83db": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookTitle",
                                "nameCamelCase": "bookTitle",
                                "namePascalCase": "BookTitle",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
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
                                "e3e9e36a-da65-f83b-75a1-777f595b530c": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "e3e9e36a-da65-f83b-75a1-777f595b530c",
                                    "name": "Book",
                                    "namePascalCase": "Book",
                                    "nameCamelCase": "book",
                                    "namePlural": "Books",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "bookTitle",
                                            "displayName": "",
                                            "nameCamelCase": "bookTitle",
                                            "namePascalCase": "BookTitle",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "ISBN",
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
                                        "id": "e3e9e36a-da65-f83b-75a1-777f595b530c",
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
                                    "parentId": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                                },
                                "cb8b10c8-0b32-3b0c-000d-b9191a7134a0": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "cb8b10c8-0b32-3b0c-000d-b9191a7134a0",
                                    "name": "Category",
                                    "displayName": "카테고리",
                                    "nameCamelCase": "category",
                                    "namePascalCase": "Category",
                                    "namePlural": "categories",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "cb8b10c8-0b32-3b0c-000d-b9191a7134a0",
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
                                            "value": "FICTION"
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
                                "46d0da65-7132-881a-30d0-7d3bd2afd894": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "46d0da65-7132-881a-30d0-7d3bd2afd894",
                                    "name": "Status",
                                    "displayName": "도서상태",
                                    "nameCamelCase": "status",
                                    "namePascalCase": "Status",
                                    "namePlural": "statuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "46d0da65-7132-881a-30d0-7d3bd2afd894",
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
                                            "value": "LOANED"
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
                        "name": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "commands": [],
                    "description": null,
                    "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
                        "x": 650,
                        "y": 525,
                        "width": 130,
                        "height": 550
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
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
                "f6f849fa-ddd2-ca3e-7345-d57ebe52c757": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "name",
                                "nameCamelCase": "name",
                                "namePascalCase": "Name",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "87ea8195-d741-4e72-bd76-4f3b2f31f67e": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "87ea8195-d741-4e72-bd76-4f3b2f31f67e",
                                    "name": "Member",
                                    "namePascalCase": "Member",
                                    "nameCamelCase": "member",
                                    "namePlural": "Members",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": true,
                                            "name": "memberNumber",
                                            "displayName": "",
                                            "nameCamelCase": "memberNumber",
                                            "namePascalCase": "MemberNumber",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "name",
                                            "displayName": "",
                                            "nameCamelCase": "name",
                                            "namePascalCase": "Name",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "87ea8195-d741-4e72-bd76-4f3b2f31f67e",
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
                                    "parentId": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                                }
                            },
                            "relations": {}
                        },
                        "operations": []
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "name": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "commands": [],
                    "description": null,
                    "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                        "x": 1235,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "Member",
                    "displayName": "회원 정보",
                    "nameCamelCase": "member",
                    "namePascalCase": "Member",
                    "namePlural": "members",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "dedaa92f-b958-0d49-7b17-0c7310142fd5": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
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
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "MemberId",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberId",
                                "nameCamelCase": "memberId",
                                "namePascalCase": "MemberId",
                                "displayName": "",
                                "referenceClass": "Member",
                                "isOverrideField": true,
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
                                "55284910-50ba-6af2-5524-1b9e93315a1a": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "55284910-50ba-6af2-5524-1b9e93315a1a",
                                    "name": "LoanTransaction",
                                    "namePascalCase": "LoanTransaction",
                                    "nameCamelCase": "loanTransaction",
                                    "namePlural": "LoanTransactions",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
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
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "memberNumber",
                                            "displayName": "",
                                            "nameCamelCase": "memberNumber",
                                            "namePascalCase": "MemberNumber",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "String",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "bookISBN",
                                            "displayName": "",
                                            "nameCamelCase": "bookIsbn",
                                            "namePascalCase": "BookIsbn",
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
                                            "className": "TransactionType",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "transactionType",
                                            "displayName": "",
                                            "nameCamelCase": "transactionType",
                                            "namePascalCase": "TransactionType",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "MemberId",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "memberId",
                                            "nameCamelCase": "memberId",
                                            "namePascalCase": "MemberId",
                                            "displayName": "",
                                            "referenceClass": "Member",
                                            "isOverrideField": true,
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
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "55284910-50ba-6af2-5524-1b9e93315a1a",
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
                                    "parentId": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                                },
                                "bf0d4808-e955-f452-b22b-867e0bd2ead3": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "bf0d4808-e955-f452-b22b-867e0bd2ead3",
                                    "name": "TransactionType",
                                    "displayName": "거래 유형",
                                    "nameCamelCase": "transactionType",
                                    "namePascalCase": "TransactionType",
                                    "namePlural": "transactionTypes",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "bf0d4808-e955-f452-b22b-867e0bd2ead3",
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
                                            "value": "LOAN"
                                        },
                                        {
                                            "value": "RETURN"
                                        },
                                        {
                                            "value": "RESERVATION"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": []
                                },
                                "79e984f9-bfad-ba2f-9166-141d4143a573": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "79e984f9-bfad-ba2f-9166-141d4143a573",
                                    "name": "MemberId",
                                    "displayName": "",
                                    "namePascalCase": "MemberId",
                                    "nameCamelCase": "memberId",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": true,
                                            "label": "- memberNumber: String",
                                            "name": "memberNumber",
                                            "nameCamelCase": "memberNumber",
                                            "namePascalCase": "MemberNumber",
                                            "displayName": "",
                                            "referenceClass": "Member",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "79e984f9-bfad-ba2f-9166-141d4143a573",
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
                                    "namePlural": "MemberIds",
                                    "isAbstract": false,
                                    "isInterface": false
                                },
                                "5c705af5-b857-540f-b7bb-7f32864e8e8d": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "5c705af5-b857-540f-b7bb-7f32864e8e8d",
                                    "name": "BookId",
                                    "displayName": "",
                                    "namePascalCase": "BookId",
                                    "nameCamelCase": "bookId",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
                                            "isKey": true,
                                            "label": "- ISBN: String",
                                            "name": "ISBN",
                                            "nameCamelCase": "isbn",
                                            "namePascalCase": "Isbn",
                                            "displayName": "",
                                            "referenceClass": "Book",
                                            "isOverrideField": true,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "5c705af5-b857-540f-b7bb-7f32864e8e8d",
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
                                    "namePlural": "BookIds",
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
                        "name": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "commands": [],
                    "description": null,
                    "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "x": 1665,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "LoanTransaction",
                    "displayName": "대출/반납 거래",
                    "nameCamelCase": "loanTransaction",
                    "namePascalCase": "LoanTransaction",
                    "namePlural": "loanTransactions",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "c1dadd70-5fed-e164-a6b1-e941f742304e": {
                    "aggregateRoot": {
                        "_type": "org.uengine.modeling.model.AggregateRoot",
                        "fieldDescriptors": [
                            {
                                "className": "String",
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
                                "name": "dueDate",
                                "nameCamelCase": "dueDate",
                                "namePascalCase": "DueDate",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
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
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "List<StatusHistoryEntry>",
                                "isCopy": false,
                                "isKey": false,
                                "name": "statusHistoryEntries",
                                "nameCamelCase": "statusHistoryEntries",
                                "namePascalCase": "StatusHistoryEntries",
                                "displayName": "",
                                "referenceClass": null,
                                "isOverrideField": false,
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "entities": {
                            "elements": {
                                "25387355-351b-c1e0-947b-c6a49c6847ed": {
                                    "_type": "org.uengine.uml.model.Class",
                                    "id": "25387355-351b-c1e0-947b-c6a49c6847ed",
                                    "name": "LoanRecord",
                                    "namePascalCase": "LoanRecord",
                                    "nameCamelCase": "loanRecord",
                                    "namePlural": "LoanRecords",
                                    "fieldDescriptors": [
                                        {
                                            "className": "String",
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
                                            "name": "dueDate",
                                            "displayName": "",
                                            "nameCamelCase": "dueDate",
                                            "namePascalCase": "DueDate",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        },
                                        {
                                            "className": "LoanStatus",
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
                                            "className": "List<StatusHistoryEntry>",
                                            "isCopy": false,
                                            "isKey": false,
                                            "name": "statusHistoryEntries",
                                            "displayName": "",
                                            "nameCamelCase": "statusHistoryEntries",
                                            "namePascalCase": "StatusHistoryEntries",
                                            "_type": "org.uengine.model.FieldDescriptor",
                                            "inputUI": null,
                                            "options": null
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "25387355-351b-c1e0-947b-c6a49c6847ed",
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
                                    "parentId": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                                },
                                "8107033f-efc5-c4ee-5e5b-8423aecfcced": {
                                    "_type": "org.uengine.uml.model.vo.Class",
                                    "id": "8107033f-efc5-c4ee-5e5b-8423aecfcced",
                                    "name": "StatusHistoryEntry",
                                    "displayName": "상태 이력 항목",
                                    "namePascalCase": "StatusHistoryEntry",
                                    "nameCamelCase": "statusHistoryEntry",
                                    "fieldDescriptors": [
                                        {
                                            "className": "Date",
                                            "isKey": false,
                                            "label": "- changeDate: Date",
                                            "name": "changeDate",
                                            "nameCamelCase": "changeDate",
                                            "namePascalCase": "ChangeDate",
                                            "displayName": "",
                                            "referenceClass": null,
                                            "isOverrideField": false,
                                            "_type": "org.uengine.model.FieldDescriptor"
                                        }
                                    ],
                                    "operations": [],
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.vo.address.Class",
                                        "id": "8107033f-efc5-c4ee-5e5b-8423aecfcced",
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
                                    "relations": [
                                        "5e6361f2-a296-b214-5ff9-245af66d4aba"
                                    ],
                                    "groupElement": null,
                                    "isAggregateRoot": false,
                                    "namePlural": "StatusHistoryEntrys",
                                    "isAbstract": false,
                                    "isInterface": false
                                },
                                "ed2268ab-0ac6-00de-436d-811bad894ef5": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "ed2268ab-0ac6-00de-436d-811bad894ef5",
                                    "name": "LoanStatus",
                                    "displayName": "대출 상태",
                                    "nameCamelCase": "loanStatus",
                                    "namePascalCase": "LoanStatus",
                                    "namePlural": "loanStatuses",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "ed2268ab-0ac6-00de-436d-811bad894ef5",
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
                                            "value": "LOAN"
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
                                "75dbb098-6d69-ecda-4de0-52864596b619": {
                                    "_type": "org.uengine.uml.model.enum",
                                    "id": "75dbb098-6d69-ecda-4de0-52864596b619",
                                    "name": "StatusChangeEnum",
                                    "displayName": "상태 변경 이력",
                                    "nameCamelCase": "statusChangeEnum",
                                    "namePascalCase": "StatusChangeEnum",
                                    "namePlural": "statusChangeEnums",
                                    "elementView": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "75dbb098-6d69-ecda-4de0-52864596b619",
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
                                            "value": "LOAN"
                                        },
                                        {
                                            "value": "RESERVED"
                                        },
                                        {
                                            "value": "OVERDUE"
                                        },
                                        {
                                            "value": "RETURNED"
                                        }
                                    ],
                                    "useKeyValue": false,
                                    "relations": [
                                        "5e6361f2-a296-b214-5ff9-245af66d4aba"
                                    ]
                                }
                            },
                            "relations": {
                                "5e6361f2-a296-b214-5ff9-245af66d4aba": {
                                    "name": "StatusChangeEnum",
                                    "id": "5e6361f2-a296-b214-5ff9-245af66d4aba",
                                    "_type": "org.uengine.uml.model.Relation",
                                    "sourceElement": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "8107033f-efc5-c4ee-5e5b-8423aecfcced",
                                        "name": "StatusHistoryEntry",
                                        "displayName": "상태 이력 항목",
                                        "namePascalCase": "StatusHistoryEntry",
                                        "nameCamelCase": "statusHistoryEntry",
                                        "fieldDescriptors": [
                                            {
                                                "className": "Date",
                                                "isKey": false,
                                                "label": "- changeDate: Date",
                                                "name": "changeDate",
                                                "nameCamelCase": "changeDate",
                                                "namePascalCase": "ChangeDate",
                                                "displayName": "",
                                                "referenceClass": null,
                                                "isOverrideField": false,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "8107033f-efc5-c4ee-5e5b-8423aecfcced",
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
                                        "relations": [
                                            "5e6361f2-a296-b214-5ff9-245af66d4aba"
                                        ],
                                        "groupElement": null,
                                        "isAggregateRoot": false,
                                        "namePlural": "StatusHistoryEntrys",
                                        "isAbstract": false,
                                        "isInterface": false
                                    },
                                    "targetElement": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "75dbb098-6d69-ecda-4de0-52864596b619",
                                        "name": "StatusChangeEnum",
                                        "displayName": "상태 변경 이력",
                                        "nameCamelCase": "statusChangeEnum",
                                        "namePascalCase": "StatusChangeEnum",
                                        "namePlural": "statusChangeEnums",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "75dbb098-6d69-ecda-4de0-52864596b619",
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
                                                "value": "LOAN"
                                            },
                                            {
                                                "value": "RESERVED"
                                            },
                                            {
                                                "value": "OVERDUE"
                                            },
                                            {
                                                "value": "RETURNED"
                                            }
                                        ],
                                        "useKeyValue": false,
                                        "relations": [
                                            "5e6361f2-a296-b214-5ff9-245af66d4aba"
                                        ]
                                    },
                                    "from": "8107033f-efc5-c4ee-5e5b-8423aecfcced",
                                    "to": "75dbb098-6d69-ecda-4de0-52864596b619",
                                    "selected": false,
                                    "relationView": {
                                        "id": "5e6361f2-a296-b214-5ff9-245af66d4aba",
                                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                                        "from": "8107033f-efc5-c4ee-5e5b-8423aecfcced",
                                        "to": "75dbb098-6d69-ecda-4de0-52864596b619",
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
                        "name": "f3e979a6-2510-7df5-eaf2-86bcad79ce57",
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    },
                    "commands": [],
                    "description": null,
                    "id": "c1dadd70-5fed-e164-a6b1-e941f742304e",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Aggregate",
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e",
                        "x": 2270,
                        "y": 450,
                        "width": 130,
                        "height": 400
                    },
                    "events": [],
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.AggregateHexagonal",
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e",
                        "x": 0,
                        "y": 0,
                        "subWidth": 0,
                        "width": 0
                    },
                    "name": "LoanRecord",
                    "displayName": "대출 기록",
                    "nameCamelCase": "loanRecord",
                    "namePascalCase": "LoanRecord",
                    "namePlural": "loanRecords",
                    "rotateStatus": false,
                    "selected": false,
                    "_type": "org.uengine.modeling.model.Aggregate"
                },
                "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookTitle",
                            "nameCamelCase": "bookTitle",
                            "namePascalCase": "BookTitle",
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
                        "id": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BookCreated",
                    "displayName": "도서 등록 완료",
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
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    }
                },
                "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
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
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "updatedAt",
                            "nameCamelCase": "updatedAt",
                            "namePascalCase": "UpdatedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BookStatusUpdated",
                    "displayName": "도서 상태 수정 완료",
                    "nameCamelCase": "bookStatusUpdated",
                    "namePascalCase": "BookStatusUpdated",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    }
                },
                "f00ee07d-91fc-394c-608e-eb4258cc8dc5": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
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
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "discardedAt",
                            "nameCamelCase": "discardedAt",
                            "namePascalCase": "DiscardedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "BookDiscarded",
                    "displayName": "도서 폐기 완료",
                    "nameCamelCase": "bookDiscarded",
                    "namePascalCase": "BookDiscarded",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    }
                },
                "7814ac5e-2740-19e0-26eb-95ad1494ad78": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookCreated"
                    ],
                    "aggregate": {
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "controllerInfo": {
                        "apiPath": "createbook",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookTitle",
                            "nameCamelCase": "bookTitle",
                            "namePascalCase": "BookTitle",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "ISBN",
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
                    "id": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
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
                                        "bookTitle": "N/A",
                                        "ISBN": "NotExists",
                                        "author": "N/A",
                                        "publisher": "N/A",
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
                                        "bookTitle": "Effective Java",
                                        "ISBN": "9781234567890",
                                        "author": "Joshua Bloch",
                                        "publisher": "Pearson",
                                        "category": "ACADEMIC"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookCreated",
                                    "value": {
                                        "ISBN": "9781234567890",
                                        "bookTitle": "Effective Java",
                                        "author": "Joshua Bloch",
                                        "publisher": "Pearson",
                                        "category": "ACADEMIC",
                                        "status": "AVAILABLE"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookStatusUpdated"
                    ],
                    "aggregate": {
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "controllerInfo": {
                        "apiPath": "updatebookstatus",
                        "method": "PUT",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
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
                    "description": null,
                    "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "UpdateBookStatus",
                    "displayName": "도서 상태 수정",
                    "nameCamelCase": "updateBookStatus",
                    "namePascalCase": "UpdateBookStatus",
                    "namePlural": "updateBookStatuses",
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
                                        "bookTitle": "Effective Java",
                                        "ISBN": "9781234567890",
                                        "author": "Joshua Bloch",
                                        "publisher": "Pearson",
                                        "category": "ACADEMIC",
                                        "status": "AVAILABLE"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "UpdateBookStatus",
                                    "value": {
                                        "ISBN": "9781234567890",
                                        "status": "LOANED"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookStatusUpdated",
                                    "value": {
                                        "ISBN": "9781234567890",
                                        "status": "LOANED",
                                        "updatedAt": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "BookDiscarded"
                    ],
                    "aggregate": {
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "controllerInfo": {
                        "apiPath": "discardbook",
                        "method": "PUT",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
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
                    "id": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                        "style": "{}",
                        "width": 100,
                        "x": 556,
                        "y": 510,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "DiscardBook",
                    "displayName": "도서 폐기",
                    "nameCamelCase": "discardBook",
                    "namePascalCase": "DiscardBook",
                    "namePlural": "discardBooks",
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
                                        "bookTitle": "Effective Java",
                                        "ISBN": "9781234567890",
                                        "author": "Joshua Bloch",
                                        "publisher": "Pearson",
                                        "category": "ACADEMIC",
                                        "status": "AVAILABLE"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "DiscardBook",
                                    "value": {
                                        "ISBN": "9781234567890",
                                        "reason": "도서 훼손으로 인한 폐기"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "BookDiscarded",
                                    "value": {
                                        "ISBN": "9781234567890",
                                        "reason": "도서 훼손으로 인한 폐기",
                                        "discardedAt": "2024-03-20T00:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "3ebd5ba3-f273-60f6-6f05-ec3dcf15faa7": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "3ebd5ba3-f273-60f6-6f05-ec3dcf15faa7",
                    "visibility": "public",
                    "name": "BookSummary",
                    "oldName": "",
                    "displayName": "도서 목록",
                    "namePascalCase": "BookSummary",
                    "namePlural": "bookSummaries",
                    "aggregate": {
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookTitle",
                            "nameCamelCase": "bookTitle",
                            "namePascalCase": "BookTitle",
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
                        "multipleResult": true
                    },
                    "controllerInfo": {
                        "url": ""
                    },
                    "elementView": {
                        "_type": "org.uengine.modeling.model.View",
                        "id": "3ebd5ba3-f273-60f6-6f05-ec3dcf15faa7",
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
                "30d9d4a0-73a0-b9cd-866d-a44eea2099d9": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "30d9d4a0-73a0-b9cd-866d-a44eea2099d9",
                    "visibility": "public",
                    "name": "BookDetails",
                    "oldName": "",
                    "displayName": "도서 상세 정보",
                    "namePascalCase": "BookDetails",
                    "namePlural": "bookDetails",
                    "aggregate": {
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
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
                            "name": "ISBN",
                            "nameCamelCase": "isbn",
                            "namePascalCase": "Isbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookTitle",
                            "nameCamelCase": "bookTitle",
                            "namePascalCase": "BookTitle",
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
                        "id": "30d9d4a0-73a0-b9cd-866d-a44eea2099d9",
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
                "c7abb721-b2ce-bc1a-3845-a042f7156228": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": null,
                    "id": "c7abb721-b2ce-bc1a-3845-a042f7156228",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "c7abb721-b2ce-bc1a-3845-a042f7156228",
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
                "4b6bdee8-075d-de15-8e68-68b3113f2323": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": null,
                    "id": "4b6bdee8-075d-de15-8e68-68b3113f2323",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "4b6bdee8-075d-de15-8e68-68b3113f2323",
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
                "2005cddf-04b6-c03c-911d-6c8e5fc0f89d": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": null,
                    "id": "2005cddf-04b6-c03c-911d-6c8e5fc0f89d",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "2005cddf-04b6-c03c-911d-6c8e5fc0f89d",
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
                "2cd01de7-a7f0-7585-9db5-eba8c9ecc3ef": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": null,
                    "id": "2cd01de7-a7f0-7585-9db5-eba8c9ecc3ef",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "2cd01de7-a7f0-7585-9db5-eba8c9ecc3ef",
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
                "39d62eec-877e-696d-326f-dfa3b19183a4": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": null,
                    "id": "39d62eec-877e-696d-326f-dfa3b19183a4",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "39d62eec-877e-696d-326f-dfa3b19183a4",
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
                    "name": "Admin",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "6dc55780-4c7a-0f55-9d0f-1327780246df": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "6dc55780-4c7a-0f55-9d0f-1327780246df",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "6dc55780-4c7a-0f55-9d0f-1327780246df",
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
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "name",
                            "nameCamelCase": "name",
                            "namePascalCase": "Name",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "verifiedAt",
                            "nameCamelCase": "verifiedAt",
                            "namePascalCase": "VerifiedAt",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "6dc55780-4c7a-0f55-9d0f-1327780246df",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "MemberVerified",
                    "displayName": "회원 확인됨",
                    "nameCamelCase": "memberVerified",
                    "namePascalCase": "MemberVerified",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                    },
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    }
                },
                "f4e5908a-0dbb-ae34-c7c7-7f75013ec195": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "MemberVerified"
                    ],
                    "aggregate": {
                        "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "controllerInfo": {
                        "apiPath": "verifymember",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "name",
                            "nameCamelCase": "name",
                            "namePascalCase": "Name",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "name",
                            "nameCamelCase": "name",
                            "namePascalCase": "Name",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "style": "{}",
                        "width": 100,
                        "x": 1141,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "VerifyMember",
                    "displayName": "회원 검증",
                    "nameCamelCase": "verifyMember",
                    "namePascalCase": "VerifyMember",
                    "namePlural": "verifyMembers",
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
                                    "name": "Member",
                                    "value": {
                                        "memberNumber": "MEM-001",
                                        "name": "홍길동"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "VerifyMember",
                                    "value": {
                                        "memberNumber": "MEM-001",
                                        "name": "홍길동"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "MemberVerified",
                                    "value": {
                                        "memberNumber": "MEM-001",
                                        "name": "홍길동",
                                        "verifiedAt": "2024-03-20T10:00:00Z"
                                    }
                                }
                            ]
                        },
                        {
                            "given": [
                                {
                                    "type": "Aggregate",
                                    "name": "Member",
                                    "value": {
                                        "memberNumber": "MEM-001",
                                        "name": "홍길동"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "VerifyMember",
                                    "value": {
                                        "memberNumber": "MEM-001",
                                        "name": "김철수"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "MemberVerified",
                                    "value": {
                                        "memberNumber": null,
                                        "name": null,
                                        "verifiedAt": null
                                    }
                                }
                            ]
                        }
                    ]
                },
                "693ba5bb-da0f-df55-8132-687dc3e6931d": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "693ba5bb-da0f-df55-8132-687dc3e6931d",
                    "visibility": "public",
                    "name": "MemberDetails",
                    "oldName": "",
                    "displayName": "회원 상세 정보",
                    "namePascalCase": "MemberDetails",
                    "namePlural": "memberDetails",
                    "aggregate": {
                        "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
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
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "name",
                            "nameCamelCase": "name",
                            "namePascalCase": "Name",
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
                        "id": "693ba5bb-da0f-df55-8132-687dc3e6931d",
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
                "62258906-db2b-2042-fe27-7792f96c77d9": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "description": null,
                    "id": "62258906-db2b-2042-fe27-7792f96c77d9",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "62258906-db2b-2042-fe27-7792f96c77d9",
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
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "da5af8c9-1bfe-c563-4ec9-4fc406747291": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "description": null,
                    "id": "da5af8c9-1bfe-c563-4ec9-4fc406747291",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "da5af8c9-1bfe-c563-4ec9-4fc406747291",
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
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
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
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
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
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanTransactionRequested",
                    "displayName": "대출 신청 완료",
                    "nameCamelCase": "loanTransactionRequested",
                    "namePascalCase": "LoanTransactionRequested",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                    },
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    }
                },
                "4768fb26-0b6e-eb81-7125-12bff9fb94ea": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "style": "{}",
                        "width": 100,
                        "x": 1759,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanTransactionReturned",
                    "displayName": "반납 처리 완료",
                    "nameCamelCase": "loanTransactionReturned",
                    "namePascalCase": "LoanTransactionReturned",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                    },
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    }
                },
                "dff5b54f-8ed0-965a-51bf-ab578e2669f9": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "style": "{}",
                        "width": 100,
                        "x": 1759,
                        "y": 510,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
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
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanTransactionReserved",
                    "displayName": "예약 신청 완료",
                    "nameCamelCase": "loanTransactionReserved",
                    "namePascalCase": "LoanTransactionReserved",
                    "namePlural": "",
                    "relationCommandInfo": [],
                    "relationPolicyInfo": [],
                    "rotateStatus": false,
                    "selected": false,
                    "trigger": "@PostPersist",
                    "_type": "org.uengine.modeling.model.Event",
                    "aggregate": {
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                    },
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    }
                },
                "6b2db009-0ff2-6bdf-d95c-0450903fc748": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanTransactionRequested"
                    ],
                    "aggregate": {
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "controllerInfo": {
                        "apiPath": "requestloantransaction",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
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
                    "id": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                        "style": "{}",
                        "width": 100,
                        "x": 1571,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "RequestLoanTransaction",
                    "displayName": "대출 신청",
                    "nameCamelCase": "requestLoanTransaction",
                    "namePascalCase": "RequestLoanTransaction",
                    "namePlural": "requestLoanTransactions",
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
                                    "name": "Member",
                                    "value": {
                                        "memberNumber": "MEM-001",
                                        "name": "John Doe"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "RequestLoanTransaction",
                                    "value": {
                                        "memberNumber": "MEM-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": 14,
                                        "loanDate": "2024-03-20T10:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanTransactionRequested",
                                    "value": {
                                        "loanId": "LOAN-1001",
                                        "memberNumber": "MEM-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": 14,
                                        "loanDate": "2024-03-20T10:00:00Z",
                                        "transactionType": "LOAN"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "0b621b96-9230-1b0e-aae2-e72290667df6": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanTransactionReturned"
                    ],
                    "aggregate": {
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "controllerInfo": {
                        "apiPath": "processreturntransaction",
                        "method": "PUT",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                        }
                    ],
                    "description": null,
                    "id": "0b621b96-9230-1b0e-aae2-e72290667df6",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "0b621b96-9230-1b0e-aae2-e72290667df6",
                        "style": "{}",
                        "width": 100,
                        "x": 1571,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "0b621b96-9230-1b0e-aae2-e72290667df6",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ProcessReturnTransaction",
                    "displayName": "반납 처리",
                    "nameCamelCase": "processReturnTransaction",
                    "namePascalCase": "ProcessReturnTransaction",
                    "namePlural": "processReturnTransactions",
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
                                    "name": "LoanTransaction",
                                    "value": {
                                        "loanId": "LOAN-1001",
                                        "memberNumber": "MEM-001",
                                        "bookISBN": "9783161484100",
                                        "loanPeriod": 14,
                                        "loanDate": "2024-03-20T10:00:00Z",
                                        "transactionType": "LOAN",
                                        "memberId": "N/A",
                                        "bookId": "N/A"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ProcessReturnTransaction",
                                    "value": {
                                        "loanId": "LOAN-1001",
                                        "returnDate": "2024-03-25T10:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanTransactionReturned",
                                    "value": {
                                        "loanId": "LOAN-1001",
                                        "returnDate": "2024-03-25T10:00:00Z",
                                        "transactionType": "RETURN"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "b9725f5a-7ca9-26ed-4467-71cc0543b3e4": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanTransactionReserved"
                    ],
                    "aggregate": {
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "controllerInfo": {
                        "apiPath": "reserveloantransaction",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
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
                    "id": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                        "style": "{}",
                        "width": 100,
                        "x": 1571,
                        "y": 510,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ReserveLoanTransaction",
                    "displayName": "예약 신청",
                    "nameCamelCase": "reserveLoanTransaction",
                    "namePascalCase": "ReserveLoanTransaction",
                    "namePlural": "reserveLoanTransactions",
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
                                    "name": "Member",
                                    "value": {
                                        "memberNumber": "MEM-002",
                                        "name": "Jane Doe"
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ReserveLoanTransaction",
                                    "value": {
                                        "memberNumber": "MEM-002",
                                        "bookISBN": "9783161484101",
                                        "loanPeriod": 7,
                                        "loanDate": "2024-03-20T11:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanTransactionReserved",
                                    "value": {
                                        "loanId": "LOAN-1002",
                                        "memberNumber": "MEM-002",
                                        "bookISBN": "9783161484101",
                                        "loanPeriod": 7,
                                        "loanDate": "2024-03-20T11:00:00Z",
                                        "transactionType": "RESERVATION"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "39b3090f-80de-504a-2fa1-8cb61a7eecb1": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "39b3090f-80de-504a-2fa1-8cb61a7eecb1",
                    "visibility": "public",
                    "name": "LoanTransactionSummary",
                    "oldName": "",
                    "displayName": "대출/반납 거래 요약",
                    "namePascalCase": "LoanTransactionSummary",
                    "namePlural": "loanTransactionSummaries",
                    "aggregate": {
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
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
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "memberNumber",
                            "nameCamelCase": "memberNumber",
                            "namePascalCase": "MemberNumber",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": false,
                            "name": "bookISBN",
                            "nameCamelCase": "bookIsbn",
                            "namePascalCase": "BookIsbn",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "TransactionType",
                            "isCopy": false,
                            "isKey": false,
                            "name": "transactionType",
                            "nameCamelCase": "transactionType",
                            "namePascalCase": "TransactionType",
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
                        "id": "39b3090f-80de-504a-2fa1-8cb61a7eecb1",
                        "x": 1571,
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
                "173b6826-fee4-62ae-0504-0b320afeea08": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "description": null,
                    "id": "173b6826-fee4-62ae-0504-0b320afeea08",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "173b6826-fee4-62ae-0504-0b320afeea08",
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
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "41d373b8-5dda-9fd5-2845-770d280a5719": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "description": null,
                    "id": "41d373b8-5dda-9fd5-2845-770d280a5719",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "41d373b8-5dda-9fd5-2845-770d280a5719",
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
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "c2cef5ec-32fb-0ec7-b33e-90157d3430e2": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "description": null,
                    "id": "c2cef5ec-32fb-0ec7-b33e-90157d3430e2",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "c2cef5ec-32fb-0ec7-b33e-90157d3430e2",
                        "style": "{}",
                        "width": 100,
                        "x": 1490,
                        "y": 510
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "1a093d29-00d8-8a7e-8202-bbf088554a96": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "description": null,
                    "id": "1a093d29-00d8-8a7e-8202-bbf088554a96",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "1a093d29-00d8-8a7e-8202-bbf088554a96",
                        "style": "{}",
                        "width": 100,
                        "x": 1490,
                        "y": 640
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "f1374605-08f7-0d53-6a25-cdb1f4ed70e6": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                        "style": "{}",
                        "width": 100,
                        "x": 2364,
                        "y": 250,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "newDueDate",
                            "nameCamelCase": "newDueDate",
                            "namePascalCase": "NewDueDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanExtended",
                    "displayName": "대출 연장 완료",
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
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                    },
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    }
                },
                "60d12d11-f750-0be4-be28-c5022c62e0a8": {
                    "alertURL": "/static/image/symbol/alert-icon.png",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "checkAlert": true,
                    "description": null,
                    "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                    "elementView": {
                        "angle": 0,
                        "height": 116,
                        "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "style": "{}",
                        "width": 100,
                        "x": 2364,
                        "y": 380,
                        "_type": "org.uengine.modeling.model.Event"
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                        }
                    ],
                    "hexagonalView": {
                        "height": 0,
                        "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0,
                        "_type": "org.uengine.modeling.model.EventHexagonal"
                    },
                    "name": "LoanReturned",
                    "displayName": "도서 반납 완료",
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
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                    },
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    }
                },
                "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanExtended"
                    ],
                    "aggregate": {
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    },
                    "controllerInfo": {
                        "apiPath": "extendloan",
                        "method": "POST",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "Date",
                            "isCopy": false,
                            "isKey": false,
                            "name": "newDueDate",
                            "nameCamelCase": "newDueDate",
                            "namePascalCase": "NewDueDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        }
                    ],
                    "description": null,
                    "id": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                        "style": "{}",
                        "width": 100,
                        "x": 2176,
                        "y": 250,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ExtendLoan",
                    "displayName": "대출 연장 신청",
                    "nameCamelCase": "extendLoan",
                    "namePascalCase": "ExtendLoan",
                    "namePlural": "extendLoans",
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
                                    "name": "LoanRecord",
                                    "value": {
                                        "loanId": "LOAN-123",
                                        "loanDate": "2024-03-01T00:00:00Z",
                                        "dueDate": "2024-03-20T00:00:00Z",
                                        "status": "LOAN",
                                        "statusHistoryEntries": []
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ExtendLoan",
                                    "value": {
                                        "loanId": "LOAN-123",
                                        "newDueDate": "2024-04-10T00:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanExtended",
                                    "value": {
                                        "loanId": "LOAN-123",
                                        "newDueDate": "2024-04-10T00:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "7305548f-ab4a-43ae-a323-6388e3aac719": {
                    "_type": "org.uengine.modeling.model.Command",
                    "outputEvents": [
                        "LoanReturned"
                    ],
                    "aggregate": {
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                    },
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    },
                    "controllerInfo": {
                        "apiPath": "returnloan",
                        "method": "PUT",
                        "fullApiPath": ""
                    },
                    "fieldDescriptors": [
                        {
                            "className": "String",
                            "isCopy": false,
                            "isKey": true,
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                        }
                    ],
                    "description": null,
                    "id": "7305548f-ab4a-43ae-a323-6388e3aac719",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Command",
                        "height": 116,
                        "id": "7305548f-ab4a-43ae-a323-6388e3aac719",
                        "style": "{}",
                        "width": 100,
                        "x": 2176,
                        "y": 380,
                        "z-index": 999
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.CommandHexagonal",
                        "height": 0,
                        "id": "7305548f-ab4a-43ae-a323-6388e3aac719",
                        "style": "{}",
                        "width": 0,
                        "x": 0,
                        "y": 0
                    },
                    "isRestRepository": false,
                    "name": "ReturnLoan",
                    "displayName": "도서 반납 처리",
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
                                    "name": "LoanRecord",
                                    "value": {
                                        "loanId": "LOAN-789",
                                        "loanDate": "2024-03-05T00:00:00Z",
                                        "dueDate": "2024-03-25T00:00:00Z",
                                        "status": "LOAN",
                                        "statusHistoryEntries": []
                                    }
                                }
                            ],
                            "when": [
                                {
                                    "type": "Command",
                                    "name": "ReturnLoan",
                                    "value": {
                                        "loanId": "LOAN-789",
                                        "returnDate": "2024-03-25T00:00:00Z"
                                    }
                                }
                            ],
                            "then": [
                                {
                                    "type": "Event",
                                    "name": "LoanReturned",
                                    "value": {
                                        "loanId": "LOAN-789",
                                        "returnDate": "2024-03-25T00:00:00Z"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "49d67ea0-c41b-5910-5f9d-9f15af4b5a0d": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "49d67ea0-c41b-5910-5f9d-9f15af4b5a0d",
                    "visibility": "public",
                    "name": "LoanRecordSummary",
                    "oldName": "",
                    "displayName": "대출 현황 요약",
                    "namePascalCase": "LoanRecordSummary",
                    "namePlural": "loanRecordSummaries",
                    "aggregate": {
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
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
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                            "name": "dueDate",
                            "nameCamelCase": "dueDate",
                            "namePascalCase": "DueDate",
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
                        "id": "49d67ea0-c41b-5910-5f9d-9f15af4b5a0d",
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
                    "definitionId": ""
                },
                "ef4ee2ac-62ef-5675-1c02-729fec2ff183": {
                    "_type": "org.uengine.modeling.model.View",
                    "id": "ef4ee2ac-62ef-5675-1c02-729fec2ff183",
                    "visibility": "public",
                    "name": "LoanRecordDetails",
                    "oldName": "",
                    "displayName": "대출 상세 내역",
                    "namePascalCase": "LoanRecordDetails",
                    "namePlural": "loanRecordDetails",
                    "aggregate": {
                        "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                    },
                    "description": null,
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
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
                            "name": "loanId",
                            "nameCamelCase": "loanId",
                            "namePascalCase": "LoanId",
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
                            "name": "dueDate",
                            "nameCamelCase": "dueDate",
                            "namePascalCase": "DueDate",
                            "displayName": "",
                            "_type": "org.uengine.model.FieldDescriptor"
                        },
                        {
                            "className": "List<StatusHistoryEntry>",
                            "isCopy": false,
                            "isKey": false,
                            "name": "statusHistoryEntries",
                            "nameCamelCase": "statusHistoryEntries",
                            "namePascalCase": "StatusHistoryEntries",
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
                        "id": "ef4ee2ac-62ef-5675-1c02-729fec2ff183",
                        "x": 2176,
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
                "6c41e539-cc50-137d-dd70-a2ae80847258": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    },
                    "description": null,
                    "id": "6c41e539-cc50-137d-dd70-a2ae80847258",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "6c41e539-cc50-137d-dd70-a2ae80847258",
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
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "7e0539db-30a6-b959-0317-45508b809ba3": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    },
                    "description": null,
                    "id": "7e0539db-30a6-b959-0317-45508b809ba3",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "7e0539db-30a6-b959-0317-45508b809ba3",
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
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "3443ef32-b12c-47a5-7e39-38e126b51e66": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    },
                    "description": null,
                    "id": "3443ef32-b12c-47a5-7e39-38e126b51e66",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "3443ef32-b12c-47a5-7e39-38e126b51e66",
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
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "71f330da-f0b0-d173-ef18-d6f1608cb90f": {
                    "_type": "org.uengine.modeling.model.Actor",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                    },
                    "description": null,
                    "id": "71f330da-f0b0-d173-ef18-d6f1608cb90f",
                    "elementView": {
                        "_type": "org.uengine.modeling.model.Actor",
                        "height": 100,
                        "id": "71f330da-f0b0-d173-ef18-d6f1608cb90f",
                        "style": "{}",
                        "width": 100,
                        "x": 2095,
                        "y": 640
                    },
                    "innerAggregate": {
                        "command": [],
                        "event": [],
                        "external": [],
                        "policy": [],
                        "view": []
                    },
                    "name": "Member",
                    "oldName": "",
                    "rotateStatus": false,
                    "displayName": ""
                },
                "6a6bfb62-6203-efff-05d9-c22b6f5127ef": {
                    "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": "대출 요청 이벤트가 발생하면 도서의 상태를 '대출중'으로 변경하여 대출 진행 상황을 명확하게 관리할 수 있도록 합니다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 437,
                        "y": 380,
                        "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "LoanRequestedStatusUpdatePolicy",
                    "displayName": "대출 요청 상태 업데이트",
                    "nameCamelCase": "loanRequestedStatusUpdatePolicy",
                    "namePascalCase": "LoanRequestedStatusUpdatePolicy",
                    "namePlural": "loanRequestedStatusUpdatePolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "7a8a0928-e19a-3665-cc61-db6e54a1c71d": {
                    "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": "대출 반납 이벤트가 발생하면 도서의 상태를 '대출가능'으로 변경하여 재대출을 원활하게 지원합니다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 437,
                        "y": 380,
                        "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "LoanReturnedStatusUpdatePolicy",
                    "displayName": "대출 반납 상태 업데이트",
                    "nameCamelCase": "loanReturnedStatusUpdatePolicy",
                    "namePascalCase": "LoanReturnedStatusUpdatePolicy",
                    "namePlural": "loanReturnedStatusUpdatePolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "29acc474-2b61-b75f-ee27-ff64cb52fcfd": {
                    "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": "대출 예약 이벤트가 발생하면 도서의 상태를 '예약중'으로 변경하여 예약된 도서의 관리를 체계적으로 수행할 수 있도록 합니다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 437,
                        "y": 380,
                        "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "LoanReservedStatusUpdatePolicy",
                    "displayName": "예약 상태 업데이트",
                    "nameCamelCase": "loanReservedStatusUpdatePolicy",
                    "namePascalCase": "LoanReservedStatusUpdatePolicy",
                    "namePlural": "loanReservedStatusUpdatePolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "f0761bea-4355-5d9e-875c-7d82405f0069": {
                    "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                    },
                    "description": "대출 신청 이벤트 발생 시 회원 번호와 이름을 통해 자동으로 회원 검증을 수행하여, 올바른 회원 정보 확인과 대출 프로세스의 신뢰성을 보장하기 위함",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 1022,
                        "y": 250,
                        "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "VerifyMemberOnLoanRequestPolicy",
                    "displayName": "대출 신청 시 회원 검증",
                    "nameCamelCase": "verifyMemberOnLoanRequestPolicy",
                    "namePascalCase": "VerifyMemberOnLoanRequestPolicy",
                    "namePlural": "verifyMemberOnLoanRequestPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                },
                "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20": {
                    "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                    "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                    "boundedContext": {
                        "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                    },
                    "description": "LoanRecord 컨텍스트에서 발생하는 'evt-loanReturned' 이벤트에 따라 BookManagement 컨텍스트의 'cmd-updateBookStatus' 커맨드를 실행하여, 대출 반납 후 예약자 존재 여부에 따라 도서 상태를 '대출가능' 또는 '예약중'으로 자동 갱신하기 위함이다.",
                    "elementView": {
                        "height": 116,
                        "width": 100,
                        "x": 437,
                        "y": 380,
                        "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "style": "{}",
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "fieldDescriptors": [],
                    "hexagonalView": {
                        "height": 20,
                        "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "style": "{}",
                        "subWidth": 100,
                        "width": 20,
                        "_type": "org.uengine.modeling.model.PolicyHexagonal"
                    },
                    "isSaga": false,
                    "name": "BookReturnStatusSyncPolicy",
                    "displayName": "도서 반납 상태 동기화",
                    "nameCamelCase": "bookReturnStatusSyncPolicy",
                    "namePascalCase": "BookReturnStatusSyncPolicy",
                    "namePlural": "bookReturnStatusSyncPolicies",
                    "oldName": "",
                    "rotateStatus": false,
                    "_type": "org.uengine.modeling.model.Policy"
                }
            },
            "relations": {
                "47eb2b32-246a-4bfd-a3fd-801f470ffa14": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "47eb2b32-246a-4bfd-a3fd-801f470ffa14",
                    "sourceElement": {
                        "aggregateRoot": {
                            "_type": "org.uengine.modeling.model.AggregateRoot",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
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
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "memberNumber",
                                    "nameCamelCase": "memberNumber",
                                    "namePascalCase": "MemberNumber",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "bookISBN",
                                    "nameCamelCase": "bookIsbn",
                                    "namePascalCase": "BookIsbn",
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
                                    "className": "TransactionType",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "transactionType",
                                    "nameCamelCase": "transactionType",
                                    "namePascalCase": "TransactionType",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "55284910-50ba-6af2-5524-1b9e93315a1a": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "55284910-50ba-6af2-5524-1b9e93315a1a",
                                        "name": "LoanTransaction",
                                        "namePascalCase": "LoanTransaction",
                                        "nameCamelCase": "loanTransaction",
                                        "namePlural": "LoanTransactions",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
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
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "memberNumber",
                                                "displayName": "",
                                                "nameCamelCase": "memberNumber",
                                                "namePascalCase": "MemberNumber",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookISBN",
                                                "displayName": "",
                                                "nameCamelCase": "bookIsbn",
                                                "namePascalCase": "BookIsbn",
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
                                                "className": "TransactionType",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "transactionType",
                                                "displayName": "",
                                                "nameCamelCase": "transactionType",
                                                "namePascalCase": "TransactionType",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "55284910-50ba-6af2-5524-1b9e93315a1a",
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
                                        "parentId": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                                    },
                                    "bf0d4808-e955-f452-b22b-867e0bd2ead3": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "bf0d4808-e955-f452-b22b-867e0bd2ead3",
                                        "name": "TransactionType",
                                        "displayName": "거래 유형",
                                        "nameCamelCase": "transactionType",
                                        "namePascalCase": "TransactionType",
                                        "namePlural": "transactionTypes",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "bf0d4808-e955-f452-b22b-867e0bd2ead3",
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
                                                "value": "LOAN"
                                            },
                                            {
                                                "value": "RETURN"
                                            },
                                            {
                                                "value": "RESERVATION"
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
                            "name": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "commands": [],
                        "description": null,
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                            "x": 1665,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "LoanTransaction",
                        "displayName": "대출/반납 거래",
                        "nameCamelCase": "loanTransaction",
                        "namePascalCase": "LoanTransaction",
                        "namePlural": "loanTransactions",
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
                                    "name": "memberNumber",
                                    "nameCamelCase": "memberNumber",
                                    "namePascalCase": "MemberNumber",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "name",
                                    "nameCamelCase": "name",
                                    "namePascalCase": "Name",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "87ea8195-d741-4e72-bd76-4f3b2f31f67e": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "87ea8195-d741-4e72-bd76-4f3b2f31f67e",
                                        "name": "Member",
                                        "namePascalCase": "Member",
                                        "nameCamelCase": "member",
                                        "namePlural": "Members",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": true,
                                                "name": "memberNumber",
                                                "displayName": "",
                                                "nameCamelCase": "memberNumber",
                                                "namePascalCase": "MemberNumber",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "name",
                                                "displayName": "",
                                                "nameCamelCase": "name",
                                                "namePascalCase": "Name",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "87ea8195-d741-4e72-bd76-4f3b2f31f67e",
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
                                        "parentId": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                                    }
                                },
                                "relations": {}
                            },
                            "operations": []
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "name": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "commands": [],
                        "description": null,
                        "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                            "x": 1235,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "Member",
                        "displayName": "회원 정보",
                        "nameCamelCase": "member",
                        "namePascalCase": "Member",
                        "namePlural": "members",
                        "rotateStatus": false,
                        "selected": false,
                        "_type": "org.uengine.modeling.model.Aggregate"
                    },
                    "from": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                    "to": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                    "relationView": {
                        "id": "47eb2b32-246a-4bfd-a3fd-801f470ffa14",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "to": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                        "needReconnect": true,
                        "value": "[[1600,456],[1300,456]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "id": "47eb2b32-246a-4bfd-a3fd-801f470ffa14",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "650bc96a-a8fa-c501-0bf0-baa26c4b3d48": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "650bc96a-a8fa-c501-0bf0-baa26c4b3d48",
                    "sourceElement": {
                        "aggregateRoot": {
                            "_type": "org.uengine.modeling.model.AggregateRoot",
                            "fieldDescriptors": [
                                {
                                    "className": "String",
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
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "memberNumber",
                                    "nameCamelCase": "memberNumber",
                                    "namePascalCase": "MemberNumber",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "bookISBN",
                                    "nameCamelCase": "bookIsbn",
                                    "namePascalCase": "BookIsbn",
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
                                    "className": "TransactionType",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "transactionType",
                                    "nameCamelCase": "transactionType",
                                    "namePascalCase": "TransactionType",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "MemberId",
                                    "isCopy": false,
                                    "isKey": false,
                                    "name": "memberId",
                                    "nameCamelCase": "memberId",
                                    "namePascalCase": "MemberId",
                                    "displayName": "",
                                    "referenceClass": "Member",
                                    "isOverrideField": true,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                }
                            ],
                            "entities": {
                                "elements": {
                                    "55284910-50ba-6af2-5524-1b9e93315a1a": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "55284910-50ba-6af2-5524-1b9e93315a1a",
                                        "name": "LoanTransaction",
                                        "namePascalCase": "LoanTransaction",
                                        "nameCamelCase": "loanTransaction",
                                        "namePlural": "LoanTransactions",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
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
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "memberNumber",
                                                "displayName": "",
                                                "nameCamelCase": "memberNumber",
                                                "namePascalCase": "MemberNumber",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookISBN",
                                                "displayName": "",
                                                "nameCamelCase": "bookIsbn",
                                                "namePascalCase": "BookIsbn",
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
                                                "className": "TransactionType",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "transactionType",
                                                "displayName": "",
                                                "nameCamelCase": "transactionType",
                                                "namePascalCase": "TransactionType",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "MemberId",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "memberId",
                                                "nameCamelCase": "memberId",
                                                "namePascalCase": "MemberId",
                                                "displayName": "",
                                                "referenceClass": "Member",
                                                "isOverrideField": true,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.Class",
                                            "id": "55284910-50ba-6af2-5524-1b9e93315a1a",
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
                                        "parentId": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                                    },
                                    "bf0d4808-e955-f452-b22b-867e0bd2ead3": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "bf0d4808-e955-f452-b22b-867e0bd2ead3",
                                        "name": "TransactionType",
                                        "displayName": "거래 유형",
                                        "nameCamelCase": "transactionType",
                                        "namePascalCase": "TransactionType",
                                        "namePlural": "transactionTypes",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "bf0d4808-e955-f452-b22b-867e0bd2ead3",
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
                                                "value": "LOAN"
                                            },
                                            {
                                                "value": "RETURN"
                                            },
                                            {
                                                "value": "RESERVATION"
                                            }
                                        ],
                                        "useKeyValue": false,
                                        "relations": []
                                    },
                                    "79e984f9-bfad-ba2f-9166-141d4143a573": {
                                        "_type": "org.uengine.uml.model.vo.Class",
                                        "id": "79e984f9-bfad-ba2f-9166-141d4143a573",
                                        "name": "MemberId",
                                        "displayName": "",
                                        "namePascalCase": "MemberId",
                                        "nameCamelCase": "memberId",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isKey": true,
                                                "label": "- memberNumber: String",
                                                "name": "memberNumber",
                                                "nameCamelCase": "memberNumber",
                                                "namePascalCase": "MemberNumber",
                                                "displayName": "",
                                                "referenceClass": "Member",
                                                "isOverrideField": true,
                                                "_type": "org.uengine.model.FieldDescriptor"
                                            }
                                        ],
                                        "operations": [],
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.vo.address.Class",
                                            "id": "79e984f9-bfad-ba2f-9166-141d4143a573",
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
                                        "namePlural": "MemberIds",
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
                            "name": "d66e3a59-c465-2491-7f7a-0fa741087a1f",
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "commands": [],
                        "description": null,
                        "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                            "x": 1665,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                            "x": 0,
                            "y": 0,
                            "subWidth": 0,
                            "width": 0
                        },
                        "name": "LoanTransaction",
                        "displayName": "대출/반납 거래",
                        "nameCamelCase": "loanTransaction",
                        "namePascalCase": "LoanTransaction",
                        "namePlural": "loanTransactions",
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
                                    "isKey": false,
                                    "name": "bookTitle",
                                    "nameCamelCase": "bookTitle",
                                    "namePascalCase": "BookTitle",
                                    "displayName": "",
                                    "referenceClass": null,
                                    "isOverrideField": false,
                                    "_type": "org.uengine.model.FieldDescriptor"
                                },
                                {
                                    "className": "String",
                                    "isCopy": false,
                                    "isKey": true,
                                    "name": "ISBN",
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
                                    "e3e9e36a-da65-f83b-75a1-777f595b530c": {
                                        "_type": "org.uengine.uml.model.Class",
                                        "id": "e3e9e36a-da65-f83b-75a1-777f595b530c",
                                        "name": "Book",
                                        "namePascalCase": "Book",
                                        "nameCamelCase": "book",
                                        "namePlural": "Books",
                                        "fieldDescriptors": [
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": false,
                                                "name": "bookTitle",
                                                "displayName": "",
                                                "nameCamelCase": "bookTitle",
                                                "namePascalCase": "BookTitle",
                                                "_type": "org.uengine.model.FieldDescriptor",
                                                "inputUI": null,
                                                "options": null
                                            },
                                            {
                                                "className": "String",
                                                "isCopy": false,
                                                "isKey": true,
                                                "name": "ISBN",
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
                                            "id": "e3e9e36a-da65-f83b-75a1-777f595b530c",
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
                                        "parentId": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                                    },
                                    "cb8b10c8-0b32-3b0c-000d-b9191a7134a0": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "cb8b10c8-0b32-3b0c-000d-b9191a7134a0",
                                        "name": "Category",
                                        "displayName": "카테고리",
                                        "nameCamelCase": "category",
                                        "namePascalCase": "Category",
                                        "namePlural": "categories",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "cb8b10c8-0b32-3b0c-000d-b9191a7134a0",
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
                                                "value": "FICTION"
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
                                    "46d0da65-7132-881a-30d0-7d3bd2afd894": {
                                        "_type": "org.uengine.uml.model.enum",
                                        "id": "46d0da65-7132-881a-30d0-7d3bd2afd894",
                                        "name": "Status",
                                        "displayName": "도서상태",
                                        "nameCamelCase": "status",
                                        "namePascalCase": "Status",
                                        "namePlural": "statuses",
                                        "elementView": {
                                            "_type": "org.uengine.uml.model.enum",
                                            "id": "46d0da65-7132-881a-30d0-7d3bd2afd894",
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
                                                "value": "LOANED"
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
                            "name": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf",
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "commands": [],
                        "description": null,
                        "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Aggregate",
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
                            "x": 650,
                            "y": 450,
                            "width": 130,
                            "height": 400
                        },
                        "events": [],
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.AggregateHexagonal",
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
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
                    "from": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                    "to": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
                    "relationView": {
                        "id": "650bc96a-a8fa-c501-0bf0-baa26c4b3d48",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "to": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
                        "needReconnect": true,
                        "value": "[[1600,456],[1156,456],[1156,524],[715,524]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "dedaa92f-b958-0d49-7b17-0c7310142fd5",
                        "id": "650bc96a-a8fa-c501-0bf0-baa26c4b3d48",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "5e3aa600-ef91-81e1-b591-b701b4cd83db",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "80606aac-860a-18e8-896a-3f2af96a5e03": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "80606aac-860a-18e8-896a-3f2af96a5e03",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookCreated"
                        ],
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "controllerInfo": {
                            "apiPath": "createbook",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookTitle",
                                "nameCamelCase": "bookTitle",
                                "namePascalCase": "BookTitle",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
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
                        "id": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
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
                        "id": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
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
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookTitle",
                                "nameCamelCase": "bookTitle",
                                "namePascalCase": "BookTitle",
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
                            "id": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BookCreated",
                        "displayName": "도서 등록 완료",
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
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        }
                    },
                    "from": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
                    "to": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
                    "relationView": {
                        "id": "80606aac-860a-18e8-896a-3f2af96a5e03",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
                        "to": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
                        "needReconnect": true,
                        "value": "[[606,252],[694,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "7814ac5e-2740-19e0-26eb-95ad1494ad78",
                        "id": "80606aac-860a-18e8-896a-3f2af96a5e03",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "f8f2ae1b-a105-ca1f-4551-4fe0315f4ccb",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "8e8c7898-c4c8-a287-f912-efeec87b1696": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "8e8c7898-c4c8-a287-f912-efeec87b1696",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                        "description": null,
                        "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
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
                        "id": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
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
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "updatedAt",
                                "nameCamelCase": "updatedAt",
                                "namePascalCase": "UpdatedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BookStatusUpdated",
                        "displayName": "도서 상태 수정 완료",
                        "nameCamelCase": "bookStatusUpdated",
                        "namePascalCase": "BookStatusUpdated",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        }
                    },
                    "from": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                    "to": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
                    "relationView": {
                        "id": "8e8c7898-c4c8-a287-f912-efeec87b1696",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "to": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
                        "needReconnect": true,
                        "value": "[[606,380],[694,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "id": "8e8c7898-c4c8-a287-f912-efeec87b1696",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "b2e1fa77-1c83-16fb-fece-13a61f2d2f3a",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "99957c52-c12d-6662-c5dc-890a0b7b372b": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "99957c52-c12d-6662-c5dc-890a0b7b372b",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookDiscarded"
                        ],
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "controllerInfo": {
                            "apiPath": "discardbook",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                        "id": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 510,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "DiscardBook",
                        "displayName": "도서 폐기",
                        "nameCamelCase": "discardBook",
                        "namePascalCase": "DiscardBook",
                        "namePlural": "discardBooks",
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
                        "id": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
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
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "discardedAt",
                                "nameCamelCase": "discardedAt",
                                "namePascalCase": "DiscardedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "BookDiscarded",
                        "displayName": "도서 폐기 완료",
                        "nameCamelCase": "bookDiscarded",
                        "namePascalCase": "BookDiscarded",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        }
                    },
                    "from": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                    "to": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
                    "relationView": {
                        "id": "99957c52-c12d-6662-c5dc-890a0b7b372b",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                        "to": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
                        "needReconnect": true,
                        "value": "[[606,512],[694,512]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "9be9cdfb-05fc-78c0-ed2a-f7b4cd28e067",
                        "id": "99957c52-c12d-6662-c5dc-890a0b7b372b",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "f00ee07d-91fc-394c-608e-eb4258cc8dc5",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "52d84f4e-7689-1f89-b8bb-0342bc1f7b87": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "52d84f4e-7689-1f89-b8bb-0342bc1f7b87",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "MemberVerified"
                        ],
                        "aggregate": {
                            "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "controllerInfo": {
                            "apiPath": "verifymember",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "name",
                                "nameCamelCase": "name",
                                "namePascalCase": "Name",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "name",
                                "nameCamelCase": "name",
                                "namePascalCase": "Name",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "VerifyMember",
                        "displayName": "회원 검증",
                        "nameCamelCase": "verifyMember",
                        "namePascalCase": "VerifyMember",
                        "namePlural": "verifyMembers",
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
                        "id": "6dc55780-4c7a-0f55-9d0f-1327780246df",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "6dc55780-4c7a-0f55-9d0f-1327780246df",
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
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "name",
                                "nameCamelCase": "name",
                                "namePascalCase": "Name",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "verifiedAt",
                                "nameCamelCase": "verifiedAt",
                                "namePascalCase": "VerifiedAt",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "6dc55780-4c7a-0f55-9d0f-1327780246df",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "MemberVerified",
                        "displayName": "회원 확인됨",
                        "nameCamelCase": "memberVerified",
                        "namePascalCase": "MemberVerified",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "from": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                    "to": "6dc55780-4c7a-0f55-9d0f-1327780246df",
                    "relationView": {
                        "id": "52d84f4e-7689-1f89-b8bb-0342bc1f7b87",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "to": "6dc55780-4c7a-0f55-9d0f-1327780246df",
                        "needReconnect": true,
                        "value": "[[1191,252],[1279,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "id": "52d84f4e-7689-1f89-b8bb-0342bc1f7b87",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "6dc55780-4c7a-0f55-9d0f-1327780246df",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "eb6ea6fd-63c3-e9db-d1d5-38ecc578d9c7": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "eb6ea6fd-63c3-e9db-d1d5-38ecc578d9c7",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanTransactionRequested"
                        ],
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "controllerInfo": {
                            "apiPath": "requestloantransaction",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                        "id": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                            "style": "{}",
                            "width": 100,
                            "x": 1571,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "RequestLoanTransaction",
                        "displayName": "대출 신청",
                        "nameCamelCase": "requestLoanTransaction",
                        "namePascalCase": "RequestLoanTransaction",
                        "namePlural": "requestLoanTransactions",
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
                        "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
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
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionRequested",
                        "displayName": "대출 신청 완료",
                        "nameCamelCase": "loanTransactionRequested",
                        "namePascalCase": "LoanTransactionRequested",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "from": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                    "to": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                    "relationView": {
                        "id": "eb6ea6fd-63c3-e9db-d1d5-38ecc578d9c7",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                        "to": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "needReconnect": true,
                        "value": "[[1621,252],[1709,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "6b2db009-0ff2-6bdf-d95c-0450903fc748",
                        "id": "eb6ea6fd-63c3-e9db-d1d5-38ecc578d9c7",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "5f8bba4d-6ab3-2069-84b4-e149c8baa491": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "5f8bba4d-6ab3-2069-84b4-e149c8baa491",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanTransactionReturned"
                        ],
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "controllerInfo": {
                            "apiPath": "processreturntransaction",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                            }
                        ],
                        "description": null,
                        "id": "0b621b96-9230-1b0e-aae2-e72290667df6",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "0b621b96-9230-1b0e-aae2-e72290667df6",
                            "style": "{}",
                            "width": 100,
                            "x": 1571,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "0b621b96-9230-1b0e-aae2-e72290667df6",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ProcessReturnTransaction",
                        "displayName": "반납 처리",
                        "nameCamelCase": "processReturnTransaction",
                        "namePascalCase": "ProcessReturnTransaction",
                        "namePlural": "processReturnTransactions",
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
                        "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                            "style": "{}",
                            "width": 100,
                            "x": 1759,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionReturned",
                        "displayName": "반납 처리 완료",
                        "nameCamelCase": "loanTransactionReturned",
                        "namePascalCase": "LoanTransactionReturned",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "from": "0b621b96-9230-1b0e-aae2-e72290667df6",
                    "to": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                    "relationView": {
                        "id": "5f8bba4d-6ab3-2069-84b4-e149c8baa491",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "0b621b96-9230-1b0e-aae2-e72290667df6",
                        "to": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "needReconnect": true,
                        "value": "[[1621,380],[1709,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "0b621b96-9230-1b0e-aae2-e72290667df6",
                        "id": "5f8bba4d-6ab3-2069-84b4-e149c8baa491",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "764231ef-6db4-2a52-04bd-24441434cb36": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "764231ef-6db4-2a52-04bd-24441434cb36",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanTransactionReserved"
                        ],
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "controllerInfo": {
                            "apiPath": "reserveloantransaction",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                        "id": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                            "style": "{}",
                            "width": 100,
                            "x": 1571,
                            "y": 510,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ReserveLoanTransaction",
                        "displayName": "예약 신청",
                        "nameCamelCase": "reserveLoanTransaction",
                        "namePascalCase": "ReserveLoanTransaction",
                        "namePlural": "reserveLoanTransactions",
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
                        "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                            "style": "{}",
                            "width": 100,
                            "x": 1759,
                            "y": 510,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionReserved",
                        "displayName": "예약 신청 완료",
                        "nameCamelCase": "loanTransactionReserved",
                        "namePascalCase": "LoanTransactionReserved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "from": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                    "to": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                    "relationView": {
                        "id": "764231ef-6db4-2a52-04bd-24441434cb36",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                        "to": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "needReconnect": true,
                        "value": "[[1621,512],[1709,512]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "b9725f5a-7ca9-26ed-4467-71cc0543b3e4",
                        "id": "764231ef-6db4-2a52-04bd-24441434cb36",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "760fa483-da00-613a-e9d0-6eaf7fada18d": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "760fa483-da00-613a-e9d0-6eaf7fada18d",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanExtended"
                        ],
                        "aggregate": {
                            "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                        },
                        "controllerInfo": {
                            "apiPath": "extendloan",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "newDueDate",
                                "nameCamelCase": "newDueDate",
                                "namePascalCase": "NewDueDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                            "style": "{}",
                            "width": 100,
                            "x": 2176,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ExtendLoan",
                        "displayName": "대출 연장 신청",
                        "nameCamelCase": "extendLoan",
                        "namePascalCase": "ExtendLoan",
                        "namePlural": "extendLoans",
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
                        "id": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                            "style": "{}",
                            "width": 100,
                            "x": 2364,
                            "y": 250,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "Date",
                                "isCopy": false,
                                "isKey": false,
                                "name": "newDueDate",
                                "nameCamelCase": "newDueDate",
                                "namePascalCase": "NewDueDate",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanExtended",
                        "displayName": "대출 연장 완료",
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
                            "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                        },
                        "boundedContext": {
                            "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                        }
                    },
                    "from": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                    "to": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                    "relationView": {
                        "id": "760fa483-da00-613a-e9d0-6eaf7fada18d",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                        "to": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                        "needReconnect": true,
                        "value": "[[2226,252],[2314,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "d74e534c-f5d5-d5d5-c4fb-0f6a3a73dffc",
                        "id": "760fa483-da00-613a-e9d0-6eaf7fada18d",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "f1374605-08f7-0d53-6a25-cdb1f4ed70e6",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "1d370f11-dab6-3b2f-ab32-a4c8e2f40d44": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "1d370f11-dab6-3b2f-ab32-a4c8e2f40d44",
                    "sourceElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "LoanReturned"
                        ],
                        "aggregate": {
                            "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                        },
                        "controllerInfo": {
                            "apiPath": "returnloan",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                            }
                        ],
                        "description": null,
                        "id": "7305548f-ab4a-43ae-a323-6388e3aac719",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "7305548f-ab4a-43ae-a323-6388e3aac719",
                            "style": "{}",
                            "width": 100,
                            "x": 2176,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "7305548f-ab4a-43ae-a323-6388e3aac719",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "ReturnLoan",
                        "displayName": "도서 반납 처리",
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
                        "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                            "style": "{}",
                            "width": 100,
                            "x": 2364,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanReturned",
                        "displayName": "도서 반납 완료",
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
                            "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                        },
                        "boundedContext": {
                            "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                        }
                    },
                    "from": "7305548f-ab4a-43ae-a323-6388e3aac719",
                    "to": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                    "relationView": {
                        "id": "1d370f11-dab6-3b2f-ab32-a4c8e2f40d44",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "7305548f-ab4a-43ae-a323-6388e3aac719",
                        "to": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "needReconnect": true,
                        "value": "[[2226,380],[2314,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "7305548f-ab4a-43ae-a323-6388e3aac719",
                        "id": "1d370f11-dab6-3b2f-ab32-a4c8e2f40d44",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "1cad52d6-f564-aea2-a27a-d0d1e0d89358": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "1cad52d6-f564-aea2-a27a-d0d1e0d89358",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
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
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionRequested",
                        "displayName": "대출 신청 완료",
                        "nameCamelCase": "loanTransactionRequested",
                        "namePascalCase": "LoanTransactionRequested",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "targetElement": {
                        "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "대출 요청 이벤트가 발생하면 도서의 상태를 '대출중'으로 변경하여 대출 진행 상황을 명확하게 관리할 수 있도록 합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanRequestedStatusUpdatePolicy",
                        "displayName": "대출 요청 상태 업데이트",
                        "nameCamelCase": "loanRequestedStatusUpdatePolicy",
                        "namePascalCase": "LoanRequestedStatusUpdatePolicy",
                        "namePlural": "loanRequestedStatusUpdatePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                    "to": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                    "relationView": {
                        "id": "1cad52d6-f564-aea2-a27a-d0d1e0d89358",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "to": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "needReconnect": true,
                        "value": "[[1709,252],[1100,252],[1100,380],[487,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "id": "1cad52d6-f564-aea2-a27a-d0d1e0d89358",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "8af811de-506d-f208-b90f-b8be96ee8245": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "8af811de-506d-f208-b90f-b8be96ee8245",
                    "sourceElement": {
                        "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "대출 요청 이벤트가 발생하면 도서의 상태를 '대출중'으로 변경하여 대출 진행 상황을 명확하게 관리할 수 있도록 합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanRequestedStatusUpdatePolicy",
                        "displayName": "대출 요청 상태 업데이트",
                        "nameCamelCase": "loanRequestedStatusUpdatePolicy",
                        "namePascalCase": "LoanRequestedStatusUpdatePolicy",
                        "namePlural": "loanRequestedStatusUpdatePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                        "description": null,
                        "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "PUT"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                    "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                    "relationView": {
                        "id": "8af811de-506d-f208-b90f-b8be96ee8245",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "needReconnect": true,
                        "value": "[[487,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "6a6bfb62-6203-efff-05d9-c22b6f5127ef",
                        "id": "8af811de-506d-f208-b90f-b8be96ee8245",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "d3ee5efd-05bb-70ad-d3d5-d2af3b5cfbf1": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "d3ee5efd-05bb-70ad-d3d5-d2af3b5cfbf1",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                            "style": "{}",
                            "width": 100,
                            "x": 1759,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionReturned",
                        "displayName": "반납 처리 완료",
                        "nameCamelCase": "loanTransactionReturned",
                        "namePascalCase": "LoanTransactionReturned",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "targetElement": {
                        "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "대출 반납 이벤트가 발생하면 도서의 상태를 '대출가능'으로 변경하여 재대출을 원활하게 지원합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanReturnedStatusUpdatePolicy",
                        "displayName": "대출 반납 상태 업데이트",
                        "nameCamelCase": "loanReturnedStatusUpdatePolicy",
                        "namePascalCase": "LoanReturnedStatusUpdatePolicy",
                        "namePlural": "loanReturnedStatusUpdatePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                    "to": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                    "relationView": {
                        "id": "d3ee5efd-05bb-70ad-d3d5-d2af3b5cfbf1",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "to": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "needReconnect": true,
                        "value": "[[1709,380],[487,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "4768fb26-0b6e-eb81-7125-12bff9fb94ea",
                        "id": "d3ee5efd-05bb-70ad-d3d5-d2af3b5cfbf1",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "7b593613-1c24-3b02-f83b-72b625254572": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "7b593613-1c24-3b02-f83b-72b625254572",
                    "sourceElement": {
                        "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "대출 반납 이벤트가 발생하면 도서의 상태를 '대출가능'으로 변경하여 재대출을 원활하게 지원합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanReturnedStatusUpdatePolicy",
                        "displayName": "대출 반납 상태 업데이트",
                        "nameCamelCase": "loanReturnedStatusUpdatePolicy",
                        "namePascalCase": "LoanReturnedStatusUpdatePolicy",
                        "namePlural": "loanReturnedStatusUpdatePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                        "description": null,
                        "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "PUT"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                    "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                    "relationView": {
                        "id": "7b593613-1c24-3b02-f83b-72b625254572",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "needReconnect": true,
                        "value": "[[487,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "7a8a0928-e19a-3665-cc61-db6e54a1c71d",
                        "id": "7b593613-1c24-3b02-f83b-72b625254572",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "acd1b7f2-37c8-bd80-1ddd-895528feef85": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "acd1b7f2-37c8-bd80-1ddd-895528feef85",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                            "style": "{}",
                            "width": 100,
                            "x": 1759,
                            "y": 510,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionReserved",
                        "displayName": "예약 신청 완료",
                        "nameCamelCase": "loanTransactionReserved",
                        "namePascalCase": "LoanTransactionReserved",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "targetElement": {
                        "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "대출 예약 이벤트가 발생하면 도서의 상태를 '예약중'으로 변경하여 예약된 도서의 관리를 체계적으로 수행할 수 있도록 합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanReservedStatusUpdatePolicy",
                        "displayName": "예약 상태 업데이트",
                        "nameCamelCase": "loanReservedStatusUpdatePolicy",
                        "namePascalCase": "LoanReservedStatusUpdatePolicy",
                        "namePlural": "loanReservedStatusUpdatePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                    "to": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                    "relationView": {
                        "id": "acd1b7f2-37c8-bd80-1ddd-895528feef85",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "to": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "needReconnect": true,
                        "value": "[[1709,512],[1100,512],[1100,380],[487,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "dff5b54f-8ed0-965a-51bf-ab578e2669f9",
                        "id": "acd1b7f2-37c8-bd80-1ddd-895528feef85",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "2e2ddf63-35fd-10a2-3e21-4b1393cd57f2": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "2e2ddf63-35fd-10a2-3e21-4b1393cd57f2",
                    "sourceElement": {
                        "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "대출 예약 이벤트가 발생하면 도서의 상태를 '예약중'으로 변경하여 예약된 도서의 관리를 체계적으로 수행할 수 있도록 합니다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "LoanReservedStatusUpdatePolicy",
                        "displayName": "예약 상태 업데이트",
                        "nameCamelCase": "loanReservedStatusUpdatePolicy",
                        "namePascalCase": "LoanReservedStatusUpdatePolicy",
                        "namePlural": "loanReservedStatusUpdatePolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                        "description": null,
                        "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "PUT"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                    "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                    "relationView": {
                        "id": "2e2ddf63-35fd-10a2-3e21-4b1393cd57f2",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "needReconnect": true,
                        "value": "[[487,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "29acc474-2b61-b75f-ee27-ff64cb52fcfd",
                        "id": "2e2ddf63-35fd-10a2-3e21-4b1393cd57f2",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "4e718bfd-814e-4837-75b4-3fe15f5e5946": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "4e718bfd-814e-4837-75b4-3fe15f5e5946",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
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
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "bookISBN",
                                "nameCamelCase": "bookIsbn",
                                "namePascalCase": "BookIsbn",
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
                                "className": "TransactionType",
                                "isCopy": false,
                                "isKey": false,
                                "name": "transactionType",
                                "nameCamelCase": "transactionType",
                                "namePascalCase": "TransactionType",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanTransactionRequested",
                        "displayName": "대출 신청 완료",
                        "nameCamelCase": "loanTransactionRequested",
                        "namePascalCase": "LoanTransactionRequested",
                        "namePlural": "",
                        "relationCommandInfo": [],
                        "relationPolicyInfo": [],
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PostPersist",
                        "_type": "org.uengine.modeling.model.Event",
                        "aggregate": {
                            "id": "dedaa92f-b958-0d49-7b17-0c7310142fd5"
                        },
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        }
                    },
                    "targetElement": {
                        "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "description": "대출 신청 이벤트 발생 시 회원 번호와 이름을 통해 자동으로 회원 검증을 수행하여, 올바른 회원 정보 확인과 대출 프로세스의 신뢰성을 보장하기 위함",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1022,
                            "y": 250,
                            "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "VerifyMemberOnLoanRequestPolicy",
                        "displayName": "대출 신청 시 회원 검증",
                        "nameCamelCase": "verifyMemberOnLoanRequestPolicy",
                        "namePascalCase": "VerifyMemberOnLoanRequestPolicy",
                        "namePlural": "verifyMemberOnLoanRequestPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                    "to": "f0761bea-4355-5d9e-875c-7d82405f0069",
                    "relationView": {
                        "id": "4e718bfd-814e-4837-75b4-3fe15f5e5946",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "to": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "needReconnect": true,
                        "value": "[[1709,252],[1072,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "32bbfbf8-2635-2af8-3ecd-76e8a1a20de7",
                        "id": "4e718bfd-814e-4837-75b4-3fe15f5e5946",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "26022eee-8e33-ca3e-a76f-79d606a5a390": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "26022eee-8e33-ca3e-a76f-79d606a5a390",
                    "sourceElement": {
                        "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "description": "대출 신청 이벤트 발생 시 회원 번호와 이름을 통해 자동으로 회원 검증을 수행하여, 올바른 회원 정보 확인과 대출 프로세스의 신뢰성을 보장하기 위함",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 1022,
                            "y": 250,
                            "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "f0761bea-4355-5d9e-875c-7d82405f0069",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "VerifyMemberOnLoanRequestPolicy",
                        "displayName": "대출 신청 시 회원 검증",
                        "nameCamelCase": "verifyMemberOnLoanRequestPolicy",
                        "namePascalCase": "VerifyMemberOnLoanRequestPolicy",
                        "namePlural": "verifyMemberOnLoanRequestPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "MemberVerified"
                        ],
                        "aggregate": {
                            "id": "f6f849fa-ddd2-ca3e-7345-d57ebe52c757"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "d66e3a59-c465-2491-7f7a-0fa741087a1f"
                        },
                        "controllerInfo": {
                            "apiPath": "verifymember",
                            "method": "POST",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "memberNumber",
                                "nameCamelCase": "memberNumber",
                                "namePascalCase": "MemberNumber",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "name",
                                "nameCamelCase": "name",
                                "namePascalCase": "Name",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            },
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": false,
                                "name": "name",
                                "nameCamelCase": "name",
                                "namePascalCase": "Name",
                                "displayName": "",
                                "_type": "org.uengine.model.FieldDescriptor"
                            }
                        ],
                        "description": null,
                        "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                            "style": "{}",
                            "width": 100,
                            "x": 1141,
                            "y": 250,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "VerifyMember",
                        "displayName": "회원 검증",
                        "nameCamelCase": "verifyMember",
                        "namePascalCase": "VerifyMember",
                        "namePlural": "verifyMembers",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "POST"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "f0761bea-4355-5d9e-875c-7d82405f0069",
                    "to": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                    "relationView": {
                        "id": "26022eee-8e33-ca3e-a76f-79d606a5a390",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "to": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "needReconnect": true,
                        "value": "[[1072,252],[1091,252]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "f0761bea-4355-5d9e-875c-7d82405f0069",
                        "id": "26022eee-8e33-ca3e-a76f-79d606a5a390",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "f4e5908a-0dbb-ae34-c7c7-7f75013ec195",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "7fcd0bec-f4f6-77d2-c726-73e6e503c0f4": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "7fcd0bec-f4f6-77d2-c726-73e6e503c0f4",
                    "sourceElement": {
                        "alertURL": "/static/image/symbol/alert-icon.png",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "checkAlert": true,
                        "description": null,
                        "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "elementView": {
                            "angle": 0,
                            "height": 116,
                            "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                            "style": "{}",
                            "width": 100,
                            "x": 2364,
                            "y": 380,
                            "_type": "org.uengine.modeling.model.Event"
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "loanId",
                                "nameCamelCase": "loanId",
                                "namePascalCase": "LoanId",
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
                            }
                        ],
                        "hexagonalView": {
                            "height": 0,
                            "id": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0,
                            "_type": "org.uengine.modeling.model.EventHexagonal"
                        },
                        "name": "LoanReturned",
                        "displayName": "도서 반납 완료",
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
                            "id": "c1dadd70-5fed-e164-a6b1-e941f742304e"
                        },
                        "boundedContext": {
                            "id": "f3e979a6-2510-7df5-eaf2-86bcad79ce57"
                        }
                    },
                    "targetElement": {
                        "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "LoanRecord 컨텍스트에서 발생하는 'evt-loanReturned' 이벤트에 따라 BookManagement 컨텍스트의 'cmd-updateBookStatus' 커맨드를 실행하여, 대출 반납 후 예약자 존재 여부에 따라 도서 상태를 '대출가능' 또는 '예약중'으로 자동 갱신하기 위함이다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "BookReturnStatusSyncPolicy",
                        "displayName": "도서 반납 상태 동기화",
                        "nameCamelCase": "bookReturnStatusSyncPolicy",
                        "namePascalCase": "BookReturnStatusSyncPolicy",
                        "namePlural": "bookReturnStatusSyncPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "from": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                    "to": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                    "relationView": {
                        "id": "7fcd0bec-f4f6-77d2-c726-73e6e503c0f4",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "to": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "needReconnect": true,
                        "value": "[[2314,380],[487,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "60d12d11-f750-0be4-be28-c5022c62e0a8",
                        "id": "7fcd0bec-f4f6-77d2-c726-73e6e503c0f4",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                },
                "45d89bb7-413a-21eb-e3f7-d11836998448": {
                    "_type": "org.uengine.modeling.model.Relation",
                    "name": "",
                    "id": "45d89bb7-413a-21eb-e3f7-d11836998448",
                    "sourceElement": {
                        "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "description": "LoanRecord 컨텍스트에서 발생하는 'evt-loanReturned' 이벤트에 따라 BookManagement 컨텍스트의 'cmd-updateBookStatus' 커맨드를 실행하여, 대출 반납 후 예약자 존재 여부에 따라 도서 상태를 '대출가능' 또는 '예약중'으로 자동 갱신하기 위함이다.",
                        "elementView": {
                            "height": 116,
                            "width": 100,
                            "x": 437,
                            "y": 380,
                            "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                            "style": "{}",
                            "_type": "org.uengine.modeling.model.Policy"
                        },
                        "fieldDescriptors": [],
                        "hexagonalView": {
                            "height": 20,
                            "id": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                            "style": "{}",
                            "subWidth": 100,
                            "width": 20,
                            "_type": "org.uengine.modeling.model.PolicyHexagonal"
                        },
                        "isSaga": false,
                        "name": "BookReturnStatusSyncPolicy",
                        "displayName": "도서 반납 상태 동기화",
                        "nameCamelCase": "bookReturnStatusSyncPolicy",
                        "namePascalCase": "BookReturnStatusSyncPolicy",
                        "namePlural": "bookReturnStatusSyncPolicies",
                        "oldName": "",
                        "rotateStatus": false,
                        "_type": "org.uengine.modeling.model.Policy"
                    },
                    "targetElement": {
                        "_type": "org.uengine.modeling.model.Command",
                        "outputEvents": [
                            "BookStatusUpdated"
                        ],
                        "aggregate": {
                            "id": "5e3aa600-ef91-81e1-b591-b701b4cd83db"
                        },
                        "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
                        "boundedContext": {
                            "id": "065ac5f5-2cfe-8f5b-6ce8-ff564607adbf"
                        },
                        "controllerInfo": {
                            "apiPath": "updatebookstatus",
                            "method": "PUT",
                            "fullApiPath": ""
                        },
                        "fieldDescriptors": [
                            {
                                "className": "String",
                                "isCopy": false,
                                "isKey": true,
                                "name": "ISBN",
                                "nameCamelCase": "isbn",
                                "namePascalCase": "Isbn",
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
                        "description": null,
                        "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "elementView": {
                            "_type": "org.uengine.modeling.model.Command",
                            "height": 116,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 100,
                            "x": 556,
                            "y": 380,
                            "z-index": 999
                        },
                        "hexagonalView": {
                            "_type": "org.uengine.modeling.model.CommandHexagonal",
                            "height": 0,
                            "id": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                            "style": "{}",
                            "width": 0,
                            "x": 0,
                            "y": 0
                        },
                        "isRestRepository": false,
                        "name": "UpdateBookStatus",
                        "displayName": "도서 상태 수정",
                        "nameCamelCase": "updateBookStatus",
                        "namePascalCase": "UpdateBookStatus",
                        "namePlural": "updateBookStatuses",
                        "relationCommandInfo": [],
                        "relationEventInfo": [],
                        "restRepositoryInfo": {
                            "method": "PUT"
                        },
                        "rotateStatus": false,
                        "selected": false,
                        "trigger": "@PrePersist"
                    },
                    "from": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                    "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                    "relationView": {
                        "id": "45d89bb7-413a-21eb-e3f7-d11836998448",
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "from": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "needReconnect": true,
                        "value": "[[487,380],[506,380]]"
                    },
                    "hexagonalView": {
                        "_type": "org.uengine.modeling.model.RelationHexagonal",
                        "from": "945e24b2-dec4-3d5f-cfc7-7c3e64a7cf20",
                        "id": "45d89bb7-413a-21eb-e3f7-d11836998448",
                        "needReconnect": true,
                        "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                        "to": "aa5e3d8a-0d49-7a75-22d6-cfc470ee2201",
                        "value": null
                    },
                    "sourceMultiplicity": "1",
                    "targetMultiplicity": "1",
                    "displayName": ""
                }
            }
        }
    }
}