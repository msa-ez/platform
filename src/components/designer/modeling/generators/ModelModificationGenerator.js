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
- In the case of replace, all information that can be modified upon request must be modified and included in the value, and there must be a json path and query or index that is closest to the information to be modified.
- In the case of add, the value to be added must have the same structure as the object located in the same json path, and there must be no query.
- In case of delete, no value is needed and only the id value and action must be included.

- The data pointed to by jsonPath in the current model must already exist.
- jsonPath does not include "entities".
- name, namePascalCase, and nameCamelCase must be written in English and must be modified together to fit each format.
- Class Name of must can be known java class or the Value object classes listed here: must be one of Address, Photo, User, Money, Email, Payment, Weather, File, Likes, Tags, Comment. use simple name reduce the package name if java class name.

in this json format:

{
    "modifications": [
        {
            "jsonPath": "$.elements[?(@.id=='element id to be replaced or deleted')]", // action이 add인 경우는 id는 불필요.
            "action": "replace" | "add" | "delete", // 요청을 고려하여 하나만 선택.
            "value": {"element attributes to be replaced or added": "element values to be replaced or added"} // action이 delete인 경우는 불필요.
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
                add: [],
                delete: [],
                replace: [],
                beforeReplace: []
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
                    let parentPath = ""
                    let jsonPath = ""

                    if(modifications[idx].jsonPath){
                        jsonPath = modifications[idx].jsonPath;
                        parentPath = jsonPath.replace(/\[\?.*?\]|\[\d+\]/g, '')

                    }
                    let match = jsonpath.JSONPath({ path: modifications[idx].jsonPath, json: selectedElement });
                    let parentMatch = jsonpath.JSONPath({ path: parentPath, json: selectedElement });

                    let query = jsonPath.match(/\[\?\(@\.(\w+)==['"](\w+)['"]\)\]/)

                    // jsonPath에서 필요한 키 추출
                    const keys = jsonPath.match(/(?<=\$\.).+?(?=\[|\]|$)/g);
                    
                    var matchIndex = ""
                    if(jsonPath.match(/\[(\d+)\]/)){
                        matchIndex = jsonPath.match(/\[(\d+)\]/)[1]
                    }

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
                                            if(selectedElement._type.includes('uml')){
                                                // modelValue.beforeReplace.push(selectedElement.fieldDescriptors.find(x => x[query[1]] == query[2]))
                                                modelValue.replace.push(modifications[idx].value)
                                            }

                                            if(typeof currentObject[i] === 'object' && !Array.isArray(currentObject[i])) {
                                                currentObject[i] = Object.assign({}, currentObject[i], modifications[idx].value);
                                            } else {
                                                currentObject[i] = modifications[idx].value;
                                            }
                                        }
                                    }
                                }
                            }else{
                                if(currentObject){
                                    if(selectedElement._type.includes('uml')){
                                        // modelValue.beforeReplace.push(currentObject[keys[1]][keys[2]])
                                        modelValue.replace.push(modifications[idx].value)
                                    }

                                    if(currentObject[keys[0]]){
                                        if(typeof currentObject[keys[0]] === 'object' && !Array.isArray(currentObject[keys[0]])) {
                                            currentObject[keys[0]] = Object.assign({}, currentObject[keys[0]], modifications[idx].value);
                                        } else {
                                            currentObject[keys[0]] = modifications[idx].value;
                                        }
                                    }else{
                                        if(typeof currentObject[matchIndex] === 'object' && !Array.isArray(currentObject[matchIndex])) {
                                            currentObject[matchIndex] = Object.assign({}, currentObject[matchIndex], modifications[idx].value);
                                        } else {
                                            currentObject[matchIndex] = modifications[idx].value;
                                        }
                                    }
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
                                // modifications이 생성되는 중간 과정에 push된 것을 지우고 다시 push
                                if(Array.isArray(currentObject)){
                                    var index = currentObject.findIndex((x) => x.name == modifications[idx].value.name || Object.keys(x).length === 0);
                                    if(index !== -1){
                                        currentObject.splice(index, 1);
                                    }
                                }
                                currentObject.push(modifications[idx].value)
                                if(selectedElement._type.includes('uml')){
                                    const existingIndex = modelValue.add.findIndex(item => item.name === modifications[idx].value.name);
                                    if (existingIndex !== -1) {
                                        modelValue.add.splice(existingIndex, 1); // 기존 요소 삭제
                                    }
                                    modelValue.add.push(modifications[idx].value)
                                }
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
                                            if(selectedElement._type.includes('uml')){
                                                modelValue.delete.push(currentObject[i]);
                                            }
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

            modelValue["updateElement"] = updateElement
            modelValue["selectedElement"] = selectedElement

            return modelValue;

        } catch (error) {
            console.log(error)
        }
    }


}


module.exports = ModelModificationGenerator;