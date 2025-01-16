const JsonAIGenerator = require("./JsonAIGenerator");

class DevideBoundedContextGenerator extends JsonAIGenerator {

    constructor(client){
        super(client);

        this.model = "gpt-4o"
        this.temperature = 0.3
        this.generatorName = 'DevideBoundedContextGenerator'
    }

    createPrompt(){
        return `
Analyze the following requirements and divide them into multiple Bounded Contexts (minimum 2).

Focus on this division aspect:
${this.client.input['devisionAspect']}

Generate Number of Bounded Contexts:
${this.client.input['generateOption']['numberOfBCs']}

Additional requirements:
${this.client.input['generateOption']['additionalOptions']}

Requirements:
${this.summaryRequirements()}
${this.ddlPrompt()}

${this.client.input['feedback'] ? this.feedbackPrompt() : ''}

Key principles:
- High cohesion, low coupling
- Group related behaviors and data together
- Minimize inter-context dependencies

Language Instruction of Output:
- Use the same national language as the Requirements at thoughts, context of explanations, alias, requirements.
- When referring to bounded context in explanations, use alias.
- name must be written in English PascalCase.

The format must be as follows:
{
    "boundedContexts":
    [
        {
            "name":"name of Bounded Context in PascalCase",
            "alias":"alias of Bounded Context in language of Requirements",
            "importance": "Core Domain" || "Supporting Domain" || "Generic Domain",
            "implementationStrategy": "Rich Domain Model" || "Domain Service" || "Transaction Script" || "CQRS",
            "aggregates":[ // Aggregates that can be extracted from this Bounded Context.
                {
                    "name":"name of Aggregate in PascalCase",
                    "alias":"alias of Aggregate in language of Requirements"
                }
            ],
            ${this.requirementsPrompt()}
        }
      ],
      "relations":
      [
        {
            "name":"name of relation between Bounded Contexts",
            "type": "Confirmist" || "Share Kernel" || "Anti-corruption" || "Seperate Ways" || "Customer-Supplier",
            "upStream": {
                "name":"name of upstream Bounded Context",
                "alias":"alias of upstream Bounded Context in language of Requirements"
            },
            "downStream": {
                "name":"name of downstream Bounded Context",
                "alias":"alias of downstream Bounded Context in language of Requirements"
            }
        }
    ],
    "thoughts": "explanations of how Bounded Contexts were derived (cohesion & coupling, domain expertise, technical cohesion, persona-based, etc.)",
    "explanations": 
    [
        {
            "sourceContext": "Source Bounded Context alias",
            "targetContext": "Target Bounded Context alias",
            "relationType": "Relationship type",
            "reason": "Explanation of why this type was chosen",
            "interactionPattern": "Description of how these contexts interact (e.g., Pub/Sub, Req/Res, REST, gRPC, etc.)"
        }
    ]
}
 `
    }

    feedbackPrompt(){
        return `
You previously created a model like this: 
${JSON.stringify(this.client.input['previousAspectModel'], null, 2)}

Please refer to the added feedback below to create a new model.

Feedback:
${this.client.input['feedback']}
`
    }

    ddlPrompt(){
        if(this.client.input['requirements']['ddl']!=""){
            return `
- ddl: ${this.client.input['requirements']['ddl']}`;
        }else{
            return '';
        }
    }

    summaryRequirements(){
        if(this.client.input['requirements']['summarizedResult']!=""){
            return `
Below is the Bounded Context list that summarize the requirements.
Should be used all of the Bounded Contexts.
- Bounded Context list: ${this.client.input['requirements']['summarizedResult']}
            `;
        }else{
            return `
- userStory: ${this.client.input['requirements']['userStory']}
            `;
        }
    }

    requirementsPrompt(){
        if(this.client.input['requirements']['summarizedResult']==""){
            return `"requirements":[ // Use all of the requirements(userStory, DDL) context that are relevant to this Bounded Context.
                    {
                        "type":"userStory",
                    "text":"Original requirements text, containing only the problem domain relevant to this Bounded Context, copied verbatim"
                },
                {
                    "type":"ddl",
                    "text":"Original requirements text, containing only the problem domain relevant to this Bounded Context, copied verbatim"
                }
            ]`;
        }else{
            return `"requirements":[ ] // must be empty`;
        }
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
        
        if(this.state === "end")
            console.log(`[*] ${this.client.input['devisionAspect']}의 모델 생성이 완료됨`, {model, text, input: this.client.input})
        else
            console.log(`[*] ${this.client.input['devisionAspect']}의 모델 생성이 진행중임`, {textLength: text.length})

        // 요약 결과가 있으면 요약 결과를 기반으로 매핑 진행하므로 제거
        if(this.client.input['requirements']['summarizedResult']!=""){
            model['boundedContexts'].forEach(boundedContext => {
                boundedContext['requirements'] = []
            })
        }

        return model;
    }

}

module.exports = DevideBoundedContextGenerator;