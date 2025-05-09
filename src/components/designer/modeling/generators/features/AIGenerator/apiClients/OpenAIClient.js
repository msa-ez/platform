const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');

class OpenAIClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
    if(this.aiGenerator.modelInfo.vendor === "openai")
      this.aiGenerator.roleNames.system = "developer"

    this.isStream = true
  }
  
  async getToken(vendor) {
    if(vendor === "openaiCompatible") {
      return this.aiGenerator.modelInfo.apiKey;
    }
    return super.getToken(vendor);
  }

  _makeRequestParams(messages, modelInfo, token){
    let requestData = {
      model: modelInfo.requestModelName,
      messages: messages,
      temperature: modelInfo.requestArgs.temperature,
      frequency_penalty: modelInfo.requestArgs.frequencyPenalty,
      presence_penalty: modelInfo.requestArgs.presencePenalty,
      top_p: modelInfo.requestArgs.topP,
      reasoning_effort: modelInfo.requestArgs.reasoningEffort,
      stream: true,
      ...(modelInfo.customArgs ? modelInfo.customArgs : {})
    }

    if(modelInfo.isSupportedResponseFormat)
      requestData.response_format = modelInfo.requestArgs.response_format


    this.isStream = requestData.stream
    const baseURL = (!modelInfo.baseURL) ? "https://api.openai.com" : modelInfo.baseURL
    if(baseURL.startsWith("https://")) {
      return {
        requestUrl: baseURL + "/v1/chat/completions",
        requestData: JSON.stringify(requestData),
        requestHeaders: {
          "content-type": "application/json",
          "authorization": "Bearer " + token
        }
      }
    } else {
      return {
        requestUrl: "http://localhost:4000/proxy/stream",
        requestData: JSON.stringify(requestData),
        requestHeaders: {
          "content-type": "application/json",
          "param-url": baseURL + "/v1/chat/completions",
          "param-error-label": "OpenAICompatible",
          "param-reject-unauthorized": "false",
          "param-is-use-agent": "false",
          "param-method": "POST",
          "param-headers": JSON.stringify({
            "content-type": "application/json",
            "authorization": "Bearer " + token,
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          })
        }
      }
    }
  }

  _parseResponseText(responseText){
    let result = null

    if(this.isStream) {
      result = TextParseHelper.parseResponseText(responseText, {
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
    }
    else {
      const parsedResult = JSON.parse(responseText)
      result = {
        joinedText: parsedResult.choices[0].message.content,
        id: parsedResult.id,
        finish_reason: parsedResult.choices[0].finish_reason === 'length' ? 'length' : null,
        error: parsedResult.error || null
      }
    }

    if(result.joinedText.startsWith("<think>")) {
      const tagParsedContents = TextParseHelper.parseFrontTagContents(result.joinedText, "think");
      result.joinedText = tagParsedContents.restText;
      this.aiGenerator.parsedTexts.think = tagParsedContents.tagContents;
    }

    return result;
  }
}

module.exports = OpenAIClient;