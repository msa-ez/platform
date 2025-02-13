const OpenAIClient = require('./OpenAIClient');
const { ModelInfoHelper } = require('../helpers');
const defaultOptions = require('./defaultOptions');

class APIClientFactory {
  static createClient(client, options, modelType, aiGenerator) {
    let model = ""
    if(options.model) model = options.model
    else if(aiGenerator.model) model = aiGenerator.model
    else if(modelType) model = defaultOptions[modelType]
    else model = defaultOptions.standardModel

    const vendor = ModelInfoHelper.getModelInfo(model).vendor
    if(APIClientFactory.vendorApiClientMap[vendor])
        return new APIClientFactory.vendorApiClientMap[vendor](client, options, model, aiGenerator)
    else
        throw new Error(`There is no appropriate API request class for vendor ${vendor} of model ${model}.`);
  }
}

APIClientFactory.vendorApiClientMap = {
    "openai": OpenAIClient
}

module.exports = APIClientFactory;