import JsonAIGenerator from "./JsonAIGenerator";

export default class SIGenerator extends JsonAIGenerator {

    constructor(client){
        super(client);
    }

    createPrompt(){
        var prompt 
        var generationRule
        var clientPrompt = this.client.prompt
        var summarizedCodeListWithLineNumbers = {}
        var scratchpad = ""

        this.client.summarizedCodeList[this.client.testFile.name] = this.client.testFile.code

        for (const [fileName, code] of Object.entries(this.client.summarizedCodeList)) {
            summarizedCodeListWithLineNumbers[fileName] = this.addLineNumbers(code);
        }

        if(this.client.generatedErrorDetails){
            prompt = `user's request: ${clientPrompt}

An error occurred during testing.
Error list: ${JSON.stringify(this.client.generatedErrorDetails)}
The error list contains errors that occurred during mvn testing for the files in the code list and information about the file in which the error occurred.
It must identify a list of errors and provide appropriate solutions to the errors encountered in the file in which the error occurred.
Identify the code parts of the file that need error correction and correct the errors to suit your business logic.
After checking the error log, you should add a workaround for the file causing the error in "codeChanges".
If multiple errors occur in the same file, you should create one workaround for multiple errors instead of showing a workaround for each error.`
        } else {
            prompt = 'First, determine whether the business logic is lacking or not written, and if so, please suggest a way to write the logic in the aggregate file of the domain code. Write the business logic to pass this test.'
        }

        generationRule = `You are a developer. To finally pass ${this.client.testFile.name} in the code list, you must modify the code as follows.
${prompt}
Generation rules: 
1. When implementing code, you must understand and write as much as possible the business purpose of the test file (${this.client.testFile.name}) and the "given"/"when"/"then" of the test. . Business logic.
2. Anti-corruption handling of input events is required.
When implementing within port methods within input values and aggregates, make sure to write type conversion and value conversion rules well by looking at example values within your tests and converting them appropriately.
Preserve existing class interfaces (methods, parameters, fields) as much as possible.
3. Re-raise the error appropriately when handling the try~catch. No implementation MUST handle errors through a new try~catch rather than an existing try~catch. If you don't know exactly why the error occurred, you won't be able to fix it later.
4. "codeChanges" cannot be an empty array and must have a value.
5. In the case of files where an error occurred without any code changes, the contents of the original file must be returned as "codeChanges".
6. The "modifiedFileCode" values must include the entire code of the file in the code list. All code content is never omitted or abridged.
7. Member variable types specified in the code listing must not be changed. You will need to modify other code to match the type. // public string ID; I need to keep a String . Even if you get a type conversion error such as “Cannot convert java.lang.String to java.lang.Long,” you should resolve the error by modifying the code that uses that variable, not by changing the variable type. If you inevitably need to change the type, you must add code to convert the variable type to the type you want to change to all codes that use the variable in the code list.
8. If you determine that you have encountered a dependency version-related error, such as "NoSuchMethodError", you must modify the corresponding dependency version in pom.xml.
9. If the code you are trying to modify includes "//readonly", you should never modify that code. Example: If "\nexample code //readonly\n", "example code" should never be modified and must remain as is.
10. "codeChanges" are only created if it is a file.
11. You should focus on examining the contents of the given files and the error content and solving the errors that occurred, and you should not solve the errors by removing all the parts where the errors occurred or avoiding the errors. You should create high-quality code that can solve the errors and can actually be used.
12. You should check and acknowledge all the solutions that were previously proposed and provide a solution. Do not waste time by suggesting the same solution that was previously proposed, reverting changes, or suggesting incorrect solutions. Also, you should identify exactly which files need to be modified and modify them. Most of the files that need to be modified are .java, .xml files.
13. When generating the code to be fixed, you should not generate code arbitrarily, but generate meaningful code based on the code content of all the files provided.`
    // }

        if(this.client.modifiedHistory.length > 0){
            scratchpad = `
You have already modified the code as follows:
${JSON.stringify(this.client.modifiedHistory)}
You must continue to modify the code based on the above modification.`

        }


    return `Here is the code list:
${JSON.stringify(summarizedCodeListWithLineNumbers)}
${scratchpad}
${generationRule}
The solution must always be returned in the presented json format and must be generated according to all generation rules.
When presenting modifiedFileCode, numbers for each line must be removed.
Modifications unrelated to the error, such as comments or line removal, are unnecessary, and the code must be modified to resolve the error.

Since there are many cases where a fatal error occurs due to an answer being provided in a format other than the specified format or an empty value being provided, you should create a value by modifying at least one thing to fit the specified format even if there is nothing to modify. If there is really nothing to modify, you should at least create a value as if you modified the original content of the test file.
Json format:
[ 
    {
        solution: "Solution description", 
        solutionType: "Implement logic" | "Bug fix" | "Correct" | "Ensure",
        codeChanges: [
            { 
                fileName: "source code file name",
                modifiedFileCode: "The new file code that merged the modified content with the content in the file code.", // It must be full code in the file. It start with "package ..." and Modified code content must not include any indication that code has been omitted. Code may never be omitted. Never omit code.
                action: "CHANGE" | "ADD BELOW THE CODE" | "DELETE" 
            } 
        ] 
    } 
]`
    }

    createModel(text){
        if (text.startsWith('```json')) {
            text = text.slice(7);
        }
        if (text.endsWith('```')) {
            text = text.slice(0, -3);
        }
        
        return super.createModel(text + '"');
    }

    addLineNumbers(code) {
        if(code){
            return code.split('\n').map((line, index) => `${index + 1}: ${line}`).join('\n');
        } else {
            return ""
        }
    }

}
