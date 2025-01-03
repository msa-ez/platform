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
Keep the important keywords of the original text as much as possible.

Excessive summarization is not allowed.

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

        if(this.state === "end"){
            console.log("After summarize: ", text.length);
        }else{
            console.log("Before summarize: ", this.client.input['requirements']['userStory'].length);
        }
        return super.createModel(text);
    }
}

module.exports = RequirementsSummarizer;