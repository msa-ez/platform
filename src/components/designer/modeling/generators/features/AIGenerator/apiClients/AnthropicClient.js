const BaseAPIClient = require('./BaseAPIClient');
const { TextParseHelper } = require('../helpers');

class AnthropicClient extends BaseAPIClient {
  constructor(client, options, model, aiGenerator) {
    super(client, options, model, aiGenerator)
  }
  
  _makeRequestParams(messages, modelInfo, token){
    let requestData = {
      model: modelInfo.requestModelName,
      temperature: modelInfo.requestArgs.temperature,
      max_tokens: modelInfo.requestArgs.maxTokens,
      stream: true
    }

    if(messages[0].role === "system"){
      requestData.system = messages[0].content
      requestData.messages = messages.slice(1)
    }
    else
      requestData.messages = messages


    if(modelInfo.requestArgs.budgetTokens)
      requestData.thinking = {
        type: "enabled",
        budget_tokens: modelInfo.requestArgs.budgetTokens
      }

    
    return {
      requestUrl: "http://localhost:4000/api/anthropic/chat",
      requestData: JSON.stringify(requestData),
      requestHeaders: {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": token
      }
    }
  }

  _parseResponseText(responseText){
    const result = TextParseHelper.parseResponseText(responseText, {
      splitFunction: (text) => {
        return text.trim()
            .split(/\n\n+/)
            .map((block) => {
                    const lines = block.split("\n");
                    for(const line of lines){
                        if (line.startsWith("data:"))
                            return line.replace("data:", "").trim()
                    }
                    return null
                }
            ).filter(Boolean)
      },

      extractFunction: (parsedEvents) => {
        if(parsedEvents.type !== "content_block_delta") return {}

        if(parsedEvents.delta &&
          parsedEvents.delta.type === "thinking_delta" &&
          parsedEvents.delta.thinking
        )
          return {
            thinkContent: parsedEvents.delta.thinking,
            id: "Anthropic",
            finish_reason: parsedEvents.delta && parsedEvents.delta.stop_reason ? parsedEvents.delta.stop_reason : null,
            error: parsedEvents.error || null
          }

        return {
          content: (parsedEvents.delta && 
                    parsedEvents.delta.type === "text_delta" && 
                    parsedEvents.delta.text) ? parsedEvents.delta.text : "",
          id: "Anthropic",
          finish_reason: parsedEvents.delta && parsedEvents.delta.stop_reason ? parsedEvents.delta.stop_reason : null,
          error: parsedEvents.error || null
        }
      }
    })

    if(this.aiGenerator.modelInfo.useThinkParseStrategy) {
      this.aiGenerator.parsedTexts.think = result.thinkContent
    }

    return result;
  }
}

module.exports = AnthropicClient;