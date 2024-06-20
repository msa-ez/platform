const VODefinitions = require("../VODefinitions");
const JsonAIGenerator = require("../JsonAIGenerator");
let changeCase = require('change-case');

class DebeziumLogsTabGenerator extends JsonAIGenerator{
    constructor(client){
        super(client);

        this.generateType = 'ES'
        this.generateCnt = 0;
        this.modelElements = {}
        this.sequenceForUUID = 0;
        this.lastBCView = null;
        this.bcPosition = {};
        this.VODefinitionsFieldDescriptors = VODefinitions

        // this.originalLanguage = this.preferredLanguage.toLowerCase();
        // this.preferredLanguage = "English";

        this.generationOptions = {policy: true, ui: false, properties: true}

        this.model = "gpt-4o"
        this.preferredLanguage = this.setPreferredLanguage();
        this.originalLanguage = this.preferredLanguage.toLowerCase();
    }
    

    createPrompt(userProps){
        this.modelElements = {}
        this.generateCnt = 0

        const PROMPT = this.getSystemPrompt() +
                       this.getUserPrompt(userProps.DebeziumLogs)

        console.log("[*] DebeziumLogsTabGenerator에 전달한 프롬프트: ", PROMPT)
        return PROMPT
    }

    getSystemPrompt() {
        return `
당신은 특정 시스템의 데이터베이스에서 발생하는 Debezium CDC 트랜젝션 로그를 해석해서 DDD Aggregate 방식으로 이벤트 스토밍 모델 설계를 위한 JSON 객체를 반환해야 합니다.


다음 규칙을 따라서 작성해 주세요.
1. 제공된 Debezium CDC 트랜젝션에서 발견된 속성 및 Bounded Context에 대해서만 생성해 주세요. 그 외의 추가적인 속성이나 Bounded Context를 추측해서 추가하지 마세요.
2. 하나의 Bounded Context에 반드시 하나의 Aggregate가 속하도록 만들어주세요.
3. 유저 관리나 인증과 관련된 Bounded Context를 만들지 말아주세요.
4. 출력되는 JSON 객체에는 주석을 절대로 작성하면 안 됩니다.
5. 각 Bounded Context는 서로와 상호작용을 합니다. 각 Bounded Context는 도메인 이벤트가 발생하면, 다른 Bounded Context의 정책을 호출하고, 그 정책이 Bounded Context의 Aggregate에 속한 Command를 호출하는 식으로 이벤트 내용을 전달할 수 있습니다.
6. 자바에서 제공하는 기본 데이터타입 혹은 Address, Portrait, Rating, Money, Email을 제외한 속성들은 enumerations나 valueObjects로 직접 정의해야합니다.
7. event.block이나 hibernate_sequence와 같이 비즈니스 로직과 직접적으로 관련이 없는 트렌젝션은 무시해야합니다.


당신이 반환해야 하는 형식은 다음과 같습니다.
최대한 성실하게 적을 수 있는 속성들을 다 적어주시길 바랍니다.
{
    // 당신은 더 질 좋은 답변을 위해서 먼저 Debezium CDC 트랜젝션에 있는 각 테이블의 속성, 용도, 해당 테이블에 대한 각각의 엑터들의 사용 케이스들을 미리 작성합니다.
    // 여기서 당신이 정의한 속성들은 향후 모델링 설계 시에 "from"과 같은 이름으로 전부 연계됩니다.
    // 여기서 작성된 테이블은 반드시 다음에 aggregates 혹은 aggregates 내부의 entities에 정의되어야 합니다.
    "tables": [
        {
            "name": "<TableName>",

            // Debezium CDC 트랜젝션에 parameters.allowed가 있는 경우에는 해당 항목 중 하나만 선택해야 하므로, Enumeration 타입으로 정의해주세요.
            // 여기서 작성한 타입 중 Enumeration 타입인 경우, 다음에 해당 aggregate 내부의 enumerations에 추가해야 합니다.
            // 여기서 작성한 타입 중 사용자가 직접 정의한 것으로 생각되는 타입인 경우, aggregate 내부의 valueObjects에 추가해야 합니다.
            "properties": [
                {
                    "name": "<PropertyName>",
                    "type": "<PropertyType>"
                }
            ],

            // 앞에서 정의한 properties에서 특정 속성이 다른 테이블의 속성을 참조하는 경우, 이러한 속성들은 반드시 foreignProperties에 정의되어야 합니다.
            "foreignProperties": [
                {
                    "name": "<ForeignPropertyName>",
                    "references": "<ReferencedTableName>"
                }
            ],

            "purpose": "<TablePurpose>",

            // 여기서 작성된 사용 케이스는 반드시 다음에 설계된 모델의 Command, Event에 정의되어야 합니다.
            // 만약, 사용 케이스에 triggeredUsecaseName가 정의된다면, 이것은 서로 다른 aggregate간의 호출을 의미하므로, 반드시 다음에 Policy로 정의되어야 합니다.
            // 반드시 하나 이상의 usecase를 적어주세요.
            "usecases": [
                {
                    "name": "<UsecaseName>",
                    "triggeredUsecaseName": "<TriggeredUsecaseName>", // 만약, 이 usecase가 다른 usecase에 의해서 발생할 수 있으면, 원인이 되는 usecase의 이름을 적어주세요.
                    "actor": "<ActorName>", // 주어진 서비스를 사용하는 엑터의 이름을 적습니다. 예를 들어서 "사용자", "관리자" 등이 있을 수 있습니다.
                    "description": "<UsecaseDescription>" // 해당 엑터가 해당 테이블을 사용하는 사용 케이스의 설명을 적습니다. 예를 들어서 "주문 생성", "주문 취소" 등이 있을 수 있습니다. 
                }
            ]
        }
    ],

    
    // 당신은 위에서 작성한 tables를 토대로 어떠한 테이블이 Aggregate에 있고, 어떠한 테이블이 해당 Aggregate의 ValueObject로 존재해야 하는지 미리 작성해야 합니다.
    // 이때, 만약, 두 테이블의 데이터가 잠깐 불일치가 발생할 경우, 비즈니스적으로 치명적이면 해당 테이블 중 하나는 ValueObject로 존재해야 합니다.
    // 비즈니스 적으로 치명적일 수 있는 사례는 다음과 같습니다.
    // 1. 금융 거래 데이터
    //  - 예시: Transaction 테이블과 AccountBalance 테이블
    //  - 설명: 거래 내역과 계좌 잔액이 일치하지 않으면 금융 손실이나 부정확한 잔액 정보가 발생할 수 있습니다.
    // 2. 재고 관리 데이터
    //  - 예시: Inventory 테이블과 Order 테이블
    //  - 설명: 재고 수량과 주문 수량이 일치하지 않으면 재고 부족이나 과잉 주문 문제가 발생할 수 있습니다.
    // 3. 배송 정보 데이터
    //  - 예시: Shipment 테이블과 Order 테이블
    //  - 설명: 배송 정보와 주문 정보가 일치하지 않으면 잘못된 배송이나 고객 불만이 발생할 수 있습니다.
    // 4. 의료 기록 데이터
    //  - 예시: Patient 테이블과 MedicalRecord 테이블
    //  - 설명: 환자 정보와 의료 기록이 일치하지 않으면 잘못된 진단이나 치료가 발생할 수 있습니다.
    //
    // aggregateRootTable의 이름과 valueObjectTable의 이름은 반드시 위의 tables에서 작성한 name을 사용해야 하며, 재귀적으로 작성하면 안 됩니다.
    "relations":{
        // ValueObject를 가지고 있는 테이블을 아래와 같은 형식으로 정의하십시오.
        "<AggregateRootTableName>":[
            {  
                "relationName": "<RelationName>", // 위의 tables에서 작성한 name을 사용해야 합니다.
                "valueObjectTable": "<ValueObjectTableName>", // 위의 tables에서 작성한 name을 사용해야 합니다.
                "businessCriticalReason": "<BusinessCriticalReason>" // 위에서 제시한 비즈니스적으로 치명적인 사례에 대한 설명과 같이 작성합니다.
            }
        ],

        // ValueObject를 가지고 있지 않은 테이블을 아래와 같은 형식으로 정의하십시오.
        "<AggregateRootTableName>": null
    },

    // 당신은 위에서 작성한 tables, relations에 대한 내용을 토대로 아래에 이벤트 스토밍과 관련된 설계 내용들을 작성합니다.
    "serviceName": "<ServiceName>", // Service 이름은 반드시 영어로 작성되어야 하고, 공백이 허용되지 않습니다. 대신 "-"를 사용해 주세요.
    "actors": ["<ActorName>"], // 주어진 서비스를 사용하는 엑터의 이름을 적습니다. 예를 들어서 "사용자", "관리자" 등이 있을 수 있습니다.

    "boundedContext": {
        // Bounded Context는 반드시 하나의 aggregate를 가져야 합니다.
        // Bounded Context의 이름은 반드시 소문자로 작성되어야 하며, 공백이 허용되지 않습니다. 대신 "-"를 사용해 주세요.
        "<bounded-context-name>": {  
            "${this.originalLanguage}Name": "<${this.originalLanguage} 언어로 작성된 Bounded Context의 이름>",
            "aggregates": [ 
                {
                    "fromTable": "<TableName>", // 이전 tables에서 정의했던 테이블의 이름을 적습니다.

                    // 이전 relations에서 키값으로 사용된 값들만 aggregateRootTableName으로 사용해야 합니다.
                    "name": "<AggregateRootTableName>",
                    "${this.originalLanguage}Name": "<${this.originalLanguage} 언어로 작성된 Aggregate의 이름>", 
                    "${this.originalLanguage}Description": "<${this.originalLanguage} 언어로 작성된 Aggregate에 대한 설명>", 

                    ${this.generationOptions.ui ? `
                    "uiStyle":{
                        "layout": <"CARD" | "GRID" | "LIST-ITEM">,
                        "nameProperty": "<property name for representing the object>",
                        "imageUrlProperty":"<property name for representing image url if exists>",
                        "icon": "<material design icon font name for representing this aggregate data>",
                        "isRepresentingUser": <true | false>
                    },
                    `: ``}

                    "properties": [
                        {
                            "fromProperty": "<PropertyName>", // 이전 tables에서 정의했던 속성의 이름을 적습니다.
                            "name": "<PropertyName>", // Property 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                            "${this.originalLanguage}Name": "<${this.originalLanguage} 언어로 작성된 Property 이름>", 

                            // Property 타입은 다음 3가지 중 하나에 해당하여야 하고, 반드시 작성해야 합니다. 
                            // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다. 이때, 패키지 전체 경로를 적지 말고, 클래스 명만 적어주세요. (ex. java.lang.String > String)
                            // 2. 다음 같은 값 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                            // 3. entities 속성에 ValueObject, Enumeration으로 정의된 name이 있는 경우, 해당 이름을 사용할 수 있습니다.
                            "type": "<PropertyType>",

                            "isKey": <true | false>, // properties중 오직 하나만 isKey가 true로 설정되어야 합니다.
                            ${this.generationOptions.ui ? `
                            "uiStyle":{
                                "inputUI": <"TEXT" | "SELECT" | "TEXTAREA"> // 속성값에 대해서 적절한 UI 스타일을 골라야 합니다.
                            }`:``}
                        }
                    ],
                    
                    // aggregate, event, command의 properties에서 커스텀으로 사용된 속성에 대한 내용을 적습니다.
                    // Address, Portrait, Rating, Money, Email은 별도로 생성하지 않습니다.
                    // tables에서 Enumeration으로 정의한 타입이 있다면, 반드시 여기에 해당 속성을 정의해야 합니다.
                    "enumerations": [
                        {
                            "fromTable": "<TableName>", // 이전 tables에서 정의했던 테이블의 이름을 적습니다.
                            "name": "<EnumerationName>",
                            "items": ["<Item1>", "<Item2>"]
                        }
                    ],

                    // relations에서 valueObjectTable로 정의된 속성은 valueObjects 속성에 정의되어야 합니다.
                    // valueObjects는 AggregateRoot를 참조하는 foreignProperties를 최소 하나 이상 가지고 있어야 합니다.
                    valueObjects: [
                        {
                            "fromRelation": "<RelationName>", // 이전 relations에서 정의했던 관계의 이름을 적습니다.
                            "fromTable": "<TableName>", // 이전 tables에서 정의했던 테이블의 이름을 적습니다.
                            "name": "<ValueObjectTableName>", // 이전 relations에서 valueObjectTable에 정의된 이름만 사용해야 합니다.
                            "properties": [
                                {
                                    "fromProperty": "<PropertyName>", // 이전 tables에서 정의했던 속성의 이름을 적습니다.
                                    "name": "<PropertyName>", // Property 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                                    "${this.originalLanguage}Name": "<${this.originalLanguage} 언어로 작성된 Property 이름>", 
        
                                    // Property 타입은 다음 3가지 중 하나에 해당하여야 하고, 반드시 작성해야 합니다. 
                                    // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다. 이때, 패키지 전체 경로를 적지 말고, 클래스 명만 적어주세요. (ex. java.lang.String > String)
                                    // 2. 다음 같은 값 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                                    // 3. entities 속성에 ValueObject, Enumeration으로 정의된 name이 있는 경우, 해당 이름을 사용할 수 있습니다.
                                    "type": "<PropertyType>",
        
                                    "isKey": <true | false>, // properties중 오직 하나만 isKey가 true로 설정되어야 합니다.
                                    "isForeignProperty": <true | false> // 이 속성이 다른 테이블의 속성을 참조하는 경우, 이 값은 true로 설정해야 합니다.
                                }
                            ]
                        }
                    ],

                    // 이전 tables에서 정의한 usecase를 활용해서 반드시 하나 이상의 command를 추가해 주세요.
                    "commands": [
                        {
                            "fromUsecase": "<UsecaseName>", // 이전 tables에서 정의했던 사용 케이스의 이름을 적습니다.
                            "name": "<CommandName>", // Command 이름은 반드시 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                            "${this.originalLanguage}Name": "<${this.originalLanguage} 언어로 작성된 Command 이름>",

                            ${this.generationOptions.properties ? `
                            "properties": [
                                {
                                    "fromProperty": "<PropertyName>", // 이전 tables에서 정의했던 속성의 이름을 적습니다.
                                    "name": "<PropertyName>", // Property 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                                    // Property 타입은 다음 3가지 중 하나에 해당하여야 하고, 반드시 작성해야 합니다. 
                                    // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다. 이때, 패키지 전체 경로를 적지 말고, 클래스 명만 적어주세요. (ex. java.lang.String > String)
                                    // 2. 다음 같은 값 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                                    // 3. entities 속성에 ValueObject, Enumeration으로 정의된 name이 있는 경우, 해당 이름을 사용할 수 있습니다.
                                    "type": "<PropertyType>", 
                                    "isKey": <true | false> // properties중 오직 하나만 isKey가 true로 설정되어야 합니다.
                                }
                            ],
                            `:``}

                            "api_verb": <"POST" | "DELETE" | "PUT">,
                            "isCreation": <true | false>, // 이 커멘드가 Aggregate에 새로운 인스턴스를 생성하는지 여부를 나타내는 값입니다.
                            "actor": "<ActorName>",
                            "outputEvents": ["<EventName>"],

                            ${this.generationOptions.ui ? `
                            "uiStyle":{
                                "icon": "이 커맨드를 나타내는 Material design icon font name"
                            }`:``}

                        }
                    ],
                    
                    // 이전 tables에서 정의한 usecase를 활용해서 반드시 하나 이상의 event를 추가해 주세요.
                    "events": [
                        {
                            "fromUsecase": "<UsecaseName>", // 이전 tables에서 정의했던 사용 케이스의 이름을 적습니다.
                            "name": "<EventName>", // Event 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                            "${this.originalLanguage}Name": "<${this.originalLanguage} 언어로 작성된 이벤트 이름>", 

                            ${this.generationOptions.properties ? `
                            "properties": [
                                {
                                    "fromProperty": "<PropertyName>", // 이전 tables에서 정의했던 속성의 이름을 적습니다.
                                    "name": "<PropertyName>", // Property 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                                    // Property 타입은 다음 3가지 중 하나에 해당하여야 하고, 반드시 작성해야 합니다. 
                                    // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다. 이때, 패키지 전체 경로를 적지 말고, 클래스 명만 적어주세요. (ex. java.lang.String > String)
                                    // 2. 다음 같은 값 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                                    // 3. entities 속성에 ValueObject, Enumeration으로 정의된 name이 있는 경우, 해당 이름을 사용할 수 있습니다.
                                    "type": "<PropertyType>",
                                    "isKey": <true | false> // properties중 오직 하나만 isKey가 true로 설정되어야 합니다.
                                }
                            ]
                            `:``}
                        }
                    ]
                }
            ]
        }
    }

    ${this.generationOptions.policy ? `
    ,
    // 특정 이벤트가 발생했을 경우, 다른 Aggregate의 Command를 호출해야 하는 경우가 있는데, 이 경우, Policy를 추가할 수 있습니다.
    // Policy는 서로 다른 Aggregate간의 통신을 위해서 사용하기 때문에 triggerEvents 속성의 aggregate와 commands의 aggregate가 다른 경우에만 추가해야 합니다.
    // tables에서 triggeredUsecaseName가 포함된 usecase가 있으면, 해당 usecase에 의한 policy를 반드시 추가해야 합니다.
    "policies": [
        {
            "boundedContext": "<이 정책이 속하는 Bounded Context의 이름>",
            "fromUsecase": "<UsecaseName>", // 이전 tables에서 정의했던 사용 케이스의 이름을 적습니다.
            "name": "<PolicyName>", // Policy 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
            "${this.originalLanguage}Name": "<${this.originalLanguage} 언어로 작성된 Policy 이름>",

            // 다음 이벤트들이 여기서 정의된 정책을 호출할 수 있습니다.
            "triggerEvents":[
                {
                    "boundedContext": "<이벤트가 발생하는 Bounded Context의 이름>",
                    "aggregate": "<이벤트가 발생하는 Aggregate 이름>",
                    "event": "<해당 정책을 호출시킨 이벤트의 이름>"
                }
            ],

            // 다음 Command들을 해당 정책은 호출할 수 있습니다.
            "commands":[
                {
                    "boundedContext": "<Command가 실행되는 Bounded Context의 이름>",
                    "aggregate": "<Command가 실행되는 Aggregate 이름>", // triggerEvents에서 정의한 aggregate와 다른 aggregate에 속해야 합니다.
                    "command": "<해당 정책이 호출하는 Command의 이름>"
                }
            ]
        }
    ]`:``} 
}`
    }

    getUserPrompt(debeziumLogs) {
        return (
`
[INPUT]
${debeziumLogs}

[OUTPUT]
`
)
    }


    createModel(text){
        console.log("[*] DebeziumLogsTabGenerator가 생성한 값: ", text)
        text = text.replace(/^```json\n/, "").replace(/\n```$/, "").replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim()

        var me = this
        let modelValue
        var voClassList = ["Payment", "Money", "Address", "Comment", "Email", "File", "Likes", "Photo", "Rating", "Tags", "User", "Weather"]
       
        var bcCnt = 0
        var heightVal = 0
        // var elements = {}
        me.lastBCView = null
        me.resetUUID();

        try{
            modelValue = super.createModel(text.trim())

            if(modelValue["boundedContext"]){
                var portNumber = 8080
                Object.keys(modelValue["boundedContext"]).forEach(function (key, bcIdx){
                    portNumber++;
                    if(portNumber == 8088) {
                        portNumber++;
                    }
                    if(me.generateCnt < bcIdx){
                        me.generateCnt = bcIdx
                    }
                    var bcMaxHeightVal = 0
                    if(bcCnt == 3){
                        heightVal++;
                        bcCnt = 0
                        me.lastBCView = null
                    }
                    bcCnt++;
                    if(!me.bcPosition[heightVal]){
                        me.bcPosition[heightVal] = null
                    }
                    ////
                    // .uuid()

                    
                    var bcUuid = 'bc-' + key.replaceAll("/", "-")
                    if(me.generateCnt == bcIdx){
                        me.modelElements[bcUuid] = me.createBoundedContext(
                            key, 
                            modelValue["boundedContext"][key], 
                            400 + ((bcCnt - 1) * 600), 
                            heightVal != 0 && (me.bcPosition[heightVal - 1]) ? me.bcPosition[heightVal - 1].height/2 + me.bcPosition[heightVal - 1].y + 335:380 + (heightVal * 610)
                        )
                    }

                    modelValue["boundedContext"][key].eleInfo = me.modelElements[bcUuid]
                    if(modelValue["boundedContext"][key]["aggregates"]){
                        if(modelValue["boundedContext"][key]["aggregates"].length == 0){
                            me.modelElements[bcUuid]["elementView"].width = 480
                        } else {
                            me.modelElements[bcUuid]["elementView"].width = modelValue["boundedContext"][key]["aggregates"].length * 480
                        }
                        if(me.lastBCView){
                            me.modelElements[bcUuid]["elementView"].x = me.lastBCView.x + me.lastBCView.width/2 + 20 + me.modelElements[bcUuid]["elementView"].width/2
                        } else {
                            me.modelElements[bcUuid]["elementView"].x = me.modelElements[bcUuid]["elementView"].width/2 + 120
                        }
                        me.lastBCView = me.modelElements[bcUuid]["elementView"] 
                        modelValue["boundedContext"][key]["aggregates"].forEach(function (agg, aggIdx){
                            // var aggUuid = me.uuid();
                            var aggMaxHeightVal = 0
                            var eventHeight = 0
                            var commandHeight = 0
                            var eventLength = 0
                            var commandLength = 0
                            var lastCommandView = null

                            if(agg["name"]){
                                var aggUuid = bcUuid + '-agg-' + agg.name.replaceAll("/", "-")
                                if(me.generateCnt == bcIdx){
                                    me.modelElements[aggUuid] = {
                                        aggregateRoot: {
                                            _type: 'org.uengine.modeling.model.AggregateRoot', 
                                            fieldDescriptors: [],
                                            entities: {}, 
                                            operations: [],
                                        },
                                        author: me.userUid,
                                        boundedContext: {
                                            name: key, 
                                            id: bcUuid
                                        },
                                        commands: [],
                                        description: null,
                                        id: aggUuid, 
                                        elementView: {
                                            _type: 'org.uengine.modeling.model.Aggregate', 
                                            id: aggUuid, 
                                            // x: modelValue["boundedContext"][key]["aggregates"].length == 1 ? me.modelElements[bcUuid]["elementView"].x:390 + ((bcCnt - 1) * 600) + ((aggIdx * 380)), 
                                            x: modelValue["boundedContext"][key]["aggregates"].length == 1 ? me.modelElements[bcUuid]["elementView"].x : me.modelElements[bcUuid]["elementView"].x - me.modelElements[bcUuid]["elementView"].width/2 + 280 + (aggIdx * 480), 
                                            y: me.modelElements[bcUuid]["elementView"].y, 
                                            width: 130,
                                            height: 400,
                                            _type: "org.uengine.modeling.model.Aggregate"
                                        },
                                        events: [],
                                        hexagonalView: {
                                            _type: 'org.uengine.modeling.model.AggregateHexagonal', 
                                            id: aggUuid, 
                                            x: 0, 
                                            y: 0, 
                                            subWidth: 0,
                                            width: 0,
                                            x: 0,
                                            y: 0,
                                            _type: "org.uengine.modeling.model.AggregateHexagonal"
                                        },
                                        name: agg.name,
                                        displayName: agg[me.originalLanguage + 'Name'],
                                        nameCamelCase: changeCase.camelCase(agg.name),
                                        namePascalCase: changeCase.pascalCase(agg.name),
                                        namePlural: "",
                                        rotateStatus: false,
                                        selected: false,
                                        _type: "org.uengine.modeling.model.Aggregate"
                                    }
                                    if(agg["properties"] && agg["properties"].length > 0){
                                        agg["properties"].forEach(function (ele, idx){
                                            var field = {
                                                className: ele.type,
                                                isCopy: false,
                                                isKey: idx == 0 ? true:false,
                                                name: ele.name,
                                                displayName: ele[me.originalLanguage + 'Name'],
                                                nameCamelCase: changeCase.camelCase(ele.name),
                                                namePascalCase: changeCase.pascalCase(ele.name),
                                                _type: "org.uengine.model.FieldDescriptor",
                                                inputUI: ele.uiStyle ? ele.uiStyle.inputUI:null,
                                                options: ele.options ? ele.options:null,
                                            }
                                            me.modelElements[aggUuid].aggregateRoot.fieldDescriptors.push(field)
                                            if(ele.options && ele.options.length > 0) {
                                                let enumItems = []
                                                ele.options.forEach(function (item) {
                                                    let itemObj = {
                                                        value: item
                                                    }
                                                    enumItems.push(itemObj)
                                                })
                                                var enumField = {
                                                    className: ele.name + "Type",
                                                    isCopy: false,
                                                    isKey: false,
                                                    name: ele.name + "Type",
                                                    displayName: ele[me.originalLanguage + 'Name'] + " 유형",
                                                    nameCamelCase: changeCase.camelCase(ele.name) + "Type",
                                                    namePascalCase: changeCase.pascalCase(ele.name) + "Type",
                                                    _type: "org.uengine.model.FieldDescriptor",
                                                    classId: null,
                                                    isCorrelationKey: false,
                                                    isList: false,
                                                    isLob: false,
                                                    isName: false,
                                                    isVO: false,
                                                    items: enumItems,
                                                    referenceClass: undefined
                                                }
                                                me.modelElements[aggUuid].aggregateRoot.fieldDescriptors.push(enumField)
                                            }
                                            
                                            
                                            if(voClassList.find(x => x == ele.type)){
                                                var entityUid = me.uuid();
                                                if(!me.modelElements[aggUuid].aggregateRoot.entities['elements']){
                                                    me.modelElements[aggUuid].aggregateRoot.entities['elements'] = {}
                                                    me.modelElements[aggUuid].aggregateRoot.entities['relations'] = {}
                                                }
                                                me.modelElements[aggUuid].aggregateRoot.entities['elements'][entityUid] = {
                                                    _type: "org.uengine.uml.model.vo.Class",
                                                    id: entityUid,
                                                    elementView: {
                                                        _type: "org.uengine.uml.model.Class",
                                                        id: entityUid,
                                                        style: "{}",
                                                        fieldH: 50,
                                                        height: 100,
                                                        methodH: 30,
                                                        subEdgeH: 70,
                                                        titleH: 30,
                                                        width: 200,
                                                        x: 180 + idx * 200, 
                                                        y: 300
                                                    },
                                                    fieldDescriptors: me.VODefinitionsFieldDescriptors[ele.type],
                                                    groupElement: null,
                                                    isAbstract: false,
                                                    isAggregateRoot: false,
                                                    isInterface: false,
                                                    isVO: true,
                                                    name: ele.type,
                                                    nameCamelCase: ele.type,
                                                    namePascalCase: ele.type,
                                                    namePlural: ele.type,
                                                    operations: [],
                                                    parentOperations: [],
                                                    relationType: null,
                                                    relations: [],
                                                    selected: false
                                                }
                                            }
                                        })
                                    } else if(agg["entities"] && agg["entities"][0] && agg["entities"][0]["properties"]){
                                        agg["entities"][0]["properties"].forEach(function (ele, idx){
                                            var field = {
                                                className: ele.type,
                                                isCopy: false,
                                                isKey: idx == 0 ? true:false,
                                                name: ele.name,
                                                nameCamelCase: changeCase.camelCase(ele.name),
                                                namePascalCase: changeCase.pascalCase(ele.name),
                                                _type: "org.uengine.model.FieldDescriptor"
                                            }
                                            me.modelElements[aggUuid].aggregateRoot.fieldDescriptors.push(field)
                                        })
                                    }
                                } 
                                modelValue["boundedContext"][key]["aggregates"][aggIdx].eleInfo = me.modelElements[aggUuid]
                            }

                            if(agg["uiStyle"]){
                                me.modelElements[aggUuid].uiStyle = agg["uiStyle"];
                            }

                            me.modelElements[aggUuid].description = agg[me.originalLanguage+"Description"];


                            var firstEvent = true
                            var firstCommand = true
                            var elementUuid
                            if(agg["events"]){
                                agg["events"].forEach(function (ele, idx){
                                    elementUuid = bcUuid + '-event-' + ele.name.replaceAll("/", "-")

                                    if(firstEvent && commandHeight == 0){
                                        eventHeight = me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200
                                        firstEvent = false
                                    }
                                    eventLength = agg["events"].length
                                    if(me.generateCnt == bcIdx){

                                        let event = me.createEvent(
                                            ele, 
                                            elementUuid,
                                            me.modelElements[aggUuid]["elementView"].x + 90, 
                                            commandHeight == 0 ? me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200:commandHeight + (idx * 120)
                                        )

                                        event.aggregate = 
                                        {
                                            id: aggUuid
                                        }
                                
                                        event.boundedContext = {
                                            name: key, 
                                            id: bcUuid
                                        }

                                        me.modelElements[elementUuid] = event
                                        
                                    }
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["events"][ele.name] = {}
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["events"][ele.name].eleInfo = me.modelElements[elementUuid]

                                    if(me.generateCnt == bcIdx){
                                        if(ele.properties && ele.properties.length > 0){
                                            ele.properties.forEach(function (property, propertyIdx){
                                                var field = {
                                                    className: property.type,
                                                    isCopy: false,
                                                    isKey: propertyIdx == 0 ? true:false,
                                                    name: property.name,
                                                    nameCamelCase: changeCase.camelCase(property.name),
                                                    namePascalCase: changeCase.pascalCase(property.name),
                                                    _type: "org.uengine.model.FieldDescriptor"
                                                }
                                                if(me.modelElements[elementUuid]){
                                                    me.modelElements[elementUuid].fieldDescriptors.push(field)
                                                }
                                            })
                                        }
                                    }
                                })
                            }

                            if(agg["commands"]){
                                agg["commands"].forEach(function (ele, idx){
                                    elementUuid = bcUuid + '-command-' + ele.name.replaceAll("/", "-")
                                    if(firstCommand && eventHeight == 0){
                                        commandHeight = me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200
                                        firstCommand = false
                                    }
                                    commandLength = agg["commands"].length
                                    if(me.generateCnt == bcIdx){
                                        me.modelElements[elementUuid] = {
                                            _type: "org.uengine.modeling.model.Command",
                                            outputEvents: ele.outputEvents,
                                            aggregate: {
                                                id: aggUuid
                                            },
                                            author: me.userUid,
                                            boundedContext: {
                                                id: bcUuid,
                                                name: key
                                            },
                                            controllerInfo: {
                                                apiPath: ele.api_uri,
                                                method: ele.api_verb
                                            },
                                            fieldDescriptors: [],
                                            description: null,
                                            id: elementUuid,
                                            elementView: {
                                                _type: "org.uengine.modeling.model.Command",
                                                height: 115,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 100,
                                                x: me.modelElements[aggUuid]["elementView"].x - 90, 
                                                y: eventHeight == 0 ? me.modelElements[aggUuid]["elementView"].y + (idx * 120) - 200:eventHeight + (idx * 120), 
                                                "z-index": 999
                                            },
                                            hexagonalView: {
                                                _type: "org.uengine.modeling.model.CommandHexagonal",
                                                height: 0,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 0,
                                                x: 0,
                                                y: 0
                                            },
                                            isRestRepository: ele.api_verb == 'PUT' ? false:true,
                                            name: ele.name,
                                            displayName: ele[me.originalLanguage + 'Name'],
                                            nameCamelCase: changeCase.camelCase(ele.name),
                                            namePascalCase: changeCase.pascalCase(ele.name),
                                            namePlural: "",
                                            relationCommandInfo: [],
                                            relationEventInfo: [],
                                            restRepositoryInfo: {
                                                method: ele.api_verb ? ele.api_verb:'POST'
                                            },
                                            rotateStatus: false,
                                            selected: false,
                                            trigger: "@PrePersist",
                                        }
                                    }
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["commands"][ele.name] = {}
                                    modelValue["boundedContext"][key]["aggregates"][aggIdx]["commands"][ele.name].eleInfo = me.modelElements[elementUuid]
                                    lastCommandView = me.modelElements[elementUuid]["elementView"]
                                    if(ele.actor){
                                        if(me.generateCnt == bcIdx){
                                            var actorUuid = bcUuid + '-' + elementUuid + '-actor-' + ele.actor.replaceAll("/", "-")
                                            me.modelElements[actorUuid] = {
                                                _type:"org.uengine.modeling.model.Actor",
                                                author: me.userUid,
                                                boundedContext: {
                                                    id: bcUuid,
                                                    name: key
                                                },
                                                description: null,
                                                id: actorUuid,
                                                elementView: {
                                                    _type: "org.uengine.modeling.model.Actor",
                                                    height: 100,
                                                    id: actorUuid,
                                                    style: "{}",
                                                    width: 100,
                                                    x: me.modelElements[elementUuid]['elementView'].x - 80,
                                                    y: me.modelElements[elementUuid]['elementView'].y - 40
                                                },
                                                innerAggregate: {
                                                    command: [],
                                                    event: [],
                                                    external: [],
                                                    policy: [],
                                                    view: [],
                                                },
                                                name: ele.actor,
                                                oldName: "",
                                                rotateStatus: false
                                            }
                                        }
                                    }
                                    if(me.generateCnt == bcIdx){
                                        if(ele.properties && ele.properties.length > 0){
                                            ele.properties.forEach(function (property, propertyIdx){
                                                var field = {
                                                    className: property.type,
                                                    isCopy: false,
                                                    isKey: propertyIdx == 0 ? true:false,
                                                    name: property.name,
                                                    nameCamelCase: changeCase.camelCase(property.name),
                                                    namePascalCase: changeCase.pascalCase(property.name),
                                                    _type: "org.uengine.model.FieldDescriptor"
                                                }
                                                if(me.modelElements[elementUuid]){
                                                    me.modelElements[elementUuid].fieldDescriptors.push(field)
                                                }
                                            })
                                        }
                                    }
                                })
                            }

                            var maxHeightVal = eventLength > commandLength ? eventLength:commandLength
                            if(maxHeightVal > bcMaxHeightVal){
                                bcMaxHeightVal = maxHeightVal
                                if(bcUuid && me.modelElements[bcUuid]){
                                    me.modelElements[bcUuid]["elementView"].height = me.modelElements[bcUuid]["elementView"].height > (bcMaxHeightVal * 110) + 200 ? me.modelElements[bcUuid]["elementView"].height:(bcMaxHeightVal * 110) + 200
                                    if(heightVal == 0){
                                        if(me.modelElements[bcUuid]["elementView"].height > 590){
                                            // console.log(bcUuid, ": " + me.modelElements[bcUuid]["elementView"].height - (220 + 50 * (bcMaxHeightVal - 4)))
                                            // me.modelElements[bcUuid]["elementView"].y = me.modelElements[bcUuid]["elementView"].height - (220 + 50 * (bcMaxHeightVal - 4))
                                            me.modelElements[bcUuid]["elementView"].y = me.modelElements[bcUuid]["elementView"].height/2 + 80
                                        } else {
                                            me.modelElements[bcUuid]["elementView"].y = 380
                                        }
                                    } 
                                    if(me.bcPosition[heightVal - 1]){
                                        me.modelElements[bcUuid]["elementView"].y = me.bcPosition[heightVal - 1].y + me.bcPosition[heightVal - 1].height/2 + 20 + me.modelElements[bcUuid]["elementView"].height/2
                                    } 
                                    if(!me.bcPosition[heightVal]){
                                        me.bcPosition[heightVal] = me.modelElements[bcUuid]["elementView"]
                                    } else {
                                        if(me.bcPosition[heightVal].height < me.modelElements[bcUuid]["elementView"].height){
                                            me.bcPosition[heightVal] = me.modelElements[bcUuid]["elementView"]
                                        }
                                    }
                                }
                            }    

                            aggMaxHeightVal = eventLength > commandLength ? eventLength:commandLength
                            
                            if(aggMaxHeightVal > 0){
                                if(me.modelElements[aggUuid]){
                                    me.modelElements[aggUuid]["elementView"].height = 400 > aggMaxHeightVal * 110 + aggMaxHeightVal * 8 ? 400:aggMaxHeightVal * 110 + aggMaxHeightVal * 8
                                    me.modelElements[aggUuid]["elementView"].y = me.modelElements[bcUuid]["elementView"].y
                                }
                            }

                            me.applyEntitiesToAggregate(me.modelElements[aggUuid], agg.enumerations, agg.valueObjects)
                        })
                    }
                })
                var relations = {}
                Object.keys(me.modelElements).forEach(function (key){
                    if(me.modelElements[key]._type == "org.uengine.modeling.model.Command" && (me.modelElements[key].outputEvents && me.modelElements[key].outputEvents.length > 0)){
                        me.modelElements[key].outputEvents.forEach(function (eventName){
                            Object.keys(me.modelElements).some(function (key2){
                                if(eventName == me.modelElements[key2].name){
                                    if(me.modelElements[key2]['aggregate'] && me.modelElements[key]['aggregate'].id == me.modelElements[key2]['aggregate'].id){
                                        var relUuid = me.uuid();
                                        relations[relUuid] = {
                                            _type: "org.uengine.modeling.model.Relation",
                                            from: key,
                                            hexagonalView: {
                                                _type: "org.uengine.modeling.model.RelationHexagonal",
                                                from: key,
                                                id: relUuid,
                                                needReconnect: true,
                                                style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                to: key2,
                                                value: null
                                            },
                                            name: "",
                                            id: relUuid,
                                            relationView: {
                                                from: key,
                                                id: relUuid,
                                                needReconnect: true,
                                                style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                to: key2,
                                                value: "[]"
                                            },
                                            sourceElement: me.modelElements[key],
                                            sourceMultiplicity: 1,
                                            targetElement: me.modelElements[key2],
                                            targetMultiplicity: 1,
                                            to: key2
                                        }
                                    }
                                }
                            })
                        })  
                    } 
                }); 
                if(me.state == 'end'){
                    // policy
                    if(modelValue["policies"]){
                        let isOrchestrationCnt = 0
                        modelValue["policies"].forEach(function (policy){
                            var isPolicyType = null
                            let policyUuid = me.uuid();
                            let refEle = null
                            let elementView = {}
                            let cmdInfo = []
                            let evnInfo = null

                            if(policy.commands && policy.commands.length > 0){
                                // !command ? add command:null
                                policy.commands.forEach(function (cmd){
                                    var cmdAggIdx = modelValue["boundedContext"][cmd.boundedContext]["aggregates"].findIndex(x => x.name == cmd.aggregate)
                                    if(modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx] && !modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"]){
                                        modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"] = {}
                                    }
                                    if(!modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command]){
                                        var elementUuid = me.uuid();
                                        me.modelElements[elementUuid] = {
                                            _type: "org.uengine.modeling.model.Command",
                                            outputEvents: null,
                                            aggregate: {
                                                id: modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["eleInfo"]["elementView"].id
                                            },
                                            author: me.userUid,
                                            boundedContext: {
                                                name: modelValue["boundedContext"][cmd.boundedContext]["eleInfo"].name, 
                                                id: modelValue["boundedContext"][cmd.boundedContext]["eleInfo"]["elementView"].id
                                            },
                                            controllerInfo: {
                                                apiPath: null,
                                                method: "PUT"
                                            },
                                            fieldDescriptors: [],
                                            id: elementUuid,
                                            description: null,
                                            elementView: {
                                                _type: "org.uengine.modeling.model.Command",
                                                height: 115,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 100,
                                                x: me.modelElements[modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["eleInfo"]["elementView"].id]["elementView"].x - 90, 
                                                y: me.modelElements[modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["eleInfo"]["elementView"].id]["elementView"].y + (modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"].length * 120) - 200, 
                                                "z-index": 999
                                            },
                                            hexagonalView: {
                                                _type: "org.uengine.modeling.model.CommandHexagonal",
                                                height: 0,
                                                id: elementUuid,
                                                style: "{}",
                                                width: 0,
                                                x: 0,
                                                y: 0
                                            },
                                            isRestRepository: true,
                                            name: cmd.command,
                                            nameCamelCase: changeCase.camelCase(cmd.command),
                                            namePascalCase: changeCase.pascalCase(cmd.command),
                                            namePlural: "",
                                            relationCommandInfo: [],
                                            relationEventInfo: [],
                                            restRepositoryInfo: {
                                                method: "POST"
                                            },
                                            rotateStatus: false,
                                            selected: false,
                                            trigger: "@PrePersist",
                                        }
                                        modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command] = {}
                                        modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command].eleInfo = me.modelElements[elementUuid]
                                    }
                                    if(modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command].eleInfo){
                                        cmdInfo.push(modelValue["boundedContext"][cmd.boundedContext]["aggregates"][cmdAggIdx]["commands"][cmd.command].eleInfo)            
                                    }
                                })

                                // add policy 
                                if(policy.triggerEvents && policy.triggerEvents.length > 0){
                                    var aggIdx
                                    var checkDiffAggName = policy.commands.find(x => x.aggregate != policy.commands[0].aggregate)
                                    if(policy.commands.length > 1 && checkDiffAggName){
                                        isPolicyType = "orchestration"
                                        refEle = policy.triggerEvents[0]
                                        aggIdx = modelValue["boundedContext"][refEle.boundedContext]["aggregates"].findIndex(x => x.name == refEle.aggregate)
                                        elementView = {
                                            height: 115,
                                            width: 100,
                                            x: modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["events"][refEle.event]["eleInfo"]["elementView"].x,
                                            y: me.modelElements[modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["eleInfo"]["elementView"].id]["elementView"].y + ((modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["events"].length + isOrchestrationCnt) * 120) - 200,
                                            id: policyUuid,
                                            style: "{}",
                                            _type: "org.uengine.modeling.model.Policy"
                                        }
                                        isOrchestrationCnt++;
                                        
                                    } else {
                                        isPolicyType = "choreography"
                                        refEle = policy.commands[0]
                                        aggIdx = modelValue["boundedContext"][refEle.boundedContext]["aggregates"].findIndex(x => x.name == refEle.aggregate)
                                        elementView = {
                                            height: 115,
                                            width: 100,
                                            x: modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["commands"][refEle.command]["eleInfo"]["elementView"].x - 80,
                                            y: modelValue["boundedContext"][refEle.boundedContext]["aggregates"][aggIdx]["commands"][refEle.command]["eleInfo"]["elementView"].y - 33,
                                            id: policyUuid,
                                            style: "{}",
                                            _type: "org.uengine.modeling.model.Policy"
                                        }
                                    }
                                    if(modelValue["boundedContext"][policy.triggerEvents[0].boundedContext]["aggregates"][aggIdx]["events"][policy.triggerEvents[0].event].eleInfo){
                                        evnInfo = modelValue["boundedContext"][policy.triggerEvents[0].boundedContext]["aggregates"][aggIdx]["events"][policy.triggerEvents[0].event].eleInfo
                                    }

                                    me.modelElements[policyUuid] = {
                                        author: me.userUid,
                                        boundedContext: {
                                            name: modelValue["boundedContext"][refEle.boundedContext]["eleInfo"].name, 
                                            id: modelValue["boundedContext"][refEle.boundedContext]["eleInfo"]["elementView"].id
                                        },
                                        description: null,
                                        elementView: elementView,
                                        fieldDescriptors: [],
                                        hexagonalView: {
                                            height: 20,
                                            id: policyUuid,
                                            style: "{}",
                                            subWidth: 100,
                                            width: 20,
                                            _type: "org.uengine.modeling.model.PolicyHexagonal"
                                        },
                                        isSaga: false,
                                        name: policy.name,
                                        displayName: policy[me.originalLanguage + "Name"],
                                        nameCamelCase: changeCase.camelCase(policy.name),
                                        namePascalCase: changeCase.pascalCase(policy.name),
                                        namePlural: "",
                                        oldName: "",
                                        rotateStatus: false,
                                        _type: "org.uengine.modeling.model.Policy"
                                    }                                    
                                }
                            }
                            

                            // add relation command.length
                            if(cmdInfo && cmdInfo.length > 0 && evnInfo){
                                cmdInfo.forEach(function (command){
                                    var relUuidPtoC = me.uuid();
                                    relations[relUuidPtoC] = {
                                        _type: "org.uengine.modeling.model.Relation",
                                        from: policyUuid,
                                        hexagonalView: {
                                            _type: "org.uengine.modeling.model.RelationHexagonal",
                                            from: policyUuid,
                                            id: relUuidPtoC,
                                            needReconnect: true,
                                            style: `{"arrow-start":"none","arrow-end":"none"}`,
                                            to: command["elementView"].id,
                                            value: null
                                        },
                                        name: "",
                                        id: relUuidPtoC,
                                        relationView: {
                                            from: policyUuid,
                                            id: relUuidPtoC,
                                            needReconnect: true,
                                            style: `{"arrow-start":"none","arrow-end":"none"}`,
                                            to: command["elementView"].id,
                                            value: "[]"
                                        },
                                        sourceElement: me.modelElements[policyUuid],
                                        sourceMultiplicity: 1,
                                        targetElement: me.modelElements[command["elementView"].id],
                                        targetMultiplicity: 1,
                                        to: command["elementView"].id
                                    }
                                })
                                var relUuidEtoP = me.uuid();
                                relations[relUuidEtoP] = {
                                    _type: "org.uengine.modeling.model.Relation",
                                    from: evnInfo["elementView"].id,
                                    hexagonalView: {
                                        _type: "org.uengine.modeling.model.RelationHexagonal",
                                        from: evnInfo["elementView"].id,
                                        id: relUuidEtoP,
                                        needReconnect: true,
                                        style: `{"arrow-start":"none","arrow-end":"none"}`,
                                        to: policyUuid,
                                        value: null
                                    },
                                    name: "",
                                    id: relUuidEtoP,
                                    relationView: {
                                        from: evnInfo["elementView"].id,
                                        id: relUuidEtoP,
                                        needReconnect: true,
                                        style: `{"arrow-start":"none","arrow-end":"none"}`,
                                        to: policyUuid,
                                        value: "[]"
                                    },
                                    sourceElement: me.modelElements[evnInfo["elementView"].id],
                                    sourceMultiplicity: 1,
                                    targetElement: me.modelElements[policyUuid],
                                    targetMultiplicity: 1,
                                    to: policyUuid
                                }

                            } 
                        })
                    }

                    // Payment, Money, Address, ....
                    

                    // aggregate
                    Object.keys(me.modelElements).forEach(function (key){
                        if(me.modelElements[key]._type == "org.uengine.modeling.model.Aggregate") {
                            me.modelElements[key].aggregateRoot.fieldDescriptors.forEach(function (fieldDescriptor) {

                                Object.keys(me.modelElements).forEach(function (uuid){
                                    if(me.modelElements[uuid]._type == "org.uengine.modeling.model.Aggregate" && key != uuid) {
                                        if(fieldDescriptor.className == me.modelElements[uuid].name) {
                                            var relUuidAtoA = me.uuid();
                                            relations[relUuidAtoA] = {
                                                _type: "org.uengine.modeling.model.Relation",
                                                from: key,
                                                hexagonalView: {
                                                    _type: "org.uengine.modeling.model.RelationHexagonal",
                                                    from: key,
                                                    id: relUuidAtoA,
                                                    needReconnect: true,
                                                    style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                    to: uuid,
                                                    value: null
                                                },
                                                name: "",
                                                id: relUuidAtoA,
                                                relationView: {
                                                    from: key,
                                                    id: relUuidAtoA,
                                                    needReconnect: true,
                                                    style: `{"arrow-start":"none","arrow-end":"none"}`,
                                                    to: uuid,
                                                    value: "[]"
                                                },
                                                sourceElement: me.modelElements[key],
                                                sourceMultiplicity: 1,
                                                targetElement: me.modelElements[uuid],
                                                targetMultiplicity: 1,
                                                to: uuid
                                            }
                                        }
                                    }
                                });
                            });
                        }
                    });
                }

                // if(option == 'end'){
                //     var elementsList = {}
                //     Object.keys(me.modelElements).forEach(function (key){
                //         var eleUuid = me.uuid();
                //         elementsList[eleUuid] = me.modelElements[key]
                //     })
                // } else {
                //     var elementsList = me.modelElements
                // }
                var obj = {
                    projectName: modelValue["serviceName"],
                    elements: me.modelElements,
                    relations: relations,
                    uiStyle: me.client.input.uiStyle
                }

                console.log("[*] DebeziumLogsTabGenerator가 생성한 값을 처리시킨 객체 결과: ", obj)
                return obj;
            } 
        } catch(e){
            console.log(e)
        }

        var obj = {
            projectName: modelValue ? modelValue["serviceName"] : "untitle",
            elements: me.modelElements ? me.modelElements : {},
            relations: relations ? relations : {},
            uiStyle: me.client.input.uiStyle
        }

        console.log("[*] DebeziumLogsTabGenerator가 생성한 값을 처리시킨 객체 결과(예외): ", obj)
        return obj;
    }


    applyEntitiesToAggregate(aggregate, enumerations, valueObjects) {
        const entities = aggregate.aggregateRoot.entities
        entities.elements = {}
        entities.relations = {}
        
        const ROOT_AGGREGATE_OBJECT = this.makeRootAggregateObject(aggregate)
        entities.elements[ROOT_AGGREGATE_OBJECT.id] = ROOT_AGGREGATE_OBJECT

        if(enumerations && enumerations.length > 0) {
            let enumerateXIndex = 0

            for(let enumeration of enumerations) {
                const ENUMERATE_OBJECT = this.makeEnumerateObject(enumeration, enumerateXIndex)
                entities.elements[ENUMERATE_OBJECT.id] = ENUMERATE_OBJECT
                enumerateXIndex += 1
                
                const RELATION_OBJECT = this.makeRelationObject(ROOT_AGGREGATE_OBJECT, ENUMERATE_OBJECT)
                aggregate.aggregateRoot.entities.relations[RELATION_OBJECT.id] = RELATION_OBJECT
            }
        }

        if(valueObjects && valueObjects.length > 0) {
            let valueObjectXIndex = 0

            for(let valueObject of valueObjects) {
                const VALUE_OBJECT = this.makeValueObject(valueObject, valueObjectXIndex)
                entities.elements[VALUE_OBJECT.id] = VALUE_OBJECT
                valueObjectXIndex += 1
                
                const RELATION_OBJECT = this.makeRelationObject(VALUE_OBJECT, ROOT_AGGREGATE_OBJECT)
                aggregate.aggregateRoot.entities.relations[RELATION_OBJECT.id] = RELATION_OBJECT
            }
        }
    }

    makeRootAggregateObject(aggregate) {
        const UUID = this.uuid()

        return {
            "_type": "org.uengine.uml.model.Class",
            "id": UUID,
            "name": aggregate.name,
            "namePascalCase": aggregate.name,
            "nameCamelCase": aggregate.name,
            "namePlural": aggregate.name + "s",
            "fieldDescriptors": aggregate.aggregateRoot.fieldDescriptors,
            "operations": [],
            "elementView": {
                "_type": "org.uengine.uml.model.Class",
                "id": UUID,
                "x": 350,
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
            "parentId": aggregate.id
        }
    }

    makeEnumerateObject(entity, xIndex) {
        const UUID = this.uuid()
        const ITEMS = entity.items.map(item => {
            return {
                "value": item
            }
        })

        return {
            "_type": "org.uengine.uml.model.enum",
            "id": UUID,
            "name": entity.name,
            "nameCamelCase": entity.name,
            "namePascalCase": entity.name,
            "elementView": {
                "_type": "org.uengine.uml.model.enum",
                "id": UUID,
                "x": 350 + (xIndex * 250),
                "y": 400,
                "width": 200,
                "height": 100,
                "style": "{}",
                "titleH": 50,
                "subEdgeH": 50
            },
            "selected": false,
            "items": ITEMS,
            "useKeyValue": false,
            "relations": []
        }
    }

    makeValueObject(valueObject, xIndex) {
        const UUID = this.uuid()
        const FIELD_DESCRIPTORS = valueObject.properties
            .filter(property => !(property.isForeignProperty) || property.isForeignProperty === false || property.isForeignProperty === "false")
            .map(property => {
                return {
                    "className": property.type,
                    "isKey": property.isKey,
                    "label": "- " + property.name + ": " + property.type,
                    "name": property.name,
                    "nameCamelCase": property.name,
                    "namePascalCase": property.name,
                    "_type": "org.uengine.model.FieldDescriptor"
                }
            })

        return {
            "_type": "org.uengine.uml.model.vo.Class",
            "id": UUID,
            "name": valueObject.name,
            "namePascalCase": valueObject.name,
            "nameCamelCase": valueObject.name,
            "fieldDescriptors": FIELD_DESCRIPTORS,
            "operations": [],
            "elementView": {
                "_type": "org.uengine.uml.model.vo.address.Class",
                "id": UUID,
                "x": 350 + (xIndex * 250),
                "y": 600,
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
            "namePlural": valueObject.name + "s",
            "isAbstract": false,
            "isInterface": false
        }
    }

    makeRelationObject(fromObject, toObject) {
        const UUID = this.uuid()
        fromObject.relations.push(UUID)
        toObject.relations.push(UUID)

        return {
            "name": toObject.name + "_id",
            "id": UUID,
            "_type": "org.uengine.uml.model.Relation",
            "sourceElement": fromObject,
            "targetElement": toObject,
            "from": fromObject.id,
            "to": toObject.id,
            "selected": false,
            "relationView": {
                "id": UUID,
                "style": "{\"arrow-start\":\"none\",\"arrow-end\":\"none\"}",
                "from": fromObject.id,
                "to": toObject.id,
                "needReconnect": true
            },
            "sourceMultiplicity": "1",
            "targetMultiplicity": "1",
            "relationType": "Association",
            "fromLabel": "",
            "toLabel": ""
        }
    }


    uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    resetUUID() {
        this.sequenceForUUID = 0;
    }

    createBoundedContext(key, json, x, y, portNumber){
        let me = this
        let bcUuid = 'bc-' + key.replaceAll("/", "-")

        return {
            _type: "org.uengine.modeling.model.BoundedContext",
            aggregates: [],
            author: me.userUid,
            description: null,
            id: bcUuid,
            elementView: {
                _type: "org.uengine.modeling.model.BoundedContext",
                height: 590,
                id: bcUuid,
                style: "{}",
                width: 560,
                x: x, //400 + ((bcCnt - 1) * 600),
                y: y, //heightVal != 0 && (me.bcPosition[heightVal - 1]) ? me.bcPosition[heightVal - 1].height/2 + me.bcPosition[heightVal - 1].y + 335:380 + (heightVal * 610)
            }, 
            gitURL: null,
            hexagonalView: {
                _type: "org.uengine.modeling.model.BoundedContextHexagonal",
                height: 350,
                id: bcUuid,
                style: "{}",
                width: 350,
                x: 235,
                y: 365
            },
            members: [],
            name: key,
            displayName: json[me.originalLanguage + "Name"],
            oldName: "",
            policies: [],
            portGenerated: portNumber,
            preferredPlatform: "template-spring-boot",
            preferredPlatformConf: {},
            rotateStatus: false,
            tempId: "",
            templatePerElements: {},
            views: []
        }
    }

    createEvent(ele, elementUuid, x, y){
        let me = this
        return {
            alertURL: "/static/image/symbol/alert-icon.png",
            author: me.userUid,
            checkAlert: true,
            description: null,
            id: elementUuid,
            elementView: {
                angle: 0,
                height: 115,
                id: elementUuid,
                style: "{}",
                width: 100,
                x: x, 
                y: y, 
                _type: "org.uengine.modeling.model.Event"
            },
            fieldDescriptors: [],
            hexagonalView: {
                height: 0,
                id: elementUuid,
                style: "{}",
                width: 0,
                x: 0,
                y: 0,
                _type: "org.uengine.modeling.model.EventHexagonal"
            },
            name: ele.name,
            displayName: ele[me.originalLanguage + 'Name'],
            nameCamelCase: changeCase.camelCase(ele.name),
            namePascalCase: changeCase.pascalCase(ele.name),
            namePlural: "",
            relationCommandInfo: [],
            relationPolicyInfo: [],
            rotateStatus: false,
            selected: false,
            trigger: "@PostPersist",
            _type: "org.uengine.modeling.model.Event"
        }

    }
}


module.exports = DebeziumLogsTabGenerator;