const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');

class GoogleClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
  }
  
  _makeRequestParams(messages, modelInfo, token){
    console.log(messages)

    const googleRequestData = this._convertToGoogleContents(messages)
    let requestData = {
      systemInstruction: googleRequestData[0],
      contents: googleRequestData.slice(1),
      generationConfig: {
        temperature: modelInfo.requestArgs.temperature
      }
    }

    return {
      requestUrl: "http://localhost:4000/api/google/chat",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "Content-type": "application/json",
        "ai-param-api-key": token,
        "ai-param-model-name": modelInfo.requestModelName,
        "ai-param-stream": "true"
      }
    }
  }

  _convertToGoogleContents(messages){
    return messages.map(message => {
      const role = message.role === 'system' || message.role === 'assistant' ? 'model' : message.role;
      
      return {
        role: role,
        parts: [
          {
            text: message.content
          }
        ]
      };
    });
  }

  _parseResponseText(responseText){
    return TextParseHelper.parseResponseText(responseText, {
      splitFunction: (text) => {
        const regex = /\{\s*"candidates"\s*:\s*\[[\s\S]*?\]\s*,\s*"usageMetadata"\s*:\s*\{[\s\S]*?\}\s*,\s*"modelVersion"\s*:\s*"[^"]*"\s*\}/g
        return text.match(regex)
      },
      extractFunction: (parsed) => {
        return {
            content: parsed.candidates && 
                    parsed.candidates[0] && 
                    parsed.candidates[0].content && 
                    parsed.candidates[0].content.parts && 
                    parsed.candidates[0].content.parts[0] && 
                    parsed.candidates[0].content.parts[0].text ? 
                    parsed.candidates[0].content.parts[0].text : "",
            id: "Google",
            finish_reason: parsed.candidates &&
                          parsed.candidates[0] && 
                          parsed.candidates[0].finishReason &&
                          parsed.candidates[0].finishReason !== "STOP" ? 
                          parsed.candidates[0].finishReason : null,
            error: parsed.error || null
        }
      }
    })
  }
}

module.exports = GoogleClient;