const BaseAPIClient = require('./BaseAPIClient');

class OpenAIClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
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
    const jsonTexts = responseText.replace("data: [DONE]", "")
                        .trim()
                        .split('data: ')
                        .filter(Boolean)

    let error = null
    let responseId = ""
    let finishReason = null
    const parsedJsonTexts = jsonTexts.map((jsonText) => {
        let parsed = ""
        try {
            parsed = JSON.parse(jsonText);
        } catch(e) {
            return ""
        }

        if(parsed.error)
            error = parsed.error
        if(parsed.choices[0].finish_reason == 'length')
            finishReason = 'length'
        responseId = parsed.id

        return parsed.choices[0].delta.content || '';
    });

    let joinedText = parsedJsonTexts.join('')
    if(joinedText.includes(": null"))
        joinedText.replaceAll(": null", ": 'null'")

    return {
      error: error,
      id: responseId,
      finish_reason: finishReason,
      joinedText: joinedText
    }
  }
}

module.exports = OpenAIClient;