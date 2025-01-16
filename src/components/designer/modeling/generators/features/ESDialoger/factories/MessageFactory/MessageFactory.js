const { modelDraftDialogWithXAIDtoMessage, botMessage, userMessage } = require("./constants");

class MessageFactory {
    static createModelDraftDialogWithXAIDtoMessage() {
      const baseMessage = structuredClone(modelDraftDialogWithXAIDtoMessage)
      baseMessage.uniqueId = Date.now().toString()
      return baseMessage
    }
  
    static createBotMessage(message="", subType="", metadatas={}) {
      const baseMessage = structuredClone(botMessage)
      baseMessage.uniqueId = Date.now().toString()
      baseMessage.message = message
      baseMessage.subType = subType
      baseMessage.metadatas = metadatas
      return baseMessage
    }
  
    static createUserMessage(message="", subType="", metadatas={}) {
      const baseMessage = structuredClone(userMessage)
      baseMessage.uniqueId = Date.now().toString()
      baseMessage.message = message
      baseMessage.subType = subType
      baseMessage.metadatas = metadatas
      return baseMessage
    }
}

module.exports = MessageFactory;