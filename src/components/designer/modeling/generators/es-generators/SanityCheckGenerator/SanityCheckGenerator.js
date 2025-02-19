
const FormattedJSONAIGenerator = require("../../FormattedJSONAIGenerator");

class SanityCheckGenerator extends FormattedJSONAIGenerator{
    constructor(client){
        super(client)

        this.generatorName = "SanityCheckGenerator"
    }


    __buildAgentRolePrompt() {
        return `You are a very useful assistant.`
    }

    __buildTaskGuidelinesPrompt(){
        return `Please return the text entered by the user as-is in a JSON object.`
    }

    __buildJsonResponseFormat() {
        return `
{
    output: "<text entered by the user>"
}
`
    }

    __buildJsonExampleInputFormat() {
        return {
            "text": "Nice to meet you"
        }
    }

    __buildJsonExampleOutputFormat() {
        return {
            "output": "Nice to meet you"
        }
    }

    __buildJsonUserQueryInputFormat() {
        return {
            "text": "Hello, World !"
        }
    }


    onCreateModelGenerating(returnObj){
        if(returnObj.modelValue.aiOutput.output)
            returnObj.modelValue = {
                ...returnObj.modelValue,
                output: returnObj.modelValue.aiOutput.output
            }
    }

    onCreateModelFinished(returnObj){
        returnObj.modelValue = {
            ...returnObj.modelValue,
            output: returnObj.modelValue.aiOutput.output
        }
    }
}

module.exports = SanityCheckGenerator;