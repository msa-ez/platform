const OpenAIClient = require('./OpenAIClient');
const OllamaClient = require('./OllamaClient');
const AnthropicClient = require('./AnthropicClient');
const RunpodClient = require('./RunpodClient');
const { ModelInfoHelper } = require('../helpers');
const getDefaultOptions = require('./getDefaultOptions');

class APIClientFactory {
  static createClient(client, options, modelType, aiGenerator) {
    let model = ""
    if(options.model) model = options.model
    else if(aiGenerator.model) model = aiGenerator.model
    else if(modelType) model = getDefaultOptions()[modelType]
    else model = getDefaultOptions().standardModel

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
    "runpod": RunpodClient
}

module.exports = APIClientFactory;