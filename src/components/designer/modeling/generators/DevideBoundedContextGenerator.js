const JsonAIGenerator = require("./JsonAIGenerator");

class DevideBoundedContextGenerator extends JsonAIGenerator {

    constructor(client){
        super(client);

        this.model = "gpt-4o"
        this.temperature = 0.5
    }

    createPrompt(){
        return `
Analyze the following requirements and divide them into multiple Bounded Contexts (minimum 2).

Focus on this division aspect:
${this.client.input['devisionAspect']}

Requirements:
${this.client.input['userStory']}

Key principles:
- High cohesion, low coupling
- Group related behaviors and data together
- Minimize inter-context dependencies

Define relationships between contexts using these types:
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
    "thoughts": "Explain why each relationship type was chosen and how the contexts interact with each other"
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