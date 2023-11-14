import JsonAIGenerator from "./JsonAIGenerator";


export default class ErrorLogGenerator extends JsonAIGenerator{

    constructor(client){
        super(client);
    }

    createPrompt(){
        return `Error log: ${this.client.errorLog}
        Please extract the main contents of the error log for each file where an error occurred and summarize the error content in 1 to 2 lines.
        you must follow this json format:
        {
            File name where error occurred: Summary of error details,
            File name where error occurred: Summary of error details
        }`
    }



    createModel(text){
        // let model = super.createModel(text);
        // var me = this 
        return text;
    }

}
