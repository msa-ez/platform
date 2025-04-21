const { modelInfos } = require("./modelInfos");
const getDefaultOptions = require("../../apiClients/getDefaultOptions");
const { vendorInputOptions } = require("./vendorInputOptions");
const ModelOptionDto = require('../ModelOptionDto');

class ModelInfoHelper {
    
    /**
     * @description 주어진 모델 이름(modelName)을 통해 해당 모델의 API 요청용 기본 정보를 가져옵니다.
     *              이 함수는 모델의 기본 설정을 `modelInfos`에서 찾아서, 필요한 경우 모델 이름에 추가된 변형(transform) 옵션을 적용하거나,
     *              사용자 정의 옵션(overrideOptions)을 병합하여 최종 모델 정보를 반환합니다.
     *              - 예를 들어 "gpt-4o-2024-08-06" 같은 모델 이름의 경우, "gpt-4o"를 기본으로 하여 추가 정보를 처리할 수 있으며,
     *                "o3-mini-2025-01-31-high"와 같이 변형 옵션("-high")를 포함한 경우, 내부 transforms 설정에 따라 추가 파라미터가 덮어씌워집니다.
     *
     * @example 기본 사용 예시
     * // 모델명의 기본 정보 반환 (예: 날짜 정보 등 추가 suffix 유지)
     * const info1 = ModelInfoHelper.getModelInfo("gpt-4o-2024-08-06");
     * console.log(info1);
     *
     * @example 변형 옵션 적용 사용 예시
     * // 모델명에 변형 옵션("-high")가 포함된 경우, transforms 설정에 맞게 인자 변경 후 최종 모델 이름 반환
     * const info2 = ModelInfoHelper.getModelInfo("o3-mini-2025-01-31-high");
     * console.log(info2);
     *
     * @example override 옵션 적용 사용 예시
     * // 기본 정보에 추가로 override 옵션을 전달하여, 특정 파라미터(예: temperature, contextWindowTokenLimit)를 변경
     * const info3 = ModelInfoHelper.getModelInfo("gpt-4o", {
     *     requestArgs: {
     *         temperature: 0.3
     *     },
     *     contextWindowTokenLimit: 1000
     * });
     * console.log(info3);
     *
     * @note
     * - 주어진 modelName은 내부에 정의된 기본 키(예: "gpt-4o", "o3-mini")와 일치하거나, 해당 키값으로 시작되어야 합니다.
     * - 매칭되지 않는 이름의 경우 에러가 발생합니다.
     * - 모델 이름에 변형 옵션이 포함되어 있으면, 해당 옵션에 맞는 추가 설정(transform)이 적용되며,
     *   이 때 변형 옵션 부분은 최종 requestModelName에서는 제거됩니다.
     * - overrideOptions를 통해 전달된 값은 기본 모델 정보 위에 덮어쓰여집니다.
     */
    static getModelInfo(modelName, overrideOptions = {}) {
        let baseKey = this._getBaseKey(modelName)
        if (!baseKey)
            throw new Error(`Unknown model name: ${modelName}`);

        const modelInfo = structuredClone(this.modelInfos[baseKey]);


        let remainder = modelName.substring(baseKey.length);

        if (modelInfo.transforms && typeof modelInfo.transforms === 'object') {
            for (const transformKey of Object.keys(modelInfo.transforms)) {
                if (remainder.endsWith(transformKey)) {
                    remainder = remainder.slice(0, remainder.length - transformKey.length);
                    this._updateModelInfo(modelInfo, modelInfo.transforms[transformKey]);
                    break;
                }
            }
        }


        modelInfo.requestModelName = baseKey + remainder;
        this._updateModelInfo(modelInfo, overrideOptions);


        if(!modelInfo.inputTokenLimit)
            modelInfo.inputTokenLimit = modelInfo.contextWindowTokenLimit - modelInfo.outputTokenLimit - modelInfo.inputTokenLimitMargin
    
        if(modelInfo.isInferenceModel)
            modelInfo.outputTokenLimit = modelInfo.outputTokenLimit - modelInfo.outputTokenLimitReasoningMargin


        return modelInfo;
    }

    static _getBaseKey(modelName) {
        let baseKey = null

        Object.keys(this.modelInfos).map(key => {
            if(modelName === key)
                baseKey = key
        })
        if(baseKey) return baseKey

        Object.keys(this.modelInfos).map(key => {
            if(modelName.startsWith(key))
                baseKey = key
        })
        return baseKey
    }

    static _updateModelInfo(modelInfo, overrideOptions) {
        for(const key of Object.keys(overrideOptions)) {
            if(key === "requestArgs")
                modelInfo.requestArgs = { 
                    ...modelInfo.requestArgs, 
                    ...overrideOptions.requestArgs
                };
            else
                modelInfo[key] = overrideOptions[key];
        }
    }

    static getSelectableOptions() {
        const labelsToExclude = ["O4-Mini"];


        let options = [];
        
        Object.entries(this.modelInfos).forEach(([modelKey, modelInfo]) => {
            if (modelInfo.vendor === 'ollama' || modelInfo.vendor === 'runpod') return;

            if (modelInfo.transforms && typeof modelInfo.transforms === 'object') {
                Object.entries(modelInfo.transforms).forEach(([transformKey, transformInfo]) => {
                    options.push({
                        label: transformInfo.label || modelInfo.label,
                        defaultValue: transformInfo.defaultValue || modelInfo.defaultValue,
                        vendor: modelInfo.vendor,
                        isInferenceModel: transformInfo.isInferenceModel || modelInfo.isInferenceModel
                    });
                });
            }

            options.push({
                label: modelInfo.label,
                defaultValue: modelInfo.defaultValue || modelKey,
                vendor: modelInfo.vendor,
                isInferenceModel: modelInfo.isInferenceModel
            });
        });

        options = options.filter(option => !labelsToExclude.includes(option.label));
        options.push({
            label: "OpenAI Compatible",
            defaultValue: "openaiCompatible",
            vendor: "openaiCompatible",
            isInferenceModel: null
        });
        
        const vendorOrder = ['openai', 'anthropic', 'google', 'openaiCompatible'];
        options.sort((a, b) => {
            const indexA = vendorOrder.indexOf(a.vendor);
            const indexB = vendorOrder.indexOf(b.vendor);
            
            const priorityA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
            const priorityB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
            
            return priorityA - priorityB;
        });

        return structuredClone(options);
    }

    static getSelectedOptions() {
        const defaultOptions = getDefaultOptions();
        const selectedOptions = {};

        for (const key of Object.keys(defaultOptions)) {
            if (key === "MODEL_FLAGS") continue;

            const loadedOption = defaultOptions[key];

            if (loadedOption === defaultOptions.MODEL_FLAGS.NOT_USED) {
                selectedOptions[key] = defaultOptions.MODEL_FLAGS.NOT_USED;
            } else if (loadedOption instanceof ModelOptionDto) {
                try {
                    if (loadedOption.modelID && loadedOption.vendor !== 'openaiCompatible' &&
                        (!loadedOption.vendor || !loadedOption.modelInfos) 
                    ) {
                        const modelInfo = this.getModelInfo(loadedOption.modelID);
                        loadedOption.vendor = modelInfo.vendor;
                        loadedOption.modelInfos = { ...modelInfo, ...loadedOption.modelInfos };
                        loadedOption.modelParameters = { ...modelInfo.requestArgs };
                    } else if (loadedOption.vendor === 'openaiCompatible') {
                        loadedOption.modelInfos = { 
                            contextWindowTokenLimit: 16385,
                            outputTokenLimit: 4096,
                            inputTokenLimitMargin: 1000,
                            outputTokenLimitReasoningMargin: 0,
                            isInferenceModel: false,
                            requestArgs: {},
                            transforms: {},
                            useThinkParseStrategy: false,
                            defaultTokenizerWeight: 1.00,
                            defaultEncoder: "cl100k_base",
                            vendor: 'openaiCompatible',
                            requestModelName: loadedOption.modelID || 'compatible-model',
                            ...loadedOption.modelInfos
                        };
                        loadedOption.modelParameters = loadedOption.modelParameters || {};

                        loadedOption.modelInfos.inputTokenLimit = loadedOption.modelInfos.contextWindowTokenLimit - loadedOption.modelInfos.outputTokenLimit - loadedOption.modelInfos.inputTokenLimitMargin
                        if(loadedOption.modelInfos.isInferenceModel)
                            loadedOption.modelInfos.outputTokenLimit = loadedOption.modelInfos.outputTokenLimit - loadedOption.modelInfos.outputTokenLimitReasoningMargin
                    }
                    selectedOptions[key] = loadedOption;
                } catch (error) {
                    console.error(`Error processing model option for ${key} (modelID: ${loadedOption.modelID}):`, error);
                    selectedOptions[key] = defaultOptions.MODEL_FLAGS.NOT_USED;
                    localStorage.removeItem(key);
                }
            } else {
                console.warn(`Unexpected value loaded for ${key}:`, loadedOption);
                selectedOptions[key] = defaultOptions.MODEL_FLAGS.NOT_USED;
            }
        }
        // DTO 인스턴스를 유지하기 위해 그대로 반환
        return selectedOptions;
    }

    static setSelectedOptions(modelType, optionData) {
        const defaultOptions = getDefaultOptions();
        if (!Object.keys(defaultOptions).includes(modelType)) {
            throw new Error(`Invalid model type: ${modelType}`);
        }

        if (optionData === defaultOptions.MODEL_FLAGS.NOT_USED) {
            localStorage.setItem(modelType, defaultOptions.MODEL_FLAGS.NOT_USED);
        } else if (optionData instanceof ModelOptionDto) {
            if(optionData.modelInfos && optionData.modelInfos.transforms) delete optionData.modelInfos.transforms
            optionData.saveTo(modelType);
        } else if (typeof optionData === 'string' && optionData !== defaultOptions.MODEL_FLAGS.NOT_USED) {
            try {
                const modelInfo = this.getModelInfo(optionData);
                const dto = new ModelOptionDto({
                    vendor: modelInfo.vendor,
                    modelID: optionData,
                    modelInfos: modelInfo,
                    modelParameters: modelInfo.requestArgs || {}
                });
                dto.saveTo(modelType);
            } catch (error) {
                throw new Error(`Failed to set model ${optionData} for ${modelType}: ${error.message}`);
            }
        } else {
             throw new Error(`Invalid option data provided for ${modelType}`);
        }
    }

    static getVendorInputOptions() {
        return this.vendorInputOptions;
    }

    static getDefaultOptions() {
        return getDefaultOptions();
    }

    static resetToDefaults() {
        const defaultOptions = getDefaultOptions();
        
        for(const key of Object.keys(defaultOptions)) {
            if(key === "MODEL_FLAGS") continue;
            localStorage.removeItem(key);
        }
    
        return this.getSelectedOptions();
    }

    static saveDefaultOptions() {
        const defaultOptions = ModelInfoHelper.getDefaultOptions();
        Object.keys(defaultOptions).forEach(modelType => {
            if(modelType !== "MODEL_FLAGS" && !localStorage.getItem(modelType))
                ModelInfoHelper.setSelectedOptions(modelType, defaultOptions[modelType]);
        });
    }
}
ModelInfoHelper.modelInfos = modelInfos;
ModelInfoHelper.vendorInputOptions = vendorInputOptions;

module.exports = ModelInfoHelper