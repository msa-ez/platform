const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');

class OpenAIClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
    this.aiGenerator.roleNames.system = "developer"
    this.deterministicModelParams = {
      temperature: 0,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
      seed: 42
    }
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

    const baseURL = (!modelInfo.baseURL) ? "https://api.openai.com" : modelInfo.baseURL
    return {
      requestUrl: baseURL + "/v1/chat/completions",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "content-type": "application/json",
        "authorization": "Bearer " + token
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

    if(result.joinedText.startsWith("<think>")) {
      const tagParsedContents = TextParseHelper.parseFrontTagContents(result.joinedText, "think");
      result.joinedText = tagParsedContents.restText;
      this.aiGenerator.parsedTexts.think = tagParsedContents.tagContents;
    }

    return result;
  }
}

module.exports = OpenAIClient;