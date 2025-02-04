<template>
    <v-card
        persistent
    >
        <v-card>
            <v-card-title class="headline">
                생성 옵션
            </v-card-title>
            
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <div class="d-flex align-center">
                                <span class="mr-4">Number of Bounded Contexts</span>
                                <span class="font-weight-bold">{{ localOptions.numberOfBCs }}</span>
                            </div>
                            <v-slider
                                v-model="localOptions.numberOfBCs"
                                :min="1"
                                :max="15"
                                :tick-size="4"
                                ticks="always"
                                tick-label
                                class="mt-4"
                            ></v-slider>
                        </v-col>
                        
                        <v-col cols="12">
                            <v-select
                                v-model="localOptions.selectedAspects"
                                :items="availableAspects"
                                label="Select Aspects"
                                item-value="value"
                                multiple
                            ></v-select>
                            <p>관점별 특징</p>
                            <p class="font-weight-bold">도메인:</p>
                            <p>도메인 관점은 비즈니스 로직과 규칙을 중심으로 Bounded Context를 분리합니다. 
                               핵심 비즈니스 개념, 업무 규칙, 도메인 프로세스의 응집도를 고려하여 
                               논리적으로 연관된 기능들을 하나의 컨텍스트로 그룹화합니다.</p>
                            
                            <p class="font-weight-bold">조직:</p>
                            <p>조직 관점은 팀 구조와 의사결정 경계를 기준으로 Bounded Context를 구분합니다. 
                               콘웨이의 법칙에 따라 조직 구조를 반영하며, 팀의 자율성과 책임 영역을 
                               고려하여 컨텍스트를 설정합니다.</p>
                            
                            <p class="font-weight-bold">페르소나:</p>
                            <p>페르소나 관점은 사용자 역할과 사용 사례를 중심으로 Bounded Context를 정의합니다. 
                               각기 다른 사용자 그룹의 요구사항과 상호작용 패턴을 분석하여 
                               사용자 중심의 서비스 경계를 설정합니다.</p>
                            
                            <p class="font-weight-bold">트랜잭션/성능:</p>
                            <p>트랜잭션/성능 관점은 시스템의 확장성과 처리량을 고려하여 Bounded Context를 분리합니다. 
                               트랜잭션 처리량, 데이터 일관성 요구사항, 확장 가능성을 기준으로 
                               독립적으로 스케일링 가능한 단위를 정의합니다.</p>
                            
                            <p class="font-weight-bold">인프라:</p>
                            <p>인프라 관점은 기술적 요구사항과 배포 전략을 기준으로 Bounded Context를 구분합니다. 
                               데이터 저장소 유형, 보안 요구사항, 외부 시스템 통합 등 기술적 특성을 
                               고려하여 컨텍스트를 분리합니다.</p>
                        </v-col>

                        <v-col cols="12">
                            <v-textarea
                                v-model="localOptions.additionalOptions"
                                label="Additional requirements"
                                rows="3"
                                outlined
                            ></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    @click="onConfirm"
                    :disabled="!isValid || isSummarizeStarted || isGeneratingBoundedContext || isStartMapping"
                >
                    Generate
                </v-btn>
            </v-card-actions>
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
                additionalOptions: ''
            },
            availableAspects: [
                this.$t('DevideBoundedContextDialog.domainAspect'),
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
        }
    },

    watch: {},

    methods: {
        onConfirm() {
            this.$emit('setGenerateOption', { ...this.localOptions });
        }
    }
}
</script>