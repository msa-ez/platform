const JsonAIGenerator = require("./JsonAIGenerator");

class RequirementsSummarizer extends JsonAIGenerator {
    constructor(client) {
        super(client);
        
        this.model = "gpt-4o";
        this.temperature = 0.5;
        this.generatorName = 'RequirementsSummarizer';
    }

    createPrompt() {
        return `
An AI agent that summarizes the following requirements.
Extract the core content and summarize it to about half of the original text.
Keep the functional requirements and important keywords of the original text as much as possible.

Summary is allowed up to half of the original text.

Requirements:
- userStory: ${this.client.input['requirements']['userStory']}

Output in the following JSON format:
{
    "summarizedRequirements": "summarized requirements text"
}
`
    }

    createModel(text) {
        if (text.startsWith('```json')) {
            text = text.slice(7);
        }
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }

        return super.createModel(text);
    }
}

module.exports = RequirementsSummarizer;