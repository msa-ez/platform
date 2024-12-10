<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    
</template>
  
<script>
import ESValueSummarizeUtil_OnlyName from "../../modeling/generators/es-ddl-generators/modules/ESValueSummarizeUtil_OnlyName"
import ESValueSummarizeUtil from "../../modeling/generators/es-ddl-generators/modules/ESValueSummarizeUtil"
import ESActionsUtil from "../../modeling/generators/es-ddl-generators/modules/ESActionsUtil"
import GWTGeneratorByFunctions from "../../modeling/generators/es-ddl-generators/GWTGeneratorByFunctions";
import ESValueSummarizeUtil_WithProperties from "../../modeling/generators/es-ddl-generators/modules/ESValueSummarizeUtil_WithProperties";

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
            const COMMAND = "TestPolicyGenerator" // prompt("테스트 커맨드 입력")
            if(!COMMAND) return

            const commands = {
                TestESValueSummarizeUtilOnlyName: () => this._test_ESValueSummarizeUtilOnlyName(),
                TestPolicyGenerator: () => this._test_PolicyGenerator()
            }

            const commandFunction = commands[COMMAND]
            if (commandFunction) commandFunction()
            else alert("유효하지 않은 커맨드입니다.")
        },

        _test_ESValueSummarizeUtilOnlyName() {
            var me = this

            const summarizeESValue = ESValueSummarizeUtil_OnlyName.getFilteredSummarizedESValue(me.value)
            
            console.log(me.value)
            console.log(summarizeESValue)
        },

        _test_PolicyGenerator() {
            const draftOptions = {
    "loanService": {
        "structure": [
            {
                "aggregate": {
                    "name": "Loan",
                    "alias": "도서 대출"
                },
                "entities": [],
                "valueObjects": [
                    {
                        "name": "Member",
                        "alias": "회원"
                    },
                    {
                        "name": "LoanStatus",
                        "alias": "대출 상태"
                    }
                ]
            },
            {
                "aggregate": {
                    "name": "LoanDetail",
                    "alias": "대출 세부사항"
                },
                "entities": [],
                "valueObjects": [
                    {
                        "name": "Loan",
                        "alias": "대출 참조",
                        "referencedAggregate": {
                            "name": "Loan",
                            "alias": "도서 대출"
                        }
                    },
                    {
                        "name": "LoanPeriod",
                        "alias": "대출 기간"
                    },
                    {
                        "name": "PickupMethod",
                        "alias": "수령 방법"
                    }
                ]
            }
        ],
        "pros": {
            "cohesion": "대출과 세부사항의 명확한 분리",
            "coupling": "핵심 대출과 세부사항의 명확한 분리",
            "consistency": "핵심 대출과 별도로 세부사항 관리 가능",
            "encapsulation": "다양한 측면의 더 나은 캡슐화",
            "complexity": "책임의 명확한 분리",
            "independence": "대출 세부사항을 독립적으로 발전 가능",
            "performance": "세부사항을 필요 시 로드 가능"
        },
        "cons": {
            "cohesion": "관련 개념의 분리",
            "coupling": "aggregate 간 일관성 유지 필요",
            "consistency": "더 복잡한 트랜잭션 관리 필요",
            "encapsulation": "더 복잡한 관계 관리 필요",
            "complexity": "추가 aggregate 관리 필요",
            "independence": "aggregate 간 변경 조정 필요",
            "performance": "전체 대출 정보를 위한 다중 쿼리 필요"
        },
        "isAIRecommended": true,
        "boundedContext": {
            "_type": "org.uengine.modeling.model.BoundedContext",
            "id": "ed0c6cb0-aa76-7dbe-60a4-af33facf66e5",
            "name": "loanService",
            "oldName": "",
            "displayName": "",
            "description": "도서를 대출하기 위한 '도서대출' 화면과 대출 이력을 조회하는 '대출현황' 화면을 각각 만들려고 해.\n\n'도서대출' 화면에는 회원 정보를 조회하는 테이블과 대출 신청 내용을 작성하는 테이블로 구분되어 있어. 회원 정보 테이블은 회원 이름, 회원번호, 회원등급(일반/프리미엄), 연락처, 이메일, 현재 대출 권수가 조회 됨. 대출 신청 테이블에는 도서명, ISBN, 대출기간, 수령방법, 예약여부, 특이사항 칸으로 구성되어 있어. 도서명은 검색할 수 있어야 하고, 돋보기 버튼을 누르면 도서 검색 팝업이 뜨도록 해야 해. ISBN은 자동으로 입력되어야 해. 대출기간은 dropdown menu로 7일/14일/30일 중 선택할 수 있어야 해. 수령방법은 radio button으로 '직접수령'과 '배송' 중 선택할 수 있어야 해. 예약여부는 해당 도서가 현재 대출 중일 경우 checkbox로 선택할 수 있어야 해. 특이사항은 text type으로 입력할 수 있어야 해. 특이사항을 제외한 모든 필드는 required이며, 입력되지 않으면 대출 버튼이 활성화되지 않아야 해.\n\n'대출현황' 화면에는 회원의 전체 대출 이력이 조회되는 화면이야. 조회 필터로 기간과 상태가 있어. 기간은 대출일 기준으로 from~to date를 YYYY.MM.DD 형식으로 선택할 수 있어야 해. 상태는 전체/대출중/반납완료/연체 중에서 dropdown menu로 선택할 수 있어야 해. 조회 결과는 테이블 형태로 표시되며, 대출번호, 도서명, ISBN, 대출일, 반납예정일, 실제반납일, 상태 컬럼이 있어. 각 행을 클릭하면 상세 정보를 팝업으로 볼 수 있어야 하고, 대출 중인 도서는 연장 또는 반납 처리가 가능해야 해.",
            "author": "EYCl46CwWAWvpz2E1BCUpVgPIpa2",
            "aggregates": [],
            "policies": [],
            "members": [],
            "views": [],
            "gitURL": null,
            "elementView": {
                "_type": "org.uengine.modeling.model.BoundedContext",
                "id": "ed0c6cb0-aa76-7dbe-60a4-af33facf66e5",
                "x": 291,
                "y": 281,
                "width": 350,
                "height": 350,
                "style": "{}"
            },
            "hexagonalView": {
                "_type": "org.uengine.modeling.model.BoundedContextHexagonal",
                "id": "ed0c6cb0-aa76-7dbe-60a4-af33facf66e5",
                "x": 299,
                "y": 321,
                "width": 350,
                "height": 350,
                "style": "{}"
            },
            "portGenerated": 0,
            "tempId": "",
            "templatePerElements": {},
            "preferredPlatform": "spring-boot",
            "preferredPlatformConf": {},
            "rotateStatus": false
        },
        "description": "{\"userStories\":[{\"title\":\"새로운 도서 대출 신청\",\"description\":\"회원으로서, 나는 도서를 대출 신청하여 읽고 싶습니다.\",\"acceptance\":[\"모든 필수 회원 정보가 제공되어야 합니다.\",\"도서명은 검색 팝업을 통해 선택되어야 합니다.\",\"대출 기간은 유효한 옵션 중 하나로 선택되어야 합니다.\",\"수령 방법은 라디오 버튼을 통해 선택되어야 합니다.\",\"대출 버튼은 모든 필수 필드가 입력되었을 때만 활성화됩니다.\"]},{\"title\":\"대출 이력 조회 및 관리\",\"description\":\"회원으로서, 나는 나의 대출 이력을 조회하고 현재 대출 중인 도서를 관리하고 싶습니다.\",\"acceptance\":[\"대출 이력은 기간 및 상태로 필터링할 수 있습니다.\",\"행을 클릭하면 상세 대출 정보가 팝업으로 표시됩니다.\",\"대출 중인 도서는 연장 또는 반납 처리가 가능합니다.\",\"모든 대출 정보는 정리된 테이블 형식으로 표시됩니다.\"]}],\"entities\":{\"Member\":{\"properties\":[{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"name\",\"type\":\"string\",\"required\":true},{\"name\":\"membershipLevel\",\"type\":\"enum\",\"required\":true,\"values\":[\"일반\",\"프리미엄\"]},{\"name\":\"contactNumber\",\"type\":\"string\",\"required\":true},{\"name\":\"email\",\"type\":\"string\",\"required\":true}]},\"Loan\":{\"properties\":[{\"name\":\"loanNumber\",\"type\":\"string\",\"required\":true,\"isPrimaryKey\":true},{\"name\":\"memberId\",\"type\":\"string\",\"required\":true,\"isForeignKey\":true,\"foreignEntity\":\"Member\"},{\"name\":\"bookTitle\",\"type\":\"string\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"string\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"enum\",\"required\":true,\"values\":[\"7일\",\"14일\",\"30일\"]},{\"name\":\"pickupMethod\",\"type\":\"enum\",\"required\":true,\"values\":[\"직접수령\",\"배송\"]},{\"name\":\"reservation\",\"type\":\"boolean\",\"required\":true},{\"name\":\"specialNotes\",\"type\":\"string\",\"required\":false},{\"name\":\"status\",\"type\":\"enum\",\"required\":true,\"values\":[\"대출중\",\"반납완료\",\"연체\"]},{\"name\":\"loanDate\",\"type\":\"date\",\"required\":true},{\"name\":\"returnDueDate\",\"type\":\"date\",\"required\":true},{\"name\":\"actualReturnDate\",\"type\":\"date\",\"required\":false}]},\"businessRules\":[{\"name\":\"ValidLoanPeriod\",\"description\":\"대출 기간은 유효한 옵션 중 하나로 선택되어야 합니다.\"},{\"name\":\"RequiredFields\",\"description\":\"특이사항을 제외한 모든 필드는 필수입니다.\"},{\"name\":\"ActiveLoanManagement\",\"description\":\"대출 중인 도서만 연장 또는 반납 처리가 가능합니다.\"}],\"interfaces\":{\"BookLoan\":{\"sections\":[{\"name\":\"MemberInformation\",\"type\":\"table\",\"fields\":[{\"name\":\"name\",\"type\":\"text\",\"required\":true},{\"name\":\"memberId\",\"type\":\"text\",\"required\":true},{\"name\":\"membershipLevel\",\"type\":\"select\",\"required\":true},{\"name\":\"contactNumber\",\"type\":\"text\",\"required\":true},{\"name\":\"email\",\"type\":\"email\",\"required\":true}]},{\"name\":\"LoanApplication\",\"type\":\"form\",\"fields\":[{\"name\":\"bookTitle\",\"type\":\"search\",\"required\":true},{\"name\":\"ISBN\",\"type\":\"text\",\"required\":true},{\"name\":\"loanPeriod\",\"type\":\"select\",\"required\":true},{\"name\":\"pickupMethod\",\"type\":\"radio\",\"required\":true},{\"name\":\"reservation\",\"type\":\"checkbox\",\"required\":true},{\"name\":\"specialNotes\",\"type\":\"textarea\",\"required\":false}],\"actions\":[\"Submit\",\"Clear\"]}]},\"LoanStatus\":{\"sections\":[{\"name\":\"LoanHistory\",\"type\":\"table\",\"filters\":[\"dateRange\",\"loanStatus\"],\"resultTable\":{\"columns\":[\"loanNumber\",\"bookTitle\",\"ISBN\",\"loanDate\",\"returnDueDate\",\"actualReturnDate\",\"status\"],\"actions\":[\"viewDetails\",\"extend\",\"return\"]}}]}}}}"
    }
}

            this.generators.GWTGeneratorByFunctions.initInputs(draftOptions)
            this.generators.GWTGeneratorByFunctions.generateIfInputsExist()
        }
    }
}
</script>
  