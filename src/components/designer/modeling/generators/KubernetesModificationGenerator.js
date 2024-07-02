const JsonAIGenerator = require("./JsonAIGenerator");
const jp = require('jsonpath');
const { getNewElementGuidesForAI, getNewElementGuide } = require('./KubernetesModificationGeneratorSnippts');

class KubernetesModificationGenerator extends JsonAIGenerator {

    constructor(client){
        super(client); 
    }

    createMessages(){
        const newElementGuidesForAI = getNewElementGuidesForAI(this.client.input.selectedElement._type, this.client.input.selectedElement.object.metadata.name)
        const isNewElementExist = newElementGuidesForAI.length > 0

        const systemPrompt = `{{preferLanguagePrompt}}
당신은 쿠버네티스와 관련된 설정 편집을 도와주는 도우미입니다.

${(isNewElementExist) ? "당신에게는 쿠버네티스 설정을 수정하거나 추가하는 작업이 주어집니다." : "당신에게는 쿠버네티스 설정을 수정하는 작업이 주어집니다."}
사용자가 전달한 설정 내용을 바탕으로 사용자의 지시에 따라서 설정을 변경시키는 지시 사항들을 생성해 주면 됩니다.


다음과 같은 Json 형태로 반환시켜 주면 됩니다.
{
    "modifications": [
        {
            "jsonPath": "$['']",
            "action": "add" | "replace" | "delete",
            "value": "" | {} | []
        }
    ]${(isNewElementExist) ? `,
    "newElements": [
        {
            "elementType": "",
            "modifications": [
                {
                    "jsonPath": "$['']",
                    "action": "add" | "replace" | "delete",
                    "value": "" | {} | []
                }
            ]
        }
    ]` : ""}
}

각각의 속성을 설명하겠습니다.
${(isNewElementExist) ? `가장 최상단에는 modifications, newElements이 있습니다.
modifications는 사용자가 전달한 쿠버네티스 설정을 변경시키는 경우에 사용하고, newElements는 해당 설정에 대한 새로운 요소들을 추가하는 경우에 사용합니다.` : 
"modifications는 사용자가 전달한 쿠버네티스 설정을 변경시키는 경우에 사용하는 속성입니다."}


modifications 속성은 주어진 JsonPath를 이용해서 설정을 변경시킬 수 있습니다.
각각의 속성에 대한 설명은 다음과 같습니다.
* jsonPath
- 주어진 쿠버네티스 설정에 접근하기 위한 경로입니다.
- 반드시 주어진 쿠버네티스 설정에 존재하는 경로만 사용해야 합니다.
- 특수문자가 포함된 경우를 고려해서 bracket notation만 사용해야 합니다.

* action
- 실제로 수행하는 동작의 유형이며, 다음의 3가지 값 중에서 하나를 사용해야 합니다.
> add: 주어진 jsonPath에 해당하는 속성에 주어진 value를 추가합니다.
> replace: 주어진 jsonPath에 해당하는 속성에 있는 값을 주어진 value로 변경합니다.
> delete: 주어진 jsonPath에 해당하는 속성을 삭제합니다.

* value
- 추가하거나 변경할 때 사용할 수 있는 값입니다.
- 문자열, 숫자, 객체, 리스트 등을 자유롭게 넣을 수 있습니다.


${((isNewElementExist) ? `newElements는 사용자가 전달한 속성과 관련해서 엘리먼트를 추가할 수 있으며, 다음 가이드에 있는 요소만 추가할 수 있습니다.
가이드에는 각각의 사용할 수 있는 요소에 대한 타입, 설명, 어떤 사용자 요청에 대해서 사용하는지, 디폴트로 사용되는 쿠버네티스 설정이 있습니다.
* 가이드
${JSON.stringify(newElementGuidesForAI, null, 2)}

newElements에 들어가는 각각의 속성에 관해서 설명해 드리겠습니다.
* elementType
- 새롭게 추가시킬 엘리먼트의 종류입니다. 가이드에 있는 elementType만 사용할 수 있습니다.

* modifications
- 각 가이드에 있는 엘리먼트에서 디폴트로 사용되는 쿠버네티스 설정에서 추가로 수정할 지시 사항들을 적습니다.` : "")}


현재의 쿠버네티스 설정 내용은 다음과 같습니다.
{{currentKubeConfig}}


* 예시
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
}

${((isNewElementExist) ? `[입력]
CPU 임계치 50%를 기준으로, maxReplicas가 5가 될 수 있도록 새로운 HPA를 추가시켜주세요.

[출력]
{
    "newElements": [
        {
            "elementType": "horizontalPodAutoscaler",
            "modifications": [
                {
                    "jsonPath": "$['spec']['maxReplicas']",
                    "action": "replace",
                    "value": 5
                },

                {
                    "jsonPath": "$['spec']['metrics']",
                    "action": "add",
                    "value": {
                        "type": "Resource",
                        "resource": {
                            "name": "cpu",
                            "targetAverageUtilization": 50
                        }
                    }
                }
            ]
        }
    ]
}` : "")}
`
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
            newElements: [],
            error: null,
            aiResponse: text
        }

        try {

            let selectedElement = this.client.input.selectedElement
            let updatedElement = JSON.parse(JSON.stringify(selectedElement))
            let updatedKubeConfig = updatedElement.object
            const aiResponse = JSON.parse(text)

            
            if(aiResponse.modifications) {
                for(let modification of aiResponse.modifications)
                    this.applyModification(modification, updatedKubeConfig)
            }

            if(aiResponse.newElements) {
                for(let newElement of aiResponse.newElements) {
                    const newElementGuide = getNewElementGuide(selectedElement._type, newElement.elementType)
                    if(!newElementGuide) continue

                    newElement.modifications.forEach(modification => {
                        this.beforeModificationProcess(modification, selectedElement._type, newElement.elementType)
                        this.applyModification(modification, newElementGuide.elementGuide.defaultKubeConfig)
                    })

                    modelResult.newElements.push(newElementGuide)
                }
            }

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

    /**
     * 주어진 json 데이터에 modification을 적용시킴
     */
    applyModification(modification, targetJson) {
        let {jsonPath, action, value} = modification

        // #region 예외처리: jsonPath가 존재하지 않을 경우, 존재하는 경로로 변경
        while(jp.value(targetJson, jsonPath) === undefined){
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
                jp.apply(targetJson, jsonPath, (val) => {
                    if (Array.isArray(val)) return [...val, value]
                    else if(typeof val === 'object') return { ...val, ...value }
                    else return value
                });
                break;
            case 'replace':
                jp.apply(targetJson, jsonPath, () => value);
                break;

            case 'delete':
                jp.apply(targetJson, jsonPath, () => undefined);
                break;
        }
        // #endregion
    }

    /**
     * AI가 잘못된 응답을 제공한 경우의 예외 처리 수행
     */
    beforeModificationProcess(modification, selectedElementType, newElementType) {
        if(selectedElementType === "Deployment" && newElementType === "horizontalPodAutoscaler") {
            // spec.metrics가 객체 값이 아닌, 배열 값으로 잘못 반환시킨 경우 후처리하는 로직
            if(modification.jsonPath === "$['spec']['metrics']" && Array.isArray(modification.value) && modification.value.length === 1) {
                modification.value = modification.value[0]
            }
        }
    }
}


module.exports = KubernetesModificationGenerator;