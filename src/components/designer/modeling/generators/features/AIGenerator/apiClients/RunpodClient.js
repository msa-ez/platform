const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');

class RunpodClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
  }
  
  _makeRequestParams(messages, modelInfo, token){
    let requestData = {
      model: modelInfo.requestModelName,
      messages: messages,
      stream: true
    }

    return {
      requestUrl: "http://localhost:4000/api/openai-compatibility/chat",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "content-type": "application/json",
        "authorization": "Bearer " + token,
        "ai-param-url": localStorage.getItem("runpodUrl") || "https://dkkzpbvvh17k7v-8000.proxy.runpod.net/v1/chat/completions",
      }
    }
  }

  _parseResponseText(responseText){
    const result = TextParseHelper.parseResponseText(responseText, {
      splitFunction: (text) => text.replace("data: [DONE]", "")
          .trim()
          .split("data: ")
          .filter(Boolean),

      extractFunction: (parsed) => {
        if(parsed.choices && parsed.choices[0]){
          return {
            content: parsed.choices[0].delta.content || "",
            id: parsed.id,
            finish_reason: parsed.choices[0].finish_reason === 'length' ? 'length' : null,
            error: parsed.error || null
          }
        }
        return { content: "", id: parsed.id, finish_reason: null, error: parsed.error || null }
      }
    })

    if(this.aiGenerator.modelInfo.useThinkParseStrategy) {
      // 이유는 알 수 없으나, 몇몇 모델들은 <think> 태그로 시작하지 않으면서, </think> 태그로 끝나는 응답을 보내는 경우가 있음
      if(!result.joinedText.startsWith("<think>")) {
        result.joinedText = "<think>" + result.joinedText  
      }

      const tagParsedContents = TextParseHelper.parseFrontTagContents(result.joinedText, "think");
      result.joinedText = tagParsedContents.restText;
      this.aiGenerator.parsedTexts.think = tagParsedContents.tagContents;
    }

    return result;
  }
}

module.exports = RunpodClient;