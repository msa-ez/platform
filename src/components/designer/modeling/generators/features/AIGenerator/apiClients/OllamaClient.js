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
        temperature: modelInfo.temperature
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
    let error = null;
    let responseId = "Ollama";
    let finishReason = null;
    let joinedText = "";
    
    const jsonTexts = responseText
                        .split("\n")
                        .filter(line => line.trim() !== "")

    const parsedJsonTexts = jsonTexts.map((jsonText) => {
      let parsed = ""
      try {
          parsed = JSON.parse(jsonText);
      } catch(e) {
          return ""
      }

      if (parsed.error)
          error = parsed.error

      if(parsed.message && parsed.message.content)
          return parsed.message.content
      
      return ""
    })

    joinedText = parsedJsonTexts.join('').trim()
    if(joinedText.includes(": null")){
        joinedText = joinedText.replaceAll(": null", ": 'null'");
    }

    if(this.aiGenerator.modelInfo.requestModelName.startsWith("deepseek-r1"))
      joinedText = this._extractThinkContent(joinedText)

    return {
      error: error,
      id: responseId,
      finish_reason: finishReason,
      joinedText: joinedText
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