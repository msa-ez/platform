const BaseAPIClient = require('./BaseAPIClient');

class OllamaClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
  }
  
  // Ollama는 별도의 토큰이 필요 없음
  getToken(){
    return ""
  }

  _makeRequestParams(messages, modelInfo){
    let requestData = {
      model: modelInfo.requestModelName,
      messages: messages,
      stream: true,
      options: {
        temperature: modelInfo.requestArgs.temperature
      }
    }

    return {
      requestUrl: "http://localhost:4000/api/ollama/chat",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "Content-Type": "application/json"
      }
    }
  }

  _parseResponseText(responseText){
    try {
        const response = JSON.parse(responseText);
        let error = null;
        let responseId = response.id || "Ollama";
        let finishReason = null;
        let joinedText = "";

        if (response.choices && response.choices[0]) {
            finishReason = response.choices[0].finish_reason || null;
            if (response.choices[0].message) {
                joinedText = response.choices[0].message.content || "";
            }
        }

        if(joinedText.includes(": null")){
            joinedText = joinedText.replaceAll(": null", ": 'null'");
        }

        if(this.aiGenerator.modelInfo.requestModelName.startsWith("deepseek-r1"))
            joinedText = this._extractThinkContent(joinedText);

        return {
            error: error,
            id: responseId,
            finish_reason: finishReason,
            joinedText: joinedText
        }
    } catch(e) {
        console.error('Error parsing response:', e);
        return {
            error: e,
            id: null,
            finish_reason: null,
            joinedText: ''
        };
    }
  }

  _extractThinkContent(joinedText){
    const fullTag = "<think>";
    if (joinedText.length < fullTag.length && fullTag.startsWith(joinedText)) {
      return "";
    }

    const closingTag = "</think>";
    const startIdx = joinedText.indexOf(fullTag);
    if (startIdx === -1) {
      return joinedText;
    }

    const endIdx = joinedText.indexOf(closingTag, startIdx);
    if (endIdx !== -1) {
      const thinkContent = joinedText.substring(startIdx + fullTag.length, endIdx)
      this.aiGenerator.parsedTexts.think = thinkContent
      return joinedText.substring(endIdx + closingTag.length)
    } else {
      const thinkContent = joinedText.substring(startIdx + fullTag.length)
      this.aiGenerator.parsedTexts.think = thinkContent
      return ""
    }
  }
}

module.exports = OllamaClient;