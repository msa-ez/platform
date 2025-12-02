const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');
const { LitellmProxyUtil, FirebaseUtil } = require('../../../utils');

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


  async _makeRequestParams(messages, modelInfo, token){
    const requestData = this._makeRequestData(messages, modelInfo)

    this.isStream = requestData.stream
    const completionsURL = await LitellmProxyUtil.getChatCompletionsURL()
    const jwt = await FirebaseUtil.getCurrentUserJWT()
    
    return {
      requestUrl: completionsURL,
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "content-type": "application/json",
        "authorization": "Bearer " + jwt
      }
    }
  }

  _makeRequestData(messages, modelInfo) {
    const requestData = {
      model: "gpt-4.1-proxy",
      messages: messages,
      temperature: this.aiGenerator.temperature || modelInfo.requestArgs.temperature,
      frequency_penalty: modelInfo.requestArgs.frequencyPenalty,
      presence_penalty: modelInfo.requestArgs.presencePenalty,
      top_p: modelInfo.requestArgs.topP,
      reasoning_effort: modelInfo.requestArgs.reasoningEffort,
      stream: true,
      ...(modelInfo.customArgs ? modelInfo.customArgs : {})
    }

    if(modelInfo.isSupportedResponseFormat)
      requestData.response_format = modelInfo.requestArgs.response_format

    return requestData
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