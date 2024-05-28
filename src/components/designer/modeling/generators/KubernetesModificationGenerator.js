const JsonAIGenerator = require("./JsonAIGenerator");
const jp = require('jsonpath');

class KubernetesModificationGenerator extends JsonAIGenerator {

    constructor(client){
        super(client); 
    }

    createMessages(){
        const systemPrompt = `{{preferLanguagePrompt}}
당신은 쿠버네티스와 관련된 설정 편집을 도와주는 도우미입니다.

당신에게는 쿠버네티스 설정을 수정하는 작업이 주어집니다.
사용자가 전달한 설정 내용을 바탕으로 사용자의 지시에 따라서 설정을 변경시키는 지시 사항들을 생성해 주면 됩니다.


다음과 같은 Json 형태로 반환시켜 주면 됩니다.
{
    "modifications": [
        {
            "jsonPath": "$['']",
            "action": "add" | "replace" | "delete",
            "value": "" | {} | []
        }
    ]
}

각각의 속성을 설명하겠습니다.
* jsonPath
- 주어진 쿠버네티스 설정에 접근하기 위한 경로입니다.
- 반드시 주어진 쿠버네티스 설정에 존재하는 경로만 사용해야 합니다.
- 특수문자가 포함된 경우를 고려해서 bracket notation만 사용해야 합니다.

* action
- 실제로 수행하는 동작의 유형이며, 다음의 3가지 값 중에서 하나를 사용해야 합니다.
> add: 주어진 jsonPath에 해당하는 속성에 주어진 value를 추가합니다.
> replace: 주어진 jsonPath에 해당하는 속성에 주어진 value를 변경합니다.
> delete: 주어진 jsonPath에 해당하는 속성을 삭제합니다.

* value
- 추가하거나 변경할 때 사용할 수 있는 값입니다.
- 문자열, 숫자, 객체, 리스트 등을 자유롭게 넣을 수 있습니다.


현재의 쿠버네티스 설정 내용은 다음과 같습니다.
{{currentKubeConfig}}


* 예시
[입력]
이름을 "exampleName"으로 바꿔주세요.

[출력]
{
    "modifications": [
        {
            "jsonPath": "$['metadata']['name']",
            "action": "replace",
            "value": "exampleName"
        }
    ]
}

[입력]
labels에 tag: request를 추가시켜주세요.

[출력]
{
    "modifications": [
        {
            "jsonPath": "$['metadata']['labels']",
            "action": "add",
            "value": {
                "tag": "request"
            }
        }
    ]
}`
.replace(`{{preferLanguagePrompt}}`, (this.preferredLanguage ? `please generate in ${this.preferredLanguage}.\n` : ''))
.replace(`{{currentKubeConfig}}`, JSON.stringify(this.client.input.selectedElement.object, null, 2))

        const userPrompt = `
[입력]
{{userprompt}}

[출력]`
.replace(`{{userprompt}}`, this.client.input.modificationMessage)


        const messages = [
            {
                role: "system",
                content: systemPrompt
            },

            {
                role: "user",
                content: userPrompt
            }
        ]
        
        
        return messages
    }

    createModel(text) {
        let modelResult = {
            selectedElement: null,
            updatedElement: null,
            error: null,
            aiResponse: text
        }

        try {
            let selectedElement = this.client.input.selectedElement
            let updatedElement = JSON.parse(JSON.stringify(selectedElement))
            let updatedKubeConfig = updatedElement.object

            super.createModel(text).modifications.forEach(modification => {
               let {jsonPath, action, value} = modification

                // #region 예외처리: jsonPath가 존재하지 않을 경우, 존재하는 경로로 변경
                while(jp.value(updatedKubeConfig, jsonPath) === undefined){
                    // $['metadata']['name']인 경우, 'name'을 추출해야함
                    const lastKeyIndex = jsonPath.lastIndexOf("[")
                    const lastKey = jsonPath.slice(lastKeyIndex+1, -1)
                    jsonPath = jsonPath.slice(0, lastKeyIndex)


                    // #region 마지막 키의 유형에 따라서 적절하게 value의 값에 반영
                    if(lastKey.match(/^\d+$/)) {
                        value = [value]
                    }
                    else if(lastKey.slice(1, -1).match(/^[가-힣a-zA-Z0-9_\-\/\.]+$/)) {
                        value = {[lastKey.slice(1, -1)]: value}
                    }
                    else
                        break
                    // #endregion
                }
                // #endregion

                // #region 주어진 modification을 적용하여 updatedKubeConfig를 업데이트
                switch (action) {
                    case 'add':
                        jp.apply(updatedKubeConfig, jsonPath, (val) => {
                            if(val === null) return value
                            if (Array.isArray(val)) val.push(value)
                            else return { ...val, ...value }
                        });
                        break;
                    case 'replace':
                        jp.apply(updatedKubeConfig, jsonPath, () => value);
                        break;

                    case 'delete':
                        jp.apply(updatedKubeConfig, jsonPath, () => undefined);
                        break;
                }
                // #endregion
            })


            modelResult.selectedElement = selectedElement
            modelResult.updatedElement = updatedElement
            return modelResult

        } catch (error) {

            console.log(error)
            if(this.state === "end") 
                modelResult.error = error.message
            return modelResult
            
        }
    }
}


module.exports = KubernetesModificationGenerator;