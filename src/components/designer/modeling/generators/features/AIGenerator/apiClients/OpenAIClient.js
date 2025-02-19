const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');

class OpenAIClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
    this.aiGenerator.roleNames.system = "developer"
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
      stream: true
    }

    if(modelInfo.requestModelName.startsWith("o3-mini") || modelInfo.requestModelName.startsWith("gpt-4o"))
      requestData.response_format = modelInfo.requestArgs.response_format

    return {
      requestUrl: "https://api.openai.com/v1/chat/completions",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      }
    }
  }

  _parseResponseText(responseText){
    return TextParseHelper.parseResponseText(responseText, {
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
}

module.exports = OpenAIClient;