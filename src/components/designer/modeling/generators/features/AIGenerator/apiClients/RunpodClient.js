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
      stream: true,
      ...(modelInfo.customArgs ? modelInfo.customArgs : {})
    }


    const runpodUrl = localStorage.getItem("runpodUrl")
    if(!runpodUrl)
      throw new Error("Runpod URL has not been set. Please configure it in the settings page.")

    return {
      requestUrl: "http://localhost:4000/proxy/stream",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "content-type": "application/json",
        "param-url": `${runpodUrl}/v1/chat/completions`,
        "param-error-label": "Runpod",
        "param-reject-unauthorized": "false",
        "param-is-use-agent": "true",
        "param-method": "POST",
        "param-headers": JSON.stringify({
          "content-type": "application/json",
          "authorization": "Bearer " + token,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        })
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