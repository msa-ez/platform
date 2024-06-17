const ESGenerator = require("../ESGenerator");
const JsonAIGenerator = require("../JsonAIGenerator");
let partialParse = require('partial-json-parser');
let changeCase = require('change-case');

class DebeziumLogsTabGenerator extends ESGenerator{
    constructor(client){
        super(client);
    }
    
    createPrompt(userProps){
        return (
            this.getSystemPrompt() +
            this.getUserPrompt(userProps.ServiceName, userProps.DebeziumLogs)
        )
    }

    createModel(text){
        return super.createModel(text)
    }


    getSystemPrompt() {
        return `
당신은 특정 시스템의 데이터베이스에서 발생하는 Debezium CDC 트랜젝션 로그를 해석해서 DDD Aggregate 방식으로 이벤트 스토밍 모델 설계를 위한 Json 객체를 반환해야 합니다.


다음 규칙을 따라서 작성해주세요.
1. 제공된 Debezium CDC 트랜젝션에서 발견된 속성 및 Bounded Context에 대해서만 생성해주세요. 그외의 추가적인 속성이나 Bounded Context를 추측해서 추가하지 마세요.
2. 하나의 Bounded Context에 반드시 하나의 Aggregate가 속하도록 만들어주세요.
3. 유저 관리나 인증과 관련된 Bounded Context를 만들지 말아주세요.
4. 각 BoundedContext는 서로와 상호작용합니다. 각 BoundedContext는 도메인 이벤트가 발생하면, 다른 BoundedContext의 정책을 호출하는 방식으로 상호작용을 할 수 있습니다.
5. "name"으로 지정된 속성은 반드시 영어로 작성되어야 합니다.
6. 출력되는 Json 객체에는 주석을 절대로 작성하면 안됩니다.


당신이 반환해야 하는 형식은 다음과 같습니다.
{
    // 당신은 더 퀄리티 있는 답변을 위해서 먼저 Debezium CDC 트랜젝션에 있는 각 테이블의 속성, 용도, 해당 테이블에 대한 각각의 엑터들의 사용 케이스들을 미리 작성합니다.
    "tables": [
        {
            "name": "tableName",
            "properties": [
                {
                    "name": "propertyName",
                    "type": "propertyType"
                }
            ],
            "purpose": "테이블의 용도",
            "usecases": [
                {
                    "actor": "액터 이름", // 주어진 서비스를 사용하는 액터의 이름을 적습니다. 예를 들어서 "사용자", "관리자" 등이 있을 수 있습니다.
                    "useCase": "사용 케이스 이름" // 해당 엑터가 해당 테이블을 사용하는 사용 케이스의 이름을 적습니다. 예를 들어서 "주문 생성", "주문 취소" 등이 있을 수 있습니다.
                }
            ]
        }
    ],

    // 당신은 위에서 작성한 tables에 대한 내용을 토대로 아래에 이벤트 스토밍과 관련된 설계 내용들을 작성합니다.
    "serviceName": "ServiceName", // Service 이름은 반드시 영어로 작성되어야 하고, 공백이 허용되지 않습니다. 대신 "-"를 사용해주세요.
    "actors": ["액터 이름"], // 주어진 서비스를 사용하는 액터의 이름을 적습니다. 예를 들어서 "사용자", "관리자" 등이 있을 수 있습니다.

    "boundedContext": {
        // Bounded Context는 반드시 하나의 aggregate를 가져아 합니다.
        // Bounded Context의 이름은 반드시 소문자로 작성되어야 하며, 공백이 허용되지 않습니다. 대신 "-"를 사용해주세요.
        "bounded-context-name": {  
            "${this.originalLanguage}Name: "${this.originalLanguage} 언어로 작성된 Bounded Context의 이름", 
            "aggregates": [ 
                {
                    "name": "AggregateName",  // Aggregate 이름은 반드시 영어로 작성해야 하고, Pascal-Case 표기법으로 작성해야 합니다.
                    "${this.originalLanguage}Name: "${this.originalLanguage} 언어로 작성된 Aggregate의 이름", 
                    "${this.originalLanguage}Description: "${this.originalLanguage} 언어로 작성된 Aggregate에 대한 설명", 

                    ${this.generationOptions.ui ? `
                    "uiStyle":{
                        "layout": "CARD" | "GRID"  | "LIST-ITEM",
                        "nameProperty": "property name for representing the object",
                        "imageUrlProperty":"property name for representing image url if exists",
                        "icon": "material design icon font name for representing this aggregate data",
                        "isRepresentingUser": true | false
                    },
                    `: ``}

                    "properties": [
                        {
                            "name": "propertyName", // Property 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                            "${this.originalLanguage}Name: "${this.originalLanguage} 언어로 작성된 Property 이름", 

                            // Property 타입은 다음 2가지중 하나에 해당되어야 합니다. 
                            // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다.
                            // 2. 다음 같은 값들 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                            "type": "PropertyType",

                            "isKey": "true이거나 정의되지 않아야 함", // properties중 오직 하나만 isKey가 true로 설정되어야 합니다.
                            ${this.generationOptions.ui ? `
                            "uiStyle":{
                                "inputUI": "TEXT" | "SELECT" | "TEXTAREA" // 속성 값에 대해서 적절한 UI 스타일을 골라야 합니다.
                            }`:``}

                            "options" : ["option1", "option2"] // 만약 선택 가능한 옵션이 있다면, 이를 나열합니다.
                        }
                    ],

                    "commands": [
                        {
                            "name": "commandName", // Command 이름은 반드시 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                            "${this.originalLanguage}Name: "${this.originalLanguage} 언어로 작성된 Command 이름",

                            ${this.generationOptions.properties ? `
                            "properties": [
                                {
                                    "name": "propertyName", // Property 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                                    // Property 타입은 다음 2가지중 하나에 해당되어야 합니다. 
                                    // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다.
                                    // 2. 다음 같은 값들 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                                    "type": "PropertyType", 
                                    "isKey": "true이거나 정의되지 않아야 함" // properties중 오직 하나만 isKey가 true로 설정되어야 합니다.
                                }
                            ],
                            `:``}

                            "api_verb": "POST" | "DELETE" | "PUT",
                            "isCreation": true | false, // 이 커멘드가 Aggregate에 새로운 인스턴스를 생성하는지 여부를 나타내는 값입니다.
                            "actor": "액터 이름",
                            "outputEvents": ["이벤트 이름"],

                            ${this.generationOptions.ui ? `
                            "uiStyle":{
                                "icon": "이 커맨드를 나타내는 Material design icon font name"
                            }`:``}

                        }
                    ],
                    
                    "events": [
                        {
                            "name": "eventName", // Event 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                            "${this.originalLanguage}Name: "${this.originalLanguage} 언어로 작성된 이벤트 이름", 

                            ${this.generationOptions.properties ? `
                            "properties": [
                                {
                                    "name": "propertyName", // Property 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
                                    // Property 타입은 다음 2가지중 하나에 해당되어야 합니다. 
                                    // 1. 이미 잘 알려진 Java 클래스 이름을 사용할 수 있습니다.
                                    // 2. 다음 같은 값들 중 하나를 사용할 수 있습니다. : Address, Portrait, Rating, Money, Email
                                    "type": "PropertyType",
                                    "isKey": "true이거나 정의되지 않아야 함" // properties중 오직 하나만 isKey가 true로 설정되어야 합니다.
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
    "policies": [
        {
            "boundedContext": "이 정책이 속하는 Bounded Context의 이름",
            "name": "policyName", // Policy 이름은 반드시 영어로 작성해야 하고, Camel-Case 표기법으로 작성해야 합니다.
            "${this.originalLanguage}Name": "${this.originalLanguage} 언어로 작성된 Policy 이름",

            // 다음 이벤트들이 여기서 정의된 정책을 호출할 수 있습니다.
            "triggerEvents":[
                {
                    "boundedContext": "이벤트가 발생하는 Bounded Context의 이름",
                    "aggregate": "이벤트가 발생하는 Aggregate 이름",
                    "event": "대상 이벤트 이름"
                }
            ],

            // 다음 Command들이 여기서 정의된 정책을 호출할 수 있습니다.
            "commands":[
                {
                    "boundedContext": "Command가 실행되는 Bounded Context의 이름",
                    "aggregate": "Command가 실행되는 Aggregate 이름",
                    "command": "대상 Command 이름"
                }
            ]
        }
    ]`:``} 
}`
    }

    getUserPrompt(serviceName, debeziumLogs) {
        return (
`
[INPUT]
- 목표 시스템: ${serviceName}
- 해당 시스템의 Debezium CDC 트랜젝션 로그
${debeziumLogs}

[OUTPUT]
`
)
    }
}


module.exports = DebeziumLogsTabGenerator;