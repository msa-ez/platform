const JsonAIGenerator = require("./JsonAIGenerator");

class DevideBoundedContextGenerator extends JsonAIGenerator {

    constructor(client){
        super(client);

        this.model = "gpt-4o"
        this.temperature = 0.5
        this.generatorName = 'DevideBoundedContextGenerator'
    }

    createPrompt(){
        return `
Analyze the following requirements and divide them into multiple Bounded Contexts (minimum 2).

Focus on this division aspect:
${this.client.input['devisionAspect']}

Requirements:
- userStory: ${this.client.input['requirements']['userStory']}
- ddl: ${this.client.input['requirements']['ddl']}

${this.client.input['feedback'] ? this.feedbackPrompt() : ''}

Key principles:
- High cohesion, low coupling
- Group related behaviors and data together
- Minimize inter-context dependencies

Define relationships between contexts using these types:
1. Conformist: A relationship where the downstream system follows the upstream system's model exactly
2. Share Kernel: A relationship where two systems share a common model
3. Anti-corruption: A relationship where the downstream system transforms the upstream system's model for its use
4. Separate Ways: A relationship where two systems are completely independent
5. Customer-Supplier: A relationship where the upstream system provides services to the downstream system

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
            "aggregates":[ // Aggregates that can be extracted from this Bounded Context.
                {
                    "name":"name of Aggregate in PascalCase",
                    "alias":"alias of Aggregate in language of Requirements"
                }
            ],
            "requirements":[ // Use all of the requirements(userStory, DDL) context that are relevant to this Bounded Context.
                {
                    "type":"userStory",
                    "text":"Original requirements text, containing only the problem domain relevant to this Bounded Context, copied verbatim"
                },
                {
                    "type":"ddl",
                    "text":"Original requirements text, containing only the problem domain relevant to this Bounded Context, copied verbatim"
                }
            ]
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
        return model;
    }

}

module.exports = DevideBoundedContextGenerator;