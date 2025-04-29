const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');

class GoogleClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
  }
  
  _makeRequestParams(messages, modelInfo, token){
    const googleRequestData = this._convertToGoogleContents(messages)

    let requestData = {
      generationConfig: {
        temperature: modelInfo.requestArgs.temperature
      },
      ...(modelInfo.customArgs ? modelInfo.customArgs : {})
    }

    if(messages[0].role === "system"){
      requestData.systemInstruction = googleRequestData[0]
      requestData.contents = googleRequestData.slice(1)
    }
    else
      requestData.contents = googleRequestData


      return {
        requestUrl: "http://localhost:4000/proxy/stream",
        requestData: JSON.stringify(requestData),
        requestHeaders: {
          "content-type": "application/json",
          "param-url": `https://generativelanguage.googleapis.com/v1beta/models/${modelInfo.requestModelName}:streamGenerateContent?key=${token}`,
          "param-error-label": "Google",
          "param-reject-unauthorized": "false",
          "param-is-use-agent": "true",
          "param-method": "POST",
          "param-headers": JSON.stringify({
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          })
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