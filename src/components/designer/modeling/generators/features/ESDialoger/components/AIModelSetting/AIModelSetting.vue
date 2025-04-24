<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div style="overflow-y: hidden;">
        <v-card class="auto-modeling-user-story-card">
            <v-card-title class="headline d-flex align-center">
                <!-- <v-icon class="mr-2">mdi-cog-outline</v-icon> -->
                <div>{{ $t('aiModelSetting.template.aiModelSettings') }}</div>

                <v-spacer></v-spacer>

                <v-btn v-if="!isUserStoryUIMode" icon @click="$emit('onClose')">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>
            
            <v-card-text>
                <v-alert
                    v-if="errorMessage && !isUserStoryUIMode"
                    type="error"
                    dense
                    outlined
                    text
                >{{ errorMessage }}</v-alert>

                <v-sheet class="pa-4 mb-5 rounded" color="grey lighten-5" elevation="1">
                    <h3 class="mb-4 primary--text d-flex align-center">
                        <!-- <v-icon color="primary" class="mr-2">mdi-cube-outline</v-icon> -->
                        <div>{{ $t('aiModelSetting.template.selectModel') }}</div>
                    </h3>
                    
                    <div v-for="(modelOption, modelType) in selectedModels" :key="modelType" class="mb-4">
                        <div class="d-flex align-center mb-2">
                            <h4 class="model-type-title mb-0">{{ getModelTypeLabel(modelType) }}</h4>
                            <v-tooltip bottom max-width="300">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon small v-bind="attrs" v-on="on" class="ml-2">mdi-help-circle-outline</v-icon>
                                </template>
                                <span>{{ getModelTypeDescription(modelType) }}</span>
                            </v-tooltip>
                            <v-spacer></v-spacer>
                            <v-switch
                                v-model="modelEnabled[modelType]"
                                hide-details
                                class="mt-0 pt-0"
                                dense
                                @change="handleModelToggle(modelType)"
                                :disabled="isLastEnabledModel(modelType)"
                                color="primary"
                            ></v-switch>
                            <span class="ml-1 caption">{{ modelEnabled[modelType] ? $t('aiModelSetting.template.enabled') : $t('aiModelSetting.template.disabled') }}</span>
                        </div>
                        
                        <v-select
                            :value="getSelectedValue(modelType)" 
                            :items="getGroupedSelectableOptions(modelType === 'thinkingModel')"
                            item-text="label"
                            item-value="defaultValue" 
                            @change="(val) => handleModelSelect(modelType, val)"
                            return-object
                            outlined
                            dense
                            class="model-select"
                            :menu-props="{ maxHeight: '400px' }"
                            :disabled="!modelEnabled[modelType]"
                            :class="{'disabled-model': !modelEnabled[modelType]}"
                        >
                            <template v-slot:item="{ item }">
                                <v-list-item-content v-if="item.header" class="grey--text text--darken-1 font-weight-bold">{{ item.header }}</v-list-item-content>
                                <v-divider v-else-if="item.divider"></v-divider>
                                <div v-else class="d-flex align-center">
                                    <span v-if="hasSvgIcon(item.vendor)" v-html="vendorSvgIcons[item.vendor.toLowerCase()]" class="vendor-svg-icon mr-1"></span>
                                    <v-icon v-else x-small class="mr-1">{{ getVendorIcon(item.vendor) }}</v-icon>
                                    <div>{{ item.label }}</div>
                                </div>
                            </template>
                            
                            <template v-slot:selection="{ item }">
                                <div class="d-flex align-center">
                                     <span v-if="hasSvgIcon(item.vendor)" v-html="vendorSvgIcons[item.vendor.toLowerCase()]" class="vendor-svg-icon mr-1"></span>
                                    <v-icon v-else x-small class="mr-1">{{ getVendorIcon(item.vendor) }}</v-icon>
                                    <div>{{ item.label }}</div>
                                </div>
                            </template>
                        </v-select>
                    </div>
                </v-sheet>
                
                <v-sheet class="pa-4 rounded" color="grey lighten-5" elevation="1">
                    <h3 class="mb-4 primary--text d-flex align-center">
                        <!-- <v-icon color="primary" class="mr-2">mdi-key-variant</v-icon> -->
                        <div>{{ $t('aiModelSetting.template.apiKeySettings') }}</div>
                    </h3>
                    
                    <div v-for="apiSetting in apiSettingModels" :key="apiSetting.key" class="mb-4">
                         <div class="d-flex align-center mb-3">
                            <div class="d-flex align-center">
                                <span v-if="hasSvgIcon(apiSetting.vendor)" v-html="vendorSvgIcons[apiSetting.vendor.toLowerCase()]" class="vendor-svg-icon mr-1"></span>
                                <v-icon v-else x-small class="mr-1">{{ getVendorIcon(apiSetting.vendor) }}</v-icon>
                            </div>
                            <h4 class="vendor-title mb-0">{{ getVendorLabel(apiSetting.vendor, apiSetting.modelType) }}</h4>
                        </div>
                        
                         <div v-for="field in apiSetting.fields" :key="`${apiSetting.key}-${field}`" class="mt-2">
                             <v-text-field
                                :label="getInputFieldLabel(field)"
                                :placeholder="getInputFieldPlaceholder(field)"
                                :value="getStoredInputValue(apiSetting.modelType, apiSetting.vendor, field)"
                                @input="updateInputValue(apiSetting.modelType, apiSetting.vendor, field, $event)"
                                :append-icon="getAppendIcon(field, apiSetting.key)"
                                @click:append="handleAppendIconClick(field, apiSetting.key)"
                                :type="getInputFieldType(field, apiSetting.key)"
                                outlined
                                dense
                                :hint="getFieldHint(field)"
                                persistent-hint
                                :error-messages="getInputError(apiSetting.modelType, apiSetting.vendor, field)"
                                :success-messages="getSuccessMessage(apiSetting.modelType, apiSetting.vendor, field)"
                            ></v-text-field>
                        </div>
                        
                        <div class="d-flex justify-end mt-2">
                            <v-btn small text color="primary" @click="testApiKey(apiSetting.modelType, apiSetting.vendor)" :disabled="!canTestApiKey(apiSetting.modelType, apiSetting.vendor)" :loading="apiKeyTestLoading[apiSetting.key]">
                                <v-icon small left>mdi-connection</v-icon>
                                {{ $t('aiModelSetting.template.connectionTest') }}
                            </v-btn>
                            <v-icon v-if="apiKeyTestStatus[apiSetting.key] === true" color="success" small class="ml-2">mdi-check-circle</v-icon>
                            <v-icon v-if="apiKeyTestStatus[apiSetting.key] === false" color="error" small class="ml-2">mdi-alert-circle</v-icon>
                        </div>
                    </div>
                    
                    <div v-if="apiSettingModels.length === 0" class="text-center pa-5 grey lighten-4 rounded">
                        <v-icon color="grey lighten-1" x-large>mdi-key-remove</v-icon>
                        <p class="mt-3 grey--text text--darken-1">{{ $t('aiModelSetting.template.vendorInputTip') }}</p>
                    </div>
                </v-sheet>
            </v-card-text>
            
            <v-row class="ma-0 pa-4 pt-0" v-if="isUserStoryUIMode">
                <v-spacer></v-spacer>
                <v-btn @click="resetToDefaults"
                    class="auto-modeling-btn"
                    outlined 
                    color="primary" 
                >
                    <!-- <v-icon small left>mdi-refresh</v-icon> -->
                    {{ $t('aiModelSetting.template.resetToDefaults') }}
                </v-btn>
            </v-row>

            <v-row class="ma-0 pt-0 pl-4 pr-4 pb-8" v-if="!isUserStoryUIMode">
                <v-btn @click="resetToDefaults"
                    class="auto-modeling-btn ml-0"
                    outlined 
                    color="primary" 
                >
                    <!-- <v-icon small left>mdi-refresh</v-icon> -->
                    {{ $t('aiModelSetting.template.resetToDefaults') }}
                </v-btn>

                <v-spacer></v-spacer>

                <v-btn @click="onConfirm"
                    class="auto-modeling-btn"
                    color="primary"
                >
                    {{ $t('aiModelSetting.template.confirm_ok') }}
                </v-btn>
            </v-row>

            <v-snackbar
                v-model="snackbar.show"
                :color="snackbar.color"
                :timeout="1500"
                class="custom-snackbar"
            >
                {{ snackbar.text }}
                <template v-slot:action="{ attrs }">
                    <v-btn @click="snackbar.show = false"
                        text
                        v-bind="attrs"
                    >
                        {{ $t('aiModelSetting.template.close') }}
                    </v-btn>
                </template>
            </v-snackbar>
        </v-card>

        <v-row class="ma-0"
            v-if="isUserStoryUIMode"
            style="padding: 20px 0px 0px 0px"
        >
            <v-spacer></v-spacer>
            <v-btn @click="onConfirm"
                class="auto-modeling-btn"
                color="primary"
            >
                {{ $t('aiModelSetting.template.confirm_user_story') }}
            </v-btn>
        </v-row>
    </div>
</template>
  
<script>
import { ModelInfoHelper, ModelOptionDto } from "../../../AIGenerator";
import VendorConnectTestUtil from "./VendorConnectTestUtil";

export default {
    name: "ai-model-setting",
    props: {
        isUserStoryUIMode: {
            type: Boolean,
            default: false
        },
        errorMessage: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            selectedModels: {},
            selectableOptions: [],
            requiredVendorInputs: {},
            showPassword: {},
            apiKeyStatus: {},
            vendorSvgIcons: {},
            inputValues: {},
            apiKeyTestStatus: {},
            apiKeyTestLoading: {},
            snackbar: {
                show: false,
                text: '',
                color: 'info'
            },
            modelEnabled: {},
            MODEL_FLAGS: {},
            previousSelections: {},
            inputErrors: {}
        }
    },
    computed: {
        apiSettingModels() {
            const settings = [];
            const addedVendors = new Set(); // Non-compatible vendor 중복 방지

            Object.entries(this.selectedModels).forEach(([modelType, modelOption]) => {
                if (this.modelEnabled[modelType] && modelOption && modelOption !== this.MODEL_FLAGS.NOT_USED && modelOption.vendor) {
                    const vendor = modelOption.vendor;
                    const vendorInputOptions = ModelInfoHelper.getVendorInputOptions();
                    const fields = vendorInputOptions[vendor] || [];
                    const key = vendor === 'openaiCompatible' ? `${modelType}_${vendor}` : vendor;

                    if (vendor === 'openaiCompatible') {
                        settings.push({
                            key: key,
                            modelType: modelType,
                            vendor: vendor,
                            fields: fields
                        });
                    } else if (!addedVendors.has(vendor)) {
                        settings.push({
                            key: key,
                            modelType: null, // Non-compatible은 특정 모델 타입에 종속되지 않음
                            vendor: vendor,
                            fields: fields
                        });
                        addedVendors.add(vendor);
                    }
                }
            });
            return settings;
        }
    },
    created() {
        this.loadData();
        this.loadSvgIcons();
    },
    methods: {
        loadData() {
            this.MODEL_FLAGS = ModelInfoHelper.getDefaultOptions().MODEL_FLAGS;
            this.selectableOptions = ModelInfoHelper.getSelectableOptions();
            this.selectedModels = ModelInfoHelper.getSelectedOptions();
            this.initModelEnabledState();
            this.loadInputValues();
        },

        loadInputValues() {
            const allVendorInputOptions = ModelInfoHelper.getVendorInputOptions();
            this.inputValues = {}; // 초기화

            Object.entries(this.selectedModels).forEach(([modelType, modelOption]) => {
                 if (this.modelEnabled[modelType] && modelOption && modelOption !== this.MODEL_FLAGS.NOT_USED && modelOption.vendor) {
                    const vendor = modelOption.vendor;
                    const fields = allVendorInputOptions[vendor] || [];
                    fields.forEach(field => {
                        const storageKey = this.getStorageKey(modelType, vendor, field);
                        const storedValue = localStorage.getItem(storageKey) || "";
                        this.$set(this.inputValues, storageKey, storedValue);
                        this.validateInput(modelType, vendor, field, storedValue);
                    });
                 }
            });
        },

        initModelEnabledState() {
             Object.keys(this.selectedModels).forEach(modelType => {
                const isEnabled = this.selectedModels[modelType] !== this.MODEL_FLAGS.NOT_USED;
                this.$set(this.modelEnabled, modelType, isEnabled);
                if (isEnabled) {
                    this.$set(this.previousSelections, modelType, this.selectedModels[modelType]);
                }
            });
            this.apiKeyTestStatus = {};
        },

        handleModelToggle(modelType) {
            if (!this.modelEnabled[modelType]) {
                if (this.isLastEnabledModel(modelType)) {
                    this.$set(this.modelEnabled, modelType, true);
                    this.$alert(this.$t('aiModelSetting.template.cannotDisableAll'));
                    return;
                }
                
                this.$set(this.previousSelections, modelType, this.selectedModels[modelType]);
                ModelInfoHelper.setSelectedOptions(modelType, this.MODEL_FLAGS.NOT_USED);
                this.$set(this.selectedModels, modelType, this.MODEL_FLAGS.NOT_USED);

            } else {
                let previousDto = this.previousSelections[modelType];

                if (!previousDto || previousDto === this.MODEL_FLAGS.NOT_USED) {
                    localStorage.removeItem(modelType);
                    const defaultModelId = ModelInfoHelper.getDefaultOptions()[modelType];
                     if(defaultModelId instanceof ModelOptionDto) {
                         previousDto = defaultModelId;
                     } else if (typeof defaultModelId === 'string' && defaultModelId !== this.MODEL_FLAGS.NOT_USED) {
                         try {
                            const modelInfo = ModelInfoHelper.getModelInfo(defaultModelId);
                            previousDto = new ModelOptionDto({
                                vendor: modelInfo.vendor,
                                modelID: defaultModelId,
                                modelInfos: modelInfo
                            });
                         } catch (e) {
                             console.error("Failed to create default DTO:", e);
                             previousDto = null;
                         }
                     } else {
                         previousDto = null;
                     }
                }
                
                if (previousDto) {
                    ModelInfoHelper.setSelectedOptions(modelType, previousDto);
                    this.$set(this.selectedModels, modelType, previousDto);
                } else {
                     console.error(`Cannot enable ${modelType}: No previous selection or default model found.`);
                     this.$set(this.modelEnabled, modelType, false);
                     this.$alert(this.$t('aiModelSetting.alert.cannotEnableModel'));
                     return; 
                }
            }
            this.apiKeyTestStatus = {};
        },
        
        isLastEnabledModel(modelType) {
            const enabledModelTypes = Object.keys(this.modelEnabled).filter(
                type => this.modelEnabled[type] && type !== modelType
            );
            return enabledModelTypes.length === 0;
        },

        async loadSvgIcons() {
            const vendors = ['openai', 'anthropic', 'google', 'ollama', 'runpod', 'openaiCompatible'];
            
            for (const vendor of vendors) {
                 try {
                    const iconPath = vendor === 'openaiCompatible' ? '/assets/icon/openai.svg' : `/assets/icon/${vendor}.svg`;
                    const response = await fetch(iconPath);
                    if (response.ok) {
                        const svg = await response.text();
                        this.$set(this.vendorSvgIcons, vendor.toLowerCase(), svg);
                    } else if(vendor === 'openaiCompatible') {
                        const fallbackResponse = await fetch('/assets/icon/openai.svg');
                        if(fallbackResponse.ok) {
                           const svg = await fallbackResponse.text();
                           this.$set(this.vendorSvgIcons, vendor.toLowerCase(), svg);
                        }
                    }
                } catch (error) {
                    console.error(`Failed to load SVG for ${vendor}:`, error);
                }
            }
        },
        
        handleModelSelect(modelType, selectedOption) {
            if (!selectedOption || !selectedOption.defaultValue) return;

            let newDto;
            if (selectedOption.vendor === 'openaiCompatible') {
                newDto = new ModelOptionDto({
                    vendor: 'openaiCompatible',
                    modelID: 'compatible-model',
                    modelInfos: {
                        contextWindowTokenLimit: this.getStoredInputValue(modelType, 'openaiCompatible', 'contextWindowTokenLimit') || 0,
                        outputTokenLimit: this.getStoredInputValue(modelType, 'openaiCompatible', 'outputTokenLimit') || 0,
                        vendor: 'openaiCompatible',
                        requestModelName: this.getStoredInputValue(modelType, 'openaiCompatible', 'modelID') || 'compatible-model'
                    },
                    modelParameters: {}
                });
            } else {
                 try {
                    const modelInfo = ModelInfoHelper.getModelInfo(selectedOption.defaultValue);
                    newDto = new ModelOptionDto({
                        vendor: modelInfo.vendor,
                        modelID: selectedOption.defaultValue,
                        modelInfos: modelInfo,
                        modelParameters: modelInfo.requestArgs || {}
                    });
                 } catch(e) {
                     console.error("Error getting model info for DTO:", e);
                     return;
                 }
            }

            ModelInfoHelper.setSelectedOptions(modelType, newDto);
            this.$set(this.selectedModels, modelType, newDto);
            this.$set(this.previousSelections, modelType, newDto);
            this.apiKeyTestStatus = {};
            this.loadInputValues();
            
            if(newDto.vendor === 'openaiCompatible') {
                this.updateInputValue(modelType, 'openaiCompatible', null, null);
            }
        },

        getSelectedValue(modelType) {
            const currentOption = this.selectedModels[modelType];
            if (!currentOption || currentOption === this.MODEL_FLAGS.NOT_USED) return null;

             const matchingOption = this.selectableOptions.find(opt => {
                 if (opt.vendor === 'openaiCompatible' && currentOption.vendor === 'openaiCompatible') {
                     return true;
                 }
                 return opt.defaultValue === currentOption.modelID && opt.vendor === currentOption.vendor;
             });

             return matchingOption || {
                 label:  (currentOption.modelInfos && currentOption.modelInfos.label) ? currentOption.modelInfos.label : currentOption.modelID || currentOption.vendor,
                 defaultValue: currentOption.modelID || currentOption.vendor,
                 vendor: currentOption.vendor,
                 isInferenceModel: (currentOption.modelInfos && currentOption.modelInfos.isInferenceModel) ? currentOption.modelInfos.isInferenceModel : null
             };
        },

        getModelTypeLabel(modelType) {
            return this.$t('aiModelSetting.modelType.' + modelType) || modelType;
        },
        
        getModelTypeDescription(modelType) {
            return this.$t('aiModelSetting.modelTypeDescription.' + modelType) || "";
        },
        
        getVendorLabel(vendor, modelType = null) {
            const labels = {
                openai: "OpenAI",
                anthropic: "Anthropic",
                google: "Google",
                runpod: "RunPod (Deprecated)",
                ollama: "Ollama (Deprecated)",
                openaiCompatible: "OpenAI Compatible"
            };
            let label = labels[vendor] || vendor;
            if (vendor === 'openaiCompatible' && modelType) {
                label += ` (${this.getModelTypeLabel(modelType)})`;
            }
            return label;
        },
        
        getInputFieldLabel(field) {
            return this.$t(`aiModelSetting.inputLabel.${field}`);
        },

        getInputFieldPlaceholder(field) {
            return {
                api_key_openai: "sk-...",
                api_key_anthropic: "sk-ant-...",
                api_key_google: "",
                baseURL: "https://api.example.com",
                apiKey: "",
                modelID: "gpt-4o",
                contextWindowTokenLimit: "16385",
                outputTokenLimit: "4096"
            }[field] || "";
        },

        getInputFieldType(field, apiKeySettingKey) {
            if (field.toLowerCase().includes('key') && !this.showPassword[apiKeySettingKey]) {
                return 'password';
            }
            if (field.toLowerCase().includes('limit')) {
                 return 'number';
             }
            return 'text';
        },
        
        getStorageKey(modelType, vendor, field) {
             return vendor === 'openaiCompatible' ? `${field}_${modelType}` : `${field}`;
        },

        getStoredInputValue(modelType, vendor, field) {
            const storageKey = this.getStorageKey(modelType, vendor, field);
            return this.inputValues[storageKey] !== undefined ? this.inputValues[storageKey] : '';
        },
        
        updateInputValue(modelType, vendor, field, value) {
            if(field && value) {
                const storageKey = this.getStorageKey(modelType, vendor, field);
                localStorage.setItem(storageKey, value);
                this.$set(this.inputValues, storageKey, value);
                this.validateInput(modelType, vendor, field, value);
            }

            const apiKeySettingKey = vendor === 'openaiCompatible' ? `${modelType}_${vendor}` : vendor;
            this.$set(this.apiKeyTestStatus, apiKeySettingKey, null); // 입력값 변경 시 테스트 상태 초기화

            if (vendor === 'openaiCompatible') {
                 const dto = this.selectedModels[modelType];
                 if (dto && dto !== this.MODEL_FLAGS.NOT_USED && dto.vendor === 'openaiCompatible') {
                        const newDto = new ModelOptionDto(JSON.parse(JSON.stringify(dto))); // Deep copy DTO
                        if(!newDto.modelInfos) newDto.modelInfos = {};

                        let fieldsToUpdate = {}
                        for(const checkField of ['baseURL', 'apiKey', 'modelID', 'contextWindowTokenLimit', 'outputTokenLimit']) {
                            fieldsToUpdate[checkField] = (checkField === field) ? value : this.getStoredInputValue(modelType, vendor, checkField);
                        }


                        let sanitizedBaseURL = fieldsToUpdate.baseURL.trim();
                        const suffixesToRemove = ['/v1/chat/completions', '/v1/chat', '/v1'];

                        for (const suffix of suffixesToRemove) {
                            if (sanitizedBaseURL.endsWith(suffix)) {
                                sanitizedBaseURL = sanitizedBaseURL.slice(0, -suffix.length);
                                break;
                            }
                        }

                        if (sanitizedBaseURL.endsWith('/')) {
                            sanitizedBaseURL = sanitizedBaseURL.slice(0, -1);
                        }

                        newDto.baseURL = sanitizedBaseURL;
                        newDto.modelInfos.baseURL = sanitizedBaseURL;
                        if(field === 'baseURL') value = sanitizedBaseURL;

                        newDto.apiKey = fieldsToUpdate.apiKey;
                        newDto.modelInfos.apiKey = fieldsToUpdate.apiKey;

                        newDto.modelID = fieldsToUpdate.modelID;
                        newDto.modelInfos.requestModelName = fieldsToUpdate.modelID;

                        newDto.modelInfos.contextWindowTokenLimit = parseInt(fieldsToUpdate.contextWindowTokenLimit, 10) || 0;
                        newDto.modelInfos.outputTokenLimit = parseInt(fieldsToUpdate.outputTokenLimit, 10) || 0;
                        newDto.modelInfos.isInferenceModel = (modelType === 'thinkingModel') ? true : false;


                        ModelInfoHelper.setSelectedOptions(modelType, newDto);
                        this.$set(this.selectedModels, modelType, newDto);

                        
                        if(field) {
                            const storageKey = this.getStorageKey(modelType, vendor, field);
                            this.$set(this.inputValues, storageKey, value);
                        }
                 }
             }
        },
        
        togglePasswordVisibility(apiKeySettingKey) {
            this.$set(this.showPassword, apiKeySettingKey, !this.showPassword[apiKeySettingKey]);
        },

        getVendorIcon(vendor) {
            const icons = {
                openai: "mdi-alpha-o-circle",
                anthropic: "mdi-alpha-a-circle",
                google: "mdi-google",
                runpod: "mdi-laptop",
                ollama: "mdi-server",
                openaiCompatible: "mdi-alpha-c-box-outline"
            };
            const normalizedVendor = vendor.toLowerCase();
            return icons[normalizedVendor] || "mdi-cube-outline";
        },

        hasSvgIcon(vendor) {
            return !!this.vendorSvgIcons[vendor.toLowerCase()];
        },
        
        getAppendIcon(field, apiKeySettingKey) {
            if (field.toLowerCase().includes('key')) {
                return this.showPassword[apiKeySettingKey] ? 'mdi-eye-off' : 'mdi-eye';
            }
            return null;
        },
        
        handleAppendIconClick(field, apiKeySettingKey) {
            if (field.toLowerCase().includes('key')) {
                this.togglePasswordVisibility(apiKeySettingKey);
            }
        },
        
        getFieldHint(field) {
            return this.$t('aiModelSetting.apiKeyHint.' + field);
        },
        
        canTestApiKey(modelType, vendor) {
            const vendorInputOptions = ModelInfoHelper.getVendorInputOptions();
            const fields = vendorInputOptions[vendor] || [];
            return fields.every(field => {
                const value = this.getStoredInputValue(modelType, vendor, field);
                const error = this.getInputError(modelType, vendor, field);
                return !!value && !error;
            });
        },
        
        async testApiKey(modelType, vendor) {
             const vendorInputOptions = ModelInfoHelper.getVendorInputOptions();
             const fields = vendorInputOptions[vendor] || [];
             const params = fields.reduce((acc, field) => {
                const paramKey = field; // API 테스트 유틸리티는 원래 필드 이름을 기대할 수 있음
                acc[paramKey] = this.getStoredInputValue(modelType, vendor, field);
                return acc;
             }, {});

            const apiKeySettingKey = vendor === 'openaiCompatible' ? `${modelType}_${vendor}` : vendor;
            this.$set(this.apiKeyTestLoading, apiKeySettingKey, true);
            this.$set(this.apiKeyTestStatus, apiKeySettingKey, null);
            try {
                // VendorConnectTestUtil.testVendorConnect는 vendor와 params만 받음
                const isPassed = await VendorConnectTestUtil.testVendorConnect(vendor, params);
                this.$set(this.apiKeyTestStatus, apiKeySettingKey, isPassed);

                this.snackbar = {
                    show: true,
                    text: this.$t('aiModelSetting.apiKeyTest.' + (isPassed ? 'success' : 'fail'), { vendor: this.getVendorLabel(vendor, modelType) }),
                    color: isPassed ? 'success' : 'error'
                };
            } catch (error) {
                console.error(`API Connection Test Error for ${vendor} (${modelType || ''}):`, error);
                this.$set(this.apiKeyTestStatus, apiKeySettingKey, false);
                this.snackbar = {
                    show: true,
                    text: this.$t('aiModelSetting.apiKeyTest.error', { vendor: this.getVendorLabel(vendor, modelType), error: error.message }),
                    color: 'error'
                };
            } finally {
                this.$set(this.apiKeyTestLoading, apiKeySettingKey, false);
            }
        },

        getGroupedSelectableOptions(isInferenceModel) {
            const groups = [];
            const vendorGroups = {};
            
            this.selectableOptions.forEach(option => {
                 if (isInferenceModel != null && option.isInferenceModel != null) {
                    if (isInferenceModel !== option.isInferenceModel) return;
                 }

                if (!vendorGroups[option.vendor]) {
                    const group = {
                        header: option.vendor === 'openaiCompatible' ? 'Compatible' : this.getVendorLabel(option.vendor),
                        items: []
                    };
                    groups.push(group);
                    vendorGroups[option.vendor] = group;
                }
                
                vendorGroups[option.vendor].items.push(option);
            });
            
            const result = [];
            groups.forEach(group => {
                 result.push({ header: group.header });
                 result.push({ divider: true });
                group.items.forEach(item => {
                    result.push(item);
                });
            });
            
            return result;
        },

        resetToDefaults() {
            if (!confirm(this.$t('aiModelSetting.alert.resetConfirm'))) {
                return;
            }

            const allVendorInputOptions = ModelInfoHelper.getVendorInputOptions();
            Object.keys(this.selectedModels).forEach(modelType => {
                 Object.keys(allVendorInputOptions).forEach(vendor => {
                     const fields = allVendorInputOptions[vendor] || [];
                     fields.forEach(field => {
                         const storageKey = this.getStorageKey(modelType, vendor, field);
                         localStorage.removeItem(storageKey);
                     });
                 });
            });

            localStorage.removeItem('thinkingModel');
            localStorage.removeItem('normalModel');

            ModelInfoHelper.resetToDefaults();

            this.inputValues = {};
            this.showPassword = {};
            this.apiKeyTestStatus = {};
            this.apiKeyTestLoading = {};
            this.loadData(); // Reset 후 데이터 다시 로드
            this.inputErrors = {}; // Reset errors on default reset

            this.snackbar = {
                show: true,
                text: this.$t('aiModelSetting.snackbar.resetComplete'),
                color: 'success'
            };
        },

        onConfirm() {
            ModelInfoHelper.saveDefaultOptions();
            this.$emit('onConfirm');
        },

        validateInput(modelType, vendor, field, value) {
            const storageKey = this.getStorageKey(modelType, vendor, field);
            let errorMessage = null;

            if (field === 'api_key_openai') {
                if (value && !value.startsWith('sk-')) {
                    errorMessage = this.$t('aiModelSetting.validation.invalidOpenAIKey');
                }
            } else if (field === 'api_key_anthropic') {
                if (value && !value.startsWith('sk-ant-')) {
                    errorMessage = this.$t('aiModelSetting.validation.invalidAnthropicKey');
                }
            }

            this.$set(this.inputErrors, storageKey, errorMessage);
        },

        getInputError(modelType, vendor, field) {
            const storageKey = this.getStorageKey(modelType, vendor, field);
            return this.inputErrors[storageKey] || '';
        },

        getSuccessMessage(modelType, vendor, field) {
            const storageKey = this.getStorageKey(modelType, vendor, field);
            const value = this.inputValues[storageKey];
            const error = this.inputErrors[storageKey];

            if ((field === 'api_key_openai' || field === 'api_key_anthropic') && value && !error) {
                return this.$t('aiModelSetting.validation.validKey');
            }
            return '';
        }
    }
}
</script>

<style scoped>
.model-type-title {
    display: flex;
    font-size: 1.05rem;
    color: #424242;
    font-weight: 500;
}

.vendor-title {
    font-weight: 500;
    color: #424242;
    font-size: 1rem;
}

.vendor-header {
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
}

.model-select :deep(.v-select__selection) {
    font-weight: 500;
}

.vendor-svg-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
}

.vendor-svg-icon >>> svg {
    width: 100%;
    height: 100%;
}

.custom-snackbar >>> .v-snack__wrapper {
    min-height: unset !important;
    padding: 4px 8px !important;
}

.custom-snackbar >>> .v-snack__content {
    padding: 0 !important;
}

.disabled-model {
    opacity: 0.7;
    background-color: rgba(0, 0, 0, 0.03);
}

.disabled-model :deep(.v-select__selection) {
    color: #9e9e9e;
    font-style: italic;
}
</style>