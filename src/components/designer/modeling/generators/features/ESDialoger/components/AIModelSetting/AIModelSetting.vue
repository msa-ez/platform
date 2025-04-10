<template xmlns:v-on="http://www.w3.org/1999/xhtml">
    <div>
        <v-card class="auto-modeling-user-story-card">
            <v-card-title class="headline d-flex align-center">
                <!-- <v-icon class="mr-2">mdi-cog-outline</v-icon> -->
                <div>{{ $t('aiModelSetting.template.aiModelSettings') }}</div>
            </v-card-title>
            
            <v-card-text>
                <v-sheet class="pa-4 mb-5 rounded" color="grey lighten-5" elevation="1">
                    <h3 class="mb-4 primary--text d-flex align-center">
                        <!-- <v-icon color="primary" class="mr-2">mdi-cube-outline</v-icon> -->
                        <div>{{ $t('aiModelSetting.template.selectModel') }}</div>
                    </h3>
                    
                    <div v-for="(modelInfo, modelType) in selectedModels" :key="modelType" class="mb-4">
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
                            :value="modelInfo.defaultValue"
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
                                <div class="d-flex align-center">
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
                    
                    <div v-for="(inputFields, vendor) in requiredVendorInputs" :key="vendor" class="mb-4">
                        <div class="d-flex align-center mb-3">
                            <div class="d-flex align-center">
                                <span v-if="hasSvgIcon(vendor)" v-html="vendorSvgIcons[vendor.toLowerCase()]" class="vendor-svg-icon mr-1"></span>
                                <v-icon v-else x-small class="mr-1">{{ getVendorIcon(vendor) }}</v-icon>
                            </div>
                            <h4 class="vendor-title mb-0">{{ getVendorLabel(vendor) }}</h4>
                        </div>
                        
                        <div v-for="field in inputFields" :key="field" class="mt-2">
                            <v-text-field
                                :label="getInputFieldLabel(field)"
                                :value="getStoredInputValue(field)"
                                @input="updateInputValue(field, $event)"
                                :append-icon="getAppendIcon(field)"
                                @click:append="handleAppendIconClick(field)"
                                :type="field.includes('key') && !showPassword[field] ? 'password' : 'text'"
                                outlined
                                dense
                                :hint="getFieldHint(field)"
                                persistent-hint
                            ></v-text-field>
                        </div>
                        
                        <div class="d-flex justify-end mt-2">
                            <v-btn small text color="primary" @click="testApiKey(vendor)" :disabled="!canTestApiKey(vendor)" :loading="apiKeyTestLoading[vendor]">
                                <v-icon small left>mdi-connection</v-icon>
                                {{ $t('aiModelSetting.template.connectionTest') }}
                            </v-btn>
                            <v-icon v-if="apiKeyTestStatus[vendor] === true" color="success" small class="ml-2">mdi-check-circle</v-icon>
                            <v-icon v-if="apiKeyTestStatus[vendor] === false" color="error" small class="ml-2">mdi-alert-circle</v-icon>
                        </div>
                    </div>
                    
                    <div v-if="Object.keys(requiredVendorInputs).length === 0" class="text-center pa-5 grey lighten-4 rounded">
                        <v-icon color="grey lighten-1" x-large>mdi-key-remove</v-icon>
                        <p class="mt-3 grey--text text--darken-1">{{ $t('aiModelSetting.template.vendorInputTip') }}</p>
                    </div>
                </v-sheet>
            </v-card-text>
            
            <v-row class="ma-0 pa-4 pt-0">
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
            style="padding: 20px 0px 0px 0px"
        >
            <v-spacer></v-spacer>
            <v-btn @click="$emit('onConfirm')"
                class="auto-modeling-btn"
                color="primary"
            >
                {{ $t('aiModelSetting.template.confirm') }}
            </v-btn>
        </v-row>
    </div>
</template>
  
<script>
import { ModelInfoHelper } from "../../../AIGenerator";
import VendorConnectTestUtil from "./VendorConnectTestUtil";

export default {
    name: "ai-model-setting",
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
            MODEL_FLAGS: {}
        }
    },
    computed: {
        uniqueVendors() {
            const vendors = new Set();
            Object.values(this.selectedModels).forEach(model => {
                if (model && model.vendor) {
                    vendors.add(model.vendor);
                }
            });
            return Array.from(vendors);
        }
    },
    created() {
        this.loadData();
        this.loadSvgIcons();
        this.initModelEnabledState();
    },
    methods: {
        loadData() {
            this.selectableOptions = ModelInfoHelper.getSelectableOptions();
            this.selectedModels = ModelInfoHelper.getSelectedOptions();
            this.MODEL_FLAGS = ModelInfoHelper.getDefaultOptions().MODEL_FLAGS;
            this.updateRequiredVendorInputs();
        },

        initModelEnabledState() {
            Object.keys(this.selectedModels).forEach(modelType => {
                const isEnabled = this.selectedModels[modelType] !== this.MODEL_FLAGS.NOT_USED;
                this.$set(this.modelEnabled, modelType, isEnabled);

                if(this.selectedModels[modelType] && this.selectedModels[modelType] !== this.MODEL_FLAGS.NOT_USED)
                    localStorage.setItem(`previous_${modelType}`, this.selectedModels[modelType].defaultValue);
            });
        },

        handleModelToggle(modelType) {
            if (!this.modelEnabled[modelType]) {
                if (this.isLastEnabledModel(modelType)) {
                    this.$set(this.modelEnabled, modelType, true);
                    this.$alert(this.$t('aiModelSetting.template.cannotDisableAll'));
                    return;
                }
                
                ModelInfoHelper.setSelectedOptions(modelType, this.MODEL_FLAGS.NOT_USED);
                this.selectedModels = ModelInfoHelper.getSelectedOptions();
                this.updateRequiredVendorInputs();
            } else {
                let previousValue = localStorage.getItem(`previous_${modelType}`)
                if(!previousValue || previousValue === this.MODEL_FLAGS.NOT_USED) {
                    ModelInfoHelper.setSelectedOptions(modelType, "");
                    previousValue = ModelInfoHelper.getDefaultOptions()[modelType];
                }
                
                if (previousValue && previousValue !== this.MODEL_FLAGS.NOT_USED) {
                    ModelInfoHelper.setSelectedOptions(modelType, previousValue);
                    this.selectedModels = ModelInfoHelper.getSelectedOptions();
                    this.updateRequiredVendorInputs();
                }
            }
        },
        
        isLastEnabledModel(modelType) {
            const enabledModelTypes = Object.keys(this.modelEnabled).filter(
                type => this.modelEnabled[type] && type !== modelType
            );
            return enabledModelTypes.length === 0;
        },

        async loadSvgIcons() {
            const vendors = ['openai', 'anthropic', 'google', 'runpod', 'ollama'];
            
            for (const vendor of vendors) {
                try {
                    const response = await fetch(`/assets/icon/${vendor}.svg`);
                    if (response.ok) {
                        const svg = await response.text();
                        this.$set(this.vendorSvgIcons, vendor, svg);
                    }
                } catch (error) {
                    console.error(`Failed to load SVG for ${vendor}:`, error);
                }
            }
        },
        
        updateRequiredVendorInputs() {
            const vendorInputOptions = ModelInfoHelper.getVendorInputOptions();
            const requiredInputs = {};
            
            this.uniqueVendors.forEach(vendor => {
                if (vendorInputOptions[vendor]) {
                    requiredInputs[vendor] = vendorInputOptions[vendor];
                }
            });
            
            this.requiredVendorInputs = requiredInputs;
        },
        
        handleModelSelect(modelType, selectedOption) {
            if (!selectedOption || !selectedOption.defaultValue) return;
            
            ModelInfoHelper.setSelectedOptions(modelType, selectedOption.defaultValue);
            localStorage.setItem(`previous_${modelType}`, selectedOption.defaultValue);
            this.selectedModels = ModelInfoHelper.getSelectedOptions();
            this.updateRequiredVendorInputs();
        },

        getModelTypeLabel(modelType) {
            return this.$t('aiModelSetting.modelType.' + modelType) || modelType;
        },
        
        getModelTypeDescription(modelType) {
            return this.$t('aiModelSetting.modelTypeDescription.' + modelType) || "";
        },
        
        getVendorLabel(vendor) {
            const labels = {
                openai: "OpenAI",
                anthropic: "Anthropic",
                google: "Google",
                runpod: "RunPod",
                ollama: "Ollama"
            };
            return labels[vendor] || vendor;
        },
        
        getInputFieldLabel(field) {
            const labels = {
                api_key_openai: "OpenAI API Key",
                api_key_anthropic: "Anthropic API Key",
                api_key_google: "Google API Key",
                api_key_runpod: "RunPod API Key",
                runpodUrl: "RunPod URL",
                ollamaUrl: "Ollama URL"
            };
            return labels[field] || field;
        },
        
        getStoredInputValue(field) {
            if (this.inputValues[field] !== undefined) {
                return this.inputValues[field];
            }

            const storedValue = localStorage.getItem(field) || "";
            this.$set(this.inputValues, field, storedValue);
            return storedValue;
        },
        
        updateInputValue(field, value) {
            localStorage.setItem(field, value);
            this.$set(this.inputValues, field, value);
        },
        
        togglePasswordVisibility(field) {
            this.$set(this.showPassword, field, !this.showPassword[field]);
        },

        getVendorIcon(vendor) {
            const icons = {
                openai: "mdi-alpha-o-circle",
                anthropic: "mdi-alpha-a-circle",
                google: "mdi-google",
                runpod: "mdi-laptop",
                ollama: "mdi-server"
            };

            const normalizedVendor = vendor.toLowerCase();
            
            return icons[normalizedVendor] || "mdi-cube-outline"
        },

        hasSvgIcon(vendor) {
            return !!this.vendorSvgIcons[vendor.toLowerCase()];
        },
        
        getAppendIcon(field) {
            if (field.includes('key')) {
                return this.showPassword[field] ? 'mdi-eye-off' : 'mdi-eye';
            }
            return null;
        },
        
        handleAppendIconClick(field) {
            if (field.includes('key')) {
                this.togglePasswordVisibility(field);
            }
        },
        
        getFieldHint(field) {
            return this.$t('aiModelSetting.apiKeyHint.' + field) || "";
        },
        
        canTestApiKey(vendor) {
            const fields = this.requiredVendorInputs[vendor] || [];
            return fields.every(field => !!this.getStoredInputValue(field));
        },
        
        async testApiKey(vendor) {
            const fields = this.requiredVendorInputs[vendor] || [];
            const params = fields.reduce((acc, field) => {
                acc[field] = this.getStoredInputValue(field);
                return acc;
            }, {});

            this.$set(this.apiKeyTestLoading, vendor, true); 
            try {
                const isPassed = await VendorConnectTestUtil.testVendorConnect(vendor, params);
                this.$set(this.apiKeyTestStatus, vendor, isPassed);
                
                this.snackbar = {
                    show: true,
                    text: this.$t('aiModelSetting.apiKeyTest.' + (isPassed ? 'success' : 'fail'), { vendor: this.getVendorLabel(vendor) }),
                    color: isPassed ? 'success' : 'error'
                };
            } catch (error) {
                console.error(`API Connection Test Error:`, error);
                this.$set(this.apiKeyTestStatus, vendor, false);
                this.snackbar = {
                    show: true,
                    text: `An error occurred while testing the connection to ${this.getVendorLabel(vendor)}.`,
                    color: 'error'
                };
            } finally {
                this.$set(this.apiKeyTestLoading, vendor, false);
            }
        },

        getGroupedSelectableOptions(isInferenceModel) {
            const groups = [];
            const vendorGroups = {};
            
            this.selectableOptions.forEach(option => {
                if(isInferenceModel != null) {
                    if(isInferenceModel && !option.isInferenceModel) return;
                    if(!isInferenceModel && option.isInferenceModel) return;
                }

                if (!vendorGroups[option.vendor]) {
                    const group = {
                        header: this.getVendorLabel(option.vendor),
                        divider: true,
                        items: []
                    };
                    groups.push(group);
                    vendorGroups[option.vendor] = group;
                }
                
                vendorGroups[option.vendor].items.push(option);
            });
            
            const result = [];
            groups.forEach(group => {
                result.push({ header: group.header, divider: true });
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
            
            ModelInfoHelper.resetToDefaults();
            
            this.loadData();
            this.initModelEnabledState();
            
            this.apiKeyTestStatus = {};
            this.inputValues = {};
            
            this.snackbar = {
                show: true,
                text: this.$t('aiModelSetting.snackbar.resetComplete'),
                color: 'success'
            };
        },
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