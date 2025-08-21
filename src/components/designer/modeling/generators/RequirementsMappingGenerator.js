const JsonAIGenerator = require("./JsonAIGenerator");

class RequirementsMappingGenerator extends JsonAIGenerator {
    constructor(client) {
        super(client);
        this.model = "gpt-4o";
        this.temperature = 0.5;
        this.generatorName = 'RequirementsMappingGenerator';
    }

    createPrompt() {
        return `
Analyze this requirements chunk and determine if it contains any content relevant to the following Bounded Context.
Return empty array if no relevant content is found.

Current Bounded Context:
Name: ${this.client.input['boundedContext'].name}
Alias: ${this.client.input['boundedContext'].alias}
implementationStrategy: ${this.client.input['boundedContext'].implementationStrategy}
importance: ${this.client.input['boundedContext'].importance}
Aggregates: ${JSON.stringify(this.client.input['boundedContext'].aggregates)}
Events: ${JSON.stringify(this.client.input['boundedContext'].events)}

Requirements or Analysis Result(Actors and Events) or DDL Chunk:
${this.parseRequirements(this.client.input['requirementChunk'])}

${this.isFrontEndMappingPrompt()}

Format your response as:
{
    "relevantRequirements": 
    [
        {
            "type": "userStory || DDL || Event",
            "text": "exact text from the chunk that is definitely related to this BC" // If an object comes, write it as a string
        }
    ]
    // or just "relevantRequirements": [] if nothing is relevant
}

When no relevant content:
{
    "relevantRequirements": []
}
`;
    }

    parseRequirements(requirementChunk){
        if(typeof requirementChunk === 'object'){
            if(this.client.input['boundedContext'].name == 'ui'){
                // ui에서는 event나 actor 매핑을 제외하기 위함
                return '';
            }else{
                return JSON.stringify(requirementChunk);
            }
        }else{
            return requirementChunk;
        }
    }

    isFrontEndMappingPrompt(){
        if(this.client.input['boundedContext'].name == 'ui'){
            return `
SPECIAL INSTRUCTIONS FOR UI BOUNDED CONTEXT:
            
For ui bounded context, ONLY map requirements that are related to:
    - User interface elements (buttons, forms, tables, charts, etc.)
    - Only non-functional requirements
    - Screen layouts and navigation
    - User interactions (clicks, inputs, selections, etc.)
    - Visual design and styling requirements
    - User experience (UX) flows and user journeys
    - Display of data and information presentation
    - Responsive design and accessibility requirements
    - Frontend validation rules and error messages
    - User feedback and notifications
    - Screen transitions and animations
    
    MUST NOT mapping:
    - Events or Actors
    - functional requirements
    - Business logic or backend processes
    - Data processing or calculations
    - API calls or data fetching logic
    - Database operations
    - Server-side validation
    - Authentication/authorization logic
    - Data persistence or storage
    
Focus ONLY on what users see and interact with on the screen.
If the requirement is not related to the UI, return empty array.
            `
        }else{
            return `
Important Instructions:

1. Consider the following aspects when determining relevance:
   - Direct references to the Bounded Context's name, alias, or aggregates
   - Business processes or workflows that this Bounded Context is responsible for
   - Data structures or entities that align with the Bounded Context's aggregates
   - Events that are published or consumed by this Bounded Context
   - User stories that describe functionality within this Bounded Context's domain
   - Even if a DDL table name does not directly match the Bounded Context, if its field names (such as order_id, product_id, etc.) are clearly related to the Bounded Context's aggregates, entities, or events, consider it relevant.

2. Include content if it:
   - Directly mentions or relates to the Bounded Context's core responsibilities
   - Describes processes or data that this Bounded Context manages
   - Contains events that this Bounded Context handles
   - Includes user stories that fall within this Bounded Context's domain
   - References entities or concepts that are part of this Bounded Context's aggregates

3. When in doubt:
   - Consider the Bounded Context's implementation strategy and importance
   - Look for indirect relationships through the aggregates and events
   - Include content if it's part of the same business domain
   - Err on the side of inclusion if the relationship is plausible
   `;
        }
    }

    createModel(text) {
        if(text.startsWith('```json')){
            text = text.slice(7);
        }
        if(text.endsWith('```')){
            text = text.slice(0, -3);
        }

        const model = super.createModel(text);

        if(model && model.relevantRequirements){
            return {
                boundedContext: this.client.input['boundedContext'].name,
                requirements: model.relevantRequirements.length > 0 ? model.relevantRequirements : []
            };
        }else{
            return {
                boundedContext: this.client.input['boundedContext'].name,
                requirements: []
            };
        }
    }
}

module.exports = RequirementsMappingGenerator;