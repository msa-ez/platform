const OpenAIClient = require('./OpenAIClient');
const OllamaClient = require('./OllamaClient');
const AnthropicClient = require('./AnthropicClient');
const RunpodClient = require('./RunpodClient');
const GoogleClient = require('./GoogleClient');
const { ModelInfoHelper } = require('../helpers');
const getDefaultOptions = require('./getDefaultOptions');

class APIClientFactory {
  static createClient(client, options, modelType, aiGenerator) {
    const defaultOptions = getDefaultOptions()
    if(defaultOptions.thinkingModel === defaultOptions.MODEL_FLAGS.NOT_USED &&
       defaultOptions.normalModel === defaultOptions.MODEL_FLAGS.NOT_USED
    )
      throw new Error("Cannot return appropriate models because all model types are set to 'Unused'. Please review the model settings.")


    const getModelForType = (type) => {
      return defaultOptions[type] !== defaultOptions.MODEL_FLAGS.NOT_USED ? defaultOptions[type]
        : (type === 'thinkingModel' ? defaultOptions.normalModel : defaultOptions.thinkingModel);
    }

    const model = options.model || aiGenerator.model || 
                 (modelType ? getModelForType(modelType) : 
                  (defaultOptions.thinkingModel !== defaultOptions.MODEL_FLAGS.NOT_USED ? 
                   defaultOptions.thinkingModel : defaultOptions.normalModel))


    const vendor = ModelInfoHelper.getModelInfo(model).vendor
    if(APIClientFactory.vendorApiClientMap[vendor])
        return new APIClientFactory.vendorApiClientMap[vendor](client, options, model, aiGenerator)
    else
        throw new Error(`There is no appropriate API request class for vendor ${vendor} of model ${model}.`);
  }
}

APIClientFactory.vendorApiClientMap = {
    "openai": OpenAIClient,
    "ollama": OllamaClient,
    "anthropic": AnthropicClient,
    "runpod": RunpodClient,
    "google": GoogleClient
}

module.exports = APIClientFactory;