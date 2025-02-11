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

            if(this.apiStrategy == 'ollama') text = this.extractJSON(text);
            model = partialParse(text);

            return model;
        }catch(e){
            console.log("error to parse:" + text);
            return null;
            // throw e;
        }
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
    extractJSON(inputString, checkFunction) {
        try {
            JSON5.parse(inputString); // if no problem, just return the whole thing
            return inputString;
        } catch (e) {}

        if (this.hasUnclosedTripleBackticks(inputString)) {
            inputString = inputString + '\n```';
        }

        // 정규 표현식 정의
        //const regex = /^.*?`{3}(?:json)?\n(.*?)`{3}.*?$/s;
        let regex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        
        // 정규 표현식을 사용하여 입력 문자열에서 JSON 부분 추출
        let match = inputString.match(regex);
        // 매치된 결과가 있다면, 첫 번째 캡쳐 그룹(즉, JSON 부분)을 반환
        if (match) {
            if (checkFunction)
                match.forEach((shouldBeJson) => {
                    const lastIndex = shouldBeJson.lastIndexOf('}');
                    const result = shouldBeJson.slice(0, lastIndex + 1);
                    if (checkFunction(result)) return result;
                });
            else return match[1];
        } else {
            regex = /\{[\s\S]*\}/
            match = inputString.match(regex);
            return match && match[0] ? match[0] : null;
        }

        // 매치된 결과가 없으면 null 반환
        return null;
    }

}

module.exports = JsonAIGenerator;