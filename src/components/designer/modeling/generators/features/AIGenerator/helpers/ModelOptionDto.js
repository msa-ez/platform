class ModelOptionDto {
  constructor({ vendor, baseURL, apiKey, modelID, modelInfos = {}, modelParameters = {} }) {
    this.vendor = vendor;
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.modelID = modelID;
    this.modelInfos = modelInfos;
    this.modelParameters = modelParameters;
  }

  toJSON() {
    return {
      vendor: this.vendor,
      baseURL: this.baseURL,
      apiKey: this.apiKey,
      modelID: this.modelID,
      modelInfos: this.modelInfos,
      modelParameters: this.modelParameters
    };
  }

  static fromJSON(obj) {
    return new ModelOptionDto({
      vendor: obj.vendor,
      baseURL: obj.baseURL,
      apiKey: obj.apiKey,
      modelID: obj.modelID,
      modelInfos: obj.modelInfos,
      modelParameters: obj.modelParameters
    });
  }

  saveTo(storageKey) {
    localStorage.setItem(storageKey, JSON.stringify(this.toJSON()));
  }

  static loadFrom(storageKey, notUsedFlagID) {
    const str = localStorage.getItem(storageKey);
    if(str === notUsedFlagID) return notUsedFlagID;
    if (!str || !str.startsWith('{')) return null;
    
    try {
      const obj = JSON.parse(str);
      return ModelOptionDto.fromJSON(obj);
    } catch (e) {
      console.error(`Failed to parse storage key ${storageKey}:`, e);
      return null;
    }
  }
}

module.exports = ModelOptionDto; 