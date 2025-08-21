const { aggregateDraftDialogDtoMessage, botMessage, userMessage } = require("./constants");

class MessageFactory {
    static createAggregateDraftDialogDtoMessage() {
      const baseMessage = structuredClone(aggregateDraftDialogDtoMessage)
      baseMessage.uniqueId = Date.now().toString()
      return baseMessage
    }
  
    static createBotMessage(message="", subType="", metadatas={}) {
      const baseMessage = structuredClone(botMessage)
      baseMessage.uniqueId = Date.now().toString() + "bot"
      baseMessage.message = message
      baseMessage.subType = subType
      baseMessage.metadatas = metadatas
      return baseMessage
    }
  
    static createUserMessage(message="", subType="", metadatas={}) {
      const baseMessage = structuredClone(userMessage)
      baseMessage.uniqueId = Date.now().toString() + "user"
      baseMessage.message = message
      baseMessage.subType = subType
      baseMessage.metadatas = metadatas
      return baseMessage
    }
}

module.exports = MessageFactory;