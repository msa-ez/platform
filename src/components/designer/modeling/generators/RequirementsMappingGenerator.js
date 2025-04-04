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

Requirements or Analysis Result(Actors and Events) Chunk:
${this.parseRequirements(this.client.input['requirementChunk'])}

Important Instructions:
1. Include all text that is DIRECTLY related to this Bounded Context
2. If no relevant content is found, return empty array
3. Do not force relationships - if unsure, exclude
4. Consider both the BC's purpose and its Aggregates
5. Include complete, unmodified sections when relevant

Format your response as:
{
    "relevantRequirements": 
    [
        {
            "type": "userStory || DDL || AnalysisResult",
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
            return JSON.stringify(requirementChunk);
        }else{
            return requirementChunk;
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