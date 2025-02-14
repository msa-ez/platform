const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require("../helpers");

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
    const result = TextParseHelper.parseResponseText(responseText, {
      splitFunction: (text) => text
        .split("\n")
        .filter(line => line.trim() !== ""),

      extractFunction: (parsed) => {
        return {
          content: parsed.message && parsed.message.content ? parsed.message.content : "",
          id: "Ollama",
          finish_reason: null,
          error: parsed.error || null
        }
      }
    })
    
    if(this.aiGenerator.modelInfo.requestModelName.startsWith("deepseek-r1")) {
      const tagParsedContents = TextParseHelper.parseFrontTagContents(result.joinedText, "think");
      result.joinedText = tagParsedContents.restText;
      this.aiGenerator.parsedTexts.think = tagParsedContents.tagContents;
    }

    return result;
  }
}

module.exports = OllamaClient;