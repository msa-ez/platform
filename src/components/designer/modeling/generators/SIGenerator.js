import JsonAIGenerator from "./JsonAIGenerator";


export default class SIGenerator extends JsonAIGenerator {

    constructor(client){
        super(client);
    }

    createPrompt(){
        var prompt 
        if(this.client.generatedErrorLog){
            prompt = `The error occurred during testing.
            Error log: ${this.client.generatedErrorLog}

            You must check the error log and add a solution for the file causing the error to "codeChanges".`
        } else {
            prompt = 'First, write the business logic to pass this test.'
        }

        return `You are a developer. You need to modify the codes to finally pass ${this.client.testFile.name} as shown below:
${this.client.testFile.name}: 
${this.client.testFile.code}
Various errors will occur during the process of modifying the code in the code list.
Errors may occur due to 1. insufficient writing of business logic, or 2. logic errors.
If the business logic has not been written, please present a solution that writes the logic in an aggregate file within the domain code.
SELF CRITICISM:
Understand business logic well: When implementing, write with as much understanding of the business purpose of the test as possible and understand the given/when/then of the test to see if you are writing business logic.
Anti-corruption processing of input events: When implemented within the port method within the input value and aggregate, the type conversion and value conversion rules must be well written by looking at the example values within the test and converting them appropriately.
Maintain the existing class interface (methods, parameters, fields) as much as possible.
Properly rethrow errors when handling try~catch: There should be no implementation that eats any errors through try~catch. If you do not know exactly why an error occurred, it is impossible to correct it later.
${prompt}
Results must always be returned in the corresponding json format and follow the generation rules.
Generation rules: 
1. "codeChanges" cannot be an empty array and must have a value.
2. In the case of files where an error occurred without any code changes, the contents of the original file must be returned as "codeChanges".
3. If the file code does not exist in the provided code list, "fileCode" and "Modified File Code" should return "Code does not exist."
4. The "fileCode", "modifiedFileCode" values must contain the entire code of the file. Code content should not be omitted or summarized. For example, you should not summarize sections of code with the expression "...".
5. "codeChanges" are only created if it is a file.
Json format:
[ 
    {
        solution: "Solution description", 
        solutionType: "IMPLEMENT" | "MODIFICATIONS" | "CORRECT" | "ENSURE" | "RETRY",
        codeChanges: [
            { 
                fileName: "source code file name", 
                fileCode: "File code provided before modification, original file code", // It must be full code in the file.  It start with "package ..."
                modifiedFileCode: "The new file code that merged the modified content with the content in the file code.", // It must be full code in the file. It start with "package ..."
                action: "CHANGE" | "ADD BELOW THE CODE" | "DELETE" 
            } 
        ] 
    } 
]`
    }

    createModel(text){
        return super.createModel(text);
    }

}
