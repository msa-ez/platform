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
Aggregates: ${JSON.stringify(this.client.input['boundedContext'].aggregates)}

Requirements Chunk:
${this.client.input['requirementChunk']}

Important Instructions:
1. Only include text that is DIRECTLY related to this Bounded Context
2. If no relevant content is found, return empty array
3. Do not force relationships - if unsure, exclude
4. Consider both the BC's purpose and its Aggregates
5. Include complete, unmodified sections when relevant

Format your response as:
{
    "relevantRequirements": [
        {
            "type": "userStory",
            "text": "exact text from the chunk that is definitely related to this BC"
        }
    ]
    // or just "relevantRequirements": [] if nothing is relevant
}

Example responses:
1. When relevant content found:
{
    "relevantRequirements": [
        {
            "type": "userStory",
            "text": "차량 운행에 따른 경비를 등록하고 조회할 수 있는 화면을 만들려고 해..."
        }
    ]
}

2. When no relevant content:
{
    "relevantRequirements": []
}
`;
    }

    createModel(text) {
        if(text.startsWith('```json')){
            text = text.slice(7);
        }
        if(text.endsWith('```')){
            text = text.slice(0, -3);
        }

        const model = super.createModel(text);
        return {
            boundedContext: this.client.input['boundedContext'].name,
            requirements: model.relevantRequirements.length > 0 ? model.relevantRequirements : []
        };
    }
}

module.exports = RequirementsMappingGenerator;