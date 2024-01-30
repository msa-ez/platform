const JsonAIGenerator = require("./JsonAIGenerator");

class BusinessLogicGenerator extends JsonAIGenerator {
    constructor(client){
        super(client);
    }

    createPrompt(){
        return `You are a developer. You need to look at the contents of the file I provided and add the appropriate business logic to the specified location.

Full code list: ${this.client.javaFileList ? this.client.javaFileList:'null'}

Code of file to edit: ${this.client.filteredOpenCode[0].code}
If there is a complete code list provided, you must look at the entire code list to understand the business.
If there is no complete code list provided, you will need to look at the contents of the file to be modified to understand the entire code and business of the file.

Once you have figured out the business logic, you need to create it in the ${this.client.filteredOpenCode[0].name } file.
${this.client.promptValue}
    // Location to create business logic
${this.client.suffixValue}
You must implement only the appropriate business logic to be filled in the specified creation location.'

When generating code, you should only generate code that will be filled inside the class.
for example
public void className() {
    “Code content” // All I need is the “code content”. Never create the rest of the content. please
}
Creating an entire class like this is absolutely prohibited.
If you created the entire class, the content of the generated code
The contents of "public void className() {" and the final "}" must be absolutely and unconditionally removed.
Only implement the logic (// code content) that will be filled inside the class.

When implementing code, you must follow the format below.
{
    "code": // Code content to be filled inside the class
}
`
    }
    createModel(text){
        return super.createModel(text)
        // return text
    }


}


module.exports = BusinessLogicGenerator;