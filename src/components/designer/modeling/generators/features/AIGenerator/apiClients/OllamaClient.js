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
      },
      ...(modelInfo.customArgs ? modelInfo.customArgs : {})
    }

    const ollamaUrl = localStorage.getItem("ollamaUrl") || "http://127.0.0.1:11434"
    return {
      requestUrl: "http://localhost:4000/proxy/stream",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "content-type": "application/json",
        "param-health-check-url": `${ollamaUrl}/api/tags`,
        "param-url": `${ollamaUrl}/api/chat`,
        "param-error-label": "Ollama",
        "param-reject-unauthorized": "false",
        "param-is-use-agent": "false",
        "param-method": "POST",
        "param-headers": JSON.stringify({
          "content-type": "application/json"
        })
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
    
    if(this.aiGenerator.modelInfo.useThinkParseStrategy) {
      const tagParsedContents = TextParseHelper.parseFrontTagContents(result.joinedText, "think");
      result.joinedText = tagParsedContents.restText;
      this.aiGenerator.parsedTexts.think = tagParsedContents.tagContents;
    }

    return result;
  }
}

module.exports = OllamaClient;