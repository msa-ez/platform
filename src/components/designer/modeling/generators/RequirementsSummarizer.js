const JsonAIGenerator = require("./JsonAIGenerator");
const { TextTraceUtil } = require("./utils");

class RequirementsSummarizer extends JsonAIGenerator {
    constructor(client) {
        super(client, {}, "normalModel");
        this.generatorName = 'RequirementsSummarizer';
        this.currentUserStory = null;
        this.currentMinLineNumber = 0;
        this.currentMaxLineNumber = 0;
    }


    createPrompt() {
        this.currentUserStory = this.client.input['requirements']['userStory'];
        this.currentMinLineNumber = TextTraceUtil.getMinLineNumberOfRequirements(this.currentUserStory);
        this.currentMaxLineNumber = TextTraceUtil.getMaxLineNumberOfRequirements(this.currentUserStory);

        return `
An AI agent that summarizes the following requirements by grouping related items and tracking source line references.

Your primary goal is to synthesize and consolidate, not just rephrase.
Analyze all the requirements provided below. Identify requirements that deal with similar features, subjects, or data.
Group these related requirements together.
For each group, create a single, concise summary sentence that captures the essence of that group.

The requirements text is provided with line numbers in the format "lineNumber: content".

Requirements with line numbers:
${this.currentUserStory}

Output in the following JSON format:
{
    "summarizedRequirements": [
        {
            "text": "A summary sentence representing a group of related requirements.",
            "source_lines": [1, 5, 8] // All source line numbers that contributed to this summary.
        },
        {
            "text": "Another summary sentence for a different group.", 
            "source_lines": [2, 3, 4] // All relevant source line numbers.
        }
    ]
}

Guidelines:
- CRITICAL: The 'source_lines' array must only contain line numbers that are present in the 'Requirements with line numbers' section. For the provided text, the valid range of line numbers is from ${this.currentMinLineNumber} to ${this.currentMaxLineNumber}. Do not under any circumstances invent or use line numbers outside this range.
- CRITICAL: Avoid rephrasing single lines. The goal is to produce significantly fewer summary sentences than the number of input lines by grouping related topics.
- The final summary should be less than 50% of the original text's length.
- Each summary sentence must reference multiple source lines where possible.
- Ensure all important functional requirements from the original text are covered in the summaries.
- DDL statements should be ignored and not included in the summary.
`
    }


    createModel(text) {
        if (text.startsWith('```json')) {
            text = text.slice(7);
        }
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }

        const model = super.createModel(text);
        if(!this.__isValidModel(model)) {
            return model;
        }
        
        const processedSummaries = []
        for(let i = 0; i < model.summarizedRequirements.length; i++) {
            const summary = model.summarizedRequirements[i];
            if(!this.__isValidSummary(summary, this.currentMinLineNumber, this.currentMaxLineNumber)) continue;

            processedSummaries.push({
                text: summary.text,
                refs: summary.source_lines.map(lineNum => {
                    return [[lineNum, 1], [lineNum, -1]];
                }),
                source_lines: summary.source_lines
            });
        }

        return {
            summarizedRequirements: processedSummaries
        };
    }

    __isValidModel(model) {
        return model && model.summarizedRequirements && Array.isArray(model.summarizedRequirements);
    }

    __isValidSummary(summary, minLineNumber, maxLineNumber) {
        if(!summary || !summary.text || !summary.source_lines || !Array.isArray(summary.source_lines))
            return false;

        const invalidLineNumbers = summary.source_lines.filter(lineNum => lineNum < minLineNumber || lineNum > maxLineNumber);
        if(invalidLineNumbers.length > 0)
            return false;

        return true;
    }
}

module.exports = RequirementsSummarizer;