const JsonAIGenerator = require("./JsonAIGenerator");

class BusinessLogicGenerator extends JsonAIGenerator {
    constructor(client){
        super(client.context);
    }

    createPrompt(){
        return `You are a developer. You need to look at the contents of the file I provided and fill in the appropriate business logic in the specified location.

Full code list: ${JSON.stringify(this.client.javaFileList)}

If you have a complete code list provided, you should check each Java file in the complete code list provided to understand its business purpose and refer to the business logic of each file to implement the business logic.
If there is no complete code listing provided, you should review the contents of the provided file to understand the entire code and business purpose of the file, and refer to the business logic in the file to implement the business logic.

After understanding the business purpose, you need to create it in ${this.client.openCode[0].name } file.
File content to modify:
\`\`\`java
${this.client.promptValue}
{{ Where to create business logic }}
${this.client.suffixValue}
\`\`\`
Appropriate business logic (java code) must be filled in the specified creation location.'

When generating code, you should generate "only the Java code that will be populated inside the class."
If you determine that the event publish() content appears to be necessary at the end of the generated code, it is recommended to add the same publish code by referring to another file or another class. e.g. "eventName.publishAfterCommit()"
When implementing your code, you must follow this format:
{
    "implementedCode": // Implemented Java code to be filled inside the class. All you need to do is implement Java code. The results must not be implemented in anything other than natural language or Java code. For example // "Implement the business logic when taking an order." This type of content should never be included. please
}
`
    }
    createModel(text){
        return super.createModel(text)
        // return text
    }


}


module.exports = BusinessLogicGenerator;