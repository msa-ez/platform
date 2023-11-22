import JsonAIGenerator from "./JsonAIGenerator";


export default class SIGenerator extends JsonAIGenerator {

    constructor(client){
        super(client);
    }

    createPrompt(){
        var prompt 
        if(this.client.generatedErrorDetails){
            prompt = `The error occurred during testing.
These are the contents of files where an error occurred during “mvn test” using the files in the code list. ${JSON.stringify(this.client.generatedErrorDetails)}
Identify the code part that needs error correction and correct the error appropriately for the business logic.
After checking the error log, you should add a solution for the file that caused the error to "codeChanges".
If multiple errors occur in the same file, all solutions should be added to "codeChanges" as a single result.`
        } else {
            prompt = 'First, write the business logic to pass this test.'
        }

        return `Here is the code list:
${JSON.stringify(this.client.selectedCodeList)}
You are a developer. To finally pass ${this.client.testFile.name} in the code list, you must modify the code as follows.
1. If the error occurred due to a logic error, please provide a solution related to resolving the error. If an error does not occur, determine whether the business logic is insufficient or not written, and if so, please suggest a way to write the logic in the aggregate file in the domain code.
2. When implementing code, you must understand and write as much as possible the business purpose of the test file (${this.client.testFile.name}) and the "given"/"when"/"then" of the test. . Business logic.
3. Anti-corruption handling of input events is required.
When implementing within port methods within input values and aggregates, make sure to write type conversion and value conversion rules well by looking at example values within your tests and converting them appropriately.
Preserve existing class interfaces (methods, parameters, fields) as much as possible.
4. Re-raise the error appropriately when handling the try~catch. No implementation MUST handle errors through a new try~catch rather than an existing try~catch. If you don't know exactly why the error occurred, you won't be able to fix it later.
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
