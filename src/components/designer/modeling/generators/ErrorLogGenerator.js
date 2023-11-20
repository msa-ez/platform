import JsonAIGenerator from "./JsonAIGenerator";


export default class ErrorLogGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
    }

    createPrompt(){
        return `Error log: ${this.client.fullErrorLog}
        Please extract the main content of the error log and summarize the error in 1 to 2 lines.
        you must follow this text format:

        // The result must follow JSON format only. Content other than the format must never be returned.
        [
            {
                fileName: File name where error occurred, // e.g. pom.xml
                errorDetails: Summary of error details // e.g. "Cause of error"
            },
            {
                fileName: File name where error occurred, // e.g. pom.xml
                errorDetails: Summary of error details // e.g. "Cause of error"
            }
        ]
        `
    }

    createModel(text){
        return super.createModel(text);
    }

}
