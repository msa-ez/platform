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
Please provide a solution related to resolving the error.
After checking the error log, you should add a solution for the file that caused the error to "codeChanges".
If multiple errors occur in the same file, you must create one solution for multiple errors rather than displaying a solution for each error.`
        } else {
            prompt = 'First, determine whether the business logic is lacking or not written, and if so, please suggest a way to write the logic in the aggregate file of the domain code. Write the business logic to pass this test.'
        }

        return `Here is the code list:
${JSON.stringify(this.client.codeList)}
You are a developer. To finally pass ${this.client.testFile.name} in the code list, you must modify the code as follows.
${prompt}
The solution must always be returned in the presented json format and must be generated according to all generation rules.
Generation rules: 
1. When implementing code, you must understand and write as much as possible the business purpose of the test file (${this.client.testFile.name}) and the "given"/"when"/"then" of the test. . Business logic.
2. Anti-corruption handling of input events is required.
When implementing within port methods within input values and aggregates, make sure to write type conversion and value conversion rules well by looking at example values within your tests and converting them appropriately.
Preserve existing class interfaces (methods, parameters, fields) as much as possible.
3. Re-raise the error appropriately when handling the try~catch. No implementation MUST handle errors through a new try~catch rather than an existing try~catch. If you don't know exactly why the error occurred, you won't be able to fix it later.
4. "codeChanges" cannot be an empty array and must have a value.
5. In the case of files where an error occurred without any code changes, the contents of the original file must be returned as "codeChanges".
6. The "modifiedFileCode" values must include the entire code of the file in the code list. All code content is never omitted or abridged. For example, you should not summarize sections of code with the expression "...".
7. "codeChanges" are only created if it is a file.
8. The test0, test1, and test2 functions in the ${this.client.testFile.name} file cannot be deleted. Only modifications are possible.
Json format:
[ 
    {
        solution: "Solution description", 
        solutionType: "IMPLEMENT" | "MODIFICATIONS" | "CORRECT" | "ENSURE" | "RETRY",
        codeChanges: [
            { 
                fileName: "source code file name",
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
