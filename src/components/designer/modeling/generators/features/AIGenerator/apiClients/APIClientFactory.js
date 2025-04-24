const OpenAIClient = require('./OpenAIClient');
const OllamaClient = require('./OllamaClient');
const AnthropicClient = require('./AnthropicClient');
const RunpodClient = require('./RunpodClient');
const GoogleClient = require('./GoogleClient');
const { ModelInfoHelper } = require('../helpers');
const getDefaultOptions = require('./getDefaultOptions');

const NOT_USED = getDefaultOptions().MODEL_FLAGS.NOT_USED
class APIClientFactory {
  static createClient(client, options, modelType, aiGenerator) {
    const defaultOptions = ModelInfoHelper.getSelectedOptions()
    if(defaultOptions.thinkingModel === NOT_USED &&
       defaultOptions.normalModel === NOT_USED
    )
      throw new Error("Cannot return appropriate models because all model types are set to 'Unused'. Please review the model settings.")


    const getModelForType = (type) => {
      return defaultOptions[type] !== NOT_USED ? defaultOptions[type]
        : (type === 'thinkingModel' ? defaultOptions.normalModel : defaultOptions.thinkingModel);
    }

    const modelOptionDto = options.model || aiGenerator.model || 
                 (modelType ? getModelForType(modelType) : 
                  (defaultOptions.thinkingModel !== NOT_USED ? 
                   defaultOptions.thinkingModel : defaultOptions.normalModel))


    if(APIClientFactory.vendorApiClientMap[modelOptionDto.vendor])
        return new APIClientFactory.vendorApiClientMap[modelOptionDto.vendor](client, options, modelOptionDto, aiGenerator)
    else
        throw new Error(`There is no appropriate API request class for vendor ${modelOptionDto.vendor} of model ${modelOptionDto.modelID}.`);
  }
}

APIClientFactory.vendorApiClientMap = {
    "openaiCompatible": OpenAIClient,
    "openai": OpenAIClient,
    "ollama": OllamaClient,
    "anthropic": AnthropicClient,
    "runpod": RunpodClient,
    "google": GoogleClient
}

module.exports = APIClientFactory;