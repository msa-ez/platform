import JsonAIGenerator from "./JsonAIGenerator";


export default class ErrorLogGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
    }

    createPrompt(){
        return `Error log: ${this.client.fullErrorLog}
Please extract and summarize the main contents of the error log.
The main content refers to the entire error content required for debugging, including the line number where the error occurred.
The numbers e.g. [52, 25] attached to the file path or file name where the error occurred respectively mean [line number, line column]. "lineNumber" should return the line number.
The result must follow JSON format only. Content other than the format must never be returned.

you must follow this text format:
[
    {
        fileName: File name where error occurred, // e.g. pom.xml
        errorDetails: Summary of error details, // e.g. cannot find symbol: method getId()
        lineNumber: Line Number where error occurred // e.g. 52
    },
    {
        fileName: File name where error occurred, // e.g. pom.xml
        errorDetails: Summary of error details // e.g. cannot find symbol: method getId()
        lineNumber: Line Number where error occurred // e.g. 52
    }
]`
    }

    createModel(text){
        return super.createModel(text);
    }

}
