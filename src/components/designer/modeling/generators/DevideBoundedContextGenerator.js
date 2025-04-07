const JsonAIGenerator = require("./JsonAIGenerator");

class DevideBoundedContextGenerator extends JsonAIGenerator {

    constructor(client){
        super(client, {}, "thinkingModel");

        this.generatorName = 'DevideBoundedContextGenerator'
    }

    createPrompt(){
        return `
Analyze the following requirements and divide them into multiple Bounded Contexts.
${this.ollamaPrompt()}

Focus on these aspects:
${this.client.input['devisionAspect']}

${this.aspectDetails()}

Maximum Number of Bounded Contexts:
${this.client.input['generateOption']['numberOfBCs']}

Additional requirements:
${this.client.input['generateOption']['additionalOptions']}

${this.getPBCPrompt()}

Requirements:
${this.summaryRequirements()}

Actors:
${JSON.stringify(this.client.input['requirements']['analysisResult']['actors'], null, 2)}

Events:
${JSON.stringify(this.client.input['requirements']['analysisResult']['events'], null, 2)}

${this.client.input['feedback'] ? this.feedbackPrompt() : ''}

Key principles:
- High cohesion, low coupling
- Group related behaviors and data together
- Minimize inter-context dependencies
- Seize event's action range to create bounded context
- Seize relation between events to create flow
- User-facing domains should be considered as Core Domain
- Generic domains can have high complexity despite low differentiation

Domain Classification Guidelines:
Core Domain:
- Direct impact on business competitive advantage
- User-facing functionality
- Strategic importance to business goals
- Differentiation score typically 0.8-1.0
- Complexity can vary (0.4-1.0)

Supporting Domain:
- Enables core domain functionality
- Internal business processes
- Medium business impact
- Differentiation score typically 0.4-0.7
- Complexity can vary (0.3-0.9)

Generic Domain:
- Common functionality across industries
- Can be replaced by third-party solutions
- Differentiation score 0.0-0.3
- Complexity can vary (0.2-1.0)

Scoring Instructions:
- complexity: Score from 0.0 to 1.0 indicating the technical implementation difficulty
  - Consider: Technical dependencies, business rules complexity, data consistency requirements
  - High score possible even for Generic domains
- differentiation: Score from 0.0 to 1.0 indicating business differentiation value
  - Consider: Competitive advantage, user interaction, strategic importance
  - User-facing domains should have higher scores

Implementation Strategy Guidelines:
- Core Domain: Rich Domain Model
- Supporting Domain: Transaction Script or Active Record
- Generic Domain: Active Record or PBC: (pbc-name)

${this.relationGuidelines()}

Language Instruction of Output:
- Use the "same national language" as the Requirements at thoughts, context of explanations, alias, requirements.
- When referring to bounded context in explanations, use alias.
- name of Bounded Context must be written in English PascalCase.

The format must be as follows:
{
    "boundedContexts":
    [
        {
            "name":"name of Bounded Context in PascalCase",
            "alias":"alias of Bounded Context in language of Requirements",
            "importance": "Core Domain" || "Supporting Domain" || "Generic Domain",
            "complexity": "score of complexity", // 0.0 ~ 1.0
            "differentiation": "score of differentiation", // 0.0 ~ 1.0
            "implementationStrategy": "Event Sourcing" || "Rich Domain Model" || "Transaction Script" || "Active Record" || "PBC: (pbc-name)",
            "aggregates":[ // Aggregates that can be extracted from this Bounded Context.
                {
                    "name":"name of Aggregate in PascalCase",
                    "alias":"alias of Aggregate in language of Requirements"
                }
            ],
            "events":[ ], // All events that composed from this Bounded Context.
            "requirements":[ ] // Must be empty

        }
      ],
      "relations":
      [
        {
            "name":"name of relation between Bounded Contexts",
            "type":${this.relationTypePrompt()},
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

    summaryRequirements(){
        if(this.client.input['requirements']['summarizedResult']!=""){
            return `
Below is the Bounded Context list that summarize the requirements.
Should be used all of the Bounded Contexts.
- Bounded Context list: ${this.client.input['requirements']['summarizedResult']}
            `;
        }else{
            return `
- userStory: ${JSON.stringify(this.client.input['requirements']['userStory'], null, 2)}
            `;
        }
    }

    requirementsPrompt(){
        if(this.client.input['requirements']['summarizedResult']==""){
            return `"requirements":[ // Use all of the requirements(userStory, DDL) context that are relevant to this Bounded Context.
                    {
                        "type":"userStory",
                        "text":"Original requirements text, containing all of the problem domain relevant to this Bounded Context, copied verbatim"
                    }
            ]`;
        }else{
            return `"requirements":[ ] // must be empty`;
        }
    }

    getPBCPrompt(){
        return `
IMPORTANT - PBC MATCHING RULE:
Before creating any bounded context, first check if the functionality already exists in the available PBCs.
If a functionality matches with any available PBC, you MUST:
1. Create it as a "Generic Domain" bounded context
2. Set its implementation strategy to "PBC: [pbc-name]"
3. Bounded context name of PBC must be written it as is pbc name.
This rule takes precedence over all other domain classification rules.

Available Pre-Built Components (PBCs):
The following PBCs are available for implementation strategies:
${JSON.stringify(this.client.input['requirements']['pbcInfo'], null, 2)}
        `
    }

    ollamaPrompt(){
        if(this.modelInfo.vendor === 'ollama'){
            return `
Focus directly on generating the required JSON output with minimal intermediate thinking.
Always use the extact keys specified in the JSON format.
Must not be missing information that is required in the JSON format.

1. Required JSON Structure:
{
    "boundedContexts": [...],
    "relations": [...],
    "thoughts": "...",
    "explanations": [...]
}

2. For "relations" array, each object must have:
{
    "name": "...",
    "type": "Conformist" || "Shared Kernel" || "Anti-corruption" || "Seperate Ways" || "Customer-Supplier",
    "upStream": {
        "name": "...",
        "alias": "..."
    },
    "downStream": {
        "name": "...",
        "alias": "..."
    }
}
        
        `;
        }else{
            return '';
        }
    }

    aspectDetails(){
        if (this.client.input['generateOption']['aspectDetails']) {
            return `Details of the aspect:
When determining and explaining the bounded contexts to be separated, please consider and reflect the following specific requirements for each aspect:

${this.client.input['generateOption']['aspectDetails']['organizationalAspect'] ? 
`- Organization Structure: ${this.client.input['generateOption']['aspectDetails']['organizationalAspect']}
    (Please reflect this team structure when separating bounded contexts)` : ''}

${this.client.input['generateOption']['aspectDetails']['infrastructureAspect'] ? 
`- Infrastructure Environment: ${this.client.input['generateOption']['aspectDetails']['infrastructureAspect']}
    (Please consider these technical requirements when defining bounded contexts)` : ''}

Important: In the "thoughts" section of your response, please explicitly explain how these specific organizational and infrastructure requirements influenced your bounded context separation decisions.
`;
        } else {
            return '';
        }
    }

    relationTypePrompt(){
        if(this.client.input['generateOption']['isProtocolMode']){
            return `"Request/Response || Pub/Sub"`;
        }else{
            return `"Conformist" || "Shared Kernel" || "Anti-corruption" || "Seperate Ways" || "Customer-Supplier"`;
        }
    }

    relationGuidelines(){
        if(this.client.input['generateOption']['isProtocolMode']){
            return `
Relation Guidelines:
- All Bounded Contexts must have at least one relation
- Event-driven architecture is preferred for loose coupling 
- Relation Type Rule: All relation types must use 'Pub/Sub' pattern. But, only Generic domains as downstream MUST use 'Request/Response' pattern
        `
        }else{
            return ``
        }
    }

    createModel(text){
        try{
            text = text.trim();
            if (text.startsWith('```json')) {
                text = text.slice(7);
            }
            if (text.endsWith('```')) {
                text = text.slice(0, -3);
            }

            let model = super.createModel(text);

            if(model){
                model['devisionAspect'] = this.client.input['devisionAspect'];
                
                if(this.state === "end")
                    console.log(`[*] ${this.client.input['devisionAspect']}의 모델 생성이 완료됨`, {model, text, input: this.client.input})
                else
                    console.log(`[*] ${this.client.input['devisionAspect']}의 모델 생성이 진행중임`, {textLength: text.length})

                // 요약 결과가 있으면 요약 결과를 기반으로 매핑 진행하므로 제거
                // if(this.client.input['requirements']['summarizedResult']!=""){
                //     model['boundedContexts'].forEach(boundedContext => {
                //         boundedContext['requirements'] = []
                //     })
                // }

                // COT 추가
                if(this.parsedTexts.think){
                    model['cotThink'] = this.parsedTexts.think
                }

                return model;
            }else{
                let model = {
                    [this.client.input['devisionAspect']]:{
                        "boundedContexts":[],
                        "relations":[],
                        "thoughts":"",
                        "explanations":[]
                    }
                }

                // COT 추가
                if(this.parsedTexts.think){
                    model[this.client.input['devisionAspect']]['cotThink'] = this.parsedTexts.think
                }

                return model
            }
        }catch(e){
            console.log(e)
            let model = {
                [this.client.input['devisionAspect']]:{
                    "boundedContexts":[],
                    "relations":[],
                    "thoughts":"",
                    "explanations":[]
                }
            }
            return model
        }
    }

}

module.exports = DevideBoundedContextGenerator;