const JsonAIGenerator = require("./JsonAIGenerator");

class DevideBoundedContextGenerator extends JsonAIGenerator {

    constructor(client){
        super(client);

        this.model = "gpt-4o"
        this.temperature = 0.3
    }

    createPrompt(){
        return `
다음 요구사항을 여러개의 Bounded Context로 적절하게 분리해라. 요구사항의 문제영역을 2개 이상으로 적절히 분리하면 됀다.

아래의 분해관점을 중점으로 분리해라:
${this.client.input['devisionAspect']}

요구사항:
${this.client.input['userStory']}


- 이 때, 분리 기준은 응집도를 높이고 결합도를 낮추는 것이다.
- 결과적으로 업무 전문성 관점, 프로세스 관점에 따라 행위와 사용되는 데이터가 응집도있게 하나의 Bounded Context에 들어가야한다.
- 결합도 측면에서는 하나의 행위를 함에 있어 다른 Bounded Context의 데이터를 참고해야 하는 일이 최소화(간섭이 아예 없거나, 업무의 결과만 받아오는 방식) 되어야 하므로, 결과적으로 Chatty Microservice를 만들지 않는다.

각 Bounded Context 간의 관계는 다음 타입들 중 가장 적절한 것을 선택하여 정의하라:
1. Confirmist: 하위 시스템이 상위 시스템의 모델을 그대로 따르는 관계
2. Share Kernel: 두 시스템이 공통의 모델을 공유하는 관계
3. Anti-corruption: 하위 시스템이 상위 시스템의 모델을 변환하여 사용하는 관계
4. Separate Ways: 두 시스템이 완전히 독립적인 관계
5. Customer-Supplier: 상위 시스템이 하위 시스템에 서비스를 제공하는 관계

The format must be as follows:
{
    "boundedContexts":
    [
        {
            "name":"name of Bounded Context in PascalCase",
            "alias":"alias of Bounded Context in korean",
            "aggregates":[ // Aggregates that can be extracted from this Bounded Context.
                {
                    "name":"name of Aggregate in PascalCase",
                    "alias":"alias of Aggregate in korean"
                }
            ],
            "requirements":"기존의 요구사항 원문 중, 이 Bounded Context에 해당하는 문제영역만 기존 텍스트 그대로"
        }
      ],
      "relations":
      [
        {
            "name":"Bounded Context간의 의존관계 명칭",
            "type": "Confirmist" || "Share Kernel" || "Anti-corruption" || "Seperate Ways" || "Customer-Supplier",
            "upStream": "name of upstream Bounded Context",
            "downStream": "name of downstream Bounded Context"
        }
    ],
    "thoughts": "Bounded Contexte들의 도출 경위에 대한 설명 (응집도&결합도 측면, 업무 전문성, 기술 응집도, 페르소나 기준 등)"
}
 `
    }

    createModel(text){
        if (text.startsWith('```json')) {
            text = text.slice(7);
        }
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }

        let model = super.createModel(text + '"');

        model['devisionAspect'] = this.client.input['devisionAspect'];
        
        return model;
    }

}

module.exports = DevideBoundedContextGenerator;