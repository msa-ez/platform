const AIGenerator = require("./AIGenerator");

let partialParse;
try{
    partialParse = require('./partial-json-parser');

}catch(e){
    partialParse = function(text){return JSON.parse(text)}
}


class JsonAIGenerator extends AIGenerator{

    constructor(client, language){
        super(client, language);
    }

    createMessages(){
        let messages = super.createMessages();
        if(messages)
            messages[messages.length - 1].content += ". Please generate the json in valid json format and if there's a property its value is null, don't contain the property. also, Please return only the json without any natural language."

        return messages;
    }
    createModel(text){
        //console.log(text);
        let model
        try{
            // text = text.replace(/"[\w\s]+":\s*null,?/g, '');
            // text = text.replace(/"[\w\s]+":\s*null?/g, '');

            if(this.apiStrategy == 'ollama') {
                text = this.removeThinkBlocks(text);
                text = this.extractJSON(text);
            }
            model = partialParse(text);

            return model;
        }catch(e){
            console.log("error to parse:" + text);
            return null;
            // throw e;
        }
    }
    removeThinkBlocks(text) {
        // Remove content between <think> and </think> tags
        return text.replace(/<think>[\s\S]*?<\/think>/g, '');
    }
    hasUnclosedTripleBackticks(inputString) {
        // 백틱 세 개의 시작과 끝을 찾는 정규 표현식
        const regex = /`{3}/g;
        let match;
        let isOpen = false;

        // 모든 백틱 세 개의 시작과 끝을 찾습니다
        while ((match = regex.exec(inputString)) !== null) {
            // 현재 상태를 토글합니다 (열림 -> 닫힘, 닫힘 -> 열림)
            isOpen = !isOpen;
        }

        // 마지막으로 찾은 백틱 세 개가 닫혀있지 않은 경우 true 반환
        return isOpen;
    }
    extractJSON(text) {
        try {
            // 전체 텍스트가 유효한 JSON인지 먼저 확인
            JSON.parse(text);
            return text;
        } catch (e) {
            // 1. 코드 블록 내의 JSON 찾기
            const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                return codeBlockMatch[1];
            }
    
            // 2. 첫 번째 { 부터 마지막 } 까지 추출
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const potentialJson = jsonMatch[0];
                try {
                    // 추출된 텍스트가 유효한 JSON인지 확인
                    JSON.parse(potentialJson);
                    return potentialJson;
                } catch (e) {
                    // 마지막 } 이후의 텍스트 제거
                    const lastBraceIndex = text.lastIndexOf('}');
                    if (lastBraceIndex !== -1) {
                        return text.substring(0, lastBraceIndex + 1);
                    }
                }
            }
            return null;
        }
    }

}

module.exports = JsonAIGenerator;