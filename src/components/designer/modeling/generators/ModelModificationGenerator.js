const JsonAIGenerator = require("./JsonAIGenerator");
const jsonpath = require('jsonpath-plus');

class ModelModificationGenerator extends JsonAIGenerator{

    constructor(client){
        super(client); 
    }
    // to have multiple order items and order states
    createPrompt(){
        let prompt = 
`
Currently, there is information on the model below:
${JSON.stringify(this.client.input.selectedElement)}

Please refer to the request below to create {modifications: [..]} to be used to modify the information of the current model:  
${this.client.input.modificationMessage}

{modifications: [..]} should be created like this:
- In case of replace, only the information to be changed should be included, not the entire model.
- In the case of add, it must contain only the information to be added and must follow the data structure at the same level and there needs to be only a path, no id needed.
- In case of delete, no value is needed and only the id value and action must be included.
- jsonPath does not include "entities".

in this json format:

{
    "modifications": [
        {
            "jsonPath": "$.elements[?(@.id=='element id to be replaced or deleted')]", // action이 add인 경우는 id는 불필요.
            "action": "replace" | "add" | "delete",
            "value": {"element attributes to be replaced or added": "element values to be replaced or added"} // action이 delete인 경우는 불필요
        }
    ]
}




`
        return prompt
    }

    createModel(text) {
        try {
            var me = this
            const modelData = super.createModel(text)

            let selectedElement = this.client.input.selectedElement
            let updateElement = JSON.parse(JSON.stringify(selectedElement))
            
            const modelValue = {
                elements: [],
                relations: []
            }
    
            function uuid() {
                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }
    
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            }

            if(modelData['modifications']){
                let modifications = modelData['modifications']
                for(var idx=0; idx< modifications.length; idx++){
                    let jsonPath = modifications[idx].jsonPath;
                    let parentPath = jsonPath.replace(/\[\?.*?\]|\[\d+\]/g, '')

                    let match = jsonpath.JSONPath({ path: modifications[idx].jsonPath, json: selectedElement });
                    let parentMatch = jsonpath.JSONPath({ path: parentPath, json: selectedElement });

                    let query = jsonPath.match(/\[\?\(@\.(\w+)==['"](\w+)['"]\)\]/)

                    // jsonPath에서 필요한 키 추출
                    const keys = jsonPath.match(/(?<=\$\.).+?(?=\[|\]|$)/g);

                    // 추출된 키를 배열로 저장
                    const keysArray = keys[0].split('.');

                    if(modifications[idx].action=='replace'){
                        if(match.length>0 && modifications[idx].value){
                            //jsonPath를 통해 ele 접근
                            var currentObject = updateElement;
                            for(var keyidx=0; keyidx<keysArray.length; keyidx++) {
                                var key = keysArray[keyidx];
                                if (currentObject.hasOwnProperty(key)) {
                                    if (typeof currentObject[key] === 'object' || Array.isArray(currentObject[key])) {
                                        currentObject = currentObject[key];
                                    }
                                } else {
                                    console.error("Key not found:", key);
                                    break;
                                }
                            }

                            if(currentObject && query){
                                if(query[1] && query[2]){
                                    for(var i=0; i<currentObject.length; i++) {
                                        if(currentObject[i][query[1]] === query[2]) {
                                            currentObject[i] = Object.assign(currentObject[i], modifications[idx].value)
                                        }
                                    }
                                }
                            }else{
                                if(currentObject){
                                    currentObject[keys[0]] = modifications[idx].value
                                }
                            }
                        }
                    }

                    if(modifications[idx].action=='add'){
                        if(parentMatch.length>0 && modifications[idx].value){
                            //jsonPath를 통해 ele 접근
                            var currentObject = updateElement;
                            for(var keyidx=0; keyidx<keysArray.length; keyidx++) {
                                var key = keysArray[keyidx];
                                if (currentObject.hasOwnProperty(key)) {
                                    if (typeof currentObject[key] === 'object' || Array.isArray(currentObject[key])) {
                                        currentObject = currentObject[key];
                                    }
                                } else {
                                    console.error("Key not found:", key);
                                    break;
                                }
                            }

                            if(currentObject){
                                currentObject.push(modifications[idx].value)
                            }
                        }
                    }

                    if(modifications[idx].action=='delete'){
                        if(parentMatch.length>0){
                            //jsonPath를 통해 ele 접근
                            var currentObject = updateElement;
                            for(var keyidx=0; keyidx<keysArray.length; keyidx++) {
                                var key = keysArray[keyidx];
                                if (currentObject.hasOwnProperty(key)) {
                                    if (typeof currentObject[key] === 'object' || Array.isArray(currentObject[key])) {
                                        currentObject = currentObject[key];
                                    }
                                } else {
                                    console.error("Key not found:", key);
                                    break;
                                }
                            }
                            
                            if(currentObject && query){
                                if(currentObject && query[1] && query[2]){
                                    for(var i = currentObject.length - 1; i >= 0; i--) {
                                        if(currentObject[i][query[1]] === query[2]) {
                                            currentObject.splice(i, 1); 
                                        }
                                    }
                                }
                            }
                        }
                    }

                    console.log();
                }
            }
    
            return updateElement;

        } catch (error) {
            console.log(error)
            return selectedElement;
        }
    }


}


module.exports = ModelModificationGenerator;