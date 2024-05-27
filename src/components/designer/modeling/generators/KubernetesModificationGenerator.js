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
사용자가 전달한 설정 내용을 바탕으로 사용자의 지시에 따라서 설정을 변경시키는 지시사항들을 생성해주면 됩니다.

다음과 같은 Json 형태로 반환시켜주면 됩니다.
{
    "modifications": [
        {
            "jsonPath": "",
            "action": "add" | "replace" | "delete",
            "value": "추가하거나 변경시킬 값"
        }
    ]
}

각각의 action에 대해서 설명드리겠습니다.
- add: 주어진 jsonPath에 해당하는 속성에 주어진 value를 추가합니다.
- replace: 주어진 jsonPath에 해당하는 속성에 주어진 value를 변경합니다.
- delete: 주어진 jsonPath에 해당하는 속성을 삭제합니다.

현재의 쿠버네티스 설정 내용은 다음과 같습니다.
{{currentKubeConfig}}

* 예시
[입력]
이름을 "exampleName"으로 바꿔주세요.

[출력]
{
    "modifications": [
        {
            "jsonPath": "$.metadata.name",
            "action": "replace",
            "value": "exampleName"
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
        try {
            let modelResult = {
                selectedElement: null,
                updatedElement: null
            }


            let selectedElement = this.client.input.selectedElement
            let updatedElement = JSON.parse(JSON.stringify(selectedElement))
            let updatedKubeConfig = updatedElement.object

            super.createModel(text).modifications.forEach(modification => {
               const {jsonPath, action, value} = modification
               // #region 주어진 modification을 적용하여 updatedKubeConfig를 업데이트
               switch (action) {
                    case 'add':
                        jp.apply(updatedKubeConfig, jsonPath, (val) => {
                            if (Array.isArray(val)) {
                                val.push(value);
                            } else {
                                return { ...val, ...value };
                            }
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
            throw error
        }
    }
}


module.exports = KubernetesModificationGenerator;