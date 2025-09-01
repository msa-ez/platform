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

Be sure to check the request and make sure which action among add, replace, or delete is appropriate.

{modifications: [..]} should be created like this:
- In the case of replace, all information that can be modified upon request must be modified and included in the value, and there must be a json path and query or index that is closest to the information to be modified.
- In the case of add, the path where the value is added must be included in jsonPath.
- In the case of add, data other than the information to be added upon request should not be included in the value.
- In the case of add, relations should not be added directly, nor should relations be created within elements.
- In the case of add, jsonPath must accurately contain the location where the value will be added.
- In the case of delete, no value is needed and only the id value and action must be included.
- In case of delete or replace, the location of information to be modified or changed must be included as a query in jsonPath.

- The data pointed to by jsonPath in the current model must already exist.
- jsonPath does not include "entities".
- name, namePascalCase, and nameCamelCase must be written in English and must be modified together to fit each format.
- Class Name of must can be known java class or the Value object classes listed here: must be one of Address, Photo, User, Money, Email, Payment, Weather, File, Likes, Tags, Comment. use simple name reduce the package name if java class name.
- If a value object that was not previously mentioned is added, the className must be created appropriately and fieldDescriptors must be configured appropriately for the request.
- JsonPath must not contain an array and must be written as a query.
- The id in jsonPath must match what exists in the current model.
- Never create comments.

jsonPath Description:
- All jsonPath must start with "$.elements"
- When searching by id: "$.elements[?(@.id=='element-id')]"
- When accessing a field: "$.elements[?(@.id=='element-id')].aggregateRoot.fieldDescriptors"

in this json format:

{
    "modifications": [
        {
            "jsonPath": "$.elements[?(@.id=='element id to be replaced or deleted')]", // jsonPath format must be like this("$.elements[?...]").
            "action": "replace" | "add" | "delete", // Choose only one considering request.
            "value": { // If action is delete, unnecessary. Also, never create a value whose type is not filedDescriptor 
                "className":"class type in PascalCase",
                "isKey":"true or false",
                "name":"if className is one of java primitive type or String, use camelCase. If className is a custom type (e.g., Address, Photo, User...), use the className in pascalCase.",
                "displayName":"class display name in Korean",
                "nameCamelCase":"camel case name",
                "namePascalCase":"pascal case name",
                "_type":"org.uengine.model.FieldDescriptor",
            }
        }
    ]
}




`
        const umlClassModelPrompt = () => { 
            return `Basically, all modifications are based on the fieldDescriptors of the elements.
            The following is the definition of the currently drawn UML domain model.
            Unless it is a direct modification request for an external domain referenced by the AggregateRoot, it should be based on the AggregateRoot.
            
            Modifications should be made by accessing only the data where direct changes occur in each element object using jsonPath.
            If a value object is added to the field of the AggregateRoot, an external domain object should be drawn, and the relation should be connected.

            - name must follow these rules:
                - If className is a Java primitive type or String, use camelCase.
                - If className is a custom type (e.g., Address, Photo, User...), use the className itself in PascalCase.
            - nameCamelCase should always be in camelCase format.
            - namePascalCase should always be in PascalCase format.
            - For custom types (e.g., Address, Photo, User...), name, nameCamelCase, and namePascalCase should be as follows:
                - name: The className itself (e.g., "Photo")
                - nameCamelCase: The className in camelCase (e.g., "photo")
                - namePascalCase: The className itself, as it's already in PascalCase (e.g., "Photo")
            `
        }

        if(this.client.$parent.$parent.$options.name === 'uml-class-model-canvas'){
            prompt = prompt + umlClassModelPrompt();
        }

        return prompt
    }

    uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    createModel(text) {
        let updateElement = {}
        let selectedElement = {}

        try {
            var me = this

            if (text.startsWith('```json')) {
                text = text.slice(7);
            }
            if (text.endsWith('```')) {
                text = text.slice(0, -3);
            }

            const modelData = super.createModel(text)
            let canvasModelValue = this.client.input.selectedElement

            if(me.client.$parent.$parent.$options.name === 'uml-class-model-canvas'){
                const modelValue = {
                    add: [],
                    delete: [],
                    replace: []
                }
                
                if(modelData['modifications']){
                    let modifications = modelData['modifications']
                    for(var idx=0; idx< modifications.length; idx++){
                        if(modifications[idx].jsonPath && modifications[idx].action){
                            let jsonPath = modifications[idx].jsonPath;
                            let idMatch = jsonPath.match(/@\.id==['"]([^'"]+)['"]/);
                            let keyMatch = jsonPath.match(/\]\.(\w+)\[/);

                            let id = idMatch ? idMatch[1] : null;  // id
                            let key = keyMatch ? keyMatch[1] : null; // element 속성

                            let query = jsonPath.match(/\[\?\(@\.(\w+)==['"](\w+)['"]\)\]/)
                            let queryKey = query ? query[1] : null;
                            let queryValue = query ? query[2] : null;

                            if(modifications[idx].action == 'replace'){
                                if(id && canvasModelValue.elements[id]){
                                    let ele = JSON.parse(JSON.stringify(canvasModelValue.elements[id]))
                                    
                                    if(ele){
                                        if(modifications[idx].value){
                                            modifications[idx].value['id'] = id
                                            modifications[idx].value['key'] = queryKey
                                            modifications[idx].value['value'] = queryValue
                                            modifications[idx].value['isVO'] = ele.fieldDescriptors.find(x => x[queryKey] == queryValue).isVO
    
                                            modelValue.replace.push(modifications[idx].value)
                                        }
                                    }
                                }
                            }

                            if(modifications[idx].action == 'add'){
                                if(id){
                                    // let ele = JSON.parse(JSON.stringify(canvasModelValue.elements[id]))
                                    if(modifications[idx].value){
                                        if(!modifications[idx].value['isVo']){
                                            modifications[idx].value['id'] = id
                                        }else{
                                            modifications[idx].value['classId'] = id
                                        }
                                        modelValue.add.push(modifications[idx].value)

                                    }
                                }

                                if(modifications[idx].jsonPath === '$.elements'){
                                    if(modifications[idx].value && modifications[idx].value.name){
                                        const existingIndex = modelValue.add.findIndex(item => item.name.toLowerCase() === modifications[idx].value.name.toLowerCase() && item._type.includes('FieldDescriptor'));
                                        if (existingIndex !== -1) {
                                            modifications[idx].value['id'] = modelValue.add[existingIndex].id ? modelValue.add[existingIndex].id : modelValue.add[existingIndex].classId
                                            modelValue.add.splice(existingIndex, 1);
                                        }
                                        modelValue.add.push(modifications[idx].value)
                                    }
                                }
                                
                            }
                            
                            if(modifications[idx].action == 'delete'){
                                if(id && canvasModelValue.elements[id]){
                                    let ele = JSON.parse(JSON.stringify(canvasModelValue.elements[id]))
                                    
                                    if(ele && queryKey && queryValue){
                                        modelValue.delete.push({id:id, key:queryKey, value:queryValue, isVO:ele.fieldDescriptors.find(x => x[queryKey] == queryValue).isVO})
                                    }
                                }
                            }
                        }
                    }
                }

                return modelValue
            }else{

                selectedElement = me.client.input.selectedElement
                updateElement = JSON.parse(JSON.stringify(selectedElement))
                
                const modelValue = {
                    add: [],
                    delete: [],
                    replace: [],
                    beforeReplace: []
                }
    
                if(modelData['modifications']){
                    let modifications = modelData['modifications']
                    for(var idx=0; idx< modifications.length; idx++){
                        let jsonPath = ""
                        let parentPath = ""
                        if(modifications[idx].jsonPath){
                            jsonPath = modifications[idx].jsonPath;
                            parentPath = jsonPath.split('.fieldDescriptors')[0];
                            
                            // ID 추출
                            const idMatch = jsonPath.match(/\'([^']+)\'|\"([^"]+)\"/);
                            const elementId = idMatch ? (idMatch[1] || idMatch[2]) : null;

                            if (elementId && selectedElement.id === elementId) {
                                if(modifications[idx].action === 'replace' && modifications[idx].value){
                                    // 특정 필드 수정의 경우
                                    const fieldPath = jsonPath.split('].')[1];
                                    if (fieldPath) {
                                        // 중첩된 경로 처리
                                        const pathParts = fieldPath.split('.');
                                        let current = updateElement;
                                        
                                        // 마지막 부분 전까지 경로 탐색
                                        for(let i = 0; i < pathParts.length - 1; i++) {
                                            if (!current[pathParts[i]]) {
                                                current[pathParts[i]] = {};
                                            }
                                            current = current[pathParts[i]];
                                        }
                                        
                                        // 최종 값 설정
                                        const lastPart = pathParts[pathParts.length - 1];
                                        current[lastPart] = modifications[idx].value;
                                    } else {
                                        // 전체 객체 수정의 경우
                                        Object.keys(modifications[idx].value).forEach(key => {
                                            updateElement[key] = modifications[idx].value[key];
                                        });
                                    }
                                    modelValue.replace.push(modifications[idx].value);
                                } else if(modifications[idx].action === 'add' && modifications[idx].value){
                                    // fieldDescriptors에 추가
                                    if (jsonPath.includes('fieldDescriptors')) {
                                        if (!updateElement.aggregateRoot) {
                                            updateElement.aggregateRoot = { fieldDescriptors: [] };
                                        }
                                        if (!updateElement.aggregateRoot.fieldDescriptors) {
                                            updateElement.aggregateRoot.fieldDescriptors = [];
                                        }
                                        updateElement.aggregateRoot.fieldDescriptors.push(modifications[idx].value);
                                    }
                                    modelValue.add.push(modifications[idx].value);
                                } else if(modifications[idx].action === 'delete'){
                                    modelValue.delete.push({id: elementId});
                                }
                            }
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
    
                                        if(currentObject[keys[0]] || currentObject[keys[0]]==""){
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
            }
        } catch (error) {
            let modelValue = {
                updateElement: updateElement? updateElement : {},
                selectedElement: selectedElement? selectedElement : {}
            }
            console.log(error)
            return modelValue
        }
    }


}


module.exports = ModelModificationGenerator;