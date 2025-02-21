<template>
    <v-card
        persistent
    >
        <v-card>
            <v-card-title class="headline">
                {{ $t('BCGenerationOption.generationOption') }}
            </v-card-title>
            
            <div>
                <v-row class="ma-0 pa-0">
                    <v-col class="pa-4" cols="12">
                        <div class="d-flex align-center">
                            <span class="mr-4">{{ $t('BCGenerationOption.numberOfBCs') }}</span>
                        </div>
                        <div class="d-flex align-center"
                            style="max-width:200px;"
                        >
                            <v-btn icon color="primary" @click="decrementBCs" :disabled="localOptions.numberOfBCs <= 1">
                                <v-icon>mdi-minus</v-icon>
                            </v-btn>
                            <v-text-field
                                v-model="localOptions.numberOfBCs"
                                :min="1"
                                :max="15"
                                type="text"
                                class="mx-2"
                                :error-messages="bcNumberError"
                                :error="!!bcNumberError"
                                @input="validateNumber"
                            ></v-text-field>
                            <v-btn icon color="primary" @click="incrementBCs" :disabled="localOptions.numberOfBCs >= 15">
                                <v-icon>mdi-plus</v-icon>
                            </v-btn>
                        </div>
                    </v-col>
                    
                    <v-col class="pa-4 pt-0" cols="12">
                        <p>{{ $t('BCGenerationOption.selectAspects') }}</p>
                        <template v-for="(aspect, index) in availableAspects">
                            <v-card
                                :key="`card-${index}`"
                                class="mb-2"
                                outlined
                                @click="toggleAspect(aspect)"
                                :class="{ 'bcg-selected-card': localOptions.selectedAspects.includes(aspect) }"
                            >
                                <v-card-text>
                                    <v-row class="ma-0 pa-0">
                                        <v-checkbox class="ma-0 pa-0"
                                            :input-value="localOptions.selectedAspects.includes(aspect)"
                                            @click.stop="toggleAspect(aspect)"
                                        ></v-checkbox>
                                        <span class="font-weight-bold">{{ aspect }}</span>
                                    </v-row>
                                    <p :key="`description-${index}`">
                                        {{ getAspectDescription(index) }}
                                    </p>

                                    <v-slide-y-transition>
                                        <v-row v-if="showAdditionalInput(aspect) && localOptions.selectedAspects.includes(aspect)"
                                            class="ma-0 mt-3"
                                        >
                                            <v-col cols="12" class="pa-0">
                                                <v-text-field
                                                    v-model="localOptions.aspectDetails[getAspectKey(aspect)]"
                                                    :label="getAdditionalInputLabel(aspect)"
                                                    :placeholder="getAdditionalInputPlaceholder(aspect)"
                                                    rows="3"
                                                    outlined
                                                    dense
                                                    hide-details="auto"
                                                    @click.stop
                                                ></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-slide-y-transition>
                                </v-card-text>
                            </v-card>
                        </template>
                    </v-col>

                    <v-col class="pa-4 pt-0" cols="12">
                        <div class="d-flex align-center">
                            <span class="mr-4">{{ $t('BCGenerationOption.ContextMappingRelationType') }}</span>
                        </div>
                        <v-switch
                            v-model="localOptions.isProtocolMode"
                            :label="getRelationTypeLabel()"
                        ></v-switch>
                    </v-col>

                    <v-col class="pa-4 pt-0" cols="12">
                        <v-textarea
                            v-model="localOptions.additionalOptions"
                            :label="$t('BCGenerationOption.additionalRequirements')"
                            rows="3"
                            outlined
                            auto-grow
                        ></v-textarea>
                    </v-col>
                </v-row>
            
                <v-row class="ma-0 pa-4 pt-0">
                    <v-spacer></v-spacer>
                    <v-btn @click="onConfirm"
                        color="primary"
                        :disabled="generateBtnDisabled"
                    >
                        {{ $t('BCGenerationOption.generate') }}
                    </v-btn>
                </v-row>
            </div>
        </v-card>
    </v-card>
</template>

<script>
export default {
    name: 'bc-generation-options-dialog',
    
    props: {
        isSummarizeStarted: {
            type: Boolean,
            default: false
        },
        isGeneratingBoundedContext: {
            type: Boolean,
            default: false
        },
        isStartMapping: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            localOptions: {
                numberOfBCs: 3,
                selectedAspects: [],
                additionalOptions: '',
                aspectDetails: {},
                isProtocolMode: true
            },
            availableAspects: [
                this.$t('DevideBoundedContextDialog.domainAspect'),
                this.$t('DevideBoundedContextDialog.processAspect'),
                this.$t('DevideBoundedContextDialog.organizationalAspect'),
                this.$t('DevideBoundedContextDialog.personaAspect'),
                this.$t('DevideBoundedContextDialog.transactionPerformanceAspect'),
                this.$t('DevideBoundedContextDialog.infrastructureAspect')
            ]
        }
    },

    computed: {
        isValid() {
            return this.localOptions.numberOfBCs > 0 && 
                   this.localOptions.selectedAspects.length > 0;
        },

        bcNumberError() {
            const num = Number(this.localOptions.numberOfBCs);
            if (isNaN(num)) {
                return this.$t('BCGenerationOption.invalidNumberError'); // 숫자가 아닐 때 오류 메시지
            }
            if (num > 15) {
                return this.$t('BCGenerationOption.bcNumberLimitError'); // 숫자가 15보다 클 때 오류 메시지
            }
            return '';
        },
        generateBtnDisabled() {
            return !this.isValid || 
               this.isSummarizeStarted || 
               this.isGeneratingBoundedContext || 
               this.isStartMapping || 
               this.localOptions.numberOfBCs > 15;
        },
    },

    watch: {},

    methods: {
        incrementBCs() {
            if (this.localOptions.numberOfBCs < 15) {
                this.localOptions.numberOfBCs++;
            }
        },
        decrementBCs() {
            if (this.localOptions.numberOfBCs > 1) {
                this.localOptions.numberOfBCs--;
            }
        },
        validateNumber(event) {
            // const value = event.target.value;
            const number = parseInt(event, 10);
            if (!isNaN(number) && number >= 1 && number <= 15) {
                this.localOptions.numberOfBCs = number;
            } else {
                this.localOptions.numberOfBCs = '';
            }
        },
        toggleAspect(aspect) {
            const index = this.localOptions.selectedAspects.indexOf(aspect);
            if (index === -1) {
                // aspect가 선택되지 않은 경우 추가
                this.localOptions.selectedAspects.push(aspect);
                if (this.showAdditionalInput(aspect)) {
                    const key = this.getAspectKey(aspect);
                    this.$set(this.localOptions.aspectDetails, key, '');
                }
            } else {
                // aspect가 이미 선택된 경우 제거
                this.localOptions.selectedAspects.splice(index, 1);
                if (this.showAdditionalInput(aspect)) {
                    const key = this.getAspectKey(aspect);
                    this.$delete(this.localOptions.aspectDetails, key);
                }
            }
        },

        onConfirm() {
            if (this.localOptions.numberOfBCs <= 15) {
                const options = { ...this.localOptions };
                const details = Object.entries(this.localOptions.aspectDetails)
                    .filter(([_, value]) => value.trim() !== '')
                    .map(([aspect, value]) => `[${aspect}] ${value}`)
                    .join('\n\n');
                
                if (details) {
                    options.additionalOptions = options.additionalOptions.trim();
                    options.additionalOptions += (options.additionalOptions ? '\n\n' : '') + details;
                }
                
                this.$emit('setGenerateOption', options, true); 
            } else {
                alert('Number of Bounded Contexts must be less than or equal to 15');
            }
        },

        getAspectDescription(index) {
            const descriptions = [
                '도메인 관점은 비즈니스 로직과 규칙을 중심으로 Bounded Context를 분리합니다. 핵심 비즈니스 개념, 업무 규칙, 도메인 프로세스의 응집도를 고려하여 논리적으로 연관된 기능들을 하나의 컨텍스트로 그룹화합니다.',
                '프로세스 관점은 프로세스(value stream) 기반으로 Bounded Context를 분리합니다. 프로세스의 흐름과 업무 프로세스의 응집도를 고려하여 논리적으로 연관된 기능들을 하나의 컨텍스트로 그룹화합니다.',
                '조직 관점은 팀 구조와 의사결정 경계를 기준으로 Bounded Context를 구분합니다. 콘웨이의 법칙에 따라 조직 구조를 반영하며, 팀의 자율성과 책임 영역을 고려하여 컨텍스트를 설정합니다.',
                '페르소나 관점은 사용자 역할과 사용 사례를 중심으로 Bounded Context를 정의합니다. 각기 다른 사용자 그룹의 요구사항과 상호작용 패턴을 분석하여 사용자 중심의 서비스 경계를 설정합니다.',
                '트랜잭션/성능 관점은 시스템의 확장성과 처리량을 고려하여 Bounded Context를 분리합니다. 트랜잭션 처리량, 데이터 일관성 요구사항, 확장 가능성을 기준으로 독립적으로 스케일링 가능한 단위를 정의합니다.',
                '인프라 관점은 기술적 요구사항을 기준으로 Bounded Context를 구분합니다. 데이터 저장소 유형, 보안 요구사항, 외부 시스템 통합 등 기술적 특성을 고려하여 컨텍스트를 분리합니다.'
            ];
            return descriptions[index];
        },

        showAdditionalInput(aspect) {
            return aspect === this.$t('DevideBoundedContextDialog.organizationalAspect') ||
                   aspect === this.$t('DevideBoundedContextDialog.infrastructureAspect');
        },

        getAdditionalInputLabel(aspect) {
            if (aspect === this.$t('DevideBoundedContextDialog.organizationalAspect')) {
                return '조직 구조를 입력하세요. 예시) 청약관리팀, 클레임관리팀, 보상지급팀, 고객관리팀';
            }else if(aspect === this.$t('DevideBoundedContextDialog.infrastructureAspect')){
                return '인프라 환경을 입력하세요. 예시) Java, Spring-boot, JPA, MySQL(단, 고객관리는 Python, PostgreSQL)';
            }
        },
        getAdditionalInputPlaceholder(aspect) {
            // if (aspect === this.$t('DevideBoundedContextDialog.organizationalAspect')) {
            //     return '예시) 청약관리팀, 클레임관리팀, 보상지급팀, 고객관리팀';
            // }else if(aspect === this.$t('DevideBoundedContextDialog.infrastructureAspect')){
            //     return '예시) 온프레미스, 클라우드, 하이브리드';
            // }
        },
        getAspectKey(aspect) {
            if(aspect === this.$t('DevideBoundedContextDialog.organizationalAspect')){
                return 'organizationalAspect';
            }else if(aspect === this.$t('DevideBoundedContextDialog.infrastructureAspect')){
                return 'infrastructureAspect';
            }
        },
        getRelationTypeLabel() {
            return this.localOptions.isProtocolMode
                ? 'Protocol Mode (Request/Response and Pub/Sub)'
                : 'Classic Mode (Confirmist, Share Kernel, Anti-corruption, Seperate Ways, Customer-Supplier)';
        }
    }
}
</script>
<style>
.bcg-selected-card {
    background-color: #E3F2FD !important; /* 선택된 카드의 배경색 */
    border-color: #2196F3 !important; /* 선택된 카드의 테두리 색 */
}

.v-text-field.v-text-field--enclosed .v-text-field__details {
    margin-bottom: 0;
}
</style>